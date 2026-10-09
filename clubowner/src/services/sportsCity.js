// The city and stadium are personal investments; the club's existing facilities remain intact.
import { assert, clamp, addDays } from "../core/utils.js";
import { ensureEmpire } from "./empire/wealth.js";

export const CAPACITY_TIERS = Object.freeze([5_000, 15_000, 30_000, 60_000, 100_000, 150_000, 200_000, 250_000]);
export const STADIUM_COSTS = Object.freeze([0, 12_000_000, 32_000_000, 80_000_000, 175_000_000, 310_000_000, 490_000_000, 720_000_000]);
export const DISTRICTS = Object.freeze(["center", "suburbs", "waterfront"]);
export const DESIGNS = Object.freeze(["classic", "modern", "iconic"]);
export const OLD_GROUNDS = Object.freeze(["demolish", "youth", "lease"]);
export const NAMING = Object.freeze(["owner", "auction"]);
export const nearestTier = (capacity) => CAPACITY_TIERS.reduce((best, n, i) => Math.abs(n - capacity) < Math.abs(CAPACITY_TIERS[best] - capacity) ? i : best, 0);

export function ensureSportsCity(s) {
  if (!s.sportsCity) s.sportsCity = {
    stadium: { tier: nearestTier(s.capacity), district: "center", design: "classic", project: null, oldGround: null, naming: null, openingPending: false, record: 0 },
    facilities: [], lastMonth: "", milestones: [], eventsSeen: [], news: [],
  };
  return s.sportsCity;
}

export function stadiumQuote(s, tier, route, district = "center", design = "classic") {
  const current = ensureSportsCity(s).stadium.tier;
  assert(Number.isInteger(tier) && tier > current && tier < CAPACITY_TIERS.length, "Invalid capacity tier");
  assert(["renovate", "new"].includes(route), "Invalid construction route");
  assert(DISTRICTS.includes(district) && DESIGNS.includes(design), "Invalid district or design");
  assert(route !== "renovate" || tier <= 3, "Renovation cannot exceed 60,000 seats");
  const cost = route === "renovate"
    ? Math.round((STADIUM_COSTS[tier] - STADIUM_COSTS[current]) * 0.55)
    : Math.round(STADIUM_COSTS[tier] * ({ center: 1.2, suburbs: 1, waterfront: 1.3 }[district]) * ({ classic: 1, modern: 1.15, iconic: 1.4 }[design]));
  return { cost, days: route === "renovate" ? 90 + (tier - current) * 45 : tier >= 5 ? 1095 : 730 };
}

export function startStadium(s, { tier, route, district = "center", design = "classic" }) {
  const city = ensureSportsCity(s), e = ensureEmpire(s);
  assert(!city.stadium.project, "Stadium construction already underway");
  const { cost, days } = stadiumQuote(s, tier, route, district, design);
  assert(e.personal >= cost, "Insufficient personal wealth");
  e.personal -= cost;
  e.monthTrack.expenses += cost;
  city.stadium.project = { tier, route, district, design, cost, start: s.date, end: addDays(s.date, days), delays: 0 };
  return city.stadium.project;
}

export function finishStadium(s) {
  const st = ensureSportsCity(s).stadium, p = st.project;
  if (!p || s.date < p.end) return false;
  st.tier = p.tier;
  st.district = p.district;
  st.design = p.design;
  st.project = null;
  st.openingPending = true;
  s.capacity = CAPACITY_TIERS[p.tier];
  if (p.route === "new") st.oldGround = "undecided";
  return true;
}

export function chooseOldGround(s, choice) {
  const st = ensureSportsCity(s).stadium;
  assert(st.oldGround === "undecided" && OLD_GROUNDS.includes(choice), "No old ground to allocate");
  st.oldGround = choice;
  if (choice === "demolish") ensureEmpire(s).personal += 5_000_000;
  return choice;
}

export function nameStadium(s, choice) {
  const st = ensureSportsCity(s).stadium, e = ensureEmpire(s);
  assert(NAMING.includes(choice) && !st.naming, "Naming rights unavailable");
  st.naming = choice;
  if (choice === "auction") e.personal += Math.round(STADIUM_COSTS[st.tier] * 0.2 + 10_000_000);
  else e.prestige = clamp(e.prestige + 12, 0, 400);
  return st.naming;
}

// Demand is bounded by fan base and reputation, not a fixed percentage of the building.
export function realisticAttendance(s, fixture = null) {
  const rep = clamp(s.reputation || 0, 0, 100), fans = clamp(s.fanSupport || 0, 0, 100);
  const transport = s.sportsCity?.facilities?.includes("transport") ? 1.12 : 1;
  const demand = Math.round((3000 + rep * rep * 12 + fans * 170) * transport * (fixture?.isDerby ? 1.35 : 1));
  return Math.min(s.capacity, demand);
}
