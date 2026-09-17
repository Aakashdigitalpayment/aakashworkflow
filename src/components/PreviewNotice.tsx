'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * Marks a screen whose UI is finished but which is not yet backed by real data.
 *
 * The problem this solves: these pages render complete-looking forms, tables and
 * buttons that silently do nothing. Showing that plainly is better than letting
 * staff believe an action saved. Remove the banner when the module is wired to
 * Supabase.
 */
export default function PreviewNotice({ module, note }: { module: string; note?: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 mb-5">
      <Icon name="BeakerIcon" size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-800 leading-relaxed">
        <span className="font-600">Preview only.</span> {module} is not connected to the database
        yet — the data shown is a sample and your changes will not be saved.
        {note ? ` ${note}` : ''}
      </p>
    </div>
  );
}
