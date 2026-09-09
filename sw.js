/* Bump CACHE whenever you upload a new version, otherwise phones keep the old one. */
const CACHE = 'prisma-v1';
const ASSETS = ['./','./index.html','./config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin.includes('supabase')) return;              // always live
  if (url.origin === location.origin) {                      // app files: cache first, refresh behind
    e.respondWith(caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.status === 200) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
  } else {                                                   // fonts and KaTeX: network, fall back to cache
    e.respondWith(fetch(e.request).then(res => {
      if (res && res.status === 200) { const cl = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); }
      return res;
    }).catch(() => caches.match(e.request)));
  }
});
