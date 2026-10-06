import { esc, date } from "../../ui/format.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import {
  concacafTable,
  leaguesTable,
} from "../../services/concacaf/table.js";
import { CONCACAF_STAGES } from "../../services/concacaf/engine.js";
const club = (id) =>
  `<bdi dir="auto">${esc(extendedClub(id)?.name || id)}</bdi>`;
const reasons = {
  "scenario-reputation": "بداية المشوار بالسمعة",
  "domestic-results": "ترتيب محلي محفوظ",
  "domestic-champion": "بطل الدوري المحلي — إعفاء لثمن النهائي",
  "regional-champion": "بطل إقليمي — إعفاء لثمن النهائي",
  "regional-qualifier": "متأهل إقليمي للدور الأول",
  "guest-reference": "ضيف من قائمة أندية حقيقية مرجعية",
};
const routes = {
  r16: "إعفاء لثمن النهائي",
  r1: "الدور الأول",
  "phase-one": "المرحلة الأولى",
  groups: "المجموعات",
};
const game = (f) =>
  `<article><small>${date(f.date)} · ${esc(CONCACAF_STAGES[f.stage] || f.stage)}${f.group ? " · " + esc(f.group) : ""}${f.leg ? " · مباراة " + f.leg : ""}</small><p>${club(f.home)} <b dir="ltr">${f.played ? f.homeGoals + "–" + f.awayGoals : "×"}</b> ${club(f.away)}</p>${f.extraTime ? "<small>وقت إضافي</small>" : ""}${f.decidedBy === "away-goals" ? "<small>حُسم بأهداف خارج الأرض في الوقت الأصلي</small>" : ""}${f.penaltyWinner ? `<p>ترجيح <b dir="ltr">${f.penaltiesHome}–${f.penaltiesAway}</b> · ${club(f.penaltyWinner)}</p>` : ""}${f.winner ? "<p>المتأهل / البطل: " + club(f.winner) + "</p>" : ""}</article>`;
const table = (s, rows, title) =>
  `<h4>${esc(title)}</h4><div class="table-scroll"><table class="league-table"><thead><tr><th>#</th><th>النادي</th><th>لعب</th><th>فارق</th><th>نقاط</th></tr></thead><tbody>${rows
    .map(
      (r, i) =>
        `<tr class="${r.clubId === s.clubId ? "own" : ""}"><td>${i + 1}</td><td>${club(r.clubId)}</td><td>${r.played}</td><td dir="ltr">${r.gf - r.ga}</td><td>${r.points}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
export function concacafCard(s, c) {
  const tables =
    c.kind === "leagues-cup" && c.leagues
      ? table(s, leaguesTable(c, c.leagues.mx), "جدول الدوري المكسيكي") +
        table(s, leaguesTable(c, c.leagues.us), "جدول الدوري الأمريكي")
      : c.groups
          .map((g) =>
            table(
              s,
              concacafTable(c, g),
              c.groups.length > 1 ? "المجموعة " + g.id : "المجموعة",
            ),
          )
          .join("");
  return `<details class="panel continental-card" data-concacaf="${c.kind}"><summary><b>${esc(c.name)}</b><small>${c.winner ? "البطل: " + club(c.winner) : esc(CONCACAF_STAGES[c.phase] || c.phase)}${c.entrants.includes(s.clubId) ? " · ناديك مشارك" : ""}</small></summary><p>${esc(c.format)}</p><details><summary>مقاعد ومواعيد محاكاة — القواعد والتفاصيل</summary><div class="info-note">صيغة لعب مبنية على لوائح 2026؛ ليست قوائم المشاركين المرخّصة أو روزنامة Concacaf الرسمية. المقاعد الكندية وكؤوس أمريكا المحلية والأدوار التمهيدية للدرع غير ممثلة؛ تُستكمل من ترتيب الدوري. ضيوف أمريكا الوسطى والكاريبي أندية حقيقية بمحاكاة خفيفة، دون إضافة دوريات قابلة للاختيار أو قوائم لاعبين. النهائيات المفردة يستضيفها الأعلى تصنيفًا في النموذج.</div><p>${
    c.kind === "concacaf"
      ? "الدور الأول: 22 ناديًا، الأعلى تصنيفًا يستضيف الإياب. ثمن النهائي: المعفون الخمسة مع الفائزين بمواجهات أعلى 3 مصنفين يستضيفون الإياب. ربع ونصف النهائي والنهائي حسب سجل البطولة (النقاط ثم الفارق والأهداف والأهداف خارج الأرض والانتصارات ثم الانضباط والسمعة والقرعة). التعادل: أهداف خارج الأرض في الوقت الأصلي، ثم وقت إضافي لا تُحتسب فيه، ثم ترجيح. النهائي دون أفضلية خارج الأرض."
      : c.kind === "leagues-cup"
        ? "لا تعادلات: المتعادل في التسعين يذهب للترجيح مباشرة (الفوز الأصلي 3 نقاط، والفوز بالترجيح نقطتان، والخسارة به نقطة). الترتيب: النقاط ثم الانتصارات الأصلية ثم الفارق والأهداف وأقل استقبال ثم الانضباط. أول 4 من كل جدول لربع نهائي مفرد بقرعة ثابتة، ثم نصف نهائي ومباراة ثالث ونهائي. أول 3 يتأهلون لكأس الأبطال."
        : c.kind === "central-american"
          ? "المجموعات من دور واحد (مباراتان داخل ومباراتان خارج). الترتيب: النقاط ثم الفارق والأهداف ثم المواجهات المباشرة ثم الانضباط والسمعة والقرعة. ربع النهائي: 1×8 و4×5 و2×7 و3×6؛ الفائزون لنصف النهائي والخاسرون لملحق التأهل. 6 أندية تتأهل لكأس الأبطال والبطل معفى لثمن النهائي."
          : "المجموعتان من دور واحد. نصف النهائي: أول كل مجموعة مع وصيف الأخرى والفائز يستضيف الإياب. النهائي ومباراة الثالث ذهاب وإياب، والأعلى سجلًا يستضيف الإياب. أول 3 يتأهلون لكأس الأبطال والبطل معفى لثمن النهائي."
  }</p></details>${tables}<p class="fine-print">سجل الانضباط على مستوى الفريق، وليس إيقافات فردية. أهداف خارج الأرض تُحتسب من الوقت الأصلي فقط.</p>${c.pots ? `<details><summary>أوعية القرعة — تصنيف نموذجي</summary>${c.pots.map((pot, i) => `<p>وعاء ${i + 1}: ${pot.map(club).join(" · ")}</p>`).join("")}</details>` : ""}<details><summary>المشاركون ومسارات التأهل (${c.entrants.length})</summary>${c.qualification.map((q) => `<p>${club(q.clubId)} · ${esc(reasons[q.reason] || q.reason)} · ${esc(routes[q.route] || q.route)}</p>`).join("")}</details><div class="europe-ties">${c.fixtures
    .filter((f) => !["groups", "phase-one"].includes(f.stage))
    .map(game)
    .join(
      "",
    )}</div><details><summary>كل المباريات (${c.fixtures.length})</summary>${c.fixtures.map(game).join("")}</details></details>`;
}
