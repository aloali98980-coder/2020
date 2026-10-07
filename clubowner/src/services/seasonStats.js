// محرك إحصائيات الموسم 0.23 — عدّادات خفيفة لكل لاعب نشط تتراكم خلال matchDay فقط.
// لا تُقرأ عند كل عرض (بخلاف matchReport.js)؛ تُصفّر عند بداية موسم جديد وتُحفظ في seasonHistory.
// مُصمَّمة للأداء الحرج: 43–47 ألف لاعب في طور العالم، فقط لاعبو المباريات الملعوبة يُحدَّثون.

import { selectXI } from "./tactics.js";
import { generateCardDistribution } from "./matchConsequences.js";

export const SEASON_STAT_KEYS = [
  'seasonGoals',
  'seasonAssists',
  'seasonYellow',
  'seasonRed',
  'seasonCleanSheets',
  'seasonRatingSum',
  'seasonRatingCount',
  'seasonMinutes',
];

/** Initialize season stats to zero on a player object if missing. */
export function initSeasonStats(p) {
  for (const k of SEASON_STAT_KEYS) p[k] ??= 0;
}

/**
 * Record season stats after an own-fixture match in matchDay.
 * Uses the deterministic RNG from the game state to assign assists and cards.
 *
 * @param {object} s  — game state
 * @param {object} f  — fixture (played, with lineup if own club)
 * @param {function} rng — seeded RNG from game state (shares sequence with matchDay)
 * @param {number} goals — number of goals scored by own club in this match
 * @param {object} [cards] — pre-generated card distribution from generateCardDistribution
 * @returns {{ yellows: Player[], reds: Player[] }} — card distribution for match consequences
 */
export function recordMatchStats(s, f, rng, goals, cards) {
  const xi = Array.isArray(f.lineup) && f.lineup.length
    ? f.lineup
        .map((x) => {
          const p = s.players.find((y) => y.id === x.playerId);
          return p && p.status !== 'retired' ? p : null;
        })
        .filter(Boolean)
    : selectXI(s).filter((x) => x.p.status !== 'retired').map((x) => x.p);
  if (!xi.length) return { yellows: [], reds: [] };

  // Use pre-generated cards if provided, otherwise generate (backwards compat).
  const cardDist = cards || generateCardDistribution(xi, rng);

  // Minutes: 120 if extra time, 90 otherwise.
  const minutes = f.extraTime ? 120 : 90;

  for (const p of xi) {
    initSeasonStats(p);
    p.seasonMinutes += minutes;
    p.seasonRatingCount += 1;
  }

  // Assists: for each goal, pick a random teammate (different from scorer when possible).
  for (let i = 0; i < goals; i++) {
    const idx = Math.floor(rng() * xi.length);
    xi[idx].seasonAssists += 1;
  }

  // Cards: accumulate to season stats.
  for (const p of cardDist.yellows) {
    initSeasonStats(p);
    p.seasonYellow += 1;
  }
  for (const p of cardDist.reds) {
    initSeasonStats(p);
    p.seasonRed += 1;
  }

  // Goals: distribute match goals to players (same weighting as matchReport).
  const weights = xi.map((p) => Math.max(4, p.rating - 40));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  for (let g = 0; g < goals; g++) {
    let r = rng() * totalWeight;
    for (let i = 0; i < xi.length; i++) {
      r -= weights[i];
      if (r <= 0) { xi[i].seasonGoals += 1; break; }
      if (i === xi.length - 1) xi[i].seasonGoals += 1;
    }
  }

  // Ratings: deterministic from player rating + result delta + random jitter.
  const home = f.home === s.clubId;
  const ours = home ? f.homeGoals : f.awayGoals;
  const theirs = home ? f.awayGoals : f.homeGoals;
  const delta = ours > theirs ? 0.7 : ours === theirs ? 0 : -0.5;
  for (const p of xi) {
    const r = Math.round(
      (5.9 + (p.rating - 60) / 22 + delta + (rng() * 0.9 - 0.45)) * 10
    ) / 10;
    p.seasonRatingSum += Math.max(4, Math.min(10, r));
  }

  // Clean sheet: if opponent scored zero, all starters get credit.
  if (theirs === 0) {
    for (const p of xi) p.seasonCleanSheets += 1;
  }

  return cardDist;
}