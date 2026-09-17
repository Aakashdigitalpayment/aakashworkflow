'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  type TaskFilters,
  type DirectoryDepartment,
  TASK_CATEGORIES,
  TASK_STATUS_LABELS,
  statusEnum,
} from '@/lib/tasks';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  departments: DirectoryDepartment[];
  onChange: (filters: TaskFilters) => void;
}

const priorities = ['Critical', 'High', 'Medium', 'Low'];

export default function TaskFiltersBar({ filters, departments, onChange }: TaskFiltersBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (key: keyof TaskFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () =>
    onChange({
      search: '',
      departmentId: '',
      status: '',
      priority: '',
      dueDate: '',
      category: '',
    });

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'search' && v !== ''
  ).length;

  return (
    <div className="bg-card border border-border rounded-xl shadow-card mb-4 overflow-hidden">
      {/* Search + Toggle Row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
        <div className="relative flex-1 max-w-sm">
          <Icon
            name="MagnifyingGlassIcon"
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search by Task ID, title, assignee, tag…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-500 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Icon name="XMarkIcon" size={13} />
              Clear
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-500 rounded-lg border transition-all ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-background text-secondary-foreground border-border hover:bg-secondary'
            }`}
          >
            <Icon name="FunnelIcon" size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 text-[10px] font-700 bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="px-4 py-3 bg-muted/30 fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-1">
                Department
              </label>
              <select
                value={filters.departmentId}
                onChange={(e) => update('departmentId', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
              >
                <option value="">All Statuses</option>
                <option value="open">Open / Unstarted</option>
                <option value="overdue">Overdue</option>
                {TASK_STATUS_LABELS.map((label) => (
                  <option key={label} value={statusEnum(label)}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => update('priority', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
              >
                <option value="">All Priorities</option>
                {priorities.map((p) => (
                  <option key={p} value={p.toLowerCase()}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
              >
                <option value="">All Categories</option>
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-1">
                Due Date
              </label>
              <select
                value={filters.dueDate}
                onChange={(e) => update('dueDate', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
              >
                <option value="">Any Date</option>
                <option value="today">Due Today</option>
                <option value="tomorrow">Due Tomorrow</option>
                <option value="this-week">Due in 7 Days</option>
                <option value="overdue">Overdue</option>
                <option value="no-date">No Due Date</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[10px] font-600 text-muted-foreground uppercase tracking-wide">
                Active:
              </span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === 'search') return null;
                const display =
                  key === 'departmentId'
                    ? (departments.find((d) => d.id === value)?.name ?? value)
                    : value;
                return (
                  <span
                    key={`chip-${key}`}
                    className="inline-flex items-center gap-1 text-xs font-500 bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {display}
                    <button
                      onClick={() => update(key as keyof TaskFilters, '')}
                      className="hover:text-primary/70 transition-colors"
                    >
                      <Icon name="XMarkIcon" size={11} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
