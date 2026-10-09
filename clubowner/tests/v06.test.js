import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { DIVISIONS } from "../src/data/expandedCatalog.js";
import {
  requestLoan,
  answerLoan,
  loanDayStart,
  loanDayEnd,
  recallLoan,
  buyLoanOption,
} from "../src/services/loans.js";
import { wages, post } from "../src/services/finance.js";
import { reservedSquadSize } from "../src/services/employment.js";
import { addDays } from "../src/core/utils.js";
import {
  setTactics,
  selectXI,
  tacticalEffects,
  positionFit,
} from "../src/services/tactics.js";
import { marketOpen } from "../src/services/market.js";
import { promotionMoves } from "../src/services/promotion.js";
import { rankLeague } from "../src/services/leagueTable.js";
import { advanceTime } from "../src/services/time.js";
import { SAVE_VERSION } from "../src/core/game.js";
const cid = DIVISIONS.find((d) => d.id === "eg-3-d").clubs[0];
function toDate(s, target) {
  while (s.date < target) {
    for (const m of s.inbox) if (m.required) m.status = "resolved";
    advanceTime(s, 1);
  }
}
const game = () =>
  createGame({
    database: "world",
    expanded: true,
    clubId: cid,
    leagues: ["eg"],
    difficulty: "easy",
  });
