import test from "node:test";
import assert from "node:assert/strict";
import {
  CAPACITY_TIERS,
  STADIUM_COSTS,
  ensureSportsCity,
  stadiumQuote,
  startStadium,
  finishStadium,
  realisticAttendance,
  chooseOldGround,
  nameStadium,
} from "../src/services/sportsCity.js";
import { migrateSave } from "../src/core/migrations.js";
const state = () => ({
  version: 25,
  date: "2026-07-01",
  capacity: 15000,
  reputation: 20,
  fanSupport: 35,
  empire: { personal: 2_000_000_000, monthTrack: { expenses: 0 }, prestige: 0 },
});
test("eight escalating capacity/cost tiers and restricted renovation", () => {
  assert.deepEqual(
    CAPACITY_TIERS,
    [5000, 15000, 30000, 60000, 100000, 150000, 200000, 250000],
  );
  assert.equal(STADIUM_COSTS.length, 8);
  assert.ok(STADIUM_COSTS.every((v, i) => i === 0 || v > STADIUM_COSTS[i - 1]));
  const s = state();
  assert.ok(
    stadiumQuote(s, 2, "renovate").cost < stadiumQuote(s, 2, "new").cost,
  );
  assert.throws(() => stadiumQuote(s, 4, "renovate"));
  assert.equal(stadiumQuote(s, 7, "new").days, 1095);
});
test("personal funding, time, old ground and naming, without spending club cash", () => {
  const s = state();
  s.finance = { cash: 500 };
  const p = startStadium(s, {
    tier: 7,
    route: "new",
    district: "suburbs",
    design: "classic",
  });
  assert.equal(s.finance.cash, 500);
  assert.equal(finishStadium(s), false);
  s.date = p.end;
  assert.equal(finishStadium(s), true);
  assert.equal(s.capacity, 250000);
  assert.equal(chooseOldGround(s, "youth"), "youth");
  assert.equal(nameStadium(s, "auction"), "auction");
  assert.throws(() => nameStadium(s, "owner"));
});
test("weak clubs cannot fill enormous grounds even in derbies", () => {
  const s = state();
  s.capacity = 250000;
  assert.ok(realisticAttendance(s, { isDerby: true }) < 250000 * 0.3);
  s.reputation = 100;
  s.fanSupport = 100;
  assert.ok(realisticAttendance(s) > 100000);
});
test("old save stadium maps nearest tier without changing existing capacity or other state", () => {
  const s = state();
  s.version = 24;
  s.capacity = 33000;
  const migrated = migrateSave(s);
  assert.equal(migrated.sportsCity.stadium.tier, 2);
  assert.equal(migrated.capacity, 33000);
  assert.deepEqual(migrated.sportsCity.facilities, []);
  assert.equal(migrateSave(migrated), migrated);
});
test("ticket income and paid crowd obey reputation demand in a huge stadium", async () => {
  const { ticketForecast } = await import("../src/services/commerce.js");
  const s = state();
  s.capacity = 250000;
  ensureSportsCity(s);
  s.ticketPrice = 120;
  s.clubId = "city";
  s.commerce = { seasonTickets: 10000, matchPremium: 0 };
  const result = ticketForecast(s, { away: "unknown", isDerby: true });
  assert.ok(result.attendance <= realisticAttendance(s, { isDerby: true }));
  assert.ok(result.paying <= result.attendance);
  assert.ok(result.gross < 250000 * 120 * 2);
});
