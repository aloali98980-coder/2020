import {chromium,webkit} from '@playwright/test';
import assert from 'node:assert/strict';
const url=process.env.TEST_URL||'http://127.0.0.1:5173';
const results=[];
for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch();const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url);await p.selectOption('#setup-database','world');await p.click('[data-action=markets-all]');assert.equal(await p.locator('input[name=league]:checked').count(),50);
 await p.fill('#owner-name','Global Career');const before=Date.now();await p.click('[data-action=start-game]');await p.waitForSelector('.hero-card',{timeout:60000});const startupMs=Date.now()-before;
 const marker=await p.evaluate(()=>JSON.parse(localStorage.getItem('clubowner.game.v1')));assert.equal(marker.storage,'indexeddb');
 const read=()=>p.evaluate(async()=>{const db=await new Promise((res,rej)=>{const r=indexedDB.open('clubowner.world.saves',1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});return await new Promise((res,rej)=>{const r=db.transaction('saves').objectStore('saves').get(JSON.parse(localStorage.getItem('clubowner.game.v1')).key||'current');r.onsuccess=()=>{db.close();res({count:r.result.players.length,own:r.result.players.filter(p=>p.clubId===r.result.clubId).length,date:r.result.date,version:r.result.version,cash:r.result.finance.cash,negotiations:r.result.negotiations.length});};r.onerror=()=>rej(r.error);});});
 const first=await read();assert(first.count>15000);assert.equal(first.version,5);
 await p.click('.mobile-nav [data-nav=transfers]');assert.equal(await p.locator('.players-table tbody tr').count(),50);
 await p.fill('#player-search','Erling Haaland');assert.equal(await p.locator('.players-table tbody tr').count(),1);await p.locator('[data-action=player-detail]').click();await p.waitForSelector('.ability-explainer');await p.screenshot({path:`review/world-${engine}-player.png`,fullPage:true});await p.click('[data-action=close-modal]');
 await p.fill('#player-search','');await p.selectOption('#league-filter','eg');await p.locator('[data-action=transfer-offer]').first().click();await p.locator('#offer-form button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('#offer-form'));await p.selectOption('#advance-days','1');await p.click('[data-action=advance]');await p.waitForSelector('[data-action=accept-club]',{timeout:60000});await p.click('[data-action=accept-club]');await p.locator('#contract-form button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('#contract-form'),{timeout:60000});const after=await read();assert.equal(after.own,first.own+1);
 await p.reload();await p.waitForSelector('.hero-card',{timeout:60000});assert.deepEqual(await read(),after);
 await p.click('.mobile-nav [data-action=more]');await p.click('.more-grid [data-nav=database]');assert.equal(await p.locator('.coverage-market').count(),50);assert((await p.locator('#main-content').innerText()).includes('CC BY-SA'));
 const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);await p.screenshot({path:`review/world-${engine}-coverage.png`,fullPage:true});
 await p.click('.mobile-nav [data-action=more]');await p.click('.more-grid [data-nav=settings]');await p.selectOption('#game-language','en');await p.waitForFunction(()=>document.documentElement.lang==='en');await p.reload();await p.waitForSelector('.hero-card',{timeout:60000});assert.equal(await p.locator('html').getAttribute('dir'),'ltr');
 assert.deepEqual(errors,[]);results.push({engine,startupMs,players:first.count,overflow,errors,flow:'50 markets, paginated search, player model, transfer, IndexedDB reload, coverage and language'});await browser.close();
}
console.log(JSON.stringify(results,null,2));
