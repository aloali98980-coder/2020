import { base, fixture, settleTie } from "../competitions/engine.js";
import { shuffle } from "../competitions/draw.js";
import { resolvePenalties } from "../europe/engine.js";
import { cupPriorityCalendar } from "../calendar.js";
import { addDays, random, clamp } from "../../core/utils.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { concacafAccess, CONCACAF_KINDS } from "./access.js";
import { concacafTable, leaguesTable, across, hostRank } from "./table.js";
import { post } from "../finance.js";
import { message } from "../inbox.js";
export const CONCACAF_ENGINE = "concacaf-v1";
// 0.14 review: exported tiered factors (same pattern across engines).
export const CONCACAF_PRIZE_FACTOR = {
  concacaf: 2,
  "leagues-cup": 1,
  "central-american": 0.4,
  caribbean: 0.4,
};
export function concacafPrize(kind, base) {
  return Math.round(base * (CONCACAF_PRIZE_FACTOR[kind] ?? 1));
}
export const CONCACAF_NAMES = {
  concacaf: "CONCACAF Champions Cup",
  "leagues-cup": "Leagues Cup",
  "central-american": "Concacaf Central American Cup",
  caribbean: "Concacaf Caribbean Cup",
};
export const CONCACAF_STAGES = {
  r1: "الدور الأول",
  r16: "ثمن النهائي",
  qf: "ربع النهائي",
  sf: "نصف النهائي",
  playin: "ملحق التأهل",
  third: "مباراة المركز الثالث",
  final: "النهائي",
  groups: "دور المجموعات",
  "phase-one": "المرحلة الأولى",
  complete: "اكتملت",
};
const FORMATS = {
  concacaf:
    "27 ناديًا · 22 في الدور الأول و5 معفاة لثمن النهائي · ذهاب وإياب حتى نصف النهائي · نهائي واحد يستضيفه الأعلى تصنيفًا",
  "leagues-cup":
    "36 ناديًا (18 مكسيكيًا و18 أمريكيًا) · 3 مباريات عابرة للدوريين لكل نادٍ · جدول منفصل لكل دوري · أول 4 من كل جدول لربع نهائي مفرد",
  "central-american":
    "20 ناديًا · 4 مجموعات من دور واحد · أول وثاني كل مجموعة · ربع نهائي ثم نصف نهائي وملحق تأهل ثم نهائي ذهاب وإياب",
  caribbean:
    "10 أندية · مجموعتان من دور واحد · أول وثاني كل مجموعة لنصف النهائي · نهائي ومباراة ثالث ذهاب وإياب",
};
// Single round robin for five clubs: 10 pairings over five rounds, every club
// plays four matches with two at home and two away.
function singleRoundRobin(s, clubs) {
  const pairs = [];
  for (let i = 0; i < clubs.length; i++)
    for (let j = i + 1; j < clubs.length; j++) pairs.push([clubs[i], clubs[j]]);
  for (let attempt = 0; attempt < 200; attempt++) {
    const rounds = [[], [], [], [], []];
    let ok = true;
    for (const [a, b] of shuffle(s, pairs)) {
      const r = shuffle(s, [0, 1, 2, 3, 4]).find(
        (r) =>
          !rounds[r].some(([x, y]) => [a, b].includes(x) || [a, b].includes(y)),
      );
      if (r === undefined) {
        ok = false;
        break;
      }
      rounds[r].push([a, b]);
    }
    if (!ok || rounds.some((r) => r.length !== 2)) continue;
    const home = new Map(clubs.map((id) => [id, 0])),
      dir = new Map();
    for (const [a, b] of shuffle(s, pairs)) {
      const h =
        home.get(a) < home.get(b)
          ? a
          : home.get(b) < home.get(a)
            ? b
            : shuffle(s, [a, b])[0];
      home.set(h, home.get(h) + 1);
      dir.set([a, b].sort().join("|"), h === a ? [a, b] : [b, a]);
    }
    if ([...home.values()].every((n) => n === 2))
      return rounds.flatMap((rs, r) =>
        rs.map(([a, b]) => {
          const [h, aw] = dir.get([a, b].sort().join("|"));
          return { home: h, away: aw, round: r + 1 };
        }),
      );
  }
  throw Error("تعذر جدولة مجموعة كونكاكاف.");
}
// Three interleague rounds: every club meets three different opponents from
// the other league, never its own.
function leaguesPairings(s, mx, us) {
  const seen = new Map([...mx, ...us].map((id) => [id, new Set()])),
    rounds = [];
  for (let r = 0; r < 3; r++) {
    const A = shuffle(s, mx),
      B = shuffle(s, us),
      used = new Set(),
      out = [];
    const solve = (i) => {
      if (i === A.length) return true;
      for (const b of shuffle(
        s,
        B.filter((x) => !used.has(x) && !seen.get(A[i]).has(x)),
      )) {
        used.add(b);
        out.push([A[i], b]);
        if (solve(i + 1)) return true;
        out.pop();
        used.delete(b);
      }
      return false;
    };
    if (!solve(0)) throw Error("تعذر قرعة المرحلة الأولى لكأس الدوريات.");
    for (const [a, b] of out) {
      seen.get(a).add(b);
      seen.get(b).add(a);
    }
    rounds.push(out);
  }
  return rounds;
}
const legsFor = (kind, stage) =>
  kind === "leagues-cup" ? 1 : kind === "concacaf" && stage === "final" ? 1 : 2;
