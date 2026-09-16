'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface CreateTaskFormData {
  title: string;
  description: string;
  department: string;
  category: string;
  assignee: string;
  reviewer: string;
  approver: string;
  priority: string;
  startDate: string;
  dueDate: string;
  estimatedHours: string;
  confidentiality: string;
  tags: string;
  parentTask: string;
  relatedTask: string;
}

interface CreateTaskModalProps {
  onClose: () => void;
}

const departments = ['Administration', 'Finance/Accounts', 'Credit/Loan', 'Recovery', 'Membership/Service', 'HR', 'IT', 'Marketing'];
const employees = ['Sita Rana', 'Binod Karki', 'Dipak Magar', 'Kamala Thapa', 'Suresh Pradhan', 'Anita Shrestha', 'Puja Tamang', 'Bikash Gurung', 'Narayan Paudel', 'Rajesh K. Shrestha'];
const categories = ['Financial Reporting', 'Loan Processing', 'Board/Meeting', 'Recovery', 'HR/Onboarding', 'IT/Infrastructure', 'Procurement', 'Marketing/Communication', 'Membership/KYC', 'Audit/Compliance', 'Other'];

const steps = ['Basic Info', 'Assignment', 'Dates & Scope', 'Review'];

export default function CreateTaskModal({ onClose }: CreateTaskModalProps) {
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData>({
    defaultValues: { priority: 'Medium', confidentiality: 'Department' },
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const formValues = watch();

  const nextStep = async () => {
    const fieldsToValidate: (keyof CreateTaskFormData)[][] = [
      ['title', 'description', 'department', 'category'],
      ['assignee', 'priority'],
      ['dueDate'],
      [],
    ];
    const valid = await trigger(fieldsToValidate[step]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    // BACKEND INTEGRATION POINT: POST /api/tasks with full task payload
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Task created successfully!', {
      description: `Task ID auto-generated for ${data.department} dept. ${data.assignee} has been notified.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-card rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-700 text-foreground">Create New Task</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Task ID auto-generated · All fields logged to activity trail</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <React.Fragment key={`step-prog-${s.replace(/\s/g, '-').toLowerCase()}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-700 transition-all ${
                    i < step ? 'bg-green-500 text-white' :
                    i === step ? 'bg-primary text-primary-foreground': 'bg-secondary text-muted-foreground'
                  }`}>
                    {i < step ? <Icon name="CheckIcon" size={11} className="text-white" /> : i + 1}
                  </div>
                  <span className={`text-xs font-500 hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-500' : 'bg-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-5 space-y-4">

            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className="space-y-4 fade-in">
                <div>
                  <label htmlFor="ct-title" className="block text-sm font-600 text-foreground mb-1.5">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ct-title"
                    type="text"
                    placeholder="e.g. Prepare Q3 financial summary for board meeting"
                    className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground ${errors.title ? 'border-red-400' : 'border-border'}`}
                    {...register('title', { required: 'Task title is required.' })}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <label htmlFor="ct-description" className="block text-sm font-600 text-foreground mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-1.5">Describe the task objective, deliverables, and any special instructions.</p>
                  <textarea
                    id="ct-description"
                    rows={3}
                    placeholder="Detailed description of what needs to be done, expected output, and any dependencies…"
                    className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground resize-none ${errors.description ? 'border-red-400' : 'border-border'}`}
                    {...register('description', { required: 'Task description is required.' })}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ct-department" className="block text-sm font-600 text-foreground mb-1.5">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ct-department"
                      className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground ${errors.department ? 'border-red-400' : 'border-border'}`}
                      {...register('department', { required: 'Select a department.' })}
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={`ct-dept-${d.replace(/\//g, '-').toLowerCase()}`} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="ct-category" className="block text-sm font-600 text-foreground mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ct-category"
                      className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground ${errors.category ? 'border-red-400' : 'border-border'}`}
                      {...register('category', { required: 'Select a category.' })}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={`ct-cat-${c.replace(/\//g, '-').toLowerCase()}`} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="ct-confidentiality" className="block text-sm font-600 text-foreground mb-1.5">
                    Confidentiality Level
                  </label>
                  <p className="text-xs text-muted-foreground mb-1.5">Controls who can view this task.</p>
                  <select
                    id="ct-confidentiality"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground"
                    {...register('confidentiality')}
                  >
                    <option value="Organization">Organization — All staff can view</option>
                    <option value="Department">Department — Only department members</option>
                    <option value="Management">Management — Manager level and above</option>
                    <option value="Private">Private — Assigned users only</option>
                    <option value="Confidential">Confidential — Special permission required</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ct-parenttask" className="block text-sm font-600 text-foreground mb-1.5">
                      Parent Task
                      <span className="text-muted-foreground font-400 ml-1 text-xs">(optional)</span>
                    </label>
                    <input
                      id="ct-parenttask"
                      type="text"
                      placeholder="e.g. FIN-2083-00400"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground"
                      {...register('parentTask')}
                    />
                  </div>
                  <div>
                    <label htmlFor="ct-relatedtask" className="block text-sm font-600 text-foreground mb-1.5">
                      Related Task
                      <span className="text-muted-foreground font-400 ml-1 text-xs">(optional)</span>
                    </label>
                    <input
                      id="ct-relatedtask"
                      type="text"
                      placeholder="e.g. CREDIT-2083-00310"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground"
                      {...register('relatedTask')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Assignment */}
            {step === 1 && (
              <div className="space-y-4 fade-in">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                  <p className="text-xs text-amber-700">
                    <span className="font-600">Primary Assignee</span> holds full accountability. Collaborators assist but the primary assignee is responsible for delivery.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ct-assignee" className="block text-sm font-600 text-foreground mb-1.5">
                      Primary Assignee <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ct-assignee"
                      className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground ${errors.assignee ? 'border-red-400' : 'border-border'}`}
                      {...register('assignee', { required: 'Select primary assignee.' })}
                    >
                      <option value="">Select person</option>
                      {employees.map((e) => (
                        <option key={`ct-asgn-${e.replace(/\s/g, '-').toLowerCase()}`} value={e}>{e}</option>
                      ))}
                    </select>
                    {errors.assignee && <p className="mt-1 text-xs text-red-600">{errors.assignee.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="ct-priority" className="block text-sm font-600 text-foreground mb-1.5">Priority</label>
                    <select
                      id="ct-priority"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground"
                      {...register('priority')}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ct-reviewer" className="block text-sm font-600 text-foreground mb-1.5">
                      Reviewer
                      <span className="text-muted-foreground font-400 ml-1 text-xs">(reviews before approval)</span>
                    </label>
                    <select
                      id="ct-reviewer"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground"
                      {...register('reviewer')}
                    >
                      <option value="">Select reviewer</option>
                      {employees.map((e) => (
                        <option key={`ct-rev-${e.replace(/\s/g, '-').toLowerCase()}`} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ct-approver" className="block text-sm font-600 text-foreground mb-1.5">
                      Approver
                      <span className="text-muted-foreground font-400 ml-1 text-xs">(final sign-off)</span>
                    </label>
                    <select
                      id="ct-approver"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground"
                      {...register('approver')}
                    >
                      <option value="">Select approver</option>
                      {employees.map((e) => (
                        <option key={`ct-app-${e.replace(/\s/g, '-').toLowerCase()}`} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="ct-tags" className="block text-sm font-600 text-foreground mb-1.5">Tags</label>
                  <p className="text-xs text-muted-foreground mb-1.5">Comma-separated tags for search and filtering (e.g. monthly, finance, urgent)</p>
                  <input
                    id="ct-tags"
                    type="text"
                    placeholder="monthly, finance, loan, urgent"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground"
                    {...register('tags')}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Dates & Scope */}
            {step === 2 && (
              <div className="space-y-4 fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ct-startdate" className="block text-sm font-600 text-foreground mb-1.5">Start Date</label>
                    <input
                      id="ct-startdate"
                      type="date"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground"
                      {...register('startDate')}
                    />
                  </div>
                  <div>
                    <label htmlFor="ct-duedate" className="block text-sm font-600 text-foreground mb-1.5">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="ct-duedate"
                      type="date"
                      className={`w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground ${errors.dueDate ? 'border-red-400' : 'border-border'}`}
                      {...register('dueDate', { required: 'Due date is required.' })}
                    />
                    {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="ct-hours" className="block text-sm font-600 text-foreground mb-1.5">
                    Estimated Duration
                    <span className="text-muted-foreground font-400 ml-1 text-xs">(in hours)</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-1.5">Helps with workload planning and SLA tracking.</p>
                  <input
                    id="ct-hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="e.g. 4"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground"
                    {...register('estimatedHours')}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-xs font-600 text-blue-700 mb-2 flex items-center gap-1.5">
                    <Icon name="InformationCircleIcon" size={14} className="text-blue-600" />
                    Deadline Alerts (Auto-configured)
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      '3 days before due → In-app + Email reminder to assignee',
                      '1 day before due → In-app + Email reminder to assignee',
                      'Due date → In-app alert + Email to assignee + Department Head',
                      'Overdue 1 day → Assignee reminder',
                      'Overdue 2 days → Department Head notification',
                      'Overdue 3+ days → CEO/Manager escalation',
                    ].map((alert, i) => (
                      <div key={`alert-${i + 1}`} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-blue-600">{alert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4 fade-in">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-2">
                  <p className="text-xs text-green-700 font-500">
                    Review all details before creating. Once created, task ID is auto-generated, assignee is notified, and all actions are logged to the activity trail.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { section: 'Task Info', items: [
                      { label: 'Title', value: formValues.title || '—' },
                      { label: 'Department', value: formValues.department || '—' },
                      { label: 'Category', value: formValues.category || '—' },
                      { label: 'Confidentiality', value: formValues.confidentiality || '—' },
                    ]},
                    { section: 'Assignment', items: [
                      { label: 'Assignee', value: formValues.assignee || '—' },
                      { label: 'Priority', value: formValues.priority || '—' },
                      { label: 'Reviewer', value: formValues.reviewer || 'Not set' },
                      { label: 'Approver', value: formValues.approver || 'Not set' },
                    ]},
                    { section: 'Dates', items: [
                      { label: 'Start Date', value: formValues.startDate || 'Not set' },
                      { label: 'Due Date', value: formValues.dueDate || '—' },
                      { label: 'Est. Duration', value: formValues.estimatedHours ? `${formValues.estimatedHours} hours` : 'Not set' },
                    ]},
                  ].map((section) => (
                    <div key={`review-${section.section.toLowerCase().replace(/\s/g, '-')}`} className="bg-muted/40 rounded-xl p-3.5">
                      <h4 className="text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-2">{section.section}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {section.items.map((item) => (
                          <div key={`review-item-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
                            <p className="text-sm font-500 text-foreground truncate">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-muted/20">
            <button
              type="button"
              onClick={() => step > 0 ? setStep(step - 1) : onClose()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-500 text-secondary-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <Icon name="ChevronLeftIcon" size={14} />
              {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all"
              >
                Next
                <Icon name="ChevronRightIcon" size={14} className="text-primary-foreground" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-600 rounded-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="ArrowPathIcon" size={14} className="animate-spin text-white" />
                    Creating Task…
                  </>
                ) : (
                  <>
                    <Icon name="CheckIcon" size={14} className="text-white" />
                    Create Task
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}