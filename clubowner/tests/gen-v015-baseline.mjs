import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createGame } from '../src/core/game.js';
import { ALL_MARKETS } from '../src/data/worldMarkets.js';
import { advanceTime } from '../src/services/time.js';
import { validateSave } from '../src/core/validation.js';
// Generates an authentic v0.15 full-world mid-season save with the CURRENT
// (pre-0.16) code. Must run BEFORE any 0.15 src change. Used by the
// v015->v016 migration test as the old-engine baseline.
const s = createGame({ database: 'world', expanded: true, leagues: ALL_MARKETS, difficulty: 'easy' });
assert.equal(s.version, 15);
for (let day = 0; day < 80; day++) {
  for (const m of s.inbox) if (m.required) m.status = 'resolved';
  advanceTime(s, 1);
}
assert.equal(s.seasonNumber, 1);
assert.equal(s.expansion.cups.filter((c) => c.kind === 'domestic').length, 50);
assert(s.expansion.cups.every((c) => c.engine || c.id.startsWith('super-')));
validateSave(s);
await mkdir('.arena', { recursive: true });
await writeFile('.arena/v015-mid-s1.json.gz', gzipSync(JSON.stringify(s)));
console.log(JSON.stringify({ date: s.date, players: s.players.length }));
