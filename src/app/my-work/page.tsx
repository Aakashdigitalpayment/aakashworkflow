'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

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
}

const myTasks: WorkTask[] = [
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
];

const waitingForOthers: WorkTask[] = [
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
];

const completedToday: WorkTask[] = [
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
  },
];

const priorityColors: Record<string, string> = {
  Critical: 'priority-critical',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

function TaskCard({ task, showWaiting = false }: { task: WorkTask; showWaiting?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-card border rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
        task.isOverdue ? 'border-red-200' : 'border-border'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Progress ring */}
        <div className="relative flex-shrink-0 w-10 h-10 mt-0.5">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke={task.isOverdue ? '#ef4444' : task.progress === 100 ? '#16a34a' : '#1e40af'}
              strokeWidth="3"
              strokeDasharray={`${(task.progress / 100) * 94.2} 94.2`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-700 text-foreground">
            {task.progress}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-600 text-muted-foreground font-mono mb-0.5">{task.id}</p>
              <h3 className="text-sm font-600 text-foreground leading-snug">{task.title}</h3>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${task.statusClass}`}>
                {task.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <AppIcon name="BuildingOffice2Icon" size={12} />
              {task.department}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <AppIcon name="TagIcon" size={12} />
              {task.category}
            </span>
            <span className={`text-[11px] font-600 px-2 py-0.5 rounded-md ${task.dueLabelClass}`}>
              {task.dueLabel}
            </span>
          </div>

          {showWaiting && task.waitingFor && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
              <AppIcon name="ClockIcon" size={12} />
              <span>{task.waitingFor}</span>
            </div>
          )}

          {expanded && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                Assigned by <span className="font-600 text-foreground">{task.assignedBy}</span>
              </span>
              <div className="flex items-center gap-2">
                <button className="text-xs font-600 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                  Update Progress
                </button>
                <button className="text-xs font-600 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-border transition-colors">
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

function SectionHeader({ icon, title, count, color = 'text-foreground' }: {
  icon: string; title: string; count: number; color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <AppIcon name={icon as any} size={16} className={color} />
      <h2 className={`text-sm font-700 ${color}`}>{title}</h2>
      <span className="text-xs font-700 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

export default function MyWorkPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const overdueCount = myTasks.filter(t => t.isOverdue).length;
  const dueTodayCount = myTasks.filter(t => t.dueLabel === 'Due Today').length;

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-800 text-foreground">My Work</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personal task board &nbsp;·&nbsp; Wednesday, 16 Ashwin 2083 BS
          </p>
        </div>
        <button
          onClick={() => setQuickCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
        >
          <AppIcon name="PlusIcon" size={15} className="text-primary-foreground" />
          Quick Create
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active Tasks', value: myTasks.length, icon: 'ClipboardDocumentCheckIcon', color: 'text-primary', bg: 'bg-primary/8' },
          { label: 'Overdue', value: overdueCount, icon: 'ExclamationTriangleIcon', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Due Today', value: dueTodayCount, icon: 'CalendarDaysIcon', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Waiting for Others', value: waitingForOthers.length, icon: 'ClockIcon', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <AppIcon name={stat.icon as any} size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-xl font-800 text-foreground leading-none">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Active Tasks */}
        <div className="lg:col-span-2 space-y-5">
          {/* Overdue */}
          {overdueCount > 0 && (
            <div>
              <SectionHeader icon="ExclamationTriangleIcon" title="Overdue" count={overdueCount} color="text-red-600" />
              <div className="space-y-3">
                {myTasks.filter(t => t.isOverdue).map(task => (
                  <TaskCard key={task.id} task={task} showWaiting />
                ))}
              </div>
            </div>
          )}

          {/* Due Today */}
          <div>
            <SectionHeader icon="CalendarDaysIcon" title="Due Today" count={dueTodayCount} color="text-amber-600" />
            <div className="space-y-3">
              {myTasks.filter(t => t.dueLabel === 'Due Today' && !t.isOverdue).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div>
            <SectionHeader icon="ArrowPathIcon" title="In Progress" count={myTasks.filter(t => !t.isOverdue && t.dueLabel !== 'Due Today').length} />
            <div className="space-y-3">
              {myTasks.filter(t => !t.isOverdue && t.dueLabel !== 'Due Today').map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Waiting for Others */}
          <div>
            <SectionHeader icon="ClockIcon" title="Waiting for Others" count={waitingForOthers.length} color="text-purple-600" />
            <div className="space-y-3">
              {waitingForOthers.map(task => (
                <TaskCard key={task.id} task={task} showWaiting />
              ))}
            </div>
          </div>

          {/* Completed Today */}
          <div>
            <SectionHeader icon="CheckCircleIcon" title="Completed Today" count={completedToday.length} color="text-green-600" />
            <div className="space-y-3">
              {completedToday.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-700 text-foreground mb-3">This Week&apos;s Progress</h3>
            <div className="space-y-3">
              {[
                { label: 'Tasks Completed', value: 8, total: 12, color: 'bg-green-500' },
                { label: 'On-Time Rate', value: 7, total: 8, color: 'bg-primary' },
                { label: 'Comments Added', value: 14, total: 20, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-600 text-foreground">{item.value}/{item.total}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
