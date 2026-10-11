// الدفعة 7 — القسم 3: تقديم اللاعب. فحص طبي قد يفشل، رقم قميص فريد، وأول الكلمات.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { DIVISIONS } from "../src/data/expandedCatalog.js";
import { post } from "../src/services/finance.js";
import { addDays } from "../src/core/utils.js";
import { submitOffer, transferReply, acceptClub, signPlayer } from "../src/services/transfers.js";
import {
  medicalResult,
  medicalFailChance,
  assignShirtNumber,
  firstWordsIndex,
  FIRST_WORDS,
  FIRST_WORDS_COUNT,
} from "../src/services/presentation.js";
import { validateSave } from "../src/core/validation.js";

const game = () => {
  const s = createGame({ database: "world", expanded: true, clubId: "ahly", leagues: ["eg"], difficulty: "easy" });
  post(s, 100000000 - s.finance.cash, "test-funding", "Test funding", "test-funding");
  return s;
};

test("1) الفحص الطبي قد يفشل: كلا النتيجتين تظهر عبر عدد كبير من اللاعبين، وهو حتمي", () => {
  const s = game();
  const players = Array.from({ length: 400 }, (_, i) => ({ id: `p${i}`, age: 18 + (i % 20), injuryUntil: null }));
  const fails = players.filter((p) => !medicalResult(s, p).pass).length;
  assert.ok(fails > 0 && fails < players.length, `الرسوب ${fails}`);
  const again = players.filter((p) => !medicalResult(s, p).pass).length;
  assert.equal(again, fails, "النتيجة حتمية");
});

test("2) احتمال الرسوب يرتفع مع العمر والإصابة الحالية، ولا يتجاوز 40%", () => {
  const s = game();
  const young = { id: "y", age: 22, injuryUntil: null };
  const old = { id: "o", age: 36, injuryUntil: s.date };
  assert.ok(medicalFailChance(s, old) > medicalFailChance(s, young));
  assert.ok(medicalFailChance(s, old) <= 40);
});

test("3) رقم القميص فريد داخل النادي، ويحترم الرقم السابق، والحارس يأخذ 1 إن كان متاحًا", () => {
  const s = game();
  const squad = s.players.filter((p) => p.clubId === s.clubId && p.status !== "retired");
  for (const p of squad) delete p.shirtNumber;
  for (const p of squad) assignShirtNumber(s, p);
  const nums = squad.map((p) => p.shirtNumber);
  assert.equal(new Set(nums).size, nums.length, "أرقام مكررة");
  assert.ok(nums.every((n) => Number.isInteger(n) && n >= 1 && n <= 99));
  const newcomer = { id: "new", clubId: s.clubId, position: "GK", previousShirt: 9999 };
  s.players.push(newcomer);
  for (const p of squad) if (p.shirtNumber === 1) p.shirtNumber = 50;
  assert.equal(assignShirtNumber(s, newcomer), 1);
  const prev = { id: "prev", clubId: s.clubId, position: "CM", previousShirt: 77 };
  s.players.push(prev);
  assert.equal(assignShirtNumber(s, prev), 77);
});

test("4) الكلمات الأولى من بنك ثابت، والفهرس داخل حدوده", () => {
  const s = game();
  assert.equal(FIRST_WORDS.length, FIRST_WORDS_COUNT);
  for (const p of s.players.slice(0, 50)) {
    const i = firstWordsIndex(s, p);
    assert.ok(i >= 0 && i < FIRST_WORDS_COUNT);
  }
});

test("5) التوقيع: الفشل الطبي لا يخصم مالًا ولا يُسجّل اللاعب، والنجاح يسنِد الرقم والكلمات", async () => {
  const s0 = game();
  // لاعب أكبر سنًا: احتمال الرسوب أعلى، فيظهر الفشل خلال الأيام القليلة.
  const p = s0.players
    .filter((x) => x.clubId !== s0.clubId && x.position === "CM" && x.status !== "retired" && !x.loan)
    .sort((a, b) => b.age - a.age)[0];
  assert.ok(p, "لاعب متاح");
  const seller = p.clubId;
  const outcomes = { pass: 0, fail: 0 };
  for (let day = 1; day <= 40 && (outcomes.pass < 1 || outcomes.fail < 1); day++) {
    const s = structuredClone(s0);
    s.date = addDays("2026-07-20", day); // داخل نافذة يوليو–سبتمبر
    const n = submitOffer(s, p.id, { fee: p.value, upfrontPercent: 40 });
    transferReply(s, n.id);
    acceptClub(s, n.id);
    const cashBefore = s.finance.cash;
    const r = signPlayer(s, n.id, { salary: p.salary, bonus: 0, years: 3, role: "مداورة" });
    const pl = s.players.find((x) => x.id === p.id);
    if (r?.medical === "fail") {
      outcomes.fail++;
      assert.equal(pl.clubId, seller, "لا انتقال بعد الفشل");
      assert.equal(s.finance.cash, cashBefore, "لا خصم بعد الفشل");
      assert.equal(s.negotiations.find((x) => x.id === n.id).stage, "rejected");
      assert.ok(s.inbox.some((m) => m.title.startsWith("فشل الفحص الطبي")));
    } else {
      outcomes.pass++;
      assert.equal(pl.clubId, s.clubId);
      assert.ok(Number.isInteger(pl.shirtNumber));
      assert.ok(Number.isInteger(pl.firstWordsIndex));
      assert.ok(s.inbox.some((m) => m.body.includes("نتيجة الفحص الطبي: سليم")));
    }
    validateSave(s);
  }
  assert.ok(outcomes.pass >= 1 && outcomes.fail >= 1, JSON.stringify(outcomes));
});
