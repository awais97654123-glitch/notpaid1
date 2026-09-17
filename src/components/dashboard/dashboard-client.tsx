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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskDetailDialog } from '@/components/tasks/task-detail-dialog';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { toggleTaskCompleteAction } from '@/actions/tasks';
import { useToast } from '@/components/ui/toast';
import type { Task, Note, ProductivityStats, Project } from '@/types';
import { cn } from '@/lib/utils';

interface DashboardClientProps {
  userName: string;
  tasks: Task[];
  notes: Note[];
  stats: ProductivityStats;
  projects: Project[];
}

export function DashboardClient({
  userName,
  tasks: initialTasks,
  notes,
  stats: initialStats,
  projects,
}: DashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [stats, setStats] = useState<ProductivityStats>(initialStats);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const { addToast } = useToast();

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

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

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

      {/* Greeting & Quick Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-blue-50/50 via-white/80 to-indigo-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-blue-950/30 backdrop-blur-md shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            You have{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {dueTodayTasks.length} task{dueTodayTasks.length === 1 ? '' : 's'}
            </strong>{' '}
            due today and{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {stats.tasks_remaining} remaining
            </strong>{' '}
            tasks in your workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCreateTaskOpen(true)}
            className="gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/notes?action=new')}
            className="gap-1.5 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Productivity Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Tasks Completed</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.tasks_completed}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-60" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">All time</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Tasks Remaining</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.tasks_remaining}
            </span>
            <Clock className="h-4 w-4 text-blue-500 opacity-60" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">In progress & to do</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Overdue</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.overdue_tasks}
            </span>
            <AlertCircle className="h-4 w-4 text-rose-500 opacity-60" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Requires attention</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Notes Created</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {stats.notes_created}
            </span>
            <FileText className="h-4 w-4 text-slate-500 opacity-60" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Active notes</span>
        </Card>

        <Card className="col-span-2 sm:col-span-1 p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Completion Rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.completion_rate}%
            </span>
            <TrendingUp className="h-4 w-4 text-indigo-500 opacity-60" />
          </div>
          <Progress value={stats.completion_rate} className="h-1.5 mt-2" />
        </Card>
      </div>

      {/* Main Dashboard Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Tasks & Due Today */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Warning Alert if any */}
          {overdueTasks.length > 0 && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 dark:border-rose-900/60 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-semibold text-rose-900 dark:text-rose-200">
                  You have {overdueTasks.length} overdue task{overdueTasks.length === 1 ? '' : 's'}
                </div>
                <div className="text-rose-700 dark:text-rose-300 mt-0.5">
                  Review and reschedule overdue items to keep your momentum.
                </div>
              </div>
              <Link
                href="/tasks?filter=overdue"
                className="text-xs font-semibold text-rose-700 hover:underline shrink-0"
              >
                Review
              </Link>
            </div>
          )}

          {/* Due Today Section */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Due Today
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-medium">
                  {dueTodayTasks.length}
                </span>
              </div>
              <Link href="/tasks?filter=today" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {dueTodayTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                  No tasks due today. You are fully caught up!
                </div>
              ) : (
                dueTodayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        onClick={(e) => handleToggleComplete(task.id, e)}
                        className="cursor-pointer"
                      >
                        <Checkbox checked={task.status === 'completed'} />
                      </div>
                      <div>
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-medium",
                            task.status === 'completed'
                              ? "line-through text-slate-400"
                              : "text-slate-800 dark:text-slate-200 group-hover:text-blue-600"
                          )}
                        >
                          {task.title}
                        </span>
                        {task.due_time && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {task.due_time}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority as any} className="text-[10px]">
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Upcoming Tasks Section (e.g. Mathematics Assignment on Sept 20, 2026, 7:30 PM) */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Upcoming Tasks & Reminders
                </h3>
              </div>
              <Link href="/calendar" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                Open Calendar <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      onClick={(e) => handleToggleComplete(task.id, e)}
                      className="cursor-pointer"
                    >
                      <Checkbox checked={task.status === 'completed'} />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {task.due_date}
                        </span>
                        {task.due_time && <span>at {task.due_time}</span>}
                        {task.project && <span>• {task.project.name}</span>}
                      </div>
                    </div>
                  </div>

                  <Badge variant={task.priority as any} className="text-[10px]">
                    {task.priority.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Notes & Quick Links */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Recent Notes
                </h3>
              </div>
              <Link href="/notes" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                All notes <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {notes.slice(0, 4).map((note) => (
                <Link
                  key={note.id}
                  href={`/notes?id=${note.id}`}
                  className="block p-3 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 hover:shadow-xs hover:border-blue-300 transition-all"
                >
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {note.title}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {note.content_text || 'No preview available'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/50">
                    <span>{note.folder?.name || 'General'}</span>
                    <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
              {notes.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                  No notes yet. Click New Note to create your first page.
                </div>
              )}
            </div>
          </Card>

          {/* Quick Shortcuts Card */}
          <Card className="p-5 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950 border-indigo-100 dark:border-indigo-950">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2">
              Keyboard Shortcuts
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono text-[10px]">?</kbd> anywhere to open shortcut reference or <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono text-[10px]">Ctrl+K</kbd> for command palette.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>New Task</span>
                <kbd className="font-mono text-[10px] font-bold">T</kbd>
              </div>
              <div className="flex justify-between">
                <span>New Note</span>
                <kbd className="font-mono text-[10px] font-bold">N</kbd>
              </div>
              <div className="flex justify-between">
                <span>Search</span>
                <kbd className="font-mono text-[10px] font-bold">Ctrl+K</kbd>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
