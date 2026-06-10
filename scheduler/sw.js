/*
 * Test Center Scheduler — service worker (stale-proof by design).
 *
 * The previous SW cached index.html cache-first, which served stale bundles
 * after every deploy (and precached '/', which is a DIFFERENT site at this
 * domain — the scheduler lives under /scheduler/). This one cannot go stale:
 *
 *   - Navigations (index.html): NETWORK-FIRST. Online users always get the
 *     current build; the cached copy is only an offline fallback.
 *   - /scheduler/assets/*: CACHE-FIRST. Vite content-hashes these filenames,
 *     so a cached entry can never be wrong — and GitHub Pages only sends
 *     max-age=600, so this is a real repeat-visit speedup.
 *   - Everything else same-origin: network, with quiet cache fallback.
 *
 * No cache-version bumping is required across deploys.
 */
const CACHE = 'scheduler-runtime-v3';

self.addEventListener('install', (event) => {
  // Warm the offline fallback only; assets fill in at runtime.
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Never intercept cross-origin (Supabase, fonts) or API traffic.
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('/api/')) return;

  // Navigations: network-first so deploys are picked up immediately.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); }
          return res;
        })
        .catch(() => caches.match('./'))
    );
    return;
  }

  // Content-hashed build assets: cache-first (immutable by construction).
  if (url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  // Other same-origin GETs (manifest, icons): network with cache fallback.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || new Response('Offline', { status: 503 })))
  );
});

// Push notifications (kept from the previous SW for future use).
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Test Center Scheduler', {
      body: data.body || 'New notification',
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || './' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
