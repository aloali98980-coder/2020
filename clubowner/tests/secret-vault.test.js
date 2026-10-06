import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { secretDeposit } from "../src/services/finance.js";

// 0.23: خزنة المالك السرية — زر غش مخفي. يجب أن يمر الإيداع عبر الدفاتر
// كأي تدفق نقدية حتى تبقى الإدارة المالية والتحقق سليمين.
test("الخزنة السرية: الإيداع يزيد الرصيد ويسجل قيدًا في الدفاتر", () => {
  const s = createGame({ owner: "عمر" });
  const before = s.finance.cash;
  const after = secretDeposit(s, 100000000);
  assert.equal(after, before + 100000000);
  assert.equal(s.finance.cash, before + 100000000);
  const entry = s.finance.ledger[0];
  assert.equal(entry.category, "vault");
  assert.equal(entry.amount, 100000000);
  assert.ok(entry.key.startsWith("vault"));
  validateSave(s);
  // إيداعات متتالية مسمووحة (مفاتيح فريدة)
  secretDeposit(s, 1000000);
  secretDeposit(s, 1000000);
  assert.equal(s.finance.cash, before + 102000000);
  assert.equal(s.finance.ledger.filter((e) => e.category === "vault").length, 3);
  validateSave(s);
});

test("الخزنة السرية: ترفض المبالغ غير الصالحة", () => {
  const s = createGame({ owner: "عمر" });
  for (const bad of [0, -5, 1000000001, 5000.5, "x", NaN]) {
    assert.throws(() => secretDeposit(s, bad), /مبلغ الإيداع/);
  }
  assert.equal(s.finance.cash, createGame({ owner: "عمر" }).finance.cash);
});
