// التحويلات الذكية 0.44 — قواعد السحب الشخصي من خزينة النادي.
//
// • السقف يحدده مستوى ثقة الجمعية لحظة التحويل: منخفضة 20M، متوسطة 35M، عالية 50M.
// • أي مبلغ تحت السقف الحالي مسموح (مثلًا 17.5M)، لا شرائح ثابتة.
// • المشاريع المصوتة: تصويت الجمعية يقبل مشروعًا بمبلغ محدد، وسحبه لا يخضع للسقف.
// • أرضية 3 شهور: لا يفصل بين تحويلين شخصيين أقل من ثلاثة شهور.
// • النهب = أي سحب فوق السقف أو خارج القواعد. يُعرض تحذير «هذا نهب!» قبل التنفيذ،
//   وعند التأكيد تُرفع الحرارة (الشبهات)، وتنخفض ثقة الجمعية، ويظهر خطر الفصل.
// • الخزنة الموحدة هي المصدر/الوجهة الوحيدة؛ هذه القواعد تحترمها ولا تنشئ حاوية خاصة.
// • دعم النادي من الشخصي حركة حرة بلا سقف (الخزنة الموحدة بلا عقوبة).
import { assert, clamp, dayNumber, random, uid } from "../../core/utils.js";
import { addSuspicion } from "../blackFiles.js";
import { message } from "../inbox.js";
import { tr } from "../../i18n/index.js";
import { ensureEmpire } from "./wealth.js";
import { moveFunds } from "../vault.js";

export const TRUST_CAPS = Object.freeze({
  low: 20_000_000,
  mid: 35_000_000,
  high: 50_000_000,
});
// حدود الثقة (0-100) بين الشرائح الثلاث.
export const TRUST_MID_FROM = 40;
export const TRUST_HIGH_FROM = 75;
export const TRANSFER_CAP = TRUST_CAPS.high; // أعلى سقف ممكن
export const DRAW_FLOOR_MONTHS = 3;
export const LOOT_HEAT_BASE = 20;
export const LOOT_HEAT_MAX_EXTRA = 25;
export const LOOT_TRUST_DROP = 15;
export const DISMISSAL_WINDOW_DAYS = 90;
export const DISMISSAL_CLEAR_TRUST = 60;
export const PROJECT_LOG_LIMIT = 20;
export const PROJECT_MAX = 1_000_000_000;

export function ensureTransfers(e) {
  e.transfers ??= { month: "", toPersonal: 0, toClub: 0, log: [] };
  e.transfers.lastDraw ??= null;
  e.transfers.lastLoot ??= null;
  e.transfers.projects ??= [];
  return e.transfers;
}

const boardTrust = (s) => clamp(Number(s.board?.confidence ?? 60), 0, 100);

export function trustTier(s) {
  const c = boardTrust(s);
  if (c >= TRUST_HIGH_FROM) return "high";
  if (c >= TRUST_MID_FROM) return "mid";
  return "low";
}

export const personalCap = (s) => TRUST_CAPS[trustTier(s)];

function addMonthsISO(date, n) {
  const [y, m, d] = date.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1 + n, 1));
  const fy = first.getUTCFullYear();
  const fm = first.getUTCMonth();
  const last = new Date(Date.UTC(fy, fm + 1, 0)).getUTCDate();
  return new Date(Date.UTC(fy, fm, Math.min(d, last))).toISOString().slice(0, 10);
}

/** أقرب تاريخ يُسمح فيه بتحويل شخصي تالٍ، أو null إن لم يوجد تحويل سابق. */
export function nextDrawDate(s) {
  const last = ensureTransfers(ensureEmpire(s)).lastDraw;
  return last ? addMonthsISO(last, DRAW_FLOOR_MONTHS) : null;
}

export function floorRemainingDays(s) {
  const next = nextDrawDate(s);
  if (!next) return 0;
  return Math.max(0, dayNumber(next) - dayNumber(s.date));
}

function findProject(e, id) {
  return ensureTransfers(e).projects.find((p) => p.id === id && p.status === "approved" && !p.used) || null;
}

