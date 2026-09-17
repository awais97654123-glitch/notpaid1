'use client';

import React, { useState } from 'react';
import { CalendarView } from '@/components/calendar/calendar-view';
import { TaskDetailDialog } from '@/components/tasks/task-detail-dialog';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import type { Task, Project } from '@/types';

interface CalendarClientProps {
  tasks: Task[];
  projects: Project[];
}

export function CalendarClient({ tasks, projects }: CalendarClientProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleCreateTaskForDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setCreateTaskOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-4 max-w-7xl mx-auto">
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
        defaultDueDate={selectedDate}
        onTaskCreated={() => window.location.reload()}
      />

      <CalendarView
        tasks={tasks}
        onSelectTask={(t) => setSelectedTask(t)}
        onCreateTaskForDate={handleCreateTaskForDate}
      />
    </div>
  );
}
