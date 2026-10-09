import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { addDays } from "../src/core/utils.js";
import { squad } from "../src/models/player.js";
import { commerceDay, initCommerce } from "../src/services/commerce.js";
import {
  publishContent,
  derbyCampaign,
  triggerCrisis,
  resolveCrisis,
  socialDay,
  socialMonth,
  socialState,
  onlineShirtMultiplier,
} from "../src/services/staff/social.js";
import { staffView } from "../src/features/staff.js";

const game = () => createGame({ database: "demo" });
const addSocialManager = (s, skill) => {
  s.staffCorp.hq.level = 5;
  s.staffCorp.employees.push({
    id: "social-test-manager", role: "social", fame: "generated", fid: null,
    name: { ar: "مدير السوشيال", en: "Social Manager", fr: "Responsable social" },
    skill, level: 1, wage: 100000, bonusPct: 0, releaseClause: 0,
    contractEnd: addDays(s.date, 365), joined: s.date, loyalty: 60, lastRaise: s.date,
    assignment: null, history: [],
  });
};

const seedForNoEscalation = (s) => { s.staffCorp.rng = 0x12345678; };

test("نشر المحتوى يستهلك الميزانية ويزيد المتابعين والتفاعل", () => {
  const s = game();
  addSocialManager(s, 80);
  const beforeCash = s.finance.cash;
  const beforeFans = s.fanSupport;
  const before = { ...socialState(s) };
  const result = publishContent(s, "training");
  assert.equal(s.finance.cash, beforeCash - 50_000);
  assert.ok(result.followers > before.followers);
  assert.equal(result.engagement, before.engagement + 4);
  assert.equal(s.fanSupport, beforeFans + 1);
  assert.equal(result.posts[0].kind, "training");
  assert.match(staffView(s, "social", "en"), /Training Access/);
});

test("حملة الديربي تُصرف مرة واحدة للمباراة القريبة وتؤثر في الجمهور والمعنويات", () => {
  const s = game();
  s.bigMatches = [{ id: "test-derby", date: addDays(s.date, 5) }];
  const beforeCash = s.finance.cash;
  const beforeFans = s.fanSupport;
  const beforeFollowers = socialState(s).followers;
  const player = squad(s)[0];
  const beforeMorale = player.morale;
  assert.equal(derbyCampaign(s), true);
  assert.equal(s.finance.cash, beforeCash - 300_000);
  assert.equal(s.fanSupport, beforeFans + 3);
  assert.equal(player.morale, beforeMorale + 2);
  assert.equal(socialState(s).followers, Math.round(beforeFollowers * 1.05));
  assert.throws(() => derbyCampaign(s), /أُطلقت حملة هذا الديربي بالفعل/);
  assert.equal(s.finance.cash, beforeCash - 300_000, "النقر المكرر لا يسجل أثرًا إضافيًا");
});

test("الاعتذار غير الممول يبقي الأزمة مفتوحة، ثم الرد يغلق القرار المطلوب", () => {
  const s = game();
  const crisis = triggerCrisis(s, "tweet");
  const beforeFans = s.fanSupport;
  const beforeEngagement = socialState(s).engagement;
  const cash = s.finance.cash;
  s.finance.cash = 0;
  assert.throws(() => resolveCrisis(s, "apology"), /الاعتذار العلني يكلف ٢٠٠ ألف/);
  assert.equal(crisis.status, "open");
  assert.equal(s.fanSupport, beforeFans);
  s.finance.cash = cash;
  resolveCrisis(s, "apology");
  assert.equal(crisis.status, "apology");
  assert.equal(s.fanSupport, beforeFans + 2);
  assert.equal(socialState(s).engagement, beforeEngagement + 5);
  assert.ok(s.inbox.filter((item) => item.ref === crisis.id).every((item) => item.status === "resolved"));
  assert.equal(s.inbox.some((item) => item.ref === crisis.id && item.required && item.status === "open"), false);
});

test("الغرامة تُحصّل، والتجاهل الكامل يفاقم الجمهور ثم تنتهي الأزمة بمهلة واضحة", () => {
  const fineSave = game();
  const fineCash = fineSave.finance.cash;
  const fineFans = fineSave.fanSupport;
  const fine = triggerCrisis(fineSave, "video");
  resolveCrisis(fineSave, "fine");
  assert.equal(fine.status, "fine");
  assert.equal(fineSave.finance.cash, fineCash + 150_000);
  assert.equal(fineSave.fanSupport, fineFans);
  assert.equal(fineSave.inbox.find((item) => item.ref === fine.id).status, "resolved");

  const s = game();
  const crisis = triggerCrisis(s, "fight");
  seedForNoEscalation(s);
  const beforeFans = s.fanSupport;
  const beforeEngagement = socialState(s).engagement;
  resolveCrisis(s, "ignore");
  assert.equal(crisis.status, "ignore");
  assert.equal(s.fanSupport, beforeFans - 4);
  assert.equal(socialState(s).engagement, beforeEngagement - 10);
  assert.equal(s.inbox.some((item) => item.ref === crisis.id && item.status === "open"), false);

  const overdueSave = game();
  const overdue = triggerCrisis(overdueSave, "tweet");
  overdueSave.date = overdue.deadline;
  socialDay(overdueSave);
  assert.equal(overdue.status, "exploded");
  assert.ok(overdueSave.inbox.filter((item) => item.ref === overdue.id).every((item) => item.status === "resolved"));
});

test("المتابعون يرفعون معامل الطلب ومبيعات القمصان على المتجر المفتوح", () => {
  assert.equal(onlineShirtMultiplier({ staffCorp: { social: { followers: 0 } }, date: "2026-01-01" }), 1);
  const low = game();
  initCommerce(low);
  low.date = "2026-10-01";
  low.commerce.businesses = ["shop"];
  low.commerce.inventory = 5000;
  socialState(low).followers = 0;
  commerceDay(low);
  const lowSold = 5000 - low.commerce.inventory;

  const high = game();
  initCommerce(high);
  high.date = "2026-10-01";
  high.commerce.businesses = ["shop"];
  high.commerce.inventory = 5000;
  socialState(high).followers = 1_000_000;
  assert.equal(onlineShirtMultiplier(high), 1.5);
  commerceDay(high);
  const highSold = 5000 - high.commerce.inventory;
  assert.ok(highSold > lowSold, `${highSold} > ${lowSold}`);

  const monthly = game();
  initCommerce(monthly);
  monthly.date = "2026-10-01";
  monthly.commerce.businesses = ["shop"];
  socialState(monthly).followers = 100_000;
  socialMonth(monthly);
  assert.ok(monthly.finance.ledger.some((entry) => entry.category === "online-shirts" && entry.amount > 0));
});
