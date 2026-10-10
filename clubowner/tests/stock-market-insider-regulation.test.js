import assert from "node:assert/strict";
import { test } from "node:test";
import { createGame } from "../src/core/game.js";
import {
  addInsideInformation,
  insideOpportunity,
  publishDueInsideInformation,
  tradeOnInsideInformation,
} from "../src/services/stockMarket/insider.js";
import {
  resolveMarketInvestigation,
  runMarketAudit,
  triggerMarketWhistleblower,
} from "../src/services/stockMarket/regulation.js";
import { listingForClub } from "../src/services/stockMarket/state.js";
import { buyShares } from "../src/services/stockMarket/trading.js";

const game = () =>
  createGame({ database: "demo", leagues: ["eg"], ownerStory: "selfmade" });

test("المعلومة الداخلية تعرض مخاطرة/ربح وتسجل تداول ما قبل الإعلان", () => {
  const s = game();
  const listing = listingForClub(s, "zamalek");
  const info = addInsideInformation(s, {
    listingId: listing.id,
    kind: "transfer",
    magnitude: 2,
    publicOn: "2026-07-20",
    sourceRef: "secret-deal-1",
  });
  const quote = insideOpportunity(s, info.id, 1_000, "buy");
  assert.equal(quote.favorable, true);
  assert(quote.expectedProfit > 0);
  assert(quote.detectionChance > 0 && quote.detectionChance < 100);
  const before = s.empire.personal;
  const trade = tradeOnInsideInformation(s, info.id, "buy", 1_000);
  assert(s.empire.personal < before);
  assert.equal(trade.order.reason, "insider");
  assert.equal(info.status, "used");
  assert(s.stockMarket.insider.exposure > 0);
  assert(s.stockMarket.regulator.risk > 0);
  assert.equal(s.stockMarket.insider.trades[0].infoId, info.id);
});

test("الخبر السري لا يصبح عامًا قبل موعده ثم ينشر إشارته في الموعد", () => {
  const s = game();
  const listing = listingForClub(s, "masry");
  const info = addInsideInformation(s, {
    listingId: listing.id,
    kind: "injury",
    publicOn: "2026-07-12",
    sourceRef: "injury-1",
  });
  assert.equal(publishDueInsideInformation(s), 0);
  s.date = "2026-07-12";
  assert.equal(publishDueInsideInformation(s), 1);
  assert.equal(info.status, "published");
  assert.equal(
    listing.signals.find((signal) => signal.id === info.signalId).secret,
    false,
  );
});

test("كشف التداول الداخلي يفرض الغرامة والإيقاف والشبهات وقد يعزل رئيس الاتحاد", () => {
  const s = game();
  const listing = listingForClub(s, "zamalek");
  const info = addInsideInformation(s, {
    listingId: listing.id,
    kind: "transfer",
    magnitude: 3,
    publicOn: "2026-08-01",
    sourceRef: "president-deal",
  });
  tradeOnInsideInformation(s, info.id, "buy", 15_000);
  s.politics.office.held = true;
  s.politics.office.termsServed = 1;
  s.politics.office.termStartSeason = s.seasonNumber;
  const wealthBefore = s.empire.personal;
  const audit = runMarketAudit(s, { forceDetected: true });
  const investigation = s.stockMarket.regulator.investigations.find(
    (entry) => entry.id === audit.investigationId,
  );
  investigation.evidence = 95;
  const result = resolveMarketInvestigation(s, investigation.id, {
    outcome: "criminal",
    forceRemoval: true,
  });
  assert.equal(result.outcome, "criminal");
  assert(result.fine > 0);
  assert(s.empire.personal < wealthBefore || s.empire.debt > 0);
  assert(s.blackFiles.suspicion >= 40);
  assert.equal(s.stockMarket.regulator.status, "criminal");
  assert(s.stockMarket.regulator.tradingHaltUntil > s.date);
  assert.equal(s.politics.office.held, false);
  assert.equal(result.removed, true);
  assert.throws(() => buyShares(s, listing.id, 1), /موقوف|suspended/i);
});

test("المبلغ يفتح تحقيقًا ذا أدلة أعلى عند تراكم الانكشاف", () => {
  const s = game();
  s.stockMarket.insider.exposure = 70;
  const investigation = triggerMarketWhistleblower(s, { force: true });
  assert(investigation);
  assert.equal(investigation.whistleblower, true);
  assert(investigation.evidence >= 70);
  assert.equal(s.stockMarket.regulator.whistleblowers, 1);
  assert.equal(s.stockMarket.regulator.status, "investigation");
});
