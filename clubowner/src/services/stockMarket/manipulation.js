// التلاعب بالسوق 0.37 — شائعات، تضخيم ثم بيع، وبيع مكشوف قبل خطف نجم.
import { addDays, assert, clamp, uid } from "../../core/utils.js";
import { stockText } from "../../data/stockMarketTexts.js";
import { message } from "../inbox.js";
import { ensureEmpire, netWorth } from "../empire/wealth.js";
import { recordMarketSignal } from "./engine.js";
import { addInsideInformation } from "./insider.js";
import {
  ensureStockMarket,
  listingById,
  marketMonth,
  roundPrice,
} from "./state.js";
import {
  BROKER_FEE_RATE,
  MIN_BROKER_FEE,
  buyShares,
  isTradable,
  sellShares,
  tradeQuote,
} from "./trading.js";

export const MIN_RUMOR_BUDGET = 100_000;
export const MAX_RUMOR_BUDGET = 25_000_000;
export const SHORT_MARGIN_RATE = 0.5;

function socialReach(s) {
  const followers = Number(
    s.staffCorp?.social?.followers ??
      s.social?.followers ??
      s.press?.followers ??
      0,
  );
  const trust = Number(s.press?.trust || 50);
  return clamp(followers / 250_000 + trust / 100, 0.25, 3);
}

function addManipulationExposure(s, amount) {
  const market = ensureStockMarket(s);
  market.manipulation.exposure = clamp(
    market.manipulation.exposure + amount,
    0,
    100,
  );
  market.regulator.risk = clamp(
    market.regulator.risk + Math.ceil(amount * 0.7),
    0,
    100,
  );
}

export function launchRumorCampaign(
  s,
  listingId,
  { direction = "pump", budget = MIN_RUMOR_BUDGET, kind = "rumor" } = {},
) {
  const market = ensureStockMarket(s);
  const listing = listingById(s, listingId);
  assert(listing && isTradable(s, listing), stockText("notTradable"));
  assert(
    ["pump", "bear"].includes(direction) &&
      Number.isSafeInteger(budget) &&
      budget >= MIN_RUMOR_BUDGET &&
      budget <= MAX_RUMOR_BUDGET,
    stockText("invalidCampaign"),
  );
  const empire = ensureEmpire(s);
  assert(empire.personal >= budget, stockText("insufficientWealth"));
  empire.personal -= budget;
  empire.monthTrack.expenses += budget;
  const reach = socialReach(s);
  const magnitude = clamp(0.5 + budget / 4_000_000 + reach * 0.35, 0.5, 4.5);
  const risk = Math.round(
    clamp(
      10 + budget / 700_000 + reach * 4 + market.manipulation.exposure * 0.25,
      8,
      92,
    ),
  );
  const signal = recordMarketSignal(s, {
    listingId,
    kind: "manipulation",
    magnitude,
    direction: direction === "pump" ? 1 : -1,
    publicOn: s.date,
    source: "owner-media-network",
    note: direction === "pump" ? "pump-campaign" : "bear-rumor",
  });
  const campaign = {
    id: uid(s, "market-campaign"),
    listingId,
    type: kind,
    direction,
    budget,
    reach: Math.round(reach * 100) / 100,
    magnitude,
    detectionRisk: risk,
    signalId: signal.id,
    startedOn: s.date,
    matureOn: addDays(s.date, 14),
    status: "active",
    profit: 0,
  };
  market.manipulation.campaigns.unshift(campaign);
  if (market.manipulation.campaigns.length > 80)
    market.manipulation.campaigns.length = 80;
  addManipulationExposure(s, Math.ceil(risk * 0.35));
  message(s, {
    title: stockText("manipulation"),
    body: stockText("campaignStarted"),
    category: "events",
    priority: "high",
  });
  return campaign;
}

export function startPumpAndDump(s, listingId, quantity, budget) {
  const listing = listingById(s, listingId);
  assert(listing, stockText("invalidListing"));
  const quote = tradeQuote(listing, quantity, "buy");
  const empire = ensureEmpire(s);
  assert(
    Number.isSafeInteger(budget) && empire.personal >= quote.total + budget,
    stockText("insufficientWealth"),
  );
  const purchase = buyShares(s, listingId, quantity, {
    reason: "manipulation",
  });
  const campaign = launchRumorCampaign(s, listingId, {
    direction: "pump",
    budget,
    kind: "pump-dump",
  });
  purchase.order.manipulationId = campaign.id;
  campaign.buyOrderId = purchase.order.id;
  campaign.quantity = quantity;
  campaign.entryPrice = purchase.quote.executionPrice;
  return { campaign, purchase };
}

export function dumpCampaign(s, campaignId, quantity = null) {
  const market = ensureStockMarket(s);
  const campaign = market.manipulation.campaigns.find(
    (entry) => entry.id === campaignId,
  );
  assert(
    campaign && campaign.type === "pump-dump" && campaign.status === "active",
    stockText("invalidCampaign"),
  );
  const position = market.portfolio.positions.find(
    (entry) => entry.listingId === campaign.listingId,
  );
  const amount =
    quantity == null
      ? Math.min(position?.quantity || 0, campaign.quantity || 0)
      : quantity;
  assert(amount > 0, stockText("insufficientShares"));
  const sale = sellShares(s, campaign.listingId, amount, {
    reason: "manipulation",
    manipulationId: campaign.id,
  });
  campaign.status = "dumped";
  campaign.dumpedOn = s.date;
  campaign.sellOrderId = sale.order.id;
  campaign.profit = sale.profit;
  market.manipulation.profit += sale.profit;
  addManipulationExposure(s, Math.ceil(campaign.detectionRisk * 0.42));
  return { campaign, sale };
}

