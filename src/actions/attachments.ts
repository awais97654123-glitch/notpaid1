'use server';

import { db } from '@/lib/db/repository';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Attachment } from '@/types';

export async function getAttachmentsAction(noteId?: string) {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);
  return db.getAttachments(ws.id, noteId);
}

export async function uploadAttachmentAction(formData: FormData): Promise<Attachment> {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id);

  const file = formData.get('file') as File;
  const noteId = formData.get('noteId') as string | null;
  const folderId = formData.get('folderId') as string | null;

  if (!file) {
    throw new Error('No file provided for upload');
  }

  const fileName = file.name;
  const fileSize = file.size;
  const fileType = file.type || 'application/octet-stream';
  const filePath = `${ws.id}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  let publicUrl: string | undefined = undefined;

  // Upload to Supabase Storage bucket 'attachments' if configured
  const supabase = createAdminClient();
  if (supabase) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: true,
      });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }
  }

  // Persist record in database
  const attachment = await db.createAttachment({
    workspace_id: ws.id,
    file_name: fileName,
    file_size: fileSize,
    file_type: fileType,
    storage_path: filePath,
    note_id: noteId || undefined,
    url: publicUrl,
    uploaded_by: user.id,
  });

  // Log activity
  await db.logActivity({
    workspace_id: ws.id,
    user_id: user.id,
    action: `Uploaded file "${fileName}"`,
    entity_type: 'attachment',
    entity_id: attachment.id,
  });

  revalidatePath('/workspaces');
  revalidatePath('/dashboard');
  return attachment;
}
