'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { updateTaskAction } from '@/actions/tasks';
import { useToast } from '@/components/ui/toast';
import { Calendar, Clock, CheckSquare, GripVertical, AlertCircle } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TaskKanbanProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onTasksChanged?: () => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
];

function KanbanTaskCard({
  task,
  onClick,
  isOverlay = false,
}: {
  task: Task;
  onClick?: () => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const completedSubtasks = task.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 rounded-lg border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 shadow-xs hover:shadow-md transition-all select-none",
        isDragging && "opacity-30",
        isOverlay && "rotate-2 shadow-xl border-blue-500 ring-2 ring-blue-500/20"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={onClick}
          className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-blue-600 text-start flex-1 cursor-pointer"
        >
          {task.title}
        </button>
        <div
          {...attributes}
          {...listeners}
          className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Badge variant={task.priority as any} className="text-[10px] px-1.5 py-0">
            {task.priority.toUpperCase()}
          </Badge>

          {totalSubtasks > 0 && (
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <CheckSquare className="h-3 w-3" />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>

        {task.due_date && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>{task.due_date}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  onSelectTask,
}: {
  column: { id: TaskStatus; label: string; color: string };
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 min-w-[280px] rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-900/40 p-3 transition-colors",
        isOver && "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20"
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            {column.label}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 min-h-[350px] overflow-y-auto">
        {tasks.map((task) => (
          <KanbanTaskCard
            key={task.id}
            task={task}
            onClick={() => onSelectTask(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-28 border border-dashed rounded-lg border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Drag tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskKanban({ tasks, onSelectTask, onTasksChanged }: TaskKanbanProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    try {
      await updateTaskAction(taskId, { status: newStatus });
      addToast({
        type: 'success',
        title: 'Task Moved',
        description: `Moved "${currentTask.title}" to ${newStatus.replace('_', ' ')}.`,
      });
      if (onTasksChanged) onTasksChanged();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Move Failed', description: err.message });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.status === col.id)}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanTaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
