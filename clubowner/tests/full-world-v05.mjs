import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { encodeSave } from "../src/services/save.js";
import { createGame } from "../src/core/game.js";
import { ALL_MARKETS } from "../src/data/worldMarkets.js";
import { advanceTime } from "../src/services/time.js";
import { allFixtures, restGap } from "../src/services/calendar.js";
import { validateSave } from "../src/core/validation.js";
const s = createGame({
    database: "world",
    expanded: true,
    leagues: ALL_MARKETS,
    difficulty: "easy",
  }),
  initialIds = s.players.map((p) => p.id);
let completed;
for (let i = 0; i < 410 && s.seasonNumber === 1; i++) {
  for (const m of s.inbox) if (m.required) m.status = "resolved";
  advanceTime(s, 1);
  if (i % 30 === 0) validateSave(s);
  if (s.seasonNumber === 1) {
    const fixtures = allFixtures(s);
    const byClub = new Map();
    for (const f of fixtures)
      for (const id of [f.home, f.away]) {
        if (!byClub.has(id)) byClub.set(id, []);
        byClub.get(id).push(f);
      }
    for (const list of byClub.values()) {
      list.sort((a, b) => a.date.localeCompare(b.date));
      for (let n = 1; n < list.length; n++)
        assert(
          restGap(list[n - 1].date, list[n].date) >= 3,
          `Calendar collision ${list[n - 1].id} / ${list[n].id}`,
        );
    }
    completed = s.expansion.cups
      .filter((c) => c.engine)
      .map((c) => ({
        kind: c.kind,
        phase: c.phase,
        winner: c.winner,
        fixtures: c.fixtures.length,
      }));
  }
}
assert.equal(s.seasonNumber, 2);
assert(completed.every((c) => c.winner));
validateSave(s);
assert(initialIds.every((id) => s.players.some((p) => p.id === id)));
const encoded = encodeSave(s);
const exportBytes = Buffer.byteLength(encoded),
  formattedBytes = Buffer.byteLength(JSON.stringify(s, null, 2));
await writeFile(".arena/full-world-one-season.json", encoded);
assert(exportBytes < 80 * 1024 * 1024);
const result = {
  passed: true,
  markets: s.leagues.length,
  divisions: s.expansion.divisions.length,
  players: s.players.length,
  date: s.date,
  season: s.seasonNumber,
  completed,
  allInitialPlayerIdentitiesRetained: true,
  calendarCheckedEveryDay: true,
  minimumDateGap: 3,
  exportBytesAfterOneSeason: exportBytes,
  oldFormattedBytesAfterOneSeason: formattedBytes,
};
await writeFile("review/full-world-v05.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
