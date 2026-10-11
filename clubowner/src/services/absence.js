// الدفعة 6 — القسم 2: «ماذا فاتك؟». ملخص من سجل اللعبة فقط (لا شيء يُخترع):
// نتائج المباريات المخوضة في الفترة، والرسائل الكبرى (مطلوب قرار/أولوية عالية)، والقرارات المعلقة.
import { daysBetween } from "../core/utils.js";
import { pendingActions } from "./inbox.js";

export const ABSENCE_MIN_DAYS = 7;
const MAX_ITEMS = 5;

// يبدأ العدّ من آخر مرة اطّلع فيها اللاعب (أو من تاريخ الحفظ).
export function ensureAbsence(s) {
  s.absence ||= { lastSeen: s.date };
  return s.absence;
}

export function markAbsenceSeen(s) {
  ensureAbsence(s).lastSeen = s.date;
  return s.absence.lastSeen;
}

// يعيد null إن لم تمر الأيام الكافية، وإلا ملخصًا بالأرقام الفعلية من الحفظ.
export function absenceReport(s, minDays = ABSENCE_MIN_DAYS) {
  const { lastSeen } = ensureAbsence(s);
  const days = daysBetween(lastSeen, s.date);
  if (!(days >= minDays)) return null;

  const inWindow = (d) => d > lastSeen && d <= s.date;
  const ownResults = (s.fixtures || [])
    .filter(
      (f) =>
        f.played &&
        inWindow(f.date) &&
        (f.home === s.clubId || f.away === s.clubId),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const majorMessages = (s.inbox || [])
    .filter((m) => inWindow(m.date) && (m.required || m.priority === "high"))
    .slice(0, MAX_ITEMS);

  const pending = pendingActions(s);

  return {
    days,
    from: lastSeen,
    to: s.date,
    results: {
      count: ownResults.length,
      items: ownResults.slice(-MAX_ITEMS).reverse(),
    },
    major: { count: majorMessages.length, items: majorMessages },
    pending: { count: pending.length, items: pending.slice(0, MAX_ITEMS) },
  };
}
