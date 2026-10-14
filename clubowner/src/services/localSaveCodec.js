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
// 0.49 smart batching of the head. The non-player part of a world career (divisions, cups,
// ultras groups, stock listings…) used to be one gzip part re-compressed on every save even when
// one field changed. Large nodes (depth 1–2, >= SECTION_MIN of JSON) now become their own
// "section": the node is replaced by null in the head and its entries are cut into chunks at
// content-defined boundaries (key / element id hash, or CHUNK_MAX bytes), each chunk cached by
// digest exactly like player batches. A ticket-price change therefore re-compresses ~2 KB instead
// of the whole ~5 MB head. Small careers produce no sections and keep the v1 format unchanged.
const FORMAT_V2 = "clubowner-json-parts-v2";
const SECTION_MIN = 16 * 1024;
const CHUNK_MAX = 32 * 1024;
const CHUNK_MASK = 15;
const MAX_DEPTH = 3;
const plain = (v) =>
  v !== null && typeof v === "object" && typeof v.toJSON !== "function";
const boundaryKey = (v, k) =>
  v && (typeof v.id === "string" || typeof v.id === "number") ? String(v.id) : String(k);
// Serialises `value` to the exact JSON.stringify text, except that large nodes are moved to
// `sections` and appear as null. Every byte is stringified once (children first, then joined).
// Depth 0–1 nodes are walked asynchronously so the capture can yield between children
// (`pause()`); deeper nodes are plain synchronous JSON.stringify calls of bounded size.
async function nodeText(value, path, depth, sections, pause) {
  if (depth >= MAX_DEPTH || !plain(value)) return JSON.stringify(value);
  const array = Array.isArray(value);
  const keys = array ? value.map((_, i) => i) : Object.keys(value);
  const items = [];
  let total = 2;
  for (const k of keys) {
    const child = value[k];
    const text =
      depth + 1 < MAX_DEPTH && plain(child)
        ? await nodeText(child, [...path, k], depth + 1, sections, pause)
        : JSON.stringify(child);
    if (text === undefined && !array) continue; // JSON.stringify drops these object members
    const item = array ? (text ?? "null") : JSON.stringify(k) + ":" + text;
    items.push({ item, mark: boundaryKey(child, k) });
    total += item.length + 1;
    await pause();
  }
  const [open, close] = array ? ["[", "]"] : ["{", "}"];
  if (depth === 0 || total < SECTION_MIN)
    return open + items.map((x) => x.item).join(",") + close;
  const chunks = [];
  let cur = [],
    size = 0;
  for (const { item, mark } of items) {
    cur.push(item);
    size += item.length + 1;
    if (size >= CHUNK_MAX || (idHash(mark) & CHUNK_MASK) === 0) {
      chunks.push(open + cur.join(",") + close);
      cur = [];
      size = 0;
    }
  }
  if (cur.length || !chunks.length) chunks.push(open + cur.join(",") + close);
  sections.push({ path, kind: array ? "array" : "object", chunks });
  return "null";
}
const nextTask = () =>
  globalThis.scheduler?.yield
    ? globalThis.scheduler.yield()
    : new Promise((resolve) => setTimeout(resolve, 0));
