import {
  ACADEMY_FOCUS_IDS,
  ACADEMY_POSITION_IDS,
  CAREER_PATH_IDS,
  DYNASTY_SCHEMA,
  STAGE_IDS,
  TRAIT_IDS,
  UPBRINGING_IDS,
} from "../data/dynasty.js";
import { isoDate } from "./isoDate.js";

const validNumber = (value, min, max) =>
  Number.isFinite(value) && value >= min && value <= max;
const validId = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const validMonth = (value) =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const text = (value, max = 120) =>
  typeof value === "string" && value.length > 0 && value.length <= max;
const fail = (detail) => {
  throw new Error("ملف الأجيال غير سليم: " + detail);
};

function validateChild(child, seen, depth = 0) {
  if (depth > 12 || !child || typeof child !== "object") fail("سجل طفل غير صالح.");
  if (!validId(child.id) || seen.has(child.id)) fail("معرّف طفل مكرر أو غير صالح.");
  seen.add(child.id);
  if (!text(child.name) || !isoDate(child.birthDate) || !isoDate(child.bornOn))
    fail("اسم أو تاريخ ميلاد غير صالح.");
  if (!Number.isInteger(child.age) || child.age < 0 || child.age > 120)
    fail("عمر طفل خارج النطاق.");
  if (!STAGE_IDS.includes(child.stage)) fail("مرحلة نمو غير معروفة.");
  if (!Number.isInteger(child.generation) || child.generation < 1)
    fail("رقم جيل غير صالح.");
  if (
    !child.stats ||
    !["talent", "discipline", "ambition"].every((key) =>
      validNumber(child.stats[key], 0, 100),
    )
  )
    fail("مؤشرات الموهبة أو الانضباط أو الطموح غير صالحة.");
  if (
    !Array.isArray(child.traits) ||
    child.traits.length > 8 ||
    new Set(child.traits).size !== child.traits.length ||
    child.traits.some((trait) => !TRAIT_IDS.includes(trait))
  )
    fail("صفات الشخصية غير صالحة.");
  if (!UPBRINGING_IDS.includes(child.upbringing)) fail("أسلوب التربية غير صالح.");
  if (child.careerPath !== null && !CAREER_PATH_IDS.includes(child.careerPath))
    fail("مسار الوريث غير صالح.");
  if (
    !validNumber(child.relationship, 0, 100) ||
    !validNumber(child.jealousy, 0, 100) ||
    typeof child.isHeir !== "boolean" ||
    typeof child.excludedFromSuccession !== "boolean" ||
    typeof child.legalClaim !== "boolean"
  )
    fail("العلاقات العائلية غير صالحة.");
  if (child.spouse !== null && !text(child.spouse, 80)) fail("بيانات الشريك غير صالحة.");
  if (child.playerId !== null && !validId(child.playerId)) fail("مرجع اللاعب غير صالح.");
  if (child.academy !== null) {
    const academy = child.academy;
    if (
      !academy ||
      typeof academy !== "object" ||
      typeof academy.enrolled !== "boolean" ||
      !isoDate(academy.enteredOn) ||
      !ACADEMY_FOCUS_IDS.includes(academy.focus) ||
      !ACADEMY_POSITION_IDS.includes(academy.position) ||
      !Array.isArray(academy.matches) ||
      academy.matches.length > 5000 ||
      academy.matches.some((match) =>
        !match ||
        !isoDate(match.date) ||
        typeof match.played !== "boolean" ||
        !Number.isInteger(match.minutes) ||
        match.minutes < 0 ||
        match.minutes > 120 ||
        (match.performance !== null && !validNumber(match.performance, 0, 10)) ||
        !Number.isInteger(match.goals) ||
        match.goals < 0 ||
        match.goals > 10 ||
        !Number.isInteger(match.opponent) ||
        match.opponent < 1 ||
        match.opponent > 20
      ) ||
      !Array.isArray(academy.reports) ||
      academy.reports.length > 100 ||
      academy.reports.some((report) =>
        !report ||
        !isoDate(report.date) ||
        !ACADEMY_FOCUS_IDS.includes(report.focus) ||
        !validNumber(report.rating, 0, 99) ||
        !validNumber(report.form, 0, 100) ||
        !validNumber(report.gain, 0, 10) ||
        !Number.isInteger(report.appearances) ||
        report.appearances < 0 ||
        report.appearances > 5000 ||
        !Number.isInteger(report.goals) ||
        report.goals < 0 ||
        report.goals > 5000
      ) ||
      !validNumber(academy.rating, 0, 99) ||
      !Number.isInteger(academy.appearances) ||
      academy.appearances < 0 ||
      academy.appearances > 5000 ||
      !Number.isInteger(academy.goals) ||
      academy.goals < 0 ||
      academy.goals > 5000 ||
      !Number.isInteger(academy.minutes) ||
      academy.minutes < 0 ||
      academy.minutes > 500000 ||
      !Number.isInteger(academy.trainingSessions) ||
      academy.trainingSessions < 0 ||
      academy.trainingSessions > 5000 ||
      typeof academy.trialReady !== "boolean" ||
      !validMonth(academy.lastTrainingMonth) ||
      !validMonth(academy.lastMatchMonth) ||
      !validNumber(academy.form, 0, 100) ||
      (academy.injuryUntil !== null && !isoDate(academy.injuryUntil))
    )
      fail("ملف الأكاديمية غير صالح.");
    if (academy.mentorId !== null && !text(academy.mentorId, 120))
      fail("مرشد الأكاديمية غير صالح.");
  }
  if (!Array.isArray(child.offspring) || child.offspring.length > 50)
    fail("قائمة أبناء الوريث غير صالحة.");
  for (const descendant of child.offspring) validateChild(descendant, seen, depth + 1);
}

