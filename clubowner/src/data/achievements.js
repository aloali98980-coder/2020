// الدفعة 6 — القسم 1: الإنجازات. 10 عائلات × 4 مراتب = 40 إنجازًا (برونزي/فضي/ذهبي/أسطوري).
// كل إنجاز يُقاس من حالة اللعبة نفسها (انظر services/achievements.js)، وقيم الهدف مرتبة تصاعديًا.
// «ceiling» = أعلى قيمة تحققها المحاكاة أو تصميم اللعبة (يفحصها tests/achievements.test.js).
export const ACHIEVEMENT_TIERS = Object.freeze(["bronze", "silver", "gold", "legendary"]);

export const TIER_NAME = Object.freeze({
  bronze: { ar: "برونزي", en: "Bronze", fr: "Bronze" },
  silver: { ar: "فضي", en: "Silver", fr: "Argent" },
  gold: { ar: "ذهبي", en: "Gold", fr: "Or" },
  legendary: { ar: "أسطوري", en: "Legendary", fr: "Légendaire" },
});

export const ACHIEVEMENT_FAMILIES = Object.freeze([
  {
    id: "seasons",
    name: { ar: "أعوام الإدارة", en: "Seasons in charge", fr: "Saisons à la tête du club" },
    info: { ar: "عدد المواسم المكتملة تحت إدارتك.", en: "Completed seasons under your management.", fr: "Saisons terminées sous votre direction." },
    targets: [1, 3, 5, 10],
    ceiling: 10,
  },
  {
    id: "titles",
    name: { ar: "الألقاب", en: "Titles", fr: "Titres" },
    info: { ar: "المواسم التي أنهاها النادي في المركز الأول.", en: "Seasons the club finished first.", fr: "Saisons terminées première." },
    targets: [1, 3, 5, 10],
    ceiling: 10,
  },
  {
    id: "matches",
    name: { ar: "المباريات", en: "Matches", fr: "Matchs" },
    info: { ar: "مجموع المباريات المخوضة في الدوري عبر كل المواسم.", en: "League matches played across all seasons.", fr: "Matchs de championnat joués sur toutes les saisons." },
    targets: [10, 50, 100, 300],
    ceiling: 300,
  },
  {
    id: "cash",
    name: { ar: "نمو الخزينة", en: "Treasury growth", fr: "Croissance de la trésorerie" },
    info: { ar: "مقدار ما نمت به الخزينة فوق رصيد البداية، بأعلى قيمة بلغتها.", en: "How far the treasury grew above its starting cash, at its peak.", fr: "Croissance maximale de la trésorerie au-dessus du solde de départ." },
    // نمو الخزينة فوق رصيد البداية (75M): أعلى رصيد في المحاكاة 178M ⇒ نمو 103M.
    targets: [10_000_000, 30_000_000, 60_000_000, 100_000_000],
    ceiling: 103_000_000,
  },
  {
    id: "sponsors",
    name: { ar: "الرعاة النشطون", en: "Active sponsors", fr: "Sponsors actifs" },
    info: { ar: "أكبر عدد رعاة نشطين في وقت واحد.", en: "Most sponsors active at the same time.", fr: "Nombre maximal de sponsors actifs simultanément." },
    targets: [2, 3, 4, 5],
    ceiling: 6,
  },
  {
    id: "facilities",
    name: { ar: "مجموع المنشآت", en: "Facility levels", fr: "Niveaux des installations" },
    info: { ar: "مجموع مستويات المنشآت الحالية.", en: "Sum of current facility levels.", fr: "Somme des niveaux actuels des installations." },
    // مجموع المستويات يبدأ عند 4؛ السقف التقريبي: 37 منشأة × 3 مستويات = 111 (تصميم).
    targets: [5, 12, 20, 30],
    ceiling: 111,
  },
  {
    id: "legends",
    name: { ar: "أساطير ضُمّت للنادي", en: "Legends joined", fr: "Légendes engagées" },
    info: { ar: "عدد الأساطير المتعاقدة مع النادي منذ البداية.", en: "Legends contracted with the club so far.", fr: "Légendes engagées avec le club jusqu'ici." },
    targets: [1, 2, 3, 5],
    ceiling: 5,
  },
  {
    id: "hall",
    name: { ar: "قاعة المشاهير", en: "Hall of fame", fr: "Panthéon" },
    info: { ar: "عدد المدخلين إلى قاعة المشاهير.", en: "Inductees in the hall of fame.", fr: "Intronisés au panthéon." },
    targets: [1, 2, 3, 5],
    ceiling: 10,
  },
  {
    id: "reputation",
    name: { ar: "ارتفاع السمعة", en: "Reputation rise", fr: "Hausse de réputation" },
    info: { ar: "مقدار ما ارتفعت به سمعة النادي فوق بداية الحفظ.", en: "How far the club's reputation rose above the starting save.", fr: "De combien la réputation du club a dépassé son niveau de départ." },
    // ارتفاع السمعة فوق بداية الحفظ (85): الحد النظري 100 − 85 = 15.
    targets: [3, 6, 10, 15],
    ceiling: 15,
  },
  {
    id: "fans",
    name: { ar: "دعم الجماهير", en: "Fan support", fr: "Soutien des supporters" },
    info: { ar: "مقدار ما ارتفع به الدعم الجماهيري فوق بداية الحفظ.", en: "How far fan support rose above the starting save.", fr: "De combien le soutien des supporters a dépassé son niveau de départ." },
    // ارتفاع الدعم فوق بداية الحفظ (78): الحد النظري 100 − 78 = 22.
    targets: [4, 8, 14, 20],
    ceiling: 22,
  },
]);

export const ACHIEVEMENTS = Object.freeze(
  ACHIEVEMENT_FAMILIES.flatMap((f) =>
    ACHIEVEMENT_TIERS.map((tier, i) =>
      Object.freeze({ id: `${f.id}-${tier}`, family: f.id, tier, target: f.targets[i] }),
    ),
  ),
);

// نصوص الواجهة الثابتة لهذه الشاشة (بثلاث لغات، تُعرض بحسب اللغة الحالية).
export const ACHIEVEMENT_UI = Object.freeze({
  title: { ar: "الإنجازات", en: "Achievements", fr: "Succès" },
  unlocked: { ar: "فتحت", en: "Unlocked", fr: "Débloqués" },
  open: { ar: "مفتوح", en: "Unlocked", fr: "Débloqué" },
  locked: { ar: "مقفل", en: "Locked", fr: "Verrouillé" },
  navLabel: { ar: "الإنجازات", en: "Achievements", fr: "Succès" },
});
