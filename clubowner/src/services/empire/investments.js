// استثمارات «حياة الملياردير» 0.29 — محفظة شهرية وتقرير «حياتك».
// الإيداع والسحب في أي وقت؛ العوائد تُحسم أول كل شهر بمعادلات حتمية على
// أرقام عشوائية بذرة الحفظة، ثم يبني التقرير الشهري: دخل/صرف/عوائد/
// تغيّر الثروة/سعادة العائلة.
import { assert } from "../../core/utils.js";
import { random } from "../../core/utils.js";
import { message } from "../inbox.js";
import { empireText } from "../../data/empireTexts.js";
import { INVEST_VEHICLES, VEHICLE_ORDER } from "../../data/empireInvestments.js";
import {
  ensureEmpire,
  netWorth,
  registerEmpireMonthHook,
} from "./wealth.js";
import { familyHappiness } from "./family.js";

// ── الإيداع والسحب ───────────────────────────────────────────────────────────
export function invest(s, kind, amount) {
  const e = ensureEmpire(s);
  const v = INVEST_VEHICLES[kind];
  assert(v, empireText("vehicleUnknown"));
  assert(Number.isSafeInteger(amount) && amount > 0, empireText("investInvalid"));
  assert(e.personal >= amount, empireText("investNoFunds"));
  e.personal -= amount;
  e.portfolio[kind] += amount;
  return e.portfolio[kind];
}

export function withdraw(s, kind, amount) {
  const e = ensureEmpire(s);
  const v = INVEST_VEHICLES[kind];
  assert(v, empireText("vehicleUnknown"));
  assert(Number.isSafeInteger(amount) && amount > 0, empireText("investInvalid"));
  assert(e.portfolio[kind] >= amount, empireText("withdrawTooMuch"));
  e.portfolio[kind] -= amount;
  e.personal += amount;
  return e.personal;
}

export const portfolioTotal = (s) =>
  VEHICLE_ORDER.reduce((sum, k) => sum + (s.empire?.portfolio[k] || 0), 0);

// ── العوائد الشهرية (دالة نقية قابلة للاختبار) ──────────────────────────────
// تُعيد نسبة العائد الشهرية لمركبة حسب رقم عشوائي واحد في [0,1).
export function vehicleReturn(kind, r) {
  switch (kind) {
    case "deposit":
      return 0.5;
    case "rental":
      return 0.8;
    case "stocks":
      return 1.2 + (r - 0.5) * 6; // −1.8٪ … +4.2٪
    case "startup":
      if (r < 0.5) return 5;
      if (r < 0.8) return 1;
      if (r < 0.9) return -10;
      return -30;
    case "coin":
      if (r < 0.08) return -40;
      if (r > 0.94) return 40;
      return (r - 0.5) * 20; // −10٪ … +10٪
    default:
      return 0;
  }
}

function settlePortfolio(s) {
  const e = ensureEmpire(s);
  const gains = {};
  for (const k of VEHICLE_ORDER) {
    const bal = e.portfolio[k];
    if (bal <= 0) {
      gains[k] = 0;
      continue;
    }
    const pct = vehicleReturn(k, random(s));
    const delta = Math.round((bal * pct) / 100);
    const next = Math.max(0, bal + delta);
    e.portfolio[k] = next;
    gains[k] = next - bal;
    e.monthTrack.returns += next - bal;
  }
  return gains;
}

// ── تقرير «حياتك» الشهري ─────────────────────────────────────────────────────
function buildReport(s, gains) {
  const e = ensureEmpire(s);
  const startNet = e.monthTrack.startNet ?? netWorth(s);
  const endNet = netWorth(s);
  const report = {
    month: e.lastMonthSettle,
    income: e.monthTrack.income,
    expenses: e.monthTrack.expenses,
    returns: e.monthTrack.returns,
    startNet,
    endNet,
    netDelta: endNet - startNet,
    wifeHappiness: familyHappiness(s),
    rank: typeof e.rankThisMonth === "number" ? e.rankThisMonth : null,
    gains,
  };
  e.reports.unshift(report);
  if (e.reports.length > 36) e.reports.length = 36;
  e.portfolio.history.unshift({ month: report.month, gains });
  if (e.portfolio.history.length > 60) e.portfolio.history.length = 60;
  message(s, {
    title: empireText("lifeReportTitle"),
    body:
      `${empireText("lifeReportBody")}\n` +
      `${empireText("monthLabel")}: ${report.month}\n` +
      `${empireText("lifeIncome")}: ${report.income}\n` +
      `${empireText("lifeExpenses")}: ${report.expenses}\n` +
      `${empireText("lifeReturns")}: ${report.returns}\n` +
      `${empireText("empireNetWorth")}: ${report.endNet}`,
    category: "events",
  });
  return report;
}

function investmentsMonthHook(s) {
  const gains = settlePortfolio(s);
  buildReport(s, gains);
  return { returns: s.empire.monthTrack.returns };
}
registerEmpireMonthHook(investmentsMonthHook);
