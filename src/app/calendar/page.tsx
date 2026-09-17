'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

interface CalendarTask {
  id: string;
  title: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  statusClass: string;
  day: number;
  time: string;
  color: string;
  dotColor: string;
}

const calendarTasks: CalendarTask[] = [
  { id: 'ADM-2083-00125', title: 'AGM Agenda Preparation', department: 'Administration', priority: 'High', status: 'In Progress', statusClass: 'status-inprogress', day: 16, time: '10:00 AM', color: 'bg-violet-50 border-violet-200 text-violet-700', dotColor: 'bg-violet-500' },
  { id: 'FIN-2083-00431', title: 'Monthly MIS Report', department: 'Finance', priority: 'Critical', status: 'Under Review', statusClass: 'status-review', day: 16, time: '02:00 PM', color: 'bg-orange-50 border-orange-200 text-orange-700', dotColor: 'bg-orange-500' },
  { id: 'CRD-2083-00187', title: 'Loan Application Review', department: 'Credit', priority: 'High', status: 'Blocked', statusClass: 'status-blocked', day: 16, time: '11:30 AM', color: 'bg-red-50 border-red-200 text-red-700', dotColor: 'bg-red-500' },
  { id: 'HR-2083-00089', title: 'Employee Onboarding Docs', department: 'HR', priority: 'Medium', status: 'Accepted', statusClass: 'status-accepted', day: 18, time: '09:00 AM', color: 'bg-cyan-50 border-cyan-200 text-cyan-700', dotColor: 'bg-cyan-500' },
  { id: 'REC-2083-00055', title: 'Recovery Report — Bhadra', department: 'Recovery', priority: 'High', status: 'In Progress', statusClass: 'status-inprogress', day: 18, time: '03:00 PM', color: 'bg-amber-50 border-amber-200 text-amber-700', dotColor: 'bg-amber-500' },
  { id: 'ADM-2083-00130', title: 'Board Meeting Preparation', department: 'Administration', priority: 'Critical', status: 'Assigned', statusClass: 'status-assigned', day: 20, time: '10:00 AM', color: 'bg-blue-50 border-blue-200 text-blue-700', dotColor: 'bg-blue-500' },
  { id: 'FIN-2083-00440', title: 'Quarterly Financial Review', department: 'Finance', priority: 'High', status: 'Draft', statusClass: 'status-draft', day: 22, time: '02:30 PM', color: 'bg-slate-50 border-slate-200 text-slate-700', dotColor: 'bg-slate-500' },
  { id: 'CRD-2083-00200', title: 'Credit Committee Meeting', department: 'Credit', priority: 'Critical', status: 'Assigned', statusClass: 'status-assigned', day: 22, time: '11:00 AM', color: 'bg-blue-50 border-blue-200 text-blue-700', dotColor: 'bg-blue-500' },
  { id: 'IT-2083-00031', title: 'System Backup Verification', department: 'IT', priority: 'Medium', status: 'In Progress', statusClass: 'status-inprogress', day: 25, time: '09:30 AM', color: 'bg-violet-50 border-violet-200 text-violet-700', dotColor: 'bg-violet-500' },
  { id: 'HR-2083-00095', title: 'Performance Review Cycle', department: 'HR', priority: 'Medium', status: 'Draft', statusClass: 'status-draft', day: 28, time: '02:00 PM', color: 'bg-slate-50 border-slate-200 text-slate-700', dotColor: 'bg-slate-500' },
];

