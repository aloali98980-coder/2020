// 0.24 — match consequences: injuries, card suspensions, red card, form.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { advanceTime } from "../src/services/time.js";
import { pendingActions, resolveInfo } from "../src/services/inbox.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  injuryProbability,
  injuryDuration,
  generateCardDistribution,
  YELLOW_SUSPENSION_THRESHOLD,
  formLabel,
  updateForm,
  applyMatchConsequences,
} from "../src/services/matchConsequences.js";

const dismiss = (s) => pendingActions(s).forEach((m) => resolveInfo(s, m.id));

// ── Injury probability ──────────────────────────────────────────────────────

test("injuryProbability returns higher probability for tired/injured players", () => {
  const fresh = { seasonMinutes: 0, fitness: 100 };
  const tired = { seasonMinutes: 3000, fitness: 50 };
  assert.ok(injuryProbability(tired) > injuryProbability(fresh));
  assert.ok(injuryProbability(fresh) >= 0.005);
  assert.ok(injuryProbability(tired) <= 0.12);
});

test("injuryProbability is bounded between 0.5% and 12%", () => {
  const extreme = { seasonMinutes: 99999, fitness: 10 };
  assert.ok(injuryProbability(extreme) <= 0.12);
  const perfect = { seasonMinutes: 0, fitness: 100 };
  assert.ok(injuryProbability(perfect) >= 0.005);
});

// ── Injury duration ─────────────────────────────────────────────────────────

test("injuryDuration returns values between 2 and 90 days", () => {
  // Use a seeded sequence to test all bands.
  let seed = 42;
  const rng = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 200; i++) {
    const d = injuryDuration(rng);
    assert.ok(d >= 2, `duration ${d} should be >= 2`);
    assert.ok(d <= 90, `duration ${d} should be <= 90`);
  }
});

// ── Card distribution ───────────────────────────────────────────────────────

test("generateCardDistribution is deterministic for the same RNG seed", () => {
  const makeRng = () => {
    let s = 12345;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };
  };
  const xi = Array.from({ length: 11 }, (_, i) => ({ id: `p${i}` }));
  const d1 = generateCardDistribution(xi, makeRng());
  const d2 = generateCardDistribution(xi, makeRng());
  assert.deepEqual(
    d1.yellows.map((p) => p.id),
    d2.yellows.map((p) => p.id),
  );
  assert.deepEqual(
    d1.reds.map((p) => p.id),
    d2.reds.map((p) => p.id),
  );
});

test("generateCardDistribution returns arrays of player objects", () => {
  // Try multiple seeds to find one that generates at least one card.
  let found = false;
  for (let seed = 100; seed < 200; seed++) {
    let s = seed;
    const rng = () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };
    const xi = Array.from({ length: 11 }, (_, i) => ({ id: `p${i}` }));
    const d = generateCardDistribution(xi, rng);
    assert.ok(Array.isArray(d.yellows));
    assert.ok(Array.isArray(d.reds));
    if (d.yellows.length + d.reds.length > 0) { found = true; break; }
  }
  assert.ok(found, "should generate at least one card for some seed");
});

// ── Form ────────────────────────────────────────────────────────────────────

test("formLabel maps form values correctly", () => {
  assert.equal(formLabel(2), "متوهج");
  assert.equal(formLabel(1.5), "متوهج");
  assert.equal(formLabel(0), "عادي");
  assert.equal(formLabel(1), "عادي");
  assert.equal(formLabel(-2), "بارد");
  assert.equal(formLabel(-1.5), "بارد");
});

test("updateForm tracks last 5 ratings and computes form", () => {
  const p = { form: 0, formRatings: [] };
  // Five high ratings should make the player "hot".
  for (let i = 0; i < 5; i++) updateForm(p, 8.0);
  assert.ok(p.form >= 1.5, `form should be hot, got ${p.form}`);
  assert.equal(p.formRatings.length, 5);

  // Five low ratings should make the player "cold".
  const q = { form: 0, formRatings: [] };
  for (let i = 0; i < 5; i++) updateForm(q, 4.0);
  assert.ok(q.form <= -1.5, `form should be cold, got ${q.form}`);
});

test("updateForm keeps only the last 5 ratings", () => {
  const p = { form: 0, formRatings: [] };
  for (let i = 0; i < 10; i++) updateForm(p, 7.0);
  assert.equal(p.formRatings.length, 5);
});

// ── Migration v19 → v20 ─────────────────────────────────────────────────────

