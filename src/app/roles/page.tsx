'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';
export default function RolesPage() {
  const [q, setQ] = useState(false);
  const roles = [
    {
      name: 'Super Administrator',
      users: 1,
      color: 'bg-red-500',
      perms: ['Full system access', 'User management', 'Configuration'],
    },
    {
      name: 'CEO / General Manager',
      users: 1,
      color: 'bg-primary',
      perms: ['All tasks visibility', 'Approve tasks', 'Reports'],
    },
    {
      name: 'Department Head',
      users: 4,
      color: 'bg-purple-500',
      perms: ['Department tasks', 'Assign to team', 'Review & approve'],
    },
    {
      name: 'Officer',
      users: 3,
      color: 'bg-blue-500',
      perms: ['Assigned tasks', 'Forward tasks', 'Comments'],
    },
    {
      name: 'Employee',
      users: 8,
      color: 'bg-green-500',
      perms: ['Own tasks only', 'Progress update', 'Comments'],
    },
    {
      name: 'Auditor',
      users: 1,
      color: 'bg-amber-500',
      perms: ['Read-only access', 'View reports', 'Activity logs'],
    },
  ];
  return (
    <AppLayout onQuickCreate={() => setQ(true)}>
      <PreviewNotice
        module="Roles & Permissions"
        note="The permission matrix shown is illustrative. Actual access is enforced by Supabase RLS."
      />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-800 text-foreground">Roles &amp; Permissions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage role-based access control</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles?.map((role) => (
          <div
            key={role?.name}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl ${role?.color} flex items-center justify-center`}>
                <span className="text-white font-800 text-sm">{role?.name?.[0]}</span>
              </div>
              <div>
                <h3 className="font-700 text-foreground text-sm">{role?.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {role?.users} user{role?.users !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {role?.perms?.map((p) => (
                <div key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-border" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {q && <QuickCreateModal onClose={() => setQ(false)} />}
    </AppLayout>
  );
}
