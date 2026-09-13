# Sabah Virdi

Sabah rutini olarak okunan duaların Türkçe okunuşlarını içeren, mobil uyumlu, koyu/açık temalı bir web uygulaması. Tesbih (sayaç) özelliği ile tekrarlı okunan bölümler sayılabilir.

## İçindekiler
1. Vâkıa Sûresi
2. Tekâsür Sûresi
3. Hümeze Sûresi
4. Duhâ Sûresi
5. Âmenerrasûlü
6. Bakara Sûresi (Elif-Lâm-Mîm)
7. Yâsîn Sûresi
8. Alak Sûresi
9. Esmâ-i Hüsnâ
10. Âyetel Kursî
11. Fâtiha Sûresi
12. İhlâs Sûresi
13. Felak Sûresi
14. Nâs Sûresi

## Proje yapısı
```
sabah-virdi/
├── index.html      # Uygulamanın tamamı: stil, dua verileri ve uygulama mantığı tek dosyada
├── sw.js           # Service worker (offline önbellekleme, bildirim)
├── manifest.json   # PWA manifesti
└── assets/         # Görseller
```
Not: `index.html` kendi kendine yeterlidir; harici bir CSS/JS dosyası yüklemez. Bu yüzden görünüm, dua verisi (`DUAS`/`TESBIHAT` dizileri) ve uygulama mantığının tamamı bu dosyanın içindeki `<style>` ve `<script>` bloklarında yer alır.

## Dua metinlerini ekleme
`index.html` dosyasını aç, içindeki `const DUAS = [ ... ]` dizisini bul. Her bölümün `verses` dizisi şu an yer tutucu metin içeriyor:

```js
verses: [
  "[[Vâkıa Sûresi'nin Türkçe okunuşu buraya eklenecek.]]"
]
```

Bunu, her satır/âyet ayrı bir dizi elemanı olacak şekilde değiştir:

```js
verses: [
  "Elmâ yekû lehû sâhıbetuv velâ veled...",
  "Ve enne...",
  "..."
]
```

Kaydettiğinde sayfa otomatik olarak numaralandırıp gösterecek.

## Yerelde önizleme
Tarayıcıda doğrudan `index.html` dosyasını açman yeterli (internet bağlantısı ya da kurulum gerekmez).

## GitHub'a yükleme
```bash
cd sabah-virdi
git init
git add .
git commit -m "Sabah virdi uygulaması"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/REPO_ADIN.git
git push -u origin main
```

## GitHub Pages ile yayınlama (ücretsiz)
1. GitHub'da repo sayfasında **Settings → Pages** yolunu izle.
2. **Branch: main / (root)** seçip kaydet.
3. Birkaç dakika içinde `https://KULLANICI_ADIN.github.io/REPO_ADIN/` adresinden erişilebilir olur — telefonuna "Ana Ekrana Ekle" yaparak uygulama gibi kullanabilirsin.

## Özellikler
- Koyu Mod (varsayılan) / Açık Mod
- 4 kademeli yazı boyutu (ayarlar sayfasından)
- Her bölüm için tesbih sayaç (Esmâ-i Hüsnâ'da otomatik 99 hedefli)
- Günlük tamamlama takibi (bir bölümü açtığında işaretlenir, ertesi sabah sıfırlanır)
- Ayarlar ve tercihler tarayıcıda saklanır (localStorage), sunucu/internet gerekmez
