// نكهة الديربي 0.27 — تمييز مباريات الغريم التقليدي والديربيات المحلية
// يحصل الديربي على: حضور أعلى، تذاكر مضاعفة، رسائل صحافة قبل وبعد، توتر بالبطاقات، واحتفال فوز مميز.
import { extendedClub } from "../data/expandedCatalog.js";
import { tr } from "../i18n/index.js";

// قائمة المواجهات التاريخية الكبرى (معرفات وأسماء ويكي)
export const CLASSIC_RIVALRIES = [
  // مصر
  {
    pair: ["ahly", "zamalek"],
    wikis: ["Al Ahly SC", "Zamalek SC"],
    nameAr: "ديربي القاهرة (القمة)",
    nameEn: "Cairo Derby (El Clásico)",
    nameFr: "Derby du Caire (Le Clásico)",
  },
  {
    pair: ["ahly", "pyramids"],
    wikis: ["Al Ahly SC", "Pyramids FC"],
    nameAr: "صراع القمة الحديث",
    nameEn: "Modern Summit Clash",
    nameFr: "Choc au Sommet Moderne",
  },
  {
    pair: ["masry", "ismaily"],
    wikis: ["Al Masry SC", "Ismaily SC"],
    nameAr: "ديربي القناة",
    nameEn: "Canal Derby",
    nameFr: "Derby du Canal",
  },
  {
    pair: ["zamalek", "ismaily"],
    wikis: ["Zamalek SC", "Ismaily SC"],
    nameAr: "كلاسيكو أولاد العم",
    nameEn: "Cousins Clásico",
    nameFr: "Clásico des Cousins",
  },
  {
    pair: ["ahly", "masry"],
    wikis: ["Al Ahly SC", "Al Masry SC"],
    nameAr: "كلاسيكو الأهلي والمصري",
    nameEn: "Ahly vs Masry Classic",
    nameFr: "Classique Ahly-Masry",
  },
  {
    pair: ["ahly", "ittihad"],
    wikis: ["Al Ahly SC", "Al Ittihad Alexandria Club", "Al Ittihad Alexandria SC"],
    nameAr: "كلاسيكو القاهرة والإسكندرية",
    nameEn: "Cairo-Alexandria Classic",
    nameFr: "Classique Le Caire-Alexandrie",
  },
  // إنجلترا
  {
    pair: ["city", "man_utd"],
    wikis: ["Manchester City F.C.", "Manchester United F.C."],
    nameAr: "ديربي مانشستر",
    nameEn: "Manchester Derby",
    nameFr: "Derby de Manchester",
  },
  {
    pair: ["liverpool", "everton"],
    wikis: ["Liverpool F.C.", "Everton F.C."],
    nameAr: "ديربي الميرسيسايد",
    nameEn: "Merseyside Derby",
    nameFr: "Derby de la Mersey",
  },
  {
    pair: ["arsenal", "tottenham"],
    wikis: ["Arsenal F.C.", "Tottenham Hotspur F.C."],
    nameAr: "ديربي شمال لندن",
    nameEn: "North London Derby",
    nameFr: "Derby du Nord de Londres",
  },
  {
    pair: ["liverpool", "man_utd"],
    wikis: ["Liverpool F.C.", "Manchester United F.C."],
    nameAr: "ديربي الشمال الغربي",
    nameEn: "North-West Derby",
    nameFr: "Derby du Nord-Ouest",
  },
  {
    pair: ["chelsea", "arsenal"],
    wikis: ["Chelsea F.C.", "Arsenal F.C."],
    nameAr: "ديربي لندن",
    nameEn: "London Derby",
    nameFr: "Derby de Londres",
  },
  // إسبانيا
  {
    pair: ["real_madrid", "barcelona"],
    wikis: ["Real Madrid CF", "FC Barcelona"],
    nameAr: "كلاسيكو الأرض",
    nameEn: "El Clásico",
    nameFr: "El Clásico",
  },
  {
    pair: ["real_madrid", "atletico_madrid"],
    wikis: ["Real Madrid CF", "Atlético Madrid"],
    nameAr: "ديربي مدريد",
    nameEn: "Madrid Derby",
    nameFr: "Derby de Madrid",
  },
  {
    pair: ["barcelona", "espanyol"],
    wikis: ["FC Barcelona", "RCD Espanyol"],
    nameAr: "ديربي كتالونيا",
    nameEn: "Catalan Derby",
    nameFr: "Derby Catalan",
  },
  {
    pair: ["sevilla", "betis"],
    wikis: ["Sevilla FC", "Real Betis"],
    nameAr: "ديربي الأندلس",
    nameEn: "Seville Derby",
    nameFr: "Derby Sévillan",
  },
  // إيطاليا
  {
    pair: ["milan", "inter"],
    wikis: ["AC Milan", "Inter Milan"],
    nameAr: "ديربي الغضب (ميلانو)",
    nameEn: "Derby della Madonnina",
    nameFr: "Derby della Madonnina",
  },
  {
    pair: ["juventus", "inter"],
    wikis: ["Juventus FC", "Inter Milan"],
    nameAr: "ديربي إيطاليا",
    nameEn: "Derby d'Italia",
    nameFr: "Derby d'Italie",
  },
  {
    pair: ["juventus", "torino"],
    wikis: ["Juventus FC", "Torino FC"],
    nameAr: "ديربي تورينو",
    nameEn: "Derby della Mole",
    nameFr: "Derby de Turin",
  },
  {
    pair: ["roma", "lazio"],
    wikis: ["AS Roma", "SS Lazio"],
    nameAr: "ديربي العاصمة (روما)",
    nameEn: "Derby della Capitale",
    nameFr: "Derby de la Capitale",
  },
  // ألمانيا
  {
    pair: ["bayern", "dortmund"],
    wikis: ["FC Bayern Munich", "Borussia Dortmund"],
    nameAr: "كلاسيكر ألمانيا",
    nameEn: "Der Klassiker",
    nameFr: "Der Klassiker",
  },
  // فرنسا
  {
    pair: ["psg", "marseille"],
    wikis: ["Paris Saint-Germain F.C.", "Olympique de Marseille"],
    nameAr: "كلاسيكو فرنسا",
    nameEn: "Le Classique",
    nameFr: "Le Classique",
  },
  // السعودية
  {
    pair: ["hilal", "nassr"],
    wikis: ["Al Hilal SFC", "Al-Nassr FC"],
    nameAr: "ديربي الرياض",
    nameEn: "Riyadh Derby",
    nameFr: "Derby de Riyad",
  },
  {
    pair: ["ittihad_sa", "ahli_sa"],
    wikis: ["Al-Ittihad Club (Jeddah)", "Al-Ahli Saudi FC"],
    nameAr: "ديربي جدة",
    nameEn: "Jeddah Derby",
    nameFr: "Derby de Djeddah",
  },
  // اسكتلندا
  {
    pair: ["celtic", "rangers"],
    wikis: ["Celtic F.C.", "Rangers F.C."],
    nameAr: "ديربي أولد فيرم",
    nameEn: "Old Firm Derby",
    nameFr: "Derby du Old Firm",
  },
  // الأرجنتين
  {
    pair: ["boca", "river"],
    wikis: ["Boca Juniors", "Club Atlético River Plate"],
    nameAr: "سوبر كلاسيكو الأرجنتين",
    nameEn: "Superclásico",
    nameFr: "Superclásico",
  },
  // المغرب
  {
    pair: ["wydad", "raja"],
    wikis: ["Wydad AC", "Raja CA"],
    nameAr: "ديربي الدار البيضاء",
    nameEn: "Casablanca Derby",
    nameFr: "Derby de Casablanca",
  },
];

