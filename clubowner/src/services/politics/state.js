import { extendedClub } from "../../data/expandedCatalog.js";
import {
  CLUB_DEMANDS,
  POLITICAL_CANDIDATES,
  POLITICAL_CYCLE_SEASONS,
  POLITICAL_DEMAND_BY_BLOC,
  POLITICAL_BLOCS,
} from "../../data/politicsCatalog.js";
import { tr } from "../../i18n/index.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const uniq = (values) => [...new Set(values)];

export function leagueClubIds(s) {
  const ids = (s.table || []).map((row) => row.clubId).filter(Boolean);
  return uniq(ids.length ? ids : [s.clubId]);
}

export function blocForClub(clubId, index = 0) {
  const club = extendedClub(clubId);
  const rep = Number(club?.rep ?? club?.overall ?? 55);
  const city = String(club?.city || "").toLowerCase();
  const capital = /cairo|القاهرة|giza|الجيزة/.test(city);
  if (
    rep >= 77 ||
    [
      "ahly",
      "zamalek",
      "pyramids",
      "liverpool",
      "real-madrid",
      "barcelona",
    ].includes(clubId)
  )
    return "big";
  if (capital || rep < 64 || (club?.tier || 1) > 1) return "small";
  if (!capital && rep >= 64) return "regional";
  return index % 3 === 1 ? "regional" : "small";
}

function clubRecord(clubId, index) {
  const club = extendedClub(clubId);
  const bloc = blocForClub(clubId, index);
  const demandIds = POLITICAL_DEMAND_BY_BLOC[bloc] || ["equitableBroadcast"];
  const demandId = demandIds[index % demandIds.length];
  return {
    clubId,
    bloc,
    support: 50,
    voteWeight: bloc === "big" ? 3 : bloc === "regional" ? 2 : 1,
    demandId,
    demands: demandIds.slice(0, 3),
    allianceId: null,
    lastChange: 0,
    lastReason: "neutral-start",
    popularity: clamp(Number(club?.rep ?? club?.overall ?? 55), 20, 100),
  };
}

function candidateState(base) {
  return {
    ...base,
    name: { ...base.name },
    party: { ...base.party },
    profile: { ...base.profile },
    biography: { ...base.biography },
    traits: [...base.traits],
    blocAffinity: { ...base.blocAffinity },
    momentum: 0,
    withdrawn: false,
    endorsedPlayer: false,
    campaignActions: 0,
    lastAction: null,
  };
}

