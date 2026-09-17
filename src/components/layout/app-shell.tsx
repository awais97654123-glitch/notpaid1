'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  FolderKanban,
  Files,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  X,
  Plus,
  ChevronDown,
  Search,
  Sparkles,
  Inbox,
  LogOut,
  User as UserIcon,
  Building2,
} from 'lucide-react';
import {
  UserButton,
  SignInButton,
  SignUpButton,
  Show,
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationCenter } from '@/components/layout/notification-center';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { CommandPalette } from '@/components/layout/command-palette';
import { KeyboardShortcuts } from '@/components/layout/keyboard-shortcuts';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
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
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(
    currentWorkspace || workspaces[0] || {
      id: 'default',
      name: 'Personal & Life',
      slug: 'personal-life',
      icon: '🌿',
      owner_id: 'default',
      created_at: '',
      updated_at: '',
    }
  );

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/inbox', label: 'Inbox', icon: Inbox },
    { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/notes', label: 'Notes', icon: FileText },
    { href: '/workspaces', label: 'Workspaces', icon: Building2 },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/files', label: 'Files', icon: Files },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950 font-sans">
      {/* Command Palette & Keyboard Shortcuts */}
      <CommandPalette
        onNewTask={() => setCreateTaskOpen(true)}
        onNewNote={() => (window.location.href = '/notes?action=new')}
      />
      <KeyboardShortcuts
        onNewTask={() => setCreateTaskOpen(true)}
        onNewNote={() => (window.location.href = '/notes?action=new')}
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

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 shrink-0">
        {/* Workspace Switcher & App Brand */}
        <div className="p-3 border-b border-slate-200/70 dark:border-slate-800/70">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-start cursor-pointer group">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {activeWorkspace.icon || '💼'}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {activeWorkspace.name}
                    </div>
                    <div className="text-[10px] text-slate-400">TaskPad Workspace</div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel className="text-xs">Workspaces</DropdownMenuLabel>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws)}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <span>{ws.icon}</span>
                  <span className="truncate">{ws.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => (window.location.href = '/settings?tab=workspace')}
                className="text-xs text-blue-600 gap-2 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Manage Workspaces
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Global Quick Action Button */}
        <div className="p-3 pb-1">
          <Button
            onClick={() => setCreateTaskOpen(true)}
            className="w-full h-9 rounded-lg shadow-xs font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Task
          </Button>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Projects Folder Section */}
          {projects.length > 0 && (
            <div className="pt-4 pb-1">
              <div className="flex items-center justify-between px-2.5 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Projects
                </span>
                <Link href="/projects" className="text-[10px] text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-0.5">
                {projects.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/tasks?project=${p.id}`}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile & Footer Controls */}
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                {user?.full_name ? user.full_name.charAt(0) : 'A'}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between px-4 z-20 shrink-0">
          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick Search Shortcut trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                document.dispatchEvent(event);
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 text-xs cursor-pointer min-w-[220px]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search or jump to...</span>
              <kbd className="ml-auto font-mono text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateTaskOpen(true)}
              size="sm"
              className="hidden sm:flex h-8 px-3 text-xs gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>

            <NotificationCenter />

            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'h-8 w-8',
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
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* Dynamic Page View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Section 69) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md flex items-center justify-around z-30 px-2 shadow-lg">
          <Link
            href="/dashboard"
            className={cn("flex flex-col items-center gap-1 text-[10px]", pathname === '/dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500')}
          >
            <LayoutDashboard className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/tasks"
            className={cn("flex flex-col items-center gap-1 text-[10px]", pathname === '/tasks' ? 'text-blue-600 font-bold' : 'text-slate-500')}
          >
            <CheckSquare className="h-4 w-4" />
            Tasks
          </Link>
          <button
            onClick={() => setCreateTaskOpen(true)}
            className="flex items-center justify-center -mt-4 h-11 w-11 rounded-full bg-blue-600 text-white shadow-md cursor-pointer hover:bg-blue-700"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
          <Link
            href="/calendar"
            className={cn("flex flex-col items-center gap-1 text-[10px]", pathname === '/calendar' ? 'text-blue-600 font-bold' : 'text-slate-500')}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Link>
          <Link
            href="/notes"
            className={cn("flex flex-col items-center gap-1 text-[10px]", pathname === '/notes' ? 'text-blue-600 font-bold' : 'text-slate-500')}
          >
            <FileText className="h-4 w-4" />
            Notes
          </Link>
        </nav>
      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-white dark:bg-slate-900 shadow-xl p-4 z-10 animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                  {activeWorkspace.icon}
                </span>
                TaskPad
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold"
                        : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{user?.email || 'alex.morgan@taskpad.app'}</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
