// منسق أحداث البورصة 0.37 — اختيار حتمي مشروط وتطبيق قرارات على السوق والثروة والرقابة.
import { addDays, assert, clamp, uid } from "../../core/utils.js";
import {
  STOCK_MARKET_EVENT_BY_ID,
  STOCK_MARKET_EVENTS,
} from "../../data/stockMarketEvents.js";
import { stockText } from "../../data/stockMarketTexts.js";
import {
  ensureEmpire,
  personalExpense,
  personalIncome,
} from "../empire/wealth.js";
import { message } from "../inbox.js";
import { addSuspicion } from "../blackFiles.js";
import { setMarketCycle } from "./cycles.js";
import { recordMarketSignal } from "./engine.js";
import { triggerMarketWhistleblower } from "./regulation.js";
import {
  ensureStockMarket,
  listingForClub,
  marketDeterministicUnit,
  marketMonth,
  roundPrice,
} from "./state.js";

function monthNumber(month) {
  const [year, value] = month.split("-").map(Number);
  return year * 12 + value;
}

function monthsSince(current, previous) {
  return monthNumber(current) - monthNumber(previous);
}

function safeCondition(item, s) {
  try {
    return Boolean(item.when(s));
  } catch {
    return false;
  }
}

export function eligibleStockMarketEvents(s, { ignoreCooldown = false } = {}) {
  const market = ensureStockMarket(s);
  const month = marketMonth(s.date);
  return STOCK_MARKET_EVENTS.filter((item) => {
    if (!safeCondition(item, s)) return false;
    if (ignoreCooldown) return true;
    const last = market.events.cooldowns[item.id];
    return !last || monthsSince(month, last) >= item.cooldownMonths;
  });
}

export function openStockMarketEvent(s, eventId, { force = false } = {}) {
  const market = ensureStockMarket(s);
  const item = STOCK_MARKET_EVENT_BY_ID[eventId];
  assert(item && (force || safeCondition(item, s)), stockText("invalidEvent"));
  assert(!market.events.pending, stockText("invalidEvent"));
  market.events.pending = {
    id: uid(s, "market-event"),
    eventId,
    openedOn: s.date,
    expiresOn: addDays(s.date, 10),
  };
  return market.events.pending;
}

function weightedEvent(s, options, key) {
  if (!options.length) return null;
  const total = options.reduce((sum, item) => sum + item.weight, 0);
  let roll = marketDeterministicUnit(s.stockMarket, key) * total;
  for (const item of options) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return options.at(-1);
}

export function maybeOpenStockMarketEvent(s, { force = false } = {}) {
  const market = ensureStockMarket(s);
  if (market.events.pending) return null;
  const month = marketMonth(s.date);
  if (!force && market.events.lastMonth === month) return null;
  market.events.lastMonth = month;
  const options = eligibleStockMarketEvents(s);
  if (!options.length) return null;
  const occurrence = marketDeterministicUnit(market, `${month}:event-occurs`);
  if (!force && occurrence > 0.72) return null;
  const item = weightedEvent(s, options, `${month}:event-pick`);
  return item ? openStockMarketEvent(s, item.id) : null;
}

function personalDelta(s, amount) {
  if (!Number.isSafeInteger(amount) || amount === 0) return;
  if (amount > 0) personalIncome(s, amount);
  else {
    const unpaid = personalExpense(s, -amount);
    if (unpaid > 0) ensureEmpire(s).debt += unpaid;
  }
}

function shockListing(listing, rate) {
  if (!listing || !Number.isFinite(rate) || rate === 0) return;
  const previous = listing.price;
  listing.previousPrice = previous;
  listing.price = roundPrice(previous * (1 + clamp(rate, -0.6, 0.6)));
  listing.lastReturn = listing.price / previous - 1;
  listing.marketCap = Math.round(listing.price * listing.sharesOutstanding);
}

function weightedListing(s, key) {
  const listed = s.stockMarket.listings.filter(
    (listing) => listing.status === "listed",
  );
  if (!listed.length) return null;
  const index = Math.floor(
    marketDeterministicUnit(s.stockMarket, key) * listed.length,
  );
  return listed[Math.min(index, listed.length - 1)];
}

