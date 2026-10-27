const CACHE = "ks-v7";
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/kids-station/"]))));
self.addEventListener("fetch", e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));
