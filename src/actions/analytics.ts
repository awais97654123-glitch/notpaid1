'use server';

import { db } from '@/lib/db/repository';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import type { ProductivityStats } from '@/types';

export async function getProductivityStatsAction(workspaceId?: string): Promise<ProductivityStats> {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, workspaceId);
  return db.getProductivityStats(ws.id, user.id);
}
