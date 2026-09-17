'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  tasksAssigned: number;
  initials: string;
}

const users: User[] = [
  { id: 'USR-001', name: 'Rajesh Kumar Shrestha', email: 'ceo@aakashcooperative.com.np', role: 'CEO / General Manager', department: 'Management', status: 'Active', lastLogin: '16 Ashwin 2083, 14:22', tasksAssigned: 0, initials: 'RKS' },
  { id: 'USR-002', name: 'Ram Prasad Adhikari', email: 'ram.adhikari@aakashcooperative.com.np', role: 'Department Head', department: 'Administration', status: 'Active', lastLogin: '16 Ashwin 2083, 11:45', tasksAssigned: 18, initials: 'RA' },
  { id: 'USR-003', name: 'Sita Sharma', email: 'sita.sharma@aakashcooperative.com.np', role: 'Department Head', department: 'Finance', status: 'Active', lastLogin: '16 Ashwin 2083, 09:30', tasksAssigned: 22, initials: 'SS' },
  { id: 'USR-004', name: 'Hari Bahadur Tamang', email: 'hari.tamang@aakashcooperative.com.np', role: 'Officer', department: 'Credit', status: 'Active', lastLogin: '15 Ashwin 2083, 16:10', tasksAssigned: 31, initials: 'HT' },
  { id: 'USR-005', name: 'Gita Rai', email: 'gita.rai@aakashcooperative.com.np', role: 'Employee', department: 'Recovery', status: 'Active', lastLogin: '16 Ashwin 2083, 08:55', tasksAssigned: 14, initials: 'GR' },
  { id: 'USR-006', name: 'Mohan Thapa', email: 'mohan.thapa@aakashcooperative.com.np', role: 'Department Head', department: 'HR', status: 'Active', lastLogin: '14 Ashwin 2083, 13:20', tasksAssigned: 11, initials: 'MT' },
  { id: 'USR-007', name: 'Sunita Karki', email: 'sunita.karki@aakashcooperative.com.np', role: 'Officer', department: 'IT', status: 'Active', lastLogin: '16 Ashwin 2083, 10:05', tasksAssigned: 9, initials: 'SK' },
  { id: 'USR-008', name: 'Binod Poudel', email: 'binod.poudel@aakashcooperative.com.np', role: 'Auditor', department: 'Finance', status: 'Active', lastLogin: '13 Ashwin 2083, 15:40', tasksAssigned: 0, initials: 'BP' },
  { id: 'USR-009', name: 'Kamala Gurung', email: 'kamala.gurung@aakashcooperative.com.np', role: 'Employee', department: 'Administration', status: 'Inactive', lastLogin: '05 Ashwin 2083, 09:00', tasksAssigned: 3, initials: 'KG' },
  { id: 'USR-010', name: 'Dipak Shrestha', email: 'dipak.shrestha@aakashcooperative.com.np', role: 'Employee', department: 'Marketing', status: 'Pending', lastLogin: 'Never', tasksAssigned: 0, initials: 'DS' },
];

const roleColors: Record<string, string> = {
  'CEO / General Manager': 'bg-primary/10 text-primary',
  'Department Head': 'bg-purple-100 text-purple-700',
  'Officer': 'bg-blue-100 text-blue-700',
  'Employee': 'bg-secondary text-secondary-foreground',
  'Auditor': 'bg-amber-100 text-amber-700',
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-secondary text-muted-foreground',
  Pending: 'bg-amber-100 text-amber-700',
};

const statusDot: Record<string, string> = {
  Active: 'bg-green-500',
  Inactive: 'bg-gray-400',
  Pending: 'bg-amber-500',
};

export default function UsersPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchDept = !deptFilter || u.department === deptFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchDept && matchStatus;
  });

  const departments = [...new Set(users.map(u => u.department))];
  const roles = [...new Set(users.map(u => u.role))];

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      <PreviewNotice module="User Accounts" />
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-800 text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage internal users, roles and access &nbsp;·&nbsp; {users.filter(u => u.status === 'Active').length} active users
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
        >
          <AppIcon name="UserPlusIcon" size={15} className="text-primary-foreground" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Users', value: users.length, color: 'text-primary', bg: 'bg-primary/8' },
          { label: 'Active', value: users.filter(u => u.status === 'Active').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Inactive', value: users.filter(u => u.status === 'Inactive').length, color: 'text-muted-foreground', bg: 'bg-secondary' },
          { label: 'Pending', value: users.filter(u => u.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-lg font-800 ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-sm font-600 text-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <AppIcon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
          <option value="">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>
        {(search || roleFilter || deptFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setRoleFilter(''); setDeptFilter(''); setStatusFilter(''); }} className="text-xs font-600 text-muted-foreground hover:text-foreground transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-600">{filtered.length} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40">
                {['User', 'Role', 'Department', 'Status', 'Tasks', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-700 text-primary">{user.initials}</span>
                      </div>
                      <div>
                        <p className="font-600 text-foreground text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${roleColors[user.role] ?? 'bg-secondary text-secondary-foreground'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{user.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${statusDot[user.status]}`} />
                      <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${statusColors[user.status]}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground font-600">{user.tasksAssigned}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{user.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Edit user">
                        <AppIcon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="View activity">
                        <AppIcon name="ClockIcon" size={14} className="text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Deactivate">
                        <AppIcon name="NoSymbolIcon" size={14} className="text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-700 text-foreground">Add New User</h2>
              <button onClick={() => setInviteOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <AppIcon name="XMarkIcon" size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-700 text-foreground mb-1.5 block">Full Name</label>
                <input type="text" placeholder="e.g. Anita Maharjan" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <label className="text-xs font-700 text-foreground mb-1.5 block">Email Address</label>
                <input type="email" placeholder="name@aakashcooperative.com.np" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-700 text-foreground mb-1.5 block">Role</label>
                  <select className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30">
                    <option>Employee</option>
                    <option>Officer</option>
                    <option>Department Head</option>
                    <option>Manager</option>
                    <option>Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-700 text-foreground mb-1.5 block">Department</label>
                  <select className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30">
                    {departments.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setInviteOpen(false)} className="px-4 py-2 text-sm font-600 text-secondary-foreground bg-secondary rounded-lg hover:bg-border transition-colors">
                Cancel
              </button>
              <button onClick={() => setInviteOpen(false)} className="px-4 py-2 text-sm font-600 text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
