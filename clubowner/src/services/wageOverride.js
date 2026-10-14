// تجاوز المالك 0.52 — جلسة «السياسة والصلاحيات» الدفعة 3.
// زر «أوافق كمالك!»: يتجاوز سقف الرواتب فورًا حين يتجاوزه النادي فقط، ويرفع
// الحد المعتمد إلى فاتورة المرتبات الحالية + هامش موحّد (15% بحد أدنى 100 ألف،
// نفس هامش ميزانيات الأندية في السوق) — **إضافة بحتة**: لا غرامة، لا خصم،
// لا شبهة، لا حرارة، ولا أثر على الشرعية أو الجاهزية أو الحالة المعنوية.
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
