'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import Icon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'notifications' | 'password' | 'dashboard';

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  bio: string;
  timezone: string;
  language: string;
}

interface NotificationPrefs {
  emailTaskAssigned: boolean;
  emailTaskDue: boolean;
  emailApprovalRequired: boolean;
  emailApprovalDecision: boolean;
  emailWeeklyDigest: boolean;
  emailMentions: boolean;
  inAppTaskAssigned: boolean;
  inAppTaskDue: boolean;
  inAppApprovalRequired: boolean;
  inAppApprovalDecision: boolean;
  inAppMentions: boolean;
  inAppSystemAlerts: boolean;
  smsUrgentOnly: boolean;
  smsApprovals: boolean;
  digestFrequency: 'daily' | 'weekly' | 'never';
  quietHoursEnabled: boolean;
  quietFrom: string;
  quietTo: string;
}

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

interface DashboardConfig {
  defaultView: 'overview' | 'my-tasks' | 'team' | 'analytics';
  showKPIGrid: boolean;
  showTaskChart: boolean;
  showWorkloadChart: boolean;
  showRecentActivity: boolean;
  showDueToday: boolean;
  showOverdue: boolean;
  kpiColumns: 2 | 4;
  compactMode: boolean;
  defaultDateRange: '7d' | '30d' | '90d';
  pinnedDepartment: string;
  roleView: 'employee' | 'manager' | 'admin';
}

// ─── Initial State ─────────────────────────────────────────────────────────────

const initProfile: ProfileForm = {
  fullName: 'Ramesh Sharma',
  email: 'ramesh.sharma@aakashcoop.com',
  phone: '+977-9841-234567',
  position: 'Finance Officer',
  department: 'Finance',
  bio: 'Finance officer at Aakash Cooperative with 8 years of experience in cooperative banking and loan management.',
  timezone: 'Asia/Kathmandu',
  language: 'English',
};

const initNotifs: NotificationPrefs = {
  emailTaskAssigned: true,
  emailTaskDue: true,
  emailApprovalRequired: true,
  emailApprovalDecision: true,
  emailWeeklyDigest: true,
  emailMentions: true,
  inAppTaskAssigned: true,
  inAppTaskDue: true,
  inAppApprovalRequired: true,
  inAppApprovalDecision: true,
  inAppMentions: true,
  inAppSystemAlerts: true,
  smsUrgentOnly: false,
  smsApprovals: false,
  digestFrequency: 'weekly',
  quietHoursEnabled: true,
  quietFrom: '22:00',
  quietTo: '07:00',
};

const initDashboard: DashboardConfig = {
  defaultView: 'overview',
  showKPIGrid: true,
  showTaskChart: true,
  showWorkloadChart: true,
  showRecentActivity: true,
  showDueToday: true,
  showOverdue: true,
  kpiColumns: 4,
  compactMode: false,
  defaultDateRange: '30d',
  pinnedDepartment: 'Finance',
  roleView: 'employee',
};

const DEPARTMENTS = ['Finance', 'Operations', 'Loans & Credit', 'Member Services', 'Audit & Compliance', 'IT & Systems'];
const TIMEZONES = ['Asia/Kathmandu', 'Asia/Kolkata', 'UTC', 'Asia/Bangkok', 'Asia/Singapore'];
const LANGUAGES = ['English', 'Nepali', 'Hindi'];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-5">
      <div className="mb-5">
        <h3 className="text-sm font-700 text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start py-3.5 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-600 text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
          style={{ width: '18px', height: '18px' }}
        />
      </button>
      <span className="text-sm text-foreground group-hover:text-foreground/80">{label}</span>
    </label>
  );
}

function SaveBar({ onSave, onDiscard, saving }: { onSave: () => void; onDiscard: () => void; saving: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-5 mt-1 border-t border-border">
      <button
        onClick={onDiscard}
        className="px-4 py-2 text-sm font-600 text-secondary-foreground bg-secondary hover:bg-border rounded-lg transition-colors"
      >
        Discard
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="px-5 py-2 text-sm font-600 text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {saving && (
          <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
        )}
        Save Changes
      </button>
    </div>
  );
}

