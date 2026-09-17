import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { WorkspacesClient } from '@/components/workspaces/workspaces-client';

export const metadata = {
  title: 'Workspace — TaskPad',
  description: 'Manage your note folders, dedicated resource areas, and Supabase cloud attachments.',
};

export default async function WorkspacesPage() {
  const user = await getAuthenticatedUser();
  const currentWs = await requireWorkspace(user.id);
  const folders = await db.getFolders(currentWs.id);
  const notes = await db.getNotes({ workspaceId: currentWs.id, isTrash: false });
  const attachments = await db.getAttachments(currentWs.id);

  return (
    <WorkspacesClient
      currentWorkspace={currentWs}
      initialFolders={folders}
      initialNotes={notes}
      initialAttachments={attachments}
    />
  );
}
