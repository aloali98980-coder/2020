import { MARKETS } from "../data/worldMarkets.js";
import { POSITIONS } from "../services/talent/state.js";
import { FOCUSES } from "../services/talent/training.js";
import { PLAYER_ROLES } from "../services/playerRoles.js";
export function validateTalent(s) {
  if (!s.expansion) return;
  const t = s.talent,
    fail = () => {
      throw Error("بيانات مركز المواهب غير سليمة.");
    },
    ok = (v) => {
      if (!v) fail();
    };
  const obj = (v) => v && typeof v === "object" && !Array.isArray(v),
    num = (v) => Number.isFinite(v) && v >= 0 && v <= 100,
    amount = (v) => Number.isSafeInteger(v) && v >= 0 && v <= 10000000000,
    id = (v) => typeof v === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(v),
    date = (v) =>
      typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      !isNaN(Date.parse(v)) &&
      new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v,
    month = (v) => typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v),
    range = (v, max = 100) =>
      Array.isArray(v) &&
      v.length === 2 &&
      v.every((x) => Number.isFinite(x) && x >= 0 && x <= max) &&
      v[0] <= v[1];
  const players = new Map(
      [...s.players, ...(s.retired || [])].map((p) => [p.id, p]),
    ),
    clubs = new Set(s.expansion.divisions.flatMap((d) => d.clubs));
  ok(
    obj(t) &&
      t.schema === 1 &&
      amount(t.serial) &&
      obj(t.academy) &&
      obj(t.scouting) &&
      obj(t.training) &&
      obj(t.world),
  );
  const a = t.academy;
  ok(
    amount(a.season) &&
      a.season <= s.seasonNumber &&
      Array.isArray(a.candidates) &&
      a.candidates.length <= 7 &&
      s.players.length + a.candidates.length <= 50000,
  );
  if (a.pending)
    ok(
      id(a.pending.id) &&
        amount(a.pending.season) &&
        a.pending.season <= s.seasonNumber &&
        date(a.pending.started) &&
        date(a.pending.due) &&
        a.pending.due >= a.pending.started &&
        [1, 2, 3, 4].includes(a.pending.level) &&
        amount(a.pending.fee),
    );
  for (const p of s.players) ok(!Object.hasOwn(Object.prototype, p.id));
  const candidateIds = new Set();
  for (const c of a.candidates) {
    const p = c.player;
    ok(
      obj(p) &&
        id(p.id) &&
        !players.has(p.id) &&
        !candidateIds.has(p.id) &&
        id(c.intakeId) &&
        date(c.expires) &&
        month(c.lastMonth) &&
        range(c.range) &&
        !Object.hasOwn(Object.prototype, p.id) &&
        p.fictional === true &&
        p.generated === true &&
        !p.sourceUrl &&
        !p.biographyUrl &&
        num(p.naturalFitness) &&
        amount(p.ageReference) &&
        p.retirementPlan === null &&
        (!p.injuryUntil || date(p.injuryUntil)) &&
        p.clubId === s.clubId &&
        p.status === "active" &&
        !p.loan &&
        typeof p.name === "string" &&
        p.name.length > 0 &&
        p.name.length < 150 &&
        typeof p.nationality === "string" &&
        typeof p.nameLatin === "string" &&
        POSITIONS.includes(p.position) &&
        p.age >= 16 &&
        p.age <= 20 &&
        Number.isInteger(p.age) &&
        num(p.rating) &&
        num(p.potential) &&
        num(p.fitness) &&
        num(p.morale) &&
        amount(p.salary) &&
        amount(p.value) &&
        date(p.birthDate) &&
        date(p.contractEnd) &&
        date(p.ageReferenceDate) &&
        date(p.contractTerms?.signedOn) &&
        [
          "appearanceBonus",
          "goalBonus",
          "annualRaisePct",
          "releaseClause",
        ].every((k) => amount(p.contractTerms[k])) &&
        p.contractTerms.annualRaisePct <= 15 &&
        obj(p.attributes) &&
        [
          "pace",
          "passing",
          "shooting",
          "defending",
          "stamina",
          "decisions",
        ].every((k) => num(p.attributes[k])) &&
        amount(p.appearances) &&
        amount(p.goals) &&
        ["يمنى", "يسرى"].includes(p.foot) &&
        ["أساسي", "مداورة", "بديل", "مشروع للمستقبل"].includes(p.role) &&
        Array.isArray(p.careerHistory) &&
        p.careerHistory.length < 50,
    );
    candidateIds.add(p.id);
  }
  const q = t.scouting;
  ok(
    Array.isArray(q.missions) &&
      q.missions.length <= 40 &&
      new Set(q.missions.map((m) => m.id)).size === q.missions.length &&
      obj(q.reports) &&
      Object.keys(q.reports).length <= 200 &&
      Array.isArray(q.shortlist) &&
      q.shortlist.length <= 40 &&
      new Set(q.shortlist).size === q.shortlist.length &&
      q.shortlist.every((id) => players.has(id)),
  );
  for (const m of q.missions) {
    ok(
      id(m.id) &&
        (m.country === "all" || MARKETS.some((c) => c.id === m.country)) &&
        (m.position === "all" || POSITIONS.includes(m.position)) &&
        Number.isInteger(m.minAge) &&
        Number.isInteger(m.maxAge) &&
        m.minAge >= 16 &&
        m.maxAge <= 40 &&
        m.minAge <= m.maxAge &&
        amount(m.budget) &&
        [7, 21].includes(m.days) &&
        amount(m.fee) &&
        num(m.quality) &&
        date(m.started) &&
        date(m.due) &&
        m.due >= m.started &&
        ["running", "complete", "cancelled"].includes(m.status) &&
        (m.staffId === "external" || s.staff.some((p) => p.id === m.staffId)) &&
        (!m.playerId || players.has(m.playerId)) &&
        Array.isArray(m.results) &&
        m.results.length <= 6 &&
        m.results.every((id) => players.has(id)),
    );
  }
  ok(q.missions.filter((m) => m.status === "running").length <= 2);
  for (const [id, r] of Object.entries(q.reports))
    ok(
      players.has(id) &&
        r.playerId === id &&
        date(r.date) &&
        r.date <= s.date &&
        num(r.confidence) &&
        amount(r.visits) &&
        r.visits > 0 &&
        range(r.rating) &&
        range(r.potential) &&
        range(r.fee, 10000000000) &&
        amount(r.salary),
    );
  ok(Object.keys(t.training).length <= 100);
  for (const [id, p] of Object.entries(t.training))
    ok(
      players.has(id) &&
        FOCUSES.includes(p.focus) &&
        ["light", "normal", "intense"].includes(p.intensity) &&
        month(p.lastMonth) &&
        amount(p.appearances) &&
        p.appearances <= players.get(id).appearances,
    );
  const w = t.world;
  ok(
    typeof w.enabled === "boolean" &&
      (!w.lastMonth || month(w.lastMonth)) &&
      amount(w.cursor) &&
      amount(w.created) &&
      amount(w.recruited) &&
      amount(w.renewed) &&
      typeof w.limitNotice === "boolean" &&
      Array.isArray(w.history) &&
      w.history.length <= 100,
  );
  for (const h of w.history)
    ok(
      players.has(h.playerId) &&
        clubs.has(h.clubId) &&
        date(h.date) &&
        [
          "ai-renewal",
          "ai-academy",
          "ai-free-signing",
          "contract-expired",
        ].includes(h.type),
    );
  const roles = s.management.playerRoles;
  ok(obj(roles) && Object.keys(roles).length <= 100);
  for (const [id, role] of Object.entries(roles))
    ok(
      players.has(id) &&
        Object.hasOwn(PLAYER_ROLES, role) &&
        PLAYER_ROLES[role].positions.includes(players.get(id).position),
    );
  for (const m of s.inbox)
    if (m.required && m.status === "open" && m.kind === "academy-review")
      ok(a.candidates.some((c) => c.intakeId === m.ref));
}
