import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { validateEuropeanCup } from "../src/core/europeValidation.js";
import { drawLeaguePhase } from "../src/services/europe/draw.js";
import { europeanTable } from "../src/services/europe/table.js";
import {
  europeanDay,
  resolveExtraTime,
} from "../src/services/europe/engine.js";
import { ownFixtures, allFixtures, restGap } from "../src/services/calendar.js";
import { advanceTime } from "../src/services/time.js";
import { matchDay } from "../src/services/matches.js";
import { pyramidDay, blankRow } from "../src/services/pyramid.js";
import { friendly } from "../src/services/commerce.js";
import { EXPANDED_CLUBS } from "../src/data/expandedCatalog.js";
import { addDays } from "../src/core/utils.js";
import { SAVE_VERSION } from "../src/core/game.js";
const club = EXPANDED_CLUBS.find(
  (c) => c.country === "en" && c.tier === 1 && c.selectable,
);
const game = () =>
  createGame({
    database: "world",
    expanded: true,
    clubId: club.id,
    leagues: ["en", "eg"],
    difficulty: "easy",
  });
const clear = (s) => {
  for (const m of s.inbox) if (m.required) m.status = "resolved";
};
function checkDraw(days, pots, country, kind) {
  const rounds = kind === "uecl" ? 6 : 8,
    ids = pots.flat();
  assert.equal(days.length, rounds);
  for (const day of days) {
    assert.equal(day.length, 18);
    assert.equal(new Set(day.flatMap((f) => [f.home, f.away])).size, 36);
  }
  for (const id of ids) {
    const games = days.flat().filter((f) => [f.home, f.away].includes(id));
    const opponents = games.map((f) => (f.home === id ? f.away : f.home));
    assert.equal(new Set(opponents).size, rounds);
    assert.equal(games.filter((f) => f.home === id).length, rounds / 2);
    const countries = opponents.map(country);
    assert(!countries.includes(country(id)));
    for (const c of new Set(countries))
      assert(countries.filter((x) => x === c).length <= 2);
    for (const pot of pots) {
      assert.equal(
        opponents.filter((x) => pot.includes(x)).length,
        kind === "uecl" ? 1 : 2,
      );
      if (kind !== "uecl")
        assert.equal(
          games.filter((f) => f.home === id && pot.includes(f.away)).length,
          1,
        );
    }
    if (kind === "uecl")
      for (let i = 0; i < 6; i += 2)
        assert.equal(
          games.filter(
            (f) =>
              f.home === id && [...pots[i], ...pots[i + 1]].includes(f.away),
          ).length,
          1,
        );
  }
}
test("200 seeded draws: opponents, associations, pots, balanced venues and one fixture per matchday", () => {
  for (const kind of ["ucl", "uecl"]) {
    const ids = Array.from({ length: 36 }, (_, i) => "c" + i),
      size = kind === "uecl" ? 6 : 9,
      pots = [];
    for (let i = 0; i < 36; i += size) pots.push(ids.slice(i, i + size));
    const country = (id) => "country" + (Number(id.slice(1)) % 9);
    for (let seed = 1; seed <= 100; seed++)
      checkDraw(
        drawLeaguePhase({ seed }, pots, country, kind),
        pots,
        country,
        kind,
      );
    assert.deepEqual(
      drawLeaguePhase({ seed: 88 }, pots, country, kind),
      drawLeaguePhase({ seed: 88 }, pots, country, kind),
    );
  }
});
test("Fresh access scenario assigns 108 distinct clubs, 36 each, without claiming official eligibility", () => {
  const s = game(),
    cups = s.expansion.cups.filter((c) => c.engine === "europe-v1");
  assert.equal(cups.length, 3);
  assert.equal(new Set(cups.flatMap((c) => c.entrants)).size, 108);
  assert(cups.every((c) => c.qualificationSource === "scenario-reputation"));
  assert(cups.every((c) => c.entrants.length === 36));
  validateSave(s);
});
test("Table applies away goals, opponents strength, discipline and model coefficients in order", () => {
  const c = {
    entrants: ["a", "b", "c", "d", "e"],
    coefficients: { a: 1, b: 1, c: 99, d: 1, e: 1 },
    fixtures: [],
  };
  const f = (home, away, h, v, discipline = 0) => ({
    stage: "league",
    played: true,
    home,
    away,
    homeGoals: h,
    awayGoals: v,
    homeDiscipline: discipline,
    awayDiscipline: 0,
  });
  c.fixtures = [f("a", "b", 1, 0), f("d", "c", 0, 1)];
  assert.equal(europeanTable(c)[0].clubId, "c");
  c.fixtures = [
    f("a", "b", 1, 0),
    f("c", "d", 1, 0),
    f("b", "e", 3, 0),
    f("d", "e", 1, 0),
  ];
  let rows = europeanTable(c);
  assert(
    rows.findIndex((r) => r.clubId === "a") <
      rows.findIndex((r) => r.clubId === "c"),
  );
  c.fixtures = [f("a", "b", 1, 0, 1), f("c", "d", 1, 0, 3)];
  assert.equal(europeanTable(c)[0].clubId, "a");
  c.fixtures[1].homeDiscipline = 1;
  assert.equal(europeanTable(c)[0].clubId, "c");
});
test("European progression: top eight, playoff bands, inherited bracket seeding, neutral final and idempotency", () => {
  for (const kind of ["ucl", "uecl"]) {
    const s = game(),
      c = s.expansion.cups.find((c) => c.kind === kind);
    let calls = 0,
      firstRank;
    while (!c.winner) {
      assert(calls++ < 30);
      s.date = c.nextDate;
      europeanDay(s, c, (s, f, after) => {
        f.homeGoals = 1;
        f.awayGoals = 0;
        after();
        f.played = true;
      });
      validateEuropeanCup(c, s);
      if (c.phase === "playoff" && !firstRank) {
        firstRank = [...c.ranking];
        assert.equal(c.alive.length, 24);
        assert.equal(c.ties.length, 8);
        for (const t of c.ties) {
          const seed = c.ranking.indexOf(t.b) + 1,
            other = c.ranking.indexOf(t.a) + 1;
          assert(seed >= 9 && seed <= 16);
          const g = Math.floor((seed - 9) / 2);
          assert([23 - g * 2, 24 - g * 2].includes(other));
        }
        assert(
          !c.ties.some(
            (t) =>
              c.ranking.slice(0, 8).includes(t.a) ||
              c.ranking.slice(0, 8).includes(t.b),
          ),
        );
      }
      if (c.phase === "r16") assert.equal(c.alive.length, 16);
      for (const t of c.ties.filter((t) => ["qf", "sf"].includes(t.stage))) {
        const previous = c.ties.filter(
          (x) => x.stage === (t.stage === "qf" ? "r16" : "qf"),
        );
        const seed = previous.find((x) => x.winner === t.b);
        const other = previous.find((x) => x.winner === t.a);
        assert(seed.pathSeed < other.pathSeed);
        assert.equal(t.pathSeed, seed.pathSeed);
      }
      const snapshot = JSON.stringify(c),
        cash = s.finance.cash,
        seed = s.seed;
      europeanDay(s, c, () => assert.fail("replayed same-day cup"));
      assert.equal(JSON.stringify(c), snapshot);
      assert.equal(s.finance.cash, cash);
      assert.equal(s.seed, seed);
    }
    assert.equal(c.fixtures.length, kind === "ucl" ? 189 : 153);
    assert.equal(c.ties.length, 23);
    assert.deepEqual(c.ranking, firstRank);
    const final = c.fixtures.find((f) => f.stage === "final");
    assert.equal(final.neutral, true);
    assert(
      c.fixtures.filter((f) => f.stage === "league").every((f) => !f.winner),
    );
    assert.equal(c.phase, "complete");
    assert.equal(s.expansion.champions[kind], c.winner);
  }
});
test("Tied aggregate goes to extra time regardless of away goals, shootout is separate from match goals", () => {
  let penalties = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const f = { home: "b", away: "a", homeGoals: 2, awayGoals: 0 };
    const winner = resolveExtraTime({ seed }, f, 3, 3);
    assert.equal(f.extraTime, true);
    assert.equal(f.homeGoals, 2 + f.extraHome);
    assert.equal(f.awayGoals, f.extraAway);
    assert(["a", "b"].includes(winner));
    if (f.penaltyWinner) {
      penalties++;
      assert.equal(f.extraHome, f.extraAway);
      assert.notEqual(f.penaltiesHome, f.penaltiesAway);
      assert.equal(winner, f.penaltyWinner);
    }
  }
  assert(penalties > 0);
});
test("Neutral final: no stadium ticket revenue, extra-time goals and appearance bonuses are booked once", () => {
  const s = game(),
    c = s.expansion.cups.find((c) => c.entrants.includes(s.clubId));
  const opponent = c.entrants.find((id) => id !== s.clubId);
  const f = {
    id: "neutral-test",
    round: 1,
    date: s.date,
    home: s.clubId,
    away: opponent,
    played: false,
    neutral: true,
    competition: "Final",
  };
  const own = s.players.filter((p) => p.clubId === s.clubId),
    beforeApps = own.reduce((n, p) => n + p.appearances, 0),
    beforeGoals = own.reduce((n, p) => n + p.goals, 0),
    table = [blankRow(f.home), blankRow(f.away)];
  matchDay(s, [f], table, {
    afterScore: () => {
      f.extraTime = true;
      f.homeGoals += 2;
    },
  });
  assert.equal(f.attendance, undefined);
  assert(!s.finance.ledger.some((e) => e.key === "neutral-test-tickets"));
  assert.equal(own.reduce((n, p) => n + p.appearances, 0) - beforeApps, 11);
  assert.equal(own.reduce((n, p) => n + p.goals, 0) - beforeGoals, f.homeGoals);
  const cash = s.finance.cash;
  matchDay(s, [f], table);
  assert.equal(s.finance.cash, cash);
});
test("Cup match pauses the week, appears in unified calendar and blocks commercial friendly", () => {
  const s = game();
  s.preferences.pauseMatches = true;
  let cupDay;
  for (let i = 0; i < 40; i++) {
    clear(s);
    const tomorrow = addDays(s.date, 1),
      next = ownFixtures(s).find(
        (f) => !f.played && f.date === tomorrow && f.competition,
      );
    if (next) {
      cupDay = next;
      break;
    }
    advanceTime(s, 1);
  }
  assert(cupDay);
  assert.throws(() => friendly(s));
  clear(s);
  const r = advanceTime(s, 7);
  assert.equal(r.advanced, 1);
  assert.equal(cupDay.played, true);
  assert(r.match || r.blocked);
  assert.equal(s.remainingDays, 6);
  assert(ownFixtures(s).some((f) => f.id === cupDay.id && f.played));
  const snapshot = JSON.stringify(s.expansion.cups);
  pyramidDay(s);
  assert.equal(JSON.stringify(s.expansion.cups), snapshot);
});
test("full-season integrated calendar: no club has official fixtures less than three days apart", () => {
  const s = game();
  s.preferences.pauseMatches = false;
  const complete = () =>
    s.expansion.cups.filter((c) => c.engine).every((c) => c.winner);
  let validated = 0,
    day = 0;
  for (; day < 320; day++) {
    clear(s);
    advanceTime(s, 1);
    if (day % 40 === 0) {
      validateSave(s);
      validated++;
    }
  }
  // The longest leagues (30 clubs) finish their 0.13 super cups just past day
  // 320; the season itself runs 365 days, so complete every cup first.
  for (; day < 400 && !complete(); day++) {
    clear(s);
    advanceTime(s, 1);
    if (day % 40 === 0) {
      validateSave(s);
      validated++;
    }
  }
  assert(complete());
  assert(validated >= 8);
  const grouped = new Map();
  for (const f of allFixtures(s)) {
    for (const club of [f.home, f.away]) {
      if (!grouped.has(club)) grouped.set(club, []);
      grouped.get(club).push(f);
    }
  }
  for (const fixtures of grouped.values()) {
    fixtures.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < fixtures.length; i++)
      assert(
        restGap(fixtures[i - 1].date, fixtures[i].date) >= 3,
        `${fixtures[i - 1].id} conflicts ${fixtures[i].id}`,
      );
  }
  assert(s.expansion.cups.filter((c) => c.engine).every((c) => c.winner));
  assert(
    s.expansion.cups.some((c) => c.id.startsWith("super-uefa") && c.winner),
  );
  const copy = JSON.parse(JSON.stringify(s));
  validateSave(copy);
  assert.equal(
    copy.fixtures,
    copy.expansion.divisions.find((d) => d.clubs.includes(copy.clubId))
      .fixtures,
  );
});
test("Import rejects corrupted draws, cup states, scores, coefficients and fixture dates", () => {
  const s = game();
  const mutations = [
    (c) => {
      c.fixtures[0].homeGoals = "<img>";
      c.fixtures[0].played = true;
    },
    (c) => (c.pots[0][0] = c.pots[0][1]),
    (c) => (c.fixtures[0].home = c.fixtures[0].away),
    (c) => (c.coefficients[c.entrants[0]] = "<script>"),
    (c) => (c.phase = "unknown"),
    (c) => (c.ranking = [c.entrants[0]]),
    (c) => (c.fixtures[0].date = "2026-02-31"),
    (c) => (c.qualification[0].domesticRank = "<svg>"),
    (c) => (c.engine = "invented"),
  ];
  for (const mutate of mutations) {
    const copy = structuredClone(s);
    mutate(copy.expansion.cups[0]);
    assert.throws(() => validateSave(copy));
  }
});
test("Schema four import keeps ongoing cups, player objects and finances unchanged; new format is deferred", () => {
  const s = game();
  s.version = 4;
  s.expansion.cups = s.expansion.cups.filter((c) => !c.engine);
  delete s.expansion.europeanFormatVersion;
  const players = structuredClone(s.players),
    cups = structuredClone(s.expansion.cups),
    finance = structuredClone(s.finance);
  const next = migrateSave(s);
  assert.equal(next.version, SAVE_VERSION);
  assert.equal(s.version, 4);
  assert.deepEqual(next.players, players);
  assert.deepEqual(next.finance, finance);
  assert.deepEqual(next.expansion.cups, cups);
  assert.equal(next.expansion.europeanFormatVersion, 1);
  validateSave(next);
});

test("Compact backup serialization preserves every field and remains valid", async () => {
  const { encodeSave } = await import("../src/services/save.js");
  const s = game();
  const compact = encodeSave(s);
  assert(compact.length < JSON.stringify(s, null, 2).length);
  const decoded = JSON.parse(compact);
  assert.deepEqual(decoded, JSON.parse(JSON.stringify(s)));
  validateSave(decoded);
});
