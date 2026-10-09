// شاشة «الإدارة الشاملة» — تبويبات الهيكل والسوق والمقر والاجتماع أولًا،
// وتُضاف تبويبات المجموعات التالية (الرياضي/الفني/الكشافين/الأكاديمية/التسويق/السوشيال/القانونية/المالية).
import { tr } from "../i18n/index.js";
import { money, num, esc } from "../ui/format.js";
import { STAFF_ROLES, HQ_LEVELS, staffText, SPORTING_PHILOSOPHIES, SCOUT_REGIONS, REGION_IDS } from "../data/staffCatalog.js";
import {
  ensureStaffCorp, corpEmployees, hqCap, corpPayroll,
} from "../services/staff/staffCorp.js";
import { sportingDirector, autoCap, effectiveFreedom, sportingDelegationActive } from "../services/staff/sporting.js";
import { gkSkillOf, fitnessSkillOf, doctorSkillOf, fitnessFactor, gkGainBonus } from "../services/staff/effects.js";

const l = (ar, en, fr) => tr(ar, en, fr);
export const STAFF_TABS = [
  ["org", "الهيكل التنظيمي", "Organisation", "Organigramme"],
  ["market", "سوق الموظفين", "Staff Market", "Marché du staff"],
  ["sporting", "المدير الرياضي", "Sporting Dir.", "Directeur sportif"],
  ["tech", "الطاقم الفني", "Technical", "Technique"],
  ["scouts", "الكشافون", "Scouts", "Recruteurs"],
  ["meeting", "اجتماع المجلس", "Board Meeting", "Conseil"],
  ["hq", "المقر الإداري", "Headquarters", "Siège"],
];
const roleName = (role, lang) =>
  lang === "ar" ? STAFF_ROLES[role].name.ar : lang === "fr" ? STAFF_ROLES[role].name.fr : STAFF_ROLES[role].name.en;
const empName = (e, lang) => (lang === "ar" ? e.name.ar : lang === "fr" ? e.name.fr || e.name.en : e.name.en);

const bar = (v) =>
  `<span class="meter"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></span>`;

const orgNode = (s, role, lang) => {
  const staff = corpEmployees(s).filter((e) => e.role === role);
  const title = roleName(role, lang);
  return `<div class="org-node"><strong>${esc(title)}</strong>${staff.length
    ? staff.map((e) => `<span data-no-translate>${esc(empName(e, lang))} · ${l("ولاء", "Loyalty", "Loyauté")} ${num(e.loyalty)}٪</span>`).join("")
    : `<span class="vacant">${l("شاغر", "Vacant", "Vacant")}</span>`}</div>`;
};
function orgTree(s, lang) {
  const executives = ["sporting", "marketing", "finance", "lawyer"];
  const football = ["coach", "doctor", "fitness", "gk", "scout", "academy"];
  const support = ["social", "assistant"];
  return `<div class="org-tree" aria-label="${l("الشجرة التنظيمية", "Organisation chart", "Organigramme")}">
    <div class="org-node org-owner"><small>${l("الرئيس والمالك", "Chair & owner", "Président-propriétaire")}</small><strong data-no-translate>${esc(s.owner)}</strong></div>
    <div class="org-branch"><h4>${l("الإدارة العليا", "Executive team", "Direction générale")}</h4><div class="org-children">${executives.map((r) => orgNode(s, r, lang)).join("")}</div></div>
    <div class="org-branch"><h4>${l("الكرة والأداء", "Football & performance", "Football et performance")}</h4><div class="org-children">${football.map((r) => orgNode(s, r, lang)).join("")}</div></div>
    <div class="org-branch"><h4>${l("الاتصال والمساندة", "Communications & support", "Communication et soutien")}</h4><div class="org-children">${support.map((r) => orgNode(s, r, lang)).join("")}</div></div>
  </div>`;
}

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
  ${orgTree(s, lang)}
  ${poach ? `<div class="poach-list">${poach}</div>` : ""}
  <table class="staff-table"><thead><tr><th>${l("الموظف", "Employee", "Employé")}</th><th>${l("الدور", "Role", "Rôle")}</th><th>${l("المهارة", "Skill", "Compétence")}</th><th>${l("الولاء", "Loyalty", "Loyauté")}</th><th>${l("الراتب", "Wage", "Salaire")}</th><th>${l("الدرجة", "Grade", "Grade")}</th><th>${l("العقد حتى", "Contract until", "Contrat jusqu’au")}</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="8">${l("لا موظفين بعد.", "No employees yet.", "Aucun employé.")}</td></tr>`}</tbody></table>`;
}

