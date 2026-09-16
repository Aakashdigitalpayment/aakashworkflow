'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';
export default function NotificationsPage() {
  const [q, setQ] = useState(false);
  return (
    <AppLayout onQuickCreate={() => setQ(true)}>
      <div className="mb-6"><h1 className="text-2xl font-800 text-foreground">Notification Settings</h1><p className="text-sm text-muted-foreground mt-0.5">Configure in-app and email notification preferences</p></div>
      <div className="bg-card border border-border rounded-xl p-5 max-w-xl">
        <h3 className="text-sm font-700 text-foreground mb-4">My Notification Preferences</h3>
        <div className="space-y-3">
          {[['New Task Assigned', true], ['Task Forwarded to Me', true], ['Task Sent Back', true], ['Comment Added', true], ['@Mention', true], ['Deadline Reminder (3 days)', true], ['Overdue Alert', true], ['Approval Required', true], ['Task Approved', false]].map(([label, on]) => (
            <div key={label as string} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{label as string}</span>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${on ? 'bg-primary' : 'bg-secondary'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {q && <QuickCreateModal onClose={() => setQ(false)} />}
    </AppLayout>
  );
}
