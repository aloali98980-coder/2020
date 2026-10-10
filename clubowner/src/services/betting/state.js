// حالة إمبراطورية المراهنات 0.36 — الشراء والتأسيس والتراخيص.
// التمويل من الثروة الشخصية (التاسعة)، والشبهات تمنع الترخيص.

import { assert, clamp, uid, addDays, random } from "../../core/utils.js";
import { message } from "../inbox.js";
import { addSuspicion } from "../blackFiles.js";
import { ensureEmpire } from "../empire/wealth.js";
import {
  LICENSE_TIERS,
  BETTING_COMPANIES,
  BRANCH_LEVELS,
  ONLINE_LEVELS,
  COMPETITOR_TEMPLATES,
  companyById,
  licenseById,
} from "../../data/bettingCatalog.js";
import { bettingText } from "../../data/bettingTexts.js";

export const BETTING_SCHEMA = 1;

function blankBetting() {
  return {
    schema: BETTING_SCHEMA,
    owned: false,
    companyId: null,
    name: null,
    founded: false,
    licenseTier: null,
    licenseStatus: "none", // none | active | suspended | revoked
    licenseSince: null,
    licenseUntil: null,
    suspensionUntil: null,
    reputation: 50,
    customers: 0,
    marketingSpend: 200_000,
    branches: 0,
    onlineLevel: 0,
    foundedOn: null,
    launchDate: null,
    profits: [], // {month, profit}
    totalProfit: 0,
    compliance: {
      responsibleLevel: 0, // 0-3
      lastAudit: null,
      nextAudit: null,
      finesTotal: 0,
      suspensions: 0,
      auditRisk: 12,
    },
    competitors: [],
    insiderHistory: [],
    pendingInsider: null,
    exposure: 0,
    marketValue: 0,
    sponsorLeague: false,
    lastMonthProfit: 0,
    history: [],
    version: 1,
  };
}

export function initBetting(s) {
  if (!s.betting || s.betting.schema !== BETTING_SCHEMA) {
    s.betting = blankBetting();
    // سوق مراهنات عام يعمل حتى بلا شركة (تُحسب شعبية الدوري)
    seedCompetitors(s);
  } else {
    upgradeBetting(s);
  }
  return s.betting;
}

export const ensureBetting = (s) => {
  if (!s.betting || s.betting.schema !== BETTING_SCHEMA) return initBetting(s);
  return s.betting;
};

function upgradeBetting(s) {
  const b = s.betting;
  b.schema ??= BETTING_SCHEMA;
  b.reputation ??= 50;
  b.customers ??= 0;
  b.marketingSpend ??= 200_000;
  b.branches ??= 0;
  b.onlineLevel ??= 0;
  b.profits ??= [];
  b.totalProfit ??= 0;
  b.compliance ??= { responsibleLevel: 0, lastAudit: null, nextAudit: null, finesTotal: 0, suspensions: 0, auditRisk: 12 };
  b.compliance.responsibleLevel ??= 0;
  b.competitors ??= [];
  if (!b.competitors.length) seedCompetitors(s);
  b.insiderHistory ??= [];
  b.pendingInsider ??= null;
  b.exposure ??= 0;
  b.marketValue ??= 0;
  b.sponsorLeague ??= false;
  b.lastMonthProfit ??= 0;
  b.history ??= [];
  b.licenseStatus ??= b.owned ? "active" : "none";
  b.suspensionUntil ??= null;
  return b;
}

function seedCompetitors(s) {
  const b = s.betting || blankBetting();
  b.competitors = COMPETITOR_TEMPLATES.map((tpl, idx) => ({
    id: tpl.id,
    name: tpl.name,
    customers: 40_000 + idx * 35_000 + Math.floor(random(s) * 20_000),
    reputation: 45 + idx * 6 + Math.floor(random(s) * 10),
    aggression: tpl.aggression,
    marketValue: 0,
    lastOfferDate: null,
  }));
  s.betting = b;
}

// ── التحقق من أهلية الترخيص ───────────────────────────────────────────────
export function canLicense(s, tierId) {
  const tier = licenseById(tierId);
  if (!tier) throw new Error(bettingText("tierUnknown"));
  const sus = s.blackFiles?.suspicion ?? 0;
  if (sus >= tier.maxSuspicion) throw new Error(bettingText("needSuspicion"));
  const b = ensureBetting(s);
  if (b.reputation < tier.minReputation) throw new Error(bettingText("needReputation"));
  return true;
}

