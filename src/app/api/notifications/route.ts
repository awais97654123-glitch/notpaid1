import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/user';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const notifications = await db.getUserNotifications(user.id);
    const unreadCount = await db.getUnreadNotificationCount(user.id);
    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error('[API /api/notifications GET error]', error);
    return NextResponse.json({ notifications: [], unreadCount: 0, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();

    if (body.action === 'mark_all_read') {
      await db.markAllNotificationsRead(user.id);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'mark_read' && body.id) {
      await db.markNotificationRead(body.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/notifications POST error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
