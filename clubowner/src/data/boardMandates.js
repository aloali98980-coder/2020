// لائحة الجمعية العمومية 0.26 — القواعد والبيانات المولِّدة للائحة.
//
// التصميم: اللائحة تُبنى من ثلاثة محاور إلزامية (رياضي، مالي، تطويري)، وعدد البنود
// وحجم الأهداف يتبعان «حجم النادي» و«طموحه» — فلا يطلب من نادٍ صغير ما يُطلب من عملاق،
// ولا تُطلب بطولة قارية من نادٍ لا يشارك في مسابقة قارية أصلًا.
//
// المولّد دالة نقية: تأخذ الحفظة وتعيد كائن اللائحة بلا أي أثر جانبي، ولا تستهلك
// مولّد الأرقام العشوائي للعبة (s.seed) حتى تبقى النتيجة قابلة للتكرار في الاختبارات.
import { addDays, daysBetween, clamp } from "../core/utils.js";

export const MANDATE_SCHEMA = 1;

// ── حجم النادي: من السمعة (تُشتق أصلًا من قوة القائمة والدرجة والملعب) ─────────
export const CLUB_SIZES = {
  small: {
    key: "small",
    textKey: "boardSizeSmall",
    minRep: 0,
    youthMinutes: 600,
    liquidityFactor: 0.12,
    deficitFactor: 0.2,
    cupTies: 1,
  },
  medium: {
    key: "medium",
    textKey: "boardSizeMedium",
    minRep: 56,
    youthMinutes: 900,
    liquidityFactor: 0.15,
    deficitFactor: 0.25,
    cupTies: 1,
  },
  large: {
    key: "large",
    textKey: "boardSizeLarge",
    minRep: 70,
    youthMinutes: 1200,
    liquidityFactor: 0.18,
    deficitFactor: 0.28,
    cupTies: 2,
  },
  giant: {
    key: "giant",
    textKey: "boardSizeGiant",
    minRep: 82,
    youthMinutes: 1500,
    liquidityFactor: 0.2,
    deficitFactor: 0.3,
    cupTies: 3,
  },
};
export const SIZE_ORDER = ["small", "medium", "large", "giant"];
export const sizeOf = (rep) => {
  const value = Number.isFinite(rep) ? rep : 60;
  let out = "small";
  for (const key of SIZE_ORDER) if (value >= CLUB_SIZES[key].minRep) out = key;
  return out;
};

// ── الطموح: يرفع أو يخفض مركز الدوري المستهدف ويضيف بنودًا رياضية/مالية ────────
export const AMBITIONS = {
  survival: { key: "survival", textKey: "boardAmbitionSurvival", rankDelta: 3, bold: 0.8 },
  stable: { key: "stable", textKey: "boardAmbitionStable", rankDelta: 0, bold: 1 },
  ambitious: { key: "ambitious", textKey: "boardAmbitionAmbitious", rankDelta: -2, bold: 1.2 },
  elite: { key: "elite", textKey: "boardAmbitionElite", rankDelta: -3, bold: 1.4 },
  rebuild: { key: "rebuild", textKey: "boardAmbitionRebuild", rankDelta: 4, bold: 0.7 },
};
export const AMBITION_ORDER = ["survival", "stable", "ambitious", "elite"];
// بعد موسم مُخفِق تنزل اللائحة القادمة درجة: إعادة بناء لا عقاب متصاعد.
export const stepDown = (ambition) => {
  if (ambition === "rebuild") return "rebuild";
  const i = AMBITION_ORDER.indexOf(ambition);
  if (i <= 0) return "rebuild";
  return AMBITION_ORDER[i - 1];
};
// أساس الطموح من الحجم؛ والدرجة الأعلى تحتاج ناديًا أكبر حتى تكون قابلة للتحقيق.
export const baseAmbition = (size) =>
  size === "giant" ? "elite" : size === "large" ? "ambitious" : size === "medium" ? "stable" : "survival";

