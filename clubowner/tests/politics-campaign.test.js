import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  CLUB_DEMANDS,
  POLITICAL_BLOCS,
  POLITICAL_CANDIDATES,
  POLITICAL_CYCLE_SEASONS,
} from "../src/data/politicsCatalog.js";
import {
  adjustClubSupport,
  formAlliance,
  politicalSentiment,
  reconcilePoliticalMap,
} from "../src/services/politics/state.js";
import {
  campaignMonthlyTick,
  conductElection,
  debate,
  fundCampaign,
  holdConference,
  makeCampaignPromise,
  offerCandidateAlliance,
  visitClub,
} from "../src/services/politics/campaign.js";

const newSave = () => createGame({ database: "current", leagues: ["eg"] });
function readyCampaign(s) {
  s.date = "2027-07-01";
  s.nextSeasonDate = "2028-07-01";
  s.seasonNumber = s.politics.election.season;
  campaignMonthlyTick(s);
}

test("new and migrated league maps include every club, neutral support, weighted votes and three blocs", () => {
  const s = newSave();
  assert.equal(SAVE_VERSION, 32);
  assert.equal(s.politics.clubs.length, s.table.length);
  assert.deepEqual(
    new Set(s.politics.clubs.map((club) => club.bloc)),
    new Set(Object.keys(POLITICAL_BLOCS)),
  );
  assert(
    s.politics.clubs.every(
      (club) =>
        club.support === 50 && club.voteWeight >= 1 && club.voteWeight <= 3,
    ),
  );
  assert.equal(s.politics.office.held, false);
  assert.equal(
    s.politics.election.season,
    s.seasonNumber + POLITICAL_CYCLE_SEASONS,
  );
  validateSave(s);

  const old = structuredClone(s);
  old.version = 26;
  delete old.politics;
  old.finance.cash = s.finance.cash;
  const migrated = migrateSave(old);
  assert.equal(old.version, 26, "migration must not mutate its input");
  assert.equal(migrated.version, SAVE_VERSION);
  assert.equal(migrated.politics.office.held, false);
  assert.equal(migrated.politics.migration, "legacy-neutral");
  assert.equal(migrated.politics.election.season, migrated.seasonNumber + 1);
  assert(migrated.politics.clubs.every((club) => club.support === 50));
  assert.equal(migrated.finance.cash, s.finance.cash);
  validateSave(migrated);
  assert.strictEqual(migrateSave(migrated), migrated);
});

test("reconciling promotion/relegation keeps known positions and adds new clubs neutrally", () => {
  const s = newSave();
  const removed = s.table.find((row) => row.clubId !== s.clubId);
  const retained = s.politics.clubs.find(
    (club) => club.clubId !== removed.clubId,
  );
  retained.support = 73;
  const newcomer = "barcelona";
  assert(!s.table.some((row) => row.clubId === newcomer));
  s.table = s.table
    .filter((row) => row.clubId !== removed.clubId)
    .concat({ clubId: newcomer });
  reconcilePoliticalMap(s);
  assert.equal(s.politics.clubs.length, s.table.length);
  assert.equal(
    s.politics.clubs.find((club) => club.clubId === retained.clubId).support,
    73,
  );
  assert.equal(
    s.politics.clubs.find((club) => club.clubId === newcomer).support,
    50,
  );
  assert(!s.politics.clubs.some((club) => club.clubId === removed.clubId));
});

test("save validation rejects a tampered map and an invalid election cycle", () => {
  const badMap = newSave();
  badMap.politics.clubs[0].support = 101;
  assert.throws(() => validateSave(badMap), /خريطة الأندية السياسية/);
  const badCycle = newSave();
  badCycle.politics.election.cycleSeasons = 1;
  assert.throws(() => validateSave(badCycle), /موعد الانتخابات/);
});

test("political names, blocs, demands, profiles and biographies provide Arabic, English and French", () => {
  const bilingual = (value) =>
    value &&
    ["ar", "en", "fr"].every(
      (language) =>
        typeof value[language] === "string" && value[language].length > 0,
    );
  assert(Object.values(POLITICAL_BLOCS).every(bilingual));
  assert(
    Object.values(CLUB_DEMANDS).every(
      (demand) => bilingual(demand.label) && demand.lawId,
    ),
  );
  assert(
    POLITICAL_CANDIDATES.every(
      (candidate) =>
        bilingual(candidate.name) &&
        bilingual(candidate.party) &&
        bilingual(candidate.profile) &&
        bilingual(candidate.biography),
    ),
  );
});

