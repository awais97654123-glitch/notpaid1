import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Clock,
  CheckCircle2,
  Bell,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Target,
  BarChart3,
  Flame,
  Smartphone,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Features — TaskPad Productivity Suite',
  description:
    'Explore the full suite of TaskPad capabilities: liquid glass notes, 24/7 background reminders, project pipelines, and live analytics telemetry.',
};

export default function FeaturesPage() {
  const featureList = [
    {
      id: 'notes',
      tag: 'Notepad & Knowledge',
      title: 'Distraction-Free Liquid Glass Notes',
      desc: 'Write freely with a modern rich-text Markdown editor designed for deep focus. Features tables, task checklists, code blocks, RTL language support, word counts, and instant cloud autosave.',
      bullets: [
        'Rich Tiptap editor with nested task checklists and tables',
        'Automatic cloud autosave to Supabase PostgreSQL',
        'Immutable version history snapshots with one-click restore',
        'Bilingual RTL support for Urdu, Arabic, and English',
      ],
      icon: FileText,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'reminders',
      tag: 'Server Daemon',
      title: '24/7 True Server Background Reminders',
      desc: 'Never miss an important deadline again. Our reminder daemon runs on Supabase pg_cron and Edge Functions, firing Web Push notifications and transactional emails even when your browser tab or laptop is completely shut off.',
      bullets: [
        'Zero-drift canonical UTC timestamp conversion',
        'Native Web Push API via VAPID service workers',
        'Automated Supabase Edge Function scheduled every 60 seconds',
        'Works offline and in the background 24/7',
      ],
      icon: Bell,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'telemetry',
      tag: 'Live Telemetry',
      title: 'Real-Time Animated Productivity Metrics',
      desc: 'Gain continuous clarity on your output. Watch your daily task completion gauge animate on page load, monitor your active streak momentum, and balance urgent vs standard workloads.',
      bullets: [
        '60fps live count-up animation on page mount',
        'Circular SVG completion rate gauge',
        'Focus flame streak counter with 7-day visual tracker',
        'Multi-segment workload distribution bar (Urgent, High, Medium, Low)',
      ],
      icon: BarChart3,
      color: 'from-amber-500 to-rose-600',
    },
    {
      id: 'workspaces',
      tag: 'Organization',
      title: 'Structured Workspaces & Pipelines',
      desc: 'Keep work and life organized in dedicated workspace buckets. Filter tasks by Today, Upcoming, or Overdue, create multi-step subtasks, and track milestones with zero clutter.',
      bullets: [
        'Flexible project tags and priority classifications',
        'Quick task creation with inline subtask checklists',
        'Unified search with global Ctrl+K command palette',
        'Color-coded priority badges and time badges',
      ],
      icon: Layers,
      color: 'from-purple-600 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen liquid-glass-bg relative overflow-x-hidden flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Refraction Orbs */}
      <div className="ambient-orb ambient-orb-sky" />
      <div className="ambient-orb ambient-orb-indigo" />
      <div className="ambient-orb ambient-orb-peach" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-header px-6 sm:px-10 py-4 flex items-center justify-between border-b border-white/70 dark:border-white/10 backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-1 rounded-xl glass-card group-hover:scale-105 transition-transform shadow-md shadow-blue-500/20">
            <Image
              src="/logo.png"
              alt="TaskPad"
              width={34}
              height={34}
              className="h-8 w-8 rounded-lg object-contain"
              priority
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
            TaskPad
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/features" className="text-blue-600 font-bold transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden sm:inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-full cursor-pointer text-slate-700 dark:text-slate-200"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button
              size="sm"
              className="h-9 px-5 text-xs font-bold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 cursor-pointer"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 sm:px-10 py-16 sm:py-24 z-10 space-y-20">
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-blue-600 dark:text-blue-400 text-xs font-bold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Architecture &amp; Features</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Engineered for Calm.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Built for Performance.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Explore every feature meticulously designed by senior engineers to elevate your daily
            workflow.
          </p>
        </div>

        {/* Feature Cards Showcase */}
        <div className="space-y-12">
          {featureList.map((feat, index) => {
            const Icon = feat.icon;
            const isEven = index % 2 === 0;
            return (
              <div
                key={feat.id}
                id={feat.id}
                className="glass-panel rounded-3xl p-6 sm:p-10 shadow-xl border border-white/80 dark:border-white/10 relative overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${feat.color} text-white shadow-md`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        {feat.tag}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      {feat.title}
                    </h2>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {feat.desc}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {feat.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Preview Container */}
                  <div className="lg:col-span-5 flex items-center justify-center">
                    <div className="w-full h-56 rounded-2xl glass-card p-5 flex flex-col justify-between border border-white/90 dark:border-slate-800 shadow-inner">
                      <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Live Preview</span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-2">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {feat.title}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          Optimized &amp; Production Ready
                        </span>
                      </div>

                      <div className="pt-2 text-[10px] text-slate-500 text-center border-t border-white/60 dark:border-slate-800">
                        Zero external bloat • 100% Native TypeScript
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl border border-white/90 dark:border-white/10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Start experiencing TaskPad today
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Free forever for personal starters. Upgrade anytime for unlimited power.
          </p>
          <div className="pt-2">
            <Link href="/sign-up">
              <Button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 cursor-pointer">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-header border-t border-white/60 dark:border-slate-800/60 py-6 px-6 sm:px-10 z-10 text-xs text-slate-500 text-center">
        © 2026 TaskPad. Modern Liquid Glass Productivity Suite.
      </footer>
    </div>
  );
}
