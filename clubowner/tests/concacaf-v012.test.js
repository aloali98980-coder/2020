import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import {
  validateConcacafState,
  validateConcacafCup,
} from "../src/core/concacafValidation.js";
import {
  createConcacafCups,
  concacafDay,
} from "../src/services/concacaf/engine.js";
import {
  concacafAccess,
  recordConcacafSeason,
  subregion,
} from "../src/services/concacaf/access.js";
import {
  concacafTable,
  leaguesTable,
  hostRank,
} from "../src/services/concacaf/table.js";
import { settleTie } from "../src/services/competitions/engine.js";
import {
  worldAccess,
  region,
  recordFifaSeason,
} from "../src/services/fifa/access.js";
import { fifaDay } from "../src/services/fifa/engine.js";
import {
  CONCACAF_GUESTS,
  CONCACAF_GUEST_IDS,
} from "../src/data/concacafGuests.js";
import {
  EXPANDED_CLUBS,
  DIVISIONS,
  extendedClub,
} from "../src/data/expandedCatalog.js";
import {
  allFixtures,
  rebalanceLeagueCalendar,
  restGap,
} from "../src/services/calendar.js";
import { random } from "../src/core/utils.js";
const game = () =>
  createGame({
    database: "world",
    expanded: true,
    leagues: ["eg"],
    difficulty: "easy",
  });
