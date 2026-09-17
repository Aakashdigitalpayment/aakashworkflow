-- ============================================================
-- AakashWorkFlow — Core Schema Migration
-- Aakash Cooperative Business Automation & Task Management
-- ============================================================

-- ============================================================
-- STEP 1: ENUM TYPES
-- ============================================================

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM (
  'super_admin', 'ceo', 'manager', 'department_head',
  'officer', 'employee', 'auditor'
);

DROP TYPE IF EXISTS public.task_status CASCADE;
CREATE TYPE public.task_status AS ENUM (
  'draft', 'assigned', 'accepted', 'in_progress', 'pending',
  'blocked', 'under_review', 'changes_requested', 'approved',
  'completed', 'closed', 'cancelled', 'on_hold', 'reopened'
);

DROP TYPE IF EXISTS public.task_priority CASCADE;
CREATE TYPE public.task_priority AS ENUM ('critical', 'high', 'medium', 'low');

DROP TYPE IF EXISTS public.assignment_type CASCADE;
CREATE TYPE public.assignment_type AS ENUM (
  'initial', 'reassigned', 'forwarded', 'sent_back', 'self_assigned'
);

DROP TYPE IF EXISTS public.activity_action CASCADE;
CREATE TYPE public.activity_action AS ENUM (
  'created', 'assigned', 'accepted', 'status_changed', 'progress_changed',
  'commented', 'forwarded', 'sent_back', 'reassigned', 'due_date_changed',
  'priority_changed', 'file_uploaded', 'file_deleted', 'approved',
  'rejected', 'completed', 'reopened', 'subtask_added', 'subtask_completed'
);

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM (
  'new_assignment', 'forwarded', 'sent_back', 'comment_added',
  'mention', 'deadline_approaching', 'overdue', 'approval_required',
  'approved', 'rejected', 'task_completed', 'task_reopened'
);

-- ============================================================
-- STEP 2: CORE TABLES (no foreign keys first)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role public.user_role DEFAULT 'employee'::public.user_role,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  position TEXT,
  phone TEXT,
  avatar_initials TEXT,
  is_active BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 3: TASK TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status DEFAULT 'draft'::public.task_status,
  priority public.task_priority DEFAULT 'medium'::public.task_priority,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  approver_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  start_date DATE,
  due_date DATE,
  completed_date TIMESTAMPTZ,
  estimated_hours NUMERIC(6,2),
  is_confidential BOOLEAN DEFAULT false,
  delay_reason TEXT,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  from_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  to_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  assignment_type public.assignment_type DEFAULT 'initial'::public.assignment_type,
  reason TEXT,
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.task_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  due_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.task_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.task_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  action public.activity_action NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.task_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.task_watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 4: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON public.user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_department ON public.tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_to_user ON public.task_assignments(to_user_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_task ON public.task_activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_user ON public.task_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_created ON public.task_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_task ON public.task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- STEP 5: FUNCTIONS (must be before RLS policies)
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Trigger: create user_profiles when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, avatar_initials)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')::public.user_role,
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 1) ||
          LEFT(COALESCE(SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2), ''), 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Helper: check if current user is admin/ceo/manager
CREATE OR REPLACE FUNCTION public.is_management()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = auth.uid()
  AND (
    au.raw_user_meta_data->>'role' IN ('super_admin', 'ceo', 'manager')
    OR au.raw_app_meta_data->>'role' IN ('super_admin', 'ceo', 'manager')
  )
)
$$;

-- Helper: check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = auth.uid()
  AND (
    au.raw_user_meta_data->>'role' = 'super_admin'
    OR au.raw_app_meta_data->>'role' = 'super_admin'
  )
)
$$;

-- Helper: check if current user is auditor
CREATE OR REPLACE FUNCTION public.is_auditor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = auth.uid()
  AND (
    au.raw_user_meta_data->>'role' = 'auditor'
    OR au.raw_app_meta_data->>'role' = 'auditor'
  )
)
$$;

-- Dashboard stats function
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_uid UUID;
BEGIN
  v_uid := COALESCE(p_user_id, auth.uid());
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

-- ============================================================
-- STEP 6: ENABLE RLS
-- ============================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 7: RLS POLICIES
-- ============================================================

-- Departments: all authenticated users can read
DROP POLICY IF EXISTS "departments_read_all" ON public.departments;
CREATE POLICY "departments_read_all" ON public.departments
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "departments_manage_admin" ON public.departments;
CREATE POLICY "departments_manage_admin" ON public.departments
FOR ALL TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- User profiles: own profile full access, others can read
DROP POLICY IF EXISTS "user_profiles_own_access" ON public.user_profiles;
CREATE POLICY "user_profiles_own_access" ON public.user_profiles
FOR ALL TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_read_all" ON public.user_profiles;
CREATE POLICY "user_profiles_read_all" ON public.user_profiles
FOR SELECT TO authenticated USING (true);

