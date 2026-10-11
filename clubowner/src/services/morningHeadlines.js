// الدفعة 7 — القسم 2: عناوين الصباح 📰.
// أعلى 5–7 أخبار لليوم، مرتبة بالأولوية، كل واحد سطر واحد يُقرأ في دقيقة.
// دالة نقية تقرأ الحالة المحفوظة فقط (بريد، مباريات، ملف الصحافة) — لا حالة جديدة.
import { ownFixtures } from "./calendar.js";
import { lastPlayedFixture } from "./matchReport.js";
import { pendingActions } from "./inbox.js";
import { daysBetween } from "../core/utils.js";
import { extendedClub as clubBy } from "../data/expandedCatalog.js";

export const HEADLINE_MAX = 7;
const MAX_AGE_DAYS = 7;
const LINE_MAX = 90;

// الأولوية: قرار مطلوب > نتيجة حديثة > مباراة قادمة قريبة > خبر صحفي > بريد عادي.
const KIND_SCORE = { alert: 110, decision: 100, match: 90, fixture: 75, press: 60, mail: 40 };

const clip = (text) => {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  return t.length > LINE_MAX ? `${t.slice(0, LINE_MAX - 1)}…` : t;
};

// ترتيب ثابت: الأعلى درجة، ثم الأحدث، ثم الأقدم إدخالًا (للتكرار المتساوي).
export function morningHeadlines(s) {
  const items = [];
  const ageOf = (date) => (date ? daysBetween(date, s.date) : Infinity);
  const push = (kind, date, title, ref = null, bonus = 0) => {
    const age = ageOf(date);
    if (age < 0 || age > MAX_AGE_DAYS) return;
    items.push({
      kind,
      date,
      ref,
      title: clip(title),
      score: KIND_SCORE[kind] + bonus - age,
      order: items.length,
    });
  };

  // قرارات تنتظر ردك.
  for (const m of pendingActions(s)) push("decision", m.date, m.title, m.id, 5);

  // آخر نتيجة لك.
  const last = lastPlayedFixture(s);
  if (last) {
    const home = clubBy(last.home).short,
      away = clubBy(last.away).short;
    push(
      "match",
      last.date,
      `${home} ${last.homeGoals}–${last.awayGoals} ${away}`,
      last.id,
    );
  }

  // أقرب مباراة لك خلال 3 أيام.
  const next = ownFixtures(s).find((f) => !f.played && f.date >= s.date);
  if (next && daysBetween(s.date, next.date) <= 3)
    push("fixture", next.date, `${clubBy(next.home).short} – ${clubBy(next.away).short}`, next.id);

  // أخبار الصحافة (الحفظات الموسّعة فقط).
  for (const n of s.press?.news || []) push("press", n.date, n.title);

  // إشعار عاجل غير مطلوب الرد (مثل كسر شرط جزائي تلقائي): أعلى من كل شيء.
  for (const m of s.inbox || [])
    if (!m.required && m.priority === "high") push("alert", m.date, m.title, m.id);

  // بريد عادي غير مطلوب.
  for (const m of s.inbox || [])
    if (!m.required && m.priority !== "high") push("mail", m.date, m.title, m.id);

  // أزل التكرار بالعنوان مع الإبقاء على الأعلى درجة.
  const sorted = items.sort(
    (a, b) => b.score - a.score || a.order - b.order,
  );
  const seen = new Set();
  const out = [];
  for (const it of sorted) {
    if (seen.has(it.title)) continue;
    seen.add(it.title);
    out.push(it);
    if (out.length === HEADLINE_MAX) break;
  }
  return out;
}
