import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { addDays } from "../src/core/utils.js";
import {
  FOREIGN_ORGANIZATIONS,
  HOSTING_EVENTS,
  INTEGRITY_SUBJECTS,
} from "../src/data/politicsGovernance.js";
import {
  addressOpposition,
  holdConfidenceVote,
  oppositionDay,
} from "../src/services/politics/opposition.js";
import {
  conductIntegrityAudit,
  integrityDay,
  openIntegrityInvestigation,
  resolveIntegrityInvestigation,
  submitAssetDeclaration,
} from "../src/services/politics/integrity.js";
import {
  foreignDay,
  holdDiplomaticMission,
  secureExecutiveSeat,
  submitHostingBid,
} from "../src/services/politics/foreign.js";
import {
  recordDisciplineIncident,
  resolveDisciplineCase,
} from "../src/services/politics/committees.js";
import {
  recordLegacyDeparture,
  resignOffice,
  resolveLegacyTrial,
} from "../src/services/politics/legacy.js";

const fresh = () => createGame({ database: "current", leagues: ["eg"] });
const takeOffice = (s) => {
  s.politics.office.held = true;
  s.politics.office.termsServed = 1;
  s.politics.office.termStartSeason = s.seasonNumber;
  s.politics.office.termEndSeason = s.seasonNumber + 4;
};

test("v29 migration fills governance fields neutrally and preserves existing integrity and relations", () => {
  const old = fresh();
  old.version = 29;
  old.politics.integrity.score = 76;
  old.politics.opposition.pressure = 21;
  old.politics.foreign.relations.CAF = 73;
  delete old.politics.integrity.assetDeclarations;
  delete old.politics.integrity.actions;
  delete old.politics.integrity.reviewedEvidenceIds;
  delete old.politics.integrity.lastReviewMonth;
  delete old.politics.opposition.lastResponseMonth;
  delete old.politics.foreign.missions;
  delete old.politics.foreign.history;
  delete old.politics.foreign.lastMissionByOrg;
  delete old.politics.foreign.lastReviewMonth;
  delete old.politics.legacy.trial.recordId;
  delete old.politics.legacy.trial.openedDate;
  delete old.politics.legacy.trial.evidenceScore;
  delete old.politics.legacy.trial.response;
  const migrated = migrateSave(old);
  assert.equal(SAVE_VERSION, 33);
  assert.equal(old.version, 29);
  assert.equal(migrated.version, 33);
  assert.equal(migrated.politics.integrity.score, 76);
  assert.equal(migrated.politics.opposition.pressure, 21);
  assert.equal(migrated.politics.foreign.relations.CAF, 73);
  assert.deepEqual(migrated.politics.integrity.actions, []);
  assert.deepEqual(migrated.politics.foreign.missions, []);
  validateSave(migrated);
});

test("opposition pressure matures into a named weighted no-confidence vote and can end a term", () => {
  const s = fresh();
  takeOffice(s);
  s.politics.integrity.score = 15;
  s.politics.legitimacy = 12;
  s.politics.opposition.pressure = 100;
  s.politics.clubs.forEach((club) => (club.support = 0));
  assert.equal(oppositionDay(s), true);
  assert.equal(s.politics.opposition.noConfidence.status, "open");
  let iterations = 0;
  while (
    s.politics.opposition.noConfidence.status !== "vote-ready" &&
    iterations < 20
  ) {
    s.date = addDays(s.date, 32);
    oppositionDay(s);
    iterations++;
  }
  assert(s.politics.opposition.noConfidence.counter >= 100);
  assert.equal(s.politics.opposition.noConfidence.status, "vote-ready");
  const result = holdConfidenceVote(s);
  assert.equal(result.passed, true);
  assert.equal(result.votes.length, s.politics.clubs.length);
  assert.equal(s.politics.office.held, false);
  assert.equal(s.politics.office.lastDeparture.reason, "no-confidence");
  assert.equal(s.politics.legacy.departures.at(-1).reason, "no-confidence");
  assert.equal(s.politics.election.status, "scheduled");
  validateSave(s);
});

test("a public response can calm opposition while an attack damages integrity", () => {
  const s = fresh();
  takeOffice(s);
  s.politics.opposition.pressure = 60;
  s.politics.integrity.score = 60;
  const before = s.politics.integrity.score;
  addressOpposition(s, "public-records");
  assert.equal(s.politics.finance.publicDisclosure, true);
  assert.equal(s.politics.opposition.pressure, 48);
  assert(s.politics.integrity.score > before);
  assert.throws(() => addressOpposition(s, "hearing"), /هذا الشهر/);
  s.date = addDays(s.date, 31);
  addressOpposition(s, "attack");
  assert(s.politics.integrity.score < before + 3);
  assert.equal(s.politics.integrity.illicitActions, 1);
  validateSave(s);
});

test("asset declarations and financial integrity audits are persistent and season-idempotent", () => {
  const s = fresh();
  takeOffice(s);
  s.politics.integrity.score = 80;
  const declaration = submitAssetDeclaration(s);
  assert.equal(declaration.associationBalance, s.politics.finance.balance);
  assert.throws(() => submitAssetDeclaration(s), /بالفعل/);
  const before = s.politics.integrity.score;
  const audit = conductIntegrityAudit(s);
  assert.equal(audit.status, "clean");
  assert(s.politics.integrity.score > before);
  assert.equal(s.politics.integrity.lastAudit.reportId, audit.id);
  validateSave(s);
});