-- Tasks: broad access for internal system
DROP POLICY IF EXISTS "tasks_read_authenticated" ON public.tasks;
CREATE POLICY "tasks_read_authenticated" ON public.tasks
FOR SELECT TO authenticated USING (
  is_confidential = false
  OR created_by = auth.uid()
  OR assigned_to = auth.uid()
  OR reviewer_id = auth.uid()
  OR approver_id = auth.uid()
  OR public.is_management()
);

DROP POLICY IF EXISTS "tasks_insert_authenticated" ON public.tasks;
CREATE POLICY "tasks_insert_authenticated" ON public.tasks
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "tasks_update_authenticated" ON public.tasks;
CREATE POLICY "tasks_update_authenticated" ON public.tasks
FOR UPDATE TO authenticated
USING (
  created_by = auth.uid()
  OR assigned_to = auth.uid()
  OR reviewer_id = auth.uid()
  OR approver_id = auth.uid()
  OR public.is_management()
)
WITH CHECK (
  created_by = auth.uid()
  OR assigned_to = auth.uid()
  OR reviewer_id = auth.uid()
  OR approver_id = auth.uid()
  OR public.is_management()
);

DROP POLICY IF EXISTS "tasks_delete_admin" ON public.tasks;
CREATE POLICY "tasks_delete_admin" ON public.tasks
FOR DELETE TO authenticated
USING (public.is_super_admin() OR created_by = auth.uid());

-- Task assignments: all authenticated can read, management can insert
DROP POLICY IF EXISTS "task_assignments_read" ON public.task_assignments;
CREATE POLICY "task_assignments_read" ON public.task_assignments
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "task_assignments_insert" ON public.task_assignments;
CREATE POLICY "task_assignments_insert" ON public.task_assignments
FOR INSERT TO authenticated
WITH CHECK (assigned_by = auth.uid());

-- Task subtasks
DROP POLICY IF EXISTS "task_subtasks_read" ON public.task_subtasks;
CREATE POLICY "task_subtasks_read" ON public.task_subtasks
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "task_subtasks_manage" ON public.task_subtasks;
CREATE POLICY "task_subtasks_manage" ON public.task_subtasks
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Task comments
DROP POLICY IF EXISTS "task_comments_read" ON public.task_comments;
CREATE POLICY "task_comments_read" ON public.task_comments
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "task_comments_insert" ON public.task_comments;
CREATE POLICY "task_comments_insert" ON public.task_comments
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "task_comments_update_own" ON public.task_comments;
CREATE POLICY "task_comments_update_own" ON public.task_comments
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Task attachments
DROP POLICY IF EXISTS "task_attachments_read" ON public.task_attachments;
CREATE POLICY "task_attachments_read" ON public.task_attachments
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "task_attachments_insert" ON public.task_attachments;
CREATE POLICY "task_attachments_insert" ON public.task_attachments
FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- Activity logs: all can read, system inserts
DROP POLICY IF EXISTS "task_activity_logs_read" ON public.task_activity_logs;
CREATE POLICY "task_activity_logs_read" ON public.task_activity_logs
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "task_activity_logs_insert" ON public.task_activity_logs;
CREATE POLICY "task_activity_logs_insert" ON public.task_activity_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Notifications: own only
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Collaborators & Watchers
DROP POLICY IF EXISTS "task_collaborators_read" ON public.task_collaborators;
CREATE POLICY "task_collaborators_read" ON public.task_collaborators
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "task_collaborators_manage" ON public.task_collaborators;
CREATE POLICY "task_collaborators_manage" ON public.task_collaborators
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "task_watchers_read" ON public.task_watchers;
CREATE POLICY "task_watchers_read" ON public.task_watchers
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "task_watchers_manage" ON public.task_watchers;
CREATE POLICY "task_watchers_manage" ON public.task_watchers
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Audit logs: management and auditors can read
DROP POLICY IF EXISTS "audit_logs_read" ON public.audit_logs;
CREATE POLICY "audit_logs_read" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_management() OR public.is_auditor() OR public.is_super_admin());

DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================================
-- STEP 8: TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS handle_departments_updated_at ON public.departments;
CREATE TRIGGER handle_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_tasks_updated_at ON public.tasks;
CREATE TRIGGER handle_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_task_subtasks_updated_at ON public.task_subtasks;
CREATE TRIGGER handle_task_subtasks_updated_at
  BEFORE UPDATE ON public.task_subtasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_task_comments_updated_at ON public.task_comments;
CREATE TRIGGER handle_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

