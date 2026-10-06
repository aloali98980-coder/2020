import {MARKETS} from "../data/worldMarkets.js";
import {tr,getLanguage} from "../i18n/index.js";
import {
  heading,
  crest,
  clubBy,
  badge,
  infoNote,
} from "../components/shared.js";
import { LEAGUES } from "../data/catalog.js";
import { sortedTable } from "../services/matches.js";
import { num, shortDate } from "../ui/format.js";
export function worldView(s, tab = "table") {
  const table = sortedTable(s),
    matches = s.fixtures.filter(
      (f) => f.home === s.clubId || f.away === s.clubId,
    );
  return `${heading("العالم أبعد من ناديك", "عالم الكرة", "نافس محليًا، وابحث عن فرص في الأسواق اللي اخترتها.")}<section class="panel database-notes"><strong>${num(s.leagues.length)} ${tr('أسواق انتقالات مفعّلة','enabled transfer markets','marchés de transferts actifs')}</strong><p>${s.leagues.map(id=>{const m=MARKETS.find(m=>m.id===id);return getLanguage()==='ar'?m?.nameAr:m?.name;}).join(' · ')}</p><button class="btn secondary" data-nav="database">${tr('كشف تغطية اللاعبين والمصادر','Player coverage & sources','Couverture des joueurs et sources')}</button></section><div class="filter-tabs"><button class="${tab === "table" ? "active" : ""}" data-action="world-tab" data-id="table">جدول الترتيب</button><button class="${tab === "fixtures" ? "active" : ""}" data-action="world-tab" data-id="fixtures">مباريات ناديك</button></div>${tab === "table" ? `<section class="panel"><div class="panel-head"><h3>الدوري المصري التجريبي</h3><span class="muted">٨ أندية · ١٤ جولة · ذهاب وعودة</span></div><div class="table-scroll"><table class="league-table"><thead><tr><th>#</th><th>النادي</th><th>لعب</th><th>فاز</th><th>تعادل</th><th>خسر</th><th>له</th><th>عليه</th><th>الفارق</th><th>النقاط</th></tr></thead><tbody>${table.map((t, i) => `<tr class="${t.clubId === s.clubId ? "own" : ""}"><td>${num(i + 1)}</td><td><span class="club-cell">${crest(t.clubId, "tiny")}<strong>${clubBy(t.clubId).name}</strong>${t.clubId === s.clubId ? badge("ناديك", "green") : ""}</span></td><td>${num(t.played)}</td><td>${num(t.wins)}</td><td>${num(t.draws)}</td><td>${num(t.losses)}</td><td>${num(t.gf)}</td><td>${num(t.ga)}</td><td dir="auto">${num(t.gf - t.ga)}</td><td class="points">${num(t.points)}</td></tr>`).join("")}</tbody></table></div></section>` : `<section class="panel fixture-list">${matches.map((f) => `<div class="fixture-row"><div class="fixture-date"><small>الجولة ${num(f.round)}</small><strong>${shortDate(f.date)}</strong></div><div class="fixture-teams"><span>${crest(f.home, "tiny")}<b>${clubBy(f.home).short}</b></span><strong class="score ${f.played ? "played" : ""}">${f.played ? `${num(f.homeGoals)} : ${num(f.awayGoals)}` : "— : —"}</strong><span><b>${clubBy(f.away).short}</b>${crest(f.away, "tiny")}</span></div>${badge(f.played ? "انتهت" : f.home === s.clubId ? "على ملعبك" : "خارج ملعبك", f.played ? "" : f.home === s.clubId ? "green" : "")}</div>`).join("")}</section>`}${infoNote("المواعيد والفرق والقواعد هنا إعداد اختبار وليست الموسم المصري الحقيقي. المحرك الحالي يحاكي النتائج والتذاكر والجاهزية؛ التكتيك المباشر والصعود والهبوط لم تُفعّل بعد. يبدأ جدول تجريبي جديد أول يوليو بعد اكتمال الجدول السابق.")}`;
}
