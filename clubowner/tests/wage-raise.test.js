// 0.53 hotfix «زرار المليار» — زر «ارفع الميزانية» في لوحة الميزانية:
// مبلغ حر (من 1 حتى مليار) يُضاف فورًا إلى سقف الرواتب المعتمد، الزر ظاهر دائمًا،
// وكل رفعة تُسجَّل قبل/بعد — إضافة بحتة بلا غرامة ولا خصم ولا شبهة ولا حرارة.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SAVE_VERSION, createGame } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { secretDeposit, wages } from "../src/services/finance.js";
import { currentNoise } from "../src/services/noiseMeter.js";
import { renewPlayer } from "../src/services/transfers.js";
import {
  WAGE_RAISE_CHIPS,
  WAGE_RAISE_LOG_LIMIT,
  WAGE_RAISE_MAX,
  WAGE_RAISE_MIN,
  ensureWageRaises,
  normalizeWageRaise,
  raiseWageBudget,
  wageRaisePreview,
  wageRaisesStatus,
  wageOverrideStatus,
} from "../src/services/wageOverride.js";
import { financeView, wageRaiseModal } from "../src/features/finance.js";

const game = () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  secretDeposit(s, 60_000_000); // السيولة تمر عبر الدفاتر فلا ينكسر كشف الحساب.
  return s;
};
// تجاوز حقيقي: الحد المعتمد ينزل تحت فاتورة المرتبات (كما بعد قطع الجمعية).
const forceOverrun = (s) => {
  s.finance.wageBudget = Math.round(wages(s) * 0.5);
  return s;
};
const arabicDigits = /[\u0660-\u0669\u06f0-\u06f9]/;

test("السجل يبدأ فارغًا والسقف كما هو واللقطة تمرّ التحقق", () => {
  const s = game();
  assert.deepEqual(s.finance.wageRaises, {
    count: 0,
    totalAdded: 0,
    lastDate: null,
    log: [],
  });
  const st = wageRaisesStatus(s);
  assert.equal(st.count, 0);
  assert.equal(st.budget, s.finance.wageBudget);
  assert.equal(st.max, WAGE_RAISE_MAX);
  assert.equal(st.min, WAGE_RAISE_MIN);
  assert.deepEqual(st.raises, []);
  validateSave(s);
});

test("الزر ظاهر دائمًا في لوحة الميزانية — بلا تجاوز وبعده", () => {
  const s = game();
  const before = financeView(s);
  assert.ok(
    before.includes('data-action="wage-budget-raise"'),
    "الزر ظاهر بلا تجاوز",
  );
  assert.ok(before.includes("ارفع الميزانية"), "نص الزر المعلن");
  assert.ok(before.includes("مليار"), "الحد الأقصى معلن في اللوحة");
  assert.ok(!before.includes("سجل رفع الميزانية"), "لا سجل قبل أول رفعة");
  raiseWageBudget(s, 5_000_000);
  const after = financeView(s);
  assert.ok(
    after.includes('data-action="wage-budget-raise"'),
    "الزر يبقى ظاهرًا بعد الرفع",
  );
  assert.ok(after.includes("سجل رفع الميزانية"), "السجل ظهر بعد أول رفعة");
  assert.ok(!arabicDigits.test(after), "لا أرقام عربية-هندية");
});

test("الرفع فوري: المبلغ يُضاف إلى السقف في نفس اللحظة", () => {
  const s = game();
  const before = s.finance.wageBudget;
  // معاينة صرفة: لا تلمس الحفظة ولا تغيّر السقف.
  const preview = wageRaisePreview(s, 4_000_000);
  assert.equal(s.finance.wageBudget, before, "المعاينة لا تعدّل السقف");
  assert.equal(preview.budgetBefore, before);
  assert.equal(preview.budgetAfter, before + 4_000_000);
  const record = raiseWageBudget(s, 4_000_000);
  assert.equal(s.finance.wageBudget, before + 4_000_000, "السقف ارتفع فورًا");
  assert.equal(record.amount, 4_000_000);
  assert.equal(record.budgetBefore, before);
  assert.equal(record.budgetAfter, s.finance.wageBudget);
  assert.ok(record.date && record.season >= 1);
  assert.equal(wageOverrideStatus(s).gap, 0, "لا تجاوز بعد الرفع");
  validateSave(s);
});

test("مليار واحد في رفعة واحدة — والرفعات تتراكم", () => {
  const s = game();
  const before = s.finance.wageBudget;
  const record = raiseWageBudget(s, WAGE_RAISE_MAX);
  assert.equal(record.amount, 1_000_000_000);
  assert.equal(s.finance.wageBudget, before + 1_000_000_000);
  assert.ok(Number.isSafeInteger(s.finance.wageBudget));
  const second = raiseWageBudget(s, WAGE_RAISE_MAX);
  assert.equal(second.budgetAfter, before + 2_000_000_000, "مليار ثانٍ يتراكم");
  const st = wageRaisesStatus(s);
  assert.equal(st.count, 2);
  assert.equal(st.totalAdded, 2_000_000_000);
  assert.equal(ensureWageRaises(s).log.length, 2);
  validateSave(s);
});

