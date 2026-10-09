// شاشة «الإدارة الشاملة» — تبويبات الهيكل والسوق والمقر والاجتماع أولًا،
// وتُضاف تبويبات المجموعات التالية (الرياضي/الفني/الكشافين/الأكاديمية/التسويق/السوشيال/القانونية/المالية).
import { tr } from "../i18n/index.js";
import { money, num, esc } from "../ui/format.js";
import { STAFF_ROLES, HQ_LEVELS, staffText } from "../data/staffCatalog.js";
import {
  ensureStaffCorp, corpEmployees, roleNameAr, hqCap, corpPayroll,
} from "../services/staff/staffCorp.js";

const l = (ar, en, fr) => tr(ar, en, fr);
export const STAFF_TABS = [
  ["org", "الهيكل التنظيمي", "Organisation", "Organigramme"],
  ["market", "سوق الموظفين", "Staff Market", "Marché du staff"],
  ["meeting", "اجتماع المجلس", "Board Meeting", "Conseil"],
  ["hq", "المقر الإداري", "Headquarters", "Siège"],
];
const roleName = (role, lang) =>
  lang === "ar" ? STAFF_ROLES[role].name.ar : lang === "fr" ? STAFF_ROLES[role].name.fr : STAFF_ROLES[role].name.en;
const empName = (e, lang) => (lang === "ar" ? e.name.ar : e.name.en);

const bar = (v) =>
  `<span class="meter"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></span>`;

