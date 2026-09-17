'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChainStatus = 'active' | 'draft' | 'inactive';
type StepAction = 'approve' | 'reject' | 'request_changes' | 'forward' | 'auto_approve';
type PathType = 'on_approve' | 'on_reject' | 'on_change_request';

interface ApprovalStep {
  id: string;
  chain_id: string;
  step_order: number;
  step_name: string;
  role_label: string;
  approver_role: string | null;
  department_code: string | null;
  allowed_actions: StepAction[];
  sla_hours: number;
  is_optional: boolean;
  notes: string | null;
}

interface StepPath {
  id: string;
  from_step_id: string;
  path_type: PathType;
  to_step_id: string | null;
}

interface ApprovalChain {
  id: string;
  name: string;
  description: string | null;
  task_category: string;
  status: ChainStatus;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  steps?: ApprovalStep[];
  paths?: StepPath[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TASK_CATEGORIES = [
  'Credit / Loan', 'Procurement', 'HR / Onboarding', 'Finance',
  'Administration', 'Audit', 'IT / Infrastructure', 'Legal',
  'Marketing', 'Operations', 'General',
];

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee' },
  { value: 'officer', label: 'Officer' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'manager', label: 'Manager' },
  { value: 'ceo', label: 'CEO / GM' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'super_admin', label: 'Super Admin' },
];

const ACTION_OPTIONS: { value: StepAction; label: string; color: string }[] = [
  { value: 'approve', label: 'Approve', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'reject', label: 'Reject', color: 'bg-red-100 text-red-700' },
  { value: 'request_changes', label: 'Request Changes', color: 'bg-amber-100 text-amber-700' },
  { value: 'forward', label: 'Forward', color: 'bg-blue-100 text-blue-700' },
  { value: 'auto_approve', label: 'Auto-Approve', color: 'bg-violet-100 text-violet-700' },
];

const PATH_LABELS: Record<PathType, { label: string; icon: string; color: string }> = {
  on_approve: { label: 'On Approve', icon: 'CheckCircleIcon', color: 'text-emerald-600' },
  on_reject: { label: 'On Reject', icon: 'XCircleIcon', color: 'text-red-600' },
  on_change_request: { label: 'On Change Request', icon: 'ArrowPathIcon', color: 'text-amber-600' },
};

const STATUS_STYLES: Record<ChainStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-slate-100 text-slate-600',
  inactive: 'bg-red-100 text-red-600',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyStep(chainId: string, order: number): Omit<ApprovalStep, 'id'> {
  return {
    chain_id: chainId,
    step_order: order,
    step_name: '',
    role_label: '',
    approver_role: null,
    department_code: null,
    allowed_actions: ['approve', 'reject', 'request_changes'],
    sla_hours: 48,
    is_optional: false,
    notes: null,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  totalSteps,
  steps,
  paths,
  onUpdate,
  onDelete,
  onMove,
  onUpdatePath,
}: {
  step: ApprovalStep;
  index: number;
  totalSteps: number;
  steps: ApprovalStep[];
  paths: StepPath[];
  onUpdate: (updated: ApprovalStep) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onUpdatePath: (fromStepId: string, pathType: PathType, toStepId: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const stepPaths = paths.filter((p) => p.from_step_id === step.id);

  const getPathTarget = (pt: PathType) => {
    const p = stepPaths.find((x) => x.path_type === pt);
    return p ? p.to_step_id : undefined;
  };

  const toggleAction = (action: StepAction) => {
    const has = step.allowed_actions.includes(action);
    onUpdate({
      ...step,
      allowed_actions: has
        ? step.allowed_actions.filter((a) => a !== action)
        : [...step.allowed_actions, action],
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Step Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-secondary/40 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-700 text-primary">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <input
            className="w-full bg-transparent text-sm font-600 text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Step name (e.g. Department Head Review)"
            value={step.step_name}
            onChange={(e) => onUpdate({ ...step, step_name: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
            title="Move up"
          >
            <AppIcon name="ChevronUpIcon" size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === totalSteps - 1}
            className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
            title="Move down"
          >
            <AppIcon name="ChevronDownIcon" size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-secondary transition-colors"
          >
            <AppIcon
              name={expanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
              size={14}
              className="text-muted-foreground"
            />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 transition-colors"
            title="Remove step"
          >
            <AppIcon name="TrashIcon" size={14} className="text-red-400 hover:text-red-600" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Row 1: Role label + Approver role + Dept */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Role Label</label>
              <input
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Credit Officer"
                value={step.role_label}
                onChange={(e) => onUpdate({ ...step, role_label: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Approver Role</label>
              <select
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={step.approver_role ?? ''}
                onChange={(e) => onUpdate({ ...step, approver_role: e.target.value || null })}
              >
                <option value="">— Any —</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Department Code</label>
              <input
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. CREDIT"
                value={step.department_code ?? ''}
                onChange={(e) => onUpdate({ ...step, department_code: e.target.value || null })}
              />
            </div>
          </div>

          {/* Row 2: SLA + Optional */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-600 text-muted-foreground">SLA (hours)</label>
              <input
                type="number"
                min={1}
                className="w-20 text-sm border border-border rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={step.sla_hours}
                onChange={(e) => onUpdate({ ...step, sla_hours: parseInt(e.target.value) || 48 })}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-primary"
                checked={step.is_optional}
                onChange={(e) => onUpdate({ ...step, is_optional: e.target.checked })}
              />
              <span className="text-xs font-600 text-muted-foreground">Optional step</span>
            </label>
          </div>

          {/* Row 3: Allowed Actions */}
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-2">Allowed Actions</label>
            <div className="flex flex-wrap gap-2">
              {ACTION_OPTIONS.map((a) => {
                const active = step.allowed_actions.includes(a.value);
                return (
                  <button
                    key={a.value}
                    onClick={() => toggleAction(a.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-600 border transition-all ${
                      active
                        ? `${a.color} border-transparent`
                        : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Routing Paths */}
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-2">
              Routing Paths
            </label>
            <div className="space-y-2">
              {(['on_approve', 'on_reject', 'on_change_request'] as PathType[]).map((pt) => {
                const meta = PATH_LABELS[pt];
                const currentTarget = getPathTarget(pt);
                return (
                  <div key={pt} className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 w-40 flex-shrink-0 ${meta.color}`}>
                      <AppIcon name={meta.icon as any} size={14} />
                      <span className="text-xs font-600">{meta.label}</span>
                    </div>
                    <AppIcon name="ArrowRightIcon" size={12} className="text-muted-foreground flex-shrink-0" />
                    <select
                      className="flex-1 text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={currentTarget ?? 'END'}
                      onChange={(e) =>
                        onUpdatePath(step.id, pt, e.target.value === 'END' ? null : e.target.value)
                      }
                    >
                      <option value="END">⛔ End of Chain (Terminal)</option>
                      {steps
                        .filter((s) => s.id !== step.id)
                        .sort((a, b) => a.step_order - b.step_order)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            Step {s.step_order}: {s.step_name || s.role_label || `Step ${s.step_order}`}
                          </option>
                        ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Notes</label>
            <textarea
              rows={2}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Optional notes for this step..."
              value={step.notes ?? ''}
              onChange={(e) => onUpdate({ ...step, notes: e.target.value || null })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chain Flow Visualizer ─────────────────────────────────────────────────────

function ChainFlowVisualizer({ steps, paths }: { steps: ApprovalStep[]; paths: StepPath[] }) {
  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <AppIcon name="ArrowsRightLeftIcon" size={32} className="mb-2 opacity-30" />
        <p className="text-sm">Add steps to see the flow diagram</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start gap-0 min-w-max">
        {sorted.map((step, idx) => {
          const stepPaths = paths.filter((p) => p.from_step_id === step.id);
          const isLast = idx === sorted.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div className="flex flex-col items-center w-36">
                <div className="w-10 h-10 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mb-2">
                  <span className="text-sm font-700 text-primary">{step.step_order}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-600 text-foreground leading-tight">
                    {step.step_name || `Step ${step.step_order}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{step.role_label}</p>
                  {step.sla_hours && (
                    <span className="inline-block mt-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                      {step.sla_hours}h SLA
                    </span>
                  )}
                </div>
                {/* Path badges */}
                <div className="mt-2 space-y-1 w-full">
                  {stepPaths.map((p) => {
                    const meta = PATH_LABELS[p.path_type];
                    const target = sorted.find((s) => s.id === p.to_step_id);
                    return (
                      <div
                        key={p.id}
                        className={`text-[9px] font-600 px-1.5 py-0.5 rounded flex items-center gap-1 ${meta.color} bg-current/5`}
                        style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                      >
                        <AppIcon name={meta.icon as any} size={9} />
                        <span className="truncate">
                          {target ? `→ Step ${target.step_order}` : '→ End'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="flex items-center mt-4 mx-1">
                  <div className="w-6 h-0.5 bg-border" />
                  <AppIcon name="ChevronRightIcon" size={12} className="text-muted-foreground" />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Terminal node */}
        <div className="flex items-center mt-4 mx-1">
          <div className="w-6 h-0.5 bg-border" />
          <AppIcon name="ChevronRightIcon" size={12} className="text-muted-foreground" />
        </div>
        <div className="flex flex-col items-center w-20">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mb-2">
            <AppIcon name="CheckIcon" size={16} className="text-emerald-600" />
          </div>
          <p className="text-[10px] font-600 text-emerald-600 text-center">Completed</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ApprovalChainsPage() {
  const supabase = createClient();

  const [chains, setChains] = useState<ApprovalChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editor state
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [editingChain, setEditingChain] = useState<ApprovalChain | null>(null);
  const [editingSteps, setEditingSteps] = useState<ApprovalStep[]>([]);
  const [editingPaths, setEditingPaths] = useState<StepPath[]>([]);
  const [activeTab, setActiveTab] = useState<'steps' | 'flow'>('steps');
  const [showNewChainModal, setShowNewChainModal] = useState(false);
  const [newChainForm, setNewChainForm] = useState({ name: '', description: '', task_category: 'General' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Load chains ──────────────────────────────────────────────────────────────

  const loadChains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: chainData, error: chainErr } = await supabase
        .from('approval_chains')
        .select('*')
        .order('created_at', { ascending: false });

      if (chainErr) throw chainErr;

      const { data: stepsData, error: stepsErr } = await supabase
        .from('approval_steps')
        .select('*')
        .order('step_order', { ascending: true });

      if (stepsErr) throw stepsErr;

      const { data: pathsData, error: pathsErr } = await supabase
        .from('approval_step_paths')
        .select('*');

      if (pathsErr) throw pathsErr;

      const enriched: ApprovalChain[] = (chainData || []).map((c: any) => ({
        ...c,
        steps: (stepsData || []).filter((s: any) => s.chain_id === c.id),
        paths: (pathsData || []).filter((p: any) => {
          const stepIds = (stepsData || [])
            .filter((s: any) => s.chain_id === c.id)
            .map((s: any) => s.id);
          return stepIds.includes(p.from_step_id);
        }),
      }));

      setChains(enriched);
    } catch (e: any) {
      setError(e.message || 'Failed to load approval chains');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadChains();
  }, [loadChains]);

  // ── Select chain for editing ─────────────────────────────────────────────────

  const selectChain = (chain: ApprovalChain) => {
    setSelectedChainId(chain.id);
    setEditingChain({ ...chain });
    setEditingSteps(chain.steps ? [...chain.steps] : []);
    setEditingPaths(chain.paths ? [...chain.paths] : []);
    setActiveTab('steps');
  };

  // ── Create new chain ─────────────────────────────────────────────────────────

  const createChain = async () => {
    if (!newChainForm.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error: err } = await supabase
        .from('approval_chains')
        .insert({
          name: newChainForm.name.trim(),
          description: newChainForm.description.trim() || null,
          task_category: newChainForm.task_category,
          status: 'draft',
          is_default: false,
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (err) throw err;

      const newChain: ApprovalChain = { ...data, steps: [], paths: [] };
      setChains((prev) => [newChain, ...prev]);
      setShowNewChainModal(false);
      setNewChainForm({ name: '', description: '', task_category: 'General' });
      selectChain(newChain);
      showSuccess('Approval chain created');
    } catch (e: any) {
      setError(e.message || 'Failed to create chain');
    } finally {
      setSaving(false);
    }
  };

  // ── Save chain meta ──────────────────────────────────────────────────────────

  const saveChainMeta = async () => {
    if (!editingChain) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('approval_chains')
        .update({
          name: editingChain.name,
          description: editingChain.description,
          task_category: editingChain.task_category,
          status: editingChain.status,
          is_default: editingChain.is_default,
        })
        .eq('id', editingChain.id);

      if (err) throw err;
      showSuccess('Chain settings saved');
      await loadChains();
    } catch (e: any) {
      setError(e.message || 'Failed to save chain');
    } finally {
      setSaving(false);
    }
  };

  // ── Add step ─────────────────────────────────────────────────────────────────

  const addStep = () => {
    if (!editingChain) return;
    const newOrder = editingSteps.length + 1;
    const tempId = `temp-${Date.now()}`;
    const newStep: ApprovalStep = {
      id: tempId,
      ...emptyStep(editingChain.id, newOrder),
    };
    setEditingSteps((prev) => [...prev, newStep]);
  };

  // ── Update step ──────────────────────────────────────────────────────────────

  const updateStep = (updated: ApprovalStep) => {
    setEditingSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // ── Delete step ──────────────────────────────────────────────────────────────

  const deleteStep = (stepId: string) => {
    setEditingSteps((prev) => {
      const filtered = prev.filter((s) => s.id !== stepId);
      return filtered.map((s, i) => ({ ...s, step_order: i + 1 }));
    });
    setEditingPaths((prev) =>
      prev.filter((p) => p.from_step_id !== stepId && p.to_step_id !== stepId)
    );
  };

  // ── Move step ────────────────────────────────────────────────────────────────

  const moveStep = (stepId: string, dir: 'up' | 'down') => {
    setEditingSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === stepId);
      if (idx < 0) return prev;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr.map((s, i) => ({ ...s, step_order: i + 1 }));
    });
  };

  // ── Update path ──────────────────────────────────────────────────────────────

  const updatePath = (fromStepId: string, pathType: PathType, toStepId: string | null) => {
    setEditingPaths((prev) => {
      const existing = prev.find(
        (p) => p.from_step_id === fromStepId && p.path_type === pathType
      );
      if (existing) {
        return prev.map((p) =>
          p.from_step_id === fromStepId && p.path_type === pathType
            ? { ...p, to_step_id: toStepId }
            : p
        );
      }
      return [
        ...prev,
        {
          id: `temp-path-${Date.now()}-${Math.random()}`,
          from_step_id: fromStepId,
          path_type: pathType,
          to_step_id: toStepId,
        },
      ];
    });
  };

  // ── Save all steps + paths ───────────────────────────────────────────────────

  const saveStepsAndPaths = async () => {
    if (!editingChain) return;
    setSaving(true);
    setError(null);
    try {
      // Delete existing steps (cascade deletes paths)
      await supabase.from('approval_steps').delete().eq('chain_id', editingChain.id);

      if (editingSteps.length === 0) {
        showSuccess('Steps saved (chain is empty)');
        await loadChains();
        return;
      }

      // Insert steps (strip temp IDs)
      const stepsToInsert = editingSteps.map(({ id: _id, ...rest }) => ({
        ...rest,
        chain_id: editingChain.id,
      }));

      const { data: insertedSteps, error: stepsErr } = await supabase
        .from('approval_steps')
        .insert(stepsToInsert)
        .select();

      if (stepsErr) throw stepsErr;

      // Build old-id → new-id map
      const idMap: Record<string, string> = {};
      editingSteps.forEach((oldStep, i) => {
        if (insertedSteps?.[i]) {
          idMap[oldStep.id] = insertedSteps[i].id;
        }
      });

      // Insert paths with remapped IDs
      const pathsToInsert = editingPaths
        .filter((p) => idMap[p.from_step_id])
        .map(({ id: _id, ...rest }) => ({
          from_step_id: idMap[rest.from_step_id],
          path_type: rest.path_type,
          to_step_id: rest.to_step_id ? (idMap[rest.to_step_id] ?? null) : null,
        }));

      if (pathsToInsert.length > 0) {
        const { error: pathsErr } = await supabase
          .from('approval_step_paths')
          .insert(pathsToInsert);
        if (pathsErr) throw pathsErr;
      }

      showSuccess('Steps and routing paths saved');
      await loadChains();
    } catch (e: any) {
      setError(e.message || 'Failed to save steps');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete chain ─────────────────────────────────────────────────────────────

  const deleteChain = async (chainId: string) => {
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('approval_chains')
        .delete()
        .eq('id', chainId);
      if (err) throw err;
      setChains((prev) => prev.filter((c) => c.id !== chainId));
      if (selectedChainId === chainId) {
        setSelectedChainId(null);
        setEditingChain(null);
        setEditingSteps([]);
        setEditingPaths([]);
      }
      setDeleteConfirmId(null);
      showSuccess('Chain deleted');
    } catch (e: any) {
      setError(e.message || 'Failed to delete chain');
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="flex h-full min-h-screen">
        {/* ── Left Panel: Chain List ─────────────────────────────────────────── */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-card flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-700 text-foreground">Approval Chains</h2>
              <button
                onClick={() => setShowNewChainModal(true)}
                className="flex items-center gap-1 text-xs font-600 text-primary hover:text-primary/80 transition-colors"
              >
                <AppIcon name="PlusIcon" size={14} />
                New
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Configure per task category</p>
          </div>

          {/* Chain list */}
          <div className="flex-1 overflow-y-auto py-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : chains.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <AppIcon name="ArrowsRightLeftIcon" size={28} className="text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No chains yet. Create one to get started.</p>
              </div>
            ) : (
              chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => selectChain(chain)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-secondary/50 ${
                    selectedChainId === chain.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-600 text-foreground truncate">{chain.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{chain.task_category}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-600 px-1.5 py-0.5 rounded-full ${STATUS_STYLES[chain.status]}`}>
                          {chain.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {chain.steps?.length ?? 0} steps
                        </span>
                        {chain.is_default && (
                          <span className="text-[10px] font-600 text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Right Panel: Editor ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-background">
          {!editingChain ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <AppIcon name="ArrowsRightLeftIcon" size={28} className="text-primary" />
              </div>
              <h3 className="text-lg font-700 text-foreground mb-2">Configure Approval Chains</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Select a chain from the left to edit its steps, routing paths, and rejection loops — or create a new one.
              </p>
              <button
                onClick={() => setShowNewChainModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors"
              >
                <AppIcon name="PlusIcon" size={16} />
                New Approval Chain
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
              {/* Toast messages */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AppIcon name="ExclamationCircleIcon" size={16} />
                  {error}
                  <button onClick={() => setError(null)} className="ml-auto">
                    <AppIcon name="XMarkIcon" size={14} />
                  </button>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                  <AppIcon name="CheckCircleIcon" size={16} />
                  {successMsg}
                </div>
              )}

              {/* Chain Meta Card */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-700 text-foreground">Chain Configuration</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Basic settings for this approval chain</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {deleteConfirmId === editingChain.id ? (
                      <>
                        <span className="text-xs text-red-600 font-600">Delete this chain?</span>
                        <button
                          onClick={() => deleteChain(editingChain.id)}
                          disabled={saving}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-600 hover:bg-red-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-600 hover:bg-secondary/80 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(editingChain.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete chain"
                      >
                        <AppIcon name="TrashIcon" size={16} className="text-red-400" />
                      </button>
                    )}
                    <button
                      onClick={saveChainMeta}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <AppIcon name="CheckIcon" size={14} />
                      )}
                      Save Settings
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-600 text-muted-foreground mb-1">Chain Name *</label>
                    <input
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editingChain.name}
                      onChange={(e) => setEditingChain({ ...editingChain, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-muted-foreground mb-1">Task Category *</label>
                    <select
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editingChain.task_category}
                      onChange={(e) => setEditingChain({ ...editingChain, task_category: e.target.value })}
                    >
                      {TASK_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-muted-foreground mb-1">Status</label>
                    <select
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editingChain.status}
                      onChange={(e) =>
                        setEditingChain({ ...editingChain, status: e.target.value as ChainStatus })
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-600 text-muted-foreground mb-1">Description</label>
                    <textarea
                      rows={2}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      value={editingChain.description ?? ''}
                      onChange={(e) =>
                        setEditingChain({ ...editingChain, description: e.target.value || null })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-primary"
                        checked={editingChain.is_default}
                        onChange={(e) =>
                          setEditingChain({ ...editingChain, is_default: e.target.checked })
                        }
                      />
                      <span className="text-sm font-600 text-foreground">
                        Set as default chain for this category
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Steps / Flow Tabs */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Tab bar */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setActiveTab('steps')}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-600 transition-colors border-b-2 ${
                      activeTab === 'steps' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AppIcon name="ListBulletIcon" size={15} />
                    Steps & Routing
                    <span className="ml-1 text-xs bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground">
                      {editingSteps.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('flow')}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-600 transition-colors border-b-2 ${
                      activeTab === 'flow' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AppIcon name="ArrowsRightLeftIcon" size={15} />
                    Flow Diagram
                  </button>
                </div>

                {activeTab === 'steps' && (
                  <div className="p-5 space-y-4">
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3 p-3 bg-secondary/40 rounded-lg">
                      <span className="text-xs font-600 text-muted-foreground">Routing paths:</span>
                      {Object.entries(PATH_LABELS).map(([key, meta]) => (
                        <div key={key} className={`flex items-center gap-1 text-xs font-600 ${meta.color}`}>
                          <AppIcon name={meta.icon as any} size={12} />
                          {meta.label}
                        </div>
                      ))}
                    </div>

                    {editingSteps.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <AppIcon name="PlusCircleIcon" size={28} className="text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground mb-4">
                          No steps yet. Add the first approver in the chain.
                        </p>
                        <button
                          onClick={addStep}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors"
                        >
                          <AppIcon name="PlusIcon" size={14} />
                          Add First Step
                        </button>
                      </div>
                    ) : (
                      <>
                        {editingSteps
                          .sort((a, b) => a.step_order - b.step_order)
                          .map((step, idx) => (
                            <StepCard
                              key={step.id}
                              step={step}
                              index={idx}
                              totalSteps={editingSteps.length}
                              steps={editingSteps}
                              paths={editingPaths}
                              onUpdate={updateStep}
                              onDelete={() => deleteStep(step.id)}
                              onMove={(dir) => moveStep(step.id, dir)}
                              onUpdatePath={updatePath}
                            />
                          ))}
                      </>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={addStep}
                        className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-sm font-600 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <AppIcon name="PlusIcon" size={14} />
                        Add Step
                      </button>
                      <button
                        onClick={saveStepsAndPaths}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors disabled:opacity-60"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <AppIcon name="CloudArrowUpIcon" size={15} />
                        )}
                        Save Steps & Paths
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'flow' && (
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground mb-4">
                      Visual representation of the approval flow. Save steps first to see updated paths.
                    </p>
                    <ChainFlowVisualizer steps={editingSteps} paths={editingPaths} />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── New Chain Modal ──────────────────────────────────────────────────── */}
      {showNewChainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-700 text-foreground">New Approval Chain</h3>
              <button
                onClick={() => setShowNewChainModal(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <AppIcon name="XMarkIcon" size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Chain Name *</label>
                <input
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. Loan Processing Approval"
                  value={newChainForm.name}
                  onChange={(e) => setNewChainForm({ ...newChainForm, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Task Category *</label>
                <select
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={newChainForm.task_category}
                  onChange={(e) => setNewChainForm({ ...newChainForm, task_category: e.target.value })}
                >
                  {TASK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Optional description..."
                  value={newChainForm.description}
                  onChange={(e) => setNewChainForm({ ...newChainForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewChainModal(false)}
                className="px-4 py-2 text-sm font-600 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createChain}
                disabled={saving || !newChainForm.name.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <AppIcon name="PlusIcon" size={14} />
                )}
                Create Chain
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
