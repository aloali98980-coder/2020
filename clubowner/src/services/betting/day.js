// الإيقاع الشهري للمراهنات 0.36 — يُستدعى من time.js أول كل شهر.
import { monthKey } from "../empire/wealth.js";
import { ensureBetting, estimateMarketValue } from "./state.js";
import { ensureEmpire, personalIncome } from "../empire/wealth.js";
import { monthlyProfit, growCustomers, competitorAI } from "./management.js";
import { regulatorTick } from "./compliance.js";
import { bettingConflictDay } from "./conflict.js";

export function bettingDay(s) {
  const b = ensureBetting(s);
  if (s.date.slice(8, 10) !== "01") return null;
  const mk = monthKey(s.date);
  if (b._lastMonth === mk) return null;
  b._lastMonth = mk;

  // سوق مراهنات عام يعمل حتى بلا شركة: نحدّث المنافسين فقط
  competitorAI(s);

  if (!b.owned) {
    return { month: mk, marketOnly: true };
  }

  // إذا قيد الإنشاء، لا أرباح بعد
  if (b.launchDate && s.date < b.launchDate) {
    return { month: mk, launching: true };
  }

  // نمو العملاء أولًا
  growCustomers(s);

  // حساب الربح
  const profit = monthlyProfit(s);
  b.lastMonthProfit = profit;
  b.totalProfit += profit;
  b.profits.push({ month: mk, profit, customers: b.customers, reputation: b.reputation });
  if (b.profits.length > 24) b.profits.shift();

  // الربح يدخل الثروة الشخصية
  if (profit !== 0) {
    if (profit > 0) personalIncome(s, profit);
    else {
      const e = ensureEmpire(s);
      const pay = Math.min(-profit, e.personal);
      e.personal -= pay;
      e.monthTrack.expenses += pay;
      if (pay < -profit) {
        e.debt += (-profit - pay);
      }
    }
  }

  // المراجعة الرقابية والامتثال
  regulatorTick(s);
  bettingConflictDay(s);

  // القيمة السوقية للاكتتاب لاحقًا
  estimateMarketValue(s);

  return { month: mk, profit, customers: b.customers };
}

export function bettingMatchDay(s, fixture) {
  // يُستدعى بعد كل مباراة للرهانات المعلقة (يُنفذ في insider.js)
  const b = ensureBetting(s);
  if (b.pendingInsider && b.pendingInsider.fixtureId === fixture?.id) {
    // التفاصيل في insider.js — نؤجل التنفيذ هناك
    return b.pendingInsider;
  }
  return null;
}