const METRO_AREAS = [
  new Set(["القاهرة", "الجيزة", "Cairo", "Giza", "cairo", "giza"]),
];

function isSameCityOrMetro(cityA, cityB) {
  if (!cityA || !cityB) return false;
  const ca = cityA.trim().toLowerCase();
  const cb = cityB.trim().toLowerCase();
  if (ca === cb) return true;
  for (const set of METRO_AREAS) {
    if (set.has(cityA) && set.has(cityB)) return true;
  }
  return false;
}

function normalizeStr(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]/g, "");
}

/**
 * تحديد ما إذا كانت المواجهة ديربي بين ناديين.
 * @param {string} idA - معرّف النادي الأول
 * @param {string} idB - معرّف النادي الثاني
 * @param {object} s - كائن حالة اللعبة (اختياري)
 * @returns {{ isDerby: boolean, derbyName?: string, nameAr?: string, nameEn?: string, nameFr?: string }}
 */
export function getDerbyInfo(idA, idB, s = null) {
  if (!idA || !idB || idA === idB) return { isDerby: false };

  const clubA = extendedClub(idA) || (s?.players?.find((p) => p.clubId === idA) ? { id: idA, name: idA } : null);
  const clubB = extendedClub(idB) || (s?.players?.find((p) => p.clubId === idB) ? { id: idB, name: idB } : null);

  const wikiA = clubA?.wiki || "";
  const wikiB = clubB?.wiki || "";
  const nameA = clubA?.name || "";
  const nameB = clubB?.name || "";

  // 1. فحص قائمة الديربيات التاريخية الصريحة
  for (const rival of CLASSIC_RIVALRIES) {
    const matchPair =
      (rival.pair.includes(idA) && rival.pair.includes(idB)) ||
      (rival.pair.some((p) => normalizeStr(p) === normalizeStr(idA)) &&
        rival.pair.some((p) => normalizeStr(p) === normalizeStr(idB)));

    const matchWikis =
      wikiA &&
      wikiB &&
      rival.wikis &&
      rival.wikis.includes(wikiA) &&
      rival.wikis.includes(wikiB);

    const matchNames =
      nameA &&
      nameB &&
      rival.wikis &&
      rival.wikis.some((w) => normalizeStr(w).includes(normalizeStr(nameA)) || normalizeStr(nameA).includes(normalizeStr(w))) &&
      rival.wikis.some((w) => normalizeStr(w).includes(normalizeStr(nameB)) || normalizeStr(nameB).includes(normalizeStr(w)));

    if (matchPair || matchWikis || matchNames) {
      return {
        isDerby: true,
        derbyName: rival.nameAr,
        nameAr: rival.nameAr,
        nameEn: rival.nameEn,
        nameFr: rival.nameFr,
      };
    }
  }

  // 2. فحص الناديين من نفس المدينة أو الإقليم الحضري
  if (clubA?.city && clubB?.city && isSameCityOrMetro(clubA.city, clubB.city)) {
    const city = clubA.city;
    return {
      isDerby: true,
      derbyName: `ديربي ${city}`,
      nameAr: `ديربي ${city}`,
      nameEn: `${city} Derby`,
      nameFr: `Derby de ${city}`,
    };
  }

  return { isDerby: false };
}

