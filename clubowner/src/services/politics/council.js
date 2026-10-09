import { POLITICAL_LAWS } from "../../data/politicsLaws.js";
import { getLanguage, tr } from "../../i18n/index.js";
import { message } from "../inbox.js";
import { associationDevelopmentGrant } from "./associationFinance.js";
import { adjustClubSupport, ensurePolitics } from "./state.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const localized = (words) => words?.[getLanguage()] || words?.en || "";
const MAX_LOG = 200;

function requirePresident(s) {
  const p = ensurePolitics(s);
  if (!p.office.held)
    throw new Error(
      tr(
        "لا تملك صلاحية رئاسة المجلس قبل انتخابك رئيسًا للاتحاد.",
        "You must be elected association president before chairing the council.",
        "Vous devez être élu à la présidence de la fédération pour diriger le conseil.",
      ),
    );
  return p;
}

function currentBill(s, billId) {
  const p = requirePresident(s);
  const bill = p.council.currentBill;
  if (
    !bill ||
    bill.id !== billId ||
    !["debate", "voting"].includes(bill.status)
  )
    throw new Error(
      tr(
        "لا توجد لائحة مفتوحة بهذا الرقم للمجلس.",
        "No open bill with that number is before the council.",
        "Aucun texte ouvert ne porte ce numéro devant le conseil.",
      ),
    );
  return { p, bill, law: POLITICAL_LAWS[bill.lawId] };
}

export function proposeBill(s, lawId) {
  const p = requirePresident(s);
  const law = POLITICAL_LAWS[lawId];
  if (!law)
    throw new Error(
      tr(
        "اللائحة المقترحة غير موجودة في الكتالوج.",
        "That proposed law is not in the catalogue.",
        "Le texte proposé ne figure pas au catalogue.",
      ),
    );
  if (["debate", "voting"].includes(p.council.currentBill?.status))
    throw new Error(
      tr(
        "أكمل التصويت على مشروع اللائحة المفتوح أولًا.",
        "Finish the open bill before introducing another one.",
        "Terminez le texte en cours avant d’en présenter un autre.",
      ),
    );
  if (p.council.laws[lawId])
    throw new Error(
      tr(
        "هذه اللائحة نافذة بالفعل ولا يمكن طرحها مرة أخرى.",
        "This law is already in force and cannot be introduced again.",
        "Cette loi est déjà en vigueur et ne peut pas être proposée à nouveau.",
      ),
    );
  const bill = {
    id: `bill-${(s.nextId = (s.nextId || 0) + 1)}`,
    lawId,
    status: "debate",
    proposedDate: s.date,
    proposedSeason: s.seasonNumber,
    introducedBy: "president",
    lobby: [],
    outcome: null,
  };
  p.council.currentBill = bill;
  return bill;
}

export function bargainBill(s, billId, clubId, offer, amount = 0) {
  const { p, bill, law } = currentBill(s, billId);
  const club = p.clubs.find((row) => row.clubId === clubId);
  if (!club)
    throw new Error(
      tr(
        "النادي غير موجود في سجل المجلس.",
        "The club is not on the council register.",
        "Le club ne figure pas au registre du conseil.",
      ),
    );
  if (bill.lobby.some((item) => item.clubId === clubId))
    throw new Error(
      tr(
        "سجل المجلس جولة تفاوض لهذا النادي بالفعل.",
        "The council has already logged a negotiation with this club.",
        "Le conseil a déjà enregistré une négociation avec ce club.",
      ),
    );
  if (
    !["policy-concession", "public-case", "development-grant"].includes(offer)
  )
    throw new Error(
      tr(
        "أسلوب التفاوض غير معروف.",
        "Unknown negotiation approach.",
        "Méthode de négociation inconnue.",
      ),
    );

  let accepted = true;
  let votingBonus = 0;
  let spent = 0;
  if (offer === "policy-concession") {
    accepted = Boolean(law.demandId && club.demands.includes(law.demandId));
    votingBonus = accepted ? 18 : -3;
  } else if (offer === "public-case") {
    votingBonus = 7 + (p.legitimacy >= 65 ? 2 : 0);
  } else {
    associationDevelopmentGrant(s, clubId, amount, bill.id);
    spent = amount;
    votingBonus = 9 + Math.min(8, Math.floor(amount / 1_000_000));
  }
  const record = {
    clubId,
    offer,
    date: s.date,
    accepted,
    amount: spent,
    votingBonus,
    demandId: law.demandId || null,
  };
  bill.lobby.push(record);
  return record;
}

function fnv(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++)
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}

function voteChance(p, bill, law, club) {
  const lobby = bill.lobby.find((entry) => entry.clubId === club.clubId);
  const demandAlignment = law.demandId && club.demands.includes(law.demandId);
  const chance =
    50 +
    (club.support - 50) * 0.48 +
    (law.blocReaction[club.bloc] || 0) +
    (demandAlignment ? 7 : -2) +
    (lobby?.votingBonus || 0);
  return clamp(Math.round(chance), 5, 97);
}

