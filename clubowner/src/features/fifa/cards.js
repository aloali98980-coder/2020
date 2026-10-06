import { esc, date } from "../../ui/format.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { groupTable } from "../../services/competitions/table.js";
import { FIFA_STAGES } from "../../services/fifa/engine.js";
const club = (id) =>
  `<bdi dir="auto">${esc(extendedClub(id)?.name || id)}</bdi>`;
const labels = {
  ...FIFA_STAGES,
  "aap-playoff": "مواجهة أفريقيا/آسيا وأوقيانوسيا",
  americas: "ديربي الأمريكتين",
};
const reasons = {
  "continental-champion": "بطل قاري",
  "cycle-ranking": "ترتيب الدورة المحفوظ",
  "ofc-cycle-ranking": "ترتيب مسار أوقيانوسيا المحفوظ",
  "scenario-fill": "استكمال بالسمعة — لا سجل دورة كامل",
  "scenario-host": "مضيف السيناريو من الدوري الأمريكي",
};
function game(f) {
  return `<article><small>${date(f.date)} · ${esc(labels[f.matchCode || f.stage] || f.stage)}${f.group ? " · " + esc(f.group) : ""} · ${f.neutral ? "محايد" : "على ملعب صاحب الأرض"}</small><p>${club(f.home)} <b dir="ltr">${f.played ? f.homeGoals + "–" + f.awayGoals : "×"}</b> ${club(f.away)}</p>${f.extraTime ? "<small>وقت إضافي</small>" : ""}${f.penaltyWinner ? `<p>ترجيح <b dir="ltr">${f.penaltiesHome}–${f.penaltiesAway}</b> · ${club(f.penaltyWinner)}</p>` : ""}${f.winner ? "<p>المتأهل / البطل: " + club(f.winner) + "</p>" : ""}</article>`;
}
export function fifaCard(s, c) {
  return `<details class="panel continental-card" data-fifa="${esc(c.kind)}"><summary><b>${esc(c.name)} · ${c.editionYear}</b><small>${c.winner ? "البطل: " + club(c.winner) : esc(labels[c.phase] || c.phase)}${c.entrants.includes(s.clubId) ? " · ناديك مشارك" : ""}</small></summary><p>${esc(c.format)}</p><div class="info-note">${c.kind === "clubworld" ? `التأهل من نتائج ${c.editionYear - 4}–${c.editionYear - 1}. سنوات متاحة: ${c.cycleYears.join("، ") || "لا توجد بعد"}. المقاعد الناقصة تُستكمل بالسمعة مع بيان السبب، والتصنيف ليس معامل FIFA الرسمي. أمريكا مضيف سيناريو، وليست إعلانًا عن مضيف ${c.editionYear}.` : c.kind === "intercontinental" ? "ينتظر أبطال القارات الستة من الموسم الجاري داخل لعبتك، لا قائمة أسماء ثابتة ولا أصحاب ألقاب البطولات الثانوية. مواعيد نسبية بعد اكتمال الأبطال، وليست روزنامة ديسمبر الرسمية." : "مسار خفيف لسبعة أندية حقيقية من قائمة OFC؛ ليس الدوري الاحترافي الرسمي. ساوث ملبورن مستبعد من مقعد أوقيانوسيا لانتسابه إلى AFC. أوكلاند يحتفظ بهويته الحالية في الدوري الأسترالي، ولا ننسخ النادي أو لاعبيه. الأندية الستة الأخرى ضيوف كؤوس دون دوريات أو قوائم لاعبين تفصيلية."} الجوائز والمنشآت والأوعية والمواعيد تقديرات محاكاة. كونكاكاف ما زالت بصيغة مبسطة؛ بطل النخبة هو ممثل آسيا.</div>${c.phase === "waiting" ? "<p>لن تُجرى قرعة بديلة من أندية عشوائية؛ تبدأ البطولة عندما يُعرف الأبطال الستة.</p>" : ""}${c.kind === "intercontinental" ? "<p>أوقيانوسيا تواجه بطل آسيا أو أفريقيا بالتبادل السنوي، ثم البطل الآخر. بطل كونكاكاف يواجه بطل ليبرتادوريس في ديربي الأمريكتين. الفائزان يلعبان كأس التحدي؛ الفائز يواجه بطل أوروبا في النهائي.</p>" : ""}${c.groups
    .map(
      (g) =>
        `<h4>${c.kind === "ofc" ? "ترتيب مسار التأهل" : "المجموعة " + esc(g.id)}</h4><div class="table-scroll"><table class="league-table"><thead><tr><th>#</th><th>النادي</th><th>لعب</th><th>فارق</th><th>نقاط</th></tr></thead><tbody>${groupTable(
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
    )}${c.groups.length ? '<p class="fine-print">المواجهات المباشرة، وإعادة تطبيقها على المتعادلين المتبقين، ثم الفارق والأهداف والانضباط والقرعة المحفوظة. الانضباط موزون 1/3/4/5 وهو سجل فريق محاكى، لا إيقافات فردية.</p>' : ""}<details><summary>المشاركون ومسارات التأهل (${c.entrants.length})</summary>${c.qualification.length ? c.qualification.map((q) => `<p>${club(q.clubId)} · ${esc(q.region.toUpperCase())} · ${esc(reasons[q.reason] || q.reason)}${q.points !== undefined ? " · " + q.points + " نقطة نموذجية" : ""}${q.titleYears?.length ? " · ألقاب " + q.titleYears.join("، ") : ""}</p>`).join("") : c.entrants.map(club).join(" · ")}</details>${Object.entries(
    c.trophies,
  )
    .map(
      ([key, t]) => `<p>🏆 ${esc(labels[key] || key)}: ${club(t.winner)}</p>`,
    )
    .join(
      "",
    )}<p>تعادل الإقصائيات: وقت إضافي ثم ترجيح؛ لا أفضلية هدف خارج الأرض. ${c.kind === "clubworld" ? "لا مباراة للمركز الثالث؛ 63 مباراة حتى التتويج." : ""}</p><div class="europe-ties">${c.fixtures
    .filter((f) => f.stage !== "groups")
    .map(game)
    .join(
      "",
    )}</div><details><summary>كل المباريات (${c.fixtures.length})</summary>${c.fixtures.map(game).join("")}</details></details>`;
}
export function fifaOverview(s) {
  const f = s.expansion.fifa;
  return f
    ? `<section class="panel"><h3>البطولتان العالميتان — منفصلتان</h3><p>كأس العالم القادم: <b>${f.nextWorldYear}</b> · 32 ناديًا كل أربع سنوات. الإنتركونتيننتال: ستة أبطال كل موسم. استمرار صيغة 2025 للكأس الكبير اختيار محاكاة، لا اعتماد نهائي للوائح 2029.</p><p>دورات تأهل محفوظة: ${f.history.map((h) => h.year).join("، ") || "تُسجل بعد اكتمال أول موسم"}. لا نختلق نتائج لأعوام ما قبل بداية مشوارك.</p></section>`
    : '<section class="panel"><p>حفظة قديمة: بطولات FIFA الحالية ونتائجها محفوظة. الصيغ الجديدة ومسار أوقيانوسيا يبدأان بعد نهاية هذا الموسم.</p></section>';
}
