/* =========================================================
   DUA VERİLERİ
   -----------------------------------------------------------
   Her bölüm için "verses" dizisini kendi Türkçe okunuşu
   metniyle doldur. Her eleman bir ayet/satır olarak ekrana
   basılır. "counterTarget" belirtilen bölümlerde sayaç sayfası
   açıldığında hedef otomatik gösterilir (örn. Esmâ-i Hüsnâ -> 99).
   ========================================================= */

const DUAS = [
  {
    id: "vakia",
    name: "Vâkıa Sûresi",
    meta: "56 âyet",
    note: "Rızık bereketi için sabah okunması tavsiye edilir.",
    counterTarget: null,
    verses: [
      "[[Vâkıa Sûresi'nin Türkçe okunuşu buraya eklenecek. Metni gönderdiğinde bu diziye her satırı bir madde olacak şekilde ekleyeceğim.]]"
    ]
  },
  {
    id: "tekasur",
    name: "Tekâsür Sûresi",
    meta: "8 âyet",
    note: null,
    counterTarget: null,
    verses: [
      "[[Tekâsür Sûresi'nin Türkçe okunuşu buraya eklenecek.]]"
    ]
  },
  {
    id: "humeze",
    name: "Hümeze Sûresi",
    meta: "9 âyet",
    note: null,
    counterTarget: null,
    verses: [
      "[[Hümeze Sûresi'nin Türkçe okunuşu buraya eklenecek.]]"
    ]
  },
  {
    id: "duha",
    name: "Duhâ Sûresi",
    meta: "11 âyet",
    note: null,
    counterTarget: null,
    verses: [
      "[[Duhâ Sûresi'nin Türkçe okunuşu buraya eklenecek.]]"
    ]
  },
  {
    id: "amenerrasulu",
    name: "Âmenerrasûlü",
    meta: "Bakara Sûresi, son iki âyet",
    note: null,
    counterTarget: null,
    verses: [
      "[[Âmenerrasûlü duasının Türkçe okunuşu buraya eklenecek.]]"
    ]
  },
  {
    id: "bakara-elif-lam-mim",
    name: "Bakara Sûresi (Elif-Lâm-Mîm)",
    meta: "Bakara Sûresi başlangıcı",
    note: "Hangi âyet aralığını okuduğunu belirtirsen (örn. ilk 5 âyet) ona göre ekleyeceğim.",
    counterTarget: null,
    verses: [
      "[[Bakara Sûresi'nin (Elif-Lâm-Mîm) Türkçe okunuşu buraya eklenecek.]]"
    ]
  },
  {
    id: "esmaulhusna",
    name: "Esmâ-i Hüsnâ",
    meta: "Allah'ın 99 ismi",
    note: "Sayaç 99 hedefiyle açılır, isimleri tek tek sayarak okuyabilirsin.",
    counterTarget: 99,
    verses: [
      "[[Esmâ-i Hüsnâ listesi (99 isim, Türkçe okunuşuyla) buraya eklenecek.]]"
    ]
  }
];
