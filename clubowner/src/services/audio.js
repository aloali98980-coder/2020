// Tiny generated match-day sound engine. Every sound is synthesized with Web Audio;
// no copyrighted recordings or external audio assets are shipped with the game.
const DEFAULT_AUDIO_SETTINGS = Object.freeze({
  enabled: true,
  muted: false,
  volume: 0.45,
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normalizeAudioSettings(value) {
  return {
    enabled: value?.enabled !== false,
    muted: Boolean(value?.muted),
    volume: Number.isFinite(Number(value?.volume))
      ? clamp(Number(value.volume), 0, 1)
      : DEFAULT_AUDIO_SETTINGS.volume,
  };
}

export function audioSettingsFor(save) {
  return normalizeAudioSettings(save?.preferences?.audio);
}

export function shouldPlayAudio(value) {
  const settings = normalizeAudioSettings(value);
  return settings.enabled && !settings.muted && settings.volume > 0;
}

export function setAudioEnabled(save, enabled) {
  save.preferences ??= {};
  save.preferences.audio = {
    ...audioSettingsFor(save),
    enabled: Boolean(enabled),
  };
  return save.preferences.audio;
}

export function setAudioMuted(save, muted) {
  save.preferences ??= {};
  save.preferences.audio = {
    ...audioSettingsFor(save),
    muted: Boolean(muted),
  };
  return save.preferences.audio;
}

export function setAudioVolume(save, volume) {
  save.preferences ??= {};
  save.preferences.audio = {
    ...audioSettingsFor(save),
    volume: clamp(Number(volume) || 0, 0, 1),
  };
  return save.preferences.audio;
}

export function ensureAudioPreferences(save) {
  save.preferences ??= {};
  save.preferences.audio = normalizeAudioSettings(save.preferences.audio);
  return save.preferences.audio;
}

export function matchCuePlan(fixture, clubId) {
  const home = Number(fixture?.homeGoals) || 0;
  const away = Number(fixture?.awayGoals) || 0;
  const own = fixture?.home === clubId ? home : away;
  const against = fixture?.home === clubId ? away : home;
  const cues = ["kickoff"];
  const total = own + against;
  let ownSoFar = 0;
  let againstSoFar = 0;
  for (let i = 0; i < total; i++) {
    // Interleave both sides so a high-scoring game does not become a one-sided stack.
    if (ownSoFar < own && (againstSoFar >= against || ownSoFar <= againstSoFar)) {
      cues.push("goal-for");
      ownSoFar++;
    } else {
      cues.push("goal-against");
      againstSoFar++;
    }
  }
  cues.push(own > against ? "cheer" : own < against ? "boo" : "draw");
  cues.push("fulltime");
  return cues;
}

let context = null;
let unlocked = false;
let ambience = null;
let ambienceTimer = null;
const scheduled = new Set();

function audioContext() {
  if (context) return context;
  const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
    return context;
  } catch {
    return null;
  }
}

// Call synchronously from the first real browser gesture to satisfy autoplay rules.
export function unlockAudio() {
  const ctx = audioContext();
  if (!ctx) return false;
  unlocked = true;
  if (ctx.state === "suspended") ctx.resume?.().catch?.(() => {});
  return true;
}


function settingsVolume(value) {
  return shouldPlayAudio(value) ? normalizeAudioSettings(value).volume : 0;
}

function playTone(frequency, duration, {
  at = null,
  endFrequency = frequency,
  type = "sine",
  gain = 0.22,
  volume = 1,
  pan = 0,
} = {}) {
  const ctx = audioContext();
  if (!ctx || !unlocked || volume <= 0) return;
  try {
    const start = at ?? ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const panner = ctx.createStereoPanner?.();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      start + Math.max(0.04, duration),
    );
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, gain * volume),
      start + 0.025,
    );
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      start + Math.max(0.06, duration),
    );
    if (panner) {
      panner.pan.setValueAtTime(clamp(pan, -1, 1), start);
      oscillator.connect(envelope).connect(panner).connect(ctx.destination);
    } else oscillator.connect(envelope).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + Math.max(0.08, duration) + 0.02);
  } catch {
    // Audio is an optional presentation layer; device/browser audio failures are non-fatal.
  }
}

function schedule(callback, delay) {
  const timer = setTimeout(() => {
    scheduled.delete(timer);
    callback();
  }, delay);
  scheduled.add(timer);
  return timer;
}

function noiseBuffer(ctx, seconds = 2.2) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Brown-noise-like crowd bed: low-pass random motion makes the generated loop
  // softer than white noise and keeps its compressed data footprint at zero bytes.
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.025 * white) / 1.025;
    data[i] = last * 3.4;
  }
  return buffer;
}

export function stopCrowdAmbience() {
  if (ambienceTimer) clearTimeout(ambienceTimer);
  ambienceTimer = null;
  const active = ambience;
  ambience = null;
  if (!active) return;
  try {
    const now = active.context.currentTime;
    active.gain.gain.cancelScheduledValues(now);
    active.gain.gain.setTargetAtTime(0.0001, now, 0.12);
    active.source.stop(now + 0.5);
  } catch {
    /* already ended */
  }
}

