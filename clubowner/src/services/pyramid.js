import { createAsianCups, asiaDay, ASIA_ENGINE } from "./asia/engine.js";
import { recordAsianSeason } from "./asia/access.js";
import {
  createConcacafCups,
  concacafDay,
  CONCACAF_ENGINE,
} from "./concacaf/engine.js";
import { recordConcacafSeason } from "./concacaf/access.js";
import { createFifaCups, fifaDay, FIFA_ENGINE } from "./fifa/engine.js";
import { recordFifaSeason, afcEligible } from "./fifa/access.js";
import {
  createContinentalCups,
  competitionDay,
  ENGINE as CUP_ENGINE,
} from "./competitions/engine.js";
import { createDomestic, superCupsDay } from "./competitions/domestic.js";
import { currentReserveRules } from "./promotionRules.js";
import { marketOpen, teamPower } from "./market.js";
import { reservedSquadSize } from "./employment.js";
import { paySponsorBonuses } from "./sponsors.js";
import { rankLeague } from "./leagueTable.js";
import { promotionDay, promotionMoves } from "./promotion.js";
import {
  createEuropeanCups,
  europeanDay,
  updateEuropeanCoefficients,
  resolveExtraTime,
} from "./europe/engine.js";
import { europeanTable } from "./europe/table.js";
import {
  availableDate,
  rebalanceLeagueCalendar,
  cupPriorityCalendar,
} from "./calendar.js";
import { DIVISIONS, extendedClub } from "../data/expandedCatalog.js";
import { generatedSquad, generatedPlayer } from "../models/generatedPlayers.js";
import { addDays, random, clamp } from "../core/utils.js";
import { matchDay } from "./matches.js";
import { post } from "./finance.js";
import { message } from "./inbox.js";
import { initCommerce } from "./commerce.js";
import { initManagement } from "./clubManagement.js";
import { endSeasonBoardReview, startSeasonMandate } from "./boardMandate.js";
import { politicalSeasonEnd } from "./politics/campaign.js";
import { associationSeasonEnd } from "./politics/associationFinance.js";
import { reconcilePoliticalMap } from "./politics/state.js";
const EUROPE = [
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
  "ru",
  "hu",
];
const AFRICA = ["eg", "ma", "tn", "dz", "za"];
const ASIA = ["sa", "qa", "ae", "jp", "kr", "cn", "au", "in", "th"];
const SOUTH = ["br", "ar", "uy", "co", "cl", "ec", "py", "pe", "bo", "ve"];
export const blankRow = (clubId) => ({
  clubId,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  gf: 0,
  ga: 0,
  points: 0,
});
export const standings = rankLeague;
const inWindow = (date) =>
  ["03-20", "06-01", "09-05", "11-10"].some(
    (start) =>
      date.slice(5) >= start &&
      date.slice(5) <= addDays(date.slice(0, 4) + "-" + start, 10).slice(5),
  );
