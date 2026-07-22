/* =========================================================
   SABAH VİRDİ — Service Worker
   - Tüm dosyaları önbelleğe alır (offline çalışır)
   - Yâsîn Perşembe bildirimi için arka plan desteği
   ========================================================= */

const CACHE = "sabah-virdi-v1";
const ASSETS = [
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/duas.js",
  "./manifest.json",
  "./assets/allah-lafza.png"
];

// Kurulum: tüm dosyaları önbelleğe al
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Aktivasyon: eski önbellekleri temizle
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: önce önbellekten, yoksa ağdan
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Bildirim tıklandığında uygulamayı aç
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow("./index.html");
    })
  );
});
