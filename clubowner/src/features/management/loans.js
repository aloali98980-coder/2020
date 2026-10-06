import { loanDestinations } from "../../services/loans.js";
import { marketOpen } from "../../services/market.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { button } from "../../components/shared.js";
import { esc, money, date , cur} from "../../ui/format.js";
const club = (id) => esc(extendedClub(id)?.name || id);
export function loanTerms(t) {
  return `${t.days} يومًا · رسوم ${money(t.fee)} ${cur()} · المستعير ${t.wageShare}٪ من الراتب · ${t.role === "starter" ? "أساسي" : "مداورة"} · ${t.recallAllowed ? "استدعاء مسموح بعد 60 يومًا" : "لا استدعاء مبكر"} · ${t.buyOption ? "خيار شراء " + money(t.buyOption) + " " + cur() : "بلا خيار شراء"}`;
}
export function loanReview(s, id) {
  const o = s.management.loanOffers.find((o) => o.id === id);
  return o
    ? `<h2>رد إعارة ${esc(s.players.find((p) => p.id === o.playerId)?.name || "")}</h2><p>${club(o.parent)} ← ${club(o.borrower)}</p><p>${loanTerms(o.counter || o.proposed)}</p><p>تنتهي مهلة الرد ${date(o.expires)}. الرسوم غير مستردة؛ العقد الحالي مستمر. المرتب محسوب في أول الشهر بلا توزيع يومي. خيار الشراء ملزم للمالك إذا فعّله المستعير.</p>${button("اعتماد الشروط", "loan-accept", id, "primary")}${button("رفض", "loan-reject", id)}`
    : "";
}
export function loanForm(s, id) {
  const p = s.players.find((p) => p.id === id);
  if (!p) throw Error("اختر لاعبًا.");
  const out = p.clubId === s.clubId;
  return `<h2>${out ? "عرض للإعارة" : "طلب إعارة"}: ${esc(p.name)}</h2><p>العقد حتى ${date(p.contractEnd)} · الراتب ${money(p.salary)} ${cur()} / شهر. يتطلب الرد والموافقة؛ لا خصم عند إرسال العرض.</p><form id="loan-offer-form" data-player="${esc(id)}"><div class="form-grid">${
    out
      ? `<label class="field">النادي المستعير<select name="borrower" required>${loanDestinations(
          s,
          p,
        )
          .map((id) => `<option value="${esc(id)}">${club(id)}</option>`)
          .join("")}</select></label>`
      : ""
  }<label class="field">مدة الإعارة<select name="days"><option value="90">90 يومًا</option><option value="180" selected>180 يومًا</option><option value="365">365 يومًا</option></select></label><label class="field">الرسوم ${cur()}<input name="fee" type="number" min="0" max="10000000000" value="${Math.round(p.value * 0.04)}" required></label><label class="field">نسبة راتب المستعير ٪<input name="wageShare" type="number" min="0" max="100" value="80" required></label><label class="field">خيار الشراء ${cur()} — صفر لإلغائه<input name="buyOption" type="number" min="0" max="10000000000" value="0" required></label><label class="field">وعد المشاركة<select name="role"><option value="rotation">مداورة</option><option value="starter">أساسي</option></select></label><label><input name="recallAllowed" type="checkbox" checked> السماح للمالك بالاستدعاء بعد 60 يومًا</label></div><p>النادي الآخر قد يعدّل الشروط أو يرفض. الرسوم لا ترد. مكافآت المباريات على المستعير. خيار الشراء ينقل العقد الحالي دون تمديد أو تفاوض تلقائي.</p><button class="btn primary">إرسال العرض</button></form>`;
}
export function loansPanel(s) {
  const m = s.management,
    own = s.players.filter(
      (p) => p.clubId === s.clubId && p.status !== "retired" && !p.loan,
    ),
    active = s.players.filter(
      (p) =>
        p.loan?.version === 2 &&
        (p.loan.parent === s.clubId || p.loan.borrower === s.clubId),
    );
  return `<section class="panel"><h3>الإعارات الواردة والصادرة</h3><p>${m.marketMode === "legacy" ? "سوق مفتوح للحفظة القديمة" : marketOpen(s) ? "السوق مفتوح" : "السوق مغلق"} · نوافذ سيناريو: يناير ويوليو–سبتمبر، وليست تقويم قيد رسميًا. خمس إعارات في كل اتجاه. نحتفظ بمساحة قائمة للمعارين العائدين.</p><select id="loan-out-player">${own.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("")}</select>${button("عرض لاعبك للإعارة", "loan-out-open")}<p>للاستعارة: افتح ملف أي لاعب من سوق الانتقالات واختر «التفاوض على إعارة».</p>${active.map((p) => `<article><h4>${esc(p.name)}</h4><p>${club(p.loan.parent)} ← ${club(p.loan.borrower)} · حتى ${date(p.loan.until)}</p><p>${loanTerms(p.loan)}</p><p>مشاركات خلال الإعارة: ${p.appearances - p.loan.appearancesAtStart} · الهوية والتاريخ محفوظان.</p>${p.loan.parent === s.clubId && p.loan.recallAllowed ? button("استدعاء وفق الشرط", "loan-recall", p.id) : ""}${p.loan.borrower === s.clubId && p.loan.buyOption ? button("تفعيل خيار الشراء", "loan-buy", p.id) : ""}</article>`).join("")}<h4>العروض الأخيرة</h4>${(
    m.loanOffers || []
  )
    .slice(-10)
    .reverse()
    .map(
      (o) =>
        `<p>${esc(s.players.find((p) => p.id === o.playerId)?.name || "")} · ${{ waiting: "بانتظار الرد", countered: "عرض مضاد — يحتاج قرارك", accepted: "مقبول", rejected: "مرفوض", expired: "منتهي" }[o.status]} ${o.status === "countered" ? button("مراجعة الشروط", "loan-review", o.id) : ""}${["waiting", "countered"].includes(o.status) ? button("رفض / سحب", "loan-reject", o.id) : ""}</p>`,
    )
    .join("")}</section>`;
}
