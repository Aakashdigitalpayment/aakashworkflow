'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PreviewNotice from '@/components/PreviewNotice';
import AppIcon from '@/components/ui/AppIcon';
import QuickCreateModal from '../dashboard/components/QuickCreateModal';

type SettingsTab = 'org' | 'taskid' | 'email' | 'reminders' | 'escalation' | 'backup';

interface OrgProfile {
  name: string;
  shortName: string;
  regNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  fiscalYear: string;
  currency: string;
  language: string;
}

interface TaskIdConfig {
  prefix: string;
  separator: string;
  includeYear: boolean;
  includeMonth: boolean;
  includeDept: boolean;
  sequenceLength: number;
  preview: string;
}

interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromEmail: string;
  useTLS: boolean;
  testEmail: string;
}

interface ReminderConfig {
  firstReminderHours: number;
  secondReminderHours: number;
  finalReminderHours: number;
  overdueReminderInterval: number;
  sendWeeklyDigest: boolean;
  digestDay: string;
  digestTime: string;
}

interface EscalationConfig {
  enableAutoEscalation: boolean;
  escalationAfterHours: number;
  escalationChain: string[];
  notifyOnEscalation: boolean;
  maxEscalationLevel: number;
  criticalEscalationHours: number;
}

const initOrg: OrgProfile = {
  name: 'Aakash Cooperative Society Ltd.',
  shortName: 'Aakash Coop',
  regNumber: 'REG-2045-001234',
  address: 'Kathmandu, Bagmati Province, Nepal',
  phone: '+977-01-4XXXXXX',
  email: 'info@aakashcoop.com',
  website: 'https://aakashcoop.com',
  fiscalYear: '2083/84',
  currency: 'NPR',
  language: 'English',
};

const initTaskId: TaskIdConfig = {
  prefix: 'TASK',
  separator: '-',
  includeYear: true,
  includeMonth: false,
  includeDept: true,
  sequenceLength: 5,
  preview: 'FIN-2083-00001',
};

const initEmail: EmailConfig = {
  smtpHost: 'smtp.aakashcoop.com',
  smtpPort: '587',
  smtpUser: 'notifications@aakashcoop.com',
  smtpPass: '',
  fromName: 'Aakash Workflow',
  fromEmail: 'noreply@aakashcoop.com',
  useTLS: true,
  testEmail: '',
};

const initReminders: ReminderConfig = {
  firstReminderHours: 48,
  secondReminderHours: 24,
  finalReminderHours: 4,
  overdueReminderInterval: 12,
  sendWeeklyDigest: true,
  digestDay: 'Monday',
  digestTime: '08:00',
};

const initEscalation: EscalationConfig = {
  enableAutoEscalation: true,
  escalationAfterHours: 24,
  escalationChain: ['Team Lead', 'Department Head', 'CEO'],
  notifyOnEscalation: true,
  maxEscalationLevel: 3,
  criticalEscalationHours: 4,
};

