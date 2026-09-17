'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  type Task,
  type TaskStatusEnum,
  ALLOWED_TRANSITIONS,
  fetchTaskActivity,
  fetchTaskComments,
  fetchTaskSubtasks,
  postComment,
  addSubtask,
  setSubtaskCompleted,
  deleteSubtask,
  updateTaskProgress,
  statusLabel,
  type TaskActivity,
  type TaskComment,
  type TaskSubtask,
} from '@/lib/tasks';
import { bsDateTime, bsLongDate } from '@/lib/date';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onStatusChange: (task: Task, status: TaskStatusEnum) => Promise<void>;
  onRefresh: () => void;
}

const statusClassMap: Record<string, string> = {
  Draft: 'status-draft',
  Assigned: 'status-assigned',
  Accepted: 'status-accepted',
  'In Progress': 'status-inprogress',
  Pending: 'status-pending',
  Blocked: 'status-blocked',
  'Under Review': 'status-review',
  'Changes Requested': 'status-changes',
  Approved: 'status-approved',
  Completed: 'status-completed',
  Closed: 'status-closed',
  'On Hold': 'status-onhold',
  Reopened: 'status-reopened',
  Cancelled: 'status-closed',
};

const ACTION_LABELS: Record<string, string> = {
  created: 'Task created',
  assigned: 'Assigned',
  accepted: 'Task accepted',
  status_changed: 'Status changed',
  progress_changed: 'Progress updated',
  commented: 'Comment added',
  forwarded: 'Forwarded',
  sent_back: 'Sent back',
  reassigned: 'Reassigned',
  due_date_changed: 'Due date changed',
  priority_changed: 'Priority changed',
  file_uploaded: 'Attachment uploaded',
  file_deleted: 'Attachment deleted',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  reopened: 'Reopened',
  subtask_added: 'Subtask added',
  subtask_completed: 'Subtask completed',
};

type TabId = 'overview' | 'journey' | 'comments' | 'activity';

