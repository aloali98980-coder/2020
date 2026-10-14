// تجاوز المالك 0.52 — الدفعة 3 من جلسة «السياسة والصلاحيات».
// زر «أوافق كمالك!»: يرفع سقف الرواتب فورًا عند التجاوز فقط، إضافة بحتة بلا أي
// غرامة أو خصم أو شبهة أو حرارة، ويسجّل كل موافقة في سجل مستقل + رسالة في البريد.
import test from "node:test";
import assert from "node:assert/strict";
import { SAVE_VERSION, createGame } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { secretDeposit, wages } from "../src/services/finance.js";
import { currentNoise } from "../src/services/noiseMeter.js";
import { renewPlayer } from "../src/services/transfers.js";
import {
  WAGE_OVERRIDE_LOG_LIMIT,
  approveOwnerWageOverride,
  ensureWageOverride,
  ownerHeadroom,
  wageGap,
  wageOverrideStatus,
} from "../src/services/wageOverride.js";
import { financeView } from "../src/features/finance.js";

const game = () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  secretDeposit(s, 60_000_000); // السيولة تمر عبر الدفاتر فلا ينكسر كشف الحساب.
  return s;
};
// نصنع تجاوزًا حقيقيًا: خفض الحد المعتمد تحت فاتورة المرتبات (كما يحدث بعد قطع الجمعية).
const forceOverrun = (s) => {
  s.finance.wageBudget = Math.round(wages(s) * 0.5);
  return s;
};
const arabicDigits = /[\u0660-\u0669\u06f0-\u06f9]/;

test("السجل يبدأ فارغًا واللقطة تمرّ التحقق", () => {
  const s = game();
  assert.deepEqual(s.finance.ownerOverride, {
    count: 0,
    totalAdded: 0,
    lastDate: null,
    log: [],
  });
  assert.equal(wageGap(s), 0);
  const st = wageOverrideStatus(s);
  assert.equal(st.over, false);
  assert.equal(st.count, 0);
  assert.equal(st.budget, s.finance.wageBudget);
  validateSave(s);
});

test("الزر ممنوع بلا تجاوز: لا سقف يتخطاه", () => {
  const s = game();
  const before = s.finance.wageBudget;
  assert.throws(() => approveOwnerWageOverride(s), Error);
  assert.equal(s.finance.wageBudget, before);
  assert.equal(ensureWageOverride(s).count, 0);
  validateSave(s);
});

test("الموافقة ترفع السقف فورًا وتُصفّر الفجوة", () => {
  const s = forceOverrun(game());
  const payroll = wages(s),
    before = s.finance.wageBudget;
  assert.ok(wageGap(s) > 0);
  assert.equal(wageOverrideStatus(s).over, true);
  const record = approveOwnerWageOverride(s);
  assert.equal(
    s.finance.wageBudget,
    Math.max(before, payroll + ownerHeadroom(payroll)),
  );
  assert.equal(wageGap(s), 0);
  assert.equal(record.budgetBefore, before);
  assert.equal(record.budgetAfter, s.finance.wageBudget);
  assert.equal(record.payroll, payroll);
  assert.equal(record.gap, Math.ceil(payroll - before));
  assert.ok(record.headroom >= 100_000, "الهامش لا يقل عن 100 ألف");
  assert.equal(wageOverrideStatus(s).over, false);
  validateSave(s);
});

test("التوقيع المتوقف على سقف الرواتب ينفتح بعد الموافقة", () => {
  const s = forceOverrun(game());
  const p = s.players.find((x) => x.clubId === s.clubId && !x.loan);
  const terms = {
    salary: p.salary + 100_000,
    bonus: 0,
    years: 2,
    role: p.role,
  };
  assert.throws(() => renewPlayer(s, p.id, terms), /ميزانية المرتبات/);
  approveOwnerWageOverride(s);
  renewPlayer(s, p.id, terms);
  assert.equal(p.salary, terms.salary);
  validateSave(s);
});

test("إضافة بحتة: لا غرامة ولا خصم ولا شبهة ولا حرارة", () => {
  const s = forceOverrun(game());
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
  };
  const record = approveOwnerWageOverride(s);
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
    record.budgetAfter - record.budgetBefore - record.gap,
    record.headroom,
  );
});

