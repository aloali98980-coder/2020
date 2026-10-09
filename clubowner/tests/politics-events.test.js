import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { addDays } from "../src/core/utils.js";
import {
  POLITICAL_EVENT_BY_ID,
  POLITICAL_EVENTS,
} from "../src/data/politicsEvents.js";
import {
  openPoliticalEvent,
  politicalEventDay,
  resolvePoliticalEvent,
} from "../src/services/politics/events.js";
import { politicsView } from "../src/features/politics.js";

const fresh = () => createGame({ database: "current", leagues: ["eg"] });
const takeOffice = (s) => {
  s.politics.office.held = true;
  s.politics.office.termsServed = 1;
  s.politics.office.termStartSeason = s.seasonNumber;
  s.politics.office.termEndSeason = s.seasonNumber + 4;
};

const localized = (value) =>
  value && ["ar", "en", "fr"].every((language) => value[language]);

test("the political-event catalogue contains at least forty unique, fully localized scenarios", () => {
  assert(POLITICAL_EVENTS.length >= 40);
  assert.equal(
    Object.keys(POLITICAL_EVENT_BY_ID).length,
    POLITICAL_EVENTS.length,
  );
  assert(
    POLITICAL_EVENTS.every(
      (event) =>
        localized(event.title) &&
        localized(event.prompt) &&
        ["any", "office", "campaign"].includes(event.scope) &&
        event.choices.length >= 2 &&
        event.choices.every(
          (choice) => localized(choice.label) && choice.effects,
        ),
    ),
  );
});

test("every catalogue choice can resolve and leave a valid save", () => {
  for (const event of POLITICAL_EVENTS)
    for (const choice of event.choices) {
      const s = fresh();
      takeOffice(s);
      if (event.scope === "campaign") {
        s.politics.campaign.active = true;
        s.politics.election.status = "campaigning";
        s.politics.campaign.season = s.politics.election.season;
        s.politics.campaign.startDate = s.date;
        s.politics.campaign.endDate = addDays(s.date, 90);
      }
      openPoliticalEvent(s, event.id);
      resolvePoliticalEvent(s, choice.id);
      validateSave(s);
    }
});

test("a resolved choice updates governance records, writes an archive entry, and enforces cooldown", () => {
  const s = fresh();
  takeOffice(s);
  s.politics.integrity.score = 50;
  s.politics.legitimacy = 55;
  s.politics.opposition.pressure = 30;
  const pending = openPoliticalEvent(s, "assembly-audit");
  assert.equal(pending.eventId, "assembly-audit");
  const result = resolvePoliticalEvent(s, "publish");
  assert.deepEqual(result, {
    eventId: "assembly-audit",
    choiceId: "publish",
    expired: false,
  });
  assert.equal(s.politics.eventState.pending, null);
  assert.equal(s.politics.eventState.history[0].status, "resolved");
  assert.equal(s.politics.eventState.history[0].choiceId, "publish");
  assert.equal(s.politics.finance.publicDisclosure, true);
  assert.equal(s.politics.integrity.score, 55);
  assert.equal(s.politics.integrity.cleanActions, 1);
  assert.equal(s.politics.opposition.pressure, 24);
  assert.throws(() => openPoliticalEvent(s, "assembly-audit"), /التهدئة/);
  validateSave(s);
});

test("event spending is posted to the association ledger and an unaffordable choice remains pending", () => {
  const s = fresh();
  takeOffice(s);
  const startingBalance = s.politics.finance.balance;
  openPoliticalEvent(s, "broadcast-rights");
  resolvePoliticalEvent(s, "open");
  assert.equal(s.politics.finance.balance, startingBalance + 3_000_000);
  assert.equal(s.politics.finance.ledger.at(-1).type, "political-event");
  assert.equal(s.politics.finance.ledger.at(-1).eventId, "broadcast-rights");

  const other = fresh();
  takeOffice(other);
  other.politics.finance.balance = 100;
  openPoliticalEvent(other, "solidarity-grant");
  assert.throws(() => resolvePoliticalEvent(other, "targeted"), /لا يكفي/);
  assert.equal(other.politics.eventState.pending.eventId, "solidarity-grant");
  assert.equal(other.politics.finance.balance, 100);
  assert.equal(other.politics.eventState.history.length, 0);
});

test("monthly scheduling is reproducible, campaign events respect eligibility, and expired events archive neutrally", () => {
  const s = fresh();
  takeOffice(s);
  s.seed = 1;
  assert.equal(politicalEventDay(s), true);
  assert(s.politics.eventState.pending);
  assert.equal(politicalEventDay(s), false, "one political decision per month");
  const integrity = s.politics.integrity.score;
  s.date = addDays(s.date, 31);
  assert.equal(politicalEventDay(s), true, "an expired case is archived");
  assert.equal(s.politics.eventState.pending, null);
  assert.equal(s.politics.eventState.history[0].status, "expired");
  assert.equal(s.politics.integrity.score, integrity);
  validateSave(s);

  const noCampaign = fresh();
  assert.throws(
    () => openPoliticalEvent(noCampaign, "presidential-debate"),
    /لا تنطبق/,
  );
  noCampaign.politics.campaign.active = true;
  assert(openPoliticalEvent(noCampaign, "presidential-debate"));
});

test("v30-to-v31 migration preserves political history and initializes the event register", () => {
  const old = fresh();
  old.version = 30;
  old.politics.legitimacy = 71;
  old.politics.foreign.relations.CAF = 66;
  old.politics.eventState = {
    pending: null,
    history: [],
    cooldowns: {},
    lastMonth: "",
  };
  const migrated = migrateSave(old);
  assert.equal(SAVE_VERSION, 31);
  assert.equal(old.version, 30);
  assert.equal(migrated.version, 31);
  assert.equal(migrated.politics.legitimacy, 71);
  assert.equal(migrated.politics.foreign.relations.CAF, 66);
  assert.deepEqual(migrated.politics.eventState.history, []);
  assert.deepEqual(migrated.politics.eventState.cooldowns, {});
  validateSave(migrated);
});

test("the events screen renders translated choices, deadlines, and the archive", () => {
  const s = fresh();
  takeOffice(s);
  openPoliticalEvent(s, "assembly-audit");
  const view = politicsView(s, "events");
  assert.match(view, /الأحداث السياسية/);
  assert.match(view, /الجمعية تطلب تدقيقًا عاجلًا/);
  assert.match(view, /نشر الدفتر كاملًا/);
  assert.match(view, /السياسي/);
  assert.doesNotMatch(view, /undefined/);
});
