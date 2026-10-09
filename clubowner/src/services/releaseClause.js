// نظام الشرط الجزائي 0.28 — ميكانيكا انتقالات نظيفة منفصلة خارج الشبهات.
// القيم متدرجة حسب التقييم بعملة اللعبة: <70 2-5M / 70-74 5-12M / 75-79 12-30M / 80-84 30-80M / 85+ 80-150M
// المضاعفات: تحت 21 سنة ×1.5 / عقد 3+ سنين ×1.3 / نادٍ إسباني ×2 / عقد أقل من سنة ×0.5 أو بلا شرط / فوق 30 سنة ×0.7 / ~25% بلا شرط
// النتيجة: سوبرستار صغير بعقد طويل في نادٍ غني يصل 150-300M+

import { addDays, daysBetween, random } from "../core/utils.js";

export const RELEASE_RANGES = {
  low: { maxRating: 69, min: 2000000, max: 5000000 },
  midLow: { maxRating: 74, min: 5000000, max: 12000000 },
  mid: { maxRating: 79, min: 12000000, max: 30000000 },
  midHigh: { maxRating: 84, min: 30000000, max: 80000000 },
  high: { maxRating: 100, min: 80000000, max: 150000000 },
};

export function baseRangeForRating(rating) {
  const r = Math.round(rating);
  if (r < 70) return RELEASE_RANGES.low;
  if (r <= 74) return RELEASE_RANGES.midLow;
  if (r <= 79) return RELEASE_RANGES.mid;
  if (r <= 84) return RELEASE_RANGES.midHigh;
  return RELEASE_RANGES.high;
}

// قيمة أساسية عشوائية داخل النطاق، حتمية عبر random(s) إن وجد.
export function baseReleaseValue(rating, rnd = Math.random()) {
  const range = baseRangeForRating(rating);
  const span = range.max - range.min;
  return Math.round(range.min + span * rnd);
}

// هل النادي إسباني؟ — عبر league أو عبر قائمة أندية الليجا
const SPANISH_CLUBS = new Set([
  "Deportivo Alavés",
  "Athletic Bilbao",
  "Atlético Madrid",
  "FC Barcelona",
  "RC Celta de Vigo",
  "Deportivo de A Coruña",
  "Elche CF",
  "RCD Espanyol",
  "Getafe CF",
  "Levante UD",
  "Málaga CF",
  "CA Osasuna",
  "Racing de Santander",
  "Rayo Vallecano",
  "Real Betis",
  "Real Madrid CF",
  "Real Sociedad",
  "Sevilla FC",
  "Valencia CF",
  "Villarreal CF",
  "Barcelona",
  "Real Madrid",
]);

export function isSpanishClub(player, s = null) {
  if (!player) return false;
  if (player.league === "es") return true;
  if (SPANISH_CLUBS.has(player.clubId)) return true;
  if (SPANISH_CLUBS.has(player.clubName)) return true;
  // في الحفظة الموسعة، نفحص هل النادي في مجموعة إسبانية؟
  if (s?.expansion) {
    const esDivisions = s.expansion.divisions?.filter((d) => d.country === "es");
    if (esDivisions?.some((d) => d.clubs.includes(player.clubId))) return true;
  }
  return false;
}

export function contractYearsLeft(player, currentDate) {
  if (!player?.contractEnd || !currentDate) return 2;
  const days = daysBetween(currentDate, player.contractEnd);
  return Math.max(0, days / 365);
}

// المضاعفات حسب المواصفات
export function releaseMultipliers(player, currentDate, spanish = false) {
  let mult = 1;
  const reasons = [];
  if (player.age < 21) {
    mult *= 1.5;
    reasons.push("u21");
  }
  const years = contractYearsLeft(player, currentDate);
  if (years >= 3) {
    mult *= 1.3;
    reasons.push("long-contract");
  }
  if (spanish) {
    mult *= 2;
    reasons.push("spanish");
  }
  if (years < 1 && years >= 0) {
    mult *= 0.5;
    reasons.push("short-contract");
  }
  if (player.age > 30) {
    mult *= 0.7;
    reasons.push("over30");
  }
  return { mult, reasons, years };
}

// الحساب الكامل: قيمة نهائية بعد المضاعفات، مع سقف 150-300M+ لسوبرستار صغير
export function calculateReleaseClause(player, currentDate, rnd = Math.random(), s = null) {
  // ~25% بلا شرط جزائي أصلًا
  if (rnd < 0.25) return 0;
  const baseRnd = typeof rnd === "number" ? (rnd - 0.25) / 0.75 : Math.random();
  const base = baseReleaseValue(player.rating, Math.min(0.99, Math.max(0, baseRnd)));
  const spanish = isSpanishClub(player, s);
  const { mult } = releaseMultipliers(player, currentDate, spanish);
  let value = Math.round(base * mult);
  // عقد أقل من سنة: 50% بلا شرط — نطبقها هنا باحتمال إضافي
  const years = contractYearsLeft(player, currentDate);
  if (years < 1) {
    // ~50% من حالات العقد القصير تصبح بلا شرط
    if (baseRnd > 0.5) return 0;
    value = Math.round(value * 0.5);
  }
  // سقف مرن: سوبرستار صغير بعقد طويل في نادٍ غني يصل 150-300M+
  // إذا كان التقييم 85+ وعمر <23 وعقد 3+ سنين وإسباني، نسمح حتى 300M
  if (player.rating >= 85 && player.age < 23 && years >= 3 && spanish) {
    value = Math.min(300000000, Math.max(value, 150000000 + Math.round(baseRnd * 150000000)));
  } else {
    value = Math.min(300000000, value);
  }
  return Math.max(0, value);
}

