'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

interface Department {
  id: string;
  name: string;
  head: string;
  headInitials: string;
  members: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  color: string;
  bgColor: string;
  description: string;
  status: 'Active' | 'Inactive';
}

const departments: Department[] = [
  {
    id: 'dept-adm',
    name: 'Administration',
    head: 'Ram Prasad Adhikari',
    headInitials: 'RA',
    members: 8,
    activeTasks: 14,
    completedTasks: 28,
    overdueTasks: 2,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'General administration, documentation, and organizational management',
    status: 'Active',
  },
  {
    id: 'dept-fin',
    name: 'Finance / Accounts',
    head: 'Sita Sharma',
    headInitials: 'SS',
    members: 6,
    activeTasks: 11,
    completedTasks: 27,
    overdueTasks: 1,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Financial reporting, accounts management, and audit preparation',
    status: 'Active',
  },
  {
    id: 'dept-crd',
    name: 'Credit / Loan',
    head: 'Hari Bahadur Tamang',
    headInitials: 'HT',
    members: 12,
    activeTasks: 22,
    completedTasks: 39,
    overdueTasks: 4,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200',
    description: 'Loan processing, credit analysis, and disbursement management',
    status: 'Active',
  },
  {
    id: 'dept-rec',
    name: 'Recovery',
    head: 'Gita Rai',
    headInitials: 'GR',
    members: 7,
    activeTasks: 9,
    completedTasks: 20,
    overdueTasks: 3,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Overdue loan recovery, member follow-up, and legal documentation',
    status: 'Active',
  },
  {
    id: 'dept-hr',
    name: 'Human Resources',
    head: 'Mohan Thapa',
    headInitials: 'MT',
    members: 4,
    activeTasks: 7,
    completedTasks: 15,
    overdueTasks: 0,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50 border-pink-200',
    description: 'Recruitment, onboarding, training, and employee management',
    status: 'Active',
  },
  {
    id: 'dept-it',
    name: 'Information Technology',
    head: 'Sunita Karki',
    headInitials: 'SK',
    members: 3,
    activeTasks: 5,
    completedTasks: 13,
    overdueTasks: 0,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50 border-cyan-200',
    description: 'System maintenance, user support, and technical infrastructure',
    status: 'Active',
  },
  {
    id: 'dept-mkt',
    name: 'Marketing',
    head: 'Dipak Shrestha',
    headInitials: 'DS',
    members: 3,
    activeTasks: 4,
    completedTasks: 10,
    overdueTasks: 1,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Member outreach, promotional campaigns, and brand management',
    status: 'Active',
  },
  {
    id: 'dept-mem',
    name: 'Membership / Service',
    head: 'Kamala Gurung',
    headInitials: 'KG',
    members: 5,
    activeTasks: 6,
    completedTasks: 18,
    overdueTasks: 0,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200',
    description: 'Member registration, service delivery, and customer relations',
    status: 'Active',
  },
];

const membersList: Record<string, { name: string; role: string; initials: string; tasks: number }[]> = {
  'dept-adm': [
    { name: 'Ram Prasad Adhikari', role: 'Department Head', initials: 'RA', tasks: 5 },
    { name: 'Binod Khadka', role: 'Senior Officer', initials: 'BK', tasks: 3 },
    { name: 'Anita Poudel', role: 'Officer', initials: 'AP', tasks: 4 },
    { name: 'Suresh Bista', role: 'Assistant', initials: 'SB', tasks: 2 },
  ],
  'dept-fin': [
    { name: 'Sita Sharma', role: 'Finance Head', initials: 'SS', tasks: 4 },
    { name: 'Prakash Joshi', role: 'Accountant', initials: 'PJ', tasks: 3 },
    { name: 'Nirmala Devi', role: 'Junior Accountant', initials: 'ND', tasks: 4 },
  ],
};

