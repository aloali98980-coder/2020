// محرك «لائحة الجمعية العمومية» 0.26 — التتبع الحي، واجتماعا المنتصف والنهاية، وسلم العواقب.
//
// قيد التصميم الصارم (هوية اللعبة): **المالك لا يُقال أبدًا**. كل عاقبة هنا مالية
// (ميزانية/تجميد تعاقدات/راعٍ) أو جماهيرية أو إدارية، ولا يوجد في هذا الملف أي مسار
// يحذف النادي أو ينهي المسيرة. سلم العواقب يتوقف عند درجة قصوى (MAX_LADDER_TIER)
// ولائحة الموسم التالي تُبنى على «إعادة البناء» لا على تصعيد عقابي لا نهائي.
//
// الأداء: لا شيء هنا يمرّ على قائمة اللاعبين كاملة إلا نصاب الناشئين ودقائقهم
// (وكلاهما مرشَّح بـ clubId في الملفات الصغيرة)، والتقييم نفسه يعمل مرة واحدة
// في منتصف الموسم ومرة عند التصويت النهائي — لا في كل يوم.
import { addDays, clamp, uid } from "../core/utils.js";
import { message } from "./inbox.js";
import { post } from "./finance.js";
import {
  AXES,
  ITEM_KINDS,
  MANDATE_SCHEMA,
  baseAmbition,
  buildMandate,
  isContinentalCup,
  isDomesticCup,
  sizeOf,
} from "../data/boardMandates.js";
import { boardTextAr } from "../data/boardTexts.js";
import { money, num } from "../ui/format.js";

export const BOARD_CATEGORY = "board";
// عتبات التصويت: تنفيذ كامل = كل البنود الحاسمة + ٨٥٪ من الوزن الموزون.
// إخفاق جزئي = البنود الحاسمة تحققت أو ٦٠٪ وزنًا. إخفاق كبير = غير ذلك.
export const PASS_SCORE = 0.85;
export const PARTIAL_SCORE = 0.6;
// اجتماع المنتصف: ثقة إن بلغ الإيقاع ٦٠٪ من الوزن، وإلا إنذار أصفر رسمي.
export const MID_GOOD_SCORE = 0.6;
// سقف سلم العواقب: لا درجة رابعة ولا إنهاء مسيرة.
export const MAX_LADDER_TIER = 3;
export const MIN_WAGE_BUDGET = 1000000;
export const MAX_HISTORY = 30;

export const CONSEQUENCE_LADDER = [
  { tier: 1, wageCut: 0.1, freezeDays: 60, sponsorsOut: 0, fanDrop: 6, repDrop: 1 },
  { tier: 2, wageCut: 0.15, freezeDays: 90, sponsorsOut: 1, fanDrop: 10, repDrop: 2 },
  { tier: 3, wageCut: 0.2, freezeDays: 120, sponsorsOut: 1, fanDrop: 12, repDrop: 2 },
];
export const REWARDS = { confidence: 12, cashShare: 0.12, boost: 0.15, fanLift: 5, repLift: 1 };
export const MID_TRUST = { confidence: 3, fanLift: 2 };
export const PARTIAL_PENALTY = { confidence: 6 };

// ── التهيئة ─────────────────────────────────────────────────────────────────
export function initBoard(s) {
  s.board = {
    schema: MANDATE_SCHEMA,
    confidence: 60,
    failureStreak: 0,
    successStreak: 0,
    freezeUntil: null,
    wageFactor: 1,
    pendingBoost: 0,
    nextRebuild: false,
    mandate: null,
    history: [],
    meetings: [],
  };
  return s.board;
}
export const ensureBoard = (s) => s.board || initBoard(s);
export const activeMandate = (s) => s.board?.mandate || null;

// ── قياسات حية من الحفظة (كلها مشتقة، بلا حقول مكررة) ───────────────────────
export const seasonNet = (s, from) =>
  s.finance.ledger
    .filter((e) => e.date >= from)
    .reduce((n, e) => n + e.amount, 0);
export const saleProceeds = (s, from) =>
  s.finance.ledger
    .filter((e) => e.date >= from && e.category === "player-sale")
    .reduce((n, e) => n + Math.max(0, e.amount), 0);
