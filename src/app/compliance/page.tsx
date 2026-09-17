'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

type EventCategory = 'all' | 'admin_action' | 'user_login' | 'bulk_operation' | 'setting_change';
type Severity = 'info' | 'warning' | 'critical' | 'success';

interface ComplianceEvent {
  id: string;
  timestamp: string;
  date: string;
  user: string;
  userInitials: string;
  userColor: string;
  role: string;
  category: Exclude<EventCategory, 'all'>;
  action: string;
  target: string;
  detail: string;
  severity: Severity;
  ipAddress: string;
  department: string;
  status: 'success' | 'failed' | 'pending';
}

const events: ComplianceEvent[] = [
  // Admin Actions
  { id: 'c-001', timestamp: '14:32:11', date: '16 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', role: 'Super Admin', category: 'admin_action', action: 'Deleted user account', target: 'Binod Thapa (binod.thapa@aakash.com)', detail: 'Account permanently removed. Data archived for 90 days.', severity: 'critical', ipAddress: '192.168.1.45', department: 'Administration', status: 'success' },
  { id: 'c-002', timestamp: '13:15:44', date: '16 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', role: 'Super Admin', category: 'admin_action', action: 'Assigned role to user', target: 'Sita Sharma → Department Head', detail: 'Role elevated from Staff to Department Head in Finance.', severity: 'warning', ipAddress: '192.168.1.45', department: 'Administration', status: 'success' },
  { id: 'c-003', timestamp: '11:02:30', date: '16 Ashwin 2083', user: 'Mohan Thapa', userInitials: 'MT', userColor: 'bg-cyan-100 text-cyan-700', role: 'Admin', category: 'admin_action', action: 'Reset user password', target: 'Hari Bahadur Tamang', detail: 'Temporary password issued. User must change on next login.', severity: 'warning', ipAddress: '10.0.0.12', department: 'IT', status: 'success' },
  { id: 'c-004', timestamp: '09:48:05', date: '16 Ashwin 2083', user: 'Sunita Karki', userInitials: 'SK', userColor: 'bg-teal-100 text-teal-700', role: 'Admin', category: 'admin_action', action: 'Created new department', target: 'Digital Banking Division', detail: 'New department created with 0 members. Head: Unassigned.', severity: 'info', ipAddress: '10.0.0.18', department: 'Administration', status: 'success' },
  { id: 'c-005', timestamp: '08:30:22', date: '16 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', role: 'Super Admin', category: 'admin_action', action: 'Revoked user access', target: 'Prakash Joshi — Finance module', detail: 'Access to Finance reports revoked pending audit.', severity: 'critical', ipAddress: '192.168.1.45', department: 'Administration', status: 'success' },

  // User Logins
  { id: 'c-006', timestamp: '14:55:00', date: '16 Ashwin 2083', user: 'Gita Rai', userInitials: 'GR', userColor: 'bg-pink-100 text-pink-700', role: 'Staff', category: 'user_login', action: 'Successful login', target: 'Web Application', detail: 'Browser: Chrome 128 · OS: Windows 11', severity: 'info', ipAddress: '192.168.2.31', department: 'Recovery', status: 'success' },
  { id: 'c-007', timestamp: '14:22:18', date: '16 Ashwin 2083', user: 'Unknown', userInitials: '??', userColor: 'bg-red-100 text-red-700', role: '—', category: 'user_login', action: 'Failed login attempt', target: 'admin@aakashcoop.com', detail: '3rd consecutive failure. Account temporarily locked for 15 min.', severity: 'critical', ipAddress: '203.0.113.42', department: '—', status: 'failed' },
  { id: 'c-008', timestamp: '10:10:55', date: '16 Ashwin 2083', user: 'Dipak Shrestha', userInitials: 'DS', userColor: 'bg-orange-100 text-orange-700', role: 'Staff', category: 'user_login', action: 'Successful login', target: 'Mobile App', detail: 'Browser: Safari · OS: iOS 17.4', severity: 'info', ipAddress: '192.168.3.77', department: 'Marketing', status: 'success' },
  { id: 'c-009', timestamp: '09:05:33', date: '16 Ashwin 2083', user: 'Kamala Gurung', userInitials: 'KG', userColor: 'bg-teal-100 text-teal-700', role: 'Staff', category: 'user_login', action: 'Session expired — auto logout', target: 'Web Application', detail: 'Session idle for 30 minutes. Auto-logout triggered.', severity: 'info', ipAddress: '192.168.1.90', department: 'Membership', status: 'success' },
  { id: 'c-010', timestamp: '17:45:12', date: '15 Ashwin 2083', user: 'Unknown', userInitials: '??', userColor: 'bg-red-100 text-red-700', role: '—', category: 'user_login', action: 'Failed login attempt', target: 'rajesh.shrestha@aakashcoop.com', detail: 'Suspicious IP detected. Login blocked by firewall rule.', severity: 'critical', ipAddress: '198.51.100.7', department: '—', status: 'failed' },

  // Bulk Operations
  { id: 'c-011', timestamp: '13:40:00', date: '16 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', role: 'Super Admin', category: 'bulk_operation', action: 'Bulk task assignment', target: '47 tasks → Finance Department', detail: 'All pending Q1 audit tasks reassigned to Finance team.', severity: 'warning', ipAddress: '192.168.1.45', department: 'Finance', status: 'success' },
  { id: 'c-012', timestamp: '11:30:00', date: '16 Ashwin 2083', user: 'Mohan Thapa', userInitials: 'MT', userColor: 'bg-cyan-100 text-cyan-700', role: 'Admin', category: 'bulk_operation', action: 'Bulk user import', target: '12 new employees', detail: 'CSV import: 12 users created, 0 failed. Departments: HR (4), IT (5), Finance (3).', severity: 'info', ipAddress: '10.0.0.12', department: 'HR', status: 'success' },
  { id: 'c-013', timestamp: '10:00:00', date: '15 Ashwin 2083', user: 'Sunita Karki', userInitials: 'SK', userColor: 'bg-teal-100 text-teal-700', role: 'Admin', category: 'bulk_operation', action: 'Bulk status update', target: '23 overdue tasks → Escalated', detail: 'Auto-escalation triggered for tasks overdue by >48 hours.', severity: 'warning', ipAddress: '10.0.0.18', department: 'Administration', status: 'success' },
  { id: 'c-014', timestamp: '16:20:00', date: '14 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', role: 'Super Admin', category: 'bulk_operation', action: 'Bulk data export', target: 'All employee records (156 rows)', detail: 'Full employee data exported to CSV. Reason: Annual audit.', severity: 'critical', ipAddress: '192.168.1.45', department: 'Administration', status: 'success' },
  { id: 'c-015', timestamp: '09:15:00', date: '14 Ashwin 2083', user: 'Mohan Thapa', userInitials: 'MT', userColor: 'bg-cyan-100 text-cyan-700', role: 'Admin', category: 'bulk_operation', action: 'Bulk notification send', target: '89 users — Deadline reminder', detail: 'Mass notification sent for Dashain deadline. Channel: Email + In-App.', severity: 'info', ipAddress: '10.0.0.12', department: 'Administration', status: 'success' },

  // Setting Changes
  { id: 'c-016', timestamp: '12:05:00', date: '16 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', role: 'Super Admin', category: 'setting_change', action: 'Changed SMTP configuration', target: 'Email Server Settings', detail: 'SMTP host updated from smtp.old.com to smtp.aakashcoop.com.', severity: 'warning', ipAddress: '192.168.1.45', department: 'IT', status: 'success' },
  { id: 'c-017', timestamp: '10:45:00', date: '16 Ashwin 2083', user: 'Sunita Karki', userInitials: 'SK', userColor: 'bg-teal-100 text-teal-700', role: 'Admin', category: 'setting_change', action: 'Updated escalation rules', target: 'Escalation Chain — Finance', detail: 'Escalation threshold changed from 72h to 48h for Finance tasks.', severity: 'warning', ipAddress: '10.0.0.18', department: 'Finance', status: 'success' },
  { id: 'c-018', timestamp: '09:30:00', date: '15 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', role: 'Super Admin', category: 'setting_change', action: 'Modified task ID format', target: 'Task ID Configuration', detail: 'Format changed: TASK-YYYY-NNNN → DEPT-YYYY-MM-NNNN.', severity: 'info', ipAddress: '192.168.1.45', department: 'Administration', status: 'success' },
  { id: 'c-019', timestamp: '15:00:00', date: '14 Ashwin 2083', user: 'Mohan Thapa', userInitials: 'MT', userColor: 'bg-cyan-100 text-cyan-700', role: 'Admin', category: 'setting_change', action: 'Enabled two-factor authentication', target: 'Security Settings — All Admin accounts', detail: '2FA enforced for all Admin and Super Admin roles.', severity: 'info', ipAddress: '10.0.0.12', department: 'IT', status: 'success' },
  { id: 'c-020', timestamp: '11:20:00', date: '14 Ashwin 2083', user: 'Rajesh Kumar Shrestha', userInitials: 'RK', userColor: 'bg-blue-100 text-blue-700', role: 'Super Admin', category: 'setting_change', action: 'Changed backup schedule', target: 'Backup & Restore Settings', detail: 'Auto-backup frequency changed from weekly to daily at 02:00 AM.', severity: 'info', ipAddress: '192.168.1.45', department: 'IT', status: 'success' },
];

