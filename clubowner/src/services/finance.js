import { salaryLiability } from "./employment.js";
import { difficulty } from "../models/difficulty.js";
import { uid, safeAmount, assert, addDays } from "../core/utils.js";
import { message } from "./inbox.js";
export function post(s, amount, category, description, key) {
  assert(Number.isSafeInteger(amount), "مبلغ غير صالح.");
  if (s.finance.ledger.some((e) => e.key === key)) return false;
  s.finance.cash += amount;
  s.finance.ledger.unshift({
    id: uid(s, "entry"),
    date: s.date,
    amount,
    category,
    description,
    key,
  });
  return true;
}
// 0.23: خزنة المالك السرية — زر غش مخفي لمن يعرف مكانه. الإيداع يمر عبر
// post() فيُسجَّل في الدفاتر ويحترم المحرك مثل أي تدفق نقدية حقيقي.
export function secretDeposit(s, amount) {
  assert(
    Number.isSafeInteger(amount) && amount > 0 && amount <= 1000000000,
    "مبلغ الإيداع غير صالح.",
  );
  const ok = post(
    s,
    amount,
    "vault",
    "خزنة المالك السرية",
    uid(s, "vault"),
  );
  assert(ok, "تعذر تنفيذ الإيداع.");
  return s.finance.cash;
}
export function obligation(
  s,
  { amount, due, category, description, key, ref = null },
) {
  safeAmount(amount);
  if (s.finance.obligations.some((o) => o.key === key)) return;
  s.finance.obligations.push({
    id: uid(s, "ob"),
    amount,
    due,
    category,
    description,
    key,
    ref,
    status: "pending",
  });
}
export const wages = (s) =>
  s.players.reduce((n, p) => n + salaryLiability(s, p), 0);
export const operatingCosts = (s) =>
  Math.round(
    (s.facilities.reduce(
      (a, f) => a + f.monthlyCost + (f.staff ? f.staffCost : 0),
      0,
    ) +
      380000) *
      difficulty(s).operating,
  ) +
  (s.staff || [])
    .filter((p) => p.status === "employed")
    .reduce((n, p) => n + p.salary, 0);
// 0.17: monthly salaries of legend staff (coaches/ambassadors). Comeback
// players live in s.players and are already covered by wages(). Kept here
// (not in operatingCosts) because services/legends.js posts them itself.
export const legendPayroll = (s) =>
  (s.legends?.contracts || [])
    .filter((c) => c.status === "active" && c.kind !== "player")
    .reduce((n, c) => n + (c.salary || 0), 0);
export const liabilities = (s) =>
  s.finance.obligations
    .filter((o) => o.status === "pending" && o.category !== "sponsor-income")
    .reduce((a, o) => a + o.amount, 0);
export const futureIncome = (s) =>
  s.finance.obligations
    .filter((o) => o.status === "pending" && o.category === "sponsor-income")
    .reduce((a, o) => a + o.amount, 0);
export function financeDay(s) {
  for (const o of s.finance.obligations) {
    if (o.status !== "pending" || o.due > s.date) continue;
    const posted = post(
      s,
      o.category === "sponsor-income" ? o.amount : -o.amount,
      o.category,
      o.description,
      o.key,
    );
    if (posted && o.category === "transfer") {
      const seller = s.negotiations.find((n) => n.id === o.ref)?.seller;
      if (Object.hasOwn(s.expansion?.budgets || {}, seller))
        s.expansion.budgets[seller] += o.amount;
    }
    o.status = "paid";
  }
  if (s.date.endsWith("-01")) {
    post(s, -wages(s), "wages", "مرتبات اللاعبين الشهرية", "wages-" + s.date);
    post(
      s,
      -operatingCosts(s),
      "operations",
      "تشغيل المنشآت والموظفين",
      "ops-" + s.date,
    );
    message(s, {
      title: "التقرير المالي الشهري جاهز",
      body: "تم سداد المرتبات وتكاليف التشغيل. راجع كشف الحساب والتزامات الشهر القادم.",
      category: "finance",
    });
  }
  if (s.finance.cash < 0 && !s.finance.liquidityWarning) {
    s.finance.liquidityWarning = true;
    message(s, {
      title: "عجز في السيولة يحتاج قرارك",
      body: "الرصيد أصبح سالبًا بعد سداد الالتزامات. راجع التمويل والمصروفات؛ التعاقدات والمشروعات الجديدة تتطلب سيولة كافية.",
      category: "finance",
      required: true,
      kind: "liquidity",
      priority: "high",
    });
  }
  if (s.finance.cash >= 0) s.finance.liquidityWarning = false;
}
export function takeLoan(s) {
  assert(s.finance.loans.length < 2, "الحد الأقصى قرضان في هذه النسخة.");
  const id = uid(s, "loan"),
    amount = 5000000,
    total = 5400000;
  s.finance.loans.push({ id, amount, total, date: s.date });
  post(s, amount, "loan", "تمويل بنكي تجريبي لمدة سنة", id);
  for (let i = 1; i <= 12; i++)
    obligation(s, {
      amount: 450000,
      due: addDays(s.date, 30 * i),
      category: "loan-payment",
      description: "قسط قرض شامل تكلفة التمويل",
      key: id + "-" + i,
      ref: id,
    });
  message(s, {
    title: "تم إيداع التمويل",
    body: "٥ ملايين جنيه دخلت الخزينة. إجمالي السداد ٥٫٤ مليون على ١٢ دفعة كل ٣٠ يومًا. النموذج تمويلي مبسط، وليس عرضًا بنكيًا حقيقيًا.",
    category: "finance",
  });
}
export function forecast(s) {
  const end = addDays(s.date, 30);
  const obs = s.finance.obligations.filter(
    (o) => o.status === "pending" && o.due <= end,
  );
  return {
    income: obs
      .filter((o) => o.category === "sponsor-income")
      .reduce((a, o) => a + o.amount, 0),
    out:
      obs
        .filter((o) => o.category !== "sponsor-income")
        .reduce((a, o) => a + o.amount, 0) +
      wages(s) +
      operatingCosts(s) +
      legendPayroll(s),
  };
}
