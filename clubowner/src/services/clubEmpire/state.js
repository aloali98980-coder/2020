// إمبراطور الأندية 0.38 — حالة ملكية متعددة الأندية قابلة للحفظ.
import { marketClubIds, estimateClubEquityValue } from "../stockMarket/state.js";

export const CLUB_EMPIRE_SCHEMA = 1;
export const SALE_REASONS = Object.freeze({
  bankruptcy: { price: 0.62, risk: 0.82 },
  boredom: { price: 0.94, risk: 0.22 },
  inheritance: { price: 0.78, risk: 0.55 },
  scandal: { price: 0.68, risk: 0.9 },
  relegation: { price: 0.72, risk: 0.58 },
});
export const MARKET_CYCLES = Object.freeze({ boom: 1.22, normal: 1, slump: 0.76 });

const hash = (value) => {
  let h = 2166136261;
  for (const c of String(value)) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
};
const pick = (items, key) => items[hash(key) % items.length];
const round = (n) => Math.max(1_000_000, Math.round(n / 100_000) * 100_000);

export function createClubEmpire(s) {
  const cycle = pick(Object.keys(MARKET_CYCLES), `${s.seed}:${String(s.date).slice(0, 7)}`);
  const brokers = [
    { id: "broker-honest", reputation: 88, commission: 0.025, fraud: false },
    { id: "broker-global", reputation: 67, commission: 0.04, fraud: false },
    { id: "broker-shark", reputation: 19, commission: 0.015, fraud: true },
  ];
  const ids = marketClubIds(s).filter((id) => id !== s.clubId).slice(0, 12);
  const listings = ids.map((clubId, index) => {
    const reason = pick(Object.keys(SALE_REASONS), `${s.seed}:${clubId}:reason`);
    const baseValue = estimateClubEquityValue(s, clubId);
    const askingPrice = round(baseValue * SALE_REASONS[reason].price * MARKET_CYCLES[cycle]);
    return {
      id: `sale-${clubId}`,
      clubId,
      reason,
      baseValue,
      askingPrice,
      risk: SALE_REASONS[reason].risk,
      sellerPatience: 2 + (hash(clubId) % 5),
      status: "open",
      auction: index % 4 === 0,
      bids: [],
      brokerId: brokers[index % brokers.length].id,
      dueDiligence: null,
      secrets: makeSecrets(s, clubId, reason),
    };
  });
  return {
    schema: CLUB_EMPIRE_SCHEMA,
    cycle,
    listings,
    brokers,
    negotiations: [],
    applications: [],
    ownedClubs: [],
    networkLoans: [],
    reports: [],
    conflicts: [],
    sales: [],
    holding: null,
    eventHistory: [],
    firstHundredDays: [],
    lastMarketRefresh: s.date,
  };
}

function makeSecrets(s, clubId, reason) {
  const n = hash(`${s.seed}:${clubId}:secret`);
  const kind = n % 7 === 0 ? "golden-academy" : n % 5 === 0 ? "hidden-treasure" : n % 3 === 0 ? "toxic-contracts" : n % 2 === 0 ? "hidden-debt" : "fan-anger";
  const bad = ["hidden-debt", "toxic-contracts", "lawsuit", "fan-anger"].includes(kind);
  return [{ id: kind, severity: bad ? 35 + (n % 55) : -(20 + (n % 35)), hidden: true, reason }];
}

export function initClubEmpire(s) {
  s.clubEmpire ??= createClubEmpire(s);
  s.clubEmpire.schema ??= CLUB_EMPIRE_SCHEMA;
  s.clubEmpire.ownedClubs ??= [];
  s.clubEmpire.listings ??= [];
  s.clubEmpire.networkLoans ??= [];
  s.clubEmpire.eventHistory ??= [];
  return s.clubEmpire;
}

export function ensureClubEmpire(s) { return initClubEmpire(s); }
export function listingPrice(listing, cycle = "normal") {
  const reason = SALE_REASONS[listing.reason] || SALE_REASONS.boredom;
  return round(Number(listing.baseValue) * reason.price * (MARKET_CYCLES[cycle] || 1));
}
