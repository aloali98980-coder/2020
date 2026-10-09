// يوم قفل القيد (Deadline Day) 0.27
// في آخر يوم من نافذة الانتقالات (30 سبتمبر و31 يناير):
// عد تنازلي ظاهر + تسارع عروض AI (شراء وبيع) + رسائل عاجلة + إغلاق السوق في الموعد بدقة. أطول ليلة في الموسم.
import { aiTransferDay, marketOpen, teamPower } from "./market.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { post } from "./finance.js";
import { message, closeThread } from "./inbox.js";
import { random } from "../core/utils.js";
import { money, cur } from "../ui/format.js";

/**
 * التحقق مما إذا كان اليوم هو يوم قفل القيد
 * النوافذ النموذجية تنتهي في 30 سبتمبر (الصيف) و31 يناير (الشتاء)
 */
export function isDeadlineDay(s, date = null) {
  const d = date || s?.date;
  if (!d) return false;
  const day = d.slice(5);
  // يوم قفل القيد هو آخر يوم في النافذة: 09-30 أو 01-31
  return day === "09-30" || day === "01-31";
}

/**
 * نص وحالة العد التنازلي ليوم قفل القيد
 */
export function getDeadlineCountdown(s, date = null) {
  const d = date || s?.date;
  if (!isDeadlineDay(s, d)) return null;
  const isSummer = d.slice(5) === "09-30";
  return {
    isDeadline: true,
    season: isSummer ? "summer" : "winter",
    closingTime: "23:59",
    hoursText: "الساعات الأخيرة قبل منتصف الليل",
    hoursTextEn: "Final hours before midnight",
    hoursTextFr: "Dernières heures avant minuit",
    labelAr: "يوم قفل القيد — أطول ليلة في الموسم (السوق يغلق الليلة 23:59)",
    labelEn: "Deadline Day — The longest night of the season (Window closes tonight at 23:59)",
    labelFr: "Date limite des transferts — La plus longue nuit de la saison (Fermeture ce soir à 23h59)",
  };
}

/**
 * معالجة أحداث يوم قفل القيد اليومية
 */
export function deadlineDayTick(s) {
  if (!s) return;
  const day = s.date.slice(5);

  // 1. نحن في يوم قفل القيد (30 سبتمبر أو 31 يناير)
  if (isDeadlineDay(s)) {
    // إرسال تنبيه صباحي عاجل في أول اليوم
    if (s.deadlineNoticeDate !== s.date) {
      s.deadlineNoticeDate = s.date;
      message(s, {
        title: "🚨 يوم قفل القيد: الساعات الأخيرة لحسم الصفقات",
        body: "أطول ليلة في الموسم: سوق الانتقالات يُغلق الليلة عند منتصف الليل تماماً (23:59). تتسارع اتصالات الإدارات والعروض في الساعات الأخيرة. انتهز الفرصة قبل إغلاق النظام بدقة!",
        category: "transfers",
        priority: "high",
        kind: "deadline-alert",
      });
    }

    // تسارع انتقالات الذكاء الاصطناعي (AI-to-AI) — وتيرة مضاعفة في هذا اليوم
    if (s.expansion) {
      aiTransferDay(s);
    }

    // تقديم عرض عاجل لشراء أحد لاعبي ناديك في الساعات الأخيرة
    generateUrgentAiBid(s);
    return;
  }

  // 2. فحص إغلاق السوق في اليوم التالي مباشرة (01 أكتوبر أو 01 فبراير)
  if (day === "10-01" || day === "02-01") {
    if (s.lastWindowCloseNotice !== s.date) {
      s.lastWindowCloseNotice = s.date;
      // إنهاء أي عروض قيد معلقة لم يُجب عليها
      expirePendingDeadlineBids(s);

      message(s, {
        title: "🔒 إغلاق نافذة الانتقالات رسميًا",
        body: "أُغلقت نافذة قيد وانتقالات اللاعبين رسميًا بحلول منتصف الليل بدقة. النظام مغلق أمام أي تسجيلات جديدة حتى فتح النافذة القادمة.",
        category: "transfers",
        kind: "deadline-closed",
      });
    }
  }
}

/**
 * توليد عرض شراء عاجل من أحد أندية الذكاء الاصطناعي للاعب من ناديك
 */
