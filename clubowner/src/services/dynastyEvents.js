import { addDays, assert, clamp, random, uid } from "../core/utils.js";
import { DYNASTY_EVENTS } from "../data/dynastyEvents.js";
import { isoDate } from "../core/isoDate.js";
import { allDynastyChildren, findDynastyChild } from "./dynasty.js";
import { dynastySiblings } from "./dynastyCareers.js";
import { closeThread, message } from "./inbox.js";

const EVENT_BY_ID = new Map(DYNASTY_EVENTS.map((event) => [event.id, event]));
const BONUS_KEYS = new Set(["playerRelations", "sponsorNegotiation", "clubFame", "autonomy"]);
const meter = (value) => Math.round(clamp(Number(value) || 0, 0, 100) * 100) / 100;

function siblingsOf(s, child) {
  if (!child) return [];
  if (child.parentId) return findDynastyChild(s, child.parentId)?.offspring || [];
  return s.dynasty.children || [];
}

function conditionMatches(s, child, condition) {
  const d = s.dynasty;
  const academy = child?.academy;
  switch (condition) {
    case "owner-married": return Boolean(d.spouse);
    case "young-child": return !!child && child.age >= 4 && child.age <= 12;
    case "school-age": return !!child && child.age >= 6 && child.age <= 13;
    case "shy": return !!child?.traits.includes("shy");
    case "teen": return !!child && child.age >= 13 && child.age <= 17;
    case "academy": return !!academy?.enrolled;
    case "academy-captain": return !!academy?.enrolled && academy.rating >= 65;
    case "academy-unselected": return !!academy?.enrolled && academy.matches.length > 0 && academy.appearances === 0;
    case "trial-ready": return !!academy?.enrolled && academy.trialReady;
    case "academy-injured": return !!academy?.enrolled && isoDate(academy.injuryUntil) && academy.injuryUntil >= s.date;
    case "rebellious": return !!child && (child.traits.includes("rebellious") || child.careerPath === "rebellious");
    case "hardworking": return !!child?.traits.includes("hardworking");
    case "ambitious": return !!child && (child.traits.includes("ambitious") || child.stats.ambition >= 65);
    case "siblings": return siblingsOf(s, child).length >= 2;
    case "heir": return !!child && (child.isHeir || d.heirId === child.id);
    case "nonheir": return !!child && !child.isHeir && d.children.length > 1;
    case "player-path": return child?.careerPath === "player";
    case "business-path": return child?.careerPath === "business";
    case "celebrity-path": return child?.careerPath === "celebrity";
    case "rebellious-path": return child?.careerPath === "rebellious";
    case "low-relationship": return !!child && child.relationship <= 40;
    case "high-relationship": return !!child && child.relationship >= 80;
    case "child-spouse": return !!child?.spouse;
    case "grandparent": return !!child && child.offspring.length > 0;
    case "owner-retirement": return d.owner.age >= d.owner.retirementAge - 3 || d.owner.age >= 75;
    case "owner-health": return d.owner.health <= 55 || d.owner.age >= 75;
    case "club-success": return d.titlesWon > 0 || s.reputation >= 70;
    case "club-pressure": return s.fanSupport <= 50 || s.reputation <= 35;
    case "high-public": return d.publicBalance >= 65;
    case "low-public": return d.publicBalance <= 35;
    case "shirt-sales": return d.shirtSales >= 5000;
    case "high-confidence": return d.fanConfidence >= 70;
    case "low-confidence": return d.fanConfidence <= 35;
    case "financial-pressure": return (s.finance?.cash || 0) < 2_000_000;
    case "financial-strength": return (s.finance?.cash || 0) >= 20_000_000;
    case "multi-generation": return d.generation > 1 || allDynastyChildren(s).some((person) => person.offspring.length > 0);
    case "legal-prelude": return d.legalPrelude?.status !== "none";
    case "many-siblings": return d.children.length >= 3;
    case "owner-business-route": return d.ownerRoute === "business";
    case "high-reputation": return s.reputation >= 70;
    case "academy-mentor": return !!academy?.enrolled && !!academy.mentorId;
    case "adult": return !!child && child.age >= 18;
    case "player-academy-ready": return child?.careerPath === "player" && !!academy?.enrolled && academy.trialReady;
    default: return false;
  }
}

export function eligibleDynastyEvents(s) {
  const d = s.dynasty;
  if (!d) return [];
  const today = s.date;
  const available = [];
  for (const definition of DYNASTY_EVENTS) {
    const cooldown = d.eventCooldowns?.[definition.id];
    if (isoDate(cooldown) && cooldown > today) continue;
    if (definition.target === "owner") {
      if (conditionMatches(s, null, definition.condition))
        available.push({ definition, child: null });
      continue;
    }
    for (const child of allDynastyChildren(s)) {
      if (
        child.age >= definition.ageMin &&
        child.age <= definition.ageMax &&
        conditionMatches(s, child, definition.condition)
      ) {
        available.push({ definition, child });
      }
    }
  }
  return available;
}

