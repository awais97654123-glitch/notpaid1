-- ============================================================================
-- TaskPad Database Seed Script
-- Populates initial demo workspace, projects, tasks, and notes for development
-- ============================================================================

-- Insert Demo User
INSERT INTO users (id, clerk_id, email, full_name, avatar_url, timezone, locale)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'user_taskpad_demo_01',
    'alex.morgan@taskpad.app',
    'Alex Morgan',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'UTC',
    'en'
) ON CONFLICT (clerk_id) DO NOTHING;

-- Insert Demo Workspaces
INSERT INTO workspaces (id, name, slug, icon, owner_id)
VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'Personal & Life',
    'personal-life',
    '🌿',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Engineering & SaaS',
    'engineering-saas',
    '⚡',
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;

-- Workspace Members
INSERT INTO workspace_members (workspace_id, user_id, role)
VALUES 
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'owner'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'owner')
ON CONFLICT DO NOTHING;

-- Notification Preferences
INSERT INTO notification_preferences (user_id, browser_push_enabled, email_enabled, task_reminders, workspace_activity, daily_summary)
VALUES ('a0000000-0000-0000-0000-000000000001', TRUE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- Projects
INSERT INTO projects (id, workspace_id, name, description, color, icon, created_by)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Academics & Study',
    'Coursework, assignments and exam preparation',
    '#6366F1',
    '🎓',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'TaskPad Launch',
    'Product release, testing, and marketing milestones',
    '#0EA5E9',
    '🚀',
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;

-- Tags
INSERT INTO tags (id, workspace_id, name, color)
VALUES 
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Mathematics', '#EC4899'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Assignment', '#F59E0B'),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Feature', '#10B981')
ON CONFLICT DO NOTHING;

-- Tasks (Including the exact spec example: "Complete Mathematics Assignment" on Sept 20, 2026, 7:30 PM)
INSERT INTO tasks (id, workspace_id, project_id, title, description, status, priority, due_date, due_time, timezone, reminder_offset, created_by)
VALUES 
(
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Complete Mathematics Assignment',
    'Differential equations problems 1-15 and submit to LMS portal.',
    'todo',
    'urgent',
    '2026-09-20',
    '19:30:00',
    'UTC',
    0,
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'Verify Push Notification Service Worker',
    'Test Web Push API registration, notification click action handler and offline caching.',
    'in_progress',
    'high',
    CURRENT_DATE,
    '16:00:00',
    'UTC',
    15,
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Review Linear Algebra Chapter 4',
    'Eigenvalues and Eigenvectors notes summary.',
    'completed',
    'medium',
    CURRENT_DATE - INTERVAL '1 day',
    '14:00:00',
    'UTC',
    0,
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;

-- Subtasks for Mathematics Assignment
INSERT INTO subtasks (id, task_id, title, is_completed, position)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Problems 1 to 5: First order ODEs', TRUE, 1),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Problems 6 to 10: Homogeneous equations', TRUE, 2),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'Problems 11 to 15: Boundary value problems', FALSE, 3),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Scan solutions and upload PDF to portal', FALSE, 4)
ON CONFLICT DO NOTHING;

-- Task Tags
INSERT INTO task_tags (task_id, tag_id)
VALUES 
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Reminders
INSERT INTO reminders (id, task_id, user_id, workspace_id, scheduled_at, status)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '2026-09-20 19:30:00+00',
    'pending'
) ON CONFLICT DO NOTHING;

-- Folders
INSERT INTO folders (id, workspace_id, name, icon, color)
VALUES 
('20000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Study Notes', '📚', '#8B5CF6'),
('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Meeting Memos', '📝', '#10B981')
ON CONFLICT DO NOTHING;

-- Notes
INSERT INTO notes (id, workspace_id, folder_id, project_id, title, content_json, content_text, is_pinned, is_favorite, created_by)
VALUES (
    '30000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Calculus & Differential Equations Guide',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Calculus & Differential Equations"}]},{"type":"paragraph","content":[{"type":"text","text":"Key concepts and formula quick reference for the upcoming assignment and exam preparation."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"First Order Linear Differential Equations"}]},{"type":"paragraph","content":[{"type":"text","text":"General form: dy/dx + P(x)y = Q(x). The integrating factor is I(x) = exp(integral(P(x)dx))."}]},{"type":"taskList","content":[{"type":"taskItem","attrs":{"checked":true},"content":[{"type":"paragraph","content":[{"type":"text","text":"Derive integrating factor proof"}]}]},{"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"Solve boundary value problem examples"}]}]}]}]}'::jsonb,
    'Calculus & Differential Equations. Key concepts and formula quick reference for the upcoming assignment and exam preparation. First Order Linear Differential Equations. General form: dy/dx + P(x)y = Q(x).',
    TRUE,
    TRUE,
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;

-- In-app Notifications
INSERT INTO notifications (id, user_id, workspace_id, type, title, message, resource_type, resource_id, is_read)
VALUES (
    '40000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'task_reminder',
    'Upcoming: Mathematics Assignment',
    'Your assignment is due on September 20, 2026 at 7:30 PM.',
    'task',
    'e0000000-0000-0000-0000-000000000001',
    FALSE
) ON CONFLICT DO NOTHING;
