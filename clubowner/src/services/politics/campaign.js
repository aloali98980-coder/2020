import { clamp, daysBetween } from "../../core/utils.js";
import {
  POLITICAL_CAMPAIGN_MAX_FUNDING,
  POLITICAL_CYCLE_SEASONS,
} from "../../data/politicsCatalog.js";
import { tr } from "../../i18n/index.js";
import { personalExpense } from "../empire/wealth.js";
import { message } from "../inbox.js";
import { recordLegacyDeparture } from "./legacy.js";
import {
  adjustClubSupport,
  candidateById,
  changeCandidateRelationship,
  demandDefinition,
  ensurePolitics,
  formAlliance,
} from "./state.js";

const VISIT_COST = 180_000;
const CONFERENCE_COST = 650_000;
const clampScore = (value) => clamp(Math.round(value * 10) / 10, 0, 100);
const monthKey = (date) => date.slice(0, 7);
const fnv = (value) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++)
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
};

export function isCampaignActive(s) {
  return Boolean(ensurePolitics(s).campaign.active);
}

function requireCampaign(s) {
  const p = ensurePolitics(s);
  if (!p.campaign.active || p.campaign.completed)
    throw new Error(
      tr(
        "الحملة الانتخابية ليست مفتوحة الآن.",
        "The election campaign is not open.",
        "La campagne électorale n’est pas ouverte.",
      ),
    );
  if (p.campaign.playerEligible === false)
    throw new Error(
      tr(
        "يمنعك التعديل الدستوري من الترشح لهذه الانتخابات.",
        "A constitutional term limit bars you from this election.",
        "Une limite constitutionnelle de mandats vous interdit cette élection.",
      ),
    );
  return p;
}

function payCampaign(s, amount, key) {
  if (!Number.isSafeInteger(amount) || amount <= 0)
    throw new Error(
      tr(
        "قيمة الإنفاق الانتخابي غير صالحة.",
        "Invalid campaign expense.",
        "Dépense de campagne invalide.",
      ),
    );
  if (!s.empire || s.empire.personal < amount)
    throw new Error(
      tr(
        "الثروة الشخصية لا تكفي لهذا النشاط.",
        "Personal wealth is insufficient for this activity.",
        "Votre fortune personnelle ne suffit pas pour cette activité.",
      ),
    );
  personalExpense(s, amount);
  const campaign = ensurePolitics(s).campaign;
  campaign.financing.push({ date: s.date, amount, key });
  if (campaign.financing.length > 120)
    campaign.financing.splice(0, campaign.financing.length - 120);
}

function clubCampaignBonus(p, clubId) {
  const campaign = p.campaign;
  const visit = campaign.visits.some((item) => item.clubId === clubId) ? 6 : 0;
  const promise = campaign.promises.some(
    (item) => item.clubId === clubId && item.status !== "broken",
  )
    ? 4
    : 0;
  const conference = campaign.conferences.filter(
    (item) =>
      item.bloc === p.clubs.find((club) => club.clubId === clubId)?.bloc,
  ).length;
  return visit + promise + Math.min(9, conference * 3);
}

function rivalScore(p, candidate, club) {
  if (candidate.withdrawn || candidate.endorsedPlayer) return 0;
  const affinity = candidate.blocAffinity?.[club.bloc] || 0;
  const relationship = (candidate.relationship || 0) * 0.08;
  const competence = (candidate.competence - 60) * 0.08;
  const corruptionPenalty = Math.max(0, candidate.corruption - 55) * 0.12;
  const momentum = clamp(candidate.momentum || 0, -10, 15) * 0.35;
  const scandalPenalty =
    p.integrity.score < 45 && candidate.traits.includes("corrupt") ? 4 : 0;
  return Math.max(
    5,
    13 +
      candidate.popularity * 0.42 +
      affinity +
      relationship +
      competence -
      corruptionPenalty +
      momentum -
      scandalPenalty,
  );
}

