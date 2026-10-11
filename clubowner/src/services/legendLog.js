// الدفعة 6 — القسم 3: سجل الأسطورة. كل الأرقام من الحفظ: البطولات من تاريخ المواسم،
// والقرارات الكبرى من دفتر الخزينة (صفقات ≥ 20M)، والقياسات من جداول المواسم،
// ونقاط الإرث من calculateLegacyScore الموجودة (لا نظام إرث جديد).
import { calculateLegacyScore } from "./dynasty.js";

export const MAJOR_DECISION_FEE = 20_000_000;

export function titleSeasons(s) {
  return (s.seasonHistory || [])
    .filter((h) => h.table?.[0]?.clubId === s.clubId)
    .map((h) => ({ number: h.number, date: h.date }));
}

export function majorDecisions(s, minFee = MAJOR_DECISION_FEE) {
  return (s.finance?.ledger || [])
    .filter((e) => e.category === "transfer" && e.amount <= -minFee)
    .map((e) => ({ date: e.date, amount: -e.amount, description: e.description }))
    .slice(0, 10);
}

// أفضل موسم للنادي: نقاط، أهداف، فوز. يعتمد على صفوف الجدول المؤرشفة.
export function clubRecords(s) {
  const rows = (s.seasonHistory || [])
    .map((h) => ({ season: h.number, row: h.table?.find((r) => r.clubId === s.clubId) }))
    .filter((x) => x.row);
  if (!rows.length) return null;
  const best = (key) =>
    rows.reduce((a, b) => (b.row[key] > a.row[key] ? b : a));
  return {
    points: { season: best("points").season, value: best("points").row.points },
    goals: { season: best("gf").season, value: best("gf").row.gf },
    wins: { season: best("wins").season, value: best("wins").row.wins },
  };
}

export function ownerBio(s) {
  const d = s.dynasty || {};
  return {
    name: d.owner?.name || null,
    age: d.owner?.age ?? null,
    since: d.owner?.since || null,
    familyName: d.familyName || null,
    generation: d.generation ?? 1,
    children: (d.children || []).length,
    titlesWon: d.titlesWon || 0,
  };
}

export function legendLog(s) {
  return {
    titles: titleSeasons(s),
    decisions: majorDecisions(s),
    records: clubRecords(s),
    legacyScore: calculateLegacyScore(s),
    bio: ownerBio(s),
  };
}
