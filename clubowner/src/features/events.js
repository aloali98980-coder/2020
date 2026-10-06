import { EVENT_CATALOG } from "../data/eventCatalog.js";
import { button, badge } from "../components/shared.js";
import { money, num, esc, date , cur} from "../ui/format.js";
import { tr } from "../i18n/index.js";
export function eventDecisionView(s, id) {
  const ev = s.clubDecisions.find((e) => e.id === id);
  if (!ev) return "";
  const data = EVENT_CATALOG.find((e) => e.id === ev.type);
  return `<div class="event-choices">${data.choices.map((c) => `<article><h4>${c.label}</h4><ul><li>${tr("أثر السيولة", "Cash impact", "Effet sur la trésorerie")}: <b dir="auto">${money(c.cash || 0)} ${cur()}</b></li>${c.fans ? `<li>الجماهير: ${num(c.fans)}</li>` : ""}${c.morale ? `<li>المعنويات: ${num(c.morale)}</li>` : ""}${c.fitness ? `<li>الجاهزية: ${num(c.fitness)}</li>` : ""}${c.incomeLater ? `<li>${tr("إيراد بعد ٣٠ يومًا", "Income after 30 days", "Recette après 30 jours")}: ${money(c.incomeLater)} ${cur()}</li>` : ""}${c.youth ? `<li>${tr(`ناشئ مولّد: مرتب ٢٥ ألف ${cur()} شهريًا، عقد سنتين؛ يحتاج مكانًا بالقائمة.`, `Generated prospect: 25,000/month, two-year contract; requires a squad slot.`, `Jeune généré : 25 000/mois, contrat de deux ans ; place requise.`)}</li>` : ""}${c.report ? `<li>${tr("تقرير عن لاعب من السوق.", "Report on a market player.", "Rapport sur un joueur du marché.")}</li>` : ""}</ul><button class="btn soft full" data-action="event-choice" data-id="${id}" data-choice="${c.id}" ${c.cash < 0 && s.finance.cash < -c.cash ? "disabled" : ""}>نفّذ القرار</button></article>`).join("")}</div>`;
}