export function leagueSchedule(ids, start, prefix) {
  let order = [...ids];
  if (order.length % 2) order.push(null);
  const first = [];
  let when = start;
  const interval = Math.min(
    7,
    Math.max(3, Math.floor(315 / ((order.length - 1) * 2))),
  );
  for (let r = 0; r < order.length - 1; r++) {
    when = addDays(when, interval);
    while (inWindow(when)) when = addDays(when, 1);
    for (let i = 0; i < order.length / 2; i++) {
      let a = order[i],
        b = order[order.length - 1 - i];
      if (!a || !b) continue;
      if (r % 2) [a, b] = [b, a];
      first.push({
        id: `${prefix}-${r}-${i}`,
        round: r + 1,
        date: when,
        home: a,
        away: b,
        played: false,
      });
    }
    order = [order[0], order.at(-1), ...order.slice(1, -1)];
  }
  const second = [];
  for (let r = 1; r < order.length; r++) {
    when = addDays(when, interval);
    while (inWindow(when)) when = addDays(when, 1);
    for (const f of first.filter((f) => f.round === r))
      second.push({
        ...f,
        id: f.id + "-return",
        round: r + order.length - 1,
        home: f.away,
        away: f.home,
        date: when,
      });
  }
  return [...first, ...second];
}
export function ownDivision(s) {
  return s.expansion?.divisions.find((d) => d.clubs.includes(s.clubId));
}
export function initPyramid(s) {
  const divisions = DIVISIONS.filter(
    (d) =>
      (d.tier === 1 || s.leagues.includes(d.country)) && d.clubs.length >= 4,
  ).map((d) => ({
    ...d,
    clubs: [...d.clubs],
    tieBreak: d.country === "eg" && d.tier > 1 ? "head-to-head" : undefined,
    table: d.clubs.map(blankRow),
    fixtures: leagueSchedule(d.clubs, s.date, d.id + "-s1"),
  }));
  s.expansion = {
    schema: 1,
    promotionVersion: 2,
    competitionVersion: 1,
    fifaVersion: 1,
    asiaVersion: 1,
    concacafVersion: 1,
    domesticHonours: {},
    clubRules: currentReserveRules(divisions),
    playoffs: [],
    europeanFormatVersion: 1,
    divisions,
    cups: [],
    champions: {},
    history: [],
    budgets: Object.fromEntries(
      divisions
        .flatMap((d) => d.clubs)
        .map((id) => [id, extendedClub(id)?.cash || 50000000]),
    ),
    aiTransfers: [],
    lastRollover: s.date,
    qualification: Object.fromEntries(
      divisions
        .filter((d) => d.tier === 1)
        .map((d) => [
          d.country,
          [...d.clubs].sort(
            (a, b) => extendedClub(b).rep - extendedClub(a).rep,
          ),
        ]),
    ),
  };
  // A reclassified real club keeps its imported roster; never duplicate its players.
  const squadCounts = new Map();
  for (const p of s.players)
    squadCounts.set(p.clubId, (squadCounts.get(p.clubId) || 0) + 1);
  for (const d of divisions.filter((d) => s.leagues.includes(d.country)))
    for (const id of d.clubs) {
      const count = squadCounts.get(id) || 0;
      if (count < 22)
        s.players.push(
          ...generatedSquad(extendedClub(id), s.date, s.seed).slice(count, 22),
        );
    }
  if (s.players.length > 49000)
    throw Error(
      "اختيار الأسواق يتجاوز سعة القاعدة الحالية؛ قلل الأسواق المحملة.",
    );
  const own = ownDivision(s);
  if (!own) throw Error("لم تتوفر بطولة النادي.");
  s.fixtures = own.fixtures;
  s.table = own.table;
  s.nextSeasonDate = addDays(s.date, 365);
  initCommerce(s);
  initManagement(s);
  createCups(s);
}
function topCandidates(s, countries, rank = 0, eligible = () => true) {
  return s.expansion.divisions
    .filter((d) => d.tier === 1 && countries.includes(d.country))
    .map(
      (d) =>
        (
          s.expansion.qualification[d.country] ||
          standings(d).map((t) => t.clubId)
        ).filter(eligible)[rank],
    )
    .filter(Boolean);
}
function createCup(s, id, name, clubs, offset = 10) {
  const unique = [...new Set(clubs)];
  if (unique.length < 2) return;
  s.expansion.cups.push({
    id: id + "-s" + s.seasonNumber,
    name,
    round: 0,
    entrants: unique,
    alive: unique,
    nextDate: addDays(s.date, offset),
    results: [],
    winner: null,
    format:
      id === "super-uefa"
        ? "مباراة واحدة على ملعب محايد — مواعيد وجوائز محاكاة"
        : "خروج مغلوب مبسّط — ليست اللائحة الرسمية",
  });
}
function createCups(s) {
  s.expansion.cups = [];
  s.expansion.cups.push(...createEuropeanCups(s));
  for (const country of [
    ...new Set(s.expansion.divisions.map((d) => d.country)),
  ])
    if (!(s.expansion.competitionVersion && createDomestic(s, country)))
      createCup(
        s,
        "cup-" + country,
        country === "en"
          ? "FA Cup"
          : country === "eg"
            ? "كأس مصر"
            : "كأس " + country,
        s.expansion.divisions
          .filter((d) => d.country === country)
          .flatMap((d) => d.clubs),
      );
  const pools = [
    ["caf", "CAF Champions League", AFRICA, 0],
    ["confed", "CAF Confederation Cup", AFRICA, 1],
    ["afc", "AFC Champions League Elite", ASIA, 0],
    ["lib", "Copa Libertadores", SOUTH, 0],
    ["concacaf", "CONCACAF Champions Cup", ["us", "mx"], 0],
  ];
  if (s.expansion.competitionVersion) createContinentalCups(s);
  if (s.expansion.asiaVersion) createAsianCups(s);
  if (s.expansion.concacafVersion) createConcacafCups(s);
  for (const [id, name, regions, rank] of pools)
    if (!(
      (s.expansion.competitionVersion &&
        ["caf", "confed", "lib"].includes(id)) ||
      (s.expansion.asiaVersion && id === "afc") ||
      (s.expansion.concacafVersion && id === "concacaf")
    ))
      createCup(
        s,
        id,
        name,
        topCandidates(
          s,
          regions,
          rank,
          (clubId) =>
            id !== "afc" || !s.expansion.fifaVersion || afcEligible(clubId),
        ),
        24,
      );
  if (s.expansion.fifaVersion) createFifaCups(s);
  else {
    // Initial season: transparent reputation-based scenario seeds. Later champions earn these spots.
    const regions = [EUROPE, AFRICA, ASIA, SOUTH, ["us", "mx"]];
    const seeds = regions
      .map(
        (r) =>
          topCandidates(s, r).sort(
            (a, b) => extendedClub(b).rep - extendedClub(a).rep,
          )[0],
      )
      .filter(Boolean);
    const champions = (
      s.expansion.competitionVersion
        ? ["ucl", "caf", "afc", "lib", "concacaf"]
            .map((k) => s.expansion.champions[k])
            .filter(Boolean)
        : Object.values(s.expansion.champions)
    ).filter((id) => s.expansion.divisions.some((d) => d.clubs.includes(id)));
    createCup(
      s,
      "intercontinental",
      "FIFA Intercontinental Cup",
      champions.length >= 2 ? champions : seeds,
      285,
    );
    if ((s.seasonNumber - 1) % 4 === 0)
      createCup(
        s,
        "clubworld",
        "FIFA Club World Cup",
        champions.length >= 2 ? champions : seeds,
        300,
      );
  }
  for (const c of s.expansion.cups.filter((c) => !c.engine))
    prepareLegacyRound(s, c);
  rebalanceLeagueCalendar(s);
}
function backgroundResult(s, f, d, afterScore) {
  const a = s.expansion.powers?.[f.home] || extendedClub(f.home)?.overall || 60,
    b = s.expansion.powers?.[f.away] || extendedClub(f.away)?.overall || 60;
  f.homeGoals = Math.max(
    0,
    Math.floor(random(s) * (f.neutral ? 3.8 : 4) + (a - b) / 25),
  );
  f.awayGoals = Math.max(
    0,
    Math.floor(random(s) * (f.neutral ? 3.8 : 3.6) + (b - a) / 25),
  );
  afterScore?.();
  f.played = true;
  const h = d.table.find((t) => t.clubId === f.home),
    v = d.table.find((t) => t.clubId === f.away);
  for (const [x, g, ag] of [
    [h, f.homeGoals, f.awayGoals],
    [v, f.awayGoals, f.homeGoals],
  ]) {
    x.played++;
    x.gf += g;
    x.ga += ag;
    if (g > ag) {
      x.wins++;
      x.points += 3;
    } else if (g === ag) {
      x.draws++;
      x.points++;
    } else x.losses++;
  }
}
function simulateCup(s, f, afterScore) {
  const table = [blankRow(f.home), blankRow(f.away)];
  if ([f.home, f.away].includes(s.clubId))
    matchDay(s, [f], table, { afterScore });
  else backgroundResult(s, f, { table }, afterScore);
}
function prepareLegacyRound(s, c) {
  if (c.winner || c.pendingMatches) return;
  const draw = [...c.alive];
  for (let i = draw.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [draw[i], draw[j]] = [draw[j], draw[i]];
  }
  const calendar = cupPriorityCalendar(s);
  s.expansion.calendarDirty = true;
  c.pendingMatches = [];
  c.roundWinners = [];
  for (let i = 0; i < draw.length; i += 2) {
    if (!draw[i + 1]) {
      c.roundWinners.push(draw[i]);
      continue;
    }
    const f = {
      id: `${c.id}-r${c.round}-${i}`,
      round: c.round + 1,
      date: availableDate(
        calendar,
        draw[i],
        draw[i + 1],
        c.nextDate < s.date ? s.date : c.nextDate,
      ),
      home: draw[i],
      away: draw[i + 1],
      played: false,
      competition: c.name,
      neutral: c.id.startsWith("super-uefa"),
    };
    c.pendingMatches.push(f);
    calendar.reserve(f);
  }
  c.nextDate = c.pendingMatches.map((f) => f.date).sort()[0] || c.nextDate;
}
function cupsDay(s) {
  for (const c of s.expansion.cups) {
    if (c.engine === ASIA_ENGINE) {
      asiaDay(s, c, simulateCup);
      continue;
    }
    if (c.engine === CONCACAF_ENGINE) {
      concacafDay(s, c, simulateCup);
      continue;
    }
    if (c.engine === FIFA_ENGINE) {
      fifaDay(s, c, simulateCup);
      continue;
    }
    if (c.engine === CUP_ENGINE) {
      competitionDay(s, c, simulateCup);
      continue;
    }
    if (c.engine === "europe-v1") {
      europeanDay(s, c, simulateCup);
      continue;
    }
    if (c.winner) continue;
    prepareLegacyRound(s, c);
    if (c.nextDate > s.date) continue;
    for (const f of c.pendingMatches) {
      if (f.played || f.date !== s.date) continue;
      simulateCup(s, f, () => {
        if (c.id.startsWith("super-uefa")) {
          f.regulationHome = f.homeGoals;
          f.regulationAway = f.awayGoals;
          f.winner = resolveExtraTime(s, f, f.homeGoals, f.awayGoals);
          return;
        }
        if (f.homeGoals === f.awayGoals)
          f.penaltyWinner = random(s) < 0.5 ? f.home : f.away;
        f.winner =
          f.penaltyWinner || (f.homeGoals > f.awayGoals ? f.home : f.away);
      });
      c.roundWinners.push(f.winner);
      c.results.push(f);
      if (f.winner === s.clubId)
        post(
          s,
          250000 * (c.round + 1),
          "cup-prize",
          "مكافأة تأهل " + c.name,
          f.id + "-prize",
        );
    }
    c.pendingMatches = c.pendingMatches.filter((f) => !f.played);
    if (c.pendingMatches.length) {
      c.nextDate = c.pendingMatches.map((f) => f.date).sort()[0];
      continue;
    }
    c.alive = c.roundWinners;
    delete c.roundWinners;
    delete c.pendingMatches;
    c.round++;
    c.nextDate = addDays(s.date, 28);
    if (c.alive.length === 1) {
      c.winner = c.alive[0];
      if (!c.id.startsWith("cup-") && !c.id.startsWith("super-"))
        s.expansion.champions[c.id.split("-s")[0]] = c.winner;
      if (c.winner === s.clubId) {
        s.reputation = clamp(s.reputation + 3, 0, 100);
        message(s, {
          title: "بطولة جديدة: " + c.name,
          body: "تم تسجيل الكأس في تاريخ النادي. صيغة هذه البطولة مبسّطة وليست اللائحة الرسمية.",
          category: "matches",
        });
      }
    } else prepareLegacyRound(s, c);
  }
  const x = s.expansion;
  const u = x.cups.find((c) => c.id.startsWith("ucl-")),
    e = x.cups.find((c) => c.id.startsWith("uel-"));
  if (
    u?.winner &&
    e?.winner &&
    !x.cups.some((c) => c.id.startsWith("super-uefa"))
  )
    createCup(s, "super-uefa", "UEFA Super Cup", [u.winner, e.winner], 14);
  if (x.competitionVersion) superCupsDay(s);
  const ca = x.cups.find((c) => c.id.startsWith("caf-")),
    cf = x.cups.find((c) => c.id.startsWith("confed-"));
  if (
    !x.competitionVersion &&
    ca?.winner &&
    cf?.winner &&
    !x.cups.some((c) => c.id.startsWith("super-caf"))
  )
    createCup(s, "super-caf", "CAF Super Cup", [ca.winner, cf.winner], 14);
  for (const c of x.cups.filter(
    (c) => !c.engine && !c.winner && !c.pendingMatches,
  ))
    prepareLegacyRound(s, c);
  if (x.calendarDirty) rebalanceLeagueCalendar(s);
}
function rollover(s) {
  const x = s.expansion;
  if (
    s.date < s.nextSeasonDate ||
    x.divisions.some((d) => d.fixtures.some((f) => !f.played)) ||
    x.cups.some((c) => !c.winner) ||
    (x.promotionVersion &&
      x.divisions.some((d) => d.id === "eg-3-a") &&
      (x.playoffs.length !== 2 || x.playoffs.some((p) => !p.winners.length)))
  )
    return;
  // 0.31: تصويت انتخابات الاتحاد يُحسم قبل ترقية الأندية وتغيير الموسم.
  politicalSeasonEnd(s);
  // 0.32: توزيع بث الاتحاد ومراجعة الحسابات قبل أرشفة الموسم.
  associationSeasonEnd(s);
  // 0.26: تصويت الجمعية العمومية على الموسم المنتهي قبل أي أرشفة أو ترقية.
  endSeasonBoardReview(s);
  const own = ownDivision(s),
    rank = standings(own).findIndex((t) => t.clubId === s.clubId) + 1;
  for (const p of s.press.promises.filter((p) => !p.resolved)) {
    p.resolved = true;
    p.met = rank <= Math.ceil(own.clubs.length / 2);
    s.press.trust = clamp(s.press.trust + (p.met ? 8 : -10), 0, 100);
  }
  recordFifaSeason(s);
  recordAsianSeason(s);
  recordConcacafSeason(s);
  x.history.unshift({
    season: s.seasonNumber,
    date: s.date,
    division: own.name,
    rank,
    playoffs: (x.playoffs || []).map((p) => ({
      name: p.name,
      table: standings(p),
      winners: p.winners,
    })),
    cups: x.cups.map((c) => ({
      name: c.name,
      winner: c.winner,
      format: c.format,
      ...(c.engine === "europe-v1"
        ? { leagueTable: europeanTable(c), ranking: c.ranking }
        : c.engine === CUP_ENGINE ||
            c.engine === ASIA_ENGINE ||
            c.engine === CONCACAF_ENGINE
          ? { groups: c.groupRanking || [], finalists: c.finalists }
          : c.engine === FIFA_ENGINE
            ? {
                editionYear: c.editionYear,
                groups: c.groupRanking || [],
                finalists: c.finalists,
                trophies: c.trophies,
              }
            : {}),
    })),
    tables: x.divisions.map((d) => ({ id: d.id, table: standings(d) })),
  });
  x.history = x.history.slice(0, 10);
  x.domesticHonours ??= {};
  for (const c of x.cups.filter((c) => c.id.startsWith("cup-") && c.winner)) {
    const country = c.id.split("-")[1];
    x.domesticHonours[country] = {
      winner: c.winner,
      runnerUp:
        c.finalists?.find((id) => id !== c.winner) ||
        c.results.at(-1)?.[
          c.results.at(-1)?.home === c.winner ? "away" : "home"
        ],
      season: s.seasonNumber,
    };
  }
  updateEuropeanCoefficients(s);
  // Promotion/relegation is simultaneous: a club cannot move twice in one summer.
  const original = new Map(
    x.divisions.map((d) => [d.id, standings(d).map((t) => t.clubId)]),
  );
  const moves = promotionMoves(x, original);
  for (const [id, from] of moves)
    from.clubs = from.clubs.filter((c) => c !== id);
  for (const [id, , to] of moves) to.clubs.push(id);
  x.qualification = Object.fromEntries(
    x.divisions
      .filter((d) => d.tier === 1)
      .map((d) => [d.country, original.get(d.id)]),
  );
  x.playoffs = [];
  s.seasonNumber++;
  refreshBudgets(s);
  for (const d of x.divisions) {
    d.table = d.clubs.map(blankRow);
    d.fixtures = leagueSchedule(d.clubs, s.date, d.id + "-s" + s.seasonNumber);
  }
  const next = ownDivision(s);
  s.table = next.table;
  s.fixtures = next.fixtures;
  reconcilePoliticalMap(s);
  s.nextSeasonDate = addDays(s.date, 365);
  // لائحة الموسم الجديد بعد بناء الجداول الجديدة (تاريخ المنتصف يُحسب منها).
  startSeasonMandate(s);
  s.commerce.seasonTickets = 0;
  s.management.lineup = [];
  // Academy graduates keep identities throughout subsequent seasons; only new intake is generated.
  const club = extendedClub(s.clubId);
  if (!s.talent && club.tier > 1) {
    for (let i = 0; i < 2 && reservedSquadSize(s) < s.squadLimit; i++)
      s.players.push(
        generatedPlayer(
          club,
          24 + s.seasonNumber * 2 + i,
          s.date,
          s.seed + s.seasonNumber,
          true,
        ),
      );
  }
  x.competitionVersion = 1; // Upgraded saves switch only AFTER the old season completes.
  x.fifaVersion = 1;
  x.asiaVersion = 1;
  x.concacafVersion = 1;
  createCups(s);
  paySponsorBonuses(s, rank);
  message(s, {
    title: "موسم جديد: " + next.name,
    body: `مركزك السابق ${rank}. أُجري الصعود والهبوط بين الدرجات المتاحة. ملاحق مصر تعمل عندما تتوفر مجموعاتها؛ بقية المسارات مبسطة. المالك مستمر، وهويات اللاعبين محفوظة.`,
    category: "matches",
  });
}
// 0.20 — annual operating budget for AI clubs. Budgets used to be a finite pool set once at
// creation and only ever spent (renewals, signings, transfers), so after five or six seasons the
// background world could no longer renew or sign anyone and squads thinned out. Every new season
// tops each club back up to its baseline; surpluses from sales are kept.
export function refreshBudgets(s) {
  const x = s.expansion;
  if (!x?.budgets) return;
  for (const d of x.divisions)
    for (const id of d.clubs) {
      const baseline = extendedClub(id)?.cash || 50000000;
      x.budgets[id] = Math.max(x.budgets[id] || 0, baseline);
    }
}
// Average of each club's best eleven ratings, kept as a sorted top-11 per club during a single
// pass (0.20: the previous group-everything-then-sort version was the most expensive line of the
// daily tick in a 47,000-player world).
export function clubPowers(players) {
  const top = new Map();
  for (const p of players) {
    if (p.status === "retired") continue;
    const r = p.rating;
    let arr = top.get(p.clubId);
    if (!arr) top.set(p.clubId, (arr = []));
    if (arr.length === 11) {
      if (r <= arr[10]) continue;
      arr.pop();
    }
    let i = arr.length;
    while (i > 0 && arr[i - 1] < r) i--;
    arr.splice(i, 0, r);
  }
  const powers = {};
  for (const [id, arr] of top) {
    let sum = 0;
    for (const r of arr) sum += r;
    powers[id] = sum / arr.length;
  }
  return powers;
}
export function pyramidDay(s) {
  if (!s.expansion || s.expansion.lastTick === s.date) return;
  s.expansion.lastTick = s.date;
  const own = ownDivision(s);
  s.expansion.powers = clubPowers(s.players);
  for (const d of s.expansion.divisions)
    if (d !== own)
      for (const f of d.fixtures)
        if (!f.played && f.date === s.date) backgroundResult(s, f, d);
  promotionDay(s, {
    blankRow,
    schedule: leagueSchedule,
    simulate: (state, f, d) => {
      if ([f.home, f.away].includes(state.clubId))
        matchDay(state, [f], d.table);
      else backgroundResult(state, f, d);
    },
  });
  cupsDay(s);
  rollover(s);
  if (s.date.endsWith("-01")) {
    const tier = ownDivision(s).tier;
    post(
      s,
      Math.round(900000 / tier ** 2),
      "broadcast",
      "توزيع بث شهري محاكى",
      `broadcast-${s.date}`,
    );
    const clubs = s.expansion.divisions
      .flatMap((d) => d.clubs)
      .filter((id) => id !== s.clubId);
    for (let i = 0; marketOpen(s) && i < 8; i++) {
      const seller = clubs[Math.floor(random(s) * clubs.length)],
        buyer = clubs[Math.floor(random(s) * clubs.length)];
      if (seller === buyer) continue;
      const players = s.players.filter(
        (p) => p.clubId === seller && p.status !== "retired" && !p.loan,
      );
      if (players.length <= 18) continue;
      const p = players[Math.floor(random(s) * players.length)],
        fee = p.value;
      if (
        (s.expansion.budgets[buyer] || 0) < fee ||
        p.rating < teamPower(s, buyer) - 10 ||
        s.players.filter((p) => p.clubId === buyer && p.status !== "retired")
          .length >= 45
      )
        continue;
      s.expansion.budgets[buyer] -= fee;
      s.expansion.budgets[seller] = (s.expansion.budgets[seller] || 0) + fee;
      p.clubId = buyer;
      p.careerHistory.push({
        date: s.date,
        type: "ai-transfer",
        clubId: buyer,
      });
      s.expansion.aiTransfers.unshift({
        date: s.date,
        name: p.name,
        seller,
        buyer,
        fee,
      });
    }
    s.expansion.aiTransfers = s.expansion.aiTransfers.slice(0, 100);
  }
}
