// إيقاع البورصة 0.37 — الأسرار، التسعير، التوزيعات، ثم عين الهيئة الرقابية.
import { updateStockPrices } from "./engine.js";
import {
  publishDueInsideInformation,
  refreshInsideKnowledge,
} from "./insider.js";
import { marketRegulationDay } from "./regulation.js";
import { settlePortfolioDividends } from "./trading.js";

export function stockMarketDay(s) {
  refreshInsideKnowledge(s);
  publishDueInsideInformation(s);
  const pricing = updateStockPrices(s);
  const dividends = pricing.updated
    ? settlePortfolioDividends(s, pricing.month)
    : null;
  const regulation = marketRegulationDay(s);
  return pricing.updated
    ? { ...pricing, dividends, regulation }
    : { ...pricing, regulation };
}
