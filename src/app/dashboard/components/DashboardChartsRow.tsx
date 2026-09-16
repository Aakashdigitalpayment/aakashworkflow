'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DepartmentWorkloadChart = dynamic(() => import('./DepartmentWorkloadChart'), { ssr: false });
const TaskStatusChart = dynamic(() => import('./TaskStatusChart'), { ssr: false });

export default function DashboardChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 gap-5 mb-5">
      <div className="lg:col-span-3 xl:col-span-3">
        <DepartmentWorkloadChart />
      </div>
      <div className="lg:col-span-2 xl:col-span-2">
        <TaskStatusChart />
      </div>
    </div>
  );
}