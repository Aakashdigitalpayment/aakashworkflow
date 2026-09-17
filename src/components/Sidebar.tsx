'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole, MANAGEMENT_ROLES, AUDIT_ROLES, type UserRole } from '@/lib/access';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  roles?: UserRole[];
  hint?: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Menu visibility is a UX convenience only — the real boundary is the
 * middleware route gate plus Supabase RLS. Roles listed here must stay in
 * sync with `ROUTE_ACCESS` in src/lib/access.ts.
 */
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
      {
        id: 'nav-departments',
        label: 'Departments',
        icon: 'BuildingOffice2Icon',
        href: '/departments',
        roles: MANAGEMENT_ROLES,
      },
      { id: 'nav-workflows', label: 'Workflows', icon: 'ArrowPathIcon', href: '/workflows' },
      {
        id: 'nav-approval-chains',
        label: 'Approval Chains',
        icon: 'ArrowsRightLeftIcon',
        href: '/approval-chains',
      },
      {
        id: 'nav-pending-approvals',
        label: 'Pending Approvals',
        icon: 'ClipboardDocumentCheckIcon',
        href: '/pending-approvals',
      },
      {
        id: 'nav-templates',
        label: 'Templates',
        icon: 'DocumentDuplicateIcon',
        href: '/templates',
      },
    ],
  },
  {
    id: 'group-insight',
    label: 'Insights',
    items: [
      {
        id: 'nav-reports',
        label: 'Reports',
        icon: 'ChartBarIcon',
        href: '/reports',
        hint: 'Daily operations reporting',
      },
      {
        id: 'nav-exec-reports',
        label: 'Executive Reports',
        icon: 'PresentationChartLineIcon',
        href: '/executive-reports',
        roles: MANAGEMENT_ROLES,
        hint: 'Board-level summaries',
      },
      {
        id: 'nav-activity',
        label: 'Activity Log',
        icon: 'ClockIcon',
        href: '/activity-log',
        roles: AUDIT_ROLES,
      },
      {
        id: 'nav-compliance',
        label: 'Compliance',
        icon: 'ShieldCheckIcon',
        href: '/compliance',
        roles: AUDIT_ROLES,
      },
    ],
  },
  {
    id: 'group-personal',
    label: 'Personal',
    items: [
      { id: 'nav-notifications', label: 'Notifications', icon: 'BellIcon', href: '/notifications' },
      {
        id: 'nav-personal-settings',
        label: 'Personal Settings',
        icon: 'UserCircleIcon',
        href: '/personal-settings',
      },
      { id: 'nav-settings', label: 'Settings', icon: 'Cog6ToothIcon', href: '/settings' },
    ],
  },
  {
    id: 'group-admin',
    label: 'Administration',
    items: [
      {
        id: 'nav-user-admin',
        label: 'User Admin',
        icon: 'ShieldCheckIcon',
        href: '/user-admin',
        roles: MANAGEMENT_ROLES,
      },
      {
        id: 'nav-admin',
        label: 'Employee Directory',
        icon: 'UserGroupIcon',
        href: '/admin',
        roles: MANAGEMENT_ROLES,
      },
      {
        id: 'nav-users',
        label: 'User Accounts',
        icon: 'UsersIcon',
        href: '/users',
        roles: MANAGEMENT_ROLES,
      },
      {
        id: 'nav-roles',
        label: 'Roles & Permissions',
        icon: 'LockClosedIcon',
        href: '/roles',
        roles: MANAGEMENT_ROLES,
      },
      {
        id: 'nav-automation',
        label: 'Automation',
        icon: 'BoltIcon',
        href: '/automation',
        roles: MANAGEMENT_ROLES,
      },
      {
        id: 'nav-coop-settings',
        label: 'Cooperative Settings',
        icon: 'AdjustmentsHorizontalIcon',
        href: '/cooperative-settings',
        roles: MANAGEMENT_ROLES,
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Mobile drawer state — ignored on md+ screens. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || hasRole(profile?.role, item.roles)),
    }))
    .filter((group) => group.items.length > 0);

  const initials =
    profile?.avatarInitials ||
    profile?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 3)
      .toUpperCase() ||
    'U';
  const displayName = profile?.fullName || 'User';
  const displayRole = profile?.position || profile?.role?.replace(/_/g, ' ') || '';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`flex flex-col bg-card border-r border-border shadow-sidebar h-screen fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:z-40 md:translate-x-0 sidebar-transition ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-16' : 'md:w-60'} w-60`}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 border-b border-border flex-shrink-0 ${
            collapsed ? 'md:justify-center md:px-0' : 'px-4 gap-3'
          }`}
        >
          <AppLogo size={32} />
          <div className={`min-w-0 ${collapsed ? 'md:hidden' : ''}`}>
            <span className="font-bold text-sm text-foreground tracking-tight block leading-tight">
              AakashWorkFlow
            </span>
            <span className="text-xs text-muted-foreground block leading-tight">
              Aakash Cooperative
            </span>
          </div>
          <button
            onClick={onMobileClose}
            className="ml-auto md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close navigation"
          >
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
          {visibleGroups.map((group) => (
            <div key={group.id} className="mb-1">
              {!collapsed && (
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-600 uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </span>
                </div>
              )}
              {collapsed && <div className="my-1 mx-2 border-t border-border hidden md:block" />}
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onMobileClose}
                  title={item.hint || (collapsed ? item.label : undefined)}
                  className={`relative flex items-center gap-3 mx-2 px-2.5 py-2 rounded-lg text-sm font-500 transition-all duration-150 group ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-secondary-foreground hover:bg-secondary hover:text-foreground'
                  } ${collapsed ? 'md:justify-center' : ''}`}
                >
                  <Icon
                    name={item.icon as any}
                    size={18}
                    className={
                      isActive(item.href)
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }
                  />
                  <span className={`flex-1 truncate ${collapsed ? 'md:hidden' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div
          className={`border-t border-border p-3 flex-shrink-0 ${
            collapsed ? 'md:flex md:justify-center' : ''
          }`}
        >
          <div className={`flex items-center gap-2.5 ${collapsed ? 'md:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-700 text-primary">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-600 text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{displayRole}</p>
            </div>
          </div>
          {collapsed && (
            <div className="hidden md:flex w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
              <span className="text-xs font-700 text-primary">{initials}</span>
            </div>
          )}
        </div>

        {/* Collapse Toggle — desktop only */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full items-center justify-center shadow-card hover:shadow-card-hover transition-all duration-150 z-50"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
            size={12}
            className="text-muted-foreground"
          />
        </button>
      </aside>
    </>
  );
}
