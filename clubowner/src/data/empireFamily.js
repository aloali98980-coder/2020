// بيانات عائلة «حياة الملياردير» 0.29 — العرائس والأفراح والمدارس والأسماء.
// كل عروس لها بونص خفيف مختلف؛ الفرح ثلاث درجات؛ المدارس والمصروف يشكلان
// إحصائيات الوريث (انضباط/موهبة/طموح 0-100) للمرحلة العاشرة.
export const BRIDES = Object.freeze({
  lawyer: {
    ring: 1_500_000,
    name: { ar: "لينا المحامية", en: "Lina the lawyer", fr: "Lina l'avocate" },
    desc: {
      ar: "عقل قانوني حاد؛ عقد زواج محكم يحميك عند أي طلاق.",
      en: "A sharp legal mind; an ironclad marriage contract protects you in any divorce.",
      fr: "Un esprit juridique affûté ; un contrat de mariage en béton vous protège en cas de divorce.",
    },
    bonus: {
      ar: "البونص: تسوية طلاق مخفضة (٤٠٪ بدل ٥٠٪) بفضل العقد المحكم.",
      en: "Bonus: reduced divorce settlement (40% instead of 50%) thanks to the ironclad contract.",
      fr: "Bonus : règlement de divorce réduit (40 % au lieu de 50 %) grâce au contrat en béton.",
    },
  },
  doctor: {
    ring: 1_200_000,
    name: { ar: "د. سلمى الطبيبة", en: "Dr. Salma", fr: "Dr Salma" },
    desc: {
      ar: "طبيبة أطفال سابقة؛ البيت أكثر هدوءًا والأولاد أسرع نموًا.",
      en: "A former pediatrician; a calmer home and faster-growing children.",
      fr: "Ancienne pédiatre ; un foyer plus calme et des enfants qui grandissent plus vite.",
    },
    bonus: {
      ar: "البونص: +١ سعادة زوجية شهريًا ونمو إحصائيات الأولاد أسرع ٢٥٪.",
      en: "Bonus: +1 marital happiness per month and children's stats grow 25% faster.",
      fr: "Bonus : +1 de bonheur conjugal par mois et des stats d'enfants 25 % plus rapides.",
    },
  },
  artist: {
    ring: 1_000_000,
    name: { ar: "نادية الفنانة", en: "Nadia the artist", fr: "Nadia l'artiste" },
    desc: {
      ar: "رسامة معروفة؛ كل ظهور معها يلمّع اسمك في الصالونات.",
      en: "A renowned painter; every appearance with her polishes your name in the salons.",
      fr: "Peintre renommée ; chaque apparition avec elle polit votre nom dans les salons.",
    },
    bonus: {
      ar: "البونص: +٥٠٪ برستيج من الأفراح والأصول الفنية.",
      en: "Bonus: +50% prestige from weddings and art assets.",
      fr: "Bonus : +50 % de prestige des mariages et actifs artistiques.",
    },
  },
  connected: {
    ring: 2_000_000,
    name: { ar: "فريدة بنت النافذين", en: "Farida of the well-connected", fr: "Farida des bien placés" },
    desc: {
      ar: "عائلة تفتح الأبواب المغلقة؛ الجمعية العمومية تحسب حسابها.",
      en: "A family that opens locked doors; the assembly reckons with them.",
      fr: "Une famille qui ouvre les portes closes ; l'assemblée compte avec elle.",
    },
    bonus: {
      ar: "البونص: +٥ ثقة من الجمعية عند الفرح وتهدئة شبهات شهرية.",
      en: "Bonus: +5 assembly confidence at the wedding and monthly suspicion soothing.",
      fr: "Bonus : +5 de confiance de l'assemblée au mariage et apaisement mensuel des soupçons.",
    },
  },
});

