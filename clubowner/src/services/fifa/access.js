import { ASIAN_GUEST_IDS } from "../../data/asianGuests.js";
import { CONCACAF_GUEST_IDS } from "../../data/concacafGuests.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { OFC_ENTRANTS, OFC_AUCKLAND } from "../../data/fifaGuests.js";
import { EUROPEAN_COUNTRIES } from "../europe/engine.js";
export const REGIONS = ["uefa", "caf", "afc", "conmebol", "concacaf", "ofc"];
export const PRIMARY = {
  uefa: "ucl",
  caf: "caf",
  afc: "afc",
  conmebol: "lib",
  concacaf: "concacaf",
  ofc: "ofc",
};
export const QUOTAS = {
  uefa: 12,
  conmebol: 6,
  afc: 4,
  caf: 4,
  concacaf: 4,
  ofc: 1,
};
export function association(id) {
  const c = extendedClub(id);
  return id === OFC_AUCKLAND || c?.wiki === "Wellington Phoenix FC"
    ? "nz"
    : c?.country;
}
export function region(id) {
  const country = association(id);
  if (ASIAN_GUEST_IDS.has(id)) return "afc";
  if (CONCACAF_GUEST_IDS.has(id)) return "concacaf";
  if (OFC_ENTRANTS.includes(id) || country === "nz") return "ofc";
  if (EUROPEAN_COUNTRIES.includes(country)) return "uefa";
  if (["eg", "ma", "tn", "dz", "za"].includes(country)) return "caf";
  if (["sa", "qa", "ae", "jp", "kr", "cn", "au", "in", "th"].includes(country))
    return "afc";
  if (
    ["br", "ar", "uy", "co", "cl", "ec", "py", "pe", "bo", "ve"].includes(
      country,
    )
  )
    return "conmebol";
  if (["us", "mx"].includes(country)) return "concacaf";
  return null;
}
export const afcEligible = (id) => region(id) === "afc";
export function nextWorldYear(date) {
  const year = Number(date.slice(0, 4));
  let next = 2025 + 4 * Math.ceil((year - 2025) / 4);
  if (next === year && date.slice(5) > "07-31") next += 4;
  return next;
}
export function initFifa(s) {
  if (s.expansion.fifa) return;
  const history = [];
  const names = {
    uefa: ["UEFA Champions League"],
    caf: ["CAF Champions League"],
    afc: ["AFC Champions League Elite"],
    conmebol: ["CONMEBOL Libertadores", "Copa Libertadores"],
    concacaf: ["CONCACAF Champions Cup"],
  };
  for (const h of [...s.expansion.history].reverse()) {
    const year = Number(h.date.slice(0, 4)),
      regions = {};
    for (const [r, ns] of Object.entries(names)) {
      const id = h.cups.find((c) => ns.includes(c.name))?.winner;
      if (id && region(id) === r)
        regions[r] = { champion: id, scores: [{ clubId: id, points: 10 }] };
    }
    history.push({ season: h.season, year, source: "legacy-summary", regions });
  }
  s.expansion.fifa = {
    nextWorldYear: nextWorldYear(s.date),
    hostCountry: "us",
    history: history.slice(-4),
  };
}
export function recordFifaSeason(s) {
  initFifa(s);
  const x = s.expansion,
    history = x.fifa.history;
  if (history.some((h) => h.season === s.seasonNumber)) return;
  const regions = {};
  for (const r of REGIONS) {
    const c = x.cups.find(
      (c) =>
        c.kind === PRIMARY[r] || c.id === `${PRIMARY[r]}-s${s.seasonNumber}`,
    );
    if (!c?.winner || region(c.winner) !== r) continue;
    const map = new Map(
      c.entrants.filter((id) => region(id) === r).map((id) => [id, 0]),
    );
    for (const f of c.fixtures || c.results) {
      if (!f.played) continue;
      const h = f.regulationHome ?? f.homeGoals,
        a = f.regulationAway ?? f.awayGoals;
      for (const [id, p] of [
        [f.home, h > a ? 3 : h === a ? 1 : 0],
        [f.away, a > h ? 3 : h === a ? 1 : 0],
      ])
        if (map.has(id)) map.set(id, map.get(id) + p);
    }
    for (const t of c.ties || [])
      if (map.has(t.winner)) map.set(t.winner, map.get(t.winner) + 3);
    map.set(c.winner, (map.get(c.winner) || 0) + 10);
    regions[r] = {
      champion: c.winner,
      scores: [...map].map(([clubId, points]) => ({ clubId, points })),
    };
  }
  history.push({
    season: s.seasonNumber,
    year: Number(s.nextSeasonDate.slice(0, 4)),
    source: "saved-competition-results",
    regions,
  });
  x.fifa.history = history.slice(-4);
}
export function worldAccess(s, year) {
  initFifa(s);
  const x = s.expansion,
    cycles = x.fifa.history.filter((h) => h.year >= year - 4 && h.year < year),
    top = x.divisions.filter((d) => d.tier === 1).flatMap((d) => d.clubs),
    all = x.divisions.flatMap((d) => d.clubs);
  const us = x.divisions.find((d) => d.country === "us" && d.tier === 1),
    host = (x.qualification.us || us.clubs).find((id) => us.clubs.includes(id));
  const used = new Set([host]),
    out = [];
  for (const [r, n] of Object.entries(QUOTAS)) {
    const histories = cycles.map((h) => h.regions[r]).filter(Boolean),
      scores = new Map(),
      champions = [
        ...new Set(histories.map((h) => h.champion).filter(Boolean)),
      ];
    for (const h of histories)
      for (const q of h.scores)
        scores.set(q.clubId, (scores.get(q.clubId) || 0) + q.points);
    let candidates =
      r === "ofc"
        ? [...OFC_ENTRANTS]
        : [...new Set([...top, ...scores.keys(), ...champions])].filter(
            (id) =>
              (all.includes(id) ||
                (r === "afc" && ASIAN_GUEST_IDS.has(id)) ||
                (r === "concacaf" && CONCACAF_GUEST_IDS.has(id))) &&
              region(id) === r &&
              !extendedClub(id)?.reserve,
          );
    const rank = (a, b) =>
      (scores.get(b) || 0) - (scores.get(a) || 0) ||
      extendedClub(b).rep - extendedClub(a).rep ||
      a.localeCompare(b);
    candidates.sort(rank);
    const order =
      r === "ofc"
        ? candidates
        : [
            ...champions.filter((id) => candidates.includes(id)).sort(rank),
            ...candidates.filter((id) => !champions.includes(id)),
          ];
    const counts = {},
      chosen = [];
    for (const id of order) {
      const country = association(id),
        title = champions.includes(id);
      if (used.has(id) || (!title && (counts[country] || 0) >= 2)) continue;
      used.add(id);
      counts[country] = (counts[country] || 0) + 1;
      chosen.push({
        clubId: id,
        region: r,
        country,
        points: scores.get(id) || 0,
        reason:
          r === "ofc" && scores.has(id)
            ? "ofc-cycle-ranking"
            : title
              ? "continental-champion"
              : scores.has(id)
                ? "cycle-ranking"
                : "scenario-fill",
        titleYears: cycles
          .filter((h) => h.regions[r]?.champion === id)
          .map((h) => h.year),
      });
      if (chosen.length === n) break;
    }
    if (chosen.length !== n) throw Error("تعذر استكمال مقاعد كأس العالم: " + r);
    out.push(...chosen);
  }
  out.push({
    clubId: host,
    region: "concacaf",
    country: "us",
    points: 0,
    reason: "scenario-host",
    titleYears: [],
  });
  return {
    qualification: out,
    cycleYears: cycles.map((h) => h.year),
    hostClub: host,
    hostCountry: "us",
  };
}
