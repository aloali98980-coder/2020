// اختبارات «لائحة الجمعية العمومية 0.26» — المرحلة السادسة من تحديث الدراما.
//
// ما يُثبته هذا الملف:
//   ١) توليد اللائحة: ثلاثة محاور دائمًا، والأهداف تتصاعد مع حجم النادي وطموحه،
//      والبنود المشروطة (كأس/قاري/بيع لاعب/تعاقد شاب) لا تظهر إلا حين تكون مناسبة وقابلة للقياس.
//   ٢) التتبع الحي: كل بند من الأنواع العشرة يُقاس من الحفظة نفسها ويتحول إلى «محقق» عند بلوغ هدفه.
//   ٣) الاجتماعان: مراجعة المنتصف (ثقة أو إنذار أصفر رسمي بمهلة) والتصويت النهائي.
//   ٤) سلم العواقب: مكافآت حقيقية عند التنفيذ الكامل، وتحذير نهائي عند الإخفاق الجزئي،
//      وعواقب متدرجة (ميزانية/تجميد/راعٍ/احتجاج) عند الإخفاق الكبير — بسقف ثابت لا يتجاوزه.
//   ٥) قيد اللعبة الصارم: المالك لا يُقال — لا مسار واحد ينهي المسيرة مهما تكرر الإخفاق.
//   ٦) الربط بالقائم: التجميد يمنع التعاقدات ولا يمنع البيع، والبريد والحفظة يبقيان سليمين.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import { addDays } from "../src/core/utils.js";
import { post } from "../src/services/finance.js";
import { pendingActions } from "../src/services/inbox.js";
import { submitOffer, signPlayer } from "../src/services/transfers.js";
import { answerBid } from "../src/services/clubManagement.js";
import {
  CLUB_SIZES,
  ITEM_KINDS,
  buildMandate,
  sizeOf,
  stepDown,
} from "../src/data/boardMandates.js";
import { BOARD_TEXTS } from "../src/data/boardTexts.js";
import {
  MAX_LADDER_TIER,
  seasonNet,
  MIN_WAGE_BUDGET,
  activeMandate,
  assertTransfersAllowed,
  boardDay,
  endSeasonBoardReview,
  evaluateMandate,
  freezeBadgeText,
  initBoard,
  ladderFor,
  midSeasonReview,
  startSeasonMandate,
  transferFrozen,
} from "../src/services/boardMandate.js";
import { getLanguage, setLanguage, translateText } from "../src/i18n/index.js";

const ARABIC = /[ء-ي]/;
const demo = (clubId = "masry") => createGame({ clubId, database: "demo" });
const world = (clubId = "ahly") => createGame({ clubId, database: "world", expanded: true, leagues: ["eg"] });
// الرصيد وكشف الحساب متطابقان دائمًا (initialCash + Σ ledger === cash).
let seq = 0;
const setCash = (s, amount) => {
  const delta = amount - s.finance.cash;
  if (delta)
    post(s, delta, "operations", "تسوية اختبارية", `test-cash-${++seq}`);
  return s;
};
const spend = (s, amount) =>
  post(s, -amount, "operations", "مصروف اختباري", `test-spend-${++seq}`);
const earn = (s, amount, category = "operations", key = `test-earn-${++seq}`) =>
  post(s, amount, category, "دخل اختباري", key);

// ── أدوات بناء الحالات ──────────────────────────────────────────────────────
const itemOf = (mandate, id) => mandate.items.find((it) => it.id === id);
const progressOf = (s, mandate, id) =>
  evaluateMandate(s, mandate).items.find((it) => it.id === id);
