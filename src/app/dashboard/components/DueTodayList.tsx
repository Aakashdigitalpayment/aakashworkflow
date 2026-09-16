'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface DueTodayTask {
  id: string;
  taskId: string;
  title: string;
  assignee: string;
  department: string;
  status: string;
  priority: string;
  progress: number;
}

const statusColor: Record<string, string> = {
  'in_progress': 'status-inprogress',
  'assigned': 'status-assigned',
  'accepted': 'status-accepted',
  'draft': 'status-draft',
  'pending': 'status-pending',
  'blocked': 'status-blocked',
};

const statusLabel: Record<string, string> = {
  in_progress: 'In Progress',
  assigned: 'Assigned',
  accepted: 'Accepted',
  draft: 'Draft',
  pending: 'Pending',
  blocked: 'Blocked',
};

const priorityDot: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

export default function DueTodayList() {
  const [tasks, setTasks] = useState<DueTodayTask[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDueToday = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error, count } = await supabase
          .from('tasks')
          .select(`
            id, task_number, title, status, priority, progress,
            user_profiles!tasks_assigned_to_fkey(full_name),
            departments(name)
          `, { count: 'exact' })
          .eq('due_date', today)
          .not('status', 'in', '("completed","closed","cancelled")')
          .order('priority', { ascending: true })
          .limit(6);

        if (error) {
          console.log('Due today error:', error.message);
          setLoading(false);
          return;
        }

        setTotalDue(count || 0);
        const mapped: DueTodayTask[] = (data || []).map((row: any) => ({
          id: row.id,
          taskId: row.task_number,
          title: row.title,
          assignee: row.user_profiles?.full_name || 'Unassigned',
          department: row.departments?.name || '—',
          status: row.status,
          priority: row.priority,
          progress: row.progress || 0,
        }));
        setTasks(mapped);
      } catch (err) {
        console.log('Due today fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDueToday();
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="ClockIcon" size={15} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-600 text-foreground">Due Today</h3>
            <p className="text-[10px] text-muted-foreground font-500">
              {loading ? '…' : `${totalDue} task${totalDue !== 1 ? 's' : ''} due by end of day`}
            </p>
          </div>
        </div>
        <button className="text-xs text-primary font-500 hover:underline">View all</button>
      </div>

      {loading ? (
        <div className="divide-y divide-border/60">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skel-dt-${i}`} className="px-4 py-3 animate-pulse">
              <div className="h-3 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-2 bg-secondary rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {tasks.map((task) => (
            <div key={task.id} className="px-4 py-3 hover:bg-amber-50/30 transition-colors cursor-pointer">
              <div className="flex items-start gap-2 mb-1.5">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[task.priority] || 'bg-gray-400'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-600 text-foreground truncate">{task.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{task.taskId} · {task.department}</p>
                </div>
                <span className={`text-[10px] font-500 px-1.5 py-0.5 rounded-full flex-shrink-0 ${statusColor[task.status] || 'status-draft'}`}>
                  {statusLabel[task.status] || task.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      task.progress === 0 ? 'bg-border' :
                      task.progress >= 75 ? 'bg-green-500' :
                      task.progress >= 40 ? 'bg-primary' : 'bg-amber-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-600 font-tabular text-muted-foreground w-7 text-right">{task.progress}%</span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Icon name="CheckCircleIcon" size={24} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tasks due today!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}