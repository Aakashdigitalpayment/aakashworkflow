'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Landing page for a signed-in user whose profile is missing or deactivated.
 * Middleware sends them here instead of /login-screen, which would otherwise
 * bounce an authenticated session back and forth with /dashboard forever.
 */
export default function AccountInactivePage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      router.push('/login-screen');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-card p-8 text-center">
        <div className="flex justify-center mb-5">
          <AppLogo size={40} />
        </div>

        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon name="LockClosedIcon" size={24} className="text-amber-600" />
        </div>

        <h1 className="text-lg font-700 text-foreground mb-2">Account access unavailable</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Your account is signed in, but it has no active staff profile in the system — or it has
          been deactivated. Contact an administrator to restore access.
        </p>

        <p className="text-xs text-muted-foreground mb-6">
          Need help? <span className="text-primary font-500">it@aakashcooperative.com.np</span>
        </p>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Icon name="ArrowRightOnRectangleIcon" size={16} className="text-primary-foreground" />
          Sign out
        </button>
      </div>
    </div>
  );
}
