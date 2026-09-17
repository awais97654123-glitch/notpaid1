import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { sendWebPush } from '@/lib/notifications/web-push';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const subscriptions = await db.getUserPushSubscriptions(user.id);

    if (subscriptions.length === 0) {
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
          title: 'TaskPad Reminder',
          body: 'TaskPad push notifications are working smoothly!',
          url: '/dashboard',
        }
      );
      if (res.success) sentCount++;
      else if (res.error) errors.push(res.error);
    }

    // Also create in-app notification
    const workspaces = await db.getUserWorkspaces(user.id);
    await db.createNotification({
      user_id: user.id,
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
