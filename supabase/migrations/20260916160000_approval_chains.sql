-- ============================================================
-- Approval Chains Module
-- Multi-level approval chain configuration per task category
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.approval_step_action CASCADE;
CREATE TYPE public.approval_step_action AS ENUM (
  'approve',
  'reject',
  'request_changes',
  'forward',
  'auto_approve'
);

DROP TYPE IF EXISTS public.approval_chain_status CASCADE;
CREATE TYPE public.approval_chain_status AS ENUM (
  'active',
  'draft',
  'inactive'
);

DROP TYPE IF EXISTS public.approval_path_type CASCADE;
CREATE TYPE public.approval_path_type AS ENUM (
  'on_approve',
  'on_reject',
  'on_change_request'
);

-- 2. CORE TABLE: approval_chains
CREATE TABLE IF NOT EXISTS public.approval_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  task_category TEXT NOT NULL,
  status public.approval_chain_status DEFAULT 'draft'::public.approval_chain_status,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. STEPS TABLE: approval_steps
CREATE TABLE IF NOT EXISTS public.approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES public.approval_chains(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  role_label TEXT NOT NULL,
  approver_role TEXT,
  department_code TEXT,
  allowed_actions public.approval_step_action[] DEFAULT ARRAY['approve','reject','request_changes']::public.approval_step_action[],
  sla_hours INTEGER DEFAULT 48,
  is_optional BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. ROUTING PATHS TABLE: approval_step_paths
-- Defines where to go after each action at each step
CREATE TABLE IF NOT EXISTS public.approval_step_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_step_id UUID NOT NULL REFERENCES public.approval_steps(id) ON DELETE CASCADE,
  path_type public.approval_path_type NOT NULL,
  to_step_id UUID REFERENCES public.approval_steps(id) ON DELETE SET NULL,
  -- NULL to_step_id means end of chain (terminal)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_approval_chains_category ON public.approval_chains(task_category);
CREATE INDEX IF NOT EXISTS idx_approval_chains_status ON public.approval_chains(status);
CREATE INDEX IF NOT EXISTS idx_approval_steps_chain_id ON public.approval_steps(chain_id);
CREATE INDEX IF NOT EXISTS idx_approval_steps_order ON public.approval_steps(chain_id, step_order);
CREATE INDEX IF NOT EXISTS idx_approval_step_paths_from ON public.approval_step_paths(from_step_id);

-- 6. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_approval_chains_updated_at ON public.approval_chains;
CREATE TRIGGER trg_approval_chains_updated_at
  BEFORE UPDATE ON public.approval_chains
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_approval_steps_updated_at ON public.approval_steps;
CREATE TRIGGER trg_approval_steps_updated_at
  BEFORE UPDATE ON public.approval_steps
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. ENABLE RLS
ALTER TABLE public.approval_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_step_paths ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES
-- approval_chains: authenticated users can read all; only managers/admins can write
DROP POLICY IF EXISTS "approval_chains_select" ON public.approval_chains;
CREATE POLICY "approval_chains_select"
  ON public.approval_chains FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "approval_chains_insert" ON public.approval_chains;
CREATE POLICY "approval_chains_insert"
  ON public.approval_chains FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "approval_chains_update" ON public.approval_chains;
CREATE POLICY "approval_chains_update"
  ON public.approval_chains FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "approval_chains_delete" ON public.approval_chains;
CREATE POLICY "approval_chains_delete"
  ON public.approval_chains FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- approval_steps: all authenticated can read; write follows chain ownership
DROP POLICY IF EXISTS "approval_steps_select" ON public.approval_steps;
CREATE POLICY "approval_steps_select"
  ON public.approval_steps FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "approval_steps_all" ON public.approval_steps;
CREATE POLICY "approval_steps_all"
  ON public.approval_steps FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.approval_chains ac
      WHERE ac.id = chain_id AND ac.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.approval_chains ac
      WHERE ac.id = chain_id AND ac.created_by = auth.uid()
    )
  );

-- approval_step_paths: all authenticated can read; write follows step ownership
DROP POLICY IF EXISTS "approval_step_paths_select" ON public.approval_step_paths;
CREATE POLICY "approval_step_paths_select"
  ON public.approval_step_paths FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "approval_step_paths_all" ON public.approval_step_paths;
CREATE POLICY "approval_step_paths_all"
  ON public.approval_step_paths FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.approval_steps ast
      JOIN public.approval_chains ac ON ac.id = ast.chain_id
      WHERE ast.id = from_step_id AND ac.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.approval_steps ast
      JOIN public.approval_chains ac ON ac.id = ast.chain_id
      WHERE ast.id = from_step_id AND ac.created_by = auth.uid()
    )
  );

-- 9. SEED DATA
DO $$
DECLARE
  v_user_id UUID;
  v_chain1 UUID := gen_random_uuid();
  v_chain2 UUID := gen_random_uuid();
  v_chain3 UUID := gen_random_uuid();
  -- chain1 steps
  v_s1_1 UUID := gen_random_uuid();
  v_s1_2 UUID := gen_random_uuid();
  v_s1_3 UUID := gen_random_uuid();
  -- chain2 steps
  v_s2_1 UUID := gen_random_uuid();
  v_s2_2 UUID := gen_random_uuid();
  v_s2_3 UUID := gen_random_uuid();
  v_s2_4 UUID := gen_random_uuid();
  -- chain3 steps
  v_s3_1 UUID := gen_random_uuid();
  v_s3_2 UUID := gen_random_uuid();
  v_s3_3 UUID := gen_random_uuid();
