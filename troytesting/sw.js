/* Troy Testing — service worker (offline shell + installable PWA).
   Bump CACHE whenever the ?v= asset version changes so clients refresh. */
const CACHE = 'troy-v3';

// Same-origin shell + the cross-origin runtime, so the app mounts with no network.
const SHELL = [
  './', './index.html', './styles.css?v=3',
  './components.jsx?v=3', './features.jsx?v=3', './pages.jsx?v=3', './home.jsx?v=3',
  './programs.jsx?v=3', './test-center.jsx?v=3', './contact.jsx?v=3', './app.jsx?v=3',
  './manifest.webmanifest', './icon.svg', './logo.jpg',
  './apple-touch-icon.png', './icon-192.png', './icon-512.png',
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // Don't let one failed cross-origin fetch abort the whole install.
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Cache-first for anything we have; otherwise network, runtime-caching successful GETs.
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const ok = res && (res.ok || res.type === 'opaque');
      if (ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => {
      // Offline navigation falls back to the cached app shell.
      if (req.mode === 'navigate') return caches.match('./index.html');
    }))
  );
});
