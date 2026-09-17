'use client';

import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'Active' | 'Inactive' | 'Suspended';
type Role = 'Super Administrator' | 'CEO / General Manager' | 'Department Head' | 'Officer' | 'Employee' | 'Auditor';
type Department = 'Management' | 'Administration' | 'Finance' | 'Credit' | 'Recovery' | 'HR' | 'IT' | 'Marketing' | 'Audit';

interface Permission {
  id: string;
  label: string;
  category: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: Department;
  status: Status;
  joinDate: string;
  lastLogin: string;
  tasksAssigned: number;
  initials: string;
  permissions: string[];
  position: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  { id: 'perm-task-create', label: 'Create Tasks', category: 'Tasks' },
  { id: 'perm-task-assign', label: 'Assign Tasks', category: 'Tasks' },
  { id: 'perm-task-delete', label: 'Delete Tasks', category: 'Tasks' },
  { id: 'perm-task-view-all', label: 'View All Tasks', category: 'Tasks' },
  { id: 'perm-approve', label: 'Approve Requests', category: 'Approvals' },
  { id: 'perm-reject', label: 'Reject Requests', category: 'Approvals' },
  { id: 'perm-escalate', label: 'Escalate Tasks', category: 'Approvals' },
  { id: 'perm-user-manage', label: 'Manage Users', category: 'Administration' },
  { id: 'perm-role-manage', label: 'Manage Roles', category: 'Administration' },
  { id: 'perm-dept-manage', label: 'Manage Departments', category: 'Administration' },
  { id: 'perm-reports-view', label: 'View Reports', category: 'Reports' },
  { id: 'perm-reports-export', label: 'Export Reports', category: 'Reports' },
  { id: 'perm-audit-log', label: 'View Audit Logs', category: 'Reports' },
  { id: 'perm-settings', label: 'System Settings', category: 'Administration' },
];

const ROLE_DEFAULT_PERMISSIONS: Record<Role, string[]> = {
  'Super Administrator': ALL_PERMISSIONS.map(p => p.id),
  'CEO / General Manager': ['perm-task-view-all', 'perm-approve', 'perm-reject', 'perm-escalate', 'perm-reports-view', 'perm-reports-export', 'perm-audit-log'],
  'Department Head': ['perm-task-create', 'perm-task-assign', 'perm-task-view-all', 'perm-approve', 'perm-reject', 'perm-reports-view'],
  'Officer': ['perm-task-create', 'perm-task-assign', 'perm-escalate', 'perm-reports-view'],
  'Employee': ['perm-task-create'],
  'Auditor': ['perm-task-view-all', 'perm-reports-view', 'perm-reports-export', 'perm-audit-log'],
};

const DEPARTMENTS: Department[] = ['Management', 'Administration', 'Finance', 'Credit', 'Recovery', 'HR', 'IT', 'Marketing', 'Audit'];
const ROLES: Role[] = ['Super Administrator', 'CEO / General Manager', 'Department Head', 'Officer', 'Employee', 'Auditor'];