export default function DepartmentsPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.head.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = departments.reduce((s, d) => s + d.members, 0);
  const totalActiveTasks = departments.reduce((s, d) => s + d.activeTasks, 0);
  const totalOverdue = departments.reduce((s, d) => s + d.overdueTasks, 0);

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {departments.length} departments &nbsp;·&nbsp; {totalMembers} total members
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 transition-all shadow-sm"
        >
          <AppIcon name="PlusIcon" size={16} />
          Add Department
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Departments', value: departments.length, icon: 'BuildingOffice2Icon', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Tasks', value: totalActiveTasks, icon: 'RectangleStackIcon', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Overdue Tasks', value: totalOverdue, icon: 'ExclamationTriangleIcon', color: 'text-red-600', bg: 'bg-red-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <AppIcon name={stat.icon as any} size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-700 text-foreground leading-none">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <AppIcon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search departments or heads..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(dept => {
          const completionRate = Math.round((dept.completedTasks / (dept.completedTasks + dept.activeTasks)) * 100);
          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDept(dept)}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-card-hover hover:border-primary/20 transition-all cursor-pointer group"
            >
              {/* Dept Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${dept.bgColor} border flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-sm font-700 ${dept.color}`}>{dept.name[0]}</span>
                </div>
                <span className="text-[10px] font-600 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  {dept.status}
                </span>
              </div>

              <h3 className="font-700 text-foreground text-sm mb-0.5 group-hover:text-primary transition-colors">{dept.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{dept.description}</p>

              {/* Head */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                <div className={`w-6 h-6 rounded-full ${dept.bgColor} border flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-[9px] font-700 ${dept.color}`}>{dept.headInitials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-600 text-foreground truncate">{dept.head}</p>
                  <p className="text-[10px] text-muted-foreground">Department Head</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-base font-700 text-foreground">{dept.members}</p>
                  <p className="text-[10px] text-muted-foreground">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-700 text-violet-600">{dept.activeTasks}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <p className={`text-base font-700 ${dept.overdueTasks > 0 ? 'text-red-600' : 'text-green-600'}`}>{dept.overdueTasks}</p>
                  <p className="text-[10px] text-muted-foreground">Overdue</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Completion rate</span>
                  <span className="text-[10px] font-600 text-foreground">{completionRate}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Detail Drawer */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex">
          <div className="modal-backdrop absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedDept(null)} />
          <div className="slide-in-right relative ml-auto w-full max-w-md bg-card h-full overflow-y-auto scrollbar-thin shadow-modal flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h2 className="text-base font-700 text-foreground">{selectedDept.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedDept.members} members · {selectedDept.activeTasks} active tasks</p>
              </div>
              <button onClick={() => setSelectedDept(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <AppIcon name="XMarkIcon" size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Description */}
              <div>
                <p className="text-label text-muted-foreground mb-2">About</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedDept.description}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Active Tasks', value: selectedDept.activeTasks, color: 'text-violet-600' },
                  { label: 'Completed', value: selectedDept.completedTasks, color: 'text-green-600' },
                  { label: 'Overdue', value: selectedDept.overdueTasks, color: 'text-red-600' },
                  { label: 'Members', value: selectedDept.members, color: 'text-blue-600' },
                ].map(s => (
                  <div key={s.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                    <p className={`text-xl font-700 ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Members */}
              <div>
                <p className="text-label text-muted-foreground mb-3">Team Members</p>
                <div className="space-y-2">
                  {(membersList[selectedDept.id] ?? [
                    { name: selectedDept.head, role: 'Department Head', initials: selectedDept.headInitials, tasks: selectedDept.activeTasks },
                  ]).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
                      <div className={`w-8 h-8 rounded-full ${selectedDept.bgColor} border flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-700 ${selectedDept.color}`}>{m.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-600 text-foreground truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.role}</p>
                      </div>
                      <span className="text-xs font-600 text-muted-foreground">{m.tasks} tasks</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2.5 text-sm font-600 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                  View All Tasks
                </button>
                <button className="flex-1 py-2.5 text-sm font-600 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all">
                  Edit Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="modal-backdrop absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setAddModalOpen(false)} />
          <div className="modal-content relative bg-card rounded-2xl shadow-modal w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-700 text-foreground">Add New Department</h2>
              <button onClick={() => setAddModalOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <AppIcon name="XMarkIcon" size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-label text-muted-foreground block mb-1.5">Department Name</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  placeholder="e.g. Legal Department"
                  className="w-full px-3 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-label text-muted-foreground block mb-1.5">Department Head</label>
                <input
                  type="text"
                  value={newDeptHead}
                  onChange={e => setNewDeptHead(e.target.value)}
                  placeholder="Full name of department head"
                  className="w-full px-3 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-label text-muted-foreground block mb-1.5">Description</label>
                <textarea
                  value={newDeptDesc}
                  onChange={e => setNewDeptDesc(e.target.value)}
                  placeholder="Brief description of department responsibilities"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setAddModalOpen(false)} className="flex-1 py-2.5 text-sm font-600 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all">
                Cancel
              </button>
              <button
                onClick={() => setAddModalOpen(false)}
                className="flex-1 py-2.5 text-sm font-600 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
