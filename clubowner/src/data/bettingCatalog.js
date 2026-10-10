// كتالوج شركات المراهنات 0.36 — إمبراطورية المراهنات (المرحلة 14).
// شركات قائمة للشراء + درجات ترخيص + مستويات فروع/تطبيق + منافسون.

export const LICENSE_TIERS = Object.freeze({
  local: Object.freeze({
    id: "local",
    fee: 2_500_000,
    setup: 2_000_000,
    days: 30,
    minReputation: 0,
    maxSuspicion: 70,
    upkeep: 180_000,
    marketMult: 1,
    name: { ar: "محلي", en: "Local", fr: "Locale" },
    desc: {
      ar: "ترخيص محلي يسمح بالعمل داخل السوق المصري فقط.",
      en: "Local licence for the Egyptian market only.",
      fr: "Licence locale pour le marché égyptien uniquement.",
    },
  }),
  continental: Object.freeze({
    id: "continental",
    fee: 7_000_000,
    setup: 8_000_000,
    days: 60,
    minReputation: 35,
    maxSuspicion: 50,
    upkeep: 420_000,
    marketMult: 1.9,
    name: { ar: "قاري", en: "Continental", fr: "Continentale" },
    desc: {
      ar: "ترخيص قاري يفتح أبواب أفريقيا والشرق الأوسط.",
      en: "Continental licence for Africa and the Middle East.",
      fr: "Licence continentale pour l'Afrique et le Moyen-Orient.",
    },
  }),
  global: Object.freeze({
    id: "global",
    fee: 18_000_000,
    setup: 20_000_000,
    days: 90,
    minReputation: 60,
    maxSuspicion: 30,
    upkeep: 900_000,
    marketMult: 3.2,
    name: { ar: "عالمي", en: "Global", fr: "Mondiale" },
    desc: {
      ar: "ترخيص عالمي — كل الأسواق، كل المخاطر.",
      en: "Global licence — every market, every risk.",
      fr: "Licence mondiale — tous les marchés, tous les risques.",
    },
  }),
});

export const LICENSE_ORDER = ["local", "continental", "global"];

export const BETTING_COMPANIES = Object.freeze([
  {
    id: "nilebet",
    size: "small",
    customers: 18_000,
    reputation: 32,
    branches: 1,
    onlineLevel: 1,
    price: 6_500_000,
    name: { ar: "نايل بت", en: "NileBet", fr: "NileBet" },
    desc: {
      ar: "شركة صغيرة على الكورنيش، سمعتها متواضعة لكنها رخيصة.",
      en: "A tiny shop on the Corniche, modest reputation but cheap.",
      fr: "Petite boutique sur la Corniche, réputation modeste mais bon marché.",
    },
  },
  {
    id: "hollywood-sport",
    size: "small",
    customers: 25_000,
    reputation: 45,
    branches: 1,
    onlineLevel: 2,
    price: 9_800_000,
    name: { ar: "هوليوود سبورت", en: "Hollywood Sport", fr: "Hollywood Sport" },
    desc: {
      ar: "واجهة براقة في المعادي، تطبيق متوسط.",
      en: "Glossy storefront in Maadi, decent app.",
      fr: "Vitrine brillante à Maadi, appli correcte.",
    },
  },
  {
    id: "desertbet",
    size: "medium",
    customers: 80_000,
    reputation: 58,
    branches: 3,
    onlineLevel: 2,
    price: 22_000_000,
    name: { ar: "بيت الصحراء", en: "DesertBet", fr: "DesertBet" },
    desc: {
      ar: "شبكة فروع في الدلتا والصعيد.",
      en: "Branch network across the Delta and Upper Egypt.",
      fr: "Réseau d'agences dans le Delta et Haute-Égypte.",
    },
  },
  {
    id: "atlasbet",
    size: "medium",
    customers: 110_000,
    reputation: 62,
    branches: 3,
    onlineLevel: 3,
    price: 28_500_000,
    name: { ar: "أطلس بت", en: "AtlasBet", fr: "AtlasBet" },
    desc: {
      ar: "مراهنات رياضية قارية، سمعة قوية.",
      en: "Continental sportsbook, strong reputation.",
      fr: "Bookmaker continental, solide réputation.",
    },
  },
  {
    id: "empire-wager",
    size: "large",
    customers: 210_000,
    reputation: 71,
    branches: 4,
    onlineLevel: 4,
    price: 45_000_000,
    name: { ar: "إمباير وجر", en: "Empire Wager", fr: "Empire Wager" },
    desc: {
      ar: "عملاق وطني، تطبيق رائج وفروع في كل مدينة.",
      en: "National giant, hot app and branches in every city.",
      fr: "Géant national, appli branchée et agences partout.",
    },
  },
  {
    id: "global-stake",
    size: "large",
    customers: 320_000,
    reputation: 78,
    branches: 5,
    onlineLevel: 5,
    price: 68_000_000,
    name: { ar: "غلوبال ستيك", en: "Global Stake", fr: "Global Stake" },
    desc: {
      ar: "إمبراطورية مراهنات دولية، ترخيص عالمي جاهز.",
      en: "International betting empire, global licence ready.",
      fr: "Empire international de paris, licence mondiale prête.",
    },
  },
  {
    id: "midtown-pro",
    size: "medium",
    customers: 95_000,
    reputation: 40,
    branches: 2,
    onlineLevel: 2,
    price: 18_000_000,
    name: { ar: "ميدتاون برو", en: "Midtown Pro", fr: "Midtown Pro" },
    desc: {
      ar: "قاعدة عملاء جيدة بسمعة مهتزة — صفقة للمغامر.",
      en: "Good customer base with shaky rep — a gambler's deal.",
      fr: "Bonne base de clients mais réputation fragile — affaire de flambeur.",
    },
  },
]);

