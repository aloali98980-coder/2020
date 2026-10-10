import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { addDays } from "../src/core/utils.js";
import {
  POLITICAL_OFFICIALS,
  POLITICAL_SPONSORS,
  POLITICAL_TOURNAMENTS,
} from "../src/data/politicsCommittees.js";
import {
  appointCommitteeChair,
  committeeDay,
  recordDisciplineIncident,
  resolveDisciplineCase,
  setCommitteePolicy,
} from "../src/services/politics/committees.js";
import {
  createAssociationTournament,
  playAssociationTournamentRound,
} from "../src/services/politics/competitions.js";
import {
  applyMatchConsequences,
  generateCardDistribution,
} from "../src/services/matchConsequences.js";

const fresh = () => createGame({ database: "current", leagues: ["eg"] });
const takeOffice = (s) => {
  s.politics.office.held = true;
  s.politics.office.termStartSeason = s.seasonNumber;
  s.politics.office.termEndSeason = s.seasonNumber + 4;
};

test("committee and sponsor catalogues provide explicit Arabic, English, and French copy", () => {
  const localized = (value) =>
    ["ar", "en", "fr"].every(
      (language) =>
        typeof value?.[language] === "string" && value[language].trim(),
    );
  assert(POLITICAL_OFFICIALS.length >= 5);
  assert(POLITICAL_SPONSORS.length >= 4);
  assert(Object.keys(POLITICAL_TOURNAMENTS).length >= 3);
  for (const official of POLITICAL_OFFICIALS) {
    assert(localized(official.name), official.id);
    assert(localized(official.profile), official.id);
    assert(official.roles.length > 0);
  }
  for (const sponsor of POLITICAL_SPONSORS)
    assert(localized(sponsor.name), sponsor.id);
  for (const tournament of Object.values(POLITICAL_TOURNAMENTS)) {
    assert(localized(tournament.name), tournament.id);
    assert(localized(tournament.description), tournament.id);
  }
});

test("committee appointments require office, matching expertise, and retain an auditable history", () => {
  const s = fresh();
  assert.equal(s.politics.committees.referees.chairId, null);
  assert.throws(
    () => appointCommitteeChair(s, "referees", "tariq-badr"),
    /انتخابك/,
  );
  takeOffice(s);
  assert.throws(
    () => appointCommitteeChair(s, "referees", "youssef-rashad"),
    /الخبرة/,
  );
  const chair = appointCommitteeChair(s, "referees", "tariq-badr");
  assert.equal(chair.chairId, "tariq-badr");
  assert.equal(chair.integrity, 87);
  appointCommitteeChair(s, "discipline", "salwa-kamal");
  assert.equal(s.politics.committees.chairHistory.length, 2);
  assert.equal(s.politics.committees.history.at(-1).type, "chair-appointed");
  validateSave(s);
});

test("committee policy changes affect card frequency and accumulated-card suspension threshold", () => {
  const s = fresh();
  takeOffice(s);
  setCommitteePolicy(s, "referees", "strict");
  setCommitteePolicy(s, "discipline", "strict");
  setCommitteePolicy(s, "competitions", "rest-first");
  const lineup = Array.from({ length: 11 }, (_, index) => ({
    id: `player-${index}`,
  }));
  const balanced = generateCardDistribution(lineup, () => 0.5, {
    refereePolicy: "balanced",
  });
  const strict = generateCardDistribution(lineup, () => 0.5, {
    refereePolicy: "strict",
  });
  assert(strict.yellows.length >= balanced.yellows.length);
  const player = s.players.find(
    (entry) => entry.clubId === s.clubId && entry.status !== "retired",
  );
  player.seasonYellowByComp = 2;
  applyMatchConsequences(
    s,
    {
      home: s.clubId,
      homeGoals: 0,
      awayGoals: 0,
      lineup: [{ playerId: player.id }],
    },
    { yellows: [player], reds: [] },
    () => 0.99,
    { suspensionThreshold: 3 },
  );
  assert.equal(player.seasonYellowByComp, 0);
  assert.equal(player.yellowCardSuspensions, 1);
  assert.equal(s.politics.committees.competitions.calendar, "rest-first");
  validateSave(s);
});

test("disciplinary review records, rules on, reduces, or dismisses a logged red-card case once", () => {
  const s = fresh();
  takeOffice(s);
  setCommitteePolicy(s, "discipline", "strict");
  const player = s.players.find(
    (entry) => entry.clubId === s.clubId && entry.status !== "retired",
  );
  player.suspendedUntil = "2026-02-01";
  const record = recordDisciplineIncident(s, { id: "fixture-case-1" }, player);
  assert.equal(record.recommendedDays, 12);
  assert.equal(record.status, "pending");
  const resolved = resolveDisciplineCase(s, record.id, "reduce");
  assert.equal(resolved.sanctionDays, 6);
  assert.equal(resolved.ownClubRuling, true);
  assert.equal(player.suspendedUntil, addDays(record.date, 6));
  assert.throws(() => resolveDisciplineCase(s, record.id, "dismiss"), /حُسمت/);
  const second = recordDisciplineIncident(s, { id: "fixture-case-2" }, player);
  resolveDisciplineCase(s, second.id, "dismiss");
  assert.equal(player.suspendedUntil, s.date);
  assert.equal(s.politics.committees.discipline.cases.length, 2);
  validateSave(s);
});

