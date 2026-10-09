// كتالوج أصول «حياة الملياردير» 0.29 — يُشترى من شاشة «القصر» بالثروة الشخصية 💎.
// كل أصل: سعر + صيانة شهرية + قيمة بيع (نسبة من السعر) + برستيج.
// العقارات السكنية تحمل `tier` يرسم شكل القصر البصري المتطور مع الثروة:
//   0 بلا سكن فاخر · 1 شقة · 2 فيلا · 3 قصر · 4 جزيرة خاصة.
export const EMPIRE_ASSETS = [
  // ── عربيات ────────────────────────────────────────────────────────────────
  {
    id: "car-sport",
    cat: "car",
    price: 4_000_000,
    upkeep: 40_000,
    sellPct: 0.85,
    prestige: 6,
    name: { ar: "سيارة رياضية", en: "Sports car", fr: "Voiture de sport" },
    desc: {
      ar: "كوبيه إيطالية تلمع تحت أضواء المدينة.",
      en: "An Italian coupe gleaming under the city lights.",
      fr: "Un coupé italien brillant sous les lumières de la ville.",
    },
  },
  {
    id: "car-hyper",
    cat: "car",
    price: 12_000_000,
    upkeep: 100_000,
    sellPct: 0.85,
    prestige: 14,
    name: { ar: "هايبركار محدودة", en: "Limited hypercar", fr: "Hypercar limitée" },
    desc: {
      ar: "واحدة من خمسين نسخة في العالم كله.",
      en: "One of fifty units in the entire world.",
      fr: "L'un des cinquante exemplaires au monde.",
    },
  },
  {
    id: "car-classic",
    cat: "car",
    price: 18_000_000,
    upkeep: 70_000,
    sellPct: 0.9,
    prestige: 18,
    name: { ar: "كلاسيكية ملكية", en: "Royal classic", fr: "Classique royale" },
    desc: {
      ar: "ليموزين عتيقة كانت ملكًا لأحد البيوت القديمة.",
      en: "A vintage limousine once owned by an old house.",
      fr: "Une limousine ancienne ayant appartenu à une vieille maison.",
    },
  },
  {
    id: "car-gold",
    cat: "car",
    price: 35_000_000,
    upkeep: 150_000,
    sellPct: 0.85,
    prestige: 30,
    name: { ar: "سيارة مطلية بالذهب", en: "Gold-plated car", fr: "Voiture plaquée or" },
    desc: {
      ar: "طلاء ذهب عيار ٢٤… لأن التواضع ليس في القاموس.",
      en: "24-karat gold paint… because humility is not in the dictionary.",
      fr: "Peinture à l'or 24 carats… car l'humilité n'est pas au programme.",
    },
  },
  // ── يخوت ──────────────────────────────────────────────────────────────────
  {
    id: "yacht-25",
    cat: "yacht",
    price: 40_000_000,
    upkeep: 600_000,
    sellPct: 0.8,
    prestige: 25,
    name: { ar: "يخت ٢٥ مترًا", en: "25m yacht", fr: "Yacht de 25 m" },
    desc: {
      ar: "بداية البحار: سطح شمس وغرفة سينما صغيرة.",
      en: "A start at sea: sun deck and a small cinema room.",
      fr: "Un début en mer : bain de soleil et petite salle de cinéma.",
    },
  },
  {
    id: "yacht-60",
    cat: "yacht",
    price: 120_000_000,
    upkeep: 1_600_000,
    sellPct: 0.8,
    prestige: 45,
    name: { ar: "يخت ٦٠ مترًا", en: "60m yacht", fr: "Yacht de 60 m" },
    desc: {
      ar: "طاقم دائم ومهبط طائرة صغير ومرآب جت سكي.",
      en: "Full crew, a small helipad and a jet-ski garage.",
      fr: "Équipage permanent, petit héliport et garage à jet-skis.",
    },
  },
  {
    id: "yacht-mega",
    cat: "yacht",
    price: 350_000_000,
    upkeep: 4_000_000,
    sellPct: 0.8,
    prestige: 80,
    name: { ar: "ميجا يخت ١٠٠ متر", en: "100m mega yacht", fr: "Méga-yacht de 100 m" },
    desc: {
      ar: "قصر عائم بحوض سباحة زجاجي وغواصة مرفقة.",
      en: "A floating palace with a glass pool and an attached submarine.",
      fr: "Un palais flottant avec piscine vitrée et sous-marin attenant.",
    },
  },
  // ── طيران خاص ─────────────────────────────────────────────────────────────
  {
    id: "jet-light",
    cat: "jet",
    price: 60_000_000,
    upkeep: 700_000,
    sellPct: 0.8,
    prestige: 20,
    name: { ar: "طيارة خاصة خفيفة", en: "Light private jet", fr: "Jet privé léger" },
    desc: {
      ar: "ثماني مقاعد جلدية ومدى يصل نصف العالم.",
      en: "Eight leather seats and a range covering half the globe.",
      fr: "Huit sièges de cuir et une portée couvrant la moitié du globe.",
    },
  },
  {
    id: "jet-long",
    cat: "jet",
    price: 180_000_000,
    upkeep: 1_800_000,
    sellPct: 0.8,
    prestige: 40,
    name: { ar: "طيارة رجال أعمال طويلة المدى", en: "Long-range business jet", fr: "Jet d'affaires long-courrier" },
    desc: {
      ar: "غرفة نوم ودش في السماء — لا هبوط اضطراري للرفاهية.",
      en: "A bedroom and a shower in the sky — comfort never makes an emergency landing.",
      fr: "Une chambre et une douche en plein ciel — le confort n'atterrit jamais d'urgence.",
    },
  },
  {
    id: "jet-vip",
    cat: "jet",
    price: 500_000_000,
    upkeep: 4_500_000,
    sellPct: 0.8,
    prestige: 70,
    name: { ar: "جامبو خاصة بقاعات استقبال", en: "VIP jumbo with reception halls", fr: "Jumbo VIP avec salons de réception" },
    desc: {
      ar: "طائرة عريضة بقاعة اجتماعات وقاعة طعام لثمانية عشر ضيفًا.",
      en: "A wide-body with a boardroom and a dining hall for eighteen guests.",
      fr: "Un gros porteur avec salle de réunion et salle à manger pour dix-huit convives.",
    },
  },
  // ── عقارات (سلسلة القصر) ──────────────────────────────────────────────────
  {
    id: "home-apartment",
    cat: "home",
    tier: 1,
    price: 8_000_000,
    upkeep: 60_000,
    sellPct: 0.9,
    prestige: 4,
    name: { ar: "شقة برج فاخر", en: "Luxury tower apartment", fr: "Appartement de tour de luxe" },
    desc: {
      ar: "دور كامل بإطلالة على النيل وأفق المدينة.",
      en: "A whole floor overlooking the Nile and the skyline.",
      fr: "Un étage entier surplombant le Nil et la skyline.",
    },
  },
  {
    id: "home-villa",
    cat: "home",
    tier: 2,
    price: 25_000_000,
    upkeep: 200_000,
    sellPct: 0.9,
    prestige: 12,
    name: { ar: "فيلا بحديقة وحمام سباحة", en: "Villa with garden & pool", fr: "Villa avec jardin et piscine" },
    desc: {
      ar: "خمسة آلاف متر وبوابة لا تفتح إلا لأهل البيت.",
      en: "Five thousand meters and a gate that opens only for the household.",
      fr: "Cinq mille mètres carrés et un portail qui ne s'ouvre qu'aux gens de la maison.",
    },
  },
  {
    id: "home-palace",
    cat: "home",
    tier: 3,
    price: 90_000_000,
    upkeep: 800_000,
    sellPct: 0.9,
    prestige: 35,
    name: { ar: "قصر تاريخي", en: "Historic palace", fr: "Palais historique" },
    desc: {
      ar: "قاعة مرايا وجناحان للضيوف وحدائق يعتني بها عشرون بستانيًا.",
      en: "A hall of mirrors, two guest wings and gardens tended by twenty gardeners.",
      fr: "Une galerie des glaces, deux ailes d'invités et des jardins entretenus par vingt jardiniers.",
    },
  },
  {
    id: "home-island",
    cat: "home",
    tier: 4,
    price: 600_000_000,
    upkeep: 3_500_000,
    sellPct: 0.9,
    prestige: 120,
    name: { ar: "جزيرة خاصة", en: "Private island", fr: "Île privée" },
    desc: {
      ar: "جزيرة استوائية بمهبط وميناء صغير… ومملكة كاملة من الهدوء.",
      en: "A tropical island with a runway and a small marina… a whole kingdom of quiet.",
      fr: "Une île tropicale avec piste et petite marina… tout un royaume de calme.",
    },
  },
  // ── تحف ───────────────────────────────────────────────────────────────────
  {
    id: "art-painting",
    cat: "art",
    price: 12_000_000,
    upkeep: 40_000,
    sellPct: 0.9,
    prestige: 8,
    name: { ar: "لوحة نادرة موقعة", en: "Rare signed painting", fr: "Tableau rare signé" },
    desc: {
      ar: "لوحة من مزاد عالمي تُعلَّق في صدر القاعة الكبرى.",
      en: "Auction-house masterpiece hanging at the head of the great hall.",
      fr: "Chef-d'œuvre de salle des ventes trônant au fond de la grande salle.",
    },
  },
  {
    id: "art-statue",
    cat: "art",
    price: 20_000_000,
    upkeep: 55_000,
    sellPct: 0.9,
    prestige: 10,
    name: { ar: "تمثال برونزي عتيق", en: "Antique bronze statue", fr: "Statue antique en bronze" },
    desc: {
      ar: "برونز عمره قرون يحرُس مدخل القصر.",
      en: "Centuries-old bronze guarding the palace entrance.",
      fr: "Un bronze plusieurs fois centenaire gardant l'entrée du palais.",
    },
  },
  {
    id: "art-collection",
    cat: "art",
    price: 55_000_000,
    upkeep: 150_000,
    sellPct: 0.9,
    prestige: 28,
    name: { ar: "مجموعة فنية كاملة", en: "Full art collection", fr: "Collection d'art complète" },
    desc: {
      ar: "أربعون عملًا عبر ثلاثة عصور، وجناح متحفي خاص بها.",
      en: "Forty works across three eras, with a private museum wing.",
      fr: "Quarante œuvres sur trois époques, avec une aile-musée privée.",
    },
  },
];

