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
  Table as TableIcon,
  Undo,
  Redo,
  Save,
  Clock,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { autosaveNoteAction } from '@/actions/notes';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

interface NoteEditorProps {
  note: Note;
  onOpenVersions?: () => void;
  className?: string;
}

export function NoteEditor({ note, onOpenVersions, className }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title || 'Untitled Note');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

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

  // Calculate initial counts
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
    }
  }, [editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSaveStatus('unsaved');
    if (editor) {
      performAutosave(newTitle, editor.getJSON(), editor.getText());
    }
  };

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md shadow-xs overflow-hidden", className)}>
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-none outline-none focus:ring-0 flex-1 min-w-[200px]"
        />

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                saveStatus === 'saved' && "bg-emerald-500",
                saveStatus === 'saving' && "bg-amber-500 animate-pulse",
                saveStatus === 'unsaved' && "bg-rose-500"
              )}
            />
            <span>
              {saveStatus === 'saved' && `Saved at ${lastSavedTime}`}
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'unsaved' && 'Unsaved changes'}
            </span>
          </div>

          {onOpenVersions && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenVersions}
              className="h-7 px-2 text-xs flex items-center gap-1"
            >
              <History className="h-3.5 w-3.5" />
              History
            </Button>
          )}
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200/80 dark:border-slate-800/80 px-3 py-1.5 bg-white/60 dark:bg-slate-900/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('bold') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('italic') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('underline') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('strike') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('heading', { level: 1 }) && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('heading', { level: 2 }) && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('heading', { level: 3 }) && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('bulletList') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('orderedList') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('taskList') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Checklist / Task List"
        >
          <CheckSquare className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive({ textAlign: 'left' }) && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive({ textAlign: 'center' }) && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive({ textAlign: 'right' }) && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('blockquote') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn("p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300", editor.isActive('codeBlock') && "bg-slate-200 dark:bg-slate-700 text-blue-600")}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Main Document Content Area */}
      <div className="flex-1 p-6 overflow-y-auto cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      {/* Editor Footer / Stats Bar */}
      <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
        <div>
          <span>Press Tab to indent lists • Auto-saved to cloud</span>
        </div>
      </div>
    </div>
  );
}
