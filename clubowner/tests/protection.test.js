// الدفعة 6 — القسم 5: الحماية (تأكيدات لا رجعة فيها + وضع إجازة يمنع الكبرى ويعيد تقرير العودة).
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import {
  irreversibleWarning,
  startVacation,
  endVacation,
  assertVacationAllows,
  vacationActive,
  isStar,
  STAR_RATING,
  IRREVERSIBLE_FEE,
  MAJOR_FEE,
} from "../src/services/protection.js";
import { acceptClub } from "../src/services/transfers.js";
import { irreversibleModal, vacationCard, vacationReturnModal } from "../src/features/protection.js";
import { settingsView } from "../src/features/settings.js";
import { message } from "../src/services/inbox.js";

const fresh = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  s.date = "2026-07-01";
  cursor = 0;
  return s;
};
// يختار لاعبًا مختلفًا في كل استدعاء حتى لا تتداخل التقييمات.
let cursor = 0;
const pick = (s, rating) => {
  const others = s.players.filter((x) => x.clubId !== s.clubId);
  const p = others[cursor++ % others.length];
  p.rating = rating;
  return p;
};

test("التحذير: نجم أو مبلغ ≥ 5M فقط؛ غير ذلك لا تأكيد", () => {
  const s = fresh();
  const star = pick(s, STAR_RATING + 5);
  assert.equal(isStar(star), true);
  assert.equal(irreversibleWarning(s, { player: star, fee: 0 }).star, true);
  assert.equal(irreversibleWarning(s, { fee: IRREVERSIBLE_FEE }).big, true);
  const small = pick(s, 60);
  assert.equal(irreversibleWarning(s, { player: small, fee: IRREVERSIBLE_FEE - 1 }), null);
});

test("وضع الإجازة: يمنع النجوم والصفقات الكبرى، ويسمح بالروتين", () => {
  const s = fresh();
  startVacation(s);
  assert.equal(vacationActive(s), true);
  assert.throws(() => assertVacationAllows(s, { player: pick(s, 90) }), /النجوم/);
  assert.throws(() => assertVacationAllows(s, { player: pick(s, 60), fee: MAJOR_FEE }), /الكبرى/);
  assert.doesNotThrow(() => assertVacationAllows(s, { player: pick(s, 60), fee: MAJOR_FEE - 1 }));
});

test("القبول بصفقة كبيرة أو نجم يُرفض أثناء الإجازة، والصفقة الصغيرة تمضي", () => {
  const s = fresh();
  const star = pick(s, 90);
  s.negotiations.push({ id: "n-star", stage: "club-reply", playerId: star.id, counter: 3_000_000, seller: star.clubId });
  const small = pick(s, 60);
  s.negotiations.push({ id: "n-small", stage: "club-reply", playerId: small.id, counter: 2_000_000, seller: small.clubId });
  startVacation(s);
  assert.throws(() => acceptClub(s, "n-star"), /النجوم/);
  acceptClub(s, "n-small");
  assert.equal(s.negotiations.find((n) => n.id === "n-small").stage, "personal");
});

test("إنهاء الإجازة يعيد تقرير ما فاتك منذ بدايتها ويعطّلها", () => {
  const s = fresh();
  startVacation(s);
  s.date = "2026-07-20";
  s.fixtures = [
    { id: "f1", date: "2026-07-05", home: s.clubId, away: "ceramica", played: true, homeGoals: 1, awayGoals: 0 },
    { id: "f0", date: "2026-06-20", home: s.clubId, away: "ceramica", played: true, homeGoals: 9, awayGoals: 9 },
  ];
  message(s, { title: "قرار كبير", body: "x", required: true });
  const out = endVacation(s);
  assert.equal(vacationActive(s), false);
  assert.equal(out.startedOn, "2026-07-01");
  assert.equal(out.report.results.count, 1, "المباراة قبل البدء لا تُحسب");
  assert.equal(out.report.pending.count, 1);
  assert.throws(() => endVacation(s), /غير مفعّل/);
});

test("واجهة: تأكيد يحمل الأكشن و data-confirmed، وبطاقة الإجازة في الإعدادات", () => {
  const s = fresh();
  const star = pick(s, 90);
  const html = irreversibleModal({ title: "t", warning: irreversibleWarning(s, { player: star, fee: 0 }), action: "accept-club", id: "n1" });
  assert.ok(html.includes('data-action="accept-club"') && html.includes('data-confirmed="1"'));
  assert.ok(settingsView(s).includes('data-action="vacation-start"'));
  startVacation(s);
  assert.ok(vacationCard(s).includes('data-action="vacation-end"'));
});

test("الواجهة بثلاث لغات دون أرقام هندية", () => {
  const s = fresh();
  startVacation(s);
  const out = endVacation(s);
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    for (const html of [vacationReturnModal(out), vacationCard(s), settingsView(s)])
      assert.equal(/[\u0660-\u0669]/.test(html), false, lang);
  }
  setLanguage("ar");
});