export function voteScores(s, clubId) {
  const p = ensurePolitics(s);
  const club = p.clubs.find((row) => row.clubId === clubId);
  if (!club)
    throw new Error(
      tr(
        "النادي غير موجود في خريطة الاتحاد.",
        "That club is not on the association map.",
        "Ce club ne figure pas sur la carte de la fédération.",
      ),
    );
  const funding = Math.min(12, Math.floor(p.campaign.funds / 5_000_000) * 2);
  const reputation = (Number(s.reputation || 50) - 50) * 0.07;
  const legitimacy = (p.legitimacy - 50) * 0.04;
  const incumbent = p.office.held ? 8 : 0;
  const player = Math.max(
    1,
    13 +
      club.support * 0.47 +
      clubCampaignBonus(p, clubId) +
      funding +
      reputation +
      legitimacy +
      incumbent,
  );
  const candidates = p.candidates
    .map((candidate) => ({
      candidateId: candidate.id,
      score: rivalScore(p, candidate, club),
    }))
    .filter((item) => item.score > 0);
  return [
    ...(p.campaign.playerEligible === false
      ? []
      : [{ candidateId: "player", score: player }]),
    ...candidates,
  ];
}

function estimatedPoll(s) {
  const p = ensurePolitics(s);
  const votes = Object.fromEntries([
    ["player", 0],
    ...p.candidates.map((candidate) => [candidate.id, 0]),
  ]);
  let total = 0;
  for (const club of p.clubs) {
    const scores = voteScores(s, club.clubId);
    const sum = scores.reduce((n, item) => n + item.score, 0) || 1;
    for (const item of scores)
      votes[item.candidateId] += (item.score / sum) * club.voteWeight;
    total += club.voteWeight;
  }
  const shares = Object.fromEntries(
    Object.entries(votes).map(([id, count]) => [
      id,
      Math.round((count / Math.max(1, total)) * 1000) / 10,
    ]),
  );
  return {
    date: s.date,
    season: p.election.season,
    votes: Object.fromEntries(
      Object.entries(votes).map(([id, count]) => [
        id,
        Math.round(count * 10) / 10,
      ]),
    ),
    shares,
    totalWeight: total,
  };
}

export function recordMonthlyPoll(s) {
  const p = ensurePolitics(s);
  if (!p.campaign.active) return null;
  const month = monthKey(s.date);
  if (p.campaign.lastPollMonth === month)
    return p.campaign.polls.at(-1) || null;
  const poll = estimatedPoll(s);
  p.campaign.lastPollMonth = month;
  p.campaign.polls.push(poll);
  if (p.campaign.polls.length > 24)
    p.campaign.polls.splice(0, p.campaign.polls.length - 24);
  return poll;
}

export function startElectionCampaign(s) {
  const p = ensurePolitics(s);
  if (p.election.status !== "scheduled" || s.seasonNumber < p.election.season)
    return false;
  if (p.election.season < s.seasonNumber) p.election.season = s.seasonNumber;
  p.election.status = "campaigning";
  p.campaign.active = true;
  p.campaign.completed = false;
  const termLimit = p.council.constitution.termLimit;
  p.campaign.playerEligible =
    termLimit === null || p.office.termsServed < termLimit;
  p.campaign.season = p.election.season;
  p.campaign.startDate = s.date;
  p.campaign.endDate = s.nextSeasonDate;
  p.campaign.lastPollMonth = "";
  p.campaign.lastActionMonth = "";
  p.campaign.visits = [];
  p.campaign.conferences = [];
  p.campaign.promises = [];
  p.campaign.polls = [];
  p.campaign.financing = [];
  p.campaign.funds = 0;
  p.campaign.debate = null;
  for (const candidate of p.candidates) {
    candidate.withdrawn = false;
    candidate.endorsedPlayer = false;
    candidate.momentum = 0;
    candidate.campaignActions = 0;
  }
  message(s, {
    title: tr(
      "انطلقت الحملة لرئاسة الاتحاد",
      "The football association campaign is under way",
      "La campagne pour la présidence de la fédération est lancée",
    ),
    body: tr(
      "بدأ موسم انتخابي كامل. تحرّك بين الأندية، سجّل وعودًا قابلة للمحاسبة، موّل حملتك من ثروتك الشخصية، وتابع استطلاعًا شهريًا.",
      "A full election-season campaign has begun. Visit clubs, make accountable promises, fund your campaign from personal wealth, and follow monthly polls.",
      "Une campagne électorale complète commence. Visitez les clubs, prenez des engagements vérifiables, financez votre campagne avec votre fortune personnelle et suivez les sondages mensuels.",
    ),
    category: "politics",
    kind: "presidential-campaign",
  });
  recordMonthlyPoll(s);
  return true;
}