const categoryConfig: Record<Exclude<EventCategory, 'all'>, { label: string; color: string; icon: string; bg: string }> = {
  admin_action: { label: 'Admin Action', color: 'text-violet-700', icon: 'ShieldCheckIcon', bg: 'bg-violet-50 border-violet-200' },
  user_login: { label: 'User Login', color: 'text-blue-700', icon: 'ArrowRightOnRectangleIcon', bg: 'bg-blue-50 border-blue-200' },
  bulk_operation: { label: 'Bulk Operation', color: 'text-amber-700', icon: 'RectangleStackIcon', bg: 'bg-amber-50 border-amber-200' },
  setting_change: { label: 'Setting Change', color: 'text-emerald-700', icon: 'Cog6ToothIcon', bg: 'bg-emerald-50 border-emerald-200' },
};

const severityConfig: Record<Severity, { label: string; dot: string; text: string }> = {
  info: { label: 'Info', dot: 'bg-blue-400', text: 'text-blue-600' },
  warning: { label: 'Warning', dot: 'bg-amber-400', text: 'text-amber-600' },
  critical: { label: 'Critical', dot: 'bg-red-500', text: 'text-red-600' },
  success: { label: 'Success', dot: 'bg-emerald-400', text: 'text-emerald-600' },
};

const departments = ['All Departments', 'Administration', 'Finance', 'Credit', 'Recovery', 'HR', 'IT', 'Marketing', 'Membership'];
const roles = ['All Roles', 'Super Admin', 'Admin', 'Department Head', 'Staff'];
const severities: Array<'all' | Severity> = ['all', 'critical', 'warning', 'info'];
const statuses = ['all', 'success', 'failed', 'pending'] as const;

