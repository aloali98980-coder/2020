// الدفعة 7 (بعد الإغلاق): ترحيل أرقام القمصان للحفظات القديمة — فريدة داخل كل نادٍ، وidempotent.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { SAVE_VERSION } from "../src/core/game.js";
import { backfillShirtNumbers, shirtNumberOf } from "../src/services/presentation.js";

test("حفظة قديمة بلا أرقام: كل لاعب نشط يأخذ رقمًا فريدًا داخل ناديه، دون رفع رقم الحفظ", () => {
  const s = createGame({ clubId: "ahly", database: "demo" });
  const version = s.version;
  for (const p of s.players) delete p.shirtNumber;
  const old = structuredClone(s);
  const migrated = migrateSave(old);
  assert.equal(migrated.version, version, "رقم الحفظ لا يتغير");
  assert.equal(SAVE_VERSION, version);
  const byClub = new Map();
  for (const p of migrated.players.filter((x) => x.status !== "retired")) {
    assert.ok(Number.isInteger(p.shirtNumber), `${p.name} بلا رقم`);
    assert.ok(p.shirtNumber >= 1 && p.shirtNumber <= 99);
    const set = byClub.get(p.clubId) || new Set();
    assert.ok(!set.has(p.shirtNumber), `رقم مكرر في ${p.clubId}`);
    set.add(p.shirtNumber);
    byClub.set(p.clubId, set);
  }
  assert.equal(backfillShirtNumbers(migrated), 0, "idempotent");
  assert.ok(shirtNumberOf(migrated, migrated.players[0]) !== undefined);
});