function marketTab(s, lang) {
  const c = ensureStaffCorp(s);
  const n = c.negotiation;
  const cards = c.market.map((m) => {
    const active = n?.status === "open" && n.marketKey === m.key;
    return `<div class="market-card"><div><strong data-no-translate>${esc(lang === "ar" ? m.name.ar : lang === "fr" ? m.name.fr || m.name.en : m.name.en)}</strong>${m.fame === "famous" ? " ★" : ""}
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

function meetingTab(s, lang) {
  const c = ensureStaffCorp(s);
  const rows = c.meeting.requests.map((r) => {
    const e = corpEmployees(s).find((x) => x.id === r.from);
    const reportValue = r.report?.money ? money(r.report.value) : num(r.report?.value ?? 0);
    const report = r.report
      ? `<strong>${esc(staffText(r.report.label, lang))}: ${reportValue}</strong><small>${esc(staffText(r.report.note, lang))}</small>`
      : l("لا يوجد تقرير", "No report", "Aucun rapport");
    const request = `${staffText(r.text, lang)} — ${money(r.amount)}`;
    const authority = staffText(r.authority, lang);
    const granted = c.authorities?.[r.role]?.until >= s.date;
    return `<tr><td data-no-translate>${esc(e ? empName(e, lang) : "—")}</td><td>${esc(roleName(r.role, lang))}</td>
    <td>${report}</td><td>${esc(request)}<small>${l("التفويض المطلوب", "Requested authority", "Pouvoir demandé")}: ${esc(authority)}${granted ? ` · ${l("ممنوح حتى", "Granted until", "Accordé jusqu’au")} ${esc(c.authorities[r.role].until)}` : ""}</small></td><td>${r.status === "open"
      ? `<button class="btn small primary" data-action="staff-req" data-id="${r.id}" data-how="yes">${l("موافقة", "Approve", "Approuver")}</button>
         <button class="btn small danger" data-action="staff-req" data-id="${r.id}" data-how="no">${l("رفض", "Reject", "Refuser")}</button>`
      : r.status === "approved" ? l("اعتُمد ✓", "Approved ✓", "Approuvé ✓") : l("رُفض ✗", "Rejected ✗", "Rejeté ✗")}</td></tr>`;
  }).join("");
  return `<h3>${l("اجتماع المجلس الشهري", "Monthly Board Meeting", "Conseil mensuel")} (${esc(c.meeting.month || "—")})</h3>
  <table class="staff-table"><thead><tr><th>${l("المدير", "Director", "Directeur")}</th><th>${l("الدور", "Role", "Rôle")}</th><th>${l("تقرير المدير", "Director’s report", "Rapport du directeur")}</th><th>${l("طلب الميزانية والتفويض", "Budget & authority request", "Demande de budget et de pouvoir")}</th><th></th></tr></thead>
  <tbody>${rows || `<tr><td colspan="5">${l("لا طلبات هذا الشهر.", "No requests this month.", "Aucune demande ce mois-ci.")}</td></tr>`}</tbody></table>`;
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

function sportingTab(s, lang) {
  const c = ensureStaffCorp(s);
  const dir = sportingDirector(s);
  const sp = c.sporting;
  const effective = effectiveFreedom(s);
  const delegated = sportingDelegationActive(s);
  const authorityUntil = c.authorities?.sporting?.until || sp.authorityUntil;
  const phils = Object.entries(SPORTING_PHILOSOPHIES).map(([id, p]) =>
    `<button class="btn small ${sp.philosophy === id ? "primary" : ""}" data-action="staff-phil" data-id="${id}">${esc(lang === "ar" ? p.name.ar : lang === "fr" ? p.name.fr : p.name.en)}</button>`).join(" ");
  const deals = c.deals.filter((d) => d.status === "pending").map((d) =>
    `<tr><td>${d.kind === "buy" ? l("شراء", "Buy", "Achat") : l("بيع", "Sell", "Vente")}</td>
    <td data-no-translate>${esc(d.name)}</td><td>${num(d.rating)}</td><td>${money(d.fee)}</td><td>${esc(d.expires)}</td>
    <td><button class="btn small primary" data-action="staff-deal" data-id="${d.id}" data-how="yes">${l("موافقة", "Approve", "Approuver")}</button>
    <button class="btn small danger" data-action="staff-deal" data-id="${d.id}" data-how="no">${l("رفض", "Reject", "Refuser")}</button></td></tr>`).join("");
  const log = sp.log.slice(0, 12).map((e) => `<li><small>${esc(e.date)}</small> ${esc(staffText(e.text, lang))}</li>`).join("");
  const st = sp.season;
  return `<h3>${l("المدير الرياضي", "Sporting Director", "Directeur sportif")} — <span data-no-translate>${esc(dir ? empName(dir, lang) : l("شاغر", "Vacant", "Vacant"))}</span>${dir ? ` (${l("مهارة", "skill", "compétence")} ${num(dir.skill)})` : ""}</h3>
  <p>${l("الفلسفة", "Philosophy", "Philosophie")}: ${phils}</p>
  <p class="hint">${esc(lang === "ar" ? SPORTING_PHILOSOPHIES[sp.philosophy].desc.ar : lang === "fr" ? SPORTING_PHILOSOPHIES[sp.philosophy].desc.fr : SPORTING_PHILOSOPHIES[sp.philosophy].desc.en)}</p>
  <form id="staff-freedom-form" class="neg-form"><label>${l("الصلاحيات", "Authority", "Pouvoirs")}
  <input type="range" name="freedom" min="0" max="100" step="5" value="${sp.freedom}"></label>
  <span>${num(sp.freedom)}٪ ${sp.freedom >= 70 ? l("(حرية كاملة — ينفّذ بنفسه)", "(full authority — acts alone)", "(pleins pouvoirs — agit seul)") : l("(كل صفقة بإذنك)", "(every deal needs you)", "(chaque deal vous attend)")}</span>
  <button class="btn small primary" type="submit">${l("حفظ", "Save", "Enregistrer")}</button></form>
  <p class="hint">${l("الصلاحية الفعلية", "Effective authority", "Pouvoirs effectifs")}: ${num(effective)}٪${delegated ? ` · ${l("تفويض مؤقت من المجلس حتى", "Temporary board delegation until", "Délégation temporaire du conseil jusqu’au")} ${esc(authorityUntil)} (${l("تفويض المجلس يضيف ١٥ نقطة", "Board delegation adds 15 points", "La délégation ajoute 15 points")})` : ""}</p>
  <p>${l("سقف التنفيذ التلقائي", "Auto-execution cap", "Plafond d’action")} ${money(autoCap(s))} · ${l("ميزانية المجلس", "Board budget", "Budget du conseil")} ${money(sp.budget)}
  ${sp.rating ? ` · ${l("تقييم الموسم", "Season rating", "Note de saison")} ${num(sp.rating.rating)}/100` : ""}</p>
  ${st ? `<p>${l("الموسم", "Season", "Saison")}: ${num(st.proposed)} ${l("مقترحة", "proposed", "proposés")} · ${num(st.auto + st.approved)} ${l("منفذة", "done", "conclus")} · ${l("صافي", "net", "net")} ${money(st.earned - st.spent)}</p>` : ""}
  <h4>${l("صفقات معلّقة", "Pending deals", "Deals en attente")}</h4>
  <table class="staff-table"><tbody>${deals || `<tr><td>${l("لا صفقات معلّقة.", "No pending deals.", "Aucun deal en attente.")}</td></tr>`}</tbody></table>
  <h4>${l("سجل القرارات", "Decision log", "Journal")}</h4><ul class="staff-log">${log || `<li>${l("لا قرارات بعد.", "No decisions yet.", "Aucune décision.")}</li>`}</ul>`;
}

function techTab(s) {
  const gk = gkSkillOf(s), fit = fitnessSkillOf(s), doc = doctorSkillOf(s);
  const row = (ar, en, fr, val) => `<tr><td>${l(ar, en, fr)}</td><td>${val}</td></tr>`;
  return `<h3>${l("الطاقم الفني — تأثير رقمي حقيقي", "Technical staff — real numbers", "Staff technique — effets réels")}</h3>
  <table class="staff-table"><tbody>
  ${row("مدرب الحراس", "Goalkeeping coach", "Entraîneur des gardiens", `${num(gk)} ${bar(gk)} · ${l("مكسب التطور", "development gain", "gain de progression")} +${gkGainBonus(s)}`)}
  ${row("مدرب اللياقة", "Fitness coach", "Préparateur physique", `${num(fit)} ${bar(fit)} · ${l("إصابات المباريات", "match injuries", "blessures")} ×${Math.round(fitnessFactor(s) * 100)}٪`)}
  ${row("طبيب الفريق", "Team doctor", "Médecin", `${num(doc)} ${bar(doc)} · ${l("شفاء شهري", "monthly healing", "soins mensuels")} ${Math.floor(doc / 30)} ${l("أيام", "days", "jours")} · ${doc >= 80 ? l("تشخيص دقيق", "precise diagnosis", "diagnostic précis") : doc >= 55 ? l("تشخيص جيد", "good diagnosis", "bon diagnostic") : l("تشخيص يخطئ!", "faulty diagnosis!", "diagnostic douteux !")}`)}
  </tbody></table>
  <p class="hint">${l("عيّن مدرب حراس ليتطور حراسك أسرع، ومدرب لياقة لتقل الإصابات، وطبيبًا ماهرًا ليشفى المصابون أسرع وبتشخيص سليم.", "Hire a goalkeeping coach for faster keeper growth, a fitness coach for fewer injuries, and a skilled doctor for faster, accurate healing.", "Recrutez un entraîneur des gardiens, un préparateur physique et un bon médecin pour des effets mesurables.")}</p>`;
}

function scoutsTab(s, lang) {
  const c = ensureStaffCorp(s);
  const list = corpEmployees(s).filter((e) => e.role === "scout").map((e) =>
    `<tr><td data-no-translate>${esc(empName(e, lang))}</td><td>${num(e.skill)}</td>
    <td>${e.assignment ? esc(SCOUT_REGIONS[e.assignment.region].name[lang] || SCOUT_REGIONS[e.assignment.region].name.ar) : l("بلا منطقة", "No region", "Sans zone")}</td>
    <td><form id="scout-region-form" class="neg-form" data-id="${e.id}"><select name="region">
    <option value="">${l("بلا منطقة", "No region", "Sans zone")}</option>
    ${REGION_IDS.map((r) => `<option value="${r}" ${e.assignment?.region === r ? "selected" : ""}>${esc(SCOUT_REGIONS[r].name[lang] || SCOUT_REGIONS[r].name.ar)}</option>`).join("")}
    </select><button class="btn small primary" type="submit">${l("تعيين", "Assign", "Affecter")}</button></form></td></tr>`).join("");
  const reps = c.scouts.reports.slice(0, 15).map((r) => {
    const scoutName = r.scoutName ? staffText(r.scoutName, lang) : l("كشاف", "Scout", "Recruteur");
    const regionName = r.region && SCOUT_REGIONS[r.region]
      ? staffText(SCOUT_REGIONS[r.region].name, lang)
      : l("السوق العام", "Wider market", "Marché élargi");
    return `<tr><td data-no-translate>${esc(r.name)}</td><td>${num(r.rating)}</td><td>${num(r.min)}-${num(r.max)}</td><td>${num(r.confidence)}٪</td><td>${esc(`${scoutName} · ${regionName}`)}</td><td>${esc(r.date)}</td></tr>`;
  }).join("");
  return `<h3>${l("الكشافون", "Scouts", "Recruteurs")}</h3>
  <table class="staff-table"><thead><tr><th>${l("الكشاف", "Scout", "Recruteur")}</th><th>${l("المهارة", "Skill", "Compétence")}</th><th>${l("المنطقة", "Region", "Zone")}</th><th></th></tr></thead>
  <tbody>${list || `<tr><td colspan="4">${l("لا كشافين معينين.", "No scouts hired.", "Aucun recruteur.")}</td></tr>`}</tbody></table>
  <h4>${l("أحدث التقارير", "Latest reports", "Derniers rapports")}</h4>
  <table class="staff-table"><thead><tr><th>${l("اللاعب", "Player", "Joueur")}</th><th>${l("التقييم", "Rating", "Note")}</th><th>${l("الإمكانات", "Potential", "Potentiel")}</th><th>${l("الثقة", "Confidence", "Confiance")}</th><th>${l("المصدر", "Source", "Source")}</th><th>${l("التاريخ", "Date", "Date")}</th></tr></thead>
  <tbody>${reps || `<tr><td colspan="6">${l("لا تقارير بعد.", "No reports yet.", "Aucun rapport.")}</td></tr>`}</tbody></table>`;
}

export function staffView(s, tab = "org", lang = "ar") {
  ensureStaffCorp(s);
  const tabs = STAFF_TABS.map(([id, ar, en, fr]) =>
    `<button class="tab ${tab === id ? "active" : ""}" data-action="staff-tab" data-id="${id}">${l(ar, en, fr)}</button>`).join("");
  const body = tab === "market" ? marketTab(s, lang)
    : tab === "sporting" ? sportingTab(s, lang)
    : tab === "tech" ? techTab(s)
    : tab === "scouts" ? scoutsTab(s, lang)
    : tab === "meeting" ? meetingTab(s, lang) : tab === "hq" ? hqTab(s) : orgTab(s, lang);
  return `<section class="staff-corp"><div class="tabs">${tabs}</div><div class="tab-body">${body}</div></section>`;
}