// ── أنواع البنود: كل نوع له محور وطريقة قياس ووحدة ونص ───────────────────────
export const ITEM_KINDS = {
  "league-rank": { axis: "sporting", critical: true, unit: "rank", textKey: "itemLeagueRank" },
  "cup-ties": { axis: "sporting", critical: true, unit: "ties", textKey: "itemCupTies" },
  "continental-stage": { axis: "sporting", critical: false, unit: "ties", textKey: "itemContinentalStage" },
  "continental-qualify": { axis: "sporting", critical: false, unit: "rank", textKey: "itemContinentalQualify" },
  "deficit-cap": { axis: "financial", critical: true, unit: "money", textKey: "itemDeficitCap" },
  "min-liquidity": { axis: "financial", critical: true, unit: "money", textKey: "itemMinLiquidity" },
  "player-sale": { axis: "financial", critical: false, unit: "money", textKey: "itemPlayerSale" },
  "youth-minutes": { axis: "development", critical: true, unit: "minutes", textKey: "itemYouthMinutes" },
  "facility-project": { axis: "development", critical: false, unit: "count", textKey: "itemFacilityProject" },
  "young-signing": { axis: "development", critical: false, unit: "age", textKey: "itemYoungSigning" },
};
export const AXES = ["sporting", "financial", "development"];
export const AXIS_TEXT_KEYS = {
  sporting: "axisSporting",
  financial: "axisFinancial",
  development: "axisDevelopment",
};

// ── اكتشاف المسابقات في الحفظة (الوضع الموسّع فقط) ───────────────────────────
export const isDomesticCup = (c) => String(c?.id || "").startsWith("cup-");
export const isSuperCup = (c) =>
  /^super-/.test(String(c?.id || "")) || String(c?.id || "").startsWith("recopa-");
export const isContinentalCup = (c) => !isDomesticCup(c) && !isSuperCup(c);
export const enteredCup = (s, cup) =>
  Boolean(
    cup &&
      (cup.entrants?.includes(s.clubId) ||
        cup.imports?.includes(s.clubId) ||
        cup.qualification?.some((q) => q.clubId === s.clubId)),
  );

// بذرة صغيرة نقية (بلا لمس s.seed): نفس الموسم + نفس النادي = نفس القرار دائمًا.
const hash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
export const chance = (salt, pct) => hash(salt) % 100 < pct;

