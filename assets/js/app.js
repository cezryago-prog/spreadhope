/* =====================================================================
   Spread Hope — Page controllers (dispatched by <body data-page>)
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SpreadHopeData;
  const { I, esc, money, moneyK, initials, qs, qsa, campaignCard, featuredCard, skeletonCard, toast, share, observeNew } = window.CW;
  const param = (k) => new URLSearchParams(location.search).get(k);

  const PAGES = {};

  /* =================================================================
     HOME
     ================================================================= */
  PAGES.home = function () {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- Hero background mosaic (mobile): a darkened "wall of campaigns" ---- */
    const mosaic = qs("#heroMosaic");
    if (mosaic) {
      const pics = [];
      D.all().forEach((c) => { if (c.cover) pics.push(c.cover); if (c.gallery && c.gallery[0]) pics.push(c.gallery[0]); });
      let h = "";
      for (let i = 0; i < 24; i++) {
        const raw = pics[i % pics.length] || D.fallbackImg("medical");
        const src = raw.replace(/([?&]w=)\d+/, "$1260");   // small tiles → lighter
        h += `<div class="mtile"><img src="${src}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/img/hero.png'"></div>`;
      }
      mosaic.innerHTML = h;
    }

    /* ---- Explore rail — horizontal center-focus carousel (focused card grows) ---- */
    const rail = qs("#exploreRail");
    if (rail) {
      const list = D.all().slice(0, 6);
      rail.innerHTML = list.map((c) => campaignCard(c)).join("") +
        `<a class="ccard end-card exp-end" href="browse-campaigns.html" aria-label="See all campaigns"><div class="end-inner"><div class="end-ic">${I.arrow}</div><div class="end-t">See all<br>campaigns</div><div class="end-sub">Explore every fundraiser</div></div></a>`;
      rail.removeAttribute("aria-busy");
      qsa("#exploreRail .ccard").forEach((x) => x.classList.remove("reveal"));
      qsa("#exploreRail .careflow-fill").forEach((f) => { f.style.setProperty("--fill", f.dataset.fill + "%"); });
      initCarousels();
    }

    /* ---- "A story of hope" — center-focus peek carousel, auto-advance 3s ---- */
    const track = qs("#sohTrack");
    if (track) {
      const camps = [D.featured(), ...D.active(4)].filter(Boolean);
      const slide = (c) => {
        const p = D.pct(c);
        return `
        <a class="soh-slide" href="campaign.html?id=${c.id}">
          <div class="soh-media"><span class="heart">${I.heart}</span><img src="${c.cover}" alt="${esc(c.title)}" loading="lazy" onerror="this.onerror=null;this.src='${D.fallbackImg(c.category)}'"></div>
          <div class="soh-body">
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.blurb)}</p>
            <div class="soh-nums"><span class="r">${money(c.raised)}</span><span class="g">of ${money(c.goal)}</span></div>
            <div class="careflow"><div class="careflow-track"><div class="careflow-fill" data-fill="${p}"></div></div></div>
            <div class="soh-pct">${p}% funded</div>
            <span class="btn btn-primary btn-block">Support this story ${I.arrow}</span>
          </div>
        </a>`;
      };
      const more = `<a class="soh-slide soh-more" href="browse-campaigns.html">
        <div class="soh-more-in"><span class="soh-more-ic">${I.arrow}</span><span class="soh-more-t">Explore more stories</span><span class="soh-more-sub">See all fundraisers</span></div></a>`;
      track.innerHTML = camps.map(slide).join("") + more;

      const slides = qsa(".soh-slide", track);
      const dotsWrap = qs("#sohDots");
      const vp = track.parentElement;
      let active = 0, timer = null;

      const center = () => {
        const el = slides[active];
        const offset = el.offsetLeft - (vp.clientWidth - el.clientWidth) / 2;
        track.style.transform = `translateX(${-offset}px)`;
        slides.forEach((s, i) => s.classList.toggle("is-active", i === active));
        if (dotsWrap) qsa("button", dotsWrap).forEach((d, i) => d.classList.toggle("on", i === active));
        const fill = el.querySelector(".careflow-fill");
        if (fill && fill.dataset.fill) fill.style.width = fill.dataset.fill + "%";
      };
      const start = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => { active = (active + 1) % slides.length; center(); }, 3000); };
      const stop = () => clearInterval(timer);
      const go = (i) => { active = (i + slides.length) % slides.length; center(); start(); };

      if (dotsWrap) {
        dotsWrap.innerHTML = slides.map((_, i) => `<button class="${i === 0 ? "on" : ""}" aria-label="Story ${i + 1}"></button>`).join("");
        qsa("button", dotsWrap).forEach((d, i) => d.addEventListener("click", () => go(i)));
      }
      // swipe
      let sx = null;
      track.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; stop(); }, { passive: true });
      track.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 40) active = (active + (dx < 0 ? 1 : -1) + slides.length) % slides.length; center(); start(); }, { passive: true });
      // pause on hover (desktop)
      vp.addEventListener("mouseenter", stop);
      vp.addEventListener("mouseleave", start);
      window.addEventListener("resize", center, { passive: true });

      requestAnimationFrame(() => { center(); requestAnimationFrame(center); });
      start();
    }

    initHowItWorks();

    /* ---- background grass videos — play while in view, pause off-screen (autoplay fallback) ---- */
    if (!reduce) {
      const playInView = (v) => {
        if (!v) return;
        v.muted = true;
        const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
        if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) tryPlay(); else v.pause(); }), { threshold: 0.12 }).observe(v);
        else tryPlay();
      };
      playInView(qs(".nh-final-video"));   // final CTA (both viewports)
      playInView(qs(".nh-how-video"));     // how-it-works (mobile only; display:none on desktop won't intersect)
    }

    observeNew();
  };

  /* =================================================================
     HOW IT WORKS — interactive donation-journey walkthrough
     intro → animated device (phone on mobile / browser on desktop) plays
     5 steps with precise taps; ends on a Replay overlay (no auto-loop).
     ================================================================= */
  function initHowItWorks() {
    const stage = qs("#hiwStage");
    if (!stage) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DWELL = 3800; // ms each step holds during autoplay
    const STEPS = [
      { t: "Find a campaign", d: "Browse verified stories by cause and pick one that speaks to you." },
      { t: "Open the story", d: "See the photos, the goal and the progress — then tap Donate, right on the page." },
      { t: "Choose your amount", d: "Pick how much to give. Every cent goes straight toward the cause." },
      { t: "Confirm securely", d: "Review and confirm — your gift is protected and sent in seconds." },
      { t: "Share to help more", d: "Share the campaign so the story reaches even more people who can help." },
    ];
    const total = STEPS.length;

    // a real campaign keeps the mockup genuine
    const c = D.featured() || D.all()[0];
    const pct = D.pct(c);
    const cover = c.cover;
    const fb = D.fallbackImg(c.category);
    const list = D.all();
    const onerr = `onerror="this.onerror=null;this.src='${fb}'"`;
    const refresh = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const browseCard = (idx, cls) => {
      const cc = list[idx % list.length] || c;
      const p = D.pct(cc);
      return `<div class="sb-card ${cls || ""}">
        <span class="sb-card-img"><img src="${cc.cover}" alt="" loading="lazy" ${onerr}><i class="sb-card-cat">${esc(cc.category)}</i></span>
        <span class="sb-card-tx">
          <b>${esc(cc.title)}</b>
          <i class="sb-card-bar"><span style="width:${p}%"></span></i>
          <em class="sb-card-meta">${moneyK(cc.raised)} · ${p}%</em>
        </span>
      </div>`;
    };

    const screens = [
      // 0 — Browse campaigns (richer listing)
      `<div class="hiw-scr scr-browse">
        <div class="sb-top"><span class="sb-title">Discover campaigns</span><span class="sb-ic">${I.search}</span></div>
        <div class="sb-search"><span class="sb-search-ic">${I.search}</span><span class="sb-typed">medical care</span><i class="sb-caret"></i></div>
        <div class="sb-chips"><span class="sb-chip on">Medical</span><span class="sb-chip">Education</span><span class="sb-chip">Emergency</span><span class="sb-chip">Family</span><span class="sb-chip">Animals</span></div>
        <div class="sb-grid">${browseCard(0)}${browseCard(1, "pick")}${browseCard(2)}${browseCard(3)}${browseCard(4)}${browseCard(5)}</div>
      </div>`,

      // 1 — Campaign page (Donate happens here)
      `<div class="hiw-scr scr-camp">
        <div class="sc-media"><img src="${cover}" alt="${esc(c.title)}" loading="lazy" ${onerr}><span class="sc-cat">${esc(c.category)}</span><span class="sc-heart">${I.heart}</span></div>
        <div class="sc-body">
          <h4 class="sc-title">${esc(c.title)}</h4>
          <p class="sc-desc">${esc(c.blurb)}</p>
          <div class="sc-stats"><b>${money(c.raised)}</b><span>raised of ${money(c.goal)}</span><i class="sc-pct">${pct}%</i></div>
          <div class="sc-bar"><span data-fill="${pct}"></span></div>
          <button class="sc-donate" type="button">Donate now ${I.heart}</button>
        </div>
      </div>`,

      // 2 — Choose your amount (fixed amounts, no custom)
      `<div class="hiw-scr scr-amount">
        <div class="sa-head"><b>Choose your support</b><small>Every gift goes to ${esc(c.organizer.name)}</small></div>
        <div class="sa-grid">
          <span class="sa-amt">$10</span><span class="sa-amt">$25</span><span class="sa-amt pick">$50</span>
          <span class="sa-amt">$100</span><span class="sa-amt">$500</span><span class="sa-amt">$1,000</span>
        </div>
        <div class="sa-summary">You're giving <b>$50</b> to <span>${esc(c.title)}</span></div>
        <button class="sc-donate" type="button">Continue ${I.arrow}</button>
      </div>`,

      // 3 — Confirm securely (success)
      `<div class="hiw-scr scr-confirm">
        <div class="sf-check" aria-hidden="true"><svg viewBox="0 0 52 52"><circle class="sf-c" cx="26" cy="26" r="23" fill="none"/><path class="sf-k" fill="none" d="M15 27l8 8 15-16"/></svg></div>
        <div class="sf-t">Donation confirmed</div>
        <div class="sf-amt">$50 to ${esc(c.title)}</div>
        <div class="sf-secure">${I.shield}<span>Sent securely · funds go directly to the cause</span></div>
        <span class="sf-spark s1"></span><span class="sf-spark s2"></span><span class="sf-spark s3"></span><span class="sf-spark s4"></span>
      </div>`,

      // 4 — Share the campaign (preview card + 5 share options)
      `<div class="hiw-scr scr-share">
        <div class="ss-head"><b>Thank you — now spread hope</b><small>Sharing helps this story reach more people.</small></div>
        <div class="ss-preview">
          <span class="ss-prev-img"><img src="${cover}" alt="" loading="lazy" ${onerr}></span>
          <span class="ss-prev-tx"><b>${esc(c.title)}</b><i class="ss-prev-bar"><span style="width:${pct}%"></span></i><em>${money(c.raised)} raised · ${pct}%</em></span>
        </div>
        <div class="ss-row">
          <span class="ss-btn b-copy">${I.copy}<em>Copy link</em></span>
          <span class="ss-btn b-wa">${I.wa}<em>WhatsApp</em></span>
          <span class="ss-btn b-fb">${I.fb}<em>Facebook</em></span>
          <span class="ss-btn b-tw">${I.x}<em>Twitter</em></span>
          <span class="ss-btn b-ig">${I.ig}<em>Instagram</em></span>
        </div>
      </div>`,
    ];

    const endHTML = `<div class="hiw-end" id="hiwEnd" aria-hidden="true">
      <div class="hiw-end-ic">${I.check}</div>
      <div class="hiw-end-t">That's the whole journey</div>
      <div class="hiw-end-d">Find a story, give securely, and spread hope.</div>
      <button class="hiw-end-btn" id="hiwReplayScreen" type="button">${refresh}Replay walkthrough</button>
    </div>`;

    const screensEl = qs("#hiwScreens");
    screensEl.innerHTML = screens.join("") + `<span class="hiw-tap" aria-hidden="true"></span>` + endHTML;

    const scrEls = qsa(".hiw-scr", screensEl);
    const tapEl = qs(".hiw-tap", screensEl);
    const endEl = qs("#hiwEnd");
    const device = qs("#hiwDevice");
    const progress = qs("#hiwProgress");
    const numEl = qs("#hiwNum");
    const titleEl = qs("#hiwTitle");
    const descEl = qs("#hiwDesc");
    const playBtn = qs("#hiwPlay");
    const playLabel = qs(".hiw-play-label", playBtn);
    const intro = qs("#hiwIntro");
    const demo = qs("#hiwDemo");

    // segmented progress (one per step, doubles as step navigation)
    progress.innerHTML = STEPS.map((s, n) => `<button class="hiw-seg" type="button" data-i="${n}" aria-label="${esc(s.t)}"><span class="hiw-seg-fill"></span></button>`).join("");
    const segs = qsa(".hiw-seg", progress).map((b) => ({ btn: b, fill: qs(".hiw-seg-fill", b) }));

    let i = 0, playing = false, timer = null, tapTimer = null, finished = false;

    function syncHeight() {
      const h = stage.classList.contains("show-demo") ? demo.offsetHeight : intro.offsetHeight;
      stage.style.minHeight = h + "px";
    }

    /* ---- precise tap / highlight per step ---- */
    function targetFor(n) {
      const s = scrEls[n];
      if (n === 0) return qs(".sb-card.pick", s);
      if (n === 1) return qs(".sc-donate", s);
      if (n === 2) return qs(".sa-amt.pick", s);
      if (n === 4) return qs(".ss-btn.b-copy", s);
      return null;
    }
    function markFor(n) {
      const s = scrEls[n];
      if (n === 0) qs(".sb-card.pick", s)?.classList.add("is-sel");
      if (n === 1) qs(".sc-donate", s)?.classList.add("is-press");
      if (n === 2) qs(".sa-amt.pick", s)?.classList.add("is-sel");
      if (n === 4) qs(".ss-btn.b-copy", s)?.classList.add("is-press");
    }
    function clearMarks() {
      qsa(".is-sel, .is-press", screensEl).forEach((e) => e.classList.remove("is-sel", "is-press"));
    }
    function pointAt(target, click) {
      if (!target) { tapEl.classList.remove("show", "click"); return; }
      const sr = screensEl.getBoundingClientRect(), tr = target.getBoundingClientRect();
      tapEl.style.left = (tr.left - sr.left + tr.width / 2) + "px";
      tapEl.style.top = (tr.top - sr.top + tr.height / 2) + "px";
      tapEl.classList.add("show");
      if (click) { tapEl.classList.remove("click"); void tapEl.offsetWidth; tapEl.classList.add("click"); }
    }

    /* ---- segmented progress ---- */
    function paintSegs() {
      segs.forEach((s, n) => {
        if (n === i) return; // current handled separately
        s.fill.style.transition = "width .35s var(--ease)";
        s.fill.style.width = (n < i ? 100 : 0) + "%";
        s.btn.classList.toggle("on", false);
      });
      segs[i].btn.classList.add("on");
    }
    function fillCurrentSeg(animate) {
      const f = segs[i].fill;
      if (playing && animate && !reduce) {
        f.style.transition = "none"; f.style.width = "0%";
        void f.offsetWidth;
        f.style.transition = `width ${DWELL}ms linear`; f.style.width = "100%";
      } else {
        f.style.transition = "width .35s var(--ease)"; f.style.width = "100%";
      }
    }
    function freezeSeg() {
      const f = segs[i].fill, w = getComputedStyle(f).width;
      f.style.transition = "none"; f.style.width = w;
    }

    /* ---- render a step ---- */
    function show(n, animate) {
      clearTimeout(tapTimer);
      clearMarks();
      tapEl.classList.remove("show", "click");
      i = Math.max(0, Math.min(total - 1, n));
      scrEls.forEach((s, n2) => s.classList.toggle("on", n2 === i));
      numEl.textContent = i + 1;
      titleEl.textContent = STEPS[i].t;
      descEl.textContent = STEPS[i].d;
      paintSegs();
      fillCurrentSeg(animate);
      // animate the campaign progress bar when its screen shows
      const sb = scrEls[i].querySelector("[data-fill]");
      if (sb) { sb.style.width = "0%"; requestAnimationFrame(() => { sb.style.width = sb.dataset.fill + "%"; }); }
      // schedule the precise tap + highlight for this step
      const target = targetFor(i);
      if (target && !reduce) {
        const delay = playing ? DWELL * 0.45 : 620;
        tapTimer = setTimeout(() => { pointAt(target, true); markFor(i); }, delay);
      } else if (target && reduce) {
        markFor(i);
      }
    }

    /* ---- playback ---- */
    function setPlayUI(on) {
      playBtn.classList.toggle("paused", !on);
      playBtn.setAttribute("aria-label", on ? "Pause walkthrough" : "Play walkthrough");
      if (playLabel) playLabel.textContent = on ? "Pause" : "Play";
    }
    function schedule() {
      clearTimeout(timer);
      if (!playing || reduce) return;
      timer = setTimeout(() => { if (i >= total - 1) finish(); else { show(i + 1, true); schedule(); } }, DWELL);
    }
    function exitFinished() {
      if (!finished) return;
      finished = false;
      device.classList.remove("is-finished");
      endEl.setAttribute("aria-hidden", "true");
    }
    function play() {
      if (finished) { exitFinished(); i = 0; }
      playing = true; setPlayUI(true);
      show(i, true); schedule();
    }
    function pause() {
      playing = false; setPlayUI(false);
      clearTimeout(timer); freezeSeg();
    }
    function finish() {
      finished = true; playing = false;
      clearTimeout(timer); clearTimeout(tapTimer);
      setPlayUI(false);
      tapEl.classList.remove("show", "click");
      segs.forEach((s) => { s.fill.style.transition = "width .35s var(--ease)"; s.fill.style.width = "100%"; });
      device.classList.add("is-finished");
      endEl.setAttribute("aria-hidden", "false");
    }

    /* ---- open / close ---- */
    function open() {
      if (!stage.classList.contains("show-demo")) {
        stage.classList.add("show-demo");
        intro.setAttribute("aria-hidden", "true");
        demo.setAttribute("aria-hidden", "false");
        qs("#hiwStart").setAttribute("aria-expanded", "true");
        syncHeight();
      }
      exitFinished(); i = 0;
      if (reduce) { playing = false; setPlayUI(false); show(0, false); }
      else play();
      const top = stage.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }
    function close() {
      stage.classList.remove("show-demo");
      intro.setAttribute("aria-hidden", "false");
      demo.setAttribute("aria-hidden", "true");
      qs("#hiwStart").setAttribute("aria-expanded", "false");
      pause();
      syncHeight();
    }

    /* ---- wire controls ---- */
    qs("#hiwStart").addEventListener("click", open);
    qs("#hiwClose").addEventListener("click", close);
    qs("#hiwNext").addEventListener("click", () => { if (finished) return; if (i >= total - 1) finish(); else { pause(); show(i + 1, false); } });
    qs("#hiwPrev").addEventListener("click", () => { exitFinished(); pause(); show(i - 1, false); });
    playBtn.addEventListener("click", () => { if (finished || !playing) play(); else pause(); });
    qs("#hiwReplayScreen").addEventListener("click", play);
    segs.forEach((s) => s.btn.addEventListener("click", () => { exitFinished(); pause(); show(+s.btn.dataset.i, false); }));

    // keyboard nav while focused inside the demo
    demo.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { if (i >= total - 1) finish(); else { pause(); show(i + 1, false); } }
      else if (e.key === "ArrowLeft") { exitFinished(); pause(); show(i - 1, false); }
    });

    // pause autoplay while the section is off-screen
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (!stage.classList.contains("show-demo") || finished) return;
          if (e.isIntersecting) { if (playing) schedule(); }
          else { clearTimeout(timer); freezeSeg(); }
        });
      }, { threshold: 0.25 });
      io.observe(demo);
    }

    // prime first screen (correct if opened with reduced motion)
    show(0, false);
    syncHeight();
    window.addEventListener("load", syncHeight);
    window.addEventListener("resize", syncHeight, { passive: true });
  }

  /* Carousel focus — the framed (leftmost in-view) card scales up; others shrink.
     Updates as the user swipes the row or scrolls the section into view. */
  function initCarousels() {
    qsa(".hscroll").forEach((track) => {
      const cards = qsa(".ccard", track);
      if (!cards.length) return;
      let raf = 0;
      const update = () => {
        raf = 0;
        const tr = track.getBoundingClientRect();
        let best = null, bestDist = Infinity;
        cards.forEach((card) => {
          const cr = card.getBoundingClientRect();
          const inFrame = cr.right > tr.left + cr.width * 0.35 && cr.left < tr.right - cr.width * 0.35;
          const dist = Math.abs(cr.left - tr.left); // distance of card's left edge from the frame's left
          if (inFrame && dist < bestDist) { bestDist = dist; best = card; }
        });
        cards.forEach((c) => c.classList.toggle("is-active", c === best));
      };
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
      track.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      update();
    });
  }

  /* CareFlow animation — synced step cards + mockup */
  function initCareFlow() {
    const mock = qs("#careflow");
    if (!mock) return;
    const stepCards = qsa("[data-step]");
    const chips = qsa(".flow-chip", mock);
    const donate = qs(".flow-donate", mock);
    const confirm = qs(".flow-confirm", mock);
    const fill = qs(".careflow-fill", mock);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // faux cursor that points to where the user would tap
    const flowCard = qs(".flow-card", mock);
    let cursor = null, clickT = null;
    if (flowCard && !reduce) {
      cursor = document.createElement("div");
      cursor.className = "flow-cursor";
      flowCard.appendChild(cursor);
    }
    const moveCursor = (el) => {
      if (!cursor || !el) return;
      const fc = flowCard.getBoundingClientRect(), tr = el.getBoundingClientRect();
      const x = tr.left - fc.left + tr.width / 2 - 11;
      const y = tr.top - fc.top + tr.height / 2 - 11;
      cursor.classList.add("show");
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      clearTimeout(clickT);
      clickT = setTimeout(() => { cursor.classList.add("click"); setTimeout(() => cursor.classList.remove("click"), 600); }, 850);
    };

    let stage = 0;
    function setStage(s) {
      stage = s % 4;
      stepCards.forEach((c) => c.classList.toggle("active", +c.dataset.step === stage));
      if (stage === 0) { chips.forEach((c) => c.classList.remove("sel")); donate.classList.remove("armed"); confirm.classList.remove("show"); fill.style.width = "32%"; if (cursor) cursor.classList.remove("show"); }
      if (stage === 1) { chips.forEach((c, i) => c.classList.toggle("sel", i === 1)); donate.classList.add("armed"); moveCursor(chips[1]); }
      if (stage === 2) { donate.textContent = "Thank you ♥"; fill.style.width = "58%"; moveCursor(donate); }
      if (stage === 3) { confirm.classList.add("show"); if (cursor) cursor.classList.remove("show"); }
      if (stage === 0) donate.textContent = "Choose an amount";
    }

    setStage(0);
    if (reduce) { stepCards.forEach((c) => c.classList.add("active")); return; }
    let timer;
    const play = () => { timer = setInterval(() => setStage(stage + 1), 2200); };
    // start only when visible
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) play(); else clearInterval(timer); });
    }, { threshold: 0.3 });
    io.observe(mock);

    // allow manual step via clicking step cards
    stepCards.forEach((c) => c.addEventListener("click", () => { clearInterval(timer); setStage(+c.dataset.step); play(); }));
  }

  /* =================================================================
     BROWSE
     ================================================================= */
  PAGES.browse = function () {
    const grid = qs("#browseGrid");
    const pager = qs("#pagination");
    const searchInput = qs("#browseSearch");
    const catChips = qs("#catChips");
    const sortSelect = qs("#sortSelect");
    const sheet = qs("#filterSheet");
    const sheetBackdrop = qs("#sheetBackdrop");
    const empty = qs("#emptyState");

    const state = {
      q: param("q") || "",
      category: param("category") || "All",
      status: param("status") || "any",
      sort: param("sort") || "recent",
      page: 1,
      perPage: 4,
    };
    if (searchInput) searchInput.value = state.q;

    /* ---- inline category chips ---- */
    if (catChips) {
      catChips.innerHTML = D.categories.map((c) => `<button class="bc-chip ${c === state.category ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
      qsa(".bc-chip", catChips).forEach((b) => b.addEventListener("click", () => {
        state.category = b.dataset.cat; state.page = 1;
        qsa(".bc-chip", catChips).forEach((x) => x.classList.toggle("on", x === b));
        sync(); load();
      }));
    }

    /* ---- sort dropdown ("Newest" etc.) ---- */
    const sortLabels = { recent: "Newest", supported: "Most funded", urgent: "Urgent first" };
    if (sortSelect) {
      sortSelect.innerHTML = D.sorts.map((s) => `<option value="${s.key}" ${s.key === state.sort ? "selected" : ""}>${esc(sortLabels[s.key] || s.label)}</option>`).join("");
      sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; state.page = 1; sync(); load(); });
    }

    /* ---- search ---- */
    let st;
    if (searchInput) searchInput.addEventListener("input", () => { clearTimeout(st); st = setTimeout(() => { state.q = searchInput.value.trim(); state.page = 1; sync(); load(); }, 280); });

    /* ---- advanced filter drawer (status) behind the filter icon ---- */
    let draft = { ...state };
    function buildSheet() {
      const body = qs("#sheetBody");
      if (!body) return;
      const groupHTML = (title, opts, current, gkey) => `
        <div class="fgroup"><h4>${title}</h4><div class="fopts">${opts.map((o) => {
          const key = typeof o === "string" ? o : o.key;
          const label = typeof o === "string" ? o : o.label;
          return `<button class="fopt ${current === key ? "sel" : ""}" data-group="${gkey}" data-key="${key}">${label}</button>`;
        }).join("")}</div></div>`;
      body.innerHTML = groupHTML("Category", D.categories, draft.category, "category") + groupHTML("Status", D.statuses, draft.status, "status");
      qsa(".fopt", body).forEach((b) => b.addEventListener("click", () => {
        const g = b.dataset.group;
        qsa(`.fopt[data-group="${g}"]`, body).forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        draft[g] = b.dataset.key;
      }));
    }
    const filterBtn = qs("#filterToggle");
    const openSheet = () => { draft = { ...state }; buildSheet(); sheet.classList.add("open"); sheetBackdrop.classList.add("open"); window.CW.lockScroll(true); };
    const closeSheet = () => { sheet.classList.remove("open"); sheetBackdrop.classList.remove("open"); window.CW.lockScroll(false); };
    if (filterBtn) filterBtn.addEventListener("click", openSheet);
    if (sheetBackdrop) sheetBackdrop.addEventListener("click", closeSheet);
    qs("#sheetClose")?.addEventListener("click", closeSheet);
    qs("#sheetApply")?.addEventListener("click", () => {
      Object.assign(state, { category: draft.category, status: draft.status }); state.page = 1;
      qsa(".bc-chip", catChips).forEach((x) => x.classList.toggle("on", x.dataset.cat === state.category));
      closeSheet(); sync(); load();
    });
    qs("#sheetClear")?.addEventListener("click", () => { draft.category = "All"; draft.status = "any"; buildSheet(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

    function sync() {
      const u = new URLSearchParams();
      if (state.q) u.set("q", state.q);
      if (state.category !== "All") u.set("category", state.category);
      if (state.status !== "any") u.set("status", state.status);
      if (state.sort !== "recent") u.set("sort", state.sort);
      history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
    }

    /* ---- horizontal list card (image left, content right) ---- */
    function listCard(c) {
      const p = D.pct(c);
      return `
      <a class="bc-card reveal" href="campaign.html?id=${c.id}">
        <div class="bc-card-img">
          <span class="bc-heart" aria-hidden="true">${I.heart}</span>
          <img src="${c.cover}" alt="${esc(c.title)}" loading="lazy" onerror="this.onerror=null;this.src='${D.fallbackImg(c.category)}'">
        </div>
        <div class="bc-card-body">
          <h3>${esc(c.title)}</h3>
          <p>${esc(c.blurb)}</p>
          <div class="bc-card-nums"><span class="r">${money(c.raised)} <i>raised</i></span><span class="g">${money(c.goal)} <i>goal</i></span></div>
          <div class="bc-card-bar"><div class="careflow"><div class="careflow-track"><div class="careflow-fill" data-fill="${p}"></div></div></div><span class="bc-card-pct">${p}%</span></div>
        </div>
      </a>`;
    }

    function skeletons() {
      grid.setAttribute("aria-busy", "true");
      grid.innerHTML = Array.from({ length: state.perPage }).map(() => `
        <div class="bc-card bc-skel ghost"><div class="skel bc-card-img sk-soft"></div>
        <div class="bc-card-body"><div class="skel skel-line" style="width:65%;height:18px"></div>
        <div class="skel skel-line" style="width:95%"></div><div class="skel skel-line" style="width:80%"></div>
        <div class="skel skel-line" style="width:100%;height:8px;margin-top:14px"></div></div></div>`).join("");
      pager.innerHTML = "";
    }

    async function load() {
      skeletons();
      const res = await D.list(state);
      grid.removeAttribute("aria-busy");
      if (!res.items.length) {
        grid.innerHTML = ""; empty.classList.remove("hide"); pager.innerHTML = ""; return;
      }
      empty.classList.add("hide");
      grid.innerHTML = res.items.map(listCard).join("");
      observeNew(grid);
      // pagination — dots + "swipe to see more" hint
      if (res.pages > 1) {
        let dots = "";
        for (let i = 1; i <= res.pages; i++) dots += `<button class="${i === state.page ? "on" : ""}" data-pg="${i}" aria-label="Page ${i}"></button>`;
        pager.innerHTML = `<div class="bc-dots">${dots}</div>
          <div class="bc-pager-hint">
            <button class="bc-pg-arrow" data-pg="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Previous">${I.chevron.replace('d="m9 6 6 6-6 6"', 'd="m15 6-6 6 6 6"')}</button>
            <span>Swipe to see more campaigns</span>
            <button class="bc-pg-arrow" data-pg="${state.page + 1}" ${state.page === res.pages ? "disabled" : ""} aria-label="Next">${I.arrow}</button>
          </div>`;
        qsa("[data-pg]", pager).forEach((b) => b.addEventListener("click", () => {
          if (b.disabled) return;
          state.page = +b.dataset.pg; load();
          window.scrollTo({ top: grid.offsetTop - 110, behavior: "smooth" });
        }));
      } else pager.innerHTML = "";
    }

    qs("#emptyClear")?.addEventListener("click", () => {
      state.q = ""; state.category = "All"; state.status = "any"; state.sort = "recent"; state.page = 1;
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "recent";
      qsa(".bc-chip", catChips).forEach((x) => x.classList.toggle("on", x.dataset.cat === "All"));
      sync(); load();
    });

    load();
  };

  /* =================================================================
     CAMPAIGN DETAIL
     ================================================================= */
  PAGES.campaign = function () {
    const id = param("id");
    const root = qs("#campaignRoot");
    root.setAttribute("aria-busy", "true");
    root.innerHTML = skeletonDetail();

    D.get(id).then((c) => {
      if (!c) { location.replace("404.html"); return; }
      document.title = `${c.title} · Spread Hope`;
      renderDetail(c);
      root.removeAttribute("aria-busy");
    });

    // ghost that mirrors the real editorial hero + fund card + story/organizer/supporters/related
    function skeletonDetail() {
      const ln = (w, h) => `<div class="skel sk-text" style="width:${w};${h ? "height:" + h + ";" : ""}"></div>`;
      const fund = `<div class="gd-fund">
          ${ln("40%", "13px")}
          <div class="gd-row" style="justify-content:space-between;align-items:flex-end">
            <div style="flex:1"><div class="skel sk-title" style="width:55%;height:30px"></div></div>
            <div class="skel sk-text" style="width:48px;height:20px"></div>
          </div>
          <div class="skel sk-bar" style="width:100%"></div>
          <div class="skel sk-btn" style="width:100%"></div>
          <div class="skel sk-btn" style="width:100%;height:46px"></div>
        </div>`;
      return `<div class="ghost">
        <div class="skel gd-hero sk-soft"></div>
        <div class="gd-wrap">
          <div class="gd-cols">
            <div class="gd-panel">
              <div class="skel sk-pill" style="width:96px"></div>
              <div class="skel sk-title" style="width:88%;height:30px"></div>
              <div class="skel sk-title" style="width:64%;height:30px"></div>
              ${ln("96%")}${ln("90%")}${ln("70%")}
              <div class="gd-row" style="align-items:center;margin-top:6px">
                <div class="skel sk-circle" style="width:44px;height:44px"></div>
                <div style="flex:1;display:flex;flex-direction:column;gap:8px">${ln("50%")}${ln("32%")}</div>
              </div>
            </div>
            ${fund}
          </div>
          <div class="gd-block">
            <div class="skel sk-title" style="width:42%"></div>
            ${ln("100%")}${ln("97%")}${ln("99%")}${ln("80%")}
          </div>
          <div class="gd-card">
            <div class="gd-row" style="align-items:center">
              <div class="skel sk-circle" style="width:54px;height:54px"></div>
              <div style="flex:1;display:flex;flex-direction:column;gap:9px">${ln("45%")}${ln("28%")}</div>
            </div>
            ${ln("90%")}
          </div>
          <div class="gd-block">
            <div class="skel sk-title" style="width:48%"></div>
            <div class="gd-thumbs">
              <div class="skel gd-thumb sk-soft"></div><div class="skel gd-thumb sk-soft"></div>
            </div>
          </div>
        </div>
      </div>`;
    }

    function renderDetail(c) {
      const p = D.pct(c);
      const gallery = (c.gallery && c.gallery.length ? c.gallery : [c.cover]);
      // hero carousel slides: a "card" slide (plain dark bg) after every complete PAIR of photos
      // (e.g. photo, photo, card, photo, photo, card … — a trailing lone photo gets no card)
      // desktop = contained 2-col editorial hero (photos only); mobile keeps the
      // full-bleed carousel that intersperses an info "card" slide after every pair
      const isDesk = matchMedia("(min-width: 861px)").matches;
      const heroSlides = [];
      gallery.forEach((src, i) => {
        heroSlides.push({ type: "photo", src });
        if (!isDesk && (i + 1) % 2 === 0) heroSlides.push({ type: "card" });
      });
      const story = [].concat(c.story.the_story || [], c.story.why || [], c.story.how || [], c.story.note || []);
      const allSup = allSupporters(c);
      const topSupporters = allSup.slice(0, 5);
      const atRank = (s) => { const m = /(\d+)\s*(h|d|w|mo)/.exec(s || ""); if (!m) return 1e9; return +m[1] * (m[2] === "h" ? 1 : m[2] === "d" ? 24 : m[2] === "w" ? 168 : 720); };
      const recentSupporters = allSup.slice().sort((a, b) => atRank(a.at) - atRank(b.at)).slice(0, 5);
      const messages = (c.supporters || []).filter((s) => s.message);
      const related = D.all().filter((x) => x.id !== c.id).sort((a, b) => D.pct(b) - D.pct(a)).slice(0, 6);

      const supRow = (d) => `<div class="cd-sup-row">
        <span class="cd-sup-av">${initials(d.name)}</span>
        <span class="cd-sup-name">${esc(d.name)}</span>
        <span class="cd-sup-amt">${money(d.amount)}</span>
      </div>`;

      root.innerHTML = `
      <!-- 2 + 3. hero carousel (photos + story slides) + verification badge -->
      <section class="cd-hero">
        <div class="cd-hero-media">
        <div class="cd-hero-stage">
          ${heroSlides.map((s, i) => s.type === "card"
            ? `<div class="cd-hero-slide cd-hero-cardslide${i === 0 ? " on" : ""}" data-i="${i}">
            <div class="cd-hcard">
              <h2 class="cd-hcard-title">${esc(c.title)}</h2>
              ${c.blurb ? `<p class="cd-hcard-desc">${esc(c.blurb)}</p>` : ""}
              <div class="cd-hcard-stats">
                <div class="cd-hcard-stat"><b>${money(c.raised)}</b><span>Raised</span></div>
                <div class="cd-hcard-stat"><b>${p}%</b><span>Funded</span></div>
                <div class="cd-hcard-stat"><b>${c.donors.toLocaleString("en-US")}</b><span>Supporters</span></div>
              </div>
              <button class="cd-hcard-btn" id="heroSupport">Support this fundraiser ${I.arrow}</button>
            </div>
          </div>`
            : `<div class="cd-hero-slide${i === 0 ? " on" : ""}" data-i="${i}">
            <img class="cd-hero-img" src="${s.src}" alt="${esc(c.title)}" loading="eager" decoding="async" onerror="this.onerror=null;this.src='assets/img/hero.png'">
          </div>`).join("")}
        </div>
        <span class="cd-verified">${c.verified ? I.checkBadge : I.shield}${esc(c.organizer.name)}</span>
        <div class="cd-hero-titlebar"><span class="cd-hero-cat2">${esc(c.category)}</span><div class="cd-hero-h1">${esc(c.title)}</div></div>
        ${heroSlides.length > 1 ? `<div class="cd-hero-dots">${heroSlides.map((g, i) => `<button class="${i === 0 ? "on" : ""}" data-i="${i}" aria-label="View slide ${i + 1}"></button>`).join("")}</div>` : ""}
        </div><!-- /cd-hero-media -->

        <div class="cd-hero-panel">
          <div class="cd-hero-head">
            <span class="cd-cat">${esc(c.category)}</span>
            <h1 class="cd-hero-h1d">${esc(c.title)}</h1>
            ${c.blurb ? `<p class="cd-hero-lead">${esc(c.blurb)}</p>` : ""}
            <div class="cd-hero-org">${c.verified ? I.checkBadge : I.shield}<span>by <b>${esc(c.organizer.name)}</b>${c.location ? ` · ${esc(c.location)}` : ""}</span></div>
          </div>
          <div class="cd-fund">
            <div class="cd-fund-top">
              <div class="cd-fund-amt">
                <div class="cd-fund-raised">${money(c.raised)}</div>
                <div class="cd-fund-goal">raised of <b>${money(c.goal)}</b> goal</div>
              </div>
              <div class="cd-fund-pct">${p}%</div>
            </div>
            <div class="careflow cd-fund-bar"><div class="careflow-track"><div class="careflow-fill" data-fill="${p}"></div></div></div>
            ${(() => { const jd = recentSupporters.find((s) => s.name && s.name !== "Anonymous") || recentSupporters[0]; return jd ? `<div class="cd-fund-recent">${I.heart}<span class="cd-recent-name"><b>${esc(jd.name)}</b> just donated</span></div>` : ""; })()}
            <button class="btn cd-donate btn-block" id="donateBtn">Donate now</button>
            <button class="btn cd-share btn-block" id="shareBtn">Share this campaign</button>
          </div>
        </div>
      </section>

      <div class="cd-sheet">
        <div class="cd-sheet-video-wrap" aria-hidden="true">
          <video class="cd-sheet-video" autoplay loop muted playsinline preload="none" aria-hidden="true">
            <source src="assets/video/graminha.mp4" type="video/mp4">
          </video>
        </div>
        <div class="cd-inner">

          <div class="cd-cols">
            <div class="cd-main">

              <!-- 6. story -->
              <section class="cd-block cd-story">
                <h2>Campaign story</h2>
                <div class="cd-story-body collapsed" id="storyCollapse">${paras(story)}</div>
                <button class="cd-readmore" id="storyToggle">Read more</button>
              </section>

              <!-- 7. organizer -->
              <section class="cd-organizer">
                <div class="cd-org-head">
                  <img class="cd-org-av" src="${c.organizer.avatar}" alt="${esc(c.organizer.name)}" onerror="this.style.visibility='hidden'">
                  <div class="cd-org-info">
                    <div class="cd-org-lbl">Organized by</div>
                    <div class="cd-org-name">${esc(c.organizer.name)} ${c.verified ? `<i class="cd-org-vf" title="Verified">${I.checkBadge}</i>` : ""}</div>
                    <div class="cd-org-rel">${esc(c.organizer.relation || c.location)}</div>
                  </div>
                </div>
                <p class="cd-org-trust">${I.shield}<span>All donations go directly toward this campaign's stated purpose.</span></p>
              </section>

              <!-- 9. supporters -->
              <section class="cd-block">
                <div class="cd-block-head"><h2 id="supTitle">Recent supporters</h2><button class="cd-seeall" id="supToggle">Top supporters</button></div>
                <div class="cd-supporters">
                  <div id="cdSupRows">${recentSupporters.map(supRow).join("")}</div>
                  <button class="cd-sup-seeall" id="supSeeAll">See all supporters</button>
                </div>
              </section>

              <!-- 10. words of support -->
              ${messages.length ? `<section class="cd-block">
                <h2>Words of support</h2>
                <div class="cd-words hscroll">${messages.map((d) => `<div class="cd-word"><div class="cd-word-msg">“${esc(d.message)}”</div><div class="cd-word-by">${I.heart}<span>${esc(d.name)}</span></div></div>`).join("")}</div>
              </section>` : ""}

            </div>
          </div>
        </div>
      </div>

      <!-- 11. recommended — interactive showcase (desktop) / scroll carousel (mobile) -->
      <section class="cd-more">
        <video class="cd-more-video" autoplay loop muted playsinline preload="none" aria-hidden="true">
          <source src="assets/video/video-bom.mp4" type="video/mp4">
        </video>
        <div class="wrap">
          <div class="cd-more-head"><h2>You may also like</h2><p>More stories gaining momentum — give them a moment too.</p></div>
          <div class="cd-show" id="cdMoreSlot"></div>
          <div class="cd-show-dots" id="cdShowDots" aria-hidden="true"></div>
        </div>
      </section>`;

      window.CW.initProgress(root);

      /* background videos — play while in view, pause off-screen (autoplay fallback) */
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        qsa(".cd-sheet-video, .cd-more-video", root).forEach((v) => {
          v.muted = true;
          // slow the campaign-story background grass slightly for a calmer feel
          if (v.classList.contains("cd-sheet-video")) v.playbackRate = 0.7;
          const tryPlay = () => { v.playbackRate = v.classList.contains("cd-sheet-video") ? 0.7 : 1; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
          if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) tryPlay(); else v.pause(); }), { threshold: 0.12 }).observe(v);
          else tryPlay();
        });
      }

      // hero carousel — auto every 3s, swipeable, dots reflect position
      (function heroCarousel() {
        const slides = qsa(".cd-hero-slide");
        if (slides.length < 2) return;
        const hero = qs(".cd-hero");
        const dots = qsa(".cd-hero-dots button");
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        let idx = 0, timer = null, cleanupT = null;
        const show = (i) => {
          const prev = idx;
          idx = (i + slides.length) % slides.length;
          if (prev !== idx) { slides[prev].classList.add("prev"); slides[prev].classList.remove("on"); }
          slides[idx].classList.add("on");
          slides[idx].classList.remove("prev");
          hero.classList.toggle("on-card", slides[idx].classList.contains("cd-hero-cardslide"));
          dots.forEach((d, j) => d.classList.toggle("on", j === idx));
          // once the incoming slide has fully covered the screen, drop the held-opaque outgoing slide
          clearTimeout(cleanupT);
          cleanupT = setTimeout(() => slides.forEach((s, j) => { if (j !== idx) s.classList.remove("prev"); }), 600);
        };
        const start = () => { if (!reduce) timer = setInterval(() => show(idx + 1), 3000); };
        const reset = () => { clearInterval(timer); start(); };
        dots.forEach((d, j) => d.addEventListener("click", () => { show(j); reset(); }));
        let sx = null;
        hero.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
        hero.addEventListener("touchend", (e) => {
          if (sx === null) return;
          const dx = e.changedTouches[0].clientX - sx; sx = null;
          if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
          start();
        }, { passive: true });
        start();
      })();

      // hero info-card "Support this fundraiser" CTA
      qs("#heroSupport")?.addEventListener("click", () => { location.href = "donate.html?id=" + c.id; });

      // story collapse
      const coll = qs("#storyCollapse");
      const tog = qs("#storyToggle");
      tog.addEventListener("click", () => {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        const collapsing = !coll.classList.contains("collapsed");
        if (reduce) {
          coll.classList.toggle("collapsed");
          coll.style.maxHeight = "";
          tog.textContent = collapsing ? "Read more" : "Show less";
          if (collapsing) coll.scrollIntoView({ behavior: "smooth", block: "nearest" });
          return;
        }
        // clear any pending end-state listener from a rapid re-click
        coll.removeEventListener("transitionend", coll._storyTE || (() => {}));
        if (collapsing) {
          // full -> 230px
          coll.style.maxHeight = coll.scrollHeight + "px";
          coll.getBoundingClientRect();              // reflow
          coll.classList.add("collapsed");           // brings back the fade mask
          coll.style.maxHeight = "230px";
          tog.textContent = "Read more";
          coll.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          // 230px -> full, then release the cap so reflows stay correct
          coll.style.maxHeight = "230px";            // pin current height
          coll.classList.remove("collapsed");        // drop the mask
          const full = coll.scrollHeight;
          coll.getBoundingClientRect();              // reflow
          coll.style.maxHeight = full + "px";
          tog.textContent = "Show less";
          const te = (e) => {
            if (e.propertyName !== "max-height") return;
            coll.style.maxHeight = "none";
            coll.removeEventListener("transitionend", te);
          };
          coll._storyTE = te;
          coll.addEventListener("transitionend", te);
        }
      });

      // donate + share
      qs("#donateBtn").addEventListener("click", () => { location.href = "donate.html?id=" + c.id; });
      qs("#shareBtn").addEventListener("click", () => share(c.title));

      // rotating "just donated" — cycles through real donor names only
      (() => {
        const el = qs(".cd-recent-name");
        if (!el) return;
        const names = [...new Set(allSupporters(c).filter((s) => s.name && s.name !== "Anonymous").map((s) => s.name))];
        if (names.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const wrap = el.closest(".cd-fund-recent");
        let k = names.indexOf(el.textContent.replace(/ just donated$/, "").trim());
        if (k < 0) k = 0;
        setInterval(() => {
          k = (k + 1) % names.length;
          wrap.classList.add("swap");
          setTimeout(() => { el.innerHTML = `<b>${esc(names[k])}</b> just donated`; wrap.classList.remove("swap"); }, 240);
        }, 2800);
      })();

      // "See all" supporters modal
      const fullList = allSupporters(c);
      qs("#supSeeAll").addEventListener("click", () => {
        const m = document.createElement("div");
        m.className = "sup-modal-backdrop";
        m.innerHTML = `<div class="sup-modal" role="dialog" aria-modal="true" aria-label="All supporters">
          <div class="sup-modal-head"><h3>All supporters</h3><span class="sup-modal-meta">${fullList.length} contributions</span><button class="icon-btn" id="supModalClose" aria-label="Close">${I.close}</button></div>
          <div class="sup-modal-list">${fullList.map(supporterRow).join("")}</div></div>`;
        document.body.appendChild(m);
        window.CW.lockScroll(true);
        requestAnimationFrame(() => m.classList.add("open"));
        const close = () => { m.classList.remove("open"); window.CW.lockScroll(false); setTimeout(() => m.remove(), 320); };
        m.addEventListener("click", (e) => { if (e.target === m) close(); });
        qs("#supModalClose", m).addEventListener("click", close);
        const onEsc = (e) => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); } };
        document.addEventListener("keydown", onEsc);
      });

      // supporters: Recent <-> Top toggle
      (() => {
        const rows = qs("#cdSupRows");
        const title = qs("#supTitle");
        const tog = qs("#supToggle");
        let top = false;
        tog.addEventListener("click", () => {
          top = !top;
          title.textContent = top ? "Top supporters" : "Recent supporters";
          tog.textContent = top ? "Recent supporters" : "Top supporters";
          rows.innerHTML = (top ? topSupporters : recentSupporters).map(supRow).join("");
        });
      })();

      // words of support: auto-advance every 3s, loop back to start
      (() => {
        const row = qs(".cd-words");
        if (!row || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let paused = false;
        ["pointerdown", "touchstart", "wheel"].forEach((ev) => row.addEventListener(ev, () => { paused = true; }, { passive: true }));
        setInterval(() => {
          if (paused) return;
          const card = row.querySelector(".cd-word");
          const gap = parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 12;
          const step = card ? card.getBoundingClientRect().width + gap : row.clientWidth;
          if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 4) row.scrollTo({ left: 0, behavior: "smooth" });
          else row.scrollBy({ left: step, behavior: "smooth" });
        }, 3000);
      })();

      // recommended — interactive showcase (one card highlighted at a time)
      const moreSlot = qs("#cdMoreSlot");
      const showItems = related.slice(0, 4);
      const showCard = (x, idx) => {
        return `<a class="cd-show-card${idx === 0 ? " is-active" : ""}" href="campaign.html?id=${x.id}" data-i="${idx}" aria-label="View ${esc(x.title)}">
          <div class="cd-show-img"><img src="${x.cover}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${D.fallbackImg(x.category)}'"><span class="cd-show-scrim"></span></div>
          <span class="cd-show-cat">${esc(x.category)}</span>
          <div class="cd-show-info">
            <h3 class="cd-show-title">${esc(x.title)}</h3>
            <span class="cd-show-cta">View campaign ${I.arrow}</span>
          </div>
        </a>`;
      };
      moreSlot.innerHTML = showItems.map(showCard).join("");
      initShowcase(moreSlot);
    }
  };

  /* "You may also like" desktop showcase — one card highlighted at a time,
     auto-rotating in a loop; hover takes over, loop resumes after mouse-out. */
  function initShowcase(rail) {
    const cards = qsa(".cd-show-card", rail);
    if (cards.length < 2) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = () => matchMedia("(min-width: 861px)").matches;
    let active = 0, timer = null, hovering = false;

    const setActive = (n) => {
      active = (n + cards.length) % cards.length;
      cards.forEach((c, i) => c.classList.toggle("is-active", i === active));
    };
    const start = () => {
      clearInterval(timer);
      if (reduce || !isDesktop()) return;
      timer = setInterval(() => { if (!hovering) setActive(active + 1); }, 3600);
    };
    const stop = () => clearInterval(timer);

    cards.forEach((c, i) => {
      c.addEventListener("mouseenter", () => { if (!isDesktop()) return; hovering = true; setActive(i); });
    });
    rail.addEventListener("mouseleave", () => { hovering = false; });

    setActive(0);
    start();

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.2 });
      io.observe(rail);
    }
    window.addEventListener("resize", start, { passive: true });

    /* ---- mobile: dot pagination synced to the swipe carousel ---- */
    const dotsWrap = qs("#cdShowDots");
    if (dotsWrap) {
      dotsWrap.innerHTML = cards.map((_, i) => `<button class="cd-show-dot${i === 0 ? " on" : ""}" type="button" aria-label="Campaign ${i + 1}"></button>`).join("");
      const dots = qsa(".cd-show-dot", dotsWrap);
      let raf = 0;
      const syncDots = () => {
        raf = 0;
        const rr = rail.getBoundingClientRect(), mid = rr.left + rr.width / 2;
        let best = 0, bd = Infinity;
        cards.forEach((c, i) => { const cr = c.getBoundingClientRect(); const d = Math.abs(cr.left + cr.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
        dots.forEach((d, i) => d.classList.toggle("on", i === best));
      };
      rail.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(syncDots); }, { passive: true });
      dots.forEach((d, i) => d.addEventListener("click", () => cards[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })));
    }
  }

  function buildSupporters(c) {
    const real = (c.supporters || []).slice();
    const names = ["Alex M.", "Jordan P.", "Sam K.", "Taylor R.", "Casey W.", "Morgan L.", "Anonymous", "Jamie B.", "Robin S.", "Quinn A."];
    const amts = [25, 50, 100, 35, 75, 150, 40, 200, 60, 30];
    const ats = ["3d ago", "4d ago", "5d ago", "6d ago", "1w ago", "1w ago", "2w ago"];
    // deterministic seed from id
    let seed = 0; for (const ch of c.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const want = Math.max(6, Math.min(8, Math.round(c.donors / 60)));
    let k = 0;
    while (real.length < want) {
      const idx = (seed + k * 7) % names.length;
      real.push({ name: names[idx], amount: amts[(seed + k * 3) % amts.length], message: "", at: ats[(seed + k) % ats.length] });
      k++;
    }
    return real;
  }

  function supporterRow(d) {
    return `<div class="supporter-row">
      <div class="av">${initials(d.name)}</div>
      <div class="sd">
        <div class="sh"><span class="nm">${esc(d.name)}</span><span class="am">${money(d.amount)}</span></div>
        ${d.message ? `<div class="msg">${esc(d.message)}</div>` : ""}
        ${d.at ? `<div class="tm">${esc(d.at)}</div>` : ""}
      </div>
    </div>`;
  }

  // full donor list (for "All supporters" + modal) — deterministic, sorted by amount desc
  function allSupporters(c) {
    const out = buildSupporters(c).slice();
    const firsts = ["Alex", "Jordan", "Sam", "Taylor", "Casey", "Morgan", "Jamie", "Robin", "Quinn", "Avery", "Riley", "Drew", "Skyler", "Parker", "Reese", "Sage", "Devon", "Harper", "Rowan", "Emerson", "Marisol", "Noah", "Hannah", "Sofia", "Grace"];
    const inits = ["A.", "B.", "C.", "D.", "K.", "L.", "M.", "N.", "P.", "R.", "S.", "T.", "W."];
    const amts = [25, 50, 100, 35, 75, 150, 40, 200, 60, 30, 500, 250, 20, 1000, 45, 80];
    const ats = ["2h ago", "5h ago", "8h ago", "1d ago", "1d ago", "2d ago", "3d ago", "4d ago", "5d ago", "6d ago", "1w ago", "1w ago", "2w ago", "2w ago", "3w ago", "1mo ago"];
    let seed = 0; for (const ch of c.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const total = Math.max(c.donors, out.length);
    let k = 0;
    while (out.length < total) {
      const anon = (seed + k * 5) % 7 === 0;
      const name = anon ? "Anonymous" : `${firsts[(seed + k * 7) % firsts.length]} ${inits[(seed + k * 3) % inits.length]}`;
      out.push({ name, amount: amts[(seed + k * 11) % amts.length], message: "", at: ats[(seed + k) % ats.length] });
      k++;
    }
    return out.sort((a, b) => b.amount - a.amount);
  }

  // mini campaign preview content for the share section (this campaign) — reused in a stack
  function miniShareInner(c) {
    const p = D.pct(c);
    return `<div class="share-card-img"><img src="${c.cover}" alt="" loading="lazy" onerror="this.src='${D.fallbackImg(c.category)}'"></div>
      <div class="share-card-body">
        <div class="sct">${esc(c.title)}</div>
        <div class="careflow"><div class="careflow-track"><div class="careflow-fill" style="width:${p}%"></div></div></div>
        <div class="scm">${money(c.raised)} <span>${p}%</span></div>
      </div>`;
  }

  // donation-protected reassurance card
  function claritySimple() {
    const checks = ["Funds go to the organizer", "Campaigns are reviewed before going live", "Reports can be reviewed by our team"];
    return `<div class="protect-card">
      <div class="pc-head">
        <div class="pc-ic">${I.shield}</div>
        <div class="pc-tx"><h4>Donation protected</h4><p>Every donation on Spread Hope is backed by our trust standards.</p></div>
      </div>
      <ul class="pc-checks">${checks.map((t) => `<li>${I.check}${t}</li>`).join("")}</ul>
      <a class="pc-learn" href="how-it-works.html">Learn how protection works ${I.arrow}</a>
    </div>`;
  }

  // organizer card — avatar, label, name, location + report link
  function organizerCardNew(c) {
    return `<div class="organizer-card">
      <img class="oav" src="${c.organizer.avatar}" alt="${esc(c.organizer.name)}" width="60" height="60" onerror="this.style.visibility='hidden'">
      <div class="oinfo">
        <div class="lbl">Organized by</div>
        <div class="nm">${esc(c.organizer.name)}</div>
        <div class="oloc">${I.pin}${esc(c.location)}</div>
      </div>
      <a class="report-link" href="contact.html?subject=report&campaign=${encodeURIComponent(c.title)}">${I.flag}Report this fundraiser</a>
    </div>`;
  }

  const paras = (arr) => (arr || []).map((p) => `<p>${esc(p)}</p>`).join("");
  function formatDate(s) { const d = new Date(s + "T00:00:00"); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
  function daysAgo(s) { return Math.max(1, Math.round((Date.now() - new Date(s + "T00:00:00")) / 864e5)); }

  /* =================================================================
     START WIZARD
     ================================================================= */
  PAGES.start = function () {
    const steps = qsa(".wstep");
    const stepperItems = qsa(".stepper-item");
    let current = 0;
    const draft = { name: "", relation: "", title: "", category: "", location: "", story: "", goal: "", photos: [] };

    function go(n) {
      if (n > current && !validate(current)) return;
      current = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach((s, i) => s.classList.toggle("active", i === current));
      stepperItems.forEach((s, i) => { s.classList.toggle("current", i === current); s.classList.toggle("done", i < current); });
      window.scrollTo({ top: qs(".wizard-grid").offsetTop - 110, behavior: "smooth" });
      if (current === 4) renderReview();
    }

    function fieldEl(name) { return qs(`[data-field="${name}"]`); }
    function setErr(name, on) { const f = fieldEl(name); if (f) f.classList.toggle("invalid", on); }

    function validate(step) {
      let ok = true;
      const need = (name) => { const inp = qs(`[name="${name}"]`); const val = inp ? inp.value.trim() : ""; const bad = !val; setErr(name, bad); if (bad) ok = false; return val; };
      if (step === 0) { need("name"); need("relation"); }
      if (step === 1) {
        const story = need("story");
        if (story && story.length < 80) { setErr("story", true); qs('[data-field="story"] .err span').textContent = "Please write at least a short paragraph (80+ characters)."; ok = false; }
      }
      if (step === 2) {
        need("title");
        if (!draft.category) { setErr("category", true); ok = false; }
        const goal = need("goal");
        if (goal && (isNaN(+goal) || +goal < 100)) { setErr("goal", true); qs('[data-field="goal"] .err span').textContent = "Set a goal of at least $100."; ok = false; }
      }
      if (!ok) toast("Please fix the highlighted fields", "err");
      return ok;
    }

    // live binding
    function bind() {
      qsa("[name]", qs(".wizard-form")).forEach((inp) => {
        inp.addEventListener("input", () => {
          draft[inp.name] = inp.value;
          setErr(inp.name, false);
          updatePreview();
        });
      });
      // category picker
      qsa(".cat-opt").forEach((b) => b.addEventListener("click", () => {
        qsa(".cat-opt").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        draft.category = b.dataset.cat;
        setErr("category", false);
        updatePreview();
      }));
    }

    // photos (object URLs, no upload)
    const uploader = qs("#uploader");
    const fileInput = qs("#fileInput");
    const uploadGrid = qs("#uploadGrid");
    uploader.addEventListener("click", () => fileInput.click());
    uploader.addEventListener("dragover", (e) => { e.preventDefault(); uploader.classList.add("drag"); });
    uploader.addEventListener("dragleave", () => uploader.classList.remove("drag"));
    uploader.addEventListener("drop", (e) => { e.preventDefault(); uploader.classList.remove("drag"); addFiles(e.dataTransfer.files); });
    fileInput.addEventListener("change", () => addFiles(fileInput.files));
    function addFiles(files) {
      Array.from(files).filter((f) => f.type.startsWith("image/")).forEach((f) => {
        if (draft.photos.length >= 6) return;
        draft.photos.push({ name: f.name, url: URL.createObjectURL(f) });
      });
      renderPhotos(); updatePreview();
    }
    function renderPhotos() {
      uploadGrid.innerHTML = draft.photos.map((p, i) => `<div class="upload-thumb"><img src="${p.url}" alt=""><button data-rm="${i}" aria-label="Remove">${I.close}</button></div>`).join("");
      qsa("[data-rm]", uploadGrid).forEach((b) => b.addEventListener("click", () => { draft.photos.splice(+b.dataset.rm, 1); renderPhotos(); updatePreview(); }));
    }

    // live preview card
    function updatePreview() {
      const pv = qs("#previewCard");
      const goal = +draft.goal || 0;
      const cover = draft.photos[0] ? draft.photos[0].url : D.fallbackImg(draft.category || "Community");
      const title = draft.title || "Your fundraiser title appears here";
      const cat = draft.category || "Category";
      const loc = draft.location || "Your location";
      pv.innerHTML = `
        <div class="ccard">
          <div class="ccard-img">
            <img src="${cover}" alt="" onerror="this.src='${D.fallbackImg(draft.category || "Community")}'">
            <span class="ccard-scrim" aria-hidden="true"></span>
            <div class="badges"><span class="badge-cat">${esc(cat)}</span></div>
            <h3 class="ccard-title">${esc(title)}</h3>
          </div>
          <div class="ccard-body">
            <div class="careflow"><div class="careflow-track"><div class="careflow-fill" style="width:2%"></div></div>
              <div class="careflow-stats"><div class="raised">$0 <span>of ${goal ? money(goal) : "$—"}</span></div><div class="pct">0%</div></div>
            </div>
            <div class="ccard-foot"><span class="ccard-donors">${I.pin}${esc(loc)}</span><span class="ccard-go">Preview</span></div>
          </div>
        </div>`;
    }

    function renderReview() {
      const r = qs("#reviewSlot");
      const row = (k, v) => `<div class="review-row"><span class="k">${k}</span><span class="v">${esc(v || "—")}</span></div>`;
      r.innerHTML = `
        <div class="review-block"><h4>Your basics <button data-edit="0">Edit</button></h4>
          ${row("Organizer", draft.name)}${row("Relationship", draft.relation)}${row("Location", draft.location)}</div>
        <div class="review-block"><h4>Campaign <button data-edit="2">Edit</button></h4>
          ${row("Title", draft.title)}${row("Category", draft.category)}${row("Goal", draft.goal ? money(+draft.goal) : "")}</div>
        <div class="review-block"><h4>Story <button data-edit="1">Edit</button></h4>
          <p style="color:var(--slate-gray);font-size:14.5px;line-height:1.6;margin:0">${esc((draft.story || "").slice(0, 220))}${(draft.story || "").length > 220 ? "…" : ""}</p></div>
        <div class="review-block"><h4>Photos <button data-edit="3">Edit</button></h4>
          ${draft.photos.length ? `<div class="upload-grid">${draft.photos.map((p) => `<div class="upload-thumb"><img src="${p.url}" alt=""></div>`).join("")}</div>` : `<p style="color:var(--slate-gray);margin:0">No photos added yet.</p>`}</div>`;
      qsa("[data-edit]", r).forEach((b) => b.addEventListener("click", () => go(+b.dataset.edit)));
    }

    // nav buttons
    qsa("[data-go]").forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.go;
      if (v === "next") go(current + 1);
      else if (v === "back") go(current - 1);
    }));

    qs("#publishBtn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = "Submitting…";
      const res = await D.submitCampaign(draft);
      if (res.ok) location.href = "submitted.html?ref=" + res.ref + "&title=" + encodeURIComponent(draft.title || "Your fundraiser") + "&cat=" + encodeURIComponent(draft.category || "Community");
      else { btn.disabled = false; btn.textContent = "Publish fundraiser"; toast("Something went wrong. Try again.", "err"); }
    });

    // mobile preview collapse
    qs("#previewToggle")?.addEventListener("click", () => qs("#previewRail").classList.toggle("collapsed"));

    bind();
    updatePreview();
  };

  /* =================================================================
     DONATE (mock checkout — no real payment)
     ================================================================= */
  PAGES.donate = function () {
    const id = param("id");
    const root = qs("#donateRoot");
    root.setAttribute("aria-busy", "true");
    root.innerHTML = skeletonDonate();
    D.get(id).then((c) => {
      if (!c) { location.replace("browse-campaigns.html"); return; }
      document.title = `Donate · ${c.title} · Spread Hope`;
      renderDonate(c);
      root.removeAttribute("aria-busy");
    });

    // ghost mirroring the checkout: steps, amount grid, fields, CTA + summary card
    function skeletonDonate() {
      const ln = (w, h) => `<div class="skel sk-text" style="width:${w};${h ? "height:" + h + ";" : ""}"></div>`;
      return `<div class="ghost">
        <div class="skel sk-text" style="width:160px;height:14px;margin-bottom:18px"></div>
        <div class="gn-wrap">
          <div>
            <div class="gd-row" style="gap:18px;margin-bottom:22px">
              <div class="skel sk-pill" style="width:90px"></div>
              <div class="skel sk-pill" style="width:110px"></div>
              <div class="skel sk-pill" style="width:90px"></div>
            </div>
            <div class="skel sk-title" style="width:60%;height:28px;margin-bottom:10px"></div>
            ${ln("85%", "14px")}
            <div class="gn-amounts" style="margin:20px 0">
              <div class="skel gn-amt"></div><div class="skel gn-amt"></div><div class="skel gn-amt"></div>
              <div class="skel gn-amt"></div><div class="skel gn-amt"></div><div class="skel gn-amt"></div>
            </div>
            <div class="skel sk-btn" style="width:100%;margin-bottom:14px"></div>
            <div class="skel sk-btn" style="width:100%;height:52px"></div>
          </div>
          <div class="gn-summary">
            <div class="skel sk-text" style="width:50%;height:14px"></div>
            <div class="gd-row" style="align-items:center">
              <div class="skel sk-img" style="width:64px;height:64px"></div>
              <div style="flex:1;display:flex;flex-direction:column;gap:8px">${ln("80%")}${ln("55%")}</div>
            </div>
            <div class="skel sk-bar" style="width:100%"></div>
            ${ln("70%")}
          </div>
        </div>
      </div>`;
    }

    function renderDonate(c) {
      const pct = D.pct(c);
      const amounts = [25, 50, 100, 250, 500, 1000];
      root.innerHTML = `
      <div class="breadcrumb"><a href="campaign.html?id=${c.id}">Back to campaign</a>${I.chevron}<span>Donate</span></div>
      <div class="donate-grid">
        <div class="donate-form">
          <div class="dn-steps" id="dnSteps">
            <span class="dn-step current" data-s="0"><i>1</i>Amount</span>
            <span class="dn-line"></span>
            <span class="dn-step" data-s="1"><i>2</i>Your support</span>
            <span class="dn-line"></span>
            <span class="dn-step" data-s="2"><i>3</i>Complete</span>
          </div>

          <section class="dn-pane active" data-pane="0">
            <h1>Choose your support</h1>
            <p class="donate-sub">Pick an amount that goes directly toward ${esc(c.organizer.name)}'s goal.</p>
            <div class="amount-grid">
              ${amounts.map((a) => `<button type="button" class="amount-opt" data-amt="${a}">${money(a)}</button>`).join("")}
            </div>
            <button class="btn btn-primary btn-lg btn-block" id="dNext0">Continue ${I.arrow}</button>
          </section>

          <section class="dn-pane" data-pane="1">
            <h1>Add your support</h1>
            <p class="donate-sub">Tell ${esc(c.organizer.name)} who's behind this gift. Your name is required even for anonymous donations.</p>
            <div class="dn-field"><label for="dName">Your name <span class="hint req">— required</span></label><input type="text" id="dName" placeholder="Jane Doe" required></div>
            <div class="dn-field"><label for="dMsg">Words of support <span class="hint">— optional</span></label><textarea id="dMsg" placeholder="Sending strength and hope…"></textarea></div>
            <label class="anon-row"><input type="checkbox" id="dAnon"> Donate anonymously</label>
            <div class="dn-nav"><button class="btn btn-ghost" id="dBack1">Back</button><button class="btn btn-primary" id="dNext1">Review ${I.arrow}</button></div>
          </section>

          <section class="dn-pane" data-pane="2">
            <h1>Complete your donation</h1>
            <p class="donate-sub">One last look, then you're done.</p>
            <div class="dn-review" id="dnReview"></div>
            <button class="btn btn-primary btn-lg btn-block" id="dSubmit">Donate <span id="dAmtLabel"></span></button>
            <div class="dn-secure">${I.shield}<span>Secure &amp; protected — funds go directly to ${esc(c.organizer.name)}.</span></div>
            <button class="btn btn-ghost btn-block" id="dBack2" style="margin-top:12px">Back</button>
          </section>
        </div>

        <aside class="donate-summary">
          <div class="ds-card">
            <div class="ds-img"><img src="${c.cover}" alt="${esc(c.title)}" onerror="this.src='${D.fallbackImg(c.category)}'"></div>
            <div class="ds-body">
              <div class="ds-eyebrow">You're supporting</div>
              <div class="ds-title">${esc(c.title)}</div>
              <div class="careflow"><div class="careflow-track"><div class="careflow-fill" style="width:${pct}%"></div></div></div>
              <div class="ds-meta"><strong>${money(c.raised)}</strong> raised of ${money(c.goal)} · <span>${pct}%</span></div>
            </div>
          </div>
        </aside>
      </div>`;

      let amount = 0, step = 0;
      const panes = qsa(".dn-pane");
      const steps = qsa("#dnSteps .dn-step");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const go = (s) => {
        step = s;
        panes.forEach((p) => p.classList.toggle("active", +p.dataset.pane === s));
        steps.forEach((st) => { const i = +st.dataset.s; st.classList.toggle("current", i === s); st.classList.toggle("done", i < s); });
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      };

      const setAmount = (v) => { amount = v; qsa(".amount-opt").forEach((x) => x.classList.toggle("sel", +x.dataset.amt === v)); };
      qsa(".amount-opt").forEach((b) => b.addEventListener("click", () => { setAmount(+b.dataset.amt); }));

      qs("#dNext0").addEventListener("click", () => { if (!amount || amount < 1) { toast("Please choose an amount", "err"); return; } go(1); });
      qs("#dNext1").addEventListener("click", () => {
        if (!qs("#dName").value.trim()) { toast("Please enter your name", "err"); qs("#dName").focus(); return; }
        buildReview(); go(2);
      });
      qs("#dBack1").addEventListener("click", () => go(0));
      qs("#dBack2").addEventListener("click", () => go(1));

      function buildReview() {
        const name = qs("#dName").value.trim();
        const anon = qs("#dAnon").checked;
        const msg = qs("#dMsg").value.trim();
        qs("#dAmtLabel").textContent = "· " + money(amount);
        qs("#dnReview").innerHTML = `
          <div class="dr-amount"><span>Your donation</span><b>${money(amount)}</b></div>
          <div class="dr-row"><span>Supporting</span><b>${esc(c.title)}</b></div>
          <div class="dr-row"><span>From</span><b>${anon ? "Anonymous" : (name ? esc(name) : "A kind supporter")}</b></div>
          ${msg ? `<div class="dr-msg">“${esc(msg)}”</div>` : ""}`;
      }

      qs("#dSubmit").addEventListener("click", () => {
        if (!amount || amount < 1) { toast("Please choose an amount to donate", "err"); go(0); return; }
        const btn = qs("#dSubmit");
        btn.disabled = true; btn.textContent = "Processing…";
        // mock — no real payment provider; simulate then go to thank-you
        setTimeout(() => { location.href = "thank-you.html?id=" + c.id + "&amt=" + amount; }, 700);
      });
    }
  };

  /* =================================================================
     SUBMITTED
     ================================================================= */
  PAGES.submitted = function () {
    const ref = param("ref") || "CW-PENDING";
    const title = param("title") || "Your fundraiser";
    const cat = param("cat") || "Community";
    qs("#refCode").textContent = ref;
    qs("#miniTitle").textContent = title;
    qs("#miniImg").src = D.fallbackImg(cat);
    qs("#miniMeta").textContent = cat + " · Awaiting review";
  };

  /* =================================================================
     THANK YOU
     ================================================================= */
  PAGES.thankyou = function () {
    const id = param("id");
    const c = id ? D.all().find((x) => x.id === id) : D.featured();
    if (!c) return;
    const p = D.pct(c);
    qs("#tyTitle").textContent = c.title;
    qs("#tyImg").src = c.cover;
    qs("#tyImg").onerror = function () { this.src = D.fallbackImg(c.category); };
    qs("#tyFill").style.width = p + "%";
    qs("#tyMeta").textContent = `${money(c.raised)} raised · ${p}% of ${money(c.goal)}`;
    qs("#tyMoreLink").href = "browse-campaigns.html";
    qsa("[data-sh]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const url = "campaign.html?id=" + c.id, full = location.origin + location.pathname.replace(/thank-you\.html$/, "") + url;
      const k = a.dataset.sh, t = encodeURIComponent("I just supported: " + c.title);
      if (k === "copy") navigator.clipboard.writeText(full).then(() => toast("Link copied"));
      else if (k === "wa") window.open(`https://wa.me/?text=${t}%20${encodeURIComponent(full)}`, "_blank");
      else if (k === "fb") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(full)}`, "_blank");
      else if (k === "x") window.open(`https://twitter.com/intent/tweet?text=${t}&url=${encodeURIComponent(full)}`, "_blank");
    }));
  };

  /* =================================================================
     CONTACT
     ================================================================= */
  PAGES.contact = function () {
    const form = qs("#contactForm");
    const subj = param("subject");
    const campaign = param("campaign");
    if (subj && qs("#cSubject")) {
      qs("#cSubject").value = subj === "report" ? "Report a fundraiser" : subj;
      if (campaign && qs("#cMessage")) qs("#cMessage").value = `I'd like to report the fundraiser: ${campaign}\n\n`;
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = qs("#contactSubmit");
      const data = Object.fromEntries(new FormData(form));
      if (!data.name || !data.email || !data.message) { toast("Please complete the required fields", "err"); return; }
      btn.disabled = true; btn.textContent = "Sending…";
      const res = await D.sendContact(data);
      btn.disabled = false; btn.textContent = "Send message";
      if (res.ok) { form.reset(); toast("Thanks — we'll be in touch within 1–2 business days."); }
      else toast("Couldn't send. Please try again.", "err");
    });
    // prefill channel cards
    qsa("[data-channel]").forEach((b) => b.addEventListener("click", () => { qs("#cSubject").value = b.dataset.channel; qs("#cMessage").focus(); window.scrollTo({ top: form.offsetTop - 120, behavior: "smooth" }); }));
  };

  /* =================================================================
     LEGAL (terms / privacy) — scrollspy TOC
     ================================================================= */
  PAGES.legal = function () {
    const links = qsa(".legal-toc a, .toc-card-mobile a");
    const sections = qsa(".legal-section");
    if (!sections.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          qsa(".legal-toc a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    sections.forEach((s) => io.observe(s));
  };

  /* =================================================================
     FAQ accordion (shared)
     ================================================================= */
  function initFAQ() {
    qsa(".faq-item").forEach((item) => {
      const q = qs(".faq-q", item);
      const a = qs(".faq-a", item);
      q.addEventListener("click", () => {
        const open = item.classList.toggle("open");
        a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
      });
    });
  }

  /* ---------- Dispatch ---------- */
  function run() {
    initFAQ();
    const page = document.body.dataset.page;
    const fn = PAGES[page];
    if (fn) fn();

    /* perf: stop decoding background videos while the tab/page is hidden; on return, resume only the ones on screen */
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inView = (v) => { const r = v.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.height > 0; };
    document.addEventListener("visibilitychange", () => {
      const vids = document.querySelectorAll("video");
      if (document.hidden) { vids.forEach((v) => v.pause()); }
      else if (!reduceMotion) { vids.forEach((v) => { if (inView(v)) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } }); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
