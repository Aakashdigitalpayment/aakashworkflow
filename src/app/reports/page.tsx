'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const departmentData = [
  { dept: 'Admin', total: 42, completed: 35, overdue: 4, inProgress: 3 },
  { dept: 'Finance', total: 38, completed: 28, overdue: 6, inProgress: 4 },
  { dept: 'Credit', total: 61, completed: 44, overdue: 9, inProgress: 8 },
  { dept: 'Recovery', total: 29, completed: 18, overdue: 7, inProgress: 4 },
  { dept: 'HR', total: 22, completed: 19, overdue: 1, inProgress: 2 },
  { dept: 'IT', total: 18, completed: 15, overdue: 2, inProgress: 1 },
  { dept: 'Marketing', total: 14, completed: 11, overdue: 1, inProgress: 2 },
];

const trendData = [
  { month: 'Baisakh', created: 38, completed: 32, overdue: 6 },
  { month: 'Jestha', created: 45, completed: 40, overdue: 5 },
  { month: 'Ashadh', created: 52, completed: 43, overdue: 9 },
  { month: 'Shrawan', created: 41, completed: 38, overdue: 3 },
  { month: 'Bhadra', created: 58, completed: 49, overdue: 9 },
  { month: 'Ashwin', created: 47, completed: 35, overdue: 12 },
];

const statusDistribution = [
  { name: 'Completed', value: 150, color: '#16a34a' },
  { name: 'In Progress', value: 48, color: '#8b5cf6' },
  { name: 'Pending', value: 22, color: '#f59e0b' },
  { name: 'Overdue', value: 30, color: '#ef4444' },
  { name: 'Under Review', value: 18, color: '#f97316' },
  { name: 'Blocked', value: 9, color: '#dc2626' },
];

const employeeData = [
  { name: 'Ram Prasad Adhikari', dept: 'Administration', assigned: 18, completed: 15, overdue: 2, rate: 83 },
  { name: 'Sita Sharma', dept: 'Finance', assigned: 22, completed: 17, overdue: 4, rate: 77 },
  { name: 'Hari Bahadur Tamang', dept: 'Credit', assigned: 31, completed: 24, overdue: 5, rate: 77 },
  { name: 'Gita Rai', dept: 'Recovery', assigned: 14, completed: 12, overdue: 1, rate: 86 },
  { name: 'Mohan Thapa', dept: 'HR', assigned: 11, completed: 10, overdue: 0, rate: 91 },
  { name: 'Sunita Karki', dept: 'IT', assigned: 9, completed: 8, overdue: 1, rate: 89 },
];

// Bottleneck / delay reason analytics data
const delayReasonData = [
  { reason: 'Waiting for Document', count: 14, color: '#3b82f6', key: 'waiting_document' },
  { reason: 'Waiting for Approval', count: 11, color: '#f59e0b', key: 'waiting_approval' },
  { reason: 'Waiting for Department', count: 8, color: '#8b5cf6', key: 'waiting_department' },
  { reason: 'Workload', count: 6, color: '#f97316', key: 'workload' },
  { reason: 'External Dependency', count: 5, color: '#ef4444', key: 'external_dependency' },
];

const bottleneckByDept = [
  { dept: 'Credit', waiting_document: 4, waiting_approval: 3, waiting_department: 2, workload: 2, external_dependency: 1 },
  { dept: 'Finance', waiting_document: 3, waiting_approval: 2, waiting_department: 1, workload: 1, external_dependency: 2 },
  { dept: 'Recovery', waiting_document: 2, waiting_approval: 3, waiting_department: 2, workload: 1, external_dependency: 1 },
  { dept: 'Admin', waiting_document: 2, waiting_approval: 1, waiting_department: 1, workload: 1, external_dependency: 0 },
  { dept: 'HR', waiting_document: 1, waiting_approval: 1, waiting_department: 1, workload: 0, external_dependency: 0 },
  { dept: 'IT', waiting_document: 1, waiting_approval: 1, waiting_department: 1, workload: 1, external_dependency: 1 },
];

