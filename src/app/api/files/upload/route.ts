import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const workspaceId = formData.get('workspace_id') as string | null;
    const taskId = formData.get('task_id') as string | null;
    const noteId = formData.get('note_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Size limit: 25MB
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds 25MB maximum limit' }, { status: 400 });
    }

    const currentWs = await requireWorkspace(user.id, workspaceId || undefined);
    const fileName = file.name;
    const fileType = file.type || 'application/octet-stream';
    const fileSize = file.size;
    const storagePath = `${currentWs.id}/${Date.now()}_${fileName.replace(/\s+/g, '_')}`;

    let publicUrl = '';

    // Check if Supabase storage is active
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from('taskpad-attachments')
          .upload(storagePath, buffer, {
            contentType: fileType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('taskpad-attachments')
            .getPublicUrl(storagePath);
          publicUrl = urlData?.publicUrl || '';
        }
      } catch (e) {
        console.warn('Supabase storage upload error, using local path:', e);
      }
    }

    // Record in attachments table
    const attachment = await db.createAttachment({
      workspace_id: currentWs.id,
      task_id: taskId || null,
      note_id: noteId || null,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      storage_path: storagePath,
      uploaded_by: user.id,
    });

    return NextResponse.json({
      success: true,
      attachment: {
        ...attachment,
        url: publicUrl || `/api/files/download?path=${encodeURIComponent(storagePath)}`,
      },
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error?.message || 'File upload failed' }, { status: 500 });
  }
}
