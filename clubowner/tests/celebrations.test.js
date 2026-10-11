import assert from "node:assert/strict";
import test from "node:test";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  awardCelebration,
  celebrationSnapshot,
  detectCelebrationEvents,
  markCelebrationSeen,
  pendingCelebrations,
  trackCelebrationEvents,
} from "../src/services/celebrations.js";

const game = () => createGame({ database: "demo", leagues: ["eg"] });

test("new trophy results generate title/cup scenes and apply one-shot reward package", () => {
  const s = game();
  const before = celebrationSnapshot(s);
  s.expansion = {
    champions: { ucl: s.clubId },
    cups: [
      { id: "egypt-cup-s1", name: "Egypt Cup", winner: s.clubId, finished: s.date },
    ],
    domesticHonours: {},
  };
  const fresh = detectCelebrationEvents(before, s);
  assert.deepEqual(fresh.map((item) => item.kind).sort(), ["cup", "title"]);
  const cash = s.finance.cash;
  const morale = s.players.find((player) => player.clubId === s.clubId).morale;
  const records = trackCelebrationEvents(s, before);
  assert.equal(records.length, 2);
  assert.equal(s.celebrations.length, 2);
  assert.equal(s.finance.cash, cash + records.reduce((sum, record) => sum + record.reward.merchandise + record.reward.sponsor, 0));
  assert(s.players.find((player) => player.clubId === s.clubId).morale > morale);
  assert(s.fanSupport > 78);
  assert(s.staffCorp.social.followers > 0);
  assert(s.sportsCity.broadcasts.some((item) => item.event === records[0].id));
  assert(s.inbox.some((item) => item.kind === "celebration"));

  const cashAfter = s.finance.cash;
  const duplicate = awardCelebration(s, fresh[0]);
  assert.equal(s.finance.cash, cashAfter, "rerunning the same event cannot duplicate rewards");
  assert.equal(s.celebrations.length, 2);
  assert.equal(duplicate.id, records.find((record) => record.sourceKey === `${fresh[0].kind}:${fresh[0].sourceId}`).id);
  delete s.expansion;
  assert.equal(validateSave(s), s);
});

test("league archive, promotion and derby result detection require real new outcomes", () => {
  const s = game();
  const before = celebrationSnapshot(s);
  s.seasonHistory.push({
    number: 1,
    table: [{ clubId: s.clubId }, { clubId: "zamalek" }],
  });
  const leagueEvents = detectCelebrationEvents(before, s);
  assert.equal(leagueEvents.length, 1);
  assert.equal(leagueEvents[0].kind, "title");

  const promotedBefore = { ...before, ownTier: 2 };
  s.expansion = {
    divisions: [{ id: "eg-top", tier: 1, clubs: [s.clubId] }],
    cups: [],
    champions: {},
    domesticHonours: {},
  };
  const moved = detectCelebrationEvents(promotedBefore, s);
  assert(moved.some((item) => item.kind === "promotion"));

  s.fixtures.push({
    id: "derby-presentation-test",
    home: s.clubId,
    away: "zamalek",
    homeGoals: 2,
    awayGoals: 0,
    isDerby: true,
    played: true,
  });
  const derby = detectCelebrationEvents(before, s).find((item) => item.kind === "derby");
  assert.equal(derby.sourceId, "derby-derby-presentation-test");
  assert.equal(
    detectCelebrationEvents(celebrationSnapshot(s), s).some((item) => item.kind === "derby"),
    false,
    "already played derby cannot retrigger",
  );
});

test("celebration overlay queue state is persistent and old v35 saves migrate safely", () => {
  const old = game();
  old.version = 35;
  delete old.celebrations;
  const migrated = migrateSave(old);
  assert.equal(old.version, 35);
  assert.equal(migrated.version, SAVE_VERSION);
  assert.deepEqual(migrated.celebrations, []);
  assert.equal(migrated.preferences.audio.enabled, true);
  assert.equal(migrateSave(migrated), migrated);

  const record = awardCelebration(migrated, {
    kind: "promotion",
    sourceId: "promotion-test-s1",
    name: "Tier 2",
  });
  assert.equal(pendingCelebrations(migrated).length, 1);
  assert.equal(markCelebrationSeen(migrated, record.id), true);
  assert.equal(pendingCelebrations(migrated).length, 0);
  assert.equal(validateSave(migrated), migrated);
});
