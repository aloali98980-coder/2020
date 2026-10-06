import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createGame } from '../src/core/game.js';
import { ALL_MARKETS } from '../src/data/worldMarkets.js';
import { advanceTime } from '../src/services/time.js';
import { allFixtures, restGap } from '../src/services/calendar.js';
import { validateSave } from '../src/core/validation.js';
import { backupBlob, readBackup, MAX_SAVE_BYTES } from '../src/services/saveCompression.js';
import { DOMESTIC } from '../src/services/competitions/presets.js';
const started = performance.now();
const s = createGame({ database: 'world', expanded: true, leagues: ALL_MARKETS, difficulty: 'easy' });
const initial = s.players.map((p) => p.id),
  sizes = new Map(s.expansion.divisions.map((d) => [d.id, d.clubs.length])),
  closed = new Map(s.expansion.divisions.filter((d) => ['us', 'au', 'mx'].includes(d.country)).map((d) => [d.id, [...d.clubs].sort()]));
let playoffEvidence = [], completed = [];
const fifaEvidence = [], asiaEvidence = [], concacafEvidence = [], domesticEvidence = [];
let midDomestic = false;
const reports = [], daily = [];
await mkdir('.arena/v015', { recursive: true });
for (let day = 0; day < 1250 && s.seasonNumber < 4; day++) {
  const prev = s.seasonNumber, t = performance.now();
  const beforeCups = s.expansion.cups;
  for (const m of s.inbox) if (m.required) m.status = 'resolved';
  advanceTime(s, 1);
  daily.push(performance.now() - t);
  if (day % 30 === 0) { validateSave(s); console.log(s.date, s.seasonNumber, s.players.length, Math.round(performance.now() - started)); }
  if (s.seasonNumber === 1 && !midDomestic && day >= 60) {
    validateSave(s);
    await writeFile('.arena/v015/mid-season.json.gz', gzipSync(JSON.stringify(s)));
    midDomestic = true;
  }
  if (s.seasonNumber === 1) {
    const byClub = new Map();
    for (const f of allFixtures(s)) for (const id of [f.home, f.away]) { if (!byClub.has(id)) byClub.set(id, []); byClub.get(id).push(f); }
    for (const list of byClub.values()) {
      list.sort((a, b) => a.date.localeCompare(b.date));
      for (let i = 1; i < list.length; i++) assert(restGap(list[i - 1].date, list[i].date) >= 3, `Calendar conflict: ${list[i - 1].id}/${list[i].id}`);
    }
    if (s.expansion.playoffs.length) playoffEvidence = s.expansion.playoffs.map((p) => ({ name: p.name, winners: [...p.winners], fixtures: p.fixtures.length, played: p.fixtures.filter((f) => f.played).length }));
    completed = s.expansion.cups.filter((c) => c.engine).map((c) => ({ kind: c.kind, winner: c.winner, fixtures: c.fixtures.length }));
  }
  if (s.seasonNumber > prev) {
    for (const c of beforeCups.filter((c) => c.engine === 'asia-v1')) {
      assert(c.winner);
      assert.equal(c.fixtures.length, c.kind === 'afc' ? 155 : c.kind === 'afc-two' ? 129 : 43);
      assert(s.expansion.asia.honours[c.kind].winner === c.winner);
      asiaEvidence.push({ season: prev, kind: c.kind, matches: c.fixtures.length, winner: c.winner, mainEntrants: c.mainEntrants.length });
    }
    for (const c of beforeCups.filter((c) => c.engine === 'concacaf-v1')) {
      assert(c.winner);
      const n = { concacaf: 51, 'leagues-cup': 62, 'central-american': 58, caribbean: 28 }[c.kind];
      assert.equal(c.fixtures.length, n);
      assert(s.expansion.concacaf.honours[c.kind].winner === c.winner);
      concacafEvidence.push({ season: prev, kind: c.kind, matches: c.fixtures.length, winner: c.winner, entrants: c.entrants.length });
    }
    for (const c of beforeCups.filter((c) => c.engine === 'fifa-v1')) {
      assert(c.winner);
      assert.equal(c.fixtures.length, c.kind === 'clubworld' ? 63 : c.kind === 'intercontinental' ? 5 : 22);
      fifaEvidence.push({ season: prev, kind: c.kind, year: c.editionYear, matches: c.fixtures.length, winner: c.winner });
    }
    const domestic = beforeCups.filter((c) => c.kind === 'domestic' && c.engine === 'continental-v1');
    assert.equal(domestic.length, 50);
    for (const c of domestic) {
      assert(c.winner);
      const extra = ['es', 'it'].includes(c.country) ? 2 : 0;
      assert.equal(c.fixtures.length, c.entrants.length - 1 + extra, c.id);
      assert.equal(c.name, DOMESTIC[c.country].name);
    }
    const supers = beforeCups.filter((c) => c.kind === 'super-domestic');
    assert.equal(supers.length, 50);
    for (const c of supers) {
      assert(c.winner);
      assert.equal(c.entrants.length, ['eg', 'es', 'it', 'sa'].includes(c.country) ? 4 : 2, c.id);
      assert.equal(c.name, DOMESTIC[c.country].superName);
    }
    assert(beforeCups.filter((c) => !c.engine).every((c) => c.id.startsWith('super-uefa')));
    domesticEvidence.push({ season: prev, cups: domestic.length, supers: supers.length, cupMatches: domestic.reduce((n, c) => n + c.fixtures.length, 0) });
    const history = s.expansion.history.at(-1);
    for (const name of ['CAF Champions League', 'CAF Confederation Cup', 'CONMEBOL Libertadores', 'CONMEBOL Sudamericana', 'CONMEBOL Recopa', 'CAF Super Cup', 'CONCACAF Champions Cup', 'Leagues Cup', 'Concacaf Central American Cup', 'Concacaf Caribbean Cup', ...Object.values(DOMESTIC).flatMap((p) => [p.name, p.superName])]) assert(history.cups.some((c) => c.name === name && c.winner), name);
    assert.equal(s.expansion.competitionVersion, 1);
    assert(s.expansion.cups.filter((c) => c.engine === 'continental-v1').every((c) => c.qualificationSource === 'saved-domestic-results'));
    validateSave(s);
    for (const d of s.expansion.divisions) assert.equal(d.clubs.length, sizes.get(d.id));
    for (const [id, clubs] of closed) assert.deepEqual([...s.expansion.divisions.find((d) => d.id === id).clubs].sort(), clubs);
    const ds = new Map(s.expansion.divisions.flatMap((d) => d.clubs.map((id) => [id, d])));
    for (const [id, r] of Object.entries(s.expansion.clubRules)) { assert(ds.get(id).tier >= r.ceilingTier); if (r.parentId) assert(ds.get(id).tier > ds.get(r.parentId).tier); }
    const fresh = new Map();
    for (const f of allFixtures(s).filter((f) => !f.played)) for (const id of [f.home, f.away]) { if (!fresh.has(id)) fresh.set(id, []); fresh.get(id).push(f); }
    let freshViolations = 0;
    for (const list of fresh.values()) { list.sort((a, b) => a.date.localeCompare(b.date)); for (let i = 1; i < list.length; i++) if (restGap(list[i - 1].date, list[i].date) < 3) freshViolations++; }
    assert.equal(freshViolations, 0, `Season ${s.seasonNumber} fresh schedules: ${freshViolations} rest violations`);
    reports.push({ completedSeasons: prev, date: s.date, players: s.players.length, divisions: s.expansion.divisions.length, freshViolations });
  }
}
assert(midDomestic);
assert.equal(s.seasonNumber, 4);
assert.equal(playoffEvidence.length, 2);
assert(playoffEvidence.every((p) => p.winners.length && p.played === p.fixtures));
assert(completed.every((c) => c.winner));
const ids = new Set(s.players.map((p) => p.id));
assert(initial.every((id) => ids.has(id)));
validateSave(s);
assert(Number.isFinite(s.finance.cash));
assert(s.finance.ledger.every((e) => e.key && e.date && Number.isSafeInteger(e.amount)));
const raw = JSON.stringify(s);
assert(Buffer.byteLength(raw) < MAX_SAVE_BYTES);
await writeFile('.arena/full-world-v015-three-seasons.json', raw);
const { blob, extension } = await backupBlob(s);
await writeFile('.arena/full-world-v015-three-seasons' + extension, new Uint8Array(await blob.arrayBuffer()));
assert.equal(await readBackup(blob), raw);
daily.sort((a, b) => a - b);
const result = {
  passed: true, asiaEvidence, concacafEvidence, domesticEvidence, midDomestic, fifaEvidence,
  markets: s.leagues.length, divisions: s.expansion.divisions.length,
  initialPlayers: initial.length, players: s.players.length,
  allInitialIdentitiesRetained: true, reserveConstraintsAfterEveryRollover: true,
  closedMembershipsUnchanged: true, groupSizesPreserved: true,
  dailyCalendarCheckedFirstSeason: true, minimumDateGap: 3, freshRolloverRestClean: true, reports, playoffEvidence, completed,
  bytes: Buffer.byteLength(raw), compressedBytes: blob.size, world: s.talent.world,
  dailyMs: { median: daily[Math.floor(daily.length * 0.5)], p95: daily[Math.floor(daily.length * 0.95)], max: daily.at(-1) },
  elapsedSeconds: (performance.now() - started) / 1000,
};
await writeFile('review/full-world-v015.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
