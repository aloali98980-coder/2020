// 0.49 — background saving: commit() publishes without waiting for storage, writes are debounced
// and coalesced, world operations wait only for the snapshot capture, failures roll back without
// losing confirmed decisions, and the head of a world save is cut into cached sections.
import test from "node:test";
import assert from "node:assert/strict";
import { installMemoryStorage, stats } from "./fixtures/memoryStorage.js";
installMemoryStorage();
const { createGame } = await import("../src/core/game.js");
const { DIVISIONS } = await import("../src/data/expandedCatalog.js");
const { loadGame } = await import("../src/services/save.js");
const { migrateSave } = await import("../src/core/migrations.js");
const codec = await import("../src/services/localSaveCodec.js");
const store = await import("../src/core/store.js");
const {
  commit,
  flushSave,
  replaceState,
  saveStatus,
  hasUnsavedChanges,
  getState,
  SAVE_DEBOUNCE_MS,
  SAVE_MAX_WAIT_MS,
} = store;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const world = () =>
  createGame({
    database: "world",
    expanded: true,
    clubId: DIVISIONS.find((d) => d.id === "eg-1").clubs[0],
    leagues: ["eg"],
    difficulty: "easy",
  });
const price = (p) => (s) => {
  s.ticketPrice = p;
};
const stored = async () => (await loadGame()).state;
// As loaded by the app: a fresh career goes through migrateSave on its first load, and rollback
// restores through the same path, so compare like with like.
const WORLD = migrateSave(world());

test("0.49 commit publishes immediately; the write happens later and only once it is flushed", async () => {
  await replaceState(createGame({ database: "demo" }));
  await commit(price(131));
  assert.equal(getState().ticketPrice, 131, "the decision is visible at once");
  assert.equal(saveStatus().status, "pending");
  assert.equal(hasUnsavedChanges(), true);
  assert.notEqual((await stored()).ticketPrice, 131, "not yet written");
  await flushSave();
  assert.equal(saveStatus().status, "saved");
  assert.equal(hasUnsavedChanges(), false);
  assert.equal((await stored()).ticketPrice, 131);
});

test("0.49 debounce: a burst of decisions becomes one write of the newest state", async () => {
  await replaceState(WORLD);
  const puts = stats.puts;
  for (const p of [120, 121, 122, 123, 124]) {
    await commit(price(p));
    await sleep(20);
  }
  assert.equal(stats.puts, puts, "nothing written while clicks keep coming");
  await sleep(SAVE_DEBOUNCE_MS + 150);
  while (hasUnsavedChanges()) await sleep(20);
  assert.equal(stats.puts - puts, 1, "one coalesced write");
  assert.equal((await stored()).ticketPrice, 124);
});

test("0.49 max wait: steady decisions are still written within SAVE_MAX_WAIT_MS", async () => {
  await replaceState(WORLD);
  const puts = stats.puts,
    start = Date.now();
  let firstWriteAt = 0;
  while (Date.now() - start < SAVE_MAX_WAIT_MS + 900) {
    await commit(price(150 + ((Date.now() - start) % 40)));
    if (!firstWriteAt && stats.puts > puts) firstWriteAt = Date.now() - start;
    await sleep(SAVE_DEBOUNCE_MS / 3);
  }
  assert.ok(firstWriteAt > 0, "a write happened during the stream of decisions");
  assert.ok(
    firstWriteAt <= SAVE_MAX_WAIT_MS + 600,
    `first write after ${firstWriteAt} ms`,
  );
  await flushSave();
});

test("0.49 smart batching: decisions during an in-flight write merge into one follow-up write", async () => {
  await replaceState(WORLD);
  stats.putDelayMs = 250;
  try {
    const puts = stats.puts;
    await commit(price(201));
    const first = flushSave(); // write #1 starts now
    await sleep(60); // its capture is done; IndexedDB is still busy
    const t = performance.now();
    await commit(price(202));
    await commit(price(203));
    assert.ok(
      performance.now() - t < 200,
      "a world decision waits for the snapshot capture, not for the storage write",
    );
    await first;
    await flushSave();
    assert.equal(stats.puts - puts, 2, "write #1 + one merged write for 202 and 203");
    assert.equal((await stored()).ticketPrice, 203);
  } finally {
    stats.putDelayMs = 0;
  }
});

test("0.49 a failed write keeps the decision in memory, reports an error and recovers on retry", async () => {
  await replaceState(WORLD);
  await commit(price(222));
  stats.failNextPut = true;
  await assert.rejects(() => flushSave(), /Quota/);
  assert.equal(saveStatus().status, "error");
  assert.match(saveStatus().error, /Quota/);
  assert.equal(getState().ticketPrice, 222, "the decision is not lost");
  assert.equal(hasUnsavedChanges(), true);
  assert.notEqual((await stored()).ticketPrice, 222);
  await flushSave();
  assert.equal(saveStatus().status, "saved");
  assert.equal((await stored()).ticketPrice, 222);
});

