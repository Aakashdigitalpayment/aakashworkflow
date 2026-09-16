'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import QuickCreateModal from '../app/dashboard/components/QuickCreateModal';

function ComingSoon({ title, desc }: { title: string; desc: string }) {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-800 text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </div>
        <h2 className="text-base font-700 text-foreground mb-1">Coming Soon</h2>
        <p className="text-sm text-muted-foreground max-w-xs">This module is under development and will be available in the next release.</p>
      </div>
      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}

export default ComingSoon;
