const CACHE_NAME = "kronika-navykov-v6";
// Map tiles and place search change often and would bloat the cache.
const NETWORK_ONLY_HOSTS = [
  "tiles.openfreemap.org",
  "nominatim.openstreetmap.org",
];
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./images/ponozka.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (NETWORK_ONLY_HOSTS.includes(new URL(event.request.url).hostname)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    }),
  );
});
