import assert from "node:assert/strict";
import { test } from "node:test";
import { createGame } from "../src/core/game.js";
import {
  closeShortPosition,
  dumpCampaign,
  launchRumorCampaign,
  shortBeforePoach,
  startPumpAndDump,
} from "../src/services/stockMarket/manipulation.js";
import {
  resolveMarketInvestigation,
  runMarketAudit,
} from "../src/services/stockMarket/regulation.js";
import { listingForClub } from "../src/services/stockMarket/state.js";

const game = () =>
  createGame({ database: "demo", leagues: ["eg"], ownerStory: "heir" });

test("التضخيم ثم البيع يربط الشراء والشائعة والبيع ويرفع انكشاف التلاعب", () => {
  const s = game();
  const listing = listingForClub(s, "zamalek");
  const operation = startPumpAndDump(s, listing.id, 5_000, 1_000_000);
  assert.equal(operation.campaign.type, "pump-dump");
  assert.equal(operation.purchase.order.manipulationId, operation.campaign.id);
  assert(s.stockMarket.manipulation.exposure > 0);
  const exposureBeforeDump = s.stockMarket.manipulation.exposure;
  listing.price = Math.round(listing.price * 1.6 * 100) / 100;
  const dumped = dumpCampaign(s, operation.campaign.id);
  assert.equal(dumped.campaign.status, "dumped");
  assert(dumped.sale.profit > 0);
  assert(s.stockMarket.manipulation.exposure > exposureBeforeDump);
  assert.equal(s.stockMarket.manipulation.profit, dumped.sale.profit);
});

test("الشائعة الهابطة تخصم ميزانيتها وتولد إشارة سالبة ومخاطر رقابية", () => {
  const s = game();
  const listing = listingForClub(s, "masry");
  const wealth = s.empire.personal;
  const campaign = launchRumorCampaign(s, listing.id, {
    direction: "bear",
    budget: 600_000,
  });
  assert.equal(s.empire.personal, wealth - 600_000);
  assert.equal(campaign.direction, "bear");
  const signal = listing.signals.find(
    (entry) => entry.id === campaign.signalId,
  );
  assert.equal(signal.direction, -1);
  assert(s.stockMarket.regulator.risk > 0);
});

test("البيع المكشوف قبل خطف نجم يربح عند هبوط المنافس ويترك أثرًا داخليًا", () => {
  const s = game();
  const listing = listingForClub(s, "zamalek");
  const player = s.players.find((entry) => entry.clubId === s.clubId);
  player.clubId = "zamalek";
  player.value = 50_000_000;
  const operation = shortBeforePoach(s, listing.id, 3_000, player.id);
  assert.equal(operation.campaign.type, "poach-short");
  assert.equal(operation.info.direction, -1);
  assert.equal(operation.position.reason, "poach-short");
  listing.price = Math.round(listing.price * 0.6 * 100) / 100;
  const closed = closeShortPosition(s, operation.position.id);
  assert(closed.profit > 0);
  assert.equal(closed.position.status, "closed");
  assert(s.stockMarket.manipulation.profit > 0);
});

test("الهيئة تكشف التلاعب وتطبق غرامة وشبهات حتى دون فضيحة جنائية", () => {
  const s = game();
  const listing = listingForClub(s, "pyramids");
  launchRumorCampaign(s, listing.id, {
    direction: "pump",
    budget: 2_000_000,
  });
  const audit = runMarketAudit(s, { forceDetected: true });
  const investigation = s.stockMarket.regulator.investigations.find(
    (entry) => entry.id === audit.investigationId,
  );
  const result = resolveMarketInvestigation(s, investigation.id, {
    outcome: "fine",
  });
  assert.equal(result.outcome, "fine");
  assert(result.fine > 0);
  assert(s.blackFiles.suspicion >= 8);
  assert.equal(s.stockMarket.regulator.status, "watch");
});