// عند توقيع لاعب جديد: مستوى الشرط بمقايضة راتب
export const CLAUSE_LEVELS = [
  { id: "none", labelAr: "بلا شرط", labelEn: "No clause", labelFr: "Sans clause", mult: 0, salaryFactor: 0.85 },
  { id: "low", labelAr: "شرط قليل", labelEn: "Low clause", labelFr: "Clause basse", mult: 0.6, salaryFactor: 0.9 },
  { id: "normal", labelAr: "شرط عادي", labelEn: "Normal clause", labelFr: "Clause normale", mult: 1.0, salaryFactor: 1.0 },
  { id: "high", labelAr: "شرط عالٍ", labelEn: "High clause", labelFr: "Clause élevée", mult: 1.6, salaryFactor: 1.15 },
  { id: "very-high", labelAr: "شرط عالٍ جدًا", labelEn: "Very high clause", labelFr: "Clause très élevée", mult: 2.2, salaryFactor: 1.30 },
];

export function clauseLevelForValue(base, value) {
  if (!value || value <= 0) return CLAUSE_LEVELS[0];
  const ratio = base > 0 ? value / base : 1;
  if (ratio <= 0.7) return CLAUSE_LEVELS[1];
  if (ratio <= 1.3) return CLAUSE_LEVELS[2];
  if (ratio <= 1.9) return CLAUSE_LEVELS[3];
  return CLAUSE_LEVELS[4];
}

export function salaryFactorForClauseLevel(levelId) {
  const lvl = CLAUSE_LEVELS.find((l) => l.id === levelId);
  return lvl ? lvl.salaryFactor : 1;
}

export function clauseValueForLevel(base, levelId) {
  const lvl = CLAUSE_LEVELS.find((l) => l.id === levelId);
  if (!lvl) return base;
  if (lvl.mult === 0) return 0;
  return Math.round(base * lvl.mult);
}

// يضمن وجود شرط جزائي لكل لاعب نشط (للحفظات القديمة)
export function ensureReleaseClause(s) {
  if (!s?.players) return;
  for (const p of s.players) {
    if (p.status === "retired") continue;
    if (!p.contractTerms) p.contractTerms = { appearanceBonus: 0, goalBonus: 0, annualRaisePct: 0, releaseClause: 0, signedOn: s.date, lastRaiseYear: s.date.slice(0,4) };
    if (typeof p.contractTerms.releaseClause !== "number") {
      const rnd = random(s);
      p.contractTerms.releaseClause = calculateReleaseClause(p, s.date, rnd, s);
    }
  }
}

// كسر الشرط الجزائي: دفع دفعة واحدة ثم التفاوض مع اللاعب مباشرة
export function canBreakReleaseClause(s, player) {
  if (!player) return false;
  if (player.clubId === s.clubId) return false;
  if (player.status === "retired") return false;
  const clause = player.contractTerms?.releaseClause || 0;
  if (clause <= 0) return false;
  if (s.finance.cash < clause) return false;
  return true;
}

export function breakReleaseClause(s, playerId) {
  const p = s.players.find((x) => x.id === playerId);
  if (!p) throw new Error("لاعب غير موجود.");
  if (!canBreakReleaseClause(s, p)) throw new Error("لا يمكن كسر الشرط الجزائي.");
  const clause = p.contractTerms.releaseClause;
  // سيتم الخصم في signPlayer بعد التفاوض؟ لا — الدفع دفعة واحدة الآن ثم التفاوض مع اللاعب مباشرة
  // حسب المواصفات: الدفع دفعة واحدة ثم التفاوض مع اللاعب مباشرة.
  // لذا ننشئ تفاوض خاص بنوع release-clause
  const existing = s.negotiations?.find((n) => n.playerId === playerId && ["waiting","club-reply","personal"].includes(n.stage));
  if (existing) throw new Error("يوجد تفاوض قائم.");
  const neg = {
    id: `release-${s.nextId++}-${playerId}`,
    playerId,
    seller: p.clubId,
    fee: clause,
    upfrontPercent: 100,
    date: s.date,
    stage: "personal",
    kind: "release-clause",
    clausePaid: false,
  };
  s.negotiations.push(neg);
  return neg;
}

// أندية AI تكسر شروط لاعبي اللاعب أيضًا (كاش فوري + غضب جماهيري + أحداث)
export function aiBreakReleaseClauses(s) {
  if (!s.expansion) return 0;
  if (!s.date.endsWith("-12")) return 0; // مرة في الشهر
  const ownPlayers = s.players.filter((p) => p.clubId === s.clubId && p.status !== "retired" && (p.contractTerms?.releaseClause||0) > 0);
  if (!ownPlayers.length) return 0;
  const aiClubs = s.expansion.divisions.flatMap((d) => d.clubs).filter((id) => id !== s.clubId);
  let broken = 0;
  for (const p of ownPlayers) {
    if (broken >= 1) break;
    const clause = p.contractTerms.releaseClause;
    const buyer = aiClubs.find((id) => (s.expansion.budgets[id]||0) >= clause * 1.2 && p.rating >= 72);
    if (!buyer) continue;
    const rnd = random(s);
    if (rnd > 0.02) continue;
    s.expansion.budgets[buyer] -= clause;
    broken++;
    s.blackFiles = s.blackFiles || {};
    s.blackFiles.pendingAiBreaks = s.blackFiles.pendingAiBreaks || [];
    s.blackFiles.pendingAiBreaks.push({ playerId: p.id, buyer, clause, date: s.date });
  }
  return broken;
}
