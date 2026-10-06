import { asiaCard } from "./asia/cards.js";
import { concacafCard } from "./concacaf/cards.js";
import { fifaCard, fifaOverview } from "./fifa/cards.js";
import { competitionCard } from "./competitions/cards.js";
import { loansPanel } from "./management/loans.js";
import { tacticsPanel } from "./management/tactics.js";
import { europeanCard, calendarCard } from "./europe/cards.js";
import { BUSINESSES, ticketForecast } from "../services/commerce.js";
import { COACHES, coachYearsLeft } from "../services/clubManagement.js";
import { ownDivision, standings } from "../services/pyramid.js";
import {
  extendedClub,
  DIVISIONS,
  EXPANDED_CLUBS,
  PYRAMID_COVERAGE,
} from "../data/expandedCatalog.js";
import { MARKETS } from "../data/worldMarkets.js";
import { heading, infoNote, button, badge } from "../components/shared.js";
import { money, esc, num, date } from "../ui/format.js";
const clubName = (id) =>
  `<bdi dir="auto">${esc(extendedClub(id)?.name || id)}</bdi>`;
const disabled = () =>
  infoNote(
    "هذه الأنظمة تتطلب حفظة جديدة مع تفعيل «العالم الموسع»؛ الحفظات السابقة محفوظة دون تغيير منافساتها.",
  );