function generateUrgentAiBid(s) {
  if (!s.players || !s.players.length) return;
  // التحقق من عدم وجود عرض عاجل قائم اليوم
  if (s.inbox?.some((m) => m.kind === "deadline-bid" && !m.done && m.date === s.date)) {
    return;
  }

  // اختيار لاعب مؤهل للبيع من لاعبي ناديك
  const candidates = s.players.filter(
    (p) =>
      p.clubId === s.clubId &&
      p.status !== "retired" &&
      !p.loan &&
      p.value >= 150000 &&
      p.rating >= 60,
  );
  if (!candidates.length) return;

  const targetPlayer = candidates[Math.floor(random(s) * candidates.length)];

  // اختيار نادٍ مشترٍ من المنافسين
  let buyerClub = null;
  if (s.expansion?.divisions) {
    const clubs = s.expansion.divisions.flatMap((d) => d.clubs).filter((id) => id !== s.clubId);
    if (clubs.length) {
      const buyerId = clubs[Math.floor(random(s) * clubs.length)];
      buyerClub = extendedClub(buyerId);
    }
  }
  if (!buyerClub) {
    buyerClub = { id: "zamalek", name: "الزمالك" };
  }

  // عرض مالي مغرٍ (1.15 إلى 1.35 من القيمة السوقية)
  const premium = 1.15 + random(s) * 0.2;
  const fee = Math.round(targetPlayer.value * premium / 10000) * 10000;

  message(s, {
    title: `🚨 عرض اللحظات الأخيرة: ${buyerClub.name} يطلب ضم ${targetPlayer.name}`,
    body: `مع اقتراب إغلاق القيد الليلة، قدّم نادي ${buyerClub.name} عرضاً رسمياً عاجلاً بقيمة ${money(fee)} ${cur()} لضم ${targetPlayer.name}. ينتهي هذا العرض عند منتصف الليل تماماً (23:59) مع قفل القيد. هل توافق على بيع اللاعب؟`,
    category: "transfers",
    required: true,
    kind: "deadline-bid",
    ref: targetPlayer.id,
    buyerId: buyerClub.id,
    buyerName: buyerClub.name,
    fee,
    deadline: s.date,
    priority: "high",
  });
}

/**
 * إنهاء العروض العاجلة التي انقضى موعدها مع إغلاق القيد
 */
export function expirePendingDeadlineBids(s) {
  if (!s.inbox) return;
  for (const m of s.inbox) {
    if (m.kind === "deadline-bid" && !m.done) {
      m.done = true;
      m.required = false;
      m.body += " (انتهت صلاحية هذا العرض بإغلاق نافذة الانتقالات).";
    }
  }
}

/**
 * قبول عرض اللحظات الأخيرة
 */
export function acceptDeadlineBid(s, messageId) {
  const m = s.inbox?.find((x) => x.id === messageId);
  if (!m || m.done || m.kind !== "deadline-bid") return false;

  const player = s.players.find((p) => p.id === m.ref);
  if (!player || player.clubId !== s.clubId) {
    m.done = true;
    m.required = false;
    return false;
  }

  const fee = m.fee || Math.round(player.value * 1.2);
  const buyerId = m.buyerId || "ai-buyer";
  const buyerName = m.buyerName || extendedClub(buyerId)?.name || "النادي المشتري";

  // إتمام الصفقة المالية
  post(s, fee, "transfer-out", `بيع ${player.name} إلى ${buyerName} في يوم قفل القيد`, `deadline-sale-${player.id}`);

  // نقل اللاعب
  player.clubId = buyerId;
  player.clubName = buyerName;
  player.careerHistory.push({
    date: s.date,
    type: "transfer-deadline",
    from: s.clubId,
    clubId: buyerId,
    fee,
  });

  m.done = true;
  m.required = false;
  closeThread(s, m.id);

  message(s, {
    title: `صفقة اللحظات الأخيرة: تم بيع ${player.name}`,
    body: `تم إيداع ${money(fee)} ${cur()} في خزينة النادي بعد بيع ${player.name} إلى ${buyerName} قبل دقائق من إغلاق القيد بدقة.`,
    category: "transfers",
  });

  return true;
}

/**
 * رفض عرض اللحظات الأخيرة
 */
export function declineDeadlineBid(s, messageId) {
  const m = s.inbox?.find((x) => x.id === messageId);
  if (!m || m.done || m.kind !== "deadline-bid") return false;

  m.done = true;
  m.required = false;
  closeThread(s, m.id);

  const player = s.players.find((p) => p.id === m.ref);
  message(s, {
    title: `رفض العرض العاجل: ${player?.name || "اللاعب"} باقٍ في النادي`,
    body: `قررت الإدارة رفض عرض الساعات الأخيرة والاحتفاظ باللاعب في صفوف الفريق للموسم الحالي.`,
    category: "transfers",
  });

  return true;
}
