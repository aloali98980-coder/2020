// الإدارة الشهرية 0.36 — العملاء، الأرباح، الفروع، المنصة، المنافسون.
import { clamp, random, uid } from "../../core/utils.js";
import { message } from "../inbox.js";
import { ensureEmpire, personalIncome } from "../empire/wealth.js";
import { ensureBetting, estimateMarketValue } from "./state.js";
import { BRANCH_LEVELS, ONLINE_LEVELS } from "../../data/bettingCatalog.js";
import { bettingText } from "../../data/bettingTexts.js";

// شعبية الدوري: مزيج من سمعة ناديك ودعم الجماهير + مركزك في الجدول
function leaguePopularity(s) {
  const rep = s.reputation ?? 60;
  const fan = s.fanSupport ?? 70;
  const rank = (() => {
    const row = s.table?.find((r) => r.clubId === s.clubId);
    const sorted = [...(s.table || [])].sort((a, b) => b.points - a.points);
    const pos = sorted.findIndex((r) => r.clubId === s.clubId) + 1;
    return pos || sorted.length || 1;
  })();
  const rankFactor = Math.max(0.7, 1.2 - rank * 0.04);
  const base = (rep * 0.6 + fan * 0.4) / 100;
  return clamp(base * rankFactor, 0.55, 1.45);
}

export function monthlyProfit(s) {
  const b = ensureBetting(s);
  if (!b.owned || b.licenseStatus !== "active") return 0;
  if (b.launchDate && s.date < b.launchDate) return 0; // قيد التجهيز

  const customers = b.customers || 0;
  const avgStake = 180 + b.onlineLevel * 40 + b.reputation * 0.8; // متوسط رهان العميل شهريًا
  const margin = 0.065 + (b.reputation - 50) * 0.0005 + random(s) * 0.02 - 0.01; // هامش الربح 5-9%
  const marketFactor = leaguePopularity(s);
  const gross = customers * avgStake * clamp(margin, 0.04, 0.11) * marketFactor;

  const branchUp = (BRANCH_LEVELS.find((x) => x.level === b.branches)?.upkeep || 0);
  const onlineUp = (ONLINE_LEVELS.find((x) => x.level === b.onlineLevel)?.upkeep || 0);
  const tierUp = ({ local: 180_000, continental: 420_000, global: 900_000 }[b.licenseTier] || 180_000);
  const complianceCost = (b.compliance.responsibleLevel || 0) * 250_000; // 0,250k,500k,750k
  if (b.compliance.responsibleLevel === 3) complianceCost + 250_000; // تصحيح

  // التسويق + صيانة + امتثال + عشوائية
  const expenses = b.marketingSpend + branchUp + onlineUp + tierUp + complianceCost + (b.sponsorLeague ? 300_000 : 0);
  const variance = (random(s) - 0.5) * gross * 0.18;
  const profit = Math.round(gross - expenses + variance);

  return profit;
}

export function growCustomers(s) {
  const b = ensureBetting(s);
  if (!b.owned || b.licenseStatus !== "active") return b.customers;
  if (b.launchDate && s.date < b.launchDate) return b.customers;

  const base = 0.015;
  const marketingBonus = clamp(b.marketingSpend / 2_000_000, 0, 1) * 0.045;
  const repBonus = (b.reputation - 50) * 0.0009;
  const branchBonus = b.branches * 0.007;
  const onlineBonus = (ONLINE_LEVELS.find((x) => x.level === b.onlineLevel)?.growth || 0);
  const tierBonus = b.licenseTier === "global" ? 0.02 : b.licenseTier === "continental" ? 0.01 : 0;
  const popularityBonus = (leaguePopularity(s) - 1) * 0.04;
  const responsiblePenalty = b.compliance.responsibleLevel * -0.003; // حماية لكن تبطئ نمو طفيف
  const competitionPenalty = b.competitors?.reduce((sum, c) => sum + (c.aggression * 0.002), 0) || 0;

  let growthRate = base + marketingBonus + repBonus + branchBonus + onlineBonus + tierBonus + popularityBonus + responsiblePenalty - competitionPenalty;
  growthRate += (random(s) - 0.5) * 0.02;
  growthRate = clamp(growthRate, -0.04, 0.12);

  // سعة الفروع تحدد الحد الأقصى
  const branchCap = (BRANCH_LEVELS.find((x) => x.level === b.branches)?.capBonus || 0) + 150_000;
  const onlineCap = b.onlineLevel * 80_000;
  const tierCap = b.licenseTier === "global" ? 600_000 : b.licenseTier === "continental" ? 300_000 : 120_000;
  const cap = branchCap + onlineCap + tierCap;

  const next = Math.round(b.customers * (1 + growthRate));
  b.customers = clamp(next, 0, cap + 500_000);
  // سمعة الشركة تتحرك ببطء مع الربحية والامتثال
  if (b.lastMonthProfit > 500_000) b.reputation = clamp(b.reputation + 0.6, 0, 100);
  else if (b.lastMonthProfit < -800_000) b.reputation = clamp(b.reputation - 1.1, 0, 100);
  if (b.compliance.responsibleLevel >= 2) b.reputation = clamp(b.reputation + 0.3, 0, 100);
  return b.customers;
}

