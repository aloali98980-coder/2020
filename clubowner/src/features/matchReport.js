// واجهة تقرير المباراة 0.22b — نافذة عريضة: النتيجة، مجريات المباراة، أرقام تقديرية، وتقييمات الفريق.
import { icon } from "../components/icons.js";
import { crest, clubBy } from "../components/shared.js";
import { avatar } from "../components/shared.js";
import { getDerbyInfo } from "../services/derby.js";
import { esc, num, shortDate } from "../ui/format.js";
import { getLanguage, tr } from "../i18n/index.js";

const playerName = (s, id) => {
  const p = s.players.find((x) => x.id === id);
  if (!p) return "";
  return getLanguage() === "ar" ? p.name : p.nameLatin || p.name;
};
const eventText = (s, e, report) => {
  const our = e.clubId === s.clubId;
  if (e.type === "goal") {
    const assist = e.assistId ? playerName(s, e.assistId) : "";
    return our
      ? tr(
          `هدف ${playerName(s, e.playerId) || "ناديك"}!${assist ? ` (أسيست: ${assist})` : ""}`,
          `Goal ${playerName(s, e.playerId) || "your club"}!${assist ? ` (assist: ${assist})` : ""}`,
          `But ${playerName(s, e.playerId) || "votre club"} !${assist ? ` (passe: ${assist})` : ""}`,
        )
      : tr(
          `هدف لصالح ${clubBy(e.clubId)?.name || "المنافس"}`,
          `Goal for ${clubBy(e.clubId)?.name || "the opposition"}`,
          `But pour ${clubBy(e.clubId)?.name || "l'adversaire"}`,
        );
  }
  if (e.type === "yellow")
    return tr(
      `بطاقة صفراء — ${playerName(s, e.playerId)}`,
      `Yellow card — ${playerName(s, e.playerId)}`,
      `Carton jaune — ${playerName(s, e.playerId)}`,
    );
  if (e.type === "red")
    return tr(
      `بطاقة حمراء — ${playerName(s, e.playerId)}`,
      `Red card — ${playerName(s, e.playerId)}`,
      `Carton rouge — ${playerName(s, e.playerId)}`,
    );
  return tr(
    `تبديل: دخول ${playerName(s, e.playerId)} بدلًا من ${playerName(s, e.out)}`,
    `Substitution: ${playerName(s, e.playerId)} on for ${playerName(s, e.out)}`,
    `Remplacement : ${playerName(s, e.playerId)} remplace ${playerName(s, e.out)}`,
  );
};
const statRow = (label, ours, theirs, unit = "") => {
  const total = Math.max(1, ours + theirs);
  return `<div class="mr-stat"><b>${num(ours)}${unit}</b><div class="mr-stat-mid"><span>${label}</span><div class="mr-bar"><i style="width:${Math.round((ours / total) * 100)}%"></i></div></div><b>${num(theirs)}${unit}</b></div>`;
};
export function matchReportModal(s, r) {
  const home = r.home === s.clubId,
    ours = home ? r.homeGoals : r.awayGoals,
    theirs = home ? r.awayGoals : r.homeGoals,
    result = ours > theirs
      ? tr("فوز", "Win", "Victoire")
      : ours === theirs
        ? tr("تعادل", "Draw", "Nul")
        : tr("خسارة", "Defeat", "Défaite");
  const tone = ours > theirs ? "green" : ours === theirs ? "" : "red";
  const derby = r.isDerby ? { isDerby: true, nameAr: r.derbyName } : getDerbyInfo(r.home, r.away, s);
  const isDerbyWin = derby.isDerby && ours > theirs;
  return `<div class="mr" data-report="${esc(r.id)}">
  <div class="mr-comp">${esc(r.competition)}${r.stage ? " · " + esc(r.stage) : ""}${derby.isDerby ? ` · <span class="badge red">${icon("crown", 12)} ${esc(derby.nameAr || tr("مباراة ديربي", "Derby Match", "Match de Derby"))}</span>` : ""}</div>
  ${isDerbyWin ? `<div class="mr-derby-banner">🔥 ${tr("انتصار تاريخي في الديربي! احتفالات المجد في المدينة", "Historic Derby Victory! Glory celebrations across the city", "Victoire historique au Derby ! Célébrations de gloire à travers la ville")}</div>` : ""}
  <div class="mr-score ${tone}">
    <div class="mr-team">${crest(r.home, "large")}<strong>${esc(clubBy(r.home)?.name || "")}</strong>${r.home === s.clubId ? `<small>${tr("ناديك", "Your club", "Votre club")}</small>` : ""}</div>
    <div class="mr-result"><b>${num(r.homeGoals)}<span>–</span>${num(r.awayGoals)}</b><em>${result}</em>${r.penaltyWinner ? `<small>${tr("حُسمت بالترجيح", "Decided on penalties", "Décidé aux tirs au but")}</small>` : r.extraTime ? `<small>${tr("بعد وقت إضافي", "After extra time", "Après prolongation")}</small>` : ""}</div>
    <div class="mr-team">${crest(r.away, "large")}<strong>${esc(clubBy(r.away)?.name || "")}</strong>${r.away === s.clubId ? `<small>${tr("ناديك", "Your club", "Votre club")}</small>` : ""}</div>
  </div>
  <div class="mr-meta">${icon("calendar", 15)} ${shortDate(r.date)} · ${r.neutral ? tr("ملعب محايد", "Neutral venue", "Terrain neutre") : home ? tr("على ملعبك", "Home", "À domicile") : tr("خارج ملعبك", "Away", "À l'extérieur")}${r.attendance ? " · " + tr(`حضور ${num(r.attendance)} مشجع`, `Attendance ${num(r.attendance)}`, `${num(r.attendance)} spectateurs`) : ""}</div>
  <div class="mr-columns">
    <section class="mr-box mr-timeline"><h4>${tr("مجريات المباراة", "Match events", "Faits du match")}</h4><ol>${r.events.map((e) => `<li class="${e.type} ${e.clubId === s.clubId ? "our" : "opp"}"><span class="mr-min">${num(e.min)}′</span><i class="mr-dot"></i><span>${esc(eventText(s, e, r))}</span></li>`).join("") || `<li class="quiet">${tr("مباراة هادئة بلا أحداث مسجلة.", "A quiet match with no recorded events.", "Un match calme sans fait notable.")}</li>`}</ol></section>
    <section class="mr-box mr-stats"><h4>${tr("الأرقام", "Key numbers", "Les chiffres")}</h4>${statRow(tr("الاستحواذ", "Possession", "Possession"), r.stats.possession, 100 - r.stats.possession, "٪")}${statRow(tr("التسديدات", "Shots", "Tirs"), r.stats.ourShots, r.stats.oppShots)}${statRow(tr("على المرمى", "On target", "Cadrés"), r.stats.ourOn, r.stats.oppOn)}${statRow(tr("الركنيات", "Corners", "Corners"), r.stats.ourCorners, r.stats.oppCorners)}${statRow(tr("الأخطاء", "Fouls", "Fautes"), r.stats.ourFouls, r.stats.oppFouls)}</section>
  </div>
  <section class="mr-box mr-ratings"><h4>${tr("تقييمات الفريق", "Player ratings", "Notes des joueurs")}</h4><div class="mr-rating-grid">${r.ratings.map((x) => { const p = s.players.find((y) => y.id === x.playerId); return p ? `<div class="mr-player ${x.mvp ? "mvp" : ""}">${avatar(p, true)}<span><strong>${esc(getLanguage() === "ar" ? p.name : p.nameLatin || p.name)}</strong><small>${esc(p.position)}${x.goals ? " · " + (x.goals === 1 ? tr("هدف", "1 goal", "1 but") : num(x.goals) + tr(" أهداف", " goals", " buts")) : ""}</small></span><b class="${x.rating >= 7.5 ? "green" : x.rating < 5.5 ? "red" : ""}">${x.rating.toFixed(1)}</b>${x.mvp ? `<em>${tr("أفضل لاعب", "MVP", "MVP")}</em>` : ""}</div>` : ""; }).join("")}</div></section>
  <p class="mr-note">${icon("info", 15)} ${tr("الأحداث والأرقام والتقييمات إعادة عرض تقديرية حتمية لنتيجة المحاكاة، وليست محاكاة تفصيلية داخل المباراة.", "Events, numbers and ratings are a deterministic replay of the simulated result, not a detailed in-match simulation.", "Événements, chiffres et notes sont une relecture déterministe du résultat simulé, pas une simulation détaillée.")}</p></div>`;
}
