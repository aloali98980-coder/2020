import { addDays, random, clamp } from "../../core/utils.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { cupPriorityCalendar, availableDate } from "../calendar.js";
import { resolveExtraTime, resolvePenalties } from "../europe/engine.js";
import { post } from "../finance.js";
import { message } from "../inbox.js";
import { CONTINENTAL, policy, STAGE_NAMES } from "./presets.js";
import { qualify } from "./qualification.js";
import { groupDraw, shuffle, seededPairs } from "./draw.js";
import { groupTable, compareAcross } from "./table.js";
import { recordCupDraw } from "../cupDraw.js";
// 0.14 review: tiered prize factors (CAF/Libertadores keep the base table;
// domestic cups/supers pay a modeled fraction) + round-win cap below the final.
export const CONTINENTAL_PRIZE_FACTOR = {
  caf: 1,
  lib: 1,
  confed: 0.6,
  suda: 0.6,
  domestic: 0.4,
  "super-domestic": 0.25,
  "super-caf": 0.6,
  recopa: 0.8,
};
export function continentalPrize(kind, base) {
  return Math.round(base * (CONTINENTAL_PRIZE_FACTOR[kind] ?? 1));
}
export function continentalRoundPrize(kind, round) {
  return continentalPrize(kind, Math.min(600000 * round, 3000000));
}
export const ENGINE = "continental-v1";
export const penalties = resolvePenalties;
export function base(s, id, kind, name, entrants, extra = {}) {
  const c = {
    id: `${id}-s${s.seasonNumber}`,
    engine: ENGINE,
    kind,
    name,
    entrants: [...entrants],
    originalEntrants: [...entrants],
    alive: [...entrants],
    round: 0,
    phase: "groups",
    nextDate: addDays(s.date, 24),
    results: [],
    fixtures: [],
    ties: [],
    groups: [],
    pots: [],
    lots: {},
    qualification: [],
    qualificationSource:
      s.seasonNumber === 1 ? "scenario-reputation" : "saved-domestic-results",
    winner: null,
    finalists: [],
    byes: [],
    ...extra,
  };
  c.lots = Object.fromEntries(shuffle(s, entrants).map((id, i) => [id, i]));
  s.expansion.cups.push(c);
  return c;
}
export function fixture(s, c, calendar, home, away, earliest, extra = {}) {
  const f = {
    id: c.id + "-m" + c.fixtures.length,
    home,
    away,
    date: availableDate(calendar, home, away, earliest),
    round: c.round,
    played: false,
    competition: c.name,
    ...extra,
  };
  c.fixtures.push(f);
  calendar.reserve(f);
  s.expansion.calendarDirty = true;
  return f;
}
export function createContinentalCups(s) {
  for (const [kind, p] of Object.entries(CONTINENTAL)) {
    const excluded = p.exclude
      ? s.expansion.cups.find((c) => c.kind === p.exclude).entrants
      : [];
    const qualification = qualify(s, kind, excluded),
      ids = qualification.map((q) => q.clubId),
      draw = groupDraw(s, ids);
    const c = base(s, kind, kind, p.name, ids, {
      ...draw,
      qualification,
      tableRule: p.tableRule,
      format: `${ids.length} ناديًا · ${ids.length / 4} مجموعات · ذهاب وإياب · ${p.finalLegs === 2 ? "نهائي ذهاب وإياب" : "نهائي محايد واحد"}؛ التأهل والمقاعد والتواريخ والجوائز محاكاة`,
    });
    const calendar = cupPriorityCalendar(s),
      rounds = [
        [
          [0, 3],
          [1, 2],
        ],
        [
          [2, 0],
          [3, 1],
        ],
        [
          [0, 1],
          [2, 3],
        ],
      ];
    for (let round = 0; round < 6; round++)
      for (const g of c.groups)
        for (const [aa, bb] of rounds[round % 3]) {
          const [a, b] = round < 3 ? [aa, bb] : [bb, aa];
          fixture(
            s,
            c,
            calendar,
            g.clubs[a],
            g.clubs[b],
            addDays(s.date, 24 + round * 14),
            { stage: "groups", group: g.id, round: round + 1 },
          );
        }
    c.nextDate = c.fixtures.map((f) => f.date).sort()[0];
  }
}
export function createKnockout(
  s,
  {
    id,
    kind = "domestic",
    name,
    entrants,
    country,
    format,
    offset = 10,
    qualification = [],
  },
) {
  const ids = [...new Set(entrants)];
  if (ids.length < 2) return null;
  const c = base(s, id, kind, name, ids, {
    country,
    qualification,
    format:
      format ||
      "خروج مغلوب بين الأندية المتاحة؛ دخول الأندية والتقويم والجوائز محاكاة",
  });
  if (kind === "recopa") planPairs(s, c, "final", [[ids[1], ids[0]]], offset);
  else planKnockout(s, c, ids, offset);
  return c;
}
function stage(n) {
  return n === 2
    ? "final"
    : n === 4
      ? "sf"
      : n === 8
        ? "qf"
        : n === 16
          ? "r16"
          : "r" + n;
}
export function planPairs(s, c, phase, pairs, offset = 14, byes = []) {
  c.phase = phase;
  c.round++;
  c.byes = [...byes];
  c.alive = [...byes, ...pairs.flat()];
  if (phase === "final") c.finalists = pairs.flat();
  const calendar = cupPriorityCalendar(s),
    p = policy(c),
    legs =
      phase === "final"
        ? p.finalLegs
        : phase === "sf" && p.doubleSemi
          ? 2
          : p.legs;
  for (const [a, b] of pairs) {
    const tie = {
      id: c.id + "-t" + c.ties.length,
      stage: phase,
      round: c.round,
      a,
      b,
      legs: [],
      winner: null,
      aggregateA: 0,
      aggregateB: 0,
    };
    c.ties.push(tie);
    const f = fixture(s, c, calendar, a, b, addDays(s.date, offset), {
      stage: phase,
      tieId: tie.id,
      leg: 1,
      neutral:
        legs === 1 &&
        (p.neutralAll ||
          phase === "final" ||
          (p.neutralSemi && phase === "sf") ||
          c.kind === "super-domestic"),
    });
    tie.legs.push(f.id);
    if (legs === 2)
      tie.legs.push(
        fixture(s, c, calendar, b, a, addDays(f.date, 7), {
          stage: phase,
          tieId: tie.id,
          leg: 2,
          neutral: false,
        }).id,
      );
  }
  c.nextDate = c.fixtures
    .filter((f) => !f.played)
    .map((f) => f.date)
    .sort()[0];
  recordCupDraw(s, c, phase, pairs, byes);
}
function planKnockout(s, c, ids, offset = 14) {
  const shuffled = shuffle(s, ids),
    power = 2 ** Math.floor(Math.log2(ids.length));
  const matches = ids.length === power ? ids.length / 2 : ids.length - power,
    playing = shuffled.slice(0, matches * 2),
    byes = shuffled.slice(matches * 2);
  planPairs(
    s,
    c,
    stage(ids.length),
    Array.from({ length: matches }, (_, i) => playing.slice(i * 2, i * 2 + 2)),
    offset,
    byes,
  );
}
export function settleTie(s, c, t, f) {
  const games = t.legs.map((id) => c.fixtures.find((g) => g.id === id));
  const total = (id) =>
    games.reduce(
      (n, g) => n + (g.home === id ? g.homeGoals || 0 : g.awayGoals || 0),
      0,
    );
  t.aggregateA = total(t.a);
  t.aggregateB = total(t.b);
  if (f.id !== t.legs.at(-1)) return;
  if (games.some((g) => g !== f && !g.played))
    throw Error("الإياب سبق الذهاب.");
  const p = policy(c);
  let winner;
  if (t.aggregateA !== t.aggregateB)
    winner = t.aggregateA > t.aggregateB ? t.a : t.b;
  else if (p.awayGoals && games.length === 2) {
    const a = games
        .filter((g) => g.away === t.a)
        .reduce((n, g) => n + g.awayGoals, 0),
      b = games
        .filter((g) => g.away === t.b)
        .reduce((n, g) => n + g.awayGoals, 0);
    if (a !== b) {
      winner = a > b ? t.a : t.b;
      f.decidedBy = "away-goals";
    }
  }
  if (!winner) {
    f.regulationHome = f.homeGoals;
    f.regulationAway = f.awayGoals;
    const extra =
      p.extraTime ||
      (t.stage === "final" && p.finalExtraTime) ||
      c.kind === "domestic";
    winner = extra
      ? resolveExtraTime(s, f, t.aggregateA, t.aggregateA)
      : penalties(s, f);
    f.decidedBy = f.penaltyWinner ? "penalties" : "extra-time";
  }
  t.winner = winner;
  f.winner = winner;
  t.aggregateA = total(t.a);
  t.aggregateB = total(t.b);
}
function finish(s, c) {
  c.winner = c.alive[0];
  c.phase = "complete";
  c.finished = s.date;
  c.nextDate = s.date;
  if (CONTINENTAL[c.kind]) s.expansion.champions[c.kind] = c.winner;
  if (c.kind === "domestic") {
    s.expansion.domesticHonours ??= {};
    s.expansion.domesticHonours[c.country] = {
      winner: c.winner,
      runnerUp: c.finalists.find((id) => id !== c.winner),
      season: s.seasonNumber,
    };
  }
  if (c.winner === s.clubId) {
    s.reputation = clamp(s.reputation + 3, 0, 100);
    message(s, {
      title: "بطل " + c.name,
      body: "سُجل اللقب في تاريخ النادي. التأهل والجوائز والتقويم سيناريو محاكاة، لا أرقام رسمية.",
      category: "matches",
    });
  }
}
function groupProgress(s, c) {
  const ranks = c.groups.map((g) => groupTable(c, g));
  c.groupRanking = ranks.map((rs) => rs.map((r) => r.clubId));
  c.direct = ranks.map((rs) => rs[0].clubId);
  c.runners = ranks.map((rs) => rs[1].clubId);
  c.thirds = ranks.map((rs) => rs[2].clubId);
  c.groupsFinished = s.date;
  if (c.kind === "suda") {
    c.alive = [...c.direct, ...c.runners];
    c.phase = "waiting";
    c.nextDate = addDays(s.date, 1);
    return;
  }
  const groupOf = Object.fromEntries(
    c.groups.flatMap((g) => g.clubs.map((id) => [id, g.id])),
  );
  c.knockoutRanking = [
    ...ranks.map((rs) => rs[0]).sort(compareAcross),
    ...ranks.map((rs) => rs[1]).sort(compareAcross),
  ].map((r) => r.clubId);
  planPairs(
    s,
    c,
    c.direct.length === 4 ? "qf" : "r16",
    seededPairs(s, c.direct, c.runners, c.kind === "lib" ? {} : groupOf),
  );
}
function awaitFeed(s, c) {
  const source = s.expansion.cups.find(
    (x) => x.kind === "lib" && x.engine === ENGINE,
  );
  if (!source?.groupRanking) {
    c.nextDate = addDays(s.date, 1);
    return;
  }
  const rs = c.groups.map((g) => groupTable(c, g)[1]).sort(compareAcross),
    ts = source.groups.map((g) => groupTable(source, g)[2]).sort(compareAcross);
  c.imports = ts.map((r) => r.clubId);
  c.entrants.push(...c.imports);
  c.feedSource = source.id;
  for (const id of c.imports)
    c.qualification.push({
      clubId: id,
      country: extendedClub(id).country,
      domesticRank: 0,
      reason: "libertadores-third",
    });
  planPairs(
    s,
    c,
    "playoff",
    rs.map((r, i) => [ts[ts.length - 1 - i].clubId, r.clubId]),
  );
  c.alive.push(...c.direct); // Direct winners wait; they are not in these ties.
  if (c.imports.includes(s.clubId))
    message(s, {
      title: "انتقلت إلى سودأمريكانا",
      body: "المركز الثالث في مجموعة ليبرتادوريس منحك مواجهة ملحق من ذهاب وإياب أمام وصيف مجموعة سودأمريكانا.",
      category: "matches",
    });
}
export function competitionDay(s, c, simulate) {
  if (c.winner) return;
  if (c.phase === "waiting") {
    awaitFeed(s, c);
    return;
  }
  for (const f of c.fixtures.filter((f) => !f.played && f.date === s.date)) {
    const tie = f.tieId ? c.ties.find((t) => t.id === f.tieId) : null;
    simulate(s, f, () => {
      if (f.stage === "groups") {
        f.homeReds = random(s) < 0.06 ? 1 : 0;
        f.awayReds = random(s) < 0.06 ? 1 : 0;
        f.homeYellows = Math.floor(random(s) * 5);
        f.awayYellows = Math.floor(random(s) * 5);
      } else settleTie(s, c, tie, f);
    });
    if ([f.home, f.away].includes(s.clubId) && f.stage === "groups") {
      const a = f.home === s.clubId ? f.homeGoals : f.awayGoals,
        b = f.home === s.clubId ? f.awayGoals : f.homeGoals;
      post(
        s,
        continentalPrize(c.kind, a > b ? 400000 : a === b ? 150000 : 0),
        "cup-prize",
        "جائزة مجموعات تقديرية — " + c.name,
        f.id + "-group-prize",
      );
    }
    if (tie?.winner && tie.winner === s.clubId)
      post(
        s,
        tie.stage === "final"
          ? continentalPrize(c.kind, 3500000)
          : continentalRoundPrize(c.kind, c.round),
        "cup-prize",
        "جائزة تأهل تقديرية — " + c.name,
        tie.id + "-prize",
      );
    if (tie?.winner && [tie.a, tie.b].includes(s.clubId))
      message(s, {
        title: (tie.winner === s.clubId ? "تأهل / تتويج: " : "خروج: ") + c.name,
        body: `${STAGE_NAMES[tie.stage] || tie.stage} · مجموع ${tie.aggregateA}–${tie.aggregateB}${f.decidedBy === "away-goals" ? "؛ حُسم بأهداف خارج الأرض." : f.penaltyWinner ? "؛ حُسم بالترجيح." : "."}`,
        category: "matches",
      });
  }
  const pending = c.fixtures.filter((f) => !f.played);
  if (pending.length) {
    c.nextDate = pending.map((f) => f.date).sort()[0];
    return;
  }
  if (c.phase === "groups") {
    groupProgress(s, c);
    return;
  }
  const winners = c.ties
    .filter((t) => t.round === c.round)
    .map((t) => t.winner);
  if (winners.some((id) => !id)) throw Error("مواجهة إقصائية غير محسومة.");
  if (c.phase === "playoff") {
    c.knockoutRanking = [
      ...c.groups
        .map((g) => groupTable(c, g)[0])
        .sort(compareAcross)
        .map((r) => r.clubId),
      ...winners,
    ];
    planPairs(s, c, "r16", seededPairs(s, c.direct, winners));
    return;
  }
  c.alive = [...c.byes, ...winners];
  if (c.alive.length === 1) {
    finish(s, c);
    return;
  }
  // Fixed winner paths in continental cups, a fresh modeled draw in domestic cups.
  if (c.kind === "domestic") planKnockout(s, c, c.alive, 21);
  else {
    const south = ["lib", "suda"].includes(c.kind);
    const pairs = Array.from({ length: c.alive.length / 2 }, (_, i) =>
      south
        ? [c.alive[i], c.alive[c.alive.length - 1 - i]]
        : c.alive.slice(i * 2, i * 2 + 2),
    );
    if (south)
      for (const pair of pairs)
        pair.sort((a, b) =>
          c.alive.length > 2
            ? c.knockoutRanking.indexOf(b) - c.knockoutRanking.indexOf(a)
            : c.knockoutRanking.indexOf(a) - c.knockoutRanking.indexOf(b),
        );
    planPairs(s, c, stage(c.alive.length), pairs);
  }
}
