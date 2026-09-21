/* Günlük Dualarım — sunucu
   Eşitleme:
     PUT /v1/:kod  → gövdeyi (JSON) kaydeder
     GET /v1/:kod  → kayıtlı JSON'u döndürür
     Kod, cihazda üretilen uzun rastgele bir gizli anahtardır; KV'de yalnızca SHA-256 özeti tutulur.
   Hatırlatma (Web Push):
     PUT    /push/v1  → { subscription, tz, reminders:[{id,time,days?}] } kaydeder
     DELETE /push/v1  → { endpoint } aboneliği siler
     Her dakika çalışan zamanlayıcı, vakti gelen hatırlatmalar için (gövdesiz) bir push gönderir;
     bildirimin metnini cihazdaki servis çalışanı hazırlar. */

const APP = "gunluk-dualarim";
const MAX_BYTES = 256 * 1024;
const ALLOWED_ORIGINS = [
  "https://dua.eskisehir.fit",
  "https://cankatkarul.github.io",
];

function corsHeaders(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

const json = (obj, status, cors) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}


// ---------- HATIRLATMA (Web Push) ----------
const SUBS_KEY = "push:subs";
const MAX_SUBS = 50, MAX_REMINDERS = 12, LATE_WINDOW_MIN = 10;

const b64uToBytes = (b64u) => Uint8Array.from(atob(b64u.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
const bytesToB64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function loadSubs(env) {
  const raw = await env.SYNC.get(SUBS_KEY);
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
const saveSubs = (env, subs) => env.SYNC.put(SUBS_KEY, JSON.stringify(subs));

function validSubscription(sub, env) {
  if (!sub || typeof sub.endpoint !== "string" || sub.endpoint.length > 600) return false;
  return sub.endpoint.startsWith("https://") || (env.ALLOW_RUN === "1" && sub.endpoint.startsWith("http://localhost")); // ikincisi yalnızca yerel deneme
}
function cleanReminders(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_REMINDERS).filter(r => r && typeof r.id === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.time)).map(r => ({
    id: r.id.slice(0, 40),
    time: r.time,
    days: Array.isArray(r.days) ? r.days.filter(d => Number.isInteger(d) && d >= 0 && d <= 6) : [],
  }));
}

// ES256 imzalı VAPID başlığı (push servisine kimliğimizi kanıtlar)
async function vapidHeader(endpoint, env) {
  const aud = new URL(endpoint).origin;
  const header = bytesToB64u(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = bytesToB64u(new TextEncoder().encode(JSON.stringify({
    aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT,
  })));
  const key = await crypto.subtle.importKey("jwk", JSON.parse(env.VAPID_PRIVATE_JWK), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(`${header}.${claims}`));
  return `vapid t=${header}.${claims}.${bytesToB64u(sig)}, k=${env.VAPID_PUBLIC}`;
}

async function sendPush(sub, env) {
  return fetch(sub.endpoint, {
    method: "POST",
    headers: { Authorization: await vapidHeader(sub.endpoint, env), TTL: "3600", Urgency: "normal", "Content-Length": "0" },
  });
}

// Belirli saat diliminde şu anki yerel tarih, dakika ve haftanın günü
function localNow(tz, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
  }).formatToParts(now).map(p => [p.type, p.value]));
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: (+parts.hour) * 60 + (+parts.minute), dow };
}

