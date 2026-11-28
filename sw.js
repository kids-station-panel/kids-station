const CACHE = "ks-v109";
self.addEventListener("install", e => {
  // Sadece HTML'i önbelleğe al — JS her zaman ağdan gelecek (cache sorunlarını önler)
  e.waitUntil(caches.open(CACHE).then(c => c.add("/")).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // JS dosyaları her zaman ağdan yükle (asla eski cache sunma)
  if (url.pathname.endsWith('.js')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // SPA routing: sayfa navigasyonlarında cache'deki HTML'i sun
  if (e.request.mode === "navigate") {
    e.respondWith(caches.match("/").then(r => r || fetch(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// Push bildirimi al (arka planda uygulama kapalıyken)
self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || "Kids Station";
  const opts = {
    body: data.body || "Yeni bildirim",
    icon: "/logo.jpg",
    badge: "/logo.jpg",
    vibrate: [200, 100, 200],
    data: data,
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

// Bildirime tıklandığında uygulamayı aç
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const client of list) {
      if (client.url.includes(self.location.origin)) {
        client.focus();
        return;
      }
    }
    clients.openWindow(self.location.origin + "/?panel=1");
  }));
});
