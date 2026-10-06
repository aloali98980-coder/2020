import { esc, date } from "../../ui/format.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { asiaTable } from "../../services/asia/table.js";
import { ASIA_STAGES } from "../../services/asia/engine.js";
const club = (id) =>
  `<bdi dir="auto">${esc(extendedClub(id)?.name || id)}</bdi>`;
const reasons = {
  titleholder: "بطل البطولة / مسار حامل اللقب",
  "lower-title-path": "مسار لقب / وصافة البطولة الأدنى",
  "guest-reference": "ضيف من قائمة أندية حقيقية مرجعية",
  "scenario-reputation": "بداية المشوار بالسمعة",
  "domestic-results": "ترتيب محلي محفوظ",
  "preliminary-transfer": "منتقل بعد خسارة التمهيدي الأعلى",
};
const game = (f) =>
  `<article><small>${date(f.date)} · ${esc(ASIA_STAGES[f.stage] || f.stage)}${f.group ? " · " + esc(f.group) : ""} · ${f.neutral ? "موقع مجمع / محايد" : "ملعب صاحب الأرض"}</small><p>${club(f.home)} <b dir="ltr">${f.played ? f.homeGoals + "–" + f.awayGoals : "×"}</b> ${club(f.away)}</p>${f.extraTime ? "<small>وقت إضافي</small>" : ""}${f.penaltyWinner ? `<p>ترجيح <b dir="ltr">${f.penaltiesHome}–${f.penaltiesAway}</b> · ${club(f.penaltyWinner)}</p>` : ""}${f.winner ? "<p>المتأهل / البطل: " + club(f.winner) + "</p>" : ""}</article>`;
export function asiaCard(s, c) {
  return `<details class="panel continental-card" data-asia="${c.kind}"><summary><b>${esc(c.name)}</b><small>${c.winner ? "البطل: " + club(c.winner) : esc(c.phase === "groups" ? (c.kind === "afc" ? "مرحلة الدوري" : "دور المجموعات") : ASIA_STAGES[c.phase])}${c.entrants.includes(s.clubId) ? " · ناديك مشارك" : ""}</small></summary><p>${esc(c.format)}</p><details><summary>مقاعد ومواعيد محاكاة — القواعد والتفاصيل</summary><div class="info-note">صيغة لعب مبنية على 2026/27؛ ليست قائمة المشاركين المرخّصة أو روزنامة AFC الرسمية. توزيع المقاعد والتمهيدي والأوعية والجوائز تقديري. ضيوف البلدان غير المحمّلة أندية حقيقية بمحاكاة خفيفة، دون إضافة دوريات قابلة للاختيار أو قوائم لاعبين. نهائيات مفردة بمواقع محايدة نموذجية، ومجموعات التحدي مجمعة دون تحديد مضيف فعلي.</div><p>${c.kind === "afc" ? "القرعة: أربعة أعمدة؛ تستضيف العمود التالي وتزور السابق. لا خصم من نفس الاتحاد؛ لا يزيد اتحاد واحد على ثلاثة أندية في العمود. توزيع الأوعية بالسمعة داخل أعمدة قابلة للتنفيذ، وليس بمعامل AFC الرسمي. لا ملحق للمراكز 7–10 في صيغة هذا الموسم." : c.kind === "afc-two" ? "الخاسرون في تمهيدي النخبة ينتقلون للمجموعات هنا. بطل البطولة يدخل مسار النخبة في الموسم التالي؛ أهلية محلية أعلى لها الأولوية." : "الخاسرون في تمهيدي دوري الأبطال 2 ينتقلون للمجموعات هنا. بطل التحدي يدخل مجموعات دوري الأبطال 2 والوصيف مسار تمهيديه في النموذج؛ لا تمهيدي مستقل للتحدي حاليًا."}</p></details>${c.phase === "waiting" ? "<p>في انتظار نتائج التمهيدي الأعلى؛ لن نملأ المقاعد بأندية مكررة.</p>" : ""}${c.groups
    .map(
      (g) =>
        `<h4>${g.zone === "west" ? "غرب آسيا" : "شرق آسيا"}${c.kind === "afc" ? "" : " · المجموعة " + esc(g.id)}</h4><div class="table-scroll"><table class="league-table"><thead><tr><th>#</th><th>النادي</th><th>لعب</th><th>فارق</th><th>نقاط</th></tr></thead><tbody>${asiaTable(
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
    )}<p class="fine-print">${c.kind === "afc" ? "النقاط ثم الفارق والأهداف والانتصارات" : "النقاط ثم المواجهات المباشرة مع إعادة تطبيقها على المتعادلين الباقين، ثم الفارق والأهداف"}. ترجيح خاص عند بقاء ناديين متساويين ولعب آخر مباراة بينهما؛ ثم الانضباط والقرعة المحفوظة. سجل الانضباط على مستوى الفريق، وليس إيقافات فردية.</p>${Object.values(
    c.tableShootouts,
  )
    .map(
      (r) =>
        `<p>ترجيح حسم الترتيب (لا يغير نقاط التعادل): ${club(r.home)} <b dir="ltr">${r.homeScore}–${r.awayScore}</b> ${club(r.away)}</p>`,
    )
    .join(
      "",
    )}<details><summary>المشاركون ومسارات التأهل (${c.entrants.length})</summary>${c.qualification.map((q) => `<p>${club(q.clubId)} · ${q.zone === "west" ? "غرب" : "شرق"} · ${esc(reasons[q.reason])} · ${q.route === "direct" ? "دخول المجموعات" : "تمهيدي"}</p>`).join("")}</details>${Object.entries(
    c.regionDraws || {},
  )
    .map(
      ([z, d]) =>
        `<details><summary>أوعية قرعة ${z === "west" ? "الغرب" : "الشرق"} — تصنيف نموذجي</summary>${d.pots.map((pot, i) => `<p>وعاء ${i + 1}: ${pot.map(club).join(" · ")}</p>`).join("")}${d.columns ? d.columns.map((col, i) => `<p>عمود ${i + 1}: ${col.map(club).join(" · ")}</p>`).join("") : ""}</details>`,
    )
    .join(
      "",
    )}<p>الإقصائيات: لا أفضلية للهدف خارج الأرض؛ وقت إضافي ثم ترجيح عند التعادل. ${c.kind === "afc" ? "بطل النخبة وحده يمثل آسيا في الإنتركونتيننتال ويُسجل في دورة تأهل كأس العالم." : ""}</p><div class="europe-ties">${c.fixtures
    .filter((f) => f.stage !== "groups")
    .map(game)
    .join(
      "",
    )}</div><details><summary>كل المباريات (${c.fixtures.length})</summary>${c.fixtures.map(game).join("")}</details></details>`;
}