function fixtureLoan(direction = "in", override = {}) {
  const s = game();
  post(
    s,
    100000000 - s.finance.cash,
    "test-funding",
    "Test funding",
    "test-funding",
  );
  s.finance.wageBudget = 10000000;
  for (const p of s.players.filter((p) => p.clubId === s.clubId))
    p.contractEnd = "2028-06-30";
  const parent =
    direction === "in"
      ? DIVISIONS.find((d) => d.id === "eg-3-d").clubs[1]
      : s.clubId;
  const borrower =
    direction === "in"
      ? s.clubId
      : DIVISIONS.find((d) => d.id === "eg-3-d").clubs[1];
  const p = s.players.find(
    (p) =>
      p.clubId === parent &&
      p.contractEnd > "2027-10-01" &&
      p.position === "CM",
  );
  const before = wages(s),
    cash = s.finance.cash;
  const o = requestLoan(s, p.id, {
    days: 180,
    fee: Math.round(p.value * 0.04),
    wageShare: 80,
    buyOption: Math.round(p.value * 1.2),
    recallAllowed: true,
    role: "starter",
    borrower,
    ...override,
  });
  assert.equal(s.finance.cash, cash);
  assert.equal(p.clubId, parent);
  s.date = addDays(s.date, 1);
  loanDayStart(s);
  assert.equal(o.status, "countered");
  answerLoan(s, o.id, true);
  return { s, p, o, before, parent, borrower };
}
test("Egypt fresh membership, stable old IDs and no invented fourth tier", () => {
  const ds = DIVISIONS.filter((d) => d.country === "eg");
  assert.deepEqual(
    ds.map((d) => d.clubs.length),
    [20, 20, 11, 10, 17, 16, 16],
  );
  assert(ds[1].clubs.includes("ismaily"));
  assert(!ds.some((d) => d.tier === 4));
  const s = game();
  assert.equal(s.version, SAVE_VERSION);
  assert(
    s.players
      .filter((p) =>
        ds
          .slice(1)
          .flatMap((d) => d.clubs)
          .includes(p.clubId),
      )
      .every((p) => p.fictional),
  );
  validateSave(s);
});
test("Incoming counterproposal is atomic, wages shared, purchase option exactly once", () => {
  const { s, p, o, before, parent } = fixtureLoan();
  const l = { ...p.loan },
    cash = s.finance.cash,
    npc = s.expansion.budgets[parent],
    id = p.id,
    history = p.careerHistory.length;
  assert.equal(wages(s), before + Math.round((p.salary * l.wageShare) / 100));
  assert.throws(() => answerLoan(s, o.id, true));
  assert.equal(s.finance.cash, cash);
  buyLoanOption(s, id);
  assert.equal(p.id, id);
  assert.equal(p.loan, null);
  assert.equal(p.contractEnd, "2028-06-30");
  assert.equal(s.finance.cash, cash - l.buyOption);
  assert.equal(s.expansion.budgets[parent], npc + l.buyOption);
  assert.equal(p.careerHistory.length, history + 1);
  assert.throws(() => buyLoanOption(s, id));
  validateSave(s);
});
test("Outgoing loan reserves return space and retained wage share; recall needs 60 days", () => {
  const { s, p, before } = fixtureLoan("out", { buyOption: 0 });
  assert.equal(reservedSquadSize(s), 22);
  assert.equal(
    wages(s),
    before - Math.round((p.salary * p.loan.wageShare) / 100),
  );
  assert.throws(() => recallLoan(s, p.id));
  toDate(s, addDays(p.loan.starts, 60));
  const cash = s.finance.cash;
  recallLoan(s, p.id);
  assert.equal(p.clubId, s.clubId);
  assert.equal(s.finance.cash, cash);
  assert.equal(wages(s), before);
  validateSave(s);
});
test("Insufficient cash cannot half-sign or debit the other club", () => {
  const s = game(),
    p = s.players.find(
      (p) =>
        p.clubId === DIVISIONS.find((d) => d.id === "eg-3-d").clubs[1] &&
        p.position === "CM",
    );
  const o = requestLoan(s, p.id, {
    days: 180,
    fee: 90000,
    wageShare: 80,
    buyOption: 0,
    role: "rotation",
    recallAllowed: false,
  });
  s.date = addDays(s.date, 1);
  loanDayStart(s);
  post(s, -s.finance.cash, "test-spend", "Test spend", "test-spend");
  const clone = structuredClone(s);
  assert.throws(() => answerLoan(s, o.id, true));
  assert.deepEqual(s, clone);
  answerLoan(s, o.id, false);
  assert(
    !s.inbox.some((m) => m.ref === o.id && m.required && m.status === "open"),
  );
  validateSave(s);
});
test("Scheduled return preserves identity and does not refund fees", () => {
  const { s, p } = fixtureLoan("out", { buyOption: 0, days: 90 });
  const l = p.loan;
  toDate(s, addDays(l.until, -1));
  const cash = s.finance.cash;
  loanDayStart(s);
  assert(p.loan);
  s.date = l.until;
  loanDayStart(s);
  assert.equal(p.clubId, s.clubId);
  assert.equal(p.loan, null);
  assert.equal(s.finance.cash, cash);
  validateSave(s);
});
test("Outgoing simulated appearances require an actual borrower fixture and are idempotent", () => {
  const { s, p, borrower } = fixtureLoan("out", { buyOption: 0 });
  const before = p.appearances;
  loanDayEnd(s);
  assert.equal(p.appearances, before);
  const f = s.expansion.divisions
    .flatMap((d) => d.fixtures)
    .find((f) => [f.home, f.away].includes(borrower) && f.date > s.date);
  s.date = f.date;
  f.played = true;
  f.homeGoals = 1;
  f.awayGoals = 0;
  s.seed = 1;
  loanDayEnd(s);
  assert.equal(p.appearances, before + 1);
  loanDayEnd(s);
  assert.equal(p.appearances, before + 1);
  validateSave(s);
});
test("Monthly NPC wages debit once and a bankrupt counterparty returns the player", () => {
  const { s, p, parent } = fixtureLoan();
  s.talent.world.enabled = false; // Isolate wage accounting from independent academy replacement costs.
  const n = s.expansion.budgets[parent],
    cost = p.salary - Math.round((p.salary * p.loan.wageShare) / 100);
  toDate(s, "2026-10-01");
  assert.equal(s.expansion.budgets[parent], n - cost);
  loanDayStart(s);
  assert.equal(s.expansion.budgets[parent], n - cost);
  s.expansion.budgets[parent] = 0;
  toDate(s, "2026-11-01");
  assert.equal(p.loan, null);
  assert.equal(p.clubId, parent);
  validateSave(s);
});
test("Corrupt terms, player location and invalid tactical enum rejected at import", () => {
  const { s, p } = fixtureLoan();
  validateSave(s);
  for (const mutate of [
    (s) => (s.management.tactics.formation = "__proto__"),
    (s) => (s.players.find((x) => x.id === p.id).loan.wageShare = 101),
    (s) =>
      (s.players.find((x) => x.id === p.id).clubId = s.players.find(
        (x) => x.id === p.id,
      ).loan.parent),
    (s) => (s.management.loanOffers[0].counter.days = 999),
  ]) {
    const bad = structuredClone(s);
    mutate(bad);
    assert.throws(() => validateSave(bad));
  }
});
test("Positional selection produces one keeper, fatigue increases with high press/tempo", () => {
  const s = game();
  for (const formation of ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2"]) {
    setTactics(s, { formation });
    const xi = selectXI(s);
    assert.equal(xi.length, 11);
    assert.equal(new Set(xi.map((x) => x.p.id)).size, 11);
    assert.equal(xi.filter((x) => x.slot === "GK").length, 1);
  }
  const low = tacticalEffects(s, "ahly");
  setTactics(s, { press: "high", tempo: "fast" });
  assert(tacticalEffects(s, "ahly").fatigue > low.fatigue);
  assert(positionFit("CB", "ST") < positionFit("CB", "CB"));
  validateSave(s);
});
test("Market scenario dates close new transfers, while January is open", () => {
  const s = game();
  assert(marketOpen(s));
  s.date = "2026-10-15";
  assert(!marketOpen(s));
  const p = s.players.find((p) => p.clubId !== s.clubId && !p.loan);
  assert.throws(() =>
    requestLoan(s, p.id, {
      days: 180,
      fee: 0,
      wageShare: 80,
      buyOption: 0,
      role: "rotation",
    }),
  );
  s.date = "2027-01-15";
  assert(marketOpen(s));
});
test("Egypt grouped promotion moves exactly three, retains pool sizes and avoids double-jumps", () => {
  const s = game(),
    x = s.expansion,
    gs = x.divisions.filter((d) => d.id.startsWith("eg-3-"));
  x.playoffs = [
    { winners: [gs[0].clubs[0]] },
    { winners: [gs[2].clubs[0], gs[3].clubs[0]] },
  ];
  const ordered = new Map(x.divisions.map((d) => [d.id, d.clubs]));
  const moves = promotionMoves(x, ordered);
  assert.equal(
    moves.filter(([id, from, to]) => from.tier === 3 && to.id === "eg-2")
      .length,
    3,
  );
  assert.equal(new Set(moves.map((m) => m[0])).size, moves.length);
  const sizes = new Map(x.divisions.map((d) => [d.id, d.clubs.length]));
  for (const [id, from] of moves)
    from.clubs = from.clubs.filter((c) => c !== id);
  for (const [id, , to] of moves) to.clubs.push(id);
  for (const d of x.divisions) assert.equal(d.clubs.length, sizes.get(d.id));
});
test("Head-to-head precedes overall goal difference in Egyptian grouped table", () => {
  const d = {
    tieBreak: "head-to-head",
    table: [
      { clubId: "a", points: 3, gf: 1, ga: 0 },
      { clubId: "b", points: 3, gf: 9, ga: 1 },
    ],
    fixtures: [
      { played: true, home: "a", away: "b", homeGoals: 1, awayGoals: 0 },
    ],
  };
  assert.equal(rankLeague(d)[0].clubId, "a");
});
test("Inbox loan counter stops day-week progression until user answers", () => {
  const s = game(),
    p = s.players.find(
      (p) =>
        p.clubId === DIVISIONS.find((d) => d.id === "eg-3-d").clubs[1] &&
        p.position === "CM",
    );
  const o = requestLoan(s, p.id, {
    days: 180,
    fee: 100000,
    wageShare: 80,
    buyOption: 0,
    role: "rotation",
    recallAllowed: true,
  });
  for (const m of s.inbox) if (m.required) m.status = "resolved";
  const r = advanceTime(s, 7);
  assert.equal(r.advanced, 1);
  assert.equal(r.blocked, true);
  assert.equal(o.status, "countered");
  answerLoan(s, o.id, false);
  validateSave(s);
});

