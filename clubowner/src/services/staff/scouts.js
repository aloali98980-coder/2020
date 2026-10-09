// الكشافون: تعيين في مناطق + تقارير دورية بلاعبين + دقة حسب المهارة.
// الكشاف التعبان يلبّسك مقالب: يبالغ في تقدير الإمكانات عمدًا (انحياز موجب).
import { assert, clamp, uid } from "../../core/utils.js";
import { message } from "../inbox.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { SCOUT_REGIONS, REGION_IDS } from "../../data/staffCatalog.js";
import { ensureStaffCorp, corpEmployees, srng } from "./staffCorp.js";

export const regionNameAr = (r) => SCOUT_REGIONS[r]?.name.ar || r;
export function assignScout(s, empId, region) {
  const c = ensureStaffCorp(s);
  const emp = corpEmployees(s).find((e) => e.id === empId);
  assert(emp?.role === "scout", "اختر كشافًا معينًا.");
  assert(region === null || REGION_IDS.includes(region), "منطقة غير صالحة.");
  emp.assignment = region ? { region, since: s.date } : null;
  message(s, {
    title: region ? `${emp.name.ar} إلى ${regionNameAr(region)}` : `${emp.name.ar} بلا منطقة`,
    body: region
      ? `سيصل تقريره الدوري عن مواهب ${regionNameAr(region)} أول كل شهر. الدقة بمهارته (${emp.skill}).`
      : "عاد الكشاف للقاعدة بلا منطقة مكلف بها.",
    category: "careers",
  });
  return emp.assignment;
}
// دقة التقرير: خطأ ±نقاط حول الإمكانات الحقيقية + انحياز المقلب للمهارة المتدنية.
export const reportError = (skill) => Math.max(2, Math.round((100 - skill) / 8));
export const reportBias = (s, skill) =>
  skill < 50 ? 3 + Math.floor(srng(s) * 6) : Math.floor(srng(s) * 5) - 2;

const leagueOf = (s, p) => extendedClub(p.clubId)?.country || p.league || null;
export function scoutMonth(s) {
  const c = ensureStaffCorp(s);
  const assigned = corpEmployees(s).filter((e) => e.role === "scout" && e.assignment?.region);
  if (!assigned.length) return [];
  const pool = (s.players || []).filter((p) => p.status !== "retired" && p.clubId !== s.clubId && !p.loan);
  if (!pool.length) return [];
  const made = [];
  for (const scout of assigned) {
    const leagues = SCOUT_REGIONS[scout.assignment.region].leagues;
    let cands = pool.filter((p) => leagues.includes(leagueOf(s, p)));
    if (!cands.length) cands = pool; // منطقة بلا دوري محمّل: يغطي السوق العام ويذكر ذلك
    const n = 1 + (scout.skill >= 80 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const p = cands[Math.floor(srng(s) * cands.length)];
      if (!p || made.some((r) => r.playerId === p.id)) continue;
      const error = reportError(scout.skill), bias = reportBias(s, scout.skill);
      const min = clamp(Math.floor(p.potential - error + Math.min(0, bias)), 1, 99);
      const max = clamp(Math.ceil(p.potential + error + Math.max(0, bias)), 1, 99);
      p.scoutReport = {
        date: s.date, min: Math.min(min, max), max: Math.max(min, max),
        scoutId: scout.id, confidence: scout.skill, region: scout.assignment.region,
      };
      const rep = { id: uid(s, "srep"), scoutId: scout.id, playerId: p.id, name: p.name, rating: p.rating, min, max, confidence: scout.skill, region: scout.assignment.region, date: s.date };
      c.scouts.reports.unshift(rep);
      made.push(rep);
    }
  }
  c.scouts.reports = c.scouts.reports.slice(0, 60);
  if (made.length)
    message(s, {
      title: `تقارير الكشافين (${made.length})`,
      body: made.slice(0, 4).map((r) => `${r.name}: إمكانات ${r.min}-${r.max}`).join("؛ ") + ". راجع تبويب الكشافين قبل أي صفقة.",
      category: "careers",
    });
  return made;
}