const rankFirst = (s, first = true) => {
  for (const row of s.table) row.points = row.clubId === s.clubId ? (first ? 40 : 1) : first ? 1 : 40;
  return s;
};
const growYouth = (s, minutes) => {
  const young = s.players.filter(
    (p) => p.clubId === s.clubId && p.status !== "retired" && p.age <= 21,
  );
  if (!young.length) return null;
  young[0].seasonMinutes = minutes;
  return young[0];
};
const buildFacility = (s) => {
  s.facilities[0].level += 1;
  return s.facilities[0];
};
const signYoungSigning = (s) => {
  const template = s.players.find((p) => p.clubId === s.clubId);
  s.players.push({
    ...structuredClone(template),
    id: "test-young-signing",
    name: "ناشئ متعاقد",
    clubId: s.clubId,
    age: 19,
    status: "active",
  });
};
// يُحقق كل بنود اللائحة القابلة للتحقيق في هذه الحفظة.
const satisfyAll = (s, mandate) => {
  rankFirst(s);
  for (const item of mandate.items) {
    if (item.kind === "player-sale") earn(s, item.target, "player-sale", "test-sale");
    if (item.kind === "youth-minutes") growYouth(s, item.target);
    if (item.kind === "facility-project") buildFacility(s);
    if (item.kind === "young-signing") signYoungSigning(s);
    if (item.kind === "cup-ties" || item.kind === "continental-stage") {
      const cup = s.expansion.cups.find((c) =>
        item.kind === "cup-ties"
          ? String(c.id).startsWith("cup-") && c.entrants?.includes(s.clubId)
          : !String(c.id).startsWith("cup-") &&
            !String(c.id).startsWith("super-") &&
            c.entrants?.includes(s.clubId),
      );
      const rival = s.table.find((t) => t.clubId !== s.clubId).clubId;
      for (let i = 0; i < item.target; i++)
        cup.ties.push({
          id: `test-tie-${i}`,
          a: s.clubId,
          b: rival,
          winner: s.clubId,
          round: i,
          stage: "r16",
        });
    }
  }
  return s;
};
const failAll = (s) => {
  rankFirst(s, false);
  setCash(s, 0);
  spend(s, 5000000);
  return s;
};
// يكسر بند سقف العجز وحده: يصرف حتى يتجاوز الهدف مهما كان صافي الموسم الجاري.
const breakDeficit = (s, mandate) => {
  const cap = itemOf(mandate, "deficit-cap").target;
  const net = seasonNet(s, mandate.startDate);
  return spend(s, Math.max(0, net) + cap + 1000);
};

// ═══ ١) التوليد حسب حجم النادي وطموحه ═══════════════════════════════════════
test("حجم النادي مشتق من السمعة ويتدرج بالترتيب", () => {
  assert.equal(sizeOf(40), "small");
  assert.equal(sizeOf(CLUB_SIZES.medium.minRep), "medium");
  assert.equal(sizeOf(CLUB_SIZES.large.minRep), "large");
  assert.equal(sizeOf(CLUB_SIZES.giant.minRep), "giant");
  assert.equal(sizeOf(99), "giant");
  // الطموح ينزل درجة بعد الإخفاق ولا يخرج من السلم.
  assert.equal(stepDown("elite"), "ambitious");
  assert.equal(stepDown("ambitious"), "stable");
  assert.equal(stepDown("stable"), "survival");
  assert.equal(stepDown("survival"), "rebuild");
});

test("كل لائحة تحمل المحاور الثلاثة وبنودًا صالحة قابلة للقياس", () => {
  for (const rep of [40, 60, 74, 90]) {
    const s = demo();
    s.reputation = rep;
    const m = buildMandate(s, {
      seasonNumber: 1,
      startDate: s.date,
      endDate: s.nextSeasonDate,
      ambition: "stable",
    });
    const axes = new Set(m.items.map((it) => it.axis));
    assert.deepEqual([...axes].sort(), ["development", "financial", "sporting"]);
    assert.ok(m.items.length >= 5 && m.items.length <= 12);
    for (const it of m.items) {
      assert.equal(it.axis, ITEM_KINDS[it.kind].axis);
      assert.ok(Number.isSafeInteger(it.target) && it.target > 0, it.kind);
      assert.equal(typeof it.critical, "boolean");
    }
    assert.ok(m.startDate <= m.midDate && m.midDate <= m.endDate);
    assert.ok(m.baseline.youthIds.length >= 0);
  }
});

test("النادي الأكبر يُطلب منه ما لا يُطلب من الأصغر (نفس الطموح)", () => {
  const mandate = (rep) => {
    const s = demo();
    s.reputation = rep;
    return buildMandate(s, {
      seasonNumber: 1,
      startDate: s.date,
      endDate: s.nextSeasonDate,
      ambition: "stable",
    });
  };
  const small = mandate(40),
    giant = mandate(90);
  assert.equal(small.size, "small");
  assert.equal(giant.size, "giant");
  assert.ok(
    itemOf(giant, "league-rank").target < itemOf(small, "league-rank").target,
    "العملاق مطالب بمركز أعلى",
  );
  assert.ok(
    itemOf(giant, "youth-minutes").target > itemOf(small, "youth-minutes").target,
    "العملاق مطالب بدقائق ناشئين أكثر",
  );
});

