import { extendedClub } from "../../data/expandedCatalog.js";
import { addDays, random, clamp } from "../../core/utils.js";
import { post } from "../finance.js";
import { message } from "../inbox.js";
import {
  availableDate,
  inInternationalWindow,
  cupPriorityCalendar,
} from "../calendar.js";
import { drawLeaguePhase, shuffled } from "./draw.js";
import { europeanTable } from "./table.js";
// 0.14 review: tiered prize factors (UCL keeps the base table).
export const EUROPE_PRIZE_FACTOR = { ucl: 1, uel: 0.5, uecl: 0.25 };
export function europePrize(kind, base) {
  return Math.round(base * (EUROPE_PRIZE_FACTOR[kind] ?? 1));
}
export const EUROPE_KO_PRIZE = {
  playoff: 1000000,
  r16: 1600000,
  qf: 2400000,
  sf: 3500000,
  final: 5500000,
};
export function europeTiePrize(kind, stage) {
  return europePrize(kind, EUROPE_KO_PRIZE[stage]);
}
export const EUROPEAN_COUNTRIES = [
  "en",
  "es",
  "de",
  "it",
  "fr",
  "pt",
  "nl",
  "be",
  "tr",
  "sc",
  "gr",
  "at",
  "ch",
  "dk",
  "se",
  "no",
  "pl",
  "cz",
  "hr",
  "rs",
  "ro",
  "ua",
  "hu",
];
export const EUROPEAN_NAMES = {
  ucl: "UEFA Champions League",
  uel: "UEFA Europa League",
  uecl: "UEFA Conference League",
};
export const STAGES = {
  league: "مرحلة الدوري",
  playoff: "ملحق التأهل",
  r16: "ثمن النهائي",
  qf: "ربع النهائي",
  sf: "نصف النهائي",
  final: "النهائي",
  complete: "اكتملت",
};
export function createEuropeanCups(s) {
  const x = s.expansion;
  const countries = EUROPEAN_COUNTRIES.filter((country) =>
    x.divisions.some((d) => d.country === country && d.tier === 1),
  );
  // Scenario access list: one place per available association, extra places follow this fixed modeled priority.
  // No qualifying rounds, titleholder entry exceptions, real association coefficients or performance slots.
  const seats = Object.fromEntries(countries.map((c) => [c, 1]));
  for (let i = 0, n = 36 - countries.length; n > 0; i++, n--)
    seats[countries[i % countries.length]]++;
  const used = new Set(),
    cups = [];
  for (const kind of ["ucl", "uel", "uecl"]) {
    const entrants = [],
      qualification = [];
    for (const country of countries) {
      const division = x.divisions.find(
          (d) => d.country === country && d.tier === 1,
        ),
        order = x.qualification[country] || division.clubs;
      const available = order.filter(
        (id) => division.clubs.includes(id) && !used.has(id),
      );
      const chosen = available.slice(0, seats[country]);
      if (chosen.length !== seats[country])
        throw Error("أندية غير كافية لتكوين قائمة التأهل الأوروبية.");
      for (const id of chosen) {
        used.add(id);
        entrants.push(id);
        qualification.push({
          clubId: id,
          country,
          domesticRank: order.indexOf(id) + 1,
        });
      }
    }
    const coefficients = Object.fromEntries(
      entrants.map((id) => [
        id,
        Math.round(
          (x.europeanCoefficients?.[id] ?? extendedClub(id).rep * 10) * 100,
        ) / 100,
      ]),
    );
    // Club ID is the final deterministic tie-break; these are not official coefficients.
    const seeded = [...entrants].sort(
      (a, b) => coefficients[b] - coefficients[a] || a.localeCompare(b),
    );
    const size = kind === "uecl" ? 6 : 9,
      pots = [];
    while (seeded.length) pots.push(seeded.splice(0, size));
    const c = {
      id: kind + "-s" + s.seasonNumber,
      kind,
      engine: "europe-v1",
      name: EUROPEAN_NAMES[kind],
      round: 0,
      entrants,
      alive: [...entrants],
      nextDate: s.date,
      results: [],
      winner: null,
      format: "36 ناديًا · دوري ثم ملحق وذهاب وإياب · نهائي محايد",
      phase: "league",
      pots,
      coefficients,
      qualification,
      qualificationSource:
        s.seasonNumber === 1 ? "scenario-reputation" : "saved-standings",
      fixtures: [],
      ties: [],
      ranking: [],
    };
    const days = drawLeaguePhase(
      s,
      pots,
      (id) => extendedClub(id).country,
      kind,
    );
    let previous = s.date;
    for (const [i, games] of days.entries()) {
      let when = addDays(s.date, [14, 28, 42, 56, 70, 84, 112, 126][i]);
      while (inInternationalWindow(when) || when <= previous)
        when = addDays(when, 1);
      previous = when;
      for (const [j, f] of games.entries())
        c.fixtures.push({
          ...f,
          id: `${c.id}-league-${i + 1}-${j}`,
          date: when,
          stage: "league",
          played: false,
          competition: c.name,
        });
    }
    c.nextDate = c.fixtures[0].date;
    cups.push(c);
  }
  return cups;
}
export function resolveExtraTime(s, f, aggregateHome, aggregateAway) {
  if (aggregateHome !== aggregateAway)
    return aggregateHome > aggregateAway ? f.home : f.away;
  f.extraTime = true;
  f.extraHome = 0;
  f.extraAway = 0;
  const a = s.expansion?.powers?.[f.home] || 60,
    b = s.expansion?.powers?.[f.away] || 60;
  for (let i = 0; i < 3; i++) {
    if (random(s) < clamp(0.14 + (a - b) / 450, 0.04, 0.3)) f.extraHome++;
    if (random(s) < clamp(0.14 + (b - a) / 450, 0.04, 0.3)) f.extraAway++;
  }
  f.homeGoals += f.extraHome;
  f.awayGoals += f.extraAway;
  if (f.extraHome !== f.extraAway)
    return f.extraHome > f.extraAway ? f.home : f.away;
  return resolvePenalties(s, f);
}
// Shared shootout: stops once the trailing side cannot catch up.
export function resolvePenalties(s, f) {
  const a = s.expansion?.powers?.[f.home] || 60,
    b = s.expansion?.powers?.[f.away] || 60;
  let h = 0,
    v = 0;
  const hp = clamp(0.75 + (a - b) / 350, 0.6, 0.9),
    ap = clamp(0.75 + (b - a) / 350, 0.6, 0.9);
  let done = false;
  for (let kick = 0; kick < 5; kick++) {
    if (random(s) < hp) h++;
    if (h > v + (5 - kick) || v > h + (4 - kick)) {
      done = true;
      break;
    }
    if (random(s) < ap) v++;
    if (h > v + (4 - kick) || v > h + (4 - kick)) {
      done = true;
      break;
    }
  }
  if (!done && h === v) {
    for (let pair = 0; pair < 25 && h === v; pair++) {
      if (random(s) < hp) h++;
      if (random(s) < ap) v++;
    }
    if (h === v) {
      if (random(s) < 0.5) h++;
      else v++;
    }
  }
  f.penaltiesHome = h;
  f.penaltiesAway = v;
  f.penaltyWinner = h > v ? f.home : f.away;
  return f.penaltyWinner;
}
function planTie(s, c, stage, a, b, pathSeed, nominal, calendar) {
  const id = `${c.id}-${stage}-${c.ties.filter((t) => t.stage === stage).length}`;
  const tie = { id, stage, a, b, pathSeed, legs: [], winner: null };
  // b is the seeded club, and therefore hosts the return leg; the final is neutral.
  const first = {
    id: id + "-1",
    round: c.round + 1,
    stage,
    date: availableDate(calendar, a, b, nominal),
    home: a,
    away: b,
    played: false,
    competition: c.name,
    tieId: id,
    leg: 1,
    neutral: stage === "final",
  };
  tie.legs.push(first.id);
  c.fixtures.push(first);
  calendar.reserve(first);
  if (stage !== "final") {
    const second = {
      ...first,
      id: id + "-2",
      date: availableDate(calendar, a, b, addDays(first.date, 7)),
      home: b,
      away: a,
      leg: 2,
      neutral: false,
    };
    tie.legs.push(second.id);
    c.fixtures.push(second);
    calendar.reserve(second);
  }
  c.ties.push(tie);
  return tie;
}
function stagePlan(s, c, stage) {
  const calendar = cupPriorityCalendar(s),
    nominal = addDays(s.date, 14);
  s.expansion.calendarDirty = true;
  c.phase = stage;
  c.round++;
  if (stage === "playoff") {
    for (let group = 0; group < 4; group++) {
      const seeds = shuffled(s, c.ranking.slice(8 + group * 2, 10 + group * 2)),
        others = shuffled(s, c.ranking.slice(22 - group * 2, 24 - group * 2));
      for (let i = 0; i < 2; i++) {
        const t = planTie(
          s,
          c,
          stage,
          others[i],
          seeds[i],
          9 + group * 2 + i,
          nominal,
          calendar,
        );
        t.band = group;
        t.side = i;
      }
    }
  } else if (stage === "r16") {
    const slots = [];
    for (let group = 0; group < 4; group++) {
      const seeds = shuffled(s, c.ranking.slice(group * 2, group * 2 + 2));
      const positions = [
        [0, 4],
        [2, 6],
        [3, 7],
        [1, 5],
      ][group];
      for (let i = 0; i < 2; i++) {
        const p = c.ties.find(
          (t) => t.stage === "playoff" && t.band === 3 - group && t.side === i,
        );
        slots[positions[i]] = {
          a: p.winner,
          b: seeds[i],
          seed: c.ranking.indexOf(seeds[i]) + 1,
        };
      }
    }
    for (const t of slots)
      planTie(s, c, stage, t.a, t.b, t.seed, nominal, calendar);
  } else {
    const previous = { qf: "r16", sf: "qf", final: "sf" }[stage],
      ties = c.ties.filter((t) => t.stage === previous);
    for (let i = 0; i < ties.length; i += 2) {
      let a = ties[i],
        b = ties[i + 1];
      if (stage !== "final" && a.pathSeed < b.pathSeed) [a, b] = [b, a];
      planTie(
        s,
        c,
        stage,
        a.winner,
        b.winner,
        Math.min(a.pathSeed, b.pathSeed),
        nominal,
        calendar,
      );
    }
  }
  c.nextDate = c.fixtures
    .filter((f) => !f.played)
    .map((f) => f.date)
    .sort()[0];
  if (c.alive.includes(s.clubId))
    message(s, {
      title: c.name + " — " + STAGES[stage],
      body: "أُضيفت القرعة والمواعيد إلى جدول ناديك. الذهاب والإياب يُحسمان بمجموع الأهداف دون أفضلية الهدف خارج الأرض. التواريخ ومبالغ الجوائز محاكاة.",
      category: "matches",
    });
}
export function europeanDay(s, c, simulate) {
  if (c.winner || c.nextDate > s.date) return;
  for (const f of c.fixtures.filter((f) => !f.played && f.date === s.date)) {
    const tie = f.tieId ? c.ties.find((t) => t.id === f.tieId) : null;
    simulate(s, f, () => {
      f.regulationHome = f.homeGoals;
      f.regulationAway = f.awayGoals;
      if (f.stage === "league") {
        f.homeDiscipline =
          Math.floor(random(s) * 5) + (random(s) < 0.08 ? 3 : 0);
        f.awayDiscipline =
          Math.floor(random(s) * 5) + (random(s) < 0.08 ? 3 : 0);
        return;
      }
      if (tie.legs.at(-1) !== f.id) return;
      let ah = f.homeGoals,
        av = f.awayGoals;
      if (tie.legs.length === 2) {
        const first = c.fixtures.find((g) => g.id === tie.legs[0]);
        ah += first.awayGoals;
        av += first.homeGoals;
      }
      tie.winner = resolveExtraTime(s, f, ah, av);
      f.winner = tie.winner;
      tie.aggregateA = c.fixtures
        .filter((g) => tie.legs.includes(g.id))
        .reduce(
          (n, g) => n + (g.home === tie.a ? g.homeGoals : g.awayGoals),
          0,
        );
      tie.aggregateB = c.fixtures
        .filter((g) => tie.legs.includes(g.id))
        .reduce(
          (n, g) => n + (g.home === tie.b ? g.homeGoals : g.awayGoals),
          0,
        );
    });
    if ([f.home, f.away].includes(s.clubId) && f.stage === "league") {
      const own = f.home === s.clubId ? f.homeGoals : f.awayGoals,
        opp = f.home === s.clubId ? f.awayGoals : f.homeGoals;
      post(
        s,
        europePrize(c.kind, own > opp ? 600000 : own === opp ? 200000 : 0),
        "cup-prize",
        "جائزة أوروبية تقديرية — " + c.name,
        f.id + "-prize",
      );
    }
    if (tie?.winner && [tie.a, tie.b].includes(s.clubId)) {
      if (tie.winner === s.clubId)
        post(
          s,
          europeTiePrize(c.kind, tie.stage),
          "cup-prize",
          "تأهل أوروبي — مبالغ محاكاة",
          tie.id + "-prize",
        );
      message(s, {
        title: (tie.winner === s.clubId ? "تأهل / تتويج: " : "خروج: ") + c.name,
        body: `${STAGES[tie.stage]} · مجموع الأهداف ${extendedClub(tie.a).name} ${tie.aggregateA}–${tie.aggregateB} ${extendedClub(tie.b).name}.${f.penaltyWinner ? " حُسمت بركلات الترجيح." : ""}`,
        category: "matches",
      });
    }
  }
  const unplayed = c.fixtures.filter((f) => !f.played);
  if (unplayed.length) {
    c.nextDate = unplayed.map((f) => f.date).sort()[0];
    return;
  }
  if (c.phase === "league") {
    c.ranking = europeanTable(c).map((r) => r.clubId);
    c.alive = c.ranking.slice(0, 24);
    if (c.entrants.includes(s.clubId)) {
      const rank = c.ranking.indexOf(s.clubId) + 1;
      message(s, {
        title: c.name + " — نهاية مرحلة الدوري",
        body: `مركزك ${rank}: ${rank <= 8 ? "تأهل مباشر لثمن النهائي" : rank <= 24 ? "إلى ملحق التأهل" : "خروج دون انتقال لبطولة أوروبية أخرى"}.`,
        category: "matches",
      });
    }
    stagePlan(s, c, "playoff");
  } else if (c.phase === "final") {
    c.winner = c.ties.find((t) => t.stage === "final").winner;
    c.alive = [c.winner];
    c.phase = "complete";
    s.expansion.champions[c.kind] = c.winner;
    if (c.winner === s.clubId) {
      s.reputation = clamp(s.reputation + 3, 0, 100);
      message(s, {
        title: "بطل " + c.name,
        body: "سُجل اللقب في موسمك. المشاركون والمعاملات والجوائز والتقويم محاكاة وليست بيانات UEFA الرسمية.",
        category: "matches",
      });
    }
  } else {
    const winners = c.ties
      .filter((t) => t.stage === c.phase)
      .map((t) => t.winner);
    c.alive =
      c.phase === "playoff" ? [...c.ranking.slice(0, 8), ...winners] : winners;
    stagePlan(
      s,
      c,
      { playoff: "r16", r16: "qf", qf: "sf", sf: "final" }[c.phase],
    );
  }
}
export function updateEuropeanCoefficients(s) {
  const x = s.expansion;
  const previous = x.europeanCoefficients || {};
  x.europeanCoefficients = Object.fromEntries(
    Object.entries(previous).map(([id, value]) => {
      const base = extendedClub(id).rep * 10;
      return [
        id,
        Math.round((base + Math.max(0, value - base) * 0.8) * 100) / 100,
      ];
    }),
  );
  for (const c of x.cups.filter((c) => c.engine === "europe-v1"))
    for (const r of europeanTable(c)) {
      const bonuses = c.ties.filter((t) => t.winner === r.clubId).length * 6,
        base = extendedClub(r.clubId).rep * 10;
      x.europeanCoefficients[r.clubId] =
        Math.round(
          (base +
            Math.max(0, r.coefficient - base) * 0.8 +
            r.points * 2 +
            bonuses) *
            100,
        ) / 100;
    }
}
