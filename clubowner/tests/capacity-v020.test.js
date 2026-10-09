// 0.20 — long-career capacity: fast calendar arithmetic, retiree archive, slimmer player
// records, bounded staff pool, free-agent retirement, v17→v18 migration and the cached save codec.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave, migrateToEighteen } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { advanceTime } from "../src/services/time.js";
import {
  addDays,
  daysBetween,
  dayNumber,
  dateFromDayNumber,
} from "../src/core/utils.js";
import { ageAt } from "../src/models/player.js";
import {
  provenance,
  stripDerivedProvenance,
} from "../src/models/provenance.js";
import {
  inInternationalWindow,
  calendarIndex,
  availableDate,
  ownFixtures,
  allFixtures,
} from "../src/services/calendar.js";
import { clubPowers, refreshBudgets } from "../src/services/pyramid.js";
import { extendedClub } from "../src/data/expandedCatalog.js";
import {
  announceRetirement,
  retirementDay,
  agingDay,
  AGING_HISTORY_KEEP,
  STAFF_POOL_LIMIT,
} from "../src/services/careers.js";
import { worldTalentDay } from "../src/services/talent/world.js";
import {
  archiveRetiree,
  findPerson,
  retiredRecord,
  retiredCount,
  referencedPersonIds,
  MAX_RETIRED,
} from "../src/services/retired.js";
import {
  encodeLocalSave,
  decodeLocalSave,
  playerBatches,
  resetLocalSaveCache,
} from "../src/services/localSaveCodec.js";
import { playerDetail } from "../src/features/players.js";
import { DIVISIONS } from "../src/data/expandedCatalog.js";

const game = () =>
  createGame({
    database: "world",
    expanded: true,
    clubId: DIVISIONS.find((d) => d.id === "eg-1").clubs[0],
    leagues: ["eg"],
    difficulty: "easy",
  });
function tick(s, n) {
  let advanced = 0;
  while (advanced < n) {
    for (const m of s.inbox) if (m.required) m.status = "resolved";
    const r = advanceTime(s, Math.min(30, n - advanced));
    advanced += r.advanced;
    if (!r.advanced && !r.blocked) break;
  }
  return advanced;
}
const oldAddDays = (date, n) =>
  new Date(Date.parse(date + "T12:00:00Z") + n * 86400000)
    .toISOString()
    .slice(0, 10);
