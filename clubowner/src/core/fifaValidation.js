import { FIFA_ENGINE, conductPenalty } from "../services/fifa/engine.js";
import {
  REGIONS,
  PRIMARY,
  QUOTAS,
  region,
  association,
} from "../services/fifa/access.js";
import { OFC_ENTRANTS } from "../data/fifaGuests.js";
import { groupTable } from "../services/competitions/table.js";
const ok = (v) => {
  if (!v) throw Error("بيانات بطولة FIFA أو تأهل أوقيانوسيا غير سليمة.");
};
const integer = (n, max = 100000) =>
  Number.isSafeInteger(n) && n >= 0 && n <= max;
const array = (a, n) => Array.isArray(a) && a.length <= n;
const unique = (a) => new Set(a).size === a.length;
const same = (a, b) =>
  Array.isArray(a) &&
  a.length === b.length &&
  unique(a) &&
  a.every((x) => b.includes(x));
const date = (v) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v;
export function validateFifaState(s, known) {
  const x = s.expansion;
  if (x.fifaVersion !== undefined) ok([0, 1].includes(x.fifaVersion));
  if (!x.fifa) return;
  if (x.fifaVersion === 1) {
    ok(
      x.cups.filter((c) => c.engine === FIFA_ENGINE && c.kind === "ofc")
        .length === 1 &&
        x.cups.filter(
          (c) => c.engine === FIFA_ENGINE && c.kind === "intercontinental",
        ).length === 1 &&
        x.cups.filter((c) => c.engine === FIFA_ENGINE && c.kind === "clubworld")
          .length <= 1,
    );
  }
  const y = x.fifa;
  ok(
    integer(y.nextWorldYear, 9999) &&
      y.nextWorldYear >= 2029 &&
      (y.nextWorldYear - 2025) % 4 === 0 &&
      y.hostCountry === "us" &&
      array(y.history, 4) &&
      unique(y.history.map((h) => h.season)),
  );
  for (const h of y.history) {
    ok(
      integer(h.season) &&
        integer(h.year, 9999) &&
        ["legacy-summary", "saved-competition-results"].includes(h.source) &&
        h.regions &&
        Object.keys(h.regions).every((r) => REGIONS.includes(r)),
    );
    for (const [r, hist] of Object.entries(h.regions)) {
      ok(
        known.has(hist.champion) &&
          region(hist.champion) === r &&
          array(hist.scores, 200) &&
          unique(hist.scores.map((q) => q.clubId)),
      );
      for (const q of hist.scores)
        ok(known.has(q.clubId) && region(q.clubId) === r && integer(q.points));
    }
  }
}
export function validateFifaCup(c, s) {
  ok(
    ["clubworld", "intercontinental", "ofc"].includes(c.kind) &&
      c.engine === FIFA_ENGINE &&
      integer(c.editionYear, 9999) &&
      c.editionYear >= 2026 &&
      c.tableRule === "fifa",
  );
  ok(
    array(
      c.fixtures,
      c.kind === "clubworld" ? 63 : c.kind === "ofc" ? 22 : 5,
    ) &&
      array(c.ties, 15) &&
      array(c.groups, 8) &&
      array(c.pots, 4) &&
      array(c.waitingSeeds, 2) &&
      unique(c.waitingSeeds) &&
      array(c.qualification, 32) &&
      array(c.originalEntrants, 32) &&
      same(c.originalEntrants, c.entrants) &&
      array(c.finalists, 2) &&
      c.byes.length === 0 &&
      integer(c.round, 4),
  );
  const waiting = c.kind === "intercontinental" && c.phase === "waiting";
  ok(
    c.lots &&
      Object.keys(c.lots).length === c.entrants.length &&
      unique(Object.values(c.lots)) &&
      c.entrants.every((id) => integer(c.lots[id], c.entrants.length - 1)),
  );
  if (waiting) {
    ok(
      !c.entrants.length &&
        !c.fixtures.length &&
        !c.ties.length &&
        !c.groups.length &&
        !c.winner &&
        c.round === 0,
    );
    return;
  }
  ok(c.id === `${c.kind}-s${s.seasonNumber}`);
  ok(
    c.entrants.length ===
      (c.kind === "clubworld" ? 32 : c.kind === "ofc" ? 7 : 6),
  );
  if (c.kind === "ofc")
    ok(
      same(c.entrants, OFC_ENTRANTS) &&
        c.groups.length === 1 &&
        same(c.groups[0].clubs, OFC_ENTRANTS) &&
        c.pots.length === 0 &&
        c.qualificationSource === "ofc-scenario",
    );
  if (c.kind === "clubworld") {
    ok(
      c.groups.length === 8 &&
        c.pots.length === 4 &&
        c.pots.every((p) => array(p, 8) && p.length === 8) &&
        same(c.pots.flat(), c.entrants) &&
        same(
          c.groups.flatMap((g) => g.clubs),
          c.entrants,
        ),
    );
    ok(
      c.qualification.length === 32 &&
        same(
          c.qualification.map((q) => q.clubId),
          c.entrants,
        ) &&
        c.hostCountry === "us" &&
        c.qualificationSource === "four-year-cycle" &&
        array(c.cycleYears, 4) &&
        unique(c.cycleYears) &&
        c.cycleYears.every(
          (y) =>
            integer(y, 9999) && y >= c.editionYear - 4 && y < c.editionYear,
        ),
    );
    for (const [r, n] of Object.entries(QUOTAS))
      ok(
        c.qualification.filter(
          (q) => q.region === r && q.reason !== "scenario-host",
        ).length === n,
      );
    const hosts = c.qualification.filter((q) => q.reason === "scenario-host");
    ok(
      hosts.length === 1 &&
        hosts[0].clubId === c.hostClub &&
        association(c.hostClub) === "us" &&
        c.groups[0].clubs.includes(c.hostClub),
    );
    for (const q of c.qualification) {
      ok(
        q.region === region(q.clubId) &&
          q.country === association(q.clubId) &&
          integer(q.points) &&
          array(q.titleYears, 4) &&
          q.titleYears.every(
            (y) =>
              integer(y, 9999) && y >= c.editionYear - 4 && y < c.editionYear,
          ) &&
          [
            "scenario-host",
            "scenario-fill",
            "continental-champion",
            "cycle-ranking",
            "ofc-cycle-ranking",
          ].includes(q.reason),
      );
    }
    for (const g of c.groups) {
      ok(
        g.clubs.length === 4 &&
          unique(g.clubs.map(association)) &&
          c.pots.every(
            (p) => g.clubs.filter((id) => p.includes(id)).length === 1,
          ),
      );
      for (const r of REGIONS)
        ok(
          g.clubs.filter((id) => region(id) === r).length <=
            (r === "uefa" ? 2 : 1),
        );
      ok(g.clubs.some((id) => region(id) === "uefa"));
    }
  }
  if (c.kind === "intercontinental") {
    ok(
      c.groups.length === 0 &&
        c.pots.length === 0 &&
        c.qualification.length === 6 &&
        same(
          c.qualification.map((q) => q.region),
          REGIONS,
        ) &&
        same(
          c.qualification.map((q) => q.clubId),
          c.entrants,
        ) &&
        c.qualificationSource === "current-continental-champions",
    );
    for (const q of c.qualification) {
      const src = s.expansion.cups.find((k) => k.id === q.sourceCup);
      ok(
        src?.winner === q.clubId &&
          region(q.clubId) === q.region &&
          c.holders[q.region] === q.clubId &&
          (src.kind === PRIMARY[q.region] ||
            src.id === `${PRIMARY[q.region]}-s${s.seasonNumber}`),
      );
    }
    ok(
      c.firstRegion === (c.editionYear % 2 === 0 ? "afc" : "caf") &&
        c.secondRegion === (c.firstRegion === "afc" ? "caf" : "afc"),
    );
  }
  ok(
    unique(c.groups.map((g) => g.id)) &&
      unique(c.fixtures.map((f) => f.id)) &&
      unique(c.ties.map((t) => t.id)),
  );
  for (const f of c.fixtures) {
    ok(
      typeof f.id === "string" &&
        f.id.length < 120 &&
        c.entrants.includes(f.home) &&
        c.entrants.includes(f.away) &&
        f.home !== f.away &&
        date(f.date) &&
        typeof f.played === "boolean" &&
        typeof f.neutral === "boolean" &&
        f.competition === c.name &&
        integer(f.round, 7),
    );
    ok(f.played ? f.date <= s.date : f.date >= s.date);
    if (!f.played) {
      ok(
        f.homeGoals === undefined &&
          f.awayGoals === undefined &&
          !f.winner &&
          !f.penaltyWinner &&
          !f.extraTime,
      );
      continue;
    }
    ok(
      integer(f.homeGoals, 50) &&
        integer(f.awayGoals, 50) &&
        integer(f.regulationHome, 50) &&
        integer(f.regulationAway, 50),
    );
    if (f.extraTime)
      ok(
        f.stage !== "groups" &&
          f.regulationHome === f.regulationAway &&
          integer(f.extraHome, 3) &&
          integer(f.extraAway, 3) &&
          f.homeGoals === f.regulationHome + f.extraHome &&
          f.awayGoals === f.regulationAway + f.extraAway,
      );
    else
      ok(f.homeGoals === f.regulationHome && f.awayGoals === f.regulationAway);
    if (f.stage === "groups") {
      ok(!f.winner && !f.penaltyWinner && !f.extraTime);
      for (const side of ["home", "away"]) {
        const q = f[side + "Conduct"];
        ok(
          q &&
            ["yellow", "indirectRed", "directRed", "yellowDirectRed"].every(
              (k) => integer(q[k], 16),
            ) &&
            Object.values(q).reduce((a, b) => a + b, 0) <= 16 &&
            f[side + "ConductPenalty"] === conductPenalty(q),
        );
      }
    } else {
      ok([f.home, f.away].includes(f.winner));
      if (f.homeGoals === f.awayGoals)
        ok(
          f.extraTime &&
            f.penaltyWinner === f.winner &&
            integer(f.penaltiesHome, 40) &&
            integer(f.penaltiesAway, 40) &&
            f.penaltiesHome !== f.penaltiesAway &&
            f.winner === (f.penaltiesHome > f.penaltiesAway ? f.home : f.away),
        );
      else
        ok(
          !f.penaltyWinner &&
            f.winner === (f.homeGoals > f.awayGoals ? f.home : f.away),
        );
    }
  }
  for (const g of c.groups) {
    const fs = c.fixtures.filter(
        (f) => f.stage === "groups" && f.group === g.id,
      ),
      n = g.clubs.length;
    ok(
      fs.length === (n * (n - 1)) / 2 &&
        unique(fs.map((f) => [f.home, f.away].sort().join("|"))) &&
        fs.every(
          (f) =>
            g.clubs.includes(f.home) &&
            g.clubs.includes(f.away) &&
            f.neutral &&
            !f.tieId,
        ),
    );
  }
  const groupFixtures = c.fixtures.filter((f) => f.stage === "groups");
  ok(
    groupFixtures.length ===
      c.groups.reduce(
        (n, g) => n + (g.clubs.length * (g.clubs.length - 1)) / 2,
        0,
      ),
  );
  if (c.groups.length && c.phase !== "groups") {
    ok(groupFixtures.every((f) => f.played));
    ok(
      JSON.stringify(c.groupRanking) ===
        JSON.stringify(
          c.groups.map((g) => groupTable(c, g).map((r) => r.clubId)),
        ),
    );
  }
  const stages =
    c.kind === "intercontinental"
      ? ["opening", "aap", "challenger", "final"]
      : c.kind === "clubworld"
        ? ["r16", "qf", "sf", "final"]
        : ["final"];
  const end = c.phase === "complete";
  ok(c.phase === "groups" || end || stages[c.round - 1] === c.phase);
  if (c.phase === "groups")
    ok(
      c.round === 0 && !c.ties.length && !c.winner && same(c.alive, c.entrants),
    );
  const byround = (r) => c.ties.filter((t) => t.round === r),
    winners = (r) => byround(r).map((t) => t.winner),
    linked = [];
  for (let r = 1; r <= c.round; r++) {
    let pairs,
      wait = [];
    if (c.kind === "intercontinental") {
      const h = c.holders;
      if (r === 1) {
        pairs = [
          [h[c.firstRegion], h.ofc],
          [h.concacaf, h.conmebol],
        ];
        wait = [h[c.secondRegion], h.uefa];
      }
      if (r === 2) {
        pairs = [[h[c.secondRegion], winners(1)[0]]];
        wait = [h.uefa, winners(1)[1]];
      }
      if (r === 3) {
        pairs = [[winners(2)[0], winners(1)[1]]];
        wait = [h.uefa];
      }
      if (r === 4) pairs = [[h.uefa, winners(3)[0]]];
    } else if (r === 1) {
      const ranks = c.groupRanking;
      ok(ranks);
      pairs =
        c.kind === "ofc"
          ? [[ranks[0][0], ranks[0][1]]]
          : [
              [0, 1],
              [2, 3],
              [4, 5],
              [6, 7],
              [1, 0],
              [3, 2],
              [5, 4],
              [7, 6],
            ].map(([a, b]) => [ranks[a][0], ranks[b][1]]);
    } else {
      const ws = winners(r - 1);
      pairs = Array.from({ length: ws.length / 2 }, (_, i) =>
        ws.slice(i * 2, i * 2 + 2),
      );
    }
    const ts = byround(r);
    ok(ts.length === pairs.length);
    for (const [i, t] of ts.entries()) {
      ok(
        t.stage === stages[r - 1] &&
          t.a === pairs[i][0] &&
          t.b === pairs[i][1] &&
          array(t.legs, 1) &&
          t.legs.length === 1,
      );
      linked.push(t.legs[0]);
      const f = c.fixtures.find((f) => f.id === t.legs[0]);
      ok(
        f &&
          f.tieId === t.id &&
          f.home === t.a &&
          f.away === t.b &&
          f.round === r &&
          f.stage === t.stage &&
          f.leg === 1,
      );
      ok(
        f.matchCode ===
          (c.kind === "intercontinental" && r === 1
            ? i === 0
              ? "aap-playoff"
              : "americas"
            : stages[r - 1]),
      );
      ok(
        f.neutral ===
          !(c.kind === "intercontinental" && ((r === 1 && i === 0) || r === 2)),
      );
      ok(
        f.played
          ? t.winner === f.winner &&
              t.aggregateA === f.homeGoals &&
              t.aggregateB === f.awayGoals
          : !t.winner && t.aggregateA === 0 && t.aggregateB === 0,
      );
      if (r < c.round) ok(f.played);
    }
    if (r === c.round && !end) {
      ok(
        same(c.waitingSeeds, wait) && same(c.alive, [...pairs.flat(), ...wait]),
      );
    }
  }
  ok(
    unique(linked) &&
      same(
        linked,
        c.fixtures.filter((f) => f.stage !== "groups").map((f) => f.id),
      ),
  );
  if (end)
    ok(
      c.round === stages.length &&
        c.fixtures.every((f) => f.played) &&
        c.winner === winners(c.round)[0] &&
        same(c.alive, [c.winner]) &&
        date(c.finished) &&
        c.finalists.includes(c.winner),
    );
  else ok(!c.winner);
  if (c.kind === "intercontinental")
    for (const key of ["americas", "aap", "challenger"]) {
      const f = c.fixtures.find((f) => f.matchCode === key && f.played);
      if (f)
        ok(
          c.trophies[key]?.winner === f.winner &&
            c.trophies[key]?.date === f.date,
        );
      else ok(!c.trophies[key]);
    }
}
