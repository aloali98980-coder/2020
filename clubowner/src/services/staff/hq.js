// المقر الإداري: سعته تحدد عدد موظفيك، وترقياته حتى البرج الإداري.
// التمويل من الثروة الشخصية (فلوسك) كالملعب، والبرج يشترط منشأة officeTower من المدينة (ربط ١١).
import { assert, addDays } from "../../core/utils.js";
import { ensureEmpire } from "../empire/wealth.js";
import { message } from "../inbox.js";
import { HQ_LEVELS } from "../../data/staffCatalog.js";
import { ensureStaffCorp, hqCap } from "./staffCorp.js";

export const hqQuote = (s) => {
  const c = ensureStaffCorp(s);
  const next = c.hq.level + 1;
  assert(next < HQ_LEVELS.length, "بلغت البرج الإداري؛ لا ترقيات أعلى.");
  assert(!c.hq.project, "مشروع مقر قائم بالفعل.");
  const spec = HQ_LEVELS[next];
  if (spec.needsCity)
    assert(
      ensureStaffCorp(s) && s.sportsCity?.facilities?.includes(spec.needsCity),
      "البرج الإداري يشترط امتلاك برج المكاتب (officeTower) في المدينة الرياضية.",
    );
  return { level: next, spec };
};
export function startHqUpgrade(s) {
  const { level, spec } = hqQuote(s);
  const c = ensureStaffCorp(s), e = ensureEmpire(s);
  assert(e.personal >= spec.cost, "الثروة الشخصية لا تغطي تكلفة الترقية.");
  e.personal -= spec.cost;
  e.monthTrack.expenses += spec.cost;
  c.hq.project = { level, cost: spec.cost, start: s.date, end: addDays(s.date, spec.days) };
  message(s, {
    title: `بدأ بناء ${spec.name.ar}`,
    body: `التكلفة ${spec.cost.toLocaleString()} من ثروتك الشخصية، والتسليم ${c.hq.project.end}. السعة الجديدة ${spec.cap} موظفًا.`,
    category: "club",
  });
  return c.hq.project;
}
export function hqDay(s) {
  const c = s.staffCorp;
  if (!c?.hq?.project || s.date < c.hq.project.end) return false;
  c.hq.level = c.hq.project.level;
  c.hq.project = null;
  message(s, {
    title: `اكتمل ${HQ_LEVELS[c.hq.level].name.ar}!`,
    body: `سعة المقر الآن ${hqCap(s)} موظفًا. وسّع هيكلك من سوق الموظفين.`,
    category: "club",
  });
  return true;
}