const nepaliDays = ['Aaita', 'Sombar', 'Mangal', 'Budha', 'Bihibar', 'Sukrabar', 'Shanibar'];
const nepaliDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const priorityColors: Record<string, string> = {
  Critical: 'priority-critical',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

export default function CalendarPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(16);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  const today = 16;
  const daysInMonth = 30;
  // Ashwin 2083 starts on Sunday (offset 0)
  const startOffset = 0;

  const tasksByDay: Record<number, CalendarTask[]> = {};
  calendarTasks.forEach(t => {
    if (!tasksByDay[t.day]) tasksByDay[t.day] = [];
    tasksByDay[t.day].push(t);
  });

  const selectedTasks = selectedDay ? (tasksByDay[selectedDay] ?? []) : [];

  const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      <PreviewNotice module="Calendar" />
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Ashwin 2083 BS &nbsp;·&nbsp; {calendarTasks.length} tasks scheduled this month</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg p-1">
            {(['month', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-xs font-600 rounded-md capitalize transition-all ${viewMode === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {v === 'month' ? 'Month' : 'List'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-600 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm">
            <AppIcon name="PlusIcon" size={14} />
            Add Task
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            {/* Month Nav */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-700 text-foreground">Ashwin 2083</h2>
                <p className="text-xs text-muted-foreground">September–October 2026</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <AppIcon name="ChevronLeftIcon" size={16} className="text-muted-foreground" />
                </button>
                <button className="px-3 py-1.5 text-xs font-600 text-primary bg-primary/10 rounded-lg hover:bg-primary/15 transition-colors">Today</button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <AppIcon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {nepaliDaysShort.map(d => (
                <div key={d} className="text-center py-1">
                  <span className="text-[11px] font-700 text-muted-foreground uppercase tracking-wide">{d}</span>
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalCells }, (_, i) => {
                const day = i - startOffset + 1;
                const isValid = day >= 1 && day <= daysInMonth;
                const isToday = day === today;
                const isSelected = day === selectedDay;
                const tasks = tasksByDay[day] ?? [];
                const hasOverdue = tasks.some(t => t.statusClass === 'status-blocked');

                return (
                  <div
                    key={i}
                    onClick={() => isValid && setSelectedDay(day)}
                    className={`min-h-[64px] rounded-xl p-1.5 flex flex-col transition-all ${
                      isValid ? 'cursor-pointer hover:bg-secondary/60' : ''
                    } ${isSelected && isValid ? 'bg-primary/8 ring-1 ring-primary/30' : ''} ${
                      isToday ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {isValid && (
                      <>
                        <span className={`text-xs font-600 w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                          isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                        }`}>
                          {day}
                        </span>
                        <div className="flex flex-wrap gap-0.5">
                          {tasks.slice(0, 3).map((t, ti) => (
                            <div key={ti} className={`w-1.5 h-1.5 rounded-full ${t.dotColor}`} />
                          ))}
                          {tasks.length > 3 && (
                            <span className="text-[9px] text-muted-foreground font-600">+{tasks.length - 3}</span>
                          )}
                        </div>
                        {hasOverdue && (
                          <div className="mt-auto">
                            <div className="w-1 h-1 rounded-full bg-red-500 ml-auto" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              {[
                { color: 'bg-violet-500', label: 'In Progress' },
                { color: 'bg-orange-500', label: 'Under Review' },
                { color: 'bg-red-500', label: 'Blocked' },
                { color: 'bg-blue-500', label: 'Assigned' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="text-[11px] text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day Detail Panel */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-700 text-foreground">
                  {selectedDay ? `${selectedDay} Ashwin 2083` : 'Select a day'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              {selectedDay === today && (
                <span className="text-[10px] font-700 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Today</span>
              )}
            </div>

            {selectedTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                  <AppIcon name="CalendarDaysIcon" size={22} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-600 text-foreground mb-1">No tasks</p>
                <p className="text-xs text-muted-foreground">No tasks scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto scrollbar-thin">
                {selectedTasks.map(task => (
                  <div key={task.id} className={`p-3 rounded-xl border ${task.color} transition-all hover:shadow-sm cursor-pointer`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs font-700 text-foreground leading-snug flex-1">{task.title}</p>
                      <span className={`text-[9px] font-700 px-1.5 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{task.department}</span>
                      <span className="text-[10px] font-600 text-muted-foreground">{task.time}</span>
                    </div>
                    <div className="mt-1.5">
                      <span className={`text-[10px] font-600 px-1.5 py-0.5 rounded-full ${task.statusClass}`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-700 text-foreground">All Tasks — Ashwin 2083</h3>
          </div>
          <div className="divide-y divide-border">
            {calendarTasks.sort((a, b) => a.day - b.day).map(task => (
              <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="w-10 text-center flex-shrink-0">
                  <p className={`text-lg font-700 leading-none ${task.day === today ? 'text-primary' : 'text-foreground'}`}>{task.day}</p>
                  <p className="text-[10px] text-muted-foreground">Ashwin</p>
                </div>
                <div className={`w-0.5 h-10 rounded-full ${task.dotColor} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.id} &nbsp;·&nbsp; {task.department} &nbsp;·&nbsp; {task.time}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
                  <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${task.statusClass}`}>{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
