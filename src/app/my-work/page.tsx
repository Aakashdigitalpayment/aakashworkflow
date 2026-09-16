'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

// ─── Type Definitions ────────────────────────────────────────────────────────

interface WorkTask {
  id: string;
  title: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  statusClass: string;
  dueLabel: string;
  dueLabelClass: string;
  progress: number;
  assignedBy: string;
  category: string;
  isOverdue?: boolean;
  waitingFor?: string;
  completedToday?: boolean;
}

// Filter keys that map to each stat card
type FilterKey = 'all' | 'active' | 'overdue' | 'dueToday' | 'waiting' | 'completed';

// ─── Mock Task Data ───────────────────────────────────────────────────────────

const allTasks: WorkTask[] = [
  // Active / In-Progress tasks
  {
    id: 'ADM-2083-00125',
    title: 'Annual General Meeting — Agenda Preparation',
    department: 'Administration',
    priority: 'High',
    status: 'In Progress',
    statusClass: 'status-inprogress',
    dueLabel: 'Due Today',
    dueLabelClass: 'text-red-600 bg-red-50',
    progress: 60,
    assignedBy: 'Rajesh Kumar Shrestha',
    category: 'Meeting',
  },
  {
    id: 'FIN-2083-00431',
    title: 'Monthly MIS Report — Shrawan 2083',
    department: 'Finance',
    priority: 'Critical',
    status: 'Under Review',
    statusClass: 'status-review',
    dueLabel: 'Due Tomorrow',
    dueLabelClass: 'text-amber-600 bg-amber-50',
    progress: 90,
    assignedBy: 'Sita Sharma',
    category: 'Reporting',
  },
  {
    id: 'HR-2083-00089',
    title: 'New Employee Onboarding — Documentation',
    department: 'HR',
    priority: 'Medium',
    status: 'Accepted',
    statusClass: 'status-accepted',
    dueLabel: 'Due in 3 days',
    dueLabelClass: 'text-blue-600 bg-blue-50',
    progress: 20,
    assignedBy: 'Mohan Thapa',
    category: 'HR Process',
  },
  // Overdue task
  {
    id: 'CRD-2083-00187',
    title: 'Loan Application Review — Hari Bahadur Tamang',
    department: 'Credit',
    priority: 'High',
    status: 'Blocked',
    statusClass: 'status-blocked',
    dueLabel: 'Overdue 2 days',
    dueLabelClass: 'text-red-700 bg-red-100',
    progress: 45,
    assignedBy: 'Rajesh Kumar Shrestha',
    category: 'Loan',
    isOverdue: true,
    waitingFor: 'Waiting for Credit Department data',
  },
  // Waiting for others
  {
    id: 'REC-2083-00056',
    title: 'Recovery Report — Bhadra 2083',
    department: 'Recovery',
    priority: 'High',
    status: 'Pending',
    statusClass: 'status-pending',
    dueLabel: 'Due in 5 days',
    dueLabelClass: 'text-blue-600 bg-blue-50',
    progress: 70,
    assignedBy: 'Rajesh Kumar Shrestha',
    category: 'Recovery',
    waitingFor: 'Waiting for Finance Department approval',
  },
  // Completed today
  {
    id: 'ADM-2083-00119',
    title: 'Board Meeting Notice — Kartik 2083',
    department: 'Administration',
    priority: 'Medium',
    status: 'Completed',
    statusClass: 'status-completed',
    dueLabel: 'Completed',
    dueLabelClass: 'text-green-700 bg-green-50',
    progress: 100,
    assignedBy: 'Rajesh Kumar Shrestha',
    category: 'Meeting',
    completedToday: true,
  },
];

