// الدفعة 5 — القسم 4: بوابة التوازن. 10 مواسم بلا إفلاس (الخزينة لا تنزل تحت الصفر)
// وبلا ثراء مفرط (الخزينة النهائية ≤ 3× البداية). أرقام فقط، لا تغيير لكاش البداية.
import test from "node:test";
import assert from "node:assert/strict";
import { runBalance } from "../scripts/balance-sim.mjs";
import { broadcastMonthly, BROADCAST_MIN, BROADCAST_MAX } from "../src/services/finance.js";
import { LIFESTYLES } from "../src/services/empire/wealth.js";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";

setLanguage("ar");

test("البث: الحدود أرقام ثابتة ومقرّبة لـ10,000 والمتصدر يأخذ الأعلى", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  const n = s.table.length;
  s.table.forEach((r, i) => (r.points = (n - i) * 3));
  s.clubId = s.table[0].clubId;
  const top = broadcastMonthly(s);
  s.clubId = s.table[n - 1].clubId;
  const bottom = broadcastMonthly(s);
  assert.equal(top, BROADCAST_MAX);
  assert.equal(bottom, BROADCAST_MIN);
  assert.ok(top > bottom);
  for (const v of [top, bottom]) assert.equal(v % 10_000, 0);
});

test("البث يُقيَّد داخل الحدود حتى لو كان النادي خارج الجدول", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  s.clubId = "not-in-table";
  assert.equal(broadcastMonthly(s), BROADCAST_MIN);
});

test("بوابة 10 مواسم: لا إفلاس ولا ثراء مفرط في كل البذور المختبرة", () => {
  for (let seed = 1; seed <= 12; seed++) { // كل البذور الاثنتي عشرة
    const r = runBalance({ seasons: 10, seed });
    assert.equal(r.bankruptSeason, null, `seed ${seed} bankrupt in season ${r.bankruptSeason}`);
    for (const row of r.rows) assert.ok(row.cash >= 0, `seed ${seed} season ${row.season} cash ${row.cash}`);
    assert.ok(r.endCash <= 3 * r.startCash, `seed ${seed} explosive: ${r.endCash}`);
  }
});

test("الثروة الشخصية: معيشة «مريحة» 500,000 شهريًا، وتبقى موجبة عبر 10 مواسم", () => {
  assert.equal(LIFESTYLES.comfortable.cost, 500_000);
  for (const seed of [1, 11]) {
    const r = runBalance({ seasons: 10, seed });
    for (const row of r.rows) {
      assert.ok(row.personal > 0, `seed ${seed} season ${row.season} personal ${row.personal}`);
      assert.equal(row.debt, 0, `seed ${seed} season ${row.season} debt`);
    }
  }
});
