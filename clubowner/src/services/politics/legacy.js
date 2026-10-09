import { LEGACY_TITLES } from "../../data/politicsGovernance.js";
import { clamp } from "../../core/utils.js";
import { tr } from "../../i18n/index.js";
import { message } from "../inbox.js";
import { ensurePolitics } from "./state.js";

function nextId(s, prefix) {
  s.nextId = (s.nextId || 0) + 1;
  return `${prefix}-${s.nextId}`;
}

export function recordLegacyDeparture(s, reason = "election-loss") {
  const p = ensurePolitics(s);
  const startSeason = p.office.termStartSeason;
  if (!Number.isSafeInteger(startSeason) || p.office.termsServed < 1)
    return null;
  const existing = p.legacy.departures.find(
    (entry) =>
      entry.startedSeason === startSeason &&
      entry.endedSeason === s.seasonNumber &&
      entry.reason === reason,
  );
  if (existing) return existing;
  const integrityScore = clamp(Math.round(p.integrity.score), 0, 100);
  const legitimacy = clamp(Math.round(p.legitimacy), 0, 100);
  const legacyScore = Math.round(integrityScore * 0.55 + legitimacy * 0.45);
  const lawsPassed = p.council.history.filter((entry) => entry.passed).length;
  const cleanAudits = p.finance.audits.filter(
    (entry) => entry.status === "clean",
  ).length;
  const titleId =
    integrityScore < 30 || legacyScore < 35
      ? "disgraced"
      : legacyScore >= 82 && integrityScore >= 75
        ? "statesperson"
        : lawsPassed >= 2 && integrityScore >= 60
          ? "reformer"
          : legacyScore >= 58
            ? "public-servant"
            : "contested";
  const record = {
    id: nextId(s, "legacy"),
    startedSeason: startSeason,
    endedSeason: s.seasonNumber,
    seasonsServed: Math.max(1, Math.min(20, s.seasonNumber - startSeason + 1)),
    reason,
    integrityScore,
    legitimacy,
    legacyScore,
    lawsPassed,
    cleanAudits,
    titleId,
    date: s.date,
  };
  p.legacy.departures.push(record);
  while (p.legacy.departures.length > 30) p.legacy.departures.shift();
  p.legacy.title = titleId;
  const honours = p.legacy.honours;
  if (
    legacyScore >= 82 &&
    integrityScore >= 75 &&
    !honours.some((entry) => entry.id === "trusted-statesperson")
  )
    honours.push({
      id: "trusted-statesperson",
      titleId: "statesperson",
      date: s.date,
      score: legacyScore,
    });
  if (
    lawsPassed >= 3 &&
    integrityScore >= 60 &&
    !honours.some((entry) => entry.id === "institutional-reformer")
  )
    honours.push({
      id: "institutional-reformer",
      titleId: "reformer",
      date: s.date,
      score: legacyScore,
    });
  while (honours.length > 30) honours.shift();
  if (
    p.legacy.trial.status !== "open" &&
    (legacyScore < 35 || integrityScore < 25 || p.integrity.illicitActions >= 3)
  ) {
    const referred = p.integrity.investigations.filter(
      (entry) => entry.status === "referred",
    );
    const charges = referred.flatMap((entry) => entry.findings || []);
    if (!charges.length)
      charges.push({
        code:
          reason === "no-confidence"
            ? "no-confidence-loss"
            : "integrity-review",
        sourceId: record.id,
      });
    p.legacy.trial = {
      status: "open",
      charges: charges.slice(0, 20),
      verdict: null,
      recordId: record.id,
      openedDate: s.date,
      evidenceScore: clamp(
        Math.round((100 - integrityScore + 100 - legacyScore) / 2),
        0,
        100,
      ),
      response: null,
    };
  }
  p.history.unshift({
    type: "legacy-departure",
    date: s.date,
    season: s.seasonNumber,
    reason,
    titleId,
    score: legacyScore,
  });
  p.history = p.history.slice(0, 40);
  return record;
}

