'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardKPIGrid from './components/DashboardKPIGrid';
import DashboardChartsRow from './components/DashboardChartsRow';
import OverdueTasksList from './components/OverdueTasksList';
import DueTodayList from './components/DueTodayList';
import RecentActivityFeed from './components/RecentActivityFeed';
import QuickCreateModal from './components/QuickCreateModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router?.replace('/login-screen');
    }
  }, [user, loading, router]);

  const getGreeting = () => {
    const hour = new Date()?.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.fullName?.split(' ')?.[0] || 'there';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-700 text-foreground">{getGreeting()}, {firstName} 👋</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here's what's happening across your workspace today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>Live sync</span>
          </div>
          <select className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer">
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-fy">FY 2083/84</option>
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <DashboardKPIGrid />

      {/* Charts Row */}
      <DashboardChartsRow />

      {/* Bottom Three-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <OverdueTasksList />
        <DueTodayList />
        <RecentActivityFeed />
      </div>

      {quickCreateOpen && (
        <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />
      )}
    </AppLayout>
  );
}