export const currentRank = (s) => {
  const rows = [...(s.table || [])].sort(
    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf,
  );
  return rows.findIndex((t) => t.clubId === s.clubId) + 1 || rows.length;
};
// مواجهة إقصائية محسومة لصالحنا: المحركات الحديثة تسجّلها في c.ties،
// والكؤوس القديمة (بلا محرك) تسجّلها في c.results مع حقل winner.
export function cupTiesWon(s, predicate) {
  let won = 0;
  for (const c of s.expansion?.cups || []) {
    if (!predicate(c)) continue;
    for (const t of c.ties || [])
      if (t.winner === s.clubId && (t.a === s.clubId || t.b === s.clubId)) won++;
    for (const f of c.results || [])
      if (f.winner === s.clubId && (f.home === s.clubId || f.away === s.clubId))
        won++;
  }
  return won;
}
export const ownYouth = (s) =>
  s.players.filter(
    (p) => p.clubId === s.clubId && p.status !== "retired" && p.age <= 21,
  );
export const youthMinutes = (s) =>
  ownYouth(s).reduce((n, p) => n + (p.seasonMinutes || 0), 0);
export const completedProjects = (s, baseline) =>
  (s.facilities || []).filter(
    (f) => f.level > (baseline?.facilityLevels?.[f.id] ?? f.level),
  ).length;
export const signedYoung = (s, baseline) => {
  const known = new Set(baseline?.youthIds || []);
  return ownYouth(s).filter((p) => !known.has(p.id)).length;
};

// ── تتبّع بند واحد ──────────────────────────────────────────────────────────
export function itemProgress(s, item, mandate) {
  const from = mandate.startDate;
  const ratio = (current, target, done) =>
    done ? 1 : clamp(target > 0 ? current / target : 1, 0, 1);
  switch (item.kind) {
    case "no-scandal": {
      const scandalThisSeason = (s.blackFiles?.history || []).some((h) => h.date >= from);
      const done = !scandalThisSeason;
      return { current: scandalThisSeason ? 1 : 0, target: 1, done, ratio: done ? 1 : 0 };
    }
    case "league-rank":
    case "continental-qualify": {
      const rank = currentRank(s);
      const done = rank <= item.target;
      return {
        current: rank,
        target: item.target,
        done,
        ratio: done ? 1 : clamp(item.target / Math.max(1, rank), 0, 1),
      };
    }
    case "cup-ties":
    case "continental-stage": {
      const won = cupTiesWon(
        s,
        item.kind === "cup-ties" ? isDomesticCup : isContinentalCup,
      );
      const done = won >= item.target;
      return { current: won, target: item.target, done, ratio: ratio(won, item.target, done) };
    }
    case "deficit-cap": {
      const deficit = Math.max(0, -seasonNet(s, from));
      const done = deficit <= item.target;
      return { current: deficit, target: item.target, done, ratio: ratio(deficit, item.target, done) };
    }
    case "min-liquidity": {
      const cash = s.finance.cash;
      const done = cash >= item.target;
      return { current: cash, target: item.target, done, ratio: ratio(Math.max(0, cash), item.target, done) };
    }
    case "player-sale": {
      const got = saleProceeds(s, from);
      const done = got >= item.target;
      return { current: got, target: item.target, done, ratio: ratio(got, item.target, done) };
    }
    case "youth-minutes": {
      const mins = youthMinutes(s);
      const done = mins >= item.target;
      return { current: mins, target: item.target, done, ratio: ratio(mins, item.target, done) };
    }
    case "facility-project": {
      const n = completedProjects(s, mandate.baseline);
      const done = n >= item.target;
      return { current: n, target: item.target, done, ratio: ratio(n, item.target, done) };
    }
    case "young-signing": {
      const n = signedYoung(s, mandate.baseline);
      const done = n >= item.target;
      return { current: n, target: item.target, done, ratio: ratio(n, item.target, done) };
    }
    default:
      return { current: 0, target: item.target ?? 1, done: false, ratio: 0 };
  }
}

