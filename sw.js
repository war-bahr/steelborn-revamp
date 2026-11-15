/* Steelborn Revamp offline shell. Bump CACHE when shipping a new build. */
const CACHE = 'steelborn-revamp-v1';
const ASSETS = [
  "./",
  "./assets/fuma-C8WjmzpP.webp",
  "./assets/index-BJuqSA60.css",
  "./assets/index-BVsJbZId.js",
  "./assets/orbitron-latin-500-normal-BCCupJ8c.woff",
  "./assets/orbitron-latin-500-normal-DQ2gt4P1.woff2",
  "./assets/orbitron-latin-800-normal-CQafOXEd.woff2",
  "./assets/orbitron-latin-800-normal-P4cBi4I7.woff",
  "./assets/rajdhani-latin-500-normal-ByNUCHrt.woff2",
  "./assets/rajdhani-latin-500-normal-DfvNI-Td.woff",
  "./assets/rajdhani-latin-700-normal-BPDUZo87.woff2",
  "./assets/rajdhani-latin-700-normal-e0Uj8ZlN.woff",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest",
  "./portraits/p_aya.webp",
  "./portraits/p_aya_shout.webp",
  "./portraits/p_kaito.webp",
  "./portraits/p_kaito_shout.webp",
  "./portraits/p_rio.webp",
  "./portraits/p_rio_shout.webp",
  "./portraits/p_sora.webp",
  "./portraits/p_sora_shout.webp",
  "./portraits/rival.webp",
  "./portraits/rival_angry.webp",
  "./portraits/vex.webp"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of ASSETS) {
      try { await cache.add(url); } catch (e) { /* one miss must not fail the whole install */ }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    } catch (e) {
      const dest = event.request.destination;
      const nav = event.request.mode === 'navigate' || dest === 'document';
      // Never fall back to index.html for scripts/styles — that leaves the boot
      // screen up forever when a PWA update races or the network blips.
      if (nav) return (await caches.match('./index.html')) || Promise.reject(e);
      return Promise.reject(e);
    }
  })());
});
