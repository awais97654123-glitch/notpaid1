import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/user';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const subscriptions = await db.getUserPushSubscriptions(user.id);
    const pushTelemetry = db.getPushTelemetry();
    const schedulerTelemetry = db.getSchedulerTelemetry();
    const lastReminder = db.getLastProcessedReminder();

    const hasActiveSubscription = subscriptions.length > 0;
    const activeEndpointSnippet = hasActiveSubscription
      ? `${subscriptions[0].endpoint.substring(0, 32)}...`
      : 'None';

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics: {
        userId: user.id,
        userEmail: user.email,
        pushPermission: hasActiveSubscription ? 'granted' : 'prompt_or_denied',
        serviceWorkerStatus: 'active',
        pushSubscriptionStatus: hasActiveSubscription ? `Subscribed (${subscriptions.length} device)` : 'Not Subscribed',
        subscriptionCount: subscriptions.length,
        activeEndpoint: activeEndpointSnippet,
        lastSuccessfulPush: pushTelemetry?.lastSuccess || 'Awaiting trigger',
        lastFailedPush: pushTelemetry?.lastFailed ? `${pushTelemetry.lastFailed} (${pushTelemetry.lastError || 'failed'})` : 'None',
        lastSchedulerRun: schedulerTelemetry?.lastRun || 'Every 60s (pg_cron / Vercel)',
        schedulerWorkerId: schedulerTelemetry?.workerId || 'cron_worker',
        schedulerProcessedCount: schedulerTelemetry?.processedCount ?? 0,
        lastReminderProcessed: lastReminder
          ? {
              id: lastReminder.id,
              taskTitle: lastReminder.task?.title || 'Scheduled Task',
              status: lastReminder.status,
              scheduledAt: lastReminder.scheduled_at,
              deliveredAt: lastReminder.delivered_at || lastReminder.sent_at,
              channelStatus: {
                push: lastReminder.push_status,
                email: lastReminder.email_status,
                inApp: lastReminder.in_app_status,
              },
            }
          : {
              taskTitle: 'No reminders processed yet',
              status: 'pending',
            },
      },
    });
  } catch (error: any) {
    console.error('Diagnostics API error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch diagnostics' },
      { status: 500 }
    );
  }
}
