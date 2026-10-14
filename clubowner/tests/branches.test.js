// الفروع 0.47 — الفتح بدولة (تكلفة+مستوى 1-3)، ميزة الدولة وعوائدها الشهرية
// (ناشئون/دخل/شهرة/كشافة)، الترقيات، مدير الكفاءة، القرارات الإضافة،
// جسر إمبراطور الأندية، وخصم الكشافة — بلا أي عقوبة على التجاهل.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import { addDays } from "../src/core/utils.js";
import { post } from "../src/services/finance.js";
import {
  ensureBranches,
  openBranch,
  upgradeBranch,
  branchQuote,
  branchDay,
  branchesMonth,
  branchIncome,
  managerCandidates,
  hireBranchManager,
  fireBranchManager,
  applyBranchDecision,
  signBranchCandidate,
  sellBranchCandidate,
  releaseBranchCandidate,
  branchScoutFactor,
  bridgeCostFactor,
  bridgeIncomeFactor,
  ownedClubsIn,
  builtBranches,
} from "../src/services/branches.js";
import { MARKETS } from "../src/data/worldMarkets.js";
import { COUNTRY_EDGE, EDGE_BY_COUNTRY, branchMarket, BRANCH_DECISIONS } from "../src/data/branchCatalog.js";
import { initClubEmpire } from "../src/services/clubEmpire/state.js";
import { WORLD_CLUBS } from "../src/data/packs/world.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ...opts });
  validateSave(s);
  return s;
};

// تمويل اختباري متسق مع الدفاتر (يحترم مدقق كشف الحساب).
let topUpSeq = 0;
const fund = (s, amount) => post(s, amount, "vault", "تمويل اختبار", `test-topup-${++topUpSeq}`);

// أول يوم من الشهر التالي ثم نبض اليوم والشهر.
const nextMonth = (s) => {
  const y = Number(s.date.slice(0, 4));
  const m = Number(s.date.slice(5, 7));
  s.date = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  branchDay(s);
  branchesMonth(s);
};

// دفع الزمن يومًا بيوم حتى تاريخ معين عبر branchDay فقط (أسرع من advanceTime).
const runTo = (s, date) => {
  let guard = 0;
  while (s.date < date && guard++ < 400) {
    s.date = addDays(s.date, 1);
    branchDay(s);
    if (s.date.endsWith("-01")) branchesMonth(s);
  }
};

test("حفظة جديدة: فروع فارغة بالبنية v40، وكل الأسواق الخمسون لها ميزة واحدة", () => {
  assert.equal(SAVE_VERSION, 42);
  const s = game();
  assert.equal(s.branches.schema, 1);
  assert.deepEqual(s.branches.list, []);
  assert.equal(MARKETS.length, 50);
  for (const m of MARKETS) assert.ok(EDGE_BY_COUNTRY[m.id], `لا ميزة لـ ${m.id}`);
  validateSave(s);
});

test("الترحيل v39→v40: قائمة فارغة ولا يُخصم ولا تتغير أي قيمة", () => {
  const s = game();
  const snapshot = JSON.stringify({ cash: s.finance.cash, players: s.players.length });
  delete s.branches;
  s.version = 39;
  const m = migrateSave(s);
  assert.equal(m.version, 42);
  assert.deepEqual(m.branches.list, []);
  assert.equal(
    JSON.stringify({ cash: m.finance.cash, players: m.players.length }),
    snapshot,
  );
  assert.ok(m.migrationNote.includes("الفروع"));
  validateSave(m);
});

