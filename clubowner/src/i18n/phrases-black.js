// قاموس «الملفات السوداء» 0.28 — مشتق آليًا من src/data/blackTexts.js
import { BLACK_TEXTS } from "../data/blackTexts.js";

export const BLACK_PHRASES = (() => {
  const out = {};
  for (const entry of Object.values(BLACK_TEXTS)) {
    out[entry.ar] = [entry.en, entry.fr];
    const bare = entry.ar.replace(/[.؛:!؟…،,]+$/, "");
    if (bare && !out[bare]) out[bare] = [entry.en, entry.fr];
  }
  return out;
})();
export default BLACK_PHRASES;
