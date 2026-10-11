// الإصابة داخل المباراة (0.44): المصاب يخرج في دقيقته ويُستبدل إن وُجد بديل،
// والحارس لا يُستبدل إلا بحارس احتياطي، ومجموع التبديلات لا يتجاوز ثلاثة.
import test from "node:test";
import assert from "node:assert/strict";
import { buildTimeline } from "../src/services/matchTimeline.js";
import { applyMatchConsequences } from "../src/services/matchConsequences.js";
import { createGame } from "../src/core/game.js";

const lcg = (seed) => {
  let x = seed >>> 0 || 1;
  return () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296);
};
const mk = (prefix) =>
  ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"].map((position, i) => ({
    id: `${prefix}${i}`,
    position,
    rating: 60 + i,
    fitness: 80,
  }));
const bench = () => [
  { id: "b1", position: "CM", rating: 58, fitness: 90 },
  { id: "b2", position: "ST", rating: 57, fitness: 90 },
  { id: "b3", position: "CB", rating: 56, fitness: 90 },
  { id: "b4", position: "GK", rating: 50, fitness: 90 },
  { id: "b5", position: "LW", rating: 55, fitness: 90 },
];

test("كل إصابة لأساسي خارج الحراسة تُستبدل في دقيقتها، والمصاب لا يظهر بعدها", () => {
  for (let seed = 1; seed <= 1500; seed++) {
    const xi = mk("h");
    const tl = buildTimeline(xi, bench(), lcg(seed), { injuryProb: () => 0.5 });
    for (const e of tl.events.filter((x) => x.t === "i")) {
      const p = xi.find((x) => x.id === e.p);
      if (!p || p.position === "GK") continue;
      const sub = tl.events.find((x) => x.t === "s" && x.why === "injury" && x.o === e.p);
      if (sub) assert.equal(sub.min, e.min, `seed ${seed}: الاستبدال في دقيقة الإصابة`);
      if (sub) assert.ok(!tl.onPitchAt(e.p, e.min + 1), `seed ${seed}: المصاب خرج`);
      if (sub) {
        const later = tl.events.filter((x) => (x.p === e.p || x.o === e.p) && x.min > e.min && x.t !== "s");
        assert.equal(later.length, 0, `seed ${seed}: حدث للمصاب بعد خروجه`);
      }
    }
  }
});

test("التبديلات الثلاثة تشمل تبديلات الإصابة، ولا يتجاوز المجموع ثلاثة", () => {
  for (let seed = 1; seed <= 1500; seed++) {
    const tl = buildTimeline(mk("h"), bench(), lcg(seed), { injuryProb: () => 0.6 });
    const subs = tl.events.filter((x) => x.t === "s" && x.why !== "gk");
    assert.ok(subs.length <= 3, `seed ${seed}: ${subs.length} تبديلات`);
  }
});

test("حارس مصاب بلا احتياطي يُكمل المباراة، ولا يُستبدل إلا بحارس احتياطي", () => {
  const xi = mk("h");
  const benchNoGK = bench().filter((p) => p.position !== "GK");
  const tl = buildTimeline(xi, benchNoGK, () => 0.5, {
    injuryProb: (p) => (p.position === "GK" ? 1 : 0),
  });
  assert.ok(tl.events.some((e) => e.t === "i" && e.p === "h0"), "الحارس أُصيب");
  assert.ok(tl.onPitchAt("h0", 89), "بلا احتياطي يبقى الحارس على الأرض");
});

test("نظام بلا دحرجة إصابات (مخطط قديم) لا يغيّر سلوك التبديلات", () => {
  const tl = buildTimeline(mk("h"), bench(), lcg(7), {});
  assert.ok(!tl.injuryRolled);
  assert.ok(!tl.events.some((e) => e.t === "i"));
});

test("المخطط المُدحرج: الإصابات تُطبَّق من أحداث المحرك فقط", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  const xi = s.players.filter((p) => p.clubId === s.clubId).slice(0, 11);
  for (const p of xi) delete p.injuryUntil;
  const f = {
    id: "inj-test",
    home: s.clubId,
    away: "other",
    homeGoals: 1,
    awayGoals: 0,
    lineup: xi.map((p) => ({ playerId: p.id, slot: p.position, fit: 100 })),
    timeline: { ir: 1, ev: [{ m: 40, t: "i", p: xi[2].id }] },
  };
  // rng يعيد 0 دائمًا: لو عمل الاحتمال القديم لأُصيب الجميع، فالاختبار يكشف ذلك
  applyMatchConsequences(s, f, { yellows: [], reds: [] }, () => 0, {});
  assert.ok(xi[2].injuryUntil, "المصاب في المخطط أُصيب");
  assert.equal(xi.filter((p) => p.injuryUntil).length, 1, "لا إصابات خارج المخطط");
});