const DATE_RANGES = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Custom'] as const;

function exportToCSV(data: ComplianceEvent[]) {
  const headers = ['ID', 'Date', 'Time', 'User', 'Role', 'Department', 'Category', 'Action', 'Target', 'Detail', 'Severity', 'Status', 'IP Address'];
  const rows = data.map(e => [
    e.id, e.date, e.timestamp, e.user, e.role, e.department,
    categoryConfig[e.category].label, e.action, e.target, e.detail,
    e.severity, e.status, e.ipAddress,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compliance-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ComplianceDashboardPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EventCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All Departments');
  const [filterRole, setFilterRole] = useState('All Roles');
  const [filterSeverity, setFilterSeverity] = useState<'all' | Severity>('all');
  const [filterStatus, setFilterStatus] = useState<typeof statuses[number]>('all');
  const [dateRange, setDateRange] = useState<typeof DATE_RANGES[number]>('Last 7 Days');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchCat = activeCategory === 'all' || e.category === activeCategory;
      const matchSearch = !searchQuery ||
        e.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.ipAddress.includes(searchQuery);
      const matchDept = filterDept === 'All Departments' || e.department === filterDept;
      const matchRole = filterRole === 'All Roles' || e.role === filterRole;
      const matchSev = filterSeverity === 'all' || e.severity === filterSeverity;
      const matchStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchCat && matchSearch && matchDept && matchRole && matchSev && matchStatus;
    });
  }, [activeCategory, searchQuery, filterDept, filterRole, filterSeverity, filterStatus]);

  // Summary counts
  const counts = useMemo(() => ({
    total: events.length,
    admin_action: events.filter(e => e.category === 'admin_action').length,
    user_login: events.filter(e => e.category === 'user_login').length,
    bulk_operation: events.filter(e => e.category === 'bulk_operation').length,
    setting_change: events.filter(e => e.category === 'setting_change').length,
    critical: events.filter(e => e.severity === 'critical').length,
    failed: events.filter(e => e.status === 'failed').length,
  }), []);

  // Group filtered by date
  const grouped = useMemo(() => {
    const g: Record<string, ComplianceEvent[]> = {};
    filtered.forEach(e => {
      if (!g[e.date]) g[e.date] = [];
      g[e.date].push(e);
    });
    return g;
  }, [filtered]);

  const hasActiveFilters = activeCategory !== 'all' || searchQuery || filterDept !== 'All Departments' || filterRole !== 'All Roles' || filterSeverity !== 'all' || filterStatus !== 'all';

  function resetFilters() {
    setActiveCategory('all');
    setSearchQuery('');
    setFilterDept('All Departments');
    setFilterRole('All Roles');
    setFilterSeverity('all');
    setFilterStatus('all');
  }

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      <PreviewNotice module="Compliance" />
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Compliance Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit trail of admin actions, user logins, bulk operations &amp; setting changes
            &nbsp;·&nbsp; <span className="font-600 text-foreground">{filtered.length}</span> of {events.length} events
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range */}
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as typeof dateRange)}
            className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground cursor-pointer"
          >
            {DATE_RANGES.map(d => <option key={d}>{d}</option>)}
          </select>
          <button
            onClick={() => exportToCSV(filtered)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-600 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
          >
            <AppIcon name="ArrowDownTrayIcon" size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {/* Total */}
        <button
          onClick={() => setActiveCategory('all')}
          className={`col-span-1 flex flex-col items-start p-3 rounded-xl border transition-all ${activeCategory === 'all' ? 'bg-foreground text-background border-foreground' : 'bg-card border-border hover:border-foreground/30'}`}
        >
          <span className={`text-2xl font-700 leading-none mb-1 ${activeCategory === 'all' ? 'text-background' : 'text-foreground'}`}>{counts.total}</span>
          <span className={`text-[11px] font-600 ${activeCategory === 'all' ? 'text-background/70' : 'text-muted-foreground'}`}>Total Events</span>
        </button>

        {/* Category cards */}
        {(Object.keys(categoryConfig) as Exclude<EventCategory, 'all'>[]).map(cat => {
          const cfg = categoryConfig[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex flex-col items-start p-3 rounded-xl border transition-all ${isActive ? `${cfg.bg} border-current` : 'bg-card border-border hover:border-foreground/20'}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <AppIcon name={cfg.icon as any} size={14} className={isActive ? cfg.color : 'text-muted-foreground'} />
                <span className={`text-2xl font-700 leading-none ${isActive ? cfg.color : 'text-foreground'}`}>{counts[cat]}</span>
              </div>
              <span className={`text-[11px] font-600 ${isActive ? cfg.color : 'text-muted-foreground'}`}>{cfg.label}</span>
            </button>
          );
        })}

        {/* Critical */}
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all ${filterSeverity === 'critical' ? 'bg-red-50 border-red-300' : 'bg-card border-border hover:border-red-200'}`}
        >
          <span className={`text-2xl font-700 leading-none mb-1 ${filterSeverity === 'critical' ? 'text-red-600' : 'text-foreground'}`}>{counts.critical}</span>
          <span className={`text-[11px] font-600 ${filterSeverity === 'critical' ? 'text-red-600' : 'text-muted-foreground'}`}>Critical</span>
        </button>

        {/* Failed */}
        <button
          onClick={() => setFilterStatus(filterStatus === 'failed' ? 'all' : 'failed')}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all ${filterStatus === 'failed' ? 'bg-red-50 border-red-300' : 'bg-card border-border hover:border-red-200'}`}
        >
          <span className={`text-2xl font-700 leading-none mb-1 ${filterStatus === 'failed' ? 'text-red-600' : 'text-foreground'}`}>{counts.failed}</span>
          <span className={`text-[11px] font-600 ${filterStatus === 'failed' ? 'text-red-600' : 'text-muted-foreground'}`}>Failed</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <AppIcon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search user, action, target, IP..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground cursor-pointer">
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>

        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground cursor-pointer">
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>

        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value as typeof filterSeverity)} className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground cursor-pointer">
          {severities.map(s => <option key={s} value={s}>{s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)} className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground cursor-pointer">
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        {hasActiveFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-600 text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg hover:border-foreground/30 transition-all">
            <AppIcon name="XMarkIcon" size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Event Log */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <AppIcon name="ShieldCheckIcon" size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-600 text-foreground mb-1">No matching compliance events</p>
          <p className="text-xs text-muted-foreground">Adjust your filters or search query</p>
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

              <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {entries.map(event => {
                  const catCfg = categoryConfig[event.category];
                  const sevCfg = severityConfig[event.severity];
                  const isExpanded = expandedId === event.id;

                  return (
                    <div key={event.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Main Row */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : event.id)}
                        className="w-full flex items-start gap-4 px-5 py-4 text-left"
                      >
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full ${event.userColor} flex items-center justify-center flex-shrink-0 text-xs font-700 mt-0.5`}>
                          {event.userInitials}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground leading-snug">
                                <span className="font-700">{event.user}</span>
                                <span className="text-muted-foreground"> — </span>
                                <span className="font-600">{event.action}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.target}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-[10px] font-600 text-muted-foreground font-tabular">{event.timestamp}</span>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="text-[10px] text-muted-foreground">{event.role}</span>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="text-[10px] text-muted-foreground">{event.department}</span>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="text-[10px] font-500 text-muted-foreground font-mono">{event.ipAddress}</span>
                              </div>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Status */}
                              <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full border ${
                                event.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                event.status === 'failed'? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </span>

                              {/* Severity dot */}
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${sevCfg.dot}`} />
                                <span className={`text-[10px] font-600 ${sevCfg.text}`}>{sevCfg.label}</span>
                              </div>

                              {/* Category */}
                              <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full border ${catCfg.bg} ${catCfg.color}`}>
                                {catCfg.label}
                              </span>

                              {/* Expand chevron */}
                              <AppIcon
                                name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                                size={14}
                                className="text-muted-foreground ml-1"
                              />
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <div className="px-5 pb-4 ml-13 pl-[3.25rem]">
                          <div className="bg-secondary/40 border border-border rounded-xl p-4">
                            <div className="flex items-start gap-2 mb-2">
                              <AppIcon name="InformationCircleIcon" size={15} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-foreground leading-relaxed">{event.detail}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <AppIcon name="ComputerDesktopIcon" size={13} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">IP: <span className="font-600 text-foreground font-mono">{event.ipAddress}</span></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <AppIcon name="TagIcon" size={13} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Event ID: <span className="font-600 text-foreground font-mono">{event.id.toUpperCase()}</span></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <AppIcon name="BuildingOffice2Icon" size={13} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Department: <span className="font-600 text-foreground">{event.department}</span></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <AppIcon name="ClockIcon" size={13} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{event.date} at {event.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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
