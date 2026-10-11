// لوحة القيادة 0.44 — شاشة نظيفة: الأساسيات ظاهرة، والتفاصيل خلف ⓘ، ولكل ودجت رابط إلى شاشته.
// الترتيب حسب الأولوية: تنبيهات → مؤشرات → القرارات والمباريات → المكونات الدائمة.
import { tr } from "../i18n/index.js";
import { onboardingView } from "./onboarding.js";
import { boardCardView } from "./board.js";
import { blackCardView } from "./blackFiles.js";
import { awardsCardView } from "./awards.js";
import { lastPlayedFixture, reportFor } from "../services/matchReport.js";
import { ownFixtures } from "../services/calendar.js";
import { isDeadlineDay } from "../services/deadlineDay.js";
import { getDerbyInfo } from "../services/derby.js";
import { icon } from "../components/icons.js";
import { heading, crest, clubBy, badge } from "../components/shared.js";
import { money, num, shortDate, esc, cur } from "../ui/format.js";
import { wages, liabilities, forecast } from "../services/finance.js";
import { netWorth } from "../services/empire/wealth.js";
import { dismissalRisk } from "../services/empire/transfers.js";
import { pendingActions } from "../services/inbox.js";
import { sortedTable } from "../services/matches.js";
import { FACILITIES } from "../data/catalog.js";

// تفاصيل ثانوية خلف ⓘ: لا تزاحم الشاشة، وتُفتح بنقرة.
const info = (text) =>
  `<details class="info-toggle"><summary aria-label="${tr("تفاصيل", "Details", "Détails")}">ⓘ</summary><p>${text}</p></details>`;

// ودجت بإطار موحد ورابط واحد إلى شاشته.
const widget = (id, title, body, nav, linkLabel) => `
  <section class="panel dash-widget" data-widget="${id}">
    <div class="panel-head"><h3>${title}</h3></div>
    <div class="dash-widget-body">${body}</div>
    ${nav ? `<button class="dash-widget-link" data-nav="${nav}">${linkLabel} ${icon("arrow", 14)}</button>` : ""}
  </section>`;

// بلاطة مؤشر: القيمة الأساسية ظاهرة، والتفاصيل خلف ⓘ.
const tile = (id, label, value, unit, nav, detail, tone = "") => `
  <div class="dash-tile ${tone}" data-tile="${id}">
    <button class="dash-tile-main" data-nav="${nav}">
      <small>${label}</small>
      <strong>${value}<small>${unit}</small></strong>
    </button>
    ${detail ? info(detail) : ""}
  </div>`;

function alertsView(s, deadline, pending) {
  const items = [];
  if (deadline)
    items.push(
      `<div class="dash-alert gold"><span class="deadline-pulse-dot"></span><div><strong>${tr("يوم قفل القيد", "Deadline Day", "Jour de la date limite")}</strong><span>${tr("السوق يغلق الليلة عند 23:59.", "The market closes tonight at 23:59.", "Le marché ferme ce soir à 23h59.")}</span></div><button class="btn primary small" data-nav="transfers">${tr("السوق", "Market", "Marché")}</button></div>`,
    );
  if (pending.length)
    items.push(
      `<div class="dash-alert"><div><strong>${tr("قرارات تنتظر ردك", "Decisions awaiting your reply", "Décisions en attente de votre réponse")}</strong><span>${num(pending.length)} ${tr("قرار مطلوب قبل تمرير الوقت.", "required before time advances.", "requise(s) avant de faire avancer le temps.")}</span></div><button class="btn secondary small" data-nav="inbox">${tr("افتح البريد", "Open inbox", "Ouvrir la boîte")}</button></div>`,
    );
  if (dismissalRisk(s))
    items.push(
      `<div class="dash-alert red"><div><strong>${tr("خطر الفصل", "Dismissal risk", "Risque de révocation")}</strong><span>${tr("ثقة الجمعية منخفضة بعد النهب.", "Assembly trust is low after looting.", "La confiance de l’assemblée est basse après le pillage.")}</span></div><button class="btn secondary small" data-nav="board">${tr("الجمعية", "Assembly", "Assemblée")}</button></div>`,
    );
  return items.length ? `<div class="dash-alerts">${items.join("")}</div>` : "";
}