test("الفتح: تكلفة ومدة معلنتان، تُخصم من الخزينة، والاستلام بعد 30 يومًا بالمستوى 1", () => {
  const s = game();
  fund(s, 500_000_000);
  const q = branchQuote(s, "eg", 1);
  assert.ok(q.cost > 0 && q.days === 30);
  const cash = s.finance.cash;
  openBranch(s, "eg");
  assert.equal(s.finance.cash, cash - q.cost);
  assert.ok(s.finance.ledger.some((e) => e.category === "branches" && e.amount === -q.cost));
  runTo(s, addDays(s.date, 31));
  assert.equal(builtBranches(s).length, 1);
  assert.equal(builtBranches(s)[0].country, "eg");
  assert.equal(builtBranches(s)[0].level, 1);
  validateSave(s);
});

test("قيود الفتح: دولة غير معروفة، تكرار البلد، سقف الفروع، وعدم كفاية الخزينة", () => {
  const s = game();
  assert.throws(() => openBranch(s, "zz"), "دولة غير معروفة");
  s.finance.cash = 1000; // رصيد غير كافٍ عمدًا (لا تمويل)
  assert.throws(() => openBranch(s, "eg"), "الخزينة لا تكفي");
  fund(s, 900_000_000);
  openBranch(s, "eg");
  assert.throws(() => openBranch(s, "eg"), "لا تكرار لنفس البلد");
  for (const c of ["br", "jp", "us", "ma", "tr"]) openBranch(s, c);
  assert.equal(builtBranches(s).length, 0, "قائمة الفروع لا تمتلئ قبل الاستلام");
  assert.equal(s.branches.projects.length, 6, "سقف المشاريع المتزامنة = سقف الفروع");
  assert.throws(() => openBranch(s, "de"), "سقف 6 فروع");
});

test("العوائد الشهرية: دخل يُسجل بالدفاتر، وشهرة ميزة الشهرة ترتفع شهريًا", () => {
  const s = game();
  fund(s, 500_000_000);
  openBranch(s, "es"); // ميزة شهرة
  runTo(s, addDays(s.date, 31));
  const before = s.empire.fame;
  const cash = s.finance.cash;
  nextMonth(s);
  assert.equal(branchesMonth(s), false, "التسوية مرة واحدة في الشهر");
  const income = s.finance.ledger.find(
    (e) => e.category === "branches" && e.amount > 0 && e.date === s.date,
  );
  assert.ok(income, "قيد عائد شهري");
  assert.ok(s.finance.cash > cash);
  assert.ok(s.empire.fame > before, "ميزة الشهرة رفعت شهرة المالك");
  validateSave(s);
});

test("ميزة الدخل: فرع السوق التجاري يطبق معامل 1.35 فوق عائده الأساسي", () => {
  const s = game();
  const rich = { country: "en", level: 1, manager: null, boosts: {}, openedOn: s.date };
  const market = branchMarket("en");
  const expected = Math.round((900_000 + market.level * 12_000) * 1 * 0.6 * 1.35);
  assert.equal(branchIncome(s, rich), expected);
  const plain = { country: "es", level: 1, manager: null, boosts: {}, openedOn: s.date };
  const marketEs = branchMarket("es");
  assert.equal(
    branchIncome(s, plain),
    Math.round((900_000 + marketEs.level * 12_000) * 1 * 0.6),
    "غير التجاري بلا معامل",
  );
});

test("ميزة الناشئين: مرشح من قاموس أسماء البلد بجنسيته، وضم أو بيع أو إطلاق بلا عقوبة", () => {
  const s = game();
  fund(s, 500_000_000);
  openBranch(s, "br"); // ميزة ناشئون
  runTo(s, addDays(s.date, 31));
  // حتمية الاختبار: اجعل المستوى 3 والمولد المحلي يمرر النرد في شهر جديد.
  const branch = builtBranches(s)[0];
  branch.level = 3;
  s.branches.rng = 0; // القادم من المولد المحلي صغير ⇒ النرد يمر
  nextMonth(s);
  assert.ok(s.branches.candidates.length >= 1, "ولّد مرشح واحد على الأقل");
  const c = s.branches.candidates[0];
  assert.equal(c.country, "br");
  assert.match(c.player.id, /^gen-/);
  const squadBefore = s.players.length;
  signBranchCandidate(s, c.id);
  assert.equal(s.players.length, squadBefore + 1);
  const signed = s.players.at(-1);
  assert.equal(signed.clubId, s.clubId);
  assert.ok(signed.contractEnd > s.date);
  validateSave(s);
  const c2 = s.branches.candidates[0];
  if (c2) {
    const cash = s.finance.cash;
    const fee = sellBranchCandidate(s, c2.id);
    assert.equal(s.finance.cash, cash + fee);
  }
  const c3 = s.branches.candidates[0];
  if (c3) {
    const before = s.inbox.filter((m) => m.required).length;
    releaseBranchCandidate(s, c3.id);
    assert.equal(s.inbox.filter((m) => m.required).length, before, "الإطلاق بلا عقوبة");
  }
  validateSave(s);
});

