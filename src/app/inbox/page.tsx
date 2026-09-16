'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

type NotifType = 'escalation' | 'auto-assign' | 'violation' | 'notification';
type NotifStatus = 'unread' | 'read';

interface InboxNotification {
  id: string;
  type: NotifType;
  ruleId: string;
  ruleName: string;
  taskId: string;
  taskTitle: string;
  message: string;
  triggeredAt: string;
  status: NotifStatus;
  priority?: 'high' | 'medium' | 'low';
  actor?: string;
  department?: string;
}

const TYPE_CONFIG: Record<NotifType, { label: string; icon: string; color: string; bg: string; dot: string }> = {
  escalation: {
    label: 'Escalation',
    icon: 'ArrowTrendingUpIcon',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    dot: 'bg-red-500',
  },
  'auto-assign': {
    label: 'Auto-Assign',
    icon: 'UserPlusIcon',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
  },
  violation: {
    label: 'Rule Violation',
    icon: 'ExclamationTriangleIcon',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  notification: {
    label: 'Notification',
    icon: 'BellAlertIcon',
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    dot: 'bg-purple-500',
  },
};

const SEED_NOTIFICATIONS: InboxNotification[] = [
  {
    id: 'notif-1',
    type: 'escalation',
    ruleId: 'rule-1',
    ruleName: 'Escalate Overdue High-Priority Tasks',
    taskId: 'TASK-2041',
    taskTitle: 'Monthly MIS Report — Shrawan 2083',
    message: 'Task overdue by 26h and priority is High. Automatically escalated to Department Head.',
    triggeredAt: '2 hours ago',
    status: 'unread',
    priority: 'high',
    actor: 'Automation Engine',
    department: 'Finance',
  },
  {
    id: 'notif-2',
    type: 'auto-assign',
    ruleId: 'rule-2',
    ruleName: 'Auto-Assign by Dept Workload',
    taskId: 'TASK-2042',
    taskTitle: 'Loan Application Review — Hari Bahadur Tamang',
    message: 'New task created in Credit Department. Assigned to Sita Rana (workload 42%) — least-loaded member.',
    triggeredAt: '30 min ago',
    status: 'unread',
    priority: 'medium',
    actor: 'Automation Engine',
    department: 'Credit',
  },
  {
    id: 'notif-3',
    type: 'violation',
    ruleId: 'rule-5',
    ruleName: 'Notify Overdue Loan Tasks',
    taskId: 'TASK-2038',
    taskTitle: 'Recovery Report — Bhadra 2083',
    message: 'Task overdue by 52h in Loan Processing category. SLA breach detected — Finance team alerted.',
    triggeredAt: '5 hours ago',
    status: 'unread',
    priority: 'high',
    actor: 'Automation Engine',
    department: 'Loan Processing',
  },
  {
    id: 'notif-4',
    type: 'notification',
    ruleId: 'rule-3',
    ruleName: 'Notify on Task Status Change',
    taskId: 'TASK-2035',
    taskTitle: 'Board Meeting Notice — Kartik 2083',
    message: 'Task status changed to Completed. Task creator Rajesh Kumar Shrestha has been notified via inbox.',
    triggeredAt: '1 hour ago',
    status: 'unread',
    priority: 'low',
    actor: 'Automation Engine',
    department: 'Administration',
  },
  {
    id: 'notif-5',
    type: 'escalation',
    ruleId: 'rule-4',
    ruleName: 'Escalate Stalled Tasks (3 days)',
    taskId: 'TASK-2029',
    taskTitle: 'Annual Audit Preparation — FY 2082/83',
    message: 'No activity detected for 3 days. Task status is In Progress. Escalated to CEO.',
    triggeredAt: '3 days ago',
    status: 'read',
    priority: 'high',
    actor: 'Automation Engine',
    department: 'Audit',
  },
  {
    id: 'notif-6',
    type: 'auto-assign',
    ruleId: 'rule-2',
    ruleName: 'Auto-Assign by Dept Workload',
    taskId: 'TASK-2044',
    taskTitle: 'Procurement Approval — Office Supplies Q4',
    message: 'New task created in Procurement. Assigned to Bikash Thapa (workload 38%) — least-loaded member.',
    triggeredAt: '1 day ago',
    status: 'read',
    priority: 'medium',
    actor: 'Automation Engine',
    department: 'Procurement',
  },
  {
    id: 'notif-7',
    type: 'violation',
    ruleId: 'rule-1',
    ruleName: 'Escalate Overdue High-Priority Tasks',
    taskId: 'TASK-2031',
    taskTitle: 'KYC Verification Batch — September 2083',
    message: 'High-priority task overdue by 30h. Escalation rule triggered — assigned to Compliance Head.',
    triggeredAt: '2 days ago',
    status: 'read',
    priority: 'high',
    actor: 'Automation Engine',
    department: 'Compliance',
  },
  {
    id: 'notif-8',
    type: 'notification',
    ruleId: 'rule-3',
    ruleName: 'Notify on Task Status Change',
    taskId: 'TASK-2027',
    taskTitle: 'HR Onboarding — New Joiners Batch 12',
    message: 'Task status changed to Completed. Notification sent to task creator via inbox.',
    triggeredAt: '2 days ago',
    status: 'read',
    priority: 'low',
    actor: 'Automation Engine',
    department: 'HR',
  },
  {
    id: 'notif-9',
    type: 'escalation',
    ruleId: 'rule-1',
    ruleName: 'Escalate Overdue High-Priority Tasks',
    taskId: 'TASK-2019',
    taskTitle: 'IT Infrastructure Upgrade Plan',
    message: 'Task overdue by 48h with High priority. Escalated to IT Manager for immediate action.',
    triggeredAt: '4 days ago',
    status: 'read',
    priority: 'high',
    actor: 'Automation Engine',
    department: 'IT',
  },
  {
    id: 'notif-10',
    type: 'auto-assign',
    ruleId: 'rule-2',
    ruleName: 'Auto-Assign by Dept Workload',
    taskId: 'TASK-2048',
    taskTitle: 'Member Loan Disbursement — October 2083',
    message: 'New task created. Assigned to Priya Shrestha (workload 29%) — least-loaded in Finance.',
    triggeredAt: '10 min ago',
    status: 'unread',
    priority: 'medium',
    actor: 'Automation Engine',
    department: 'Finance',
  },
];

const RULE_TYPE_OPTIONS: { value: 'all' | NotifType; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'auto-assign', label: 'Auto-Assign' },
  { value: 'violation', label: 'Rule Violation' },
  { value: 'notification', label: 'Notification' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-green-600 bg-green-50 border-green-200',
};

export default function InboxPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [notifications, setNotifications] = useState<InboxNotification[]>(SEED_NOTIFICATIONS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | NotifType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [selected, setSelected] = useState<InboxNotification | null>(null);
  const [liveIndicator, setLiveIndicator] = useState(true);
  const [newBadge, setNewBadge] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate real-time: every 30s a new notification arrives
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const live: InboxNotification = {
        id: `notif-live-${Date.now()}`,
        type: 'escalation',
        ruleId: 'rule-1',
        ruleName: 'Escalate Overdue High-Priority Tasks',
        taskId: `TASK-${2050 + Math.floor(Math.random() * 50)}`,
        taskTitle: 'Live Escalation — Auto-triggered',
        message: 'A new high-priority task has been overdue for 24h. Escalated to Department Head automatically.',
        triggeredAt: 'Just now',
        status: 'unread',
        priority: 'high',
        actor: 'Automation Engine',
        department: 'Finance',
      };
      setNotifications((prev) => [live, ...prev]);
      setNewBadge(true);
      setTimeout(() => setNewBadge(false), 4000);
    }, 30000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const filtered = notifications.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      n.taskId.toLowerCase().includes(q) ||
      n.taskTitle.toLowerCase().includes(q) ||
      n.ruleName.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.department?.toLowerCase().includes(q);
    const matchType = filterType === 'all' || n.type === filterType;
    const matchStatus = filterStatus === 'all' || n.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
  };

  const handleSelect = (notif: InboxNotification) => {
    setSelected(notif);
    if (notif.status === 'unread') markRead(notif.id);
  };

  const dismissNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-800 text-foreground">Inbox</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-700 px-2 py-0.5 rounded-full bg-primary text-white leading-none">
                {unreadCount}
              </span>
            )}
            {newBadge && (
              <span className="text-xs font-600 px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 animate-pulse">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time notifications from active automation rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
            <span className={`w-2 h-2 rounded-full bg-green-500 ${liveIndicator ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-600 text-green-700">Live</span>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-sm font-500 text-muted-foreground transition-colors"
            >
              <AppIcon name="CheckCircleIcon" size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <AppIcon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by rule type or task ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <AppIcon name="XMarkIcon" size={14} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5 border border-border">
          {RULE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-600 transition-all ${
                filterType === opt.value
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5 border border-border">
          {(['all', 'unread', 'read'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-600 transition-all capitalize ${
                filterStatus === s
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All' : s === 'unread' ? `Unread (${unreadCount})` : 'Read'}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: list + detail panel */}
      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        {/* Notification list */}
        <div className={`flex flex-col bg-card border border-border rounded-xl overflow-hidden ${selected ? 'w-[420px] flex-shrink-0' : 'flex-1'}`}>
          {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <AppIcon name="InboxIcon" size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-600 text-foreground">No notifications found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filtered.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type];
                const isActive = selected?.id === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleSelect(notif)}
                    className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group ${
                      isActive
                        ? 'bg-primary/8 border-l-2 border-primary'
                        : notif.status === 'unread' ?'bg-primary/3 hover:bg-secondary/40' :'hover:bg-secondary/30'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                      <AppIcon name={cfg.icon as any} size={15} className={cfg.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded border leading-none flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] font-600 text-muted-foreground truncate">{notif.taskId}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{notif.triggeredAt}</span>
                      </div>
                      <p className={`text-sm leading-snug truncate ${notif.status === 'unread' ? 'font-700 text-foreground' : 'font-500 text-foreground'}`}>
                        {notif.taskTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {notif.status === 'unread' && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      )}
                      <button
                        onClick={(e) => dismissNotif(notif.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary"
                        title="Dismiss"
                      >
                        <AppIcon name="XMarkIcon" size={12} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border bg-secondary/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{filtered.length} notification{filtered.length !== 1 ? 's' : ''}</span>
              <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            {/* Detail header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${TYPE_CONFIG[selected.type].bg}`}>
                  <AppIcon name={TYPE_CONFIG[selected.type].icon as any} size={17} className={TYPE_CONFIG[selected.type].color} />
                </div>
                <div>
                  <span className={`text-xs font-700 px-2 py-0.5 rounded border leading-none ${TYPE_CONFIG[selected.type].bg} ${TYPE_CONFIG[selected.type].color}`}>
                    {TYPE_CONFIG[selected.type].label}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{selected.triggeredAt}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <AppIcon name="XMarkIcon" size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* Detail body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Task info */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1.5">Task</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-700 px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    {selected.taskId}
                  </span>
                  {selected.priority && (
                    <span className={`text-xs font-600 px-2 py-0.5 rounded border capitalize ${PRIORITY_COLORS[selected.priority]}`}>
                      {selected.priority} priority
                    </span>
                  )}
                </div>
                <p className="text-base font-700 text-foreground leading-snug">{selected.taskTitle}</p>
                {selected.department && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-600">Department:</span> {selected.department}
                  </p>
                )}
              </div>

              {/* Rule info */}
              <div className="bg-secondary/40 rounded-lg p-3.5 border border-border">
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">Triggered by Rule</p>
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-md border flex items-center justify-center flex-shrink-0 ${TYPE_CONFIG[selected.type].bg}`}>
                    <AppIcon name={TYPE_CONFIG[selected.type].icon as any} size={13} className={TYPE_CONFIG[selected.type].color} />
                  </div>
                  <div>
                    <p className="text-sm font-700 text-foreground">{selected.ruleName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Rule ID: {selected.ruleId}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1.5">Details</p>
                <p className="text-sm text-foreground leading-relaxed">{selected.message}</p>
              </div>

              {/* Actor */}
              {selected.actor && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                    <AppIcon name="BoltIcon" size={11} className="text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">Triggered by <span className="font-600 text-foreground">{selected.actor}</span></span>
                </div>
              )}
            </div>

            {/* Detail actions */}
            <div className="px-5 py-3.5 border-t border-border bg-secondary/20 flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white text-sm font-600 hover:bg-primary/90 transition-colors">
                <AppIcon name="ArrowTopRightOnSquareIcon" size={14} />
                View Task
              </button>
              <button
                onClick={() => { markRead(selected.id); setSelected(null); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-sm font-500 text-muted-foreground transition-colors"
              >
                <AppIcon name="CheckIcon" size={14} />
                Dismiss
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-sm font-500 text-muted-foreground transition-colors ml-auto">
                <AppIcon name="BoltIcon" size={14} />
                View Rule
              </button>
            </div>
          </div>
        )}
      </div>

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
