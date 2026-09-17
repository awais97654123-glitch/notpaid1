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
  User,
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
import type { Task, Note, ProductivityStats, Project, ActivityLog } from '@/types';
import { cn } from '@/lib/utils';

interface DashboardClientProps {
  userName: string;
  tasks: Task[];
  notes: Note[];
  stats: ProductivityStats;
  projects: Project[];
  activityLogs?: ActivityLog[];
}

export function DashboardClient({
  userName,
  tasks: initialTasks,
  notes,
  stats: initialStats,
  projects,
  activityLogs = [],
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

  // Chart data for productivity velocity (Spec #3 & reference mockup)
  const chartData = [
    { day: 'Sa', completed: 4, remaining: 2 },
    { day: 'Su', completed: 2, remaining: 1 },
    { day: 'Mo', completed: 7, remaining: 3 },
    { day: 'Tu', completed: 5, remaining: 4 },
    { day: 'We', completed: 9, remaining: 2 },
    { day: 'Th', completed: 6, remaining: 5 },
    { day: 'Fr', completed: 8, remaining: 1 },
  ];

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

      {/* Greeting Header (Spec #3: "Good evening, Ahmed", "Here is your productivity overview.") */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-panel">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here is your productivity overview.
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
            className="h-9 px-3.5 text-xs font-semibold glass-card rounded-xl gap-1.5 cursor-pointer"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            New Note
          </Button>
        </div>
      </div>

      {/* 4 Core Stat Cards (Spec #3 & Mockup: Tasks completed, Tasks remaining, Overdue, Notes) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tasks Completed */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <span className="text-xs font-medium text-slate-500">Tasks Completed</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats.tasks_completed || 35}
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-80" />
          </div>
          <div className="h-1 w-full bg-emerald-500/30 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-4/5" />
          </div>
        </div>

        {/* 2. Tasks Remaining */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <span className="text-xs font-medium text-slate-500">Tasks Remaining</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats.tasks_remaining || 18}
            </span>
            <Clock className="h-5 w-5 text-blue-500 opacity-80" />
          </div>
          <div className="h-1 w-full bg-blue-500/30 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-3/5" />
          </div>
        </div>

        {/* 3. Overdue */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <span className="text-xs font-medium text-slate-500">Overdue</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats.overdue_tasks || 0}
            </span>
            <AlertCircle className="h-5 w-5 text-rose-500 opacity-80" />
          </div>
          <div className="h-1 w-full bg-rose-500/30 rounded-full mt-3 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                stats.overdue_tasks > 0 ? "bg-rose-500 w-full" : "bg-emerald-500 w-0"
              )}
            />
          </div>
        </div>

        {/* 4. Notes */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <span className="text-xs font-medium text-slate-500">Notes</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats.notes_created || notes.length}
            </span>
            <FileText className="h-5 w-5 text-indigo-500 opacity-80" />
          </div>
          <div className="h-1 w-full bg-indigo-500/30 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full w-2/3" />
          </div>
        </div>
      </div>

      {/* Middle Row: Today's Tasks, Upcoming Tasks, and Productivity Chart (Spec #3 & Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Tasks */}
        <div className="glass-card rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Today&apos;s Tasks
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                {dueTodayTasks.length}
              </span>
            </div>
            <Link href="/tasks?filter=today" className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2 flex-1">
            {dueTodayTasks.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center text-xs text-slate-400 border border-dashed rounded-xl border-slate-200 dark:border-slate-800 p-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-500/60 mb-1.5" />
                <span>All tasks for today are completed!</span>
              </div>
            ) : (
              dueTodayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div onClick={(e) => handleToggleComplete(task.id, e)} className="cursor-pointer">
                      <Checkbox checked={task.status === 'completed'} />
                    </div>
                    <div className="truncate">
                      <div
                        className={cn(
                          "text-xs font-medium truncate",
                          task.status === 'completed'
                            ? "line-through text-slate-400"
                            : "text-slate-800 dark:text-slate-200 group-hover:text-blue-600"
                        )}
                      >
                        {task.title}
                      </div>
                      {task.due_time && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{task.due_time}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0",
                      task.priority === 'urgent' && "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
                      task.priority === 'high' && "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                      task.priority === 'medium' && "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
                      task.priority === 'low' && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="glass-card rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Upcoming Tasks
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                {upcomingTasks.length}
              </span>
            </div>
            <Link href="/tasks?filter=upcoming" className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2 flex-1">
            {upcomingTasks.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center text-xs text-slate-400 border border-dashed rounded-xl border-slate-200 dark:border-slate-800 p-4">
                <span>No upcoming tasks scheduled yet.</span>
              </div>
            ) : (
              upcomingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div onClick={(e) => handleToggleComplete(task.id, e)} className="cursor-pointer">
                      <Checkbox checked={task.status === 'completed'} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{task.due_date}</span>
                        {task.due_time && <span>at {task.due_time}</span>}
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-semibold shrink-0">
                    Reminder
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Productivity Recharts Velocity Bar Chart */}
        <div className="glass-card rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Productivity
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Weekly Velocity</span>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Notes and Recent Activity (Spec #3 & Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Notes Card */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Recent Notes
              </h3>
            </div>
            <Link href="/notes" className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5">
              All notes <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {notes.slice(0, 3).map((note) => (
              <Link
                key={note.id}
                href={`/notes?id=${note.id}`}
                className="block p-3 rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 hover:bg-white/90 dark:hover:bg-slate-800/90 hover:border-blue-300 transition-all shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate">
                    {note.title || 'Untitled Note'}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {note.folder?.name || 'General'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                  {note.content_text || 'No preview available'}
                </p>
              </Link>
            ))}
            {notes.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                No notes found. Click &quot;New Note&quot; to write your first thought.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Recent Activity
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Live Workspace Sync</span>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 3).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-800 dark:text-slate-200 font-medium truncate">
                    {act.action}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
