// حياة الملياردير 0.29 — الثروتان المنفصلتان ومستوى المعيشة (المرحلة ٩ من تحديث الدراما).
//
// ثروة النادي 💼 تبقى في `s.finance` كما كانت دائمًا (دفاتر، قيود، التزامات).
// الثروة الشخصية 💎 تعيش في `s.empire.personal` بأرقام صحيحة آمنة بالجنيه،
// ولا يختلط الرصيدان أبدًا: التحويل بينهما حدث صريح بحدود شهرية ومراقبة
// من الجمعية العمومية (رسالة بريد + شبهات عند السحب الكبير).
//
// قصة المالك تُختار عند بدء لعبة جديدة، وتُشتق تلقائيًا للحفظات القديمة
// من الصعوبة (مبتدئ/سهل ← وريث، متوسط ← عصامي، صعب ← مقامر).
import { assert, clamp } from "../../core/utils.js";
import { post } from "../finance.js";
import { message } from "../inbox.js";
import { addSuspicion } from "../blackFiles.js";
import { empireText } from "../../data/empireTexts.js";

// ── القصص والمستويات ────────────────────────────────────────────────────────
export const OWNER_STORIES = Object.freeze({
  heir: Object.freeze({ wealth: 80_000_000, debt: 0, income: 600_000 }),
  selfmade: Object.freeze({ wealth: 40_000_000, debt: 0, income: 350_000 }),
  gambler: Object.freeze({ wealth: 15_000_000, debt: 10_000_000, income: 150_000 }),
});

export const LIFESTYLES = Object.freeze({
  frugal: Object.freeze({ cost: 250_000, prestige: 0, happyDrift: -2, fame: 0 }),
  comfortable: Object.freeze({ cost: 800_000, prestige: 1, happyDrift: 0, fame: 0 }),
  luxury: Object.freeze({ cost: 2_200_000, prestige: 3, happyDrift: 2, fame: 1 }),
  legendary: Object.freeze({ cost: 6_000_000, prestige: 6, happyDrift: 4, fame: 2 }),
});

export const TRANSFER_CAP = 5_000_000;
export const DEBT_INTEREST_PCT = 1; //٪ شهريًا على دين المقامر
export const DRAW_SUSPICION_AT = 1_000_000; // سحب أكبر منه يرفع الشبهات
export const DRAW_SUSPICION = 2;

// قصة الحفظات القديمة: مشتقة من الصعوبة — حتمية وبلا اختيار متأخر.
export function storyForOldSave(s) {
  const d = s.difficulty;
  if (d === "beginner" || d === "easy") return "heir";
  if (d === "hard") return "gambler";
  return "selfmade";
}

export function initEmpire(s, story = "selfmade") {
  const st = OWNER_STORIES[story] ? story : "selfmade";
  const def = OWNER_STORIES[st];
  return {
    schema: 1,
    story: st,
    personal: def.wealth,
    debt: def.debt,
    lifestyle: "comfortable",
    prestige: st === "heir" ? 10 : st === "selfmade" ? 6 : 3,
    fame: st === "heir" ? 12 : st === "selfmade" ? 8 : 15,
    transfers: { month: "", toPersonal: 0, toClub: 0, log: [] },
    lastMonthSettle: "",
    monthTrack: { income: 0, expenses: 0, returns: 0 },
    assets: [],
    family: {
      status: "single",
      brideId: null,
      engagedOn: null,
      wife: null,
      children: [],
      divorceCount: 0,
    },
    portfolio: {
      rental: 0,
      stocks: 0,
      startup: 0,
      coin: 0,
      deposit: 0,
      lastSettle: "",
      history: [],
    },
    rivals: { list: [], race: null, history: [], lastGrowth: "" },
    charity: {
      total: 0,
      personalTotal: 0,
      lastGift: null,
      projects: [],
      stingyStrikes: 0,
    },
    reports: [],
    log: [],
  };
}

