'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { createProjectAction } from '@/actions/workspaces';
import { useToast } from '@/components/ui/toast';
import type { Project } from '@/types';

interface ProjectsClientProps {
  projects: Project[];
}

export function ProjectsClient({ projects: initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('📁');
  const { addToast } = useToast();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const created = await createProjectAction({
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
      });
      setProjects((prev) => [created, ...prev]);
      setCreateOpen(false);
      setName('');
      setDescription('');
      addToast({ type: 'success', title: 'Project Created', description: `"${created.name}"` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Create Failed', description: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Create Project Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-600" />
              Create Project
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Project Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile App Redesign"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key goals, scope, or timeline..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Icon</label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="mt-1 w-16 text-center"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Accent Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 h-9 w-full rounded border cursor-pointer"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-blue-600" />
            Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Group related tasks, notes, and milestones into organized project spaces.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} size="sm" className="h-8 text-xs gap-1 cursor-pointer">
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const total = proj.tasks_count || 0;
          const completed = proj.completed_tasks_count || 0;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Card
              key={proj.id}
              className="p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-blue-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-base"
                      style={{ backgroundColor: `${proj.color}20`, color: proj.color }}
                    >
                      {proj.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {proj.name}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {completed}/{total} tasks complete
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {proj.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Progress</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {percent}%
                    </span>
                  </div>
                  <Progress value={percent} className="h-1.5" />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href={`/tasks?project=${proj.id}`}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Tasks <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