test("ميزة الكشافة: فرع المستوى الثاني يخفض رسوم مهمة بلده 25% والعامل 1 لغيرها", () => {
  const s = game();
  fund(s, 900_000_000);
  openBranch(s, "cl"); // ميزة كشافة
  assert.equal(branchScoutFactor(s, "cl"), 1, "قبل الفتح لا خصم");
  runTo(s, addDays(s.date, 31));
  assert.equal(branchScoutFactor(s, "cl"), 1, "المستوى 1 لا خصم");
  upgradeBranch(s, "cl");
  runTo(s, addDays(s.date, 46));
  assert.equal(builtBranches(s)[0].level, 2);
  assert.equal(branchScoutFactor(s, "cl"), 0.75);
  assert.equal(branchScoutFactor(s, "jp"), 1, "غير بلد الفرع بلا خصم");
  validateSave(s);
});

test("الترقيات: خطوة واحدة، تكلفة أعلى، وسقف عند المستوى 3", () => {
  const s = game();
  fund(s, 900_000_000);
  openBranch(s, "jp");
  runTo(s, addDays(s.date, 31));
  const q2 = branchQuote(s, "jp", 2);
  assert.throws(() => branchQuote(s, "jp", 3), "لا قفز درجتين");
  const cash = s.finance.cash;
  upgradeBranch(s, "jp");
  assert.equal(s.finance.cash, cash - q2.cost);
  runTo(s, addDays(s.date, 46));
  assert.equal(builtBranches(s)[0].level, 2);
  upgradeBranch(s, "jp");
  runTo(s, addDays(s.date, 61));
  assert.equal(builtBranches(s)[0].level, 3);
  assert.throws(() => upgradeBranch(s, "jp"), "السقف 3");
  validateSave(s);
});

test("مدير الكفاءة: مرشحون حتميون، والتعيين يرفع الدخل ويخصم الراتب، والإنهاء ممكن", () => {
  const s = game();
  fund(s, 900_000_000);
  openBranch(s, "us"); // ميزة دخل
  runTo(s, addDays(s.date, 31));
  const branch = builtBranches(s)[0];
  const before = branchIncome(s, branch);
  const cands = managerCandidates(s, "us");
  assert.equal(cands.length, 3);
  assert.deepEqual(managerCandidates(s, "us"), cands, "المرشحون حتميون لا يتغيرون");
  hireBranchManager(s, "us", cands[2].id);
  assert.equal(branch.manager.name, cands[2].name);
  assert.ok(branchIncome(s, branch) > before, "الكفاءة رفعت الدخل");
  assert.throws(() => hireBranchManager(s, "us", "mgr-us-99"), "مرشح غير معروف");
  fireBranchManager(s, "us");
  assert.equal(branch.manager, null);
  assert.throws(() => fireBranchManager(s, "us"), "لا مدير لإنهائه مرتين");
  validateSave(s);
});

