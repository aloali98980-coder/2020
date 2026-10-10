import assert from "node:assert/strict";
import { test } from "node:test";
import { createGame } from "../src/core/game.js";
import {
  buyShares,
  portfolioSummary,
  sellShares,
  settlePortfolioDividends,
  tradeQuote,
} from "../src/services/stockMarket/trading.js";
import {
  listingForClub,
  marketMonth,
} from "../src/services/stockMarket/state.js";

const game = () =>
  createGame({ database: "demo", leagues: ["eg"], ownerStory: "selfmade" });

test("الشراء والبيع يتمان من الثروة الشخصية ويحدثان المحفظة والأرباح المحققة", () => {
  const s = game();
  const listing = listingForClub(s, "zamalek");
  const wealth = s.empire.personal;
  const buyQuote = tradeQuote(listing, 1_000, "buy");
  const bought = buyShares(s, listing.id, 1_000);
  assert.equal(s.empire.personal, wealth - buyQuote.total);
  assert.equal(bought.position.quantity, 1_000);
  assert.equal(bought.position.costBasis, buyQuote.total);
  assert.equal(s.stockMarket.portfolio.orders[0].side, "buy");

  const sellQuote = tradeQuote(listing, 400, "sell");
  const sold = sellShares(s, listing.id, 400);
  assert.equal(s.empire.personal, wealth - buyQuote.total + sellQuote.total);
  assert.equal(sold.position.quantity, 600);
  assert.equal(s.stockMarket.portfolio.orders[0].side, "sell");
  assert.equal(
    s.stockMarket.portfolio.realizedProfit,
    sold.profit,
    "realised result includes allocated cost and both fees",
  );
  const summary = portfolioSummary(s);
  assert.equal(summary.positions[0].quantity, 600);
  assert.equal(summary.value, Math.round(listing.price * 600));
});

test("يمكن شراء أسهم المنافسين لكن النادي الخاص والأوامر غير الممولة تُرفض", () => {
  const s = game();
  const rival = listingForClub(s, "pyramids");
  assert.doesNotThrow(() => buyShares(s, rival.id, 10));
  const own = listingForClub(s, s.clubId);
  assert.throws(() => buyShares(s, own.id, 10), /غير متاح|not tradable/i);
  assert.throws(
    () => buyShares(s, rival.id, 10_000_000_000),
    /لا تكفي|insufficient/i,
  );
  assert.throws(() => buyShares(s, rival.id, 1.5), /غير صالح|invalid/i);
  assert.throws(() => sellShares(s, rival.id, 11), /لا تملك|do not own/i);
});

test("الأندية الرابحة توزع أرباحًا شهرية إلى الثروة والتسوية لا تتكرر", () => {
  const s = game();
  const profitable = listingForClub(s, "zamalek");
  const losing = listingForClub(s, "masry");
  buyShares(s, profitable.id, 20_000);
  buyShares(s, losing.id, 20_000);
  profitable.lastProfit = 25_000_000;
  losing.lastProfit = -4_000_000;
  const before = s.empire.personal;
  const month = marketMonth(s.date);
  const payment = settlePortfolioDividends(s, month);
  assert(payment.amount > 0);
  assert.equal(payment.payments.length, 1);
  assert.equal(payment.payments[0].listingId, profitable.id);
  assert.equal(s.empire.personal, before + payment.amount);
  assert.equal(s.stockMarket.portfolio.dividends, payment.amount);
  const duplicate = settlePortfolioDividends(s, month);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.amount, 0);
  assert.equal(s.empire.personal, before + payment.amount);
});

test("بيع المركز كاملًا يزيله مع إبقاء سجل الأوامر والتوزيعات", () => {
  const s = game();
  const listing = listingForClub(s, "zamalek");
  buyShares(s, listing.id, 250);
  sellShares(s, listing.id, 250);
  const summary = portfolioSummary(s);
  assert.equal(summary.positions.length, 0);
  assert.equal(s.stockMarket.portfolio.orders.length, 2);
  assert(Number.isSafeInteger(summary.realized));
});
