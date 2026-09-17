import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { AppShell } from '@/components/layout/app-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  const workspaces = await db.getUserWorkspaces(user.id);
  const currentWs = await requireWorkspace(user.id);
  const projects = await db.getProjects(currentWs.id);

  return (
    <AppShell
      user={user}
      workspaces={workspaces}
      currentWorkspace={currentWs}
      projects={projects}
    >
      {children}
    </AppShell>
  );
}