test("First-of-month scheduled return restores full owner wages before billing", () => {
  const { s, p } = fixtureLoan("out", { days: 90, buyOption: 0 });
  const l = p.loan;
  l.starts = "2026-07-03";
  l.until = "2026-10-01";
  l.lastReview = "2026-09-25";
  toDate(s, "2026-10-01");
  assert.equal(p.loan, null);
  assert.equal(p.clubId, s.clubId);
  const bill = s.finance.ledger.find((e) => e.key === "wages-2026-10-01");
  assert.equal(bill.amount, -wages(s));
  validateSave(s);
});

test("Normal purchase credits seller only when upfront and installments are paid", async () => {
  const { submitOffer, transferReply, acceptClub, signPlayer } =
    await import("../src/services/transfers.js");
  const { financeDay } = await import("../src/services/finance.js");
  const s = game();
  s.talent.world.enabled = false; // Isolate installment settlement, not the seller's academy spending.
  post(s, 100000000, "test-funding", "Transfer test funding", "transfer-test");
  const p = s.players.find(
      (p) =>
        p.clubId === DIVISIONS.find((d) => d.id === "eg-3-d").clubs[1] &&
        p.position === "CM",
    ),
    seller = p.clubId,
    budget = s.expansion.budgets[seller];
  const n = submitOffer(s, p.id, { fee: p.value, upfrontPercent: 40 });
  s.date = addDays(s.date, 1);
  transferReply(s, n.id);
  acceptClub(s, n.id);
  signPlayer(s, n.id, { salary: p.salary, bonus: 0, years: 3, role: "مداورة" });
  assert.equal(s.expansion.budgets[seller], budget + Math.round(n.fee * 0.4));
  assert(
    p.careerHistory.some((h) => h.type === "transfer-in" && h.from === seller),
  );
  toDate(s, addDays(s.date, 90));
  assert.equal(s.expansion.budgets[seller], budget + n.fee);
  const after = s.expansion.budgets[seller];
  financeDay(s);
  assert.equal(s.expansion.budgets[seller], after);
  validateSave(s);
});

test("Chunked backup Blob is byte-identical compact JSON with Arabic, arrays and omitted values", async () => {
  const { saveBlob } = await import("../src/services/saveEncoding.js");
  const s = game();
  s.extra = {
    ignored: undefined,
    arabic: "اختبار",
    array: Array.from({ length: 270 }, (_, i) =>
      i % 5 ? { i, text: "نادي" } : null,
    ),
  };
  const expected = JSON.stringify(s);
  assert.equal(await saveBlob(s).text(), expected);
  assert.equal(saveBlob(s).size, Buffer.byteLength(expected));
});