const oldBetween = (a, b) =>
  Math.round(
    (Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000,
  );

test("0.20 date arithmetic matches the Date-based implementation across centuries and leap days", () => {
  for (let n = dayNumber("1950-01-01"); n <= dayNumber("2150-12-31"); n += 1) {
    const d = dateFromDayNumber(n);
    assert.equal(d, new Date(n * 86400000).toISOString().slice(0, 10));
    assert.equal(dayNumber(d), n);
  }
  for (const d of [
    "2026-09-24",
    "2024-02-29",
    "2023-12-31",
    "2100-02-28",
    "2000-02-29",
  ])
    for (const n of [
      -800, -365, -31, -1, 0, 1, 10, 28, 30, 45, 180, 365, 730, 1100,
    ]) {
      assert.equal(addDays(d, n), oldAddDays(d, n));
      const b = oldAddDays(d, n);
      assert.equal(daysBetween(d, b), oldBetween(d, b));
      assert.equal(daysBetween(b, d), oldBetween(b, d));
    }
  assert.equal(
    addDays("2026-02-30", 1),
    oldAddDays("2026-02-30", 1),
    "lenient input behaves like before",
  );
  assert.throws(() => addDays(undefined, 1), RangeError);
  assert.throws(() => addDays("abc", 1), RangeError);
});

test("0.20 ageAt matches the string-splitting formula and handles reference ages", () => {
  const oldAge = (p, date) => {
    const [y, m, d] = date.split("-").map(Number),
      [by, bm, bd] = p.birthDate.split("-").map(Number);
    return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
  };
  for (const birth of [
    "1988-12-18",
    "2002-01-01",
    "2000-02-29",
    "1995-09-24",
    "2008-06-30",
  ]) {
    const p = { birthDate: birth };
    for (let i = 0; i < 1500; i += 7) {
      const date = addDays("2026-09-24", i);
      assert.equal(ageAt(p, date), oldAge(p, date));
    }
  }
  const ref = { ageReference: 30, ageReferenceDate: "2026-09-24" };
  assert.equal(ageAt(ref, "2026-09-24"), 30);
  assert.equal(ageAt(ref, "2027-09-25"), 31);
});

test("0.20 international windows and the integer fixture calendar behave like the string version", () => {
  const legacyWindow = (date) =>
    ["03-20", "06-01", "09-05", "11-10"].some(
      (start) =>
        date.slice(5) >= start &&
        date.slice(5) <=
          oldAddDays(date.slice(0, 4) + "-" + start, 10).slice(5),
    );
  for (let i = 0; i < 366 * 3; i++) {
    const d = addDays("2026-01-01", i);
    assert.equal(inInternationalWindow(d), legacyWindow(d), d);
  }
  const fixtures = [
    { home: "a", away: "b", date: "2026-10-03" },
    { home: "a", away: "c", date: "2026-10-08" },
    { home: "d", away: "b", date: "2026-10-12" },
  ];
  const calendar = calendarIndex(fixtures);
  // a is busy 10-01…10-05 and 10-06…10-10 → first free day for a-vs-d is 10-11? d busy 10-10…10-14 → 10-15
  assert.equal(availableDate(calendar, "a", "d", "2026-10-01"), "2026-10-15");
  assert.equal(availableDate(calendar, "x", "y", "2026-09-04"), "2026-09-04");
  assert.equal(
    availableDate(calendar, "x", "y", "2026-09-05"),
    "2026-09-16",
    "skips the September window",
  );
  const f = { home: "x", away: "y", date: "2026-09-16" };
  calendar.reserve(f);
  assert.equal(availableDate(calendar, "x", "z", "2026-09-16"), "2026-09-19");
});

test("0.20 ownFixtures matches a filter over allFixtures and clubPowers matches the sort-based average", () => {
  const s = game();
  tick(s, 12);
  const mine = ownFixtures(s);
  const expected = allFixtures(s)
    .filter((f) => f.home === s.clubId || f.away === s.clubId)
    .filter((f, i, arr) => arr.findIndex((x) => x.id === f.id) === i)
    .sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1,
    );
  assert.deepEqual(
    mine.map((f) => f.id),
    expected.map((f) => f.id),
  );
  const powers = clubPowers(s.players);
  const groups = new Map();
  for (const p of s.players) {
    if (p.status === "retired") continue;
    if (!groups.has(p.clubId)) groups.set(p.clubId, []);
    groups.get(p.clubId).push(p.rating);
  }
  for (const [id, ratings] of groups) {
    const top = ratings.sort((a, b) => b - a).slice(0, 11);
    const avg = top.reduce((a, b) => a + b, 0) / top.length;
    assert.ok(Math.abs(powers[id] - avg) < 1e-9, id);
  }
});

test("0.20 new saves are v18 with an empty retiree archive; world-pack players carry no provenance copies", () => {
  assert.equal(SAVE_VERSION, 31);
  const s = game();
  assert.deepEqual(s.retired, []);
  validateSave(s);
  const pack = s.players.filter((p) => p.id.startsWith("wp-"));
  assert.ok(pack.length > 300);
  assert.ok(
    pack.every(
      (p) => p.sourceUrl === undefined && p.estimatedFields === undefined,
    ),
  );
  assert.ok(pack.every((p) => provenance(p).sourceUrl?.startsWith("https://")));
  assert.ok(pack.every((p) => provenance(p).sourceLicense === "CC-BY-SA-4.0"));
  assert.ok(
    pack.some((p) => provenance(p).biographyUrl?.startsWith("https://")),
  );
  const star = pack.find((p) => p.abilityMethod === "editorial-estimate");
  assert.ok(star, "editorial stars keep their explicit method");
  const plain = pack.find((p) => !p.abilityMethod);
  assert.equal(provenance(plain).abilityMethod, "seeded-role-age-estimate");
  assert.ok(
    pack.every(
      (p) =>
        Number.isInteger(Math.round(p.developmentRate * 1000)) &&
        String(p.developmentRate).length <= 6,
    ),
  );
  const bytes = JSON.stringify(s.players).length / s.players.length;
  assert.ok(bytes < 1300, `bytes per player at creation ${bytes}`);
  const html = playerDetail(s, plain);
  assert.ok(
    html.includes(provenance(plain).sourceUrl.replace(/&/g, "&amp;")),
    "profile still links the source page",
  );
});

