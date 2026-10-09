// الطاقم الفني بتأثير رقمي حقيقي: حراس (تطور) / لياقة (إصابات أقل) / طبيب (شفاء + تشخيص).
// كلها دوال حتمية تُستدعى من المحرك القائم (development/matchConsequences/day) — لا عشوائية جديدة في الدفق.
import { clamp, addDays, daysBetween } from "../../core/utils.js";
import { message } from "../inbox.js";
import { squad } from "../../models/player.js";
import { corpSkill, srng } from "./staffCorp.js";

export const gkSkillOf = (s) => corpSkill(s, "gk");
export const fitnessSkillOf = (s) => corpSkill(s, "fitness");
export const doctorSkillOf = (s) => corpSkill(s, "doctor");

// معامل إصابات المباريات: لياقة ٩٠ تخفض الاحتمال ٣٦٪ (أرضية ٠٫٦).
export const fitnessFactor = (s) => clamp(1 - fitnessSkillOf(s) / 250, 0.6, 1);
// مكسب تطور الحراس الشهري الإضافي + فرصة التطور.
export const gkGainBonus = (s) => {
  const k = gkSkillOf(s);
  return k >= 75 ? 0.3 : k > 0 ? 0.1 : 0;
};
export const gkChanceBonus = (s) => gkSkillOf(s) / 500;

// الطبيب: تشخيص الإصابات الجديدة — الماهر يصيب، والتعبان يشخّص غلط ويطوّل/يقصّر الغياب.
export function doctorDay(s) {
  const skill = doctorSkillOf(s);
  if (!skill) return 0;
  let diagnosed = 0;
  for (const p of squad(s)) {
    if (!p.injuryUntil || p.injuryUntil < s.date || p.staffDx === p.injuryUntil) continue;
    const actual = daysBetween(s.date, p.injuryUntil);
    let shift = 0;
    if (skill >= 80) shift = 0;
    else if (skill >= 55) shift = Math.floor(srng(s) * 3) - 1; // ±١
    else shift = Math.floor(srng(s) * 9) - 4; // ±٤: دكتور تعبان
    const next = addDays(s.date, Math.max(1, actual + shift));
    p.injuryUntil = next;
    p.staffDx = next;
    diagnosed += 1;
    if (Math.abs(shift) >= 3)
      message(s, {
        title: `تشخيص مثير للجدل — ${p.name}`,
        body: `الطبيب قدّر الغياب بنحو ${Math.max(1, actual + shift)} أيام. تشخيصات هذا الطبيب (مهارة ${skill}) كثيرًا ما تخطئ — فكّر في بديل أكفأ.`,
        category: "club",
      });
  }
  return diagnosed;
}
// الشفاء الشهري: كل ٣٠ مهارة ≈ يوم شفاء إضافي.
export function doctorMonth(s) {
  const skill = doctorSkillOf(s);
  if (!skill) return 0;
  const heal = Math.floor(skill / 30);
  if (!heal) return 0;
  let healed = 0;
  for (const p of squad(s)) {
    if (!p.injuryUntil || p.injuryUntil < s.date) continue;
    const left = daysBetween(s.date, p.injuryUntil) - heal;
    p.injuryUntil = left > 0 ? addDays(s.date, left) : null;
    p.staffDx = p.injuryUntil;
    healed += 1;
  }
  return healed;
}