const SEED_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Rajesh Kumar Shrestha', email: 'ceo@aakashcooperative.com.np', phone: '+977-9801234567', role: 'CEO / General Manager', department: 'Management', status: 'Active', joinDate: '2078-04-01', lastLogin: '16 Ashwin 2083, 14:22', tasksAssigned: 0, initials: 'RKS', position: 'Chief Executive Officer', permissions: ROLE_DEFAULT_PERMISSIONS['CEO / General Manager'] },
  { id: 'EMP-002', name: 'Ram Prasad Adhikari', email: 'ram.adhikari@aakashcooperative.com.np', phone: '+977-9802345678', role: 'Department Head', department: 'Administration', status: 'Active', joinDate: '2079-01-15', lastLogin: '16 Ashwin 2083, 11:45', tasksAssigned: 18, initials: 'RA', position: 'Head of Administration', permissions: ROLE_DEFAULT_PERMISSIONS['Department Head'] },
  { id: 'EMP-003', name: 'Sita Sharma', email: 'sita.sharma@aakashcooperative.com.np', phone: '+977-9803456789', role: 'Department Head', department: 'Finance', status: 'Active', joinDate: '2079-03-10', lastLogin: '16 Ashwin 2083, 09:30', tasksAssigned: 22, initials: 'SS', position: 'Finance Manager', permissions: ROLE_DEFAULT_PERMISSIONS['Department Head'] },
  { id: 'EMP-004', name: 'Hari Bahadur Tamang', email: 'hari.tamang@aakashcooperative.com.np', phone: '+977-9804567890', role: 'Officer', department: 'Credit', status: 'Active', joinDate: '2080-06-20', lastLogin: '15 Ashwin 2083, 16:10', tasksAssigned: 31, initials: 'HT', position: 'Credit Officer', permissions: ROLE_DEFAULT_PERMISSIONS['Officer'] },
  { id: 'EMP-005', name: 'Gita Rai', email: 'gita.rai@aakashcooperative.com.np', phone: '+977-9805678901', role: 'Employee', department: 'Recovery', status: 'Active', joinDate: '2080-09-05', lastLogin: '16 Ashwin 2083, 08:55', tasksAssigned: 14, initials: 'GR', position: 'Recovery Executive', permissions: ROLE_DEFAULT_PERMISSIONS['Employee'] },
  { id: 'EMP-006', name: 'Mohan Thapa', email: 'mohan.thapa@aakashcooperative.com.np', phone: '+977-9806789012', role: 'Department Head', department: 'HR', status: 'Active', joinDate: '2079-11-01', lastLogin: '14 Ashwin 2083, 13:20', tasksAssigned: 11, initials: 'MT', position: 'HR Manager', permissions: ROLE_DEFAULT_PERMISSIONS['Department Head'] },
  { id: 'EMP-007', name: 'Sunita Karki', email: 'sunita.karki@aakashcooperative.com.np', phone: '+977-9807890123', role: 'Officer', department: 'IT', status: 'Active', joinDate: '2081-02-14', lastLogin: '16 Ashwin 2083, 10:05', tasksAssigned: 9, initials: 'SK', position: 'IT Officer', permissions: ROLE_DEFAULT_PERMISSIONS['Officer'] },
  { id: 'EMP-008', name: 'Binod Poudel', email: 'binod.poudel@aakashcooperative.com.np', phone: '+977-9808901234', role: 'Auditor', department: 'Audit', status: 'Active', joinDate: '2080-04-22', lastLogin: '13 Ashwin 2083, 15:40', tasksAssigned: 0, initials: 'BP', position: 'Internal Auditor', permissions: ROLE_DEFAULT_PERMISSIONS['Auditor'] },
  { id: 'EMP-009', name: 'Kamala Gurung', email: 'kamala.gurung@aakashcooperative.com.np', phone: '+977-9809012345', role: 'Employee', department: 'Administration', status: 'Inactive', joinDate: '2081-07-10', lastLogin: '05 Ashwin 2083, 09:00', tasksAssigned: 3, initials: 'KG', position: 'Admin Assistant', permissions: ROLE_DEFAULT_PERMISSIONS['Employee'] },
  { id: 'EMP-010', name: 'Dipak Shrestha', email: 'dipak.shrestha@aakashcooperative.com.np', phone: '+977-9800123456', role: 'Employee', department: 'Marketing', status: 'Suspended', joinDate: '2082-01-05', lastLogin: 'Never', tasksAssigned: 0, initials: 'DS', position: 'Marketing Executive', permissions: [] },
  { id: 'EMP-011', name: 'Anita Maharjan', email: 'anita.maharjan@aakashcooperative.com.np', phone: '+977-9801111222', role: 'Officer', department: 'Finance', status: 'Active', joinDate: '2081-05-18', lastLogin: '16 Ashwin 2083, 07:45', tasksAssigned: 7, initials: 'AM', position: 'Finance Officer', permissions: ROLE_DEFAULT_PERMISSIONS['Officer'] },
  { id: 'EMP-012', name: 'Prakash Bhandari', email: 'prakash.bhandari@aakashcooperative.com.np', phone: '+977-9802222333', role: 'Employee', department: 'Credit', status: 'Active', joinDate: '2082-03-12', lastLogin: '15 Ashwin 2083, 12:30', tasksAssigned: 5, initials: 'PB', position: 'Credit Assistant', permissions: ROLE_DEFAULT_PERMISSIONS['Employee'] },
];

// ─── Color Maps ───────────────────────────────────────────────────────────────

const roleColors: Record<Role, string> = {
  'Super Administrator': 'bg-red-100 text-red-700',
  'CEO / General Manager': 'bg-primary/10 text-primary',
  'Department Head': 'bg-purple-100 text-purple-700',
  'Officer': 'bg-blue-100 text-blue-700',
  'Employee': 'bg-secondary text-secondary-foreground',
  'Auditor': 'bg-amber-100 text-amber-700',
};

