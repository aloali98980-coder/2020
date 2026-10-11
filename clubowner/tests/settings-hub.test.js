// الدفعة 6 — القسم 6: الإعدادات الشاملة — الإشعارات تُحفظ مع الحفظ وتُطبَّق فعلًا.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import { NOTIFY_KEYS, notifyEnabled, setNotify } from "../src/services/settingsHub.js";
import { refreshAchievements, ensureAchievements } from "../src/services/achievements.js";
import { absenceBanner } from "../src/features/absence.js";
import { markAbsenceSeen } from "../src/services/absence.js";
import { message } from "../src/services/inbox.js";
import { settingsView } from "../src/features/settings.js";

const fresh = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  s.date = "2026-07-01";
  return s;
};

test("الغائب = مفعّل، والحفظات القديمة لا تفقد شيئًا", () => {
  const s = fresh();
  for (const k of NOTIFY_KEYS) assert.equal(notifyEnabled(s, k), true);
});

test("setNotify يحفظ القيمة، ويرفض مفتاحًا غير معروف", () => {
  const s = fresh();
  setNotify(s, "achievements", false);
  assert.equal(s.preferences.notify.achievements, false);
  assert.equal(notifyEnabled(s, "achievements"), false);
  assert.throws(() => setNotify(s, "spam", true), /غير معروف/);
});

test("إيقاف إشعار الإنجازات يمنع الرسالة لكن يُبقي الفتح محفوظًا", () => {
  const s = fresh();
  setNotify(s, "achievements", false);
  ensureAchievements(s); // خط الأساس 75M
  s.finance.cash = 90_000_000; // نمو 15M يكفي لإنجاز برونزي
  const before = s.inbox.length;
  const opened = refreshAchievements(s);
  assert.ok(opened.includes("cash-bronze"));
  assert.ok(ensureAchievements(s).unlocked["cash-bronze"], "الفتح محفوظ");
  assert.equal(s.inbox.length, before, "لا رسالة");
});

test("إيقاف ملخص الغياب يخفي البطاقة دون حذف التقرير", () => {
  const s = fresh();
  markAbsenceSeen(s);
  s.date = "2026-07-12";
  message(s, { title: "قرار كبير", body: "x", required: true });
  assert.notEqual(absenceBanner(s), "");
  setNotify(s, "absence", false);
  assert.equal(absenceBanner(s), "");
});

test("صفحة الإعدادات تعرض مفاتيح الإشعارات بثلاث لغات دون أرقام هندية", () => {
  const s = fresh();
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const html = settingsView(s);
    assert.ok(html.includes('id="notify-achievements"'), lang);
    assert.ok(html.includes('id="notify-absence"'), lang);
    assert.equal(/[\u0660-\u0669]/.test(html), false, lang);
  }
  setLanguage("ar");
});
