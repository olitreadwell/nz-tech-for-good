// Service worker for offline caching of the NZ Tech-for-Good directory.
// Pre-caches key pages, caches visited pages network-first, assets cache-first.

const CACHE = "nztfg-v2";
const OFFLINE_URL = "/nz-tech-for-good/";

const PRECACHE = [
  "/nz-tech-for-good/",
  "/nz-tech-for-good/directory/",
  "/nz-tech-for-good/get-involved/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
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
  if (url.origin !== self.location.origin) return;

  // Cache-first for static assets
  if (url.pathname.match(/\.(css|js|png|svg|ico|woff2?|xml)$/)) {
    event.respondWith(
      caches.match(event.request).then((r) => r || fetchAndCache(event.request))
    );
    return;
  }

  // Network-first for pages, fall back to cache, then offline page
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((r) => r || caches.match(OFFLINE_URL))
      )
  );
});

async function fetchAndCache(request) {
  const response = await fetch(request);
  const cache = await caches.open(CACHE);
  cache.put(request, response.clone());
  return response;
}