export function validateDynasty(s) {
  const d = s?.dynasty;
  if (!d || d.schema !== DYNASTY_SCHEMA) fail("إصدار البيانات غير مدعوم.");
  if (!Number.isInteger(d.generation) || d.generation < 1 || d.generation > 1000000)
    fail("رقم الجيل غير صالح.");
  if (
    !d.owner ||
    !text(d.owner.name, 80) ||
    !Number.isInteger(d.owner.age) ||
    d.owner.age < 18 ||
    d.owner.age > 120 ||
    !isoDate(d.owner.birthDate) ||
    !validNumber(d.owner.health, 0, 100) ||
    typeof d.owner.retired !== "boolean" ||
    !isoDate(d.owner.since) ||
    !Number.isInteger(d.owner.retirementAge) ||
    !Number.isInteger(d.owner.forcedRetirementAge) ||
    d.owner.forcedRetirementAge <= d.owner.retirementAge
  )
    fail("بيانات المالك أو نافذة التقاعد غير صالحة.");
  if (!text(d.familyName, 80)) fail("اسم العائلة غير صالح.");
  if (d.spouse !== null && !text(d.spouse, 80)) fail("بيانات الزواج غير صالحة.");
  if (!Array.isArray(d.children) || d.children.length > 50) fail("عدد الأبناء غير صالح.");
  const seen = new Set();
  for (const child of d.children) validateChild(child, seen);
  if (d.heirId !== null && !d.children.some((child) => child.id === d.heirId))
    fail("الوريث الرسمي غير موجود في الجيل الحالي.");
  if (d.children.filter((child) => child.isHeir).length > 1)
    fail("يوجد أكثر من وريث رسمي.");
  if (!validNumber(d.publicBalance, 0, 100)) fail("ميزان الرأي العام خارج النطاق.");
  if (!validNumber(d.fanConfidence, 0, 100)) fail("ثقة الجماهير خارج النطاق.");
  if (!Number.isSafeInteger(d.shirtSales) || d.shirtSales < 0)
    fail("مبيعات القمصان غير صالحة.");
  if (!Number.isInteger(d.titlesWon) || d.titlesWon < 0)
    fail("عدد الألقاب غير صالح.");
  if (!Number.isInteger(d.legacyScore) || d.legacyScore < 0 || d.legacyScore > 1000)
    fail("نقاط الإرث خارج النطاق.");
  if (!Array.isArray(d.events) || d.events.length > 10000) fail("سجل الأحداث غير صالح.");
  const eventIds = new Set();
  for (const event of d.events) {
    if (
      !validId(event.id) ||
      eventIds.has(event.id) ||
      !text(event.type, 80) ||
      !isoDate(event.date) ||
      !["open", "resolved"].includes(event.status) ||
      (event.childId !== null && !validId(event.childId))
    )
      fail("مرجع حدث عائلي غير صالح.");
    eventIds.add(event.id);
  }
  if (!Array.isArray(d.legacyHistory) || d.legacyHistory.length > 100)
    fail("أرشيف الإرث غير صالح.");
  if (!Array.isArray(d.familyArchive) || d.familyArchive.length > 100)
    fail("أرشيف العائلة غير صالح.");
  if (!d.ownerBonuses || !["playerRelations", "sponsorNegotiation", "clubFame", "autonomy"].every((key) => validNumber(d.ownerBonuses[key], 0, 100)))
    fail("مكافآت المالك غير صالحة.");
  if (!d.legalPrelude || !["none", "seeded", "prepared", "settled"].includes(d.legalPrelude.status))
    fail("التمهيد القضائي غير صالح.");
  return d;
}
