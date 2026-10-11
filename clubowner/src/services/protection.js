// الدفعة 6 — القسم 5: الحماية.
// (أ) تأكيدات للقرارات التي لا رجعة فيها (ملايين، أو نجم).
// (ب) وضع الإجازة: يمنع القرارات الكبرى (نجوم وصفقات كبرى) ويُسجِّل ما فاتك في تقرير عودة.
// لا يُنفِّذ القرارات الكبرى بدلًا منك؛ أما الروتين فيبقى على آلية المحرك القائمة.
import { assert } from "../core/utils.js";
import { message } from "./inbox.js";
import { absenceReport } from "./absence.js";

export const STAR_RATING = 80;
export const IRREVERSIBLE_FEE = 5_000_000;
export const MAJOR_FEE = 20_000_000;

export const isStar = (p) => (p?.rating ?? 0) >= STAR_RATING;

// تحذير قبل التنفيذ: null إن لم يكن القرار دائمًا وضخمًا، وإلا أسبابه.
export function irreversibleWarning(s, { player = null, fee = 0 } = {}) {
  const star = isStar(player);
  const big = fee >= IRREVERSIBLE_FEE;
  if (!star && !big) return null;
  return { star, big, fee, playerName: player?.name || null };
}

export function ensureVacation(s) {
  s.vacation ||= { active: false, startedOn: null, endedOn: null };
  return s.vacation;
}

export const vacationActive = (s) => Boolean(ensureVacation(s).active);

export function startVacation(s) {
  const v = ensureVacation(s);
  assert(!v.active, "وضع الإجازة مفعّل بالفعل.");
  v.active = true;
  v.startedOn = s.date;
  message(s, {
    title: "بدأ وضع الإجازة",
    body: "لن تُنفَّذ القرارات الكبرى (النجوم والصفقات الكبرى) إلا بعودتك. ستجد تقرير العودة عند إنهاء الإجازة.",
    category: "club",
  });
  return v;
}

// إنهاء الإجازة يعيد تقرير «ماذا حدث أثناء غيابك» من تاريخ البدء.
export function endVacation(s) {
  const v = ensureVacation(s);
  assert(v.active, "وضع الإجازة غير مفعّل.");
  const report = absenceReport(s, 0, v.startedOn);
  v.active = false;
  v.endedOn = s.date;
  return { report, startedOn: v.startedOn, endedOn: v.endedOn };
}

// حارس: يُستدعى من القرارات الكبرى في الخدمات، ويرفض أثناء الإجازة.
export function assertVacationAllows(s, { player = null, fee = 0 } = {}) {
  if (!vacationActive(s)) return;
  assert(!isStar(player), "وضع الإجازة يمنع القرارات المتعلقة بالنجوم حتى عودتك.");
  assert(fee < MAJOR_FEE, "وضع الإجازة يمنع الصفقات الكبرى حتى عودتك.");
}