export const ensureEmpire = (s) =>
  s.empire || (s.empire = initEmpire(s, storyForOldSave(s)));

export const monthKey = (date) => date.slice(0, 7);

// ── صافي الثروة ──────────────────────────────────────────────────────────────
// يشتري المنافسون والترتيب قيمته من هنا: الشخصي + قيمة بيع الأصول +
// الاستثمارات − الدين. خزينة النادي لا تدخل أبدًا — فهي مال المؤسسة لا المالك.
// كل أصل مملوك يخزن قيمة بيعه لحظة الشراء، فلا حاجة لاستيراد كتالوج الأصول هنا.
export function assetsSellValue(s) {
  const e = s.empire;
  if (!e) return 0;
  return e.assets.reduce((sum, a) => sum + (a.sellValue || 0), 0);
}

export function portfolioValue(s) {
  const p = s.empire?.portfolio;
  if (!p) return 0;
  return p.rental + p.stocks + p.startup + p.coin + p.deposit;
}

export function netWorth(s) {
  const e = s.empire;
  if (!e) return 0;
  return Math.max(0, e.personal + assetsSellValue(s) + portfolioValue(s) - e.debt);
}

// ── التحويلات بين الخزينتين ──────────────────────────────────────────────────
function rollTransferMonth(s) {
  const e = ensureEmpire(s);
  const mk = monthKey(s.date);
  if (e.transfers.month !== mk) {
    e.transfers.month = mk;
    e.transfers.toPersonal = 0;
    e.transfers.toClub = 0;
  }
  return e.transfers;
}

export function transferRemaining(s, dir) {
  const t = rollTransferMonth(s);
  const used = dir === "toPersonal" ? t.toPersonal : t.toClub;
  return Math.max(0, TRANSFER_CAP - used);
}

export function transferToPersonal(s, amount) {
  const e = ensureEmpire(s);
  assert(Number.isSafeInteger(amount) && amount > 0, empireText("transferInvalid"));
  const t = rollTransferMonth(s);
  assert(t.toPersonal + amount <= TRANSFER_CAP, empireText("transferCapReached"));
  assert(s.finance.cash >= amount, empireText("transferNoClubCash"));
  const key = `empire-draw:${s.date}:${t.toPersonal + amount}`;
  post(s, -amount, "owner-draw", empireText("transferToPersonal"), key);
  t.toPersonal += amount;
  e.personal += amount;
  t.log.push({ date: s.date, dir: "toPersonal", amount });
  if (t.log.length > 40) t.log.splice(0, t.log.length - 40);
  if (amount >= DRAW_SUSPICION_AT) {
    addSuspicion(s, DRAW_SUSPICION);
    message(s, {
      title: empireText("drawNoticeTitle"),
      body: empireText("drawNoticeBody"),
      category: "board",
    });
  }
  return e.personal;
}

export function transferToClub(s, amount) {
  const e = ensureEmpire(s);
  assert(Number.isSafeInteger(amount) && amount > 0, empireText("transferInvalid"));
  const t = rollTransferMonth(s);
  assert(t.toClub + amount <= TRANSFER_CAP, empireText("transferCapReached"));
  assert(e.personal >= amount, empireText("transferNoPersonal"));
  const key = `empire-support:${s.date}:${t.toClub + amount}`;
  post(s, amount, "owner-support", empireText("transferToClub"), key);
  t.toClub += amount;
  e.personal -= amount;
  e.prestige = clamp(e.prestige + 1, 0, 400);
  t.log.push({ date: s.date, dir: "toClub", amount });
  if (t.log.length > 40) t.log.splice(0, t.log.length - 40);
  message(s, {
    title: empireText("supportNoticeTitle"),
    body: empireText("supportNoticeBody"),
    category: "board",
  });
  return e.personal;
}

