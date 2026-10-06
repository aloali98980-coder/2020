import { base, fixture, planPairs } from "../competitions/engine.js";
import { groupTable } from "../competitions/table.js";
import { cupPriorityCalendar } from "../calendar.js";
import { resolveExtraTime } from "../europe/engine.js";
import { shuffle } from "../competitions/draw.js";
import { addDays, random, clamp } from "../../core/utils.js";
import { post } from "../finance.js";
import { message } from "../inbox.js";
import { OFC_ENTRANTS } from "../../data/fifaGuests.js";
import {
  initFifa,
  worldAccess,
  PRIMARY,
  REGIONS,
  region,
  association,
} from "./access.js";
import { worldDraw } from "./draw.js";
// 0.14 review: the annual Intercontinental pays a modeled fraction of the
// quadrennial Club World Cup; the OFC path keeps its flat qualifier prize.
export const FIFA_PRIZE_FACTOR = {
  clubworld: 1,
  intercontinental: 0.6,
  ofc: 1,
};
export function fifaPrize(kind, base) {
  return Math.round(base * (FIFA_PRIZE_FACTOR[kind] ?? 1));
}
export function fifaWinPrize(kind, stage) {
  return fifaPrize(
    kind,
    kind === "ofc" ? 200000 : stage === "final" ? 5000000 : 1000000,
  );
}
export const FIFA_ENGINE = "fifa-v1";
export const FIFA_STAGES = {
  groups: "المجموعات",
  opening: "المساران الافتتاحيان",
  aap: "كأس أفريقيا وآسيا والمحيط الهادئ",
  challenger: "كأس التحدي",
  r16: "ثمن النهائي",
  qf: "ربع النهائي",
  sf: "نصف النهائي",
  final: "النهائي",
  waiting: "انتظار الأبطال القاريين الستة",
  complete: "اكتملت",
};
const make = (s, kind, name, ids, extra = {}) =>
  base(s, kind, kind, name, ids, {
    engine: FIFA_ENGINE,
    tableRule: "fifa",
    editionYear: Number(s.nextSeasonDate.slice(0, 4)),
    trophies: {},
    waitingSeeds: [],
    ...extra,
  });
