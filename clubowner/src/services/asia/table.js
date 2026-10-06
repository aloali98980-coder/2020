import { rawTable } from "../competitions/table.js";
export const shootoutKey = (ids) => [...ids].sort().join("|");
function partitions(rows, compare) {
  const sorted = [...rows].sort(compare),
    out = [];
  for (const r of sorted) {
    if (!out.length || compare(out.at(-1)[0], r) !== 0) out.push([]);
    out.at(-1).push(r);
  }
  return out;
}
export function asiaTable(c, g, collect) {
  const fs = c.fixtures.filter((f) => f.stage === "groups" && f.group === g.id),
    rows = rawTable(g.clubs, fs);
  const lots = (a, b) =>
    a.conduct - b.conduct || c.lots[a.clubId] - c.lots[b.clubId];
  const overall = (a, b) =>
    b.gf - b.ga - (a.gf - a.ga) ||
    b.gf - a.gf ||
    (c.kind === "afc" ? b.wins - a.wins : 0);
  const finish = (tied) =>
    partitions(tied, overall).flatMap((block) => {
      if (block.length === 2 && fs.length && fs.every((f) => f.played)) {
        const ids = block.map((r) => r.clubId),
          last = ids.map(
            (id) =>
              fs
                .filter((f) => [f.home, f.away].includes(id))
                .sort(
                  (a, b) => b.date.localeCompare(a.date) || b.round - a.round,
                )[0],
          );
        if (last[0]?.id === last[1]?.id) {
          const key = shootoutKey(ids),
            result = c.tableShootouts?.[key];
          if (result)
            return [...block].sort(
              (a, b) =>
                Number(b.clubId === result.winner) -
                Number(a.clubId === result.winner),
            );
          collect?.(key, last[0]);
        }
      }
      return block.sort(lots);
    });
  const head = (tied) => {
    if (tied.length < 2) return tied;
    const mini = new Map(
      rawTable(
        tied.map((r) => r.clubId),
        fs,
      ).map((r) => [r.clubId, r]),
    );
    const groups = partitions(tied, (a, b) => {
      const x = mini.get(a.clubId),
        y = mini.get(b.clubId);
      return y.points - x.points || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf;
    });
    return groups.length === 1 ? finish(tied) : groups.flatMap(head);
  };
  return partitions(rows, (a, b) => b.points - a.points)
    .flatMap(c.kind === "afc" ? finish : head)
    .map((r) => ({ ...r, lot: c.lots[r.clubId] }));
}
export const across = (a, b) =>
  b.points - a.points ||
  b.gf - b.ga - (a.gf - a.ga) ||
  b.gf - a.gf ||
  a.conduct - b.conduct ||
  a.lot - b.lot;
