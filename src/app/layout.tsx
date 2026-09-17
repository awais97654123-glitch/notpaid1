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

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Z2xvd2luZy1kb25rZXktMzA5My5jbGVyay5hY2NvdW50cy5kZXYk';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans antialiased text-foreground"
        suppressHydrationWarning
      >
        <ClerkProvider publishableKey={clerkPublishableKey}>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
