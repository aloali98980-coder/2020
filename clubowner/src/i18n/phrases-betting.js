// قاموس المراهنات 0.36 — مشتق من bettingTexts + كتالوج.
import { BETTING_TEXTS } from "../data/bettingTexts.js";
import { BETTING_COMPANIES, LICENSE_TIERS } from "../data/bettingCatalog.js";

const fromTexts = (() => {
  const out = {};
  for (const v of Object.values(BETTING_TEXTS)) out[v.ar] = [v.en, v.fr];
  return out;
})();

const EXTRA = {};

for (const c of BETTING_COMPANIES) {
  EXTRA[c.name.ar] = [c.name.en, c.name.fr];
  EXTRA[c.desc.ar] = [c.desc.en, c.desc.fr];
}
for (const t of Object.values(LICENSE_TIERS)) {
  EXTRA[t.name.ar] = [t.name.en, t.name.fr];
  EXTRA[t.desc.ar] = [t.desc.en, t.desc.fr];
}

export const BETTING_PHRASES = { ...fromTexts, ...EXTRA };
export default BETTING_PHRASES;
