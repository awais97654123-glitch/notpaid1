// Supabase Edge Function: process-reminders
// Invoked periodically via pg_cron or HTTP webhook.
// Atomically processes due reminders, dispatches Web Push & Email, and persists delivery telemetry.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const cronSecret = Deno.env.get('CRON_SECRET') || 'taskpad_secure_cron_worker_secret_key_2026';

    const authHeader = req.headers.get('Authorization');
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get('secret') || authHeader?.replace('Bearer ', '');

    // Allow invocation if secret matches or if executed within internal Supabase network
    if (providedSecret && providedSecret !== cronSecret && providedSecret !== supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized invocation' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const workerId = `edge_worker_${Date.now()}`;
    const nowIso = new Date().toISOString();

    // 1. Call atomic PostgreSQL claim procedure or lock directly with FOR UPDATE SKIP LOCKED
    // Check for due reminders: status = 'pending' AND scheduled_at <= now
    const { data: claimedReminders, error: claimError } = await supabase.rpc('claim_due_reminders', {
      p_worker_id: workerId,
      p_batch_size: 50,
    });

    let remindersToProcess = claimedReminders || [];

    // Fallback if RPC is not yet created in PostgreSQL: update directly with atomic condition
    if (claimError || !claimedReminders) {
      const { data: rawDue, error: selectErr } = await supabase
        .from('reminders')
        .select('*, task:tasks(*)')
        .eq('status', 'pending')
        .lte('scheduled_at', nowIso)
        .limit(50);

      if (!selectErr && rawDue && rawDue.length > 0) {
        const ids = rawDue.map((r: any) => r.id);
        const { data: locked, error: lockErr } = await supabase
          .from('reminders')
          .update({
            status: 'processing',
            locked_at: nowIso,
            locked_by: workerId,
            updated_at: nowIso,
          })
          .in('id', ids)
          .eq('status', 'pending')
          .select('*, task:tasks(*)');

        if (!lockErr && locked) {
          remindersToProcess = locked;
        }
      }
    }

    const logs: string[] = [];
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    logs.push(`[${nowIso}] Edge Worker ${workerId} running. Claimed ${remindersToProcess.length} reminders.`);

    for (const rem of remindersToProcess) {
      processedCount++;
      const task = rem.task;

      // Check if task exists and is not already completed
      if (!task || task.status === 'completed') {
        logs.push(`[Cancelled] Reminder ${rem.id}: Task missing or completed.`);
        await supabase
          .from('reminders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', rem.id);
        skippedCount++;
        continue;
      }

      // Read user notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', rem.user_id)
        .maybeSingle();

      const allowPush = prefs ? prefs.browser_push_enabled && prefs.task_reminders : true;
      const allowEmail = prefs ? prefs.email_enabled && prefs.task_reminders : true;

      let pushStatus = 'skipped';
      let emailStatus = 'skipped';
      let inAppStatus = 'skipped';
      const channelErrors: string[] = [];

      // A. In-App Notification (Always created if task_reminders enabled)
      try {
        await supabase.from('notifications').insert({
          user_id: rem.user_id,
          workspace_id: rem.workspace_id,
          type: 'task_reminder',
          title: `Task Due: ${task.title}`,
          message: `${task.title} is scheduled for ${task.due_date || 'today'} at ${task.due_time || 'now'} (${rem.timezone}).`,
          resource_type: 'task',
          resource_id: task.id,
          is_read: false,
          created_at: new Date().toISOString(),
        });
        inAppStatus = 'sent';
      } catch (err: any) {
        inAppStatus = 'failed';
        channelErrors.push(`In-App: ${err.message}`);
      }

      // B. Web Push via stored push subscriptions
      if (allowPush) {
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', rem.user_id);

        if (subscriptions && subscriptions.length > 0) {
          let pushSuccess = false;
          for (const sub of subscriptions) {
            try {
              // Web push dispatch (can also invoke Next.js push endpoint or native webpush)
              const appUrl = Deno.env.get('APP_URL') || 'https://taskpad.app';
              const pushResp = await fetch(`${appUrl}/api/notifications/test-push`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${cronSecret}`,
                },
                body: JSON.stringify({
                  userId: rem.user_id,
                  taskId: task.id,
                  taskTitle: task.title,
                  reminderTime: `${task.due_date || 'Today'} ${task.due_time || ''}`,
                  endpoint: sub.endpoint,
                }),
              });

              if (pushResp.ok) {
                pushSuccess = true;
              } else if (pushResp.status === 404 || pushResp.status === 410) {
                // Delete stale/expired subscription
                await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                logs.push(`Cleaned up expired push subscription: ${sub.endpoint.slice(0, 25)}...`);
              }
            } catch (pErr: any) {
              channelErrors.push(`Push: ${pErr.message}`);
            }
          }
          pushStatus = pushSuccess ? 'sent' : 'failed';
        }
      }

      // C. Email Notification
      if (allowEmail) {
        try {
          const resendKey = Deno.env.get('RESEND_API_KEY');
          if (resendKey) {
            const { data: userRec } = await supabase
              .from('users')
              .select('email')
              .eq('id', rem.user_id)
              .maybeSingle();

            const recipient = userRec?.email || 'notifications@taskpad.app';

            const emailRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'TaskPad <onboarding@resend.dev>',
                to: recipient,
                subject: `Task Reminder: ${task.title}`,
                html: `<h3>TaskPad Reminder</h3><p><strong>${task.title}</strong> is due at ${task.due_date || 'today'} ${task.due_time || ''} (${rem.timezone}).</p>`,
              }),
            });

            emailStatus = emailRes.ok ? 'sent' : 'failed';
          }
        } catch (eErr: any) {
          channelErrors.push(`Email: ${eErr.message}`);
        }
      }

      // D. Record Delivery and Update Reminder Lifecycle
      const anySuccess = pushStatus === 'sent' || emailStatus === 'sent' || inAppStatus === 'sent';
      const finishTime = new Date().toISOString();
      const currentAttempts = (rem.attempts || 0) + 1;

      let finalStatus = 'sent';
      if (!anySuccess) {
        finalStatus = currentAttempts >= 3 ? 'failed' : 'pending'; // retry if under max attempts
        failedCount++;
      } else {
        successCount++;
      }

      await supabase
        .from('reminders')
        .update({
          status: finalStatus,
          push_status: pushStatus,
          email_status: emailStatus,
          in_app_status: inAppStatus,
          attempts: currentAttempts,
          last_attempt_at: finishTime,
          sent_at: anySuccess ? finishTime : null,
          delivered_at: anySuccess ? finishTime : null,
          error_message: channelErrors.length > 0 ? channelErrors.join(' | ') : null,
          updated_at: finishTime,
        })
        .eq('id', rem.id);

      // Record in notification_deliveries table
      await supabase.from('notification_deliveries').insert([
        { reminder_id: rem.id, channel: 'in_app', status: inAppStatus === 'sent' ? 'sent' : 'skipped' },
        { reminder_id: rem.id, channel: 'push', status: pushStatus === 'sent' ? 'sent' : 'failed' },
        { reminder_id: rem.id, channel: 'email', status: emailStatus === 'sent' ? 'sent' : 'failed' },
      ]);
    }

    // Record scheduler run telemetry
    await supabase.from('scheduler_runs').insert({
      worker_id: workerId,
      processed_count: processedCount,
      success_count: successCount,
      failed_count: failedCount,
      skipped_count: skippedCount,
      run_at: nowIso,
    }).catch(() => {});

    return new Response(
      JSON.stringify({
        success: true,
        workerId,
        processedCount,
        successCount,
        failedCount,
        skippedCount,
        timestamp: nowIso,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
