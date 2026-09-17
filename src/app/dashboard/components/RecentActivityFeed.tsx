'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface ActivityItem {
  id: string;
  user: string;
  userInitials: string;
  action: string;
  taskId: string;
  taskTitle: string;
  time: string;
  type: 'created' | 'assigned' | 'completed' | 'forwarded' | 'commented' | 'approved' | 'overdue' | 'status';
}

const typeConfig: Record<ActivityItem['type'], { icon: string; color: string }> = {
  created: { icon: 'PlusCircleIcon', color: 'bg-blue-100 text-blue-600' },
  assigned: { icon: 'UserPlusIcon', color: 'bg-primary/10 text-primary' },
  completed: { icon: 'CheckCircleIcon', color: 'bg-green-100 text-green-600' },
  forwarded: { icon: 'ArrowRightCircleIcon', color: 'bg-purple-100 text-purple-600' },
  commented: { icon: 'ChatBubbleLeftIcon', color: 'bg-slate-100 text-slate-600' },
  approved: { icon: 'CheckBadgeIcon', color: 'bg-green-100 text-green-700' },
  overdue: { icon: 'ExclamationCircleIcon', color: 'bg-red-100 text-red-600' },
  status: { icon: 'ArrowPathIcon', color: 'bg-amber-100 text-amber-600' },
};

const actionToType = (action: string): ActivityItem['type'] => {
  if (action === 'created') return 'created';
  if (action === 'assigned' || action === 'reassigned') return 'assigned';
  if (action === 'completed') return 'completed';
  if (action === 'forwarded') return 'forwarded';
  if (action === 'commented') return 'commented';
  if (action === 'approved') return 'approved';
  if (action === 'overdue') return 'overdue';
  return 'status';
};

const actionToLabel = (action: string, newValue?: string): string => {
  const map: Record<string, string> = {
    created: 'created the task',
    assigned: 'assigned the task',
    accepted: 'accepted the task',
    status_changed: `changed status to ${newValue || ''}`,
    progress_changed: `updated progress to ${newValue || ''}`,
    commented: 'commented on',
    forwarded: 'forwarded the task',
    sent_back: 'sent back the task',
    reassigned: 'reassigned the task',
    approved: 'approved',
    rejected: 'rejected',
    completed: 'completed',
    file_uploaded: 'uploaded a file',
  };
  return map[action] || action.replace(/_/g, ' ');
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function RecentActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data, error } = await supabase
          .from('task_activity_logs')
          .select(`
            id, action, new_value, created_at,
            user_profiles(full_name, avatar_initials),
            tasks(task_number, title)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Activity feed error:', error.message);
          setLoading(false);
          return;
        }

        const mapped: ActivityItem[] = (data || []).map((row: any) => ({
          id: row.id,
          user: row.user_profiles?.full_name || 'System',
          userInitials: row.user_profiles?.avatar_initials || 'SY',
          action: actionToLabel(row.action, row.new_value),
          taskId: row.tasks?.task_number || '',
          taskTitle: row.tasks?.title || '',
          time: timeAgo(row.created_at),
          type: actionToType(row.action),
        }));
        setItems(mapped);
      } catch (err) {
        console.error('Activity fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();

    const channel = supabase
      .channel('activity_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_activity_logs' }, () => {
        fetchActivity();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="BoltIcon" size={15} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-600 text-foreground">Recent Activity</h3>
            <p className="text-[10px] text-muted-foreground font-500">All departments · Live</p>
          </div>
        </div>
        <button className="text-xs text-primary font-500 hover:underline">View log</button>
      </div>

      {loading ? (
        <div className="divide-y divide-border/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-act-${i}`} className="flex gap-3 px-4 py-3 animate-pulse">
              <div className="w-7 h-7 bg-secondary rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-secondary rounded w-3/4" />
                <div className="h-2.5 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {items.map((item) => {
            const config = typeConfig[item.type];
            return (
              <div key={item.id} className="flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon name={config.icon as any} size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground leading-relaxed">
                    <span className="font-600">{item.user}</span>
                    {' '}{item.action}{' '}
                    {item.taskId && <span className="text-primary font-500">{item.taskId}</span>}
                  </p>
                  {item.taskTitle && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.taskTitle}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-2.5 border-t border-border">
        <button className="text-xs text-primary font-500 hover:underline w-full text-center">
          Load more activity →
        </button>
      </div>
    </div>
  );
}