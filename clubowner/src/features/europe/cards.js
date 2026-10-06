import { europeanTable } from "../../services/europe/table.js";
import { STAGES } from "../../services/europe/engine.js";
import { ownFixtures } from "../../services/calendar.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { esc, date } from "../../ui/format.js";
const club = (id) =>
  `<bdi dir="auto">${esc(extendedClub(id)?.name || id)}</bdi>`;
const score = (f) => (f.played ? `${f.homeGoals}–${f.awayGoals}` : "×");
function fixture(f, own) {
  return `<p class="${[f.home, f.away].includes(own) ? "own-fixture" : ""}"><small>${date(f.date)} · ${esc(STAGES[f.stage] || f.competition || "الدوري المحلي")}${f.leg ? " · " + (f.stage === "final" ? "نهائي" : f.leg === 1 ? "ذهاب" : "إياب") : ""}${f.neutral ? " · محايد" : ""}</small><br>${club(f.home)} <b dir="ltr">${score(f)}</b> ${club(f.away)}${f.extraTime ? " · وقت إضافي" : ""}${f.penaltyWinner ? ` · ترجيح ${Number.isInteger(f.penaltiesHome) ? `<b dir="ltr">${f.penaltiesHome}–${f.penaltiesAway}</b> ` : ""}${club(f.penaltyWinner)}` : ""}${f.originalDate ? "<small> · مؤجلة لمراعاة الراحة</small>" : ""}</p>`;
}
export function calendarCard(s) {
  const games = ownFixtures(s);
  return `<section class="panel unified-calendar"><h3>جدول ناديك — كل البطولات</h3><p>الدوري والكؤوس في مكان واحد. التواريخ محاكاة بفاصل لا يقل عن 3 أيام بين مواعيد المباريات الرسمية الجديدة، وليست روزنامة رسمية. القرعات التالية تُضاف بعد حسم التأهل.</p><div class="compact-fixtures">${games.map((f) => fixture(f, s.clubId)).join("") || "<p>لا مباريات مؤكدة.</p>"}</div></section>`;
}
export function europeanCard(s, c) {
  const rows = europeanTable(c),
    ours = c.entrants.includes(s.clubId),
    myRank = rows.findIndex((r) => r.clubId === s.clubId) + 1;
  const ownGames = c.fixtures.filter((f) =>
    [f.home, f.away].includes(s.clubId),
  );
  return `<details class="panel european-card" data-europe="${esc(c.kind)}"><summary><b>${esc(c.name)}</b><small>${esc(STAGES[c.phase])} · ${c.winner ? "البطل: " + club(c.winner) : "الموعد التالي " + date(c.nextDate)}${ours ? " · ناديك مشارك" : ""}</small></summary><p>${esc(c.format)}. ${c.kind === "uecl" ? "6" : "8"} خصوم مختلفين لكل فريق، بالتساوي على ملعبه وخارجه.</p><div class="info-note">المشاركون ${c.qualificationSource === "scenario-reputation" ? "سيناريو افتتاحي حسب سمعة الأندية داخل اللعبة، لا قائمة رسمية" : "من ترتيب الدوريات في الموسم السابق داخل حفظتك"}؛ المقاعد والمعاملات والجوائز محاكاة. لا تصفيات تمهيدية ولا انتقال للخاسر إلى مسابقة أخرى.</div><p class="qualification-key"><span class="green">1–8: ثمن النهائي مباشرة</span> · <span class="gold">9–24: الملحق</span> · 25–36: خروج${ours ? " · مركز ناديك " + myRank : ""}</p><p class="fine-print">اسحب الجدول أفقيًا لعرض بقية الإحصاءات.</p><div class="table-scroll"><table class="league-table european-table"><thead><tr><th>#</th><th>النادي</th><th>نقاط</th><th>لعب</th><th>فوز</th><th>تعادل</th><th>خسارة</th><th>له</th><th>عليه</th><th>فارق</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${r.clubId === s.clubId ? "own " : ""}${i < 8 ? "direct" : i < 24 ? "playoff" : "eliminated"}"><td>${i + 1}</td><td>${club(r.clubId)}</td><td><b>${r.points}</b></td><td>${r.played}</td><td>${r.wins}</td><td>${r.draws}</td><td>${r.losses}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gf - r.ga}</td></tr>`).join("")}</tbody></table></div><details><summary>كيف يُحسم التعادل في النقاط؟</summary><p>فارق الأهداف، الأهداف، الأهداف خارج الأرض، الانتصارات، الانتصارات خارج الأرض، مجموع نقاط الخصوم وفارقهم وأهدافهم، الأقل في نقاط الانضباط، ثم معامل النادي. المعامل والانضباط هنا نموذجان مولّدان، وليسَا أرقام UEFA الفعلية. قبل نهاية الدوري تُحسب إحصاءات الخصوم الذين لُعبت مواجهاتهم فقط.</p></details><details><summary>أوعية القرعة وأسباب المشاركة</summary>${c.pots.map((pot, i) => `<p><b>الوعاء ${i + 1}:</b> ${pot.map(club).join(" · ")}</p>`).join("")}<p>لا لقاءات من نفس البلد في مرحلة الدوري، ولا أكثر من خصمين من بلد أجنبي واحد. ${c.kind === "uecl" ? "خصم من كل وعاء؛ توازن الاستضافة بين كل زوج من الأوعية." : "خصمان من كل وعاء: واحد على ملعبك والآخر خارجه."} لا تُطبق هنا قيود البث أو تسلسل الاستضافة الرسمي.</p>${c.qualification.map((q) => `<p>${club(q.clubId)} · ${esc(q.country)} · مركز ${q.domesticRank}${c.qualificationSource === "scenario-reputation" ? " في ترتيب السمعة الافتتاحي" : " في الدوري السابق"} · معامل محاكاة ${c.coefficients[q.clubId]}</p>`).join("")}</details>${
    c.ties.length
      ? `<h3>طريق الأدوار الإقصائية</h3><p>مجموع الأهداف بلا أفضلية الهدف خارج الأرض؛ التعادل يقود لوقت إضافي ثم الترجيح. أرقام ركلات الترجيح منفصلة عن النتيجة. أفضلية إياب ربع/نصف النهائي تتبع مسار المصنف إذا أُقصي.</p><div class="europe-ties">${c.ties
          .map(
            (t) =>
              `<article><small>${esc(STAGES[t.stage])} · المسار ${t.pathSeed}</small><p><b>${club(t.a)} × ${club(t.b)}</b></p>${t.legs
                .map((id) =>
                  fixture(
                    c.fixtures.find((f) => f.id === id),
                    s.clubId,
                  ),
                )
                .join(
                  "",
                )}${t.winner ? `<p>المجموع <b dir="ltr">${t.aggregateA}–${t.aggregateB}</b> · ${t.stage === "final" ? "البطل" : "المتأهل"}: <b>${club(t.winner)}</b></p>` : ""}</article>`,
          )
          .join("")}</div>`
      : ""
  }<h3>${ours ? "مواجهات ناديك" : "أحدث النتائج والمواعيد"}</h3>${(ours ? ownGames : [...c.fixtures.filter((f) => f.played).slice(-9), ...c.fixtures.filter((f) => !f.played).slice(0, 9)]).map((f) => fixture(f, s.clubId)).join("")}<details><summary>جميع مباريات البطولة (${c.fixtures.length})</summary><div class="compact-fixtures">${c.fixtures.map((f) => fixture(f, s.clubId)).join("")}</div></details></details>`;
}
