import { initLegends } from "../services/legends.js";
import { initTalent } from "../services/talent/state.js";
import { initializeCareer } from "../models/player.js";
import { addDays, clamp, daysBetween } from "./utils.js";
import { stripDerivedProvenance } from "../models/provenance.js";
import { retiredRecord, pruneRetired } from "../services/retired.js";
import {
  AGING_HISTORY_KEEP,
  AGING_HISTORY_KEEP_OWN,
  STAFF_POOL_LIMIT,
  STAFF_POOL_MAX_AGE_DAYS,
} from "../services/careers.js";
import { initSeasonStats } from "../services/seasonStats.js";
import { migrateDynasty } from "../services/dynasty.js";
function migrateToFive(input) {
  if (input?.version === 4) {
    const s = structuredClone(input);
    s.version = 5;
    if (s.expansion) {
      s.expansion.europeanFormatVersion = 1;
      s.migrationNote =
        "تم الاحتفاظ بنتائج الموسم الحالي وقوائمه. نظام أوروبا الجديد يبدأ مع الموسم التالي؛ مواعيد الكؤوس المقبلة تراعي فاصل الراحة.";
    }
    return s;
  }
  if (input?.version === 3) {
    const s = structuredClone(input);
    s.version = 5;
    return s;
  }
  if (input?.version === 2) {
    const s = structuredClone(input);
    s.version = 5;
    s.squadLimit = 30;
    return s;
  }
  if (!input || input.version !== 1) return input;
  const s = structuredClone(input);
  s.version = 5;
  s.squadLimit = 30;
  s.difficulty = "normal";
  s.database = "demo";
  s.staff = [];
  s.scoutAssignments = [];
  s.clubDecisions = [];
  s.lastClubEvent = null;
  s.nextClubEventDate = addDays(s.date, 18);
  s.seasonNumber = 1;
  s.seasonHistory = [];
  s.nextSeasonDate = `${Number(s.date.slice(0, 4)) + 1}-07-01`;
  s.preferences = { ...s.preferences, language: "ar" };
  for (const p of s.players) initializeCareer(p, s.date);
  s.migrationNote =
    "تم ترحيل الحفظة القديمة دون استبدال لاعبيها أو تغيير رصيدها. قاعدة الأسماء الحقيقية تحتاج حفظة جديدة.";
  return s;
}

function migrateToSix(input) {
  if (!input || input.version === 6) return input;
  const five = migrateToFive(input);
  if (five?.version !== 5) return five;
  const s = structuredClone(five);
  s.version = 6;
  if (s.expansion) {
    s.expansion.promotionVersion = 0;
    s.expansion.playoffs = [];
  }
  if (s.management) {
    s.management.loanOffers = [];
    s.management.marketMode = "legacy";
    s.management.tactics = {
      enabled: false,
      formation: "4-3-3",
      press: "balanced",
      tempo: "normal",
      style: "balanced",
    };
  }
  s.migrationNote =
    (s.migrationNote || "") +
    " حفظت 0.6 فرقك ومجموعاتك ونتائجك القديمة؛ عضوية مصر الجديدة تحتاج مشوارًا جديدًا. سوق الحفظ القديم يبقى مفتوحًا والخطة الموضعية اختيارية.";
  return s;
}

function migrateToSeven(input) {
  if (!input || input.version === 7) return input;
  const old = migrateToSix(input);
  if (old?.version !== 6) return old;
  const s = structuredClone(old);
  s.version = 7;
  initTalent(s);
  s.migrationNote =
    (s.migrationNote || "") +
    " أضيف مركز المواهب دون استبدال قوائمك. التجدد الآلي يبدأ مستقبلًا في الأسواق المحملة؛ دفعات المالك تحتاج طلبه وموافقته.";
  return s;
}

function migrateToEight(input) {
  if (!input || input.version === 8) return input;
  const old = migrateToSeven(input);
  if (old?.version !== 7) return old;
  const s = structuredClone(old);
  s.version = 8;
  s.migrationNote =
    (s.migrationNote || "") +
    " احتفظ تحديث 0.8 بكل أنديتك ودرجاتك ونتائجك، بما فيها المستويات الإضافية القديمة. القوائم الجديدة وقواعد الاحتياط تبدأ في مشوار جديد فقط.";
  return s;
}

