export function europeanTable(c) {
  const map = new Map(
    c.entrants.map((clubId) => [
      clubId,
      {
        clubId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        points: 0,
        awayGoals: 0,
        awayWins: 0,
        discipline: 0,
        opponentPoints: 0,
        opponentGD: 0,
        opponentGoals: 0,
        coefficient: c.coefficients[clubId] || 0,
      },
    ]),
  );
  const games = c.fixtures.filter((f) => f.stage === "league" && f.played);
  for (const f of games)
    for (const [id, g, ag, away, cards] of [
      [f.home, f.homeGoals, f.awayGoals, false, f.homeDiscipline],
      [f.away, f.awayGoals, f.homeGoals, true, f.awayDiscipline],
    ]) {
      const r = map.get(id);
      r.played++;
      r.gf += g;
      r.ga += ag;
      r.discipline += cards || 0;
      if (away) r.awayGoals += g;
      if (g > ag) {
        r.wins++;
        r.points += 3;
        if (away) r.awayWins++;
      } else if (g === ag) {
        r.draws++;
        r.points++;
      } else r.losses++;
    }
  // Only opponents actually faced count in an interim table; all eight/six count in the final table.
  for (const f of games)
    for (const [id, opponent] of [
      [f.home, f.away],
      [f.away, f.home],
    ]) {
      const r = map.get(id),
        o = map.get(opponent);
      r.opponentPoints += o.points;
      r.opponentGD += o.gf - o.ga;
      r.opponentGoals += o.gf;
    }
  return [...map.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.gf - b.ga - (a.gf - a.ga) ||
      b.gf - a.gf ||
      b.awayGoals - a.awayGoals ||
      b.wins - a.wins ||
      b.awayWins - a.awayWins ||
      b.opponentPoints - a.opponentPoints ||
      b.opponentGD - a.opponentGD ||
      b.opponentGoals - a.opponentGoals ||
      a.discipline - b.discipline ||
      b.coefficient - a.coefficient ||
      a.clubId.localeCompare(b.clubId),
  );
}