export function changePublicBalance(s, delta, source = "family-decision") {
  const d = s.dynasty;
  assert(d && Number.isFinite(delta), "تغيير الرأي العام غير صالح.");
  const before = d.publicBalance;
  const after = meter(before + delta);
  const applied = Math.round((after - before) * 100) / 100;
  if (!applied) return after;
  d.publicBalance = after;
  d.balanceHistory.push({
    date: s.date,
    balance: after,
    delta: applied,
    source: String(source || "family-decision").slice(0, 80),
  });
  if (d.balanceHistory.length > 100) d.balanceHistory.shift();
  return after;
}

export function dynastyEventDay(s) {
  const d = s.dynasty;
  if (!d) return null;
  const today = s.date;
  const month = today.slice(0, 7);
  if (d.events.some((item) => item.status === "open")) return null;
  if (d.lastEventMonth === month) return null;
  d.lastEventMonth = month;
  if (!d.spouse && allDynastyChildren(s).length === 0) return null;
  const candidates = eligibleDynastyEvents(s);
  if (!candidates.length) return null;
  const selected = candidates[Math.floor(random(s) * candidates.length)];
  const id = uid(s, "dynasty-event");
  const record = {
    id,
    type: selected.definition.id,
    date: today,
    status: "open",
    childId: selected.child?.id || null,
    choiceId: null,
    resolvedOn: null,
  };
  d.events.push(record);
  if (d.events.length > 10000) d.events.shift();
  message(s, {
    title: "قرار عائلي ينتظر ردك",
    body: "حدث جديد في مسار الأجيال. افتح شاشة الأجيال لاختيار ردك؛ يتوقف الوقت حتى اتخاذ القرار.",
    category: "management",
    required: true,
    kind: "dynasty-event",
    ref: id,
    priority: "high",
  });
  return record;
}

function applyEventEffects(s, eventRecord, effects) {
  const d = s.dynasty;
  const child = eventRecord.childId ? findDynastyChild(s, eventRecord.childId) : null;
  if (Number.isFinite(effects.balance)) changePublicBalance(s, effects.balance, eventRecord.type);
  const confidenceDelta = (effects.confidence || 0) + (effects.fanConfidence || 0);
  if (confidenceDelta) d.fanConfidence = meter(d.fanConfidence + confidenceDelta);
  if (effects.fanSupport) s.fanSupport = meter((s.fanSupport || 0) + effects.fanSupport);
  if (effects.clubReputation) s.reputation = meter((s.reputation || 0) + effects.clubReputation);
  if (effects.relationship && child)
    child.relationship = meter(child.relationship + effects.relationship);
  if (effects.jealousy && child) child.jealousy = meter(child.jealousy + effects.jealousy);
  if (child && (effects.siblingRelationship || effects.siblingJealousy)) {
    for (const sibling of dynastySiblings(s, child)) {
      if (effects.siblingRelationship)
        sibling.relationship = meter(sibling.relationship + effects.siblingRelationship);
      if (effects.siblingJealousy)
        sibling.jealousy = meter(sibling.jealousy + effects.siblingJealousy);
    }
  }
  if (effects.stats && child)
    for (const [key, delta] of Object.entries(effects.stats))
      if (["talent", "discipline", "ambition"].includes(key) && Number.isFinite(delta))
        child.stats[key] = meter(child.stats[key] + delta);
  if (effects.ownerHealth) d.owner.health = meter(d.owner.health + effects.ownerHealth);
  if (effects.ownerBonus && BONUS_KEYS.has(effects.ownerBonus))
    d.ownerBonuses[effects.ownerBonus] = meter(
      d.ownerBonuses[effects.ownerBonus] + (effects.ownerBonusDelta || 0),
    );
  if (effects.shirtSales)
    d.shirtSales = Math.min(Number.MAX_SAFE_INTEGER, d.shirtSales + Math.max(0, Math.floor(effects.shirtSales)));
  if (effects.titlesWon) d.titlesWon = Math.min(1_000_000, d.titlesWon + Math.max(0, Math.floor(effects.titlesWon)));
}

export function resolveDynastyEvent(s, eventId, choiceId) {
  const d = s.dynasty;
  const record = d?.events.find((item) => item.id === eventId && item.status === "open");
  assert(record, "الحدث العائلي غير مفتوح.");
  const definition = EVENT_BY_ID.get(record.type);
  const choice = definition?.choices.find((item) => item.id === choiceId);
  assert(definition && choice, "اختيار الحدث غير متاح.");
  applyEventEffects(s, record, choice.effects);
  record.status = "resolved";
  record.choiceId = choice.id;
  record.resolvedOn = s.date;
  d.eventCooldowns[definition.id] = addDays(s.date, 180);
  closeThread(s, record.id);
  return record;
}
