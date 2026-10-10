import assert from "node:assert/strict";
import { test } from "node:test";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import {
  calculateMonthlyPrice,
  recordMarketSignal,
  updateStockPrices,
} from "../src/services/stockMarket/engine.js";
import {
  ensureStockMarket,
  listingForClub,
} from "../src/services/stockMarket/state.js";

const game = () =>
  createGame({ database: "demo", leagues: ["eg"], ownerStory: "selfmade" });

test("بورصة الأندية تهيئ سعرًا لكل نادٍ ومؤشرًا عامًا ومحفظة فارغة", () => {
  const s = game();
  const market = ensureStockMarket(s);
  assert.equal(SAVE_VERSION, 34);
  assert.equal(
    market.listings.filter((listing) => listing.assetType === "club").length,
    s.table.length,
  );
  assert(
    market.listings.every(
      (listing) => listing.price > 0 && listing.marketCap > 0,
    ),
  );
  assert.equal(
    listingForClub(s, s.clubId).status,
    "private",
    "own club waits for its IPO",
  );
  assert(
    market.listings
      .filter((listing) => listing.clubId !== s.clubId)
      .every((listing) => listing.status === "listed"),
  );
  assert.deepEqual(market.portfolio.positions, []);
  assert.deepEqual(market.portfolio.shorts, []);
  assert.deepEqual(market.index.history, [[s.date.slice(0, 7), 1000]]);
});

test("محرك السعر يجمع النتائج والألقاب والصفقات والفضائح والإصابات والاتحاد والمنشآت", () => {
  const s = game();
  const listing = listingForClub(s, "zamalek");
  const kinds = [
    "result",
    "title",
    "transfer",
    "scandal",
    "injury",
    "federation",
    "facility",
  ];
  const signals = kinds.map((kind) => ({
    id: kind,
    kind,
    magnitude: 1,
    direction: 1,
  }));
  const quote = calculateMonthlyPrice(s, listing, {
    signals,
    metrics: listing.metrics,
  });
  assert.deepEqual(
    new Set(quote.factors.map((factor) => factor.kind)),
    new Set(kinds),
  );
  assert(Number.isFinite(quote.price));
  assert(quote.price > 0);

  const trophy = calculateMonthlyPrice(s, listing, {
    signals: [{ id: "cup", kind: "title", magnitude: 2, direction: 1 }],
    metrics: listing.metrics,
  });
  const scandal = calculateMonthlyPrice(s, listing, {
    signals: [{ id: "case", kind: "scandal", magnitude: 2, direction: 1 }],
    metrics: listing.metrics,
  });
  assert(trophy.monthlyReturn > scandal.monthlyReturn);
});

test("التسعير شهري وحتمي ويحفظ تاريخ السهم والمؤشر ولا يستهلك الخبر السري قبل الإعلان", () => {
  const s = game();
  const listing = listingForClub(s, "zamalek");
  const immediate = recordMarketSignal(s, {
    clubId: "zamalek",
    kind: "title",
    magnitude: 1,
    source: "test-cup",
  });
  const secret = recordMarketSignal(s, {
    clubId: "zamalek",
    kind: "transfer",
    magnitude: 1,
    secret: true,
    publicOn: "2026-09-01",
    source: "test-secret",
  });
  const seedBefore = s.seed;
  s.date = "2026-08-01";
  const result = updateStockPrices(s);
  assert.equal(result.updated, true);
  assert.equal(immediate.consumedOn, s.date);
  assert.equal(secret.consumedOn, null);
  assert.equal(listing.history.length, 2);
  assert.equal(s.stockMarket.index.history.length, 2);
  assert.equal(s.seed, seedBefore, "market noise must not perturb match RNG");
  assert.equal(updateStockPrices(s).updated, false, "same month is idempotent");
});

test("ترحيل v32 لا يمس الثروة أو النتائج ويضيف سوقًا أوليًا بلا مراكز", () => {
  const current = game();
  const old = structuredClone(current);
  old.version = 32;
  delete old.stockMarket;
  const wealth = old.empire.personal;
  const table = structuredClone(old.table);
  const migrated = migrateSave(old);
  assert.equal(old.version, 32, "migration clones the old save");
  assert.equal(migrated.version, 34);
  assert.equal(migrated.empire.personal, wealth);
  assert.deepEqual(migrated.table, table);
  assert.equal(migrated.stockMarket.listings.length, table.length);
  assert.deepEqual(migrated.stockMarket.portfolio.positions, []);
  assert.match(migrated.migrationNote, /0\.37/);
  assert.strictEqual(
    migrateSave(migrated),
    migrated,
    "current saves pass through unchanged",
  );
});
