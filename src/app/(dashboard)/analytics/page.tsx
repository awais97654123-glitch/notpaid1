import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { AnalyticsClient } from '@/components/analytics/analytics-client';

export default async function AnalyticsPage() {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  const stats = await db.getProductivityStats(ws.id, user.id);

  return <AnalyticsClient stats={stats} />;
}
