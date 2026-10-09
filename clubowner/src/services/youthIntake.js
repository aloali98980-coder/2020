// يوم تصعيد الناشئين 0.27 — حدث موسمي ثابت
// دفعة ناشئين جديدة بملفات مختصرة + قرار: من تصعّد للفريق الأول ومن تعير ومن تسرّح؟
// مرتبط بنظام الأكاديمية والمنشآت الحالي.
import { uid, addDays, clamp, random } from "../core/utils.js";
import { prospect, POSITIONS } from "./talent/state.js";
import { reservedSquadSize } from "./employment.js";
import { wages } from "./finance.js";
import { message, closeThread } from "./inbox.js";
import { staffSkill } from "./staff.js";
import { academyPotentialBonus, academyScoutBonus, applyCurriculumTilt } from "./staff/academy.js";
import { extendedClub } from "../data/expandedCatalog.js";

export const YOUTH_INTAKE_FIXED_DATE = "03-20";

/**
 * فحص ما إذا كان اليوم هو يوم تصعيد الناشئين الموسمي
 */
export function isYouthIntakeDay(s, date = null) {
  const d = date || s?.date;
  if (!d) return false;
  return d.slice(5) === YOUTH_INTAKE_FIXED_DATE;
}

/**
 * معالجة التيك اليومي ليوم تصعيد الناشئين
 */
export function youthIntakeTick(s) {
  if (!s || !s.expansion) return;
  if (!s.talent) s.talent = { serial: 0, candidates: [] };
  if (!isYouthIntakeDay(s)) return;

  // التحقق من أن هذا الموسم لم تُجر له دفعة تصعيد بالفعل
  if (s.lastYouthIntakeSeason === s.seasonNumber) return;
  s.lastYouthIntakeSeason = s.seasonNumber;

  generateYouthIntake(s);
}

/**
 * توليد دفعة الناشئين للموسم
 */
export function generateYouthIntake(s) {
  if (!s?.expansion) return;
  if (!s.talent) s.talent = { serial: 0, candidates: [] };
  const academyFac = s.facilities?.find((f) => f.id === "academy");
  const academyLevel = academyFac ? academyFac.level : 1;
  const staffBonus = staffSkill(s, "academy");

  // عدد اللاعبين في الدفعة: 3 إلى 5 لاعبين
  const count = clamp(3 + Math.floor(academyLevel / 2), 3, 5);
  const candidates = [];

  const scoutError = Math.max(2, 9 - academyLevel - Math.floor(staffBonus / 30) - academyScoutBonus(s));

  for (let i = 0; i < count; i++) {
    const position = POSITIONS[(s.seasonNumber * 4 + i) % POSITIONS.length];
    const p = prospect(s, s.clubId, position);

    // ضبط العمر ليكون ناشئًا حقيقيًا (16-17 سنة)
    p.age = 16 + (i % 2);
    p.ageReference = p.age;
    p.birthDate = `${Number(s.date.slice(0, 4)) - p.age}-01-15`;
    p.potential = clamp(p.potential + academyPotentialBonus(s), 1, 99);
    applyCurriculumTilt(s, p);

    const potMin = Math.max(Math.round(p.rating), Math.floor(p.potential - scoutError));
    const potMax = Math.min(99, Math.ceil(p.potential + scoutError));

    candidates.push({
      player: p,
      range: [potMin, potMax],
      scoutAccuracy: 100 - scoutError * 8,
      recommendedAction: p.potential >= 82 ? "promote" : p.potential >= 74 ? "loan" : "release",
    });
  }

  s.youthIntakeBatch = {
    season: s.seasonNumber,
    date: s.date,
    candidates,
    resolved: false,
  };

  message(s, {
    title: "🎓 يوم تصعيد الناشئين: دفعة الموسم الجديد",
    body: `تخرّجت دفعة جديدة من مواهب الأكاديمية تضم ${candidates.length} لاعبين واعدين! استعرض ملفاتهم وقرر مصير كل ناشئ: من تصعّد للفريق الأول، ومن تعير لكسب الخبرة، ومن تسرّح؟`,
    category: "careers",
    required: true,
    kind: "youth-intake-day",
    ref: `intake-${s.seasonNumber}`,
    priority: "high",
  });

  return s.youthIntakeBatch;
}

/**
 * تنفيذ قرارات دفعة الناشئين (تصعيد / إعارة / تسريح)
 * @param {object} s - حالة الحفظ
 * @param {Record<string, "promote"|"loan"|"release">} decisions - خريطة القرارات بمعرف اللاعب
 */
