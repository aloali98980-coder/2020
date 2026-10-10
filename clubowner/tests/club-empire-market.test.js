import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { createClubEmpire, listingPrice } from "../src/services/clubEmpire/state.js";
import { inspectClub, postSigningSurprise } from "../src/services/clubEmpire/dueDiligence.js";

test("sale reasons and market cycle determine asking prices", () => {
  const listing = { baseValue: 100_000_000, reason: "bankruptcy" };
  assert.equal(listingPrice(listing, "boom"), 75_600_000);
  assert.ok(listingPrice(listing, "slump") < listingPrice(listing, "normal"));
});

test("market has brokers including a fraudster and reasoned listings", () => {
  const s = createGame();
  const market = createClubEmpire(s);
  assert.ok(market.listings.length);
  assert.ok(market.brokers.some((b) => b.fraud));
  assert.ok(market.listings.every((x) => x.reason && x.askingPrice > 0));
});

test("inspection charges progressively and deep inspection reveals secrets", () => {
  const s = createGame();
  s.clubEmpire = createClubEmpire(s);
  s.empire.personal = 10_000_000_000;
  const listing = s.clubEmpire.listings[0];
  const before = s.empire.personal;
  const report = inspectClub(s, listing.id, "deep");
  assert.equal(report.accuracy, 0.96);
  assert.ok(report.discoveries.length >= 1);
  assert.equal(s.empire.personal, before - report.cost);
});

test("skipped findings can become a post-signing treasure or disaster", () => {
  const s = createGame();
  s.clubEmpire = createClubEmpire(s);
  const listing = s.clubEmpire.listings[0];
  listing.dueDiligence = null;
  const club = { clubId: listing.clubId, value: listing.baseValue };
  const surprise = postSigningSurprise(s, club);
  assert.ok(surprise);
  assert.equal(club.surprises.length, 1);
});