export function foundingCost(tierId) {
  const t = licenseById(tierId);
  if (!t) throw new Error(bettingText("tierUnknown"));
  return t.fee + t.setup;
}

// ── الشراء ─────────────────────────────────────────────────────────────────
export function buyBettingCompany(s, companyId) {
  const b = ensureBetting(s);
  const e = ensureEmpire(s);
  if (b.owned) throw new Error(bettingText("alreadyOwned"));
  const def = companyById(companyId);
  if (!def) throw new Error(bettingText("companyUnknown"));
  assert(e.personal >= def.price, bettingText("needMoney"));
  // شبهات عالية تمنع حتى الشراء إذا كانت الشركة تتطلب ترخيصًا عاليًا
  // نكش آنيًا: الترخيص يرث مستوى الشركة (صغير→محلي، متوسط→قاري، كبير→عالمي)
  const impliedTier = def.size === "large" ? "global" : def.size === "medium" ? "continental" : "local";
  const tier = LICENSE_TIERS[impliedTier];
  const sus = s.blackFiles?.suspicion ?? 0;
  if (sus >= tier.maxSuspicion) throw new Error(bettingText("needSuspicion"));
  e.personal -= def.price;
  b.owned = true;
  b.companyId = def.id;
  b.name = def.name;
  b.founded = false;
  b.licenseTier = impliedTier;
  b.licenseStatus = "active";
  b.licenseSince = s.date;
  b.reputation = def.reputation;
  b.customers = def.customers;
  b.branches = def.branches;
  b.onlineLevel = def.onlineLevel;
  b.foundedOn = s.date;
  b.launchDate = s.date;
  b.history.push({ type: "buy", companyId: def.id, price: def.price, date: s.date });
  b.marketValue = estimateMarketValue(s);
  message(s, {
    title: bettingText("companyBoughtTitle"),
    body: bettingText("companyBoughtBody").replace("{name}", def.name.ar).replace("{money}", String(def.price)),
    category: "events",
  });
  return b;
}

// ── التأسيس ─────────────────────────────────────────────────────────────────
export function foundBettingCompany(s, tierId, customName) {
  const b = ensureBetting(s);
  const e = ensureEmpire(s);
  if (b.owned) throw new Error(bettingText("alreadyOwned"));
  const tier = licenseById(tierId);
  if (!tier) throw new Error(bettingText("tierUnknown"));
  canLicense(s, tierId);
  const cost = foundingCost(tierId);
  assert(e.personal >= cost, bettingText("needMoney"));
  e.personal -= cost;
  b.owned = true;
  b.companyId = `founded-${tierId}-${s.date}`;
  b.name = customName ? { ar: customName, en: customName, fr: customName } : { ar: "شركة الأحلام", en: "DreamBet", fr: "DreamBet" };
  b.founded = true;
  b.licenseTier = tierId;
  b.licenseStatus = "active";
  b.licenseSince = s.date;
  b.licenseUntil = null;
  b.reputation = 38;
  b.customers = 0;
  b.branches = 0;
  b.onlineLevel = 0;
  b.foundedOn = s.date;
  b.launchDate = addDays(s.date, tier.days);
  b.history.push({ type: "found", tier: tierId, cost, date: s.date });
  b.marketValue = estimateMarketValue(s);
  message(s, {
    title: bettingText("companyFoundedTitle"),
    body: bettingText("companyFoundedBody").replace("{tier}", tier.name.ar).replace("{days}", String(tier.days)),
    category: "events",
  });
  return b;
}