export function executeYouthIntakeDecisions(s, decisions) {
  const batch = s.youthIntakeBatch;
  if (!batch || batch.resolved) return { success: false, error: "لا توجد دفعة ناشئين معلقة." };

  let promoted = 0;
  let loaned = 0;
  let released = 0;

  // إيجاد أندية محتملة للإعارة
  const partnerClubs = (s.expansion?.divisions?.flatMap((d) => d.clubs) || ["enppi", "ceramica", "ittihad"])
    .filter((id) => id !== s.clubId && !extendedClub(id)?.reserve);

  for (const c of batch.candidates) {
    const p = c.player;
    const decision = decisions[p.id] || c.recommendedAction || "release";

    if (decision === "promote") {
      // تصعيد للفريق الأول
      if (reservedSquadSize(s) < s.squadLimit && wages(s) + p.salary <= s.finance.wageBudget) {
        p.clubId = s.clubId;
        p.clubName = extendedClub(s.clubId)?.name || s.clubId;
        p.contractEnd = addDays(s.date, 1095); // 3 سنوات
        p.careerHistory.push({
          date: s.date,
          type: "academy-promotion",
          clubId: s.clubId,
        });
        s.players.push(p);
        promoted++;
      } else {
        // إذا امتلأت القائمة، يُحوَّل للإعارة تلقائيًا لعدم خسارة اللاعب
        const partner = partnerClubs[Math.floor(random(s) * partnerClubs.length)] || "enppi";
        p.appearances ??= 0;
        p.contractEnd = addDays(s.date, 1095);

        const offerId = `loan-intake-${p.id}`;
        const offer = {
          id: offerId,
          direction: "out",
          playerId: p.id,
          parent: s.clubId,
          borrower: partner,
          status: "accepted",
          accepted: s.date,
          terms: {
            days: 365,
            wageShare: 0.5,
            fee: 0,
            buyOption: null,
          },
        };
        if (!s.management) s.management = {};
        if (!Array.isArray(s.management.loanOffers)) s.management.loanOffers = [];
        s.management.loanOffers.push(offer);

        p.clubId = partner;
        p.loan = {
          version: 2,
          id: offerId,
          parent: s.clubId,
          borrower: partner,
          starts: s.date,
          until: addDays(s.date, 365),
          days: 365,
          wageShare: 0.5,
          fee: 0,
          buyOption: null,
          appearancesAtStart: p.appearances,
          lastReview: s.date,
          reviewAppearances: p.appearances,
          developmentAppearances: p.appearances,
        };
        p.careerHistory.push({
          date: s.date,
          type: "academy-loan",
          clubId: partner,
          parent: s.clubId,
        });
        s.players.push(p);
        loaned++;
      }
    } else if (decision === "loan") {
      // إعارة لاكتساب الخبرة دون استهلاك مقعد في القائمة الأساسية
      const partner = partnerClubs[Math.floor(random(s) * partnerClubs.length)] || "enppi";
      p.appearances = 0;
      p.contractEnd = addDays(s.date, 1095);

      const offerId = `loan-intake-${p.id}`;
      const offerTerms = {
        days: 365,
        wageShare: 50,
        fee: 0,
        buyOption: 0,
        recallAllowed: true,
        role: "rotation",
      };
      const offer = {
        id: offerId,
        playerId: p.id,
        parent: s.clubId,
        borrower: partner,
        direction: "out",
        date: s.date,
        replyDate: s.date,
        expires: addDays(s.date, 365),
        status: "accepted",
        proposed: offerTerms,
      };
      if (!s.management) s.management = {};
      if (!Array.isArray(s.management.loanOffers)) s.management.loanOffers = [];
      s.management.loanOffers.push(offer);

      p.clubId = partner;
      p.loan = {
        version: 2,
        id: offerId,
        parent: s.clubId,
        borrower: partner,
        starts: s.date,
        until: addDays(s.date, 365),
        ...offerTerms,
        appearancesAtStart: 0,
        lastReview: s.date,
        reviewAppearances: 0,
        developmentAppearances: 0,
      };
      p.careerHistory.push({
        date: s.date,
        type: "academy-loan",
        clubId: partner,
        parent: s.clubId,
      });
      s.players.push(p);
      loaned++;
    } else {
      // تسريح كلاعب حر
      p.clubId = "لاعب حر";
      p.clubName = "لاعب حر";
      p.value = 0;
      p.contractEnd = s.date;
      p.careerHistory.push({
        date: s.date,
        type: "academy-release",
        clubId: s.clubId,
      });
      s.players.push(p);
      released++;
    }
  }

  batch.resolved = true;

  // إغلاق أي رسائل بريد معلقة بالدفعة
  if (s.inbox) {
    for (const m of s.inbox) {
      if (m.kind === "youth-intake-day" && !m.done) {
        m.done = true;
        m.required = false;
        closeThread(s, m.id);
      }
    }
  }

  // رسالة تأكيد القرارات
  message(s, {
    title: "اكتملت قرارات دفعة الناشئين",
    body: `اعتمدت الإدارة قرارات الدفعة: تم تصعيد ${promoted} لاعبين للفريق الأول، وإعارة ${loaned} لاكتساب الخبرة، وتسريح ${released} كلاعبين أحرار.`,
    category: "careers",
  });

  return { success: true, promoted, loaned, released };
}
