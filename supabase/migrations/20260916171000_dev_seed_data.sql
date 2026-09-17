-- ============================================================
-- DEV SEED DATA — DO NOT RUN IN PRODUCTION
-- ============================================================
-- This migration creates demo departments, demo auth users with KNOWN
-- PASSWORDS, and sample tasks so a fresh environment has something to
-- look at. It is safe to skip entirely: the core schema works without it.
--
-- To load it:   supabase db push   (it runs with every other migration)
-- To skip it:   delete this file, or keep it out of your production branch.
--
-- The demo passwords are intentionally obvious and MUST be rotated or
-- the accounts deleted before this data is exposed to real users.
-- Demo accounts: ceo@ / manager@ / depthead@ / officer@ / employee@ /
-- auditor@aakashcooperative.com.np — see the passwords inline below.
-- ============================================================

-- ============================================================
-- STEP 9: MOCK DATA
-- ============================================================

DO $$
DECLARE
  dept_admin UUID := gen_random_uuid();
  dept_finance UUID := gen_random_uuid();
  dept_credit UUID := gen_random_uuid();
  dept_recovery UUID := gen_random_uuid();
  dept_hr UUID := gen_random_uuid();
  dept_it UUID := gen_random_uuid();
  dept_membership UUID := gen_random_uuid();
  dept_marketing UUID := gen_random_uuid();

  user_ceo UUID := gen_random_uuid();
  user_manager UUID := gen_random_uuid();
  user_depthead UUID := gen_random_uuid();
  user_officer UUID := gen_random_uuid();
  user_employee UUID := gen_random_uuid();
  user_auditor UUID := gen_random_uuid();
  user_sita UUID := gen_random_uuid();
  user_dipak UUID := gen_random_uuid();
  user_kamala UUID := gen_random_uuid();
  user_bikash UUID := gen_random_uuid();
  user_anita UUID := gen_random_uuid();
  user_suresh UUID := gen_random_uuid();
  user_binod UUID := gen_random_uuid();
  user_puja UUID := gen_random_uuid();

  task_fin1 UUID := gen_random_uuid();
  task_fin2 UUID := gen_random_uuid();
  task_credit1 UUID := gen_random_uuid();
  task_credit2 UUID := gen_random_uuid();
  task_adm1 UUID := gen_random_uuid();
  task_rec1 UUID := gen_random_uuid();
  task_hr1 UUID := gen_random_uuid();
  task_it1 UUID := gen_random_uuid();
  task_mem1 UUID := gen_random_uuid();
  task_mkt1 UUID := gen_random_uuid();
