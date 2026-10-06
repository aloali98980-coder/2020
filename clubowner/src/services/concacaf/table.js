import { rawTable } from "../competitions/table.js";
import { extendedClub } from "../../data/expandedCatalog.js";
// Group ranking for the two regional cups: points, overall difference, overall
// goals, then head-to-head points, head-to-head difference/goals (only when
// more than two clubs are tied), discipline, reputation ranking, saved lots.
export function concacafTable(c, g) {
  const fs = c.fixtures.filter((f) => f.stage === "groups" && f.group === g.id),
    rows = rawTable(g.clubs, fs);
  const rankOf = (id) =>
    (c.rankScores?.[id] || 0) * 100000 +
    (extendedClub(id)?.rep || 0);
  const lots = (a, b) =>
    a.conduct - b.conduct ||
    rankOf(b.clubId) - rankOf(a.clubId) ||
    c.lots[a.clubId] - c.lots[b.clubId];
  const overall = (a, b) => b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf;
  const finish = (tied) => {
    if (tied.length < 2) return tied;
    const mini = new Map(
      rawTable(
        tied.map((r) => r.clubId),
        fs,
      ).map((r) => [r.clubId, r]),
    );
    const h2h = (a, b) => {
      const x = mini.get(a.clubId),
        y = mini.get(b.clubId);
      return (
        y.points - x.points ||
        (tied.length > 2 ? y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf : 0)
      );
    };
    const sorted = [...tied].sort((a, b) => h2h(a, b) || lots(a, b)),
      out = [];
    for (let i = 0; i < sorted.length; ) {
      let j = i + 1;
      while (j < sorted.length && h2h(sorted[i], sorted[j]) === 0) j++;
      const block = sorted.slice(i, j);
      out.push(
        ...(block.length > 1 && block.length < tied.length
          ? finish(block)
          : block.sort(lots)),
      );
      i = j;
    }
    return out;
  };
  const out = [];
  const pts = [...rows].sort((a, b) => b.points - a.points);
  for (let i = 0; i < pts.length; ) {
    let j = i + 1;
    while (j < pts.length && pts[j].points === pts[i].points) j++;
    const block = pts.slice(i, j),
      settled = [];
    const ov = [...block].sort(overall);
    for (let a = 0; a < ov.length; ) {
      let b = a + 1;
      while (b < ov.length && overall(ov[a], ov[b]) === 0) b++;
      settled.push(...finish(ov.slice(a, b)));
      a = b;
    }
    out.push(...settled);
    i = j;
  }
  return out.map((r) => ({ ...r, lot: c.lots[r.clubId] }));
}
// Leagues Cup Phase One: separate league tables, no draws. Regulation win 3,
// shootout win 2, shootout loss 1. Tiebreakers: regulation wins, difference,
// goals, fewest conceded, discipline, reputation, lots.
export function leaguesTable(c, ids) {
  const fs = c.fixtures.filter((f) => f.stage === "phase-one" && f.played),
    map = new Map(
      ids.map((clubId) => [
        clubId,
        {
          clubId,
          played: 0,
          regWins: 0,
          shootWins: 0,
          shootLosses: 0,
          losses: 0,
          gf: 0,
          ga: 0,
          points: 0,
          conduct: 0,
        },
      ]),
    );
  for (const f of fs) {
    if (!map.has(f.home) && !map.has(f.away)) continue;
    const h = f.regulationHome ?? f.homeGoals,
      a = f.regulationAway ?? f.awayGoals;
    for (const [id, g, ag, pen] of [
      [f.home, h, a, f.homeConductPenalty || 0],
      [f.away, a, h, f.awayConductPenalty || 0],
    ]) {
      const r = map.get(id);
      if (!r) continue;
      r.played++;
      r.gf += g;
      r.ga += ag;
      r.conduct += pen;
      if (g > ag) {
        r.regWins++;
        r.points += 3;
      } else if (g < ag) r.losses++;
      else if (f.penaltyWinner === id) {
        r.shootWins++;
        r.points += 2;
      } else {
        r.shootLosses++;
        r.points += 1;
      }
    }
  }
  return [...map.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.regWins - a.regWins ||
        b.gf - b.ga - (a.gf - a.ga) ||
        b.gf - a.gf ||
        a.ga - b.ga ||
        a.conduct - b.conduct ||
        (extendedClub(b.clubId)?.rep || 0) -
          (extendedClub(a.clubId)?.rep || 0) ||
        c.lots[a.clubId] - c.lots[b.clubId],
    )
    .map((r) => ({ ...r, lot: c.lots[r.clubId] }));
}
export const across = (a, b) =>
  b.points - a.points ||
  b.gf - b.ga - (a.gf - a.ga) ||
  b.gf - a.gf ||
  a.conduct - b.conduct ||
  (b.rep || 0) - (a.rep || 0) ||
  a.lot - b.lot;
// Second-leg hosting record: regulation-time results across selected stages.
// Points, difference, goals, away goals, wins, away wins, discipline, then
// reputation and saved lots. Extra time and shootouts never add ranking points.
export function hostRank(c, ids, stages) {
  const rows = new Map(
    ids.map((clubId) => [
      clubId,
      {
        clubId,
        points: 0,
        gf: 0,
        ga: 0,
        awayGoals: 0,
        wins: 0,
        awayWins: 0,
        conduct: 0,
      },
    ]),
  );
  for (const f of c.fixtures.filter(
    (f) => f.played && stages.includes(f.stage),
  )) {
    const h = f.regulationHome ?? f.homeGoals,
      a = f.regulationAway ?? f.awayGoals;
    for (const [id, g, ag, away, pen] of [
      [f.home, h, a, false, f.homeConductPenalty || 0],
      [f.away, a, h, true, f.awayConductPenalty || 0],
    ]) {
      const r = rows.get(id);
      if (!r) continue;
      r.gf += g;
      r.ga += ag;
      if (away) r.awayGoals += g;
      r.conduct += pen;
      if (g > ag) {
        r.points += 3;
        r.wins++;
        if (away) r.awayWins++;
      } else if (g === ag) r.points++;
    }
  }
  return [...rows.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.gf - b.ga - (a.gf - a.ga) ||
        b.gf - a.gf ||
        b.awayGoals - a.awayGoals ||
        b.wins - a.wins ||
        b.awayWins - a.awayWins ||
        a.conduct - b.conduct ||
        (extendedClub(b.clubId)?.rep || 0) -
          (extendedClub(a.clubId)?.rep || 0) ||
        c.lots[a.clubId] - c.lots[b.clubId],
    )
    .map((r) => r.clubId);
}
