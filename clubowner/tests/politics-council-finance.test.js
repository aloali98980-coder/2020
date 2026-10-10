import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  POLITICAL_LAW_LIST,
  POLITICAL_LAWS,
} from "../src/data/politicsLaws.js";
import {
  associationSeasonEnd,
  createSupportFund,
  grantFromSupportFund,
  runFinancialAudit,
} from "../src/services/politics/associationFinance.js";
import {
  bargainBill,
  proposeBill,
  resolveBill,
} from "../src/services/politics/council.js";
import {
  makeCampaignPromise,
  campaignMonthlyTick,
  visitClub,
  voteScores,
} from "../src/services/politics/campaign.js";

const fresh = () => createGame({ database: "current", leagues: ["eg"] });
function takeOffice(s) {
  s.politics.office.held = true;
  s.politics.office.termStartSeason = s.seasonNumber;
  s.politics.office.termEndSeason = s.seasonNumber + 4;
}

function introduceAndPass(s, lawId) {
  const p = s.politics;
  p.clubs.forEach((club) => (club.support = 100));
  const bill = proposeBill(s, lawId);
  for (const club of p.clubs)
    bargainBill(s, bill.id, club.clubId, "public-case");
  const result = resolveBill(s, bill.id);
  assert.equal(
    result.passed,
    true,
    `${lawId} should pass with unanimous club support`,
  );
  return { bill, result };
}

test("v27 migration upgrades council and finance defaults without replacing political history", () => {
  const old = fresh();
  old.version = 27;
  old.politics.clubs[0].support = 73;
  old.politics.election.season = old.seasonNumber + 2;
  delete old.politics.council.constitution;
  delete old.politics.finance.broadcastRevenue;
  delete old.politics.finance.ledgerOpeningBalance;
  delete old.politics.finance.ledgerRevision;
  old.politics.finance.clubAccounts = {};
  const originalBalance = old.politics.finance.balance;
  const upgraded = migrateSave(old);
  assert.equal(SAVE_VERSION, 32);
  assert.equal(old.version, 27, "migration must clone its input");
  assert.equal(upgraded.version, 32);
  assert.equal(upgraded.politics.clubs[0].support, 73);
  assert.equal(upgraded.politics.election.season, old.politics.election.season);
  assert.equal(upgraded.politics.council.constitution.termLimit, null);
  assert.equal(upgraded.politics.finance.balance, originalBalance);
  assert.equal(upgraded.politics.finance.broadcastRevenue, 60_000_000);
  assert(upgraded.politics.council.members.includes(upgraded.clubId));
  assert(upgraded.politics.finance.clubAccounts[upgraded.clubId]);
  validateSave(upgraded);
  assert.strictEqual(migrateSave(upgraded), upgraded);
});

test("v28 migration adds committee fields while preserving existing appointments and records", () => {
  const old = fresh();
  old.version = 28;
  const committees = old.politics.committees;
  committees.referees.chairId = "tariq-badr";
  committees.referees.strikes = 2;
  committees.discipline.cases = [
    { id: "legacy-case", status: "resolved", verdict: "uphold" },
  ];
  committees.competitions.tournaments = [
    { id: "legacy-cup", season: old.seasonNumber, championId: old.clubId },
  ];
  delete committees.lastMonth;
  delete committees.history;
  delete committees.chairHistory;
  delete committees.referees.competence;
  delete committees.referees.integrity;
  delete committees.referees.appointedDate;
  delete committees.referees.policyChangedDate;
  delete committees.discipline.competence;
  delete committees.discipline.integrity;
  delete committees.discipline.appointedDate;
  delete committees.discipline.policyChangedDate;
  delete committees.competitions.competence;
  delete committees.competitions.integrity;
  delete committees.competitions.appointedDate;
  delete committees.competitions.policyChangedDate;
  const upgraded = migrateSave(old);
  assert.equal(upgraded.version, 32);
  assert.equal(old.version, 28, "migration must clone its input");
  assert.equal(upgraded.politics.committees.referees.chairId, "tariq-badr");
  assert.equal(upgraded.politics.committees.referees.strikes, 2);
  assert.equal(
    upgraded.politics.committees.discipline.cases[0].id,
    "legacy-case",
  );
  assert.equal(
    upgraded.politics.committees.competitions.tournaments[0].id,
    "legacy-cup",
  );
  assert.deepEqual(upgraded.politics.committees.history, []);
  assert.deepEqual(upgraded.politics.committees.chairHistory, []);
});

