import assert from "node:assert/strict";
import { test } from "node:test";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import {
  STOCK_MARKET_EVENT_BY_ID,
  STOCK_MARKET_EVENT_PHRASES,
  STOCK_MARKET_EVENTS,
} from "../src/data/stockMarketEvents.js";
import {
  eligibleStockMarketEvents,
  openStockMarketEvent,
  resolveStockMarketEvent,
} from "../src/services/stockMarket/events.js";
import { ensureStockMarket } from "../src/services/stockMarket/state.js";

const game = () =>
  createGame({ database: "demo", leagues: ["eg"], ownerStory: "selfmade" });

test("كتالوج البورصة يقدم أكثر من 30 حدثًا فريدًا بنصوص AR/EN/FR وخيارات كاملة", () => {
  assert(STOCK_MARKET_EVENTS.length >= 30);
  assert.equal(
    new Set(STOCK_MARKET_EVENTS.map((event) => event.id)).size,
    STOCK_MARKET_EVENTS.length,
  );
  const s = game();
  for (const event of STOCK_MARKET_EVENTS) {
    assert.equal(STOCK_MARKET_EVENT_BY_ID[event.id], event);
    assert(event.conditionKey);
    assert.equal(typeof event.when(s), "boolean", event.id);
    for (const copy of [event.title, event.prompt])
      for (const language of ["ar", "en", "fr"])
        assert(copy[language]?.trim(), `${event.id}:${language}`);
    assert(event.choices.length >= 2, event.id);
    for (const choice of event.choices) {
      assert(choice.id);
      for (const language of ["ar", "en", "fr"])
        assert(
          choice.label[language]?.trim(),
          `${event.id}:${choice.id}:${language}`,
        );
    }
  }
  assert(
    Object.keys(STOCK_MARKET_EVENT_PHRASES).length >=
      STOCK_MARKET_EVENTS.length * 2,
  );
});

test("شروط الانهيار والتسريب والديربي لا تظهر إلا عندما تتحقق حالتها", () => {
  const s = game();
  const market = ensureStockMarket(s);
  s.fixtures = [];
  market.insider.exposure = 0;
  market.manipulation.exposure = 0;
  market.cycle.phase = "neutral";
  let ids = new Set(
    eligibleStockMarketEvents(s, { ignoreCooldown: true }).map(
      (event) => event.id,
    ),
  );
  assert(!ids.has("whistleblower-target"));
  assert(!ids.has("derby-panic"));
  assert(!ids.has("crash-wipes-savings"));

  market.insider.exposure = 60;
  s.fixtures.push({
    id: "event-derby",
    date: "2026-07-10",
    played: false,
    isDerby: true,
    home: s.clubId,
    away: "ahly",
  });
  market.cycle.phase = "crash";
  market.portfolio.positions.push({
    listingId: market.listings.find((listing) => listing.status === "listed")
      .id,
    quantity: 10,
    costBasis: 1000,
    averagePrice: 100,
    openedOn: s.date,
    updatedOn: s.date,
  });
  ids = new Set(
    eligibleStockMarketEvents(s, { ignoreCooldown: true }).map(
      (event) => event.id,
    ),
  );
  assert(ids.has("whistleblower-target"));
  assert(ids.has("derby-panic"));
  assert(ids.has("crash-wipes-savings"));
});

test("قرار حدث السوق يطبق أثر الثروة والمخاطرة ويسجل التهدئة الزمنية", () => {
  const s = game();
  const market = ensureStockMarket(s);
  const before = s.empire.personal;
  const pending = openStockMarketEvent(s, "board-member-leak", {
    force: true,
  });
  assert.equal(market.events.pending.id, pending.id);
  const record = resolveStockMarketEvent(s, "trade");
  assert.equal(record.status, "resolved");
  assert.equal(record.choiceId, "trade");
  assert.equal(s.empire.personal, before + 1_500_000);
  assert(market.insider.exposure >= 20);
  assert(market.regulator.risk >= 18);
  assert.equal(market.events.pending, null);
  assert.equal(market.events.cooldowns[record.eventId], s.date.slice(0, 7));
  validateSave(s);
});

test("نصيحة السمسار قد تكون صحيحة أو خاطئة لكنها دائمًا تترك إشارة قابلة للتسعير", () => {
  const s = game();
  const market = ensureStockMarket(s);
  const signalsBefore = market.listings.reduce(
    (sum, listing) => sum + listing.signals.length,
    0,
  );
  const wealthBefore = s.empire.personal;
  openStockMarketEvent(s, "broker-tip", { force: true });
  resolveStockMarketEvent(s, "follow");
  const signalsAfter = market.listings.reduce(
    (sum, listing) => sum + listing.signals.length,
    0,
  );
  assert.equal(signalsAfter, signalsBefore + 1);
  assert.equal(s.empire.personal, wealthBefore - 200_000);
  validateSave(s);
});
