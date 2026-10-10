// الاكتتابات 0.37 — إدراج شركة المراهنات والنادي، وحوكمة مساهمي الجماهير.
import { assert, clamp, uid } from "../../core/utils.js";
import {
  STOCK_MARKET_TEXTS,
  stockText,
} from "../../data/stockMarketTexts.js";
import { ensureBetting, estimateMarketValue } from "../betting/state.js";
import { ensureEmpire, personalIncome } from "../empire/wealth.js";
import { post } from "../finance.js";
import { message } from "../inbox.js";
import {
  addMarketListing,
  ensureStockMarket,
  estimateClubEquityValue,
  listingForClub,
  marketMonth,
  roundPrice,
} from "./state.js";

export const IPO_FEE_RATE = 0.04;
export const MIN_IPO_PERCENT = 5;
export const MAX_IPO_PERCENT = 49;

function validTerms(percent, discount) {
  return (
    Number.isInteger(percent) &&
    percent >= MIN_IPO_PERCENT &&
    percent <= MAX_IPO_PERCENT &&
    Number.isFinite(discount) &&
    discount >= 0 &&
    discount <= 25
  );
}

function netProceeds(value, percent, discount) {
  const gross = value * (percent / 100) * (1 - discount / 100);
  return Math.max(0, Math.round(gross * (1 - IPO_FEE_RATE)));
}

function nextQuarterDate(date) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const starts = [1, 4, 7, 10];
  const next = starts.find((value) => value > month);
  return `${next ? year : year + 1}-${String(next || 1).padStart(2, "0")}-01`;
}

export function valueBettingCompany(s) {
  const betting = ensureBetting(s);
  if (!betting.owned || betting.licenseStatus === "revoked") return 0;
  const modeled = estimateMarketValue(s);
  const positiveProfit = (betting.profits || [])
    .slice(-6)
    .filter((entry) => entry.profit > 0)
    .reduce((sum, entry) => sum + entry.profit, 0);
  const platformFloor =
    (betting.customers || 0) * 100 +
    (betting.reputation || 0) * 180_000 +
    (betting.branches || 0) * 2_000_000 +
    (betting.onlineLevel || 0) * 3_000_000;
  return Math.max(
    0,
    Math.round(Math.max(modeled, platformFloor + positiveProfit * 4)),
  );
}

export function launchBettingIPO(s, { percent = 25, discount = 10 } = {}) {
  assert(validTerms(percent, discount), stockText("invalidIpo"));
  const market = ensureStockMarket(s);
  const betting = ensureBetting(s);
  assert(
    betting.owned && betting.licenseStatus === "active" && !market.ipos.betting,
    stockText("bettingNotEligible"),
  );
  const valuation = valueBettingCompany(s);
  assert(valuation >= 5_000_000, stockText("bettingNotEligible"));
  const sharesOutstanding = Math.max(
    500_000,
    Math.round(valuation / 100 / 10_000) * 10_000,
  );
  const offerValue = valuation * (1 - discount / 100);
  const price = roundPrice(offerValue / sharesOutstanding);
  const offeredShares = Math.round(sharesOutstanding * (percent / 100));
  const proceeds = netProceeds(valuation, percent, discount);
  const name = betting.name || STOCK_MARKET_TEXTS.bettingCompanyGeneric;
  const listing = addMarketListing(s, {
    id: "company-betting",
    symbol: "BETFC",
    assetType: "company",
    companyId: "betting",
    name: {
      ar: name.ar || name.en,
      en: name.en || name.ar,
      fr: name.fr || name.en || name.ar,
    },
    country: "eg",
    status: "listed",
    price,
    previousPrice: price,
    initialPrice: price,
    sharesOutstanding,
    floatShares: offeredShares,
    marketCap: Math.round(price * sharesOutstanding),
    fundamentalValue: valuation,
    lastProfit: betting.lastMonthProfit || 0,
    metrics: {
      customers: betting.customers || 0,
      reputation: betting.reputation || 0,
      license: betting.licenseTier,
    },
    ownerControlled: true,
  });
  personalIncome(s, proceeds);
  const record = {
    id: uid(s, "ipo"),
    type: "betting",
    listingId: listing.id,
    date: s.date,
    percent,
    discount,
    valuation,
    price,
    offeredShares,
    proceeds,
    founderOwnershipPct: 100 - percent,
  };
  market.ipos.betting = record;
  market.ipos.history.unshift(record);
  betting.listed = true;
  betting.stockListingId = listing.id;
  betting.publicOwnershipPct = percent;
  betting.founderOwnershipPct = 100 - percent;
  betting.ipoProceeds = proceeds;
  betting.history.push({
    type: "ipo",
    date: s.date,
    percent,
    proceeds,
    listingId: listing.id,
  });
  message(s, {
    title: stockText("bettingIpo"),
    body: stockText("bettingIpoDone"),
    category: "events",
  });
  return { record, listing, proceeds };
}