test("law catalog provides trilingual title, summary and passed/rejected reactions", () => {
  assert(POLITICAL_LAW_LIST.length >= 10);
  const trilingual = (record) =>
    ["ar", "en", "fr"].every(
      (language) =>
        typeof record?.[language] === "string" && record[language].length > 0,
    );
  for (const law of POLITICAL_LAW_LIST) {
    assert(trilingual(law.title), law.id);
    assert(trilingual(law.summary), law.id);
    assert(trilingual(law.reaction.passed), law.id);
    assert(trilingual(law.reaction.rejected), law.id);
    assert(POLITICAL_LAWS[law.id]);
  }
});

test("council requires office, blocks overlapping bills, records named dissent and enacts the law", () => {
  const s = fresh();
  assert.throws(() => proposeBill(s, "broadcast-equity"), /رئاسة المجلس/);
  takeOffice(s);
  s.seed = 1;
  s.politics.clubs.forEach((club) => (club.support = 0));
  const bill = proposeBill(s, "broadcast-equity");
  assert.equal(bill.status, "debate");
  assert.throws(() => proposeBill(s, "youth-development"), /المفتوح/);
  const aligned = s.politics.clubs.find((club) =>
    club.demands.includes("equitableBroadcast"),
  );
  const bargain = bargainBill(s, bill.id, aligned.clubId, "policy-concession");
  assert.equal(bargain.accepted, true);
  assert.throws(
    () => bargainBill(s, bill.id, aligned.clubId, "public-case"),
    /بالفعل/,
  );
  const result = resolveBill(s, bill.id);
  assert.equal(result.passed, false);
  assert.equal(result.ballot.length, s.politics.clubs.length);
  assert(result.dissentIds.length > 0);
  assert(
    result.ballot.every(
      (row) => row.clubId && row.voteWeight && ["yes", "no"].includes(row.vote),
    ),
  );
  assert.deepEqual(s.politics.council.voteLog[0].dissentIds, result.dissentIds);
  assert.equal(s.politics.council.laws["broadcast-equity"], undefined);
  assert.throws(() => resolveBill(s, bill.id), /لا توجد لائحة مفتوحة/);
  validateSave(s);
});

test("passing broadcast and youth laws changes formula, fulfills promises, and pays annual club grants", () => {
  const s = fresh();
  takeOffice(s);
  s.politics.election.season = s.seasonNumber;
  campaignMonthlyTick(s);
  const promiseClub = s.politics.clubs.find((club) =>
    club.demands.includes("equitableBroadcast"),
  );
  const promise = makeCampaignPromise(
    s,
    promiseClub.clubId,
    "equitableBroadcast",
  );
  introduceAndPass(s, "broadcast-equity");
  assert.equal(s.politics.finance.distributionFormula.equality, 60);
  assert.equal(promise.status, "fulfilled");
  assert(promise.fulfilledByBill);

  const youthLaw = proposeBill(s, "youth-development");
  for (const club of s.politics.clubs)
    if (!youthLaw.lobby.some((item) => item.clubId === club.clubId))
      bargainBill(s, youthLaw.id, club.clubId, "public-case");
  const result = resolveBill(s, youthLaw.id);
  assert.equal(result.passed, true);
  assert.equal(s.politics.finance.youthGrantPerSeason, 5_000_000);
  const settlement = associationSeasonEnd(s);
  assert.equal(settlement.tvPool, 60_000_000);
  const youth = settlement.distributions.find(
    (row) => row.type === "youth-development",
  );
  assert.equal(youth.total, 5_000_000);
  assert.equal(
    Object.values(youth.shares).reduce((sum, amount) => sum + amount, 0),
    5_000_000,
  );
  validateSave(s);
});

test("declared development grants are debited from association treasury and credited to club accounts", () => {
  const s = fresh();
  takeOffice(s);
  const bill = proposeBill(s, "financial-disclosure");
  const club = s.politics.clubs[0];
  const treasuryBefore = s.politics.finance.balance;
  const accountBefore = s.politics.finance.clubAccounts[club.clubId].balance;
  const bargain = bargainBill(
    s,
    bill.id,
    club.clubId,
    "development-grant",
    2_000_000,
  );
  assert.equal(bargain.amount, 2_000_000);
  assert.equal(s.politics.finance.balance, treasuryBefore - 2_000_000);
  assert.equal(
    s.politics.finance.clubAccounts[club.clubId].balance,
    accountBefore + 2_000_000,
  );
  assert.equal(
    s.politics.finance.ledger.at(-1).type,
    "council-development-grant",
  );
  validateSave(s);
});

