// نموذج الأهداف 0.43: واقعية حسب المركز، ترجيح النجوم، وعدم وجود "أهداف أشباح".
import assert from "node:assert/strict";
import test from "node:test";
import { createGame } from "../src/core/game.js";
import { matchDay } from "../src/services/matches.js";
import { planOwnGoals, starWeight, scoreWeight } from "../src/services/goalModel.js";
import { buildMatchReport } from "../src/services/matchReport.js";

// مولّد حتمي بسيط للاختبارات
const lcg = (seed) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const pl = (id, position, rating) => ({ p: { id, position, rating, name: id } });
const xi = [
  pl("gk", "GK", 70),
  pl("cb", "CB", 70),
  pl("lb", "LB", 70),
  pl("rb", "RB", 70),
  pl("dm", "DM", 70),
  pl("cm", "CM", 70),
  pl("am", "AM", 70),
  pl("lw", "LW", 70),
  pl("rw", "RW", 70),
  pl("st", "ST", 70),
  pl("cf", "CF", 70),
];

test("الحارس لا يسجل والمهاجم يسجل أكثر من المدافع", () => {
  const rng = lcg(7);
  const counts = {};
  for (let i = 0; i < 4000; i++) {
    for (const g of planOwnGoals(rng, xi, 1)) counts[g.s] = (counts[g.s] || 0) + 1;
  }
  assert.equal(counts.gk ?? 0, 0, "الحارس لا يسجل");
  const attack = (counts.st || 0) + (counts.cf || 0);
  const defence = (counts.cb || 0) + (counts.lb || 0) + (counts.rb || 0);
  assert.ok(attack > defence * 3, `الهجوم ${attack} يجب أن يتفوق على الدفاع ${defence}`);
});

test("النجوم يسجلون أكثر من اللاعبين العاديين في المركز نفسه", () => {
  assert.ok(starWeight(85) > starWeight(65));
  assert.ok(starWeight(65) > starWeight(45));
  assert.ok(starWeight(200) <= 4 && starWeight(-50) >= 0.3, "محصور");
  assert.ok(scoreWeight({ position: "ST", rating: 85 }) > scoreWeight({ position: "ST", rating: 60 }));
});

test("عدد الأهداف في الخطة يطابق عدد الأهداف، والصانع غير الهداف، والدقائق مرتبة", () => {
  const rng = lcg(99);
  const plan = planOwnGoals(rng, xi, 5, false);
  assert.equal(plan.length, 5);
  for (const g of plan) {
    if (g.a) assert.notEqual(g.a, g.s, "لا يصنع اللاعب هدفه");
    assert.ok(g.m >= 1 && g.m <= 90);
  }
  const mins = plan.map((g) => g.m);
  assert.deepEqual(mins, [...mins].sort((a, b) => a - b));
  assert.deepEqual(planOwnGoals(rng, [], 3), [], "بلا تشكيلة لا خطة");
});

test("لا أهداف أشباح: المسجَّل في السجل والإحصاءات والتقرير هو نفسه", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  const table = s.table;
  let playedGoals = 0;
  for (let round = 0; round < 6; round++) {
    const fx = s.fixtures.find((x) => !x.played && (x.home === s.clubId || x.away === s.clubId));
    if (!fx) break;
    s.date = fx.date;
    matchDay(s, [fx], table);
    const ours = fx.home === s.clubId ? fx.homeGoals : fx.awayGoals;
    if (!fx.goalPlan) {
      assert.equal(ours, 0, "الخطة غائبة فقط عندما لا أهداف لنا");
      continue;
    }
    assert.equal(fx.goalPlan.length, ours, "خطة بعدد الأهداف");
    const selectedIds = new Set(
      (fx.lineup?.length ? fx.lineup : []).map((x) => x.playerId),
    );
    for (const g of fx.goalPlan) {
      if (selectedIds.size) assert.ok(selectedIds.has(g.s), "الهداف من التشكيلة فقط");
      if (g.a && selectedIds.size) assert.ok(selectedIds.has(g.a), "الصانع من التشكيلة فقط");
    }
    // التقرير يعرض الهدافين أنفسهم
    const report = buildMatchReport(s, fx);
    const reported = report.events
      .filter((e) => e.type === "goal" && e.clubId === s.clubId)
      .map((e) => e.playerId);
    assert.deepEqual(
      reported.slice().sort(),
      fx.goalPlan.map((g) => g.s).sort(),
      "التقرير يطابق خطة المحرك",
    );
    playedGoals += ours;
  }
  assert.ok(playedGoals > 0, "المباريات أنتجت أهدافًا فعلًا");
});
