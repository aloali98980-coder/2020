import { FACILITIES } from "../data/catalog.js";
import { assert, uid, addDays } from "../core/utils.js";
import { post, obligation } from "./finance.js";
import { message } from "./inbox.js";
import { addInsideInformation } from "./stockMarket/insider.js";
export function projectQuote(f, fast = false) {
  const base = FACILITIES.find((x) => x.id === f.id);
  return {
    cost: Math.round(base.cost * (1 + (f.level - 1) * 0.6) * (fast ? 1.2 : 1)),
    days: Math.max(3, Math.round(base.days * (fast ? 0.7 : 1))),
    upkeep: base.upkeep,
  };
}
export function startProject(s, id, fast = false) {
  const f = s.facilities.find((f) => f.id === id);
  assert(f, "منشأة غير موجودة.");
  assert(!f.project, "يوجد مشروع قيد التنفيذ.");
  assert(f.level < 4, "وصلت إلى الحد المتاح في النسخة التجريبية.");
  const quote = projectQuote(f, fast),
    upfront = Math.round(quote.cost * 0.4);
  assert(
    s.finance.cash >= quote.cost,
    "يلزم توفير قيمة المشروع كاملة كاحتياطي قبل الالتزام به.",
  );
  const project = {
    id: uid(s, "project"),
    start: s.date,
    end: addDays(s.date, quote.days),
    ...quote,
    fast,
  };
  f.project = project;
  post(
    s,
    -upfront,
    "construction",
    `مقدم تطوير ${f.name}`,
    project.id + "-upfront",
  );
  obligation(s, {
    amount: quote.cost - upfront,
    due: project.end,
    category: "construction",
    description: `دفعة استلام ${f.name}`,
    key: project.id + "-final",
    ref: project.id,
  });
  message(s, {
    title: `بدأ مشروع ${f.name}`,
    body: `تم دفع ٤٠٪. الاستلام المتوقع ${project.end} مع سداد الباقي وإضافة تكلفة التشغيل.`,
    category: "facilities",
  });
  if (s.stockMarket)
    addInsideInformation(s, {
      clubId: s.clubId,
      kind: "facility",
      publicOn: project.end,
      sourceRef: `facility:${project.id}`,
      source: "construction-office",
    });
}
export function toggleFacilityStaff(s, id) {
  const f = s.facilities.find((x) => x.id === id);
  assert(f && f.staffCost, "هذه المنشأة لا تتطلب تعيينًا مستقلًا.");
  f.staff = !f.staff;
  message(s, {
    title: f.staff ? "تعيين موظف متخصص" : "إنهاء تكليف الموظف",
    body: `تم تحديث طاقم ${f.name}. التكلفة الشهرية والأثر التشغيلي يتغيران وفقًا لذلك.`,
    category: "facilities",
  });
}
export function facilityDay(s) {
  for (const f of s.facilities) {
    if (f.project && f.project.end <= s.date) {
      f.level++;
      f.monthlyCost += f.project.upkeep;
      if (f.id === "stadium") s.capacity += 3000;
      f.project = null;
      message(s, {
        title: `اكتمل تطوير ${f.name}`,
        body:
          f.staffCost && !f.staff
            ? "البناء مكتمل؛ عيّن الموظف المطلوب لتفعيل الأثر الرياضي."
            : "المنشأة تعمل بمستواها الجديد. راجع تكاليف التشغيل والأثر.",
        category: "facilities",
      });
    }
  }
}
