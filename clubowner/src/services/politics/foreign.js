import { addDays, clamp } from "../../core/utils.js";
import {
  FOREIGN_ORGANIZATIONS,
  HOSTING_EVENTS,
} from "../../data/politicsGovernance.js";
import { tr } from "../../i18n/index.js";
import { message } from "../inbox.js";
import {
  chargeGovernanceMission,
  creditHostingAward,
} from "./associationFinance.js";
import { ensurePolitics } from "./state.js";

const MAX_FOREIGN_RECORDS = 150;
const MISSION_TYPES = new Set(["dialogue", "youth-exchange", "governance"]);
const monthKey = (date) => String(date || "").slice(0, 7);

function requirePresident(s) {
  const p = ensurePolitics(s);
  if (!p.office.held)
    throw new Error(
      tr(
        "تحتاج إلى ولاية قائمة لإدارة العلاقات الخارجية.",
        "You need an active term to manage foreign relations.",
        "Vous devez être en fonction pour gérer les relations extérieures.",
      ),
    );
  return p;
}

function newId(s, prefix) {
  s.nextId = (s.nextId || 0) + 1;
  return `${prefix}-${s.nextId}`;
}

function appendHistory(p, entry) {
  p.foreign.history.push(entry);
  while (p.foreign.history.length > MAX_FOREIGN_RECORDS)
    p.foreign.history.shift();
}

export function holdDiplomaticMission(
  s,
  organizationId,
  missionType = "dialogue",
) {
  const p = requirePresident(s);
  const organization = FOREIGN_ORGANIZATIONS[organizationId];
  if (!organization || !MISSION_TYPES.has(missionType))
    throw new Error(
      tr(
        "مهمة التمثيل الخارجي غير صالحة.",
        "Invalid diplomatic mission.",
        "Mission diplomatique invalide.",
      ),
    );
  const month = monthKey(s.date);
  if (p.foreign.lastMissionByOrg[organizationId] === month)
    throw new Error(
      tr(
        "أرسلت وفدًا إلى هذه الجهة هذا الشهر.",
        "A delegation has already visited this organisation this month.",
        "Une délégation a déjà visité cette organisation ce mois-ci.",
      ),
    );
  const id = newId(s, "mission");
  const costs = {
    dialogue: 2_000_000,
    "youth-exchange": 3_000_000,
    governance: 2_500_000,
  };
  const relationGains = { dialogue: 4, "youth-exchange": 3, governance: 5 };
  const influenceGains = { dialogue: 2, "youth-exchange": 3, governance: 2 };
  chargeGovernanceMission(s, {
    type: "diplomatic-summit",
    amount: costs[missionType],
    referenceId: id,
  });
  const trustBonus = p.integrity.score >= 70 ? 1 : 0;
  p.foreign.relations[organizationId] = clamp(
    p.foreign.relations[organizationId] +
      relationGains[missionType] +
      trustBonus,
    0,
    100,
  );
  p.foreign.influence = clamp(
    p.foreign.influence + influenceGains[missionType],
    0,
    100,
  );
  p.foreign.lastMissionByOrg[organizationId] = month;
  const record = {
    id,
    organizationId,
    missionType,
    date: s.date,
    cost: costs[missionType],
    relationAfter: p.foreign.relations[organizationId],
    influenceAfter: p.foreign.influence,
  };
  p.foreign.missions.push(record);
  while (p.foreign.missions.length > MAX_FOREIGN_RECORDS)
    p.foreign.missions.shift();
  appendHistory(p, {
    type: "mission-held",
    date: s.date,
    organizationId,
    missionType,
    id,
  });
  return record;
}

export function submitHostingBid(s, eventId) {
  const p = requirePresident(s);
  const event = HOSTING_EVENTS[eventId];
  if (!event)
    throw new Error(
      tr(
        "ملف الاستضافة غير متاح.",
        "The hosting opportunity is unavailable.",
        "L’offre d’accueil n’est pas disponible.",
      ),
    );
  const alreadyActive = p.foreign.hostingBids.some(
    (bid) =>
      bid.eventId === eventId &&
      bid.season === s.seasonNumber &&
      bid.status === "pending",
  );
  if (alreadyActive)
    throw new Error(
      tr(
        "لديك ملف استضافة مفتوح لهذه المنافسة.",
        "A hosting bid for this event is already pending.",
        "Une candidature d’accueil pour cet événement est déjà en cours.",
      ),
    );
  const id = newId(s, "bid");
  chargeGovernanceMission(s, {
    type: "hosting-bid",
    amount: event.bidCost,
    referenceId: id,
  });
  const bid = {
    id,
    eventId,
    organizationId: event.organizationId,
    season: s.seasonNumber,
    submittedDate: s.date,
    dueDate: addDays(s.date, 30),
    bidCost: event.bidCost,
    status: "pending",
    score: null,
    resolvedDate: null,
    award: event.award,
  };
  p.foreign.hostingBids.push(bid);
  while (p.foreign.hostingBids.length > MAX_FOREIGN_RECORDS)
    p.foreign.hostingBids.shift();
  appendHistory(p, {
    type: "hosting-bid-filed",
    date: s.date,
    bidId: id,
    eventId,
    organizationId: event.organizationId,
  });
  return bid;
}

