/* =====================================================================
   CareWay — Page controllers (dispatched by <body data-page>)
   ===================================================================== */
(function () {
  "use strict";
  const D = window.CareWayData;
  const { I, esc, money, initials, qs, qsa, campaignCard, featuredCard, skeletonCard, toast, share, observeNew } = window.CW;
  const param = (k) => new URLSearchParams(location.search).get(k);

  const PAGES = {};

  /* =================================================================
     HOME
     ================================================================= */
  PAGES.home = function () {
    const feat = qs("#featuredSlot");
    if (feat) feat.innerHTML = featuredCard(D.featured());
    const active = qs("#activeSlot");
    if (active) active.innerHTML = D.active(3).map((c) => campaignCard(c)).join("");
    const urgent = qs("#urgentSlot");
    if (urgent) {
      const u = D.urgent(3);
      urgent.innerHTML = u.map((c, i) => campaignCard(c, { peek: i === 2 })).join("");
    }
    observeNew();
    initCareFlow();
  };

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

    let stage = 0;
    function setStage(s) {
      stage = s % 4;
      stepCards.forEach((c) => c.classList.toggle("active", +c.dataset.step === stage));
      if (stage === 0) { chips.forEach((c) => c.classList.remove("sel")); donate.classList.remove("armed"); confirm.classList.remove("show"); fill.style.width = "32%"; }
      if (stage === 1) { chips.forEach((c, i) => c.classList.toggle("sel", i === 1)); donate.classList.add("armed"); }
      if (stage === 2) { donate.textContent = "Thank you ♥"; fill.style.width = "58%"; }
      if (stage === 3) { confirm.classList.add("show"); }
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
    const chipsBox = qs("#activeChips");
    const resultsMeta = qs("#resultsMeta");
    const pager = qs("#pagination");
    const filterBtn = qs("#filterBtn");
    const sheet = qs("#filterSheet");
    const sheetBackdrop = qs("#sheetBackdrop");
    const searchInput = qs("#browseSearch");

    const state = {
      q: param("q") || "",
      category: param("category") || "All",
      status: param("status") || "any",
      sort: param("sort") || "recent",
      page: 1,
    };
    if (searchInput) searchInput.value = state.q;

    // build filter sheet options
    function buildSheet() {
      const body = qs("#sheetBody");
      const groupHTML = (title, opts, current, gkey) => `
        <div class="fgroup">
          <h4>${title}</h4>
          <div class="fopts">${opts.map((o) => {
            const key = typeof o === "string" ? o : o.key;
            const label = typeof o === "string" ? o : o.label;
            return `<button class="fopt ${current === key ? "sel" : ""}" data-group="${gkey}" data-key="${key}">${label}</button>`;
          }).join("")}</div>
        </div>`;
      body.innerHTML =
        groupHTML("Category", D.categories, state.category, "category") +
        groupHTML("Status", D.statuses, state.status, "status") +
        groupHTML("Sort by", D.sorts, state.sort, "sort");
      qsa(".fopt", body).forEach((b) => b.addEventListener("click", () => {
        const g = b.dataset.group;
        qsa(`.fopt[data-group="${g}"]`, body).forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        draft[g] = b.dataset.key;
      }));
    }
    let draft = { ...state };

    function openSheet() { draft = { ...state }; buildSheet(); sheet.classList.add("open"); sheetBackdrop.classList.add("open"); window.CW.lockScroll(true); }
    function closeSheet() { sheet.classList.remove("open"); sheetBackdrop.classList.remove("open"); window.CW.lockScroll(false); }
    filterBtn.addEventListener("click", openSheet);
    sheetBackdrop.addEventListener("click", closeSheet);
    qs("#sheetClose").addEventListener("click", closeSheet);
    qs("#sheetApply").addEventListener("click", () => { Object.assign(state, draft); state.page = 1; closeSheet(); sync(); load(); });
    qs("#sheetClear").addEventListener("click", () => { draft = { q: state.q, category: "All", status: "any", sort: "recent", page: 1 }; buildSheet(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

    let st;
    if (searchInput) searchInput.addEventListener("input", () => { clearTimeout(st); st = setTimeout(() => { state.q = searchInput.value.trim(); state.page = 1; sync(); load(); }, 280); });

    function activeFilterCount() {
      let n = 0;
      if (state.category !== "All") n++;
      if (state.status !== "any") n++;
      if (state.sort !== "recent") n++;
      return n;
    }

    function renderChips() {
      const chips = [];
      if (state.q) chips.push(["q", `“${state.q}”`]);
      if (state.category !== "All") chips.push(["category", state.category]);
      if (state.status !== "any") chips.push(["status", D.statuses.find((s) => s.key === state.status).label]);
      if (state.sort !== "recent") chips.push(["sort", D.sorts.find((s) => s.key === state.sort).label]);
      chipsBox.innerHTML = chips.map(([k, label]) =>
        `<span class="fchip">${esc(label)}<button data-clear="${k}" aria-label="Remove filter">${I.close}</button></span>`).join("") +
        (chips.length ? `<button class="clear-all" id="clearAll">Clear all</button>` : "");
      qsa("[data-clear]", chipsBox).forEach((b) => b.addEventListener("click", () => {
        const k = b.dataset.clear;
        if (k === "q") { state.q = ""; if (searchInput) searchInput.value = ""; }
        else if (k === "category") state.category = "All";
        else if (k === "status") state.status = "any";
        else if (k === "sort") state.sort = "recent";
        state.page = 1; sync(); load();
      }));
      const ca = qs("#clearAll");
      if (ca) ca.addEventListener("click", () => { state.q = ""; state.category = "All"; state.status = "any"; state.sort = "recent"; state.page = 1; if (searchInput) searchInput.value = ""; sync(); load(); });
      const count = activeFilterCount();
      qs("#filterCount").innerHTML = count ? `<span class="count">${count}</span>` : "";
    }

    function sync() {
      const u = new URLSearchParams();
      if (state.q) u.set("q", state.q);
      if (state.category !== "All") u.set("category", state.category);
      if (state.status !== "any") u.set("status", state.status);
      if (state.sort !== "recent") u.set("sort", state.sort);
      history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
    }

    function showSkeletons() {
      grid.innerHTML = Array.from({ length: 6 }).map(skeletonCard).join("");
      resultsMeta.textContent = "Finding fundraisers…";
      pager.innerHTML = "";
    }

    async function load() {
      renderChips();
      showSkeletons();
      const res = await D.list(state);
      if (!res.items.length) {
        grid.innerHTML = "";
        qs("#emptyState").classList.remove("hide");
        resultsMeta.textContent = "";
        pager.innerHTML = "";
        return;
      }
      qs("#emptyState").classList.add("hide");
      grid.innerHTML = res.items.map((c) => campaignCard(c)).join("");
      resultsMeta.innerHTML = `<strong>${res.total}</strong> fundraiser${res.total === 1 ? "" : "s"} found`;
      observeNew(grid);
      // pagination
      if (res.pages > 1) {
        let html = `<button ${state.page === 1 ? "disabled" : ""} data-pg="${state.page - 1}" aria-label="Previous">${I.chevron.replace('d="m9 6 6 6-6 6"', 'd="m15 6-6 6 6 6"')}</button>`;
        for (let i = 1; i <= res.pages; i++) html += `<button class="${i === state.page ? "active" : ""}" data-pg="${i}">${i}</button>`;
        html += `<button ${state.page === res.pages ? "disabled" : ""} data-pg="${state.page + 1}" aria-label="Next">${I.chevron}</button>`;
        pager.innerHTML = html;
        qsa("[data-pg]", pager).forEach((b) => b.addEventListener("click", () => { if (b.disabled) return; state.page = +b.dataset.pg; load(); window.scrollTo({ top: grid.offsetTop - 120, behavior: "smooth" }); }));
      } else pager.innerHTML = "";
    }

    qs("#emptyClear")?.addEventListener("click", () => { state.q = ""; state.category = "All"; state.status = "any"; state.sort = "recent"; state.page = 1; if (searchInput) searchInput.value = ""; sync(); load(); });

    load();
  };

  /* =================================================================
     CAMPAIGN DETAIL
     ================================================================= */
  PAGES.campaign = function () {
    const id = param("id");
    const root = qs("#campaignRoot");
    root.innerHTML = skeletonDetail();

    D.get(id).then((c) => {
      if (!c) { location.replace("404.html"); return; }
      document.title = `${c.title} · CareWay`;
      renderDetail(c);
    });

    function skeletonDetail() {
      return `<div class="cd-grid">
        <div><div class="skel" style="aspect-ratio:16/10;border-radius:24px"></div>
        <div class="skel skel-line" style="width:50%;height:18px;margin-top:24px"></div>
        <div class="skel skel-line" style="width:90%;height:30px;margin-top:12px"></div>
        <div class="skel skel-line" style="width:70%;height:30px"></div></div>
        <div class="skel" style="height:340px;border-radius:24px"></div></div>`;
    }

    function renderDetail(c) {
      const p = D.pct(c);
      const gallery = (c.gallery && c.gallery.length ? c.gallery : [c.cover]);
      const statusBadge = c.status === "urgent" ? '<span class="badge-status urgent">Urgent</span>' : (c.status === "almost" || p >= 80) ? '<span class="badge-status almost">Almost there</span>' : "";

      // supporters — fill to a believable count with deterministic seed
      const supporters = buildSupporters(c);

      root.innerHTML = `
      <div class="breadcrumb"><a href="index.html">Home</a>${I.chevron}<a href="browse-campaigns.html">Campaigns</a>${I.chevron}<span>${esc(c.category)}</span></div>
      <div class="cd-grid">
        <div class="cd-main">
          <div class="cd-gallery">
            <div class="main-img"><img id="mainImg" src="${gallery[0]}" alt="${esc(c.title)}" width="900" height="563" onerror="this.src='${D.fallbackImg(c.category)}'"></div>
          </div>
          ${gallery.length > 1 ? `<div class="cd-thumbs">${gallery.map((g, i) => `<button class="${i === 0 ? "active" : ""}" data-img="${g}"><img src="${g}" alt="" loading="lazy" onerror="this.src='${D.fallbackImg(c.category)}'"></button>`).join("")}</div>` : ""}

          <div class="cd-head">
            <div class="cd-tags">
              <span class="badge-cat" style="background:var(--sage-wash)">${esc(c.category)}</span>
              ${statusBadge}
              ${c.verified ? `<span class="verified">${I.checkBadge}Verified story</span>` : ""}
            </div>
            <h1>${esc(c.title)}</h1>
            <div class="cd-metaline">
              <span>${I.pin}${esc(c.location)}</span>
              <span>${I.users}${c.donors} supporters</span>
              <span>${I.clock}Created ${formatDate(c.createdAt)}</span>
            </div>
          </div>
        </div>

        <aside>
          <div class="donate-panel is-rail">
            <div class="dp-raised">${money(c.raised)}</div>
            <div class="dp-goal">raised of <b>${money(c.goal)}</b> goal</div>
            <div class="careflow"><div class="careflow-track"><div class="careflow-fill" data-fill="${p}"></div></div></div>
            <div class="dp-stats">
              <div class="dp-stat"><div class="n">${p}%</div><div class="l">funded</div></div>
              <div class="dp-stat"><div class="n">${c.donors}</div><div class="l">supporters</div></div>
              <div class="dp-stat"><div class="n">${daysAgo(c.createdAt)}</div><div class="l">days running</div></div>
            </div>
            <div class="dp-actions">
              <button class="btn btn-primary btn-lg btn-block" id="donateBtn">${I.heart}Donate now</button>
              <button class="btn btn-ghost btn-block" id="shareBtn">${I.share}Share this fundraiser</button>
            </div>
            <div class="donor-rotator" id="donorRotator"></div>
          </div>
        </aside>
      </div>

      <div class="story-section">
        <h2>${esc(c.organizer.name)} is asking for your support</h2>
        <div class="story-collapse collapsed" id="storyCollapse">
          <div class="story-block">
            <h3>The story</h3>${paras(c.story.the_story)}
            <h3>Why support is needed</h3>${paras(c.story.why)}
            <h3>How funds will help</h3>${paras(c.story.how)}
            <h3>A note from the organizer</h3>${paras(c.story.note)}
          </div>
        </div>
        <button class="btn btn-soft story-toggle" id="storyToggle">Read more</button>
      </div>

      ${clarityPanel()}

      <div class="supporters-section story-section" style="max-width:760px">
        <h2>Recent supporters</h2>
        <div class="supporters-list">${supporters.map(supporterRow).join("")}</div>
      </div>

      <div class="organizer-card">
        <img class="oav" src="${c.organizer.avatar}" alt="${esc(c.organizer.name)}" width="64" height="64" onerror="this.style.visibility='hidden'">
        <div class="oinfo">
          <div class="lbl">Organized by</div>
          <div class="nm">${esc(c.organizer.name)}</div>
          <div class="meta">${esc(c.organizer.relation)} · ${esc(c.location)} · ${c.verified ? "Identity verified" : "Pending verification"}</div>
        </div>
      </div>

      <div class="share-section">
        <h3>Help this story reach more people</h3>
        <p>A share can be worth as much as a donation. Spread the word.</p>
        <div class="share-btns">
          <a href="#" data-sh="copy" aria-label="Copy link">${I.copy}</a>
          <a href="#" data-sh="wa" aria-label="WhatsApp">${I.wa}</a>
          <a href="#" data-sh="fb" aria-label="Facebook">${I.fb}</a>
          <a href="#" data-sh="x" aria-label="X">${I.x}</a>
        </div>
      </div>`;

      // sticky mobile bar
      const sticky = document.createElement("div");
      sticky.className = "sticky-donate";
      sticky.innerHTML = `<div class="sd-info"><div class="r">${money(c.raised)} raised</div><div class="p">${p}% of ${money(c.goal)}</div></div><button class="btn btn-primary" id="stickyDonate">${I.heart}Donate</button>`;
      document.body.appendChild(sticky);

      window.CW.initProgress(root);

      // gallery thumbs
      qsa(".cd-thumbs button").forEach((b) => b.addEventListener("click", () => {
        qsa(".cd-thumbs button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        qs("#mainImg").src = b.dataset.img;
      }));

      // story collapse
      const coll = qs("#storyCollapse");
      const tog = qs("#storyToggle");
      tog.addEventListener("click", () => {
        const open = coll.classList.toggle("collapsed");
        tog.textContent = open ? "Read more" : "Show less";
        if (open) coll.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

      // donate (mock)
      const donate = () => toast("Donations open once a payment provider is connected.");
      qs("#donateBtn").addEventListener("click", donate);
      qs("#stickyDonate").addEventListener("click", donate);
      qs("#shareBtn").addEventListener("click", () => share(c.title));

      qsa("[data-sh]").forEach((a) => a.addEventListener("click", (e) => {
        e.preventDefault();
        const k = a.dataset.sh, url = location.href, t = encodeURIComponent("Support: " + c.title);
        if (k === "copy") { navigator.clipboard.writeText(url).then(() => toast("Link copied")); }
        else if (k === "wa") window.open(`https://wa.me/?text=${t}%20${encodeURIComponent(url)}`, "_blank");
        else if (k === "fb") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        else if (k === "x") window.open(`https://twitter.com/intent/tweet?text=${t}&url=${encodeURIComponent(url)}`, "_blank");
      }));

      // donor rotator
      rotateDonors(supporters);
    }

    function rotateDonors(list) {
      const el = qs("#donorRotator");
      if (!el || !list.length) { if (el) el.style.display = "none"; return; }
      let i = 0;
      const show = () => {
        const d = list[i % list.length];
        el.classList.remove("donor-rot-anim");
        void el.offsetWidth;
        el.innerHTML = `<div class="av">${initials(d.name)}</div><div class="tx"><b>${esc(d.name)}</b> gave ${money(d.amount)}${d.at ? " · " + esc(d.at) : ""}</div>`;
        el.classList.add("donor-rot-anim");
        i++;
      };
      show();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(show, 3400);
    }
  };

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

  function clarityPanel() {
    const items = [
      { ic: I.eye, h: "Reviewed before publishing", p: "Campaigns are checked before going live." },
      { ic: I.compass, h: "Clear path for funds", p: "Support is directed toward the organizer's stated goal." },
      { ic: I.flag, h: "Reports are taken seriously", p: "Concerns can be reviewed by the platform team." },
    ];
    return `<div class="clarity-panel story-section mt-0" style="max-width:none">
      <h2>Support with clarity</h2>
      <p>We design every fundraiser to keep giving transparent and trustworthy.</p>
      <div class="clarity-items">${items.map((x) => `<div class="clarity-item"><div class="ci">${x.ic}</div><h4>${x.h}</h4><p>${x.p}</p></div>`).join("")}</div>
      <a class="link-arrow" href="how-it-works.html">Learn how protection works ${I.arrow}</a>
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
          <div class="ccard-img"><div class="badges"><span class="badge-cat">${esc(cat)}</span></div>
            <img src="${cover}" alt="" onerror="this.src='${D.fallbackImg(draft.category || "Community")}'"></div>
          <div class="ccard-body">
            <div class="loc">${I.pin}${esc(loc)}</div>
            <h3 class="ccard-title">${esc(title)}</h3>
            <div class="careflow"><div class="careflow-track"><div class="careflow-fill" style="width:2%"></div></div>
              <div class="careflow-stats"><div class="raised">$0 <span>raised of ${goal ? money(goal) : "$—"}</span></div><div class="pct">0%</div></div>
            </div>
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
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
