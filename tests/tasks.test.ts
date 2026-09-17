import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_TRANSITIONS,
  EMPTY_FILTERS,
  TASK_CATEGORIES,
  filterTasks,
  priorityEnum,
  priorityLabel,
  statusEnum,
  statusLabel,
  type Task,
  type TaskStatusEnum,
} from '../src/lib/tasks';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 'id-1',
    taskId: 'ADM-2083-00001',
    title: 'Sample task',
    department: 'Administration',
    departmentId: 'dept-adm',
    assignee: 'Sita Sharma',
    assigneeId: 'user-1',
    assigneeInitials: 'SS',
    priority: 'Medium',
    priorityEnum: 'medium',
    status: 'In Progress',
    statusEnum: 'in_progress',
    dueDate: null,
    startDate: null,
    createdDate: null,
    progress: 0,
    overdueDays: 0,
    category: 'General',
    createdBy: 'CEO',
    description: '',
    reviewer: '',
    approver: '',
    tags: [],
    subtaskCount: 0,
    subtaskDone: 0,
    commentCount: 0,
    attachmentCount: 0,
    isConfidential: false,
    estimatedHours: null,
    ...overrides,
  };
}

const isoDaysFromToday = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ── Status / priority label mapping ─────────────────────────────────────────

test('status labels round-trip through their enum', () => {
  for (const label of [
    'Draft',
    'Assigned',
    'Accepted',
    'In Progress',
    'Pending',
    'Blocked',
    'On Hold',
    'Under Review',
    'Changes Requested',
    'Approved',
    'Completed',
    'Closed',
    'Cancelled',
    'Reopened',
  ]) {
    assert.equal(statusLabel(statusEnum(label)), label, label);
  }
});

test('priority labels round-trip through their enum', () => {
  for (const label of ['Critical', 'High', 'Medium', 'Low'] as const) {
    assert.equal(priorityLabel(priorityEnum(label)), label, label);
  }
});

test('unknown status/priority values fall back rather than throwing', () => {
  assert.equal(statusEnum('nonsense'), 'draft');
  assert.equal(priorityEnum('Urgent'), 'medium');
  assert.equal(statusLabel('nonsense'), 'Draft');
  assert.equal(priorityLabel('nonsense'), 'Medium');
});

test('a database row with a null status never breaks the label lookup', () => {
  assert.equal(statusEnum(undefined as unknown as string), 'draft');
});

// ── Filtering ───────────────────────────────────────────────────────────────

test('empty filters return everything unchanged', () => {
  const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' })];
  assert.deepEqual(
    filterTasks(tasks, EMPTY_FILTERS).map((t) => t.id),
    ['a', 'b']
  );
});

test('search matches task id, title, assignee, department and tags', () => {
  const tasks = [
    makeTask({ id: 'a', taskId: 'FIN-2083-00001' }),
    makeTask({ id: 'b', title: 'Loan review' }),
    makeTask({ id: 'c', assignee: 'Hari Tamang' }),
    makeTask({ id: 'd', department: 'Credit' }),
    makeTask({ id: 'e', tags: ['urgent'] }),
  ];
  const search = (q: string) =>
    filterTasks(tasks, { ...EMPTY_FILTERS, search: q }).map((t) => t.id);

  assert.deepEqual(search('fin-2083'), ['a']);
  assert.deepEqual(search('loan'), ['b']);
  assert.deepEqual(search('hari'), ['c']);
  assert.deepEqual(search('credit'), ['d']);
  assert.deepEqual(search('urgent'), ['e']);
  assert.deepEqual(search('LOAN'), ['b'], 'search must be case-insensitive');
});

test('status filter matches the enum exactly', () => {
  const tasks = [
    makeTask({ id: 'a', statusEnum: 'in_progress' }),
    makeTask({ id: 'b', statusEnum: 'under_review' }),
  ];
  assert.deepEqual(
    filterTasks(tasks, { ...EMPTY_FILTERS, status: 'in_progress' }).map((t) => t.id),
    ['a']
  );
  assert.deepEqual(
    filterTasks(tasks, { ...EMPTY_FILTERS, status: 'approved' }).map((t) => t.id),
    []
  );
});

test('the "open" pseudo-status covers only unstarted work', () => {
  const tasks = [
    makeTask({ id: 'draft', statusEnum: 'draft' }),
    makeTask({ id: 'assigned', statusEnum: 'assigned' }),
    makeTask({ id: 'accepted', statusEnum: 'accepted' }),
    makeTask({ id: 'wip', statusEnum: 'in_progress' }),
    makeTask({ id: 'done', statusEnum: 'completed' }),
  ];
  assert.deepEqual(
    filterTasks(tasks, { ...EMPTY_FILTERS, status: 'open' }).map((t) => t.id),
    ['draft', 'assigned', 'accepted']
  );
});

