import { isoDate } from "./isoDate.js";
import { validateAsiaState } from "./asiaValidation.js";
import { ASIAN_GUESTS, ASIAN_GUEST_IDS } from "../data/asianGuests.js";
import { validateConcacafState } from "./concacafValidation.js";
import {
  CONCACAF_GUESTS,
  CONCACAF_GUEST_IDS,
} from "../data/concacafGuests.js";
import { validateFifaCup, validateFifaState } from "./fifaValidation.js";
import { FIFA_GUESTS } from "../data/fifaGuests.js";
import { validateCompetition } from "./competitionValidation.js";
import { validateManagement } from "./managementValidation.js";
import { validateEuropeanCup } from "./europeValidation.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { BUSINESSES } from "../services/commerce.js";
export function validateExpansion(s) {
  if (!s.expansion) return;
  const fail = () => {
    throw Error("بيانات العالم الموسع غير سليمة.");
  };
  const num = (x) => Number.isFinite(x) && x >= 0;
  const amount = (x) => Number.isSafeInteger(x) && x >= 0;
  const date = isoDate;
  const text = (x) => typeof x === "string" && x.length < 1000;
  const x = s.expansion;
  if (
    x.schema !== 1 ||
    !Array.isArray(x.divisions) ||
    x.divisions.length > 160 ||
    !Array.isArray(x.cups) ||
    x.cups.length > 150 ||
    !Array.isArray(x.history) ||
    x.history.length > 10
  )
    fail();
  const all = [];
  for (const d of x.divisions) {
    if (
      !text(d.id) ||
      !text(d.name) ||
      !text(d.country) ||
      !amount(d.tier) ||
      d.tier < 1 ||
      d.tier > 4 ||
      !Array.isArray(d.clubs) ||
      d.clubs.length < 4 ||
      d.clubs.length > 40 ||
      !Array.isArray(d.table) ||
      d.table.length !== d.clubs.length ||
      !Array.isArray(d.fixtures) ||
      d.fixtures.length > 1800
    )
      fail();
    all.push(...d.clubs);
    if (!d.clubs.every((id) => extendedClub(id))) fail();
    if (new Set(d.table.map((r) => r.clubId)).size !== d.clubs.length) fail();
    for (const r of d.table)
      if (
        !d.clubs.includes(r.clubId) ||
        !["played", "wins", "draws", "losses", "gf", "ga", "points"].every(
          (k) => amount(r[k]),
        )
      )
        fail();
    if (new Set(d.fixtures.map((f) => f.id)).size !== d.fixtures.length) fail();
    for (const f of d.fixtures)
      if (
        !text(f.id) ||
        !date(f.date) ||
        !d.clubs.includes(f.home) ||
        !d.clubs.includes(f.away) ||
        f.home === f.away ||
        typeof f.played !== "boolean" ||
        (f.played && (!amount(f.homeGoals) || !amount(f.awayGoals)))
      )
        fail();
  }
  if (new Set(all).size !== all.length || !all.includes(s.clubId)) fail();
  const own = x.divisions.find((d) => d.clubs.includes(s.clubId));
  if (
    JSON.stringify(own.fixtures) !== JSON.stringify(s.fixtures) ||
    JSON.stringify(own.table) !== JSON.stringify(s.table)
  )
    fail();
  own.fixtures = s.fixtures;
  own.table = s.table;
  for (const c of x.cups) {
    if (
      !text(c.id) ||
      !text(c.name) ||
      !amount(c.round) ||
      !Array.isArray(c.entrants) ||
      c.entrants.length > 200 ||
      new Set(c.entrants).size !== c.entrants.length ||
      (c.engine !== undefined &&
        ![
          "europe-v1",
          "continental-v1",
          "fifa-v1",
          "asia-v1",
          "concacaf-v1",
        ].includes(c.engine)) ||
      !Array.isArray(c.alive) ||
      !c.alive.every((id) => c.entrants.includes(id)) ||
      new Set(c.alive).size !== c.alive.length ||
      !c.entrants.every(
        (id) =>
          all.includes(id) ||
          (c.engine === "fifa-v1" && FIFA_GUESTS.some((g) => g.id === id)) ||
          (["asia-v1", "fifa-v1"].includes(c.engine) &&
            ASIAN_GUEST_IDS.has(id)) ||
          (["concacaf-v1", "fifa-v1"].includes(c.engine) &&
            CONCACAF_GUEST_IDS.has(id)),
      ) ||
      !date(c.nextDate) ||
      !Array.isArray(c.results) ||
      c.results.length > 2000 ||
      (c.winner && !c.entrants.includes(c.winner))
    )
      fail();
  }
  if (
    x.europeanCoefficients &&
    (!Object.keys(x.europeanCoefficients).every((id) => all.includes(id)) ||
      !Object.values(x.europeanCoefficients).every(
        (v) => num(v) && v <= 1000000,
      ))
  )
    fail();
  if (
    x.competitionVersion !== undefined &&
    ![0, 1].includes(x.competitionVersion)
  )
    fail();
  for (const [a, b] of [
    ["caf", "confed"],
    ["lib", "suda"],
  ]) {
    const ca = x.cups.find(
        (c) => c.kind === a && c.engine === "continental-v1",
      ),
      cb = x.cups.find((c) => c.kind === b && c.engine === "continental-v1");
    if (
      ca &&
      cb &&
      ca.originalEntrants.some((id) => cb.originalEntrants.includes(id))
    )
      fail();
  }
  if (x.domesticHonours)
    for (const h of Object.values(x.domesticHonours))
      if (
        !h ||
        !all.includes(h.winner) ||
        (h.runnerUp && !all.includes(h.runnerUp)) ||
        !amount(h.season)
      )
        fail();
  validateFifaState(
    s,
    new Set([
      ...all,
      ...FIFA_GUESTS.map((c) => c.id),
      ...ASIAN_GUESTS.map((c) => c.id),
      ...CONCACAF_GUESTS.map((c) => c.id),
    ]),
  );
  validateAsiaState(s);
  validateConcacafState(s);
  const europeanEntrants = x.cups
    .filter((c) => c.engine === "europe-v1")
    .flatMap((c) => c.entrants);
  if (new Set(europeanEntrants).size !== europeanEntrants.length) fail();
  for (const c of x.cups) {
    if (c.engine === "fifa-v1") validateFifaCup(c, s);
    if (c.engine === "europe-v1") validateEuropeanCup(c, s);
    if (c.engine === "continental-v1") validateCompetition(c, s);
    if (c.pendingMatches !== undefined) {
      if (
        c.engine ||
        !Array.isArray(c.pendingMatches) ||
        c.pendingMatches.length > 100 ||
        !Array.isArray(c.roundWinners) ||
        c.roundWinners.length > 200 ||
        new Set(c.roundWinners).size !== c.roundWinners.length ||
        !c.roundWinners.every((id) => c.alive.includes(id))
      )
        fail();
      const ids = new Set(c.results.map((f) => f.id));
      for (const f of c.pendingMatches) {
        if (
          !text(f.id) ||
          ids.has(f.id) ||
          !date(f.date) ||
          !c.alive.includes(f.home) ||
          !c.alive.includes(f.away) ||
          f.home === f.away ||
          f.played !== false ||
          f.round !== c.round + 1 ||
          f.competition !== c.name
        )
          fail();
        ids.add(f.id);
      }
    }
  }
  for (const c of x.cups)
    for (const f of c.results) {
      if (
        !text(f.id) ||
        !date(f.date) ||
        !all.includes(f.home) ||
        !all.includes(f.away) ||
        f.home === f.away ||
        !amount(f.homeGoals) ||
        !amount(f.awayGoals) ||
        ![f.home, f.away].includes(f.winner) ||
        (f.penaltyWinner && ![f.home, f.away].includes(f.penaltyWinner))
      )
        fail();
    }
  for (const h of x.history)
    if (
      !amount(h.season) ||
      !amount(h.rank) ||
      !text(h.division) ||
      !date(h.date) ||
      !Array.isArray(h.tables) ||
      !Array.isArray(h.cups)
    )
      fail();
  if (
    !x.budgets ||
    !Object.values(x.budgets).every(amount) ||
    !Array.isArray(x.aiTransfers) ||
    x.aiTransfers.length > 100 ||
    !x.qualification
  )
    fail();
  const c = s.commerce;
  if (
    !c ||
    !Array.isArray(c.businesses) ||
    new Set(c.businesses).size !== c.businesses.length ||
    !c.businesses.every((id) => BUSINESSES[id]) ||
    ![
      "inventory",
      "shirtPrice",
      "shirtCost",
      "seasonTickets",
      "seasonTicketPrice",
      "ticketSeason",
    ].every((k) => amount(c[k])) ||
    c.inventory > 5000 ||
    c.seasonTickets > s.capacity ||
    !Array.isArray(c.history) ||
    c.history.length > 24 ||
    !c.history.every((h) => date(h.date) && Number.isSafeInteger(h.net))
  )
    fail();
  const m = s.management;
  if (
    !m ||
    !["balanced", "attack", "defend"].includes(m.tactic) ||
    !Array.isArray(m.lineup) ||
    m.lineup.length > 11 ||
    new Set(m.lineup).size !== m.lineup.length ||
    !m.lineup.every((id) => s.players.some((p) => p.id === id)) ||
    !Array.isArray(m.outgoing) ||
    m.outgoing.length > 2000
  )
    fail();
  if (
    m.coach &&
    (!text(m.coach.name) ||
      !text(m.coach.id) ||
      !num(m.coach.skill) ||
      !num(m.coach.confidence) ||
      !amount(m.coach.salary))
  )
    fail();
  for (const o of m.outgoing)
    if (
      !text(o.id) ||
      !amount(o.fee) ||
      !date(o.expires) ||
      !all.includes(o.buyer) ||
      !(
        s.players.some((p) => p.id === o.playerId) ||
        (s.retired || []).some((p) => p.id === o.playerId)
      ) ||
      !["open", "accepted", "rejected", "expired"].includes(o.status)
    )
      fail();
  if (
    m.lastScout &&
    (!text(m.lastScout.name) ||
      !date(m.lastScout.date) ||
      !num(m.lastScout.rating) ||
      !Array.isArray(m.lastScout.potentialRange) ||
      m.lastScout.potentialRange.length !== 2 ||
      !m.lastScout.potentialRange.every(num))
  )
    fail();
  validateManagement(s, all);
  const p = s.press;
  if (
    !p ||
    !num(p.trust) ||
    p.trust > 100 ||
    typeof p.delegate !== "boolean" ||
    !Array.isArray(p.questions) ||
    p.questions.length > 12 ||
    !Array.isArray(p.news) ||
    p.news.length > 100 ||
    !Array.isArray(p.promises) ||
    !p.questions.every((q) => text(q.id) && text(q.text) && date(q.date)) ||
    !p.news.every((n) => text(n.title) && text(n.type) && date(n.date))
  )
    fail();
  for (const player of s.players)
    if (
      (player.internationalCaps !== undefined &&
        !amount(player.internationalCaps)) ||
      (player.internationalGoals !== undefined &&
        !amount(player.internationalGoals)) ||
      (player.internationalUntil && !date(player.internationalUntil)) ||
      (player.loan &&
        (!all.includes(player.loan.parent) || !date(player.loan.until)))
    )
      fail();
}
