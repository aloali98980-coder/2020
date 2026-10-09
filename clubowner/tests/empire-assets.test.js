// اختبارات أصول «حياة الملياردير» 0.29 — الكتالوج، الشراء والبيع،
// الصيانة الشهرية، ومرحلة القصر البصرية.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import {
  EMPIRE_ASSETS,
  ASSET_CATEGORIES,
  PALACE_TIERS,
  assetById,
} from "../src/data/empireAssets.js";
import {
  buyAsset,
  sellAsset,
  owns,
  palaceTier,
  palaceStage,
  totalUpkeep,
} from "../src/services/empire/assets.js";
import { empireDay } from "../src/services/empire/day.js";
import { netWorth } from "../src/services/empire/wealth.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ownerStory: "heir", ...opts });
  validateSave(s);
  return s;
};

test("الكتالوج: ٥ فئات وكل أصل له سعر وصيانة وقيمة بيع وبرستيج", () => {
  assert.equal(ASSET_CATEGORIES.length, 5);
  assert.ok(EMPIRE_ASSETS.length >= 17);
  for (const a of EMPIRE_ASSETS) {
    assert.ok(a.price > 0, a.id);
    assert.ok(a.upkeep > 0, a.id);
    assert.ok(a.sellPct > 0 && a.sellPct <= 1, a.id);
    assert.ok(a.prestige > 0, a.id);
    assert.ok(a.name.ar && a.name.en && a.name.fr, a.id);
    assert.ok(a.desc.ar && a.desc.en && a.desc.fr, a.id);
  }
  // العقارات تكوّن سلسلة القصر ١←٤.
  const homes = EMPIRE_ASSETS.filter((a) => a.cat === "home").map((a) => a.tier);
  assert.deepEqual(homes.sort(), [1, 2, 3, 4]);
  // لكل فئة أصل واحد على الأقل.
  for (const c of ASSET_CATEGORIES)
    assert.ok(EMPIRE_ASSETS.some((a) => a.cat === c.id), c.id);
});

test("الشراء يخصم من الشخصي ويضيف برستيجًا ولا يمس خزينة النادي", () => {
  const s = game();
  const clubBefore = s.finance.cash;
  const p = s.empire.personal;
  const def = assetById("car-sport");
  buyAsset(s, "car-sport");
  assert.equal(s.finance.cash, clubBefore);
  assert.equal(s.empire.personal, p - def.price);
  assert.ok(owns(s, "car-sport"));
  assert.ok(s.empire.prestige >= 10 + def.prestige);
  assert.equal(s.empire.assets[0].sellValue, Math.round(def.price * def.sellPct));
  validateSave(s);
});

test("لا شراء بلا سيولة ولا تكرار للأصل نفسه", () => {
  const s = game({ ownerStory: "gambler" });
  assert.throws(() => buyAsset(s, "yacht-mega")); // ٣٥٠ مليونًا فوق ١٥ مليونًا
  buyAsset(s, "car-sport");
  assert.throws(() => buyAsset(s, "car-sport"));
  assert.throws(() => buyAsset(s, "nope"));
});

test("البيع يعيد قيمة البيع (٨٠-٩٠٪ من السعر) ويخصم البرستيج", () => {
  const s = game();
  buyAsset(s, "home-villa");
  const owned = s.empire.assets[0];
  const before = s.empire.personal;
  const prestige = s.empire.prestige;
  const got = sellAsset(s, owned.id);
  assert.equal(got, owned.sellValue);
  assert.equal(s.empire.personal, before + got);
  assert.ok(s.empire.prestige < prestige);
  assert.ok(!owns(s, "home-villa"));
  assert.throws(() => sellAsset(s, "missing-id"));
});

test("صيانة شهرية تُخصم أول الشهر عبر إيقاع الزمن", () => {
  const s = game();
  buyAsset(s, "yacht-25"); // صيانة ٦٠٠ ألف
  const p = s.empire.personal;
  s.date = "2026-08-01";
  empireDay(s);
  // دخل الوريث ٦٠٠ ألف − معيشة مريح ٨٠٠ ألف − صيانة ٦٠٠ ألف
  assert.equal(s.empire.personal, p + 600_000 - 800_000 - 600_000);
  assert.equal(totalUpkeep(s), 600_000);
});

test("عجز الصيانة يتحول دينًا", () => {
  const s = game();
  buyAsset(s, "yacht-25"); // صيانة ٦٠٠ ألف شهريًا
  s.empire.personal = 0;
  const debt = s.empire.debt;
  s.date = "2026-08-01";
  // اليوم الأول: دخل ٦٠٠ ألف − معيشة مريح ٨٠٠ ألف − صيانة ٦٠٠ ألف = عجز ٨٠٠ ألف → دين.
  empireDay(s);
  assert.ok(s.empire.debt > debt, "الدين زاد لتغطية العجز");
  assert.equal(s.empire.personal, 0);
});

test("مرحلة القصر ترتقي مع أفضل عقار مملوك", () => {
  const s = game();
  s.empire.personal = 1_000_000_000; // ثروة اختبارية تغطي السلسلة كلها
  assert.equal(palaceTier(s), 0);
  assert.equal(palaceStage(s).tier, 0);
  buyAsset(s, "home-apartment");
  assert.equal(palaceTier(s), 1);
  buyAsset(s, "home-palace");
  assert.equal(palaceTier(s), 3);
  buyAsset(s, "home-island");
  assert.equal(palaceTier(s), 4);
  assert.equal(PALACE_TIERS.at(-1).tier, 4);
  // بيع أفضل عقار يعيد المرحلة لما يليه.
  const island = s.empire.assets.find((a) => a.assetId === "home-island");
  sellAsset(s, island.id);
  assert.equal(palaceTier(s), 3);
});

test("قيمة بيع الأصول تدخل في صافي الثروة", () => {
  const s = game();
  const before = netWorth(s);
  buyAsset(s, "art-painting"); // شراء يبدل نقدًا بقيمة بيع أقل قليلًا
  const owned = s.empire.assets[0];
  assert.equal(netWorth(s), before - owned.price + owned.sellValue);
});
