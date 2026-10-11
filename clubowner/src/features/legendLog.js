// الدفعة 6 — القسم 3: سجل الأسطورة. الأساسيات ظاهرة (البطولات، النقاط، السيرة)، والشرح خلف ⓘ.
import { esc, num, money, date } from "../ui/format.js";
import { tr } from "../i18n/index.js";
import { legendLog } from "../services/legendLog.js";

const info = (text) =>
  `<details class="info-toggle"><summary aria-label="ⓘ">ⓘ</summary><p>${esc(text)}</p></details>`;
const empty = () => `<p class="muted">${tr("لا شيء مسجل بعد.", "Nothing recorded yet.", "Rien d'enregistré pour l'instant.")}</p>`;

export function legendLogView(s) {
  const log = legendLog(s);
  const bio = log.bio;

  const titles = log.titles.length
    ? `<ol class="legend-titles">${log.titles
        .map((t) => `<li><strong>${tr("موسم", "Season", "Saison")} ${num(t.number)}</strong> <span class="muted">${date(t.date)}</span></li>`)
        .join("")}</ol>`
    : empty();

  const decisions = log.decisions.length
    ? `<ul class="legend-decisions">${log.decisions
        .map((d) => `<li><span class="muted">${date(d.date)}</span> ${esc(d.description)} · <strong>${money(d.amount)}</strong></li>`)
        .join("")}</ul>`
    : empty();

  const r = log.records;
  const records = r
    ? `<dl class="legend-records">
        <div><dt>${tr("أعلى نقاط", "Most points", "Most de points")}</dt><dd>${num(r.points.value)} <small>(${tr("موسم", "season", "saison")} ${num(r.points.season)})</small></dd></div>
        <div><dt>${tr("أكثر أهداف", "Most goals", "Plus de buts")}</dt><dd>${num(r.goals.value)} <small>(${tr("موسم", "season", "saison")} ${num(r.goals.season)})</small></dd></div>
        <div><dt>${tr("أكثر انتصارات", "Most wins", "Plus de victoires")}</dt><dd>${num(r.wins.value)} <small>(${tr("موسم", "season", "saison")} ${num(r.wins.season)})</small></dd></div>
      </dl>`
    : empty();

  return `<div class="page legend-log">
    <header class="page-head"><h2>${tr("سجل الأسطورة", "Legend log", "Journal de légende")}</h2></header>
    <div class="legend-grid">
      <section class="panel legend-bio">
        <h3>${tr("سيرة المالك", "Owner biography", "Biographie du propriétaire")} ${info(tr("اسم المالك وعمره وتاريخ توليه، وعدد البطولات المسجلة في الإرث.", "The owner's name, age, start date and titles recorded in the legacy file.", "Nom, âge, date de prise de fonction et titres inscrits au dossier d'héritage."))}</h3>
        <p><strong>${esc(bio.name || "—")}</strong>${bio.age != null ? ` · ${num(bio.age)} ${tr("عامًا", "years", "ans")}` : ""}</p>
        <p class="muted">${tr("الجيل", "Generation", "Génération")} ${num(bio.generation)} · ${tr("الأبناء", "Children", "Enfants")} ${num(bio.children)}</p>
      </section>
      <section class="panel legend-score">
        <h3>${tr("نقاط الإرث", "Legacy points", "Points d'héritage")} ${info(tr("مجموع يحسبه نظام الإرث القائم من الجيل والبطولات والأبناء والسمعة وسجل العائلة، بسقف 1000.", "A total from the existing legacy system: generation, titles, children, reputation and family archive, capped at 1000.", "Total calculé par le système d'héritage existant : génération, titres, enfants, réputation et archives, plafonné à 1000."))}</h3>
        <p class="legend-score-value">${num(log.legacyScore)}</p>
      </section>
      <section class="panel legend-titles-panel">
        <h3>${tr("البطولات", "Titles", "Titres")} <small>${num(log.titles.length)}</small></h3>
        ${titles}
      </section>
      <section class="panel legend-decisions-panel">
        <h3>${tr("القرارات الكبرى", "Major decisions", "Décisions majeures")} ${info(tr("صفقات بمقدم 20 مليونًا أو أكثر من دفتر الخزينة.", "Transfers with an upfront payment of 20M or more, from the treasury ledger.", "Transferts avec un versement initial d'au moins 20 M, issus du registre de trésorerie."))}</h3>
        ${decisions}
      </section>
      <section class="panel legend-records-panel">
        <h3>${tr("القياسات", "Records", "Records")} ${info(tr("أفضل موسم للنادي في النقاط والأهداف والانتصارات، من جداول المواسم المؤرشفة.", "The club's best season for points, goals and wins, from archived season tables.", "Meilleures saisons du club en points, buts et victoires, issues des tableaux archivés."))}</h3>
        ${records}
      </section>
    </div>
  </div>`;
}