test("positions clamp to 0–100, derive supporter/neutral/opponent, and blocs form reciprocal alliances", () => {
  const s = newSave();
  const [a, b, c] = s.politics.clubs;
  assert.equal(politicalSentiment(59), "neutral");
  assert.equal(politicalSentiment(60), "supporter");
  assert.equal(politicalSentiment(40), "neutral");
  assert.equal(politicalSentiment(39), "opponent");
  assert.equal(adjustClubSupport(s, a.clubId, 90, "test-positive"), 100);
  assert.equal(adjustClubSupport(s, b.clubId, -90, "test-negative"), 0);
  const sameBloc = s.politics.clubs
    .filter((club) => club.bloc === a.bloc)
    .slice(0, 2);
  if (sameBloc.length === 2) {
    const alliance = formAlliance(
      s,
      sameBloc.map((club) => club.clubId),
      "Test coalition",
    );
    assert.equal(alliance.clubIds.length, 2);
    assert(
      sameBloc.every(
        (club) =>
          s.politics.clubs.find((row) => row.clubId === club.clubId)
            .allianceId === alliance.id,
      ),
    );
    adjustClubSupport(s, sameBloc[0].clubId, -10, "coalition-test");
    assert.equal(
      alliance.cohesion,
      Math.round(
        sameBloc.reduce(
          (sum, club) =>
            sum +
            s.politics.clubs.find((row) => row.clubId === club.clubId).support,
          0,
        ) / 2,
      ),
    );
  }
  assert.throws(() => formAlliance(s, [a.clubId], "Too small"), /ناديين/);
  if (new Set([a.bloc, b.bloc]).size > 1)
    assert.throws(() => formAlliance(s, [a.clubId, b.clubId]), /المجموعة/);
  validateSave(s);
});

test("three stable fictional rivals carry popular, competent and corrupt/rival-president profiles", () => {
  const s = newSave();
  assert.equal(s.politics.candidates.length, 3);
  assert.deepEqual(
    s.politics.candidates.map((candidate) => candidate.id),
    POLITICAL_CANDIDATES.map((candidate) => candidate.id),
  );
  assert(
    s.politics.candidates.some((candidate) =>
      candidate.traits.includes("popular"),
    ),
  );
  assert(
    s.politics.candidates.some((candidate) =>
      candidate.traits.includes("competent"),
    ),
  );
  const clubPresident = s.politics.candidates.find((candidate) =>
    candidate.traits.includes("club-president"),
  );
  assert.equal(clubPresident.clubId, "zamalek");
  assert(clubPresident.traits.includes("corrupt"));
  readyCampaign(s);
  const oldRelation = clubPresident.relationship;
  offerCandidateAlliance(s, clubPresident.id);
  assert(
    clubPresident.relationship > oldRelation,
    "failed talks still evolve the relationship",
  );
  validateSave(s);
});

test("campaign visits, promises, conferences, funding, public debate and monthly polls have persisted effects", () => {
  const s = newSave();
  readyCampaign(s);
  const target = s.politics.clubs.find((club) => club.bloc === "regional");
  const personalBefore = s.empire.personal;
  const supportBefore = target.support;
  visitClub(s, target.clubId);
  assert.equal(target.support, supportBefore + 9);
  assert.equal(s.empire.personal, personalBefore - 180_000);
  assert.throws(() => visitClub(s, target.clubId), /بالفعل/);
  const attendees = holdConference(s, target.bloc);
  assert(attendees > 0);
  const promise = makeCampaignPromise(s, target.clubId, target.demandId);
  assert.equal(promise.status, "pending");
  assert.throws(
    () => makeCampaignPromise(s, target.clubId, target.demandId),
    /بالفعل/,
  );
  assert.equal(fundCampaign(s, 5_000_000), 5_000_000);
  assert.equal(s.politics.campaign.polls.length, 1);
  const result = debate(s, s.politics.candidates[0].id, "policy");
  assert(["strong", "close", "disaster"].includes(result.result));
  assert.throws(
    () => debate(s, s.politics.candidates[0].id, "policy"),
    /المناظرة/,
  );
  s.date = "2027-08-01";
  campaignMonthlyTick(s);
  assert.equal(s.politics.campaign.polls.length, 2);
  validateSave(s);
});

test("campaigns end in a named weighted ballot and the four-season re-election loop continues", () => {
  const s = newSave();
  readyCampaign(s);
  for (const club of s.politics.clubs) {
    adjustClubSupport(s, club.clubId, 50, "test-landslide");
  }
  for (const candidate of s.politics.candidates) candidate.withdrawn = true;
  const firstSeason = s.politics.election.season;
  const result = conductElection(s);
  assert.equal(result.winnerId, "player");
  assert.equal(result.ballot.length, s.politics.clubs.length);
  assert(
    result.ballot.every(
      (ballot) => ballot.clubId && ballot.candidateId && ballot.weight >= 1,
    ),
  );
  assert.equal(s.politics.office.held, true);
  assert.equal(
    s.politics.election.season,
    firstSeason + POLITICAL_CYCLE_SEASONS,
  );
  assert.equal(s.politics.election.status, "scheduled");
  assert.equal(s.politics.campaignArchive.length, 1);
  validateSave(s);
});

test("losing an election returns the owner to club life without ending future candidacies", () => {
  const s = newSave();
  readyCampaign(s);
  for (const club of s.politics.clubs)
    adjustClubSupport(s, club.clubId, -50, "test-loss");
  const rival = s.politics.candidates[0];
  rival.popularity = 100;
  rival.competence = 100;
  rival.corruption = 0;
  rival.blocAffinity = { big: 100, regional: 100, small: 100 };
  const result = conductElection(s);
  assert.equal(result.won, false);
  assert.equal(s.politics.office.held, false);
  assert.equal(s.politics.office.lastDeparture.reason, "election-loss");
  assert.equal(s.politics.election.status, "scheduled");
  assert.equal(s.politics.campaign.active, false);
  validateSave(s);
});
