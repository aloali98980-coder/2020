import assert from "node:assert/strict";
import { test } from "node:test";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { ensureBetting } from "../src/services/betting/state.js";
import {
  launchBettingIPO,
  listOwnClub,
  quarterlyShareholderReview,
  secondaryBettingOffering,
  valueBettingCompany,
  valueClubForIPO,
} from "../src/services/stockMarket/ipo.js";
import {
  distressedClubCandidates,
  identifyDistressedClubs,
  setMarketCycle,
  triggerMarketCrash,
} from "../src/services/stockMarket/cycles.js";
import { updateStockPrices } from "../src/services/stockMarket/engine.js";
import {
  ensureStockMarket,
  listingForClub,
} from "../src/services/stockMarket/state.js";

const game = () =>
  createGame({ database: "demo", leagues: ["eg"], ownerStory: "selfmade" });

function profitableBettingCompany(s) {
  const betting = ensureBetting(s);
  Object.assign(betting, {
    owned: true,
    founded: true,
    companyId: "player-bet",
    name: {
      ar: "إمباير بت",
      en: "Empire Bet",
      fr: "Empire Pari",
    },
    licenseTier: "continental",
    licenseStatus: "active",
    reputation: 76,
    customers: 180_000,
    branches: 3,
    onlineLevel: 3,
    lastMonthProfit: 2_600_000,
    profits: [
      { month: "2026-04", profit: 1_900_000 },
      { month: "2026-05", profit: 2_200_000 },
      { month: "2026-06", profit: 2_600_000 },
    ],
  });
  return betting;
}

test("تقييم شركة المراهنات وإدراج حصة منها يعيدان السيولة للثروة الشخصية", () => {
  const s = game();
  const betting = profitableBettingCompany(s);
  const before = s.empire.personal;
  const value = valueBettingCompany(s);
  assert(value >= 5_000_000);

  const result = launchBettingIPO(s, { percent: 30, discount: 10 });
  assert.equal(result.listing.assetType, "company");
  assert.equal(result.listing.status, "listed");
  assert.equal(result.listing.companyId, "betting");
  assert.equal(betting.publicOwnershipPct, 30);
  assert.equal(betting.founderOwnershipPct, 70);
  assert.equal(s.empire.personal, before + result.proceeds);
  assert(result.proceeds > value * 0.24);

  const secondaryBefore = s.empire.personal;
  const secondary = secondaryBettingOffering(s, 10);
  assert(secondary.proceeds > 0);
  assert.equal(betting.founderOwnershipPct, 60);
  assert.equal(s.empire.personal, secondaryBefore + secondary.proceeds);
  validateSave(s);
});

test("الاكتتاب الجماهيري للنادي يدخل الخزينة ويخلق مراجعة مساهمين ربع سنوية", () => {
  const s = game();
  const market = ensureStockMarket(s);
  const listing = listingForClub(s, s.clubId);
  const cashBefore = s.finance.cash;
  const valuation = valueClubForIPO(s);
  assert(valuation > 0);

  const result = listOwnClub(s, { percent: 25, discount: 8 });
  assert.equal(listing.status, "listed");
  assert.equal(result.record.fanOwnershipPct, 25);
  assert.equal(s.finance.cash, cashBefore + result.proceeds);
  assert.equal(
    s.finance.ledger[0].category,
    "club-ipo",
    "IPO proceeds must be posted to the club ledger",
  );
  assert.equal(market.ipos.club.pressure, 18);

  market.ipos.club.pressure = 50;
  listing.initialPrice = listing.price;
  listing.price *= 0.75;
  s.finance.ledger.unshift({
    id: `entry-${s.nextId++}`,
    date: s.date,
    amount: -25_000_000,
    category: "test",
    description: "test",
    key: `test:${s.nextId}`,
  });
  s.finance.cash -= 25_000_000;
  const review = quarterlyShareholderReview(s, { force: true });
  assert.equal(review.good, false);
  assert(market.ipos.club.pressure > 50);
  assert.equal(market.ipos.quarterly.length, 1);
  validateSave(s);
});

test("الانهيار يخفض الأسعار والدورة المتعاقبة تظل محدودة", () => {
  const s = game();
  const market = ensureStockMarket(s);
  const listing = market.listings.find((entry) => entry.status === "listed");
  const before = listing.price;
  triggerMarketCrash(s, 100, "unit-test");
  s.date = "2026-08-01";
  const update = updateStockPrices(s);
  assert.equal(update.updated, true);
  assert(
    listing.price < before * 0.9,
    "crash must produce a material monthly fall",
  );
  assert.equal(market.cycle.phase, "crash");
  assert(market.cycle.history.length <= 36);

  setMarketCycle(s, "recovery", 45, "unit-test");
  assert.equal(market.cycle.phase, "recovery");
  assert.equal(market.cycle.intensity, 45);
  validateSave(s);
});

test("محرك التعثر يرصد الأندية الرخيصة ويجهز قيمًا استرشادية للمرحلة التالية", () => {
  const s = game();
  const market = ensureStockMarket(s);
  const listing = market.listings.find(
    (entry) => entry.status === "listed" && entry.assetType === "club",
  );
  listing.price = Math.round(listing.initialPrice * 30) / 100;
  listing.marketCap = Math.round(listing.price * listing.sharesOutstanding);
  listing.lastProfit = -8_000_000;
  listing.distressScore = 76;
  if (s.expansion?.budgets) s.expansion.budgets[listing.clubId] = 500_000;

  const distressed = identifyDistressedClubs(s);
  const candidate = distressed.find((entry) => entry.listingId === listing.id);
  assert(candidate);
  assert(candidate.score >= 78);
  assert(candidate.askingValue < listing.marketCap);
  assert(distressedClubCandidates(s, 70).includes(candidate));
  validateSave(s);
});
