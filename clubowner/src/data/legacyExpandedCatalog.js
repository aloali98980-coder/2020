import egypt from "./egyptPyramid.json" with { type: "json" };
import { CLUBS } from "./catalog.js";
import { WORLD_CLUBS, gameClubId } from "./packs/world.js";
import { MARKETS } from "./worldMarkets.js";
import lower from "./lowerLeagues.json" with { type: "json" };
import { hash } from "../models/ability.js";
const TOP_NAMES = {
  en: "Premier League",
  eg: "Egyptian Premier League",
  es: "La Liga",
  de: "Bundesliga",
  it: "Serie A",
  fr: "Ligue 1",
  pt: "Primeira Liga",
  nl: "Eredivisie",
  sc: "Scottish Premiership",
};
const list = WORLD_CLUBS.map((c) => {
  const legacy = CLUBS.find((x) => x.id === gameClubId(c));
  const level = MARKETS.find((x) => x.id === c.league)?.level || 65;
  return {
    ...c,
    ...legacy,
    id: gameClubId(c),
    name: legacy?.name || c.name,
    short: legacy?.short || c.name,
    initial: legacy?.initial || c.name[0],
    country: c.league,
    tier: 1,
    division: c.league + "-1",
    rep: legacy?.rep || level,
    overall: level,
    capacity: legacy?.capacity || 18000,
    cash: legacy?.cash || 80000000,
    color: legacy?.color || "#326953",
    city:
      legacy?.city ||
      MARKETS.find((m) => m.id === c.league)?.nameAr ||
      c.league,
    desc: "نادي حقيقي · قوائم منشورة غير معتمدة كقيد رسمي",
    level: "درجة أولى",
    selectable: c.importedCount >= 11,
  };
});
const divisions = MARKETS.map((m) => ({
  id: m.id + "-1",
  country: m.id,
  tier: 1,
  name: TOP_NAMES[m.id] || m.name,
  clubs: list.filter((c) => c.country === m.id).map((c) => c.id),
  sourceStatus: "published-unverified",
}));
for (const l of lower.filter((l) => l.country !== "eg")) {
  const clubs = [];
  for (const name of l.clubs) {
    // Do not put a club in two divisions. Conflicting discoveries stay in the higher pool.
    if (list.some((c) => c.wiki === name)) continue;
    const id = "lower-" + hash(name).toString(16),
      base = MARKETS.find((m) => m.id === l.country)?.level || 65;
    const overall = Math.max(
      28,
      base - (l.tier - 1) * 10 + (hash(name) % 9) - 4,
    );
    list.push({
      id,
      name,
      short: name,
      wiki: name,
      initial: name[0],
      country: l.country,
      tier: l.tier,
      division: l.id,
      rep: overall,
      overall,
      capacity: Math.max(2500, 18000 - (l.tier - 1) * 4200),
      cash: Math.round(65000000 / l.tier ** 2),
      color: "#526d9b",
      city: MARKETS.find((m) => m.id === l.country)?.nameAr || l.country,
      desc: "نادٍ حقيقي · لاعبون خياليون مولّدون · الجنيه وحدة الحساب في السيناريو",
      level: l.name,
      selectable: true,
    });
    clubs.push(id);
  }
  if (clubs.length >= 4)
    divisions.push({
      id: l.id,
      country: l.country,
      tier: l.tier,
      name: l.name,
      clubs,
      sourceStatus: "published-unverified",
      sourceUrl: l.sourceUrl,
      revision: l.revision,
    });
}
// New-career membership only. Saved division arrays are never rebuilt from this catalog.
for (const d of egypt.divisions) {
  const clubs = [];
  for (const item of d.clubs) {
    const found = list.find((c) => c.wiki === item.key);
    if (found) {
      throw Error("Egypt catalog duplicates a higher-tier club: " + item.key);
    }
    const id =
      item.key === "Ismaily SC"
        ? "ismaily"
        : "lower-" + hash(item.key).toString(16);
    const overall = Math.max(
      28,
      68 - (d.tier - 1) * 10 + (hash(item.key) % 9) - 4,
    );
    list.push({
      id,
      name: item.name,
      short: item.name,
      wiki: item.key,
      initial: item.name[0],
      country: "eg",
      tier: d.tier,
      division: d.id,
      rep: overall,
      overall,
      capacity: Math.max(2500, 18000 - (d.tier - 1) * 4200),
      cash: Math.round(65000000 / d.tier ** 2),
      color: "#526d9b",
      city: "مصر",
      desc: "نادٍ حقيقي · عضوية منشورة غير معتمدة · لاعبون مولّدون",
      level: d.name,
      selectable: true,
      sourceStatus: egypt.status,
    });
    clubs.push(id);
  }
  divisions.push({
    ...d,
    clubs,
    sourceStatus: egypt.status,
    sourceUrl: egypt.sources[0].url,
    revision: null,
    group: d.tier === 3 ? d.id.slice(-1) : undefined,
    promotionRoute: d.tier === 3 ? "egypt-playoffs" : undefined,
  });
}
export const EXPANDED_CLUBS = list;
export const DIVISIONS = divisions;
const byId = new Map([...CLUBS, ...list].map((c) => [c.id, c]));
export const extendedClub = (id) => byId.get(id);
export const LOWER_SOURCES = lower;