test("constitutional amendment needs supermajority and enforces the two-term cap", () => {
  const s = fresh();
  takeOffice(s);
  const { result } = introduceAndPass(s, "two-term-limit");
  assert.equal(result.threshold, 67);
  assert(result.yesWeight * 100 >= result.totalWeight * 67);
  assert.equal(s.politics.council.constitution.termLimit, 2);
  s.politics.office.termsServed = 2;
  s.politics.election.season = s.seasonNumber;
  campaignMonthlyTick(s);
  assert.equal(s.politics.campaign.playerEligible, false);
  assert(
    !voteScores(s, s.politics.clubs[0].clubId).some(
      (row) => row.candidateId === "player",
    ),
  );
  assert.throws(
    () => visitClub(s, s.politics.clubs[0].clubId),
    /التعديل الدستوري/,
  );
  validateSave(s);
});

test("broadcast distribution is weighted, complete, season-idempotent, and auto-audited", () => {
  const s = fresh();
  const before = s.politics.finance.balance;
  const settlement = associationSeasonEnd(s);
  assert.equal(settlement.tvPool, 60_000_000);
  assert.equal(s.politics.finance.balance, before);
  assert.equal(settlement.audit.status, "clean");
  const broadcast = settlement.distributions.find(
    (row) => row.type === "broadcast",
  );
  assert.equal(broadcast.total, 60_000_000);
  assert.equal(
    Object.values(broadcast.shares).reduce((sum, amount) => sum + amount, 0),
    broadcast.total,
  );
  assert.equal(Object.keys(broadcast.shares).length, s.politics.clubs.length);
  const accounts = Object.values(s.politics.finance.clubAccounts);
  assert.equal(
    accounts.reduce((sum, account) => sum + account.totalReceived, 0),
    60_000_000,
  );
  assert.equal(
    associationSeasonEnd(s),
    null,
    "season close cannot distribute twice",
  );
  assert.equal(s.politics.finance.distributions.length, 1);
  validateSave(s);
});

test("support-fund eligibility, reserve, grants, and ledger audits reconcile", () => {
  const s = fresh();
  takeOffice(s);
  const treasury = s.politics.finance.balance;
  const fund = createSupportFund(s, {
    name: "Small-club fund",
    amount: 5_000_000,
    criteria: "small",
  });
  assert.equal(s.politics.finance.balance, treasury - 5_000_000);
  const small = s.politics.clubs.find((club) => club.bloc === "small");
  const big = s.politics.clubs.find((club) => club.bloc === "big");
  const accountBefore = s.politics.finance.clubAccounts[small.clubId].balance;
  grantFromSupportFund(s, fund.id, small.clubId, 1_250_000);
  assert.equal(fund.remaining, 3_750_000);
  assert.equal(
    s.politics.finance.clubAccounts[small.clubId].balance,
    accountBefore + 1_250_000,
  );
  assert.throws(
    () => grantFromSupportFund(s, fund.id, small.clubId, 100_000),
    /بالفعل/,
  );
  assert.throws(
    () => grantFromSupportFund(s, fund.id, big.clubId, 100_000),
    /شروط الصندوق/,
  );
  assert.equal(runFinancialAudit(s).status, "clean");
  s.politics.finance.balance += 1;
  const report = runFinancialAudit(s, { force: true });
  assert.equal(report.status, "discrepancy");
  assert.equal(report.discrepancy, 1);
  validateSave(s);
});

test("automatic financial settlement honors solidarity law and allocates grants only to smaller clubs", () => {
  const s = fresh();
  takeOffice(s);
  introduceAndPass(s, "solidarity-fund");
  const settlement = associationSeasonEnd(s);
  const solidarity = settlement.distributions.find(
    (row) => row.type === "solidarity",
  );
  assert.equal(solidarity.total, 5_000_000);
  const eligibleIds = s.politics.clubs
    .filter((club) => club.bloc === "small")
    .map((club) => club.clubId);
  assert.deepEqual(Object.keys(solidarity.shares).sort(), eligibleIds.sort());
  validateSave(s);
});
