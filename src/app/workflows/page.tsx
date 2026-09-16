'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

interface WorkflowStep {
  role: string;
  action: string;
  dept?: string;
}

interface Workflow {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: WorkflowStep[];
  usageCount: number;
  status: 'Active' | 'Draft' | 'Inactive';
  color: string;
  bgColor: string;
  icon: string;
}

const workflows: Workflow[] = [
  {
    id: 'wf-loan',
    name: 'Loan Processing Workflow',
    category: 'Credit / Loan',
    description: 'End-to-end loan application processing from submission to disbursement',
    steps: [
      { role: 'Member / Applicant', action: 'Submit Loan Application' },
      { role: 'Credit Officer', action: 'Document Verification', dept: 'Credit' },
      { role: 'Credit Analyst', action: 'Credit Analysis & Field Verification', dept: 'Credit' },
      { role: 'Credit Head', action: 'Credit Committee Review', dept: 'Credit' },
      { role: 'CEO / Manager', action: 'Final Approval', dept: 'Management' },
      { role: 'Legal / Documentation', action: 'Agreement & Documentation', dept: 'Administration' },
      { role: 'Finance Officer', action: 'Disbursement Processing', dept: 'Finance' },
    ],
    usageCount: 48,
    status: 'Active',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200',
    icon: 'CurrencyRupeeIcon',
  },
  {
    id: 'wf-meeting',
    name: 'Board Meeting Workflow',
    category: 'Administration',
    description: 'Complete workflow for organizing and documenting board meetings',
    steps: [
      { role: 'CEO / Secretary', action: 'Schedule Meeting & Set Agenda' },
      { role: 'Administration', action: 'Notice Preparation & Distribution', dept: 'Administration' },
      { role: 'All Departments', action: 'Report Preparation', dept: 'All' },
      { role: 'Administration', action: 'Meeting Facilitation', dept: 'Administration' },
      { role: 'Secretary', action: 'Minutes Preparation', dept: 'Administration' },
      { role: 'Board / CEO', action: 'Minutes Review & Approval' },
      { role: 'Administration', action: 'Implementation Task Assignment', dept: 'Administration' },
    ],
    usageCount: 12,
    status: 'Active',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: 'BuildingLibraryIcon',
  },
  {
    id: 'wf-audit',
    name: 'Annual Audit Preparation',
    category: 'Finance',
    description: 'Systematic preparation workflow for annual financial audit',
    steps: [
      { role: 'Finance Head', action: 'Audit Schedule & Checklist Preparation', dept: 'Finance' },
      { role: 'All Departments', action: 'Document Collection & Submission' },
      { role: 'Finance Team', action: 'Financial Statement Preparation', dept: 'Finance' },
      { role: 'Internal Auditor', action: 'Internal Audit Review' },
      { role: 'Finance Head', action: 'Discrepancy Resolution', dept: 'Finance' },
      { role: 'CEO', action: 'Final Review & Sign-off' },
      { role: 'External Auditor', action: 'External Audit' },
    ],
    usageCount: 4,
    status: 'Active',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: 'DocumentChartBarIcon',
  },
  {
    id: 'wf-hr-onboard',
    name: 'Employee Onboarding',
    category: 'HR',
    description: 'Structured onboarding process for new employees joining the cooperative',
    steps: [
      { role: 'HR Department', action: 'Offer Letter & Documentation', dept: 'HR' },
      { role: 'IT Department', action: 'System Access & Equipment Setup', dept: 'IT' },
      { role: 'Department Head', action: 'Orientation & Introduction' },
      { role: 'HR Department', action: 'Policy & Compliance Training', dept: 'HR' },
      { role: 'Supervisor', action: '30-Day Check-in & Feedback' },
      { role: 'HR Department', action: 'Probation Review & Confirmation', dept: 'HR' },
    ],
    usageCount: 7,
    status: 'Active',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50 border-pink-200',
    icon: 'UserGroupIcon',
  },
  {
    id: 'wf-recovery',
    name: 'Loan Recovery Process',
    category: 'Recovery',
    description: 'Systematic follow-up and recovery workflow for overdue loans',
    steps: [
      { role: 'Recovery Officer', action: 'Overdue Identification & Notice', dept: 'Recovery' },
      { role: 'Recovery Officer', action: 'Member Contact & Negotiation', dept: 'Recovery' },
      { role: 'Recovery Head', action: 'Recovery Plan Approval', dept: 'Recovery' },
      { role: 'Legal Team', action: 'Legal Notice (if required)', dept: 'Administration' },
      { role: 'CEO / Board', action: 'Write-off Decision (if applicable)' },
    ],
    usageCount: 23,
    status: 'Active',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: 'ArrowPathRoundedSquareIcon',
  },
  {
    id: 'wf-procurement',
    name: 'Procurement Approval',
    category: 'Administration',
    description: 'Purchase request and vendor approval workflow',
    steps: [
      { role: 'Requesting Department', action: 'Purchase Request Submission' },
      { role: 'Department Head', action: 'Department Approval' },
      { role: 'Finance', action: 'Budget Verification', dept: 'Finance' },
      { role: 'CEO / Manager', action: 'Final Approval' },
      { role: 'Administration', action: 'Vendor Selection & Purchase', dept: 'Administration' },
    ],
    usageCount: 31,
    status: 'Active',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: 'ShoppingBagIcon',
  },
];

