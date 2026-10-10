// دورات البورصة 0.37 — صعود، فقاعات، انهيارات، تعافٍ، وأندية متعثرة تمهيدًا لسوق البيع.
import { assert, clamp, uid } from "../../core/utils.js";
import { stockText } from "../../data/stockMarketTexts.js";
import {
  ensureStockMarket,
  marketDeterministicUnit,
  marketMonth,
} from "./state.js";

export const MARKET_PHASES = Object.freeze([
  "neutral",
  "bull",
  "bubble",
  "crash",
  "recovery",
]);

export function setMarketCycle(s, phase, intensity = null, reason = "manual") {
  assert(MARKET_PHASES.includes(phase), stockText("invalidEvent"));
  const market = ensureStockMarket(s);
  const defaults = {
    neutral: 0,
    bull: 40,
    bubble: 78,
    crash: 85,
    recovery: 48,
  };
  market.cycle.phase = phase;
  market.cycle.intensity = clamp(Number(intensity ?? defaults[phase]), 0, 100);
  market.cycle.months = 0;
  market.cycle.history.unshift({
    id: uid(s, "market-cycle"),
    date: s.date,
    month: marketMonth(s.date),
    phase,
    intensity: market.cycle.intensity,
    reason,
  });
  if (market.cycle.history.length > 36) market.cycle.history.length = 36;
  return market.cycle;
}

export function triggerMarketCrash(s, intensity = 85, reason = "crisis") {
  return setMarketCycle(s, "crash", intensity, reason);
}

export function triggerMarketBubble(s, intensity = 78, reason = "speculation") {
  return setMarketCycle(s, "bubble", intensity, reason);
}

function transitionFor(s, roll) {
  const cycle = s.stockMarket.cycle;
  const month = Number(s.date.slice(5, 7));
  if (cycle.phase === "crash")
    return cycle.months >= 2 && roll < 0.62 ? "recovery" : "crash";
  if (cycle.phase === "recovery")
    return cycle.months >= 3 && roll < 0.7 ? "neutral" : "recovery";
  if (cycle.phase === "bubble")
    return roll < 0.28 + cycle.months * 0.08
      ? "crash"
      : cycle.months >= 5 && roll > 0.82
        ? "neutral"
        : "bubble";
  if (cycle.phase === "bull")
    return cycle.months >= 3 && roll < 0.2
      ? "bubble"
      : cycle.months >= 6 && roll > 0.72
        ? "neutral"
        : "bull";
  // يناير وأغسطس يجذبان تدفقات انتقالات، بينما نهاية الموسم أكثر توترًا.
  const seasonalBull = [1, 8].includes(month) ? 0.28 : 0.14;
  const seasonalCrash = [5, 6].includes(month) ? 0.1 : 0.045;
  if (roll < seasonalCrash) return "crash";
  if (roll > 1 - seasonalBull) return "bull";
  return "neutral";
}

export function advanceMarketCycle(s, { force = false } = {}) {
  const market = ensureStockMarket(s);
  const month = marketMonth(s.date);
  if (!force && market.cycle.lastMonth === month) return market.cycle;
  market.cycle.lastMonth = month;
  market.cycle.months++;
  const roll = marketDeterministicUnit(market, `${month}:cycle-transition`);
  const next = transitionFor(s, roll);
  if (next !== market.cycle.phase)
    setMarketCycle(s, next, null, "monthly-cycle");
  else {
    const drift =
      next === "bubble"
        ? 4
        : next === "crash"
          ? -5
          : next === "recovery"
            ? -2
            : next === "bull"
              ? 2
              : 0;
    market.cycle.intensity = clamp(market.cycle.intensity + drift, 0, 100);
  }
  return market.cycle;
}

export function identifyDistressedClubs(s) {
  const market = ensureStockMarket(s);
  const candidates = market.listings
    .filter((listing) => listing.assetType === "club")
    .map((listing) => {
      const drawdown = 1 - listing.price / Math.max(0.1, listing.initialPrice);
      const budget = Number(s.expansion?.budgets?.[listing.clubId]);
      const cashStress = Number.isFinite(budget) && budget < 5_000_000;
      const score = Math.round(
        clamp(
          Math.max(listing.distressScore || 0, drawdown * 100) +
            (listing.lastProfit < 0 ? 12 : 0) +
            (cashStress ? 24 : 0),
          0,
          100,
        ),
      );
      listing.distressScore = score;
      return {
        listingId: listing.id,
        clubId: listing.clubId,
        score,
        drawdown: Math.round(drawdown * 10_000) / 10_000,
        marketCap: listing.marketCap,
        askingValue: Math.max(
          1_000_000,
          Math.round(listing.marketCap * clamp(0.72 - score / 250, 0.28, 0.7)),
        ),
        status: score >= 78 ? "sale-watch" : "distressed",
        since: marketMonth(s.date),
      };
    })
    .filter((candidate) => candidate.score >= 55)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
  market.distressed = candidates;
  return candidates;
}

export function distressedClubCandidates(s, minimumScore = 55) {
  const market = ensureStockMarket(s);
  if (!market.distressed.length) identifyDistressedClubs(s);
  return market.distressed.filter(
    (candidate) => candidate.score >= minimumScore,
  );
}

export function marketCycleBeforePricing(s) {
  return advanceMarketCycle(s);
}

export function marketCycleAfterPricing(s) {
  return identifyDistressedClubs(s);
}
