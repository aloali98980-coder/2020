// نبض الإدارة الشاملة اليومي — يُستدعى من advanceTime بعد empireDay.
// خفيف حتمي: لا رسائل required هنا أبدًا (ضابط الإزعاج محفوظ).
import { addDays } from "../../core/utils.js";
import { message } from "../inbox.js";
import {
  ensureStaffCorp, corpEmployees, refreshStaffMarket, loyaltyMonth,
  boardMeetingMonth, staffCorpContractsDay, poachTargetChance, makePoachOffer, srng,
} from "./staffCorp.js";
import { hqDay } from "./hq.js";
import { sportingMonth, sportingDay } from "./sporting.js";
import { doctorDay, doctorMonth } from "./effects.js";
import { scoutMonth } from "./scouts.js";
import { marketingDay, marketingMonth } from "./marketing.js";
import { socialDay, socialMonth } from "./social.js";
import { academyWatchMonth } from "./academy.js";

export function staffCorpDay(s) {
  const c = ensureStaffCorp(s);
  staffCorpContractsDay(s);
  hqDay(s);
  sportingDay(s);
  doctorDay(s);
  marketingDay(s);
  socialDay(s);
  if (s.date.endsWith("-01")) {
    loyaltyMonth(s);
    refreshStaffMarket(s);
    boardMeetingMonth(s);
    sportingMonth(s);
    doctorMonth(s);
    scoutMonth(s);
    marketingMonth(s);
    socialMonth(s);
    academyWatchMonth(s);
    // الخطف الشهري: كل موظف مستهدف باحتماله الخاص.
    for (const emp of corpEmployees(s)) {
      if (c.poach.some((o) => o.status === "open" && o.empId === emp.id)) continue;
      if (srng(s) < poachTargetChance(s, emp)) {
        try { makePoachOffer(s, emp.id); } catch { /* عرض قائم */ }
      }
    }
  }
  // تحذير هادئ: عقد موظف ينتهي خلال ٣٠ يومًا.
  for (const emp of corpEmployees(s)) {
    if (emp.warned === emp.contractEnd) continue;
    if (emp.contractEnd >= s.date && emp.contractEnd <= addDays30(s.date)) {
      emp.warned = emp.contractEnd;
      message(s, {
        title: `عقد ${emp.name.ar} ينتهي قريبًا`,
        body: `ينتهي في ${emp.contractEnd}. جدّد من الهيكل التنظيمي قبل رحيله مجانًا.`,
        category: "club",
      });
    }
  }
}
const addDays30 = (d) => addDays(d, 30);
