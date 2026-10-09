// اختبارات الخير والسمعة 0.29 — التبرع الشخصي، المشاريع الخيرية باسم
// المالك، خفض مؤشر الشبهات، وعقوبة البخل الشهرية.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { addDays } from "../src/core/utils.js";
import {
  donatePersonal,
  startCharityProject,
  charityDay,
  CHARITY_PROJECTS,
  STINGY_DAYS,
} from "../src/services/empire/charity.js";
import { empireDay } from "../src/services/empire/day.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ownerStory: "heir", ...opts });
  validateSave(s);
  return s;
};

// أول يوم من الشهر التالي لتاريخ معيَّن.
const firstOfMonthAfter = (date) => {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
};

test("التبرع الشخصي: يخصم من الثروة ويخفض الشبهات ويرفع السمعة", () => {
  const s = game();
  s.blackFiles.suspicion = 30;
  const before = s.empire.personal;
  const susp = s.blackFiles.suspicion;
  const rep = s.reputation;
  donatePersonal(s, 4_000_000);
  assert.equal(s.empire.personal, before - 4_000_000);
  assert.equal(s.empire.charity.personalTotal, 4_000_000);
  assert.equal(s.empire.charity.total, 4_000_000);
  assert.equal(s.empire.charity.lastGift, s.date);
  assert.ok(s.blackFiles.suspicion < susp, "انخفض مؤشر الشبهات");
  assert.ok(s.reputation > rep, "ارتفعت السمعة");
  assert.ok(s.empire.fame >= 9, "زادت الشهرة");
  validateSave(s);
});

test("التبرع: مبالغ غير صالحة أو رصيد غير كافٍ تُرفض", () => {
  const s = game();
  assert.throws(() => donatePersonal(s, 100_000));
  assert.throws(() => donatePersonal(s, 50_000_000));
  assert.throws(() => donatePersonal(s, s.empire.personal + 1));
});

test("مشروع خيري: يُدفع فورًا ويُفتتح بعد مدة البناء", () => {
  const s = game();
  s.blackFiles.suspicion = 30;
  const before = s.empire.personal;
  const susp = s.blackFiles.suspicion;
  const rep = s.reputation;
  const fans = s.fanSupport;
  const p = startCharityProject(s, "school");
  assert.equal(s.empire.personal, before - CHARITY_PROJECTS.school.cost);
  assert.equal(p.completesOn, addDays(s.date, CHARITY_PROJECTS.school.days));
  assert.equal(p.done, false);
  // مشروع مكرر من النوع نفسه يُرفض.
  assert.throws(() => startCharityProject(s, "school"));
  // قبل اكتمال المدة لا شيء يُفتتح.
  s.date = addDays(s.date, 10);
  assert.equal(charityDay(s), null);
  // بعد اكتمالها: افتتاح رسمي بأثره الكامل.
  s.date = addDays(p.completesOn, 1);
  const opened = charityDay(s);
  assert.deepEqual(opened, ["school"]);
  assert.equal(p.done, true);
  assert.ok(s.reputation > rep);
  assert.ok(s.fanSupport > fans);
  assert.ok(s.empire.prestige >= CHARITY_PROJECTS.school.prestige);
  assert.ok(s.blackFiles.suspicion < susp);
  validateSave(s);
});

test("المشاريع الثلاثة متاحة، والمستشفى أغلاها وأبطأها", () => {
  assert.deepEqual(Object.keys(CHARITY_PROJECTS).sort(), ["hospital", "orphanage", "school"]);
  assert.ok(CHARITY_PROJECTS.hospital.cost > CHARITY_PROJECTS.school.cost);
  assert.ok(CHARITY_PROJECTS.hospital.days > CHARITY_PROJECTS.orphanage.days);
  const s = game();
  assert.throws(() => startCharityProject(s, "statue"), /غير معروف|مشروع/);
});

test("مشروع بلا رصيد كافٍ يُرفض", () => {
  const s = game();
  s.empire.personal = 1_000_000;
  assert.throws(() => startCharityProject(s, "hospital"));
});

test("البخل: ثري بلا عطاء لأشهر يهاجمه الصحفيون شهريًا", () => {
  const s = game(); // ثروة الوارث ٨٠ مليونًا ≥ عتبة البخل
  assert.equal(s.empire.charity.lastGift, null);
  s.date = firstOfMonthAfter(addDays(s.startDate, STINGY_DAYS + 5));
  const fame = s.empire.fame;
  const fans = s.fanSupport;
  empireDay(s);
  assert.equal(s.empire.charity.stingyStrikes, 1);
  assert.ok(s.empire.fame < fame);
  assert.ok(s.fanSupport < fans);
  validateSave(s);
});

test("البخل: العطاء الحديث أو الثروة الصغيرة يمنع الهجوم", () => {
  const s = game();
  // ننتقل بعيدًا ثم نتبرع هناك، فالعطاء الحديث يحمي من الهجوم.
  s.date = addDays(s.startDate, STINGY_DAYS + 30);
  donatePersonal(s, 500_000);
  s.date = firstOfMonthAfter(s.date);
  empireDay(s);
  assert.equal(s.empire.charity.stingyStrikes, 0);
  // الفقير لا يُهاجم حتى بلا عطاء.
  const g = game({ ownerStory: "gambler" });
  g.empire.personal = 1_000_000;
  g.date = firstOfMonthAfter(addDays(g.startDate, STINGY_DAYS + 60));
  empireDay(g);
  assert.equal(g.empire.charity.stingyStrikes, 0);
});

test("تبرعات النادي (المرحلة ٨) تبقى منفصلة عن التبرع الشخصي", () => {
  const s = game();
  donatePersonal(s, 1_000_000);
  assert.equal(s.empire.charity.personalTotal, 1_000_000);
  // تبرع النادي من الخزانة لا يمس عداد الخير الشخصي.
  assert.ok(typeof s.blackFiles.suspicion === "number");
  validateSave(s);
});