export function visitClub(s, clubId) {
  const p = requireCampaign(s);
  const club = p.clubs.find((row) => row.clubId === clubId);
  if (!club)
    throw new Error(
      tr(
        "النادي غير موجود في خريطة الاتحاد.",
        "That club is not on the association map.",
        "Ce club ne figure pas sur la carte de la fédération.",
      ),
    );
  if (p.campaign.visits.some((visit) => visit.clubId === clubId))
    throw new Error(
      tr(
        "زرت هذا النادي بالفعل خلال الحملة.",
        "You have already visited this club during the campaign.",
        "Vous avez déjà visité ce club pendant la campagne.",
      ),
    );
  payCampaign(s, VISIT_COST, `visit:${clubId}`);
  p.campaign.visits.push({ clubId, date: s.date, cost: VISIT_COST });
  adjustClubSupport(s, clubId, 9, "campaign-visit");
  p.legitimacy = clamp(p.legitimacy + 0.5, 0, 100);
  return club;
}

export function holdConference(s, bloc) {
  const p = requireCampaign(s);
  if (!Object.hasOwn({ big: 1, regional: 1, small: 1 }, bloc))
    throw new Error(
      tr(
        "تكتل سياسي غير معروف.",
        "Unknown political bloc.",
        "Bloc politique inconnu.",
      ),
    );
  const key = `${monthKey(s.date)}:${bloc}`;
  if (p.campaign.conferences.some((item) => item.key === key))
    throw new Error(
      tr(
        "عقدت مؤتمرًا لهذا التكتل هذا الشهر.",
        "You already held a conference for this bloc this month.",
        "Vous avez déjà tenu une conférence pour ce bloc ce mois-ci.",
      ),
    );
  payCampaign(s, CONFERENCE_COST, `conference:${key}`);
  const attendees = p.clubs.filter((club) => club.bloc === bloc);
  for (const club of attendees)
    adjustClubSupport(s, club.clubId, 3, "campaign-conference");
  p.campaign.conferences.push({
    bloc,
    date: s.date,
    key,
    cost: CONFERENCE_COST,
    attendees: attendees.length,
  });
  return attendees.length;
}

export function makeCampaignPromise(s, clubId, demandId) {
  const p = requireCampaign(s);
  const club = p.clubs.find((row) => row.clubId === clubId);
  const demand = demandDefinition(demandId);
  if (!club || !demand || !club.demands.includes(demandId))
    throw new Error(
      tr(
        "المطلب الخاص بهذا النادي غير صالح.",
        "That is not a valid demand for this club.",
        "Cette demande ne correspond pas à ce club.",
      ),
    );
  if (
    p.campaign.promises.some(
      (promise) => promise.clubId === clubId && promise.demandId === demandId,
    )
  )
    throw new Error(
      tr(
        "سجّلت هذا الوعد لهذا النادي بالفعل.",
        "You have already made this promise to the club.",
        "Vous avez déjà pris cet engagement auprès du club.",
      ),
    );
  const promise = {
    id: `promise-${(s.nextId = (s.nextId || 0) + 1)}`,
    clubId,
    demandId,
    lawId: demand.lawId,
    madeDate: s.date,
    dueSeason: p.election.season,
    status: "pending",
    fulfilledDate: null,
    consequence: null,
  };
  p.campaign.promises.push(promise);
  adjustClubSupport(s, clubId, 7, "campaign-promise");
  return promise;
}

export function fundCampaign(s, amount) {
  const p = requireCampaign(s);
  if (
    !Number.isSafeInteger(amount) ||
    amount < 1_000_000 ||
    amount > 25_000_000
  )
    throw new Error(
      tr(
        "يجب أن يكون التمويل بين مليون و٢٥ مليونًا.",
        "Funding must be between one million and 25 million.",
        "Le financement doit être compris entre un et 25 millions.",
      ),
    );
  if (p.campaign.funds + amount > POLITICAL_CAMPAIGN_MAX_FUNDING)
    throw new Error(
      tr(
        "بلغ تمويل الحملة سقفه المعلن.",
        "The campaign has reached its declared funding cap.",
        "La campagne a atteint son plafond de financement déclaré.",
      ),
    );
  payCampaign(s, amount, `fund:${s.date}:${p.campaign.funds + amount}`);
  p.campaign.funds += amount;
  return p.campaign.funds;
}

