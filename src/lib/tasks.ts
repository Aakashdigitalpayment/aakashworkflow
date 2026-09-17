'use client';

import { createClient } from '@/lib/supabase/client';
import { fiscalYearLabel } from '@/lib/date';

export type TaskStatusEnum =
  | 'draft'
  | 'assigned'
  | 'accepted'
  | 'in_progress'
  | 'pending'
  | 'blocked'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'completed'
  | 'closed'
  | 'cancelled'
  | 'on_hold'
  | 'reopened';

export type TaskPriorityEnum = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatusLabel =
  | 'Draft'
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Pending'
  | 'Blocked'
  | 'Under Review'
  | 'Changes Requested'
  | 'Approved'
  | 'Completed'
  | 'Closed'
  | 'Cancelled'
  | 'On Hold'
  | 'Reopened';

export type TaskPriorityLabel = 'Critical' | 'High' | 'Medium' | 'Low';

export const TASK_CATEGORIES = [
  'Financial Reporting',
  'Loan Processing',
  'Board/Meeting',
  'Recovery',
  'HR/Onboarding',
  'HR/Performance',
  'IT/Infrastructure',
  'Procurement',
  'Marketing/Communication',
  'Membership/KYC',
  'Audit/Compliance',
  'Other',
];

/**
 * URL/KPI entry points use pseudo-statuses (`overdue`, `open`) alongside real
 * `task_status` values, so filters stay string-based and are resolved here.
 */
export interface TaskFilters {
  search: string;
  departmentId: string;
  status: string;
  priority: string;
  dueDate: string;
  category: string;
}

export const EMPTY_FILTERS: TaskFilters = {
  search: '',
  departmentId: '',
  status: '',
  priority: '',
  dueDate: '',
  category: '',
};

const UNSETTLED: TaskStatusEnum[] = ['completed', 'closed', 'cancelled'];

