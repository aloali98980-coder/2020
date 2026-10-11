// الخزنة الموحدة 0.44: الشفرة تخلق المبلغ للوجهة مباشرة بلا عقوبة.
import assert from "node:assert/strict";
import test from "node:test";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { ensureEmpire } from "../src/services/empire/wealth.js";
import { vaultMove, VAULT_AMOUNTS, VAULT_LOG_LIMIT, ensureVault } from "../src/services/vault.js";
import { post } from "../src/services/finance.js";
import { takeFromClub, LootWarning, transferToClub } from "../src/services/empire/transfers.js";

const game = (personal = 5_000_000_000, cash = 5_000_000_000) => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  ensureEmpire(s).personal = personal;
  post(s, cash - s.finance.cash, "test", "رصيد اختبار", "vault-test-funding");
  return s;
};

test("المبالغ الأربعة فقط: 10M / 100M / 500M / 1B", () => {
  assert.deepEqual([...VAULT_AMOUNTS], [10_000_000, 100_000_000, 500_000_000, 1_000_000_000]);
});

test("1B للجيب: يُخلق للشخصي بلا عقوبة ولا نهب ولا حرارة", () => {
  const s = game(0, 0);
  s.board.confidence = 10;
  s.blackFiles = s.blackFiles || {};
  const beforeP = ensureEmpire(s).personal;
  const beforeC = s.finance.cash;
  const beforeSus = s.blackFiles.suspicion ?? 0;
  vaultMove(s, { to: "personal", amount: 1_000_000_000 });
  assert.equal(ensureEmpire(s).personal, beforeP + 1_000_000_000);
  assert.equal(s.finance.cash, beforeC, "الخزينة لا تُمس");
  assert.equal(s.blackFiles.suspicion ?? 0, beforeSus);
  assert.equal(s.board.confidence, 10);
  assert.equal(ensureVault(s).log[0].kind, "cipher");
  assert.equal(validateSave(s), s);
});

test("1B للنادي: بلا فحص رصيد شخصي، وقيد تغطية في الدفتر", () => {
  const s = game(0, 0);
  const beforeP = ensureEmpire(s).personal;
  const beforeC = s.finance.cash;
  vaultMove(s, { to: "club", amount: 1_000_000_000 });
  assert.equal(ensureEmpire(s).personal, beforeP, "الشخصي لا يُخصم");
  assert.equal(s.finance.cash, beforeC + 1_000_000_000);
  assert.ok(s.finance.ledger.some((x) => x.category === "vault" && x.amount === 1_000_000_000));
  assert.equal(validateSave(s), s);
});

test("دعم بصفر: فحص الرصيد ورسالة فيها الرصيد واقتراح", () => {
  const s = game(0, 0);
  assert.throws(
    () => transferToClub(s, 10_000_000),
    (err) => /رصيدك 0/.test(err.message) && /الخزنة/.test(err.message),
  );
});

test("فوق السقف يبقى نهبًا في الدعم العادي (سحب شخصي)", () => {
  const s = game(0, 5_000_000_000);
  s.board.confidence = 10;
  assert.throws(() => takeFromClub(s, 25_000_000), (err) => err instanceof LootWarning || err.code === "loot");
});

test("بلا عقوبة: لا شبهات عند تكرار الشفرة للنادي", () => {
  const s = game(0, 0);
  s.blackFiles = s.blackFiles || {};
  const before = s.blackFiles.suspicion ?? 0;
  for (let i = 0; i < 6; i++) vaultMove(s, { to: "club", amount: 1_000_000_000 });
  assert.equal(s.blackFiles.suspicion ?? 0, before, "لا أثر على الشبهات");
  assert.equal(ensureVault(s).log.length, 6);
});

test("الرفض: مبلغ غير مسموح ووجهة غير صالحة، بلا أي تغيير", () => {
  const s = game(1_000, 0);
  const snapshot = JSON.stringify({ c: s.finance.cash, p: ensureEmpire(s).personal, l: s.finance.ledger.length });
  assert.throws(() => vaultMove(s, { to: "club", amount: 12_345_678 }), /المبلغ/);
  assert.throws(() => vaultMove(s, { to: "moon", amount: 10_000_000 }), /وجهة/);
  assert.equal(JSON.stringify({ c: s.finance.cash, p: ensureEmpire(s).personal, l: s.finance.ledger.length }), snapshot);
});

test("سجل الخزنة محدود بآخر 40 حركة", () => {
  const s = game(0, 0);
  for (let i = 0; i < VAULT_LOG_LIMIT + 5; i++) vaultMove(s, { to: "club", amount: 10_000_000 });
  assert.equal(ensureVault(s).log.length, VAULT_LOG_LIMIT);
  assert.equal(ensureVault(s).log[0].to, "club");
});
