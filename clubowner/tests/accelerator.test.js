// المعجل ⚡ 0.48 — عادي (سعر + انتظار) أو معجل (+% ← فوري) للفروع والمنشآت.
// القاعدة الصارمة: الانتظار الإجباري ممنوع — الخيارات الثلاثة متاحة دائمًا،
// والفوري يُدفع كاملًا ويُستلم في نفس اليوم بلا أي انتظار ولا التزامات مؤجلة.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import {
  projectQuote,
  startProject,
  FACILITY_INSTANT_FACTOR,
} from "../src/services/facilities.js";
import { facilityDetail } from "../src/features/facilities.js";
import { branchesView } from "../src/features/branches.js";
import {
  ensureBranches,
  branchQuote,
  openBranch,
  upgradeBranch,
  builtBranches,
  BRANCH_INSTANT_FACTOR,
} from "../src/services/branches.js";
import { branchMarket } from "../src/data/branchCatalog.js";
import { post } from "../src/services/finance.js";
import { FACILITIES } from "../src/data/catalog.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ...opts });
  validateSave(s);
  return s;
};

// تمويل متسق مع الدفاتر (يحترم مدقق كشف الحساب).
let seq = 0;
const fund = (s, amount) => post(s, amount, "vault", "تمويل اختبار", `accel-topup-${++seq}`);

test("تسعير المنشآت: قياسي و +20% معجل مؤجل و +45% فوري بلا أي انتظار", () => {
  const s = game();
  const f = s.facilities.find((x) => x.id === "stadium");
  const normal = projectQuote(f, "normal");
  const fast = projectQuote(f, "fast");
  const instant = projectQuote(f, "instant");
  assert.ok(normal.days >= 3 && normal.cost > 0);
  assert.equal(fast.cost, Math.round(normal.cost * 1.2));
  assert.ok(fast.days < normal.days, "المعجل المؤجل يقصر المدة 70%");
  assert.equal(instant.cost, Math.round(normal.cost * FACILITY_INSTANT_FACTOR));
  assert.equal(instant.days, 0, "الفوري بلا أي أيام انتظار");
  assert.equal(instant.cost, Math.round(normal.cost * 1.45));
  // الاتصال القديم بالقيم المنطقية ما زال يعمل (ultras ومسارات الحفظ القديمة).
  assert.deepEqual(projectQuote(f, false), normal);
  assert.deepEqual(projectQuote(f, true), fast);
  assert.throws(() => projectQuote(f, "teleport"), "طريقة غير معروفة تُرفض");
});

test("المنشآت: البدء الفوري ⚡ يرفع المستوى ويخصم التكلفة كاملة اليوم بلا التزامات ولا مشروع معلق", () => {
  const s = game();
  fund(s, 900_000_000);
  const f = s.facilities.find((x) => x.id === "training");
  const q = projectQuote(f, "instant");
  const cash = s.finance.cash;
  const level = f.level;
  const obligations = s.finance.obligations.length;
  const r = startProject(s, "training", "instant");
  assert.ok(r.instant, "النتيجة موسومة فورية");
  assert.equal(f.level, level + 1, "المستوى ارتفع في نفس اليوم");
  assert.equal(f.project, null, "لا مشروع معلق أصلًا");
  assert.equal(s.finance.cash, cash - q.cost, "التكلفة كاملة دفعت اليوم");
  assert.equal(s.finance.obligations.length, obligations, "لا التزامات مؤجلة");
  assert.ok(s.finance.ledger.some((e) => e.category === "construction" && e.amount === -q.cost));
  assert.ok(s.inbox[0].title.includes("فورًا"));
  validateSave(s);
});

test("المنشآت: مسار الانتظار (عادي/معجل) كما هو تمامًا — مقدمة والتزام استلام", () => {
  const s = game();
  fund(s, 900_000_000);
  const f = s.facilities.find((x) => x.id === "academy");
  const q = projectQuote(f, "normal");
  const cash = s.finance.cash;
  const obligations = s.finance.obligations.length;
  const p = startProject(s, "academy", "normal");
  assert.ok(p.days > 0, "المسار العادي له مدة معلنة");
  assert.equal(f.project.end, p.end);
  assert.equal(s.finance.cash, cash - Math.round(q.cost * 0.4));
  assert.equal(s.finance.obligations.length, obligations + 1, "دفعة الاستلام مؤجلة كما كانت");
  assert.throws(() => startProject(s, "academy", "instant"), "مشروع قائم يمنع فوريًا جديدًا");
  validateSave(s);
});

