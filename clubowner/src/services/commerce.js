import { ownFixtures } from "./calendar.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { getDerbyInfo } from "./derby.js";
import { post } from "./finance.js";
import { assert, clamp, addDays } from "../core/utils.js";
export const BUSINESSES = {
  shop: { name: "متجر النادي", setup: 350000, cost: 55000, rep: 20 },
  food: { name: "خدمات يوم المباراة", setup: 250000, cost: 25000, rep: 0 },
  tours: { name: "جولات الملعب", setup: 180000, cost: 18000, rep: 45 },
  school: { name: "مدرسة الكرة", setup: 300000, cost: 45000, rep: 0 },
  hospitality: { name: "ضيافة الشركات", setup: 700000, cost: 80000, rep: 55 },
};
export function initCommerce(s) {
  s.commerce = {
    businesses: [],
    inventory: 0,
    shirtPrice: 450,
    shirtCost: 180,
    seasonTickets: 0,
    seasonTicketPrice: 0,
    ticketSeason: 0,
    mediaDelegate: false,
    history: [],
    lastFriendly: null,
  };
}
export function businessOpen(s, id) {
  const spec = BUSINESSES[id];
  assert(
    spec && !s.commerce.businesses.includes(id),
    "نشاط غير متاح أو مفتوح بالفعل.",
  );
  assert(s.reputation >= spec.rep, "سمعة النادي أقل من المطلوب.");
  assert(s.finance.cash >= spec.setup, "السيولة غير كافية.");
  post(
    s,
    -spec.setup,
    "business-setup",
    "تجهيز " + spec.name,
    `business-${id}`,
  );
  s.commerce.businesses.push(id);
}
export function stockShirts(s, quantity) {
  assert(s.commerce.businesses.includes("shop"), "افتح المتجر أولًا.");
  assert(
    Number.isInteger(quantity) && quantity >= 10 && quantity <= 2000,
    "الكمية 10 إلى 2000.",
  );
  assert(s.commerce.inventory + quantity <= 5000, "سعة المخزن 5000.");
  const cost = quantity * s.commerce.shirtCost;
  assert(s.finance.cash >= cost, "السيولة غير كافية.");
  post(s, -cost, "stock", "شراء مخزون قمصان", "stock-" + s.nextId);
  s.commerce.inventory += quantity;
}
export function setPrices(s, ticket, shirt) {
  assert(
    Number.isInteger(ticket) && ticket >= 20 && ticket <= 1000,
    "التذكرة بين 20 و1000.",
  );
  assert(
    Number.isInteger(shirt) && shirt >= 200 && shirt <= 1500,
    "القميص بين 200 و1500.",
  );
  s.ticketPrice = ticket;
  s.commerce.shirtPrice = shirt;
}
// 0.16: seat categories. Standard seats use s.ticketPrice (all legacy paths
// intact); premium tiers are priced separately. Each tier has its own
// demand anchor: premium seats sell out faster at equal prices and react
// less to hikes. Season-ticket holders always occupy standard seats first,
// so no seat is ever billed twice.
export const TICKET_CATEGORIES = [
  { id: "standard", name: "عادية", share: 0.7, anchor: 100, divisor: 600 },
  { id: "first", name: "أولى", share: 0.2, anchor: 250, divisor: 1200 },
  { id: "vip", name: "مقصورة", share: 0.1, anchor: 600, divisor: 3000 },
];
export function categoryPrices(s) {
  const saved = s.commerce?.ticketPrices || {};
  return {
    standard: s.ticketPrice,
    first: saved.first ?? clamp(Math.round(s.ticketPrice * 2), 40, 2000),
    vip: saved.vip ?? clamp(Math.round(s.ticketPrice * 5), 100, 5000),
  };
}
export function setCategoryPrices(s, prices) {
  assert(
    Number.isInteger(prices.first) &&
      prices.first >= 40 &&
      prices.first <= 2000,
    "الأولى بين 40 و2000.",
  );
  assert(
    Number.isInteger(prices.vip) && prices.vip >= 100 && prices.vip <= 5000,
    "المقصورة بين 100 و5000.",
  );
  assert(
    prices.vip >= prices.first && prices.first >= s.ticketPrice,
    "ترتيب الفئات: المقصورة ≥ الأولى ≥ العادية.",
  );
  s.commerce.ticketPrices = { first: prices.first, vip: prices.vip };
}
// 0.16: one-match premium (derby/big-match pricing). Set by the owner, shown
// in the forecast, consumed by the next home matchCommerce.
export const MATCH_PREMIUMS = [0, 25, 50, 100];
export function setMatchPremium(s, pct) {
  assert(MATCH_PREMIUMS.includes(pct), "علاوة المباراة غير صالحة.");
  s.commerce.matchPremium = pct;
}
export function ticketForecast(s, fixture = null) {
  const f =
    fixture ||
    ownFixtures(s).find((f) => !f.played && !f.neutral && f.home === s.clubId);
  const opponent = extendedClub(f?.away);
  const isDerby = !!f?.isDerby;
  const importance =
    (f?.competition?.length ? 0.1 : 0) +
    (opponent ? Math.max(-0.1, (opponent.rep - s.reputation) / 250) : 0);
  const base =
    0.5 +
    s.fanSupport / 220 +
    importance +
    ((s.press?.trust ?? 60) - 60) / 500;
  const prices = categoryPrices(s),
    premium = (s.commerce?.matchPremium || 0) / 100;
  const subscribed = f?.competition ? 0 : s.commerce?.seasonTickets || 0;
  let paying = 0,
    gross = 0;
  const derbyPriceMult = isDerby ? 2 : 1;
  const breakdown = TICKET_CATEGORIES.map((cat) => {
    const seats = Math.floor(s.capacity * cat.share);
    const fill = clamp(
      base + (isDerby ? 0.35 : 0) - (prices[cat.id] - cat.anchor) / cat.divisor,
      0.05,
      0.99,
    );
    let catPaying = Math.floor(seats * fill);
    if (cat.id === "standard" && subscribed > 0)
      catPaying = Math.max(0, catPaying - Math.min(subscribed, seats));
    const catGross = Math.round(catPaying * prices[cat.id] * (1 + premium) * derbyPriceMult);
    paying += catPaying;
    gross += catGross;
    return { id: cat.id, name: cat.name, paying: catPaying, gross: catGross };
  });
  return {
    attendance: Math.min(s.capacity, paying + subscribed),
    paying,
    gross,
    breakdown,
    premium: s.commerce?.matchPremium || 0,
    isDerby,
  };
}
export function sellSubscriptions(s) {
  const c = s.commerce;
  assert(c.ticketSeason !== s.seasonNumber, "بيع الاشتراكات مرة واحدة للموسم.");
  const home = s.fixtures.filter(
    (f) => f.home === s.clubId && !f.played,
  ).length;
  assert(home >= 5, "عدد المباريات المتبقية غير كافٍ.");
  const count = Math.floor(s.capacity * clamp(s.fanSupport / 600, 0.04, 0.18));
  const price = Math.round(s.ticketPrice * home * 0.75);
  c.seasonTickets = count;
  c.seasonTicketPrice = price;
  c.ticketSeason = s.seasonNumber;
  post(
    s,
    count * price,
    "season-tickets",
    "اشتراكات الموسم — لا تُحصّل المقاعد مرة أخرى",
    `season-tickets-${s.seasonNumber}`,
  );
}
export function matchCommerce(s, f) {
  const c = s.commerce,
    forecast = ticketForecast(s, f);
  f.attendance = forecast.attendance;
  f.ticketBreakdown = forecast.breakdown;
  c.matchPremium = 0;
  post(
    s,
    forecast.gross,
    "tickets",
    "تذاكر منفردة بعد خصم الاشتراكات",
    f.id + "-tickets",
  );
  post(s, -f.attendance * 18, "match-costs", "تشغيل المباراة", f.id + "-costs");
  if (c.businesses.includes("food")) {
    post(s, f.attendance * 35, "food", "مبيعات خدمات المدرجات", f.id + "-food");
    post(
      s,
      -f.attendance * 21,
      "food-cost",
      "تكلفة خدمات المدرجات",
      f.id + "-foodcost",
    );
  }
  if (c.businesses.includes("hospitality")) {
    const vip = Math.floor(f.attendance * 0.025);
    post(
      s,
      vip * 300,
      "hospitality",
      "ترقية ضيافة — تكلفة المقعد الأساسي محسوبة بالتذاكر",
      f.id + "-vip",
    );
    post(s, -vip * 130, "hospitality-cost", "تشغيل الضيافة", f.id + "-vipcost");
  }
}
export function friendly(s) {
  const c = s.commerce;
  assert(
    !c.lastFriendly || s.date >= addDays(c.lastFriendly, 30),
    "ودية تجارية واحدة كل 30 يومًا.",
  );
  assert(
    !ownFixtures(s).some(
      (f) =>
        !f.played &&
        f.date >= s.date &&
        f.date <= addDays(s.date, 3) &&
        (f.home === s.clubId || f.away === s.clubId),
    ),
    "موعد قريب من مباراة رسمية.",
  );
  assert(s.finance.cash >= 120000, "تكلفة تنظيم الودية 120 ألفًا.");
  post(
    s,
    -120000,
    "friendly-cost",
    "تنظيم ودية تجارية",
    "friendly-cost-" + s.date,
  );
  const gross = Math.round(s.capacity * s.ticketPrice * 0.12);
  post(s, gross, "friendly", "إيراد ودية تجارية مبسطة", "friendly-" + s.date);
  c.lastFriendly = s.date;
  s.players
    .filter((p) => p.clubId === s.clubId && p.status !== "retired")
    .forEach((p) => (p.fitness = Math.max(30, p.fitness - 8)));
  return gross - 120000;
}
export function commerceDay(s) {
  if (!s.commerce) return;
  const c = s.commerce;
  if (s.date.endsWith("-01") && c.lastSettlement !== s.date) {
    c.lastSettlement = s.date;
    const before = s.finance.cash;
    let merchandiseCost = 0;
    for (const id of c.businesses) {
      const spec = BUSINESSES[id];
      post(
        s,
        -spec.cost,
        "business-cost",
        "تشغيل " + spec.name,
        id + "-cost-" + s.date,
      );
      if (id === "tours" || id === "school") {
        const gross = Math.round(
          (id === "school" ? 70000 : 25000) *
            (s.reputation / 50) *
            (s.fanSupport / 65),
        );
        post(
          s,
          gross,
          "business-income",
          "إيراد " + spec.name,
          id + "-gross-" + s.date,
        );
      }
    }
    if (c.businesses.includes("shop")) {
      const sold = Math.min(
        c.inventory,
        Math.floor(
          (s.reputation * 10 + s.fanSupport * 5) *
            clamp(650 / c.shirtPrice - 0.4, 0.05, 2),
        ),
      );
      c.inventory -= sold;
      merchandiseCost = sold * c.shirtCost;
      post(
        s,
        sold * c.shirtPrice,
        "merchandise",
        "مبيعات قمصان: " + sold,
        "shirts-" + s.date,
      );
    }
    c.history.unshift({
      date: s.date,
      net: s.finance.cash - before,
      operatingProfit: s.finance.cash - before - merchandiseCost,
    });
    c.history = c.history.slice(0, 24);
  }
}
