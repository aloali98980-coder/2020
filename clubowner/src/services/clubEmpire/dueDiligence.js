import { ensureClubEmpire } from "./state.js";

export const INSPECTION_LEVELS = Object.freeze({
  quick: { costRate: 0.002, accuracy: 0.42 },
  medium: { costRate: 0.006, accuracy: 0.72 },
  deep: { costRate: 0.014, accuracy: 0.96 },
});
const hash = (v) => { let h = 0; for (const c of String(v)) h = Math.imul(h, 31) + c.codePointAt(0) | 0; return h >>> 0; };

export function inspectClub(s, listingId, level = "quick") {
  const empire = ensureClubEmpire(s);
  const listing = empire.listings.find((x) => x.id === listingId);
  const plan = INSPECTION_LEVELS[level];
  if (!listing || !plan) throw Error("Invalid club inspection");
  const cost = Math.round(listing.askingPrice * plan.costRate);
  if ((s.empire?.personal || 0) < cost) throw Error("Insufficient personal funds");
  s.empire.personal -= cost;
  const discoveries = listing.secrets.filter((secret, i) => (hash(`${s.seed}:${listing.clubId}:${level}:${i}`) % 1000) / 1000 < plan.accuracy);
  listing.dueDiligence = { level, cost, accuracy: plan.accuracy, date: s.date, discoveries: discoveries.map((x) => ({ ...x, hidden: false })) };
  return listing.dueDiligence;
}

export function postSigningSurprise(s, ownedClub) {
  const listing = ensureClubEmpire(s).listings.find((x) => x.clubId === ownedClub.clubId);
  const known = new Set(listing?.dueDiligence?.discoveries?.map((x) => x.id) || []);
  const surprise = listing?.secrets?.find((x) => !known.has(x.id));
  if (!surprise) return null;
  ownedClub.surprises ??= [];
  ownedClub.surprises.push({ ...surprise, revealedOn: s.date });
  ownedClub.value = Math.max(0, Math.round(ownedClub.value * (1 - surprise.severity / 100)));
  return surprise;
}
