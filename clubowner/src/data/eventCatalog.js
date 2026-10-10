// Consequences are explicit and deterministic at decision time; not random punishment.
//
// 0.25 «نظام الأحداث الموسّع»: الكتالوج صار طبقتين —
//   · EVENT_CATALOG  : أحداث قرارات (يتوقف الزمن حتى تحسمها) — ٧٠ حدثًا.
//   · FLAVOR_CATALOG : أخبار نكهة قصيرة (لا قرار، لا توقيف للوقت) — ١١٥ خبرًا.
// الأحداث الثمانية الأولى هي الكتالوج الأصلي نفسه بالمعرّفات والنصوص ذاتها،
// لأن الحفظات القديمة تحمل `clubDecisions[].type` و`lastClubEvent` بتلك المعرّفات.
// كل حدث يحمل `topic` فريدًا: لا حدثان بنفس الفكرة، والاختبار يتحقق آليًا.
// `when` بوابة عرض: إن كانت موجودة فلا يظهر الحدث إلا إذا تحققت في الحفظ،
// فلا يُستدعى لاعب غير موجود ولا بطولة لست مشاركًا فيها.
import {
  hasActiveSponsor,
  hasMarket,
  hasRoom,
  scopeNonEmpty,
} from "./events/conditions.js";
import { MONEY_DECISIONS } from "./events/decisions-money.js";
import { SQUAD_DECISIONS } from "./events/decisions-squad.js";
import { MARKET_DECISIONS } from "./events/decisions-market.js";
import { MEDIA_DECISIONS } from "./events/decisions-media.js";
import { MATCHDAY_DECISIONS } from "./events/decisions-matchday.js";
import { DRAMA_DECISIONS } from "./events/decisions-drama.js";
import { BLACK_DECISIONS } from "./events/decisions-black.js";
import { EMPIRE_DECISIONS } from "./events/decisions-empire.js";
import { FLAVOR_A } from "./events/flavor-training-fans-press.js";
import { FLAVOR_B } from "./events/flavor-weather-former-legends.js";
import { FLAVOR_C } from "./events/flavor-rivals-refereeing-market.js";
import { FLAVOR_DRAMA } from "./events/flavor-drama.js";
import { FLAVOR_BLACK } from "./events/flavor-black.js";
import { FLAVOR_EMPIRE } from "./events/flavor-empire.js";
import { BETTING_DECISIONS } from "./events/decisions-betting.js";

