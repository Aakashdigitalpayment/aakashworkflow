'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

interface TemplateSubtask {
  title: string;
  assignRole: string;
  estimatedDays: number;
}

interface TaskTemplate {
  id: string;
  name: string;
  category: string;
  department: string;
  description: string;
  defaultAssignee: string;
  defaultPriority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedDays: number;
  subtasks: TemplateSubtask[];
  usageCount: number;
  isRecurring: boolean;
  recurringFrequency?: string;
  color: string;
  bgColor: string;
  icon: string;
}

const templates: TaskTemplate[] = [
  {
    id: 'tpl-mis',
    name: 'Monthly MIS Report',
    category: 'Reporting',
    department: 'Finance',
    description: 'Monthly Management Information System report preparation and submission',
    defaultAssignee: 'Finance Head',
    defaultPriority: 'High',
    estimatedDays: 5,
    subtasks: [
      { title: 'Data collection from all departments', assignRole: 'Finance Officer', estimatedDays: 2 },
      { title: 'Data verification and reconciliation', assignRole: 'Senior Accountant', estimatedDays: 1 },
      { title: 'Report preparation and formatting', assignRole: 'Finance Head', estimatedDays: 1 },
      { title: 'Review and approval', assignRole: 'CEO', estimatedDays: 1 },
    ],
    usageCount: 24,
    isRecurring: true,
    recurringFrequency: 'Monthly (5th day)',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: 'DocumentChartBarIcon',
  },
  {
    id: 'tpl-agm',
    name: 'Annual General Meeting',
    category: 'Meeting',
    department: 'Administration',
    description: 'Complete preparation workflow for Annual General Meeting of the cooperative',
    defaultAssignee: 'Administration Head',
    defaultPriority: 'Critical',
    estimatedDays: 14,
    subtasks: [
      { title: 'Member list preparation and verification', assignRole: 'Administration Officer', estimatedDays: 2 },
      { title: 'Agenda preparation', assignRole: 'CEO Secretary', estimatedDays: 1 },
      { title: 'Financial report compilation', assignRole: 'Finance Head', estimatedDays: 3 },
      { title: 'Notice preparation and distribution', assignRole: 'Administration', estimatedDays: 2 },
      { title: 'Venue and logistics arrangement', assignRole: 'Administration Officer', estimatedDays: 3 },
      { title: 'Registration and attendance management', assignRole: 'Administration', estimatedDays: 1 },
      { title: 'Minutes preparation and approval', assignRole: 'CEO Secretary', estimatedDays: 2 },
    ],
    usageCount: 3,
    isRecurring: true,
    recurringFrequency: 'Yearly',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: 'BuildingLibraryIcon',
  },
  {
    id: 'tpl-audit',
    name: 'Audit Preparation',
    category: 'Finance',
    department: 'Finance',
    description: 'Systematic preparation for internal and external financial audit',
    defaultAssignee: 'Finance Head',
    defaultPriority: 'Critical',
    estimatedDays: 21,
    subtasks: [
      { title: 'Audit checklist preparation', assignRole: 'Finance Head', estimatedDays: 1 },
      { title: 'Document collection from departments', assignRole: 'All Departments', estimatedDays: 5 },
      { title: 'Financial statement preparation', assignRole: 'Senior Accountant', estimatedDays: 5 },
      { title: 'Internal audit review', assignRole: 'Internal Auditor', estimatedDays: 5 },
      { title: 'Discrepancy resolution', assignRole: 'Finance Head', estimatedDays: 3 },
      { title: 'Final report and sign-off', assignRole: 'CEO', estimatedDays: 2 },
    ],
    usageCount: 4,
    isRecurring: true,
    recurringFrequency: 'Yearly',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200',
    icon: 'ClipboardDocumentCheckIcon',
  },
  {
    id: 'tpl-onboard',
    name: 'Employee Onboarding',
    category: 'HR',
    department: 'HR',
    description: 'Structured onboarding checklist for new employees',
    defaultAssignee: 'HR Head',
    defaultPriority: 'Medium',
    estimatedDays: 7,
    subtasks: [
      { title: 'Offer letter and contract documentation', assignRole: 'HR Officer', estimatedDays: 1 },
      { title: 'System access and equipment setup', assignRole: 'IT Officer', estimatedDays: 1 },
      { title: 'Department orientation and introduction', assignRole: 'Department Head', estimatedDays: 1 },
      { title: 'Policy and compliance training', assignRole: 'HR Officer', estimatedDays: 2 },
      { title: 'Role-specific training', assignRole: 'Supervisor', estimatedDays: 2 },
    ],
    usageCount: 7,
    isRecurring: false,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50 border-pink-200',
    icon: 'UserPlusIcon',
  },
  {
    id: 'tpl-recovery',
    name: 'Monthly Recovery Report',
    category: 'Reporting',
    department: 'Recovery',
    description: 'Monthly overdue loan recovery status report',
    defaultAssignee: 'Recovery Head',
    defaultPriority: 'High',
    estimatedDays: 3,
    subtasks: [
      { title: 'Overdue loan list compilation', assignRole: 'Recovery Officer', estimatedDays: 1 },
      { title: 'Member contact and follow-up log', assignRole: 'Recovery Officer', estimatedDays: 1 },
      { title: 'Recovery report preparation', assignRole: 'Recovery Head', estimatedDays: 1 },
    ],
    usageCount: 12,
    isRecurring: true,
    recurringFrequency: 'Monthly',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: 'ArrowPathRoundedSquareIcon',
  },
  {
    id: 'tpl-procurement',
    name: 'Procurement Request',
    category: 'Administration',
    department: 'Administration',
    description: 'Standard purchase request and vendor approval process',
    defaultAssignee: 'Administration Head',
    defaultPriority: 'Medium',
    estimatedDays: 5,
    subtasks: [
      { title: 'Purchase request form submission', assignRole: 'Requesting Dept', estimatedDays: 1 },
      { title: 'Budget verification', assignRole: 'Finance Officer', estimatedDays: 1 },
      { title: 'Vendor quotation collection', assignRole: 'Administration', estimatedDays: 2 },
      { title: 'Approval and purchase order', assignRole: 'CEO', estimatedDays: 1 },
    ],
    usageCount: 18,
    isRecurring: false,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: 'ShoppingBagIcon',
  },
];

