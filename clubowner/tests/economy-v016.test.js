import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  offersFor,
  signSponsor,
  negotiateSponsor,
  answerSponsorDeal,
  SPONSOR_RAISES,
} from "../src/services/sponsors.js";
import {
  marketOpen,
  windowStatus,
  aiTransferDay,
} from "../src/services/market.js";
import { post } from "../src/services/finance.js";
import {
  COACHES,
  appointCoach,
  dismissCoach,
  renewCoach,
  coachYearsLeft,
  managementDay,
} from "../src/services/clubManagement.js";
import {
  categoryPrices,
  setCategoryPrices,
  setMatchPremium,
  ticketForecast,
  matchCommerce,
  sellSubscriptions,
} from "../src/services/commerce.js";

const game = () =>
  createGame({
    database: "world",
    expanded: true,
    leagues: ["eg"],
    difficulty: "easy",
  });

test("reputable club wins the demanded raise and signs at the higher value", () => {
  const s = game();
  s.reputation = 90;
  s.press.trust = 80;
  const base = offersFor(s, "sleeve")[0];
  const deal = negotiateSponsor(s, "sleeve", base.sponsorId, 20);
  assert.equal(deal.status, "accepted");
  assert.equal(deal.rounds, 1);
  assert.equal(deal.current.amount, Math.round(base.amount * 1.2));
  const cash = s.finance.cash;
  const c = signSponsor(s, answerSponsorDeal(s, deal.id, true));
  assert.equal(c.amount, Math.round(base.amount * 1.2));
  assert.equal(s.finance.cash - cash, Math.floor(c.amount * 0.25));
  assert.equal(
    s.finance.obligations.filter((o) => o.ref === c.id).length,
    11,
  );
  assert.equal(deal.status, "closed");
  validateSave(s);
});

test("mid-table credibility earns a counter; rounds are capped at two", () => {
  const s = game();
  s.reputation = 60;
  s.press.trust = 55;
  const base = offersFor(s, "sleeve")[0];
  const deal = negotiateSponsor(s, "sleeve", base.sponsorId, 20);
  assert.equal(deal.status, "countered");
  assert.equal(deal.current.amount, Math.round(base.amount * 1.1));
  const again = negotiateSponsor(s, "sleeve", base.sponsorId, 10);
  assert.equal(again.id, deal.id);
  assert.equal(again.rounds, 2);
  assert.throws(() => negotiateSponsor(s, "sleeve", base.sponsorId, 10));
  assert.throws(() => negotiateSponsor(s, "sleeve", base.sponsorId, 25));
  validateSave(s);
});

test("weak reputation loses the sponsor but keeps the other offers alive", () => {
  const s = game();
  s.reputation = 30;
  s.press.trust = 40;
  const offers = offersFor(s, "sleeve");
  const deal = negotiateSponsor(s, "sleeve", offers[0].sponsorId, 30);
  assert.equal(deal.status, "dead");
  assert.throws(() => answerSponsorDeal(s, deal.id, true));
  const c = signSponsor(s, offers[1]);
  assert.equal(c.status, "active");
  validateSave(s);
});

test("AI-to-AI moves preserve rosters and balance budgets inside windows", () => {
  // Minimal world: full saves cannot time-travel (cup fixtures pin the date).
  const players = [];
  for (const club of ["clubA", "clubB", "clubC"])
    for (let i = 0; i < 25; i++)
      players.push({
        id: `${club}-p${i}`,
        name: `${club} player ${i}`,
        clubId: club,
        status: "active",
        loan: null,
        age: 24 + (i % 6),
        rating: 66 + (i % 9),
        value: 4000000,
        careerHistory: [],
      });
  const s = {
    seed: 7,
    date: "2026-09-10",
    clubId: "userclub",
    press: { news: [] },
    management: { marketMode: "windows" },
    expansion: {
      divisions: [{ clubs: ["clubA", "clubB", "clubC"] }],
      budgets: { clubA: 50000000, clubB: 50000000, clubC: 50000000 },
    },
    players,
  };
  assert(marketOpen(s));
  const beforeBudgets = 150000000;
  const clubsBefore = new Map(s.players.map((p) => [p.id, p.clubId]));
  const moves = aiTransferDay(s);
  assert(moves >= 0 && moves <= 3);
  assert.equal(s.players.length, 75);
  assert.equal(
    Object.values(s.expansion.budgets).reduce((a, b) => a + b, 0),
    beforeBudgets,
  );
  const moved = s.players.filter((p) => clubsBefore.get(p.id) !== p.clubId);
  assert.equal(moved.length, moves);
  for (const p of moved) {
    assert(["clubA", "clubB", "clubC"].includes(p.clubId));
    assert.equal(p.careerHistory.at(-1).type, "transfer-ai");
  }
  assert(s.press.news.length <= 60);
  s.date = "2026-10-10";
  assert(!marketOpen(s));
  assert.equal(aiTransferDay(s), 0);
  s.date = "2026-09-11";
  assert.equal(aiTransferDay(s), 0);
});

