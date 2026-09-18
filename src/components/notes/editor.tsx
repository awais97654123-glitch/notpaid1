'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Undo,
  Redo,
  Save,
  Clock,
  History,
  ArrowLeft,
  Star,
  Share2,
  MoreVertical,
  Minus,
  RemoveFormatting,
  Languages,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { autosaveNoteAction, updateNoteAction } from '@/actions/notes';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

interface NoteEditorProps {
  note: Note;
  onOpenVersions?: () => void;
  onBack?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function NoteEditor({
  note,
  onOpenVersions,
  onBack,
  onDelete,
  className,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title || 'Untitled Note');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('just now');
  const [isFavorite, setIsFavorite] = useState(note.is_favorite || false);
  const [isRtl, setIsRtl] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const { addToast } = useToast();

  const performAutosave = useCallback(
    async (currentTitle: string, currentJson: any, currentText: string) => {
      setSaveStatus('saving');
      try {
        await autosaveNoteAction(note.id, currentTitle, currentJson, currentText);
        setSaveStatus('saved');
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('unsaved');
      }
    },
    [note.id]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your thoughts, plans, equations, or checklists here...',
      }),
    ],
    content: note.content_json || { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved');
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);

      // Debounce autosave
      const json = editor.getJSON();
      const timer = setTimeout(() => {
        performAutosave(title, json, text);
      }, 1000);
      return () => clearTimeout(timer);
    },
  });

  // Recalculate word counts
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
    }
  }, [editor]);

  // Sync title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSaveStatus('unsaved');
    if (editor) {
      performAutosave(newTitle, editor.getJSON(), editor.getText());
    }
  };

  const handleToggleFavorite = async () => {
    const nextFav = !isFavorite;
    setIsFavorite(nextFav);
    try {
      await updateNoteAction(note.id, { is_favorite: nextFav });
      addToast({
        type: 'success',
        title: nextFav ? 'Note Favorited' : 'Removed from Favorites',
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', description: err.message });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        type: 'success',
        title: 'Note Link Copied',
        description: 'Direct note URL has been copied to your clipboard.',
      });
    }
  };

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-xs">
        Loading Liquid Glass editor...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-2xl glass-panel shadow-sm overflow-hidden",
        className
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Bar: Back, Title, Save Status, Favorite, Share, More (Spec #5) */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/60 dark:border-slate-800/60 px-4 py-2.5 gap-2 bg-white/40 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-500 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 bg-transparent border-none outline-none focus:ring-0 flex-1"
          />
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-2.5 text-xs text-slate-500">
          {/* Save Status Pill (Spec #5) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-slate-700/60 text-[11px] font-medium shadow-2xs">
            <span
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                saveStatus === 'saved' && "bg-emerald-500",
                saveStatus === 'saving' && "bg-amber-500 animate-pulse",
                saveStatus === 'unsaved' && "bg-rose-500"
              )}
            />
            <span>
              {saveStatus === 'saved' && `Saved`}
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'unsaved' && 'Unsaved'}
            </span>
            <span className="text-slate-400">• {lastSavedTime}</span>
          </div>

          {/* Favorite */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={cn(
              "p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 cursor-pointer transition-colors",
              isFavorite ? "text-amber-500 fill-amber-500" : "text-slate-400"
            )}
            title={isFavorite ? "Favorited" : "Favorite Note"}
          >
            <Star className="h-4 w-4" />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-500 cursor-pointer"
            title="Share Note"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-500 cursor-pointer"
                title="More Options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              {onOpenVersions && (
                <DropdownMenuItem onClick={onOpenVersions} className="gap-2 cursor-pointer">
                  <History className="h-3.5 w-3.5" />
                  Version History
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setIsRtl(!isRtl)}
                className="gap-2 cursor-pointer"
              >
                <Languages className="h-3.5 w-3.5" />
                {isRtl ? 'Switch to LTR' : 'Switch to RTL'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                >
                  Move to Trash
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Advanced Tiptap Toolbar (Smooth horizontal scrolling on mobile) */}
      <div className="flex items-center gap-1 border-b border-white/60 dark:border-slate-800/60 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 overflow-x-auto scrollbar-none touch-pan-x flex-nowrap shrink-0 text-xs select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('heading', { level: 1 }) && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('heading', { level: 2 }) && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('heading', { level: 3 }) && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Inline formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('bold') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('italic') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('underline') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('strike') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive({ textAlign: 'left' }) && "bg-blue-100 text-blue-700 dark:bg-blue-900/60"
          )}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive({ textAlign: 'center' }) && "bg-blue-100 text-blue-700 dark:bg-blue-900/60"
          )}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive({ textAlign: 'right' }) && "bg-blue-100 text-blue-700 dark:bg-blue-900/60"
          )}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Lists & Checklists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('bulletList') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('orderedList') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('taskList') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
          )}
          title="Checklist / Tasks"
        >
          <CheckSquare className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Blocks & Tables */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('blockquote') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60"
          )}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer",
            editor.isActive('codeBlock') && "bg-blue-100 text-blue-700 dark:bg-blue-900/60"
          )}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Horizontal Divider"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Body: Large clean writing area with classic notepad feel */}
      <div
        className="flex-1 p-5 sm:p-8 overflow-y-auto cursor-text text-slate-800 dark:text-slate-100 font-sans leading-relaxed focus:outline-none min-h-[55vh]"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} className="focus:outline-none min-h-[50vh]" />
      </div>

      {/* Editor Footer: Word count, Char count, autosave badge */}
      <div className="flex items-center justify-between border-t border-white/60 dark:border-slate-800/60 px-4 py-2 bg-white/40 dark:bg-slate-900/40 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Press Tab to indent • Auto-saved to Supabase</span>
        </div>
      </div>
    </div>
  );
}
