import { CITY_FACILITIES } from "../data/sportsCityFacilities.js";
import { CITY_EVENTS } from "../data/sportsCityEvents.js";
export const SPORTS_CITY_PHRASES = Object.fromEntries(
  [...CITY_FACILITIES, ...CITY_EVENTS].map((x) => [
    x.name.ar,
    [x.name.en, x.name.fr],
  ]),
);
Object.assign(SPORTS_CITY_PHRASES, {
  "حالة المدينة الرياضية غير سليمة": [
    "Invalid sports city state",
    "État de la cité sportive invalide",
  ],
  "حالة المدينة الرياضية غير سليمة.": [
    "Invalid sports city state.",
    "État de la cité sportive invalide.",
  ],
  "برامج القناة والجمهور": [
    "Channel & social programmes",
    "Émissions et réseaux sociaux",
  ],
  انتشار: ["Reach", "Portée"],
  "لا برامج بعد": ["No programmes yet", "Pas encore d’émissions"],
  "إقامة الفريق خارج ملعبه": [
    "Team away accommodation",
    "Hébergement de l’équipe à l’extérieur",
  ],
  الضواحي: ["Suburbs", "Banlieue"],
  "الواجهة البحرية": ["Waterfront", "Front de mer"],
  كلاسيكي: ["Classic", "Classique"],
  حديث: ["Modern", "Moderne"],
  أيقوني: ["Iconic", "Emblématique"],
  رياضية: ["Sport", "Sport"],
  تجارية: ["Commercial", "Commercial"],
  ترفيهية: ["Entertainment", "Loisirs"],
  مجتمعية: ["Community", "Communauté"],
  خاصة: ["Special", "Spécial"],
  "موقف المدينة": ["City parking", "Parking de la cité"],
  "خريطة المدينة الرياضية والملعب": [
    "Sports city and stadium map",
    "Plan de la cité sportive et du stade",
  ],
  "المدينة الرياضية والملعب": [
    "Sports city & stadium",
    "Cité sportive et stade",
  ],
  "حضور متوقع": ["Expected crowd", "Affluence prévue"],
  "الدخل / الصيانة الشهرية": [
    "Monthly income / maintenance",
    "Revenus / entretien mensuels",
  ],
  "قيد البناء حتى": ["Under construction until", "En construction jusqu’au"],
  السعة: ["Capacity", "Capacité"],
  الحي: ["District", "Quartier"],
  التصميم: ["Design", "Style"],
  "عرض السعر وبدء المشروع": ["Quote & start project", "Devis et lancement"],
  "السعر يتغير حسب المستوى والحي والتصميم؛ الترميم محدود وأرخص. التمويل من الثروة الشخصية":
    [
      "Price varies by tier, district and design; renovation is capped and cheaper. Personal wealth funds it.",
      "Le prix dépend du niveau, du quartier et du style ; la rénovation est limitée et moins chère. Fortune personnelle.",
    ],
  "مصير الملعب القديم": ["Old ground", "Ancien stade"],
  "هدم وبيع الأرض": ["Demolish & sell land", "Démolir et vendre"],
  للناشئين: ["For youth", "Pour les jeunes"],
  تأجيره: ["Lease out", "Louer"],
  "حقوق الاسم": ["Naming rights", "Droits de dénomination"],
  مزاد: ["Auction", "Enchères"],
  "اسم المالك + برستيج": [
    "Owner name + prestige",
    "Nom du propriétaire + prestige",
  ],
  "أخبار المدينة": ["City news", "Actualités de la cité"],
  "لا أخبار بعد": ["No news yet", "Pas encore d’actualités"],
  تأثير: ["Effect", "Effet"],
  ابنِ: ["Build", "Construire"],
  "ترميم (حتى 60 ألف": ["Renovate (up to 60k", "Rénover (jusqu'à 60 000"],
  "بناء جديد (2–3 مواسم": [
    "New build (2–3 seasons",
    "Nouveau stade (2–3 saisons",
  ],
});
