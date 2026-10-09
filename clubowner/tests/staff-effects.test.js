// 0.30 المجموعة ٢: الطاقم الفني والكشافون — تأثيرات رقمية ودقة تقارير.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { addDays, daysBetween } from "../src/core/utils.js";
import { squad } from "../src/models/player.js";
import { injuryProbability } from "../src/services/matchConsequences.js";
import {
  fitnessFactor, gkGainBonus, gkChanceBonus, doctorDay, doctorMonth,
  gkSkillOf, fitnessSkillOf, doctorSkillOf,
} from "../src/services/staff/effects.js";
import { assignScout, scoutMonth, reportError, reportBias } from "../src/services/staff/scouts.js";
import { corpEmployees } from "../src/services/staff/staffCorp.js";
import { staffView } from "../src/features/staff.js";

const game = () => createGame({ database: "demo" });
const hire = (s, role, skill) => {
  s.staffCorp.hq.level = 5;
  const emp = {
    id: "emp-test-" + role, role, fame: "generated", fid: null,
    name: { ar: "مختبر " + role, en: "Test", fr: "Test" }, skill, level: 1,
    wage: 100000, bonusPct: 0, releaseClause: 0, contractEnd: addDays(s.date, 365),
    joined: s.date, loyalty: 60, lastRaise: s.date, assignment: null, history: [],
  };
  s.staffCorp.employees.push(emp);
  return emp;
};

test("اللياقة: معامل إصابات حقيقي يخفض الاحتمال", () => {
  const s = game();
  assert.equal(fitnessSkillOf(s), 60);
  assert.ok(fitnessFactor(s) < 1 && fitnessFactor(s) >= 0.6);
  const p = squad(s)[0];
  const base = injuryProbability(p);
  assert.ok(injuryProbability(p, fitnessFactor(s)) < base);
  // بلا مدرب لياقة: المعامل ١ (السلوك القديم).
  s.staffCorp.employees = s.staffCorp.employees.filter((e) => e.role !== "fitness");
  assert.equal(fitnessFactor(s), 1);
  validateSave(s);
});

test("الحراس: مكسب وفرصة تطور بوجود المدرب فقط", () => {
  const s = game();
  assert.equal(gkSkillOf(s), 58);
  assert.equal(gkGainBonus(s), 0.1);
  assert.ok(gkChanceBonus(s) > 0.1);
  const gk = corpEmployees(s).find((e) => e.role === "gk");
  gk.skill = 80;
  assert.equal(gkGainBonus(s), 0.3);
  s.staffCorp.employees = s.staffCorp.employees.filter((e) => e.role !== "gk");
  assert.equal(gkGainBonus(s), 0);
  assert.equal(gkChanceBonus(s), 0);
});

test("الطبيب: شفاء شهري أسرع بمهارة أعلى", () => {
  const s = game();
  assert.equal(doctorSkillOf(s), 65);
  const p = squad(s)[0];
  p.injuryUntil = addDays(s.date, 20);
  p.staffDx = p.injuryUntil;
  doctorMonth(s);
  assert.equal(p.injuryUntil, addDays(s.date, 18), "مهارة ٦٥ تشفي يومين شهريًا");
  // إصابة قصيرة تُشفى تمامًا.
  p.injuryUntil = addDays(s.date, 1);
  p.staffDx = p.injuryUntil;
  doctorMonth(s);
  assert.equal(p.injuryUntil, null);
  validateSave(s);
});

test("الطبيب التعبان يشخّص غلط: انحراف الغياب بمهارة متدنية", () => {
  const s = game();
  const doc = corpEmployees(s).find((e) => e.role === "doctor");
  doc.skill = 30;
  let shifted = 0;
  for (let i = 0; i < 12; i++) {
    const p = squad(s)[i];
    p.injuryUntil = addDays(s.date, 10);
    delete p.staffDx;
  }
  doctorDay(s);
  for (let i = 0; i < 12; i++) {
    const p = squad(s)[i];
    if (daysBetween(s.date, p.injuryUntil) !== 10) shifted += 1;
    assert.ok(p.staffDx === p.injuryUntil, "وُسم التشخيص");
  }
  assert.ok(shifted > 0, "طبيب ٣٠ أخطأ التشخيص فعلًا");
  // الماهر لا يخطئ أبدًا.
  doc.skill = 90;
  const q = squad(s)[13];
  q.injuryUntil = addDays(s.date, 10);
  delete q.staffDx;
  doctorDay(s);
  assert.equal(daysBetween(s.date, q.injuryUntil), 10);
  validateSave(s);
});

test("الكشافون: تعيين مناطق وتقارير دورية بدقة المهارة", () => {
  const s = game();
  const scout = hire(s, "scout", 85);
  assignScout(s, scout.id, "europe");
  assert.equal(scout.assignment.region, "europe");
  const reps = scoutMonth(s);
  assert.ok(reps.length >= 1 && reps.length <= 2, "مهارة ٨٥ تنتج ١-٢ تقرير");
  const p = s.players.find((x) => x.id === reps[0].playerId);
  assert.ok(p.scoutReport && p.scoutReport.scoutId === scout.id);
  assert.deepEqual(reps[0].scoutName, scout.name, "مصدر التقرير محفوظ حتى إذا غادر الكشاف لاحقًا");
  assert.ok(p.scoutReport.max - p.scoutReport.min <= 8, "نطاق ضيق لمهارة عالية");
  assert.equal(reportError(90), 2);
  assert.ok(reportError(50) > reportError(90));
  assert.match(staffView(s, "scouts", "en"), /Test · Europe/, "الواجهة تعرض مصدر كل تقرير ومنطقته");
  validateSave(s);
});

test("الكشاف التعبان يلبّسك مقالب: مبالغة موجبة في الإمكانات", () => {
  const s = game();
  const scout = hire(s, "scout", 40);
  assignScout(s, scout.id, "africa");
  {
    const biases = [];
    for (let i = 0; i < 10; i++) biases.push(reportBias(s, 40));
    assert.ok(biases.every((b) => b >= 3), `انحياز موجب دائمًا: ${biases}`);
    const fair = [];
    for (let i = 0; i < 10; i++) fair.push(reportBias(s, 80));
    assert.ok(fair.some((b) => b <= 0), "الماهر متوازن");
  }
  const reps = scoutMonth(s);
  assert.ok(reps.length >= 1);
  const p = s.players.find((x) => x.id === reps[0].playerId);
  assert.ok(p.scoutReport.max >= p.potential, "المقلب: سقف مضخّم");
  validateSave(s);
});