test("الطموح الأعلى يشدّ الأهداف ولا يخرج عن حدود الجدول", () => {
  const at = (ambition) => {
    const s = demo();
    s.reputation = 74;
    return buildMandate(s, {
      seasonNumber: 1,
      startDate: s.date,
      endDate: s.nextSeasonDate,
      ambition,
    });
  };
  assert.ok(
    itemOf(at("elite"), "league-rank").target <= itemOf(at("survival"), "league-rank").target,
  );
  assert.ok(itemOf(at("elite"), "league-rank").target >= 1);
  assert.ok(itemOf(at("survival"), "league-rank").target <= 8);
  assert.ok(itemOf(at("rebuild"), "league-rank").target >= 1);
});

test("البنود المشروطة تظهر حين تكون قابلة للقياس فقط", () => {
  const base = demo();
  const baseMandate = buildMandate(base, {
    seasonNumber: 1,
    startDate: base.date,
    endDate: base.nextSeasonDate,
    ambition: "stable",
  });
  // الوضع التجريبي بلا كؤوس: لا بند كأس ولا بند قاري (لا شيء يُقاس).
  assert.equal(baseMandate.items.some((it) => it.kind === "cup-ties"), false);
  assert.equal(baseMandate.items.some((it) => it.kind === "continental-stage"), false);
  assert.equal(baseMandate.items.some((it) => it.kind === "continental-qualify"), false);

  // الوضع الموسّع: الكأس موجودة، والمشارك قاريًا يُطالب بمواجهة إقصائية.
  const w = world();
  const worldMandate = buildMandate(w, {
    seasonNumber: 1,
    startDate: w.date,
    endDate: w.nextSeasonDate,
    ambition: "ambitious",
  });
  assert.ok(worldMandate.items.some((it) => it.kind === "cup-ties"));
  assert.ok(
    worldMandate.items.some(
      (it) => it.kind === "continental-stage" || it.kind === "continental-qualify",
    ),
  );
});

test("التوليد حتمي: نفس الحفظة ونفس الموسم = نفس اللائحة", () => {
  const options = (s) => ({
    seasonNumber: 1,
    startDate: s.date,
    endDate: s.nextSeasonDate,
    ambition: "stable",
  });
  const a = demo(),
    b = demo();
  const m1 = buildMandate(a, options(a)),
    m2 = buildMandate(b, options(b));
  assert.deepEqual(
    m1.items.map((x) => [x.id, x.target]),
    m2.items.map((x) => [x.id, x.target]),
  );
  assert.equal(m1.midDate, m2.midDate);
  // بيع اللاعب «أحيانًا»: موجود في بعض المواسم لا كلها، وقراره ثابت لا عشوائي.
  const spread = [1, 2, 3, 4, 5, 6].map((season) =>
    buildMandate(a, { ...options(a), seasonNumber: season }).items.some(
      (x) => x.kind === "player-sale",
    ),
  );
  assert.ok(spread.some(Boolean) && spread.some((x) => !x), "البند المشروط يتغير بين المواسم");
});

// ═══ ٢) التتبع الحي لكل بند ═════════════════════════════════════════════════
test("بند مركز الدوري يُقاس حيًا من الجدول", () => {
  const s = demo();
  const m = activeMandate(s);
  assert.ok(progressOf(s, m, "league-rank").current > 1);
  rankFirst(s);
  const p = progressOf(s, m, "league-rank");
  assert.equal(p.current, 1);
  assert.equal(p.done, true);
  assert.equal(p.ratio, 1);
});

test("البندان الماليان: سقف العجز والسيولة", () => {
  const s = demo();
  const m = activeMandate(s);
  const cap = itemOf(m, "deficit-cap").target;
  const floor = itemOf(m, "min-liquidity").target;
  assert.equal(progressOf(s, m, "deficit-cap").done, true, "البداية بلا عجز");
  breakDeficit(s, m);
  assert.equal(progressOf(s, m, "deficit-cap").done, false, "تجاوز سقف العجز");
  setCash(s, floor - 1);
  assert.equal(progressOf(s, m, "min-liquidity").done, false);
  setCash(s, floor + 1);
  assert.equal(progressOf(s, m, "min-liquidity").done, true);
});