test("الحد: 1 مقبول، وأكثر من مليار أو أقل من 1 مرفوض", () => {
  const s = game();
  assert.equal(normalizeWageRaise(1), 1);
  assert.equal(normalizeWageRaise(WAGE_RAISE_MAX), 1_000_000_000);
  assert.equal(normalizeWageRaise("250000"), 250_000, "النص الرقمي يُقرأ");
  assert.equal(normalizeWageRaise(1_000_000_000.4), 1_000_000_000, "يُقرَّب");
  for (const bad of [
    WAGE_RAISE_MAX + 1,
    1_000_000_000.6,
    0,
    -5,
    NaN,
    "abc",
    null,
  ])
    assert.throws(() => raiseWageBudget(s, bad), Error, `مرفوض: ${bad}`);
  const before = s.finance.wageBudget;
  assert.equal(s.finance.wageBudget, before, "المرفوض لا يغيّر السقف");
  assert.equal(ensureWageRaises(s).count, 0);
  validateSave(s);
});

test("التسجيل قبل/بعد: سطر كامل لكل رفعة + رسالة في البريد", () => {
  const s = game();
  const record = raiseWageBudget(s, 7_500_000);
  const t = ensureWageRaises(s);
  assert.equal(t.count, 1);
  assert.equal(t.log[0].id, record.id);
  assert.equal(t.totalAdded, 7_500_000);
  assert.equal(t.lastDate, s.date);
  assert.equal(record.budgetAfter - record.budgetBefore, record.amount);
  const mail = s.inbox.find(
    (m) => m.kind === "wage-raise" && m.ref === record.id,
  );
  assert.ok(mail, "رسالة الرفعة موجودة في البريد");
  assert.equal(mail.status, "open");
  assert.equal(mail.read, false);
  assert.equal(mail.category, "finance");
  assert.ok(
    mail.body.includes(record.budgetBefore.toLocaleString("en-US")) &&
      mail.body.includes(record.budgetAfter.toLocaleString("en-US")),
    "الرسالة تقرأ الحد قبل وبعد",
  );
  validateSave(s);
});

test("كل رفعة سطر مستقل وأحدثها في الأعلى", () => {
  const s = game();
  const first = raiseWageBudget(s, 1_000_000);
  s.date = "2028-01-01";
  const second = raiseWageBudget(s, 2_000_000);
  const t = ensureWageRaises(s);
  assert.equal(t.count, 2);
  assert.deepEqual(
    t.log.map((r) => r.id),
    [second.id, first.id],
  );
  assert.equal(t.lastDate, "2028-01-01");
  assert.equal(t.totalAdded, 3_000_000);
  assert.equal(
    second.budgetBefore,
    first.budgetAfter,
    "الرفعة تبني على ما قبلها",
  );
});

test("السجل محدود بـ40 سطرًا والعدّاد يواصل", () => {
  const s = game();
  for (let i = 0; i < WAGE_RAISE_LOG_LIMIT + 1; i++)
    raiseWageBudget(s, 1_000_000);
  const t = ensureWageRaises(s);
  assert.equal(t.count, WAGE_RAISE_LOG_LIMIT + 1);
  assert.equal(t.log.length, WAGE_RAISE_LOG_LIMIT);
  assert.equal(t.totalAdded, (WAGE_RAISE_LOG_LIMIT + 1) * 1_000_000);
  assert.equal(
    s.finance.wageBudget,
    wageRaisesStatus(s).budget,
    "السقف يعكس كل الرفعات حتى التي خرجت من السجل",
  );
  validateSave(s);
});

test("إضافة بحتة: لا غرامة ولا خصم ولا شبهة ولا حرارة", () => {
  const s = game();
  const snap = {
    cash: s.finance.cash,
    personal: s.empire?.personal ?? null,
    ledger: s.finance.ledger.length,
    obligations: s.finance.obligations.length,
    loans: s.finance.loans.length,
    politics: JSON.stringify(s.politics ?? null),
    noise: currentNoise(s),
    suspicion: s.blackFiles?.suspicion ?? null,
    fanSupport: s.fanSupport,
    reputation: s.reputation,
    playerSalaries: s.players.reduce((a, p) => a + p.salary, 0),
  };
  raiseWageBudget(s, WAGE_RAISE_MAX);
  assert.equal(s.finance.cash, snap.cash, "لا خصم من الخزينة");
  assert.equal(
    s.empire?.personal ?? null,
    snap.personal,
    "لا خصم من الثروة الشخصية",
  );
  assert.equal(s.finance.ledger.length, snap.ledger, "لا قيد مالي جديد");
  assert.equal(s.finance.obligations.length, snap.obligations);
  assert.equal(s.finance.loans.length, snap.loans);
  assert.equal(
    JSON.stringify(s.politics ?? null),
    snap.politics,
    "لا أثر سياسي",
  );
  assert.equal(currentNoise(s), snap.noise, "لا حرارة");
  assert.equal(s.blackFiles?.suspicion ?? null, snap.suspicion, "لا شبهة");
  assert.equal(s.fanSupport, snap.fanSupport);
  assert.equal(s.reputation, snap.reputation);
  assert.equal(
    s.players.reduce((a, p) => a + p.salary, 0),
    snap.playerSalaries,
    "الرفعة لا تغيّر أي عقد",
  );
  validateSave(s);
});

