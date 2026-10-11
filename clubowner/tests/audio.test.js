import assert from "node:assert/strict";
import test from "node:test";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  DEFAULT_AUDIO_SETTINGS,
  audioSettingsFor,
  ensureAudioPreferences,
  matchCuePlan,
  normalizeAudioSettings,
  setAudioEnabled,
  setAudioMuted,
  setAudioVolume,
  shouldPlayAudio,
} from "../src/services/audio.js";

test("audio settings default to enabled, clamp volume, and honor mute independently", () => {
  assert.deepEqual(normalizeAudioSettings(), DEFAULT_AUDIO_SETTINGS);
  const s = createGame({ database: "demo", leagues: ["eg"] });
  assert.deepEqual(audioSettingsFor(s), DEFAULT_AUDIO_SETTINGS);
  assert.equal(shouldPlayAudio(audioSettingsFor(s)), true);

  setAudioVolume(s, 1.8);
  assert.equal(s.preferences.audio.volume, 1);
  setAudioMuted(s, true);
  assert.equal(s.preferences.audio.enabled, true);
  assert.equal(shouldPlayAudio(audioSettingsFor(s)), false);
  setAudioMuted(s, false);
  setAudioEnabled(s, false);
  assert.equal(shouldPlayAudio(audioSettingsFor(s)), false);
  setAudioEnabled(s, true);
  setAudioVolume(s, 0.27);
  assert.equal(shouldPlayAudio(audioSettingsFor(s)), true);
  assert.equal(audioSettingsFor(s).volume, 0.27);
});

test("normalization repairs partial or invalid legacy preferences without enabling invalid levels", () => {
  assert.deepEqual(normalizeAudioSettings({ enabled: false, volume: 4 }), {
    enabled: false,
    muted: false,
    volume: 1,
  });
  assert.equal(normalizeAudioSettings({ volume: "loud" }).volume, 0.45);
  const save = { preferences: {} };
  assert.deepEqual(ensureAudioPreferences(save), DEFAULT_AUDIO_SETTINGS);
  assert.deepEqual(save.preferences.audio, DEFAULT_AUDIO_SETTINGS);
});

test("old v34 saves migrate with generated audio on and validate as a current save", () => {
  const old = structuredClone(
    createGame({ database: "demo", leagues: ["eg"] }),
  );
  old.version = 34;
  delete old.preferences.audio;
  const migrated = migrateSave(old);
  assert.equal(old.version, 34, "migration leaves source save untouched");
  assert.equal(migrated.version, SAVE_VERSION);
  assert.deepEqual(migrated.preferences.audio, DEFAULT_AUDIO_SETTINGS);
  assert.equal(shouldPlayAudio(audioSettingsFor(migrated)), true);
  assert.match(migrated.migrationNote, /0\.39/);
  assert.equal(validateSave(migrated), migrated);
});

test("match cue plan classifies goals for and against without changing match state", () => {
  const fixture = {
    home: "zamalek",
    away: "ahly",
    homeGoals: 2,
    awayGoals: 1,
  };
  const before = structuredClone(fixture);
  assert.deepEqual(matchCuePlan(fixture, "ahly"), [
    "kickoff",
    "goal-for",
    "goal-against",
    "goal-against",
    "boo",
    "fulltime",
  ]);
  assert.deepEqual(fixture, before);
  assert.deepEqual(matchCuePlan({ home: "ahly", away: "zamalek", homeGoals: 0, awayGoals: 0 }, "ahly"), [
    "kickoff",
    "draw",
    "fulltime",
  ]);
});
