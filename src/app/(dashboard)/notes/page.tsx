import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { NotesClient } from '@/components/notes/notes-client';

export default async function NotesPage() {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  const notes = await db.getNotes({ workspaceId: ws.id });
  const folders = await db.getFolders(ws.id);

  return <NotesClient initialNotes={notes} initialFolders={folders} />;
}
