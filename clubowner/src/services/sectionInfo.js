// الدفعة 6 — القسم 7: بطاقات التعريف. كل بطاقة 5–6 سطور كحد أقصى، ولكل قسم زر «لا تظهر».
// الأرقام داخل النصوص تُقرأ من الثوابت الفعلية للوظيفة (لا أرقام مكتوبة يدويًا).
import { ABSENCE_MIN_DAYS } from "./absence.js";
import { IRREVERSIBLE_FEE, MAJOR_FEE } from "./protection.js";
import { ACHIEVEMENT_FAMILIES } from "../data/achievements.js";
import { ROUTE_INFO } from "./sectionInfoRoutes.js";

const fmt = (n) => new Intl.NumberFormat("en-US").format(n);
// (التعريفات بثلاث لغات صراحةً؛ المفتاح غير المعروف يُرفض بخطأ إنجليزي/عربي ثابت.)
const achievementCount = ACHIEVEMENT_FAMILIES.length * 4;

export const SECTION_INFO = Object.freeze({
  ...ROUTE_INFO,
  achievements: {
    ar: [
      `${achievementCount} إنجازًا عبر أربع مراتب: برونزي وفضي وذهبي وأسطوري.`,
      "كل إنجاز يُقاس من حالة حفظك نفسها، ويُفتح مرة واحدة فقط.",
      "أرقام التقدم أسفل كل مرتبة تُحسب من الحفظ، وليست مجرد نسب ثابتة.",
      "عند فتح إنجاز تصلك رسالة في البريد الوارد (يمكن إيقافها من الإعدادات).",
    ],
    en: [
      `${achievementCount} achievements across four tiers: bronze, silver, gold and legendary.`,
      "Each one is measured from your own save and unlocks only once.",
      "Progress under each tier is computed from the save, not a fixed percentage.",
      "Unlocking one sends an inbox message (you can turn it off in Settings).",
    ],
    fr: [
      `${achievementCount} succès en quatre niveaux : bronze, argent, or et légendaire.`,
      "Chacun est mesuré à partir de votre sauvegarde et ne se débloque qu'une fois.",
      "La progression sous chaque niveau est calculée depuis la sauvegarde.",
      "Un déblocage envoie un message dans la boîte de réception (désactivable dans les réglages).",
    ],
  },
  harvest: {
    ar: [
      "حصاد الموسم: البطل والمركز والأرقام والهداف والجوائز.",
      "كل رقم من جدول الموسم المؤرشف أو إحصاءات اللاعبين أو حفل الجوائز.",
      "تظهر الصفحة بعد أرشفة أول موسم.",
    ],
    en: [
      "Season harvest: champion, position, numbers, top scorer and awards.",
      "Every figure comes from the archived table, player stats or the awards ceremony.",
      "The page appears once the first season is archived.",
    ],
    fr: [
      "Bilan de saison : champion, place, chiffres, meilleur buteur et prix.",
      "Chaque chiffre provient du classement archivé, des statistiques ou de la cérémonie.",
      "La page apparaît à l'archivage de la première saison.",
    ],
  },
  legacy: {
    ar: [
      "سجل الأسطورة: بطولاتك وقراراتك الكبرى وقياساتك وسيرة المالك.",
      `القرارات الكبرى: صفقات بمقدم ${fmt(MAJOR_FEE)} فأكثر، من دفتر الخزينة.`,
      "نقاط الإرث تأتي من نظام الإرث القائم، ولا يُضاف لها أي نظام جديد.",
    ],
    en: [
      "Legend log: your titles, major decisions, records and owner biography.",
      `Major decisions: transfers with an upfront payment of ${fmt(MAJOR_FEE)} or more.`,
      "Legacy points come from the existing legacy system; nothing new is added.",
    ],
    fr: [
      "Journal de légende : vos titres, décisions majeures, records et biographie.",
      `Décisions majeures : transferts avec un versement initial d'au moins ${fmt(MAJOR_FEE)}.`,
      "Les points d'héritage viennent du système existant ; rien de nouveau n'est ajouté.",
    ],
  },
  settings: {
    ar: [
      "كل خيارات اللعبة في مكان واحد: الصوت والإشعارات والعرض والحفظ.",
      `الإشعارات تُحفظ مع الحفظ، وإيقافها لا يحذف شيئًا.`,
      `القرارات التي لا رجعة فيها (نجم أو ${fmt(IRREVERSIBLE_FEE)} فأكثر) تطلب تأكيدًا قبل التنفيذ.`,
      "وضع الإجازة يمنع القرارات الكبرى حتى عودتك.",
    ],
    en: [
      "All game options in one place: sound, notifications, display and saving.",
      "Notifications are saved with your save; turning one off deletes nothing.",
      `Irreversible decisions (a star or ${fmt(IRREVERSIBLE_FEE)} or more) need confirmation first.`,
      "Holiday mode blocks major decisions until you return.",
    ],
    fr: [
      "Toutes les options du jeu au même endroit : son, notifications, affichage, sauvegarde.",
      "Les notifications sont enregistrées avec la sauvegarde ; en désactiver une ne supprime rien.",
      `Les décisions irréversibles (une star ou ${fmt(IRREVERSIBLE_FEE)} ou plus) exigent une confirmation.`,
      "Le mode vacances bloque les décisions majeures jusqu'à votre retour.",
    ],
  },
  absence: {
    ar: [
      `يظهر «ماذا فاتك؟» بعد ${ABSENCE_MIN_DAYS} أيام من آخر اطلاع.`,
      "يلخص النتائج والكبرى والمعلّق من سجل الحفظ، ولا يخترع شيئًا.",
    ],
    en: [
      `“What did you miss?” appears after ${ABSENCE_MIN_DAYS} days since you last looked.`,
      "It summarises results, major items and pending decisions from your save; nothing is invented.",
    ],
    fr: [
      `« Ce que vous avez manqué » apparaît après ${ABSENCE_MIN_DAYS} jours depuis votre dernière visite.`,
      "Il résume résultats, événements majeurs et décisions en attente depuis la sauvegarde.",
    ],
  },
});

// المفاتيح المسموح بها وطول البطاقة.
export const INFO_SECTIONS = Object.freeze(Object.keys(SECTION_INFO));
export const MAX_INFO_LINES = 6;

export const sectionInfoHidden = (s, id) => Boolean(s?.preferences?.hiddenInfo?.[id]);

export function setSectionInfoHidden(s, id, hidden) {
  if (!INFO_SECTIONS.includes(id)) throw new Error("قسم غير معروف.");
  s.preferences ||= {};
  s.preferences.hiddenInfo ||= {};
  if (hidden) s.preferences.hiddenInfo[id] = true;
  else delete s.preferences.hiddenInfo[id];
  return !!s.preferences.hiddenInfo[id];
}

// إعادة كل البطاقات من الإعدادات.
export function showAllSectionInfo(s) {
  if (s.preferences) s.preferences.hiddenInfo = {};
}
