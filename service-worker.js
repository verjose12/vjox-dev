const CACHE_NAME = "vjox-cache-v4.3.1";

const APP_FILES = [
  "./",
  "./index.html",
  "./viewer.html",
  "./manifest.json",
  "./css/index.css",
  "./css/viewer.css",
  "./js/index.js",
  "./js/viewer.js",
  "./js/storage.js",
  "./js/images.js",
  "./js/cloudinary.js",
  "./js/share.js",
  "./js/database.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put("./index.html", responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          return caches.match("./index.html");
        })
    );

    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});