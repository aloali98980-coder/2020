import { marketBy } from "../data/worldMarkets.js";
import { provenance } from "../models/provenance.js";
import { getLanguage } from "../i18n/index.js";
import { clubBy } from "../components/shared.js";
import { tr } from "../i18n/index.js";
import { difficulty } from "../models/difficulty.js";
import {
  heading,
  avatar,
  badge,
  button,
  empty,
  infoNote,
} from "../components/shared.js";
import { icon } from "../components/icons.js";
import { esc, money, num, position, date , cur} from "../ui/format.js";
import { wages } from "../services/finance.js";
import { windowStatus } from "../services/market.js";
import { isDeadlineDay } from "../services/deadlineDay.js";
import { baseRangeForRating, CLAUSE_LEVELS } from "../services/releaseClause.js";
export function playersView(s, market = false, filters = {}) {
  let players = s.players.filter(
    (p) =>
      p.status !== "retired" &&
      (market ? p.clubId !== s.clubId : p.clubId === s.clubId),
  );
  const { search = "", pos = "all", league = "all" } = filters;
  players = players.filter(
    (p) =>
      (!search ||
        (p.name + " " + (p.nameLatin || ""))
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (pos === "all" ||
        (pos === "GK"
          ? p.position === "GK"
          : pos === "DEF"
            ? ["CB", "RB", "LB"].includes(p.position)
            : pos === "MID"
              ? ["DM", "CM", "AM"].includes(p.position)
              : ["ST", "LW", "RW"].includes(p.position))) &&
      (league === "all" || p.league === league),
  );
  const total = players.length,
    page = Math.max(
      0,
      Math.min(Number(filters.page) || 0, Math.ceil(total / 50) - 1),
    );
  const visible = players.slice(page * 50, page * 50 + 50);
  const isDeadline = market && isDeadlineDay(s);
  const deadlineBanner = isDeadline
    ? `<div class="deadline-market-banner">
        <div class="deadline-pulse-dot"></div>
        <div class="deadline-banner-info">
          <strong>🚨 ${tr("يوم قفل القيد — أطول ليلة في الموسم", "Deadline Day — The Longest Night of the Season", "Date limite — La plus longue nuit de la saison")}</strong>
          <span>⏳ ${tr("السوق يغلق الليلة عند منتصف الليل 23:59 بدقة · عروض متسارعة وفرص أخيرة", "Market strictly closes tonight at midnight 23:59 · Accelerated offers & final opportunities", "Fermeture stricte ce soir à minuit 23h59 · Offres accélérées et dernières opportunités")}</span>
        </div>
        <span class="badge red">${tr("الساعات الأخيرة", "Final hours", "Dernières heures")}</span>
      </div>`
    : "";

  return `${heading(market ? "العين على الصفقة القادمة" : "قلب مشروعك", market ? "سوق الانتقالات" : "الفريق الأول", market ? "ابحث، فاوض، ووازن تكلفة الصفقة على المدى الطويل." : "كل لاعب له دور. وكل عقد له أثر على مستقبل النادي.", badge(market ? "قوائم ٢٠٢٦/٢٧ — مراجعة أولية" : num(s.players.filter((p) => p.clubId === s.clubId).length) + " / " + num(s.squadLimit || 30) + " لاعبًا"))}${deadlineBanner}${market ? infoNote(windowStatus(s).label) + negotiationsPanel(s) : `<div class="squad-summary"><div>${icon("squad", 25)}<span>متوسط التقييم<strong>${num(Math.round(players.reduce((a, p) => a + p.rating, 0) / Math.max(players.length, 1)))}</strong></span></div><div>${icon("finance", 25)}<span>المرتبات الشهرية<strong>${money(wages(s))} <small>${cur()}</small></strong></span></div><div>${icon("shield", 25)}<span>متوسط الجاهزية<strong>${num(Math.round(players.reduce((a, p) => a + p.fitness, 0) / Math.max(players.length, 1)))}٪</strong></span></div></div>`}<section class="panel"><div class="player-filters"><label class="search-field">${icon("search", 19)}<input id="player-search" placeholder="ابحث باسم اللاعب…" value="${esc(search)}" aria-label="البحث عن لاعب"></label><select id="position-filter" aria-label="تصفية المركز">${[
    ["all", "كل المراكز"],
    ["GK", "حراسة المرمى"],
    ["DEF", "الدفاع"],
    ["MID", "الوسط"],
    ["ATT", "الهجوم"],
  ]
    .map(
      ([v, l]) =>
        `<option value="${v}" ${v === pos ? "selected" : ""}>${l}</option>`,
    )
    .join(
      "",
    )}</select>${market ? `<select id="league-filter" aria-label="تصفية السوق"><option value="all">كل الأسواق</option>${s.leagues.map((l) => `<option value="${l}" ${league === l ? "selected" : ""}>${getLanguage() === "ar" ? marketBy(l)?.nameAr : marketBy(l)?.name}</option>`).join("")}</select>` : ""}<span class="muted result-count">${num(players.length)} لاعب</span></div><div class="table-scroll"><table class="players-table"><thead><tr><th>اللاعب</th><th>المركز</th><th>العمر</th><th>التقييم</th><th>${market ? "القيمة المتوقعة" : "الجاهزية"}</th><th>المرتب / شهر</th><th></th></tr></thead><tbody>${visible.map((p) => `<tr><td><button class="player-name" data-action="player-detail" data-id="${p.id}">${avatar(p, true)}<span><strong>${esc(getLanguage() === "ar" ? p.name : p.nameLatin || p.name)}</strong><small>${esc(p.nationality)} · ${market ? esc(clubBy(p.clubId)?.name || { city: "مانشستر سيتي", nassr: "النصر" }[p.clubId] || p.clubName || p.clubId) : esc(p.role)}</small></span></button></td><td><span class="position-tag">${p.position}</span></td><td>${p.ageEstimated ? "~" : ""}${num(p.age)}</td><td><span class="rating ${p.rating >= 78 ? "excellent" : ""}">${num(Math.round(p.rating))}</span></td><td>${market ? money(p.value) + " " + cur() : `<div class="fitness-bar"><i style="width:${p.fitness}%"></i></div><small class="green">${num(p.fitness)}٪</small>`}</td><td>${money(p.salary)} <small>${cur()}</small></td><td>${button(market ? "تفاوض" : "الملف", market ? "transfer-offer" : "player-detail", p.id, "small " + (market ? "soft" : "ghost"))}</td></tr>`).join("")}</tbody></table>${!players.length ? empty("لا توجد نتائج", "جرّب اسمًا آخر أو غيّر الفلاتر.", "search") : ""}</div><div class="players-pagination"><button class="btn secondary small" data-action="players-page" data-id="${page - 1}" ${page <= 0 ? "disabled" : ""}>${tr("السابق", "Previous", "Précédent")}</button><span>${num(page + 1)} / ${num(Math.max(1, Math.ceil(total / 50)))} · ${num(total)} ${tr("لاعب", "players", "joueurs")}</span><button class="btn secondary small" data-action="players-page" data-id="${page + 1}" ${(page + 1) * 50 >= total ? "disabled" : ""}>${tr("التالي", "Next", "Suivant")}</button></div></section>${infoNote("الأسماء والأعمار مرجعية؛ القدرات والعقود والاعتزال والأحداث محاكاة وليست حقائق عن الأشخاص.")}`;
}
function negotiationsPanel(s) {
  const ns = s.negotiations.filter((n) =>
    ["waiting", "club-reply", "personal"].includes(n.stage),
  );
  if (!ns.length) return "";
  return `<div class="negotiation-strip">${ns
    .map((n) => {
      const p = s.players.find((p) => p.id === n.playerId);
      return `<button data-nav="inbox">${icon("transfer", 18)}<span>${esc(getLanguage() === "ar" ? p.name : p.nameLatin || p.name)}<small>${n.stage === "waiting" ? "في انتظار رد النادي" : n.stage === "club-reply" ? "وصل رد النادي · افتح البريد" : "اتفاق النادي تم · تفاوض على العقد"}</small></span>${badge("تفاوض نشط", "gold")}</button>`;
    })
    .join("")}</div>`;
}
export function playerDetail(s, p) {
  const src = provenance(p);
  const own = p.clubId === s.clubId;
  const attrs = {
    pace: "السرعة",
    passing: "التمرير",
    shooting: "التسديد",
    defending: "الدفاع",
    stamina: "التحمل",
    decisions: "القرارات",
  };
  const clause = p.contractTerms?.releaseClause || 0;
  const range = baseRangeForRating(p.rating);
  const clauseBlock = `<div class="effect-card"><h4>${tr("الشرط الجزائي", "Release clause", "Clause libératoire")}</h4><p>${clause > 0 ? `${money(clause)} ${cur()} — ${tr("سلم القيمة حسب التقييم", "Value ladder by rating", "Échelle par note")} ${money(range.min)}–${money(range.max)} ${cur()}` : tr("لا يوجد شرط جزائي — تفاوض عادي", "No release clause — normal negotiation", "Pas de clause — négociation normale")}</p>${!own && clause > 0 ? `<small>${tr("يمكن كسره بدفع فوري دفعة واحدة + التفاوض مع اللاعب مباشرة. أندية AI تكسر شروط لاعبيك أيضًا (كاش فوري + غضب جماهيري).", "Can be triggered by instant payment + direct negotiation. AI clubs also break your players' clauses (instant cash + fan fury).", "Peut être déclenchée par paiement comptant + négociation directe. Les clubs IA déclenchent aussi vos clauses (cash immédiat + fureur).")}</small><div class="modal-actions" style="margin-top:8px">${button("كسر الشرط الجزائي", "break-clause", p.id, "small primary")}</div>` : ""}</div>`;
  return `<div class="player-profile-head">${avatar(p)}<div><span class="eyebrow">${esc(p.nationality)} · ${tr("ملف اللاعب", "Player profile", "Profil du joueur")}</span><h2>${esc(getLanguage() === "ar" ? p.name : p.nameLatin || p.name)}</h2><p>${position(p.position)} · ${num(p.age)} سنة · القدم ${p.foot}</p></div><span class="rating big">${num(Math.round(p.rating))}</span></div><div class="profile-stats"><div><small>القيمة المتوقعة</small><strong>${money(p.value)} ${cur()}</strong></div><div><small>المرتب الشهري</small><strong>${money(p.salary)} ${cur()}</strong></div><div><small>نهاية العقد</small><strong>${date(p.contractEnd)}</strong></div></div>${clauseBlock}<h3 class="section-title">القدرات الفنية والبدنية</h3><div class="attribute-grid">${Object.entries(
    p.attributes,
  )
    .map(
      ([k, v]) =>
        `<div><span>${attrs[k]}</span><b>${num(Math.round(v))}</b><div class="progress"><span style="width:${Math.round(v)}%\"></span></div></div>`,
    )
    .join(
      "",
    )}</div><div class="profile-stats"><div><small>الجاهزية</small><strong>${num(p.fitness)}٪</strong></div><div><small>المعنويات</small><strong>${num(p.morale)}٪</strong></div><div><small>المشاركات / الأهداف</small><strong>${num(p.appearances)} / ${num(p.goals)}</strong></div></div><div class="career-player"><h3>مراجعة المسيرة والعمر</h3><p>${p.status === "retired" ? "اللاعب معتزل داخل هذه الحفظة. لا يمكن التعاقد معه كلاعب." : tr("التراجع البدني تدريجي ويختلف للحارس. القرارات الفنية قد تستقر أو تتحسن قبل تراجعها.", "Physical decline is gradual and later for goalkeepers. Decisions may improve before declining.", "Le déclin physique est progressif et plus tardif pour les gardiens. Les décisions peuvent progresser avant de décliner.")}</p><small>${p.birthDate ? tr("تاريخ الميلاد: ", "Date of birth: ", "Date de naissance : ") + esc(p.birthDate) : p.ageEstimated ? tr("العمر تقديري للمحاكاة؛ لا يتوفر تاريخ ميلاد موثق لهذا السجل.", "Estimated simulation age; no sourced birthday is available.", "Âge estimé pour la simulation ; date de naissance indisponible.") : tr("عمر مرجعي فقط؛ يوم الميلاد غير موثق.", "Reference age only; birthday unverified.", "Âge de référence uniquement ; anniversaire non vérifié.")}</small>${p.retirementPlan ? `<p class="gold">${tr("موعد الاعتزال المخطط", "Planned retirement", "Retraite prévue")}: ${date(p.retirementPlan.date)}</p>` : ""}${
    p.agingHistory?.length
      ? `<div class="aging-history">${p.agingHistory
          .slice(-4)
          .map(
            (h) => `<span>${h.date.slice(0, 7)}<b>${num(h.rating)}</b></span>`,
          )
          .join("")}</div>`
      : ""
  }</div>${s.expansion ? `<section class="effect-card"><h4>المنتخب — داخل هذه الحفظة فقط</h4><p>مشاركات دولية ${num(p.internationalCaps || 0)} · أهداف ${num(p.internationalGoals || 0)}</p>${p.internationalUntil ? `<p>مع المنتخب حتى ${date(p.internationalUntil)}</p>` : ""}</section>` : ""}${src.sourceUrl ? `<div class="source-link"><span>مصدر الاسم والقائمة</span><a href="${esc(src.sourceUrl)}" target="_blank" rel="noopener noreferrer">عرض المصدر ↗</a></div>` : ""}${p.scoutReport ? `<div class="effect-card"><h4>التقرير الكشفي</h4><p>${tr("نطاق الإمكانات", "Potential range", "Plage de potentiel")}: ${num(p.scoutReport.min)}–${num(p.scoutReport.max)} / 100</p></div>` : ""}${p.abilityVersion ? `<div class="ability-explainer"><strong>${src.abilityMethod === "editorial-estimate" ? tr("ضبط تقديري للاعب معروف", "Editorial star estimate", "Estimation éditoriale") : tr("محرك قدرات فردي", "Individual ability model", "Modèle individuel de qualités")}</strong><p>${tr("التقييم مبني على الدور والعمر ومستوى السوق وتنوع فردي ثابت. الاحترافية واللياقة الطبيعية والإمكانات صفات محاكاة وليست معلومات شخصية مؤكدة.", "Estimated from role, age, market level and stable individual variation. Professionalism, natural fitness and potential are simulated traits, not verified personal facts.", "Estimation selon rôle, âge, marché et variation individuelle stable. Professionnalisme, condition naturelle et potentiel sont simulés.")}</p></div>` : ""}${src.biographyUrl ? `<a class="text-button" href="${esc(src.biographyUrl)}" target="_blank" rel="noopener noreferrer">${tr("مصدر الميلاد", "Birthday source", "Source de naissance")} · CC0 ↗</a>` : ""}${infoNote("قدرات تقديرية للعبة وليست تقييمًا رسميًا.")}<div class="modal-actions">${s.expansion && p.status !== "retired" && !p.loan && s.expansion.divisions.some((d) => d.clubs.includes(p.clubId)) ? button("التفاوض على إعارة", "loan-open", p.id) : ""}${p.status !== "retired" ? button(own ? "تجديد العقد" : "تقديم عرض", own ? "renew-player" : "transfer-offer", p.id, "primary") : ""}</div>`;
}
export function offerForm(s, p) {
  const active = s.negotiations.find(
    (n) =>
      n.playerId === p.id &&
      ["waiting", "club-reply", "personal"].includes(n.stage),
  );
  if (active)
    return `<h2>تفاوض قائم بالفعل</h2><p class="muted">تابع الرد والتفاصيل من بريدك. لا يمكن إرسال عرضين متداخلين.</p><div class="modal-actions"><button class="btn primary" data-action="modal-inbox">افتح البريد</button></div>`;
  const clause = p.contractTerms?.releaseClause || 0;
  const clauseNote = clause > 0 ? `<div class="terms-note">${icon("info", 16)} ${tr("يوجد شرط جزائي", "Release clause exists", "Clause libératoire existante")}: ${money(clause)} ${cur()} — ${tr("يمكن كسره فورًا بدفع كامل + التفاوض مع اللاعب", "Can be triggered instantly by full payment + player negotiation", "Peut être déclenchée instantanément par paiement complet + négociation")}<br><button class="btn small primary" data-action="break-clause" data-id="${p.id}" style="margin-top:6px">${tr("كسر الشرط الجزائي الآن", "Break clause now", "Déclencher la clause maintenant")}</button></div>` : "";
  return `<span class="eyebrow">المرحلة ١ من ٢ · التفاوض مع النادي</span><h2>عرض انتقال ${esc(getLanguage() === "ar" ? p.name : p.nameLatin || p.name)}</h2><p class="muted">القيمة الاسترشادية ${money(p.value)} ${cur()}. النادي قد يطلب عرضًا مضادًا.</p>${clauseNote}<form id="offer-form" data-player="${p.id}"><div class="form-grid"><label class="field"><span>قيمة الانتقال — جنيه مصري</span><input type="number" name="fee" min="0" max="500000000" step="1" value="${p.value}" required></label><label class="field"><span>الدفعة المقدمة</span><select name="upfront"><option value="40">٤٠٪ والباقي ٣ أقساط</option><option value="60">٦٠٪ والباقي ٣ أقساط</option><option value="100">١٠٠٪ دفعة واحدة</option></select></label></div><div class="terms-note">${icon("calendar", 18)} الأقساط كل ٣٠ يومًا. عمولة الوكيل ٣٪ عند التوقيع (١٪ مع وكيل على المرتب)، وعقد اللاعب يتم التفاوض عليه بعد رد النادي.</div><div class="calculation-box" id="offer-summary"></div><div class="modal-actions"><button class="btn primary" type="submit">إرسال العرض ${icon("arrow", 17)}</button></div></form>`;
}
export function contractForm(s, ref, renew = false) {
  const n = renew ? null : s.negotiations.find((n) => n.id === ref),
    p = s.players.find((p) => p.id === (renew ? ref : n.playerId));
  const baseRange = baseRangeForRating(p.rating);
  const baseMid = Math.round((baseRange.min + baseRange.max) / 2);
  const clauseLevelsHtml = CLAUSE_LEVELS.map((lvl) => {
    const val = lvl.mult === 0 ? 0 : Math.round(baseMid * lvl.mult);
    return `<option value="${lvl.id}" data-clause="${val}" data-salary="${lvl.salaryFactor}">${lvl.id === "none" ? "بلا شرط (راتب ×0.85)" : lvl.id === "low" ? `شرط قليل ${money(val)} (راتب ×0.90)` : lvl.id === "normal" ? `شرط عادي ${money(val)} (راتب ×1.0)` : lvl.id === "high" ? `شرط عالٍ ${money(val)} (راتب ×1.15)` : `شرط عالٍ جدًا ${money(val)} (راتب ×1.30)`}</option>`;
  }).join("");
  return `<span class="eyebrow">${renew ? "الحفاظ على أصول النادي" : "المرحلة ٢ من ٢ · شروط اللاعب"}</span><h2>${renew ? "تجديد عقد" : "عقد"} ${esc(getLanguage() === "ar" ? p.name : p.nameLatin || p.name)}</h2><p class="muted">طلب اللاعب الاسترشادي: ${money(p.salary)} ${cur()} شهريًا. ${tr("اختيار مستوى الشرط الجزائي بمقايضة راتب", "Choose clause level trading salary", "Choisir niveau clause contre salaire")}</p><form id="contract-form" data-ref="${ref}" data-renew="${renew}"><div class="form-grid"><label class="field"><span>المرتب الشهري — ${cur()}</span><input type="number" name="salary" value="${Math.round(p.salary * (renew ? 1 : difficulty(s).wage))}" min="1" step="1" max="10000000" required></label><label class="field"><span>مدة العقد</span><select name="years">${[1, 2, 3, 4].map((y) => `<option value="${y}" ${y === 3 ? "selected" : ""}>${num(y)} ${y === 1 ? "سنة" : "سنوات"}</option>`).join("")}</select></label><label class="field"><span>مكافأة التوقيع — ${cur()}</span><input name="bonus" type="number" min="0" max="100000000" step="1" value="200000" required></label><label class="field"><span>الدور داخل الفريق</span><select name="role"><option>أساسي</option><option>مداورة</option><option>بديل</option><option>مشروع للمستقبل</option></select></label></div><h3 class="section-title">بنود تؤثر فعليًا</h3><div class="form-grid"><label class="field"><span>مكافأة المشاركة — ${cur()}</span><input name="appearanceBonus" type="number" min="0" max="500000" step="1" value="${p.contractTerms?.appearanceBonus || 0}"></label><label class="field"><span>مكافأة الهدف — ${cur()}</span><input name="goalBonus" type="number" min="0" max="1000000" step="1" value="${p.contractTerms?.goalBonus || 0}"></label><label class="field"><span>الزيادة السنوية ٪</span><input name="annualRaisePct" type="number" min="0" max="15" step="1" value="${p.contractTerms?.annualRaisePct || 0}"></label><label class="field"><span>مستوى الشرط الجزائي — ${cur()}</span><select name="clauseLevel" id="clause-level">${clauseLevelsHtml}</select></label><label class="field"><span>شرط جزائي — ${cur()} (صفر = لا يوجد)</span><input name="releaseClause" id="release-clause-input" type="number" min="0" max="2000000000" step="1" value="${p.contractTerms?.releaseClause || 0}"></label></div><div class="calculation-box" id="contract-summary"></div>${infoNote("مكافآت المشاركة والأهداف تُصرف عند المباريات، والزيادة السنوية تُطبق تلقائيًا. وعد الأساسي يُراجع بعد ٦٠ يومًا. شرط جزائي عالٍ = راتب أعلى مطلوب، شرط قليل = راتب أقل لكن قابل للخطف. سلم القيم: <70 2-5M / 70-74 5-12M / 75-79 12-30M / 80-84 30-80M / 85+ 80-150M+ مع مضاعفات (u21 ×1.5، عقد 3+ ×1.3، إسباني ×2، <سنة ×0.5، >30 ×0.7، 25% بلا شرط).")}<div class="modal-actions"><button class="btn primary" type="submit">${renew ? "توقيع التجديد" : "توقيع وإتمام الصفقة"} ${icon("check", 17)}</button></div></form>`;
}
