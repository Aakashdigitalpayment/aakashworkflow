'use client';

import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const statusData = [
  { name: 'Completed', value: 38, fill: '#16a34a' },
  { name: 'In Progress', value: 89, fill: '#8b5cf6' },
  { name: 'Under Review', value: 22, fill: '#f97316' },
  { name: 'Pending', value: 31, fill: '#f59e0b' },
  { name: 'Overdue', value: 21, fill: '#ef4444' },
  { name: 'Blocked', value: 7, fill: '#dc2626' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl shadow-modal p-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.fill }} />
        <span className="font-600 text-foreground">{item.name}</span>
        <span className="font-700 text-foreground font-tabular ml-1">{item.value}</span>
      </div>
    </div>
  );
}

export default function TaskStatusChart() {
  const total = statusData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-5 h-full">
      <div className="mb-4">
        <h3 className="text-base font-600 text-foreground">Task Status Distribution</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Current snapshot across all departments</p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart
            innerRadius="35%"
            outerRadius="90%"
            data={statusData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'var(--muted)' }} />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-700 font-tabular text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">Total Tasks</span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {statusData.map((item) => (
          <div key={`status-legend-${item.name.toLowerCase().replace(/\s/g, '-')}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.fill }}
                />
              </div>
              <span className="text-xs font-600 font-tabular text-foreground w-6 text-right">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}