export const WEDDING_TIERS = Object.freeze({
  family: {
    cost: 1_000_000,
    fame: 2,
    prestige: 4,
    happy: 10,
    name: { ar: "فرح عائلي", en: "Family wedding", fr: "Mariage familial" },
    desc: {
      ar: "قائمة ضيوف قصيرة وزفة دافئة في حديقة الفيلا.",
      en: "A short guest list and a warm procession in the villa garden.",
      fr: "Une courte liste d'invités et une procession chaleureuse dans le jardin de la villa.",
    },
  },
  luxury: {
    cost: 8_000_000,
    fame: 6,
    prestige: 12,
    happy: 20,
    name: { ar: "فرح فاخر", en: "Luxury wedding", fr: "Mariage de luxe" },
    desc: {
      ar: "فندق خمس نجوم وأوركسترا وتغطية صحفية لائقة.",
      en: "A five-star hotel, an orchestra and decent press coverage.",
      fr: "Un hôtel cinq étoiles, un orchestre et une couverture presse convenable.",
    },
  },
  legendary: {
    cost: 30_000_000,
    fame: 12,
    prestige: 30,
    happy: 35,
    name: { ar: "فرح أسطوري", en: "Legendary wedding", fr: "Mariage légendaire" },
    desc: {
      ar: "ثلاث ليالٍ وقائمة ضيوف من قارتين وبث مباشر حول العالم.",
      en: "Three nights, a guest list from two continents and a live broadcast worldwide.",
      fr: "Trois nuits, des invités de deux continents et une diffusion mondiale en direct.",
    },
  },
});

export const SCHOOLS = Object.freeze({
  none: {
    cost: 0,
    minAge: 0,
    discipline: 0,
    talent: 0,
    ambition: 0,
    name: { ar: "بلا مدرسة", en: "No school", fr: "Sans école" },
  },
  public: {
    cost: 50_000,
    minAge: 4,
    discipline: 1,
    talent: 0.5,
    ambition: 0.5,
    name: { ar: "مدرسة محلية", en: "Local school", fr: "École locale" },
  },
  international: {
    cost: 250_000,
    minAge: 4,
    discipline: 1.5,
    talent: 1.5,
    ambition: 1,
    name: { ar: "مدرسة دولية", en: "International school", fr: "École internationale" },
  },
  elite: {
    cost: 700_000,
    minAge: 4,
    discipline: 2,
    talent: 2,
    ambition: 2,
    name: { ar: "أكاديمية النخبة", en: "Elite academy", fr: "Académie d'élite" },
  },
});

export const ALLOWANCES = Object.freeze({
  none: {
    cost: 0,
    ambition: -0.5,
    name: { ar: "بلا مصروف", en: "No allowance", fr: "Sans argent de poche" },
  },
  modest: {
    cost: 20_000,
    ambition: 0.5,
    name: { ar: "مصروف متواضع", en: "Modest allowance", fr: "Argent de poche modeste" },
  },
  generous: {
    cost: 80_000,
    ambition: 1.5,
    name: { ar: "مصروف كريم", en: "Generous allowance", fr: "Argent de poche généreux" },
  },
});

// أسماء الأولاد — تُختار حتميًا من بذرة الحفظة.
export const KID_NAMES = Object.freeze([
  { ar: "آدم", en: "Adam", fr: "Adam" },
  { ar: "ملك", en: "Malak", fr: "Malak" },
  { ar: "يوسف", en: "Youssef", fr: "Youssef" },
  { ar: "ليان", en: "Layan", fr: "Layan" },
  { ar: "عمر", en: "Omar", fr: "Omar" },
  { ar: "جنى", en: "Jana", fr: "Jana" },
]);

export const MAX_CHILDREN = 3;
// تسوية الطلاق: النصف افتراضيًا، والمحامية تخفضها بعقد محكم.
export const DIVORCE_BASE_SHARE = 0.5;
export const DIVORCE_LAWYER_SHARE = 0.4;
export const DIVORCE_LAWYERS_FEE = 1_000_000;

export default BRIDES;
