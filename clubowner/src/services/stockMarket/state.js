// بورصة الأندية 0.37 — الحالة القابلة للحفظ، تسعير البداية، وترحيل الحفظات القديمة.
import { CLUBS } from "../../data/catalog.js";
import { EXPANDED_CLUBS, extendedClub } from "../../data/expandedCatalog.js";
import { clamp } from "../../core/utils.js";
import { stockText } from "../../data/stockMarketTexts.js";

export const STOCK_MARKET_SCHEMA = 1;
export const PRICE_HISTORY_LIMIT = 48;
export const MARKET_SIGNAL_LIMIT = 60;

const CLASSIC_BY_ID = new Map(CLUBS.map((club) => [club.id, club]));
const EXPANDED_BY_ID = new Map(EXPANDED_CLUBS.map((club) => [club.id, club]));
const roundPrice = (value) => Math.max(0.1, Math.round(value * 100) / 100);
export const marketMonth = (date) => String(date || "").slice(0, 7);

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function clubDefinition(clubId) {
  return (
    CLASSIC_BY_ID.get(clubId) ||
    EXPANDED_BY_ID.get(clubId) ||
    extendedClub(clubId) ||
    null
  );
}

export function marketClubIds(s) {
  const ids = s.expansion?.divisions?.length
    ? s.expansion.divisions.flatMap((division) => division.clubs || [])
    : (s.table || []).map((row) => row.clubId);
  ids.push(s.clubId);
  return [...new Set(ids.filter(Boolean))];
}

function aggregateSquads(s) {
  const values = new Map();
  const injuries = new Map();
  for (const player of s.players || []) {
    if (!player.clubId || player.status === "retired") continue;
    values.set(
      player.clubId,
      (values.get(player.clubId) || 0) + Math.max(0, Number(player.value) || 0),
    );
    if (player.injuryUntil && player.injuryUntil >= s.date)
      injuries.set(player.clubId, (injuries.get(player.clubId) || 0) + 1);
  }
  return { values, injuries };
}

function rowForClub(s, clubId) {
  if (s.expansion?.divisions)
    for (const division of s.expansion.divisions) {
      const row = division.table?.find((entry) => entry.clubId === clubId);
      if (row) return row;
    }
  return s.table?.find((entry) => entry.clubId === clubId) || null;
}

function titleCount(s, clubId) {
  let count = 0;
  for (const winner of Object.values(s.expansion?.champions || {}))
    if (winner === clubId) count++;
  for (const cup of s.expansion?.cups || []) if (cup.winner === clubId) count++;
  for (const history of s.expansion?.history || []) {
    for (const cup of history.cups || []) if (cup.winner === clubId) count++;
    for (const league of history.leagues || [])
      if (league.champion === clubId || league.winner === clubId) count++;
  }
  return count;
}

function facilityScore(s, clubId) {
  if (clubId !== s.clubId) return 0;
  return (
    (s.facilities || []).reduce(
      (sum, facility) => sum + (Number(facility.level) || 0),
      0,
    ) +
    (s.sportsCity?.facilities || []).reduce(
      (sum, facility) => sum + (Number(facility.level) || 0),
      0,
    )
  );
}

function federationDecisionCount(s) {
  const politics = s.politics;
  if (!politics) return 0;
  return (
    (politics.council?.history || []).filter((entry) => entry.passed).length +
    (politics.history || []).filter((entry) =>
      ["law-passed", "competition-created", "political-event-choice"].includes(
        entry.type,
      ),
    ).length
  );
}

function clubMetrics(s, clubId, squads) {
  const row = rowForClub(s, clubId);
  const played = Number(row?.played) || 0;
  const points = Number(row?.points) || 0;
  return {
    played,
    points,
    pointsPerGame: played ? Math.round((points / played) * 1000) / 1000 : 1.25,
    titles: titleCount(s, clubId),
    squadValue: Math.round(squads.values.get(clubId) || 0),
    injuries: squads.injuries.get(clubId) || 0,
    facilities: facilityScore(s, clubId),
    suspicion:
      clubId === s.clubId ? Math.round(s.blackFiles?.suspicion || 0) : 0,
    federationDecisions: federationDecisionCount(s),
  };
}

export function estimateClubEquityValue(
  s,
  clubId,
  squads = aggregateSquads(s),
) {
  const club = clubDefinition(clubId) || {};
  const reputation = clamp(
    Number(
      club.rep ?? club.overall ?? (clubId === s.clubId ? s.reputation : 55),
    ) || 55,
    20,
    100,
  );
  const squadValue = squads.values.get(clubId) || 0;
  const budget =
    clubId === s.clubId
      ? Math.max(0, Number(s.finance?.cash) || 0)
      : Math.max(
          0,
          Number(s.expansion?.budgets?.[clubId] ?? club.cash ?? 20_000_000) ||
            0,
        );
  const capacity = Math.max(
    2_000,
    Number(clubId === s.clubId ? s.capacity : club.capacity) || 12_000,
  );
  const brand = reputation * reputation * 85_000;
  return Math.max(
    15_000_000,
    Math.round(budget * 0.8 + squadValue * 0.62 + capacity * 1_400 + brand),
  );
}