export function secondaryBettingOffering(s, percent = 10) {
  const market = ensureStockMarket(s);
  const ipo = market.ipos.betting;
  const betting = ensureBetting(s);
  assert(
    ipo &&
      betting.listed &&
      Number.isInteger(percent) &&
      percent >= 1 &&
      percent <= 25 &&
      percent < betting.founderOwnershipPct,
    stockText("invalidIpo"),
  );
  const listing = market.listings.find((entry) => entry.id === ipo.listingId);
  assert(listing?.status === "listed", stockText("invalidIpo"));
  const shares = Math.round(listing.sharesOutstanding * (percent / 100));
  const proceeds = Math.round(shares * listing.price * 0.96);
  listing.floatShares += shares;
  betting.publicOwnershipPct += percent;
  betting.founderOwnershipPct -= percent;
  personalIncome(s, proceeds);
  const record = {
    id: uid(s, "ipo-secondary"),
    type: "betting-secondary",
    listingId: listing.id,
    date: s.date,
    percent,
    shares,
    price: listing.price,
    proceeds,
    founderOwnershipPct: betting.founderOwnershipPct,
  };
  market.ipos.history.unshift(record);
  return record;
}

export function valueClubForIPO(s) {
  const listing = listingForClub(s, s.clubId);
  const modeled = estimateClubEquityValue(s, s.clubId);
  const brandPremium =
    (s.reputation || 0) * 2_000_000 +
    (s.fanSupport || 0) * 800_000 +
    (s.capacity || 0) * 2_000;
  return Math.max(
    listing?.fundamentalValue || 0,
    modeled,
    Math.round((s.finance?.cash || 0) + brandPremium),
  );
}

export function listOwnClub(s, { percent = 25, discount = 8 } = {}) {
  assert(validTerms(percent, discount), stockText("invalidIpo"));
  const market = ensureStockMarket(s);
  const listing = listingForClub(s, s.clubId);
  assert(
    listing && listing.status === "private",
    stockText("clubAlreadyListed"),
  );
  const valuation = valueClubForIPO(s);
  const price = roundPrice(
    (valuation * (1 - discount / 100)) / listing.sharesOutstanding,
  );
  const offeredShares = Math.round(listing.sharesOutstanding * (percent / 100));
  const proceeds = netProceeds(valuation, percent, discount);
  listing.status = "listed";
  listing.price = price;
  listing.previousPrice = price;
  listing.initialPrice = price;
  listing.floatShares = offeredShares;
  listing.marketCap = Math.round(price * listing.sharesOutstanding);
  listing.fundamentalValue = valuation;
  listing.history.push([marketMonth(s.date), price]);
  post(
    s,
    proceeds,
    "club-ipo",
    stockText("clubIpo"),
    `club-ipo:${s.date}:${percent}`,
  );
  const record = {
    id: uid(s, "ipo"),
    type: "club",
    listingId: listing.id,
    date: s.date,
    percent,
    discount,
    valuation,
    price,
    offeredShares,
    proceeds,
    fanOwnershipPct: percent,
    ownerVotingPct: 100 - percent,
    pressure: 18,
    nextReview: nextQuarterDate(s.date),
    lastReview: null,
  };
  market.ipos.club = record;
  market.ipos.history.unshift(record);
  message(s, {
    title: stockText("clubIpo"),
    body: stockText("clubIpoDone"),
    category: "board",
    priority: "high",
  });
  return { record, listing, proceeds };
}

