// 0.20 — retiree archive.
// Retired players used to stay inside s.players forever with their full record (aging history,
// contract terms, scouting data…). Every daily stage scanned them, they counted against the
// 50,000-player world limit, and after a few seasons they were a growing share of the save.
// They now move to s.retired as compact records that keep everything the UI, the careers system
// (staff candidates reference personId) and the hall of legacy still show.
import { assert } from "../core/utils.js";

export const MAX_RETIRED = 4000;
const KEEP = [
  "id",
  "name",
  "nameLatin",
  "nationality",
  "league",
  "position",
  "age",
  "birthDate",
  "ageEstimated",
  "ageReference",
  "ageReferenceDate",
  "foot",
  "rating",
  "potential",
  "attributes",
  "appearances",
  "goals",
  "internationalCaps",
  "internationalGoals",
  "previousClubId",
  "clubName",
  "retiredOn",
  "contractEnd",
  "careerHistory",
  "legendId",
  "fictional",
  "generated",
  "careerInterest",
  "abilityVersion",
  "abilityMethod",
  "sourceUrl",
  "biographyUrl",
  "sourceStatus",
];

export function retiredRecord(p) {
  const r = {};
  for (const k of KEEP) if (p[k] !== undefined && p[k] !== null) r[k] = p[k];
  r.status = "retired";
  r.clubId = "retired";
  r.salary = 0;
  r.value = 0;
  r.fitness = 0;
  r.morale = p.morale ?? 50;
  r.contractEnd ??= p.retiredOn || null;
  r.retirementPlan = null;
  r.injuryUntil = null;
  r.role = null;
  r.rating = Math.round((p.rating || 0) * 10) / 10;
  if (r.careerHistory && r.careerHistory.length > 40)
    r.careerHistory = [r.careerHistory[0], ...r.careerHistory.slice(-39)];
  return r;
}

// Moves one retired player out of s.players into the archive. The player object must already be
// marked retired (status/clubId/retiredOn) by the caller.
export function archiveRetiree(s, p) {
  assert(p.status === "retired", "لا يمكن أرشفة لاعب غير معتزل.");
  s.retired ??= [];
  if (!s.retired.some((r) => r.id === p.id)) s.retired.push(retiredRecord(p));
  const i = s.players.indexOf(p);
  if (i >= 0) s.players.splice(i, 1);
  if (s.management?.lineup)
    s.management.lineup = s.management.lineup.filter((id) => id !== p.id);
  pruneRetired(s);
}

// Every person id a save may still point at outside s.players: staff candidates, historical
// bids and loan offers, scouting data, legend contracts and world history. The validators require
// these to resolve (players ∪ retired), so the archive never prunes them.
export function referencedPersonIds(s) {
  const ids = new Set();
  for (const c of s.staff || []) ids.add(c.personId);
  const m = s.management;
  if (m) {
    for (const o of m.outgoing || []) ids.add(o.playerId);
    for (const o of m.loanOffers || []) ids.add(o.playerId);
    for (const id of Object.keys(m.playerRoles || {})) ids.add(id);
    for (const id of m.lineup || []) ids.add(id);
  }
  const t = s.talent;
  if (t) {
    for (const id of t.scouting?.shortlist || []) ids.add(id);
    for (const mission of t.scouting?.missions || []) {
      if (mission.playerId) ids.add(mission.playerId);
      for (const id of mission.results || []) ids.add(id);
    }
    for (const id of Object.keys(t.scouting?.reports || {})) ids.add(id);
    for (const id of Object.keys(t.training || {})) ids.add(id);
    for (const h of t.world?.history || []) ids.add(h.playerId);
  }
  for (const c of s.legends?.contracts || []) if (c.playerId) ids.add(c.playerId);
  return ids;
}

// Bounded archive: oldest AI retirees go first; own-club retirees, legends and anyone still
// referenced elsewhere in the save (see referencedPersonIds) stay.
export function pruneRetired(s) {
  const list = s.retired;
  if (!list || list.length <= MAX_RETIRED) return;
  const pinned = referencedPersonIds(s);
  const removable = [];
  for (let i = 0; i < list.length && removable.length < list.length - MAX_RETIRED; i++) {
    const r = list[i];
    if (r.previousClubId === s.clubId || r.legendId || pinned.has(r.id)) continue;
    removable.push(i);
  }
  if (!removable.length) return;
  const drop = new Set(removable);
  s.retired = list.filter((_, i) => !drop.has(i));
}

// Player lookup that also sees the archive (profiles opened from inbox or hall entries).
export function findPerson(s, id) {
  return (
    s.players.find((p) => p.id === id) ||
    (s.retired || []).find((p) => p.id === id) ||
    null
  );
}

export const retiredCount = (s) =>
  (s.retired?.length || 0) + s.players.reduce((n, p) => n + (p.status === "retired" ? 1 : 0), 0);
