import { NextResponse } from 'next/server';
import { processDueReminders } from '@/lib/scheduler/engine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const isVercelCron = Boolean(request.headers.get('x-vercel-cron'));
    const secret = searchParams.get('secret') || authHeader?.replace('Bearer ', '');

    const expectedSecret = process.env.CRON_SECRET || 'taskpad_cron_secret_2026_dev';

    // Allow if:
    // 1. In development
    // 2. Sent by Vercel native cron (x-vercel-cron header)
    // 3. Authenticated by CRON_SECRET bearer token or query parameter
    const isAuthorized =
      process.env.NODE_ENV !== 'production' ||
      isVercelCron ||
      secret === expectedSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: invalid cron secret' }, { status: 401 });
    }

    const workerId = `cron_endpoint_${Date.now()}`;
    const result = await processDueReminders(workerId);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error('Error in cron reminder route:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Scheduler processing failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
