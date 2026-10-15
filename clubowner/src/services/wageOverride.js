// تجاوز المالك 0.52 — جلسة «السياسة والصلاحيات» الدفعة 3.
// زر «أوافق كمالك!»: يتجاوز سقف الرواتب فورًا حين يتجاوزه النادي فقط، ويرفع
// الحد المعتمد إلى فاتورة المرتبات الحالية + هامش موحّد (15% بحد أدنى 100 ألف،
// نفس هامش ميزانيات الأندية في السوق) — **إضافة بحتة**: لا غرامة، لا خصم،
// لا شبهة، لا حرارة، ولا أثر على الشرعية أو الجاهزية أو الحالة المعنوية.
// 0.53 (hotfix «زرار المليار») — زر «ارفع الميزانية»: يظهر دائمًا في لوحة
// الميزانية، ويقبل مبلغًا حرًا (من 1 حتى مليار) يُضاف فورًا إلى سقف الرواتب
// المعتمد، بنفس قواعد الإضافة البحتة: لا غرامة، لا خصم، ولا شبهة — مع تسجيل
// كامل قبل/بعد لكل رفعة.
import { assert, uid } from "../core/utils.js";
import { tr } from "../i18n/index.js";
import { message } from "./inbox.js";
import { wages } from "./finance.js";

export const WAGE_OVERRIDE_LOG_LIMIT = 40;
// هامش نمو الحد المعتمد بعد موافقة المالك — نفس معادلة ميزانية مرتبات الأندية.
export const OWNER_HEADROOM_RATE = 0.15;
export const OWNER_HEADROOM_MIN = 100_000;

export function ensureWageOverride(s) {
  // حفظات قديمة أو لقطات ترحيل ناقصة قد تمر بلا كتلة مالية — لا نكسرها.
  if (!s?.finance) return null;
  s.finance.ownerOverride ||= {
    count: 0,
    totalAdded: 0,
    lastDate: null,
    log: [],
  };
  const o = s.finance.ownerOverride;
  for (const key of ["count", "totalAdded"])
    if (!Number.isFinite(o[key])) o[key] = 0;
  if (o.lastDate === undefined) o.lastDate = null;
  if (!Array.isArray(o.log)) o.log = [];
  return o;
}

/** الفجوة الحالية بين فاتورة المرتبات والحد المعتمد (0 إن لم يوجد تجاوز). */
export const wageGap = (s) =>
  s?.finance
    ? Math.max(0, Math.ceil(wages(s) - (s.finance.wageBudget || 0)))
    : 0;

/** الهامش الذي يمنحه المالك فوق فاتورة المرتبات الحالية عند الموافقة. */
export const ownerHeadroom = (payroll) =>
  Math.max(OWNER_HEADROOM_MIN, Math.round(payroll * OWNER_HEADROOM_RATE));

/** حالة معلنة للواجهة: الفجوة، عدد الموافقات، وإجمالي ما أضافه المالك. */
export function wageOverrideStatus(s) {
  if (!s?.finance)
    return {
      gap: 0,
      over: false,
      wages: 0,
      budget: 0,
      headroom: OWNER_HEADROOM_MIN,
      count: 0,
      totalAdded: 0,
      lastDate: null,
      approvals: [],
    };
  const o = ensureWageOverride(s);
  const payroll = wages(s);
  return {
    gap: wageGap(s),
    over: wageGap(s) > 0,
    wages: payroll,
    budget: s.finance.wageBudget || 0,
    headroom: ownerHeadroom(payroll),
    count: o.count,
    totalAdded: o.totalAdded,
    lastDate: o.lastDate,
    approvals: o.log,
  };
}

/**
 * موافقة المالك: ترفع الحد المعتمد فورًا إلى فاتورة المرتبات الحالية مضافًا
 * إليها الهامش، فتنتهي حالة التجاوز ويصبح التوقيع متاحًا من جديد.
 * تُتاح عند التجاوز فقط، ولا تُنتج أي عقوبة أو أثر آخر.
 */
