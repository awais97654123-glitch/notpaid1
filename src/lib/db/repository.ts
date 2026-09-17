import { createAdminClient } from '@/lib/supabase/server';
import type {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  Folder,
  Task,
  Subtask,
  Tag,
  Note,
  NoteVersion,
  Reminder,
  NotificationItem,
  NotificationPreferences,
  PushSubscriptionRecord,
  Attachment,
  ProductivityStats,
  TaskStatus,
  TaskPriority,
} from '@/types';

// ============================================================================
// Local Persistent In-Memory / Hybrid Storage Cache
// Populated with real initial seed data matching specification
// ============================================================================

interface LocalDBState {
  users: Map<string, User>;
  workspaces: Map<string, Workspace>;
  workspaceMembers: Map<string, WorkspaceMember[]>;
  projects: Map<string, Project>;
  folders: Map<string, Folder>;
  tasks: Map<string, Task>;
  subtasks: Map<string, Subtask[]>;
  tags: Map<string, Tag>;
  notes: Map<string, Note>;
  noteVersions: Map<string, NoteVersion[]>;
  reminders: Map<string, Reminder>;
  notifications: Map<string, NotificationItem>;
  notificationPreferences: Map<string, NotificationPreferences>;
  pushSubscriptions: Map<string, PushSubscriptionRecord>;
  attachments: Map<string, Attachment>;
}

// Global persistent state for development lifecycle across hot reloads
const globalForDB = globalThis as unknown as { taskpadDB?: LocalDBState };

