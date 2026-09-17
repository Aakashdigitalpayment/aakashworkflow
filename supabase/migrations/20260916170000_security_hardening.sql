-- ============================================================
-- AakashWorkFlow — Security Hardening Migration
-- Apply AFTER:
--   supabase/migrations/20260916145744_aakash_workflow_core.sql
--   supabase/migrations/20260916160000_approval_chains.sql
--
-- What this fixes:
--   1. Role checks read the admin-controlled public.user_profiles table
--      instead of client-editable auth metadata (raw_user_meta_data).
--   2. New sign-ups can no longer self-assign a privileged role.
--   3. A guard trigger blocks non-super-admins from changing their own
--      role / department / active flag.
--   4. Super admins can actually manage other people's profiles (User Admin).
--   5. Task-scoped access for subtasks, collaborators, watchers, comments
--      and activity logs (was USING (true) for every authenticated user).
--   6. Approval-chain configuration is management-only write.
--   7. Department records are management-writable.
--   8. Task numbers come from a database sequence (no client-side collisions).
--   9. get_dashboard_stats() obeys RLS instead of bypassing it.
-- ============================================================

-- ============================================================
-- 1. ROLE HELPERS — read public.user_profiles, never JWT metadata
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT up.role
  FROM public.user_profiles up
  WHERE up.id = auth.uid()
    AND up.is_active = true
$$;

CREATE OR REPLACE FUNCTION public.is_management()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() IN ('super_admin', 'ceo', 'manager')
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'super_admin'
$$;

CREATE OR REPLACE FUNCTION public.is_auditor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'auditor'
$$;

