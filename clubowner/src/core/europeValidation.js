import { extendedClub } from "../data/expandedCatalog.js";
import { europeanTable } from "../services/europe/table.js";
const integer = (v, max = 10000) =>
  Number.isSafeInteger(v) && v >= 0 && v <= max;
const id = (v) => typeof v === "string" && /^[a-zA-Z0-9_-]{1,150}$/.test(v);
const iso = (v) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v + "T12:00:00Z")) &&
  new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v;
const permutation = (a, b) =>
  Array.isArray(a) &&
  a.length === b.length &&
  new Set(a).size === b.length &&
  a.every((v) => b.includes(v));
export function validateEuropeanCup(c, s) {
  const fail = () => {
    throw Error("بيانات البطولة الأوروبية غير سليمة.");
  };
  const ok = (v) => {
    if (!v) fail();
  };
  ok(
    ["ucl", "uel", "uecl"].includes(c.kind) &&
      c.id === c.kind + "-s" + s.seasonNumber &&
      ["league", "playoff", "r16", "qf", "sf", "final", "complete"].includes(
        c.phase,
      ),
  );
  ok(
    c.entrants.length === 36 &&
      new Set(c.entrants).size === 36 &&
      c.results.length === 0,
  );
  ok(
    c.coefficients &&
      Object.keys(c.coefficients).length === 36 &&
      c.entrants.every(
        (v) =>
          typeof c.coefficients[v] === "number" &&
          Number.isFinite(c.coefficients[v]) &&
          c.coefficients[v] >= 0 &&
          c.coefficients[v] <= 1000000,
      ),
  );
  ok(
    Array.isArray(c.pots) &&
      c.pots.length === (c.kind === "uecl" ? 6 : 4) &&
      c.pots.every(
        (p) => Array.isArray(p) && p.length === (c.kind === "uecl" ? 6 : 9),
      ) &&
      permutation(c.pots.flat(), c.entrants),
  );
  ok(
    ["scenario-reputation", "saved-standings"].includes(
      c.qualificationSource,
    ) &&
      Array.isArray(c.qualification) &&
      c.qualification.length === 36 &&
      permutation(
        c.qualification.map((q) => q.clubId),
        c.entrants,
      ),
  );
  for (const q of c.qualification)
    ok(
      q.country === extendedClub(q.clubId)?.country &&
        integer(q.domesticRank, 40) &&
        q.domesticRank > 0,
    );
  ok(
    Array.isArray(c.fixtures) &&
      c.fixtures.length <= 200 &&
      new Set(c.fixtures.map((f) => f.id)).size === c.fixtures.length &&
      Array.isArray(c.ties) &&
      c.ties.length <= 23 &&
      new Set(c.ties.map((t) => t.id)).size === c.ties.length,
  );
  const stages = ["league", "playoff", "r16", "qf", "sf", "final"];
  for (const f of c.fixtures) {
    ok(
      id(f.id) &&
        iso(f.date) &&
        integer(f.round, 20) &&
        f.round > 0 &&
        stages.includes(f.stage) &&
        c.entrants.includes(f.home) &&
        c.entrants.includes(f.away) &&
        f.home !== f.away &&
        typeof f.played === "boolean" &&
        f.competition === c.name,
    );
    if (f.neutral !== undefined) ok(typeof f.neutral === "boolean");
    if (f.played) {
      ok(
        f.date <= s.date &&
          integer(f.homeGoals, 50) &&
          integer(f.awayGoals, 50) &&
          integer(f.regulationHome, 50) &&
          integer(f.regulationAway, 50),
      );
      if (f.extraTime) {
        ok(
          f.extraTime === true &&
            integer(f.extraHome, 10) &&
            integer(f.extraAway, 10) &&
            f.homeGoals === f.regulationHome + f.extraHome &&
            f.awayGoals === f.regulationAway + f.extraAway,
        );
      } else
        ok(
          f.homeGoals === f.regulationHome && f.awayGoals === f.regulationAway,
        );
      if (f.penaltyWinner)
        ok(
          f.extraTime &&
            [f.home, f.away].includes(f.penaltyWinner) &&
            integer(f.penaltiesHome, 40) &&
            integer(f.penaltiesAway, 40) &&
            f.penaltiesHome !== f.penaltiesAway &&
            f.penaltyWinner ===
              (f.penaltiesHome > f.penaltiesAway ? f.home : f.away),
        );
    } else ok(f.date >= s.date);
    if (f.stage === "league") {
      ok(
        !f.tieId && !f.winner && !f.penaltyWinner && !f.extraTime && !f.neutral,
      );
      if (f.played)
        ok(integer(f.homeDiscipline, 100) && integer(f.awayDiscipline, 100));
    } else ok(c.ties.some((t) => t.id === f.tieId && t.legs.includes(f.id)));
  }
  const league = c.fixtures.filter((f) => f.stage === "league"),
    rounds = c.kind === "uecl" ? 6 : 8;
  ok(league.length === rounds * 18);
  for (const club of c.entrants) {
    const games = league.filter((f) => [f.home, f.away].includes(club)),
      opponents = games.map((f) => (f.home === club ? f.away : f.home));
    ok(
      games.length === rounds &&
        new Set(opponents).size === rounds &&
        new Set(games.map((f) => f.round)).size === rounds &&
        games.every((f) => f.round <= rounds) &&
        games.filter((f) => f.home === club).length === rounds / 2,
    );
    const counts = {};
    for (const other of opponents) {
      const country = extendedClub(other).country;
      ok(country !== extendedClub(club).country);
      counts[country] = (counts[country] || 0) + 1;
      ok(counts[country] <= 2);
    }
    for (const pot of c.pots) {
      ok(
        opponents.filter((v) => pot.includes(v)).length ===
          (c.kind === "uecl" ? 1 : 2),
      );
      if (c.kind !== "uecl")
        ok(
          games.filter((f) => f.home === club && pot.includes(f.away))
            .length === 1,
        );
    }
    if (c.kind === "uecl")
      for (let i = 0; i < 6; i += 2) {
        const pair = [...c.pots[i], ...c.pots[i + 1]];
        ok(
          games.filter((f) => f.home === club && pair.includes(f.away))
            .length === 1,
        );
      }
  }
  ok(Array.isArray(c.ranking));
  if (c.phase === "league") {
    ok(
      c.ranking.length === 0 &&
        c.ties.length === 0 &&
        permutation(c.alive, c.entrants),
    );
  } else {
    ok(
      league.every((f) => f.played) &&
        permutation(c.ranking, c.entrants) &&
        JSON.stringify(c.ranking) ===
          JSON.stringify(europeanTable(c).map((r) => r.clubId)),
    );
  }
  for (const t of c.ties) {
    ok(
      id(t.id) &&
        stages.slice(1).includes(t.stage) &&
        c.entrants.includes(t.a) &&
        c.entrants.includes(t.b) &&
        t.a !== t.b &&
        integer(t.pathSeed, 24) &&
        t.pathSeed > 0 &&
        Array.isArray(t.legs) &&
        t.legs.length === (t.stage === "final" ? 1 : 2) &&
        new Set(t.legs).size === t.legs.length,
    );
    const legs = t.legs.map((id) => c.fixtures.find((f) => f.id === id));
    ok(legs.every((f) => f && f.tieId === t.id && f.stage === t.stage));
    ok(
      legs[0].home === t.a &&
        legs[0].away === t.b &&
        legs[0].leg === 1 &&
        !!legs[0].neutral === (t.stage === "final"),
    );
    if (legs.length === 2)
      ok(
        legs[1].home === t.b &&
          legs[1].away === t.a &&
          legs[1].leg === 2 &&
          !legs[1].neutral &&
          legs[1].date > legs[0].date &&
          (!legs[1].played || legs[0].played) &&
          !legs[0].winner &&
          !legs[0].extraTime,
      );
    const last = legs.at(-1);
    if (last.played) {
      const ga = legs.reduce(
          (n, f) => n + (f.home === t.a ? f.homeGoals : f.awayGoals),
          0,
        ),
        gb = legs.reduce(
          (n, f) => n + (f.home === t.b ? f.homeGoals : f.awayGoals),
          0,
        );
      ok(
        t.aggregateA === ga &&
          t.aggregateB === gb &&
          t.winner === last.winner &&
          t.winner === (ga > gb ? t.a : ga < gb ? t.b : last.penaltyWinner),
      );
    } else
      ok(!t.winner && t.aggregateA === undefined && t.aggregateB === undefined);
  }
  const expected = { playoff: 8, r16: 8, qf: 4, sf: 2, final: 1 };
  for (const stage of stages.slice(1)) {
    const count = c.ties.filter((t) => t.stage === stage).length;
    ok(
      count ===
        (stages.indexOf(stage) <=
        stages.indexOf(c.phase === "complete" ? "final" : c.phase)
          ? expected[stage]
          : 0),
    );
  }
  const playoff = c.ties.filter((t) => t.stage === "playoff");
  for (let band = 0; band < 4; band++) {
    const ties = playoff.filter((t) => t.band === band);
    if (!ties.length) continue;
    ok(
      ties.length === 2 &&
        new Set(ties.map((t) => t.side)).size === 2 &&
        ties.every((t) => [0, 1].includes(t.side)),
    );
    ok(
      permutation(
        ties.map((t) => t.b),
        c.ranking.slice(8 + band * 2, 10 + band * 2),
      ) &&
        permutation(
          ties.map((t) => t.a),
          c.ranking.slice(22 - band * 2, 24 - band * 2),
        ),
    );
  }
  const r16 = c.ties.filter((t) => t.stage === "r16");
  for (const [i, t] of r16.entries()) {
    const group = [0, 3, 1, 2, 0, 3, 1, 2][i],
      seeded = c.ranking.slice(group * 2, group * 2 + 2),
      p = playoff.find(
        (p) => p.band === 3 - group && p.side === (i < 4 ? 0 : 1),
      );
    ok(
      seeded.includes(t.b) &&
        t.a === p?.winner &&
        t.pathSeed === c.ranking.indexOf(t.b) + 1,
    );
  }
  for (const stage of ["qf", "sf", "final"]) {
    const previous = c.ties.filter(
      (t) => t.stage === { qf: "r16", sf: "qf", final: "sf" }[stage],
    );
    for (const [i, t] of c.ties.filter((t) => t.stage === stage).entries()) {
      const a = previous[i * 2],
        b = previous[i * 2 + 1];
      ok(
        a?.winner &&
          b?.winner &&
          permutation([t.a, t.b], [a.winner, b.winner]) &&
          t.pathSeed === Math.min(a.pathSeed, b.pathSeed),
      );
      if (stage !== "final")
        ok(t.b === (a.pathSeed < b.pathSeed ? a.winner : b.winner));
    }
  }
  if (c.phase !== "league" && c.phase !== "complete") {
    const previous = { r16: "playoff", qf: "r16", sf: "qf", final: "sf" }[
      c.phase
    ];
    const expectedAlive =
      c.phase === "playoff"
        ? c.ranking.slice(0, 24)
        : [
            ...(c.phase === "r16" ? c.ranking.slice(0, 8) : []),
            ...c.ties.filter((t) => t.stage === previous).map((t) => t.winner),
          ];
    ok(permutation(c.alive, expectedAlive));
    for (const t of c.ties.filter(
      (t) => stages.indexOf(t.stage) < stages.indexOf(c.phase),
    ))
      ok(!!t.winner);
  }
  const unplayed = c.fixtures.filter((f) => !f.played);
  if (c.phase === "complete")
    ok(
      c.winner === c.ties.find((t) => t.stage === "final")?.winner &&
        c.alive.length === 1 &&
        c.alive[0] === c.winner &&
        !unplayed.length,
    );
  else
    ok(
      !c.winner &&
        unplayed.length > 0 &&
        c.nextDate === unplayed.map((f) => f.date).sort()[0],
    );
}
