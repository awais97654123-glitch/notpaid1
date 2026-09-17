'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  updateTaskAction,
  deleteTaskAction,
  toggleTaskCompleteAction,
  createSubtaskAction,
  toggleSubtaskAction,
  deleteSubtaskAction,
} from '@/actions/tasks';
import { useToast } from '@/components/ui/toast';
import {
  Calendar,
  Clock,
  Bell,
  Trash2,
  CheckCircle2,
  Copy,
  Folder,
  Plus,
  X,
  Edit2,
  Save,
} from 'lucide-react';
import type { Task, Subtask } from '@/types';

interface TaskDetailDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export function TaskDetailDialog({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const { addToast } = useToast();

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setSubtasks(task.subtasks || []);
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  const completedCount = subtasks.filter((s) => s.is_completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedCount / totalSubtasks) * 100) : 0;

  const handleToggleComplete = async () => {
    try {
      await toggleTaskCompleteAction(task.id);
      addToast({
        type: 'success',
        title: task.status === 'completed' ? 'Task Reopened' : 'Task Completed',
        description: `"${task.title}" updated.`,
      });
      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', description: err.message });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTaskAction(task.id);
      addToast({ type: 'info', title: 'Task Deleted', description: `"${task.title}" was removed.` });
      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', description: err.message });
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await toggleSubtaskAction(task.id, subtaskId);
      setSubtasks((prev) =>
        prev.map((s) => (s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s))
      );
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Subtask Error', description: err.message });
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      const created = await createSubtaskAction(task.id, newSubtaskTitle.trim());
      setSubtasks((prev) => [...prev, created]);
      setNewSubtaskTitle('');
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Subtask Error', description: err.message });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtaskAction(task.id, subtaskId);
      setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Subtask Error', description: err.message });
    }
  };

  const handleSaveEdits = async () => {
    try {
      await updateTaskAction(task.id, { title, description });
      setIsEditing(false);
      addToast({ type: 'success', title: 'Task Updated', description: 'Changes saved successfully.' });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', description: err.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={task.priority as any}>{task.priority.toUpperCase()}</Badge>
              <Badge variant={task.status === 'completed' ? 'success' : 'outline'}>
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {task.project && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {task.project.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 px-2 text-xs"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          <DialogTitle className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold"
              />
            ) : (
              task.title
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm text-slate-700 dark:text-slate-300">
          {/* Schedule Metadata Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-slate-400 block">Due Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {task.due_date || 'No due date'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-slate-400 block">Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {task.due_time || 'No time set'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-slate-400 block">Reminder</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {task.reminder_offset === 0 ? 'At time of task' : `${task.reminder_offset}m before`}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description
            </h4>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border p-2 text-sm bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Subtasks Progress & Interactive Checklist */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-900 dark:text-slate-100">
                Subtasks Checklist ({completedCount}/{totalSubtasks})
              </span>
              <span className="text-blue-600 font-bold">{progressPercent}%</span>
            </div>

            <Progress value={progressPercent} className="h-2" />

            <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-xs hover:bg-slate-100/70 transition-colors"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <Checkbox
                      checked={st.is_completed}
                      onCheckedChange={() => handleToggleSubtask(st.id)}
                    />
                    <span
                      className={
                        st.is_completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200 font-medium'
                      }
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask step..."
                className="text-xs h-8"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubtask}
                className="h-8 px-2 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
          <div className="text-[11px] text-slate-400">
            Created {new Date(task.created_at).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button onClick={handleSaveEdits} size="sm" className="gap-1">
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            )}
            <Button
              onClick={handleToggleComplete}
              variant={task.status === 'completed' ? 'outline' : 'default'}
              size="sm"
              className="gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
