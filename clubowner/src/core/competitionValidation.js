import {
  CONTINENTAL,
  DOMESTIC,
  policy,
} from "../services/competitions/presets.js";
import { groupTable } from "../services/competitions/table.js";
import { extendedClub } from "../data/expandedCatalog.js";
export function validateCompetition(c, s) {
  const ok = (v) => {
    if (!v) throw Error("بيانات مجموعات أو أدوار كأس 0.9 غير سليمة.");
  };
  const array = (v, max = 2000) => Array.isArray(v) && v.length <= max;
  const unique = (v) => new Set(v).size === v.length;
  const n = (v, max = 10000) => Number.isSafeInteger(v) && v >= 0 && v <= max;
  const text = (v) => typeof v === "string" && v.length < 300;
  const date = (v) =>
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v;
  const p = policy(c),
    continental = CONTINENTAL[c.kind];
  ok(
    continental ||
      ["domestic", "super-domestic", "super-caf", "recopa"].includes(c.kind),
  );
  if (["domestic", "super-domestic"].includes(c.kind)) ok(DOMESTIC[c.country]);
  ok(
    ["scenario-reputation", "saved-domestic-results"].includes(
      c.qualificationSource,
    ),
  );
  ok(
    array(c.originalEntrants, 200) &&
      unique(c.originalEntrants) &&
      c.originalEntrants.length >= 2 &&
      c.originalEntrants.every((id) => c.entrants.includes(id)),
  );
  ok(
    array(c.fixtures, 1000) &&
      array(c.ties, 200) &&
      array(c.groups, 8) &&
      array(c.pots, 4) &&
      array(c.byes, 200) &&
      array(c.finalists, 2) &&
      unique(c.byes) &&
      n(c.round, 20) &&
      text(c.phase),
  );
  ok(
    [
      "groups",
      "waiting",
      "playoff",
      "r16",
      "qf",
      "sf",
      "final",
      "complete",
    ].includes(c.phase) || /^r\d{1,3}$/.test(c.phase),
  );
  ok(
    c.lots &&
      typeof c.lots === "object" &&
      Object.keys(c.lots).length === c.originalEntrants.length,
  );
  ok(
    unique(Object.values(c.lots)) &&
      c.originalEntrants.every((id) =>
        n(c.lots[id], c.originalEntrants.length - 1),
      ),
  );
  ok(
    array(c.qualification, 200) &&
      c.qualification.every(
        (q) =>
          c.entrants.includes(q.clubId) &&
          text(q.country) &&
          n(q.domesticRank, 40) &&
          ["league-position", "domestic-cup", "libertadores-third"].includes(
            q.reason,
          ),
      ),
  );
  if (continental) {
    ok(
      c.originalEntrants.length === continental.size &&
        c.groups.length === continental.size / 4 &&
        c.pots.length === 4 &&
        c.tableRule === continental.tableRule,
    );
    const groupIds = c.groups.flatMap((g) => g.clubs);
    ok(
      unique(groupIds) &&
        groupIds.length === c.originalEntrants.length &&
        groupIds.every((id) => c.originalEntrants.includes(id)),
    );
    ok(unique(c.groups.map((g) => g.id)));
    for (const pot of c.pots)
      ok(array(pot, 8) && pot.length === c.groups.length);
    const pots = c.pots.flat();
    ok(unique(pots) && pots.every((id) => c.originalEntrants.includes(id)));
    for (const g of c.groups) {
      ok(
        text(g.id) &&
          g.clubs.length === 4 &&
          unique(g.clubs.map((id) => extendedClub(id)?.country)),
      );
      for (const pot of c.pots)
        ok(g.clubs.filter((id) => pot.includes(id)).length === 1);
    }
  } else ok(!c.groups.length && !c.pots.length);
  ok(unique(c.fixtures.map((f) => f.id)) && unique(c.ties.map((t) => t.id)));
  const fmap = new Map(c.fixtures.map((f) => [f.id, f]));
  for (const f of c.fixtures) {
    ok(
      text(f.id) &&
        date(f.date) &&
        c.entrants.includes(f.home) &&
        c.entrants.includes(f.away) &&
        f.home !== f.away &&
        typeof f.played === "boolean" &&
        f.competition === c.name &&
        n(f.round, 20),
    );
    ok(f.played ? f.date <= s.date : f.date >= s.date);
    if (f.played) {
      ok(n(f.homeGoals, 100) && n(f.awayGoals, 100));
      if (f.stage === "groups")
        ok(
          ["homeReds", "awayReds", "homeYellows", "awayYellows"].every((k) =>
            n(f[k], 20),
          ),
        );
    }
    if (!f.played)
      ok(
        f.homeGoals === undefined &&
          f.awayGoals === undefined &&
          !f.winner &&
          !f.extraTime &&
          !f.penaltyWinner,
      );
    if (f.penaltyWinner)
      ok(
        f.played &&
          [f.home, f.away].includes(f.penaltyWinner) &&
          n(f.penaltiesHome, 60) &&
          n(f.penaltiesAway, 60) &&
          f.penaltiesHome !== f.penaltiesAway &&
          f.penaltyWinner ===
            (f.penaltiesHome > f.penaltiesAway ? f.home : f.away),
      );
    if (f.extraTime)
      ok(
        f.played &&
          n(f.regulationHome, 100) &&
          n(f.regulationAway, 100) &&
          n(f.extraHome, 20) &&
          n(f.extraAway, 20) &&
          f.homeGoals === f.regulationHome + f.extraHome &&
          f.awayGoals === f.regulationAway + f.extraAway &&
          (c.kind === "domestic" || (f.stage === "final" && p.finalExtraTime)),
      );
  }
  for (const g of c.groups) {
    const fs = c.fixtures.filter(
      (f) => f.stage === "groups" && f.group === g.id,
    );
    ok(fs.length === 12);
    ok(
      unique(fs.map((f) => f.home + "|" + f.away)) &&
        fs.every(
          (f) =>
            g.clubs.includes(f.home) &&
            g.clubs.includes(f.away) &&
            !f.tieId &&
            !f.penaltyWinner &&
            !f.extraTime &&
            f.round >= 1 &&
            f.round <= 6,
        ),
    );
  }
  const linked = [];
  for (const t of c.ties) {
    ok(
      text(t.id) &&
        n(t.round, 20) &&
        t.round >= 1 &&
        t.round <= c.round &&
        c.entrants.includes(t.a) &&
        c.entrants.includes(t.b) &&
        t.a !== t.b &&
        array(t.legs, 2) &&
        unique(t.legs),
    );
    const legs =
      t.stage === "final"
        ? p.finalLegs
        : t.stage === "sf" && p.doubleSemi
          ? 2
          : p.legs;
    ok(t.legs.length === legs);
    const fs = t.legs.map((id) => fmap.get(id));
    linked.push(...t.legs);
    for (const [i, f] of fs.entries())
      ok(
        f &&
          f.stage === t.stage &&
          f.tieId === t.id &&
          f.round === t.round &&
          f.leg === i + 1 &&
          f.home === (i === 0 ? t.a : t.b) &&
          f.away === (i === 0 ? t.b : t.a),
      );
    if (fs.length === 2)
      ok(fs[0].date < fs[1].date && (!fs[1].played || fs[0].played));
    const score = (id) =>
      fs
        .filter((f) => f.played)
        .reduce(
          (sum, f) => sum + (f.home === id ? f.homeGoals : f.awayGoals),
          0,
        );
    ok(t.aggregateA === score(t.a) && t.aggregateB === score(t.b));
    if (fs.at(-1).played) {
      ok([t.a, t.b].includes(t.winner) && fs.at(-1).winner === t.winner);
      if (t.aggregateA !== t.aggregateB)
        ok(t.winner === (t.aggregateA > t.aggregateB ? t.a : t.b));
      else {
        const aw = (id) =>
          fs
            .filter((f) => f.away === id)
            .reduce((sum, f) => sum + f.awayGoals, 0);
        if (p.awayGoals && legs === 2 && aw(t.a) !== aw(t.b))
          ok(
            t.winner === (aw(t.a) > aw(t.b) ? t.a : t.b) &&
              fs.at(-1).decidedBy === "away-goals",
          );
        else ok(fs.at(-1).penaltyWinner === t.winner);
      }
    } else ok(t.winner === null);
  }
  if (c.knockoutRanking)
    ok(
      array(c.knockoutRanking, 16) &&
        unique(c.knockoutRanking) &&
        c.knockoutRanking.every((id) => c.entrants.includes(id)),
    );
  ok(
    unique(linked) &&
      c.fixtures
        .filter((f) => f.stage !== "groups")
        .every((f) => linked.includes(f.id)),
  );
  ok(
    c.fixtures.filter((f) => f.stage === "groups").length ===
      c.groups.length * 12,
  );
  if (c.groups.length && c.phase !== "groups") {
    ok(
      c.fixtures.filter((f) => f.stage === "groups").every((f) => f.played) &&
        date(c.groupsFinished),
    );
    const ranks = c.groups.map((g) => groupTable(c, g).map((r) => r.clubId));
    ok(JSON.stringify(c.groupRanking) === JSON.stringify(ranks));
    for (const [k, i] of [
      ["direct", 0],
      ["runners", 1],
      ["thirds", 2],
    ])
      ok(JSON.stringify(c[k]) === JSON.stringify(ranks.map((r) => r[i])));
  }
  if (c.kind === "suda") {
    if (c.imports) {
      ok(
        array(c.imports, 8) &&
          c.imports.length === 8 &&
          unique(c.imports) &&
          !c.imports.some((id) => c.originalEntrants.includes(id)),
      );
      const src = s.expansion.cups.find(
        (x) => x.id === c.feedSource && x.kind === "lib",
      );
      ok(src?.thirds && c.imports.every((id) => src.thirds.includes(id)));
      ok(
        c.entrants.length === 40 &&
          c.imports.every((id) => c.entrants.includes(id)),
      );
    } else ok(c.entrants.length === 32);
  } else ok(c.entrants.length === c.originalEntrants.length);
  if (c.phase === "waiting")
    ok(c.kind === "suda" && !c.imports && c.alive.length === 16);
  if (c.phase === "complete")
    ok(
      c.winner &&
        c.alive.length === 1 &&
        c.alive[0] === c.winner &&
        c.fixtures.every((f) => f.played) &&
        c.ties.some((t) => t.stage === "final" && t.winner === c.winner) &&
        date(c.finished),
    );
  else {
    ok(!c.winner);
    if (!["groups", "waiting"].includes(c.phase)) {
      ok(
        c.ties
          .filter((t) => t.round === c.round)
          .every((t) => t.stage === c.phase),
      );
      const expected = [
        ...c.byes,
        ...c.ties.filter((t) => t.round === c.round).flatMap((t) => [t.a, t.b]),
        ...(c.phase === "playoff" ? c.direct : []),
      ];
      ok(
        unique(expected) &&
          expected.length === c.alive.length &&
          expected.every((id) => c.alive.includes(id)),
      );
    }
  }
}
