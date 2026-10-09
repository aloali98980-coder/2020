import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { addDays } from "../src/core/utils.js";
import {
  academyJourneyDay,
  availableAcademyMentors,
  createDynastyChild,
  dynastyGrowthDay,
  enrollDynastyAcademy,
  leaveDynastyAcademy,
  setAcademyFocus,
  setAcademyMentor,
  setAcademyPosition,
} from "../src/services/dynasty.js";
import { validateSave } from "../src/core/validation.js";

test("academy entry obeys age gates and supports focus, position and experienced club mentors", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(s, { name: "Academy Heir", age: 14 });
  const infant = createDynastyChild(s, { name: "Too Young", age: 8 });
  s.dynasty.children.push(child, infant);
  assert.throws(() => enrollDynastyAcademy(s, infant.id, "CM"), /١٠ إلى ١٧/);
  const veteran = s.players.find((player) => player.clubId === s.clubId);
  veteran.appearances = 120;
  const academy = enrollDynastyAcademy(s, child.id, "ST");
  assert.equal(academy.position, "ST");
  setAcademyFocus(s, child.id, "technical");
  setAcademyPosition(s, child.id, "AM");
  assert.equal(child.academy.focus, "technical");
  assert.equal(child.academy.position, "AM");
  assert(availableAcademyMentors(s).some((mentor) => mentor.id === veteran.id));
  setAcademyMentor(s, child.id, veteran.id);
  assert.equal(child.academy.mentorId, veteran.id);
  validateSave(s);
  leaveDynastyAcademy(s, child.id);
  assert.equal(child.academy.enrolled, false);
  assert.equal(child.academy.mentorId, veteran.id, "leaving preserves the academy record");
  validateSave(s);
});

test("academy months create a training report and fixture, capped to one report per month", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(s, {
    name: "Youth Prospect",
    age: 16,
    stats: { talent: 88, discipline: 81, ambition: 70 },
  });
  s.dynasty.children.push(child);
  s.facilities.find((facility) => facility.id === "academy").level = 4;
  enrollDynastyAcademy(s, child.id, "ST");
  const initialRating = child.academy.rating;
  const initialTalent = child.stats.talent;
  let nextDate = s.date;
  while (nextDate.slice(0, 7) === s.date.slice(0, 7)) nextDate = addDays(nextDate, 1);
  s.date = nextDate;
  dynastyGrowthDay(s);
  academyJourneyDay(s);
  assert(child.academy.rating > initialRating);
  assert(child.stats.talent > initialTalent);
  assert.equal(child.academy.trainingSessions, 1);
  assert.equal(child.academy.reports.length, 1);
  assert.equal(child.academy.matches.length, 1);
  assert.equal(child.academy.matches[0].date, nextDate);
  assert.equal(child.academy.trialReady, true);
  const snapshot = structuredClone(child.academy);
  academyJourneyDay(s);
  assert.deepEqual(child.academy, snapshot);
  validateSave(s);
});

test("academy mentors measurably improve development and reports", () => {
  const first = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(first, {
    name: "Mentored",
    age: 14,
    stats: { talent: 70, discipline: 70, ambition: 60 },
  });
  first.dynasty.children.push(child);
  const second = structuredClone(first);
  const secondChild = second.dynasty.children[0];
  const veteran = first.players.find((player) => player.clubId === first.clubId);
  const otherVeteran = second.players.find((player) => player.id === veteran.id);
  veteran.appearances = otherVeteran.appearances = 200;
  veteran.rating = otherVeteran.rating = 80;
  enrollDynastyAcademy(first, child.id, "CM");
  enrollDynastyAcademy(second, secondChild.id, "CM");
  setAcademyMentor(first, child.id, veteran.id);
  let nextDate = first.date;
  while (nextDate.slice(0, 7) === first.date.slice(0, 7)) nextDate = addDays(nextDate, 1);
  first.date = second.date = nextDate;
  dynastyGrowthDay(first);
  dynastyGrowthDay(second);
  academyJourneyDay(first);
  academyJourneyDay(second);
  assert(child.academy.rating > secondChild.academy.rating);
  assert(child.academy.reports[0].gain > secondChild.academy.reports[0].gain);
  validateSave(first);
  validateSave(second);
});
