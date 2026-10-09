import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  academyJourneyDay,
  availableAcademyMentors,
  createDynastyChild,
  dynastyGrowthDay,
  enrollDynastyAcademy,
  growChild,
  haveChild,
  leaveDynastyAcademy,
  marryOwner,
  setAcademyFocus,
  setAcademyMentor,
  setAcademyPosition,
  setUpbringing,
} from "../src/services/dynasty.js";
import { addDays } from "../src/core/utils.js";
import { advanceTime } from "../src/services/time.js";
import { dynastyView } from "../src/features/dynasty.js";
import { getLanguage, setLanguage } from "../src/i18n/index.js";

test("save v23 initializes an empty dynasty without changing the club's starting finances", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  assert.equal(SAVE_VERSION, 23);
  assert.equal(s.version, 23);
  assert.equal(s.dynasty.generation, 1);
  assert.equal(s.dynasty.owner.age, 45);
  assert.deepEqual(s.dynasty.children, []);
  validateSave(s);
});

test("v20 migration preserves the current owner age and existing children's ages, stats, traits and heir", () => {
  const old = createGame({ database: "current", leagues: ["eg"] });
  old.version = 20;
  delete old.dynasty;
  old.ownerAge = 63;
  old.familyName = "Nassar";
  old.children = [
    {
      id: "legacy-teen",
      name: "Legacy Teen",
      age: 16,
      talent: 77,
      stats: { talent: 79, discipline: 64, ambition: 82 },
      traits: ["hardworking", "قيادي"],
      isHeir: true,
    },
    { id: "legacy-child", name: "Legacy Child", age: 8, stats: { talent: 56, discipline: 71, ambition: 49 } },
  ];
  const ids = old.players.map((player) => player.id);
  const cash = old.finance.cash;

  const migrated = migrateSave(old);
  assert.equal(old.version, 20, "migration works on a copy");
  assert.equal(migrated.version, 23);
  assert.equal(migrated.dynasty.owner.age, 63);
  assert.equal(migrated.dynasty.familyName, "Nassar");
  assert.equal(migrated.dynasty.children[0].age, 16);
  assert.equal(migrated.dynasty.children[0].stage, "teen");
  assert.deepEqual(migrated.dynasty.children[0].stats, { talent: 79, discipline: 64, ambition: 82 });
  assert.deepEqual(migrated.dynasty.children[0].traits, ["hardworking", "leader"]);
  assert.equal(migrated.dynasty.heirId, "legacy-teen");
  assert.equal(migrated.dynasty.children[1].age, 8);
  assert.equal(migrated.finance.cash, cash);
  assert.deepEqual(migrated.players.map((player) => player.id), ids);
  validateSave(migrated);
  assert.strictEqual(migrateSave(migrated), migrated, "current save migration is idempotent");
});

test("v20 migration normalizes academy progress without discarding an existing child", () => {
  const old = createGame({ database: "current", leagues: ["eg"] });
  old.version = 20;
  delete old.dynasty;
  old.children = [{
    id: "legacy-academy-child",
    name: "Legacy Academy Child",
    age: 14,
    academy: { enrolled: true, enteredOn: old.date, focus: "technical", form: 72, matches: [], reports: [] },
  }];
  const migrated = migrateSave(old);
  const child = migrated.dynasty.children[0];
  assert.equal(child.age, 14);
  assert.equal(child.academy.enrolled, true);
  assert.equal(child.academy.focus, "technical");
  assert.equal(child.academy.position, "CM");
  assert.equal(child.academy.lastTrainingMonth, old.date.slice(0, 7));
  validateSave(migrated);
});

test("v21 migration supplies the expanded academy and event fields without changing family or finances", () => {
  const old = createGame({ database: "current", leagues: ["eg"] });
  old.version = 21;
  old.dynasty.owner.age = 64;
  old.dynasty.owner.birthDate = "1962-09-24";
  old.dynasty.publicBalance = 73;
  const child = createDynastyChild(old, { name: "Existing Prospect", age: 15 });
  child.academy = {
    enrolled: true,
    enteredOn: old.date,
    focus: "technical",
    mentorId: null,
    form: 68,
    injuryUntil: null,
    matches: [],
    reports: [],
  };
  old.dynasty.children.push(child);
  const cash = old.finance.cash;
  const playerIds = old.players.map((player) => player.id);
  const migrated = migrateSave(old);
  assert.equal(migrated.version, 23);
  assert.equal(migrated.dynasty.owner.age, 64);
  assert.equal(migrated.dynasty.publicBalance, 73);
  assert.equal(migrated.dynasty.children[0].age, 15);
  assert.equal(migrated.dynasty.children[0].academy.position, "CM");
  assert.equal(migrated.dynasty.children[0].academy.lastTrainingMonth, old.date.slice(0, 7));
  assert.equal(migrated.finance.cash, cash);
  assert.deepEqual(migrated.players.map((player) => player.id), playerIds);
  validateSave(migrated);
});

