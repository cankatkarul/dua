/* =========================================================
   GÜNLÜK DUALARIM — Service Worker
   - İnternet yokken de açılır (sayfa ve görseller önbellekten gelir)
   - Sayfa "önce ağ": internet varken her açılışta en yeni sürüm gelir, yoksa önbellek kullanılır.
     Böylece güncellemeler hemen görünür ve eski sürümde takılı kalınmaz.
   - Görseller ve manifest "önbellek + arkadan yenile"
   - Yazı tipleri (Google Fonts) ilk yüklemeden sonra önbelleğe alınır
   - Bulut eşitleme istekleri (workers.dev) hiç önbelleğe alınmaz
   ========================================================= */

const CACHE = "gunluk-dualarim-v1";
const FONT_CACHE = "gunluk-dualarim-fonts-v1";
const META_CACHE = "gunluk-dualarim-meta"; // sayfanın yazdığı hatırlatma bilgileri (bildirim metni için)
const PAGE = "./index.html";
const ASSETS = [
  PAGE,
  "./manifest.json",
  "./assets/allah-lafza.png",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png"
];
const NETWORK_TIMEOUT_MS = 4000;

// Kurulum: temel dosyaları önbelleğe al
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Aktivasyon: eski sürümlerin önbelleklerini temizle
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== FONT_CACHE && k !== META_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(request, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

// Sayfa: önce ağ (zaman aşımı olur ya da çevrimdışıysa önbellek)
async function pageNetworkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
    if (res && res.ok) cache.put(PAGE, res.clone());
    return res;
  } catch {
    return (await cache.match(PAGE)) || Response.error();
  }
}

// Görseller vb.: önbellekten hemen ver, arkadan yenile
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request).then(res => {
    if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await refresh) || Response.error();
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Yazı tipleri
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }
  // Yalnızca kendi sitemizin dosyaları; diğer her şey (bulut eşitleme dahil) olduğu gibi geçer
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith(pageNetworkFirst(req));
    return;
  }
  e.respondWith(staleWhileRevalidate(req, CACHE));
});

// ---- Hatırlatma bildirimi (Web Push) ----
// Sunucu gövdesiz bir push gönderir; hangi hatırlatma olduğunu sayfanın önbelleğe yazdığı listeden buluruz.
async function readReminders() {
  try {
    const cache = await caches.open(META_CACHE);
    const res = await cache.match(new URL("__reminders.json", self.registration.scope).href);
    return res ? await res.json() : [];
  } catch { return []; }
}
function pickDue(list) {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  let best = null, bestDiff = 1e9;
  for (const r of list) {
    if (r.days && r.days.length && !r.days.includes(now.getDay())) continue;
    const [h, m] = r.time.split(":").map(Number);
    const diff = mins - (h * 60 + m);
    if (diff >= 0 && diff <= 30 && diff < bestDiff) { best = r; bestDiff = diff; }
  }
  return best;
}
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    const due = pickDue(await readReminders());
    await self.registration.showNotification(due ? due.label : "Günlük Dualarım", {
      body: due ? (due.programName ? `${due.programName} programını başlat` : "Dua vakti geldi.") : "Bir hatırlatman var.",
      icon: "assets/icon-192.png",
      badge: "assets/icon-192.png",
      tag: due ? "rem-" + due.id : "rem",
      data: { program: due ? due.program : "" },
    });
  })());
});

// Bildirime dokununca uygulamayı aç (program bağlıysa başlat)
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const pid = (e.notification.data && e.notification.data.program) || "";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      if (list.length) {
        if (pid) list[0].postMessage({ type: "start-program", id: pid });
        return list[0].focus();
      }
      return clients.openWindow(pid ? "./index.html#p=" + encodeURIComponent(pid) : "./index.html");
    })
  );
});
