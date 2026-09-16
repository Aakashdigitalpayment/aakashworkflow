'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface OverdueTask {
  id: string;
  taskId: string;
  title: string;
  assignee: string;
  department: string;
  overdueDays: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  delayReason?: string;
  delayNote?: string;
}

interface DelayReasonState {
  reason: string;
  note: string;
  saved: boolean;
  open: boolean;
}

const DELAY_REASONS = [
  { value: '', label: 'Select reason…' },
  { value: 'waiting_document', label: 'Waiting for Document' },
  { value: 'waiting_approval', label: 'Waiting for Approval' },
  { value: 'waiting_department', label: 'Waiting for Department' },
  { value: 'workload', label: 'Workload' },
  { value: 'external_dependency', label: 'External Dependency' },
];

const REASON_COLORS: Record<string, string> = {
  waiting_document: 'bg-blue-50 text-blue-700 border-blue-200',
  waiting_approval: 'bg-amber-50 text-amber-700 border-amber-200',
  waiting_department: 'bg-purple-50 text-purple-700 border-purple-200',
  workload: 'bg-orange-50 text-orange-700 border-orange-200',
  external_dependency: 'bg-rose-50 text-rose-700 border-rose-200',
};

const REASON_ICONS: Record<string, string> = {
  waiting_document: 'DocumentTextIcon',
  waiting_approval: 'ClipboardDocumentCheckIcon',
  waiting_department: 'BuildingOfficeIcon',
  workload: 'ChartBarIcon',
  external_dependency: 'ArrowTopRightOnSquareIcon',
};

