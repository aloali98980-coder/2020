// اختبارات «نظام الأحداث الموسّع 0.25» — ٧٠ حدث قرار + ١١٥ خبر نكهة.
//
// ما يُثبته هذا الملف (وهو ما طلبه صاحب المشروع حرفيًا):
//   ١) كل حدث قرار له خيارات صالحة وعواقب تُطبَّق فعلًا — مرة واحدة بالضبط.
//   ٢) لا يوجد حدثان بنفس المعرّف — ولا بنفس الفكرة (`topic` فريد في ١٥١ حدثًا).
//   ٣) كل الأحداث لها ترجمات كاملة (عربي → إنجليزي → فرنسي) بلا بقايا عربية.
//   ٤) لا حدث مستحيل: كل نص يتحدث عن بطولة/أسطورة/لاعب سابق/مصاب/ديربي/طقس/توقف دولي
//      يقف خلف بوابة `when`، والاختبار يتحقق أن البوابة تنفتح في حالة حقيقية وتنغلق في أخرى.
//   ٥) ضابط الإزعاج محفوظ: قرار مهم كل ٧-٢٨ يومًا حسب الصعوبة، ونكهة كل ≥٣ أيام بلا توقيف للزمن.
//
// ملاحظة على «التركيبات» (fixtures): حالات البوابات تُبنى بتعديل نسخ من حفظ حقيقي
// (createGame) أو بحقول اختيارية مصغّرة (retired/staff/negotiations/legends.hall)؛
// هذه التركيبات تُقرأ بالبوابات فقط ولا تمرّ على validateSave. أما اختبارات العواقب
// فتعمل على حفظات حقيقية كاملة وتُتحقق بـ validateSave بعد كل تطبيق.
import test from "node:test";
import assert from "node:assert/strict";
import {
  EVENT_CATALOG,
  FLAVOR_CATALOG,
  FLAVOR_CATEGORIES,
  FLAVOR_LIMITS,
  FLAVOR_EFFECT_KEYS,
  DECISION_EFFECT_KEYS,
  DECISION_GROUPS,
  LEGACY_DECISIONS,
  EVENT_THEMES,
  flavorByCategory,
} from "../src/data/eventCatalog.js";
import { scopeIds, inScope } from "../src/data/events/conditions.js";
import { ASSETS } from "../src/data/catalog.js";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { addDays, daysBetween } from "../src/core/utils.js";
import { squad } from "../src/models/player.js";
import { difficulty, DIFFICULTIES } from "../src/models/difficulty.js";
import { pendingActions, resolveInfo } from "../src/services/inbox.js";
import { financeDay } from "../src/services/finance.js";
import {
  availableDecisions,
  availableFlavor,
  clubEventDay,
  flavorEventDay,
  resolveClubEvent,
  flavorLimits,
} from "../src/services/clubEvents.js";
import { advanceTime } from "../src/services/time.js";
import { getLanguage, setLanguage, translateText } from "../src/i18n/index.js";

const ARABIC = /[ء-ي]/;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const isInt = (n) => Number.isSafeInteger(n);
const textOf = (e) => [e.topic, e.title, e.body].filter(Boolean).join(" ");

// ── تركيبات الحالات ────────────────────────────────────────────────────────
const battery = [];
const addFixture = (name, build) => battery.push({ name, state: build() });
const fixtureState = (name) => battery.find((b) => b.name === name).state;
const variant = (name, mutate) => {
  const s = structuredClone(fixtureState(name));
  mutate(s);
  return s;
};
// الرصيد وكشف الحساب يجب أن يتطابقا (validation.js: initialCash + Σ ledger === cash)،
// فأي ضبط للرصيد في الاختبارات يمرّ من هنا بقيد مقابل بمفتاح فريد.
const setCash = (s, amount) => {
  const delta = amount - s.finance.cash;
  if (delta) {
    s.finance.cash = amount;
    s.finance.ledger.push({
      id: "test-topup",
      key: "test-topup",
      date: s.date,
      description: "رصيد اختباري",
      amount: delta,
    });
  }
  return s;
};
// تشكيلة متنوعة تُفعّل فئات اللاعبين كلها (مصاب/مُجهد/شاب/عقد منتهٍ/معنويات/تقييم/منتخب).
const addVariety = (s) => {
  const own = squad(s);
  own[0].injuryUntil = addDays(s.date, 21);
  own[1].injuryUntil = addDays(s.date, 40);
  own[2].fitness = 45;
  own[3].fitness = 55;
  own[4].age = 19;
  own[5].age = 18;
  own[6].contractEnd = addDays(s.date, 45);
  own[7].morale = 30;
  own[8].rating = 88;
  own[9].rating = 52;
  own[10].internationalUntil = addDays(s.date, 9);
  return s;
};
const addRetired = (s) => {
  s.retired = [
    {
      id: "ret-1",
      name: "لاعب سابق في النادي",
      status: "retired",
      clubId: "retired",
      retiredOn: s.date,
      age: 38,
      rating: 70,
      potential: 70,
      careerHistory: [{ club: "الأهلي", years: 12 }],
    },
  ];
  return s;
};
const playOwn = (s, home, away) => {
  const f = s.fixtures.find((x) => x.home === s.clubId || x.away === s.clubId);
  // تُؤرَّخ المباراة في الماضي: البوابات تقرأ نتيجة «آخر مباراة لُعبت» لا مباراة آتية.
  f.date = addDays(s.date, -3);
  f.played = true;
  f.homeGoals = f.home === s.clubId ? home : away;
  f.awayGoals = f.home === s.clubId ? away : home;
  const row = s.table.find((r) => r.clubId === s.clubId);
  row.played = 1;
  row.gf = home;
  row.ga = away;
  if (home > away) row.wins = 1;
  else if (home < away) row.losses = 1;
  else row.draws = 1;
  row.points = home > away ? 3 : home === away ? 1 : 0;
};
const fillSquad = (s) => {
  const src = squad(s)[0];
  while (squad(s).length < (s.squadLimit || 30)) {
    const copy = structuredClone(src);
    copy.id = "filler-" + s.nextId++;
    copy.name = src.name + " " + copy.id;
    copy.contractEnd = addDays(s.date, 730);
    s.players.push(copy);
  }
};

addFixture("classic", () => createGame());
addFixture("world", () =>
  createGame({ expanded: true, database: "world", clubId: "ahly" }),
);
// حفظ قديم بلا الوحدات الاختيارية — يختبر دفاعية البوابات نفسها.
addFixture("minimal", () =>
  variant("classic", (s) => {
    for (const k of ["legends", "press", "expansion", "retired", "talent"])
      delete s[k];
    s.staff = [];
    s.negotiations = [];
    s.sponsors = [];
  }),
);
addFixture("variety", () => variant("classic", addVariety));
addFixture("retired", () => variant("classic", addRetired));
addFixture("staff", () =>
  variant("classic", (s) => {
    s.staff = [
      {
        id: "staff-1",
        personId: "person-1",
        status: "employed",
        role: "coach",
        salary: 120000,
        contractEnd: addDays(s.date, 365),
        skills: { coaching: 70 },
      },
    ];
  }),
);
addFixture("negotiation", () =>
  variant("classic", (s) => {
    s.negotiations = [
      { id: "neg-1", playerId: "p-1", amount: 5000000, status: "pending" },
    ];
  }),
);
addFixture("hall", () =>
  variant("classic", (s) => {
    s.legends.hall = [{ id: "hall-1", name: "أسطورة النادي", inductedOn: s.date }];
    s.legends.contracts = [
      { id: "lc-1", legendId: "shobair", role: "gk", status: "active" },
    ];
  }),
);
addFixture("press", () =>
  variant("classic", (s) => {
    s.press = { trust: 55, news: [], questions: [], promises: [], lastQuestion: null };
  }),
);
addFixture("broke", () => variant("classic", (s) => void setCash(s, 5000)));
addFixture("lowCash", () => variant("classic", (s) => void setCash(s, 12000000)));
addFixture("rich", () =>
  variant("classic", (s) => {
    setCash(s, 400000000);
    s.finance.wageBudget = 24000000;
  }),
);
addFixture("angryFans", () =>
  variant("classic", (s) => {
    s.fanSupport = 35;
    s.reputation = 30;
    s.ticketPrice = 60;
  }),
);
addFixture("bigClub", () =>
  variant("classic", (s) => {
    s.fanSupport = 95;
    s.reputation = 92;
    s.ticketPrice = 260;
    s.capacity = 70000;
    s.finance.wageBudget = 30000000;
  }),
);
addFixture("smallStadium", () =>
  variant("classic", (s) => {
    s.capacity = 18000;
    s.ticketPrice = 90;
  }),
);
addFixture("fullSquad", () => variant("classic", fillSquad));
addFixture("assetsTaken", () =>
  variant("classic", (s) => {
    s.sponsors = ASSETS.map((a, i) => ({
      assetId: a.id,
      sponsorId: "sp-" + i,
      status: "active",
      amount: 1000000,
      start: s.date,
      end: addDays(s.date, 365),
    }));
  }),
);
// التواريخ بعد بداية المسيرة (٢٠٢٦-٠٩-٢٤) كي تبقى الحالات معقولة زمنيًا.
addFixture("hot", () => variant("classic", (s) => void (s.date = "2027-07-15")));
addFixture("rainy", () => variant("classic", (s) => void (s.date = "2026-12-20")));
addFixture("window", () => variant("classic", (s) => void (s.date = "2026-11-12")));
addFixture("playedLost", () => variant("classic", (s) => playOwn(s, 0, 2)));
addFixture("playedWon", () => variant("classic", (s) => playOwn(s, 3, 1)));
// بوابات مركّبة all(...) تحتاج حالات تجمع شرطًا موسميًا/زمنيًا مع حالة القائمة:
addFixture("hotVariety", () =>
  variant("classic", (s) => {
    s.date = "2027-07-15";
    addVariety(s);
  }),
);
addFixture("rainyVariety", () =>
  variant("classic", (s) => {
    s.date = "2026-12-20";
    addVariety(s);
  }),
);
addFixture("windowVariety", () =>
  variant("classic", (s) => {
    s.date = "2026-11-12";
    addVariety(s);
  }),
);
addFixture("retiredVariety", () => variant("classic", (s) => addVariety(addRetired(s))));
addFixture("playedWindow", () =>
  variant("classic", (s) => {
    s.date = "2026-11-12";
    playOwn(s, 2, 2);
  }),
);
addFixture("worldVariety", () => variant("world", addVariety));

