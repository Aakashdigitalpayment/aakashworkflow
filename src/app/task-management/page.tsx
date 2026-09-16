'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import TaskFiltersBar from './components/TaskFiltersBar';
import TaskDataTable from './components/TaskDataTable';
import CreateTaskModal from './components/CreateTaskModal';
import TaskDetailPanel from './components/TaskDetailPanel';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';
import type { Task } from './components/taskData';

export default function TaskManagementPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    priority: '',
    assignee: '',
    dueDate: '',
    category: '',
  });

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All tasks across departments · FY 2083/84 · 247 total tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-sm font-500 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors">
            <Icon name="ArrowDownTrayIcon" size={15} />
            Export
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
          >
            <Icon name="PlusIcon" size={15} className="text-primary-foreground" />
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

function Icon({ name, size = 16, className = '' }: { name: string; size?: number; className?: string }) {
  const AppIcon = require('@/components/ui/AppIcon').default;
  return <AppIcon name={name} size={size} className={className} />;
}