import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import {
  validateAsiaState,
  validateAsianCup,
} from "../src/core/asiaValidation.js";
import { createAsianCups, asiaDay } from "../src/services/asia/engine.js";
import {
  asiaAccess,
  recordAsianSeason,
  zone,
} from "../src/services/asia/access.js";
import { eliteDraw } from "../src/services/asia/draw.js";
import { asiaTable } from "../src/services/asia/table.js";
import {
  worldAccess,
  region,
  recordFifaSeason,
} from "../src/services/fifa/access.js";
import { fifaDay } from "../src/services/fifa/engine.js";
import { ASIAN_GUESTS, ASIAN_GUEST_IDS } from "../src/data/asianGuests.js";
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
  const cs = s.expansion.cups.filter((c) => c.engine === "asia-v1");
  for (let n = 0; n < 1000 && cs.some((c) => !c.winner); n++) {
    s.date = cs
      .filter((c) => !c.winner)
      .map((c) => c.nextDate)
      .sort()[0];
    for (const c of cs) asiaDay(s, c, simulate);
    validateAsiaState(s);
    callback(cs);
  }
  assert(cs.every((c) => c.winner));
  return cs;
};
test("Asia: three distinct routes, 84 initial clubs, real non-selectable guests, unchanged 116 divisions", () => {
  const s = game();
  validateSave(s);
  const cs = s.expansion.cups.filter((c) => c.engine === "asia-v1");
  assert.equal(cs.length, 3);
  assert.equal(new Set(cs.flatMap((c) => c.originalEntrants)).size, 84);
  assert.equal(DIVISIONS.length, 116);
  assert(
    ASIAN_GUESTS.every(
      (g) =>
        extendedClub(g.id) === g && !EXPANDED_CLUBS.some((c) => c.id === g.id),
    ),
  );
  assert(cs.flatMap((c) => c.entrants).every((id) => region(id) === "afc"));
  assert(!s.players.some((p) => ASIAN_GUEST_IDS.has(p.clubId)));
});
test("Three full Asian paths: 155 / 129 / 43 matches, regional rounds, drop-downs and saved draw validation", () => {
  const s = game(),
    cs = finish(s);
  assert.deepEqual(
    cs.map((c) => c.fixtures.length),
    [155, 129, 43],
  );
  assert.deepEqual(
    cs.map((c) => c.mainEntrants.length),
    [32, 32, 20],
  );
  assert.deepEqual(cs[1].imports, cs[0].preliminaryLosers);
  assert.deepEqual(cs[2].imports, cs[1].preliminaryLosers);
  assert.equal(new Set(cs.flatMap((c) => c.mainEntrants)).size, 84);
  for (const c of cs) {
    assert(
      c.fixtures
        .filter((f) => ["qf", "sf", "final"].includes(f.stage))
        .every((f) =>
          c.kind === "afc" || f.stage === "final" ? f.neutral : !f.neutral,
        ),
    );
  }
});
test("Elite column draw: 40 seeds, eight different opponents, four home/four away, no same association", () => {
  const s = game();
  const c = finish(s)[0];
  for (let seed = 1; seed <= 40; seed++)
    for (const z of ["west", "east"]) {
      s.seed = seed;
      const ids = c.mainEntrants.filter((id) => zone(id) === z),
        d = eliteDraw(s, ids),
        fs = d.rounds.flat();
      assert.equal(fs.length, 64);
      for (const id of ids) {
        const own = fs.filter((f) => [f.home, f.away].includes(id));
        assert.equal(
          new Set(own.map((f) => (f.home === id ? f.away : f.home))).size,
          8,
        );
        assert.equal(own.filter((f) => f.home === id).length, 4);
        assert.equal(new Set(own.map((f) => f.round)).size, 8);
      }
      assert(
        fs.every(
          (f) => extendedClub(f.home).country !== extendedClub(f.away).country,
        ),
      );
    }
});
test("Entry uses saved domestic order; previous secondary champions advance, including a relegated titleholder", () => {
  const s = game();
  s.seasonNumber = 2;
  const sa = s.expansion.divisions.find(
    (d) => d.country === "sa" && d.tier === 1,
  );
  s.expansion.qualification.sa = [...sa.clubs].reverse();
  s.expansion.asia.honours = {
    "afc-challenge": {
      winner: "asia-shan",
      runnerUp: "asia-yangon",
      season: 1,
    },
    "afc-two": { winner: "asia-kuwait", season: 1 },
  };
  let a = asiaAccess(s);
  assert(a.afc.qualifiers.includes("asia-kuwait"));
  assert(a["afc-two"].direct.includes("asia-shan"));
  assert(a["afc-two"].entrants.includes("asia-yangon"));
  assert(a.afc.entrants.includes(s.expansion.qualification.sa[0]));
  const lower = s.expansion.divisions.find(
    (d) => d.country === "sa" && d.tier === 2,
  );
  if (lower) {
    const id = lower.clubs[0];
    s.expansion.asia.honours.afc = { winner: id, season: 1 };
    a = asiaAccess(s);
    assert(a.afc.direct.includes(id));
  }
});
test("Real guest Elite champion reaches both FIFA tournaments; lower Asian winner never substitutes", () => {
  const s = game(),
    guest = "asia-esteghlal";
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
      kind === "afc" ? guest : c.entrants.find((id) => region(id) === r);
  }
  const ic = s.expansion.cups.find((c) => c.kind === "intercontinental");
  fifaDay(s, ic, sim);
  assert(ic.entrants.includes(guest));
  recordFifaSeason(s);
  s.expansion.fifa.history[0].year = 2027;
  const q = worldAccess(s, 2029).qualification.find((q) => q.clubId === guest);
  assert.equal(q.reason, "continental-champion");
  assert.equal(q.region, "afc");
});
test("Forty lightweight Asia-only seasons maintain distinct entries, title paths and legal draws (not full-world capacity)", () => {
  const s = game();
  s.expansion.divisions.forEach((d) => (d.fixtures = []));
  s.expansion.cups = s.expansion.cups.filter((c) => c.engine === "asia-v1");
  for (let y = 0; y < 40; y++) {
    const cs = finish(s);
    recordAsianSeason(s);
    s.seasonNumber++;
    s.expansion.cups = [];
    createAsianCups(s);
    const next = s.expansion.cups;
    assert(next[0].direct.includes(cs[0].winner));
    assert(next[0].entrants.includes(cs[1].winner));
    assert(next.slice(0, 2).some((c) => c.entrants.includes(cs[2].winner)));
  }
});
test("Asian fixtures enter shared calendar with >=3-day rest after league rebalance", () => {
  const s = game();
  for (let n = 0; n < 25; n++) {
    s.date = s.expansion.cups
      .filter((c) => c.engine === "asia-v1" && !c.mainEntrants)
      .map((c) => c.nextDate)
      .sort()[0];
    for (const c of s.expansion.cups.filter((c) => c.engine === "asia-v1"))
      asiaDay(s, c, sim);
    if (
      s.expansion.cups
        .filter((c) => c.engine === "asia-v1")
        .every((c) => c.mainEntrants)
    )
      break;
  }
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
const f = (id, home, away, h, a, round = 1) => ({
  id,
  home,
  away,
  homeGoals: h,
  awayGoals: a,
  played: true,
  stage: "groups",
  group: "A",
  round,
  date: "2026-11-" + String(10 + round).padStart(2, "0"),
  homeConductPenalty: 0,
  awayConductPenalty: 0,
});
test("Group direct comparisons and recursive tie resolution; Elite uses overall difference instead", () => {
  const c = {
      kind: "afc-two",
      lots: { a: 0, b: 1, c: 2, d: 3 },
      fixtures: [
        f("1", "a", "b", 2, 0),
        f("2", "b", "c", 3, 0),
        f("3", "c", "a", 2, 1),
        f("4", "a", "d", 1, 0),
        f("5", "b", "d", 9, 0),
        f("6", "c", "d", 2, 0),
      ],
    },
    g = { id: "A", clubs: ["a", "b", "c", "d"] };
  assert.deepEqual(
    asiaTable(c, g).map((r) => r.clubId),
    ["a", "b", "c", "d"],
  );
  c.kind = "afc";
  assert.deepEqual(
    asiaTable(c, g).map((r) => r.clubId),
    ["b", "a", "c", "d"],
  );
});
test("Final mutual match ranking shootout overrides conduct without changing drawn points", () => {
  const c = {
      kind: "afc-challenge",
      lots: { a: 0, b: 1, c: 2, d: 3 },
      fixtures: [
        f("1", "a", "c", 2, 0, 1),
        f("2", "b", "d", 2, 0, 1),
        f("3", "a", "d", 1, 0, 2),
        f("4", "b", "c", 1, 0, 2),
        f("5", "a", "b", 0, 0, 3),
        f("6", "c", "d", 1, 0, 3),
      ],
      tableShootouts: {},
    },
    g = { id: "A", clubs: ["a", "b", "c", "d"] };
  let key;
  asiaTable(c, g, (k) => (key = k));
  assert.equal(key, "a|b");
  c.tableShootouts[key] = { winner: "b" };
  const ranks = asiaTable(c, g);
  assert.equal(ranks[0].clubId, "b");
  assert.equal(ranks[0].points, 7);
});
test("Asian corruption rejected: injected guest, altered fixture, result aggregate, ranking and drop-down", () => {
  const s = game();
  assert.throws(() => {
    const bad = structuredClone(s);
    bad.expansion.cups.find((c) => !c.engine).entrants[0] = "asia-esteghlal";
    validateSave(bad);
  });
  const cs = finish(s);
  for (const mutate of [
    (c) => (c.fixtures[0].home = c.fixtures[0].away),
    (c) => c.ties[0].aggregateA++,
    (c) => c.groupRanking[0].reverse(),
    (c) => c.imports.push(c.originalEntrants[0]),
    (c) => (c.fixtures.find((f) => f.stage === "groups").neutral = true),
  ]) {
    const c = structuredClone(cs[0]);
    mutate(c);
    assert.throws(() => validateAsianCup(c));
  }
});
test("v10 migration preserves current cups and activates no new Asia mid-season", () => {
  const s = game();
  s.version = 10;
  s.expansion.asiaVersion = 0;
  s.expansion.concacafVersion = 0;
  delete s.expansion.asia;
  delete s.expansion.concacaf;
  s.expansion.cups = s.expansion.cups.filter(
    (c) => c.engine !== "asia-v1" && c.engine !== "concacaf-v1",
  );
  const migrated = migrateSave(s);
  assert.equal(migrated.version, 20);
  assert.equal(migrated.expansion.asiaVersion, 0);
  assert.equal(migrated.expansion.concacafVersion, 0);
  assert.deepEqual(migrated.expansion.cups, s.expansion.cups);
  validateSave(migrated);
});
test("Processing an Asian matchday twice cannot duplicate scores, prizes or messages", () => {
  const s = game(),
    c = s.expansion.cups.find((c) => c.kind === "afc");
  s.clubId = c.qualifiers[0];
  s.date = c.nextDate;
  asiaDay(s, c, sim);
  const before = JSON.stringify({ c, finance: s.finance, inbox: s.inbox });
  asiaDay(s, c, sim);
  assert.equal(
    JSON.stringify({ c, finance: s.finance, inbox: s.inbox }),
    before,
  );
});

test("Tied Asian eliminations use extra time at every stage, never away goals", () => {
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
    assert(
      c.fixtures
        .filter((f) => f.stage !== "groups" && f.winner)
        .every((f) => f.extraTime),
    );
    assert(c.fixtures.every((f) => f.decidedBy !== "away-goals"));
  }
});

test('Owned Asian club plays real squad matches, receives home gates, and has no gates at neutral fixtures',async()=>{
 const {matchDay}=await import('../src/services/matches.js');
 const clubId=[...DIVISIONS.find(d=>d.country==='sa'&&d.tier===1).clubs].sort((a,b)=>extendedClub(b).rep-extendedClub(a).rep)[0];
 const s=createGame({database:'world',expanded:true,clubId,leagues:['eg'],difficulty:'easy'});
 const rows=f=>[f.home,f.away].map(clubId=>({clubId,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0}));
 const cs=finish(s,()=>{},(s,f,cb)=>{if([f.home,f.away].includes(s.clubId))matchDay(s,[f],rows(f),{afterScore:cb});else sim(s,f,cb);});
 const own=cs.flatMap(c=>c.fixtures).filter(f=>[f.home,f.away].includes(s.clubId));
 assert(own.length>=8);assert(own.filter(f=>f.home===s.clubId&&!f.neutral).every(f=>f.attendance>0));
 assert(s.players.filter(p=>p.clubId===s.clubId).some(p=>p.appearances>0));
 const f={id:'asia-neutral-receipts-test',date:s.date,home:s.clubId,away:'asia-esteghlal',neutral:true,played:false,competition:'اختبار محايد'};
 matchDay(s,[f],rows(f));assert(f.played);assert(!f.attendance);assert(!s.finance.ledger.some(e=>e.key===f.id+'-tickets'));
 const before=JSON.stringify(s.finance);matchDay(s,[f],rows(f));assert.equal(JSON.stringify(s.finance),before);
});
