'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';
import Icon from '@/components/ui/AppIcon';

type RuleType = 'escalation' | 'auto-assign' | 'notification';
type RuleStatus = 'active' | 'inactive';

interface AutomationRule {
  id: string;
  name: string;
  type: RuleType;
  status: RuleStatus;
  trigger: string;
  condition: string;
  action: string;
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
}

interface RuleFormData {
  name: string;
  type: RuleType;
  triggerEvent: string;
  conditionField: string;
  conditionOperator: string;
  conditionValue: string;
  actionType: string;
  actionTarget: string;
  actionMessage: string;
  escalateTo: string;
  notifyChannel: string;
  assignDepartment: string;
}

const INITIAL_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Escalate Overdue High-Priority Tasks',
    type: 'escalation',
    status: 'active',
    trigger: 'Task overdue by 24h',
    condition: 'Priority = High',
    action: 'Escalate to Department Head',
    lastTriggered: '2 hours ago',
    triggerCount: 14,
    createdAt: '2026-09-10',
  },
  {
    id: 'rule-2',
    name: 'Auto-Assign by Dept Workload',
    type: 'auto-assign',
    status: 'active',
    trigger: 'New task created',
    condition: 'Department workload < 80%',
    action: 'Assign to least-loaded member',
    lastTriggered: '30 min ago',
    triggerCount: 87,
    createdAt: '2026-09-08',
  },
  {
    id: 'rule-3',
    name: 'Notify on Task Status Change',
    type: 'notification',
    status: 'active',
    trigger: 'Task status changed',
    condition: 'Status = Completed',
    action: 'Notify task creator via inbox',
    lastTriggered: '1 hour ago',
    triggerCount: 203,
    createdAt: '2026-09-05',
  },
  {
    id: 'rule-4',
    name: 'Escalate Stalled Tasks (3 days)',
    type: 'escalation',
    status: 'inactive',
    trigger: 'No activity for 3 days',
    condition: 'Task status = In Progress',
    action: 'Escalate to CEO',
    lastTriggered: '3 days ago',
    triggerCount: 5,
    createdAt: '2026-09-01',
  },
  {
    id: 'rule-5',
    name: 'Notify Overdue Loan Tasks',
    type: 'notification',
    status: 'active',
    trigger: 'Task overdue by 48h',
    condition: 'Category = Loan Processing',
    action: 'Send alert to Finance team',
    lastTriggered: '5 hours ago',
    triggerCount: 31,
    createdAt: '2026-09-03',
  },
];

const TYPE_CONFIG: Record<RuleType, { label: string; color: string; bg: string; icon: string }> = {
  escalation: { label: 'Escalation', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: 'ArrowTrendingUpIcon' },
  'auto-assign': { label: 'Auto-Assign', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: 'UserPlusIcon' },
  notification: { label: 'Notification', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: 'BellAlertIcon' },
};

const TRIGGER_EVENTS = [
  'Task created',
  'Task status changed',
  'Task overdue by 24h',
  'Task overdue by 48h',
  'Task overdue by 72h',
  'No activity for 3 days',
  'Task assigned',
  'Task priority changed',
  'Task comment added',
  'Approval requested',
  'Approval rejected',
];

const CONDITION_FIELDS = ['Priority', 'Status', 'Category', 'Department', 'Assignee', 'Workload %', 'Due Date'];
const CONDITION_OPERATORS = ['equals', 'not equals', 'greater than', 'less than', 'contains'];

const ESCALATE_TO_OPTIONS = ['Department Head', 'CEO', 'Finance Manager', 'HR Manager', 'IT Manager', 'Audit Lead'];
const DEPARTMENTS = ['Finance', 'HR', 'IT', 'Audit', 'Procurement', 'Operations', 'Compliance'];
const NOTIFY_CHANNELS = ['Inbox', 'Email', 'Inbox + Email', 'SMS', 'All Channels'];

const EMPTY_FORM: RuleFormData = {
  name: '',
  type: 'escalation',
  triggerEvent: '',
  conditionField: '',
  conditionOperator: 'equals',
  conditionValue: '',
  actionType: '',
  actionTarget: '',
  actionMessage: '',
  escalateTo: '',
  notifyChannel: '',
  assignDepartment: '',
};

