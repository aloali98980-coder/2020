// هيئة نزاهة الأسواق الرياضية 0.37 — تدقيق، تحقيقات، غرامات، إيقاف، وفضيحة جنائية.
import { addDays, assert, clamp, uid } from "../../core/utils.js";
import { stockText } from "../../data/stockMarketTexts.js";
import { addSuspicion, ensureBlackFiles } from "../blackFiles.js";
import { ensureEmpire } from "../empire/wealth.js";
import { message } from "../inbox.js";
import { recordLegacyDeparture } from "../politics/legacy.js";
import {
  ensureStockMarket,
  marketDeterministicUnit,
  marketMonth,
} from "./state.js";

export const REGULATORY_FINE_LEVELS = Object.freeze({
  fine: 4_000_000,
  suspension: 12_000_000,
  criminal: 35_000_000,
});

export function combinedMarketExposure(s) {
  const market = ensureStockMarket(s);
  return clamp(
    market.insider.exposure * 0.55 +
      market.manipulation.exposure * 0.65 +
      market.regulator.risk * 0.45,
    0,
    100,
  );
}

function rememberAudit(regulator, audit) {
  regulator.audits.unshift(audit);
  if (regulator.audits.length > 60) regulator.audits.length = 60;
  return audit;
}

export function openMarketInvestigation(
  s,
  { source = "audit", evidence = null, whistleblower = false } = {},
) {
  const market = ensureStockMarket(s);
  const regulator = market.regulator;
  const current = regulator.investigations.find(
    (investigation) => investigation.status === "open",
  );
  if (current) {
    if (evidence != null)
      current.evidence = clamp(
        Math.max(current.evidence, Number(evidence) || 0),
        0,
        100,
      );
    return current;
  }
  const insider = market.insider.exposure;
  const manipulation = market.manipulation.exposure;
  const kind =
    insider >= 25 && manipulation >= 25
      ? "mixed"
      : manipulation > insider
        ? "manipulation"
        : "insider";
  const calculatedEvidence = clamp(
    evidence == null
      ? combinedMarketExposure(s) + (whistleblower ? 24 : 0)
      : Number(evidence),
    5,
    100,
  );
  const investigation = {
    id: uid(s, "market-case"),
    kind,
    source,
    openedOn: s.date,
    dueOn: addDays(s.date, whistleblower ? 12 : 21),
    evidence: Math.round(calculatedEvidence),
    whistleblower,
    response: null,
    status: "open",
    outcome: null,
    fine: 0,
  };
  regulator.investigations.unshift(investigation);
  if (regulator.investigations.length > 40)
    regulator.investigations.length = 40;
  regulator.status = "investigation";
  message(s, {
    title: stockText("regulatorName"),
    body: whistleblower ? stockText("whistleblower") : stockText("auditOpened"),
    category: "events",
    priority: "high",
  });
  return investigation;
}

export function runMarketAudit(
  s,
  { forceDetected = null, source = "scheduled" } = {},
) {
  const market = ensureStockMarket(s);
  const regulator = market.regulator;
  const exposure = combinedMarketExposure(s);
  const suspicion = s.blackFiles?.suspicion || 0;
  const risk = clamp(
    exposure * 0.72 + suspicion * 0.18 + (s.politics?.office?.held ? 8 : 0),
    2,
    98,
  );
  const roll =
    marketDeterministicUnit(
      market,
      `${s.date}:${regulator.audits.length}:regulatory-audit`,
    ) * 100;
  const detected = forceDetected == null ? roll < risk : Boolean(forceDetected);
  const audit = rememberAudit(regulator, {
    id: uid(s, "market-audit"),
    date: s.date,
    month: marketMonth(s.date),
    source,
    risk: Math.round(risk),
    roll: Math.round(roll),
    status: detected ? "investigation" : "clean",
  });
  regulator.nextAudit = addDays(s.date, detected ? 30 : 75);
  regulator.lastAuditMonth = marketMonth(s.date);
  if (detected) {
    audit.investigationId = openMarketInvestigation(s, {
      source,
      evidence: Math.round(risk + (100 - roll) * 0.2),
    }).id;
  } else {
    regulator.risk = clamp(regulator.risk - 14, 0, 100);
    regulator.status = regulator.risk >= 35 ? "watch" : "clear";
    message(s, {
      title: stockText("regulatorName"),
      body: stockText("auditClean"),
      category: "events",
    });
  }
  return audit;
}

function chargePersonalFine(s, fine) {
  const empire = ensureEmpire(s);
  const paid = Math.min(empire.personal, fine);
  empire.personal -= paid;
  empire.monthTrack.expenses += paid;
  if (paid < fine) empire.debt += fine - paid;
  return paid;
}

function removeFromFederationOffice(s) {
  const politics = s.politics;
  if (!politics?.office?.held) return false;
  recordLegacyDeparture(s, "no-confidence");
  politics.office.held = false;
  politics.office.lastDeparture = {
    date: s.date,
    season: s.seasonNumber,
    reason: "no-confidence",
  };
  politics.campaign.active = false;
  politics.election.status = "scheduled";
  politics.election.season = Math.max(
    politics.election.season || 0,
    s.seasonNumber + 1,
  );
  politics.legitimacy = clamp((politics.legitimacy || 50) - 22, 0, 100);
  politics.integrity.score = clamp(
    (politics.integrity?.score || 50) - 30,
    0,
    100,
  );
  message(s, {
    title: stockText("criminalScandal"),
    body: stockText("removedFromOffice"),
    category: "politics",
    priority: "high",
  });
  return true;
}

