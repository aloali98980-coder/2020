import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { advanceTime } from "../src/services/time.js";
import { pendingActions, resolveInfo } from "../src/services/inbox.js";
import {
  submitOffer,
  acceptClub,
  signPlayer,
  rejectNegotiation,
  renewPlayer,
} from "../src/services/transfers.js";
import { signSponsor, offersFor } from "../src/services/sponsors.js";
import {
  startProject,
  toggleFacilityStaff,
  facilityDay,
} from "../src/services/facilities.js";
import {
  post,
  financeDay,
  takeLoan,
  liabilities,
} from "../src/services/finance.js";
import { validateSave } from "../src/services/save.js";
import { sortedTable } from "../src/services/matches.js";
import { addDays } from "../src/core/utils.js";
const fresh = () =>
  createGame({
    database: "demo",
    clubId: "ahly",
    owner: "اختبار",
    leagues: ["eg", "en", "sa"],
  });
const dismiss = (s) => pendingActions(s).forEach((m) => resolveInfo(s, m.id));
test("New game has coherent real-name demo clubs, fictional players, and 3 markets", () => {
  const s = fresh();
  assert.equal(s.players.length, 36);
  assert.equal(s.players.filter((p) => p.clubId === s.clubId).length, 18);
  assert.ok(s.players.every((p) => p.fictional));
  assert.equal(s.finance.cash, 75000000);
  validateSave(s);
});
test("Week advance pauses at important sponsor event and preserves remaining days", () => {
  const s = fresh();
  const r = advanceTime(s, 7);
  assert.equal(r.advanced, 3);
  assert.equal(r.blocked, true);
  assert.equal(s.date, "2026-07-04");
  assert.equal(s.remainingDays, 4);
  assert.equal(advanceTime(s, 7).advanced, 0);
  assert.equal(s.remainingDays, 4);
  assert.equal(s.date, "2026-07-04");
  dismiss(s);
  advanceTime(s);
  assert.equal(s.date, "2026-07-08");
  assert.equal(pendingActions(s)[0].kind, "renewal");
});
test("Reading is not resolving an action", () => {
  const s = fresh();
  advanceTime(s, 7);
  s.inbox.forEach((m) => (m.read = true));
  assert.equal(advanceTime(s, 1).advanced, 0);
});
test("Ledger idempotency prevents double-charging", () => {
  const s = fresh(),
    cash = s.finance.cash;
  post(s, -1000, "test", "test", "same-key");
  post(s, -1000, "test", "test", "same-key");
  assert.equal(s.finance.cash, cash - 1000);
  validateSave(s);
});
test("Transfer is two stages, registers player and creates three installments", () => {
  const s = fresh(),
    p = s.players.find((p) => p.id === "m-eg-0"),
    cash = s.finance.cash;
  const n = submitOffer(s, p.id, { fee: p.value, upfrontPercent: 40 });
  assert.equal(s.finance.cash, cash);
  advanceTime(s, 1);
  assert.equal(n.stage, "club-reply");
  assert.ok(pendingActions(s).length);
  acceptClub(s, n.id);
  assert.equal(n.stage, "personal");
  assert.notEqual(p.clubId, s.clubId);
  signPlayer(s, n.id, {
    salary: p.salary,
    bonus: 200000,
    years: 3,
    role: "أساسي",
  });
  assert.equal(p.clubId, s.clubId);
  assert.equal(n.stage, "signed");
  assert.equal(
    s.finance.cash,
    cash - Math.round(n.fee * 0.4) - Math.round(n.fee * 0.03) - 200000,
  );
  assert.equal(s.finance.obligations.filter((o) => o.ref === n.id).length, 3);
  assert.equal(pendingActions(s).length, 0);
  validateSave(s);
  assert.throws(() =>
    signPlayer(s, n.id, {
      salary: p.salary,
      bonus: 200000,
      years: 3,
      role: "أساسي",
    }),
  );
});
test("Duplicate transfer offers fail and low salary is refused without spending", () => {
  const s = fresh(),
    p = s.players.find((p) => p.id === "m-eg-1"),
    n = submitOffer(s, p.id, { fee: p.value, upfrontPercent: 60 });
  assert.throws(() =>
    submitOffer(s, p.id, { fee: p.value, upfrontPercent: 60 }),
  );
  advanceTime(s, 1);
  acceptClub(s, n.id);
  const cash = s.finance.cash;
  assert.throws(() =>
    signPlayer(s, n.id, { salary: 1, bonus: 0, years: 2, role: "أساسي" }),
  );
  assert.equal(s.finance.cash, cash);
  rejectNegotiation(s, n.id);
  assert.equal(pendingActions(s).length, 0);
});
test("Sponsor assets cannot be double sold; payment sums equal contract value", () => {
  const s = fresh(),
    offer = offersFor(s, "sleeve")[0],
    c = signSponsor(s, offer);
  assert.throws(() => signSponsor(s, offer));
  const advance = s.finance.ledger.find(
    (e) => e.key === c.id + "-upfront",
  ).amount;
  assert.equal(
    advance +
      s.finance.obligations
        .filter((o) => o.ref === c.id)
        .reduce((a, o) => a + o.amount, 0),
    c.amount,
  );
  validateSave(s);
});
test("Project bills only on agreed dates and effects only after completion", () => {
  const s = fresh(),
    f = s.facilities.find((f) => f.id === "stadium"),
    capacity = s.capacity,
    cash = s.finance.cash;
  startProject(s, "stadium");
  assert.equal(f.level, 1);
  assert.equal(s.capacity, capacity);
  assert.equal(cash - s.finance.cash, 2600000);
  assert.throws(() => startProject(s, "stadium"));
  s.date = f.project.end;
  financeDay(s);
  facilityDay(s);
  assert.equal(f.level, 2);
  assert.equal(s.capacity, capacity + 3000);
  assert.equal(cash - s.finance.cash, 6500000);
  const after = s.finance.cash;
  financeDay(s);
  facilityDay(s);
  assert.equal(s.finance.cash, after);
  assert.equal(s.capacity, capacity + 3000);
  validateSave(s);
});
test("Facility staff costs are independent of construction", () => {
  const s = fresh(),
    f = s.facilities[0];
  assert.equal(f.staff, false);
  toggleFacilityStaff(s, "training");
  assert.equal(f.staff, true);
  assert.equal(f.level, 1);
});
test("Cash ledger survives export/import roundtrip", () => {
  const s = fresh();
  takeLoan(s);
  const restored = validateSave(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored, s);
  assert.equal(liabilities(s), 5400000);
  const bad = structuredClone(s);
  bad.finance.cash++;
  assert.throws(() => validateSave(bad));
});
test("Loans are paid once even when financial processing repeats", () => {
  const s = fresh();
  takeLoan(s);
  s.date = "2026-07-31";
  financeDay(s);
  const cash = s.finance.cash;
  financeDay(s);
  assert.equal(s.finance.cash, cash);
  assert.equal(
    s.finance.obligations.filter(
      (o) => o.category === "loan-payment" && o.status === "paid",
    ).length,
    1,
  );
});
test("Renewals close required messages and update salary & expiry", () => {
  const s = fresh();
  advanceTime(s, 7);
  dismiss(s);
  advanceTime(s);
  const p = s.players.find((p) => p.id === "p16");
  renewPlayer(s, p.id, {
    salary: p.salary + 1000,
    bonus: 100000,
    years: 2,
    role: "مداورة",
  });
  assert.equal(pendingActions(s).length, 0);
  assert.ok(p.contractEnd > "2027-12-31");
  validateSave(s);
});
test("14 rounds have no duplicate fixtures, balanced table, repeatable seeded results", () => {
  const a = fresh(),
    b = fresh();
  for (const s of [a, b]) {
    for (let i = 0; i < 100; i++) {
      dismiss(s);
      advanceTime(s, 1);
    }
  }
  assert.equal(a.fixtures.length, 56);
  assert.equal(a.fixtures.filter((f) => f.played).length, 56);
  assert.ok(a.table.every((t) => t.played === 14));
  assert.equal(
    a.table.reduce((n, t) => n + t.gf, 0),
    a.table.reduce((n, t) => n + t.ga, 0),
  );
  assert.deepEqual(a.fixtures, b.fixtures);
  assert.deepEqual(a.finance, b.finance);
  assert.equal(new Set(a.fixtures.map((f) => f.home + "-" + f.away)).size, 56);
  validateSave(a);
});
test("Selected foreign markets affect available players", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  assert.equal(s.players.length, 24);
  assert.equal(s.players.filter((p) => p.league === "en").length, 0);
});
test("Match pause preserves the unspent time target", () => {
  const s = fresh();
  s.events = [];
  s.players.forEach((p) => (p.renewalWarningEnd = p.contractEnd));
  s.preferences.pauseMatches = true;
  const r = advanceTime(s, 14);
  assert.equal(r.match, true);
  assert.equal(s.date, "2026-07-08");
  assert.equal(s.remainingDays, 7);
});
test("Completed academy needs staff to generate monthly youth", () => {
  const s = fresh(),
    f = s.facilities.find((f) => f.id === "academy");
  f.level = 2;
  f.staff = true;
  s.events = [];
  s.date = "2026-07-31";
  const n = s.players.length;
  advanceTime(s, 1);
  assert.equal(s.players.length, n + 1);
  validateSave(s);
});
test("Import rejects broken player/contract references and impossible dates", () => {
  let s = fresh();
  s.date = "2026-02-31";
  assert.throws(() => validateSave(s));
  s = fresh();
  s.negotiations.push({
    id: "n-bad",
    playerId: "missing",
    fee: 100,
    upfrontPercent: 40,
    stage: "waiting",
  });
  assert.throws(() => validateSave(s));
  s = fresh();
  s.facilities[0].level = 0;
  assert.throws(() => validateSave(s));
});