export function approveOwnerWageOverride(s) {
  assert(
    s?.finance,
    tr(
      "لا كتلة مالية في هذه الحفظة.",
      "This save has no finance block.",
      "Cette sauvegarde n’a pas de bloc financier.",
    ),
  );
  const o = ensureWageOverride(s);
  const gap = wageGap(s);
  assert(
    gap > 0,
    tr(
      "الزر يظهر عند تجاوز سقف الرواتب فقط؛ لا يوجد تجاوز الآن.",
      "This action appears only when the wage cap is exceeded; nothing is over the cap now.",
      "Cette action n’apparaît qu’en cas de dépassement du plafond ; rien n’est dépassé.",
    ),
  );
  const before = s.finance.wageBudget || 0;
  const payroll = wages(s);
  const headroom = ownerHeadroom(payroll);
  s.finance.wageBudget = Math.max(before, payroll + headroom);
  const added = s.finance.wageBudget - before;
  const record = {
    id: uid(s, "wage-override"),
    date: s.date,
    season: s.seasonNumber,
    budgetBefore: before,
    budgetAfter: s.finance.wageBudget,
    gap,
    payroll,
    headroom,
  };
  o.count += 1;
  o.totalAdded += added;
  o.lastDate = s.date;
  o.log.unshift(record);
  o.log.length = Math.min(o.log.length, WAGE_OVERRIDE_LOG_LIMIT);
  message(s, {
    title: tr(
      "أوافق كمالك: سقف الرواتب ارتفع فورًا",
      "Owner approval: the wage cap rose at once",
      "Approbation du propriétaire : le plafond a été relevé aussitôt",
    ),
    body: tr(
      `وافقت كمالك على تجاوز فاتورة المرتبات، فرفعت الحد المعتمد من ${before.toLocaleString("en-US")} إلى ${s.finance.wageBudget.toLocaleString("en-US")} شهريًا في الحفظة (الفاتورة ${payroll.toLocaleString("en-US")} + هامش ${headroom.toLocaleString("en-US")}). لا غرامة ولا خصم ولا شبهة ولا حرارة على هذا القرار، وباقي القيود تُحسب بعد التجاوز كما هي.`,
      `As owner you approved the wage-bill overrun and raised the approved ceiling from ${before.toLocaleString("en-US")} to ${s.finance.wageBudget.toLocaleString("en-US")} per month (bill ${payroll.toLocaleString("en-US")} + headroom ${headroom.toLocaleString("en-US")}). There is no fine, deduction, suspicion, or heat for this decision, and every other rule is applied after the overrun as before.`,
      `En tant que propriétaire, vous avez approuvé le dépassement et relevé le plafond de ${before.toLocaleString("en-US")} à ${s.finance.wageBudget.toLocaleString("en-US")} par mois (masse salariale ${payroll.toLocaleString("en-US")} + marge ${headroom.toLocaleString("en-US")}). Aucune amende, retenue, suspicion ou pression ; toutes les autres règles restent appliquées.`,
    ),
    category: "finance",
    kind: "wage-override",
    ref: record.id,
  });
  return record;
}

// ——— 0.53 hotfix «زرار المليار»: ارفع الميزانية ————————————————————————
export const WAGE_RAISE_MIN = 1;
// سقف المبلغ الواحد: مليار جنيه. الرفع متاح دائمًا وبأي عدد من المرات.
export const WAGE_RAISE_MAX = 1_000_000_000;
// 0.53 hotfix «خانة المليار»: خطوة الخانة «any» لأن المبلغ حر فعلًا (أي رقم صحيح
// من 1 حتى مليار) — الخطوة الرقمية القديمة (50000 بمبدأ 1) كانت تجعل المتصفح
// يرفض الأرقام المدورة كلها قبل وصول الطلب للخدمة (4200000 و1000000 وحتى
// اختصار المليار). التقريب إلى عدد صحيح صار في roundWageRaise، والحدود تُفرض
// بـmin/max هنا وبـnormalizeWageRaise في الخدمة معًا.
export const WAGE_RAISE_STEP = "any";
export const WAGE_RAISE_LOG_LIMIT = 40;
// اختصارات المبلغ المعروضة في النافذة: من 100 ألف إلى المليار.
export const WAGE_RAISE_CHIPS = [
  100_000,
  1_000_000,
  10_000_000,
  100_000_000,
  WAGE_RAISE_MAX,
];

/** سجل الرفعات: عدّاد، إجمالي ما أُضيف، وتاريخ آخر رفعة — يُبنى تلقائيًا إن غاب. */
export function ensureWageRaises(s) {
  if (!s?.finance) return null;
  s.finance.wageRaises ||= { count: 0, totalAdded: 0, lastDate: null, log: [] };
  const t = s.finance.wageRaises;
  for (const key of ["count", "totalAdded"])
    if (!Number.isFinite(t[key])) t[key] = 0;
  if (t.lastDate === undefined) t.lastDate = null;
  if (!Array.isArray(t.log)) t.log = [];
  return t;
}

/** 0.53 hotfix «خانة المليار»: تقريب مبلغ الخانة لعدد صحيح — غير الرقمي يُعاد null. */
export function roundWageRaise(amount) {
  const cleaned =
    typeof amount === "string" &&
    /^\s*[+-]?\d[\d,_\s]*(\.\d+)?\s*$/.test(amount)
      ? amount.replace(/[,_\s]/g, "")
      : amount;
  const value = Math.round(Number(cleaned));
  return Number.isFinite(value) ? value : null;
}

