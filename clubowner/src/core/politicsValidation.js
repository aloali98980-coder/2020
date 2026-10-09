import { CLUB_DEMANDS, POLITICAL_CANDIDATES } from "../data/politicsCatalog.js";
import { POLITICAL_LAWS } from "../data/politicsLaws.js";
import {
  COMMITTEE_POLICIES,
  POLITICAL_OFFICIALS,
  POLITICAL_SPONSORS,
  POLITICAL_TOURNAMENTS,
} from "../data/politicsCommittees.js";
import {
  FOREIGN_ORGANIZATIONS,
  HOSTING_EVENTS,
  INTEGRITY_SUBJECTS,
  LEGACY_TITLES,
  OPPOSITION_RESPONSES,
} from "../data/politicsGovernance.js";
import { POLITICAL_EVENT_BY_ID } from "../data/politicsEvents.js";
import { leagueClubIds } from "../services/politics/state.js";
import { isoDate } from "./isoDate.js";

const validId = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const safeInt = (value) => Number.isSafeInteger(value) && value >= 0;
const finiteRange = (value, min, max) =>
  Number.isFinite(value) && value >= min && value <= max;
const shortText = (value, max = 500) =>
  typeof value === "string" && value.length <= max;
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

export function validatePolitics(s) {
  const p = s.politics;
  check(
    p && typeof p === "object" && p.schema === 1,
    "حالة رئاسة الاتحاد غير سليمة.",
  );
  const activeIds = leagueClubIds(s);
  check(
    Array.isArray(p.clubs) &&
      p.clubs.length === activeIds.length &&
      p.clubs.length > 0 &&
      p.clubs.length <= 1500 &&
      new Set(p.clubs.map((club) => club.clubId)).size === p.clubs.length &&
      p.clubs.every(
        (club) =>
          validId(club.clubId) &&
          activeIds.includes(club.clubId) &&
          ["big", "regional", "small"].includes(club.bloc) &&
          finiteRange(club.support, 0, 100) &&
          safeInt(club.voteWeight) &&
          club.voteWeight >= 1 &&
          club.voteWeight <= 3 &&
          Array.isArray(club.demands) &&
          club.demands.length > 0 &&
          club.demands.length <= 5 &&
          club.demands.every((demand) => Object.hasOwn(CLUB_DEMANDS, demand)) &&
          club.demands.includes(club.demandId) &&
          (!club.allianceId || validId(club.allianceId)) &&
          Number.isFinite(club.lastChange) &&
          shortText(club.lastReason, 80) &&
          finiteRange(club.popularity, 0, 100),
      ),
    "خريطة الأندية السياسية غير سليمة.",
  );
  check(
    Array.isArray(p.candidates) &&
      p.candidates.length === POLITICAL_CANDIDATES.length &&
      new Set(p.candidates.map((candidate) => candidate.id)).size ===
        p.candidates.length &&
      POLITICAL_CANDIDATES.every((base) =>
        p.candidates.some((candidate) => candidate.id === base.id),
      ) &&
      p.candidates.every(
        (candidate) =>
          validId(candidate.id) &&
          shortText(candidate.name?.ar, 120) &&
          shortText(candidate.name?.en, 120) &&
          shortText(candidate.name?.fr, 120) &&
          Array.isArray(candidate.traits) &&
          candidate.traits.length > 0 &&
          candidate.traits.length <= 8 &&
          finiteRange(candidate.popularity, 0, 100) &&
          finiteRange(candidate.competence, 0, 100) &&
          finiteRange(candidate.corruption, 0, 100) &&
          finiteRange(candidate.relationship, -100, 100) &&
          finiteRange(candidate.momentum, -20, 20) &&
          typeof candidate.withdrawn === "boolean" &&
          typeof candidate.endorsedPlayer === "boolean" &&
          safeInt(candidate.campaignActions) &&
          shortText(candidate.lastAction || "", 80),
      ),
    "سجل المنافسين السياسيين غير سليم.",
  );
  check(
    p.office &&
      typeof p.office.held === "boolean" &&
      safeInt(p.office.termsServed) &&
      p.office.termsServed <= 100 &&
      (p.office.termStartSeason === null ||
        safeInt(p.office.termStartSeason)) &&
      (p.office.termEndSeason === null || safeInt(p.office.termEndSeason)) &&
      (p.office.immunityUntil === null || isoDate(p.office.immunityUntil)),
    "سجل المنصب الرئاسي غير سليم.",
  );
  const e = p.election;
  check(
    e &&
      safeInt(e.cycleSeasons) &&
      e.cycleSeasons >= 2 &&
      e.cycleSeasons <= 8 &&
      safeInt(e.season) &&
      e.season >= 1 &&
      ["scheduled", "campaigning", "complete"].includes(e.status) &&
      Array.isArray(e.publicBallot) &&
      e.publicBallot.length <= 1500,
    "موعد الانتخابات غير سليم.",
  );
  const c = p.campaign;
  check(
    c &&
      typeof c.active === "boolean" &&
      typeof c.playerEligible === "boolean" &&
      typeof c.completed === "boolean" &&
      (c.season === null || safeInt(c.season)) &&
      (c.startDate === null || isoDate(c.startDate)) &&
      (c.endDate === null || isoDate(c.endDate)) &&
      typeof c.lastPollMonth === "string" &&
      /^$|^\d{4}-(0[1-9]|1[0-2])$/.test(c.lastPollMonth) &&
      typeof c.lastActionMonth === "string" &&
      /^$|^\d{4}-(0[1-9]|1[0-2])$/.test(c.lastActionMonth) &&
      Array.isArray(c.visits) &&
      c.visits.length <= 1500 &&
      c.visits.every(
        (visit) =>
          validId(visit.clubId) && isoDate(visit.date) && safeInt(visit.cost),
      ) &&
      new Set(c.visits.map((visit) => visit.clubId)).size === c.visits.length &&
      Array.isArray(c.conferences) &&
      c.conferences.length <= 200 &&
      c.conferences.every(
        (conference) =>
          ["big", "regional", "small"].includes(conference.bloc) &&
          isoDate(conference.date) &&
          shortText(conference.key, 20) &&
          safeInt(conference.cost) &&
          safeInt(conference.attendees),
      ) &&
      Array.isArray(c.promises) &&
      c.promises.length <= 3000 &&
      c.promises.every(
        (promise) =>
          validId(promise.id) &&
          validId(promise.clubId) &&
          Object.hasOwn(CLUB_DEMANDS, promise.demandId) &&
          promise.lawId === CLUB_DEMANDS[promise.demandId].lawId &&
          isoDate(promise.madeDate) &&
          safeInt(promise.dueSeason) &&
          ["pending", "fulfilled", "broken"].includes(promise.status) &&
          (promise.fulfilledDate === null || isoDate(promise.fulfilledDate)),
      ) &&
      Array.isArray(c.polls) &&
      c.polls.length <= 24 &&
      c.polls.every(
        (poll) =>
          isoDate(poll.date) &&
          safeInt(poll.season) &&
          safeInt(poll.totalWeight) &&
          poll.shares &&
          Object.values(poll.shares).every((share) =>
            finiteRange(share, 0, 100),
          ),
      ) &&
      Array.isArray(c.financing) &&
      c.financing.length <= 120 &&
      c.financing.every(
        (entry) =>
          isoDate(entry.date) &&
          safeInt(entry.amount) &&
          shortText(entry.key, 100),
      ) &&
      safeInt(c.funds) &&
      c.funds <= 100_000_000 &&
      Array.isArray(c.eventIds) &&
      c.eventIds.length <= 80,
    "سجل الحملة والوعود والاستطلاعات غير سليم.",
  );
  check(
    Array.isArray(p.alliances) &&
      p.alliances.length <= 100 &&
      p.alliances.every(
        (alliance) =>
          validId(alliance.id) &&
          shortText(alliance.name, 60) &&
          ["big", "regional", "small"].includes(alliance.bloc) &&
          Array.isArray(alliance.clubIds) &&
          alliance.clubIds.length >= 2 &&
          alliance.clubIds.length <= 1500 &&
          new Set(alliance.clubIds).size === alliance.clubIds.length &&
          alliance.clubIds.every((id) =>
            p.clubs.some((club) => club.clubId === id),
          ) &&
          finiteRange(alliance.cohesion, 0, 100) &&
          safeInt(alliance.formedSeason) &&
          isoDate(alliance.formedDate) &&
          typeof alliance.playerAligned === "boolean",
      ) &&
      p.clubs.every(
        (club) =>
          !club.allianceId ||
          p.alliances.some(
            (alliance) =>
              alliance.id === club.allianceId &&
              alliance.clubIds.includes(club.clubId),
          ),
      ),
    "تكتلات الأندية غير سليمة.",
  );
  const monthPattern = /^$|^\d{4}-(0[1-9]|1[0-2])$/;
  check(
    finiteRange(p.legitimacy, 0, 100) &&
      p.integrity &&
      finiteRange(p.integrity.score, 0, 100) &&
      safeInt(p.integrity.cleanActions) &&
      safeInt(p.integrity.illicitActions) &&
      typeof p.integrity.exposed === "boolean" &&
      Array.isArray(p.integrity.investigations) &&
      p.integrity.investigations.length <= 150 &&
      p.integrity.investigations.every(
        (entry) =>
          validId(entry.id) &&
          Object.hasOwn(INTEGRITY_SUBJECTS, entry.subject) &&
          isoDate(entry.date) &&
          isoDate(entry.dueDate) &&
          [
            "open",
            "cleared",
            "referred",
            "obstructed",
            "unsubstantiated",
          ].includes(entry.status) &&
          finiteRange(entry.evidenceScore, 0, 100) &&
          Array.isArray(entry.findings) &&
          entry.findings.length <= 100 &&
          entry.findings.every(
            (finding) =>
              validId(finding.code) &&
              validId(finding.sourceId) &&
              safeInt(finding.severity),
          ) &&
          (entry.decision === null ||
            ["clear", "refer"].includes(entry.decision)) &&
          (entry.reviewedDate === null || isoDate(entry.reviewedDate)),
      ) &&
      Array.isArray(p.integrity.pendingBribes) &&
      p.integrity.pendingBribes.length <= 20 &&
      Array.isArray(p.integrity.assetDeclarations) &&
      p.integrity.assetDeclarations.length <= 100 &&
      p.integrity.assetDeclarations.every(
        (entry) =>
          validId(entry.id) &&
          safeInt(entry.season) &&
          isoDate(entry.date) &&
          safeInt(entry.associationBalance) &&
          safeInt(entry.ledgerRevision) &&
          typeof entry.disclosed === "boolean",
      ) &&
      Array.isArray(p.integrity.actions) &&
      p.integrity.actions.length <= 1000 &&
      p.integrity.actions.every(
        (entry) =>
          validId(entry.id) &&
          isoDate(entry.date) &&
          safeInt(entry.season) &&
          shortText(entry.type, 60),
      ) &&
      Array.isArray(p.integrity.reviewedEvidenceIds) &&
      p.integrity.reviewedEvidenceIds.length <= 2000 &&
      p.integrity.reviewedEvidenceIds.every(validId) &&
      monthPattern.test(p.integrity.lastReviewMonth) &&
      (p.integrity.lastAudit === null ||
        (validId(p.integrity.lastAudit.reportId) &&
          isoDate(p.integrity.lastAudit.date) &&
          safeInt(p.integrity.lastAudit.season) &&
          ["clean", "discrepancy"].includes(p.integrity.lastAudit.status) &&
          Number.isSafeInteger(p.integrity.lastAudit.discrepancy))),
    "مؤشرات شرعية ونزاهة الاتحاد غير سليمة.",
  );
  const opposition = p.opposition;
  const noConfidence = opposition?.noConfidence;
  check(
    opposition &&
      finiteRange(opposition.pressure, 0, 100) &&
      Array.isArray(opposition.motions) &&
      opposition.motions.length <= 150 &&
      opposition.motions.every(
        (motion) =>
          validId(motion.id) &&
          isoDate(motion.date) &&
          safeInt(motion.season) &&
          shortText(motion.type, 60) &&
          ["open", "vote-ready", "passed", "failed", "published"].includes(
            motion.status,
          ) &&
          (motion.responseId === undefined ||
            Object.hasOwn(OPPOSITION_RESPONSES, motion.responseId)),
      ) &&
      Array.isArray(opposition.conspiracies) &&
      opposition.conspiracies.length <= 100 &&
      Array.isArray(opposition.investigations) &&
      opposition.investigations.length <= 150 &&
      opposition.investigations.every(
        (entry) =>
          validId(entry.id) &&
          Object.hasOwn(INTEGRITY_SUBJECTS, entry.subject) &&
          isoDate(entry.date) &&
          [
            "open",
            "cleared",
            "referred",
            "obstructed",
            "unsubstantiated",
          ].includes(entry.status),
      ) &&
      monthPattern.test(opposition.lastActionMonth) &&
      monthPattern.test(opposition.lastResponseMonth) &&
      noConfidence &&
      safeInt(noConfidence.counter) &&
      safeInt(noConfidence.threshold) &&
      noConfidence.threshold >= 1 &&
      noConfidence.threshold <= 100 &&
      noConfidence.counter <= noConfidence.threshold &&
      ["quiet", "open", "vote-ready", "failed", "passed"].includes(
        noConfidence.status,
      ) &&
      (noConfidence.lastVoteDate === null ||
        isoDate(noConfidence.lastVoteDate)) &&
      (noConfidence.motionId === undefined || validId(noConfidence.motionId)) &&
      (noConfidence.votes === null ||
        (isoDate(noConfidence.votes.date) &&
          safeInt(noConfidence.votes.totalWeight) &&
          safeInt(noConfidence.votes.oppositionWeight) &&
          safeInt(noConfidence.votes.confidenceWeight) &&
          safeInt(noConfidence.votes.threshold) &&
          typeof noConfidence.votes.passed === "boolean" &&
          Array.isArray(noConfidence.votes.votes) &&
          noConfidence.votes.votes.length === p.clubs.length &&
          noConfidence.votes.votes.every(
            (vote) =>
              validId(vote.clubId) &&
              ["no-confidence", "confidence"].includes(vote.vote) &&
              safeInt(vote.weight) &&
              finiteRange(vote.support, 0, 100),
          ))),
    "سجل المعارضة واقتراع الثقة غير سليم.",
  );
  const foreign = p.foreign;
  check(
    foreign &&
      foreign.relations &&
      Object.keys(FOREIGN_ORGANIZATIONS).every((id) =>
        finiteRange(foreign.relations[id], 0, 100),
      ) &&
      Object.entries(foreign.relations).every(
        ([id, relation]) =>
          Object.hasOwn(FOREIGN_ORGANIZATIONS, id) &&
          finiteRange(relation, 0, 100),
      ) &&
      safeInt(foreign.influence) &&
      foreign.influence <= 100 &&
      Array.isArray(foreign.hostingBids) &&
      foreign.hostingBids.length <= 150 &&
      foreign.hostingBids.every((bid) => {
        const event = HOSTING_EVENTS[bid.eventId];
        return Boolean(
          event &&
          validId(bid.id) &&
          bid.organizationId === event.organizationId &&
          safeInt(bid.season) &&
          isoDate(bid.submittedDate) &&
          isoDate(bid.dueDate) &&
          bid.bidCost === event.bidCost &&
          bid.award === event.award &&
          ["pending", "awarded", "declined"].includes(bid.status) &&
          (bid.score === null || (safeInt(bid.score) && bid.score <= 100)) &&
          (bid.resolvedDate === null || isoDate(bid.resolvedDate)) &&
          (bid.status === "pending"
            ? bid.resolvedDate === null && bid.score === null
            : bid.resolvedDate !== null && bid.score !== null),
        );
      }) &&
      (foreign.executiveSeat === null ||
        (validId(foreign.executiveSeat.id) &&
          Object.hasOwn(
            FOREIGN_ORGANIZATIONS,
            foreign.executiveSeat.organizationId,
          ) &&
          isoDate(foreign.executiveSeat.acquiredDate) &&
          safeInt(foreign.executiveSeat.expiresSeason))) &&
      Array.isArray(foreign.missions) &&
      foreign.missions.length <= 150 &&
      foreign.missions.every(
        (mission) =>
          validId(mission.id) &&
          Object.hasOwn(FOREIGN_ORGANIZATIONS, mission.organizationId) &&
          ["dialogue", "youth-exchange", "governance"].includes(
            mission.missionType,
          ) &&
          isoDate(mission.date) &&
          safeInt(mission.cost) &&
          finiteRange(mission.relationAfter, 0, 100) &&
          safeInt(mission.influenceAfter),
      ) &&
      Array.isArray(foreign.history) &&
      foreign.history.length <= 150 &&
      foreign.history.every(
        (entry) =>
          shortText(entry.type, 60) &&
          isoDate(entry.date) &&
          Object.hasOwn(FOREIGN_ORGANIZATIONS, entry.organizationId),
      ) &&
      foreign.lastMissionByOrg &&
      typeof foreign.lastMissionByOrg === "object" &&
      Object.entries(foreign.lastMissionByOrg).every(
        ([id, month]) =>
          Object.hasOwn(FOREIGN_ORGANIZATIONS, id) &&
          /^\d{4}-(0[1-9]|1[0-2])$/.test(month),
      ) &&
      monthPattern.test(foreign.lastReviewMonth),
    "سجل العلاقات الخارجية والاستضافة غير سليم.",
  );
  const legacy = p.legacy;
  check(
    legacy &&
      (legacy.title === null || Object.hasOwn(LEGACY_TITLES, legacy.title)) &&
      Array.isArray(legacy.departures) &&
      legacy.departures.length <= 30 &&
      legacy.departures.every(
        (record) =>
          validId(record.id) &&
          safeInt(record.startedSeason) &&
          safeInt(record.endedSeason) &&
          safeInt(record.seasonsServed) &&
          [
            "election-loss",
            "term-limit",
            "no-confidence",
            "resignation",
          ].includes(record.reason) &&
          finiteRange(record.integrityScore, 0, 100) &&
          finiteRange(record.legitimacy, 0, 100) &&
          finiteRange(record.legacyScore, 0, 100) &&
          safeInt(record.lawsPassed) &&
          safeInt(record.cleanAudits) &&
          Object.hasOwn(LEGACY_TITLES, record.titleId) &&
          isoDate(record.date),
      ) &&
      Array.isArray(legacy.honours) &&
      legacy.honours.length <= 30 &&
      legacy.honours.every(
        (honour) =>
          validId(honour.id) &&
          Object.hasOwn(LEGACY_TITLES, honour.titleId) &&
          isoDate(honour.date) &&
          finiteRange(honour.score, 0, 100),
      ) &&
      legacy.trial &&
      ["none", "open", "closed"].includes(legacy.trial.status) &&
      Array.isArray(legacy.trial.charges) &&
      legacy.trial.charges.length <= 20 &&
      legacy.trial.charges.every(
        (charge) =>
          validId(charge.code) &&
          validId(charge.sourceId) &&
          (charge.severity === undefined || safeInt(charge.severity)),
      ) &&
      (legacy.trial.verdict === null ||
        ["cleared", "sanctioned"].includes(legacy.trial.verdict)) &&
      (legacy.trial.recordId === null || validId(legacy.trial.recordId)) &&
      (legacy.trial.openedDate === null || isoDate(legacy.trial.openedDate)) &&
      safeInt(legacy.trial.evidenceScore) &&
      legacy.trial.evidenceScore <= 100 &&
      (legacy.trial.response === null ||
        ["cooperate", "contest"].includes(legacy.trial.response)) &&
      (legacy.trial.closedDate === undefined ||
        isoDate(legacy.trial.closedDate)),
    "سجل الإرث والملف القضائي غير سليم.",
  );
  const eventState = p.eventState;
  check(
    eventState &&
      (eventState.pending === null ||
        (eventState.pending &&
          Object.hasOwn(POLITICAL_EVENT_BY_ID, eventState.pending.eventId) &&
          isoDate(eventState.pending.createdDate) &&
          isoDate(eventState.pending.expiresDate) &&
          eventState.pending.expiresDate >= eventState.pending.createdDate)) &&
      Array.isArray(eventState.history) &&
      eventState.history.length <= 150 &&
      eventState.history.every((entry) => {
        const event = POLITICAL_EVENT_BY_ID[entry.eventId];
        return Boolean(
          event &&
          isoDate(entry.date) &&
          ["resolved", "expired"].includes(entry.status) &&
          (entry.status === "expired"
            ? entry.choiceId === null
            : event.choices.some((choice) => choice.id === entry.choiceId)),
        );
      }) &&
      eventState.cooldowns &&
      typeof eventState.cooldowns === "object" &&
      !Array.isArray(eventState.cooldowns) &&
      Object.entries(eventState.cooldowns).every(
        ([eventId, until]) =>
          Object.hasOwn(POLITICAL_EVENT_BY_ID, eventId) && isoDate(until),
      ) &&
      monthPattern.test(eventState.lastMonth),
    "سجل الأحداث السياسية غير سليم.",
  );
  const council = p.council;
  check(
    council &&
      Array.isArray(council.members) &&
      council.members.length === activeIds.length &&
      new Set(council.members).size === council.members.length &&
      council.members.every((id) => activeIds.includes(id)) &&
      safeInt(council.appointedSeats) &&
      council.appointedSeats <= 10 &&
      council.laws &&
      typeof council.laws === "object" &&
      Object.entries(council.laws).every(
        ([lawId, record]) =>
          Object.hasOwn(POLITICAL_LAWS, lawId) &&
          record?.lawId === lawId &&
          validId(record.billId) &&
          isoDate(record.passedDate) &&
          safeInt(record.passedSeason) &&
          typeof record.constitutional === "boolean" &&
          record.effect === POLITICAL_LAWS[lawId].effect,
      ) &&
      Array.isArray(council.history) &&
      council.history.length <= 200 &&
      council.history.every(
        (record) =>
          record.type === "bill" &&
          validId(record.billId) &&
          Object.hasOwn(POLITICAL_LAWS, record.lawId) &&
          isoDate(record.date) &&
          safeInt(record.season) &&
          typeof record.passed === "boolean" &&
          safeInt(record.yesWeight) &&
          safeInt(record.noWeight) &&
          safeInt(record.totalWeight) &&
          record.yesWeight + record.noWeight === record.totalWeight &&
          Array.isArray(record.dissentIds) &&
          record.dissentIds.length <= 1500 &&
          record.dissentIds.every(validId),
      ) &&
      Array.isArray(council.voteLog) &&
      council.voteLog.length <= 200 &&
      council.voteLog.every(
        (record) =>
          validId(record.billId) &&
          Object.hasOwn(POLITICAL_LAWS, record.lawId) &&
          isoDate(record.date) &&
          safeInt(record.season) &&
          typeof record.passed === "boolean" &&
          finiteRange(record.threshold, 50, 100) &&
          safeInt(record.yesWeight) &&
          safeInt(record.noWeight) &&
          safeInt(record.totalWeight) &&
          record.yesWeight + record.noWeight === record.totalWeight &&
          Array.isArray(record.ballot) &&
          record.ballot.length > 0 &&
          record.ballot.length <= 1500 &&
          new Set(record.ballot.map((row) => row.clubId)).size ===
            record.ballot.length &&
          record.ballot.every(
            (row) =>
              validId(row.clubId) &&
              ["yes", "no"].includes(row.vote) &&
              safeInt(row.voteWeight) &&
              row.voteWeight >= 1 &&
              row.voteWeight <= 3 &&
              finiteRange(row.chance, 0, 100) &&
              safeInt(row.roll) &&
              row.roll <= 99,
          ) &&
          Array.isArray(record.dissentIds) &&
          record.dissentIds.length <= 1500 &&
          new Set(record.dissentIds).size === record.dissentIds.length &&
          record.dissentIds.every(validId) &&
          record.yesWeight ===
            record.ballot
              .filter((row) => row.vote === "yes")
              .reduce((sum, row) => sum + row.voteWeight, 0) &&
          record.noWeight ===
            record.ballot
              .filter((row) => row.vote === "no")
              .reduce((sum, row) => sum + row.voteWeight, 0) &&
          record.totalWeight ===
            record.ballot.reduce((sum, row) => sum + row.voteWeight, 0) &&
          record.dissentIds.every((id) =>
            record.ballot.some((row) => row.clubId === id && row.vote === "no"),
          ) &&
          record.passed ===
            (POLITICAL_LAWS[record.lawId].constitutional
              ? record.yesWeight * 100 >= record.totalWeight * record.threshold
              : record.yesWeight * 2 > record.totalWeight),
      ) &&
      council.constitution &&
      (council.constitution.termLimit === null ||
        (council.constitution.termLimit === 2 &&
          Boolean(council.laws["two-term-limit"]))) &&
      council.constitution.supermajorityThreshold === 67 &&
      Array.isArray(council.constitution.amendments) &&
      council.constitution.amendments.length <= 50 &&
      council.constitution.amendments.every(
        (amendment) =>
          Object.hasOwn(POLITICAL_LAWS, amendment.lawId) &&
          POLITICAL_LAWS[amendment.lawId].constitutional &&
          validId(amendment.billId) &&
          isoDate(amendment.date) &&
          safeInt(amendment.yesWeight) &&
          safeInt(amendment.totalWeight) &&
          amendment.yesWeight <= amendment.totalWeight &&
          amendment.yesWeight * 100 >= amendment.totalWeight * 67,
      ) &&
      (council.constitution.termLimit === null ||
        council.constitution.amendments.some(
          (amendment) => amendment.lawId === "two-term-limit",
        )) &&
      (!council.currentBill ||
        (validId(council.currentBill.id) &&
          Object.hasOwn(POLITICAL_LAWS, council.currentBill.lawId) &&
          ["debate", "voting", "passed", "rejected"].includes(
            council.currentBill.status,
          ) &&
          isoDate(council.currentBill.proposedDate) &&
          safeInt(council.currentBill.proposedSeason) &&
          Array.isArray(council.currentBill.lobby) &&
          council.currentBill.lobby.length <= 1500 &&
          new Set(council.currentBill.lobby.map((item) => item.clubId)).size ===
            council.currentBill.lobby.length &&
          council.currentBill.lobby.every(
            (item) =>
              validId(item.clubId) &&
              [
                "policy-concession",
                "public-case",
                "development-grant",
              ].includes(item.offer) &&
              isoDate(item.date) &&
              typeof item.accepted === "boolean" &&
              safeInt(item.amount) &&
              Number.isFinite(item.votingBonus) &&
              shortText(item.demandId || "", 60),
          ))) &&
      Object.entries(council.laws).every(([lawId]) =>
        council.history.some(
          (record) => record.lawId === lawId && record.passed,
        ),
      ),
    "سجل المجلس والتصويت العلني غير سليم.",
  );
  const finance = p.finance;
  const formula = finance?.distributionFormula;
  check(
    finance &&
      safeInt(finance.balance) &&
      safeInt(finance.initialBalance) &&
      safeInt(finance.ledgerOpeningBalance) &&
      safeInt(finance.ledgerRevision) &&
      safeInt(finance.tvPool) &&
      safeInt(finance.broadcastRevenue) &&
      safeInt(finance.youthGrantPerSeason) &&
      safeInt(finance.solidarityPerSeason) &&
      typeof finance.publicDisclosure === "boolean" &&
      typeof finance.auditMandate === "boolean" &&
      formula &&
      safeInt(formula.performance) &&
      safeInt(formula.popularity) &&
      safeInt(formula.equality) &&
      formula.performance + formula.popularity + formula.equality === 100 &&
      finance.clubAccounts &&
      typeof finance.clubAccounts === "object" &&
      Object.keys(finance.clubAccounts).length <= 3000 &&
      Object.entries(finance.clubAccounts).every(
        ([id, account]) =>
          validId(id) &&
          account &&
          safeInt(account.balance) &&
          safeInt(account.totalReceived) &&
          safeInt(account.totalGrants) &&
          account.balance <= account.totalReceived &&
          account.totalGrants <= account.totalReceived,
      ) &&
      activeIds.every((id) => Boolean(finance.clubAccounts[id])) &&
      Array.isArray(finance.ledger) &&
      finance.ledger.length <= 5000 &&
      finance.ledger.every(
        (entry) =>
          validId(entry.id) &&
          isoDate(entry.date) &&
          safeInt(entry.season) &&
          ["credit", "debit", "memo"].includes(entry.direction) &&
          safeInt(entry.amount) &&
          shortText(entry.type, 80),
      ) &&
      Array.isArray(finance.funds) &&
      finance.funds.length <= 50 &&
      finance.funds.every(
        (fund) =>
          validId(fund.id) &&
          shortText(fund.name, 60) &&
          ["small", "regional", "all"].includes(fund.criteria) &&
          safeInt(fund.amount) &&
          safeInt(fund.remaining) &&
          fund.remaining <= fund.amount &&
          isoDate(fund.createdDate) &&
          safeInt(fund.createdSeason) &&
          ["open", "closed"].includes(fund.status) &&
          Array.isArray(fund.grants) &&
          fund.grants.length <= 1500 &&
          new Set(fund.grants.map((grant) => grant.clubId)).size ===
            fund.grants.length &&
          fund.grants.every(
            (grant) =>
              validId(grant.clubId) &&
              safeInt(grant.amount) &&
              isoDate(grant.date),
          ) &&
          fund.grants.reduce((sum, grant) => sum + grant.amount, 0) ===
            fund.amount - fund.remaining,
      ) &&
      Array.isArray(finance.distributions) &&
      finance.distributions.length <= 120 &&
      finance.distributions.every(
        (distribution) =>
          validId(distribution.id) &&
          isoDate(distribution.date) &&
          safeInt(distribution.season) &&
          ["broadcast", "youth-development", "solidarity"].includes(
            distribution.type,
          ) &&
          safeInt(distribution.total) &&
          distribution.formula &&
          safeInt(distribution.formula.performance) &&
          safeInt(distribution.formula.popularity) &&
          safeInt(distribution.formula.equality) &&
          distribution.formula.performance +
            distribution.formula.popularity +
            distribution.formula.equality ===
            100 &&
          distribution.shares &&
          Object.entries(distribution.shares).every(
            ([id, amount]) => validId(id) && safeInt(amount),
          ) &&
          Object.values(distribution.shares).reduce(
            (sum, amount) => sum + amount,
            0,
          ) === distribution.total,
      ) &&
      Array.isArray(finance.audits) &&
      finance.audits.length <= 120 &&
      finance.audits.every(
        (audit) =>
          validId(audit.id) &&
          isoDate(audit.date) &&
          safeInt(audit.season) &&
          ["clean", "discrepancy"].includes(audit.status) &&
          safeInt(audit.balance) &&
          safeInt(audit.ledgerBalance) &&
          Number.isSafeInteger(audit.discrepancy) &&
          audit.balance - audit.ledgerBalance === audit.discrepancy &&
          safeInt(audit.entriesReviewed) &&
          safeInt(audit.ledgerRevision) &&
          typeof audit.independent === "boolean" &&
          Array.isArray(audit.findings) &&
          audit.findings.length <= 20,
      ) &&
      (finance.lastDistributionSeason === null ||
        safeInt(finance.lastDistributionSeason)) &&
      (finance.lastAuditSeason === null || safeInt(finance.lastAuditSeason)),
    "سجل ميزانية الاتحاد والتوزيعات والمراجعات غير سليم.",
  );
  const committees = p.committees;
  const officialsById = new Map(
    POLITICAL_OFFICIALS.map((official) => [official.id, official]),
  );
  const validCommitteeChair = (committeeId, committee) =>
    committee.chairId === null ||
    (officialsById.has(committee.chairId) &&
      officialsById.get(committee.chairId).roles.includes(committeeId));
  const validCommitteeMeta = (committee) =>
    committee &&
    finiteRange(committee.competence, 0, 100) &&
    finiteRange(committee.integrity, 0, 100) &&
    (committee.appointedDate === null || isoDate(committee.appointedDate)) &&
    (committee.policyChangedDate === null ||
      isoDate(committee.policyChangedDate));
  check(
    committees &&
      /^$|^\d{4}-(0[1-9]|1[0-2])$/.test(committees.lastMonth) &&
      Array.isArray(committees.history) &&
      committees.history.length <= 300 &&
      committees.history.every(
        (entry) =>
          validId(entry.id) &&
          isoDate(entry.date) &&
          safeInt(entry.season) &&
          shortText(entry.type, 60),
      ) &&
      Array.isArray(committees.chairHistory) &&
      committees.chairHistory.length <= 100 &&
      committees.chairHistory.every(
        (entry) =>
          ["referees", "discipline", "competitions"].includes(
            entry.committeeId,
          ) &&
          (entry.previous === null || officialsById.has(entry.previous)) &&
          officialsById.has(entry.officialId) &&
          isoDate(entry.date),
      ) &&
      validCommitteeChair("referees", committees.referees) &&
      validCommitteeMeta(committees.referees) &&
      COMMITTEE_POLICIES.referees.includes(committees.referees.policy) &&
      finiteRange(committees.referees.morale, 0, 100) &&
      safeInt(committees.referees.strikes) &&
      committees.referees.strikes <= 1000 &&
      (committees.referees.favoredClubId === null ||
        validId(committees.referees.favoredClubId)) &&
      (committees.referees.biasUntil === null ||
        isoDate(committees.referees.biasUntil)) &&
      Array.isArray(committees.referees.suspensions) &&
      committees.referees.suspensions.length <= 500 &&
      Array.isArray(committees.referees.scandals) &&
      committees.referees.scandals.length <= 500 &&
      validCommitteeChair("discipline", committees.discipline) &&
      validCommitteeMeta(committees.discipline) &&
      COMMITTEE_POLICIES.discipline.includes(
        committees.discipline.strictness,
      ) &&
      Array.isArray(committees.discipline.cases) &&
      committees.discipline.cases.length <= 500 &&
      committees.discipline.cases.every(
        (record) =>
          validId(record.id) &&
          validId(record.matchId) &&
          validId(record.clubId) &&
          validId(record.playerId) &&
          shortText(record.playerName, 80) &&
          record.charge === "red-card" &&
          isoDate(record.date) &&
          safeInt(record.recommendedDays) &&
          ["pending", "resolved"].includes(record.status) &&
          (record.verdict === null ||
            ["uphold", "reduce", "dismiss"].includes(record.verdict)) &&
          (record.resolvedDate === null || isoDate(record.resolvedDate)) &&
          (record.sanctionDays === undefined || safeInt(record.sanctionDays)) &&
          (record.ownClubRuling === undefined ||
            typeof record.ownClubRuling === "boolean"),
      ) &&
      Array.isArray(committees.discipline.appeals) &&
      committees.discipline.appeals.length <= 500 &&
      validCommitteeChair("competitions", committees.competitions) &&
      validCommitteeMeta(committees.competitions) &&
      COMMITTEE_POLICIES.competitions.includes(
        committees.competitions.calendar,
      ) &&
      finiteRange(committees.competitions.favoritism, 0, 100) &&
      Array.isArray(committees.competitions.scandals) &&
      committees.competitions.scandals.length <= 500 &&
      Array.isArray(committees.competitions.tournaments) &&
      committees.competitions.tournaments.length <= 120 &&
      committees.competitions.tournaments.every((tournament) => {
        const template = POLITICAL_TOURNAMENTS[tournament.templateId];
        const sponsor = POLITICAL_SPONSORS.find(
          (entry) => entry.id === tournament.sponsorId,
        );
        return Boolean(
          template &&
          sponsor &&
          validId(tournament.id) &&
          tournament.format === template.format &&
          safeInt(tournament.season) &&
          isoDate(tournament.createdDate) &&
          ["scheduled", "complete"].includes(tournament.status) &&
          safeInt(tournament.currentRound) &&
          tournament.currentRound >= 1 &&
          Array.isArray(tournament.entrants) &&
          tournament.entrants.length === template.entryCount &&
          new Set(tournament.entrants).size === tournament.entrants.length &&
          tournament.entrants.every(validId) &&
          shortText(tournament.drawSeed, 200) &&
          typeof tournament.drawAudited === "boolean" &&
          COMMITTEE_POLICIES.competitions.includes(tournament.calendarPolicy) &&
          safeInt(tournament.roundGapDays) &&
          [3, 7, 14].includes(tournament.roundGapDays) &&
          isoDate(tournament.scheduleStartDate) &&
          shortText(tournament.name?.ar, 120) &&
          shortText(tournament.name?.en, 120) &&
          shortText(tournament.name?.fr, 120) &&
          shortText(tournament.description?.ar, 500) &&
          shortText(tournament.description?.en, 500) &&
          shortText(tournament.description?.fr, 500) &&
          shortText(tournament.sponsorName?.ar, 120) &&
          shortText(tournament.sponsorName?.en, 120) &&
          shortText(tournament.sponsorName?.fr, 120) &&
          tournament.sponsorContribution === sponsor.contribution &&
          safeInt(tournament.setupCost) &&
          safeInt(tournament.prizePool) &&
          tournament.prizePool === template.prizePool &&
          validId(tournament.prizeFundId) &&
          Array.isArray(tournament.fixtures) &&
          tournament.fixtures.length <= 255 &&
          new Set(tournament.fixtures.map((fixture) => fixture.id)).size ===
            tournament.fixtures.length &&
          tournament.fixtures.every(
            (fixture) =>
              validId(fixture.id) &&
              safeInt(fixture.round) &&
              fixture.round >= 1 &&
              tournament.entrants.includes(fixture.homeId) &&
              tournament.entrants.includes(fixture.awayId) &&
              fixture.homeId !== fixture.awayId &&
              isoDate(fixture.scheduledDate) &&
              typeof fixture.played === "boolean" &&
              (fixture.homeGoals === null || safeInt(fixture.homeGoals)) &&
              (fixture.awayGoals === null || safeInt(fixture.awayGoals)) &&
              (fixture.winnerId === null ||
                tournament.entrants.includes(fixture.winnerId)) &&
              fixture.played === (fixture.winnerId !== null),
          ) &&
          (tournament.format === "league"
            ? tournament.table &&
              Object.keys(tournament.table).length ===
                tournament.entrants.length &&
              tournament.entrants.every((clubId) => {
                const row = tournament.table[clubId];
                return (
                  row &&
                  row.clubId === clubId &&
                  [
                    row.played,
                    row.wins,
                    row.draws,
                    row.losses,
                    row.gf,
                    row.ga,
                    row.points,
                  ].every(safeInt)
                );
              })
            : tournament.table === null) &&
          (tournament.championId === null ||
            tournament.entrants.includes(tournament.championId)) &&
          (tournament.completedDate === null ||
            isoDate(tournament.completedDate)) &&
          (tournament.status === "complete"
            ? tournament.championId !== null &&
              tournament.completedDate !== null
            : tournament.championId === null),
        );
      }) &&
      Array.isArray(committees.competitions.history) &&
      committees.competitions.history.length <= 120 &&
      committees.competitions.history.every(
        (entry) =>
          validId(entry.tournamentId) &&
          validId(entry.championId) &&
          isoDate(entry.date) &&
          safeInt(entry.prize),
      ),
    "سجل اللجان والانضباط والبطولات غير سليم.",
  );
  if (c.active)
    check(
      e.status === "campaigning" && c.season === e.season,
      "الحملة لا تطابق دورة الانتخابات.",
    );
  if (e.status === "campaigning")
    check(c.active, "حالة الانتخابات تشير إلى حملة غير نشطة.");
  if (
    c.active &&
    p.council.constitution.termLimit !== null &&
    p.office.termsServed >= p.council.constitution.termLimit
  )
    check(c.playerEligible === false, "الترشح يخالف حد الولايات الدستوري.");
  return p;
}
