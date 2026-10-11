// التحويلات الذكية 0.44: السقف حسب الثقة، والمبالغ المخصصة، والمشاريع المصوتة،
// وأرضية الثلاثة أشهر، والنهب وخطر الفصل، ودعم النادي الحر، والدفاتر.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { ensureEmpire } from "../src/services/empire/wealth.js";
import {
  TRUST_CAPS,
  LootWarning,
  personalCap,
  trustTier,
  drawStatus,
  takeFromClub,
  transferToClub,
  proposeProject,
  nextDrawDate,
  floorRemainingDays,
  dismissalRisk,
  ensureTransfers,
} from "../src/services/empire/transfers.js";
import { ensureVault } from "../src/services/vault.js";
import { post } from "../src/services/finance.js";

const game = ({ trust = 60, cash = 5_000_000_000 } = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ownerStory: "heir" });
  s.date = "2026-10-11";
  s.board.confidence = trust;
  post(s, cash - s.finance.cash, "test", "رصيد اختبار", "smart-test-funding");
  return s;
};

test("السقف يتبع ثقة الجمعية لحظة التحويل: 20M / 35M / 50M", () => {
  assert.equal(trustTier(game({ trust: 10 })), "low");
  assert.equal(personalCap(game({ trust: 10 })), TRUST_CAPS.low);
  assert.equal(personalCap(game({ trust: 50 })), TRUST_CAPS.mid);
  assert.equal(personalCap(game({ trust: 90 })), TRUST_CAPS.high);
  assert.deepEqual([TRUST_CAPS.low, TRUST_CAPS.mid, TRUST_CAPS.high], [20_000_000, 35_000_000, 50_000_000]);
});

test("مبلغ مخصص تحت السقف (17.5M) يُنفَّذ بلا نهب", () => {
  const s = game({ trust: 50 });
  const before = s.empire.personal;
  const entry = takeFromClub(s, 17_500_000);
  assert.equal(s.empire.personal, before + 17_500_000);
  assert.equal(entry.kind, "smart");
  assert.equal(s.blackFiles.suspicion, 0);
  assert.equal(validateSave(s), s);
});

test("فوق السقف: تحذير «هذا نهب!» قبل التنفيذ، ولا يتغير شيء دون تأكيد", () => {
  const s = game({ trust: 10 });
  const clubBefore = s.finance.cash;
  const personalBefore = s.empire.personal;
  assert.throws(() => takeFromClub(s, 25_000_000), (err) => err instanceof LootWarning && err.code === "loot");
  assert.equal(s.finance.cash, clubBefore);
  assert.equal(s.empire.personal, personalBefore);
  const st = drawStatus(s, 25_000_000);
  assert.ok(st.loot && st.reasons.includes("cap"));
});

test("النهب المؤكد: حرارة ترتفع، ثقة الجمعية تنخفض، ورسالتا النهب وخطر الفصل", () => {
  const s = game({ trust: 50 });
  takeFromClub(s, 40_000_000, { confirmLoot: true });
  assert.ok(s.blackFiles.suspicion > 0, "الحرارة ارتفعت");
  assert.equal(s.board.confidence, 35, "الثقة هبطت 15 نقطة");
  assert.ok(s.inbox.some((m) => m.title === "هذا نهب!"), "رسالة النهب");
  assert.ok(s.inbox.some((m) => m.kind === "dismissal-risk"), "رسالة خطر الفصل");
  assert.equal(ensureVault(s).log[0].kind, "loot");
});

test("أرضية الثلاثة أشهر: التحويل الثاني قبلها نهب، وبعدها متاح", () => {
  const s = game({ trust: 90 });
  takeFromClub(s, 5_000_000);
  assert.equal(nextDrawDate(s), "2027-01-11");
  assert.equal(floorRemainingDays(s), 92);
  s.date = "2026-12-01";
  const st = drawStatus(s, 5_000_000);
  assert.ok(st.reasons.includes("floor"));
  assert.equal(st.remainingDays, 41, "1 ديسمبر ← 11 يناير = 41 يومًا");
  assert.ok(st.reasonTexts.some((x) => x.includes("41")), "رسالة الأرضية تعرض العداد");
  s.date = "2027-01-11";
  assert.equal(floorRemainingDays(s), 0);
  assert.equal(drawStatus(s, 5_000_000).loot, false);
});