function withinDays(iso: string | null, from: number, to: number): boolean {
  if (!iso) return false;
  const target = new Date(`${iso}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today.getTime()) / 86_400_000);
  return diff >= from && diff <= to;
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  let result = tasks;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.taskId.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (filters.departmentId) {
    result = result.filter((t) => t.departmentId === filters.departmentId);
  }

  if (filters.status === 'overdue') {
    result = result.filter((t) => t.overdueDays > 0);
  } else if (filters.status === 'open') {
    result = result.filter((t) => ['draft', 'assigned', 'accepted'].includes(t.statusEnum));
  } else if (filters.status) {
    result = result.filter((t) => t.statusEnum === filters.status);
  }

  if (filters.priority) {
    result = result.filter((t) => t.priorityEnum === filters.priority);
  }

  if (filters.category) {
    result = result.filter((t) => t.category === filters.category);
  }

  switch (filters.dueDate) {
    case 'overdue':
      result = result.filter((t) => t.overdueDays > 0);
      break;
    case 'today':
      result = result.filter((t) => withinDays(t.dueDate, 0, 0));
      break;
    case 'tomorrow':
      result = result.filter((t) => withinDays(t.dueDate, 1, 1));
      break;
    case 'this-week':
      result = result.filter((t) => withinDays(t.dueDate, 0, 7));
      break;
    case 'no-date':
      result = result.filter((t) => !t.dueDate);
      break;
  }

  return result.filter((t) => !(filters.status === 'overdue' && UNSETTLED.includes(t.statusEnum)));
}

/** UI-facing task shape. Built from the `tasks` table plus its relations. */
export interface Task {
  id: string;
  taskId: string;
  title: string;
  department: string;
  departmentId: string | null;
  assignee: string;
  assigneeId: string | null;
  assigneeInitials: string;
  priority: TaskPriorityLabel;
  priorityEnum: TaskPriorityEnum;
  status: TaskStatusLabel;
  statusEnum: TaskStatusEnum;
  /** Gregorian ISO date (YYYY-MM-DD). Render via `@/lib/date` for Bikram Sambat. */
  dueDate: string | null;
  startDate: string | null;
  createdDate: string | null;
  progress: number;
  overdueDays: number;
  category: string;
  createdBy: string;
  description: string;
  reviewer: string;
  approver: string;
  tags: string[];
  subtaskCount: number;
  subtaskDone: number;
  commentCount: number;
  attachmentCount: number;
  isConfidential: boolean;
  estimatedHours: number | null;
}

export interface DirectoryUser {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  departmentId: string | null;
  departmentName: string | null;
  position: string | null;
  role: string;
}

export interface DirectoryDepartment {
  id: string;
  name: string;
  code: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  departmentId: string | null;
  category: string;
  assigneeId: string | null;
  reviewerId: string | null;
  approverId: string | null;
  priority: TaskPriorityEnum;
  status: TaskStatusEnum;
  startDate: string | null;
  dueDate: string;
  estimatedHours: number | null;
  isConfidential: boolean;
  tags: string[];
  fiscalYear?: string;
}

const STATUS_ENUM_TO_LABEL: Record<TaskStatusEnum, TaskStatusLabel> = {
  draft: 'Draft',
  assigned: 'Assigned',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  pending: 'Pending',
  blocked: 'Blocked',
  under_review: 'Under Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  completed: 'Completed',
  closed: 'Closed',
  cancelled: 'Cancelled',
  on_hold: 'On Hold',
  reopened: 'Reopened',
};

const STATUS_LABEL_TO_ENUM = Object.fromEntries(
  Object.entries(STATUS_ENUM_TO_LABEL).map(([enumValue, label]) => [label, enumValue])
) as Record<TaskStatusLabel, TaskStatusEnum>;

const PRIORITY_ENUM_TO_LABEL: Record<TaskPriorityEnum, TaskPriorityLabel> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const PRIORITY_LABEL_TO_ENUM = Object.fromEntries(
  Object.entries(PRIORITY_ENUM_TO_LABEL).map(([enumValue, label]) => [label, enumValue])
) as Record<TaskPriorityLabel, TaskPriorityEnum>;

export const TASK_STATUS_LABELS = Object.values(STATUS_ENUM_TO_LABEL);
export const TASK_PRIORITY_LABELS = Object.values(PRIORITY_ENUM_TO_LABEL);

export function statusLabel(value: string): TaskStatusLabel {
  return STATUS_ENUM_TO_LABEL[value as TaskStatusEnum] ?? 'Draft';
}

export function statusEnum(value: string): TaskStatusEnum {
  return STATUS_LABEL_TO_ENUM[value as TaskStatusLabel] ?? 'draft';
}

export function priorityLabel(value: string): TaskPriorityLabel {
  return PRIORITY_ENUM_TO_LABEL[value as TaskPriorityEnum] ?? 'Medium';
}

export function priorityEnum(value: string): TaskPriorityEnum {
  return PRIORITY_LABEL_TO_ENUM[value as TaskPriorityLabel] ?? 'medium';
}

/**
 * Status transitions the detail panel offers, keyed by current status.
 * Mirrors the lifecycle encoded in `task_status`.
 */
export const ALLOWED_TRANSITIONS: Partial<
  Record<
    TaskStatusEnum,
    { to: TaskStatusEnum; label: string; icon: string; tone: 'primary' | 'danger' }[]
  >
> = {
  draft: [
    { to: 'assigned', label: 'Assign', icon: 'UserPlusIcon', tone: 'primary' },
    { to: 'cancelled', label: 'Cancel', icon: 'XCircleIcon', tone: 'danger' },
  ],
  assigned: [
    { to: 'accepted', label: 'Accept', icon: 'ClipboardDocumentCheckIcon', tone: 'primary' },
    { to: 'cancelled', label: 'Cancel', icon: 'XCircleIcon', tone: 'danger' },
  ],
  accepted: [
    { to: 'in_progress', label: 'Start Work', icon: 'PlayIcon', tone: 'primary' },
    { to: 'on_hold', label: 'Put On Hold', icon: 'PauseIcon', tone: 'danger' },
  ],
  in_progress: [
    { to: 'under_review', label: 'Send For Review', icon: 'MagnifyingGlassIcon', tone: 'primary' },
    { to: 'blocked', label: 'Mark Blocked', icon: 'ExclamationTriangleIcon', tone: 'danger' },
    { to: 'pending', label: 'Mark Pending', icon: 'ClockIcon', tone: 'danger' },
  ],
  pending: [
    { to: 'in_progress', label: 'Resume', icon: 'PlayIcon', tone: 'primary' },
    { to: 'cancelled', label: 'Cancel', icon: 'XCircleIcon', tone: 'danger' },
  ],
  blocked: [
    { to: 'in_progress', label: 'Unblock & Resume', icon: 'PlayIcon', tone: 'primary' },
    { to: 'cancelled', label: 'Cancel', icon: 'XCircleIcon', tone: 'danger' },
  ],
  under_review: [
    { to: 'approved', label: 'Approve', icon: 'CheckBadgeIcon', tone: 'primary' },
    {
      to: 'changes_requested',
      label: 'Request Changes',
      icon: 'ArrowUturnLeftIcon',
      tone: 'danger',
    },
  ],
  changes_requested: [
    { to: 'in_progress', label: 'Resume Work', icon: 'PlayIcon', tone: 'primary' },
    { to: 'cancelled', label: 'Cancel', icon: 'XCircleIcon', tone: 'danger' },
  ],
  approved: [
    { to: 'completed', label: 'Mark Completed', icon: 'CheckCircleIcon', tone: 'primary' },
    { to: 'closed', label: 'Close Task', icon: 'ArchiveBoxIcon', tone: 'primary' },
  ],
  on_hold: [
    { to: 'in_progress', label: 'Resume', icon: 'PlayIcon', tone: 'primary' },
    { to: 'cancelled', label: 'Cancel', icon: 'XCircleIcon', tone: 'danger' },
  ],
  completed: [
    { to: 'closed', label: 'Close Task', icon: 'ArchiveBoxIcon', tone: 'primary' },
    { to: 'reopened', label: 'Reopen', icon: 'ArrowPathIcon', tone: 'danger' },
  ],
  closed: [{ to: 'reopened', label: 'Reopen', icon: 'ArrowPathIcon', tone: 'primary' }],
  cancelled: [{ to: 'reopened', label: 'Reopen', icon: 'ArrowPathIcon', tone: 'primary' }],
  reopened: [{ to: 'in_progress', label: 'Resume Work', icon: 'PlayIcon', tone: 'primary' }],
};

const TASK_SELECT = `
  id, task_number, title, description, status, priority, progress, category, tags,
  start_date, due_date, created_at, is_confidential, estimated_hours,
  assignee:user_profiles!tasks_assigned_to_fkey(id, full_name, avatar_initials),
  reviewer:user_profiles!tasks_reviewer_id_fkey(id, full_name),
  approver:user_profiles!tasks_approver_id_fkey(id, full_name),
  creator:user_profiles!tasks_created_by_fkey(id, full_name),
  departments(id, name),
  task_subtasks(count),
  task_comments(count),
  task_attachments(count)
`;

function relatedName(value: any): string {
  if (Array.isArray(value)) return value[0]?.full_name ?? '';
  return value?.full_name ?? '';
}

function relatedId(value: any): string | null {
  if (Array.isArray(value)) return value[0]?.id ?? null;
  return value?.id ?? null;
}

function relatedCount(value: any): number {
  if (Array.isArray(value)) return value[0]?.count ?? 0;
  return value?.count ?? 0;
}

function initialsFrom(name: string): string {
  if (!name) return '—';
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function mapTaskRow(row: any): Task {
  const dueDate: string | null = row.due_date ?? null;
  const settledStatuses: TaskStatusEnum[] = ['completed', 'closed', 'cancelled'];
  let overdueDays = 0;

  if (dueDate && !settledStatuses.includes(row.status)) {
    const due = new Date(`${dueDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    overdueDays = Math.max(0, Math.round((today.getTime() - due.getTime()) / 86_400_000));
  }

  const assigneeName = relatedName(row.assignee);

  return {
    id: row.id,
    taskId: row.task_number,
    title: row.title,
    department: row.departments?.name ?? '—',
    departmentId: row.departments?.id ?? null,
    assignee: assigneeName || 'Unassigned',
    assigneeId: relatedId(row.assignee),
    assigneeInitials:
      (Array.isArray(row.assignee)
        ? row.assignee[0]?.avatar_initials
        : row.assignee?.avatar_initials) || initialsFrom(assigneeName),
    priority: priorityLabel(row.priority),
    priorityEnum: (row.priority ?? 'medium') as TaskPriorityEnum,
    status: statusLabel(row.status),
    statusEnum: (row.status ?? 'draft') as TaskStatusEnum,
    dueDate,
    startDate: row.start_date ?? null,
    createdDate: row.created_at ?? null,
    progress: row.progress ?? 0,
    overdueDays,
    category: row.category ?? '—',
    createdBy: relatedName(row.creator) || '—',
    description: row.description ?? '',
    reviewer: relatedName(row.reviewer) || 'Not set',
    approver: relatedName(row.approver) || 'Not set',
    tags: row.tags ?? [],
    subtaskCount: relatedCount(row.task_subtasks),
    subtaskDone: 0,
    commentCount: relatedCount(row.task_comments),
    attachmentCount: relatedCount(row.task_attachments),
    isConfidential: Boolean(row.is_confidential),
    estimatedHours: row.estimated_hours ?? null,
  };
}

/** Loads every task the caller is allowed to see (RLS decides the scope). */
export async function fetchTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const tasks = (data ?? []).map(mapTaskRow);

  if (tasks.length > 0) {
    const { data: subtasks } = await supabase
      .from('task_subtasks')
      .select('task_id, is_completed')
      .in(
        'task_id',
        tasks.map((t: Task) => t.id)
      );

    const totals = new Map<string, { total: number; done: number }>();
    for (const row of subtasks ?? []) {
      const entry = totals.get(row.task_id) ?? { total: 0, done: 0 };
      entry.total += 1;
      if (row.is_completed) entry.done += 1;
      totals.set(row.task_id, entry);
    }
    for (const task of tasks) {
      const entry = totals.get(task.id);
      if (entry) {
        task.subtaskCount = entry.total;
        task.subtaskDone = entry.done;
      }
    }
  }

  return tasks;
}

