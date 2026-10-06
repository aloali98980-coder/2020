import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';import {gzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
import {createGame} from '../.arena/v08-original/FootballClubManager/src/core/game.js';
import {advanceTime as oldAdvance} from '../.arena/v08-original/FootballClubManager/src/services/time.js';
import {advanceTime} from '../src/services/time.js';import {migrateSave} from '../src/core/migrations.js';import {validateSave} from '../src/core/validation.js';
const old=createGame({database:'world',expanded:true,leagues:['eg'],difficulty:'easy'});
for(let i=0;i<80;i++){for(const m of old.inbox)if(m.required)m.status='resolved';oldAdvance(old,1);}
assert.equal(old.version,8);await writeFile('.arena/actual-v08-mid.json.gz',gzipSync(JSON.stringify(old)));
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');const before=hash(old),s=migrateSave(old);assert.equal(hash(old),before);validateSave(s);assert.equal(s.version,9);assert.equal(s.expansion.competitionVersion,0);assert.equal(s.expansion.promotionVersion,2);assert.equal(migrateSave(s),s);
const normalize=v=>{const q=structuredClone(v);delete q.version;delete q.migrationNote;delete q.expansion.competitionVersion;delete q.expansion.domesticHonours;return q;};assert.equal(hash(normalize(s)),hash(normalize(old)));
for(let i=0;i<10;i++){for(const a of [s,old])for(const m of a.inbox)if(m.required)m.status='resolved';oldAdvance(old,1);advanceTime(s,1);}
assert.equal(hash(normalize(s)),hash(normalize(old)));validateSave(s);
for(let i=0;i<400&&s.seasonNumber===1;i++){for(const m of s.inbox)if(m.required)m.status='resolved';advanceTime(s,1);if(i%30===0)validateSave(s);}
assert.equal(s.seasonNumber,2);assert.equal(s.expansion.competitionVersion,1);assert(s.expansion.cups.some(c=>c.kind==='suda'));assert(s.expansion.history[0].cups.some(c=>c.name==='CAF Champions League'&&c.format.includes('مبسّط')));validateSave(s);
const report={passed:true,source:'actual delivered 0.8 source ZIP',daysBeforeMigration:80,oldCupsAndEveryPriorFieldPreserved:true,tenDaysByteIdenticalToOldEngineExceptMigrationMetadata:true,oldInputNotMutated:true,nextSeasonOptIn:true,oldCupHistoryPreserved:true,version:s.version,date:s.date,players:s.players.length};await writeFile('review/actual-v08-migration-v09.json',JSON.stringify(report,null,2));console.log(report);