export default function TaskDetailPanel({
  task,
  onClose,
  onStatusChange,
  onRefresh,
}: TaskDetailPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [comment, setComment] = useState('');
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [activityRows, commentRows, subtaskRows] = await Promise.all([
        fetchTaskActivity(task.id),
        fetchTaskComments(task.id),
        fetchTaskSubtasks(task.id),
      ]);
      setActivity(activityRows);
      setComments(commentRows);
      setSubtasks(subtaskRows);
    } catch (err: any) {
      toast.error('Could not load task details', { description: err?.message });
    } finally {
      setLoading(false);
    }
  }, [task.id]);

  useEffect(() => {
    load();
  }, [load]);

  const transitions = ALLOWED_TRANSITIONS[task.statusEnum] ?? [];

  const runTransition = async (status: TaskStatusEnum) => {
    setBusy(true);
    try {
      await onStatusChange(task, status);
      await load();
      toast.success(`Task moved to ${statusLabel(status)}`);
    } catch (err: any) {
      toast.error('Status change failed', { description: err?.message });
    } finally {
      setBusy(false);
    }
  };

  const submitComment = async () => {
    const content = comment.trim();
    if (!content) return;
    setBusy(true);
    try {
      await postComment(task.id, content);
      setComment('');
      const rows = await fetchTaskComments(task.id);
      setComments(rows);
      onRefresh();
    } catch (err: any) {
      toast.error('Could not post comment', { description: err?.message });
    } finally {
      setBusy(false);
    }
  };

  const submitSubtask = async () => {
    const title = newSubtask.trim();
    if (!title) return;
    setBusy(true);
    try {
      await addSubtask(task.id, title, subtasks.length + 1);
      setNewSubtask('');
      setSubtasks(await fetchTaskSubtasks(task.id));
      onRefresh();
    } catch (err: any) {
      toast.error('Could not add subtask', { description: err?.message });
    } finally {
      setBusy(false);
    }
  };

  const toggleSubtask = async (subtask: TaskSubtask) => {
    try {
      await setSubtaskCompleted(subtask.id, !subtask.isCompleted);
      setSubtasks(await fetchTaskSubtasks(task.id));
      onRefresh();
    } catch (err: any) {
      toast.error('Could not update subtask', { description: err?.message });
    }
  };

  const removeSubtask = async (subtask: TaskSubtask) => {
    try {
      await deleteSubtask(subtask.id);
      setSubtasks(await fetchTaskSubtasks(task.id));
      onRefresh();
    } catch (err: any) {
      toast.error('Could not delete subtask', { description: err?.message });
    }
  };

  const nudgeProgress = async (delta: number) => {
    try {
      await updateTaskProgress(task.id, task.progress + delta);
      onRefresh();
    } catch (err: any) {
      toast.error('Could not update progress', { description: err?.message });
    }
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'InformationCircleIcon' },
    { id: 'journey', label: 'Task Journey', icon: 'MapIcon' },
    { id: 'comments', label: `Comments (${comments.length})`, icon: 'ChatBubbleLeftIcon' },
    { id: 'activity', label: 'Activity Log', icon: 'ClockIcon' },
  ];

  const subtaskDone = subtasks.filter((s) => s.isCompleted).length;
  const currentUserName = user?.user_metadata?.full_name || user?.email || 'You';
  const currentInitials = currentUserName
    .split(/\s+/)
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 modal-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-modal z-50 flex flex-col slide-in-right">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-600 font-tabular text-primary bg-primary/10 px-2 py-0.5 rounded">
                {task.taskId}
              </span>
              <span
                className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${
                  statusClassMap[task.status] || 'status-draft'
                }`}
              >
                {task.status}
              </span>
              <span
                className={`text-[10px] font-600 px-2 py-0.5 rounded-full priority-${task.priority.toLowerCase()}`}
              >
                {task.priority}
              </span>
              {task.isConfidential && (
                <span className="text-[10px] font-600 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  Confidential
                </span>
              )}
            </div>
            <h2 className="text-base font-700 text-foreground leading-snug">{task.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {task.department} · Created by {task.createdBy}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
          >
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-600 text-foreground">Overall Progress</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => nudgeProgress(-10)}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                title="Decrease by 10%"
              >
                <Icon name="MinusIcon" size={11} className="text-muted-foreground" />
              </button>
              <span className="text-xs font-700 font-tabular text-foreground w-9 text-center">
                {task.progress}%
              </span>
              <button
                onClick={() => nudgeProgress(10)}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                title="Increase by 10%"
              >
                <Icon name="PlusIcon" size={11} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                task.progress >= 75
                  ? 'bg-green-500'
                  : task.progress >= 40
                    ? 'bg-primary'
                    : 'bg-amber-500'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Icon name="CalendarDaysIcon" size={12} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                Due:{' '}
                <span
                  className={
                    task.overdueDays > 0 ? 'text-red-600 font-600' : 'text-foreground font-500'
                  }
                >
                  {task.dueDate ? `${bsLongDate(task.dueDate)} BS` : 'Not set'}
                </span>
              </span>
            </div>
            {task.overdueDays > 0 && (
              <span className="text-[11px] font-600 text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                {task.overdueDays}d overdue
              </span>
            )}

            {/* Transitions are derived from the task's current status. */}
            <div className="flex items-center gap-1.5 ml-auto flex-wrap">
              {transitions.length === 0 ? (
                <span className="text-[11px] text-muted-foreground">No actions available</span>
              ) : (
                transitions.map((transition) => (
                  <button
                    key={`${task.id}-${transition.to}`}
                    disabled={busy}
                    onClick={() => runTransition(transition.to)}
                    className={`flex items-center gap-1 text-xs font-500 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                      transition.tone === 'danger'
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-primary bg-primary/10 hover:bg-primary/20'
                    }`}
                  >
                    <Icon name={transition.icon as any} size={12} />
                    {transition.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0 px-2 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-600 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon as any} size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeTab === 'overview' && (
            <div className="p-5 space-y-5 fade-in">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Assignee', value: task.assignee },
                  { label: 'Department', value: task.department },
                  { label: 'Reviewer', value: task.reviewer },
                  { label: 'Approver', value: task.approver },
                  { label: 'Category', value: task.category },
                  {
                    label: 'Created',
                    value: task.createdDate ? `${bsLongDate(task.createdDate)} BS` : '—',
                  },
                ].map((meta) => (
                  <div
                    key={`meta-${meta.label.toLowerCase()}`}
                    className="bg-muted/50 rounded-lg px-3 py-2.5"
                  >
                    <p className="text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-0.5">
                      {meta.label}
                    </p>
                    <p className="text-sm font-500 text-foreground">{meta.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">
                  Description
                </h4>
                <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {task.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <span
                        key={`tag-${tag}`}
                        className="text-xs font-500 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks — editable */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wide">
                    Subtasks ({subtaskDone}/{subtasks.length})
                  </h4>
                  {subtasks.length > 0 && (
                    <span className="text-xs font-600 text-foreground">
                      {Math.round((subtaskDone / subtasks.length) * 100)}% done
                    </span>
                  )}
                </div>
                {subtasks.length > 0 && (
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(subtaskDone / subtasks.length) * 100}%` }}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <button
                        onClick={() => toggleSubtask(subtask)}
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                          subtask.isCompleted
                            ? 'bg-green-500'
                            : 'border-2 border-border hover:border-primary'
                        }`}
                      >
                        {subtask.isCompleted && (
                          <Icon name="CheckIcon" size={10} className="text-white" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-xs ${
                          subtask.isCompleted
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground font-500'
                        }`}
                      >
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => removeSubtask(subtask)}
                        className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                        title="Delete subtask"
                      >
                        <Icon
                          name="TrashIcon"
                          size={12}
                          className="text-muted-foreground hover:text-red-600"
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        submitSubtask();
                      }
                    }}
                    placeholder="Add a subtask…"
                    className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={submitSubtask}
                    disabled={!newSubtask.trim() || busy}
                    className="px-3 py-2 text-xs font-600 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Attachments — storage bucket not configured yet */}
              <div>
                <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">
                  Attachments ({task.attachmentCount})
                </h4>
                <div className="bg-muted/40 rounded-lg px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    {task.attachmentCount > 0
                      ? `${task.attachmentCount} attachment(s) recorded. Preview and download require the Supabase Storage bucket to be configured.`
                      : 'File upload is not enabled yet.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'journey' && (
            <div className="p-5 fade-in">
              <p className="text-xs text-muted-foreground mb-5">
                Lifecycle trail for task{' '}
                <span className="font-600 text-foreground">{task.taskId}</span>
              </p>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={`journey-skeleton-${i + 1}`} className="flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  No lifecycle events recorded yet.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-1">
                    {[...activity].reverse().map((entry, i, arr) => (
                      <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                        <div
                          className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            i === arr.length - 1
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <Icon
                            name={i === arr.length - 1 ? 'ArrowPathIcon' : 'CheckCircleIcon'}
                            size={15}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p
                              className={`text-sm font-600 ${
                                i === arr.length - 1 ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {ACTION_LABELS[entry.action] ?? entry.action}
                            </p>
                            {i === arr.length - 1 && (
                              <span className="text-[10px] font-600 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          {entry.newValue && (
                            <p className="text-xs text-foreground">
                              {entry.oldValue
                                ? `${statusLabel(entry.oldValue) || entry.oldValue} → ${statusLabel(entry.newValue) || entry.newValue}`
                                : entry.newValue}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">{entry.userName}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-tabular">
                            {bsDateTime(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="flex flex-col h-full fade-in">
              <div className="flex-1 p-5 space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={`comment-skeleton-${i + 1}`} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                          <div className="h-10 bg-muted rounded-xl animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    No comments yet. Start the discussion below.
                  </p>
                ) : (
                  comments.map((cmt) => {
                    const isOwn = cmt.userId === user?.id;
                    return (
                      <div key={cmt.id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-700 text-primary">{cmt.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-600 text-foreground">{cmt.userName}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {bsDateTime(cmt.createdAt)}
                            </span>
                          </div>
                          <div
                            className={`text-sm text-foreground leading-relaxed p-3 rounded-xl rounded-tl-sm whitespace-pre-wrap ${
                              isOwn ? 'bg-primary/10' : 'bg-muted/50'
                            }`}
                          >
                            {cmt.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-700 text-primary">{currentInitials}</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment…"
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring text-foreground placeholder:text-muted-foreground resize-none transition-all"
                    />
                    <div className="flex items-center justify-end mt-2">
                      <button
                        onClick={submitComment}
                        disabled={!comment.trim() || busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Icon
                          name="PaperAirplaneIcon"
                          size={12}
                          className="text-primary-foreground"
                        />
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-5 fade-in">
              <p className="text-xs text-muted-foreground mb-4">
                Audit trail — every recorded action with user and timestamp.
              </p>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={`activity-skeleton-${i + 1}`}
                      className="h-16 bg-muted rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  No activity recorded for this task yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="ClockIcon" size={13} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-600 text-foreground">
                          {ACTION_LABELS[item.action] ?? item.action}
                        </p>
                        {(item.oldValue || item.newValue) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.oldValue ? `${item.oldValue} → ` : ''}
                            {item.newValue}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-500 text-foreground">
                            {item.userName}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-tabular">
                            {bsDateTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