export function expandedSetup(selected, config) {
  const c = extendedClub(selected) || extendedClub("ahly"),
    country = c.country || "eg",
    tier = c.tier || 1,
    ds = DIVISIONS.filter((d) => d.country === country),
    groups = ds.filter((d) => d.tier === tier),
    current = groups.find((d) => d.clubs.includes(selected)) || groups[0];
  return `<section class="panel expansion-setup"><h3>طريقة المشوار</h3><label class="field">نظام العالم<select id="setup-career-mode"><option value="classic" ${!config.expanded ? "selected" : ""}>المنافسة التجريبية القديمة</option><option value="expanded" ${config.expanded ? "selected" : ""}>عالم موسع 0.20 — اقتصاد وبطولات وأساطير ومسيرة طويلة</option></select></label>${config.expanded ? `<label class="field">البلد<select id="setup-region">${MARKETS.map((m) => `<option value="${m.id}" ${country === m.id ? "selected" : ""}>${esc(m.nameAr)}</option>`).join("")}</select></label><label class="field">الدرجة المتاحة<select id="setup-tier">${[...new Set(ds.map((d) => d.tier))].map((t) => `<option value="${t}" ${tier === t ? "selected" : ""}>الدرجة ${t}</option>`).join("")}</select></label><label class="field">البطولة / المجموعة<select id="setup-group">${groups.map((d) => `<option value="${d.id}" ${current?.id === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label><label class="field">النادي<select id="setup-expanded-club">${(current?.clubs || []).map((id) => `<option value="${id}" ${selected === id ? "selected" : ""}>${esc(extendedClub(id).name)}</option>`).join("")}</select></label><p class="muted">أندية حقيقية ولاعبون مولّدون في الدرجات الأقل. مصر: الثانية أ 20 ناديًا، والثانية ب 5 مجموعات تضم 70 اسمًا بعد التوفيق بين تقارير متعارضة؛ ليست شهادة تسجيل رسمي. المستوى الرابع المصري غير مضاف. إجمالي ${DIVISIONS.filter((d) => d.tier > 1).length} مسابقة أقل في ${new Set(DIVISIONS.filter((d) => d.tier > 1).map((d) => d.country)).size} سوقًا. ${esc(PYRAMID_COVERAGE.find((r) => r.country === country)?.note || "")} <a href="/lower-data-license.html" target="_blank" rel="noopener">المصادر والحدود ↗</a> التواريخ والاقتصاد بالجنيه نماذج محاكاة.</p>` : ""}</section>`;
}
export function commerceView(s) {
  if (!s.commerce) return disabled();
  const c = s.commerce,
    f = ticketForecast(s);
  return `${heading("التجارة والخدمات", "مصادر دخل النادي", "الربح بعد التكلفة، وليس كل إيراد مكسبًا.")}<div class="expansion-grid"><section class="panel"><h3>تذاكر ومتجر</h3><form id="commerce-prices"><label class="field">التذكرة العادية<input name="ticket" type="number" min="20" max="1000" value="${s.ticketPrice}" required></label><label class="field">قميص النادي<input name="shirt" type="number" min="200" max="1500" value="${c.shirtPrice}" required></label><button class="btn primary">اعتماد الأسعار</button></form><p>توقع الحضور: ${num(Math.round(f.attendance * 0.9))}–${num(f.attendance)} · إيراد أساسي متوقع ${money(f.gross)} ج.م.</p><p>المشتركون: ${num(c.seasonTickets)} — يُخصمون من المقاعد المدفوعة بكل مباراة.</p>${button("بيع اشتراكات الموسم (خصم 25٪)", "sell-subscriptions")}<p class="muted">الدوري فقط، دون الكؤوس. حجز حتى 18٪ من السعة مرة واحدة بالموسم؛ لخمسة لقاءات متبقية على الأقل.</p></section><section class="panel"><h3>مخزون المتجر</h3><p>${num(c.inventory)} قميصًا · تكلفة الوحدة ${money(c.shirtCost)} ج.م.</p><form id="shop-stock"><label class="field">كمية الشراء<input name="quantity" type="number" min="10" max="2000" value="100" required></label><button class="btn secondary">شراء المخزون</button></form><hr><h3>ودية تجارية</h3><p>تكلفة 120 ألفًا · دخل متوقع ${money(Math.round(s.capacity * s.ticketPrice * 0.12))} · إجهاد 8 نقاط. مرة كل 30 يومًا وبعيدًا عن موعد رسمي بثلاثة أيام.</p>${button("تنظيم الودية", "commercial-friendly")}</section></div><h2>أنشطة المؤسسة</h2><div class="expansion-grid">${Object.entries(
    BUSINESSES,
  )
    .map(
      ([id, b]) =>
        `<section class="panel"><h3>${b.name}</h3><p>التأسيس ${money(b.setup)} · التشغيل الشهري ${money(b.cost)} ج.م.</p><p>السمعة المطلوبة ${b.rep} / 100</p>${c.businesses.includes(id) ? badge("يعمل", "green") : button("فتح النشاط", "business-open", id)}</section>`,
    )
    .join(
      "",
    )}</div><section class="panel"><h3>التسوية الشهرية للأنشطة</h3>${c.history.map((h) => `<p>${date(h.date)}: تدفق نقدي ${money(h.net)} ج.م. · ربح تشغيلي ${money(h.operatingProfit ?? h.net)} ج.م. بعد تكلفة القمصان المباعة. لا يشمل استثمار التأسيس.</p>`).join("") || "<p>تظهر بعد أول تسوية.</p>"}</section>`;
}
export function coachContractModal(s, id, mode) {
  const c =
    mode === "renew" ? s.management.coach : COACHES.find((x) => x.id === id);
  const old = s.management.coach;
  const cost = mode === "renew" ? c.salary : (old?.salary || 0) * 2 + c.salary;
  return `<span class="eyebrow">${mode === "renew" ? "تجديد عقد المدرب" : "تعيين مدرب جديد"}</span><h2>${esc(c.name)} · ${esc(c.style)}</h2><p class="muted">كفاءة ${num(c.skill)} · راتب شهري ${money(c.salary)} ج.م. ${mode === "renew" ? `مكافأة التجديد ${money(c.salary)} ج.م تُخصم فورًا.` : `تكلفة التعيين الآن ${money(cost)} ج.م (فسخ السابق + توقيع شهر).`}</p><form id="coach-form" data-id="${c.id}" data-mode="${mode}"><label class="field"><span>مدة العقد</span><select name="years"><option value="1">سنة واحدة</option><option value="2" selected>سنتان</option><option value="3">٣ سنوات</option></select></label><p class="muted">التعويض عند الإقالة شهران عن كل سنة متبقية. انتهاء العقد دون تجديد يُخلي المنصب تلقائيًا.</p><div class="modal-actions"><button type="submit" class="btn primary">${mode === "renew" ? "اعتماد التجديد" : "اعتماد التعيين"}</button></div></form>`;
}
export function managementView(s) {
  if (!s.management) return disabled();
  const m = s.management,
    own = s.players.filter(
      (p) => p.clubId === s.clubId && p.status !== "retired",
    ),
    foreign = s.players
      .filter(
        (p) =>
          p.clubId !== s.clubId &&
          p.status !== "retired" &&
          !p.loan &&
          p.age <= 24 &&
          p.rating <= 72 &&
          extendedClub(p.clubId) &&
          p.contractEnd > s.date,
      )
      .slice(0, 100);
  return `${heading("المالك مستمر", "مركز الإدارة الرياضية", "اختيار المدرب والتشكيل والصفقات الصادرة. المدربون هنا شخصيات خيالية.")}<section class="panel"><h3>المدرب الحالي: ${esc(m.coach?.name || "دون مدرب")}</h3><p>الأجر ${money(m.coach?.salary || 0)} ج.م. شهريًا · ثقة ${num(m.coach?.confidence || 0)}${m.coach ? ` · العقد حتى ${date(m.coach.contractEnd || s.date)}` : ""}</p>${m.coach ? button(`إقالة — تعويض ${coachYearsLeft(s) * 2} شهرًا`, "dismiss-coach", "", "danger") + button("تجديد العقد", "renew-coach", "", "soft") : ""}<div class="expansion-grid">${COACHES.map((c) => `<div><h4>${esc(c.name)}</h4><p>${c.style} · كفاءة ${c.skill} · راتب ${money(c.salary)}</p>${button("تعيين — توقيع شهر + فسخ السابق", "appoint-coach", c.id)}</div>`).join("")}</div></section>${tacticsPanel(s)}${loansPanel(s)}<section class="panel"><h3>الخطة والتشكيل</h3><p>التشكيل الفارغ يفوّض الأفضل للمدرب. الاختيار اليدوي يؤثر على القوة والمشاركة؛ غير المتاح دوليًا أو للإصابة يُستبعد.</p><select id="team-tactic">${[
    ["balanced", "متوازن"],
    ["attack", "هجومي"],
    ["defend", "دفاعي"],
  ]
    .map(
      ([id, t]) =>
        `<option value="${id}" ${m.tactic === id ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select><p>${num(m.lineup.length)} / 11 مختارين — التشكيل أقل من 11 يُستكمل آليًا.</p><div class="lineup-list">${own.map((p) => `<button class="lineup-player ${m.lineup.includes(p.id) ? "chosen" : ""}" data-action="toggle-lineup" data-id="${p.id}"><b>${esc(p.name)}</b><span>${esc(p.position)} · ${num(Math.round(p.rating))}${p.internationalUntil ? " · مع المنتخب" : ""}${p.injuryUntil >= s.date ? " · مصاب" : ""}</span></button>`).join("")}</div></section><section class="panel"><h3>عروض شراء لاعبيك</h3>${
    m.outgoing
      .slice(-8)
      .reverse()
      .map(
        (o) =>
          `<article><p>${esc(s.players.find((p) => p.id === o.playerId)?.name || "")} ← ${clubName(o.buyer)} · ${money(o.fee)} ج.م. · ${esc(o.status)}</p>${o.status === "open" ? button("موافقة", "bid-accept", o.id) + button("رفض", "bid-reject", o.id) : ""}</article>`,
      )
      .join("") || "<p>تصل عروض نموذجية منتصف الشهر. لا بيع دون موافقتك.</p>"
  }</section><section class="panel"><h3>إعارة تطويرية / تقرير كشف</h3><p>اختيار سريع لشباب السوق؛ بقية اللاعبين من ملفاتهم. الإعارة الآن عرض ثم رد وموافقة. التقرير 10 آلاف ويعرض نطاق إمكانات.</p><select id="prospect-id">${foreign.map((p) => `<option value="${p.id}">${esc(p.name)} · ${num(p.age)} · ${num(Math.round(p.rating))}</option>`).join("")}</select>${button("التفاوض على إعارة", "incoming-loan")}${button("شراء تقرير", "prospect-report")}${m.lastScout ? `<p>${esc(m.lastScout.name)}: مستوى ${num(m.lastScout.rating)} · إمكانات تقديرية ${esc(m.lastScout.potentialRange.join("–"))}</p>` : ""}</section>`;
}
export function pressView(s) {
  if (!s.press) return disabled();
  const p = s.press;
  return `${heading("صحافة خيالية · أحداث من حفظتك", "غرفة الصحافة", "التصريحات لا تغيّر القدرات مباشرة. الوعود تُراجع في نهاية الموسم.")}<section class="panel"><p>مصداقية الإدارة ${num(p.trust)} / 100</p>${button(p.delegate ? "إلغاء تفويض الردود" : "تفويض الردود الروتينية بلا تعليق", "press-delegate")}<p>الدعم: ثقة المدرب +5 والجماهير +1. المطالبة: الجماهير +2 ووعد بإنهاء الموسم في النصف الأعلى. عدم التعليق بلا مكافأة.</p></section>${p.questions
    .filter((q) => !q.answered)
    .map(
      (q) =>
        `<section class="panel"><h3>${esc(q.text)}</h3>${button("دعم المدرب", "press-support", q.id)}${button("وعد بالنصف الأعلى", "press-demand", q.id)}${button("لا تعليق", "press-quiet", q.id)}</section>`,
    )
    .join(
      "",
    )}<section class="panel"><h3>سجل الوعود</h3>${p.promises.map((x) => `<p>موسم ${x.season}: النصف الأعلى — ${x.resolved ? (x.met ? "تحقق" : "لم يتحقق") : "قيد المتابعة"}</p>`).join("") || "<p>لا وعود مسجلة.</p>"}</section><section class="panel"><h3>ملخص الصحافة</h3>${p.news.map((n) => `<article class="press-item"><small>${date(n.date)} · ${esc(n.type)}</small><h3>${esc(n.title)}</h3></article>`).join("") || "<p>تظهر الأخبار مع تقدم الوقت.</p>"}</section>`;
}
export function competitionsView(s, selected) {
  if (!s.expansion) return disabled();
  const x = s.expansion,
    d = x.divisions.find((d) => d.id === selected) || ownDivision(s);
  const matches = d.fixtures.filter(
    (f) => f.home === s.clubId || f.away === s.clubId,
  );
  return `${heading("عالم المحاكاة", "الدوريات والبطولات", "دوريات ودرجات وكؤوس، وأوروبا بمرحلة دوري وملحق وذهاب وإياب.")} ${infoNote("العالم والروزنامة والمقاعد والجوائز محاكاة. البطولات الأوروبية الجديدة تطبق البنية الأساسية من 36 ناديًا حتى النهائي، لا قائمة القبول أو التصفيات أو المعاملات الرسمية. أفريقيا وليبرتادوريس وسودأمريكانا لها مجموعات وإقصائيات؛ المقاعد والتأهل الأولي محاكاة. آسيا وكونكاكاف بصيغ لعب مبنية على اللوائح مع مقاعد وقرعة ومواعيد محاكاة. صيغتا FIFA الجديدتان منفصلتان؛ التأهل والمعاملات والمضيف والمواعيد محاكاة. الصعود الترتيبي الحالي معتمد ضمن نطاق اللعبة. الحفظة القديمة تُبقي صيغة موسمها الجاري حتى نهايته.")}<p><a class="text-button" href="/competition-notes.html" target="_blank" rel="noopener noreferrer">قواعد النسخة وحدود محاكاة البطولات ↗</a></p><section class="panel"><select id="division-view">${x.divisions.map((v) => `<option value="${esc(v.id)}" ${v.id === d.id ? "selected" : ""}>${esc(v.country)} · ${esc(v.name)}</option>`).join("")}</select><h3>${esc(d.name)}</h3><p class="muted">${x.promotionVersion === 2 ? esc(PYRAMID_COVERAGE.find((r) => r.country === d.country)?.note || "") : "قواعد الحفظة القديمة محفوظة؛ كتالوج 0.8 لا يستبدلها."}</p><p>${d.clubs.length} أندية · ${d.clubs.length * 2 - 2} مباراة لكل نادٍ · ${d.id === ownDivision(s).id ? "بطولة ناديك" : "محاكاة خفيفة بالخلفية"}</p><div class="table-scroll"><table class="league-table"><thead><tr><th>#</th><th>النادي</th><th>لعب</th><th>فارق</th><th>نقاط</th></tr></thead><tbody>${standings(
    d,
  )
    .map(
      (r, i) =>
        `<tr class="${r.clubId === s.clubId ? "own" : ""}"><td>${i + 1}</td><td>${clubName(r.clubId)}</td><td>${r.played}</td><td>${r.gf - r.ga}</td><td>${r.points}</td></tr>`,
    )
    .join(
      "",
    )}</tbody></table></div></section><section class="panel"><h3>مباريات ناديك في الدوري</h3><div class="compact-fixtures">${matches.map((f) => `<p>${date(f.date)} · ${clubName(f.home)} ${f.played ? f.homeGoals + "–" + f.awayGoals : "×"} ${clubName(f.away)}</p>`).join("") || "<p>اختر دوري ناديك.</p>"}</div></section>${calendarCard(s)}<h2>أوروبا — الدوري وطريق اللقب</h2>${x.cups
    .filter((c) => c.engine === "europe-v1")
    .map((c) => europeanCard(s, c))
    .join(
      "",
    )}<h2>أفريقيا وأمريكا الجنوبية والكؤوس المحلية والسوبر</h2><div class="expansion-grid">${x.cups
    .filter((c) => c.engine === "continental-v1")
    .map((c) => competitionCard(s, c))
    .join(
      "",
    )}</div><h2>آسيا — ثلاث بطولات ومسارات التأهل</h2><div class="expansion-grid">${
    x.cups
      .filter((c) => c.engine === "asia-v1")
      .map((c) => asiaCard(s, c))
      .join("") ||
    "<p>بطولات آسيا الجديدة تبدأ بعد نهاية الموسم المحفوظ القديم.</p>"
  }</div><h2>كونكاكاف — كأس الأبطال والبطولات الإقليمية</h2><div class="expansion-grid">${
    x.cups
      .filter((c) => c.engine === "concacaf-v1")
      .map((c) => concacafCard(s, c))
      .join("") ||
    "<p>بطولات كونكاكاف الجديدة تبدأ بعد نهاية الموسم المحفوظ القديم.</p>"
  }</div><h2>كأس العالم والإنتركونتيننتال</h2>${fifaOverview(s)}<div class="expansion-grid">${x.cups
    .filter((c) => c.engine === "fifa-v1")
    .map((c) => fifaCard(s, c))
    .join(
      "",
    )}</div><h2>الكؤوس الأخرى — صيغ مبسطة</h2><div class="expansion-grid">${x.cups
    .filter((c) => !c.engine)
    .map(
      (c) =>
        `<details class="panel"><summary><b>${esc(c.name)}</b><small>${c.winner ? "البطل: " + clubName(c.winner) : "متبقٍ " + c.alive.length + " · الجولة القادمة " + date(c.nextDate)}</small></summary><p>${c.entrants.includes(s.clubId) ? "ناديك مشارك" : "ناديك غير مشارك"} · ${esc(c.format)}</p>${(c.pendingMatches || []).map((f) => `<p>${date(f.date)} · ${clubName(f.home)} × ${clubName(f.away)}</p>`).join("")}${c.results
          .slice(-16)
          .map(
            (f) =>
              `<p>${clubName(f.home)} ${f.homeGoals}–${f.awayGoals} ${clubName(f.away)}${f.penaltyWinner ? " · ركلات ترجيح: " + clubName(f.penaltyWinner) : ""}</p>`,
          )
          .join("")}</details>`,
    )
    .join("")}</div>${(x.playoffs || [])
    .map(
      (p) =>
        `<section class="panel"><h3>${esc(p.name)}</h3><p>${p.legs === 2 ? "ذهاب وإياب — متأهل واحد" : "دور واحد — متأهلان؛ ملاعب محايدة في النموذج"}</p>${standings(
          p,
        )
          .map(
            (r, i) =>
              `<p>${i + 1}. ${clubName(r.clubId)} · ${r.points} نقطة · ${r.played} مباراة${p.winners.includes(r.clubId) ? " · صعد" : ""}</p>`,
          )
          .join("")}</section>`,
    )
    .join(
      "",
    )}<section class="panel"><p>مصر: ثلاثة مقاعد بين الممتاز والثانية أ في هذا السيناريو؛ الثانية ب تعتمد الملحق. توزيع الهابطين على المجموعات يحافظ على أحجامها وليس قرعة جغرافية رسمية. في نظام 0.8 يصعد مؤهل من كل مجموعة غير مصرية ثم أفضل التاليين بالنقاط لكل مباراة إذا بقيت مقاعد. الاحتياط لا يتجاوز سقفه أو فريقه الأول؛ عند الحد الأدنى غير المحاكى يُلغى التبادل المخالف بدل اختراع بديل. لا هبوط من الثانية ب لغياب مستوى رابع موثق. التعادل الكامل يحسم بالهوية الثابتة، لا مباراة فاصلة.</p><h3>المواسم السابقة</h3>${x.history.map((h) => `<p>موسم ${h.season}: ${esc(h.division)} · المركز ${h.rank}</p>`).join("") || "<p>يظهر الأرشيف بعد اكتمال أول موسم.</p>"}</section><section class="panel"><h3>آخر انتقالات أندية الكمبيوتر</h3>${
    x.aiTransfers
      .slice(0, 10)
      .map(
        (t) =>
          `<p>${esc(t.name)}: ${clubName(t.seller)} ← ${clubName(t.buyer)} · ${money(t.fee)}</p>`,
      )
      .join("") || "<p>تُعالج شهريًا ضمن ميزانيات مبسطة.</p>"
  }</section>`;
}
