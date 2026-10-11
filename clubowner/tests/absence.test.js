// الدفعة 6 — القسم 2: «ماذا فاتك؟» — ملخص من سجل الحفظ فقط، لا يظهر قبل 7 أيام، ولا يخترع شيئًا.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import { absenceReport, markAbsenceSeen, ABSENCE_MIN_DAYS } from "../src/services/absence.js";
import { absenceBanner } from "../src/features/absence.js";
import { message } from "../src/services/inbox.js";

const base = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  s.date = "2026-07-01";
  markAbsenceSeen(s);
  return s;
};

test("لا ملخص قبل مرور 7 أيام، ويظهر بعدها", () => {
  const s = base();
  s.date = "2026-07-07";
  assert.equal(absenceReport(s), null, "6 أيام: لا شيء");
  s.date = "2026-07-08";
  const r = absenceReport(s);
  assert.ok(r, "7 أيام: الملخص يظهر");
  assert.equal(r.days, ABSENCE_MIN_DAYS);
});

test("النتائج: مباريات النادي المخوضة داخل الفترة فقط، بأهدافها الفعلية", () => {
  const s = base();
  s.fixtures = [
    { id: "a", date: "2026-07-03", home: s.clubId, away: "ceramica", played: true, homeGoals: 2, awayGoals: 1 },
    { id: "b", date: "2026-07-05", home: "ceramica", away: s.clubId, played: true, homeGoals: 0, awayGoals: 0 },
    { id: "c", date: "2026-07-04", home: "ceramica", away: "ismaily", played: true, homeGoals: 3, awayGoals: 3 },
    { id: "d", date: "2026-07-06", home: s.clubId, away: "ismaily", played: false },
  ];
  s.date = "2026-07-10";
  const r = absenceReport(s);
  assert.equal(r.results.count, 2, "مباراتان للنادي فقط، وغير المخوضة تُستبعد");
  assert.deepEqual(r.results.items.map((f) => f.id), ["b", "a"], "الأحدث أولًا");
});

test("الكبرى والمعلّق من البريد وقرارات الحفظ دون اختراع", () => {
  const s = base();
  s.inbox = [];
  s.date = "2026-07-03";
  message(s, { title: "قرار كبير", body: "x", required: true, kind: "decision" });
  message(s, { title: "خبر عادي", body: "y", priority: "normal" });
  s.date = "2026-07-12";
  const r = absenceReport(s);
  assert.equal(r.major.count, 1);
  assert.equal(r.major.items[0].title, "قرار كبير");
  assert.equal(r.pending.count, 1);
});

test("الإطلاع يعيد العدّ: لا ملخص بعد «تم الاطلاع» حتى غياب جديد", () => {
  const s = base();
  s.date = "2026-07-10";
  assert.ok(absenceReport(s));
  markAbsenceSeen(s);
  assert.equal(absenceReport(s), null);
  s.date = "2026-07-17";
  assert.ok(absenceReport(s));
});

test("البطاقة فارغة عند عدم وجود ما يُذكر، وتعرض زر الإطلاع بثلاث لغات", () => {
  const s = base();
  s.date = "2026-07-10";
  s.inbox = [];
  s.fixtures = [];
  assert.equal(absenceBanner(s), "", "لا بطاقة بلا محتوى");
  message(s, { title: "قرار كبير", body: "x", required: true });
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const html = absenceBanner(s);
    assert.ok(html.includes('data-action="absence-seen"'), lang);
    assert.ok(html.includes("info-toggle"), lang);
    assert.equal(/[\u0660-\u0669]/.test(html), false, lang);
  }
  setLanguage("ar");
});