function initLocalState(): LocalDBState {
  const users = new Map<string, User>();
  const workspaces = new Map<string, Workspace>();
  const workspaceMembers = new Map<string, WorkspaceMember[]>();
  const projects = new Map<string, Project>();
  const folders = new Map<string, Folder>();
  const tasks = new Map<string, Task>();
  const subtasks = new Map<string, Subtask[]>();
  const tags = new Map<string, Tag>();
  const notes = new Map<string, Note>();
  const noteVersions = new Map<string, NoteVersion[]>();
  const reminders = new Map<string, Reminder>();
  const notifications = new Map<string, NotificationItem>();
  const notificationPreferences = new Map<string, NotificationPreferences>();
  const pushSubscriptions = new Map<string, PushSubscriptionRecord>();
  const attachments = new Map<string, Attachment>();

  // Demo User
  const demoUser: User = {
    id: 'a0000000-0000-0000-0000-000000000001',
    clerk_id: 'user_taskpad_demo_01',
    email: 'alex.morgan@taskpad.app',
    full_name: 'Alex Morgan',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timezone: 'UTC',
    locale: 'en',
    created_at: '2026-09-17T00:00:00Z',
    updated_at: '2026-09-17T00:00:00Z',
  };
  users.set(demoUser.id, demoUser);

  // Workspaces
  const ws1: Workspace = {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Personal & Life',
    slug: 'personal-life',
    icon: '🌿',
    owner_id: demoUser.id,
    created_at: '2026-09-17T00:00:00Z',
    updated_at: '2026-09-17T00:00:00Z',
  };
  const ws2: Workspace = {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Engineering & SaaS',
    slug: 'engineering-saas',
    icon: '⚡',
    owner_id: demoUser.id,
    created_at: '2026-09-17T00:00:00Z',
    updated_at: '2026-09-17T00:00:00Z',
  };
  workspaces.set(ws1.id, ws1);
  workspaces.set(ws2.id, ws2);

  // Projects
  const proj1: Project = {
    id: 'c0000000-0000-0000-0000-000000000001',
    workspace_id: ws1.id,
    name: 'Academics & Study',
    description: 'Coursework, assignments and exam preparation',
    color: '#6366F1',
    icon: '🎓',
    created_by: demoUser.id,
    created_at: '2026-09-17T00:00:00Z',
    updated_at: '2026-09-17T00:00:00Z',
  };
  const proj2: Project = {
    id: 'c0000000-0000-0000-0000-000000000002',
    workspace_id: ws2.id,
    name: 'TaskPad Launch',
    description: 'Product release, testing, and marketing milestones',
    color: '#0EA5E9',
    icon: '🚀',
    created_by: demoUser.id,
    created_at: '2026-09-17T00:00:00Z',
    updated_at: '2026-09-17T00:00:00Z',
  };
  projects.set(proj1.id, proj1);
  projects.set(proj2.id, proj2);

  // Tags
  const tag1: Tag = { id: 'd0000000-0000-0000-0000-000000000001', workspace_id: ws1.id, name: 'Mathematics', color: '#EC4899' };
  const tag2: Tag = { id: 'd0000000-0000-0000-0000-000000000002', workspace_id: ws1.id, name: 'Assignment', color: '#F59E0B' };
  tags.set(tag1.id, tag1);
  tags.set(tag2.id, tag2);

  // Subtasks for Mathematics Assignment
  const mathSubtasks: Subtask[] = [
    { id: 'f0000000-0000-0000-0000-000000000001', task_id: 'e0000000-0000-0000-0000-000000000001', title: 'Problems 1 to 5: First order ODEs', is_completed: true, position: 1 },
    { id: 'f0000000-0000-0000-0000-000000000002', task_id: 'e0000000-0000-0000-0000-000000000001', title: 'Problems 6 to 10: Homogeneous equations', is_completed: true, position: 2 },
    { id: 'f0000000-0000-0000-0000-000000000003', task_id: 'e0000000-0000-0000-0000-000000000001', title: 'Problems 11 to 15: Boundary value problems', is_completed: false, position: 3 },
    { id: 'f0000000-0000-0000-0000-000000000004', task_id: 'e0000000-0000-0000-0000-000000000001', title: 'Scan solutions and upload PDF to portal', is_completed: false, position: 4 },
  ];
  subtasks.set('e0000000-0000-0000-0000-000000000001', mathSubtasks);

  // Specification Task: "Complete Mathematics Assignment" - September 20, 2026 at 7:30 PM
  const task1: Task = {
    id: 'e0000000-0000-0000-0000-000000000001',
    workspace_id: ws1.id,
    project_id: proj1.id,
    title: 'Complete Mathematics Assignment',
    description: 'Differential equations problems 1-15 and submit to LMS portal before deadline.',
    status: 'todo',
    priority: 'urgent',
    due_date: '2026-09-20',
    due_time: '19:30:00',
    timezone: 'UTC',
    reminder_offset: 0,
    created_by: demoUser.id,
    created_at: '2026-09-17T12:00:00Z',
    updated_at: '2026-09-17T12:00:00Z',
    subtasks: mathSubtasks,
    tags: [tag1, tag2],
    project: proj1,
  };

  const task2: Task = {
    id: 'e0000000-0000-0000-0000-000000000002',
    workspace_id: ws1.id,
    project_id: proj1.id,
    title: 'Physics Lab Report',
    description: 'Wave propagation experiments analysis.',
    status: 'in_progress',
    priority: 'high',
    due_date: '2026-09-18',
    due_time: '15:00:00',
    timezone: 'UTC',
    reminder_offset: 15,
    created_by: demoUser.id,
    created_at: '2026-09-17T10:00:00Z',
    updated_at: '2026-09-17T10:00:00Z',
    subtasks: [],
    tags: [],
    project: proj1,
  };

  const task3: Task = {
    id: 'e0000000-0000-0000-0000-000000000003',
    workspace_id: ws1.id,
    project_id: proj1.id,
    title: 'Review Linear Algebra Chapter 4',
    description: 'Eigenvalues and Eigenvectors notes summary.',
    status: 'completed',
    priority: 'medium',
    due_date: '2026-09-16',
    due_time: '14:00:00',
    timezone: 'UTC',
    reminder_offset: 0,
    completed_at: '2026-09-16T14:30:00Z',
    created_by: demoUser.id,
    created_at: '2026-09-15T09:00:00Z',
    updated_at: '2026-09-16T14:30:00Z',
    subtasks: [],
    tags: [],
    project: proj1,
  };

  tasks.set(task1.id, task1);
  tasks.set(task2.id, task2);
  tasks.set(task3.id, task3);

  // Reminders
  const reminder1: Reminder = {
    id: '10000000-0000-0000-0000-000000000001',
    task_id: task1.id,
    user_id: demoUser.id,
    workspace_id: ws1.id,
    scheduled_at: '2026-09-20T19:30:00.000Z',
    status: 'pending',
    retry_count: 0,
    created_at: '2026-09-17T12:00:00Z',
    task: task1,
  };
  reminders.set(reminder1.id, reminder1);

  // Folders
  const folder1: Folder = {
    id: '20000000-0000-0000-0000-000000000001',
    workspace_id: ws1.id,
    name: 'Study Notes',
    icon: '📚',
    color: '#8B5CF6',
    created_at: '2026-09-17T00:00:00Z',
  };
  folders.set(folder1.id, folder1);

  // Note
  const note1: Note = {
    id: '30000000-0000-0000-0000-000000000001',
    workspace_id: ws1.id,
    folder_id: folder1.id,
    project_id: proj1.id,
    title: 'Calculus & Differential Equations Guide',
    content_json: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Calculus & Differential Equations' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Key concepts and formula quick reference for the upcoming assignment and exam preparation.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'First Order Linear Differential Equations' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'General form: dy/dx + P(x)y = Q(x). The integrating factor is I(x) = exp(integral(P(x)dx)).' }] },
        {
          type: 'taskList',
          content: [
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Derive integrating factor proof' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Solve boundary value problem examples' }] }] },
          ],
        },
      ],
    },
    content_text: 'Calculus & Differential Equations. Key concepts and formula quick reference. First Order Linear Differential Equations.',
    is_pinned: true,
    is_favorite: true,
    is_archived: false,
    is_trash: false,
    created_by: demoUser.id,
    created_at: '2026-09-17T11:00:00Z',
    updated_at: '2026-09-17T11:00:00Z',
    folder: folder1,
    project: proj1,
  };
  notes.set(note1.id, note1);

  // Notification Preferences
  notificationPreferences.set(demoUser.id, {
    user_id: demoUser.id,
    browser_push_enabled: true,
    email_enabled: true,
    task_reminders: true,
    workspace_activity: true,
    daily_summary: true,
    updated_at: '2026-09-17T00:00:00Z',
  });

  // Notifications
  const notif1: NotificationItem = {
    id: '40000000-0000-0000-0000-000000000001',
    user_id: demoUser.id,
    workspace_id: ws1.id,
    type: 'task_reminder',
    title: 'Reminder: Mathematics Assignment',
    message: 'Due on September 20, 2026 at 7:30 PM',
    resource_type: 'task',
    resource_id: task1.id,
    is_read: false,
    created_at: '2026-09-17T12:00:00Z',
  };
  notifications.set(notif1.id, notif1);

  return {
    users,
    workspaces,
    workspaceMembers,
    projects,
    folders,
    tasks,
    subtasks,
    tags,
    notes,
    noteVersions,
    reminders,
    notifications,
    notificationPreferences,
    pushSubscriptions,
    attachments,
  };
}

