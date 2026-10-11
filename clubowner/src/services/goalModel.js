// نموذج الأهداف 0.43 — مصدر واحد لمن يسجل ومن يصنع ومتى.
// المحرك يحسب الخطة مرة واحدة لكل مباراة، ثم تستهلكها الإحصاءات (seasonStats)
// والتقرير (matchReport) فلا تختلف الأرقام بين الشاشات ولا تظهر "أهداف أشباح".

// وزن التسجيل حسب المركز: المهاجم يسجل أكثر بكثير من المدافع، والحارس لا يسجل عمليًا.
const SCORE_WEIGHT = {
  GK: 0,
  CB: 0.45,
  LB: 0.45,
  RB: 0.45,
  DM: 0.35,
  CM: 0.8,
  LM: 1.0,
  RM: 1.0,
  AM: 1.2,
  LW: 1.45,
  RW: 1.45,
  ST: 2.2,
  CF: 2.2,
};
// وزن الصناعة حسب المركز: صانع الألعاب والأجنحة والأظهرة يصنعون أكثر.
const ASSIST_WEIGHT = {
  GK: 0.02,
  CB: 0.3,
  LB: 0.9,
  RB: 0.9,
  DM: 0.6,
  CM: 1.2,
  LM: 1.4,
  RM: 1.4,
  AM: 1.8,
  LW: 1.5,
  RW: 1.5,
  ST: 0.7,
  CF: 0.7,
};
const DEFAULT_WEIGHT = 0.8;

// النجوم أكثر ميلًا للتسجيل: وزن تربيعي حول تقييم 50، محصور بين 0.3 و4.
export function starWeight(rating) {
  const r = Number.isFinite(rating) ? rating : 50;
  const x = (r - 50) / 25;
  return Math.max(0.3, Math.min(4, 0.5 + x * x));
}

export function scoreWeight(p) {
  const pos = SCORE_WEIGHT[p?.position] ?? DEFAULT_WEIGHT;
  return pos * starWeight(p?.rating);
}

export function assistWeight(p) {
  const pos = ASSIST_WEIGHT[p?.position] ?? DEFAULT_WEIGHT;
  return pos * starWeight(p?.rating);
}

function pickWeighted(rng, items, weightOf, exclude = null) {
  const pool = items.filter((x) => !exclude || x.p.id !== exclude);
  const weights = pool.map((x) => weightOf(x.p));
  const total = weights.reduce((a, b) => a + b, 0);
  if (!pool.length || total <= 0) return null;
  let r = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/**
 * يبني خطة أهداف فريقنا في المباراة.
 * @param rng  — دالة عشوائية حتمية
 * @param xi   — تشكيلة المباراة [{p}] (نفس التشكيلة التي تُحسب إحصاءاتها)
 * @param count — عدد أهدافنا
 * @param extraTime — هل امتدت المباراة (120 دقيقة)
 * @returns {{s:string|null, a:string|null, m:number}[]} مرتبة بالدقيقة
 */
export function planOwnGoals(rng, xi, count, extraTime = false) {
  if (!Array.isArray(xi) || !xi.length || count <= 0) return [];
  const span = extraTime ? 120 : 90;
  const minutes = new Set();
  while (minutes.size < count) minutes.add(1 + Math.floor(rng() * span));
  const sorted = [...minutes].sort((a, b) => a - b);
  return sorted.map((m) => {
    const scorer = pickWeighted(rng, xi, scoreWeight);
    const assist = scorer ? pickWeighted(rng, xi, assistWeight, scorer.p.id) : null;
    return { s: scorer?.p.id ?? null, a: assist?.p.id ?? null, m };
  });
}
