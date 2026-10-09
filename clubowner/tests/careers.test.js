import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import { ageAt } from "../src/models/player.js";
import {
  agingDay,
  announceRetirement,
  retirementDecision,
  retirementDay,
} from "../src/services/careers.js";
import {
  staffSalary,
  hireStaff,
  trainStaff,
  scoutAssignment,
  staffDay,
  dismissStaff,
} from "../src/services/staff.js";
import { clubEventDay, resolveClubEvent } from "../src/services/clubEvents.js";
import { EVENT_CATALOG } from "../src/data/eventCatalog.js";
import { advanceTime } from "../src/services/time.js";
import { pendingActions, resolveInfo } from "../src/services/inbox.js";
import { addDays } from "../src/core/utils.js";
import { financeDay, wages, operatingCosts } from "../src/services/finance.js";
import {
  submitOffer,
  transferReply,
  acceptClub,
  signPlayer,
  renewPlayer,
} from "../src/services/transfers.js";
import {
  contractDay,
  guaranteedWages,
} from "../src/services/contractClauses.js";
import { matchDay } from "../src/services/matches.js";
import { seasonDay } from "../src/services/season.js";
function retiredCandidate(s) {
  const p = s.players.find((p) => p.clubId === s.clubId);
  p.careerInterest = 0;
  announceRetirement(s, p);
  retirementDecision(s, p.id, "prepare");
  s.date = p.retirementPlan.date;
  retirementDay(s);
  return s.staff.find((x) => x.personId === p.id);
}
function settle(s) {
  for (const m of [...pendingActions(s)]) {
    if (m.kind === "club-decision") {
      const ev = s.clubDecisions.find((e) => e.id === m.ref);
      const data = EVENT_CATALOG.find((e) => e.id === ev.type);
      resolveClubEvent(s, ev.id, data.choices.find((c) => !c.cash).id);
    } else if (m.kind === "retirement") retirementDecision(s, m.ref, "respect");
    else resolveInfo(s, m.id);
  }
}
test("Current provisional pack: 86 names, sources, all four selectable squads, optional markets", () => {
  for (const clubId of ["ahly", "zamalek", "masry", "ittihad"]) {
    const s = createGame({ clubId });
    assert.equal(s.players.length, 86);
    assert.equal(s.date, "2026-09-24");
    assert(s.players.filter((p) => p.clubId === clubId).length >= 16);
    assert(
      s.players.every(
        (p) =>
          !p.fictional &&
          p.sourceUrl &&
          p.sourceStatus === "provisional" &&
          p.nameLatin,
      ),
    );
    validateSave(s);
  }
  assert.equal(createGame({ leagues: ["eg"] }).players.length, 70);
});
test("Difficulty changes disclosed economy, not player ratings", () => {
  const easy = createGame({ difficulty: "beginner" }),
    hard = createGame({ difficulty: "hard" });
  assert(easy.finance.initialCash > hard.finance.initialCash);
  assert(operatingCosts(easy) < operatingCosts(hard));
  assert.deepEqual(easy.players, hard.players);
});
test("Reference age advances over years; veteran physical ability declines monthly, GK later", () => {
  const s = createGame();
  const p = s.players.find((p) => p.nameLatin === "Cristiano Ronaldo"),
    young = s.players.find((p) => p.age === 21);
  const pace = p.attributes.pace,
    yp = young.attributes.pace;
  s.date = "2027-09-25";
  agingDay(s);
  assert.equal(p.age, 42);
  assert(p.attributes.pace < pace);
  assert.equal(young.attributes.pace, yp);
  assert.equal(ageAt(p, "2028-09-25"), 43);
  const rating = p.rating;
  agingDay(s);
  assert.equal(p.rating, rating);
});
test("Retirement stops player wages, prevents transfer, produces independently rated staff", () => {
  const s = createGame();
  const before = wages(s),
    p = s.players[0],
    salary = p.salary;
  const candidate = retiredCandidate(s);
  assert.equal(p.status, "retired");
  assert.equal(wages(s), before - salary);
  assert(candidate.skills.scouting !== p.rating);
  assert.throws(() => submitOffer(s, p.id, { fee: 1, upfrontPercent: 100 }));
  assert(pendingActions(s).some((m) => m.kind === "career-offer"));
  validateSave(s);
});
test("Staff hiring, payroll effect, course and scouting report, dismiss compensation/cancellation", () => {
  const s = createGame(),
    c = retiredCandidate(s),
    base = operatingCosts(s);
  hireStaff(s, c.id, "scout");
  const salary = staffSalary(c, "scout");
  assert.equal(operatingCosts(s), base + salary);
  assert.throws(() => scoutAssignment(s, c.id, "missing"));
  const p = s.players.find(
    (p) => p.clubId !== s.clubId && p.status === "active",
  );
  trainStaff(s, c.id);
  scoutAssignment(s, c.id, p.id);
  const skill = c.skills.scouting;
  s.date = addDays(s.date, 21);
  staffDay(s);
  assert.equal(c.skills.scouting, Math.min(95, skill + 6));
  assert(p.scoutReport);
  const cash = s.finance.cash;
  scoutAssignment(s, c.id, p.id);
  dismissStaff(s, c.id);
  assert.equal(s.finance.cash, cash - 40000 - salary * 2);
  assert(s.scoutAssignments.every((a) => a.done));
  assert.equal(operatingCosts(s), base);
  validateSave(s);
});
test("Every event choice records concrete effects once; delayed income is collected once", () => {
  for (const ev of EVENT_CATALOG) {
    for (const choice of ev.choices) {
      const s = createGame();
      s.clubDecisions.push({
        id: "decision-test",
        type: ev.id,
        date: s.date,
        status: "open",
        choice: null,
      });
      const cash = s.finance.cash,
        headcount = s.players.length;
      resolveClubEvent(s, "decision-test", choice.id);
      assert.equal(s.finance.cash, cash + (choice.cash || 0));
      assert.throws(() => resolveClubEvent(s, "decision-test", choice.id));
      if (choice.youth) {
        assert.equal(s.players.length, headcount + 1);
        assert.equal(s.players.at(-1).age, 17);
        assert.equal(s.players.at(-1).fictional, true);
      }
      if (choice.incomeLater) {
        s.date = addDays(s.date, 30);
        financeDay(s);
        const paid = s.finance.ledger.filter(
          (e) => e.key === "decision-test-income",
        );
        assert.equal(paid.length, 1);
        assert.equal(paid[0].amount, 180000);
        financeDay(s);
        assert.equal(
          s.finance.ledger.filter((e) => e.key === "decision-test-income")
            .length,
          1,
        );
      }
      validateSave(s);
    }
  }
});
test("No-cost event alternative remains available in debt; events avoid immediate repeats", () => {
  const s = createGame();
  s.finance.cash = -1;
  s.finance.initialCash = 0;
  s.finance.ledger = [
    { id: "loss", key: "loss", date: s.date, description: "test", amount: -1 },
  ];
  s.clubDecisions.push({
    id: "decision-test",
    type: "community",
    date: s.date,
    status: "open",
    choice: null,
  });
  resolveClubEvent(s, "decision-test", "decline");
  assert.equal(s.finance.cash, -1);
  s.date = s.nextClubEventDate;
  clubEventDay(s);
  const first = s.lastClubEvent;
  settle(s);
  s.date = s.nextClubEventDate;
  clubEventDay(s);
  assert.notEqual(s.lastClubEvent, first);
});
test("Contract clauses: raises once per anniversary, guaranteed cost, promise consequences", () => {
  const s = createGame(),
    p = s.players[0];
  renewPlayer(s, p.id, {
    salary: p.salary,
    bonus: 0,
    years: 3,
    role: "أساسي",
    appearanceBonus: 1000,
    goalBonus: 2000,
    annualRaisePct: 10,
    releaseClause: 50000000,
  });
  assert.equal(guaranteedWages(100, 3, 10), 3972);
  const salary = p.salary;
  s.date = "2027-09-24";
  contractDay(s);
  assert.equal(p.salary, Math.round(salary * 1.1));
  contractDay(s);
  assert.equal(p.salary, Math.round(salary * 1.1));
  const s2 = createGame(),
    p2 = s2.players.at(17);
  renewPlayer(s2, p2.id, {
    salary: p2.salary,
    bonus: 0,
    years: 2,
    role: "أساسي",
  });
  s2.fixtures
    .filter((f) => f.home === s2.clubId || f.away === s2.clubId)
    .slice(0, 6)
    .forEach((f) => (f.played = true));
  s2.date = addDays(s2.date, 60);
  const morale = p2.morale;
  contractDay(s2);
  assert.equal(p2.morale, morale - 12);
});
test("Appearance and goal bonuses reconcile with match statistics and do not double pay", () => {
  const s = createGame();
  for (const p of s.players.filter((p) => p.clubId === s.clubId)) {
    p.contractTerms.appearanceBonus = 1000;
    p.contractTerms.goalBonus = 2000;
  }
  const next = s.fixtures.find(
    (f) => f.home === s.clubId || f.away === s.clubId,
  );
  s.date = next.date;
  matchDay(s);
  const squad = s.players.filter((p) => p.clubId === s.clubId),
    appearances = squad.reduce((n, p) => n + p.appearances, 0),
    goals = squad.reduce((n, p) => n + p.goals, 0);
  assert.equal(appearances, 11);
  assert.equal(
    -s.finance.ledger
      .filter((e) => e.category === "appearance-bonus")
      .reduce((n, e) => n + e.amount, 0),
    appearances * 1000,
  );
  assert.equal(
    -s.finance.ledger
      .filter((e) => e.category === "goal-bonus")
      .reduce((n, e) => n + e.amount, 0),
    goals * 2000,
  );
  const cash = s.finance.cash;
  matchDay(s);
  assert.equal(cash, s.finance.cash);
  validateSave(s);
});
test("A market release clause can bypass a higher valuation", () => {
  const s = createGame();
  const p = s.players.find((p) => p.clubId !== s.clubId);
  p.contractTerms.releaseClause = 1000;
  const n = submitOffer(s, p.id, { fee: 1000, upfrontPercent: 100 });
  transferReply(s, n.id);
  assert.equal(n.counter, 1000);
});
test("v1 migration preserves identities, cash and historical dates; invalid clause import rejected", () => {
  const original = createGame({ database: "demo" });
  original.version = 1;
  const players = structuredClone(original.players),
    cash = original.finance.cash;
  for (const k of [
    "staff",
    "scoutAssignments",
    "clubDecisions",
    "nextSeasonDate",
    "seasonHistory",
    "seasonNumber",
    "difficulty",
    "nextClubEventDate",
  ])
    delete original[k];
  for (const p of original.players) {
    delete p.status;
    delete p.contractTerms;
    delete p.ageReference;
  }
  const migrated = migrateSave(original);
  assert.equal(original.version, 1);
  assert.equal(migrated.version, 22);
  assert.equal(migrated.finance.cash, cash);
  assert.deepEqual(
    migrated.players.map((p) => [p.id, p.name, p.rating]),
    players.map((p) => [p.id, p.name, p.rating]),
  );
  assert.equal(migrated.date, original.date);
  validateSave(migrated);
  migrated.players[0].contractTerms.appearanceBonus = -1;
  assert.throws(() => validateSave(migrated));
});
test("360-day integration: repeated decisions, career events, season rollover and ledger integrity", () => {
  const s = createGame({ clubId: "zamalek" }),
    end = addDays(s.date, 360);
  let steps = 0;
  while (s.date < end && steps++ < 1200) {
    settle(s);
    advanceTime(s, 1);
    validateSave(s);
  }
  assert.equal(s.date, end);
  assert(s.seasonNumber >= 2);
  assert(s.seasonHistory.length >= 1);
  assert(s.clubDecisions.length >= 10);
  assert(s.retired.length > 0, "retirees are archived in s.retired (0.20)");
  assert(!s.players.some((p) => p.status === "retired"));
  assert.equal(
    s.finance.initialCash + s.finance.ledger.reduce((n, e) => n + e.amount, 0),
    s.finance.cash,
  );
});

test("Actual released v0.1.1 engine fixture migrates and continues play", async () => {
  const fs = await import("node:fs/promises");
  const raw = JSON.parse(
    await fs.readFile(
      new URL("./fixtures/v011-save.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(raw.version, 1);
  const oldCash = raw.finance.cash,
    oldIds = raw.players.map((p) => p.id);
  const s = migrateSave(raw);
  validateSave(s);
  assert.equal(s.finance.cash, oldCash);
  assert.deepEqual(
    s.players.map((p) => p.id),
    oldIds,
  );
  settle(s);
  advanceTime(s, 7);
  validateSave(s);
  assert(s.date > raw.date);
});
