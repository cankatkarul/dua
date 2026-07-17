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
    readerBody: $("#readerBody"),
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
    counterBackdrop: $("#counterBackdrop"),
    counterSheet: $("#counterSheet"),
    counterTarget: $("#counterTarget"),
    tasbihDial: $("#tasbihDial"),
    tasbihCount: $("#tasbihCount"),
    tasbihRingProgress: $("#tasbihRingProgress"),
    tasbihReset: $("#tasbihReset"),
    tasbihClose: $("#tasbihClose"),
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
      return { theme: "dark", fontSize: "medium", doneDate: todayKey(), done: {}, counters: {} };
    }
  }
  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  }

  const state = loadStore();
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

  // ---------- HOME LIST ----------
  function renderHome() {
    els.duaList.innerHTML = "";
    DUAS.forEach((dua, i) => {
      const card = document.createElement("button");
      card.className = "dua-card" + (state.done[dua.id] ? " is-done" : "");
      card.innerHTML = `
        <span class="dua-index">${i + 1}</span>
        <span class="dua-info">
          <p class="dua-name">${dua.name}</p>
          <p class="dua-meta">${dua.meta}</p>
        </span>
        <span class="dua-done">✓</span>
        <span class="dua-chevron">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>`;
      card.addEventListener("click", () => openReader(dua.id));
      els.duaList.appendChild(card);
    });
  }

  // ---------- READER ----------
  function openReader(id) {
    const dua = DUAS.find(d => d.id === id);
    if (!dua) return;
    currentDuaId = id;

    els.readerTitle.textContent = dua.name;
    els.readerSubtitle.textContent = dua.meta;

    let bodyHtml = "";
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

    // mark as read once opened (simple daily checklist)
    state.done[dua.id] = true;
    saveStore();

    els.home.hidden = true;
    els.reader.hidden = false;
    window.scrollTo(0, 0);
    updateCounterFab();
  }

  function closeReader() {
    els.reader.hidden = true;
    els.home.hidden = false;
    renderHome();
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
  function renderCounterSheet() {
    const dua = DUAS.find(d => d.id === currentDuaId);
    const count = getCount(currentDuaId);
    els.tasbihCount.textContent = String(count);
    if (dua && dua.counterTarget) {
      els.counterTarget.textContent = `Hedef: ${dua.counterTarget}`;
      const ratio = Math.min(count / dua.counterTarget, 1);
      els.tasbihRingProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
    } else {
      els.counterTarget.textContent = "Serbest sayaç";
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

  // ---------- INIT ----------
  applyTheme(state.theme || "dark");
  applyFontSize(state.fontSize || "medium");
  renderHome();
  updateHomeCounterFab();
})();
