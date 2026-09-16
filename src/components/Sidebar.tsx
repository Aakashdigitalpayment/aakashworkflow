'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'group-main',
    label: 'Main',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', icon: 'HomeIcon', href: '/dashboard' },
      { id: 'nav-mywork', label: 'My Work', icon: 'ClipboardDocumentCheckIcon', href: '/my-work' },
      { id: 'nav-tasks', label: 'Tasks', icon: 'RectangleStackIcon', href: '/task-management' },
      { id: 'nav-inbox', label: 'Inbox', icon: 'InboxIcon', href: '/inbox' },
      { id: 'nav-calendar', label: 'Calendar', icon: 'CalendarDaysIcon', href: '/calendar' },
    ],
  },
  {
    id: 'group-org',
    label: 'Organization',
    items: [
      { id: 'nav-departments', label: 'Departments', icon: 'BuildingOffice2Icon', href: '/departments' },
      { id: 'nav-workflows', label: 'Workflows', icon: 'ArrowPathIcon', href: '/workflows' },
      { id: 'nav-approval-chains', label: 'Approval Chains', icon: 'ArrowsRightLeftIcon', href: '/approval-chains' },
      { id: 'nav-pending-approvals', label: 'Pending Approvals', icon: 'ClipboardDocumentCheckIcon', href: '/pending-approvals' },
      { id: 'nav-templates', label: 'Templates', icon: 'DocumentDuplicateIcon', href: '/templates' },
    ],
  },
  {
    id: 'group-insight',
    label: 'Insights',
    items: [
      { id: 'nav-reports', label: 'Reports', icon: 'ChartBarIcon', href: '/reports' },
      { id: 'nav-exec-reports', label: 'Executive Reports', icon: 'PresentationChartLineIcon', href: '/executive-reports' },
      { id: 'nav-activity', label: 'Activity Log', icon: 'ClockIcon', href: '/activity-log' },
    ],
  },
  {
    id: 'group-admin',
    label: 'Administration',
    items: [
      { id: 'nav-admin', label: 'Employee Admin', icon: 'UserGroupIcon', href: '/admin' },
      { id: 'nav-users', label: 'Users', icon: 'UsersIcon', href: '/users' },
      { id: 'nav-roles', label: 'Roles & Permissions', icon: 'ShieldCheckIcon', href: '/roles' },
      { id: 'nav-notifications', label: 'Notifications', icon: 'BellIcon', href: '/notifications' },
      { id: 'nav-automation', label: 'Automation', icon: 'BoltIcon', href: '/automation' },
      { id: 'nav-coop-settings', label: 'Cooperative Settings', icon: 'AdjustmentsHorizontalIcon', href: '/cooperative-settings' },
      { id: 'nav-settings', label: 'Settings', icon: 'Cog6ToothIcon', href: '/settings' },
      { id: 'nav-personal-settings', label: 'Personal Settings', icon: 'UserCircleIcon', href: '/personal-settings' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const initials = profile?.avatarInitials ||
    profile?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 3).toUpperCase() || 'U';
  const displayName = profile?.fullName || 'User';
  const displayRole = profile?.position || profile?.role?.replace(/_/g, ' ') || '';

  return (
    <aside
      className={`sidebar-transition flex flex-col bg-card border-r border-border shadow-sidebar h-screen sticky top-0 z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-bold text-sm text-foreground tracking-tight block leading-tight">AakashWorkFlow</span>
            <span className="text-xs text-muted-foreground block leading-tight">Aakash Cooperative</span>
          </div>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
        {navGroups.map((group) => (
          <div key={group.id} className="mb-1">
            {!collapsed && (
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-600 uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </span>
              </div>
            )}
            {collapsed && <div className="my-1 mx-2 border-t border-border" />}
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 mx-2 px-2.5 py-2 rounded-lg text-sm font-500 transition-all duration-150 group ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary' :'text-secondary-foreground hover:bg-secondary hover:text-foreground'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  name={item.icon as any}
                  size={18}
                  className={isActive(item.href) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-full leading-none ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge !== undefined && (
                  <span className={`absolute top-0.5 right-0.5 text-[9px] font-700 w-4 h-4 flex items-center justify-center rounded-full leading-none ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className={`border-t border-border p-3 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-700 text-primary">{initials}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-700 text-primary">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-600 text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{displayRole}</p>
            </div>
            <button className="p-1 rounded hover:bg-secondary transition-colors">
              <Icon name="EllipsisVerticalIcon" size={16} className="text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-card hover:shadow-card-hover transition-all duration-150 z-50"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon
          name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
          size={12}
          className="text-muted-foreground"
        />
      </button>
    </aside>
  );
}