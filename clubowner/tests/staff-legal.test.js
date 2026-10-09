// المجموعة ٤: القضايا القانونية، مواعيدها وارتباطها بالفضائح والخلافة.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { addDays } from "../src/core/utils.js";
import { post } from "../src/services/finance.js";
import { validateSave } from "../src/core/validation.js";
import {
  createDynastyChild,
  setSuccessionEligibility,
} from "../src/services/dynasty.js";
import { siblingConflictDay } from "../src/services/dynastyCareers.js";
import { addSuspicion, triggerScandal } from "../src/services/blackFiles.js";
import {
  fileLegalCase,
  legalDay,
  legalSettlementCost,
  resolveLegalCase,
} from "../src/services/staff/legal.js";
import { staffView } from "../src/features/staff.js";
import { getLanguage, setLanguage } from "../src/i18n/index.js";

const game = () => createGame({ database: "demo" });
const rich = (s, cash = 30_000_000) => {
  post(
    s,
    cash - s.finance.cash,
    "test-funds",
    "رصيد اختبار قانوني",
    "legal-test-cash",
  );
  return s;
};

test("فضيحة الملفات السوداء تفتح قضية دفاع تلقائيًا قابلة للتقاضي", () => {
  const s = rich(game(), 100_000_000);
  s.blackFiles.suspicion = 100;
  const result = triggerScandal(s);
  assert.ok(result);
  const item = s.staffCorp.legal.cases.find(
    (entry) => entry.sourceId === "black-scandal-1",
  );
  assert.equal(item.kind, "scandal");
  assert.equal(item.status, "open");
  assert.equal(item.severity, 3);
  const before = s.finance.cash;
  s.date = item.nextOn;
  const stage = resolveLegalCase(s, item.id, "contest");
  assert.equal(stage.item.stage, "hearing");
  assert.ok(s.finance.cash < before, "جلسة الترافع تسجل أتعابًا في الدفتر");
  assert.ok(
    item.stageResults[0].chance > 0 && item.stageResults[0].chance < 100,
  );
  validateSave(s);
});

test("القضايا تتدرج حتى الحكم، والتأخر بعد المهلة يسجل خسارة", () => {
  const s = rich(game());
  const item = fileLegalCase(s, "contract");
  assert.throws(
    () => resolveLegalCase(s, item.id, "contest"),
    /موعد الجلسة لم يحن/,
  );
  s.date = item.nextOn;
  legalDay(s);
  assert.ok(
    s.inbox.some(
      (entry) => entry.kind === "staff-legal-hearing" && entry.ref === item.id,
    ),
  );
  resolveLegalCase(s, item.id, "contest");
  assert.equal(item.stage, "hearing");
  s.date = item.nextOn;
  resolveLegalCase(s, item.id, "contest");
  assert.equal(item.stage, "verdict");
  s.date = item.nextOn;
  resolveLegalCase(s, item.id, "contest");
  assert.ok(["won", "lost"].includes(item.status));
  assert.equal(s.staffCorp.legal.wins + s.staffCorp.legal.losses, 1);
  validateSave(s);

  const ignored = fileLegalCase(s, "ban");
  s.date = addDays(ignored.nextOn, 31);
  legalDay(s);
  assert.equal(ignored.status, "lost");
  validateSave(s);
});

test("التسوية تقفل القضية بمبلغ ظاهر وتحدّث سجل التسويات", () => {
  const s = rich(game());
  const item = fileLegalCase(s, "ban");
  const fee = legalSettlementCost(item);
  const before = s.finance.cash;
  const result = resolveLegalCase(s, item.id, "settle");
  assert.equal(result.cost, fee);
  assert.equal(s.finance.cash, before - fee);
  assert.equal(item.status, "settled");
  assert.equal(s.staffCorp.legal.settlements, 1);
  assert.ok(
    s.finance.ledger.some((entry) => entry.category === "legal-settlement"),
  );
  validateSave(s);
});

test("استبعاد صاحب مطالبة يفتح نزاع خلافة مرتبطًا بشجرة الأسرة", () => {
  const s = game();
  const claimant = createDynastyChild(s, {
    name: "Claimant",
    age: 23,
    stats: { talent: 76, discipline: 65, ambition: 80 },
  });
  s.dynasty.children.push(claimant);
  claimant.legalClaim = true;
  claimant.isHeir = true;
  s.dynasty.heirId = claimant.id;
  setSuccessionEligibility(s, claimant.id, false);
  const item = s.staffCorp.legal.cases.find(
    (entry) => entry.sourceId === `succession-${claimant.id}`,
  );
  assert.equal(item.kind, "succession");
  assert.equal(item.claimantId, claimant.id);
  assert.equal(claimant.excludedFromSuccession, true);
  validateSave(s);
});

test("توتر الأشقاء ذوي المطالبة القانونية يطلق ملفًا واحدًا لا يتكرر شهريًا", () => {
  const s = game();
  const heir = createDynastyChild(s, {
    name: "Heir",
    age: 24,
    stats: { talent: 75, discipline: 70, ambition: 50 },
  });
  const rival = createDynastyChild(s, {
    name: "Rival",
    age: 22,
    stats: { talent: 74, discipline: 60, ambition: 90 },
  });
  s.dynasty.children.push(heir, rival);
  s.dynasty.heirId = heir.id;
  heir.isHeir = true;
  heir.legalClaim = true;
  rival.legalClaim = true;
  rival.jealousy = 100;
  siblingConflictDay(s);
  const cases = s.staffCorp.legal.cases.filter(
    (entry) => entry.kind === "succession",
  );
  assert.equal(cases.length, 1);
  assert.equal(cases[0].claimantId, rival.id);
  validateSave(s);
});

test("واجهة القضايا والمقر تستخدم اللغة المختارة", () => {
  const s = game();
  const previous = getLanguage();
  try {
    setLanguage("en");
    const legalHtml = staffView(s, "legal", "en");
    const hqHtml = staffView(s, "hq", "en");
    assert.match(legalHtml, /Legal Affairs/);
    assert.match(legalHtml, /File case/);
    assert.match(hqHtml, /Small Office/);
    assert.doesNotMatch(hqHtml, /مقر صغير/);
    setLanguage("fr");
    const financeHtml = staffView(s, "financeOffice", "fr");
    assert.match(financeHtml, /Bureau financier/);
    assert.match(financeHtml, /Trésorerie actuelle/);
  } finally {
    setLanguage(previous);
  }
});
