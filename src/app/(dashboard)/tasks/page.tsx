import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { TasksClient } from '@/components/tasks/tasks-client';

export default async function TasksPage() {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  const tasks = await db.getTasks({ workspaceId: ws.id });
  const projects = await db.getProjects(ws.id);

  return <TasksClient tasks={tasks} projects={projects} />;
}