function enactLaw(s, p, bill, law, vote) {
  const finance = p.finance;
  p.council.laws[law.id] = {
    lawId: law.id,
    billId: bill.id,
    passedDate: s.date,
    passedSeason: s.seasonNumber,
    constitutional: law.constitutional,
    effect: law.effect,
  };
  switch (law.effect) {
    case "broadcast-equity":
      finance.distributionFormula = {
        performance: 25,
        popularity: 15,
        equality: 60,
      };
      break;
    case "youth-development":
      finance.youthGrantPerSeason = 5_000_000;
      break;
    case "solidarity-fund":
      finance.solidarityPerSeason = 5_000_000;
      break;
    case "financial-disclosure":
    case "club-ownership-register":
      finance.publicDisclosure = true;
      break;
    case "independent-audit":
      finance.auditMandate = true;
      break;
    case "two-term-limit": {
      p.council.constitution.termLimit = 2;
      if (p.campaign.active && p.office.termsServed >= 2)
        p.campaign.playerEligible = false;
      p.council.constitution.amendments.push({
        lawId: law.id,
        billId: bill.id,
        date: s.date,
        yesWeight: vote.yesWeight,
        totalWeight: vote.totalWeight,
      });
      break;
    }
    default:
      // Sporting articles become active catalogue entries for the competitions group.
      break;
  }
  for (const promise of p.campaign.promises || []) {
    if (
      promise.status === "pending" &&
      law.demandId &&
      promise.demandId === law.demandId
    ) {
      promise.status = "fulfilled";
      promise.fulfilledDate = s.date;
      promise.fulfilledByBill = bill.id;
      adjustClubSupport(s, promise.clubId, 6, "campaign-promise-fulfilled");
    }
  }
}

function applyClubReactions(s, law, passed) {
  const p = ensurePolitics(s);
  for (const club of p.clubs) {
    const policyMood = law.blocReaction[club.bloc] || 0;
    const demandMatch = law.demandId && club.demands.includes(law.demandId);
    const delta = passed
      ? Math.round(policyMood / 3) + (demandMatch ? 2 : -1)
      : Math.round(-policyMood / 4) + (demandMatch ? -1 : 1);
    if (delta)
      adjustClubSupport(
        s,
        club.clubId,
        delta,
        `bill:${law.id}:${passed ? "passed" : "rejected"}`,
      );
  }
}

export function resolveBill(s, billId) {
  const { p, bill, law } = currentBill(s, billId);
  const totalWeight = p.clubs.reduce(
    (total, club) => total + club.voteWeight,
    0,
  );
  const ballots = p.clubs.map((club) => {
    const chance = voteChance(p, bill, law, club);
    const roll = fnv(`${s.seed}:${bill.id}:${club.clubId}:${law.id}`) % 100;
    const vote = roll < chance ? "yes" : "no";
    return {
      clubId: club.clubId,
      bloc: club.bloc,
      voteWeight: club.voteWeight,
      vote,
      chance,
      roll,
    };
  });
  const yesWeight = ballots
    .filter((ballot) => ballot.vote === "yes")
    .reduce((total, ballot) => total + ballot.voteWeight, 0);
  const noWeight = totalWeight - yesWeight;
  const threshold = law.constitutional
    ? p.council.constitution.supermajorityThreshold
    : 50;
  const passed = law.constitutional
    ? yesWeight * 100 >= totalWeight * threshold
    : yesWeight * 2 > totalWeight;
  const dissentIds = ballots
    .filter((ballot) => ballot.vote === "no")
    .map((ballot) => ballot.clubId);
  const result = {
    billId: bill.id,
    lawId: law.id,
    date: s.date,
    season: s.seasonNumber,
    passed,
    threshold,
    yesWeight,
    noWeight,
    totalWeight,
    yesShare: Math.round((yesWeight / Math.max(1, totalWeight)) * 1000) / 10,
    dissentIds,
    ballot: ballots,
  };
  bill.status = passed ? "passed" : "rejected";
  bill.outcome = {
    passed,
    date: s.date,
    yesWeight,
    noWeight,
    totalWeight,
    threshold,
    dissentIds,
  };
  p.council.voteLog.push(result);
  if (p.council.voteLog.length > MAX_LOG)
    p.council.voteLog.splice(0, p.council.voteLog.length - MAX_LOG);
  p.council.history.unshift({
    type: "bill",
    billId: bill.id,
    lawId: law.id,
    date: s.date,
    season: s.seasonNumber,
    passed,
    yesWeight,
    noWeight,
    totalWeight,
    dissentIds,
  });
  p.council.history = p.council.history.slice(0, MAX_LOG);
  if (passed) enactLaw(s, p, bill, law, result);
  applyClubReactions(s, law, passed);
  message(s, {
    title: tr(
      passed ? "أقر المجلس اللائحة" : "رفض المجلس اللائحة",
      passed ? "The council passed the law" : "The council rejected the law",
      passed ? "Le conseil a adopté la loi" : "Le conseil a rejeté la loi",
    ),
    body: `${localized(passed ? law.reaction.passed : law.reaction.rejected)} ${tr(
      `صوت بالموافقة ${yesWeight} من أصل ${totalWeight}، وعارضها ${dissentIds.length} نادٍ.`,
      `${yesWeight} of ${totalWeight} weighted votes supported it; ${dissentIds.length} clubs opposed it.`,
      `${yesWeight} voix pondérées sur ${totalWeight} l’ont soutenue ; ${dissentIds.length} clubs s’y sont opposés.`,
    )}`,
    category: "politics",
    kind: "council-vote",
  });
  return result;
}

export function lawStatus(s, lawId) {
  const p = ensurePolitics(s);
  const law = POLITICAL_LAWS[lawId];
  if (!law) return null;
  return {
    law,
    enacted: Boolean(p.council.laws[lawId]),
    current:
      p.council.currentBill?.lawId === lawId ? p.council.currentBill : null,
    history: p.council.history.filter((record) => record.lawId === lawId),
  };
}