/** Departments and people for the assignment pickers. */
export async function fetchTaskDirectory(): Promise<{
  departments: DirectoryDepartment[];
  users: DirectoryUser[];
}> {
  const supabase = createClient();

  const [departmentsResult, usersResult] = await Promise.all([
    supabase.from('departments').select('id, name, code').eq('is_active', true).order('name'),
    supabase
      .from('user_profiles')
      .select(
        'id, full_name, email, avatar_initials, department_id, position, role, departments(id, name)'
      )
      .eq('is_active', true)
      .order('full_name'),
  ]);

  if (departmentsResult.error) throw new Error(departmentsResult.error.message);
  if (usersResult.error) throw new Error(usersResult.error.message);

  return {
    departments: departmentsResult.data ?? [],
    users: (usersResult.data ?? []).map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      initials: row.avatar_initials || initialsFrom(row.full_name),
      email: row.email,
      departmentId: row.department_id,
      departmentName: row.departments?.name ?? null,
      position: row.position,
      role: row.role,
    })),
  };
}

export async function createTask(
  input: CreateTaskInput
): Promise<{ id: string; taskNumber: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to create a task.');

  let departmentCode = 'GEN';
  if (input.departmentId) {
    const { data: dept } = await supabase
      .from('departments')
      .select('code')
      .eq('id', input.departmentId)
      .maybeSingle();
    if (dept?.code) departmentCode = dept.code;
  }

  // The sequence behind this function makes concurrent creation collision-free.
  const { data: taskNumber, error: numberError } = await supabase.rpc('generate_task_number', {
    p_dept_code: departmentCode,
    p_fiscal_year: input.fiscalYear || fiscalYearLabel(),
  });
  if (numberError) throw new Error(numberError.message);

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      task_number: taskNumber,
      title: input.title,
      description: input.description || null,
      department_id: input.departmentId,
      category: input.category || null,
      status: input.status,
      priority: input.priority,
      assigned_to: input.assigneeId,
      reviewer_id: input.reviewerId,
      approver_id: input.approverId,
      start_date: input.startDate,
      due_date: input.dueDate,
      estimated_hours: input.estimatedHours,
      is_confidential: input.isConfidential,
      tags: input.tags,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  if (input.assigneeId) {
    await supabase.from('task_assignments').insert({
      task_id: data.id,
      to_user_id: input.assigneeId,
      to_department_id: input.departmentId,
      assigned_by: user.id,
      assignment_type: 'initial',
    });
  }

  // Notifications and the activity-log entry are written by database triggers
  // (see 20260916170000_security_hardening.sql), not by the client.
  return { id: data.id, taskNumber: taskNumber as string };
}

