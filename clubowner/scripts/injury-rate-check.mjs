// فحص معدل الإصابات داخل المخطط الزمني الجديد: إصابات الفريق لكل مباراة.
import { buildTimeline } from "../src/services/matchTimeline.js";
import { injuryProbability, TIMELINE_INJURY_SCALE } from "../src/services/matchConsequences.js";

const lcg = (seed) => {
  let x = seed >>> 0 || 1;
  return () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296);
};
const mk = (prefix, pos) =>
  pos.map((position, i) => ({ id: `${prefix}${i}`, position, rating: 60 + i, fitness: 75, seasonMinutes: 900 }));
const xi = mk("h", ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"]);
const bench = [
  { id: "b1", position: "CM", rating: 58, fitness: 90, seasonMinutes: 0 },
  { id: "b2", position: "ST", rating: 57, fitness: 90, seasonMinutes: 0 },
  { id: "b3", position: "CB", rating: 56, fitness: 90, seasonMinutes: 0 },
  { id: "b4", position: "GK", rating: 50, fitness: 90, seasonMinutes: 0 },
  { id: "b5", position: "LW", rating: 55, fitness: 90, seasonMinutes: 0 },
];
const N = 3000;
let inj = 0;
let injSub = 0;
let injNoSub = 0;
for (let seed = 1; seed <= N; seed++) {
  const tl = buildTimeline(xi, bench, lcg(seed), {
    injuryProb: (p) => TIMELINE_INJURY_SCALE * injuryProbability(p, 1),
  });
  for (const e of tl.events) {
    if (e.t === "i") inj++;
  }
  injSub += tl.events.filter((e) => e.t === "s" && e.why === "injury").length;
}
console.log(`injuries per team per match: ${(inj / N).toFixed(3)} (injury-driven subs: ${(injSub / N).toFixed(3)})`);
void injNoSub;
