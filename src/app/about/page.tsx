import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Heart, Sparkles, Code2, Globe2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About — TaskPad',
  description: 'Learn about the philosophy, architecture, and craftsmanship behind TaskPad.',
};

export default function AboutPage() {
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
          <Link href="/features" className="hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-blue-600 font-bold transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 sm:px-10 py-16 sm:py-24 z-10 space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-blue-600 dark:text-blue-400 text-xs font-bold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Philosophy</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Designed for Focus.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Built with Craft.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            TaskPad was created out of a desire for a clean, peaceful workspace that respects your
            attention and delivers true reliability.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 sm:p-12 space-y-8 shadow-xl border border-white/80 dark:border-white/10">
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              The Problem with Modern Productivity Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Most productivity apps have become bloated, slow, and distracting. Cluttered menus,
              heavy bundles, and client-side timers that fail when you close your browser tab destroy
              peace of mind.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We built TaskPad to solve this once and for all: an authentic Apple iOS 18 Liquid Glass
              interface powered by a genuine server-side scheduler that works 24/7 in the cloud.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="p-4 rounded-2xl glass-card space-y-2">
              <Code2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Senior Craftsmanship</h3>
              <p className="text-[11px] text-slate-500">
                100% hand-crafted TypeScript, React, and Next.js architecture with zero unnecessary fluff.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-card space-y-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Privacy by Default</h3>
              <p className="text-[11px] text-slate-500">
                Your data is protected by Supabase Row Level Security and Clerk encryption.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-card space-y-2">
              <Globe2 className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Canonical Timezones</h3>
              <p className="text-[11px] text-slate-500">
                True UTC timestamp calculations with zero daylight-saving or timezone drift.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-header border-t border-white/60 dark:border-slate-800/60 py-6 px-6 sm:px-10 z-10 text-xs text-slate-500 text-center">
        © 2026 TaskPad. Built with precision and care.
      </footer>
    </div>
  );
}
