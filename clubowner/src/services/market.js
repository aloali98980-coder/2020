import { assert, random } from "../core/utils.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { tr } from "../i18n/index.js";
import { post } from "./finance.js";
export function marketOpen(s, date = s.date) {
  if (!s.management || s.management.marketMode !== "windows") return true;
  const day = date.slice(5);
  return (
    (day >= "07-01" && day <= "09-30") || (day >= "01-01" && day <= "01-31")
  );
}
export function assertMarket(s, p) {
  assert(
    p?.clubId === "لاعب حر" || marketOpen(s),
    "سوق الانتقالات مغلق: نوافذ نموذجية في يناير ويوليو–سبتمبر، وليست لوائح القيد الرسمية.",
  );
}
export function teamPower(s, id) {
  const list = s.players
    .filter((p) => p.clubId === id && p.status !== "retired")
    .map((p) => p.rating)
    .sort((a, b) => b - a)
    .slice(0, 11);
  return list.length
    ? list.reduce((a, b) => a + b, 0) / list.length
    : s.expansion?.powers?.[id] || 60;
}
export function buyerNeed(s, id, p) {
  const squad = s.players.filter(
    (x) => x.clubId === id && x.status !== "retired",
  );
  const atPosition = squad.filter((x) => x.position === p.position);
  return (
    (atPosition.length < 2 ? 1.12 : 0.96) *
    (p.rating >= teamPower(s, id) - 3 ? 1.06 : 0.9)
  );
}
// 0.16: human-readable window banner. Model windows (Jan + Jul-Sep) are a
// scenario, never official registration rules.
export function windowStatus(s, date = s.date) {
  if (!s.management || s.management.marketMode !== "windows")
    return { mode: "legacy", open: true, label: "سوق مفتوح للحفظة القديمة" };
  const open = marketOpen(s, date);
  const year = date.slice(0, 4),
    day = date.slice(5);
  let next;
  if (day < "01-01") next = `${year}-01-01`;
  else if (day <= "01-31") next = `${year}-02-01`;
  else if (day < "07-01") next = `${year}-07-01`;
  else if (day <= "09-30") next = `${year}-10-01`;
  else next = `${Number(year) + 1}-01-01`;
  return {
    mode: "windows",
    open,
    next,
    label: open
      ? `السوق مفتوح حتى ${next}`
      : `السوق مغلق — يفتح ${next} (سيناريو، وليس قيدًا رسميًا)`,
  };
}
// 0.16: background AI-to-AI moves. Monthly, windows-gated, budget-checked;
// player counts never change (moves only). Reported in the press feed.
export function settleSellOnClause(s, player, fee) {
  const clauses = s.transferMarket?.clauses || [];
  let paid = 0;
  for (const clause of clauses) {
    if (clause.playerId !== player.id || !clause.sellOnPercent || clause.seller === player.clubId) continue;
    const amount = Math.round((fee * clause.sellOnPercent) / 100);
    if (!amount) continue;
    if (clause.seller === s.clubId) {
      post(
        s,
        amount,
        "sell-on",
        tr(`نسبة بيع مستقبلية لـ ${player.name}`, `Sell-on payment for ${player.name}`, `Pourcentage à la revente de ${player.name}`),
        `${clause.id}-resale-${s.date}`,
      );
      paid += amount;
    } else if (Object.hasOwn(s.expansion?.budgets || {}, clause.seller)) {
      s.expansion.budgets[clause.seller] += amount;
      paid += amount;
    }
    clause.lastResale = s.date;
    clause.lastResaleFee = fee;
    clause.totalPaid = (clause.totalPaid || 0) + amount;
  }
  return paid;
}
export function aiTransferDay(s) {
  if (!s.expansion || !marketOpen(s)) return 0;
  const deadline = s.date.endsWith("-09-30") || s.date.endsWith("-01-31");
  if (!s.date.endsWith("-10") && !deadline) return 0;
  if (s.expansion.lastAiTransferDate === s.date) return 0;
  s.expansion.lastAiTransferDate = s.date;
  const aiClubs = s.expansion.divisions
    .flatMap((d) => d.clubs)
    .filter((id) => id !== s.clubId);
  if (!aiClubs.length) return 0;
  const aiSet = new Set(aiClubs);
  const exchangeLocked = new Set();
  for (const exchange of s.transferMarket?.exchanges || [])
    if (["open", "agreed"].includes(exchange.status))
      for (const id of [...exchange.outgoingPlayerIds, ...exchange.incomingPlayerIds])
        exchangeLocked.add(id);
  // One pre-filtered trade block per day keeps window days near normal cost.
  const tradeBlock = s.players.filter(
    (p) =>
      aiSet.has(p.clubId) &&
      p.status !== "retired" &&
      !p.loan &&
      p.age < 33 &&
      !exchangeLocked.has(p.id),
  );
  const squadSize = new Map();
  for (const p of s.players) {
    if (p.status === "retired") continue;
    squadSize.set(p.clubId, (squadSize.get(p.clubId) || 0) + 1);
  }
  let moves = 0;
  for (let n = 0; n < 3 && moves < 3; n++) {
    const buyer = aiClubs[Math.floor(random(s) * aiClubs.length)];
    const budget = s.expansion.budgets?.[buyer] || 0;
    if (budget <= 0) continue;
    const power = teamPower(s, buyer);
    if ((squadSize.get(buyer) || 0) >= 45) continue;
    const pool = tradeBlock.filter(
      (p) =>
        p.clubId !== buyer &&
        p.rating >= power - 6 &&
        p.rating <= power + 6 &&
        p.value * 1.1 <= budget,
    );
    if (!pool.length) continue;
    const p = pool[Math.floor(random(s) * pool.length)],
      seller = p.clubId;
    if ((squadSize.get(seller) || 0) <= 18) continue;
    const fee = Math.round(
      p.value * (0.9 + random(s) * 0.3) * (deadline ? 1.5 : 1),
    );
    if ((s.expansion.budgets[buyer] || 0) < fee) continue;
    s.expansion.budgets[buyer] -= fee;
    if (Object.hasOwn(s.expansion.budgets, seller))
      s.expansion.budgets[seller] += fee;
    settleSellOnClause(s, p, fee);
    p.clubId = buyer;
    squadSize.set(buyer, (squadSize.get(buyer) || 0) + 1);
    squadSize.set(seller, (squadSize.get(seller) || 0) - 1);
    p.careerHistory.push({
      date: s.date,
      type: "transfer-ai",
      clubId: buyer,
      from: seller,
      fee,
    });
    s.press?.news?.unshift({
      date: s.date,
      title: `انتقال: ${p.name} إلى ${extendedClub(buyer)?.name || buyer} مقابل ${fee} (محاكاة).`,
      type: "سوق الانتقالات",
    });
    moves++;
  }
  if (s.press?.news) s.press.news = s.press.news.slice(0, 60);
  return moves;
}
