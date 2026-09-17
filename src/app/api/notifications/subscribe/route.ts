import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/user';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: 'Invalid push subscription payload' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || undefined;

    const record = await db.savePushSubscription(
      user.id,
      {
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
      userAgent
    );

    return NextResponse.json({ success: true, subscription: record });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save subscription' }, { status: 500 });
  }
}