// ── تركيبات «تحديث الدراما» 0.25: تُفعّل الأنظمة المربوطة بها الأحداث الجديدة ──
// لعب موسم مصغّر: نتائج مسجلة + جدول محدّث، لقراءة السلاسل والمراكز وجولات الحسم.
const playSeason = (s, margins) => {
  const own = s.fixtures.filter((f) => f.home === s.clubId || f.away === s.clubId);
  let wins = 0,
    draws = 0,
    losses = 0,
    gf = 0,
    ga = 0;
  margins.forEach((m, i) => {
    const f = own[i];
    if (!f) return;
    f.played = true;
    f.date = addDays(s.date, -(margins.length - i) * 4);
    const for_ = m > 0 ? m : 0,
      against = m < 0 ? -m : 0;
    f.homeGoals = f.home === s.clubId ? for_ : against;
    f.awayGoals = f.home === s.clubId ? against : for_;
    gf += for_;
    ga += against;
    if (m > 0) wins++;
    else if (m < 0) losses++;
    else draws++;
  });
  const row = s.table.find((r) => r.clubId === s.clubId);
  row.played = margins.length;
  row.wins = wins;
  row.draws = draws;
  row.losses = losses;
  row.gf = gf;
  row.ga = ga;
  row.points = wins * 3 + draws;
  return s;
};
const setStandings = (s, mine, others) => {
  const rows = s.table.filter((r) => r.clubId !== s.clubId);
  rows.forEach((r, i) => {
    r.played = 10;
    r.points = others[i % others.length];
    r.wins = Math.floor(r.points / 3);
    r.draws = r.points % 3;
    r.losses = Math.max(0, 10 - r.wins - r.draws);
    r.gf = r.points + 4;
    r.ga = 12;
  });
  const me = s.table.find((r) => r.clubId === s.clubId);
  me.points = mine;
  return s;
};
const nextOwnFixture = (s) =>
  s.fixtures
    .filter((f) => (f.home === s.clubId || f.away === s.clubId) && !f.played)
    .sort((a, b) => (a.date < b.date ? -1 : 1))[0];
const makeDerby = (s, daysAhead) => {
  const f = nextOwnFixture(s);
  f.date = addDays(s.date, daysAhead);
  if (f.home === s.clubId) f.away = "zamalek";
  else f.home = "zamalek";
  return s;
};
// إحصائيات الموسم 0.23 وحالة العواقب 0.22 تُضبط على اللاعبين مباشرة (حقول قائمة فعلًا).
const withStats = (s, patch, index = 0) => {
  const own = squad(s);
  Object.assign(own[index], patch);
  return s;
};

addFixture("scorerSeason", () =>
  variant("classic", (s) => {
    playSeason(s, [2, 1, 2, 0, 1]);
    withStats(s, { seasonGoals: 9, seasonAssists: 3, form: 1.6 }, 9);
  }),
);
addFixture("coldForm", () =>
  variant("classic", (s) => {
    playSeason(s, [1, -1, -2, -1, 0]);
    withStats(s, { form: -1.8, seasonGoals: 1 }, 8);
  }),
);
addFixture("badRun", () =>
  variant("classic", (s) => playSeason(s, [2, 1, -1, -2, -1])),
);
addFixture("heavyDefeatState", () =>
  variant("classic", (s) => playSeason(s, [1, 2, -4])),
);
addFixture("bigWinState", () => variant("classic", (s) => playSeason(s, [1, 3])));
addFixture("longInjury", () =>
  variant("classic", (s) => withStats(s, { injuryUntil: addDays(s.date, 60) }, 3)),
);
addFixture("injuryCrisis", () =>
  variant("classic", (s) => {
    const own = squad(s);
    [1, 2, 3, 4].forEach((i, k) => (own[i].injuryUntil = addDays(s.date, 20 + k * 9)));
  }),
);
addFixture("yellowRisk", () =>
  variant("classic", (s) => withStats(s, { seasonYellow: 4 }, 5)),
);
addFixture("derbyUpcoming", () =>
  variant("classic", (s) => {
    playSeason(s, [1, 1]);
    makeDerby(s, 3);
  }),
);
addFixture("derbyWon", () =>
  variant("classic", (s) => {
    const f = nextOwnFixture(s);
    makeDerby(s, -4);
    playSeason(s, [2]);
    const played = s.fixtures.find((x) => x.id === f.id);
    played.played = true;
    played.date = addDays(s.date, -4);
    played.homeGoals = played.home === s.clubId ? 3 : 1;
    played.awayGoals = played.home === s.clubId ? 1 : 3;
    const row = s.table.find((r) => r.clubId === s.clubId);
    row.played = 1;
    row.wins = 1;
    row.points = 3;
    row.gf = 3;
    row.ga = 1;
  }),
);
addFixture("derbyLost", () =>
  variant("classic", (s) => {
    const f = nextOwnFixture(s);
    makeDerby(s, -4);
    playSeason(s, [1]);
    const played = s.fixtures.find((x) => x.id === f.id);
    played.played = true;
    played.date = addDays(s.date, -4);
    played.homeGoals = played.home === s.clubId ? 0 : 2;
    played.awayGoals = played.home === s.clubId ? 2 : 0;
    const row = s.table.find((r) => r.clubId === s.clubId);
    row.played = 1;
    row.losses = 1;
    row.points = 0;
    row.gf = 0;
    row.ga = 2;
  }),
);
addFixture("titleWeek", () =>
  variant("classic", (s) => {
    playSeason(s, [2, 1, 3, 1, 2, 1, 2, 1, 2, 1]);
    setStandings(s, 28, [22, 20, 18, 15, 12, 9, 6]);
    const f = nextOwnFixture(s);
    f.date = addDays(s.date, 5);
  }),
);
addFixture("relegationWeek", () =>
  variant("classic", (s) => {
    playSeason(s, [-1, -2, 0, -1, 1, -2, -1, 0, -1, -2]);
    setStandings(s, 5, [30, 26, 22, 18, 15, 12, 9]);
    const f = nextOwnFixture(s);
    f.date = addDays(s.date, 5);
  }),
);
// حالة «نادٍ صغير بلا سوق ولا جهاز ولا رعاة»: تُثبت أن البوابات ليست شكلية،
// وأن كل بوابة تنغلق فعلًا حين يختفي ما تتحدث عنه.
addFixture("smallClub", () =>
  variant("classic", (s) => {
    const own = squad(s);
    // ثمانية لاعبي ميدان فقط: بلا حارس مرمى، وبلا وسط، وبلا شباب، وبلا عقود منتهية قريبًا.
    // ملاحظة: squad() تعدّ كل لاعب status !== "retired"، فالتقليص يكون بحذف السجلات نفسها.
    const keep = new Set(
      own
        .filter((p) => ["CB", "RB", "LB", "ST"].includes(p.position))
        .slice(0, 8)
        .map((p) => p.id),
    );
    assert(keep.size >= 6, "لم نجد عددًا كافيًا من لاعبي الميدان للتركيبة");
    // لا سوق: لا لاعبين خارج النادي أصلًا (hasMarket تنغلق هنا).
    s.players = s.players.filter((p) => keep.has(p.id));
    for (const p of s.players) {
      p.rating = 60;
      p.potential = 66;
      p.age = 26;
      p.morale = 70;
      p.fitness = 95;
      p.injuryUntil = null;
      p.internationalUntil = null;
      p.contractEnd = addDays(s.date, 900);
      p.seasonGoals = 0;
      p.seasonAssists = 0;
      p.seasonYellow = 0;
      p.form = 0;
    }
    s.date = "2027-03-05";
    for (const f of s.fixtures) f.date = addDays(s.date, 60);
    setCash(s, 400000);
    s.capacity = 4000;
    s.finance.wageBudget = 0;
    s.finance.obligations = [];
    s.finance.loans = [];
    s.fanSupport = 20;
    s.reputation = 15;
    s.ticketPrice = 40;
    s.sponsors = [];
    s.staff = [];
    s.negotiations = [];
    s.retired = [];
    s.events = [];
    s.table = [];
    for (const f of s.facilities || []) {
      f.level = 4;
      f.project = { id: "pr-1", kind: "upgrade", due: addDays(s.date, 30), paid: 0 };
    }
    for (const k of ["legends", "press", "expansion", "talent"]) delete s[k];
  }),
);
// حارس مرمى غير متاح (إصابة طويلة أو بيع): بوابة فئة الحراس تنغلق.
addFixture("noKeeper", () =>
  variant("classic", (s) => {
    for (const p of squad(s)) if (p.position === "GK") p.status = "released";
  }),
);
// ── تركيبات الملفات السوداء 0.28 ────────────────────────────────────────
addFixture("blackClean", () =>
  variant("classic", (s) => {
    s.blackFiles.suspicion = 0;
    s.blackFiles.active.agentOnPayroll = false;
    s.blackFiles.active.refereeBias = null;
    s.blackFiles.active.mediaWar = null;
    s.blackFiles.active.bribedOpponent = null;
  }),
);
addFixture("blackWhispers", () =>
  variant("classic", (s) => {
    s.blackFiles.suspicion = 35;
    s.finance.cash = 20000000;
    s.blackFiles.active.refereeBias = { type: "penalty-dubious", until: addDays(s.date, 5), date: s.date };
    s.blackFiles.active.agentOnPayroll = true;
    s.blackFiles.active.agentSince = s.date;
    s.blackFiles.active.mediaWar = { rival: "zamalek", until: addDays(s.date, 10), date: s.date };
    s.blackFiles.active.bribedOpponent = { fixtureId: s.fixtures[0].id, opponent: "zamalek", until: addDays(s.date, 5), date: s.date };
  }),
);
addFixture("blackLeaks", () =>
  variant("classic", (s) => {
    s.blackFiles.suspicion = 65;
    setCash(s, 50000000);
  }),
);
addFixture("blackFormal", () =>
  variant("classic", (s) => {
    s.blackFiles.suspicion = 90;
    setCash(s, 50000000);
  }),
);

