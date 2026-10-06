import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { DIVISIONS } from "../src/data/expandedCatalog.js";
import {
  startIntake,
  chooseCandidate,
  academyDay,
  intakeCost,
} from "../src/services/talent/academy.js";
import {
  requestMission,
  followPlayer,
  toggleShortlist,
  scoutingDay,
} from "../src/services/talent/scouting.js";
import { worldTalentDay } from "../src/services/talent/world.js";
import {
  setTraining,
  developIndividual,
} from "../src/services/talent/training.js";
import { setPlayerRole, roleEffect } from "../src/services/playerRoles.js";
import { advanceTime } from "../src/services/time.js";
import { post, wages } from "../src/services/finance.js";
import { addDays } from "../src/core/utils.js";
import { playerDetail } from "../src/features/players.js";
const game = () =>
  createGame({
    database: "world",
    expanded: true,
    clubId: DIVISIONS.find((d) => d.id === "eg-3-d").clubs[0],
    leagues: ["eg"],
    difficulty: "easy",
  });
function tick(s, n) {
  for (let i = 0; i < n; i++) {
    for (const m of s.inbox) if (m.required) m.status = "resolved";
    advanceTime(s, 1);
  }
}
function intake() {
  const s = game();
  post(s, 50000000, "test-funding", "Test funding", "test-funding");
  const before = s.players.length,
    fee = intakeCost(s),
    cash = s.finance.cash;
  startIntake(s);
  assert.equal(s.finance.cash, cash - fee);
  assert.throws(() => startIntake(s));
  tick(s, 14);
  assert.equal(s.talent.academy.candidates.length, 4);
  return s;
}
test("Seasonal academy is opt-in; candidates are not on payroll until signed", () => {
  const s = intake(),
    c = s.talent.academy.candidates[0],
    p = c.player,
    id = p.id,
    oldWages = wages(s),
    cash = s.finance.cash;
  assert(!s.players.some((p) => p.id === id));
  validateSave(s);
  chooseCandidate(s, id, true);
  assert.equal(
    s.players.find((p) => p.id === id),
    p,
  );
  assert.equal(wages(s), oldWages + p.salary);
  assert.equal(s.finance.cash, cash - p.salary);
  assert.equal(p.contractEnd, addDays(s.date, 1095));
  assert.throws(() => chooseCandidate(s, id, true));
  assert.throws(() => startIntake(s));
  validateSave(s);
});
test("Academy rejection keeps identity and history as a free agent", () => {
  const s = intake(),
    p = s.talent.academy.candidates[0].player,
    id = p.id;
  chooseCandidate(s, id, false);
  assert.equal(
    s.players.find((p) => p.id === id),
    p,
  );
  assert.equal(p.clubId, "لاعب حر");
  assert.equal(p.value, 0);
  assert(p.careerHistory.some((h) => h.type === "academy-release"));
  validateSave(s);
});
test("Academy preserves return capacity and checks wages before any mutation", () => {
  const s = intake(),
    id = s.talent.academy.candidates[0].player.id;
  s.finance.wageBudget = 1;
  const before = structuredClone(s);
  assert.throws(() => chooseCandidate(s, id, true));
  assert.deepEqual(s, before);
  s.finance.wageBudget = 10000000;
  while (s.players.filter((p) => p.clubId === s.clubId).length < s.squadLimit) {
    const p = s.players.find(
      (p) => p.clubId !== s.clubId && p.status !== "retired",
    );
    p.clubId = s.clubId;
  }
  assert.throws(() => chooseCandidate(s, id, true));
});
test("All unchosen trainees leave after 90 days; mandatory review cannot strand time", () => {
  const s = intake(),
    ids = s.talent.academy.candidates.map((c) => c.player.id);
  tick(s, 91);
  assert.equal(s.talent.academy.candidates.length, 0);
  assert(ids.every((id) => s.players.some((p) => p.id === id)));
  assert(
    !s.inbox.some(
      (m) => m.kind === "academy-review" && m.status === "open" && m.required,
    ),
  );
  validateSave(s);
});
test("Filtered scout mission creates dated ranges, not transfers; repeat improves confidence", () => {
  const s = game(),
    cash = s.finance.cash;
  const id = requestMission(s, {
    country: "eg",
    position: "ST",
    minAge: 16,
    maxAge: 25,
    budget: 5000000,
    days: 7,
  });
  assert.equal(s.finance.cash, cash - 25000);
  tick(s, 7);
  const m = s.talent.scouting.missions.find((m) => m.id === id);
  assert.equal(m.status, "complete");
  assert(m.results.length > 0 && m.results.length <= 6);
  for (const id of m.results) {
    const p = s.players.find((p) => p.id === id);
    assert.equal(p.position, "ST");
    assert(p.age <= 25);
    assert(p.value <= 5000000);
  }
  const pid = m.results[0],
    old = s.talent.scouting.reports[pid].confidence;
  toggleShortlist(s, pid);
  followPlayer(s, pid);
  tick(s, 21);
  assert(s.talent.scouting.reports[pid].confidence > old);
  assert.equal(s.talent.scouting.reports[pid].visits, 2);
  validateSave(s);
});
test("Scouting concurrency and invalid filters reject without fees", () => {
  const s = game();
  const t = {
    country: "eg",
    position: "all",
    minAge: 16,
    maxAge: 24,
    budget: 1000000,
    days: 7,
  };
  requestMission(s, t);
  requestMission(s, t);
  const cash = s.finance.cash;
  assert.throws(() => requestMission(s, t));
  assert.equal(s.finance.cash, cash);
  const s2 = game();
  assert.throws(() => requestMission(s2, { ...t, position: "__proto__" }));
});
test("World replenishment prioritizes shortage and keeper, preserves owners and is monthly idempotent", () => {
  const s = game(),
    id = DIVISIONS.find((d) => d.id === "eg-3-d").clubs[1];
  s.leagues = ["eg"];
  const oldOwn = s.players
    .filter((p) => p.clubId === s.clubId)
    .map((p) => p.id);
  for (const p of s.players.filter((p) => p.clubId === id)) {
    p.status = "retired";
    p.salary = 0;
    p.clubId = "retired";
  }
  s.date = "2026-10-01";
  worldTalentDay(s);
  assert(s.players.some((p) => p.clubId === id && p.position === "GK"));
  assert(s.talent.world.created > 0);
  assert.deepEqual(
    s.players.filter((p) => p.clubId === s.clubId).map((p) => p.id),
    oldOwn,
  );
  const snapshot = JSON.stringify(s);
  worldTalentDay(s);
  assert.equal(JSON.stringify(s), snapshot);
});
test("NPC renewal debits budget once; owner contracts are untouched", () => {
  const s = game(),
    id = DIVISIONS.find((d) => d.id === "eg-3-d").clubs[1],
    p = s.players.find((p) => p.clubId === id);
  p.age = 24;
  p.rating = 65;
  p.contractEnd = "2026-10-15";
  const own = s.players.find((p) => p.clubId === s.clubId);
  own.contractEnd = "2026-10-15";
  s.date = "2026-10-01";
  worldTalentDay(s);
  assert.equal(p.contractEnd, addDays(s.date, 730));
  assert.equal(own.contractEnd, "2026-10-15");
  assert(p.careerHistory.some((h) => h.type === "ai-renewal"));
});
test("Individual training is monthly, injury-aware and focus-specific", () => {
  const s = game(),
    p = s.players.find((p) => p.clubId === s.clubId && p.position === "CM");
  p.age = 18;
  p.potential = 99;
  setTraining(s, p.id, "passing", "intense");
  s.date = "2026-10-01";
  s.seed = 1;
  p.appearances += 4;
  const old = { ...p.attributes };
  developIndividual(s, p);
  assert(
    p.attributes.passing - old.passing > p.attributes.shooting - old.shooting,
  );
  const rating = p.rating;
  developIndividual(s, p);
  assert.equal(p.rating, rating);
  s.date = "2026-11-01";
  p.injuryUntil = "2026-11-10";
  developIndividual(s, p);
  assert.equal(p.rating, rating);
});
test("Roles respect natural position and current slot, produce risks and survive reload", () => {
  const s = game(),
    p = s.players.find((p) => p.clubId === s.clubId && p.position === "RB");
  setPlayerRole(s, p.id, "wingback");
  assert.throws(() => setPlayerRole(s, p.id, "anchor"));
  const r = roleEffect(s, p, "RB");
  assert(r.attack > 0 && r.defence < 0 && r.fatigue > 0);
  assert(roleEffect(s, p, "ST").fit < r.fit);
  assert.equal(
    validateSave(JSON.parse(JSON.stringify(s))).management.playerRoles[p.id],
    "wingback",
  );
});
test("Normal player profile has no generated badge, provenance remains in data", () => {
  const s = game(),
    p = s.players.find((p) => p.clubId === s.clubId);
  assert(p.fictional);
  const html = playerDetail(s, p);
  assert(!html.includes("لاعب مولّد"));
  assert(!html.includes("ميلاد مولّد"));
  assert(html.includes(p.name));
});
test("Talent import rejects unsafe candidate fields, report ranges and role references", () => {
  const s = intake();
  validateSave(s);
  for (const mutate of [
    (s) => (s.talent.academy.candidates[0].player.salary = -1),
    (s) => (s.talent.academy.candidates[0].player.position = "???"),
    (s) => (s.talent.academy.candidates[0].player.id = s.players[0].id),
    (s) => (s.management.playerRoles[s.players[0].id] = "__proto__"),
    (s) => (s.talent.scouting.reports.missing = { playerId: "missing" }),
    (s) => (s.talent.world.cursor = -1),
  ]) {
    const bad = structuredClone(s);
    mutate(bad);
    assert.throws(() => validateSave(bad));
  }
});

