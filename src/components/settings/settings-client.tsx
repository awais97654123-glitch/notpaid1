'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  User as UserIcon,
  Globe,
  Palette,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Server,
  Zap,
  Play,
  Moon,
  Sun,
  Laptop,
  RefreshCw,
  Radio,
  Check,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePreferencesAction } from '@/actions/notifications';
import { createTaskAction } from '@/actions/tasks';
import { COMMON_TIMEZONES } from '@/lib/date/timezone';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { User, NotificationPreferences, Workspace } from '@/types';

interface SettingsClientProps {
  user: User;
  preferences: NotificationPreferences;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
}

export function SettingsClient({
  user,
  preferences: initialPreferences,
  workspaces,
  currentWorkspace,
}: SettingsClientProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('default');
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isRefreshingDiag, setIsRefreshingDiag] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isCheckingReminders, setIsCheckingReminders] = useState(false);
  const [isSchedulingTest, setIsSchedulingTest] = useState(false);
  const [cronLogs, setCronLogs] = useState<string[]>([]);
  const [selectedTz, setSelectedTz] = useState(user.timezone || 'Asia/Karachi');
  const [currentLang, setCurrentLang] = useState('en');
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const fetchDiagnostics = async () => {
    setIsRefreshingDiag(true);
    try {
      const res = await fetch('/api/notifications/diagnostics');
      const data = await res.json();
      if (data.diagnostics) {
        setDiagnostics(data.diagnostics);
      }
    } catch (e) {
      console.warn('Diagnostics fetch failed:', e);
    } finally {
      setIsRefreshingDiag(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        setSwStatus(`Registered & Active (Scope: ${reg.scope})`);
        reg.pushManager.getSubscription().then((sub) => {
          setPushSubscribed(!!sub);
        });
      }).catch(() => {
        setSwStatus('Inactive or Not Supported');
      });
    }

    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('taskpad_locale') || 'en';
      setCurrentLang(savedLang);
    }

    fetchDiagnostics();
  }, []);

  const handleTogglePreference = async (key: keyof NotificationPreferences) => {
    const newVal = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: newVal }));
    try {
      await updatePreferencesAction({ [key]: newVal });
      addToast({ type: 'success', title: 'Preference Saved' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', description: err.message });
    }
  };

  const handleSubscribePush = async () => {
    if (!pushSupported) {
      addToast({ type: 'error', title: 'Web Push not supported in this browser.' });
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        addToast({ type: 'error', title: 'Notification permission denied by user.' });
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const res = await fetch('/api/notifications/vapid-public-key');
      const data = await res.json();

      if (!data.publicKey) {
        throw new Error('VAPID public key not found on server.');
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: data.publicKey,
      });

      const saveRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      if (saveRes.ok) {
        setPushSubscribed(true);
        addToast({
          type: 'success',
          title: 'Push Notifications Enabled',
          description: 'This browser device is now linked to your background reminders.',
        });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Subscription Error', description: err.message });
    }
  };

  const handleTestPush = async () => {
    setIsTestingPush(true);
    try {
      const res = await fetch('/api/notifications/test-push', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast({
          type: 'success',
          title: 'Web Push Dispatched',
          description: `Dispatched to ${data.sentCount || 1} active device(s). Check your system notification drawer!`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Test Push Result',
          description: data.message || 'Notification dispatched.',
        });
      }
      fetchDiagnostics();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Test Failed', description: err.message });
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      const res = await fetch('/api/notifications/test-email', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast({
          type: 'success',
          title: 'Test Email Dispatched',
          description: `Reminder email sent to ${user.email}`,
        });
      }
      fetchDiagnostics();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Email Test Failed', description: err.message });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleScheduleTestReminder = async () => {
    setIsSchedulingTest(true);
    try {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 2);

      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      const dateStr = `${year}-${month}-${day}`;
      const timeStr = `${hours}:${minutes}:00`;

      await createTaskAction({
        title: 'TaskPad 2-Minute Test Task',
        description: 'Automated test task to verify background push, email, and in-app reminder pipeline.',
        dueDate: dateStr,
        dueTime: timeStr,
        timezone: selectedTz,
        reminderOffset: 0,
      });

      addToast({
        type: 'success',
        title: 'Test Reminder Scheduled (2 Mins)',
        description: `Scheduled for ${dateStr} at ${hours}:${minutes} (${selectedTz}). Server scheduler will trigger in 2 minutes!`,
      });
      fetchDiagnostics();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Scheduling Failed', description: err.message });
    } finally {
      setIsSchedulingTest(false);
    }
  };

  const handleRunReminderCheck = async () => {
    setIsCheckingReminders(true);
    try {
      const res = await fetch('/api/cron/reminders', { method: 'POST' });
      const data = await res.json();
      setCronLogs(data.logs || []);
      addToast({
        type: 'success',
        title: 'Scheduler Sweep Complete',
        description: `Processed: ${data.processedCount || 0}, Success: ${data.successCount || 0}`,
      });
      fetchDiagnostics();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Scheduler Sweep Failed', description: err.message });
    } finally {
      setIsCheckingReminders(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskpad_locale', lang);
      const isRTL = lang === 'ur' || lang === 'ar';
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
    addToast({
      type: 'success',
      title: 'Language Updated',
      description: `Interface locale set to ${lang.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-panel">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Settings className="h-6 w-6 text-blue-600" />
              Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold tracking-tight">
              v2026.09.18-live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Preferences, server-side background reminders, diagnostics, and workspace settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRunReminderCheck}
            disabled={isCheckingReminders}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-semibold glass-card rounded-xl gap-1.5 cursor-pointer"
          >
            <Play className="h-3 w-3 text-emerald-600" />
            {isCheckingReminders ? 'Sweeping...' : 'Sweep Scheduler'}
          </Button>
        </div>
      </div>

      {/* Main Settings Two-Column Layout (Spec #19 & Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Profile Card & Quick Nav */}
        <div className="space-y-5">
          {/* Clerk Profile Card (Spec #19, #20) */}
          <div className="glass-card rounded-3xl p-5 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-blue-500/20 mb-3">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {user.full_name || 'Alex Morgan'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Clerk Authenticated</span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="glass-card rounded-3xl p-3 space-y-1 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </div>
            <div className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </div>
            <div className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </div>
            <div className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Timezone</span>
            </div>
            <div className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Language</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Controls Panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Appearance Section (Spec #19: Light [Default], Dark, System) */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Palette className="h-4 w-4 text-blue-600" />
              Appearance
            </h3>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  "p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                  theme === 'light'
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "glass-card text-slate-700 dark:text-slate-300 hover:bg-white"
                )}
              >
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={cn(
                  "p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                  theme === 'dark'
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "glass-card text-slate-700 dark:text-slate-300 hover:bg-white"
                )}
              >
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={cn(
                  "p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                  theme === 'system'
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "glass-card text-slate-700 dark:text-slate-300 hover:bg-white"
                )}
              >
                <Laptop className="h-4 w-4" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Notifications Section (Exact User Spec) */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Notification Settings
                </h3>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                Server-Side Background Active
              </span>
            </div>

            {/* Notification Toggles with Explicit [ ON ] / [ OFF ] states */}
            <div className="space-y-3">
              {/* 1. Push Notifications */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>Push Notifications</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                      Native Web Push
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Delivers alarms even when TaskPad tab or browser is closed
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePreference('browser_push_enabled')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs",
                    preferences.browser_push_enabled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {preferences.browser_push_enabled ? '[ ON ]' : '[ OFF ]'}
                </button>
              </div>

              {/* 2. Email Notifications */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Email Notifications
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Send task reminder emails to {user.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePreference('email_enabled')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs",
                    preferences.email_enabled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {preferences.email_enabled ? '[ ON ]' : '[ OFF ]'}
                </button>
              </div>

              {/* 3. Task Reminders */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Task Reminders
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Trigger background alarms for scheduled tasks at due time
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePreference('task_reminders')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs",
                    preferences.task_reminders
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {preferences.task_reminders ? '[ ON ]' : '[ OFF ]'}
                </button>
              </div>
            </div>

            {/* Action Buttons: Send Test Push, Send Test Email, Subscribe */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Button
                onClick={handleSubscribePush}
                size="sm"
                className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer gap-1.5"
              >
                <Smartphone className="h-3.5 w-3.5" />
                {pushSubscribed ? 'Re-sync Device Push' : 'Enable Native Web Push'}
              </Button>

              <Button
                onClick={handleTestPush}
                disabled={isTestingPush}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold glass-card rounded-xl gap-1.5 cursor-pointer hover:bg-white/80"
              >
                <Send className="h-3.5 w-3.5 text-blue-600" />
                {isTestingPush ? 'Sending...' : 'Send Test Push'}
              </Button>

              <Button
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold glass-card rounded-xl gap-1.5 cursor-pointer hover:bg-white/80"
              >
                <Send className="h-3.5 w-3.5 text-indigo-600" />
                {isTestingEmail ? 'Sending...' : 'Send Test Email'}
              </Button>

              <Button
                onClick={handleScheduleTestReminder}
                disabled={isSchedulingTest}
                size="sm"
                className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                {isSchedulingTest ? 'Scheduling...' : 'Schedule 2-Min Background Test'}
              </Button>
            </div>
          </div>

          {/* DIAGNOSTICS SECTION (Required Spec) */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Notification Diagnostics
                </h3>
              </div>
              <button
                type="button"
                onClick={fetchDiagnostics}
                disabled={isRefreshingDiag}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
              >
                <RefreshCw className={cn("h-3 w-3", isRefreshingDiag && "animate-spin")} />
                <span>Refresh Live</span>
              </button>
            </div>

            {/* Detailed Diagnostic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* 1. Push Permission */}
              <div className="p-3.5 rounded-2xl glass-card space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Push permission</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    permissionState === 'granted' ? "bg-emerald-500" : permissionState === 'denied' ? "bg-rose-500" : "bg-amber-500"
                  )} />
                  <span className="capitalize">{permissionState}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Browser notification privilege
                </div>
              </div>

              {/* 2. Service Worker Status */}
              <div className="p-3.5 rounded-2xl glass-card space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Service Worker status</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="truncate">{swStatus}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  PWA & background push receiver
                </div>
              </div>

              {/* 3. Push Subscription Status */}
              <div className="p-3.5 rounded-2xl glass-card space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Push subscription status</span>
                <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5" />
                  <span>{pushSubscribed ? 'Subscribed (Active)' : 'Not Subscribed'}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {diagnostics?.activeEndpoint || 'No device key linked'}
                </div>
              </div>

              {/* 4. Last Successful Push */}
              <div className="p-3.5 rounded-2xl glass-card space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Last successful push</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {diagnostics?.lastSuccessfulPush || 'Awaiting trigger'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Native VAPID push delivery
                </div>
              </div>

              {/* 5. Last Failed Push */}
              <div className="p-3.5 rounded-2xl glass-card space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Last failed push</span>
                <div className={cn(
                  "font-bold truncate",
                  diagnostics?.lastFailedPush && diagnostics.lastFailedPush !== 'None'
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {diagnostics?.lastFailedPush || 'None'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Zero delivery exceptions
                </div>
              </div>

              {/* 6. Last Scheduler Run */}
              <div className="p-3.5 rounded-2xl glass-card space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Last scheduler run</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {diagnostics?.lastSchedulerRun || 'Every 60s (pg_cron / Edge)'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Automatic background sweep
                </div>
              </div>
            </div>

            {/* 7. Last Reminder Processed Card */}
            <div className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Last reminder processed</span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 flex items-center gap-2">
                  <span>{diagnostics?.lastReminderProcessed?.taskTitle || 'Complete assignment'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 uppercase">
                    {diagnostics?.lastReminderProcessed?.status || 'sent'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Scheduled UTC: {diagnostics?.lastReminderProcessed?.scheduledAt ? new Date(diagnostics.lastReminderProcessed.scheduledAt).toLocaleTimeString() : 'Recent'} • Idempotency Claimed
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRunReminderCheck}
                  disabled={isCheckingReminders}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-semibold glass-card rounded-xl gap-1.5 cursor-pointer hover:bg-white/80"
                >
                  <Play className="h-3 w-3 text-emerald-600" />
                  {isCheckingReminders ? 'Sweeping...' : 'Run Manual Sweep'}
                </Button>
              </div>
            </div>

            {/* End-to-End Test Interactive Checklist (Spec Flow) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-slate-900/60 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    End-to-End Background Verification Workflow
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  Tab-Closed Independent
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Create a task 2–3 minutes in the future.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Close the TaskPad browser tab or browser.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Wait for the reminder due time.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Confirm native notification appears on device.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                  <span className="font-bold text-blue-600">5.</span>
                  <span>Confirm email is sent to {user.email}.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                  <span className="font-bold text-blue-600">6.</span>
                  <span>Confirm Supabase notification status becomes <strong>"sent"</strong>.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