const reasonText = (reason, st) => {
  if (reason === "cap")
    return tr(
      `يتجاوز سقفك الحالي (${st.capLabel})`,
      `Exceeds your current cap (${st.capLabel})`,
      `Dépasse votre plafond actuel (${st.capLabel})`,
    );
  if (reason === "floor")
    return tr(
      `قبل انتهاء فاصل الثلاثة أشهر (يتبقى ${st.remainingDays} يومًا)`,
      `Before the three-month gap ends (${st.remainingDays} days left)`,
      `Avant la fin de l’intervalle de trois mois (${st.remainingDays} jours restants)`,
    );
  return tr(
    "يتجاوز المبلغ المصرَّح به للمشروع",
    "Exceeds the amount approved for the project",
    "Dépasse le montant approuvé pour le projet",
  );
};

/**
 * يحسب حالة السحب دون أي تغيير (قراءة فقط) — تستعمله الواجهة لعرض التحذير.
 * الخطأ الصلب (مبلغ غير صالح، مشروع غير موجود، خزينة لا تكفي) يُرمى؛
 * أما تجاوز السقف أو الأرضية أو المشروع فيُعاد كنهب (loot = true).
 */
export function drawStatus(s, amount, { project = null } = {}) {
  assert(Number.isSafeInteger(amount) && amount > 0, tr("مبلغ التحويل غير صالح.", "Invalid transfer amount.", "Montant de transfert invalide."));
  const e = ensureEmpire(s);
  const projectRec = project ? findProject(e, project) : null;
  assert(!project || projectRec, tr("المشروع غير معتمد أو استُعمل من قبل.", "The project is not approved or was already used.", "Le projet n’est pas approuvé ou a déjà été utilisé."));
  const cap = personalCap(s);
  const remainingDays = floorRemainingDays(s);
  const reasons = [];
  if (projectRec) {
    if (amount > projectRec.amount) reasons.push("project");
  } else if (amount > cap) {
    reasons.push("cap");
  }
  if (remainingDays > 0) reasons.push("floor");
  const st = {
    amount,
    cap,
    capLabel: String(cap),
    tier: trustTier(s),
    project: projectRec ? projectRec.id : null,
    remainingDays,
    nextDate: nextDrawDate(s),
    reasons,
    loot: reasons.length > 0,
    cashOk: s.finance.cash >= amount,
  };
  st.reasonTexts = reasons.map((r) => reasonText(r, st));
  return st;
}

/** خطأ يحمل code = "loot" حين يحتاج السحب تأكيدًا صريحًا على النهب. */
export class LootWarning extends Error {
  constructor(status) {
    super(tr("هذا نهب! يحتاج التنفيذ تأكيدًا صريحًا.", "This is looting! It needs explicit confirmation.", "C’est du pillage ! Une confirmation explicite est nécessaire."));
    this.code = "loot";
    this.status = status;
  }
}

/** آثار النهب: حرارة، وهبوط ثقة الجمعية، وتحذير خطر الفصل. */
function applyLoot(s, amount, st) {
  const e = ensureEmpire(s);
  ensureTransfers(e).lastLoot = s.date;
  const extra = Math.min(LOOT_HEAT_MAX_EXTRA, Math.floor(amount / 10_000_000));
  addSuspicion(s, LOOT_HEAT_BASE + extra);
  if (s.board) s.board.confidence = clamp((s.board.confidence ?? 60) - LOOT_TRUST_DROP, 0, 100);
  message(s, {
    title: tr("هذا نهب!", "This is looting!", "C’est du pillage !"),
    body: tr(
      `سُحب ${amount} خارج القواعد: ${st.reasonTexts.join("، ")}. ارتفعت الحرارة وتراجعت ثقة الجمعية.`,
      `${amount} was taken outside the rules: ${st.reasonTexts.join(", ")}. Heat rose and assembly trust fell.`,
      `${amount} prélevés hors règles : ${st.reasonTexts.join(", ")}. La pression monte et la confiance de l’assemblée baisse.`,
    ),
    category: "board",
    kind: "loot-scandal",
    priority: "high",
  });
  message(s, {
    title: tr("خطر الفصل", "Dismissal risk", "Risque de révocation"),
    body: tr(
      "الجمعية تراقب النهب. استعادة الثقة فوق 60 خلال 90 يومًا تُزيل الخطر.",
      "The assembly is watching the looting. Restoring trust above 60 within 90 days removes the risk.",
      "L’assemblée surveille le pillage. Retrouver une confiance supérieure à 60 dans les 90 jours lève le risque.",
    ),
    category: "board",
    kind: "dismissal-risk",
    priority: "high",
  });
}

