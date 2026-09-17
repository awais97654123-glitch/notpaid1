import React from 'react';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { db } from '@/lib/db/repository';
import { SettingsClient } from '@/components/settings/settings-client';

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();
  const workspaces = await db.getUserWorkspaces(user.id);
  const currentWs = await requireWorkspace(user.id);
  const preferences = await db.getNotificationPreferences(user.id);

  return (
    <SettingsClient
      user={user}
      preferences={preferences}
      workspaces={workspaces}
      currentWorkspace={currentWs}
    />
  );
}
