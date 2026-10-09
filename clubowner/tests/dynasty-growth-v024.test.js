import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { addDays } from "../src/core/utils.js";
import {
  createDynastyChild,
  dynastyGrowthDay,
  growChild,
  setUpbringing,
} from "../src/services/dynasty.js";
import { advanceTime } from "../src/services/time.js";
import { validateSave } from "../src/core/validation.js";

test("upbringing choices and personality traits shape monthly child growth", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const football = createDynastyChild(s, {
    name: "Football Child",
    age: 10,
    stats: { talent: 40, discipline: 40, ambition: 40 },
  });
  const student = createDynastyChild(s, {
    name: "Student Child",
    age: 10,
    stats: { talent: 40, discipline: 40, ambition: 40 },
  });
  const diligent = createDynastyChild(s, {
    name: "Diligent Child",
    age: 10,
    stats: { talent: 40, discipline: 40, ambition: 40 },
  });
  diligent.traits = ["hardworking", "creative"];
  s.dynasty.children.push(football, student, diligent);
  setUpbringing(s, football.id, "football");
  setUpbringing(s, student.id, "education");
  setUpbringing(s, diligent.id, "education");

  let date = s.date;
  while (date.slice(0, 7) === diligent.growth.lastMonth) date = addDays(date, 1);
  s.date = date;
  assert.equal(growChild(s, football), true);
  assert.equal(growChild(s, student), true);
  assert.equal(growChild(s, diligent), true);
  assert(football.stats.talent > student.stats.talent);
  assert(student.stats.discipline > football.stats.discipline);
  assert(diligent.stats.talent > student.stats.talent);
  assert(diligent.stats.discipline > student.stats.discipline);
  const snapshot = structuredClone(diligent.stats);
  assert.equal(growChild(s, diligent), false, "growth is capped at once per month");
  assert.deepEqual(diligent.stats, snapshot);
  validateSave(s);
});

test("personality traits form at age milestones as children move between stages", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(s, {
    name: "Growing Heir",
    age: 2,
    stats: { talent: 68, discipline: 78, ambition: 64 },
  });
  s.dynasty.children.push(child);
  s.date = addDays(s.date, 365);
  dynastyGrowthDay(s);
  assert.equal(child.age, 3);
  assert.equal(child.stage, "child");
  assert(child.growth.pendingMilestones.includes("child"));
  assert.equal(child.traits.length, 1);
  assert(child.growth.personalityMilestones.includes(3));
  validateSave(s);
});

test("time advancement automatically advances child growth", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  // Cross a quiet month boundary without firing the separate September deadline-day event.
  s.date = "2026-08-24";
  s.startDate = s.date;
  const child = createDynastyChild(s, { name: "Growing Prospect", age: 13 });
  s.dynasty.children.push(child);
  s.events = [];
  s.dynasty.lastEventMonth = s.date.slice(0, 7);
  for (const player of s.players) player.contractEnd = addDays(s.date, 365);
  const month = s.date.slice(0, 7);
  let days = 1;
  while (addDays(s.date, days).slice(0, 7) === month) days++;
  const result = advanceTime(s, days);
  assert.equal(result.advanced, days);
  assert.equal(child.growth.lastMonth, s.date.slice(0, 7));
  validateSave(s);
});
