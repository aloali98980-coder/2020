// المجموعة ٤: ملخص المكتب المالي وتوقع السيولة والتحذيرات الشهرية.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { addDays } from "../src/core/utils.js";
import { validateSave } from "../src/core/validation.js";
import { obligation, post } from "../src/services/finance.js";
import {
  financeOfficeDay,
  financeOfficeSnapshot,
} from "../src/services/staff/financeOffice.js";
import { staffView } from "../src/features/staff.js";
import { getLanguage, setLanguage } from "../src/i18n/index.js";

const game = () => createGame({ database: "demo" });

test("التوقع يجمع السيولة والإيراد والالتزامات ورواتب الإدارة ويصدر تحذيرات", () => {
  const s = game();
  const startingCash = s.finance.cash;
  post(
    s,
    -startingCash - 500_000,
    "test-deficit",
    "اختبار عجز السيولة",
    "test-finance-office-deficit",
  );
  s.finance.wageBudget = 1;
  s.finance.obligations = [];
  obligation(s, {
    amount: 4_000_000,
    due: addDays(s.date, 9),
    category: "loan-payment",
    description: "التزام اختبار",
    key: "finance-office-liability",
  });
  obligation(s, {
    amount: 1_000_000,
    due: addDays(s.date, 16),
    category: "sponsor-income",
    description: "إيراد اختبار",
    key: "finance-office-income",
  });
  const report = financeOfficeSnapshot(s);
  assert.equal(report.cash, -500_000);
  assert.equal(
    report.staffPayroll,
    s.staffCorp.employees.reduce((sum, employee) => sum + employee.wage, 0),
  );
  assert.equal(report.liabilities, 4_000_000);
  assert.equal(report.futureIncome, 1_000_000);
  assert.ok(report.projectedCash < report.cash);
  assert.ok(report.warnings.includes("cash-deficit"));
  assert.ok(report.warnings.includes("projected-deficit"));
  assert.ok(report.warnings.includes("payroll-over-budget"));
  assert.ok(report.warnings.includes("liability-pressure"));
  validateSave(s);
});

test("التقرير الشهري يحفظ نسخة واحدة ويطلق تنبيهًا عند وجود خطر", () => {
  const s = game();
  s.date = "2026-10-01";
  const startingCash = s.finance.cash;
  post(
    s,
    -startingCash - 2_000_000,
    "test-deficit",
    "اختبار عجز السيولة",
    "test-finance-monthly-deficit",
  );
  const report = financeOfficeDay(s);
  assert.equal(report.month, "2026-10");
  assert.equal(s.staffCorp.financeOffice.lastReport.date, s.date);
  assert.equal(s.staffCorp.financeOffice.reports.length, 1);
  assert.ok(report.warnings.length > 0);
  assert.ok(s.inbox.some((entry) => entry.kind === "staff-finance-warning"));
  assert.equal(financeOfficeDay(s).month, "2026-10");
  assert.equal(s.staffCorp.financeOffice.reports.length, 1);
  validateSave(s);
});

test("واجهة المكتب المالي تعرض تحذيرات وتقارير بالفرنسية", () => {
  const s = game();
  const previous = getLanguage();
  try {
    setLanguage("fr");
    const html = staffView(s, "financeOffice", "fr");
    assert.match(html, /Bureau financier/);
    assert.match(html, /Trésorerie actuelle/);
    assert.match(html, /Le premier rapport sera enregistré/);
  } finally {
    setLanguage(previous);
  }
});
