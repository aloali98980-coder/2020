// تحليل دفتر الخزينة حسب الفئة (أداة تشخيص لمحاكاة التوازن).
import { createGame } from "../src/core/game.js";
import { advanceTime } from "../src/services/time.js";
import { pendingActions } from "../src/services/inbox.js";
const seasons = Number(process.argv[2]) || 1;
const s = createGame({ database: "demo", leagues: ["eg"] });
s.seed = ((Number(process.argv[3]) || 1) * 2654435761) >>> 0;
const agg = {};
let idx = 0;
for (let i = 1; i <= seasons; i++) {
  for (let day = 0; day < 365; ) {
    const r = advanceTime(s, Math.min(30, 365 - day));
    if (r.advanced === 0 && r.blocked) { for (const m of pendingActions(s)) m.status = "resolved"; continue; }
    if (r.advanced === 0) break;
    day += r.advanced;
  }
  for (const e of s.finance.ledger.slice(idx)) {
    const k = (e.category || e.kind || e.type || "?") + (e.amount < 0 ? " (-)" : " (+)");
    agg[k] = (agg[k] || 0) + (e.amount || 0);
  }
  idx = s.finance.ledger.length;
  console.log("season", i, "cash", Math.round(s.finance.cash));
}
const rows = Object.entries(agg).sort((a, b) => a[1] - b[1]);
for (const [k, v] of rows) console.log(String(Math.round(v)).padStart(14), k);
console.log("ledger keys sample", Object.keys(s.finance.ledger[0] || {}).join(","));
