import { talentView } from "./talent.js";
import {
  heading,
  badge,
  button,
  empty,
  infoNote,
  avatar,
  progress,
} from "../components/shared.js";
import { icon } from "../components/icons.js";
import { money, num, esc, date , cur} from "../ui/format.js";
import { STAFF_ROLES, staffSalary } from "../services/staff.js";
import { tr } from "../i18n/index.js";
import { retiredCount } from "../services/retired.js";
export function careersView(s,selectedPlayer) {
  const employed = s.staff.filter((p) => p.status === "employed"),
    available = s.staff.filter((p) => p.status === "available"),
    planned = s.players.filter(
      (p) =>
        p.clubId === s.clubId && p.retirementPlan && p.status !== "retired",
    );
  return `${talentView(s,selectedPlayer)}${heading("بعد صافرة النهاية", "من لاعب إلى صانع مواهب", "قدرات الموظف مستقلة عن تقييمه كلاعب. التعيين عقد ومرتب وتأثير فعلي.", badge(num(s.staff.length) + " " + tr("مرشح مهني", "career candidates", "candidats professionnels")))}<div class="career-overview"><div class="panel"><strong>${num(employed.length)} / 3</strong><span>الطاقم الحالي</span></div><div class="panel"><strong>${num(available.length)}</strong><span>مرشحون بعد الاعتزال</span></div><div class="panel"><strong>${num(retiredCount(s))}</strong><span>معتزلون في العالم</span></div></div><section class="panel retirement-plans"><div class="panel-head"><h3>${icon("clock")} لاعبون يخططون للاعتزال</h3></div>${planned.length ? planned.map((p) => `<div class="staff-row"><div><strong>${esc(p.name)}</strong><small>${num(p.age)} · ${date(p.retirementPlan.date)}</small></div>${button("الملف", "player-detail", p.id, "secondary small")}</div>`).join("") : `<p class="muted">لا توجد خطط اعتزال معلنة الآن.</p>`}</section><h3 class="section-title">الطاقم الحالي</h3><div class="staff-grid">${employed.length ? employed.map((p) => staffCard(s, p)).join("") : empty("لا يوجد موظفون حاليًا", "المعتزلون الراغبون في العمل سيظهرون هنا، وليس كل معتزل مؤهلًا أو راغبًا.", "academy")}</div><h3 class="section-title">مرشحون بعد الاعتزال</h3><div class="staff-grid">${available.length ? available.map((p) => staffCard(s, p)).join("") : empty("مرشحون بعد الاعتزال", "المعتزلون الراغبون في العمل سيظهرون هنا، وليس كل معتزل مؤهلًا أو راغبًا.", "squad")}</div>${infoNote("القدرات المهنية تقديرية داخل اللعبة، وليست تقييمًا حقيقيًا للشخص.")}`;
}
function staffCard(s, p) {
  const hired = p.status === "employed";
  return `<article class="panel staff-card"><div class="staff-head"><span class="modal-hero-icon">${icon(hired && p.role === "scout" ? "search" : "academy", 28)}</span><div><h3>${esc(p.name)}</h3>${badge(hired ? STAFF_ROLES[p.role].name : "مرشح متاح", hired ? "green" : "gold")}</div></div><div class="staff-skills">${[
    ["coaching", "التدريب"],
    ["scouting", "الكشف"],
    ["youth", "الشباب"],
  ]
    .map(
      ([key, label]) =>
        `<div><span>${label}</span><b>${num(p.skills[key])}</b>${progress(p.skills[key])}</div>`,
    )
    .join(
      "",
    )}</div><p class="muted qualification">${p.qualification === "qualified" ? "مؤهل" : p.qualification === "basic" ? "تأهيل أساسي" : "مبتدئ مهنيًا"}</p>${hired ? `<div class="staff-contract"><strong>${money(p.salary)} ${cur()} / شهر</strong><small>${date(p.contractEnd)}</small></div><div class="staff-actions">${p.role === "scout" ? button("مهمة كشف", "scout-task", p.id, "soft small") : ""}${button(p.course ? date(p.course.end) : "دورة تطوير", "staff-course", p.id, "secondary small", p.course ? "disabled" : "")}${button("إنهاء العقد", "staff-dismiss", p.id, "ghost small")}</div>` : button("اختيار الدور والتعيين", "hire-staff", p.id, "soft full")}</article>`;
}
export function hireStaffForm(s, id) {
  const p = s.staff.find((p) => p.id === id);
  return `<span class="eyebrow">مرشحون بعد الاعتزال</span><h2>${esc(p.name)}</h2><form id="staff-hire-form" data-id="${p.id}"><div class="contractor-options">${Object.entries(
    STAFF_ROLES,
  )
    .map(
      ([key, v], i) =>
        `<label><input type="radio" name="staffRole" value="${key}" ${i === 0 ? "checked" : ""}><div><strong>${v.name} · ${num(p.skills[v.skill])}/100</strong><span>${money(staffSalary(p, key))} ${cur()} / شهر</span></div></label>`,
    )
    .join(
      "",
    )}</div><div class="info-note">${tr("عقد سنة. مدرب التطوير يحسن احتمال تطور الصغار، ومدرب الناشئين يفعّل استقبال المواهب مع الأكاديمية المطورة، والكشاف ينفذ مهامًا بتقارير أدق حسب مهارته.", "One-year contract. Coaches improve youth development chances, youth coaches enable intakes at an upgraded academy, and scouts deliver reports whose accuracy depends on their skill.", "Contrat d’un an. Les entraîneurs améliorent la progression des jeunes, ceux des jeunes activent les arrivées dans un centre amélioré, et les recruteurs rédigent des rapports selon leur compétence.")}</div><div class="modal-actions"><button class="btn primary" type="submit">اعتماد التعيين</button></div></form>`;
}
export function scoutTaskForm(s, id) {
  const targets = s.players.filter(
    (p) => p.clubId !== s.clubId && p.status !== "retired",
  );
  return `<h2>مهمة كشف</h2><form id="scout-task-form" data-id="${id}"><label class="field"><span>اللاعب</span><select name="playerId">${targets.map((p) => `<option value="${p.id}">${esc(p.name)} · ${num(p.age)}</option>`).join("")}</select></label><p class="muted">${tr("المهمة تضيق نطاق تقدير الإمكانات ولا تغير قدرات اللاعب.", "Scouting narrows the potential estimate; it does not change player abilities.", "Le rapport affine l’estimation du potentiel sans changer les qualités du joueur.")}</p><div class="modal-actions"><button class="btn primary" type="submit">بدء مهمة ٧ أيام مقابل ٤٠ ألف ${cur()}</button></div></form>`;
}