// ── ١) الحجم والمعرّفات ────────────────────────────────────────────────────
test("1) الحجم المطلوب: ≥٥٠ حدث قرار و≥١٠٠ خبر نكهة، وكل المعرّفات فريدة وkebab-case", () => {
  assert(EVENT_CATALOG.length >= 50, `قرارات: ${EVENT_CATALOG.length}`);
  assert(FLAVOR_CATALOG.length >= 100, `نكهة: ${FLAVOR_CATALOG.length}`);
  const ids = [...EVENT_CATALOG, ...FLAVOR_CATALOG].map((e) => e.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dupes, [], "معرّفات مكررة: " + dupes.join(", "));
  for (const e of [...EVENT_CATALOG, ...FLAVOR_CATALOG]) {
    assert(KEBAB.test(e.id), `معرّف غير صالح: ${e.id}`);
    assert(e.id.length <= 100, e.id);
  }
  // معرّفات النكهة تُقرأ من البريد بـ ref:"flavor:<id>" — البادئة تمنع أي التباس بقرار.
  for (const e of FLAVOR_CATALOG) assert(e.id.startsWith("fl-"), e.id);
  for (const e of EVENT_CATALOG) assert(!e.id.startsWith("fl-"), e.id);
  // معرّفات الخيارات فريدة داخل الحدث، وkebab أيضًا.
  for (const ev of EVENT_CATALOG) {
    const cids = ev.choices.map((c) => c.id);
    assert.deepEqual(
      cids.filter((c, i) => cids.indexOf(c) !== i),
      [],
      `${ev.id}: معرّفات خيارات مكررة`,
    );
    for (const c of cids) assert(KEBAB.test(c), `${ev.id}/${c}`);
  }
});

test("2) لا حدثان بنفس الفكرة: topic فريد عبر ١٨٥ حدثًا، والعناوين غير متطابقة", () => {
  const all = [...EVENT_CATALOG, ...FLAVOR_CATALOG];
  const topics = all.map((e) => e.topic.trim());
  const dupTopics = topics.filter((t, i) => topics.indexOf(t) !== i);
  assert.deepEqual(dupTopics, [], "مواضيع مكررة: " + dupTopics.join(" | "));
  for (const e of all) {
    assert(e.topic && e.topic.length >= 8, `${e.id}: topic قصير`);
    assert(e.topic.length <= 120, `${e.id}: topic طويل`);
  }
  // تكرار العنوان مقبول لغويًا (عنوانان متشابهان لحدثين مختلفين) لكنه مؤشر على تكرار الفكرة،
  // لذا نطلب أن لا يتطابق عنوانا حدثين إلا إذا اختلف موضوعاهما ومجموعة كلٍّ منهما.
  const byTitle = new Map();
  for (const e of all) byTitle.set(e.title, [...(byTitle.get(e.title) || []), e]);
  for (const [title, list] of byTitle) {
    if (list.length < 2) continue;
    assert(
      new Set(list.map((e) => e.topic)).size === list.length,
      `عنوان مكرر بنفس الموضوع: ${title}`,
    );
  }
});

test("3) الكتالوج الأصلي (٠.١٨) محفوظ حرفيًا: المعرّفات والنصوص ومعرّفات الخيارات", () => {
  // الحفظات القديمة تحمل clubDecisions[].type و lastClubEvent بهذه المعرّفات، و validation.js
  // يرفض أي نوع غير موجود في EVENT_CATALOG — فالحذف أو إعادة التسمية يكسر الحفظات.
  const ids = new Set(EVENT_CATALOG.map((e) => e.id));
  const snapshot = [
    ["community", "يوم مفتوح للجماهير", ["host", "digital", "decline"]],
    ["sponsor-activation", "حملة مشتركة مع الرعاة", ["join", "decline"]],
    ["maintenance", "تقرير صيانة المنشآت", ["full", "partial", "delay"]],
    ["fatigue", "الجهاز الطبي يطلب تخفيف الحمل", ["rest", "recovery", "continue"]],
    ["youth-trial", "فرصة تجربة موهبة شابة", ["trial", "decline"]],
    ["ticket-pressure", "الجمهور يطلب دعم الحضور", ["support", "explain", "ignore"]],
    ["dressing-room", "اجتماع غرفة الملابس", ["camp", "meeting", "skip"]],
    ["scouting-budget", "توسيع ملف المرشحين", ["fund", "decline"]],
  ];
  assert.equal(LEGACY_DECISIONS.length, snapshot.length);
  for (const [id, title, choices] of snapshot) {
    assert(ids.has(id), `معرّف أصلي مفقود: ${id}`);
    const ev = EVENT_CATALOG.find((e) => e.id === id);
    assert.equal(ev.title, title, id);
    assert.deepEqual(ev.choices.map((c) => c.id), choices, id);
    assert(ev.body.length > 20, id);
  }
  // القيم المالية للأحداث الأصلية لم تتغير (الحفظات القديمة تتوقع العائد ذاته).
  const join = EVENT_CATALOG.find((e) => e.id === "sponsor-activation").choices[0];
  assert.equal(join.cash, -100000);
  assert.equal(join.incomeLater, 180000);
});

// ── ٢) بنية الأحداث ────────────────────────────────────────────────────────
test("4) بنية القرارات: مجموعة صالحة، نصوص ضمن حدود الحفظ، ≥٢ خيارات، وبوابة دالة", () => {
  for (const ev of EVENT_CATALOG) {
    assert(DECISION_GROUPS.includes(ev.group), `${ev.id}: group=${ev.group}`);
    assert(ev.title.length >= 4 && ev.title.length <= 90, `${ev.id}: title`);
    assert(ev.body.length >= 20 && ev.body.length <= 4000, `${ev.id}: body`);
    assert(ev.choices.length >= 2, `${ev.id}: ${ev.choices.length} خيارات`);
    assert(ev.choices.length <= 5, `${ev.id}: خيارات كثيرة`);
    if (ev.when) assert.equal(typeof ev.when, "function", `${ev.id}: when`);
    for (const c of ev.choices) {
      assert(c.label && c.label.length >= 3 && c.label.length <= 120, `${ev.id}/${c.id}`);
      if (c.note) assert(c.note.length <= 3000, `${ev.id}/${c.id}: note`);
      if (c.incomeNote) assert(c.incomeNote.length <= 3000, `${ev.id}/${c.id}`);
      if (c.costNote) assert(c.costNote.length <= 3000, `${ev.id}/${c.id}`);
    }
  }
});