export function debate(s, rivalId, strategy = "policy") {
  const p = requireCampaign(s);
  const rival = candidateById(s, rivalId);
  if (!rival || rival.withdrawn || rival.endorsedPlayer)
    throw new Error(
      tr(
        "المنافس غير متاح للمناظرة.",
        "That rival is not available for the debate.",
        "Cet adversaire n’est pas disponible pour le débat.",
      ),
    );
  if (p.campaign.debate)
    throw new Error(
      tr(
        "أُجريت المناظرة العلنية لهذا الموسم.",
        "This season’s public debate has already been held.",
        "Le débat public de cette saison a déjà eu lieu.",
      ),
    );
  if (!["policy", "attack", "unity"].includes(strategy))
    throw new Error(
      tr(
        "خطة المناظرة غير معروفة.",
        "Unknown debate strategy.",
        "Stratégie de débat inconnue.",
      ),
    );
  const policyBonus =
    strategy === "policy" ? Math.min(12, p.campaign.promises.length * 2) : 0;
  const attackBonus =
    strategy === "attack" && rival.corruption >= 55
      ? 12
      : strategy === "attack"
        ? -5
        : 0;
  const unityBonus =
    strategy === "unity" && p.alliances.length
      ? 9
      : strategy === "unity"
        ? -3
        : 0;
  const playerSkill =
    s.reputation * 0.42 +
    p.integrity.score * 0.25 +
    p.legitimacy * 0.15 +
    (p.office.held ? 5 : 0) +
    policyBonus +
    attackBonus +
    unityBonus;
  const rivalSkill =
    rival.popularity * 0.38 +
    rival.competence * 0.42 +
    (rival.traits.includes("charismatic") ? 7 : 0) -
    rival.corruption * 0.08;
  const noise = (fnv(`${s.seed}:${s.date}:${rivalId}`) % 25) - 12;
  const margin = Math.round((playerSkill - rivalSkill + noise) * 10) / 10;
  const result = margin >= 11 ? "strong" : margin >= -3 ? "close" : "disaster";
  const supportDelta = result === "strong" ? 5 : result === "close" ? 2 : -5;
  for (const club of p.clubs)
    adjustClubSupport(s, club.clubId, supportDelta, `debate-${result}`);
  if (strategy === "attack")
    changeCandidateRelationship(s, rivalId, -8, "public-debate-attack");
  const record = {
    date: s.date,
    rivalId,
    strategy,
    margin,
    result,
    supportDelta,
  };
  p.campaign.debate = record;
  rival.momentum = clamp(
    rival.momentum + (result === "disaster" ? 6 : -3),
    -10,
    15,
  );
  if (result === "disaster") p.legitimacy = clamp(p.legitimacy - 5, 0, 100);
  return record;
}

export function offerCandidateAlliance(s, candidateId) {
  const p = requireCampaign(s);
  const candidate = candidateById(s, candidateId);
  if (!candidate || candidate.withdrawn || candidate.endorsedPlayer)
    throw new Error(
      tr(
        "المنافس غير متاح للتحالف.",
        "That rival is not available for an alliance.",
        "Cet adversaire n’est pas disponible pour une alliance.",
      ),
    );
  const trust =
    candidate.relationship +
    (candidate.traits.includes("reformer") ? 7 : 0) +
    (p.integrity.score - 50) * 0.08 +
    (p.campaign.promises.length ? 4 : 0);
  if (trust < 6) {
    changeCandidateRelationship(s, candidateId, 4, "alliance-talks");
    candidate.lastAllianceOffer = { date: s.date, accepted: false };
    return { accepted: false, candidateId };
  }
  candidate.withdrawn = true;
  candidate.endorsedPlayer = true;
  candidate.lastAllianceOffer = { date: s.date, accepted: true };
  candidate.relationship = clamp(candidate.relationship + 18, -100, 100);
  const supported = p.clubs.filter(
    (club) => (candidate.blocAffinity[club.bloc] || 0) >= 8,
  );
  for (const club of supported)
    adjustClubSupport(s, club.clubId, 5, "candidate-endorsement");
  const clubIds = supported.map((club) => club.clubId);
  if (clubIds.length >= 2) {
    const bloc = supported[0].bloc;
    const sameBloc = supported
      .filter((club) => club.bloc === bloc)
      .map((club) => club.clubId);
    if (sameBloc.length >= 2) {
      const alliance = formAlliance(s, sameBloc, candidate.party.ar);
      alliance.candidateId = candidateId;
    }
  }
  p.legitimacy = clamp(p.legitimacy + 2, 0, 100);
  return { accepted: true, candidateId, clubs: supported.length };
}

