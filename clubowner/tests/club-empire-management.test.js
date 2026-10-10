import test from "node:test"; import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js"; import { initClubEmpire } from "../src/services/clubEmpire/state.js";
import { setClubManagement, investInClub, seasonalReport, createNetworkLoan } from "../src/services/clubEmpire/management.js";
function game() { const s=createGame(); initClubEmpire(s); s.empire.personal=1e10; s.clubEmpire.ownedClubs=[{clubId:"a",value:1e8,budget:0,intervention:20,executives:{}},{clubId:"b",value:2e8,budget:0,intervention:20,executives:{}}]; return s; }
test("remote management assigns executives and ring-fenced seasonal budgets",()=>{const s=game();const c=setClubManagement(s,"a",{ceo:"CEO",coach:"Coach",budget:2e7,intervention:40,objective:"promotion"});assert.equal(c.executives.ceo,"CEO");assert.equal(c.objective,"promotion");});
test("investment develops squad facilities or academy",()=>{const s=game();investInClub(s,"a",1e7,"academy");assert.equal(s.clubEmpire.ownedClubs[0].development.academy,1e7);});
test("owner micromanagement damages reports",()=>{const s=game();setClubManagement(s,"a",{intervention:100});assert.ok(seasonalReport(s,"a",70).interventionDamage>0);});
test("network enables preferential internal loans and shared scouts",()=>{const s=game();const l=createNetworkLoan(s,{playerId:"p1",fromClubId:"a",toClubId:"b",preferredFee:1});assert.equal(l.sharedScouting,true);assert.equal(l.preferredFee,1);});