-- True when the caller may write to a given task: management, a named
-- participant on the task, a collaborator/watcher, or the head of the
-- owning department.
CREATE OR REPLACE FUNCTION public.is_task_participant(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_management()
    OR EXISTS (
      SELECT 1
      FROM public.tasks t
      LEFT JOIN public.user_profiles me ON me.id = auth.uid()
      WHERE t.id = p_task_id
        AND (
          t.created_by = auth.uid()
          OR t.assigned_to = auth.uid()
          OR t.reviewer_id = auth.uid()
          OR t.approver_id = auth.uid()
          OR (me.role = 'department_head' AND me.department_id = t.department_id)
          OR EXISTS (
            SELECT 1 FROM public.task_collaborators c
            WHERE c.task_id = t.id AND c.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.task_watchers w
            WHERE w.task_id = t.id AND w.user_id = auth.uid()
          )
        )
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_management() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_auditor() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_task_participant(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_management() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_auditor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_task_participant(UUID) TO authenticated;

-- ============================================================
-- 2. NEW USER PROVISIONING — always 'employee', metadata is ignored
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
BEGIN
  v_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.user_profiles (
    id, email, full_name, role, avatar_initials, is_active,
    department_id, position
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    'employee'::public.user_role,
    UPPER(
      LEFT(v_name, 1) ||
      LEFT(COALESCE(SPLIT_PART(v_name, ' ', 2), ''), 1)
    ),
    true,
    NULL,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. PRIVILEGE-ESCALATION GUARD
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role / migrations / SQL console: auth.uid() is NULL.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Only a super admin can change a user role';
  END IF;

  IF NEW.department_id IS DISTINCT FROM OLD.department_id THEN
    RAISE EXCEPTION 'Only a super admin can change a user department';
  END IF;

  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Only a super admin can change user active status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileged_fields ON public.user_profiles;
CREATE TRIGGER protect_profile_privileged_fields
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- ============================================================
-- 4. USER PROFILE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "user_profiles_own_access" ON public.user_profiles;
CREATE POLICY "user_profiles_own_access" ON public.user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Previously a super admin could not update anyone else, so User Admin
-- edits were silently rejected by RLS.
DROP POLICY IF EXISTS "user_profiles_admin_manage" ON public.user_profiles;
CREATE POLICY "user_profiles_admin_manage" ON public.user_profiles
FOR ALL TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- ============================================================
-- 5. DEPARTMENT POLICIES — management can create/maintain departments
-- ============================================================

DROP POLICY IF EXISTS "departments_manage_admin" ON public.departments;
CREATE POLICY "departments_manage_admin" ON public.departments
FOR ALL TO authenticated
USING (public.is_management())
WITH CHECK (public.is_management());

-- ============================================================
-- 6. TASK CHILD TABLES — participant-scoped writes
-- ============================================================

DROP POLICY IF EXISTS "task_subtasks_manage" ON public.task_subtasks;
CREATE POLICY "task_subtasks_manage" ON public.task_subtasks
FOR ALL TO authenticated
USING (public.is_task_participant(task_id))
WITH CHECK (public.is_task_participant(task_id));

DROP POLICY IF EXISTS "task_collaborators_manage" ON public.task_collaborators;
CREATE POLICY "task_collaborators_manage" ON public.task_collaborators
FOR ALL TO authenticated
USING (public.is_task_participant(task_id))
WITH CHECK (public.is_task_participant(task_id));

-- Watchers are self-service: anyone may watch/unwatch a task, nobody may
-- add or remove a watcher row on someone else's behalf.
DROP POLICY IF EXISTS "task_watchers_manage" ON public.task_watchers;
DROP POLICY IF EXISTS "task_watchers_insert_self" ON public.task_watchers;
CREATE POLICY "task_watchers_insert_self" ON public.task_watchers
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "task_watchers_delete_self" ON public.task_watchers;
CREATE POLICY "task_watchers_delete_self" ON public.task_watchers
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.is_management());

DROP POLICY IF EXISTS "task_comments_insert" ON public.task_comments;
CREATE POLICY "task_comments_insert" ON public.task_comments
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND public.is_task_participant(task_id));

DROP POLICY IF EXISTS "task_activity_logs_insert" ON public.task_activity_logs;
CREATE POLICY "task_activity_logs_insert" ON public.task_activity_logs
FOR INSERT TO authenticated
WITH CHECK (
  (user_id = auth.uid() OR user_id IS NULL)
  AND public.is_task_participant(task_id)
);

DROP POLICY IF EXISTS "task_attachments_insert" ON public.task_attachments;
CREATE POLICY "task_attachments_insert" ON public.task_attachments
FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid() AND public.is_task_participant(task_id));

-- ============================================================
-- 7. APPROVAL CHAIN CONFIGURATION — management-only write
-- ============================================================

DROP POLICY IF EXISTS "approval_chains_insert" ON public.approval_chains;
CREATE POLICY "approval_chains_insert" ON public.approval_chains
FOR INSERT TO authenticated
WITH CHECK (public.is_management() AND created_by = auth.uid());

DROP POLICY IF EXISTS "approval_chains_update" ON public.approval_chains;
CREATE POLICY "approval_chains_update" ON public.approval_chains
FOR UPDATE TO authenticated
USING (public.is_management())
WITH CHECK (public.is_management());

DROP POLICY IF EXISTS "approval_chains_delete" ON public.approval_chains;
CREATE POLICY "approval_chains_delete" ON public.approval_chains
FOR DELETE TO authenticated
USING (public.is_management());

DROP POLICY IF EXISTS "approval_steps_all" ON public.approval_steps;
CREATE POLICY "approval_steps_all" ON public.approval_steps
FOR ALL TO authenticated
USING (
  public.is_management()
  AND EXISTS (
    SELECT 1 FROM public.approval_chains ac WHERE ac.id = chain_id
  )
)
WITH CHECK (
  public.is_management()
  AND EXISTS (
    SELECT 1 FROM public.approval_chains ac WHERE ac.id = chain_id
  )
);

DROP POLICY IF EXISTS "approval_step_paths_all" ON public.approval_step_paths;
CREATE POLICY "approval_step_paths_all" ON public.approval_step_paths
FOR ALL TO authenticated
USING (
  public.is_management()
  AND EXISTS (SELECT 1 FROM public.approval_steps ast WHERE ast.id = from_step_id)
)
WITH CHECK (
  public.is_management()
  AND EXISTS (SELECT 1 FROM public.approval_steps ast WHERE ast.id = from_step_id)
);

-- ============================================================
-- 8. TASK NUMBER GENERATION — collision-free, database-backed
--    The caller supplies the department code and the (Bikram Sambat)
--    fiscal year label; the sequence guarantees uniqueness.
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS public.task_number_seq;

CREATE OR REPLACE FUNCTION public.generate_task_number(
  p_dept_code TEXT,
  p_fiscal_year TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq BIGINT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_seq := nextval('public.task_number_seq');

  RETURN format(
    '%s-%s-%s',
    upper(COALESCE(NULLIF(trim(p_dept_code), ''), 'GEN')),
    COALESCE(NULLIF(trim(p_fiscal_year), ''), to_char(now(), 'YYYY')),
    lpad(v_seq::text, 5, '0')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.generate_task_number(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON SEQUENCE public.task_number_seq FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_task_number(TEXT, TEXT) TO authenticated;

-- ============================================================
-- 9. DASHBOARD STATS — respect RLS instead of bypassing it
--    (SECURITY DEFINER previously exposed counts across every
--    department, including confidential tasks, to any user.)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_tasks', COUNT(*),
    'open_tasks', COUNT(*) FILTER (WHERE status IN ('draft', 'assigned', 'accepted')),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'overdue', COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'closed', 'cancelled')),
    'due_today', COUNT(*) FILTER (WHERE due_date = CURRENT_DATE AND status NOT IN ('completed', 'closed', 'cancelled')),
    'awaiting_approval', COUNT(*) FILTER (WHERE status = 'under_review'),
    'completed_this_week', COUNT(*) FILTER (WHERE status = 'completed' AND completed_date >= date_trunc('week', CURRENT_TIMESTAMP)),
    'blocked', COUNT(*) FILTER (WHERE status = 'blocked')
  ) INTO v_result
  FROM public.tasks
  WHERE status NOT IN ('closed', 'cancelled');

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_stats(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(UUID) TO authenticated;

-- ============================================================
-- 10. GRANT TASK DELETION TO MANAGEMENT
--     (employees could previously delete tasks they created,
--     which destroyed the audit trail)
-- ============================================================

DROP POLICY IF EXISTS "tasks_delete_admin" ON public.tasks;
CREATE POLICY "tasks_delete_admin" ON public.tasks
FOR DELETE TO authenticated
USING (public.is_management());

-- ============================================================
-- 11. NOTIFICATION FAN-OUT
--     The notifications RLS policy only lets a user write their own rows,
--     so an assignee's notification cannot be inserted by the task creator.
--     These SECURITY DEFINER triggers run as the table owner and create the
--     notifications server-side instead.
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_task_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to IS DISTINCT FROM NEW.created_by THEN
      INSERT INTO public.notifications (user_id, task_id, notification_type, title, body)
      VALUES (
        NEW.assigned_to, NEW.id, 'new_assignment', 'New Assignment',
        format('%s has been assigned to you: %s', NEW.task_number, NEW.title)
      );
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'under_review' AND NEW.approver_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, task_id, notification_type, title, body)
      VALUES (
        NEW.approver_id, NEW.id, 'approval_required', 'Approval Required',
        format('%s awaits your approval.', NEW.task_number)
      );
      RETURN NEW;
    END IF;

    IF NEW.status = 'approved' THEN
      FOR v_recipient IN
        SELECT DISTINCT u FROM unnest(ARRAY[NEW.created_by, NEW.assigned_to]) AS u
        WHERE u IS NOT NULL
      LOOP
        INSERT INTO public.notifications (user_id, task_id, notification_type, title, body)
        VALUES (v_recipient, NEW.id, 'approved', 'Task Approved', format('%s was approved.', NEW.task_number));
      END LOOP;
      RETURN NEW;
    END IF;

    IF NEW.status = 'changes_requested' THEN
      FOR v_recipient IN
        SELECT DISTINCT u FROM unnest(ARRAY[NEW.assigned_to]) AS u
        WHERE u IS NOT NULL
      LOOP
        INSERT INTO public.notifications (user_id, task_id, notification_type, title, body)
        VALUES (v_recipient, NEW.id, 'sent_back', 'Changes Requested', format('Changes were requested on %s.', NEW.task_number));
      END LOOP;
      RETURN NEW;
    END IF;

    IF NEW.status = 'completed' AND NEW.created_by IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, task_id, notification_type, title, body)
      VALUES (
        NEW.created_by, NEW.id, 'task_completed', 'Task Completed',
        format('%s was marked completed.', NEW.task_number)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_task_event ON public.tasks;
CREATE TRIGGER notify_task_event
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_task_event();

-- ============================================================
-- 12. ACTIVITY LOG FAN-OUT
--     Same reasoning: the log writer must be able to record actions taken
--     by the acting user against tasks they participate in, and to stamp
--     the actor automatically so it cannot be spoofed.
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_task_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.task_activity_logs (task_id, user_id, action, new_value)
    VALUES (NEW.id, auth.uid(), 'created', NEW.title);
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.task_activity_logs (task_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status_changed', OLD.status::text, NEW.status::text);
  END IF;

  IF NEW.progress IS DISTINCT FROM OLD.progress THEN
    INSERT INTO public.task_activity_logs (task_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'progress_changed', OLD.progress::text, NEW.progress::text);
  END IF;

  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    INSERT INTO public.task_activity_logs (task_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'reassigned', OLD.assigned_to::text, NEW.assigned_to::text);
  END IF;

  IF NEW.priority IS DISTINCT FROM OLD.priority THEN
    INSERT INTO public.task_activity_logs (task_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'priority_changed', OLD.priority::text, NEW.priority::text);
  END IF;

  IF NEW.due_date IS DISTINCT FROM OLD.due_date THEN
    INSERT INTO public.task_activity_logs (task_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'due_date_changed', OLD.due_date::text, NEW.due_date::text);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_task_activity ON public.tasks;
CREATE TRIGGER audit_task_activity
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.audit_task_activity();

-- ============================================================
-- 14. TASK FIELD GUARD
--     tasks_update_authenticated lets any participant UPDATE the row, which
--     includes the routing columns. Without this, an assignee could set
--     approver_id to themselves and then move the task straight to approved,
--     or flip is_confidential to expose a task they were given in confidence.
--     Only management and the task creator may change routing/visibility.
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_task_routing_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_management() OR OLD.created_by = auth.uid() THEN
    RETURN NEW;
  END IF;

  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    RAISE EXCEPTION 'Only the task creator or management can reassign a task';
  END IF;

  IF NEW.approver_id IS DISTINCT FROM OLD.approver_id THEN
    RAISE EXCEPTION 'Only the task creator or management can change the approver';
  END IF;

  IF NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id THEN
    RAISE EXCEPTION 'Only the task creator or management can change the reviewer';
  END IF;

  IF NEW.is_confidential IS DISTINCT FROM OLD.is_confidential THEN
    RAISE EXCEPTION 'Only the task creator or management can change confidentiality';
  END IF;

  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Task ownership cannot be transferred';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_task_routing_fields ON public.tasks;
CREATE TRIGGER protect_task_routing_fields
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.protect_task_routing_fields();

-- ============================================================
-- 15. SCOPED READS ON TASK CHILD TABLES
--     Every child table still had `FOR SELECT ... USING (true)`, so any
--     authenticated user could read comments, activity logs, subtasks,
--     attachments, assignments and collaborators for a confidential task
--     they were not allowed to see in public.tasks at all. Reads now go
--     through the same visibility rule as the parent task.
-- ============================================================

CREATE OR REPLACE FUNCTION public.can_read_task(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks t
    WHERE t.id = p_task_id
      AND (
        t.is_confidential = false
        OR t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR t.reviewer_id = auth.uid()
        OR t.approver_id = auth.uid()
        OR public.is_management()
      )
  )
$$;

REVOKE ALL ON FUNCTION public.can_read_task(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_task(UUID) TO authenticated;

DROP POLICY IF EXISTS "task_subtasks_read" ON public.task_subtasks;
CREATE POLICY "task_subtasks_read" ON public.task_subtasks
FOR SELECT TO authenticated USING (public.can_read_task(task_id));

DROP POLICY IF EXISTS "task_comments_read" ON public.task_comments;
CREATE POLICY "task_comments_read" ON public.task_comments
FOR SELECT TO authenticated USING (public.can_read_task(task_id));

DROP POLICY IF EXISTS "task_activity_logs_read" ON public.task_activity_logs;
CREATE POLICY "task_activity_logs_read" ON public.task_activity_logs
FOR SELECT TO authenticated USING (public.can_read_task(task_id));

DROP POLICY IF EXISTS "task_attachments_read" ON public.task_attachments;
CREATE POLICY "task_attachments_read" ON public.task_attachments
FOR SELECT TO authenticated USING (public.can_read_task(task_id));

DROP POLICY IF EXISTS "task_assignments_read" ON public.task_assignments;
CREATE POLICY "task_assignments_read" ON public.task_assignments
FOR SELECT TO authenticated USING (public.can_read_task(task_id));

DROP POLICY IF EXISTS "task_collaborators_read" ON public.task_collaborators;
CREATE POLICY "task_collaborators_read" ON public.task_collaborators
FOR SELECT TO authenticated USING (public.can_read_task(task_id));

DROP POLICY IF EXISTS "task_watchers_read" ON public.task_watchers;
CREATE POLICY "task_watchers_read" ON public.task_watchers
FOR SELECT TO authenticated USING (public.can_read_task(task_id));