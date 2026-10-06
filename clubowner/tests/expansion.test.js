import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import { EXPANDED_CLUBS, DIVISIONS } from "../src/data/expandedCatalog.js";
import { generatedSquad } from "../src/models/generatedPlayers.js";
import {
  leagueSchedule,
  ownDivision,
  pyramidDay,
} from "../src/services/pyramid.js";
import { advanceTime } from "../src/services/time.js";
import {
  businessOpen,
  stockShirts,
  ticketForecast,
  sellSubscriptions,
  matchCommerce,
  commerceDay,
} from "../src/services/commerce.js";
import {
  managementDay,
  pressAnswer,
  appointCoach,
  dismissCoach,
  answerBid,
  loanPlayer,
} from "../src/services/clubManagement.js";
import { internationalDay } from "../src/services/internationals.js";
import { findPerson } from "../src/services/retired.js";
const club = EXPANDED_CLUBS.find((c) => c.country === "en" && c.tier === 3);
const game = () =>
  createGame({
    database: "world",
    expanded: true,
    clubId: club.id,
    leagues: ["eg", "en"],
    difficulty: "easy",
  });
test("Lower divisions use real-name sources; new England careers have three levels", () => {
  assert.deepEqual(
    DIVISIONS.filter((d) => d.country === "en").map((d) => d.tier),
    [1, 2, 3],
  );
  assert.equal(DIVISIONS.find((d) => d.id === "en-3").clubs.length, 24);
});
test("Generated players are deterministic, national names, stable IDs and rare potential outliers", () => {
  const a = generatedSquad(club, "2026-09-24", 99),
    b = generatedSquad(club, "2026-09-24", 99);
  assert.deepEqual(a, b);
  assert(a.every((p) => p.fictional && p.nationality === "ENG"));
  assert.equal(new Set(a.map((p) => p.id)).size, 24);
  const egypt = EXPANDED_CLUBS.find((c) => c.country === "eg" && c.tier === 2);
  assert(
    generatedSquad(egypt, "2026-09-24", 2).every((p) =>
      /[\u0600-\u06ff]/.test(p.name),
    ),
  );
  let gems = 0;
  for (let n = 0; n < 20; n++)
    gems += generatedSquad(club, "2026-09-24", n).filter(
      (p) => p.potential >= p.rating + 20,
    ).length;
  assert(gems > 0 && gems < 480 * 0.1);
});
test("Round robin is complete for even and odd-sized divisions, no same-team games", () => {
  for (const n of [5, 10, 24]) {
    const ids = Array.from({ length: n }, (_, i) => "c" + i);
    const f = leagueSchedule(ids, "2026-09-24", "test");
    assert.equal(f.length, n * (n - 1));
    assert(f.every((f) => f.home !== f.away));
    for (const id of ids)
      assert.equal(f.filter((f) => f.home === id).length, n - 1);
    assert.equal(new Set(f.map((f) => f.home + "-" + f.away)).size, f.length);
  }
});
test("Expanded career validates and JSON reload restores authoritative competition references", () => {
  const s = game();
  validateSave(s);
  const loaded = JSON.parse(JSON.stringify(s));
  validateSave(loaded);
  assert.equal(loaded.fixtures, ownDivision(loaded).fixtures);
  assert.equal(loaded.table, ownDivision(loaded).table);
  assert.equal(s.players.filter((p) => p.clubId === s.clubId).length, 22);
});
test("Ticket subscribers are not billed twice; higher prices reduce demand; businesses settle once", () => {
  const s = game();
  sellSubscriptions(s);
  assert.throws(() => sellSubscriptions(s));
  s.ticketPrice = 50;
  const low = ticketForecast(s);
  s.ticketPrice = 600;
  const high = ticketForecast(s);
  assert(low.attendance > high.attendance);
  const f = { id: "check", home: s.clubId };
  // 0.16: the posting must match the forecast for the SAME fixture (the next
  // real home game carries its own opponent/competition weights).
  const expected = ticketForecast(s, f);
  const before = s.finance.cash;
  matchCommerce(s, f);
  assert.equal(
    s.finance.cash - before,
    expected.gross - expected.attendance * 18,
  );
  const after = s.finance.cash;
  matchCommerce(s, f);
  assert.equal(s.finance.cash, after);
  businessOpen(s, "shop");
  stockShirts(s, 100);
  s.date = "2026-10-01";
  commerceDay(s);
  assert(s.commerce.inventory < 100);
  validateSave(s);
});
test("Coach termination costs two months and never dismisses owner; press promises are recorded", () => {
  const s = game(),
    owner = s.owner,
    before = s.finance.cash,
    wage = s.management.coach.salary;
  dismissCoach(s);
  assert.equal(s.finance.cash, before - wage * 2);
  assert.equal(s.owner, owner);
  appointCoach(s, "youth");
  managementDay(s);
  const q = s.press.questions[0];
  pressAnswer(s, q.id, "demand");
  assert.equal(s.press.promises.length, 1);
  assert.throws(() => pressAnswer(s, q.id, "support"));
  validateSave(s);
});
test("International callups select by nationality and return with history and fatigue", () => {
  const s = game();
  const p = s.players.find((p) => p.clubId === s.clubId);
  p.nationality = "TST";
  p.rating = 80;
  s.date = "2026-11-10";
  internationalDay(s);
  assert(p.internationalUntil);
  s.date = p.internationalUntil;
  const fitness = p.fitness;
  internationalDay(s);
  assert.equal(p.internationalCaps, 2);
  assert(p.fitness < fitness);
  assert.equal(p.internationalUntil, null);
});
test("Outgoing offers require consent and debit buyer; incoming loans return to parent", () => {
  const s = game();
  while (s.date < "2027-01-15") {
    for (const m of s.inbox) if (m.required) m.status = "resolved";
    advanceTime(s, 1);
  }
  managementDay(s);
  const o = s.management.outgoing.find((o) => o.status === "open");
  assert(o);
  const player = s.players.find((p) => p.id === o.playerId);
  assert.equal(player.clubId, s.clubId);
  const money = s.expansion.budgets[o.buyer];
  answerBid(s, o.id, true);
  assert.equal(player.clubId, o.buyer);
  assert.equal(s.expansion.budgets[o.buyer], money - o.fee);
  const prospect = s.players.find(
    (p) =>
      p.clubId !== s.clubId &&
      p.age <= 24 &&
      p.rating <= 72 &&
      p.contractEnd > "2027-05-01",
  );
  loanPlayer(s, prospect.id);
  const parent = prospect.loan.parent;
  const returnDate = prospect.loan.until;
  while (s.date < returnDate) {
    for (const m of s.inbox) if (m.required) m.status = "resolved";
    advanceTime(s, 1);
  }
  managementDay(s);
  assert.equal(prospect.clubId, parent);
  assert.equal(prospect.loan, null);
  validateSave(s);
});
test("Tampered expansion fields and duplicate division assignments are rejected", () => {
  const s = game();
  s.commerce.inventory = -1;
  assert.throws(() => validateSave(s));
  s.commerce.inventory = 0;
  s.expansion.divisions[1].clubs[0] = s.expansion.divisions[0].clubs[0];
  assert.throws(() => validateSave(s));
});
test("Version 3 careers migrate without retrofitting competitions or replacing players", () => {
  const s = createGame({ database: "current" });
  s.version = 3;
  const t = migrateSave(s);
  assert.equal(t.version, 18);
  assert.equal(t.expansion, undefined);
  assert.deepEqual(t.players, s.players);
  validateSave(t);
});
test("A complete 400-day season produces cups, standings and promotion with persistent identities", () => {
  const s = game();
  const ids = s.players.map((p) => p.id);
  for (let i = 0; i < 410; i++) {
    for (const m of s.inbox) if (m.required) m.status = "resolved";
    advanceTime(s, 1);
    if (i % 30 === 0) validateSave(s);
  }
  assert(s.seasonNumber >= 2);
  assert(s.expansion.history.length);
  assert(s.expansion.history[0].cups.every((c) => c.winner));
  assert(ids.every((id) => findPerson(s, id)), "identities persist in players or the retiree archive");
  assert.equal(ownDivision(s).clubs.length, 24);
  assert.equal(
    new Set(s.expansion.divisions.flatMap((d) => d.clubs)).size,
    s.expansion.divisions.reduce((n, d) => n + d.clubs.length, 0),
  );
  validateSave(s);
});
test("Monthly shop settlement is idempotent and exposes COGS separately from cash flow", () => {
  const s = game();
  businessOpen(s, "shop");
  stockShirts(s, 100);
  s.date = "2026-10-01";
  commerceDay(s);
  const c = structuredClone(s.commerce),
    cash = s.finance.cash;
  commerceDay(s);
  assert.deepEqual(s.commerce, c);
  assert.equal(s.finance.cash, cash);
  assert(s.commerce.history[0].operatingProfit <= s.commerce.history[0].net);
});
test("Winning a completed third-tier table promotes the club exactly one level", () => {
  const s = game();
  const old = ownDivision(s);
  for (const d of s.expansion.divisions)
    for (const f of d.fixtures) {
      f.played = true;
      f.homeGoals = 0;
      f.awayGoals = 0;
    }
  for (const c of s.expansion.cups) {
    c.winner = c.entrants[0];
    c.finalists = c.entrants.slice(0, 2); // Synthetic season completion must include a runner-up.
    c.alive = [c.winner];
    if (c.engine === "concacaf-v1" && c.kind === "central-american") {
      c.semifinalists = c.entrants.slice(2, 4);
      c.playinWinners = c.entrants.slice(4, 6);
    }
    if (
      c.engine === "concacaf-v1" &&
      ["leagues-cup", "caribbean"].includes(c.kind)
    )
      c.third = c.entrants[2];
  }
  old.table.find((t) => t.clubId === s.clubId).points = 999;
  s.date = s.nextSeasonDate;
  pyramidDay(s);
  for (let i = 0; i < 100 && s.seasonNumber === 1; i++) {
    s.date = new Date(Date.parse(s.date + "T12:00:00Z") + 86400000)
      .toISOString()
      .slice(0, 10);
    pyramidDay(s);
  }
  assert.equal(ownDivision(s).tier, 2);
  assert.equal(s.seasonNumber, 2);
  validateSave(s);
});
test("Import rejects HTML in cup scores and scouting ranges", () => {
  const s = game(),
    c = s.expansion.cups[0];
  c.results.push({
    id: "bad",
    date: s.date,
    home: c.entrants[0],
    away: c.entrants[1],
    homeGoals: "<img src=x onerror=alert(1)>",
    awayGoals: 0,
    winner: c.entrants[0],
  });
  assert.throws(() => validateSave(s));
  c.results = [];
  s.management.lastScout = {
    name: "test",
    date: s.date,
    rating: 55,
    potentialRange: ["<svg onload=alert(1)>", 99],
  };
  assert.throws(() => validateSave(s));
});
test("National name generators cover every market for future academy graduates", async () => {
  const { MARKETS } = await import("../src/data/worldMarkets.js");
  for (const m of MARKETS) {
    const c = EXPANDED_CLUBS.find((c) => c.country === m.id);
    const p = generatedSquad(c, "2026-09-24", 1);
    assert(p.every((p) => p.name && p.nationality && p.fictional));
  }
});
