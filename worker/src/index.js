/* Günlük Dualarım — eşitleme sunucusu
   PUT /v1/:kod  → gövdeyi (JSON) kaydeder
   GET /v1/:kod  → kayıtlı JSON'u döndürür
   Kod, cihazda üretilen uzun rastgele bir gizli anahtardır; KV'de yalnızca SHA-256 özeti tutulur. */

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
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
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

export default {
  async fetch(req, env) {
    const cors = corsHeaders(req.headers.get("Origin") || "");
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const m = new URL(req.url).pathname.match(/^\/v1\/([A-Za-z0-9]{20,64})$/);
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
};
