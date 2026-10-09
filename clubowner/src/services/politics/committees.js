import {
  POLITICAL_OFFICIALS,
  COMMITTEE_POLICIES,
} from "../../data/politicsCommittees.js";
import { addDays, clamp } from "../../core/utils.js";
import { tr } from "../../i18n/index.js";
import { ensurePolitics } from "./state.js";

const COMMITTEE_KEYS = new Set(["referees", "discipline", "competitions"]);
const CASE_LIMIT = 500;

function requirePresident(s) {
  const p = ensurePolitics(s);
  if (!p.office.held)
    throw new Error(
      tr(
        "تحتاج إلى انتخابك رئيسًا لإدارة لجان الاتحاد.",
        "You must be elected president to manage association committees.",
        "Vous devez être élu à la présidence pour gérer les commissions de la fédération.",
      ),
    );
  return p;
}

function recordCommitteeAction(s, type, details = {}) {
  const committees = ensurePolitics(s).committees;
  committees.history.push({
    id: `committee-${(s.nextId = (s.nextId || 0) + 1)}`,
    date: s.date,
    season: s.seasonNumber,
    type,
    ...details,
  });
  while (committees.history.length > 300) committees.history.shift();
}

export function appointCommitteeChair(s, committeeId, officialId) {
  const p = requirePresident(s);
  if (!COMMITTEE_KEYS.has(committeeId))
    throw new Error(
      tr("اللجنة غير معروفة.", "Unknown committee.", "Commission inconnue."),
    );
  const official = POLITICAL_OFFICIALS.find((entry) => entry.id === officialId);
  if (!official || !official.roles.includes(committeeId))
    throw new Error(
      tr(
        "لا يملك المرشح الخبرة المطلوبة لهذه اللجنة.",
        "This nominee is not qualified for that committee.",
        "Cette personne n’est pas qualifiée pour cette commission.",
      ),
    );
  const committee = p.committees[committeeId];
  const previous = committee.chairId || null;
  committee.chairId = official.id;
  committee.appointedDate = s.date;
  committee.competence = official.competence;
  committee.integrity = official.integrity;
  p.committees.chairHistory.push({
    committeeId,
    previous,
    officialId: official.id,
    date: s.date,
  });
  while (p.committees.chairHistory.length > 100)
    p.committees.chairHistory.shift();
  recordCommitteeAction(s, "chair-appointed", {
    committeeId,
    previous,
    officialId: official.id,
  });
  return { ...committee };
}

export function setCommitteePolicy(s, committeeId, policy) {
  const p = requirePresident(s);
  const choices = COMMITTEE_POLICIES[committeeId];
  if (!choices || !choices.includes(policy))
    throw new Error(
      tr(
        "سياسة اللجنة غير صالحة.",
        "Invalid committee policy.",
        "Politique de commission invalide.",
      ),
    );
  const committee = p.committees[committeeId];
  const policyKey =
    committeeId === "discipline"
      ? "strictness"
      : committeeId === "competitions"
        ? "calendar"
        : "policy";
  const previous = committee[policyKey];
  committee[policyKey] = policy;
  committee.policyChangedDate = s.date;
  if (previous !== policy)
    recordCommitteeAction(s, "policy-changed", {
      committeeId,
      previous,
      policy,
    });
  return committee[policyKey];
}

/** Record an association review after a dismissal in the user's club match. */
export function recordDisciplineIncident(s, fixture, player) {
  const p = ensurePolitics(s);
  if (
    !p.office.held ||
    !fixture ||
    !player ||
    !p.clubs.some((club) => club.clubId === s.clubId)
  )
    return null;
  const committee = p.committees.discipline;
  if (
    committee.cases.some(
      (entry) => entry.matchId === fixture.id && entry.playerId === player.id,
    )
  )
    return null;
  const recommendedDays =
    committee.strictness === "strict"
      ? 12
      : committee.strictness === "lenient"
        ? 4
        : 8;
  const record = {
    id: `discipline-${(s.nextId = (s.nextId || 0) + 1)}`,
    matchId: fixture.id,
    clubId: s.clubId,
    playerId: player.id,
    playerName: String(player.name || "Player").slice(0, 80),
    charge: "red-card",
    date: s.date,
    recommendedDays,
    status: "pending",
    verdict: null,
    resolvedDate: null,
  };
  committee.cases.push(record);
  while (committee.cases.length > CASE_LIMIT) committee.cases.shift();
  return record;
}

export function resolveDisciplineCase(s, caseId, verdict) {
  const p = requirePresident(s);
  if (!["uphold", "reduce", "dismiss"].includes(verdict))
    throw new Error(
      tr(
        "قرار اللجنة غير صالح.",
        "Invalid disciplinary ruling.",
        "Décision disciplinaire invalide.",
      ),
    );
  const committee = p.committees.discipline;
  const record = committee.cases.find((entry) => entry.id === caseId);
  if (!record || record.status !== "pending")
    throw new Error(
      tr(
        "القضية غير موجودة أو حُسمت من قبل.",
        "This case does not exist or has already been resolved.",
        "Cette affaire est introuvable ou déjà résolue.",
      ),
    );
  const player = s.players.find((entry) => entry.id === record.playerId);
  let sanctionDays = record.recommendedDays;
  if (verdict === "reduce")
    sanctionDays = Math.ceil(record.recommendedDays / 2);
  if (verdict === "dismiss") sanctionDays = 0;
  if (player)
    player.suspendedUntil = sanctionDays
      ? addDays(record.date, sanctionDays)
      : record.date;
  record.status = "resolved";
  record.verdict = verdict;
  record.resolvedDate = s.date;
  record.sanctionDays = sanctionDays;
  record.beneficiaryClubId = record.clubId;
  record.ownClubRuling = record.clubId === s.clubId;
  recordCommitteeAction(s, "discipline-ruled", {
    caseId,
    verdict,
    sanctionDays,
    ownClubRuling: record.ownClubRuling,
  });
  return record;
}

/** Monthly oversight bookkeeping; deterministic so loading a save cannot change politics. */
export function committeeDay(s) {
  const p = ensurePolitics(s);
  const month = String(s.date || "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month) || p.committees.lastMonth === month)
    return false;
  p.committees.lastMonth = month;
  const referees = p.committees.referees;
  if (referees.chairId) {
    const quality =
      (Number(referees.competence || 50) + Number(referees.integrity || 50)) /
      2;
    referees.morale = clamp(
      Number(referees.morale || 0) +
        (quality >= 85 ? 1 : quality < 65 ? -1 : 0),
      0,
      100,
    );
  }
  const competitions = p.committees.competitions;
  competitions.favoritism = clamp(
    Number(competitions.favoritism || 0) * 0.9,
    0,
    100,
  );
  recordCommitteeAction(s, "monthly-review", { month });
  return true;
}

export function committeeChair(committee, committeeId) {
  return (
    POLITICAL_OFFICIALS.find(
      (official) => official.id === committee?.[committeeId]?.chairId,
    ) || null
  );
}

export function refereeSuspensionThreshold(politics) {
  const strictness = politics?.committees?.discipline?.strictness;
  return strictness === "strict" ? 3 : strictness === "lenient" ? 5 : 4;
}
