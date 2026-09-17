import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { InboxClient } from '@/components/inbox/inbox-client';

export default async function InboxPage() {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  const tasks = await db.getTasks({ workspaceId: ws.id });
  const notes = await db.getNotes({ workspaceId: ws.id, isTrash: false });

  return <InboxClient tasks={tasks} notes={notes} />;
}
