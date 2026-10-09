// قرعة الكأس 0.27 — تسجيل وعرض مراسم قرعة أدوار الكؤوس
// شاشة قرعة تعرض المواجهات عند سحب كل دور مع رسالة بريدية بالإعلان — لحظة ترقب بدل الخبر الجاف.
import { extendedClub } from "../data/expandedCatalog.js";
import { STAGE_NAMES } from "./competitions/presets.js";
import { message } from "./inbox.js";

/**
 * تسجيل قرعة دور جديد لمسابقة خروج مغلوب
 * @param {object} s - حالة الحفظ
 * @param {object} cup - كائن الكأس
 * @param {string} phase - المرحلة (r32, r16, qf, sf, final...)
 * @param {Array<[string, string]>} pairs - أزواج المواجهات المسحوبة
 * @param {string[]} byes - الأندية المعفاة من هذا الدور (إن وجدت)
 * @returns {object} كائن القرعة المسجل
 */
export function recordCupDraw(s, cup, phase, pairs = [], byes = []) {
  if (!s || !cup) return null;

  const stageLabel = STAGE_NAMES[phase] || phase;
  const drawId = `draw-${cup.id}-${phase}-${cup.round || 0}`;

  // منع تكرار نفس القرعة إذا سُجلت مسبقًا
  if (s.cupDraws?.some((d) => d.id === drawId)) {
    return s.cupDraws.find((d) => d.id === drawId);
  }

  const userMatchup = pairs.find(([a, b]) => a === s.clubId || b === s.clubId) || null;
  const userBye = byes.includes(s.clubId);
  const involvesUser = !!userMatchup || userBye;

  const drawRecord = {
    id: drawId,
    cupId: cup.id,
    cupName: cup.name,
    phase,
    stageLabel,
    round: cup.round || 0,
    date: s.date,
    pairs: pairs.map(([home, away]) => ({ home, away })),
    byes: [...byes],
    involvesUser,
    userMatchup: userMatchup ? { home: userMatchup[0], away: userMatchup[1] } : null,
    userBye,
  };

  if (!Array.isArray(s.cupDraws)) s.cupDraws = [];
  if (involvesUser || cup.country === extendedClub(s.clubId)?.country || s.cupDraws.length < 5) {
    s.cupDraws.unshift(drawRecord);
    if (s.cupDraws.length > 10) s.cupDraws.pop();
    s.latestDraw = drawRecord;
  }

  // إرسال رسالة بريدية بالإعلان عن القرعة عند مشاركة نادي اللاعب
  const ourClub = extendedClub(s.clubId)?.name || "ناديك";
  if (userMatchup) {
    const oppId = userMatchup[0] === s.clubId ? userMatchup[1] : userMatchup[0];
    const oppClub = extendedClub(oppId)?.name || oppId;
    message(s, {
      title: `قرعة ${cup.name}: مواجهة مرتقبة في ${stageLabel}`,
      body: `أُجريت مراسم سحب قرعة ${stageLabel} لمسابقة ${cup.name}. أسفرت القرعة عن مواجهة ناديك: ${ourClub} ضد ${oppClub}. اضغط لمشاهدة مراسم القرعة والمواجهات الكاملة.`,
      category: "matches",
      kind: "cup-draw",
      ref: drawId,
    });
  } else if (userBye) {
    message(s, {
      title: `قرعة ${cup.name}: إعفاء ناديك من ${stageLabel}`,
      body: `أُجريت مراسم قرعة ${stageLabel} لمسابقة ${cup.name}. ناديك معفى من خوض هذا الدور ويتأهل مباشرة للدور القادم. استعرض نتائج قرعة بقية الأندية.`,
      category: "matches",
      kind: "cup-draw",
      ref: drawId,
    });
  }

  return drawRecord;
}

/**
 * جلب قرعة محفوظة عبر المعرف
 */
export function getCupDraw(s, id) {
  if (!s?.cupDraws) return null;
  return s.cupDraws.find((d) => d.id === id) || null;
}