export function resolveLegacyTrial(s, response) {
  const p = ensurePolitics(s);
  const trial = p.legacy.trial;
  if (!p.office.held && trial.status !== "open")
    throw new Error(
      tr(
        "لا توجد قضية إرث مفتوحة.",
        "There is no open legacy case.",
        "Aucune affaire d’héritage n’est ouverte.",
      ),
    );
  if (trial.status !== "open")
    throw new Error(
      tr(
        "لا توجد قضية إرث مفتوحة.",
        "There is no open legacy case.",
        "Aucune affaire d’héritage n’est ouverte.",
      ),
    );
  if (!["cooperate", "contest"].includes(response))
    throw new Error(
      tr(
        "أسلوب الدفاع غير صالح.",
        "Invalid defense response.",
        "Réponse de défense invalide.",
      ),
    );
  const evidence = clamp(Number(trial.evidenceScore || 0), 0, 100);
  const integrity = clamp(Number(p.integrity.score || 0), 0, 100);
  const cleared =
    response === "cooperate"
      ? evidence <= integrity + 20
      : integrity >= 60 && evidence < 60;
  trial.status = "closed";
  trial.response = response;
  trial.verdict = cleared ? "cleared" : "sanctioned";
  trial.closedDate = s.date;
  if (cleared) {
    p.integrity.score = clamp(p.integrity.score + 5, 0, 100);
    p.integrity.cleanActions++;
    p.legitimacy = clamp(p.legitimacy + 3, 0, 100);
    message(s, {
      title: tr(
        "حُسمت قضية الإرث بالبراءة",
        "Legacy case cleared",
        "Affaire d’héritage classée",
      ),
      body: tr(
        "قُبل تعاونك وسُجل الحكم النهائي في ملف الإرث.",
        "Your response was accepted and the final ruling was added to your legacy record.",
        "Votre réponse est acceptée et le verdict final est inscrit à votre dossier d’héritage.",
      ),
      category: "politics",
    });
  } else {
    p.integrity.score = clamp(p.integrity.score - 18, 0, 100);
    p.integrity.exposed = true;
    p.legitimacy = clamp(p.legitimacy - 12, 0, 100);
    p.legacy.title = "disgraced";
    const record = p.legacy.departures.find(
      (entry) => entry.id === trial.recordId,
    );
    if (record) record.titleId = "disgraced";
    message(s, {
      title: tr(
        "أُدينت في قضية الإرث",
        "Legacy case resulted in a sanction",
        "L’affaire d’héritage aboutit à une sanction",
      ),
      body: tr(
        "خلصت المراجعة إلى وجود مخالفات مؤسسية؛ خُفّضت نزاهتك وشرعيتك وسُجل الحكم في الإرث.",
        "The review found governance violations; integrity and legitimacy fell and the ruling was added to your legacy.",
        "L’examen a constaté des manquements de gouvernance ; intégrité et légitimité diminuent et le verdict figure à votre héritage.",
      ),
      category: "politics",
      priority: "high",
    });
  }
  return trial;
}

export function resignOffice(s) {
  const p = ensurePolitics(s);
  if (!p.office.held)
    throw new Error(
      tr(
        "لست في المنصب حاليًا.",
        "You are not currently in office.",
        "Vous n’êtes pas actuellement en fonction.",
      ),
    );
  if (p.campaign.active)
    throw new Error(
      tr(
        "لا يمكنك الاستقالة أثناء الحملة الانتخابية.",
        "You cannot resign during an active election campaign.",
        "Vous ne pouvez pas démissionner pendant une campagne électorale.",
      ),
    );
  p.office.held = false;
  p.office.lastDeparture = {
    date: s.date,
    season: s.seasonNumber,
    reason: "resignation",
  };
  const record = recordLegacyDeparture(s, "resignation");
  p.election.status = "scheduled";
  p.election.season = Math.max(p.election.season, s.seasonNumber + 1);
  p.legitimacy = clamp(p.legitimacy - 5, 0, 100);
  return record;
}

export function legacyTitle(titleId) {
  return LEGACY_TITLES[titleId] || LEGACY_TITLES.contested;
}