test("بند بيع اللاعب يُقاس من قيود البيع الفعلية", () => {
  const s = demo();
  const m = buildMandate(s, {
    seasonNumber: 1,
    startDate: s.date,
    endDate: s.nextSeasonDate,
    ambition: "stable",
  });
  const sale = {
    id: "player-sale",
    kind: "player-sale",
    axis: "financial",
    target: 2000000,
    critical: false,
  };
  assert.equal(progressOf(s, { ...m, items: [sale] }, "player-sale").done, false);
  earn(s, 2000000, "player-sale", "test-sale-ok");
  assert.equal(progressOf(s, { ...m, items: [sale] }, "player-sale").done, true);
});

test("دقائق الناشئين ومشروع المنشأة والتعاقد الشاب", () => {
  const s = demo();
  const m = activeMandate(s);
  const minutes = itemOf(m, "youth-minutes").target;
  assert.equal(progressOf(s, m, "youth-minutes").done, false);
  growYouth(s, minutes);
  assert.equal(progressOf(s, m, "youth-minutes").done, true);

  assert.equal(progressOf(s, m, "facility-project").done, false);
  buildFacility(s);
  assert.equal(progressOf(s, m, "facility-project").done, true);

  // بند التعاقد الشاب موجود فقط عندما يقل الناشئون عن ثلاثة.
  const needYouth = buildMandate(s, {
    seasonNumber: 7,
    startDate: s.date,
    endDate: s.nextSeasonDate,
    ambition: "stable",
  });
  if (needYouth.items.some((it) => it.kind === "young-signing")) {
    assert.equal(progressOf(s, needYouth, "young-signing").done, false);
    signYoungSigning(s);
    assert.equal(progressOf(s, needYouth, "young-signing").done, true);
  }
});

test("بنود الكأس والقارة تُقاس من مواجهات محسومة لصالحنا", () => {
  const s = world();
  const m = buildMandate(s, {
    seasonNumber: 1,
    startDate: s.date,
    endDate: s.nextSeasonDate,
    ambition: "ambitious",
  });
  const rival = s.table.find((t) => t.clubId !== s.clubId).clubId;
  const domestic = s.expansion.cups.find(
    (c) => String(c.id).startsWith("cup-") && c.entrants.includes(s.clubId),
  );
  const target = itemOf(m, "cup-ties")?.target;
  assert.ok(domestic && target >= 1);
  assert.equal(progressOf(s, m, "cup-ties").done, false);
  domestic.ties.push({
    id: "t1",
    a: s.clubId,
    b: rival,
    winner: s.clubId,
    round: 0,
    stage: "r16",
  });
  assert.equal(progressOf(s, m, "cup-ties").done, target <= 1);
  // خسارة مواجهة لا تُحتسب.
  domestic.ties.push({
    id: "t2",
    a: s.clubId,
    b: rival,
    winner: rival,
    round: 1,
    stage: "qf",
  });
  assert.equal(progressOf(s, m, "cup-ties").current, 1);
});

// ═══ ٣) اجتماع منتصف الموسم ═════════════════════════════════════════════════
test("منتصف الموسم: التزام جيد = رسالة ثقة ودفعة جماهيرية بلا توقيف للزمن", () => {
  const s = demo();
  const m = activeMandate(s);
  satisfyAll(s, m);
  s.date = m.midDate;
  const beforeFan = s.fanSupport,
    beforeConfidence = s.board.confidence;
  const rec = boardDay(s);
  assert.equal(rec.status, "trust");
  assert.equal(m.review.mid.good, true);
  assert.ok(s.fanSupport > beforeFan);
  assert.ok(s.board.confidence > beforeConfidence);
  const msg = s.inbox.find((x) => x.kind === "board-mid");
  assert.ok(msg && msg.required === false, "رسالة الثقة لا توقف الزمن");
  // مرة واحدة بالضبط، والنداء اليومي بعدها لا يكرر شيئًا.
  const messages = s.inbox.filter((x) => x.kind.startsWith("board-")).length;
  assert.equal(boardDay(s), null);
  assert.equal(s.inbox.filter((x) => x.kind.startsWith("board-")).length, messages);
  validateSave(s);
});