function inferredOutcome(investigation) {
  if (investigation.evidence >= 82) return "criminal";
  if (investigation.evidence >= 58) return "suspension";
  if (investigation.evidence >= 32) return "fine";
  return "cleared";
}

export function resolveMarketInvestigation(
  s,
  investigationId,
  { outcome = null, forceRemoval = null } = {},
) {
  const market = ensureStockMarket(s);
  const regulator = market.regulator;
  const investigation = regulator.investigations.find(
    (entry) => entry.id === investigationId,
  );
  assert(investigation?.status === "open", stockText("invalidCampaign"));
  const result = outcome || inferredOutcome(investigation);
  assert(
    ["cleared", "fine", "suspension", "criminal"].includes(result),
    stockText("invalidCampaign"),
  );
  investigation.status = "closed";
  investigation.closedOn = s.date;
  investigation.outcome = result;
  let fine = 0;
  let removed = false;
  if (result === "cleared") {
    regulator.risk = clamp(regulator.risk - 22, 0, 100);
    regulator.status = regulator.risk >= 35 ? "watch" : "clear";
  } else {
    fine = REGULATORY_FINE_LEVELS[result];
    investigation.fine = fine;
    chargePersonalFine(s, fine);
    regulator.finesTotal += fine;
    if (result === "fine") {
      addSuspicion(s, 8);
      regulator.risk = clamp(regulator.risk - 8, 0, 100);
      regulator.status = "watch";
    }
    if (result === "suspension") {
      addSuspicion(s, 18);
      regulator.tradingHaltUntil = addDays(s.date, 75);
      regulator.status = "suspended";
    }
    if (result === "criminal") {
      addSuspicion(s, 40);
      const blackFiles = ensureBlackFiles(s);
      blackFiles.scandalCount++;
      blackFiles.history.unshift({
        id: uid(s, "black-market"),
        date: s.date,
        type: "criminal-market-scandal",
        caseId: investigation.id,
        heat: 40,
      });
      regulator.tradingHaltUntil = addDays(s.date, 180);
      regulator.status = "criminal";
      regulator.criminalScandals++;
      const shouldRemove =
        forceRemoval == null
          ? investigation.evidence >= 82
          : Boolean(forceRemoval);
      if (shouldRemove) removed = removeFromFederationOffice(s);
    }
  }
  regulator.nextAudit = addDays(s.date, result === "cleared" ? 90 : 45);
  message(s, {
    title: stockText(
      result === "criminal" ? "criminalScandal" : "regulatorName",
    ),
    body:
      result === "cleared"
        ? stockText("auditClean")
        : result === "fine"
          ? stockText("marketFine")
          : stockText("marketSuspension"),
    category: "events",
    priority: result === "criminal" ? "high" : "normal",
  });
  return { investigation, outcome: result, fine, removed };
}

export function respondToMarketInvestigation(s, investigationId, response) {
  const market = ensureStockMarket(s);
  const investigation = market.regulator.investigations.find(
    (entry) => entry.id === investigationId,
  );
  assert(
    investigation?.status === "open" &&
      ["cooperate", "fight"].includes(response),
    stockText("invalidCampaign"),
  );
  investigation.response = response;
  investigation.evidence = clamp(
    investigation.evidence + (response === "cooperate" ? -18 : 9),
    0,
    100,
  );
  return resolveMarketInvestigation(s, investigationId);
}

export function triggerMarketWhistleblower(s, { force = false } = {}) {
  const market = ensureStockMarket(s);
  const exposure = Math.max(
    market.insider.exposure,
    market.manipulation.exposure,
  );
  if (!force && exposure < 45) return null;
  market.regulator.whistleblowers++;
  market.regulator.risk = clamp(market.regulator.risk + 22, 0, 100);
  return openMarketInvestigation(s, {
    source: "whistleblower",
    evidence: clamp(exposure + 25, 0, 100),
    whistleblower: true,
  });
}

export function marketRegulationDay(s) {
  const market = ensureStockMarket(s);
  const regulator = market.regulator;
  const open = regulator.investigations.find(
    (investigation) => investigation.status === "open",
  );
  if (open && open.dueOn <= s.date)
    return resolveMarketInvestigation(s, open.id);
  const month = marketMonth(s.date);
  if (regulator.lastRiskMonth === month) return null;
  regulator.lastRiskMonth = month;
  const exposure = combinedMarketExposure(s);
  regulator.risk = clamp(
    regulator.risk + Math.round(exposure * 0.08) - (exposure < 15 ? 3 : 0),
    0,
    100,
  );
  if (exposure >= 58) {
    const whistleRoll = marketDeterministicUnit(
      market,
      `${month}:whistleblower`,
    );
    if (whistleRoll < exposure / 180)
      return triggerMarketWhistleblower(s, { force: true });
  }
  if (
    !open &&
    regulator.risk >= 35 &&
    (!regulator.nextAudit || regulator.nextAudit <= s.date)
  )
    return runMarketAudit(s);
  if (!open) regulator.status = regulator.risk >= 35 ? "watch" : "clear";
  return null;
}
