import {
  CONCACAF_GUESTS,
  CONCACAF_GUEST_IDS,
  CONCACAF_CENTRAL,
  CONCACAF_CARIBBEAN,
} from "../../data/concacafGuests.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { region } from "../fifa/access.js";
export const CONCACAF_KINDS = [
  "concacaf",
  "leagues-cup",
  "central-american",
  "caribbean",
];
export const subregion = (id) => {
  const country = extendedClub(id)?.country;
  if (CONCACAF_CENTRAL.includes(country)) return "central";
  if (CONCACAF_CARIBBEAN.includes(country)) return "caribbean";
  if (country === "us" || country === "mx") return "north";
  return null;
};
// Modeled 2026 access: five Round-of-16 byes (three regional champions plus the
// two North American domestic champions) and 22 Round One clubs. Domestic cups,
// Canadian slots and playoffs are NOT modeled; league order fills those places.
export function concacafAccess(s) {
  const x = s.expansion;
  x.concacaf ??= { honours: {}, guestScores: {} };
  const known = new Set([
    ...x.divisions.flatMap((d) => d.clubs),
    ...CONCACAF_GUESTS.map((c) => c.id),
  ]);
  const rep = (a, b) =>
    (x.concacaf.guestScores[b] || 0) - (x.concacaf.guestScores[a] || 0) ||
    extendedClub(b).rep - extendedClub(a).rep ||
    a.localeCompare(b);
  const order = (country) => {
    const d = x.divisions.find((d) => d.country === country && d.tier === 1);
    if (!d) throw Error("دوري أعلى ناقص لتأهل كونكاكاف: " + country);
    const saved = (x.qualification[country] || []).filter(
      (id) => d.clubs.includes(id) && !extendedClub(id)?.reserve,
    );
    return [
      ...saved,
      ...d.clubs
        .filter((id) => !saved.includes(id) && !extendedClub(id)?.reserve)
        .sort(rep),
    ];
  };
  const mx = order("mx"),
    us = order("us");
  const guests = (list) =>
    CONCACAF_GUESTS.map((c) => c.id)
      .filter((id) => list.includes(extendedClub(id).country))
      .sort(rep);
  const central = guests(CONCACAF_CENTRAL),
    caribbean = guests(CONCACAF_CARIBBEAN);
  if (central.length !== 20 || caribbean.length !== 10)
    throw Error("قائمة ضيوف كونكاكاف غير مكتملة.");
  const first = s.seasonNumber === 1,
    h = x.concacaf.honours,
    out = {};
  const domestic = (id) =>
    first ? "scenario-reputation" : "domestic-results";
  out["leagues-cup"] = {
    entrants: [...mx, ...us.slice(0, 18)],
    qualification: [
      ...mx.map((clubId) => ({
        clubId,
        country: "mx",
        reason: domestic(),
        route: "phase-one",
      })),
      ...us.slice(0, 18).map((clubId) => ({
        clubId,
        country: "us",
        reason: domestic(),
        route: "phase-one",
      })),
    ],
  };
  for (const [kind, ids] of [
    ["central-american", central],
    ["caribbean", caribbean],
  ])
    out[kind] = {
      entrants: [...ids],
      qualification: ids.map((clubId) => ({
        clubId,
        country: extendedClub(clubId).country,
        reason: "guest-reference",
        route: "groups",
      })),
    };
  // Champions Cup: honours feed the regional slots from season two on; season
  // one uses reputation scenario seeds because there is no saved 2025 season.
  const used = new Set(),
    slots = [];
  const take = (preferred, pool, reason, route) => {
    let id =
      preferred && known.has(preferred) && !used.has(preferred)
        ? preferred
        : pool.find((c) => !used.has(c));
    if (!id) throw Error("تعذر استكمال مقاعد كأس أبطال كونكاكاف.");
    used.add(id);
    slots.push({ clubId: id, reason, route });
    return id;
  };
  const north = [...mx, ...us].sort(rep);
  const leagues = h["leagues-cup"] || {},
    ca = h["central-american"] || {},
    cb = h["caribbean"] || {};
  const champReason = first ? "scenario-reputation" : "regional-champion",
    qualReason = first ? "scenario-reputation" : "regional-qualifier";
  take(leagues.winner, north, champReason, "r16");
  take(ca.winner, central, champReason, "r16");
  take(cb.winner, caribbean, champReason, "r16");
  take(mx[0], mx, first ? "scenario-reputation" : "domestic-champion", "r16");
  take(us[0], us, first ? "scenario-reputation" : "domestic-champion", "r16");
  take(leagues.runnerUp, north, qualReason, "r1");
  take(leagues.third, north, qualReason, "r1");
  take(ca.runnerUp, central, qualReason, "r1");
  for (const id of ca.semifinalists || []) take(id, central, qualReason, "r1");
  for (let n = (ca.semifinalists || []).length; n < 2; n++)
    take(null, central, qualReason, "r1");
  for (const id of ca.playinWinners || []) take(id, central, qualReason, "r1");
  for (let n = (ca.playinWinners || []).length; n < 2; n++)
    take(null, central, qualReason, "r1");
  take(cb.runnerUp, caribbean, qualReason, "r1");
  take(cb.third, caribbean, qualReason, "r1");
  for (const id of mx.slice(1, 6)) take(id, mx, domestic(), "r1");
  for (const id of us.slice(1, 9)) take(id, us, domestic(), "r1");
  // Fill any duplicate-collision remainder from the same pools, keeping the
  // subregional counts: 5 byes + 22 Round One clubs, 27 distinct entrants.
  while (slots.filter((q) => q.route === "r1").length < 22) {
    const guestsUsed = slots.filter((q) =>
      CONCACAF_GUEST_IDS.has(q.clubId),
    ).length;
    take(null, guestsUsed < 9 ? [...central, ...caribbean] : north, domestic(), "r1");
  }
  const entrants = slots.map((q) => q.clubId);
  if (new Set(entrants).size !== 27 || entrants.some((id) => region(id) !== "concacaf"))
    throw Error("قائمة كأس أبطال كونكاكاف غير سليمة.");
  out.concacaf = {
    entrants,
    seeds: slots.filter((q) => q.route === "r16").map((q) => q.clubId),
    roundOne: slots.filter((q) => q.route === "r1").map((q) => q.clubId),
    qualification: slots.map((q) => ({
      ...q,
      country: extendedClub(q.clubId).country,
    })),
  };
  return out;
}
export function recordConcacafSeason(s) {
  const x = s.expansion;
  if (!x.concacafVersion) return;
  for (const c of x.cups.filter((c) => c.engine === "concacaf-v1" && c.winner)) {
    const entry = {
      winner: c.winner,
      runnerUp: c.finalists.find((id) => id !== c.winner),
      season: s.seasonNumber,
    };
    if (c.kind === "leagues-cup" || c.kind === "caribbean")
      entry.third = c.third;
    if (c.kind === "central-american") {
      entry.semifinalists = [...c.semifinalists];
      entry.playinWinners = [...c.playinWinners];
      entry.qualifiers = [c.winner, entry.runnerUp, ...c.semifinalists, ...c.playinWinners];
    }
    x.concacaf.honours[c.kind] = entry;
    for (const id of c.entrants.filter((id) => CONCACAF_GUEST_IDS.has(id))) {
      const points =
        c.fixtures
          .filter((f) => f.played && [f.home, f.away].includes(id))
          .reduce((n, f) => {
            const a = f.home === id ? f.regulationHome : f.regulationAway,
              b = f.home === id ? f.regulationAway : f.regulationHome;
            return (
              n +
              (c.kind === "leagues-cup" && a === b
                ? f.penaltyWinner === id
                  ? 2
                  : 1
                : a > b
                  ? 3
                  : a === b
                    ? 1
                    : 0)
            );
          }, 0) + (c.winner === id ? 10 : 0);
      x.concacaf.guestScores[id] =
        Math.round((x.concacaf.guestScores[id] || 0) * 0.6) + points;
    }
  }
}