test('the "overdue" pseudo-status excludes settled work', () => {
  const tasks = [
    makeTask({ id: 'live', statusEnum: 'in_progress', overdueDays: 3 }),
    makeTask({ id: 'done', statusEnum: 'completed', overdueDays: 3 }),
    makeTask({ id: 'closed', statusEnum: 'closed', overdueDays: 3 }),
    makeTask({ id: 'cancelled', statusEnum: 'cancelled', overdueDays: 3 }),
    makeTask({ id: 'ontime', statusEnum: 'in_progress', overdueDays: 0 }),
  ];
  assert.deepEqual(
    filterTasks(tasks, { ...EMPTY_FILTERS, status: 'overdue' }).map((t) => t.id),
    ['live'],
    'a completed task is not actionable even if its due date has passed'
  );
});

test('department, priority and category filters compose', () => {
  const tasks = [
    makeTask({
      id: 'match',
      departmentId: 'dept-fin',
      priorityEnum: 'high',
      category: TASK_CATEGORIES[0],
    }),
    makeTask({ id: 'other-priority', departmentId: 'dept-fin', priorityEnum: 'low' }),
    makeTask({ id: 'other-dept', departmentId: 'dept-adm', priorityEnum: 'high' }),
  ];
  const out = filterTasks(tasks, {
    ...EMPTY_FILTERS,
    departmentId: 'dept-fin',
    priority: 'high',
    category: TASK_CATEGORIES[0],
  });
  assert.deepEqual(
    out.map((t) => t.id),
    ['match']
  );
});

test('due-date filters bucket by offset from today', () => {
  const tasks = [
    makeTask({ id: 'today', dueDate: isoDaysFromToday(0) }),
    makeTask({ id: 'tomorrow', dueDate: isoDaysFromToday(1) }),
    makeTask({ id: 'nextweek', dueDate: isoDaysFromToday(5) }),
    makeTask({ id: 'none', dueDate: null }),
  ];
  const due = (v: string) =>
    filterTasks(tasks, { ...EMPTY_FILTERS, dueDate: v }).map((t) => t.id);

  assert.deepEqual(due('today'), ['today']);
  assert.deepEqual(due('tomorrow'), ['tomorrow']);
  assert.deepEqual(due('this-week'), ['today', 'tomorrow', 'nextweek']);
  assert.deepEqual(due('no-date'), ['none']);
});

// ── Status transition graph ─────────────────────────────────────────────────

test('every transition target is a real status', () => {
  const valid = new Set(Object.keys(ALLOWED_TRANSITIONS) as TaskStatusEnum[]);
  for (const [from, edges] of Object.entries(ALLOWED_TRANSITIONS)) {
    for (const edge of edges ?? []) {
      assert.ok(valid.has(edge.to), `${from} -> ${edge.to} is not a known status`);
      assert.ok(edge.label.length > 0, `${from} -> ${edge.to} has no label`);
    }
  }
});

test('approval can only follow review', () => {
  const canReachApproved = Object.entries(ALLOWED_TRANSITIONS)
    .filter(([, edges]) => (edges ?? []).some((e) => e.to === 'approved'))
    .map(([from]) => from);
  assert.deepEqual(canReachApproved, ['under_review']);
});

test('draft and assigned cannot jump straight to approved or completed', () => {
  for (const from of ['draft', 'assigned'] as TaskStatusEnum[]) {
    const targets = (ALLOWED_TRANSITIONS[from] ?? []).map((e) => e.to);
    assert.ok(!targets.includes('approved'), `${from} must not reach approved directly`);
    assert.ok(!targets.includes('completed'), `${from} must not reach completed directly`);
  }
});

test('settled statuses can be reopened', () => {
  for (const from of ['completed', 'closed', 'cancelled'] as TaskStatusEnum[]) {
    const targets = (ALLOWED_TRANSITIONS[from] ?? []).map((e) => e.to);
    assert.ok(targets.includes('reopened'), `${from} should be reopenable`);
  }
});

test('terminal states are reachable — no dead-end workflow', () => {
  const reachable = new Set<TaskStatusEnum>(['draft']);
  let grew = true;
  while (grew) {
    grew = false;
    for (const from of [...reachable]) {
      for (const edge of ALLOWED_TRANSITIONS[from] ?? []) {
        if (!reachable.has(edge.to)) {
          reachable.add(edge.to);
          grew = true;
        }
      }
    }
  }
  const all = Object.keys(ALLOWED_TRANSITIONS) as TaskStatusEnum[];
  const unreachable = all.filter((s) => !reachable.has(s));
  assert.deepEqual(unreachable, [], `unreachable statuses: ${unreachable.join(', ')}`);
});
