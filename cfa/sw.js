
// cfa-sw.js — very small cache-first service worker
const CACHE = 'cfa-l1-guide-v8-notability';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './annotate.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
// Network-first for the top-level HTML so users always get the latest build
// once the SW update cycle has fetched a new sw.js. Falls back to cache offline.
// Cache-first for everything else (manifest, etc.) for speed.
function isNavOrIndex(req) {
  if (req.mode === 'navigate') return true;
  const url = new URL(req.url);
  return url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (isNavOrIndex(req)) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.ok && req.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone)).catch(()=>{});
        }
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok && req.url.startsWith(self.location.origin)) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone)).catch(()=>{});
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
