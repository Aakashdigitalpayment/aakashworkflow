'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';
export default function SettingsPage() {
  const [q, setQ] = useState(false);
  return (
    <AppLayout onQuickCreate={() => setQ(true)}>
      <div className="mb-6"><h1 className="text-2xl font-800 text-foreground">Settings</h1><p className="text-sm text-muted-foreground mt-0.5">System configuration and organization settings</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Organization Profile', desc: 'Name, logo, contact details', icon: '🏢' },
          { title: 'Task ID Format', desc: 'Configure task numbering pattern', icon: '🔢' },
          { title: 'Email Configuration', desc: 'SMTP settings for notifications', icon: '📧' },
          { title: 'Reminder Schedule', desc: 'Deadline reminder timing rules', icon: '⏰' },
          { title: 'Escalation Rules', desc: 'Overdue escalation configuration', icon: '📈' },
          { title: 'Backup & Restore', desc: 'Data backup and restore options', icon: '💾' },
        ]?.map(item => (
          <div key={item?.title} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
            <span className="text-2xl mb-3 block">{item?.icon}</span>
            <h3 className="font-700 text-foreground text-sm mb-1">{item?.title}</h3>
            <p className="text-xs text-muted-foreground">{item?.desc}</p>
          </div>
        ))}
      </div>
      {q && <QuickCreateModal onClose={() => setQ(false)} />}
    </AppLayout>
  );
}
