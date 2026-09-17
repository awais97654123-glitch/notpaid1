-- Migration 003: Scheduled Reminders and Notification Delivery Upgrade
-- Adds multi-channel tracking, timezone canonical storage, and retry attempt metadata

ALTER TABLE reminders 
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) DEFAULT 'Asia/Karachi' NOT NULL,
  ADD COLUMN IF NOT EXISTS push_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  ADD COLUMN IF NOT EXISTS email_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  ADD COLUMN IF NOT EXISTS in_app_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Create high-performance index for due reminders query
CREATE INDEX IF NOT EXISTS idx_reminders_due_sweep ON reminders(status, scheduled_at)
  WHERE status = 'pending';

-- Index for task-to-reminder lifecycle lookup
CREATE INDEX IF NOT EXISTS idx_reminders_task_lookup ON reminders(task_id, status);