test("المنشآت: الفوري بلا رصيد كافٍ يُرفض قبل أي أثر", () => {
  const s = game();
  // استنزاف شرعي للرصيد عبر قيد حقيقي ليبقى كشف الحساب متطابقًا.
  post(s, -s.finance.cash + 1000, "vault", "استنزاف اختبار", `accel-drain-${++seq}`);
  const f = s.facilities.find((x) => x.id === "training");
  const level = f.level;
  const cash = s.finance.cash;
  assert.throws(() => startProject(s, "training", "instant"));
  assert.equal(f.level, level);
  assert.equal(s.finance.cash, cash);
  assert.equal(f.project, null);
  validateSave(s);
});

test("الفروع: عادي (سعر + انتظار معلن) أو معجل ⚡ (+25% ← فوري) — كلاهما متاح دائمًا", () => {
  const s = game();
  const normal = branchQuote(s, "jp", 1);
  const instant = branchQuote(s, "jp", 1, { instant: true });
  assert.ok(normal.days === 30 && normal.cost > 0);
  assert.equal(instant.days, 0, "الفوري بلا أي انتظار");
  assert.equal(instant.instant, true);
  const market = branchMarket("jp");
  const baseCost = 8_000_000 + market.level * 550_000;
  assert.equal(normal.cost, Math.round(baseCost / 100_000) * 100_000);
  assert.equal(
    instant.cost,
    Math.round((baseCost * BRANCH_INSTANT_FACTOR) / 100_000) * 100_000,
    "الفوري = القاعدة × 1.25 بنفس تقريب المئة ألف",
  );
  assert.ok(instant.cost > normal.cost, "الفوري أعلى سعرًا دائمًا");
});

test("الفروع: الفتح الفوري ⚡ يبني الفرع اليوم بالمستوى 1 بلا مشروع معلق", () => {
  const s = game();
  fund(s, 900_000_000);
  const cash = s.finance.cash;
  const r = openBranch(s, "jp", { instant: true });
  assert.ok(r.instant);
  assert.equal(builtBranches(s).length, 1, "الفرع يعمل من نفس اليوم");
  assert.equal(builtBranches(s)[0].country, "jp");
  assert.equal(builtBranches(s)[0].level, 1);
  assert.equal(s.branches.projects.length, 0, "لا مشروع معلق");
  assert.equal(s.finance.cash, cash - r.cost);
  assert.throws(() => openBranch(s, "jp", { instant: true }), "لا تكرار لنفس البلد");
  validateSave(s);
});

test("الفروع: الترقية الفورية ⚡ حتى السقف 3، وبلا رصيد تُرفض قبل أي أثر", () => {
  const s = game();
  fund(s, 900_000_000);
  openBranch(s, "br", { instant: true });
  upgradeBranch(s, "br", { instant: true });
  assert.equal(builtBranches(s)[0].level, 2);
  upgradeBranch(s, "br", { instant: true });
  assert.equal(builtBranches(s)[0].level, 3);
  assert.throws(() => upgradeBranch(s, "br", { instant: true }), "السقف 3 يمنع الفوري كذلك");
  const s2 = game();
  post(s2, -s2.finance.cash + 1000, "vault", "استنزاف اختبار", `accel-drain2-${++seq}`);
  assert.throws(() => openBranch(s2, "eg", { instant: true }), "بلا رصيد لا شيء يحدث");
  assert.equal(builtBranches(s2).length, 0);
  validateSave(s2);
  validateSave(s);
});

test("لا انتظار إجباري: خيارات الفوري ظاهرة دائمًا في واجهتي المنشآت والفروع", () => {
  const s = game();
  const modal = facilityDetail(s, "stadium");
  assert.ok(modal.includes('value="instant"'), "خيار ⚡ في نافذة المنشأة");
  assert.ok(modal.includes('value="normal"') && modal.includes('value="fast"'), "الخياران الآخران باقيان");
  ensureBranches(s);
  const view = branchesView(s);
  assert.ok(view.includes("branch-open-instant"), "زر ⚡ للفتح");
});
