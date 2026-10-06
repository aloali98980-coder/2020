import { intakeCost } from "../services/talent/academy.js";
import { POSITIONS } from "../services/talent/state.js";
import { FOCUSES } from "../services/talent/training.js";
import { MARKETS } from "../data/worldMarkets.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { button, badge } from "../components/shared.js";
import { esc, money, num, date , cur} from "../ui/format.js";
const focusName = {
  balanced: "شامل",
  pace: "السرعة",
  passing: "التمرير",
  shooting: "الإنهاء",
  defending: "الدفاع",
  stamina: "التحمل",
  decisions: "القرارات",
};
function reportCard(s, id) {
  const p = s.players.find((p) => p.id === id),
    r = s.talent.scouting.reports[id];
  if (!p) return "";
  return `<article class="panel"><h4>${esc(p.name)} · ${esc(p.position)}</h4><p>${num(p.age)} سنة · ${esc(extendedClub(p.clubId)?.name || p.clubId)}</p>${r ? `<p>المستوى ${r.rating.join("–")} · الإمكانات ${r.potential.join("–")}<br>الثقة ${num(r.confidence)}٪ · ${num(r.visits)} متابعة<br>السعر المقدر ${money(r.fee[0])}–${money(r.fee[1])} · الراتب ${money(r.salary)}</p><small>بتاريخ ${date(r.date)}؛ السعر والحالة الحالية قد يتغيران.</small>` : "<p>لا تقرير حديث؛ افتح متابعة.</p>"}<div>${button("الملف", "player-detail", id, "small secondary")}${button("متابعة 21 يومًا — 60 ألف", "talent-follow", id, "small secondary")}${button(s.talent.scouting.shortlist.includes(id) ? "إزالة من المختصرة" : "إضافة للمختصرة", "talent-shortlist", id, "small ghost")}</div></article>`;
}
export function talentView(s,selectedPlayer) {
  if (!s.talent) return "";
  const t = s.talent,
    a = t.academy,
    q = t.scouting,
    own = s.players.filter(
      (p) => p.clubId === s.clubId && p.status !== "retired",
    );
  const opts = (values, sel, label = (x) => x) =>
    values
      .map(
        (v) =>
          `<option value="${esc(v)}" ${v === sel ? "selected" : ""}>${esc(label(v))}</option>`,
      )
      .join("");
  const selected=own.find(p=>p.id===selectedPlayer)||own[0],plan=t.training[selected?.id]||{focus:"balanced",intensity:"normal"};
  return `<div class="talent-centre"><section class="panel"><span class="eyebrow">مركز المواهب</span><h2>من الاختبار إلى الفريق الأول</h2><p>دفعة واحدة كل موسم، تصل بعد 14 يومًا. عند وصولها لديك 90 يومًا للتقييم. لا مرتبات للفريق الأول قبل التصعيد؛ تكلفة البرنامج ${money(intakeCost(s))} ${cur()}. المستوى الأعلى يزيد حجم الدفعة، ومدرب الناشئين يحسن التقدير، ولا يضمن النجومية.</p>${a.pending ? badge("الدفعة قيد الاختبار حتى " + date(a.pending.due), "gold") : a.season === s.seasonNumber ? badge("استخدمت دفعة هذا الموسم") : button("بدء اختبارات الأكاديمية", "talent-intake", "", "primary")}<p>مكافأة التصعيد: راتب شهر، وعقد ثلاث سنوات بالراتب الموضح. اللاعب الذي يغادر ينتقل لسوق الأحرار بنفس هويته وتاريخه.</p></section><div class="expansion-grid">${a.candidates
    .map((c) => {
      const p = c.player;
      return `<article class="panel"><h3>${esc(p.name)}</h3><p>${esc(p.position)} · ${num(p.age)} سنة · مستوى ${num(Math.round(p.rating))}<br>إمكانات تقديرية ${c.range.join("–")} · راتب ${money(p.salary)} ${cur()}<br>التقييم حتى ${date(c.expires)}</p>${button("تصعيد وتوقيع", "talent-promote", p.id, "primary")}${button("السماح بالمغادرة", "talent-release", p.id, "ghost")}</article>`;
    })
    .join(
      "",
    )}</div><section class="panel"><h3>برامج التدريب الفردية</h3><p>المشاركة والمدرب والمنشآت والإصابات تؤثر في التطور. التدريب المكثف يزيد الإجهاد؛ صغار السن لا يتطورون بنفس السرعة. البرامج لا تضمن بلوغ الإمكانات.</p><form id="talent-training-form"><div class="form-grid"><label class="field">اللاعب<select id="talent-training-player" name="playerId">${own.map((p) => `<option value="${p.id}" ${p.id===selected?.id?"selected":""}>${esc(p.name)}</option>`).join("")}</select></label><label class="field">التركيز<select name="focus">${opts(FOCUSES, plan.focus, (v) => focusName[v])}</select></label><label class="field">الحمل<select name="intensity"><option value="light" ${plan.intensity==="light"?"selected":""}>خفيف</option><option value="normal" ${plan.intensity==="normal"?"selected":""}>عادي</option><option value="intense" ${plan.intensity==="intense"?"selected":""}>مكثف</option></select></label></div><button class="btn primary">حفظ البرنامج</button></form><div>${Object.entries(
    t.training,
  )
    .filter(([, p]) => p.focus !== "balanced" || p.intensity !== "normal")
    .map(
      ([id, p]) =>
        `<p>${esc(s.players.find((p) => p.id === id)?.name || "")} · ${focusName[p.focus]} · ${{ light: "خفيف", normal: "عادي", intense: "مكثف" }[p.intensity]}</p>`,
    )
    .join(
      "",
    )}</div></section><section class="panel"><h3>شبكة الكشافين</h3><p>مهمتان متزامنتان، حتى ستة تقارير لكل بحث. المتابعة تضيق نطاق التقدير ولا تغيّر قدرة اللاعب. الكشاف الخارجي متاح دون انتظار اعتزال موظف، وكشافك المعين يستخدم مهارته. الرسوم غير مستردة إذا غادر الكشاف قبل نهاية المهمة.</p><form id="talent-mission-form"><div class="form-grid"><label class="field">البلد<select name="country"><option value="all">كل الأسواق المحملة</option>${MARKETS.filter(
    (m) => s.leagues.includes(m.id),
  )
    .map((m) => `<option value="${m.id}">${esc(m.nameAr)}</option>`)
    .join(
      "",
    )}</select></label><label class="field">المركز<select name="position">${opts(["all", ...POSITIONS], "all", (v) => (v === "all" ? "كل المراكز" : v))}</select></label><label class="field">أقل عمر<input name="minAge" type="number" min="16" max="40" value="16" required></label><label class="field">أقصى عمر<input name="maxAge" type="number" min="16" max="40" value="23" required></label><label class="field">سقف قيمة اللاعب ${cur()}<input name="budget" type="number" min="0" max="10000000000" value="5000000" required></label><label class="field">المدة والتكلفة<select name="days"><option value="7">7 أيام — 25 ألف</option><option value="21">21 يومًا — 60 ألف</option></select></label><label class="field">الكشاف<select name="staffId"><option value="external">خدمة كشف خارجية</option>${s.staff
    .filter((p) => p.status === "employed" && p.role === "scout")
    .map(
      (p) =>
        `<option value="${p.id}">${esc(p.name)} · ${num(p.skills.scouting)}</option>`,
    )
    .join(
      "",
    )}</select></label></div><p>البحث المخصص في بلد أجنبي يضيف 15 ألفًا. البحث الشامل فحص مكتبي؛ ميزانية البحث ليست رسوم شراء اللاعبين.</p><button class="btn primary">إرسال المهمة</button></form>${q.missions
    .slice(-6)
    .reverse()
    .map(
      (m) =>
        `<p>${date(m.due)} · ${{ running: "قيد التنفيذ", complete: "اكتملت", cancelled: "توقفت" }[m.status]} · ${m.results.length} تقارير</p>`,
    )
    .join(
      "",
    )}</section><h3>القائمة المختصرة</h3><div class="expansion-grid">${q.shortlist.map((id) => reportCard(s, id)).join("") || "<p>أضف اللاعبين للمقارنة هنا.</p>"}</div><h3>أحدث التقارير</h3><div class="expansion-grid">${Object.values(
    q.reports,
  )
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((r) => !q.shortlist.includes(r.playerId))
    .slice(0, 12)
    .map((r) => reportCard(s, r.playerId))
    .join(
      "",
    )}</div><section class="panel"><h3>استمرارية العالم</h3><p>${num(t.world.created)} لاعبًا من أكاديميات الأندية · ${num(t.world.recruited)} تعاقدًا حرًا · ${num(t.world.renewed)} تجديدًا.</p><p>${num(s.players.length)} لاعبًا نشطًا · ${num(s.retired?.length || 0)} معتزلًا في الأرشيف · ${num(t.world.retiredUnattached || 0)} اعتزلوا دون نادٍ.</p><p>الأندية في الأسواق المحملة تعالج نقص القوائم والمراكز شهريًا وفق ميزانيات التوقيع. نموذج خفيف لا يحاكي كامل اقتصاد كل نادٍ؛ بحد 120 إضافة أو تعاقد حر شهريًا وحد 50 ألف لاعب نشط. المعتزلون ينتقلون إلى أرشيف مضغوط لا يُحتسب ضمن الحد ويحتفظ بأسمائهم وتاريخهم. تطور الصغار لدى الكمبيوتر تقريب تدريبي وفرص فنية، وليس سجل دقائق كاملًا.</p></section></div>`;
}