function migrateToNine(input) {
  if (!input || input.version === 9) return input;
  const old = migrateToEight(input);
  if (old?.version !== 8) return old;
  const s = structuredClone(old);
  s.version = 9;
  if (s.expansion) {
    s.expansion.competitionVersion = 0;
    s.expansion.domesticHonours ??= {};
  }
  s.migrationNote =
    (s.migrationNote || "") +
    " مسابقات موسمك الحالي ونتائجها محفوظة؛ أنظمة كؤوس 0.9 تبدأ بعد نهاية الموسم، دون تغيير درجاتك أو نظام صعودك.";
  return s;
}

function migrateToTen(input) {
  if (!input || input.version === 10) return input;
  const old = migrateToNine(input);
  if (old?.version !== 9) return old;
  const s = structuredClone(old);
  s.version = 10;
  if (s.expansion) s.expansion.fifaVersion = 0;
  s.migrationNote =
    (s.migrationNote || "") +
    " صيغتا FIFA الجديدتان تبدآن بعد نهاية الموسم الحالي؛ القرعات والنتائج القديمة باقية، وعدد الدرجات والصعود لم يتغيرا.";
  return s;
}

function migrateToEleven(input) {
  if (!input || input.version === 11) return input;
  const old = migrateToTen(input);
  if (old?.version !== 10) return old;
  const s = structuredClone(old);
  s.version = 11;
  if (s.expansion) s.expansion.asiaVersion = 0;
  s.migrationNote =
    (s.migrationNote || "") +
    " بطولات آسيا الثلاث تبدأ بعد نهاية الموسم الجاري؛ النتائج والدرجات الحالية محفوظة.";
  return s;
}

function migrateToTwelve(input) {
  if (!input || input.version === 12) return input;
  const old = migrateToEleven(input);
  if (old?.version !== 11) return old;
  const s = structuredClone(old);
  s.version = 12;
  if (s.expansion) s.expansion.concacafVersion = 0;
  s.migrationNote =
    (s.migrationNote || "") +
    " بطولات كونكاكاف الأربع تبدأ بعد نهاية الموسم الجاري؛ النتائج والدرجات الحالية محفوظة.";
  return s;
}

function migrateToThirteen(input) {
  if (!input || input.version === 13) return input;
  const old = migrateToTwelve(input);
  if (old?.version !== 12) return old;
  const s = structuredClone(old);
  s.version = 13;
  if (s.expansion) s.expansion.domesticHonours ??= {};
  s.migrationNote =
    (s.migrationNote || "") +
    " كؤوس 0.13 المحلية الكاملة تبدأ من الموسم الجديد؛ كؤوس الموسم الجاري ونتائجها محفوظة، وسوبر الأسواق الجديدة يُلعب بنتائج هذا الموسم عند اكتماله.";
  return s;
}

function migrateToFourteen(input) {
  if (!input || input.version === 14) return input;
  const old = migrateToThirteen(input);
  if (old?.version !== 13) return old;
  // 0.14 is code-driven (calendar padding + tiered prizes apply to newly
  // scheduled fixtures and future posts); no saved shape changes.
  const s = structuredClone(old);
  s.version = 14;
  s.migrationNote =
    (s.migrationNote || "") +
    " مراجعة 0.14: جداول كونكاكاف الجديدة تتجنب ازدحام المباريات تلقائيًا، وجوائز البطولات أصبحت متدرجة حسب المستوى؛ نتائج الموسم الجاري محفوظة.";
  return s;
}

function migrateToFifteen(input) {
  if (!input || input.version === 15) return input;
  const old = migrateToFourteen(input);
  if (old?.version !== 14) return old;
  // 0.15 is additive (local sponsors, display currency, bonus clauses apply
  // to current and future contracts); no saved shape changes.
  const s = structuredClone(old);
  s.version = 15;
  s.migrationNote =
    (s.migrationNote || "") +
    " اقتصاد 0.15: رعاة محليون لبلد ناديك، وعرض الرصيد بالعملة المحلية، ومكافآت أداء تلقائية للعقود القائمة؛ العقود والنتائج الحالية محفوظة.";
  return s;
}