function symbolFor(clubId) {
  const clean = String(clubId)
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
  return (
    (clean.slice(0, 4) || "CLB") +
    String(stableHash(clubId) % 100).padStart(2, "0")
  );
}

function clubListing(s, clubId, squads) {
  const club = clubDefinition(clubId) || {};
  const value = estimateClubEquityValue(s, clubId, squads);
  const reputation = clamp(
    Number(
      club.rep ?? club.overall ?? (clubId === s.clubId ? s.reputation : 55),
    ) || 55,
    20,
    100,
  );
  const targetPrice = 25 + reputation * 1.35;
  const sharesOutstanding = Math.max(
    250_000,
    Math.round(value / targetPrice / 10_000) * 10_000,
  );
  const price = roundPrice(value / sharesOutstanding);
  const latin = club.nameLatin || club.wiki || club.name || clubId;
  const arabic = club.name || club.short || clubId;
  const isOwn = clubId === s.clubId;
  return {
    id: `club-${clubId}`,
    symbol: symbolFor(clubId),
    assetType: "club",
    clubId,
    companyId: null,
    name: { ar: String(arabic), en: String(latin), fr: String(latin) },
    country: club.country || (isOwn ? "eg" : "world"),
    status: isOwn ? "private" : "listed",
    price,
    previousPrice: price,
    initialPrice: price,
    sharesOutstanding,
    floatShares: isOwn ? 0 : Math.round(sharesOutstanding * 0.35),
    marketCap: Math.round(price * sharesOutstanding),
    fundamentalValue: value,
    lastReturn: 0,
    lastProfit: 0,
    dividendPerShare: 0,
    history: [[marketMonth(s.date), price]],
    signals: [],
    metrics: clubMetrics(s, clubId, squads),
    haltedUntil: null,
    distressScore: 0,
    distressMonths: 0,
    manipulation: 0,
    ownerControlled: isOwn,
  };
}

function emptyPortfolio() {
  return {
    positions: [],
    shorts: [],
    orders: [],
    realizedProfit: 0,
    dividends: 0,
    fees: 0,
    history: [],
    lastDividendMonth: "",
  };
}

function emptyRegulator() {
  return {
    risk: 0,
    status: "clear",
    tradingHaltUntil: null,
    nextAudit: null,
    audits: [],
    investigations: [],
    finesTotal: 0,
    criminalScandals: 0,
    whistleblowers: 0,
  };
}

function blankStockMarket(s) {
  const squads = aggregateSquads(s);
  const listings = marketClubIds(s).map((clubId) =>
    clubListing(s, clubId, squads),
  );
  const capitalisation = listings
    .filter((listing) => listing.status === "listed")
    .reduce((sum, listing) => sum + listing.marketCap, 0);
  const month = marketMonth(s.date);
  return {
    schema: STOCK_MARKET_SCHEMA,
    seed: (Number(s.seed) || 1) ^ 0x5f3759df,
    createdOn: s.date,
    lastUpdate: month,
    listings,
    index: {
      value: 1000,
      previousValue: 1000,
      initialValue: 1000,
      capitalisation,
      change: 0,
      history: [[month, 1000]],
    },
    portfolio: emptyPortfolio(),
    regulator: emptyRegulator(),
    insider: { knowledge: [], trades: [], exposure: 0, profit: 0 },
    manipulation: { campaigns: [], exposure: 0, profit: 0 },
    ipos: {
      history: [],
      club: null,
      betting: null,
      quarterly: [],
      lastSyncMonth: "",
    },
    cycle: {
      phase: "neutral",
      months: 0,
      intensity: 0,
      history: [],
      lastMonth: "",
    },
    events: { pending: null, history: [], cooldowns: {}, lastMonth: "" },
    distressed: [],
    history: [],
  };
}

function upgradeListing(s, listing) {
  listing.previousPrice ??= listing.price;
  listing.initialPrice ??= listing.price;
  listing.marketCap ??= Math.round(listing.price * listing.sharesOutstanding);
  listing.fundamentalValue ??= listing.marketCap;
  listing.floatShares ??=
    listing.status === "listed"
      ? Math.round(listing.sharesOutstanding * 0.35)
      : 0;
  listing.lastReturn ??= 0;
  listing.lastProfit ??= 0;
  listing.dividendPerShare ??= 0;
  listing.history ??= [[marketMonth(s.date), listing.price]];
  listing.signals ??= [];
  listing.metrics ??= {};
  listing.haltedUntil ??= null;
  listing.distressScore ??= 0;
  listing.distressMonths ??= 0;
  listing.manipulation ??= 0;
  listing.ownerControlled ??= listing.clubId === s.clubId;
  if (listing.history.length > PRICE_HISTORY_LIMIT)
    listing.history.splice(0, listing.history.length - PRICE_HISTORY_LIMIT);
  if (listing.signals.length > MARKET_SIGNAL_LIMIT)
    listing.signals.splice(0, listing.signals.length - MARKET_SIGNAL_LIMIT);
  return listing;
}

