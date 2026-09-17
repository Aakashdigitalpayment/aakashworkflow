# AakashWorkFlow — repository notes

Cooperative task management for Aakash Cooperative Ltd.
Next.js 15 App Router · React 19 · TypeScript · Tailwind · Supabase (Postgres/Auth/RLS).

## Commands

- `npm run dev` — dev server on port 4028
- `npm run build` — production build
- `npm test` — unit tests (Node's test runner via `tsx`; `.ts` extensions must
  be omitted from test imports or `tsc` rejects them)
- `npx tsc --noEmit` — type check
- `npm run lint` — ESLint. Note the repo uses a legacy `.eslintrc` config that
  ESLint 9 will not read by default; run with `ESLINT_USE_FLAT_CONFIG=false`.
  Pre-existing Prettier formatting violations exist across many pages — do not
  reformat files you are not otherwise changing.


## Architecture

- **Access control lives in three places, in order of authority:**
  1. `supabase/migrations/*.sql` RLS policies — the real security boundary.
  2. `src/middleware.ts` — redirects unauthenticated users and enforces
     `ROUTE_ACCESS` from `src/lib/access.ts`.
  3. `src/components/Sidebar.tsx` — hides navigation. UX only, never a boundary.
- **Roles are stored in `public.user_profiles.role`, never in auth metadata.**
  `raw_user_meta_data` is client-editable, so reading a role from it is a
  privilege-escalation hole. The helpers `public.is_management()`,
  `is_super_admin()`, `is_auditor()` and `is_task_participant()` all read
  `user_profiles`.
- **New sign-ups always get `employee`.** `handle_new_user()` ignores metadata
  roles on purpose. To make someone an admin, update `user_profiles` directly or
  use User Admin as an existing super admin.
- **Side effects that must not be blockable by RLS run in Postgres triggers** —
  `notify_task_event` and `audit_task_activity` in
  `20260916170000_security_hardening.sql`. Do not move notification or activity
  creation into client code; a user cannot insert a notification addressed to
  someone else, so it would silently fail.
- **Child-table reads are scoped, not open.** The core migration created
  `task_comments`, `task_activity_logs`, `task_subtasks`, `task_attachments`,
  `task_assignments`, `task_collaborators` and `task_watchers` with
  `FOR SELECT USING (true)`, which leaked the contents of confidential tasks to
  anyone. `public.can_read_task()` plus section 15 of the hardening migration
  closes that. Any new task child table needs the same treatment.
- **Routing columns are guarded by a trigger.** `protect_task_routing_fields()`
  stops a non-management, non-creator participant from rewriting `approver_id`
  (self-approval), `assigned_to`, `reviewer_id`, `is_confidential` or
  `created_by`. The RLS `UPDATE` policy is participant-wide, so without the
  trigger any assignee could self-approve.
- **`task_number` comes from `public.generate_task_number()`** (sequence-backed).
  Never generate it client-side — `Date.now()`-based schemes collide.

## Data layer convention

Pages and components must not import mock data. They call functions in
`src/lib/tasks.ts`, which:

- map snake_case Postgres rows to the camelCase `Task` UI type,
- expose `statusEnum`/`statusLabel` and `priorityEnum`/`priorityLabel` pairs,
- keep filtering in `filterTasks()` so URL-driven and UI-driven filters agree.

Sidebar/KPI entry points use pseudo-statuses (`overdue`, `open`) in the `status`
filter alongside real `task_status` values. `filterTasks()` resolves both.

## Dates

Gregorian dates are stored in Postgres (`DATE`). The UI always renders Bikram
Sambat via `src/lib/date.ts` (`bsLongDate`, `bsShortDate`, `bsDateTime`,
`toBsDate`, `fiscalYearLabel`). Do not format task dates with
`toLocaleDateString` — that reintroduces the AD/BS inconsistency.

Note the BS fiscal year turns over at Baisakh (mid-April), not 1 January, which
is why `fiscalYearLabel()` reads the BS year rather than the Gregorian one.

## Module status

Wired to Supabase: dashboard components, task management, approval chains, auth.

Everything else (Admin, User Admin, Users, Roles, Departments, Workflows,
Templates, Pending Approvals, Notifications page, Reports, Executive Reports,
Activity Log, Compliance, Automation, My Work, Inbox, Calendar, Settings,
Personal Settings, Cooperative Settings) renders sample data only. Each of those
pages starts with `<PreviewNotice />` stating that changes are not saved. Keep
that banner until the module is actually wired — silently-failing buttons cost
user trust. Remove the banner in the same change that connects real data.

When wiring a new module, follow the existing pattern: add a data layer in
`src/lib/`, convert the page to fetch with loading/error/retry states, drop the
`PreviewNotice`, and let RLS scope the results.

## UI conventions

- Loading states use skeleton placeholders, not spinners.
- A failed fetch must show an error with a retry, never render as zeros or an
  empty list. A silent zero is indistinguishable from a real zero in a
  cooperative's operations dashboard.
- Use `console.error` for failures (the `no-console` rule allows it).

## Migrations

Applied in filename order:

1. `20260916145744_aakash_workflow_core.sql`
2. `20260916160000_approval_chains.sql`
3. `20260916170000_security_hardening.sql` — required
4. `20260916171000_dev_seed_data.sql` — dev only, known passwords

The seed migration must not reach production. Demo passwords are also gated in
the login UI behind `NEXT_PUBLIC_ENABLE_DEMO_LOGINS` so they never enter a
production bundle.

## Known gaps

- Task attachments: `task_attachments` rows exist but there is no Storage bucket,
  upload or download wired up.
- Row-level bulk actions other than delete are intentionally not implemented.
- The `x-sb-token` fetch monkey-patch in `src/lib/supabase/client.ts` exists for
  embedded preview environments; review before a normal-domain production deploy.