function migrateToSixteen(input) {
  if (!input || input.version >= 16) return input;
  const old = migrateToFifteen(input);
  if (old?.version !== 15) return old;
  // 0.16 is additive (negotiation ledger, seat categories, match premium,
  // dated coach contracts); cups, players, and finances untouched.
  const s = structuredClone(old);
  s.version = 16;
  s.sponsorDeals ??= [];
  if (s.commerce) {
    s.commerce.ticketPrices ??= {
      first: clamp(Math.round(s.ticketPrice * 2), 40, 2000),
      vip: clamp(Math.round(s.ticketPrice * 5), 100, 5000),
    };
    s.commerce.matchPremium ??= 0;
  }
  if (s.management?.coach) {
    s.management.coach.contractYears ??= 1;
    s.management.coach.contractEnd ??= addDays(s.date, 365);
  }
  s.migrationNote =
    (s.migrationNote || "") +
    " اقتصاد 0.16: تفاوض مضاد على الرعاية، وفئات تذاكر وعلاوة مباراة، وسوق مدربين موسع بعقود مؤرخة؛ العقود والنتائج الحالية محفوظة.";
  return s;
}

function migrateToSeventeen(input) {
  if (!input || input.version >= 17) return input;
  const old = migrateToSixteen(input);
  if (old?.version !== 16) return old;
  // 0.17 is additive: legends hall state only; players, cups, and finances untouched.
  const s = structuredClone(old);
  s.version = 17;
  s.legends ??= initLegends();
  s.migrationNote =
    (s.migrationNote || "") +
    " الأساطير 0.17: قاعة أساطير بأسماء حقيقية وأدوار تدريبية حسب المركز؛ الحفظة القديمة تعمل كما هي وبدون عقود أساطير.";
  return s;
}

// 0.20 (save v18): long-career capacity. Retirees move to a compact archive, per-player provenance
// copies are dropped for world-pack players (regenerated from the pack on display), aging history is
// capped, and the world staff-candidate pool is bounded. Done in place: a 100 MB world save must not
// be cloned a second time on a 2 GB phone, and the caller owns the freshly parsed object.
export function migrateToEighteen(s) {
  if (!s || s.version !== 17) return s;
  s.version = 18;
  s.retired ??= [];
  const known = new Set(s.retired.map((r) => r.id));
  const retiring = [];
  for (let i = 0; i < s.players.length; i++) {
    let p = s.players[i];
    if (p.status === "retired") {
      if (!known.has(p.id)) {
        p.retiredOn ??= p.careerHistory?.find((h) => h.type === "retired")?.date || s.date;
        retiring.push(p);
        known.add(p.id);
      }
      continue;
    }
    const slim = stripDerivedProvenance(p);
    if (slim) s.players[i] = p = slim;
    if (Number.isFinite(p.developmentRate))
      p.developmentRate = Math.round(p.developmentRate * 1000) / 1000;
    if (Array.isArray(p.agingHistory)) {
      const keep = p.clubId === s.clubId ? AGING_HISTORY_KEEP_OWN : AGING_HISTORY_KEEP;
      p.agingHistory = p.agingHistory
        .slice(-keep)
        .map((h) => ({ date: h.date, rating: h.rating }));
    }
  }
  if (retiring.length) {
    for (const p of retiring) s.retired.push(retiredRecord(p));
    s.players = s.players.filter((p) => p.status !== "retired");
  }
  const retiredById = new Map(s.retired.map((r) => [r.id, r]));
  let pool = 0;
  const keepStaff = [];
  for (const c of [...s.staff].reverse()) {
    const r = retiredById.get(c.personId);
    c.formerClubId ??= r?.previousClubId ?? null;
    c.since ??= r?.retiredOn ?? s.date;
    if (c.status === "employed" || c.formerClubId === s.clubId) keepStaff.push(c);
    else if (
      pool < STAFF_POOL_LIMIT &&
      daysBetween(c.since, s.date) < STAFF_POOL_MAX_AGE_DAYS
    ) {
      pool++;
      keepStaff.push(c);
    }
  }
  const dropped = s.staff.length - keepStaff.length;
  s.staff = keepStaff.reverse();
  pruneRetired(s);
  if (s.talent?.world) s.talent.world.limitNotice = false;
  s.migrationNote =
    (s.migrationNote || "") +
    ` سعة المسيرة الطويلة 0.20: نُقل ${retiring.length} معتزلًا إلى أرشيف مضغوط، وخفّ حجم سجل كل لاعب؛ النتائج والعقود والمالية محفوظة كما هي` +
    (dropped ? `، وأُزيل ${dropped} مرشحًا مهنيًا قديمًا من خارج ناديك.` : ".");
  return s;
}