test("integrity investigation waits for its due date, distinguishes clean reviews, and can refer evidence", () => {
  const s = fresh();
  takeOffice(s);
  const clearCase = openIntegrityInvestigation(s, "finance");
  assert.equal(clearCase.evidenceScore, 0);
  assert.throws(
    () => resolveIntegrityInvestigation(s, clearCase.id, "clear"),
    /قبل/,
  );
  s.date = clearCase.dueDate;
  assert.equal(
    resolveIntegrityInvestigation(s, clearCase.id, "clear").status,
    "cleared",
  );

  const player = s.players.find(
    (entry) => entry.clubId === s.clubId && entry.status !== "retired",
  );
  const disciplineCase = recordDisciplineIncident(
    s,
    { id: "fixture-integrity-1" },
    player,
  );
  resolveDisciplineCase(s, disciplineCase.id, "dismiss");
  assert.equal(integrityDay(s), 1);
  const review = openIntegrityInvestigation(s, "discipline");
  assert(review.evidenceScore >= 20);
  s.date = review.dueDate;
  assert.equal(
    resolveIntegrityInvestigation(s, review.id, "refer").status,
    "referred",
  );
  assert.equal(s.politics.legacy.trial.status, "open");
  assert.equal(resolveLegacyTrial(s, "contest").verdict, "cleared");
  validateSave(s);
});

test("diplomatic missions raise relations and influence, enforce cooldowns, and can win an executive seat", () => {
  const s = fresh();
  takeOffice(s);
  const initialRelation = s.politics.foreign.relations.CAF;
  const first = holdDiplomaticMission(s, "CAF", "dialogue");
  assert(s.politics.foreign.relations.CAF > initialRelation);
  assert(s.politics.foreign.influence > 0);
  assert.throws(
    () => holdDiplomaticMission(s, "CAF", "governance"),
    /هذا الشهر/,
  );
  assert(
    s.politics.finance.ledger.some(
      (entry) => entry.id && entry.type === "diplomatic-summit",
    ),
  );
  for (let count = 0; count < 3; count++) {
    s.date = addDays(s.date, 31);
    holdDiplomaticMission(s, "CAF", "governance");
  }
  assert(s.politics.foreign.relations.CAF >= 70);
  assert(s.politics.foreign.influence >= 8);
  const seat = secureExecutiveSeat(s, "CAF");
  assert.equal(seat.organizationId, "CAF");
  assert.equal(seat.expiresSeason, s.seasonNumber + 4);
  validateSave(s);
  assert(first.id);
});

test("a hosting bid resolves after thirty days and credits the award without changing club accounts", () => {
  const s = fresh();
  takeOffice(s);
  s.politics.foreign.relations.CAF = 80;
  s.politics.foreign.influence = 20;
  s.politics.legitimacy = 80;
  const initial = s.politics.finance.balance;
  const bid = submitHostingBid(s, "continental-cup");
  assert.equal(bid.status, "pending");
  assert.throws(() => submitHostingBid(s, "continental-cup"), /مفتوح/);
  s.date = bid.dueDate;
  foreignDay(s);
  assert.equal(bid.status, "awarded");
  assert.equal(bid.score >= HOSTING_EVENTS[bid.eventId].threshold, true);
  assert.equal(s.politics.finance.balance, initial - bid.bidCost + bid.award);
  assert(
    s.politics.finance.ledger.some((entry) => entry.type === "hosting-award"),
  );
  validateSave(s);
});

test("resignation archives a clean reformist legacy, while an exposed former president can be sanctioned", () => {
  const clean = fresh();
  takeOffice(clean);
  clean.politics.integrity.score = 96;
  clean.politics.legitimacy = 92;
  clean.politics.council.history = [
    "broadcast-equity",
    "youth-development",
    "solidarity-fund",
  ].map((lawId, index) => ({
    type: "bill",
    billId: `test-bill-${index}`,
    lawId,
    date: clean.date,
    season: clean.seasonNumber,
    passed: true,
    yesWeight: 1,
    noWeight: 0,
    totalWeight: 1,
    dissentIds: [],
  }));
  const record = resignOffice(clean);
  assert.equal(record.titleId, "statesperson");
  assert(
    clean.politics.legacy.honours.some(
      (honour) => honour.id === "trusted-statesperson",
    ),
  );
  assert(
    clean.politics.legacy.honours.some(
      (honour) => honour.id === "institutional-reformer",
    ),
  );
  validateSave(clean);

  const exposed = fresh();
  takeOffice(exposed);
  exposed.politics.integrity.score = 18;
  exposed.politics.integrity.illicitActions = 4;
  exposed.politics.legitimacy = 15;
  recordLegacyDeparture(exposed, "resignation");
  assert.equal(exposed.politics.legacy.trial.status, "open");
  assert.equal(resolveLegacyTrial(exposed, "contest").verdict, "sanctioned");
  assert.equal(exposed.politics.legacy.title, "disgraced");
  validateSave(exposed);
});

test("governance catalogs cover all five international organisations and trilingual choices", () => {
  const localized = (value) =>
    ["ar", "en", "fr"].every((language) => value?.[language]);
  assert.equal(Object.keys(FOREIGN_ORGANIZATIONS).length, 5);
  assert(
    Object.values(FOREIGN_ORGANIZATIONS).every((organization) =>
      localized(organization.name),
    ),
  );
  assert(
    Object.values(HOSTING_EVENTS).every(
      (event) => localized(event.name) && localized(event.description),
    ),
  );
  assert(Object.values(INTEGRITY_SUBJECTS).every(localized));
});
