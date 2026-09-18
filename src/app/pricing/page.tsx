'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Flame,
  Crown,
  Lock,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, billingCycle }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Subscription activated! Welcome to ${planKey.replace('_', ' ').toUpperCase()}.`);
        setTimeout(() => {
          window.location.href = data.checkoutUrl || '/dashboard';
        }, 1200);
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

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
          <Link href="/pricing" className="text-blue-600 font-bold transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="hidden sm:inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-full cursor-pointer text-slate-700 dark:text-slate-200"
            >
              Dashboard
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 py-16 sm:py-20 z-10 space-y-16">
        {/* Admin Unlimited Status Banner */}
        <div className="max-w-3xl mx-auto p-4 rounded-2xl glass-panel border border-emerald-500/30 flex items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>VIP Admin Whitelist Policy</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] uppercase font-extrabold">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                <strong>malikabubakkar523@gmail.com</strong> is granted permanent, lifetime enterprise access with zero limits.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider hidden sm:block">
            Full Access
          </span>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs text-center shadow-xl animate-fade-in">
            {successMessage}
          </div>
        )}

        {/* Title & Billing Toggle */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-blue-600 dark:text-blue-400 text-xs font-bold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Predictable Plans for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Limitless Productivity
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Start for free, or unlock real 24/7 background server push reminders, unlimited tasks, and
            unlimited notes.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] font-extrabold uppercase">
                Save 27%
              </span>
            </button>
          </div>
        </div>

        {/* 4 Distinct Pricing Containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* 1. Free Starter */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-white/80 dark:border-white/10 shadow-lg relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Free Starter
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  Basic
                </span>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-black text-slate-900 dark:text-slate-100">$0</span>
                <span className="text-xs text-slate-500 font-medium ml-1">forever</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Perfect for quick trials and evaluating TaskPad fluid interface.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>Up to 4 Tasks</strong> maximum</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>Up to 2 Notes</strong> maximum</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>1 Personal Workspace</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Server Alarms (Locked)</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link href="/sign-up" className="block w-full">
                <Button variant="outline" className="w-full h-11 rounded-2xl glass-card text-xs font-bold cursor-pointer hover:bg-white/80">
                  Current Free Plan
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. Pro Monthly */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-white/80 dark:border-white/10 shadow-lg relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Pro Monthly
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  Flexible
                </span>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-black text-slate-900 dark:text-slate-100">$9</span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ month</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Unlimited tasks, notes, and 24/7 background server alerts for busy professionals.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>Unlimited Tasks</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>Unlimited Notes</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>24/7 Server Alarms</strong> (Web Push + Email)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Workspaces</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => handleSubscribe('pro_monthly')}
                disabled={loadingPlan === 'pro_monthly'}
                className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer"
              >
                {loadingPlan === 'pro_monthly' ? 'Activating...' : 'Subscribe Monthly ($9)'}
              </Button>
            </div>
          </div>

          {/* 3. Pro Annual (Most Popular) */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border-2 border-blue-500/80 shadow-2xl shadow-blue-500/15 relative scale-[1.03] z-10 bg-white/80 dark:bg-slate-900/90">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              Most Popular • Best Value
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Pro Annual
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-bold text-emerald-600">
                  Save 27%
                </span>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-black text-slate-900 dark:text-slate-100">$79</span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ year</span>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Just ~$6.58 / month
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                The ultimate productivity package with priority speed and extended version history.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Everything in Pro Monthly</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Cloud Storage</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Permanent Version History</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Priority 24/7 VIP Support</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => handleSubscribe('pro_annual')}
                disabled={loadingPlan === 'pro_annual'}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xl shadow-blue-500/30 cursor-pointer"
              >
                {loadingPlan === 'pro_annual' ? 'Activating...' : 'Subscribe Annual ($79)'}
              </Button>
            </div>
          </div>

          {/* 4. Lifetime Full Access */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-white/80 dark:border-white/10 shadow-lg relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Lifetime Full Access
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  One-Time
                </span>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-black text-slate-900 dark:text-slate-100">$149</span>
                <span className="text-xs text-slate-500 font-medium ml-1">one-time</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Pay once, use forever. All future features and major upgrades included with zero renewal fees.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-amber-500 shrink-0" />
                  <span><strong>Lifetime Unlimited</strong> Everything</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>All Future Upgrades Included</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Zero Recurring Subscriptions</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <Check className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Direct Founder Support Access</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => handleSubscribe('lifetime_access')}
                disabled={loadingPlan === 'lifetime_access'}
                className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md cursor-pointer"
              >
                {loadingPlan === 'lifetime_access' ? 'Activating...' : 'Get Lifetime Access ($149)'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-header border-t border-white/60 dark:border-slate-800/60 py-6 px-6 sm:px-10 z-10 text-xs text-slate-500 text-center">
        © 2026 TaskPad. Secure SSL 256-Bit Encrypted Payments.
      </footer>
    </div>
  );
}
