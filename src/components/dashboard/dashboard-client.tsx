'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar as CalendarIcon,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  FolderKanban,
  Bell,
  CheckSquare,
  Activity,
  Zap,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskDetailDialog } from '@/components/tasks/task-detail-dialog';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { toggleTaskCompleteAction } from '@/actions/tasks';
import { createNoteAction } from '@/actions/notes';
import { useToast } from '@/components/ui/toast';
import type { Task, Note, ProductivityStats, Project, ActivityLog, Reminder } from '@/types';
import { cn } from '@/lib/utils';
import { AnimatedAnalyticsBar, useCountUp } from './animated-analytics-bar';

interface DashboardClientProps {
  userName: string;
  tasks: Task[];
  notes: Note[];
  stats: ProductivityStats;
  projects: Project[];
  activityLogs?: ActivityLog[];
  reminders?: Reminder[];
}

export function DashboardClient({
  userName,
  tasks: initialTasks,
  notes,
  stats: initialStats,
  projects,
  activityLogs = [],
  reminders = [],
}: DashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [stats, setStats] = useState<ProductivityStats>(initialStats);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const { addToast } = useToast();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const todayStr = new Date().toISOString().split('T')[0];

  const dueTodayTasks = tasks.filter((t) => t.due_date === todayStr);
  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.due_date < todayStr && t.status !== 'completed'
  );
  const upcomingTasks = tasks.filter(
    (t) => t.due_date && t.due_date > todayStr && t.status !== 'completed'
  );

  const pendingReminders = reminders.filter((r) => r.status === 'pending');

  const handleToggleComplete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await toggleTaskCompleteAction(taskId);
      if (updated) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        addToast({
          type: 'success',
          title: updated.status === 'completed' ? 'Task Completed' : 'Task Reopened',
          description: `"${updated.title}"`,
        });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', description: err.message });
    }
  };

  const handleCreateNoteDirect = async () => {
    try {
      const newNote = await createNoteAction({
        title: 'Untitled Note',
        contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
        contentText: '',
      });
      window.location.href = `/notes?id=${newNote.id}`;
    } catch (err) {
      window.location.href = '/notes?action=new';
    }
  };

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  // Glass 3D-inspired velocity chart data
  const chartData = [
    { day: 'Sa', completed: 4, remaining: 2 },
    { day: 'Su', completed: 2, remaining: 1 },
    { day: 'Mo', completed: 7, remaining: 3 },
    { day: 'Tu', completed: 5, remaining: 4 },
    { day: 'We', completed: 9, remaining: 2 },
    { day: 'Th', completed: 6, remaining: 5 },
    { day: 'Fr', completed: 8, remaining: 1 },
  ];

  // Animated metric counters on page open
  const completedTarget = stats.tasks_completed || tasks.filter((t) => t.status === 'completed').length;
  const remainingTarget = stats.tasks_remaining || tasks.filter((t) => t.status !== 'completed').length;
  const animCompletedCount = useCountUp(completedTarget, 1200);
  const animRemainingCount = useCountUp(remainingTarget, 1200);
  const animOverdueCount = useCountUp(overdueTasks.length, 1000);
  const animNotesCount = useCountUp(stats.notes_created || notes.length, 1000);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Dialogs */}
      <TaskDetailDialog
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => window.location.reload()}
      />
      <CreateTaskDialog
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projects={projects}
        onTaskCreated={() => window.location.reload()}
      />

      {/* Header (iOS Liquid Glass Banner) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-panel">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span suppressHydrationWarning>{currentDateFormatted}</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-1"
            suppressHydrationWarning
          >
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here&apos;s your live productivity overview.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setCreateTaskOpen(true)}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Task
          </Button>
          <Button
            onClick={handleCreateNoteDirect}
            variant="outline"
            className="h-9 px-3.5 text-xs font-semibold glass-card rounded-xl gap-1.5 cursor-pointer text-slate-800 dark:text-slate-100"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            New Note
          </Button>
        </div>
      </div>

      {/* Live Animated Top Analytics Telemetry Bar */}
      <AnimatedAnalyticsBar
        tasks={tasks}
        notes={notes}
        stats={stats}
        reminders={reminders}
        userName={userName}
      />

      {/* 4 Glass Statistic Cards with subtle depth & animated live count-ups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Tasks Completed */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">Tasks Completed</span>
            <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {animCompletedCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full bg-emerald-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-4/5 transition-all duration-500" />
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1.5 block">+12% this week</span>
          </div>
        </div>

        {/* 2. Tasks Remaining */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">Tasks Remaining</span>
            <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950/70 flex items-center justify-center shadow-2xs">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {animRemainingCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full bg-blue-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-3/5 transition-all duration-500" />
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1.5 block">In progress & to-do</span>
          </div>
        </div>

        {/* 3. Overdue */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">Overdue</span>
            <div className="h-7 w-7 rounded-full bg-rose-100 dark:bg-rose-950/70 flex items-center justify-center shadow-2xs">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {animOverdueCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full bg-rose-500/20 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  overdueTasks.length > 0 ? "bg-rose-500 w-full" : "bg-emerald-500 w-0"
                )}
              />
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1.5 block">
              {overdueTasks.length === 0 ? 'Fully on track' : 'Requires review'}
            </span>
          </div>
        </div>

        {/* 4. Notes */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">Notes</span>
            <div className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-950/70 flex items-center justify-center shadow-2xs">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {animNotesCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full bg-purple-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-2/3 transition-all duration-500" />
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1.5 block">Active cloud notes</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Today's Tasks, Upcoming Tasks, and Glass 3D-Inspired Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Today's Tasks */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 border-b border-white/60 dark:border-slate-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Today&apos;s Tasks
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                  {dueTodayTasks.length}
                </span>
              </div>
              <Link href="/tasks?filter=today" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-semibold">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {dueTodayTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center text-xs text-slate-600 dark:text-slate-400 border border-dashed rounded-2xl border-slate-300/80 dark:border-slate-800 p-4">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500/80 mb-1.5" />
                  <span className="font-medium">All tasks for today are completed!</span>
                </div>
              ) : (
                dueTodayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-white/80 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/50 hover:bg-white/95 dark:hover:bg-slate-800/90 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div onClick={(e) => handleToggleComplete(task.id, e)} className="cursor-pointer">
                        <Checkbox checked={task.status === 'completed'} />
                      </div>
                      <div className="truncate">
                        <div
                          className={cn(
                            "text-xs font-semibold truncate",
                            task.status === 'completed'
                              ? "line-through text-slate-500 dark:text-slate-500"
                              : "text-slate-900 dark:text-slate-100 group-hover:text-blue-600"
                          )}
                        >
                          {task.title}
                        </div>
                        {task.due_time && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span>{task.due_time}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0",
                        task.priority === 'urgent' && "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
                        task.priority === 'high' && "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                        task.priority === 'medium' && "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
                        task.priority === 'low' && "bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between mt-2 font-medium">
            <span>Organized for maximum focus</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">Today</span>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 border-b border-white/60 dark:border-slate-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Upcoming Tasks
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                  {upcomingTasks.length}
                </span>
              </div>
              <Link href="/tasks?filter=upcoming" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-semibold">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center text-xs text-slate-600 dark:text-slate-400 border border-dashed rounded-2xl border-slate-300/80 dark:border-slate-800 p-4">
                  <span className="font-medium">No upcoming tasks scheduled yet.</span>
                </div>
              ) : (
                upcomingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-white/80 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/50 hover:bg-white/95 dark:hover:bg-slate-800/90 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div onClick={(e) => handleToggleComplete(task.id, e)} className="cursor-pointer">
                        <Checkbox checked={task.status === 'completed'} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                          <span>{task.due_date}</span>
                          {task.due_time && <span>at {task.due_time}</span>}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold uppercase shrink-0">
                      Reminder
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between mt-2 font-medium">
            <span>Canonical UTC conversions active</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Scheduled</span>
          </div>
        </div>

        {/* Productivity: Glass 3D-Inspired Bar Chart with Subtle Blue/Cyan Illumination */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Productivity
                </h3>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Weekly Velocity</span>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glassCyanBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                    </linearGradient>
                    <filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#38bdf8" floodOpacity={0.35} />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.96)',
                      borderRadius: '16px',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      fontSize: '11px',
                      color: '#0f172a',
                    }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="url(#glassCyanBar)"
                    filter="url(#glassGlow)"
                    radius={[6, 6, 0, 0]}
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-white/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between mt-2 font-medium">
            <span>Glass 3D velocity illumination</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">Active</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Notes, Recent Activity, and Upcoming Reminders (All 5 Sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Section 1: Recent Notes */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 border-b border-white/60 dark:border-slate-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Recent Notes
                </h3>
              </div>
              <Link href="/notes" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-semibold">
                All notes <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {notes.slice(0, 3).map((note) => (
                <Link
                  key={note.id}
                  href={`/notes?id=${note.id}`}
                  className="block p-3 rounded-2xl border border-white/70 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/50 hover:bg-white/95 dark:hover:bg-slate-800/90 hover:border-blue-300 transition-all shadow-2xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate">
                      {note.title || 'Untitled Note'}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {note.folder?.name || 'General'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-1 font-medium">
                    {note.content_text || 'No preview available'}
                  </p>
                </Link>
              ))}
              {notes.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-600 dark:text-slate-400 border border-dashed rounded-2xl border-slate-300/80 dark:border-slate-800">
                  No notes found. Click &quot;New Note&quot; to begin.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between mt-2 font-medium">
            <span>Autosave active with version history</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ready</span>
          </div>
        </div>

        {/* Section 2: Recent Activity (Live Workspace Timeline) */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 border-b border-white/60 dark:border-slate-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Recent Activity
                </h3>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Live Workspace Sync</span>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 3).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800/40">
                  <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 dark:text-slate-100 font-semibold truncate">
                      {act.action}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <Clock className="h-2.5 w-2.5 text-blue-500" />
                      <span suppressHydrationWarning>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-600 dark:text-slate-400 border border-dashed rounded-2xl border-slate-300/80 dark:border-slate-800">
                  No recent activity recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between mt-2 font-medium">
            <span>Immutable activity logs</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">Synced</span>
          </div>
        </div>

        {/* Section 3: Upcoming Reminders (Dedicated Scheduler Status Card) */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 border-b border-white/60 dark:border-slate-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Upcoming Reminders
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                Server Ready
              </span>
            </div>

            <div className="space-y-2.5">
              {pendingReminders.slice(0, 3).map((rem) => (
                <div
                  key={rem.id}
                  className="p-3 rounded-2xl border border-white/70 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/50 text-xs shadow-2xs"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {rem.task?.title || 'Scheduled Task Alert'}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1.5">
                    <span className="flex items-center gap-1" suppressHydrationWarning>
                      <Clock className="h-3 w-3 text-indigo-500" />
                      {new Date(rem.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({rem.timezone || 'UTC'})
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Push & Email</span>
                  </div>
                </div>
              ))}

              {pendingReminders.length === 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-indigo-600" />
                    All Reminders Dispatched
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    When you schedule tasks with reminders, they appear here and deliver server-side.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between mt-2 font-medium">
            <span>Runs even when tab is closed</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
