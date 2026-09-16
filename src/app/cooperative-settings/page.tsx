'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  memberCount: number;
  color: string;
}

interface EscalationSLA {
  id: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  slaHours: number;
  escalateTo: string;
}

interface ApprovalTemplate {
  id: string;
  name: string;
  department: string;
  steps: string[];
  taskTypes: string[];
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'In-App' | 'Webhook';
  target: string;
  enabled: boolean;
  events: string[];
}

interface WorkloadRule {
  id: string;
  department: string;
  strategy: 'Round Robin' | 'Least Loaded' | 'Skill Match' | 'Manual';
  maxTasksPerMember: number;
  overflowDepartment: string;
  autoReassign: boolean;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const DEPT_COLORS = ['#1e40af', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

const initialDepartments: Department[] = [
  { id: 'd1', name: 'Finance', code: 'FIN', head: 'Ramesh Sharma', memberCount: 12, color: '#1e40af' },
  { id: 'd2', name: 'Operations', code: 'OPS', head: 'Sita Thapa', memberCount: 18, color: '#7c3aed' },
  { id: 'd3', name: 'Loans & Credit', code: 'LNC', head: 'Bikash Rai', memberCount: 9, color: '#059669' },
  { id: 'd4', name: 'Member Services', code: 'MBS', head: 'Anita Gurung', memberCount: 14, color: '#d97706' },
  { id: 'd5', name: 'Audit & Compliance', code: 'AUD', head: 'Deepak Karki', memberCount: 6, color: '#dc2626' },
  { id: 'd6', name: 'IT & Systems', code: 'ITS', head: 'Priya Shrestha', memberCount: 8, color: '#0891b2' },
];

const initialSLAs: EscalationSLA[] = [
  { id: 's1', department: 'Finance', priority: 'Critical', slaHours: 4, escalateTo: 'Department Head' },
  { id: 's2', department: 'Finance', priority: 'High', slaHours: 12, escalateTo: 'Team Lead' },
  { id: 's3', department: 'Loans & Credit', priority: 'Critical', slaHours: 2, escalateTo: 'CEO' },
  { id: 's4', department: 'Loans & Credit', priority: 'High', slaHours: 8, escalateTo: 'Department Head' },
  { id: 's5', department: 'Operations', priority: 'Critical', slaHours: 6, escalateTo: 'Department Head' },
  { id: 's6', department: 'Member Services', priority: 'High', slaHours: 24, escalateTo: 'Team Lead' },
  { id: 's7', department: 'Audit & Compliance', priority: 'Critical', slaHours: 3, escalateTo: 'Board' },
  { id: 's8', department: 'IT & Systems', priority: 'Medium', slaHours: 48, escalateTo: 'IT Manager' },
];

const initialTemplates: ApprovalTemplate[] = [
  { id: 't1', name: 'Loan Disbursement', department: 'Loans & Credit', steps: ['Loan Officer', 'Credit Manager', 'CFO'], taskTypes: ['Loan Approval', 'Credit Review'] },
  { id: 't2', name: 'Budget Approval', department: 'Finance', steps: ['Finance Officer', 'Finance Manager', 'CEO'], taskTypes: ['Budget Request', 'Expense Claim'] },
  { id: 't3', name: 'Compliance Review', department: 'Audit & Compliance', steps: ['Auditor', 'Compliance Head', 'Board'], taskTypes: ['Policy Update', 'Audit Finding'] },
  { id: 't4', name: 'IT Procurement', department: 'IT & Systems', steps: ['IT Officer', 'IT Manager', 'Finance Manager'], taskTypes: ['Hardware Request', 'Software License'] },
  { id: 't5', name: 'Member Onboarding', department: 'Member Services', steps: ['Service Rep', 'Branch Manager'], taskTypes: ['New Member', 'Account Update'] },
];

const initialChannels: NotificationChannel[] = [
  { id: 'c1', name: 'Primary Email', type: 'Email', target: 'notifications@aakashcoop.com', enabled: true, events: ['Task Assigned', 'Deadline Reminder', 'Escalation'] },
  { id: 'c2', name: 'SMS Gateway', type: 'SMS', target: '+977-98XXXXXXXX', enabled: true, events: ['Critical Escalation', 'Approval Required'] },
  { id: 'c3', name: 'In-App Alerts', type: 'In-App', target: 'All Users', enabled: true, events: ['Task Assigned', 'Comment Added', 'Status Changed', 'Approval Required'] },
  { id: 'c4', name: 'Audit Webhook', type: 'Webhook', target: 'https://audit.aakashcoop.com/hook', enabled: false, events: ['Compliance Breach', 'Audit Finding'] },
  { id: 'c5', name: 'Finance Alerts', type: 'Email', target: 'finance-team@aakashcoop.com', enabled: true, events: ['Budget Exceeded', 'Loan Approved', 'Payment Due'] },
];

const initialWorkloadRules: WorkloadRule[] = [
  { id: 'w1', department: 'Finance', strategy: 'Least Loaded', maxTasksPerMember: 15, overflowDepartment: 'Operations', autoReassign: true },
  { id: 'w2', department: 'Loans & Credit', strategy: 'Skill Match', maxTasksPerMember: 10, overflowDepartment: 'Finance', autoReassign: true },
  { id: 'w3', department: 'Operations', strategy: 'Round Robin', maxTasksPerMember: 20, overflowDepartment: 'Member Services', autoReassign: false },
  { id: 'w4', department: 'Member Services', strategy: 'Round Robin', maxTasksPerMember: 18, overflowDepartment: 'Operations', autoReassign: true },
  { id: 'w5', department: 'Audit & Compliance', strategy: 'Manual', maxTasksPerMember: 8, overflowDepartment: '', autoReassign: false },
  { id: 'w6', department: 'IT & Systems', strategy: 'Least Loaded', maxTasksPerMember: 12, overflowDepartment: 'Operations', autoReassign: false },
];

// ─── Priority badge helper ────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border border-red-200',
  High: 'bg-orange-50 text-orange-700 border border-orange-200',
  Medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Low: 'bg-green-50 text-green-700 border border-green-200',
};

const CHANNEL_TYPE_STYLES: Record<string, string> = {
  Email: 'bg-blue-50 text-blue-700 border border-blue-200',
  SMS: 'bg-purple-50 text-purple-700 border border-purple-200',
  'In-App': 'bg-teal-50 text-teal-700 border border-teal-200',
  Webhook: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const STRATEGY_STYLES: Record<string, string> = {
  'Round Robin': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Least Loaded': 'bg-green-50 text-green-700 border border-green-200',
  'Skill Match': 'bg-purple-50 text-purple-700 border border-purple-200',
  Manual: 'bg-slate-100 text-slate-600 border border-slate-200',
};

// ─── Section Tab ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'departments', label: 'Departments', icon: 'BuildingOffice2Icon' },
  { id: 'sla', label: 'Escalation SLA', icon: 'ClockIcon' },
  { id: 'approval', label: 'Approval Templates', icon: 'ArrowsRightLeftIcon' },
  { id: 'channels', label: 'Notification Channels', icon: 'BellIcon' },
  { id: 'workload', label: 'Workload Rules', icon: 'ChartBarIcon' },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; msg: string; type: 'success' | 'error'; }

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CooperativeSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('departments');
  const [quickCreate, setQuickCreate] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Data state
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [slas, setSLAs] = useState<EscalationSLA[]>(initialSLAs);
  const [templates, setTemplates] = useState<ApprovalTemplate[]>(initialTemplates);
  const [channels, setChannels] = useState<NotificationChannel[]>(initialChannels);
  const [workloadRules, setWorkloadRules] = useState<WorkloadRule[]>(initialWorkloadRules);

