/* Basic Firebase Messaging service worker placeholder to avoid 404 + HTML MIME error */
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
// Placeholder push handler (actual messaging integration can be added later)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.notification?.title || 'Notification';
  const options = {
    body: data.notification?.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});