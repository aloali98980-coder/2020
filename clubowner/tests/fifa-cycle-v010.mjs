import{allFixtures,restGap}from"../src/services/calendar.js";
import assert from'node:assert/strict';import{writeFile}from'node:fs/promises';import{gzipSync}from'node:zlib';
import{createGame}from'../src/core/game.js';import{advanceTime}from'../src/services/time.js';import{validateSave}from'../src/core/validation.js';
const s=createGame({database:'world',expanded:true,leagues:['eg'],difficulty:'easy'}),rows=[];let groupSnapshot=false,interSnapshot=false;
for(let i=0;i<2900&&s.seasonNumber<8;i++){
 for(const m of s.inbox)if(m.required)m.status='resolved';const season=s.seasonNumber;advanceTime(s,1);
 if(i%30===0)validateSave(s);
 const cw=s.expansion.cups.find(c=>c.kind==='clubworld'),ic=s.expansion.cups.find(c=>c.kind==='intercontinental');
 if(cw){const byClub=new Map();for(const f of allFixtures(s))for(const id of [f.home,f.away]){if(!byClub.has(id))byClub.set(id,[]);byClub.get(id).push(f);}for(const fs of byClub.values()){fs.sort((a,b)=>a.date.localeCompare(b.date));for(let j=1;j<fs.length;j++)assert(restGap(fs[j-1].date,fs[j].date)>=3,fs[j].id);}}
 if(cw&&!groupSnapshot&&cw.fixtures.some(f=>f.played)&&cw.phase==='groups'){validateSave(s);await writeFile('.arena/fifa-v010-mid-world.json.gz',gzipSync(JSON.stringify(s)));groupSnapshot=true;}
 if(ic&&!interSnapshot&&ic.phase==='challenger'){validateSave(s);await writeFile('.arena/fifa-v010-mid-inter.json.gz',gzipSync(JSON.stringify(s)));interSnapshot=true;}
 if(s.seasonNumber>season){const h=s.expansion.history[0],world=h.cups.filter(c=>c.name==='FIFA Club World Cup'),inter=h.cups.find(c=>c.name==='FIFA Intercontinental Cup');assert(inter?.winner);rows.push({season,year:inter.editionYear,worldYears:world.map(c=>c.editionYear),next:s.expansion.fifa.nextWorldYear,players:s.players.length});console.log(rows.at(-1));}
}
assert.equal(s.seasonNumber,8);assert.deepEqual(rows.flatMap(r=>r.worldYears),[2029,2033]);assert.equal(s.expansion.fifa.nextWorldYear,2037);assert(groupSnapshot&&interSnapshot);validateSave(s);
const report={passed:true,scope:'seven seasons with Egypt detailed and the remaining top leagues lightweight, NOT a seven-season full-market capacity claim',worldCupYears:rows.flatMap(r=>r.worldYears),annualIntercontinentalEditions:rows.map(r=>r.year),nextWorldCup:2037,dailyRestCheckedInBothWorldCupSeasons:true,rows,midGroupSave:true,midIntercontinentalSave:true};await writeFile('review/fifa-cycle-v010.json',JSON.stringify(report,null,2));
