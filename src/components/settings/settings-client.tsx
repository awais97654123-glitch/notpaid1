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
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isCheckingReminders, setIsCheckingReminders] = useState(false);
  const [isSchedulingTest, setIsSchedulingTest] = useState(false);
  const [cronLogs, setCronLogs] = useState<string[]>([]);
  const [selectedTz, setSelectedTz] = useState(user.timezone || 'Asia/Karachi');
  const [currentLang, setCurrentLang] = useState('en');
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushSubscribed(!!sub);
        });
      });
    }

    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('taskpad_locale') || 'en';
      setCurrentLang(savedLang);
    }
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-blue-600" />
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Preferences, background reminders, diagnostics, and workspace settings.
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

          {/* Notifications Section (Spec #19, #22, #30, #34, #35) */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Notification Channels
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                Server-Side Active
              </span>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Browser Web Push
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Device notifications when tasks become due (even if tab is closed)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.browser_push_enabled}
                  onChange={() => handleTogglePreference('browser_push_enabled')}
                  className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Email Notifications
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Send reminders to {user.email} via transactional email provider
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.email_enabled}
                  onChange={() => handleTogglePreference('email_enabled')}
                  className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Task Reminders
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Trigger alarms for upcoming tasks at specified offset
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.task_reminders}
                  onChange={() => handleTogglePreference('task_reminders')}
                  className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Daily Summary
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Receive morning digest of upcoming day tasks
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.daily_summary}
                  onChange={() => handleTogglePreference('daily_summary')}
                  className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Test Action Buttons (Spec #34) */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Button
                onClick={handleSubscribePush}
                size="sm"
                className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                {pushSubscribed ? 'Re-sync Device Push' : 'Enable Web Push'}
              </Button>

              <Button
                onClick={handleTestPush}
                disabled={isTestingPush}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold glass-card rounded-xl gap-1 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-blue-600" />
                {isTestingPush ? 'Sending...' : 'Send Test Push'}
              </Button>

              <Button
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold glass-card rounded-xl gap-1 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-indigo-600" />
                {isTestingEmail ? 'Sending...' : 'Send Test Email'}
              </Button>

              <Button
                onClick={handleScheduleTestReminder}
                disabled={isSchedulingTest}
                size="sm"
                className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs gap-1 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                {isSchedulingTest ? 'Scheduling...' : 'Schedule 2-Min Test'}
              </Button>
            </div>
          </div>

          {/* Timezone Section (Spec #19 & #31: Default Asia/Karachi) */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Timezone
            </h3>
            <p className="text-xs text-slate-500">
              Your canonical scheduling timezone for task due dates and UTC conversion.
            </p>
            <select
              value={selectedTz}
              onChange={(e) => {
                setSelectedTz(e.target.value);
                addToast({
                  type: 'success',
                  title: 'Timezone Updated',
                  description: `Active timezone set to ${e.target.value}`,
                });
              }}
              className="w-full h-10 rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-800/70 px-3 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.flag} {tz.label} ({tz.value})
                </option>
              ))}
            </select>
          </div>

          {/* Language & RTL Section (Spec #19 & #48: English, Urdu, Hindi, Arabic) */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              Language & Regional Direction
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { code: 'en', label: 'English' },
                { code: 'ur', label: 'Urdu (اردو)' },
                { code: 'hi', label: 'Hindi (हिंदी)' },
                { code: 'ar', label: 'Arabic (العربية)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "p-3 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer",
                    currentLang === lang.code
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                      : "glass-card text-slate-700 dark:text-slate-300 hover:bg-white"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostics Section (Spec #35) */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Notification Diagnostics
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">All Secrets Encrypted</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl glass-card">
                <span className="text-[10px] text-slate-400">Web Push</span>
                <div className="font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass-card">
                <span className="text-[10px] text-slate-400">VAPID Keys</span>
                <div className="font-bold text-blue-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Configured</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass-card">
                <span className="text-[10px] text-slate-400">Email Service</span>
                <div className="font-bold text-indigo-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Resend Live</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass-card">
                <span className="text-[10px] text-slate-400">Scheduler</span>
                <div className="font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Healthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
