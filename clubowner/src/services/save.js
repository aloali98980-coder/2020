import { encodeLocalSave, decodeLocalSave } from "./localSaveCodec.js";
import { backupBlob, readBackup } from "./saveCompression.js";
import { migrateSave } from "../core/migrations.js";
import { validateSave } from "../core/validation.js";
export { validateSave } from "../core/validation.js";
const KEY = "clubowner.game.v1",
  BACKUP = "clubowner.backup.v1";
export function saveGame(s) {
  validateSave(s);
  if (s.database === "world") return saveLarge(s);
  const encoded = JSON.stringify(s),
    old = localStorage.getItem(KEY);
  if (old) localStorage.setItem(BACKUP, old);
  localStorage.setItem(KEY, encoded);
}
export async function loadGame() {
  let firstError = null;
  for (const key of [KEY, BACKUP]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      return {
        state: validateSave(
          migrateSave(
            JSON.parse(raw).storage === "indexeddb"
              ? await readLarge(
                  JSON.parse(raw).key ||
                    (key === BACKUP ? "backup" : "current"),
                )
              : JSON.parse(raw),
          ),
        ),
        backup: key === BACKUP,
      };
    } catch (e) {
      firstError = e;
    }
  }
  if (firstError) return { state: null, error: firstError.message };
  return { state: null };
}
// Compact JSON preserves every field while preventing whitespace alone from exceeding the import cap after a season.
export const encodeSave = (s) => JSON.stringify(s);
export async function exportGame(s) {
  const { blob, extension } = await backupBlob(s);
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `club-owner-${s.clubId}-${s.date}${extension}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
export async function importGame(file) {
  return validateSave(migrateSave(JSON.parse(await readBackup(file))));
}

// 0.20: the last committed encoded snapshot of a world career stays in memory (a few MB of
// compressed batches that the codec cache already retains). It lets the store roll back a failed
// in-place operation even when storage itself is the thing that failed.
let lastPacked = null;
export async function restoreLastSnapshot() {
  if (!lastPacked) return null;
  return validateSave(migrateSave(await decodeLocalSave(lastPacked)));
}
const DB_NAME = "clubowner.world.saves";
function database() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB)
      return reject(
        new Error(
          "المتصفح لا يدعم تخزين القاعدة الكبيرة. جرّب Safari أو Chrome خارج الوضع الخاص.",
        ),
      );
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("saves");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function readLarge(key) {
  const db = await database();
  try {
    const stored = await new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readonly");
      const r = tx.objectStore("saves").get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const s = await decodeLocalSave(stored);
    if (stored?.format === "clubowner-json-parts-v1") lastPacked = stored;
    return s;
  } finally {
    db.close();
  }
}
// Immutable snapshots: the localStorage pointer is the commit point. A failed
// pointer write cannot replace the last successful career in IndexedDB.
async function saveLarge(s) {
  const previous = localStorage.getItem(KEY);
  const key =
    "snapshot-" +
    (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  // Store small compressed binary batches, not a huge structured-clone object.
  // This also avoids WebKit Blob/File storage and reload memory failures.
  const packed = await encodeLocalSave(s);
  const db = await database();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readwrite");
      const request = tx.objectStore("saves").put(packed, key);
      request.onerror = () =>
        reject(request.error || new Error("تعذر كتابة النسخة المحلية."));
      tx.oncomplete = resolve;
      tx.onerror = () =>
        reject(tx.error || new Error("تعذر إتمام الحفظ المحلي."));
      tx.onabort = () =>
        reject(
          tx.error ||
            new Error("تعذر حفظ القاعدة الكبيرة؛ لم يتم تطبيق القرار."),
        );
    });
    if (previous) localStorage.setItem(BACKUP, previous);
    localStorage.setItem(
      KEY,
      JSON.stringify({
        storage: "indexeddb",
        key,
        version: s.version,
        date: s.date,
      }),
    );
    lastPacked = packed;
    // Best-effort cleanup AFTER committing. Keep both referenced snapshots.
    const keep = new Set([key]);
    try {
      const old = JSON.parse(previous || "null");
      if (old?.storage === "indexeddb") keep.add(old.key || "current");
    } catch {}
    try {
      await new Promise((resolve) => {
        const tx = db.transaction("saves", "readwrite"),
          store = tx.objectStore("saves");
        const r = store.openKeyCursor();
        r.onsuccess = () => {
          const c = r.result;
          if (c) {
            if (!keep.has(c.key)) store.delete(c.key);
            c.continue();
          }
        };
        tx.oncomplete = resolve;
        tx.onerror = resolve;
        tx.onabort = resolve;
      });
    } catch {
      /* A committed save remains successful even if orphan cleanup fails. */
    }
  } finally {
    db.close();
  }
}
