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
      if (matchMedia("(min-width: 861px)").matches) {
        /* DESKTOP: 3-card expanding accordion — the big one (left, by default) is the "principal".
           Click a small card → it grows into the principal. Click the principal (already big) → open it. */
        const three = camps.slice(0, 3);
        const sohEl = track.closest(".soh");
        const card = (c, i) => {
          const p = D.pct(c);
          return `
          <a class="soh-ac-card${i === 0 ? " is-active" : ""}" href="campaign.html?id=${c.id}" data-i="${i}">
            <img class="soh-ac-img" src="${c.cover}" alt="${esc(c.title)}" loading="lazy" onerror="this.onerror=null;this.src='${D.fallbackImg(c.category)}'">
            <span class="soh-ac-heart">${I.heart}</span>
            <span class="soh-ac-cat">${esc(c.category)}</span>
            <div class="soh-ac-body">
              <h3>${esc(c.title)}</h3>
              <p class="soh-ac-blurb">${esc(c.blurb)}</p>
              <div class="soh-ac-nums"><span class="r">${money(c.raised)}</span><span class="g">of ${money(c.goal)}</span></div>
              <div class="careflow"><div class="careflow-track"><div class="careflow-fill" data-fill="${p}" style="width:0%"></div></div></div>
              <div class="soh-ac-pct">${p}% funded</div>
              <span class="soh-ac-cta">Support this story ${I.arrow}</span>
            </div>
          </a>`;
        };
        const accWrap = document.createElement("div");
        accWrap.className = "wrap soh-acc-wrap reveal in";
        accWrap.innerHTML = `<div class="soh-acc">${three.map(card).join("")}</div>`;
        sohEl.style.display = "none";
        sohEl.insertAdjacentElement("afterend", accWrap);

        const cards = qsa(".soh-ac-card", accWrap);
        const setActive = (idx) => {
          cards.forEach((cd, i) => {
            const on = i === idx;
            cd.classList.toggle("is-active", on);
            if (on) { const f = cd.querySelector(".careflow-fill"); if (f) { f.style.width = "0%"; requestAnimationFrame(() => { f.style.width = f.dataset.fill + "%"; }); } }
          });
        };
        cards.forEach((cd, i) => {
          cd.addEventListener("click", (e) => {
            // promote a small card on first click; if it's already the principal, let the link open the campaign
            if (!cd.classList.contains("is-active")) { e.preventDefault(); setActive(i); }
          });
        });
        setActive(0);
      } else {
        /* MOBILE: center-focus peek carousel, swipe, auto-advance 3s */
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
          dotsWrap.innerHTML = slides.map((_, i) => `<button class="${i === active ? "on" : ""}" aria-label="Story ${i + 1}"></button>`).join("");
          qsa("button", dotsWrap).forEach((d, i) => d.addEventListener("click", () => go(i)));
        }
        qs("#sohPrev")?.addEventListener("click", () => go(active - 1));
        qs("#sohNext")?.addEventListener("click", () => go(active + 1));
        let sx = null;
        track.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; stop(); }, { passive: true });
        track.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 40) active = (active + (dx < 0 ? 1 : -1) + slides.length) % slides.length; center(); start(); }, { passive: true });
        window.addEventListener("resize", center, { passive: true });

        requestAnimationFrame(() => { center(); requestAnimationFrame(center); });
        start();
      }
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
      playInView(qs(".nh-hero-video"));    // mobile hero backdrop video
      playInView(qs(".nh-final-video"));   // final CTA (both viewports)
      const howV = qs(".nh-how-video");    // how-it-works grass bg — runs a touch slower than normal
      if (howV) howV.defaultPlaybackRate = howV.playbackRate = 0.6;
      playInView(howV);
    }

    initLiveNow();
    observeNew();
  };

  /* =================================================================
     LIVE SUPPORT — "happening now" activity timeline (mock, brand data)
     ================================================================= */
  function initLiveNow() {
    const feed = qs("#lnFeed");
    if (!feed) return;
    const reduceM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const camps = D.all().slice(0, 3);
    const names = ["Sofia M.", "Daniel R.", "Amara K.", "Liam T.", "Priya N."];
    const heartNames = ["Eli", "Ana", "Tom", "Mia", "Sol", "Bea", "Ravi"];
    const msgs = [
      "Sending strength — you've got this.",
      "Every step counts. Rooting for you all the way!",
      "So glad to help make this happen.",
      "Hope this brings you a little closer to the goal.",
      "Thinking of you and your family today.",
    ];
    const times = ["Just now", "1 min ago", "4 min ago", "9 min ago", "16 min ago"];
    const amts = [50, 25, 100, 150, 75];
    const heartsArr = [128, 207, 311, 94, 256];
    const acts = [
      (a) => `contributed <b>${money(a)}</b> to`,
      () => `sent support to`,
      () => `just backed`,
      (a) => `contributed <b>${money(a)}</b> to`,
      () => `is cheering for`,
    ];
    const mini = (n) => `<span class="ln-mini-av">${initials(n)}</span>`;
    feed.innerHTML = camps.map((c, i) => {
      const p = D.pct(c);
      const name = names[i % names.length];
      const action = acts[i % acts.length](amts[i % amts.length]);
      const miniAvs = [heartNames[i % heartNames.length], heartNames[(i + 2) % heartNames.length], heartNames[(i + 4) % heartNames.length]].map(mini).join("");
      return `
      <article class="ln-card reveal" data-delay="${i % 3}">
        <div class="ln-card-top">
          <span class="ln-av">${initials(name)}</span>
          <div class="ln-card-meta">
            <p class="ln-act"><b>${esc(name)}</b> ${action} <a href="campaign.html?id=${c.id}">${esc(c.title)}</a></p>
            <span class="ln-time">${I.clock}<span>${times[i % times.length]}</span></span>
          </div>
          <button class="ln-like" type="button" aria-label="Like this activity" aria-pressed="false">${I.heart}</button>
        </div>
        <p class="ln-msg">${esc(msgs[i % msgs.length])}</p>
        <a class="ln-camp" href="campaign.html?id=${c.id}">
          <span class="ln-camp-img"><img src="${c.cover}" alt="${esc(c.title)}" loading="lazy" onerror="this.onerror=null;this.src='${D.fallbackImg(c.category)}'"></span>
          <span class="ln-camp-body">
            <span class="ln-camp-cat">${esc(c.category)}</span>
            <span class="ln-camp-title">${esc(c.title)}</span>
            <span class="careflow"><span class="careflow-track"><span class="careflow-fill" style="width:${p}%"></span></span></span>
            <span class="ln-camp-foot"><span class="ln-pct">${p}% funded</span><span class="ln-cta">View campaign ${I.arrow}</span></span>
          </span>
        </a>
        <div class="ln-hearts">
          <span class="ln-hearts-avs">${miniAvs}</span>
          <span class="ln-hearts-tx"><b class="ln-hcount">${heartsArr[i % heartsArr.length]}</b> hearts received</span>
          <span class="ln-hearts-ic">${I.heart}</span>
        </div>
      </article>`;
    }).join("");
    observeNew(feed);

    qsa(".ln-like", feed).forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    }));

    // gentle "live" feel — nudge one heart count at a time with a soft pop
    if (!reduceM) {
      const counts = qsa(".ln-hcount", feed);
      let k = 0;
      setInterval(() => {
        if (document.hidden || !counts.length) return;
        const el = counts[k++ % counts.length];
        el.textContent = +el.textContent + 1;
        el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
      }, 4200);
    }
  }

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
      // desktop lays the copy + demo side by side in a grid — let it size naturally
      if (matchMedia("(min-width: 861px)").matches) { stage.style.minHeight = ""; return; }
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
    // single deterministic repaint of EVERY segment — race-free against pause / skip / off-screen
    function paintSegs(animate) {
      segs.forEach((s, n) => {
        s.btn.classList.toggle("on", n === i);
        if (n === i) return; // current handled below
        // snap past→full / future→empty instantly: no transition that could stall from a frozen state
        s.fill.style.transition = "none";
        s.fill.style.width = (n < i ? 100 : 0) + "%";
      });
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
      paintSegs(animate);
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
    function open(doScroll = true) {
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
      if (doScroll) {
        const top = stage.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      }
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
          const live = stage.classList.contains("show-demo") || matchMedia("(min-width: 861px)").matches;
          if (!live || finished) return;
          if (e.isIntersecting) { if (playing) { show(i, true); schedule(); } }  // restart the current bar instead of leaving it frozen
          else { clearTimeout(timer); freezeSeg(); }
        });
      }, { threshold: 0.25 });
      io.observe(demo);
    }

    // desktop: reveal + play the walkthrough automatically once the section scrolls into view — no click needed
    if (!reduce && matchMedia("(min-width: 861px)").matches && "IntersectionObserver" in window) {
      let autoStarted = false;
      const autoIO = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (autoStarted || !e.isIntersecting) return;
          autoStarted = true; autoIO.disconnect();
          play(); // demo sits inline in the right column on desktop — just start it (no swap)
        });
      }, { threshold: 0.3 });
      autoIO.observe(stage);
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
      perPage: 6,
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
      const fmtCreated = (s) => { const d = new Date((s || "") + "T00:00:00"); return isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "long", year: "numeric" }); };
      const gallery = (c.gallery && c.gallery.length ? c.gallery : [c.cover]);
      // hero carousel slides: a "card" slide (plain dark bg) after every complete PAIR of photos
      // (e.g. photo, photo, card, photo, photo, card … — a trailing lone photo gets no card)
      // desktop = contained 2-col editorial hero (photos only); mobile keeps the
      // full-bleed carousel that intersperses an info "card" slide after every pair
      const isDesk = matchMedia("(min-width: 861px)").matches;
      const heroSlides = [];
      gallery.forEach((src) => {
        heroSlides.push({ type: "photo", src });
      });
      const story = [].concat(c.story.the_story || [], c.story.why || [], c.story.how || [], c.story.note || []);
      const allSup = allSupporters(c);
      const topSupporters = allSup.slice(0, 5);
      const atRank = (s) => { const m = /(\d+)\s*(h|d|w|mo)/.exec(s || ""); if (!m) return 1e9; return +m[1] * (m[2] === "h" ? 1 : m[2] === "d" ? 24 : m[2] === "w" ? 168 : 720); };
      // recent = real supporters first (varied amounts), padded from the smaller deterministic list — keeps amounts alternating instead of all-equal
      const recentSupporters = buildSupporters(c).slice().sort((a, b) => atRank(a.at) - atRank(b.at)).slice(0, 5);
      const messages = (c.supporters || []).filter((s) => s.message);
      const related = D.all().filter((x) => x.id !== c.id).sort((a, b) => D.pct(b) - D.pct(a)).slice(0, 6);

      const supRow = (d) => `<div class="cd-sup-row">
        <span class="cd-sup-av">${initials(d.name)}</span>
        <span class="cd-sup-main"><span class="cd-sup-name">${esc(d.name)}</span>${d.at ? `<span class="cd-sup-time">${esc(d.at)}</span>` : ""}</span>
        <span class="cd-sup-amt">${money(d.amount)}</span>
      </div>`;

      // share lab — mini campaign-image helper + channel glyphs
      const cImg = (cls) => `<img class="${cls}" src="${c.cover}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${D.fallbackImg(c.category)}'">`;
      const smIc = {
        fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3l.5-3H14V4.5c0-.9.3-1.5 1.6-1.5H17V.3C16.6.2 15.6 0 14.5 0 12 0 10.3 1.5 10.3 4.3V6H8v3h2.3v9H14V9Z"/></svg>',
        ig: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5.2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.25" fill="currentColor"/></svg>',
        wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l.7-.9c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.1.1.6-.1 1.1Z"/></svg>',
        x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3l-6.55 7.48L21.8 21h-6.02l-4.71-6.16L5.6 21H2.6l7.02-8.02L2.3 3h6.17l4.26 5.63L17.5 3Zm-1.05 16.2h1.66L7.64 4.7H5.86l10.59 14.5Z"/></svg>'
      };

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
        <span class="cd-verified"><img class="cd-verified-av" src="${c.organizer.avatar}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${D.fallbackImg(c.category)}'">${esc(c.organizer.name)}</span>
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

            <!-- 6. story (desktop: left column) -->
            <section class="cd-block cd-story">
              <h2>Campaign story</h2>
              <div class="cd-story-body collapsed" id="storyCollapse">${paras(story)}</div>
              <button class="cd-readmore" id="storyToggle">Read more</button>
            </section>

            <!-- 9. supporters (full width below) -->
            <section class="cd-block cd-supporters-sec">
              <div class="cd-block-head"><h2 id="supTitle">Recent supporters</h2><button class="cd-seeall" id="supToggle">Top supporters</button></div>
              <div class="cd-supporters">
                <div id="cdSupRows">${recentSupporters.map(supRow).join("")}</div>
                <button class="cd-sup-seeall" id="supSeeAll">See all supporters</button>
              </div>
            </section>

            <!-- 10. words of support — floating speech bubbles (full width below) -->
            ${messages.length ? `<section class="cd-block cd-words-sec">
              <div class="cd-block-head"><h2>Words of support</h2>${messages.length > 2 ? `<button class="cd-seeall" id="wordsSeeAll">View all</button>` : ""}</div>
              <div class="cd-words">${messages.map((d, i) => `<div class="cd-word" style="--i:${i}"><div class="cd-word-msg">${esc(d.message)}</div><div class="cd-word-by">${I.heart}<span>${esc(d.name)}</span></div></div>`).join("")}</div>
            </section>` : ""}

            <!-- 11. organizer + trust meta (2-col grid on desktop: org | info / foot) -->
            <section class="cd-block cd-trust">
              <div class="cd-trust-org">
                <span class="cd-trust-lbl">Organizer and beneficiary</span>
                <div class="cd-trust-head">
                  <img class="cd-trust-av" src="${c.organizer.avatar}" alt="${esc(c.organizer.name)}" onerror="this.style.visibility='hidden'">
                  <div class="cd-trust-id">
                    <div class="cd-trust-name">${esc(c.organizer.name)}${c.verified ? `<span class="cd-trust-vf" title="Verified organizer"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ""}</div>
                    <div class="cd-trust-rel">Organizer${c.organizer.relation ? ` · ${esc(c.organizer.relation)}` : ""}${c.location ? ` · ${esc(c.location)}` : ""}</div>
                  </div>
                </div>
              </div>
              <div class="cd-trust-info">
                <div class="cd-trust-protect">
                  <span class="cd-trust-protect-ic">${I.shield}</span>
                  <div class="cd-trust-protect-tx"><b>Donation protected</b><span class="cd-trust-protect-sub">Protected by our trust and safety standards.</span></div>
                </div>
                <p class="cd-trust-line">Protected by our trust and safety standards.</p>
              </div>
              <div class="cd-trust-foot">
                <a class="cd-trust-report" href="contact.html?subject=report&campaign=${encodeURIComponent(c.title)}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 21V4m0 1.5h11l-2 4 2 4H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Report fundraiser</span></a>
                <p class="cd-trust-note">The content on this page is the sole responsibility of the campaign creator and does not represent the opinion or endorsement of Spread Hope.</p>
              </div>
            </section>

            <!-- 12. sharing helps — promo with a fanned card stack + social share -->
            <section class="cd-block share-lab" data-share-lab>
              <div class="share-lab-head">
                <h2>Help this story reach more people</h2>
                <p>Every share brings the goal a little closer — pick a way to spread it.</p>
              </div>
              <div class="share-lab-body">
                <div class="share-lab-rail" role="tablist" aria-label="Ways to share">
                  <button class="share-chip is-active" data-net="copy" type="button" role="tab" aria-selected="true"><span class="share-chip-ic">${I.copy}</span><i>Copy link</i></button>
                  <button class="share-chip" data-net="fb" type="button" role="tab" aria-selected="false"><span class="share-chip-ic">${smIc.fb}</span><i>Facebook</i></button>
                  <button class="share-chip" data-net="ig" type="button" role="tab" aria-selected="false"><span class="share-chip-ic">${smIc.ig}</span><i>Instagram</i></button>
                  <button class="share-chip" data-net="wa" type="button" role="tab" aria-selected="false"><span class="share-chip-ic">${smIc.wa}</span><i>WhatsApp</i></button>
                  <button class="share-chip" data-net="x" type="button" role="tab" aria-selected="false"><span class="share-chip-ic">${smIc.x}</span><i>X</i></button>
                </div>
                <div class="share-lab-view">
                  <div class="share-lab-stage">

                    <div class="share-scene sc-copy on" data-net="copy">
                      <div class="sc-copywrap">
                        <div class="sc-link-card">
                          <div class="sc-link-thumb">${cImg("")}</div>
                          <div class="sc-link-meta"><small>SPREADHOPE.ORG</small><b>${esc(c.title)}</b></div>
                        </div>
                        <div class="sc-copybar">
                          <span class="sc-copy-glob"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.4" stroke="currentColor" stroke-width="1.6"/><path d="M3.6 12h16.8M12 3.6c2.3 2.3 2.3 14.5 0 16.8M12 3.6c-2.3 2.3-2.3 14.5 0 16.8" stroke="currentColor" stroke-width="1.6"/></svg></span>
                          <span class="sc-copy-url">spreadhope.org/c/${c.id}</span>
                          <button class="sc-copybtn" data-act="copy" type="button">Copy</button>
                        </div>
                        <p class="sc-copy-hint">Share this link anywhere</p>
                      </div>
                      <div class="sc-copy-done"><span class="sc-copy-check">${I.check}</span> Link copied</div>
                    </div>

                    <div class="share-scene sc-fb" data-net="fb">
                      <div class="sc-fbcard">
                        <div class="sc-fb-head"><span class="sc-fb-ava"></span><div class="sc-fb-who"><b>You</b><small>Public · Timeline</small></div><span class="sc-fb-brand">${smIc.fb}</span></div>
                        <div class="sc-fb-say">Please help — every bit counts 💙</div>
                        <div class="sc-fb-link">
                          <div class="sc-fb-thumb">${cImg("")}</div>
                          <div class="sc-fb-info"><small>SPREADHOPE.ORG</small><b>${esc(c.title)}</b><span class="sc-fb-blurb">${esc(c.blurb || "")}</span></div>
                        </div>
                        <div class="sc-fb-actions">
                          <span><svg viewBox="0 0 24 24" fill="none"><path d="M7 10v9M7 10l3.2-6.5c1.1 0 1.9 .9 1.9 2V8h4.6a1.8 1.8 0 0 1 1.8 2.1l-.9 5A1.8 1.8 0 0 1 16 19H7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>Like</span>
                          <span><svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 3V5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>Comment</span>
                          <span><svg viewBox="0 0 24 24" fill="none"><path d="M4 12v7h16v-7M12 3v12M8 7l4-4 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>Share</span>
                        </div>
                      </div>
                    </div>

                    <div class="share-scene sc-ig" data-net="ig">
                      <div class="sc-igstory">
                        ${cImg("sc-ig-img")}
                        <div class="sc-ig-grad"></div>
                        <div class="sc-ig-top"><span class="sc-ig-ring"><span class="sc-ig-ava"></span></span><span class="sc-ig-user">your story</span></div>
                        <div class="sc-ig-cap">${esc(c.title)}</div>
                        <div class="sc-ig-sticker"><span class="sc-ig-dot"></span>spreadhope.org</div>
                        <span class="sc-ig-tap"></span>
                      </div>
                    </div>

                    <div class="share-scene sc-wa" data-net="wa">
                      <div class="sc-wachat">
                        <div class="sc-wa-bar"><span class="sc-wa-ava"></span><div class="sc-wa-id"><b>Share with a friend</b><small>online</small></div><span class="sc-wa-wa">${smIc.wa}</span></div>
                        <div class="sc-wa-body">
                          <div class="sc-wa-bubble">
                            <div class="sc-wa-card">
                              <div class="sc-wa-thumb">${cImg("")}</div>
                              <div class="sc-wa-ctx"><b>${esc(c.title)}</b><small>spreadhope.org/c/${c.id}</small></div>
                            </div>
                            <span class="sc-wa-msg">Can you help? 🙏</span>
                            <span class="sc-wa-meta">now<svg class="sc-wa-tick" viewBox="0 0 20 12" fill="none"><path d="M2 7l3 3 6-7M8 10l1 .9 6-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="share-scene sc-x" data-net="x">
                      <div class="sc-xcard">
                        <span class="sc-x-ava"></span>
                        <div class="sc-x-body">
                          <div class="sc-x-head"><b>You</b><small>@you · now</small></div>
                          <p class="sc-x-text">Help ${esc(c.organizer.name.split(" ")[0])} reach the goal — every share counts. <span class="sc-x-link">spreadhope.org/c/${c.id}</span></p>
                          <div class="sc-x-media">${cImg("")}</div>
                          <div class="sc-x-actions">
                            <span><svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 3V5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>12</span>
                            <span><svg viewBox="0 0 24 24" fill="none"><path d="M4 8l3-3 3 3M7 5v9a2 2 0 0 0 2 2h6M20 16l-3 3-3-3M17 19v-9a2 2 0 0 0-2-2H9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>34</span>
                            <span><svg viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.6-9.3-9C1.3 8.4 2.6 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.4 0 4.7 3.4 3.3 6-2.3 4.4-9.3 9-9.3 9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>128</span>
                            <span><svg viewBox="0 0 24 24" fill="none"><path d="M4 20v-6M10 20V6M16 20v-9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>2.4K</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  <button class="share-lab-cta net-copy" data-cta type="button"><span class="share-lab-cta-ic">${I.copy}</span><span class="share-lab-cta-tx">Copy link</span></button>
                </div>
              </div>
            </section>

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
      window.CW.initReveal(); // scroll-in animation for the campaign's sections/cards (renders async via D.get)

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

      // share lab — interactive channel previews: per-channel CTA + auto-sizing stage + gentle auto-loop
      (() => {
        const lab = qs("[data-share-lab]");
        if (!lab) return;
        const campUrl = location.origin + location.pathname + "?id=" + c.id;
        const enc = encodeURIComponent(campUrl), t = encodeURIComponent(c.title);
        const chips = qsa(".share-chip", lab), scenes = qsa(".share-scene", lab);
        const cta = qs("[data-cta]", lab);
        const ctaIc = qs(".share-lab-cta-ic", cta), ctaTx = qs(".share-lab-cta-tx", cta);
        const order = ["copy", "fb", "ig", "wa", "x"];
        const CTA = {
          copy: { t: "Copy link", ic: I.copy },
          fb:   { t: "Share on Facebook", ic: smIc.fb },
          ig:   { t: "Create story", ic: smIc.ig },
          wa:   { t: "Share on WhatsApp", ic: smIc.wa },
          x:    { t: "Post on X", ic: smIc.x },
        };
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        let cur = null, timer = null;

        const doShare = (net) => {
          if (net === "fb") window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc}`, "_blank", "noopener");
          else if (net === "wa") window.open(`https://wa.me/?text=${t}%20${enc}`, "_blank", "noopener");
          else if (net === "x") window.open(`https://twitter.com/intent/tweet?text=${t}&url=${enc}`, "_blank", "noopener");
          else navigator.clipboard.writeText(campUrl).then(() => toast(net === "ig" ? "Link copied — paste it in your story" : "Link copied")).catch(() => toast("Couldn't copy the link", "err"));
        };
        const setActive = (net) => {
          if (net === cur) return;
          cur = net;
          chips.forEach((el) => { const on = el.dataset.net === net; el.classList.toggle("is-active", on); el.setAttribute("aria-selected", on ? "true" : "false"); });
          scenes.forEach((s) => s.classList.toggle("on", s.dataset.net === net));
          const cfg = CTA[net]; ctaTx.textContent = cfg.t; ctaIc.innerHTML = cfg.ic; cta.className = "share-lab-cta net-" + net;
        };
        const advance = () => setActive(order[(order.indexOf(cur) + 1) % order.length]);
        const stopAuto = () => { if (timer) { clearInterval(timer); timer = null; } };
        const startAuto = () => { if (reduce || timer) return; timer = setInterval(advance, 3800); };

        chips.forEach((b) => {
          b.addEventListener("click", () => { setActive(b.dataset.net); stopAuto(); startAuto(); });
          b.addEventListener("mouseenter", () => { if (matchMedia("(min-width: 861px)").matches) setActive(b.dataset.net); });
        });
        cta.addEventListener("click", () => doShare(cur));
        qsa("[data-act]", lab).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); doShare(b.dataset.act); }));

        lab.addEventListener("mouseenter", stopAuto);
        lab.addEventListener("mouseleave", startAuto);

        setActive("copy");
        startAuto();
      })();

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

      // words of support: "View all" → modal listing every message
      qs("#wordsSeeAll")?.addEventListener("click", () => {
        const m = document.createElement("div");
        m.className = "sup-modal-backdrop";
        m.innerHTML = `<div class="sup-modal" role="dialog" aria-modal="true" aria-label="Words of support">
          <div class="sup-modal-head"><h3>Words of support</h3><span class="sup-modal-meta">${messages.length} messages</span><button class="icon-btn" id="wordsModalClose" aria-label="Close">${I.close}</button></div>
          <div class="sup-modal-list cd-words-modal">${messages.map((d) => `<div class="cd-word"><div class="cd-word-msg">“${esc(d.message)}”</div><div class="cd-word-by">${I.heart}<span>${esc(d.name)}</span></div></div>`).join("")}</div></div>`;
        document.body.appendChild(m);
        window.CW.lockScroll(true);
        requestAnimationFrame(() => m.classList.add("open"));
        const close = () => { m.classList.remove("open"); window.CW.lockScroll(false); setTimeout(() => m.remove(), 320); };
        m.addEventListener("click", (e) => { if (e.target === m) close(); });
        qs("#wordsModalClose", m).addEventListener("click", close);
        const onEsc = (e) => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); } };
        document.addEventListener("keydown", onEsc);
      });

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
    const amts = [25, 50, 100, 75, 75, 150, 50, 200, 125, 25];
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
    const amts = [25, 50, 100, 75, 25, 150, 50, 200, 125, 50, 500, 250, 25, 1000, 75, 175];
    // 11 entries (coprime with amts' 16) + a different multiplier so the time varies WITHIN each amount group instead of repeating
    const ats = ["2h ago", "6h ago", "11h ago", "1d ago", "2d ago", "4d ago", "6d ago", "1w ago", "2w ago", "3w ago", "1mo ago"];
    let seed = 0; for (const ch of c.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const total = Math.max(c.donors, out.length);
    let k = 0;
    while (out.length < total) {
      const anon = (seed + k * 5) % 7 === 0;
      const name = anon ? "Anonymous" : `${firsts[(seed + k * 7) % firsts.length]} ${inits[(seed + k * 3) % inits.length]}`;
      out.push({ name, amount: amts[(seed + k * 11) % amts.length], message: "", at: ats[(seed + k * 3) % ats.length] });
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
          <p style="color:var(--slate-gray);font-size:14.5px;line-height:1.6;margin:0;overflow-wrap:anywhere;word-break:break-word">${esc((draft.story || "").slice(0, 220))}${(draft.story || "").length > 220 ? "…" : ""}</p></div>
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

  /* "Spread hope" — a small point of light rises from the donate button, with a few soft sparkles */
  function spreadHopeRise(originEl) {
    const r = originEl.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const layer = document.createElement("div");
    layer.className = "hope-rise-layer";
    const dot = document.createElement("span");
    dot.className = "hope-dot";
    dot.style.left = x + "px"; dot.style.top = y + "px";
    layer.appendChild(dot);
    for (let i = 0; i < 4; i++) {
      const s = document.createElement("span");
      s.className = "hope-spark";
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.setProperty("--dx", (i % 2 ? 1 : -1) * (12 + (i % 2 ? 6 : 0)) + "px");
      s.style.setProperty("--dl", (0.06 + i * 0.07).toFixed(2) + "s");
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1500);
  }

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
      window.CW.initReveal(); // scroll-in animation after async render
    });

    // ghost mirroring the checkout: steps, amount grid, fields, CTA + summary card
    function skeletonDonate() {
      const amt = `<div class="skel" style="height:58px;border-radius:var(--r-lg)"></div>`;
      return `<div class="ghost dn2">
        <div class="skel sk-text" style="width:150px;height:14px;margin-bottom:18px"></div>
        <div class="skel" style="width:100%;aspect-ratio:16/10;border-radius:var(--r-xl)"></div>
        <div class="skel" style="width:100%;height:108px;border-radius:var(--r-xl);margin-top:18px"></div>
        <div class="skel sk-title" style="width:62%;height:24px;margin:28px 0 14px"></div>
        <div class="dn2-amounts">${amt}${amt}${amt}${amt}${amt}${amt}</div>
        <div class="skel" style="width:100%;height:58px;border-radius:var(--r-pill);margin-top:22px"></div>
      </div>`;
    }

    function renderDonate(c) {
      const pct = D.pct(c);
      const amounts = [25, 50, 100, 300, 500, 1000];
      const suggested = 100;
      const lockIc = '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2"/></svg>';
      const mailIc = '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="m4 8 8 5 8-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      root.innerHTML = `
      <div class="dn2">
        <a class="dn2-back" href="campaign.html?id=${c.id}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Back to campaign</span></a>

        <div class="dn2-grid">
          <!-- LEFT: campaign summary — one cohesive card (image → title → organizer → progress) -->
          <aside class="dn2-summary">
            <div class="dn2-sumcard">
              <div class="dn2-hero">
                <img src="${c.cover}" alt="${esc(c.title)}" onerror="this.onerror=null;this.src='${D.fallbackImg(c.category)}'">
                <div class="dn2-hero-cap"><h1>${esc(c.title)}</h1></div>
              </div>
              <div class="dn2-sumbody">
                <div class="dn2-progress">
                  <div class="dn2-raised-top">
                    <div class="dn2-raised-left">
                      <b class="dn2-amt">${money(c.raised)}</b>
                      <div class="dn2-goal">raised of <b>${money(c.goal)}</b> goal</div>
                    </div>
                    <span class="dn2-pct">${pct}%</span>
                  </div>
                  <div class="careflow dn2-bar"><div class="careflow-track"><div class="careflow-fill" style="width:${pct}%"></div></div></div>
                  <div class="dn2-meta"><span class="dn2-meta-ic">${I.heart}</span><span>${c.donors.toLocaleString("en-US")} people have donated</span></div>
                </div>
              </div>
            </div>
          </aside>

          <!-- RIGHT: donation action card -->
          <section class="dn2-main">
            <div class="dn2-action">
              <h2 class="dn2-h">Choose your donation amount</h2>
              <div class="dn2-amounts">
                ${amounts.map((a) => `<button type="button" class="dn2-opt${a === suggested ? " dn2-suggested" : ""}" data-amt="${a}">${a === suggested ? `<span class="dn2-sug-badge">Suggested</span>` : ""}${money(a)}</button>`).join("")}
              </div>

              <button class="dn2-donate is-empty" id="dDonate" type="button"><span id="dBtnLabel">Choose an amount</span></button>
              <p class="dn2-secure">${lockIc}<span>Secure checkout on the next step</span></p>
            </div>

            <div class="dn2-clarity">
              <span class="dn2-clarity-ic">${I.shield}</span>
              <div class="dn2-clarity-tx">
                <b>Your donation is protected</b>
                <p>Backed by our terms, refund policy and privacy commitments — give with confidence.</p>
              </div>
            </div>
          </section>
        </div>
      </div>`;

      let amount = 0;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

      const setAmount = (v) => { amount = v; qsa(".dn2-opt").forEach((x) => x.classList.toggle("sel", +x.dataset.amt === v)); const btn = qs("#dDonate"); btn.classList.remove("is-empty"); qs("#dBtnLabel").textContent = "Donate " + money(v); };
      qsa(".dn2-opt").forEach((b) => b.addEventListener("click", () => setAmount(+b.dataset.amt)));

      // single step — choose an amount, then donate straight through to thank-you (words of support live there)
      qs("#dDonate").addEventListener("click", () => {
        if (!amount || amount < 1) { toast("Please choose an amount", "err"); return; }
        const btn = qs("#dDonate");
        btn.disabled = true;
        const dest = "thank-you.html?id=" + c.id + "&amt=" + amount + "&hope=1";
        // mock — no real payment provider; a small "spread hope" light rises, then we navigate
        if (reduce) { qs("#dBtnLabel").textContent = "Processing…"; setTimeout(() => { location.href = dest; }, 220); return; }
        btn.classList.add("dn-glow");
        spreadHopeRise(btn);
        setTimeout(() => { location.href = dest; }, 1000);
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
    const amt = parseInt(param("amt"), 10);

    // campaign cover image at the top of the card
    const cover = qs("#tyCover");
    if (cover) { cover.src = c.cover; cover.alt = c.title; cover.onerror = () => { cover.src = "assets/img/hero.png"; }; }

    // amount pill + organizer-aware subtext
    if (amt > 0) qs("#tyAmount").textContent = money(amt) + " donated";
    else { const pill = qs("#tyAmount"); if (pill) pill.style.display = "none"; }
    qs("#tySub").innerHTML = `Your gift goes straight to <b>${esc(c.organizer.name)}</b>'s fundraiser.`;

    // primary action → back to the campaign just supported
    qs("#tyBackLink").href = "campaign.html?id=" + c.id;
    qs("#tyMoreLink").href = "browse-campaigns.html";

    // "spread hope" arrival: the light point lands, pulses into the check, then the content reveals
    if (param("hope") && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const card = qs(".confirm-card");
      if (card) card.classList.add("hope-arrive");
    }

    // share this fundraiser — native share if available, else copy the campaign link
    qs("#tyShare").addEventListener("click", (e) => {
      e.preventDefault();
      const url = "campaign.html?id=" + c.id, full = location.origin + location.pathname.replace(/thank-you\.html$/, "") + url;
      if (navigator.share) { navigator.share({ title: c.title, text: "I just supported: " + c.title, url: full }).catch(() => {}); }
      else navigator.clipboard.writeText(full).then(() => toast("Link copied")).catch(() => toast("Couldn't copy the link", "err"));
    });
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

  /* =================================================================
     HOW-IT-WORKS demos — animated donor / organizer flows (mock UI)
     ================================================================= */
  function buildHowDemo(kind) {
    const mount = qs("#hdMount");
    if (!mount) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ck = '<svg viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const hr = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.6-9.3-9C1.3 8.4 2.6 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.4 0 4.7 3.4 3.3 6-2.3 4.4-9.3 9-9.3 9Z"/></svg>';
    const mag = '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m20 20-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    const vf = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" opacity=".18"/><path d="m8.4 12 2.5 2.5 4.7-5.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const lock = '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2"/></svg>';
    const mail = '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="m4 8 8 5 8-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const chev = '<svg viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const cs = D.all();
    const c1 = cs[0];
    const cimg = (c) => `<img src="${c.cover}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/img/hero.png'">`;
    const flow = (pct, gw) => `<span class="careflow"><span class="careflow-track"><span class="careflow-fill${gw ? " gw" : ""}" style="${gw ? "--w:" + pct + "%" : "width:" + pct + "%"}"></span></span></span>`;
    const card = (c, cls, cur) => `<a class="d-card${cls || ""}"><span class="d-cimg">${cimg(c)}<b class="m-tag">${esc(c.category)}</b><i class="m-mh">${hr}</i></span><span class="d-cb"><span class="d-ct">${esc(c.title)}</span>${flow(D.pct(c))}<span class="d-cn"><b>${money(c.raised)}</b> of ${money(c.goal)}</span></span>${cur || ""}</a>`;
    let caps, scenes, url;
    if (kind === "org") {
      url = "spreadhope.org/start";
      caps = ["Start a campaign", "Add a clear title", "Add image & story", "Set your goal & publish", "Track support roll in"];
      scenes = [
        `<div class="m-screen m-center"><div class="m-canvas"><span class="m-canvas-ic">+</span><span class="m-canvas-tx">New fundraiser</span></div><button class="btn btn-primary d-btn pulse" type="button">Create a campaign<span class="m-cursor"></span></button></div>`,
        `<div class="m-screen m-split"><div class="m-form"><div class="m-flabel">Campaign title</div><div class="m-input active"><span class="m-typed">Send Jonas to study</span><span class="m-caret"></span></div><div class="m-flabel">Category</div><div class="m-input selin"><span>Education</span>${chev}</div></div><div class="m-prev"><span class="d-phero ph"></span><b class="m-ptag in">Education</b><i class="m-h1 in"></i><i class="m-p dim"></i></div></div>`,
        `<div class="m-screen m-split"><div class="m-form"><div class="m-flabel">Cover image</div><div class="m-upload done">${ck}<span>cover.jpg added</span></div><div class="m-flabel">Your story</div><div class="m-input tall"><i class="ml"></i><i class="ml"></i><i class="ml w60"></i></div></div><div class="m-prev"><span class="d-phero appear">${cimg(c1)}</span><b class="m-ptag">Education</b><i class="m-h1"></i><i class="m-p in"></i><i class="m-p in d2 w60"></i></div></div>`,
        `<div class="m-screen m-split"><div class="m-form"><div class="m-flabel">Funding goal</div><div class="m-input goal">$28,000</div><div class="m-reviewed">${ck}<span>Passed review</span></div><button class="m-cta pub" type="button">Publish campaign<span class="m-cursor"></span></button></div><div class="m-prev"><span class="d-phero">${cimg(c1)}</span><b class="m-ptag">Education</b><i class="m-h1"></i>${flow(8, true)}<div class="m-statusrow"><span class="m-status">● Live</span><span class="m-goaltx">$0 of $28,000</span></div></div></div>`,
        `<div class="m-screen m-dash"><div class="m-dash-h"><span class="m-live">● Live</span><span>Your dashboard</span></div><div class="m-stats"><div class="m-stat"><b class="m-count" data-to="1250" data-pre="$">$0</b><span>raised</span></div><div class="m-stat"><b class="m-count" data-to="18">0</b><span>supporters</span></div><div class="m-stat"><b class="m-count" data-to="32">0</b><span>hearts</span></div></div>${flow(45, true)}<div class="m-feedlist"><div class="m-frow"><span class="m-fav">A</span><i class="m-frtx"></i><b class="m-fram">+$50</b></div><div class="m-frow"><span class="m-fav">M</span><i class="m-frtx w70"></i><b class="m-fram">+$25</b></div><div class="m-frow"><span class="m-fav">P</span><i class="m-frtx w50"></i><b class="m-fram">+$100</b></div></div><div class="m-floaters"><i>${hr}</i><i>${hr}</i><i>${hr}</i></div></div>`,
      ];
    } else {
      url = "spreadhope.org";
      caps = ["Browse campaigns", "Open the campaign", "Choose your amount", "Confirm securely", "See the impact grow"];
      scenes = [
        `<div class="m-screen d-browse"><div class="d-srch">${mag}<span>${esc(c1.category.toLowerCase())} near me</span></div><div class="d-cards">${card(cs[0])}${card(cs[1], " pick", '<span class="m-cursor"></span>')}${card(cs[2])}</div></div>`,
        `<div class="m-screen d-camp"><span class="d-hero">${cimg(c1)}<b class="m-tag light">${esc(c1.category)}</b></span><div class="m-org"><span class="m-oav">${initials(c1.organizer.name)}</span><span class="m-oinfo"><b>${esc(c1.organizer.name)} <i class="m-vf">${vf}</i></b><span>Organizer · ${esc(c1.location || "Verified")}</span></span></div><div class="d-ct big">${esc(c1.title)}</div><div class="m-statrow"><span><b>${money(c1.raised)}</b> raised</span><span class="m-srpct">${D.pct(c1)}%</span></div>${flow(D.pct(c1))}<button class="btn btn-primary btn-block d-btn" type="button">Donate now<span class="m-cursor"></span></button></div>`,
        `<div class="m-screen d-don"><div class="d-donhd"><span class="d-mini">${cimg(c1)}</span><span class="d-minitx"><b>${esc(c1.title)}</b><span>${money(c1.raised)} raised · ${D.pct(c1)}%</span></span></div><div class="m-label">Choose your amount</div><div class="m-amts"><span class="m-amt">$25</span><span class="m-amt sel">$50 <i class="m-amtck">${ck}</i></span><span class="m-amt">$100</span><span class="m-amt">$300</span><span class="m-amt">$500</span><span class="m-amt">$1k</span></div><button class="btn btn-primary btn-block d-btn" type="button">Donate $50<span class="m-cursor"></span></button><div class="m-secure2">${lock}<span>Secure &amp; protected</span></div></div>`,
        `<div class="m-screen m-conf"><span class="m-bigcheck">${ck}<i class="m-spark s1"></i><i class="m-spark s2"></i><i class="m-spark s3"></i><i class="m-spark s4"></i></span><div class="m-conf-t">Donation sent</div><div class="m-conf-amt">$50 · ${esc(c1.title)}</div><div class="m-conf-d">${mail}<span>Receipt on its way</span></div></div>`,
        `<div class="m-screen d-imp"><a class="d-card big"><span class="d-cimg">${cimg(c1)}<b class="m-tag">${esc(c1.category)}</b></span><span class="d-cb"><span class="d-ct">${esc(c1.title)}</span>${flow(Math.min(99, D.pct(c1) + 4), true)}<span class="d-cn"><b class="m-count" data-pre="$" data-from="${c1.raised}" data-to="${c1.raised + 250}">${money(c1.raised)}</b> of ${money(c1.goal)}</span></span></a><div class="d-impline">${hr}<span><b>+3</b> supporters just now</span></div><div class="m-floaters"><i>${hr}<u>+$50</u></i><i>${hr}<u>+$25</u></i><i>${hr}</i><i>${hr}<u>+$100</u></i></div></div>`,
      ];
    }
    mount.className = "hd reveal " + (mount.classList.contains("in") ? "in " : "") + (kind === "org" ? "hd-org" : "hd-donor");
    mount.innerHTML = `
      <div class="hd-device">
        <div class="hd-chrome"><span class="hd-cdot"></span><span class="hd-cdot"></span><span class="hd-cdot"></span><span class="hd-url">${url}</span></div>
        <div class="hd-screens">${scenes.map((s, i) => `<div class="hd-scene${i === 0 ? " on" : ""}" data-s="${i}">${s}</div>`).join("")}</div>
      </div>
      <div class="hd-foot"><div class="hd-cap" id="hdCap">${caps[0]}</div><div class="hd-dots" id="hdDots">${caps.map((_, i) => `<button type="button" data-i="${i}" class="${i === 0 ? "on" : ""}" aria-label="Step ${i + 1}"></button>`).join("")}</div></div>`;
    const sceneEls = qsa(".hd-scene", mount);
    const cap = qs("#hdCap", mount);
    const dots = qsa("#hdDots button", mount);
    let i = 0, timer = null;
    const countUp = (el) => {
      const to = +el.dataset.to, from = +(el.dataset.from || 0), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
      if (reduce) { el.textContent = pre + to.toLocaleString("en-US") + suf; return; }
      const t0 = performance.now(), dur = 1100;
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur); const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); el.textContent = pre + v.toLocaleString("en-US") + suf; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    };
    const show = (n) => {
      i = n;
      sceneEls.forEach((s, k) => s.classList.toggle("on", k === n));
      dots.forEach((d, k) => d.classList.toggle("on", k === n));
      cap.textContent = caps[n];
      qsa(".m-count", sceneEls[n]).forEach(countUp);
    };
    show(0);
    dots.forEach((d) => d.addEventListener("click", () => { show(+d.dataset.i); if (timer) { clearInterval(timer); start(); } }));
    function start() { timer = setInterval(() => { if (!document.hidden) show((i + 1) % sceneEls.length); }, 3200); }
    if (!reduce) start();
  }
  PAGES.howdonate = () => buildHowDemo("donor");
  PAGES.howcreate = () => buildHowDemo("org");

  /* ---------- Dispatch ---------- */
  function run() {
    initFAQ();
    const page = document.body.dataset.page;
    const fn = PAGES[page];
    if (fn) fn();
    // one reveal pass after the page renders — auto-tags sections/cards for scroll-in animation (legal pages skip themselves)
    window.CW.initReveal();

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
