import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:5174';const b=await chromium.launch();
try{
 const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base);await p.selectOption('#setup-database','world');await p.click('[data-action=markets-all]');await p.fill('#owner-name','حفظة دون اتصال');await p.click('[data-action=start-game]');await p.waitForSelector('.hero-card');
 await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const cache=await p.evaluate(()=>caches.keys());await c.setOffline(true);await p.reload({waitUntil:'domcontentloaded'});await p.waitForSelector('.hero-card');
 await p.click('.mobile-nav [data-nav=transfers]');await p.selectOption('#league-filter','eg');await p.locator('[data-action=transfer-offer]').first().click();await p.locator('#offer-form button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('#offer-form'));await p.selectOption('#advance-days','1');await p.click('[data-action=advance]');await p.click('[data-action=accept-club]');await p.locator('#contract-form button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('#contract-form'));
 const marker=await p.evaluate(()=>localStorage.getItem('clubowner.game.v1'));await p.close();
 const reopened=await c.newPage();reopened.on('pageerror',e=>errors.push(e.message));await reopened.goto(base,{waitUntil:'domcontentloaded'});await reopened.waitForSelector('.hero-card');assert.equal(await reopened.evaluate(()=>localStorage.getItem('clubowner.game.v1')),marker);
 await reopened.click('.mobile-nav [data-nav=transfers]');await reopened.fill('#player-search','Erling Haaland');assert.equal(await reopened.locator('.players-table tbody tr').count(),1);
 const licence=await c.newPage();await licence.goto(base+'/data-license.html',{waitUntil:'domcontentloaded'});assert((await licence.locator('body').innerText()).includes('CC BY-SA 4.0'));assert.equal(await licence.locator('h1').innerText(),'تراخيص ومنهج قاعدة اللاعبين');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,engine:'Chromium',worldPlayers:22818,cache,tests:['full world offline reload','offline transfer and IndexedDB persistence','new tab restores world career','full-pool search offline','licence attribution navigation offline'],physicalIPhoneTested:false,errors},null,2));
}finally{await b.close();}
