// الهدايا 0.46 — كتالوج معلن واحد: الألقاب، هدايا القيمة، حدود المنح، وخط الغرباء.
// كل الأرقام سيناريو لعب معلن وليست واقعية. العطاء يُكافأ، ومن لا يُهدي لا يُعاقب أبدًا.

// ألقاب اللاعبين (لقب فريد لا يُنقل بعد منحه — سحب لقب ليس خيارًا أصلًا).
export const PLAYER_TITLES = [
  {
    id: "captain",
    name: { ar: "قائد الفريق", en: "Team captain", fr: "Capitaine de l'équipe" },
    desc: {
      ar: "شارة القيادة رسميًا — صوت الغرفة الأول.",
      en: "The official armband — first voice of the dressing room.",
      fr: "Le brassard officiel — première voix du vestiaire.",
    },
    morale: 8,
    loyalty: 10,
  },
  {
    id: "roomLeader",
    name: { ar: "قائد الغرفة", en: "Dressing-room leader", fr: "Leader du vestiaire" },
    desc: {
      ar: "مرجع اللاعبين في الخلافات قبل أن تصل إليك.",
      en: "The players' go-between before issues reach you.",
      fr: "L'intermédiaire des joueurs avant que les sujets ne vous arrivent.",
    },
    morale: 6,
    loyalty: 8,
  },
  {
    id: "clubStar",
    name: { ar: "نجم النادي", en: "Club star", fr: "Star du club" },
    desc: {
      ar: "وجه الحملات والملصقات الرسمية.",
      en: "The face of campaigns and official posters.",
      fr: "Le visage des campagnes et des affiches officielles.",
    },
    morale: 7,
    loyalty: 6,
  },
  {
    id: "ambassador",
    name: { ar: "سفير النادي", en: "Club ambassador", fr: "Ambassadeur du club" },
    desc: {
      ar: "يمثل النادي في الفعاليات خارج الملعب.",
      en: "Represents the club at off-pitch events.",
      fr: "Représente le club lors des événements hors du terrain.",
    },
    morale: 5,
    loyalty: 7,
  },
];

// هدايا القيمة — تُدفع من الثروة الشخصية، وأثرها يضاعف في عيد الميلاد.
export const VALUE_GIFTS = [
  {
    id: "watch",
    cost: 400_000,
    morale: 5,
    loyalty: 3,
    name: { ar: "ساعة فاخرة", en: "Luxury watch", fr: "Montre de luxe" },
  },
  {
    id: "trip",
    cost: 600_000,
    morale: 6,
    loyalty: 4,
    name: { ar: "رحلة عائلية", en: "Family trip", fr: "Voyage en famille" },
  },
  {
    id: "ring",
    cost: 1_200_000,
    morale: 7,
    loyalty: 5,
    name: { ar: "خاتم ذهبي", en: "Gold ring", fr: "Bague en or" },
  },
  {
    id: "car",
    cost: 4_000_000,
    morale: 10,
    loyalty: 6,
    name: { ar: "سيارة", en: "A car", fr: "Une voiture" },
  },
  {
    id: "villa",
    cost: 9_000_000,
    morale: 12,
    loyalty: 8,
    name: { ar: "وحدة سكنية", en: "A home", fr: "Un logement" },
  },
];

// حدود المنح النقدية (من خزينة النادي) — بالجنيه.
export const GRANT_LIMITS = Object.freeze({
  personalMin: 250_000,
  personalMax: 10_000_000,
  personalMorale: 6,
  personalLoyalty: 4,
  personalCooldownDays: 30,
  squadMin: 1_000_000,
  squadMax: 30_000_000,
  squadMorale: 4,
  squadLoyalty: 2,
  squadFans: 1,
  squadCooldownDays: 60,
});

// هدية مالية لاعب (من الثروة الشخصية).
export const CASH_GIFT = Object.freeze({
  min: 100_000,
  max: 5_000_000,
  cooldownDays: 21,
  birthdayFactor: 1.5,
});

// خط الغرباء 🔥 — هدية لصحفي أو مسؤول قاري. تُدفع من الثروة الشخصية
// وترفع مؤشر الشبهات في الملفات السوداء؛ حجم الأثر والخطر معلنان قبل الدفع.
export const STRANGER_KINDS = Object.freeze({
  journalist: {
    id: "journalist",
    amounts: [1_000_000, 2_500_000, 5_000_000],
    cooldownDays: 45,
    trustPerMillion: 2, // حد أقصى +10
    trustCap: 10,
    suspicionPerMillion: 1.2,
  },
  official: {
    id: "official",
    amounts: [1_000_000, 2_500_000, 5_000_000],
    cooldownDays: 45,
    relationsPerMillion: 1, // حد أقصى +5
    relationsCap: 5,
    suspicionPerMillion: 1.5,
  },
});

export const CONFEDERATIONS = Object.freeze([
  "CAF",
  "FIFA",
  "UEFA",
  "AFC",
  "CONCACAF",
]);

export const playerTitle = (id) => PLAYER_TITLES.find((t) => t.id === id) || null;
export const valueGift = (id) => VALUE_GIFTS.find((g) => g.id === id) || null;
