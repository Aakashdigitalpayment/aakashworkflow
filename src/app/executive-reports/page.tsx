'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import AppIcon from '@/components/ui/AppIcon';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

// ─── Static Data ────────────────────────────────────────────────────────────

const DEPARTMENTS = ['All Departments', 'Administration', 'Finance', 'Credit/Loan', 'Recovery', 'HR', 'IT', 'Marketing', 'Membership'];
const TASK_TYPES = ['All Types', 'Financial Reporting', 'Loan Processing', 'Recovery', 'HR/Onboarding', 'IT/Infrastructure', 'Board/Meeting', 'Membership/KYC', 'Compliance'];
const USERS = ['All Users', 'Ram Prasad Adhikari', 'Sita Rana', 'Hari Bahadur Tamang', 'Gita Rai', 'Mohan Thapa', 'Sunita Karki', 'Binod Karki', 'Dipak Magar', 'Anita Shrestha', 'Suresh Pradhan'];

const completionTrendData = [
  { month: 'Baisakh', completed: 32, created: 38, slaBreached: 6, onTime: 26 },
  { month: 'Jestha', completed: 40, created: 45, slaBreached: 5, onTime: 35 },
  { month: 'Ashadh', completed: 43, created: 52, slaBreached: 9, onTime: 34 },
  { month: 'Shrawan', completed: 38, created: 41, slaBreached: 3, onTime: 35 },
  { month: 'Bhadra', completed: 49, created: 58, slaBreached: 9, onTime: 40 },
  { month: 'Ashwin', completed: 35, created: 47, slaBreached: 12, onTime: 23 },
];

const slaAdherenceData = [
  { dept: 'Administration', slaTarget: 48, avgResolution: 36, adherence: 88, breached: 4 },
  { dept: 'Finance', slaTarget: 72, avgResolution: 68, adherence: 74, breached: 6 },
  { dept: 'Credit/Loan', slaTarget: 96, avgResolution: 112, adherence: 62, breached: 9 },
  { dept: 'Recovery', slaTarget: 120, avgResolution: 98, adherence: 71, breached: 7 },
  { dept: 'HR', slaTarget: 48, avgResolution: 30, adherence: 95, breached: 1 },
  { dept: 'IT', slaTarget: 24, avgResolution: 22, adherence: 91, breached: 2 },
  { dept: 'Marketing', slaTarget: 72, avgResolution: 55, adherence: 93, breached: 1 },
];

const deptPerformanceData = [
  { dept: 'Admin', total: 42, completed: 35, overdue: 4, inProgress: 3, completionRate: 83 },
  { dept: 'Finance', total: 38, completed: 28, overdue: 6, inProgress: 4, completionRate: 74 },
  { dept: 'Credit', total: 61, completed: 44, overdue: 9, inProgress: 8, completionRate: 72 },
  { dept: 'Recovery', total: 29, completed: 18, overdue: 7, inProgress: 4, completionRate: 62 },
  { dept: 'HR', total: 22, completed: 19, overdue: 1, inProgress: 2, completionRate: 86 },
  { dept: 'IT', total: 18, completed: 15, overdue: 2, inProgress: 1, completionRate: 83 },
  { dept: 'Marketing', total: 14, completed: 11, overdue: 1, inProgress: 2, completionRate: 79 },
];

const approvalVelocityData = [
  { month: 'Baisakh', avgHours: 18, p50: 14, p90: 36, approved: 22, rejected: 3 },
  { month: 'Jestha', avgHours: 22, p50: 17, p90: 42, approved: 28, rejected: 4 },
  { month: 'Ashadh', avgHours: 31, p50: 24, p90: 58, approved: 19, rejected: 6 },
  { month: 'Shrawan', avgHours: 16, p50: 12, p90: 28, approved: 25, rejected: 2 },
  { month: 'Bhadra', avgHours: 27, p50: 20, p90: 48, approved: 31, rejected: 5 },
  { month: 'Ashwin', avgHours: 38, p50: 29, p90: 64, approved: 17, rejected: 8 },
];

