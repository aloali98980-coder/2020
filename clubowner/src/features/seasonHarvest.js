// الدفعة 6 — القسم 4: حصاد الموسم (صفحة احتفالية). الأساسيات ظاهرة، والتفاصيل خلف ⓘ.
import { esc, num, date } from "../ui/format.js";
import { tr, getLanguage } from "../i18n/index.js";
import { harvestFor } from "../services/seasonHarvest.js";
import { clubBy } from "../components/shared.js";

const info = (text) =>
  `<details class="info-toggle"><summary aria-label="ⓘ">ⓘ</summary><p>${esc(text)}</p></details>`;
const local = (copy) => copy?.[getLanguage()] || copy?.en || copy?.ar || "";
const teamName = (id) => clubBy(id)?.name || id;

export function seasonHarvestView(s) {
  const h = harvestFor(s);
  if (!h) {
    return `<div class="page harvest-page"><header class="page-head"><h2>${tr("حصاد الموسم", "Season harvest", "Bilan de saison")}</h2></header>
      <section class="panel"><p class="muted">${tr("لم ينتهِ موسم بعد. يظهر الحصاد عند أرشفة أول موسم.", "No season has finished yet. The harvest appears once the first season is archived.", "Aucune saison n'est encore terminée. Le bilan apparaît à l'archivage de la première saison.")}</p></section></div>`;
  }
  const own = h.own || {};
  const champ = h.champion;
  const banner = champ?.own
    ? tr("بطل الموسم: نادينا!", "Season champions: our club!", "Champion de la saison : notre club !")
    : `${tr("البطل", "Champion", "Champion")}: ${esc(teamName(champ?.clubId))}`;

  const stats = [
    [tr("المركز", "Position", "Place"), h.ownPosition ? num(h.ownPosition) : "—"],
    [tr("النقاط", "Points", "Points"), num(own.points ?? 0)],
    [tr("انتصارات", "Wins", "Victoires"), num(own.wins ?? 0)],
    [tr("الأهداف", "Goals for", "Buts marqués"), num(own.gf ?? 0)],
  ]
    .map(([k, v]) => `<div class="harvest-stat"><small>${k}</small><strong>${v}</strong></div>`)
    .join("");

  const scorer = h.topScorer
    ? `<p>${tr("الهداف", "Top scorer", "Meilleur buteur")}: <strong>${esc(h.topScorer.name || "—")}</strong> · ${num(h.topScorer.goals)} ${tr("هدفًا", "goals", "buts")}</p>`
    : "";

  const awards = h.awards.length
    ? `<ul class="harvest-awards">${h.awards
        .map((a) => `<li><strong>${esc(local(a.label) || a.id)}</strong>: ${esc(local({ ar: a.winner, en: a.winnerLatin, fr: a.winnerLatin }) || "—")}${a.own ? ` <span class="tag">${tr("من ناديك", "Your club", "Votre club")}</span>` : ""}</li>`)
        .join("")}</ul>`
    : `<p class="muted">${tr("لا جوائز مسجلة لهذا الموسم.", "No awards recorded for this season.", "Aucun prix enregistré pour cette saison.")}</p>`;

  const moments = h.moments.length
    ? `<ul class="harvest-moments">${h.moments.map((m) => `<li><span class="muted">${date(m.date)}</span> ${esc(m.title)}</li>`).join("")}</ul>`
    : `<p class="muted">${tr("لا لحظات مهمة مسجلة.", "No major moments recorded.", "Aucun moment marquant enregistré.")}</p>`;

  return `<div class="page harvest-page">
    <header class="page-head"><h2>${tr("حصاد الموسم", "Season harvest", "Bilan de saison")} ${num(h.number)}</h2>
      ${info(tr("مصدر كل رقم هنا: جدول الموسم المؤرشف، وإحصاءات اللاعبين، وحفل الجوائز، ورسائل البريد المهمة داخل الموسم.", "Every number comes from the archived table, player stats, the awards ceremony and high-priority messages from the season.", "Chaque chiffre provient du classement archivé, des statistiques des joueurs, de la cérémonie des prix et des messages prioritaires de la saison."))}
    </header>
    <section class="panel harvest-hero"><p class="harvest-banner">${banner}</p><div class="harvest-stats">${stats}</div>${scorer}</section>
    <div class="harvest-grid">
      <section class="panel"><h3>${tr("الجوائز", "Awards", "Prix")}</h3>${awards}</section>
      <section class="panel"><h3>${tr("اللحظات", "Moments", "Moments")}</h3>${moments}</section>
    </div>
  </div>`;
}
