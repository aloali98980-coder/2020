// الأكاديمية: منهج تدريب (تقنية/بدنية/تكتيكية) + جودة الدفعة + متابعة الناشئين والوريث.
// الجودة = مستوى المنشأة + مدير الأكاديمية + مباني المدينة (ربط ١١ قائم) + المنهج.
import { assert, clamp } from "../../core/utils.js";
import { message } from "../inbox.js";
import { L, ACADEMY_CURRICULA } from "../../data/staffCatalog.js";
import { ensureStaffCorp, corpSkill, corpEmployees } from "./staffCorp.js";

export const curriculumNameAr = (c) => ACADEMY_CURRICULA[c]?.name.ar || c;
export function setCurriculum(s, id) {
  assert(ACADEMY_CURRICULA[id], "منهج غير صالح.");
  ensureStaffCorp(s).academy.curriculum = id;
  message(s, {
    title: `منهج الأكاديمية: ${curriculumNameAr(id)}`,
    body: ACADEMY_CURRICULA[id].desc.ar,
    category: "careers",
  });
  return id;
}
export const academyManagerSkill = (s) => corpSkill(s, "academy");
// مكافأة الإمكانات للدفعة السنوية: ٠-٥ بمهارة المدير.
export const academyPotentialBonus = (s) => Math.floor(academyManagerSkill(s) / 20);
// دقة تقييم الدفعة: مدير ماهر يقلل خطأ الكشف.
export const academyScoutBonus = (s) => Math.floor(academyManagerSkill(s) / 30);
// ميل السمات حسب المنهج: سمات +٣ لكل ناشئ.
export const CURRICULUM_ATTRS = Object.freeze({
  technique: ["passing", "decisions"],
  physical: ["pace", "stamina"],
  tactical: ["decisions", "defending"],
});
export function applyCurriculumTilt(s, player) {
  const cur = ensureStaffCorp(s).academy.curriculum;
  for (const k of CURRICULUM_ATTRS[cur] || []) {
    if (Number.isFinite(player.attributes?.[k]))
      player.attributes[k] = clamp(player.attributes[k] + 3, 1, 99);
  }
  return player;
}
// متابعة الناشئين: دفعة الموسم + الوريث من العاشرة (باسمه وتخصصه المعلن).
export function academyWatchMonth(s) {
  const c = ensureStaffCorp(s);
  const wl = c.academy.watchlist;
  const seen = new Set(wl.map((w) => w.id));
  for (const cand of s.youthIntakeBatch?.candidates || []) {
    const p = cand.player;
    if (!p || seen.has(p.id)) continue;
    wl.push({
      id: p.id, name: p.name, kind: "youth", rating: p.rating,
      note: L(`الإمكانات المعلنة ${cand.range[0]}-${cand.range[1]}`, `Scouted potential ${cand.range[0]}-${cand.range[1]}`, `Potentiel estimé ${cand.range[0]}-${cand.range[1]}`),
      date: s.date,
    });
    seen.add(p.id);
  }

  // Dynasty heirs live in s.dynasty.children (not empire.family.children); follow from age 10.
  const heirId = s.dynasty?.heirId;
  const heir = heirId && (s.dynasty?.children || s.empire?.family?.children || []).find((k) => k.id === heirId);
  if (heir && Number(heir.age) >= 10) {
    const id = "heir-" + heir.id;
    const manager = corpEmployees(s).find((e) => e.role === "academy");
    const stats = heir.stats || heir;
    const rating = Math.round(((stats.discipline ?? 50) + (stats.talent ?? 50) + (stats.ambition ?? 50)) / 3);
    const note = manager
      ? L(`يتابعه ${manager.name.ar} ضمن برنامج الوريث.`, `Followed by ${manager.name.en} in the heir programme.`, `Suivi par ${manager.name.fr || manager.name.en} dans le programme de l’héritier.`)
      : L("ينتظر مدير أكاديمية لمتابعته.", "Waiting for an academy director to follow up.", "En attente d’un directeur d’académie pour le suivi.");
    const existing = wl.find((w) => w.id === id);
    if (existing) {
      existing.name = heir.nameAr || heir.name || "الوريث";
      existing.rating = rating;
      existing.note = note;
      existing.managerId = manager?.id || null;
    } else {
      wl.push({
        id, name: heir.nameAr || heir.name || "الوريث", kind: "heir", rating,
        note, managerId: manager?.id || null, date: s.date,
      });
      message(s, {
        title: "الوريث تحت مجهر الأكاديمية",
        body: `${heir.nameAr || heir.name || "الوريث"} انضم لقائمة المتابعة مع ناشئي الموسم. جودة البرنامج ترفع إمكاناته المعلنة.`,
        category: "careers",
      });
    }
  }
  c.academy.watchlist = wl.slice(-12);
  return c.academy.watchlist;
}