const priorityBadge: Record<string, string> = {
  critical: 'priority-critical',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

const priorityLabel: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function OverdueTasksList() {
  const [tasks, setTasks] = useState<OverdueTask[]>([]);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [delayStates, setDelayStates] = useState<Record<string, DelayReasonState>>({});
  const supabase = createClient();

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error, count } = await supabase
          .from('tasks')
          .select(`
            id, task_number, title, priority, due_date,
            user_profiles!tasks_assigned_to_fkey(full_name, avatar_initials),
            departments(name)
          `, { count: 'exact' })
          .lt('due_date', today)
          .not('status', 'in', '("completed","closed","cancelled")')
          .order('due_date', { ascending: true })
          .limit(5);

        if (error) {
          console.log('Overdue tasks error:', error.message);
          setLoading(false);
          return;
        }

        setTotalOverdue(count || 0);
        const mapped: OverdueTask[] = (data || []).map((row: any) => {
          const dueDate = new Date(row.due_date);
          const diffDays = Math.floor((Date.now() - dueDate.getTime()) / 86400000);
          return {
            id: row.id,
            taskId: row.task_number,
            title: row.title,
            assignee: row.user_profiles?.full_name || 'Unassigned',
            department: row.departments?.name || '—',
            overdueDays: diffDays,
            priority: row.priority,
            dueDate: dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          };
        });
        setTasks(mapped);

        // Init delay states
        const initStates: Record<string, DelayReasonState> = {};
        mapped.forEach(t => {
          initStates[t.id] = { reason: '', note: '', saved: false, open: false };
        });
        setDelayStates(initStates);
      } catch (err) {
        console.log('Overdue fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdue();
  }, []);

  const toggleDelayForm = (taskId: string) => {
    setDelayStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], open: !prev[taskId]?.open },
    }));
  };

  const updateDelayField = (taskId: string, field: 'reason' | 'note', value: string) => {
    setDelayStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], [field]: value, saved: false },
    }));
  };

  const saveDelayReason = (taskId: string) => {
    const state = delayStates[taskId];
    if (!state?.reason) return;
    setDelayStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], saved: true, open: false },
    }));
    // Update task in list for display
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, delayReason: state.reason, delayNote: state.note }
        : t
    ));
  };

  const getReasonLabel = (value: string) =>
    DELAY_REASONS.find(r => r.value === value)?.label || value;

  return (
    <div className="bg-card border border-border rounded-xl shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="ExclamationTriangleIcon" size={15} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-600 text-foreground">Overdue Tasks</h3>
            <p className="text-[10px] text-muted-foreground font-500">
              {loading ? '…' : `${totalOverdue} task${totalOverdue !== 1 ? 's' : ''} past due date`}
            </p>
          </div>
        </div>
        <button className="text-xs text-primary font-500 hover:underline">View all</button>
      </div>

      {loading ? (
        <div className="divide-y divide-border/60">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skel-ov-${i}`} className="px-4 py-3 animate-pulse">
              <div className="h-3 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-2.5 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {tasks.map((task) => {
            const ds = delayStates[task.id];
            const hasReason = !!task.delayReason;
            const reasonColor = hasReason ? REASON_COLORS[task.delayReason!] || 'bg-gray-50 text-gray-700 border-gray-200' : '';
            const reasonIcon = hasReason ? REASON_ICONS[task.delayReason!] || 'InformationCircleIcon' : '';

            return (
              <div key={task.id} className="px-4 py-3 hover:bg-red-50/40 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-600 text-foreground truncate">{task.title}</p>
                    <p className="text-[10px] font-500 text-muted-foreground mt-0.5">{task.taskId}</p>
                  </div>
                  <span className={`text-[10px] font-600 px-1.5 py-0.5 rounded-full flex-shrink-0 ${priorityBadge[task.priority] || 'priority-medium'}`}>
                    {priorityLabel[task.priority] || task.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-700 text-secondary-foreground">
                        {task.assignee.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate">{task.assignee}</span>
                    <span className="text-[10px] text-muted-foreground">· {task.department}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-red-100 rounded px-1.5 py-0.5">
                    <Icon name="ClockIcon" size={10} className="text-red-600" />
                    <span className="text-[10px] font-600 text-red-600">{task.overdueDays}d overdue</span>
                  </div>
                </div>

                {/* Delay Reason Badge — shown when saved */}
                {hasReason && (
                  <div className={`mt-2 flex items-start gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-500 ${reasonColor}`}>
                    <Icon name={reasonIcon as any} size={11} className="flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-600">{getReasonLabel(task.delayReason!)}</span>
                      {task.delayNote && (
                        <p className="mt-0.5 opacity-80 truncate">{task.delayNote}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleDelayForm(task.id)}
                      className="ml-auto flex-shrink-0 opacity-60 hover:opacity-100"
                      title="Edit reason"
                    >
                      <Icon name="PencilSquareIcon" size={10} />
                    </button>
                  </div>
                )}

                {/* Delay Reason Form — inline expandable */}
                {ds?.open && (
                  <div className="mt-2 p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2">
                    <p className="text-[10px] font-700 text-amber-800 flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={11} />
                      Why is this task delayed?
                    </p>
                    <select
                      value={ds.reason}
                      onChange={e => updateDelayField(task.id, 'reason', e.target.value)}
                      className="w-full text-[11px] bg-white border border-amber-200 rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                    >
                      {DELAY_REASONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <textarea
                      value={ds.note}
                      onChange={e => updateDelayField(task.id, 'note', e.target.value)}
                      placeholder="Add details (optional)…"
                      rows={2}
                      className="w-full text-[11px] bg-white border border-amber-200 rounded-md px-2 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => saveDelayReason(task.id)}
                        disabled={!ds.reason}
                        className="flex-1 text-[10px] font-600 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md py-1 transition-colors"
                      >
                        Save Reason
                      </button>
                      <button
                        onClick={() => toggleDelayForm(task.id)}
                        className="text-[10px] font-500 text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/40">
                  {['Remind', 'Extend', 'Escalate'].map((action) => (
                    <button
                      key={`action-${task.id}-${action.toLowerCase()}`}
                      className="text-[10px] font-500 text-muted-foreground hover:text-primary hover:bg-primary/8 px-2 py-0.5 rounded transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                  <button
                    onClick={() => toggleDelayForm(task.id)}
                    className={`ml-auto text-[10px] font-500 px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                      hasReason
                        ? 'text-amber-600 hover:bg-amber-50' :'text-muted-foreground hover:text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <Icon name="TagIcon" size={10} />
                    {hasReason ? 'Edit Reason' : 'Add Reason'}
                  </button>
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Icon name="CheckCircleIcon" size={24} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No overdue tasks!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}