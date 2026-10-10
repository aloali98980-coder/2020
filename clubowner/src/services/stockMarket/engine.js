// محرك أسعار بورصة الأندية 0.37 — تحديث شهري حتمي لا يغيّر مولّد عشوائية المباريات.
import { clamp, uid } from "../../core/utils.js";
import { stockText } from "../../data/stockMarketTexts.js";
import {
  PRICE_HISTORY_LIMIT,
  MARKET_SIGNAL_LIMIT,
  ensureStockMarket,
  listingById,
  listingForClub,
  marketDeterministicUnit,
  marketMetricsForAll,
  marketMonth,
  roundPrice,
} from "./state.js";

export const MARKET_SIGNAL_WEIGHTS = Object.freeze({
  result: 0.055,
  title: 0.14,
  transfer: 0.07,
  scandal: -0.12,
  injury: -0.045,
  federation: 0.065,
  facility: 0.08,
  earnings: 0.075,
  dividend: 0.04,
  rumor: 0.09,
  manipulation: 0.13,
  regulator: -0.1,
  crisis: -0.2,
  recovery: 0.12,
  ipo: 0.035,
  broker: 0.045,
});

const CYCLE_RETURN = Object.freeze({
  neutral: 0,
  bull: 0.025,
  bubble: 0.07,
  crash: -0.18,
  recovery: 0.05,
});

function validSignalKind(kind) {
  return Object.hasOwn(MARKET_SIGNAL_WEIGHTS, kind);
}

export function recordMarketSignal(
  s,
  {
    listingId = null,
    clubId = null,
    kind,
    magnitude = 1,
    direction = 1,
    publicOn = s.date,
    secret = false,
    source = "simulation",
    note = null,
  } = {},
) {
  const market = ensureStockMarket(s);
  const listing = listingId
    ? listingById(s, listingId)
    : listingForClub(s, clubId);
  if (!listing || !validSignalKind(kind) || !Number.isFinite(Number(magnitude)))
    throw new Error(stockText("invalidSignal"));
  const signal = {
    id: uid(s, "mkt-sig"),
    kind,
    magnitude: clamp(Math.abs(Number(magnitude)), 0, 5),
    direction: Number(direction) < 0 ? -1 : 1,
    createdOn: s.date,
    publicOn,
    secret: Boolean(secret),
    source: String(source).slice(0, 100),
    note: note == null ? null : String(note).slice(0, 300),
    consumedOn: null,
  };
  listing.signals.push(signal);
  if (listing.signals.length > MARKET_SIGNAL_LIMIT)
    listing.signals.splice(0, listing.signals.length - MARKET_SIGNAL_LIMIT);
  market.history.push({
    date: s.date,
    type: "signal",
    listingId: listing.id,
    signalId: signal.id,
    kind,
  });
  if (market.history.length > 180)
    market.history.splice(0, market.history.length - 180);
  return signal;
}

function explicitFactor(signal) {
  const base = MARKET_SIGNAL_WEIGHTS[signal.kind] || 0;
  // الأنواع السلبية تحمل وزنًا سالبًا افتراضيًا، والاتجاه يسمح بعكس أثر الخبر.
  return (
    base * (signal.direction || 1) * clamp(Number(signal.magnitude) || 0, 0, 5)
  );
}

