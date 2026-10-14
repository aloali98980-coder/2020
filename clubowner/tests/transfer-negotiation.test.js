import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { addDays } from "../src/core/utils.js";
import { setLanguage } from "../src/i18n/index.js";
import { num } from "../src/ui/format.js";
import { saleNegotiationView } from "../src/features/transferMarket.js";
import { financeDay } from "../src/services/finance.js";
import { settleSellOnClause, teamPower } from "../src/services/market.js";
import {
  SALE_ROUNDS,
  CLUB_PERSONAS,
  aiClubBudget,
  auctionDaysRemaining,
  clubPersona,
  createAiSaleOffer,
  counterSaleOffer,
  deadlinePriceMultiplier,
  playerLoyalty,
  requestPlayerTransfer,
  startPlayerAuction,
  transferClubIds,
  transferMarketDay,
} from "../src/services/transferNegotiation.js";
import { acceptSaleOffer } from "../src/services/transferNegotiation.js";
import { deadlineDayTick } from "../src/services/deadlineDay.js";

function game(date = "2026-09-24") {
  const s = createGame({ clubId: "ahly", database: "world", expanded: true });
  s.date = date;
  return s;
}

function star(s) {
  return s.players
    .filter((p) => p.clubId === s.clubId && p.status !== "retired" && !p.loan)
    .sort((a, b) => b.rating - a.rating || b.value - a.value)[0];
}

function buyerFor(s, player, personality) {
  return transferClubIds(s).find((id) => {
    if (id === s.clubId || clubPersona(id).id !== personality) return false;
    const roster = s.players.filter((p) => p.clubId === id && p.status !== "retired").length;
    return (
      roster < (s.squadLimit || 30) &&
      aiClubBudget(s, id) >= player.value * 1.2 &&
      (player.rating < 65 || teamPower(s, id) >= player.rating - 12)
    );
  });
}

test("تفاوض بيع كامل: عرض مضاد، قبول AI، مقدم وأقساط وإضافات ونسبة مستقبلية", () => {
  const s = game();
  const player = star(s);
  player.value = 10_000_000;
  const buyer = buyerFor(s, player, "generous");
  assert.ok(buyer, "وجدنا مشتريًا كريمًا لديه ميزانية");
  const initialCash = s.finance.cash;
  const initialSellerBudget = s.expansion.budgets[s.clubId];
  const deal = createAiSaleOffer(s, player.id, { buyerId: buyer });
  assert.equal(deal.personaId, "generous");
  assert.equal(deal.round, 0);
  assert.equal(deal.history[0].side, "buyer");

  const counter = counterSaleOffer(s, deal.id, {
    fee: 11_000_000,
    upfrontPercent: 40,
    appearanceBonus: 120_000,
    goalBonus: 240_000,
    sellOnPercent: 20,
  });
  assert.equal(counter.status, "agreed", "قبل النادي الكريم العرض المضاد");
  assert.equal(deal.status, "agreed");
  assert.equal(deal.round, 1);
  assert.equal(deal.terms.sellOnPercent, 20);

  const completed = acceptSaleOffer(s, deal.id);
  assert.equal(completed.status, "sold");
  assert.equal(player.clubId, buyer);
  assert.equal(s.finance.cash - initialCash, 4_400_000, "وصل 40% مقدمًا");
  assert.equal(s.expansion.budgets[s.clubId] - initialSellerBudget, 4_400_000);
  const installments = s.finance.obligations.filter(
    (item) => item.category === "transfer-income" && item.ref === deal.id,
  );
  assert.equal(installments.length, 3);
  assert.equal(installments.reduce((sum, item) => sum + item.amount, 0), 6_600_000);
  assert.equal(s.transferMarket.clauses.length, 1);
  const clause = s.transferMarket.clauses[0];
  assert.equal(clause.sellOnPercent, 20);
  assert.equal(clause.appearanceTarget, player.appearances + 10);
  assert.equal(clause.goalTarget, player.goals + 5);

  const afterSale = s.finance.cash;
  player.appearances = clause.appearanceTarget;
  player.goals = clause.goalTarget;
  transferMarketDay(s);
  assert.equal(s.finance.cash - afterSale, 360_000, "إضافتا المباريات والأهداف صُرفتا عند العتبة");
  const resale = settleSellOnClause(s, player, 15_000_000);
  assert.equal(resale, 3_000_000, "وصلت نسبة 20% من البيع اللاحق");

  assert.equal(installments[0].due, addDays("2026-09-24", 30));
  // Move only this ledger item forward in the fixture so the focused finance test
  // does not advance the expanded-world competition calendar.
  installments[0].due = s.date;
  financeDay(s);
  const paidInstallment = s.finance.ledger.find((entry) => entry.key === installments[0].key);
  assert.equal(paidInstallment.amount, installments[0].amount);
  assert.ok(s.finance.cash >= installments[0].amount);
  assert.equal(validateSave(s), s);
});

