import { clamp } from "../../core/utils.js";
import { ensureClubEmpire } from "./state.js";

const owned = (s, id) => ensureClubEmpire(s).ownedClubs.find((x) => x.clubId === id);
export function setClubManagement(s, clubId, { ceo, coach, budget, intervention, objective }) {
  const club = owned(s, clubId); if (!club) throw Error("Club not owned");
  club.executives = { ceo: ceo || club.executives.ceo || null, coach: coach || club.executives.coach || null };
  club.budget = Math.max(0, Math.round(Number(budget) || 0));
  club.intervention = clamp(Number(intervention) || 0, 0, 100);
  club.objective = ["promotion", "title", "stability"].includes(objective) ? objective : "stability";
  return club;
}
export function investInClub(s, clubId, amount, area = "squad") {
  const club = owned(s, clubId); amount = Math.round(Number(amount));
  if (!club || amount <= 0 || (s.empire?.personal || 0) < amount) throw Error("Invalid investment");
  if (!["squad", "facilities", "academy"].includes(area)) throw Error("Invalid development area");
  s.empire.personal -= amount; club.budget += amount; club.development ??= { squad: 0, facilities: 0, academy: 0 }; club.development[area] += amount;
  club.value += Math.round(amount * (area === "academy" ? 1.15 : 0.9)); return club;
}
export function seasonalReport(s, clubId, performance = 50) {
  const club = owned(s, clubId); if (!club) throw Error("Club not owned");
  const excess = Math.max(0, club.intervention - 65);
  const score = clamp(Number(performance) - excess * 0.65 + Math.min(12, club.budget / 10_000_000), 0, 100);
  const report = { clubId, date: s.date, score: Math.round(score), interventionDamage: Math.round(excess * 0.65), objective: club.objective, majorDecisionRequired: score < 35 };
  s.clubEmpire.reports.unshift(report); return report;
}
export function createNetworkLoan(s, { playerId, fromClubId, toClubId, months = 6, preferredFee = 0 }) {
  const empire = ensureClubEmpire(s);
  if (fromClubId === toClubId || !owned(s, fromClubId) || !owned(s, toClubId)) throw Error("Both clubs must belong to network");
  if (empire.networkLoans.some((x) => x.playerId === playerId && x.status === "active")) throw Error("Player already loaned");
  const loan = { id: `network-loan-${empire.networkLoans.length + 1}`, playerId, fromClubId, toClubId, months, preferredFee, sharedScouting: true, status: "active", date: s.date };
  empire.networkLoans.push(loan); return loan;
}