function derivedFactors(previous = {}, current = {}) {
  const factors = [];
  const ppgDelta =
    (current.pointsPerGame ?? 1.25) - (previous.pointsPerGame ?? 1.25);
  if (Math.abs(ppgDelta) >= 0.01)
    factors.push({
      kind: "result",
      value: clamp(ppgDelta * 0.075, -0.12, 0.12),
    });

  const titles = (current.titles || 0) - (previous.titles || 0);
  if (titles > 0)
    factors.push({ kind: "title", value: clamp(titles * 0.14, 0, 0.28) });

  const beforeSquad = Math.max(
    1,
    previous.squadValue || current.squadValue || 1,
  );
  const squadDelta =
    ((current.squadValue || 0) - (previous.squadValue || 0)) / beforeSquad;
  if (Math.abs(squadDelta) >= 0.01)
    factors.push({
      kind: "transfer",
      value: clamp(squadDelta * 0.22, -0.11, 0.11),
    });

  const injuryDelta = (current.injuries || 0) - (previous.injuries || 0);
  if (injuryDelta)
    factors.push({
      kind: "injury",
      value: clamp(-injuryDelta * 0.025, -0.12, 0.06),
    });

  const facilityDelta = (current.facilities || 0) - (previous.facilities || 0);
  if (facilityDelta > 0)
    factors.push({
      kind: "facility",
      value: clamp(facilityDelta * 0.035, 0, 0.14),
    });

  const scandalDelta = (current.suspicion || 0) - (previous.suspicion || 0);
  if (scandalDelta)
    factors.push({
      kind: "scandal",
      value: clamp(-scandalDelta * 0.0025, -0.2, 0.05),
    });

  const federationDelta =
    (current.federationDecisions || 0) - (previous.federationDecisions || 0);
  if (federationDelta)
    factors.push({
      kind: "federation",
      value: clamp(federationDelta * 0.008, -0.05, 0.05),
    });
  return factors;
}

export function calculateMonthlyPrice(s, listing, options = {}) {
  const market = s.stockMarket?.schema ? s.stockMarket : ensureStockMarket(s);
  const currentMetrics = options.metrics || listing.metrics || {};
  const factors = [
    ...derivedFactors(listing.metrics || {}, currentMetrics),
    ...(options.signals || []).map((signal) => ({
      kind: signal.kind,
      value: explicitFactor(signal),
      signalId: signal.id,
    })),
  ];
  const factorReturn = factors.reduce((sum, factor) => sum + factor.value, 0);
  const unit = marketDeterministicUnit(
    market,
    `${marketMonth(s.date)}:${listing.id}:price`,
  );
  const noise =
    (unit - 0.5) * (listing.assetType === "company" ? 0.075 : 0.055);
  const cycleBase = CYCLE_RETURN[market.cycle?.phase] || 0;
  const cycle =
    cycleBase *
    (0.6 + clamp(Number(market.cycle?.intensity) || 0, 0, 100) / 250);
  const premium =
    listing.marketCap > 0 && listing.fundamentalValue > 0
      ? clamp(
          (listing.fundamentalValue / listing.marketCap - 1) * 0.08,
          -0.055,
          0.055,
        )
      : 0;
  const monthlyReturn = clamp(
    factorReturn + noise + cycle + premium,
    -0.58,
    0.72,
  );
  const price = roundPrice(listing.price * (1 + monthlyReturn));
  return {
    price,
    monthlyReturn: Math.round(monthlyReturn * 10_000) / 10_000,
    factors,
    noise: Math.round(noise * 10_000) / 10_000,
    cycle: Math.round(cycle * 10_000) / 10_000,
    premium: Math.round(premium * 10_000) / 10_000,
  };
}

function publicSignals(listing, date) {
  return (listing.signals || []).filter(
    (signal) =>
      !signal.consumedOn && (!signal.publicOn || signal.publicOn <= date),
  );
}

function estimateMonthlyProfit(s, listing, metrics, month) {
  if (listing.assetType === "company") {
    if (listing.companyId === "betting")
      return Math.round(s.betting?.lastMonthProfit || 0);
    return Math.round(listing.lastProfit || 0);
  }
  if (listing.clubId === s.clubId) {
    const entries = (s.finance?.ledger || []).filter(
      (entry) => String(entry.date).slice(0, 7) === month,
    );
    return entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  }
  const strength = clamp((metrics.pointsPerGame || 1.25) / 3, 0.1, 1);
  const unit = marketDeterministicUnit(
    s.stockMarket,
    `${month}:${listing.id}:profit`,
  );
  return Math.round(
    listing.marketCap * (0.0012 + strength * 0.0024 + (unit - 0.5) * 0.002),
  );
}

