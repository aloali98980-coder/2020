import { FORMATIONS } from "../services/tactics.js";
import { daysBetween } from "./utils.js";
export function validateManagement(s, all) {
  const m = s.management,
    x = s.expansion;
  const fail = () => {
    throw Error("بيانات الإعارات أو التكتيك أو ملاحق الصعود غير سليمة.");
  };
  const text = (v) => typeof v === "string" && v.length > 0 && v.length < 1000,
    amount = (v) => Number.isSafeInteger(v) && v >= 0 && v <= 10000000000,
    date = (v) =>
      typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      !isNaN(Date.parse(v)) &&
      new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v;
  const t = m.tactics;
  if (
    !t ||
    typeof t.enabled !== "boolean" ||
    !Object.hasOwn(FORMATIONS, t.formation) ||
    !["low", "balanced", "high"].includes(t.press) ||
    !["slow", "normal", "fast"].includes(t.tempo) ||
    !["balanced", "possession", "direct", "counter"].includes(t.style) ||
    !["legacy", "windows"].includes(m.marketMode)
  )
    fail();
  const terms = (t) =>
    t &&
    [90, 180, 365].includes(t.days) &&
    amount(t.fee) &&
    amount(t.wageShare) &&
    t.wageShare <= 100 &&
    amount(t.buyOption) &&
    typeof t.recallAllowed === "boolean" &&
    ["rotation", "starter"].includes(t.role);
  if (
    !Array.isArray(m.loanOffers) ||
    m.loanOffers.length > 200 ||
    new Set(m.loanOffers.map((o) => o.id)).size !== m.loanOffers.length
  )
    fail();
  // 0.20: archived retirees still satisfy references from historical offers and roles.
  const players = new Map(
    [...s.players, ...(s.retired || [])].map((p) => [p.id, p]),
  );
  for (const o of m.loanOffers) {
    if (
      !text(o.id) ||
      !players.has(o.playerId) ||
      !all.includes(o.parent) ||
      !all.includes(o.borrower) ||
      o.parent === o.borrower ||
      !["in", "out"].includes(o.direction) ||
      (o.direction === "in"
        ? o.borrower !== s.clubId
        : o.parent !== s.clubId) ||
      !date(o.date) ||
      !date(o.replyDate) ||
      !date(o.expires) ||
      o.replyDate < o.date ||
      o.expires < o.date ||
      !["waiting", "countered", "accepted", "rejected", "expired"].includes(
        o.status,
      ) ||
      !terms(o.proposed) ||
      (o.counter && !terms(o.counter)) ||
      (o.status === "countered" && !o.counter)
    )
      fail();
  }
  const live = m.loanOffers.filter((o) =>
    ["waiting", "countered"].includes(o.status),
  );
  if (new Set(live.map((o) => o.playerId)).size !== live.length) fail();
  for (const p of s.players) {
    const l = p.loan;
    if (!l) continue;
    if (l.version !== undefined && l.version !== 2) fail();
    if (
      l.version === 2 &&
      (!text(l.id) ||
        !terms(l) ||
        !all.includes(l.parent) ||
        !all.includes(l.borrower) ||
        l.parent === l.borrower ||
        p.clubId !== l.borrower ||
        p.status === "retired" ||
        !date(l.starts) ||
        !date(l.until) ||
        daysBetween(l.starts, l.until) !== l.days ||
        p.contractEnd <= l.until ||
        !date(l.lastReview) ||
        l.lastReview < l.starts ||
        l.lastReview > s.date ||
        !amount(l.appearancesAtStart) ||
        l.appearancesAtStart > p.appearances ||
        !amount(l.reviewAppearances) ||
        l.reviewAppearances > p.appearances ||
        !amount(l.developmentAppearances) ||
        l.developmentAppearances > p.appearances ||
        !m.loanOffers.some(
          (o) =>
            o.id === l.id && o.status === "accepted" && o.playerId === p.id,
        ) ||
        [l.lastPayroll, l.lastDevelopment, l.lastAppearanceDate].some(
          (d) => d !== undefined && (!date(d) || d > s.date),
        ))
    )
      fail();
  }
  for (const msg of s.inbox)
    if (
      msg.kind === "loan-offer" &&
      msg.required &&
      msg.status === "open" &&
      !m.loanOffers.some((o) => o.id === msg.ref && o.status === "countered")
    )
      fail();
  if (
    ![0, 1, 2].includes(x.promotionVersion) ||
    !Array.isArray(x.playoffs) ||
    x.playoffs.length > 2
  )
    fail();
  if (x.promotionVersion === 2) {
    if (
      !x.clubRules ||
      typeof x.clubRules !== "object" ||
      Array.isArray(x.clubRules)
    )
      fail();
    for (const [id, r] of Object.entries(x.clubRules))
      if (
        !all.includes(id) ||
        !r ||
        ![2, 3, 4].includes(r.ceilingTier) ||
        (r.parentId && (!all.includes(r.parentId) || id === r.parentId))
      )
        fail();
    for (const d of x.divisions)
      if (
        d.connection !== undefined &&
        !["open", "closed"].includes(d.connection)
      )
        fail();
  }
  for (const p of x.playoffs) {
    if (
      !text(p.id) ||
      !text(p.name) ||
      ![1, 2].includes(p.places) ||
      p.legs !== (p.places === 1 ? 2 : 1) ||
      !Array.isArray(p.clubs) ||
      p.clubs.length !== (p.places === 1 ? 4 : 6) ||
      new Set(p.clubs).size !== p.clubs.length ||
      !p.clubs.every((id) => all.includes(id)) ||
      !Array.isArray(p.table) ||
      p.table.length !== p.clubs.length ||
      new Set(p.table.map((r) => r.clubId)).size !== p.clubs.length ||
      !Array.isArray(p.fixtures) ||
      p.fixtures.length !== (p.places === 1 ? 12 : 15) ||
      !Array.isArray(p.winners) ||
      ![0, p.places].includes(p.winners.length) ||
      new Set(p.winners).size !== p.winners.length ||
      !p.winners.every((id) => p.clubs.includes(id)) ||
      !Array.isArray(p.sourceGroups) ||
      !p.sourceGroups.every((id) => x.divisions.some((d) => d.id === id))
    )
      fail();
    if (
      p.winners.length &&
      (!p.fixtures.every((f) => f.played) || !date(p.finished))
    )
      fail();
    const rows = new Map(
      p.clubs.map((id) => [
        id,
        { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 },
      ]),
    );
    const ids = new Set();
    for (const f of p.fixtures) {
      if (
        !text(f.id) ||
        ids.has(f.id) ||
        !date(f.date) ||
        !p.clubs.includes(f.home) ||
        !p.clubs.includes(f.away) ||
        f.home === f.away ||
        typeof f.played !== "boolean" ||
        f.competition !== p.name ||
        (f.played && (!amount(f.homeGoals) || !amount(f.awayGoals)))
      )
        fail();
      ids.add(f.id);
      if (f.played) {
        const h = rows.get(f.home),
          a = rows.get(f.away);
        h.played++;
        a.played++;
        h.gf += f.homeGoals;
        h.ga += f.awayGoals;
        a.gf += f.awayGoals;
        a.ga += f.homeGoals;
        if (f.homeGoals === f.awayGoals) {
          h.draws++;
          a.draws++;
          h.points++;
          a.points++;
        } else {
          const w = f.homeGoals > f.awayGoals ? h : a,
            l = w === h ? a : h;
          w.wins++;
          w.points += 3;
          l.losses++;
        }
      }
    }
    for (const r of p.table)
      if (
        !rows.has(r.clubId) ||
        Object.keys(rows.get(r.clubId)).some(
          (k) => r[k] !== rows.get(r.clubId)[k],
        )
      )
        fail();
  }
}
