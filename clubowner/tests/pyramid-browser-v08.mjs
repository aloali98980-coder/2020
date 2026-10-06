import {chromium,webkit} from '@playwright/test';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';import {DIVISIONS} from '../src/data/expandedCatalog.js';
const result=[],url=process.env.TEST_URL||'http://127.0.0.1:5174';
for(const [engine,type]of Object.entries({chromium,webkit})){
 const b=await type.launch();try{
 const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
 for(const country of [...new Set(DIVISIONS.map(d=>d.country))]){
  await p.selectOption('#setup-region',country);const tiers=await p.locator('#setup-tier option').evaluateAll(os=>os.map(o=>Number(o.value)));assert.deepEqual(tiers,[...new Set(DIVISIONS.filter(d=>d.country===country).map(d=>d.tier))]);
  for(const tier of tiers){await p.selectOption('#setup-tier',String(tier));const ds=DIVISIONS.filter(d=>d.country===country&&d.tier===tier);assert.equal(await p.locator('#setup-group option').count(),ds.length);for(const d of ds){await p.selectOption('#setup-group',d.id);assert.equal(await p.locator('#setup-expanded-club option').count(),d.clubs.length);}}
 }
 await p.selectOption('#setup-region','es');await p.selectOption('#setup-tier','3');await p.selectOption('#setup-group','es-3-b');
 const id=await p.locator('#setup-expanded-club option').evaluateAll(os=>os.find(o=>o.textContent.includes('Real Madrid Castilla')).value);await p.selectOption('#setup-expanded-club',id);
 await p.click('[data-action=start-game]');await p.waitForSelector('.hero-card',{timeout:120000});await p.click('.mobile-nav [data-action=more]');await p.click('.more-grid [data-nav=world]');assert.equal(await p.locator('#division-view').inputValue(),'es-3-b');assert.equal(await p.locator('#division-view option').count(),116);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:`review/v08-${engine}-third-level.png`,fullPage:false});await p.reload();await p.waitForSelector('.hero-card',{timeout:120000});assert.deepEqual(errors,[]);
 result.push({engine,passed:true,marketsSelected:50,divisionsSelected:116,clubCountsCheckedEveryGroup:true,thirdLevelCareerStartedAndReloaded:true,noHorizontalOverflow:true,errors});
 }finally{await b.close();}
}
await writeFile('review/pyramid-browser-v08.json',JSON.stringify(result,null,2));console.log(result);
