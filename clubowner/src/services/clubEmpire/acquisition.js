import { clamp } from "../../core/utils.js";
import { ensureClubEmpire } from "./state.js";
import { postSigningSurprise } from "./dueDiligence.js";

export const FAN_SACRED_TERMS = Object.freeze(["name", "badge", "city"]);

export function eligibility(s, { sourceVerified = true } = {}) {
  const suspicion = Number(s.blackFiles?.suspicion || 0);
  const reputation = Number(s.reputation || 0);
  const charity = Number(s.empire?.charity?.total || 0);
  const president = Boolean(s.politics?.presidency?.inOffice || s.politics?.president?.active);
  let score = reputation + Math.min(20, charity / 2_000_000) - suspicion * 0.8 - (president ? 18 : 0) + (sourceVerified ? 12 : -50);
  const status = score >= 62 ? "accepted" : score >= 38 ? "conditional" : "rejected";
  return { status, score: Math.round(score), conditions: status === "conditional" ? ["independent-audit", "fan-veto"] : [], scandal: status === "rejected" };
}

export function startNegotiation(s, listingId) {
  const empire = ensureClubEmpire(s);
  const listing = empire.listings.find((x) => x.id === listingId && x.status === "open");
  if (!listing) throw Error("Club is not for sale");
  const deal = { id: `deal-${listing.clubId}-${empire.negotiations.length + 1}`, listingId, round: 0, status: "talks", offers: [], sacredTerms: [...FAN_SACRED_TERMS], leaks: 0 };
  empire.negotiations.push(deal);
  return deal;
}

export function negotiate(s, dealId, offer) {
  const empire = ensureClubEmpire(s);
  const deal = empire.negotiations.find((x) => x.id === dealId);
  const listing = empire.listings.find((x) => x.id === deal?.listingId);
  if (!deal || deal.status !== "talks" || !listing) throw Error("Negotiation unavailable");
  deal.round += 1;
  const cash = Math.max(0, Number(offer.cash) || 0);
  const installments = Math.max(0, Number(offer.installments) || 0);
  const sellOn = clamp(Number(offer.sellOnPercent) || 0, 0, 30);
  const honoraryRole = Boolean(offer.honoraryRole);
  const violated = FAN_SACRED_TERMS.filter((term) => offer.preserve?.[term] === false);
  const effective = cash + installments * 0.82 + (honoraryRole ? listing.askingPrice * 0.025 : 0) + sellOn * listing.askingPrice * 0.004;
  if (deal.round === 2 && effective < listing.askingPrice) { deal.leaks += 1; listing.askingPrice = Math.round(listing.askingPrice * 1.06); }
  const accepted = effective >= listing.askingPrice * (1 - Math.min(0.08, deal.round * 0.015));
  deal.offers.push({ ...offer, cash, installments, sellOnPercent: sellOn, violated, effective, accepted, date: s.date });
  if (accepted) deal.status = "agreed";
  return deal.offers.at(-1);
}

export function completeAcquisition(s, dealId, options = {}) {
  const empire = ensureClubEmpire(s);
  if (empire.ownedClubs.length >= 5) throw Error("Portfolio limit reached");
  const deal = empire.negotiations.find((x) => x.id === dealId && x.status === "agreed");
  const listing = empire.listings.find((x) => x.id === deal?.listingId);
  if (!deal || !listing) throw Error("No agreed acquisition");
  const gate = eligibility(s, options);
  empire.applications.push({ clubId: listing.clubId, ...gate, date: s.date });
  if (gate.status === "rejected") { s.reputation = clamp(s.reputation - 8, 0, 100); deal.status = "rejected"; return gate; }
  const offer = deal.offers.at(-1);
  if ((s.empire?.personal || 0) < offer.cash) throw Error("Insufficient personal funds");
  s.empire.personal -= offer.cash;
  const club = { clubId: listing.clubId, acquiredOn: s.date, purchasePrice: offer.cash + offer.installments, debt: offer.installments, value: listing.baseValue, ownership: 100, control: true, fanTrust: offer.violated.length ? 20 : 72, promises: [], budget: 0, intervention: 35, objective: "stability", executives: {}, surprises: [] };
  if (offer.violated.length) empire.conflicts.push({ type: "fan-revolt", clubId: club.clubId, terms: offer.violated, boycott: true });
  empire.ownedClubs.push(club); listing.status = "sold"; deal.status = "complete";
  postSigningSurprise(s, club);
  return club;
}

export function launchFirstHundredDays(s, clubId, promises = []) {
  const club = ensureClubEmpire(s).ownedClubs.find((x) => x.clubId === clubId);
  if (!club) throw Error("Club not owned");
  club.promises = promises.map((p) => ({ id: p, kept: null }));
  const plan = { clubId, startedOn: s.date, day: 0, promises: club.promises, auditComplete: false, coachDecision: null, cityReaction: club.fanTrust };
  s.clubEmpire.firstHundredDays.push(plan);
  return plan;
}