// Encoding has two phases. CAPTURE turns the state into digested byte copies (cache hits need
// nothing more) in slices that yield to the event loop every `sliceMs` so the page keeps
// painting and answering clicks. When capture ends the snapshot is complete and
// independent of the live state: `onCaptured` fires and the caller may mutate the state again.
// COMPRESS then gzips only the cache misses. Read one small batch at a time: mobile reload must
// not allocate a 110 MB JSON string, and typed arrays avoid WebKit's IDB Blob/File failure.
export async function encodeLocalSave(s, { onCaptured, sliceMs = 8 } = {}) {
  let bytes = 0;
  const checkSize = (n) => {
    bytes += n;
    if (bytes > MAX_SAVE_BYTES)
      throw Error(
        "تجاوز الحفظ حد 160 MiB؛ احتفظ بالنسخة السابقة وقلل العالم في المشاوير الجديدة.",
      );
  };
  const next = new Map();
  let reused = 0,
    reusedSections = 0;
  const take = (text) => {
    const { key, bytes: utf8 } = digest(text);
    let entry = next.get(key) || cache.get(key);
    const hit = !!entry;
    // Blob copies the scratch bytes synchronously; the scratch view is reused by the next digest.
    if (!entry) entry = { size: utf8.length, raw: new Blob([utf8], { type: "application/json" }) };
    checkSize(entry.size);
    next.set(key, entry);
    return { entry, hit };
  };
  let slice = performance.now();
  // Resolves immediately (no task switch) until the slice budget is spent.
  const pause = () => {
    if (!sliceMs || performance.now() - slice <= sliceMs) return;
    return nextTask().then(() => {
      slice = performance.now();
    });
  };
  const sections = [];
  const head = take(await nodeText({ ...s, players: [] }, [], 0, sections, pause)).entry;
  const sectionEntries = sections.map(({ path, kind, chunks }) => ({
    path,
    kind,
    entries: chunks.map((text) => {
      const { entry, hit } = take(text);
      if (hit) reusedSections++;
      return entry;
    }),
  }));
  const batches = playerBatches(s.players);
  const partEntries = new Array(batches.length);
  for (let i = 0; i < batches.length; i++) {
    const { entry, hit } = take(batchText(s.players, ...batches[i]));
    if (hit) reused++;
    partEntries[i] = entry;
    await pause();
  }
  onCaptured?.();
  // An entry may be shared with a concurrent encode (slot write during a background save):
  // compress it once and let both wait on the same promise.
  const misses = [...new Set(next.values())].filter((e) => !e.bytes);
  await mapLimit(misses, CONCURRENCY, (e) =>
    (e.pending ||= gzipBlob(e.raw).then((b) => {
      e.bytes = b;
      e.raw = null;
    })),
  );
  cache = next;
  const packed = {
    format: sections.length ? FORMAT_V2 : FORMAT,
    head: head.bytes,
    parts: partEntries.map((e) => e.bytes),
    playerCount: s.players.length,
    reused,
  };
  if (sections.length) {
    packed.sections = sectionEntries.map(({ path, kind, entries }) => ({
      path,
      kind,
      parts: entries.map((e) => e.bytes),
    }));
    packed.reusedSections = reusedSections;
  }
  return packed;
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
  if (stored?.format !== FORMAT && stored?.format !== FORMAT_V2) return stored; // Actual pre-0.8 object snapshots.
  const sections = stored.format === FORMAT_V2 ? stored.sections : [];
  if (
    !Array.isArray(sections) ||
    sections.reduce((n, x) => n + (Array.isArray(x?.parts) ? x.parts.length : MAX_PARTS), 0) >
      MAX_PARTS ||
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
  // Shallow sections first: a deeper section's path lives inside its parent's value.
  for (const section of [...sections].sort((a, b) => a.path.length - b.path.length)) {
    const { path, kind } = section;
    if (
      !Array.isArray(path) ||
      !path.length ||
      path.length >= MAX_DEPTH ||
      (kind !== "array" && kind !== "object")
    )
      throw Error("قسم حفظ غير سليم.");
    let parent = s;
    for (const k of path.slice(0, -1)) parent = parent?.[k];
    const last = path.at(-1);
    if (!plain(parent) || parent[last] !== null) throw Error("قسم حفظ غير سليم.");
    let value = kind === "array" ? [] : {};
    for (const part of section.parts) {
      const chunk = await read(part);
      if (kind === "array") {
        if (!Array.isArray(chunk)) throw Error("قسم حفظ غير سليم.");
        for (const item of chunk) value.push(item);
      } else {
        if (!plain(chunk) || Array.isArray(chunk)) throw Error("قسم حفظ غير سليم.");
        for (const k of Object.keys(chunk))
          Object.defineProperty(value, k, {
            value: chunk[k],
            enumerable: true,
            writable: true,
            configurable: true,
          });
      }
    }
    parent[last] = value;
  }
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