const priorityColors: Record<string, string> = {
  Critical: 'priority-critical',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

const categories = ['all', 'Reporting', 'Meeting', 'Finance', 'HR', 'Administration'];

export default function TemplatesPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [useModalOpen, setUseModalOpen] = useState(false);

  const filtered = templates.filter(t => {
    const matchSearch = searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Task Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Reusable templates for recurring cooperative workflows</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 transition-all shadow-sm">
          <AppIcon name="PlusIcon" size={16} />
          New Template
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <AppIcon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-600 rounded-full border transition-all ${
                filterCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(tpl => (
          <div
            key={tpl.id}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-card-hover hover:border-primary/20 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${tpl.bgColor} border flex items-center justify-center flex-shrink-0`}>
                <AppIcon name={tpl.icon as any} size={20} className={tpl.color} />
              </div>
              <div className="flex items-center gap-1.5">
                {tpl.isRecurring && (
                  <span className="text-[10px] font-600 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Recurring
                  </span>
                )}
                <span className={`text-[10px] font-600 px-1.5 py-0.5 rounded-full ${priorityColors[tpl.defaultPriority]}`}>
                  {tpl.defaultPriority}
                </span>
              </div>
            </div>

            <h3 className="font-700 text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{tpl.name}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{tpl.description}</p>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-border">
              <div>
                <p className="text-[10px] text-muted-foreground">Department</p>
                <p className="text-xs font-600 text-foreground mt-0.5">{tpl.department}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Est. Duration</p>
                <p className="text-xs font-600 text-foreground mt-0.5">{tpl.estimatedDays} days</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Subtasks</p>
                <p className="text-xs font-600 text-foreground mt-0.5">{tpl.subtasks.length} tasks</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Used</p>
                <p className="text-xs font-600 text-foreground mt-0.5">{tpl.usageCount} times</p>
              </div>
            </div>

            {tpl.isRecurring && tpl.recurringFrequency && (
              <div className="flex items-center gap-1.5 mb-3">
                <AppIcon name="ArrowPathIcon" size={12} className="text-blue-600" />
                <span className="text-[11px] text-blue-600 font-600">{tpl.recurringFrequency}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedTemplate(tpl); setUseModalOpen(true); }}
                className="flex-1 py-2 text-xs font-700 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Use Template
              </button>
              <button
                onClick={() => setSelectedTemplate(tpl)}
                className="px-3 py-2 text-xs font-600 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all"
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Drawer */}
      {selectedTemplate && !useModalOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="modal-backdrop absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedTemplate(null)} />
          <div className="slide-in-right relative ml-auto w-full max-w-md bg-card h-full overflow-y-auto scrollbar-thin shadow-modal flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${selectedTemplate.bgColor} border flex items-center justify-center`}>
                  <AppIcon name={selectedTemplate.icon as any} size={18} className={selectedTemplate.color} />
                </div>
                <div>
                  <h2 className="text-sm font-700 text-foreground">{selectedTemplate.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.department} &nbsp;·&nbsp; {selectedTemplate.estimatedDays} days</p>
                </div>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <AppIcon name="XMarkIcon" size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 flex-1">
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{selectedTemplate.description}</p>

              <p className="text-label text-muted-foreground mb-3">Subtasks ({selectedTemplate.subtasks.length})</p>
              <div className="space-y-2.5 mb-6">
                {selectedTemplate.subtasks.map((sub, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-secondary/40 rounded-xl">
                    <div className={`w-6 h-6 rounded-full ${selectedTemplate.bgColor} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className={`text-[10px] font-700 ${selectedTemplate.color}`}>{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 text-foreground leading-snug">{sub.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">{sub.assignRole}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-[10px] text-muted-foreground">{sub.estimatedDays}d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setUseModalOpen(true)}
                className="w-full py-2.5 text-sm font-700 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Template Modal */}
      {useModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="modal-backdrop absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setUseModalOpen(false); setSelectedTemplate(null); }} />
          <div className="modal-content relative bg-card rounded-2xl shadow-modal w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-700 text-foreground">Create Task from Template</h2>
              <button onClick={() => { setUseModalOpen(false); setSelectedTemplate(null); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <AppIcon name="XMarkIcon" size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-label text-muted-foreground block mb-1.5">Task Title</label>
                <input
                  type="text"
                  defaultValue={selectedTemplate.name}
                  className="w-full px-3 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label text-muted-foreground block mb-1.5">Department</label>
                  <select className="w-full px-3 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground">
                    <option>{selectedTemplate.department}</option>
                  </select>
                </div>
                <div>
                  <label className="text-label text-muted-foreground block mb-1.5">Priority</label>
                  <select className="w-full px-3 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground">
                    <option>{selectedTemplate.defaultPriority}</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-label text-muted-foreground block mb-1.5">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
                />
              </div>
              <div className="p-3 bg-secondary/40 rounded-xl">
                <p className="text-xs font-600 text-foreground mb-1">{selectedTemplate.subtasks.length} subtasks will be created automatically</p>
                <p className="text-xs text-muted-foreground">Estimated completion: {selectedTemplate.estimatedDays} working days</p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setUseModalOpen(false); setSelectedTemplate(null); }} className="flex-1 py-2.5 text-sm font-600 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all">
                Cancel
              </button>
              <button
                onClick={() => { setUseModalOpen(false); setSelectedTemplate(null); }}
                className="flex-1 py-2.5 text-sm font-700 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