// مباريات النادي هذا الموسم (الدوري) من جدول الحفظة نفسه.
export function ownLeagueFixtures(s) {
  const list = (s.fixtures || []).filter(
    (f) => f.home === s.clubId || f.away === s.clubId,
  );
  return list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
// تاريخ مراجعة المنتصف: منتصف مباريات الموسم فعليًا لا منتصف السنة تقويميًا.
export function midSeasonDate(s, startDate, endDate) {
  const own = ownLeagueFixtures(s);
  if (own.length >= 3) return own[Math.floor(own.length / 2)].date;
  const span = Math.max(1, daysBetween(startDate, endDate));
  return addDays(startDate, Math.round(span / 2));
}

const youthOf = (s) =>
  s.players.filter(
    (p) => p.clubId === s.clubId && p.status !== "retired" && p.age <= 21,
  );

// ── المولّد ──────────────────────────────────────────────────────────────────
export function buildMandate(s, { seasonNumber, startDate, endDate, ambition, rebuild = false }) {
  const sizeKey = sizeOf(s.reputation);
  const size = CLUB_SIZES[sizeKey];
  const ambitionKey = ambition || baseAmbition(sizeKey);
  const mood = AMBITIONS[ambitionKey] || AMBITIONS.stable;
  const tableSize = Math.max(4, s.table?.length || 8);
  const wageBudget = Math.max(1000000, s.finance?.wageBudget || 6500000);
  const items = [];

  // ═══ المحور الرياضي ═══
  const rankTarget = clamp(
    Math.round((tableSize / (sizeKey === "giant" ? 6 : sizeKey === "large" ? 3.4 : sizeKey === "medium" ? 2.2 : 1.5)) + mood.rankDelta),
    1,
    Math.max(1, tableSize - 1),
  );
  items.push({
    id: "league-rank",
    kind: "league-rank",
    target: rankTarget,
    critical: true,
  });

  const cups = s.expansion?.cups || [];
  const domestic = cups.filter((c) => isDomesticCup(c) && enteredCup(s, c));
  if (domestic.length) {
    items.push({
      id: "cup-ties",
      kind: "cup-ties",
      target: Math.max(1, size.cupTies),
      critical: true,
    });
  }
  const continental = cups.filter((c) => isContinentalCup(c) && enteredCup(s, c));
  if (continental.length) {
    // مشارك قاريًا فعلًا: المطلب تجاوز مواجهة إقصائية على الأقل.
    items.push({
      id: "continental-stage",
      kind: "continental-stage",
      target: mood.key === "elite" || mood.key === "ambitious" ? 2 : 1,
      critical: false,
    });
  } else if (
    s.expansion &&
    cups.length &&
    sizeKey !== "small" &&
    (mood.key === "ambitious" || mood.key === "elite")
  ) {
    // غير مشارك، لكن الطموح يسمح بطلب مقعد قاري عبر الدوري.
    items.push({
      id: "continental-qualify",
      kind: "continental-qualify",
      target: clamp(Math.round(tableSize / 4), 2, Math.max(2, tableSize - 2)),
      critical: false,
    });
  }

  // ═══ المحور المالي ═══
  items.push({
    id: "deficit-cap",
    kind: "deficit-cap",
    target: Math.round(wageBudget * size.deficitFactor * mood.bold),
    critical: true,
  });
  items.push({
    id: "min-liquidity",
    kind: "min-liquidity",
    target: Math.round(wageBudget * size.liquidityFactor * mood.bold),
    critical: true,
  });
  // بيع لاعب: يُطلب «أحيانًا» — قرار ثابت مُشتق من الموسم والنادي لا عشوائي متغير.
  if (chance(`${s.clubId}:${seasonNumber}:sale`, 40)) {
    items.push({
      id: "player-sale",
      kind: "player-sale",
      target: Math.round(wageBudget * 0.5),
      critical: false,
    });
  }

  // ═══ المحور التطويري ═══
  items.push({
    id: "youth-minutes",
    kind: "youth-minutes",
    target: Math.round(size.youthMinutes * mood.bold),
    critical: true,
  });
  items.push({
    id: "facility-project",
    kind: "facility-project",
    target: 1,
    critical: false,
  });
  if (youthOf(s).length < 3) {
    items.push({ id: "young-signing", kind: "young-signing", target: 21, critical: false });
  }

  // المحور يُثبَّت على البند وقت التوليد (لا يُشتق وقت العرض) لأن الحفظة تخزّنه.
  const resolved = items.map((it) => ({
    ...it,
    axis: ITEM_KINDS[it.kind].axis,
  }));
  return {
    schema: MANDATE_SCHEMA,
    id: `mandate-${seasonNumber}-${s.clubId}`,
    season: seasonNumber,
    issuedAt: startDate,
    startDate,
    endDate,
    midDate: midSeasonDate(s, startDate, endDate),
    size: sizeKey,
    ambition: rebuild ? "rebuild" : mood.key,
    rebuild: Boolean(rebuild),
    items: resolved,
    baseline: {
      facilityLevels: Object.fromEntries(
        (s.facilities || []).map((f) => [f.id, f.level]),
      ),
      youthIds: youthOf(s).map((p) => p.id),
      squadSize: s.players.filter(
        (p) => p.clubId === s.clubId && p.status !== "retired",
      ).length,
    },
    review: { mid: null, end: null },
  };
}