export function isDerbyMatch(idA, idB, s = null) {
  return getDerbyInfo(idA, idB, s).isDerby;
}

/**
 * نص عنوان ومحتوى الصحافة قبل مباراة الديربي
 */
export function derbyPreMatchMessage(ourClub, oppClub, derby) {
  const derbyLabel = derby?.nameAr || "الديربي";
  const oppName = oppClub?.name || "المنافس";
  return {
    title: `أجواء مشحونة قبل ${derbyLabel}: مواجهة ${oppName}`,
    body: `تترقب الجماهير ووسائل الإعلام قمة ${derbyLabel} المرتقبة ضد ${oppName}. شوارع المدينة تتحدث عن المواجهة والتوتر في أعلى مستوياته. أسعار التذاكر مضاعفة والملعب ممتلئ عن آخره بانتظار صافرة البداية.`,
    category: "matches",
    kind: "derby-pre",
  };
}

/**
 * نص عنوان ومحتوى الصحافة بعد مباراة الديربي
 */
export function derbyPostMatchMessage(ourClub, oppClub, result, ourGoals, oppGoals, derby) {
  const derbyLabel = derby?.nameAr || "الديربي";
  const oppName = oppClub?.name || "المنافس";
  if (result === "win") {
    return {
      title: `🔥 مجد الديربي: احتفالات تاريخية بالفوز على ${oppName}!`,
      body: `ليلة للتاريخ! الفوز بنتيجة ${ourGoals}–${oppGoals} في ${derbyLabel} يشعل حماس الجماهير ويهز المدينة بالكامل. قفزة كبيرة في ثقة الجماهير والروح المعنوية للاعبين واحتفالات ممتدة حتى الصباح.`,
      category: "matches",
      kind: "derby-win",
    };
  }
  if (result === "draw") {
    return {
      title: `صراع الديربي: تعادل ناري ${ourGoals}–${oppGoals} مع ${oppName}`,
      body: `انتهت قمة ${derbyLabel} بتعادل مثير ${ourGoals}–${oppGoals} بعد معركة تكتيكية مشحونة بالندية والحذر والبطاقات، ليبقى حسم الصراع معلقاً للجولة القادمة.`,
      category: "matches",
      kind: "derby-draw",
    };
  }
  return {
    title: `مرارة الديربي: خسارة مؤلمة ${ourGoals}–${oppGoals} أمام ${oppName}`,
    body: `صدمة في المدرجات وعناوين صحفية غاضبة بعد السقوط في ${derbyLabel} أمام ${oppName}. خيبة أمل جماهيرية واسعة وضغط متزايد للتعويض في الجولات المقبلة.`,
    category: "matches",
    kind: "derby-loss",
  };
}
