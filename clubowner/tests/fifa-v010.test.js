import {matchDay} from "../src/services/matches.js";
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { validateFifaCup } from "../src/core/fifaValidation.js";
import {
  createWorldCup,
  fifaDay,
  conductPenalty,
} from "../src/services/fifa/engine.js";
import {
  worldAccess,
  region,
  association,
  recordFifaSeason,
  nextWorldYear,
} from "../src/services/fifa/access.js";
import { worldDraw } from "../src/services/fifa/draw.js";
import { groupTable } from "../src/services/competitions/table.js";
import {
  OFC_ENTRANTS,
  OFC_AUCKLAND,
  FIFA_GUESTS,
} from "../src/data/fifaGuests.js";
import { DIVISIONS, EXPANDED_CLUBS } from "../src/data/expandedCatalog.js";
import {
  allFixtures,
  rebalanceLeagueCalendar,
  restGap,
} from "../src/services/calendar.js";
const game = () =>
  createGame({
    database: "world",
    expanded: true,
    leagues: ["eg"],
    difficulty: "easy",
  });
const sim = (s, f, cb) => {
  f.homeGoals = 1;
  f.awayGoals = 1;
  cb();
  f.played = true;
};
const finish = (s, c, limit = 100) => {
  for (let n = 0; n < limit && !c.winner; n++) {
    const next = c.fixtures
      .filter((f) => !f.played)
      .map((f) => f.date)
      .sort()[0];
    if (next) s.date = next;
    fifaDay(s, c, sim);
    validateFifaCup(c, s);
  }
  assert(c.winner);
};
test("FIFA separation, next real-cycle year, seven real OFC entrants with no new playable tiers or duplicate Auckland", () => {
  const s = game();
  validateSave(s);
  assert.equal(s.expansion.fifa.nextWorldYear, 2029);
  assert(!s.expansion.cups.some((c) => c.kind === "clubworld"));
  const ofc = s.expansion.cups.find((c) => c.kind === "ofc"),
    ic = s.expansion.cups.find((c) => c.kind === "intercontinental");
  assert.equal(ic.phase, "waiting");
  assert.equal(ic.entrants.length, 0);
  assert.equal(ofc.fixtures.length, 21);
  assert.equal(OFC_ENTRANTS.length, 7);
  assert.equal(DIVISIONS.length, 116);
  assert(!FIFA_GUESTS.some((g) => EXPANDED_CLUBS.some((c) => c.id === g.id)));
  assert.equal(association(OFC_AUCKLAND), "nz");
  assert.equal(region(OFC_AUCKLAND), "ofc");
  assert(
    !s.expansion.cups
      .find((c) => c.id.startsWith("afc-s"))
      .entrants.includes(OFC_AUCKLAND),
  );
  assert.equal(
    s.expansion.cups.find((c) => c.id.startsWith("afc-s")).entrants.length,
    36,
  );
  assert.equal(nextWorldYear("2029-09-24"), 2033);
  assert.equal(nextWorldYear("2028-09-24"), 2029);
});
test("OFC path has six opponents per club, a decided neutral final and a real champion", () => {
  const s = game(),
    c = s.expansion.cups.find((c) => c.kind === "ofc");
  for (const id of c.entrants)
    assert.equal(
      c.fixtures.filter((f) => [f.home, f.away].includes(id)).length,
      6,
    );
  finish(s, c);
  assert.equal(c.fixtures.length, 22);
  assert(OFC_ENTRANTS.includes(c.winner));
  assert.equal(s.expansion.champions.ofc, c.winner);
});
test("CWC access has 32 distinct entries, all six confederations and a separate modeled host", () => {
  const s = game(),
    a = worldAccess(s, 2029);
  assert.equal(a.qualification.length, 32);
  assert.equal(new Set(a.qualification.map((q) => q.clubId)).size, 32);
  assert.equal(
    a.qualification.filter((q) => q.reason === "scenario-host").length,
    1,
  );
  for (const [r, n] of Object.entries({
    uefa: 12,
    conmebol: 6,
    caf: 4,
    afc: 4,
    concacaf: 4,
    ofc: 1,
  }))
    assert.equal(
      a.qualification.filter(
        (q) => q.region === r && q.reason !== "scenario-host",
      ).length,
      n,
    );
  assert(
    a.qualification
      .filter((q) => q.reason !== "scenario-host")
      .every((q) => q.reason === "scenario-fill"),
  );
  assert.deepEqual(a.cycleYears, []);
  for (const country of new Set(a.qualification.map((q) => q.country)))
    assert(
      a.qualification.filter(
        (q) => q.country === country && q.reason !== "scenario-host",
      ).length <= 2,
    );
});
test("CWC honors saved titles, excludes secondary-cup winners, limits the four-year window and retains titleholder country exceptions", () => {
  const s = game(),
    eng = s.expansion.divisions
      .find((d) => d.country === "en" && d.tier === 1)
      .clubs.slice(0, 3);
  s.expansion.fifa.history = eng.map((id, i) => ({
    season: i + 1,
    year: 2026 + i,
    source: "saved-competition-results",
    regions: {
      uefa: { champion: id, scores: [{ clubId: id, points: 10 + i }] },
    },
  }));
  const a = worldAccess(s, 2029);
  for (const id of eng)
    assert.equal(
      a.qualification.find((q) => q.clubId === id).reason,
      "continental-champion",
    );
  assert.equal(
    a.qualification.filter(
      (q) => q.country === "en" && q.reason !== "continental-champion",
    ).length,
    0,
  );
  s.expansion.fifa.history[0].year = 2024;
  assert(
    !worldAccess(s, 2029)
      .qualification.find((q) => q.clubId === eng[0])
      ?.titleYears.includes(2024),
  );
  const fresh = game(),
    secondary = fresh.expansion.cups.find((c) => c.kind === "confed");
  secondary.winner = secondary.entrants[0];
  recordFifaSeason(fresh);
  assert(!fresh.expansion.fifa.history[0].regions.caf);
});
test("CWC draw has four pots, no duplicate country, 1–2 UEFA teams and at most one other region per group, across seeds", () => {
  const s = game(),
    q = worldAccess(s, 2029).qualification;
  for (let seed = 1; seed <= 30; seed++) {
    const d = worldDraw({ seed }, q);
    assert.equal(d.pots.length, 4);
    for (const g of d.groups) {
      assert.equal(g.clubs.length, 4);
      assert.equal(new Set(g.clubs.map(association)).size, 4);
      assert(
        [1, 2].includes(g.clubs.filter((id) => region(id) === "uefa").length),
      );
      for (const r of ["caf", "afc", "ofc", "conmebol", "concacaf"])
        assert(g.clubs.filter((id) => region(id) === r).length <= 1);
    }
  }
});
test("CWC plays 48 group games and 15 single neutral knockouts, no third place, deterministic persisted resume", () => {
  const s = game(),
    c = createWorldCup(s, 2029);
  assert.equal(c.fixtures.length, 48);
  for (const id of c.entrants)
    assert.equal(
      c.fixtures.filter((f) => [f.home, f.away].includes(id)).length,
      3,
    );
  while (c.phase === "groups") {
    s.date = c.fixtures
      .filter((f) => !f.played)
      .map((f) => f.date)
      .sort()[0];
    fifaDay(s, c, sim);
    validateFifaCup(c, s);
  }
  const copy = JSON.parse(JSON.stringify(s)),
    cc = copy.expansion.cups.find((k) => k.kind === "clubworld");
  finish(s, c);
  finish(copy, cc);
  assert.deepEqual(c, cc);
  assert.equal(s.seed, copy.seed);
  assert.equal(c.fixtures.length, 63);
  assert.equal(c.ties.length, 15);
  assert(c.fixtures.every((f) => f.neutral));
  assert.equal(s.expansion.fifa.nextWorldYear, 2033);
  for (const g of c.groups) {
    const ranks = c.groupRanking[c.groups.indexOf(g)];
    const ts = c.ties.filter((t) => t.stage === "r16");
    const i = ts.findIndex((t) => [t.a, t.b].includes(ranks[0])),
      j = ts.findIndex((t) => [t.a, t.b].includes(ranks[1]));
    assert.notEqual(i < 4, j < 4);
  }
  const frozen = JSON.stringify(s);
  fifaDay(s, c, sim);
  assert.equal(JSON.stringify(s), frozen);
});
test("FIFA fair-play weights and subset head-to-head, not CONMEBOL red-card ordering", () => {
  assert.equal(
    conductPenalty({
      yellow: 1,
      indirectRed: 1,
      directRed: 1,
      yellowDirectRed: 1,
    }),
    13,
  );
  const c = {
      tableRule: "fifa",
      lots: { a: 0, b: 1, c: 2, d: 3 },
      fixtures: [],
    },
    g = { id: "A", clubs: ["a", "b", "c", "d"] };
  for (const [home, away, homeGoals, awayGoals] of [
    ["a", "b", 2, 0],
    ["b", "a", 1, 0],
    ["a", "c", 2, 1],
    ["c", "a", 3, 1],
    ["b", "c", 3, 1],
    ["c", "b", 2, 1],
    ["a", "d", 1, 0],
    ["d", "a", 0, 1],
    ["b", "d", 9, 0],
    ["d", "b", 0, 9],
    ["c", "d", 1, 0],
    ["d", "c", 0, 1],
  ])
    c.fixtures.push({
      stage: "groups",
      group: "A",
      played: true,
      home,
      away,
      homeGoals,
      awayGoals,
    });
  assert.deepEqual(
    groupTable(c, g).map((r) => r.clubId),
    ["c", "a", "b", "d"],
  );
});
test("Intercontinental waits for all six current champions then plays correct five-game route with UEFA only in final", () => {
  for (const year of [2027, 2028]) {
    const s = game(),
      c = s.expansion.cups.find((c) => c.kind === "intercontinental");
    c.editionYear = year;
    fifaDay(s, c, sim);
    assert.equal(c.phase, "waiting");
    for (const id of ["ucl", "caf", "afc", "lib", "concacaf", "ofc"]) {
      const src = s.expansion.cups.find(
        (k) => k.kind === id || k.id === id + "-s1",
      );
      src.winner = src.entrants[0];
    }
    fifaDay(s, c, sim);
    assert.equal(c.entrants.length, 6);
    assert.equal(c.firstRegion, year % 2 === 0 ? "afc" : "caf");
    assert(!c.fixtures.some((f) => [f.home, f.away].includes(c.holders.uefa)));
    finish(s, c);
    assert.equal(c.fixtures.length, 5);
    assert.equal(
      c.fixtures.filter((f) => [f.home, f.away].includes(c.holders.uefa))
        .length,
      1,
    );
    assert.equal(c.fixtures.at(-1).home, c.holders.uefa);
    assert.equal(Object.keys(c.trophies).length, 3);
    assert(
      c.fixtures.filter((f) => f.stage !== "groups").every((f) => f.extraTime),
    );
  }
});
test("FIFA fixtures participate in shared rest calendar; corrupt regions, group results and seeds are rejected", () => {
  const s = game(),
    c = createWorldCup(s, 2029);
  rebalanceLeagueCalendar(s);
  validateSave(s);
  const byClub = new Map();
  for (const f of allFixtures(s))
    for (const id of [f.home, f.away]) {
      if (!byClub.has(id)) byClub.set(id, []);
      byClub.get(id).push(f);
    }
  for (const fs of byClub.values()) {
    fs.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < fs.length; i++)
      assert(restGap(fs[i - 1].date, fs[i].date) >= 3);
  }
  for (const mutate of [
    (c) => (c.qualification[0].region = "ofc"),
    (c) => c.fixtures.pop(),
    (c) => (c.pots[0][0] = c.pots[1][0]),
    (c) => (c.lots[c.entrants[0]] = 999),
  ]) {
    const copy = structuredClone(s);
    mutate(copy.expansion.cups.find((k) => k.kind === "clubworld"));
    assert.throws(() => validateSave(copy));
  }
});

test('neutral World Cup games grant no home stadium receipts and a repeated processing call cannot pay twice',()=>{
 const s=game(),c=createWorldCup(s,2029),f=c.fixtures.find(f=>f.home===s.clubId||f.away===s.clubId);assert(f);s.date=f.date;
 const simulate=(s,f,cb)=>matchDay(s,[f],[f.home,f.away].map(clubId=>({clubId,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0})),{afterScore:cb});
 fifaDay(s,c,simulate);assert(f.played&&f.neutral);assert.equal(f.attendance,undefined);assert(!s.finance.ledger.some(e=>e.key===f.id+'-tickets'));const before=JSON.stringify(s);fifaDay(s,c,simulate);assert.equal(JSON.stringify(s),before);
});
