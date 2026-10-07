import { daysBetween } from "../core/utils.js";
import { initSeasonStats } from "../services/seasonStats.js";
export const activePlayer = (p) => p.status !== "retired";
export const squad = (s) =>
  s.players.filter((p) => p.clubId === s.clubId && activePlayer(p));
export function initializeCareer(p, date) {
  // 0.20: the default ability method is implied by abilityVersion (see models/provenance.js) and
  // is no longer emitted by estimateAbility. Never `delete` a property of a player object here:
  // it drops the object into V8's dictionary mode and doubles the cost of every daily pass.
  p.status ??= "active";
  p.ageReference ??= p.age;
  p.ageReferenceDate ??= date;
  p.birthDate ??= null;
  p.naturalFitness ??= 75;
  p.careerInterest ??= (p.age * 13 + p.rating * 7) % 100;
  p.careerHistory ??= [];
  p.lastAgingMonth ??= date.slice(0, 7);
  p.injuryUntil ??= null;
  p.retirementPlan ??= null;
  p.contractTerms ??= {
    appearanceBonus: 0,
    goalBonus: 0,
    annualRaisePct: 0,
    releaseClause: 0,
    signedOn: date,
    lastRaiseYear: date.slice(0, 4),
  };
  initSeasonStats(p);
  // 0.24: match consequences — form, suspension, card accumulation, form history.
  p.form ??= 0;
  p.suspendedUntil ??= null;
  p.yellowCardSuspensions ??= 0;
  p.seasonYellowByComp ??= 0;
  p.formRatings ??= [];
  return p;
}
// 0.20: allocation-free age computation (the daily tick evaluates it for every player).
// "YYYY-MM-DD" strings compare lexicographically, so the "birthday not yet reached this year"
// test is a plain string comparison of the MM-DD suffix.
export function ageAt(p, date) {
  const b = p.birthDate;
  if (b) {
    const y =
      (date.charCodeAt(0) - 48) * 1000 +
      (date.charCodeAt(1) - 48) * 100 +
      (date.charCodeAt(2) - 48) * 10 +
      (date.charCodeAt(3) - 48);
    const by =
      (b.charCodeAt(0) - 48) * 1000 +
      (b.charCodeAt(1) - 48) * 100 +
      (b.charCodeAt(2) - 48) * 10 +
      (b.charCodeAt(3) - 48);
    let age = y - by;
    for (let i = 5; i < 10; i++) {
      const c = date.charCodeAt(i) - b.charCodeAt(i);
      if (c < 0) return age - 1;
      if (c > 0) return age;
    }
    return age;
  }
  return (
    p.ageReference +
    Math.max(0, Math.floor(daysBetween(p.ageReferenceDate, date) / 365.2425))
  );
}