export default function AutomationPage() {
  const [q, setQ] = useState(false);
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
  const [filterType, setFilterType] = useState<'all' | RuleType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | RuleStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState<AutomationRule | null>(null);
  const [form, setForm] = useState<RuleFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setEditRule(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (rule: AutomationRule) => {
    setEditRule(rule);
    setForm({
      name: rule.name,
      type: rule.type,
      triggerEvent: rule.trigger,
      conditionField: rule.condition.split(' = ')[0] || rule.condition.split(' < ')[0] || '',
      conditionOperator: rule.condition.includes(' = ') ? 'equals' : rule.condition.includes(' < ') ? 'less than' : 'equals',
      conditionValue: rule.condition.split(' = ')[1] || rule.condition.split(' < ')[1] || '',
      actionType: rule.type === 'escalation' ? 'escalate' : rule.type === 'auto-assign' ? 'assign' : 'notify',
      actionTarget: rule.action,
      actionMessage: '',
      escalateTo: rule.type === 'escalation' ? rule.action.replace('Escalate to ', '') : '',
      notifyChannel: rule.type === 'notification' ? 'Inbox' : '',
      assignDepartment: rule.type === 'auto-assign' ? '' : '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.triggerEvent) {
      showToast('Please fill in required fields.', 'error');
      return;
    }
    const conditionStr = form.conditionField
      ? `${form.conditionField} ${form.conditionOperator === 'equals' ? '=' : form.conditionOperator === 'less than' ? '<' : form.conditionOperator === 'greater than' ? '>' : '≠'} ${form.conditionValue}`
      : 'Any';
    let actionStr = form.actionTarget;
    if (form.type === 'escalation' && form.escalateTo) actionStr = `Escalate to ${form.escalateTo}`;
    if (form.type === 'notification' && form.notifyChannel) actionStr = `Notify via ${form.notifyChannel}`;
    if (form.type === 'auto-assign' && form.assignDepartment) actionStr = `Assign to least-loaded in ${form.assignDepartment}`;

    if (editRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editRule.id
            ? { ...r, name: form.name, type: form.type, trigger: form.triggerEvent, condition: conditionStr, action: actionStr }
            : r
        )
      );
      showToast('Rule updated successfully.');
    } else {
      const newRule: AutomationRule = {
        id: `rule-${Date.now()}`,
        name: form.name,
        type: form.type,
        status: 'active',
        trigger: form.triggerEvent,
        condition: conditionStr,
        action: actionStr,
        triggerCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRules((prev) => [newRule, ...prev]);
      showToast('Automation rule created.');
    }
    setShowModal(false);
  };

  const toggleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r))
    );
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
    showToast('Rule deleted.');
  };

  const filtered = rules.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: rules.length,
    active: rules.filter((r) => r.status === 'active').length,
    escalation: rules.filter((r) => r.type === 'escalation').length,
    autoAssign: rules.filter((r) => r.type === 'auto-assign').length,
    notification: rules.filter((r) => r.type === 'notification').length,
    totalTriggers: rules.reduce((s, r) => s + r.triggerCount, 0),
  };

  return (
    <AppLayout onQuickCreate={() => setQ(true)}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-500 transition-all ${
            toast.type === 'success' ?'bg-emerald-50 border-emerald-200 text-emerald-800' :'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <Icon name={toast.type === 'success' ? 'CheckCircleIcon' : 'XCircleIcon'} size={16} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-foreground">Automation Rules</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure WHEN → IF → THEN rules for escalation, assignment, and notifications
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-600 rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Icon name="PlusIcon" size={16} />
          New Rule
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Rules', value: stats.total, icon: 'BoltIcon', color: 'text-foreground' },
          { label: 'Active', value: stats.active, icon: 'CheckCircleIcon', color: 'text-emerald-600' },
          { label: 'Escalation', value: stats.escalation, icon: 'ArrowTrendingUpIcon', color: 'text-red-600' },
          { label: 'Auto-Assign', value: stats.autoAssign, icon: 'UserPlusIcon', color: 'text-blue-600' },
          { label: 'Notification', value: stats.notification, icon: 'BellAlertIcon', color: 'text-amber-600' },
          { label: 'Total Triggers', value: stats.totalTriggers, icon: 'BoltIcon', color: 'text-primary' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-2.5">
            <Icon name={s.icon as any} size={18} className={s.color} />
            <div>
              <p className={`text-lg font-700 ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {(['all', 'escalation', 'auto-assign', 'notification'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-600 transition-colors capitalize ${
                filterType === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'all' ? 'All Types' : t === 'auto-assign' ? 'Auto-Assign' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-600 transition-colors capitalize ${
                filterStatus === s ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} rule{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-16 text-center">
            <Icon name="BoltIcon" size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-600 text-foreground mb-1">No rules found</p>
            <p className="text-xs text-muted-foreground">Adjust filters or create a new automation rule.</p>
          </div>
        )}
        {filtered.map((rule) => {
          const tc = TYPE_CONFIG[rule.type];
          return (
            <div
              key={rule.id}
              className={`bg-card border rounded-xl p-4 transition-all ${
                rule.status === 'inactive' ? 'opacity-60 border-border' : 'border-border hover:border-primary/30 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Type badge */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${tc.bg}`}>
                  <Icon name={tc.icon as any} size={18} className={tc.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-700 text-foreground">{rule.name}</span>
                    <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full border ${tc.bg} ${tc.color}`}>
                      {tc.label}
                    </span>
                    <span
                      className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${
                        rule.status === 'active' ?'bg-emerald-50 text-emerald-700 border border-emerald-200' :'bg-secondary text-muted-foreground border border-border'
                      }`}
                    >
                      {rule.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                  </div>

                  {/* WHEN → IF → THEN */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-700 uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded">WHEN</span>
                    <span className="text-xs text-foreground font-500">{rule.trigger}</span>
                    <Icon name="ArrowRightIcon" size={12} className="text-muted-foreground" />
                    <span className="text-[10px] font-700 uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded">IF</span>
                    <span className="text-xs text-foreground font-500">{rule.condition}</span>
                    <Icon name="ArrowRightIcon" size={12} className="text-muted-foreground" />
                    <span className="text-[10px] font-700 uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded">THEN</span>
                    <span className="text-xs text-foreground font-500">{rule.action}</span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-2.5">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Icon name="BoltIcon" size={11} />
                      {rule.triggerCount} triggers
                    </span>
                    {rule.lastTriggered && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Icon name="ClockIcon" size={11} />
                        Last: {rule.lastTriggered}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Icon name="CalendarDaysIcon" size={11} />
                      Created {rule.createdAt}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(rule.id)}
                    title={rule.status === 'active' ? 'Deactivate' : 'Activate'}
                    className={`p-1.5 rounded-lg border transition-colors text-xs font-600 ${
                      rule.status === 'active' ?'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :'border-border bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Icon name={rule.status === 'active' ? 'PauseIcon' : 'PlayIcon'} size={14} />
                  </button>
                  <button
                    onClick={() => openEdit(rule)}
                    className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Icon name="PencilSquareIcon" size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(rule.id)}
                    className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <Icon name="TrashIcon" size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <Icon name="TrashIcon" size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-700 text-foreground">Delete Rule?</p>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-600 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm font-600 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h2 className="text-base font-700 text-foreground">
                  {editRule ? 'Edit Automation Rule' : 'New Automation Rule'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Define WHEN → IF → THEN logic</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Rule Name */}
              <div>
                <label className="block text-xs font-600 text-foreground mb-1.5">Rule Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Escalate overdue high-priority tasks"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Rule Type */}
              <div>
                <label className="block text-xs font-600 text-foreground mb-1.5">Rule Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['escalation', 'auto-assign', 'notification'] as RuleType[]).map((t) => {
                    const tc = TYPE_CONFIG[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                          form.type === t ? `${tc.bg} border-current ${tc.color}` : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <Icon name={tc.icon as any} size={20} />
                        <span className="text-[11px] font-600 leading-tight">{tc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WHEN — Trigger */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-700 uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">WHEN</span>
                  <span className="text-xs text-muted-foreground">Trigger event</span>
                </div>
                <div>
                  <label className="block text-xs font-600 text-foreground mb-1.5">Trigger Event *</label>
                  <select
                    value={form.triggerEvent}
                    onChange={(e) => setForm((f) => ({ ...f, triggerEvent: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">Select trigger event…</option>
                    {TRIGGER_EVENTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* IF — Condition */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-700 uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">IF</span>
                  <span className="text-xs text-muted-foreground">Condition (optional)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-600 text-foreground mb-1.5">Field</label>
                    <select
                      value={form.conditionField}
                      onChange={(e) => setForm((f) => ({ ...f, conditionField: e.target.value }))}
                      className="w-full px-2 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Any</option>
                      {CONDITION_FIELDS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-foreground mb-1.5">Operator</label>
                    <select
                      value={form.conditionOperator}
                      onChange={(e) => setForm((f) => ({ ...f, conditionOperator: e.target.value }))}
                      className="w-full px-2 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {CONDITION_OPERATORS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-foreground mb-1.5">Value</label>
                    <input
                      type="text"
                      value={form.conditionValue}
                      onChange={(e) => setForm((f) => ({ ...f, conditionValue: e.target.value }))}
                      placeholder="e.g. High"
                      className="w-full px-2 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              {/* THEN — Action */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-700 uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">THEN</span>
                  <span className="text-xs text-muted-foreground">Action to perform</span>
                </div>

                {form.type === 'escalation' && (
                  <div>
                    <label className="block text-xs font-600 text-foreground mb-1.5">Escalate To</label>
                    <select
                      value={form.escalateTo}
                      onChange={(e) => setForm((f) => ({ ...f, escalateTo: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Select escalation target…</option>
                      {ESCALATE_TO_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}

                {form.type === 'auto-assign' && (
                  <div>
                    <label className="block text-xs font-600 text-foreground mb-1.5">Assign by Workload in Department</label>
                    <select
                      value={form.assignDepartment}
                      onChange={(e) => setForm((f) => ({ ...f, assignDepartment: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Any department (least-loaded member)</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Task will be assigned to the team member with the lowest current workload.
                    </p>
                  </div>
                )}

                {form.type === 'notification' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-600 text-foreground mb-1.5">Notify Channel</label>
                      <select
                        value={form.notifyChannel}
                        onChange={(e) => setForm((f) => ({ ...f, notifyChannel: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">Select channel…</option>
                        {NOTIFY_CHANNELS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-600 text-foreground mb-1.5">Custom Message (optional)</label>
                      <textarea
                        value={form.actionMessage}
                        onChange={(e) => setForm((f) => ({ ...f, actionMessage: e.target.value }))}
                        placeholder="Leave blank to use default notification template…"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-600 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Icon name="CheckIcon" size={15} />
                {editRule ? 'Save Changes' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {q && <QuickCreateModal onClose={() => setQ(false)} />}
    </AppLayout>
  );
}
