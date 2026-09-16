'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface KPIData {
  totalTasks: number;
  openTasks: number;
  inProgress: number;
  pending: number;
  overdue: number;
  dueToday: number;
  awaitingApproval: number;
  completedThisWeek: number;
  blocked: number;
}

interface KPICard {
  id: string;
  label: string;
  value: number;
  subtext: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'red' | 'amber' | 'green' | 'blue' | 'purple';
  variant: 'default' | 'alert' | 'warning' | 'success' | 'info' | 'purple';
  href: string;
  tooltip: string;
}

const variantStyles: Record<KPICard['variant'], {
  card: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  accentLine: string;
}> = {
  default: {
    card: 'bg-card border-border hover:border-primary/40 hover:shadow-md',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    valueColor: 'text-foreground',
    accentLine: 'bg-primary',
  },
  alert: {
    card: 'bg-card border-border hover:border-red-300 hover:shadow-md',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-600',
    accentLine: 'bg-red-500',
  },
  warning: {
    card: 'bg-card border-border hover:border-amber-300 hover:shadow-md',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-600',
    accentLine: 'bg-amber-500',
  },
  success: {
    card: 'bg-card border-border hover:border-green-300 hover:shadow-md',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    valueColor: 'text-green-600',
    accentLine: 'bg-green-500',
  },
  info: {
    card: 'bg-card border-border hover:border-blue-300 hover:shadow-md',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-600',
    accentLine: 'bg-blue-500',
  },
  purple: {
    card: 'bg-card border-border hover:border-purple-300 hover:shadow-md',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    valueColor: 'text-purple-600',
    accentLine: 'bg-purple-500',
  },
};

export default function DashboardKPIGrid() {
  const [stats, setStats] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) {
          console.log('Dashboard stats error:', error.message);
          setLoading(false);
          return;
        }
        if (data) {
          setStats({
            totalTasks: data.total_tasks || 0,
            openTasks: data.open_tasks || 0,
            inProgress: data.in_progress || 0,
            pending: data.pending || 0,
            overdue: data.overdue || 0,
            dueToday: data.due_today || 0,
            awaitingApproval: data.awaiting_approval || 0,
            completedThisWeek: data.completed_this_week || 0,
            blocked: data.blocked || 0,
          });
        }
      } catch (err) {
        console.log('KPI fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const channel = supabase
      .channel('tasks_kpi')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const kpiCards: KPICard[] = [
    {
      id: 'kpi-total',
      label: 'Total Active Tasks',
      value: stats?.totalTasks ?? 0,
      subtext: `${stats?.openTasks ?? 0} open · unstarted`,
      icon: 'RectangleStackIcon',
      variant: 'default',
      href: '/task-management',
      tooltip: 'View all tasks',
    },
    {
      id: 'kpi-open',
      label: 'Open / Unstarted',
      value: stats?.openTasks ?? 0,
      subtext: 'Awaiting acceptance',
      icon: 'ClipboardDocumentListIcon',
      variant: 'info',
      href: '/task-management?status=open',
      tooltip: 'View open tasks',
    },
    {
      id: 'kpi-inprogress',
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      subtext: 'Actively being worked on',
      icon: 'ArrowPathIcon',
      variant: 'purple',
      href: '/task-management?status=in_progress',
      tooltip: 'View in-progress tasks',
    },
    {
      id: 'kpi-completed',
      label: 'Completed This Week',
      value: stats?.completedThisWeek ?? 0,
      subtext: 'Finished this week',
      icon: 'CheckBadgeIcon',
      variant: 'success',
      href: '/task-management?status=completed',
      tooltip: 'View completed tasks',
    },
    {
      id: 'kpi-overdue',
      label: 'Overdue Tasks',
      value: stats?.overdue ?? 0,
      subtext: 'Past due date — action needed',
      icon: 'ExclamationTriangleIcon',
      badge: 'Action Required',
      badgeVariant: 'red',
      variant: 'alert',
      href: '/task-management?status=overdue',
      tooltip: 'View overdue tasks',
    },
    {
      id: 'kpi-duetoday',
      label: 'Due Today',
      value: stats?.dueToday ?? 0,
      subtext: 'Due by end of day',
      icon: 'ClockIcon',
      variant: 'warning',
      href: '/task-management?dueDate=today',
      tooltip: 'View tasks due today',
    },
    {
      id: 'kpi-approval',
      label: 'Awaiting Approval',
      value: stats?.awaitingApproval ?? 0,
      subtext: 'Under review',
      icon: 'CheckCircleIcon',
      badge: 'Pending',
      badgeVariant: 'amber',
      variant: 'warning',
      href: '/pending-approvals',
      tooltip: 'Go to pending approvals',
    },
    {
      id: 'kpi-blocked',
      label: 'Blocked Tasks',
      value: stats?.blocked ?? 0,
      subtext: 'Waiting on dependency',
      icon: 'NoSymbolIcon',
      variant: 'alert',
      href: '/task-management?status=blocked',
      tooltip: 'View blocked tasks',
    },
  ];

  const badgeStyles: Record<string, string> = {
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`skel-${i}`} className="border border-border rounded-xl p-4 animate-pulse bg-card h-[110px]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-secondary rounded-lg" />
              <div className="w-16 h-4 bg-secondary rounded-full" />
            </div>
            <div className="h-7 bg-secondary rounded w-12 mb-1.5" />
            <div className="h-3 bg-secondary rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-5">
      {kpiCards.map((card) => {
        const styles = variantStyles[card.variant];
        return (
          <button
            key={card.id}
            type="button"
            title={card.tooltip}
            onClick={() => router.push(card.href)}
            className={`relative border rounded-xl p-4 shadow-card transition-all duration-200 cursor-pointer overflow-hidden text-left w-full group active:scale-[0.98] ${styles.card}`}
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${styles.accentLine} opacity-60`} />

            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                <Icon name={card.icon as any} size={18} className={styles.iconColor} />
              </div>
              {card.badge ? (
                <span className={`text-[9px] font-600 px-1.5 py-0.5 rounded-full leading-tight ${badgeStyles[card.badgeVariant || 'amber']}`}>
                  {card.badge}
                </span>
              ) : (
                <Icon name="ArrowTopRightOnSquareIcon" size={12} className="text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity mt-0.5" />
              )}
            </div>

            <div className={`text-2xl font-700 font-tabular leading-none mb-1.5 ${styles.valueColor}`}>
              {card.value}
            </div>
            <p className="text-xs font-600 text-foreground leading-tight mb-0.5">{card.label}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{card.subtext}</p>
          </button>
        );
      })}
    </div>
  );
}