import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { addDays } from "../src/core/utils.js";
import { offersFor, signSponsor, sponsorDay } from "../src/services/sponsors.js";
import {
  launchCampaign,
  marketingDay,
  sponsorMood,
  sponsorMoodFactor,
  setSponsorMood,
} from "../src/services/staff/marketing.js";
import { staffView } from "../src/features/staff.js";
import { getLanguage, setLanguage } from "../src/i18n/index.js";

const game = () => createGame({ database: "demo" });

test("الحملة تُسجل كلفة وعائدًا وتزيد الجمهور ورضا الرعاة", () => {
  const s = game();
  const moodBefore = sponsorMood(s, "front");
  const cash = s.finance.cash;
  const campaign = launchCampaign(s, "season", 1_000_000);
  assert.equal(campaign.skill, 58, "مهارة مدير التسويق تدخل في العائد");
  assert.equal(campaign.ends, addDays(s.date, 45));
  assert.equal(s.finance.cash, cash - campaign.budget);
  assert.equal(moodBefore, 60);
  const language = getLanguage();
  setLanguage("en");
  const html = staffView(s, "marketing", "en");
  setLanguage(language);
  assert.match(html, /Sponsor satisfaction/);
  assert.match(html, /Season Campaign/);

  const afterSpend = s.finance.cash;
  const fansBefore = s.fanSupport;
  s.date = campaign.ends;
  assert.deepEqual(marketingDay(s).map((item) => item.id), [campaign.id]);
  assert.ok(s.finance.cash > afterSpend, "العائد يعود إلى خزينة النادي");
  assert.equal(s.fanSupport, fansBefore + 3);
  assert.equal(sponsorMood(s, "front"), 68, "الحملة الرابحة ترفع رضا الرعاة");
  assert.equal(s.staffCorp.marketing.campaigns.length, 0);
});

test("رضا الرعاة يغير عروض التجديد ويؤثر في مغادرة الراعي", () => {
  const s = game();
  const neutral = offersFor(s, "front")[1].amount;
  setSponsorMood(s, "front", 20);
  const unhappy = offersFor(s, "front")[1].amount;
  setSponsorMood(s, "front", 100);
  const satisfied = offersFor(s, "front")[1].amount;
  assert.equal(sponsorMoodFactor(s, "front"), 1.1);
  assert.ok(unhappy < neutral && neutral < satisfied, "الرضا المنخفض يخفض العرض والمرتفع يحسنه");

  const low = signSponsor(s, { assetId: "sleeve", sponsorId: "madar", amount: 1_000_000, days: 360, exclusive: false });
  const high = signSponsor(s, { assetId: "shorts", sponsorId: "sikka", amount: 1_000_000, days: 360, exclusive: false });
  assert.equal(sponsorMood(s, "sleeve"), 60, "العقود الجديدة تبدأ من رضا محايد");
  setSponsorMood(s, "sleeve", 10);
  setSponsorMood(s, "shorts", 95);
  const fansBefore = s.fanSupport;
  s.date = addDays(low.end, 1);
  sponsorDay(s);
  assert.equal(low.status, "expired");
  assert.equal(high.status, "expired");
  assert.equal(s.fanSupport, fansBefore - 3, "الراعي الغاضب يأخذ معه جزءًا من الجمهور");
  assert.ok(s.finance.ledger.some((entry) => entry.category === "sponsor-farewell" && entry.amount === 50_000), "الراعي الراضي يترك مكافأة وداعية");
  assert.equal(sponsorMood(s, "sleeve"), null, "تنتهي حالة الرضا مع العقد");
  assert.equal(sponsorMood(s, "shorts"), null);
});