function updateDistress(listing) {
  const drawdown =
    1 - listing.price / Math.max(0.1, listing.initialPrice || listing.price);
  const pressure =
    Math.max(0, -listing.lastReturn * 100) +
    Math.max(0, drawdown * 75) +
    (listing.lastProfit < 0 ? 18 : 0);
  listing.distressScore = Math.round(
    clamp(listing.distressScore * 0.55 + pressure, 0, 100),
  );
  listing.distressMonths =
    listing.distressScore >= 60 ? (listing.distressMonths || 0) + 1 : 0;
}

function updateIndex(market, month, weightedBefore, weightedAfter) {
  const previous = market.index.value || 1000;
  const ratio = weightedBefore > 0 ? weightedAfter / weightedBefore : 1;
  const next = Math.max(50, Math.round(previous * ratio * 100) / 100);
  market.index.previousValue = previous;
  market.index.value = next;
  market.index.change = previous
    ? Math.round((next / previous - 1) * 10_000) / 100
    : 0;
  market.index.capitalisation = Math.round(weightedAfter);
  market.index.history.push([month, next]);
  if (market.index.history.length > PRICE_HISTORY_LIMIT)
    market.index.history.splice(
      0,
      market.index.history.length - PRICE_HISTORY_LIMIT,
    );
}

export function updateStockPrices(s, { force = false } = {}) {
  const market = ensureStockMarket(s);
  const month = marketMonth(s.date);
  if (!force && market.lastUpdate === month)
    return { updated: false, month, listings: 0 };
  const metricsByClub = marketMetricsForAll(s);
  const priorMonth = market.lastUpdate || month;
  let weightedBefore = 0;
  let weightedAfter = 0;
  let updated = 0;
  for (const listing of market.listings) {
    if (listing.status === "delisted") continue;
    const beforeCap =
      listing.status === "listed"
        ? listing.price * listing.sharesOutstanding
        : 0;
    weightedBefore += beforeCap;
    const metrics = listing.clubId
      ? metricsByClub.get(listing.clubId) || listing.metrics || {}
      : listing.metrics || {};
    const signals = publicSignals(listing, s.date);
    const quote = calculateMonthlyPrice(s, listing, { metrics, signals });
    listing.previousPrice = listing.price;
    listing.price = quote.price;
    listing.lastReturn = quote.monthlyReturn;
    listing.marketCap = Math.round(listing.price * listing.sharesOutstanding);
    listing.lastProfit = estimateMonthlyProfit(s, listing, metrics, priorMonth);
    listing.metrics = metrics;
    listing.history.push([month, listing.price]);
    if (listing.history.length > PRICE_HISTORY_LIMIT)
      listing.history.splice(0, listing.history.length - PRICE_HISTORY_LIMIT);
    for (const signal of signals) signal.consumedOn = s.date;
    updateDistress(listing);
    if (listing.status === "listed") weightedAfter += listing.marketCap;
    updated++;
  }
  updateIndex(market, month, weightedBefore, weightedAfter);
  market.lastUpdate = month;
  market.history.push({
    id: uid(s, "mkt-month"),
    type: "monthly-pricing",
    date: s.date,
    month,
    index: market.index.value,
    change: market.index.change,
    cycle: market.cycle?.phase || "neutral",
  });
  if (market.history.length > 180)
    market.history.splice(0, market.history.length - 180);
  return { updated: true, month, listings: updated, index: market.index.value };
}

export function stockMarketDay(s) {
  return updateStockPrices(s);
}

export function marketMovers(s, limit = 5) {
  const listed = ensureStockMarket(s).listings.filter(
    (listing) => listing.status === "listed",
  );
  const sorted = [...listed].sort((a, b) => b.lastReturn - a.lastReturn);
  return {
    gainers: sorted.slice(0, limit),
    losers: sorted.slice(-limit).reverse(),
  };
}
