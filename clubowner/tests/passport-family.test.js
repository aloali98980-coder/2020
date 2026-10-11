// الدفعة 5 — القسم 1: الجواز والعائلة (لا أنظمة جديدة).
// الفرح بمستويات، الزواج الثاني، سجل الشريك، الطلاق الأساسي، التذكيرات، وأحداث العائلة.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import {
  migrateDynasty,
  marryOwner,
  divorceOwner,
  spouseCalendarDay,
  createDynastyChild,
  WEDDING_TIERS,
} from "../src/services/dynasty.js";
import { dynastyView } from "../src/features/dynasty.js";
import { DYNASTY_EVENTS } from "../src/data/dynastyEvents.js";

setLanguage("ar");

const fresh = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  s.dynasty = migrateDynasty(s);
  s.dynasty.owner.age = 40;
  s.finance.cash = 50_000_000;
  return s;
};

test("الفرح بثلاثة مستويات، ويخصم تكلفته من النقد مرة واحدة", () => {
  for (const tier of Object.keys(WEDDING_TIERS)) {
    const s = fresh();
    const before = s.finance.cash;
    marryOwner(s, "Lina", { tier, title: "طبيبة" });
    assert.equal(s.finance.cash, before - WEDDING_TIERS[tier].cost, tier);
    assert.equal(s.dynasty.spouseProfile.tier, tier);
    assert.equal(s.dynasty.spouseProfile.title, "طبيبة");
    assert.ok(s.dynasty.spouseProfile.happiness > 50);
  }
});

test("مستوى فرح غير معروف أو رصيد لا يكفي يُرفضان", () => {
  const s = fresh();
  assert.throws(() => marryOwner(s, "Lina", { tier: "imaginary" }), /مستوى الفرح/);
  s.finance.cash = 1000;
  assert.throws(() => marryOwner(s, "Lina", { tier: "legendary" }), /الرصيد لا يكفي/);
  assert.equal(s.dynasty.spouse, null);
});

test("الزواج الثاني بعد طلاق يُعرف بعدد الزيجات، والطلاق يُنصف النقد ويؤثر على الصورة", () => {
  const s = fresh();
  marryOwner(s, "Lina", { tier: "family" });
  assert.equal(s.dynasty.spouseProfile.secondMarriage, false);
  const cashBefore = s.finance.cash;
  const balanceBefore = s.dynasty.publicBalance;
  divorceOwner(s);
  assert.equal(s.dynasty.spouse, null);
  assert.equal(s.dynasty.spouseProfile, null);
  assert.equal(s.dynasty.divorces, 1);
  assert.equal(s.finance.cash, Math.ceil(cashBefore / 2), "نصف النقد تسوية");
  assert.ok(s.dynasty.publicBalance < balanceBefore, "فضيحة تخفض الصورة");
  marryOwner(s, "Mona", { tier: "family" });
  assert.equal(s.dynasty.spouseProfile.secondMarriage, true, "زواج ثانٍ");
});

test("الطلاق بلا زواج قائم يُرفض", () => {
  assert.throws(() => divorceOwner(fresh()), /لا يوجد زواج قائم/);
});

test("ذكرى الزواج تُسجَّل في البريد مرة واحدة في السنة", () => {
  const s = fresh();
  marryOwner(s, "Lina", { tier: "family" });
  s.dynasty.spouseProfile.weddingDate = "2020-10-11";
  s.date = "2026-10-11";
  const inboxBefore = s.inbox.length;
  assert.equal(spouseCalendarDay(s), "anniversary");
  assert.equal(s.inbox.length, inboxBefore + 1);
  assert.equal(spouseCalendarDay(s), null, "لا تكرار في اليوم نفسه");
});

test("عيد ميلاد الشريك يظهر في البريد", () => {
  const s = fresh();
  marryOwner(s, "Lina", { tier: "family" });
  s.dynasty.spouseProfile.birthday = "1990-03-05";
  s.date = "2026-03-05";
  assert.equal(spouseCalendarDay(s), "birthday");
});

test("لوحة الشريك تُعرض مع الطلاق، وحقل الجنس يظهر على بطاقة الابنة", () => {
  const s = fresh();
  marryOwner(s, "Lina", { tier: "luxury", title: "مهندسة" });
  const daughter = createDynastyChild(s, { name: "Nour", age: 9, gender: "female" });
  s.dynasty.children.push(daughter);
  const html = dynastyView(s);
  assert.ok(html.includes("dynasty-spouse"), "لوحة الشريك موجودة");
  assert.ok(html.includes('data-action="dynasty-divorce"'), "زر الطلاق موجود");
  assert.ok(html.includes("مهندسة"), "صفة الشريك");
  assert.ok(html.includes("ابنة"), "بطاقة الابنة تحمل الجنس");
  assert.ok(!/undefined|NaN/.test(html));
});

test("أحداث العائلة الجديدة: خمسة أحداث بثلاث لغات وخياران لكل حدث", () => {
  const ids = ["spouse-demand", "anniversary-festivity", "spouse-public-role", "teen-first-job", "family-reunion"];
  for (const id of ids) {
    const ev = DYNASTY_EVENTS.find((e) => e.id === id);
    assert.ok(ev, id);
    for (const key of ["ar", "en", "fr"]) {
      assert.ok(ev.title[key] && ev.body[key], `${id} ${key}`);
    }
    assert.equal(ev.choices.length, 2, id);
    for (const c of ev.choices) for (const key of ["ar", "en", "fr"]) assert.ok(c.label[key], `${id} choice ${key}`);
  }
});
