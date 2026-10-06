import {
  heading,
  statCard,
  badge,
  button,
  empty,
  infoNote,
} from "../components/shared.js";
import { icon } from "../components/icons.js";
import { money, moneyLocal, num, date, esc , cur} from "../ui/format.js";
import {
  wages,
  liabilities,
  operatingCosts,
  forecast,
  legendPayroll,
} from "../services/finance.js";
import { ownerCountry } from "../services/sponsors.js";
import { addDays } from "../core/utils.js";
const cats = {
  vault: "الخزنة السرية",
  wages: "مرتبات",
  operations: "تشغيل",
  sponsorship: "رعاية",
  "sponsor-income": "دفعة رعاية",
  "sponsor-bonus": "مكافأة رعاية",
  transfer: "انتقال",
  signing: "توقيع",
  agent: "وكيل",
  construction: "منشآت",
  tickets: "تذاكر",
  "match-costs": "تنظيم مباراة",
  loan: "تمويل",
  "loan-payment": "سداد قرض",
  "legend-fee": "أسطورة · مقدم/تعويض",
  "legend-salary": "أسطورة · راتب",
  "legend-income": "أسطورة · حقوق صورة",
};
export function financeView(s, tab = "ledger") {
  const country = ownerCountry(s),
    f = forecast(s),
    income = s.finance.ledger
      .filter((e) => e.amount > 0 && e.category !== "loan")
      .reduce((a, e) => a + e.amount, 0),
    out = s.finance.ledger
      .filter((e) => e.amount < 0)
      .reduce((a, e) => a - e.amount, 0),
    obs = s.finance.obligations
      .filter((o) => o.status === "pending")
      .sort((a, b) => a.due.localeCompare(b.due));
  return `${heading("كل جنيه له حكاية", "الإدارة المالية", "افصل الرصيد المتاح عن الدخل والالتزامات المستقبلية.", button(icon("finance", 17) + " خيارات التمويل", "loan-modal", "", "secondary"))}<div class="stats-grid">${statCard(
    "الرصيد الحالي",
    money(s.finance.cash),
    cur(),
    "رصيد افتتاحي + كل الحركات المسجلة" +
      (country === "eg"
        ? ""
        : ` · ≈ ${moneyLocal(s.finance.cash, country)} بسعر عرض ثابت`),
    "finance",
    "green",
  )}${statCard("متحصلات منذ البداية", money(income), cur(), "تدفقات نقدية، وليست أرباحًا محاسبية", "up", "green")}${statCard("مدفوعات منذ البداية", money(out), cur(), "تشمل الأصول والأقساط والمصروفات", "down", "gold")}${statCard("التزامات مستقبلية", money(liabilities(s)), cur(), "بدون الرواتب المتجددة أو التشغيل", "calendar")}</div><div class="finance-panels"><section class="panel forecast-panel"><div class="panel-head"><h3>${icon("chart")} السيولة خلال ٣٠ يومًا</h3>${badge("تقدير محافظ")}</div><div class="forecast-rows"><div><span>الرصيد الحالي</span><strong>${money(s.finance.cash)} ${cur()}</strong></div><div><span>متحصلات تعاقدية مجدولة</span><strong class="green">+ ${money(f.income)} ${cur()}</strong></div><div><span>دفعات + مرتبات + تشغيل</span><strong class="gold">− ${money(f.out)} ${cur()}</strong></div><div class="forecast-total"><span>الرصيد المتوقع</span><strong class="${s.finance.cash + f.income - f.out >= 0 ? "green" : "red"}">${money(s.finance.cash + f.income - f.out)} <small>${cur()}</small></strong></div></div><p class="fine-print">يشمل دورة تشغيل شهرية واحدة. لا يشمل تذاكر أو صفقات لم تُبرم، وليس قائمة ربح وخسارة محاسبية.</p></section><section class="panel budget-panel"><div class="panel-head"><h3>ميزانية التشغيل الشهرية</h3>${icon("building", 20)}</div><div class="budget-row"><span>مرتبات اللاعبين</span><b>${money(wages(s))} ${cur()}</b></div><div class="progress"><span style="width:${Math.min(100, (wages(s) / s.finance.wageBudget) * 100)}%"></span></div><small class="muted">الحد المعتمد: ${money(s.finance.wageBudget)} ${cur()} شهريًا</small><div class="budget-row spaced"><span>تشغيل المنشآت والطاقم</span><b>${money(operatingCosts(s))} ${cur()}</b></div>${legendPayroll(s) ? `<div class="budget-row spaced"><span>رواتب الأساطير (مدربون وسفراء)</span><b>${money(legendPayroll(s))} ${cur()}</b></div>` : ""}<div class="ticket-pricing"><div><strong>سعر التذكرة</strong><small>زيادة السعر قد تقلل الحضور</small></div><button class="btn secondary small" data-action="ticket-price">${num(s.ticketPrice)} ${cur()} ${icon("settings", 15)}</button></div></section></div><section class="panel"><div class="panel-head"><div class="filter-tabs inline"><button data-action="finance-tab" data-id="ledger" class="${tab === "ledger" ? "active" : ""}">كشف الحساب</button><button data-action="finance-tab" data-id="obligations" class="${tab === "obligations" ? "active" : ""}">الدفعات القادمة</button></div><span class="muted">جميع القيم بالجنيه المصري</span></div><div class="table-scroll"><table><thead><tr><th>التاريخ</th><th>البيان</th><th>التصنيف</th><th>القيمة</th><th>الحالة</th></tr></thead><tbody>${tab === "ledger" ? s.finance.ledger.map((e) => `<tr><td>${date(e.date)}</td><td>${esc(e.description)}</td><td>${badge(cats[e.category] || e.category)}</td><td class="money-cell ${e.amount >= 0 ? "green" : "muted"}" dir="auto">${e.amount > 0 ? "+ " : ""}${money(e.amount, false)}</td><td>${badge("مسجّلة", "green")}</td></tr>`).join("") : obs.map((o) => `<tr><td>${date(o.due)}</td><td>${esc(o.description)}</td><td>${badge(cats[o.category] || o.category)}</td><td class="money-cell ${o.category === "sponsor-income" ? "green" : "gold"}">${o.category === "sponsor-income" ? "+" : "−"} ${money(o.amount, false)}</td><td>${badge(o.due <= addDays(s.date, 30) ? "خلال ٣٠ يومًا" : "مجدولة", o.due <= addDays(s.date, 30) ? "gold" : "")}</td></tr>`).join("")}</tbody></table>${(tab === "ledger" ? !s.finance.ledger.length : !obs.length) ? empty("لا توجد حركات", "كل حركة مالية هتظهر هنا بشكل تلقائي.", "finance") : ""}</div></section>`;
}
