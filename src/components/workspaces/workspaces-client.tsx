'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Folder as FolderIcon,
  FileText,
  FileCode,
  FileImage,
  UploadCloud,
  Plus,
  Search,
  ChevronRight,
  ExternalLink,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { createFolderAction, createNoteAction } from '@/actions/notes';
import { uploadAttachmentAction } from '@/actions/attachments';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { Workspace, Folder, Note, Attachment } from '@/types';

interface WorkspacesClientProps {
  currentWorkspace: Workspace;
  initialFolders: Folder[];
  initialNotes: Note[];
  initialAttachments: Attachment[];
}

export function WorkspacesClient({
  currentWorkspace,
  initialFolders,
  initialNotes,
  initialAttachments,
}: WorkspacesClientProps) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    initialFolders[0]?.id || ''
  );
  const [search, setSearch] = useState('');

  // Modals
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');
  const [isSubmittingFolder, setIsSubmittingFolder] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addToast } = useToast();

  const selectedFolder = folders.find((f) => f.id === selectedFolderId) || folders[0];

  // Filter items in active folder
  const folderNotes = notes.filter((n) => {
    const matchesFolder = selectedFolder ? n.folder_id === selectedFolder.id : true;
    if (!matchesFolder) return false;
    if (search.trim()) {
      return (
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content_text.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const folderAttachments = attachments.filter((a) => {
    if (search.trim()) {
      return a.file_name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  // Handle New Folder Creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsSubmittingFolder(true);
    try {
      const created = await createFolderAction(newFolderName.trim(), currentWorkspace.id, newFolderIcon);
      setFolders((prev) => [...prev, created]);
      setSelectedFolderId(created.id);
      setNewFolderName('');
      setCreateFolderOpen(false);
      addToast({
        type: 'success',
        title: 'Folder Created',
        description: `Folder "${created.name}" is ready.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to create folder', description: err.message });
    } finally {
      setIsSubmittingFolder(false);
    }
  };

  // Handle New Note inside current folder (Spec #4 & #8: directly opens editor)
  const handleCreateNoteInFolder = async () => {
    try {
      const created = await createNoteAction({
        folderId: selectedFolder?.id || null,
        title: 'Untitled Note',
        contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
        contentText: '',
      });
      window.location.href = `/notes?id=${created.id}`;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Note Creation Failed', description: err.message });
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedFolder) {
        formData.append('folderId', selectedFolder.id);
      }

      const uploaded = await uploadAttachmentAction(formData);
      setAttachments((prev) => [uploaded, ...prev]);
      setUploadModalOpen(false);
      addToast({
        type: 'success',
        title: 'File Uploaded',
        description: `"${file.name}" saved to Supabase storage.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', description: err.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Create Folder Modal */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="glass-panel max-w-md">
          <DialogHeader>
            <DialogTitle>Create Workspace Folder</DialogTitle>
            <DialogDescription>
              Organize your notes, documents, and attachments in a dedicated directory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Folder Name
              </label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Personal, School, Projects, Ideas..."
                className="mt-1"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Folder Icon
              </label>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {['📁', '🌿', '🎓', '🚀', '💡', '🧪', '🎨', '💼', '📊'].map((ico) => (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => setNewFolderIcon(ico)}
                    className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center text-base transition-all cursor-pointer",
                      newFolderIcon === ico
                        ? "bg-blue-600 text-white shadow-xs scale-110"
                        : "bg-white/60 dark:bg-slate-800 hover:bg-white"
                    )}
                  >
                    {ico}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateFolderOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingFolder || !newFolderName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {isSubmittingFolder ? 'Creating...' : 'Create Folder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload File Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="glass-panel max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File to Supabase Storage</DialogTitle>
            <DialogDescription>
              Upload images, PDFs, code snippets, or documents to your note workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 text-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 bg-white/40 dark:bg-slate-900/40"
            >
              <UploadCloud className="h-10 w-10 text-blue-500" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drop file here
              </div>
              <div className="text-[10px] text-slate-400">
                Supports Images (PNG, JPG), PDF documents, Word, and text files.
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            {isUploading && (
              <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-medium pt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading to Supabase Storage bucket...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Header Bar & Action Toolbar (Spec #9 & Mockup) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-panel">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FolderKanban className="h-6 w-6 text-blue-600" />
            Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize note folders, shared documents, and cloud attachments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search folders & files..."
              className="h-8 pl-8 pr-3 text-xs w-48 bg-white/60 dark:bg-slate-800/60 rounded-xl"
            />
          </div>

          <Button
            onClick={() => setCreateFolderOpen(true)}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-semibold glass-card rounded-xl gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Folder
          </Button>

          <Button
            onClick={handleCreateNoteInFolder}
            size="sm"
            className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Note
          </Button>

          <Button
            onClick={() => setUploadModalOpen(true)}
            size="sm"
            className="h-8 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs gap-1.5 cursor-pointer"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Folders Row (Spec #9: Personal, School, Projects, Ideas) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Folders
          </h2>
          <span className="text-xs text-slate-400">{folders.length} directories</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {folders.map((folder) => {
            const isSelected = selectedFolder?.id === folder.id;
            const count = notes.filter((n) => n.folder_id === folder.id).length;
            return (
              <div
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={cn(
                  "p-4 rounded-2xl cursor-pointer transition-all relative overflow-hidden group",
                  isSelected
                    ? "glass-card ring-2 ring-blue-500 shadow-md shadow-blue-500/10"
                    : "glass-card hover:translate-y-[-2px]"
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{folder.icon || '📁'}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 shadow-xs" />
                  )}
                </div>

                <div className="mt-3">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {folder.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{count} note{count === 1 ? '' : 's'}</span>
                    <span>Active</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Folder Resources & Attachments Area (Spec #8, #9 & Mockup) */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/60 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{selectedFolder?.icon || '📁'}</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedFolder?.name || 'Workspace Resources'}
              </h3>
              <p className="text-xs text-slate-400">
                Dedicated notes, attachments, and cloud documents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateNoteInFolder}
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold glass-card rounded-xl gap-1 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              Add Note
            </Button>
            <Button
              onClick={() => setUploadModalOpen(true)}
              size="sm"
              className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1 cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Add File
            </Button>
          </div>
        </div>

        {/* Contents Grid: Notes, Images, PDFs, Documents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Notes inside this folder */}
          {folderNotes.map((note) => (
            <Link
              key={note.id}
              href={`/notes?id=${note.id}`}
              className="glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-blue-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                    Note
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 line-clamp-1">
                  {note.title || 'Untitled Note'}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                  {note.content_text || 'Empty note content...'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/60 dark:border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                <span>Click to edit</span>
              </div>
            </Link>
          ))}

          {/* Attachments inside this folder */}
          {folderAttachments.map((att) => {
            const isPdf = att.file_type.includes('pdf');
            const isImg = att.file_type.includes('image');
            return (
              <div
                key={att.id}
                className="glass-card rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        isPdf && "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
                        isImg && "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300",
                        !isPdf && !isImg && "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                      )}
                    >
                      {isPdf ? 'PDF' : isImg ? 'Image' : 'Document'}
                    </span>
                    {att.url && (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-600"
                        title="Open file"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate mt-1">
                    {att.file_name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {(att.file_size / 1024 / 1024).toFixed(2)} MB • Cloud Vault
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-white/60 dark:border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{new Date(att.created_at).toLocaleDateString()}</span>
                  <span className="text-blue-600 font-semibold">Supabase</span>
                </div>
              </div>
            );
          })}

          {/* Interactive "+" Card to Add Item */}
          <div
            onClick={() => setUploadModalOpen(true)}
            className="glass-card rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col items-center justify-center text-center cursor-pointer group min-h-[140px] transition-all"
          >
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Add Resource
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Upload file or document
            </span>
          </div>
        </div>

        {folderNotes.length === 0 && folderAttachments.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
            This folder is empty. Click &quot;Add Note&quot; or &quot;Upload File&quot; to populate your workspace.
          </div>
        )}
      </div>
    </div>
  );
}
