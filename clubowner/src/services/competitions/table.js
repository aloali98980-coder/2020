const row = (clubId) => ({
  clubId,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  gf: 0,
  ga: 0,
  points: 0,
  awayGoals: 0,
  conduct: 0,
  reds: 0,
  yellows: 0,
});
export function rawTable(clubs, fixtures) {
  const map = new Map(clubs.map((id) => [id, row(id)]));
  for (const f of fixtures.filter((f) => f.played)) {
    if (!map.has(f.home) || !map.has(f.away)) continue;
    for (const [id, g, ag, away, red, yellow] of [
      [f.home, f.homeGoals, f.awayGoals, false, f.homeReds, f.homeYellows],
      [f.away, f.awayGoals, f.homeGoals, true, f.awayReds, f.awayYellows],
    ]) {
      const r = map.get(id);
      r.played++;
      r.gf += g;
      r.ga += ag;
      if (away) r.awayGoals += g;
      r.conduct += (away ? f.awayConductPenalty : f.homeConductPenalty) || 0;
      r.reds += red || 0;
      r.yellows += yellow || 0;
      if (g > ag) {
        r.wins++;
        r.points += 3;
      } else if (g === ag) {
        r.draws++;
        r.points++;
      } else r.losses++;
    }
  }
  return [...map.values()];
}
export function groupTable(c, g) {
  const fixtures = c.fixtures.filter(
      (f) => f.stage === "groups" && f.group === g.id,
    ),
    rows = rawTable(g.clubs, fixtures);
  const overall = (a, b) =>
    b.gf - b.ga - (a.gf - a.ga) ||
    b.gf - a.gf ||
    (c.tableRule === "caf"
      ? b.awayGoals - a.awayGoals
      : c.tableRule === "fifa"
        ? a.conduct - b.conduct
        : a.reds - b.reds || a.yellows - b.yellows) ||
    c.lots[a.clubId] - c.lots[b.clubId];
  rows.sort((a, b) => b.points - a.points || overall(a, b));
  const out = [];
  for (let i = 0; i < rows.length;) {
    let j = i + 1;
    while (j < rows.length && rows[j].points === rows[i].points) j++;
    const resolve = (tied) => {
      const mini = new Map(
        rawTable(
          tied.map((r) => r.clubId),
          fixtures,
        ).map((r) => [r.clubId, r]),
      );
      const h2h = (a, b) => {
        const x = mini.get(a.clubId),
          y = mini.get(b.clubId);
        return (
          y.points - x.points ||
          y.gf - y.ga - (x.gf - x.ga) ||
          y.gf - x.gf ||
          (c.tableRule === "caf" ? y.awayGoals - x.awayGoals : 0)
        );
      };
      const sorted = [...tied].sort((a, b) => h2h(a, b) || overall(a, b)),
        result = [];
      for (let a = 0; a < sorted.length;) {
        let b = a + 1;
        while (b < sorted.length && h2h(sorted[a], sorted[b]) === 0) b++;
        const subset = sorted.slice(a, b);
        result.push(
          ...(["caf", "fifa"].includes(c.tableRule) &&
          subset.length > 1 &&
          subset.length < tied.length
            ? resolve(subset)
            : subset),
        );
        a = b;
      }
      return result;
    };
    out.push(...resolve(rows.slice(i, j)));
    i = j;
  }
  return out.map((r) => ({ ...r, lot: c.lots[r.clubId] }));
}
export function compareAcross(a, b) {
  return (
    b.points - a.points ||
    b.gf - b.ga - (a.gf - a.ga) ||
    b.gf - a.gf ||
    a.reds - b.reds ||
    a.yellows - b.yellows ||
    (a.lot ?? 0) - (b.lot ?? 0) ||
    a.clubId.localeCompare(b.clubId)
  );
}