function ownLeaguePosition(s) {
  const table =
    s.expansion?.divisions?.find((division) =>
      division.clubs?.includes(s.clubId),
    )?.table ||
    s.table ||
    [];
  const sorted = [...table].sort(
    (a, b) =>
      (b.points || 0) - (a.points || 0) ||
      (b.gf || 0) - (b.ga || 0) - ((a.gf || 0) - (a.ga || 0)),
  );
  return {
    position: sorted.findIndex((row) => row.clubId === s.clubId) + 1,
    clubs: sorted.length,
  };
}

export function quarterlyShareholderReview(s, { force = false } = {}) {
  const market = ensureStockMarket(s);
  const ipo = market.ipos.club;
  if (!ipo || (!force && s.date < ipo.nextReview)) return null;
  if (ipo.lastReview === marketMonth(s.date)) return null;
  const rank = ownLeaguePosition(s);
  const listing = listingForClub(s, s.clubId);
  const priceReturn = listing.initialPrice
    ? listing.price / listing.initialPrice - 1
    : 0;
  const recentLedger = (s.finance?.ledger || [])
    .filter(
      (entry) =>
        entry.category !== "club-ipo" &&
        (entry.date >= ipo.lastReview || !ipo.lastReview),
    )
    .reduce((sum, entry) => sum + entry.amount, 0);
  const sportingScore = rank.position
    ? 1 - (rank.position - 1) / Math.max(1, rank.clubs - 1)
    : 0.5;
  const good =
    sportingScore >= 0.55 && priceReturn > -0.08 && recentLedger > -20_000_000;
  const pressureDelta = good ? -8 : 13;
  ipo.pressure = clamp(ipo.pressure + pressureDelta, 0, 100);
  ipo.lastReview = marketMonth(s.date);
  ipo.nextReview = nextQuarterDate(s.date);
  if (!good) {
    s.fanSupport = clamp((s.fanSupport || 0) - 3, 0, 100);
    if (s.board)
      s.board.confidence = clamp((s.board.confidence || 0) - 5, 0, 100);
  } else {
    s.fanSupport = clamp((s.fanSupport || 0) + 2, 0, 100);
  }
  const review = {
    id: uid(s, "shareholder-review"),
    date: s.date,
    month: marketMonth(s.date),
    good,
    pressure: ipo.pressure,
    position: rank.position,
    clubs: rank.clubs,
    priceReturn: Math.round(priceReturn * 10_000) / 10_000,
    recentLedger,
  };
  market.ipos.quarterly.unshift(review);
  if (market.ipos.quarterly.length > 24) market.ipos.quarterly.length = 24;
  message(s, {
    title: stockText("fanShareholders"),
    body: stockText(good ? "goodQuarter" : "badQuarter"),
    category: "board",
  });
  return review;
}

export function syncPublicCompanyValuations(s) {
  const market = ensureStockMarket(s);
  const month = marketMonth(s.date);
  if (market.ipos.lastSyncMonth === month) return false;
  market.ipos.lastSyncMonth = month;
  const bettingIpo = market.ipos.betting;
  if (bettingIpo) {
    const listing = market.listings.find(
      (entry) => entry.id === bettingIpo.listingId,
    );
    if (listing) {
      listing.fundamentalValue = valueBettingCompany(s);
      listing.lastProfit = s.betting?.lastMonthProfit || 0;
      listing.metrics = {
        customers: s.betting?.customers || 0,
        reputation: s.betting?.reputation || 0,
        license: s.betting?.licenseTier || null,
      };
    }
  }
  if (market.ipos.club) {
    const listing = listingForClub(s, s.clubId);
    if (listing) listing.fundamentalValue = valueClubForIPO(s);
  }
  return true;
}

export function ipoMarketDay(s) {
  syncPublicCompanyValuations(s);
  return quarterlyShareholderReview(s);
}