test('Archived players count toward population cap; no silent deletion to replenish clubs',()=>{const s=game();while(s.players.length<50000)s.players.push({id:'archived-'+s.players.length,status:'retired',clubId:'retired'});const before=s.players.map(p=>p.id);s.date='2026-10-01';worldTalentDay(s);assert.equal(s.players.length,50000);assert.deepEqual(s.players.map(p=>p.id),before);assert.throws(()=>startIntake(s));});
test('Missing NPC budget cannot produce unpaid new signings',()=>{const s=game(),id=DIVISIONS.find(d=>d.id==='eg-3-d').clubs[1];for(const p of s.players.filter(p=>p.clubId===id)){p.clubId='retired';p.status='retired';}s.expansion.budgets[id]=0;s.date='2026-10-01';worldTalentDay(s);assert.equal(s.players.filter(p=>p.clubId===id).length,0);assert.equal(s.expansion.budgets[id],0);});
test('Loaned players are not developed or renewed twice by NPC monthly processing',()=>{const s=game(),id=DIVISIONS.find(d=>d.id==='eg-3-d').clubs[1],p=s.players.find(p=>p.clubId===s.clubId);p.loan={parent:s.clubId,until:'2027-03-01'};p.clubId=id;p.age=18;p.rating=50;p.potential=90;p.contractEnd='2026-10-15';const before=structuredClone(p);s.date='2026-10-01';worldTalentDay(s);assert.deepEqual(p,before);});