test("window status explains open, closed, and legacy saves", () => {
  const s = game();
  assert.equal(windowStatus(s, "2026-08-01").open, true);
  const closed = windowStatus(s, "2026-10-05");
  assert.equal(closed.open, false);
  assert.equal(closed.next, "2027-01-01");
  s.management.marketMode = "legacy";
  assert.equal(windowStatus(s, "2026-10-05").open, true);
});

test("seat categories price separately and subscribers are never double-billed", () => {
  const s = game();
  sellSubscriptions(s);
  const subs = s.commerce.seasonTickets;
  assert(subs > 0);
  setCategoryPrices(s, { first: 300, vip: 900 });
  assert.deepEqual(categoryPrices(s), {
    standard: s.ticketPrice,
    first: 300,
    vip: 900,
  });
  const f = ticketForecast(s);
  assert.equal(f.breakdown.length, 3);
  assert.equal(
    f.breakdown.reduce((a, b) => a + b.paying, 0),
    f.paying,
  );
  assert.equal(
    f.breakdown.reduce((a, b) => a + b.gross, 0),
    f.gross,
  );
  assert.equal(f.attendance, Math.min(s.capacity, f.paying + subs));
  assert.throws(() => setCategoryPrices(s, { first: 10, vip: 900 }));
  assert.throws(() => setCategoryPrices(s, { first: 900, vip: 300 }));
  assert.throws(() => setCategoryPrices(s, { first: 40, vip: 40 }));
  validateSave(s);
});

test("match premium lifts one home gate and is consumed by it", () => {
  const s = game();
  setMatchPremium(s, 50);
  const boosted = ticketForecast(s);
  assert.equal(boosted.premium, 50);
  setMatchPremium(s, 0);
  const plain = ticketForecast(s);
  assert(boosted.gross > plain.gross);
  setMatchPremium(s, 100);
  const before = s.finance.cash;
  const f = { id: "premium-check", home: s.clubId };
  matchCommerce(s, f);
  assert.equal(s.commerce.matchPremium, 0);
  assert(f.ticketBreakdown.length === 3);
  assert(s.finance.cash - before > plain.gross - plain.attendance * 18);
  assert.throws(() => setMatchPremium(s, 30));
  validateSave(s);
});

test("coach market holds eight profiles with dated multi-year contracts", () => {
  const s = game();
  post(s, 10000000, "test-grant", "منحة اختبار", "test-grant-coach");
  assert.equal(COACHES.length, 8);
  assert.equal(new Set(COACHES.map((c) => c.id)).size, 8);
  const wage = s.management.coach.salary;
  const before = s.finance.cash;
  dismissCoach(s);
  assert.equal(s.finance.cash, before - wage * 2);
  appointCoach(s, "winner", 3);
  assert.equal(s.management.coach.contractYears, 3);
  assert(coachYearsLeft(s) === 3);
  const salary = s.management.coach.salary;
  const cash = s.finance.cash;
  dismissCoach(s);
  assert.equal(s.finance.cash, cash - salary * 2 * 3);
  assert.equal(s.management.coach, null);
  assert.throws(() => appointCoach(s, "winner", 5));
  validateSave(s);
});

test("coach renewal extends tenure and expiry vacates the job", () => {
  const s = game();
  post(s, 10000000, "test-grant", "منحة اختبار", "test-grant-renew");
  dismissCoach(s);
  appointCoach(s, "youth", 1);
  const first = s.management.coach.contractEnd;
  const cash = s.finance.cash;
  renewCoach(s, 2);
  assert(s.management.coach.contractEnd > first);
  assert.equal(s.finance.cash, cash - s.management.coach.salary);
  s.management.coach.contractEnd = "2026-01-01";
  managementDay(s);
  assert.equal(s.management.coach, null);
  assert(
    s.inbox.some((m) => m.title.startsWith("انتهى عقد المدرب")),
  );
  validateSave(s);
});

test("v15 save migrates to 16 with economy defaults and history intact", () => {
  const s = game();
  assert.equal(s.version, 22);
  const v15 = structuredClone(s);
  v15.version = 15;
  delete v15.migrationNote;
  const m = migrateSave(v15);
  assert.equal(m.version, 22);
  assert.equal(v15.version, 15);
  assert(m.migrationNote.includes("0.16"));
  assert.deepEqual(m.sponsorDeals, []);
  assert.deepEqual(m.commerce.ticketPrices, {
    first: Math.round(m.ticketPrice * 2),
    vip: Math.round(m.ticketPrice * 5),
  });
  assert.equal(m.commerce.matchPremium, 0);
  assert.equal(m.management.coach.contractYears, 1);
  assert(m.management.coach.contractEnd > m.date);
  assert.deepEqual(
    m.players.map((p) => [p.id, p.clubId]),
    s.players.map((p) => [p.id, p.clubId]),
  );
  assert.equal(m.finance.cash, s.finance.cash);
  assert.deepEqual(SPONSOR_RAISES, [10, 20, 30]);
  validateSave(m);
});