test("أرضية الثلاثة أشهر تحترم نهاية الشهر (30 نوفمبر ← 28 فبراير)", () => {
  const s = game({ trust: 90 });
  s.date = "2026-11-30";
  takeFromClub(s, 1_000_000);
  assert.equal(nextDrawDate(s), "2027-02-28");
});

test("المشروع المصوَّت عليه بالموافقة يتيح سحبًا فوق السقف مرة واحدة", () => {
  const s = game({ trust: 100 }); // احتمال القبول 100%
  const p = proposeProject(s, { title: "أكاديمية جديدة", amount: 120_000_000 });
  assert.equal(p.status, "approved");
  // الثقة 100 ⇒ السقف 50M، والمشروع يتجاوزه بموافقة المجلس
  const entry = takeFromClub(s, 120_000_000, { project: p.id });
  assert.equal(entry.kind, "project");
  assert.equal(s.board.confidence, 100, "لا نهب فلا هبوط ثقة");
  assert.throws(() => takeFromClub(s, 1_000_000, { project: p.id }), /مشروع|المشروع/);
});

test("المشروع المرفوض لا يُسحب عليه، وتجاوز مبلغه نهب", () => {
  const rejected = game({ trust: 0 }); // احتمال القبول 0%
  const p = proposeProject(rejected, { title: "ملعب", amount: 30_000_000 });
  assert.equal(p.status, "rejected");
  assert.throws(() => takeFromClub(rejected, 1_000_000, { project: p.id }));

  const s = game({ trust: 100 });
  const ok = proposeProject(s, { title: "مركز تدريب", amount: 40_000_000 });
  assert.ok(drawStatus(s, 45_000_000, { project: ok.id }).reasons.includes("project"));
});

test("خطر الفصل: يبقى بعد النهب وثقة دون 60، ويزول بعد 90 يومًا أو باستعادة الثقة", () => {
  const s = game({ trust: 50 }); // السقف المتوسط 35M
  takeFromClub(s, 40_000_000, { confirmLoot: true });
  assert.equal(dismissalRisk(s), true);
  s.board.confidence = 65;
  assert.equal(dismissalRisk(s), false, "استعادة الثقة فوق 60 تزيل الخطر");
  s.board.confidence = 40;
  s.date = "2027-01-20"; // أكثر من 90 يومًا بعد النهب
  assert.equal(dismissalRisk(s), false);
});

test("دعم النادي من الشخصي حر: لا سقف ولا أرضية ولا نهب", () => {
  const s = game({ trust: 0 });
  ensureEmpire(s).personal = 1_000_000_000;
  for (let i = 0; i < 4; i++) transferToClub(s, 100_000_000);
  assert.equal(s.blackFiles.suspicion, 0);
  assert.equal(s.board.confidence, 0);
  assert.equal(ensureVault(s).log.filter((e) => e.to === "club").length, 4);
});

test("كل تحويل مسجل بالمبلغ والمصدر والوجهة والسبب في الخزنة والدفتر", () => {
  const s = game({ trust: 50 });
  takeFromClub(s, 10_000_000);
  const e = ensureVault(s).log[0];
  assert.equal(e.from, "club");
  assert.equal(e.to, "personal");
  assert.equal(e.amount, 10_000_000);
  assert.ok(e.reason.length > 0);
  assert.ok(s.finance.ledger.some((x) => x.category === "vault" && x.amount === -10_000_000));
  assert.equal(validateSave(s), s);
});

test("الحفظات القديمة بلا حقول التحويلات الجديدة تُقرأ بأمان", () => {
  const s = game({ trust: 50 });
  delete ensureEmpire(s).transfers.lastDraw;
  delete ensureEmpire(s).transfers.projects;
  const t = ensureTransfers(ensureEmpire(s));
  assert.equal(t.lastDraw, null);
  assert.deepEqual(t.projects, []);
  assert.equal(floorRemainingDays(s), 0);
});
