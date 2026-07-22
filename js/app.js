(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const body = document.body;

  const els = {
    home: $("#home"),
    reader: $("#reader"),
    duaList: $("#duaList"),
    readerTitle: $("#readerTitle"),
    readerSubtitle: $("#readerSubtitle"),

    backBtn: $("#backBtn"),
    openSettings: $("#openSettings"),
    readerSettingsBtn: $("#readerSettingsBtn"),
    settingsBackdrop: $("#settingsBackdrop"),
    settingsSheet: $("#settingsSheet"),
    settingsClose: $("#settingsClose"),
    themeSegmented: $("#themeSegmented"),
    fontSegmented: $("#fontSegmented"),
    counterFab: $("#counterFab"),
    counterFabNum: $("#counterFabNum"),
    homeCounterFab: $("#homeCounterFab"),
    homeCounterFabNum: $("#homeCounterFabNum"),
    slideMode: $("#slideMode"),
    slideVerse: $("#slideVerse"),
    slideMeta: $("#slideMeta"),
    slideTapZone: $("#slideTapZone"),
    slidePrev: $("#slidePrev"),
    slideNext: $("#slideNext"),
    slideExit: $("#slideExit"),
    slideToggleFab: $("#slideToggleFab"),

    counterBackdrop: $("#counterBackdrop"),
    counterSheet: $("#counterSheet"),
    counterTarget: $("#counterTarget"),
    tasbihDial: $("#tasbihDial"),
    tasbihCount: $("#tasbihCount"),
    tasbihRingProgress: $("#tasbihRingProgress"),
    tasbihReset: $("#tasbihReset"),
    tasbihClose: $("#tasbihClose"),
    stats: $("#stats"),
    statsBody: $("#statsBody"),
    statsBackBtn: $("#statsBackBtn"),
    streakBadge: $("#streakBadge"),
  };

  const STORE_KEY = "sabahVirdi:v1";
  const RING_CIRCUMFERENCE = 2 * Math.PI * 88; // matches r=88 in svg

  const todayKey = () => new Date().toISOString().slice(0, 10);

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) throw new Error("empty");
      return JSON.parse(raw);
    } catch {
      return { theme: "dark", fontSize: "medium", doneDate: todayKey(), done: {}, counters: {}, cycles: {} };
    }
  }
  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  }

  const state = loadStore();
  if (!state.cycles) state.cycles = {};
  // Reset daily completion checkmarks on a new day
  if (state.doneDate !== todayKey()) {
    state.doneDate = todayKey();
    state.done = {};
  }

  let currentDuaId = null;

  // ---------- THEME ----------
  function applyTheme(theme) {
    state.theme = theme;
    body.classList.toggle("theme-dark", theme === "dark");
    body.classList.toggle("theme-light", theme === "light");
    els.themeSegmented.querySelectorAll("button").forEach(b =>
      b.classList.toggle("active", b.dataset.theme === theme));
    saveStore();
  }

  // ---------- FONT SIZE ----------
  function applyFontSize(size) {
    state.fontSize = size;
    body.dataset.fontSize = size;
    els.fontSegmented.querySelectorAll("button").forEach(b =>
      b.classList.toggle("active", b.dataset.size === size));
    saveStore();
  }

  // ---------- SEKMELER ----------
  let activeTab = "dualar";

  function renderTabBar() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === activeTab);
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    renderTabBar();
    renderHome();
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // ---------- HOME LIST ----------
  function renderStreakBadge() {
    const el = document.getElementById("streakBadge");
    if (!el) return;
    const streak = state.streak || 0;
    const doneCount = DUAS.filter(d => state.done[d.id]).length;
    el.textContent = streak > 0
      ? `🔥 ${streak} günlük seri · ${doneCount}/${DUAS.length} okundu`
      : `${doneCount}/${DUAS.length} okundu`;
  }

  function renderHome() {
    els.duaList.innerHTML = "";
    if (activeTab === "dualar") {
      DUAS.forEach((dua, i) => {
        const done = !!state.done[dua.id];
        const card = document.createElement("button");
        card.className = "dua-card" + (done ? " is-done" : "");
        card.innerHTML = `
          <span class="dua-index">${i + 1}</span>
          <span class="dua-info">
            <p class="dua-name">${dua.name}</p>
            <p class="dua-meta">${dua.meta} ${renderCycleBadgeHtml(dua)}</p>
          </span>
          <span class="dua-done">✓</span>
          <span class="dua-chevron">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>`;
        card.addEventListener("click", () => openReader(dua.id, DUAS));
        els.duaList.appendChild(card);
      });
    } else {
      TESBIHAT.forEach((t, i) => {
        const card = document.createElement("button");
        card.className = "dua-card tesbihat-card";
        card.innerHTML = `
          <span class="dua-index">${i + 1}</span>
          <span class="dua-info">
            <p class="dua-name">${t.name}</p>
            <p class="dua-meta">${t.meta}</p>
          </span>
          <span class="dua-chevron">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>`;
        card.addEventListener("click", () => openReader(t.id, TESBIHAT));
        els.duaList.appendChild(card);
      });
    }
  }

  // ---------- CYCLE (örn. 40 günlük Vâkıa okuma çevrimi) ----------
  function getCycle(id) {
    return state.cycles[id] || { day: 1, lastDate: null };
  }
  function markCycleDay(id, length) {
    const cyc = getCycle(id);
    if (cyc.lastDate === todayKey()) return false; // bugün zaten işaretlendi
    const nextDay = (cyc.day % length) + 1;
    state.cycles[id] = { day: nextDay, lastDate: todayKey() };
    saveStore();
    return true;
  }
  function renderCycleBadgeHtml(dua) {
    if (!dua.cycle) return "";
    const cyc = getCycle(dua.id);
    return `<span class="dua-cycle-badge">Gün ${cyc.day}/${dua.cycle.length}</span>`;
  }
  function renderCycleBanner(dua) {
    const el = document.getElementById("cycleBanner");
    if (!el) return;
    const cyc = getCycle(dua.id);
    const doneToday = cyc.lastDate === todayKey();
    el.innerHTML = `
      <div class="cycle-banner-row">
        <span class="cycle-banner-label">${dua.cycle.length} günlük çevrim</span>
        <span class="cycle-banner-day">Gün ${cyc.day} / ${dua.cycle.length}</span>
      </div>
      <button class="ghost-btn cycle-advance-btn" ${doneToday ? "disabled" : ""}>
        ${doneToday ? "Bugün işaretlendi ✓" : `Bugünü tamamladım → Gün ${(cyc.day % dua.cycle.length) + 1}'e geç`}
      </button>`;
    const btn = el.querySelector(".cycle-advance-btn");
    if (btn && !doneToday) {
      btn.addEventListener("click", () => {
        markCycleDay(dua.id, dua.cycle.length);
        renderCycleBanner(dua);
      });
    }
  }


  function openReader(id, list) {
    list = list || DUAS;
    currentDuaList = list;
    const dua = list.find(d => d.id === id);
    if (!dua) return;
    currentDuaId = id;
    isSlideModeActive = false;
    els.slideMode.hidden = true;
    document.getElementById("readerBody").hidden = false;
    els.slideToggleFab.classList.remove("active");

    els.readerTitle.textContent = dua.name;
    els.readerSubtitle.textContent = dua.meta;

    let bodyHtml = "";
    if (dua.cycle) {
      bodyHtml += `<div class="cycle-banner" id="cycleBanner"></div>`;
    }
    if (dua.note) {
      bodyHtml += `<div class="reader-note">${dua.note}</div>`;
    }
    const isPlaceholder = dua.verses.length === 1 && dua.verses[0].startsWith("[[");
    if (isPlaceholder) {
      bodyHtml += `<div class="placeholder-note">${dua.verses[0].replace(/\[\[|\]\]/g, "")}</div>`;
    } else {
      bodyHtml += `<div class="dua-text">` +
        dua.verses.map((v, i) => `<span class="verse"><span class="verse-num">${i + 1}</span>${v}</span>`).join("") +
        `</div>`;
    }
    els.readerBody.innerHTML = bodyHtml;
    if (dua.cycle) renderCycleBanner(dua);

    // Animasyonlu geçiş: home → reader
    els.home.classList.add("screen-exit");
    setTimeout(() => {
      els.home.hidden = true;
      els.home.classList.remove("screen-exit");
      els.reader.hidden = false;
      els.reader.classList.add("screen-enter");
      requestAnimationFrame(() => {
        els.reader.classList.add("screen-enter-active");
        setTimeout(() => els.reader.classList.remove("screen-enter", "screen-enter-active"), 350);
      });
    }, 200);
    window.scrollTo(0, 0);
    updateCounterFab();
    updateDoneBtn(dua.id);
    // Son okunan yeri vurgula
    if (!state.positions) state.positions = {};
    const lastPos = state.positions[id];
    if (lastPos && lastPos > 0) {
      requestAnimationFrame(() => {
        const verseEls = document.getElementById("readerBody").querySelectorAll(".verse");
        if (verseEls[lastPos]) {
          verseEls[lastPos].scrollIntoView({ behavior: "smooth", block: "center" });
          verseEls[lastPos].classList.add("verse-highlight");
          setTimeout(() => verseEls[lastPos].classList.remove("verse-highlight"), 1800);
        }
      });
    }
  }

  function updateDoneBtn(id) {
    const btn = document.getElementById("doneFab");
    if (!btn) return;
    const done = !!state.done[id];
    btn.classList.toggle("is-done", done);
    btn.title = done ? "Okundu işareti kaldır" : "Okundu olarak işaretle";
  }

  function toggleDone(id) {
    state.done[id] = !state.done[id];
    saveStore();
    updateDoneBtn(id);
    // streak güncelle
    updateStreak();
  }

  function updateStreak() {
    const allDone = DUAS.every(d => state.done[d.id]);
    const today = todayKey();
    // Günlük geçmişe ekle (haftalık/aylık özet için)
    if (!state.history) state.history = {};
    if (allDone) {
      state.history[today] = true;
      if (state.lastStreakDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        if (state.lastStreakDate === yKey) {
          state.streak = (state.streak || 0) + 1;
        } else {
          state.streak = 1;
        }
        state.lastStreakDate = today;
      }
    } else {
      // Tamamlanmadıysa bugünü geçmişten sil
      if (state.history[today] && !allDone) delete state.history[today];
    }
    saveStore();
  }

  // ---------- SON OKUNAN YER ----------
  function saveReadPosition(id, index) {
    if (!state.positions) state.positions = {};
    state.positions[id] = index;
    saveStore();
  }
  function getReadPosition(id) {
    return (state.positions && state.positions[id]) || 0;
  }

  // ---------- SLAYТ MODU ----------
  let slideVerses = [];
  let slideIndex = 0;
  let isSlideModeActive = false;
  let currentDuaList = DUAS;

  function enterSlideMode(verses, startIndex) {
    slideVerses = verses;
    slideIndex = startIndex;
    isSlideModeActive = true;
    document.getElementById("readerBody").hidden = true;
    els.slideMode.hidden = false;
    els.slideToggleFab.classList.add("active");
    renderSlide();
  }

  function exitSlideMode() {
    isSlideModeActive = false;
    document.getElementById("readerBody").hidden = false;
    els.slideMode.hidden = true;
    els.slideToggleFab.classList.remove("active");
    // Kaldığı yeri kaydet
    saveReadPosition(currentDuaId, slideIndex);
    // Normal okumada o âyete kaydır
    const verseEls = document.getElementById("readerBody").querySelectorAll(".verse");
    if (verseEls[slideIndex]) {
      verseEls[slideIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function renderSlide() {
    const verse = slideVerses[slideIndex] || "";
    els.slideVerse.textContent = verse;
    els.slideMeta.textContent = `${slideIndex + 1} / ${slideVerses.length}`;
    els.slidePrev.disabled = slideIndex === 0;
    els.slideNext.disabled = slideIndex === slideVerses.length - 1;
    // Kaydet
    saveReadPosition(currentDuaId, slideIndex);
    // Titreşim
    if (navigator.vibrate) navigator.vibrate(6);
  }

  function slideGoNext() {
    if (slideIndex < slideVerses.length - 1) { slideIndex++; renderSlide(); }
  }
  function slideGoPrev() {
    if (slideIndex > 0) { slideIndex--; renderSlide(); }
  }

  // Slayt olayları
  els.slideTapZone.addEventListener("click", slideGoNext);
  els.slideNext.addEventListener("click", slideGoNext);
  els.slidePrev.addEventListener("click", slideGoPrev);
  els.slideExit.addEventListener("click", exitSlideMode);

  // Slayt toggle fab
  els.slideToggleFab.addEventListener("click", () => {
    if (isSlideModeActive) {
      exitSlideMode();
    } else {
      const list = currentDuaList;
      const dua = list.find(d => d.id === currentDuaId);
      if (!dua) return;
      const startIndex = getReadPosition(currentDuaId);
      enterSlideMode(dua.verses, startIndex);
    }
  });

  // Kaydırma (swipe) desteği
  let touchStartX = 0;
  els.slideMode.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  els.slideMode.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? slideGoNext() : slideGoPrev(); }
  });

  function closeReader() {
    // Slayt modundan çık
    if (isSlideModeActive) exitSlideMode();
    // Animasyonlu geçiş: reader → home
    els.reader.classList.add("screen-exit");
    setTimeout(() => {
      els.reader.hidden = true;
      els.reader.classList.remove("screen-exit");
      els.home.hidden = false;
      els.home.classList.add("screen-enter");
      requestAnimationFrame(() => {
        els.home.classList.add("screen-enter-active");
        setTimeout(() => els.home.classList.remove("screen-enter", "screen-enter-active"), 350);
      });
      renderHome();
      renderStreakBadge();
    }, 200);
  }

  // ---------- SETTINGS SHEET ----------
  function openSheet(backdrop, sheet) { backdrop.hidden = false; sheet.hidden = false; }
  function closeSheet(backdrop, sheet) { backdrop.hidden = true; sheet.hidden = true; }

  // ---------- TASBİH COUNTER ----------
  function getCount(id) { return state.counters[id] || 0; }
  function setCount(id, val) {
    state.counters[id] = Math.max(0, val);
    saveStore();
  }
  const HOME_COUNTER_ID = "home-zikirmatik";

  function updateCounterFab() {
    els.counterFabNum.textContent = String(getCount(currentDuaId));
  }
  function updateHomeCounterFab() {
    els.homeCounterFabNum.textContent = String(getCount(HOME_COUNTER_ID));
  }
  function openCounterFor(id) {
    currentDuaId = id;
    renderCounterSheet();
    openSheet(els.counterBackdrop, els.counterSheet);
  }
  function isTesbihat(id) {
    return TESBIHAT.some(t => t.id === id);
  }
  function renderCounterSheet() {
    const list = isTesbihat(currentDuaId) ? TESBIHAT : DUAS;
    const item = list.find(d => d.id === currentDuaId);
    const count = getCount(currentDuaId);
    els.tasbihCount.textContent = String(count);
    // Tesbihat ise halka rengi yeşil, dua ise amber
    els.tasbihRingProgress.style.stroke = isTesbihat(currentDuaId) ? "#4ade80" : "var(--accent)";
    els.tasbihCount.style.color = isTesbihat(currentDuaId) ? "#4ade80" : "var(--text-primary)";
    if (item && item.counterTarget) {
      els.counterTarget.textContent = `Hedef: ${item.counterTarget}`;
      const ratio = Math.min(count / item.counterTarget, 1);
      els.tasbihRingProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
    } else {
      els.counterTarget.textContent = isTesbihat(currentDuaId) ? "Serbest tesbihat" : "Serbest sayaç";
      const ratio = (count % 33) / 33;
      els.tasbihRingProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
    }
  }
  function incrementCounter() {
    setCount(currentDuaId, getCount(currentDuaId) + 1);
    renderCounterSheet();
    updateCounterFab();
    updateHomeCounterFab();
    if (navigator.vibrate) navigator.vibrate(8);
  }

  // ---------- EVENTS ----------
  els.backBtn.addEventListener("click", closeReader);
  els.openSettings.addEventListener("click", () => openSheet(els.settingsBackdrop, els.settingsSheet));
  els.readerSettingsBtn.addEventListener("click", () => openSheet(els.settingsBackdrop, els.settingsSheet));
  els.settingsClose.addEventListener("click", () => closeSheet(els.settingsBackdrop, els.settingsSheet));
  els.settingsBackdrop.addEventListener("click", () => closeSheet(els.settingsBackdrop, els.settingsSheet));

  els.themeSegmented.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-theme]");
    if (btn) applyTheme(btn.dataset.theme);
  });
  els.fontSegmented.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-size]");
    if (btn) applyFontSize(btn.dataset.size);
  });

  els.counterFab.addEventListener("click", () => openCounterFor(currentDuaId));
  els.homeCounterFab.addEventListener("click", () => openCounterFor(HOME_COUNTER_ID));
  els.counterBackdrop.addEventListener("click", () => closeSheet(els.counterBackdrop, els.counterSheet));
  els.tasbihClose.addEventListener("click", () => closeSheet(els.counterBackdrop, els.counterSheet));
  els.tasbihDial.addEventListener("click", incrementCounter);
  els.tasbihReset.addEventListener("click", () => {
    setCount(currentDuaId, 0);
    renderCounterSheet();
    updateCounterFab();
    updateHomeCounterFab();
  });

  // ---------- İSTATİSTİK EKRANI ----------
  function openStats() {
    renderStats();
    els.home.classList.add("screen-exit");
    setTimeout(() => {
      els.home.hidden = true;
      els.home.classList.remove("screen-exit");
      els.stats.hidden = false;
      els.stats.classList.add("screen-enter");
      requestAnimationFrame(() => {
        els.stats.classList.add("screen-enter-active");
        setTimeout(() => els.stats.classList.remove("screen-enter", "screen-enter-active"), 350);
      });
    }, 200);
  }

  function closeStats() {
    els.stats.classList.add("screen-exit");
    setTimeout(() => {
      els.stats.hidden = true;
      els.stats.classList.remove("screen-exit");
      els.home.hidden = false;
      els.home.classList.add("screen-enter");
      requestAnimationFrame(() => {
        els.home.classList.add("screen-enter-active");
        setTimeout(() => els.home.classList.remove("screen-enter", "screen-enter-active"), 350);
      });
    }, 200);
  }

  function renderStats() {
    const history = state.history || {};
    const streak = state.streak || 0;
    const today = new Date();

    // Son 4 haftayı oluştur (28 gün)
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const days = [];
      for (let d = 6; d >= 0; d--) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + d));
        const key = date.toISOString().slice(0, 10);
        const isFuture = date > today;
        days.push({ key, done: !!history[key], isFuture, day: date.getDate(), month: date.getMonth() });
      }
      weeks.push(days);
    }

    // Son 30 gün tamamlanma sayısı
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const completedLast30 = last30.filter(k => history[k]).length;

    // Toplam gün
    const totalDays = Object.keys(history).length;

    // Ay isimleri
    const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
    const days = ["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];

    // Haftalık ısı haritası HTML
    const heatMap = weeks.map(week =>
      `<div class="heat-week">${week.map(d =>
        `<div class="heat-day ${d.done ? "done" : ""} ${d.isFuture ? "future" : ""}" title="${d.key}">
          <span class="heat-day-num">${d.day}</span>
        </div>`
      ).join("")}</div>`
    ).join("");

    // Gün etiketleri
    const dayLabels = days.map(d => `<div class="heat-label">${d}</div>`).join("");

    els.statsBody.innerHTML = `
      <!-- Streak kartı -->
      <div class="stat-card streak-card">
        <div class="streak-flame">${streak > 0 ? "🔥" : "✨"}</div>
        <div class="streak-num">${streak}</div>
        <div class="streak-label">günlük seri</div>
        ${streak >= 7 ? `<div class="streak-badge-big">Bir hafta kesintisiz! 🎉</div>` : ""}
        ${streak >= 30 ? `<div class="streak-badge-big">Bir ay tam! 🏆</div>` : ""}
      </div>

      <!-- Özet istatistikler -->
      <div class="stat-row">
        <div class="stat-pill">
          <div class="stat-num">${completedLast30}</div>
          <div class="stat-lbl">Son 30 gün</div>
        </div>
        <div class="stat-pill">
          <div class="stat-num">${totalDays}</div>
          <div class="stat-lbl">Toplam gün</div>
        </div>
        <div class="stat-pill">
          <div class="stat-num">${totalDays > 0 ? Math.round((completedLast30 / 30) * 100) : 0}%</div>
          <div class="stat-lbl">Bu ay</div>
        </div>
      </div>

      <!-- Isı haritası -->
      <div class="stat-card">
        <div class="stat-card-title">Son 4 Hafta</div>
        <div class="heat-map-wrap">
          <div class="heat-day-labels">${dayLabels}</div>
          <div class="heat-grid">${heatMap}</div>
        </div>
        <div class="heat-legend">
          <span class="heat-day"></span> Okunmadı &nbsp;
          <span class="heat-day done"></span> Tamamlandı
        </div>
      </div>

      <!-- Vâkıa çevrimi -->
      ${(() => {
        const cyc = state.cycles["vakia"] || { day: 1 };
        const pct = Math.round((cyc.day / 40) * 100);
        return `<div class="stat-card">
          <div class="stat-card-title">Vâkıa Çevrimi</div>
          <div class="cycle-stat-row">
            <span class="cycle-stat-day">Gün <strong>${cyc.day}</strong> / 40</span>
            <span class="cycle-stat-pct">${pct}%</span>
          </div>
          <div class="cycle-bar-wrap">
            <div class="cycle-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>`;
      })()}
    `;
  }

  els.statsBackBtn.addEventListener("click", closeStats);
  els.streakBadge.addEventListener("click", openStats);

  // ---------- DONE FAB EVENTS ----------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#doneFab");
    if (btn) toggleDone(currentDuaId);
  });

  // ---------- YASIN PERŞEMBELERİ BİLDİRİMİ ----------
  function scheduleYasinReminder() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      doScheduleYasin();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(p => {
        if (p === "granted") doScheduleYasin();
      });
    }
  }
  function doScheduleYasin() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Paz, 4=Per, 5=Cum
    // Perşembe akşamı = Cuma başlangıcı yani Perşembe günü akşam (Türk/İslami gelenek)
    // En yakın Perşembeyi bul
    let daysUntilThursday = (4 - dayOfWeek + 7) % 7;
    if (daysUntilThursday === 0) daysUntilThursday = 0; // bugün Perşembe
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntilThursday);
    next.setHours(20, 0, 0, 0); // saat 20:00
    const ms = next - now;
    if (ms > 0 && ms < 7 * 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        new Notification("🌙 Yâsîn-i Şerîf", {
          body: "Bu akşam Yâsîn Sûresi okuma zamanı.",
          icon: "assets/allah-lafza.png"
        });
      }, ms);
    }
  }

  // ---------- INIT ----------
  if (!state.streak) state.streak = 0;
  if (!state.lastStreakDate) state.lastStreakDate = null;
  if (!state.positions) state.positions = {};
  if (!state.history) state.history = {};
  applyTheme(state.theme || "dark");
  applyFontSize(state.fontSize || "medium");
  renderHome();
  renderStreakBadge();
  updateHomeCounterFab();
  scheduleYasinReminder();
})();
