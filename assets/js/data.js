/* =====================================================================
   CareWay — Data Layer (MOCK)
   ---------------------------------------------------------------------
   This is the ONLY place mock data lives. The public API exposed on
   window.CareWayData mirrors what a real async backend would offer, so
   swapping this file for real fetch()/Supabase calls later requires no
   changes in the UI code — every method already returns a Promise.
   ===================================================================== */
(function () {
  "use strict";

  // Deterministic image helper (Unsplash, no key needed). Category fallbacks.
  const IMG = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w || 900}&q=70`;

  const CATEGORY_FALLBACK = {
    Medical: "1576091160550-2173dba999ef",
    Emergency: "1542343742-8b5d8f6b4c7e",
    Family: "1511895426328-dc8714191300",
    Education: "1509062522246-3755977927d7",
    Animals: "1450778869180-41d0601e046e",
    Community: "1531206715517-5c0ba140b2b8",
  };

  // --- Mock campaigns -------------------------------------------------
  const CAMPAIGNS = [
    {
      id: "leila-recovery",
      title: "Help Leila walk again after the accident",
      category: "Medical",
      status: "urgent",
      location: "Portland, OR",
      raised: 38420, goal: 60000, donors: 412,
      featured: true,
      verified: true,
      createdAt: "2026-05-28",
      organizer: { name: "Marcus Bell", relation: "Brother", avatar: IMG("1500648767791-00dcc994a43e", 200) },
      cover: IMG("1579684385127-1ef15d508118"),
      gallery: [IMG("1579684385127-1ef15d508118"), IMG("1505751172876-fa1923c5c528"), IMG("1538108149393-fbbd81895907")],
      blurb: "After a cycling accident, Leila faces months of rehabilitation. We're raising funds for her surgery and physical therapy so she can take her first steps again.",
      story: {
        the_story: [
          "Three weeks ago, my sister Leila was cycling home from her shift at the children's hospital when a car turned without looking. In an instant, the life she had built — her work, her independence, her early-morning runs by the river — was put on hold.",
          "The doctors tell us she will walk again, but only with surgery and a long, patient course of rehabilitation. Leila has spent her whole career caring for other people. Now, for the first time, she's the one who needs help — and she's far too proud to ask for it herself.",
        ],
        why: [
          "Leila's insurance covers the emergency care, but not the specialised reconstructive surgery her surgeon recommends, nor the six months of physical therapy that follow. Without them, her recovery could stall — or leave her with lasting pain.",
        ],
        how: [
          "Every dollar goes directly toward Leila's medical costs: $34,000 for the surgery, $18,000 for physical therapy and mobility equipment, and $8,000 to cover her rent and bills while she's unable to work. We'll post receipts and progress updates here as we go.",
        ],
        note: [
          "Leila doesn't know I started this page yet. I wanted to be able to tell her that people she's never met decided her story was worth a way forward. Thank you, from the bottom of our family's heart. — Marcus",
        ],
      },
      supporters: [
        { name: "Anonymous", amount: 500, message: "Leila treated my son in the ER last year. Sending love.", at: "2h ago" },
        { name: "Priya N.", amount: 100, message: "Get well soon, we're rooting for you.", at: "5h ago" },
        { name: "The Okafor family", amount: 250, message: "", at: "1d ago" },
        { name: "Dan R.", amount: 50, message: "One step at a time.", at: "1d ago" },
      ],
    },
    {
      id: "rebuild-amara-bakery",
      title: "Rebuild Amara's bakery after the fire",
      category: "Emergency",
      status: "urgent",
      location: "Austin, TX",
      raised: 21750, goal: 45000, donors: 289,
      verified: true,
      createdAt: "2026-06-01",
      organizer: { name: "Amara Osei", relation: "Owner", avatar: IMG("1438761681033-6461ffad8d80", 200) },
      cover: IMG("1509440159596-0249088772ff"),
      gallery: [IMG("1509440159596-0249088772ff"), IMG("1517433670267-08bbd4be890f"), IMG("1486427944299-d1955d23e34d")],
      blurb: "A kitchen fire destroyed the neighbourhood bakery Amara spent twelve years building. Help her rebuild and reopen the doors.",
      story: {
        the_story: [
          "For twelve years, Sunrise Bakery has been the heart of our street — the place where neighbours met over warm bread and the first job for half the teenagers on the block. Two weeks ago, an electrical fault sparked a fire overnight. No one was hurt, but the kitchen is gone.",
        ],
        why: [
          "Insurance will cover only a fraction of the rebuild. New ovens, refrigeration, and bringing the space up to code will cost far more than the policy pays out.",
        ],
        how: [
          "Funds will replace the ovens and mixers, repair the storefront, and keep Amara's three employees paid while the bakery is closed.",
        ],
        note: ["This bakery raised me as much as my own mother did. Let's bring it back. — Amara"],
      },
      supporters: [
        { name: "Regular since '14", amount: 200, message: "Best cinnamon rolls in Texas. Reopen soon!", at: "3h ago" },
        { name: "Anonymous", amount: 1000, message: "", at: "8h ago" },
        { name: "Marisol G.", amount: 75, message: "We miss the morning smell already.", at: "2d ago" },
      ],
    },
    {
      id: "sponsor-jonas-college",
      title: "Send Jonas to study engineering",
      category: "Education",
      status: "open",
      location: "Cleveland, OH",
      raised: 14200, goal: 28000, donors: 176,
      verified: true,
      createdAt: "2026-05-20",
      organizer: { name: "Grace Adeyemi", relation: "Teacher", avatar: IMG("1544005313-94ddf0286df2", 200) },
      cover: IMG("1523050854058-8df90110c9f1"),
      gallery: [IMG("1523050854058-8df90110c9f1"), IMG("1541339907198-e08756dedf3f")],
      blurb: "Jonas earned a place to study engineering but his family can't cover tuition. Help a first-generation student reach the classroom.",
      story: {
        the_story: [
          "Jonas is the kind of student a teacher remembers for a lifetime. He rebuilds broken laptops for classmates and tutors younger kids for free. This spring he earned a place in a mechanical engineering programme — the first in his family to reach university.",
        ],
        why: ["His scholarship covers half the tuition. The remaining gap is more than his family earns in a year."],
        how: ["Funds go directly to the university for tuition, books, and a laptop he can rely on for coursework."],
        note: ["I've taught for nineteen years. I've rarely been more certain a student would make the most of a chance. — Grace"],
      },
      supporters: [
        { name: "Anonymous", amount: 300, message: "Go change the world, Jonas.", at: "6h ago" },
        { name: "Former classmate", amount: 40, message: "", at: "1d ago" },
      ],
    },
    {
      id: "winter-shelter-meals",
      title: "Warm meals for the Eastside winter shelter",
      category: "Community",
      status: "almost",
      location: "Denver, CO",
      raised: 19600, goal: 22000, donors: 530,
      verified: true,
      createdAt: "2026-05-15",
      organizer: { name: "Eastside Mutual Aid", relation: "Organisation", avatar: IMG("1559027615-cd4628902d4a", 200) },
      cover: IMG("1488521787991-ed7bbaae773c"),
      gallery: [IMG("1488521787991-ed7bbaae773c"), IMG("1504674900247-0877df9cc836")],
      blurb: "Our volunteer kitchen serves 200 hot meals a night through the cold months. We're almost at our goal to stay open until spring.",
      story: {
        the_story: ["Every night through winter, our volunteers cook and serve two hundred meals to neighbours sleeping rough on the Eastside. It started with one pot of soup. It's grown into the only warm meal many people get all day."],
        why: ["Rising food costs mean our budget runs out before the cold does. We need to bridge the gap to keep the kitchen open until April."],
        how: ["Funds buy ingredients, propane for the burners, and insulated containers so meals stay warm on the coldest nights."],
        note: ["No one should go hungry while we have a stove and willing hands. Thank you for keeping us cooking. — The Eastside team"],
      },
      supporters: [
        { name: "Anonymous", amount: 50, message: "", at: "1h ago" },
        { name: "Carla & Tom", amount: 120, message: "For everyone working the late shift in the kitchen.", at: "4h ago" },
      ],
    },
    {
      id: "save-the-shelter-dogs",
      title: "Emergency vet care for rescued shelter dogs",
      category: "Animals",
      status: "open",
      location: "Sacramento, CA",
      raised: 8900, goal: 16000, donors: 211,
      verified: true,
      createdAt: "2026-06-03",
      organizer: { name: "Willow Creek Rescue", relation: "Rescue", avatar: IMG("1450778869180-41d0601e046e", 200) },
      cover: IMG("1583511655857-d19b40a7a54e"),
      gallery: [IMG("1583511655857-d19b40a7a54e"), IMG("1548199973-03cce0bbc87b")],
      blurb: "We took in fourteen dogs from a neglect case. Several need urgent surgery before they can find their forever homes.",
      story: {
        the_story: ["Last week we opened our doors to fourteen dogs rescued from a neglect case. Most are underweight; several need surgery before they can be adopted. Our small rescue runs on donations and the kindness of foster families."],
        why: ["Veterinary bills for the most urgent cases already exceed what we raise in a normal month."],
        how: ["Funds cover surgeries, vaccinations, and recovery care until each dog is healthy enough for a new home."],
        note: ["Every one of these dogs still wags their tail when a person kneels down to say hello. They deserve a way forward. — Willow Creek"],
      },
      supporters: [
        { name: "Dog person forever", amount: 60, message: "Give them all a treat from me.", at: "2h ago" },
        { name: "Anonymous", amount: 150, message: "", at: "1d ago" },
      ],
    },
    {
      id: "rivera-family-rent",
      title: "Keep the Rivera family in their home",
      category: "Family",
      status: "urgent",
      location: "Phoenix, AZ",
      raised: 6100, goal: 14000, donors: 98,
      verified: true,
      createdAt: "2026-06-05",
      organizer: { name: "Sofia Rivera", relation: "Mother", avatar: IMG("1494790108377-be9c29b29330", 200) },
      cover: IMG("1469571486292-0ba58a3f068b"),
      gallery: [IMG("1469571486292-0ba58a3f068b"), IMG("1484101403633-562f891dc89a")],
      blurb: "After a sudden layoff, the Rivera family is three months behind on rent. A little help now keeps two kids in the only home they've known.",
      story: {
        the_story: ["When the warehouse closed, my husband lost the job he'd held for nine years. We've stretched every dollar, sold what we could, and picked up shifts wherever we can — but we've fallen three months behind on rent."],
        why: ["We need to clear the arrears before the end of the month to avoid eviction. Our two children have never lived anywhere else."],
        how: ["Funds go straight to the landlord to cover back rent and the next two months while my husband finishes his new job training."],
        note: ["Asking for help is the hardest thing I've ever done. Thank you for not looking away. — Sofia"],
      },
      supporters: [
        { name: "Anonymous", amount: 100, message: "Hang in there. Better days ahead.", at: "5h ago" },
        { name: "A fellow parent", amount: 25, message: "", at: "1d ago" },
      ],
    },
    {
      id: "community-garden-revival",
      title: "Revive the Maple Street community garden",
      category: "Community",
      status: "open",
      location: "Minneapolis, MN",
      raised: 4300, goal: 12000, donors: 142,
      verified: true,
      createdAt: "2026-05-30",
      organizer: { name: "Maple Street Collective", relation: "Neighbourhood group", avatar: IMG("1416879595882-3373a0480b5b", 200) },
      cover: IMG("1466692476868-aef1dfb1e735"),
      gallery: [IMG("1466692476868-aef1dfb1e735"), IMG("1444392061186-9fc38f84f726")],
      blurb: "Our shared garden feeds forty families. Help us replace the failing irrigation and build raised beds for neighbours with limited mobility.",
      story: {
        the_story: ["For fifteen summers, the Maple Street garden has fed forty families and given our kids somewhere to dig, plant, and learn. The irrigation system has finally given out, and the old beds are too low for our older neighbours to reach."],
        why: ["Without new irrigation and accessible beds, the garden can't make it through another season."],
        how: ["Funds buy a drip-irrigation system, lumber for raised accessible beds, soil, and seeds for the coming season."],
        note: ["A garden is a slow, patient kind of hope. Thank you for helping ours grow. — The collective"],
      },
      supporters: [
        { name: "Anonymous", amount: 30, message: "", at: "3h ago" },
        { name: "Green thumb", amount: 75, message: "Plant something beautiful.", at: "2d ago" },
      ],
    },
    {
      id: "noahs-hearing",
      title: "Give Noah the gift of hearing",
      category: "Medical",
      status: "almost",
      location: "Madison, WI",
      raised: 26800, goal: 30000, donors: 367,
      verified: true,
      createdAt: "2026-05-10",
      organizer: { name: "Hannah Lindqvist", relation: "Mother", avatar: IMG("1487412720507-e7ab37603c6f", 200) },
      cover: IMG("1503454537195-1dcabb73ffb9"),
      gallery: [IMG("1503454537195-1dcabb73ffb9"), IMG("1476703993599-0035a21b17a9")],
      blurb: "Noah was born profoundly deaf. We're so close to funding the cochlear implants that could let him hear his family's voices for the first time.",
      story: {
        the_story: ["Our son Noah is three years old, endlessly curious, and profoundly deaf. His doctors recommend cochlear implants — a procedure that could open up the world of sound to him during the years his brain is still learning fastest."],
        why: ["Insurance approved one implant but denied the second. Bilateral implants give Noah the best chance to understand speech and find his place in a hearing classroom."],
        how: ["Funds cover the second implant, the surgery, and the audiology sessions that follow."],
        note: ["We dream of the day Noah turns toward us when we call his name. We're so close. Thank you. — Hannah"],
      },
      supporters: [
        { name: "Anonymous", amount: 200, message: "May his first word be a happy one.", at: "1h ago" },
        { name: "Deaf & proud", amount: 50, message: "Whatever path Noah chooses, we're cheering.", at: "6h ago" },
      ],
    },
    {
      id: "flood-relief-mill-valley",
      title: "Flood relief for Mill Valley families",
      category: "Emergency",
      status: "open",
      location: "Asheville, NC",
      raised: 31200, goal: 50000, donors: 604,
      verified: true,
      createdAt: "2026-06-02",
      organizer: { name: "Mill Valley Relief Fund", relation: "Community fund", avatar: IMG("1542601906990-b4d3fb778b09", 200) },
      cover: IMG("1547683905-f686c993aae5"),
      gallery: [IMG("1547683905-f686c993aae5"), IMG("1523978591478-c753949ff840")],
      blurb: "Last month's flood damaged dozens of homes along the river. We're pooling support to help families repair, restock, and recover together.",
      story: {
        the_story: ["When the river rose overnight, it didn't ask whose home it entered. Dozens of families along Mill Valley woke to ruined floors, lost belongings, and a long road back. We started this fund so no family has to face that road alone."],
        why: ["Federal aid is slow and partial. Families need help now — for cleanup, repairs, and basics like beds and clothing."],
        how: ["Funds are distributed directly to affected households for repairs, replacement essentials, and temporary housing."],
        note: ["A flood takes a lot. It can't take a neighbourhood that decides to look after its own. — Mill Valley Relief"],
      },
      supporters: [
        { name: "Anonymous", amount: 500, message: "", at: "2h ago" },
        { name: "From higher ground", amount: 100, message: "We're with you, Mill Valley.", at: "7h ago" },
      ],
    },
  ];

  // Categories & filter option config (single source of truth for UI)
  const CATEGORIES = ["All", "Medical", "Emergency", "Family", "Education", "Animals", "Community"];
  const STATUSES = [
    { key: "any", label: "Any" },
    { key: "urgent", label: "Urgent" },
    { key: "almost", label: "Almost there" },
  ];
  const SORTS = [
    { key: "recent", label: "Most recent" },
    { key: "supported", label: "Most supported" },
    { key: "urgent", label: "Urgent first" },
  ];

  // small artificial latency so skeleton/loading states are real
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  function pct(c) { return Math.min(100, Math.round((c.raised / c.goal) * 100)); }

  // ---- Public async API (backend-shaped) ----------------------------
  const api = {
    categories: CATEGORIES,
    statuses: STATUSES,
    sorts: SORTS,
    fallbackImg(category, w) {
      const id = CATEGORY_FALLBACK[category] || CATEGORY_FALLBACK.Community;
      return IMG(id, w);
    },
    pct,

    async list({ q = "", category = "All", status = "any", sort = "recent", page = 1, perPage = 9 } = {}) {
      await delay(520);
      let rows = CAMPAIGNS.slice();
      if (q) {
        const needle = q.toLowerCase();
        rows = rows.filter((c) =>
          (c.title + " " + c.blurb + " " + c.location + " " + c.category).toLowerCase().includes(needle)
        );
      }
      if (category && category !== "All") rows = rows.filter((c) => c.category === category);
      if (status === "urgent") rows = rows.filter((c) => c.status === "urgent");
      if (status === "almost") rows = rows.filter((c) => c.status === "almost" || pct(c) >= 80);

      if (sort === "recent") rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      else if (sort === "supported") rows.sort((a, b) => b.donors - a.donors);
      else if (sort === "urgent") rows.sort((a, b) => (b.status === "urgent") - (a.status === "urgent") || b.raised - a.raised);

      const total = rows.length;
      const start = (page - 1) * perPage;
      return { items: rows.slice(start, start + perPage), total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
    },

    async get(id) {
      await delay(420);
      return CAMPAIGNS.find((c) => c.id === id) || null;
    },

    // synchronous accessors for above-the-fold homepage rendering (no spinner needed)
    featured() { return CAMPAIGNS.find((c) => c.featured) || CAMPAIGNS[0]; },
    active(n = 4) { return CAMPAIGNS.filter((c) => !c.featured).slice(0, n); },
    urgent(n = 3) { return CAMPAIGNS.filter((c) => c.status === "urgent").slice(0, n); },
    all() { return CAMPAIGNS.slice(); },

    async search(q) {
      await delay(180);
      if (!q) return [];
      const needle = q.toLowerCase();
      return CAMPAIGNS.filter((c) => (c.title + c.category + c.location).toLowerCase().includes(needle)).slice(0, 5);
    },

    // Simulated submission — no backend. Returns a fake reference id.
    async submitCampaign(draft) {
      await delay(900);
      try { sessionStorage.setItem("careway:lastDraft", JSON.stringify(draft)); } catch (e) {}
      return { ok: true, ref: "CW-" + Math.random().toString(36).slice(2, 8).toUpperCase() };
    },
    async sendContact(payload) {
      await delay(700);
      return { ok: true };
    },
  };

  window.CareWayData = api;
})();
