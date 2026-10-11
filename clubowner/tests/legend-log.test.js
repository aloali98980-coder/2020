// الدفعة 6 — القسم 3: سجل الأسطورة (بطولات + قرارات كبرى + قياسات + نقاط إرث + سيرة المالك).
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import { seasonDay } from "../src/services/season.js";
import { calculateLegacyScore } from "../src/services/dynasty.js";
import {
  titleSeasons,
  majorDecisions,
  clubRecords,
  ownerBio,
  legendLog,
  MAJOR_DECISION_FEE,
} from "../src/services/legendLog.js";
import { legendLogView } from "../src/features/legendLog.js";

const fresh = () => createGame({ database: "demo", leagues: ["eg"] });
const row = (clubId, extra = {}) => ({ clubId, played: 14, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0, ...extra });

test("البطولات: المواسم التي كان فيها النادي في المركز الأول فقط", () => {
  const s = fresh();
  s.seasonHistory = [
    { number: 1, date: "2027-06-30", table: [row(s.clubId, { points: 40 }), row("x")] },
    { number: 2, date: "2028-06-30", table: [row("x", { points: 50 }), row(s.clubId, { points: 30 })] },
    { number: 3, date: "2029-06-30", table: [row(s.clubId, { points: 44 }), row("x")] },
  ];
  assert.deepEqual(titleSeasons(s).map((t) => t.number), [1, 3]);
});

test("القرارات الكبرى: صفقات ≥ 20M فقط، وليس المصروفات الأخرى", () => {
  const s = fresh();
  s.finance.ledger = [
    { date: "2026-08-01", amount: -MAJOR_DECISION_FEE, category: "transfer", description: "صفقة كبرى" },
    { date: "2026-08-02", amount: -19_000_000, category: "transfer", description: "صفقة أصغر" },
    { date: "2026-08-03", amount: -30_000_000, category: "wages", description: "مرتبات" },
    { date: "2026-08-04", amount: 25_000_000, category: "transfer", description: "بيع (دخل)" },
  ];
  const d = majorDecisions(s);
  assert.equal(d.length, 1);
  assert.equal(d[0].amount, MAJOR_DECISION_FEE);
});

test("القياسات: أفضل موسم للنادي في النقاط والأهداف والانتصارات", () => {
  const s = fresh();
  s.seasonHistory = [
    { number: 1, date: "d1", table: [row(s.clubId, { points: 40, gf: 30, wins: 12 })] },
    { number: 2, date: "d2", table: [row(s.clubId, { points: 55, gf: 20, wins: 9 })] },
  ];
  const r = clubRecords(s);
  assert.deepEqual([r.points.season, r.points.value], [2, 55]);
  assert.deepEqual([r.goals.season, r.goals.value], [1, 30]);
  assert.deepEqual([r.wins.season, r.wins.value], [1, 12]);
  assert.equal(clubRecords(fresh()), null, "لا قياسات قبل أي موسم مؤرشف");
});

test("نقاط الإرث تأتي من النظام القائم، والبطولة تزيدها عند نهاية الموسم", () => {
  const s = fresh();
  const before = calculateLegacyScore(s);
  s.fixtures.forEach((f) => (f.played = true));
  s.nextSeasonDate = s.date;
  s.table.forEach((r) => (r.clubId === s.clubId ? (r.points = 99) : null));
  s.table.sort((a, b) => b.points - a.points);
  const titlesBefore = s.dynasty.titlesWon;
  seasonDay(s);
  assert.equal(s.seasonHistory.length, 1);
  assert.equal(s.dynasty.titlesWon, titlesBefore + 1, "بطولة مسجلة في الإرث");
  assert.ok(calculateLegacyScore(s) > before, "نقاط الإرث ترتفع بالبطولة");
  assert.equal(legendLog(s).legacyScore, calculateLegacyScore(s));
});

test("سيرة المالك من بيانات الإرث", () => {
  const s = fresh();
  const bio = ownerBio(s);
  assert.equal(bio.name, s.dynasty.owner.name);
  assert.equal(bio.generation, 1);
  assert.equal(bio.children, 0);
});

test("الشاشة بثلاث لغات: أرقام لاتينية، ومعلومات خلف ⓘ", () => {
  const s = fresh();
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const html = legendLogView(s);
    assert.ok(html.includes("info-toggle"), lang);
    assert.equal(/[\u0660-\u0669]/.test(html), false, lang);
  }
  setLanguage("ar");
});
