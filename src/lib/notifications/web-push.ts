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
  url?: string;
}

export async function sendWebPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    return { success: true };
  } catch (error: any) {
    console.error('WebPush notification delivery error:', error);
    return { success: false, error: error?.message || 'Failed to send web push' };
  }
}
