'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  onNewTask: () => void;
  onNewNote: () => void;
}

export function KeyboardShortcuts({ onNewTask, onNewNote }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is actively editing text
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.ProseMirror');

      if (isInput) return;

      if (e.key === '?' && (e.shiftKey || e.key === '?')) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        onNewTask();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNewNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewTask, onNewNote]);

  const shortcuts = [
    { key: 'Ctrl/Cmd + K', description: 'Open Global Command Palette / Search' },
    { key: 'T', description: 'Quickly create a new task' },
    { key: 'N', description: 'Quickly create a new note' },
    { key: '?', description: 'Open this keyboard shortcut reference guide' },
    { key: 'Esc', description: 'Close active modal, menu, or dialog' },
  ];

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow across TaskPad with these shortcuts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-xs"
            >
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {s.description}
              </span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border rounded font-mono font-semibold text-slate-900 dark:text-slate-100 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
