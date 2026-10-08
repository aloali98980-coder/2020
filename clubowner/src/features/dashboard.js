import { excerpt, tr } from "../i18n/index.js";
import { onboardingView } from "./onboarding.js";
import { boardCardView } from "./board.js";
import { blackCardView } from "./blackFiles.js";
import { lastPlayedFixture, reportFor } from "../services/matchReport.js";
import { ownFixtures } from "../services/calendar.js";
import { isDeadlineDay } from "../services/deadlineDay.js";
import { getDerbyInfo } from "../services/derby.js";
import { icon } from "../components/icons.js";
import { stadiumArt } from "../components/stadium.js";
import {
  heading,
  crest,
  clubBy,
  button,
  badge,
  statCard,
  progress,
} from "../components/shared.js";
import { money, num, shortDate, esc , cur} from "../ui/format.js";
import { wages, liabilities, forecast } from "../services/finance.js";
import { pendingActions } from "../services/inbox.js";
import { sortedTable } from "../services/matches.js";
import { FACILITIES } from "../data/catalog.js";
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
  const deadlineBanner = deadline
    ? `<div class="deadline-dashboard-banner">
        <span class="deadline-pulse-dot"></span>
        <div class="deadline-dashboard-copy">
          <strong>🚨 ${tr("يوم قفل القيد — أطول ليلة في الموسم", "Deadline Day — The Longest Night of the Season", "Date limite — La plus longue nuit de la saison")}</strong>
          <span>${tr("السوق يغلق الليلة عند منتصف الليل 23:59. صفقات عاجلة واتصالات أخيرة!", "Market closes tonight at midnight 23:59. Urgent deals and final calls!", "Le marché ferme ce soir à minuit 23h59. Offres urgentes et derniers contacts !")}</span>
        </div>
        <button class="btn primary small" data-nav="transfers">${tr("سوق الانتقالات", "Transfer Market", "Marché")}</button>
      </div>`
    : "";
  const nextDerby = next ? getDerbyInfo(next.home, next.away, s) : { isDerby: false };
  return `${heading("نظرة من أعلى", "أهلًا بك في مكتبك، <span data-no-translate>" + esc(s.owner) + "</span>", "الصورة الكاملة لناديك. والقرار القادم في إيدك.", `<span class="badge outline">${icon("flag", 14)} الموسم ${num(s.seasonNumber)}</span>`)}${deadlineBanner}<section class="hero-card"><div class="hero-art">${stadiumArt()}</div><div class="hero-copy"><span class="hero-kicker"><i></i> مشروع ${c.name}</span><h2>ابنِ النادي.<br>واصنع <span>التاريخ.</span></h2><p>الفريق يكسب مباراة. المؤسسة تبني إرثًا.</p><button class="btn light" data-nav="facilities">طوّر مشروعك ${icon("arrow", 17)}</button></div><div class="hero-bottom"><span>${icon("shield", 15)} ${esc(c.city)}${s.expansion ? "" : "، مصر"}</span><span>${icon("stadium", 15)} ${num(s.capacity)} مقعد</span><span>${icon("crown", 15)} تحت إدارتك</span></div><span class="hero-watermark">${tr("منذ ٢٠٢٦ · عهدك أنت", "SINCE 2026 · YOUR ERA", "DEPUIS 2026 · VOTRE ÈRE")}</span></section><div class="stats-grid">${statCard("السيولة المتاحة", money(s.finance.cash), cur(), `${icon("up", 14)} ${money(monthly.income)} إيراد تعاقدي خلال ٣٠ يومًا`, "finance", "green")}${statCard("مرتبات الفريق", money(wages(s)), cur() + " / شهر", `${num(Math.round((wages(s) / s.finance.wageBudget) * 100))}٪ من ميزانية المرتبات`, "squad")}${statCard("ثقة الجماهير", num(s.fanSupport), " / ١٠٠", `${icon("up", 14)} تتأثر بالنتائج داخل الملعب`, "shield", "green")}${statCard("التزامات مستقبلية", money(liabilities(s)), cur(), `${s.finance.obligations.filter((o) => o.status === "pending" && o.category !== "sponsor-income").length ? num(s.finance.obligations.filter((o) => o.status === "pending" && o.category !== "sponsor-income").length) + " دفعات مجدولة" : "لا أقساط مستحقة حاليًا"}`, "calendar", "gold")}</div><div class="dashboard-columns"><div class="dashboard-main">${onboardingView(s)}${boardCardView(s)}${blackCardView(s)}<section class="panel"><div class="panel-head"><h3>${icon("inbox")} على مكتبك اليوم ${pending.length ? `<span class="count gold">${num(pending.length)}</span>` : ""}</h3><button class="text-button" data-nav="inbox">كل البريد ${icon("arrow", 14)}</button></div><div class="desk-list">${s.inbox
    .slice(0, 3)
    .map(
      (m, i) =>
        `<button class="desk-item" data-action="open-message" data-id="${m.id}"><span class="desk-icon ${m.required && m.status === "open" ? "gold" : ""}">${icon(m.category === "sponsors" ? "sponsor" : m.category === "transfers" ? "transfer" : "inbox", 19)}</span><div><strong>${esc(m.title)}</strong><span>${excerpt(m.body, 82)}</span></div><span class="desk-meta">${m.required && m.status === "open" ? badge("قرار مطلوب", "gold") : shortDate(m.date)}${icon("arrow", 16)}</span></button>`,
    )
    .join(
      "",
    )}</div></section><section class="panel infrastructure"><div class="panel-head"><h3>${icon("building")} استثمر في المستقبل</h3><button class="text-button" data-nav="facilities">المنشآت ${icon("arrow", 14)}</button></div><div class="mini-facilities">${s.facilities
    .slice(0, 3)
    .map(
      (f) =>
        `<button data-action="facility-detail" data-id="${f.id}" class="mini-facility"><span>${icon(FACILITIES.find((x) => x.id === f.id).icon, 28)}</span><h4>${f.name}</h4><small>${f.project ? "تحت التطوير" : "المستوى " + num(f.level) + " من ٤"}</small><div class="level-bars">${[1, 2, 3, 4].map((i) => `<i class="${i <= f.level ? "filled" : ""}"></i>`).join("")}</div></button>`,
    )
    .join(
      "",
    )}</div></section></div><div class="dashboard-side">${(() => { const f = lastPlayedFixture(s); if (!f) return ""; const r = reportFor(s, f), own = r.home === s.clubId, ours = own ? r.homeGoals : r.awayGoals, theirs = own ? r.awayGoals : r.homeGoals; return `<section class="panel last-match"><div class="panel-head"><h3>${tr("آخر مباراة", "Last match", "Dernier match")}</h3><span class="${ours > theirs ? "green" : ours === theirs ? "" : "red"}">${ours > theirs ? tr("فوز", "Win", "Victoire") : ours === theirs ? tr("تعادل", "Draw", "Nul") : tr("خسارة", "Defeat", "Défaite")}</span></div><div class="last-match-row"><div>${crest(r.home, "tiny")}<span>${clubBy(r.home).short}</span></div><b>${num(r.homeGoals)}–${num(r.awayGoals)}</b><div>${crest(r.away, "tiny")}<span>${clubBy(r.away).short}</span></div></div><small class="muted">${esc(r.competition)}${r.stage ? " · " + esc(r.stage) : ""}</small><button class="btn secondary full" data-action="match-report" data-id="${r.id}">${icon("play", 16)} ${tr("التقرير الكامل", "Full report", "Rapport complet")}</button></section>`; })()}<section class="panel next-match"><div class="panel-head"><h3>المباراة القادمة</h3>${badge(next?.competition || (s.expansion ? "الدوري المحلي" : "دوري تجريبي"))}</div>${next ? `${nextDerby.isDerby ? `<div class="next-derby-badge">🔥 ${tr(nextDerby.nameAr || "مباراة ديربي", nextDerby.nameEn || "Derby Match", nextDerby.nameFr || "Match de Derby")} · ${tr("تذاكر مضاعفة", "Doubled tickets", "Billets doublés")}</div>` : ""}<div class="match-label">الجولة ${num(next.round)} · ${shortDate(next.date)}</div><div class="match-teams"><div>${crest(next.home, "large")}<strong>${clubBy(next.home).short}</strong></div><span>VS<small>محاكاة مبسطة</small></span><div>${crest(next.away, "large")}<strong>${clubBy(next.away).short}</strong></div></div><div class="match-venue">${icon("stadium", 15)} ${next.neutral ? "ملعب محايد" : next.home === s.clubId ? (nextDerby.isDerby ? "على ملعبك · ديربي وتذاكر مضاعفة" : "على ملعبك · دخل تذاكر") : "خارج ملعبك"}</div><button class="btn secondary full" data-nav="world">الجدول والمنافسة ${icon("arrow", 16)}</button>` : '<div class="empty-state"><h3>لا مباراة مؤكدة قادمة</h3><p>تُضاف مواجهات الكؤوس بعد تأكيد التأهل؛ يبدأ الموسم الجديد بعد اكتمال المنافسات.</p></div>'}</section><section class="panel quick-table"><div class="panel-head"><h3>موقفك في الدوري</h3><span class="green">#${num(rank)}</span></div>${table
    .slice(0, 3)
    .map(
      (t, i) =>
        `<div class="table-mini-row ${t.clubId === s.clubId ? "own" : ""}"><small>${num(i + 1)}</small>${crest(t.clubId, "tiny")}<span>${clubBy(t.clubId).short}</span><b>${num(t.points)}</b></div>`,
    )
    .join(
      "",
    )}<button class="text-button full" data-nav="world">الترتيب الكامل ${icon("arrow", 14)}</button></section></div></div>`;
}
