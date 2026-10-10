// التداول النظيف 0.37 — أوامر من الثروة الشخصية، محفظة، وأرباح موزعة.
import { assert, clamp, uid } from "../../core/utils.js";
import { stockText } from "../../data/stockMarketTexts.js";
import {
  ensureStockMarket,
  listingById,
  marketMonth,
  roundPrice,
} from "./state.js";
import { ensureEmpire, personalIncome } from "../empire/wealth.js";

export const BROKER_FEE_RATE = 0.003;
export const MIN_BROKER_FEE = 50;
export const CLUB_DIVIDEND_PAYOUT = 0.2;
export const COMPANY_DIVIDEND_PAYOUT = 0.35;
export const ORDER_HISTORY_LIMIT = 240;

function assertQuantity(quantity) {
  assert(
    Number.isSafeInteger(quantity) && quantity > 0,
    stockText("invalidQuantity"),
  );
}

function regulatorHalted(market, date) {
  return Boolean(
    market.regulator?.tradingHaltUntil &&
    date <= market.regulator.tradingHaltUntil,
  );
}

export function isTradable(s, listing) {
  const market = ensureStockMarket(s);
  return Boolean(
    listing &&
    listing.status === "listed" &&
    (!listing.haltedUntil || s.date > listing.haltedUntil) &&
    !regulatorHalted(market, s.date),
  );
}

function assertTradable(s, listing) {
  const market = ensureStockMarket(s);
  if (regulatorHalted(market, s.date))
    throw new Error(stockText("tradingSuspended"));
  assert(isTradable(s, listing), stockText("notTradable"));
}

export function tradeQuote(listing, quantity, side = "buy") {
  assertQuantity(quantity);
  assert(
    listing && Number.isFinite(listing.price),
    stockText("invalidListing"),
  );
  const floatShares = Math.max(
    1,
    Number(listing.floatShares) || Number(listing.sharesOutstanding) || 1,
  );
  const impact = clamp((quantity / floatShares) * 0.08, 0, 0.035);
  const executionPrice = roundPrice(
    listing.price * (side === "sell" ? 1 - impact : 1 + impact),
  );
  const gross = Math.round(executionPrice * quantity);
  const fee = Math.max(MIN_BROKER_FEE, Math.round(gross * BROKER_FEE_RATE));
  return {
    side,
    quantity,
    marketPrice: listing.price,
    executionPrice,
    gross,
    fee,
    total: side === "sell" ? Math.max(0, gross - fee) : gross + fee,
    impact,
  };
}

function positionFor(market, listingId) {
  return market.portfolio.positions.find(
    (position) => position.listingId === listingId,
  );
}

function rememberOrder(market, order) {
  market.portfolio.orders.unshift(order);
  if (market.portfolio.orders.length > ORDER_HISTORY_LIMIT)
    market.portfolio.orders.length = ORDER_HISTORY_LIMIT;
  return order;
}

export function buyShares(
  s,
  listingId,
  quantity,
  { reason = "clean", insiderInfoId = null, manipulationId = null } = {},
) {
  assertQuantity(quantity);
  const market = ensureStockMarket(s);
  const listing = listingById(s, listingId);
  assert(listing, stockText("invalidListing"));
  assertTradable(s, listing);
  const quote = tradeQuote(listing, quantity, "buy");
  const empire = ensureEmpire(s);
  assert(empire.personal >= quote.total, stockText("insufficientWealth"));

  empire.personal -= quote.total;
  market.portfolio.fees += quote.fee;
  let position = positionFor(market, listing.id);
  if (!position) {
    position = {
      listingId: listing.id,
      quantity: 0,
      costBasis: 0,
      averagePrice: 0,
      openedOn: s.date,
      updatedOn: s.date,
    };
    market.portfolio.positions.push(position);
  }
  position.quantity += quantity;
  position.costBasis += quote.total;
  position.averagePrice = roundPrice(
    position.costBasis / Math.max(1, position.quantity),
  );
  position.updatedOn = s.date;

  const order = rememberOrder(market, {
    id: uid(s, "stock-order"),
    date: s.date,
    month: marketMonth(s.date),
    listingId: listing.id,
    side: "buy",
    quantity,
    price: quote.executionPrice,
    gross: quote.gross,
    fee: quote.fee,
    total: quote.total,
    reason,
    insiderInfoId,
    manipulationId,
  });
  return { order, position, quote };
}

