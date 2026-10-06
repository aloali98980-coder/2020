import { CONCACAF_KINDS } from "../services/concacaf/access.js";
import { CONCACAF_ENGINE } from "../services/concacaf/engine.js";
import { CONCACAF_GUEST_IDS } from "../data/concacafGuests.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { region } from "../services/fifa/access.js";
import {
  concacafTable,
  leaguesTable,
  across,
  hostRank,
} from "../services/concacaf/table.js";
const ok = (v) => {
  if (!v) throw Error("بيانات بطولات كونكاكاف غير سليمة.");
};
const arr = (a, n) => Array.isArray(a) && a.length <= n;
const unique = (a) => new Set(a).size === a.length;
const same = (a, b) =>
  Array.isArray(a) &&
  a.length === b.length &&
  unique(a) &&
  a.every((v) => b.includes(v));
const num = (v) => Number.isSafeInteger(v) && v >= 0 && v <= 1000000;
const date = (v) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v;
const SIZES = {
  concacaf: 27,
  "leagues-cup": 36,
  "central-american": 20,
  caribbean: 10,
};
const rankScore = (c, id) =>
  (c.rankScores?.[id] || 0) * 100000 + (extendedClub(id)?.rep || 0);
export function validateConcacafState(s) {
  const x = s.expansion;
  if (x.concacafVersion !== undefined) ok([0, 1].includes(x.concacafVersion));
  const cups = x.cups.filter((c) => c.engine === CONCACAF_ENGINE);
  if (!x.concacafVersion) {
    ok(cups.length === 0);
    return;
  }
  ok(
    cups.length === 4 &&
      same(
        cups.map((c) => c.kind),
        CONCACAF_KINDS,
      ) &&
      x.concacaf?.honours &&
      x.concacaf.guestScores,
  );
  for (const c of cups) {
    ok(
      c.originalEntrants.length === SIZES[c.kind] &&
        unique(c.originalEntrants) &&
        c.originalEntrants.every((id) => region(id) === "concacaf"),
    );
    validateConcacafCup(c);
  }
  const by = Object.fromEntries(cups.map((c) => [c.kind, c]));
  ok(
    same(by["central-american"].originalEntrants, by["central-american"].entrants) &&
      same(by.caribbean.originalEntrants, by.caribbean.entrants),
  );
  const central = new Set(by["central-american"].originalEntrants),
    carib = new Set(by.caribbean.originalEntrants);
  ok(
    [...central].every((id) => !carib.has(id)) &&
      by.concacaf.originalEntrants.filter((id) => central.has(id)).length <= 6 &&
      by.concacaf.originalEntrants.filter((id) => carib.has(id)).length <= 3 &&
      by["leagues-cup"].originalEntrants.every(
        (id) => !central.has(id) && !carib.has(id),
      ),
  );
  ok(
    by["leagues-cup"].originalEntrants.filter(
      (id) => extendedClub(id).country === "mx",
    ).length === 18 &&
      by["leagues-cup"].originalEntrants.filter(
        (id) => extendedClub(id).country === "us",
      ).length === 18,
  );
  for (const [kind, h] of Object.entries(x.concacaf.honours)) {
    ok(
      CONCACAF_KINDS.includes(kind) &&
        region(h.winner) === "concacaf" &&
        region(h.runnerUp) === "concacaf" &&
        h.winner !== h.runnerUp &&
        num(h.season) &&
        h.season < s.seasonNumber,
    );
    if (kind === "leagues-cup" || kind === "caribbean")
      ok(
        region(h.third) === "concacaf" &&
          h.third !== h.winner &&
          h.third !== h.runnerUp,
      );
    if (kind === "central-american")
      ok(
        arr(h.semifinalists, 2) &&
          h.semifinalists.length === 2 &&
          arr(h.playinWinners, 2) &&
          h.playinWinners.length === 2 &&
          same(h.qualifiers, [
            h.winner,
            h.runnerUp,
            ...h.semifinalists,
            ...h.playinWinners,
          ]),
      );
  }
  for (const [id, n] of Object.entries(x.concacaf.guestScores))
    ok(CONCACAF_GUEST_IDS.has(id) && num(n));
}
const legsFor = (kind, stage) =>
  kind === "leagues-cup" ? 1 : kind === "concacaf" && stage === "final" ? 1 : 2;
