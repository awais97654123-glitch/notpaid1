'use client';

import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
} from 'lucide-react';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onCreateTaskForDate: (dateStr: string) => void;
}

type CalendarMode = 'month' | 'week' | 'agenda';

export function CalendarView({
  tasks,
  onSelectTask,
  onCreateTaskForDate,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');

  // Month navigation
  const nextPeriod = () => {
    if (mode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (mode === 'week') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const prevPeriod = () => {
    if (mode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (mode === 'week') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  // Month Grid Days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Week Days
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter tasks for a specific date (YYYY-MM-DD)
  const getTasksForDay = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    return tasks.filter((t) => t.due_date === formatted);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevPeriod} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextPeriod} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={goToToday} className="h-8 text-xs font-semibold">
            Today
          </Button>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 ml-2">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as CalendarMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="month" className="text-xs h-7 px-3">
                Month
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs h-7 px-3">
                Week
              </TabsTrigger>
              <TabsTrigger value="agenda" className="text-xs h-7 px-3">
                Agenda
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            onClick={() => onCreateTaskForDate(format(currentDate, 'yyyy-MM-dd'))}
            className="h-8 text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* View: Month */}
      {mode === 'month' && (
        <div className="flex-1 flex flex-col rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md shadow-xs overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2 text-xs font-semibold text-slate-500 bg-slate-50/70 dark:bg-slate-900/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month day grid */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {monthDays.map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);
              const dateStr = format(day, 'yyyy-MM-dd');

              return (
                <div
                  key={idx}
                  onClick={() => onCreateTaskForDate(dateStr)}
                  className={cn(
                    "min-h-[90px] p-1.5 flex flex-col transition-colors cursor-pointer group relative",
                    !isCurrentMonth && "bg-slate-50/40 text-slate-400 dark:bg-slate-950/40",
                    isCurrentMonth && "hover:bg-blue-50/30 dark:hover:bg-blue-950/20",
                    isCurrentDay && "bg-blue-50/50 dark:bg-blue-950/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full",
                        isCurrentDay && "bg-blue-600 text-white font-bold"
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateTaskForDate(dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Task Chips */}
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-20">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center justify-between hover:scale-[1.02] transition-transform shadow-2xs cursor-pointer",
                          task.priority === 'urgent' && "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 border-l-2 border-rose-500",
                          task.priority === 'high' && "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200 border-l-2 border-amber-500",
                          task.priority === 'medium' && "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-200 border-l-2 border-blue-500",
                          task.priority === 'low' && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-l-2 border-slate-400",
                          task.status === 'completed' && "line-through opacity-60"
                        )}
                      >
                        <span className="truncate">{task.title}</span>
                        {task.due_time && (
                          <span className="text-[9px] opacity-75 shrink-0 ml-1">{task.due_time.slice(0, 5)}</span>
                        )}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-slate-400 font-semibold px-1">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Week */}
      {mode === 'week' && (
        <div className="flex-1 flex flex-col rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 flex-1 divide-x divide-slate-200/80 dark:divide-slate-800/80">
            {weekDays.map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentDay = isToday(day);
              const dateStr = format(day, 'yyyy-MM-dd');

              return (
                <div key={idx} className="flex flex-col p-2 min-h-[350px]">
                  <div
                    className={cn(
                      "text-center py-2 mb-2 rounded-lg border border-slate-100 dark:border-slate-800",
                      isCurrentDay && "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
                    )}
                  >
                    <div className="text-xs font-semibold text-slate-500">{format(day, 'EEE')}</div>
                    <div className={cn("text-lg font-bold", isCurrentDay ? "text-blue-600" : "text-slate-800 dark:text-slate-200")}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5 overflow-y-auto">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="p-2 rounded-lg border bg-white dark:bg-slate-900 text-xs shadow-2xs hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {task.title}
                        </div>
                        {task.due_time && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Clock className="h-3 w-3" />
                            {task.due_time}
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCreateTaskForDate(dateStr)}
                      className="w-full text-xs text-slate-400 hover:text-blue-600 h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Agenda */}
      {mode === 'agenda' && (
        <div className="flex-1 rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md shadow-xs p-4 overflow-y-auto">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Chronological Task Schedule
            </h3>
            {tasks
              .filter((t) => t.due_date)
              .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center w-14 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                      <div className="text-[10px] text-slate-400 uppercase">
                        {task.due_date ? format(new Date(task.due_date), 'MMM') : ''}
                      </div>
                      <div className="text-base text-slate-900 dark:text-slate-100">
                        {task.due_date ? format(new Date(task.due_date), 'd') : ''}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {task.due_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.due_time}
                          </span>
                        )}
                        {task.project && <span>• {task.project.name}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority as any}>{task.priority.toUpperCase()}</Badge>
                    <Badge variant={task.status === 'completed' ? 'success' : 'outline'}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            {tasks.filter((t) => t.due_date).length === 0 && (
              <div className="text-center py-16 text-slate-400 text-xs">
                No scheduled tasks found on calendar. Click 'Add Task' to schedule your first event!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
