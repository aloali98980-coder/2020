// الدفعة 5 — القسم 3: مصفوفة الروابط (سد خفيف، 12 رابطًا كحد أقصى، بلا أنظمة جديدة).
// كل رابط يُثبت بأحد شكلين:
//   • dyn: تشغيل الدالة الفعلية وقياس أن الحالة تغيّرت.
//   • wire: قراءة المصدر والتأكد من أن الاستدعاء موصول (لأن الرابط يعمل داخل يوم المحاكاة).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createGame } from "../src/core/game.js";
import { recordTicketPriceChange, recordSupporterResult, recordSupporterSigning, ensureUltras } from "../src/services/ultras.js";
import { ensureSportsCity } from "../src/services/sportsCity.js";
import { settleCityMonth } from "../src/services/cityFacilities.js";
import { migrateDynasty, marryOwner, divorceOwner } from "../src/services/dynasty.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = (p) => readFileSync(join(root, "src", p), "utf8");
const wired = (file, pattern) => assert.match(src(file), pattern, `${file} لا يوصل الرابط`);

const fresh = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  ensureUltras(s);
  return s;
};

// ── dyn: الحالة تتغير فعلًا ─────────────────────────────────────
test("الرابط 1 (dyn): تغيير سعر التذكرة يغيّر مزاج الجماهير", () => {
  const s = fresh();
  const before = JSON.stringify(s.ultras);
  recordTicketPriceChange(s, 50, 90);
  assert.notEqual(JSON.stringify(s.ultras), before);
});

test("الرابط 2 (dyn): نتيجة المباراة تغيّر مزاج جماهير الفريقين", () => {
  const s = fresh();
  const [home, away] = Object.keys(s.ultras.groups);
  const before = JSON.stringify(s.ultras);
  recordSupporterResult(s, { home, away, homeGoals: 3, awayGoals: 0, isDerby: false, date: s.date });
  assert.notEqual(JSON.stringify(s.ultras), before);
});

test("الرابط 3 (dyn): التعاقد مع لاعب 72+ يُسجَّل كردّ فعل للأولتراس", () => {
  const s = fresh();
  const player = { id: "sig-1", clubId: s.clubId, rating: 80, name: "Test" };
  assert.equal(recordSupporterSigning(s, player), true);
  const group = s.ultras.groups[s.clubId];
  assert.equal(group.lastSigningDate, s.date);
  assert.equal(group.lastSigningPlayer.id, "sig-1");
});

test("الرابط 4 (dyn): مبنى المدينة يرفع الدعم الجماهيري شهريًا عبر تمثال الإنجاز", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  ensureSportsCity(s).facilities = ["statues"];
  s.fanSupport = 50;
  settleCityMonth(s);
  assert.ok(s.fanSupport > 50);
});

test("الرابط 5 (dyn): الزواج يخصم تكلفة الفرح من الخزينة (العائلة ← المالية)", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  s.dynasty = migrateDynasty(s);
  s.dynasty.owner.age = 40;
  s.finance.cash = 50_000_000;
  const before = s.finance.cash;
  marryOwner(s, "Lina", { tier: "luxury" });
  assert.equal(s.finance.cash, before - 3_000_000);
});

test("الرابط 6 (dyn): الطلاق ينصف النقد ويخفض صورة العائلة", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  s.dynasty = migrateDynasty(s);
  s.dynasty.owner.age = 40;
  s.finance.cash = 50_000_000;
  marryOwner(s, "Lina", { tier: "family" });
  const cash = s.finance.cash;
  const image = s.dynasty.publicBalance;
  divorceOwner(s);
  assert.ok(s.finance.cash <= Math.ceil(cash / 2));
  assert.ok(s.dynasty.publicBalance < image);
});

// ── wire: الاستدعاء موصول في المصدر ─────────────────────────────
test("الرابط 7 (wire): جوائز الشهر تمنح لاعب الشهر +4 معنويات وتفتح مطلب الجائزة", () => {
  wired("services/awards.js", /p\.morale = clamp\(\(p\.morale \|\| 60\) \+ 4/);
  wired("services/awards.js", /spawnAwardDemand\(s, winners\.player/);
});

test("الرابط 8 (wire): ربح المتجر الإلكتروني يدخل الثروة الشخصية", () => {
  wired("services/betting/day.js", /personalIncome\(s, profit\)/);
});

test("الرابط 9 (wire): الامتثال يحدّث سمعة شركة المراهنات", () => {
  wired("services/betting/compliance.js", /b\.reputation = clamp\(b\.reputation/);
});

test("الرابط 10 (wire): تداول الأسهم يدخل الثروة الشخصية", () => {
  wired("services/stockMarket/trading.js", /personalIncome|personalExpense/);
});

test("الرابط 11 (wire): تقدم الإنجاب والتربية في العائلة يصل للمحرك اليومي", () => {
  wired("services/time.js", /dynastyLifeDay\(s\)/);
  wired("services/time.js", /dynastyGrowthDay\(s\)/);
});

test("الرابط 12 (wire): حدث العائلة يعدّل سعادة الشريك", () => {
  wired("services/dynastyEvents.js", /spouseHappiness/);
});