// ── الكتالوج الأصلي (0.18) — محفوظ كما هو لتوافق الحفظات ──────────────────
export const LEGACY_DECISIONS = [
  {
    id: "community",
    group: "media",
    topic: "يوم مفتوح للجماهير في مقر النادي",
    title: "يوم مفتوح للجماهير",
    body: "إدارة العلاقات تقترح يومًا مفتوحًا في النادي. ميزانية واضحة مقابل تحسين العلاقة مع الجمهور.",
    choices: [
      { id: "host", label: "تنظيم اليوم المفتوح", cash: -120000, fans: 4 },
      {
        id: "digital",
        label: "لقاء رقمي منخفض التكلفة",
        cash: -25000,
        fans: 1,
      },
      { id: "decline", label: "تأجيل النشاط", cash: 0, fans: 0 },
    ],
  },
  {
    id: "sponsor-activation",
    group: "money",
    topic: "حملة تجارية مشتركة مع راعٍ قائم",
    when: hasActiveSponsor,
    title: "حملة مشتركة مع الرعاة",
    body: "شريكك التجاري يقترح حملة محلية. المشاركة تحقق مبلغًا تعاقديًا لاحقًا، وليست ربحًا مضمونًا في كل حملات المستقبل.",
    choices: [
      {
        id: "join",
        label: "اعتماد الحملة",
        cash: -100000,
        incomeLater: 180000,
        fans: 2,
      },
      { id: "decline", label: "الاعتذار بدون غرامة", cash: 0, fans: 0 },
    ],
  },
  {
    id: "maintenance",
    group: "matchday",
    topic: "صيانة دورية لمنشآت النادي",
    title: "تقرير صيانة المنشآت",
    body: "الفحص الدوري كشف حاجة لصيانة إضافية. يمكنك المعالجة الكاملة أو إصلاحًا جزئيًا؛ التأجيل يخفض جاهزية الفريق في هذه الدورة.",
    choices: [
      { id: "full", label: "صيانة شاملة", cash: -180000, fitness: 3 },
      { id: "partial", label: "إصلاح أساسي", cash: -60000, fitness: 0 },
      { id: "delay", label: "تأجيل الصيانة", cash: 0, fitness: -5 },
    ],
  },
  {
    id: "fatigue",
    group: "squad",
    topic: "طلب طبي بتخفيف الحمل التدريبي",
    when: scopeNonEmpty("tired"),
    title: "الجهاز الطبي يطلب تخفيف الحمل",
    body: "عدد من اللاعبين يعانون إجهادًا تدريبيًا. القرار يوازن بين الاستشفاء والمعنويات والتكلفة.",
    choices: [
      { id: "rest", label: "راحة واستشفاء", cash: 0, fitness: 7, morale: 1 },
      {
        id: "recovery",
        label: "برنامج استشفاء متخصص",
        cash: -90000,
        fitness: 10,
        morale: 2,
      },
      {
        id: "continue",
        label: "استمرار البرنامج الحالي",
        cash: 0,
        fitness: -4,
        morale: -2,
      },
    ],
  },
  {
    id: "youth-trial",
    group: "market",
    topic: "تمويل تجربة لناشئ مولّد في عالم اللعبة",
    when: hasRoom,
    title: "فرصة تجربة موهبة شابة",
    body: "وصل طلب تجربة من لاعب ناشئ مولّد داخل عالم اللعبة. التجربة لا تضمن نجمًا، لكنها تمنحك فرصة تطويره.",
    choices: [
      {
        id: "trial",
        label: "تمويل التجربة وإضافة الناشئ",
        cash: -75000,
        youth: true,
      },
      { id: "decline", label: "الاكتفاء بالقائمة الحالية", cash: 0 },
    ],
  },
  {
    id: "ticket-pressure",
    group: "media",
    topic: "مبادرة جماهيرية لدعم الحضور",
    title: "الجمهور يطلب دعم الحضور",
    body: "ممثلون للمشجعين يقترحون تمويل مبادرة حضور. الأثر الموضح على ثقة الجمهور؛ سعر التذكرة نفسه لا يتغير دون قرارك.",
    choices: [
      { id: "support", label: "دعم المبادرة", cash: -70000, fans: 3 },
      { id: "explain", label: "شرح أولويات الميزانية", cash: 0, fans: 0 },
      { id: "ignore", label: "رفض المبادرة دون لقاء", cash: 0, fans: -3 },
    ],
  },
  {
    id: "dressing-room",
    group: "squad",
    topic: "نشاط جماعي لبناء التفاهم في غرفة الملابس",
    title: "اجتماع غرفة الملابس",
    body: "الجهاز يقترح يومًا لبناء التفاهم بين اللاعبين. الوعود المحددة في العقود تظل مستقلة، ولا تمحوها الأنشطة الجماعية.",
    choices: [
      { id: "camp", label: "معسكر يوم واحد", cash: -110000, morale: 5 },
      { id: "meeting", label: "اجتماع داخلي", cash: 0, morale: 2 },
      { id: "skip", label: "التركيز على التدريب فقط", cash: 0, morale: -1 },
    ],
  },
  {
    id: "scouting-budget",
    group: "market",
    topic: "تمويل تقرير موسّع عن مرشحي السوق",
    when: hasMarket,
    title: "توسيع ملف المرشحين",
    body: "المدير الرياضي يعرض مراجعة تقارير مرشحين من الأسواق المفعلة. التقرير يضيّق نطاق تقدير الإمكانات، ولا يكشف المستقبل يقينًا.",
    choices: [
      { id: "fund", label: "تمويل التقرير", cash: -50000, report: true },
      { id: "decline", label: "عدم تخصيص ميزانية الآن", cash: 0 },
    ],
  },
];

