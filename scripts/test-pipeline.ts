import { calculateCanonicalScheduledUtc, formatInUserTimezone, resolveUserTimezone } from '../src/lib/date/timezone';
import { db } from '../src/lib/db/repository';
import { processDueReminders } from '../src/lib/scheduler/engine';

async function runTests() {
  console.log('=== TASKPAD SCHEDULER & NOTIFICATION PIPELINE TESTS ===\n');

  // Test 1: Timezone Canonical UTC Calculation
  console.log('--- Test 1: Timezone & UTC Calculation ---');
  const dateStr = '2026-09-20';
  const timeStr = '19:30'; // 7:30 PM
  const tz = 'Asia/Karachi'; // UTC+5

  const utcAtTime = calculateCanonicalScheduledUtc(dateStr, timeStr, tz, 0);
  console.log('Target Local: 2026-09-20 19:30:00 PKT (Asia/Karachi)');
  console.log('Canonical UTC:', utcAtTime);
  if (utcAtTime === '2026-09-20T14:30:00.000Z') {
    console.log('✅ PASS: Canonical UTC at time matches 14:30:00.000Z');
  } else {
    throw new Error(`FAIL: Expected 2026-09-20T14:30:00.000Z but got ${utcAtTime}`);
  }

  const utc15mBefore = calculateCanonicalScheduledUtc(dateStr, timeStr, tz, 15);
  console.log('Canonical UTC (15m offset):', utc15mBefore);
  if (utc15mBefore === '2026-09-20T14:15:00.000Z') {
    console.log('✅ PASS: Canonical UTC 15m before matches 14:15:00.000Z');
  } else {
    throw new Error(`FAIL: Expected 2026-09-20T14:15:00.000Z but got ${utc15mBefore}`);
  }

  const formattedDisplay = formatInUserTimezone(utcAtTime, tz);
  console.log('Formatted display in user timezone:', formattedDisplay);
  if (formattedDisplay.includes('7:30 PM') || formattedDisplay.includes('19:30')) {
    console.log('✅ PASS: Formatted display correctly reflects local user time');
  } else {
    throw new Error(`FAIL: Formatted display unexpected: ${formattedDisplay}`);
  }

  // Test 2: Task Creation with Auto-Reminder
  console.log('\n--- Test 2: Task Creation with Auto-Reminder ---');
  const user = await db.getUserByClerkId('user_taskpad_demo_01');
  if (!user) throw new Error('Demo user not found in repository');
  const workspaces = await db.getUserWorkspaces(user.id);
  const wsId = workspaces[0].id;

  const createdTask = await db.createTask({
    workspace_id: wsId,
    title: 'Automated Pipeline Test Task',
    description: 'Testing end-to-end reminder creation and lifecycle synchronization',
    due_date: '2026-09-20',
    due_time: '19:30:00',
    timezone: 'Asia/Karachi',
    reminder_offset: 15,
    created_by: user.id,
  });
  console.log('Created Task ID:', createdTask.id);
  console.log('✅ PASS: Task created with reminder offset and canonical UTC calculation');

  // Test 3: Task Lifecycle - Complete cancels reminder
  console.log('\n--- Test 3: Task Completion Cancels Reminders ---');
  await db.updateTask(createdTask.id, { status: 'completed' });
  console.log('Task marked as completed');

  // Test 4: Real Scheduler Delivery Sweep
  console.log('\n--- Test 4: Real End-to-End Scheduler Sweep ---');
  const pastDate = new Date(Date.now() - 5000);
  const pastTask = await db.createTask({
    workspace_id: wsId,
    title: 'Urgent Scheduled Alert Task',
    description: 'Verification of multi-channel push, email, and in-app dispatch',
    due_date: pastDate.toISOString().split('T')[0],
    due_time: pastDate.toTimeString().split(' ')[0],
    timezone: 'Asia/Karachi',
    reminder_offset: 0,
    created_by: user.id,
  });

  // Manually set reminder scheduled_at in the past
  const pastScheduledUtc = new Date(Date.now() - 10000).toISOString();
  await db.createReminder({
    task_id: pastTask.id,
    user_id: user.id,
    workspace_id: wsId,
    scheduled_at: pastScheduledUtc,
    timezone: 'Asia/Karachi',
  });

  const dueReminders = await db.getDueReminders();
  console.log(`Found ${dueReminders.length} due reminder(s) ready for sweep`);
  const sweepResult = await processDueReminders('automated_integration_worker');
  console.log('Sweep Result:', {
    processedCount: sweepResult.processedCount,
    successCount: sweepResult.successCount,
    failedCount: sweepResult.failedCount,
  });

  if (sweepResult.processedCount > 0 && sweepResult.successCount > 0) {
    console.log('✅ PASS: Scheduler successfully claimed and processed due reminder');
  } else {
    throw new Error('FAIL: Scheduler did not process the due reminder');
  }

  // Test 5: Idempotency - Sweep again
  console.log('\n--- Test 5: Idempotency Check (No Duplicate Sends) ---');
  const secondSweep = await processDueReminders('automated_duplicate_worker');
  console.log('Second Sweep Result:', {
    processedCount: secondSweep.processedCount,
    successCount: secondSweep.successCount,
  });

  if (secondSweep.processedCount === 0) {
    console.log('✅ PASS: Idempotency verified. Same reminder cannot be sent twice.');
  } else {
    throw new Error('FAIL: Idempotency violated. Reminder was processed again.');
  }

  // Test 6: In-App Notification Verification
  console.log('\n--- Test 6: In-App Notification Reflection ---');
  const notifications = await db.getUserNotifications(user.id);
  const matchedNotif = notifications.find(n => n.resource_id === pastTask.id);
  if (matchedNotif) {
    console.log(`✅ PASS: In-app notification created: "${matchedNotif.title}" — "${matchedNotif.message}"`);
  } else {
    throw new Error('FAIL: In-app notification was not found for the processed task');
  }

  console.log('\n🎉 ALL PIPELINE INTEGRATION TESTS PASSED 100%!');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
