// Per-stage profiler for the daily tick (0.20 capacity work).
// Replicates the stage order of advanceTime() (src/services/time.js) on a full expanded world and
// reports the cumulative milliseconds spent in every stage over DAYS days, so hot spots can be
// found before optimising. Measurement only — the game itself keeps using advanceTime().
// Usage: DAYS=120 node --max-old-space-size=1400 tests/capacity-profile.mjs
import { createGame } from "../src/core/game.js";
import { ALL_MARKETS } from "../src/data/worldMarkets.js";
import { academyDay } from "../src/services/talent/academy.js";
import { scoutingDay } from "../src/services/talent/scouting.js";
import { worldTalentDay } from "../src/services/talent/world.js";
import { cleanTraining } from "../src/services/talent/training.js";
import { loanDayStart, loanDayEnd } from "../src/services/loans.js";
import { ownFixtures, allFixtures } from "../src/services/calendar.js";
import { pyramidDay } from "../src/services/pyramid.js";
import { commerceDay } from "../src/services/commerce.js";
import { managementDay } from "../src/services/clubManagement.js";
import { legendDay } from "../src/services/legends.js";
import { aiTransferDay } from "../src/services/market.js";
import { internationalDay } from "../src/services/internationals.js";
import { contractDay } from "../src/services/contractClauses.js";
import { agingDay, retirementDay } from "../src/services/careers.js";
import { staffDay } from "../src/services/staff.js";
import { clubEventDay } from "../src/services/clubEvents.js";
import { addDays } from "../src/core/utils.js";
import { pendingActions } from "../src/services/inbox.js";
import { financeDay } from "../src/services/finance.js";
import { facilityDay } from "../src/services/facilities.js";
import { sponsorDay } from "../src/services/sponsors.js";
import { matchDay } from "../src/services/matches.js";
import { developmentDay } from "../src/services/development.js";

const DAYS = Number(process.env.DAYS || 120);
const t0 = performance.now();
const s = createGame({
  database: process.env.DB || "world",
  expanded: true,
  leagues: ALL_MARKETS,
  difficulty: "easy",
});
console.log(`created in ${Math.round(performance.now() - t0)} ms · players ${s.players.length}`);

const totals = new Map();
const worst = new Map();
const timed = (name, fn) => {
  const a = performance.now();
  const r = fn();
  const ms = performance.now() - a;
  totals.set(name, (totals.get(name) || 0) + ms);
  if (!worst.has(name) || worst.get(name).ms < ms) worst.set(name, { ms, date: s.date });
  return r;
};

// Required inbox items (sponsor offers, renewals…) block advanceTime; the profiler mirrors the
// baseline script by declining/acknowledging them so the loop keeps moving.
const clearRequired = () => {
  for (const m of s.inbox) if (m.required) m.required = false, (m.resolved = true);
};

const dayMs = [];
for (let i = 0; i < DAYS; i++) {
  const start = performance.now();
  s.date = addDays(s.date, 1);
  timed("agingDay", () => agingDay(s));
  timed("retirementDay", () => retirementDay(s));
  timed("staffDay", () => staffDay(s));
  timed("internationalDay", () => internationalDay(s));
  timed("contractDay", () => contractDay(s));
  timed("loanDayStart", () => loanDayStart(s));
  timed("worldTalentDay", () => worldTalentDay(s));
  timed("academyDay", () => academyDay(s));
  timed("scoutingDay", () => scoutingDay(s));
  timed("cleanTraining", () => cleanTraining(s));
  timed("financeDay", () => financeDay(s));
  timed("facilityDay", () => facilityDay(s));
  timed("sponsorDay", () => sponsorDay(s));
  timed("developmentDay", () => developmentDay(s));
  timed("matchDay", () => matchDay(s));
  const loanFixtures = timed("loanScan", () =>
    s.players.some((p) => p.loan?.version === 2 && p.loan.parent === s.clubId)
      ? allFixtures(s).filter((f) => f.date === s.date)
      : [],
  );
  timed("pyramidDay", () => pyramidDay(s));
  timed("loanDayEnd", () => loanDayEnd(s, loanFixtures));
  timed("commerceDay", () => commerceDay(s));
  timed("managementDay", () => managementDay(s));
  timed("legendDay", () => legendDay(s));
  timed("aiTransferDay", () => aiTransferDay(s));
  timed("clubEventDay", () => clubEventDay(s));
  timed("pendingActions", () => pendingActions(s));
  timed("ownFixtures", () => ownFixtures(s).some((f) => f.played && f.date === s.date));
  clearRequired();
  dayMs.push(performance.now() - start);
}

const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]);
const total = rows.reduce((a, [, ms]) => a + ms, 0);
console.log(`\n${DAYS} days · total ${Math.round(total)} ms · avg ${(total / DAYS).toFixed(1)} ms/day · players ${s.players.length} · ${s.date}`);
for (const [name, ms] of rows)
  console.log(
    `${name.padEnd(18)} ${String(Math.round(ms)).padStart(7)} ms  ${((100 * ms) / total).toFixed(1).padStart(5)}%  worst ${Math.round(worst.get(name).ms)} ms on ${worst.get(name).date}`,
  );
const sorted = [...dayMs].sort((a, b) => a - b);
console.log(`day p50 ${sorted[Math.floor(sorted.length / 2)].toFixed(0)} ms · p95 ${sorted[Math.floor(sorted.length * 0.95)].toFixed(0)} ms · max ${sorted[sorted.length - 1].toFixed(0)} ms`);
console.log("PROFILE_DONE");
