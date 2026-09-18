-- ============================================================================
-- Migration 004: Supabase Cron & Atomic Reminder Processing
-- Implements pg_cron schedule, atomic claim with FOR UPDATE SKIP LOCKED,
-- and scheduler telemetry tracking table.
-- ============================================================================

-- 1. Enable pg_cron and pg_net extensions (available in Supabase)
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Scheduler Telemetry Table
CREATE TABLE IF NOT EXISTS scheduler_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id VARCHAR(100) NOT NULL,
    processed_count INTEGER DEFAULT 0 NOT NULL,
    success_count INTEGER DEFAULT 0 NOT NULL,
    failed_count INTEGER DEFAULT 0 NOT NULL,
    skipped_count INTEGER DEFAULT 0 NOT NULL,
    logs TEXT,
    run_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduler_runs_run_at ON scheduler_runs(run_at DESC);

-- 3. Atomic Stored Procedure: claim_due_reminders
-- Uses FOR UPDATE SKIP LOCKED to guarantee idempotency and prevent duplicate delivery
CREATE OR REPLACE FUNCTION claim_due_reminders(
    p_worker_id TEXT,
    p_batch_size INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    task_id UUID,
    user_id UUID,
    workspace_id UUID,
    scheduled_at TIMESTAMPTZ,
    status reminder_status,
    timezone VARCHAR(64),
    attempts INTEGER,
    task JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH candidate_reminders AS (
        SELECT r.id
        FROM reminders r
        WHERE r.status = 'pending'
          AND r.scheduled_at <= NOW()
        ORDER BY r.scheduled_at ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    ),
    updated_reminders AS (
        UPDATE reminders r
        SET 
            status = 'processing',
            locked_at = NOW(),
            locked_by = p_worker_id,
            updated_at = NOW()
        FROM candidate_reminders c
        WHERE r.id = c.id
        RETURNING r.*
    )
    SELECT 
        u.id,
        u.task_id,
        u.user_id,
        u.workspace_id,
        u.scheduled_at,
        u.status,
        u.timezone,
        u.attempts,
        to_jsonb(t.*) as task
    FROM updated_reminders u
    LEFT JOIN tasks t ON t.id = u.task_id;
END;
$$;

-- 4. Periodic Supabase pg_cron Job (every 1 minute)
-- Invokes the process-reminders Edge Function or Next.js cron endpoint
-- Replace YOUR_PROJECT_REF with your Supabase Project ID or use the local Next.js endpoint
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Unschedule existing job if previously registered
        PERFORM cron.unschedule('process-taskpad-reminders-every-minute') 
        WHERE EXISTS (
            SELECT 1 FROM cron.job WHERE jobname = 'process-taskpad-reminders-every-minute'
        );

        -- Schedule cron job to run every 60 seconds
        PERFORM cron.schedule(
            'process-taskpad-reminders-every-minute',
            '* * * * *',
            $cron$
            SELECT net.http_post(
                url := current_setting('app.settings.edge_function_url', true) || '/functions/v1/process-reminders',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
                ),
                body := jsonb_build_object('triggered_by', 'pg_cron')
            );
            $cron$
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron schedule notice: %', SQLERRM;
END $$;
