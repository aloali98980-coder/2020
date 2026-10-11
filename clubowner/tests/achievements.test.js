// الدفعة 6 — القسم 1: الإنجازات (30+ عبر المراتب، قابلة للتحقيق، فتح مرة واحدة، تقدم %).
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import { ACHIEVEMENTS, ACHIEVEMENT_FAMILIES, ACHIEVEMENT_TIERS } from "../src/data/achievements.js";
import {
  ensureAchievements,
  refreshAchievements,
  achievementList,
  achievementProgress,
  METRICS,
} from "../src/services/achievements.js";
import { achievementsView } from "../src/features/achievements.js";

const fresh = () => createGame({ database: "demo", leagues: ["eg"] });

test("30+ إنجاز: 10 عائلات × 4 مراتب، معرّفات فريدة، أهداف تصاعدية", () => {
  assert.ok(ACHIEVEMENTS.length >= 30, `count ${ACHIEVEMENTS.length}`);
  assert.equal(ACHIEVEMENTS.length, ACHIEVEMENT_FAMILIES.length * ACHIEVEMENT_TIERS.length);
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
  for (const fam of ACHIEVEMENT_FAMILIES) {
    const targets = fam.targets;
    assert.equal(targets.length, 4, fam.id);
    for (let i = 1; i < 4; i++) assert.ok(targets[i] > targets[i - 1], `${fam.id} ascending`);
    for (const ach of ACHIEVEMENTS.filter((a) => a.family === fam.id))
      assert.equal(ach.target, targets[ACHIEVEMENT_TIERS.indexOf(ach.tier)]);
  }
});

test("كل إنجاز قابل للتحقيق: أعلى هدف ≤ السقف الموثّق للعائلة", () => {
  for (const fam of ACHIEVEMENT_FAMILIES) {
    assert.ok(Math.max(...fam.targets) <= fam.ceiling, `${fam.id}: ${Math.max(...fam.targets)} > ${fam.ceiling}`);
  }
});

test("لا إنجاز مفتوح عند بداية جديدة، والتقدم أعداد صحيحة 0–100", () => {
  const s = fresh();
  assert.deepEqual(refreshAchievements(s), []);
  for (const row of achievementList(s)) {
    assert.equal(row.unlocked, false, row.id);
    assert.ok(Number.isInteger(row.progress) && row.progress >= 0 && row.progress <= 100, row.id);
  }
});

test("الفتح مرة واحدة فقط مع إشعار في البريد", () => {
  const s = fresh();
  s.achievements = undefined;
  ensureAchievements(s); // خط الأساس = 75M
  s.finance.cash = 85_000_000; // نمو 10M
  const before = s.inbox.length;
  const opened = refreshAchievements(s);
  assert.ok(opened.includes("cash-bronze"));
  assert.equal(s.inbox.length, before + opened.length);
  assert.equal(s.inbox[0].title, "إنجاز مفتوح");
  assert.equal(s.achievements.unlocked["cash-bronze"].date, s.date);
  const again = refreshAchievements(s);
  assert.equal(again.includes("cash-bronze"), false);
  assert.equal(s.inbox.length, before + opened.length, "لا تكرار للإشعار");
});

test("الذروة لا تنخفض: الخزينة تُسجَّل كأعلى رصيد بلغته", () => {
  const s = fresh();
  s.achievements = undefined;
  ensureAchievements(s); // الأساس 75M
  s.finance.cash = 125_000_000;
  refreshAchievements(s);
  s.finance.cash = 1_000;
  refreshAchievements(s);
  assert.equal(ensureAchievements(s).peaks.cash, 125_000_000);
  assert.equal(METRICS.cash(s), 50_000_000, "النمو فوق البداية، بأعلى قيمة لا بالقيمة الحالية");
});

test("حفظ قديم بلا حقل الإنجازات يُرقّى دون فقد البيانات", () => {
  const s = fresh();
  delete s.achievements;
  const a = ensureAchievements(s);
  assert.equal(a.schema, 1);
  assert.deepEqual(a.unlocked, {});
});

test("التقدم النسبي: نصف الهدف = 50%، ويتوقف عند 100", () => {
  const s = fresh();
  const ach = ACHIEVEMENTS.find((a) => a.id === "fans-bronze");
  s.achievements = undefined;
  const base = ensureAchievements(s).base.fans;
  ensureAchievements(s).peaks.fans = base + ach.target / 2;
  assert.equal(achievementProgress(s, ach), 50);
  ensureAchievements(s).peaks.fans = base + ach.target * 3;
  assert.equal(achievementProgress(s, ach), 100);
});

test("لا إنجاز مفتوح من لحظة البداية في أي عائلة", () => {
  const s = fresh();
  assert.deepEqual(refreshAchievements(s), []);
});

test("المنشآت: الحالة الأولى أقل من أدنى مرتبة (ليست مفتوحة من البداية)", () => {
  const s = fresh();
  const facilitiesBronze = ACHIEVEMENTS.find((a) => a.id === "facilities-bronze");
  assert.ok(METRICS.facilities(s) < facilitiesBronze.target);
});

test("الشاشة بثلاث لغات: أرقام لاتينية فقط، وفيها ⓘ لكل عائلة", () => {
  const s = fresh();
  s.finance.cash = 150_000_000;
  refreshAchievements(s);
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const html = achievementsView(s);
    assert.ok(html.includes("info-toggle"), lang);
    assert.equal(/[\u0660-\u0669]/.test(html), false, `Arabic-Indic digits in ${lang}`);
    assert.ok(html.includes("achievement-bar"), lang);
  }
  setLanguage("ar");
});
