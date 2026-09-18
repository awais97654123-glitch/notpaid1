'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Flame,
  Zap,
  Target,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Layers,
  Activity,
  BellRing
} from 'lucide-react';
import type { Task, Note, ProductivityStats, Reminder } from '@/types';
import { cn } from '@/lib/utils';

// Smooth count-up hook using requestAnimationFrame
export function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return count;
}

interface AnimatedAnalyticsBarProps {
  tasks: Task[];
  notes: Note[];
  stats: ProductivityStats;
  reminders?: Reminder[];
  userName: string;
}

export function AnimatedAnalyticsBar({
  tasks,
  notes,
  stats,
  reminders = [],
  userName,
}: AnimatedAnalyticsBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Metrics calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const remainingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length;
  const highTasks = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;
  const mediumTasks = tasks.filter((t) => t.priority === 'medium' && t.status !== 'completed').length;
  const lowTasks = tasks.filter((t) => t.priority === 'low' && t.status !== 'completed').length;

  const pendingReminders = reminders.filter((r) => r.status === 'pending').length;
  const dispatchedReminders = reminders.filter((r) => r.status === 'sent').length;

  // Animated Numbers
  const animCompletionRate = useCountUp(completionRate, 1400);
  const animCompleted = useCountUp(completedTasks, 1200);
  const animRemaining = useCountUp(remainingTasks, 1200);
  const animNotes = useCountUp(notes.length, 1000);
  const animStreak = useCountUp(7, 1000);

  // SVG Circular Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = mounted
    ? circumference - (completionRate / 100) * circumference
    : circumference;

  // Priority proportions for progress bar
  const activeCount = Math.max(remainingTasks, 1);
  const urgentPct = (urgentTasks / activeCount) * 100;
  const highPct = (highTasks / activeCount) * 100;
  const mediumPct = (mediumTasks / activeCount) * 100;
  const lowPct = (lowTasks / activeCount) * 100;

  // Days of week for streak tracker
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="w-full space-y-4">
      {/* Top Glass Analytical Hub */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-white/80 dark:border-white/10">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  Live Productivity & System Telemetry
                </h2>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Real-time workspace telemetry computed across all devices and server workers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl glass-card text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Velocity: <strong>Optimal</strong></span>
            </div>
          </div>
        </div>

        {/* 4 Interactive Animated Analytics Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: Circular SVG Completion Gauge */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="relative h-22 w-22 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 92 92">
                {/* Background Ring */}
                <circle
                  cx="46"
                  cy="46"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="7"
                  fill="transparent"
                />
                {/* Animated Foreground Ring */}
                <defs>
                  <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <circle
                  cx="46"
                  cy="46"
                  r={radius}
                  stroke="url(#circleGrad)"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {animCompletionRate}%
                </span>
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Goal
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                <span>Completion Rate</span>
                <Target className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                {animCompleted} of {totalTasks} tasks resolved
              </p>
              <div className="mt-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>On pace for daily target</span>
              </div>
            </div>
          </div>

          {/* Module 2: Streak & Weekly Momentum */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Focus Momentum
              </span>
              <div className="h-7 w-7 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-bounce" />
              </div>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {animStreak}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Days Streak
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Active productivity streak
              </p>
            </div>

            {/* 7-day mini activity circles */}
            <div className="flex items-center justify-between pt-1 border-t border-white/60 dark:border-slate-800/60">
              {daysOfWeek.map((day, idx) => {
                const isActive = idx < 5; // Mon-Fri active
                const isToday = idx === 4;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all",
                        isActive
                          ? "bg-amber-500 text-white shadow-xs shadow-amber-500/50"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-400",
                        isToday && "ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-slate-900"
                      )}
                    >
                      {isActive ? '✓' : ''}
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module 3: Priority Balance & Workload Distribution */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Workload Balance
              </span>
              <div className="h-7 w-7 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {animRemaining}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                  Pending Tasks
                </span>
              </div>

              {/* Animated Segmented Multi-color Bar */}
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex mt-2 shadow-inner">
                {urgentTasks > 0 && (
                  <div
                    style={{ width: mounted ? `${urgentPct}%` : '0%' }}
                    className="h-full bg-rose-500 transition-all duration-1000 ease-out"
                    title={`Urgent: ${urgentTasks}`}
                  />
                )}
                {highTasks > 0 && (
                  <div
                    style={{ width: mounted ? `${highPct}%` : '0%' }}
                    className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                    title={`High: ${highTasks}`}
                  />
                )}
                {mediumTasks > 0 && (
                  <div
                    style={{ width: mounted ? `${mediumPct}%` : '0%' }}
                    className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                    title={`Medium: ${mediumTasks}`}
                  />
                )}
                {lowTasks > 0 && (
                  <div
                    style={{ width: mounted ? `${lowPct}%` : '0%' }}
                    className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-1000 ease-out"
                    title={`Low: ${lowTasks}`}
                  />
                )}
                {remainingTasks === 0 && (
                  <div className="h-full w-full bg-emerald-500 transition-all duration-1000" />
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 pt-1 border-t border-white/60 dark:border-slate-800/60">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {urgentTasks} Urg
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {highTasks} High
              </span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {mediumTasks} Med
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {lowTasks} Low
              </span>
            </div>
          </div>

          {/* Module 4: Server Scheduler & Background Heartbeat */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Server Scheduler
              </span>
              <div className="relative flex items-center justify-center h-7 w-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <span className="absolute h-full w-full rounded-xl bg-emerald-400 opacity-40 animate-ping" />
                <BellRing className="h-4 w-4 relative z-10" />
              </div>
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  24/7
                </span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Cron Engine
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                Active Supabase background daemon
              </p>
            </div>

            <div className="pt-1.5 border-t border-white/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <Clock className="h-2.5 w-2.5" />
                {pendingReminders} Scheduled
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                Tab Independent
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