export const BRANCH_LEVELS = Object.freeze([
  { level: 0, cost: 0, upkeep: 0, capBonus: 0, name: { ar: "بلا فروع", en: "No branches", fr: "Sans agences" } },
  { level: 1, cost: 1_000_000, upkeep: 80_000, capBonus: 12_000, name: { ar: "فرع صغير", en: "Small branch", fr: "Petite agence" } },
  { level: 2, cost: 2_500_000, upkeep: 180_000, capBonus: 30_000, name: { ar: "شبكة محلية", en: "Local network", fr: "Réseau local" } },
  { level: 3, cost: 5_000_000, upkeep: 350_000, capBonus: 60_000, name: { ar: "فروع جهوية", en: "Regional branches", fr: "Agences régionales" } },
  { level: 4, cost: 9_000_000, upkeep: 600_000, capBonus: 110_000, name: { ar: "سلسلة وطنية", en: "National chain", fr: "Chaîne nationale" } },
  { level: 5, cost: 15_000_000, upkeep: 1_000_000, capBonus: 190_000, name: { ar: "إمبراطورية فروع", en: "Branch empire", fr: "Empire d'agences" } },
]);

export const ONLINE_LEVELS = Object.freeze([
  { level: 0, cost: 0, upkeep: 0, growth: 0, name: { ar: "بلا تطبيق", en: "No app", fr: "Sans appli" } },
  { level: 1, cost: 1_500_000, upkeep: 50_000, growth: 0.012, name: { ar: "تطبيق بدائي", en: "Basic app", fr: "Appli basique" } },
  { level: 2, cost: 4_000_000, upkeep: 120_000, growth: 0.028, name: { ar: "تطبيق جيد", en: "Good app", fr: "Bonne appli" } },
  { level: 3, cost: 8_000_000, upkeep: 250_000, growth: 0.045, name: { ar: "منصة متكاملة", en: "Full platform", fr: "Plateforme complète" } },
  { level: 4, cost: 14_000_000, upkeep: 450_000, growth: 0.065, name: { ar: "تجربة ممتازة", en: "Premium UX", fr: "Expérience premium" } },
  { level: 5, cost: 22_000_000, upkeep: 750_000, growth: 0.09, name: { ar: "تطبيق عالمي", en: "World-class app", fr: "Appli mondiale" } },
]);

export const COMPETITOR_TEMPLATES = Object.freeze([
  { id: "c1", name: { ar: "التمساح للرهان", en: "CrocBet", fr: "CrocBet" }, aggression: 0.7 },
  { id: "c2", name: { ar: "فراعنة وجر", en: "Pharaoh Wager", fr: "Pharaon Wager" }, aggression: 0.5 },
  { id: "c3", name: { ar: "دلتا أوودز", en: "Delta Odds", fr: "Delta Odds" }, aggression: 0.9 },
  { id: "c4", name: { ar: "ستار بت إيجيبت", en: "StarBet Egypt", fr: "StarBet Égypte" }, aggression: 0.4 },
]);

export function companyById(id) {
  return BETTING_COMPANIES.find((c) => c.id === id) || null;
}
export function licenseById(id) {
  return LICENSE_TIERS[id] || null;
}
export function branchByLevel(l) {
  return BRANCH_LEVELS.find((b) => b.level === l) || null;
}
export function onlineByLevel(l) {
  return ONLINE_LEVELS.find((b) => b.level === l) || null;
}