export async function updateTaskStatus(id: string, status: TaskStatusEnum): Promise<void> {
  const supabase = createClient();
  const patch: Record<string, unknown> = { status };
  if (status === 'completed') patch.completed_date = new Date().toISOString();

  const { error } = await supabase.from('tasks').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateTaskProgress(id: string, progress: number): Promise<void> {
  const supabase = createClient();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const { error } = await supabase.from('tasks').update({ progress: clamped }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export interface TaskActivity {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  userName: string;
  createdAt: string;
}

export async function fetchTaskActivity(taskId: string): Promise<TaskActivity[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('task_activity_logs')
    .select('id, action, old_value, new_value, created_at, user_profiles(full_name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    action: row.action,
    oldValue: row.old_value,
    newValue: row.new_value,
    userName: row.user_profiles?.full_name ?? 'System',
    createdAt: row.created_at,
  }));
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  initials: string;
  content: string;
  createdAt: string;
}

export async function fetchTaskComments(taskId: string): Promise<TaskComment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('task_comments')
    .select('id, user_id, content, created_at, user_profiles(full_name, avatar_initials)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_profiles?.full_name ?? 'Unknown',
    initials:
      row.user_profiles?.avatar_initials || initialsFrom(row.user_profiles?.full_name ?? ''),
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function postComment(taskId: string, content: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to comment.');

  const { error } = await supabase
    .from('task_comments')
    .insert({ task_id: taskId, user_id: user.id, content });
  if (error) throw new Error(error.message);
}

export interface TaskSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
  assignedTo: string | null;
  sortOrder: number;
}

export async function fetchTaskSubtasks(taskId: string): Promise<TaskSubtask[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('task_subtasks')
    .select('id, title, is_completed, sort_order, assigned_to')
    .eq('task_id', taskId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    isCompleted: row.is_completed ?? false,
    assignedTo: row.assigned_to,
    sortOrder: row.sort_order ?? 0,
  }));
}

export async function addSubtask(taskId: string, title: string, sortOrder: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('task_subtasks')
    .insert({ task_id: taskId, title, sort_order: sortOrder });
  if (error) throw new Error(error.message);
}

export async function setSubtaskCompleted(subtaskId: string, isCompleted: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('task_subtasks')
    .update({ is_completed: isCompleted })
    .eq('id', subtaskId);
  if (error) throw new Error(error.message);
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('task_subtasks').delete().eq('id', subtaskId);
  if (error) throw new Error(error.message);
}
