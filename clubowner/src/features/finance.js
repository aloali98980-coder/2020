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
import { getLanguage, tr } from "../i18n/index.js";
import { boardTextFor } from "../data/boardTexts.js";
import {
  wageOverrideStatus,
  OWNER_HEADROOM_RATE,
} from "../services/wageOverride.js";
const cats = {
  vault: "الخزنة السرية",
  wages: "مرتبات",
  operations: "تشغيل",
  sponsorship: "رعاية",
  "sponsor-income": "دفعة رعاية",
  "transfer-income": "قسط بيع لاعب",
  "player-sale": "بيع لاعب",
  "sell-on": "نسبة بيع مستقبلية",
  "player-exchange": "تبادل لاعبين",
  broadcast: "بث تلفزيوني",
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
  "board-support": boardTextFor("boardLedgerSupport", null, getLanguage()),
};
const categoryLabel = (key) => {
  if (key === "transfer-income")
    return tr("قسط بيع لاعب", "Player sale instalment", "Échéance de vente du joueur");
  if (key === "player-sale") return tr("بيع لاعب", "Player sale", "Vente du joueur");
  if (key === "sell-on")
    return tr("نسبة بيع مستقبلية", "Sell-on payment", "Pourcentage à la revente");
  if (key === "player-exchange")
    return tr("تبادل لاعبين", "Player exchange", "Échange de joueurs");
  return cats[key] || key;
};
// 0.52 — «أوافق كمالك!»: تظهر عند تجاوز سقف الرواتب فقط، وتختفي بعده.
function wageOverrideView(s) {
  const st = wageOverrideStatus(s),
    pct = OWNER_HEADROOM_RATE * 100;
  const log = st.count
    ? `<details class="wage-override-log"><summary>${tr(
        "سجل موافقات المالك",
        "Owner approvals log",
        "Journal des approbations du propriétaire",
      )} (${num(st.count)})</summary><ul>${st.approvals
        .slice(0, 5)
        .map(
          (r) =>
            `<li><span>${date(r.date)} · ${tr("الموسم", "Season", "Saison")} ${num(r.season)}</span><span class="muted">${money(r.budgetBefore)} → <strong>${money(r.budgetAfter)}</strong> ${cur()}</span></li>`,
        )
        .join("")}</ul><small class="muted">${tr(
        "الحد ارتفع",
        "The ceiling rose at least",
        "Le plafond a été relevé d’au moins",
      )} ${num(pct)}% ${tr(
        "فوق الفاتورة الحالية كحد أدنى، وبلا أي خصم من الرصيد أو الرصيد الشخصي.",
        "above the current bill, with no charge to club or personal cash.",
        "au-dessus de la masse actuelle, sans aucun prélèvement.",
      )}</small></details>`
    : "";
  if (st.over)
    return `<div class="wage-override"><div class="wage-override-head">${icon("bell", 16)}<strong>${tr(
      "سقف الرواتب متجاوز",
      "Wage cap exceeded",
      "Plafond salarial dépassé",
    )}</strong><span class="muted">${tr("فاتورة", "Bill", "Masse de")} ${money(st.wages)} ${tr(
      "مقابل حد",
      "against a ceiling of",
      "contre un plafond de",
    )} ${money(st.budget)} ${cur()} — ${tr("الفجوة", "shortfall", "écart de")} ${money(st.gap)} ${cur()} ${tr(
      "شهريًا.",
      "per month.",
      "par mois.",
    )}</span></div><div class="wage-override-actions">${button(
      icon("crown", 16) +
        " " +
        tr("أوافق كمالك!", "I approve as owner!", "J’approuve en tant que propriétaire !"),
      "wage-override-approve",
      "",
      "primary",
    )}<small class="muted">${tr(
      "قرارك كمالك: الحد يرتفع فورًا إلى الفاتورة +",
      "Your call as owner: the ceiling rises at once to the bill +",
      "Votre décision : le plafond passe aussitôt à la masse +",
    )} ${num(pct)}% ${tr(
      "(بحد أدنى 100 ألف) بلا غرامة ولا خصم ولا شبهة ولا حرارة، وباقي القواعد تُحسب بعده كما هي.",
      "(minimum 100k) with no fine, deduction, suspicion, or heat, and every other rule is applied after it unchanged.",
      "(minimum 100 k) sans amende, retenue, suspicion ni pression, toutes les autres règles restant inchangées.",
    )}</small></div>${log}</div>`;
  if (st.count)
    return `<div class="wage-override ok"><div class="wage-override-head">${icon("crown", 16)}<strong>${tr(
      "موافقاتك كمالك",
      "Your owner approvals",
      "Vos approbations de propriétaire",
    )}</strong><span class="muted">${tr("الحد المعتمد", "Approved ceiling", "Plafond approuvé")} ${money(
      st.budget,
    )} ${tr("مقابل فاتورة", "against a", "contre une masse de")} ${money(st.wages)} ${cur()} — ${tr(
      "لا تجاوز الآن.",
      "nothing is over now.",
      "aucun dépassement.",
    )}</span></div>${log}</div>`;
  return "";
}
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
  )}${statCard("متحصلات منذ البداية", money(income), cur(), "تدفقات نقدية، وليست أرباحًا محاسبية", "up", "green")}${statCard("مدفوعات منذ البداية", money(out), cur(), "تشمل الأصول والأقساط والمصروفات", "down", "gold")}${statCard("التزامات مستقبلية", money(liabilities(s)), cur(), "بدون الرواتب المتجددة أو التشغيل", "calendar")}</div><div class="finance-panels"><section class="panel forecast-panel"><div class="panel-head"><h3>${icon("chart")} السيولة خلال 30 يومًا</h3>${badge("تقدير محافظ")}</div><div class="forecast-rows"><div><span>الرصيد الحالي</span><strong>${money(s.finance.cash)} ${cur()}</strong></div><div><span>متحصلات تعاقدية مجدولة</span><strong class="green">+ ${money(f.income)} ${cur()}</strong></div><div><span>دفعات + مرتبات + تشغيل</span><strong class="gold">− ${money(f.out)} ${cur()}</strong></div><div class="forecast-total"><span>الرصيد المتوقع</span><strong class="${s.finance.cash + f.income - f.out >= 0 ? "green" : "red"}">${money(s.finance.cash + f.income - f.out)} <small>${cur()}</small></strong></div></div><p class="fine-print">يشمل دورة تشغيل شهرية واحدة. لا يشمل تذاكر أو صفقات لم تُبرم، وليس قائمة ربح وخسارة محاسبية.</p></section><section class="panel budget-panel"><div class="panel-head"><h3>ميزانية التشغيل الشهرية</h3>${icon("building", 20)}</div><div class="budget-row"><span>مرتبات اللاعبين</span><b>${money(wages(s))} ${cur()}</b></div><div class="progress"><span style="width:${Math.min(100, (wages(s) / s.finance.wageBudget) * 100)}%"></span></div><small class="muted">الحد المعتمد: ${money(s.finance.wageBudget)} ${cur()} شهريًا</small><div class="budget-row spaced"><span>تشغيل المنشآت والطاقم</span><b>${money(operatingCosts(s))} ${cur()}</b></div>${legendPayroll(s) ? `<div class="budget-row spaced"><span>رواتب الأساطير (مدربون وسفراء)</span><b>${money(legendPayroll(s))} ${cur()}</b></div>` : ""}<div class="ticket-pricing"><div><strong>سعر التذكرة</strong><small>زيادة السعر قد تقلل الحضور</small></div><button class="btn secondary small" data-action="ticket-price">${num(s.ticketPrice)} ${cur()} ${icon("settings", 15)}</button></div>${wageOverrideView(s)}</section></div><section class="panel"><div class="panel-head"><div class="filter-tabs inline"><button data-action="finance-tab" data-id="ledger" class="${tab === "ledger" ? "active" : ""}">كشف الحساب</button><button data-action="finance-tab" data-id="obligations" class="${tab === "obligations" ? "active" : ""}">الدفعات القادمة</button></div><span class="muted">جميع القيم بالجنيه المصري</span></div><div class="table-scroll"><table><thead><tr><th>التاريخ</th><th>البيان</th><th>التصنيف</th><th>القيمة</th><th>الحالة</th></tr></thead><tbody>${tab === "ledger" ? s.finance.ledger.map((e) => `<tr><td>${date(e.date)}</td><td>${esc(e.description)}</td><td>${badge(categoryLabel(e.category))}</td><td class="money-cell ${e.amount >= 0 ? "green" : "muted"}" dir="auto">${e.amount > 0 ? "+ " : ""}${money(e.amount, false)}</td><td>${badge("مسجّلة", "green")}</td></tr>`).join("") : obs.map((o) => `<tr><td>${date(o.due)}</td><td>${esc(o.description)}</td><td>${badge(categoryLabel(o.category))}</td><td class="money-cell ${["sponsor-income", "transfer-income"].includes(o.category) ? "green" : "gold"}">${["sponsor-income", "transfer-income"].includes(o.category) ? "+" : "−"} ${money(o.amount, false)}</td><td>${badge(o.due <= addDays(s.date, 30) ? "خلال 30 يومًا" : "مجدولة", o.due <= addDays(s.date, 30) ? "gold" : "")}</td></tr>`).join("")}</tbody></table>${(tab === "ledger" ? !s.finance.ledger.length : !obs.length) ? empty("لا توجد حركات", "كل حركة مالية هتظهر هنا بشكل تلقائي.", "finance") : ""}</div></section>`;
}
