import { heading, button, badge, infoNote, empty, progress } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { num, money, esc, date, position } from "../ui/format.js";
import { extendedClub } from "../data/expandedCatalog.js";
import {
  LEGENDS,
  LEGEND_ROLES,
  LEGEND_GROUPS,
  legendById,
  legendCountryName,
} from "../data/legends.js";
import {
  activeLegendContracts,
  legendContractFor,
  legendCoachFor,
  legendRoles,
  legendQuote,
  legendImpact,
  legendBeneficiaries,
  legendReleaseCost,
  legendMatchBonus,
  LEGEND_PLAYER_YEARS,
  LEGEND_STAFF_YEARS,
  MAX_LEGEND_PLAYERS,
} from "../services/legends.js";

export const DEFAULT_LEGEND_FILTERS = { country: "all", group: "all", tier: "all", page: 1 };
const PAGE = 24;

const ATTRS = [
  ["pace", "سرعة"],
  ["shooting", "تسديد"],
  ["passing", "تمرير"],
  ["defending", "دفاع"],
  ["stamina", "لياقة"],
  ["decisions", "قرارات"],
];

const clubLabel = (id, fallback) =>
  `<bdi dir="auto">${esc(extendedClub(id)?.name || fallback || id)}</bdi>`;

const tierTone = (tier) => (tier.id === "icon" ? "gold" : tier.id === "legend" ? "green" : "");

function relation(s, legend) {
  const c = legendContractFor(s, legend.id);
  if (c) return badge("تحت التعاقد", "green");
  if (legend.rivalIds.includes(s.clubId)) return badge("غريم تاريخي — يرفض", "red");
  if (legend.clubIds.includes(s.clubId)) return badge("من بيت النادي · خصم ٢٥٪", "gold");
  return "";
}

function legendCard(s, l) {
  const role = LEGEND_ROLES[l.group];
  return `<article class="legend-card panel" data-legend="${l.id}"><div class="legend-card-head"><div><h3><bdi dir="auto">${esc(l.name)}</bdi></h3><small dir="ltr">${esc(l.nameLatin)}</small></div>${badge(l.tier.name, tierTone(l.tier))}</div><p class="legend-meta">${esc(l.countryName)} · ${position(l.position)} · ${esc(l.era)}</p><p class="legend-meta">تقدير الذروة <b>${l.peak}</b> · تخصص: ${esc(role.name)}</p><p class="legend-clubs">${l.clubs.length ? l.clubs.slice(0, 3).map((n, i) => clubLabel(l.clubIds[i], n)).join(" · ") : "منتخب ومسيرة محلية"}</p><div class="legend-card-foot">${relation(s, l)}${button("التفاصيل والتعاقد", "legend-detail", l.id, "secondary")}</div></article>`;
}

