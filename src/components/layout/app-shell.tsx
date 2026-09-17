'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  FileEdit,
  Settings,
  Menu,
  X,
  Plus,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  UserButton,
  SignInButton,
  SignUpButton,
  Show,
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/layout/notification-center';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { CommandPalette } from '@/components/layout/command-palette';
import { KeyboardShortcuts } from '@/components/layout/keyboard-shortcuts';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { createNoteAction } from '@/actions/notes';
import { cn } from '@/lib/utils';
import type { Workspace, Project, User } from '@/types';

interface AppShellProps {
  user?: User | null;
  workspaces?: Workspace[];
  currentWorkspace?: Workspace;
  projects?: Project[];
  children: React.ReactNode;
}

export function AppShell({
  user,
  workspaces = [],
  currentWorkspace,
  projects = [],
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Directly create note and immediately open editor (Spec #4)
  const handleNewNoteClick = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isCreatingNote) return;

    try {
      setIsCreatingNote(true);
      const newNote = await createNoteAction({
        title: 'Untitled Note',
        contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
        contentText: '',
      });
      window.location.href = `/notes?id=${newNote.id}`;
    } catch (err) {
      console.error('Error creating note:', err);
      window.location.href = '/notes?action=new';
    } finally {
      setIsCreatingNote(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden liquid-glass-bg font-sans">
      {/* Ambient background light orbs for Apple Liquid Glass */}
      <div className="ambient-orb ambient-orb-indigo" />
      <div className="ambient-orb ambient-orb-peach" />
      <div className="ambient-orb ambient-orb-sky" />

      {/* Global Command Palette & Keyboard Shortcuts */}
      <CommandPalette
        onNewTask={() => setCreateTaskOpen(true)}
        onNewNote={handleNewNoteClick}
      />
      <KeyboardShortcuts
        onNewTask={() => setCreateTaskOpen(true)}
        onNewNote={handleNewNoteClick}
      />

      {/* Task Creation Modal */}
      <CreateTaskDialog
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projects={projects}
        onTaskCreated={() => {
          if (pathname === '/tasks' || pathname === '/dashboard') {
            window.location.reload();
          }
        }}
      />

      {/* Desktop Persistent Sidebar - STRICT 5-ITEM NAVIGATION (Spec #2 & #60) */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/60 dark:border-slate-800/60 glass-panel z-30 shrink-0">
        {/* App Brand Header */}
        <div className="p-4 border-b border-white/50 dark:border-slate-800/50 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              TP
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                TaskPad
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Liquid Glass</div>
            </div>
          </Link>
        </div>

        {/* Primary 5 Main Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {/* 1. Dashboard */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
              pathname === '/dashboard'
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <LayoutDashboard className={cn("h-4 w-4", pathname === '/dashboard' ? "text-white" : "text-slate-400")} />
            <span>Dashboard</span>
          </Link>

          {/* 2. New Note (Spec #4: Direct Action creates note & immediately opens editor) */}
          <button
            type="button"
            onClick={handleNewNoteClick}
            disabled={isCreatingNote}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-start cursor-pointer",
              pathname.startsWith('/notes')
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            {isCreatingNote ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <FileEdit className={cn("h-4 w-4", pathname.startsWith('/notes') ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
            )}
            <span>New Note</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold uppercase">
              New
            </span>
          </button>

          {/* 3. Workspace */}
          <Link
            href="/workspaces"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
              pathname.startsWith('/workspaces')
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <FolderKanban className={cn("h-4 w-4", pathname.startsWith('/workspaces') ? "text-white" : "text-slate-400")} />
            <span>Workspace</span>
          </Link>

          {/* 4. Tasks */}
          <Link
            href="/tasks"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
              pathname.startsWith('/tasks')
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <CheckSquare className={cn("h-4 w-4", pathname.startsWith('/tasks') ? "text-white" : "text-slate-400")} />
            <span>Tasks</span>
          </Link>

          {/* 5. Settings */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
              pathname.startsWith('/settings')
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Settings className={cn("h-4 w-4", pathname.startsWith('/settings') ? "text-white" : "text-slate-400")} />
            <span>Settings</span>
          </Link>
        </nav>

        {/* User Profile & Quick Controls Footer */}
        <div className="p-3 border-t border-white/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.full_name || 'Alex Morgan'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'alex.morgan@taskpad.app'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-20">
        {/* Top Liquid Glass Header Bar */}
        <header className="h-14 border-b border-white/60 dark:border-slate-800/60 glass-header flex items-center justify-between px-4 z-20 shrink-0">
          {/* Mobile Menu Hamburger & Search */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick Search trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                document.dispatchEvent(event);
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 text-xs cursor-pointer min-w-[220px] shadow-2xs backdrop-blur-md"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search or jump to...</span>
              <kbd className="ml-auto font-mono text-[10px] bg-white/80 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateTaskOpen(true)}
              size="sm"
              className="hidden sm:flex h-8 px-3 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>

            <NotificationCenter />

            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'h-8 w-8 rounded-xl',
                  },
                }}
              />
            </Show>
            <Show when="signed-out">
              <div className="flex items-center gap-1.5">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-medium cursor-pointer">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="h-8 px-2.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </Show>

            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Dynamic Page View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar - STRICT 5 PRIMARY DESTINATIONS (Spec #44 & #45) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-dock border-t border-white/70 dark:border-slate-800/70 flex items-center justify-around z-30 px-3">
          {/* 1. Dashboard */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px]",
              pathname === '/dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Home</span>
          </Link>

          {/* 2. Tasks */}
          <Link
            href="/tasks"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px]",
              pathname.startsWith('/tasks') ? 'text-blue-600 font-bold' : 'text-slate-500'
            )}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Tasks</span>
          </Link>

          {/* 3. Center Action: Direct New Note / Editor */}
          <button
            type="button"
            onClick={handleNewNoteClick}
            disabled={isCreatingNote}
            className="flex items-center justify-center -mt-5 h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Create New Note"
          >
            {isCreatingNote ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-6 w-6 stroke-[2.5]" />
            )}
          </button>

          {/* 4. Workspace */}
          <Link
            href="/workspaces"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px]",
              pathname.startsWith('/workspaces') ? 'text-blue-600 font-bold' : 'text-slate-500'
            )}
          >
            <FolderKanban className="h-4 w-4" />
            <span>Workspace</span>
          </Link>

          {/* 5. Settings */}
          <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px]",
              pathname.startsWith('/settings') ? 'text-blue-600 font-bold' : 'text-slate-500'
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] glass-dock p-4 z-10 animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/60 dark:border-slate-800/60">
              <span className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  TP
                </div>
                TaskPad
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  pathname === '/dashboard' ? "bg-blue-600 text-white font-semibold" : "text-slate-600 dark:text-slate-300"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNewNoteClick();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white/60 text-start"
              >
                <FileEdit className="h-4 w-4 text-emerald-600" />
                <span>New Note</span>
              </button>

              <Link
                href="/workspaces"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  pathname.startsWith('/workspaces') ? "bg-blue-600 text-white font-semibold" : "text-slate-600 dark:text-slate-300"
                )}
              >
                <FolderKanban className="h-4 w-4" />
                <span>Workspace</span>
              </Link>

              <Link
                href="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  pathname.startsWith('/tasks') ? "bg-blue-600 text-white font-semibold" : "text-slate-600 dark:text-slate-300"
                )}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  pathname.startsWith('/settings') ? "bg-blue-600 text-white font-semibold" : "text-slate-600 dark:text-slate-300"
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-white/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[160px]">{user?.email || 'alex.morgan@taskpad.app'}</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
