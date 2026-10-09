import { addDays, clamp, random } from "../../core/utils.js";
import { FOREIGN_ORGANIZATIONS } from "../../data/politicsGovernance.js";
import {
  POLITICAL_EVENT_BY_ID,
  POLITICAL_EVENTS,
} from "../../data/politicsEvents.js";
import { getLanguage, tr } from "../../i18n/index.js";
import { message } from "../inbox.js";
import { recordPoliticalEventTransaction } from "./associationFinance.js";
import { ensurePolitics, changeCandidateRelationship } from "./state.js";

const MAX_EVENT_HISTORY = 150;
const monthKey = (date) => String(date || "").slice(0, 7);
const local = (value) => value?.[getLanguage()] || value?.en || "";

function eventScopeEligible(p, event) {
  if (event.scope === "any") return true;
  if (event.scope === "office") return Boolean(p.office.held);
  if (event.scope === "campaign")
    return Boolean(p.campaign.active && p.campaign.playerEligible !== false);
  return false;
}

function rememberEvent(p, record) {
  p.eventState.history.unshift(record);
  while (p.eventState.history.length > MAX_EVENT_HISTORY)
    p.eventState.history.pop();
}

function closeExpired(s) {
  const p = ensurePolitics(s);
  const pending = p.eventState.pending;
  if (!pending || s.date <= pending.expiresDate) return false;
  const event = POLITICAL_EVENT_BY_ID[pending.eventId];
  if (event)
    p.eventState.cooldowns[event.id] = addDays(s.date, event.cooldownDays);
  rememberEvent(p, {
    eventId: pending.eventId,
    choiceId: null,
    date: s.date,
    status: "expired",
  });
  p.eventState.pending = null;
  return true;
}

function notifyEvent(s, event) {
  message(s, {
    title: `${tr("حدث سياسي", "Political event", "Événement politique")}: ${local(event.title)}`,
    body: local(event.prompt),
    category: "politics",
    kind: "info",
    priority: "high",
  });
}

export function openPoliticalEvent(s, eventId) {
  const p = ensurePolitics(s);
  const event = POLITICAL_EVENT_BY_ID[eventId];
  if (!event)
    throw new Error(
      tr(
        "الحدث السياسي غير موجود.",
        "Political event not found.",
        "Événement politique introuvable.",
      ),
    );
  if (p.eventState.pending)
    throw new Error(
      tr(
        "يجب حسم الحدث السياسي المفتوح أولًا.",
        "Resolve the open political event first.",
        "Résolvez d’abord l’événement politique en cours.",
      ),
    );
  if (!eventScopeEligible(p, event))
    throw new Error(
      tr(
        "لا تنطبق شروط هذا الحدث على وضعك السياسي الحالي.",
        "This event does not match your current political status.",
        "Cet événement ne correspond pas à votre situation politique actuelle.",
      ),
    );
  const cooldown = p.eventState.cooldowns[eventId];
  if (cooldown && s.date < cooldown)
    throw new Error(
      tr(
        "لم تنته فترة التهدئة لهذا الحدث بعد.",
        "This event is still in its cooldown period.",
        "La période de repos de cet événement n’est pas terminée.",
      ),
    );
  const pending = {
    eventId,
    createdDate: s.date,
    expiresDate: addDays(s.date, 30),
  };
  p.eventState.pending = pending;
  notifyEvent(s, event);
  return pending;
}

function pickWeighted(s, candidates) {
  const total = candidates.reduce((sum, event) => sum + event.weight, 0);
  let roll = random(s) * total;
  for (const event of candidates) {
    roll -= event.weight;
    if (roll < 0) return event;
  }
  return candidates.at(-1) || null;
}

export function politicalEventDay(s) {
  const p = ensurePolitics(s);
  if (closeExpired(s)) return true;
  if (p.eventState.pending) return false;
  const month = monthKey(s.date);
  if (p.eventState.lastMonth === month) return false;
  p.eventState.lastMonth = month;
  if (random(s) >= 0.62) return false;
  const candidates = POLITICAL_EVENTS.filter((event) => {
    if (!eventScopeEligible(p, event)) return false;
    const cooldown = p.eventState.cooldowns[event.id];
    return !cooldown || s.date >= cooldown;
  });
  const selected = pickWeighted(s, candidates);
  if (!selected) return false;
  openPoliticalEvent(s, selected.id);
  return true;
}

