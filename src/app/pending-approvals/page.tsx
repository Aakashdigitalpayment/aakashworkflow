'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalStatus = 'pending' | 'accepted' | 'rejected' | 'changes_requested';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

interface ApprovalTask {
  id: string;
  taskId: string;
  title: string;
  category: string;
  department: string;
  submittedBy: string;
  submittedByInitials: string;
  submittedAt: string;
  dueDate: string;
  priority: Priority;
  approvalStep: string;
  stepOrder: number;
  totalSteps: number;
  description: string;
  status: ApprovalStatus;
  changesNote?: string;
  removing?: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  icon: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const pendingApprovals: ApprovalTask[] = [
  {
    id: 'apr-001',
    taskId: 'CREDIT-2083-00315',
    title: 'Field Verification — Lalitpur Branch Loan Applications',
    category: 'Loan Processing',
    department: 'Credit/Loan',
    submittedBy: 'Dipak Magar',
    submittedByInitials: 'DM',
    submittedAt: '2083-06-15',
    dueDate: '2083-06-20',
    priority: 'High',
    approvalStep: 'Department Head Review',
    stepOrder: 2,
    totalSteps: 3,
    description: 'Field verification completed for 8 loan applications from Lalitpur branch. Collateral, income sources, and residence verified. Requesting approval to proceed to credit committee.',
    status: 'pending',
  },
  {
    id: 'apr-002',
    taskId: 'HR-2083-00061',
    title: 'New Employee Onboarding — Priya Shrestha (Finance)',
    category: 'HR / Onboarding',
    department: 'HR',
    submittedBy: 'Anita Shrestha',
    submittedByInitials: 'AS',
    submittedAt: '2083-06-14',
    dueDate: '2083-06-16',
    priority: 'Medium',
    approvalStep: 'Manager Approval',
    stepOrder: 2,
    totalSteps: 2,
    description: 'Onboarding documentation for Priya Shrestha is complete. System access provisioned, orientation done, policy acknowledgement signed. Requesting final approval.',
    status: 'pending',
  },
  {
    id: 'apr-003',
    taskId: 'PROC-2083-00044',
    title: 'Office Stationery Procurement — Q2 2083/84',
    category: 'Procurement',
    department: 'Administration',
    submittedBy: 'Kamala Thapa',
    submittedByInitials: 'KT',
    submittedAt: '2083-06-13',
    dueDate: '2083-06-18',
    priority: 'Low',
    approvalStep: 'Department Head Review',
    stepOrder: 1,
    totalSteps: 3,
    description: 'Quarterly stationery procurement request for NPR 45,000. Vendor quotes attached from 3 suppliers. Recommending Shrestha Stationery (lowest bid at NPR 42,500).',
    status: 'pending',
  },
  {
    id: 'apr-004',
    taskId: 'FIN-2083-00398',
    title: 'Q2 Financial Reconciliation Report — FY 2083/84',
    category: 'Financial Reporting',
    department: 'Finance',
    submittedBy: 'Sita Rana',
    submittedByInitials: 'SR',
    submittedAt: '2083-06-12',
    dueDate: '2083-06-17',
    priority: 'Critical',
    approvalStep: 'CEO / GM Final Approval',
    stepOrder: 3,
    totalSteps: 3,
    description: 'Q2 financial reconciliation completed after CBS data export resolved. All accounts balanced. Variance of NPR 1,240 identified and documented. Report ready for final sign-off.',
    status: 'pending',
  },
  {
    id: 'apr-005',
    taskId: 'IT-2083-00089',
    title: 'Server Infrastructure Upgrade — Phase 1',
    category: 'IT / Infrastructure',
    department: 'IT',
    submittedBy: 'Suresh Pradhan',
    submittedByInitials: 'SP',
    submittedAt: '2083-06-11',
    dueDate: '2083-06-19',
    priority: 'High',
    approvalStep: 'Manager Approval',
    stepOrder: 2,
    totalSteps: 3,
    description: 'Phase 1 upgrade plan for server infrastructure: RAM expansion (64GB → 128GB) and SSD replacement. Estimated cost NPR 1,85,000. Downtime window: Sunday 2 AM–6 AM.',
    status: 'pending',
  },
  {
    id: 'apr-006',
    taskId: 'AUDIT-2083-00019',
    title: 'Internal Audit Report — Savings Department H1 2083',
    category: 'Audit',
    department: 'Audit',
    submittedBy: 'Ramesh Adhikari',
    submittedByInitials: 'RA',
    submittedAt: '2083-06-10',
    dueDate: '2083-06-15',
    priority: 'Critical',
    approvalStep: 'Department Head Review',
    stepOrder: 1,
    totalSteps: 2,
    description: 'H1 internal audit of Savings Department completed. 3 minor findings identified with corrective action plans. Full report with evidence attached for review and sign-off.',
    status: 'pending',
  },
  {
    id: 'apr-007',
    taskId: 'MEM-2083-00041',
    title: 'Member KYC Update Drive — Expired Documents Batch 3',
    category: 'Membership / KYC',
    department: 'Membership',
    submittedBy: 'Puja Tamang',
    submittedByInitials: 'PT',
    submittedAt: '2083-06-09',
    dueDate: '2083-06-21',
    priority: 'Medium',
    approvalStep: 'Officer Review',
    stepOrder: 1,
    totalSteps: 2,
    description: 'KYC renewal completed for 38 members in Batch 3. Updated citizenship copies, photos, and signatures collected. Database entries updated. Requesting officer sign-off.',
    status: 'pending',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<Priority, string> = {
  Critical: 'bg-red-100 text-red-700 border border-red-200',
  High: 'bg-orange-100 text-orange-700 border border-orange-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  Low: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const PRIORITY_DOT: Record<Priority, string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-amber-500',
  Low: 'bg-slate-400',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Loan Processing': 'bg-blue-50 text-blue-700',
  'HR / Onboarding': 'bg-violet-50 text-violet-700',
  'Procurement': 'bg-teal-50 text-teal-700',
  'Financial Reporting': 'bg-emerald-50 text-emerald-700',
  'IT / Infrastructure': 'bg-cyan-50 text-cyan-700',
  'Audit': 'bg-rose-50 text-rose-700',
  'Membership / KYC': 'bg-indigo-50 text-indigo-700',
};

const ALL_CATEGORIES = ['All Categories', ...Object.keys(CATEGORY_COLORS)];

// ─── Toast Component ──────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 3.5s
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3500);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.id, onDismiss]);

  const styles: Record<Toast['type'], { bg: string; border: string; icon: string; bar: string }> = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', bar: 'bg-emerald-500' },
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', bar: 'bg-red-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', bar: 'bg-amber-500' },
  };

  const s = styles[toast.type];

  return (
    <div
      className={`relative overflow-hidden flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg w-80 transition-all duration-300 ${s.bg} ${s.border} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <AppIcon name={toast.icon as any} size={18} className={`flex-shrink-0 mt-0.5 ${s.icon}`} />
      <p className="text-sm font-500 text-foreground flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300); }}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <AppIcon name="XMarkIcon" size={14} />
      </button>
      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-0.5 ${s.bar} animate-[shrink_3.5s_linear_forwards]`} style={{ width: '100%' }} />
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ─── Request Changes Modal ────────────────────────────────────────────────────

interface ChangesModalProps {
  task: ApprovalTask;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

function RequestChangesModal({ task, onConfirm, onClose }: ChangesModalProps) {
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AppIcon name="ArrowPathIcon" size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-600 text-foreground">Request Changes</h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{task.title}</p>
          </div>
        </div>
        <label className="block text-sm font-500 text-foreground mb-1.5">
          Describe the changes needed <span className="text-red-500">*</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Explain what needs to be revised or corrected before this can be approved..."
          className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-500 text-secondary-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!note.trim()}
            onClick={() => onConfirm(note.trim())}
            className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-600 transition-colors"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Approval Card ────────────────────────────────────────────────────────────

interface ApprovalCardProps {
  task: ApprovalTask;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
}

function ApprovalCard({ task, onAccept, onReject, onRequestChanges }: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig: Record<ApprovalStatus, { label: string; cls: string; icon: string }> = {
    pending: { label: 'Awaiting Your Action', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'ClockIcon' },
    accepted: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'CheckCircleIcon' },
    rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200', icon: 'XCircleIcon' },
    changes_requested: { label: 'Changes Requested', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'ArrowPathIcon' },
  };

  const sc = statusConfig[task.status];
  const catColor = CATEGORY_COLORS[task.category] || 'bg-slate-50 text-slate-600';

  return (
    <div className={`bg-card border rounded-xl transition-all duration-500 ${
      task.removing ? 'opacity-0 scale-95 -translate-y-1' :
      task.status === 'pending' ? 'border-border hover:border-primary/30 hover:shadow-md opacity-100' : 'border-border opacity-100'
    }`}>
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Submitter Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-700 text-primary">{task.submittedByInitials}</span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Top row: task ID + priority + status */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-600 text-muted-foreground font-mono">{task.taskId}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-600 px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                {task.priority}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-500 px-2 py-0.5 rounded-full border ${sc.cls}`}>
                <AppIcon name={sc.icon as any} size={11} />
                {sc.label}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-600 text-foreground leading-snug mb-2">{task.title}</h3>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className={`px-2 py-0.5 rounded-md text-xs font-500 ${catColor}`}>{task.category}</span>
              <span className="flex items-center gap-1">
                <AppIcon name="BuildingOffice2Icon" size={12} />
                {task.department}
              </span>
              <span className="flex items-center gap-1">
                <AppIcon name="UserIcon" size={12} />
                {task.submittedBy}
              </span>
              <span className="flex items-center gap-1">
                <AppIcon name="CalendarDaysIcon" size={12} />
                Due {task.dueDate}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Step Progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-1">
            {Array.from({ length: task.totalSteps }).map((_, i) => (
              <React.Fragment key={i}>
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < task.stepOrder ? 'bg-primary' : 'bg-border'
                }`} />
              </React.Fragment>
            ))}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <AppIcon name="CheckBadgeIcon" size={13} className="text-primary" />
            Step {task.stepOrder}/{task.totalSteps}: <span className="font-500 text-foreground ml-0.5">{task.approvalStep}</span>
          </span>
        </div>

        {/* Expandable Description */}
        {expanded && (
          <div className="mt-3 p-3 bg-secondary/50 rounded-lg text-sm text-secondary-foreground leading-relaxed border border-border">
            {task.description}
          </div>
        )}
        {task.changesNote && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 leading-relaxed flex gap-2">
            <AppIcon name="ArrowPathIcon" size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <span><span className="font-600">Changes requested:</span> {task.changesNote}</span>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <AppIcon name={expanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={12} />
          {expanded ? 'Hide details' : 'View details'}
        </button>
      </div>

      {/* Action Buttons */}
      {task.status === 'pending' && (
        <div className="px-5 pb-5 flex items-center gap-2.5">
          <button
            onClick={() => onAccept(task.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-600 transition-colors shadow-sm"
          >
            <AppIcon name="CheckIcon" size={15} />
            Accept
          </button>
          <button
            onClick={() => onReject(task.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-600 transition-colors shadow-sm"
          >
            <AppIcon name="XMarkIcon" size={15} />
            Reject
          </button>
          <button
            onClick={() => onRequestChanges(task.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-600 transition-colors"
          >
            <AppIcon name="ArrowPathIcon" size={15} />
            Request Changes
          </button>
        </div>
      )}

      {/* Completed state footer */}
      {task.status !== 'pending' && (
        <div className="px-5 pb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs font-500 px-3 py-1.5 rounded-lg border ${sc.cls}`}>
            <AppIcon name={sc.icon as any} size={13} />
            {sc.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PendingApprovalsPage() {
  const [tasks, setTasks] = useState<ApprovalTask[]>(pendingApprovals);
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'actioned'>('pending');
  const [changesTarget, setChangesTarget] = useState<ApprovalTask | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'], icon: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, icon }]);
  }, []);

  const removeTaskAfterDelay = useCallback((id: string) => {
    // Mark as removing (triggers fade-out animation)
    setTimeout(() => {
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, removing: true } : t));
    }, 1200);
    // Remove from list after animation completes
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }, 1700);
  }, []);

  const handleAccept = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'accepted' } : t));
    addToast(
      `Approved: "${task?.title?.slice(0, 45)}${(task?.title?.length ?? 0) > 45 ? '…' : ''}"`,
      'success',
      'CheckCircleIcon'
    );
    removeTaskAfterDelay(id);
  }, [tasks, addToast, removeTaskAfterDelay]);

  const handleReject = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'rejected' } : t));
    addToast(
      `Rejected: "${task?.title?.slice(0, 45)}${(task?.title?.length ?? 0) > 45 ? '…' : ''}"`,
      'error',
      'XCircleIcon'
    );
    removeTaskAfterDelay(id);
  }, [tasks, addToast, removeTaskAfterDelay]);

  const handleRequestChanges = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) setChangesTarget(task);
  }, [tasks]);

  const handleChangesConfirm = useCallback((note: string) => {
    if (!changesTarget) return;
    const id = changesTarget.id;
    const title = changesTarget.title;
    setTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: 'changes_requested', changesNote: note } : t)
    );
    setChangesTarget(null);
    addToast(
      `Changes requested for: "${title?.slice(0, 40)}${(title?.length ?? 0) > 40 ? '…' : ''}"`,
      'warning',
      'ArrowPathIcon'
    );
    removeTaskAfterDelay(id);
  }, [changesTarget, addToast, removeTaskAfterDelay]);

  const filtered = tasks.filter((t) => {
    if (filterCategory !== 'All Categories' && t.category !== filterCategory) return false;
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterStatus === 'pending' && t.status !== 'pending') return false;
    if (filterStatus === 'actioned' && t.status === 'pending') return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const actionedCount = tasks.filter((t) => t.status !== 'pending').length;

  const criticalPending = tasks.filter((t) => t.status === 'pending' && t.priority === 'Critical').length;

  return (
    <AppLayout>
      <div className="flex flex-col h-full min-h-0">
        {/* Page Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <AppIcon name="ClipboardDocumentCheckIcon" size={18} className="text-primary" />
                </div>
                <h1 className="text-xl font-700 text-foreground">Pending Approvals</h1>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-700">
                    {pendingCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Approval tasks assigned to your role across all task categories
              </p>
            </div>

            {criticalPending > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
                <AppIcon name="ExclamationTriangleIcon" size={15} className="text-red-600" />
                <span className="text-sm font-600 text-red-700">{criticalPending} Critical</span>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 mt-4">
            {[
              { label: 'Awaiting Action', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'ClockIcon' },
              { label: 'Accepted', value: tasks.filter((t) => t.status === 'accepted').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'CheckCircleIcon' },
              { label: 'Rejected', value: tasks.filter((t) => t.status === 'rejected').length, color: 'text-red-600', bg: 'bg-red-50', icon: 'XCircleIcon' },
              { label: 'Changes Requested', value: tasks.filter((t) => t.status === 'changes_requested').length, color: 'text-amber-700', bg: 'bg-amber-50', icon: 'ArrowPathIcon' },
            ].map((stat) => (
              <div key={stat.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${stat.bg} border border-transparent`}>
                <AppIcon name={stat.icon as any} size={14} className={stat.color} />
                <span className={`text-lg font-700 ${stat.color}`}>{stat.value}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-border bg-background flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5 gap-0.5">
            {(['all', 'pending', 'actioned'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-600 transition-colors capitalize ${
                  filterStatus === s
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'all' ? 'All' : s === 'pending' ? 'Awaiting Action' : 'Actioned'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
              <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>
            ))}
          </select>

          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <AppIcon name="ClipboardDocumentCheckIcon" size={26} className="text-muted-foreground" />
              </div>
              <p className="text-base font-600 text-foreground mb-1">No approvals found</p>
              <p className="text-sm text-muted-foreground">
                {filterStatus === 'pending' ? "You're all caught up — no pending approvals right now." :'No items match the selected filters.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 max-w-4xl">
              {filtered.map((task) => (
                <ApprovalCard
                  key={task.id}
                  task={task}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onRequestChanges={handleRequestChanges}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Changes Modal */}
      {changesTarget && (
        <RequestChangesModal
          task={changesTarget}
          onConfirm={handleChangesConfirm}
          onClose={() => setChangesTarget(null)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppLayout>
  );
}
