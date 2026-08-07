// Simple service worker for offline caching of the NZ Tech-for-Good directory.
// Caches visited pages so they work offline. Cache-first for assets, network-first for pages.

const CACHE = "nztfg-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Only cache same-origin requests
  if (url.origin !== self.location.origin) return;

  // Cache-first for static assets (CSS, JS, images)
  if (url.pathname.match(/\.(css|js|png|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then((r) => r || fetchAndCache(event.request))
    );
    return;
  }

  // Network-first for pages, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

async function fetchAndCache(request) {
  const response = await fetch(request);
  const cache = await caches.open(CACHE);
  cache.put(request, response.clone());
  return response;
}
