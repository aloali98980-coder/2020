// الدفعة 5 — القسم 2: المنشآت. العدد الفعلي 37، كل منشأة صالحة، وكل قناة أثر مربوطة بمستهلك.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import { CITY_FACILITIES, CITY_GROUPS, cityFacility } from "../src/data/sportsCityFacilities.js";
import { ensureSportsCity } from "../src/services/sportsCity.js";
import { cityEffects, cityEconomy, settleCityMonth } from "../src/services/cityFacilities.js";
import { sellSubscriptions, initCommerce } from "../src/services/commerce.js";
import { sportsCityView } from "../src/features/sportsCity.js";

setLanguage("ar");

const fresh = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  ensureSportsCity(s);
  return s;
};

test("العدد الفعلي للمنشآت 37، ومجموع المجموعات يطابق القائمة", () => {
  assert.equal(CITY_FACILITIES.length, 37);
  const groupTotal = Object.values(CITY_GROUPS).reduce((a, b) => a + b, 0);
  assert.equal(groupTotal, 37);
  for (const [group, n] of Object.entries(CITY_GROUPS)) {
    assert.equal(CITY_FACILITIES.filter((f) => f.group === group).length, n, group);
  }
});

test("كل منشأة صالحة: معرّف فريد، أسماء بثلاث لغات، تكلفة وصيانة وأثر موجب", () => {
  const ids = new Set();
  for (const f of CITY_FACILITIES) {
    assert.ok(!ids.has(f.id), `معرّف مكرر ${f.id}`);
    ids.add(f.id);
    for (const key of ["ar", "en", "fr"]) assert.ok(f.name[key], `${f.id} ${key}`);
    assert.ok(f.cost > 0, `${f.id} cost`);
    assert.ok(f.upkeep >= 0 && f.income >= 0, `${f.id} economy`);
    assert.ok(f.value > 0, `${f.id} value`);
    assert.ok(cityFacility(f.id) === f);
  }
});

test("قائمة المنشآت تعرض المنشآت كلها بلا رموز مكسورة", () => {
  const s = fresh();
  const html = sportsCityView(s);
  for (const f of CITY_FACILITIES) assert.ok(html.includes(f.name.ar), `معروضة: ${f.id}`);
  assert.ok(!/undefined|NaN/.test(html));
});

test("قناة الأحداث تدر دخلًا شهريًا: صالة مغطاة = مبناها + حدثان", () => {
  const base = fresh();
  const withHall = fresh();
  withHall.sportsCity.facilities = ["indoorArena"];
  const hall = cityFacility("indoorArena");
  const diff = cityEconomy(withHall).income - cityEconomy(base).income;
  assert.equal(diff, hall.income + 2 * 40_000);
});

test("قناة المواصلات (الحضور) تزيد عدد الاشتراكات الموسمية", () => {
  const plain = fresh();
  const transport = fresh();
  transport.sportsCity.facilities = ["transport"];
  plain.fanSupport = 90;
  transport.fanSupport = 90;
  initCommerce(plain);
  initCommerce(transport);
  const sold = (s) => {
    s.commerce.ticketSeason = null;
    sellSubscriptions(s);
    return s.commerce.seasonTickets;
  };
  assert.ok(cityEffects(transport).totals.attendance > 0);
  const a = sold(plain);
  const b = sold(transport);
  assert.ok(a > 0, "عدد الاشتراكات دون المواصلات موجب");
  assert.ok(b > a, `مع المواصلات ${b} ومن دونها ${a}`);
});

test("تمثال الإنجاز (prestige) يرفع الدعم الجماهيري شهريًا", () => {
  const plain = fresh();
  const statues = fresh();
  statues.sportsCity.facilities = ["statues"];
  plain.fanSupport = 50;
  statues.fanSupport = 50;
  settleCityMonth(plain);
  settleCityMonth(statues);
  assert.equal(plain.fanSupport, 50);
  assert.ok(statues.fanSupport > 50, `الدعم ${statues.fanSupport}`);
});