function upgradeStockMarket(s) {
  const market = s.stockMarket;
  market.schema = STOCK_MARKET_SCHEMA;
  market.seed ??= (Number(s.seed) || 1) ^ 0x5f3759df;
  market.createdOn ??= s.date;
  market.lastUpdate ??= marketMonth(s.date);
  market.listings ??= [];
  market.index ??= {
    value: 1000,
    previousValue: 1000,
    initialValue: 1000,
    capitalisation: 0,
    change: 0,
    history: [[marketMonth(s.date), 1000]],
  };
  market.index.history ??= [[marketMonth(s.date), market.index.value || 1000]];
  market.portfolio = { ...emptyPortfolio(), ...(market.portfolio || {}) };
  market.portfolio.positions ??= [];
  market.portfolio.shorts ??= [];
  market.portfolio.orders ??= [];
  market.portfolio.history ??= [];
  market.regulator = { ...emptyRegulator(), ...(market.regulator || {}) };
  market.regulator.audits ??= [];
  market.regulator.investigations ??= [];
  market.insider = {
    knowledge: [],
    trades: [],
    exposure: 0,
    profit: 0,
    ...(market.insider || {}),
  };
  market.insider.knowledge ??= [];
  market.insider.trades ??= [];
  market.manipulation = {
    campaigns: [],
    exposure: 0,
    profit: 0,
    ...(market.manipulation || {}),
  };
  market.manipulation.campaigns ??= [];
  market.ipos = {
    history: [],
    club: null,
    betting: null,
    quarterly: [],
    lastSyncMonth: "",
    ...(market.ipos || {}),
  };
  market.ipos.history ??= [];
  market.ipos.quarterly ??= [];
  market.cycle = {
    phase: "neutral",
    months: 0,
    intensity: 0,
    history: [],
    lastMonth: "",
    ...(market.cycle || {}),
  };
  market.cycle.history ??= [];
  market.events = {
    pending: null,
    history: [],
    cooldowns: {},
    lastMonth: "",
    ...(market.events || {}),
  };
  market.events.history ??= [];
  market.events.cooldowns ??= {};
  market.distressed ??= [];
  market.history ??= [];
  for (const listing of market.listings) upgradeListing(s, listing);
  reconcileClubListings(s);
  return market;
}

export function initStockMarket(s) {
  if (!s || typeof s !== "object") throw new Error(stockText("invalidListing"));
  if (!s.stockMarket || s.stockMarket.schema !== STOCK_MARKET_SCHEMA)
    s.stockMarket = blankStockMarket(s);
  else upgradeStockMarket(s);
  return s.stockMarket;
}

export const ensureStockMarket = (s) =>
  s.stockMarket?.schema === STOCK_MARKET_SCHEMA
    ? upgradeStockMarket(s)
    : initStockMarket(s);

export function reconcileClubListings(s) {
  const market = s.stockMarket;
  if (!market) return [];
  const known = new Set(
    market.listings
      .filter((listing) => listing.assetType === "club")
      .map((listing) => listing.clubId),
  );
  const missing = marketClubIds(s).filter((clubId) => !known.has(clubId));
  if (missing.length) {
    const squads = aggregateSquads(s);
    for (const clubId of missing)
      market.listings.push(clubListing(s, clubId, squads));
  }
  return market.listings;
}

export function listingById(s, listingId) {
  return (
    ensureStockMarket(s).listings.find((listing) => listing.id === listingId) ||
    null
  );
}

export function listingForClub(s, clubId) {
  return (
    ensureStockMarket(s).listings.find(
      (listing) => listing.assetType === "club" && listing.clubId === clubId,
    ) || null
  );
}

export function addMarketListing(s, listing) {
  const market = ensureStockMarket(s);
  if (!listing?.id || market.listings.some((entry) => entry.id === listing.id))
    throw new Error(stockText("invalidListing"));
  const completed = upgradeListing(s, {
    companyId: null,
    clubId: null,
    country: "world",
    status: "listed",
    signals: [],
    history: [[marketMonth(s.date), roundPrice(listing.price)]],
    ...listing,
    price: roundPrice(listing.price),
  });
  market.listings.push(completed);
  return completed;
}

export function marketSnapshotMetrics(s, clubId) {
  return clubMetrics(s, clubId, aggregateSquads(s));
}

export function marketMetricsForAll(s) {
  const squads = aggregateSquads(s);
  return new Map(
    marketClubIds(s).map((clubId) => [clubId, clubMetrics(s, clubId, squads)]),
  );
}

export function marketDeterministicUnit(market, key) {
  const hash = stableHash(`${market.seed}:${key}`);
  return hash / 4294967295;
}

export { roundPrice };
