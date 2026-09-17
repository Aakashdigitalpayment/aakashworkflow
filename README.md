# AakashWorkFlow

Cooperative business automation and task management for **Aakash Cooperative Ltd.**
Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, and Supabase
(Postgres + Auth + Row Level Security).

## What it does

- **Task lifecycle** — create, assign, review, approve, complete, close, reopen.
  Tasks carry priority, category, department, tags, due dates, subtasks, comments
  and a per-task activity trail.
- **Approval chains** — configurable multi-level approval routing per task category
  (loan processing, procurement, HR onboarding).
- **Dashboards** — KPI counts, overdue and due-today queues, department workload,
  and a live activity feed.
- **Role-based access** — seven roles from `super_admin` down to `employee`, enforced
  in middleware and again in the database through RLS.
- **Bikram Sambat dates** — Gregorian dates are stored in Postgres; the UI renders
  Bikram Sambat (BS) throughout.

## Roles

| Role | Can do |
| --- | --- |
| `super_admin` | Everything, including changing any user's role, department and active status |
| `ceo`, `manager` | Manage tasks, departments, users, approval chains, automation |
| `department_head` | Act on tasks owned by their department |
| `officer`, `employee` | Act on tasks they created, are assigned, review or approve |
| `auditor` | Read audit and compliance surfaces |

Access is enforced in three layers: the sidebar hides what you cannot use, the
middleware redirects disallowed routes, and Supabase RLS is the authoritative
boundary. The first two are convenience; only RLS is a security guarantee.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then configure the server-safe Supabase variables used by this project:

```bash
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_JWKS_URL=...
```

The publishable key is safe for browser access; never expose `SUPABASE_SECRET_KEY` to
client components or prefix it with `NEXT_PUBLIC_`. The app also accepts the `_2`
variants used by the connected Vercel environment.

### 3. Apply database migrations

Migrations live in `supabase/migrations/` and must run in filename order:

| File | Purpose |
| --- | --- |
| `20260916145744_aakash_workflow_core.sql` | Enums, tables, indexes, helper functions, RLS policies, triggers |
| `20260916160000_approval_chains.sql` | Approval chain tables, policies, seed chains |
| `20260916170000_security_hardening.sql` | **Required.** Role checks read `user_profiles`, privilege-escalation guard, scoped RLS, notification/activity triggers, task-number sequence |
| `20260916171000_dev_seed_data.sql` | **Development only.** Demo departments, users with known passwords, sample tasks |

With the Supabase CLI:

```bash
supabase db push
```

Or paste them into the Supabase SQL editor, in the order above.

> To skip the demo data in production, delete `20260916171000_dev_seed_data.sql`
> or keep it off your production branch. It creates accounts with predictable
> passwords and must not exist in a live environment.

### 4. Run

```bash
npm run dev
```

Open <http://localhost:4028>.

## Creating the first administrator

New sign-ups always get the `employee` role — this is deliberate, so nobody can
self-promote. To bootstrap your first admin, either:

1. Insert the user through Supabase Auth, then set their role directly:

   ```sql
   UPDATE public.user_profiles SET role = 'super_admin' WHERE email = 'you@example.com';
   ```

2. Or run `20260916171000_dev_seed_data.sql`, sign in as the CEO, and change roles
   from **Administration → User Admin**.

## Demo accounts (development only)

`20260916171000_dev_seed_data.sql` creates these users (passwords are in that file):

| Role | Email |
| --- | --- |
| CEO / GM | `ceo@aakashcooperative.com.np` |
| Manager | `manager@aakashcooperative.com.np` |
| Department Head | `depthead@aakashcooperative.com.np` |
| Officer | `officer@aakashcooperative.com.np` |
| Employee | `employee@aakashcooperative.com.np` |
| Auditor | `auditor@aakashcooperative.com.np` |

The login screen only shows the autofill table when
`NEXT_PUBLIC_ENABLE_DEMO_LOGINS=true` **and** the matching
`NEXT_PUBLIC_DEMO_*_PASSWORD` variables are set. No plaintext passwords are
compiled into a production bundle.

## Responsive behaviour

The sidebar is a fixed rail from the `md` breakpoint up, where it can be
collapsed to icons. Below `md` it becomes an off-canvas drawer opened by the
hamburger in the top bar, and it closes automatically on navigation. Field staff
on phones get the full task list and detail panel rather than a squeezed desktop
layout.

## Project structure

