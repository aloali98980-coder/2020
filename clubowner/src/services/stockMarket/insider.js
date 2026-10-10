// المعلومات الداخلية 0.37 — معرفة ما قبل الإعلان، مقياس المخاطرة/الربح، وسجل التوقيت المشبوه.
import { addDays, assert, clamp, daysBetween, uid } from "../../core/utils.js";
import { stockText } from "../../data/stockMarketTexts.js";
import { MARKET_SIGNAL_WEIGHTS, recordMarketSignal } from "./engine.js";
import {
  ensureStockMarket,
  listingById,
  listingForClub,
  marketMonth,
} from "./state.js";
import { buyShares, sellShares, tradeQuote } from "./trading.js";
import { ensureEmpire, netWorth } from "../empire/wealth.js";

export const INSIDE_INFORMATION_KINDS = Object.freeze({
  transfer: {
    signalKind: "transfer",
    direction: 1,
    magnitude: 1.5,
    textKey: "plannedTransfer",
  },
  "coach-dismissal": {
    signalKind: "result",
    direction: -1,
    magnitude: 1.25,
    textKey: "coachDismissal",
  },
  "federation-law": {
    signalKind: "federation",
    direction: 1,
    magnitude: 1.4,
    textKey: "federationLaw",
  },
  facility: {
    signalKind: "facility",
    direction: 1,
    magnitude: 1.35,
    textKey: "facilityOpening",
  },
  injury: {
    signalKind: "injury",
    direction: 1,
    magnitude: 1.25,
    textKey: "injurySecret",
  },
});

function expectedDirection(kind, direction) {
  const weight = MARKET_SIGNAL_WEIGHTS[kind] || 0;
  return Math.sign(weight * direction) || 1;
}

function activeDuplicate(market, sourceRef) {
  return market.insider.knowledge.find(
    (info) =>
      sourceRef &&
      info.sourceRef === sourceRef &&
      ["active", "used"].includes(info.status),
  );
}

export function addInsideInformation(
  s,
  {
    listingId = null,
    clubId = null,
    kind,
    direction = null,
    magnitude = null,
    publicOn = addDays(s.date, 10),
    sourceRef = null,
    source = "board-room",
  } = {},
) {
  const market = ensureStockMarket(s);
  const definition = INSIDE_INFORMATION_KINDS[kind];
  const listing = listingId
    ? listingById(s, listingId)
    : listingForClub(s, clubId);
  assert(
    definition && listing && publicOn >= s.date,
    stockText("invalidSecret"),
  );
  const duplicate = activeDuplicate(market, sourceRef);
  if (duplicate) return duplicate;
  const resolvedDirection =
    direction == null ? definition.direction : direction < 0 ? -1 : 1;
  const resolvedMagnitude = clamp(
    Number(magnitude ?? definition.magnitude),
    0.25,
    5,
  );
  const signal = recordMarketSignal(s, {
    listingId: listing.id,
    kind: definition.signalKind,
    magnitude: resolvedMagnitude,
    direction: resolvedDirection,
    publicOn,
    secret: true,
    source,
    note: definition.textKey,
  });
  const info = {
    id: uid(s, "inside-info"),
    listingId: listing.id,
    kind,
    textKey: definition.textKey,
    signalId: signal.id,
    direction: expectedDirection(definition.signalKind, resolvedDirection),
    magnitude: resolvedMagnitude,
    knownOn: s.date,
    publicOn,
    sourceRef,
    status: "active",
    usedOn: null,
    trades: 0,
  };
  market.insider.knowledge.unshift(info);
  if (market.insider.knowledge.length > 80)
    market.insider.knowledge.length = 80;
  return info;
}

export function planInsideInformation(s, listingId, kind) {
  if (kind === "federation-law")
    assert(s.politics?.office?.held, stockText("invalidSecret"));
  const definition = INSIDE_INFORMATION_KINDS[kind];
  assert(definition, stockText("invalidSecret"));
  return addInsideInformation(s, {
    listingId,
    kind,
    publicOn: addDays(s.date, kind === "coach-dismissal" ? 7 : 12),
    sourceRef: `plan:${kind}:${listingId}:${marketMonth(s.date)}`,
    source: kind === "federation-law" ? "federation-presidency" : "owner-plan",
  });
}

