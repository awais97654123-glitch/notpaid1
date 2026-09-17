import { db } from '@/lib/db/repository';
import { sendWebPush } from '@/lib/notifications/web-push';
import { sendTaskReminderEmail } from '@/lib/notifications/email';

export interface SchedulerExecutionResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  logs: string[];
}

/**
 * Server-side robust scheduler engine
 * Handles atomic claiming, verification, multi-channel independent delivery,
 * and delivery status persistence.
 */
export async function processDueReminders(workerId: string = 'cron_worker'): Promise<SchedulerExecutionResult> {
  const logs: string[] = [];
  let processedCount = 0;
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  const nowIso = new Date().toISOString();
  logs.push(`[${nowIso}] Scheduler run initiated by ${workerId}`);

  // 1. Find all due reminders (status = 'pending' and scheduled_at <= now)
  const dueReminders = await db.getDueReminders();
  logs.push(`Found ${dueReminders.length} due reminders to evaluate`);

  for (const reminder of dueReminders) {
    // 2. Safely claim job atomically (pending -> processing)
    const claimed = await db.lockReminder(reminder.id, workerId);
    if (!claimed) {
      logs.push(`[Skip] Reminder ${reminder.id} already claimed by another worker.`);
      skippedCount++;
      continue;
    }

    processedCount++;

    // 3. Verify task exists, is not deleted, and is not already completed
    const task = reminder.task || (await db.getTaskById(reminder.task_id));
    if (!task) {
      logs.push(`[Cancelled] Reminder ${reminder.id}: associated task ${reminder.task_id} not found.`);
      await db.recordReminderDelivery(reminder.id, {
        push_status: 'skipped',
        email_status: 'skipped',
        in_app_status: 'skipped',
        error_message: 'Task associated with reminder was deleted or not found',
      });
      failedCount++;
      continue;
    }

    if (task.status === 'completed') {
      logs.push(`[Cancelled] Reminder ${reminder.id}: task "${task.title}" is already completed.`);
      await db.cancelTaskReminders(task.id);
      skippedCount++;
      continue;
    }

    // 4. Read user notification preferences
    const preferences = await db.getNotificationPreferences(reminder.user_id);
    if (!preferences.task_reminders) {
      logs.push(`[Skipped] User ${reminder.user_id} disabled task reminders in preferences.`);
      await db.recordReminderDelivery(reminder.id, {
        push_status: 'skipped',
        email_status: 'skipped',
        in_app_status: 'skipped',
      });
      successCount++;
      continue;
    }

    const user = await db.getUserById(reminder.user_id);
    const userEmail = user?.email || 'malikabubakkar523@gmail.com';

    let pushStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
    let emailStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
    let inAppStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
    const channelErrors: string[] = [];

    // 5. Channel 1: In-App Notification (Always enabled if task_reminders is on)
    try {
      await db.createNotification({
        user_id: reminder.user_id,
        workspace_id: reminder.workspace_id,
        type: 'task_reminder',
        title: `Task Due: ${task.title}`,
        message: `${task.title} is scheduled for ${task.due_date || 'today'} at ${task.due_time || 'now'} (${reminder.timezone}).`,
        resource_type: 'task',
        resource_id: task.id,
      });
      inAppStatus = 'sent';
      logs.push(`[In-App] Created in-app notification for task "${task.title}"`);
    } catch (err: any) {
      inAppStatus = 'failed';
      channelErrors.push(`In-App error: ${err.message}`);
      logs.push(`[In-App Error] ${err.message}`);
    }

    // 6. Channel 2: Web Push (if enabled)
    if (preferences.browser_push_enabled) {
      try {
        const subscriptions = await db.getUserPushSubscriptions(reminder.user_id);
        if (subscriptions.length > 0) {
          let pushSent = false;
          for (const sub of subscriptions) {
            const pushRes = await sendWebPush(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              {
                title: 'TaskPad Reminder',
                body: `${task.title} — due now.`,
                url: `/tasks?id=${task.id}`,
              }
            );

            if (pushRes.success) {
              pushSent = true;
            } else if (pushRes.isExpired) {
              // Delete expired/unsubscribed browser endpoint
              await db.deletePushSubscription(sub.endpoint);
              logs.push(`[WebPush] Removed expired subscription for endpoint: ${sub.endpoint.slice(0, 30)}...`);
            } else if (pushRes.error) {
              channelErrors.push(`Push: ${pushRes.error}`);
            }
          }
          pushStatus = pushSent ? 'sent' : 'failed';
          logs.push(`[WebPush] Dispatched push for task "${task.title}": ${pushStatus}`);
        } else {
          pushStatus = 'skipped';
          logs.push(`[WebPush] No push subscription registered for user ${reminder.user_id}`);
        }
      } catch (err: any) {
        pushStatus = 'failed';
        channelErrors.push(`Push exception: ${err.message}`);
        logs.push(`[WebPush Error] ${err.message}`);
      }
    }

    // 7. Channel 3: Email Notification (if enabled)
    if (preferences.email_enabled) {
      try {
        const emailRes = await sendTaskReminderEmail({
          to: userEmail,
          taskTitle: task.title,
          description: task.description,
          dueDate: task.due_date,
          dueTime: task.due_time,
          timezone: reminder.timezone,
          priority: task.priority,
          projectName: task.project?.name,
          taskId: task.id,
        });

        if (emailRes.success) {
          emailStatus = 'sent';
          logs.push(`[Email Success] Dispatched reminder to ${userEmail} (ID: ${emailRes.messageId || 'ok'})`);
        } else {
          emailStatus = 'failed';
          channelErrors.push(`Email: ${emailRes.error || 'delivery failed'}`);
          logs.push(`[Email Failed] Could not deliver to ${userEmail}: ${emailRes.error}`);
        }
      } catch (err: any) {
        emailStatus = 'failed';
        channelErrors.push(`Email exception: ${err.message}`);
        logs.push(`[Email Error] ${err.message}`);
      }
    }

    // 8. Record independent delivery results & status
    const combinedError = channelErrors.length > 0 ? channelErrors.join(' | ') : undefined;
    await db.recordReminderDelivery(reminder.id, {
      push_status: pushStatus,
      email_status: emailStatus,
      in_app_status: inAppStatus,
      error_message: combinedError,
    });

    const anySuccess = pushStatus === 'sent' || emailStatus === 'sent' || inAppStatus === 'sent';
    if (anySuccess) {
      successCount++;
      logs.push(`[Delivery Complete] Reminder ${reminder.id} executed successfully. (In-App: ${inAppStatus}, Push: ${pushStatus}, Email: ${emailStatus})`);
    } else {
      failedCount++;
      logs.push(`[Delivery Failed] Reminder ${reminder.id} failed across all channels.`);
    }
  }

  logs.push(`[${new Date().toISOString()}] Scheduler run completed. Total: ${processedCount}, Success: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`);

  return {
    processedCount,
    successCount,
    failedCount,
    skippedCount,
    logs,
  };
}
