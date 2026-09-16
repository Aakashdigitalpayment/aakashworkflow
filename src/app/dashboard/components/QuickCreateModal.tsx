'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface QuickCreateFormData {
  title: string;
  department: string;
  assignee: string;
  priority: string;
  dueDate: string;
  description: string;
}

interface QuickCreateModalProps {
  onClose: () => void;
}

const departments = ['Administration', 'Finance/Accounts', 'Credit/Loan', 'Recovery', 'Membership', 'HR', 'IT', 'Marketing'];
const employees = ['Sita Rana', 'Binod Karki', 'Dipak Magar', 'Kamala Thapa', 'Suresh Pradhan', 'Anita Shrestha', 'Puja Tamang', 'Bikash Gurung'];

export default function QuickCreateModal({ onClose }: QuickCreateModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QuickCreateFormData>();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const onSubmit = async (data: QuickCreateFormData) => {
    // BACKEND INTEGRATION POINT: POST /api/tasks with task data
    await new Promise((r) => setTimeout(r, 800));
    toast.success(`Task created: ${data.title}`, { description: 'Task ID auto-generated. Assignee notified.' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-card rounded-2xl shadow-modal w-full max-w-lg modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="PlusIcon" size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-700 text-foreground">Quick Create Task</h2>
              <p className="text-xs text-muted-foreground">Task ID auto-generated · Activity logged</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
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
              <label htmlFor="qc-department" className="block text-sm font-600 text-foreground mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="qc-department"
                className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground ${errors.department ? 'border-red-400' : 'border-border'}`}
                {...register('department', { required: 'Select a department.' })}
              >
                <option value="">Select dept.</option>
                {departments.map((d) => (
                  <option key={`dept-opt-${d.toLowerCase().replace(/\//g, '-')}`} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
            </div>
            <div>
              <label htmlFor="qc-priority" className="block text-sm font-600 text-foreground mb-1.5">Priority</label>
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

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qc-assignee" className="block text-sm font-600 text-foreground mb-1.5">
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                id="qc-assignee"
                className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground ${errors.assignee ? 'border-red-400' : 'border-border'}`}
                {...register('assignee', { required: 'Select an assignee.' })}
              >
                <option value="">Select person</option>
                {employees.map((e) => (
                  <option key={`emp-opt-${e.replace(/\s/g, '-').toLowerCase()}`} value={e}>{e}</option>
                ))}
              </select>
              {errors.assignee && <p className="mt-1 text-xs text-red-600">{errors.assignee.message}</p>}
            </div>
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
              {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="qc-description" className="block text-sm font-600 text-foreground mb-1.5">
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
                    <Icon name="ArrowPathIcon" size={14} className="animate-spin text-primary-foreground" />
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