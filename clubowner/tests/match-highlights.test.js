// 0.24 — match highlights: determinism, consistency with match report, structure.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { advanceTime } from "../src/services/time.js";
import { pendingActions, resolveInfo } from "../src/services/inbox.js";
import { playedOwnFixtures, reportFor, buildMatchReport } from "../src/services/matchReport.js";
import { buildHighlightsData } from "../src/features/matchHighlights.js";

const dismiss = (s) => pendingActions(s).forEach((m) => resolveInfo(s, m.id));
const tick = (s) => { dismiss(s); advanceTime(s, 1); };

// Helper: play until first match
function playToFirstMatch() {
  const s = createGame({ database: "demo", clubId: "ahly", owner: "اختبار", leagues: ["eg", "en", "sa"] });
  for (let i = 0; i < 20; i++) {
    tick(s);
    const played = playedOwnFixtures(s);
    if (played.length) return { s, f: played[played.length - 1] };
  }
  throw new Error("No match played in 20 days");
}

// ── Determinism ─────────────────────────────────────────────────────────────

test("buildHighlightsData is deterministic: same fixture → same steps", () => {
  const { s, f } = playToFirstMatch();
  const r1 = reportFor(s, f);
  const r2 = reportFor(s, f);
  const h1 = buildHighlightsData(s, r1);
  const h2 = buildHighlightsData(s, r2);
  assert.deepEqual(h1.steps, h2.steps, "same fixture should produce identical highlights");
  assert.equal(h1.htIdx, h2.htIdx);
});

test("buildHighlightsData produces consistent output across multiple calls", () => {
  const { s, f } = playToFirstMatch();
  const r = reportFor(s, f);
  const results = [];
  for (let i = 0; i < 5; i++) results.push(buildHighlightsData(s, r));
  for (let i = 1; i < results.length; i++) {
    assert.deepEqual(results[0], results[i], `call ${i} should match call 0`);
  }
});

// ── Consistency with match report ───────────────────────────────────────────

test("highlights goal count matches fixture goals", () => {
  const { s, f } = playToFirstMatch();
  const r = reportFor(s, f);
  const { steps } = buildHighlightsData(s, r);
  const home = f.home === s.clubId;
  const ourGoals = home ? f.homeGoals : f.awayGoals;
  const html = steps.join("");
  // Count our goal cards in the highlights
  const goalMatches = html.match(/hl-goal our/g) || [];
  assert.equal(goalMatches.length, ourGoals, `highlights should have ${ourGoals} own-club goals`);
});

test("highlights final score matches fixture result", () => {
  const { s, f } = playToFirstMatch();
  const r = reportFor(s, f);
  const { steps } = buildHighlightsData(s, r);
  const resultCard = steps[steps.length - 1];
  assert.ok(resultCard.includes("hl-result"), "last card should be the result card");
  assert.ok(resultCard.includes("hl-final-score"), "result card should have score element");
  // Verify the result label matches (win/draw/loss)
  const home = f.home === s.clubId;
  const ours = home ? f.homeGoals : f.awayGoals;
  const theirs = home ? f.awayGoals : f.homeGoals;
  if (ours > theirs) assert.ok(resultCard.includes("hl-win"), "should show win");
  else if (ours === theirs) assert.ok(resultCard.includes("hl-draw"), "should show draw");
  else assert.ok(resultCard.includes("hl-loss"), "should show loss");
});

test("highlights events match matchReport events for own club", () => {
  const { s, f } = playToFirstMatch();
  const r = reportFor(s, f);
  const { steps, htIdx } = buildHighlightsData(s, r);
  const ownEvents = r.events.filter((e) => e.clubId === s.clubId);
  const firstHalf = ownEvents.filter((e) => e.min <= 45);
  const secondHalf = ownEvents.filter((e) => e.min > 45);
  // First half cards (between kickoff and halftime)
  const firstHalfCards = steps.slice(1, htIdx);
  assert.equal(firstHalfCards.length, firstHalf.length, "first half card count should match events");
  // Second half cards (between halftime and result)
  const secondHalfCards = steps.slice(htIdx + 1, steps.length - 1);
  assert.equal(secondHalfCards.length, secondHalf.length, "second half card count should match events");
});

// ── Structure ───────────────────────────────────────────────────────────────

test("buildHighlightsData structure: kickoff first, halftime in middle, result last", () => {
  const { s, f } = playToFirstMatch();
  const r = reportFor(s, f);
  const { steps, htIdx } = buildHighlightsData(s, r);
  assert.ok(steps.length >= 3, "should have at least kickoff + halftime + result");
  assert.ok(steps[0].includes("hl-kickoff"), "first step should be kickoff");
  assert.ok(steps[htIdx].includes("hl-halftime"), "htIdx should point to halftime card");
  assert.ok(steps[steps.length - 1].includes("hl-result"), "last step should be result");
  assert.ok(htIdx > 0 && htIdx < steps.length - 1, "halftime should be between kickoff and result");
});

test("highlights goal events include assister info when available", () => {
  const { s, f } = playToFirstMatch();
  const r = reportFor(s, f);
  const { steps } = buildHighlightsData(s, r);
  const ownGoals = r.events.filter((e) => e.type === "goal" && e.clubId === s.clubId && e.playerId);
  // If there are goals with an assistId, the highlights should show it
  const goalsWithAssist = ownGoals.filter((e) => e.assistId);
  if (goalsWithAssist.length > 0) {
    const html = steps.join("");
    assert.ok(html.includes("أسيست") || html.includes("Assist"), "should show assist info");
  }
});

test("buildHighlightsData with zero goals still has kickoff + halftime + result", () => {
  const s = createGame({ database: "demo", clubId: "ahly", owner: "اختبار", leagues: ["eg", "en", "sa"] });
  // Create a mock report with 0-0
  const r = {
    id: "test-0-0",
    date: "2026-08-01",
    competition: "test",
    stage: "",
    home: "ahly",
    away: "zamalek",
    homeGoals: 0,
    awayGoals: 0,
    neutral: false,
    extraTime: false,
    penaltyWinner: null,
    attendance: null,
    events: [],
    stats: { possession: 50, ourShots: 5, oppShots: 5, ourOn: 2, oppOn: 2, ourCorners: 3, oppCorners: 3, ourFouls: 7, oppFouls: 7 },
    ratings: [],
  };
  const { steps, htIdx } = buildHighlightsData(s, r);
  assert.ok(steps.length === 3, "0-0 should have kickoff + halftime + result");
  assert.ok(steps[0].includes("hl-kickoff"));
  assert.ok(steps[1].includes("hl-halftime"));
  assert.ok(steps[2].includes("hl-result"));
});
