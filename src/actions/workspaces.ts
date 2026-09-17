'use server';

import { db } from '@/lib/db/repository';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { revalidatePath } from 'next/cache';
import type { Workspace, Project } from '@/types';

export async function getUserWorkspacesAction(): Promise<Workspace[]> {
  const user = await getAuthenticatedUser();
  return db.getUserWorkspaces(user.id);
}

export async function createWorkspaceAction(name: string, icon?: string): Promise<Workspace> {
  const user = await getAuthenticatedUser();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const ws = await db.createWorkspace({
    name,
    slug,
    icon: icon || '💼',
    owner_id: user.id,
  });
  revalidatePath('/dashboard');
  return ws;
}

export async function updateWorkspaceAction(id: string, updates: Partial<Workspace>): Promise<Workspace | null> {
  const ws = await db.updateWorkspace(id, updates);
  revalidatePath('/dashboard');
  return ws;
}

export async function getProjectsAction(workspaceId?: string): Promise<Project[]> {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, workspaceId);
  return db.getProjects(ws.id);
}

export async function createProjectAction(data: {
  workspaceId?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}): Promise<Project> {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, data.workspaceId);
  const proj = await db.createProject({
    workspace_id: ws.id,
    name: data.name,
    description: data.description,
    color: data.color || '#3B82F6',
    icon: data.icon || '📁',
    created_by: user.id,
  });
  revalidatePath('/projects');
  revalidatePath('/tasks');
  return proj;
}

export async function updateProjectAction(id: string, updates: Partial<Project>): Promise<Project | null> {
  const proj = await db.updateProject(id, updates);
  revalidatePath('/projects');
  return proj;
}
