import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { WorkspacesClient } from '@/components/workspaces/workspaces-client';

export const metadata = {
  title: 'Workspaces — TaskPad',
  description: 'Manage and switch between your isolated workspaces and team environments.',
};

export default async function WorkspacesPage() {
  const user = await getAuthenticatedUser();
  const currentWs = await requireWorkspace(user.id);
  const rawWorkspaces = await db.getUserWorkspaces(user.id);

  // Compute live stats for each workspace
  const workspacesWithStats = await Promise.all(
    rawWorkspaces.map(async (ws) => {
      const projects = await db.getProjects(ws.id);
      const tasks = await db.getTasks({ workspaceId: ws.id });
      const notes = await db.getNotes({ workspaceId: ws.id, isTrash: false });

      return {
        ...ws,
        projectCount: projects.length,
        taskCount: tasks.length,
        noteCount: notes.length,
      };
    })
  );

  return (
    <WorkspacesClient
      workspaces={workspacesWithStats}
      currentWorkspaceId={currentWs.id}
    />
  );
}
