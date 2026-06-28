/* =====================================================================
   Spread Hope — Shared UI: chrome, icons, helpers, motion
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Icons (inline SVG, stroke currentColor) ---------- */
  const I = {
    logo: '<svg class="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M6 28a14 14 0 0 1 28 0" stroke="var(--harbor-teal)" stroke-width="3.4" stroke-linecap="round"/><path d="M12 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="var(--warm-coral)" stroke-width="3.4" stroke-linecap="round"/><circle cx="20" cy="28" r="2.6" fill="var(--care-blue)"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m20 20-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    checkBadge: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5 14.6 4l3 .1 1 2.8 2.2 2-1 2.8 1 2.8-2.2 2-1 2.8-3 .1L12 21.5 9.4 20l-3-.1-1-2.8-2.2-2 1-2.8-1-2.8 2.2-2 1-2.8 3-.1L12 2.5Z" fill="currentColor" opacity=".16"/><path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 5.5a3 3 0 0 1 0 5.7M17 19a5.4 5.4 0 0 0-2.3-4.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 5 6v5c0 4.5 3 8.3 7 9.7 4-1.4 7-5.2 7-9.7V6l-7-3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.6-9.3-9C1.3 8.4 2.6 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.4 0 4.7 3.4 3.3 6-2.3 4.4-9.3 9-9.3 9Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="2.6" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="2.6" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="2.6" stroke="currentColor" stroke-width="2"/><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6" stroke="currentColor" stroke-width="2"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 21V4m0 1h11l-2 4 2 4H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h7M15 17h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="7" r="2" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="12" r="2" stroke="currentColor" stroke-width="2"/><circle cx="13" cy="17" r="2" stroke="currentColor" stroke-width="2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="9.5" r="1.8" stroke="currentColor" stroke-width="2"/><path d="m4 17 4.5-4.5 3 3L16 10l4 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0L7 9m5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="2"/><path d="m4 7 8 5 8-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    handshake: '<svg viewBox="0 0 24 24" fill="none"><path d="m12 8 2-1.8a3 3 0 0 1 4 .2l3 3M2 9.5l3-3a3 3 0 0 1 4-.2L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m6 12 3 3a1.6 1.6 0 0 0 2.3 0L13 13l2 2a1.6 1.6 0 0 0 2.3-2.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="m15 9-2 4-4 2 2-4 4-2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3l.5-3H14V4.5c0-.9.3-1.5 1.6-1.5H17V.3C16.6.2 15.6 0 14.5 0 12 0 10.3 1.5 10.3 4.3V6H8v3h2.3v9H14V9Z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-5.9l-4.3-5.6L6.4 21H3.3l7-8L2.6 3h6l3.9 5.2L17.5 3Zm-1 16h1.6L7.6 4.7H5.9L16.5 19Z"/></svg>',
    li: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h3v12H3V9Zm5.5 0H11v1.6h.1c.4-.7 1.4-1.6 3-1.6 3.2 0 3.9 2 3.9 4.7V21h-3v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21h-3V9Z"/></svg>',
    tk: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.35 2.06 1.6 3.46 3.5 3.78v2.62c-1.27.02-2.46-.36-3.5-1.04v6.27a5.62 5.62 0 1 1-5.62-5.62c.28 0 .56.02.83.07v2.74a2.9 2.9 0 1 0 2.03 2.77V3h2.76Z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none"><path d="M10.5 13.5a3.6 3.6 0 0 0 5.1 0l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.3 1.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13.5 10.5a3.6 3.6 0 0 0-5.1 0l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.3-1.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L3.5 20.5l1.45-5.05A8.5 8.5 0 1 1 21 11.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 3.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.7" r="1" fill="currentColor"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l.7-.9c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.1.1.6-.1 1.1Z"/></svg>',
  };

  /* ---------- Helpers ---------- */
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const moneyK = (n) => (n >= 1000 ? "$" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k" : "$" + n);
  const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Campaign card markup ---------- */
  function campaignCard(c, opts = {}) {
    const p = window.SpreadHopeData.pct(c);
    const statusBadge =
      c.status === "urgent" ? '<span class="badge-status urgent">Urgent</span>' :
      c.status === "almost" || p >= 80 ? '<span class="badge-status almost">Almost there</span>' : "";
    const href = `campaign.html?id=${c.id}`;
    return `
    <article class="ccard reveal ${opts.peek ? "peek" : ""}" data-pct="${p}">
      <a class="stretch" href="${href}" aria-label="View ${esc(c.title)}"></a>
      <div class="ccard-img">
        <img src="${c.cover}" alt="${esc(c.title)}" loading="lazy" width="900" height="600"
             onerror="this.onerror=null;this.src='${window.SpreadHopeData.fallbackImg(c.category)}'">
        <span class="ccard-scrim" aria-hidden="true"></span>
        <div class="badges">
          <span class="badge-cat">${esc(c.category)}</span>
          ${statusBadge}
        </div>
        <h3 class="ccard-title">${esc(c.title)}</h3>
      </div>
      <div class="ccard-body">
        <h3 class="ccard-title-m">${esc(c.title)}</h3>
        <div class="careflow">
          <div class="ccard-amt"><b>${money(c.raised)}</b> <span>of ${money(c.goal)}</span></div>
          <div class="careflow-track"><div class="careflow-fill" data-fill="${p}"></div></div>
          <div class="careflow-stats">
            <div class="raised">${money(c.raised)} <span>of ${money(c.goal)}</span></div>
            <div class="pct">${p}%</div>
          </div>
          <div class="ccard-funded">${p}% funded</div>
        </div>
        <div class="ccard-foot">
          <span class="ccard-donors">${I.users}${c.donors} supporters</span>
          <span class="ccard-go">Donate ${I.arrow}</span>
        </div>
        <a class="ccard-support" href="${href}">Support this story ${I.arrow}</a>
      </div>
    </article>`;
  }

  function featuredCard(c) {
    const p = window.SpreadHopeData.pct(c);
    return `
    <article class="ccard featured reveal" data-pct="${p}">
      <div class="ccard-img">
        <div class="badges">
          <span class="badge-cat">${esc(c.category)}</span>
          ${c.status === "urgent" ? '<span class="badge-status urgent">Urgent</span>' : ""}
        </div>
        <img src="${c.cover}" alt="${esc(c.title)}" loading="lazy" width="900" height="563"
             onerror="this.onerror=null;this.src='${window.SpreadHopeData.fallbackImg(c.category)}'">
      </div>
      <div class="ccard-body">
        <div class="loc">${I.pin}${esc(c.location)} · ${c.donors} supporters</div>
        <h3 class="ccard-title">${esc(c.title)}</h3>
        <p class="feat-blurb">${esc(c.blurb)}</p>
        <div class="ccard-meta">
          <div class="careflow">
            <div class="careflow-track"><div class="careflow-fill" data-fill="${p}"></div></div>
            <div class="careflow-stats">
              <div class="raised">${money(c.raised)} <span>raised of ${money(c.goal)}</span></div>
              <div class="pct">${p}%</div>
            </div>
          </div>
        </div>
        <a class="stretch" href="campaign.html?id=${c.id}" aria-label="View ${esc(c.title)}"></a>
      </div>
    </article>`;
  }

  function skeletonCard() {
    return `<div class="skel-card"><div class="skel skel-img"></div><div class="skel-body">
      <div class="skel skel-line" style="width:40%"></div>
      <div class="skel skel-line" style="width:90%"></div>
      <div class="skel skel-line" style="width:70%"></div>
      <div class="skel skel-line" style="width:100%;height:8px;margin-top:14px"></div>
      <div class="skel skel-line" style="width:50%;margin-top:14px"></div>
    </div></div>`;
  }

  /* ---------- Header / Drawer / Footer injection ---------- */
  const NAV = [
    { href: "browse-campaigns.html", label: "Browse Campaigns", key: "browse" },
    { href: "how-it-works.html", label: "How it Works", key: "how" },
    { href: "start.html", label: "Start a Campaign", key: "start" },
  ];

  function renderHeader() {
    const active = document.body.dataset.page || "";
    const howActive = active === "how" || active === "howdonate" || active === "howcreate";
    const navLinks = NAV.map((n) => {
      if (n.key === "how") {
        return `<div class="nav-dd" data-navdd>
          <button type="button" class="nav-dd-btn${howActive ? " active" : ""}" aria-expanded="false" aria-haspopup="true">How it works ${I.chevron}</button>
          <div class="nav-dd-menu">
            <a href="how-to-donate.html"><b>For donors</b><span>How to give, step by step</span></a>
            <a href="how-to-create.html"><b>For organizers</b><span>Create &amp; manage a campaign</span></a>
          </div>
        </div>`;
      }
      return `<a href="${n.href}" class="${active === n.key ? "active" : ""}">${n.label}</a>`;
    }).join("");
    const drawerLinks = NAV.map((n) => {
      if (n.key === "how") {
        return `<div class="drawer-acc" data-acc>
          <button type="button" class="drawer-acc-btn${howActive ? " active" : ""}" aria-expanded="false">How it works ${I.chevron}</button>
          <div class="drawer-acc-panel">
            <a href="how-to-donate.html"${active === "howdonate" ? ' class="active"' : ""}><b>For donors</b><span>How to give, step by step</span></a>
            <a href="how-to-create.html"${active === "howcreate" ? ' class="active"' : ""}><b>For organizers</b><span>Create &amp; manage a campaign</span></a>
          </div>
        </div>`;
      }
      return `<a href="${n.href}" class="${active === n.key ? "active" : ""}">${n.label} ${I.chevron}</a>`;
    }).join("");
    const brand = `<a class="brand" href="index.html" aria-label="Spread Hope home"><img class="brand-headerlogo" src="assets/img/logo-name.png" alt="Spread Hope" width="200" height="63"></a>`;

    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `
      <div class="header-inner">
        ${brand}
        <nav class="nav">${navLinks}</nav>
        <div class="header-actions">
          <button class="icon-btn" id="searchOpen" aria-label="Search campaigns">${I.search}</button>
          <a href="start.html" class="btn btn-primary btn-sm header-cta">Start a Campaign</a>
          <button class="icon-btn menu-btn" id="menuOpen" aria-label="Open menu">${I.menu}</button>
        </div>
      </div>`;
    document.body.prepend(header);

    // Drawer + backdrop
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="drawer-top">
          ${brand}
          <button class="icon-btn" id="menuClose" aria-label="Close menu">${I.close}</button>
        </div>
        <nav class="drawer-nav">${drawerLinks}</nav>
        <div class="drawer-sep"></div>
        <a href="start.html" class="btn btn-primary btn-block">Start a Campaign</a>
        <a href="browse-campaigns.html" class="btn btn-ghost btn-block">Browse fundraisers</a>
        <nav class="drawer-mininav">
          <a href="privacy.html"${active === "privacy" ? ' class="active"' : ""}>Privacy Policy</a>
          <a href="terms.html"${active === "terms" ? ' class="active"' : ""}>Terms of Service</a>
          <a href="contact.html"${active === "contact" ? ' class="active"' : ""}>Contact us</a>
        </nav>
        <div class="drawer-foot">
          <div>Every story deserves a way forward.</div>
          <div class="socials">
            <a href="#" aria-label="Instagram">${I.ig}</a>
          </div>
        </div>
      </aside>`;
    document.body.appendChild(wrap);

    // Search overlay
    const search = document.createElement("div");
    search.className = "search-overlay";
    search.id = "searchOverlay";
    search.innerHTML = `
      <div class="search-box" role="dialog" aria-modal="true" aria-label="Search">
        <div class="search-field">${I.search}<input type="search" id="searchInput" placeholder="Search fundraisers, causes, places…" autocomplete="off"><button class="icon-btn" id="searchClose" aria-label="Close search">${I.close}</button></div>
        <div class="search-hint">Try: <span class="chip" data-q="Medical">Medical</span><span class="chip" data-q="Emergency">Emergency</span><span class="chip" data-q="Education">Education</span></div>
        <div class="search-results" id="searchResults"></div>
      </div>`;
    document.body.appendChild(search);

    wireChrome();
  }

  function lockScroll(on) {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
  }

  function wireChrome() {
    const header = qs(".site-header");
    const drawer = qs("#drawer");
    const backdrop = qs("#drawerBackdrop");
    const openDrawer = () => { drawer.classList.add("open"); backdrop.classList.add("open"); lockScroll(true); };
    const closeDrawer = () => { drawer.classList.remove("open"); backdrop.classList.remove("open"); lockScroll(false); };
    qs("#menuOpen").addEventListener("click", openDrawer);
    qs("#menuClose").addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);

    // "How it works" — top-nav dropdown + drawer accordion (open the two paths instead of redirecting)
    qsa(".nav-dd-btn").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const dd = b.closest(".nav-dd");
      const open = dd.classList.toggle("open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
    }));
    document.addEventListener("click", (e) => {
      if (e.target.closest(".nav-dd")) return;
      qsa(".nav-dd.open").forEach((d) => { d.classList.remove("open"); d.querySelector(".nav-dd-btn")?.setAttribute("aria-expanded", "false"); });
    });
    qsa(".drawer-acc-btn").forEach((b) => b.addEventListener("click", () => {
      const acc = b.closest(".drawer-acc");
      const open = acc.classList.toggle("open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
    }));

    // search
    const overlay = qs("#searchOverlay");
    const input = qs("#searchInput");
    const results = qs("#searchResults");
    const openSearch = () => { overlay.classList.add("open"); lockScroll(true); setTimeout(() => input.focus(), 80); };
    const closeSearch = () => { overlay.classList.remove("open"); lockScroll(false); input.value = ""; results.innerHTML = ""; };
    qs("#searchOpen").addEventListener("click", openSearch);
    qs("#searchClose").addEventListener("click", closeSearch);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSearch(); });
    qsa(".search-hint .chip").forEach((c) => c.addEventListener("click", () => { input.value = c.dataset.q; runSearch(); }));

    let t;
    const runSearch = async () => {
      const q = input.value.trim();
      if (!q) { results.innerHTML = ""; return; }
      const rows = await window.SpreadHopeData.search(q);
      results.innerHTML = rows.length
        ? rows.map((c) => `<a class="search-res-item" href="campaign.html?id=${c.id}">
            <img src="${c.cover}" alt="" onerror="this.src='${window.SpreadHopeData.fallbackImg(c.category)}'">
            <div><div class="t">${esc(c.title)}</div><div class="m">${esc(c.category)} · ${esc(c.location)}</div></div></a>`).join("")
        : `<div style="padding:16px;color:var(--slate-gray)">No campaigns match “${esc(q)}”. <a href="browse-campaigns.html" style="color:var(--harbor-teal);font-weight:600">Browse all →</a></div>`;
    };
    input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(runSearch, 160); });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { const first = results.querySelector("a"); if (first) location.href = first.href; else location.href = "browse-campaigns.html?q=" + encodeURIComponent(input.value); } });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeDrawer(); closeSearch(); }
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    });

    // header scroll behaviour — stays pinned to top, only gains a subtle shadow on scroll
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function renderFooter() {
    const groups = [
      { h: "Explore", links: [["browse-campaigns.html", "All stories"], ["browse-campaigns.html?sort=funded", "Top fundraisers"], ["how-it-works.html", "How it works"]] },
      { h: "Company", links: [["about.html", "About us"], ["contact.html", "Contact us"], ["contact.html", "Help center"]] },
      { h: "Legal", links: [["privacy.html", "Privacy policy"], ["terms.html", "Terms of service"]] },
    ];
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="wrap">
        <div class="footer-top">
          <div class="footer-brand">
            <a class="brand" href="index.html" aria-label="Spread Hope home"><img class="brand-namelogo" src="assets/img/logo-name.png" alt="Spread Hope" width="240" height="72"></a>
            <p>We connect real people with real stories to create real change.</p>
            <div class="footer-socials">
              <a href="#" aria-label="Instagram">${I.ig}</a>
              <a href="#" aria-label="Facebook">${I.fb}</a>
              <a href="#" aria-label="X">${I.x}</a>
            </div>
          </div>
          ${groups.map((g) => `<div class="footer-col"><h4>${g.h}</h4><ul>${g.links.map((l) => `<li><a href="${l[0]}">${l[1]}</a></li>`).join("")}</ul></div>`).join("")}
        </div>
        <div class="footer-bottom">
          <div>© 2026 Spread Hope. All rights reserved.</div>
          <div class="mini"><a href="terms.html">Terms</a><a href="privacy.html">Privacy</a><a href="contact.html">Contact</a></div>
        </div>
      </div>`;
    document.body.appendChild(footer);
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = qsa(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("in")); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Animate CareFlow progress bars when visible ---------- */
  function initProgress(root = document) {
    const fills = qsa(".careflow-fill", root);
    if (!("IntersectionObserver" in window)) { fills.forEach((f) => f.style.width = f.dataset.fill + "%"); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.style.width = e.target.dataset.fill + "%"; io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    fills.forEach((f) => io.observe(f));
  }

  /* ---------- Toast ---------- */
  let toastEl;
  function toast(msg, kind = "ok") {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.className = "toast " + (kind === "err" ? "err" : "");
    toastEl.innerHTML = (kind === "err" ? I.info : I.check) + "<span>" + esc(msg) + "</span>";
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  /* ---------- Web Share ---------- */
  function share(title, url) {
    url = url || location.href;
    if (navigator.share) { navigator.share({ title: "Spread Hope — " + title, url }).catch(() => {}); }
    else { navigator.clipboard.writeText(url).then(() => toast("Link copied to clipboard")); }
  }

  /* ---------- Reveal re-scan (for dynamically inserted cards) ---------- */
  function observeNew(root) {
    initReveal();
    initProgress(root);
  }

  /* ---------- Floating help / FAQ assistant ---------- */
  const HELP_FAQ = [
    { q: "How do donations work?", a: "Choose a campaign, select an amount, and complete your donation securely. After donating, you can share the campaign to help it reach more people." },
    { q: "Is my donation secure?", a: "Yes. Donations are processed through secure payment methods. The site should never expose sensitive payment information directly." },
    { q: "How can I know if a campaign is real?", a: "Look for verified story badges, organizer details, campaign updates, and clear information about how the funds will be used." },
    { q: "Can I share a campaign?", a: "Yes. Each campaign should include a share option so you can send it to friends, family, or social media and help increase its reach." },
    { q: "How do I start a fundraiser?", a: "Use the Start a Fundraiser option, follow the guided steps, add your story, goal, and images, then review your campaign before publishing." },
    { q: "Can I update my campaign after publishing?", a: "Yes. Campaign organizers should be able to post updates, improve their story, and keep supporters informed about progress." },
    { q: "Where does the money go?", a: "Funds should go toward the purpose described in the campaign. The campaign page should clearly show the organizer and explain how the donations will be used." },
    { q: "What if I need more help?", a: "If your question is not listed here, you can contact the support team through the Contact Us page." },
  ];

  function renderHelp() {
    const allowed = ["home", "browse", "campaign"];
    if (!allowed.includes(document.body.dataset.page || "")) return;

    const root = document.createElement("div");
    root.className = "help-widget";
    root.innerHTML = `
      <div class="help-panel" id="helpPanel" role="dialog" aria-modal="false" aria-labelledby="helpTitle">
        <div class="help-head">
          <div class="help-head-tx">
            <h2 id="helpTitle">How can we help?</h2>
            <p>Find quick answers about campaigns, donations, and support.</p>
          </div>
          <button type="button" class="help-close" id="helpClose" aria-label="Close help panel">${I.close}</button>
        </div>
        <div class="help-body">
          <ul class="help-faq">
            ${HELP_FAQ.map((f, i) => `
              <li class="help-item">
                <button type="button" class="help-q" id="helpQ${i}" aria-expanded="false" aria-controls="helpA${i}">
                  <span>${esc(f.q)}</span><i class="help-chev" aria-hidden="true">${I.chevronDown}</i>
                </button>
                <div class="help-a" id="helpA${i}" role="region" aria-labelledby="helpQ${i}"><div class="help-a-in"><p>${esc(f.a)}</p></div></div>
              </li>`).join("")}
          </ul>
        </div>
        <div class="help-foot">
          <b>Didn't find what you need?</b>
          <span>Our support team can help you with campaign, donation, or account questions.</span>
          <a class="help-contact-btn" href="contact.html">Contact us ${I.arrow}</a>
        </div>
      </div>
      <button type="button" class="help-fab" id="helpFab" aria-label="Open help and FAQ" aria-expanded="false" aria-controls="helpPanel">
        <span class="help-fab-ic">${I.help}</span><span class="help-fab-tx">Need help?</span>
      </button>`;
    document.body.appendChild(root);

    const fab = root.querySelector("#helpFab");
    const closeBtn = root.querySelector("#helpClose");
    const isOpen = () => root.classList.contains("open");
    const setOpen = (v) => {
      root.classList.toggle("open", v);
      fab.setAttribute("aria-expanded", v ? "true" : "false");
      if (v) setTimeout(() => closeBtn.focus(), 60);
    };

    fab.addEventListener("click", () => setOpen(!isOpen()));
    closeBtn.addEventListener("click", () => { setOpen(false); fab.focus(); });

    // single-open accordion
    qsa(".help-q", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".help-item");
        const wasOpen = item.classList.contains("is-open");
        qsa(".help-item.is-open", root).forEach((it) => {
          it.classList.remove("is-open");
          it.querySelector(".help-q").setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) { item.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });

    // close on Escape and on outside click
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) { setOpen(false); fab.focus(); } });
    document.addEventListener("click", (e) => { if (isOpen() && !root.contains(e.target)) setOpen(false); });
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderHeader();
    renderFooter();
    renderHelp();
    initReveal();
    initProgress();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.CW = { I, esc, money, moneyK, initials, qs, qsa, campaignCard, featuredCard, skeletonCard, toast, share, initReveal, initProgress, observeNew, lockScroll };
})();
