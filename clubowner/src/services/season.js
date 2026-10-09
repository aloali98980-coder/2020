import { fixtures, sortedTable } from "./matches.js";
import { CLUBS } from "../data/catalog.js";
import { message } from "./inbox.js";
import { SEASON_STAT_KEYS, initSeasonStats } from "./seasonStats.js";
import { endSeasonBoardReview, startSeasonMandate } from "./boardMandate.js";

// Save each player's season stats to the history entry before resetting.
function archiveSeasonStats(s, entry) {
  const playerStats = {};
  for (const p of s.players) {
    const stats = {};
    let hasNonZero = false;
    for (const k of SEASON_STAT_KEYS) {
      stats[k] = p[k] ?? 0;
      if (stats[k] !== 0) hasNonZero = true;
    }
    if (hasNonZero) playerStats[p.id] = stats;
  }
  if (Object.keys(playerStats).length > 0) entry.playerStats = playerStats;
}

function resetSeasonStats(s) {
  for (const p of s.players) {
    if (p.status === "retired") continue;
    for (const k of SEASON_STAT_KEYS) p[k] = 0;
    // 0.24: reset per-competition card accumulator at season end.
    p.seasonYellowByComp = 0;
  }
}

export function seasonDay(s) {
  if (s.date < s.nextSeasonDate || s.fixtures.some((f) => !f.played)) return;
  // 0.26: تصويت الجمعية العمومية على موسم انتهى لتوه، قبل أرشفته وقبل تصفير الإحصاءات.
  endSeasonBoardReview(s);
  const entry = {
    number: s.seasonNumber,
    date: s.date,
    table: structuredClone(sortedTable(s)),
  };
  archiveSeasonStats(s, entry);
  s.seasonHistory.push(entry);
  s.seasonNumber++;
  resetSeasonStats(s);
  s.table = CLUBS.map((c) => ({
    clubId: c.id,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    points: 0,
  }));
  s.fixtures = fixtures(s.date).map((f) => ({
    ...f,
    id: `season${s.seasonNumber}-${f.id}`,
  }));
  s.nextSeasonDate = `${Number(s.date.slice(0, 4)) + 1}-07-01`;
  message(s, {
    title: "بداية موسم جديد",
    body: "تم أرشفة الترتيب السابق وإنشاء ١٤ جولة جديدة للدوري التجريبي. اللاعبون والعقود والمنشآت يستمرون؛ لا يوجد صعود أو هبوط في هذه النسخة.",
    category: "matches",
  });
  // لائحة الموسم الجديد تُصدر الآن (وبعد انتهاء التصويت على الموسم الماضي).
  startSeasonMandate(s);
}
