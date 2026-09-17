import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { CalendarClient } from '@/components/calendar/calendar-client';

export default async function CalendarPage() {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  const tasks = await db.getTasks({ workspaceId: ws.id });
  const projects = await db.getProjects(ws.id);

  return <CalendarClient tasks={tasks} projects={projects} />;
}