const escalationData = [
  { month: 'Baisakh', total: 8, resolved: 6, pending: 2, avgResolutionDays: 2.1 },
  { month: 'Jestha', total: 11, resolved: 9, pending: 2, avgResolutionDays: 2.8 },
  { month: 'Ashadh', total: 15, resolved: 11, pending: 4, avgResolutionDays: 3.4 },
  { month: 'Shrawan', total: 7, resolved: 7, pending: 0, avgResolutionDays: 1.9 },
  { month: 'Bhadra', total: 18, resolved: 13, pending: 5, avgResolutionDays: 4.1 },
  { month: 'Ashwin', total: 22, resolved: 14, pending: 8, avgResolutionDays: 5.2 },
];

const escalationByDept = [
  { dept: 'Credit', count: 12, resolved: 8, rate: 67 },
  { dept: 'Finance', count: 9, resolved: 6, rate: 67 },
  { dept: 'Recovery', count: 8, resolved: 5, rate: 63 },
  { dept: 'Admin', count: 5, resolved: 4, rate: 80 },
  { dept: 'HR', count: 2, resolved: 2, rate: 100 },
  { dept: 'IT', count: 3, resolved: 3, rate: 100 },
  { dept: 'Marketing', count: 1, resolved: 1, rate: 100 },
];

const userPerformanceData = [
  { name: 'Ram Prasad Adhikari', dept: 'Administration', assigned: 18, completed: 15, overdue: 2, slaBreached: 1, approvalsPending: 3, rate: 83 },
  { name: 'Sita Rana', dept: 'Finance', assigned: 22, completed: 17, overdue: 4, slaBreached: 3, approvalsPending: 2, rate: 77 },
  { name: 'Hari Bahadur Tamang', dept: 'Credit/Loan', assigned: 31, completed: 24, overdue: 5, slaBreached: 4, approvalsPending: 5, rate: 77 },
  { name: 'Gita Rai', dept: 'Recovery', assigned: 14, completed: 12, overdue: 1, slaBreached: 1, approvalsPending: 1, rate: 86 },
  { name: 'Mohan Thapa', dept: 'HR', assigned: 11, completed: 10, overdue: 0, slaBreached: 0, approvalsPending: 0, rate: 91 },
  { name: 'Sunita Karki', dept: 'IT', assigned: 9, completed: 8, overdue: 1, slaBreached: 0, approvalsPending: 1, rate: 89 },
  { name: 'Binod Karki', dept: 'Credit/Loan', assigned: 27, completed: 19, overdue: 6, slaBreached: 5, approvalsPending: 4, rate: 70 },
  { name: 'Dipak Magar', dept: 'Credit/Loan', assigned: 19, completed: 13, overdue: 4, slaBreached: 3, approvalsPending: 2, rate: 68 },
];

const taskTypeData = [
  { type: 'Loan Processing', total: 61, completed: 44, overdue: 9, avgDays: 5.2, slaRate: 62 },
  { type: 'Financial Reporting', total: 38, completed: 28, overdue: 6, avgDays: 3.8, slaRate: 74 },
  { type: 'Recovery', total: 29, completed: 18, overdue: 7, avgDays: 6.1, slaRate: 62 },
  { type: 'HR/Onboarding', total: 22, completed: 19, overdue: 1, avgDays: 2.4, slaRate: 95 },
  { type: 'IT/Infrastructure', total: 18, completed: 15, overdue: 2, avgDays: 1.8, slaRate: 91 },
  { type: 'Board/Meeting', total: 14, completed: 11, overdue: 2, avgDays: 2.1, slaRate: 86 },
  { type: 'Membership/KYC', total: 12, completed: 9, overdue: 2, avgDays: 4.5, slaRate: 75 },
  { type: 'Compliance', total: 10, completed: 8, overdue: 1, avgDays: 3.2, slaRate: 80 },
];

const radarDeptData = [
  { subject: 'Completion', Admin: 83, Finance: 74, Credit: 72, HR: 86, IT: 83 },
  { subject: 'SLA Adherence', Admin: 88, Finance: 74, Credit: 62, HR: 95, IT: 91 },
  { subject: 'On-Time Rate', Admin: 80, Finance: 70, Credit: 60, HR: 92, IT: 88 },
  { subject: 'Approval Speed', Admin: 85, Finance: 72, Credit: 58, HR: 90, IT: 87 },
  { subject: 'Escalation Res.', Admin: 80, Finance: 67, Credit: 67, HR: 100, IT: 100 },
];

