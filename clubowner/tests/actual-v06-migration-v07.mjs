import {createGame as oldCreate} from '../.arena/v06-original/FootballClubManager/src/core/game.js';
import {advanceTime as oldAdvance} from '../.arena/v06-original/FootballClubManager/src/services/time.js';
import {migrateSave} from '../src/core/migrations.js';
import {validateSave} from '../src/core/validation.js';
import {advanceTime} from '../src/services/time.js';
import {startIntake} from '../src/services/talent/academy.js';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const old=oldCreate({database:'world',expanded:true,leagues:['eg','en']});for(let i=0;i<40;i++){for(const m of old.inbox)if(m.required)m.status='resolved';oldAdvance(old,1);}const before=JSON.parse(JSON.stringify(old)),next=migrateSave(before);validateSave(next);assert.equal(next.version,7);for(const key of ['players','finance','fixtures','table','expansion'])assert.deepEqual(next[key],before[key]);assert.deepEqual(next.management.tactics,before.management.tactics);assert.deepEqual(migrateSave(next),next);startIntake(next);for(let i=0;i<15;i++){for(const m of next.inbox)if(m.required)m.status='resolved';advanceTime(next,1);}assert(next.talent.academy.candidates.length>0);validateSave(next);await writeFile('review/actual-v06-migration-v07.json',JSON.stringify({passed:true,actualShippedSource:true,oldDays:40,migratedVersion:7,playersFinanceTablesCupsPreserved:true,migrationIdempotent:true,newAcademyAvailableWithoutRestart:true},null,2));
