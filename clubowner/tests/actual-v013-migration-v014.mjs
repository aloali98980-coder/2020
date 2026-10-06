import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { advanceTime } from '../src/services/time.js';
import { migrateSave } from '../src/core/migrations.js';
import { validateSave } from '../src/core/validation.js';
import { allFixtures, restGap } from '../src/services/calendar.js';
import { DOMESTIC } from '../src/services/competitions/presets.js';
// Authentic v0.13 full-world save (80 pre-change days, .arena/v013-mid-s1.json.gz).
// 0.14 changes scheduling and prizes by design, so old/new engines are NOT
// byte-identical; this marathon proves the migration loads, finishes the old
// season, plays two full new seasons, and keeps fresh schedules clean.
const load = async () =>
  JSON.parse(
    gunzipSync(await readFile('.arena/v013-mid-s1.json.gz')).toString('utf8'),
  );
const raw = await load();
assert.equal(raw.version, 13);
assert.equal(raw.seasonNumber, 1);
const s1date = raw.date,
  s1players = raw.players.length,
  ids = new Set(raw.players.map((p) => p.id));
const tick = (x) => {
  for (const m of x.inbox) if (m.required) m.status = 'resolved';
  advanceTime(x, 1);
};
const s = migrateSave(raw);
assert.equal(s.version, 14);
assert.equal(raw.version, 13);
assert(s.migrationNote.includes('0.14'));
assert.deepEqual(s.expansion.cups, raw.expansion.cups);
assert.deepEqual(
  s.players.map((p) => [p.id, p.clubId]),
  raw.players.map((p) => [p.id, p.clubId]),
);
// Validate like a production import: restores the own-division aliasing a
// JSON round-trip breaks (rollover depends on it).
validateSave(s);
const scan = (x, onlyFuture) => {
  const byClub = new Map();
  for (const f of allFixtures(x).filter(
    (f) => !onlyFuture || (!f.played && f.date >= x.date),
  ))
    for (const id of [f.home, f.away]) {
      if (!byClub.has(id)) byClub.set(id, []);
      byClub.get(id).push(f);
    }
  let n = 0;
  const samples = [];
  for (const list of byClub.values()) {
    list.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < list.length; i++)
      if (restGap(list[i - 1].date, list[i].date) < 3) {
        n++;
        if (samples.length < 6)
          samples.push(
            `${list[i - 1].id}@${list[i - 1].date} vs ${list[i].id}@${list[i].date}`,
          );
      }
  }
  return { violations: n, samples };
};
const seasonComplete = (x, season) => {
  const h = x.expansion.history.find((h) => h.season === season);
  assert(h, `season ${season} history`);
  for (const p of Object.values(DOMESTIC)) {
    assert(h.cups.some((c) => c.name === p.name && c.winner), p.name);
    assert(h.cups.some((c) => c.name === p.superName && c.winner), p.superName);
  }
};
// Season-1 schedules were baked pre-fix: violations may exist (recorded, the
// bug this phase fixes); nothing is rescheduled mid-season by design.
const before = scan(s, false);
console.log('season-1 baked violations:', before.violations, before.samples);
let guard = 0;
while (s.seasonNumber < 2 && guard++ < 600) {
  tick(s);
  if (guard % 60 === 0) validateSave(s);
}
assert.equal(s.seasonNumber, 2);
validateSave(s);
seasonComplete(s, 1);
assert.equal(
  s.expansion.cups.filter((c) => c.kind === 'domestic').length,
  50,
);
// Fresh season-2 schedules (post-fix code) must be violation-free.
const after = scan(s, true);
console.log('season-2 fresh violations:', after.violations);
assert.equal(after.violations, 0);
// Honours-fed season-2 access: last season's regional results feed the Cup.
const cc = s.expansion.cups.find((c) => c.kind === 'concacaf');
assert(cc.qualification.some((q) => q.reason === 'regional-champion'));
assert(cc.qualification.some((q) => q.reason === 'regional-qualifier'));
// Dynamic mid-season scheduling stays clean too.
for (let i = 0; i < 60; i++) tick(s);
validateSave(s);
assert.equal(scan(s, true).violations, 0);
// Play the whole second season: all fifty cups and supers complete.
guard = 0;
while (s.seasonNumber < 3 && guard++ < 600) {
  tick(s);
  if (guard % 60 === 0) validateSave(s);
}
assert.equal(s.seasonNumber, 3);
validateSave(s);
seasonComplete(s, 2);
assert.equal(
  s.expansion.cups.filter((c) => c.kind === 'domestic').length,
  50,
);
assert.equal(scan(s, true).violations, 0);
const retained = s.players.filter((p) => ids.has(p.id)).length;
assert.equal(retained, ids.size);
const result = {
  passed: true,
  authenticSourceVersion: '0.13.0',
  s1date,
  s1players,
  bakedS1violations: before.violations,
  bakedSamples: before.samples,
  season1CompletedWith50CupsAndSupers: true,
  season2date: s.date,
  honoursFedChampionsCup: true,
  freshS2violations: after.violations,
  season2CompletedWith50CupsAndSupers: true,
  freshS3violations: 0,
  playersRetained: retained,
};
await writeFile(
  'review/actual-v013-migration-v014.json',
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