// ── التقييم الكامل: بنود جاهزة للعرض + وزن + حالة ───────────────────────────
export function evaluateMandate(s, mandate = activeMandate(s)) {
  if (!mandate) return null;
  const items = mandate.items.map((it) => ({
    ...it,
    ...ITEM_KINDS[it.kind],
    ...itemProgress(s, it, mandate),
  }));
  const weight = (it) => (it.critical ? 2 : 1);
  const totalWeight = items.reduce((n, it) => n + weight(it), 0) || 1;
  const earned = items.reduce((n, it) => n + weight(it) * it.ratio, 0);
  const score = earned / totalWeight;
  const done = items.filter((it) => it.done).length;
  const criticalMissing = items.filter((it) => it.critical && !it.done);
  const status =
    !criticalMissing.length && score >= PASS_SCORE
      ? "passed"
      : !criticalMissing.length || score >= PARTIAL_SCORE
        ? "partial"
        : "failed";
  return {
    items,
    score,
    done,
    total: items.length,
    criticalMissing,
    status,
    byAxis: Object.fromEntries(
      AXES.map((axis) => {
        const list = items.filter((it) => it.axis === axis);
        return [
          axis,
          { items: list, done: list.filter((it) => it.done).length, total: list.length },
        ];
      }),
    ),
  };
}

// ── إصدار لائحة موسم ────────────────────────────────────────────────────────
export function startSeasonMandate(s) {
  ensureBoard(s);
  const b = s.board;
  if (b.mandate && !b.mandate.review.end) return b.mandate; // لائحة الموسم قائمة بالفعل
  if (b.pendingBoost > 0) {
    // مكافأة الموسم الماضي تصل الآن: ميزانية تعاقدات أكبر (معلنة لا سرية).
    s.finance.wageBudget = Math.round(s.finance.wageBudget * (1 + b.pendingBoost));
    b.wageFactor = Math.round((b.wageFactor || 1) * (1 + b.pendingBoost) * 1000) / 1000;
    b.pendingBoost = 0;
  }
  if (b.freezeUntil && b.freezeUntil < s.date) b.freezeUntil = null;
  const size = sizeOf(s.reputation);
  const rebuild = Boolean(b.nextRebuild);
  const ambition = rebuild ? "rebuild" : baseAmbition(size);
  const mandate = buildMandate(s, {
    seasonNumber: s.seasonNumber,
    startDate: s.date,
    endDate: s.nextSeasonDate,
    ambition,
    rebuild,
  });
  b.nextRebuild = false;
  b.mandate = mandate;
  message(s, {
    title: boardTextAr("mandateIssuedTitle"),
    body:
      boardTextAr("mandateIssuedBody") +
      ` (${num(mandate.items.length)} · ${mandate.midDate} · ${mandate.endDate})`,
    category: BOARD_CATEGORY,
    kind: "board-mandate",
    ref: mandate.id,
  });
  return mandate;
}

// ── اجتماع منتصف الموسم ─────────────────────────────────────────────────────
export function midSeasonReview(s, mandate = activeMandate(s)) {
  const b = ensureBoard(s);
  if (!mandate || mandate.review.mid) return null;
  const e = evaluateMandate(s, mandate);
  const good = e.score >= MID_GOOD_SCORE;
  mandate.review.mid = {
    date: s.date,
    good,
    done: e.done,
    total: e.total,
    score: Number(e.score.toFixed(3)),
  };
  const rec = {
    id: uid(s, "meet"),
    kind: "mid",
    season: mandate.season,
    date: s.date,
    status: good ? "trust" : "warning",
    done: e.done,
    total: e.total,
  };
  b.meetings.push(rec);
  if (good) {
    b.confidence = clamp(b.confidence + MID_TRUST.confidence, 0, 100);
    s.fanSupport = clamp(s.fanSupport + MID_TRUST.fanLift, 0, 100);
  }
  message(s, {
    title: boardTextAr(good ? "midMeetingGoodTitle" : "midMeetingWarnTitle"),
    body: good
      ? `${boardTextAr("midMeetingGoodBody")} (${num(e.done)}/${num(e.total)})`
      : `${boardTextAr("midMeetingWarnBody")} (${num(e.done)}/${num(e.total)} · ${mandate.endDate})`,
    category: BOARD_CATEGORY,
    kind: good ? "board-mid" : "board-warning",
    ref: mandate.id,
    deadline: good ? null : mandate.endDate,
    priority: good ? "normal" : "high",
  });
  return rec;
}

