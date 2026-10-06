import { extendedClub } from "../../data/expandedCatalog.js";
import { CONTINENTAL } from "./presets.js";
export function qualify(s, kind, excluded = []) {
  const picked = [],
    excludedIds = new Set(excluded),
    rules = CONTINENTAL[kind];
  for (const [country, places] of Object.entries(rules.alloc)) {
    const d = s.expansion.divisions.find(
      (d) => d.country === country && d.tier === 1,
    );
    if (!d) throw Error("مسابقة عليا ناقصة للتأهل: " + country);
    const order = (s.expansion.qualification[country] || d.clubs).filter(
      (id) =>
        d.clubs.includes(id) &&
        !extendedClub(id)?.reserve &&
        !excludedIds.has(id),
    );
    const cupWinner = s.expansion.domesticHonours?.[country]?.winner;
    const candidates =
      rules.exclude && order.includes(cupWinner)
        ? [cupWinner, ...order.filter((id) => id !== cupWinner)]
        : order;
    if (candidates.length < places)
      throw Error("عدد الأندية المؤهلة غير كافٍ: " + country);
    for (const clubId of candidates.slice(0, places))
      picked.push({
        clubId,
        country,
        domesticRank:
          (s.expansion.qualification[country] || d.clubs).indexOf(clubId) + 1,
        reason:
          rules.exclude && cupWinner === clubId
            ? "domestic-cup"
            : "league-position",
      });
  }
  if (picked.length !== rules.size) throw Error("عدد مقاعد البطولة غير سليم.");
  return picked;
}
