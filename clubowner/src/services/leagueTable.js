export function rankLeague(d) {
  const fallback = (a, b) =>
    b.gf - b.ga - (a.gf - a.ga) ||
    b.gf - a.gf ||
    a.clubId.localeCompare(b.clubId);
  const rows = [...d.table].sort(
    (a, b) => b.points - a.points || fallback(a, b),
  );
  if (d.tieBreak !== "head-to-head") return rows;
  const out = [];
  for (let i = 0; i < rows.length;) {
    let j = i + 1;
    while (j < rows.length && rows[j].points === rows[i].points) j++;
    const tied = rows.slice(i, j),
      ids = new Set(tied.map((r) => r.clubId)),
      mini = new Map(tied.map((r) => [r.clubId, { points: 0, gd: 0 }]));
    for (const f of d.fixtures.filter(
      (f) => f.played && ids.has(f.home) && ids.has(f.away),
    )) {
      const h = mini.get(f.home),
        a = mini.get(f.away);
      h.gd += f.homeGoals - f.awayGoals;
      a.gd += f.awayGoals - f.homeGoals;
      h.points +=
        f.homeGoals > f.awayGoals ? 3 : f.homeGoals === f.awayGoals ? 1 : 0;
      a.points +=
        f.awayGoals > f.homeGoals ? 3 : f.homeGoals === f.awayGoals ? 1 : 0;
    }
    out.push(
      ...tied.sort(
        (a, b) =>
          mini.get(b.clubId).points - mini.get(a.clubId).points ||
          mini.get(b.clubId).gd - mini.get(a.clubId).gd ||
          fallback(a, b),
      ),
    );
    i = j;
  }
  return out;
}
