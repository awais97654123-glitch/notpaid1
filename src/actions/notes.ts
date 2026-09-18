'use server';

import { db } from '@/lib/db/repository';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { revalidatePath } from 'next/cache';
import type { Note } from '@/types';

export async function getNotesAction(params?: {
  workspaceId?: string;
  folderId?: string;
  isTrash?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
  search?: string;
}) {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, params?.workspaceId);
  return db.getNotes({
    workspaceId: ws.id,
    folderId: params?.folderId,
    isTrash: params?.isTrash,
    isArchived: params?.isArchived,
    isFavorite: params?.isFavorite,
    search: params?.search,
  });
}

export async function getNoteByIdAction(id: string) {
  return db.getNoteById(id);
}

export async function createNoteAction(data?: {
  workspaceId?: string;
  folderId?: string | null;
  projectId?: string | null;
  title?: string;
  contentJson?: any;
  contentText?: string;
}) {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, data?.workspaceId);

  // Subscription plan limit enforcement:
  // malikabubakkar523@gmail.com has unlimited lifetime access.
  // Free accounts are limited to 2 notes.
  const isUnlimitedAdmin = user.email?.toLowerCase() === 'malikabubakkar523@gmail.com';
  if (!isUnlimitedAdmin) {
    const existingNotes = await db.getNotes({ workspaceId: ws.id });
    if (existingNotes.length >= 2) {
      throw new Error(
        'PLAN_LIMIT_REACHED: Free tier is limited to 2 notes. Upgrade to Pro for unlimited notes.'
      );
    }
  }

  const note = await db.createNote({
    workspace_id: ws.id,
    folder_id: data?.folderId,
    project_id: data?.projectId,
    title: data?.title || 'Untitled Note',
    content_json: data?.contentJson,
    content_text: data?.contentText,
    created_by: user.id,
  });

  revalidatePath('/notes');
  revalidatePath('/dashboard');
  return note;
}

export async function updateNoteAction(id: string, updates: Partial<Note>) {
  const note = await db.updateNote(id, updates);
  revalidatePath('/notes');
  revalidatePath('/dashboard');
  return note;
}

export async function autosaveNoteAction(id: string, title: string, contentJson: any, contentText: string) {
  const note = await db.updateNote(id, {
    title,
    content_json: contentJson,
    content_text: contentText,
  });
  return note;
}

export async function deleteNoteAction(id: string, permanent: boolean = false) {
  const res = await db.deleteNote(id, permanent);
  revalidatePath('/notes');
  revalidatePath('/dashboard');
  return res;
}

export async function getNoteVersionsAction(noteId: string) {
  return db.getNoteVersions(noteId);
}

export async function restoreNoteVersionAction(noteId: string, versionId: string) {
  const res = await db.restoreNoteVersion(noteId, versionId);
  revalidatePath('/notes');
  return res;
}

export async function getFoldersAction(workspaceId?: string) {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, workspaceId);
  return db.getFolders(ws.id);
}

export async function createFolderAction(name: string, workspaceId?: string, icon?: string, color?: string) {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, workspaceId);
  const folder = await db.createFolder({
    workspace_id: ws.id,
    name,
    icon,
    color,
  });
  revalidatePath('/notes');
  return folder;
}
