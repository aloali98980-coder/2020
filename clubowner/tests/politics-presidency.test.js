// تظبيط الرئاسة 0.51 — الدفعة 2 من جلسة «السياسة والصلاحيات».
// تبسيط الطريق (ترشح ← حملة ← تصويت ← فوز) + معالج الانتخابات (محتاج كام؟ منين؟)
// + شرح القوانين بلغة واضحة + بطاقة تعريف + ربط التبرعات — بلا أي حالة جديدة.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import {
  CONFERENCE_COST,
  VISIT_COST,
  campaignMonthlyTick,
  electionForecast,
  makeCampaignPromise,
  visitClub,
} from "../src/services/politics/campaign.js";
import {
  donationGratitude,
  donationPlanForSupport,
  donateToClub,
} from "../src/services/politics/donations.js";
import {
  ACTION_GAIN,
  presidencySteps,
  presidencyWizard,
} from "../src/services/politics/wizard.js";
import { POLITICAL_LAW_LIST } from "../src/data/politicsLaws.js";

const game = () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  s.empire.personal = 300_000_000;
  return s;
};
const startCampaign = (s) => {
  s.date = "2027-07-01";
  s.nextSeasonDate = "2028-07-01";
  s.seasonNumber = s.politics.election.season;
  campaignMonthlyTick(s);
  return s;
};

test("الطريق الرئاسي أربع خطوات مرتّبة، والحملة الجارية هي الخطوة الحالية", () => {
  const s = startCampaign(game());
  const steps = presidencySteps(s);
  assert.deepEqual(
    steps.map((step) => step.id),
    ["run", "campaign", "vote", "win"],
  );
  assert.deepEqual(
    steps.map((step) => step.state),
    ["done", "current", "next", "next"],
  );
  // قبل بداية الموسم الانتخابي تكون الخطوة الحالية «ترشح».
  const fresh = game();
  assert.equal(presidencySteps(fresh)[0].state, "current");
  assert.equal(presidencySteps(fresh)[1].state, "next");
  // حد الولايات يوقف الخطوة الأولى بدل أن يتركها مفتوحة.
  fresh.politics.council.constitution.termLimit = 0;
  fresh.politics.office.termsServed = 0;
  fresh.politics.election.status = "campaigning";
  fresh.politics.campaign.active = true;
  fresh.politics.campaign.playerEligible = false;
  assert.equal(presidencySteps(fresh)[0].state, "blocked");
  assert.equal(presidencySteps(fresh)[0].detail, "term-limit");
});

test("التوقع الانتخابي يقرأ النموذج نفسه: أغلبية موزونة وفرق معلن", () => {
  const s = startCampaign(game());
  const forecast = electionForecast(s);
  assert.equal(
    forecast.totalWeight,
    s.politics.clubs.reduce((n, c) => n + c.voteWeight, 0),
  );
  assert.equal(
    forecast.majorityWeight,
    Math.floor(forecast.totalWeight / 2) + 1,
  );
  assert.equal(
    forecast.playerVotes + forecast.neededWeight,
    forecast.majorityWeight,
  );
  assert.equal(
    forecast.playerShare,
    Math.round((forecast.playerVotes / forecast.totalWeight) * 1000) / 10,
  );
  assert(forecast.perClub.length === s.politics.clubs.length);
  for (const row of forecast.perClub)
    assert(row.leaderScore >= row.playerScore);
  for (const row of forecast.swing) {
    assert(row.leaderId !== "player");
    assert.equal(
      row.neededScore,
      Math.round((row.leaderScore - row.playerScore + 0.1) * 10) / 10,
    );
    assert.equal(
      row.neededSupport,
      Math.ceil((row.neededScore / 0.47) * 10) / 10,
    );
  }
  assert.equal(
    forecast.swing.length,
    forecast.perClub.filter((row) => row.leaderId !== "player").length,
  );
});