test("قرارات الفروع: كل تعزيز إيجابي محسوب، والتجاهل ينتهي بصمت بلا رسالة ولا عقوبة", () => {
  const s = game();
  fund(s, 900_000_000);
  openBranch(s, "tr");
  runTo(s, addDays(s.date, 31));
  const branch = builtBranches(s)[0];
  s.branches.decisions.push({
    id: "bdec-test",
    branchId: branch.id,
    country: "tr",
    defId: "marketing",
    cost: 1_500_000,
    expires: addDays(s.date, 30),
  });
  const incomeBefore = branchIncome(s, branch);
  const msgsBefore = s.inbox.length;
  applyBranchDecision(s, "bdec-test");
  assert.ok(branchIncome(s, branch) > incomeBefore, "حملة التسويق ترفع الدخل 25%");
  assert.equal(s.branches.decisions.length, 0);
  assert.ok(s.finance.ledger.some((e) => e.category === "branches" && e.amount === -1_500_000));
  // انتهاء بالتجاهل: صامت تمامًا.
  s.branches.decisions.push({
    id: "bdec-exp",
    branchId: branch.id,
    country: "tr",
    defId: "school",
    cost: 2_000_000,
    expires: addDays(s.date, -1), // انتهى أمس
  });
  const cash = s.finance.cash;
  branchDay(s);
  assert.equal(s.branches.decisions.length, 0, "القرار المنتهي يُحذف");
  assert.equal(s.finance.cash, cash, "لا خصم بلا قرار");
  assert.equal(s.inbox.length, msgsBefore + 1, "لا رسالة لوم جديدة");
  validateSave(s);
});

test("الجسر P16: نادٍ مملوك في بلد الفرع يخفض التكلفة 20% ويرفع العائد 15%", () => {
  const s = game();
  const empire = initClubEmpire(s);
  const brClub = WORLD_CLUBS.find((c) => c.league === "br");
  const brClub2 = WORLD_CLUBS.filter((c) => c.league === "br")[1];
  assert.ok(brClub && brClub2, "ناديان برازيليان في قاعدة العالم");
  empire.ownedClubs.push({ clubId: brClub.id, ownership: 100, value: 50_000_000, control: true });
  assert.equal(ownedClubsIn(s, "br"), 1, "الجسر يرى النادي المملوك في البرازيل");
  assert.equal(bridgeCostFactor(s, "br"), 0.8);
  assert.equal(bridgeIncomeFactor(s, "br"), 1.15);
  empire.ownedClubs.push({ clubId: brClub2.id, ownership: 60, value: 30_000_000, control: false });
  assert.equal(bridgeCostFactor(s, "br"), 0.6, "الخصم يسقف عند 40%");
  assert.equal(bridgeIncomeFactor(s, "br"), 1.3, "العائد يسقف عند 30%");
  const marketBr = branchMarket("br");
  const qBridge = branchQuote(s, "br", 1);
  assert.ok(Math.abs(qBridge.cost / (8_000_000 + marketBr.level * 550_000) - 0.6) < 0.01);
  const marketJp = branchMarket("jp");
  const qNoBridge = branchQuote(s, "jp", 1);
  assert.equal(qNoBridge.cost, Math.round((8_000_000 + marketJp.level * 550_000) / 100_000) * 100_000);
  validateSave(s);
});

test("كتالوج الفروع: ثلاث لغات لكل ميزة وقرار، وأرقام لاتينية فقط", () => {
  for (const [, ids] of Object.entries(COUNTRY_EDGE))
    for (const id of ids) assert.ok(branchMarket(id), id);
  const texts = JSON.stringify({ COUNTRY_EDGE, BRANCH_DECISIONS });
  assert.ok(!/[\u0660-\u0669\u06F0-\u06F9]/.test(texts), "أرقام لاتينية فقط");
  for (const d of BRANCH_DECISIONS) {
    assert.ok(d.name.ar && d.name.en && d.name.fr && d.note.ar && d.note.en && d.note.fr);
    assert.ok(d.costLevel > 0 && d.days > 0);
  }
});