test("الرفعة تفتح التوقيع المتوقف عند التجاوز", () => {
  const s = forceOverrun(game());
  const p = s.players.find((x) => x.clubId === s.clubId && !x.loan);
  const terms = {
    salary: p.salary + 100_000,
    bonus: 0,
    years: 2,
    role: p.role,
  };
  const gap = wageOverrideStatus(s).gap;
  assert.ok(gap > 0);
  assert.throws(() => renewPlayer(s, p.id, terms), /ميزانية المرتبات/);
  raiseWageBudget(s, gap + 500_000); // فوق الفجوة وفوق الزيادة المطلوبة في العقد
  assert.equal(wageOverrideStatus(s).gap, 0, "الفجوة صفرت بالرفعة");
  assert.equal(wageOverrideStatus(s).over, false);
  renewPlayer(s, p.id, terms);
  assert.equal(p.salary, terms.salary);
  validateSave(s);
});

test("الواجهة عند التجاوز: زر الرفع وزر الموافقة معًا", () => {
  const s = forceOverrun(game());
  const html = financeView(s);
  assert.ok(html.includes('data-action="wage-budget-raise"'), "زر الرفع");
  assert.ok(
    html.includes('data-action="wage-override-approve"'),
    "زر «أوافق كمالك!» القديم ما زال يعمل",
  );
  assert.ok(!arabicDigits.test(html), "لا أرقام عربية-هندية");
});

test("الحفظات القديمة: الغياب لا يكسر التحقق ويُبنى عند أول لمسة", () => {
  const s = game();
  delete s.finance.wageRaises;
  validateSave(s);
  const st = wageRaisesStatus(s);
  assert.equal(st.count, 0);
  assert.deepEqual(ensureWageRaises(s).log, []);
  const before = s.finance.wageBudget;
  raiseWageBudget(s, 3_000_000);
  assert.equal(s.finance.wageBudget, before + 3_000_000);
  assert.equal(ensureWageRaises(s).count, 1);
  validateSave(s);
});

test("الترحيل: الحقل يُبنى فارغًا ولا يتغير أي رقم", () => {
  const s = game();
  delete s.finance.wageRaises;
  s.version = 41;
  const before = {
    cash: s.finance.cash,
    personal: s.empire.personal,
    payroll: wages(s),
    budget: s.finance.wageBudget,
  };
  const migrated = migrateSave(s);
  assert.equal(SAVE_VERSION, 42);
  assert.equal(migrated.version, 42);
  assert.deepEqual(migrated.finance.wageRaises, {
    count: 0,
    totalAdded: 0,
    lastDate: null,
    log: [],
  });
  assert.equal(migrated.finance.cash, before.cash);
  assert.equal(migrated.empire.personal, before.personal);
  assert.equal(wages(migrated), before.payroll);
  assert.equal(migrated.finance.wageBudget, before.budget);
  validateSave(migrated);
  // حفظة بالصيغة الحالية بلا الحقل: تُبنى عند التحميل كذلك.
  const same = game();
  delete same.finance.wageRaises;
  assert.ok(migrateSave(same).finance.wageRaises, "يُبنى عند التحميل");
  validateSave(migrateSave(same));
});

test("النافذة: مبلغ حر حتى مليار مع اختصارات ومعاينة قبل/بعد", () => {
  const s = game();
  const html = wageRaiseModal(s);
  assert.ok(html.includes('id="wage-raise-form"'), "نموذج الرفع");
  assert.ok(html.includes('min="1"') && html.includes('max="1000000000"'));
  assert.ok(html.includes('id="wage-raise-summary"'), "خانة المعاينة الحية");
  assert.ok(html.includes("مليار"), "المليار مذكور صراحة");
  assert.equal(
    (html.match(/data-action="wage-raise-quick"/g) || []).length,
    WAGE_RAISE_CHIPS.length,
    "كل اختصارات المبلغ موجودة",
  );
  assert.ok(
    html.includes(`data-id="${WAGE_RAISE_MAX}"`),
    "اختصار المليار موجود",
  );
  assert.ok(!arabicDigits.test(html), "لا أرقام عربية-هندية");
});

test("الربط في الإجراءات: زر اللوحة والنموذج واختصارات المبلغ", () => {
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  for (const needle of [
    '"wage-budget-raise":',
    '"wage-raise-quick":',
    'form.id === "wage-raise-form"',
    "#wage-raise-form",
    "wageRaisePreview(s, amount)",
  ])
    assert.ok(main.includes(needle), `ربط مفقود: ${needle}`);
});
