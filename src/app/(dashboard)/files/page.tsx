import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { FilesClient } from '@/components/files/files-client';

export default async function FilesPage() {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  const attachments = await db.getAttachments(ws.id);

  return <FilesClient attachments={attachments} />;
}
