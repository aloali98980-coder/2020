import { saveBlob } from "./saveEncoding.js";
import { ageAt } from "../models/player.js";
import { readBackup, MAX_SAVE_BYTES } from "./saveCompression.js";
const FORMAT = "clubowner-json-parts-v1";
const MAX_PARTS = 4000;
// Player batches end at players whose id hash hits the mask (average ~128 players) or at 256
// players, whichever comes first. Boundaries therefore travel with the players: adding or
// removing one record only changes the batch it belongs to, and every other batch keeps the
// gzip bytes cached from the previous save instead of being re-encoded (0.20).
const PART_MASK = 127;
const PART_MAX = 256;
const CONCURRENCY = 4;
let cache = new Map();

export function resetLocalSaveCache() {
  cache = new Map();
}

const idHash = (id) => {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
};
// UTF-8 encode a batch into a reusable scratch buffer and hash it 32 bits at a time. Two
// independent multiplicative hashes plus the byte length make a false cache hit practically
// impossible for two different batch strings. The returned view is valid until the next call.
const encoder = new TextEncoder();
let scratch = new Uint8Array(1 << 20);
function digest(text) {
  if (scratch.length < text.length * 3) scratch = new Uint8Array(text.length * 3);
  const { written } = encoder.encodeInto(text, scratch);
  const words = written >> 2;
  const u32 = new Uint32Array(scratch.buffer, 0, words);
  let a = 0x811c9dc5,
    b = 0x1234567;
  for (let i = 0; i < words; i++) {
    const w = u32[i];
    a = Math.imul(a ^ w, 16777619);
    b = (Math.imul(b, 31) + w) | 0;
  }
  for (let i = words << 2; i < written; i++) {
    a = Math.imul(a ^ scratch[i], 16777619);
    b = (Math.imul(b, 31) + scratch[i]) | 0;
  }
  return { key: `${a >>> 0}:${b >>> 0}:${written}`, bytes: scratch.subarray(0, written) };
}
export function playerBatches(players) {
  const bounds = [];
  let start = 0;
  for (let i = 0; i < players.length; i++) {
    const n = i - start + 1;
    if (n >= PART_MAX || (idHash(String(players[i].id)) & PART_MASK) === 0) {
      bounds.push([start, i + 1]);
      start = i + 1;
    }
  }
  if (start < players.length) bounds.push([start, players.length]);
  return bounds;
}
async function gzipBlob(raw) {
  const b =
    typeof CompressionStream === "undefined"
      ? raw
      : await new Response(
          raw.stream().pipeThrough(new CompressionStream("gzip")),
        ).blob();
  return new Uint8Array(await b.arrayBuffer());
}
async function binary(value, checkSize) {
  const raw = saveBlob(value);
  checkSize(raw.size);
  return gzipBlob(raw);
}
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
// Batch JSON is produced with age written as 0 and recomputed from the birthday on load: the
// only field that changes for otherwise untouched players on an ordinary day is age (about fifty
// birthdays a day across the world), which would otherwise dirty most cached batches every week.
// The mutation is synchronous and restored before anything can observe it.
function batchText(players, a, b) {
  const ages = new Array(b - a);
  for (let i = a; i < b; i++) {
    ages[i - a] = players[i].age;
    players[i].age = 0;
  }
  try {
    return JSON.stringify(players.slice(a, b));
  } finally {
    for (let i = a; i < b; i++) players[i].age = ages[i - a];
  }
}
// Read one small player batch at a time. Mobile reload must not allocate a
// 110 MB JSON string AND every player object while the previous page is alive.
// Typed arrays also avoid WebKit's IDB Blob/File preparation failure.
export async function encodeLocalSave(s) {
  let bytes = 0;
  const checkSize = (n) => {
    bytes += n;
    if (bytes > MAX_SAVE_BYTES)
      throw Error(
        "تجاوز الحفظ حد ١٦٠ MiB؛ احتفظ بالنسخة السابقة وقلل العالم في المشاوير الجديدة.",
      );
  };
  const head = await binary({ ...s, players: [] }, checkSize);
  const next = new Map();
  let reused = 0;
  const parts = await mapLimit(playerBatches(s.players), CONCURRENCY, async ([a, b]) => {
    const { key, bytes } = digest(batchText(s.players, a, b));
    let entry = cache.get(key) || next.get(key);
    if (!entry) {
      // Blob copies the scratch bytes synchronously, before the first await below.
      const raw = new Blob([bytes], { type: "application/json" });
      entry = { size: raw.size, bytes: await gzipBlob(raw) };
    } else reused++;
    checkSize(entry.size);
    next.set(key, entry);
    return entry.bytes;
  });
  cache = next;
  return { format: FORMAT, head, parts, playerCount: s.players.length, reused };
}
export async function decodeLocalSave(stored) {
  if (stored?.format === "clubowner-json-blob-v1")
    return JSON.parse(
      await readBackup(
        stored.payload instanceof Blob
          ? stored.payload
          : new Blob([stored.payload]),
      ),
    );
  if (stored?.format !== FORMAT) return stored; // Actual pre-0.8 object snapshots.
  if (
    !Array.isArray(stored.parts) ||
    stored.parts.length > MAX_PARTS ||
    !Number.isInteger(stored.playerCount) ||
    stored.playerCount < 0 ||
    stored.playerCount > 50000
  )
    throw Error("أجزاء الحفظ المحلي غير سليمة.");
  let total = 0;
  const read = async (value) => {
    const text = await readBackup(new Blob([value]));
    total += new TextEncoder().encode(text).byteLength;
    if (total > MAX_SAVE_BYTES)
      throw Error("أجزاء الحفظ تتجاوز حد الذاكرة المسموح.");
    return JSON.parse(text);
  };
  const s = await read(stored.head);
  if (!Array.isArray(s.players) || s.players.length)
    throw Error("رأس الحفظ المحلي غير سليم.");
  for (const part of stored.parts) {
    const players = await read(part);
    if (!Array.isArray(players) || players.length > PART_MAX)
      throw Error("دفعة لاعبين غير سليمة.");
    for (const p of players) s.players.push(p);
  }
  if (s.players.length !== stored.playerCount)
    throw Error("عدد لاعبي الحفظ غير متطابق.");
  if (typeof s.date === "string")
    for (const p of s.players) {
      if (typeof p.age !== "number" || p.age <= 0) p.age = ageAt(p, s.date);
    }
  return s;
}