export function createFifaCups(s) {
  initFifa(s);
  const c = make(s, "ofc", "مسار تأهل أوقيانوسيا", OFC_ENTRANTS, {
    qualificationSource: "ofc-scenario",
    groups: [{ id: "O", clubs: [...OFC_ENTRANTS] }],
    format:
      "7 أندية حقيقية مؤهلة من قائمة OFC؛ دوري خفيف من دور واحد ثم نهائي بين الأول والثاني. ليس الصيغة الرسمية للدوري الاحترافي ذي الثمانية أندية.",
  });
  const calendar = cupPriorityCalendar(s);
  let order = [...shuffle(s, OFC_ENTRANTS), null];
  for (let round = 0; round < 7; round++) {
    for (let i = 0; i < 4; i++) {
      let h = order[i],
        a = order[7 - i];
      if (!h || !a) continue;
      if (round % 2) [h, a] = [a, h];
      fixture(s, c, calendar, h, a, addDays(s.date, 24 + round * 10), {
        stage: "groups",
        group: "O",
        round: round + 1,
        neutral: true,
      });
    }
    order = [order[0], order[7], ...order.slice(1, 7)];
  }
  c.nextDate = c.fixtures.map((f) => f.date).sort()[0];
  make(s, "intercontinental", "FIFA Intercontinental Cup", [], {
    phase: "waiting",
    nextDate: addDays(s.date, 1),
    qualificationSource: "current-continental-champions",
    format:
      "سنوي · 6 أبطال قاريين · 5 مباريات · بطل أوروبا إلى النهائي مباشرة؛ مواعيد وجوائز اللعبة محاكاة.",
  });
  if (Number(s.nextSeasonDate.slice(0, 4)) >= s.expansion.fifa.nextWorldYear)
    createWorldCup(s, s.expansion.fifa.nextWorldYear);
}
export function createWorldCup(s, year) {
  const access = worldAccess(s, year),
    ids = access.qualification.map((q) => q.clubId),
    draw = worldDraw(s, access.qualification);
  const c = make(s, "clubworld", "FIFA Club World Cup", ids, {
    ...access,
    ...draw,
    editionYear: year,
    qualificationSource: "four-year-cycle",
    format:
      "32 ناديًا · 8 مجموعات من دور واحد · الأول والثاني لثمن النهائي · إقصائيات محايدة من مباراة واحدة · كل 4 سنوات. صيغة 2025 للعبة، لا اعتماد نهائي للوائح 2029.",
  });
  const calendar = cupPriorityCalendar(s),
    start = `${year}-06-15`,
    earliest = start > s.date ? start : addDays(s.date, 14),
    rounds = [
      [
        [0, 3],
        [1, 2],
      ],
      [
        [0, 2],
        [3, 1],
      ],
      [
        [0, 1],
        [2, 3],
      ],
    ];
  for (let r = 0; r < 3; r++)
    for (const g of c.groups)
      for (const [a, b] of rounds[r])
        fixture(
          s,
          c,
          calendar,
          g.clubs[a],
          g.clubs[b],
          addDays(earliest, r * 7),
          { stage: "groups", group: g.id, round: r + 1, neutral: true },
        );
  c.nextDate = c.fixtures.map((f) => f.date).sort()[0];
  if (ids.includes(s.clubId)) {
    post(
      s,
      1000000,
      "cup-prize",
      "مشاركة كأس العالم — تقدير محاكاة",
      c.id + "-entry",
    );
    message(s, {
      title: "تأهلت لكأس العالم للأندية",
      body: "قرعة 32 ناديًا محفوظة. سبب تأهلك ومصدر المقعد ظاهر في بطاقة البطولة؛ الجوائز والتصنيف والمضيف سيناريو اللعبة.",
      category: "matches",
    });
  }
  return c;
}
function plan(s, c, phase, pairs, waiting = [], codes = [], homeStages = []) {
  planPairs(s, c, phase, pairs, 7);
  c.waitingSeeds = waiting;
  c.alive.push(...waiting);
  const ties = c.ties.filter((t) => t.round === c.round);
  for (const [i, t] of ties.entries()) {
    const f = c.fixtures.find((f) => f.id === t.legs[0]);
    f.neutral = !homeStages.includes(i);
    f.matchCode = codes[i] || phase;
  }
}
function qualifyIntercontinental(s, c) {
  const source = REGIONS.map((r) =>
    s.expansion.cups.find(
      (k) =>
        k.kind === PRIMARY[r] || k.id === `${PRIMARY[r]}-s${s.seasonNumber}`,
    ),
  );
  if (source.some((k) => !k?.winner)) {
    c.nextDate = addDays(s.date, 1);
    return;
  }
  const holders = Object.fromEntries(
    REGIONS.map((r, i) => [r, source[i].winner]),
  );
  if (
    new Set(Object.values(holders)).size !== 6 ||
    REGIONS.some((r) => region(holders[r]) !== r)
  )
    throw Error("أبطال القارات غير مؤهلين أو مكررون.");
  c.qualification = REGIONS.map((r, i) => ({
    clubId: holders[r],
    region: r,
    country: association(holders[r]),
    reason: "continental-champion",
    sourceCup: source[i].id,
  }));
  c.entrants = Object.values(holders);
  c.originalEntrants = [...c.entrants];
  c.lots = Object.fromEntries(shuffle(s, c.entrants).map((id, i) => [id, i]));
  c.holders = holders;
  c.firstRegion = c.editionYear % 2 === 0 ? "afc" : "caf";
  c.secondRegion = c.firstRegion === "afc" ? "caf" : "afc";
  plan(
    s,
    c,
    "opening",
    [
      [holders[c.firstRegion], holders.ofc],
      [holders.concacaf, holders.conmebol],
    ],
    [holders[c.secondRegion], holders.uefa],
    ["aap-playoff", "americas"],
    [0],
  );
  if (c.entrants.includes(s.clubId))
    message(s, {
      title: "تأهلت للإنتركونتيننتال",
      body: "تأهل من لقبك القاري لهذا الموسم. بطل أوروبا ينتظر النهائي؛ البقية في مسارين ثم كأس التحدي. البطولة منفصلة عن كأس العالم للأندية.",
      category: "matches",
    });
}
function conduct(s) {
  const n = {
      yellow: Math.floor(random(s) * 5),
      indirectRed: 0,
      directRed: 0,
      yellowDirectRed: 0,
    },
    r = random(s);
  if (r < 0.03) n.indirectRed = 1;
  else if (r < 0.06) n.directRed = 1;
  else if (r < 0.07) n.yellowDirectRed = 1;
  return n;
}
export const conductPenalty = (q) =>
  q.yellow + 3 * q.indirectRed + 4 * q.directRed + 5 * q.yellowDirectRed;