function contractCard(s, c) {
  const l = legendById(c.legendId);
  const role = LEGEND_ROLES[c.role];
  if (!l || !role) return "";
  let effect = "";
  if (c.kind === "coach") {
    const group = LEGEND_GROUPS[role.group];
    const who = legendBeneficiaries(s, c);
    effect = `<p>يستفيد <b>${num(who.length)}</b> لاعبًا (${esc(group.name)}) · قوة التأثير ${Math.round(legendImpact(l) * 100)}٪ · إضافة قوة المباراة +${(0.35 * legendImpact(l)).toFixed(2)}</p><p>جلسات منفذة <b>${num(c.sessions)}</b> · نقاط سمات مكتسبة <b>${num(Math.round(c.gains))}</b>${c.lastEffect ? ` · آخر شهر: ${num(c.lastEffect.sessions || 0)} جلسة (+${(c.lastEffect.gain || 0).toFixed(1)})` : ""}</p>`;
  } else if (c.kind === "ambassador") {
    effect = `<p>سمعة +٠٫١٥ وجماهير +١ شهريًا · دخل حقوق صورة متراكم <b>${money(c.income)}</b> ج.م${c.lastEffect?.income ? ` (آخر شهر ${money(c.lastEffect.income)})` : ""}</p>`;
  } else {
    const p = s.players.find((x) => x.id === c.playerId);
    effect = p
      ? `<p>عودة كلاعب: تقييم <b>${Math.round(p.rating)}</b> · ${num(p.appearances)} مباراة · ${num(p.goals)} هدف · لياقة ${Math.round(p.fitness)}٪</p><p class="muted">عقده يُدار من شاشة الفريق كأي لاعب؛ عند انتهائه يعتزل ويدخل قاعة الإرث.</p>`
      : "";
  }
  const actions =
    c.kind === "player"
      ? ""
      : `${button("تجديد", "legend-renew", c.id, "secondary")}${button("إنهاء العقد", "legend-release", c.id, "ghost")}`;
  return `<section class="panel legend-contract"><div class="legend-card-head"><div><h3><bdi dir="auto">${esc(l.name)}</bdi> · ${esc(role.name)}</h3><small>حتى ${date(c.end)} · راتب شهري ${money(c.salary)} ج.م · مقدم مدفوع ${money(c.fee)} ج.م</small></div>${badge(l.tier.name, tierTone(l.tier))}</div>${effect}<div class="legend-card-foot">${actions}</div></section>`;
}

function filterBar(s, f) {
  const countries = [...new Set(LEGENDS.map((l) => l.country))];
  const own = extendedClub(s.clubId);
  const mine = own?.country && countries.includes(own.country) ? own.country : null;
  const order = [
    ...(mine ? [mine] : []),
    "eg",
    ...countries.filter((c) => c !== "eg" && c !== mine).sort((a, b) => legendCountryName(a).localeCompare(legendCountryName(b), "ar")),
  ].filter((c, i, arr) => arr.indexOf(c) === i);
  const opt = (value, label, current) => `<option value="${value}" ${current === value ? "selected" : ""}>${label}</option>`;
  return `<div class="legend-filters"><label class="field"><span>الدولة</span><select id="legend-country">${opt("all", "كل الدول", f.country)}${order.map((c) => opt(c, `${legendCountryName(c)} (${LEGENDS.filter((l) => l.country === c).length})`, f.country)).join("")}</select></label><label class="field"><span>التخصص</span><select id="legend-group">${opt("all", "كل المراكز", f.group)}${Object.values(LEGEND_GROUPS).map((g) => opt(g.id, g.name, f.group)).join("")}</select></label><label class="field"><span>الفئة</span><select id="legend-tier">${opt("all", "كل الفئات", f.tier)}${opt("icon", "أيقونة عالمية (٩٤+)", f.tier)}${opt("legend", "أسطورة (٩٠–٩٣)", f.tier)}${opt("star", "نجم تاريخي", f.tier)}${opt("mine", "مرتبطون بناديك", f.tier)}</select></label></div>`;
}

export function filteredLegends(s, f) {
  return LEGENDS.filter(
    (l) =>
      (f.country === "all" || l.country === f.country) &&
      (f.group === "all" || l.group === f.group) &&
      (f.tier === "all" ||
        (f.tier === "mine" ? l.clubIds.includes(s.clubId) : l.tier.id === f.tier)),
  ).sort((a, b) => {
    const am = a.clubIds.includes(s.clubId) ? 1 : 0;
    const bm = b.clubIds.includes(s.clubId) ? 1 : 0;
    return bm - am || b.peak - a.peak;
  });
}