test("committee monthly review is idempotent within a calendar month", () => {
  const s = fresh();
  takeOffice(s);
  appointCommitteeChair(s, "referees", "amira-hamdan");
  const before = s.politics.committees.referees.morale;
  assert.equal(committeeDay(s), true);
  const after = s.politics.committees.referees.morale;
  assert.equal(after, before + 1);
  const count = s.politics.committees.history.length;
  assert.equal(committeeDay(s), false);
  assert.equal(s.politics.committees.history.length, count);
  validateSave(s);
});

test("association knockout cup is sponsored, drawn, advanced, and awards a reserved prize", () => {
  const s = fresh();
  takeOffice(s);
  setCommitteePolicy(s, "competitions", "rest-first");
  const initialBalance = s.politics.finance.balance;
  const cup = createAssociationTournament(s, "association-cup", "nile-bank");
  assert.equal(cup.format, "knockout");
  assert.equal(cup.roundGapDays, 14);
  assert.equal(cup.entrants.length, 8);
  assert.equal(cup.fixtures.length, 4);
  assert.equal(cup.drawAudited, false);
  assert.equal(cup.sponsorContribution, 30_000_000);
  assert(s.politics.finance.balance > initialBalance);
  assert(
    s.politics.finance.ledger.some(
      (entry) => entry.type === "tournament-sponsorship",
    ),
  );
  assert(
    s.politics.finance.ledger.some(
      (entry) => entry.type === "tournament-setup",
    ),
  );
  const prizeFund = s.politics.finance.funds.find(
    (entry) => entry.id === cup.prizeFundId,
  );
  assert.equal(prizeFund.amount, cup.prizePool);
  assert.equal(prizeFund.status, "open");
  assert.throws(
    () => createAssociationTournament(s, "association-cup", "nile-bank"),
    /بالفعل/,
  );
  let advances = 0;
  while (cup.status === "scheduled") {
    const nextFixture = cup.fixtures.find(
      (fixture) => fixture.round === cup.currentRound && !fixture.played,
    );
    s.date = nextFixture.scheduledDate;
    playAssociationTournamentRound(s, cup.id);
    advances++;
  }
  assert.equal(advances, 3);
  assert(cup.entrants.includes(cup.championId));
  assert.equal(
    s.politics.finance.funds.find((entry) => entry.id === cup.prizeFundId)
      .remaining,
    0,
  );
  assert.equal(
    s.politics.finance.clubAccounts[cup.championId].totalGrants,
    cup.prizePool,
  );
  assert.equal(
    s.politics.committees.competitions.history.at(-1).championId,
    cup.championId,
  );
  validateSave(s);
});

test("association league uses a round-robin draw, live standings, and one final prize", () => {
  const s = fresh();
  takeOffice(s);
  setCommitteePolicy(s, "competitions", "commercial");
  const league = createAssociationTournament(
    s,
    "presidents-league",
    "orbit-mobile",
  );
  assert.equal(league.format, "league");
  assert.equal(league.roundGapDays, 3);
  assert.equal(league.entrants.length, 4);
  assert.equal(league.fixtures.length, 6);
  assert.equal(Object.keys(league.table).length, 4);
  playAssociationTournamentRound(s, league.id);
  assert.equal(league.currentRound, 2);
  assert.equal(
    Object.values(league.table).reduce((total, row) => total + row.played, 0),
    4,
  );
  assert.throws(
    () => playAssociationTournamentRound(s, league.id),
    /موعد الجولة القادمة/,
  );
  s.date = league.fixtures.find((fixture) => fixture.round === 2).scheduledDate;
  playAssociationTournamentRound(s, league.id);
  s.date = league.fixtures.find((fixture) => fixture.round === 3).scheduledDate;
  playAssociationTournamentRound(s, league.id);
  assert.equal(league.status, "complete");
  assert(league.championId);
  assert.equal(league.table[league.championId].played, 3);
  validateSave(s);
});

test("tournament draw and match results are deterministic for the same save and date", () => {
  const run = () => {
    const s = fresh();
    takeOffice(s);
    const tournament = createAssociationTournament(
      s,
      "association-cup",
      "delta-energy",
    );
    playAssociationTournamentRound(s, tournament.id);
    return tournament.fixtures.map(
      ({ homeId, awayId, homeGoals, awayGoals, winnerId }) => ({
        homeId,
        awayId,
        homeGoals,
        awayGoals,
        winnerId,
      }),
    );
  };
  assert.deepEqual(run(), run());
});

test("tournament creation needs office, eligible clubs, and a solvent association treasury", () => {
  const s = fresh();
  assert.throws(
    () => createAssociationTournament(s, "association-cup", "nile-bank"),
    /انتخابك/,
  );
  takeOffice(s);
  s.politics.finance.balance = 0;
  assert.throws(
    () => createAssociationTournament(s, "small-club-cup", "community-radio"),
    /لا تكفي الخزينة/,
  );
  assert.equal(s.politics.finance.ledger.length, 0);
  assert.equal(s.politics.committees.competitions.tournaments.length, 0);
});
