// Capacity/performance baseline for the long-career work (0.20).
// Full expanded world (all 50 markets): advances SEASONS seasons day by day and records, per
// season, the player population (active / retired / free agents / generated), save size (raw
// JSON and gzip), and per-day timing (average, p95, worst day and where it happened).
// Usage: SEASONS=3 OUT=/tmp/capacity-baseline.json node tests/capacity-baseline.mjs
import { writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { createGame } from "../src/core/game.js";
import { ALL_MARKETS } from "../src/data/worldMarkets.js";
import { advanceTime } from "../src/services/time.js";
import { validateSave } from "../src/core/validation.js";

const SEASONS = Number(process.env.SEASONS || 3);
const OUT = process.env.OUT || "/tmp/capacity-baseline.json";
const t0 = performance.now();
const s = createGame({ database: "world", expanded: true, leagues: ALL_MARKETS, difficulty: "easy" });
console.log(`created in ${Math.round(performance.now() - t0)} ms · players ${s.players.length} · divisions ${s.expansion.divisions.length}`);

const stats = (label) => {
  const active = s.players.filter((p) => p.status !== "retired");
  const retiredInPlayers = s.players.length - active.length;
  const archived = s.retired?.length || 0;
  const free = active.filter((p) => p.clubId === "لاعب حر").length;
  const generated = s.players.filter((p) => String(p.id).startsWith("gen") || p.generated).length;
  const staffPool = s.staff.filter((c) => c.status === "available").length;
  const squads = new Map();
  for (const p of active)
    if (p.clubId !== "لاعب حر") squads.set(p.clubId, (squads.get(p.clubId) || 0) + 1);
  const sizes = [...squads.values()].sort((a, b) => a - b);
  const w = s.talent?.world || {};
  const json = JSON.stringify(s);
  const row = {
    label,
    date: s.date,
    season: s.seasonNumber,
    players: s.players.length,
    active: active.length,
    retired: retiredInPlayers,
    archived,
    freeAgents: free,
    generated,
    staffPool,
    inbox: s.inbox.length,
    ledger: s.finance.ledger?.length || 0,
    jsonMB: +(json.length / 1048576).toFixed(1),
    gzMB: +(gzipSync(json).length / 1048576).toFixed(1),
    perPlayerBytes: Math.round(JSON.stringify(s.players).length / s.players.length),
    worldCreated: w.created || 0,
    worldRecruited: w.recruited || 0,
    retiredUnattached: w.retiredUnattached || 0,
    squadMin: sizes[0] || 0,
    squadP10: sizes[Math.floor(sizes.length * 0.1)] || 0,
    squadMedian: sizes[Math.floor(sizes.length / 2)] || 0,
    clubsUnder16: sizes.filter((n) => n < 16).length,
    budgetsUnder1M: Object.values(s.expansion.budgets).filter((b) => b < 1000000).length,
  };
  console.log(JSON.stringify(row));
  return row;
};
const seasons = [stats("start")];
const daily = [];
let day = 0;
const started = performance.now();
while (s.seasonNumber <= SEASONS && day < 400 * SEASONS) {
  const before = s.seasonNumber;
  for (const m of s.inbox) if (m.required) m.status = "resolved";
  const t = performance.now();
  advanceTime(s, 1);
  const ms = performance.now() - t;
  daily.push({ date: s.date, ms: +ms.toFixed(1) });
  day++;
  if (day % 60 === 0)
    console.log(`${s.date} season ${s.seasonNumber} players ${s.players.length} · ${Math.round((performance.now() - started) / 1000)} s elapsed · last day ${ms.toFixed(0)} ms`);
  if (s.seasonNumber > before) {
    validateSave(s);
    seasons.push(stats(`end of season ${before}`));
  }
}
const sorted = [...daily].sort((a, b) => a.ms - b.ms);
const pct = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))].ms;
const summary = {
  days: daily.length,
  avgMs: +(daily.reduce((n, d) => n + d.ms, 0) / daily.length).toFixed(1),
  p50Ms: pct(0.5),
  p95Ms: pct(0.95),
  worst: sorted.slice(-8).reverse(),
  monthStartAvgMs: +(daily.filter((d) => d.date.endsWith("-01")).reduce((n, d, _, a) => n + d.ms / a.length, 0)).toFixed(1),
  totalSeconds: Math.round((performance.now() - started) / 1000),
};
console.log(JSON.stringify(summary, null, 1));
writeFileSync(OUT, JSON.stringify({ seasons, summary, daily }, null, 1));
console.log("BASELINE_DONE", OUT);
