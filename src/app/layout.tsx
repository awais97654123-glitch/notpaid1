import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'TaskPad — Note & Task Management SaaS',
  description: 'Production-ready full-stack productivity workspace combining advanced notepad, task management, calendar, and scheduled background reminders.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
