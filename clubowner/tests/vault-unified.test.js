// الخزنة الموحدة 0.43: تحويل داخلي بين خزينة النادي والثروة الشخصية، بلا عقوبة.
import assert from "node:assert/strict";
import test from "node:test";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { ensureEmpire } from "../src/services/empire/wealth.js";
import { vaultMove, VAULT_AMOUNTS, VAULT_LOG_LIMIT, ensureVault } from "../src/services/vault.js";
import { post } from "../src/services/finance.js";

// الرصيد يُضاف عبر post() ليبقى كشف الحساب متطابقًا مع الرصيد (شرط الحفظة)
const game = (personal = 5_000_000_000, cash = 5_000_000_000) => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  ensureEmpire(s).personal = personal;
  post(s, cash - s.finance.cash, "test", "رصيد اختبار", "vault-test-funding");
  return s;
};

test("المبالغ الأربعة فقط: 10M / 100M / 500M / 1B", () => {
  assert.deepEqual([...VAULT_AMOUNTS], [10_000_000, 100_000_000, 500_000_000, 1_000_000_000]);
});

test("التحويل إلى النادي: الشخصي ينقص والخزينة تزيد، ويُسجَّل في الدفتر", () => {
  const s = game();
  const e = ensureEmpire(s);
  const beforeP = e.personal;
  const beforeC = s.finance.cash;
  vaultMove(s, { to: "club", amount: 100_000_000 });
  assert.equal(e.personal, beforeP - 100_000_000);
  assert.equal(s.finance.cash, beforeC + 100_000_000);
  assert.ok(s.finance.ledger.some((x) => x.category === "vault" && x.amount === 100_000_000));
  assert.equal(validateSave(s), s);
});

test("التحويل إلى الشخصي: خزينة النادي تنقص والشخصي يزيد", () => {
  const s = game();
  const e = ensureEmpire(s);
  const beforeP = e.personal;
  const beforeC = s.finance.cash;
  vaultMove(s, { to: "personal", amount: 500_000_000 });
  assert.equal(e.personal, beforeP + 500_000_000);
  assert.equal(s.finance.cash, beforeC - 500_000_000);
  assert.equal(validateSave(s), s);
});

test("بلا عقوبة: لا شبهات ولا حد شهري، ويمكن التكرار بحرية", () => {
  const s = game(10_000_000_000, 10_000_000_000);
  s.blackFiles = s.blackFiles || {};
  const before = s.blackFiles.suspicion ?? 0;
  for (let i = 0; i < 6; i++) vaultMove(s, { to: "club", amount: 1_000_000_000 });
  assert.equal(s.blackFiles.suspicion ?? 0, before, "لا أثر على الشبهات");
  assert.equal(ensureVault(s).log.length, 6);
});

test("الرفض: مبلغ غير مسموح، وجهة غير صالحة، ورصيد ناقص، بلا أي تغيير", () => {
  const s = game(1_000, 0);
  const snapshot = JSON.stringify({ c: s.finance.cash, p: ensureEmpire(s).personal, l: s.finance.ledger.length });
  assert.throws(() => vaultMove(s, { to: "club", amount: 12_345_678 }), /المبلغ/);
  assert.throws(() => vaultMove(s, { to: "moon", amount: 10_000_000 }), /وجهة/);
  assert.throws(() => vaultMove(s, { to: "club", amount: 10_000_000 }), /الثروة الشخصية/);
  assert.throws(() => vaultMove(s, { to: "personal", amount: 10_000_000 }), /خزينة النادي/);
  assert.equal(JSON.stringify({ c: s.finance.cash, p: ensureEmpire(s).personal, l: s.finance.ledger.length }), snapshot);
});

test("سجل الخزنة محدود بآخر 40 حركة", () => {
  const s = game(100_000_000_000, 100_000_000_000);
  for (let i = 0; i < VAULT_LOG_LIMIT + 5; i++) vaultMove(s, { to: "club", amount: 10_000_000 });
  assert.equal(ensureVault(s).log.length, VAULT_LOG_LIMIT);
  assert.equal(ensureVault(s).log[0].to, "club");
});