test("v18→v20 migration initializes match consequence fields", () => {
  // migrateSave chains: v18 → v19 → v20.
  const v18 = {
    version: 18,
    players: [
      {
        id: "p1", name: "test", nationality: "eg", clubId: "ahly",
        salary: 100, value: 500, age: 25, contractEnd: "2027-06-30",
        position: "ST", role: "أساسي", foot: "يمنى", rating: 70,
        potential: 80, fitness: 85, morale: 70, appearances: 0, goals: 0,
        attributes: { pace: 70, passing: 65, shooting: 75, defending: 40, stamina: 80, decisions: 68 },
        status: "active", ageReference: 25, ageReferenceDate: "2026-07-01",
        naturalFitness: 75, careerHistory: [],
        contractTerms: { appearanceBonus: 0, goalBonus: 0, annualRaisePct: 0, releaseClause: 0, signedOn: "2026-07-01" },
      },
    ],
    retired: [],
  };
  const migrated = migrateSave(v18);
  assert.equal(migrated.version, 22);
  const p = migrated.players[0];
  // v19 fields
  assert.equal(p.seasonGoals, 0);
  assert.equal(p.seasonMinutes, 0);
  // v20 fields
  assert.equal(p.form, 0);
  assert.equal(p.suspendedUntil, null);
  assert.equal(p.yellowCardSuspensions, 0);
  assert.equal(p.seasonYellowByComp, 0);
  assert.deepEqual(p.formRatings, []);
  assert.ok(migrated.migrationNote.includes("عواقب الملعب 0.24"));
});

// ── applyMatchConsequences integration ──────────────────────────────────────

test("applyMatchConsequences applies yellow card accumulation and suspension", () => {
  const p1 = {
    id: "p1", name: "Test", status: "active", rating: 70, fitness: 80,
    seasonMinutes: 500, form: 0, formRatings: [], seasonYellow: 0, seasonRed: 0,
    seasonYellowByComp: YELLOW_SUSPENSION_THRESHOLD - 1,
    suspendedUntil: null, yellowCardSuspensions: 0,
  };
  const s = {
    clubId: "ahly",
    date: "2026-08-01",
    players: [p1],
    inbox: [],
    seed: 12345,
    nextId: 100,
  };
  const f = {
    home: "ahly", away: "zamalek",
    homeGoals: 2, awayGoals: 1,
    lineup: [{ playerId: "p1", slot: "ST" }],
  };
  let seed = 777;
  const rng = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  };
  const cards = { yellows: [p1], reds: [] };
  const result = applyMatchConsequences(s, f, cards, rng);
  // Yellow card pushes player past threshold → suspension.
  assert.equal(p1.seasonYellowByComp, 0, "yellow count should reset after suspension");
  assert.ok(p1.suspendedUntil !== null, "should be suspended");
  assert.equal(p1.yellowCardSuspensions, 1, "should have 1 suspension");
  assert.ok(s.inbox.some((m) => m.title.includes("إنذارات")), "should send suspension message");
});

test("applyMatchConsequences applies red card suspension", () => {
  const p1 = {
    id: "p1", name: "Test", status: "active", rating: 70, fitness: 80,
    seasonMinutes: 0, form: 0, formRatings: [],
    seasonYellowByComp: 0, suspendedUntil: null, yellowCardSuspensions: 0,
  };
  const s = {
    clubId: "ahly",
    date: "2026-08-01",
    players: [p1],
    inbox: [],
    seed: 12345,
    nextId: 100,
  };
  const f = {
    home: "ahly", away: "zamalek",
    homeGoals: 2, awayGoals: 1,
    lineup: [{ playerId: "p1", slot: "ST" }],
  };
  let seed = 888;
  const rng = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  };
  const cards = { yellows: [], reds: [p1] };
  const result = applyMatchConsequences(s, f, cards, rng);
  assert.ok(p1.suspendedUntil !== null, "red card should cause suspension");
  assert.equal(result.redCardPenalty, 8, "should return penalty of 8");
  assert.ok(s.inbox.some((m) => m.title.includes("طرد")), "should send red card message");
});

test("applyMatchConsequences updates form for starters", () => {
  const p1 = {
    id: "p1", name: "Test", status: "active", rating: 70, fitness: 80,
    seasonMinutes: 0, form: 0, formRatings: [],
    seasonYellowByComp: 0, suspendedUntil: null, yellowCardSuspensions: 0,
  };
  const s = {
    clubId: "ahly",
    date: "2026-08-01",
    players: [p1],
    inbox: [],
    seed: 12345,
    nextId: 100,
  };
  const f = {
    home: "ahly", away: "zamalek",
    homeGoals: 3, awayGoals: 0,
    lineup: [{ playerId: "p1", slot: "ST" }],
  };
  let seed = 555;
  const rng = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  };
  const cards = { yellows: [], reds: [] };
  applyMatchConsequences(s, f, cards, rng);
  assert.ok(p1.formRatings.length > 0, "form should be updated");
  assert.ok(p1.form !== 0 || p1.formRatings.length > 0, "form value should change");
});

// ── Integration: new game validates with all fields ─────────────────────────

test("new game has all match consequence fields and validates", () => {
  const s = createGame({
    database: "demo",
    clubId: "ahly",
    owner: "اختبار",
    leagues: ["eg", "en", "sa"],
  });
  for (const p of s.players) {
    assert.equal(p.form, 0, `form should be 0 for ${p.id}`);
    assert.equal(p.suspendedUntil, null, `suspendedUntil should be null for ${p.id}`);
    assert.equal(p.yellowCardSuspensions, 0, `yellowCardSuspensions should be 0 for ${p.id}`);
    assert.equal(p.seasonYellowByComp, 0, `seasonYellowByComp should be 0 for ${p.id}`);
    assert.deepEqual(p.formRatings, [], `formRatings should be [] for ${p.id}`);
  }
  validateSave(s);
});
