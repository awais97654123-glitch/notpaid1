import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  const tasks = await db.getTasks({ workspaceId: ws.id });
  const notes = await db.getNotes({ workspaceId: ws.id, isTrash: false });
  const stats = await db.getProductivityStats(ws.id, user.id);
  const projects = await db.getProjects(ws.id);
  const activityLogs = await db.getActivityLogs(ws.id);

  return (
    <DashboardClient
      userName={user.full_name || 'Alex'}
      tasks={tasks}
      notes={notes}
      stats={stats}
      projects={projects}
      activityLogs={activityLogs}
    />
  );
}