export const EVENT_CATALOG = [
  ...LEGACY_DECISIONS,
  ...MONEY_DECISIONS,
  ...SQUAD_DECISIONS,
  ...MARKET_DECISIONS,
  ...MEDIA_DECISIONS,
  ...MATCHDAY_DECISIONS,
  ...DRAMA_DECISIONS,
  ...BLACK_DECISIONS,
  ...EMPIRE_DECISIONS,
  ...BETTING_DECISIONS,
];

export const FLAVOR_CATALOG = [...FLAVOR_A, ...FLAVOR_B, ...FLAVOR_C, ...FLAVOR_DRAMA, ...FLAVOR_BLACK, ...FLAVOR_EMPIRE];

// فئات «تحديث الدراما» 0.25 الستّ التي طلبها صاحب المشروع. كل حدث قرار جديد أو مُوسَّم
// يحمل `theme` منها، والاختبار يتحقق أن لكل فئة ≥٣ أحداث بخيارات وعواقب مختلفة.
// `theme` بيانات وصفية فقط: المحرك والآلية (حدث واحد مفتوح + الفاصل الزمني) لم يتغيرا.
export const EVENT_THEMES = Object.freeze([
  "players",
  "dressing",
  "fans",
  "finance",
  "press",
  "seasonal",
]);

// فئات النكهة التسع المطلوبة، وعدد الأحداث في كل فئة (يختبره التوزيع في الاختبارات).
export const FLAVOR_CATEGORIES = Object.freeze([
  "training",
  "fans",
  "press",
  "weather",
  "former",
  "legends",
  "rivals",
  "refereeing",
  "market",
  "empire",
]);

// مفردات الأثر المسموحة على خيارات القرارات — أي مفتاح خارجها يفشل الاختبار.
export const DECISION_EFFECT_KEYS = Object.freeze([
  "cash",
  "incomeLater",
  "incomeDays",
  "incomeNote",
  "costLater",
  "costDays",
  "costNote",
  "fans",
  "morale",
  "fitness",
  "reputation",
  "wageBudget",
  "ticketPrice",
  "capacity",
  "youth",
  "report",
  "targets",
  "press",
  "note",
  "sponsorOffer",
  "signing",
  // مفردات «حياة الملياردير» 0.29: الثروة الشخصية والبرستيج والشهرة وسعادة الزوجة.
  "personal",
  "prestige",
  "fame",
  "wifeHappy",
]);

// مفردات الأثر المسموحة على أخبار النكهة — أثر صغير فقط.
export const FLAVOR_EFFECT_KEYS = Object.freeze([
  "cash",
  "fans",
  "morale",
  "fitness",
  "reputation",
  "targets",
  "personal",
]);

// حدود «صغر الأثر» للنكهة: المال ≤ ٢٥ ألفًا، والجماهير ±٢، والمعنويات ±٢.
export const FLAVOR_LIMITS = Object.freeze({
  cash: 25000,
  fans: 2,
  morale: 2,
  fitness: 2,
  reputation: 2,
  personal: 25000,
});

export const FLAVOR_PERSONAL_LIMIT = FLAVOR_LIMITS.personal;

export const DECISION_GROUPS = Object.freeze([
  "legacy",
  "money",
  "squad",
  "market",
  "media",
  "matchday",
  "empire",
  "betting",
]);

export const decisionById = (id) => EVENT_CATALOG.find((e) => e.id === id);
export const flavorById = (id) => FLAVOR_CATALOG.find((e) => e.id === id);
export const flavorByCategory = (category) =>
  FLAVOR_CATALOG.filter((e) => e.category === category);
