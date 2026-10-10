// إيقاع البورصة 0.37 — تحديث الأسعار في أول كل شهر دون التأثير في عشوائية المباريات.
import { updateStockPrices } from "./engine.js";

export function stockMarketDay(s) {
  return updateStockPrices(s);
}