export function refreshInsideKnowledge(s) {
  const created = [];
  const ownListing = listingForClub(s, s.clubId);
  if (!ownListing) return created;
  for (const negotiation of s.negotiations || []) {
    if (!["waiting", "club-reply", "personal"].includes(negotiation.stage))
      continue;
    created.push(
      addInsideInformation(s, {
        listingId: ownListing.id,
        kind: "transfer",
        magnitude: 1 + Math.min(2, (Number(negotiation.fee) || 0) / 30_000_000),
        publicOn: addDays(s.date, 3),
        sourceRef: `negotiation:${negotiation.id}`,
        source: "private-negotiation",
      }),
    );
  }
  for (const facility of s.facilities || []) {
    if (!facility.project?.end || facility.project.end < s.date) continue;
    created.push(
      addInsideInformation(s, {
        listingId: ownListing.id,
        kind: "facility",
        publicOn: facility.project.end,
        sourceRef: `facility:${facility.project.id}`,
        source: "construction-office",
      }),
    );
  }
  const bill = s.politics?.office?.held && s.politics?.council?.currentBill;
  if (bill && ["debate", "voting"].includes(bill.status))
    created.push(
      addInsideInformation(s, {
        listingId: ownListing.id,
        kind: "federation-law",
        publicOn: addDays(s.date, 7),
        sourceRef: `bill:${bill.id}`,
        source: "federation-presidency",
      }),
    );
  return created;
}

export function publishDueInsideInformation(s) {
  const market = ensureStockMarket(s);
  let published = 0;
  for (const info of market.insider.knowledge) {
    if (!["active", "used"].includes(info.status) || info.publicOn > s.date)
      continue;
    info.status = "published";
    const listing = listingById(s, info.listingId);
    const signal = listing?.signals?.find(
      (entry) => entry.id === info.signalId,
    );
    if (signal) signal.secret = false;
    published++;
  }
  return published;
}

export function insideOpportunity(s, infoId, quantity, side = "buy") {
  assert(
    Number.isSafeInteger(quantity) && quantity > 0,
    stockText("invalidQuantity"),
  );
  const market = ensureStockMarket(s);
  const info = market.insider.knowledge.find((entry) => entry.id === infoId);
  assert(
    info && ["active", "used"].includes(info.status),
    stockText("invalidSecret"),
  );
  const listing = listingById(s, info.listingId);
  assert(listing, stockText("invalidListing"));
  const quote = tradeQuote(listing, quantity, side === "sell" ? "sell" : "buy");
  const signal = listing.signals.find((entry) => entry.id === info.signalId);
  const expectedReturn = Math.abs(
    (MARKET_SIGNAL_WEIGHTS[signal?.kind] || 0) *
      (signal?.magnitude || info.magnitude || 1),
  );
  const orderDirection = side === "buy" ? 1 : -1;
  const expectedProfit = Math.round(
    quote.gross * expectedReturn * info.direction * orderDirection,
  );
  const leadDays = Math.max(0, daysBetween(s.date, info.publicOn));
  const wealth = Math.max(1, netWorth(s));
  const sizeRisk = (quote.gross / wealth) * 85;
  const existing =
    market.insider.exposure * 0.22 + market.manipulation.exposure * 0.12;
  const officeRisk = s.politics?.office?.held ? 12 : 0;
  const detectionChance = Math.round(
    clamp(6 + leadDays * 0.7 + sizeRisk + existing + officeRisk, 3, 96),
  );
  return {
    listing,
    info,
    quote,
    expectedReturn,
    expectedProfit,
    detectionChance,
    favorable: info.direction === orderDirection,
  };
}

export function tradeOnInsideInformation(s, infoId, side, quantity) {
  assert(["buy", "sell"].includes(side), stockText("invalidSecret"));
  const opportunity = insideOpportunity(s, infoId, quantity, side);
  const result =
    side === "buy"
      ? buyShares(s, opportunity.listing.id, quantity, {
          reason: "insider",
          insiderInfoId: infoId,
        })
      : sellShares(s, opportunity.listing.id, quantity, {
          reason: "insider",
          insiderInfoId: infoId,
        });
  const market = ensureStockMarket(s);
  const exposureGain = Math.round(
    clamp(
      opportunity.detectionChance * 0.42 + opportunity.info.trades * 5,
      4,
      40,
    ),
  );
  market.insider.exposure = clamp(
    market.insider.exposure + exposureGain,
    0,
    100,
  );
  market.regulator.risk = clamp(
    market.regulator.risk + Math.ceil(exposureGain * 0.75),
    0,
    100,
  );
  opportunity.info.status = "used";
  opportunity.info.usedOn = s.date;
  opportunity.info.trades++;
  if (result.profit) market.insider.profit += result.profit;
  market.insider.trades.unshift({
    id: uid(s, "inside-trade"),
    date: s.date,
    infoId,
    listingId: opportunity.listing.id,
    orderId: result.order.id,
    side,
    quantity,
    expectedProfit: opportunity.expectedProfit,
    detectionChance: opportunity.detectionChance,
  });
  if (market.insider.trades.length > 100) market.insider.trades.length = 100;
  ensureEmpire(s);
  return { ...result, opportunity, exposureGain };
}
