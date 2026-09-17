'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getNoteVersionsAction, restoreNoteVersionAction } from '@/actions/notes';
import { formatDate } from '@/lib/utils';
import type { NoteVersion } from '@/types';
import { Clock, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface VersionHistoryDialogProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export function VersionHistoryDialog({
  noteId,
  isOpen,
  onClose,
  onRestored,
}: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && noteId) {
      setLoading(true);
      getNoteVersionsAction(noteId)
        .then((v) => {
          setVersions(v);
          if (v.length > 0) setSelectedVersion(v[0]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, noteId]);

  const handleRestore = async () => {
    if (!selectedVersion) return;
    try {
      await restoreNoteVersionAction(noteId, selectedVersion.id);
      addToast({
        type: 'success',
        title: 'Version Restored',
        description: `Restored version from ${new Date(selectedVersion.created_at).toLocaleString()}`,
      });
      onRestored();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Restore Failed',
        description: err.message || 'Could not restore version',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Note Version History
          </DialogTitle>
          <DialogDescription>
            Inspect previous snapshots and restore your note to an earlier state.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading version snapshots...</div>
        ) : versions.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No previous versions recorded yet. Snapshots are created when edits are saved.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 min-h-[300px] max-h-[420px] overflow-hidden">
            {/* Version List Sidebar */}
            <div className="col-span-1 border-r border-slate-200 dark:border-slate-800 pr-3 overflow-y-auto space-y-1.5">
              {versions.map((ver, idx) => (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`w-full text-start p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    selectedVersion?.id === ver.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold truncate">{ver.title || 'Untitled Note'}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">
                    {new Date(ver.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(ver.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </button>
              ))}
            </div>

            {/* Version Content Preview */}
            <div className="col-span-2 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
              {selectedVersion ? (
                <div>
                  <h4 className="font-semibold text-base mb-2 text-slate-900 dark:text-slate-100">
                    {selectedVersion.title}
                  </h4>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-mono bg-white dark:bg-slate-800 p-3 rounded border text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedVersion.content_json, null, 2)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">Select a version to preview</div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {versions.length > 0 && selectedVersion && (
            <Button onClick={handleRestore} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              Restore This Version
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
