/* Troy Testing — kill-switch service worker.
   The previous site registered a caching SW (troy-v6). This replacement
   takes over on the browser's next update check, purges every cache, and
   unregisters itself so returning visitors load the fresh (design-refresh)
   site instead of stale cached files. New visitors never register a SW. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((c) => c.navigate(c.url));
    } catch (_) { /* best effort */ }
  })());
});
/* Never serve from cache — always hit the network. */
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => new Response('', { status: 504 })));
});
