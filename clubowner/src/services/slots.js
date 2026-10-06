// خانات الحفظ المتعددة 0.22b — لقطات كاملة مستقلة عن الحفظة النشطة.
// قاعدة IndexedDB منفصلة تمامًا (clubowner.slots) كي لا تمس منظومة تنظيف حفظ العالم
// في save.js التي تمسح أي مفاتيح غريبة داخل قاعدتها. الحفظة النشطة لا تتأثر بأي عملية هنا.
import { encodeLocalSave, decodeLocalSave } from "./localSaveCodec.js";
import { migrateSave } from "../core/migrations.js";
import { validateSave } from "../core/validation.js";
import { extendedClub } from "../data/expandedCatalog.js";

const DB_NAME = "clubowner.slots",
  INDEX_KEY = "clubowner.slots.v1",
  MAX_SLOTS = 6;

function readIndex() {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeIndex(list) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list));
}
function database() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB)
      return reject(
        new Error(
          "المتصفح لا يدعم التخزين المحلي للخانات. جرّب متصفحًا آخر خارج الوضع الخاص.",
        ),
      );
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("slots");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
const withStore = (mode) => (db, key, value) =>
  new Promise((resolve, reject) => {
    const t = db.transaction("slots", mode),
      store = t.objectStore("slots"),
      r = value === undefined ? store.get(key) : store.put(value, key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
const putSlot = withStore("readwrite");
const getSlot = withStore("readonly");
const removeSlot = (db, key) =>
  new Promise((resolve, reject) => {
    const t = db.transaction("slots", "readwrite"),
      r = t.objectStore("slots").delete(key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
    t.onerror = () => reject(t.error);
  });

export const listSlots = () => readIndex();
export const slotsFull = () => readIndex().length >= MAX_SLOTS;
export const MAX_SAVE_SLOTS = MAX_SLOTS;

// تُخزَّن الحفظة كما هي؛ الترحيل والتحقق يحدثان عند التحميل (نفس مسار استيراد الملفات).
export async function writeSlot(s, name) {
  const list = readIndex();
  if (list.length >= MAX_SLOTS)
    throw new Error(
      `وصلت للحد الأقصى (${MAX_SLOTS}) خانات. احذف خانة لتوفير مساحة.`,
    );
  const id =
    "slot-" +
    (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  const world = s.database === "world";
  const payload = world ? await encodeLocalSave(s) : JSON.stringify(s);
  const size = world ? JSON.stringify(payload).length : payload.length;
  const db = await database();
  try {
    await putSlot(db, id, payload);
    list.push({
      id,
      name: (name || "").trim().slice(0, 40) || `خانة ${list.length + 1}`,
      clubId: s.clubId,
      clubName: extendedClub(s.clubId)?.name || s.clubId,
      date: s.date,
      season: s.seasonNumber,
      database: s.database,
      players: s.players.length,
      size,
      createdAt: new Date().toISOString(),
    });
    writeIndex(list);
    return id;
  } finally {
    db.close();
  }
}
export async function readSlot(id) {
  const meta = readIndex().find((x) => x.id === id);
  if (!meta) throw new Error("الخانة غير موجودة.");
  const db = await database();
  let payload;
  try {
    payload = await getSlot(db, id);
  } finally {
    db.close();
  }
  if (payload == null) throw new Error("محتوى الخانة تالف أو محذوف.");
  const state =
    meta.database === "world"
      ? await decodeLocalSave(payload)
      : JSON.parse(payload);
  return validateSave(migrateSave(state));
}
export async function deleteSlot(id) {
  const db = await database();
  try {
    await removeSlot(db, id);
  } finally {
    db.close();
  }
  writeIndex(readIndex().filter((x) => x.id !== id));
}