test("0.20 retirees leave s.players for a compact archive that profiles, staff and validation still resolve", () => {
  const s = game();
  const own = s.players
    .filter((p) => p.clubId === s.clubId && p.age >= 30)
    .slice(0, 2);
  const other = s.players
    .filter((p) => p.clubId !== s.clubId && p.age >= 33)
    .slice(0, 3);
  for (const p of [...own, ...other]) announceRetirement(s, p);
  tick(s, 60);
  assert.ok(s.retired.length >= 5, "archive filled");
  for (const p of [...own, ...other]) {
    assert.ok(!s.players.some((x) => x.id === p.id), "removed from players");
    const r = findPerson(s, p.id);
    assert.equal(r.status, "retired");
    assert.equal(r.clubId, "retired");
    assert.equal(
      r.previousClubId,
      p.clubId === "retired" ? p.previousClubId : p.clubId,
    );
    assert.ok(r.attributes && r.careerHistory.at(-1).type === "retired");
    assert.ok(!("agingHistory" in r) && !("contractTerms" in r));
    const html = playerDetail(s, r);
    assert.ok(html.includes("معتزل"));
  }
  assert.equal(retiredCount(s), s.retired.length);
  const candidates = s.staff.filter((c) => c.status === "available");
  assert.ok(
    candidates.every((c) => findPerson(s, c.personId)),
    "staff candidates keep a resolvable person",
  );
  validateSave(s);
  const json = JSON.stringify(s.retired[0]);
  assert.ok(json.length < 900, `compact retiree record ${json.length}`);
  assert.equal(
    Object.keys(
      retiredRecord({
        id: "x",
        name: "n",
        status: "retired",
        clubId: "c",
        rating: 61.234,
        careerHistory: [],
        attributes: {},
      }),
    ).includes("agingHistory"),
    false,
  );
});

test("0.20 archive pruning keeps own-club retirees and staff references", () => {
  const s = game();
  s.retired = [];
  for (let i = 0; i < MAX_RETIRED + 50; i++)
    s.retired.push({
      id: `ret-${i}`,
      name: "x",
      status: "retired",
      clubId: "retired",
      previousClubId: i % 500 === 0 ? s.clubId : "someone",
      retiredOn: "2026-10-01",
      careerHistory: [],
      attributes: {},
      rating: 60,
    });
  s.staff.push({
    id: "staff-test",
    personId: "ret-1",
    formerClubId: "someone",
    since: "2026-10-01",
    name: "x",
    skills: { coaching: 50, scouting: 50, youth: 50 },
    qualification: "trainee",
    status: "available",
    role: null,
    salary: 0,
    contractEnd: null,
    joined: null,
    course: null,
  });
  const buyer = s.expansion.divisions.find((d) => d.id === "eg-1").clubs[1];
  s.management.outgoing.push({
    id: "bid-old",
    playerId: "ret-3",
    buyer,
    fee: 1000000,
    expires: "2026-10-08",
    status: "expired",
  });
  s.talent.scouting.shortlist.push("ret-4");
  s.talent.world.history.unshift({
    date: "2026-10-01",
    playerId: "ret-5",
    type: "contract-expired",
    clubId: buyer,
  });
  const pinned = referencedPersonIds(s);
  for (const id of ["ret-1", "ret-3", "ret-4", "ret-5"])
    assert.ok(pinned.has(id), id);
  const victim = {
    ...s.players[0],
    status: "retired",
    clubId: "retired",
    retiredOn: s.date,
  };
  s.players[0] = victim;
  archiveRetiree(s, victim);
  assert.ok(s.retired.length <= MAX_RETIRED);
  assert.ok(
    s.retired.some((r) => r.id === "ret-1"),
    "staff-referenced retiree kept",
  );
  assert.ok(
    s.retired.some((r) => r.id === "ret-3"),
    "retiree named in an old bid kept",
  );
  assert.ok(
    s.retired.some((r) => r.id === "ret-4"),
    "shortlisted retiree kept",
  );
  assert.ok(
    s.retired.some((r) => r.id === "ret-5"),
    "retiree in world history kept",
  );
  assert.ok(
    s.retired.some((r) => r.id === "ret-0"),
    "own-club retiree kept",
  );
  assert.ok(
    !s.retired.some((r) => r.id === "ret-2"),
    "oldest AI retiree dropped",
  );
  assert.ok(s.retired.at(-1).id === victim.id);
  validateSave(s);
});

