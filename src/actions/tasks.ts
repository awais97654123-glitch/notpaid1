'use server';

import { db } from '@/lib/db/repository';
import { getAuthenticatedUser, requireWorkspace } from '@/lib/auth/user';
import { revalidatePath } from 'next/cache';
import type { Task, TaskPriority, TaskStatus } from '@/types';

export async function getTasksAction(params?: {
  workspaceId?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}) {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, params?.workspaceId);
  return db.getTasks({
    workspaceId: ws.id,
    projectId: params?.projectId,
    status: params?.status,
    priority: params?.priority,
    search: params?.search,
  });
}

export async function getTaskByIdAction(id: string) {
  return db.getTaskById(id);
}

export async function createTaskAction(data: {
  workspaceId?: string;
  projectId?: string | null;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  dueTime?: string | null;
  timezone?: string;
  reminderOffset?: number;
  subtasks?: string[];
}) {
  const user = await getAuthenticatedUser();
  const ws = await requireWorkspace(user.id, data.workspaceId);

  if (!data.title || data.title.trim() === '') {
    throw new Error('Task title cannot be empty');
  }

  // Subscription plan limit enforcement:
  // malikabubakkar523@gmail.com has unlimited lifetime access.
  // Free accounts are limited to 4 tasks.
  const isUnlimitedAdmin = user.email?.toLowerCase() === 'malikabubakkar523@gmail.com';
  if (!isUnlimitedAdmin) {
    const existingTasks = await db.getTasks({ workspaceId: ws.id });
    if (existingTasks.length >= 4) {
      throw new Error(
        'PLAN_LIMIT_REACHED: Free tier is limited to 4 tasks. Upgrade to Pro for unlimited tasks.'
      );
    }
  }

  const task = await db.createTask({
    workspace_id: ws.id,
    project_id: data.projectId,
    title: data.title.trim(),
    description: data.description,
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    due_date: data.dueDate,
    due_time: data.dueTime,
    timezone: data.timezone || user.timezone || 'Asia/Karachi',
    reminder_offset: data.reminderOffset ?? 0,
    created_by: user.id,
    subtasks: data.subtasks,
  });

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
  return task;
}

export async function updateTaskAction(id: string, updates: Partial<Task>) {
  const task = await db.updateTask(id, updates);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
  return task;
}

export async function deleteTaskAction(id: string) {
  const res = await db.deleteTask(id);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
  return res;
}

export async function toggleTaskCompleteAction(id: string) {
  const task = await db.toggleTaskComplete(id);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
  revalidatePath('/analytics');
  return task;
}

export async function createSubtaskAction(taskId: string, title: string) {
  const subtask = await db.createSubtask(taskId, title);
  revalidatePath('/tasks');
  return subtask;
}

export async function toggleSubtaskAction(taskId: string, subtaskId: string) {
  const subtask = await db.toggleSubtask(taskId, subtaskId);
  revalidatePath('/tasks');
  return subtask;
}

export async function deleteSubtaskAction(taskId: string, subtaskId: string) {
  const res = await db.deleteSubtask(taskId, subtaskId);
  revalidatePath('/tasks');
  return res;
}
