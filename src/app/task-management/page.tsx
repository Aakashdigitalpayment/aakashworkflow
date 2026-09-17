'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import TaskFiltersBar from './components/TaskFiltersBar';
import TaskDataTable from './components/TaskDataTable';
import CreateTaskModal from './components/CreateTaskModal';
import TaskDetailPanel from './components/TaskDetailPanel';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';
import AppIcon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import {
  type Task,
  type TaskFilters,
  type TaskStatusEnum,
  type DirectoryDepartment,
  EMPTY_FILTERS,
  fetchTasks,
  fetchTaskDirectory,
  updateTaskStatus,
  deleteTask,
  statusLabel,
} from '@/lib/tasks';
import { fiscalYearLabel } from '@/lib/date';

function TaskManagementContent() {
  const searchParams = useSearchParams();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<DirectoryDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    ...EMPTY_FILTERS,
    status: searchParams?.get('status') || '',
    dueDate: searchParams?.get('dueDate') || '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchTasks();
      setTasks(rows);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetchTaskDirectory()
      .then((directory) => setDepartments(directory.departments))
      .catch(() => setDepartments([]));
  }, [load]);

  // Sync URL params when they change (e.g. from KPI card navigation)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: searchParams?.get('status') || '',
      dueDate: searchParams?.get('dueDate') || '',
    }));
  }, [searchParams]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const handleStatusChange = useCallback(
    async (task: Task, status: TaskStatusEnum) => {
      await updateTaskStatus(task.id, status);
      await load();
    },
    [load]
  );

  const handleDelete = useCallback(
    async (task: Task) => {
      try {
        await deleteTask(task.id);
        toast.success(`Deleted ${task.taskId}`);
        if (selectedTaskId === task.id) setSelectedTaskId(null);
        await load();
      } catch (err: any) {
        toast.error('Delete failed', { description: err?.message });
        throw err;
      }
    },
    [load, selectedTaskId]
  );

  const activeFilterLabel =
    filters.status === 'overdue'
      ? 'Overdue'
      : filters.status === 'open'
        ? 'Open / Unstarted'
        : filters.status
          ? statusLabel(filters.status)
          : filters.dueDate === 'today'
            ? 'Due Today'
            : null;

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-700 text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All tasks across departments · FY {fiscalYearLabel()}/
            {(Number(fiscalYearLabel()) + 1) % 100}
            {activeFilterLabel && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-600 rounded-full">
                Filtered: {activeFilterLabel}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, status: '', dueDate: '' }))}
                  className="hover:text-primary/60 transition-colors"
                >
                  <AppIcon name="XMarkIcon" size={11} />
                </button>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-sm font-500 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-60"
          >
            <AppIcon name="ArrowPathIcon" size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
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

      <TaskFiltersBar filters={filters} departments={departments} onChange={setFilters} />

      <TaskDataTable
        tasks={tasks}
        loading={loading}
        error={error}
        filters={filters}
        onRowClick={(task) => setSelectedTaskId(task.id)}
        onRefresh={load}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onStatusChange={handleStatusChange}
          onRefresh={load}
        />
      )}

      {createOpen && <CreateTaskModal onClose={() => setCreateOpen(false)} onCreated={load} />}

      {quickCreateOpen && (
        <QuickCreateModal onClose={() => setQuickCreateOpen(false)} onCreated={load} />
      )}
    </AppLayout>
  );
}

export default function TaskManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-muted-foreground">Loading tasks…</p>
          </div>
        </div>
      }
    >
      <TaskManagementContent />
    </Suspense>
  );
}
