// الإيقاع اليومي لحياة الملياردير 0.29.
// تُستدعى `empireDay` من تسلسل الأيام في time.js. عند أول يوم في الشهر تُشغَّل
// الخطافات الشهرية المسجلة في سجل الثروة (معيشة ← أصول ← عائلة ← استثمارات ←
// منافسون ← خير) بترتيب تسجيلها. استيراد وحدات الأنظمة هنا يضمن تسجيل
// خطافاتها في أي مسار تحميل.
import {
  ensureEmpire,
  settleWealthMonth,
  monthKey,
  empireMonthHooks,
  netWorth,
} from "./wealth.js";
import "./assets.js";
import { familyDay } from "./family.js";
import { charityDay } from "./charity.js";
// المنافسون قبل الاستثمارات كي يحمل تقرير الشهر ترتيب المليارديرات المحدث.
import "./rivals.js";
import "./investments.js";

export function empireDay(s) {
  const e = ensureEmpire(s);
  // مناسبات العائلة وافتتاحات الخير تُفحص كل يوم.
  familyDay(s);
  charityDay(s);
  if (s.date.slice(8, 10) !== "01") return null;
  const mk = monthKey(s.date);
  if (e.lastMonthSettle === mk) return null;
  e.lastMonthSettle = mk;
  // صافي الثروة عند بداية الشهر — يُقاس قبل أي تدفق ليظهر تغيّر الشهر كاملًا.
  e.monthTrack = { income: 0, expenses: 0, returns: 0, startNet: netWorth(s) };
  // المعيشة والدخل أولًا: كل الأنظمة الأخرى تقرأ الشخصي بعدهما.
  const living = settleWealthMonth(s);
  const extras = {};
  for (const hook of empireMonthHooks()) {
    const rec = hook(s);
    if (rec && typeof rec === "object") Object.assign(extras, rec);
  }
  e.lastLiving = living;
  return { month: mk, living, extras };
}
