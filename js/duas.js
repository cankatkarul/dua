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
    cycle: { length: 40 },
    verses: [
      "İzâ veka'atil vâkı'ah.",
      "Leyse livak'atihâ kâzibeh.",
      "Hâfıdatun râfi'ah.",
      "İzâ ruccetil ardu reccâ.",
      "Ve bussetil cibâlu bessâ.",
      "Fe kânet hebâen munbessâ.",
      "Ve kuntum ezvâcen selâseh.",
      "Fe ashâbul meymeneti mâ ashâbul meymeneh.",
      "Ve ashâbul meş'emeti mâ ashâbul meş'emeh.",
      "Ves sâbikûnes sâbikûn.",
      "Ulâikel mukarrabûn.",
      "Fî cennâtin na'îm.",
      "Sulletun minel evvelîn.",
      "Ve kalîlun minel âhırîn.",
      "Alâ sururin mevdûneh.",
      "Muttekîne aleyhâ mutekâbilîn.",
      "Yetûfu aleyhim vildânun muhalledûn.",
      "Bi ekvâbin ve ebârîka ve ke'sin min ma'în.",
      "Lâ yusadda'ûne anhâ ve lâ yunzifûn.",
      "Ve fâkihetin mimmâ yetehayyerûn.",
      "Ve lahmi tayrin mimmâ yeştehûn.",
      "Ve hûrun 'în.",
      "Ke emsâlil lu'luil meknûn.",
      "Cezâen bimâ kânû ya'melûn.",
      "Lâ yesme'ûne fîhâ lagven ve lâ te'sîmâ.",
      "İllâ kîlen selâmen selâmâ.",
      "Ve ashâbul yemîni mâ ashâbul yemîn.",
      "Fî sidrin mahdûd.",
      "Ve talhın mendûd.",
      "Ve zıllin memdûd.",
      "Ve mâin meskûb.",
      "Ve fâkihetin kesîreh.",
      "Lâ maktû'atin ve lâ memnû'ah.",
      "Ve furuşin merfû'ah.",
      "İnnâ enşe'nâhunne inşââ.",
      "Fe ce'alnâhunne ebkârâ.",
      "'Uruben etrâbâ.",
      "Li ashâbil yemîn.",
      "Sulletun minel evvelîn.",
      "Ve sulletun minel âhırîn.",
      "Ve ashâbuş şimâli mâ ashâbuş şimâl.",
      "Fî semûmin ve hamîm.",
      "Ve zıllin min yahmûm.",
      "Lâ bâridin ve lâ kerîm.",
      "İnnehum kânû kable zâlike mutrefîn.",
      "Ve kânû yusırrûne 'alel hınsil 'azîm.",
      "Ve kânû yekûlûne eizâ mitnâ ve kunnâ turâben ve 'ızâmen einnâ le meb'ûsûn.",
      "Eve âbâunel evvelûn.",
      "Kul innel evvelîne vel âhırîn.",
      "Le mecmû'ûne ilâ mîkâti yevmin ma'lûm.",
      "Summe innekum eyyuhed dâllûnel mukezzibûn.",
      "Le âkilûne min şecerin min zakkûm.",
      "Fe mâliûne minhel butûn.",
      "Fe şâribûne aleyhi minel hamîm.",
      "Fe şâribûne şurbel hîm.",
      "Hâzâ nuzuluhum yevmed dîn.",
      "Nahnu halaknâkum fe lev lâ tusaddikûn.",
      "E fe reeytum mâ tumnûn.",
      "E entum tahlukûnehû em nahnul hâlikûn.",
      "Nahnu kaddernâ beynekumul mevte ve mâ nahnu bi mesbûkîn.",
      "Alâ en nubeddile emsâlekum ve nunşiekum fî mâ lâ ta'lemûn.",
      "Ve lekad alimtumun neş'etel ûlâ fe lev lâ tezekkerûn.",
      "E fe reeytum mâ tahrusûn.",
      "E entum tezra'ûnehû em nahnuz zâri'ûn.",
      "Lev neşâu le ce'alnâhu hutâmen fe zaltum tefekkehûn.",
      "İnnâ le mugramûn.",
      "Bel nahnu mahrûmûn.",
      "E fe reeytumul mâellezî teşrebûn.",
      "E entum enzeltumûhu minel muzni em nahnul munzilûn.",
      "Lev neşâu ce'alnâhu ucâcen fe lev lâ teşkurûn.",
      "E fe reeytumun nârelletî tûrûn.",
      "E entum enşe'tum şeceretehâ em nahnul munşiûn.",
      "Nahnu ce'alnâhâ tezkireten ve metâ'an lil mukvîn.",
      "Fe sebbih bismi rabbikel 'azîm.",
      "Fe lâ uksimu bi mevâki'in nucûm.",
      "Ve innehû le kasemun lev ta'lemûne 'azîm.",
      "İnnehû le kur'ânun kerîm.",
      "Fî kitâbin meknûn.",
      "Lâ yemessuhû illel mutahharûn.",
      "Tenzîlun min rabbil 'âlemîn.",
      "E fe bi hâzel hadîsi entum mudhinûn.",
      "Ve tec'alûne rızkakum ennekum tukezzibûn.",
      "Fe lev lâ izâ belegatil hulkûm.",
      "Ve entum hîneizin tenzurûn.",
      "Ve nahnu akrebu ileyhi minkum ve lâkin lâ tubsırûn.",
      "Fe lev lâ in kuntum gayre medînîn.",
      "Terci'ûnehâ in kuntum sâdikîn.",
      "Fe emmâ in kâne minel mukarrabîn.",
      "Fe revhun ve reyhânun ve cennetu na'îm.",
      "Ve emmâ in kâne min ashâbil yemîn.",
      "Fe selâmun leke min ashâbil yemîn.",
      "Ve emmâ in kâne minel mukezzibîned dâllîn.",
      "Fe nuzulun min hamîm.",
      "Ve tasliyetu cahîm.",
      "İnne hâzâ le huvel hakkul yakîn.",
      "Fe sebbih bismi rabbikel 'azîm."
    ]
  },
  {
    id: "tekasur",
    name: "Tekâsür Sûresi",
    meta: "8 âyet",
    note: null,
    counterTarget: null,
    verses: [
      "Bismillâhirrahmânirrahîm",
      "Elhâkumut tekâsur.",
      "Hattâ zurtumul mekâbir.",
      "Kellâ sevfe ta'lemûn.",
      "Summe kellâ sevfe ta'lemûn.",
      "Kellâ lev ta'lemûne 'ılmel yakîn.",
      "Le teravunnel cahîm.",
      "Summe le teravunnehâ 'aynel yakîn.",
      "Summe le tus'elunne yevmeizin 'anin na'îm."
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
    id: "yasin",
    name: "Yâsîn Sûresi (Yâsîn-i Şerîf)",
    meta: "Her Perşembe akşamı",
    note: null,
    counterTarget: null,
    verses: [
      "[[Yâsîn Sûresi'nin Türkçe okunuşu buraya eklenecek.]]"
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