const bottleneckTrend = [
  { month: 'Baisakh', waiting_document: 3, waiting_approval: 2, workload: 1, external_dependency: 1 },
  { month: 'Jestha', waiting_document: 4, waiting_approval: 3, workload: 2, external_dependency: 1 },
  { month: 'Ashadh', waiting_document: 5, waiting_approval: 4, workload: 2, external_dependency: 2 },
  { month: 'Shrawan', waiting_document: 3, waiting_approval: 2, workload: 1, external_dependency: 1 },
  { month: 'Bhadra', waiting_document: 6, waiting_approval: 4, workload: 3, external_dependency: 2 },
  { month: 'Ashwin', waiting_document: 7, waiting_approval: 5, workload: 3, external_dependency: 2 },
];

const COLORS = ['#16a34a', '#8b5cf6', '#f59e0b', '#ef4444', '#f97316', '#dc2626'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs">
        <p className="font-700 text-foreground mb-1.5">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-0.5">
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

export default function ReportsPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [dateRange, setDateRange] = useState('this-fy');
  const [activeTab, setActiveTab] = useState<'overview' | 'department' | 'employee' | 'bottleneck'>('overview');

  const totalTasks = departmentData.reduce((s, d) => s + d.total, 0);
  const totalCompleted = departmentData.reduce((s, d) => s + d.completed, 0);
  const totalOverdue = departmentData.reduce((s, d) => s + d.overdue, 0);
  const completionRate = Math.round((totalCompleted / totalTasks) * 100);
  const totalDelayReasons = delayReasonData.reduce((s, d) => s + d.count, 0);
  const topBottleneck = delayReasonData[0];

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-800 text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organizational task performance &nbsp;·&nbsp; FY 2083/84
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="this-month">This Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-fy">FY 2083/84</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-sm font-600 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors">
            <AppIcon name="ArrowDownTrayIcon" size={15} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: 'RectangleStackIcon', color: 'text-primary', bg: 'bg-primary/8', sub: 'FY 2083/84' },
          { label: 'Completed', value: totalCompleted, icon: 'CheckCircleIcon', color: 'text-green-600', bg: 'bg-green-50', sub: `${completionRate}% rate` },
          { label: 'Overdue', value: totalOverdue, icon: 'ExclamationTriangleIcon', color: 'text-red-600', bg: 'bg-red-50', sub: 'Needs attention' },
          { label: 'Avg. Completion', value: '4.2d', icon: 'ClockIcon', color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Per task' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <AppIcon name={kpi.icon as any} size={18} className={kpi.color} />
              </div>
            </div>
            <p className="text-2xl font-800 text-foreground">{kpi.value}</p>
            <p className="text-xs font-600 text-foreground mt-0.5">{kpi.label}</p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 w-fit mb-5 flex-wrap">
        {(['overview', 'department', 'employee', 'bottleneck'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-600 capitalize transition-all ${
              activeTab === tab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' ? 'Overview'
              : tab === 'department' ? 'By Department'
              : tab === 'employee' ? 'By Employee'
              : (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  Bottleneck
                </span>
              )
            }
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-4">Task Trend — Monthly</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="created" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} name="Created" />
                  <Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
                  <Line type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Overdue" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status Pie */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                    {statusDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {statusDistribution.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] text-muted-foreground truncate">{s.name}</span>
                    <span className="text-[10px] font-700 text-foreground ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'department' && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-700 text-foreground mb-4">Department Task Volume</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={departmentData} barSize={18}>
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

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-700 text-foreground">Department Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Department', 'Total', 'Completed', 'In Progress', 'Overdue', 'Completion Rate'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((row, i) => {
                    const rate = Math.round((row.completed / row.total) * 100);
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-600 text-foreground">{row.dept}</td>
                        <td className="px-4 py-3 text-foreground">{row.total}</td>
                        <td className="px-4 py-3 text-green-600 font-600">{row.completed}</td>
                        <td className="px-4 py-3 text-purple-600 font-600">{row.inProgress}</td>
                        <td className="px-4 py-3 text-red-600 font-600">{row.overdue}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[80px]">
                              <div
                                className={`h-full rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-xs font-700 text-foreground">{rate}%</span>
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

      {activeTab === 'employee' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-700 text-foreground">Employee Performance</h3>
            <span className="text-xs text-muted-foreground">{employeeData.length} employees</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50">
                  {['Employee', 'Department', 'Assigned', 'Completed', 'Overdue', 'Completion Rate'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employeeData.map((emp, i) => (
                  <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-700 text-primary">
                            {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </span>
                        </div>
                        <span className="font-600 text-foreground">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.dept}</td>
                    <td className="px-4 py-3 text-foreground">{emp.assigned}</td>
                    <td className="px-4 py-3 text-green-600 font-600">{emp.completed}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-600 ${emp.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {emp.overdue}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className={`h-full rounded-full ${emp.rate >= 85 ? 'bg-green-500' : emp.rate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${emp.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-700 text-foreground">{emp.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bottleneck' && (
        <div className="space-y-5">
          {/* Bottleneck KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AppIcon name="ExclamationTriangleIcon" size={16} className="text-red-600" />
                </div>
                <span className="text-xs font-600 text-red-700">Total Delayed</span>
              </div>
              <p className="text-2xl font-800 text-red-700">{totalDelayReasons}</p>
              <p className="text-xs text-red-500 mt-0.5">Tasks with logged delay reasons</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AppIcon name="DocumentTextIcon" size={16} className="text-blue-600" />
                </div>
                <span className="text-xs font-600 text-blue-700">Top Bottleneck</span>
              </div>
              <p className="text-lg font-800 text-blue-700">{topBottleneck.reason}</p>
              <p className="text-xs text-blue-500 mt-0.5">{topBottleneck.count} tasks affected</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AppIcon name="ArrowTrendingUpIcon" size={16} className="text-amber-600" />
                </div>
                <span className="text-xs font-600 text-amber-700">Trend</span>
              </div>
              <p className="text-2xl font-800 text-amber-700">↑ 17%</p>
              <p className="text-xs text-amber-500 mt-0.5">vs. last month</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Delay Reason Breakdown Bar Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Delay Reason Breakdown</h3>
              <p className="text-xs text-muted-foreground mb-4">Count of overdue tasks by reported reason</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={delayReasonData} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis dataKey="reason" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={130} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tasks" radius={[0, 4, 4, 0]}>
                    {delayReasonData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottleneck Trend Over Time */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-700 text-foreground mb-1">Bottleneck Trend</h3>
              <p className="text-xs text-muted-foreground mb-4">Monthly delay reasons over time</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={bottleneckTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="waiting_document" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Waiting Doc" />
                  <Line type="monotone" dataKey="waiting_approval" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="Waiting Approval" />
                  <Line type="monotone" dataKey="workload" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} name="Workload" />
                  <Line type="monotone" dataKey="external_dependency" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="External" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottleneck by Department stacked bar */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-700 text-foreground mb-1">Bottleneck by Department</h3>
            <p className="text-xs text-muted-foreground mb-4">Which departments face which delay types most</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bottleneckByDept} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="waiting_document" stackId="a" fill="#3b82f6" name="Waiting Doc" radius={[0, 0, 0, 0]} />
                <Bar dataKey="waiting_approval" stackId="a" fill="#f59e0b" name="Waiting Approval" />
                <Bar dataKey="waiting_department" stackId="a" fill="#8b5cf6" name="Waiting Dept" />
                <Bar dataKey="workload" stackId="a" fill="#f97316" name="Workload" />
                <Bar dataKey="external_dependency" stackId="a" fill="#ef4444" name="External" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Delay Reason Detail Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-700 text-foreground">Delay Reason Summary</h3>
              <span className="text-xs text-muted-foreground">{totalDelayReasons} total logged</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {['Delay Reason', 'Tasks Affected', '% of Overdue', 'Severity', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {delayReasonData.map((row, i) => {
                    const pct = Math.round((row.count / totalDelayReasons) * 100);
                    const severity = pct >= 30 ? 'High' : pct >= 20 ? 'Medium' : 'Low';
                    const severityColor = severity === 'High' ? 'text-red-600 bg-red-50' : severity === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50';
                    return (
                      <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                            <span className="font-600 text-foreground">{row.reason}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-700 text-foreground">{row.count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[60px]">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: row.color }} />
                            </div>
                            <span className="text-xs font-600 text-foreground">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${severityColor}`}>{severity}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-xs font-500 text-primary hover:underline">Investigate →</button>
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

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