test("المعالج يجيب «محتاج كام؟»: أدوات الحملة أرخص ثم التبرعات تغطي الفرق", () => {
  const s = startCampaign(game());
  const wizard = presidencyWizard(s);
  assert.equal(wizard.neededWeight, electionForecast(s).neededWeight);
  assert.equal(
    wizard.plan.total,
    wizard.plan.campaignCost + wizard.plan.donationCost,
  );
  assert.equal(
    wizard.plan.campaignCost,
    wizard.plan.clubs.reduce((n, c) => n + c.cost, 0),
  );
  assert.equal(
    wizard.plan.donationCost,
    wizard.plan.clubs.reduce((n, c) => n + c.donation, 0),
  );
  assert(wizard.plan.weight >= wizard.neededWeight, "الخطة تغطي الأغلبية");
  assert(
    wizard.plan.clubs.every(
      (club) => club.visit || club.promise || club.conferences >= 0,
    ),
  );
  // كل زيارة/مؤتمر في الخطة مسعّرة بالأرقام المعلنة نفسها.
  for (const club of wizard.plan.clubs) {
    const expected =
      (club.visit ? VISIT_COST : 0) + club.conferences * CONFERENCE_COST;
    assert.equal(club.cost, expected);
    assert.equal(
      club.gained,
      (club.visit ? ACTION_GAIN.visit : 0) +
        (club.promise ? ACTION_GAIN.promise : 0) +
        club.conferences * ACTION_GAIN.conference,
    );
  }
  assert.equal(
    wizard.required,
    wizard.plan.total + wizard.costs.recommendedFunding,
  );
  assert.equal(
    wizard.shortfall,
    Math.max(0, wizard.required - wizard.available),
  );
  assert.equal(wizard.surplus, Math.max(0, wizard.available - wizard.required));
  assert.equal(wizard.sources.personal, wizard.available);
  assert.equal(wizard.sources.campaignFunds, s.politics.campaign.funds);
  assert.equal(wizard.checklist.visits.total, s.politics.clubs.length);
  assert.equal(wizard.eligible, true);
  validateSave(s);
});

test("معكوس الامتنان يعطي أقل مبلغ يحقق النقاط المطلوبة", () => {
  for (const support of [50, 70, 95]) {
    for (const points of [1, 3, 6, 12]) {
      const plan = donationPlanForSupport(support, points);
      assert(plan.count >= 1);
      assert(
        donationGratitude(plan.amount, support) > 0,
        "المبلغ المخطط يشتري امتنانًا فعليًا",
      );
      assert(
        plan.reached,
        `خطة ${points} نقطة عند تأييد ${support} يجب أن تكتمل`,
      );
      assert(plan.supportAfter >= Math.min(100, support + points) - 0.05);
    }
  }
  const capped = donationPlanForSupport(98, 30);
  assert.equal(capped.supportAfter, 100, "التأييد لا يتجاوز السقف");
});

test("الخطة تستثمر ما تم فعلًا: الزيارة المسجلة لا تُحسب مرتين", () => {
  const s = startCampaign(game());
  const before = presidencyWizard(s);
  const target = before.plan.clubs[0];
  visitClub(s, target.clubId);
  makeCampaignPromise(
    s,
    target.clubId,
    s.politics.clubs.find((c) => c.clubId === target.clubId).demandId,
  );
  const after = presidencyWizard(s);
  const again = after.plan.clubs.find((club) => club.clubId === target.clubId);
  // إما كسبنا النادي فخرج من الخطة، وإما بقي فيها بلا زيارة/وعد جديدين.
  assert(!again || (again.visit === false && again.promise === false));
  assert(
    after.neededWeight < before.neededWeight,
    "النادي المكتسب يقلّص الأغلبية المطلوبة",
  );
  validateSave(s);
});

test("ربط التبرعات: التبرع العلني يقلّص فرق الأصوات في المعالج", () => {
  const s = startCampaign(game());
  const wizard = presidencyWizard(s);
  assert.equal(wizard.donations.total, 0);
  const swing = wizard.forecast.swing[0];
  donateToClub(s, swing.clubId, 30_000_000);
  const after = presidencyWizard(s);
  assert.equal(after.donations.total, 30_000_000);
  assert.equal(after.donations.clubs, 1);
  const row = after.forecast.perClub.find(
    (club) => club.clubId === swing.clubId,
  );
  assert(
    row.playerScore > swing.playerScore,
    "الامتنان يرفع نتيجة النادي للمالك",
  );
  const afterSwing = after.forecast.swing.find(
    (club) => club.clubId === swing.clubId,
  );
  assert(
    !afterSwing || afterSwing.neededSupport <= swing.neededSupport,
    "الفرق المطلوب في هذا النادي لا يزيد بعد التبرع",
  );
  assert.equal(after.sources.donationsTotal, 30_000_000);
  validateSave(s);
});

test("شرح القوانين: نص واضح لكل لائحة في اللغات الثلاث", () => {
  assert.equal(POLITICAL_LAW_LIST.length, 12);
  for (const law of POLITICAL_LAW_LIST) {
    assert(law.explain?.ar && law.explain?.en && law.explain?.fr, law.id);
    assert(!/[\u0600-\u06FF]/.test(law.explain.en + law.explain.fr), law.id);
    assert(law.explain.ar.length > 40, law.id);
  }
  // نسخ اللغات تُعرض مباشرة من الكتالوج (مثل بقية بيانات القوانين) لا عبر القاموس.
  for (const law of POLITICAL_LAW_LIST) {
    assert.notEqual(law.explain.en, law.explain.ar, law.id);
    assert.notEqual(law.explain.fr, law.explain.ar, law.id);
  }
});

