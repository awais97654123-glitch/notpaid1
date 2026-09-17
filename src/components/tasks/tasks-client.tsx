'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  Bell,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  FolderKanban,
  Repeat,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskDetailDialog } from '@/components/tasks/task-detail-dialog';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import {
  createTaskAction,
  toggleTaskCompleteAction,
  deleteTaskAction,
} from '@/actions/tasks';
import { useToast } from '@/components/ui/toast';
import type { Task, Project, TaskPriority, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TasksClientProps {
  tasks: Task[];
  projects: Project[];
}

export function TasksClient({ tasks: initialTasks, projects }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);

  // New Task Generator State (Spec #12 & #13)
  const [genTitle, setGenTitle] = useState('Complete Mathematics Assignment');
  const [genDate, setGenDate] = useState('2026-09-20');
  const [genTime, setGenTime] = useState('19:30');
  const [genPriority, setGenPriority] = useState<TaskPriority>('high');
  const [genReminder, setGenReminder] = useState<number>(0); // 0 = at time
  const [genSubtasks, setGenSubtasks] = useState<string>('Research, Write, Review, Submit');
  const [isGenerating, setIsGenerating] = useState(false);

  const { addToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  // Smart sections
  const recentTasks = [...tasks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const todayTasks = tasks.filter((t) => t.due_date === todayStr);
  const upcomingTasks = tasks.filter(
    (t) => t.due_date && t.due_date > todayStr && t.status !== 'completed'
  );
  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.due_date < todayStr && t.status !== 'completed'
  );

  // Handle Generator Submit (Spec #13: Date 20 Sept, Time 7:30 PM, Reminder At time -> Stores in Supabase + Reminder)
  const handleGeneratorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) return;

    setIsGenerating(true);
    try {
      const detectedTz =
        typeof Intl !== 'undefined'
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi'
          : 'Asia/Karachi';

      const subtaskTitles = genSubtasks
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await createTaskAction({
        title: genTitle.trim(),
        description: 'Created via Liquid Glass Task Generator with automated server background reminder.',
        dueDate: genDate,
        dueTime: genTime.length === 5 ? `${genTime}:00` : genTime,
        timezone: detectedTz,
        priority: genPriority,
        reminderOffset: genReminder,
        subtasks: subtaskTitles,
      });

      setTasks((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Task & Reminder Created',
        description: `"${created.title}" scheduled for ${genDate} at ${genTime} (${detectedTz}).`,
      });

      // Clear/reset title for next task
      setGenTitle('');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Task Creation Failed', description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

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

  const filteredRecentTasks = recentTasks.filter((t) => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (search.trim()) {
      return (
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

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
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        projects={projects}
        onTaskCreated={() => window.location.reload()}
      />

      {/* Top Header Bar (Spec #12: Tasks, Search, Filter, Sort, New Task) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-panel">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CheckSquare className="h-6 w-6 text-blue-600" />
            Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time scheduled task pipeline with server reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="h-8 pl-8 pr-3 text-xs w-44 bg-white/60 dark:bg-slate-800/60 rounded-xl"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 text-xs rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 px-2.5 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button
            onClick={() => setCreateTaskModalOpen(true)}
            size="sm"
            className="h-8 px-3.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Top Split Section: Recent Tasks (Left) & New Task Generator (Right) (Spec #12, #13 & Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Recent Tasks */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Recent Tasks
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredRecentTasks.length} recorded
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredRecentTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center justify-between p-3 rounded-2xl glass-card hover:border-blue-400 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div onClick={(e) => handleToggleComplete(task.id, e)} className="cursor-pointer">
                      <Checkbox checked={task.status === 'completed'} />
                    </div>
                    <div className="truncate">
                      <div
                        className={cn(
                          "text-xs sm:text-sm font-semibold truncate",
                          task.status === 'completed'
                            ? "line-through text-slate-400"
                            : "text-slate-900 dark:text-slate-100 group-hover:text-blue-600"
                        )}
                      >
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        {task.due_date && <span>{task.due_date}</span>}
                        {task.due_time && <span>at {task.due_time}</span>}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span>
                            • {task.subtasks.filter((s) => s.is_completed).length}/{task.subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase",
                        task.priority === 'urgent' && "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
                        task.priority === 'high' && "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                        task.priority === 'medium' && "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
                        task.priority === 'low' && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}

              {filteredRecentTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
                  No tasks matching query.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-white/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Click any item to view details & subtasks</span>
            <span className="text-blue-600 font-semibold">Ready</span>
          </div>
        </div>

        {/* Right: New Task Generator (Spec #12 & #13 & Mockup) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <form onSubmit={handleGeneratorSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  New Task Generator
                </h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                Instant Scheduler
              </span>
            </div>

            {/* Task Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Task Title
              </label>
              <Input
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="e.g. Complete Mathematics Assignment"
                className="mt-1 h-9 rounded-xl bg-white/70 dark:bg-slate-800/70 text-xs font-medium"
                required
              />
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-blue-600" />
                  Due Date
                </label>
                <Input
                  type="date"
                  value={genDate}
                  onChange={(e) => setGenDate(e.target.value)}
                  className="mt-1 h-9 rounded-xl bg-white/70 dark:bg-slate-800/70 text-xs cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  Due Time
                </label>
                <Input
                  type="time"
                  value={genTime}
                  onChange={(e) => setGenTime(e.target.value)}
                  className="mt-1 h-9 rounded-xl bg-white/70 dark:bg-slate-800/70 text-xs cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Priority & Reminder */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  value={genPriority}
                  onChange={(e) => setGenPriority(e.target.value as TaskPriority)}
                  className="mt-1 h-9 w-full rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-800/70 px-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Bell className="h-3 w-3 text-indigo-600" />
                  Reminder
                </label>
                <select
                  value={genReminder}
                  onChange={(e) => setGenReminder(Number(e.target.value))}
                  className="mt-1 h-9 w-full rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-800/70 px-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="0">At time of task</option>
                  <option value="15">15 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
            </div>

            {/* Subtasks (Spec #17) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Checklist Subtasks (comma separated)
              </label>
              <Input
                value={genSubtasks}
                onChange={(e) => setGenSubtasks(e.target.value)}
                placeholder="Research, Write, Review, Submit"
                className="mt-1 h-9 rounded-xl bg-white/70 dark:bg-slate-800/70 text-xs"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isGenerating || !genTitle.trim()}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 font-bold text-xs gap-1.5 cursor-pointer"
            >
              {isGenerating ? 'Scheduling Task...' : 'New Task'}
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Section: Today's Tasks, Upcoming, Overdue (Spec #15 & Mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Tasks */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Today&apos;s Tasks
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
              {todayTasks.length}
            </span>
          </div>

          <div className="space-y-2">
            {todayTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="glass-card rounded-2xl p-3 cursor-pointer hover:border-blue-400 transition-all shadow-2xs"
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {t.title}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>{t.due_time || 'Today'}</span>
                  <Badge variant="outline" className="text-[9px] uppercase">
                    Today
                  </Badge>
                </div>
              </div>
            ))}
            {todayTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
                No tasks due today.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Upcoming
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
              {upcomingTasks.length}
            </span>
          </div>

          <div className="space-y-2">
            {upcomingTasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="glass-card rounded-2xl p-3 cursor-pointer hover:border-blue-400 transition-all shadow-2xs"
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {t.title}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>{t.due_date}</span>
                  <Badge variant="outline" className="text-[9px] text-indigo-600">
                    Upcoming
                  </Badge>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
                No upcoming tasks scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Overdue */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Overdue
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
              {overdueTasks.length}
            </span>
          </div>

          <div className="space-y-2">
            {overdueTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="glass-card rounded-2xl p-3 cursor-pointer border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs"
              >
                <div className="font-semibold text-xs text-rose-900 dark:text-rose-200 truncate">
                  {t.title}
                </div>
                <div className="flex items-center justify-between text-[10px] text-rose-500 mt-2">
                  <span>Due {t.due_date}</span>
                  <Badge variant="destructive" className="text-[9px]">
                    Overdue
                  </Badge>
                </div>
              </div>
            ))}
            {overdueTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-emerald-600 dark:text-emerald-400 border border-dashed rounded-2xl border-emerald-200 dark:border-emerald-900/40">
                Zero overdue tasks! Great work.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
