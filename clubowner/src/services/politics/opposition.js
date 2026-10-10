import { addDays, clamp } from "../../core/utils.js";
import { OPPOSITION_RESPONSES } from "../../data/politicsGovernance.js";
import { tr } from "../../i18n/index.js";
import { message } from "../inbox.js";
import { recordLegacyDeparture } from "./legacy.js";
import { ensurePolitics } from "./state.js";

const MAX_MOTIONS = 150;
const monthKey = (date) => String(date || "").slice(0, 7);

function requirePresident(s) {
  const p = ensurePolitics(s);
  if (!p.office.held)
    throw new Error(
      tr(
        "تحتاج إلى ولاية قائمة للرد على المعارضة أو إجراء تصويت الثقة.",
        "You need an active term to answer the opposition or hold a confidence vote.",
        "Vous devez être en fonction pour répondre à l’opposition ou organiser un vote de confiance.",
      ),
    );
  return p;
}

function newId(s, prefix) {
  s.nextId = (s.nextId || 0) + 1;
  return `${prefix}-${s.nextId}`;
}

function appendMotion(s, values) {
  const p = ensurePolitics(s);
  const motion = {
    id: newId(s, "motion"),
    date: s.date,
    season: s.seasonNumber,
    ...values,
  };
  p.opposition.motions.push(motion);
  while (p.opposition.motions.length > MAX_MOTIONS)
    p.opposition.motions.shift();
  return motion;
}

export function oppositionDay(s) {
  const p = ensurePolitics(s);
  const month = monthKey(s.date);
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
    p.opposition.lastActionMonth === month
  )
    return false;
  p.opposition.lastActionMonth = month;
  if (!p.office.held) return false;
  const openReviews = p.integrity.investigations.filter(
    (entry) => entry.status === "open",
  ).length;
  const risk =
    (100 - p.legitimacy) * 0.4 +
    (100 - p.integrity.score) * 0.35 +
    Math.min(20, openReviews * 4);
  const pressureChange =
    risk < 18 ? -3 : risk < 38 ? 0 : Math.ceil((risk - 38) / 11);
  p.opposition.pressure = clamp(p.opposition.pressure + pressureChange, 0, 100);
  const motionState = p.opposition.noConfidence;
  if (["quiet", "failed"].includes(motionState.status)) {
    const cooldownPassed =
      !motionState.lastVoteDate ||
      addDays(motionState.lastVoteDate, 90) <= s.date;
    if (p.opposition.pressure >= 45 && cooldownPassed) {
      const motion = appendMotion(s, {
        type: "no-confidence",
        status: "open",
        trigger: risk >= 65 ? "integrity" : "legitimacy",
        pressure: p.opposition.pressure,
      });
      motionState.status = "open";
      motionState.counter = 0;
      motionState.votes = null;
      motionState.motionId = motion.id;
    }
  }
  if (motionState.status === "open") {
    motionState.counter = clamp(
      motionState.counter + Math.max(4, Math.ceil(p.opposition.pressure / 12)),
      0,
      motionState.threshold,
    );
    if (motionState.counter >= motionState.threshold) {
      motionState.status = "vote-ready";
      const motion = p.opposition.motions.find(
        (entry) => entry.id === motionState.motionId,
      );
      if (motion) motion.status = "vote-ready";
    }
  }
  return true;
}

export function addressOpposition(s, responseId) {
  const p = requirePresident(s);
  if (!Object.hasOwn(OPPOSITION_RESPONSES, responseId))
    throw new Error(
      tr(
        "الرد السياسي غير صالح.",
        "Invalid political response.",
        "Réponse politique invalide.",
      ),
    );
  const month = monthKey(s.date);
  if (p.opposition.lastResponseMonth === month)
    throw new Error(
      tr(
        "سجلت ردًا سياسيًا هذا الشهر بالفعل.",
        "You have already made a public response this month.",
        "Vous avez déjà répondu publiquement ce mois-ci.",
      ),
    );
  let pressureDelta = 0;
  if (responseId === "public-records") {
    p.finance.publicDisclosure = true;
    p.integrity.score = clamp(p.integrity.score + 3, 0, 100);
    p.integrity.cleanActions++;
    p.legitimacy = clamp(p.legitimacy + 4, 0, 100);
    pressureDelta = -12;
  } else if (responseId === "hearing") {
    p.legitimacy = clamp(p.legitimacy + 5, 0, 100);
    pressureDelta = -15;
  } else {
    p.legitimacy = clamp(p.legitimacy - 3, 0, 100);
    p.integrity.score = clamp(p.integrity.score - 8, 0, 100);
    p.integrity.illicitActions++;
    p.integrity.exposed = p.integrity.score < 40;
    pressureDelta = -2;
  }
  p.opposition.pressure = clamp(p.opposition.pressure + pressureDelta, 0, 100);
  p.opposition.lastResponseMonth = month;
  const motion = appendMotion(s, {
    type: "presidential-response",
    responseId,
    status: "published",
    pressureDelta,
    integrityScore: p.integrity.score,
  });
  return motion;
}

