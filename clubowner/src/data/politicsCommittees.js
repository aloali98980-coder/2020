// Phase 13, group 3: fictional officials, sponsors, and federation competitions.
import { P } from "./politicsCatalog.js";

export const POLITICAL_OFFICIALS = Object.freeze([
  {
    id: "amira-hamdan",
    name: P("أميرة حمدان", "Amira Hamdan", "Amira Hamdan"),
    profile: P(
      "حَكمة دولية سابقة",
      "Former international referee",
      "Ancienne arbitre internationale",
    ),
    roles: ["referees", "discipline"],
    competence: 89,
    integrity: 94,
  },
  {
    id: "tariq-badr",
    name: P("طارق بدر", "Tariq Badr", "Tariq Badr"),
    profile: P(
      "خبير تحكيم هادئ",
      "Measured refereeing expert",
      "Expert en arbitrage mesuré",
    ),
    roles: ["referees"],
    competence: 83,
    integrity: 87,
  },
  {
    id: "salwa-kamal",
    name: P("سلوى كمال", "Salwa Kamal", "Salwa Kamal"),
    profile: P(
      "قاضية انضباط مستقلة",
      "Independent disciplinary judge",
      "Juge disciplinaire indépendante",
    ),
    roles: ["discipline"],
    competence: 92,
    integrity: 96,
  },
  {
    id: "youssef-rashad",
    name: P("يوسف رشاد", "Youssef Rashad", "Youssef Rashad"),
    profile: P(
      "منظم بطولات",
      "Competition organiser",
      "Organisateur de compétitions",
    ),
    roles: ["competitions"],
    competence: 86,
    integrity: 82,
  },
  {
    id: "lina-haddad",
    name: P("لينا حداد", "Lina Haddad", "Lina Haddad"),
    profile: P(
      "مديرة مسابقات عادلة",
      "Fair-competition director",
      "Directrice de compétitions équitables",
    ),
    roles: ["competitions", "discipline"],
    competence: 90,
    integrity: 91,
  },
  {
    id: "mahmoud-salem",
    name: P("محمود سالم", "Mahmoud Salem", "Mahmoud Salem"),
    profile: P("محكّم مخضرم", "Veteran adjudicator", "Arbitre chevronné"),
    roles: ["referees", "discipline", "competitions"],
    competence: 74,
    integrity: 67,
  },
]);

export const POLITICAL_SPONSORS = Object.freeze([
  {
    id: "nile-bank",
    name: P("بنك النيل", "Nile Bank", "Banque du Nil"),
    contribution: 30_000_000,
    style: "financial",
  },
  {
    id: "orbit-mobile",
    name: P("أوربت للاتصالات", "Orbit Mobile", "Orbit Mobile"),
    contribution: 24_000_000,
    style: "technology",
  },
  {
    id: "delta-energy",
    name: P("دلتا للطاقة", "Delta Energy", "Delta Énergie"),
    contribution: 20_000_000,
    style: "community",
  },
  {
    id: "crown-beverage",
    name: P("كراون للمشروبات", "Crown Beverages", "Boissons Crown"),
    contribution: 18_000_000,
    style: "sport",
  },
  {
    id: "atlas-travel",
    name: P("أطلس للسفر", "Atlas Travel", "Voyages Atlas"),
    contribution: 15_000_000,
    style: "travel",
  },
  {
    id: "community-radio",
    name: P("إذاعة المجتمع", "Community Radio", "Radio communautaire"),
    contribution: 3_000_000,
    style: "community",
  },
]);

export const POLITICAL_TOURNAMENTS = Object.freeze({
  "association-cup": {
    id: "association-cup",
    name: P("كأس الاتحاد", "Association Cup", "Coupe de la fédération"),
    description: P(
      "بطولة خروج مغلوب من ثمانية أندية، بقرعة مفتوحة وجائزة للبطل.",
      "An eight-club knockout cup with an open draw and a champion's prize.",
      "Une coupe à élimination directe réunissant huit clubs, avec tirage ouvert et prime au vainqueur.",
    ),
    format: "knockout",
    entryCount: 8,
    eligibleBlocs: ["big", "regional", "small"],
    setupCost: 2_000_000,
    prizePool: 12_000_000,
    schedule: "midseason",
  },
  "small-club-cup": {
    id: "small-club-cup",
    name: P(
      "كأس الأندية الصاعدة",
      "Rising Clubs Cup",
      "Coupe des clubs émergents",
    ),
    description: P(
      "كأس مصغر لأربعة أندية إقليمية وصغيرة بنظام خروج المغلوب.",
      "A four-club knockout cup for regional and smaller clubs.",
      "Une coupe à élimination directe pour quatre clubs régionaux et modestes.",
    ),
    format: "knockout",
    entryCount: 4,
    eligibleBlocs: ["regional", "small"],
    setupCost: 750_000,
    prizePool: 6_000_000,
    schedule: "midseason",
  },
  "presidents-league": {
    id: "presidents-league",
    name: P(
      "دوري الرابطة",
      "Clubs Association League",
      "Ligue de l’association des clubs",
    ),
    description: P(
      "دوري من أربع فرق بنظام الكل ضد الكل، يحسمه جدول نقاط معلن.",
      "A four-team round robin decided by a published points table.",
      "Une poule de quatre équipes, décidée par un classement de points publié.",
    ),
    format: "league",
    entryCount: 4,
    eligibleBlocs: ["big", "regional", "small"],
    setupCost: 1_000_000,
    prizePool: 8_000_000,
    schedule: "balanced",
  },
});

export const COMMITTEE_POLICIES = Object.freeze({
  referees: ["balanced", "strict", "lenient"],
  discipline: ["standard", "strict", "lenient"],
  competitions: ["standard", "rest-first", "commercial"],
});