export function openShortPosition(
  s,
  listingId,
  quantity,
  { reason = "clean", insiderInfoId = null, manipulationId = null } = {},
) {
  assert(
    Number.isSafeInteger(quantity) && quantity > 0,
    stockText("invalidQuantity"),
  );
  const market = ensureStockMarket(s);
  const listing = listingById(s, listingId);
  assert(listing && isTradable(s, listing), stockText("notTradable"));
  const empire = ensureEmpire(s);
  const entryPrice = roundPrice(listing.price * 0.995);
  const entryValue = Math.round(entryPrice * quantity);
  const fee = Math.max(
    MIN_BROKER_FEE,
    Math.round(entryValue * BROKER_FEE_RATE),
  );
  const margin = Math.round(entryValue * SHORT_MARGIN_RATE) + fee;
  assert(empire.personal >= margin, stockText("insufficientMargin"));
  empire.personal -= margin;
  market.portfolio.fees += fee;
  const position = {
    id: uid(s, "short"),
    listingId,
    quantity,
    entryPrice,
    entryValue,
    margin,
    fee,
    openedOn: s.date,
    reason,
    insiderInfoId,
    manipulationId,
    status: "open",
  };
  market.portfolio.shorts.push(position);
  market.portfolio.orders.unshift({
    id: uid(s, "stock-order"),
    date: s.date,
    month: marketMonth(s.date),
    listingId,
    side: "short",
    quantity,
    price: entryPrice,
    gross: entryValue,
    fee,
    total: margin,
    reason,
    insiderInfoId,
    manipulationId,
  });
  if (reason !== "clean") addManipulationExposure(s, 16);
  return position;
}

export function closeShortPosition(s, shortId) {
  const market = ensureStockMarket(s);
  const position = market.portfolio.shorts.find(
    (entry) => entry.id === shortId && entry.status === "open",
  );
  assert(position, stockText("invalidCampaign"));
  const listing = listingById(s, position.listingId);
  assert(listing && isTradable(s, listing), stockText("notTradable"));
  const closePrice = roundPrice(listing.price * 1.005);
  const closeValue = Math.round(closePrice * position.quantity);
  const fee = Math.max(
    MIN_BROKER_FEE,
    Math.round(closeValue * BROKER_FEE_RATE),
  );
  const profit = position.entryValue - closeValue - position.fee - fee;
  const settlement = position.margin + profit;
  const empire = ensureEmpire(s);
  if (settlement >= 0) empire.personal += settlement;
  else {
    const loss = -settlement;
    const paid = Math.min(loss, empire.personal);
    empire.personal -= paid;
    if (paid < loss) empire.debt += loss - paid;
  }
  empire.monthTrack.returns += profit;
  market.portfolio.fees += fee;
  market.portfolio.realizedProfit += profit;
  position.status = "closed";
  position.closedOn = s.date;
  position.closePrice = closePrice;
  position.closeFee = fee;
  position.profit = profit;
  market.portfolio.orders.unshift({
    id: uid(s, "stock-order"),
    date: s.date,
    month: marketMonth(s.date),
    listingId: listing.id,
    side: "cover",
    quantity: position.quantity,
    price: closePrice,
    gross: closeValue,
    fee,
    total: settlement,
    profit,
    reason: position.reason,
    insiderInfoId: position.insiderInfoId,
    manipulationId: position.manipulationId,
  });
  if (position.reason !== "clean") {
    market.manipulation.profit += profit;
    addManipulationExposure(s, 12);
  }
  return { position, profit, settlement };
}

export function shortBeforePoach(s, listingId, quantity, playerId = null) {
  const listing = listingById(s, listingId);
  assert(
    listing?.clubId && listing.clubId !== s.clubId,
    stockText("invalidCampaign"),
  );
  const player = playerId
    ? s.players.find(
        (entry) => entry.id === playerId && entry.clubId === listing.clubId,
      )
    : (s.players || [])
        .filter((entry) => entry.clubId === listing.clubId)
        .sort((a, b) => (b.value || 0) - (a.value || 0))[0];
  assert(player, stockText("invalidCampaign"));
  const info = addInsideInformation(s, {
    listingId,
    kind: "transfer",
    direction: -1,
    magnitude: clamp(1 + (player.value || 0) / 35_000_000, 1, 3.5),
    publicOn: addDays(s.date, 10),
    sourceRef: `poach:${player.id}:${marketMonth(s.date)}`,
    source: "secret-poach-plan",
  });
  const position = openShortPosition(s, listingId, quantity, {
    reason: "poach-short",
    insiderInfoId: info.id,
  });
  const market = ensureStockMarket(s);
  const campaign = {
    id: uid(s, "market-campaign"),
    listingId,
    type: "poach-short",
    direction: "bear",
    budget: 0,
    detectionRisk: Math.round(
      clamp(
        28 + (position.entryValue / Math.max(1, netWorth(s))) * 100,
        28,
        90,
      ),
    ),
    startedOn: s.date,
    matureOn: info.publicOn,
    status: "active",
    playerId: player.id,
    infoId: info.id,
    shortId: position.id,
    profit: 0,
  };
  market.manipulation.campaigns.unshift(campaign);
  position.manipulationId = campaign.id;
  addManipulationExposure(s, 22);
  message(s, {
    title: stockText("shortBeforePoach"),
    body: stockText("campaignStarted"),
    category: "events",
    priority: "high",
  });
  return { campaign, position, info, player };
}
