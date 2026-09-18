import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {
  Play,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Star,
  FileText,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'TaskPad — Your Ideas, Tasks & Workspace All in One Place',
  description:
    'A modern productivity app to help you organize your notes, manage tasks, and get more done — beautifully.',
};

export default async function HomePage() {
  const { userId } = await auth();

  // If user is already logged in, redirect directly to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen liquid-glass-bg relative overflow-x-hidden flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Soft Ambient Refraction Orbs in Background */}
      <div className="ambient-orb ambient-orb-sky" />
      <div className="ambient-orb ambient-orb-indigo" />
      <div className="ambient-orb ambient-orb-peach" />

      {/* Modern Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full glass-header px-6 sm:px-10 py-4 flex items-center justify-between border-b border-white/70 dark:border-white/10 backdrop-blur-2xl">
        {/* Brand Logo */}
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

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link
            href="/features"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Top Right Action Button */}
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden sm:inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-full cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button
              size="sm"
              className="h-9 px-5 text-xs font-bold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section Matching User's Design Image */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 py-12 sm:py-20 lg:py-24 z-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines, Description, CTAs, Social Proof */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-7">
            {/* Main Bold Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
              Your Ideas <br />
              Tasks &amp; Workspace <br />
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                All in One Place
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed font-normal">
              A modern productivity app to help you organize your notes, manage tasks, and get more
              done — beautifully.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link href="/sign-up">
                <Button className="h-12 px-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-full glass-card hover:bg-white/95 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center gap-2.5 shadow-sm border border-white/80 dark:border-white/10 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <Play className="h-3 w-3 fill-blue-600 text-blue-600 ml-0.5" />
                  </div>
                  <span>Watch Demo</span>
                </Button>
              </Link>
            </div>

            {/* Social Proof Statistics (Exact match to reference image) */}
            <div className="pt-8 flex items-center gap-8 sm:gap-12 border-t border-slate-200/60 dark:border-slate-800/60 w-full max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  10K+
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Active Users
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  99.9%
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Uptime
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1">
                  4.8/5
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>User Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Isometric Floating Liquid Glass Mockup */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-sky-400/20 via-blue-500/20 to-indigo-500/20 rounded-3xl blur-3xl -z-10" />

            {/* 3D Mockup Container */}
            <div className="relative w-full rounded-3xl overflow-hidden glass-panel p-2.5 sm:p-4 shadow-2xl border border-white/90 dark:border-white/10 group hover:shadow-blue-500/15 transition-all duration-700">
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900">
                <Image
                  src="/hero-mockup.png"
                  alt="TaskPad 3D Liquid Glass Interface Mockup"
                  fill
                  className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                  priority
                />
              </div>

              {/* Floating Glass Pill Widget */}
              <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-panel shadow-xl border border-white/90 dark:border-white/20 backdrop-blur-xl animate-pulse">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  Stay focused • Be productive
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid Preview */}
        <section className="mt-28 pt-12 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
              Everything You Need
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Designed for speed, calm, and effortless organization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/features#notes"
              className="glass-card rounded-3xl p-6 hover:scale-[1.02] transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                Fluid Note Taking
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Distraction-free Markdown editor with checklists, tables, code blocks, and automatic
                cloud saves.
              </p>
            </Link>

            <Link
              href="/features#reminders"
              className="glass-card rounded-3xl p-6 hover:scale-[1.02] transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                24/7 Background Alarms
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                True server-side reminder scheduler. Alarms fire right on schedule even when your browser is closed.
              </p>
            </Link>

            <Link
              href="/pricing"
              className="glass-card rounded-3xl p-6 hover:scale-[1.02] transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                Workspaces &amp; Pricing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Start with our generous Free Starter tier, or unlock Unlimited workspaces with Pro Monthly and Annual plans.
              </p>
            </Link>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-20 glass-panel rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl border border-white/80 dark:border-white/10">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Ready to simplify your day?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Join thousands of professionals organizing thoughts, tasks, and alarms in TaskPad.
            </p>
            <div className="pt-3">
              <Link href="/sign-up">
                <Button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 cursor-pointer">
                  Get Started Free Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Modern Public Footer */}
      <footer className="glass-header border-t border-white/60 dark:border-slate-800/60 py-8 px-6 sm:px-10 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="TaskPad" width={24} height={24} className="h-6 w-6 rounded-md" />
            <span className="font-bold text-slate-800 dark:text-slate-200">TaskPad</span>
            <span>• © 2026 All rights reserved</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/features" className="hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/sign-in" className="hover:text-blue-600 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