function blankCampaign() {
  return {
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
}

function initialPolitics(s, legacy) {
  const nextElectionSeason = Math.max(
    1,
    (s.seasonNumber || 1) + (legacy ? 1 : POLITICAL_CYCLE_SEASONS),
  );
  return {
    schema: 1,
    mapRevision: 1,
    clubs: leagueClubIds(s).map(clubRecord),
    alliances: [],
    candidates: POLITICAL_CANDIDATES.map(candidateState),
    office: {
      held: false,
      termsServed: 0,
      termStartSeason: null,
      termEndSeason: null,
      seatBody: null,
      immunityUntil: null,
      lastDeparture: null,
    },
    election: {
      cycleSeasons: POLITICAL_CYCLE_SEASONS,
      season: nextElectionSeason,
      status: "scheduled",
      lastResult: null,
      publicBallot: [],
    },
    campaign: blankCampaign(),
    campaignArchive: [],
    legitimacy: 65,
    integrity: {
      score: 100,
      cleanActions: 0,
      illicitActions: 0,
      investigations: [],
      lastAudit: null,
      exposed: false,
      pendingBribes: [],
      assetDeclarations: [],
      actions: [],
      reviewedEvidenceIds: [],
      lastReviewMonth: "",
    },
    council: {
      members: leagueClubIds(s),
      appointedSeats: 2,
      currentBill: null,
      laws: {},
      history: [],
      blacklist: [],
      voteLog: [],
      constitution: {
        amendments: [],
        termLimit: null,
        supermajorityThreshold: 67,
      },
    },
    finance: {
      balance: 150_000_000,
      initialBalance: 150_000_000,
      ledgerOpeningBalance: 150_000_000,
      ledgerRevision: 0,
      tvPool: 60_000_000,
      broadcastRevenue: 60_000_000,
      youthGrantPerSeason: 0,
      solidarityPerSeason: 0,
      publicDisclosure: false,
      auditMandate: false,
      distributionFormula: { performance: 40, popularity: 30, equality: 30 },
      clubAccounts: Object.fromEntries(
        leagueClubIds(s).map((clubId) => [
          clubId,
          { balance: 0, totalReceived: 0, totalGrants: 0 },
        ]),
      ),
      funds: [],
      distributions: [],
      ledger: [],
      audits: [],
      lastDistributionSeason: null,
      lastAuditSeason: null,
    },
    committees: {
      lastMonth: "",
      history: [],
      chairHistory: [],
      referees: {
        chairId: null,
        policy: "balanced",
        morale: 68,
        strikes: 0,
        suspensions: [],
        scandals: [],
        favoredClubId: null,
        biasUntil: null,
        competence: 0,
        integrity: 0,
        appointedDate: null,
        policyChangedDate: null,
      },
      discipline: {
        chairId: null,
        strictness: "standard",
        cases: [],
        appeals: [],
        competence: 0,
        integrity: 0,
        appointedDate: null,
        policyChangedDate: null,
      },
      competitions: {
        chairId: null,
        calendar: "standard",
        favoritism: 0,
        scandals: [],
        tournaments: [],
        history: [],
        competence: 0,
        integrity: 0,
        appointedDate: null,
        policyChangedDate: null,
      },
    },
    opposition: {
      pressure: 0,
      motions: [],
      conspiracies: [],
      investigations: [],
      lastActionMonth: "",
      lastResponseMonth: "",
      noConfidence: {
        counter: 0,
        threshold: 100,
        votes: null,
        status: "quiet",
        lastVoteDate: null,
      },
    },
    foreign: {
      relations: { CAF: 52, FIFA: 46, UEFA: 42, AFC: 42, CONCACAF: 40 },
      hostingBids: [],
      executiveSeat: null,
      influence: 0,
      missions: [],
      history: [],
      lastMissionByOrg: {},
      lastReviewMonth: "",
    },
    legacy: {
      title: null,
      departures: [],
      trial: {
        status: "none",
        charges: [],
        verdict: null,
        recordId: null,
        openedDate: null,
        evidenceScore: 0,
        response: null,
      },
      honours: [],
    },
    eventState: {
      pending: null,
      history: [],
      cooldowns: {},
      lastMonth: "",
    },
    history: [],
    migration: legacy ? "legacy-neutral" : "new-career",
  };
}

function upgradePoliticsContainers(s) {
  const p = s.politics;
  const defaults = initialPolitics(s);
  p.council = { ...defaults.council, ...(p.council || {}) };
  p.council.constitution = {
    ...defaults.council.constitution,
    ...(p.council.constitution || {}),
  };
  for (const key of ["laws", "history", "blacklist", "voteLog"])
    if (!p.council[key]) p.council[key] = defaults.council[key];
  p.campaign ||= defaults.campaign;
  p.campaign.playerEligible ??= true;
  p.integrity = { ...defaults.integrity, ...(p.integrity || {}) };
  for (const key of [
    "investigations",
    "pendingBribes",
    "assetDeclarations",
    "actions",
    "reviewedEvidenceIds",
  ])
    if (!Array.isArray(p.integrity[key])) p.integrity[key] = [];
  p.integrity.lastReviewMonth ||= "";
  p.opposition = { ...defaults.opposition, ...(p.opposition || {}) };
  p.opposition.noConfidence = {
    ...defaults.opposition.noConfidence,
    ...(p.opposition.noConfidence || {}),
  };
  for (const key of ["motions", "conspiracies", "investigations"])
    if (!Array.isArray(p.opposition[key])) p.opposition[key] = [];
  p.opposition.lastActionMonth ||= "";
  p.opposition.lastResponseMonth ||= "";
  p.foreign = { ...defaults.foreign, ...(p.foreign || {}) };
  p.foreign.relations = {
    ...defaults.foreign.relations,
    ...(p.foreign.relations || {}),
  };
  for (const key of ["hostingBids", "missions", "history"])
    if (!Array.isArray(p.foreign[key])) p.foreign[key] = [];
  p.foreign.lastMissionByOrg ||= {};
  p.foreign.lastReviewMonth ||= "";
  p.legacy = { ...defaults.legacy, ...(p.legacy || {}) };
  p.legacy.trial = { ...defaults.legacy.trial, ...(p.legacy.trial || {}) };
  for (const key of ["departures", "honours"])
    if (!Array.isArray(p.legacy[key])) p.legacy[key] = [];
  p.eventState = { ...defaults.eventState, ...(p.eventState || {}) };
  if (!Array.isArray(p.eventState.history)) p.eventState.history = [];
  if (!p.eventState.cooldowns || typeof p.eventState.cooldowns !== "object")
    p.eventState.cooldowns = {};
  p.eventState.pending ??= null;
  p.eventState.lastMonth ||= "";
  p.committees = { ...defaults.committees, ...(p.committees || {}) };
  for (const committeeId of ["referees", "discipline", "competitions"])
    p.committees[committeeId] = {
      ...defaults.committees[committeeId],
      ...(p.committees[committeeId] || {}),
    };
  for (const key of ["history", "chairHistory"])
    if (!Array.isArray(p.committees[key])) p.committees[key] = [];
  for (const [committeeId, keys] of [
    ["referees", ["suspensions", "scandals"]],
    ["discipline", ["cases", "appeals"]],
    ["competitions", ["scandals", "tournaments", "history"]],
  ])
    for (const key of keys)
      if (!Array.isArray(p.committees[committeeId][key]))
        p.committees[committeeId][key] = [];
  p.committees.lastMonth ||= "";
  p.finance = { ...defaults.finance, ...(p.finance || {}) };
  p.finance.clubAccounts = {
    ...defaults.finance.clubAccounts,
    ...(p.finance.clubAccounts || {}),
  };
  p.finance.ledgerOpeningBalance ??= p.finance.initialBalance;
  p.finance.ledgerRevision ??= 0;
  for (const key of ["funds", "distributions", "ledger", "audits"])
    if (!p.finance[key]) p.finance[key] = defaults.finance[key];
  return p;
}

/** Initialize a neutral political world, or preserve and reconcile an existing one. */
export function initPolitics(s, { legacy = false } = {}) {
  if (!s.politics || s.politics.schema !== 1)
    s.politics = initialPolitics(s, legacy);
  else {
    upgradePoliticsContainers(s);
    reconcilePoliticalMap(s);
  }
  return s.politics;
}

export const ensurePolitics = (s) => {
  const p = s.politics;
  return p?.schema === 1 && p.council?.constitution && p.finance?.clubAccounts
    ? p
    : initPolitics(s);
};

/** Follow the current league table after promotion, relegation, or loading an old save. */
export function reconcilePoliticalMap(s) {
  const p = s.politics;
  if (!p || p.schema !== 1) return initPolitics(s);
  const active = leagueClubIds(s);
  const oldSignature = (p.clubs || [])
    .map((club) => `${club.clubId}:${club.bloc}:${club.voteWeight}`)
    .join("|");
  const existing = new Map((p.clubs || []).map((club) => [club.clubId, club]));
  const next = active.map((clubId, index) => {
    const old = existing.get(clubId);
    if (old) {
      old.bloc = blocForClub(clubId, index);
      old.voteWeight = old.bloc === "big" ? 3 : old.bloc === "regional" ? 2 : 1;
      old.support = clamp(Number(old.support ?? 50), 0, 100);
      old.demands =
        Array.isArray(old.demands) && old.demands.length
          ? old.demands.filter((id) => CLUB_DEMANDS[id])
          : [...(POLITICAL_DEMAND_BY_BLOC[old.bloc] || ["equitableBroadcast"])];
      old.demandId = old.demands.includes(old.demandId)
        ? old.demandId
        : old.demands[0];
      return old;
    }
    return clubRecord(clubId, index);
  });
  p.clubs = next;
  p.council ||= {};
  p.council.members = next.map((club) => club.clubId);
  p.finance ||= {};
  p.finance.clubAccounts ||= {};
  for (const club of next)
    p.finance.clubAccounts[club.clubId] ||= {
      balance: 0,
      totalReceived: 0,
      totalGrants: 0,
    };
  const known = new Set(active);
  for (const alliance of p.alliances || []) {
    alliance.clubIds = (alliance.clubIds || []).filter((id) => known.has(id));
    for (const club of p.clubs)
      club.allianceId =
        club.allianceId === alliance.id &&
        alliance.clubIds.includes(club.clubId)
          ? alliance.id
          : club.allianceId === alliance.id
            ? null
            : club.allianceId;
    alliance.cohesion = clamp(Number(alliance.cohesion || 0), 0, 100);
  }
  p.alliances = (p.alliances || []).filter(
    (alliance) => alliance.clubIds.length >= 2,
  );
  const newSignature = p.clubs
    .map((club) => `${club.clubId}:${club.bloc}:${club.voteWeight}`)
    .join("|");
  p.mapRevision =
    Math.max(1, Number(p.mapRevision || 1)) +
    (oldSignature === newSignature ? 0 : 1);
  return p;
}

export function politicalClub(s, clubId) {
  return ensurePolitics(s).clubs.find((club) => club.clubId === clubId) || null;
}

export function blocSummary(s) {
  const result = Object.fromEntries(
    Object.keys(POLITICAL_BLOCS).map((id) => [
      id,
      { id, label: POLITICAL_BLOCS[id], clubs: 0, weight: 0, support: 0 },
    ]),
  );
  for (const club of ensurePolitics(s).clubs) {
    const row = result[club.bloc];
    if (!row) continue;
    row.clubs++;
    row.weight += club.voteWeight;
    row.support += club.support * club.voteWeight;
  }
  for (const row of Object.values(result))
    row.support = row.weight ? Math.round(row.support / row.weight) : 0;
  return Object.values(result);
}

export function adjustClubSupport(
  s,
  clubId,
  delta,
  reason = "political-decision",
) {
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
  const before = club.support;
  club.support = clamp(Math.round((club.support + delta) * 10) / 10, 0, 100);
  club.lastChange = Number((club.support - before).toFixed(1));
  club.lastReason = String(reason).slice(0, 80);
  for (const alliance of p.alliances) {
    if (alliance.clubIds.includes(clubId)) {
      const members = p.clubs.filter((row) =>
        alliance.clubIds.includes(row.clubId),
      );
      alliance.cohesion = Math.round(
        members.reduce((sum, row) => sum + row.support, 0) /
          Math.max(1, members.length),
      );
    }
  }
  return club.support;
}

export function formAlliance(s, clubIds, name = "") {
  const p = ensurePolitics(s);
  const members = [...new Set(clubIds)].filter((clubId) =>
    p.clubs.some((club) => club.clubId === clubId),
  );
  if (members.length < 2)
    throw new Error(
      tr(
        "يحتاج التكتل إلى ناديين على الأقل.",
        "A bloc needs at least two clubs.",
        "Un bloc doit réunir au moins deux clubs.",
      ),
    );
  if (members.length > 1500)
    throw new Error(
      tr(
        "التكتل أكبر من الحد المسموح.",
        "The bloc is larger than the allowed limit.",
        "Le bloc dépasse la limite autorisée.",
      ),
    );
  const blocSet = new Set(
    members.map(
      (clubId) => p.clubs.find((club) => club.clubId === clubId).bloc,
    ),
  );
  if (blocSet.size > 1)
    throw new Error(
      tr(
        "يجب أن يجمع التكتل أندية من المجموعة السياسية نفسها.",
        "A club bloc must contain clubs from the same political group.",
        "Un bloc doit réunir des clubs du même groupe politique.",
      ),
    );
  for (const club of p.clubs)
    if (members.includes(club.clubId) && club.allianceId) {
      const previous = p.alliances.find(
        (alliance) => alliance.id === club.allianceId,
      );
      if (previous) {
        previous.clubIds = previous.clubIds.filter((id) => id !== club.clubId);
        for (const left of p.clubs)
          if (
            left.allianceId === previous.id &&
            !previous.clubIds.includes(left.clubId)
          )
            left.allianceId = null;
      }
    }
  p.alliances = p.alliances.filter((alliance) => alliance.clubIds.length >= 2);
  const id = `bloc-${(s.nextId = (s.nextId || 0) + 1)}`;
  const bloc = [...blocSet][0];
  const record = {
    id,
    name: String(name || POLITICAL_BLOCS[bloc].ar).slice(0, 60),
    bloc,
    clubIds: members,
    cohesion: Math.round(
      members.reduce(
        (sum, clubId) =>
          sum + p.clubs.find((club) => club.clubId === clubId).support,
        0,
      ) / members.length,
    ),
    formedSeason: s.seasonNumber,
    formedDate: s.date,
    candidateId: null,
    playerAligned: true,
  };
  p.alliances.push(record);
  for (const clubId of members)
    p.clubs.find((club) => club.clubId === clubId).allianceId = id;
  return record;
}

export function dissolveAlliance(s, allianceId) {
  const p = ensurePolitics(s);
  const alliance = p.alliances.find((row) => row.id === allianceId);
  if (!alliance)
    throw new Error(
      tr(
        "التكتل غير موجود.",
        "The political bloc was not found.",
        "Le bloc politique est introuvable.",
      ),
    );
  for (const club of p.clubs)
    if (club.allianceId === allianceId) club.allianceId = null;
  p.alliances = p.alliances.filter((row) => row.id !== allianceId);
  return alliance;
}

export function candidateById(s, candidateId) {
  return (
    ensurePolitics(s).candidates.find(
      (candidate) => candidate.id === candidateId,
    ) || null
  );
}

export function changeCandidateRelationship(
  s,
  candidateId,
  delta,
  reason = "contact",
) {
  const candidate = candidateById(s, candidateId);
  if (!candidate)
    throw new Error(
      tr(
        "الشخصية السياسية غير موجودة.",
        "The political candidate was not found.",
        "La personnalité politique est introuvable.",
      ),
    );
  candidate.relationship = clamp(
    Math.round((candidate.relationship + delta) * 10) / 10,
    -100,
    100,
  );
  candidate.lastAction = String(reason).slice(0, 80);
  return candidate.relationship;
}

export const politicalSentiment = (support) =>
  support >= 60 ? "supporter" : support < 40 ? "opponent" : "neutral";
export const demandDefinition = (id) => CLUB_DEMANDS[id] || null;
