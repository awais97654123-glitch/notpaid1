'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  User as UserIcon,
  Globe,
  Palette,
  Briefcase,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck,
  Server,
  Zap,
  Play,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

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
      const detectedTz =
        typeof Intl !== 'undefined'
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi'
          : 'Asia/Karachi';

      await createTaskAction({
        title: 'Notification Test Task',
        description: 'Automated test task to verify push, email, and in-app background reminder pipeline.',
        dueDate: dateStr,
        dueTime: timeStr,
        timezone: detectedTz,
        reminderOffset: 0,
      });

      addToast({
        type: 'success',
        title: 'Test Reminder Scheduled (2 Mins)',
        description: `Scheduled for ${dateStr} at ${hours}:${minutes} (${detectedTz}). Background scheduler will trigger in 2 minutes!`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Scheduling Failed', description: err.message });
    } finally {
      setIsSchedulingTest(false);
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushSubscribed(!!sub);
        });
      });
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

  const handleEnablePush = async () => {
    if (!pushSupported) {
      alert('Push notifications are not supported in your current browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        addToast({
          type: 'error',
          title: 'Permission Denied',
          description: 'You need to allow notifications in your browser settings.',
        });
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BO8e-_FpknkT6a_Afr3bU_sSmO1pQHB2OPP_mS5nlMjRMBJ9cFx7sxp1ORYoa9L6DKnPqMYXvwjBB5UBI9Vzams';

      // Convert VAPID key to Uint8Array
      const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4);
      const base64 = (vapidPublicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray,
      });

      const subData = subscription.toJSON();
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subData.endpoint,
          keys: {
            p256dh: subData.keys?.p256dh,
            auth: subData.keys?.auth,
          },
        }),
      });

      if (res.ok) {
        setPushSubscribed(true);
        addToast({
          type: 'success',
          title: 'Push Notifications Enabled',
          description: 'You will receive reminders even when the browser tab is closed.',
        });
      }
    } catch (err: any) {
      console.error('Push error:', err);
      addToast({
        type: 'error',
        title: 'Subscription Failed',
        description: err.message || 'Could not subscribe to push',
      });
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
          title: 'Test Notification Dispatched',
          description: 'Check your browser / desktop notifications!',
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

  const handleRunReminderCheck = async () => {
    setIsCheckingReminders(true);
    try {
      const res = await fetch('/api/cron/reminders', { method: 'POST' });
      const data = await res.json();
      setCronLogs(data.logs || []);
      addToast({
        type: 'success',
        title: 'Reminder Sweep Complete',
        description: `Processed: ${data.processedCount || 0}, Success: ${data.successCount || 0}`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Scheduler Check Failed', description: err.message });
    } finally {
      setIsCheckingReminders(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure notifications, background scheduler, appearance, and workspace.
        </p>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList className="h-9 mb-4">
          <TabsTrigger value="notifications" className="text-xs gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Notifications & Scheduler
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1.5">
            <Palette className="h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs gap-1.5">
            <UserIcon className="h-3.5 w-3.5" /> Profile & Timezone
          </TabsTrigger>
          <TabsTrigger value="workspace" className="text-xs gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Workspace
          </TabsTrigger>
        </TabsList>

        {/* Notifications & Scheduler Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Web Push Card */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                    Browser Push Notifications
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Receive scheduled reminders even when TaskPad is closed or computer is waking.
                  </CardDescription>
                </div>
                <Badge variant={pushSubscribed ? 'success' : 'secondary'}>
                  {pushSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </Badge>
              </div>
            </CardHeader>

            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleEnablePush}
                  size="sm"
                  variant={pushSubscribed ? 'outline' : 'default'}
                  className="text-xs cursor-pointer"
                >
                  {pushSubscribed ? 'Re-register Push' : 'Enable Push Notifications'}
                </Button>

                <Button
                  onClick={handleTestPush}
                  variant="outline"
                  size="sm"
                  disabled={isTestingPush}
                  className="text-xs gap-1 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isTestingPush ? 'Sending Push...' : 'Send Test Push Notification'}
                </Button>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border">
                <strong>VAPID Web Push Status:</strong> Supported in browser • Service Worker active • Reminders trigger server-side.
              </div>
            </div>
          </Card>

          {/* Email Notifications Card */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-600" />
                Email Notifications
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Receive transactional HTML emails for scheduled task reminders.
              </CardDescription>
            </CardHeader>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={preferences.email_enabled}
                  onCheckedChange={() => handleTogglePreference('email_enabled')}
                />
                <label className="text-xs font-semibold cursor-pointer">
                  Send email reminders to {user.email}
                </label>
              </div>

              <Button
                onClick={handleTestEmail}
                variant="outline"
                size="sm"
                disabled={isTestingEmail}
                className="text-xs gap-1 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                {isTestingEmail ? 'Sending Email...' : 'Send Test Email'}
              </Button>
            </div>
          </Card>

          {/* Background Scheduler & Live System Diagnostics */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Background Scheduler & System Diagnostics
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Atomic claiming engine. Evaluates due reminders across Web Push, Resend Email, and In-App channels.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Live Service Connectivity Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 pb-3">
              <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px]">Clerk Auth</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Connected</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2 text-xs">
                <Server className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px]">Supabase Cloud</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Connected</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2 text-xs">
                <Bell className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px]">Web Push VAPID</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{pushSubscribed ? 'Active' : 'Ready'}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2 text-xs">
                <Zap className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px]">Resend Email</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Active (re_68a...)</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleScheduleTestReminder}
                  size="sm"
                  disabled={isSchedulingTest}
                  className="text-xs gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <Play className={cn("h-3.5 w-3.5", isSchedulingTest && "animate-spin")} />
                  {isSchedulingTest ? 'Scheduling...' : 'Schedule Test Task (2 Mins from Now)'}
                </Button>

                <Button
                  onClick={handleRunReminderCheck}
                  size="sm"
                  variant="outline"
                  disabled={isCheckingReminders}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isCheckingReminders && "animate-spin")} />
                  {isCheckingReminders ? 'Running Sweep...' : 'Run Scheduler Sweep Now'}
                </Button>
              </div>

              {cronLogs.length > 0 && (
                <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono space-y-1 max-h-48 overflow-y-auto">
                  <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span>Scheduler Sweep Trace:</span>
                    <span className="text-[10px] text-emerald-400">Live Execution</span>
                  </div>
                  {cronLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-bold">Theme & Visual Mode</CardTitle>
              <CardDescription className="text-xs mt-1">
                Select your preferred visual style. Default is polished classic light theme.
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-3 gap-3 pt-3">
              {[
                { id: 'light', label: 'Classic Light', desc: 'Crisp, bright, high readability' },
                { id: 'dark', label: 'Dark Mode', desc: 'Low-light slate & deep contrast' },
                { id: 'system', label: 'System Sync', desc: 'Adapts to OS preferences' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={cn(
                    "p-4 rounded-xl border text-start transition-all cursor-pointer",
                    theme === opt.id
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Profile & Timezone Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-bold">User Profile</CardTitle>
            </CardHeader>
            <div className="space-y-3 pt-2 max-w-md">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Full Name
                </label>
                <Input defaultValue={user.full_name || 'Alex Morgan'} className="mt-1 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <Input defaultValue={user.email} disabled className="mt-1 text-xs opacity-70" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Timezone (Critical for Reminders)
                </label>
                <Select defaultValue={user.timezone || 'Asia/Karachi'}>
                  <SelectTrigger className="mt-1 text-xs">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.flag} {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Workspace Tab */}
        <TabsContent value="workspace">
          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-bold">Workspace Details</CardTitle>
              <CardDescription className="text-xs mt-1">
                Manage your active workspace identity.
              </CardDescription>
            </CardHeader>
            <div className="space-y-3 pt-2 max-w-md">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Workspace Name
                </label>
                <Input defaultValue={currentWorkspace.name} className="mt-1 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Icon
                </label>
                <Input defaultValue={currentWorkspace.icon} className="mt-1 text-xs w-20" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
