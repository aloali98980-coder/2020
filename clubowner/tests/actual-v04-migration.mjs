// Requires the delivered 0.4 source extracted into .arena/v04-original/.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { createGame as oldCreate } from "../.arena/v04-original/FootballClubManager/src/core/game.js";
import { advanceTime as oldAdvance } from "../.arena/v04-original/FootballClubManager/src/services/time.js";
import { ALL_MARKETS } from "../src/data/worldMarkets.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { advanceTime } from "../src/services/time.js";
const old = oldCreate({
  database: "world",
  expanded: true,
  leagues: ALL_MARKETS,
  difficulty: "easy",
});
for (let day = 0; day < 90; day++) {
  for (const m of old.inbox) if (m.required) m.status = "resolved";
  oldAdvance(old, 1);
}
const source = JSON.parse(JSON.stringify(old));
const next = migrateSave(source);
validateSave(next);
assert.equal(next.version, 5);
assert.equal(source.version, 4);
assert.deepEqual(next.players, source.players);
assert.deepEqual(next.finance, source.finance);
assert.deepEqual(next.fixtures, source.fixtures);
assert.deepEqual(next.expansion.cups, source.expansion.cups);
assert.deepEqual(next.expansion.divisions, source.expansion.divisions);
assert(
  next.expansion.cups.some(
    (c) => c.id.startsWith("ucl-") && c.results.length && !c.engine,
  ),
);
let days = 0;
while (next.seasonNumber === 1 && days < 450) {
  days++;
  for (const m of next.inbox) if (m.required) m.status = "resolved";
  advanceTime(next, 1);
  if (days % 30 === 0) validateSave(next);
}
assert.equal(next.seasonNumber, 2);
const european = next.expansion.cups.filter((c) => c.engine === "europe-v1");
assert.equal(european.length, 3);
assert(
  european.every(
    (c) =>
      c.entrants.length === 36 && c.qualificationSource === "saved-standings",
  ),
);
for (const c of european)
  for (const q of c.qualification)
    assert.equal(
      next.expansion.qualification[q.country][q.domesticRank - 1],
      q.clubId,
    );
validateSave(next);
const result = {
  passed: true,
  source: "actual shipped 0.4 engine after 90 simulated days",
  from: source.version,
  to: next.version,
  playersAtMigration: source.players.length,
  unchangedAtImport: [
    "all player objects",
    "entire finances",
    "league fixtures",
    "divisions and tables",
    "ongoing cups and results",
  ],
  daysUntilNextSeason: days,
  nextSeasonDate: next.date,
  europaNextSeason: european.map((c) => ({
    kind: c.kind,
    entrants: c.entrants.length,
    source: c.qualificationSource,
  })),
  newQualificationMatchesSavedStandings: true,
};
await writeFile(
  "review/actual-v04-migration.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