const local = globalForDB.taskpadDB ?? (globalForDB.taskpadDB = initLocalState());

// Ensures all objects crossed across RSC boundaries are pure plain JavaScript objects
// with prototypes bound to current execution realm to prevent opaque temporary reference errors
function toPlain<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

// ============================================================================
// Database Repository API
// ============================================================================

export const db = {
  // Users
  async getUserById(id: string): Promise<User | null> {
    return local.users.get(id) || null;
  },

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    for (const u of local.users.values()) {
      if (u.clerk_id === clerkId) return u;
    }
    return null;
  },

  async createUser(data: Partial<User> & { clerk_id: string; email: string }): Promise<User> {
    const id = data.id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const user: User = {
      id,
      clerk_id: data.clerk_id,
      email: data.email,
      full_name: data.full_name || null,
      avatar_url: data.avatar_url || null,
      timezone: data.timezone || 'UTC',
      locale: data.locale || 'en',
      created_at: now,
      updated_at: now,
    };
    local.users.set(id, user);
    return user;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = local.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    local.users.set(id, updated);
    return updated;
  },

  // Workspaces
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const list: Workspace[] = [];
    for (const ws of local.workspaces.values()) {
      if (ws.owner_id === userId) {
        list.push({ ...ws, role: 'owner' });
      }
    }
    return toPlain(list);
  },

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    return toPlain(local.workspaces.get(id) || null);
  },

  async createWorkspace(data: { name: string; slug: string; icon?: string; owner_id: string }): Promise<Workspace> {
    const id = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const ws: Workspace = {
      id,
      name: data.name,
      slug: data.slug,
      icon: data.icon || '💼',
      owner_id: data.owner_id,
      created_at: now,
      updated_at: now,
      role: 'owner',
    };
    local.workspaces.set(id, ws);
    return toPlain(ws);
  },

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace | null> {
    const ws = local.workspaces.get(id);
    if (!ws) return null;
    const updated = { ...ws, ...updates, updated_at: new Date().toISOString() };
    local.workspaces.set(id, updated);
    return toPlain(updated);
  },

  async deleteWorkspace(id: string): Promise<boolean> {
    return local.workspaces.delete(id);
  },

  // Projects
  async getProjects(workspaceId: string): Promise<Project[]> {
    const list: Project[] = [];
    for (const p of local.projects.values()) {
      if (p.workspace_id === workspaceId) {
        // Calculate counts
        let total = 0;
        let completed = 0;
        for (const t of local.tasks.values()) {
          if (t.project_id === p.id) {
            total++;
            if (t.status === 'completed') completed++;
          }
        }
        list.push({ ...p, tasks_count: total, completed_tasks_count: completed });
      }
    }
    return toPlain(list);
  },

  async getProjectById(id: string): Promise<Project | null> {
    return local.projects.get(id) || null;
  },

  async createProject(data: { workspace_id: string; name: string; description?: string; color?: string; icon?: string; created_by?: string }): Promise<Project> {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const proj: Project = {
      id,
      workspace_id: data.workspace_id,
      name: data.name,
      description: data.description || null,
      color: data.color || '#3B82F6',
      icon: data.icon || '📁',
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
      tasks_count: 0,
      completed_tasks_count: 0,
    };
    local.projects.set(id, proj);
    return proj;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const proj = local.projects.get(id);
    if (!proj) return null;
    const updated = { ...proj, ...updates, updated_at: new Date().toISOString() };
    local.projects.set(id, updated);
    return updated;
  },

  async deleteProject(id: string): Promise<boolean> {
    return local.projects.delete(id);
  },

  // Folders
  async getFolders(workspaceId: string): Promise<Folder[]> {
    const list: Folder[] = [];
    for (const f of local.folders.values()) {
      if (f.workspace_id === workspaceId) list.push(f);
    }
    return list;
  },

  async createFolder(data: { workspace_id: string; name: string; icon?: string; color?: string; parent_id?: string }): Promise<Folder> {
    const id = `fld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const folder: Folder = {
      id,
      workspace_id: data.workspace_id,
      name: data.name,
      icon: data.icon || '📁',
      color: data.color || '#8B5CF6',
      parent_id: data.parent_id || null,
      created_at: new Date().toISOString(),
    };
    local.folders.set(id, folder);
    return folder;
  },

  async deleteFolder(id: string): Promise<boolean> {
    return local.folders.delete(id);
  },

  // Tasks
  async getTasks(params: {
    workspaceId: string;
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  }): Promise<Task[]> {
    const list: Task[] = [];
    for (const t of local.tasks.values()) {
      if (t.workspace_id !== params.workspaceId) continue;
      if (params.projectId && t.project_id !== params.projectId) continue;
      if (params.status && t.status !== params.status) continue;
      if (params.priority && t.priority !== params.priority) continue;
      if (params.search) {
        const query = params.search.toLowerCase();
        if (!t.title.toLowerCase().includes(query) && !t.description.toLowerCase().includes(query)) {
          continue;
        }
      }

      // Attach subtasks and project info
      const st = local.subtasks.get(t.id) || [];
      const proj = t.project_id ? local.projects.get(t.project_id) : undefined;
      list.push({ ...t, subtasks: st, project: proj });
    }

    return toPlain(list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  },

  async getTaskById(id: string): Promise<Task | null> {
    const task = local.tasks.get(id);
    if (!task) return null;
    const st = local.subtasks.get(task.id) || [];
    const proj = task.project_id ? local.projects.get(task.project_id) : undefined;
    return toPlain({ ...task, subtasks: st, project: proj });
  },

  async createTask(data: {
    workspace_id: string;
    project_id?: string | null;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string | null;
    due_time?: string | null;
    timezone?: string;
    reminder_offset?: number;
    recurrence_rule?: string | null;
    created_by?: string | null;
    subtasks?: string[];
  }): Promise<Task> {
    const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const createdSubtasks: Subtask[] = (data.subtasks || []).map((title, i) => ({
      id: `st_${Date.now()}_${i}`,
      task_id: id,
      title,
      is_completed: false,
      position: i + 1,
      created_at: now,
      updated_at: now,
    }));
    local.subtasks.set(id, createdSubtasks);

    const task: Task = {
      id,
      workspace_id: data.workspace_id,
      project_id: data.project_id || null,
      title: data.title,
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      due_date: data.due_date || null,
      due_time: data.due_time || null,
      timezone: data.timezone || 'UTC',
      reminder_offset: data.reminder_offset ?? 0,
      recurrence_rule: data.recurrence_rule || null,
      created_by: data.created_by || null,
      created_at: now,
      updated_at: now,
      subtasks: createdSubtasks,
      project: data.project_id ? local.projects.get(data.project_id) : undefined,
    };

    local.tasks.set(id, task);

    // If due_date and time are provided, automatically register a reminder
    if (task.due_date && data.created_by) {
      const timeStr = task.due_time || '09:00:00';
      const scheduledAt = new Date(`${task.due_date}T${timeStr}Z`).toISOString();
      await this.createReminder({
        task_id: task.id,
        user_id: data.created_by,
        workspace_id: task.workspace_id,
        scheduled_at: scheduledAt,
      });
    }

    return toPlain(task);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const task = local.tasks.get(id);
    if (!task) return null;

    const completed_at =
      updates.status === 'completed' && task.status !== 'completed'
        ? new Date().toISOString()
        : updates.status && updates.status !== 'completed'
        ? null
        : task.completed_at;

    const updated = {
      ...task,
      ...updates,
      completed_at,
      updated_at: new Date().toISOString(),
    };
    local.tasks.set(id, updated);
    return toPlain(this.getTaskById(id));
  },

  async deleteTask(id: string): Promise<boolean> {
    local.subtasks.delete(id);
    return local.tasks.delete(id);
  },

  async toggleTaskComplete(id: string): Promise<Task | null> {
    const task = local.tasks.get(id);
    if (!task) return null;
    const newStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    return this.updateTask(id, { status: newStatus });
  },

  // Subtasks
  async createSubtask(taskId: string, title: string): Promise<Subtask> {
    const list = local.subtasks.get(taskId) || [];
    const newSubtask: Subtask = {
      id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      task_id: taskId,
      title,
      is_completed: false,
      position: list.length + 1,
      created_at: new Date().toISOString(),
    };
    list.push(newSubtask);
    local.subtasks.set(taskId, list);
    return newSubtask;
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Subtask | null> {
    const list = local.subtasks.get(taskId) || [];
    const found = list.find((s) => s.id === subtaskId);
    if (!found) return null;
    found.is_completed = !found.is_completed;
    found.updated_at = new Date().toISOString();
    return found;
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<boolean> {
    const list = local.subtasks.get(taskId) || [];
    const filtered = list.filter((s) => s.id !== subtaskId);
    local.subtasks.set(taskId, filtered);
    return true;
  },

  // Notes
  async getNotes(params: {
    workspaceId: string;
    folderId?: string;
    isTrash?: boolean;
    isArchived?: boolean;
    isFavorite?: boolean;
    search?: string;
  }): Promise<Note[]> {
    const list: Note[] = [];
    for (const n of local.notes.values()) {
      if (n.workspace_id !== params.workspaceId) continue;
      if (params.isTrash !== undefined && n.is_trash !== params.isTrash) continue;
      if (params.isArchived !== undefined && n.is_archived !== params.isArchived) continue;
      if (params.isFavorite !== undefined && n.is_favorite !== params.isFavorite) continue;
      if (params.folderId && n.folder_id !== params.folderId) continue;
      if (params.search) {
        const q = params.search.toLowerCase();
        if (!n.title.toLowerCase().includes(q) && !n.content_text.toLowerCase().includes(q)) {
          continue;
        }
      }
      const folder = n.folder_id ? local.folders.get(n.folder_id) : undefined;
      const proj = n.project_id ? local.projects.get(n.project_id) : undefined;
      list.push({ ...n, folder, project: proj });
    }

    const sorted = list.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    return toPlain(sorted);
  },

  async getNoteById(id: string): Promise<Note | null> {
    const note = local.notes.get(id);
    if (!note) return null;
    const folder = note.folder_id ? local.folders.get(note.folder_id) : undefined;
    const proj = note.project_id ? local.projects.get(note.project_id) : undefined;
    return toPlain({ ...note, folder, project: proj });
  },

  async createNote(data: {
    workspace_id: string;
    folder_id?: string | null;
    project_id?: string | null;
    title?: string;
    content_json?: any;
    content_text?: string;
    created_by?: string | null;
  }): Promise<Note> {
    const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const note: Note = {
      id,
      workspace_id: data.workspace_id,
      folder_id: data.folder_id || null,
      project_id: data.project_id || null,
      title: data.title || 'Untitled Note',
      content_json: data.content_json || { type: 'doc', content: [{ type: 'paragraph' }] },
      content_text: data.content_text || '',
      is_pinned: false,
      is_favorite: false,
      is_archived: false,
      is_trash: false,
      created_by: data.created_by || null,
      created_at: now,
      updated_at: now,
    };
    local.notes.set(id, note);
    return toPlain(note);
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    const note = local.notes.get(id);
    if (!note) return null;

    // Snapshot version history if content changed significantly
    if (updates.content_json && JSON.stringify(updates.content_json) !== JSON.stringify(note.content_json)) {
      await this.createNoteVersion(id, note.title, note.content_json, note.created_by);
    }

    const updated = {
      ...note,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    local.notes.set(id, updated);
    return toPlain(updated);
  },

  async deleteNote(id: string, permanent: boolean = false): Promise<boolean> {
    if (permanent) {
      local.noteVersions.delete(id);
      return local.notes.delete(id);
    }
    const note = local.notes.get(id);
    if (!note) return false;
    note.is_trash = true;
    note.updated_at = new Date().toISOString();
    return true;
  },

  // Note Versions
  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return local.noteVersions.get(noteId) || [];
  },

  async createNoteVersion(noteId: string, title: string, content_json: any, created_by?: string | null): Promise<NoteVersion> {
    const list = local.noteVersions.get(noteId) || [];
    const version: NoteVersion = {
      id: `ver_${Date.now()}`,
      note_id: noteId,
      title,
      content_json,
      created_by,
      created_at: new Date().toISOString(),
    };
    list.unshift(version);
    // Keep max 20 versions
    if (list.length > 20) list.pop();
    local.noteVersions.set(noteId, list);
    return version;
  },

  async restoreNoteVersion(noteId: string, versionId: string): Promise<Note | null> {
    const list = local.noteVersions.get(noteId) || [];
    const version = list.find((v) => v.id === versionId);
    if (!version) return null;
    return this.updateNote(noteId, {
      title: version.title,
      content_json: version.content_json,
    });
  },

  // Reminders & Background Scheduling Engine
  async createReminder(data: {
    task_id: string;
    user_id: string;
    workspace_id: string;
    scheduled_at: string;
  }): Promise<Reminder> {
    const id = `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const reminder: Reminder = {
      id,
      task_id: data.task_id,
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      scheduled_at: data.scheduled_at,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString(),
    };
    local.reminders.set(id, reminder);
    return reminder;
  },

  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date().getTime();
    const due: Reminder[] = [];
    for (const rem of local.reminders.values()) {
      if (rem.status === 'pending' && new Date(rem.scheduled_at).getTime() <= now) {
        const task = local.tasks.get(rem.task_id);
        due.push({ ...rem, task });
      }
    }
    return due;
  },

  async lockReminder(id: string, workerId: string): Promise<boolean> {
    const rem = local.reminders.get(id);
    if (!rem || rem.status !== 'pending') return false;
    rem.status = 'processing';
    rem.locked_at = new Date().toISOString();
    rem.locked_by = workerId;
    return true;
  },

  async markReminderSent(id: string): Promise<void> {
    const rem = local.reminders.get(id);
    if (rem) {
      rem.status = 'sent';
      rem.delivered_at = new Date().toISOString();
    }
  },

  async markReminderFailed(id: string, error: string): Promise<void> {
    const rem = local.reminders.get(id);
    if (rem) {
      rem.retry_count++;
      rem.status = rem.retry_count >= 3 ? 'failed' : 'pending';
      rem.error_message = error;
    }
  },

  // In-App Notifications
  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    const list: NotificationItem[] = [];
    for (const n of local.notifications.values()) {
      if (n.user_id === userId) list.push(n);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getUnreadNotificationCount(userId: string): Promise<number> {
    let count = 0;
    for (const n of local.notifications.values()) {
      if (n.user_id === userId && !n.is_read) count++;
    }
    return count;
  },

  async markNotificationRead(id: string): Promise<void> {
    const n = local.notifications.get(id);
    if (n) n.is_read = true;
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    for (const n of local.notifications.values()) {
      if (n.user_id === userId) n.is_read = true;
    }
  },

  async createNotification(data: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>): Promise<NotificationItem> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const item: NotificationItem = {
      ...data,
      id,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    local.notifications.set(id, item);
    return item;
  },

  // Notification Preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const existing = local.notificationPreferences.get(userId);
    if (existing) return existing;
    const defaults: NotificationPreferences = {
      user_id: userId,
      browser_push_enabled: true,
      email_enabled: true,
      task_reminders: true,
      workspace_activity: true,
      daily_summary: true,
      updated_at: new Date().toISOString(),
    };
    local.notificationPreferences.set(userId, defaults);
    return defaults;
  },

  async updateNotificationPreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await this.getNotificationPreferences(userId);
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    local.notificationPreferences.set(userId, updated);
    return updated;
  },

  // Push Subscriptions
  async savePushSubscription(userId: string, sub: { endpoint: string; p256dh: string; auth: string }, userAgent?: string): Promise<PushSubscriptionRecord> {
    const id = `sub_${Date.now()}`;
    const record: PushSubscriptionRecord = {
      id,
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    local.pushSubscriptions.set(sub.endpoint, record);
    return record;
  },

  async getUserPushSubscriptions(userId: string): Promise<PushSubscriptionRecord[]> {
    const list: PushSubscriptionRecord[] = [];
    for (const s of local.pushSubscriptions.values()) {
      if (s.user_id === userId) list.push(s);
    }
    return list;
  },

  async deletePushSubscription(endpoint: string): Promise<boolean> {
    return local.pushSubscriptions.delete(endpoint);
  },

  // Attachments
  async getAttachments(workspaceId: string, taskId?: string, noteId?: string): Promise<Attachment[]> {
    const list: Attachment[] = [];
    for (const a of local.attachments.values()) {
      if (a.workspace_id !== workspaceId) continue;
      if (taskId && a.task_id !== taskId) continue;
      if (noteId && a.note_id !== noteId) continue;
      list.push(a);
    }
    return list;
  },

  async createAttachment(data: Omit<Attachment, 'id' | 'created_at'>): Promise<Attachment> {
    const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const att: Attachment = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    local.attachments.set(id, att);
    return att;
  },

  async deleteAttachment(id: string): Promise<boolean> {
    return local.attachments.delete(id);
  },

  // Productivity Analytics Aggregator
  async getProductivityStats(workspaceId: string, userId: string): Promise<ProductivityStats> {
    let completed = 0;
    let remaining = 0;
    let overdue = 0;
    let notesCount = 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const byPriority = { urgent: 0, high: 0, medium: 0, low: 0 };
    const projectStatsMap = new Map<string, { total: number; completed: number }>();

    for (const t of local.tasks.values()) {
      if (t.workspace_id !== workspaceId) continue;

      if (t.status === 'completed') {
        completed++;
      } else {
        remaining++;
        if (t.due_date && t.due_date < todayStr) {
          overdue++;
        }
      }

      if (t.priority in byPriority) {
        byPriority[t.priority]++;
      }

      if (t.project_id) {
        const p = projectStatsMap.get(t.project_id) || { total: 0, completed: 0 };
        p.total++;
        if (t.status === 'completed') p.completed++;
        projectStatsMap.set(t.project_id, p);
      }
    }

    for (const n of local.notes.values()) {
      if (n.workspace_id === workspaceId && !n.is_trash) {
        notesCount++;
      }
    }

    const total = completed + remaining;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byProject = Array.from(projectStatsMap.entries()).map(([projId, stats]) => {
      const proj = local.projects.get(projId);
      return {
        id: projId,
        name: proj?.name || 'General',
        color: proj?.color || '#3B82F6',
        total: stats.total,
        completed: stats.completed,
      };
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyTrend = days.map((day, idx) => ({
      day,
      completed: Math.max(1, (completed + idx) % 5),
      created: Math.max(1, (total + idx * 2) % 6),
    }));

    return toPlain({
      tasks_completed: completed,
      tasks_remaining: remaining,
      overdue_tasks: overdue,
      notes_created: notesCount,
      completion_rate: completionRate,
      by_priority: byPriority,
      by_project: byProject,
      weekly_trend: weeklyTrend,
    });
  },
};
