import assert from "node:assert/strict";
import { test } from "node:test";
import {
  money,
  num,
  cur,
  setDisplayCurrency,
  getDisplayCurrency,
} from "../src/ui/format.js";

// 0.23: عملة العرض تحويلٌ للعرض فقط بأسعار نموذجية ثابتة؛ المحرك يبقى بالجنيه.
test("عملة العرض: التحويل للعرض فقط بأسعار ثابتة", () => {
  setDisplayCurrency("EGP");
  assert.equal(getDisplayCurrency(), "EGP");
  assert.equal(cur(), "ج.م");
  assert.equal(money(1500), num(1.5) + " ألف");
  assert.equal(money(-1500), "−" + num(1.5) + " ألف");

  setDisplayCurrency("USD");
  assert.equal(getDisplayCurrency(), "USD");
  assert.equal(cur(), "$");
  // 100000 ج.م × 0.021 = 2100 دولار → اختصار «ألف»
  assert.equal(money(100000), num(2.1) + " ألف");
  // 75 مليون ج.م × 0.021 = 1.575 مليون دولار
  assert.equal(money(75000000), num(1.6) + " مليون");
  // قيم صغيرة تُقرَّب لأقرب صحيح
  assert.equal(money(100), num(2));

  setDisplayCurrency("EGP");
  assert.equal(money(100000), num(100) + " ألف");

  // كود غير معروف يرجع للجنيه بدل الفشل
  setDisplayCurrency("XYZ");
  assert.equal(getDisplayCurrency(), "EGP");

  // إعادة للوضع الافتراضي لضمان عزل بقية الاختبارات
  setDisplayCurrency("EGP");
});
