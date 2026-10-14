import { getLanguage, tr, translateText } from "../i18n/index.js";
import { badge, button, empty } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { esc, money, num, cur, date } from "../ui/format.js";
import {
  auctionDaysRemaining,
  clubInfo,
  personaName,
  playerLoyalty,
} from "../services/transferNegotiation.js";

const playerLabel = (player) =>
  getLanguage() === "ar" ? player?.name || "" : player?.nameLatin || player?.name || "";
const clubLabel = (id) => {
  const name = clubInfo(id).name;
  return getLanguage() === "ar" ? name : translateText(name);
};
const personaLabel = (id) => personaName(id);
const saleStatus = (status) =>
  ({
    open: tr("بانتظار ردك", "Your response", "Votre réponse"),
    agreed: tr("اتفاق مبدئي", "Agreed in principle", "Accord de principe"),
    sold: tr("اكتملت", "Completed", "Conclue"),
    rejected: tr("مرفوض", "Rejected", "Refusée"),
    withdrawn: tr("انسحب المشتري", "Buyer withdrew", "L’acheteur s’est retiré"),
    expired: tr("انتهت المهلة", "Expired", "Expirée"),
  })[status] || status;

export function transferSalesPanel(s) {
  const market = s.transferMarket || { sales: [], auctions: [] };
  const activeSales = (market.sales || [])
    .filter((item) => ["open", "agreed"].includes(item.status))
    .slice(-5)
    .reverse();
  const auctions = (market.auctions || [])
    .filter((item) => item.status === "open")
    .slice(-4)
    .reverse();
  const recent = (market.sales || [])
    .filter((item) => ["sold", "rejected", "withdrawn", "expired"].includes(item.status))
    .slice(-3)
    .reverse();
  const activeHtml = activeSales.length
    ? activeSales
        .map((deal) => {
          const player = s.players.find((p) => p.id === deal.playerId);
          return `<article class="transfer-deal-card"><div><strong>${esc(playerLabel(player))}</strong><small>${esc(clubLabel(deal.buyer))} · ${tr("شخصية النادي", "Club style", "Style du club")}: ${personaLabel(deal.personaId)}</small></div><div class="transfer-deal-price"><b>${money(deal.fee)} ${cur()}</b>${badge(saleStatus(deal.status), deal.status === "agreed" ? "green" : "gold")}</div><p>${tr("الجولة", "Round", "Tour")} ${num(deal.round || 0)} / ${num(deal.maxRounds || 3)} · ${tr("تنتهي", "Expires", "Expire le")} ${date(deal.expires)}</p>${button(tr("غرفة التفاوض", "Negotiation room", "Salle de négociation"), "sale-negotiate", deal.id, "small primary")}</article>`;
        })
        .join("")
    : `<p class="muted">${tr("لا توجد عروض بيع نشطة. قد تبادر الأندية بعروض لنجومك منتصف الشهر، أو اطرح لاعبًا في مزاد علني.", "No active sale offers. Clubs may approach for your stars mid-month, or list a player in a public auction.", "Aucune offre de vente active. Les clubs peuvent approcher vos vedettes au milieu du mois, ou lancez une enchère publique.")}</p>`;
  const auctionHtml = auctions.length
    ? auctions
        .map((auction) => {
          const player = s.players.find((p) => p.id === auction.playerId);
          const top = auction.highestBidder
            ? clubLabel(auction.highestBidder)
            : tr("لا عروض بعد", "No bids yet", "Aucune offre pour l’instant");
          return `<article class="transfer-deal-card auction-card"><div><strong>${esc(playerLabel(player))}</strong><small>${tr("المزايدة العلنية", "Public bidding", "Enchères publiques")} · ${num(auction.bidders.length)} ${tr("أندية", "clubs", "clubs")}</small></div><div class="transfer-deal-price"><b>${money(auction.highestBid || 0)} ${cur()}</b>${badge(`${num(auctionDaysRemaining(s, auction))} ${tr("يومًا", "days", "jours")}`, "gold")}</div><p>${tr("المتصدر", "Leader", "En tête")}: ${esc(top)} · ${num(auction.bids.length)} ${tr("مزايدات علنية", "public bids", "offres publiques")}</p>${button(tr("تفاصيل المزاد", "Auction details", "Détails de l’enchère"), "sale-auction-detail", auction.id, "small secondary")}</article>`;
        })
        .join("")
    : "";
  const recentHtml = recent.length
    ? `<details class="transfer-history"><summary>${tr("آخر الصفقات", "Recent sales", "Ventes récentes")}</summary>${recent
        .map((deal) => {
          const player = s.players.find((p) => p.id === deal.playerId);
          return `<p>${esc(playerLabel(player))} · ${saleStatus(deal.status)}${deal.fee ? ` · ${money(deal.fee)} ${cur()}` : ""}${deal.reason ? ` — ${esc(deal.reason)}` : ""}</p>`;
        })
        .join("")}</details>`
    : "";
  return `<section class="panel transfer-room"><div class="panel-head"><h3>${icon("transfer", 19)} ${tr("غرفة بيع اللاعبين", "Player sales room", "Salle des ventes")}</h3>${badge(tr("تفاوض ومزاد", "Talks & auctions", "Négociation et enchères"), "outline")}</div><p class="muted">${tr("مساومة حتى 3 جولات، دفعات وإضافات أداء ونسبة بيع مستقبلية. الولاء المرتفع يحمي اللاعب من الرحيل.", "Up to 3 bargaining rounds, instalments, performance add-ons and a sell-on share. Strong loyalty protects a player from leaving.", "Jusqu’à 3 tours, échéances, bonus de performance et pourcentage à la revente. Une forte loyauté protège le joueur.")}</p>${activeHtml}${auctionHtml}${recentHtml}</section>`;
}

