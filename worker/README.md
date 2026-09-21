# Eşitleme sunucusu (Cloudflare Worker)

Günlük Dualarım'ın "Bulut eşitleme" özelliği için küçük bir JSON depolama servisi.

- `PUT /v1/:kod` — gövdeyi (JSON, en fazla 256 KB) kaydeder
- `GET /v1/:kod` — kayıtlı JSON'u döndürür

`:kod` cihazda üretilen 20 karakterlik rastgele bir anahtardır; KV'de yalnızca SHA-256 özeti saklanır.
Konum bilgisi eşitlenmez.

## Yerelde deneme
```
cd worker && npx wrangler dev --local --port 8790
```
Uygulamayı denemek için sayfa açılmadan önce `window.SABAH_SYNC_URL = "http://localhost:8790"` tanımlanır.

## Yayınlama
```
cd worker && npx wrangler login && npx wrangler deploy
```
Çıkan `https://dua-sync.<hesap>.workers.dev` adresi `index.html` içindeki `SYNC_URL` değerine yazılır.
