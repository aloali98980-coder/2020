import { extendedClub } from "../data/expandedCatalog.js";
// New-career simulation rules, NOT reproductions of every federation's play-offs.
// Closed/licensing-only connections never exchange clubs automatically.
const PLACES = {
  en: [3, 3],
  es: [3, 4],
  de: [2, 2],
  it: [3, 4],
  fr: [2, 2],
  eg: [3, 3],
};
export function promotionPlaces(high) {
  return high.promotionPlaces ?? PLACES[high.country]?.[high.tier - 1] ?? 2;
}
function clubRule(x, id) {
  return x.clubRules?.[id] || {};
}
export function rankedPromotionMoves(x, ordered, egyptMoves) {
  const pairs = [];
  const used = new Set();
  const divisionOf = new Map(
    x.divisions.flatMap((d) => d.clubs.map((id) => [id, d])),
  );
  const future = (id) => {
    const move = pairs.flat().find((m) => m[0] === id);
    return move?.[2] || divisionOf.get(id);
  };
  const eligible = (id, destination) => {
    if (used.has(id)) return false;
    const r = clubRule(x, id);
    if (r.ceilingTier && destination.tier < r.ceilingTier) return false;
    const parent = r.parentId && future(r.parentId);
    return !parent || parent.tier < destination.tier;
  };
  const insert = (up, low, down, high) => {
    pairs.push([
      [up, low, high],
      [down, high, low],
    ]);
    used.add(up);
    used.add(down);
  };
  const score = (id, d) => {
    const r = d.table.find((r) => r.clubId === id);
    return [
      r?.points / Math.max(1, r?.played || 0) || 0,
      ((r?.gf || 0) - (r?.ga || 0)) / Math.max(1, r?.played || 0),
    ];
  };
  for (const high of [...x.divisions].sort(
    (a, b) => a.tier - b.tier || a.id.localeCompare(b.id),
  )) {
    const lows = x.divisions.filter(
      (d) => d.country === high.country && d.tier === high.tier + 1,
    );
    if (
      !lows.length ||
      high.connection === "closed" ||
      lows.some((d) => d.connection === "closed")
    )
      continue;
    if (high.id === "eg-2" && egyptMoves) {
      for (let i = 0; i < egyptMoves.length; i += 2) {
        pairs.push(egyptMoves.slice(i, i + 2));
        used.add(egyptMoves[i][0]);
        used.add(egyptMoves[i + 1][0]);
      }
      continue;
    }
    // Multiple high groups sharing lower pools need an explicit geographic allocation.
    if (
      x.divisions.filter(
        (d) => d.country === high.country && d.tier === high.tier,
      ).length > 1
    )
      continue;
    const pools = lows.map((d) => ({
      d,
      ids: (ordered.get(d.id) || []).filter((id) => eligible(id, high)),
    }));
    const n = Math.min(
      promotionPlaces(high),
      Math.floor(high.clubs.length / 3),
      pools.reduce((sum, p) => sum + p.ids.length, 0),
    );
    const selected = [];
    // One eligible champion from EACH regional group, then best runners-up by PPG.
    if (lows.length > 1)
      for (const p of pools)
        if (p.ids.length && selected.length < n)
          selected.push([p.ids.shift(), p.d]);
    while (selected.length < n) {
      const options = pools
        .filter((p) => p.ids.length)
        .sort((a, b) => {
          const aa = score(a.ids[0], a.d),
            bb = score(b.ids[0], b.d);
          return (
            bb[0] - aa[0] || bb[1] - aa[1] || a.ids[0].localeCompare(b.ids[0])
          );
        });
      if (!options.length) break;
      const p = options[0];
      selected.push([p.ids.shift(), p.d]);
    }
    const forced = high.clubs.filter((id) => {
      const r = clubRule(x, id),
        parent = r.parentId && future(r.parentId);
      return parent && parent.tier >= high.tier && !used.has(id);
    });
    const down = [
      ...new Set([...forced, ...[...(ordered.get(high.id) || [])].reverse()]),
    ]
      .filter((id) => !used.has(id))
      .slice(0, selected.length);
    selected
      .slice(0, down.length)
      .forEach(([up, low], i) => insert(up, low, down[i], high));
  }
  // At the modeled bottom boundary we cannot invent a replacement club from an
  // unmodeled tier. Cancel the offending exchange rather than let parent/reserve
  // share a tier, delete a club, or silently create a fourth division.
  let changed = true;
  while (changed) {
    changed = false;
    for (const [id, r] of Object.entries(x.clubRules || {})) {
      const parent = r.parentId && future(r.parentId),
        reserve = future(id);
      if (!parent || !reserve || parent.tier < reserve.tier) continue;
      const i = pairs.findIndex((pair) =>
        pair.some((m) => m[0] === r.parentId && m[2].tier > m[1].tier),
      );
      const j =
        i >= 0 ? i : pairs.findIndex((pair) => pair.some((m) => m[0] === id));
      if (j >= 0) {
        pairs.splice(j, 1);
        changed = true;
        break;
      }
    }
  }
  return pairs.flat();
}
export function currentReserveRules(divisions) {
  const ids = new Set(divisions.flatMap((d) => d.clubs));
  return Object.fromEntries(
    [...ids].flatMap((id) => {
      const c = extendedClub(id);
      return c?.reserve
        ? [
            [
              id,
              {
                ceilingTier: c.ceilingTier || 2,
                ...(ids.has(c.parentId) ? { parentId: c.parentId } : {}),
              },
            ],
          ]
        : [];
    }),
  );
}
