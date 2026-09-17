'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  taskId: string | null;
}

const notifTypeIcon: Record<string, string> = {
  new_assignment: 'ClipboardDocumentCheckIcon',
  overdue: 'ExclamationTriangleIcon',
  approval_required: 'CheckCircleIcon',
  comment_added: 'ChatBubbleLeftIcon',
  forwarded: 'ArrowRightIcon',
  mention: 'AtSymbolIcon',
  approved: 'CheckBadgeIcon',
  rejected: 'XCircleIcon',
  sent_back: 'ArrowUturnLeftIcon',
  deadline_approaching: 'ClockIcon',
  task_completed: 'CheckCircleIcon',
};

const notifTypeColor: Record<string, string> = {
  new_assignment: 'bg-primary/10 text-primary',
  overdue: 'bg-red-50 text-red-600',
  approval_required: 'bg-green-50 text-green-600',
  comment_added: 'bg-blue-50 text-blue-600',
  forwarded: 'bg-purple-50 text-purple-600',
  mention: 'bg-amber-50 text-amber-600',
  approved: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-600',
  sent_back: 'bg-orange-50 text-orange-600',
  deadline_approaching: 'bg-amber-50 text-amber-600',
  task_completed: 'bg-green-50 text-green-600',
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

interface TopbarProps {
  onQuickCreate: () => void;
  onOpenNav?: () => void;
}

export default function Topbar({ onQuickCreate, onOpenNav }: TopbarProps) {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, notification_type, title, body, is_read, created_at, task_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Notifications error:', error.message);
        return;
      }

      setNotifications(
        (data || []).map((n: any) => ({
          id: n.id,
          type: n.notification_type,
          title: n.title,
          body: n.body,
          time: timeAgo(n.created_at),
          read: n.is_read,
          taskId: n.task_id,
        }))
      );
    };

    fetchNotifications();

    const channel = supabase
      .channel(`notifs_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login-screen');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const initials =
    profile?.avatarInitials ||
    profile?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 3)
      .toUpperCase() ||
    'U';
  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'User';

  return (
    <header className="h-16 bg-card border-b border-border shadow-topbar flex items-center px-3 sm:px-4 gap-2 sm:gap-3 sticky top-0 z-30 flex-shrink-0">
      {/* Mobile navigation trigger */}
      <button
        onClick={onOpenNav}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
        aria-label="Open navigation"
      >
        <Icon name="Bars3Icon" size={20} className="text-muted-foreground" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md min-w-0">
        <div className="relative">
          <Icon
            name="MagnifyingGlassIcon"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search tasks…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Quick Create */}
        <button
          onClick={onQuickCreate}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-150 shadow-sm"
        >
          <Icon name="PlusIcon" size={16} className="text-primary-foreground" />
          <span className="hidden sm:block">Quick Create</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            aria-label="Notifications"
          >
            <Icon name="BellIcon" size={20} className="text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-700 rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 w-96 bg-card border border-border rounded-xl shadow-modal z-50 fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-600 text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs font-600 px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline font-500"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Icon
                        name="BellSlashIcon"
                        size={24}
                        className="text-muted-foreground mx-auto mb-2"
                      />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notifTypeColor[notif.type] || 'bg-secondary text-foreground'}`}
                        >
                          <Icon name={(notifTypeIcon[notif.type] || 'BellIcon') as any} size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-600 text-foreground">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-border">
                  <Link
                    href="/inbox"
                    className="text-xs text-primary font-500 hover:underline"
                    onClick={() => setNotifOpen(false)}
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          aria-label="Help"
        >
          <Icon name="QuestionMarkCircleIcon" size={20} className="text-muted-foreground" />
        </button>

        {/* User Avatar + Sign Out */}
        <div className="relative group">
          <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-secondary transition-colors">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-700 text-primary">{initials}</span>
            </div>
            <span className="hidden md:block text-sm font-500 text-foreground max-w-[120px] truncate">
              {displayName}
            </span>
            <Icon name="ChevronDownIcon" size={14} className="text-muted-foreground" />
          </button>
          <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-xl shadow-modal z-50 hidden group-hover:block">
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-xs font-600 text-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {profile?.position || profile?.role || ''}
              </p>
            </div>
            <div className="py-1">
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Icon name="Cog6ToothIcon" size={14} className="text-muted-foreground" />
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={14} className="text-red-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