function applyEventEffects(s, item, choice, pending) {
  const market = ensureStockMarket(s);
  const effects = choice.effects || {};
  personalDelta(s, effects.wealth || 0);
  market.regulator.risk = clamp(
    market.regulator.risk + (effects.risk || 0),
    0,
    100,
  );
  market.insider.exposure = clamp(
    market.insider.exposure + (effects.insiderExposure || 0),
    0,
    100,
  );
  market.manipulation.exposure = clamp(
    market.manipulation.exposure + (effects.manipulationExposure || 0),
    0,
    100,
  );
  if (effects.suspicion) addSuspicion(s, effects.suspicion);
  if (effects.whistleblower) triggerMarketWhistleblower(s, { force: true });
  if (Number.isFinite(effects.cycleIntensity))
    market.cycle.intensity = clamp(
      market.cycle.intensity + effects.cycleIntensity,
      0,
      100,
    );
  if (effects.cycle)
    setMarketCycle(
      s,
      effects.cycle,
      effects.cycleIntensity ?? null,
      `event:${item.id}`,
    );
  if (market.ipos.club && Number.isFinite(effects.shareholderPressure))
    market.ipos.club.pressure = clamp(
      market.ipos.club.pressure + effects.shareholderPressure,
      0,
      100,
    );
  if (Number.isFinite(effects.fanSupport))
    s.fanSupport = clamp((s.fanSupport || 0) + effects.fanSupport, 0, 100);

  if (Number.isFinite(effects.allListingsShock)) {
    for (const listing of market.listings)
      if (listing.status === "listed")
        shockListing(listing, effects.allListingsShock);
  }
  if (Number.isFinite(effects.indexShock)) {
    for (const listing of market.listings)
      if (listing.status === "listed")
        shockListing(listing, effects.indexShock * 0.45);
    market.index.previousValue = market.index.value;
    market.index.value = Math.max(
      50,
      Math.round(market.index.value * (1 + effects.indexShock) * 100) / 100,
    );
    market.index.change = Math.round(effects.indexShock * 100 * 100) / 100;
  }
  if (Number.isFinite(effects.ownListingShock)) {
    const listing = listingForClub(s, s.clubId);
    if (listing)
      recordMarketSignal(s, {
        listingId: listing.id,
        kind: "rumor",
        magnitude: Math.abs(effects.ownListingShock),
        direction: effects.ownListingShock < 0 ? -1 : 1,
        publicOn: s.date,
        source: pending.id,
      });
  }
  if (Number.isFinite(effects.listingShock)) {
    const listing = weightedListing(s, `${pending.id}:listing`);
    if (listing)
      recordMarketSignal(s, {
        listingId: listing.id,
        kind: "rumor",
        magnitude: Math.abs(effects.listingShock),
        direction: effects.listingShock < 0 ? -1 : 1,
        publicOn: s.date,
        source: pending.id,
      });
  }
  if (effects.brokerTip) {
    const listing = weightedListing(s, `${pending.id}:broker-listing`);
    const reliable =
      marketDeterministicUnit(market, `${pending.id}:broker-reliable`) >= 0.42;
    if (listing)
      recordMarketSignal(s, {
        listingId: listing.id,
        kind: "broker",
        magnitude: reliable ? 1.4 : 1.6,
        direction: reliable ? 1 : -1,
        publicOn: s.date,
        source: pending.id,
      });
  }
}

export function resolveStockMarketEvent(s, choiceId) {
  const market = ensureStockMarket(s);
  const pending = market.events.pending;
  const item = pending && STOCK_MARKET_EVENT_BY_ID[pending.eventId];
  const selected = item?.choices.find((choice) => choice.id === choiceId);
  assert(item && selected, stockText("invalidEvent"));
  applyEventEffects(s, item, selected, pending);
  const record = {
    ...pending,
    status: "resolved",
    resolvedOn: s.date,
    choiceId,
  };
  market.events.history.unshift(record);
  if (market.events.history.length > 100) market.events.history.length = 100;
  market.events.cooldowns[item.id] = marketMonth(s.date);
  market.events.pending = null;
  message(s, {
    title: stockText("marketEvents"),
    body: stockText("eventResolved"),
    category: "events",
  });
  return record;
}

export function expireStockMarketEvent(s) {
  const market = ensureStockMarket(s);
  const pending = market.events.pending;
  if (!pending || s.date <= pending.expiresOn) return null;
  const record = {
    ...pending,
    status: "expired",
    resolvedOn: s.date,
    choiceId: null,
  };
  market.events.history.unshift(record);
  market.events.cooldowns[pending.eventId] = marketMonth(s.date);
  market.events.pending = null;
  message(s, {
    title: stockText("marketEvents"),
    body: stockText("eventExpired"),
    category: "events",
  });
  return record;
}

export function stockMarketEventDay(s) {
  expireStockMarketEvent(s);
  if (s.date.slice(8, 10) !== "01") return null;
  return maybeOpenStockMarketEvent(s);
}