export function sellShares(
  s,
  listingId,
  quantity,
  { reason = "clean", insiderInfoId = null, manipulationId = null } = {},
) {
  assertQuantity(quantity);
  const market = ensureStockMarket(s);
  const listing = listingById(s, listingId);
  assert(listing, stockText("invalidListing"));
  assertTradable(s, listing);
  const position = positionFor(market, listing.id);
  assert(
    position && position.quantity >= quantity,
    stockText("insufficientShares"),
  );
  const quote = tradeQuote(listing, quantity, "sell");
  const empire = ensureEmpire(s);
  const allocatedCost = Math.round(
    (position.costBasis * quantity) / position.quantity,
  );
  const profit = quote.total - allocatedCost;

  empire.personal += quote.total;
  empire.monthTrack.returns += profit;
  market.portfolio.fees += quote.fee;
  market.portfolio.realizedProfit += profit;
  position.quantity -= quantity;
  position.costBasis -= allocatedCost;
  position.averagePrice = position.quantity
    ? roundPrice(position.costBasis / position.quantity)
    : 0;
  position.updatedOn = s.date;
  if (!position.quantity)
    market.portfolio.positions = market.portfolio.positions.filter(
      (entry) => entry !== position,
    );

  const order = rememberOrder(market, {
    id: uid(s, "stock-order"),
    date: s.date,
    month: marketMonth(s.date),
    listingId: listing.id,
    side: "sell",
    quantity,
    price: quote.executionPrice,
    gross: quote.gross,
    fee: quote.fee,
    total: quote.total,
    profit,
    reason,
    insiderInfoId,
    manipulationId,
  });
  return {
    order,
    position: position.quantity ? position : null,
    quote,
    profit,
  };
}

export function portfolioSummary(s) {
  const market = ensureStockMarket(s);
  let value = 0;
  let costBasis = 0;
  const positions = market.portfolio.positions.map((position) => {
    const listing = market.listings.find(
      (entry) => entry.id === position.listingId,
    );
    const marketValue = Math.round((listing?.price || 0) * position.quantity);
    const unrealized = marketValue - position.costBasis;
    value += marketValue;
    costBasis += position.costBasis;
    return {
      ...position,
      listing,
      marketValue,
      unrealized,
      returnPct: position.costBasis
        ? Math.round((unrealized / position.costBasis) * 10_000) / 100
        : 0,
    };
  });
  const shortValue = (market.portfolio.shorts || [])
    .filter((position) => position.status === "open")
    .reduce(
      (sum, position) =>
        sum +
        Math.round(
          (position.entryPrice -
            (listingById(s, position.listingId)?.price || 0)) *
            position.quantity,
        ),
      0,
    );
  return {
    positions,
    value,
    costBasis,
    unrealized: value - costBasis,
    realized: market.portfolio.realizedProfit,
    dividends: market.portfolio.dividends,
    fees: market.portfolio.fees,
    shortValue,
    totalReturn:
      value -
      costBasis +
      market.portfolio.realizedProfit +
      market.portfolio.dividends +
      shortValue,
  };
}

function dividendFor(listing, quantity) {
  if (!(listing.lastProfit > 0) || !(quantity > 0)) return 0;
  const payout =
    listing.assetType === "company"
      ? COMPANY_DIVIDEND_PAYOUT
      : CLUB_DIVIDEND_PAYOUT;
  const perShare =
    (listing.lastProfit * payout) / Math.max(1, listing.sharesOutstanding);
  listing.dividendPerShare = Math.round(perShare * 10_000) / 10_000;
  return Math.max(0, Math.round(perShare * quantity));
}

export function settlePortfolioDividends(s, month = marketMonth(s.date)) {
  const market = ensureStockMarket(s);
  if (market.portfolio.lastDividendMonth === month)
    return { month, amount: 0, payments: [], duplicate: true };
  const payments = [];
  let amount = 0;
  for (const position of market.portfolio.positions) {
    const listing = market.listings.find(
      (entry) => entry.id === position.listingId,
    );
    if (!listing) continue;
    const paid = dividendFor(listing, position.quantity);
    if (!paid) continue;
    payments.push({
      listingId: listing.id,
      quantity: position.quantity,
      perShare: listing.dividendPerShare,
      amount: paid,
    });
    amount += paid;
  }
  if (amount > 0) personalIncome(s, amount);
  market.portfolio.dividends += amount;
  market.portfolio.lastDividendMonth = month;
  const summary = portfolioSummary(s);
  market.portfolio.history.push({
    month,
    value: summary.value,
    costBasis: summary.costBasis,
    unrealized: summary.unrealized,
    dividend: amount,
  });
  if (market.portfolio.history.length > 48)
    market.portfolio.history.splice(0, market.portfolio.history.length - 48);
  return { month, amount, payments, duplicate: false };
}