export function legendsView(s, filters = DEFAULT_LEGEND_FILTERS) {
  const f = { ...DEFAULT_LEGEND_FILTERS, ...filters };
  const L = s.legends;
  const active = activeLegendContracts(s);
  const monthly = active.reduce((n, c) => n + c.salary, 0);
  const list = filteredLegends(s, f);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const page = Math.min(Math.max(1, f.page || 1), pages);
  const shown = list.slice((page - 1) * PAGE, page * PAGE);
  const hall = L?.hall || [];
  const bonus = legendMatchBonus(s);
  return `${heading("الإرث لا يُشترى. يُبنى… ويُصقل بالأساطير.", "قاعة الأساطير", "تعاقد مع أساطير حقيقية معتزلة كمدربين متخصصين حسب مراكزهم، أو سفراء للنادي، أو — في وضع خيالي اختياري — كلاعبين يعودون للملاعب.")}<section class="legacy-hero panel"><div class="legacy-emblem">${icon("crown", 70)}</div><span class="eyebrow">HALL OF LEGENDS · 0.17</span><h2>أساطير حقيقية.<br><span class="gold">بأدوار حقيقية داخل ناديك.</span></h2><p>حارس أسطوري يدرّب حراسك، ومهاجم تاريخي يرفع إنهاء مهاجميك شهرًا بعد شهر ويبطئ تراجعهم مع العمر، وسفير يجلب سمعة ودخلًا. الأسماء حقيقية؛ التقييمات والأرقام المالية تقديرات تحريرية للعبة.</p><div class="preference-row legend-mode"><div><strong>وضع عودة الأساطير كلاعبين (خيالي)</strong><small>عند التفعيل يمكن التعاقد مع أسطورة لتلعب لك بعمر ٣١ (حراس ٣٤) بقدرات قريبة من ذروتها؛ بحد أقصى ${MAX_LEGEND_PLAYERS}.</small></div><label class="switch"><input type="checkbox" id="legend-player-mode" ${L?.playerMode !== false ? "checked" : ""}><span></span></label></div></section><div class="legacy-stats"><div class="panel"><span>${icon("crown", 28)}</span><strong>${num(active.length)}</strong><small>عقود أساطير نشطة</small></div><div class="panel"><span>${icon("finance", 28)}</span><strong>${money(monthly)}</strong><small>رواتب الأساطير شهريًا (ج.م)</small></div><div class="panel"><span>${icon("bolt", 28)}</span><strong>+${bonus.toFixed(2)}</strong><small>إضافة قوة المباراة من المدربين الأساطير</small></div></div><h2 class="section-title">أساطير تحت التعاقد</h2>${active.length ? `<div class="legend-contracts">${active.map((c) => contractCard(s, c)).join("")}</div>` : empty("لا توجد عقود أساطير بعد", "اختر أسطورة من الكتالوج أدناه؛ المقدم كبير لكن الأثر شهري ومستمر.", "crown")}<h2 class="section-title">كتالوج الأساطير <small class="muted">(${num(list.length)} من ${num(LEGENDS.length)})</small></h2>${filterBar(s, f)}<div class="legend-grid">${shown.map((l) => legendCard(s, l)).join("") || empty("لا نتائج", "غيّر الفلاتر.")}</div>${pages > 1 ? `<div class="legend-pager">${Array.from({ length: pages }, (_, i) => button(String(i + 1), "legend-page", String(i + 1), i + 1 === page ? "primary" : "ghost")).join("")}</div>` : ""}<h2 class="section-title">قاعة إرث ناديك في هذه الحفظة</h2>${hall.length ? `<div class="table-scroll"><table class="league-table legend-hall"><thead><tr><th>الاسم</th><th>المركز</th><th>مباريات</th><th>أهداف</th><th>تقييم الاعتزال</th><th>تاريخ الدخول</th></tr></thead><tbody>${hall.map((h) => `<tr><td><bdi dir="auto">${esc(h.name)}</bdi>${h.legendId ? " " + badge("أسطورة عائدة", "gold") : ""}</td><td>${position(h.position)}</td><td>${num(h.appearances)}</td><td>${num(h.goals)}</td><td>${Math.round(h.rating)}</td><td>${date(h.inducted)}</td></tr>`).join("")}</tbody></table></div>` : empty("الجدار ما زال فارغًا", "أي لاعب يعتزل في ناديك بعد ١٠٠ مباراة أو ٤٠ هدفًا أو بتقييم ٨٥+ يدخل هنا تلقائيًا، وكذلك كل أسطورة عادت ولعبت لك.", "shield")}${infoNote("الأسماء حقيقية لأساطير معتزلة؛ الذروة والسمات والأسعار والرواتب وردود القبول كلها تقديرات تحريرية لأغراض المحاكاة وليست بيانات رسمية ولا تصريحات من الأشخاص أو الأندية.")}`;
}