// ─── Tab: Profile ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const [form, setForm] = useState<ProfileForm>(initProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof ProfileForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 900);
  };

  const initials = form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fade-in">
      {saved && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.2)] rounded-xl text-sm font-600 text-[#065f46]">
          <Icon name="CheckCircleIcon" size={16} className="text-[#059669]" />
          Profile updated successfully
        </div>
      )}

      <SectionCard title="Profile Photo" subtitle="Your avatar shown across the platform">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
            <span className="text-xl font-800 text-primary">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-600 text-foreground mb-1">{form.fullName}</p>
            <p className="text-xs text-muted-foreground mb-3">{form.position} · {form.department}</p>
            <button className="px-3 py-1.5 text-xs font-600 bg-secondary hover:bg-border text-secondary-foreground rounded-lg transition-colors">
              Change Photo
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal Information" subtitle="Your name, contact, and role details">
        <FieldRow label="Full Name">
          <input
            className="input-base w-full focus:ring-primary/30"
            value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="Email Address" hint="Used for login and notifications">
          <input
            className="input-base w-full focus:ring-primary/30"
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="Phone Number">
          <input
            className="input-base w-full focus:ring-primary/30"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="Position / Job Title">
          <input
            className="input-base w-full focus:ring-primary/30"
            value={form.position}
            onChange={e => set('position', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="Department">
          <select
            className="input-base w-full focus:ring-primary/30"
            value={form.department}
            onChange={e => set('department', e.target.value)}
          >
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Bio" hint="Short description visible to teammates">
          <textarea
            className="input-base w-full focus:ring-primary/30 resize-none"
            rows={3}
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Locale & Language" subtitle="Regional display preferences">
        <FieldRow label="Timezone">
          <select
            className="input-base w-full focus:ring-primary/30"
            value={form.timezone}
            onChange={e => set('timezone', e.target.value)}
          >
            {TIMEZONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Language">
          <select
            className="input-base w-full focus:ring-primary/30"
            value={form.language}
            onChange={e => set('language', e.target.value)}
          >
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </FieldRow>
      </SectionCard>

      <SaveBar onSave={handleSave} onDiscard={() => setForm(initProfile)} saving={saving} />
    </div>
  );
}

// ─── Tab: Notifications ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initNotifs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (k: keyof NotificationPrefs) =>
    setPrefs(p => ({ ...p, [k]: !p[k as keyof NotificationPrefs] }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  };

  return (
    <div className="fade-in">
      {saved && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.2)] rounded-xl text-sm font-600 text-[#065f46]">
          <Icon name="CheckCircleIcon" size={16} className="text-[#059669]" />
          Notification preferences saved
        </div>
      )}

      <SectionCard title="Email Notifications" subtitle="Choose which events trigger emails to your inbox">
        <div className="space-y-4">
          <Toggle checked={prefs.emailTaskAssigned} onChange={() => toggle('emailTaskAssigned')} label="Task assigned to me" />
          <Toggle checked={prefs.emailTaskDue} onChange={() => toggle('emailTaskDue')} label="Task due date reminders" />
          <Toggle checked={prefs.emailApprovalRequired} onChange={() => toggle('emailApprovalRequired')} label="Approval action required" />
          <Toggle checked={prefs.emailApprovalDecision} onChange={() => toggle('emailApprovalDecision')} label="Approval decision on my requests" />
          <Toggle checked={prefs.emailMentions} onChange={() => toggle('emailMentions')} label="Mentions and comments" />
          <Toggle checked={prefs.emailWeeklyDigest} onChange={() => toggle('emailWeeklyDigest')} label="Weekly activity digest" />
        </div>
      </SectionCard>

      <SectionCard title="In-App Notifications" subtitle="Real-time alerts shown inside the platform">
        <div className="space-y-4">
          <Toggle checked={prefs.inAppTaskAssigned} onChange={() => toggle('inAppTaskAssigned')} label="Task assigned to me" />
          <Toggle checked={prefs.inAppTaskDue} onChange={() => toggle('inAppTaskDue')} label="Task due date reminders" />
          <Toggle checked={prefs.inAppApprovalRequired} onChange={() => toggle('inAppApprovalRequired')} label="Approval action required" />
          <Toggle checked={prefs.inAppApprovalDecision} onChange={() => toggle('inAppApprovalDecision')} label="Approval decision on my requests" />
          <Toggle checked={prefs.inAppMentions} onChange={() => toggle('inAppMentions')} label="Mentions and comments" />
          <Toggle checked={prefs.inAppSystemAlerts} onChange={() => toggle('inAppSystemAlerts')} label="System alerts and announcements" />
        </div>
      </SectionCard>

      <SectionCard title="SMS Notifications" subtitle="Text messages for critical events only">
        <div className="space-y-4">
          <Toggle checked={prefs.smsUrgentOnly} onChange={() => toggle('smsUrgentOnly')} label="Urgent task alerts (Critical priority)" />
          <Toggle checked={prefs.smsApprovals} onChange={() => toggle('smsApprovals')} label="Pending approval reminders" />
        </div>
      </SectionCard>

      <SectionCard title="Digest & Quiet Hours" subtitle="Control when and how often you receive summaries">
        <FieldRow label="Digest Frequency" hint="How often to receive activity summaries">
          <div className="flex gap-2 flex-wrap">
            {(['daily', 'weekly', 'never'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setPrefs(p => ({ ...p, digestFrequency: opt }))}
                className={`px-4 py-1.5 text-sm font-600 rounded-lg border transition-colors capitalize ${
                  prefs.digestFrequency === opt
                    ? 'bg-primary/10 border-primary/30 text-primary' :'bg-secondary border-border text-secondary-foreground hover:bg-border'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Quiet Hours" hint="Suppress non-urgent notifications during these hours">
          <div className="flex items-center gap-3 flex-wrap">
            <Toggle checked={prefs.quietHoursEnabled} onChange={() => toggle('quietHoursEnabled')} label="Enable quiet hours" />
            {prefs.quietHoursEnabled && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="time"
                  className="input-base text-sm focus:ring-primary/30"
                  value={prefs.quietFrom}
                  onChange={e => setPrefs(p => ({ ...p, quietFrom: e.target.value }))}
                />
                <span className="text-xs text-muted-foreground font-600">to</span>
                <input
                  type="time"
                  className="input-base text-sm focus:ring-primary/30"
                  value={prefs.quietTo}
                  onChange={e => setPrefs(p => ({ ...p, quietTo: e.target.value }))}
                />
              </div>
            )}
          </div>
        </FieldRow>
      </SectionCard>

      <SaveBar onSave={handleSave} onDiscard={() => setPrefs(initNotifs)} saving={saving} />
    </div>
  );
}

// ─── Tab: Password ─────────────────────────────────────────────────────────────

function PasswordTab() {
  const [form, setForm] = useState<PasswordForm>({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const set = (k: keyof PasswordForm, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setError('');
  };

  const strength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#dc2626', '#d97706', '#0891b2', '#059669'];
  let s = strength(form.next);

  const handleSave = () => {
    if (!form.current) { setError('Please enter your current password.'); return; }
    if (form.next.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (form.next !== form.confirm) { setError('New passwords do not match.'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setSaved(false), 3000);
    }, 900);
  };

  return (
    <div className="fade-in max-w-lg">
      {saved && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.2)] rounded-xl text-sm font-600 text-[#065f46]">
          <Icon name="CheckCircleIcon" size={16} className="text-[#059669]" />
          Password changed successfully
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-[rgba(220,38,38,0.07)] border border-[rgba(220,38,38,0.18)] rounded-xl text-sm font-600 text-[#991b1b]">
          <Icon name="ExclamationCircleIcon" size={16} className="text-[#dc2626]" />
          {error}
        </div>
      )}

      <SectionCard title="Change Password" subtitle="Use a strong password with at least 8 characters">
        {(['current', 'next', 'confirm'] as const).map((field) => (
          <FieldRow
            key={field}
            label={field === 'current' ? 'Current Password' : field === 'next' ? 'New Password' : 'Confirm New Password'}
          >
            <div className="relative">
              <input
                type={show[field] ? 'text' : 'password'}
                className="input-base w-full pr-10 focus:ring-primary/30"
                placeholder={field === 'current' ? 'Enter current password' : field === 'next' ? 'Enter new password' : 'Repeat new password'}
                value={form[field]}
                onChange={e => set(field, e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={show[field] ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
              </button>
            </div>
            {field === 'next' && form.next && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors duration-300"
                      style={{ backgroundColor: i <= s ? strengthColor[s] : 'var(--border)' }}
                    />
                  ))}
                </div>
                <p className="text-xs font-600" style={{ color: strengthColor[s] }}>
                  {strengthLabel[s]} password
                </p>
              </div>
            )}
          </FieldRow>
        ))}
      </SectionCard>

      <SectionCard title="Password Requirements" subtitle="Your password must meet these criteria">
        <ul className="space-y-2">
          {[
            { label: 'At least 8 characters', met: form.next.length >= 8 },
            { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(form.next) },
            { label: 'One number (0–9)', met: /[0-9]/.test(form.next) },
            { label: 'One special character (!@#$…)', met: /[^A-Za-z0-9]/.test(form.next) },
          ].map(req => (
            <li key={req.label} className="flex items-center gap-2.5 text-sm">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                form.next ? (req.met ? 'bg-[rgba(5,150,105,0.12)]' : 'bg-[rgba(220,38,38,0.08)]') : 'bg-secondary'
              }`}>
                {form.next && (
                  <Icon
                    name={req.met ? 'CheckIcon' : 'XMarkIcon'}
                    size={10}
                    className={req.met ? 'text-[#059669]' : 'text-[#dc2626]'}
                  />
                )}
              </span>
              <span className={form.next ? (req.met ? 'text-foreground' : 'text-muted-foreground') : 'text-muted-foreground'}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="flex items-center justify-end gap-3 pt-5 mt-1 border-t border-border">
        <button
          onClick={() => { setForm({ current: '', next: '', confirm: '' }); setError(''); }}
          className="px-4 py-2 text-sm font-600 text-secondary-foreground bg-secondary hover:bg-border rounded-lg transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-600 text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {saving && (
            <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
          )}
          Update Password
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Dashboard Views ──────────────────────────────────────────────────────

function DashboardViewTab() {
  const [cfg, setCfg] = useState<DashboardConfig>(initDashboard);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (k: keyof DashboardConfig) =>
    setCfg(c => ({ ...c, [k]: !c[k as keyof DashboardConfig] }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  };

  return (
    <div className="fade-in">
      {saved && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.2)] rounded-xl text-sm font-600 text-[#065f46]">
          <Icon name="CheckCircleIcon" size={16} className="text-[#059669]" />
          Dashboard preferences saved
        </div>
      )}

      <SectionCard title="Default View" subtitle="Which view loads when you open the dashboard">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { id: 'overview', label: 'Overview', icon: 'Squares2X2Icon', desc: 'Full dashboard' },
            { id: 'my-tasks', label: 'My Tasks', icon: 'ClipboardDocumentCheckIcon', desc: 'Personal task list' },
            { id: 'team', label: 'Team View', icon: 'UserGroupIcon', desc: 'Team workload' },
            { id: 'analytics', label: 'Analytics', icon: 'ChartBarIcon', desc: 'Charts & metrics' },
          ] as const).map(v => (
            <button
              key={v.id}
              onClick={() => setCfg(c => ({ ...c, defaultView: v.id }))}
              className={`p-4 rounded-xl border text-left transition-all ${
                cfg.defaultView === v.id
                  ? 'bg-primary/8 border-primary/30 shadow-sm'
                  : 'bg-secondary border-border hover:bg-border'
              }`}
            >
              <Icon
                name={v.icon}
                size={20}
                className={cfg.defaultView === v.id ? 'text-primary mb-2' : 'text-muted-foreground mb-2'}
              />
              <p className={`text-sm font-700 ${cfg.defaultView === v.id ? 'text-primary' : 'text-foreground'}`}>{v.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Visible Widgets" subtitle="Choose which panels appear on your dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { key: 'showKPIGrid', label: 'KPI Summary Cards', icon: 'ChartBarSquareIcon' },
            { key: 'showTaskChart', label: 'Task Status Chart', icon: 'ChartPieIcon' },
            { key: 'showWorkloadChart', label: 'Department Workload', icon: 'PresentationChartBarIcon' },
            { key: 'showRecentActivity', label: 'Recent Activity Feed', icon: 'ClockIcon' },
            { key: 'showDueToday', label: 'Due Today List', icon: 'CalendarDaysIcon' },
            { key: 'showOverdue', label: 'Overdue Tasks Panel', icon: 'ExclamationTriangleIcon' },
          ] as const).map(w => (
            <div key={w.key} className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
              <div className="flex items-center gap-2.5">
                <Icon name={w.icon} size={16} className="text-muted-foreground" />
                <span className="text-sm font-600 text-foreground">{w.label}</span>
              </div>
              <Toggle
                checked={cfg[w.key] as boolean}
                onChange={() => toggle(w.key)}
                label=""
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Layout & Display" subtitle="Adjust how the dashboard is presented">
        <FieldRow label="KPI Grid Columns" hint="Number of KPI cards per row">
          <div className="flex gap-2">
            {([2, 4] as const).map(n => (
              <button
                key={n}
                onClick={() => setCfg(c => ({ ...c, kpiColumns: n }))}
                className={`px-5 py-1.5 text-sm font-600 rounded-lg border transition-colors ${
                  cfg.kpiColumns === n
                    ? 'bg-primary/10 border-primary/30 text-primary' :'bg-secondary border-border text-secondary-foreground hover:bg-border'
                }`}
              >
                {n} columns
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Default Date Range" hint="Time window for charts and metrics">
          <div className="flex gap-2 flex-wrap">
            {([{ v: '7d', l: 'Last 7 days' }, { v: '30d', l: 'Last 30 days' }, { v: '90d', l: 'Last 90 days' }] as const).map(opt => (
              <button
                key={opt.v}
                onClick={() => setCfg(c => ({ ...c, defaultDateRange: opt.v }))}
                className={`px-4 py-1.5 text-sm font-600 rounded-lg border transition-colors ${
                  cfg.defaultDateRange === opt.v
                    ? 'bg-primary/10 border-primary/30 text-primary' :'bg-secondary border-border text-secondary-foreground hover:bg-border'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Compact Mode" hint="Reduce card padding for more information density">
          <Toggle checked={cfg.compactMode} onChange={() => toggle('compactMode')} label="Enable compact layout" />
        </FieldRow>
        <FieldRow label="Pinned Department" hint="Department highlighted in workload charts">
          <select
            className="input-base focus:ring-primary/30"
            value={cfg.pinnedDepartment}
            onChange={e => setCfg(c => ({ ...c, pinnedDepartment: e.target.value }))}
          >
            <option value="">None</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </FieldRow>
      </SectionCard>

      <SectionCard title="Role-Specific View" subtitle="Tailor the dashboard to your working context">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { id: 'employee', label: 'Employee', desc: 'Personal tasks and assignments', icon: 'UserIcon' },
            { id: 'manager', label: 'Manager', desc: 'Team overview and approvals', icon: 'UserGroupIcon' },
            { id: 'admin', label: 'Admin', desc: 'System-wide metrics and controls', icon: 'ShieldCheckIcon' },
          ] as const).map(r => (
            <button
              key={r.id}
              onClick={() => setCfg(c => ({ ...c, roleView: r.id }))}
              className={`p-4 rounded-xl border text-left transition-all ${
                cfg.roleView === r.id
                  ? 'bg-primary/8 border-primary/30 shadow-sm'
                  : 'bg-secondary border-border hover:bg-border'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                cfg.roleView === r.id ? 'bg-primary/15' : 'bg-border'
              }`}>
                <Icon name={r.icon} size={16} className={cfg.roleView === r.id ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <p className={`text-sm font-700 ${cfg.roleView === r.id ? 'text-primary' : 'text-foreground'}`}>{r.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{r.desc}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SaveBar onSave={handleSave} onDiscard={() => setCfg(initDashboard)} saving={saving} />
    </div>
  );
}

// ─── Tab Config ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'profile', label: 'Profile', icon: 'UserCircleIcon', desc: 'Personal info & locale' },
  { id: 'notifications', label: 'Notifications', icon: 'BellIcon', desc: 'Alerts & digest settings' },
  { id: 'password', label: 'Password', icon: 'LockClosedIcon', desc: 'Security & credentials' },
  { id: 'dashboard', label: 'Dashboard Views', icon: 'Squares2X2Icon', desc: 'Layout & widget config' },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PersonalSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [quickCreate, setQuickCreate] = useState(false);

  return (
    <AppLayout onQuickCreate={() => setQuickCreate(true)}>
      <PreviewNotice module="Personal Settings" />
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-foreground">Personal Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your profile, preferences, and account security</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="bg-card border border-border rounded-xl overflow-hidden">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                  i < TABS.length - 1 ? 'border-b border-border' : ''
                } ${
                  activeTab === tab.id
                    ? 'bg-primary/8 text-primary' :'text-secondary-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activeTab === tab.id ? 'bg-primary/15' : 'bg-secondary'
                }`}>
                  <Icon
                    name={tab.icon as any}
                    size={16}
                    className={activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}
                  />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-700 leading-tight ${activeTab === tab.id ? 'text-primary' : 'text-foreground'}`}>
                    {tab.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">{tab.desc}</p>
                </div>
                {activeTab === tab.id && (
                  <Icon name="ChevronRightIcon" size={14} className="text-primary ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'password' && <PasswordTab />}
          {activeTab === 'dashboard' && <DashboardViewTab />}
        </main>
      </div>

      {quickCreate && <QuickCreateModal onClose={() => setQuickCreate(false)} />}
    </AppLayout>
  );
}