// ── مستوى المعيشة ────────────────────────────────────────────────────────────
export function setLifestyle(s, tier) {
  const e = ensureEmpire(s);
  assert(LIFESTYLES[tier], "مستوى معيشة غير معروف.");
  if (e.lifestyle === tier) return e.lifestyle;
  e.lifestyle = tier;
  message(s, {
    title: empireText("lifestyleChanged"),
    body: `${empireText("lifestyleTitle")}: ${empireText("lifestyle" + tier[0].toUpperCase() + tier.slice(1))}`,
    category: "events",
  });
  return tier;
}

export function repayDebt(s, amount) {
  const e = ensureEmpire(s);
  assert(Number.isSafeInteger(amount) && amount > 0, "مبلغ السداد غير صالح.");
  const pay = Math.min(amount, e.debt, e.personal);
  assert(pay > 0, empireText("transferNoPersonal"));
  e.personal -= pay;
  e.debt -= pay;
  s.empire.monthTrack.expenses += pay;
  message(s, {
    title: empireText("repayDebt"),
    body: e.debt === 0 ? empireText("debtCleared") : empireText("repayDebtDone"),
    category: "events",
  });
  return e.debt;
}

// يضيف دخلاً شخصيًا ويُسجّله في متتبع الشهر (للتقرير الشهري).
export function personalIncome(s, amount) {
  const e = ensureEmpire(s);
  e.personal += amount;
  e.monthTrack.income += amount;
}

export function personalExpense(s, amount) {
  const e = ensureEmpire(s);
  const pay = Math.min(amount, e.personal);
  e.personal -= pay;
  e.monthTrack.expenses += pay;
  return amount - pay; // المتبقي غير المسدد
}

// خصم مصروف المعيشة الشهري: يدفع من الشخصي، والعجز يتحول دينًا مع صفعة اجتماعية.
export function chargeMonthlyLiving(s) {
  const e = ensureEmpire(s);
  const tier = LIFESTYLES[e.lifestyle] || LIFESTYLES.comfortable;
  const shortfall = personalExpense(s, tier.cost);
  const rec = {
    month: monthKey(s.date),
    cost: tier.cost,
    paid: tier.cost - shortfall,
    shortfall,
  };
  if (shortfall > 0) {
    e.debt += shortfall;
    e.prestige = clamp(e.prestige - 2, 0, 400);
    e.fame = clamp(e.fame - 1, 0, 100);
    if (e.family.wife)
      e.family.wife.happiness = clamp(e.family.wife.happiness - 6, 0, 100);
    message(s, {
      title: empireText("livingCharged"),
      body: empireText("livingShortfall"),
      category: "events",
    });
  }
  return rec;
}

// ── سجل الخطافات الشهرية ─────────────────────────────────────────────────────
// تسجل كل وحدة نظام (أصول/عائلة/استثمارات/منافسون/خير) خطافها هنا عند استيرادها،
// والسجل في هذه الوحدة كي لا تنشأ دائرة استيراد مع يوم الإيقاع.
const MONTH_HOOKS = [];
export function registerEmpireMonthHook(fn) {
  if (!MONTH_HOOKS.includes(fn)) MONTH_HOOKS.push(fn);
}
export const empireMonthHooks = () => MONTH_HOOKS.slice();

// بداية الشهر: دخل القصة + فائدة الدين + المعيشة. تُستدعى من إيقاع اليوم الأول.
export function settleWealthMonth(s) {
  const e = ensureEmpire(s);
  const def = OWNER_STORIES[e.story] || OWNER_STORIES.selfmade;
  personalIncome(s, def.income);
  if (e.debt > 0) {
    const interest = Math.round((e.debt * DEBT_INTEREST_PCT) / 100);
    e.debt += interest;
    e.monthTrack.expenses += 0; // الفائدة تراكم دين لا صرف نقدي
  }
  rollTransferMonth(s);
  return chargeMonthlyLiving(s);
}