function attributeBars(attrs) {
  return `<div class="attribute-grid legend-attrs">${ATTRS.map(([k, label]) => `<div><span>${label}</span><b>${Math.round(attrs[k])}</b>${progress(attrs[k])}</div>`).join("")}</div>`;
}

export function legendDetailModal(s, legendId, selected = {}) {
  const l = legendById(legendId);
  if (!l) return `<h2>الأسطورة غير موجودة</h2>`;
  const roles = legendRoles(s, l);
  const role = roles.find((r) => r.id === selected.role) || roles[0];
  const yearsList = role.kind === "player" ? LEGEND_PLAYER_YEARS : LEGEND_STAFF_YEARS;
  const years = yearsList.includes(Number(selected.years)) ? Number(selected.years) : yearsList[0];
  const current = legendContractFor(s, l.id);
  let quote = null;
  let error = "";
  try {
    quote = legendQuote(s, l.id, role.id, years);
  } catch (e) {
    error = e.message;
  }
  const busyRole =
    role.kind === "coach" || role.kind === "ambassador" ? legendCoachFor(s, role.id) : null;
  const tone = quote?.status === "accepted" ? "green" : quote?.status === "countered" ? "gold" : "red";
  const statusText =
    quote?.status === "accepted" ? "يقبل" : quote?.status === "countered" ? "يطلب علاوة" : "يرفض";
  const canSign = quote && quote.status !== "refused" && !current && !busyRole;
  return `<span class="eyebrow">${esc(l.tier.name)} · ${esc(l.countryName)} · ${esc(l.era)}</span><h2><bdi dir="auto">${esc(l.name)}</bdi> <small dir="ltr" class="muted">${esc(l.nameLatin)}</small></h2><p class="muted">${position(l.position)} · مواليد ${l.born} · ذروة تقديرية <b>${l.peak}</b> · ${l.clubs.length ? l.clubs.map((n, i) => clubLabel(l.clubIds[i], n)).join(" · ") : "مسيرة محلية ومنتخب"}</p><p>${esc(l.bio)}</p>${attributeBars(l.attributes)}<p class="fine-print">التقييم والسمات تقدير تحريري لأغراض اللعبة. <a href="${esc(l.biographyUrl)}" target="_blank" rel="noopener">السيرة على ويكيبيديا</a>.</p>${relation(s, l)}${current ? `<div class="info-note">${icon("info", 17)}<span>مرتبط بعقد نشط معك (${esc(LEGEND_ROLES[current.role].name)}) حتى ${date(current.end)}.</span></div>` : ""}<form id="legend-offer-form" data-id="${l.id}"><div class="form-grid"><label class="field"><span>الدور</span><select name="role" id="legend-offer-role">${roles.map((r) => `<option value="${r.id}" ${r.id === role.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label><label class="field"><span>المدة</span><select name="years" id="legend-offer-years">${yearsList.map((y) => `<option value="${y}" ${y === years ? "selected" : ""}>${y === 1 ? "سنة واحدة" : y === 2 ? "سنتان" : `${y} سنوات`}</option>`).join("")}</select></label></div><p class="muted">${esc(role.description)}</p>${quote ? `<div class="calculation-box legend-quote"><div><span>المقدم</span><strong>${money(quote.fee)} ج.م</strong></div><div><span>الراتب الشهري</span><strong>${money(quote.salary)} ج.م</strong></div><div><span>إجمالي المدة</span><strong>${money(quote.total)} ج.م</strong></div><div><span>رد الأسطورة</span><strong>${badge(statusText, tone)}</strong></div><p>${esc(quote.reason)}</p>${role.kind === "coach" ? `<p>قوة التأثير ${Math.round(quote.impact * 100)}٪: فرصة جلسة شهرية لكل لاعب في المجموعة ${Math.round((0.45 + 0.25 * quote.impact) * 100)}٪ بمكسب ${(0.12 + 0.18 * quote.impact).toFixed(2)} في ${role.attributes.map((a) => ATTRS.find((x) => x[0] === a)[1]).join(" و")} · بطء التراجع العمري ١٢٪ · +${(0.35 * quote.impact).toFixed(2)} قوة مباراة.</p>` : ""}${role.kind === "ambassador" ? `<p>دخل حقوق صورة شهري تقديري ${money(Math.round((quote.salary * (0.5 + 0.3 * quote.impact)) / 1000) * 1000)} ج.م مقابل الراتب، مع سمعة +٠٫١٥ وجماهير +١ شهريًا.</p>` : ""}${role.kind === "player" ? `<p>يعود بعمر ${l.position === "GK" ? 34 : 31} وتقييم ${l.peak - (l.position === "GK" ? 3 : 4)}؛ يحتاج مكانًا في القائمة وضمن ميزانية المرتبات. ينتهي بالاعتزال ودخول قاعة الإرث.</p>` : ""}</div>` : `<div class="info-note">${icon("info", 17)}<span>${esc(error)}</span></div>`}${busyRole && !current ? `<div class="info-note">${icon("info", 17)}<span>لديك بالفعل ${esc(role.name)} أسطوري (${esc(legendById(busyRole.legendId)?.name || "")}); أنهِ عقده أولًا.</span></div>` : ""}<div class="modal-actions"><button type="submit" class="btn primary" ${canSign ? "" : "disabled"}>${quote?.status === "countered" ? "قبول العلاوة والتوقيع" : "توقيع العقد"}</button></div></form>`;
}

export function legendReleaseModal(s, contractId) {
  const c = (s.legends?.contracts || []).find((x) => x.id === contractId);
  const l = c && legendById(c.legendId);
  if (!c || !l) return `<h2>العقد غير موجود</h2>`;
  const cost = legendReleaseCost(s, contractId);
  return `<span class="eyebrow">إنهاء عقد أسطورة</span><h2><bdi dir="auto">${esc(l.name)}</bdi> · ${esc(LEGEND_ROLES[c.role].name)}</h2><p>التعويض شهران عن كل سنة متبقية: <b>${money(cost)} ج.م</b> يُخصم فورًا. يتوقف الأثر التدريبي من اليوم، ويمكنك التعاقد معه مجددًا لاحقًا بمقدم جديد.</p><div class="modal-actions">${button("تأكيد الإنهاء", "confirm-legend-release", c.id, "danger")}${button("تراجع", "close-modal", "", "ghost")}</div>`;
}

export function legendRenewModal(s, contractId) {
  const c = (s.legends?.contracts || []).find((x) => x.id === contractId);
  const l = c && legendById(c.legendId);
  if (!c || !l) return `<h2>العقد غير موجود</h2>`;
  return `<span class="eyebrow">تجديد عقد أسطورة</span><h2><bdi dir="auto">${esc(l.name)}</bdi> · ${esc(LEGEND_ROLES[c.role].name)}</h2><p class="muted">العقد الحالي حتى ${date(c.end)} · الراتب الشهري ${money(c.salary)} ج.م · مكافأة التجديد راتب شهر (${money(c.salary)} ج.م) تُخصم فورًا.</p><form id="legend-renew-form" data-id="${c.id}"><label class="field"><span>مدة التمديد</span><select name="years">${LEGEND_STAFF_YEARS.map((y) => `<option value="${y}" ${y === 1 ? "selected" : ""}>${y === 1 ? "سنة واحدة" : y === 2 ? "سنتان" : "٣ سنوات"}</option>`).join("")}</select></label><div class="modal-actions"><button type="submit" class="btn primary">اعتماد التجديد</button></div></form>`;
}
