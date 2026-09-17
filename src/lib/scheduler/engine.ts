import { db } from '@/lib/db/repository';
import { sendWebPush } from '@/lib/notifications/web-push';
import { sendTaskReminderEmail } from '@/lib/notifications/email';

export interface SchedulerExecutionResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
  logs: string[];
}

export async function processDueReminders(workerId: string = 'cron_worker'): Promise<SchedulerExecutionResult> {
  const logs: string[] = [];
  let processedCount = 0;
  let successCount = 0;
  let failedCount = 0;

  logs.push(`[${new Date().toISOString()}] Scheduler run initiated by ${workerId}`);

  // 1. Find due reminders
  const dueReminders = await db.getDueReminders();
  logs.push(`Found ${dueReminders.length} due reminders to process`);

  for (const reminder of dueReminders) {
    // 2. Lock/claim job safely (atomic status change: pending -> processing)
    const claimed = await db.lockReminder(reminder.id, workerId);
    if (!claimed) {
      logs.push(`Reminder ${reminder.id} already claimed by another worker. Skipping.`);
      continue;
    }

    processedCount++;
    const task = reminder.task || (await db.getTaskById(reminder.task_id));

    if (!task) {
      await db.markReminderFailed(reminder.id, 'Task associated with reminder not found');
      failedCount++;
      continue;
    }

    // 3. Check notification preferences
    const preferences = await db.getNotificationPreferences(reminder.user_id);
    const user = await db.getUserById(reminder.user_id);
    const userEmail = user?.email || 'user@taskpad.app';

    let pushSuccess = false;
    let emailSuccess = false;

    // 4. Send Web Push if enabled
    if (preferences.browser_push_enabled) {
      const subscriptions = await db.getUserPushSubscriptions(reminder.user_id);
      if (subscriptions.length > 0) {
        for (const sub of subscriptions) {
          const res = await sendWebPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            {
              title: 'TaskPad Reminder',
              body: `${task.title} — due now.`,
              url: `/tasks?id=${task.id}`,
            }
          );
          if (res.success) pushSuccess = true;
        }
        logs.push(`Push sent for task "${task.title}": ${pushSuccess ? 'Success' : 'Failed'}`);
      } else {
        logs.push(`No active push subscription for user ${reminder.user_id}`);
      }
    }

    // 5. Send Email if enabled
    if (preferences.email_enabled) {
      const emailRes = await sendTaskReminderEmail({
        to: userEmail,
        taskTitle: task.title,
        description: task.description,
        dueDate: task.due_date,
        dueTime: task.due_time,
        priority: task.priority,
        projectName: task.project?.name,
        taskId: task.id,
      });
      emailSuccess = emailRes.success;
      logs.push(`Email sent to ${userEmail} for task "${task.title}": ${emailSuccess ? 'Success' : 'Failed'}`);
    }

    // 6. Create in-app notification
    await db.createNotification({
      user_id: reminder.user_id,
      workspace_id: reminder.workspace_id,
      type: 'task_reminder',
      title: `Reminder: ${task.title}`,
      message: `Task is due ${task.due_date || 'today'} at ${task.due_time || 'scheduled time'}.`,
      resource_type: 'task',
      resource_id: task.id,
    });

    // 7. Mark reminder processed
    await db.markReminderSent(reminder.id);
    successCount++;
    logs.push(`Reminder ${reminder.id} processed and marked as sent`);
  }

  logs.push(`Scheduler run finished. Processed: ${processedCount}, Success: ${successCount}, Failed: ${failedCount}`);

  return {
    processedCount,
    successCount,
    failedCount,
    logs,
  };
}
