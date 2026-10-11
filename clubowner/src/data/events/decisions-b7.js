// الدفعة 7 — القسم 1: أحداث جديدة لسد فجوات الفئات (8 أحداث، الحد 15).
// كل حدث له بوابة when واضحة (لا يظهر في وقت غلط)، وخياران على الأقل بآثار مختلفة.
import {
  all,
  fixtureWithin,
  nextOwnFixture,
  fansAtLeast,
  fansBelow,
  repAtLeast,
  squadAtLeast,
  scopeNonEmpty,
} from "./conditions.js";

const inMonths = (months) => (s) => months.includes(Number(s.date.slice(5, 7)));

export const DECISIONS_B7 = [
  {
    id: "fan-anthem",
    group: "media",
    theme: "fans",
    topic: "أغنية جديدة للمدرجات",
    title: "أغنية الجماهير الجديدة",
    body: "مجموعة من المشجعين أعدّت أغنية جديدة للمدرجات وتطلب دعمك لتسجيلها. الأغنية قد ترفع الروح في الملعب، وقد تبقى مجرد فكرة.",
    when: fansAtLeast(60),
    choices: [
      { id: "sponsor", label: "تمويل التسجيل الرسمي", cash: -40000, fans: 3 },
      { id: "as-is", label: "قبول الأغنية كما هي", cash: 0, fans: 2, morale: 1 },
      { id: "skip", label: "عدم التدخل", cash: 0, fans: 0 },
    ],
  },
  {
    id: "away-trip-fans",
    group: "matchday",
    theme: "fans",
    topic: "رحلة مشجعين للمباراة الخارجية القادمة",
    title: "حافلة مشجعي المباراة الخارجية",
    body: "جمعية المشجعين تطلب تنظيم حافلة للمباراة الخارجية القادمة. التنظيم يكلّف مالًا، لكنه يملأ مدرجات الضيوف بوجوه النادي.",
    when: all(
      fixtureWithin(14),
      (s) => nextOwnFixture(s)?.away === s.clubId,
    ),
    choices: [
      { id: "bus", label: "تنظيم الحافلة", cash: -60000, fans: 2 },
      { id: "rely", label: "الاعتماد على المشجعين أنفسهم", cash: 0, fans: -1 },
    ],
  },
  {
    id: "veteran-mentoring",
    group: "squad",
    theme: "dressing",
    topic: "قدامى اللاعبين يرشدون الصغار",
    title: "مرشدون من القدامى",
    body: "لاعبون كبار في السن يعرضون مرافقة الصغار في تدريبات الأسبوع. الأمر يحتاج تنظيمًا بسيطًا وحوافز صغيرة.",
    when: scopeNonEmpty("veterans"),
    choices: [
      { id: "pair", label: "إقرار البرنامج بحوافز صغيرة", cash: -20000, morale: 3 },
      { id: "leave", label: "ترك الأمر للمدرب", cash: 0, morale: 0 },
    ],
  },
  {
    id: "dressing-room-music",
    group: "squad",
    theme: "dressing",
    topic: "موسيقى غرفة الملابس قبل المباريات",
    title: "قائمة تشغيل غرفة الملابس",
    body: "اللاعبون يطلبون سماعات وقائمة تشغيل خاصة قبل المباراة. الطلب بسيط، لكن الأثر على الروح المعنوية يُلاحظ.",
    when: squadAtLeast(20),
    choices: [
      { id: "buy", label: "شراء السماعات", cash: -15000, morale: 2 },
      { id: "no", label: "تأجيل الطلب", cash: 0, morale: 0 },
    ],
  },
  {
    id: "reporter-access",
    group: "media",
    theme: "press",
    topic: "طلب صحفي لزيارة التدريب",
    title: "صحفي يطلب زيارة التدريب",
    body: "مراسل رياضي يطلب زيارة مفتوحة لمركز التدريب. الزيارة تمنح القصة المطلوبة، لكنها تكشف أسلوب العمل أمام الجميع.",
    when: repAtLeast(45),
    choices: [
      { id: "open", label: "زيارة مفتوحة", cash: 0, reputation: 2, press: true },
      { id: "closed", label: "زيارة محدودة بمسؤول الإعلام", cash: 0, reputation: 1 },
      { id: "decline", label: "الاعتذار", cash: 0, reputation: -1 },
    ],
  },
  {
    id: "winter-break",
    group: "matchday",
    theme: "seasonal",
    topic: "فترة الشتاء ومعسكر اللياقة",
    title: "معسكر الشتاء",
    body: "الطقس بارد والإرهاق يتسلل إلى الفريق. الجهاز يقترح معسكرًا قصيرًا أو راحة منظمة لاستعادة الجاهزية.",
    when: inMonths([12, 1, 2]),
    choices: [
      { id: "camp", label: "معسكر قصير", cash: -50000, morale: 2, fitness: -1 },
      { id: "rest", label: "راحة منظمة", cash: 0, fitness: 3 },
    ],
  },
  {
    id: "summer-tour",
    group: "money",
    theme: "seasonal",
    topic: "جولة صيفية ودّية",
    title: "جولة الصيف الودية",
    body: "شركة تنظيم تعرض جولة ودية في الصيف مقابل أجر. الجولة تملأ الخزينة وتزيد الشعبية، لكنها تُنهك اللاعبين.",
    when: inMonths([6, 7]),
    choices: [
      { id: "tour", label: "قبول الجولة", cash: 60000, fans: 2, fitness: -2 },
      { id: "stay", label: "الحفاظ على الإعداد للموسم", cash: 0, fitness: 2 },
    ],
  },
  {
    id: "ultras-banner",
    group: "media",
    theme: "fans",
    topic: "لافتات الجماهير في المدرجات",
    title: "لافتات المدرجات",
    body: "لافتات انتقادية ظهرت في المدرجات. السماح بها يعني صراحة أكبر، ومنعها يعني توترًا مع المجموعات.",
    when: fansBelow(65),
    choices: [
      { id: "allow", label: "السماح بها", cash: 0, fans: 1, reputation: -1 },
      { id: "ban", label: "منعها داخل الملعب", cash: 0, fans: -2 },
    ],
  },
];
