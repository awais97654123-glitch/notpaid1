import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { sendWebPush } from '@/lib/notifications/web-push';

export async function POST(request: Request) {
  try {
    let targetUserId = '';
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'taskpad_secure_cron_worker_secret_key_2026';
    let bodyData: any = {};
    try {
      bodyData = await request.json();
    } catch (_) {}

    if (authHeader && authHeader.replace('Bearer ', '') === cronSecret && bodyData.userId) {
      targetUserId = bodyData.userId;
    } else {
      const user = await getAuthenticatedUser();
      targetUserId = user.id;
    }

    const subscriptions = await db.getUserPushSubscriptions(targetUserId);

    if (subscriptions.length === 0) {
      db.recordPushTelemetry({
        success: false,
        error: 'No active push subscriptions registered',
      });
      return NextResponse.json({
        success: false,
        message: 'No push subscription found for your browser. Please enable notifications first in settings.',
      });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      const res = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        {
          title: bodyData.title || 'TaskPad Reminder',
          taskTitle: bodyData.taskTitle || 'Test Push Task',
          taskId: bodyData.taskId,
          reminderTime: bodyData.reminderTime || 'Just now',
          body: bodyData.body || 'TaskPad push notifications are working smoothly!',
          url: bodyData.url || '/dashboard',
        }
      );
      if (res.success) {
        sentCount++;
      } else if (res.isExpired) {
        await db.deletePushSubscription(sub.endpoint);
      } else if (res.error) {
        errors.push(res.error);
      }
    }

    db.recordPushTelemetry({
      success: sentCount > 0,
      error: errors.join(' | '),
      taskTitle: bodyData.taskTitle || 'Test Push Notification',
    });

    // Also create in-app notification
    const workspaces = await db.getUserWorkspaces(targetUserId);
    await db.createNotification({
      user_id: targetUserId,
      workspace_id: workspaces[0]?.id || 'default',
      type: 'system',
      title: 'Push Notification Verified',
      message: 'Your browser push notifications are connected and working.',
    });

    return NextResponse.json({
      success: sentCount > 0,
      sentCount,
      errors: errors.length > 0 ? errors : undefined,
      message: sentCount > 0 ? 'Test push notification dispatched!' : 'Push failed to send.',
    });
  } catch (error: any) {
    console.error('Test push error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to send test push' }, { status: 500 });
  }
}