const sim = (s, f, cb) => {
  f.homeGoals = Math.floor(random(s) * 4);
  f.awayGoals = Math.floor(random(s) * 4);
  cb();
  f.played = true;
};
const finish = (s, callback = () => {}, simulate = sim) => {
  const cs = s.expansion.cups.filter((c) => c.engine === "concacaf-v1");
  for (let n = 0; n < 500 && cs.some((c) => !c.winner); n++) {
    s.date = cs
      .filter((c) => !c.winner)
      .map((c) => c.nextDate)
      .sort()[0];
    for (const c of cs) concacafDay(s, c, simulate);
    validateConcacafState(s);
    callback(cs);
  }
  assert(cs.every((c) => c.winner));
  return cs;
};
test("CONCACAF: four routes 27/36/20/10, real non-selectable guests, unchanged 116 divisions", () => {
  const s = game();
  validateSave(s);
  const cs = s.expansion.cups.filter((c) => c.engine === "concacaf-v1");
  assert.equal(cs.length, 4);
  assert.deepEqual(
    cs.map((c) => c.originalEntrants.length),
    [20, 10, 36, 27],
  );
  assert.equal(DIVISIONS.length, 116);
  assert(
    CONCACAF_GUESTS.every(
      (g) =>
        extendedClub(g.id) === g && !EXPANDED_CLUBS.some((c) => c.id === g.id),
    ),
  );
  assert(cs.flatMap((c) => c.entrants).every((id) => region(id) === "concacaf"));
  assert(
    cs
      .flatMap((c) => c.entrants)
      .every((id) => subregion(id) !== null),
  );
  assert(!s.players.some((p) => CONCACAF_GUEST_IDS.has(p.clubId)));
  const cc = cs.find((c) => c.kind === "concacaf");
  assert.equal(cc.seeds.length, 5);
  assert.equal(cc.roundOneClubs.length, 22);
});
test("Four full paths: 51 / 62 / 58 / 28 matches, hosted finals, fixed regional brackets", () => {
  const s = game(),
    cs = finish(s);
  const by = Object.fromEntries(cs.map((c) => [c.kind, c]));
  assert.deepEqual(
    [by.concacaf, by["leagues-cup"], by["central-american"], by.caribbean].map(
      (c) => c.fixtures.length,
    ),
    [51, 62, 58, 28],
  );
  for (const c of cs) {
    assert(c.fixtures.every((f) => f.neutral === false));
    assert(c.finalists.length === 2);
  }
  assert.equal(by.concacaf.ties.filter((t) => t.stage === "r1").length, 11);
  assert.equal(by.concacaf.ties.filter((t) => t.stage === "r16").length, 8);
  assert(by["central-american"].semifinalists.length === 2);
  assert(by["central-american"].playinWinners.length === 2);
  assert(by.caribbean.third);
  assert(by["leagues-cup"].third);
  // Leagues Cup: every club plays three different interleague opponents.
  const lc = by["leagues-cup"],
    phase = lc.fixtures.filter((f) => f.stage === "phase-one");
  assert.equal(phase.length, 54);
  for (const id of lc.entrants) {
    const own = phase.filter((f) => [f.home, f.away].includes(id));
    assert.equal(own.length, 3);
    const foes = own.map((f) => (f.home === id ? f.away : f.home));
    assert.equal(new Set(foes).size, 3);
    assert(
      foes.every((x) => extendedClub(x).country !== extendedClub(id).country),
    );
  }
});
test("Leagues points 3/2/1 with regulation-wins tiebreak; regional H2H before overall gap", () => {
  const f = (id, home, away, h, a, pw, round = 1) => ({
    id,
    home,
    away,
    homeGoals: h,
    awayGoals: a,
    regulationHome: h,
    regulationAway: a,
    penaltyWinner: pw,
    played: true,
    stage: "phase-one",
    round,
    date: "2026-08-0" + round,
    homeConductPenalty: 0,
    awayConductPenalty: 0,
  });
  // a: reg win + shootout win = 5; b: two shootout wins = 4; c: shootout loss + loss = 1.
  const lc = {
      kind: "leagues-cup",
      lots: { a: 0, b: 1, c: 2, d: 3, m1: 4, m2: 5, m3: 6, m4: 7 },
      fixtures: [
        f("1", "a", "m1", 2, 0),
        f("2", "a", "m2", 1, 1, "a"),
        f("3", "a", "m3", 0, 3),
        f("4", "b", "m1", 1, 1, "b"),
        f("5", "b", "m2", 2, 2, "b"),
        f("6", "b", "m3", 0, 4),
        f("7", "c", "m1", 1, 1, "m1"),
        f("8", "c", "m2", 0, 1),
        f("9", "c", "m3", 0, 5),
      ],
    },
    rows = leaguesTable(lc, ["a", "b", "c"]);
  assert.deepEqual(
    rows.map((r) => [r.clubId, r.points, r.regWins]),
    [
      ["a", 5, 1],
      ["b", 4, 0],
      ["c", 1, 0],
    ],
  );
  const g = (id, home, away, h, a, round = 1) => ({
    id,
    home,
    away,
    homeGoals: h,
    awayGoals: a,
    played: true,
    stage: "groups",
    group: "A",
    round,
    date: "2026-08-1" + round,
    homeConductPenalty: 0,
    awayConductPenalty: 0,
  });
  // a/b/e level on points, overall gap and partly goals; H2H splits a/b.
  const rc = {
    kind: "central-american",
    lots: { a: 0, b: 1, c: 2, d: 3, e: 4 },
    fixtures: [
      g("1", "a", "b", 2, 0),
      g("2", "b", "c", 3, 1),
      g("3", "c", "a", 2, 2),
      g("4", "a", "d", 1, 0),
      g("5", "a", "e", 0, 1),
      g("6", "b", "d", 2, 0),
      g("7", "b", "e", 0, 0),
      g("8", "c", "d", 1, 0),
      g("9", "c", "e", 0, 2),
      g("10", "d", "e", 1, 0),
    ],
  };
  assert.deepEqual(
    concacafTable(rc, { id: "A", clubs: ["a", "b", "c", "d", "e"] }).map(
      (r) => r.clubId,
    ),
    ["a", "b", "e", "c", "d"],
  );
});
test("Away goals decide level two-legged ties in regulation; extra time ignores them", () => {
  const s = game();
  const cup = (kind) => ({ engine: "concacaf-v1", kind, fixtures: [] });
  // Leg 1: a 1–0; leg 2: b 2–1 → 2–2 aggregate, a scored once away, b never.
  const c = cup("concacaf"),
    t = { id: "t", stage: "r16", round: 1, a: "a", b: "b", legs: ["l1", "l2"] },
    l1 = { id: "l1", home: "a", away: "b", homeGoals: 1, awayGoals: 0, played: true },
    l2 = { id: "l2", home: "b", away: "a", homeGoals: 2, awayGoals: 1, played: true };
  c.fixtures = [l1, l2];
  settleTie(s, c, t, l1);
  assert(!t.winner);
  settleTie(s, c, t, l2);
  assert.equal(t.winner, "a");
  assert.equal(l2.decidedBy, "away-goals");
  assert(!l2.extraTime && !l2.penaltyWinner);
  // Level on away goals too → extra time, never an away-goals decision.
  const c2 = cup("central-american"),
    t2 = { id: "t", stage: "qf", round: 1, a: "a", b: "b", legs: ["m1", "m2"] },
    m1 = { id: "m1", home: "a", away: "b", homeGoals: 1, awayGoals: 1, played: true },
    m2 = { id: "m2", home: "b", away: "a", homeGoals: 1, awayGoals: 1, played: true };
  c2.fixtures = [m1, m2];
  settleTie(s, c2, t2, m2);
  assert(m2.extraTime);
  assert(m2.decidedBy !== "away-goals");
  assert(["a", "b"].includes(t2.winner));
  // Leagues Cup single legs go straight to penalties without extra time.
  const c3 = cup("leagues-cup"),
    t3 = { id: "t", stage: "qf", round: 1, a: "a", b: "b", legs: ["n1"] },
    n1 = { id: "n1", home: "a", away: "b", homeGoals: 1, awayGoals: 1, played: true };
  c3.fixtures = [n1];
  settleTie(s, c3, t3, n1);
  assert(!n1.extraTime && n1.penaltyWinner === t3.winner);
});
test("Second-leg hosts follow competition record; final hosts the best survivor", () => {
  const s = game(),
    cs = finish(s),
    cc = cs.find((c) => c.kind === "concacaf");
  const qf = cc.ties.filter((t) => t.stage === "qf"),
    hosts = hostRank(
      cc,
      cc.ties.filter((t) => t.stage === "r16").map((t) => t.winner),
      ["r16"],
    ).slice(0, 4);
  assert.deepEqual(new Set(qf.map((t) => t.b)), new Set(hosts));
  const fin = cc.ties.find((t) => t.stage === "final"),
    [best] = hostRank(
      cc,
      cc.ties.filter((t) => t.stage === "sf").map((t) => t.winner),
      ["r16", "qf", "sf"],
    );
  assert.equal(fin.b, best);
  assert.equal(fin.legs.length, 1);
  assert(!fin.legs.map((id) => cc.fixtures.find((f) => f.id === id))[0].neutral);
});
test("Entry uses saved domestic order; regional honours feed next season's byes and Round One", () => {
  const s = game();
  s.seasonNumber = 2;
  const mx = s.expansion.divisions.find((d) => d.country === "mx" && d.tier === 1);
  s.expansion.qualification.mx = [...mx.clubs].reverse();
  s.expansion.concacaf.honours = {
    "leagues-cup": { winner: mx.clubs[0], runnerUp: mx.clubs[1], third: mx.clubs[2], season: 1 },
    "central-american": {
      winner: "ccaf-saprissa",
      runnerUp: "ccaf-olimpia",
      semifinalists: ["ccaf-motagua", "ccaf-alianza"],
      playinWinners: ["ccaf-fas", "ccaf-cai"],
      qualifiers: ["ccaf-saprissa", "ccaf-olimpia", "ccaf-motagua", "ccaf-alianza", "ccaf-fas", "ccaf-cai"],
      season: 1,
    },
    caribbean: { winner: "ccaf-cibao", runnerUp: "ccaf-violette", third: "ccaf-cavalier", season: 1 },
  };
  const a = concacafAccess(s);
  assert(a.concacaf.seeds.includes(mx.clubs[0]));
  assert(a.concacaf.seeds.includes("ccaf-saprissa"));
  assert(a.concacaf.seeds.includes("ccaf-cibao"));
  for (const id of ["ccaf-olimpia", "ccaf-motagua", "ccaf-fas", "ccaf-violette", "ccaf-cavalier"])
    assert(a.concacaf.roundOne.includes(id));
  assert(a.concacaf.seeds.includes(s.expansion.qualification.mx[0]));
  assert(a["leagues-cup"].entrants.includes(s.expansion.qualification.mx[0]));
});
test("Real guest Champions Cup winner reaches both FIFA tournaments", () => {
  const s = game(),
    guest = "ccaf-saprissa";
  for (const [kind, r] of Object.entries({
    ucl: "uefa",
    caf: "caf",
    afc: "afc",
    lib: "conmebol",
    concacaf: "concacaf",
    ofc: "ofc",
  })) {
    const c = s.expansion.cups.find(
      (c) => c.kind === kind || c.id === kind + "-s1",
    );
    c.winner =
      kind === "concacaf" ? guest : c.entrants.find((id) => region(id) === r);
  }
  const ic = s.expansion.cups.find((c) => c.kind === "intercontinental");
  fifaDay(s, ic, sim);
  assert(ic.entrants.includes(guest));
  recordFifaSeason(s);
  s.expansion.fifa.history[0].year = 2027;
  const q = worldAccess(s, 2029).qualification.find((q) => q.clubId === guest);
  assert.equal(q.reason, "continental-champion");
  assert.equal(q.region, "concacaf");
});
test("Forty lightweight CONCACAF-only seasons keep entries, byes and legal draws", () => {
  const s = game();
  s.expansion.divisions.forEach((d) => (d.fixtures = []));
  s.expansion.cups = s.expansion.cups.filter((c) => c.engine === "concacaf-v1");
  for (let y = 0; y < 40; y++) {
    const cs = finish(s);
    recordConcacafSeason(s);
    s.seasonNumber++;
    const hon = s.expansion.concacaf.honours;
    s.expansion.cups = [];
    createConcacafCups(s);
    const next = s.expansion.cups.find((c) => c.kind === "concacaf");
    for (const id of [
      hon["leagues-cup"].winner,
      hon["central-american"].winner,
      hon.caribbean.winner,
    ])
      assert(next.seeds.includes(id));
    assert(
      hon["central-american"].qualifiers
        .slice(1)
        .every((id) => next.roundOneClubs.includes(id)),
    );
  }
});
test("CONCACAF fixtures enter shared calendar with >=3-day rest after league rebalance", () => {
  const s = game();
  rebalanceLeagueCalendar(s);
  const by = new Map();
  for (const f of allFixtures(s))
    for (const id of [f.home, f.away]) {
      if (!by.has(id)) by.set(id, []);
      by.get(id).push(f);
    }
  for (const fs of by.values()) {
    fs.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < fs.length; i++)
      assert(restGap(fs[i - 1].date, fs[i].date) >= 3);
  }
});
test("CONCACAF corruption rejected: injected guest, altered fixture, aggregate, ranking and seeds", () => {
  const s = game();
  assert.throws(() => {
    const bad = structuredClone(s);
    bad.expansion.cups.find((c) => !c.engine).entrants[0] = "ccaf-saprissa";
    validateSave(bad);
  });
  const cs = finish(s);
  const cc = structuredClone(cs.find((c) => c.kind === "concacaf"));
  assert.throws(() => {
    const c = structuredClone(cc);
    c.fixtures[0].home = c.fixtures[0].away;
    validateConcacafCup(c);
  });
  assert.throws(() => {
    const c = structuredClone(cc);
    c.ties[0].aggregateA++;
    validateConcacafCup(c);
  });
  assert.throws(() => {
    const c = structuredClone(cc);
    c.r1Seeds[0] = c.roundOneClubs.find((id) => !c.r1Seeds.includes(id));
    validateConcacafCup(c);
  });
  const central = structuredClone(cs.find((c) => c.kind === "central-american"));
  assert.throws(() => {
    const c = structuredClone(central);
    c.groupRanking[0].reverse();
    validateConcacafCup(c);
  });
  const leagues = structuredClone(cs.find((c) => c.kind === "leagues-cup"));
  assert.throws(() => {
    const c = structuredClone(leagues);
    c.knockoutSeeds.mx.reverse();
    validateConcacafCup(c);
  });
});
test("v11 migration preserves current cups and activates no new CONCACAF mid-season", () => {
  const s = game();
  s.version = 11;
  s.expansion.concacafVersion = 0;
  delete s.expansion.concacaf;
  s.expansion.cups = s.expansion.cups.filter((c) => c.engine !== "concacaf-v1");
  const migrated = migrateSave(s);
  assert.equal(migrated.version, 23);
  assert.equal(migrated.expansion.concacafVersion, 0);
  assert.deepEqual(migrated.expansion.cups, s.expansion.cups);
  validateSave(migrated);
});
test("Processing a CONCACAF matchday twice cannot duplicate scores, prizes or messages", () => {
  const s = game(),
    c = s.expansion.cups.find((c) => c.kind === "leagues-cup");
  s.clubId = c.entrants[0];
  s.date = c.nextDate;
  concacafDay(s, c, sim);
  const before = JSON.stringify({ c, finance: s.finance, inbox: s.inbox });
  concacafDay(s, c, sim);
  assert.equal(
    JSON.stringify({ c, finance: s.finance, inbox: s.inbox }),
    before,
  );
});
test("Tied eliminations use extra time outside Leagues Cup, never before away goals", () => {
  const s = game(),
    cs = finish(
      s,
      () => {},
      (s, f, cb) => {
        f.homeGoals = 1;
        f.awayGoals = 1;
        cb();
        f.played = true;
      },
    );
  for (const c of cs) {
    if (c.kind === "leagues-cup") {
      assert(
        c.fixtures
          .filter((f) => f.stage !== "phase-one")
          .every((f) => !f.extraTime && f.penaltyWinner),
      );
      assert(
        c.fixtures
          .filter((f) => f.stage === "phase-one")
          .every((f) => f.penaltyWinner && !f.extraTime),
      );
    } else
      assert(
        c.fixtures
          .filter((f) => f.tieId && f.winner)
          .every((f) => f.extraTime),
      );
  }
});
test("Owned US club plays real squad matches and receives home gates", async () => {
  const { matchDay } = await import("../src/services/matches.js");
  const clubId = [...DIVISIONS.find((d) => d.country === "us" && d.tier === 1).clubs].sort(
    (a, b) => extendedClub(b).rep - extendedClub(a).rep,
  )[0];
  const s = createGame({
    database: "world",
    expanded: true,
    clubId,
    leagues: ["eg"],
    difficulty: "easy",
  });
  const rows = (f) =>
    [f.home, f.away].map((clubId) => ({
      clubId,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      points: 0,
    }));
  const cs = finish(s, () => {}, (s, f, cb) => {
    if ([f.home, f.away].includes(s.clubId)) matchDay(s, [f], rows(f), { afterScore: cb });
    else sim(s, f, cb);
  });
  const own = cs.flatMap((c) => c.fixtures).filter((f) => [f.home, f.away].includes(s.clubId));
  assert(own.length >= 3);
  assert(own.filter((f) => f.home === s.clubId).every((f) => f.attendance > 0));
  assert(s.players.filter((p) => p.clubId === s.clubId).some((p) => p.appearances > 0));
  const played = own.find((f) => f.home === s.clubId),
    before = JSON.stringify(s.finance);
  matchDay(s, [played], rows(played));
  assert.equal(JSON.stringify(s.finance), before);
});