test("5) مفردات الأثر مغلقة: لا مفتاحًا خارج القوائم المعلنة، وكل رقم صحيح آمن وضمن حدود معقولة", () => {
  const decisionKeys = new Set(DECISION_EFFECT_KEYS);
  const flavorKeys = new Set(FLAVOR_EFFECT_KEYS);
  for (const ev of EVENT_CATALOG) {
    for (const c of ev.choices) {
      for (const key of Object.keys(c)) {
        if (key === "id" || key === "label") continue;
        assert(decisionKeys.has(key), `${ev.id}/${c.id}: مفتاح أثر غير معروف «${key}»`);
      }
      for (const key of ["cash", "incomeLater", "costLater", "wageBudget", "ticketPrice", "capacity"])
        if (c[key] !== undefined) {
          assert(isInt(c[key]), `${ev.id}/${c.id}: ${key} ليس عددًا صحيحًا`);
          assert(Math.abs(c[key]) <= 200000000, `${ev.id}/${c.id}: ${key} خارج الحدود`);
        }
      for (const key of ["fans", "morale", "fitness", "reputation"])
        if (c[key] !== undefined) {
          assert(isInt(c[key]), `${ev.id}/${c.id}: ${key}`);
          assert(Math.abs(c[key]) <= 25, `${ev.id}/${c.id}: ${key} مبالغ`);
        }
      for (const key of ["incomeDays", "costDays"])
        if (c[key] !== undefined) {
          assert(isInt(c[key]) && c[key] >= 1 && c[key] <= 730, `${ev.id}/${c.id}: ${key}`);
        }
      if (c.incomeLater) assert(isInt(c.incomeDays || 30), ev.id);
      if (c.costLater) assert(isInt(c.costDays || 30), ev.id);
      if (c.youth !== undefined)
        assert(
          c.youth === true || (isInt(c.youth) && c.youth >= 1 && c.youth <= 4),
          `${ev.id}/${c.id}: youth`,
        );
      if (c.report !== undefined) assert.equal(c.report, true, `${ev.id}/${c.id}`);
      if (c.press !== undefined) assert.equal(c.press, true, `${ev.id}/${c.id}`);
      if (c.sponsorOffer)
        assert(
          ASSETS.some((a) => a.id === c.sponsorOffer),
          `${ev.id}/${c.id}: أصل رعاية غير موجود «${c.sponsorOffer}»`,
        );
      if (c.signing) {
        const g = c.signing;
        assert(isInt(g.count || 1) && (g.count || 1) <= 3, `${ev.id}/${c.id}: signing.count`);
        assert(isInt(g.age) && g.age >= 17 && g.age <= 38, `${ev.id}/${c.id}: signing.age`);
        assert(isInt(g.rating) && g.rating >= 40 && g.rating <= 90, `${ev.id}/${c.id}`);
        assert(isInt(g.wage) && g.wage >= 10000 && g.wage <= 20000000, `${ev.id}/${c.id}`);
        assert(isInt(g.contractDays) && g.contractDays >= 90 && g.contractDays <= 1830, `${ev.id}/${c.id}`);
        assert(g.labelAr && !/^\s*$/.test(g.labelAr), `${ev.id}/${c.id}: labelAr`);
        assert(g.labelEn && /^[A-Za-z0-9 .'-]+$/.test(g.labelEn), `${ev.id}/${c.id}: labelEn`);
      }
      if (c.targets) {
        assert(Array.isArray(c.targets) && c.targets.length >= 1, `${ev.id}/${c.id}`);
        for (const t of c.targets) {
          assert(scopeIds.includes(t.scope), `${ev.id}/${c.id}: فئة غير معروفة «${t.scope}»`);
          assert(
            t.morale !== undefined || t.fitness !== undefined || t.injuryDays !== undefined,
            `${ev.id}/${c.id}: أثر موجَّه بلا أثر`,
          );
          for (const key of ["morale", "fitness", "injuryDays"])
            if (t[key] !== undefined) {
              assert(isInt(t[key]), `${ev.id}/${c.id}: ${key}`);
              assert(Math.abs(t[key]) <= 30, `${ev.id}/${c.id}: ${key} مبالغ`);
            }
        }
      }
    }
  }
  for (const ev of FLAVOR_CATALOG) {
    const f = ev.effect;
    if (!f) continue;
    for (const key of Object.keys(f)) {
      assert(flavorKeys.has(key), `${ev.id}: مفتاح أثر نكهة غير معروف «${key}»`);
    }
    if (f.note) assert(f.note.length <= 2000, ev.id);
    for (const t of f.targets || [])
      assert(scopeIds.includes(t.scope), `${ev.id}: فئة غير معروفة «${t.scope}»`);
  }
});

test("6) كل قرار له عاقبة حقيقية، ولا خياران متطابقا الأثر، ودائمًا بديل بلا تكلفة نقدية", () => {
  const signature = (c) =>
    JSON.stringify(
      Object.keys(c)
        .filter((k) => k !== "id" && k !== "label" && k !== "note")
        .sort()
        .map((k) => [k, c[k]]),
    );
  for (const ev of EVENT_CATALOG) {
    const sigs = ev.choices.map(signature);
    assert.equal(
      new Set(sigs).size,
      sigs.length,
      `${ev.id}: خياران بنفس الأثر تمامًا (لا فرق حقيقي بينهما)`,
    );
    const consequential = ev.choices.filter((c) =>
      Object.keys(c).some(
        (k) => k !== "id" && k !== "label" && k !== "note" && Boolean(c[k]),
      ),
    );
    assert(consequential.length >= 1, `${ev.id}: لا عاقبة حقيقية في أي خيار`);
    // المحرك يرفض القرار المكلف عند الإفلاس، فوجود بديل بلا تكلفة يضمن أن الحدث
    // لا يُغلق اللعبة على مدير مفلس (يعتمد عليه settle() في careers.test.js أيضًا).
    assert(
      ev.choices.some((c) => !c.cash),
      `${ev.id}: لا بديل بلا تكلفة نقدية`,
    );
    assert(
      ev.choices.filter((c) => c.cash < 0).every((c) => c.cash >= -20000000),
      `${ev.id}: تكلفة تتجاوز اقتصاد اللعبة`,
    );
  }
});

// ── ٣) النكهة ──────────────────────────────────────────────────────────────
test("7) النكهة موزّعة على الفئات التسع المطلوبة، وكل فئة ≥٨ أخبار", () => {
  const counts = new Map();
  for (const ev of FLAVOR_CATALOG) {
    assert(FLAVOR_CATEGORIES.includes(ev.category), `${ev.id}: ${ev.category}`);
    counts.set(ev.category, (counts.get(ev.category) || 0) + 1);
  }
  assert.equal(counts.size, FLAVOR_CATEGORIES.length, "فئة ناقصة");
  for (const cat of FLAVOR_CATEGORIES) {
    assert(counts.get(cat) >= 8, `${cat}: ${counts.get(cat)} أخبار فقط`);
    assert.equal(flavorByCategory(cat).length, counts.get(cat), cat);
  }
});

test("8) النكهة قصيرة (خبر ١-٢ سطر) وأثرها صغير ضمن FLAVOR_LIMITS وبلا آلية قرارات", () => {
  assert.deepEqual(flavorLimits(), FLAVOR_LIMITS);
  let withEffect = 0;
  let pure = 0;
  for (const ev of FLAVOR_CATALOG) {
    assert(ev.title.length <= 90, `${ev.id}: عنوان طويل`);
    assert(ev.body.length <= 230, `${ev.id}: نص أطول من خبر (يحتاج سطرًا أو سطرين)`);
    assert(!ev.choices, `${ev.id}: النكهة لا تحمل خيارات`);
    const f = ev.effect;
    if (!f || Object.keys(f).length === 0) {
      pure++;
      continue;
    }
    withEffect++;
    if (f.cash !== undefined) {
      assert(isInt(f.cash), `${ev.id}: cash`);
      assert(Math.abs(f.cash) <= FLAVOR_LIMITS.cash, `${ev.id}: ${f.cash} يتجاوز حد النكهة`);
    }
    for (const key of ["fans", "morale", "fitness", "reputation"])
      if (f[key] !== undefined) {
        assert(isInt(f[key]), `${ev.id}: ${key}`);
        assert(
          Math.abs(f[key]) <= FLAVOR_LIMITS[key],
          `${ev.id}: ${key}=${f[key]} يتجاوز حد النكهة ±${FLAVOR_LIMITS[key]}`,
        );
      }
    for (const t of f.targets || []) {
      if (t.morale) assert(Math.abs(t.morale) <= FLAVOR_LIMITS.morale, ev.id);
      if (t.fitness) assert(Math.abs(t.fitness) <= FLAVOR_LIMITS.fitness, ev.id);
      assert(!t.injuryDays, `${ev.id}: النكهة لا تُصاب أحدًا ولا تشفيه`);
    }
    // لا تصعيد ولا عقود ولا تقارير كشف داخل خبر: هذه آلية القرارات وحدها.
    for (const key of ["youth", "signing", "report", "incomeLater", "costLater", "wageBudget", "ticketPrice", "capacity"])
      assert(f[key] === undefined, `${ev.id}: نكهة تحمل «${key}»`);
  }
  assert(withEffect >= 40, `أخبار بأثر: ${withEffect} فقط`);
  assert(pure >= 20, `أخبار بلا أثر (خبر صرف): ${pure} فقط`);
});

// ── ٤) الترجمة ─────────────────────────────────────────────────────────────
test("9) كل نصوص الكتالوجين مترجمة بالكامل إلى الإنجليزية والفرنسية بلا بقايا عربية", () => {
  const sources = new Map(); // النص العربي → أول حدث يذكره
  const add = (ev, field, value) => {
    if (typeof value !== "string" || !ARABIC.test(value)) return;
    if (!sources.has(value)) sources.set(value, `${ev.id}:${field}`);
  };
  for (const ev of EVENT_CATALOG) {
    add(ev, "topic", ev.topic);
    add(ev, "title", ev.title);
    add(ev, "body", ev.body);
    for (const c of ev.choices) {
      add(ev, "label", c.label);
      add(ev, "note", c.note);
      add(ev, "incomeNote", c.incomeNote);
      add(ev, "costNote", c.costNote);
      if (c.signing) add(ev, "signing.labelAr", c.signing.labelAr);
    }
  }
  for (const ev of FLAVOR_CATALOG) {
    add(ev, "topic", ev.topic);
    add(ev, "title", ev.title);
    add(ev, "body", ev.body);
    add(ev, "effect.note", ev.effect?.note);
  }
  assert(sources.size >= 500, `نصوص عربية مجمّعة: ${sources.size}`);
  const previous = getLanguage();
  try {
    for (const lang of ["en", "fr"]) {
      setLanguage(lang);
      const leftovers = [];
      const untranslated = [];
      for (const [text, where] of sources) {
        const out = translateText(text);
        if (ARABIC.test(out)) leftovers.push(`${where} → ${JSON.stringify(out)}`);
        else if (out === text) untranslated.push(where);
      }
      assert.deepEqual(leftovers, [], `${lang}: بقايا عربية`);
      assert.deepEqual(untranslated, [], `${lang}: نصوص لم تُترجم`);
    }
    setLanguage("ar");
    // بالعربية يبقى النص كما هو — الترجمة لا تلمس لغة المصدر.
    for (const [text] of sources) assert.equal(translateText(text), text);
  } finally {
    setLanguage(previous);
  }
});

// ── ٥) لا حدث مستحيل ───────────────────────────────────────────────────────
test("10) لا حدث مستحيل: كل إشارة إلى حالة خارجية (بطولة/أسطورة/سابق/مصاب/طقس/توقف…) خلف بوابة when", () => {
  const hints = [
    "قارية",
    "الكأس",
    "أسطورة",
    "أساطير",
    "قاعة الشرف",
    "لاعب سابق",
    "اسم سابق",
    "قدامى",
    "القدامى",
    "مصاب",
    "المصاب",
    "ديربي",
    "التوقف الدولي",
    "النافذة الدولية",
    "الأمطار",
    "مطر",
    "ذروة الحر",
    "موجة حر",
    "الحر الشديد",
    "الشباب",
    "ناشئ",
    "حراس",
    "الخسارة",
    "الصدارة",
    "الرعاة",
    "شريكك التجاري",
    "التفاوض",
    "المتأخرات",
    "مساعد",
    "المدرجات الخالية",
  ];
  const offenders = [];
  for (const ev of [...EVENT_CATALOG, ...FLAVOR_CATALOG]) {
    const text = textOf(ev);
    const hit = hints.filter((w) => text.includes(w));
    if (hit.length && typeof ev.when !== "function")
      offenders.push(`${ev.id} يذكر «${hit.join("، ")}» بلا بوابة`);
  }
  assert.deepEqual(offenders, [], offenders.join("\n"));
});

test("11) لا محتوى ميتًا ولا بوابة شكلية: كل when تنفتح في حالة حقيقية وتنغلق في أخرى", () => {
  const never = [];
  const always = [];
  const check = (list, bucket) => {
    for (const ev of list) {
      if (!ev.when) continue;
      const results = battery.map((b) => Boolean(ev.when(b.state)));
      if (!results.some(Boolean)) never.push(ev.id);
      else if (results.every(Boolean)) always.push(ev.id);
    }
  };
  check(EVENT_CATALOG, never);
  check(FLAVOR_CATALOG, never);
  assert.deepEqual(never, [], "بوابات لا تنفتح في أي حالة (محتوى ميت): " + never.join(", "));
  assert.deepEqual(always, [], "بوابات لا تنغلق في أي حالة (بوابة بلا معنى): " + always.join(", "));
  // البوابات لا ترمي أبدًا، حتى على حفظ قديم بلا الوحدات الاختيارية.
  for (const b of battery)
    for (const ev of [...EVENT_CATALOG, ...FLAVOR_CATALOG]) {
      if (!ev.when) continue;
      assert.doesNotThrow(() => ev.when(b.state), `${ev.id} على ${b.name}`);
    }
});

test("12) الحفظات الموسعة والكلاسيكية ترى أحداثها الصحيحة فقط (لا كأس لمن ليس في كأس)", () => {
  const classic = fixtureState("classic");
  const world = fixtureState("world");
  const openClassic = new Set(availableDecisions(classic).map((e) => e.id));
  const openWorld = new Set(availableDecisions(world).map((e) => e.id));
  // نادي الحفظ الكلاسيكي ليس في أي بطولة قارية ولا يملك ملف صحافة.
  assert(!openClassic.has("continental-travel"), "حدث قاري ظهر في حفظ بلا بطولات");
  assert(openWorld.has("continental-travel"), "حدث قاري لم يظهر لنادٍ حيّ في كأسه");
  const openFlavorClassic = new Set(availableFlavor(classic).map((e) => e.id));
  const openFlavorWorld = new Set(availableFlavor(world).map((e) => e.id));
  for (const ev of FLAVOR_CATALOG)
    if (ev.category === "press")
      assert(
        openFlavorWorld.has(ev.id) || !ev.when?.(world),
        `${ev.id}: خبر صحفي في حفظ يملك صحافة`,
      );
  // الحفظ الكلاسيكي بلا معتزلين: أخبار «اللاعبين السابقين» لا تظهر.
  for (const ev of flavorByCategory("former"))
    assert(!openFlavorClassic.has(ev.id), `${ev.id}: خبر سابقين بلا أرشيف معتزلين`);
  assert(openClassic.size >= 20, `قرارات متاحة في حفظ جديد: ${openClassic.size}`);
  assert(openFlavorClassic.size >= 30, `أخبار متاحة في حفظ جديد: ${openFlavorClassic.size}`);
});

// ── ٦) العواقب تُطبَّق فعلًا ───────────────────────────────────────────────
function decisionState(type, base = "classic", cash = 600000000) {
  const s = structuredClone(fixtureState(base));
  setCash(s, cash);
  s.clubDecisions.push({
    id: "d-test",
    type,
    date: s.date,
    status: "open",
    choice: null,
  });
  return s;
}
const youthCountOf = (c) =>
  typeof c.youth === "number" ? c.youth : c.youth ? 1 : 0;
const signingCountOf = (c) => (c.signing ? c.signing.count || 1 : 0);

test("13) كل خيار يطبّق عواقبه مرة واحدة بالضبط (كل الأحداث × كل الخيارات)", () => {
  for (const ev of EVENT_CATALOG) {
    for (const c of ev.choices) {
      const s = decisionState(ev.id);
      const before = {
        cash: s.finance.cash,
        fans: s.fanSupport,
        rep: s.reputation,
        wage: s.finance.wageBudget,
        ticket: s.ticketPrice,
        capacity: s.capacity,
        head: s.players.length,
        obligations: (s.finance.obligations || []).length,
        news: (s.press?.news || []).length,
        open: s.inbox.filter((m) => m.required && m.status === "open").length,
      };
      // الحالة الوسطى التي يحسب عليها المحرك الفئات (بعد أثر المعنويات/الجاهزية العام).
      const mid = structuredClone(s);
      for (const p of squad(mid)) {
        p.morale = clamp(p.morale + (c.morale || 0), 0, 100);
        p.fitness = clamp(p.fitness + (c.fitness || 0), 0, 100);
      }
      const ownIds = new Set(squad(s).map((p) => p.id));
      const baseMorale = new Map(squad(s).map((p) => [p.id, p.morale]));
      const baseFitness = new Map(squad(s).map((p) => [p.id, p.fitness]));
      const midMorale = new Map(squad(mid).map((p) => [p.id, p.morale]));
      const midFitness = new Map(squad(mid).map((p) => [p.id, p.fitness]));
      const injuredBefore = new Map(
        squad(s).map((p) => [p.id, p.injuryUntil || null]),
      );

      resolveClubEvent(s, "d-test", c.id);
      const tag = `${ev.id}/${c.id}`;

      // المال: قيد دفتر واحد بالمفتاح المشتق من معرّف القرار.
      assert.equal(s.finance.cash, before.cash + (c.cash || 0), tag);
      if (c.cash) {
        const rows = s.finance.ledger.filter((e) => e.key === "d-test-decision");
        assert.equal(rows.length, 1, tag);
        assert.equal(rows[0].amount, c.cash, tag);
        assert.equal(rows[0].category, "club-event", tag);
      }
      // الحالة العددية مع القَصّ عند الحدود.
      assert.equal(s.fanSupport, clamp(before.fans + (c.fans || 0), 0, 100), tag);
      assert.equal(s.reputation, clamp(before.rep + (c.reputation || 0), 0, 100), tag);
      if (c.wageBudget)
        assert.equal(
          s.finance.wageBudget,
          Math.max(0, Math.round(before.wage + c.wageBudget)),
          tag,
        );
      if (c.ticketPrice)
        assert.equal(s.ticketPrice, Math.max(0, Math.round(before.ticket + c.ticketPrice)), tag);
      if (c.capacity)
        assert.equal(s.capacity, Math.max(0, Math.round(before.capacity + c.capacity)), tag);

      // اللاعبون الجدد: العدد والحقول.
      const incoming = youthCountOf(c) + signingCountOf(c);
      assert.equal(s.players.length, before.head + incoming, tag);
      const added = s.players.slice(before.head);
      for (const p of added) {
        assert.equal(p.fictional, true, tag);
        assert.equal(p.clubId, s.clubId, tag);
        assert.equal(p.status, "active", tag);
        assert.equal(p.injuryUntil, null, tag);
        assert(p.potential >= p.rating, tag);
      }
      if (youthCountOf(c)) {
        assert.equal(added[0].age, 17, tag);
        assert.equal(added[0].salary, 25000, tag);
        assert.equal(added[0].contractEnd, addDays(s.date, 730), tag);
      }
      if (c.signing) {
        const g = c.signing;
        assert.equal(added.at(-1).age, g.age, tag);
        assert.equal(added.at(-1).rating, g.rating, tag);
        assert.equal(added.at(-1).salary, g.wage, tag);
        assert.equal(added.at(-1).contractEnd, addDays(s.date, g.contractDays), tag);
      }

      // الآثار الموجَّهة: تصيب فئتها فقط، ولا تلمس أحدًا خارج كل الفئات.
      const scoped = new Set();
      for (const t of c.targets || [])
        for (const p of inScope(mid, t.scope)) scoped.add(p.id);
      let expectedMorale = new Map(midMorale);
      let expectedFitness = new Map(midFitness);
      for (const t of c.targets || []) {
        const members = inScope(mid, t.scope);
        if (!members.length) continue;
        if (t.morale || t.fitness)
          for (const p of members) {
            expectedMorale.set(
              p.id,
              clamp(expectedMorale.get(p.id) + (t.morale || 0), 0, 100),
            );
            expectedFitness.set(
              p.id,
              clamp(expectedFitness.get(p.id) + (t.fitness || 0), 0, 100),
            );
          }
      }
      for (const p of squad(s)) {
        // اللاعبون المولّدون من القرار نفسه (youth/signing) يبدؤون بحالة نظيفة،
        // ولا تُقاس عليهم خرائط ما قبل القرار.
        if (!ownIds.has(p.id)) {
          assert.equal(p.morale, 70, `${tag}: معنويات الوافد الجديد`);
          assert.equal(p.fitness, 95, `${tag}: جاهزية الوافد الجديد`);
          continue;
        }
        assert.equal(p.morale, expectedMorale.get(p.id), `${tag}: معنويات ${p.name}`);
        assert.equal(p.fitness, expectedFitness.get(p.id), `${tag}: جاهزية ${p.name}`);
        assert(p.morale >= 0 && p.morale <= 100, tag);
        assert(p.fitness >= 0 && p.fitness <= 100, tag);
        if (!scoped.has(p.id)) {
          // خارج الفئات: الأثر العام وحده.
          assert.equal(
            p.injuryUntil || null,
            injuredBefore.get(p.id),
            `${tag}: إصابة خارج الفئة`,
          );
        }
      }
      // من لم يكن في أي فئة لم يتغير أصلًا إلا بالأثر العام.
      for (const id of ownIds)
        if (!scoped.has(id)) {
          assert.equal(
            expectedMorale.get(id),
            clamp(baseMorale.get(id) + (c.morale || 0), 0, 100),
            `${tag}: أثر خارج الفئات`,
          );
          assert.equal(
            expectedFitness.get(id),
            clamp(baseFitness.get(id) + (c.fitness || 0), 0, 100),
            tag,
          );
        }
      // الإصابة الحتمية: أيام موجبة تُصيب لاعبًا واحدًا في الفئة، وسالبة تقصّر غيابًا قائمًا.
      for (const t of c.targets || []) {
        const members = inScope(mid, t.scope);
        if (!members.length) continue;
        const memberIds = new Set(members.map((p) => p.id));
        const days = Math.trunc(t.injuryDays || 0);
        if (days > 0) {
          const candidates = members.filter(
            (p) => !injuredBefore.get(p.id) || injuredBefore.get(p.id) < s.date,
          );
          const nowInjured = squad(s).filter(
            (p) =>
              memberIds.has(p.id) &&
              (!injuredBefore.get(p.id) || injuredBefore.get(p.id) < s.date) &&
              p.injuryUntil === addDays(s.date, days),
          );
          assert.equal(
            nowInjured.length,
            candidates.length ? 1 : 0,
            `${tag}: إصابة موجَّهة`,
          );
          if (candidates.length) {
            const weakest = candidates.reduce((a, b) =>
              midFitness.get(a.id) <= midFitness.get(b.id) ? a : b,
            );
            assert.equal(nowInjured[0].id, weakest.id, `${tag}: لم تُصِب الأقل جاهزية`);
          }
          const outside = squad(s).filter(
            (p) =>
              ownIds.has(p.id) &&
              !memberIds.has(p.id) &&
              (p.injuryUntil || null) !== injuredBefore.get(p.id),
          );
          assert.deepEqual(outside.map((p) => p.id), [], `${tag}: إصابة خارج الفئة`);
        } else if (days < 0) {
          for (const p of squad(s)) {
            if (!memberIds.has(p.id)) continue;
            const was = injuredBefore.get(p.id);
            if (!was || was < s.date) {
              assert.equal(p.injuryUntil || null, was, `${tag}: شفاء من لم يكن مصابًا`);
              continue;
            }
            const left = daysBetween(s.date, was) + days;
            assert.equal(
              p.injuryUntil || null,
              left > 0 ? addDays(s.date, left) : null,
              `${tag}: تقصير الغياب`,
            );
          }
        }
      }

      // الالتزامات المؤجلة: واحدة بالمفتاح والمبلغ والاستحقاق المطلوب.
      if (c.incomeLater) {
        const list = (s.finance.obligations || []).filter((o) => o.key === "d-test-income");
        assert.equal(list.length, 1, tag);
        assert.equal(list[0].amount, c.incomeLater, tag);
        assert.equal(list[0].due, addDays(s.date, c.incomeDays || 30), tag);
        assert.equal(list[0].category, "sponsor-income", tag);
        assert.equal(list[0].status, "pending", tag);
      }
      if (c.costLater) {
        const list = (s.finance.obligations || []).filter((o) => o.key === "d-test-cost");
        assert.equal(list.length, 1, tag);
        assert.equal(list[0].amount, c.costLater, tag);
        assert(list[0].amount >= 0, `${tag}: مبلغ الالتزام لا يكون سالبًا`);
        assert.equal(list[0].due, addDays(s.date, c.costDays || 30), tag);
        assert.equal(list[0].category, "club-event", tag);
        assert.equal(list[0].status, "pending", tag);
      }
      assert.equal(
        (s.finance.obligations || []).length,
        before.obligations + (c.incomeLater ? 1 : 0) + (c.costLater ? 1 : 0),
        `${tag}: التزامات زائدة`,
      );

      // تقرير الكشف يصيب لاعبًا من السوق لا من القائمة.
      if (c.report) {
        const reports = s.players.filter(
          (p) => p.scoutReport && p.clubId !== s.clubId && p.status !== "retired",
        );
        assert(reports.length >= 1, `${tag}: لم يُنشأ تقرير كشف`);
        const r = reports.at(-1).scoutReport;
        assert.equal(r.date, s.date, tag);
        assert.equal(r.confidence, 45, tag);
        assert(r.max >= r.min, tag);
      }
      // فرصة الرعاية تُجدول عبر آلية s.events القائمة، ولا تُكرَّر إن كانت قائمة.
      if (c.sponsorOffer) {
        const rows = s.events.filter(
          (e) => e.type === "sponsor" && e.ref === c.sponsorOffer,
        );
        assert.equal(rows.length, 1, tag);
        assert.equal(rows[0].date, addDays(s.date, 2), tag);
      }
      // مرآة الصحافة: إن كان للحفظ ملف صحافة دخل الخبر، وإن لم يكن فلا خطأ ولا أثر.
      if (c.press) {
        assert.equal((s.press?.news || []).length, before.news, tag);
      }
      if (c.note)
        assert(
          s.inbox.some((m) => m.body === c.note && m.category === "events"),
          `${tag}: لم تُنشر ملاحظة الأثر`,
        );

      // السجل: قرار محسوم مرة واحدة، والرسالة المطلوبة أُغلقت، ولا يبقى إجراء معلّق.
      const rec = s.clubDecisions.find((e) => e.id === "d-test");
      assert.equal(rec.status, "resolved", tag);
      assert.equal(rec.choice, c.id, tag);
      assert.equal(rec.resolvedOn, s.date, tag);
      assert(!pendingActions(s).some((m) => m.kind === "club-decision" && m.ref === "d-test"), tag);
      assert.throws(() => resolveClubEvent(s, "d-test", c.id), undefined, `${tag}: حسم مكرر`);
      assert.throws(() => resolveClubEvent(s, "d-test", "no-such-choice"), undefined, tag);
      validateSave(s);
    }
  }
});

test("14) القرار لا يُحسم بلا سيولة، ولا يُضاف لاعب والقائمة ممتلئة، والنوع المجهول مرفوض", () => {
  // الإفلاس: الخيار المكلف مرفوض والبديل المجاني يمر. نختار حدثًا فيه تكلفة نقدية سالبة
  // فعلًا؛ فبعض الأحداث تأخذ مالًا الآن وتؤجل السداد (تكلفة خيارها موجبة).
  const pricey = EVENT_CATALOG.find((e) =>
    e.choices.some((c) => c.cash <= -5000000),
  );
  assert(pricey, "لا قرار بتكلفة كبيرة في الكتالوج");
  const costly = pricey.choices.find((c) => c.cash <= -5000000);
  const broke = decisionState(pricey.id, "broke", 5000);
  assert.throws(
    () => resolveClubEvent(broke, "d-test", costly.id),
    /السيولة/,
    `${pricey.id}/${costly.id}: قرار مكلف مرّ رغم الإفلاس`,
  );
  const free = pricey.choices.find((c) => !c.cash);
  assert(free, `${pricey.id}: لا بديل بلا تكلفة`);
  resolveClubEvent(broke, "d-test", free.id);
  assert.equal(broke.finance.cash, 5000);
  validateSave(broke);

  // القائمة الممتلئة: أي تصعيد (youth أو signing) مرفوض، والقرار بلا تصعيد يمر.
  const full = decisionState("academy-cohort", "fullSquad");
  const add = EVENT_CATALOG.find((e) => e.id === "academy-cohort").choices.find(
    (c) => youthCountOf(c) + signingCountOf(c) > 0,
  );
  assert.throws(() => resolveClubEvent(full, "d-test", add.id), /القائمة ممتلئة/);
  const hold = EVENT_CATALOG.find((e) => e.id === "academy-cohort").choices.find(
    (c) => !youthCountOf(c) && !signingCountOf(c),
  );
  resolveClubEvent(full, "d-test", hold.id);
  validateSave(full);

  // معرّفات غير صالحة.
  const s = decisionState("community");
  assert.throws(() => resolveClubEvent(s, "no-such-decision", "host"));
  assert.throws(() => resolveClubEvent(s, "d-test", "no-such-choice"));
  // قرار مؤجل الدفع يُحصَّل مرة واحدة في تاريخه بالضبط.
  const deferred = decisionState("late-wages");
  const choice = EVENT_CATALOG.find((e) => e.id === "late-wages").choices.find(
    (c) => c.costLater,
  );
  resolveClubEvent(deferred, "d-test", choice.id);
  deferred.date = addDays(deferred.date, choice.costDays || 30);
  financeDay(deferred);
  const paid = deferred.finance.ledger.filter((e) => e.key === "d-test-cost");
  assert.equal(paid.length, 1, "الالتزام لم يُدفع في تاريخه");
  assert.equal(paid[0].amount, -choice.costLater);
  // الرصيد نفسه قد يتغير بدخل رعاية يستحق في اليوم ذاته، لذا يُقاس القيد لا الرصيد.
  assert(
    (deferred.finance.obligations || []).every(
      (o) => o.key !== "d-test-cost" || o.status !== "pending",
    ),
    "الالتزام بقي معلّقًا بعد الدفع",
  );
  financeDay(deferred);
  assert.equal(deferred.finance.ledger.filter((e) => e.key === "d-test-cost").length, 1);
  validateSave(deferred);
});

test("15) قرار الصحافة ينعكس في ملف الصحافة فعلًا حين يملك الحفظ واحدًا", () => {
  const withPress = decisionState("kit-launch", "press");
  const choice = EVENT_CATALOG.find((e) => e.id === "kit-launch").choices.find(
    (c) => c.press,
  );
  assert(choice, "لا خيار صحفي في kit-launch");
  const before = withPress.press.news.length;
  resolveClubEvent(withPress, "d-test", choice.id);
  assert.equal(withPress.press.news.length, before + 1);
  assert.equal(withPress.press.news[0].title, "القميص الجديد جاهز للإطلاق");
  assert.equal(withPress.press.news[0].date, withPress.date);
  // الحفظ الكلاسيكي بلا ملف صحافة: القرار يمر بلا خطأ ولا يخلق حقلًا جديدًا.
  const plain = decisionState("kit-launch");
  resolveClubEvent(plain, "d-test", choice.id);
  assert.equal(plain.press, undefined);
  validateSave(plain);
});

// ── ٧) ضابط الإزعاج والإيقاع ───────────────────────────────────────────────
test("16) ضابط الإزعاج: إيقاع القرارات ٧-٢٨ يومًا يتقلّص مع الصعوبة، ولا قرار جديد وقرارٌ مفتوح", () => {
  const order = ["beginner", "easy", "normal", "hard"];
  let previous = Infinity;
  for (const key of order) {
    const interval = DIFFICULTIES[key].eventInterval;
    assert(interval >= 7 && interval <= 28, `${key}: ${interval} يومًا`);
    assert(interval < previous, `${key}: الإيقاع لا يتقلّص مع الصعوبة`);
    previous = interval;
    const s = createGame({ difficulty: key });
    assert.equal(difficulty(s).eventInterval, interval, key);
  }
  // لا قرار قبل تاريخه، وقرار واحد عند بلوغه، ولا قرار ثانٍ ما دام الأول مفتوحًا.
  const s = createGame({ difficulty: "hard" });
  const due = s.nextClubEventDate;
  s.date = addDays(due, -1);
  assert.equal(clubEventDay(s), null, "قرار قبل موعده");
  s.date = due;
  const fired = clubEventDay(s);
  assert(fired, "لم يصدر قرار في موعده");
  assert.equal(s.clubDecisions.length, 1);
  assert.equal(s.clubDecisions[0].status, "open");
  assert.equal(daysBetween(due, s.nextClubEventDate), 12, "إيقاع hard");
  const openCount = s.clubDecisions.length;
  s.date = s.nextClubEventDate;
  assert.equal(clubEventDay(s), null, "قرار ثانٍ والأول ما زال مفتوحًا");
  assert.equal(s.clubDecisions.length, openCount);
  assert.equal(pendingActions(s).filter((m) => m.kind === "club-decision").length, 1);
  // الرسالة المطلوبة هي ما يوقف الزمن — القرار بلا رسالة يبقى بلا أثر.
  const msg = pendingActions(s).find((m) => m.kind === "club-decision");
  assert.equal(msg.required, true);
  assert.equal(msg.priority, "high");
  assert.equal(msg.category, "events");
  assert.equal(msg.ref, fired.id);
  resolveInfo(s, msg.id);
  validateSave(s);
});

test("17) النكهة لا توقّف الزمن، وتحترم مهلة الأيام الثلاثة، ولا تتكرر داخل نافذتها، وتتنوّع فئاتها", () => {
  const s = createGame();
  // الأيام الثلاثة الأولى من المسيرة: لا أخبار (لا تشويش على البداية).
  s.date = addDays(s.startDate, 2);
  assert.equal(flavorEventDay(s), null);
  s.date = addDays(s.startDate, 3);
  const first = flavorEventDay(s);
  assert(first, "لم يظهر خبر بعد مهلة البداية");
  // لا قرار ولا إجراء معلّق: الخبر «للعلم» فقط والزمن لا يتوقف.
  assert.deepEqual(pendingActions(s), [], "خبر نكهة أوقف الزمن");
  const msg = s.inbox.find((m) => m.id === first.id);
  assert.equal(msg.required, false);
  assert.equal(msg.kind, "flavor");
  assert.equal(msg.category, "events");
  assert.equal(msg.priority, "low");
  assert.match(msg.ref, /^flavor:fl-[a-z0-9-]+$/);
  assert(
    FLAVOR_CATALOG.some((e) => e.id === msg.ref.slice("flavor:".length)),
    "ref لا يشير إلى خبر في الكتالوج",
  );
  assert.equal(msg.read, false);
  assert.equal(msg.status, "open");
  // مهلة الأيام الثلاثة بين خبرين.
  const after = flavorEventDay(s);
  assert.equal(after, null, "خبران في اليوم نفسه");
  s.date = addDays(s.date, 2);
  assert.equal(flavorEventDay(s), null, "خبر قبل ثلاثة أيام");

  // دورة ٢٠٠ يوم: لا تكرار لمعرّف داخل النافذة، وتنوّع في الفئات، وكل خبر بوابته صادقة.
  const seen = [];
  let last = null;
  let run = 0;
  let maxRun = 0;
  for (let i = 0; i < 200; i++) {
    s.date = addDays(s.date, 1);
    const m = flavorEventDay(s);
    if (!m) continue;
    // الرسالة تحمل المعرّف في ref بصيغة "flavor:<id>" (الحقل type للقرارات وحدها).
    const ev = FLAVOR_CATALOG.find((e) => e.id === m.ref.slice("flavor:".length));
    assert(ev, `خبر بلا حدث في الكتالوج: ${m.type}`);
    if (ev.when) assert(ev.when(s), `${ev.id}: ظهر وبوابته غير متحققة`);
    const recent = seen.filter((x) => daysBetween(x.date, s.date) <= 150);
    assert(
      !recent.some((x) => x.id === ev.id),
      `${ev.id}: تكرر داخل نافذة ١٥٠ يومًا`,
    );
    run = last === ev.category ? run + 1 : 1;
    maxRun = Math.max(maxRun, run);
    last = ev.category;
    seen.push({ id: ev.id, category: ev.category, date: s.date });
    // الأثر الصغير يُطبَّق ضمن الحدود وبلا توقيف للزمن.
    assert.deepEqual(pendingActions(s), [], `${ev.id}: أوقف الزمن`);
    if (ev.effect?.cash) {
      const rows = s.finance.ledger.filter((e) => e.key === m.id + "-flavor");
      assert.equal(rows.length, 1, `${ev.id}: قيد مكرر`);
      assert.equal(rows[0].amount, ev.effect.cash, ev.id);
    }
    if (seen.length % 20 === 0) validateSave(s);
  }
  validateSave(s);
  assert(seen.length >= 30, `أخبار خلال ٢٠٠ يوم: ${seen.length}`);
  assert(maxRun <= 4, `فئة واحدة تكررت ${maxRun} مرات متتالية`);
  assert(
    new Set(seen.map((x) => x.category)).size >= 5,
    "النكهة لم تتنوع بين الفئات",
  );
});

test("18) التكامل: ٦٠ يومًا على advanceTime تنتج أخبارًا وقرارًا واحدًا وتحفظًا صالحًا", () => {
  const s = createGame({ difficulty: "hard" });
  let days = 0;
  while (days < 60) {
    const r = advanceTime(s, 1);
    if (r.blocked) {
      const pending = pendingActions(s);
      assert(pending.length, "توقف بلا إجراء معلّق");
      for (const m of [...pendingActions(s)]) {
        if (m.kind === "club-decision") {
          const rec = s.clubDecisions.find((e) => e.id === m.ref);
          const data = EVENT_CATALOG.find((e) => e.id === rec.type);
          resolveClubEvent(s, rec.id, data.choices.find((c) => !c.cash).id);
        } else resolveInfo(s, m.id);
      }
      continue;
    }
    days += r.advanced || 0;
  }
  const flavors = s.inbox.filter((m) => m.kind === "flavor");
  const decisions = s.clubDecisions;
  assert(flavors.length >= 3, `أخبار نكهة خلال ٦٠ يومًا: ${flavors.length}`);
  assert(decisions.length >= 2, `قرارات خلال ٦٠ يومًا: ${decisions.length}`);
  assert(decisions.every((d) => EVENT_CATALOG.some((e) => e.id === d.type)), "نوع قرار مجهول");
  // القرار يُوقف الزمن، والخبر لا يفعلان.
  assert(
    flavors.every((m) => m.required === false),
    "خبر نكهة مطلوب (يوقف الزمن)",
  );
  // إيقاع القرارات: الفارق بين تاريخَي قرارين متتاليين = إيقاع الصعوبة.
  for (let i = 1; i < decisions.length; i++)
    assert.equal(
      daysBetween(decisions[i - 1].date, decisions[i].date),
      difficulty(s).eventInterval,
      "إيقاع غير منتظم",
    );
  validateSave(s);
});

// ── ٨) فئات «تحديث الدراما» 0.25 ──────────────────────────────────────────
test("19) كل فئة مطلوبة (لاعبون/غرفة الملابس/جماهير/مالي/صحافة/موسمية) لها ≥٣ أحداث بخيارات وعواقب مختلفة", () => {
  const byTheme = new Map();
  for (const ev of EVENT_CATALOG) {
    if (!ev.theme) continue;
    assert(EVENT_THEMES.includes(ev.theme), `${ev.id}: فئة غير معلنة «${ev.theme}»`);
    byTheme.set(ev.theme, [...(byTheme.get(ev.theme) || []), ev]);
  }
  for (const theme of EVENT_THEMES) {
    const list = byTheme.get(theme) || [];
    assert(list.length >= 3, `${theme}: ${list.length} أحداث فقط (المطلوب ≥٣)`);
    for (const ev of list) {
      assert(ev.choices.length >= 2, `${ev.id}: خيارات`);
      const sigs = ev.choices.map((c) =>
        JSON.stringify(
          Object.keys(c)
            .filter((k) => k !== "id" && k !== "label" && k !== "note")
            .sort()
            .map((k) => [k, c[k]]),
        ),
      );
      assert.equal(new Set(sigs).size, sigs.length, `${ev.id}: عواقب متطابقة`);
      assert(
        ev.choices.some((c) => !c.cash),
        `${ev.id}: لا بديل بلا تكلفة`,
      );
    }
  }
  // الطلبات المحددة اسمًا في المرحلة الخامسة موجودة فعلًا بموضوعاتها.
  const required = [
    "agent-raise-demand",
    "benched-star-revolt",
    "transfer-request",
    "star-sale-offer",
    "training-brawl",
    "heavy-defeat-split",
    "big-win-momentum",
    "veteran-mediation",
    "ticket-price-protest",
    "tifo-funding",
    "coach-exit-demands",
    "emergency-sponsor",
    "floodlight-fault",
    "payroll-audit",
    "lineup-leak",
    "star-transfer-rumor",
    "exclusive-interview",
    "derby-logistics",
    "title-decider-week",
    "relegation-battle",
  ];
  const ids = new Set(EVENT_CATALOG.map((e) => e.id));
  assert.deepEqual(
    required.filter((id) => !ids.has(id)),
    [],
    "أحداث مطلوبة في المرحلة الخامسة مفقودة",
  );
  // الربط بالأنظمة القائمة: إحصائيات الموسم، الإصابات الطويلة، نتائج الديربي.
  assert(EVENT_CATALOG.some((e) => e.id === "long-injury-cover"), "لا حدث للإصابات الطويلة");
  assert(
    EVENT_CATALOG.some((e) => e.id === "derby-win-celebration") &&
      EVENT_CATALOG.some((e) => e.id === "derby-loss-response"),
    "لا ردود فعل على نتائج الديربي",
  );
  const scorer = EVENT_CATALOG.find((e) => e.id === "agent-raise-demand");
  assert(scorer.when(fixtureState("scorerSeason")), "حدث الهدّاف لا يقرأ إحصائيات الموسم");
  assert(!scorer.when(fixtureState("classic")), "حدث الهدّاف يظهر بلا أهداف مسجلة");
});

test("20) حدث قرار واحد مفتوح في أي لحظة، والآلية الأصلية لم تتغير", () => {
  for (const key of ["beginner", "easy", "normal", "hard"]) {
    const s = createGame({ difficulty: key });
    const interval = difficulty(s).eventInterval;
    let openPeak = 0;
    let resolved = 0;
    for (let day = 0; day < 180; day++) {
      // اليوم نفسه: لا قرار جديد ما دام هناك قرار مفتوح.
      clubEventDay(s);
      const open = s.clubDecisions.filter((e) => e.status === "open");
      openPeak = Math.max(openPeak, open.length);
      assert(open.length <= 1, `${key}: ${open.length} قرارات مفتوحة في ${s.date}`);
      for (const m of [...pendingActions(s)]) {
        if (m.kind !== "club-decision") {
          resolveInfo(s, m.id);
          continue;
        }
        const rec = s.clubDecisions.find((e) => e.id === m.ref);
        const data = EVENT_CATALOG.find((e) => e.id === rec.type);
        resolveClubEvent(s, rec.id, data.choices.find((c) => !c.cash).id);
        resolved++;
      }
      assert.equal(
        s.clubDecisions.filter((e) => e.status === "open").length,
        0,
        `${key}: قرار بقي مفتوحًا بعد الحسم`,
      );
      s.date = addDays(s.date, 1);
    }
    // الفاصل الزمني حسب الصعوبة هو نفسه الآلية الأصلية: ١٨٠ يومًا ÷ الفاصل ≈ عدد القرارات.
    const expected = Math.floor(180 / interval);
    assert(
      Math.abs(resolved - expected) <= 2,
      `${key}: ${resolved} قرارًا في ١٨٠ يومًا والمتوقع ≈${expected}`,
    );
    assert(openPeak <= 1, `${key}: ذروة القرارات المفتوحة ${openPeak}`);
    // لا حدث مكرر مرتين متتاليتين، والتنويع يعمل على كتالوج من ٧٠ حدثًا.
    const types = s.clubDecisions.map((e) => e.type);
    for (let i = 1; i < types.length; i++)
      assert.notEqual(types[i], types[i - 1], `${key}: حدث مكرر مرتين متتاليتين`);
    assert(
      new Set(types).size >= Math.min(types.length, 8),
      `${key}: التنويع ضعيف (${new Set(types).size} من ${types.length})`,
    );
    validateSave(s);
  }
});
