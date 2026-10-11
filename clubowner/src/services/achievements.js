// الدفعة 6 — القسم 1: الإنجازات. قياس من حالة اللعبة + فتح مرة واحدة + إشعار البريد.
import { ACHIEVEMENTS, ACHIEVEMENT_FAMILIES } from "../data/achievements.js";
import { message } from "./inbox.js";
import { notifyEnabled } from "./settingsHub.js";

export const ACHIEVEMENTS_SCHEMA = 1;

// يضمن وجود الحقل في الحفظات القديمة (دون لمس الإحصاءات الموجودة).
// القاعدة: خط الأساس يُؤخذ عند أول تعرّف على الحفظ، فلا يُفتح إنجاز بمجرد بدء اللعبة.
export function ensureAchievements(s) {
  if (!s.achievements || s.achievements.schema !== ACHIEVEMENTS_SCHEMA) {
    s.achievements = {
      schema: ACHIEVEMENTS_SCHEMA,
      unlocked: {},
      peaks: {},
      base: {
        cash: s.finance?.cash ?? 0,
        reputation: s.reputation ?? 0,
        fans: s.fanSupport ?? 0,
      },
    };
  }
  s.achievements.unlocked ||= {};
  s.achievements.peaks ||= {};
  return s.achievements;
}

const ownRow = (table, clubId) => (table || []).find((r) => r.clubId === clubId);

// كل مقياس يقرأ حقلًا موجودًا في الحفظ؛ الذروات تُحدَّث في refreshAchievements.
export const METRICS = Object.freeze({
  seasons: (s) => Math.max(0, (s.seasonNumber || 1) - 1),
  titles: (s) =>
    (s.seasonHistory || []).filter((h) => h.table?.[0]?.clubId === s.clubId).length,
  matches: (s) => {
    const past = (s.seasonHistory || []).reduce(
      (sum, h) => sum + (ownRow(h.table, s.clubId)?.played || 0),
      0,
    );
    return past + (ownRow(s.table, s.clubId)?.played || 0);
  },
  cash: (s) => Math.max(0, (s.achievements?.peaks.cash ?? 0) - (s.achievements?.base.cash ?? 0)),
  sponsors: (s) => s.achievements?.peaks.sponsors ?? 0,
  facilities: (s) => (s.facilities || []).reduce((sum, f) => sum + (f.level || 0), 0),
  legends: (s) => s.legends?.hall?.length ?? 0,
  hall: (s) => s.awards?.hall?.length ?? 0,
  reputation: (s) => Math.max(0, (s.achievements?.peaks.reputation ?? 0) - (s.achievements?.base.reputation ?? 0)),
  fans: (s) => Math.max(0, (s.achievements?.peaks.fans ?? 0) - (s.achievements?.base.fans ?? 0)),
});

// تحديث الذروات وفتح الإنجازات المستحقة؛ يعيد قائمة المفتوح الآن.
export function refreshAchievements(s) {
  const a = ensureAchievements(s);
  const peak = (key, value) => {
    a.peaks[key] = Math.max(a.peaks[key] ?? 0, Number.isFinite(value) ? value : 0);
  };
  peak("cash", s.finance?.cash ?? 0);
  peak("sponsors", (s.sponsors || []).filter((x) => x.status === "active").length);
  peak("reputation", s.reputation ?? 0);
  peak("fans", s.fanSupport ?? 0);

  const opened = [];
  for (const ach of ACHIEVEMENTS) {
    if (a.unlocked[ach.id]) continue;
    const value = METRICS[ach.family](s);
    if (value >= ach.target) {
      a.unlocked[ach.id] = { date: s.date };
      opened.push(ach.id);
      if (notifyEnabled(s, "achievements"))
      message(s, {
        title: "إنجاز مفتوح",
        body: "فتحت إنجازًا جديدًا. راجع صفحة الإنجازات لتفاصيله ومستوى التقدم في بقية الإنجازات.",
        category: "club",
        ref: ach.id,
      });
    }
  }
  return opened;
}

// تقدم إنجاز واحد كنسبة صحيحة 0–100.
export function achievementProgress(s, ach) {
  const value = METRICS[ach.family](s);
  return Math.min(100, Math.floor((Math.max(0, value) / ach.target) * 100));
}

// قائمة كاملة للشاشة: حالة كل إنجاز وتقدمه.
export function achievementList(s) {
  const a = ensureAchievements(s);
  return ACHIEVEMENTS.map((ach) => ({
    ...ach,
    family: ACHIEVEMENT_FAMILIES.find((f) => f.id === ach.family),
    unlocked: Boolean(a.unlocked[ach.id]),
    unlockedOn: a.unlocked[ach.id]?.date ?? null,
    progress: a.unlocked[ach.id] ? 100 : achievementProgress(s, ach),
    value: METRICS[ach.family](s),
  }));
}

// نبض يومي: يُستدعى من الزمن بعد الجوائز.
export const achievementsDay = (s) => refreshAchievements(s);
