// TaskPad Production Service Worker: Native Web Push & PWA Lifecycle
const CACHE_VERSION = 'taskpad-v2026.09.18';

self.addEventListener('install', (event) => {
  // Force active immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Handle incoming Web Push notifications from Supabase Cron / Edge Function
 * Operates reliably whether browser tab is open, minimized, or closed.
 */
self.addEventListener('push', (event) => {
  let data = {
    title: 'TaskPad Reminder',
    taskTitle: 'Scheduled Task',
    body: 'You have a scheduled task reminder.',
    reminderTime: '',
    taskId: '',
    url: '/dashboard',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (err) {
    console.warn('[SW] Could not parse push payload as JSON:', err);
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const taskTitle = data.taskTitle || data.title || 'Scheduled Task';
  const displayTitle = data.title ? data.title : `TaskPad: ${taskTitle}`;
  const reminderTimeText = data.reminderTime ? ` • ${data.reminderTime}` : '';
  const displayBody = data.body || `${taskTitle}${reminderTimeText} — Due now.`;

  const targetUrl = data.taskId
    ? `/tasks?id=${data.taskId}`
    : data.url || '/dashboard';

  const options = {
    body: displayBody,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [150, 50, 150, 50, 200],
    tag: data.taskId ? `taskpad-task-${data.taskId}` : 'taskpad-reminder',
    renotify: true,
    requireInteraction: true,
    data: {
      taskId: data.taskId,
      taskTitle: taskTitle,
      reminderTime: data.reminderTime,
      url: targetUrl,
      timestamp: Date.now(),
    },
    actions: [
      { action: 'view', title: 'Open Task' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(displayTitle, options)
  );
});

/**
 * Handle Notification Click:
 * Opens or focuses the corresponding task in TaskPad
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || (notificationData.taskId ? `/tasks?id=${notificationData.taskId}` : '/dashboard');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. If an existing window is open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // 2. Otherwise open a new standalone window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