// ── سلم العواقب (متدرج، ومحدود بسقف لا يمس الملكية) ─────────────────────────
export function ladderFor(streak) {
  return CONSEQUENCE_LADDER[clamp(streak, 1, MAX_LADDER_TIER) - 1];
}
function withdrawSponsor(s, reason) {
  const active = s.sponsors.filter((c) => c.status === "active");
  if (!active.length) return null;
  const pick = [...active].sort((a, b) =>
    a.end === b.end ? a.id.localeCompare(b.id) : a.end < b.end ? -1 : 1,
  )[0];
  pick.status = "expired";
  pick.end = s.date < pick.start ? pick.start : s.date;
  // الدفعات المتبقية تسقط مع الانسحاب: لا دخل مقابل لا ظهور.
  s.finance.obligations = s.finance.obligations.filter(
    (o) => !(o.ref === pick.id && o.status === "pending"),
  );
  return pick;
}
function cutWageBudget(s, share) {
  const before = s.finance.wageBudget;
  s.finance.wageBudget = Math.max(
    MIN_WAGE_BUDGET,
    Math.round(s.finance.wageBudget * (1 - share)),
  );
  s.board.wageFactor =
    Math.round((s.board.wageFactor || 1) * (1 - share) * 1000) / 1000;
  return before - s.finance.wageBudget;
}

// ── التصويت النهائي: مكافآت أو عواقب متدرجة، ثم لائحة جديدة ─────────────────
export function endSeasonBoardReview(s) {
  const b = ensureBoard(s);
  const mandate = b.mandate;
  if (!mandate || mandate.review.end) return null;
  const e = evaluateMandate(s, mandate);
  const effects = [];
  let tier = 0;

  if (e.status === "passed") {
    b.successStreak += 1;
    b.failureStreak = 0;
    b.confidence = clamp(b.confidence + REWARDS.confidence, 0, 100);
    const amount = Math.round(s.finance.wageBudget * REWARDS.cashShare);
    const key = `board-support-s${mandate.season}`;
    if (post(s, amount, "board-support", boardTextAr("mandateIssuedTitle"), key)) {
      effects.push({ kind: "investors", amount });
    }
    b.pendingBoost = REWARDS.boost;
    effects.push({ kind: "budget", share: REWARDS.boost });
    s.fanSupport = clamp(s.fanSupport + REWARDS.fanLift, 0, 100);
    effects.push({ kind: "fans", amount: REWARDS.fanLift });
    s.reputation = clamp(s.reputation + REWARDS.repLift, 0, 99);
  } else if (e.status === "partial") {
    b.failureStreak = 0;
    b.successStreak = 0;
    b.confidence = clamp(b.confidence - PARTIAL_PENALTY.confidence, 0, 100);
    effects.push({ kind: "final-warning" });
  } else {
    b.failureStreak += 1;
    b.successStreak = 0;
    tier = clamp(b.failureStreak, 1, MAX_LADDER_TIER);
    const step = ladderFor(b.failureStreak);
    b.confidence = clamp(b.confidence - 10 - tier * 3, 0, 100);
    const cut = cutWageBudget(s, step.wageCut);
    effects.push({ kind: "budget-cut", share: step.wageCut, amount: cut });
    b.freezeUntil = addDays(s.date, step.freezeDays);
    effects.push({ kind: "freeze", until: b.freezeUntil, days: step.freezeDays });
    let out = 0;
    for (let i = 0; i < step.sponsorsOut; i++)
      if (withdrawSponsor(s, "board")) out++;
    if (out) effects.push({ kind: "sponsor-out", count: out });
    const before = s.fanSupport;
    s.fanSupport = clamp(s.fanSupport - step.fanDrop, 0, 100);
    effects.push({ kind: "protest", amount: before - s.fanSupport });
    s.reputation = clamp(s.reputation - step.repDrop, 0, 99);
    // إعادة البناء: لائحة الموسم القادم أخف، ولا تصعيد بعد السقف.
    b.nextRebuild = true;
  }

  mandate.review.end = {
    date: s.date,
    status: e.status,
    score: Number(e.score.toFixed(3)),
    done: e.done,
    total: e.total,
  };
  const rec = {
    season: mandate.season,
    date: s.date,
    status: e.status,
    done: e.done,
    total: e.total,
    tier,
    size: mandate.size,
    ambition: mandate.ambition,
    effects,
  };
  b.history.push(rec);
  if (b.history.length > MAX_HISTORY) b.history = b.history.slice(-MAX_HISTORY);
  b.meetings.push({
    id: uid(s, "meet"),
    kind: "end",
    season: mandate.season,
    date: s.date,
    status: e.status,
    done: e.done,
    total: e.total,
  });
  b.mandate = null;
  message(s, {
    title: boardTextAr(
      e.status === "passed"
        ? "endMeetingPassedTitle"
        : e.status === "partial"
          ? "endMeetingPartialTitle"
          : "endMeetingFailedTitle",
    ),
    body: endVoteBody(s, e, effects),
    category: BOARD_CATEGORY,
    kind: "board-vote",
    ref: mandate.id,
    priority: e.status === "failed" ? "high" : "normal",
  });
  return rec;
}
// نص التصويت: عربي داخل الحفظة (تُترجمه طبقة العرض)، والأرقام وحدها لاتينية.
function endVoteBody(s, e, effects) {
  // الذيل أرقام/تواريخ لاتينية فقط: النص العربي كله عبارة واحدة من القاموس
  // فيُترجم كاملًا، وتفاصيل العواقب بالأرقام تُعرض في شاشة الجمعية العمومية.
  const counts = `(${num(e.done)}/${num(e.total)})`;
  if (e.status === "passed")
    return `${boardTextAr("endMeetingPassedBody")} ${counts}`;
  if (e.status === "partial")
    return `${boardTextAr("endMeetingPartialBody")} ${counts}`;
  return `${boardTextAr("endMeetingFailedBody")} ${counts}`;
}

