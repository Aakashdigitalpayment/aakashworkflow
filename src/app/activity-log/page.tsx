'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

interface ActivityEntry {
  id: string;
  time: string;
  date: string;
  user: string;
  userInitials: string;
  userColor: string;
  action: string;
  actionType: 'created' | 'assigned' | 'status' | 'comment' | 'attachment' | 'approved' | 'forwarded' | 'sent_back' | 'completed' | 'overdue';
  target: string;
  taskId: string;
  department: string;
  detail?: string;
}

const activityLog: ActivityEntry[] = [
  { id: 'log-001', time: '14:22', date: '16 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', action: 'assigned task to Sita Sharma', actionType: 'assigned', target: 'Monthly MIS Report', taskId: 'FIN-2083-00431', department: 'Finance', detail: 'Priority: Critical · Due: 17 Ashwin' },
  { id: 'log-002', time: '11:45', date: '16 Ashwin 2083', user: 'Ram Prasad Adhikari', userInitials: 'RA', userColor: 'bg-violet-100 text-violet-700', action: 'changed status to In Progress', actionType: 'status', target: 'Annual Meeting Agenda', taskId: 'ADM-2083-00125', department: 'Administration', detail: 'Previous: Accepted' },
  { id: 'log-003', time: '10:30', date: '16 Ashwin 2083', user: 'Sita Sharma', userInitials: 'SS', userColor: 'bg-emerald-100 text-emerald-700', action: 'added a comment', actionType: 'comment', target: 'Monthly MIS Report', taskId: 'FIN-2083-00431', department: 'Finance', detail: '"Data collection completed. Awaiting verification from Credit dept."' },
  { id: 'log-004', time: '09:55', date: '16 Ashwin 2083', user: 'Hari Bahadur Tamang', userInitials: 'HT', userColor: 'bg-amber-100 text-amber-700', action: 'uploaded attachment', actionType: 'attachment', target: 'Loan Application Review', taskId: 'CRD-2083-00187', department: 'Credit', detail: 'loan_application_form_v2.pdf · 2.4 MB' },
  { id: 'log-005', time: '09:20', date: '16 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', action: 'created task', actionType: 'created', target: 'AGM Agenda Preparation', taskId: 'ADM-2083-00125', department: 'Administration', detail: 'Assigned to Administration Department · Due: 16 Ashwin' },
  { id: 'log-006', time: '16:10', date: '15 Ashwin 2083', user: 'Gita Rai', userInitials: 'GR', userColor: 'bg-pink-100 text-pink-700', action: 'submitted for review', actionType: 'forwarded', target: 'Recovery Report — Bhadra 2083', taskId: 'REC-2083-00055', department: 'Recovery', detail: 'Forwarded to Department Head for review' },
  { id: 'log-007', time: '14:30', date: '15 Ashwin 2083', user: 'Mohan Thapa', userInitials: 'MT', userColor: 'bg-cyan-100 text-cyan-700', action: 'approved task', actionType: 'approved', target: 'Employee Onboarding — Dipak Shrestha', taskId: 'HR-2083-00089', department: 'HR', detail: 'Task marked as Completed' },
  { id: 'log-008', time: '11:00', date: '15 Ashwin 2083', user: 'Sunita Karki', userInitials: 'SK', userColor: 'bg-teal-100 text-teal-700', action: 'sent task back for revision', actionType: 'sent_back', target: 'System Backup Verification', taskId: 'IT-2083-00031', department: 'IT', detail: 'Reason: Backup log file missing for Bhadra 30' },
  { id: 'log-009', time: '09:15', date: '15 Ashwin 2083', user: 'Dipak Shrestha', userInitials: 'DS', userColor: 'bg-orange-100 text-orange-700', action: 'changed progress to 75%', actionType: 'status', target: 'Marketing Campaign — Dashain', taskId: 'MKT-2083-00012', department: 'Marketing', detail: 'Previous: 50%' },
  { id: 'log-010', time: '17:05', date: '14 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', action: 'marked task as overdue', actionType: 'overdue', target: 'Loan Application Review', taskId: 'CRD-2083-00187', department: 'Credit', detail: 'Overdue by 2 days · Escalation sent to Department Head' },
  { id: 'log-011', time: '14:00', date: '14 Ashwin 2083', user: 'Kamala Gurung', userInitials: 'KG', userColor: 'bg-teal-100 text-teal-700', action: 'completed task', actionType: 'completed', target: 'Member Registration Drive', taskId: 'MEM-2083-00008', department: 'Membership', detail: '100% complete · Closed by Department Head' },
  { id: 'log-012', time: '10:30', date: '14 Ashwin 2083', user: 'Prakash Joshi', userInitials: 'PJ', userColor: 'bg-emerald-100 text-emerald-700', action: 'forwarded task to Finance Head', actionType: 'forwarded', target: 'Payment Approval — Vendor Invoice', taskId: 'FIN-2083-00428', department: 'Finance', detail: 'Reason: Requires senior approval for amount > NPR 5 Lakh' },
];

