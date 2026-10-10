import { addDays, clamp } from "../../core/utils.js";
import { INTEGRITY_SUBJECTS } from "../../data/politicsGovernance.js";
import { tr } from "../../i18n/index.js";
import { message } from "../inbox.js";
import {
  chargeGovernanceMission,
  runFinancialAudit,
} from "./associationFinance.js";
import { ensurePolitics } from "./state.js";

const MAX_INVESTIGATIONS = 150;
const monthKey = (date) => String(date || "").slice(0, 7);

function requirePresident(s) {
  const p = ensurePolitics(s);
  if (!p.office.held)
    throw new Error(
      tr(
        "تحتاج إلى ولاية قائمة لإصدار الإقرارات أو فتح مراجعة نزاهة.",
        "You need an active term to file declarations or open an integrity review.",
        "Vous devez être en fonction pour déposer une déclaration ou ouvrir un examen d’intégrité.",
      ),
    );
  return p;
}

function newId(s, prefix) {
  s.nextId = (s.nextId || 0) + 1;
  return `${prefix}-${s.nextId}`;
}

function recordAction(s, type, details = {}) {
  const p = ensurePolitics(s);
  const record = {
    id: newId(s, "integrity"),
    date: s.date,
    season: s.seasonNumber,
    type,
    ...details,
  };
  p.integrity.actions.push(record);
  while (p.integrity.actions.length > 1000) p.integrity.actions.shift();
  return record;
}

export function recordIntegrityConcern(s, type, details = {}) {
  if (typeof type !== "string" || type.length > 60) return null;
  return recordAction(s, type, details);
}

export function submitAssetDeclaration(s) {
  const p = requirePresident(s);
  if (
    p.integrity.assetDeclarations.some(
      (entry) => entry.season === s.seasonNumber,
    )
  )
    throw new Error(
      tr(
        "قدمت إقرار الأصول لهذا الموسم بالفعل.",
        "You have already filed an asset declaration this season.",
        "Vous avez déjà déposé une déclaration de patrimoine cette saison.",
      ),
    );
  const declaration = {
    id: newId(s, "assets"),
    season: s.seasonNumber,
    date: s.date,
    associationBalance: p.finance.balance,
    ledgerRevision: p.finance.ledgerRevision,
    disclosed: true,
  };
  p.integrity.assetDeclarations.push(declaration);
  while (p.integrity.assetDeclarations.length > 100)
    p.integrity.assetDeclarations.shift();
  p.integrity.score = clamp(p.integrity.score + 3, 0, 100);
  p.integrity.cleanActions++;
  p.legitimacy = clamp(p.legitimacy + 2, 0, 100);
  recordAction(s, "asset-declaration", { declarationId: declaration.id });
  return declaration;
}

export function conductIntegrityAudit(s) {
  const p = requirePresident(s);
  const report = runFinancialAudit(s, { force: true });
  p.integrity.lastAudit = {
    reportId: report.id,
    date: report.date,
    season: report.season,
    status: report.status,
    discrepancy: report.discrepancy,
  };
  if (report.status === "clean") {
    p.integrity.score = clamp(p.integrity.score + 5, 0, 100);
    p.integrity.cleanActions++;
    p.legitimacy = clamp(p.legitimacy + 2, 0, 100);
  } else {
    p.integrity.score = clamp(p.integrity.score - 10, 0, 100);
    p.integrity.illicitActions++;
    p.integrity.exposed = true;
    p.opposition.pressure = clamp(p.opposition.pressure + 6, 0, 100);
  }
  recordAction(s, "financial-integrity-audit", {
    reportId: report.id,
    status: report.status,
    discrepancy: report.discrepancy,
  });
  return report;
}

