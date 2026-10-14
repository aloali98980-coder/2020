import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { wages } from "../src/services/finance.js";
import { setLanguage } from "../src/i18n/index.js";
import { num } from "../src/ui/format.js";
import {
  EXCHANGE_FAIR_TOLERANCE,
  completePlayerExchange,
  createAiPlayerExchangeOffer,
  exchangeFairness,
  exchangeValues,
  playerExchangeDay,
  proposePlayerExchange,
  suggestedExchangeCash,
} from "../src/services/playerExchange.js";
import {
  playerExchangeDealView,
  playerExchangeView,
} from "../src/features/playerExchange.js";

function game(date = "2026-09-24") {
  const s = createGame({ clubId: "ahly", database: "world", expanded: true });
  s.date = date;
  return s;
}

function setTreasury(s, cash) {
  s.finance.initialCash += cash - s.finance.cash;
  s.finance.cash = cash;
}

function roster(s, clubId) {
  return s.players
    .filter((player) => player.clubId === clubId && player.status !== "retired" && !player.loan)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
}

function affordableGame(date) {
  const s = game(date);
  s.finance.wageBudget = 100_000_000;
  setTreasury(s, 1_000_000_000);
  s.expansion.budgets[s.clubId] = 1_000_000_000;
  s.expansion.budgets.zamalek = 500_000_000;
  return s;
}

function proposeBalanced(s, outgoingPlayerIds, incomingPlayerIds, extra = {}) {
  return proposePlayerExchange(s, {
    opponentId: "zamalek",
    outgoingPlayerIds,
    incomingPlayerIds,
    cash: suggestedExchangeCash(s, outgoingPlayerIds, incomingPlayerIds),
    ...extra,
  });
}

test("تبادل 5 ضد 5 يوازن النقد، ينقل اللاعبين في الجهتين ويُحدّث الرصيد والرواتب", () => {
  const s = affordableGame();
  const own = roster(s, "ahly").slice(0, 5);
  const other = roster(s, "zamalek").slice(0, 5);
  const outgoingIds = own.map((player) => player.id);
  const incomingIds = other.map((player) => player.id);
  const cash = suggestedExchangeCash(s, outgoingIds, incomingIds);
  const fairness = exchangeFairness(s, outgoingIds, incomingIds, cash);
  assert.equal(fairness.balanced, true);
  assert.equal(fairness.differenceRatio, 0);
  assert.equal(EXCHANGE_FAIR_TOLERANCE, 0.15);

  const cashBefore = s.finance.cash;
  const oldUserBudget = s.expansion.budgets.ahly;
  const oldBuyerBudget = s.expansion.budgets.zamalek;
  const deal = proposeBalanced(s, outgoingIds, incomingIds);
  assert.equal(deal.status, "agreed", "النادي يقبل عرضًا عادلاً مبدئيًا");
  assert.equal(deal.outgoingPlayerIds.length, 5);
  assert.equal(deal.incomingPlayerIds.length, 5);
  assert.equal(deal.cash, cash);

  const completed = completePlayerExchange(s, deal.id);
  assert.equal(completed.status, "completed");
  for (const player of own) assert.equal(player.clubId, "zamalek");
  for (const player of other) assert.equal(player.clubId, "ahly");
  assert.equal(s.finance.cash - cashBefore, -cash);
  assert.equal(s.expansion.budgets.ahly - oldUserBudget, -cash);
  assert.equal(s.expansion.budgets.zamalek - oldBuyerBudget, cash);
  assert.ok(wages(s) <= s.finance.wageBudget);
  assert.equal(deal.approvals.length, 10);
  assert.ok(deal.approvals.every((approval) => approval.approved));
  assert.equal(validateSave(s), s);
});

