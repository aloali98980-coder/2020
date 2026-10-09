import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { addDays, clamp } from "../src/core/utils.js";
import { advanceTime } from "../src/services/time.js";
import { validateSave } from "../src/core/validation.js";
import { DYNASTY_EVENTS } from "../src/data/dynastyEvents.js";
import {
  createDynastyChild,
  enrollDynastyAcademy,
  marryOwner,
} from "../src/services/dynasty.js";
import {
  changePublicBalance,
  dynastyEventDay,
  eligibleDynastyEvents,
  resolveDynastyEvent,
} from "../src/services/dynastyEvents.js";
import { pendingActions } from "../src/services/inbox.js";

test("the dynasty event catalog has at least 35 unique, fully localized event stories", () => {
  assert(DYNASTY_EVENTS.length >= 35);
  assert.equal(new Set(DYNASTY_EVENTS.map((event) => event.id)).size, DYNASTY_EVENTS.length);
  for (const event of DYNASTY_EVENTS) {
    assert(event.id && event.condition && ["owner", "child"].includes(event.target));
    for (const phrase of [event.title, event.body, ...event.choices.map((choice) => choice.label)])
      for (const language of ["ar", "en", "fr"])
        assert.equal(typeof phrase[language], "string", `${event.id} is missing ${language}`);
    assert(event.choices.length >= 2, `${event.id} needs meaningful choices`);
  }
});

test("event eligibility follows age, personality, academy, heir and marriage conditions", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(s, {
    name: "Shy Academy Teen",
    age: 16,
    stats: { talent: 90, discipline: 80, ambition: 75 },
  });
  child.traits = ["shy", "hardworking"];
  child.isHeir = true;
  s.dynasty.children.push(child);
  let ids = new Set(eligibleDynastyEvents(s).map(({ definition }) => definition.id));
  assert(ids.has("shy-first-interview"));
  assert(ids.has("hardworking-burnout"));
  assert(ids.has("heir-school-speech"));
  assert(!ids.has("academy-trial-offer"), "a trial event requires academy readiness");
  assert(!ids.has("owner-marriage-rumor"), "marriage events require a spouse");

  marryOwner(s, "Partner");
  enrollDynastyAcademy(s, child.id, "ST");
  child.academy.trialReady = true;
  ids = new Set(eligibleDynastyEvents(s).map(({ definition }) => definition.id));
  assert(ids.has("family-foundation"));
  assert(ids.has("owner-marriage-rumor"));
  assert(ids.has("academy-trial-offer"));
  assert(ids.has("academy-player-choice") === false, "the second trial story requires the player path too");
  validateSave(s);
});

test("public-opinion movement is recorded and clamped at both ends", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  s.dynasty.publicBalance = 98;
  assert.equal(changePublicBalance(s, 10, "test-support"), 100);
  assert.equal(s.dynasty.balanceHistory.at(-1).delta, 2);
  assert.equal(changePublicBalance(s, -150, "test-backlash"), 0);
  assert.equal(s.dynasty.balanceHistory.at(-1).delta, -100);
  assert.equal(changePublicBalance(s, -1, "at-floor"), 0);
  assert.equal(s.dynasty.balanceHistory.length, 2);
  validateSave(s);
});

test("a generated family event pauses time until a choice updates the save and closes its action", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  marryOwner(s, "Partner");
  const record = dynastyEventDay(s);
  assert(record);
  assert.equal(record.status, "open");
  const definition = DYNASTY_EVENTS.find((event) => event.id === record.type);
  const choice = definition.choices[0];
  assert.equal(pendingActions(s).filter((item) => item.kind === "dynasty-event").length, 1);
  const before = s.dynasty.publicBalance;
  resolveDynastyEvent(s, record.id, choice.id);
  assert.equal(record.status, "resolved");
  assert.equal(record.choiceId, choice.id);
  assert.equal(record.resolvedOn, s.date);
  assert.equal(
    s.dynasty.publicBalance,
    clamp(before + (choice.effects.balance || 0), 0, 100),
  );
  assert.equal(pendingActions(s).filter((item) => item.kind === "dynasty-event").length, 0);
  assert.equal(dynastyEventDay(s), null, "the same month cannot spawn a second event");
  assert.throws(() => resolveDynastyEvent(s, record.id, choice.id), /الحدث العائلي غير مفتوح/);
  validateSave(s);
});

test("monthly time progression raises a required, pausing family-event decision", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  marryOwner(s, "Partner");
  s.events = [];
  s.nextClubEventDate = addDays(s.date, 60);
  for (const player of s.players) player.contractEnd = addDays(s.date, 365);
  const result = advanceTime(s, 7);
  assert.equal(result.advanced, 1);
  assert.equal(result.blocked, true);
  const openEvent = s.dynasty.events.find((item) => item.status === "open");
  assert(openEvent);
  assert.equal(openEvent.date, s.date);
  assert.equal(pendingActions(s).some((item) => item.kind === "dynasty-event"), true);
});

test("event conditions can recover after a cooldown expires", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  marryOwner(s, "Partner");
  const first = dynastyEventDay(s);
  const definition = DYNASTY_EVENTS.find((event) => event.id === first.type);
  resolveDynastyEvent(s, first.id, definition.choices[0].id);
  const cooldown = s.dynasty.eventCooldowns[definition.id];
  assert(cooldown > s.date);
  assert(!eligibleDynastyEvents(s).some((item) => item.definition.id === definition.id));
  s.date = addDays(cooldown, 1);
  s.dynasty.lastEventMonth = null;
  const available = eligibleDynastyEvents(s);
  assert(available.some((item) => item.definition.id === definition.id));
  validateSave(s);
});