function subjectEvidence(s, subject) {
  const p = ensurePolitics(s);
  const findings = [];
  if (subject === "finance") {
    for (const entry of p.finance.ledger) {
      if (
        entry.type === "council-development-grant" &&
        entry.clubId === s.clubId
      )
        findings.push({
          code: "own-club-grant",
          sourceId: entry.id,
          severity: 20,
        });
    }
    if (p.finance.audits.some((audit) => audit.status === "discrepancy"))
      findings.push({
        code: "ledger-discrepancy",
        sourceId: p.finance.audits.find(
          (audit) => audit.status === "discrepancy",
        ).id,
        severity: 35,
      });
  } else if (subject === "discipline") {
    for (const record of p.committees.discipline.cases) {
      if (
        record.ownClubRuling &&
        ["reduce", "dismiss"].includes(record.verdict)
      )
        findings.push({
          code: "own-club-disciplinary-ruling",
          sourceId: record.id,
          severity: 25,
        });
    }
  } else if (subject === "competitions") {
    for (const tournament of p.committees.competitions.tournaments) {
      if (!tournament.drawAudited && tournament.status === "complete")
        findings.push({
          code: "unaudited-competition-draw",
          sourceId: tournament.id,
          severity: 12,
        });
    }
    if (p.committees.competitions.favoritism >= 20)
      findings.push({
        code: "competition-favoritism",
        sourceId: `favoritism-${s.seasonNumber}`,
        severity: 25,
      });
  } else if (subject === "election") {
    for (const contribution of p.campaign.financing || []) {
      if (contribution.source === "association")
        findings.push({
          code: "public-money-in-campaign",
          sourceId: contribution.id,
          severity: 30,
        });
    }
  }
  const evidenceScore = clamp(
    findings.reduce((sum, finding) => sum + finding.severity, 0),
    0,
    100,
  );
  return { findings, evidenceScore };
}

export function openIntegrityInvestigation(s, subject) {
  const p = requirePresident(s);
  if (!Object.hasOwn(INTEGRITY_SUBJECTS, subject))
    throw new Error(
      tr(
        "موضوع التحقيق غير صالح.",
        "Invalid investigation subject.",
        "Sujet d’enquête invalide.",
      ),
    );
  if (
    p.integrity.investigations.some(
      (entry) => entry.subject === subject && entry.status === "open",
    )
  )
    throw new Error(
      tr(
        "يوجد تحقيق مفتوح في هذا الموضوع.",
        "An investigation into this subject is already open.",
        "Une enquête est déjà ouverte sur ce sujet.",
      ),
    );
  if (p.integrity.investigations.length >= MAX_INVESTIGATIONS)
    throw new Error(
      tr(
        "وصل سجل التحقيقات إلى الحد الأقصى.",
        "The investigation register is full.",
        "Le registre des enquêtes est plein.",
      ),
    );
  const id = newId(s, "review");
  chargeGovernanceMission(s, {
    type: "integrity-investigation",
    amount: 1_000_000,
    referenceId: id,
  });
  const { findings, evidenceScore } = subjectEvidence(s, subject);
  const investigation = {
    id,
    subject,
    date: s.date,
    dueDate: addDays(s.date, 14),
    status: "open",
    evidenceScore,
    findings,
    decision: null,
    reviewedDate: null,
  };
  p.integrity.investigations.push(investigation);
  p.opposition.investigations.push({
    id,
    subject,
    date: s.date,
    status: "open",
  });
  while (p.opposition.investigations.length > MAX_INVESTIGATIONS)
    p.opposition.investigations.shift();
  recordAction(s, "investigation-opened", {
    investigationId: id,
    subject,
    evidenceScore,
  });
  return investigation;
}

