import { saveGame, loadGame, restoreLastSnapshot } from "../services/save.js";
let state = null;
export const getState = () => state;
export function setState(s) {
  state = s;
}
let writing = false;
export const isSaving = () => writing;
// Every decision goes through commit(): run the operation, persist, then publish the new state.
// Small careers keep the classic copy-on-write draft (structuredClone is instant there and a
// failed operation simply drops the draft). 0.20: a world career (~47,000 players) is mutated in
// place instead — cloning it cost 1–1.5 s and doubled memory on every click — and a failure of the
// operation or of the save restores the last committed snapshot from storage.
export async function commit(operation) {
  if (writing) throw new Error("انتظر اكتمال الحفظ الحالي.");
  writing = true;
  try {
    if (!state) throw new Error("ابدأ حفظة جديدة.");
    if (state.database !== "world") {
      const draft = structuredClone(state);
      const result = operation(draft);
      await saveGame(draft);
      state = draft;
      return result;
    }
    const draft = state;
    let result;
    try {
      result = operation(draft);
      await saveGame(draft);
    } catch (e) {
      await rollback();
      throw e;
    }
    return result;
  } finally {
    writing = false;
  }
}
// Restore the last committed snapshot: first from the encoded copy kept in memory (works even when
// IndexedDB or localStorage just failed), then from storage. If both fail the mutated in-memory
// state stays and the next successful commit replaces the snapshot.
async function rollback() {
  try {
    const restored = await restoreLastSnapshot();
    if (restored) {
      state = restored;
      return;
    }
  } catch {
    /* fall through to storage */
  }
  try {
    const { state: restored } = await loadGame();
    if (restored) state = restored;
  } catch {
    /* keep the in-memory state */
  }
}
