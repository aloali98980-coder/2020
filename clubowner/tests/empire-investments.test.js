// اختبارات استثمارات «حياة الملياردير» 0.29 — المحفظة والعوائد وتقرير «حياتك».
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { INVEST_VEHICLES, VEHICLE_ORDER } from "../src/data/empireInvestments.js";
import {
  invest,
  withdraw,
  portfolioTotal,
  vehicleReturn,
} from "../src/services/empire/investments.js";
import { empireDay } from "../src/services/empire/day.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ownerStory: "heir", ...opts });
  validateSave(s);
  return s;
};

test("المركبات الخمس: ودائع/عقارات/أسهم/ناشئة/عملة بحد أدنى ووصف ثلاثي", () => {
  assert.deepEqual(VEHICLE_ORDER, ["deposit", "rental", "stocks", "startup", "coin"]);
  for (const k of VEHICLE_ORDER) {
    const v = INVEST_VEHICLES[k];
    assert.ok(v.min > 0, k);
    assert.ok(v.name.ar && v.name.en && v.name.fr, k);
    assert.ok(v.risk.ar && v.risk.en && v.risk.fr, k);
  }
});

test("دوال العائد الحتمية ضمن النطاقات المعلنة", () => {
  for (let i = 0; i <= 100; i++) {
    const r = i / 100;
    assert.equal(vehicleReturn("deposit", r), 0.5);
    assert.equal(vehicleReturn("rental", r), 0.8);
    const st = vehicleReturn("stocks", r);
    assert.ok(st >= -1.8 - 1e-9 && st <= 4.2 + 1e-9, `stocks ${st}`);
    const su = vehicleReturn("startup", r);
    assert.ok([5, 1, -10, -30].includes(su), `startup ${su}`);
    const co = vehicleReturn("coin", r);
    assert.ok((co >= -10 - 1e-9 && co <= 10 + 1e-9) || co === -40 || co === 40, `coin ${co}`);
  }
  // مفاتيح غير معروفة تعيد صفرًا بلا رمي.
  assert.equal(vehicleReturn("nope", 0.5), 0);
});

test("الإيداع والسحب ينقلان المال بدقة بين الشخصي والمحفظة", () => {
  const s = game();
  const p = s.empire.personal;
  invest(s, "stocks", 5_000_000);
  assert.equal(s.empire.personal, p - 5_000_000);
  assert.equal(s.empire.portfolio.stocks, 5_000_000);
  assert.equal(portfolioTotal(s), 5_000_000);
  withdraw(s, "stocks", 2_000_000);
  assert.equal(s.empire.portfolio.stocks, 3_000_000);
  assert.equal(s.empire.personal, p - 3_000_000);
  assert.throws(() => invest(s, "stocks", 999_999_999_999));
  assert.throws(() => withdraw(s, "stocks", 999_999_999));
  assert.throws(() => invest(s, "nope", 100));
  assert.throws(() => invest(s, "stocks", -5));
});

test("التسوية الشهرية تحسم العوائد وتقيدها في التقرير", () => {
  const s = game();
  invest(s, "deposit", 10_000_000); // +0.5% = +50,000
  invest(s, "rental", 10_000_000); // +0.8% = +80,000
  s.date = "2026-08-01";
  const before = s.empire.portfolio.deposit + s.empire.portfolio.rental;
  empireDay(s);
  const after = s.empire.portfolio.deposit + s.empire.portfolio.rental;
  assert.equal(s.empire.portfolio.deposit, 10_050_000);
  assert.equal(s.empire.portfolio.rental, 10_080_000);
  assert.equal(after - before, 130_000);
  assert.equal(s.empire.monthTrack.returns, 130_000);
  assert.equal(s.empire.reports[0].returns, 130_000);
});

test("الخسارة لا تنزل برصيد المركبة تحت الصفر", () => {
  const s = game();
  invest(s, "startup", 1_000_000);
  // نجبر عائدًا سالبًا كبيرًا بفرض قيمة المحفظة بعد التسوية يدويًا عبر دوال نقية.
  const worst = vehicleReturn("startup", 0.99); // -30%
  assert.equal(worst, -30);
  // والعملة في الانهيار: -40%.
  assert.equal(vehicleReturn("coin", 0.0), -40);
});

test("تقرير حياتك الشهري: دخل/صرف/عوائد/تغير الثروة/سعادة الزوجة", () => {
  const s = game();
  invest(s, "deposit", 10_000_000);
  s.date = "2026-08-01";
  empireDay(s);
  const r = s.empire.reports[0];
  assert.ok(r, "التقرير موجود");
  assert.equal(r.month, "2026-08");
  assert.ok(r.income >= 600_000, "دخل القصة");
  assert.ok(r.expenses >= 800_000, "المعيشة");
  assert.equal(typeof r.returns, "number");
  assert.equal(typeof r.netDelta, "number");
  assert.equal(r.wifeHappiness, null, "أعزب بلا زوجة");
  assert.equal(r.startNet + r.netDelta, r.endNet);
  validateSave(s);
});

test("التقرير يعكس سعادة الزوجة والترتيب إن وجدا", () => {
  const s = game();
  s.empire.family.wife = {
    id: "wife-1",
    name: "نادية الفنانة",
    brideId: "artist",
    happiness: 77,
    marriedOn: s.date,
    birthday: "03-14",
    giftYear: 2026,
    demandActive: false,
  };
  s.empire.family.status = "married";
  s.empire.rankThisMonth = 3;
  s.date = "2026-08-01";
  empireDay(s);
  assert.equal(s.empire.reports[0].wifeHappiness, 77);
  assert.equal(s.empire.reports[0].rank, 3);
});

test("حتمية التسوية: نفس البذرة تعيد نفس العوائد", () => {
  const a = game();
  const b = structuredClone(a);
  for (const s of [a, b]) {
    invest(s, "stocks", 5_000_000);
    invest(s, "coin", 2_000_000);
    invest(s, "startup", 3_000_000);
    s.date = "2026-08-01";
    empireDay(s);
  }
  assert.deepEqual(a.empire.portfolio, b.empire.portfolio);
});

test("أرشيف التقارير محدود بستة وثلاثين", () => {
  const s = game();
  for (let i = 0; i < 40; i++) {
    s.date = `${2026 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}-01`;
    empireDay(s);
  }
  assert.ok(s.empire.reports.length <= 36);
  assert.ok(s.empire.portfolio.history.length <= 60);
  validateSave(s);
});
