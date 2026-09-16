'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface DemoCredential {
  role: string;
  email: string;
  password: string;
  color: string;
}

const demoCredentials: DemoCredential[] = [
  { role: 'CEO / GM', email: 'ceo@aakashcooperative.com.np', password: 'AakashCEO@2083', color: 'bg-primary/10 text-primary' },
  { role: 'Manager', email: 'manager@aakashcooperative.com.np', password: 'AakashMgr@2083', color: 'bg-indigo-100 text-indigo-700' },
  { role: 'Dept Head', email: 'depthead@aakashcooperative.com.np', password: 'AakashDH@2083', color: 'bg-purple-100 text-purple-700' },
  { role: 'Officer', email: 'officer@aakashcooperative.com.np', password: 'AakashOff@2083', color: 'bg-amber-100 text-amber-700' },
  { role: 'Employee', email: 'employee@aakashcooperative.com.np', password: 'AakashEmp@2083', color: 'bg-green-100 text-green-700' },
  { role: 'Auditor', email: 'auditor@aakashcooperative.com.np', password: 'AakashAud@2083', color: 'bg-slate-100 text-slate-700' },
];

export default function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back! Signed in successfully.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || 'Invalid credentials. Please try again.';
      setError('email', { type: 'manual', message: msg });
    }
  };

  const autofill = (cred: DemoCredential) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 45%, #1d4ed8 100%)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
          <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #bfdbfe, transparent)' }} />
        </div>

        {/* Top: Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <AppLogo size={40} />
          <div>
            <span className="font-700 text-lg text-white tracking-tight block leading-tight">AakashWorkFlow</span>
            <span className="text-xs text-blue-200 block leading-tight">Aakash Cooperative Ltd.</span>
          </div>
        </div>

        {/* Middle: Tagline */}
        <div className="relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs font-500 text-blue-100">Internal Operations Platform</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-700 text-white leading-tight mb-4">
              Every Task.<br />
              Every Responsibility.<br />
              <span className="text-blue-300">Clearly Connected.</span>
            </h1>
            <p className="text-sm text-blue-200 leading-relaxed max-w-xs">
              हरेक काम, हरेक जिम्मेवारी र हरेक प्रगति — एउटै प्रणालीमा स्पष्ट रूपमा जोडिएको।
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {[
              { icon: 'ClipboardDocumentCheckIcon', text: 'Task lifecycle from creation to completion' },
              { icon: 'UsersIcon', text: 'Department-wise accountability & workload' },
              { icon: 'ChartBarIcon', text: 'Real-time progress & approval tracking' },
            ].map((feat, i) => (
              <div key={`feat-${i}`} className="flex items-center gap-3 bg-white/8 rounded-lg px-3 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon name={feat.icon as any} size={14} className="text-blue-200" />
                </div>
                <span className="text-sm text-blue-100">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Info */}
        <div className="relative z-10">
          <p className="text-xs text-blue-300">
            © 2083 BS · Aakash Cooperative Ltd. · Kathmandu, Nepal
          </p>
          <p className="text-xs text-blue-400 mt-1">
            Authorized personnel only. All activity is monitored and logged.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 bg-background">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <AppLogo size={36} />
            <div>
              <span className="font-700 text-base text-foreground block">AakashWorkFlow</span>
              <span className="text-xs text-muted-foreground block">Aakash Cooperative Ltd.</span>
            </div>
          </div>

          {/* Internal notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 mb-6">
            <Icon name="LockClosedIcon" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-600">Restricted System.</span> This platform is for Aakash Cooperative staff only. No public registration. Unauthorized access is prohibited.
            </p>
          </div>

          <h2 className="text-2xl font-700 text-foreground mb-1">Sign in to your account</h2>
          <p className="text-sm text-muted-foreground mb-7">Enter your work email and password to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-600 text-foreground mb-1.5">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="yourname@aakashcooperative.com.np"
                className={`w-full px-3.5 py-2.5 text-sm bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground ${
                  errors.email ? 'border-red-400 bg-red-50/30' : 'border-border'
                }`}
                {...register('email', {
                  required: 'Work email is required.',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <Icon name="ExclamationCircleIcon" size={12} className="text-red-500 flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-600 text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your account password"
                  className={`w-full px-3.5 py-2.5 pr-10 text-sm bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all text-foreground placeholder:text-muted-foreground ${
                    errors.password ? 'border-red-400 bg-red-50/30' : 'border-border'
                  }`}
                  {...register('password', {
                    required: 'Password is required.',
                    minLength: { value: 6, message: 'Password must be at least 6 characters.' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <Icon name="ExclamationCircleIcon" size={12} className="text-red-500 flex-shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-ring/30"
                  {...register('remember')}
                />
                <span className="text-sm text-secondary-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary font-500 hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <Icon name="ArrowPathIcon" size={16} className="animate-spin text-primary-foreground" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <Icon name="ArrowRightOnRectangleIcon" size={16} className="text-primary-foreground" />
                  <span>Sign In to AakashWorkFlow</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-7">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-500 px-2">Demo Accounts</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Click any role to autofill credentials
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="text-left px-3 py-2 font-600 text-muted-foreground">Role</th>
                    <th className="text-left px-3 py-2 font-600 text-muted-foreground">Email</th>
                    <th className="px-3 py-2 font-600 text-muted-foreground text-center">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {demoCredentials.map((cred, i) => (
                    <tr
                      key={`cred-${cred.role.replace(/\s/g, '-').toLowerCase()}`}
                      className={`border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors ${
                        i % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                      }`}
                    >
                      <td className="px-3 py-2">
                        <span className={`text-[10px] font-600 px-1.5 py-0.5 rounded-full ${cred.color}`}>
                          {cred.role}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground font-400 truncate max-w-[180px]">
                        {cred.email}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => autofill(cred)}
                          className="px-2 py-1 text-[10px] font-600 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                        >
                          Use
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Having trouble? Contact{' '}
            <span className="text-primary font-500">it@aakashcooperative.com.np</span>
          </p>
        </div>
      </div>
    </div>
  );
}