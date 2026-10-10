// حدود الثقة لحفظ البورصة 0.37. لا تُقبل أسعار غير منتهية أو مراجع أسهم مكسورة.
import { stockText } from "../data/stockMarketTexts.js";
import {
  PRICE_HISTORY_LIMIT,
  STOCK_MARKET_SCHEMA,
} from "../services/stockMarket/state.js";
import { isoDate } from "./isoDate.js";

const saveId = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const month = (value) =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const finite = (value, min = -Infinity, max = Infinity) =>
  Number.isFinite(value) && value >= min && value <= max;
const whole = (value) => Number.isSafeInteger(value);
const safeWhole = (value, min = 0) => whole(value) && value >= min;
const check = (condition, explanation) => {
  if (!condition) throw new Error(explanation);
};

export function validateStockMarket(s) {
  const market = s.stockMarket;
  check(
    market &&
      market.schema === STOCK_MARKET_SCHEMA &&
      whole(market.seed) &&
      isoDate(market.createdOn) &&
      month(market.lastUpdate) &&
      Array.isArray(market.listings) &&
      market.listings.length <= 5000,
    stockText("invalidMarketState"),
  );
  const listingIds = new Set();
  for (const listing of market.listings) {
    check(
      saveId(listing.id) &&
        !listingIds.has(listing.id) &&
        ["club", "company"].includes(listing.assetType) &&
        ["listed", "private", "delisted"].includes(listing.status) &&
        listing.name &&
        [listing.name.ar, listing.name.en, listing.name.fr].every(
          (value) => typeof value === "string" && value.length <= 180,
        ) &&
        finite(listing.price, 0.01, 1_000_000_000) &&
        finite(listing.previousPrice, 0.01, 1_000_000_000) &&
        finite(listing.initialPrice, 0.01, 1_000_000_000) &&
        safeWhole(listing.sharesOutstanding, 1) &&
        safeWhole(listing.floatShares) &&
        listing.floatShares <= listing.sharesOutstanding &&
        safeWhole(listing.marketCap) &&
        safeWhole(listing.fundamentalValue) &&
        finite(listing.lastReturn, -1, 10) &&
        finite(listing.lastProfit, -9_000_000_000_000, 9_000_000_000_000) &&
        Array.isArray(listing.history) &&
        listing.history.length <= PRICE_HISTORY_LIMIT &&
        listing.history.every(
          (point) =>
            Array.isArray(point) &&
            point.length === 2 &&
            month(point[0]) &&
            finite(point[1], 0.01, 1_000_000_000),
        ) &&
        Array.isArray(listing.signals) &&
        listing.signals.length <= 120 &&
        finite(listing.distressScore, 0, 100) &&
        (!listing.haltedUntil || isoDate(listing.haltedUntil)),
      stockText("invalidListingSave"),
    );
    if (listing.assetType === "club")
      check(saveId(listing.clubId), stockText("invalidClubReference"));
    if (listing.assetType === "company")
      check(saveId(listing.companyId), stockText("invalidCompanyReference"));
    listingIds.add(listing.id);
  }

  const index = market.index;
  check(
    index &&
      finite(index.value, 0.01, 1_000_000_000) &&
      finite(index.previousValue, 0.01, 1_000_000_000) &&
      finite(index.initialValue, 0.01, 1_000_000_000) &&
      safeWhole(index.capitalisation) &&
      finite(index.change, -100, 1000) &&
      Array.isArray(index.history) &&
      index.history.length <= PRICE_HISTORY_LIMIT &&
      index.history.every(
        (point) =>
          Array.isArray(point) &&
          point.length === 2 &&
          month(point[0]) &&
          finite(point[1], 0.01, 1_000_000_000),
      ),
    stockText("invalidMarketIndex"),
  );

  const portfolio = market.portfolio;
  check(
    portfolio &&
      Array.isArray(portfolio.positions) &&
      portfolio.positions.length <= 5000 &&
      Array.isArray(portfolio.shorts) &&
      portfolio.shorts.length <= 5000 &&
      Array.isArray(portfolio.orders) &&
      portfolio.orders.length <= 10000 &&
      Array.isArray(portfolio.history) &&
      portfolio.history.length <= 1000 &&
      finite(portfolio.realizedProfit, -9_000_000_000_000, 9_000_000_000_000) &&
      safeWhole(portfolio.dividends) &&
      safeWhole(portfolio.fees) &&
      portfolio.positions.every(
        (position) =>
          listingIds.has(position.listingId) &&
          safeWhole(position.quantity, 1) &&
          safeWhole(position.costBasis) &&
          finite(position.averagePrice, 0.01, 1_000_000_000) &&
          isoDate(position.openedOn) &&
          isoDate(position.updatedOn),
      ) &&
      portfolio.shorts.every(
        (position) =>
          saveId(position.id) &&
          listingIds.has(position.listingId) &&
          safeWhole(position.quantity, 1) &&
          finite(position.entryPrice, 0.01, 1_000_000_000) &&
          ["open", "closed"].includes(position.status),
      ),
    stockText("invalidTradingPortfolio"),
  );

  const bounded = (value) => finite(value, 0, 100);
  const regulator = market.regulator;
  check(
    regulator &&
      bounded(regulator.risk) &&
      ["clear", "watch", "investigation", "suspended", "criminal"].includes(
        regulator.status,
      ) &&
      (!regulator.tradingHaltUntil || isoDate(regulator.tradingHaltUntil)) &&
      (!regulator.nextAudit || isoDate(regulator.nextAudit)) &&
      Array.isArray(regulator.audits) &&
      regulator.audits.length <= 120 &&
      Array.isArray(regulator.investigations) &&
      regulator.investigations.length <= 40 &&
      safeWhole(regulator.finesTotal) &&
      safeWhole(regulator.criminalScandals) &&
      safeWhole(regulator.whistleblowers),
    stockText("invalidRegulatorState"),
  );
  check(
    market.insider &&
      bounded(market.insider.exposure) &&
      Array.isArray(market.insider.knowledge) &&
      market.insider.knowledge.length <= 500 &&
      Array.isArray(market.insider.trades) &&
      market.insider.trades.length <= 500 &&
      market.manipulation &&
      bounded(market.manipulation.exposure) &&
      Array.isArray(market.manipulation.campaigns) &&
      market.manipulation.campaigns.length <= 300,
    stockText("invalidAbuseRecords"),
  );

  check(
    market.ipos &&
      Array.isArray(market.ipos.history) &&
      market.ipos.history.length <= 200 &&
      Array.isArray(market.ipos.quarterly) &&
      market.ipos.quarterly.length <= 24 &&
      (!market.ipos.club ||
        (listingIds.has(market.ipos.club.listingId) &&
          bounded(market.ipos.club.pressure) &&
          finite(market.ipos.club.fanOwnershipPct, 0, 49) &&
          isoDate(market.ipos.club.nextReview))) &&
      (!market.ipos.betting ||
        (listingIds.has(market.ipos.betting.listingId) &&
          finite(market.ipos.betting.founderOwnershipPct, 0, 100))),
    stockText("invalidIpoRecords"),
  );
  check(
    market.cycle &&
      ["neutral", "bull", "bubble", "crash", "recovery"].includes(
        market.cycle.phase,
      ) &&
      bounded(market.cycle.intensity) &&
      safeWhole(market.cycle.months) &&
      Array.isArray(market.cycle.history) &&
      market.cycle.history.length <= 36 &&
      market.events &&
      Array.isArray(market.events.history) &&
      market.events.history.length <= 100 &&
      market.events.cooldowns &&
      typeof market.events.cooldowns === "object" &&
      (!market.events.pending ||
        (saveId(market.events.pending.id) &&
          saveId(market.events.pending.eventId) &&
          isoDate(market.events.pending.openedOn) &&
          isoDate(market.events.pending.expiresOn))) &&
      Array.isArray(market.distressed) &&
      market.distressed.length <= 30,
    stockText("invalidCycleRecords"),
  );
}
