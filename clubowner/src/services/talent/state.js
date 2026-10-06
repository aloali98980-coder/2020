import { generatedPlayer } from "../../models/generatedPlayers.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { clamp } from "../../core/utils.js";
export const POSITIONS = [
  "GK",
  "CB",
  "RB",
  "LB",
  "DM",
  "CM",
  "AM",
  "LW",
  "RW",
  "ST",
];
const INDEX = {
  GK: 0,
  CB: 2,
  RB: 6,
  LB: 7,
  DM: 9,
  CM: 11,
  AM: 14,
  RW: 15,
  LW: 16,
  ST: 18,
};
export function initTalent(s) {
  if (!s.expansion) return;
  s.talent = {
    schema: 1,
    serial: 0,
    academy: { season: 0, pending: null, candidates: [] },
    scouting: { missions: [], reports: {}, shortlist: [] },
    training: {},
    world: {
      enabled: true,
      lastMonth: null,
      cursor: 0,
      created: 0,
      recruited: 0,
      renewed: 0,
      history: [],
      limitNotice: false,
    },
  };
  s.management.playerRoles ??= {};
}
export function currentClub(s, id) {
  const c = extendedClub(id),
    d = s.expansion.divisions.find((d) => d.clubs.includes(id));
  return {
    ...c,
    tier: d?.tier || c.tier,
    overall: clamp(c.overall + ((c.tier || 1) - (d?.tier || 1)) * 5, 25, 90),
  };
}
export function prospect(s, id, position) {
  const serial = ++s.talent.serial;
  const p = generatedPlayer(
    currentClub(s, id),
    2400000 + serial * 24 + INDEX[position],
    s.date,
    s.seed,
    true,
  );
  p.careerHistory.push({ date: s.date, type: "academy-entry", clubId: id });
  return p;
}
export const population = (s) =>
  s.players.length + (s.talent?.academy.candidates.length || 0);
