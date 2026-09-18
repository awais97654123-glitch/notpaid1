import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignIn } from '@clerk/nextjs';
import { ShieldCheck, Zap, Sparkles, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Sign In — TaskPad',
  description: 'Access your secure TaskPad workspace with scheduled background reminders.',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full liquid-glass-bg relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-blue-500 selection:text-white">
      {/* Ambient background refraction light orbs */}
      <div className="ambient-orb ambient-orb-indigo" />
      <div className="ambient-orb ambient-orb-peach" />
      <div className="ambient-orb ambient-orb-sky" />

      {/* Top back navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-xl glass-card"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">
          Enterprise Security
        </span>
      </div>

      <div className="w-full max-w-md flex flex-col items-center z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="group flex flex-col items-center">
            <div className="p-1 rounded-2xl glass-card group-hover:scale-105 transition-transform shadow-xl shadow-blue-500/20 mb-3">
              <Image
                src="/logo.png"
                alt="TaskPad"
                width={52}
                height={52}
                className="h-13 w-13 rounded-xl object-contain"
                priority
              />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-slate-100">
              TaskPad
            </h1>
          </Link>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            All your thoughts, tasks & background reminders in liquid glass.
          </p>
        </div>

        {/* Clerk Sign In Card */}
        <div className="w-full flex justify-center">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: '#2563eb',
                borderRadius: '0.875rem',
                fontFamily: 'inherit',
              },
              elements: {
                rootBox: 'w-full',
                card: 'glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/90 dark:border-white/10 backdrop-blur-2xl w-full',
                headerTitle: 'text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight',
                headerSubtitle: 'text-xs text-slate-600 dark:text-slate-400 font-medium',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer',
                formFieldInput: 'rounded-xl border border-white/90 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-blue-500 shadow-2xs',
                formFieldLabel: 'text-xs font-bold text-slate-800 dark:text-slate-200',
                socialButtonsBlockButton: 'glass-card border border-white/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-2xs transition-all cursor-pointer',
                footerActionLink: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold',
                dividerLine: 'bg-slate-200/80 dark:bg-slate-800',
                dividerText: 'text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase',
                identityPreviewText: 'text-slate-900 dark:text-slate-100 font-semibold',
                identityPreviewEditButton: 'text-blue-600 hover:text-blue-700 font-semibold',
              },
            }}
          />
        </div>

        {/* Feature Trust Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-card shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Clerk Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-card shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Background Alarms</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-card shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Liquid Glass</span>
          </div>
        </div>
      </div>
    </div>
  );
}
