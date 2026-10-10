// إيقاع البورصة 0.37 — الأسرار، الاكتتابات، الدورة، التسعير، التوزيعات، الرقابة والأحداث.
import { marketCycleAfterPricing, marketCycleBeforePricing } from "./cycles.js";
import { updateStockPrices } from "./engine.js";
import { stockMarketEventDay } from "./events.js";
import {
  publishDueInsideInformation,
  refreshInsideKnowledge,
} from "./insider.js";
import {
  quarterlyShareholderReview,
  syncPublicCompanyValuations,
} from "./ipo.js";
import { marketRegulationDay } from "./regulation.js";
import { settlePortfolioDividends } from "./trading.js";

export function stockMarketDay(s) {
  refreshInsideKnowledge(s);
  publishDueInsideInformation(s);
  if (s.date.slice(8, 10) === "01") {
    syncPublicCompanyValuations(s);
    marketCycleBeforePricing(s);
  }
  const pricing = updateStockPrices(s);
  const dividends = pricing.updated
    ? settlePortfolioDividends(s, pricing.month)
    : null;
  const distressed = pricing.updated ? marketCycleAfterPricing(s) : null;
  const shareholders = quarterlyShareholderReview(s);
  const regulation = marketRegulationDay(s);
  const event = stockMarketEventDay(s);
  return pricing.updated
    ? {
        ...pricing,
        dividends,
        distressed,
        shareholders,
        regulation,
        event,
      }
    : { ...pricing, shareholders, regulation, event };
}
