// Phase 13, group 4: fictional political choices around the real game's confederation labels.
import { P } from "./politicsCatalog.js";

export const FOREIGN_ORGANIZATIONS = Object.freeze({
  CAF: {
    id: "CAF",
    name: P(
      "الاتحاد الإفريقي",
      "African Confederation",
      "Confédération africaine",
    ),
    baseline: 52,
  },
  FIFA: {
    id: "FIFA",
    name: P(
      "المجلس الدولي",
      "World Football Council",
      "Conseil mondial du football",
    ),
    baseline: 46,
  },
  UEFA: {
    id: "UEFA",
    name: P(
      "الاتحاد الأوروبي",
      "European Confederation",
      "Confédération européenne",
    ),
    baseline: 42,
  },
  AFC: {
    id: "AFC",
    name: P(
      "الاتحاد الآسيوي",
      "Asian Confederation",
      "Confédération asiatique",
    ),
    baseline: 42,
  },
  CONCACAF: {
    id: "CONCACAF",
    name: P(
      "اتحاد أمريكا الشمالية والوسطى",
      "North and Central American Confederation",
      "Confédération d’Amérique du Nord et centrale",
    ),
    baseline: 40,
  },
});

export const HOSTING_EVENTS = Object.freeze({
  "continental-cup": {
    id: "continental-cup",
    name: P(
      "كأس الأبطال القاري",
      "Continental Champions Cup",
      "Coupe continentale des champions",
    ),
    description: P(
      "استضافة منافسة أندية قارية للفرق الأولى.",
      "Host a senior continental club competition.",
      "Accueillir une compétition continentale de clubs seniors.",
    ),
    organizationId: "CAF",
    bidCost: 5_000_000,
    award: 18_000_000,
    threshold: 66,
  },
  "youth-world-cup": {
    id: "youth-world-cup",
    name: P(
      "مهرجان العالم للشباب",
      "World Youth Festival",
      "Festival mondial des jeunes",
    ),
    description: P(
      "استضافة مهرجان دولي لتطوير الناشئين والتبادل التدريبي.",
      "Host an international youth development and coaching exchange.",
      "Accueillir un échange international de formation et de développement des jeunes.",
    ),
    organizationId: "FIFA",
    bidCost: 4_000_000,
    award: 14_000_000,
    threshold: 70,
  },
  "continental-forum": {
    id: "continental-forum",
    name: P(
      "منتدى تطوير الأندية",
      "Club Development Forum",
      "Forum de développement des clubs",
    ),
    description: P(
      "لقاء إداري إقليمي عن الحوكمة والبنية الأساسية.",
      "A regional governance and infrastructure forum for clubs.",
      "Une rencontre régionale sur la gouvernance et les infrastructures des clubs.",
    ),
    organizationId: "CAF",
    bidCost: 2_000_000,
    award: 7_000_000,
    threshold: 58,
  },
});

export const INTEGRITY_SUBJECTS = Object.freeze({
  finance: P("المنح والخزينة", "Grants and treasury", "Aides et trésorerie"),
  discipline: P(
    "قرارات الانضباط",
    "Disciplinary rulings",
    "Décisions disciplinaires",
  ),
  competitions: P(
    "القرعة والمسابقات",
    "Draws and competitions",
    "Tirages et compétitions",
  ),
  election: P("تمويل الحملة", "Campaign financing", "Financement de campagne"),
});

export const LEGACY_TITLES = Object.freeze({
  statesperson: P(
    "رجل دولة نزيه",
    "Trusted statesperson",
    "Homme d’État de confiance",
  ),
  reformer: P(
    "مصلح مؤسسي",
    "Institutional reformer",
    "Réformateur institutionnel",
  ),
  "public-servant": P("خادم عام", "Public servant", "Serviteur public"),
  contested: P("إرث محل جدل", "Contested legacy", "Héritage controversé"),
  disgraced: P("إرث متضرر", "Disgraced legacy", "Héritage terni"),
});

export const OPPOSITION_RESPONSES = Object.freeze({
  "public-records": P(
    "نشر السجل المالي",
    "Publish the financial register",
    "Publier le registre financier",
  ),
  hearing: P(
    "جلسة استماع علنية",
    "Hold a public hearing",
    "Tenir une audience publique",
  ),
  attack: P(
    "مهاجمة المعارضين",
    "Attack the opposition",
    "Attaquer l’opposition",
  ),
});
