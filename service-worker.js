/* WORDDAY 2.1.2 Repair · safe PWA update */
const CACHE_NAME = 'wordday-v2.1.2-free-test';
const CACHE_PREFIX = 'wordday-';
const APP_ENTRY = './index.html';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try { await cache.add(APP_ENTRY); } catch (error) { /* Keep install resilient if offline. */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate') {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        if (fresh && fresh.ok) {
          await cache.put(request, fresh.clone());
          await cache.put(APP_ENTRY, fresh.clone());
        }
        return fresh;
      } catch (error) {
        return (await cache.match(request)) || (await cache.match(APP_ENTRY)) || Response.error();
      }
    }
    try {
      const fresh = await fetch(request);
      if (fresh && fresh.ok) await cache.put(request, fresh.clone());
      return fresh;
    } catch (error) {
      return (await cache.match(request)) || Response.error();
    }
  })());
});
