-- ============================================================================
-- TaskPad Database Migration 002: Row Level Security (RLS) Policies
-- Enforces data ownership, workspace isolation, and member authorization
-- ============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_task_rules ENABLE ROW LEVEL SECURITY;

-- Helper function: get current internal user UUID from clerk_id (via request header/jwt)
CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS UUID AS $$
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub' LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: check if user is a member of workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_id = ws_id 
        AND user_id = current_app_user_id()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Users policies
CREATE POLICY "Users can view own profile or workspace peers"
    ON users FOR SELECT
    USING (id = current_app_user_id() OR EXISTS (
        SELECT 1 FROM workspace_members wm1
        JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
        WHERE wm1.user_id = current_app_user_id() AND wm2.user_id = users.id
    ));

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (id = current_app_user_id());

-- 2. Workspaces policies
CREATE POLICY "Members can view their workspaces"
    ON workspaces FOR SELECT
    USING (is_workspace_member(id) OR owner_id = current_app_user_id());

CREATE POLICY "Owners and admins can update workspaces"
    ON workspaces FOR UPDATE
    USING (owner_id = current_app_user_id() OR EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = workspaces.id
        AND user_id = current_app_user_id()
        AND role IN ('owner', 'admin')
    ));

-- 3. Workspace members policies
CREATE POLICY "Workspace members can view co-members"
    ON workspace_members FOR SELECT
    USING (is_workspace_member(workspace_id));

-- 4. Projects policies
CREATE POLICY "Workspace members can view projects"
    ON projects FOR SELECT
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can create projects"
    ON projects FOR INSERT
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update projects"
    ON projects FOR UPDATE
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete projects"
    ON projects FOR DELETE
    USING (is_workspace_member(workspace_id));

-- 5. Tasks policies
CREATE POLICY "Workspace members can view tasks"
    ON tasks FOR SELECT
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert tasks"
    ON tasks FOR INSERT
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update tasks"
    ON tasks FOR UPDATE
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete tasks"
    ON tasks FOR DELETE
    USING (is_workspace_member(workspace_id));

-- 6. Subtasks policies
CREATE POLICY "Workspace members can view subtasks"
    ON subtasks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND is_workspace_member(tasks.workspace_id)
    ));

CREATE POLICY "Workspace members can manage subtasks"
    ON subtasks FOR ALL
    USING (EXISTS (
        SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND is_workspace_member(tasks.workspace_id)
    ));

-- 7. Notes policies
CREATE POLICY "Workspace members can view notes"
    ON notes FOR SELECT
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can create notes"
    ON notes FOR INSERT
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update notes"
    ON notes FOR UPDATE
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete notes"
    ON notes FOR DELETE
    USING (is_workspace_member(workspace_id));

-- 8. Reminders & Push Subscriptions (Personal user data)
CREATE POLICY "Users can manage own reminders"
    ON reminders FOR ALL
    USING (user_id = current_app_user_id());

CREATE POLICY "Users can manage own push subscriptions"
    ON push_subscriptions FOR ALL
    USING (user_id = current_app_user_id());

CREATE POLICY "Users can view own in-app notifications"
    ON notifications FOR ALL
    USING (user_id = current_app_user_id());

CREATE POLICY "Users can manage own notification preferences"
    ON notification_preferences FOR ALL
    USING (user_id = current_app_user_id());
