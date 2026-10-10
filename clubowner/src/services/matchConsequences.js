// عواقب الملعب 0.24 — إصابات، إنذارات متراكمة، طرد، فورمة اللاعب.
// تُطبَّق فقط على لاعبي ناديك (owners=true fixtures)، عبر القنوات الحالية.
// مُصمَّمة للأداء الحرج: لا تلمس سوى 11 لاعبًا في الماتش.

import { addDays, clamp } from "../core/utils.js";
import { message } from "./inbox.js";
import { fitnessFactor } from "./staff/effects.js";

// ── 1. إصابات ──────────────────────────────────────────────────────────────

const INJURY_TYPES = [
  { textAr: "التواء الكاحل", textEn: "Ankle sprain", textFr: "Entorse de la cheville" },
  { textAr: "تمزق عضلي", textEn: "Muscle tear", textFr: "Déchirure musculaire" },
  { textAr: "إصابة في الركبة", textEn: "Knee injury", textFr: "Blessure au genou" },
  { textAr: "كدمة قوية", textEn: "Heavy bruise", textFr: "Contusion sévère" },
  { textAr: "شد في الفخذ", textEn: "Thigh strain", textFr: "Clou de la cuisse" },
];

export function injuryDurationText(days) {
  if (days <= 7) return `${days} أيام`;
  if (days <= 30) return `${Math.ceil(days / 7)} أسابيع`;
  return `${Math.ceil(days / 30)} أشهر`;
}

export function injuryDurationTextEn(days) {
  if (days <= 7) return `${days} days`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
  return `${Math.ceil(days / 30)} months`;
}

export function injuryDurationTextFr(days) {
  if (days <= 7) return `${days} jours`;
  if (days <= 30) return `${Math.ceil(days / 7)} semaines`;
  return `${Math.ceil(days / 30)} mois`;
}

/**
 * احتمال الإصابة: يعتمد على تعب اللاعب (fitness منخفض) + دقائق تراكمية كثيرة.
 * الصيغة: 3% أساسي × معامل التعب × معامل اللياقة.
 */
export function injuryProbability(p, factor = 1) {
  const fatigue = 1 + Math.min((p.seasonMinutes || 0) / 3000, 1.5);
  const lowFit = 1 + Math.max(0, (70 - (p.fitness || 70))) / 100;
  // 0.30: مدرب اللياقة يخفض الاحتمال عبر factor (افتراضي ١ يُبقي السلوك القديم).
  return clamp(0.03 * fatigue * lowFit * factor, 0.005, 0.12);
}

/**
 * مدة الإصابة بالأيام: خفيفة (2-5) / متوسطة (6-14) / ثقيلة (15-90).
 */
export function injuryDuration(rng) {
  const roll = rng();
  if (roll < 0.55) return 2 + Math.floor(rng() * 4); // 2-5 أيام
  if (roll < 0.90) return 6 + Math.floor(rng() * 9); // 6-14 يوم
  return 15 + Math.floor(rng() * 76); // 15-90 يوم
}

// ── 2. بطاقات: توليد موحّد ────────────────────────────────────────────────

/**
 * توليد توزيع البطاقات بشكل حتمي — يُشارك بين seasonStats وعواقب.
 * في مباريات الديربي: توتر أعلى وبطاقات صفراء وحمراء أعلى قليلًا.
 * @returns {{ yellows: Player[], reds: Player[] }}
 */
export function generateCardDistribution(xi, rng, options = {}) {
  const isDerby = !!options?.isDerby;
  const refereePolicy = options?.refereePolicy || "balanced";
  let yellowCount = isDerby
    ? Math.floor(rng() * 3) + (rng() < 0.6 ? 2 : 1)
    : Math.floor(rng() * 3) + (rng() < 0.3 ? 1 : 0);
  let redCount = isDerby ? (rng() < 0.08 ? 1 : 0) : rng() < 0.04 ? 1 : 0;
  if (refereePolicy === "strict") yellowCount++;
  else if (refereePolicy === "lenient") yellowCount = Math.max(0, yellowCount - 1);
  const yellows = [];
  const reds = [];
  for (let i = 0; i < yellowCount + redCount && xi.length; i++) {
    const idx = Math.floor(rng() * xi.length);
    if (i < yellowCount) yellows.push(xi[idx]);
    else reds.push(xi[idx]);
  }
  return { yellows, reds };
}

/** عدّاد الإنذارات المتراكمة قبل الإيقاف */
export const YELLOW_SUSPENSION_THRESHOLD = 4;

