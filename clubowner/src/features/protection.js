// الدفعة 6 — القسم 5: واجهة الحماية. تأكيد القرار الدائم، وبطاقة وضع الإجازة، وتقرير العودة.
import { esc, money, date, num } from "../ui/format.js";
import { tr } from "../i18n/index.js";
import { vacationActive, ensureVacation } from "../services/protection.js";

const info = (text) =>
  `<details class="info-toggle"><summary aria-label="ⓘ">ⓘ</summary><p>${esc(text)}</p></details>`;

// نافذة تأكيد قبل قرار لا رجعة فيه. الزر الأساسي يُعيد الأكشن نفسه مع data-confirmed.
export function irreversibleModal({ title, warning, action, id, amountLabel }) {
  const lines = [
    warning.star
      ? tr("يتعلق القرار بنجم من الفريق. لا رجعة فيه بعد التنفيذ.", "This involves a star player. It cannot be undone once executed.", "Cette décision concerne une star. Elle est irréversible une fois exécutée.")
      : null,
    warning.big
      ? `${tr("المبلغ", "Amount", "Montant")}: ${money(warning.fee)} — ${tr("لا رجعة فيه.", "This cannot be undone.", "Cela ne peut pas être annulé.")}`
      : null,
  ].filter(Boolean);
  return `<div class="modal-confirm">
    <h2>${esc(title)}</h2>
    ${warning.playerName ? `<p><strong>${esc(warning.playerName)}</strong></p>` : ""}
    ${lines.map((l) => `<p>${esc(l)}</p>`).join("")}
    ${amountLabel ? `<p class="muted">${esc(amountLabel)}</p>` : ""}
    <div class="modal-actions">
      <button class="btn" data-action="${esc(action)}" data-id="${esc(id)}" data-confirmed="1">${tr("تأكيد التنفيذ", "Confirm", "Confirmer")}</button>
      <button class="btn secondary" data-action="close-modal">${tr("تراجع", "Cancel", "Annuler")}</button>
    </div>
  </div>`;
}

export function vacationCard(s) {
  const v = ensureVacation(s);
  const active = vacationActive(s);
  const body = active
    ? `<p>${tr("وضع الإجازة مفعّل منذ", "Holiday mode has been on since", "Mode vacances activé depuis le")} ${date(v.startedOn)}.</p>
       <button class="btn" data-action="vacation-end">${tr("إنهاء الإجازة وتقرير العودة", "End holiday and get the return report", "Terminer et obtenir le rapport de retour")}</button>`
    : `<p class="muted">${tr("يمنع القرارات الكبرى (النجوم والصفقات من 20 مليونًا فأكثر) حتى عودتك.", "Blocks major decisions (stars and deals of 20M or more) until you return.", "Bloque les décisions majeures (stars et transferts de 20 M ou plus) jusqu'à votre retour.")}</p>
       <button class="btn secondary" data-action="vacation-start">${tr("تفعيل وضع الإجازة", "Turn on holiday mode", "Activer le mode vacances")}</button>`;
  return `<section class="panel vacation-card">
    <header><h3>${tr("وضع الإجازة", "Holiday mode", "Mode vacances")}</h3>
      ${info(tr("يبقى الروتين على آلية المحرك. الكبرى تُمنع، وعند العودة يظهر تقرير بما فاتك منذ بدء الإجازة.", "Routine runs on the engine. Major moves are blocked, and on return you get a report of what happened since the start.", "La routine reste gérée par le moteur. Les décisions majeures sont bloquées, et au retour un rapport résume ce qui s'est passé."))}
    </header>
    ${body}
  </section>`;
}

export function vacationReturnModal(out) {
  const r = out.report;
  const rows = r?.results?.items || [];
  const results = rows.length
    ? `<ul>${rows.map((f) => `<li>${date(f.date)} · ${num(f.homeGoals ?? 0)} – ${num(f.awayGoals ?? 0)}</li>`).join("")}</ul>`
    : `<p class="muted">${tr("لا مباريات مخوضة أثناء الإجازة.", "No matches were played during the holiday.", "Aucun match joué pendant les vacances.")}</p>`;
  return `<div class="modal-confirm vacation-return">
    <h2>${tr("تقرير العودة", "Return report", "Rapport de retour")}</h2>
    <p class="muted">${date(out.startedOn)} → ${date(out.endedOn)}</p>
    <h4>${tr("النتائج", "Results", "Résultats")} <small>${num(r?.results?.count || 0)}</small></h4>
    ${results}
    <h4>${tr("الكبرى", "Major", "Majeurs")} <small>${num(r?.major?.count || 0)}</small></h4>
    <h4>${tr("معلّق", "Pending", "En attente")} <small>${num(r?.pending?.count || 0)}</small></h4>
    <div class="modal-actions"><button class="btn" data-action="close-modal">${tr("تم", "Done", "Terminé")}</button></div>
  </div>`;
}

