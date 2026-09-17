import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(req: NextRequest, event: any) {
  // If Clerk secret key is not yet configured in Vercel environment variables, bypass gracefully
  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.next();
  }

  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk\'s auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