test("المساومة لها حد 3 جولات ويتصلب النادي الصعب بدل قبول طلب منخفض", () => {
  const s = game();
  const player = star(s);
  player.value = 10_000_000;
  const buyer = buyerFor(s, player, "tough");
  assert.ok(buyer, "وجدنا ناديًا صعبًا");
  const deal = createAiSaleOffer(s, player.id, { buyerId: buyer });
  const firstOffer = deal.fee;
  const first = counterSaleOffer(s, deal.id, {
    fee: 10_400_000,
    upfrontPercent: 40,
    appearanceBonus: 0,
    goalBonus: 0,
    sellOnPercent: 0,
  });
  assert.equal(first.status, "countered");
  assert.ok(deal.fee > firstOffer, "النادي الصعب رفع عرضه لكنه لم يقترب كثيرًا من طلب البائع");
  assert.equal(deal.round, 1);
  const second = counterSaleOffer(s, deal.id, {
    fee: 10_500_000,
    upfrontPercent: 60,
    appearanceBonus: 0,
    goalBonus: 0,
    sellOnPercent: 0,
  });
  assert.equal(second.status, "countered");
  assert.equal(deal.round, 2);
  const final = counterSaleOffer(s, deal.id, {
    fee: 10_000_000,
    upfrontPercent: 100,
    appearanceBonus: 0,
    goalBonus: 0,
    sellOnPercent: 0,
  });
  assert.equal(final.status, "withdrawn");
  assert.equal(deal.round, SALE_ROUNDS);
  assert.equal(deal.status, "withdrawn");
});

test("المزاد يبدأ بناديين أو أكثر، يعلن المزايدات ويبيع للأعلى بعد العداد", () => {
  const s = game("2026-09-20");
  const player = star(s);
  const auction = startPlayerAuction(s, player.id, { days: 2 });
  assert.ok(auction.bidders.length >= 2);
  assert.ok(auction.bids.length >= 2, "العروض الأولى علنية");
  assert.equal(auctionDaysRemaining(s, auction), 2);
  const highest = Math.max(...auction.bids.map((bid) => bid.fee));
  assert.equal(auction.highestBid, highest);
  s.date = addDays(s.date, 1);
  transferMarketDay(s);
  assert.equal(auction.status, "open");
  s.date = addDays(s.date, 1);
  transferMarketDay(s);
  assert.equal(auction.status, "sold");
  assert.equal(player.clubId, auction.winner);
  assert.equal(auction.finalFee, auction.highestBid);
  assert.equal(validateSave(s), s);
});

test("طلب الانتقال يخفض عرض AI، والولاء يمنع البيع، وهيستيريا آخر يوم ×1.5", () => {
  const baseline = game("2026-09-24");
  const playerA = star(baseline);
  playerA.value = 10_000_000;
  const buyer = buyerFor(baseline, playerA, "frugal");
  assert.ok(buyer);
  const offerA = createAiSaleOffer(baseline, playerA.id, { buyerId: buyer });

  const pressured = game("2026-09-24");
  const playerB = pressured.players.find((p) => p.id === playerA.id);
  playerB.value = 10_000_000;
  requestPlayerTransfer(pressured, playerB.id);
  const offerB = createAiSaleOffer(pressured, playerB.id, { buyerId: buyer });
  assert.ok(offerB.fee < offerA.fee, "طلب الرحيل يرخص اللاعب");
  assert.equal(playerB.transferRequested, true);

  const loyal = game();
  const loyalPlayer = star(loyal);
  loyalPlayer.loyalty = 90;
  assert.equal(playerLoyalty(loyalPlayer), 90);
  assert.throws(() => createAiSaleOffer(loyal, loyalPlayer.id), /ولاء/);
  assert.equal(deadlinePriceMultiplier("2026-09-30"), 1.5);
  assert.equal(deadlinePriceMultiplier("2026-09-29"), 1);
  assert.equal(CLUB_PERSONAS.length, 5);
});

test("عرض يوم القفل الفعلي يطبق مضاعف السعر ×1.5", () => {
  const s = game("2026-09-30");
  deadlineDayTick(s);
  const bid = s.inbox.find((item) => item.kind === "deadline-bid");
  assert.ok(bid, "وصل عرض عاجل في يوم إغلاق النافذة");
  const player = s.players.find((item) => item.id === bid.ref);
  assert.ok(player);
  assert.ok(bid.fee >= player.value * 1.7);
  assert.ok(bid.fee <= player.value * 2.1);
});

test("AI يبادر بعرض علني على نجمك في يوم السوق ويظهر في البريد", () => {
  const s = game("2026-09-14");
  const player = star(s);
  s.seed = 777;
  transferMarketDay(s);
  s.date = "2026-09-15";
  transferMarketDay(s);
  const offer = s.transferMarket.sales.find((deal) => {
    const target = s.players.find((p) => p.id === deal.playerId);
    return target?.rating >= 74 || target?.value >= 10_000_000;
  });
  assert.ok(offer, "وصل عرض آلي لأحد نجوم الفريق");
  assert.ok(s.inbox.some((item) => item.kind === "sale-offer" && item.ref === offer.id));
  assert.equal(offer.status, "open");
  assert.equal(validateSave(s), s);
});

test("شاشة التفاوض محلية بالعربية والإنجليزية والفرنسية وتستخدم الأرقام اللاتينية", () => {
  const s = game();
  const player = star(s);
  player.value = 10_000_000;
  player.nameLatin = "Latin Star";
  const buyer = buyerFor(s, player, "generous");
  const deal = createAiSaleOffer(s, player.id, { buyerId: buyer });
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const html = saleNegotiationView(s, deal.id);
    assert.ok(html.includes(lang === "ar" ? player.name : "Latin Star"));
  }
  assert.match(num(123456), /123/);
  assert.doesNotMatch(num(123456), /[\u0660-\u0669]/);
  setLanguage("ar");
});