// ── وصف العاقبة/المكافأة (يستخدمه البريد وشاشة اللائحة) ─────────────────────
export function effectText(s, effect) {
  switch (effect.kind) {
    case "investors":
      return boardTextAr("cRewardInvestors", { money: money(effect.amount) });
    case "budget":
      return boardTextAr("cRewardBudget", { n: num(Math.round(effect.share * 100)) });
    case "fans":
      return boardTextAr("cRewardFans", { n: num(effect.amount) });
    case "budget-cut":
      return boardTextAr("cBudgetCut", { n: num(Math.round(effect.share * 100)) });
    case "freeze":
      return boardTextAr("cFreeze", { d: effect.until });
    case "sponsor-out":
      return boardTextAr("cSponsorOut");
    case "protest":
      return boardTextAr("cProtest", { n: num(Math.abs(effect.amount)) });
    default:
      return "";
  }
}

// ── نداء اليوم: مراجعة المنتصف مرة واحدة عند حلول موعدها ────────────────────
export function boardDay(s) {
  const mandate = activeMandate(s);
  if (!mandate || mandate.review.mid || mandate.review.end) return null;
  if (s.date < mandate.midDate) return null;
  if (s.date >= mandate.endDate) return null; // التصويت النهائي يتولاه انتقال الموسم
  return midSeasonReview(s, mandate);
}

// ── قيود التعاقدات الناتجة عن الإخفاق المالي ────────────────────────────────
export const transferFrozen = (s) =>
  Boolean(s.board?.freezeUntil && s.board.freezeUntil >= s.date);
export function assertTransfersAllowed(s) {
  if (transferFrozen(s))
    throw new Error(boardTextAr("freezeBlocked", { d: s.board.freezeUntil }));
}
export const freezeBadgeText = (s) =>
  transferFrozen(s) ? boardTextAr("freezeBadge", { d: s.board.freezeUntil }) : "";
