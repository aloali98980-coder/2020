// معالج الانتخابات 0.51 — جلسة «السياسة والصلاحيات» الدفعة 2.
// يبسّط الطريق إلى أربع خطوات (ترشح ← حملة ← تصويت ← فوز) ويجيب على سؤالين
// بالحساب لا بالكلام: **محتاج كام؟** و**منين؟** — بقراءة النموذج الانتخابي
// القائم نفسه (voteScores) وسجل التبرعات، دون أي حالة جديدة.
import {
  CONFERENCE_COST,
  VISIT_COST,
  campaignStatus,
  electionForecast,
} from "./campaign.js";
import {
  donationAvailable,
  donationPlanForSupport,
  donationSummary,
} from "./donations.js";
import { ensurePolitics } from "./state.js";
import { POLITICAL_BLOCS } from "../../data/politicsCatalog.js";

// حدود النظام المعلنة: تمويل الحملة المتراكم، وحد التبرع الواحد.
export const RECOMMENDED_FUNDING = 15_000_000;
export const CAMPAIGN_FUND_CEILING = 100_000_000;
// أثر كل أداة حملة على تأييد النادي (نفس أرقام المحرك، معلنة هنا).
export const ACTION_GAIN = { visit: 9, promise: 7, conference: 3 };
export const CONFERENCE_MAX_PER_BLOC = 3;

/** الخطوات الأربع للطريق الرئاسي: ترشح ← حملة ← تصويت ← فوز. */
export function presidencySteps(s) {
  const p = ensurePolitics(s);
  const status = campaignStatus(s);
  const eligible = p.campaign.playerEligible !== false;
  const active = Boolean(p.campaign.active);
  const held = Boolean(p.office.held);
  const lastResult = p.election.lastResult;
  const days = status.daysToElection ?? null;
  const inFinalStretch = active && days !== null && days <= 30;
  const states = {
    run: !eligible
      ? "blocked"
      : held || active || lastResult
        ? "done"
        : "current",
    campaign: active
      ? inFinalStretch
        ? "done"
        : "current"
      : held || lastResult
        ? "done"
        : "next",
    vote: held
      ? "done"
      : inFinalStretch
        ? "current"
        : lastResult
          ? "done"
          : "next",
    win: held ? "current" : "next",
  };
  const detail = {
    run: eligible ? (lastResult ? "contested" : "eligible") : "term-limit",
    campaign: active ? "active" : lastResult ? "archived" : "waiting",
    vote: inFinalStretch
      ? "soon"
      : lastResult
        ? lastResult.won
          ? "won"
          : "lost"
        : "scheduled",
    win: held ? "in-office" : "not-yet",
  };
  return ["run", "campaign", "vote", "win"].map((id) => ({
    id,
    state: states[id],
    detail: detail[id],
  }));
}

// خطة قلب الأصوات: أدوات الحملة الأرخص أولًا (زيارة + وعد + مؤتمرات التكتل حتى
// سقفها)، ثم التبرعات العلنية تغطي الفرق المتبقي في نقاط التأييد.
function swingPlan(s, p, forecast) {
  const conferencesByBloc = new Map();
  for (const conference of p.campaign.conferences)
    conferencesByBloc.set(
      conference.bloc,
      (conferencesByBloc.get(conference.bloc) || 0) + 1,
    );
  const clubs = [];
  let weight = 0;
  let campaignCost = 0;
  let donationCost = 0;
  let donationCount = 0;
  let supportPoints = 0;
  for (const row of forecast.swing) {
    if (weight >= forecast.neededWeight) break;
    const visited = p.campaign.visits.some((v) => v.clubId === row.clubId);
    const promised = p.campaign.promises.some((x) => x.clubId === row.clubId);
    const held = conferencesByBloc.get(row.bloc) || 0;
    const room = Math.max(0, CONFERENCE_MAX_PER_BLOC - held);
    const base =
      (visited ? 0 : ACTION_GAIN.visit) + (promised ? 0 : ACTION_GAIN.promise);
    const conferences = Math.min(
      room,
      Math.ceil(Math.max(0, row.neededSupport - base) / ACTION_GAIN.conference),
    );
    conferencesByBloc.set(row.bloc, held + conferences);
    const gained = base + conferences * ACTION_GAIN.conference;
    const residual = Math.max(
      0,
      Math.round((row.neededSupport - gained) * 10) / 10,
    );
    const donations = donationPlanForSupport(row.support + gained, residual);
    const cost = (visited ? 0 : VISIT_COST) + conferences * CONFERENCE_COST;
    campaignCost += cost;
    donationCost += donations.amount;
    donationCount += donations.count;
    supportPoints = Math.round((supportPoints + gained + residual) * 10) / 10;
    clubs.push({
      clubId: row.clubId,
      bloc: row.bloc,
      weight: row.weight,
      support: row.support,
      neededSupport: row.neededSupport,
      visit: !visited,
      promise: !promised,
      conferences,
      gained,
      residual,
      donations: donations.count,
      donation: donations.amount,
      cost,
      reachable: donated(row.support + gained, residual, donations),
      supportAfter: donations.supportAfter,
    });
    weight += row.weight;
  }
  return {
    clubs,
    weight,
    campaignCost,
    donationCost,
    donationCount,
    supportPoints,
    total: campaignCost + donationCost,
  };
}

const donated = (support, residual, plan) =>
  residual <= 0 ? true : plan.reached && plan.supportAfter > support;

/** الأرقام الكاملة للمعالج: التكلفة، قلب الأصوات، المصادر، والشيك ليست. */
export function presidencyWizard(s) {
  const p = ensurePolitics(s);
  const forecast = electionForecast(s);
  const donations = donationSummary(s);
  const plan = swingPlan(s, p, forecast);
  const blocs = Object.keys(POLITICAL_BLOCS).length;
  const fundingLeft = Math.max(0, CAMPAIGN_FUND_CEILING - p.campaign.funds);
  const recommendedFunding = Math.min(RECOMMENDED_FUNDING, fundingLeft);
  const available = donationAvailable(s);
  const required = plan.total + recommendedFunding;
  const conferencesDone = new Set(
    p.campaign.conferences.map((item) => item.bloc),
  ).size;
  return {
    forecast,
    plan,
    season: p.election.season,
    eligible: p.campaign.playerEligible !== false,
    active: Boolean(p.campaign.active),
    office: Boolean(p.office.held),
    termsServed: p.office.termsServed,
    termLimit: p.council.constitution.termLimit,
    neededWeight: forecast.neededWeight,
    neededShare:
      Math.round(
        (forecast.majorityWeight / Math.max(1, forecast.totalWeight)) * 1000,
      ) / 10,
    costs: {
      visit: VISIT_COST,
      conference: CONFERENCE_COST,
      recommendedFunding,
      visitingClubs: plan.clubs.filter((club) => club.visit).length,
      conferencesPlanned: plan.clubs.reduce(
        (sum, club) => sum + club.conferences,
        0,
      ),
    },
    required,
    available,
    donations,
    sources: {
      personal: available,
      campaignFunds: p.campaign.funds,
      campaignFundsLeft: fundingLeft,
      donationsTotal: donations.total,
      donationClubs: donations.clubs,
    },
    checklist: {
      eligible: p.campaign.playerEligible !== false,
      visits: { done: p.campaign.visits.length, total: p.clubs.length },
      conferences: { done: conferencesDone, total: blocs },
      promises: p.campaign.promises.length,
      funding: p.campaign.funds,
      debate: Boolean(p.campaign.debate),
    },
    shortfall: Math.max(0, required - available),
    surplus: Math.max(0, available - required),
  };
}
