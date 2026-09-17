'use client';

import React, { useState, useRef, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import AppIcon from '@/components/ui/AppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'Admin' | 'Manager' | 'Employee';
type UserStatus = 'Active' | 'Inactive' | 'Pending';

type Department =
  | 'Management' |'Administration' |'Finance' |'Credit' |'Recovery' |'HR' |'IT' |'Marketing' |'Audit';

interface DepartmentAccess {
  dept: Department;
  canView: boolean;
  canEdit: boolean;
  canApprove: boolean;
}

interface ManagedUser {
  id: string;
  userCode: string; // Unique staff identifier
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  primaryDept: Department;
  deptAccess: DepartmentAccess[];
  status: UserStatus;
  createdAt: string;
  lastLogin: string;
  initials: string;
  avatarColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_DEPARTMENTS: Department[] = [
  'Management', 'Administration', 'Finance', 'Credit',
  'Recovery', 'HR', 'IT', 'Marketing', 'Audit',
];

const ROLES: UserRole[] = ['Admin', 'Manager', 'Employee'];

const ROLE_META: Record<UserRole, { color: string; bg: string; icon: string; desc: string }> = {
  Admin: {
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: 'ShieldCheckIcon',
    desc: 'Full system access, user management, settings',
  },
  Manager: {
    color: 'text-violet-700',
    bg: 'bg-violet-100',
    icon: 'UserGroupIcon',
    desc: 'Department oversight, task assignment, approvals',
  },
  Employee: {
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: 'UserIcon',
    desc: 'Standard access, own tasks and assigned work',
  },
};

const STATUS_META: Record<UserStatus, { dot: string; badge: string; label: string }> = {
  Active: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'Active' },
  Inactive: { dot: 'bg-gray-400', badge: 'bg-secondary text-muted-foreground', label: 'Inactive' },
  Pending: { dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'Pending' },
};

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const buildAccess = (primary: Department, role: UserRole): DepartmentAccess[] =>
  ALL_DEPARTMENTS.map(dept => ({
    dept,
    canView: role === 'Admin' || dept === primary,
    canEdit: role === 'Admin' || (role === 'Manager' && dept === primary),
    canApprove: role === 'Admin' || (role === 'Manager' && dept === primary),
  }));

const SEED_USERS: ManagedUser[] = [
  { id: 'UA-001', userCode: 'AKS-001', name: 'Rajesh Kumar Shrestha', email: 'rajesh@aakashcooperative.com.np', phone: '+977-9801234567', role: 'Admin', primaryDept: 'Management', deptAccess: buildAccess('Management', 'Admin'), status: 'Active', createdAt: '2078-04-01', lastLogin: '16 Ashwin 2083, 14:22', initials: 'RKS', avatarColor: 'bg-blue-500' },
  { id: 'UA-002', userCode: 'AKS-002', name: 'Ram Prasad Adhikari', email: 'ram.adhikari@aakashcooperative.com.np', phone: '+977-9802345678', role: 'Manager', primaryDept: 'Administration', deptAccess: buildAccess('Administration', 'Manager'), status: 'Active', createdAt: '2079-01-15', lastLogin: '16 Ashwin 2083, 11:45', initials: 'RA', avatarColor: 'bg-violet-500' },
  { id: 'UA-003', userCode: 'AKS-003', name: 'Sita Sharma', email: 'sita.sharma@aakashcooperative.com.np', phone: '+977-9803456789', role: 'Manager', primaryDept: 'Finance', deptAccess: buildAccess('Finance', 'Manager'), status: 'Active', createdAt: '2079-03-10', lastLogin: '16 Ashwin 2083, 09:30', initials: 'SS', avatarColor: 'bg-emerald-500' },
  { id: 'UA-004', userCode: 'AKS-004', name: 'Hari Bahadur Tamang', email: 'hari.tamang@aakashcooperative.com.np', phone: '+977-9804567890', role: 'Employee', primaryDept: 'Credit', deptAccess: buildAccess('Credit', 'Employee'), status: 'Active', createdAt: '2080-06-20', lastLogin: '15 Ashwin 2083, 16:10', initials: 'HT', avatarColor: 'bg-amber-500' },
  { id: 'UA-005', userCode: 'AKS-005', name: 'Gita Rai', email: 'gita.rai@aakashcooperative.com.np', phone: '+977-9805678901', role: 'Employee', primaryDept: 'Recovery', deptAccess: buildAccess('Recovery', 'Employee'), status: 'Active', createdAt: '2080-09-05', lastLogin: '16 Ashwin 2083, 08:55', initials: 'GR', avatarColor: 'bg-rose-500' },
  { id: 'UA-006', userCode: 'AKS-006', name: 'Mohan Thapa', email: 'mohan.thapa@aakashcooperative.com.np', phone: '+977-9806789012', role: 'Manager', primaryDept: 'HR', deptAccess: buildAccess('HR', 'Manager'), status: 'Active', createdAt: '2079-11-01', lastLogin: '14 Ashwin 2083, 13:20', initials: 'MT', avatarColor: 'bg-cyan-500' },
  { id: 'UA-007', userCode: 'AKS-007', name: 'Sunita Karki', email: 'sunita.karki@aakashcooperative.com.np', phone: '+977-9807890123', role: 'Employee', primaryDept: 'IT', deptAccess: buildAccess('IT', 'Employee'), status: 'Active', createdAt: '2081-02-14', lastLogin: '16 Ashwin 2083, 10:05', initials: 'SK', avatarColor: 'bg-indigo-500' },
  { id: 'UA-008', userCode: 'AKS-008', name: 'Binod Poudel', email: 'binod.poudel@aakashcooperative.com.np', phone: '+977-9808901234', role: 'Employee', primaryDept: 'Audit', deptAccess: buildAccess('Audit', 'Employee'), status: 'Active', createdAt: '2080-04-22', lastLogin: '13 Ashwin 2083, 15:40', initials: 'BP', avatarColor: 'bg-teal-500' },
  { id: 'UA-009', userCode: 'AKS-009', name: 'Kamala Gurung', email: 'kamala.gurung@aakashcooperative.com.np', phone: '+977-9809012345', role: 'Employee', primaryDept: 'Administration', deptAccess: buildAccess('Administration', 'Employee'), status: 'Inactive', createdAt: '2081-07-10', lastLogin: '05 Ashwin 2083, 09:00', initials: 'KG', avatarColor: 'bg-blue-500' },
  { id: 'UA-010', userCode: 'AKS-010', name: 'Dipak Shrestha', email: 'dipak.shrestha@aakashcooperative.com.np', phone: '+977-9800123456', role: 'Employee', primaryDept: 'Marketing', deptAccess: buildAccess('Marketing', 'Employee'), status: 'Pending', createdAt: '2082-01-05', lastLogin: 'Never', initials: 'DS', avatarColor: 'bg-violet-500' },
  { id: 'UA-011', userCode: 'AKS-011', name: 'Anita Maharjan', email: 'anita.maharjan@aakashcooperative.com.np', phone: '+977-9801111222', role: 'Employee', primaryDept: 'Finance', deptAccess: buildAccess('Finance', 'Employee'), status: 'Active', createdAt: '2081-05-18', lastLogin: '16 Ashwin 2083, 07:45', initials: 'AM', avatarColor: 'bg-emerald-500' },
  { id: 'UA-012', userCode: 'AKS-012', name: 'Prakash Bhandari', email: 'prakash.bhandari@aakashcooperative.com.np', phone: '+977-9802222333', role: 'Employee', primaryDept: 'Credit', deptAccess: buildAccess('Credit', 'Employee'), status: 'Active', createdAt: '2082-03-12', lastLogin: '15 Ashwin 2083, 12:30', initials: 'PB', avatarColor: 'bg-amber-500' },
];

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

// ─── Create / Edit User Modal ─────────────────────────────────────────────────

interface UserFormData {
  userCode: string; // Unique staff identifier
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  primaryDept: Department;
  deptAccess: DepartmentAccess[];
}

function buildDefaultAccess(dept: Department, role: UserRole): DepartmentAccess[] {
  return ALL_DEPARTMENTS.map(d => ({
    dept: d,
    canView: role === 'Admin' || d === dept,
    canEdit: role === 'Admin' || (role === 'Manager' && d === dept),
    canApprove: role === 'Admin' || (role === 'Manager' && d === dept),
  }));
}

interface UserModalProps {
  user?: ManagedUser | null;
  onClose: () => void;
  onSave: (data: UserFormData, id?: string) => void;
  existingCodes: string[]; // For uniqueness validation
}

function UserModal({ user, onClose, onSave, existingCodes }: UserModalProps) {
  const [form, setForm] = useState<UserFormData>({
    userCode: user?.userCode ?? '',
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    role: user?.role ?? 'Employee',
    primaryDept: user?.primaryDept ?? 'Administration',
    deptAccess: user?.deptAccess ?? buildDefaultAccess('Administration', 'Employee'),
  });
  const [tab, setTab] = useState<'info' | 'access'>('info');
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  // Filter access table by department (empty = show all)
  const [accessDeptFilter, setAccessDeptFilter] = useState<Department | ''>('');

  const isEdit = !!user;

  // Auto-rebuild access when role or primary dept changes
  const handleRoleChange = (role: UserRole) => {
    setForm(prev => ({
      ...prev,
      role,
      deptAccess: buildDefaultAccess(prev.primaryDept, role),
    }));
  };

  const handlePrimaryDeptChange = (dept: Department) => {
    setForm(prev => ({
      ...prev,
      primaryDept: dept,
      deptAccess: buildDefaultAccess(dept, prev.role),
    }));
    // Auto-filter access table to the selected department
    setAccessDeptFilter(dept);
  };

  const toggleAccess = (dept: Department, field: 'canView' | 'canEdit' | 'canApprove') => {
    setForm(prev => ({
      ...prev,
      deptAccess: prev.deptAccess.map(a =>
        a.dept === dept ? { ...a, [field]: !a[field] } : a
      ),
    }));
  };

  const validate = () => {
    const e: Partial<Record<keyof UserFormData, string>> = {};
    if (!form.userCode.trim()) {
      e.userCode = 'User code is required';
    } else {
      // Check uniqueness — exclude current user's own code when editing
      const isDuplicate = existingCodes
        .filter(code => !isEdit || code !== user?.userCode)
        .some(code => code.toLowerCase() === form.userCode.trim().toLowerCase());
      if (isDuplicate) e.userCode = 'This user code is already taken';
    }
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form, user?.id);
  };

  // Filtered access rows: if a dept filter is active, show only that dept; else show all
  const visibleAccess = accessDeptFilter
    ? form.deptAccess.filter(a => a.dept === accessDeptFilter)
    : form.deptAccess;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-700 text-foreground">{isEdit ? 'Edit User' : 'Create New User'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? `Editing ${user?.name}` : 'Add a new user and configure their access'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <AppIcon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {(['info', 'access'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-600 border-b-2 transition-colors ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'info' ? 'User Info & Role' : 'Department Access'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'info' && (
            <div className="space-y-4">
              {/* User Code */}
              <div>
                <label className="text-xs font-700 text-foreground mb-1.5 block">
                  User Code <span className="text-red-500">*</span>
                  <span className="ml-2 text-[10px] font-500 text-muted-foreground normal-case">Unique staff identifier (e.g. AKS-013)</span>
                </label>
                <input
                  type="text"
                  value={form.userCode}
                  onChange={e => setForm(p => ({ ...p, userCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. AKS-013"
                  className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 font-mono tracking-wide ${errors.userCode ? 'border-red-400' : 'border-border'}`}
                />
                {errors.userCode && <p className="text-xs text-red-500 mt-1">{errors.userCode}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-700 text-foreground mb-1.5 block">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Anita Maharjan"
                  className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 ${errors.name ? 'border-red-400' : 'border-border'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-700 text-foreground mb-1.5 block">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="name@aakashcooperative.com.np"
                  className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 ${errors.email ? 'border-red-400' : 'border-border'}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-700 text-foreground mb-1.5 block">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+977-98XXXXXXXX"
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-xs font-700 text-foreground mb-2 block">System Role <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map(role => {
                    const meta = ROLE_META[role];
                    const selected = form.role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleChange(role)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selected
                            ? 'border-primary bg-primary/5' :'border-border hover:border-border/80 hover:bg-secondary/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center mb-2`}>
                          <AppIcon name={meta.icon as any} size={16} className={meta.color} />
                        </div>
                        <p className={`text-sm font-700 ${selected ? 'text-primary' : 'text-foreground'}`}>{role}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{meta.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Department */}
              <div>
                <label className="text-xs font-700 text-foreground mb-1.5 block">Primary Department</label>
                <select
                  value={form.primaryDept}
                  onChange={e => handlePrimaryDeptChange(e.target.value as Department)}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <p className="text-xs text-muted-foreground mt-1">This sets the user's home department and auto-configures access below.</p>
              </div>
            </div>
          )}

          {tab === 'access' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-700 text-foreground">Department Access Matrix</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Configure which departments this user can view, edit, or approve in.</p>
                </div>
                <span className={`text-[11px] font-600 px-2.5 py-1 rounded-full ${ROLE_META[form.role].bg} ${ROLE_META[form.role].color}`}>
                  {form.role}
                </span>
              </div>

              {/* Department filter for access table */}
              <div className="flex items-center gap-2 mb-3">
                <AppIcon name="FunnelIcon" size={13} className="text-muted-foreground flex-shrink-0" />
                <select
                  value={accessDeptFilter}
                  onChange={e => setAccessDeptFilter(e.target.value as Department | '')}
                  className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">All Departments</option>
                  {ALL_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}{d === form.primaryDept ? ' (Primary)' : ''}</option>
                  ))}
                </select>
                {accessDeptFilter && (
                  <button
                    onClick={() => setAccessDeptFilter('')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <AppIcon name="XMarkIcon" size={12} />
                    Show all
                  </button>
                )}
              </div>

              {/* Access Table */}
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground">Department</th>
                      <th className="text-center px-3 py-2.5 text-xs font-700 text-muted-foreground">View</th>
                      <th className="text-center px-3 py-2.5 text-xs font-700 text-muted-foreground">Edit</th>
                      <th className="text-center px-3 py-2.5 text-xs font-700 text-muted-foreground">Approve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAccess.map((access, idx) => (
                      <tr key={access.dept} className={`border-t border-border ${access.dept === form.primaryDept ? 'bg-primary/5' : idx % 2 === 0 ? '' : 'bg-secondary/20'}`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-600 text-foreground">{access.dept}</span>
                            {access.dept === form.primaryDept && (
                              <span className="text-[10px] font-600 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">Primary</span>
                            )}
                          </div>
                        </td>
                        {(['canView', 'canEdit', 'canApprove'] as const).map(field => (
                          <td key={field} className="text-center px-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={access[field]}
                              onChange={() => toggleAccess(access.dept, field)}
                              className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 font-600">
                  <AppIcon name="InformationCircleIcon" size={13} className="inline mr-1" />
                  Admin role automatically grants full access to all departments. Changes here will be overridden if role is changed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0">
          <div className="flex gap-2">
            {tab === 'access' && (
              <button onClick={() => setTab('info')} className="px-4 py-2 text-sm font-600 text-secondary-foreground bg-secondary rounded-lg hover:bg-border transition-colors">
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-600 text-secondary-foreground bg-secondary rounded-lg hover:bg-border transition-colors">
              Cancel
            </button>
            {tab === 'info' ? (
              <button onClick={() => setTab('access')} className="px-4 py-2 text-sm font-600 text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                Next: Set Access →
              </button>
            ) : (
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-600 text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                {isEdit ? 'Save Changes' : 'Create User'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deactivation Modal ───────────────────────────────────────────────────────

interface DeactivateModalProps {
  users: ManagedUser[];
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function DeactivateModal({ users, onClose, onConfirm }: DeactivateModalProps) {
  const [reason, setReason] = useState('');
  const isBulk = users.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AppIcon name="NoSymbolIcon" size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-700 text-foreground">
                {isBulk ? `Deactivate ${users.length} Users` : `Deactivate ${users[0]?.name}`}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isBulk
                  ? `These ${users.length} users will lose access to the system immediately.`
                  : `${users[0]?.name} will lose access to the system immediately.`}
              </p>
            </div>
          </div>

          {isBulk && (
            <div className="mt-4 max-h-32 overflow-y-auto space-y-1.5">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-6 h-6 rounded-full ${u.avatarColor} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-[9px] font-700 text-white">{u.initials}</span>
                  </div>
                  <span className="text-foreground font-600">{u.name}</span>
                  <span className="text-muted-foreground text-xs">· {u.role}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <label className="text-xs font-700 text-foreground mb-1.5 block">Reason for deactivation</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Employee resigned, contract ended, security concern..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 text-secondary-foreground bg-secondary rounded-lg hover:bg-border transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-sm font-600 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Deactivate {isBulk ? `${users.length} Users` : 'User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Access Detail Panel ──────────────────────────────────────────────────────

interface AccessPanelProps {
  user: ManagedUser;
  onClose: () => void;
}

function AccessPanel({ user, onClose }: AccessPanelProps) {
  const granted = user.deptAccess.filter(a => a.canView || a.canEdit || a.canApprove);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <div className="bg-card h-full w-full max-w-sm shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h3 className="text-sm font-700 text-foreground">Department Access</h3>
            <p className="text-xs text-muted-foreground">{user.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <AppIcon name="XMarkIcon" size={16} className="text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center`}>
              <span className="text-xs font-700 text-white">{user.initials}</span>
            </div>
            <div>
              <p className="text-sm font-700 text-foreground">{user.name}</p>
              <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${ROLE_META[user.role].bg} ${ROLE_META[user.role].color}`}>
                {user.role}
              </span>
            </div>
          </div>

          <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">
            Access to {granted.length} of {ALL_DEPARTMENTS.length} departments
          </p>

          <div className="space-y-2">
            {user.deptAccess.map(access => {
              const hasAny = access.canView || access.canEdit || access.canApprove;
              return (
                <div key={access.dept} className={`p-3 rounded-xl border ${hasAny ? 'border-border bg-card' : 'border-border/50 bg-secondary/30 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-600 text-foreground">{access.dept}</span>
                      {access.dept === user.primaryDept && (
                        <span className="text-[10px] font-600 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">Primary</span>
                      )}
                    </div>
                    {!hasAny && <span className="text-[10px] text-muted-foreground font-600">No access</span>}
                  </div>
                  {hasAny && (
                    <div className="flex gap-2 flex-wrap">
                      {access.canView && <span className="text-[10px] font-600 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">View</span>}
                      {access.canEdit && <span className="text-[10px] font-600 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Edit</span>}
                      {access.canApprove && <span className="text-[10px] font-600 px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Approve</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserAdminPage() {
  const [users, setUsers] = useState<ManagedUser[]>(SEED_USERS);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [deptFilter, setDeptFilter] = useState<Department | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [activeTab, setActiveTab] = useState<'all' | UserStatus>('all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [deactivateTargets, setDeactivateTargets] = useState<ManagedUser[] | null>(null);
  const [accessUser, setAccessUser] = useState<ManagedUser | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // ─── Filtering ────────────────────────────────────────────────────────────

  const tabFiltered = users.filter(u => {
    if (activeTab === 'all') return true;
    return u.status === activeTab;
  });

  const filtered = tabFiltered.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.userCode.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchDept = !deptFilter || u.primaryDept === deptFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchDept && matchStatus;
  });

  // ─── Selection ────────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(u => u.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleSaveUser = (data: UserFormData, id?: string) => {
    if (id) {
      // Edit
      setUsers(prev => prev.map(u =>
        u.id === id
          ? { ...u, ...data }
          : u
      ));
      setEditUser(null);
      addToast(`${data.name}'s profile updated.`);
    } else {
      // Create
      const newId = `UA-${String(users.length + 1).padStart(3, '0')}`;
      const initials = data.name.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
      const avatarColor = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
      const newUser: ManagedUser = {
        id: newId,
        ...data,
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never',
        initials,
        avatarColor,
      };
      setUsers(prev => [newUser, ...prev]);
      setCreateOpen(false);
      addToast(`${data.name} created successfully. Status: Pending.`);
    }
  };

  const handleDeactivateConfirm = (reason: string) => {
    if (!deactivateTargets) return;
    const ids = new Set(deactivateTargets.map(u => u.id));
    setUsers(prev => prev.map(u => ids.has(u.id) ? { ...u, status: 'Inactive' } : u));
    addToast(
      deactivateTargets.length === 1
        ? `${deactivateTargets[0].name} deactivated.`
        : `${deactivateTargets.length} users deactivated.`,
      'info'
    );
    setDeactivateTargets(null);
    clearSelection();
  };

  const handleReactivate = (user: ManagedUser) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Active' } : u));
    addToast(`${user.name} reactivated.`);
  };

  const handleBulkDeactivate = () => {
    const targets = filtered.filter(u => selectedIds.has(u.id) && u.status === 'Active');
    if (targets.length === 0) {
      addToast('No active users selected for deactivation.', 'error');
      return;
    }
    setDeactivateTargets(targets);
  };

  const handleBulkActivate = () => {
    const ids = new Set(filtered.filter(u => selectedIds.has(u.id)).map(u => u.id));
    setUsers(prev => prev.map(u => ids.has(u.id) ? { ...u, status: 'Active' } : u));
    addToast(`${ids.size} user(s) activated.`);
    clearSelection();
  };

  const handleBulkRoleChange = (role: UserRole) => {
    const ids = new Set(filtered.filter(u => selectedIds.has(u.id)).map(u => u.id));
    setUsers(prev => prev.map(u =>
      ids.has(u.id)
        ? { ...u, role, deptAccess: buildDefaultAccess(u.primaryDept, role) }
        : u
    ));
    addToast(`Role updated to ${role} for ${ids.size} user(s).`);
    clearSelection();
  };

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = [
    { label: 'Total Users', value: users.length, icon: 'UsersIcon', color: 'text-primary', bg: 'bg-primary/8', tab: 'all' as const },
    { label: 'Active', value: users.filter(u => u.status === 'Active').length, icon: 'CheckCircleIcon', color: 'text-green-600', bg: 'bg-green-50', tab: 'Active' as UserStatus },
    { label: 'Inactive', value: users.filter(u => u.status === 'Inactive').length, icon: 'MinusCircleIcon', color: 'text-muted-foreground', bg: 'bg-secondary', tab: 'Inactive' as UserStatus },
    { label: 'Pending', value: users.filter(u => u.status === 'Pending').length, icon: 'ClockIcon', color: 'text-amber-600', bg: 'bg-amber-50', tab: 'Pending' as UserStatus },
  ];

  const roleCounts: Record<UserRole, number> = {
    Admin: users.filter(u => u.role === 'Admin').length,
    Manager: users.filter(u => u.role === 'Manager').length,
    Employee: users.filter(u => u.role === 'Employee').length,
  };

  const tabs: { key: 'all' | UserStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All Users', count: users.length },
    { key: 'Active', label: 'Active', count: users.filter(u => u.status === 'Active').length },
    { key: 'Inactive', label: 'Inactive', count: users.filter(u => u.status === 'Inactive').length },
    { key: 'Pending', label: 'Pending', count: users.filter(u => u.status === 'Pending').length },
  ];

  const hasFilters = !!(search || roleFilter || deptFilter || statusFilter);

  return (
    <AppLayout onQuickCreate={() => setCreateOpen(true)}>
      <PreviewNotice module="User Admin" note="Role changes are not saved. Use Supabase or the SQL editor to change a role." />
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-600 border ${
              t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              t.type === 'error'? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <AppIcon
              name={t.type === 'success' ? 'CheckCircleIcon' : t.type === 'error' ? 'XCircleIcon' : 'InformationCircleIcon'}
              size={16}
            />
            {t.message}
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-800 text-foreground">User Administration</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create users, assign roles, configure department access, and manage account status
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-700 rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
        >
          <AppIcon name="UserPlusIcon" size={15} className="text-primary-foreground" />
          Create User
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => setActiveTab(s.tab === 'all' ? 'all' : s.tab as UserStatus)}
            className={`bg-card border rounded-xl p-4 flex items-center gap-3 text-left transition-all hover:shadow-sm ${
              activeTab === s.tab ? 'border-primary ring-1 ring-primary/20' : 'border-border'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <AppIcon name={s.icon as any} size={18} className={s.color} />
            </div>
            <div>
              <p className={`text-xl font-800 ${s.color}`}>{s.value}</p>
              <p className="text-xs font-600 text-muted-foreground">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Role Distribution */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5 flex flex-wrap gap-4 items-center">
        <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Role Distribution</p>
        <div className="flex gap-3 flex-wrap">
          {ROLES.map(role => {
            const meta = ROLE_META[role];
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-600 transition-all ${
                  roleFilter === role
                    ? `${meta.bg} ${meta.color} border-current`
                    : 'bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary'
                }`}
              >
                <AppIcon name={meta.icon as any} size={13} />
                {role}
                <span className={`text-xs font-700 px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                  {roleCounts[role]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex-1 min-w-[120px] max-w-[200px]">
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {ROLES.map(role => {
              const pct = users.length > 0 ? (roleCounts[role] / users.length) * 100 : 0;
              const colors: Record<UserRole, string> = { Admin: 'bg-red-400', Manager: 'bg-violet-400', Employee: 'bg-blue-400' };
              return <div key={role} className={`${colors[role]} transition-all`} style={{ width: `${pct}%` }} />;
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-secondary/50 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-600 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-border text-muted-foreground'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters + Bulk Actions Bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <AppIcon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, user code, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UserRole | '')}
            className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Dept Filter */}
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value as Department | '')}
            className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">All Departments</option>
            {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as UserStatus | '')}
            className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setRoleFilter(''); setDeptFilter(''); setStatusFilter(''); }}
              className="text-xs font-600 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <AppIcon name="XMarkIcon" size={13} />
              Clear filters
            </button>
          )}
        </div>

        {/* Bulk Actions — shown when items selected */}
        {selectedIds.size > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-700 text-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {selectedIds.size} selected
            </span>

            {/* Bulk Role Change */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-600">Set role:</span>
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => handleBulkRoleChange(role)}
                  className={`text-xs font-600 px-2.5 py-1 rounded-lg border transition-colors ${ROLE_META[role].bg} ${ROLE_META[role].color} border-current hover:opacity-80`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkActivate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <AppIcon name="CheckCircleIcon" size={13} />
                Activate
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AppIcon name="NoSymbolIcon" size={13} />
                Deactivate
              </button>
              <button
                onClick={clearSelection}
                className="text-xs font-600 text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-600">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
            {hasFilters && <span className="ml-1 text-primary">(filtered)</span>}
          </span>
          {selectedIds.size > 0 && (
            <span className="text-xs font-600 text-primary">{selectedIds.size} selected</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40">
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border cursor-pointer"
                  />
                </th>
                {['User', 'Role', 'Primary Dept', 'Dept Access', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AppIcon name="UsersIcon" size={32} className="text-border" />
                      <p className="text-sm font-600 text-muted-foreground">No users match the current filters</p>
                      {hasFilters && (
                        <button
                          onClick={() => { setSearch(''); setRoleFilter(''); setDeptFilter(''); setStatusFilter(''); }}
                          className="text-xs text-primary hover:underline font-600"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(user => {
                const roleMeta = ROLE_META[user.role];
                const statusMeta = STATUS_META[user.status];
                const accessCount = user.deptAccess.filter(a => a.canView).length;
                const isSelected = selectedIds.has(user.id);

                return (
                  <tr
                    key={user.id}
                    className={`border-t border-border hover:bg-secondary/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-border cursor-pointer"
                      />
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-[10px] font-700 text-white">{user.initials}</span>
                        </div>
                        <div>
                          <p className="font-600 text-foreground text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-700 font-mono px-1.5 py-0.5 bg-primary/10 text-primary rounded">{user.userCode}</span>
                            <span className="text-[10px] text-muted-foreground/60">{user.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-600 px-2.5 py-1 rounded-full ${roleMeta.bg} ${roleMeta.color}`}>
                        <AppIcon name={roleMeta.icon as any} size={11} />
                        {user.role}
                      </span>
                    </td>

                    {/* Primary Dept */}
                    <td className="px-4 py-3 text-sm text-muted-foreground font-500">{user.primaryDept}</td>

                    {/* Dept Access */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setAccessUser(user)}
                        className="flex items-center gap-1.5 group"
                        title="View department access"
                      >
                        <div className="flex gap-0.5">
                          {ALL_DEPARTMENTS.slice(0, 5).map(dept => {
                            const a = user.deptAccess.find(d => d.dept === dept);
                            return (
                              <div
                                key={dept}
                                className={`w-2 h-4 rounded-sm ${a?.canView ? 'bg-primary/60' : 'bg-border'}`}
                                title={dept}
                              />
                            );
                          })}
                          {ALL_DEPARTMENTS.length > 5 && (
                            <div className="w-2 h-4 rounded-sm bg-border" title="more..." />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          {accessCount}/{ALL_DEPARTMENTS.length}
                        </span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{user.lastLogin}</td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          title="Edit user"
                        >
                          <AppIcon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                        </button>

                        {/* View Access */}
                        <button
                          onClick={() => setAccessUser(user)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          title="View department access"
                        >
                          <AppIcon name="BuildingOffice2Icon" size={14} className="text-muted-foreground" />
                        </button>

                        {/* Deactivate / Reactivate */}
                        {user.status === 'Active' ? (
                          <button
                            onClick={() => setDeactivateTargets([user])}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Deactivate user"
                          >
                            <AppIcon name="NoSymbolIcon" size={14} className="text-muted-foreground hover:text-red-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(user)}
                            className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                            title="Reactivate user"
                          >
                            <AppIcon name="CheckCircleIcon" size={14} className="text-muted-foreground hover:text-green-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {createOpen && (
        <UserModal onClose={() => setCreateOpen(false)} onSave={handleSaveUser} existingCodes={users.map(u => u.userCode)} />
      )}
      {editUser && (
        <UserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSaveUser} existingCodes={users.map(u => u.userCode)} />
      )}
      {deactivateTargets && (
        <DeactivateModal
          users={deactivateTargets}
          onClose={() => setDeactivateTargets(null)}
          onConfirm={handleDeactivateConfirm}
        />
      )}
      {accessUser && (
        <AccessPanel user={accessUser} onClose={() => setAccessUser(null)} />
      )}
    </AppLayout>
  );
}
