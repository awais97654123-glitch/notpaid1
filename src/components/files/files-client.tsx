'use client';

import React, { useState } from 'react';
import {
  Files,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import type { Attachment } from '@/types';

interface FilesClientProps {
  attachments: Attachment[];
}

export function FilesClient({ attachments: initialAttachments }: FilesClientProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [isUploading, setIsUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<Attachment | null>(null);
  const { addToast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.attachment) {
        setAttachments((prev) => [data.attachment, ...prev]);
        addToast({
          type: 'success',
          title: 'File Uploaded',
          description: `${file.name} saved to storage.`,
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', description: err.message });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* File Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold truncate">
              {previewItem?.file_name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center justify-center">
            {previewItem?.file_type.startsWith('image/') ? (
              <img
                src={previewItem.url || previewItem.storage_path}
                alt={previewItem.file_name}
                className="max-h-96 rounded-lg object-contain shadow-md"
              />
            ) : (
              <div className="p-8 text-center text-slate-500">
                <File className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-xs">Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Files className="h-5 w-5 text-blue-600" />
          Files & Attachments
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Store documents, assignment PDFs, and screenshots attached to your workspace.
        </p>
      </div>

      {/* Upload Dropzone */}
      <Card className="p-8 border-dashed border-2 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 transition-colors">
        <UploadCloud className="h-10 w-10 text-blue-500 mb-2" />
        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
          Upload Files & Attachments
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
          Upload images, documents, or assignment submissions up to 25MB.
        </p>

        <label className="cursor-pointer">
          <Button disabled={isUploading} size="sm" asChild>
            <span>{isUploading ? 'Uploading to Storage...' : 'Browse Computer'}</span>
          </Button>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </Card>

      {/* Attachments List */}
      <div className="rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
            Stored Files ({attachments.length})
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {attachments.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No files uploaded yet. Click "Browse Computer" above to upload your first attachment.
            </div>
          ) : (
            attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {file.file_type.startsWith('image/') ? (
                    <ImageIcon className="h-4 w-4 text-purple-500 shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  )}
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {file.file_name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatBytes(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {file.file_type.startsWith('image/') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewItem(file)}
                      className="h-8 px-2 text-xs gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                  )}
                  {file.url && (
                    <a
                      href={file.url}
                      download={file.file_name}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center h-8 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