test("بطاقة التعريف ومعالج الانتخابات لا يغيّران أي حالة محفوظة", () => {
  const s = startCampaign(game());
  const snapshot = JSON.stringify({
    politics: s.politics,
    personal: s.empire.personal,
    cash: s.finance.cash,
  });
  presidencySteps(s);
  presidencyWizard(s);
  electionForecast(s);
  assert.equal(
    JSON.stringify({
      politics: s.politics,
      personal: s.empire.personal,
      cash: s.finance.cash,
    }),
    snapshot,
  );
  validateSave(s);
});

test("الواجهة: الطريق والبطاقة والمعالج في الحملة، وشرح لكل لائحة في المجلس", async () => {
  const { politicsView } = await import("../src/features/politics.js");
  const s = startCampaign(game());
  const campaign = politicsView(s, "campaign");
  assert(campaign.includes("politics-roadmap"), "شريط الخطوات الأربع يظهر");
  assert(campaign.includes("politics-id-card"), "بطاقة التعريف تظهر");
  assert(campaign.includes("politics-wizard-panel"), "معالج الانتخابات يظهر");
  assert(campaign.includes("محتاج كام؟") && campaign.includes("منين؟"));
  const council = politicsView(s, "council");
  assert.equal(
    (council.match(/politics-law-explain/g) || []).length,
    POLITICAL_LAW_LIST.length,
    "شرح واضح لكل لائحة",
  );
  for (const tab of ["overview", "map", "campaign", "council", "committees"])
    assert(
      !/[\u0660-\u0669\u06F0-\u06F9\u066A]/.test(politicsView(s, tab)),
      `أرقام غير لاتينية في ${tab}`,
    );
  validateSave(s);
});

test("انتخابات الرئاسة 🗳️ (محفز + شروط): التحقق من الأهلية وإطلاق الحملة", async () => {
  const {
    presidencyEligibility,
    triggerElectionCampaign,
    declareCandidacy,
  } = await import("../src/services/politics/campaign.js");
  const { politicsView } = await import("../src/features/politics.js");

  const s = game();
  const elig = presidencyEligibility(s);
  assert.equal(elig.eligible, true);
  assert.equal(elig.termLimitOk, true);
  assert.equal(elig.integrityOk, true);
  assert.equal(elig.clubMapOk, true);
  assert.equal(elig.solvencyOk, true);

  // زر المحفز يظهر في الواجهة قبل انطلاق الحملة
  const beforeHtml = politicsView(s, "campaign");
  assert.ok(beforeHtml.includes('data-action="politics-start-campaign"'));

  // رفض الترشح عند اختلال أي شرط (نزاهة < 20، عجز مالي، حد الولايات)
  s.politics.integrity.score = 15;
  assert.equal(presidencyEligibility(s).eligible, false);
  assert.throws(() => triggerElectionCampaign(s), /النزاهة/);
  s.politics.integrity.score = 82;

  s.finance.cash = -500;
  assert.equal(presidencyEligibility(s).eligible, false);
  assert.throws(() => triggerElectionCampaign(s), /عجز/);
  s.finance.cash = 75_000_000;

  s.politics.council.constitution.termLimit = 2;
  s.politics.office.termsServed = 2;
  assert.equal(presidencyEligibility(s).eligible, false);
  assert.throws(() => declareCandidacy(s), /الدستوري/);
  s.politics.council.constitution.termLimit = null;
  s.politics.office.termsServed = 0;

  // إطلاق الحملة عبر المحفز عند استيفاء الشروط
  const status = triggerElectionCampaign(s);
  assert.equal(status.active, true);
  assert.equal(s.politics.election.status, "campaigning");
  assert.equal(s.politics.campaign.active, true);
  validateSave(s);
});

