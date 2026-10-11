// الدفعة 7 — القسم 4: مقياس الضجيج 📊
// يرتفع مع الصفقات الكبيرة والفضائح، ويتأثر بالنتائج. كل حدث يترك أثرًا مباشرًا على:
//   • الجماهير (fanSupport)، • الرعاة (مزاج الرعاة النشطين في staffCorp.marketing)،
//   • الصحافة (press.trust وخبر في press.news إن وُجد ملف الصحافة).
// الهبوط تدريجي بنسبة 3% يوميًا، ويُحسب عند كل قراءة/تسجيل (بلا تحديث يومي جديد).
import { clamp, daysBetween } from "../core/utils.js";
import { setSponsorMood, sponsorMood } from "./staff/marketing.js";

export const NOISE_LOG_CAP = 12;
const DAILY_DECAY = 0.97;

export const NOISE_SOURCES = Object.freeze(["transfer", "scandal", "result"]);

export function noiseState(s) {
  s.noise ||= { value: 0, day: s.date, log: [] };
  s.noise.log ||= [];
  return s.noise;
}

// مستوى للعرض: هادئ / متوسط / عالٍ.
export function noiseLevel(value) {
  if (value >= 70) return "high";
  if (value >= 35) return "medium";
  return "low";
}

// الضجيج الحالي بعد الهبوط حتى تاريخ اليوم، دون تعديل الحالة.
export function currentNoise(s) {
  const n = s.noise;
  if (!n) return 0;
  const days = Math.max(0, daysBetween(n.day || s.date, s.date) || 0);
  return Math.round(n.value * DAILY_DECAY ** days * 10) / 10;
}

function decayInPlace(s) {
  const n = noiseState(s);
  n.value = currentNoise(s);
  n.day = s.date;
}

// أثر الحدث على الجماهير والرعاة والصحافة. الأرقام ثابتة وقصيرة المدى.
function applyEffects(s, amount) {
  const fanDelta = amount >= 0 ? -Math.round(amount / 8) : Math.round(-amount / 8);
  if (fanDelta && Number.isFinite(s.fanSupport))
    s.fanSupport = clamp(s.fanSupport + fanDelta, 0, 100);
  for (const c of s.sponsors || []) {
    if (c.status !== "active") continue;
    const now = sponsorMood(s, c.assetId);
    if (now == null) continue;
    setSponsorMood(s, c.assetId, now - Math.round(amount / 5));
  }
  if (s.press && Number.isFinite(s.press.trust))
    s.press.trust = clamp(s.press.trust - Math.round(amount / 10), 0, 100);
}

// تسجيل حدث ضجيج: يحدّث المقياس، ويضيف سطرًا للسجل، ويطبق الأثر.
export function addNoise(s, source, amount, label) {
  if (!NOISE_SOURCES.includes(source)) throw new Error(`مصدر ضجيج غير معروف: ${source}`);
  decayInPlace(s);
  const n = s.noise;
  const before = n.value;
  n.value = clamp(Math.round((before + amount) * 10) / 10, 0, 100);
  const effective = n.value - before;
  n.log.unshift({ date: s.date, source, amount: effective, label });
  n.log = n.log.slice(0, NOISE_LOG_CAP);
  applyEffects(s, effective);
  if (s.press && Array.isArray(s.press.news) && Math.abs(effective) >= 5) {
    s.press.news.unshift({ date: s.date, title: label, type: "ضجيج" });
    s.press.news = s.press.news.slice(0, 60);
  }
  return n.value;
}

// قيم الأحداث: صفقة كبيرة ترفع الضجيج حسب قيمتها (بحد أقصى 25).
export const transferNoise = (fee) => clamp(Math.round(3 + (fee || 0) / 10000000), 3, 25);
export const SCANDAL_NOISE = 15;
// النتيجة: الخسارة ترفع الضجيج، والفوز يهدّئه.
export const resultNoise = (ours, theirs) => (ours > theirs ? -4 : ours < theirs ? 5 : 0);

// يُستدعى بعد كل مباراة: يحسب أثر النتيجة لناديك فقط (المباريات الأخرى لا تهمّ المقياس).
export function noteResultNoise(s, f) {
  if (!(f.home === s.clubId || f.away === s.clubId)) return null;
  const ours = f.home === s.clubId ? f.homeGoals : f.awayGoals;
  const theirs = f.home === s.clubId ? f.awayGoals : f.homeGoals;
  if (!Number.isFinite(ours) || !Number.isFinite(theirs)) return null;
  const amount = resultNoise(ours, theirs);
  if (!amount) return null;
  const label = ours > theirs ? "فوز يهدّئ الأجواء" : "خسارة ترفع الأصوات";
  return addNoise(s, "result", amount, label);
}