export function saleNegotiationView(s, dealId) {
  const market = s.transferMarket || { sales: [] };
  const deal = market.sales?.find((item) => item.id === dealId);
  const player = s.players.find((item) => item.id === deal?.playerId);
  if (!deal || !player)
    return `<h2>${tr("التفاوض غير متاح", "Negotiation unavailable", "Négociation indisponible")}</h2>`;
  const terms = deal.terms || {
    fee: deal.fee,
    upfrontPercent: 40,
    appearanceBonus: 0,
    goalBonus: 0,
    sellOnPercent: 0,
  };
  const isActive = ["open", "agreed"].includes(deal.status);
  const canCounter = deal.status === "open" && (deal.round || 0) < (deal.maxRounds || 3);
  const history = (deal.history || [])
    .map((item) => {
      const speaker =
        item.side === "seller"
          ? tr("ناديك", "Your club", "Votre club")
          : esc(clubLabel(deal.buyer));
      const response =
        item.response === "accepted"
          ? tr("قبل العرض", "accepted", "a accepté")
          : item.response === "counter"
            ? tr("عرض مضاد", "countered", "a contre-proposé")
            : item.response === "withdrawn"
              ? tr("انسحب", "withdrew", "s’est retiré")
              : "";
      return `<li><span>${speaker}</span><b>${item.fee ? `${money(item.fee)} ${cur()}` : response}</b><small>${date(item.date)}</small></li>`;
    })
    .join("");
  return `<span class="eyebrow">${tr("غرفة تفاوض البيع", "Sale negotiation room", "Salle de négociation")}</span><h2>${tr("عرض لـ", "Offer for ", "Offre pour ")}${esc(playerLabel(player))}</h2><p class="muted">${tr("المشتري", "Buyer", "Acheteur")}: ${esc(clubLabel(deal.buyer))} · ${tr("شخصية النادي", "Club personality", "Personnalité du club")}: <strong>${personaLabel(deal.personaId)}</strong> · ${tr("ولاء اللاعب", "Player loyalty", "Loyauté du joueur")} ${num(playerLoyalty(player))}%</p><div class="transfer-negotiation-summary"><div><small>${tr("العرض الحالي", "Current offer", "Offre actuelle")}</small><strong>${money(deal.fee)} ${cur()}</strong></div><div><small>${tr("المساومة", "Bargaining", "Négociation")}</small><strong>${num(deal.round || 0)} / ${num(deal.maxRounds || 3)}</strong></div><div><small>${tr("مهلة الرد", "Deadline", "Échéance")}</small><strong>${date(deal.expires)}</strong></div></div><ol class="transfer-offer-history">${history}</ol>${deal.reason ? `<p class="transfer-warning">${esc(deal.reason)}</p>` : ""}${isActive ? `<form id="sale-counter-form" data-id="${esc(deal.id)}"><h3>${tr("عرض مضاد — اختر شروطك", "Counter-offer — set your terms", "Contre-offre — choisissez vos conditions")}</h3><div class="form-grid"><label class="field"><span>${tr("قيمة البيع — أي مبلغ", "Sale fee — any amount", "Prix de vente — montant libre")} (${cur()})</span><input name="fee" type="number" min="1" step="1" value="${deal.fee}" required></label><label class="field"><span>${tr("المقدم والباقي أقساطًا", "Upfront payment", "Acompte")}</span><select name="upfrontPercent">${[40, 60, 100]
      .map((n) => `<option value="${n}" ${Number(terms.upfrontPercent) === n ? "selected" : ""}>${num(n)}%${n === 100 ? ` · ${tr("دفعة واحدة", "one payment", "en une fois")}` : ` · ${tr("والباقي 3 أقساط", "rest in 3 instalments", "solde en 3 échéances")}`}</option>`)
      .join("")}</select></label><label class="field"><span>${tr("إضافة بعد 10 مباريات", "Bonus after 10 appearances", "Bonus après 10 matchs")} (${cur()})</span><input name="appearanceBonus" type="number" min="0" step="1" value="${terms.appearanceBonus || 0}"></label><label class="field"><span>${tr("إضافة بعد 5 أهداف", "Bonus after 5 goals", "Bonus après 5 buts")} (${cur()})</span><input name="goalBonus" type="number" min="0" step="1" value="${terms.goalBonus || 0}"></label><label class="field"><span>${tr("نسبة من البيع القادم", "Share of next sale", "Part de la prochaine vente")}</span><select name="sellOnPercent">${[0, 10, 15, 20, 25, 30]
      .map((n) => `<option value="${n}" ${Number(terms.sellOnPercent || 0) === n ? "selected" : ""}>${n === 0 ? tr("بلا نسبة", "No sell-on", "Sans pourcentage") : `${num(n)}%`}</option>`)
      .join("")}</select></label></div><p class="muted">${tr("إضافات الأداء تُصرف مرة واحدة عند بلوغ العتبة بعد الانتقال. يلين المشتري أو يتصلب حسب شخصيته؛ الحد الأقصى 3 جولات.", "Performance add-ons pay once when the player reaches the milestone after moving. The buyer softens or hardens according to their style; up to 3 rounds.", "Les bonus de performance sont versés une fois au seuil après le transfert. L’acheteur peut céder ou se montrer ferme selon son style ; 3 tours maximum.")}</p><div class="modal-actions">${canCounter ? `<button class="btn secondary" type="submit">${tr("إرسال العرض المضاد", "Send counter-offer", "Envoyer la contre-offre")}</button>` : ""}${button(tr("قبول العرض الحالي", "Accept current offer", "Accepter l’offre actuelle"), "sale-accept", deal.id, "primary")}${button(tr("الانسحاب", "Withdraw", "Se retirer"), "sale-reject", deal.id, "ghost")}</div></form>` : `<p class="muted">${saleStatus(deal.status)}${deal.signed ? ` · ${date(deal.signed)}` : ""}</p>`}`;
}

