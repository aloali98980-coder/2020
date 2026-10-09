import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { cupFixtures } from "../src/services/calendar.js";
import {
  EUROPE_PRIZE_FACTOR,
  EUROPE_KO_PRIZE,
  europePrize,
  europeTiePrize,
} from "../src/services/europe/engine.js";
import {
  CONTINENTAL_PRIZE_FACTOR,
  continentalPrize,
  continentalRoundPrize,
} from "../src/services/competitions/engine.js";
import { ASIA_PRIZE_FACTOR, asiaPrize } from "../src/services/asia/engine.js";
import {
  CONCACAF_PRIZE_FACTOR,
  concacafPrize,
} from "../src/services/concacaf/engine.js";
import {
  FIFA_PRIZE_FACTOR,
  fifaPrize,
  fifaWinPrize,
} from "../src/services/fifa/engine.js";
import { policy } from "../src/services/competitions/presets.js";

const game = () =>
  createGame({
    database: "world",
    expanded: true,
    leagues: ["eg"],
    difficulty: "easy",
  });

test("calendar review: concacaf fixtures participate in rest padding", () => {
  const fx = [
    { id: "cc-x", date: "2026-09-01", home: "a", away: "b", played: false },
  ];
  for (const engine of [
    "europe-v1",
    "continental-v1",
    "fifa-v1",
    "asia-v1",
    "concacaf-v1",
  ])
    assert.deepEqual(
      cupFixtures({ engine, fixtures: fx, results: [], pendingMatches: [] }),
      fx,
      engine,
    );
  // Legacy cups still expose results + pending matches.
  assert.deepEqual(
    cupFixtures({
      engine: undefined,
      fixtures: fx,
      results: [{ id: "r" }],
      pendingMatches: [{ id: "p" }],
    }),
    [{ id: "r" }, { id: "p" }],
  );
});

test("prize review: every engine tiers payouts by competition kind", () => {
  // Europe: UCL keeps the base table, UEL/UECL pay modeled fractions.
  assert.deepEqual(EUROPE_PRIZE_FACTOR, { ucl: 1, uel: 0.5, uecl: 0.25 });
  assert.equal(europePrize("ucl", 600000), 600000);
  assert.equal(europeTiePrize("uel", "r16"), 800000);
  assert.equal(europeTiePrize("uecl", "final"), 1375000);
  // KO table rises toward the final in every tier.
  for (const kind of Object.keys(EUROPE_PRIZE_FACTOR)) {
    const order = ["playoff", "r16", "qf", "sf", "final"].map((st) =>
      europeTiePrize(kind, st),
    );
    assert.deepEqual(
      [...order].sort((a, b) => a - b),
      order,
      kind,
    );
  }
  // Continental: CAF/Libertadores keep the base table.
  assert.equal(continentalPrize("caf", 400000), 400000);
  assert.equal(continentalPrize("lib", 3500000), 3500000);
  assert.equal(continentalPrize("confed", 400000), 240000);
  assert.equal(continentalPrize("suda", 3500000), 2100000);
  assert.equal(continentalPrize("domestic", 400000), 160000);
  assert.equal(continentalPrize("domestic", 3500000), 1400000);
  assert.equal(continentalPrize("super-domestic", 3500000), 875000);
  // Asia / CONCACAF keep their established factors.
  assert.deepEqual(ASIA_PRIZE_FACTOR, {
    afc: 3,
    "afc-two": 1.5,
    "afc-challenge": 0.5,
  });
  assert.equal(asiaPrize("afc", 500000), 1500000);
  assert.deepEqual(CONCACAF_PRIZE_FACTOR, {
    concacaf: 2,
    "leagues-cup": 1,
    "central-american": 0.4,
    caribbean: 0.4,
  });
  assert.equal(concacafPrize("concacaf", 400000), 800000);
  // FIFA: CWC keeps the base table, Intercontinental pays a fraction.
  assert.deepEqual(FIFA_PRIZE_FACTOR, {
    clubworld: 1,
    intercontinental: 0.6,
    ofc: 1,
  });
  assert.equal(fifaWinPrize("clubworld", "final"), 5000000);
  assert.equal(fifaWinPrize("intercontinental", "final"), 3000000);
  assert.equal(fifaWinPrize("intercontinental", "sf"), 600000);
  assert.equal(fifaWinPrize("ofc", "final"), 200000);
  assert.equal(fifaPrize("clubworld", 1000000), 1000000);
});

test("prize review: no round-win prize can exceed its own final", () => {
  for (const kind of Object.keys(CONTINENTAL_PRIZE_FACTOR)) {
    const final = continentalPrize(kind, 3500000);
    for (let round = 1; round <= 9; round++)
      assert(
        continentalRoundPrize(kind, round) <= final,
        `${kind} round ${round}`,
      );
  }
  // Deep domestic cups were the inversion case: round 7 used to pay 4.2M.
  assert.equal(continentalRoundPrize("domestic", 7), 1200000);
  assert(
    continentalRoundPrize("domestic", 7) <=
      continentalPrize("domestic", 3500000),
  );
});

test("prize review: fifa stays single-leg so per-fixture equals per-tie", () => {
  for (const kind of ["clubworld", "intercontinental", "ofc"]) {
    const p = policy({ engine: "fifa-v1", kind });
    assert.equal(p.legs, 1, kind);
    assert.equal(p.finalLegs, 1, kind);
  }
  assert.equal(EUROPE_KO_PRIZE.final, 5500000);
});

test("qualification review: disjoint continental lists, documented overlaps", () => {
  const s = game();
  assert.equal(s.version, 23);
  const cups = s.expansion.cups;
  const ids = (kind) =>
    new Set(cups.find((c) => c.kind === kind)?.entrants || []);
  const inter = (a, b) => [...a].filter((x) => b.has(x));
  const disjoint = (a, b) =>
    assert.deepEqual(inter(ids(a), ids(b)), [], `${a} vs ${b}`);
  // Same-region primary/secondary never share a club.
  disjoint("ucl", "uel");
  disjoint("ucl", "uecl");
  disjoint("uel", "uecl");
  disjoint("caf", "confed");
  disjoint("lib", "suda");
  disjoint("afc", "afc-two");
  disjoint("afc", "afc-challenge");
  disjoint("afc-two", "afc-challenge");
  // Champions Cup: 27 distinct entrants, all CONCACAF region.
  const cc = cups.find((c) => c.kind === "concacaf");
  assert.equal(cc.entrants.length, 27);
  assert.equal(new Set(cc.entrants).size, 27);
  // Regional cups are disjoint guest pools.
  disjoint("central-american", "caribbean");
  // Documented overlap: Leagues Cup fields MLS+Liga MX clubs that also
  // qualify for the Champions Cup, like the real competition.
  assert(inter(ids("leagues-cup"), ids("concacaf")).length > 0);
});

test("v13 save migrates to 16 with identities and squads intact", () => {
  const s = game();
  const v13 = structuredClone(s);
  v13.version = 13;
  delete v13.migrationNote;
  const m = migrateSave(v13);
  assert.equal(m.version, 23);
  assert.equal(v13.version, 13);
  assert(m.migrationNote.includes("0.14"));
  assert(m.migrationNote.includes("0.15"));
assert(m.migrationNote.includes("0.16"));
  assert.deepEqual(
    m.players.map((p) => [p.id, p.clubId]),
    s.players.map((p) => [p.id, p.clubId]),
  );
  validateSave(m);
});