export function fifaDay(s, c, simulate) {
  if (c.winner) return;
  if (c.phase === "waiting") {
    qualifyIntercontinental(s, c);
    return;
  }
  for (const f of c.fixtures.filter((f) => !f.played && f.date === s.date)) {
    simulate(s, f, () => {
      f.regulationHome = f.homeGoals;
      f.regulationAway = f.awayGoals;
      if (f.stage === "groups") {
        f.homeConduct = conduct(s);
        f.awayConduct = conduct(s);
        f.homeConductPenalty = conductPenalty(f.homeConduct);
        f.awayConductPenalty = conductPenalty(f.awayConduct);
      } else {
        f.winner = resolveExtraTime(s, f, f.homeGoals, f.awayGoals);
        const t = c.ties.find((t) => t.id === f.tieId);
        t.winner = f.winner;
        t.aggregateA = f.homeGoals;
        t.aggregateB = f.awayGoals;
      }
    });
    if (
      f.stage !== "groups" &&
      c.kind === "intercontinental" &&
      ["americas", "aap", "challenger"].includes(f.matchCode)
    )
      c.trophies[f.matchCode] = { winner: f.winner, date: f.date };
    if (f.stage !== "groups" && [f.home, f.away].includes(s.clubId))
      message(s, {
        title: (f.winner === s.clubId ? "تأهل / تتويج: " : "خروج: ") + c.name,
        body:
          (FIFA_STAGES[f.matchCode] || f.matchCode) +
          (f.penaltyWinner
            ? " — حُسم بالترجيح."
            : f.extraTime
              ? " — بعد وقت إضافي."
              : "."),
        category: "matches",
      });
    if (f.winner === s.clubId)
      post(
        s,
        fifaWinPrize(c.kind, f.stage),
        "cup-prize",
        "مكافأة تقديرية — " + c.name,
        f.id + "-prize",
      );
  }
  const pending = c.fixtures.filter((f) => !f.played);
  if (pending.length) {
    c.nextDate = pending.map((f) => f.date).sort()[0];
    return;
  }
  if (c.phase === "groups") {
    const ranks = c.groups.map((g) => groupTable(c, g));
    c.groupRanking = ranks.map((rs) => rs.map((r) => r.clubId));
    if (c.kind === "ofc")
      plan(s, c, "final", [[ranks[0][0].clubId, ranks[0][1].clubId]]);
    else {
      const paths = [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
        [1, 0],
        [3, 2],
        [5, 4],
        [7, 6],
      ];
      plan(
        s,
        c,
        "r16",
        paths.map(([a, b]) => [ranks[a][0].clubId, ranks[b][1].clubId]),
      );
    }
    return;
  }
  const winners = c.ties
    .filter((t) => t.round === c.round)
    .map((t) => t.winner);
  if (winners.some((w) => !w)) throw Error("مواجهة عالمية لم تحسم.");
  if (c.kind === "intercontinental" && c.phase !== "final") {
    if (c.phase === "opening")
      plan(
        s,
        c,
        "aap",
        [[c.holders[c.secondRegion], winners[0]]],
        [c.holders.uefa, winners[1]],
        ["aap"],
        [0],
      );
    else if (c.phase === "aap")
      plan(
        s,
        c,
        "challenger",
        [[winners[0], c.trophies.americas.winner]],
        [c.holders.uefa],
        ["challenger"],
      );
    else plan(s, c, "final", [[c.holders.uefa, winners[0]]]);
    return;
  }
  if (c.phase === "final") {
    c.winner = winners[0];
    c.alive = [c.winner];
    c.waitingSeeds = [];
    c.phase = "complete";
    c.finished = s.date;
    c.nextDate = s.date;
    if (c.kind === "ofc") s.expansion.champions.ofc = c.winner;
    if (c.kind === "clubworld")
      s.expansion.fifa.nextWorldYear = c.editionYear + 4;
    if (c.winner === s.clubId) {
      s.reputation = clamp(s.reputation + 3, 0, 100);
      message(s, {
        title: "بطل " + c.name,
        body: "سُجل اللقب في مشوار النادي؛ البطولة والتأهل والمواعيد والجوائز ضمن نموذج اللعبة.",
        category: "matches",
      });
    }
    return;
  }
  plan(
    s,
    c,
    winners.length === 8 ? "qf" : winners.length === 4 ? "sf" : "final",
    Array.from({ length: winners.length / 2 }, (_, i) =>
      winners.slice(i * 2, i * 2 + 2),
    ),
  );
}