test("منتصف الموسم: التأخر = إنذار أصفر رسمي بمهلة حتى التصويت النهائي", () => {
  const s = demo();
  const m = activeMandate(s);
  failAll(s);
  s.date = m.midDate;
  const rec = boardDay(s);
  assert.equal(rec.status, "warning");
  const msg = s.inbox.find((x) => x.kind === "board-warning");
  assert.ok(msg, "الإنذار الرسمي يصل بالبريد");
  assert.equal(msg.deadline, m.endDate);
  assert.equal(msg.required, false);
  assert.equal(msg.priority, "high");
  assert.ok(msg.body.includes(m.endDate), "نص الإنذار يذكر المهلة");
  validateSave(s);
});

// ═══ ٤) التصويت النهائي وسلم العواقب ════════════════════════════════════════
test("التنفيذ الكامل = مكافآت حقيقية: دعم مستثمرين + ميزانية أكبر + حب جماهيري", () => {
  const s = demo();
  const m = activeMandate(s);
  satisfyAll(s, m);
  const beforeFan = s.fanSupport,
    beforeConfidence = s.board.confidence,
    budget = s.finance.wageBudget;
  assert.equal(evaluateMandate(s, m).status, "passed");
  const rec = endSeasonBoardReview(s);
  assert.equal(rec.status, "passed");
  const support = s.finance.ledger.find((e) => e.category === "board-support");
  assert.ok(support && support.amount > 0, "دعم مالي حقيقي في الدفاتر");
  assert.ok(s.board.pendingBoost > 0);
  assert.ok(s.fanSupport > beforeFan && s.board.confidence > beforeConfidence);
  assert.equal(s.board.mandate, null, "اللائحة المنتهية تُغلق");
  // المكافأة تصل عند بداية الموسم القادم: ميزانية تعاقدات أكبر.
  s.seasonNumber += 1;
  s.date = addDays(s.date, 1);
  startSeasonMandate(s);
  assert.ok(s.finance.wageBudget > budget, "ميزانية الموسم القادم أكبر فعلًا");
  assert.equal(s.board.pendingBoost, 0);
  assert.ok(activeMandate(s), "لائحة جديدة صدرت");
  validateSave(s);
});

test("الإخفاق الجزئي = تحذير نهائي بلا عقوبات تنفيذية", () => {
  const s = demo();
  const m = activeMandate(s);
  satisfyAll(s, m);
  // بند حاسم واحد يسقط (سقف العجز) وكل ما عداه محقق → جزئي لا كبير.
  breakDeficit(s, m);
  const e = evaluateMandate(s, m);
  assert.equal(e.status, "partial");
  const beforeBudget = s.finance.wageBudget,
    beforeFan = s.fanSupport;
  const rec = endSeasonBoardReview(s);
  assert.equal(rec.status, "partial");
  assert.equal(s.finance.wageBudget, beforeBudget, "لا تقليص في الإخفاق الجزئي");
  assert.equal(s.board.freezeUntil, null, "لا تجميد في الإخفاق الجزئي");
  assert.equal(s.fanSupport, beforeFan);
  assert.equal(s.board.failureStreak, 0);
  const msg = s.inbox.find((x) => x.kind === "board-vote");
  assert.ok(msg && msg.required === false);
  validateSave(s);
});

test("سلم العواقب يتدرج ثم يتوقف عند سقفه ولا يتجاوزه أبدًا", () => {
  assert.equal(ladderFor(1).tier, 1);
  assert.equal(ladderFor(2).tier, 2);
  assert.equal(ladderFor(3).tier, 3);
  assert.equal(ladderFor(9).tier, MAX_LADDER_TIER, "لا درجة رابعة مهما تكرر الإخفاق");
  assert.ok(ladderFor(9).wageCut <= 0.25);
});