test("عرض غير عادل بأكثر من 15% يُرفض تلقائيًا بلا تعديل مالي أو ملكية", () => {
  const s = affordableGame();
  const own = roster(s, "ahly").at(-1);
  const other = roster(s, "zamalek")[0];
  const cashBefore = s.finance.cash;
  const oldOwnClub = own.clubId;
  const oldOtherClub = other.clubId;
  const deal = proposePlayerExchange(s, {
    opponentId: "zamalek",
    outgoingPlayerIds: [own.id],
    incomingPlayerIds: [other.id],
    cash: 0,
  });
  assert.equal(deal.status, "rejected");
  assert.equal(deal.reasonCode, "fair-value");
  assert.match(deal.reason, /15%/);
  assert.equal(s.finance.cash, cashBefore);
  assert.equal(own.clubId, oldOwnClub);
  assert.equal(other.clubId, oldOtherClub);
  assert.equal(validateSave(s), s);
});

test("رفض لاعب واحد بسبب المدينة يلغي التبادل كله ويعرض السبب دون تحريك بقية اللاعبين", () => {
  const s = affordableGame();
  setLanguage("en");
  const own = roster(s, "ahly")[0];
  const other = roster(s, "zamalek")[0];
  other.preferredCity = "Alexandria";
  const outgoingIds = [own.id];
  const incomingIds = [other.id];
  const deal = proposeBalanced(s, outgoingIds, incomingIds);
  assert.equal(deal.status, "agreed");
  const cashBefore = s.finance.cash;
  const originalOwnSalary = own.salary;
  const originalOtherSalary = other.salary;

  const result = completePlayerExchange(s, deal.id);
  assert.equal(result.status, "rejected");
  assert.equal(result.reasonCode, "city");
  assert.match(result.reason, /city/i);
  assert.equal(deal.rejectedPlayerId, other.id);
  assert.ok(deal.approvals.some((approval) => !approval.approved));
  assert.equal(own.clubId, "ahly");
  assert.equal(other.clubId, "zamalek");
  assert.equal(own.salary, originalOwnSalary);
  assert.equal(other.salary, originalOtherSalary);
  assert.equal(s.finance.cash, cashBefore);
  assert.equal(validateSave(s), s);
  setLanguage("ar");
});

test("اللاعب يرفض عرض الأجر المنخفض، وتُعرض علة الرفض ولا تُخصم الأموال", () => {
  const s = affordableGame();
  setLanguage("en");
  const own = roster(s, "ahly")[0];
  const other = roster(s, "zamalek")[0];
  const cash = suggestedExchangeCash(s, [own.id], [other.id]);
  const deal = proposePlayerExchange(s, {
    opponentId: "zamalek",
    outgoingPlayerIds: [own.id],
    incomingPlayerIds: [other.id],
    cash,
    wageOffers: { [other.id]: Math.floor(other.salary * 0.5) },
  });
  assert.equal(deal.status, "agreed", "الراتب المنخفض قرار شخصي وليس خللاً في القيمة");
  const before = s.finance.cash;
  const result = completePlayerExchange(s, deal.id);
  assert.equal(result.status, "rejected");
  assert.equal(result.reasonCode, "wage");
  assert.match(result.reason, /wage/i);
  assert.equal(own.clubId, "ahly");
  assert.equal(other.clubId, "zamalek");
  assert.equal(s.finance.cash, before);
  setLanguage("ar");
});

