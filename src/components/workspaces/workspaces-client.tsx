'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  CheckCircle2,
  FolderKanban,
  CheckSquare,
  FileText,
  Users,
  Settings,
  Trash2,
  Edit2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
import { createWorkspaceAction, updateWorkspaceAction } from '@/actions/workspaces';
import { useToast } from '@/components/ui/toast';
import type { Workspace } from '@/types';

interface WorkspaceWithStats extends Workspace {
  projectCount: number;
  taskCount: number;
  noteCount: number;
}

interface WorkspacesClientProps {
  workspaces: WorkspaceWithStats[];
  currentWorkspaceId: string;
}

const ICONS = ['💼', '🌿', '🚀', '🎓', '⚡', '🎯', '🎨', '💻', '🧪', '🌐', '📊', '🔥'];

export function WorkspacesClient({ workspaces: initialWorkspaces, currentWorkspaceId }: WorkspacesClientProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithStats[]>(initialWorkspaces);
  const [activeWsId, setActiveWsId] = useState<string>(currentWorkspaceId);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWs, setSelectedWs] = useState<WorkspaceWithStats | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💼');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createWorkspaceAction(name.trim(), icon);
      const newWs: WorkspaceWithStats = {
        ...created,
        projectCount: 0,
        taskCount: 0,
        noteCount: 0,
      };
      setWorkspaces((prev) => [...prev, newWs]);
      setCreateModalOpen(false);
      setName('');
      setIcon('💼');
      addToast({
        type: 'success',
        title: 'Workspace Created',
        description: `"${created.name}" is ready to use.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to create workspace',
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWs || !name.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await updateWorkspaceAction(selectedWs.id, {
        name: name.trim(),
        icon,
      });
      if (updated) {
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === selectedWs.id ? { ...w, ...updated } : w))
        );
        addToast({
          type: 'success',
          title: 'Workspace Updated',
          description: `Saved changes to "${name.trim()}".`,
        });
      }
      setEditModalOpen(false);
      setSelectedWs(null);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update failed',
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchWorkspace = (wsId: string) => {
    setActiveWsId(wsId);
    // Persist active workspace in local storage or cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskpad_active_ws', wsId);
    }
    addToast({
      type: 'info',
      title: 'Active Workspace Changed',
      description: 'Switching environment context...',
    });
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 400);
  };

  const openEditModal = (ws: WorkspaceWithStats) => {
    setSelectedWs(ws);
    setName(ws.name);
    setIcon(ws.icon || '💼');
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            Workspaces & Environments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize personal life, engineering projects, academics, and team workspaces with isolated notes, tasks, and members.
          </p>
        </div>

        <Button
          onClick={() => {
            setName('');
            setIcon('💼');
            setCreateModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 h-10 shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Workspace
        </Button>
      </div>

      {/* Active Workspace Banner */}
      {workspaces.find((w) => w.id === activeWsId) && (
        <Card className="p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900/40 border-blue-200/70 dark:border-blue-800/50 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/70 dark:border-slate-700 flex items-center justify-center text-3xl">
                {workspaces.find((w) => w.id === activeWsId)?.icon || '💼'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Currently Active
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-blue-100/50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    Owner
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {workspaces.find((w) => w.id === activeWsId)?.name}
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  slug: /{workspaces.find((w) => w.id === activeWsId)?.slug}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(workspaces.find((w) => w.id === activeWsId)!)}
                className="text-xs cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Settings
              </Button>
              <Button
                size="sm"
                onClick={() => (window.location.href = '/dashboard')}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* All Workspaces Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>All Workspaces</span>
          <Badge variant="secondary" className="text-xs">
            {workspaces.length}
          </Badge>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWsId;
            return (
              <Card
                key={ws.id}
                className={`flex flex-col transition-all duration-200 ${
                  isActive
                    ? 'border-blue-500/80 shadow-md ring-1 ring-blue-500/20 dark:border-blue-500/80'
                    : 'border-slate-200/80 dark:border-slate-800/80 hover:shadow-md hover:border-slate-300'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-200/60 dark:border-slate-700 shadow-xs">
                      {ws.icon || '💼'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <Badge className="bg-blue-600 text-white text-[10px] font-bold">
                          Active
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] text-slate-500">
                        {ws.role || 'owner'}
                      </Badge>
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 truncate">
                    {ws.name}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono truncate">
                    slug: /{ws.slug}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/60 text-center">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {ws.projectCount}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                        <FolderKanban className="h-2.5 w-2.5" />
                        Projects
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {ws.taskCount}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                        <CheckSquare className="h-2.5 w-2.5" />
                        Tasks
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {ws.noteCount}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                        <FileText className="h-2.5 w-2.5" />
                        Notes
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(ws)}
                    className="h-8 px-2 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>

                  {isActive ? (
                    <Button
                      size="sm"
                      disabled
                      className="h-8 text-xs bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-default"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      Current
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSwitchWorkspace(ws.id)}
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    >
                      Switch to Workspace
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create Workspace Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create New Workspace</DialogTitle>
            <DialogDescription className="text-xs">
              Workspaces isolate your tasks, notes, projects, and reminders into distinct environments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Workspace Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Startup Engineering, Master Thesis, Studio"
                required
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Select Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${
                      icon === emoji
                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-600 scale-105 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/80 hover:bg-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !name.trim()}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Workspace Settings</DialogTitle>
            <DialogDescription className="text-xs">
              Update the name, icon, and branding for this workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Workspace Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Select Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${
                      icon === emoji
                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-600 scale-105 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/80 hover:bg-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !name.trim()}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