test("0.49 a failed world operation rolls back to the last durable save AND replays unsaved decisions", async () => {
  await replaceState(WORLD);
  await commit(price(301));
  await flushSave(); // durable: 301
  await commit(price(302)); // committed, not yet durable
  await commit((s) => {
    s.reputation = (s.reputation || 0) + 1;
  });
  const expected = JSON.stringify(getState());
  const rating = getState().players[0].rating;
  await assert.rejects(
    () =>
      commit((s) => {
        s.ticketPrice = 999;
        s.players[0].rating = 1;
        throw new Error("boom");
      }),
    /boom/,
  );
  const s = getState();
  assert.equal(s.ticketPrice, 302, "unsaved decision replayed");
  assert.equal(s.players[0].rating, rating, "partial mutation undone");
  assert.ok(JSON.stringify(s) === expected, "exactly the last committed state");
  await flushSave();
  assert.equal((await stored()).ticketPrice, 302);
});

test("0.49 rollback during an in-flight write lands on the snapshot that write captured", async () => {
  await replaceState(WORLD);
  stats.putDelayMs = 200;
  try {
    await commit(price(401));
    const writing = flushSave();
    await sleep(60);
    const expected = JSON.stringify(getState());
    await assert.rejects(
      () =>
        commit((s) => {
          s.ticketPrice = 1;
          throw new Error("late failure");
        }),
      /late failure/,
    );
    await writing;
    assert.ok(JSON.stringify(getState()) === expected, "the captured snapshot, nothing lost");
    assert.equal((await stored()).ticketPrice, 401);
  } finally {
    stats.putDelayMs = 0;
  }
});

test("0.49 replaceState settles the old career first so its write cannot overwrite the new one", async () => {
  await replaceState(WORLD);
  stats.putDelayMs = 150;
  try {
    await commit(price(480));
    const fresh = createGame({ database: "demo" });
    fresh.ticketPrice = 77;
    await replaceState(fresh);
    await sleep(SAVE_DEBOUNCE_MS + 300);
    const s = await stored();
    assert.equal(s.database, "demo");
    assert.equal(s.ticketPrice, 77);
    assert.equal(hasUnsavedChanges(), false);
  } finally {
    stats.putDelayMs = 0;
  }
});

test("0.49 codec: world head is cut into cached sections, round-trips byte-identically and re-encodes only what changed", async () => {
  codec.resetLocalSaveCache();
  const s = structuredClone(WORLD);
  let captured = false;
  const first = await codec.encodeLocalSave(s, { onCaptured: () => (captured = true) });
  assert.ok(captured);
  assert.equal(first.format, "clubowner-json-parts-v2");
  assert.ok(first.sections.length >= 3, `${first.sections.length} sections`);
  const sectionParts = first.sections.reduce((n, x) => n + x.parts.length, 0);
  assert.equal(JSON.stringify(await codec.decodeLocalSave(first)), JSON.stringify(s));
  s.ticketPrice += 5;
  const small = await codec.encodeLocalSave(s);
  assert.equal(small.reusedSections, sectionParts, "a head-only change re-encodes no section");
  assert.equal(small.reused, small.parts.length, "and no player batch");
  // Change one listing: only its chunk is re-encoded.
  const listing = s.stockMarket.listings[5];
  assert.ok(
    first.sections.some((x) => x.path.join(".") === "stockMarket.listings"),
    "stock listings are a section",
  );
  listing.price = (listing.price || 1) + 1;
  const one = await codec.encodeLocalSave(s);
  assert.equal(one.reusedSections, sectionParts - 1);
  assert.equal(JSON.stringify(await codec.decodeLocalSave(one)), JSON.stringify(s));
  // Small careers keep the original v1 layout (no sections).
  const demo = await codec.encodeLocalSave(createGame({ database: "demo" }));
  assert.equal(demo.format, "clubowner-json-parts-v1");
  assert.equal(demo.sections, undefined);
  // Malformed sections are refused.
  const bad = { ...first, sections: [{ ...first.sections[0], path: ["__nope__", "x"] }] };
  await assert.rejects(() => codec.decodeLocalSave(bad), /قسم حفظ غير سليم/);
  await assert.rejects(
    () => codec.decodeLocalSave({ ...first, sections: [{ path: [], kind: "array", parts: [] }] }),
    /قسم حفظ غير سليم/,
  );
});

test("0.49 the UI no longer blocks on saving: apply() has no busy overlay and the indicator is a status", async () => {
  const { readFileSync } = await import("node:fs");
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  const apply = main.slice(main.indexOf("async function apply("), main.indexOf("function paintSaveIndicator"));
  assert.ok(!apply.includes("saving-game"), "apply() must not dim or disable the page");
  assert.match(main, /onSaveStatus\(paintSaveIndicator\)/);
  assert.match(main, /"save-retry"/);
  assert.match(main, /visibilitychange/);
  const motion = readFileSync(new URL("../src/styles/motion.css", import.meta.url), "utf8");
  const pending = motion.slice(motion.indexOf("body.save-pending"), motion.indexOf("body.save-pending") + 200);
  assert.ok(!/pointer-events/.test(pending));
});