// منافسون AI: حرب احتمالات وعملاء + عروض شراء متبادلة
export function competitorAI(s) {
  const b = ensureBetting(s);
  if (!b.competitors?.length) return;

  for (const c of b.competitors) {
    // نمو عشوائي للمنافس
    const grow = 0.01 + c.aggression * 0.015 + (random(s) - 0.5) * 0.015;
    c.customers = Math.max(5_000, Math.round(c.customers * (1 + clamp(grow, -0.02, 0.08))));
    c.reputation = clamp(c.reputation + (random(s) - 0.5) * 1.2, 20, 92);

    // حرب احتمالات: إذا تفوق المنافس في السمعة يسحب منك عملاء
    if (b.owned && b.customers > 0 && c.reputation > b.reputation + 8) {
      const steal = Math.round(b.customers * 0.006 * c.aggression);
      b.customers = Math.max(0, b.customers - steal);
      c.customers += steal;
    }

    // تحديث القيمة السوقية للمنافس (تقديري)
    c.marketValue = Math.round(c.customers * 85 + c.reputation * 110_000);
  }

  // عروض شراء متبادلة: فرصة 4% شهريًا إذا كنت صغيرًا وهم كبار، و 3% أن تشتريهم
  if (b.owned && random(s) < 0.04) {
    const buyer = [...b.competitors].sort((a, b2) => b2.customers - a.customers)[0];
    if (buyer && buyer.customers > b.customers * 1.6) {
      const offer = Math.round(b.marketValue * (0.9 + random(s) * 0.25));
      message(s, {
        title: `عرض شراء لشركتك من ${buyer.name.ar}`,
        body: `${buyer.name.ar} يعرض ${offer} لشراء شركتك (${b.customers} عميل). المنافس أقوى منك حاليًا.`,
        category: "events",
        kind: "betting-buyout-offer",
        meta: { offer, buyer: buyer.id },
      });
    }
  }

  if (b.owned && random(s) < 0.03) {
    const target = [...b.competitors].sort((a, b2) => a.customers - b.customers).find((c) => c.customers < b.customers * 0.8);
    if (target) {
      const ask = Math.round(target.marketValue * (1.05 + random(s) * 0.2));
      message(s, {
        title: `فرصة استحواذ: ${target.name.ar} للبيع`,
        body: `${target.name.ar} متاح للاستحواذ مقابل ${ask}. سمعة ${target.reputation} — ${target.customers} عميل.`,
        category: "events",
        kind: "betting-acquire-offer",
        meta: { ask, target: target.id },
      });
    }
  }
}

export function buyCompetitor(s, competitorId) {
  const b = ensureBetting(s);
  const e = ensureEmpire(s);
  const comp = b.competitors.find((c) => c.id === competitorId);
  if (!comp) throw new Error("منافس غير موجود");
  const price = Math.round(comp.marketValue * 1.15);
  if (e.personal < price) throw new Error(bettingText("needMoney"));
  e.personal -= price;
  b.customers += Math.round(comp.customers * 0.75);
  b.reputation = clamp(Math.round((b.reputation * 0.8 + comp.reputation * 0.2)), 0, 100);
  b.competitors = b.competitors.filter((c) => c.id !== competitorId);
  b.history.push({ type: "acquire-competitor", competitorId, price, date: s.date });
  message(s, { title: "استحواذ على منافس", body: `استحوذت على ${comp.name.ar} مقابل ${price} وأضفت ${Math.round(comp.customers * 0.75)} عميل.`, category: "events" });
  estimateMarketValue(s);
  return b;
}

export function sellToCompetitor(s, buyerId, amount) {
  const b = ensureBetting(s);
  const e = ensureEmpire(s);
  const buyer = b.competitors.find((c) => c.id === buyerId);
  if (!buyer) throw new Error("مشترٍ غير موجود");
  e.personal += amount;
  b.owned = false;
  b.licenseStatus = "none";
  b.customers = 0;
  b.marketValue = 0;
  b.history.push({ type: "sold-to-competitor", buyerId, amount, date: s.date });
  message(s, { title: "بعت شركة المراهنات", body: `بعت شركتك إلى ${buyer.name.ar} مقابل ${amount}. خرجت من السوق.`, category: "events" });
  return b;
}
