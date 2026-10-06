import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { advanceTime as oldAdvance } from '../.arena/v012-original/src/services/time.js';
import { validateSave as oldValidate } from '../.arena/v012-original/src/core/validation.js';
import { advanceTime } from '../src/services/time.js';
import { migrateSave } from '../src/core/migrations.js';
import { validateSave } from '../src/core/validation.js';
import { DOMESTIC } from '../src/services/competitions/presets.js';
// Authentic v0.12 full-world save (80 old-engine days, generated pre-change).
// Memory-conscious: at most two full states plus transient strings at any time.
const load = async () => JSON.parse(gunzipSync(await readFile('.arena/v012-mid-s1.json.gz')).toString('utf8'));
let raw = await load();
assert.equal(raw.version, 12);
assert.equal(raw.seasonNumber, 1);
const tick = (x, f) => { for (const m of x.inbox) if (m.required) m.status = 'resolved'; f(x, 1); };
const next = migrateSave(raw);
assert.equal(next.version, 13);
assert.deepEqual(next.expansion.cups, raw.expansion.cups);
assert.equal(next.expansion.cups.filter((c) => !c.engine && c.id.startsWith('cup-')).length, 44);
validateSave(next);
raw = null;
if (global.gc) global.gc();
// Exact 10-day comparison between old and new engines from identical states.
// Both sides are validated first, exactly like a production import: validation
// re-aliases s.fixtures/s.table with the own division's arrays (a JSON
// round-trip breaks that alias), and tick behavior depends on the alias.
const oldState = await load();
oldValidate(oldState);
for (let i = 0; i < 10; i++) { tick(oldState, oldAdvance); tick(next, advanceTime); }
const savedVersion = next.version, savedNote = next.migrationNote;
next.version = 12;
delete next.migrationNote;
// Hash comparison: asserting on 75MB strings/objects directly OOMs the sandbox
// (error formatting) and deepEqual memos blow the heap on graphs this size.
const { createHash } = await import('node:crypto');
const hash = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ha = hash(next);
if (global.gc) global.gc();
const hb = hash(oldState);
if (ha !== hb) {
  const firstDiff = (a, b, path = '$') => {
    if (Object.is(a, b)) return null;
    if (typeof a !== typeof b || !a || !b || typeof a !== 'object') return path;
    if (Array.isArray(a) !== Array.isArray(b)) return path;
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a) && b[k] === undefined) continue;
      if (!(k in b) && a[k] === undefined) continue;
      const d = firstDiff(a[k], b[k], `${path}.${k}`);
      if (d) return d;
    }
    return null;
  };
  console.error('FIRST_DIFF', firstDiff(next, oldState));
}
assert.equal(ha, hb);
next.version = savedVersion;
next.migrationNote = savedNote;
// Finish season 1 under the new engine: legacy cups complete, new supers play.
const ids = new Set(next.players.map((p) => p.id));
for (let i = 0; i < 450 && next.seasonNumber === 1; i++) tick(next, advanceTime);
assert.equal(next.seasonNumber, 2);
validateSave(next);
const season1 = next.expansion.history[0];
assert.equal(season1.season, 1);
for (const p of Object.values(DOMESTIC)) assert(season1.cups.some((c) => c.name === p.superName && c.winner), p.superName);
assert([...ids].every((id) => next.players.some((p) => p.id === id)));
// Rollover upgrade: all fifty domestic cups use the full engine from season 2.
const domestic = next.expansion.cups.filter((c) => c.kind === 'domestic');
assert.equal(domestic.length, 50);
assert(domestic.every((c) => c.engine === 'continental-v1'));
assert.equal(next.expansion.cups.filter((c) => !c.engine && c.id.startsWith('cup-')).length, 0);
assert(next.expansion.cups.filter((c) => c.engine === 'continental-v1').every((c) => c.qualificationSource === 'saved-domestic-results'));
const result = {
  passed: true, authenticSourceVersion: '0.12.0', oldEngineDays: 80,
  identicalComparisonDays: 10, currentCupsUnchanged: true,
  newSupersPlayedInOldSeason: true, fullCupsAtRollover: 50,
  playersAndHistoryRetained: true,
};
await writeFile('review/actual-v012-migration-v013.json', JSON.stringify(result, null, 2));
console.log(result);