test("الإخفاق الكبير: تقليص ميزانية + تجميد تعاقدات + احتجاج جماهيري", () => {
  const s = demo();
  const m = activeMandate(s);
  failAll(s);
  assert.equal(evaluateMandate(s, m).status, "failed");
  const budget = s.finance.wageBudget,
    fan = s.fanSupport;
  const rec = endSeasonBoardReview(s);
  assert.equal(rec.status, "failed");
  assert.equal(rec.tier, 1);
  assert.ok(s.finance.wageBudget < budget, "تقليص ميزانية المرتبات");
  assert.ok(s.finance.wageBudget >= MIN_WAGE_BUDGET);
  assert.equal(s.board.freezeUntil, addDays(s.date, 60));
  assert.ok(s.fanSupport < fan, "احتجاج جماهيري");
  assert.equal(s.board.failureStreak, 1);
  assert.equal(s.board.nextRebuild, true, "الموسم القادم إعادة بناء");
  assert.ok(rec.effects.some((x) => x.kind === "freeze"));
  assert.ok(rec.effects.some((x) => x.kind === "protest"));
  validateSave(s);
});

test("الدرجة الثانية تسحب راعيًا وتُلغي دفعاته المتبقية", () => {
  const s = demo();
  const mandate = activeMandate(s);
  assert.ok(s.sponsors.length > 0, "البداية بعقد رعاية");
  const contract = s.sponsors.find((c) => c.status === "active");
  const pendingBefore = s.finance.obligations.filter(
    (o) => o.ref === contract.id && o.status === "pending",
  ).length;
  assert.ok(pendingBefore > 0);
  failAll(s);
  breakDeficit(s, mandate);
  s.board.failureStreak = 1; // إخفاق سابق ⇒ هذه الدرجة الثانية
  const rec = endSeasonBoardReview(s);
  assert.equal(rec.tier, 2);
  assert.ok(rec.effects.some((x) => x.kind === "sponsor-out"), "انسحاب راعٍ");
  assert.equal(contract.status, "expired");
  assert.equal(
    s.finance.obligations.filter((o) => o.ref === contract.id && o.status === "pending").length,
    0,
    "لا دخل مقابل لا ظهور",
  );
  validateSave(s);
});

test("التجميد يمنع فتح التعاقدات ولا يمنع بيع لاعبك", () => {
  const s = world();
  const m = activeMandate(s);
  failAll(s);
  endSeasonBoardReview(s);
  assert.equal(transferFrozen(s), true);
  assert.equal(freezeBadgeText(s).length > 0, true);
  assert.throws(() => assertTransfersAllowed(s), /تجميد/);
  const target = s.players.find((p) => p.clubId !== s.clubId && p.status !== "retired");
  assert.throws(() => submitOffer(s, target.id, { fee: 100000, upfrontPercent: 40 }), /تجميد/);
  // البيع مسموح: هو أداة النادي للخروج من الأزمة المالية.
  const mine = s.players.find((p) => p.clubId === s.clubId && p.status !== "retired");
  s.management.outgoing.push({
    id: "bid-test",
    playerId: mine.id,
    buyer: s.table.find((t) => t.clubId !== s.clubId).clubId,
    fee: 2000000,
    expires: addDays(s.date, 7),
    status: "open",
  });
  answerBid(s, "bid-test", true);
  assert.equal(mine.clubId !== s.clubId, true, "البيع أُنجز أثناء التجميد");
  assert.ok(s.finance.ledger.some((e) => e.category === "player-sale"));
  // بانتهاء المهلة يعود السوق طبيعيًا.
  s.date = addDays(s.board.freezeUntil, 1);
  assert.equal(transferFrozen(s), false);
  assert.doesNotThrow(() => assertTransfersAllowed(s));
  assert.ok(m);
});