/** خطر الفصل مشتق: نهب خلال 90 يومًا وثقة الجمعية ما زالت دون 60. */
export function dismissalRisk(s) {
  const last = ensureTransfers(ensureEmpire(s)).lastLoot;
  if (!last) return false;
  const days = dayNumber(s.date) - dayNumber(last);
  return days >= 0 && days <= DISMISSAL_WINDOW_DAYS && boardTrust(s) < DISMISSAL_CLEAR_TRUST;
}

/**
 * سحب شخصي من خزينة النادي. الترتيب: الخزينة أولًا (خطأ صلب)، ثم النهب (يحتاج تأكيدًا).
 */
export function takeFromClub(s, amount, { project = null, confirmLoot = false } = {}) {
  const st = drawStatus(s, amount, { project });
  assert(st.cashOk, tr("خزينة النادي لا تكفي هذا التحويل.", "The club treasury cannot cover this transfer.", "La trésorerie du club ne couvre pas ce transfert."));
  if (st.loot && !confirmLoot) throw new LootWarning(st);
  const e = ensureEmpire(s);
  const t = ensureTransfers(e);
  const entry = moveFunds(s, {
    to: "personal",
    amount,
    kind: st.loot ? "loot" : project ? "project" : "smart",
    project: st.project,
    reason: st.loot
      ? tr("سحب شخصي (نهب)", "Personal draw (looting)", "Prélèvement personnel (pillage)")
      : project
        ? tr("سحب شخصي لمشروع معتمد", "Personal draw for an approved project", "Prélèvement personnel pour un projet approuvé")
        : tr("سحب شخصي بسقف الثقة", "Personal draw within the trust cap", "Prélèvement personnel dans le plafond de confiance"),
  });
  t.lastDraw = s.date;
  if (project) {
    const rec = findProject(e, project);
    rec.used = true;
    rec.usedDate = s.date;
  }
  if (st.loot) applyLoot(s, amount, st);
  return entry;
}

/** دعم النادي من الشخصي: حركة حرة بلا سقف، مع أثر على البرستيج. */
export function transferToClub(s, amount) {
  assert(Number.isSafeInteger(amount) && amount > 0, tr("مبلغ التحويل غير صالح.", "Invalid transfer amount.", "Montant de transfert invalide."));
  const e = ensureEmpire(s);
  moveFunds(s, {
    to: "club",
    amount,
    kind: "support",
    reason: tr("دعم النادي من الثروة الشخصية", "Support to the club from personal wealth", "Soutien au club depuis la fortune personnelle"),
  });
  e.prestige = clamp(e.prestige + 1, 0, 400);
  message(s, {
    title: tr("دعم النادي", "Club support", "Soutien au club"),
    body: tr("وصل دعمك إلى خزينة النادي.", "Your support reached the club treasury.", "Votre soutien a atteint la trésorerie du club."),
    category: "board",
  });
  return e.personal;
}

/**
 * يعرض مشروعًا على تصويت الجمعية. احتمال القبول = ثقة الجمعية / 100.
 * المشروع المعتمد يتيح سحبًا واحدًا بمبلغه دون سقف الثقة.
 */
export function proposeProject(s, { title, amount }) {
  const clean = String(title ?? "").trim();
  assert(clean.length >= 2 && clean.length <= 60, tr("عنوان المشروع يجب أن يكون بين حرفين و60 حرفًا.", "The project title must be between 2 and 60 characters.", "Le titre du projet doit compter entre 2 et 60 caractères."));
  assert(Number.isSafeInteger(amount) && amount > 0 && amount <= PROJECT_MAX, tr("مبلغ المشروع غير صالح.", "Invalid project amount.", "Montant de projet invalide."));
  const e = ensureEmpire(s);
  const t = ensureTransfers(e);
  const approved = random(s) < boardTrust(s) / 100;
  const rec = {
    id: uid(s, "project"),
    title: clean,
    amount,
    date: s.date,
    status: approved ? "approved" : "rejected",
    used: false,
  };
  t.projects.push(rec);
  if (t.projects.length > PROJECT_LOG_LIMIT) t.projects.splice(0, t.projects.length - PROJECT_LOG_LIMIT);
  message(s, {
    title: approved
      ? tr("وافقت الجمعية على المشروع", "The assembly approved the project", "L’assemblée a approuvé le projet")
      : tr("رفضت الجمعية المشروع", "The assembly rejected the project", "L’assemblée a rejeté le projet"),
    body: clean,
    category: "board",
  });
  return rec;
}
