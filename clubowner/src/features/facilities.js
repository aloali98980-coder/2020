import { FACILITIES } from "../data/catalog.js";
import {
  heading,
  badge,
  button,
  progress,
  infoNote,
} from "../components/shared.js";
import { icon } from "../components/icons.js";
import { money, num, date } from "../ui/format.js";
import { daysBetween } from "../core/utils.js";
import { projectQuote } from "../services/facilities.js";
export function facilitiesView(s) {
  return `${heading("الأساس اللي بيشيل النادي", "منشآت النادي", "كل مشروع له وقت وتكلفة تشغيل وأثر. الاستثمار مش مجرد مستوى جديد.", badge(num(s.facilities.filter((f) => f.project).length) + " مشروعات نشطة", "green"))}<div class="facility-grid">${s.facilities
    .map((f) => {
      const data = FACILITIES.find((d) => d.id === f.id),
        q = projectQuote(f);
      return `<article class="panel facility-card"><div class="facility-illustration ${f.id}"><div class="isometric-icon">${icon(data.icon, 85)}</div><span class="facility-no">0${FACILITIES.findIndex((x) => x.id === f.id) + 1}</span>${badge(f.project ? "قيد الإنشاء" : f.level > 1 && f.staffCost && !f.staff ? "بانتظار موظف" : "تعمل حاليًا", f.project ? "gold" : "green")}</div><div class="facility-body"><div class="facility-title"><h3>${f.name}</h3><span>المستوى <b>${num(f.level)}</b> / ٤</span></div><p>${data.desc}</p><div class="level-bars">${[1, 2, 3, 4].map((i) => `<i class="${i <= f.level ? "filled" : ""}"></i>`).join("")}</div><div class="facility-info"><span>التشغيل الشهري</span><strong>${money(f.monthlyCost + (f.staff ? f.staffCost : 0))} ج.م</strong></div>${f.project ? `<div class="project-progress"><div><span>التقدم في التنفيذ</span><b>${num(Math.round((daysBetween(f.project.start, s.date) / f.project.days) * 100))}٪</b></div>${progress((daysBetween(f.project.start, s.date) / f.project.days) * 100)}<small>التسليم ${date(f.project.end)}</small></div>` : `<div class="facility-info"><span>التطوير التالي</span><strong>${f.level >= 4 ? "اكتمل الحد التجريبي" : money(q.cost) + " ج.م · " + num(q.days) + " يوم"}</strong></div>`}${button("التفاصيل وخطة التطوير " + icon("arrow", 16), "facility-detail", f.id, "secondary full")}</div></article>`;
    })
    .join(
      "",
    )}</div>${infoNote("الآثار مفعلة: توسعة سعة الاستاد، استعادة جاهزية أفضل، تطوير شهري للصغار، وتوليد ناشئ شهريًا. الأثر الرياضي يحتاج الموظف المناسب.")}`;
}
export function facilityDetail(s, id) {
  const f = s.facilities.find((x) => x.id === id),
    d = FACILITIES.find((x) => x.id === id),
    q = projectQuote(f),
    fast = projectQuote(f, true);
  return `<div class="modal-hero-icon">${icon(d.icon, 35)}</div><span class="eyebrow">منشأة المستوى ${num(f.level)}</span><h2>${f.name}</h2><p class="muted">${d.desc}</p><div class="effect-card"><h4>${icon("bolt", 17)} الأثر الفعلي</h4><p>${d.effect}</p><small>${d.requirement}</small></div>${f.staffCost ? `<div class="staff-row"><div><strong>${d.staffName}</strong><small>${money(f.staffCost)} ج.م شهريًا · ${f.staff ? "يعمل حاليًا" : "غير معيّن"}</small></div>${button(f.staff ? "إنهاء التكليف" : "تعيين الموظف", "toggle-staff", id, f.staff ? "ghost" : "soft")}</div>` : ""}${f.project ? `<div class="project-detail"><h3>المشروع قيد التنفيذ</h3><p>الاستلام: ${date(f.project.end)}</p>${progress((daysBetween(f.project.start, s.date) / f.project.days) * 100)}<p class="muted">تم دفع ٤٠٪، والباقي مستحق عند الاستلام. لا يمكن إلغاء الالتزام بعد بدء البناء في النسخة الحالية.</p></div>` : f.level >= 4 ? infoNote("وصلت إلى أقصى مستوى متاح في النسخة الحالية.") : `<h3 class="section-title">${d.module}</h3><form id="project-form" data-id="${id}"><div class="contractor-options"><label><input type="radio" name="speed" value="normal" checked><div><strong>تنفيذ قياسي</strong><span>${money(q.cost)} ج.م · ${num(q.days)} يوم</span></div>${badge("اقتصادي", "green")}</label><label><input type="radio" name="speed" value="fast"><div><strong>تنفيذ معجّل</strong><span>${money(fast.cost)} ج.م · ${num(fast.days)} يوم</span></div>${badge("+٢٠٪ تكلفة", "gold")}</label></div><div class="terms-note">${icon("finance", 18)} ٤٠٪ مقدم + ٦٠٪ عند الاستلام. يلزم رصيد يغطي المشروع كاملًا قبل البدء. زيادة التشغيل: ${money(q.upkeep)} ج.م شهريًا.</div><div class="modal-actions"><button class="btn primary" type="submit">اعتماد المشروع وبدء البناء ${icon("arrow", 16)}</button></div></form>`}`;
}