test("v20 save without family data waits for the first marriage and childbirth", () => {
  const old = createGame({ database: "current", leagues: ["eg"] });
  old.version = 20;
  delete old.dynasty;
  old.ownerAge = 52;
  const migrated = migrateSave(old);
  assert.equal(migrated.dynasty.owner.age, 52);
  assert.equal(migrated.dynasty.children.length, 0);
  assert.equal(migrated.dynasty.spouse, null);
  validateSave(migrated);
});

test("child stats grow from upbringing choices and personality traits, with a monthly cap", () => {
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
  while (date.slice(0, 7) === diligent.growth.lastMonth)
    date = addDays(date, 1);
  s.date = date;
  assert.equal(growChild(s, football), true);
  assert.equal(growChild(s, student), true);
  assert.equal(growChild(s, diligent), true);
  assert(football.stats.talent > student.stats.talent, "football focus builds talent");
  assert(student.stats.discipline > football.stats.discipline, "education builds discipline");
  assert(diligent.stats.talent > student.stats.talent, "creative and hardworking traits improve development");
  assert(diligent.stats.discipline > student.stats.discipline, "hardworking trait improves discipline");
  const snapshot = structuredClone(diligent.stats);
  assert.equal(growChild(s, diligent), false, "a child cannot receive duplicate monthly growth");
  assert.deepEqual(diligent.stats, snapshot);
  validateSave(s);
});

test("traits form at age milestones, and the infant-to-child transition is recorded", () => {
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

test("the family starts through marriage and birth; newborn stats remain within bounds", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  marryOwner(s, "Partner");
  const child = haveChild(s, "New Heir");
  assert.equal(s.dynasty.spouse, "Partner");
  assert.equal(child.age, 0);
  assert.equal(child.stage, "infant");
  assert(Object.values(child.stats).every((value) => value >= 0 && value <= 100));
  assert.throws(() => haveChild(createGame({ database: "current", leagues: ["eg"] }), "No parents"));
  validateSave(s);
});

test("academy enrollment has age and path gates, position/focus choices, and experienced club mentors", () => {
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
  const mentors = availableAcademyMentors(s);
  assert(mentors.some((mentor) => mentor.id === veteran.id));
  setAcademyMentor(s, child.id, veteran.id);
  assert.equal(child.academy.mentorId, veteran.id);
  validateSave(s);
  leaveDynastyAcademy(s, child.id);
  assert.equal(child.academy.enrolled, false);
  assert.equal(child.academy.mentorId, veteran.id, "leaving preserves the academy record");
  validateSave(s);
});

test("academy months produce training reports and fixtures with a one-report monthly cap", () => {
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
  assert.deepEqual(child.academy, snapshot, "a child receives at most one report per month");
  validateSave(s);
});

test("time advancement automatically runs dynasty growth and the academy journey", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(s, { name: "Growing Prospect", age: 13 });
  s.dynasty.children.push(child);
  enrollDynastyAcademy(s, child.id, "CM");
  s.events = [];
  s.dynasty.lastEventMonth = s.date.slice(0, 7);
  for (const player of s.players) player.contractEnd = addDays(s.date, 365);
  const month = s.date.slice(0, 7);
  let days = 1;
  while (addDays(s.date, days).slice(0, 7) === month) days++;
  const result = advanceTime(s, days);
  assert.equal(result.advanced, days);
  assert.equal(child.growth.lastMonth, s.date.slice(0, 7));
  assert.equal(child.academy.reports.length, 1);
  assert.equal(child.academy.trainingSessions, 1);
  validateSave(s);
});

test("academy mentors add a measurable training benefit", () => {
  const first = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(first, { name: "Mentored", age: 14, stats: { talent: 70, discipline: 70, ambition: 60 } });
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

test("the dynasty page and academy controls have Arabic, English and French text", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(s, { name: "UI Heir", age: 14 });
  s.dynasty.children.push(child);
  const originalLanguage = getLanguage();
  try {
    for (const [language, title] of [["ar", "الأجيال"], ["en", "Dynasty"], ["fr", "Dynastie"]]) {
      setLanguage(language);
      const html = dynastyView(s);
      assert(html.includes(title));
      assert(html.includes(`data-dynasty-upbringing="${child.id}"`));
      assert(html.includes(`dynasty-academy-position-${child.id}`));
      assert(html.includes("dynasty-child-form") === false, "birth form is hidden before marriage");
    }
  } finally {
    setLanguage(originalLanguage);
  }
});
