// محاكاة التوازن الاقتصادي (الدفعة 5 — القسم 4): مواسم بالمحرك الحقيقي.
// الأرقام فقط: يقيس خزينة النادي والثروة الشخصية وصافي الثروة والدين، ويكشف الإفلاس والثراء المفرط.
// قيد معلن: القرارات المطلوبة (required) تُغلق تلقائيًا دون تطبيق آثارها، لأن المحاكاة تقيس الاقتصاد لا الواجهة.
// الاستخدام: node scripts/balance-sim.mjs [seasons=10] [seed=1] [--json]
import { createGame } from "../src/core/game.js";
import { advanceTime } from "../src/services/time.js";
import { pendingActions } from "../src/services/inbox.js";
import { ensureEmpire, netWorth } from "../src/services/empire/wealth.js";

export function runBalance({ seasons = 10, seed = 1, leagues = ["eg"] } = {}) {
  const s = createGame({ database: "demo", leagues });
  s.seed = (seed * 2654435761) >>> 0 || 1;
  const startCash = s.finance.cash;
  const startNet = netWorth(s);
  const rows = [];
  let bankruptSeason = null;

  for (let i = 1; i <= seasons; i++) {
    let guard = 0;
    for (let day = 0; day < 365 && guard < 5000; ) {
      guard++;
      const step = Math.min(30, 365 - day);
      const r = advanceTime(s, step);
      if (r.advanced === 0 && r.blocked) {
        for (const m of pendingActions(s)) m.status = "resolved";
        continue;
      }
      if (r.advanced === 0) break;
      day += r.advanced;
    }
    const e = ensureEmpire(s);
    rows.push({
      season: i,
      date: s.date,
      cash: Math.round(s.finance.cash),
      personal: Math.round(e.personal || 0),
      debt: Math.round(e.debt || 0),
      net: Math.round(netWorth(s)),
      reputation: Math.round(s.reputation || 0),
    });
    if (s.finance.cash < 0 && bankruptSeason === null) bankruptSeason = i;
  }
  const last = rows[rows.length - 1];
  return {
    seasons,
    seed,
    startCash,
    startNet: Math.round(startNet),
    endCash: last?.cash ?? null,
    endNet: last?.net ?? null,
    endDebt: last?.debt ?? null,
    bankruptSeason,
    netMultiple: last && startNet ? +(last.net / startNet).toFixed(2) : null,
    rows,
  };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (isMain) {
  const seasons = Number(process.argv[2]) || 10;
  const seed = Number(process.argv[3]) || 1;
  const result = runBalance({ seasons, seed });
  if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 1));
  else {
    console.log(`seasons=${result.seasons} seed=${seed} startCash=${result.startCash} endCash=${result.endCash} startNet=${result.startNet} endNet=${result.endNet} netMultiple=${result.netMultiple}`);
    console.log(`bankruptSeason=${result.bankruptSeason ?? "none"}`);
    for (const r of result.rows) console.log(JSON.stringify(r));
  }
}