export function holdConfidenceVote(s) {
  const p = requirePresident(s);
  const motionState = p.opposition.noConfidence;
  if (motionState.status !== "vote-ready")
    throw new Error(
      tr(
        "لم يصل اقتراح حجب الثقة إلى مرحلة الاقتراع.",
        "The no-confidence motion is not ready for a vote.",
        "La motion de défiance n’est pas encore prête pour un vote.",
      ),
    );
  const totalWeight = p.clubs.reduce((sum, club) => sum + club.voteWeight, 0);
  const oppositionWeight = p.clubs.reduce(
    (sum, club) => sum + (100 - club.support) * club.voteWeight,
    0,
  );
  const confidenceWeight = p.clubs.reduce(
    (sum, club) => sum + club.support * club.voteWeight,
    0,
  );
  const threshold = p.council.constitution.supermajorityThreshold || 67;
  const passed =
    totalWeight > 0 &&
    (oppositionWeight / (totalWeight * 100)) * 100 >= threshold;
  const votes = p.clubs.map((club) => ({
    clubId: club.clubId,
    vote: club.support < 50 ? "no-confidence" : "confidence",
    weight: club.voteWeight,
    support: club.support,
  }));
  const result = {
    date: s.date,
    totalWeight,
    oppositionWeight: Math.round(oppositionWeight / 100),
    confidenceWeight: Math.round(confidenceWeight / 100),
    threshold,
    passed,
    votes,
  };
  motionState.votes = result;
  motionState.lastVoteDate = s.date;
  motionState.status = passed ? "passed" : "failed";
  motionState.counter = 0;
  const motion = p.opposition.motions.find(
    (entry) => entry.id === motionState.motionId,
  );
  if (motion) {
    motion.status = passed ? "passed" : "failed";
    motion.result = result;
  }
  if (passed) {
    p.office.lastDeparture = {
      date: s.date,
      season: s.seasonNumber,
      reason: "no-confidence",
    };
    p.legitimacy = clamp(p.legitimacy - 10, 0, 100);
    recordLegacyDeparture(s, "no-confidence");
    p.office.held = false;
    p.election.status = "scheduled";
    p.election.season = Math.max(p.election.season, s.seasonNumber + 1);
    p.campaign.active = false;
    message(s, {
      title: tr(
        "أقر المجلس حجب الثقة",
        "The assembly passed a no-confidence vote",
        "L’assemblée a voté la défiance",
      ),
      body: tr(
        "انتهت ولايتك قبل موعدها؛ حُفظ التصويت الاسمي ويبدأ مسار انتخابي جديد الموسم القادم.",
        "Your term ended early. The named ballot is preserved and a new election process begins next season.",
        "Votre mandat a pris fin plus tôt. Le scrutin nominatif est conservé et un nouveau processus électoral commencera la saison prochaine.",
      ),
      category: "politics",
      priority: "high",
    });
  } else {
    p.legitimacy = clamp(p.legitimacy + 4, 0, 100);
    p.opposition.pressure = clamp(p.opposition.pressure - 18, 0, 100);
    message(s, {
      title: tr(
        "نجوت من اقتراع الثقة",
        "You survived the confidence vote",
        "Vous avez survécu au vote de confiance",
      ),
      body: tr(
        "رفضت الأغلبية حجب الثقة. سُجلت أسماء المصوتين وستظل المعارضة قادرة على تقديم اقتراح جديد بعد فترة التهدئة.",
        "The majority rejected the motion. Named votes are archived; the opposition may table another motion after the cooling-off period.",
        "La majorité a rejeté la motion. Les votes nominatifs sont archivés ; l’opposition pourra proposer une nouvelle motion après la période de réflexion.",
      ),
      category: "politics",
    });
  }
  appendMotion(s, {
    type: "confidence-result",
    status: passed ? "passed" : "failed",
    result,
  });
  return result;
}
