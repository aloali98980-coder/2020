// اختبارات محرك إمبراطورية المراهنات (0.36): الشراء والتأسيس والتراخيص
// والامتثال والرهان الداخلي والربح الشهري. تغطي الحالات الحدّية والرفض.
import assert from "node:assert/strict";
import test from "node:test";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { LICENSE_TIERS, BETTING_COMPANIES } from "../src/data/bettingCatalog.js";
import {
  ensureBetting,
  buyBettingCompany,
  foundBettingCompany,
  foundingCost,
  canLicense,
  upgradeLicense,
} from "../src/services/betting/state.js";
import { setResponsibleLevel, RESPONSIBLE_COSTS } from "../src/services/betting/compliance.js";
import { monthlyProfit } from "../src/services/betting/management.js";
import { placeInsiderBet, resolveInsiderBet } from "../src/services/betting/insider.js";
import { bettingDay } from "../src/services/betting/day.js";
import { ensureEmpire } from "../src/services/empire/wealth.js";

const rich = (amount = 10_000_000_000) => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  ensureBetting(s);
  ensureEmpire(s).personal = amount;
  return s;
};

const ownedGame = (companyId = BETTING_COMPANIES[0].id) => {
  const s = rich();
  buyBettingCompany(s, companyId);
  return s;
};

test("التهيئة: المخطط 1 وسوق منافسين يعمل حتى بلا شركة", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  const b = ensureBetting(s);
  assert.equal(b.schema, 1);
  assert.equal(b.owned ?? false, false);
  assert.ok(b.competitors.length > 0, "المنافسون مزروعون من البداية");
  for (const c of b.competitors) {
    assert.ok(Number.isFinite(c.customers) && c.customers > 0);
  }
  assert.equal(validateSave(s), s);
});

test("الشراء: يخصم السعر من الثروة الشخصية ويستنتج الترخيص من حجم الشركة", () => {
  const s = rich(50_000_000);
  const def = BETTING_COMPANIES[0];
  const before = ensureEmpire(s).personal;
  const b = buyBettingCompany(s, def.id);
  assert.equal(b.owned, true);
  assert.equal(b.companyId, def.id);
  assert.equal(ensureEmpire(s).personal, before - def.price);
  const implied = def.size === "large" ? "global" : def.size === "medium" ? "continental" : "local";
  assert.equal(b.licenseTier, implied);
  assert.equal(b.licenseStatus, "active");
  assert.equal(validateSave(s), s);
});

test("الشراء يرفض: الرصيد الناقص، والشركة المكررة، والشركة المجهولة", () => {
  const poor = rich(1);
  assert.throws(() => buyBettingCompany(poor, BETTING_COMPANIES[0].id));
  assert.equal(ensureBetting(poor).owned ?? false, false, "لا تغيير عند الفشل");

  const s = ownedGame();
  assert.throws(() => buyBettingCompany(s, BETTING_COMPANIES[1].id), /ملك|شركة/);
  const fresh = rich();
  assert.throws(() => buyBettingCompany(fresh, "no-such-company"));
});

test("الشبهات تمنع الشراء حين تبلغ سقف الترخيص", () => {
  const s = rich();
  const def = BETTING_COMPANIES[0];
  const tier = LICENSE_TIERS.local;
  s.blackFiles = { suspicion: tier.maxSuspicion };
  assert.throws(() => buyBettingCompany(s, def.id));
  assert.equal(ensureBetting(s).owned ?? false, false);
});

test("التأسيس: التكلفة = رسوم + تأسيس، ويحتاج سمعة كافية للترخيص", () => {
  for (const tierId of Object.keys(LICENSE_TIERS)) {
    const t = LICENSE_TIERS[tierId];
    assert.equal(foundingCost(tierId), t.fee + t.setup);
  }
  const s = rich();
  const high = LICENSE_TIERS.global;
  ensureBetting(s).reputation = high.minReputation - 1;
  assert.throws(() => canLicense(s, "global"), /سمعة|reput/i);
  ensureBetting(s).reputation = high.minReputation;
  assert.equal(canLicense(s, "global"), true);
  assert.throws(() => canLicense(s, "not-a-tier"));
});

test("التأسيس ينشئ شركة مؤسَّسة ويخصم التكلفة مرة واحدة", () => {
  const s = rich();
  const before = ensureEmpire(s).personal;
  const b = foundBettingCompany(s, "local", "شركتي");
  assert.equal(b.founded, true);
  assert.equal(b.licenseTier, "local");
  assert.equal(ensureEmpire(s).personal, before - foundingCost("local"));
  assert.throws(() => foundBettingCompany(s, "local"), /ملك|شركة/);
  assert.equal(validateSave(s), s);
});