function rivalMonthlyCampaign(s, p, month) {
  const active = p.candidates.filter(
    (candidate) => !candidate.withdrawn && !candidate.endorsedPlayer,
  );
  if (!active.length || !p.clubs.length) return;
  for (const candidate of active) {
    const offset =
      (Number(month.slice(5, 7)) + candidate.campaignActions) % p.clubs.length;
    const target = p.clubs
      .slice()
      .sort(
        (a, b) => a.support - b.support || a.clubId.localeCompare(b.clubId),
      )[offset];
    if (target)
      adjustClubSupport(s, target.clubId, -0.7, `ai-campaign:${candidate.id}`);
    candidate.campaignActions++;
    candidate.momentum = clamp(
      candidate.momentum +
        (candidate.traits.includes("competent") ? 0.7 : 0.35),
      -10,
      15,
    );
    candidate.lastAction = month;
    if (candidate.traits.includes("popular"))
      candidate.popularity = clampScore(candidate.popularity + 0.15);
    if (candidate.corruption > 60 && p.integrity.score < 50)
      candidate.popularity = clampScore(candidate.popularity - 0.6);
    candidate.relationship = clamp(candidate.relationship - 0.2, -100, 100);
  }
}

export function campaignMonthlyTick(s) {
  const p = ensurePolitics(s);
  startElectionCampaign(s);
  if (!p.campaign.active) return null;
  const month = monthKey(s.date);
  if (p.campaign.lastPollMonth !== month) {
    if (p.campaign.lastActionMonth !== month) {
      rivalMonthlyCampaign(s, p, month);
      p.campaign.lastActionMonth = month;
    }
    return recordMonthlyPoll(s);
  }
  return p.campaign.polls.at(-1) || null;
}

function ballotWinner(s, club, scores) {
  const total = scores.reduce((sum, item) => sum + item.score, 0) || 1;
  let pick =
    ((fnv(`${s.seed}:${s.politics.election.season}:${club.clubId}`) %
      1_000_000) /
      1_000_000) *
    total;
  for (const item of scores) {
    pick -= item.score;
    if (pick < 0) return item.candidateId;
  }
  return scores.at(-1)?.candidateId || "player";
}

