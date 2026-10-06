import { groupTable } from "../../services/competitions/table.js";
import { STAGE_NAMES, policy } from "../../services/competitions/presets.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { esc, date } from "../../ui/format.js";
const club = (id) =>
  `<bdi dir="auto">${esc(extendedClub(id)?.name || id)}</bdi>`;
function game(f) {
  return `<p><small>${date(f.date)} · ${esc(STAGE_NAMES[f.stage] || f.stage)}${f.group ? " · مجموعة " + esc(f.group) : ""}${f.leg ? " · " + (f.leg === 1 ? "المواجهة الأولى" : "الإياب") : ""}${f.neutral ? " · محايد" : ""}</small><br>${club(f.home)} <b dir="ltr">${f.played ? f.homeGoals + "–" + f.awayGoals : "×"}</b> ${club(f.away)}${f.extraTime ? " · وقت إضافي" : ""}${f.penaltyWinner ? ` · ترجيح <b dir="ltr">${f.penaltiesHome}–${f.penaltiesAway}</b> · ${club(f.penaltyWinner)}` : ""}${f.decidedBy === "away-goals" ? " · أفضلية أهداف خارج الأرض" : ""}</p>`;
}
export function competitionCard(s, c) {
  const p = policy(c),
    owns = c.entrants.includes(s.clubId);
  return `<details class="panel continental-card" data-competition="${esc(c.kind)}" data-cup-id="${esc(c.id)}"><summary><b>${esc(c.name)}</b><small>${c.winner ? "البطل: " + club(c.winner) : esc(STAGE_NAMES[c.phase] || c.phase) + " · " + date(c.nextDate)}${owns ? " · ناديك مشارك" : ""}</small></summary><p>${esc(c.format)}</p><div class="info-note">${c.groups.length ? "أوعية القرعة حسب السمعة الداخلية، لا تصنيف الاتحاد الرسمي. المقاعد موزعة على الأسواق المتاحة، وليست قائمة الدخول الرسمية أو تصفيات كل الاتحاد. " : ""}${c.tableRule === "caf" ? "أفريقيا ممثلة بخمسة أسواق فقط، وحصصها هنا أعلى من الرسمية. " : ""}المشاركون ${c.qualificationSource === "scenario-reputation" ? "من سمعة البداية، وليسوا قائمة موسم حقيقي معتمدة" : "من نتائج الدوري والكأس المحفوظة داخل لعبتك"}. الجوائز بالجنيه والتواريخ تقديرات محاكاة.</div>${c.groups
    .map(
      (g) =>
        `<h4>المجموعة ${esc(g.id)}</h4><div class="table-scroll"><table class="league-table"><thead><tr><th>#</th><th>النادي</th><th>لعب</th><th>فارق</th><th>نقاط</th></tr></thead><tbody>${groupTable(
          c,
          g,
        )
          .map(
            (r, i) =>
              `<tr class="${r.clubId === s.clubId ? "own" : ""}"><td>${i + 1}</td><td>${club(r.clubId)}</td><td>${r.played}</td><td dir="ltr">${r.gf - r.ga}</td><td>${r.points}</td></tr>`,
          )
          .join("")}</tbody></table></div>`,
    )
    .join(
      "",
    )}${c.groups.length ? `<p>${c.kind === "suda" ? "الأول لثمن النهائي؛ الوصيف يواجه ثالث ليبرتادوريس في الملحق." : c.kind === "lib" ? "الأول والثاني لثمن النهائي؛ الثالث ينتقل لملحق سودأمريكانا." : "الأول والثاني لربع النهائي."}</p><p class="fine-print">المفاضلة تبدأ بالمواجهات المباشرة ثم الإحصاءات العامة؛ بطاقات أمريكا الجنوبية أرقام محاكاة، والقرعة الأخيرة ترتيب عشوائي ثابت محفوظ. ليست منظومة انضباط وإيقافات كاملة.</p>` : ""}<details><summary>المشاركون وأسباب التأهل</summary>${c.qualification.length ? c.qualification.map((q) => `<p>${club(q.clubId)} · ${esc(q.country)} · ${q.reason === "libertadores-third" ? "ثالث مجموعة ليبرتادوريس" : q.reason === "domestic-cup" ? "مسار الكأس المحلي" : "ترتيب محلي / سمعة البداية " + q.domesticRank}</p>`).join("") : c.entrants.map(club).join(" · ")}</details><p>حسم الإقصائيات: ${p.awayGoals ? "مجموع الأهداف ثم أهداف خارج الأرض ثم الترجيح، دون وقت إضافي." : c.kind === "domestic" ? "وقت إضافي ثم ترجيح عند تعادل المباراة أو مجموع المواجهتين؛ لا أفضلية هدف خارج الأرض." : c.kind === "recopa" ? "ذهاب وإياب بلا أفضلية هدف خارج الأرض؛ وقت إضافي ثم ترجيح في الإياب، وبطل ليبرتادوريس يستضيفه." : p.finalExtraTime ? "بلا أفضلية هدف خارج الأرض؛ الترجيح مباشرة في أدوار ما قبل النهائي، والوقت الإضافي في النهائي قبل الترجيح." : "ترجيح مباشر عند التعادل."}</p>${c.byes.length ? "<p>إعفاء هذه الجولة: " + c.byes.map(club).join(" · ") + "</p>" : ""}<div class="europe-ties">${c.ties.map((t) => `<article><small>${esc(STAGE_NAMES[t.stage] || t.stage)}</small>${t.legs.map((id) => game(c.fixtures.find((f) => f.id === id))).join("")}${t.winner ? `<p>المجموع <b dir="ltr">${t.aggregateA}–${t.aggregateB}</b> · المتأهل ${club(t.winner)}</p>` : ""}</article>`).join("")}</div><h4>${owns ? "مواجهات ناديك" : "أحدث النتائج والمواعيد"}</h4>${(owns ? c.fixtures.filter((f) => [f.home, f.away].includes(s.clubId)) : [...c.fixtures.filter((f) => f.played).slice(-6), ...c.fixtures.filter((f) => !f.played).slice(0, 6)]).map(game).join("")}<details><summary>كل مباريات البطولة (${c.fixtures.length})</summary><div class="compact-fixtures">${c.fixtures.map(game).join("")}</div></details></details>`;
}