const statusConfig: Record<Status, { dot: string; badge: string; label: string }> = {
  Active: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'Active' },
  Inactive: { dot: 'bg-gray-400', badge: 'bg-secondary text-muted-foreground', label: 'Inactive' },
  Suspended: { dot: 'bg-red-400', badge: 'bg-red-100 text-red-600', label: 'Suspended' },
};

const permCategories = [...new Set(ALL_PERMISSIONS.map(p => p.category))];

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [employees, setEmployees] = useState<Employee[]>(SEED_EMPLOYEES);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  // Modals
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [permEmployee, setPermEmployee] = useState<Employee | null>(null);
  const [deactivateEmployee, setDeactivateEmployee] = useState<Employee | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // ─── Filtering ──────────────────────────────────────────────────────────────

  const tabFiltered = employees.filter(e => {
    if (activeTab === 'active') return e.status === 'Active';
    if (activeTab === 'inactive') return e.status === 'Inactive';
    if (activeTab === 'suspended') return e.status === 'Suspended';
    return true;
  });

  const filtered = tabFiltered.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
    const matchRole = !roleFilter || e.role === roleFilter;
    const matchDept = !deptFilter || e.department === deptFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchRole && matchDept && matchStatus;
  });

  // ─── Selection ──────────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)));
    }
  };

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleDeactivate = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'Inactive' as Status } : e));
    setDeactivateEmployee(null);
    addToast(`${emp.name}'s account has been deactivated.`, 'info');
  };

  const handleBulkDeactivate = () => {
    setEmployees(prev => prev.map(e => selectedIds.has(e.id) ? { ...e, status: 'Inactive' as Status } : e));
    addToast(`${selectedIds.size} account(s) deactivated.`, 'info');
    setSelectedIds(new Set());
  };

  const handleSaveEdit = (updated: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditEmployee(null);
    addToast(`${updated.name}'s profile updated successfully.`);
  };

  const handleSavePermissions = (updated: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
    setPermEmployee(null);
    addToast(`Permissions updated for ${updated.name}.`);
  };

  const handleAddEmployee = (emp: Employee) => {
    setEmployees(prev => [emp, ...prev]);
    setAddEmployeeOpen(false);
    addToast(`${emp.name} added successfully.`);
  };

  const handleBulkImport = (count: number) => {
    setBulkImportOpen(false);
    addToast(`${count} employees imported successfully.`);
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: 'UsersIcon', color: 'text-primary', bg: 'bg-primary/8' },
    { label: 'Active', value: employees.filter(e => e.status === 'Active').length, icon: 'CheckCircleIcon', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Inactive', value: employees.filter(e => e.status === 'Inactive').length, icon: 'MinusCircleIcon', color: 'text-muted-foreground', bg: 'bg-secondary' },
    { label: 'Suspended', value: employees.filter(e => e.status === 'Suspended').length, icon: 'NoSymbolIcon', color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'all', label: 'All Employees' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'suspended', label: 'Suspended' },
  ];

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      <PreviewNotice module="Employee Directory" note="Adding or editing staff here affects only this screen." />
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-600 border animate-fade-in ${
            t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            t.type === 'error'? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <AppIcon name={t.type === 'success' ? 'CheckCircleIcon' : t.type === 'error' ? 'XCircleIcon' : 'InformationCircleIcon'} size={16} />
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-800 text-foreground">Employee Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage profiles, roles, departments, permissions &amp; access control
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setBulkImportOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground text-sm font-600 rounded-lg hover:bg-border transition-all"
          >
            <AppIcon name="ArrowUpTrayIcon" size={15} />
            Bulk Import
          </button>
          <button
            onClick={() => setAddEmployeeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
          >
            <AppIcon name="UserPlusIcon" size={15} className="text-primary-foreground" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <AppIcon name={s.icon as any} size={18} className={s.color} />
            </div>
            <div>
              <p className={`text-xl font-800 ${s.color}`}>{s.value}</p>
              <p className="text-xs font-600 text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-secondary/50 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-600 rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters + Bulk Actions */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <AppIcon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {(search || roleFilter || deptFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setRoleFilter(''); setDeptFilter(''); setStatusFilter(''); }} className="text-xs font-600 text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </button>
        )}
        {selectedIds.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-600 text-muted-foreground">{selectedIds.size} selected</span>
            <button
              onClick={handleBulkDeactivate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <AppIcon name="NoSymbolIcon" size={13} />
              Deactivate Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-600 text-muted-foreground hover:text-foreground"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-600">{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</span>
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
                    className="rounded border-border"
                  />
                </th>
                {['Employee', 'Role', 'Department', 'Status', 'Permissions', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-700 text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No employees match the current filters.
                  </td>
                </tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className={`border-t border-border hover:bg-secondary/20 transition-colors ${selectedIds.has(emp.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-700 text-primary">{emp.initials}</span>
                      </div>
                      <div>
                        <p className="font-600 text-foreground text-sm">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                        <p className="text-[10px] text-muted-foreground/70">{emp.id} · {emp.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${roleColors[emp.role]}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{emp.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[emp.status].dot}`} />
                      <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${statusConfig[emp.status].badge}`}>
                        {statusConfig[emp.status].label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-600 text-foreground">{emp.permissions.length}</span>
                      <span className="text-xs text-muted-foreground">/ {ALL_PERMISSIONS.length}</span>
                    </div>
                    <div className="w-20 h-1 bg-border rounded-full mt-1">
                      <div
                        className="h-1 bg-primary rounded-full"
                        style={{ width: `${(emp.permissions.length / ALL_PERMISSIONS.length) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{emp.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditEmployee(emp)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        title="Edit profile"
                      >
                        <AppIcon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setPermEmployee(emp)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        title="Configure permissions"
                      >
                        <AppIcon name="ShieldCheckIcon" size={14} className="text-muted-foreground" />
                      </button>
                      {emp.status === 'Active' && (
                        <button
                          onClick={() => setDeactivateEmployee(emp)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Deactivate account"
                        >
                          <AppIcon name="NoSymbolIcon" size={14} className="text-muted-foreground hover:text-red-500" />
                        </button>
                      )}
                      {emp.status !== 'Active' && (
                        <button
                          onClick={() => {
                            setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'Active' as Status } : e));
                            addToast(`${emp.name}'s account reactivated.`);
                          }}
                          className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                          title="Reactivate account"
                        >
                          <AppIcon name="CheckCircleIcon" size={14} className="text-muted-foreground hover:text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editEmployee && (
        <EditEmployeeModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onSave={handleSaveEdit}
        />
      )}
      {permEmployee && (
        <PermissionsModal
          employee={permEmployee}
          onClose={() => setPermEmployee(null)}
          onSave={handleSavePermissions}
        />
      )}
      {deactivateEmployee && (
        <DeactivateModal
          employee={deactivateEmployee}
          onClose={() => setDeactivateEmployee(null)}
          onConfirm={() => handleDeactivate(deactivateEmployee)}
        />
      )}
      {bulkImportOpen && (
        <BulkImportModal
          onClose={() => setBulkImportOpen(false)}
          onImport={handleBulkImport}
        />
      )}
      {addEmployeeOpen && (
        <AddEmployeeModal
          onClose={() => setAddEmployeeOpen(false)}
          onAdd={handleAddEmployee}
          existingCount={employees.length}
        />
      )}
      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}

// ─── Edit Employee Modal ──────────────────────────────────────────────────────

function EditEmployeeModal({ employee, onClose, onSave }: { employee: Employee; onClose: () => void; onSave: (e: Employee) => void }) {
  const [form, setForm] = useState({ ...employee });

  const set = (field: keyof Employee, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <ModalShell title="Edit Employee Profile" onClose={onClose} width="max-w-lg">
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-700 text-foreground mb-1.5 block">Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Email</label>
            <input value={form.email} onChange={e => set('email', e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Position / Title</label>
            <input value={form.position} onChange={e => set('position', e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Join Date</label>
            <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Role</label>
            <select value={form.role} onChange={e => {
              const newRole = e.target.value as Role;
              setForm(prev => ({ ...prev, role: newRole, permissions: ROLE_DEFAULT_PERMISSIONS[newRole] }));
            }} className="input-base w-full">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Department</label>
            <select value={form.department} onChange={e => set('department', e.target.value as Department)} className="input-base w-full">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value as Status)} className="input-base w-full">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
          <AppIcon name="InformationCircleIcon" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">Changing the role will reset permissions to role defaults. You can fine-tune them via the Permissions panel.</p>
        </div>
      </div>
      <ModalFooter onClose={onClose} onConfirm={() => onSave(form)} confirmLabel="Save Changes" />
    </ModalShell>
  );
}

// ─── Permissions Modal ────────────────────────────────────────────────────────

function PermissionsModal({ employee, onClose, onSave }: { employee: Employee; onClose: () => void; onSave: (e: Employee) => void }) {
  const [perms, setPerms] = useState<string[]>([...employee.permissions]);

  const toggle = (id: string) => setPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const applyRoleDefaults = () => setPerms(ROLE_DEFAULT_PERMISSIONS[employee.role]);
  const grantAll = () => setPerms(ALL_PERMISSIONS.map(p => p.id));
  const revokeAll = () => setPerms([]);

  return (
    <ModalShell title={`Permissions — ${employee.name}`} onClose={onClose} width="max-w-lg">
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${roleColors[employee.role]}`}>{employee.role}</span>
          <span className="text-xs text-muted-foreground">{employee.department}</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={applyRoleDefaults} className="text-xs font-600 text-primary hover:underline">Role Defaults</button>
            <button onClick={grantAll} className="text-xs font-600 text-green-600 hover:underline">Grant All</button>
            <button onClick={revokeAll} className="text-xs font-600 text-red-500 hover:underline">Revoke All</button>
          </div>
        </div>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {permCategories.map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-700 uppercase tracking-widest text-muted-foreground mb-2">{cat}</p>
              <div className="space-y-1.5">
                {ALL_PERMISSIONS.filter(p => p.category === cat).map(perm => (
                  <label key={perm.id} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggle(perm.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        perms.includes(perm.id)
                          ? 'bg-primary border-primary' :'border-border group-hover:border-primary/50'
                      }`}
                    >
                      {perms.includes(perm.id) && <AppIcon name="CheckIcon" size={10} className="text-primary-foreground" />}
                    </div>
                    <span className="text-sm text-foreground">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{perms.length} of {ALL_PERMISSIONS.length} permissions granted</span>
          <div className="w-32 h-1.5 bg-border rounded-full">
            <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${(perms.length / ALL_PERMISSIONS.length) * 100}%` }} />
          </div>
        </div>
      </div>
      <ModalFooter onClose={onClose} onConfirm={() => onSave({ ...employee, permissions: perms })} confirmLabel="Save Permissions" />
    </ModalShell>
  );
}

// ─── Deactivate Modal ─────────────────────────────────────────────────────────

function DeactivateModal({ employee, onClose, onConfirm }: { employee: Employee; onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell title="Deactivate Account" onClose={onClose} width="max-w-sm">
      <div className="px-6 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AppIcon name="NoSymbolIcon" size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-700 text-foreground text-sm">{employee.name}</p>
            <p className="text-xs text-muted-foreground">{employee.email}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          This will deactivate <span className="font-600 text-foreground">{employee.name}</span>'s account. They will lose access to the system immediately. You can reactivate the account at any time.
        </p>
        {employee.tasksAssigned > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
            <AppIcon name="ExclamationTriangleIcon" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">This employee has <strong>{employee.tasksAssigned} active tasks</strong> assigned. Consider reassigning them before deactivating.</p>
          </div>
        )}
      </div>
      <ModalFooter onClose={onClose} onConfirm={onConfirm} confirmLabel="Deactivate Account" confirmVariant="danger" />
    </ModalShell>
  );
}

// ─── Add Employee Modal ───────────────────────────────────────────────────────

function AddEmployeeModal({ onClose, onAdd, existingCount }: { onClose: () => void; onAdd: (e: Employee) => void; existingCount: number }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', role: 'Employee' as Role, department: 'Administration' as Department, joinDate: '' });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
    const newEmp: Employee = {
      id: `EMP-${String(existingCount + 1).padStart(3, '0')}`,
      ...form,
      status: 'Active',
      lastLogin: 'Never',
      tasksAssigned: 0,
      initials,
      permissions: ROLE_DEFAULT_PERMISSIONS[form.role],
    };
    onAdd(newEmp);
  };

  return (
    <ModalShell title="Add New Employee" onClose={onClose} width="max-w-lg">
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-700 text-foreground mb-1.5 block">Full Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Anita Maharjan" className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Email Address *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@aakashcooperative.com.np" className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+977-98XXXXXXXX" className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Position / Title</label>
            <input value={form.position} onChange={e => set('position', e.target.value)} placeholder="e.g. Finance Officer" className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Join Date</label>
            <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className="input-base w-full">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-700 text-foreground mb-1.5 block">Department</label>
            <select value={form.department} onChange={e => set('department', e.target.value)} className="input-base w-full">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Permissions will be set to role defaults. You can customize them after creation.</p>
      </div>
      <ModalFooter onClose={onClose} onConfirm={handleSubmit} confirmLabel="Add Employee" />
    </ModalShell>
  );
}

// ─── Bulk Import Modal ────────────────────────────────────────────────────────

function BulkImportModal({ onClose, onImport }: { onClose: () => void; onImport: (count: number) => void }) {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const PREVIEW_ROWS = [
    { name: 'Nirmala Shrestha', email: 'nirmala.shrestha@aakashcooperative.com.np', role: 'Employee', department: 'Finance' },
    { name: 'Bikash Tamang', email: 'bikash.tamang@aakashcooperative.com.np', role: 'Officer', department: 'Credit' },
    { name: 'Sarita Poudel', email: 'sarita.poudel@aakashcooperative.com.np', role: 'Employee', department: 'HR' },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setFileName(file.name); setStep('preview'); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setFileName(file.name); setStep('preview'); }
  };

  return (
    <ModalShell title="Bulk Import Employees" onClose={onClose} width="max-w-lg">
      <div className="px-6 py-5">
        {step === 'upload' && (
          <>
            <p className="text-sm text-muted-foreground mb-4">Upload a CSV file with columns: <code className="bg-secondary px-1 rounded text-xs">name, email, phone, position, role, department</code></p>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <AppIcon name="ArrowUpTrayIcon" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-600 text-foreground mb-1">Drag & drop your CSV file here</p>
              <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
              <label className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 transition-colors">
                Browse File
                <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <div className="mt-4 bg-secondary/50 rounded-lg p-3">
              <p className="text-xs font-700 text-foreground mb-2">CSV Template Format:</p>
              <code className="text-[11px] text-muted-foreground">name,email,phone,position,role,department</code>
            </div>
          </>
        )}
        {step === 'preview' && (
          <>
            <div className="flex items-center gap-2 mb-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <AppIcon name="CheckCircleIcon" size={14} className="text-green-600" />
              <span className="text-xs font-600 text-green-700">File loaded: {fileName}</span>
            </div>
            <p className="text-xs font-700 text-muted-foreground mb-2">Preview ({PREVIEW_ROWS.length} rows detected)</p>
            <div className="border border-border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-xs">
                <thead className="bg-secondary/40">
                  <tr>{['Name', 'Email', 'Role', 'Department'].map(h => <th key={h} className="text-left px-3 py-2 font-700 text-muted-foreground">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {PREVIEW_ROWS.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-600 text-foreground">{row.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                      <td className="px-3 py-2">{row.role}</td>
                      <td className="px-3 py-2">{row.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">All imported employees will be set to <strong>Active</strong> status with role-default permissions.</p>
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-border flex justify-between items-center gap-2">
        {step === 'preview' && (
          <button onClick={() => setStep('upload')} className="text-sm font-600 text-muted-foreground hover:text-foreground">← Back</button>
        )}
        <div className="ml-auto flex gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 text-secondary-foreground bg-secondary rounded-lg hover:bg-border transition-colors">Cancel</button>
          {step === 'upload' && (
            <button onClick={() => setStep('preview')} className="px-4 py-2 text-sm font-600 text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
              Use Sample Data
            </button>
          )}
          {step === 'preview' && (
            <button onClick={() => onImport(PREVIEW_ROWS.length)} className="px-4 py-2 text-sm font-600 text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
              Import {PREVIEW_ROWS.length} Employees
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Shared Modal Shell ───────────────────────────────────────────────────────

function ModalShell({ title, onClose, children, width = 'max-w-lg' }: { title: string; onClose: () => void; children: React.ReactNode; width?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className={`bg-card rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-700 text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <AppIcon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onClose, onConfirm, confirmLabel, confirmVariant = 'primary' }: { onClose: () => void; onConfirm: () => void; confirmLabel: string; confirmVariant?: 'primary' | 'danger' }) {
  return (
    <div className="px-6 py-4 border-t border-border flex justify-end gap-2 flex-shrink-0">
      <button onClick={onClose} className="px-4 py-2 text-sm font-600 text-secondary-foreground bg-secondary rounded-lg hover:bg-border transition-colors">Cancel</button>
      <button
        onClick={onConfirm}
        className={`px-4 py-2 text-sm font-600 rounded-lg transition-colors ${
          confirmVariant === 'danger' ?'bg-red-500 text-white hover:bg-red-600' :'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