BEGIN
  SELECT id INTO v_user_id FROM public.user_profiles LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No user found — skipping approval chain seed data.';
    RETURN;
  END IF;

  -- Chain 1: Loan Processing
  INSERT INTO public.approval_chains (id, name, description, task_category, status, is_default, created_by)
  VALUES (v_chain1, 'Loan Processing Approval', 'Standard 3-level approval for loan applications', 'Credit / Loan', 'active', true, v_user_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.approval_steps (id, chain_id, step_order, step_name, role_label, approver_role, department_code, allowed_actions, sla_hours)
  VALUES
    (v_s1_1, v_chain1, 1, 'Initial Review', 'Credit Officer', 'officer', 'CREDIT', ARRAY['approve','reject','request_changes']::public.approval_step_action[], 24),
    (v_s1_2, v_chain1, 2, 'Department Head Review', 'Department Head', 'department_head', 'CREDIT', ARRAY['approve','reject','request_changes']::public.approval_step_action[], 48),
    (v_s1_3, v_chain1, 3, 'CEO Final Approval', 'CEO / Manager', 'ceo', 'MANAGEMENT', ARRAY['approve','reject']::public.approval_step_action[], 72)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.approval_step_paths (from_step_id, path_type, to_step_id)
  VALUES
    (v_s1_1, 'on_approve', v_s1_2),
    (v_s1_1, 'on_reject', NULL),
    (v_s1_1, 'on_change_request', v_s1_1),
    (v_s1_2, 'on_approve', v_s1_3),
    (v_s1_2, 'on_reject', v_s1_1),
    (v_s1_2, 'on_change_request', v_s1_1),
    (v_s1_3, 'on_approve', NULL),
    (v_s1_3, 'on_reject', v_s1_2)
  ON CONFLICT (id) DO NOTHING;

  -- Chain 2: Procurement
  INSERT INTO public.approval_chains (id, name, description, task_category, status, is_default, created_by)
  VALUES (v_chain2, 'Procurement Approval', '4-level procurement approval with budget review', 'Procurement', 'active', false, v_user_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.approval_steps (id, chain_id, step_order, step_name, role_label, approver_role, department_code, allowed_actions, sla_hours)
  VALUES
    (v_s2_1, v_chain2, 1, 'Employee Request', 'Employee', 'employee', NULL, ARRAY['approve','request_changes']::public.approval_step_action[], 24),
    (v_s2_2, v_chain2, 2, 'Dept Head Approval', 'Department Head', 'department_head', NULL, ARRAY['approve','reject','request_changes']::public.approval_step_action[], 48),
    (v_s2_3, v_chain2, 3, 'Finance Review', 'Finance Officer', 'officer', 'FINANCE', ARRAY['approve','reject','request_changes']::public.approval_step_action[], 48),
    (v_s2_4, v_chain2, 4, 'CEO Authorization', 'CEO', 'ceo', 'MANAGEMENT', ARRAY['approve','reject']::public.approval_step_action[], 72)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.approval_step_paths (from_step_id, path_type, to_step_id)
  VALUES
    (v_s2_1, 'on_approve', v_s2_2),
    (v_s2_1, 'on_change_request', v_s2_1),
    (v_s2_2, 'on_approve', v_s2_3),
    (v_s2_2, 'on_reject', v_s2_1),
    (v_s2_2, 'on_change_request', v_s2_1),
    (v_s2_3, 'on_approve', v_s2_4),
    (v_s2_3, 'on_reject', v_s2_2),
    (v_s2_3, 'on_change_request', v_s2_2),
    (v_s2_4, 'on_approve', NULL),
    (v_s2_4, 'on_reject', v_s2_3)
  ON CONFLICT (id) DO NOTHING;

  -- Chain 3: HR Onboarding
  INSERT INTO public.approval_chains (id, name, description, task_category, status, is_default, created_by)
  VALUES (v_chain3, 'HR Onboarding Approval', 'Employee onboarding approval chain', 'HR / Onboarding', 'draft', false, v_user_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.approval_steps (id, chain_id, step_order, step_name, role_label, approver_role, department_code, allowed_actions, sla_hours)
  VALUES
    (v_s3_1, v_chain3, 1, 'HR Verification', 'HR Officer', 'officer', 'HR', ARRAY['approve','reject','request_changes']::public.approval_step_action[], 24),
    (v_s3_2, v_chain3, 2, 'Manager Approval', 'Department Head', 'department_head', NULL, ARRAY['approve','reject','request_changes']::public.approval_step_action[], 48),
    (v_s3_3, v_chain3, 3, 'CEO Sign-off', 'CEO', 'ceo', 'MANAGEMENT', ARRAY['approve','reject']::public.approval_step_action[], 48)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.approval_step_paths (from_step_id, path_type, to_step_id)
  VALUES
    (v_s3_1, 'on_approve', v_s3_2),
    (v_s3_1, 'on_reject', NULL),
    (v_s3_1, 'on_change_request', v_s3_1),
    (v_s3_2, 'on_approve', v_s3_3),
    (v_s3_2, 'on_reject', v_s3_1),
    (v_s3_2, 'on_change_request', v_s3_1),
    (v_s3_3, 'on_approve', NULL),
    (v_s3_3, 'on_reject', v_s3_2)
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data failed: %', SQLERRM;
END $$;
