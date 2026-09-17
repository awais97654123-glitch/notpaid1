'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  CheckSquare,
  FileText,
  Calendar,
  Settings,
  Plus,
  Folder,
  Bell,
  BarChart3,
  Moon,
  Sun,
  LayoutDashboard,
} from 'lucide-react';
import type { Task, Note, Project } from '@/types';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  tasks?: Task[];
  notes?: Note[];
  projects?: Project[];
  onNewTask?: () => void;
  onNewNote?: () => void;
}

export function CommandPalette({
  tasks = [],
  notes = [],
  projects = [],
  onNewTask,
  onNewNote,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in-0">
      <div
        className="w-full max-w-xl rounded-xl border border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/95 shadow-2xl backdrop-blur-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-3">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <Command.Input
              placeholder="Type a command or search tasks, notes, projects..."
              className="w-full h-12 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none border-none"
              autoFocus
            />
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-500">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-xs">
            <Command.Empty className="py-6 text-center text-slate-400">
              No matching tasks, notes, or commands found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="Quick Actions" className="text-slate-400 font-semibold px-2 py-1">
              <Command.Item
                onSelect={() => runCommand(() => onNewTask && onNewTask())}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="h-4 w-4 text-blue-600" />
                <span>Create New Task</span>
                <kbd className="ml-auto font-mono text-[10px] text-slate-400">T</kbd>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => onNewNote && onNewNote())}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="h-4 w-4 text-emerald-600" />
                <span>Create New Note</span>
                <kbd className="ml-auto font-mono text-[10px] text-slate-400">N</kbd>
              </Command.Item>
            </Command.Group>

            {/* Navigation */}
            <Command.Group heading="Navigation" className="text-slate-400 font-semibold px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/dashboard'))}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/tasks'))}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <CheckSquare className="h-4 w-4 text-blue-500" />
                <span>My Tasks</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/calendar'))}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span>Calendar</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/notes'))}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-emerald-500" />
                <span>Notes & Notepad</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/analytics'))}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <BarChart3 className="h-4 w-4 text-amber-500" />
                <span>Productivity Analytics</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/settings'))}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Settings</span>
              </Command.Item>
            </Command.Group>

            {/* Tasks Search Results */}
            {tasks.length > 0 && (
              <Command.Group heading="Tasks" className="text-slate-400 font-semibold px-2 py-1 mt-2">
                {tasks.slice(0, 5).map((task) => (
                  <Command.Item
                    key={task.id}
                    onSelect={() => runCommand(() => router.push(`/tasks?id=${task.id}`))}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                    <span className="truncate">{task.title}</span>
                    <span className="ml-auto text-[10px] text-slate-400">{task.priority}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Notes Search Results */}
            {notes.length > 0 && (
              <Command.Group heading="Notes" className="text-slate-400 font-semibold px-2 py-1 mt-2">
                {notes.slice(0, 5).map((note) => (
                  <Command.Item
                    key={note.id}
                    onSelect={() => runCommand(() => router.push(`/notes?id=${note.id}`))}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="truncate">{note.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
