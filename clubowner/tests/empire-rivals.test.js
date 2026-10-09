// اختبارات المنافس الملياردير 0.29 — التوليد الحتمي، النمو الشهري،
// الترتيب المتحرك، والسباق الشهري بمكافآته.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { RIVAL_POOL, RACE_TYPES, RIVAL_WEALTH_MIN, RIVAL_WEALTH_MAX } from "../src/data/empireRivals.js";
import {
  ensureRivals,
  leaderboard,
  billionaireRank,
  currentRace,
  playerRaceScore,
} from "../src/services/empire/rivals.js";
import { buyAsset } from "../src/services/empire/assets.js";
import { empireDay } from "../src/services/empire/day.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ownerStory: "heir", ...opts });
  validateSave(s);
  return s;
};

test("التوليد: ٧ منافسين من المجموع بثروات ضمن النطاق وحتمية البذرة", () => {
  const s = game();
  const list = ensureRivals(s);
  assert.equal(list.length, 7);
  assert.equal(RIVAL_POOL.length, 7);
  for (const r of list) {
    assert.ok(r.wealth >= RIVAL_WEALTH_MIN && r.wealth <= RIVAL_WEALTH_MAX);
    assert.ok(r.growthPct >= 0.5 && r.growthPct <= 2.5);
    assert.ok(r.nameAr && r.nameEn && r.nameFr);
  }
  // نفس البذرة = نفس المنافسين.
  const t = game();
  assert.deepEqual(ensureRivals(t), list);
  // الاستدعاء الثاني لا يولّد من جديد.
  assert.equal(ensureRivals(s), list);
});

test("النمو الشهري: ثروات المنافسين تكبر", () => {
  const s = game();
  const before = ensureRivals(s).map((r) => r.wealth);
  s.date = "2026-08-01";
  empireDay(s);
  const after = ensureRivals(s).map((r) => r.wealth);
  const grew = after.filter((w, i) => w > before[i]).length;
  assert.ok(grew >= 5, `نما ${grew} من ٧ منافسين`);
});

test("الترتيب: لوحة مرتبة تنازليًا تشملك، والترتيب = من هم فوقك + ١", () => {
  const s = game();
  s.empire.personal = 500_000_000;
  const rows = leaderboard(s);
  assert.equal(rows.length, 8);
  for (let i = 1; i < rows.length; i++)
    assert.ok(rows[i - 1].wealth >= rows[i].wealth, "مرتبة تنازليًا");
  const you = rows.find((r) => r.you);
  assert.ok(you, "أنت في اللوحة");
  assert.equal(billionaireRank(s), rows.findIndex((r) => r.you) + 1);
});

test("السباق يدور مع الشهور ويقيس مقتنيات اللاعب", () => {
  const s = game();
  const races = new Set();
  for (let i = 0; i < 6; i++) {
    s.date = `2026-${String(i + 7).padStart(2, "0")}-15`;
    races.add(currentRace(s).id);
  }
  assert.ok(races.size >= 6, "السباق يتغير شهريًا");
  // نقاط اللاعب من الأصول.
  s.empire.personal = 1_000_000_000;
  buyAsset(s, "yacht-mega");
  assert.equal(playerRaceScore(s, "yacht"), 350_000_000);
  assert.equal(playerRaceScore(s, "car"), 0);
});

test("الفوز بالسباق يرفع البرستيج والشهرة ويُسجل", () => {
  const s = game();
  s.empire.personal = 1_000_000_000;
  buyAsset(s, "home-island"); // أغلى سكن — أعلى من نقاط أي منافس تقريبًا
  const prestige = s.empire.prestige;
  const fame = s.empire.fame;
  // نبحث عن شهر سباقه «سكن».
  for (let m = 1; m <= 12; m++) {
    s.date = `2026-${String(m).padStart(2, "0")}-01`;
    if (currentRace(s).id === "home") break;
  }
  assert.equal(currentRace(s).id, "home");
  empireDay(s);
  const rec = s.empire.rivals.history[0];
  assert.ok(rec, "السباق سُجل");
  assert.equal(rec.race, "home");
  assert.equal(rec.won, true);
  assert.ok(s.empire.prestige >= prestige + 10);
  assert.ok(s.empire.fame >= fame + 5);
  validateSave(s);
});

test("الخسارة تُسجل باسم الفائز بلا مكافأة", () => {
  const s = game({ ownerStory: "gambler" });
  // لا مقتنيات: نقاط اللاعب صفر في سباق اليخوت.
  for (let m = 1; m <= 12; m++) {
    s.date = `2026-${String(m).padStart(2, "0")}-01`;
    if (currentRace(s).id === "yacht") break;
  }
  const prestige = s.empire.prestige;
  empireDay(s);
  const rec = s.empire.rivals.history[0];
  assert.equal(rec.won, false);
  assert.ok(rec.winnerName, "اسم الفائز المنافس");
  assert.equal(s.empire.prestige, prestige);
});

test("الترتيب الشهري يغذي تقرير حياتك", () => {
  const s = game();
  s.date = "2026-08-01";
  empireDay(s);
  assert.equal(typeof s.empire.rankThisMonth, "number");
  assert.equal(s.empire.reports[0].rank, s.empire.rankThisMonth);
});

test("سجل السباقات محدود بأربعة وعشرين", () => {
  const s = game();
  for (let i = 0; i < 30; i++) {
    s.date = `${2026 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}-01`;
    empireDay(s);
  }
  assert.ok(s.empire.rivals.history.length <= 24);
  validateSave(s);
});
