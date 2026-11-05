const CACHE = 'glowup-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
// сначала сеть: правки появляются сразу; без интернета — из кэша
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const fresh = e.request.mode === 'navigate' || /\.(html|webmanifest)$|\/$/.test(new URL(e.request.url).pathname);
  e.respondWith(fetch(e.request, fresh ? {cache: 'no-store'} : {}).then(res => {
    if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
});
