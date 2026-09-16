'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import TaskFiltersBar from './components/TaskFiltersBar';
import TaskDataTable from './components/TaskDataTable';
import CreateTaskModal from './components/CreateTaskModal';
import TaskDetailPanel from './components/TaskDetailPanel';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';
import AppIcon from '@/components/ui/AppIcon';
import type { Task } from './components/taskData';

function TaskManagementContent() {
  const searchParams = useSearchParams();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: searchParams?.get('status') || '',
    priority: '',
    assignee: '',
    dueDate: searchParams?.get('dueDate') || '',
    category: '',
  });

  // Sync URL params when they change (e.g. from KPI card navigation)
  useEffect(() => {
    const status = searchParams?.get('status') || '';
    const dueDate = searchParams?.get('dueDate') || '';
    setFilters(prev => ({ ...prev, status, dueDate }));
  }, [searchParams]);

  // Derive a readable label for the active filter
  const activeFilterLabel = filters.status
    ? filters.status === 'in_progress' ? 'In Progress'
      : filters.status === 'overdue' ? 'Overdue'
      : filters.status === 'blocked' ? 'Blocked'
      : filters.status === 'open' ? 'Open / Unstarted'
      : filters.status === 'completed' ? 'Completed'
      : null
    : filters.dueDate === 'today' ? 'Due Today' : null;

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-700 text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All tasks across departments · FY 2083/84
            {activeFilterLabel && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-600 rounded-full">
                Filtered: {activeFilterLabel}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: '', dueDate: '' }))}
                  className="hover:text-primary/60 transition-colors"
                >
                  <AppIcon name="XMarkIcon" size={11} />
                </button>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-sm font-500 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors">
            <AppIcon name="ArrowDownTrayIcon" size={15} />
            Export
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
          >
            <AppIcon name="PlusIcon" size={15} className="text-primary-foreground" />
            Create Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <TaskFiltersBar filters={filters} onChange={setFilters} />

      {/* Table */}
      <TaskDataTable
        filters={filters}
        onRowClick={(task) => setSelectedTask(task)}
      />

      {/* Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {/* Create Task Modal */}
      {createOpen && <CreateTaskModal onClose={() => setCreateOpen(false)} />}

      {/* Quick Create */}
      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}

export default function TaskManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        </div>
      </div>
    }>
      <TaskManagementContent />
    </Suspense>
  );
}