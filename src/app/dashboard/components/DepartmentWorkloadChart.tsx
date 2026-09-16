'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';

const deptData = [
  { dept: 'Finance', open: 28, inProgress: 19, overdue: 6 },
  { dept: 'Credit', open: 34, inProgress: 24, overdue: 8 },
  { dept: 'Admin', open: 21, inProgress: 15, overdue: 3 },
  { dept: 'Recovery', open: 18, inProgress: 11, overdue: 5 },
  { dept: 'HR', open: 14, inProgress: 9, overdue: 2 },
  { dept: 'IT', open: 11, inProgress: 7, overdue: 1 },
  { dept: 'Marketing', open: 9, inProgress: 6, overdue: 2 },
  { dept: 'Membership', open: 16, inProgress: 8, overdue: 3 },
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-modal p-3 text-xs min-w-[140px]">
      <p className="font-600 text-foreground mb-2">{label} Dept.</p>
      {payload.map((entry) => (
        <div key={`tt-${entry.name}`} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-600 text-foreground font-tabular">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DepartmentWorkloadChart() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-sm font-600 text-foreground">Department Workload</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Open, in-progress, and overdue tasks by department</p>
        </div>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors border border-transparent hover:border-border">
          <Icon name="ArrowDownTrayIcon" size={13} />
          Export
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={deptData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="gradProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="gradOverdue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="dept"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)', paddingTop: 12 }}
            />
            <Bar dataKey="open" name="Open" fill="url(#gradOpen)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="inProgress" name="In Progress" fill="url(#gradProgress)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="overdue" name="Overdue" fill="url(#gradOverdue)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}