export function saleAuctionView(s, auctionId) {
  const auction = s.transferMarket?.auctions?.find((item) => item.id === auctionId);
  const player = s.players.find((item) => item.id === auction?.playerId);
  if (!auction || !player)
    return `<h2>${tr("المزاد غير متاح", "Auction unavailable", "Enchère indisponible")}</h2>`;
  const bids = [...(auction.bids || [])]
    .sort((a, b) => b.fee - a.fee || a.date.localeCompare(b.date))
    .map((bid) => `<li><span>${esc(clubLabel(bid.buyer))} · ${personaLabel(bid.personaId)}</span><b>${money(bid.fee)} ${cur()}</b><small>${date(bid.date)}</small></li>`)
    .join("");
  return `<span class="eyebrow">${tr("مزاد علني", "Public auction", "Enchère publique")}</span><h2>${esc(playerLabel(player))}</h2><p class="muted">${tr("ناديان على الأقل يتزايدان علنًا؛ أعلى سعر يفوز عند انتهاء العداد.", "At least two clubs bid publicly; the highest fee wins when the countdown ends.", "Au moins deux clubs enchérissent publiquement ; le montant le plus élevé l’emporte à la fin du compte à rebours.")}</p><div class="transfer-negotiation-summary"><div><small>${tr("أعلى عرض", "Highest bid", "Meilleure offre")}</small><strong>${money(auction.highestBid || 0)} ${cur()}</strong></div><div><small>${tr("المتصدر", "Leader", "En tête")}</small><strong>${esc(auction.highestBidder ? clubLabel(auction.highestBidder) : "—")}</strong></div><div><small>${tr("الأيام المتبقية", "Days remaining", "Jours restants")}</small><strong>${num(auctionDaysRemaining(s, auction))}</strong></div></div><ol class="transfer-offer-history">${bids || `<li>${empty(tr("لا توجد مزايدات", "No bids yet", "Aucune offre"))}</li>`}</ol>${auction.status !== "open" ? `<p class="muted">${saleStatus(auction.status)}${auction.winner ? ` · ${esc(clubLabel(auction.winner))}` : ""}</p>` : ""}`;
}