const TABS: { id: SettingsTab; label: string; icon: string; desc: string }[] = [
  { id: 'org', label: 'Organization Profile', icon: 'BuildingOffice2Icon', desc: 'Name, logo, contact details' },
  { id: 'taskid', label: 'Task ID Format', icon: 'HashtagIcon', desc: 'Configure task numbering pattern' },
  { id: 'email', label: 'Email Configuration', icon: 'EnvelopeIcon', desc: 'SMTP settings for notifications' },
  { id: 'reminders', label: 'Reminder Schedule', icon: 'ClockIcon', desc: 'Deadline reminder timing rules' },
  { id: 'escalation', label: 'Escalation Rules', icon: 'ArrowTrendingUpIcon', desc: 'Overdue escalation configuration' },
  { id: 'backup', label: 'Backup & Restore', icon: 'CircleStackIcon', desc: 'Data backup and restore options' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-border'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function SaveBar({ onSave, onDiscard, saving, saved }: { onSave: () => void; onDiscard: () => void; saving: boolean; saved: boolean }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
      {saved && (
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-600">
          <AppIcon name="CheckCircleIcon" size={14} />
          Changes saved successfully
        </div>
      )}
      {!saved && <div />}
      <div className="flex items-center gap-2">
        <button onClick={onDiscard} className="px-4 py-2 text-sm font-500 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary transition-colors">
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-all"
        >
          {saving && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-600 text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

const inputCls = 'w-full text-sm bg-secondary border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition-colors';

export default function SettingsPage() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('org');
  const [org, setOrg] = useState<OrgProfile>(initOrg);
  const [taskId, setTaskId] = useState<TaskIdConfig>(initTaskId);
  const [email, setEmail] = useState<EmailConfig>(initEmail);
  const [reminders, setReminders] = useState<ReminderConfig>(initReminders);
  const [escalation, setEscalation] = useState<EscalationConfig>(initEscalation);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [backupRunning, setBackupRunning] = useState(false);
  const [lastBackup] = useState('2083-06-14 08:30 AM');

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDiscard = () => {
    setOrg(initOrg);
    setTaskId(initTaskId);
    setEmail(initEmail);
    setReminders(initReminders);
    setEscalation(initEscalation);
    setSaved(false);
  };

  const handleTestEmail = async () => {
    setTestEmailSent(false);
    await new Promise(r => setTimeout(r, 1200));
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 4000);
  };

  const handleBackup = async () => {
    setBackupRunning(true);
    await new Promise(r => setTimeout(r, 2000));
    setBackupRunning(false);
  };

  const taskIdPreview = [
    taskId.includeDept ? 'FIN' : taskId.prefix,
    taskId.includeYear ? '2083' : null,
    '0'.repeat(taskId.sequenceLength - 1) + '1',
  ].filter(Boolean).join(taskId.separator);

  return (
    <AppLayout onQuickCreate={() => setQuickCreateOpen(true)}>
      <PreviewNotice module="Settings" />
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-800 text-foreground">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure organization profile, task IDs, email, reminders, and escalation rules</p>
        </div>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <AppIcon name={tab.icon as any} size={16} className="flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-600 leading-tight truncate">{tab.label}</p>
                  <p className="text-[10px] leading-tight mt-0.5 opacity-70 truncate">{tab.desc}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-xl p-5 min-w-0">

          {/* ── Organization Profile ── */}
          {activeTab === 'org' && (
            <div>
              <h2 className="text-base font-700 text-foreground mb-1">Organization Profile</h2>
              <p className="text-sm text-muted-foreground mb-5">Basic information about your cooperative organization</p>
              <FieldRow label="Organization Name" hint="Full legal name">
                <input className={inputCls} value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} />
              </FieldRow>
              <FieldRow label="Short Name" hint="Used in task IDs and reports">
                <input className={inputCls} value={org.shortName} onChange={e => setOrg({ ...org, shortName: e.target.value })} />
              </FieldRow>
              <FieldRow label="Registration Number">
                <input className={inputCls} value={org.regNumber} onChange={e => setOrg({ ...org, regNumber: e.target.value })} />
              </FieldRow>
              <FieldRow label="Address">
                <input className={inputCls} value={org.address} onChange={e => setOrg({ ...org, address: e.target.value })} />
              </FieldRow>
              <FieldRow label="Phone">
                <input className={inputCls} value={org.phone} onChange={e => setOrg({ ...org, phone: e.target.value })} />
              </FieldRow>
              <FieldRow label="Email">
                <input className={inputCls} type="email" value={org.email} onChange={e => setOrg({ ...org, email: e.target.value })} />
              </FieldRow>
              <FieldRow label="Website">
                <input className={inputCls} value={org.website} onChange={e => setOrg({ ...org, website: e.target.value })} />
              </FieldRow>
              <FieldRow label="Fiscal Year">
                <select className={inputCls} value={org.fiscalYear} onChange={e => setOrg({ ...org, fiscalYear: e.target.value })}>
                  <option>2083/84</option>
                  <option>2082/83</option>
                  <option>2081/82</option>
                </select>
              </FieldRow>
              <FieldRow label="Currency">
                <select className={inputCls} value={org.currency} onChange={e => setOrg({ ...org, currency: e.target.value })}>
                  <option value="NPR">NPR — Nepalese Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </FieldRow>
              <SaveBar onSave={handleSave} onDiscard={handleDiscard} saving={saving} saved={saved} />
            </div>
          )}

          {/* ── Task ID Format ── */}
          {activeTab === 'taskid' && (
            <div>
              <h2 className="text-base font-700 text-foreground mb-1">Task ID Format</h2>
              <p className="text-sm text-muted-foreground mb-5">Configure how task IDs are generated across the system</p>

              <div className="bg-secondary rounded-xl p-4 mb-5 flex items-center gap-3">
                <AppIcon name="EyeIcon" size={16} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-500">Preview</p>
                  <p className="text-lg font-800 text-primary font-mono">{taskIdPreview}</p>
                </div>
              </div>

              <FieldRow label="Default Prefix" hint="Used when department is not included">
                <input className={inputCls} value={taskId.prefix} onChange={e => setTaskId({ ...taskId, prefix: e.target.value.toUpperCase() })} maxLength={6} />
              </FieldRow>
              <FieldRow label="Separator">
                <select className={inputCls} value={taskId.separator} onChange={e => setTaskId({ ...taskId, separator: e.target.value })}>
                  <option value="-">Hyphen ( - )</option>
                  <option value="/">Slash ( / )</option>
                  <option value="_">Underscore ( _ )</option>
                </select>
              </FieldRow>
              <FieldRow label="Sequence Length" hint="Number of digits in the sequence">
                <select className={inputCls} value={taskId.sequenceLength} onChange={e => setTaskId({ ...taskId, sequenceLength: Number(e.target.value) })}>
                  {[3, 4, 5, 6].map(n => <option key={n} value={n}>{n} digits</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Include Year">
                <div className="flex items-center gap-2 pt-1">
                  <Toggle checked={taskId.includeYear} onChange={v => setTaskId({ ...taskId, includeYear: v })} />
                  <span className="text-sm text-muted-foreground">{taskId.includeYear ? 'Enabled' : 'Disabled'}</span>
                </div>
              </FieldRow>
              <FieldRow label="Include Department Code">
                <div className="flex items-center gap-2 pt-1">
                  <Toggle checked={taskId.includeDept} onChange={v => setTaskId({ ...taskId, includeDept: v })} />
                  <span className="text-sm text-muted-foreground">{taskId.includeDept ? 'Enabled — e.g. FIN-2083-00001' : 'Disabled — e.g. TASK-2083-00001'}</span>
                </div>
              </FieldRow>
              <SaveBar onSave={handleSave} onDiscard={handleDiscard} saving={saving} saved={saved} />
            </div>
          )}

          {/* ── Email Configuration ── */}
          {activeTab === 'email' && (
            <div>
              <h2 className="text-base font-700 text-foreground mb-1">Email Configuration</h2>
              <p className="text-sm text-muted-foreground mb-5">SMTP settings for sending system notifications and reminders</p>
              <FieldRow label="SMTP Host">
                <input className={inputCls} value={email.smtpHost} onChange={e => setEmail({ ...email, smtpHost: e.target.value })} placeholder="smtp.example.com" />
              </FieldRow>
              <FieldRow label="SMTP Port">
                <input className={inputCls} value={email.smtpPort} onChange={e => setEmail({ ...email, smtpPort: e.target.value })} placeholder="587" />
              </FieldRow>
              <FieldRow label="SMTP Username">
                <input className={inputCls} value={email.smtpUser} onChange={e => setEmail({ ...email, smtpUser: e.target.value })} />
              </FieldRow>
              <FieldRow label="SMTP Password">
                <input className={inputCls} type="password" value={email.smtpPass} onChange={e => setEmail({ ...email, smtpPass: e.target.value })} placeholder="••••••••" />
              </FieldRow>
              <FieldRow label="From Name">
                <input className={inputCls} value={email.fromName} onChange={e => setEmail({ ...email, fromName: e.target.value })} />
              </FieldRow>
              <FieldRow label="From Email">
                <input className={inputCls} type="email" value={email.fromEmail} onChange={e => setEmail({ ...email, fromEmail: e.target.value })} />
              </FieldRow>
              <FieldRow label="Use TLS/STARTTLS">
                <div className="flex items-center gap-2 pt-1">
                  <Toggle checked={email.useTLS} onChange={v => setEmail({ ...email, useTLS: v })} />
                  <span className="text-sm text-muted-foreground">{email.useTLS ? 'Enabled (recommended)' : 'Disabled'}</span>
                </div>
              </FieldRow>
              <FieldRow label="Send Test Email" hint="Verify your SMTP configuration">
                <div className="flex items-center gap-2">
                  <input className={inputCls} type="email" value={email.testEmail} onChange={e => setEmail({ ...email, testEmail: e.target.value })} placeholder="test@example.com" />
                  <button onClick={handleTestEmail} className="flex-shrink-0 px-3 py-2 bg-secondary border border-border text-sm font-600 rounded-lg hover:bg-border transition-colors whitespace-nowrap">
                    Send Test
                  </button>
                </div>
                {testEmailSent && <p className="text-xs text-green-600 font-500 mt-1.5 flex items-center gap-1"><AppIcon name="CheckCircleIcon" size={12} /> Test email sent successfully</p>}
              </FieldRow>
              <SaveBar onSave={handleSave} onDiscard={handleDiscard} saving={saving} saved={saved} />
            </div>
          )}

          {/* ── Reminder Schedule ── */}
          {activeTab === 'reminders' && (
            <div>
              <h2 className="text-base font-700 text-foreground mb-1">Reminder Schedule</h2>
              <p className="text-sm text-muted-foreground mb-5">Configure when deadline reminders are sent to assignees</p>
              <FieldRow label="First Reminder" hint="Hours before deadline">
                <div className="flex items-center gap-2">
                  <input type="number" className={inputCls} value={reminders.firstReminderHours} onChange={e => setReminders({ ...reminders, firstReminderHours: Number(e.target.value) })} min={1} max={168} />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">hours before</span>
                </div>
              </FieldRow>
              <FieldRow label="Second Reminder" hint="Hours before deadline">
                <div className="flex items-center gap-2">
                  <input type="number" className={inputCls} value={reminders.secondReminderHours} onChange={e => setReminders({ ...reminders, secondReminderHours: Number(e.target.value) })} min={1} max={72} />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">hours before</span>
                </div>
              </FieldRow>
              <FieldRow label="Final Reminder" hint="Hours before deadline">
                <div className="flex items-center gap-2">
                  <input type="number" className={inputCls} value={reminders.finalReminderHours} onChange={e => setReminders({ ...reminders, finalReminderHours: Number(e.target.value) })} min={1} max={24} />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">hours before</span>
                </div>
              </FieldRow>
              <FieldRow label="Overdue Repeat Interval" hint="Repeat reminder every N hours after overdue">
                <div className="flex items-center gap-2">
                  <input type="number" className={inputCls} value={reminders.overdueReminderInterval} onChange={e => setReminders({ ...reminders, overdueReminderInterval: Number(e.target.value) })} min={1} max={48} />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">hours</span>
                </div>
              </FieldRow>
              <FieldRow label="Weekly Digest">
                <div className="flex items-center gap-2 pt-1">
                  <Toggle checked={reminders.sendWeeklyDigest} onChange={v => setReminders({ ...reminders, sendWeeklyDigest: v })} />
                  <span className="text-sm text-muted-foreground">{reminders.sendWeeklyDigest ? 'Enabled' : 'Disabled'}</span>
                </div>
              </FieldRow>
              {reminders.sendWeeklyDigest && (
                <>
                  <FieldRow label="Digest Day">
                    <select className={inputCls} value={reminders.digestDay} onChange={e => setReminders({ ...reminders, digestDay: e.target.value })}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </FieldRow>
                  <FieldRow label="Digest Time">
                    <input type="time" className={inputCls} value={reminders.digestTime} onChange={e => setReminders({ ...reminders, digestTime: e.target.value })} />
                  </FieldRow>
                </>
              )}
              <SaveBar onSave={handleSave} onDiscard={handleDiscard} saving={saving} saved={saved} />
            </div>
          )}

          {/* ── Escalation Rules ── */}
          {activeTab === 'escalation' && (
            <div>
              <h2 className="text-base font-700 text-foreground mb-1">Escalation Rules</h2>
              <p className="text-sm text-muted-foreground mb-5">Configure automatic escalation behavior for overdue tasks</p>
              <FieldRow label="Auto-Escalation">
                <div className="flex items-center gap-2 pt-1">
                  <Toggle checked={escalation.enableAutoEscalation} onChange={v => setEscalation({ ...escalation, enableAutoEscalation: v })} />
                  <span className="text-sm text-muted-foreground">{escalation.enableAutoEscalation ? 'Enabled — tasks escalate automatically' : 'Disabled'}</span>
                </div>
              </FieldRow>
              {escalation.enableAutoEscalation && (
                <>
                  <FieldRow label="Escalate After" hint="Hours overdue before first escalation">
                    <div className="flex items-center gap-2">
                      <input type="number" className={inputCls} value={escalation.escalationAfterHours} onChange={e => setEscalation({ ...escalation, escalationAfterHours: Number(e.target.value) })} min={1} max={168} />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">hours overdue</span>
                    </div>
                  </FieldRow>
                  <FieldRow label="Critical Task Escalation" hint="Hours overdue for critical priority">
                    <div className="flex items-center gap-2">
                      <input type="number" className={inputCls} value={escalation.criticalEscalationHours} onChange={e => setEscalation({ ...escalation, criticalEscalationHours: Number(e.target.value) })} min={1} max={24} />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">hours overdue</span>
                    </div>
                  </FieldRow>
                  <FieldRow label="Max Escalation Levels">
                    <select className={inputCls} value={escalation.maxEscalationLevel} onChange={e => setEscalation({ ...escalation, maxEscalationLevel: Number(e.target.value) })}>
                      {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} level{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </FieldRow>
                  <FieldRow label="Escalation Chain" hint="Roles notified at each level">
                    <div className="space-y-2">
                      {escalation.escalationChain.slice(0, escalation.maxEscalationLevel).map((role, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <select
                            className={inputCls}
                            value={role}
                            onChange={e => {
                              const chain = [...escalation.escalationChain];
                              chain[i] = e.target.value;
                              setEscalation({ ...escalation, escalationChain: chain });
                            }}
                          >
                            {['Team Lead', 'Department Head', 'CEO', 'Board', 'CFO', 'Manager'].map(r => <option key={r}>{r}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </FieldRow>
                  <FieldRow label="Notify on Escalation">
                    <div className="flex items-center gap-2 pt-1">
                      <Toggle checked={escalation.notifyOnEscalation} onChange={v => setEscalation({ ...escalation, notifyOnEscalation: v })} />
                      <span className="text-sm text-muted-foreground">Send notification when task is escalated</span>
                    </div>
                  </FieldRow>
                </>
              )}
              <SaveBar onSave={handleSave} onDiscard={handleDiscard} saving={saving} saved={saved} />
            </div>
          )}

          {/* ── Backup & Restore ── */}
          {activeTab === 'backup' && (
            <div>
              <h2 className="text-base font-700 text-foreground mb-1">Backup & Restore</h2>
              <p className="text-sm text-muted-foreground mb-5">Manage data backups and restore points for your workspace</p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                <AppIcon name="CheckCircleIcon" size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-600 text-green-800">Last backup successful</p>
                  <p className="text-xs text-green-700 mt-0.5">{lastBackup} · All data backed up · 2.4 MB</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'Full Backup', desc: 'All tasks, users, settings, and audit logs', size: '2.4 MB', date: '2083-06-14' },
                  { label: 'Tasks Only', desc: 'Task data, comments, and attachments', size: '1.8 MB', date: '2083-06-14' },
                  { label: 'Settings Backup', desc: 'Organization settings and configurations', size: '0.1 MB', date: '2083-06-10' },
                ].map(b => (
                  <div key={b.label} className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                    <div>
                      <p className="text-sm font-600 text-foreground">{b.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.desc} · {b.size} · {b.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs font-600 bg-card border border-border rounded-lg hover:bg-border transition-colors flex items-center gap-1.5">
                        <AppIcon name="ArrowDownTrayIcon" size={12} />
                        Download
                      </button>
                      <button className="px-3 py-1.5 text-xs font-600 bg-card border border-border rounded-lg hover:bg-border transition-colors flex items-center gap-1.5">
                        <AppIcon name="ArrowPathIcon" size={12} />
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-700 text-foreground mb-3">Create New Backup</h3>
                <button
                  onClick={handleBackup}
                  disabled={backupRunning}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-all"
                >
                  {backupRunning ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating backup…</>
                  ) : (
                    <><AppIcon name="CircleStackIcon" size={15} />Create Backup Now</>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} />}
    </AppLayout>
  );
}