// ─── Priority badge colour mapping ───────────────────────────────────────────
const priorityColors: Record<string, string> = {
  Critical: 'priority-critical',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

// ─── TaskCard Component ───────────────────────────────────────────────────────
// Renders a single task row with expandable detail section.
function TaskCard({ task, showWaiting = false }: { task: WorkTask; showWaiting?: boolean }) {
  // Toggle expanded state to show/hide action buttons and assignee info
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      className={`bg-card border rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        task.isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border'
      }`}
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Circular progress ring — shows task completion percentage */}
        <div className="relative flex-shrink-0 w-10 h-10 mt-0.5">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            {/* Background track */}
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            {/* Foreground progress arc */}
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke={task.isOverdue ? '#ef4444' : task.progress === 100 ? '#16a34a' : '#1e40af'}
              strokeWidth="3"
              strokeDasharray={`${(task.progress / 100) * 94.2} 94.2`}
              strokeLinecap="round"
            />
          </svg>
          {/* Percentage label inside the ring */}
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
            {task.progress}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Task ID + title row with priority & status badges */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground font-mono mb-0.5">{task.id}</p>
              <h3 className="text-sm font-semibold text-foreground leading-snug">{task.title}</h3>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${task.statusClass}`}>
                {task.status}
              </span>
            </div>
          </div>

          {/* Department, category, and due-date metadata row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <AppIcon name="BuildingOffice2Icon" size={12} />
              {task.department}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <AppIcon name="TagIcon" size={12} />
              {task.category}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${task.dueLabelClass}`}>
              {task.dueLabel}
            </span>
          </div>

          {/* Waiting-for banner — only shown when task is blocked on someone else */}
          {showWaiting && task.waitingFor && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
              <AppIcon name="ClockIcon" size={12} />
              <span>{task.waitingFor}</span>
            </div>
          )}

          {/* Expanded section — shown on card click */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                Assigned by <span className="font-semibold text-foreground">{task.assignedBy}</span>
              </span>
              <div className="flex items-center gap-2">
                {/* Update Progress button — placeholder for future modal */}
                <button
                  onClick={(e) => e.stopPropagation()} // prevent card toggle
                  className="text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Update Progress
                </button>
                {/* Add Comment button — placeholder for future comment flow */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-border transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SectionHeader Component ──────────────────────────────────────────────────
// Renders a labelled section divider with an icon and task count badge.
function SectionHeader({ icon, title, count, color = 'text-foreground' }: {
  icon: string; title: string; count: number; color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <AppIcon name={icon as any} size={16} className={color} />
      <h2 className={`text-sm font-bold ${color}`}>{title}</h2>
      <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

// ─── Empty State Component ────────────────────────────────────────────────────
// Shown when the active filter returns zero tasks.
function EmptyState({ filterLabel }: { filterLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
        <AppIcon name="CheckCircleIcon" size={24} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">No tasks in &quot;{filterLabel}&quot;</p>
      <p className="text-xs text-muted-foreground mt-1">Great job! Nothing to show here right now.</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyWorkPage() {
  // Controls the Quick Create task modal visibility
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Active filter key — determines which tasks are shown in the main list
  // Clicking a stat card sets this value; 'all' shows everything
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  // ── Derived counts for stat cards ──────────────────────────────────────────
  const activeTasks   = useMemo(() => allTasks.filter(t => !t.completedToday && !t.waitingFor), []);
  const overdueTasks  = useMemo(() => allTasks.filter(t => t.isOverdue), []);
  const dueTodayTasks = useMemo(() => allTasks.filter(t => t.dueLabel === 'Due Today' && !t.isOverdue), []);
  const waitingTasks  = useMemo(() => allTasks.filter(t => !!t.waitingFor), []);
  const completedTasks = useMemo(() => allTasks.filter(t => t.completedToday), []);

  // ── Stat card definitions — each card maps to a FilterKey ──────────────────
  const statCards = [
    {
      key: 'active' as FilterKey,
      label: 'Active Tasks',
      value: activeTasks.length,
      icon: 'ClipboardDocumentCheckIcon',
      color: 'text-primary',
      bg: 'bg-primary/10',
      activeBg: 'bg-primary',
      activeText: 'text-primary-foreground',
      ring: 'ring-primary',
    },
    {
      key: 'overdue' as FilterKey,
      label: 'Overdue',
      value: overdueTasks.length,
      icon: 'ExclamationTriangleIcon',
      color: 'text-red-600',
      bg: 'bg-red-50',
      activeBg: 'bg-red-600',
      activeText: 'text-white',
      ring: 'ring-red-400',
    },
    {
      key: 'dueToday' as FilterKey,
      label: 'Due Today',
      value: dueTodayTasks.length,
      icon: 'CalendarDaysIcon',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      activeBg: 'bg-amber-500',
      activeText: 'text-white',
      ring: 'ring-amber-400',
    },
    {
      key: 'waiting' as FilterKey,
      label: 'Waiting for Others',
      value: waitingTasks.length,
      icon: 'ClockIcon',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      activeBg: 'bg-purple-600',
      activeText: 'text-white',
      ring: 'ring-purple-400',
    },
  ];

  // ── Filter label for empty-state message ───────────────────────────────────
  const filterLabel = statCards.find(s => s.key === activeFilter)?.label ?? 'All Tasks';

  // ── Compute filtered task groups based on activeFilter ─────────────────────
  // Each section only renders if it has tasks to show under the current filter.
  const showOverdue  = activeFilter === 'all' || activeFilter === 'overdue';
  const showDueToday = activeFilter === 'all' || activeFilter === 'dueToday';
  const showActive   = activeFilter === 'all' || activeFilter === 'active';
  const showWaiting  = activeFilter === 'all' || activeFilter === 'waiting';
  const showCompleted = activeFilter === 'all' || activeFilter === 'completed';

  // Determine if the main column has any visible tasks
  const hasMainTasks =
    (showOverdue && overdueTasks.length > 0) ||
    (showDueToday && dueTodayTasks.length > 0) ||
    (showActive && activeTasks.length > 0);

  // ── Toggle filter: clicking the same card again resets to 'all' ────────────
  const handleStatClick = (key: FilterKey) => {
    setActiveFilter(prev => (prev === key ? 'all' : key));
  };

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">My Work</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personal task board &nbsp;·&nbsp; Wednesday, 16 Ashwin 2083 BS
          </p>
        </div>
        <button
          onClick={() => setQuickCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
        >
          <AppIcon name="PlusIcon" size={15} className="text-primary-foreground" />
          Quick Create
        </button>
      </div>

      {/* ── Stat Cards (Clickable Filters) ──────────────────────────────────── */}
      {/* Each card acts as a toggle filter for the task list below.
          Active card is highlighted; clicking it again resets to 'all'. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {statCards.map((stat) => {
          const isActive = activeFilter === stat.key;
          return (
            <button
              key={stat.key}
              onClick={() => handleStatClick(stat.key)}
              aria-pressed={isActive}
              className={`
                relative text-left rounded-xl p-4 flex items-center gap-3 transition-all duration-200
                focus:outline-none focus:ring-2 ${stat.ring} focus:ring-offset-1
                active:scale-95
                ${isActive
                  ? `${stat.activeBg} ${stat.activeText} shadow-md ring-2 ${stat.ring}`
                  : 'bg-card border border-border hover:shadow-md hover:border-transparent'
                }
              `}
            >
              {/* Icon container — background changes when card is active */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                isActive ? 'bg-white/20' : stat.bg
              }`}>
                <AppIcon
                  name={stat.icon as any}
                  size={18}
                  className={isActive ? 'text-white' : stat.color}
                />
              </div>

              <div>
                <p className={`text-xl font-extrabold leading-none ${isActive ? 'text-white' : 'text-foreground'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {stat.label}
                </p>
              </div>

              {/* Active indicator dot in top-right corner */}
              {isActive && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active Filter Banner ─────────────────────────────────────────────── */}
      {/* Shows which filter is active and provides a one-click clear button */}
      {activeFilter !== 'all' && (
        <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-secondary rounded-lg border border-border w-fit">
          <AppIcon name="FunnelIcon" size={13} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Showing: <span className="font-semibold text-foreground">{filterLabel}</span>
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            className="ml-1 text-xs text-primary font-semibold hover:underline flex items-center gap-0.5"
          >
            <AppIcon name="XMarkIcon" size={12} />
            Clear
          </button>
        </div>
      )}

      {/* ── Main Content Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left Column: Task Sections ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Overdue Section — only visible when filter is 'all' or 'overdue' */}
          {showOverdue && overdueTasks.length > 0 && (
            <div>
              <SectionHeader icon="ExclamationTriangleIcon" title="Overdue" count={overdueTasks.length} color="text-red-600" />
              <div className="space-y-3">
                {overdueTasks.map(task => (
                  <TaskCard key={task.id} task={task} showWaiting />
                ))}
              </div>
            </div>
          )}

          {/* Due Today Section */}
          {showDueToday && dueTodayTasks.length > 0 && (
            <div>
              <SectionHeader icon="CalendarDaysIcon" title="Due Today" count={dueTodayTasks.length} color="text-amber-600" />
              <div className="space-y-3">
                {dueTodayTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Active / In-Progress Section */}
          {showActive && activeTasks.length > 0 && (
            <div>
              <SectionHeader
                icon="ArrowPathIcon"
                title="In Progress"
                count={activeTasks.filter(t => !t.isOverdue && t.dueLabel !== 'Due Today').length}
              />
              <div className="space-y-3">
                {activeTasks.filter(t => !t.isOverdue && t.dueLabel !== 'Due Today').map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state — shown when the current filter has no matching tasks */}
          {!hasMainTasks && activeFilter !== 'waiting' && activeFilter !== 'completed' && (
            <EmptyState filterLabel={filterLabel} />
          )}
        </div>

        {/* ── Right Column: Sidebar Sections ────────────────────────────────── */}
        <div className="space-y-5">

          {/* Waiting for Others — shown when filter is 'all' or 'waiting' */}
          {showWaiting && (
            <div>
              <SectionHeader icon="ClockIcon" title="Waiting for Others" count={waitingTasks.length} color="text-purple-600" />
              {waitingTasks.length > 0 ? (
                <div className="space-y-3">
                  {waitingTasks.map(task => (
                    <TaskCard key={task.id} task={task} showWaiting />
                  ))}
                </div>
              ) : (
                <EmptyState filterLabel="Waiting for Others" />
              )}
            </div>
          )}

          {/* Completed Today — shown when filter is 'all' or 'completed' */}
          {showCompleted && (
            <div>
              <SectionHeader icon="CheckCircleIcon" title="Completed Today" count={completedTasks.length} color="text-green-600" />
              {completedTasks.length > 0 ? (
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState filterLabel="Completed Today" />
              )}
            </div>
          )}

          {/* ── This Week's Progress Widget ──────────────────────────────────── */}
          {/* Always visible regardless of active filter */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <AppIcon name="ChartBarIcon" size={15} className="text-primary" />
              This Week&apos;s Progress
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Tasks Completed', value: 8, total: 12, color: 'bg-green-500' },
                { label: 'On-Time Rate',    value: 7, total: 8,  color: 'bg-primary' },
                { label: 'Comments Added',  value: 14, total: 20, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.label}>
                  {/* Label row with fraction */}
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}/{item.total}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly summary footer */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Week of Ashwin 2083</span>
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                <AppIcon name="ArrowTrendingUpIcon" size={12} />
                +12% vs last week
              </span>
            </div>
          </div>

          {/* ── Quick Actions Widget ─────────────────────────────────────────── */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <AppIcon name="BoltIcon" size={15} className="text-amber-500" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Create New Task',    icon: 'PlusCircleIcon',          action: () => setQuickCreateOpen(true) },
                { label: 'View All My Tasks',  icon: 'ClipboardDocumentListIcon', action: () => {} },
                { label: 'Check Pending Approvals', icon: 'CheckBadgeIcon',     action: () => {} },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-secondary transition-colors text-left"
                >
                  <AppIcon name={item.icon as any} size={14} className="text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Create Task Modal */}
      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