```
src/
├── app/                        # App Router pages
│   ├── task-management/        # Task list, create modal, detail panel
│   ├── dashboard/              # KPIs, charts, queues, activity feed
│   ├── approval-chains/        # Approval chain configuration
│   └── ...                     # users, roles, departments, reports, settings
├── components/                 # AppLayout, Sidebar, Topbar, shared UI
├── contexts/AuthContext.tsx    # Session + profile
├── lib/
│   ├── access.ts               # Roles, route→role map, helpers
│   ├── tasks.ts                # Task data layer (CRUD, filtering, mapping)
│   ├── date.ts                 # Gregorian ↔ Bikram Sambat helpers
│   └── supabase/               # Browser and server clients
└── middleware.ts               # Auth + route-level role enforcement

supabase/migrations/            # Schema, policies, triggers, seed data
```

## Data flow

Pages never import mock data. Components call the functions in `src/lib/tasks.ts`,
which map the snake_case Postgres schema to the camelCase UI shape and let RLS
decide what the caller can see or change.

Side effects that must happen regardless of who triggered them — notifications and
activity-log entries — are written by Postgres triggers rather than by the client.
That keeps them accurate even if a client is bypassed, and avoids the RLS dead-end
where a user cannot insert a notification addressed to someone else.

`task_number` values come from `public.generate_task_number()` backed by a Postgres
sequence, so concurrent task creation cannot produce duplicates.

## Available modules

Wired to Supabase:

- Dashboard (KPIs, overdue, due today, activity feed, notification bell)
- Task Management (list, create, detail, status transitions, progress, subtasks,
  comments, activity, delete)
- Approval Chains
- Login / auth callback

Still using placeholder data — treat these as UI previews, not working features.
Each one carries a "Preview only" banner; remove the banner in the same change
that connects it to real data:

- Admin, User Admin, Users, Roles & Permissions, Departments
- Workflows, Templates, Pending Approvals, Notifications page
- Reports, Executive Reports, Activity Log, Compliance, Automation
- My Work, Inbox, Calendar
- Settings, Personal Settings, Cooperative Settings

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server on port 4028 |
| `npm run build` | Production build |
| `npm run serve` | Serve the production build |
| `npm test` | Unit tests for the access, task and date logic |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript, no emit |
| `npm run format` | Prettier |

## Tests

`npm test` covers the parts of the system where a silent bug is costly and no
database is needed:

- `tests/access.test.ts` — role normalisation and route gating, including that
  nested paths inherit their parent's guard, that `/users-guide` is not caught
  by the `/users` rule, and that unknown role strings are rejected rather than
  trusted.
- `tests/tasks.test.ts` — status/priority label round-tripping, filter
  composition, the `open` and `overdue` pseudo-statuses, and the status
  transition graph (approval is only reachable from review; every status is
  reachable from `draft`).
- `tests/date.test.ts` — Gregorian to Bikram Sambat conversion and the Baisakh
  fiscal-year boundary.

RLS policies are not covered by these tests. They need a Supabase instance; see
the security notes below for what to verify by hand.

## Security notes

- Role and department live in `public.user_profiles`, which is admin-controlled.
  They are **never** read from `auth.users.raw_user_meta_data`, because users can
  edit their own metadata.
- A database trigger blocks non-super-admins from changing their own role,
  department or active flag.
- Another trigger (`protect_task_routing_fields`) stops a task participant from
  rewiring `approver_id` to themselves and self-approving, or from flipping
  `is_confidential`.
- Reads on comments, activity, subtasks, attachments, assignments, collaborators
  and watchers go through `public.can_read_task()`, so the contents of a
  confidential task are not readable by users who cannot see the task itself.
- Tasks marked confidential are readable only by management and the people
  attached to them.
- Approval chain configuration is management-only write.
- A signed-in user with no profile (or a deactivated one) lands on
  `/account-inactive`, not `/login-screen` — the latter would redirect-loop
  against a still-valid session.

### Verifying RLS by hand

The unit tests do not exercise the database. On a staging project, check:

1. As an `employee`, `select * from tasks where is_confidential` returns
   management-owned confidential tasks only to their participants.
2. As an `employee`, `select * from task_comments` cannot read comments on a
   confidential task you are not attached to.
3. As an `employee`, `update tasks set approver_id = auth.uid() where id = ...`
   raises the routing-field exception.
4. As an `employee`, `update user_profiles set role = 'super_admin' where id =
   auth.uid()` is blocked.
5. As an `employee`, editing an approval chain is rejected.

### Before deploying to production

1. Rotate or delete the demo accounts if the seed migration was ever applied to a
   reachable environment.
2. Make sure `.env` is not committed. If it already is, purge it from git history —
   `git rm --cached .env`, then rewrite history or start a fresh repository.
3. Set `NEXT_PUBLIC_ENABLE_DEMO_LOGINS=false` (or leave it unset).
4. Review the `x-sb-token` fetch patch in `src/lib/supabase/client.ts`. It exists to
   carry the auth token through same-origin requests in embedded preview
   environments; on a normal domain it is unnecessary and repeats the token on every
   request.
