export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkspaceRole = 'owner' | 'admin' | 'member';
export type ReminderStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
export type DeliveryChannel = 'push' | 'email' | 'in_app';
export type DeliveryStatus = 'sent' | 'failed' | 'skipped';
export type NotificationType =
  | 'task_due'
  | 'task_reminder'
  | 'task_assigned'
  | 'task_completed'
  | 'workspace_invitation'
  | 'comment'
  | 'system';

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  role?: WorkspaceRole;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  user?: User;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface Folder {
  id: string;
  workspace_id: string;
  parent_id?: string | null;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null; // YYYY-MM-DD
  due_time: string | null; // HH:mm:ss
  start_date?: string | null;
  start_time?: string | null;
  timezone: string;
  reminder_offset: number; // 0, 5, 10, 15, 30, 60, 1440
  recurrence_rule?: string | null;
  assignee_id?: string | null;
  completed_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
  tags?: Tag[];
  project?: Project;
}

export interface Note {
  id: string;
  workspace_id: string;
  folder_id?: string | null;
  project_id?: string | null;
  title: string;
  content_json: any;
  content_text: string;
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  is_trash: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  folder?: Folder;
  project?: Project;
}

export interface NoteVersion {
  id: string;
  note_id: string;
  title: string;
  content_json: any;
  created_by?: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  created_by?: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  workspace_id: string;
  scheduled_at: string; // Canonical UTC ISO timestamp
  timezone: string;
  status: ReminderStatus;
  push_status?: 'pending' | 'sent' | 'failed' | 'skipped';
  email_status?: 'pending' | 'sent' | 'failed' | 'skipped';
  in_app_status?: 'pending' | 'sent' | 'failed' | 'skipped';
  locked_at?: string | null;
  locked_by?: string | null;
  delivered_at?: string | null;
  sent_at?: string | null;
  retry_count: number;
  attempts: number;
  last_attempt_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at?: string;
  task?: Task;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  workspace_id: string;
  type: NotificationType;
  title: string;
  message: string;
  resource_type?: string | null;
  resource_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  browser_push_enabled: boolean;
  email_enabled: boolean;
  task_reminders: boolean;
  workspace_activity: boolean;
  daily_summary: boolean;
  updated_at: string;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  workspace_id: string;
  task_id?: string | null;
  note_id?: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by?: string | null;
  created_at: string;
  url?: string;
}

export interface ActivityLog {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: any;
  created_at: string;
  user?: User;
}

export interface ProductivityStats {
  tasks_completed: number;
  tasks_remaining: number;
  overdue_tasks: number;
  notes_created: number;
  completion_rate: number;
  by_priority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  by_project: {
    id: string;
    name: string;
    color: string;
    total: number;
    completed: number;
  }[];
  weekly_trend: {
    day: string;
    completed: number;
    created: number;
  }[];
}
