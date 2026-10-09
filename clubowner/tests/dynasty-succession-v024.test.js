import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { ageAt } from "../src/models/player.js";
import { addDays } from "../src/core/utils.js";
import { isoDate } from "../src/core/isoDate.js";
import {
  calculateLegacyScore,
  createDynastyChild,
  dynastyLifeDay,
  haveChild,
  marryOwner,
  recordLegacyScore,
  resolveRetirementOffer,
  setDynastyHeir,
  setSuccessionEligibility,
} from "../src/services/dynasty.js";
import { advanceTime } from "../src/services/time.js";
import { pendingActions } from "../src/services/inbox.js";
import { dynastyView } from "../src/features/dynasty.js";
import { getLanguage, setLanguage } from "../src/i18n/index.js";

function setOwnerAge(s, age) {
  const year = Number(s.date.slice(0, 4)) - age;
  let birthday = `${String(year).padStart(4, "0")}${s.date.slice(4)}`;
  if (!isoDate(birthday)) birthday = `${String(year).padStart(4, "0")}-02-28`;
  s.dynasty.owner.birthDate = birthday;
  s.dynasty.owner.age = ageAt({ birthDate: birthday }, s.date);
  assert.equal(s.dynasty.owner.age, age);
}

test("heir designation, legal claims and exclusion stay synchronized", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const first = createDynastyChild(s, { name: "First Heir", age: 26 });
  const second = createDynastyChild(s, { name: "Second Heir", age: 24 });
  s.dynasty.children.push(first, second);
  setDynastyHeir(s, first.id);
  assert.equal(s.dynasty.heirId, first.id);
  assert.equal(first.isHeir, true);
  assert.equal(first.legalClaim, true);
  assert.equal(s.dynasty.legalPrelude.status, "prepared");
  setSuccessionEligibility(s, first.id, false);
  assert.equal(first.excludedFromSuccession, true);
  assert.equal(first.isHeir, false);
  assert.equal(s.dynasty.heirId, null);
  setSuccessionEligibility(s, second.id, true);
  setDynastyHeir(s, second.id);
  assert.equal(s.dynasty.heirId, second.id);
  validateSave(s);
});

test("legacy score rewards generations, titles, public standing and preserved family history", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const initial = calculateLegacyScore(s);
  s.dynasty.titlesWon = 2;
  s.dynasty.publicBalance = 90;
  s.dynasty.fanConfidence = 88;
  s.dynasty.shirtSales = 12000;
  s.dynasty.familyArchive.push({ generation: 1, successionSource: "family" });
  const improved = calculateLegacyScore(s);
  assert(improved > initial);
  assert(improved <= 1000);
  assert.equal(recordLegacyScore(s, "test"), improved);
  assert.deepEqual(s.dynasty.legacyHistory.at(-1), {
    date: s.date,
    generation: 1,
    owner: s.dynasty.owner.name,
    score: improved,
    reason: "test",
  });
  validateSave(s);
});

test("time progression raises a required retirement decision; continuing postpones it one year", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  setOwnerAge(s, 65);
  s.dynasty.owner.retirementAge = 65;
  s.dynasty.lastOwnerMonth = s.date.slice(0, 7);
  s.dynasty.lastLegacyMonth = s.date.slice(0, 7);
  s.events = [];
  s.nextClubEventDate = addDays(s.date, 60);
  for (const player of s.players) player.contractEnd = addDays(s.date, 365);
  const result = advanceTime(s, 1);
  assert.equal(result.advanced, 1);
  assert.equal(result.blocked, true);
  const offer = s.dynasty.retirementOffer;
  assert(offer);
  assert.equal(offer.forced, false);
  assert(pendingActions(s).some((action) => action.kind === "dynasty-retirement"));
  resolveRetirementOffer(s, offer.id, "continue");
  assert.equal(s.dynasty.owner.retirementAge, 66);
  assert.equal(s.dynasty.retirementOffer, null);
  assert.equal(pendingActions(s).some((action) => action.kind === "dynasty-retirement"), false);

  setOwnerAge(s, 85);
  const forced = dynastyLifeDay(s);
  assert.equal(forced.forced, true);
  assert.throws(() => resolveRetirementOffer(s, forced.id, "continue"), /سن التقاعد الإلزامي/);
  const forcedSuccession = resolveRetirementOffer(s, forced.id, "retire");
  assert.equal(forcedSuccession.usedDistantRelative, true);
  validateSave(s);
});