export function startCrowdAmbience(value, { duration = 10000, intensity = 0.2 } = {}) {
  const volume = settingsVolume(value);
  const ctx = audioContext();
  if (!ctx || !unlocked || volume <= 0) return false;
  stopCrowdAmbience();
  try {
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const low = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    source.buffer = noiseBuffer(ctx);
    source.loop = true;
    filter.type = "bandpass";
    filter.frequency.value = 1050;
    filter.Q.value = 0.48;
    low.type = "lowpass";
    low.frequency.value = 2400;
    gain.gain.value = volume * clamp(intensity, 0, 0.45);
    lfo.frequency.value = 0.16;
    lfoGain.gain.value = volume * 0.025;
    lfo.connect(lfoGain).connect(gain.gain);
    source.connect(filter).connect(low).connect(gain).connect(ctx.destination);
    source.start();
    lfo.start();
    ambience = { context: ctx, source, gain, lfo };
    ambienceTimer = setTimeout(stopCrowdAmbience, Math.max(500, duration));
    return true;
  } catch {
    stopCrowdAmbience();
    return false;
  }
}

function whistle(value, final = false) {
  const volume = settingsVolume(value) * 0.55;
  const ctx = audioContext();
  if (!ctx || !unlocked || volume <= 0) return;
  const t = ctx.currentTime;
  const length = final ? 0.62 : 0.34;
  playTone(1760, length, { at: t, endFrequency: 1560, type: "sine", gain: 0.16, volume });
  playTone(2150, length * 0.78, {
    at: t + (final ? 0.12 : 0.02),
    endFrequency: 1880,
    type: "sine",
    gain: 0.09,
    volume,
  });
}

function cheer(value, intensity = 1) {
  const volume = settingsVolume(value) * clamp(intensity, 0, 1.5);
  const ctx = audioContext();
  if (!ctx || !unlocked || volume <= 0) return;
  const t = ctx.currentTime;
  [392, 494, 587, 784].forEach((note, index) =>
    playTone(note, 0.42 + index * 0.06, {
      at: t + index * 0.075,
      endFrequency: note * 1.025,
      type: "triangle",
      gain: 0.13,
      volume,
      pan: (index - 1.5) * 0.28,
    }),
  );
  for (let i = 0; i < 3; i++)
    playTone(620 + i * 120, 0.17, {
      at: t + 0.38 + i * 0.1,
      type: "sawtooth",
      gain: 0.035,
      volume,
      pan: (i - 1) * 0.6,
    });
}

function boo(value) {
  const volume = settingsVolume(value) * 0.8;
  const ctx = audioContext();
  if (!ctx || !unlocked || volume <= 0) return;
  const t = ctx.currentTime;
  [196, 185, 164, 146].forEach((note, index) =>
    playTone(note, 0.42, {
      at: t + index * 0.11,
      endFrequency: note * 0.78,
      type: "sawtooth",
      gain: 0.055,
      volume,
      pan: (index % 2 ? 1 : -1) * 0.35,
    }),
  );
}

const TROPHY_NOTES = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
function fanfare(value) {
  const volume = settingsVolume(value);
  const ctx = audioContext();
  if (!ctx || !unlocked || volume <= 0) return;
  const t = ctx.currentTime;
  TROPHY_NOTES.forEach((note, index) =>
    playTone(note, index === TROPHY_NOTES.length - 1 ? 0.72 : 0.32, {
      at: t + index * 0.21,
      endFrequency: note * (index === TROPHY_NOTES.length - 1 ? 1 : 1.015),
      type: "triangle",
      gain: index === TROPHY_NOTES.length - 1 ? 0.18 : 0.12,
      volume,
      pan: (index % 3 - 1) * 0.2,
    }),
  );
}

export function playAudioCue(name, settings) {
  if (!shouldPlayAudio(settings)) return false;
  if (!audioContext() || !unlocked) return false;
  switch (name) {
    case "crowd":
      return startCrowdAmbience(settings);
    case "kickoff":
      whistle(settings, false);
      return true;
    case "fulltime":
      whistle(settings, true);
      return true;
    case "goal-for":
    case "cheer":
      cheer(settings);
      return true;
    case "goal-against":
    case "boo":
      boo(settings);
      return true;
    case "trophy":
      fanfare(settings);
      return true;
    case "stop-crowd":
      stopCrowdAmbience();
      return true;
    default:
      return false;
  }
}

export function playMatchSequence(save, fixture) {
  const settings = audioSettingsFor(save);
  if (!shouldPlayAudio(settings) || !unlocked || !fixture) return false;
  startCrowdAmbience(settings, { duration: 9000, intensity: 0.14 });
  const cues = matchCuePlan(fixture, save.clubId);
  cues.forEach((cue, index) => {
    const delay = index === 0 ? 0 : index === cues.length - 1 ? 4700 : 550 + index * 680;
    schedule(() => playAudioCue(cue, settings), delay);
  });
  return true;
}

export function playCelebrationAudio(save, kind = "title") {
  const settings = audioSettingsFor(save);
  if (!shouldPlayAudio(settings) || !unlocked) return false;
  startCrowdAmbience(settings, {
    duration: kind === "title" ? 18000 : 10000,
    intensity: kind === "title" ? 0.26 : 0.19,
  });
  if (kind === "title") fanfare(settings);
  else if (kind === "derby") cheer(settings, 0.85);
  else cheer(settings, 0.72);
  return true;
}


export { DEFAULT_AUDIO_SETTINGS };