BEGIN

  -- Departments
  INSERT INTO public.departments (id, name, code, description) VALUES
    (dept_admin, 'Administration', 'ADM', 'General administration and office management'),
    (dept_finance, 'Finance', 'FIN', 'Financial operations, accounting, and reporting'),
    (dept_credit, 'Credit/Loan', 'CRD', 'Loan processing, credit analysis, and disbursement'),
    (dept_recovery, 'Recovery', 'REC', 'Loan recovery and overdue member follow-up'),
    (dept_hr, 'Human Resources', 'HR', 'Employee management, recruitment, and training'),
    (dept_it, 'Information Technology', 'IT', 'IT infrastructure, systems, and support'),
    (dept_membership, 'Membership', 'MEM', 'Member services, KYC, and registration'),
    (dept_marketing, 'Marketing', 'MKT', 'Marketing, communications, and member outreach')
  ON CONFLICT (code) DO NOTHING;

  -- Auth users (trigger creates user_profiles automatically)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (user_ceo, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ceo@aakashcooperative.com.np', crypt('AakashCEO@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Rajesh Kumar Shrestha', 'role', 'ceo'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_manager, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'manager@aakashcooperative.com.np', crypt('AakashMgr@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Narayan Paudel', 'role', 'manager'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_depthead, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'depthead@aakashcooperative.com.np', crypt('AakashDH@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Binod Karki', 'role', 'department_head'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_officer, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'officer@aakashcooperative.com.np', crypt('AakashOff@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Sita Rana', 'role', 'officer'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_employee, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'employee@aakashcooperative.com.np', crypt('AakashEmp@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Dipak Magar', 'role', 'employee'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_auditor, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'auditor@aakashcooperative.com.np', crypt('AakashAud@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Audit User', 'role', 'auditor'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_sita, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'sita.rana@aakashcooperative.com.np', crypt('AakashOff@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Sita Rana', 'role', 'officer'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_dipak, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'dipak.magar@aakashcooperative.com.np', crypt('AakashEmp@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Dipak Magar', 'role', 'employee'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_kamala, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'kamala.thapa@aakashcooperative.com.np', crypt('AakashEmp@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Kamala Thapa', 'role', 'employee'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_bikash, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'bikash.gurung@aakashcooperative.com.np', crypt('AakashEmp@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Bikash Gurung', 'role', 'employee'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_anita, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'anita.shrestha@aakashcooperative.com.np', crypt('AakashEmp@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Anita Shrestha', 'role', 'officer'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_suresh, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'suresh.pradhan@aakashcooperative.com.np', crypt('AakashEmp@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Suresh Pradhan', 'role', 'officer'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_binod, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'binod.karki@aakashcooperative.com.np', crypt('AakashDH@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Binod Karki', 'role', 'department_head'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (user_puja, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'puja.tamang@aakashcooperative.com.np', crypt('AakashEmp@2083', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Puja Tamang', 'role', 'employee'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

  -- Roles are NOT taken from auth metadata (see 20260916170000_security_hardening.sql
  -- — that would let any user self-promote). The demo roles are assigned here,
  -- explicitly, by the migration itself.
  UPDATE public.user_profiles SET role = 'ceo' WHERE id = user_ceo;
  UPDATE public.user_profiles SET role = 'manager' WHERE id = user_manager;
  UPDATE public.user_profiles SET role = 'department_head' WHERE id = user_depthead;
  UPDATE public.user_profiles SET role = 'officer' WHERE id = user_officer;
  UPDATE public.user_profiles SET role = 'employee' WHERE id = user_employee;
  UPDATE public.user_profiles SET role = 'auditor' WHERE id = user_auditor;
  UPDATE public.user_profiles SET role = 'officer' WHERE id = user_sita;
  UPDATE public.user_profiles SET role = 'employee' WHERE id = user_dipak;
  UPDATE public.user_profiles SET role = 'employee' WHERE id = user_kamala;
  UPDATE public.user_profiles SET role = 'employee' WHERE id = user_bikash;
  UPDATE public.user_profiles SET role = 'officer' WHERE id = user_anita;
  UPDATE public.user_profiles SET role = 'officer' WHERE id = user_suresh;
  UPDATE public.user_profiles SET role = 'department_head' WHERE id = user_binod;
  UPDATE public.user_profiles SET role = 'employee' WHERE id = user_puja;

  -- Update user_profiles with department assignments (trigger already created them)
  UPDATE public.user_profiles SET department_id = dept_finance, position = 'Finance Officer', avatar_initials = 'SR' WHERE id = user_officer;
  UPDATE public.user_profiles SET department_id = dept_credit, position = 'Credit Officer', avatar_initials = 'DM' WHERE id = user_employee;
  UPDATE public.user_profiles SET department_id = dept_credit, position = 'Credit Department Head', avatar_initials = 'BK' WHERE id = user_depthead;
  UPDATE public.user_profiles SET department_id = dept_admin, position = 'General Manager', avatar_initials = 'NP' WHERE id = user_manager;
  UPDATE public.user_profiles SET department_id = NULL, position = 'CEO / General Manager', avatar_initials = 'RKS' WHERE id = user_ceo;
  UPDATE public.user_profiles SET department_id = dept_finance, position = 'Finance Officer', avatar_initials = 'SR' WHERE id = user_sita;
  UPDATE public.user_profiles SET department_id = dept_credit, position = 'Credit Officer', avatar_initials = 'DM' WHERE id = user_dipak;
  UPDATE public.user_profiles SET department_id = dept_admin, position = 'Admin Officer', avatar_initials = 'KT' WHERE id = user_kamala;
  UPDATE public.user_profiles SET department_id = dept_recovery, position = 'Recovery Officer', avatar_initials = 'BG' WHERE id = user_bikash;
  UPDATE public.user_profiles SET department_id = dept_hr, position = 'HR Officer', avatar_initials = 'AS' WHERE id = user_anita;
  UPDATE public.user_profiles SET department_id = dept_it, position = 'IT Officer', avatar_initials = 'SP' WHERE id = user_suresh;
  UPDATE public.user_profiles SET department_id = dept_credit, position = 'Credit Department Head', avatar_initials = 'BK' WHERE id = user_binod;
  UPDATE public.user_profiles SET department_id = dept_membership, position = 'Membership Officer', avatar_initials = 'PT' WHERE id = user_puja;

  -- Tasks
  INSERT INTO public.tasks (id, task_number, title, description, status, priority, progress, department_id, created_by, assigned_to, reviewer_id, approver_id, category, tags, due_date, start_date, created_at) VALUES
    (task_fin1, 'FIN-2083-00431', 'Monthly Loan Disbursement Report — Ashwin 2083',
     'Prepare the comprehensive monthly loan disbursement report for Ashwin 2083, including total disbursements by category, branch-wise breakdown, and comparison with previous month.',
     'under_review', 'critical', 90, dept_finance, user_ceo, user_sita, user_manager, user_ceo,
     'Financial Reporting', ARRAY['monthly', 'finance', 'loan'], CURRENT_DATE, CURRENT_DATE - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (task_fin2, 'FIN-2083-00398', 'Q2 Financial Reconciliation Report — FY 2083/84',
     'Quarterly financial reconciliation blocked pending CBS system data export. Waiting for IT department to resolve CBS-2 data access issue.',
     'blocked', 'critical', 60, dept_finance, user_ceo, user_sita, user_manager, user_ceo,
     'Financial Reporting', ARRAY['quarterly', 'finance', 'blocked', 'cbs'], CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '15 days'),
    (task_credit1, 'CRD-2083-00315', 'Field Verification — Lalitpur Branch Loan Applications',
     'Conduct field verification visits for 8 pending loan applications from Lalitpur branch. Verify collateral, income sources, and residence.',
     'in_progress', 'high', 45, dept_credit, user_binod, user_dipak, user_binod, user_manager,
     'Loan Processing', ARRAY['field-work', 'loan', 'verification'], CURRENT_DATE + INTERVAL '4 days', CURRENT_DATE - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
    (task_credit2, 'CRD-2083-00302', 'Credit Committee Loan Approval — Batch 12 (6 Applications)',
     'Prepare credit committee presentation for 6 loan applications in Batch 12. Include credit analysis, risk assessment, collateral valuation, and recommendation.',
     'pending', 'critical', 70, dept_credit, user_binod, user_binod, user_manager, user_ceo,
     'Loan Processing', ARRAY['credit-committee', 'loan', 'approval'], CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
    (task_adm1, 'ADM-2083-00118', 'Board Meeting Minutes — Ashwin 2083 Regular Meeting',
     'Prepare and circulate official minutes for the Ashwin 2083 regular board meeting held on 13 Ashwin. Include all resolutions, action items, and attendance record.',
     'assigned', 'high', 0, dept_admin, user_ceo, user_kamala, user_ceo, user_ceo,
     'Board/Meeting', ARRAY['board', 'minutes', 'urgent'], CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (task_rec1, 'REC-2083-00067', 'Overdue Member Follow-up — Batch 9 (21 Members)',
     'Contact 21 members with overdue installments (30-90 days) in Batch 9. Document contact attempts, responses, and payment commitments.',
     'in_progress', 'high', 35, dept_recovery, user_manager, user_bikash, user_manager, user_manager,
     'Recovery', ARRAY['recovery', 'members', 'overdue'], CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (task_hr1, 'HR-2083-00061', 'New Employee Onboarding — Priya Shrestha (Finance)',
     'Complete full onboarding for new Finance dept employee Priya Shrestha: ID creation, system access, orientation, policy acknowledgement, and department introduction.',
     'accepted', 'medium', 25, dept_hr, user_anita, user_anita, user_anita, user_ceo,
     'HR/Onboarding', ARRAY['onboarding', 'hr', 'new-employee'], CURRENT_DATE, CURRENT_DATE - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    (task_it1, 'IT-2083-00089', 'Weekly Server Backup Verification — Week 38',
     'Verify all scheduled backups completed successfully for week 38. Check backup integrity, storage capacity, and generate backup compliance report.',
     'in_progress', 'high', 40, dept_it, user_suresh, user_suresh, user_suresh, user_ceo,
     'IT/Infrastructure', ARRAY['backup', 'it', 'weekly'], CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (task_mem1, 'MEM-2083-00041', 'Member KYC Update Drive — Expired Documents',
     'Contact 142 members with expired KYC documents for renewal. Collect updated citizenship copies, photos, and signatures. Update member database.',
     'in_progress', 'medium', 55, dept_membership, user_puja, user_puja, user_manager, user_manager,
     'Membership/KYC', ARRAY['kyc', 'members', 'compliance'], CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE - INTERVAL '11 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
    (task_mkt1, 'MKT-2083-00023', 'Dashain 2083 Member Communication Newsletter',
     'Design and distribute the Dashain 2083 member newsletter. Include cooperative updates, financial highlights, and festive greetings.',
     'draft', 'low', 0, dept_marketing, user_puja, user_puja, user_manager, user_manager,
     'Marketing/Communication', ARRAY['newsletter', 'dashain', 'members'], CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE, CURRENT_TIMESTAMP)
  ON CONFLICT (task_number) DO NOTHING;

  -- Task assignments history
  INSERT INTO public.task_assignments (task_id, from_user_id, to_user_id, from_department_id, to_department_id, assigned_by, assignment_type, assigned_at) VALUES
    (task_fin1, user_ceo, user_sita, NULL, dept_finance, user_ceo, 'initial', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (task_fin2, user_ceo, user_sita, NULL, dept_finance, user_ceo, 'initial', CURRENT_TIMESTAMP - INTERVAL '15 days'),
    (task_credit1, user_binod, user_dipak, dept_credit, dept_credit, user_binod, 'initial', CURRENT_TIMESTAMP - INTERVAL '4 days'),
    (task_adm1, user_ceo, user_kamala, NULL, dept_admin, user_ceo, 'initial', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (task_rec1, user_manager, user_bikash, NULL, dept_recovery, user_manager, 'initial', CURRENT_TIMESTAMP - INTERVAL '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- Activity logs
  INSERT INTO public.task_activity_logs (task_id, user_id, action, new_value, created_at) VALUES
    (task_fin1, user_ceo, 'created', 'Task created', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (task_fin1, user_ceo, 'assigned', 'Assigned to Sita Rana', CURRENT_TIMESTAMP - INTERVAL '6 days' + INTERVAL '2 minutes'),
    (task_fin1, user_sita, 'accepted', 'Task accepted', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (task_fin1, user_sita, 'progress_changed', '25%', CURRENT_TIMESTAMP - INTERVAL '4 days'),
    (task_fin1, user_sita, 'progress_changed', '60%', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    (task_fin1, user_sita, 'progress_changed', '90%', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (task_fin1, user_sita, 'status_changed', 'under_review', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
    (task_fin2, user_ceo, 'created', 'Task created', CURRENT_TIMESTAMP - INTERVAL '15 days'),
    (task_fin2, user_sita, 'status_changed', 'blocked', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (task_credit1, user_binod, 'created', 'Task created', CURRENT_TIMESTAMP - INTERVAL '4 days'),
    (task_credit1, user_dipak, 'accepted', 'Task accepted', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    (task_adm1, user_ceo, 'created', 'Task created', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (task_rec1, user_manager, 'created', 'Task created', CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (task_rec1, user_bikash, 'accepted', 'Task accepted', CURRENT_TIMESTAMP - INTERVAL '9 days')
  ON CONFLICT (id) DO NOTHING;

  -- Subtasks for fin1
  INSERT INTO public.task_subtasks (task_id, title, is_completed, assigned_to, sort_order) VALUES
    (task_fin1, 'Collect branch-wise disbursement data', true, user_sita, 1),
    (task_fin1, 'Prepare category-wise breakdown', true, user_sita, 2),
    (task_fin1, 'Month-over-month comparison analysis', true, user_sita, 3),
    (task_fin1, 'Final report formatting and submission', false, user_sita, 4)
  ON CONFLICT (id) DO NOTHING;

  -- Notifications
  INSERT INTO public.notifications (user_id, task_id, notification_type, title, body) VALUES
    (user_ceo, task_fin1, 'approval_required', 'Approval Required', 'Monthly loan disbursement report (FIN-2083-00431) awaits your approval.'),
    (user_ceo, task_adm1, 'overdue', 'Task Overdue', 'ADM-2083-00118 — Board meeting minutes preparation is overdue by 2 days.'),
    (user_ceo, task_it1, 'new_assignment', 'New Assignment', 'Suresh Pradhan assigned IT-2083-00089 to you: Server backup verification.'),
    (user_sita, task_fin1, 'new_assignment', 'New Assignment', 'You have been assigned FIN-2083-00431: Monthly Loan Disbursement Report.'),
    (user_dipak, task_credit1, 'new_assignment', 'New Assignment', 'You have been assigned CRD-2083-00315: Field Verification — Lalitpur Branch.')
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion error: %', SQLERRM;
END $$;
