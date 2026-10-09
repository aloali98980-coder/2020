// مكتب المالية: تقارير شهرية متجددة، توقع سيولة ٣٠ يومًا، وتحذيرات قابلة للعرض.
import { addDays } from "../../core/utils.js";
import {
  forecast,
  futureIncome,
  liabilities,
  legendPayroll,
  operatingCosts,
  post,
  wages,
} from "../finance.js";
import { message } from "../inbox.js";
import { corpPayroll, ensureStaffCorp } from "./staffCorp.js";

const MONTHS_TO_KEEP = 24;

export function financeOfficeSnapshot(s) {
  const office = ensureStaffCorp(s).financeOffice;
  const nextMonth = forecast(s);
  const playerPayroll = wages(s);
  const staffPayroll = corpPayroll(s);
  const monthlyOperations = operatingCosts(s);
  const monthlyLegendPayroll = legendPayroll(s);
  const forecastOut = nextMonth.out + staffPayroll;
  const projectedCash = s.finance.cash + nextMonth.income - forecastOut;
  const outstandingLiabilities = liabilities(s);
  const incoming = futureIncome(s);
  const currentMonth = s.date.slice(0, 7);
  const monthNet = s.finance.ledger
    .filter((entry) => entry.date?.slice(0, 7) === currentMonth)
    .reduce((total, entry) => total + entry.amount, 0);
  const warnings = [];
  if (s.finance.cash < 0) warnings.push("cash-deficit");
  if (projectedCash < 0) warnings.push("projected-deficit");
  if (s.finance.wageBudget > 0 && playerPayroll > s.finance.wageBudget)
    warnings.push("payroll-over-budget");
  if (
    outstandingLiabilities > Math.max(0, s.finance.cash) * 0.75 &&
    outstandingLiabilities > 0
  )
    warnings.push("liability-pressure");

  return {
    date: s.date,
    month: currentMonth,
    cash: s.finance.cash,
    income30: nextMonth.income,
    out30: forecastOut,
    projectedCash,
    playerPayroll,
    staffPayroll,
    operatingCosts: monthlyOperations,
    legendPayroll: monthlyLegendPayroll,
    liabilities: outstandingLiabilities,
    futureIncome: incoming,
    monthNet,
    warnings,
    audited: Boolean(office.auditUntil && office.auditUntil >= s.date),
    loans: s.finance.loans?.length || 0,
    forecastThrough: addDays(s.date, 30),
  };
}

export function financeOfficeDay(s) {
  const office = ensureStaffCorp(s).financeOffice;
  if (!s.date.endsWith("-01")) return null;
  const month = s.date.slice(0, 7);
  if (office.lastReport?.month === month) return office.lastReport;

  const report = financeOfficeSnapshot(s);
  office.lastReport = report;
  office.reports ||= [];
  office.reports.unshift(report);
  office.reports.length = Math.min(office.reports.length, MONTHS_TO_KEEP);
  if (report.warnings.length) {
    message(s, {
      title: "تحذير المكتب المالي الشهري",
      body: `رُصدت ${report.warnings.length} مؤشرات مالية تحتاج مراجعة. الرصيد المتوقع خلال ٣٠ يومًا: ${report.projectedCash.toLocaleString()}.`,
      category: "finance",
      kind: "staff-finance-warning",
    });
  }
  return report;
}
