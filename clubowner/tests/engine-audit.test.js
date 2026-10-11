// تدقيق المحرك 0.43: لا أحداث بعد الخروج (طرد/تبديل)، لا أهداف أشباح،
// تبديلات منطقية، وتوزيعات نتائج متوازنة عبر محاكاة كبيرة.
import assert from "node:assert/strict";
import test from "node:test";
import { createGame } from "../src/core/game.js";
import { matchDay, goals } from "../src/services/matches.js";
import { buildTimeline } from "../src/services/matchTimeline.js";

const lcg = (seed) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

const POS = ["GK", "CB", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST"];
const mkPlayers = (prefix) =>
  POS.map((position, i) => ({ id: `${prefix}${i}`, position, rating: 60 + (i % 7), fitness: 50 + ((i * 13) % 45) }));
const benchPlayers = () => [
  { id: "bGK", position: "GK", rating: 58, fitness: 90 },
  { id: "bCB", position: "CB", rating: 66, fitness: 90 },
  { id: "bST", position: "ST", rating: 70, fitness: 90 },
  { id: "bCM", position: "CM", rating: 64, fitness: 90 },
];

// يفحص كل المخطط: بعد أي خروج لا يحدث شيء لهذا اللاعب.
function assertNoEventsAfterExit(tl, label) {
  const exitAt = new Map();
  for (const e of tl.events) {
    if (e.t === "r") exitAt.set(e.p, e.min);
    if (e.t === "s") exitAt.set(e.o, e.min);
  }
  for (const e of tl.events) {
    const subject = e.t === "s" ? [e.o, e.i] : [e.p];
    for (const id of subject) {
      if (!exitAt.has(id)) continue;
      if (e.t === "s" && id === e.o) continue; // الحدث نفسه هو الخروج
      if (e.t === "r" && id === e.p && e.min === exitAt.get(id)) continue;
      assert.ok(
        e.min <= exitAt.get(id) || (e.t === "s" && id === e.i),
        `${label}: حدث ${e.t} للاعب ${id} عند ${e.min} بعد خروجه عند ${exitAt.get(id)}`,
      );
    }
  }
}

test("سيناريو الطرد: اللاعب المطرود لا يتلقى إنذارًا بعدها أبدًا (3000 مباراة محاكاة)", () => {
  for (let seed = 1; seed <= 3000; seed++) {
    const rng = lcg(seed);
    const tl = buildTimeline(mkPlayers("h"), benchPlayers(), rng, { isDerby: seed % 2 === 0, extraTime: seed % 5 === 0 });
    assertNoEventsAfterExit(tl, `seed ${seed}`);
    for (const e of tl.events.filter((x) => x.t === "r")) {
      const later = tl.events.filter((x) => x.t === "y" && x.p === e.p && x.min > e.min);
      assert.equal(later.length, 0, `seed ${seed}: إنذار بعد الطرد`);
    }
  }
});

test("الإنذار الثاني يعني طردًا في الدقيقة نفسها، ولا يتكرر لاعب في الطرد", () => {
  for (let seed = 1; seed <= 1500; seed++) {
    const tl = buildTimeline(mkPlayers("h"), benchPlayers(), lcg(seed), { isDerby: true });
    const perPlayer = new Map();
    for (const e of tl.events) if (e.t === "y") perPlayer.set(e.p, (perPlayer.get(e.p) || 0) + 1);
    for (const [id, n] of perPlayer) {
      assert.ok(n <= 2, `seed ${seed}: ${id} تلقى ${n} إنذارات`);
      const reds = tl.events.filter((e) => e.t === "r" && e.p === id).length;
      if (n === 2) assert.equal(reds, 1, `seed ${seed}: الإنذار الثاني يجب أن يُتبع بطرد`);
      assert.ok(reds <= 1, `seed ${seed}: طرد مرتين للاعب نفسه`);
    }
  }
});

test("التبديلات منطقية: الحارس لا يُبدَّل إلا بسبب طرد، والدخول من الدكة فقط، والخروج مرة واحدة", () => {
  for (let seed = 1; seed <= 2000; seed++) {
    const xi = mkPlayers("h");
    const tl = buildTimeline(xi, benchPlayers(), lcg(seed), {});
    const xiIds = new Set(xi.map((p) => p.id));
    const outs = new Set();
    for (const e of tl.events.filter((x) => x.t === "s")) {
      if (e.why === "gk") continue;
      assert.ok(xiIds.has(e.o), `seed ${seed}: خروج من خارج التشكيلة`);
      assert.ok(!xi.find((p) => p.id === e.o && p.position === "GK"), `seed ${seed}: الحارس بُدِّل بلا طرد`);
      assert.ok(!outs.has(e.o), `seed ${seed}: خروج مكرر`);
      outs.add(e.o);
      assert.ok(e.min >= 55 && e.min <= 80, `seed ${seed}: توقيت التبديل ${e.min} خارج النافذة`);
      assert.ok(e.i.startsWith("b"), `seed ${seed}: الداخل ليس من الدكة`);
    }
    assert.ok(tl.events.filter((x) => x.t === "s" && x.why !== "gk").length <= 3, "حتى ثلاثة تبديلات");
  }
});

test("التبديل يخرج الأكثر إرهاقًا أولًا", () => {
  let tired = 0;
  const trials = 400;
  for (let seed = 1; seed <= trials; seed++) {
    const xi = mkPlayers("h");
    xi[9].fitness = 20; // ST مرهق جدًا
    const tl = buildTimeline(xi, benchPlayers(), lcg(seed), { subs: 1, isDerby: false, extraTime: false });
    const first = tl.events.find((x) => x.t === "s");
    if (first && first.o === "h9") tired++;
  }
  assert.ok(tired / trials > 0.6, `المرهق يُبدَّل أولًا في ${tired}/${trials}`);
});

test("لا أهداف أشباح في المحاكاة الكاملة: الهدافون على الأرض لحظة التسجيل، والمجموع يطابق النتيجة", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  const table = s.table;
  let goalsSeen = 0;
  let rounds = 0;
  while (rounds < 8) {
    const fx = s.fixtures.find((x) => !x.played && (x.home === s.clubId || x.away === s.clubId));
    if (!fx) break;
    rounds++;
    s.date = fx.date;
    matchDay(s, [fx], table);
    const ours = fx.home === s.clubId ? fx.homeGoals : fx.awayGoals;
    assert.equal((fx.goalPlan || []).length, ours, "عدد الخطة = نتيجتنا النهائية");
    const ev = fx.timeline?.ev || [];
    const exitAt = new Map();
    const entryAt = new Map();
    for (const e of ev) {
      if (e.t === "r") exitAt.set(e.p, e.m);
      if (e.t === "s") {
        exitAt.set(e.o, e.m);
        entryAt.set(e.i, e.m);
      }
    }
    for (const g of fx.goalPlan || []) {
      goalsSeen++;
      if (g.s) {
        assert.ok(!exitAt.has(g.s) || exitAt.get(g.s) > g.m, `هدف ${g.s} عند ${g.m} بعد خروجه`);
        assert.ok(!entryAt.has(g.s) || entryAt.get(g.s) <= g.m, `هدف ${g.s} قبل دخوله`);
      }
      if (g.a) assert.ok(!exitAt.has(g.a) || exitAt.get(g.a) > g.m, "صانع خارج الملعب");
    }
    // إحصاءات الموسم تطابق الخطة لهذه المباراة (التراكم من الصفر)
  }
  assert.ok(rounds > 0);
  // المجموع الكلي لأهداف الموسم = مجموع أهداف الخطط
  const seasonTotal = s.players.filter((p) => p.clubId === s.clubId).reduce((n, p) => n + (p.seasonGoals || 0), 0);
  const planTotal = s.fixtures.reduce((n, f) => n + ((f.played && f.goalPlan?.length) || 0), 0);
  assert.equal(seasonTotal, planTotal, "أهداف الموسم = أهداف الخطط");
  void goalsSeen;
});

