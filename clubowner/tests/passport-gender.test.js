// الجواز (الدفعة 5): حقل الجنس، ولادات 50/50، الوراثة للذكور فقط،
// والحفظ القديم بلا جنس يُعامَل كذكر. قرار «البنت الوحيدة» مرفوض ولا يُنفَّذ.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import {
  createDynastyChild,
  birthGender,
  normalizeGender,
  migrateDynasty,
  setDynastyHeir,
  isSuccessionEligibleGender,
} from "../src/services/dynasty.js";

const fresh = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  s.dynasty = migrateDynasty(s);
  return s;
};

test("الولادات 50/50 تقريبًا على عينة كبيرة", () => {
  const s = { seed: 424242, date: "2026-10-11" };
  let male = 0;
  const n = 4000;
  for (let i = 0; i < n; i++) if (birthGender(s) === "male") male++;
  const ratio = male / n;
  assert.ok(ratio > 0.46 && ratio < 0.54, `نسبة الذكور ${ratio.toFixed(3)}`);
});

test("الحفظ القديم بلا جنس يُعامَل كذكر، والقيم الصالحة تُحفظ", () => {
  assert.equal(normalizeGender(undefined), "male");
  assert.equal(normalizeGender("unknown"), "male");
  assert.equal(normalizeGender("female"), "female");
  assert.equal(normalizeGender("male"), "male");
});

test("الابنة لا تُعيَّن وريثة، والابن يُعيَّن", () => {
  const s = fresh();
  const daughter = createDynastyChild(s, { name: "Nour", age: 20, gender: "female" });
  const son = createDynastyChild(s, { name: "Omar", age: 20, gender: "male" });
  s.dynasty.children.push(daughter, son);
  assert.equal(isSuccessionEligibleGender(daughter), false);
  assert.throws(() => setDynastyHeir(s, daughter.id), /الوراثة للذكور فقط/);
  setDynastyHeir(s, son.id);
  assert.equal(s.dynasty.heirId, son.id);
});

test("الوريث الأنثى المحفوظ قديمًا يُسقط عند الترحيل ولا يبقى وريثًا", () => {
  const s = fresh();
  const daughter = createDynastyChild(s, { name: "Nour", age: 20, gender: "female" });
  daughter.isHeir = true;
  s.dynasty.children = [daughter];
  s.dynasty.heirId = daughter.id;
  const migrated = migrateDynasty(s);
  assert.equal(migrated.heirId, null);
  assert.equal(migrated.children.find((c) => c.id === daughter.id)?.isHeir, false);
});

test("الطفل المولود بعد التحديث يحمل حقل الجنس، والطفل القديم يُرحَّل بذكر", () => {
  const s = fresh();
  const child = createDynastyChild(s, { name: "New", age: 0 });
  assert.ok(["male", "female"].includes(child.gender));
  const old = { id: "dynasty-child-old", name: "Old", age: 5, isHeir: false };
  const migrated = migrateDynasty({ ...s, dynasty: { ...s.dynasty, children: [old] } });
  assert.equal(migrated.children[0].gender, "male", "الحفظ القديم = ذكر");
});
