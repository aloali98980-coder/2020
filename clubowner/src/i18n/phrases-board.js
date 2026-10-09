// قاموس «لائحة الجمعية العمومية» 0.26 — مشتق آليًا من سجل النصوص الوحيد
// (src/data/boardTexts.js) فلا تنفصل الترجمة عن المصدر ولا تبقى عبارة بلا مقابل.
// المفتاح هو النص العربي كما هو، والقيمة [الإنجليزية، الفرنسية].
// عناصر الاستبدال {v}/{n}/{d} جزء من المفتاح المقصود (تُملأ وقت العرض أو تُترك كما هي).
import { BOARD_TEXTS } from "../data/boardTexts.js";

// ملاحظة: اتفاقية المستودع أن مفتاح القاموس بلا نقطة نهاية الجملة، لذلك نُسجّل
// النسخة الكاملة والنسخة المنزوعة النقطة معًا (translateText يقبل الاثنتين).
export const BOARD_PHRASES = (() => {
  const out = {};
  for (const entry of Object.values(BOARD_TEXTS)) {
    out[entry.ar] = [entry.en, entry.fr];
    const bare = entry.ar.replace(/[.؛:!؟…،,]+$/, "");
    if (bare && !out[bare]) out[bare] = [entry.en, entry.fr];
  }
  return out;
})();
export default BOARD_PHRASES;
