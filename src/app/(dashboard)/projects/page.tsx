import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { ProjectsClient } from '@/components/projects/projects-client';

export default async function ProjectsPage() {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  const projects = await db.getProjects(ws.id);

  return <ProjectsClient projects={projects} />;
}
