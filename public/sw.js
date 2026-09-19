// Service Worker Cleanup
// Automatically unregisters any legacy push notification workers
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        // Allow clients to continue browsing without legacy push worker
      });
    })
  );
});
