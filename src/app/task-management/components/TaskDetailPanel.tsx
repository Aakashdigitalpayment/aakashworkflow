'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Task } from './taskData';
import { toast } from 'sonner';

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
}

const statusClassMap: Record<string, string> = {
  'Draft': 'status-draft',
  'Assigned': 'status-assigned',
  'Accepted': 'status-accepted',
  'In Progress': 'status-inprogress',
  'Pending': 'status-pending',
  'Blocked': 'status-blocked',
  'Under Review': 'status-review',
  'Changes Requested': 'status-changes',
  'Approved': 'status-approved',
  'Completed': 'status-completed',
  'Closed': 'status-closed',
  'On Hold': 'status-onhold',
  'Reopened': 'status-reopened',
};

const journeySteps = [
  { id: 'step-created', label: 'Created', icon: 'PlusCircleIcon', done: true, time: '10 Ashwin 2083, 09:14', user: 'Rajesh K. Shrestha', color: 'bg-primary/10 text-primary border-primary/30' },
  { id: 'step-assigned', label: 'Assigned', icon: 'UserPlusIcon', done: true, time: '10 Ashwin 2083, 09:16', user: 'Rajesh K. Shrestha', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'step-accepted', label: 'Accepted', icon: 'ClipboardDocumentCheckIcon', done: true, time: '10 Ashwin 2083, 11:32', user: 'Sita Rana', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { id: 'step-inprogress', label: 'In Progress', icon: 'ArrowPathIcon', done: true, time: '11 Ashwin 2083, 08:45', user: 'Sita Rana', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'step-review', label: 'Under Review', icon: 'MagnifyingGlassIcon', done: true, time: '16 Ashwin 2083, 13:10', user: 'Sita Rana', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'step-approved', label: 'Approved', icon: 'CheckBadgeIcon', done: false, time: 'Pending', user: 'Narayan Paudel', color: 'bg-muted text-muted-foreground border-border' },
  { id: 'step-completed', label: 'Completed', icon: 'CheckCircleIcon', done: false, time: '—', user: '—', color: 'bg-muted text-muted-foreground border-border' },
];

const mockComments = [
  { id: 'cmt-001', user: 'Sita Rana', initials: 'SR', time: '16 Ashwin, 13:08', text: 'Report is ready for review. All disbursements reconciled. Waiting for Narayan sir\'s approval.', isOwn: false },
  { id: 'cmt-002', user: 'Narayan Paudel', initials: 'NP', time: '16 Ashwin, 13:15', text: 'Reviewing now. Please also attach the CBS export file for cross-verification.', isOwn: false },
  { id: 'cmt-003', user: 'Sita Rana', initials: 'SR', time: '16 Ashwin, 13:42', text: 'CBS export attached. File: CBS_Ashwin2083_Disbursement.xlsx', isOwn: false },
  { id: 'cmt-004', user: 'Rajesh K. Shrestha', initials: 'RKS', time: '16 Ashwin, 14:10', text: '@Narayan please expedite — this report is needed for board meeting tomorrow.', isOwn: true },
];

const mockActivity = [
  { id: 'al-001', action: 'Status changed', detail: 'In Progress → Under Review', user: 'Sita Rana', time: '16 Ashwin, 13:10' },
  { id: 'al-002', action: 'Attachment uploaded', detail: 'CBS_Ashwin2083_Disbursement.xlsx (1.4 MB)', user: 'Sita Rana', time: '16 Ashwin, 13:42' },
  { id: 'al-003', action: 'Comment added', detail: 'By Rajesh K. Shrestha', user: 'Rajesh K. Shrestha', time: '16 Ashwin, 14:10' },
  { id: 'al-004', action: 'Progress updated', detail: '75% → 90%', user: 'Sita Rana', time: '16 Ashwin, 13:05' },
  { id: 'al-005', action: 'Task accepted', detail: 'Accepted by assignee', user: 'Sita Rana', time: '10 Ashwin, 11:32' },
];

type TabId = 'overview' | 'journey' | 'comments' | 'activity';

export default function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'InformationCircleIcon' },
    { id: 'journey', label: 'Task Journey', icon: 'MapIcon' },
    { id: 'comments', label: `Comments (${task.commentCount})`, icon: 'ChatBubbleLeftIcon' },
    { id: 'activity', label: 'Activity Log', icon: 'ClockIcon' },
  ];

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
              <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${statusClassMap[task.status] || 'status-draft'}`}>
                {task.status}
              </span>
              <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full priority-${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </div>
            <h2 className="text-base font-700 text-foreground leading-snug">{task.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{task.department} · Created by {task.createdBy}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors flex-shrink-0">
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-600 text-foreground">Overall Progress</span>
            <span className="text-xs font-700 font-tabular text-foreground">{task.progress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                task.progress >= 75 ? 'bg-green-500' : task.progress >= 40 ? 'bg-primary' : 'bg-amber-500'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <Icon name="CalendarDaysIcon" size={12} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Due: <span className={task.overdueDays > 0 ? 'text-red-600 font-600' : 'text-foreground font-500'}>{task.dueDate}</span></span>
            </div>
            {task.overdueDays > 0 && (
              <span className="text-[11px] font-600 text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                {task.overdueDays}d overdue
              </span>
            )}
            <div className="flex items-center gap-1.5 ml-auto">
              {[
                { id: 'action-edit', icon: 'PencilSquareIcon', label: 'Edit', onClick: () => toast.info('Edit task') },
                { id: 'action-forward', icon: 'ArrowRightCircleIcon', label: 'Forward', onClick: () => toast.info('Forward task') },
                { id: 'action-approve', icon: 'CheckBadgeIcon', label: 'Approve', onClick: () => toast.success('Task approved!') },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.onClick}
                  className="flex items-center gap-1 text-xs font-500 text-secondary-foreground bg-secondary hover:bg-border px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Icon name={btn.icon as any} size={12} />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-600 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
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
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Assignee', value: task.assignee },
                  { label: 'Department', value: task.department },
                  { label: 'Reviewer', value: task.reviewer },
                  { label: 'Approver', value: task.approver },
                  { label: 'Category', value: task.category },
                  { label: 'Created', value: task.createdDate },
                ].map((meta) => (
                  <div key={`meta-${meta.label.toLowerCase()}`} className="bg-muted/50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-0.5">{meta.label}</p>
                    <p className="text-sm font-500 text-foreground">{meta.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">Description</h4>
                <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">{task.description}</p>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <span key={`tag-${tag}`} className="text-xs font-500 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {task.subtaskCount > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wide">
                      Subtasks ({task.subtaskDone}/{task.subtaskCount})
                    </h4>
                    <span className="text-xs font-600 text-foreground">
                      {Math.round((task.subtaskDone / task.subtaskCount) * 100)}% done
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(task.subtaskDone / task.subtaskCount) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    {Array.from({ length: Math.min(task.subtaskCount, 5) }, (_, i) => (
                      <div key={`subtask-${task.id}-${i + 1}`} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          i < task.subtaskDone ? 'bg-green-500' : 'border-2 border-border'
                        }`}>
                          {i < task.subtaskDone && <Icon name="CheckIcon" size={10} className="text-white" />}
                        </div>
                        <span className={`text-xs ${i < task.subtaskDone ? 'line-through text-muted-foreground' : 'text-foreground font-500'}`}>
                          Subtask {i + 1} of {task.taskId}
                        </span>
                      </div>
                    ))}
                    {task.subtaskCount > 5 && (
                      <p className="text-xs text-muted-foreground pl-7">+{task.subtaskCount - 5} more subtasks</p>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachmentCount > 0 && (
                <div>
                  <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">
                    Attachments ({task.attachmentCount})
                  </h4>
                  <div className="space-y-1.5">
                    {Array.from({ length: task.attachmentCount }, (_, i) => {
                      const exts = ['pdf', 'xlsx', 'docx', 'jpg', 'png'];
                      const ext = exts[i % exts.length];
                      const sizes = ['234 KB', '1.4 MB', '89 KB', '512 KB', '2.1 MB', '178 KB', '345 KB', '67 KB'];
                      return (
                        <div key={`attach-${task.id}-${i + 1}`} className="flex items-center gap-2.5 p-2.5 bg-muted/40 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="DocumentIcon" size={14} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-500 text-foreground truncate">{task.taskId}_Document_{i + 1}.{ext}</p>
                            <p className="text-[10px] text-muted-foreground">Uploaded by {task.assignee} · {sizes[i % sizes.length]}</p>
                          </div>
                          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-secondary transition-colors">
                            <Icon name="ArrowDownTrayIcon" size={13} className="text-muted-foreground" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'journey' && (
            <div className="p-5 fade-in">
              <p className="text-xs text-muted-foreground mb-5">
                Complete lifecycle trail for task <span className="font-600 text-foreground">{task.taskId}</span>
              </p>
              <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-1">
                  {journeySteps.map((step, i) => (
                    <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                      <div className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        step.done ? step.color : 'bg-muted border-border text-muted-foreground'
                      }`}>
                        <Icon name={step.icon as any} size={15} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm font-600 ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {step.done && i === journeySteps.filter((s) => s.done).length - 1 && (
                            <span className="text-[10px] font-600 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{step.user}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-tabular">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="flex flex-col h-full fade-in">
              <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin">
                {mockComments.map((cmt) => (
                  <div key={cmt.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-700 text-primary">{cmt.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-600 text-foreground">{cmt.user}</span>
                        <span className="text-[10px] text-muted-foreground">{cmt.time}</span>
                      </div>
                      <div className={`text-sm text-foreground leading-relaxed p-3 rounded-xl rounded-tl-sm ${
                        cmt.isOwn ? 'bg-primary/10' : 'bg-muted/50'
                      }`}>
                        {cmt.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-700 text-primary">RKS</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment… Use @ to mention someone"
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring text-foreground placeholder:text-muted-foreground resize-none transition-all"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-secondary transition-colors" title="Attach file">
                          <Icon name="PaperClipIcon" size={14} className="text-muted-foreground" />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-secondary transition-colors" title="Mention someone">
                          <Icon name="AtSymbolIcon" size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (comment.trim()) {
                            toast.success('Comment added.');
                            setComment('');
                          }
                        }}
                        disabled={!comment.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Icon name="PaperAirplaneIcon" size={12} className="text-primary-foreground" />
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
              <p className="text-xs text-muted-foreground mb-4">Immutable audit trail — all actions recorded with user and timestamp</p>
              <div className="space-y-3">
                {mockActivity.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="ClockIcon" size={13} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-500 text-foreground">{item.user}</span>
                        <span className="text-[10px] text-muted-foreground font-tabular">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}