// منافسو «حياة الملياردير» 0.29 — مليارديرات خياليون بثروات تنمو شهريًا،
// وقائمة ترتيب متحركة، وسباق شهري على أفخم المقتنيات بمكافآت برستيج وشهرة.
export const RIVAL_POOL = Object.freeze([
  {
    nameAr: "البارون نور الدين",
    nameEn: "Baron Nour El-Din",
    nameFr: "Le baron Nour El-Din",
    persona: { ar: "وريث شحن بحري قديم", en: "Old shipping heir", fr: "Vieux héritier du fret maritime" },
  },
  {
    nameAr: "صفيناز فولاذ",
    nameEn: "Safinaz Folath",
    nameFr: "Safinaz Folath",
    persona: { ar: "ملكة الصلب والعقارات", en: "Queen of steel & real estate", fr: "Reine de l'acier et de l'immobilier" },
  },
  {
    nameAr: "فريد أمير الصفقات",
    nameEn: "Farid, Prince of Deals",
    nameFr: "Farid, prince des affaires",
    persona: { ar: "مضارب لا ينام", en: "A speculator who never sleeps", fr: "Un spéculateur qui ne dort jamais" },
  },
  {
    nameAr: "اللورد كسرى",
    nameEn: "Lord Kosrow",
    nameFr: "Lord Kosrow",
    persona: { ar: "جامع تحف ومقتنيات نادرة", en: "Collector of rare art", fr: "Collectionneur d'art rare" },
  },
  {
    nameAr: "الدوقة مرجانة",
    nameEn: "Duchess Margana",
    nameFr: "La duchesse Margana",
    persona: { ar: "إمبراطورية فنادق عابرة للقارات", en: "A transcontinental hotel empire", fr: "Un empire hôtelier transcontinental" },
  },
  {
    nameAr: "سلطان الذهب",
    nameEn: "The Gold Sultan",
    nameFr: "Le sultan de l'or",
    persona: { ar: "مناجم ومجوهرات ومفاجآت", en: "Mines, jewels and surprises", fr: "Mines, bijoux et surprises" },
  },
  {
    nameAr: "قيس الصاروخ",
    nameEn: "Qais the Rocket",
    nameFr: "Qais la Fusée",
    persona: { ar: "ثروة تقنية صاعدة بجنون", en: "A rocketing tech fortune", fr: "Une fortune tech en pleine ascension" },
  },
]);

// معاملات نقاط السباق: نقطة المنافس = ثروته × المعامل (حتمية).
export const RACE_TYPES = Object.freeze([
  {
    id: "yacht",
    factor: 0.15,
    name: { ar: "اليخت الأكبر", en: "The biggest yacht", fr: "Le plus grand yacht" },
  },
  {
    id: "car",
    factor: 0.06,
    name: { ar: "أفخم سيارة", en: "The finest car", fr: "La plus belle voiture" },
  },
  {
    id: "jet",
    factor: 0.12,
    name: { ar: "أضخم طائرة خاصة", en: "The grandest private jet", fr: "Le plus grand jet privé" },
  },
  {
    id: "home",
    factor: 0.2,
    name: { ar: "أفخم سكن", en: "The grandest home", fr: "La plus belle demeure" },
  },
  {
    id: "wedding",
    factor: 0.08,
    name: { ar: "أغلى فرح", en: "The most expensive wedding", fr: "Le mariage le plus cher" },
  },
  {
    id: "charity",
    factor: 0.04,
    name: { ar: "أكبر عطاء خيري", en: "The biggest charity gift", fr: "Le plus grand don caritatif" },
  },
]);

// نطاق ثروات المنافسين الافتتاحية (جنيه).
export const RIVAL_WEALTH_MIN = 30_000_000;
export const RIVAL_WEALTH_MAX = 900_000_000;
export default RIVAL_POOL;
