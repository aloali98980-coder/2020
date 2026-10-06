import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createGame} from '../src/core/game.js';
import {ALL_MARKETS} from '../src/data/worldMarkets.js';
import {advanceTime} from '../src/services/time.js';
import {allFixtures,restGap} from '../src/services/calendar.js';
import {validateSave} from '../src/core/validation.js';
import {backupBlob,readBackup,MAX_SAVE_BYTES} from '../src/services/saveCompression.js';
const started=performance.now();
const s=createGame({database:'world',expanded:true,leagues:ALL_MARKETS,difficulty:'easy'});
const initial=s.players.map(p=>p.id),sizes=new Map(s.expansion.divisions.map(d=>[d.id,d.clubs.length])),closed=new Map(s.expansion.divisions.filter(d=>['us','au','mx'].includes(d.country)).map(d=>[d.id,[...d.clubs].sort()]));
let playoffEvidence=[],completed=[];const reports=[],daily=[];
for(let day=0;day<1250&&s.seasonNumber<4;day++){
 const prev=s.seasonNumber,t=performance.now();
 for(const m of s.inbox)if(m.required)m.status='resolved';advanceTime(s,1);daily.push(performance.now()-t);
 if(day%30===0){validateSave(s);console.log(s.date,s.seasonNumber,s.players.length,Math.round(performance.now()-started));}
 if(s.seasonNumber===1){
  const byClub=new Map();for(const f of allFixtures(s))for(const id of [f.home,f.away]){if(!byClub.has(id))byClub.set(id,[]);byClub.get(id).push(f);}
  for(const list of byClub.values()){list.sort((a,b)=>a.date.localeCompare(b.date));for(let i=1;i<list.length;i++)assert(restGap(list[i-1].date,list[i].date)>=3,`Calendar conflict: ${list[i-1].id}/${list[i].id}`);}
  if(s.expansion.playoffs.length)playoffEvidence=s.expansion.playoffs.map(p=>({name:p.name,winners:[...p.winners],fixtures:p.fixtures.length,played:p.fixtures.filter(f=>f.played).length}));
  completed=s.expansion.cups.filter(c=>c.engine).map(c=>({kind:c.kind,winner:c.winner,fixtures:c.fixtures.length}));
 }
 if(s.seasonNumber>prev){
  validateSave(s);for(const d of s.expansion.divisions)assert.equal(d.clubs.length,sizes.get(d.id));
  for(const [id,clubs]of closed)assert.deepEqual([...s.expansion.divisions.find(d=>d.id===id).clubs].sort(),clubs);
  const ds=new Map(s.expansion.divisions.flatMap(d=>d.clubs.map(id=>[id,d])));
  for(const [id,r]of Object.entries(s.expansion.clubRules)){assert(ds.get(id).tier>=r.ceilingTier);if(r.parentId)assert(ds.get(id).tier>ds.get(r.parentId).tier);}
  reports.push({completedSeasons:prev,date:s.date,players:s.players.length,divisions:s.expansion.divisions.length});
 }
}
assert.equal(s.seasonNumber,4);assert.equal(playoffEvidence.length,2);assert(playoffEvidence.every(p=>p.winners.length&&p.played===p.fixtures));assert(completed.every(c=>c.winner));
const ids=new Set(s.players.map(p=>p.id));assert(initial.every(id=>ids.has(id)));validateSave(s);
const raw=JSON.stringify(s);assert(Buffer.byteLength(raw)<MAX_SAVE_BYTES);await writeFile('.arena/full-world-v08-three-seasons.json',raw);
const {blob,extension}=await backupBlob(s);await writeFile('.arena/full-world-v08-three-seasons'+extension,new Uint8Array(await blob.arrayBuffer()));assert.equal(await readBackup(blob),raw);
daily.sort((a,b)=>a-b);
const result={passed:true,markets:s.leagues.length,divisions:s.expansion.divisions.length,initialPlayers:initial.length,players:s.players.length,allInitialIdentitiesRetained:true,reserveConstraintsAfterEveryRollover:true,closedMembershipsUnchanged:true,groupSizesPreserved:true,dailyCalendarCheckedFirstSeason:true,minimumDateGap:3,reports,playoffEvidence,completed,bytes:Buffer.byteLength(raw),compressedBytes:blob.size,world:s.talent.world,dailyMs:{median:daily[Math.floor(daily.length*.5)],p95:daily[Math.floor(daily.length*.95)],max:daily.at(-1)},elapsedSeconds:(performance.now()-started)/1000};
await writeFile('review/full-world-v08.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