/** تدقيق مبلغ الرفع: عدد صحيح من 1 حتى مليار — وما خرج عن ذلك يُرفض برسالة صريحة. */
export function normalizeWageRaise(amount) {
  const value = roundWageRaise(amount);
  assert(
    Number.isSafeInteger(value) &&
      value >= WAGE_RAISE_MIN &&
      value <= WAGE_RAISE_MAX,
    tr(
      "المبلغ لازم يكون عددًا صحيحًا من 1 حتى مليار جنيه.",
      "The amount must be a whole number from 1 up to one billion pounds.",
      "Le montant doit être un nombre entier de 1 à un milliard de livres.",
    ),
  );
  return value;
}

/** معاينة صرفة بلا تعديل على الحفظة: الحد قبل، وبعد، والفجوة المتبقية. */
export function wageRaisePreview(s, amount) {
  const value = normalizeWageRaise(amount);
  const before = s?.finance?.wageBudget || 0;
  const payroll = s?.finance ? wages(s) : 0;
  const after = before + value;
  return {
    amount: value,
    budgetBefore: before,
    budgetAfter: after,
    payroll,
    gap: Math.max(0, Math.ceil(payroll - after)),
    over: payroll > after,
    max: WAGE_RAISE_MAX,
  };
}

/** حالة معلنة للواجهة: الحد الحالي، السجل، وإجمالي ما أُضيف بالرفعات. */
export function wageRaisesStatus(s) {
  const base = {
    budget: 0,
    payroll: 0,
    count: 0,
    totalAdded: 0,
    lastDate: null,
    raises: [],
    min: WAGE_RAISE_MIN,
    max: WAGE_RAISE_MAX,
    chips: WAGE_RAISE_CHIPS,
  };
  if (!s?.finance) return base;
  const t = ensureWageRaises(s);
  return {
    ...base,
    budget: s.finance.wageBudget || 0,
    payroll: wages(s),
    count: t.count,
    totalAdded: t.totalAdded,
    lastDate: t.lastDate,
    raises: t.log,
  };
}

/**
 * «ارفع الميزانية»: يضيف المبلغ فورًا إلى سقف الرواتب المعتمد ويسجّل السطر
 * كاملًا (قبل/بعد). الزر ظاهر دائمًا، والقرار إضافة بحتة: لا غرامة، ولا خصم
 * من خزينة النادي أو الثروة الشخصية، ولا شبهة ولا حرارة ولا أي قيد مالي.
 */
export function raiseWageBudget(s, amount) {
  assert(
    s?.finance,
    tr(
      "لا كتلة مالية في هذه الحفظة.",
      "This save has no finance block.",
      "Cette sauvegarde n’a pas de bloc financier.",
    ),
  );
  const value = normalizeWageRaise(amount);
  const t = ensureWageRaises(s);
  const before = s.finance.wageBudget || 0;
  assert(
    Number.isSafeInteger(before + value),
    tr(
      "الحد المعتمد وصل سقفه الأقصى.",
      "The approved ceiling has reached its maximum.",
      "Le plafond approuvé a atteint son maximum.",
    ),
  );
  s.finance.wageBudget = before + value;
  const record = {
    id: uid(s, "wage-raise"),
    date: s.date,
    season: s.seasonNumber,
    amount: value,
    budgetBefore: before,
    budgetAfter: s.finance.wageBudget,
  };
  t.count += 1;
  t.totalAdded += value;
  t.lastDate = s.date;
  t.log.unshift(record);
  t.log.length = Math.min(t.log.length, WAGE_RAISE_LOG_LIMIT);
  message(s, {
    title: tr(
      "رفعت ميزانية الرواتب فورًا",
      "You raised the wage budget at once",
      "Vous avez relevé aussitôt le budget des salaires",
    ),
    body: tr(
      `أضفت كمالك ${value.toLocaleString("en-US")} شهريًا إلى سقف الرواتب، فارتفع من ${before.toLocaleString("en-US")} إلى ${s.finance.wageBudget.toLocaleString("en-US")} — إضافة بحتة: لا غرامة ولا خصم من خزينة النادي أو ثروتك الشخصية ولا شبهة ولا حرارة، وباقي القواعد تُحسب بعد الرفع كما هي.`,
      `As owner you added ${value.toLocaleString("en-US")} per month to the wage ceiling, raising it from ${before.toLocaleString("en-US")} to ${s.finance.wageBudget.toLocaleString("en-US")} — a pure addition: no fine, no charge to the club treasury or your personal fortune, no suspicion and no heat, and every other rule is applied after the raise unchanged.`,
      `En tant que propriétaire, vous avez ajouté ${value.toLocaleString("en-US")} par mois au plafond salarial, le portant de ${before.toLocaleString("en-US")} à ${s.finance.wageBudget.toLocaleString("en-US")} — un ajout pur : aucune amende, aucun prélèvement sur la caisse du club ni sur votre fortune personnelle, aucune suspicion ni pression, et toutes les autres règles restent appliquées après le relèvement.`,
    ),
    category: "finance",
    kind: "wage-raise",
    ref: record.id,
  });
  return record;
}