// 0.23 (save v19): per-player season stats. Lightweight counters (goals, assists, cards,
// clean sheets, rating sum/count, minutes) accumulate during matchDay and reset at season end.
// The migration initializes all existing active players to zero counters.
function migrateToNineteen(input) {
  if (!input || input.version !== 18) return input;
  const old = migrateToEighteen(input);
  if (old?.version !== 18) return old;
  const s = structuredClone(old);
  s.version = 19;
  for (const p of s.players) {
    if (p.status !== "retired") initSeasonStats(p);
  }
  s.migrationNote =
    (s.migrationNote || "") +
    " إحصائيات الموسم 0.23: عدّادات أهداف وأسيست وبطاقات وتصنيفات ودقائق لكل لاعب تتراكم تلقائيًا وتُحفظ في نهاية الموسم؛ النتائج والعقود والمالية محفوظة كما هي.";
  return s;
}

// 0.24 (save v20): match consequences — form, suspension, yellow card accumulation.
// The migration initializes all existing active players to default consequence fields.
function migrateToTwenty(input) {
  if (!input || input.version !== 19) return input;
  const old = migrateToNineteen(input);
  if (old?.version !== 19) return old;
  const s = structuredClone(old);
  s.version = 20;
  for (const p of s.players) {
    if (p.status !== "retired") {
      p.form ??= 0;
      p.suspendedUntil ??= null;
      p.yellowCardSuspensions ??= 0;
      p.seasonYellowByComp ??= 0;
      p.formRatings ??= [];
    }
  }
  s.migrationNote =
    (s.migrationNote || "") +
    " عواقب الملعب 0.24: إصابات أثناء المباريات، وإنذارات متراكمة تؤدي للإيقاف، وفورمة اللاعب تؤثر على الأداء؛ النتائج والعقود والمالية محفوظة كما هي.";
  return s;
}

// 0.24 (save v21): dynasty and generational succession. Existing family records and the
// owner's age are normalized in place; empty old saves start the family at their first marriage/birth.
function migrateToTwentyOne(input) {
  if (!input || input.version !== 20) return input;
  const s = structuredClone(input);
  s.version = 21;
  s.dynasty = migrateDynasty(s);
  s.migrationNote =
    (s.migrationNote || "") +
    " الأجيال 0.24: حُفظ عمر المالك والأبناء وصفاتهم الحالية، وتبدأ منظومة العائلة تلقائيًا عند الزواج والإنجاب دون تغيير اللاعبين أو المالية.";
  return s;
}

// Save v22: normalize academy journey records and initialize the event/opinion timeline.
// Existing v21 family members, academy history and owner age are migrated without touching club finances.
function migrateToTwentyTwo(input) {
  if (!input || input.version !== 21) return input;
  const s = structuredClone(input);
  s.version = 22;
  s.dynasty = migrateDynasty(s);
  s.migrationNote =
    (s.migrationNote || "") +
    " تحديث الأجيال: تمت تهيئة تقارير الأكاديمية وسجل الرأي العام والأحداث، مع الحفاظ على الأسرة والعمر واللاعبين والمالية.";
  return s;
}

export function migrateSave(input) {
  if (!input || input.version === 22) return input;
  if (input.version === 21) return migrateToTwentyTwo(input);
  if (input.version === 20) return migrateToTwentyTwo(migrateToTwentyOne(input));
  const v17 = migrateToSeventeen(input);
  const v18 = v17?.version === 17 ? migrateToEighteen(v17) : v17;
  if (v18?.version !== 18) return v18;
  const v19 = migrateToNineteen(v18);
  const v20 = migrateToTwenty(v19);
  const v21 = migrateToTwentyOne(v20);
  return migrateToTwentyTwo(v21);
}
