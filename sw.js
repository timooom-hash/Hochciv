/* Offline-Cache. Bei Änderungen VERSION erhöhen. */
const VERSION = 'hochciv-v105';
const BUILD_HASH = '846677eecbd6';   // von tools_version.js
/* Was zwischengespeichert wird: die festen Dateien hier, die Skripte aus index.html – dort
   steht ihre Liste als <script>-Tags, und nur dort (v102). */
const STATIC = [
  './', './index.html', './css/style.css',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'
];
const scriptsOf = html => [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => './' + m[1]);
self.addEventListener('install', e => {
  e.waitUntil(fetch('./index.html', { cache: 'no-store' }).then(r => r.text())
    .then(html => caches.open(VERSION).then(c => c.addAll([...STATIC, ...scriptsOf(html)])))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html')))
  );
});