  // Modal state
  const [deptModal, setDeptModal] = useState<{ open: boolean; item: Department | null }>({ open: false, item: null });
  const [slaModal, setSlaModal] = useState<{ open: boolean; item: EscalationSLA | null }>({ open: false, item: null });
  const [tplModal, setTplModal] = useState<{ open: boolean; item: ApprovalTemplate | null }>({ open: false, item: null });
  const [chModal, setChModal] = useState<{ open: boolean; item: NotificationChannel | null }>({ open: false, item: null });
  const [wlModal, setWlModal] = useState<{ open: boolean; item: WorkloadRule | null }>({ open: false, item: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; label: string; onConfirm: () => void } | null>(null);

  const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  };

  // ── Department handlers ──
  const saveDept = (d: Department) => {
    setDepartments(p => p.some(x => x.id === d.id) ? p.map(x => x.id === d.id ? d : x) : [...p, d]);
    setDeptModal({ open: false, item: null });
    addToast(`Department "${d.name}" saved`);
  };
  const deleteDept = (id: string, name: string) => {
    setDeleteConfirm({ open: true, label: `department "${name}"`, onConfirm: () => { setDepartments(p => p.filter(x => x.id !== id)); addToast(`Department deleted`); setDeleteConfirm(null); } });
  };

  // ── SLA handlers ──
  const saveSLA = (s: EscalationSLA) => {
    setSLAs(p => p.some(x => x.id === s.id) ? p.map(x => x.id === s.id ? s : x) : [...p, s]);
    setSlaModal({ open: false, item: null });
    addToast(`SLA rule saved`);
  };
  const deleteSLA = (id: string) => {
    setDeleteConfirm({ open: true, label: 'this SLA rule', onConfirm: () => { setSLAs(p => p.filter(x => x.id !== id)); addToast('SLA rule deleted'); setDeleteConfirm(null); } });
  };

