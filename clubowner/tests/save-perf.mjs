// Save-pipeline benchmark (0.49): a world career with 10 leagues, measured through the real
// store.commit() path with an in-memory IndexedDB that structured-clones every put.
// Reports, per scenario, how long the UI is held (commit() promise), how long until the change is
// durable (flushSave(), when it exists), the longest main-thread block, and the physical writes.
// Usage: node --max-old-space-size=4096 tests/save-perf.mjs [--json out.json]
import { writeFileSync } from "node:fs";
import { installMemoryStorage, stats } from "./fixtures/memoryStorage.js";
installMemoryStorage();
const { createGame } = await import("../src/core/game.js");
const { DIVISIONS } = await import("../src/data/expandedCatalog.js");
const { validateSave } = await import("../src/core/validation.js");
const { advanceTime } = await import("../src/services/time.js");
const codec = await import("../src/services/localSaveCodec.js");
const store = await import("../src/core/store.js");

const LEAGUES = ["eg", "en", "sa", "es", "de", "it", "fr", "pt", "nl", "be"];
const RUNS = Number(process.env.RUNS || 3);
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const ms = (x) => Math.round(x * 10) / 10;
const resolveRequired = (s) => {
  for (const m of s.inbox) if (m.required) m.status = "resolved";
};
const durable = () => store.flushSave?.() ?? Promise.resolve();

let t = performance.now();
const s = createGame({
  database: "world",
  expanded: true,
  clubId: DIVISIONS.find((d) => d.id === "eg-1").clubs[0],
  leagues: LEAGUES,
  difficulty: "easy",
});
const created = performance.now() - t;
const jsonBytes = Buffer.byteLength(JSON.stringify(s));
store.setState(s);
// Prime: first save is a cold encode (every batch compressed). Not part of the decision timings.
t = performance.now();
await store.commit(() => {});
await durable();
const cold = performance.now() - t;

// Longest main-thread block: the biggest gap between consecutive turns of a setTimeout(0) loop
// (what a page would feel as a frozen frame / unresponsive click).
function blockMonitor() {
  let last = performance.now(),
    max = 0,
    on = true;
  const tick = () => {
    const now = performance.now();
    max = Math.max(max, now - last);
    last = now;
    if (on) setTimeout(tick, 0);
  };
  setTimeout(tick, 0);
  return {
    reset() {
      const was = max;
      max = 0;
      last = performance.now();
      return was;
    },
    stop: () => ((on = false), max),
  };
}
async function scenario(name, op, repeat = 1) {
  const rows = [];
  for (let run = 0; run < RUNS; run++) {
    let held = 0;
    const h = blockMonitor();
    await new Promise((r) => setTimeout(r, 5));
    h.reset();
    const puts0 = stats.puts;
    const start = performance.now();
    for (let i = 0; i < repeat; i++) {
      const a = performance.now();
      await store.commit(op);
      held = Math.max(held, performance.now() - a);
      await new Promise((r) => setTimeout(r, 0)); // separate clicks = separate tasks
    }
    const released = performance.now() - start;
    const heldBlock = h.reset();
    await durable();
    const total = performance.now() - start;
    await new Promise((r) => setTimeout(r, 5));
    const saveBlock = h.stop();
    rows.push({
      held,
      released,
      total,
      block: Math.max(heldBlock, saveBlock),
      saveBlock,
      puts: stats.puts - puts0,
    });
  }
  const pick = (k) => ms(median(rows.map((r) => r[k])));
  return {
    name,
    repeat,
    heldPerDecisionMs: pick("held"),
    uiFreeAfterMs: pick("released"),
    durableAfterMs: pick("total"),
    longestBlockMs: pick("block"),
    // Longest block after commit() returned, i.e. while the page is usable and the write runs.
    backgroundBlockMs: pick("saveBlock"),
    writes: pick("puts"),
  };
}

// Pipeline breakdown on the current state (synchronous parts measured directly).
const parts = {};
t = performance.now();
validateSave(store.getState());
parts.validateMs = ms(performance.now() - t);
t = performance.now();
const packed = await codec.encodeLocalSave(store.getState());
parts.encodeWarmMs = ms(performance.now() - t);
parts.reusedBatches = `${packed.reused}/${packed.parts.length}`;
t = performance.now();
structuredClone(packed);
parts.idbCloneMs = ms(performance.now() - t);
parts.packedMB =
  ms(
    (packed.head.byteLength + packed.parts.reduce((n, p) => n + p.byteLength, 0)) /
      1048576,
  );

const results = [];
results.push(
  await scenario("small decision (ticket price)", (st) => {
    st.ticketPrice = st.ticketPrice === 120 ? 125 : 120;
  }),
);
results.push(
  await scenario(
    "burst of 5 small decisions",
    (st) => {
      st.ticketPrice = st.ticketPrice === 120 ? 125 : 120;
    },
    5,
  ),
);
results.push(
  await scenario("advance 1 day", (st) => {
    resolveRequired(st);
    advanceTime(st, 1);
  }),
);
results.push(
  await scenario("advance 7 days", (st) => {
    resolveRequired(st);
    advanceTime(st, 7);
  }),
);

const report = {
  leagues: LEAGUES.length,
  players: store.getState().players.length,
  saveJsonMB: ms(jsonBytes / 1048576),
  createMs: ms(created),
  coldSaveMs: ms(cold),
  pipeline: parts,
  scenarios: results,
};
console.log(JSON.stringify(report, null, 2));
const out = process.argv.indexOf("--json");
if (out > 0) writeFileSync(process.argv[out + 1], JSON.stringify(report, null, 2));
