// TaskPad Background Daemon Scheduler Worker
// Polls for due reminders and dispatches Web Push, Email, and in-app notifications

import { processDueReminders } from '../src/lib/scheduler/engine';

async function startWorker() {
  console.log('====================================================');
  console.log('TaskPad Background Scheduler Worker Started');
  console.log('Frequency: 30 seconds poll interval');
  console.log('====================================================');

  const runSweep = async () => {
    try {
      const workerId = `worker_daemon_${process.pid}`;
      const result = await processDueReminders(workerId);
      if (result.processedCount > 0) {
        console.log(`[${new Date().toISOString()}] Processed ${result.processedCount} reminder(s): ${result.successCount} succeeded, ${result.failedCount} failed.`);
      }
    } catch (err) {
      console.error('[Scheduler Error]', err);
    }
  };

  // Run initial sweep
  await runSweep();

  // Run every 30 seconds
  setInterval(runSweep, 30000);
}

startWorker();
