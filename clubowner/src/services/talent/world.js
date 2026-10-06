import { addDays, daysBetween, random } from "../../core/utils.js";
import { announceRetirement } from "../careers.js";
import { prospect, population, currentClub } from "./state.js";
import { message } from "../inbox.js";
const TARGET = {
  GK: 2,
  CB: 4,
  RB: 2,
  LB: 2,
  DM: 2,
  CM: 3,
  AM: 2,
  LW: 2,
  RW: 2,
  ST: 3,
};
export function worldTalentDay(s) {
  const w = s.talent?.world;
  if (
    !w?.enabled ||
    w.lastMonth === s.date.slice(0, 7) ||
    !s.date.endsWith("-01")
  )
    return;
  w.lastMonth = s.date.slice(0, 7);
  const clubs = s.expansion.divisions
    .filter((d) => s.leagues.includes(d.country))
    .flatMap((d) => d.clubs)
    .filter((id) => id !== s.clubId);
  if (!clubs.length) return;
  const squads = new Map(clubs.map((id) => [id, []])),
    free = [];
  for (const p of s.players) {
    if (p.status === "retired") continue;
    if (squads.has(p.clubId)) squads.get(p.clubId).push(p);
    if (p.clubId === "لاعب حر") {
      p.freeSince ??= s.date;
      if (!p.loan && !p.retirementPlan) free.push(p);
    } else if (p.freeSince) p.freeSince = undefined;
  }
  // 0.20: the monthly cap on arrivals scales with the loaded world. A flat 120 was fine for one
  // market but let a 1,900-club world lose more players to retirement than it could replace.
  const maxArrivals = Math.max(120, Math.ceil(clubs.length / 5));
  let arrivals = 0,
    visited = 0;
  const record = (p, type, id) => {
    p.careerHistory.push({ date: s.date, type, clubId: id });
    w.history.unshift({ date: s.date, playerId: p.id, type, clubId: id });
  };
  for (; visited < clubs.length && arrivals < maxArrivals; visited++) {
    const id = clubs[(w.cursor + visited) % clubs.length],
      club = currentClub(s, id),
      squad = squads.get(id);
    const firstTeam = squad
        .map((p) => p.rating)
        .sort((a, b) => b - a)
        .slice(0, 11),
      standard =
        firstTeam.reduce((n, v) => n + v, 0) / Math.max(1, firstTeam.length);
    for (const p of squad) {
      if (p.loan || p.age >= 26 || p.injuryUntil >= s.date || random(s) > 0.6)
        continue;
      const gain = Math.max(
        0,
        Math.min(
          0.3,
          p.potential - p.rating,
          (0.07 + club.overall / 800) *
            (p.age <= 20 ? 1.3 : 1) *
            (p.rating < standard - 10 ? 0.65 : 1),
        ),
      );
      p.rating = Math.round((p.rating + gain) * 1000) / 1000;
      for (const k of Object.keys(p.attributes))
        p.attributes[k] =
          Math.round(Math.min(99, p.attributes[k] + gain) * 1000) / 1000;
      p.value = Math.round(p.value * (1 + gain / 50));
    }
    for (const p of [...squad]) {
      if (p.loan || p.contractEnd > addDays(s.date, 30)) continue;
      const cost = p.salary;
      if (
        p.age < 35 &&
        !p.retirementPlan &&
        p.rating >= club.overall - 22 &&
        (s.expansion.budgets[id] || 0) >= cost
      ) {
        s.expansion.budgets[id] -= cost;
        p.contractEnd = addDays(s.date, 730);
        record(p, "ai-renewal", id);
        w.renewed++;
      } else if (p.contractEnd < s.date) {
        p.clubId = "لاعب حر";
      p.clubName = "لاعب حر";
        p.value = 0;
        record(p, "contract-expired", id);
        squad.splice(squad.indexOf(p), 1);
        if (!p.retirementPlan) free.push(p);
      }
    }
    for (let n = 0; n < 3 && squad.length < 22 && arrivals < maxArrivals; n++) {
      const counts = Object.fromEntries(
        Object.keys(TARGET).map((k) => [
          k,
          squad.filter((p) => p.position === k).length,
        ]),
      );
      const position = Object.keys(TARGET).sort(
        (a, b) =>
          (b === "GK" && !counts[b] ? 20 : TARGET[b] - counts[b]) -
          (a === "GK" && !counts[a] ? 20 : TARGET[a] - counts[a]),
      )[0];
      let p = free.find(
        (p) =>
          p.clubId === "لاعب حر" &&
          p.position === position &&
          p.league === club.country &&
          p.age <= 31 &&
          p.rating >= club.overall - 22 &&
          p.rating <= club.overall + 12 &&
          p.salary <= (s.expansion.budgets[id] || 0),
      );
      let type = "ai-free-signing";
      if (!p) {
        if (population(s) >= 50000) {
          if (!w.limitNotice) {
            w.limitNotice = true;
            message(s, {
              title: "العالم بلغ حد سجلات اللاعبين",
              body: "توقف إدخال لاعبين جدد عند 50 ألف سجل. الأسماء والتاريخ لم تُحذف؛ أندية الكمبيوتر تواصل البحث عن لاعبين أحرار. هذا حد للنسخة وليس ضمانًا لمحاكاة عقود غير محدودة.",
              category: "club",
            });
          }
          break;
        }
        p = prospect(s, id, position);
        type = "ai-academy";
        if (p.salary > (s.expansion.budgets[id] || 0)) break;
        s.players.push(p);
        w.created++;
      } else w.recruited++;
      s.expansion.budgets[id] -= p.salary;
      p.clubId = id;
      p.clubName = club.name;
      p.contractEnd = addDays(s.date, 730);
      p.contractTerms = {
        appearanceBonus: 0,
        goalBonus: 0,
        annualRaisePct: 0,
        releaseClause: 0,
        signedOn: s.date,
        lastRaiseYear: s.date.slice(0, 4),
        reviewed: true,
      };
      p.role = "مداورة";
      record(p, type, id);
      squad.push(p);
      arrivals++;
    }
  }
  w.cursor = (w.cursor + visited) % clubs.length;
  w.history = w.history.slice(0, 100);
  // 0.20: unattached players do not wait for a club forever. Older free agents call time on
  // their careers after a few months without offers, younger ones after two years, which keeps
  // the active population level instead of drifting towards the 50,000-record ceiling.
  for (const p of free) {
    if (p.clubId !== "لاعب حر" || p.retirementPlan || !p.freeSince) continue;
    const months = daysBetween(p.freeSince, s.date) / 30;
    if (
      (p.age >= 34 && months >= 6) ||
      (p.age >= 30 && months >= 12) ||
      months >= 24
    ) {
      announceRetirement(s, p);
      w.retiredUnattached = (w.retiredUnattached || 0) + 1;
    }
  }
}