// ─── Tooltip ────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs">
        <p className="font-700 text-foreground mb-1.5">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-600 text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Tab Types ───────────────────────────────────────────────────────────────

type TabId = 'completion' | 'sla' | 'department' | 'approval' | 'escalation' | 'userwise' | 'tasktype';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'completion', label: 'Completion Trends', icon: 'ArrowTrendingUpIcon' },
  { id: 'sla', label: 'SLA Adherence', icon: 'ClockIcon' },
  { id: 'department', label: 'Department', icon: 'BuildingOffice2Icon' },
  { id: 'approval', label: 'Approval Velocity', icon: 'CheckBadgeIcon' },
  { id: 'escalation', label: 'Escalation', icon: 'ExclamationTriangleIcon' },
  { id: 'userwise', label: 'User-wise', icon: 'UsersIcon' },
  { id: 'tasktype', label: 'Task Type', icon: 'RectangleStackIcon' },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ExecutiveReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('completion');
  const [dateRange, setDateRange] = useState('this-fy');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedTaskType, setSelectedTaskType] = useState('All Types');

  // Derived KPIs
  const totalTasks = deptPerformanceData.reduce((s, d) => s + d.total, 0);
  const totalCompleted = deptPerformanceData.reduce((s, d) => s + d.completed, 0);
  const totalOverdue = deptPerformanceData.reduce((s, d) => s + d.overdue, 0);
  const overallSLA = Math.round(slaAdherenceData.reduce((s, d) => s + d.adherence, 0) / slaAdherenceData.length);
  const totalEscalations = escalationData.reduce((s, d) => s + d.total, 0);
  const avgApprovalHrs = Math.round(approvalVelocityData.reduce((s, d) => s + d.avgHours, 0) / approvalVelocityData.length);
  const completionRate = Math.round((totalCompleted / totalTasks) * 100);

  // Filtered user data
  const filteredUsers = useMemo(() => {
    let data = userPerformanceData;
    if (selectedDept !== 'All Departments') data = data.filter(u => u.dept === selectedDept);
    if (selectedUser !== 'All Users') data = data.filter(u => u.name === selectedUser);
    return data;
  }, [selectedDept, selectedUser]);

  const filteredTaskTypes = useMemo(() => {
    if (selectedTaskType !== 'All Types') return taskTypeData.filter(t => t.type === selectedTaskType);
    return taskTypeData;
  }, [selectedTaskType]);

  const filteredDepts = useMemo(() => {
    if (selectedDept !== 'All Departments') return deptPerformanceData.filter(d => d.dept.toLowerCase().includes(selectedDept.split('/')[0].toLowerCase().slice(0, 5)));
    return deptPerformanceData;
  }, [selectedDept]);

  return (
    <AppLayout onQuickCreate={() => {}}>
      <PreviewNotice module="Executive Reports" />
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <AppIcon name="PresentationChartLineIcon" size={17} className="text-primary" />
            </div>
            <h1 className="text-xl font-800 text-foreground">Executive Reports</h1>
          </div>
          <p className="text-xs text-muted-foreground ml-10">
            Task completion · SLA adherence · Department performance · Approval velocity · Escalation patterns
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-xs font-600 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors">
            <AppIcon name="ArrowDownTrayIcon" size={14} />
            Export PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-xs font-600 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors">
            <AppIcon name="TableCellsIcon" size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 mb-5 flex items-center gap-3 flex-wrap">
        <AppIcon name="FunnelIcon" size={15} className="text-muted-foreground flex-shrink-0" />
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-600 text-muted-foreground whitespace-nowrap">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="text-xs bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="this-fy">FY 2083/84</option>
              <option value="last-fy">FY 2082/83</option>
            </select>
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-600 text-muted-foreground whitespace-nowrap">Department</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="text-xs bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-600 text-muted-foreground whitespace-nowrap">User</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="text-xs bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-600 text-muted-foreground whitespace-nowrap">Task Type</label>
            <select
              value={selectedTaskType}
              onChange={e => setSelectedTaskType(e.target.value)}
              className="text-xs bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={() => { setDateRange('this-fy'); setSelectedDept('All Departments'); setSelectedUser('All Users'); setSelectedTaskType('All Types'); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <AppIcon name="XMarkIcon" size={13} />
          Reset
        </button>
      </div>

      {/* ── Executive KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
        {[
          { label: 'Total Tasks', value: totalTasks, sub: 'FY 2083/84', icon: 'RectangleStackIcon', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Completion Rate', value: `${completionRate}%`, sub: `${totalCompleted} completed`, icon: 'CheckCircleIcon', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'SLA Adherence', value: `${overallSLA}%`, sub: 'Org average', icon: 'ClockIcon', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Overdue Tasks', value: totalOverdue, sub: 'Needs attention', icon: 'ExclamationTriangleIcon', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Avg Approval', value: `${avgApprovalHrs}h`, sub: 'Turnaround time', icon: 'CheckBadgeIcon', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Escalations', value: totalEscalations, sub: 'This FY', icon: 'ArrowUpCircleIcon', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-shadow">
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-2.5`}>
              <AppIcon name={kpi.icon as any} size={16} className={kpi.color} />
            </div>
            <p className={`text-xl font-800 leading-none ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs font-600 text-foreground mt-1.5 leading-tight">{kpi.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-600 whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-secondary-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <AppIcon name={tab.icon as any} size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {/* COMPLETION TRENDS */}
      {activeTab === 'completion' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-700 text-foreground">Task Completion Trends</h3>
                  <p className="text-xs text-muted-foreground">Monthly created vs completed vs SLA breached</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={completionTrendData}>
                  <defs>
                    <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="created" stroke="#1e40af" fill="url(#gradCreated)" strokeWidth={2} dot={{ r: 3 }} name="Created" />
                  <Area type="monotone" dataKey="completed" stroke="#16a34a" fill="url(#gradCompleted)" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
                  <Line type="monotone" dataKey="slaBreached" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} name="SLA Breached" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">On-Time vs Breached</h3>
              <p className="text-xs text-muted-foreground mb-4">Cumulative FY 2083/84</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'On Time', value: completionTrendData.reduce((s, d) => s + d.onTime, 0), color: '#16a34a' },
                      { name: 'SLA Breached', value: completionTrendData.reduce((s, d) => s + d.slaBreached, 0), color: '#ef4444' },
                    ]}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}
                  >
                    <Cell fill="#16a34a" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {[{ label: 'On Time', color: '#16a34a', val: completionTrendData.reduce((s, d) => s + d.onTime, 0) }, { label: 'Breached', color: '#ef4444', val: completionTrendData.reduce((s, d) => s + d.slaBreached, 0) }].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-700 text-foreground">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly summary table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-700 text-foreground">Monthly Completion Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Month', 'Created', 'Completed', 'On Time', 'SLA Breached', 'Completion Rate', 'SLA Rate'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completionTrendData.map((row, i) => {
                    const cRate = Math.round((row.completed / row.created) * 100);
                    const sRate = Math.round((row.onTime / row.completed) * 100);
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-600 text-foreground">{row.month}</td>
                        <td className="px-4 py-3 text-foreground">{row.created}</td>
                        <td className="px-4 py-3 text-green-600 font-600">{row.completed}</td>
                        <td className="px-4 py-3 text-blue-600 font-600">{row.onTime}</td>
                        <td className="px-4 py-3 text-red-600 font-600">{row.slaBreached}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[60px]">
                              <div className={`h-full rounded-full ${cRate >= 80 ? 'bg-green-500' : cRate >= 65 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${cRate}%` }} />
                            </div>
                            <span className="text-xs font-700">{cRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-700 ${sRate >= 80 ? 'text-green-600' : sRate >= 65 ? 'text-amber-600' : 'text-red-600'}`}>{sRate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SLA ADHERENCE */}
      {activeTab === 'sla' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">SLA Adherence by Department</h3>
              <p className="text-xs text-muted-foreground mb-4">% of tasks resolved within SLA target</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={slaAdherenceData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="adherence" name="SLA Adherence %" radius={[4, 4, 0, 0]}>
                    {slaAdherenceData.map((entry, i) => (
                      <Cell key={i} fill={entry.adherence >= 85 ? '#16a34a' : entry.adherence >= 70 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Avg Resolution vs SLA Target (hrs)</h3>
              <p className="text-xs text-muted-foreground mb-4">Actual resolution time vs target</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={slaAdherenceData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="h" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="slaTarget" fill="#1e40af" name="SLA Target (h)" radius={[3, 3, 0, 0]} opacity={0.5} />
                  <Bar dataKey="avgResolution" fill="#ef4444" name="Avg Resolution (h)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-700 text-foreground">SLA Detail by Department</h3>
              <span className="text-xs text-muted-foreground">FY 2083/84</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Department', 'SLA Target (h)', 'Avg Resolution (h)', 'Adherence %', 'Breached Tasks', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slaAdherenceData.map((row, i) => {
                    const status = row.adherence >= 85 ? { label: 'On Track', cls: 'text-green-700 bg-green-50' } : row.adherence >= 70 ? { label: 'At Risk', cls: 'text-amber-700 bg-amber-50' } : { label: 'Breaching', cls: 'text-red-700 bg-red-50' };
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-600 text-foreground">{row.dept}</td>
                        <td className="px-4 py-3 text-foreground">{row.slaTarget}h</td>
                        <td className="px-4 py-3">
                          <span className={row.avgResolution > row.slaTarget ? 'text-red-600 font-600' : 'text-green-600 font-600'}>{row.avgResolution}h</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[70px]">
                              <div className={`h-full rounded-full ${row.adherence >= 85 ? 'bg-green-500' : row.adherence >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${row.adherence}%` }} />
                            </div>
                            <span className="text-xs font-700 text-foreground">{row.adherence}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-red-600 font-600">{row.breached}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT PERFORMANCE */}
      {activeTab === 'department' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Department Task Volume</h3>
              <p className="text-xs text-muted-foreground mb-4">Completed · In Progress · Overdue</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={filteredDepts} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="completed" fill="#16a34a" name="Completed" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="inProgress" fill="#8b5cf6" name="In Progress" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Dept Performance Radar</h3>
              <p className="text-xs text-muted-foreground mb-4">Multi-dimension comparison (top 5 depts)</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarDeptData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Radar name="Admin" dataKey="Admin" stroke="#1e40af" fill="#1e40af" fillOpacity={0.1} />
                  <Radar name="Finance" dataKey="Finance" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <Radar name="Credit" dataKey="Credit" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                  <Radar name="HR" dataKey="HR" stroke="#16a34a" fill="#16a34a" fillOpacity={0.1} />
                  <Radar name="IT" dataKey="IT" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-700 text-foreground">Department Performance Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Department', 'Total', 'Completed', 'In Progress', 'Overdue', 'Completion Rate', 'Performance'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptPerformanceData.map((row, i) => {
                    const perf = row.completionRate >= 85 ? { label: 'Excellent', cls: 'text-green-700 bg-green-50' } : row.completionRate >= 75 ? { label: 'Good', cls: 'text-blue-700 bg-blue-50' } : row.completionRate >= 65 ? { label: 'Fair', cls: 'text-amber-700 bg-amber-50' } : { label: 'Poor', cls: 'text-red-700 bg-red-50' };
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-600 text-foreground">{row.dept}</td>
                        <td className="px-4 py-3 text-foreground">{row.total}</td>
                        <td className="px-4 py-3 text-green-600 font-600">{row.completed}</td>
                        <td className="px-4 py-3 text-purple-600 font-600">{row.inProgress}</td>
                        <td className="px-4 py-3 text-red-600 font-600">{row.overdue}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[70px]">
                              <div className={`h-full rounded-full ${row.completionRate >= 80 ? 'bg-green-500' : row.completionRate >= 65 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${row.completionRate}%` }} />
                            </div>
                            <span className="text-xs font-700">{row.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${perf.cls}`}>{perf.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL VELOCITY */}
      {activeTab === 'approval' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Avg Approval Time', value: `${avgApprovalHrs}h`, sub: 'Monthly average', icon: 'ClockIcon', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Total Approved', value: approvalVelocityData.reduce((s, d) => s + d.approved, 0), sub: 'FY 2083/84', icon: 'CheckCircleIcon', color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Rejected', value: approvalVelocityData.reduce((s, d) => s + d.rejected, 0), sub: 'FY 2083/84', icon: 'XCircleIcon', color: 'text-red-600', bg: 'bg-red-50' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                  <AppIcon name={kpi.icon as any} size={20} className={kpi.color} />
                </div>
                <div>
                  <p className="text-xl font-800 text-foreground">{kpi.value}</p>
                  <p className="text-xs font-600 text-foreground">{kpi.label}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Approval Turnaround Time</h3>
              <p className="text-xs text-muted-foreground mb-4">Avg · P50 · P90 (hours)</p>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={approvalVelocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="h" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="avgHours" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Avg (h)" />
                  <Line type="monotone" dataKey="p50" stroke="#1e40af" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} name="P50 (h)" />
                  <Line type="monotone" dataKey="p90" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} name="P90 (h)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Approved vs Rejected</h3>
              <p className="text-xs text-muted-foreground mb-4">Monthly approval outcomes</p>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={approvalVelocityData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="approved" fill="#16a34a" name="Approved" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-700 text-foreground">Approval Velocity by Month</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Month', 'Avg Time (h)', 'P50 (h)', 'P90 (h)', 'Approved', 'Rejected', 'Approval Rate'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvalVelocityData.map((row, i) => {
                    const total = row.approved + row.rejected;
                    const rate = Math.round((row.approved / total) * 100);
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-600 text-foreground">{row.month}</td>
                        <td className="px-4 py-3 text-purple-600 font-600">{row.avgHours}h</td>
                        <td className="px-4 py-3 text-blue-600">{row.p50}h</td>
                        <td className="px-4 py-3 text-red-500">{row.p90}h</td>
                        <td className="px-4 py-3 text-green-600 font-600">{row.approved}</td>
                        <td className="px-4 py-3 text-red-600 font-600">{row.rejected}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[60px]">
                              <div className={`h-full rounded-full ${rate >= 85 ? 'bg-green-500' : rate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                            </div>
                            <span className="text-xs font-700">{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ESCALATION PATTERNS */}
      {activeTab === 'escalation' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Escalation Trend</h3>
              <p className="text-xs text-muted-foreground mb-4">Total · Resolved · Pending per month</p>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={escalationData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="resolved" fill="#16a34a" name="Resolved" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="pending" fill="#ef4444" name="Pending" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Avg Resolution Days</h3>
              <p className="text-xs text-muted-foreground mb-4">Days to resolve escalations</p>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={escalationData}>
                  <defs>
                    <linearGradient id="gradEsc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="d" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="avgResolutionDays" stroke="#f59e0b" fill="url(#gradEsc)" strokeWidth={2} dot={{ r: 3 }} name="Avg Days" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-700 text-foreground">Escalations by Department</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Department', 'Total Escalations', 'Resolved', 'Pending', 'Resolution Rate', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {escalationByDept.map((row, i) => {
                    const pending = row.count - row.resolved;
                    const status = row.rate >= 90 ? { label: 'Excellent', cls: 'text-green-700 bg-green-50' } : row.rate >= 70 ? { label: 'Good', cls: 'text-blue-700 bg-blue-50' } : { label: 'Needs Attention', cls: 'text-red-700 bg-red-50' };
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-600 text-foreground">{row.dept}</td>
                        <td className="px-4 py-3 font-700 text-foreground">{row.count}</td>
                        <td className="px-4 py-3 text-green-600 font-600">{row.resolved}</td>
                        <td className="px-4 py-3">
                          <span className={`font-600 ${pending > 0 ? 'text-red-600' : 'text-green-600'}`}>{pending}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[70px]">
                              <div className={`h-full rounded-full ${row.rate >= 85 ? 'bg-green-500' : row.rate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${row.rate}%` }} />
                            </div>
                            <span className="text-xs font-700">{row.rate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-700 text-foreground">Monthly Escalation Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Month', 'Total', 'Resolved', 'Pending', 'Avg Resolution (days)', 'Trend'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {escalationData.map((row, i) => {
                    const prev = escalationData[i - 1];
                    const trend = prev ? (row.total > prev.total ? '↑' : row.total < prev.total ? '↓' : '→') : '—';
                    const trendColor = trend === '↑' ? 'text-red-500' : trend === '↓' ? 'text-green-500' : 'text-muted-foreground';
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-600 text-foreground">{row.month}</td>
                        <td className="px-4 py-3 font-700 text-foreground">{row.total}</td>
                        <td className="px-4 py-3 text-green-600 font-600">{row.resolved}</td>
                        <td className="px-4 py-3 text-red-600 font-600">{row.pending}</td>
                        <td className="px-4 py-3 text-amber-600 font-600">{row.avgResolutionDays}d</td>
                        <td className={`px-4 py-3 font-700 text-lg ${trendColor}`}>{trend}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER-WISE */}
      {activeTab === 'userwise' && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-700 text-foreground mb-1">User Completion Rate</h3>
            <p className="text-xs text-muted-foreground mb-4">Task completion % by employee</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredUsers} barSize={20} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={160} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" name="Completion %" radius={[0, 4, 4, 0]}>
                  {filteredUsers.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 85 ? '#16a34a' : entry.rate >= 75 ? '#1e40af' : entry.rate >= 65 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-700 text-foreground">User Performance Detail</h3>
              <span className="text-xs text-muted-foreground">{filteredUsers.length} users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Employee', 'Department', 'Assigned', 'Completed', 'Overdue', 'SLA Breached', 'Pending Approvals', 'Rate'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((emp, i) => (
                    <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-700 text-primary">
                              {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </span>
                          </div>
                          <span className="font-600 text-foreground text-xs">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{emp.dept}</td>
                      <td className="px-4 py-3 text-foreground">{emp.assigned}</td>
                      <td className="px-4 py-3 text-green-600 font-600">{emp.completed}</td>
                      <td className="px-4 py-3">
                        <span className={`font-600 ${emp.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>{emp.overdue}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-600 ${emp.slaBreached > 0 ? 'text-amber-600' : 'text-green-600'}`}>{emp.slaBreached}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-600 ${emp.approvalsPending > 0 ? 'text-purple-600' : 'text-muted-foreground'}`}>{emp.approvalsPending}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[60px]">
                            <div className={`h-full rounded-full ${emp.rate >= 85 ? 'bg-green-500' : emp.rate >= 75 ? 'bg-blue-500' : emp.rate >= 65 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${emp.rate}%` }} />
                          </div>
                          <span className="text-xs font-700">{emp.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TASK TYPE */}
      {activeTab === 'tasktype' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Task Volume by Type</h3>
              <p className="text-xs text-muted-foreground mb-4">Completed vs Overdue</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={filteredTaskTypes} barSize={14} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 9, fill: '#64748b' }} width={130} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="completed" fill="#16a34a" name="Completed" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">SLA Rate by Task Type</h3>
              <p className="text-xs text-muted-foreground mb-4">% tasks completed within SLA</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={filteredTaskTypes} barSize={14} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 9, fill: '#64748b' }} width={130} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="slaRate" name="SLA Rate %" radius={[0, 4, 4, 0]}>
                    {filteredTaskTypes.map((entry, i) => (
                      <Cell key={i} fill={entry.slaRate >= 85 ? '#16a34a' : entry.slaRate >= 70 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-700 text-foreground">Task Type Performance Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Task Type', 'Total', 'Completed', 'Overdue', 'Avg Days', 'SLA Rate', 'Completion Rate'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTaskTypes.map((row, i) => {
                    const cRate = Math.round((row.completed / row.total) * 100);
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-600 text-foreground">{row.type}</td>
                        <td className="px-4 py-3 text-foreground">{row.total}</td>
                        <td className="px-4 py-3 text-green-600 font-600">{row.completed}</td>
                        <td className="px-4 py-3">
                          <span className={`font-600 ${row.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>{row.overdue}</span>
                        </td>
                        <td className="px-4 py-3 text-amber-600 font-600">{row.avgDays}d</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-700 ${row.slaRate >= 85 ? 'text-green-600' : row.slaRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{row.slaRate}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[70px]">
                              <div className={`h-full rounded-full ${cRate >= 80 ? 'bg-green-500' : cRate >= 65 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${cRate}%` }} />
                            </div>
                            <span className="text-xs font-700">{cRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