export function conductElection(s) {
  const p = ensurePolitics(s);
  if (!p.campaign.active) startElectionCampaign(s);
  if (!p.campaign.active)
    throw new Error(
      tr(
        "لا توجد حملة انتخابية جاهزة للتصويت.",
        "No election campaign is ready for voting.",
        "Aucune campagne électorale n’est prête pour le vote.",
      ),
    );
  const weightedVotes = Object.fromEntries([
    ["player", 0],
    ...p.candidates.map((candidate) => [candidate.id, 0]),
  ]);
  const publicBallot = p.clubs.map((club) => {
    const candidateId = ballotWinner(s, club, voteScores(s, club.clubId));
    weightedVotes[candidateId] += club.voteWeight;
    return {
      clubId: club.clubId,
      candidateId,
      weight: club.voteWeight,
      bloc: club.bloc,
    };
  });
  const ranked = Object.entries(weightedVotes).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const winnerId = ranked[0]?.[0] || "player";
  const totalWeight = publicBallot.reduce(
    (sum, ballot) => sum + ballot.weight,
    0,
  );
  const playerVotes = weightedVotes.player || 0;
  const result = {
    season: p.election.season,
    date: s.date,
    winnerId,
    won: winnerId === "player",
    playerVotes,
    totalWeight,
    shares: Object.fromEntries(
      Object.entries(weightedVotes).map(([id, votes]) => [
        id,
        Math.round((votes / Math.max(1, totalWeight)) * 1000) / 10,
      ]),
    ),
    counts: weightedVotes,
    ballot: publicBallot,
  };
  p.election.lastResult = result;
  p.election.publicBallot = publicBallot;
  p.election.status = "complete";
  p.campaign.completed = true;
  p.campaign.active = false;
  const snapshot = structuredClone(p.campaign);
  p.campaignArchive = [...(p.campaignArchive || []), snapshot].slice(-8);
  p.history.unshift({ type: "election", ...result });
  p.history = p.history.slice(0, 40);
  if (result.won) {
    p.office.held = true;
    p.office.termsServed++;
    p.office.termStartSeason = p.election.season;
    p.office.termEndSeason = p.election.season + p.election.cycleSeasons;
    p.legitimacy = clamp(
      52 + (playerVotes / Math.max(1, totalWeight)) * 35,
      0,
      100,
    );
    message(s, {
      title: tr(
        "فزت برئاسة الاتحاد",
        "You have been elected association president",
        "Vous êtes élu à la présidence de la fédération",
      ),
      body: tr(
        "أُعلنت نتيجة التصويت العلني بالأسماء. تبدأ ولايتك الآن، وستُسجل القرارات والوعود في سجل الاتحاد.",
        "The named public ballot is certified. Your term begins now; decisions and promises will be recorded in the association ledger.",
        "Le scrutin nominatif public est certifié. Votre mandat commence ; décisions et engagements seront consignés au registre de la fédération.",
      ),
      category: "politics",
      kind: "election-result",
    });
  } else {
    p.office.held = false;
    p.office.lastDeparture = {
      date: s.date,
      season: p.election.season,
      reason: p.campaign.playerEligible ? "election-loss" : "term-limit",
    };
    p.legitimacy = clamp(p.legitimacy - 8, 0, 100);
    recordLegacyDeparture(s, p.office.lastDeparture.reason);
    message(s, {
      title: tr(
        "خسرت انتخابات الاتحاد",
        "You lost the association election",
        "Vous avez perdu l’élection de la fédération",
      ),
      body: tr(
        "تعود إلى ناديك بعد إعلان النتيجة. تبقى خريطة العلاقات والوعود وسجل التصويت محفوظة، ويمكنك الترشح في الدورة القادمة.",
        "You return to your club after the result. The relationship map, promises, and ballot remain on record; you may run again next cycle.",
        "Vous retournez à votre club après le résultat. Carte des relations, promesses et vote restent archivés ; vous pourrez vous représenter au prochain cycle.",
      ),
      category: "politics",
      kind: "election-result",
    });
  }
  p.election.season += p.election.cycleSeasons || POLITICAL_CYCLE_SEASONS;
  p.election.status = "scheduled";
  p.election.publicBallot = publicBallot;
  p.campaign = {
    active: false,
    playerEligible: true,
    season: null,
    startDate: null,
    endDate: null,
    lastPollMonth: "",
    lastActionMonth: "",
    visits: [],
    conferences: [],
    promises: [],
    polls: [],
    financing: [],
    funds: 0,
    debate: null,
    eventIds: [],
    completed: false,
  };
  return result;
}

/** Called at the end of the election season before the season counter advances. */
export function politicalSeasonEnd(s) {
  const p = ensurePolitics(s);
  if (
    p.election.status !== "campaigning" ||
    p.election.season !== s.seasonNumber
  )
    return null;
  for (const promise of p.campaign.promises) {
    if (promise.status === "pending") {
      promise.status = "broken";
      promise.consequence = "unfulfilled-at-election";
      const club = p.clubs.find((row) => row.clubId === promise.clubId);
      if (club)
        adjustClubSupport(s, club.clubId, -10, "broken-campaign-promise");
    }
  }
  return conductElection(s);
}

export function campaignTick(s) {
  const p = ensurePolitics(s);
  if (p.election.status === "scheduled" && s.seasonNumber >= p.election.season)
    startElectionCampaign(s);
  if (!p.campaign.active) return null;
  if (p.campaign.lastPollMonth !== monthKey(s.date))
    return campaignMonthlyTick(s);
  return null;
}

export function campaignStatus(s) {
  const p = ensurePolitics(s);
  const result = p.election.lastResult;
  return {
    active: p.campaign.active,
    electionSeason: p.election.season,
    electionStatus: p.election.status,
    termsServed: p.office.termsServed,
    president: p.office.held,
    lastResult: result,
    daysToElection: p.campaign.endDate
      ? Math.max(0, daysBetween(s.date, p.campaign.endDate))
      : null,
  };
}

export { VISIT_COST, CONFERENCE_COST };
