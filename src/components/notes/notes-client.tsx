'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Star,
  Pin,
  Trash2,
  Folder as FolderIcon,
  Archive,
  History,
  MoreVertical,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoteEditor } from '@/components/notes/editor';
import { VersionHistoryDialog } from '@/components/notes/version-history-dialog';
import {
  createNoteAction,
  deleteNoteAction,
  updateNoteAction,
  createFolderAction,
} from '@/actions/notes';
import { useToast } from '@/components/ui/toast';
import type { Note, Folder } from '@/types';
import { cn } from '@/lib/utils';

interface NotesClientProps {
  initialNotes: Note[];
  initialFolders: Folder[];
}

export function NotesClient({ initialNotes, initialFolders }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(
    initialNotes[0]?.id || null
  );
  const [filter, setFilter] = useState<'all' | 'favorites' | 'pinned' | 'trash'>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const { addToast } = useToast();

  const searchParams = useSearchParams();
  const urlNoteId = searchParams.get('id');
  const urlAction = searchParams.get('action');

  // Handle direct navigation to a note or 'new' action (Spec #4)
  useEffect(() => {
    if (urlNoteId) {
      setActiveNoteId(urlNoteId);
    } else if (urlAction === 'new') {
      handleCreateNote();
    }
  }, [urlNoteId, urlAction]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (filter === 'trash') return n.is_trash;
    if (n.is_trash) return false;

    if (filter === 'favorites' && !n.is_favorite) return false;
    if (filter === 'pinned' && !n.is_pinned) return false;
    if (selectedFolderId && n.folder_id !== selectedFolderId) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content_text.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateNote = async () => {
    try {
      const created = await createNoteAction({
        folderId: selectedFolderId,
        title: 'Untitled Note',
        contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
        contentText: '',
      });
      setNotes((prev) => [created, ...prev]);
      setActiveNoteId(created.id);
      addToast({ type: 'success', title: 'New Note Created' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Create Note Failed', description: err.message });
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter new folder name:');
    if (!name?.trim()) return;
    try {
      const f = await createFolderAction(name.trim());
      setFolders((prev) => [...prev, f]);
      addToast({ type: 'success', title: 'Folder Created', description: `"${name.trim()}"` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Folder Error', description: err.message });
    }
  };

  const handleToggleFavorite = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await updateNoteAction(note.id, { is_favorite: !note.is_favorite });
      if (updated) {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Favorite Error', description: err.message });
    }
  };

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await updateNoteAction(note.id, { is_pinned: !note.is_pinned });
      if (updated) {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Pin Error', description: err.message });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Move note to trash?')) return;
    try {
      await deleteNoteAction(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNoteId === noteId) {
        const remaining = notes.filter((n) => n.id !== noteId);
        setActiveNoteId(remaining[0]?.id || null);
      }
      addToast({ type: 'info', title: 'Note moved to trash' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', description: err.message });
    }
  };

  return (
    <div className="flex h-full gap-5 max-w-7xl mx-auto overflow-hidden">
      {/* Version History Modal */}
      {activeNote && (
        <VersionHistoryDialog
          noteId={activeNote.id}
          isOpen={versionHistoryOpen}
          onClose={() => setVersionHistoryOpen(false)}
          onRestored={() => window.location.reload()}
        />
      )}

      {/* Left Column: Folders, Filters & Note List */}
      <div
        className={cn(
          "w-80 flex flex-col rounded-2xl glass-panel shadow-sm overflow-hidden shrink-0",
          activeNoteId ? "hidden md:flex" : "flex w-full md:w-80"
        )}
      >
        {/* Header & Quick Add */}
        <div className="p-3.5 border-b border-white/60 dark:border-slate-800/60 space-y-2.5 bg-white/40 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Notes
            </h2>
            <Button
              onClick={handleCreateNote}
              size="sm"
              className="h-7 px-2.5 text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New Note
            </Button>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="h-8 pl-8 text-xs bg-white/60 dark:bg-slate-800/60 rounded-xl"
            />
          </div>
        </div>

        {/* Filter Tabs & Folders */}
        <div className="px-3 py-2 border-b border-white/60 dark:border-slate-800/60 flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => {
              setFilter('all');
              setSelectedFolderId(null);
            }}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
              filter === 'all' && !selectedFolderId
                ? "bg-blue-600 text-white font-semibold shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
              filter === 'favorites'
                ? "bg-blue-600 text-white font-semibold shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60"
            )}
          >
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            Favorites
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
              filter === 'pinned'
                ? "bg-blue-600 text-white font-semibold shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60"
            )}
          >
            <Pin className="h-3 w-3 text-blue-400" />
            Pinned
          </button>
          <button
            onClick={() => setFilter('trash')}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
              filter === 'trash'
                ? "bg-rose-600 text-white font-semibold shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60"
            )}
          >
            <Trash2 className="h-3 w-3 text-rose-500" />
            Trash
          </button>
        </div>

        {/* Folders List Bar */}
        {folders.length > 0 && (
          <div className="px-3 py-2 border-b border-white/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">
              Folders:
            </span>
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFolderId(selectedFolderId === f.id ? null : f.id)}
                className={cn(
                  "px-2 py-0.5 rounded-lg text-[11px] truncate flex items-center gap-1 transition-colors cursor-pointer shrink-0",
                  selectedFolderId === f.id
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold"
                    : "bg-white/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white"
                )}
              >
                <span>{f.icon || '📁'}</span>
                <span>{f.name}</span>
              </button>
            ))}
            <button
              onClick={handleCreateFolder}
              className="p-1 rounded-lg hover:bg-white/60 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Create new folder"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/40 dark:divide-slate-800/40">
          {filteredNotes.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 p-4">
              No notes in this view. Click &quot;New Note&quot; to begin writing.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={cn(
                  "p-3.5 text-start transition-all cursor-pointer group relative",
                  activeNoteId === note.id
                    ? "bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600 shadow-2xs"
                    : "hover:bg-white/60 dark:hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "font-semibold text-xs truncate flex-1",
                      activeNoteId === note.id
                        ? "text-blue-950 dark:text-blue-100 font-bold"
                        : "text-slate-800 dark:text-slate-200"
                    )}
                  >
                    {note.title || 'Untitled Note'}
                  </span>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleTogglePin(note, e)}
                      className={cn("p-0.5 cursor-pointer", note.is_pinned && "text-blue-600")}
                      title="Pin note"
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => handleToggleFavorite(note, e)}
                      className={cn("p-0.5 cursor-pointer", note.is_favorite && "text-amber-500 fill-amber-500")}
                      title="Favorite note"
                    >
                      <Star className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {note.content_text || 'Empty note...'}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100/60 dark:border-slate-800/40">
                  <span>{note.folder?.name || 'General'}</span>
                  <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Main Document Area: Tiptap Editor */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full min-w-0",
          !activeNoteId ? "hidden md:flex" : "flex"
        )}
      >
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onOpenVersions={() => setVersionHistoryOpen(true)}
            onBack={() => setActiveNoteId(null)}
            onDelete={() => handleDeleteNote(activeNote.id)}
            className="flex-1"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl glass-panel text-slate-400 text-xs p-6 text-center">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No Note Selected</p>
            <p className="mt-1">Select a note from the left or click &quot;New Note&quot; to write.</p>
          </div>
        )}
      </div>
    </div>
  );
}