test("التسجيل: سطر كامل في السجل + رسالة في البريد", () => {
  const s = forceOverrun(game());
  const record = approveOwnerWageOverride(s);
  const o = ensureWageOverride(s);
  assert.equal(o.count, 1);
  assert.equal(o.log.length, 1);
  assert.equal(o.log[0].id, record.id);
  assert.equal(o.totalAdded, record.budgetAfter - record.budgetBefore);
  assert.equal(o.lastDate, s.date);
  const mail = s.inbox.find(
    (m) => m.kind === "wage-override" && m.ref === record.id,
  );
  assert.ok(mail, "رسالة الموافقة موجودة في البريد");
  assert.equal(mail.status, "open");
  assert.equal(mail.read, false);
  assert.equal(mail.category, "finance");
  validateSave(s);
});

test("كل موافقة سطر مستقل وأحدثها في الأعلى", () => {
  const s = game();
  forceOverrun(s);
  const first = approveOwnerWageOverride(s);
  s.date = "2028-01-01";
  forceOverrun(s);
  const second = approveOwnerWageOverride(s);
  const o = ensureWageOverride(s);
  assert.equal(o.count, 2);
  assert.deepEqual(
    o.log.map((r) => r.id),
    [second.id, first.id],
  );
  assert.equal(o.lastDate, "2028-01-01");
  assert.equal(
    o.totalAdded,
    first.budgetAfter -
      first.budgetBefore +
      second.budgetAfter -
      second.budgetBefore,
  );
});

test("السجل محدود والعدّاد يواصل بعد الحد", () => {
  const s = game();
  for (let i = 0; i < WAGE_OVERRIDE_LOG_LIMIT + 1; i++) {
    forceOverrun(s);
    approveOwnerWageOverride(s);
  }
  const o = ensureWageOverride(s);
  assert.equal(o.count, WAGE_OVERRIDE_LOG_LIMIT + 1);
  assert.equal(o.log.length, WAGE_OVERRIDE_LOG_LIMIT);
  validateSave(s);
});

test("الحفظات القديمة: غياب الحقل لا يكسر التحقق ويُبنى عند أول لمسة", () => {
  const s = game();
  delete s.finance.ownerOverride;
  validateSave(s);
  const st = wageOverrideStatus(s);
  assert.equal(st.count, 0);
  assert.equal(st.over, false);
  assert.deepEqual(s.finance.ownerOverride.log, []);
  validateSave(s);
});

test("الترحيل v41→v42: الحقل يُنشأ فارغًا ولا يتغير أي رقم", () => {
  const s = game();
  delete s.finance.ownerOverride;
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
  assert.deepEqual(migrated.finance.ownerOverride, {
    count: 0,
    totalAdded: 0,
    lastDate: null,
    log: [],
  });
  assert.equal(migrated.finance.cash, before.cash);
  assert.equal(migrated.empire.personal, before.personal);
  assert.equal(wages(migrated), before.payroll);
  assert.equal(migrated.finance.wageBudget, before.budget);
  assert.ok(migrated.migrationNote.includes("تجاوز المالك 0.52"));
  validateSave(migrated);
});

test("الواجهة: الزر يظهر عند التجاوز فقط وبأرقام لاتينية", () => {
  const s = forceOverrun(game());
  const before = financeView(s);
  assert.ok(
    before.includes('data-action="wage-override-approve"'),
    "الزر ظاهر عند التجاوز",
  );
  assert.ok(before.includes("أوافق كمالك!"), "نص القرار المعلن");
  assert.ok(!arabicDigits.test(before), "لا أرقام عربية-هندية");
  assert.ok(!before.includes("سجل موافقات المالك"), "لا سجل قبل أول موافقة");
  approveOwnerWageOverride(s);
  const after = financeView(s);
  assert.ok(
    !after.includes('data-action="wage-override-approve"'),
    "الزر يغيب بعده",
  );
  assert.ok(after.includes("سجل موافقات المالك"), "السجل يظهر بعد أول موافقة");
  assert.ok(after.includes("موافقاتك كمالك"), "حالة ما بعد الموافقة");
  assert.ok(!arabicDigits.test(after), "لا أرقام عربية-هندية");
});
