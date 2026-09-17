'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Columns,
  List as ListIcon,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  Copy,
  Folder,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { TaskKanban } from '@/components/tasks/task-kanban';
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
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [quickAddText, setQuickAddText] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const { addToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter & Search
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'today' && t.due_date !== todayStr) return false;
    if (filter === 'upcoming' && (!t.due_date || t.due_date <= todayStr || t.status === 'completed')) return false;
    if (filter === 'overdue' && (!t.due_date || t.due_date >= todayStr || t.status === 'completed')) return false;
    if (filter === 'completed' && t.status !== 'completed') return false;

    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (projectFilter !== 'all' && t.project_id !== projectFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

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

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTaskAction(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      addToast({ type: 'info', title: 'Task Deleted' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', description: err.message });
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddText.trim()) return;

    let title = quickAddText.trim();
    let dueDate: string | null = null;
    let dueTime: string | null = '19:30:00';
    let priority: TaskPriority = 'medium';

    const lower = title.toLowerCase();
    const today = new Date();
    if (lower.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
    } else if (lower.includes('today')) {
      dueDate = today.toISOString().split('T')[0];
    }

    if (lower.includes('p:urgent') || lower.includes('urgent')) priority = 'urgent';
    else if (lower.includes('p:high')) priority = 'high';

    try {
      const created = await createTaskAction({
        title,
        dueDate,
        dueTime,
        priority,
      });

      setTasks((prev) => [created, ...prev]);
      setQuickAddText('');
      addToast({
        type: 'success',
        title: 'Task Added',
        description: `"${created.title}" scheduled.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Quick Add Error', description: err.message });
    }
  };

  const counts = {
    all: tasks.length,
    today: tasks.filter((t) => t.due_date === todayStr).length,
    upcoming: tasks.filter((t) => t.due_date && t.due_date > todayStr && t.status !== 'completed').length,
    overdue: tasks.filter((t) => t.due_date && t.due_date < todayStr && t.status !== 'completed').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
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

      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            My Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize, prioritize, and track tasks with checklists and reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'board')}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="text-xs h-7 gap-1 cursor-pointer">
                <ListIcon className="h-3.5 w-3.5" />
                List
              </TabsTrigger>
              <TabsTrigger value="board" className="text-xs h-7 gap-1 cursor-pointer">
                <Columns className="h-3.5 w-3.5" />
                Board
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={() => setCreateTaskOpen(true)}
            size="sm"
            className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="relative">
        <Input
          value={quickAddText}
          onChange={(e) => setQuickAddText(e.target.value)}
          placeholder="Quick add: e.g. Finish chemistry lab report tomorrow at 7:30 PM p:High (Press Enter)"
          className="h-10 pl-9 pr-24 text-xs sm:text-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs"
        />
        <Sparkles className="h-4 w-4 text-blue-500 absolute left-3 top-3 pointer-events-none" />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1.5 top-1.5 h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!quickAddText.trim()}
        >
          Add
        </Button>
      </form>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/70 backdrop-blur-md">
        {/* Smart Filter Pills */}
        <div className="flex flex-wrap items-center gap-1">
          {(['all', 'today', 'upcoming', 'overdue', 'completed'] as const).map((f) => {
            const count = counts[f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer flex items-center gap-1.5",
                  filter === f
                    ? "bg-blue-600 text-white shadow-2xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span>{f}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      filter === f
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Priority, Project & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-7 text-xs rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-2 text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {projects.length > 0 && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-7 text-xs rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-2 text-slate-700 dark:text-slate-300 outline-none max-w-[130px] truncate"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="h-7 pl-7 w-28 sm:w-40 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main View Display: List or Kanban */}
      {viewMode === 'board' ? (
        <TaskKanban
          tasks={filteredTasks}
          onSelectTask={(t) => setSelectedTask(t)}
          onTasksChanged={() => window.location.reload()}
        />
      ) : (
        <div className="rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No tasks match your current filter. Click New Task to create one!
              </div>
            ) : (
              filteredTasks.map((task) => {
                const completedSubtasks = task.subtasks?.filter((s) => s.is_completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;
                const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                const isOverdue = task.due_date && task.due_date < todayStr && task.status !== 'completed';

                const borderPriorityClass =
                  task.priority === 'urgent'
                    ? 'border-l-4 border-l-rose-500'
                    : task.priority === 'high'
                    ? 'border-l-4 border-l-amber-500'
                    : task.priority === 'medium'
                    ? 'border-l-4 border-l-blue-500'
                    : 'border-l-4 border-l-slate-300 dark:border-l-slate-700';

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group gap-2 sm:gap-4",
                      borderPriorityClass
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div
                        onClick={(e) => handleToggleComplete(task.id, e)}
                        className="cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                      >
                        <Checkbox checked={task.status === 'completed'} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "text-xs sm:text-sm font-medium truncate",
                              task.status === 'completed'
                                ? "line-through text-slate-400 dark:text-slate-500"
                                : "text-slate-900 dark:text-slate-100 group-hover:text-blue-600"
                            )}
                          >
                            {task.title}
                          </span>

                          {isOverdue && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                              Overdue
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                          {task.due_date && (
                            <span className={cn(
                              "flex items-center gap-1 font-medium",
                              isOverdue ? "text-rose-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                            )}>
                              <Calendar className="h-3 w-3 text-slate-400" />
                              {task.due_date}
                              {task.due_time && ` at ${task.due_time}`}
                            </span>
                          )}

                          {totalSubtasks > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="flex items-center gap-1 text-slate-500">
                                <CheckSquare className="h-3 w-3 text-slate-400" />
                                {completedSubtasks}/{totalSubtasks} ({subtaskPercent}%)
                              </span>
                              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${subtaskPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {task.project && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Folder className="h-3 w-3 text-slate-400" />
                              {task.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0">
                      <Badge variant={task.priority as any} className="text-[10px] uppercase font-semibold tracking-wider">
                        {task.priority}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteTask(task.id, e as any)}
                            className="text-rose-600 dark:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
