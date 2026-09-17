'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Plus,
  CheckCircle2,
  FileText,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { createTaskAction, toggleTaskCompleteAction } from '@/actions/tasks';
import { createNoteAction } from '@/actions/notes';
import { useToast } from '@/components/ui/toast';
import type { Task, Note } from '@/types';

interface InboxClientProps {
  tasks: Task[];
  notes: Note[];
}

export function InboxClient({ tasks: initialTasks, notes: initialNotes }: InboxClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [captureInput, setCaptureInput] = useState('');
  const { addToast } = useToast();

  const unprocessedTasks = tasks.filter((t) => !t.project_id && t.status !== 'completed');

  const handleCapture = async (type: 'task' | 'note') => {
    if (!captureInput.trim()) return;
    try {
      if (type === 'task') {
        const created = await createTaskAction({ title: captureInput.trim() });
        setTasks((prev) => [created, ...prev]);
        addToast({ type: 'success', title: 'Captured to Task Inbox' });
      } else {
        await createNoteAction({
          title: captureInput.trim(),
          contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
        });
        addToast({ type: 'success', title: 'Captured Quick Note' });
      }
      setCaptureInput('');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Capture Failed', description: err.message });
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updated = await toggleTaskCompleteAction(taskId);
      if (updated) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Inbox className="h-5 w-5 text-blue-600" />
          Inbox & Quick Capture
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dump quick thoughts, unprocessed items, and triage them into projects or notes.
        </p>
      </div>

      {/* Quick Capture Input Box */}
      <Card className="p-4 bg-white/90 dark:bg-slate-900/90 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Input
            value={captureInput}
            onChange={(e) => setCaptureInput(e.target.value)}
            placeholder="Quick capture a thought, idea, or reminder..."
            className="text-xs sm:text-sm h-10 flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCapture('task');
              }
            }}
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleCapture('task')}
              size="sm"
              className="h-10 text-xs flex-1 sm:flex-initial gap-1 cursor-pointer"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Save as Task
            </Button>
            <Button
              onClick={() => handleCapture('note')}
              variant="outline"
              size="sm"
              className="h-10 text-xs flex-1 sm:flex-initial gap-1 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              Save as Note
            </Button>
          </div>
        </div>
      </Card>

      {/* Unprocessed Items */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Unprocessed Inbox Items ({unprocessedTasks.length})
          </h3>
          <span className="text-xs text-slate-400">Items without an assigned project</span>
        </div>

        <div className="space-y-2">
          {unprocessedTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-lg">
              Inbox Zero! All items have been processed or organized into projects.
            </div>
          ) : (
            unprocessedTasks.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 text-xs hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Checkbox
                    checked={item.status === 'completed'}
                    onCheckedChange={() => handleToggleComplete(item.id)}
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.priority as any} className="text-[10px]">
                    {item.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = `/tasks?id=${item.id}`)}
                    className="h-7 px-2 text-[11px] text-blue-600"
                  >
                    Assign Project <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