test("retirement transfers generations, keeps a dynasty loop, and uses a distant-relative fallback", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const heir = createDynastyChild(s, { name: "Amina Heir", age: 30 });
  s.dynasty.children.push(heir);
  const grandchild = createDynastyChild(s, { name: "Next Generation", age: 5, parentId: heir.id });
  heir.offspring.push(grandchild);
  setDynastyHeir(s, heir.id);
  setOwnerAge(s, 65);
  s.dynasty.owner.retirementAge = 65;
  let offer = dynastyLifeDay(s);
  assert(offer);
  const firstSuccession = resolveRetirementOffer(s, offer.id, "retire");
  assert.equal(firstSuccession.heir.id, heir.id);
  assert.equal(firstSuccession.usedDistantRelative, false);
  assert.equal(s.owner, heir.name);
  assert.equal(s.dynasty.owner.name, heir.name);
  assert.equal(s.dynasty.generation, 2);
  assert.equal(s.dynasty.heirId, null);
  assert.equal(s.dynasty.children.length, 1);
  assert.equal(s.dynasty.children[0].id, grandchild.id);
  assert.equal(s.dynasty.children[0].generation, 2);
  assert.equal(s.dynasty.children[0].parentId, null);
  assert.equal(s.dynasty.familyArchive[0].successionSource, "family");
  validateSave(s);

  setOwnerAge(s, 65);
  s.dynasty.owner.retirementAge = 65;
  offer = dynastyLifeDay(s);
  assert(offer);
  const fallbackSuccession = resolveRetirementOffer(s, offer.id, "retire");
  assert.equal(fallbackSuccession.usedDistantRelative, true);
  assert.equal(s.dynasty.familyArchive.at(-1).successionSource, "distant-relative");
  assert.match(s.dynasty.owner.name, /Cousin/);
  assert.equal(s.dynasty.generation, 3);
  assert.equal(s.dynasty.children.length, 0);
  validateSave(s);

  marryOwner(s, "Next Partner");
  const newChild = haveChild(s, "Continuing Line");
  assert.equal(newChild.generation, 3);
  validateSave(s);
});

test("v22 saves migrate to the retirement-ready schema without changing club data", () => {
  const old = createGame({ database: "current", leagues: ["eg"] });
  old.version = 22;
  old.dynasty.schema = 1;
  delete old.dynasty.retirementOffer;
  delete old.dynasty.lastOwnerMonth;
  delete old.dynasty.lastLegacyMonth;
  const cash = old.finance.cash;
  const players = old.players.map((player) => [player.id, player.name, player.rating]);
  const migrated = migrateSave(old);
  assert.equal(SAVE_VERSION, 25);
  assert.equal(migrated.version, 25);
  assert.equal(migrated.dynasty.schema, 2);
  assert.equal(migrated.dynasty.retirementOffer, null);
  assert.equal(migrated.dynasty.lastOwnerMonth, null);
  assert.equal(migrated.dynasty.lastLegacyMonth, null);
  assert.equal(migrated.finance.cash, cash);
  assert.deepEqual(migrated.players.map((player) => [player.id, player.name, player.rating]), players);
  validateSave(migrated);
});

test("retirement and legacy controls render in Arabic, English and French", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const heir = createDynastyChild(s, { name: "UI Heir", age: 26 });
  s.dynasty.children.push(heir);
  setDynastyHeir(s, heir.id);
  s.dynasty.retirementOffer = { id: "retirement-ui", openedOn: s.date, forced: false };
  const originalLanguage = getLanguage();
  try {
    for (const [language, expected] of [
      ["ar", "قرار التقاعد"],
      ["en", "Retirement decision"],
      ["fr", "Décision de retraite"],
    ]) {
      setLanguage(language);
      const html = dynastyView(s);
      assert(html.includes(expected));
      assert(html.includes('data-action="dynasty-retirement-choice"'));
      assert(html.includes('data-action="dynasty-heir-set"') === false, "the current heir is already appointed");
    }
  } finally {
    setLanguage(originalLanguage);
  }
});
