import { assert, clamp } from "../core/utils.js";
import {
  CITY_FACILITIES,
  CITY_GROUPS,
  cityFacility,
} from "../data/sportsCityFacilities.js";
import { ensureSportsCity } from "./sportsCity.js";
import {
  ensureEmpire,
  personalIncome,
  personalExpense,
} from "./empire/wealth.js";

export function cityEffects(s) {
  const built = new Set(ensureSportsCity(s).facilities);
  const totals = {};
  for (const def of CITY_FACILITIES)
    if (built.has(def.id))
      totals[def.effect] = (totals[def.effect] || 0) + def.value;
  const completed = Object.entries(CITY_GROUPS)
    .filter(
      ([group, n]) =>
        CITY_FACILITIES.filter((x) => x.group === group && built.has(x.id))
          .length === n,
    )
    .map(([group]) => group);
  // Group bonuses use the same effect channels as individual buildings.
  for (const group of completed) {
    const channel = {
      sport: "fitness",
      commercial: "income",
      entertainment: "fan",
      community: "recovery",
      special: "channel",
    }[group];
    totals[channel] = (totals[channel] || 0) + 3;
  }
  return { totals, completed };
}

export function buildCityFacility(s, id) {
  const def = cityFacility(id),
    city = ensureSportsCity(s),
    e = ensureEmpire(s);
  assert(
    def && !city.facilities.includes(id),
    "Unknown or already built facility",
  );
  assert(e.personal >= def.cost, "Insufficient personal wealth");
  e.personal -= def.cost;
  e.monthTrack.expenses += def.cost;
  city.facilities.push(id);
  if (def.effect === "prestige")
    e.prestige = clamp(e.prestige + def.value, 0, 400);
  return def;
}

export function cityEconomy(s) {
  const built = ensureSportsCity(s)
    .facilities.map(cityFacility)
    .filter(Boolean);
  const { totals } = cityEffects(s);
  const upkeep = Math.round(
    built.reduce((sum, x) => sum + x.upkeep, 0) *
      (1 - clamp(totals.upkeep || 0, 0, 70) / 100),
  );
  const income =
    built.reduce((sum, x) => sum + x.income, 0) +
    (totals.income || 0) * 30_000 +
    (ensureSportsCity(s).stadium.oldGround === "lease" ? 200_000 : 0);
  return { upkeep, income, net: income - upkeep };
}

export function settleCityMonth(s) {
  const city = ensureSportsCity(s),
    key = s.date.slice(0, 7);
  if (city.lastMonth === key) return false;
  city.lastMonth = key;
  const { upkeep, income } = cityEconomy(s);
  const e = ensureEmpire(s);
  personalIncome(s, income);
  e.debt += personalExpense(s, upkeep);
  if (cityEffects(s).totals.fan)
    s.fanSupport = clamp(
      s.fanSupport + Math.min(2, cityEffects(s).totals.fan),
      0,
      100,
    );
  return true;
}
