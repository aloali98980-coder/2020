import { ASSETS } from "../data/catalog.js";
import {
  heading,
  badge,
  button,
  statCard,
  infoNote,
} from "../components/shared.js";
import { icon } from "../components/icons.js";
import { esc } from "../ui/format.js";
import { money, moneyLocal, num, date } from "../ui/format.js";
import {
  offersFor,
  ownerCountry,
  resolveSponsor,
} from "../services/sponsors.js";
import { marketBy } from "../data/worldMarkets.js";
export function sponsorsView(s) {
  const country = ownerCountry(s),
    countryAr = marketBy(country)?.nameAr || country,
    active = s.sponsors.filter((c) => c.status === "active");
  return `${heading("حوّل جمهورك لقيمة مستدامة", "الشراكات والرعايات", "كل مساحة لها قيمة. وكل شراكة لها التزامات.", badge(`سوق ${countryAr} · تجريبي`))}<div class="sponsor-overview"><div class="shirt-display"><svg viewBox="0 0 240 245" fill="none" aria-hidden="true"><defs><linearGradient id="shirt" x2="1" y2="1"><stop stop-color="#30473d"/><stop offset="1" stop-color="#0e201a"/></linearGradient></defs><path d="m80 25-43 14-28 51 45 28 13-20v123h107V98l14 20 43-28-28-51-43-14c-5 24-74 24-80 0Z" fill="url(#shirt)" stroke="#608b6c" stroke-width="1.5"/><path d="M83 28q38 37 75 0M67 97l-3-51m110 51 3-51" stroke="#739582"/><rect x="79" y="103" width="83" height="29" rx="3" fill="#b9f36d" fill-opacity=".1" stroke="#b9f36d" stroke-dasharray="3 3"/><text x="120" y="121" text-anchor="middle" fill="#b9f36d" font-size="10" font-family="sans-serif">MAIN PARTNER</text><path d="m104 69 8-7 8 7-8 10Z" fill="#b9f36d"/><rect x="21" y="77" width="30" height="13" rx="2" transform="rotate(29 21 77)" fill="#b9f36d" fill-opacity=".3"/></svg><span>مساحات تُبنى عليها شراكات</span></div><div class="sponsor-overview-copy"><span class="eyebrow">محفظة الحقوق التجارية</span><h2>أكتر من اسم<br>على <span class="green">قميص.</span></h2><p>نوّع مصادر الدخل بين الملعب، التدريب، والقميص. العروض هنا من شركات ${countryAr} الخيالية.</p><div class="sponsor-numbers"><div><strong>${num(active.length)}<small> / ٦</small></strong><span>مساحات محجوزة</span></div><div><strong>${money(active.reduce((a, c) => a + c.amount, 0))}</strong><span>إجمالي قيمة العقود · ج.م</span></div></div></div></div><div class="assets-grid">${ASSETS.map(
    (a) => {
      const c = active.find((c) => c.assetId === a.id),
        sp = c ? resolveSponsor(c.sponsorId) : null;
      return `<section class="panel asset-card"><div class="asset-top"><span class="asset-icon">${icon(a.id === "stadium" || a.id === "boards" ? "stadium" : "sponsor", 24)}</span>${badge(c ? "متعاقد" : "متاح", c ? "" : "green")}</div><h3>${a.name}</h3>${c ? `<div class="sponsor-brand"><span style="--sponsor:${sp.color}" data-initials="${esc(sp.name)}">${sp.initial}</span><div><strong>${sp.name}</strong><small>${sp.sector} · خيالي</small></div></div><div class="asset-value">${money(c.amount)} <small>ج.م / ${num(c.days)} يوم</small></div><small class="muted">ينتهي ${date(c.end)}</small>${button("تفاصيل العقد", "sponsor-detail", c.id, "secondary full")}` : `<p>مساحة متاحة لشريك جديد يناسب حجم ناديك وطموحه.</p><div class="asset-value">${money(a.value)} <small>ج.م قيمة استرشادية</small></div>${button("استكشاف العروض " + icon("arrow", 16), "sponsor-offers", a.id, "soft full")}`}</section>`;
    },
  ).join("")}`;
}
export function sponsorOffers(s, id) {
  const country = ownerCountry(s),
    countryAr = marketBy(country)?.nameAr || country,
    a = ASSETS.find((a) => a.id === id);
  return `<span class="eyebrow">عروض السوق المحلي (${countryAr}) · رعاة خياليون</span><h2>رعاية ${a.name}</h2><p class="muted">كل عرض لمدة ٣٦٠ يومًا. ٢٥٪ مقدمًا والباقي على ١١ دفعة كل ٣٠ يومًا.</p><div class="sponsor-offers">${offersFor(
    s,
    id,
  )
    .map((o) => {
      const sp = resolveSponsor(o.sponsorId);
      return `<div class="sponsor-offer"><div class="sponsor-brand"><span style="--sponsor:${sp.color}" data-initials="${esc(sp.name)}">${sp.initial}</span><div><strong>${sp.name}</strong><small>${sp.sector} · ${sp.tag}</small></div></div><div class="offer-value"><strong>${money(o.amount)} <small>ج.م</small></strong><span>المقدم ${money(Math.floor(o.amount * 0.25))} ج.م</span>${country === "eg" ? "" : `<span>≈ ${moneyLocal(o.amount, country)} بسعر عرض ثابت</span>`}</div><div class="offer-footer">${badge(o.exclusive ? "حصرية القطاع" : "بدون حصرية قطاع", o.exclusive ? "gold" : "")}<button class="btn soft small" data-action="negotiate-sponsor" data-asset="${id}" data-id="${o.sponsorId}">فاوض على زيادة</button><button class="btn soft small" data-action="confirm-sponsor" data-asset="${id}" data-id="${o.sponsorId}">مراجعة وتوقيع</button></div></div>`;
    })
    .join(
      "",
    )}</div>${infoNote("العروض تختلف في القيمة والحصرية، وتشمل كلها مكافآت الأداء الموحدة. يمكنك التفاوض على زيادة ١٠–٣٠٪؛ القبول يعتمد على سمعة ناديك وثقة الصحافة، والطمع قد يفقدك الراعي.")}`;
}
export function sponsorNegotiate(s, assetId, sponsorId) {
  const a = ASSETS.find((x) => x.id === assetId),
    sp = resolveSponsor(sponsorId),
    offer = offersFor(s, assetId).find((o) => o.sponsorId === sponsorId);
  const deal = s.sponsorDeals?.find(
    (d) =>
      d.assetId === assetId &&
      d.sponsorId === sponsorId &&
      ["open", "countered"].includes(d.status),
  );
  return `<span class="eyebrow">تفاوض مضاد · الجولة ${num((deal?.rounds || 0) + 1)} من ٢</span><h2>${sp.name} × ${a.name}</h2><p class="muted">العرض المعلن ${money(offer.amount)} ج.م. سمعة ناديك ${num(s.reputation)} وثقة الصحافة ${num(s.press?.trust ?? 60)} — الراعي يقيس طموحك عليهما.</p><div class="modal-actions"><button class="btn soft" data-action="sponsor-demand" data-asset="${assetId}" data-id="${sponsorId}" data-raise="10">طلب +١٠٪</button><button class="btn soft" data-action="sponsor-demand" data-asset="${assetId}" data-id="${sponsorId}" data-raise="20">طلب +٢٠٪</button><button class="btn soft" data-action="sponsor-demand" data-asset="${assetId}" data-id="${sponsorId}" data-raise="30">طلب +٣٠٪</button></div>${infoNote("القبول الفوري يحتاج سمعة أعلى كلما زاد طلبك؛ غير ذلك يعرض الراعي حلًا وسطًا أو ينسحب.")}`;
}
export function sponsorDealResult(s, deal) {
  const sp = resolveSponsor(deal.sponsorId),
    a = ASSETS.find((x) => x.id === deal.assetId);
  if (deal.status === "dead")
    return `<span class="eyebrow">انسحب الراعي</span><h2>${sp.name} × ${a.name}</h2><p class="muted">طلبك تجاوز سقف الراعي لسمعة ناديك الحالية. العروض الأخرى للمساحة ما زالت متاحة، ويمكنك التوقيع المباشر دون تفاوض.</p><div class="modal-actions"><button class="btn secondary" data-action="sponsor-offers" data-id="${deal.assetId}">عودة للعروض</button></div>`;
  const current = deal.current;
  return `<span class="eyebrow">${deal.status === "accepted" ? "قبل الراعي طلبك" : "عرض مضاد من الراعي"}</span><h2>${sp.name} × ${a.name}</h2><div class="profile-stats"><div><small>العرض الأصلي</small><strong>${money(deal.base)} ج.م</strong></div><div><small>القيمة الآن</small><strong>${money(current.amount)} ج.م</strong></div><div><small>المقدم ٢٥٪</small><strong>${money(Math.floor(current.amount * 0.25))} ج.م</strong></div></div><div class="modal-actions"><button class="btn primary" data-action="sign-sponsor-deal" data-id="${deal.id}">توقيع بهذه القيمة</button>${deal.status === "countered" && deal.rounds < 2 ? `<button class="btn soft" data-action="negotiate-sponsor" data-asset="${deal.assetId}" data-id="${deal.sponsorId}">محاولة أخيرة</button>` : ""}<button class="btn secondary" data-action="sponsor-offers" data-id="${deal.assetId}">عودة للعروض</button></div>`;
}
export function sponsorDetail(s, id) {
  const c = s.sponsors.find((c) => c.id === id),
    sp = resolveSponsor(c.sponsorId),
    asset = ASSETS.find((a) => a.id === c.assetId);
  const obs = s.finance.obligations.filter((o) => o.ref === id);
  return `<span class="eyebrow">عقد رعاية فعّال</span><h2>${sp.name} × ${asset.name}</h2><div class="profile-stats"><div><small>إجمالي العقد</small><strong>${money(c.amount)} ج.م</strong></div><div><small>انتهاء العقد</small><strong>${date(c.end)}</strong></div><div><small>الحصرية</small><strong>${c.exclusive ? sp.sector : "حق المساحة فقط"}</strong></div></div><h3 class="section-title">مكافآت الأداء الموحدة</h3><p class="muted">لقب الدوري ٢٠٪، لقب الكأس المحلية ١٥٪، التأهل القاري ١٥٪ من قيمة العقد — تُصرف تلقائيًا نهاية الموسم عند تحققها للعقود القائمة.</p><h3 class="section-title">جدول الدفعات المتبقية</h3><div class="payment-list">${obs.map((o) => `<div><span>${date(o.due)}</span><strong>${money(o.amount)} ج.م</strong>${badge(o.status === "paid" ? "محصّلة" : "مجدولة", o.status === "paid" ? "green" : "")}</div>`).join("")}</div>`;
}
