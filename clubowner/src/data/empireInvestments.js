// مركبات الاستثمار في «حياة الملياردير» 0.29 — محفظة شهرية بخمس مركبات:
// ودائع آمنة، عقارات إيجار ثابت، أسهم، ناشئة عالية المخاطر، وEmpire Coin المتقلبة.
// العوائد تحسم أول كل شهر بمعادلة حتمية على أرقام عشوائية بذرة الحفظة.
export const INVEST_VEHICLES = Object.freeze({
  deposit: {
    min: 100_000,
    risk: { ar: "آمن تمامًا", en: "Fully safe", fr: "Totalement sûr" },
    name: { ar: "ودائع آمنة", en: "Safe deposits", fr: "Dépôts sûrs" },
    desc: {
      ar: "عائد ٠٫٥٪ شهريًا بلا مفاجآت. المال ينام مرتاحًا.",
      en: "0.5% a month with no surprises. The money sleeps soundly.",
      fr: "0,5 % par mois sans surprise. L'argent dort tranquille.",
    },
  },
  rental: {
    min: 500_000,
    risk: { ar: "منخفض", en: "Low", fr: "Faible" },
    name: { ar: "عقارات للإيجار", en: "Rental real estate", fr: "Immobilier locatif" },
    desc: {
      ar: "إيجارات ثابتة: ٠٫٨٪ شهريًا من وحدات سكنية مؤجرة باسمك.",
      en: "Steady rents: 0.8% a month from residential units let in your name.",
      fr: "Loyers réguliers : 0,8 % par mois d'unités louées à votre nom.",
    },
  },
  stocks: {
    min: 250_000,
    risk: { ar: "متوسط", en: "Medium", fr: "Moyen" },
    name: { ar: "أسهم مدرجة", en: "Listed stocks", fr: "Actions cotées" },
    desc: {
      ar: "متوسط ١٫٢٪ شهريًا مع تقلب ±٣٪ حسب مزاج السوق.",
      en: "About 1.2% a month on average, ±3% depending on market mood.",
      fr: "Environ 1,2 % par mois en moyenne, ±3 % selon l'humeur du marché.",
    },
  },
  startup: {
    min: 1_000_000,
    risk: { ar: "عالٍ", en: "High", fr: "Élevé" },
    name: { ar: "شركات ناشئة", en: "Startups", fr: "Startups" },
    desc: {
      ar: "رهانات جريئة: أغلبها ربح جيد، وقليلها خسارة موجعة تصل ٣٠٪.",
      en: "Bold bets: most pay well, a few sting with losses up to 30%.",
      fr: "Paris audacieux : la plupart rapportent, quelques-uns piquent jusqu'à −30 %.",
    },
  },
  coin: {
    min: 100_000,
    risk: { ar: "جامح", en: "Wild", fr: "Sauvage" },
    name: { ar: "Empire Coin", en: "Empire Coin", fr: "Empire Coin" },
    desc: {
      ar: "عملة رقمية باسمك: شهر +٤٠٪ وشهر −٤٠٪. القلوب الضعيفة تبتعد.",
      en: "A crypto in your name: +40% one month, −40% the next. Faint hearts stay away.",
      fr: "Une crypto à votre nom : +40 % un mois, −40 % le suivant. Les cœurs sensibles s'abstiennent.",
    },
  },
});

export const VEHICLE_ORDER = ["deposit", "rental", "stocks", "startup", "coin"];
export default INVEST_VEHICLES;