test("0.20 aging history stays capped and compact; the profile still shows the last months", () => {
  const s = game();
  tick(s, 200);
  const ai = s.players.filter(
    (p) => p.clubId !== s.clubId && p.agingHistory?.length,
  );
  assert.ok(ai.length > 100);
  assert.ok(ai.every((p) => p.agingHistory.length <= AGING_HISTORY_KEEP));
  assert.ok(
    ai.every((p) => Object.keys(p.agingHistory[0]).join() === "date,rating"),
  );
  const html = playerDetail(s, ai[0]);
  assert.ok(html.includes("aging-history"));
  const perPlayer = JSON.stringify(s.players).length / s.players.length;
  assert.ok(perPlayer < 1500, `bytes per player after 200 days ${perPlayer}`);
});

test("0.20 world staff pool is bounded and stale outside candidates expire", () => {
  const s = game();
  const outsiders = s.players.filter(
    (p) => p.clubId !== s.clubId && p.age >= 32,
  );
  for (const p of outsiders.slice(0, STAFF_POOL_LIMIT + 30)) {
    p.careerInterest = 10;
    announceRetirement(s, p);
  }
  tick(s, 50);
  const pool = s.staff.filter(
    (c) => c.status === "available" && c.formerClubId !== s.clubId,
  );
  assert.ok(pool.length <= STAFF_POOL_LIMIT, `pool ${pool.length}`);
  assert.ok(pool.every((c) => c.since && c.formerClubId));
  for (const c of pool) c.since = addDays(s.date, -800);
  tick(s, 32);
  assert.equal(
    s.staff.filter(
      (c) =>
        c.status === "available" &&
        c.formerClubId !== s.clubId &&
        c.since < addDays(s.date, -790),
    ).length,
    0,
  );
  validateSave(s);
});

test("0.20 long-unattached free agents announce retirement instead of lingering forever", () => {
  const s = game();
  const free = s.players
    .filter((p) => p.clubId !== s.clubId && p.age >= 30 && p.age < 34)
    .slice(0, 3);
  for (const p of free) {
    p.clubId = "لاعب حر";
    p.clubName = "لاعب حر";
    p.freeSince = addDays(s.date, -400);
    p.value = 0;
  }
  const young = s.players.find((p) => p.clubId !== s.clubId && p.age <= 24);
  young.clubId = "لاعب حر";
  young.clubName = "لاعب حر";
  young.freeSince = addDays(s.date, -100);
  const start = s.date;
  while (!s.date.endsWith("-01")) tick(s, 1);
  worldTalentDay(s);
  assert.ok(
    free.every((p) => p.retirementPlan || p.clubId !== "لاعب حر"),
    "old free agents plan retirement or got signed",
  );
  assert.ok(!young.retirementPlan, "a young free agent keeps waiting");
  assert.ok(s.talent.world.retiredUnattached >= 1);
  assert.ok(s.date > start);
  validateSave(s);
});