function applyEffects(s, event, selected) {
  const p = ensurePolitics(s);
  const effects = selected.effects || {};
  if (effects.treasury)
    recordPoliticalEventTransaction(s, {
      eventId: event.id,
      direction: effects.treasury.direction,
      amount: effects.treasury.amount,
    });

  p.legitimacy = clamp(p.legitimacy + (effects.legitimacy || 0), 0, 100);
  p.integrity.score = clamp(
    p.integrity.score + (effects.integrity || 0),
    0,
    100,
  );
  p.integrity.cleanActions += effects.cleanActions || 0;
  p.integrity.illicitActions += effects.illicitActions || 0;
  if (effects.illicitActions || p.integrity.score < 40)
    p.integrity.exposed = true;
  if (effects.disclosure !== undefined)
    p.finance.publicDisclosure = effects.disclosure;

  if (effects.oppositionPressure)
    p.opposition.pressure = clamp(
      p.opposition.pressure + effects.oppositionPressure,
      0,
      100,
    );
  if (effects.noConfidence) {
    const confidence = p.opposition.noConfidence;
    confidence.counter = clamp(
      confidence.counter + effects.noConfidence,
      0,
      confidence.threshold,
    );
    if (confidence.counter >= confidence.threshold)
      confidence.status = "vote-ready";
    else if (confidence.counter === 0 && confidence.status === "open")
      confidence.status = "quiet";
  }
  if (effects.influence)
    p.foreign.influence = clamp(
      p.foreign.influence + effects.influence,
      0,
      100,
    );
  if (effects.relation) {
    const { organizationId, delta } = effects.relation;
    if (Object.hasOwn(FOREIGN_ORGANIZATIONS, organizationId))
      p.foreign.relations[organizationId] = clamp(
        p.foreign.relations[organizationId] + delta,
        0,
        100,
      );
  }
  if (effects.support) {
    for (const club of p.clubs)
      if (!effects.support.bloc || club.bloc === effects.support.bloc)
        club.support = clamp(club.support + effects.support.delta, 0, 100);
  }
  if (effects.committeeMorale)
    p.committees.referees.morale = clamp(
      p.committees.referees.morale + effects.committeeMorale,
      0,
      100,
    );
  if (effects.relationship)
    changeCandidateRelationship(
      s,
      effects.relationship.candidateId,
      effects.relationship.delta,
      `political-event:${event.id}`,
    );

  const record = {
    id: `event-${(s.nextId = (s.nextId || 0) + 1)}`,
    date: s.date,
    season: s.seasonNumber,
    type: "political-event-choice",
    eventId: event.id,
    choiceId: selected.id,
  };
  p.integrity.actions.push(record);
  while (p.integrity.actions.length > 1000) p.integrity.actions.shift();
}

export function resolvePoliticalEvent(s, choiceId) {
  const p = ensurePolitics(s);
  const pending = p.eventState.pending;
  const event = POLITICAL_EVENT_BY_ID[pending?.eventId];
  if (!pending || !event)
    throw new Error(
      tr(
        "لا يوجد حدث سياسي ينتظر قرارك.",
        "No political event is waiting for your decision.",
        "Aucun événement politique n’attend votre décision.",
      ),
    );
  if (s.date > pending.expiresDate) {
    closeExpired(s);
    return { expired: true, eventId: event.id };
  }
  const selected = event.choices.find((choice) => choice.id === choiceId);
  if (!selected)
    throw new Error(
      tr(
        "خيار الحدث السياسي غير صالح.",
        "Invalid political-event choice.",
        "Choix d’événement politique invalide.",
      ),
    );

  applyEffects(s, event, selected);
  p.eventState.cooldowns[event.id] = addDays(s.date, event.cooldownDays);
  rememberEvent(p, {
    eventId: event.id,
    choiceId: selected.id,
    date: s.date,
    status: "resolved",
  });
  p.eventState.pending = null;
  message(s, {
    title: local(event.title),
    body: `${local(selected.label)} — ${tr("سُجل القرار وآثاره في الملف السياسي.", "The choice and its effects were added to the political record.", "Le choix et ses effets ont été consignés au dossier politique.")}`,
    category: "politics",
    kind: "success",
  });
  return { eventId: event.id, choiceId: selected.id, expired: false };
}