const statusColors: Record<string, string> = {
  Active: 'bg-green-50 text-green-700 border-green-200',
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  Inactive: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function WorkflowsPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...Array.from(new Set(workflows.map(w => w.category)))];

  const filtered = workflows.filter(w => {
    const matchSearch = searchQuery === '' || w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || w.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure task workflow templates and approval chains</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 transition-all shadow-sm">
          <AppIcon name="PlusIcon" size={16} />
          New Workflow
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <AppIcon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workflows..."
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

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(wf => (
          <div
            key={wf.id}
            onClick={() => setSelectedWorkflow(wf)}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-card-hover hover:border-primary/20 transition-all cursor-pointer group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${wf.bgColor} border flex items-center justify-center flex-shrink-0`}>
                <AppIcon name={wf.icon as any} size={20} className={wf.color} />
              </div>
              <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full border ${statusColors[wf.status]}`}>
                {wf.status}
              </span>
            </div>

            <h3 className="font-700 text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{wf.name}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{wf.description}</p>

            {/* Steps Preview */}
            <div className="flex items-center gap-1 mb-3 overflow-hidden">
              {wf.steps.slice(0, 4).map((step, i) => (
                <React.Fragment key={i}>
                  <div className={`w-5 h-5 rounded-full ${wf.bgColor} border flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-[9px] font-700 ${wf.color}`}>{i + 1}</span>
                  </div>
                  {i < Math.min(wf.steps.length - 1, 3) && (
                    <div className="w-3 h-px bg-border flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
              {wf.steps.length > 4 && (
                <span className="text-[10px] text-muted-foreground ml-1">+{wf.steps.length - 4} more</span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${wf.bgColor} border ${wf.color}`}>
                {wf.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AppIcon name="RectangleStackIcon" size={12} />
                <span>{wf.steps.length} steps &nbsp;·&nbsp; Used {wf.usageCount}×</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Detail Drawer */}
      {selectedWorkflow && (
        <div className="fixed inset-0 z-50 flex">
          <div className="modal-backdrop absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedWorkflow(null)} />
          <div className="slide-in-right relative ml-auto w-full max-w-lg bg-card h-full overflow-y-auto scrollbar-thin shadow-modal flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${selectedWorkflow.bgColor} border flex items-center justify-center flex-shrink-0`}>
                  <AppIcon name={selectedWorkflow.icon as any} size={18} className={selectedWorkflow.color} />
                </div>
                <div>
                  <h2 className="text-sm font-700 text-foreground">{selectedWorkflow.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedWorkflow.category} &nbsp;·&nbsp; {selectedWorkflow.steps.length} steps</p>
                </div>
              </div>
              <button onClick={() => setSelectedWorkflow(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <AppIcon name="XMarkIcon" size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 flex-1">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{selectedWorkflow.description}</p>

              {/* Workflow Steps */}
              <p className="text-label text-muted-foreground mb-4">Workflow Steps</p>
              <div className="space-y-0">
                {selectedWorkflow.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full ${selectedWorkflow.bgColor} border-2 ${selectedWorkflow.bgColor} flex items-center justify-center z-10`}>
                        <span className={`text-xs font-700 ${selectedWorkflow.color}`}>{i + 1}</span>
                      </div>
                      {i < selectedWorkflow.steps.length - 1 && (
                        <div className="w-0.5 h-8 bg-border mt-1" />
                      )}
                    </div>
                    {/* Step content */}
                    <div className={`pb-6 flex-1 ${i === selectedWorkflow.steps.length - 1 ? 'pb-0' : ''}`}>
                      <p className="text-sm font-600 text-foreground leading-snug">{step.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{step.role}</span>
                        {step.dept && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className={`text-[10px] font-600 px-1.5 py-0.5 rounded-full ${selectedWorkflow.bgColor} border ${selectedWorkflow.color}`}>{step.dept}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-border">
                <button className="flex-1 py-2.5 text-sm font-600 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                  Use This Workflow
                </button>
                <button className="flex-1 py-2.5 text-sm font-600 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all">
                  Edit Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
