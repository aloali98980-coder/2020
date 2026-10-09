import test from "node:test";
import assert from "node:assert/strict";
import {CITY_FACILITIES,CITY_GROUPS} from "../src/data/sportsCityFacilities.js";
import {buildCityFacility,cityEffects,cityEconomy,settleCityMonth} from "../src/services/cityFacilities.js";
import {ensureSportsCity} from "../src/services/sportsCity.js";
const state=()=>({date:"2026-07-01",capacity:15000,empire:{personal:1_000_000_000,monthTrack:{income:0,expenses:0},debt:0}});
test("37 unique trilingual facilities across five groups with pricing and effects",()=>{
 assert.equal(CITY_FACILITIES.length,37);
 assert.equal(new Set(CITY_FACILITIES.map(x=>x.id)).size,37);
 for(const [g,n] of Object.entries(CITY_GROUPS)) assert.equal(CITY_FACILITIES.filter(x=>x.group===g).length,n);
 for(const x of CITY_FACILITIES) assert.ok(x.cost>0 && x.upkeep>0 && x.effect && x.name.ar && x.name.en && x.name.fr);
});
test("personal spending, monthly maintenance, solar reduction, income and idempotence",()=>{
 const s=state(); s.finance={cash:100};
 const def=buildCityFacility(s,"mall");
 assert.equal(s.empire.personal,1_000_000_000-def.cost);
 assert.equal(s.finance.cash,100);
 const before=cityEconomy(s);
 buildCityFacility(s,"solar");
 assert.ok(cityEconomy(s).upkeep < before.upkeep+CITY_FACILITIES.find(x=>x.id==="solar").upkeep);
 assert.equal(settleCityMonth(s),true);
 assert.equal(settleCityMonth(s),false);
 assert.equal(s.empire.personal,1_000_000_000-def.cost-CITY_FACILITIES.find(x=>x.id==="solar").cost+cityEconomy(s).net);
 assert.throws(()=>buildCityFacility(s,"mall"));
});
test("group completion grants a unique bonus",()=>{
 const s=state(); ensureSportsCity(s).facilities=CITY_FACILITIES.filter(x=>x.group==="sport").map(x=>x.id);
 const {totals,completed}=cityEffects(s);
 assert.deepEqual(completed,["sport"]);
 assert.equal(totals.fitness,6);
});