function orgTab(s, lang) {
  const c = ensureStaffCorp(s);
  const rows = corpEmployees(s).map((e) => `<tr>
    <td data-no-translate>${esc(empName(e, lang))}${e.fame === "famous" ? " ★" : ""}</td>
    <td>${esc(roleName(e.role, lang))}</td>
    <td>${num(e.skill)} ${bar(e.skill)}</td>
    <td>${num(e.loyalty)}٪ ${bar(e.loyalty)}</td>
    <td>${money(e.wage)}</td>
    <td>${num(e.level)}</td>
    <td>${esc(e.contractEnd)}</td>
    <td class="row-actions">
      <button class="btn small" data-action="staff-renew" data-id="${e.id}">${l("تجديد", "Renew", "Renouveler")}</button>
      <button class="btn small" data-action="staff-promote" data-id="${e.id}">${l("ترقية", "Promote", "Promouvoir")}</button>
      <button class="btn small" data-action="staff-raise" data-id="${e.id}">${l("+١٠٪", "+10%", "+10 %")}</button>
      <button class="btn small danger" data-action="staff-fire" data-id="${e.id}">${l("فصل", "Dismiss", "Licencier")}</button>
    </td></tr>`).join("");
  const poach = c.poach.filter((o) => o.status === "open").map((o) => {
    const e = corpEmployees(s).find((x) => x.id === o.empId);
    if (!e) return "";
    return `<div class="poach-card"><strong data-no-translate>${esc(e.name.ar)}</strong>
      <span>${l("مطلوب في", "Wanted by", "Convoité par")} <b data-no-translate>${esc(o.club)}</b> — ${money(o.wage)} / ${l("حتى", "until", "jusqu’au")} ${esc(o.deadline)}</span>
      <span class="row-actions">
      <button class="btn small primary" data-action="staff-poach" data-id="${o.id}" data-how="raise">${l("زيادة", "Raise", "Augmenter")}</button>
      <button class="btn small" data-action="staff-poach" data-id="${o.id}" data-how="promote">${l("ترقية", "Promote", "Promouvoir")}</button>
      <button class="btn small danger" data-action="staff-poach" data-id="${o.id}" data-how="release">${l("ترك", "Release", "Laisser")}${o.clauseFee ? ` (+${money(o.clauseFee)})` : ""}</button>
      </span></div>`;
  }).join("");
  return `<h3>${l("الهيكل التنظيمي", "Organisation Chart", "Organigramme")} (${num(c.employees.length)}/${num(hqCap(s))}) · ${l("الرواتب", "Payroll", "Salaires")}: ${money(corpPayroll(s))}</h3>
  ${poach ? `<div class="poach-list">${poach}</div>` : ""}
  <table class="staff-table"><thead><tr><th>${l("الموظف", "Employee", "Employé")}</th><th>${l("الدور", "Role", "Rôle")}</th><th>${l("المهارة", "Skill", "Compétence")}</th><th>${l("الولاء", "Loyalty", "Loyauté")}</th><th>${l("الراتب", "Wage", "Salaire")}</th><th>${l("الدرجة", "Grade", "Grade")}</th><th>${l("العقد حتى", "Contract until", "Contrat jusqu’au")}</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="8">${l("لا موظفين بعد.", "No employees yet.", "Aucun employé.")}</td></tr>`}</tbody></table>`;
}

function marketTab(s, lang) {
  const c = ensureStaffCorp(s);
  const n = c.negotiation;
  const cards = c.market.map((m) => {
    const active = n?.status === "open" && n.marketKey === m.key;
    return `<div class="market-card"><div><strong data-no-translate>${esc(lang === "ar" ? m.name.ar : m.name.en)}</strong>${m.fame === "famous" ? " ★" : ""}
      <small>${esc(roleName(m.role, lang))} · ${l("مهارة", "skill", "compétence")} ${num(m.skill)} · ${l("يطلب", "asks", "demande")} ${money(m.wageAsk)} × ${num(m.yearsAsk)}${l("سنوات", "yrs", "ans")} · ${l("حتى", "until", "jusqu’au")} ${esc(m.expires)}</small>
      ${m.clauseAsk ? `<small>${l("شرط جزائي", "Release clause", "Clause libératoire")}: ${money(m.clauseAsk)}</small>` : ""}
      ${n?.rival && active ? `<small class="rival-bid">${l("مزاد", "Auction", "Enchères")}: <b data-no-translate>${esc(n.rival.club)}</b> ${money(n.rival.wage)}</small>` : ""}
      ${n?.lastCounter && active ? `<small>${l("عرضه المضاد", "Counter", "Contre-offre")}: ${money(n.lastCounter.wage)}</small>` : ""}
      </div>
      ${active ? `<form id="staff-negotiate-form" class="neg-form" data-key="${m.key}">
        <label>${l("راتب", "Wage", "Salaire")}<input type="number" name="wage" value="${n.offer.wage}" min="20000" step="1000" required></label>
        <label>${l("سنوات", "Years", "Ans")}<input type="number" name="years" value="${n.offer.years}" min="1" max="5" required></label>
        <label>${l("مكافأة٪", "Bonus%", "Prime %")}<input type="number" name="bonus" value="${n.offer.bonus}" min="0" max="30" required></label>
        <button class="btn primary small" type="submit">${l("قدّم العرض", "Make Offer", "Proposer")} (${num(n.round + 1)}/3)</button>
        <button class="btn small" type="button" data-action="staff-neg-cancel">${l("انسحاب", "Withdraw", "Retirer")}</button>
      </form>` : `<button class="btn small primary" data-action="staff-neg-start" data-id="${m.key}" ${n ? "disabled" : ""}>${l("تفاوض", "Negotiate", "Négocier")}</button>`}
    </div>`;
  }).join("");
  return `<h3>${l("سوق الموظفين", "Staff Market", "Marché du staff")}</h3>
  <p class="hint">${l("ثلاث جولات تفاوض لكل مرشح، والمشاهير قد يدخل عليهم مزاد علني من الجولة الثانية.", "Three rounds per candidate; famous names may draw a public auction from round two.", "Trois tours par candidat ; les stars peuvent attirer des enchères dès le deuxième tour.")}</p>
  <div class="market-list">${cards || `<p>${l("السوق فارغ حاليًا.", "Market is empty.", "Marché vide.")}</p>`}</div>`;
}

function meetingTab(s) {
  const c = ensureStaffCorp(s);
  const rows = c.meeting.requests.map((r) => {
    const e = corpEmployees(s).find((x) => x.id === r.from);
    return `<tr><td data-no-translate>${esc(e?.name.ar || "—")}</td><td>${esc(roleNameAr(r.role))}</td>
    <td>${esc(r.text)} — ${money(r.amount)}</td><td>${r.status === "open"
      ? `<button class="btn small primary" data-action="staff-req" data-id="${r.id}" data-how="yes">${l("موافقة", "Approve", "Approuver")}</button>
         <button class="btn small danger" data-action="staff-req" data-id="${r.id}" data-how="no">${l("رفض", "Reject", "Refuser")}</button>`
      : r.status === "approved" ? l("اعتُمد ✓", "Approved ✓", "Approuvé ✓") : l("رُفض ✗", "Rejected ✗", "Rejeté ✗")}</td></tr>`;
  }).join("");
  return `<h3>${l("اجتماع المجلس الشهري", "Monthly Board Meeting", "Conseil mensuel")} (${esc(c.meeting.month || "—")})</h3>
  <table class="staff-table"><thead><tr><th>${l("المدير", "Director", "Directeur")}</th><th>${l("الدور", "Role", "Rôle")}</th><th>${l("الطلب", "Request", "Demande")}</th><th></th></tr></thead>
  <tbody>${rows || `<tr><td colspan="4">${l("لا طلبات هذا الشهر.", "No requests this month.", "Aucune demande ce mois-ci.")}</td></tr>`}</tbody></table>`;
}

function hqTab(s) {
  const c = ensureStaffCorp(s);
  const cur = HQ_LEVELS[c.hq.level];
  const next = HQ_LEVELS[c.hq.level + 1];
  return `<h3>${l("المقر الإداري", "Headquarters", "Siège")} — ${esc(staffText(cur.name, "ar"))}</h3>
  <p>${l("السعة", "Capacity", "Capacité")}: ${num(c.employees.length)}/${num(hqCap(s))} · ${l("الثروة الشخصية", "Personal wealth", "Fortune personnelle")}: ${money(s.empire?.personal || 0)}</p>
  ${c.hq.project ? `<p>${l("قيد البناء حتى", "Under construction until", "En construction jusqu’au")} ${esc(c.hq.project.end)}</p>`
    : next ? `<div class="hq-next"><p>${l("التالي", "Next", "Suivant")}: <strong>${esc(staffText(next.name, "ar"))}</strong> — ${l("سعة", "capacity", "capacité")} ${num(next.cap)} · ${l("تكلفة", "cost", "coût")} ${money(next.cost)} ${l("من ثروتك", "from your wealth", "sur votre fortune")}
      ${next.needsCity ? ` · ${l("يشترط برج المكاتب في المدينة الرياضية", "Requires the city office tower", "Exige la tour de bureaux de la cité")}` : ""}</p>
      <button class="btn primary" data-action="staff-hq-up">${l("بدء الترقية", "Start Upgrade", "Lancer les travaux")}</button></div>`
    : `<p>${l("بلغت البرج الإداري — القمة.", "Admin Tower reached — the top.", "Tour administrative atteinte — le sommet.")}</p>`}
  <div class="hq-ladder">${HQ_LEVELS.map((h, i) => `<span class="${i < c.hq.level ? "done" : i === c.hq.level ? "cur" : ""}">${esc(staffText(h.name, "ar"))} (${num(h.cap)})</span>`).join(" ← ")}</div>`;
}

export function staffView(s, tab = "org", lang = "ar") {
  ensureStaffCorp(s);
  const tabs = STAFF_TABS.map(([id, ar, en, fr]) =>
    `<button class="tab ${tab === id ? "active" : ""}" data-action="staff-tab" data-id="${id}">${l(ar, en, fr)}</button>`).join("");
  const body = tab === "market" ? marketTab(s, lang) : tab === "meeting" ? meetingTab(s) : tab === "hq" ? hqTab(s) : orgTab(s, lang);
  return `<section class="staff-corp"><div class="tabs">${tabs}</div><div class="tab-body">${body}</div></section>`;
}
