import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { sendTaskReminderEmail } from '@/lib/notifications/email';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    let recipient = user.email;

    try {
      const body = await request.json();
      if (body.to && typeof body.to === 'string' && body.to.includes('@')) {
        recipient = body.to;
      }
    } catch {
      // Body not provided or not JSON, use default recipient
    }

    const result = await sendTaskReminderEmail({
      to: recipient,
      taskTitle: 'Test Task Notification',
      description: 'This is a test notification to verify your TaskPad email reminder integration with Resend & Gmail.',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '12:00:00',
      priority: 'high',
      projectName: 'Notification Setup',
      taskId: 'test_task_id',
    });

    return NextResponse.json({
      success: result.success,
      recipient,
      messageId: result.messageId,
      message: `Test email notification dispatched to ${recipient}`,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to send test email' }, { status: 500 });
  }
}
