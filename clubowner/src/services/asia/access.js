import {
  ASIAN_GUESTS,
  ASIAN_GUEST_IDS,
  ASIAN_WEST,
  ASIAN_EAST,
} from "../../data/asianGuests.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { afcEligible } from "../fifa/access.js";
export const ASIA_KINDS = ["afc", "afc-two", "afc-challenge"];
export const zone = (id) =>
  ASIAN_WEST.includes(extendedClub(id)?.country)
    ? "west"
    : ASIAN_EAST.includes(extendedClub(id)?.country) && afcEligible(id)
      ? "east"
      : null;
export const ALLOCATION = {
  afc: {
    west: { sa: 5, ae: 4, qa: 3, ir: 3, uz: 2, iq: 1 },
    east: { jp: 4, kr: 4, cn: 2, au: 2, th: 3, my: 1, vn: 1, hk: 1 },
  },
  "afc-two": {
    west: {
      sa: 1,
      ae: 1,
      qa: 1,
      ir: 1,
      uz: 1,
      iq: 1,
      jo: 2,
      bh: 2,
      om: 2,
      in: 2,
      tm: 1,
      kw: 1,
    },
    east: {
      jp: 1,
      kr: 1,
      cn: 1,
      au: 1,
      th: 1,
      my: 2,
      vn: 2,
      sg: 2,
      hk: 1,
      id: 2,
      ph: 1,
      kh: 1,
    },
  },
  "afc-challenge": {
    west: {
      kw: 1,
      tm: 1,
      lb: 1,
      tj: 1,
      kg: 1,
      bd: 1,
      bt: 1,
      sy: 1,
      mv: 1,
      in: 1,
    },
    east: { mm: 2, tw: 2, ph: 1, kh: 1 },
  },
};
export function asiaAccess(s) {
  const x = s.expansion;
  x.asia ??= { honours: {}, guestScores: {} };
  const known = [
    ...x.divisions.flatMap((d) => d.clubs),
    ...ASIAN_GUESTS.map((c) => c.id),
  ];
  const all = [
      ...x.divisions.filter((d) => d.tier === 1).flatMap((d) => d.clubs),
      ...ASIAN_GUESTS.map((c) => c.id),
    ],
    used = new Set(),
    out = {};
  const rep = (a, b) =>
    (x.asia.guestScores[b] || 0) - (x.asia.guestScores[a] || 0) ||
    extendedClub(b).rep - extendedClub(a).rep ||
    a.localeCompare(b);
  const available = () =>
    all.filter(
      (id) => !used.has(id) && afcEligible(id) && !extendedClub(id).reserve,
    );
  const countryOrder = (country) => {
    const ids = available().filter(
        (id) => extendedClub(id).country === country,
      ),
      order = x.qualification[country];
    return order
      ? [
          ...order.filter((id) => ids.includes(id)),
          ...ids.filter((id) => !order.includes(id)).sort(rep),
        ]
      : ids.sort(rep);
  };
  const h = x.asia.honours,
    forced = {
      afc: [h.afc?.winner, h["afc-two"]?.winner],
      "afc-two": [h["afc-challenge"]?.winner, h["afc-challenge"]?.runnerUp],
    };
  for (const kind of ASIA_KINDS) {
    const selected = [],
      reasons = {},
      pathOnly = new Set();
    for (const z of ["west", "east"]) {
      const target = Object.values(ALLOCATION[kind][z]).reduce(
        (a, b) => a + b,
        0,
      );
      let chosen = [];
      for (const [country, n] of Object.entries(ALLOCATION[kind][z]))
        chosen.push(
          ...countryOrder(country)
            .filter((id) => !chosen.includes(id))
            .slice(0, n),
        );
      const normalDirect = chosen
        .slice()
        .sort(rep)
        .slice(0, kind === "afc" ? 14 : 12);
      const lowerPath = forced[kind]?.[1];
      if (
        lowerPath &&
        zone(lowerPath) === z &&
        !normalDirect.includes(lowerPath)
      )
        pathOnly.add(lowerPath);
      const protectedIds = (forced[kind] || []).filter(
        (id) => id && zone(id) === z && !used.has(id) && known.includes(id),
      );
      for (const [i, id] of (forced[kind] || []).entries())
        if (protectedIds.includes(id)) {
          if (!chosen.includes(id)) chosen.push(id);
          reasons[id] = i === 0 ? "titleholder" : "lower-title-path";
        }
      chosen = chosen
        .sort(
          (a, b) =>
            Number(protectedIds.includes(b)) -
              Number(protectedIds.includes(a)) || rep(a, b),
        )
        .slice(0, target);
      for (const id of available()
        .filter((id) => zone(id) === z)
        .sort(rep)) {
        if (chosen.length === target) break;
        if (!chosen.includes(id)) chosen.push(id);
      }
      if (chosen.length !== target)
        throw Error("قائمة التأهل الآسيوي غير مكتملة: " + kind + "/" + z);
      // Reserve enough association slots for every possible preliminary drop-down.
      if (kind === "afc-challenge") {
        const prelim = out["afc-two"].qualifiers.filter((id) => zone(id) === z),
          max = z === "west" ? 3 : 2;
        const cap = (country) =>
            max -
            Math.min(
              2,
              prelim.filter((id) => extendedClub(id).country === country)
                .length,
            ),
          counts = {};
        const candidates = [
          ...chosen,
          ...available()
            .filter((id) => zone(id) === z && !chosen.includes(id))
            .sort(rep),
        ];
        chosen = [];
        for (const id of candidates) {
          const country = extendedClub(id).country;
          if ((counts[country] || 0) >= cap(country)) continue;
          chosen.push(id);
          counts[country] = (counts[country] || 0) + 1;
          if (chosen.length === target) break;
        }
        if (chosen.length !== target)
          throw Error("لا توجد مقاعد آمنة للمجموعات الآسيوية.");
      }
      if (kind === "afc") {
        for (const country of new Set(
          chosen.map((id) => extendedClub(id).country),
        ))
          while (
            chosen.filter((id) => extendedClub(id).country === country).length >
            6
          ) {
            const remove = [...chosen]
              .reverse()
              .find(
                (id) =>
                  extendedClub(id).country === country &&
                  !protectedIds.includes(id),
              );
            chosen = chosen.filter((id) => id !== remove);
          }
        for (const id of available()
          .filter((id) => zone(id) === z)
          .sort(rep)) {
          if (chosen.length === target) break;
          const country = extendedClub(id).country;
          if (
            !chosen.includes(id) &&
            chosen.filter((id) => extendedClub(id).country === country).length <
              6
          )
            chosen.push(id);
        }
      }
      selected.push(...chosen);
      chosen.forEach((id) => used.add(id));
    }
    const direct = [],
      qualifiers = [];
    for (const z of ["west", "east"]) {
      const ids = selected.filter((id) => zone(id) === z).sort(rep);
      if (kind === "afc-challenge") {
        direct.push(...ids);
        continue;
      }
      const count = kind === "afc" ? 14 : 12,
        top = ids.filter((id) => !pathOnly.has(id)).slice(0, count),
        auto = forced[kind]?.[0],
        path = forced[kind]?.[1];
      if (auto && ids.includes(auto) && !top.includes(auto)) {
        top.pop();
        top.unshift(auto);
      }
      if (path && ids.includes(path) && !top.includes(path))
        reasons[path] = "lower-title-path";
      direct.push(...top);
      qualifiers.push(...ids.filter((id) => !top.includes(id)));
    }
    out[kind] = {
      entrants: selected,
      direct,
      qualifiers,
      qualification: selected.map((clubId) => ({
        clubId,
        zone: zone(clubId),
        country: extendedClub(clubId).country,
        reason:
          reasons[clubId] ||
          (ASIAN_GUEST_IDS.has(clubId)
            ? "guest-reference"
            : s.seasonNumber === 1
              ? "scenario-reputation"
              : "domestic-results"),
        route: direct.includes(clubId) ? "direct" : "preliminary",
      })),
    };
  }
  return out;
}
export function recordAsianSeason(s) {
  const x = s.expansion;
  if (!x.asiaVersion) return;
  for (const c of x.cups.filter((c) => c.engine === "asia-v1" && c.winner)) {
    x.asia.honours[c.kind] = {
      winner: c.winner,
      runnerUp: c.finalists.find((id) => id !== c.winner),
      season: s.seasonNumber,
    };
    for (const id of c.entrants.filter((id) => ASIAN_GUEST_IDS.has(id))) {
      const points =
        c.fixtures
          .filter((f) => f.played && [f.home, f.away].includes(id))
          .reduce((n, f) => {
            const a = f.home === id ? f.regulationHome : f.regulationAway,
              b = f.home === id ? f.regulationAway : f.regulationHome;
            return n + (a > b ? 3 : a === b ? 1 : 0);
          }, 0) + (c.winner === id ? 10 : 0);
      x.asia.guestScores[id] =
        Math.round((x.asia.guestScores[id] || 0) * 0.6) + points;
    }
  }
}
