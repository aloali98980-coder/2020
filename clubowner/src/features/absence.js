// الدفعة 6 — القسم 2: بطاقة «ماذا فاتك؟» أعلى المكتب. تظهر فقط عند وجود ما يُذكر.
import { esc, num, date } from "../ui/format.js";
import { tr } from "../i18n/index.js";
import { absenceReport } from "../services/absence.js";
import { clubBy } from "../components/shared.js";
import { notifyEnabled } from "../services/settingsHub.js";

const info = (text) =>
  `<details class="info-toggle"><summary aria-label="ⓘ">ⓘ</summary><p>${esc(text)}</p></details>`;

export function absenceBanner(s) {
  if (!notifyEnabled(s, "absence")) return "";
  const r = absenceReport(s);
  if (!r) return "";
  const hasAnything = r.results.count || r.major.count || r.pending.count;
  if (!hasAnything) return "";
  const score = (f) => `${num(f.homeGoals ?? 0)} – ${num(f.awayGoals ?? 0)}`;
  const team = (id) => clubBy(id)?.name || id;
  const resultRows = r.results.items
    .map(
      (f) =>
        `<li>${date(f.date)} · ${esc(team(f.home))} ${score(f)} ${esc(team(f.away))}</li>`,
    )
    .join("");
  const majorRows = r.major.items.map((m) => `<li>${esc(m.title)}</li>`).join("");
  const pendingRows = r.pending.items.map((m) => `<li>${esc(m.title)}</li>`).join("");
  const section = (title, count, rows) =>
    count
      ? `<div class="absence-col"><h4>${title} <small>${num(count)}</small></h4><ul>${rows}</ul></div>`
      : "";
  return `<section class="panel absence-card" aria-label="${tr("ماذا فاتك؟", "What did you miss?", "Ce que vous avez manqué ?")}">
    <header class="absence-head">
      <h3>${tr("ماذا فاتك؟", "What did you miss?", "Ce que vous avez manqué ?")}</h3>
      <span class="muted">${tr("منذ", "Since", "Depuis")} ${num(r.days)} ${tr("يومًا", "days", "jours")}</span>
      ${info(tr("ملخص يُبنى من سجل المباريات والرسائل والقرارات في الحفظ فقط. يظهر بعد 7 أيام من آخر اطلاع.", "A summary built only from match results, messages and decisions in your save. It appears after 7 days since you last looked.", "Résumé établi uniquement à partir des résultats, messages et décisions de votre sauvegarde. Il apparaît après 7 jours depuis votre dernière visite."))}
    </header>
    <div class="absence-grid">
      ${section(tr("النتائج", "Results", "Résultats"), r.results.count, resultRows)}
      ${section(tr("الكبرى", "Major", "Majeurs"), r.major.count, majorRows)}
      ${section(tr("معلّق", "Pending", "En attente"), r.pending.count, pendingRows)}
    </div>
    <button class="btn" data-action="absence-seen">${tr("تم الاطلاع", "Got it", "Compris")}</button>
  </section>`;
}
