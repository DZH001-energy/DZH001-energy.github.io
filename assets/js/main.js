/* =========================================================================
   main.js — interaction: nav, filters, reveal animation, appearance settings
   ========================================================================= */

(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const KEY = "zdSite.prefs";

  const ACCENTS = [
    { name: "Hydrogen teal", c: "#14C0AE", on: "#04231F" },
    { name: "Electric blue", c: "#4C8DF6", on: "#04182F" },
    { name: "Energy amber",  c: "#F0A63C", on: "#2A1704" },
    { name: "Plasma violet", c: "#8B6FF0", on: "#160A33" },
    { name: "Grid green",    c: "#34C77B", on: "#042418" }
  ];

  const prefs = Object.assign(
    { theme: "light", accent: ACCENTS[0].c, accentOn: ACCENTS[0].on, pattern: "glow", bgImage: "" },
    JSON.parse(localStorage.getItem(KEY) || "{}")
  );

  /* ------------------------------------------------------------ apply prefs */
  function apply() {
    document.documentElement.setAttribute("data-theme", prefs.theme);
    document.documentElement.style.setProperty("--accent", prefs.accent);
    document.documentElement.style.setProperty("--on-accent", prefs.accentOn);
    const hero = $(".hero");
    if (hero) hero.setAttribute("data-pattern", prefs.pattern);
    document.documentElement.style.setProperty(
      "--hero-image", prefs.bgImage ? `url("${prefs.bgImage}")` : "none"
    );
    localStorage.setItem(KEY, JSON.stringify(prefs));
    syncUI();
  }
  function syncUI() {
    $$("#setTheme button").forEach(b => b.classList.toggle("on", b.dataset.val === prefs.theme));
    $$("#setPattern button").forEach(b => b.classList.toggle("on", b.dataset.val === prefs.pattern));
    $$("#setAccent button").forEach(b => b.classList.toggle("on", b.dataset.val === prefs.accent));
    $("#bgUrl").value = /^url\(/.test(prefs.bgImage || "") ? "" : (prefs.bgImage || "");
  }

  /* ------------------------------------------------------------------- nav */
  function initNav() {
    const nav = $("#nav"), toggle = $("#navToggle");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("#navList a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));

    /* scroll progress */
    const bar = $("#scrollProgress");
    const onScroll = () => {
      const h = document.documentElement;
      const pct = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* scroll spy */
    const links = $$("#navList a");
    const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* --------------------------------------------------------------- reveal */
  function initReveal() {
    const items = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { items.forEach(i => i.classList.add("in")); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.06, rootMargin: "0px 0px -40px" });
    items.forEach(i => io.observe(i));
  }
  /* render.js calls this after re-rendering filtered lists */
  window.Render = window.Render || {};
  window.Render.observeReveal = initReveal;

  /* ------------------------------------------------------ publication filter */
  function initFilters() {
    const state = { type: "all", year: "all", q: "" };
    const TYPES = [
      ["all", "All"],
      ["journal", "Journal"],
      ["conference", "Conference"],
      ["underReview", "Under review"]
    ];
    $("#pubTypeChips").innerHTML =
      TYPES.map(([v, l]) => `<button class="chip ${v === "all" ? "on" : ""}" data-type="${v}">${l}</button>`).join("");

    const refresh = () => window.Render.publications(state);

    $("#pubTypeChips").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      state.type = b.dataset.type; refresh();
      $$("#pubTypeChips .chip").forEach(c => c.classList.toggle("on", c === b));
    });
    $("#pubYearChips").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      state.year = b.dataset.year; refresh();
    });
    let t;
    $("#pubSearch").addEventListener("input", e => {
      clearTimeout(t);
      t = setTimeout(() => { state.q = e.target.value.trim(); refresh(); }, 180);
    });
  }

  /* ------------------------------------------------------------ appearance */
  function initSettings() {
    const panel = $("#settingsPanel"), scrim = $("#scrim");
    const open  = () => { panel.classList.add("open"); scrim.classList.add("show"); panel.setAttribute("aria-hidden", "false"); };
    const close = () => { panel.classList.remove("open"); scrim.classList.remove("show"); panel.setAttribute("aria-hidden", "true"); };

    $("#settingsBtn").addEventListener("click", open);
    $("#settingsClose").addEventListener("click", close);
    scrim.addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

    /* accent swatches */
    $("#setAccent").innerHTML = ACCENTS.map(a =>
      `<button data-val="${a.c}" data-on="${a.on}" style="background:${a.c}" title="${a.name}" aria-label="${a.name}"></button>`).join("");
    $("#setAccent").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      prefs.accent = b.dataset.val; prefs.accentOn = b.dataset.on; apply();
    });
    syncUI();   /* paint the active state of the freshly built swatches */

    $("#setTheme").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      prefs.theme = b.dataset.val; apply();
    });
    $("#setPattern").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      prefs.pattern = b.dataset.val; apply();
    });

    /* header theme button cycles light → dark → midnight */
    $("#themeToggle").addEventListener("click", () => {
      prefs.theme = prefs.theme === "light" ? "dark" : prefs.theme === "dark" ? "midnight" : "light";
      apply();
    });

    $("#bgApply").addEventListener("click", () => {
      const v = $("#bgUrl").value.trim();
      prefs.bgImage = v; apply();
    });
    $("#bgClear").addEventListener("click", () => { prefs.bgImage = ""; $("#bgUrl").value = ""; apply(); });
    $("#bgFile").addEventListener("change", e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      if (f.size > 3 * 1024 * 1024) { alert("Image is larger than 3 MB — please use a smaller file."); return; }
      const r = new FileReader();
      r.onload = () => { prefs.bgImage = String(r.result); apply(); };
      r.readAsDataURL(f);
    });
    $("#setReset").addEventListener("click", () => {
      Object.assign(prefs, { theme: "light", accent: ACCENTS[0].c, accentOn: ACCENTS[0].on, pattern: "glow", bgImage: "" });
      apply();
    });
  }

  /* ------------------------------------------------------------------ boot */
  document.addEventListener("DOMContentLoaded", () => {
    apply();
    initNav();
    initFilters();
    initSettings();
    requestAnimationFrame(initReveal);
  });
})();
