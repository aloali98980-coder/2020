// المنظم والامتثال 0.36 — تدقيق دوري، غرامات، إيقاف الترخيص، لعب مسؤول، سمعة الشركة.
import { clamp, random, addDays } from "../../core/utils.js";
import { message } from "../inbox.js";
import { ensureBetting, estimateMarketValue } from "./state.js";
import { bettingText } from "../../data/bettingTexts.js";

export const RESPONSIBLE_COSTS = [0, 200_000, 500_000, 1_000_000];
export const RESPONSIBLE_LABELS = ["بلا", "أساسي", "متقدم", "احترافي"];

export function setResponsibleLevel(s, level) {
  const b = ensureBetting(s);
  if (!b.owned) throw new Error(bettingText("noCompany"));
  if (!Number.isInteger(level) || level < 0 || level > 3) throw new Error("مستوى لعب مسؤول غير صالح");
  b.compliance.responsibleLevel = level;
  const cost = RESPONSIBLE_COSTS[level];
  message(s, {
    title: bettingText("responsibleLabel") + ` — ${RESPONSIBLE_LABELS[level]}`,
    body: cost ? `تكلفة شهرية ${cost} تحمي الترخيص.` : "بدون إجراءات لعب مسؤول — المخاطر أعلى.",
    category: "events",
  });
  return level;
}

export function regulatorTick(s) {
  const b = ensureBetting(s);
  if (!b.owned) return null;
  if (b.licenseStatus === "revoked") return null;

  const now = s.date;
  const comp = b.compliance;

  // إيقاف مؤقت ينتهي
  if (b.licenseStatus === "suspended" && b.suspensionUntil && now > b.suspensionUntil) {
    b.licenseStatus = "active";
    b.suspensionUntil = null;
    message(s, { title: "إعادة تفعيل الترخيص", body: "انتهت مدة الإيقاف وعاد ترخيصك نشطًا.", category: "events" });
    comp.nextAudit = addDays(now, 90);
    return { resumed: true };
  }
  if (b.licenseStatus === "suspended") return { suspended: true };

  // أول تدقيق بعد 90 يوم من التأسيس/الشراء
  if (!comp.nextAudit) {
    comp.nextAudit = addDays(b.licenseSince || now, 90);
    comp.auditRisk = 12;
  }

  // تحديث مخاطرة التدقيق بناءً على السمعة والشبهات واللعب المسؤول
  const sus = s.blackFiles?.suspicion ?? 0;
  let risk = 12 + sus * 0.35 - b.reputation * 0.15 - comp.responsibleLevel * 9;
  if (b.sponsorLeague && s.politics?.office?.held) risk += 8; // تضارب يزيد التدقيق
  comp.auditRisk = clamp(Math.round(risk), 4, 92);

  // هل حان التدقيق؟
  const due = now >= comp.nextAudit || random(s) < comp.auditRisk / 800; // تدقيق مفاجئ 1-11%
  if (!due) return null;

  comp.lastAudit = now;
  comp.nextAudit = addDays(now, 90 + Math.floor(random(s) * 30));

  // نتيجة التدقيق: احتمال فشل = مخاطرة/100 * معامل عشوائي
  const failChance = clamp(comp.auditRisk / 100, 0.05, 0.85);
  const failed = random(s) < failChance;

  if (!failed) {
    b.reputation = clamp(b.reputation + 1 + comp.responsibleLevel, 0, 100);
    message(s, { title: "تدقيق رقابي ناجح ✅", body: "اجتزت التدقيق الدوري. سمعة الشركة ارتفعت قليلًا.", category: "events" });
    return { passed: true };
  }

  // فشل: غرامة + سمعة -5 إلى -12 + احتمال إيقاف
  const fine = 500_000 + Math.floor(random(s) * 4_500_000);
  comp.finesTotal += fine;
  // تخصم من الثروة الشخصية (الشركة تدفع)
  const e = s.empire;
  if (e) {
    const pay = Math.min(fine, e.personal);
    e.personal -= pay;
    if (pay < fine) e.debt += fine - pay;
  }
  b.reputation = clamp(b.reputation - (5 + Math.floor(random(s) * 8)), 0, 100);
  message(s, {
    title: bettingText("regulatorFineTitle"),
    body: bettingText("regulatorFineBody").replace("{money}", String(fine)),
    category: "board",
  });

  // إيقاف إذا تراكمت الغرامات أو تدقيق ثالث فاشل
  const shouldSuspend = comp.finesTotal > 12_000_000 || comp.suspensions >= 2 || random(s) < 0.45;
  if (shouldSuspend) {
    const days = 30 + Math.floor(random(s) * 61); // 30-90
    b.licenseStatus = "suspended";
    b.suspensionUntil = addDays(now, days);
    comp.suspensions += 1;
    b.reputation = clamp(b.reputation - 8, 0, 100);
    message(s, {
      title: bettingText("licenseSuspendedTitle"),
      body: bettingText("licenseSuspendedBody").replace("{date}", b.suspensionUntil),
      category: "board",
      priority: "high",
    });
    // تضارب مع رئاسة الاتحاد: يزيد ضغط المعارضة
    if (s.politics?.opposition) s.politics.opposition.pressure = clamp((s.politics.opposition.pressure || 0) + 12, 0, 100);
  }

  estimateMarketValue(s);
  return { failed: true, fine, suspended: shouldSuspend };
}

export function forceAudit(s) {
  const b = ensureBetting(s);
  b.compliance.nextAudit = s.date;
  return regulatorTick(s);
}
