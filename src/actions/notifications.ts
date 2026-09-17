'use server';

import { db } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { revalidatePath } from 'next/cache';
import type { NotificationItem, NotificationPreferences } from '@/types';

export async function getNotificationsAction(): Promise<NotificationItem[]> {
  const user = await getAuthenticatedUser();
  return db.getUserNotifications(user.id);
}

export async function getUnreadCountAction(): Promise<number> {
  const user = await getAuthenticatedUser();
  return db.getUnreadNotificationCount(user.id);
}

export async function markNotificationReadAction(id: string): Promise<void> {
  await db.markNotificationRead(id);
  revalidatePath('/notifications');
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await getAuthenticatedUser();
  await db.markAllNotificationsRead(user.id);
  revalidatePath('/notifications');
}

export async function getPreferencesAction(): Promise<NotificationPreferences> {
  const user = await getAuthenticatedUser();
  return db.getNotificationPreferences(user.id);
}

export async function updatePreferencesAction(updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  const user = await getAuthenticatedUser();
  const res = await db.updateNotificationPreferences(user.id, updates);
  revalidatePath('/settings');
  return res;
}
