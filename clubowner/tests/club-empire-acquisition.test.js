import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { initClubEmpire } from "../src/services/clubEmpire/state.js";
import { eligibility, startNegotiation, negotiate, completeAcquisition, launchFirstHundredDays } from "../src/services/clubEmpire/acquisition.js";

function richGame() { const s = createGame(); initClubEmpire(s); s.empire.personal = 10_000_000_000; s.reputation = 90; return s; }
test("eligibility links reputation, black files, charity and source of funds", () => {
  const s = richGame(); assert.equal(eligibility(s).status, "accepted");
  s.blackFiles.suspicion = 100; assert.notEqual(eligibility(s, { sourceVerified: false }).status, "accepted");
  s.empire.charity.total = 100_000_000; assert.ok(eligibility(s).score > eligibility({ ...s, empire: { ...s.empire, charity: { total: 0 } } }).score);
});
test("negotiation supports terms, leaks and sacred fan conditions", () => {
  const s = richGame(), listing = s.clubEmpire.listings[0], deal = startNegotiation(s, listing.id);
  negotiate(s, deal.id, { cash: 1, preserve: { name: true, badge: true, city: true } });
  const result = negotiate(s, deal.id, { cash: listing.askingPrice * 2, honoraryRole: true, sellOnPercent: 5, preserve: { name: false, badge: true, city: true } });
  assert.equal(result.accepted, true); assert.deepEqual(result.violated, ["name"]); assert.equal(deal.leaks, 0);
});
test("acquisition creates ownership, revolt and accountable 100-day plan", () => {
  const s = richGame(), listing = s.clubEmpire.listings[0], deal = startNegotiation(s, listing.id);
  negotiate(s, deal.id, { cash: listing.askingPrice * 2, preserve: { name: false, badge: true, city: true } });
  const club = completeAcquisition(s, deal.id); assert.equal(club.control, true); assert.ok(s.clubEmpire.conflicts.some((x) => x.type === "fan-revolt"));
  assert.equal(launchFirstHundredDays(s, club.clubId, ["promotion"]).promises[0].kept, null);
});