export const ASSET_CATEGORIES = Object.freeze([
  { id: "car", name: { ar: "عربيات", en: "Cars", fr: "Voitures" } },
  { id: "yacht", name: { ar: "يخوت", en: "Yachts", fr: "Yachts" } },
  { id: "jet", name: { ar: "طيران خاص", en: "Private aviation", fr: "Aviation privée" } },
  { id: "home", name: { ar: "عقارات", en: "Real estate", fr: "Immobilier" } },
  { id: "art", name: { ar: "تحف", en: "Art", fr: "Œuvres d'art" } },
]);

// مراحل القصر البصري: من بيت متواضع إلى جزيرة خاصة.
export const PALACE_TIERS = Object.freeze([
  {
    tier: 0,
    art: "🏚️",
    name: { ar: "بلا سكن فاخر", en: "No luxury home yet", fr: "Pas encore de demeure de luxe" },
  },
  {
    tier: 1,
    art: "🏢",
    name: { ar: "شقة في برج", en: "Tower apartment", fr: "Appartement de tour" },
  },
  {
    tier: 2,
    art: "🏡",
    name: { ar: "فيلا العيلة", en: "The family villa", fr: "La villa de famille" },
  },
  {
    tier: 3,
    art: "🏰",
    name: { ar: "القصر", en: "The palace", fr: "Le palais" },
  },
  {
    tier: 4,
    art: "🏝️🏰",
    name: { ar: "قصر الجزيرة الخاصة", en: "Private-island palace", fr: "Palais sur île privée" },
  },
]);

export const assetById = (id) => EMPIRE_ASSETS.find((a) => a.id === id);
export const assetsOfCat = (cat) =>
  EMPIRE_ASSETS.filter((a) => a.cat === cat).sort((a, b) => a.price - b.price);
export default EMPIRE_ASSETS;
