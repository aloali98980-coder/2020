// الفروع 0.47 — كتالوج معلن: ميزة واحدة لكل دولة من أسواق العالم الخمسين،
// وتكاليف ومدد الفتح والترقية (المستويات 1–3). كل الأرقام سيناريو لعب معلن.
// الميزات إضافة بحتة: لا خير ولا شر — كل ميزة تفتح عائدًا ولا تغلق شيئًا.
import { MARKETS } from "./worldMarkets.js";

export const BRANCH_LEVELS = 3;
export const BRANCH_CAP = 6; // سقف الفروع في آن واحد
export const OPEN_DAYS = 30;
export const UPGRADE_DAYS = { 2: 45, 3: 60 };
export const UPGRADE_COST_FACTOR = { 2: 1.6, 3: 2.6 };
export const LEVEL_INCOME = { 1: 1, 2: 1.9, 3: 3 };

// عائد الفتح الشهري الأساسي قبل الميزة والكفاءة: قاعدة + وزن مستوى السوق.
export const baseOpenCost = (market) => 8_000_000 + market.level * 550_000;
export const baseMonthIncome = (market, level) =>
  Math.round((900_000 + market.level * 12_000) * (LEVEL_INCOME[level] || 1));

// كفاءة الفرع: 0.6 بلا مدير، ويرتفع بمهارة مدير الكفاءة حتى ~0.95.
export const efficiencyOf = (manager) => 0.6 + (manager ? Math.min(88, manager.skill) / 250 : 0);

// ميزة الدولة — واحدة لكل سوق، ثابتة ومعلنة (لا عشوائية ولا محاذاة خير/شر).
export const COUNTRY_EDGE = Object.freeze({
  youth: ["eg", "br", "ar", "fr", "co", "uy", "hr", "rs", "tn", "dz", "mx", "tr", "ma"],
  income: ["en", "sa", "us", "cn", "jp", "ae", "qa", "de", "it", "au", "kr", "ru"],
  fame: ["es", "pt", "nl", "be", "gr", "sc", "at", "ch", "dk", "se", "no", "pl", "cz"],
  scout: ["ua", "ro", "hu", "cl", "ec", "py", "pe", "bo", "ve", "za", "in", "th"],
});

export const EDGE_BY_COUNTRY = Object.fromEntries(
  Object.entries(COUNTRY_EDGE).flatMap(([edge, ids]) => ids.map((id) => [id, edge])),
);

export const EDGE_NAMES = Object.freeze({
  youth: {
    ar: "ميزة الناشئون",
    en: "Youth edge",
    fr: "Atout jeunes",
  },
  income: {
    ar: "ميزة الدخل",
    en: "Income edge",
    fr: "Atout revenus",
  },
  fame: {
    ar: "ميزة الشهرة",
    en: "Fame edge",
    fr: "Atout renommée",
  },
  scout: {
    ar: "ميزة الكشافة",
    en: "Scouting edge",
    fr: "Atout recrutement",
  },
});

export const EDGE_DESCS = Object.freeze({
  youth: {
    ar: "مدرسة الفرع تولد ناشئين من هذا البلد يمكن ضمهم أو بيعهم أو إطلاقهم.",
    en: "The branch school raises local prospects you can sign, sell or release.",
    fr: "L'école de la branche forme des jeunes que vous pouvez recruter, vendre ou libérer.",
  },
  income: {
    ar: "دخل الفرع الشهري أعلى بنسبة 35% في الأسواق التجارية.",
    en: "Monthly branch income is 35% higher in commercial markets.",
    fr: "Le revenu mensuel de la branche est 35 % plus élevé sur les marchés commerciaux.",
  },
  fame: {
    ar: "شهرة المالك تنمو شهريًا ببلاد كرة القدم التاريخية.",
    en: "Owner fame grows monthly in historic football countries.",
    fr: "La renommée du propriétaire grandit chaque mois dans les pays de football historique.",
  },
  scout: {
    ar: "مهام الكشف في هذا البلد أرخص بنسبة 25% من المستوى الثاني، وتقارير فرع شهرية.",
    en: "Scouting missions here cost 25% less from level 2, with monthly branch reports.",
    fr: "Les missions de recrutement ici coûtent 25 % moins cher dès le niveau 2, avec des rapports mensuels.",
  },
});

// قرارات الفروع — إضافة بحتة: كل خيار يمنح تعزيزًا مؤقتًا، والتجاهل ينتهي بصمت.
export const BRANCH_DECISIONS = [
  {
    id: "school",
    costLevel: 2_000_000, // × مستوى الفرع
    days: 90,
    boost: "schoolUntil",
    name: { ar: "افتتاح مدرسة فرعية", en: "Open a branch school", fr: "Ouvrir une école de branche" },
    note: {
      ar: "يضاعف فرصة الناشئين من هذا البلد لثلاثة أشهر.",
      en: "Doubles the prospect chance from this country for three months.",
      fr: "Double la chance de jeunes de ce pays pendant trois mois.",
    },
  },
  {
    id: "marketing",
    costLevel: 1_500_000,
    days: 60,
    boost: "marketingUntil",
    name: { ar: "حملة تسويق محلية", en: "Local marketing campaign", fr: "Campagne marketing locale" },
    note: {
      ar: "يرفع دخل الفرع 25% لشهرين.",
      en: "Raises branch income by 25% for two months.",
      fr: "Augmente le revenu de la branche de 25 % pendant deux mois.",
    },
  },
  {
    id: "localscout",
    costLevel: 1_000_000,
    days: 90,
    boost: "scoutUntil",
    name: { ar: "تعاقد كشاف محلي", en: "Hire a local scout", fr: "Recruter un recruteur local" },
    note: {
      ar: "يرفع كفاءة الفرع مؤقتًا لثلاثة أشهر.",
      en: "Temporarily raises branch efficiency for three months.",
      fr: "Augmente temporairement l'efficacité de la branche pendant trois mois.",
    },
  },
];

export const MANAGER_WAGE = { min: 150_000, max: 400_000 };
export const CANDIDATE_SIGNING_COST = 300_000;

export const branchMarket = (id) => MARKETS.find((m) => m.id === id) || null;
export const countryEdge = (id) => EDGE_BY_COUNTRY[id] || "fame";