// ── 3. فورمة اللاعب ────────────────────────────────────────────────────────

/** نص الفورمة بحسب اللغة */
export function formLabel(form) {
  if (form >= 1.5) return "متوهج";
  if (form <= -1.5) return "بارد";
  return "عادي";
}

/**
 * تحديث الفورمة بعد كل مباراة: متوسط متحرك من آخر 5 تقييمات.
 */
export function updateForm(p, matchRating) {
  if (!Array.isArray(p.formRatings)) p.formRatings = [];
  p.formRatings.push(matchRating);
  if (p.formRatings.length > 5) p.formRatings.shift();
  const avg = p.formRatings.reduce((a, b) => a + b, 0) / p.formRatings.length;
  p.form = clamp(Math.round((avg - 6.5) * 1.5 * 10) / 10, -2, 2);
}

// ── 4. تطبيق العواقب بعد الماتش ──────────────────────────────────────────

/**
 * تطبيق عواقب المباراة على لاعبي ناديك:
 * - إصابات (احتمالية بناءً على الإجهاد)
 * - إنذارات متراكمة → إيقاف مباراة
 * - طرد → إيقاف المباراة القادمة
 * - تحديث الفورمة
 *
 * @returns {{ redCardPenalty: number }} — عقوبة النقص العددي (للاستخدام في strength)
 */
export function applyMatchConsequences(s, f, cards, rng, options = {}) {
  const xi = Array.isArray(f.lineup) && f.lineup.length
    ? f.lineup
        .map((x) => {
          const p = s.players.find((y) => y.id === x.playerId);
          return p && p.status !== "retired" ? p : null;
        })
        .filter(Boolean)
    : [];
  if (!xi.length) return { redCardPenalty: 0 };

  const home = f.home === s.clubId;
  const ours = home ? f.homeGoals : f.awayGoals;
  const theirs = home ? f.awayGoals : f.homeGoals;
  const delta = ours > theirs ? 0.7 : ours === theirs ? 0 : -0.5;

  let redCardPenalty = 0;

  // ── بطاقات صفراء: تراكم وإيقاف ──
  const suspensionThreshold = Number.isSafeInteger(options.suspensionThreshold)
    ? Math.max(2, Math.min(8, options.suspensionThreshold))
    : YELLOW_SUSPENSION_THRESHOLD;
  for (const p of (cards.yellows || [])) {
    p.seasonYellowByComp = (p.seasonYellowByComp || 0) + 1;
    if (p.seasonYellowByComp >= suspensionThreshold) {
      p.yellowCardSuspensions = (p.yellowCardSuspensions || 0) + 1;
      p.suspendedUntil = addDays(s.date, 8); // أسبوع إيقاف
      p.seasonYellowByComp = 0;
      message(s, {
        title: `إنذارات متراكمة — ${p.name}`,
        body: `تلقى ${p.name} إنذاره الصفراء الرابع هذا الموسم. إيقاف مباراة واحدة حتى ${p.suspendedUntil}.`,
        category: "matches",
      });
    }
  }

  // ── بطاقة حمراء: إيقاف المباراة القادمة + نقص عددي ──
  for (const p of (cards.reds || [])) {
    p.suspendedUntil = addDays(s.date, 8);
    redCardPenalty += 8;
    message(s, {
      title: `طرد — ${p.name}`,
      body: `تم طرد ${p.name} من المباراة. إيقاف مباراة واحدة حتى ${p.suspendedUntil}.`,
      category: "matches",
      priority: "high",
    });
  }

  // ── إصابات ──
  for (const p of xi) {
    const prob = injuryProbability(p, fitnessFactor(s));
    if (rng() < prob) {
      const days = injuryDuration(rng);
      const type = INJURY_TYPES[Math.floor(rng() * INJURY_TYPES.length)];
      p.injuryUntil = addDays(s.date, days);
      message(s, {
        title: `إصابة — ${p.name}`,
        body: `${type.textAr} لمدّة ${injuryDurationText(days)}. سيعود حوالي ${p.injuryUntil}.`,
        category: "matches",
      });
    }
  }

  // ── فورمة ──
  for (const p of xi) {
    const rating = Math.round(
      (5.9 + (p.rating - 60) / 22 + delta + (rng() * 0.9 - 0.45)) * 10
    ) / 10;
    updateForm(p, Math.max(4, Math.min(10, rating)));
  }

  return { redCardPenalty };
}