export function resolveIntegrityInvestigation(s, investigationId, decision) {
  const p = ensurePolitics(s);
  const investigation = p.integrity.investigations.find(
    (entry) => entry.id === investigationId,
  );
  if (!investigation || investigation.status !== "open")
    throw new Error(
      tr(
        "التحقيق غير موجود أو حُسم بالفعل.",
        "This investigation does not exist or is already resolved.",
        "Cette enquête est introuvable ou déjà résolue.",
      ),
    );
  if (s.date < investigation.dueDate)
    throw new Error(
      `${tr("لا يصدر الحكم قبل", "The review cannot be concluded before", "L’examen ne peut être conclu avant le")} ${investigation.dueDate}.`,
    );
  if (!["clear", "refer"].includes(decision))
    throw new Error(
      tr(
        "قرار التحقيق غير صالح.",
        "Invalid investigation decision.",
        "Décision d’enquête invalide.",
      ),
    );
  const evidenceScore = investigation.evidenceScore;
  investigation.decision = decision;
  investigation.reviewedDate = s.date;
  if (decision === "clear" && evidenceScore <= 20) {
    investigation.status = "cleared";
    p.integrity.score = clamp(p.integrity.score + 6, 0, 100);
    p.integrity.cleanActions++;
    p.legitimacy = clamp(p.legitimacy + 2, 0, 100);
  } else if (decision === "refer" && evidenceScore >= 20) {
    investigation.status = "referred";
    p.integrity.exposed = true;
    p.integrity.score = clamp(p.integrity.score - 5, 0, 100);
    p.opposition.pressure = clamp(p.opposition.pressure + 12, 0, 100);
    p.legacy.trial = {
      status: "open",
      charges: investigation.findings.slice(0, 20),
      verdict: null,
      recordId: investigation.id,
      openedDate: s.date,
      evidenceScore,
      response: null,
    };
  } else {
    investigation.status =
      decision === "clear" ? "obstructed" : "unsubstantiated";
    p.integrity.score = clamp(
      p.integrity.score - (decision === "clear" ? 12 : 7),
      0,
      100,
    );
    p.integrity.illicitActions++;
    p.integrity.exposed = true;
    p.legitimacy = clamp(p.legitimacy - (decision === "clear" ? 8 : 5), 0, 100);
    p.opposition.pressure = clamp(p.opposition.pressure + 8, 0, 100);
  }
  const oppositionRecord = p.opposition.investigations.find(
    (entry) => entry.id === investigation.id,
  );
  if (oppositionRecord) oppositionRecord.status = investigation.status;
  recordAction(s, "investigation-resolved", {
    investigationId,
    decision,
    status: investigation.status,
  });
  message(s, {
    title: tr(
      "اكتملت مراجعة النزاهة",
      "Integrity review completed",
      "Examen d’intégrité terminé",
    ),
    body:
      investigation.status === "cleared"
        ? tr(
            "لم تثبت المخالفة؛ نُشر قرار التبرئة في السجل العام.",
            "No violation was substantiated; the clearance is entered in the public record.",
            "Aucun manquement n’est établi ; la décision de classement est inscrite au registre public.",
          )
        : investigation.status === "referred"
          ? tr(
              "أُحيلت النتائج إلى ملف الإرث للمراجعة النهائية.",
              "The findings were referred for a final legacy review.",
              "Les conclusions sont renvoyées pour un examen final de l’héritage.",
            )
          : tr(
              "أثار القرار اعتراضًا عامًا، وخُفضت مؤشرات النزاهة والشرعية.",
              "The decision drew public concern; integrity and legitimacy fell.",
              "La décision suscite des critiques ; intégrité et légitimité diminuent.",
            ),
    category: "politics",
  });
  return investigation;
}

export function integrityDay(s) {
  const p = ensurePolitics(s);
  const month = monthKey(s.date);
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
    p.integrity.lastReviewMonth === month
  )
    return false;
  p.integrity.lastReviewMonth = month;
  const reviewed = new Set(p.integrity.reviewedEvidenceIds);
  const evidence = [];
  for (const entry of p.finance.ledger) {
    if (
      entry.type === "council-development-grant" &&
      entry.clubId === s.clubId &&
      !reviewed.has(entry.id)
    )
      evidence.push({ id: entry.id, code: "own-club-grant", severity: 8 });
  }
  for (const record of p.committees.discipline.cases) {
    if (
      record.ownClubRuling &&
      ["reduce", "dismiss"].includes(record.verdict) &&
      !reviewed.has(record.id)
    )
      evidence.push({
        id: record.id,
        code: "own-club-disciplinary-ruling",
        severity: 12,
      });
  }
  const cleanDisclosure =
    p.finance.publicDisclosure &&
    (p.integrity.lastAudit?.status === "clean" ||
      p.finance.audits.at(-1)?.status === "clean");
  for (const item of evidence) {
    const severity = cleanDisclosure
      ? Math.ceil(item.severity / 2)
      : item.severity;
    p.integrity.score = clamp(p.integrity.score - severity, 0, 100);
    p.integrity.illicitActions++;
    p.integrity.exposed ||= p.integrity.score < 40;
    p.opposition.pressure = clamp(p.opposition.pressure + 3, 0, 100);
    p.integrity.reviewedEvidenceIds.push(item.id);
    recordAction(s, "conflict-of-interest-reviewed", {
      sourceId: item.id,
      code: item.code,
      severity,
      transparent: cleanDisclosure,
    });
  }
  while (p.integrity.reviewedEvidenceIds.length > 2000)
    p.integrity.reviewedEvidenceIds.shift();
  return evidence.length;
}