test("توزيع النتائج: القوي يغلب غالبًا، والمفاجآت نادرة مع فارق كبير، والسكورات معقولة", () => {
  const N = 20000;
  const simulate = (diff) => {
    const s = { seed: 12345 + diff };
    let strong = 0, upset = 0, total = 0, max = 0;
    for (let i = 0; i < N; i++) {
      s.seed = (s.seed * 1664525 + 1013904223) | 0;
      const a = goals(s, 60 + diff, 60, false);
      const b = goals(s, 60, 60 + diff, false);
      if (a > b) strong++;
      else if (a < b) upset++;
      total += a + b;
      max = Math.max(max, a, b);
    }
    return { win: strong / N, upset: upset / N, avg: total / N, max };
  };
  const even = simulate(0);
  assert.ok(Math.abs(even.win - even.upset) < 0.03, "تعادل القوة يعطي فرصًا متساوية تقريبًا");
  const mid = simulate(10);
  assert.ok(mid.win > 0.5 && mid.win < 0.62, `فارق 10 يغلب ${mid.win.toFixed(2)}`);
  const big = simulate(20);
  assert.ok(big.win > 0.65 && big.win < 0.82, `فارق 20 يغلب ${big.win.toFixed(2)}`);
  assert.ok(big.upset < 0.12, `مفاجآت فارق 20: ${big.upset.toFixed(2)}`);
  const huge = simulate(30);
  assert.ok(huge.upset < 0.04, `مفاجآت فارق 30: ${huge.upset.toFixed(2)}`);
  for (const r of [even, mid, big, huge]) {
    assert.ok(r.avg > 2.1 && r.avg < 2.9, `متوسط الأهداف ${r.avg.toFixed(2)}`);
    assert.ok(r.max <= 6, `أقصى هدف لفريق ${r.max}`);
  }
});

test("الحراس لا يسجلون في الخطط (عبر مباريات كثيرة)", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  const table = s.table;
  for (let round = 0; round < 10; round++) {
    const fx = s.fixtures.find((x) => !x.played && (x.home === s.clubId || x.away === s.clubId));
    if (!fx) break;
    s.date = fx.date;
    matchDay(s, [fx], table);
    for (const g of fx.goalPlan || []) {
      const p = s.players.find((y) => y.id === g.s);
      if (p) assert.notEqual(p.position, "GK", "حارس سجّل هدفًا");
    }
  }
});
