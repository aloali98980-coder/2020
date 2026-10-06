import { base, fixture, planPairs, settleTie } from "../competitions/engine.js";
import { groupDraw, shuffle, seededPairs } from "../competitions/draw.js";
import { resolvePenalties } from "../europe/engine.js";
import { cupPriorityCalendar } from "../calendar.js";
import { addDays, random, clamp } from "../../core/utils.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { asiaAccess, zone, ASIA_KINDS } from "./access.js";
import { eliteDraw } from "./draw.js";
import { asiaTable, across } from "./table.js";
import { post } from "../finance.js";
import { message } from "../inbox.js";
export const ASIA_ENGINE = "asia-v1";
// 0.14 review: exported tiered factors (same pattern across engines).
export const ASIA_PRIZE_FACTOR = {
  afc: 3,
  "afc-two": 1.5,
  "afc-challenge": 0.5,
};
export function asiaPrize(kind, base) {
  return Math.round(base * (ASIA_PRIZE_FACTOR[kind] ?? 1));
}
export const ASIA_NAMES = {
  afc: "AFC Champions League Elite",
  "afc-two": "AFC Champions League Two",
  "afc-challenge": "AFC Challenge League",
};
export const ASIA_STAGES = {
  preliminary: "الدور التمهيدي",
  waiting: "انتظار المنتقلين من البطولة الأعلى",
  groups: "مرحلة الدوري / المجموعات",
  r16: "ثمن النهائي",
  qf: "ربع النهائي",
  sf: "نصف النهائي",
  final: "النهائي",
  complete: "اكتملت",
};
export function createAsianCups(s) {
  const access = asiaAccess(s);
  for (const kind of ASIA_KINDS) {
    const a = access[kind],
      c = base(s, kind, kind, ASIA_NAMES[kind], a.entrants, {
        engine: ASIA_ENGINE,
        phase: "waiting",
        direct: a.direct,
        qualifiers: a.qualifiers,
        qualification: a.qualification,
        imports: [],
        tableShootouts: {},
        tableRule: "afc",
        format:
          kind === "afc"
            ? "32 ناديًا · 16 شرقًا و16 غربًا · 8 مباريات (4 داخل و4 خارج) · أول 8 في كل منطقة إلى ثمن نهائي ذهاب وإياب · نهائيات مجمعة من ربع النهائي"
            : kind === "afc-two"
              ? "32 ناديًا · 8 مجموعات إقليمية ذهاب وإياب · أول وثاني كل مجموعة · إقصائيات إقليمية ذهاب وإياب · نهائي واحد"
              : "20 ناديًا · 3 مجموعات غرب و2 شرق · مجموعات مجمعة من دور واحد · الغرب: الأوائل وأفضل وصيف؛ الشرق: الأول والثاني · ربع ونصف نهائي إقليميان ذهاب وإياب · نهائي واحد",
      });
    if (a.qualifiers.length) {
      const pairs = ["west", "east"].flatMap((z) => {
        const ids = a.qualifiers.filter((id) => zone(id) === z);
        return [
          [ids[0], ids[3]],
          [ids[1], ids[2]],
        ];
      });
      planPairs(s, c, "preliminary", pairs, kind === "afc" ? 8 : 15);
      c.alive = [...c.direct, ...a.qualifiers];
    }
  }
}
function feed(s, c) {
  const source = s.expansion.cups.find(
    (p) =>
      p.kind === (c.kind === "afc-two" ? "afc" : "afc-two") &&
      p.engine === ASIA_ENGINE,
  );
  if (!source?.preliminaryFinished) return false;
  if (c.feedSource) return true;
  c.feedSource = source.id;
  c.imports = [...source.preliminaryLosers];
  c.entrants.push(...c.imports);
  for (const id of c.imports) {
    c.lots[id] = Object.keys(c.lots).length;
    c.qualification.push({
      clubId: id,
      country: extendedClub(id).country,
      zone: zone(id),
      reason: "preliminary-transfer",
      route: "direct",
      source: source.id,
    });
  }
  if (c.imports.includes(s.clubId))
    message(s, {
      title: "انتقلت إلى " + c.name,
      body: "الخروج من تمهيدي البطولة الأعلى منح ناديك مكانًا في مجموعات البطولة التالية.",
      category: "matches",
    });
  return true;
}
function groups(s, c) {
  c.phase = "groups";
  c.round++;
  c.mainEntrants = [...c.direct, ...(c.preliminaryWinners || []), ...c.imports];
  c.alive = [...c.mainEntrants];
  c.groups = [];
  c.regionDraws = {};
  const calendar = cupPriorityCalendar(s);
  for (const z of ["west", "east"]) {
    const ids = c.mainEntrants.filter((id) => zone(id) === z);
    if (c.kind === "afc") {
      const draw = eliteDraw(s, ids);
      c.regionDraws[z] = { columns: draw.columns, pots: draw.pots };
      c.groups.push({ id: z, zone: z, clubs: ids });
      for (const day of draw.rounds)
        for (const p of day)
          fixture(
            s,
            c,
            calendar,
            p.home,
            p.away,
            addDays(s.date, 18 + (p.round - 1) * 14),
            {
              stage: "groups",
              group: z,
              zone: z,
              round: p.round,
              neutral: false,
            },
          );
    } else {
      const draw = groupDraw(s, ids),
        offset = z === "west" ? 0 : c.kind === "afc-two" ? 4 : 3;
      c.regionDraws[z] = { pots: draw.pots };
      const gs = draw.groups.map((g, i) => ({
        ...g,
        id: String.fromCharCode(65 + offset + i),
        zone: z,
      }));
      c.groups.push(...gs);
      const rounds = [
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
        ],
        single = c.kind === "afc-challenge";
      for (let r = 0; r < (single ? 3 : 6); r++)
        for (const g of gs)
          for (const [aa, bb] of rounds[r % 3]) {
            const [a, b] = r < 3 ? [aa, bb] : [bb, aa];
            fixture(
              s,
              c,
              calendar,
              g.clubs[a],
              g.clubs[b],
              addDays(s.date, 18 + r * (single ? 4 : 14)),
              {
                stage: "groups",
                group: g.id,
                zone: z,
                round: r + 1,
                neutral: single,
              },
            );
          }
    }
  }
  c.nextDate = c.fixtures
    .filter((f) => !f.played)
    .map((f) => f.date)
    .sort()[0];
}
function tableProgress(s, c) {
  for (const g of c.groups)
    asiaTable(c, g, (key, f) => {
      if (c.tableShootouts[key]) return;
      const temp = { ...f };
      const winner = resolvePenalties(s, temp);
      c.tableShootouts[key] = {
        matchId: f.id,
        home: f.home,
        away: f.away,
        winner,
        homeScore: temp.penaltiesHome,
        awayScore: temp.penaltiesAway,
      };
    });
  c.groupRanking = c.groups.map((g) => asiaTable(c, g).map((r) => r.clubId));
  c.groupsFinished = s.date;
  let pairs = [];
  for (const z of ["west", "east"]) {
    const gs = c.groups.filter((g) => g.zone === z),
      tables = gs.map((g) => asiaTable(c, g));
    if (c.kind === "afc") {
      const ids = tables[0].slice(0, 8).map((r) => r.clubId);
      pairs.push(...[0, 1, 2, 3].map((i) => [ids[7 - i], ids[i]]));
    } else if (c.kind === "afc-two") {
      const of = Object.fromEntries(
        gs.flatMap((g) => g.clubs.map((id) => [id, g.id])),
      );
      pairs.push(
        ...seededPairs(
          s,
          tables.map((t) => t[0].clubId),
          tables.map((t) => t[1].clubId),
          of,
        ),
      );
    } else if (z === "east")
      pairs.push(
        [tables[1][1].clubId, tables[0][0].clubId],
        [tables[0][1].clubId, tables[1][0].clubId],
      );
    else {
      const second = tables.map((t) => t[1]).sort(across)[0],
        winners = tables.map((t) => t[0].clubId),
        k = gs.findIndex((g) => g.clubs.includes(second.clubId));
      pairs.push(
        [second.clubId, winners[(k + 1) % 3]],
        [winners[(k + 2) % 3], winners[k]],
      );
      c.bestRunner = second.clubId;
    }
  }
  planPairs(s, c, c.kind === "afc-challenge" ? "qf" : "r16", pairs, 14);
}
export function asiaDay(s, c, simulate) {
  if (c.winner) return;
  if (c.phase === "waiting") {
    if (feed(s, c)) groups(s, c);
    else c.nextDate = addDays(s.date, 1);
    return;
  }
  for (const f of c.fixtures.filter((f) => !f.played && f.date === s.date)) {
    const t = c.ties.find((t) => t.id === f.tieId);
    simulate(s, f, () => {
      f.regulationHome = f.homeGoals;
      f.regulationAway = f.awayGoals;
      if (t) settleTie(s, c, t, f);
      else
        for (const side of ["home", "away"]) {
          f[side + "Yellows"] = Math.floor(random(s) * 5);
          f[side + "Reds"] = random(s) < 0.06 ? 1 : 0;
          f[side + "ConductPenalty"] =
            f[side + "Yellows"] + 3 * f[side + "Reds"];
        }
    });
    if (f.stage === "groups" && [f.home, f.away].includes(s.clubId)) {
      const a = f.home === s.clubId ? f.homeGoals : f.awayGoals,
        b = f.home === s.clubId ? f.awayGoals : f.homeGoals;
      post(
        s,
        asiaPrize(c.kind, a > b ? 400000 : a === b ? 150000 : 0),
        "cup-prize",
        "جائزة آسيوية تقديرية — " + c.name,
        f.id + "-prize",
      );
    }
    if (t?.winner && [t.a, t.b].includes(s.clubId)) {
      if (t.winner === s.clubId)
        post(
          s,
          asiaPrize(c.kind, t.stage === "final" ? 3500000 : 500000),
          "cup-prize",
          "جائزة آسيوية تقديرية — " + c.name,
          t.id + "-prize",
        );
      message(s, {
        title: (t.winner === s.clubId ? "تأهل / تتويج: " : "خروج: ") + c.name,
        body:
          ASIA_STAGES[t.stage] +
          " · مجموع " +
          t.aggregateA +
          "–" +
          t.aggregateB +
          (f.penaltyWinner
            ? "؛ بالترجيح"
            : f.extraTime
              ? "؛ بعد وقت إضافي"
              : ""),
        category: "matches",
      });
    }
  }
  const pending = c.fixtures.filter((f) => !f.played);
  if (pending.length) {
    c.nextDate = pending.map((f) => f.date).sort()[0];
    return;
  }
  if (c.phase === "groups") {
    tableProgress(s, c);
    return;
  }
  const ties = c.ties.filter((t) => t.round === c.round),
    winners = ties.map((t) => t.winner);
  if (winners.some((id) => !id)) throw Error("مواجهة آسيوية غير محسومة.");
  if (c.phase === "preliminary") {
    c.preliminaryWinners = winners;
    c.preliminaryLosers = ties.map((t) => (t.winner === t.a ? t.b : t.a));
    c.preliminaryFinished = s.date;
    c.alive = [...c.direct, ...winners];
    if (c.kind === "afc") groups(s, c);
    else {
      c.phase = "waiting";
      c.nextDate = addDays(s.date, 1);
      if (feed(s, c)) groups(s, c);
    }
    return;
  }
  c.alive = winners;
  if (winners.length === 1) {
    c.winner = winners[0];
    c.phase = "complete";
    c.finished = s.date;
    c.nextDate = s.date;
    s.expansion.champions[c.kind] = c.winner;
    if (c.winner === s.clubId) {
      s.reputation = clamp(s.reputation + 3, 0, 100);
      message(s, {
        title: "بطل " + c.name,
        body:
          c.kind === "afc"
            ? "اللقب يؤهلك للإنتركونتيننتال ويدخل سجل تأهل كأس العالم."
            : "اللقب يفتح مسار التأهل للبطولة الآسيوية الأعلى في الموسم القادم.",
        category: "matches",
      });
    }
    return;
  }
  let pairs;
  if (c.kind === "afc" && c.phase === "r16") {
    const west = shuffle(
        s,
        winners.filter((id) => zone(id) === "west"),
      ),
      east = shuffle(
        s,
        winners.filter((id) => zone(id) === "east"),
      );
    pairs = west.map((id, i) => [id, east[i]]);
  } else
    pairs = Array.from({ length: winners.length / 2 }, (_, i) =>
      winners.slice(i * 2, i * 2 + 2),
    );
  planPairs(
    s,
    c,
    winners.length === 8 ? "qf" : winners.length === 4 ? "sf" : "final",
    pairs,
    c.kind === "afc" ? 7 : 14,
  );
}
