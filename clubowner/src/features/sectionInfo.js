// الدفعة 6 — القسم 7: بطاقة التعريف أعلى القسم. تُخفى بزر «لا تظهر» لكل قسم.
import { esc } from "../ui/format.js";
import { tr, getLanguage } from "../i18n/index.js";
import { SECTION_INFO, sectionInfoHidden } from "../services/sectionInfo.js";

export function sectionInfoCard(s, id) {
  const copy = SECTION_INFO[id];
  if (!copy || sectionInfoHidden(s, id)) return "";
  const lang = getLanguage();
  const lines = (copy[lang] || copy.ar).slice(0, 6);
  return `<section class="panel section-info" data-section="${esc(id)}">
    <ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
    <button class="btn ghost" data-action="info-hide" data-id="${esc(id)}">${tr("لا تظهر", "Hide", "Masquer")}</button>
  </section>`;
}
