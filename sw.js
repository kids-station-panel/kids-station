const CACHE = "ks-v101";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/", "/app.min.js?v=101"])));
  self.skipWaiting(); // Hemen devral, bekleme
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim()) // Açık sekmeleri hemen ele geç
  );
});
self.addEventListener("fetch", e => {
  // SPA routing: tüm sayfa navigasyonlarında cache'deki index'i sun
  // (GitHub Pages 404 flash'ı önler, /basvuru gibi doğrudan URL'ler çalışır)
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