test("ميزانية الرواتب، سقف التشكيلة ونافذة الانتقالات تُفحص عند اعتماد التبادل", () => {
  const wageGame = affordableGame();
  const own = roster(wageGame, "ahly").at(-1);
  const other = roster(wageGame, "zamalek")[0];
  const outgoing = [own.id], incoming = [other.id];
  const projected = wages(wageGame) - own.salary + other.salary;
  wageGame.finance.wageBudget = projected - 1;
  const wageDeal = proposeBalanced(wageGame, outgoing, incoming);
  assert.equal(wageDeal.status, "rejected");
  assert.equal(wageDeal.reasonCode, "wage-budget");

  const squadGame = affordableGame();
  const oneOut = roster(squadGame, "ahly")[0];
  const twoIn = roster(squadGame, "zamalek").slice(0, 2);
  squadGame.squadLimit = squadGame.players.filter((p) => p.clubId === "ahly" && p.status !== "retired").length;
  const squadDeal = proposeBalanced(squadGame, [oneOut.id], twoIn.map((p) => p.id));
  assert.equal(squadDeal.status, "rejected");
  assert.equal(squadDeal.reasonCode, "roster");

  const windowGame = affordableGame();
  const windowOwn = roster(windowGame, "ahly")[0];
  const windowOther = roster(windowGame, "zamalek")[0];
  const windowDeal = proposeBalanced(windowGame, [windowOwn.id], [windowOther.id]);
  assert.equal(windowDeal.status, "agreed");
  windowGame.date = "2026-10-01";
  const expired = completePlayerExchange(windowGame, windowDeal.id);
  assert.equal(expired.status, "expired");
  assert.equal(windowDeal.reasonCode, "window");
  assert.equal(windowOwn.clubId, "ahly");
  assert.equal(windowOther.clubId, "zamalek");
});

test("الذكاء الاصطناعي يبادر بعرض تبادل عادل داخل نافذة الانتقالات", () => {
  const s = game("2026-09-22");
  s.seed = 45_123;
  const deal = createAiPlayerExchangeOffer(s);
  assert.ok(deal, "وصل عرض آلي بعد العثور على ناديين قادرين");
  assert.equal(deal.initiator, "ai");
  assert.equal(deal.status, "open");
  assert.equal(deal.windowId, "summer-2026");
  assert.equal(
    exchangeFairness(s, deal.outgoingPlayerIds, deal.incomingPlayerIds, deal.cash).balanced,
    true,
  );
  assert.ok(s.inbox.some((item) => item.kind === "player-exchange" && item.ref === deal.id));
  assert.equal(validateSave(s), s);
});

test("جدولة العروض الآلية مرة واحدة يوم 22 ولا تكرر العرض عند إعادة اليوم", () => {
  const s = game("2026-09-22");
  s.seed = 45_123;
  playerExchangeDay(s);
  const firstCount = s.transferMarket.exchanges.length;
  playerExchangeDay(s);
  assert.equal(s.transferMarket.exchanges.length, firstCount);
});

test("مُنشئ التبادل يعرض أسماء لاتينية وواجهة عربية/إنجليزية/فرنسية وأرقامًا لاتينية", () => {
  const s = affordableGame();
  const own = roster(s, "ahly")[0];
  own.nameLatin = "Latin Player";
  const deal = proposeBalanced(s, [own.id], [roster(s, "zamalek")[0].id]);
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const view = playerExchangeView(s, "zamalek");
    const review = playerExchangeDealView(s, deal.id);
    assert.ok(view.includes(lang === "ar" ? own.name : "Latin Player"));
    assert.ok(review.includes(lang === "ar" ? own.name : "Latin Player"));
  }
  assert.match(num(123456), /123/);
  assert.doesNotMatch(num(123456), /[\u0660-\u0669]/);
  setLanguage("ar");
});

// The same valuation helper is used for all bundle sizes, including one-for-five deals.
test("قيمة الحزم تحسب اللاعبين حتى خمسة لكل طرف دون إدخال رسوم نقدية مرتين", () => {
  const s = affordableGame();
  const own = roster(s, "ahly").slice(0, 2);
  const other = roster(s, "zamalek").slice(0, 4);
  const values = exchangeValues(s, own.map((p) => p.id), other.map((p) => p.id));
  const cash = suggestedExchangeCash(s, own.map((p) => p.id), other.map((p) => p.id));
  const fair = exchangeFairness(s, own.map((p) => p.id), other.map((p) => p.id), cash);
  assert.equal(fair.userGives, fair.userReceives);
  assert.equal(values.outgoingValue, fair.outgoingValue);
  assert.equal(values.incomingValue, fair.incomingValue);
});
