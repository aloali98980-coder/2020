// الدفعة 7 — القسم 3: تقديم اللاعب 🎽
// • الفحص الطبي قد يفشل (نتيجة حتمية من اللاعب والتاريخ، فلا عشوائية بين الحفظات).
// • رقم القميص يُسنَد عند التوقيع: يحاول الرقم السابق، ثم يتخذ أول رقم حر (الحارس 1).
// • الكلمات الأولى: نص قصير يُخزَّن كفهرس، فتتبدل لغته مع لغة الواجهة.
// دوال نقية؛ لا تكتب على الحالة إلا assignShirtNumber وقت التوقيع.

// فهرس الكلمات الأولى (يُترجم في الواجهة عبر tr). الترتيب ثابت لأن الحفظ يخزن الفهرس.
export const FIRST_WORDS_COUNT = 6;

// هاش FNV-1a بسيط وثابت: نفس المدخل يعطي نفس النتيجة دائمًا.
export function stableHash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// احتمال الرسوب بالنسبة المئوية: أساس 5، يرتفع مع العمر والإصابة الحالية.
export function medicalFailChance(s, p) {
  let chance = 5;
  if ((p.age || 0) >= 31) chance += 7;
  if ((p.age || 0) >= 35) chance += 5;
  if (p.injuryUntil && p.injuryUntil > s.date) chance += 10;
  return Math.min(40, chance);
}

export function medicalResult(s, p) {
  const roll = stableHash(`${p.id}|${s.date}|medical`) % 100;
  const chance = medicalFailChance(s, p);
  return { pass: roll >= chance, roll, chance };
}

export function firstWordsIndex(s, p) {
  return stableHash(`${p.id}|${s.date}|words`) % FIRST_WORDS_COUNT;
}

const isUsableNumber = (n) => Number.isInteger(n) && n >= 1 && n <= 99;

// رقم القميص لا يتكرر داخل النادي بين اللاعبين غير المعتزلين.
export function assignShirtNumber(s, p) {
  const taken = new Set(
    s.players
      .filter((x) => x.clubId === s.clubId && x.id !== p.id && x.status !== "retired" && isUsableNumber(x.shirtNumber))
      .map((x) => x.shirtNumber),
  );
  let n = null;
  if (isUsableNumber(p.previousShirt) && !taken.has(p.previousShirt)) n = p.previousShirt;
  if (n === null && p.position === "GK" && !taken.has(1)) n = 1;
  for (let i = 2; n === null && i <= 99; i++) if (!taken.has(i)) n = i;
  p.shirtNumber = n;
  return n;
}

// للعرض فقط: إن لم يكن للحفظة القديم رقم، يُحسب الرقم المتاح دون كتابة على الحالة.
export function shirtNumberOf(s, p) {
  if (isUsableNumber(p.shirtNumber)) return p.shirtNumber;
  return null;
}

// الكلمات الأولى للاعب بعد التوقيع (عربية؛ الترجمة في قاموس الواجهة).
export const FIRST_WORDS = Object.freeze([
  "أنا هنا لأعمل، والباقي يأتي بعد ذلك.",
  "شكرًا للجماهير، سأعطي كل شيء على أرض الملعب.",
  "أحب هذا النادي منذ صغري، والآن صرت جزءًا منه.",
  "المدرب وضع خطة واضحة، وسأنفذها بالكامل.",
  "أنا جاهز للتحدي، ولن أخذل زملائي.",
  "خطوة كبيرة في مسيرتي، وأتطلع للبداية.",
]);
export const firstWordsOf = (s, p) => FIRST_WORDS[p.firstWordsIndex ?? firstWordsIndex(s, p)];