// ═══ ٥) قيد اللعبة: المالك لا يُقال ═════════════════════════════════════════
test("خمسة مواسم إخفاق متتالية: لا إنهاء للمسيرة ولا مسّ بالملكية", () => {
  const s = demo();
  const owner = s.owner,
    clubId = s.clubId;
  for (let season = 1; season <= 5; season++) {
    const m = activeMandate(s);
    assert.ok(m, `لائحة الموسم ${season} صدرت`);
    failAll(s);
    s.date = addDays(s.date, 1);
    const rec = endSeasonBoardReview(s);
    assert.equal(rec.status, "failed");
    assert.ok(rec.tier <= MAX_LADDER_TIER);
    assert.ok(s.finance.wageBudget >= MIN_WAGE_BUDGET, "الميزانية لا تنزل عن الحد الأدنى");
    assert.ok(s.board.confidence >= 0);
    // لائحة جديدة تُصدر دائمًا مع الموسم الجديد: لا موت إداري.
    s.seasonNumber += 1;
    const next = startSeasonMandate(s);
    assert.ok(next && next.items.length >= 5);
    assert.equal(next.ambition, "rebuild", "اللائحة القادمة إعادة بناء لا تصعيد");
  }
  assert.equal(s.owner, owner, "المالك كما هو");
  assert.equal(s.clubId, clubId, "النادي كما هو");
  assert.equal(s.gameOver, undefined);
  assert.equal(s.fired, undefined);
  assert.ok(s.table.some((t) => t.clubId === clubId), "النادي ما زال في الجدول");
  assert.ok(s.players.some((p) => p.clubId === clubId), "الفريق ما زال موجودًا");
  assert.equal(pendingActions(s).filter((m) => m.required).length, 0);
  validateSave(s);
});

// ═══ ٦) الحفظة والترحيل والتحقق ═════════════════════════════════════════════
test("حفظة 0.25 (النسخة 20) تُرحَّل إلى 22 بحالة مجلس وملفات سوداء سليمة", () => {
  const old = demo();
  old.version = 20;
  delete old.board;
  const migrated = migrateSave(old);
  assert.equal(migrated.version, 22);
  assert.ok(migrated.board && migrated.board.schema === 1);
  assert.equal(migrated.board.confidence, 60);
  assert.equal(migrated.board.mandate, null);
  assert.equal(migrated.board.freezeUntil, null);
  assert.match(migrated.migrationNote || "", /الجمعية العمومية 0.26/);
  validateSave(migrated);
});

test("التحقق يرفض مجلسًا معدّلًا يدويًا خارج الحدود", () => {
  const bad = demo();
  bad.board.confidence = 150;
  assert.throws(() => validateSave(bad), /الجمعية العمومية/);

  const badTier = demo();
  badTier.board.history.push({
    season: 1,
    date: badTier.date,
    status: "failed",
    done: 0,
    total: 5,
    tier: MAX_LADDER_TIER + 1,
    effects: [],
  });
  assert.throws(() => validateSave(badTier), /سجل لائحة/);

  const badItem = demo();
  badItem.board.mandate.items[0].kind = "league-rank";
  badItem.board.mandate.items[0].axis = "financial";
  assert.throws(() => validateSave(badItem), /لائحة الجمعية العمومية/);

  const noBoard = demo();
  delete noBoard.board;
  assert.throws(() => validateSave(noBoard), /الجمعية العمومية/);
});

test("تهيئة المجلس تحفظ الشكل الكامل وتُصدر لائحة الموسم الأول", () => {
  const s = demo();
  initBoard(s);
  assert.equal(s.board.schema, 1);
  assert.deepEqual(s.board.history, []);
  assert.equal(s.board.mandate, null);
  const m = startSeasonMandate(s);
  assert.ok(m && m.season === s.seasonNumber);
  assert.equal(s.board.mandate.id, m.id);
  assert.ok(s.inbox.some((x) => x.kind === "board-mandate"));
  validateSave(s);
});

test("بداية موسم جديد لا تُصدر لائحة ثانية فوق القائمة", () => {
  const s = demo();
  const m = activeMandate(s);
  const again = startSeasonMandate(s);
  assert.equal(again.id, m.id, "نفس اللائحة القائمة");
});

// ═══ ٧) ثلاث لغات ═══════════════════════════════════════════════════════════
test("كل نصوص اللائحة لها إنجليزي وفرنسي بلا بقايا عربية", () => {
  const previous = getLanguage();
  try {
    const arabic = Object.values(BOARD_TEXTS).map((t) => t.ar);
    assert.ok(arabic.length >= 80);
    for (const code of ["en", "fr"]) {
      setLanguage(code);
      for (const [key, entry] of Object.entries(BOARD_TEXTS)) {
        assert.ok(entry.ar && entry.en && entry.fr, `${key} ناقص لغة`);
        const translated = translateText(entry.ar);
        assert.ok(
          !ARABIC.test(translated),
          `${key} (${code}) ما زال عربيًا: ${translated}`,
        );
      }
    }
  } finally {
    setLanguage(previous);
  }
});