test("ترقية الترخيص لأعلى فقط، وتدفع فرق الرسوم", () => {
  const s = ownedGame();
  const current = ensureBetting(s).licenseTier;
  const order = ["local", "continental", "global"];
  const lower = order.filter((t) => order.indexOf(t) <= order.indexOf(current));
  for (const t of lower) assert.throws(() => upgradeLicense(s, t), /أعلى|ترقية/);
  const next = order[order.indexOf(current) + 1];
  if (!next) return; // الشركة عالمية بالفعل
  ensureBetting(s).reputation = 100;
  const before = ensureEmpire(s).personal;
  const diff = LICENSE_TIERS[next].fee - LICENSE_TIERS[current].fee;
  const setupDiff = LICENSE_TIERS[next].setup - LICENSE_TIERS[current].setup;
  upgradeLicense(s, next);
  assert.equal(ensureBetting(s).licenseTier, next);
  assert.equal(ensureEmpire(s).personal, before - diff - setupDiff);
});

test("الامتثال: المستوى يجب أن يكون 0–3 وللشركة المملوكة فقط", () => {
  const none = rich();
  assert.throws(() => setResponsibleLevel(none, 1), /شركة|لا توجد/);
  const s = ownedGame();
  for (const bad of [-1, 4, 1.5, "2"]) assert.throws(() => setResponsibleLevel(s, bad));
  assert.equal(setResponsibleLevel(s, 2), 2);
  assert.equal(ensureBetting(s).compliance.responsibleLevel, 2);
  assert.equal(validateSave(s), s);
});

test("تكلفة اللعب المسؤول في الربح الشهري تطابق السعر المعروض", () => {
  const s = ownedGame();
  const b = ensureBetting(s);
  b.customers = 0; // بلا عملاء: لا إيراد ولا تباين، فالفرق بين المستويات هو التكلفة وحدها
  b.launchDate = null;
  setResponsibleLevel(s, 0);
  const p0 = monthlyProfit(s);
  for (let level = 1; level <= 3; level++) {
    setResponsibleLevel(s, level);
    const diff = p0 - monthlyProfit(s);
    assert.equal(diff, RESPONSIBLE_COSTS[level], `المستوى ${level} يجب أن يكلّف ${RESPONSIBLE_COSTS[level]}`);
  }
});

test("الرهان الداخلي: يحتاج شركة فعّالة ورصيدًا، ولا يتكرر وهو معلّق", () => {
  const none = rich();
  assert.throws(() => placeInsiderBet(none, 100_000, 50, "f1"), /شركة|لا توجد/);

  const s = ownedGame();
  const money = ensureEmpire(s).personal;
  assert.throws(() => placeInsiderBet(s, money + 1, 50, "f1"), /ثروتك|أكبر/);
  assert.throws(() => placeInsiderBet(s, 0, 50, "f1"));
  assert.throws(() => placeInsiderBet(s, 100_000, 101, "f1"));

  placeInsiderBet(s, 100_000, 40, "f1");
  const pending = ensureBetting(s).pendingInsider;
  assert.ok(pending && pending.amount === 100_000 && pending.fixtureId === "f1");
  assert.ok(pending.multiplier > 1, "المضاعف أكبر من 1");
  assert.ok(pending.detectionChance >= 0 && pending.detectionChance <= 1);
  assert.throws(() => placeInsiderBet(s, 100_000, 40, "f2"), /معلق/);
});

test("حل الرهان الداخلي يفرّغ الانتظار ولا يلمس مباراة غير مباراتك", () => {
  const s = ownedGame();
  placeInsiderBet(s, 100_000, 60, "our-match");
  const b = ensureBetting(s);
  const ours = { home: s.clubId, away: "other", homeGoals: 1, awayGoals: 0 };
  const neutral = { home: "x", away: "y", homeGoals: 0, awayGoals: 0 };
  // مباراة لا تخص فريقك: الرهان يبقى معلقًا
  const kept = resolveInsiderBet(s, neutral);
  assert.equal(kept, null);
  assert.ok(b.pendingInsider, "ما زال معلقًا");
  const res = resolveInsiderBet(s, ours);
  assert.ok(res, "أُغلق بعد مباراة فريقك");
  assert.equal(ensureBetting(s).pendingInsider, null);
  assert.equal(validateSave(s), s);
});

test("الدورة الشهرية للمراهنات: تعمل في اليوم الأول فقط ومرة واحدة للشهر", () => {
  const s = ownedGame();
  s.date = "2027-03-15";
  assert.equal(bettingDay(s), null, "ليس يوم الشهر الأول");
  s.date = "2027-04-01";
  const first = bettingDay(s);
  assert.ok(first && first.month === "2027-04");
  assert.equal(bettingDay(s), null, "لا تكرار في الشهر نفسه");
});
