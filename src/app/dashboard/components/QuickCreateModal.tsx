'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import {
  createTask,
  fetchTaskDirectory,
  TASK_CATEGORIES,
  type DirectoryDepartment,
  type DirectoryUser,
  type TaskPriorityEnum,
} from '@/lib/tasks';
import { bsLongDate } from '@/lib/date';

interface QuickCreateFormData {
  title: string;
  departmentId: string;
  assigneeId: string;
  priority: string;
  dueDate: string;
  description: string;
  category: string;
}

interface QuickCreateModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

export default function QuickCreateModal({ onClose, onCreated }: QuickCreateModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuickCreateFormData>();

  const [departments, setDepartments] = useState<DirectoryDepartment[]>([]);
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    fetchTaskDirectory()
      .then((directory) => {
        if (cancelled) return;
        setDepartments(directory.departments);
        setUsers(directory.users);
      })
      .catch((err: any) => {
        if (!cancelled)
          toast.error('Could not load people and departments', { description: err?.message });
      })
      .finally(() => {
        if (!cancelled) setLoadingDirectory(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const departmentId = watch('departmentId');
  const dueDate = watch('dueDate');
  const peopleInDepartment = departmentId
    ? users.filter((u) => u.departmentId === departmentId)
    : users;

  const onSubmit = async (data: QuickCreateFormData) => {
    try {
      const result = await createTask({
        title: data.title.trim(),
        description: data.description?.trim() ?? '',
        departmentId: data.departmentId || null,
        category: data.category || 'Other',
        assigneeId: data.assigneeId || null,
        reviewerId: null,
        approverId: null,
        priority: data.priority.toLowerCase() as TaskPriorityEnum,
        status: data.assigneeId ? 'assigned' : 'draft',
        startDate: null,
        dueDate: data.dueDate,
        estimatedHours: null,
        isConfidential: false,
        tags: [],
      });
      toast.success(`Task created: ${result.taskNumber}`, {
        description: 'Saved to your workspace. The assignee has been notified.',
      });
      onCreated?.();
      onClose();
    } catch (err: any) {
      const message = err?.message ?? 'Could not create the task.';
      setError('title', { type: 'manual', message });
      toast.error('Task creation failed', { description: message });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="bg-card rounded-2xl shadow-modal w-full max-w-lg modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="PlusIcon" size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-700 text-foreground">Quick Create Task</h2>
              <p className="text-xs text-muted-foreground">
                Task ID auto-generated · Activity logged
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="qc-title" className="block text-sm font-600 text-foreground mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              id="qc-title"
              type="text"
              placeholder="e.g. Prepare Q3 financial summary report"
              className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground ${errors.title ? 'border-red-400' : 'border-border'}`}
              {...register('title', { required: 'Task title is required.' })}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          {/* Dept + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="qc-department"
                className="block text-sm font-600 text-foreground mb-1.5"
              >
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="qc-department"
                disabled={loadingDirectory}
                className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground disabled:opacity-60 ${errors.departmentId ? 'border-red-400' : 'border-border'}`}
                {...register('departmentId', { required: 'Select a department.' })}
              >
                <option value="">{loadingDirectory ? 'Loading…' : 'Select dept.'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-xs text-red-600">{errors.departmentId.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="qc-category"
                className="block text-sm font-600 text-foreground mb-1.5"
              >
                Category
              </label>
              <select
                id="qc-category"
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground"
                {...register('category')}
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="qc-assignee"
                className="block text-sm font-600 text-foreground mb-1.5"
              >
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                id="qc-assignee"
                disabled={loadingDirectory}
                className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground disabled:opacity-60 ${errors.assigneeId ? 'border-red-400' : 'border-border'}`}
                {...register('assigneeId', { required: 'Select an assignee.' })}
              >
                <option value="">{loadingDirectory ? 'Loading…' : 'Select person'}</option>
                {peopleInDepartment.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                    {u.departmentName ? ` — ${u.departmentName}` : ''}
                  </option>
                ))}
              </select>
              {errors.assigneeId && (
                <p className="mt-1 text-xs text-red-600">{errors.assigneeId.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="qc-priority"
                className="block text-sm font-600 text-foreground mb-1.5"
              >
                Priority
              </label>
              <select
                id="qc-priority"
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground"
                {...register('priority')}
              >
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="qc-duedate" className="block text-sm font-600 text-foreground mb-1.5">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              id="qc-duedate"
              type="date"
              className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground ${errors.dueDate ? 'border-red-400' : 'border-border'}`}
              {...register('dueDate', { required: 'Due date is required.' })}
            />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-600">{errors.dueDate.message}</p>
            )}
            {dueDate && (
              <p className="mt-1 text-xs text-muted-foreground">{bsLongDate(dueDate)} BS</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="qc-description"
              className="block text-sm font-600 text-foreground mb-1.5"
            >
              Description
              <span className="text-muted-foreground font-400 ml-1">(optional)</span>
            </label>
            <textarea
              id="qc-description"
              rows={2}
              placeholder="Brief description of the task objective and deliverables…"
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground resize-none"
              {...register('description')}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Task ID auto-assigned · Assignee notified via in-app
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-500 text-secondary-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Icon
                      name="ArrowPathIcon"
                      size={14}
                      className="animate-spin text-primary-foreground"
                    />
                    Creating…
                  </>
                ) : (
                  <>
                    <Icon name="PlusIcon" size={14} className="text-primary-foreground" />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
