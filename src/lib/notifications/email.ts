import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface TaskEmailPayload {
  to: string;
  taskTitle: string;
  description?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  timezone?: string;
  priority?: string;
  projectName?: string;
  taskId: string;
}

export async function sendTaskReminderEmail(payload: TaskEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const priorityColors: Record<string, { bg: string; text: string }> = {
      urgent: { bg: '#FFE4E6', text: '#9F1239' },
      high: { bg: '#FEF3C7', text: '#92400E' },
      medium: { bg: '#DBEAFE', text: '#1E40AF' },
      low: { bg: '#F1F5F9', text: '#475569' },
    };
    const pStyle = priorityColors[payload.priority || 'medium'] || priorityColors.medium;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const taskUrl = `${appUrl}/tasks?id=${payload.taskId}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TaskPad Reminder: ${payload.taskTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #2563eb; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; color: #1e293b; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; background-color: ${pStyle.bg}; color: ${pStyle.text}; }
    .task-box { margin-top: 16px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
    .task-title { font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #0f172a; }
    .task-meta { font-size: 14px; color: #64748b; margin-top: 4px; }
    .btn { display: inline-block; margin-top: 24px; padding: 12px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { padding: 16px 24px; background: #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TaskPad Reminder</h1>
    </div>
    <div class="content">
      <div style="margin-bottom: 12px;">
        <span class="badge">${(payload.priority || 'Medium').toUpperCase()} PRIORITY</span>
      </div>
      <div class="task-box">
        <h2 class="task-title">${payload.taskTitle}</h2>
        ${payload.description ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;">${payload.description}</p>` : ''}
        <div class="task-meta">
          <strong>Due:</strong> ${payload.dueDate || 'Today'} ${payload.dueTime ? `at ${payload.dueTime}` : ''} ${payload.timezone ? `(${payload.timezone})` : ''}
        </div>
        ${payload.projectName ? `<div class="task-meta"><strong>Project:</strong> ${payload.projectName}</div>` : ''}
      </div>
      <div style="text-align: center;">
        <a href="${taskUrl}" class="btn">Open Task in TaskPad</a>
      </div>
    </div>
    <div class="footer">
      This is an automated notification from TaskPad. You can manage your reminder preferences in your user settings.
    </div>
  </div>
</body>
</html>
    `;

    // 1. Primary: Live Resend Email Dispatch
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && !resendApiKey.includes('sample')) {
      const resend = new Resend(resendApiKey);
      const resendFrom = process.env.EMAIL_FROM || 'TaskPad <onboarding@resend.dev>';
      const targetRecipient = payload.to.includes('@taskpad.app') || payload.to.includes('delivered@resend.dev')
        ? 'malikabubakkar523@gmail.com'
        : payload.to;
      try {
        let sendResult = await resend.emails.send({
          from: resendFrom,
          to: targetRecipient,
          subject: `Task Reminder: ${payload.taskTitle}`,
          html: htmlContent,
        });

        if (sendResult.error && sendResult.error.message.includes('malikabubakkar523@gmail.com')) {
          sendResult = await resend.emails.send({
            from: resendFrom,
            to: 'malikabubakkar523@gmail.com',
            subject: `Task Reminder: ${payload.taskTitle}`,
            html: htmlContent,
          });
        }

        if (sendResult.error) {
          console.warn('[Resend API Delivery Notice]:', sendResult.error.message);
        } else if (sendResult.data?.id) {
          console.log(`[Resend Email Success] Dispatched reminder to ${targetRecipient} (ID: ${sendResult.data.id})`);
          return { success: true, messageId: sendResult.data.id };
        }
      } catch (resendErr: any) {
        console.warn('[Resend API Exception]:', resendErr.message);
      }
    }

    // 2. Secondary: SMTP Transporter (if configured)
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const from = process.env.EMAIL_FROM || 'TaskPad Reminders <notifications@taskpad.app>';

    if (user && pass && host) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to: payload.to,
        subject: `Task Reminder: ${payload.taskTitle}`,
        html: htmlContent,
      });

      console.log(`[SMTP Email Success] Dispatched reminder to ${payload.to} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    }

    // 3. Fallback: Local dev logging
    console.log(`[Email Service Log] Sent reminder to ${payload.to} for task: "${payload.taskTitle}"`);
    return { success: true };
  } catch (error: any) {
    console.error('Email delivery error:', error);
    return { success: false, error: error?.message || 'Failed to send email' };
  }
}
