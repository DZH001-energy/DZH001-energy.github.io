/* =========================================================================
   render.js — turns assets/js/content.js into the page
   You normally do NOT need to edit this file.
   ========================================================================= */

(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = s => String(s == null ? "" : s)
    .replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, "&amp;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* **name** → highlighted span (used for author lists) */
  const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="me">$1</span>');
  /* allow a small, safe set of inline tags the author wrote themselves */
  const rich = s => String(s == null ? "" : s)
    .replace(/&(?!(amp|lt|gt|quot|nbsp|#\d+);)/g, "&amp;");

  const icon = (name, cls = "ic") =>
    `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const iconLink = (href, label, ic) =>
    href ? `<a href="${esc(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""}>${icon(ic)} ${esc(label)}</a>` : "";

  const linkIcons = [
    ["scholar", "Google Scholar", "scholar"],
    ["orcid", "ORCID", "globe"],
    ["scopus", "Scopus", "graph"],
    ["researchgate", "ResearchGate", "globe"],
    ["linkedin", "LinkedIn", "link"],
    ["github", "GitHub", "chip"]
  ];

  /* ------------------------------------------------------------------ nav */
  function nav() {
    const ul = $("#navList");
    const hasMedia = (SITE.media || []).length > 0 || (SITE.projectVideos || []).length > 0 || (SITE.researchLinks || []).length > 0;
    (SITE.profile.nav || []).filter(item => !(item.href === "#media" && !hasMedia)).forEach(item => {
      const li = el("li");
      li.innerHTML = `<a href="${esc(item.href)}" data-nav="${esc(item.href)}">${esc(item.label)}</a>`;
      ul.appendChild(li);
    });
  }

  /* ----------------------------------------------------------------- hero */
  function hero() {
    const p = SITE.profile;
    $("#brandName").textContent = p.shortName || p.name;
    document.title = `${p.name} — Energy Systems, Control & AI | ERI@N, NTU`;
    $("#heroEyebrow").textContent = p.eyebrow || "";
    $("#heroName").textContent = p.name;
    $("#heroTitle").innerHTML = rich(p.title);
    $("#heroAffil").innerHTML = rich(p.affiliation);
    $("#heroTagline").innerHTML = rich(p.tagline);

    const img = $("#heroPhoto");
    img.src = p.photo || "assets/img/profile.svg";
    img.alt = p.photoAlt || p.name;

    /* 肖像框下方徽章 */
    const badge = $("#heroBadge");
    if (badge) badge.innerHTML = `<span class="pdot"></span>${rich(p.badge || "Energy · Control · AI")}`;

    /* 照片比例提示：换成真人照片后自动隐藏 */
    const tip = $("#photoTip");
    if (tip) tip.style.display = /profile\.svg/i.test(img.src) ? "block" : "none";

    /* buttons */
    const acts = $("#heroActions");
    acts.innerHTML = "";
    if (p.email) acts.appendChild(el("a", "btn btn-primary", `${icon("mail")} Email the Author`)).href = `mailto:${p.email}`;
    if (p.cvFile) {
      const a = el("a", "btn btn-ghost", `${icon("doc")} Download CV`);
      a.href = p.cvFile; a.target = "_blank"; a.rel = "noopener";
      acts.appendChild(a);
    }
    (p.links && p.links.scholar) && acts.insertAdjacentHTML("beforeend",
      `<a class="btn btn-ghost" href="${esc(p.links.scholar)}" target="_blank" rel="noopener">${icon("scholar")} Scholar</a>`);

    /* contact line */
    const c = $("#heroContact");
    c.innerHTML = "";
    if (p.email) c.insertAdjacentHTML("beforeend", `<li><a href="mailto:${esc(p.email)}">${icon("mail")} ${esc(p.email)}</a></li>`);
    if (p.location) c.insertAdjacentHTML("beforeend", `<li><a href="#contact" style="pointer-events:none">${icon("pin")} ${esc(p.location)}</a></li>`);
    linkIcons.forEach(([k, label, ic]) => {
      const url = p.links && p.links[k];
      if (url) c.insertAdjacentHTML("beforeend", `<li><a href="${esc(url)}" target="_blank" rel="noopener">${icon(ic)} ${label}</a></li>`);
    });

    /* stats */
    $("#statGrid").innerHTML = (SITE.stats || []).map(s =>
      `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("");
  }

  /* ---------------------------------------------------------------- about */
  function about() {
    $("#aboutBody").innerHTML = (SITE.about.paragraphs || []).map(t => `<p>${rich(t)}</p>`).join("");
    const profile = SITE.about.externalProfile;
    if (profile && /^https:\/\/[^\s]+$/i.test(profile.href)) {
      const note = el('div', 'about-profile-link');
      const a = document.createElement('a');
      a.href = profile.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = `${profile.label} ↗`;
      a.setAttribute('aria-label', `${profile.label} (opens in a new tab)`);
      const role = document.createElement('span');
      role.textContent = profile.role;
      note.append(a, role);
      $("#aboutBody").append(note);
    }
    $("#aboutAreas").innerHTML = (SITE.about.areas || []).map(a => `<li class="tag">${rich(a)}</li>`).join("");
    $("#aboutFacts").innerHTML =
      `<h3>At a glance</h3><ul class="fact-list">` +
      (SITE.about.facts || []).map(f => `<li><span>${rich(f.k)}</span><b>${rich(f.v)}</b></li>`).join("") + `</ul>`;
  }

  /* ----------------------------------------------------------------- news */
  function news() {
    const list = $("#newsList");
    const items = SITE.news || [];
    list.innerHTML = items.length
      ? items.map(n => `<li><span class="news-date">${esc(n.date)}</span><span class="news-txt">${rich(n.text)}</span></li>`).join("")
      : `<div class="empty">No news yet — add entries to <code>news</code> in content.js.</div>`;
  }

  /* ------------------------------------------------------------- research */
  function research() {
    $("#researchGrid").innerHTML = (SITE.research || []).map(r => `
      <article class="card reveal ${r.media ? "has-media" : ""}">
        ${r.media ? `<div class="card-thumb"><img src="${esc(r.media)}" alt="${esc(String(r.title).replace(/&amp;/g, "and"))}" loading="lazy"></div>` : ""}
        <div class="card-ico">${icon(r.icon || "chip")}</div>
        <h3>${rich(r.title)}</h3>
        <p>${rich(r.desc)}</p>
        ${(r.keywords && r.keywords.length) ? `<div class="kw">${r.keywords.map(k => `<span>${esc(k)}</span>`).join("")}</div>` : ""}
      </article>`).join("");
  }

  /* --------------------------------------------------------- publications */
  function badgeClass(b) {
    const t = String(b).toUpperCase();
    if (t === "TOP") return "top";
    if (/^Q\d/.test(t)) return "q1";
    if (t.indexOf("CORRESPONDING") >= 0) return "cor";
    if (/^IF/i.test(t)) return "if";
    return "";
  }
  function pubItem(p) {
    return `
      <li class="reveal">
        <span class="entry-year">${esc(p.year || "")}</span>
        <div class="entry-main">
          <div class="entry-title">${p.doi ? `<a href="${esc(p.doi)}" target="_blank" rel="noopener">${rich(p.title)}</a>` : rich(p.title)}</div>
          ${p.authors ? `<div class="entry-authors">${hl(p.authors)}</div>` : ""}
          ${p.venue ? `<div class="entry-venue">${rich(p.venue)}</div>` : ""}
          ${(p.badges && p.badges.length)
            ? `<div class="entry-meta">${p.badges.map(b => `<span class="badge ${badgeClass(b)}">${esc(b)}</span>`).join("")}</div>` : ""}
          ${p.doi ? `<div class="entry-links"><a href="${esc(p.doi)}" target="_blank" rel="noopener">${icon("link")} Full text / DOI</a></div>` : ""}
          ${p.note ? `<div class="entry-note">${rich(p.note)}</div>` : ""}
        </div>
      </li>`;
  }
  function pubSection(title, items, emptyMsg) {
    if (!items || !items.length) return "";
    return `<div class="pub-group"><h3>${title} <em>${items.length}</em></h3>
      <ol class="entry-list">${items.map(pubItem).join("")}</ol></div>`;
  }

  const PUB_GROUPS = [
    { key: "journal",     title: "Journal Articles &amp; Reviews" },
    { key: "conference",  title: "Conference Papers" },
    { key: "underReview", title: "Manuscripts Under Review" }
  ];

  function publications(filter) {
    const f = filter || { type: "all", year: "all", q: "" };
    const P = SITE.publications || {};
    const out = [];
    let total = 0;
    PUB_GROUPS.forEach(g => {
      let items = (P[g.key] || []).slice();
      if (f.type !== "all" && f.type !== g.key) items = [];
      if (f.year !== "all") items = items.filter(p => String(p.year) === String(f.year));
      if (f.q) {
        const q = f.q.toLowerCase();
        items = items.filter(p => ((p.title || "") + " " + (p.venue || "") + " " + (p.authors || "")).toLowerCase().indexOf(q) >= 0);
      }
      total += items.length;
      out.push(pubSection(g.title, items));
    });
    $("#pubGroups").innerHTML = out.join("") ||
      `<div class="empty">No publication matches this filter.</div>`;
    /* re-bind the entrance animation for freshly rendered items */
    if (window.Render && window.Render.observeReveal) window.Render.observeReveal();
    $("#pubCount").innerHTML = total + " record" + (total === 1 ? "" : "s") + " shown · "
      + "click a DOI link to open the publisher page";

    /* year chips */
    const years = [...new Set(PUB_GROUPS.flatMap(g => (P[g.key] || []).map(p => p.year)))].sort((a, b) => b - a);
    $("#pubYearChips").innerHTML =
      `<button class="chip ${f.year === "all" ? "on" : ""}" data-year="all">All years</button>` +
      years.map(y => `<button class="chip ${String(f.year) === String(y) ? "on" : ""}" data-year="${y}">${y}</button>`).join("");
  }

  /* -------------------------------------------------------------- patents */
  function patents() {
    const items = SITE.patents || [];
    $("#patentList").innerHTML = items.length ? items.map(p => `
      <li class="reveal">
        <div>
          <div class="entry-title">${rich(p.title)}</div>
          <div class="entry-authors">${hl(p.authors || "")}</div>
          <div class="entry-venue">${rich(p.venue || "")}</div>
          ${p.note ? `<div class="entry-note">${rich(p.note)}</div>` : ""}
        </div>
      </li>`).join("")
      : "";
  }

  /* ---------------------------------------------------------------- talks */
  function talks() {
    const items = SITE.talks || [];
    $("#talkList").innerHTML = items.length ? items.map(t => `
      <li class="reveal">
        <span class="tl-when">${esc(t.when)}</span>
        <div class="tl-what">${rich(t.what)}</div>
        <div class="tl-where">${rich(t.where)}</div>
        ${t.desc ? `<div class="tl-desc">${rich(t.desc)}</div>` : ""}
      </li>`).join("")
      : "";
  }

  /* ------------------------------------------------------------- projects */
  function projects() {
    const items = SITE.projects || [];
    $("#projectGrid").innerHTML = items.length ? items.map(p => `
      <article class="card reveal">
        <div class="card-ico">${icon("bolt")}</div>
        <h3>${rich(p.title)}</h3>
        <p>${rich(p.desc)}</p>
        <div class="kw">
          ${p.funder ? `<span>${esc(p.funder)}</span>` : ""}
          ${p.grant ? `<span>${esc(p.grant)}</span>` : ""}
          ${p.period ? `<span>${esc(p.period)}</span>` : ""}
          ${p.role ? `<span>${esc(p.role)}</span>` : ""}
        </div>
      </article>`).join("")
      : "";
  }

  /* -------------------------------------------------------------- service */
  function service() {
    const s = SITE.service || {};
    const col = (title, iconName, arr) => {
      const body = (arr && arr.length)
        ? `<ul>${arr.map(i => `<li><span class="svc-role">${rich(i.role)}</span>${i.org ? ` — <span class="svc-org">${rich(i.org)}</span>` : ""}
             ${i.journals ? `<div class="svc-journals">${i.journals.map(j => `<span class="svc-chip">${rich(j)}</span>`).join("")}</div>` : ""}
             <span class="svc-when">${esc(i.when || "")}</span></li>`).join("")}</ul>`
        : "";
      return `<div class="svc-col reveal"><h3>${icon(iconName)} ${title}</h3>${body}</div>`;
    };
    $("#serviceGrid").innerHTML =
      col("Editorial Roles", "doc", s.editorial) +
      col("Committees &amp; Youth Boards", "globe", s.committee) +
      col("Peer Review", "chip", s.reviewer);
  }

  /* ------------------------------------------------------------- teaching */
  function teaching() {
    const t = SITE.teaching || [];
    $("#teachList").innerHTML = t.length ? t.map(c => `
      <div class="teach-card reveal">
        <span class="when">${esc(c.when)}</span>
        <h4>${rich(c.what)}</h4>
        <div class="tl-where">${rich(c.org)}</div>
        ${(c.points && c.points.length) ? `<ul>${c.points.map(p => `<li>${rich(p)}</li>`).join("")}</ul>` : ""}
      </div>`).join("")
      : "";

    const st = SITE.students || {};
    const col = (title, arr) => `
      <div class="student-col reveal">
        <h4>${title} <span class="n">${(arr || []).length}</span></h4>
        ${(arr && arr.length)
          ? `<ul>${arr.map(s => `<li>${rich(s.name)}${s.topic ? `<em>${rich(s.topic)}</em>` : ""}${s.period ? `<em>${esc(s.period)}</em>` : ""}${s.note ? `<em>${rich(s.note)}</em>` : ""}</li>`).join("")}</ul>`
          : ""}
      </div>`;
    $("#studentGrid").innerHTML =
      col("PhD Students", st.phd) + col("Master Students", st.master) + col("Undergraduate Students", st.undergrad);
  }

  /* --------------------------------------------------------------- awards */
  function awards() {
    const a = SITE.awards || [];
    $("#awardGrid").innerHTML = a.length ? a.map(x => `
      <div class="award reveal"><span class="dot"></span>
        <span class="txt">${rich(x.text)}<span class="when">${esc(x.when || "")}</span></span>
      </div>`).join("")
      : "";
  }

  /* ----------------------------------------------------------- background */
  function background() {
    const line = i => `
      <li class="reveal">
        <span class="tl-when">${esc(i.when)}</span>
        <div class="tl-what">${rich(i.what)}</div>
        <div class="tl-where">${rich(i.where)}</div>
        ${i.desc ? `<div class="tl-desc">${rich(i.desc)}</div>` : ""}
      </li>`;
    $("#expList").innerHTML = (SITE.experience || []).map(line).join("") || "";
    $("#eduList").innerHTML  = (SITE.education  || []).map(line).join("") || "";
  }

  /* -------------------------------------------------------------- contact */
  function contact() {
    $("#contactGrid").innerHTML = (SITE.contact || []).map(c => `
      <div class="contact-card reveal">
        <div class="card-ico">${icon(c.icon || "mail")}</div>
        <div>
          <h4>${esc(c.label)}</h4>
          ${c.href ? `<a href="${esc(c.href)}"${/^https?:/.test(c.href) ? ' target="_blank" rel="noopener"' : ""}>${rich(c.value)}</a>`
                   : `<p>${rich(c.value)}</p>`}
        </div>
      </div>`).join("");
  }


  /* --------------------------------------------------------------- media */
  function media() {
    const items = SITE.media || [];
    const videos = SITE.projectVideos || [];
    const links = SITE.researchLinks || [];
    window.ProjectVideos.render(videos, links);
    const grid = $("#mediaGrid");
    const sub = $("#mediaSub");
    if (sub) {
      const n = items.length;
      sub.innerHTML = videos.length || links.length
        ? 'Modelling, intelligent control, and co-simulation of clean energy and autonomous systems.'
        : n
        ? `${n} item${n === 1 ? "" : "s"} — research schematics, photographs and videos. Click any item to enlarge or play.`
        : "";
    }
    if (!items.length) {
      const sec = $("#media");
      if (sec) sec.style.display = videos.length || links.length ? "" : "none";
      grid.innerHTML = "";
      return;
    }
    grid.innerHTML = items.map((m, i) => {
      const isPlay = m.type === "video" || m.type === "embed";
      const poster = m.type === "video" ? m.poster : (m.type === "embed" ? m.poster : m.src);
      const thumb = poster
        ? `<img src="${esc(poster)}" alt="${esc(m.title || "")}" loading="lazy">`
        : `<div class="media-nothumb">${icon("bolt")}</div>`;
      return `
        <figure class="media-item reveal ${isPlay ? "is-play" : ""}" data-i="${i}" data-type="${esc(m.type || "image")}">
          <div class="media-thumb">
            ${thumb}
            ${isPlay ? `<span class="media-play">${icon("bolt")}</span>` : ""}
            <span class="media-zoom">${icon("link")}</span>
          </div>
          <figcaption class="media-cap">
            ${m.tag ? `<span class="media-tag">${rich(m.tag)}</span>` : ""}
            <strong>${rich(m.title || "")}</strong>
            ${m.caption ? `<p>${rich(m.caption)}</p>` : ""}
          </figcaption>
        </figure>`;
    }).join("");
  }

  /* ---------------------------------------------------------- maintenance */
  function maintenance() {
    const st = (SITE.site && SITE.site.status) || "online";
    const box = $("#maintenance");
    if (!box) return false;
    if (st !== "maintenance") { box.classList.remove("on"); return false; }
    const m = (SITE.site && SITE.site.maintenance) || {};
    $("#maintTitle").textContent = m.title || "This site is temporarily offline";
    $("#maintNote").textContent = m.note || "";
    const mail = $("#maintMail");
    if (mail) {
      mail.textContent = m.email ? "Email the Author" : "Contact the Author";
      mail.href = m.email ? "mailto:" + m.email : "#";
    }
    $("#maintFoot").textContent = m.title || "";
    box.classList.add("on");
    document.body.classList.add("is-maintenance");
    return true;
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    nav(); hero(); about(); news(); research(); media();
    maintenance();
    publications({ type: "all", year: "all", q: "" });
    patents(); talks(); projects(); service(); teaching(); awards(); background(); contact();
    $("#footerName").innerHTML = `<strong>${esc(SITE.profile.name)}</strong> · ${rich(SITE.profile.title)} · ${rich(SITE.profile.affiliation)}`;
    $("#footerNote").textContent = SITE.footerNote || "";
    const cp = $("#footerCopy");
    if (cp) cp.textContent = `\u00a9 ${new Date().getFullYear()} ${SITE.profile.shortName || SITE.profile.name}`;
  }

  window.Render = { publications, boot };
  document.addEventListener("DOMContentLoaded", boot);
})();
