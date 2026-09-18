import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {
  Sparkles,
  ArrowRight,
  FileText,
  CheckSquare,
  Bell,
  FolderKanban,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'TaskPad — Modern Liquid Glass Productivity Platform',
  description:
    'Experience fluid note taking, structured workspace folders, task management, and true background server reminders.',
};

export default async function HomePage() {
  const { userId } = await auth();

  // Authenticated users go directly to the private Dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen liquid-glass-bg flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Ambient background light orbs */}
      <div className="ambient-orb ambient-orb-indigo" />
      <div className="ambient-orb ambient-orb-peach" />
      <div className="ambient-orb ambient-orb-sky" />

      {/* Top Public Header */}
      <header className="sticky top-0 z-50 glass-header px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="TaskPad Logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl shadow-md shadow-blue-500/20 object-contain"
            priority
          />
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
            TaskPad
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#workspace" className="hover:text-blue-600 transition-colors">Workspace</a>
          <a href="#notifications" className="hover:text-blue-600 transition-colors">Background Reminders</a>
          <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-semibold cursor-pointer">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="h-8 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center max-w-6xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/80 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium mb-6 shadow-2xs backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Next-Gen Apple Liquid Glass Aesthetics</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 max-w-4xl leading-tight sm:leading-none">
          All your thoughts, tasks, and reminders.{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Pure glass clarity.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          The unified productivity workspace combining distraction-free notes, organized folders, task checklists, and true background server-side reminders that fire even when your browser is closed.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/sign-up">
            <Button size="lg" className="h-11 px-6 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 gap-2 cursor-pointer">
              Open TaskPad Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="lg" className="h-11 px-6 text-sm font-semibold glass-card cursor-pointer">
              Sign In to Your Workspace
            </Button>
          </Link>
        </div>

        {/* Live Interactive Liquid Glass Showcase Mockup */}
        <div className="mt-14 w-full glass-panel rounded-3xl p-4 sm:p-7 shadow-2xl border border-white/80 dark:border-white/10 text-left">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-xs font-semibold text-slate-500">taskpad.app/dashboard</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Live Scheduler Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Mock Dashboard Card */}
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Good evening, Alex</h3>
                  <p className="text-[10px] text-slate-400">Here is your productivity overview.</p>
                </div>
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  A
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Completed</span>
                  <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">35</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60">
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Remaining</span>
                  <div className="text-xl font-bold text-blue-800 dark:text-blue-200">18</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Mathematics Assignment</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                  <Clock className="h-3 w-3" />
                  <span>7:30 PM (Asia/Karachi) • Reminder Active</span>
                </div>
              </div>
            </div>

            {/* Mock Note Editor Card */}
            <div className="glass-card rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Project Ideas</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium">
                  Saved
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Autonomous Web Agent Integration</p>
                <p className="text-slate-400 text-[10px]">
                  • Cloud-native PostgreSQL with Supabase RLS<br />
                  • Apple Liquid Glass frosted aesthetics<br />
                  • Subtasks & multi-device Web Push notifications
                </p>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span>Folder: Projects</span>
                <span>Last edited just now</span>
              </div>
            </div>

            {/* Mock Workspace & Folders */}
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Workspace Folders</span>
                <span className="text-[10px] text-blue-600 font-medium">4 Folders</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 flex items-center gap-2">
                  <span>🌿</span>
                  <span className="font-medium">Personal</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 flex items-center gap-2">
                  <span>🎓</span>
                  <span className="font-medium">School</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 flex items-center gap-2">
                  <span>🚀</span>
                  <span className="font-medium">Projects</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 flex items-center gap-2">
                  <span>💡</span>
                  <span className="font-medium">Ideas</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 text-[10px] text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Device Push & Transactional Email verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <section id="features" className="mt-24 text-left w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Engineered for absolute focus and reliability
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Not a prototype. A complete, production-grade productivity system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Distraction-Free Notes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full-featured Tiptap editor with headings, checklists, tables, code blocks, autosave, and immutable version snapshots.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                <CheckSquare className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Task Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quick Task Generator, subtask checklists with progress tracking, priorities, recurrence, and smart filters (Today, Upcoming, Overdue).
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Independent Background Scheduler</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reminders run on the server. Even if your browser or laptop is shut off, web push and transactional emails deliver right on time.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 flex items-center justify-center">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Canonical Timezones & i18n</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculates exact UTC intervals with zero drift. Full multilingual and bidirectional RTL support for English, Urdu, Hindi, and Arabic.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Footer Banner */}
        <div className="mt-20 w-full glass-panel rounded-3xl p-8 sm:p-12 text-center border border-white/80 dark:border-white/10 shadow-xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Ready to experience TaskPad?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Sign up in seconds with Clerk and experience the calm, focused productivity of Liquid Glass.
          </p>
          <div className="pt-2">
            <Link href="/sign-up">
              <Button size="lg" className="h-11 px-8 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-header px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 z-10">
        <p>© 2026 TaskPad. Apple Liquid Glass Inspired Productivity Web Application. Built with Next.js, Clerk & Supabase.</p>
      </footer>
    </div>
  );
}
