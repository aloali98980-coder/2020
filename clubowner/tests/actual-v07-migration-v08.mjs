import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {writeFile} from 'node:fs/promises';
import {createGame} from '../.arena/v07-original/FootballClubManager/src/core/game.js';
import {DIVISIONS} from '../.arena/v07-original/FootballClubManager/src/data/expandedCatalog.js';
import {ALL_MARKETS} from '../src/data/worldMarkets.js';
import {advanceTime as oldAdvance} from '../.arena/v07-original/FootballClubManager/src/services/time.js';
import {advanceTime} from '../src/services/time.js';import {migrateSave} from '../src/core/migrations.js';import {validateSave} from '../src/core/validation.js';
const old=createGame({database:'world',expanded:true,leagues:ALL_MARKETS,clubId:DIVISIONS.find(d=>d.id==='en-4').clubs[0],difficulty:'easy'});
for(let i=0;i<40;i++){for(const m of old.inbox)if(m.required)m.status='resolved';oldAdvance(old,1);}
assert.equal(old.version,7);const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');const before=Object.fromEntries(Object.entries(old).filter(([k])=>!['version','migrationNote'].includes(k)).map(([k,v])=>[k,hash(v)]));
const s=migrateSave(old);validateSave(s);for(const [k,h]of Object.entries(before))assert.equal(hash(s[k]),h,k);assert.equal(s.version,8);assert.equal(s.expansion.promotionVersion,1);assert.equal(migrateSave(s),s);
for(const id of ['en-4','sc-3','sc-4'])assert(s.expansion.divisions.some(d=>d.id===id));
for(let i=0;i<10;i++){for(const m of s.inbox)if(m.required)m.status='resolved';advanceTime(s,1);}validateSave(s);
const result={passed:true,source:'actual delivered 0.7 source ZIP',daysBeforeMigration:40,daysAfterMigration:10,originalVersion:7,version:s.version,allTopLevelFieldsExceptVersionAndMigrationNotePreserved:true,excessLevelsRetained:['en-4','sc-3','sc-4'],oldPromotionVersionRetained:true,players:s.players.length,date:s.date};await writeFile('review/actual-v07-migration-v08.json',JSON.stringify(result,null,2));console.log(result);
