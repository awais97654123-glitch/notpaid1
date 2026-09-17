'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTaskAction } from '@/actions/tasks';
import { useToast } from '@/components/ui/toast';
import { Calendar, Clock, Bell, Plus, X, Sparkles, CheckSquare, Globe } from 'lucide-react';
import { COMMON_TIMEZONES, resolveUserTimezone } from '@/lib/date/timezone';
import type { Project, TaskPriority } from '@/types';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: Project[];
  defaultDueDate?: string;
  onTaskCreated?: () => void;
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  projects = [],
  defaultDueDate,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(defaultDueDate || '');
  const [dueTime, setDueTime] = useState<string>('19:30');
  const [projectId, setProjectId] = useState<string>('');
  const [reminderOffset, setReminderOffset] = useState<number>(0);
  const [timezone, setTimezone] = useState<string>(() => {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi';
      } catch {
        return 'Asia/Karachi';
      }
    }
    return 'Asia/Karachi';
  });
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Natural language quick helper parser
  const handleNaturalLanguageParse = () => {
    const text = title.toLowerCase();
    let newDate = dueDate;
    let newTime = dueTime;
    let newPriority: TaskPriority = priority;

    const today = new Date();
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      newDate = tomorrow.toISOString().split('T')[0];
    } else if (text.includes('today')) {
      newDate = today.toISOString().split('T')[0];
    }

    // Parse time like 7:30 pm or 5pm
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3].toLowerCase();
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      newTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Parse priority flags
    if (text.includes('p:urgent') || text.includes('urgent')) newPriority = 'urgent';
    else if (text.includes('p:high') || text.includes('high priority')) newPriority = 'high';
    else if (text.includes('p:low')) newPriority = 'low';

    setDueDate(newDate);
    setDueTime(newTime);
    setPriority(newPriority);

    addToast({
      type: 'info',
      title: 'Auto-detected Task Details',
      description: `Parsed Date: ${newDate || 'None'}, Time: ${newTime}, Priority: ${newPriority}`,
    });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [...prev, newSubtaskTitle.trim()]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast({ type: 'error', title: 'Task Title Required', description: 'Please enter a title for the task.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedTime = dueTime ? (dueTime.length === 5 ? `${dueTime}:00` : dueTime) : null;
      await createTaskAction({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        dueTime: normalizedTime,
        timezone,
        projectId: projectId || null,
        reminderOffset,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
      });

      addToast({
        type: 'success',
        title: 'Task Created & Scheduled',
        description: `"${title.trim()}" reminder set for ${dueDate || 'today'} at ${dueTime} (${timezone}).`,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSubtasks([]);
      if (onTaskCreated) onTaskCreated();
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error Creating Task', description: err.message || 'Something went wrong' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a scheduled task with subtasks, due date, and background reminders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title & Quick Parser */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Task Title *
              </label>
              <button
                type="button"
                onClick={handleNaturalLanguageParse}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="h-3 w-3" />
                Auto-detect date/time
              </button>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Mathematics Assignment tomorrow at 7:30 PM"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description / Instructions
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details, problems to solve, or submission requirements..."
              rows={3}
            />
          </div>

          {/* Date, Time, and Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Due Time
              </label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <Select value={priority} onValueChange={(val: TaskPriority) => setPriority(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project & Reminder Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project
              </label>
              <Select value={projectId} onValueChange={(val) => setProjectId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.icon} {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Bell className="h-3.5 w-3.5 text-slate-400" />
                Reminder
              </label>
              <Select
                value={reminderOffset.toString()}
                onValueChange={(val) => setReminderOffset(parseInt(val, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Reminder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">At time of task</SelectItem>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="10">10 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timezone Row */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              Scheduling Timezone
            </label>
            <Select value={timezone} onValueChange={(val) => setTimezone(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
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

          {/* Subtasks Checklist Builder */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Subtasks Checklist ({subtasks.length})</span>
            </label>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border text-xs"
                  >
                    <span className="truncate">{st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask step (e.g. Problems 1 to 5)..."
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

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