test("انتخابات الرئاسة 🗳️ (راجعة): الوعود تدعم التصويت وتنتقل للولاية وتُحاسب عند الوفاء أو الكسر", async () => {
  const {
    electionFeedback,
    makeCampaignPromise,
    politicalSeasonEnd,
    triggerElectionCampaign,
    voteScores,
  } = await import("../src/services/politics/campaign.js");
  const { bargainBill, proposeBill, resolveBill } = await import(
    "../src/services/politics/council.js"
  );

  const s = game();
  triggerElectionCampaign(s);
  const [clubA, clubB] = s.politics.clubs;

  const scoreBefore = voteScores(s, clubA.clubId).find(
    (r) => r.candidateId === "player",
  ).score;
  const prA = makeCampaignPromise(s, clubA.clubId, clubA.demandId);
  const prB = makeCampaignPromise(s, clubB.clubId, clubB.demandId);
  const scoreAfter = voteScores(s, clubA.clubId).find(
    (r) => r.candidateId === "player",
  ).score;
  assert.ok(scoreAfter > scoreBefore, "الوعد يرفع نقاط التصويت للنادي");

  // تأمين الفوز في الانتخابات والتحقق من أن الوعود لا تُكسر قبل التصويت بل تنتقل للولاية
  for (const club of s.politics.clubs) club.support = 95;
  const result = politicalSeasonEnd(s);
  assert.equal(result.won, true);
  assert.equal(s.politics.office.held, true);
  assert.equal(
    s.politics.campaign.promises.length,
    2,
    "الوعود الانتخابية تنتقل إلى الولاية الرئاسية للمحاسبة",
  );
  assert.ok(
    s.politics.campaign.promises.every(
      (p) => p.status === "pending" && p.termMandate === true,
    ),
  );

  // تمرير اللائحة المرتبطة بمطلب النادي الأول يفي بالوعد الأول ويرفع التأييد
  const lawForA = POLITICAL_LAW_LIST.find((l) => l.demandId === prA.demandId);
  const bill = proposeBill(s, lawForA.id);
  for (const club of s.politics.clubs)
    bargainBill(s, bill.id, club.clubId, "public-case");
  const billRes = resolveBill(s, bill.id);
  assert.equal(billRes.passed, true);

  const fbMid = electionFeedback(s);
  assert.equal(fbMid.promises.fulfilled, 1);
  assert.equal(fbMid.promises.pending, 1);

  // عند نهاية الولاية، الوعد الثاني غير المنفذ يُحاسب كمكسور ويخصم التأييد والشرعية
  s.seasonNumber = s.politics.office.termEndSeason;
  const supportBeforeBreak = clubB.support;
  const legBeforeBreak = s.politics.legitimacy;
  politicalSeasonEnd(s);
  const fbEnd = electionFeedback(s);
  assert.equal(fbEnd.promises.broken, 1);
  const brokenRecord = fbEnd.promises.items.find((p) => p.id === prB.id);
  assert.equal(brokenRecord.status, "broken");
  assert.ok(
    clubB.support <= supportBeforeBreak - 10 ||
      s.politics.legitimacy !== legBeforeBreak,
  );
  assert.ok(
    s.inbox.some((m) => m.title.includes("محاسبة الوعود الرئاسية")),
    "رسالة راجعة لمحاسبة الوعود",
  );
  validateSave(s);
});

test("انتخابات الرئاسة 🗳️: محاكاة كاملة حتى الانتخابات والفوز بالرئاسة", async () => {
  const { advanceTime } = await import("../src/services/time.js");
  const {
    debate,
    electionFeedback,
    fundCampaign,
    holdConference,
    isCampaignActive,
    makeCampaignPromise,
    visitClub,
  } = await import("../src/services/politics/campaign.js");

  const s = createGame({ clubId: "ahly", database: "demo" });
  s.preferences.pauseMatches = false;
  s.empire.personal = 200_000_000;
  const targetElectionSeason = s.politics.election.season;

  let campaignTriggered = false;
  let campaigned = false;

  // محاكاة يومية من الموسم 1 عبر موسم الانتخابات حتى حسم الاقتراع وبداية الولاية
  for (
    let day = 0;
    day < 2000 && s.seasonNumber <= targetElectionSeason;
    day++
  ) {
    for (const m of s.inbox) {
      if (m.required && m.status === "open") m.status = "resolved";
    }
    advanceTime(s, 1);

    if (s.seasonNumber === targetElectionSeason && isCampaignActive(s)) {
      campaignTriggered = true;
      if (!campaigned) {
        campaigned = true;
        s.empire.personal = Math.max(s.empire.personal, 150_000_000);
        for (const club of s.politics.clubs) {
          visitClub(s, club.clubId);
          makeCampaignPromise(s, club.clubId, club.demandId);
          donateToClub(s, club.clubId, 2_000_000);
        }
        for (const bloc of ["big", "regional", "small"]) {
          holdConference(s, bloc);
        }
        fundCampaign(s, 20_000_000);
        debate(s, s.politics.candidates[0].id, "policy");
      }
    }
  }

  assert.equal(campaignTriggered, true, "الحملة انطلقت تلقائيًا في موسم الانتخابات");
  assert.equal(
    s.seasonNumber,
    targetElectionSeason + 1,
    "وصلت المحاكاة إلى ما بعد موسم الانتخابات",
  );
  assert.equal(s.politics.office.held, true, "فاز المالك برئاسة الاتحاد");
  assert.equal(s.politics.office.termsServed, 1);
  assert.equal(
    s.politics.election.season,
    targetElectionSeason + 4,
    "جدولت الانتخابات القادمة بعد 4 مواسم",
  );
  assert.ok(s.politics.election.lastResult?.won);

  const fb = electionFeedback(s);
  assert.equal(fb.lastElection.won, true);
  assert.ok(
    fb.promises.pending > 0,
    "وعود الحملة انتقلت إلى الولاية الرئاسية دون كسر مبكر",
  );
  validateSave(s);
});

