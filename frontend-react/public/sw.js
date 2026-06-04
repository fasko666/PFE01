/* PANDA Service Worker — Web Push notifications.
 * Receives encrypted push payloads from the backend (sent via web-push lib)
 * and forwards them to the OS notification tray.
 */

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { title: 'PANDA', body: event.data?.text() || '' }; }

  const title = payload.title || 'PANDA';
  const options = {
    body:   payload.body || '',
    icon:   payload.icon || '/icon-192.png',
    badge:  '/badge.png',
    data:   payload.action_url ? { url: payload.action_url } : {},
    tag:    payload.tag || undefined,
    renotify: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes(url) && 'focus' in w) return w.focus();
      }
      return clients.openWindow(url);
    })
  );
});
