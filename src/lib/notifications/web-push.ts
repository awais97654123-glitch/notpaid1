import webpush from 'web-push';
import type { PushSubscriptionRecord } from '@/types';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BO8e-_FpknkT6a_Afr3bU_sSmO1pQHB2OPP_mS5nlMjRMBJ9cFx7sxp1ORYoa9L6DKnPqMYXvwjBB5UBI9Vzams';
const privateKey = process.env.VAPID_PRIVATE_KEY || '_gKhLBUcgTdf4nzVaIZP0reXrDKvWffM9zEz2UUwSlU';
const subject = process.env.VAPID_SUBJECT || 'mailto:notifications@taskpad.app';

try {
  webpush.setVapidDetails(subject, publicKey, privateKey);
} catch (e) {
  console.warn('Error setting VAPID details:', e);
}

export interface PushPayload {
  title: string;
  body: string;
  taskTitle?: string;
  taskId?: string;
  reminderTime?: string;
  url?: string;
  badge?: string;
  tag?: string;
}

export interface PushResult {
  success: boolean;
  isExpired?: boolean;
  statusCode?: number;
  error?: string;
}

export async function sendWebPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<PushResult> {
  try {
    if (!sub.endpoint || !sub.p256dh || !sub.auth) {
      return { success: false, error: 'Invalid push subscription keys' };
    }

    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    const response = await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    return { success: true, statusCode: response.statusCode };
  } catch (error: any) {
    const statusCode = error.statusCode || error.status;
    const isExpired = statusCode === 404 || statusCode === 410;

    if (isExpired) {
      console.warn(`[WebPush] Subscription expired or unsubscribed (${statusCode}): ${sub.endpoint}`);
    } else {
      console.error('[WebPush Delivery Error]:', error.message || error);
    }

    return {
      success: false,
      isExpired,
      statusCode,
      error: error?.message || 'Failed to send web push',
    };
  }
}
