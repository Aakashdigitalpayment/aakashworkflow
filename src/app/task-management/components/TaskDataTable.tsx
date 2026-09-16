'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { mockTasks, type Task } from './taskData';
import { toast } from 'sonner';

interface Filters {
  search: string;
  department: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  category: string;
}

interface TaskDataTableProps {
  filters: Filters;
  onRowClick: (task: Task) => void;
}

type SortKey = 'taskId' | 'title' | 'department' | 'assignee' | 'priority' | 'status' | 'dueDate' | 'progress';
type SortDir = 'asc' | 'desc';

const statusClassMap: Record<string, string> = {
  'Draft': 'status-draft',
  'Assigned': 'status-assigned',
  'Accepted': 'status-accepted',
  'In Progress': 'status-inprogress',
  'Pending': 'status-pending',
  'Blocked': 'status-blocked',
  'Under Review': 'status-review',
  'Changes Requested': 'status-changes',
  'Approved': 'status-approved',
  'Completed': 'status-completed',
  'Closed': 'status-closed',
  'On Hold': 'status-onhold',
  'Reopened': 'status-reopened',
  'Cancelled': 'status-closed',
};

const priorityClassMap: Record<string, string> = {
  Critical: 'priority-critical',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

const priorityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

export default function TaskDataTable({ filters, onRowClick }: TaskDataTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleCols, setVisibleCols] = useState({
    taskId: true,
    title: true,
    department: true,
    assignee: true,
    priority: true,
    status: true,
    dueDate: true,
    progress: true,
    overdue: true,
    actions: true,
  });
  const [colVisOpen, setColVisOpen] = useState(false);

  const filtered = useMemo(() => {
    let tasks = [...mockTasks];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.taskId.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (filters.department) tasks = tasks.filter((t) => t.department === filters.department || t.department.startsWith(filters.department));
    if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
    if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
    if (filters.category) tasks = tasks.filter((t) => t.category === filters.category);
    if (filters.dueDate === 'overdue') tasks = tasks.filter((t) => t.overdueDays > 0);
    if (filters.dueDate === 'today') tasks = tasks.filter((t) => t.dueDate === '2083-06-16');

    tasks.sort((a, b) => {
      let valA: string | number = a[sortKey] ?? '';
      let valB: string | number = b[sortKey] ?? '';
      if (sortKey === 'priority') {
        valA = priorityOrder[a.priority];
        valB = priorityOrder[b.priority];
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return tasks;
  }, [filters, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((t) => t.id)));
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <Icon
        name="ChevronUpIcon"
        size={9}
        className={sortKey === col && sortDir === 'asc' ? 'text-primary' : 'text-border'}
      />
      <Icon
        name="ChevronDownIcon"
        size={9}
        className={sortKey === col && sortDir === 'desc' ? 'text-primary' : 'text-border'}
      />
    </span>
  );

  const handleBulkAction = (action: string) => {
    toast.success(`${action} applied to ${selectedIds.size} task(s).`);
    setSelectedIds(new Set());
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      {/* Table Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-600 text-foreground">{paginated.length}</span> of{' '}
          <span className="font-600 text-foreground">{filtered.length}</span> tasks
          {filters.search || Object.values(filters).some((v) => v) ? ' (filtered)' : ''}
        </p>
        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          <div className="relative">
            <button
              onClick={() => setColVisOpen(!colVisOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-500 text-secondary-foreground bg-background border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <Icon name="ViewColumnsIcon" size={13} />
              Columns
            </button>
            {colVisOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setColVisOpen(false)} />
                <div className="absolute right-0 top-9 w-44 bg-card border border-border rounded-xl shadow-modal z-30 fade-in p-2">
                  {Object.entries(visibleCols).map(([col, visible]) => (
                    <label
                      key={`col-vis-${col}`}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => setVisibleCols((prev) => ({ ...prev, [col]: !prev[col as keyof typeof prev] }))}
                        className="w-3.5 h-3.5 rounded"
                      />
                      <span className="text-xs font-500 text-foreground capitalize">{col === 'taskId' ? 'Task ID' : col}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === paginated.length && paginated.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-ring/30"
                />
              </th>
              {visibleCols.taskId && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort('taskId')}>
                  Task ID <SortIcon col="taskId" />
                </th>
              )}
              {visibleCols.title && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide cursor-pointer select-none min-w-[220px]" onClick={() => toggleSort('title')}>
                  Title <SortIcon col="title" />
                </th>
              )}
              {visibleCols.department && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort('department')}>
                  Department <SortIcon col="department" />
                </th>
              )}
              {visibleCols.assignee && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort('assignee')}>
                  Assignee <SortIcon col="assignee" />
                </th>
              )}
              {visibleCols.priority && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('priority')}>
                  Priority <SortIcon col="priority" />
                </th>
              )}
              {visibleCols.status && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort('status')}>
                  Status <SortIcon col="status" />
                </th>
              )}
              {visibleCols.dueDate && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort('dueDate')}>
                  Due Date <SortIcon col="dueDate" />
                </th>
              )}
              {visibleCols.progress && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide cursor-pointer select-none w-32" onClick={() => toggleSort('progress')}>
                  Progress <SortIcon col="progress" />
                </th>
              )}
              {visibleCols.overdue && (
                <th className="text-left px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Overdue
                </th>
              )}
              {visibleCols.actions && (
                <th className="text-center px-3 py-3 text-[11px] font-600 text-muted-foreground uppercase tracking-wide w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                      <Icon name="RectangleStackIcon" size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-600 text-foreground">No tasks found</p>
                    <p className="text-xs text-muted-foreground max-w-xs text-center">
                      No tasks match your current filters. Try clearing some filters or create a new task.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  selected={selectedIds.has(task.id)}
                  onSelect={() => toggleSelect(task.id)}
                  onRowClick={() => onRowClick(task)}
                  visibleCols={visibleCols}
                  statusClassMap={statusClassMap}
                  priorityClassMap={priorityClassMap}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 slide-up">
          <div className="flex items-center gap-3 bg-foreground text-background rounded-2xl px-5 py-3 shadow-modal">
            <span className="text-sm font-600">{selectedIds.size} selected</span>
            <div className="w-px h-4 bg-background/20" />
            {[
              { id: 'bulk-assign', label: 'Reassign', icon: 'UserPlusIcon' },
              { id: 'bulk-status', label: 'Change Status', icon: 'ArrowPathIcon' },
              { id: 'bulk-priority', label: 'Set Priority', icon: 'FlagIcon' },
              { id: 'bulk-delete', label: 'Delete', icon: 'TrashIcon' },
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => handleBulkAction(action.label)}
                className="flex items-center gap-1.5 text-sm font-500 hover:text-accent transition-colors"
              >
                <Icon name={action.icon as any} size={14} />
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-2 text-background/60 hover:text-background transition-colors"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
            className="text-xs bg-card border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((n) => (
              <option key={`per-page-${n}`} value={n}>{n}</option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filtered.length)} of {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="ChevronDoubleLeftIcon" size={13} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="ChevronLeftIcon" size={13} className="text-muted-foreground" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
            return (
              <button
                key={`page-btn-${pageNum}`}
                onClick={() => setPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-500 transition-colors ${
                  page === pageNum
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary text-muted-foreground'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="ChevronRightIcon" size={13} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="ChevronDoubleRightIcon" size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onRowClick: () => void;
  visibleCols: Record<string, boolean>;
  statusClassMap: Record<string, string>;
  priorityClassMap: Record<string, string>;
}

function TaskRow({ task, selected, onSelect, onRowClick, visibleCols, statusClassMap, priorityClassMap }: TaskRowProps) {
  const [hovered, setHovered] = useState(false);

  const progressColor =
    task.progress === 0 ? 'bg-border' :
    task.progress >= 75 ? 'bg-green-500' :
    task.progress >= 40 ? 'bg-primary' : 'bg-amber-500';

  const dueDateDisplay = () => {
    if (task.overdueDays > 0) return { text: `${task.overdueDays}d overdue`, cls: 'text-red-600 font-600' };
    if (task.dueDate === '2083-06-16') return { text: 'Due today', cls: 'text-amber-600 font-600' };
    return { text: task.dueDate.replace('2083-', '').replace('-', '/'), cls: 'text-muted-foreground' };
  };

  const due = dueDateDisplay();

  return (
    <tr
      className={`task-row-hover cursor-pointer transition-colors ${selected ? 'bg-primary/5' : ''} ${hovered ? 'bg-muted/50' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onRowClick}
    >
      <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-border text-primary focus:ring-ring/30"
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {visibleCols.taskId && (
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="text-xs font-600 font-tabular text-primary bg-primary/8 px-2 py-0.5 rounded">
            {task.taskId}
          </span>
        </td>
      )}

      {visibleCols.title && (
        <td className="px-3 py-3 min-w-[220px]">
          <div>
            <p className="text-sm font-500 text-foreground line-clamp-1">{task.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground">{task.category}</span>
              {task.subtaskCount > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Icon name="CheckCircleIcon" size={10} className="text-muted-foreground" />
                  {task.subtaskDone}/{task.subtaskCount}
                </span>
              )}
              {task.commentCount > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Icon name="ChatBubbleLeftIcon" size={10} className="text-muted-foreground" />
                  {task.commentCount}
                </span>
              )}
              {task.attachmentCount > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Icon name="PaperClipIcon" size={10} className="text-muted-foreground" />
                  {task.attachmentCount}
                </span>
              )}
            </div>
          </div>
        </td>
      )}

      {visibleCols.department && (
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="text-xs text-secondary-foreground font-500 bg-secondary px-2 py-0.5 rounded">
            {task.department}
          </span>
        </td>
      )}

      {visibleCols.assignee && (
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-700 text-primary">{task.assigneeInitials}</span>
            </div>
            <span className="text-xs text-foreground font-500">{task.assignee}</span>
          </div>
        </td>
      )}

      {visibleCols.priority && (
        <td className="px-3 py-3">
          <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${priorityClassMap[task.priority]}`}>
            {task.priority}
          </span>
        </td>
      )}

      {visibleCols.status && (
        <td className="px-3 py-3 whitespace-nowrap">
          <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${statusClassMap[task.status] || 'status-draft'}`}>
            {task.status}
          </span>
        </td>
      )}

      {visibleCols.dueDate && (
        <td className="px-3 py-3 whitespace-nowrap">
          <span className={`text-xs font-tabular ${due.cls}`}>{due.text}</span>
        </td>
      )}

      {visibleCols.progress && (
        <td className="px-3 py-3 w-32">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${task.progress}%` }} />
            </div>
            <span className="text-[10px] font-600 font-tabular text-muted-foreground w-7 text-right">{task.progress}%</span>
          </div>
        </td>
      )}

      {visibleCols.overdue && (
        <td className="px-3 py-3">
          {task.overdueDays > 0 ? (
            <div className="flex items-center gap-1 bg-red-50 rounded px-1.5 py-0.5 w-fit">
              <Icon name="ExclamationTriangleIcon" size={10} className="text-red-500" />
              <span className="text-[10px] font-600 text-red-600">{task.overdueDays}d</span>
            </div>
          ) : (
            <span className="text-[10px] text-green-600 font-500">On time</span>
          )}
        </td>
      )}

      {visibleCols.actions && (
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <div className={`flex items-center justify-center gap-0.5 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <ActionButton icon="EyeIcon" label="View task details" onClick={onRowClick} />
            <ActionButton icon="PencilSquareIcon" label="Edit task" onClick={() => toast.info(`Edit ${task.taskId}`)} />
            <ActionButton icon="ArrowRightCircleIcon" label="Forward task" onClick={() => toast.info(`Forward ${task.taskId}`)} />
            <ActionButton icon="TrashIcon" label="Delete task" onClick={() => toast.error(`Delete ${task.taskId}?`)} danger />
          </div>
        </td>
      )}
    </tr>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
        danger
          ? 'hover:bg-red-100 text-muted-foreground hover:text-red-600'
          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon name={icon as any} size={13} />
    </button>
  );
}

function Icon({ name, size = 14, className = '' }: { name: string; size?: number; className?: string }) {
  const AppIcon = require('@/components/ui/AppIcon').default;
  return <AppIcon name={name} size={size} className={className} />;
}