test("0.20 v17 saves migrate: retirees archived, provenance stripped, history capped, staff pool trimmed", () => {
  const s = game();
  tick(s, 40);
  const v17 = structuredClone(s);
  v17.version = 17;
  delete v17.retired;
  delete v17.migrationNote;
  // Re-inflate the old per-player shape.
  for (const p of v17.players) {
    Object.assign(p, provenance(p), {
      abilityMethod: provenance(p).abilityMethod,
    });
    p.agingHistory = Array.from({ length: 12 }, (_, i) => ({
      date: addDays("2025-01-01", i * 30),
      age: 25,
      rating: 60 + i,
      change: 0.1,
    }));
    p.developmentRate = 1.14660693842452;
  }
  const retirees = v17.players.filter((p) => p.clubId !== s.clubId).slice(0, 6);
  for (const p of retirees) {
    p.status = "retired";
    p.previousClubId = p.clubId;
    p.clubId = "retired";
    p.retiredOn = "2026-10-20";
    p.salary = 0;
    p.value = 0;
    p.careerHistory.push({
      type: "retired",
      date: "2026-10-20",
      clubId: p.previousClubId,
      appearances: 0,
      goals: 0,
    });
  }
  for (let i = 0; i < 90; i++)
    v17.staff.push({
      id: `staff-old-${i}`,
      personId: retirees[i % retirees.length].id,
      name: "x",
      nameLatin: null,
      skills: { coaching: 50, scouting: 50, youth: 50 },
      qualification: "trainee",
      status: "available",
      role: null,
      salary: 0,
      contractEnd: null,
      joined: null,
      course: null,
    });
  const size17 = JSON.stringify(v17).length;
  const m = migrateSave(v17);
  assert.equal(m.version, SAVE_VERSION);
  assert.ok(m.migrationNote.includes("0.20"));
  assert.equal(m.retired.length, 6);
  assert.ok(!m.players.some((p) => p.status === "retired"));
  assert.deepEqual(
    m.players.map((p) => [p.id, p.rating]),
    s.players
      .filter((p) => !retirees.some((r) => r.id === p.id))
      .map((p) => [p.id, p.rating]),
  );
  assert.equal(m.finance.cash, s.finance.cash);
  assert.ok(
    m.players
      .filter((p) => p.id.startsWith("wp-"))
      .every((p) => p.sourceUrl === undefined),
  );
  assert.ok(
    m.players.every(
      (p) => p.agingHistory.length <= 12 && !("change" in p.agingHistory[0]),
    ),
  );
  assert.ok(m.players.every((p) => p.developmentRate === 1.147));
  assert.ok(
    m.staff.filter((c) => c.status === "available").length <= STAFF_POOL_LIMIT,
  );
  assert.ok(m.staff.every((c) => c.since && "formerClubId" in c));
  assert.ok(
    JSON.stringify(m).length < size17 * 0.8,
    "migrated save is markedly smaller",
  );
  validateSave(m);
  assert.equal(migrateSave(m), m, "idempotent");
  assert.equal(
    migrateToEighteen({ version: 16 }).version,
    16,
    "only v17 input is handled here",
  );
});

test("0.20 provenance stripping is conservative: explicit non-pack values are preserved", () => {
  const s = game();
  const p = s.players.find((x) => x.id.startsWith("wp-"));
  const custom = { ...p, sourceUrl: "https://example.org/custom" };
  assert.equal(stripDerivedProvenance(custom), null);
  assert.equal(provenance(custom).sourceUrl, "https://example.org/custom");
  const gen = s.players.find((x) => x.generated);
  assert.equal(stripDerivedProvenance(gen), null);
  assert.equal(provenance(gen).sourceStatus, "simulated");
  assert.deepEqual(provenance(gen).estimatedFields, []);
});