export function dashboardView(s) {
  const c = clubBy(s.clubId),
    pending = pendingActions(s),
    next = ownFixtures(s).find(
      (f) => !f.played && (f.home === s.clubId || f.away === s.clubId),
    ),
    monthly = forecast(s),
    table = sortedTable(s),
    rank = table.findIndex((t) => t.clubId === s.clubId) + 1;
  const deadline = isDeadlineDay(s);
  const nextDerby = next ? getDerbyInfo(next.home, next.away, s) : { isDerby: false };
  const wagesNow = wages(s),
    wagePct = s.finance.wageBudget ? Math.round((wagesNow / s.finance.wageBudget) * 100) : 0;
  const pendingBills = s.finance.obligations.filter(
    (o) => o.status === "pending" && o.category !== "sponsor-income",
  );

  // مؤشرات: الأساسي ظاهر، والتفاصيل في ⓘ.
  const tiles = `<div class="dash-tiles">
    ${tile("treasury", tr("خزينة النادي", "Club treasury", "Trésorerie du club"), money(s.finance.cash), cur(), "finance",
      `${tr("إيراد تعاقدي خلال 30 يومًا", "Contract income in 30 days", "Revenus contractuels sur 30 jours")}: ${money(monthly.income)} ${cur()}. ${tr("التزامات مستقبلية", "Future liabilities", "Engagements futurs")}: ${money(liabilities(s))} ${cur()} (${num(pendingBills.length)} ${tr("دفعات", "payments", "paiements")}).`, "green")}
    ${tile("personal", tr("ثروتك الشخصية", "Personal fortune", "Fortune personnelle"), money(s.empire?.personal ?? 0), cur(), "empire",
      `${tr("صافي الثروة", "Net worth", "Fortune nette")}: ${money(netWorth(s))} ${cur()}.`, "gold")}
    ${tile("wages", tr("مرتبات الفريق", "Squad wages", "Salaires de l’équipe"), `${num(wagePct)}`, "%", "squad",
      `${money(wagesNow)} ${cur()} ${tr("شهريًا من ميزانية", "per month out of a budget of", "par mois sur un budget de")} ${money(s.finance.wageBudget)} ${cur()}.`)}
    ${tile("fans", tr("ثقة الجماهير", "Fan trust", "Confiance des supporters"), num(s.fanSupport), "/100", "ultras",
      tr("تتأثر بالنتائج داخل الملعب والقرارات العامة.", "Affected by results on the pitch and public decisions.", "Influencée par les résultats et les décisions publiques."))}
  </div>`;

  // أولوية 1: المباراة القادمة.
  const nextWidget = widget(
    "next-match",
    tr("المباراة القادمة", "Next match", "Prochain match"),
    next
      ? `${nextDerby.isDerby ? `<div class="next-derby-badge">🔥 ${tr(nextDerby.nameAr || "ديربي", nextDerby.nameEn || "Derby", nextDerby.nameFr || "Derby")}</div>` : ""}
         <div class="match-label">${tr("الجولة", "Round", "Journée")} ${num(next.round)} · ${shortDate(next.date)}</div>
         <div class="match-teams"><div>${crest(next.home, "large")}<strong>${clubBy(next.home).short}</strong></div><span>VS</span><div>${crest(next.away, "large")}<strong>${clubBy(next.away).short}</strong></div></div>
         <small class="muted">${next.home === s.clubId ? tr("على ملعبك", "At your stadium", "À domicile") : tr("خارج ملعبك", "Away", "À l’extérieur")}</small>`
      : `<p class="muted">${tr("لا مباراة مؤكدة قادمة.", "No confirmed upcoming match.", "Aucun match confirmé à venir.")}</p>`,
    "world",
    tr("الجدول والمنافسة", "Table and competition", "Classement et compétition"),
  );

  // أولوية 2: آخر مباراة.
  const last = lastPlayedFixture(s);
  const lastWidget = widget(
    "last-match",
    tr("آخر مباراة", "Last match", "Dernier match"),
    last
      ? (() => {
          const r = reportFor(s, last),
            own = r.home === s.clubId,
            ours = own ? r.homeGoals : r.awayGoals,
            theirs = own ? r.awayGoals : r.homeGoals;
          const result = ours > theirs ? tr("فوز", "Win", "Victoire") : ours === theirs ? tr("تعادل", "Draw", "Nul") : tr("خسارة", "Defeat", "Défaite");
          const tone = ours > theirs ? "green" : ours === theirs ? "" : "red";
          return `<div class="last-match-row"><div>${crest(r.home, "tiny")}<span>${clubBy(r.home).short}</span></div><b>${num(r.homeGoals)}–${num(r.awayGoals)}</b><div>${crest(r.away, "tiny")}<span>${clubBy(r.away).short}</span></div></div>
            <div class="dash-inline"><span class="${tone}">${result}</span><button class="text-button" data-action="match-report" data-id="${r.id}">${tr("التقرير الكامل", "Full report", "Rapport complet")}</button></div>`;
        })()
      : `<p class="muted">${tr("لم تلعب بعد.", "No matches played yet.", "Aucun match joué pour l’instant.")}</p>`,
    "world",
    tr("كل المباريات", "All matches", "Tous les matchs"),
  );

  // أولوية 3: الترتيب.
  const tableWidget = widget(
    "table",
    tr("موقفك في الدوري", "Your league position", "Votre place en championnat"),
    `<div class="dash-rank"><strong>#${num(rank)}</strong><span>${num(table.find((t) => t.clubId === s.clubId)?.points ?? 0)} ${tr("نقطة", "pts", "pts")}</span></div>
     ${table.slice(0, 3).map((t, i) => `<div class="table-mini-row ${t.clubId === s.clubId ? "own" : ""}"><small>${num(i + 1)}</small>${crest(t.clubId, "tiny")}<span>${clubBy(t.clubId).short}</span><b>${num(t.points)}</b></div>`).join("")}`,
    "world",
    tr("الترتيب الكامل", "Full table", "Classement complet"),
  );

  // أولوية 4: البريد — القرارات المطلوبة أولًا.
  const pendingIds = new Set(pending.map((m) => m.id));
  const inboxList = [...pending, ...s.inbox.filter((m) => !pendingIds.has(m.id))].slice(0, 3);
  const inboxWidget = widget(
    "inbox",
    `${tr("على مكتبك", "On your desk", "Sur votre bureau")} ${pending.length ? `<span class="count gold">${num(pending.length)}</span>` : ""}`,
    inboxList.length
      ? `<div class="desk-list">${inboxList
          .map(
            (m) => `<button class="desk-item" data-action="open-message" data-id="${m.id}">
              <div><strong>${esc(m.title)}</strong><span>${esc(String(m.body ?? "").slice(0, 80))}</span></div>
              <span class="desk-meta">${m.required && m.status === "open" ? badge(tr("قرار", "Decision", "Décision"), "gold") : shortDate(m.date)}</span></button>`,
          )
          .join("")}</div>`
      : `<p class="muted">${tr("لا شيء يحتاج انتباهك الآن.", "Nothing needs your attention now.", "Rien ne requiert votre attention.")}</p>`,
    "inbox",
    tr("كل البريد", "All mail", "Toute la boîte"),
  );

  // المنشآت: ثلاثة مرافق بمستوياتها.
  const facilitiesWidget = widget(
    "facilities",
    tr("استثمر في المستقبل", "Invest in the future", "Investir dans l’avenir"),
    `<div class="mini-facilities">${s.facilities
      .slice(0, 3)
      .map(
        (f) => `<button data-action="facility-detail" data-id="${f.id}" class="mini-facility">
          <span>${icon(FACILITIES.find((x) => x.id === f.id).icon, 26)}</span><h4>${f.name}</h4>
          <small>${f.project ? tr("تحت التطوير", "In progress", "En cours") : `${tr("المستوى", "Level", "Niveau")} ${num(f.level)} / 4`}</small></button>`,
      )
      .join("")}</div>`,
    "facilities",
    tr("كل المنشآت", "All facilities", "Toutes les installations"),
  );

  // الودجتات المشروطة: تظهر فقط حين يكون لها محتوى.
  const conditional = [
    boardCardView(s) && widget("board", tr("الجمعية", "Assembly", "Assemblée"), boardCardView(s), "board", tr("الجمعية العمومية", "Assembly", "Assemblée")),
    blackCardView(s) && widget("black", tr("الملفات السوداء", "Black files", "Dossiers noirs"), blackCardView(s), "black", tr("الملفات", "Files", "Dossiers")),
    awardsCardView(s) && widget("awards", tr("الجوائز", "Awards", "Récompenses"), awardsCardView(s), "awards", tr("الجوائز", "Awards", "Récompenses")),
  ].filter(Boolean).join("");

  return `${heading(
    tr("نظرة من أعلى", "Overview", "Vue d’ensemble"),
    `${tr("أهلًا", "Welcome", "Bienvenue")}، <span data-no-translate>${esc(s.owner)}</span>`,
    `${esc(c.name)} · ${tr("الموسم", "Season", "Saison")} ${num(s.seasonNumber)}`,
    `<span class="badge outline">${icon("calendar", 14)} ${shortDate(s.date)}</span>`,
  )}
  ${alertsView(s, deadline, pending)}
  ${onboardingView(s)}
  ${tiles}
  <div class="dash-grid">
    ${nextWidget}
    ${lastWidget}
    ${inboxWidget}
    ${tableWidget}
    ${facilitiesWidget}
    ${empireCardView(s)}
    ${conditional}
  </div>`;
}

// بطاقة القصر: رابط واحد داخلي (زر) بلا عنصر تفاعلي متداخل.
function empireCardView(s) {
  const e = s.empire;
  if (!e) return "";
  return `<section class="panel dash-widget empire-card" data-widget="empire">
    <div class="panel-head"><h3>🏰 ${tr("حياة الملياردير", "Empire life", "Vie de milliardaire")}</h3></div>
    <div class="empire-card-row">
      <span>💎 <strong>${money(e.personal)}</strong> <small>${tr("ثروتك الشخصية", "your personal fortune", "votre fortune personnelle")}</small></span>
      <span>💼 <strong>${money(s.finance.cash)}</strong> <small>${tr("خزينة النادي", "club treasury", "trésorerie du club")}</small></span>
    </div>
    <button class="dash-widget-link" data-nav="empire">${tr("افتح القصر", "Open the palace", "Ouvrir le palais")} ${icon("arrow", 14)}</button>
  </section>`;
}