export function secureExecutiveSeat(s, organizationId) {
  const p = requirePresident(s);
  const organization = FOREIGN_ORGANIZATIONS[organizationId];
  if (!organization)
    throw new Error(
      tr(
        "الجهة الدولية غير معروفة.",
        "Unknown international organisation.",
        "Organisation internationale inconnue.",
      ),
    );
  if (
    p.foreign.executiveSeat &&
    p.foreign.executiveSeat.expiresSeason >= s.seasonNumber
  )
    throw new Error(
      tr(
        "تشغل مقعدًا تنفيذيًا بالفعل.",
        "You already hold an executive seat.",
        "Vous occupez déjà un siège exécutif.",
      ),
    );
  if (
    p.foreign.relations[organizationId] < 70 ||
    p.foreign.influence < 8 ||
    p.integrity.score < 55
  )
    throw new Error(
      tr(
        "تحتاج إلى علاقة أقوى ونفوذ ونزاهة كافية للترشح للمقعد.",
        "Stronger relations, influence and integrity are required for a seat.",
        "Des relations, une influence et une intégrité plus fortes sont nécessaires.",
      ),
    );
  const id = newId(s, "seat");
  chargeGovernanceMission(s, {
    type: "executive-seat",
    amount: 4_000_000,
    referenceId: id,
  });
  p.foreign.influence = clamp(p.foreign.influence - 8, 0, 100);
  p.foreign.executiveSeat = {
    id,
    organizationId,
    acquiredDate: s.date,
    expiresSeason: s.seasonNumber + 4,
  };
  p.legitimacy = clamp(p.legitimacy + 2, 0, 100);
  appendHistory(p, {
    type: "executive-seat-won",
    date: s.date,
    organizationId,
    id,
  });
  return p.foreign.executiveSeat;
}

export function foreignDay(s) {
  const p = ensurePolitics(s);
  let changed = false;
  for (const bid of p.foreign.hostingBids) {
    if (bid.status !== "pending" || s.date < bid.dueDate) continue;
    const event = HOSTING_EVENTS[bid.eventId];
    const relation = p.foreign.relations[bid.organizationId] || 0;
    const score = Math.round(
      relation * 0.45 +
        p.integrity.score * 0.3 +
        p.legitimacy * 0.15 +
        Math.min(100, p.foreign.influence * 2) * 0.1,
    );
    const won = score >= event.threshold;
    bid.score = score;
    bid.status = won ? "awarded" : "declined";
    bid.resolvedDate = s.date;
    if (won) {
      creditHostingAward(s, {
        bidId: bid.id,
        organizationId: bid.organizationId,
        amount: event.award,
      });
      p.foreign.relations[bid.organizationId] = clamp(relation + 4, 0, 100);
      p.foreign.influence = clamp(p.foreign.influence + 3, 0, 100);
      p.legitimacy = clamp(p.legitimacy + 3, 0, 100);
    } else {
      p.foreign.relations[bid.organizationId] = clamp(relation - 2, 0, 100);
      p.foreign.influence = clamp(p.foreign.influence - 1, 0, 100);
    }
    appendHistory(p, {
      type: won ? "hosting-bid-awarded" : "hosting-bid-declined",
      date: s.date,
      bidId: bid.id,
      eventId: bid.eventId,
      organizationId: bid.organizationId,
      score,
    });
    message(s, {
      title: won
        ? tr(
            "فاز الاتحاد بملف الاستضافة",
            "Association wins hosting bid",
            "La fédération obtient l’accueil",
          )
        : tr(
            "لم يفز الاتحاد بملف الاستضافة",
            "Association hosting bid was declined",
            "La candidature d’accueil n’est pas retenue",
          ),
      body: won
        ? `${tr("مُنحت الاستضافة للاتحاد. أُودعت المكافأة في الخزينة:", "Hosting was awarded; the treasury received:", "L’accueil est attribué ; la trésorerie reçoit :")} ${event.award}.`
        : tr(
            "لم تحقق النقاط المطلوبة؛ سُجلت النتيجة وعلاقة الجهة الدولية تعدلت.",
            "The bid did not meet the score threshold; the result and diplomatic relation were recorded.",
            "La candidature n’atteint pas le seuil ; résultat et relation diplomatique sont enregistrés.",
          ),
      category: "politics",
      priority: won ? "normal" : "low",
    });
    changed = true;
  }
  const month = monthKey(s.date);
  if (p.foreign.lastReviewMonth !== month) {
    p.foreign.lastReviewMonth = month;
    if (
      p.foreign.executiveSeat &&
      s.seasonNumber > p.foreign.executiveSeat.expiresSeason
    ) {
      const expired = p.foreign.executiveSeat;
      p.foreign.executiveSeat = null;
      appendHistory(p, {
        type: "executive-seat-expired",
        date: s.date,
        organizationId: expired.organizationId,
        id: expired.id,
      });
      changed = true;
    }
  }
  return changed;
}