async function runReminders(env, now = new Date()) {
  const subs = await loadSubs(env);
  const keys = Object.keys(subs);
  if (!keys.length) return { sent: 0 };
  let changed = false, sent = 0;
  for (const k of keys) {
    const s = subs[k];
    let tz = s.tz;
    try { new Intl.DateTimeFormat("en", { timeZone: tz }); } catch { tz = "Europe/Istanbul"; }
    const ln = localNow(tz, now);
    for (const r of s.reminders || []) {
      if (r.days.length && !r.days.includes(ln.dow)) continue;
      const [h, m] = r.time.split(":").map(Number);
      const diff = ln.minutes - (h * 60 + m);
      if (diff < 0 || diff > LATE_WINDOW_MIN) continue;   // vakti gelmedi ya da çok geçti
      s.lastSent = s.lastSent || {};
      if (s.lastSent[r.id] === ln.date) continue;        // bugün zaten gönderildi
      const res = await sendPush(s.sub, env).catch(() => null);
      if (res && (res.status === 404 || res.status === 410)) { delete subs[k]; changed = true; break; } // abonelik ölmüş
      if (res && res.ok) { s.lastSent[r.id] = ln.date; changed = true; sent++; }
    }
  }
  if (changed) await saveSubs(env, subs);
  return { sent };
}

async function handlePush(req, env, cors) {
  if (req.method === "PUT") {
    const text = await req.text();
    if (text.length > 8 * 1024) return json({ error: "too_large" }, 413, cors);
    let body; try { body = JSON.parse(text); } catch { return json({ error: "bad_json" }, 400, cors); }
    if (!validSubscription(body.subscription, env)) return json({ error: "bad_subscription" }, 400, cors);
    const subs = await loadSubs(env);
    const id = await sha256Hex(body.subscription.endpoint);
    if (!subs[id] && Object.keys(subs).length >= MAX_SUBS) return json({ error: "limit" }, 429, cors);
    const reminders = cleanReminders(body.reminders);
    const prev = subs[id];
    subs[id] = {
      sub: { endpoint: body.subscription.endpoint },
      tz: typeof body.tz === "string" ? body.tz.slice(0, 60) : "Europe/Istanbul",
      reminders,
      lastSent: prev ? prev.lastSent || {} : {},
    };
    await saveSubs(env, subs);
    return json({ ok: true, count: reminders.length }, 200, cors);
  }
  if (req.method === "DELETE") {
    let body; try { body = JSON.parse(await req.text()); } catch { return json({ error: "bad_json" }, 400, cors); }
    if (!body || typeof body.endpoint !== "string") return json({ error: "bad_request" }, 400, cors);
    const subs = await loadSubs(env);
    delete subs[await sha256Hex(body.endpoint)];
    await saveSubs(env, subs);
    return json({ ok: true }, 200, cors);
  }
  return json({ error: "method_not_allowed" }, 405, cors);
}

export default {
  async fetch(req, env) {
    const cors = corsHeaders(req.headers.get("Origin") || "");
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const path = new URL(req.url).pathname;
    if (path === "/push/v1") return handlePush(req, env, cors);
    // Yerel denemede zamanlayıcıyı elle tetiklemek için (yalnızca dev)
    if (path === "/push/run" && env.ALLOW_RUN === "1") return json(await runReminders(env), 200, cors);

    const m = path.match(/^\/v1\/([A-Za-z0-9]{20,64})$/);
    if (!m) return json({ error: "not_found" }, 404, cors);
    const key = "s:" + await sha256Hex(m[1].toUpperCase());

    if (req.method === "GET") {
      const value = await env.SYNC.get(key);
      if (!value) return json({ error: "not_found" }, 404, cors);
      return new Response(value, { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (req.method === "PUT") {
      const text = await req.text();
      if (text.length > MAX_BYTES) return json({ error: "too_large" }, 413, cors);
      let body;
      try { body = JSON.parse(text); } catch { return json({ error: "bad_json" }, 400, cors); }
      if (!body || body.app !== APP || !Number.isFinite(body.updatedAt) || typeof body.data !== "object" || body.data === null) {
        return json({ error: "bad_payload" }, 400, cors);
      }
      await env.SYNC.put(key, JSON.stringify({ app: APP, version: 1, updatedAt: body.updatedAt, data: body.data }));
      return json({ ok: true, updatedAt: body.updatedAt }, 200, cors);
    }

    return json({ error: "method_not_allowed" }, 405, cors);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runReminders(env));
  },
};
