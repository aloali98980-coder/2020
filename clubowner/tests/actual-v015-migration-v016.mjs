import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { advanceTime } from '../src/services/time.js';
import { migrateSave } from '../src/core/migrations.js';
import { validateSave } from '../src/core/validation.js';
import {
  offersFor,
  negotiateSponsor,
  answerSponsorDeal,
  signSponsor,
  resolveSponsor,
} from '../src/services/sponsors.js';
import { setCategoryPrices, setMatchPremium } from '../src/services/commerce.js';
import { renewCoach } from '../src/services/clubManagement.js';
import { ASSETS } from '../src/data/catalog.js';
import { DOMESTIC } from '../src/services/competitions/presets.js';
// Authentic v0.15 full-world save (80 pre-change days, .arena/v015-mid-s1.json.gz).
// Proves the v15->v16 migration loads, keeps cups/players, finishes the old
// season, and accepts every 0.16 economy system (negotiation, categories,
// premium, coach contracts) plus background AI moves.
const load = async () =>
  JSON.parse(
    gunzipSync(await readFile('.arena/v015-mid-s1.json.gz')).toString('utf8'),
  );
const raw = await load();
assert.equal(raw.version, 15);
assert.equal(raw.seasonNumber, 1);
const s1date = raw.date,
  s1players = raw.players.length,
  ids = new Set(raw.players.map((p) => p.id));
const tick = (x) => {
  for (const m of x.inbox) if (m.required) m.status = 'resolved';
  advanceTime(x, 1);
};
const s = migrateSave(raw);
assert.equal(s.version, 17);
assert.equal(raw.version, 15);
assert(s.migrationNote.includes('0.16'));
assert.deepEqual(s.expansion.cups, raw.expansion.cups);
assert.deepEqual(
  s.players.map((p) => [p.id, p.clubId]),
  raw.players.map((p) => [p.id, p.clubId]),
);
assert.deepEqual(s.sponsorDeals, []);
assert.equal(s.commerce.matchPremium, 0);
assert.equal(s.management.coach.contractYears, 1);
validateSave(s);
// 0.16 systems work in the migrated save: negotiate a raise and sign it.
s.reputation = 90;
s.press.trust = 80;
const free = ASSETS.find(
  (a) => !s.sponsors.some((c) => c.assetId === a.id && c.status === 'active'),
);
const base = offersFor(s, free.id)[0];
const deal = negotiateSponsor(s, free.id, base.sponsorId, 20);
assert.equal(deal.status, 'accepted');
const contract = signSponsor(s, answerSponsorDeal(s, deal.id, true));
assert.equal(contract.status, 'active');
assert(contract.amount > base.amount);
setCategoryPrices(s, { first: 300, vip: 900 });
setMatchPremium(s, 50);
renewCoach(s, 2);
assert(s.management.coach.contractEnd > s.date);
validateSave(s);
let guard = 0;
while (s.seasonNumber < 2 && guard++ < 600) {
  tick(s);
  if (guard % 60 === 0) validateSave(s);
}
assert.equal(s.seasonNumber, 2);
validateSave(s);
const h1 = s.expansion.history.find((h) => h.season === 1);
assert(h1, 'season 1 history');
for (const p of Object.values(DOMESTIC)) {
  assert(h1.cups.some((c) => c.name === p.name && c.winner), p.name);
  assert(h1.cups.some((c) => c.name === p.superName && c.winner), p.superName);
}
assert.equal(
  s.expansion.cups.filter((c) => c.kind === 'domestic').length,
  50,
);
for (let i = 0; i < 60; i++) tick(s);
validateSave(s);
assert(Number.isFinite(s.finance.cash));
assert(
  s.finance.ledger.every(
    (e) => e.key && e.date && Number.isSafeInteger(e.amount),
  ),
);
const retained = s.players.filter((p) => ids.has(p.id)).length;
assert.equal(retained, ids.size);
const bonuses = s.finance.ledger.filter((e) => e.category === 'sponsor-bonus');
const aiMoves = s.players.filter((p) =>
  (p.careerHistory || []).some((h) => h.type === 'transfer-ai'),
).length;
const result = {
  passed: true,
  authenticSourceVersion: '0.15.0',
  s1date,
  s1players,
  season1CompletedWith50CupsAndSupers: true,
  negotiatedSponsorSigned: contract.sponsorId,
  negotiatedAmount: contract.amount,
  coachContractEnd: s.management.coach?.contractEnd || null,
  rolloverBonusEntries: bonuses.length,
  backgroundAiMoves: aiMoves,
  playersRetained: retained,
};
await writeFile(
  'review/actual-v015-migration-v016.json',
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