function checkTie(c, t, fixtureMap) {
  const expected = legsFor(c.kind, t.stage);
  ok(
    ["r1", "r16", "qf", "sf", "playin", "third", "final"].includes(t.stage) &&
      arr(t.legs, 2) &&
      t.legs.length === expected &&
      num(t.round) &&
      t.round <= c.round &&
      t.a !== t.b &&
      c.entrants.includes(t.a) &&
      c.entrants.includes(t.b),
  );
  const fs = t.legs.map((id) => fixtureMap.get(id));
  ok(fs.every(Boolean));
  for (let i = 0; i < fs.length; i++) {
    const f = fs[i];
    ok(
      f.tieId === t.id &&
        f.stage === t.stage &&
        f.round === t.round &&
        f.leg === i + 1 &&
        f.home === (i ? t.b : t.a) &&
        f.away === (i ? t.a : t.b) &&
        f.neutral === false,
    );
    if (i) ok(fs[i - 1].date < f.date && (!f.played || fs[i - 1].played));
  }
  const total = (id) =>
    fs.reduce(
      (n, f) => n + (f.home === id ? f.homeGoals || 0 : f.awayGoals || 0),
      0,
    );
  ok(t.aggregateA === total(t.a) && t.aggregateB === total(t.b));
  const reg = (id) =>
    fs.reduce(
      (n, f) =>
        n +
        (f.home === id
          ? (f.regulationHome ?? f.homeGoals ?? 0)
          : (f.regulationAway ?? f.awayGoals ?? 0)),
      0,
    );
  const last = fs.at(-1);
  if (!last.played) {
    ok(!t.winner);
    return;
  }
  ok([t.a, t.b].includes(t.winner) && last.winner === t.winner);
  const ra = reg(t.a),
    rb = reg(t.b);
  if (expected === 2) {
    if (ra !== rb) {
      ok(
        t.winner === (ra > rb ? t.a : t.b) &&
          !last.extraTime &&
          !last.penaltyWinner &&
          last.decidedBy !== "away-goals",
      );
    } else {
      const awayA = fs
          .filter((f) => f.away === t.a)
          .reduce((n, f) => n + (f.regulationAway ?? 0), 0),
        awayB = fs
          .filter((f) => f.away === t.b)
          .reduce((n, f) => n + (f.regulationAway ?? 0), 0);
      if (awayA !== awayB)
        ok(
          t.winner === (awayA > awayB ? t.a : t.b) &&
            last.decidedBy === "away-goals" &&
            !last.extraTime &&
            !last.penaltyWinner,
        );
      else {
        ok(last.extraTime && last.decidedBy !== "away-goals");
        ok(
          t.aggregateA === t.aggregateB
            ? last.penaltyWinner === t.winner
            : t.winner === (t.aggregateA > t.aggregateB ? t.a : t.b),
        );
      }
    }
  } else if (ra !== rb)
    ok(
      t.winner === (ra > rb ? t.a : t.b) &&
        !last.extraTime &&
        !last.penaltyWinner,
    );
  else if (c.kind === "leagues-cup")
    ok(!last.extraTime && last.penaltyWinner === t.winner);
  else {
    ok(last.extraTime);
    ok(
      t.aggregateA === t.aggregateB
        ? last.penaltyWinner === t.winner
        : t.winner === (t.aggregateA > t.aggregateB ? t.a : t.b),
    );
  }
}
export function validateConcacafCup(c) {
  ok(
    CONCACAF_KINDS.includes(c.kind) &&
      c.engine === CONCACAF_ENGINE &&
      ["r1", "r16", "qf", "sf", "final", "complete", "groups", "phase-one"].includes(
        c.phase,
      ),
  );
  ok(
    arr(c.originalEntrants, 36) &&
      c.originalEntrants.length === SIZES[c.kind] &&
      unique(c.originalEntrants) &&
      same(c.entrants, c.originalEntrants),
  );
  ok(
    c.lots &&
      Object.keys(c.lots).length === c.entrants.length &&
      Object.values(c.lots).every(num) &&
      unique(Object.values(c.lots)),
  );
  const routes = {
    concacaf: ["r16", "r1"],
    "leagues-cup": ["phase-one"],
    "central-american": ["groups"],
    caribbean: ["groups"],
  };
  ok(
    arr(c.qualification, 40) &&
      same(
        c.qualification.map((q) => q.clubId),
        c.entrants,
      ),
  );
  for (const q of c.qualification)
    ok(
      q.country === extendedClub(q.clubId).country &&
        routes[c.kind].includes(q.route) &&
        [
          "scenario-reputation",
          "domestic-results",
          "domestic-champion",
          "regional-champion",
          "regional-qualifier",
          "guest-reference",
        ].includes(q.reason),
    );
  if (c.kind === "concacaf")
    ok(
      c.qualification.filter((q) => q.route === "r16").length === 5 &&
        c.qualification.filter((q) => q.route === "r1").length === 22 &&
        same(
          c.seeds,
          c.qualification.filter((q) => q.route === "r16").map((q) => q.clubId),
        ) &&
        same(
          c.roundOneClubs,
          c.qualification.filter((q) => q.route === "r1").map((q) => q.clubId),
        ),
    );
  ok(
    arr(c.fixtures, 70) &&
      unique(c.fixtures.map((f) => f.id)) &&
      arr(c.ties, 30) &&
      unique(c.ties.map((t) => t.id)) &&
      arr(c.results, 0),
  );
  const fixtureMap = new Map(c.fixtures.map((f) => [f.id, f]));
  for (const f of c.fixtures) {
    ok(
      typeof f.id === "string" &&
        f.id.length < 150 &&
        date(f.date) &&
        c.entrants.includes(f.home) &&
        c.entrants.includes(f.away) &&
        f.home !== f.away &&
        typeof f.played === "boolean" &&
        f.neutral === false &&
        num(f.round) &&
        f.round > 0 &&
        f.competition === c.name,
    );
    if (!f.played) {
      ok(!f.winner && !f.penaltyWinner);
      continue;
    }
    ok(
      num(f.homeGoals) &&
        num(f.awayGoals) &&
        num(f.regulationHome) &&
        num(f.regulationAway) &&
        num(f.homeConductPenalty) &&
        num(f.awayConductPenalty),
    );
    const level = f.regulationHome === f.regulationAway;
    if (f.penaltyWinner) {
      ok(
        (level || Boolean(f.tieId)) &&
          f.penaltyWinner === f.winner &&
          [f.home, f.away].includes(f.winner) &&
          num(f.penaltiesHome) &&
          num(f.penaltiesAway) &&
          f.penaltiesHome !== f.penaltiesAway &&
          f.penaltyWinner ===
            (f.penaltiesHome > f.penaltiesAway ? f.home : f.away),
      );
      ok(
        f.stage === "phase-one" ||
          (f.tieId &&
            (c.kind === "leagues-cup" ||
              ((c.kind === "concacaf" ||
                c.kind === "central-american" ||
                c.kind === "caribbean") &&
                f.extraTime))),
      );
    }
    if (f.stage === "groups") ok(!f.winner && !f.penaltyWinner);
    if (f.stage === "phase-one") {
      ok(c.kind === "leagues-cup");
      ok(level ? f.penaltyWinner && f.winner : !f.winner && !f.penaltyWinner);
    }
  }
  const links = [];
  for (const t of c.ties) {
    checkTie(c, t, fixtureMap);
    links.push(...t.legs);
  }
  ok(
    same(
      links,
      c.fixtures.filter((f) => !["groups", "phase-one"].includes(f.stage)).map((f) => f.id),
    ),
  );
  if (c.kind === "concacaf") validateChampions(c);
  if (c.kind === "leagues-cup") validateLeagues(c);
  if (c.kind === "central-american" || c.kind === "caribbean")
    validateRegional(c);
  if (c.winner) {
    const final = c.ties.filter((t) => t.stage === "final");
    ok(
      c.phase === "complete" &&
        date(c.finished) &&
        same(c.alive, [c.winner]) &&
        c.fixtures.every((f) => f.played) &&
        final.length === 1 &&
        final[0].winner === c.winner &&
        same(c.finalists, [final[0].a, final[0].b]),
    );
    if (["leagues-cup", "caribbean"].includes(c.kind)) {
      const third = c.ties.filter((t) => t.stage === "third");
      ok(third.length === 1 && third[0].winner === c.third);
    }
    if (c.kind === "central-american")
      ok(
        arr(c.semifinalists, 2) &&
          c.semifinalists.length === 2 &&
          arr(c.playinWinners, 2) &&
          c.playinWinners.length === 2,
      );
  } else ok(c.phase !== "complete");
}
function validateChampions(c) {
  const ranked = [...c.roundOneClubs].sort(
    (a, b) => rankScore(c, b) - rankScore(c, a) || a.localeCompare(b),
  );
  ok(
    same(c.r1Seeds, ranked.slice(0, 11)) &&
      same(c.r1Top3, ranked.slice(0, 3)),
  );
  const r1 = c.ties.filter((t) => t.stage === "r1");
  ok(
    r1.length === 11 &&
      same(
        r1.flatMap((t) => [t.a, t.b]),
        c.roundOneClubs,
      ) &&
      r1.every((t) => c.r1Seeds.includes(t.b) && !c.r1Seeds.includes(t.a)),
  );
  const r16 = c.ties.filter((t) => t.stage === "r16");
  if (r16.length) {
    ok(r1.every((t) => t.winner));
    const w = r1.map((t) => t.winner),
      designated = new Set(c.seeds);
    for (const t of r1)
      if (c.r1Top3.some((id) => [t.a, t.b].includes(id)))
        designated.add(t.winner);
    ok(
      r16.length === 8 &&
        same(
          r16.flatMap((t) => [t.a, t.b]),
          [...w, ...c.seeds],
        ) &&
        r16.every((t) => designated.has(t.b) && !designated.has(t.a)),
    );
  }
  const qf = c.ties.filter((t) => t.stage === "qf");
  if (qf.length) {
    ok(r16.every((t) => t.winner));
    const hosts = hostRank(c, r16.map((t) => t.winner), ["r16"]).slice(0, 4);
    ok(
      qf.length === 4 &&
        same(
          qf.flatMap((t) => [t.a, t.b]),
          r16.map((t) => t.winner),
        ) &&
        same(
          qf.map((t) => t.b),
          hosts,
        ),
    );
  }
  const sf = c.ties.filter((t) => t.stage === "sf");
  if (sf.length) {
    ok(qf.every((t) => t.winner));
    const hosts = hostRank(c, qf.map((t) => t.winner), ["r16", "qf"]).slice(0, 2);
    ok(
      sf.length === 2 &&
        same(
          sf.flatMap((t) => [t.a, t.b]),
          qf.map((t) => t.winner),
        ) &&
        same(
          sf.map((t) => t.b),
          hosts,
        ),
    );
  }
  const fin = c.ties.filter((t) => t.stage === "final");
  if (fin.length) {
    ok(sf.every((t) => t.winner));
    const [host] = hostRank(c, sf.map((t) => t.winner), ["r16", "qf", "sf"]);
    ok(
      fin.length === 1 &&
        same(fin[0] && [fin[0].a, fin[0].b], sf.map((t) => t.winner)) &&
        fin[0].b === host &&
        same(c.finalists, [fin[0].a, fin[0].b]),
    );
  }
}
function betterSeed(c, rows, a, b) {
  const score = (id) => {
    const r = rows[id];
    return [
      -r.points,
      -r.regWins,
      -(r.gf - r.ga),
      -r.gf,
      r.ga,
      r.conduct,
      c.lots[id],
    ];
  };
  const x = score(a),
    y = score(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i] ? a : b;
  return a.localeCompare(b) < 0 ? a : b;
}
function validateLeagues(c) {
  const fs = c.fixtures.filter((f) => f.stage === "phase-one");
  ok(
    fs.length === 54 &&
      c.leagues.mx.length === 18 &&
      c.leagues.us.length === 18 &&
      same([...c.leagues.mx, ...c.leagues.us], c.entrants),
  );
  for (const id of c.entrants) {
    const own = fs.filter((f) => [f.home, f.away].includes(id));
    ok(own.length === 3 && unique(own.map((f) => f.round)));
    const foes = own.map((f) => (f.home === id ? f.away : f.home));
    ok(unique(foes));
    const home = extendedClub(id).country;
    ok(foes.every((x) => extendedClub(x).country !== home));
  }
  for (let r = 1; r <= 3; r++)
    ok(fs.filter((f) => f.round === r).length === 18);
  const mx = leaguesTable(c, c.leagues.mx),
    us = leaguesTable(c, c.leagues.us);
  const qf = c.ties.filter((t) => t.stage === "qf");
  if (qf.length) {
    ok(
      fs.every((f) => f.played) &&
        JSON.stringify(c.knockoutSeeds.mx) ===
          JSON.stringify(mx.slice(0, 4).map((r) => r.clubId)) &&
        JSON.stringify(c.knockoutSeeds.us) ===
          JSON.stringify(us.slice(0, 4).map((r) => r.clubId)),
    );
    const rows = Object.fromEntries([...mx, ...us].map((r) => [r.clubId, r]));
    ok(
      JSON.stringify(
        Object.keys(c.phaseRows).sort(),
      ) === JSON.stringify(Object.keys(rows).sort()),
    );
    const m = c.knockoutSeeds.mx,
      u = c.knockoutSeeds.us,
      bracket = [
        [u[0], m[3]],
        [m[1], u[2]],
        [m[0], u[3]],
        [u[1], m[2]],
      ];
    ok(
      qf.length === 4 &&
        qf.every((t, i) => {
          const h = betterSeed(c, rows, bracket[i][0], bracket[i][1]);
          return (
            same([t.a, t.b], bracket[i]) &&
            t.b === h &&
            t.a === (h === bracket[i][0] ? bracket[i][1] : bracket[i][0])
          );
        }),
    );
  }
  const sf = c.ties.filter((t) => t.stage === "sf");
  if (sf.length) {
    ok(qf.every((t) => t.winner));
    const rows = Object.fromEntries(
      [...mx, ...us].map((r) => [r.clubId, r]),
    );
    const w = qf.map((t) => t.winner);
    ok(
      sf.length === 2 &&
        sf.every((t, i) => {
          const h = betterSeed(c, rows, w[i * 2], w[i * 2 + 1]);
          return (
            same([t.a, t.b], [w[i * 2], w[i * 2 + 1]]) && t.b === h
          );
        }),
    );
  }
  if (c.ties.some((t) => ["final", "third"].includes(t.stage))) {
    ok(sf.every((t) => t.winner));
    const rows = Object.fromEntries(
      [...mx, ...us].map((r) => [r.clubId, r]),
    );
    const w = sf.map((t) => t.winner),
      l = sf.map((t) => (t.winner === t.a ? t.b : t.a)),
      fin = c.ties.filter((t) => t.stage === "final"),
      third = c.ties.filter((t) => t.stage === "third");
    ok(
      fin.length === 1 &&
        third.length === 1 &&
        same([fin[0].a, fin[0].b], w) &&
        fin[0].b === betterSeed(c, rows, w[0], w[1]) &&
        same([third[0].a, third[0].b], l) &&
        third[0].b === betterSeed(c, rows, l[0], l[1]) &&
        same(c.finalists, [fin[0].a, fin[0].b]),
    );
  }
}
function validateRegional(c) {
  const n = c.kind === "central-american" ? 4 : 2;
  ok(
    c.groups.length === n &&
      unique(c.groups.map((g) => g.id)) &&
      same(
        c.groups.flatMap((g) => g.clubs),
        c.entrants,
      ) &&
      c.pots.length === 5 &&
      same(c.pots.flat(), c.entrants) &&
      c.pots.every((p) => p.length === n),
  );
  for (const g of c.groups) {
    ok(
      g.clubs.length === 5 &&
        c.pots.every((p) => g.clubs.filter((id) => p.includes(id)).length === 1),
    );
    const fs = c.fixtures.filter(
      (f) => f.stage === "groups" && f.group === g.id,
    );
    ok(fs.length === 10);
    for (let r = 1; r <= 5; r++)
      ok(fs.filter((f) => f.round === r).length === 2);
    for (const id of g.clubs) {
      const own = fs.filter((f) => [f.home, f.away].includes(id));
      ok(own.length === 4 && unique(own.map((f) => f.round)));
      ok(
        unique(own.map((f) => (f.home === id ? f.away : f.home))) &&
          own.filter((f) => f.home === id).length === 2,
      );
    }
  }
  if (c.groupRanking)
    ok(
      date(c.groupsFinished) &&
        c.groups.every(
          (g, i) =>
            JSON.stringify(c.groupRanking[i]) ===
            JSON.stringify(concacafTable(c, g).map((r) => r.clubId)),
        ) &&
        c.fixtures.filter((f) => f.stage === "groups").every((f) => f.played),
    );
  if (c.kind === "central-american") {
    const tables = c.groups.map((g) => concacafTable(c, g)),
      rows = (i) =>
        tables
          .map((t) => ({
            ...t[i],
            rep: extendedClub(t[i].clubId)?.rep || 0,
          }))
          .sort(across)
          .map((r) => r.clubId),
      w = rows(0),
      r = rows(1);
    const qf = c.ties.filter((t) => t.stage === "qf");
    if (qf.length) {
      ok(
        c.groupRanking &&
          JSON.stringify(c.qfSeeds) === JSON.stringify([...w, ...r]),
      );
      const rank = [...w, ...r],
        expect = [
          [rank[7], rank[0]],
          [rank[4], rank[3]],
          [rank[6], rank[1]],
          [rank[5], rank[2]],
        ];
      ok(
        qf.length === 4 &&
          qf.every((t, i) => t.a === expect[i][0] && t.b === expect[i][1]),
      );
    }
    const sf = c.ties.filter((t) => t.stage === "sf"),
      pi = c.ties.filter((t) => t.stage === "playin");
    if (sf.length || pi.length) {
      ok(qf.every((t) => t.winner));
      const qw = qf.map((t) => t.winner),
        ql = qf.map((t) => (t.winner === t.a ? t.b : t.a));
      ok(
        sf.length === 2 &&
          pi.length === 2 &&
          sf[0].round === pi[0].round &&
          same([sf[0].a, sf[0].b], [qw[0], qw[1]]) &&
          same([sf[1].a, sf[1].b], [qw[2], qw[3]]) &&
          same([pi[0].a, pi[0].b], [ql[0], ql[1]]) &&
          same([pi[1].a, pi[1].b], [ql[2], ql[3]]) &&
          [sf[0], sf[1], pi[0], pi[1]].every(
            (t) => hostRank(c, [t.a, t.b], ["groups", "qf"])[0] === t.b,
          ),
      );
    }
    const fin = c.ties.filter((t) => t.stage === "final");
    if (fin.length) {
      ok(
        sf.every((t) => t.winner) &&
          pi.every((t) => t.winner) &&
          same(c.semifinalists, sf.map((t) => (t.winner === t.a ? t.b : t.a))) &&
          same(c.playinWinners, pi.map((t) => t.winner)),
      );
      const w2 = sf.map((t) => t.winner);
      ok(
        fin.length === 1 &&
          same([fin[0].a, fin[0].b], w2) &&
          hostRank(c, w2, ["groups", "qf", "sf"])[0] === fin[0].b &&
          same(c.finalists, [fin[0].a, fin[0].b]),
      );
    }
  } else {
    const sf = c.ties.filter((t) => t.stage === "sf");
    if (sf.length) {
      ok(c.groupRanking);
      const [A, B] = c.groups.map((g) =>
        concacafTable(c, g).map((r) => r.clubId),
      );
      ok(
        sf.length === 2 &&
          sf[0].a === B[1] &&
          sf[0].b === A[0] &&
          sf[1].a === A[1] &&
          sf[1].b === B[0],
      );
    }
    if (c.ties.some((t) => ["final", "third"].includes(t.stage))) {
      ok(sf.every((t) => t.winner));
      const w = sf.map((t) => t.winner),
        l = sf.map((t) => (t.winner === t.a ? t.b : t.a)),
        fin = c.ties.filter((t) => t.stage === "final"),
        third = c.ties.filter((t) => t.stage === "third");
      ok(
        fin.length === 1 &&
          third.length === 1 &&
          same([fin[0].a, fin[0].b], w) &&
          hostRank(c, w, ["groups", "sf"])[0] === fin[0].b &&
          same([third[0].a, third[0].b], l) &&
          hostRank(c, l, ["groups", "sf"])[0] === third[0].b &&
          same(c.finalists, [fin[0].a, fin[0].b]),
      );
    }
  }
}
