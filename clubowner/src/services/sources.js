// الدفعة 6 — القسم 8: المصادر. أعداد حية تُحسب الآن من البيانات نفسها.
// قاعدة: أي مصدر لا يمكن عدّه من الحفظ أو الكتالوج يُحذف من القائمة (لا تلفيق).
// تظهر حصرًا في الإعدادات.
import { CLUBS } from "../data/catalog.js";
import { CITY_FACILITIES } from "../data/sportsCityFacilities.js";
import { ACHIEVEMENTS } from "../data/achievements.js";

const isCount = (n) => Number.isInteger(n) && n >= 0;

// كل مصدر: معرّف + دالة عدّ. الدالة تعيد null إذا لم يتوفر ما يُعد.
export const SOURCE_DEFS = Object.freeze([
  { id: "clubs", label: { ar: "الأندية في الكتالوج", en: "Clubs in the catalogue", fr: "Clubs du catalogue" }, count: () => CLUBS.length },
  { id: "facilities", label: { ar: "منشآت المدينة", en: "City facilities", fr: "Installations de la ville" }, count: () => CITY_FACILITIES.length },
  { id: "achievements", label: { ar: "الإنجازات", en: "Achievements", fr: "Succès" }, count: () => ACHIEVEMENTS.length },
  { id: "leagues", label: { ar: "الدوريات في حفظك", en: "Leagues in your save", fr: "Championnats de votre sauvegarde" }, count: (s) => (Array.isArray(s?.leagues) ? s.leagues.length : null) },
  { id: "players", label: { ar: "اللاعبون في حفظك", en: "Players in your save", fr: "Joueurs de votre sauvegarde" }, count: (s) => (Array.isArray(s?.players) ? s.players.length : null) },
  { id: "seasons", label: { ar: "مواسم مؤرشفة", en: "Archived seasons", fr: "Saisons archivées" }, count: (s) => (Array.isArray(s?.seasonHistory) ? s.seasonHistory.length : null) },
  {
    id: "matchesPlayed",
    label: { ar: "مباريات مخوضة هذا الموسم", en: "Matches played this season", fr: "Matchs joués cette saison" },
    count: (s) => (Array.isArray(s?.fixtures) ? s.fixtures.filter((f) => f.played).length : null),
  },
  {
    id: "activeSponsors",
    label: { ar: "رعاة نشطون", en: "Active sponsors", fr: "Sponsors actifs" },
    count: (s) => (Array.isArray(s?.sponsors) ? s.sponsors.filter((x) => x.status === "active").length : null),
  },
  { id: "messages", label: { ar: "رسائل البريد", en: "Inbox messages", fr: "Messages de la boîte" }, count: (s) => (Array.isArray(s?.inbox) ? s.inbox.length : null) },
]);

// يعيد المصادر القابلة للعد فقط، مع عددها الحي.
export function liveSources(s) {
  return SOURCE_DEFS.map((d) => ({ id: d.id, label: d.label, count: d.count(s) }))
    .filter((x) => isCount(x.count));
}