function planRound(s, c, phase, specs, offset = 14, byes = []) {
  c.phase = phase;
  c.round++;
  c.byes = [...byes];
  c.alive = [...byes, ...specs.flatMap((t) => [t.a, t.b])];
  if (phase === "final") {
    const ft = specs.find((t) => t.stage === "final");
    c.finalists = [ft.a, ft.b];
  }
  const calendar = cupPriorityCalendar(s);
  for (const { stage, a, b } of specs) {
    const tie = {
      id: c.id + "-t" + c.ties.length,
      stage,
      round: c.round,
      a,
      b,
      legs: [],
      winner: null,
      aggregateA: 0,
      aggregateB: 0,
    };
    c.ties.push(tie);
    const legs = legsFor(c.kind, stage);
    const f = fixture(s, c, calendar, a, b, addDays(s.date, offset), {
      stage,
      tieId: tie.id,
      leg: 1,
      neutral: false,
    });
    tie.legs.push(f.id);
    if (legs === 2)
      tie.legs.push(
        fixture(s, c, calendar, b, a, addDays(f.date, 7), {
          stage,
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
}
const rankClubs = (s, ids) =>
  [...ids].sort(
    (a, b) =>
      (s.expansion.concacaf.guestScores[b] || 0) -
        (s.expansion.concacaf.guestScores[a] || 0) ||
      extendedClub(b).rep - extendedClub(a).rep ||
      a.localeCompare(b),
  );
function createRegional(s, kind, ids, groupCount, offset) {
  const a = concacafAccess(s)[kind];
  void ids;
  const c = base(s, kind, kind, CONCACAF_NAMES[kind], a.entrants, {
    engine: CONCACAF_ENGINE,
    phase: "groups",
    qualification: a.qualification,
    tableRule: "concacaf",
    rankScores: { ...s.expansion.concacaf.guestScores },
    format: FORMATS[kind] + "؛ المقاعد والقرعة والمواعيد والجوائز محاكاة",
  });
  const ranked = rankClubs(s, a.entrants),
    pots = Array.from({ length: 5 }, (_, i) =>
      ranked.slice(i * groupCount, (i + 1) * groupCount),
    );
  c.pots = pots;
  c.groups = Array.from({ length: groupCount }, (_, i) => ({
    id: String.fromCharCode(65 + i),
    clubs: [],
  }));
  for (const pot of pots) {
    const order = shuffle(s, [...pot]);
    c.groups.forEach((g, i) => g.clubs.push(order[i]));
  }
  const calendar = cupPriorityCalendar(s);
  for (const g of c.groups)
    for (const p of singleRoundRobin(s, g.clubs))
      fixture(
        s,
        c,
        calendar,
        p.home,
        p.away,
        addDays(s.date, offset + (p.round - 1) * 7),
        { stage: "groups", group: g.id, round: p.round, neutral: false },
      );
  c.nextDate = c.fixtures.map((f) => f.date).sort()[0];
}
export function createConcacafCups(s) {
  const access = concacafAccess(s);
  createRegional(
    s,
    "central-american",
    access["central-american"].entrants,
    4,
    32,
  );
  createRegional(s, "caribbean", access.caribbean.entrants, 2, 34);
  const leagues = access["leagues-cup"],
    mx = leagues.entrants.filter((id) => extendedClub(id).country === "mx"),
    us = leagues.entrants.filter((id) => extendedClub(id).country === "us");
  const lc = base(
    s,
    "leagues-cup",
    "leagues-cup",
    CONCACAF_NAMES["leagues-cup"],
    leagues.entrants,
    {
      engine: CONCACAF_ENGINE,
      phase: "phase-one",
      qualification: leagues.qualification,
      tableRule: "leagues",
      leagues: { mx: [...mx], us: [...us] },
      format:
        FORMATS["leagues-cup"] + "؛ الأوعية والمناطق والتأهل والجوائز محاكاة",
    },
  );
  {
    const calendar = cupPriorityCalendar(s);
    leaguesPairings(s, mx, us).forEach((pairs, r) => {
      const homes = new Map(leagues.entrants.map((id) => [id, 0]));
      for (const [a, b] of pairs) {
        const h =
          homes.get(a) < homes.get(b)
            ? a
            : homes.get(b) < homes.get(a)
              ? b
              : shuffle(s, [a, b])[0];
        homes.set(h, homes.get(h) + 1);
        fixture(
          s,
          lc,
          calendar,
          h === a ? a : b,
          h === a ? b : a,
          addDays(s.date, 30 + r * 7),
          { stage: "phase-one", round: r + 1, neutral: false },
        );
      }
    });
    lc.nextDate = lc.fixtures.map((f) => f.date).sort()[0];
  }
  const cc = access.concacaf;
  const cup = base(
    s,
    "concacaf",
    "concacaf",
    CONCACAF_NAMES.concacaf,
    cc.entrants,
    {
      engine: CONCACAF_ENGINE,
      qualification: cc.qualification,
      tableRule: "concacaf",
      rankScores: { ...s.expansion.concacaf.guestScores },
      seeds: [...cc.seeds],
      roundOneClubs: [...cc.roundOne],
      format: FORMATS.concacaf + "؛ المقاعد والقرعة والمواعيد والجوائز محاكاة",
    },
  );
  const ranked = rankClubs(s, cc.roundOne);
  cup.r1Seeds = ranked.slice(0, 11);
  cup.r1Top3 = ranked.slice(0, 3);
  const seeds = shuffle(s, cup.r1Seeds),
    rest = shuffle(s, ranked.slice(11));
  planRound(
    s,
    cup,
    "r1",
    seeds.map((seed, i) => ({ stage: "r1", a: rest[i], b: seed })),
    130,
    cc.seeds,
  );
}
function groupWinners(c) {
  const tables = c.groups.map((g) => concacafTable(c, g));
  const rows = (i) =>
    tables
      .map((t) => ({
        ...t[i],
        rep: extendedClub(t[i].clubId)?.rep || 0,
      }))
      .sort(across)
      .map((r) => r.clubId);
  return { tables, winners: rows(0), runners: rows(1) };
}
function orient(s, c, pairs, stages) {
  return pairs.map(([x, y]) => {
    const [first] = hostRank(c, [x, y], stages);
    return first === y ? [x, y] : [y, x];
  });
}
function seedScore(c, id) {
  const row = c.phaseRows[id];
  return [
    -row.points,
    -row.regWins,
    -(row.gf - row.ga),
    -row.gf,
    row.ga,
    row.conduct,
    c.lots[id],
  ];
}
const betterSeed = (c, a, b) => {
  const x = seedScore(c, a),
    y = seedScore(c, b);
  for (let i = 0; i < x.length; i++)
    if (x[i] !== y[i]) return x[i] < y[i] ? a : b;
  return a.localeCompare(b) < 0 ? a : b;
};
function progress(s, c) {
  const winners = (stage) =>
    c.ties
      .filter((t) => t.stage === stage && t.round === c.round)
      .map((t) => t.winner);
  if (c.kind === "concacaf") {
    if (c.phase === "r1") {
      const w = winners("r1"),
        designated = new Set(c.seeds);
      for (const t of c.ties.filter((t) => t.stage === "r1"))
        if (t.a && c.r1Top3.some((id) => [t.a, t.b].includes(id)))
          designated.add(t.winner);
      const hosts = shuffle(s, [
          ...c.seeds,
          ...w.filter((id) => designated.has(id)),
        ]),
        rest = shuffle(
          s,
          w.filter((id) => !designated.has(id)),
        );
      if (hosts.length !== 8 || rest.length !== 8)
        throw Error("تأهل الدور الأول لكونكاكاف غير مكتمل.");
      planRound(
        s,
        c,
        "r16",
        hosts.map((h, i) => ({ stage: "r16", a: rest[i], b: h })),
      );
    } else if (c.phase === "r16") {
      const w = winners("r16"),
        ranked = hostRank(c, w, ["r16"]),
        hosts = shuffle(s, ranked.slice(0, 4)),
        rest = shuffle(s, ranked.slice(4));
      planRound(
        s,
        c,
        "qf",
        hosts.map((h, i) => ({ stage: "qf", a: rest[i], b: h })),
      );
    } else if (c.phase === "qf") {
      const w = winners("qf"),
        ranked = hostRank(c, w, ["r16", "qf"]),
        hosts = ranked.slice(0, 2),
        rest = ranked.slice(2);
      planRound(
        s,
        c,
        "sf",
        hosts.map((h, i) => ({ stage: "sf", a: rest[i], b: h })),
      );
    } else if (c.phase === "sf") {
      const w = winners("sf"),
        [host] = hostRank(c, w, ["r16", "qf", "sf"]);
      planRound(s, c, "final", [
        { stage: "final", a: w.find((id) => id !== host), b: host },
      ]);
    } else finishCup(s, c);
  } else if (c.kind === "leagues-cup") {
    if (c.phase === "phase-one") {
      const mx = leaguesTable(c, c.leagues.mx),
        us = leaguesTable(c, c.leagues.us);
      c.phaseRows = Object.fromEntries(
        [...mx, ...us].map((r) => [r.clubId, r]),
      );
      const m = mx.slice(0, 4).map((r) => r.clubId),
        u = us.slice(0, 4).map((r) => r.clubId);
      c.knockoutSeeds = { mx: [...m], us: [...u] };
      const bracket = [
        [u[0], m[3]],
        [m[1], u[2]],
        [m[0], u[3]],
        [u[1], m[2]],
      ];
      planRound(
        s,
        c,
        "qf",
        bracket.map(([x, y]) => {
          const h = betterSeed(c, x, y);
          return { stage: "qf", a: h === x ? y : x, b: h };
        }),
      );
    } else if (c.phase === "qf") {
      const w = winners("qf");
      planRound(
        s,
        c,
        "sf",
        [
          [w[0], w[1]],
          [w[2], w[3]],
        ].map(([x, y]) => {
          const h = betterSeed(c, x, y);
          return { stage: "sf", a: h === x ? y : x, b: h };
        }),
      );
    } else if (c.phase === "sf") {
      const sfs = c.ties.filter((t) => t.stage === "sf" && t.round === c.round),
        w = sfs.map((t) => t.winner),
        l = sfs.map((t) => (t.winner === t.a ? t.b : t.a)),
        fh = betterSeed(c, w[0], w[1]),
        th = betterSeed(c, l[0], l[1]);
      planRound(s, c, "final", [
        { stage: "final", a: fh === w[0] ? w[1] : w[0], b: fh },
        { stage: "third", a: th === l[0] ? l[1] : l[0], b: th },
      ]);
    } else finishCup(s, c);
  } else if (c.kind === "central-american") {
    if (c.phase === "groups") {
      const { tables, winners: w, runners: r } = groupWinners(c);
      c.groupRanking = tables.map((t) => t.map((x) => x.clubId));
      c.groupsFinished = s.date;
      c.qfSeeds = [...w, ...r];
      // QF1: 1v8 · QF2: 4v5 · QF3: 2v7 · QF4: 3v6; higher seed hosts leg two.
      const rank = [...w, ...r];
      planRound(s, c, "qf", [
        { stage: "qf", a: rank[7], b: rank[0] },
        { stage: "qf", a: rank[4], b: rank[3] },
        { stage: "qf", a: rank[6], b: rank[1] },
        { stage: "qf", a: rank[5], b: rank[2] },
      ]);
    } else if (c.phase === "qf") {
      const qfs = c.ties.filter((t) => t.stage === "qf" && t.round === c.round),
        w = qfs.map((t) => t.winner),
        l = qfs.map((t) => (t.winner === t.a ? t.b : t.a));
      const sf = orient(
          s,
          c,
          [
            [w[0], w[1]],
            [w[2], w[3]],
          ],
          ["groups", "qf"],
        ),
        pi = orient(
          s,
          c,
          [
            [l[0], l[1]],
            [l[2], l[3]],
          ],
          ["groups", "qf"],
        );
      planRound(s, c, "sf", [
        { stage: "sf", a: sf[0][0], b: sf[0][1] },
        { stage: "sf", a: sf[1][0], b: sf[1][1] },
        { stage: "playin", a: pi[0][0], b: pi[0][1] },
        { stage: "playin", a: pi[1][0], b: pi[1][1] },
      ]);
    } else if (c.phase === "sf") {
      const sfs = c.ties.filter((t) => t.stage === "sf" && t.round === c.round),
        pis = c.ties.filter((t) => t.stage === "playin" && t.round === c.round);
      c.semifinalists = sfs.map((t) => (t.winner === t.a ? t.b : t.a));
      c.playinWinners = pis.map((t) => t.winner);
      const w = sfs.map((t) => t.winner),
        [[a, b]] = orient(s, c, [[w[0], w[1]]], ["groups", "qf", "sf"]);
      planRound(s, c, "final", [{ stage: "final", a, b }]);
    } else finishCup(s, c);
  } else if (c.kind === "caribbean") {
    if (c.phase === "groups") {
      const [A, B] = c.groups.map((g) =>
        concacafTable(c, g).map((r) => r.clubId),
      );
      c.groupRanking = [A, B];
      c.groupsFinished = s.date;
      planRound(s, c, "sf", [
        { stage: "sf", a: B[1], b: A[0] },
        { stage: "sf", a: A[1], b: B[0] },
      ]);
    } else if (c.phase === "sf") {
      const sfs = c.ties.filter((t) => t.stage === "sf" && t.round === c.round),
        w = sfs.map((t) => t.winner),
        l = sfs.map((t) => (t.winner === t.a ? t.b : t.a)),
        [[fa, fb]] = orient(s, c, [[w[0], w[1]]], ["groups", "sf"]),
        [[ta, tb]] = orient(s, c, [[l[0], l[1]]], ["groups", "sf"]);
      planRound(s, c, "final", [
        { stage: "final", a: fa, b: fb },
        { stage: "third", a: ta, b: tb },
      ]);
    } else finishCup(s, c);
  }
}
function finishCup(s, c) {
  const final = c.ties.find((t) => t.stage === "final" && t.round === c.round);
  if (!final?.winner) throw Error("نهائي كونكاكاف غير محسوم.");
  if (["leagues-cup", "caribbean"].includes(c.kind)) {
    const third = c.ties.find(
      (t) => t.stage === "third" && t.round === c.round,
    );
    if (!third?.winner) throw Error("مباراة المركز الثالث غير محسومة.");
    c.third = third.winner;
  }
  c.winner = final.winner;
  c.alive = [c.winner];
  c.phase = "complete";
  c.finished = s.date;
  c.nextDate = s.date;
  s.expansion.champions[c.kind] = c.winner;
  if (c.winner === s.clubId) {
    s.reputation = clamp(s.reputation + 3, 0, 100);
    message(s, {
      title: "بطل " + c.name,
      body:
        c.kind === "concacaf"
          ? "اللقب يؤهلك للإنتركونتيننتال ويدخل سجل تأهل كأس العالم."
          : "اللقب يفتح مسار التأهل لكأس الأبطال في الموسم القادم.",
      category: "matches",
    });
  }
}
export function concacafDay(s, c, simulate) {
  if (c.winner) return;
  for (const f of c.fixtures.filter((f) => !f.played && f.date === s.date)) {
    const t = c.ties.find((t) => t.id === f.tieId);
    simulate(s, f, () => {
      f.regulationHome = f.homeGoals;
      f.regulationAway = f.awayGoals;
      for (const side of ["home", "away"]) {
        f[side + "Yellows"] = Math.floor(random(s) * 5);
        f[side + "Reds"] = random(s) < 0.06 ? 1 : 0;
        f[side + "ConductPenalty"] = f[side + "Yellows"] + 3 * f[side + "Reds"];
      }
      if (t) settleTie(s, c, t, f);
      else if (
        c.kind === "leagues-cup" &&
        f.homeGoals === f.awayGoals &&
        !f.penaltyWinner
      ) {
        f.penaltyWinner = resolvePenalties(s, f);
        f.winner = f.penaltyWinner;
      }
    });
    if (
      ["groups", "phase-one"].includes(f.stage) &&
      [f.home, f.away].includes(s.clubId)
    ) {
      const a = f.home === s.clubId ? f.homeGoals : f.awayGoals,
        b = f.home === s.clubId ? f.awayGoals : f.homeGoals;
      post(
        s,
        concacafPrize(c.kind, a > b ? 300000 : a === b ? 120000 : 0),
        "cup-prize",
        "جائزة كونكاكاف تقديرية — " + c.name,
        f.id + "-prize",
      );
    }
    if (t?.winner && [t.a, t.b].includes(s.clubId)) {
      if (t.winner === s.clubId)
        post(
          s,
          concacafPrize(c.kind, t.stage === "final" ? 3000000 : 400000),
          "cup-prize",
          "جائزة كونكاكاف تقديرية — " + c.name,
          t.id + "-prize",
        );
      message(s, {
        title: (t.winner === s.clubId ? "تأهل / تتويج: " : "خروج: ") + c.name,
        body:
          CONCACAF_STAGES[t.stage] +
          (t.legs.length === 2
            ? " · مجموع " + t.aggregateA + "–" + t.aggregateB
            : " · " + f.homeGoals + "–" + f.awayGoals) +
          (f.decidedBy === "away-goals"
            ? "؛ حُسم بأهداف خارج الأرض في الوقت الأصلي."
            : f.penaltyWinner
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
  const ties = c.ties.filter((t) => t.round === c.round);
  if (
    ties.length &&
    ties.some((t) => !t.winner) &&
    !["groups", "phase-one"].includes(c.phase)
  )
    throw Error("مواجهة كونكاكاف غير محسومة.");
  if (["groups", "phase-one"].includes(c.phase) && c.ties.length === 0) {
    progress(s, c);
    return;
  }
  if (ties.length && ties.every((t) => t.winner)) {
    c.alive = ties
      .flatMap((t) => [t.a, t.b])
      .filter((id) => ties.some((t) => t.winner === id));
    progress(s, c);
  }
}
export { CONCACAF_KINDS };
