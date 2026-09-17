'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register Service Worker for PWA and Web Push
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('TaskPad Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
    }

    // Apply saved language & direction
    const savedLocale = localStorage.getItem('taskpad_locale') || 'en';
    const isRTL = savedLocale === 'ur' || savedLocale === 'ar';
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', savedLocale);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