  // ── Template handlers ──
  const saveTpl = (t: ApprovalTemplate) => {
    setTemplates(p => p.some(x => x.id === t.id) ? p.map(x => x.id === t.id ? t : x) : [...p, t]);
    setTplModal({ open: false, item: null });
    addToast(`Template "${t.name}" saved`);
  };
  const deleteTpl = (id: string, name: string) => {
    setDeleteConfirm({ open: true, label: `template "${name}"`, onConfirm: () => { setTemplates(p => p.filter(x => x.id !== id)); addToast('Template deleted'); setDeleteConfirm(null); } });
  };

  // ── Channel handlers ──
  const saveCh = (c: NotificationChannel) => {
    setChannels(p => p.some(x => x.id === c.id) ? p.map(x => x.id === c.id ? c : x) : [...p, c]);
    setChModal({ open: false, item: null });
    addToast(`Channel "${c.name}" saved`);
  };
  const toggleChannel = (id: string) => {
    setChannels(p => p.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
    addToast('Channel updated');
  };
  const deleteCh = (id: string, name: string) => {
    setDeleteConfirm({ open: true, label: `channel "${name}"`, onConfirm: () => { setChannels(p => p.filter(x => x.id !== id)); addToast('Channel deleted'); setDeleteConfirm(null); } });
  };

  // ── Workload handlers ──
  const saveWl = (w: WorkloadRule) => {
    setWorkloadRules(p => p.some(x => x.id === w.id) ? p.map(x => x.id === w.id ? w : x) : [...p, w]);
    setWlModal({ open: false, item: null });
    addToast(`Workload rule for "${w.department}" saved`);
  };
  const deleteWl = (id: string, dept: string) => {
    setDeleteConfirm({ open: true, label: `workload rule for "${dept}"`, onConfirm: () => { setWorkloadRules(p => p.filter(x => x.id !== id)); addToast('Workload rule deleted'); setDeleteConfirm(null); } });
  };

  return (
    <AppLayout onQuickCreate={() => setQuickCreate(true)}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-foreground">Cooperative Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure organization-level defaults for departments, SLAs, approvals, notifications, and workload</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'departments') setDeptModal({ open: true, item: null });
            else if (activeTab === 'sla') setSlaModal({ open: true, item: null });
            else if (activeTab === 'approval') setTplModal({ open: true, item: null });
            else if (activeTab === 'channels') setChModal({ open: true, item: null });
            else if (activeTab === 'workload') setWlModal({ open: true, item: null });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Icon name="PlusIcon" size={16} />
          Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/60 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-thin">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-600 whitespace-nowrap transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab.icon as any} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Departments Tab ── */}
      {activeTab === 'departments' && (
        <div className="fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-700" style={{ backgroundColor: dept.color }}>
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="font-700 text-foreground text-sm">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground">{dept.memberCount} members</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setDeptModal({ open: true, item: dept })} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                      <Icon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteDept(dept.id, dept.name)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Icon name="TrashIcon" size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="UserIcon" size={12} />
                  <span>Head: <span className="text-foreground font-500">{dept.head}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Escalation SLA Tab ── */}
      {activeTab === 'sla' && (
        <div className="fade-in bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground uppercase tracking-wide">SLA Hours</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground uppercase tracking-wide">Escalate To</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {slas.map((sla, i) => (
                <tr key={sla.id} className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}>
                  <td className="px-4 py-3 font-500 text-foreground">{sla.department}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${PRIORITY_STYLES[sla.priority]}`}>{sla.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Icon name="ClockIcon" size={13} className="text-muted-foreground" />
                      <span className="font-600 text-foreground">{sla.slaHours}h</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{sla.escalateTo}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setSlaModal({ open: true, item: sla })} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Icon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteSLA(sla.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Icon name="TrashIcon" size={14} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Approval Templates Tab ── */}
      {activeTab === 'approval' && (
        <div className="fade-in grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-700 text-foreground text-sm">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{tpl.department}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setTplModal({ open: true, item: tpl })} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <Icon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteTpl(tpl.id, tpl.name)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Icon name="TrashIcon" size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
              {/* Chain steps */}
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                {tpl.steps.map((step, i) => (
                  <React.Fragment key={i}>
                    <span className="text-xs bg-primary/8 text-primary border border-primary/15 px-2 py-0.5 rounded-full font-500">{step}</span>
                    {i < tpl.steps.length - 1 && <Icon name="ChevronRightIcon" size={12} className="text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
              {/* Task types */}
              <div className="flex gap-1.5 flex-wrap">
                {tpl.taskTypes.map(tt => (
                  <span key={tt} className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-500">{tt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Notification Channels Tab ── */}
      {activeTab === 'channels' && (
        <div className="fade-in space-y-3">
          {channels.map(ch => (
            <div key={ch.id} className={`bg-card border rounded-xl p-4 transition-all group ${ch.enabled ? 'border-border' : 'border-border opacity-60'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${ch.enabled ? 'bg-primary/10' : 'bg-secondary'}`}>
                  <Icon name={ch.type === 'Email' ? 'EnvelopeIcon' : ch.type === 'SMS' ? 'DevicePhoneMobileIcon' : ch.type === 'Webhook' ? 'LinkIcon' : 'BellIcon'} size={16} className={ch.enabled ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-700 text-foreground text-sm">{ch.name}</span>
                    <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${CHANNEL_TYPE_STYLES[ch.type]}`}>{ch.type}</span>
                    {!ch.enabled && <span className="text-[11px] font-600 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Disabled</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{ch.target}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {ch.events.map(ev => (
                      <span key={ev} className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{ev}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleChannel(ch.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${ch.enabled ? 'bg-primary' : 'bg-border'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${ch.enabled ? 'left-4' : 'left-0.5'}`} />
                  </button>
                  <button onClick={() => setChModal({ open: true, item: ch })} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <Icon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteCh(ch.id, ch.name)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Icon name="TrashIcon" size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Workload Rules Tab ── */}
      {activeTab === 'workload' && (
        <div className="fade-in grid grid-cols-1 lg:grid-cols-2 gap-4">
          {workloadRules.map(rule => (
            <div key={rule.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-700 text-foreground text-sm">{rule.department}</h3>
                  <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full mt-1 inline-block ${STRATEGY_STYLES[rule.strategy]}`}>{rule.strategy}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setWlModal({ open: true, item: rule })} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <Icon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteWl(rule.id, rule.department)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Icon name="TrashIcon" size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-0.5">Max Tasks / Member</p>
                  <p className="text-lg font-800 text-foreground">{rule.maxTasksPerMember}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-0.5">Overflow To</p>
                  <p className="text-sm font-600 text-foreground truncate">{rule.overflowDepartment || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${rule.autoReassign ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-xs text-muted-foreground">Auto-reassign on overflow: <span className={`font-600 ${rule.autoReassign ? 'text-green-600' : 'text-slate-500'}`}>{rule.autoReassign ? 'Enabled' : 'Disabled'}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* Department Modal */}
      {deptModal.open && (
        <DepartmentModal
          item={deptModal.item}
          onSave={saveDept}
          onClose={() => setDeptModal({ open: false, item: null })}
        />
      )}

      {/* SLA Modal */}
      {slaModal.open && (
        <SLAModal
          item={slaModal.item}
          departments={departments.map(d => d.name)}
          onSave={saveSLA}
          onClose={() => setSlaModal({ open: false, item: null })}
        />
      )}

      {/* Approval Template Modal */}
      {tplModal.open && (
        <ApprovalTemplateModal
          item={tplModal.item}
          departments={departments.map(d => d.name)}
          onSave={saveTpl}
          onClose={() => setTplModal({ open: false, item: null })}
        />
      )}

      {/* Channel Modal */}
      {chModal.open && (
        <ChannelModal
          item={chModal.item}
          onSave={saveCh}
          onClose={() => setChModal({ open: false, item: null })}
        />
      )}

      {/* Workload Modal */}
      {wlModal.open && (
        <WorkloadModal
          item={wlModal.item}
          departments={departments.map(d => d.name)}
          onSave={saveWl}
          onClose={() => setWlModal({ open: false, item: null })}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/40">
          <div className="bg-card rounded-xl border border-border shadow-xl p-6 w-full max-w-sm mx-4 modal-content">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-red-500" />
            </div>
            <h3 className="font-700 text-foreground mb-1">Delete {deleteConfirm.label}?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-600 hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={deleteConfirm.onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-600 hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-600 slide-up ${t.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            <Icon name={t.type === 'success' ? 'CheckCircleIcon' : 'XCircleIcon'} size={16} />
            {t.msg}
          </div>
        ))}
      </div>

      {quickCreate && <QuickCreateModal onClose={() => setQuickCreate(false)} />}
    </AppLayout>
  );
}

// ─── Department Modal ─────────────────────────────────────────────────────────

function DepartmentModal({ item, onSave, onClose }: { item: Department | null; onSave: (d: Department) => void; onClose: () => void }) {
  const [form, setForm] = useState<Department>(item ?? { id: `d${Date.now()}`, name: '', code: '', head: '', memberCount: 0, color: '#1e40af' });
  const set = (k: keyof Department, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/40">
      <div className="bg-card rounded-xl border border-border shadow-xl p-6 w-full max-w-md mx-4 modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-700 text-foreground">{item ? 'Edit Department' : 'Add Department'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Icon name="XMarkIcon" size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1 block">Department Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input-base w-full" placeholder="e.g. Finance" />
            </div>
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1 block">Code *</label>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase().slice(0, 4))} className="input-base w-full" placeholder="FIN" />
            </div>
          </div>
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Department Head</label>
            <input value={form.head} onChange={e => set('head', e.target.value)} className="input-base w-full" placeholder="Full name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1 block">Member Count</label>
              <input type="number" min={0} value={form.memberCount} onChange={e => set('memberCount', Number(e.target.value))} className="input-base w-full" />
            </div>
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1 block">Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {DEPT_COLORS.map(c => (
                  <button key={c} onClick={() => set('color', c)} className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-600 hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={() => form.name && form.code && onSave(form)} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── SLA Modal ────────────────────────────────────────────────────────────────

function SLAModal({ item, departments, onSave, onClose }: { item: EscalationSLA | null; departments: string[]; onSave: (s: EscalationSLA) => void; onClose: () => void }) {
  const [form, setForm] = useState<EscalationSLA>(item ?? { id: `s${Date.now()}`, department: departments[0] ?? '', priority: 'High', slaHours: 24, escalateTo: '' });
  const set = (k: keyof EscalationSLA, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/40">
      <div className="bg-card rounded-xl border border-border shadow-xl p-6 w-full max-w-md mx-4 modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-700 text-foreground">{item ? 'Edit SLA Rule' : 'Add SLA Rule'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Icon name="XMarkIcon" size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Department</label>
            <select value={form.department} onChange={e => set('department', e.target.value)} className="input-base w-full">
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value as any)} className="input-base w-full">
                {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1 block">SLA Hours</label>
              <input type="number" min={1} value={form.slaHours} onChange={e => set('slaHours', Number(e.target.value))} className="input-base w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Escalate To</label>
            <select value={form.escalateTo} onChange={e => set('escalateTo', e.target.value)} className="input-base w-full">
              {['Team Lead', 'Department Head', 'Finance Manager', 'IT Manager', 'CEO', 'Board', 'CFO'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-600 hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={() => form.escalateTo && onSave(form)} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Approval Template Modal ──────────────────────────────────────────────────

function ApprovalTemplateModal({ item, departments, onSave, onClose }: { item: ApprovalTemplate | null; departments: string[]; onSave: (t: ApprovalTemplate) => void; onClose: () => void }) {
  const [form, setForm] = useState<ApprovalTemplate>(item ?? { id: `t${Date.now()}`, name: '', department: departments[0] ?? '', steps: [''], taskTypes: [''] });
  const set = (k: keyof ApprovalTemplate, v: any) => setForm(p => ({ ...p, [k]: v }));

  const updateStep = (i: number, v: string) => { const s = [...form.steps]; s[i] = v; set('steps', s); };
  const addStep = () => set('steps', [...form.steps, '']);
  const removeStep = (i: number) => set('steps', form.steps.filter((_, idx) => idx !== i));

  const updateType = (i: number, v: string) => { const t = [...form.taskTypes]; t[i] = v; set('taskTypes', t); };
  const addType = () => set('taskTypes', [...form.taskTypes, '']);
  const removeType = (i: number) => set('taskTypes', form.taskTypes.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/40">
      <div className="bg-card rounded-xl border border-border shadow-xl p-6 w-full max-w-lg mx-4 modal-content max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-700 text-foreground">{item ? 'Edit Template' : 'Add Approval Template'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Icon name="XMarkIcon" size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Template Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input-base w-full" placeholder="e.g. Loan Disbursement" />
          </div>
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Department</label>
            <select value={form.department} onChange={e => set('department', e.target.value)} className="input-base w-full">
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          {/* Approval Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-600 text-muted-foreground">Approval Chain Steps</label>
              <button onClick={addStep} className="text-xs text-primary font-600 hover:underline">+ Add Step</button>
            </div>
            <div className="space-y-2">
              {form.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-700 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <input value={step} onChange={e => updateStep(i, e.target.value)} className="input-base flex-1" placeholder={`Step ${i + 1} role`} />
                  {form.steps.length > 1 && (
                    <button onClick={() => removeStep(i)} className="p-1 rounded hover:bg-red-50 transition-colors">
                      <Icon name="XMarkIcon" size={14} className="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Task Types */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-600 text-muted-foreground">Applicable Task Types</label>
              <button onClick={addType} className="text-xs text-primary font-600 hover:underline">+ Add Type</button>
            </div>
            <div className="space-y-2">
              {form.taskTypes.map((tt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={tt} onChange={e => updateType(i, e.target.value)} className="input-base flex-1" placeholder="Task type name" />
                  {form.taskTypes.length > 1 && (
                    <button onClick={() => removeType(i)} className="p-1 rounded hover:bg-red-50 transition-colors">
                      <Icon name="XMarkIcon" size={14} className="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-600 hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={() => form.name && onSave(form)} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Channel Modal ────────────────────────────────────────────────────────────

function ChannelModal({ item, onSave, onClose }: { item: NotificationChannel | null; onSave: (c: NotificationChannel) => void; onClose: () => void }) {
  const [form, setForm] = useState<NotificationChannel>(item ?? { id: `c${Date.now()}`, name: '', type: 'Email', target: '', enabled: true, events: [''] });
  const set = (k: keyof NotificationChannel, v: any) => setForm(p => ({ ...p, [k]: v }));

  const updateEvent = (i: number, v: string) => { const e = [...form.events]; e[i] = v; set('events', e); };
  const addEvent = () => set('events', [...form.events, '']);
  const removeEvent = (i: number) => set('events', form.events.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/40">
      <div className="bg-card rounded-xl border border-border shadow-xl p-6 w-full max-w-md mx-4 modal-content max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-700 text-foreground">{item ? 'Edit Channel' : 'Add Channel'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Icon name="XMarkIcon" size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Channel Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input-base w-full" placeholder="e.g. Primary Email" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1 block">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value as any)} className="input-base w-full">
                {['Email', 'SMS', 'In-App', 'Webhook'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => set('enabled', !form.enabled)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.enabled ? 'bg-primary' : 'bg-border'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.enabled ? 'left-4' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-600 text-foreground">{form.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Target (email / phone / URL)</label>
            <input value={form.target} onChange={e => set('target', e.target.value)} className="input-base w-full" placeholder="target@example.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-600 text-muted-foreground">Trigger Events</label>
              <button onClick={addEvent} className="text-xs text-primary font-600 hover:underline">+ Add Event</button>
            </div>
            <div className="space-y-2">
              {form.events.map((ev, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={ev} onChange={e => updateEvent(i, e.target.value)} className="input-base flex-1" placeholder="Event name" />
                  {form.events.length > 1 && (
                    <button onClick={() => removeEvent(i)} className="p-1 rounded hover:bg-red-50 transition-colors">
                      <Icon name="XMarkIcon" size={14} className="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-600 hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={() => form.name && form.target && onSave(form)} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Workload Modal ───────────────────────────────────────────────────────────

function WorkloadModal({ item, departments, onSave, onClose }: { item: WorkloadRule | null; departments: string[]; onSave: (w: WorkloadRule) => void; onClose: () => void }) {
  const [form, setForm] = useState<WorkloadRule>(item ?? { id: `w${Date.now()}`, department: departments[0] ?? '', strategy: 'Round Robin', maxTasksPerMember: 15, overflowDepartment: '', autoReassign: false });
  const set = (k: keyof WorkloadRule, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/40">
      <div className="bg-card rounded-xl border border-border shadow-xl p-6 w-full max-w-md mx-4 modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-700 text-foreground">{item ? 'Edit Workload Rule' : 'Add Workload Rule'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Icon name="XMarkIcon" size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Department</label>
            <select value={form.department} onChange={e => set('department', e.target.value)} className="input-base w-full">
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Assignment Strategy</label>
            <select value={form.strategy} onChange={e => set('strategy', e.target.value as any)} className="input-base w-full">
              {['Round Robin', 'Least Loaded', 'Skill Match', 'Manual'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Max Tasks per Member</label>
            <input type="number" min={1} value={form.maxTasksPerMember} onChange={e => set('maxTasksPerMember', Number(e.target.value))} className="input-base w-full" />
          </div>
          <div>
            <label className="text-xs font-600 text-muted-foreground mb-1 block">Overflow Department</label>
            <select value={form.overflowDepartment} onChange={e => set('overflowDepartment', e.target.value)} className="input-base w-full">
              <option value="">— None —</option>
              {departments.filter(d => d !== form.department).map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('autoReassign', !form.autoReassign)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.autoReassign ? 'bg-primary' : 'bg-border'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.autoReassign ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-sm font-600 text-foreground">Auto-reassign on overflow</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-600 hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}