const actionConfig: Record<string, { label: string; color: string; icon: string }> = {
  created: { label: 'Created', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'PlusCircleIcon' },
  assigned: { label: 'Assigned', color: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'UserPlusIcon' },
  status: { label: 'Status', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'ArrowPathIcon' },
  comment: { label: 'Comment', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: 'ChatBubbleLeftIcon' },
  attachment: { label: 'Attachment', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: 'PaperClipIcon' },
  approved: { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200', icon: 'CheckCircleIcon' },
  forwarded: { label: 'Forwarded', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'ArrowRightCircleIcon' },
  sent_back: { label: 'Sent Back', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: 'ArrowUturnLeftIcon' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'CheckBadgeIcon' },
  overdue: { label: 'Overdue', color: 'bg-red-50 text-red-700 border-red-200', icon: 'ExclamationCircleIcon' },
};

const actionTypes = ['all', 'created', 'assigned', 'status', 'comment', 'attachment', 'approved', 'forwarded', 'sent_back', 'completed', 'overdue'];

export default function ActivityLogPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDept, setFilterDept] = useState('all');

  const departments = ['all', 'Administration', 'Finance', 'Credit', 'Recovery', 'HR', 'IT', 'Marketing', 'Membership'];

  const filtered = activityLog.filter(log => {
    const matchSearch = searchQuery === '' ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.taskId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || log.actionType === filterType;
    const matchDept = filterDept === 'all' || log.department === filterDept;
    return matchSearch && matchType && matchDept;
  });

  // Group by date
  const grouped: Record<string, ActivityEntry[]> = {};
  filtered.forEach(log => {
    if (!grouped[log.date]) grouped[log.date] = [];
    grouped[log.date].push(log);
  });

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete audit trail of all system actions &nbsp;·&nbsp; {activityLog.length} entries</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-600 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all border border-border">
          <AppIcon name="ArrowDownTrayIcon" size={15} />
          Export Log
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <AppIcon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user, task, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Department Filter */}
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground cursor-pointer"
        >
          {departments.map(d => (
            <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
          ))}
        </select>
      </div>

      {/* Action Type Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {actionTypes.map(type => {
          const cfg = type === 'all' ? null : actionConfig[type];
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-600 rounded-full border transition-all capitalize ${
                filterType === type
                  ? type === 'all' ? 'bg-foreground text-background border-foreground' : `${cfg?.color} border`
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
              }`}
            >
              {type === 'all' ? 'All Actions' : cfg?.label}
            </button>
          );
        })}
      </div>

      {/* Log Entries */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <AppIcon name="ClockIcon" size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-600 text-foreground mb-1">No matching entries</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-700 text-muted-foreground px-2">{date}</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Entries */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {entries.map(log => {
                  const cfg = actionConfig[log.actionType];
                  return (
                    <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors group">
                      {/* User Avatar */}
                      <div className={`w-9 h-9 rounded-full ${log.userColor} flex items-center justify-center flex-shrink-0 text-xs font-700`}>
                        {log.userInitials}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-snug">
                              <span className="font-700">{log.user}</span>
                              <span className="text-muted-foreground"> {log.action} </span>
                              <span className="font-600 text-foreground">{log.target}</span>
                            </p>
                            {log.detail && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{log.detail}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-600 text-muted-foreground font-tabular">{log.time}</span>
                              <span className="text-muted-foreground/40">·</span>
                              <span className="text-[10px] text-muted-foreground">{log.taskId}</span>
                              <span className="text-muted-foreground/40">·</span>
                              <span className="text-[10px] text-muted-foreground">{log.department}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
