import { isoDate } from "./isoDate.js";
import { tr } from "../i18n/index.js";

const id = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const amount = (value) => Number.isSafeInteger(value) && value >= 0;
const fail = () => {
  throw new Error(
    tr(
      "بيانات سوق الانتقالات أو المزايدات غير سليمة.",
      "Transfer market or auction data is invalid.",
      "Les données du marché ou des enchères sont invalides.",
    ),
  );
};
const playerExists = (playerId, s) =>
  s.players.some((player) => player.id === playerId) ||
  s.retired?.some((player) => player.id === playerId);
const saleTerms = (terms) =>
  terms &&
  amount(terms.fee) &&
  terms.fee > 0 &&
  [40, 60, 100].includes(terms.upfrontPercent) &&
  amount(terms.appearanceBonus) &&
  amount(terms.goalBonus) &&
  (terms.sellOnPercent === 0 ||
    (Number.isInteger(terms.sellOnPercent) &&
      terms.sellOnPercent >= 10 &&
      terms.sellOnPercent <= 30));

export function validateTransferMarket(s) {
  const market = s.transferMarket;
  if (market === undefined) return;
  if (
    !market ||
    typeof market !== "object" ||
    !Array.isArray(market.sales) ||
    market.sales.length > 500 ||
    !Array.isArray(market.auctions) ||
    market.auctions.length > 100 ||
    !Array.isArray(market.clauses) ||
    market.clauses.length > 1000 ||
    (market.exchanges !== undefined &&
      (!Array.isArray(market.exchanges) || market.exchanges.length > 500)) ||
    (market.lastExchangeOfferDate !== undefined &&
      market.lastExchangeOfferDate !== null &&
      !isoDate(market.lastExchangeOfferDate)) ||
    !market.aiBudgets ||
    typeof market.aiBudgets !== "object" ||
    Array.isArray(market.aiBudgets) ||
    (market.lastOfferDate !== null && !isoDate(market.lastOfferDate))
  )
    fail();
  if (
    Object.entries(market.aiBudgets).some(([clubId, cash]) => !id(clubId) || !amount(cash))
  )
    fail();
  const saleIds = new Set();
  for (const sale of market.sales) {
    if (
      !sale ||
      !id(sale.id) ||
      saleIds.has(sale.id) ||
      !playerExists(sale.playerId, s) ||
      !id(sale.seller) ||
      !id(sale.buyer) ||
      !amount(sale.fee) ||
      !saleTerms(sale.terms) ||
      sale.terms.fee !== sale.fee ||
      !["open", "agreed", "sold", "rejected", "withdrawn", "expired"].includes(sale.status) ||
      (sale.expires !== undefined && !isoDate(sale.expires)) ||
      (sale.signed !== undefined && !isoDate(sale.signed)) ||
      (sale.date !== undefined && !isoDate(sale.date)) ||
      (sale.round !== undefined && (!Number.isInteger(sale.round) || sale.round < 0 || sale.round > 3)) ||
      (sale.maxRounds !== undefined && sale.maxRounds !== 3) ||
      (sale.personaId !== undefined && !["frugal", "generous", "hesitant", "impatient", "tough"].includes(sale.personaId)) ||
      (sale.history !== undefined && (!Array.isArray(sale.history) || sale.history.length > 10))
    )
      fail();
    saleIds.add(sale.id);
  }
  const auctionIds = new Set();
  for (const auction of market.auctions) {
    if (
      !auction ||
      !id(auction.id) ||
      auctionIds.has(auction.id) ||
      !playerExists(auction.playerId, s) ||
      !id(auction.seller) ||
      !["open", "sold", "unsold", "expired"].includes(auction.status) ||
      !isoDate(auction.startedOn) ||
      !isoDate(auction.endsOn) ||
      !Array.isArray(auction.bidders) ||
      auction.bidders.length < 2 ||
      auction.bidders.length > 4 ||
      !Array.isArray(auction.bids) ||
      auction.bids.length > 500 ||
      !amount(auction.highestBid || 0) ||
      (auction.highestBidder !== null && !id(auction.highestBidder)) ||
      auction.bidders.some(
        (bidder) =>
          !id(bidder.clubId) ||
          !["frugal", "generous", "hesitant", "impatient", "tough"].includes(bidder.personaId),
      ) ||
      auction.bids.some(
        (bid) =>
          !isoDate(bid.date) ||
          !id(bid.buyer) ||
          !id(bid.personaId) ||
          !amount(bid.fee) ||
          !bid.buyerName,
      )
    )
      fail();
    auctionIds.add(auction.id);
  }
  for (const clause of market.clauses) {
    if (
      !clause ||
      !id(clause.id) ||
      !playerExists(clause.playerId, s) ||
      !id(clause.seller) ||
      !id(clause.buyer) ||
      !Number.isInteger(clause.sellOnPercent) ||
      (clause.sellOnPercent !== 0 && (clause.sellOnPercent < 10 || clause.sellOnPercent > 30)) ||
      !amount(clause.appearanceBonus) ||
      !amount(clause.goalBonus) ||
      !amount(clause.appearanceTarget) ||
      !amount(clause.goalTarget) ||
      typeof clause.appearancePaid !== "boolean" ||
      typeof clause.goalPaid !== "boolean" ||
      !isoDate(clause.date)
    )
      fail();
  }
  const exchangeIds = new Set();
  for (const deal of market.exchanges || []) {
    const outgoing = deal?.outgoingPlayerIds;
    const incoming = deal?.incomingPlayerIds;
    const playerIds = [
      ...(Array.isArray(outgoing) ? outgoing : []),
      ...(Array.isArray(incoming) ? incoming : []),
    ];
    if (
      !deal ||
      !id(deal.id) ||
      exchangeIds.has(deal.id) ||
      !["user", "ai"].includes(deal.initiator) ||
      !id(deal.opponentId) ||
      !Array.isArray(outgoing) ||
      outgoing.length < 1 ||
      outgoing.length > 5 ||
      !Array.isArray(incoming) ||
      incoming.length < 1 ||
      incoming.length > 5 ||
      new Set(playerIds).size !== playerIds.length ||
      playerIds.some((playerId) => !id(playerId) || !playerExists(playerId, s)) ||
      !Number.isSafeInteger(deal.cash) ||
      !deal.wageOffers ||
      typeof deal.wageOffers !== "object" ||
      Array.isArray(deal.wageOffers) ||
      Object.entries(deal.wageOffers).some(
        ([playerId, wage]) =>
          !incoming.includes(playerId) || !amount(wage) || wage > 100_000_000,
      ) ||
      !id(deal.windowId) ||
      !isoDate(deal.createdOn) ||
      !isoDate(deal.expires) ||
      !["open", "agreed", "completed", "rejected", "expired"].includes(deal.status) ||
      (deal.completedOn !== undefined && !isoDate(deal.completedOn)) ||
      (deal.reason !== undefined && typeof deal.reason !== "string") ||
      (deal.reasonCode !== undefined &&
        !["fair-value", "window", "roster", "wage-budget", "cash", "player", "wage", "club-level", "city"].includes(deal.reasonCode)) ||
      (deal.rejectedPlayerId !== undefined && !playerIds.includes(deal.rejectedPlayerId)) ||
      (deal.approvals !== undefined &&
        (!Array.isArray(deal.approvals) ||
          deal.approvals.length > 10 ||
          deal.approvals.some(
            (approval) =>
              !approval ||
              !playerIds.includes(approval.playerId) ||
              !id(approval.destinationId) ||
              typeof approval.approved !== "boolean" ||
              (approval.reason !== null && typeof approval.reason !== "string"),
          )))
    )
      fail();
    exchangeIds.add(deal.id);
  }
}
