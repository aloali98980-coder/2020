// Extract the delivered FootballClubManager-v0.5-source.zip into .arena/v05-original/ first.
import {createGame} from '../.arena/v05-original/FootballClubManager/src/core/game.js';
import {migrateSave} from '../src/core/migrations.js';
import {validateSave} from '../src/core/validation.js';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const old=createGame({database:'world',expanded:true,leagues:['eg','en']}),before=JSON.parse(JSON.stringify(old)),next=migrateSave(before);validateSave(next);for(const key of ['players','finance','fixtures','table'])assert.deepEqual(next[key],before[key]);assert.deepEqual(next.expansion.divisions,before.expansion.divisions);assert.deepEqual(next.expansion.cups,before.expansion.cups);assert.equal(next.management.marketMode,'legacy');assert.equal(next.management.tactics.enabled,false);assert.equal(next.expansion.promotionVersion,0);writeFileSync('review/actual-v05-migration-v06.json',JSON.stringify({passed:true,source:5,destination:6,playersUnchanged:true,financeUnchanged:true,divisionsAndCupsUnchanged:true,market:'legacy-open',tactics:'opt-in',egyptPyramid:'old-membership-retained'},null,2));