export function upgradeLicense(s, newTierId) {
  const b = ensureBetting(s);
  if (!b.owned) throw new Error(bettingText("noCompany"));
  if (b.licenseStatus === "revoked") throw new Error(bettingText("licenseRevokedTitle"));
  const order = ["local", "continental", "global"];
  const curIdx = order.indexOf(b.licenseTier);
  const newIdx = order.indexOf(newTierId);
  if (newIdx <= curIdx) throw new Error("الترقية يجب أن تكون لمستوى أعلى");
  const tier = licenseById(newTierId);
  canLicense(s, newTierId);
  const e = ensureEmpire(s);
  const feeDiff = tier.fee - LICENSE_TIERS[b.licenseTier].fee;
  const setupDiff = tier.setup - LICENSE_TIERS[b.licenseTier].setup;
  const cost = Math.max(0, feeDiff + setupDiff);
  assert(e.personal >= cost, bettingText("needMoney"));
  e.personal -= cost;
  b.licenseTier = newTierId;
  b.licenseSince = s.date;
  b.history.push({ type: "upgrade-license", tier: newTierId, cost, date: s.date });
  message(s, {
    title: bettingText("licenseAcquiredTitle"),
    body: bettingText("licenseAcquiredBody").replace("{tier}", tier.name.ar),
    category: "events",
  });
  return b;
}

// ── ترقية فروع/تطبيق ────────────────────────────────────────────────────────
export function upgradeBranches(s, targetLevel) {
  const b = ensureBetting(s);
  if (!b.owned) throw new Error(bettingText("noCompany"));
  if (targetLevel <= b.branches) throw new Error("مستوى الفروع يجب أن يكون أعلى");
  const def = BRANCH_LEVELS.find((x) => x.level === targetLevel);
  if (!def) throw new Error("مستوى غير معروف");
  const e = ensureEmpire(s);
  assert(e.personal >= def.cost, bettingText("needMoney"));
  e.personal -= def.cost;
  b.branches = targetLevel;
  b.history.push({ type: "branch-up", level: targetLevel, cost: def.cost, date: s.date });
  message(s, { title: bettingText("upgradeBranchTitle"), body: `الفروع الآن مستوى ${targetLevel}`, category: "events" });
  return b;
}

export function upgradeOnline(s, targetLevel) {
  const b = ensureBetting(s);
  if (!b.owned) throw new Error(bettingText("noCompany"));
  if (targetLevel <= b.onlineLevel) throw new Error("مستوى التطبيق يجب أن يكون أعلى");
  const def = ONLINE_LEVELS.find((x) => x.level === targetLevel);
  if (!def) throw new Error("مستوى غير معروف");
  const e = ensureEmpire(s);
  assert(e.personal >= def.cost, bettingText("needMoney"));
  e.personal -= def.cost;
  b.onlineLevel = targetLevel;
  b.history.push({ type: "online-up", level: targetLevel, cost: def.cost, date: s.date });
  message(s, { title: bettingText("upgradeOnlineTitle"), body: `المنصة الآن مستوى ${targetLevel}`, category: "events" });
  return b;
}

export function setMarketingSpend(s, amount) {
  const b = ensureBetting(s);
  if (!b.owned) throw new Error(bettingText("noCompany"));
  assert(Number.isFinite(amount) && amount >= 0 && amount <= 2_000_000, "إنفاق تسويقي غير صالح");
  b.marketingSpend = Math.round(amount);
  message(s, { title: bettingText("marketingSetTitle"), body: `التسويق الشهري ${b.marketingSpend}`, category: "events" });
  return b.marketingSpend;
}

// ── القيمة السوقية للاكتتاب (البورصة لاحقًا) ───────────────────────────────
export function estimateMarketValue(s) {
  const b = s.betting;
  if (!b || !b.owned) return 0;
  if (b.licenseStatus === "revoked") return 0;
  const tier = LICENSE_TIERS[b.licenseTier] || LICENSE_TIERS.local;
  // متوسط ربح آخر 3 أشهر (أو كلها)
  const profits = b.profits || [];
  const avgProfit = profits.length
    ? profits.slice(-3).reduce((sum, r) => sum + r.profit, 0) / Math.min(3, profits.length)
    : b.lastMonthProfit || 0;
  const annual = Math.max(0, avgProfit) * 12;
  const mult = b.licenseTier === "global" ? 9 : b.licenseTier === "continental" ? 7 : 5;
  const profitPart = annual * mult;
  const repPart = b.reputation * 120_000;
  const custPart = b.customers * 85;
  const base = profitPart + repPart + custPart;
  const val = Math.round(base * (tier.marketMult || 1) * (b.reputation / 65 + 0.5));
  b.marketValue = Math.max(0, val);
  return b.marketValue;
}

// ── أدوات اختبار ───────────────────────────────────────────────────────────
export function _resetBettingForTest(s) {
  s.betting = blankBetting();
  seedCompetitors(s);
  return s.betting;
}
