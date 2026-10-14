import { saveGame, loadGame, restoreLastSnapshot } from "../services/save.js";
import { validateSave } from "./validation.js";
let state = null;
export const getState = () => state;
export function setState(s) {
  state = s;
}

// ---------------------------------------------------------------------------------------------
// 0.49 background saving. Every decision still goes through commit(): run the operation, validate
// the result, publish it. Persisting no longer holds the UI:
// - commit() returns as soon as the validated state is published; the write happens later.
// - Debounce: a write starts SAVE_DEBOUNCE_MS after the last decision, and never later than
//   SAVE_MAX_WAIT_MS after the first unsaved one, so a burst of clicks becomes one write.
// - Smart batching: decisions made while a write is running are coalesced into ONE follow-up
//   write of the newest state (never a queue of stale snapshots).
// - The writer serialises a consistent snapshot first (see encodeLocalSave's capture phase);
//   a world operation waits only for that capture, never for compression or IndexedDB.
// - Integrity is unchanged: small careers keep the copy-on-write draft; a world career (~47,000
//   players) is mutated in place and a failed operation restores the last DURABLE snapshot and
//   replays the journal of decisions committed since then (operations are deterministic — every
//   random draw comes from the save's own seed), so no confirmed decision is lost.
// - A failed write keeps the decisions in memory, reports an error status and retries with
//   backoff; leaving the page with unsaved changes asks for confirmation.
// ---------------------------------------------------------------------------------------------
export const SAVE_DEBOUNCE_MS = 350;
export const SAVE_MAX_WAIT_MS = 2000;
const RETRY_MS = [2000, 5000, 15000, 30000];

let committing = false;
// True only while a decision is being applied (operation + validation, plus a short wait for an
// in-progress snapshot capture). Background writes do not count.
export const isSaving = () => committing;

let seq = 0, // decisions committed in this session
  savedSeq = 0, // last decision known durable
  target = null, // newest committed state not yet durable (null = nothing to write)
  timer = null,
  firstUnsavedAt = 0,
  writing = null, // promise of the in-flight write (never rejects)
  capturing = null, // resolves when the in-flight write has captured its snapshot
  rollingBack = null,
  journal = [], // world only: { seq, op } committed after the last durable snapshot
  lastError = null,
  retries = 0;
const listeners = new Set();

export function saveStatus() {
  return {
    status: lastError ? "error" : writing ? "saving" : target ? "pending" : "saved",
    unsaved: seq - savedSeq,
    error: lastError?.message || "",
  };
}
export function onSaveStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  const status = saveStatus();
  for (const fn of listeners)
    try {
      fn(status);
    } catch {
      /* a broken listener must not break saving */
    }
}
export const hasUnsavedChanges = () => !!target || !!writing;

function markDirty(next) {
  seq++;
  target = next;
  if (!firstUnsavedAt) firstUnsavedAt = Date.now();
  if (!lastError) schedule();
  notify();
}
function schedule(delay) {
  clearTimeout(timer);
  const wait =
    delay ??
    Math.max(
      0,
      Math.min(SAVE_DEBOUNCE_MS, firstUnsavedAt + SAVE_MAX_WAIT_MS - Date.now()),
    );
  timer = setTimeout(() => {
    timer = null;
    pump();
  }, wait);
}

// Start one write of the newest committed state, unless one is already running.
function pump() {
  if (writing || !target) return writing;
  if (rollingBack) {
    rollingBack.then(() => pump());
    return rollingBack;
  }
  clearTimeout(timer);
  timer = null;
  firstUnsavedAt = 0;
  const snapshot = target,
    upTo = seq;
  let captured;
  capturing = new Promise((resolve) => (captured = resolve));
  const releaseCapture = () => {
    captured();
    capturing = null;
  };
  writing = (async () => {
    try {
      await saveGame(snapshot, {
        validated: true,
        onCaptured: releaseCapture,
        onCommitted: () => {
          savedSeq = upTo;
          journal = journal.filter((j) => j.seq > upTo);
        },
      });
      lastError = null;
      retries = 0;
      if (seq === upTo) target = null;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    } finally {
      releaseCapture();
      writing = null;
    }
    if (target) {
      if (lastError) schedule(RETRY_MS[Math.min(retries++, RETRY_MS.length - 1)]);
      else {
        // Decisions made during the write: one coalesced follow-up, still debounced.
        firstUnsavedAt ||= Date.now();
        schedule();
      }
    }
    notify();
  })();
  notify();
  return writing;
}

// Write everything committed so far and wait until it is durable. Rejects with the storage
// error if the write fails (the decisions stay in memory and are retried).
export async function flushSave() {
  for (let guard = 0; guard < 100 && (target || writing || rollingBack); guard++) {
    if (writing) await writing;
    else if (rollingBack) await rollingBack;
    else {
      lastError = null;
      await pump();
      if (lastError) throw lastError;
    }
  }
  if (lastError) throw lastError;
}

// Replace the active career (new game, import, slot load, cloud restore): settle the old
// career's pending write first so it can never land after — and overwrite — the new one.
export async function replaceState(next) {
  try {
    await flushSave();
  } catch {
    /* the replacement below supersedes the old career anyway */
  }
  while (writing) await writing;
  dropPending();
  await saveGame(next);
  state = next;
  notify();
}
// Forget unsaved work (used right before wiping local data).
export async function discardPendingSave() {
  while (writing) await writing;
  dropPending();
  notify();
}
function dropPending() {
  clearTimeout(timer);
  timer = null;
  firstUnsavedAt = 0;
  target = null;
  journal = [];
  savedSeq = seq;
  lastError = null;
  retries = 0;
}

export async function commit(operation) {
  if (committing) throw new Error("انتظر اكتمال الحفظ الحالي.");
  committing = true;
  try {
    if (!state) throw new Error("ابدأ حفظة جديدة.");
    if (state.database !== "world") {
      const draft = structuredClone(state);
      const result = operation(draft);
      validateSave(draft);
      state = draft;
      markDirty(draft);
      return result;
    }
    // In-place mutation must not interleave with a snapshot being serialised.
    while (capturing) await capturing;
    const draft = state;
    let result;
    try {
      result = operation(draft);
      validateSave(draft);
    } catch (e) {
      await rollback();
      throw e;
    }
    journal.push({ seq: seq + 1, op: operation });
    markDirty(draft);
    return result;
  } finally {
    committing = false;
  }
}

// Restore the last durable snapshot — first from the encoded copy kept in memory (works even when
// IndexedDB or localStorage just failed), then from storage — and replay the decisions committed
// after it. If nothing can be restored the mutated in-memory state stays and the next successful
// write replaces the snapshot.
function rollback() {
  rollingBack = (async () => {
    // An in-flight write captured its snapshot before this operation ran; let it land first so
    // the durable snapshot and the journal describe the same point in time.
    while (writing) await writing;
    let restored = null;
    try {
      restored = await restoreLastSnapshot();
    } catch {
      /* fall through to storage */
    }
    if (!restored)
      try {
        ({ state: restored } = await loadGame());
      } catch {
        /* keep the in-memory state */
      }
    if (!restored) return;
    for (const { op } of journal)
      try {
        op(restored);
      } catch {
        break; // not expected: operations are deterministic over the save's own seed
      }
    state = restored;
    if (target) target = restored;
  })().finally(() => {
    rollingBack = null;
  });
  return rollingBack;
}
