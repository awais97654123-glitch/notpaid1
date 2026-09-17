import { currentUser, auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/repository';
import type { User, Workspace } from '@/types';

export const DEMO_USER: User = {
  id: 'a0000000-0000-0000-0000-000000000001',
  clerk_id: 'user_taskpad_demo_01',
  email: 'malikabubakkar523@gmail.com',
  full_name: 'Malik Abubakar',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  timezone: 'UTC',
  locale: 'en',
  created_at: '2026-09-17T00:00:00Z',
  updated_at: '2026-09-17T00:00:00Z',
};

export async function getAuthenticatedUser(): Promise<User> {
  try {
    const isClerkConfigured =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('pk_test_sample') &&
      process.env.CLERK_SECRET_KEY &&
      !process.env.CLERK_SECRET_KEY.includes('sk_test_taskpad_secret');

    if (isClerkConfigured) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        // Sync or retrieve user from database
        let user = await db.getUserByClerkId(clerkUser.id);
        if (!user) {
          user = await db.createUser({
            clerk_id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || 'user@taskpad.app',
            full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'TaskPad User',
            avatar_url: clerkUser.imageUrl || null,
            timezone: 'UTC',
            locale: 'en',
          });

          // Create default workspace for new user
          await db.createWorkspace({
            name: 'Personal & Life',
            slug: 'personal-life',
            icon: '🌿',
            owner_id: user.id,
          });
        }
        return user;
      }
    }
  } catch (error) {
    console.warn('Clerk auth resolution fallback to internal user:', error);
  }

  // Fallback to local authenticated user
  const existing = await db.getUserByClerkId(DEMO_USER.clerk_id);
  if (existing) return existing;
  return db.createUser(DEMO_USER);
}

export async function requireWorkspace(userId: string, requestedWorkspaceId?: string): Promise<Workspace> {
  const workspaces = await db.getUserWorkspaces(userId);
  if (workspaces.length === 0) {
    const newWs = await db.createWorkspace({
      name: 'Personal & Life',
      slug: 'personal-life',
      icon: '🌿',
      owner_id: userId,
    });
    return newWs;
  }

  if (requestedWorkspaceId) {
    const found = workspaces.find((w) => w.id === requestedWorkspaceId);
    if (found) return found;
  }

  return workspaces[0];
}
