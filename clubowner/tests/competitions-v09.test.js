import { validateCompetition } from "../src/core/competitionValidation.js";
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import {
  competitionDay,
  settleTie,
  createKnockout,
  ENGINE,
} from "../src/services/competitions/engine.js";
import { groupTable } from "../src/services/competitions/table.js";
import { allFixtures, restGap } from "../src/services/calendar.js";
import { extendedClub } from "../src/data/expandedCatalog.js";
import { qualify } from "../src/services/competitions/qualification.js";
import { superCupsDay } from "../src/services/competitions/domestic.js";
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
  cb?.();
  f.played = true;
};
function playNew(s, until = () => false) {
  for (let guard = 0; guard < 500; guard++) {
    const cs = s.expansion.cups.filter((c) => c.engine === ENGINE && !c.winner);
    if (!cs.length || until(s)) return;
    const next = cs
      .flatMap((c) => c.fixtures.filter((f) => !f.played).map((f) => f.date))
      .sort()[0];
    if (!next) throw Error("Blocked progression");
    s.date = next;
    for (const c of cs) competitionDay(s, c, sim);
  }
  throw Error("Unfinished");
}
test("continental sizes, real distinct associations per group, pots, six home/away games and modeled entries", () => {
  const s = game();
  validateSave(s);
  for (const kind of ["caf", "confed", "lib", "suda"]) {
    const c = s.expansion.cups.find((c) => c.kind === kind),
      n = kind === "caf" || kind === "confed" ? 16 : 32;
    assert.equal(c.entrants.length, n);
    assert.equal(c.fixtures.length, n * 3);
    assert.equal(c.pots.length, 4);
    for (const g of c.groups)
      assert.equal(
        new Set(g.clubs.map((id) => extendedClub(id).country)).size,
        4,
      );
    for (const id of c.entrants) {
      assert(extendedClub(id));
      assert.equal(c.fixtures.filter((f) => f.home === id).length, 3);
      assert.equal(c.fixtures.filter((f) => f.away === id).length, 3);
    }
    assert.equal(c.qualificationSource, "scenario-reputation");
  }
  assert(
    !s.expansion.cups
      .find((c) => c.kind === "lib")
      .entrants.some((id) =>
        s.expansion.cups.find((c) => c.kind === "suda").entrants.includes(id),
      ),
  );
});
test("CONMEBOL 2026 ranks head-to-head ahead of overall goal difference, then discipline and saved lots", () => {
  const c = {
      tableRule: "conmebol",
      lots: { a: 0, b: 1, c: 2, d: 3 },
      fixtures: [],
    },
    g = { id: "A", clubs: ["a", "b", "c", "d"] };
  const add = (h, a, x, y, red = 0) =>
    c.fixtures.push({
      stage: "groups",
      group: "A",
      played: true,
      home: h,
      away: a,
      homeGoals: x,
      awayGoals: y,
      homeReds: red,
      awayReds: 0,
      homeYellows: 0,
      awayYellows: 0,
    });
  add("a", "b", 1, 0);
  add("b", "a", 0, 0);
  add("a", "c", 0, 8);
  add("b", "d", 9, 0);
  const rows = groupTable(c, g);
  assert.equal(rows.find((r) => r.clubId === "a").points, 4);
  assert.equal(rows.find((r) => r.clubId === "b").points, 4);
  assert(
    rows.findIndex((r) => r.clubId === "a") <
      rows.findIndex((r) => r.clubId === "b"),
  );
  c.fixtures = [];
  for (const h of g.clubs)
    for (const a of g.clubs) if (h !== a) add(h, a, 0, 0, h === "a" ? 1 : 0);
  assert.equal(groupTable(c, g).at(-1).clubId, "a");
  assert.equal(groupTable(c, g)[0].clubId, "b");
  assert.deepEqual(
    groupTable(c, g),
    groupTable(JSON.parse(JSON.stringify(c)), g),
  );
});
test("CAF aggregate away goals, direct penalties with no score inflation, CONMEBOL no-away-goal policy", () => {
  function tie(kind, first, second) {
    const s = game(),
      c = s.expansion.cups.find((c) => c.kind === kind),
      [a, b] = c.entrants;
    const f1 = {
        id: "leg1",
        home: a,
        away: b,
        homeGoals: first[0],
        awayGoals: first[1],
        played: true,
      },
      f2 = {
        id: "leg2",
        home: b,
        away: a,
        homeGoals: second[0],
        awayGoals: second[1],
        played: false,
      };
    c.fixtures = [f1, f2];
    const t = { a, b, stage: "qf", legs: ["leg1", "leg2"] };
    settleTie(s, c, t, f2);
    return { a, b, f1, f2, t };
  }
  const a = tie("caf", [1, 1], [0, 0]);
  assert.equal(a.t.winner, a.b);
  assert.equal(a.f2.decidedBy, "away-goals");
  assert(!a.f2.extraTime);
  const b = tie("caf", [1, 0], [1, 0]);
  assert(b.f2.penaltyWinner);
  assert(!b.f2.extraTime);
  assert.deepEqual([b.f2.homeGoals, b.f2.awayGoals], [1, 0]);
  const c = tie("lib", [1, 1], [0, 0]);
  assert(c.f2.penaltyWinner);
  assert(!c.f2.extraTime);
  assert.deepEqual([c.f2.homeGoals, c.f2.awayGoals], [0, 0]);
});
test("full tournaments complete, Sudamericana transfer paths, return hosting, match counts, persisted resume and one-time prizes", () => {
  const check = (s) => {
    for (const c of s.expansion.cups.filter((c) => c.engine === ENGINE))
      validateCompetition(c, s);
    return s;
  };
  let s = game();
  playNew(
    s,
    (s) =>
      s.expansion.cups.find((c) => c.kind === "suda").imports?.length === 8,
  );
  check(s);
  let lib = s.expansion.cups.find((c) => c.kind === "lib"),
    suda = s.expansion.cups.find((c) => c.kind === "suda");
  assert.deepEqual([...suda.imports].sort(), [...lib.thirds].sort());
  assert.equal(suda.entrants.length, 40);
  for (const t of suda.ties.filter((t) => t.stage === "playoff"))
    assert(
      suda.runners.includes(suda.fixtures.find((f) => f.id === t.legs[1]).home),
    );
  const frozen = JSON.stringify(s),
    other = check(JSON.parse(frozen));
  playNew(s);
  playNew(other);
  assert.deepEqual(s.expansion.cups, other.expansion.cups);
  assert.equal(s.seed, other.seed);
  for (const [kind, count] of [
    ["caf", 62],
    ["confed", 62],
    ["lib", 125],
    ["suda", 141],
  ]) {
    const c = s.expansion.cups.find((c) => c.kind === kind);
    assert(c.winner);
    assert.equal(c.fixtures.length, count);
    assert(c.fixtures.every((f) => f.played));
  }
  check(s);
  const before = JSON.stringify(s);
  for (const c of s.expansion.cups.filter((c) => c.engine === ENGINE))
    competitionDay(s, c, sim);
  assert.equal(JSON.stringify(s), before);
  superCupsDay(s);
  const recopa = s.expansion.cups.find((c) => c.kind === "recopa");
  assert.equal(recopa.fixtures[1].home, lib.winner);
  assert.equal(
    s.expansion.cups.filter((c) => c.kind === "super-caf").length,
    1,
  );
  superCupsDay(s);
  assert.equal(s.expansion.cups.filter((c) => c.kind === "recopa").length, 1);
});
test("fifty domestic cups exclude reserves; modeled supercup sizes, deduplication, neutral sites and semi-finals", () => {
  const s = game();
  const countries = s.expansion.cups
    .filter((c) => c.kind === "domestic")
    .map((c) => c.country);
  assert.equal(countries.length, 50);
  for (const c of s.expansion.cups.filter((c) => c.kind === "domestic"))
    assert(c.entrants.every((id) => !extendedClub(id).reserve));
  for (const country of countries) {
    const d = s.expansion.divisions.find(
      (d) => d.country === country && d.tier === 1,
    );
    for (const f of d.fixtures) f.played = true;
    const cup = s.expansion.cups.find(
      (c) => c.kind === "domestic" && c.country === country,
    );
    cup.winner = d.table[0].clubId;
    cup.finalists = [cup.winner, d.table[1].clubId];
  }
  superCupsDay(s);
  for (const country of countries) {
    const c = s.expansion.cups.find(
      (c) => c.kind === "super-domestic" && c.country === country,
    );
    assert.equal(
      c.entrants.length,
      ["eg", "es", "it", "sa"].includes(country) ? 4 : 2,
    );
    assert.equal(new Set(c.entrants).size, c.entrants.length);
    assert(c.fixtures.every((f) => f.neutral));
  }
  for (const country of ["es", "it", "en"]) {
    const ids = s.expansion.divisions
      .find((d) => d.country === country && d.tier === 1)
      .clubs.slice(0, 4);
    const c = createKnockout(s, {
      id: "test-" + country,
      country,
      name: "Test",
      entrants: ids,
    });
    assert.equal(c.fixtures.length, country === "en" ? 2 : 4);
    if (country === "en") assert(c.fixtures.every((f) => f.neutral));
  }
});
test("qualification reads stored league ranks, prioritizes eligible cup winner, and never duplicates primary entrants", () => {
  const s = game(),
    d = s.expansion.divisions.find((d) => d.country === "eg" && d.tier === 1);
  s.expansion.qualification.eg = [...d.clubs].reverse();
  const primary = qualify(s, "caf");
  assert.deepEqual(
    primary.filter((q) => q.country === "eg").map((q) => q.clubId),
    [...d.clubs].reverse().slice(0, 4),
  );
  s.expansion.domesticHonours.eg = { winner: d.clubs[0], season: 1 };
  const secondary = qualify(
    s,
    "confed",
    primary.map((q) => q.clubId),
  );
  assert.equal(secondary.find((q) => q.country === "eg").clubId, d.clubs[0]);
  assert.equal(
    secondary.find((q) => q.country === "eg").reason,
    "domestic-cup",
  );
  assert(!secondary.some((q) => primary.some((p) => p.clubId === q.clubId)));
});
test("shared calendar includes group and knockout fixtures with at least three days rest", () => {
  const s = game(),
    m = new Map();
  for (const f of allFixtures(s))
    for (const id of [f.home, f.away]) {
      if (!m.has(id)) m.set(id, []);
      m.get(id).push(f);
    }
  for (const fs of m.values()) {
    fs.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < fs.length; i++)
      assert(restGap(fs[i - 1].date, fs[i].date) >= 3, fs[i].id);
  }
});
test("new-engine validation rejects corrupt groups, fixtures, pots, lotteries and invented champions", () => {
  const s = game();
  for (const mutate of [
    (c) => (c.groups[0].clubs[0] = c.groups[1].clubs[0]),
    (c) => c.fixtures.pop(),
    (c) => (c.pots[0][0] = c.pots[1][0]),
    (c) => (c.lots[c.entrants[0]] = 999),
    (c) => {
      c.winner = c.entrants[0];
      c.phase = "complete";
    },
  ]) {
    const bad = structuredClone(s);
    mutate(bad.expansion.cups.find((c) => c.kind === "caf"));
    assert.throws(() => validateSave(bad));
  }
});

test("CAF reapplies head-to-head to a surviving subset; CONMEBOL 2026 explicitly does not", () => {
  const c = {
      tableRule: "caf",
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
  c.tableRule = "conmebol";
  assert.deepEqual(
    groupTable(c, g).map((r) => r.clubId),
    ["c", "b", "a", "d"],
  );
});