test("0.20 local save codec: content-defined batches, round trip with recomputed ages, and cache reuse", async () => {
  resetLocalSaveCache();
  const s = game();
  const batches = playerBatches(s.players);
  assert.equal(batches[0][0], 0);
  assert.equal(batches.at(-1)[1], s.players.length);
  assert.ok(batches.every(([a, b]) => b - a >= 1 && b - a <= 256));
  for (let i = 1; i < batches.length; i++)
    assert.equal(batches[i][0], batches[i - 1][1]);
  const first = await encodeLocalSave(s);
  assert.equal(first.reused, 0);
  assert.equal(first.parts.length, batches.length);
  assert.ok(
    s.players.every((p) => p.age > 0),
    "ages restored after encoding",
  );
  const again = await encodeLocalSave(s);
  assert.equal(
    again.reused,
    first.parts.length,
    "identical state reuses every batch",
  );
  tick(s, 3);
  const later = await encodeLocalSave(s);
  assert.ok(
    later.reused >= later.parts.length - 4,
    `birthdays alone do not dirty batches (${later.reused}/${later.parts.length})`,
  );
  s.players.splice(40, 1);
  const removed = await encodeLocalSave(s);
  assert.ok(
    removed.reused >= removed.parts.length - 2,
    "removing a player only re-encodes its own batch",
  );
  const back = await decodeLocalSave(removed);
  assert.equal(back.players.length, s.players.length);
  assert.deepEqual(
    back.players.map((p) => p.age),
    s.players.map((p) => p.age),
  );
  assert.equal(JSON.stringify(back), JSON.stringify(s));
  validateSave(back);
  // legacy fixed-size parts are still readable
  const legacy = {
    format: "clubowner-json-parts-v1",
    head: first.head,
    parts: [],
    playerCount: 0,
  };
  const empty = await decodeLocalSave(legacy);
  assert.equal(empty.players.length, 0);
});

test("0.20 a season in a one-market world keeps the population level and stays under the per-player budget", () => {
  const s = game();
  const startActive = s.players.length;
  const t = performance.now();
  const advanced = tick(s, 370);
  const ms = (performance.now() - t) / advanced;
  assert.ok(advanced >= 360, `advanced ${advanced}`);
  assert.ok(ms < 60, `ms per day ${ms.toFixed(1)}`);
  assert.ok(!s.players.some((p) => p.status === "retired"));
  assert.ok(s.retired.length > 0);
  assert.ok(
    Math.abs(s.players.length - startActive) < startActive * 0.08,
    `population ${startActive} → ${s.players.length}`,
  );
  const perPlayer = JSON.stringify(s.players).length / s.players.length;
  assert.ok(perPlayer < 1500, `bytes per player ${perPlayer}`);
  assert.ok(s.seasonNumber >= 2, "a season rolled over");
  for (const d of s.expansion.divisions)
    for (const id of d.clubs) {
      const baseline = extendedClub(id)?.cash || 50000000;
      assert.ok(
        s.expansion.budgets[id] >= baseline * 0.5,
        `AI budget refreshed for ${id}`,
      );
    }
  agingDay(s);
  retirementDay(s);
  validateSave(s);
});

test("0.20 AI budgets are topped up to their baseline each season while surpluses are kept", () => {
  const s = game();
  const ids = s.expansion.divisions.find((d) => d.id === "eg-1").clubs;
  const [a, b] = ids;
  const baseA = extendedClub(a).cash;
  s.expansion.budgets[a] = 0;
  s.expansion.budgets[b] = 999999999;
  delete s.expansion.budgets[ids[2]];
  refreshBudgets(s);
  assert.equal(s.expansion.budgets[a], baseA);
  assert.equal(s.expansion.budgets[b], 999999999);
  assert.equal(s.expansion.budgets[ids[2]], extendedClub(ids[2]).cash);
  validateSave(s);
});

test("0.20 player objects keep V8 fast properties: no default ability method to delete, no undefined-only keys", () => {
  const s = game();
  const plain = s.players.filter((p) => !p.abilityMethod);
  assert.ok(plain.length > s.players.length * 0.8);
  assert.ok(
    plain.every((p) => !("abilityMethod" in p)),
    "default method is never materialised",
  );
  const stars = s.players.filter(
    (p) => p.abilityMethod === "editorial-estimate",
  );
  assert.ok(stars.length > 0);
  const shapes = new Set(s.players.map((p) => Object.keys(p).join()));
  assert.ok(shapes.size <= 12, `player shapes ${shapes.size}`);
});
