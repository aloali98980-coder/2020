import { ASIA_KINDS, zone } from "../services/asia/access.js";
import { ASIA_ENGINE } from "../services/asia/engine.js";
import { ASIAN_GUEST_IDS } from "../data/asianGuests.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { asiaTable } from "../services/asia/table.js";
const ok = (v) => {
  if (!v) throw Error("بيانات البطولات الآسيوية غير سليمة.");
};
const arr = (a, n) => Array.isArray(a) && a.length <= n;
const unique = (a) => new Set(a).size === a.length;
const same = (a, b) =>
  Array.isArray(a) &&
  a.length === b.length &&
  unique(a) &&
  a.every((v) => b.includes(v));
const num = (v) => Number.isSafeInteger(v) && v >= 0 && v <= 1000000;
const date = (v) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v;
export function validateAsiaState(s) {
  const x = s.expansion;
  if (x.asiaVersion !== undefined) ok([0, 1].includes(x.asiaVersion));
  const cups = x.cups.filter((c) => c.engine === ASIA_ENGINE);
  if (!x.asiaVersion) {
    ok(cups.length === 0);
    return;
  }
  ok(
    cups.length === 3 &&
      same(
        cups.map((c) => c.kind),
        ASIA_KINDS,
      ) &&
      x.asia?.honours &&
      x.asia.guestScores,
  );
  const all = cups.flatMap((c) => c.originalEntrants || []);
  ok(unique(all) && all.length === 84);
  for (const [kind, h] of Object.entries(x.asia.honours)) {
    ok(
      ASIA_KINDS.includes(kind) &&
        zone(h.winner) &&
        zone(h.runnerUp) &&
        h.winner !== h.runnerUp &&
        num(h.season) &&
        h.season < s.seasonNumber,
    );
  }
  for (const [id, n] of Object.entries(x.asia.guestScores))
    ok(ASIAN_GUEST_IDS.has(id) && num(n));
  for (const c of cups) {
    validateAsianCup(c);
    if (c.feedSource) {
      const source = cups.find((p) => p.id === c.feedSource);
      ok(
        source?.kind === (c.kind === "afc-two" ? "afc" : "afc-two") &&
          same(c.imports, source.preliminaryLosers),
      );
    }
  }
}
export function validateAsianCup(c) {
  ok(
    ASIA_KINDS.includes(c.kind) &&
      c.engine === ASIA_ENGINE &&
      [
        "preliminary",
        "waiting",
        "groups",
        "r16",
        "qf",
        "sf",
        "final",
        "complete",
      ].includes(c.phase),
  );
  const challenge = c.kind === "afc-challenge",
    n = challenge ? 16 : c.kind === "afc" ? 36 : 32;
  ok(
    arr(c.originalEntrants, 36) &&
      c.originalEntrants.length === n &&
      unique(c.originalEntrants) &&
      c.originalEntrants.every(zone),
  );
  ok(
    arr(c.direct, 28) &&
      c.direct.length === (challenge ? 16 : c.kind === "afc" ? 28 : 24) &&
      arr(c.qualifiers, 8) &&
      c.qualifiers.length === (challenge ? 0 : 8) &&
      same([...c.direct, ...c.qualifiers], c.originalEntrants),
  );
  ok(
    arr(c.imports, 4) &&
      unique(c.imports) &&
      c.imports.every((id) => !c.originalEntrants.includes(id)) &&
      same(c.entrants, [...c.originalEntrants, ...c.imports]),
  );
  ok(c.kind !== "afc" || c.imports.length === 0);
  ok(
    c.lots &&
      Object.keys(c.lots).length === c.entrants.length &&
      Object.values(c.lots).every(num) &&
      unique(Object.values(c.lots)),
  );
  ok(
    arr(c.qualification, 40) &&
      same(
        c.qualification.map((q) => q.clubId),
        c.entrants,
      ),
  );
  for (const q of c.qualification)
    ok(
      q.zone === zone(q.clubId) &&
        q.country === extendedClub(q.clubId).country &&
        ["direct", "preliminary"].includes(q.route) &&
        [
          "titleholder",
          "lower-title-path",
          "guest-reference",
          "scenario-reputation",
          "domestic-results",
          "preliminary-transfer",
        ].includes(q.reason),
    );
  ok(
    arr(c.fixtures, 160) &&
      unique(c.fixtures.map((f) => f.id)) &&
      arr(c.ties, 40) &&
      unique(c.ties.map((t) => t.id)) &&
      arr(c.groups, 8) &&
      c.tableRule === "afc" &&
      c.tableShootouts &&
      arr(c.results, 0),
  );
  const fixtureMap = new Map(c.fixtures.map((f) => [f.id, f]));
  for (const f of c.fixtures) {
    ok(
      typeof f.id === "string" &&
        f.id.length < 150 &&
        date(f.date) &&
        c.entrants.includes(f.home) &&
        c.entrants.includes(f.away) &&
        f.home !== f.away &&
        typeof f.played === "boolean" &&
        typeof f.neutral === "boolean" &&
        num(f.round) &&
        f.round > 0 &&
        f.competition === c.name,
    );
    if (f.played) {
      ok(
        num(f.homeGoals) &&
          num(f.awayGoals) &&
          num(f.regulationHome) &&
          num(f.regulationAway),
      );
      if (f.stage === "groups")
        ok(
          num(f.homeConductPenalty) &&
            num(f.awayConductPenalty) &&
            !f.winner &&
            !f.penaltyWinner,
        );
      else ok(f.decidedBy !== "away-goals");
      if (f.penaltyWinner)
        ok(
          f.penaltyWinner === f.winner &&
            [f.home, f.away].includes(f.winner) &&
            num(f.penaltiesHome) &&
            num(f.penaltiesAway) &&
            f.penaltiesHome !== f.penaltiesAway &&
            f.penaltyWinner ===
              (f.penaltiesHome > f.penaltiesAway ? f.home : f.away),
        );
    }
  }
  const links = [];
  for (const t of c.ties) {
    const expected =
      t.stage === "preliminary" ||
      t.stage === "final" ||
      (c.kind === "afc" && ["qf", "sf"].includes(t.stage))
        ? 1
        : 2;
    ok(
      ["preliminary", "r16", "qf", "sf", "final"].includes(t.stage) &&
        arr(t.legs, 2) &&
        t.legs.length === expected &&
        num(t.round) &&
        t.round <= c.round &&
        t.a !== t.b &&
        c.entrants.includes(t.a) &&
        c.entrants.includes(t.b),
    );
    const fs = t.legs.map((id) => fixtureMap.get(id));
    ok(fs.every(Boolean));
    links.push(...t.legs);
    for (let i = 0; i < fs.length; i++) {
      const f = fs[i];
      ok(
        f.tieId === t.id &&
          f.stage === t.stage &&
          f.round === t.round &&
          f.leg === i + 1 &&
          f.home === (i ? t.b : t.a) &&
          f.away === (i ? t.a : t.b) &&
          f.neutral ===
            (t.stage === "final" ||
              (c.kind === "afc" && ["qf", "sf"].includes(t.stage))),
      );
      if (i) ok(fs[i - 1].date < f.date && (!f.played || fs[i - 1].played));
    }
    if (
      t.stage !== "final" &&
      !(c.kind === "afc" && ["qf", "sf"].includes(t.stage))
    )
      ok(zone(t.a) === zone(t.b));
    const total = (id) =>
      fs.reduce(
        (n, f) => n + (f.home === id ? f.homeGoals || 0 : f.awayGoals || 0),
        0,
      );
    ok(t.aggregateA === total(t.a) && t.aggregateB === total(t.b));
    if (fs.at(-1).played)
      ok(
        [t.a, t.b].includes(t.winner) &&
          fs.at(-1).winner === t.winner &&
          (t.aggregateA === t.aggregateB
            ? fs.at(-1).penaltyWinner === t.winner
            : t.winner === (t.aggregateA > t.aggregateB ? t.a : t.b)),
      );
    else ok(!t.winner);
  }
  ok(
    same(
      links,
      c.fixtures.filter((f) => f.stage !== "groups").map((f) => f.id),
    ),
  );
  if (c.preliminaryFinished) {
    ok(
      date(c.preliminaryFinished) &&
        same(
          c.preliminaryWinners,
          c.ties.filter((t) => t.stage === "preliminary").map((t) => t.winner),
        ) &&
        same(
          c.preliminaryLosers,
          c.qualifiers.filter((id) => !c.preliminaryWinners.includes(id)),
        ),
    );
  } else ok(!c.preliminaryWinners && !c.preliminaryLosers);
  if (c.mainEntrants) {
    ok(
      same(c.mainEntrants, [
        ...c.direct,
        ...(c.preliminaryWinners || []),
        ...c.imports,
      ]) && c.mainEntrants.length === (challenge ? 20 : 32),
    );
    ok(
      same(
        c.groups.flatMap((g) => g.clubs),
        c.mainEntrants,
      ) &&
        c.groups.length === (challenge ? 5 : c.kind === "afc" ? 2 : 8) &&
        unique(c.groups.map((g) => g.id)),
    );
    for (const g of c.groups) {
      ok(
        g.clubs.every((id) => zone(id) === g.zone) &&
          g.clubs.length === (c.kind === "afc" ? 16 : 4),
      );
      const fs = c.fixtures.filter(
        (f) => f.stage === "groups" && f.group === g.id,
      );
      ok(fs.length === (c.kind === "afc" ? 64 : challenge ? 6 : 12));
      for (const f of fs)
        ok(
          g.clubs.includes(f.home) &&
            g.clubs.includes(f.away) &&
            extendedClub(f.home).country !== extendedClub(f.away).country &&
            f.neutral === challenge,
        );
      for (const id of g.clubs) {
        const own = fs.filter((f) => [f.home, f.away].includes(id));
        ok(
          own.length === (c.kind === "afc" ? 8 : challenge ? 3 : 6) &&
            unique(own.map((f) => f.round)),
        );
        ok(
          new Set(own.map((f) => (f.home === id ? f.away : f.home))).size ===
            (c.kind === "afc" ? 8 : 3),
        );
        if (!challenge)
          ok(
            own.filter((f) => f.home === id).length ===
              (c.kind === "afc" ? 4 : 3),
          );
      }
      const draw = c.regionDraws?.[g.zone];
      ok(draw && arr(draw.pots, 4) && draw.pots.length === 4);
      if (c.kind === "afc") {
        ok(
          arr(draw.columns, 4) &&
            draw.columns.length === 4 &&
            draw.columns.every((a) => a.length === 4) &&
            same(draw.columns.flat(), g.clubs) &&
            same(draw.pots.flat(), g.clubs),
        );
        for (let k = 0; k < 4; k++)
          for (const id of draw.columns[k]) {
            ok(
              draw.columns[k].filter(
                (a) => extendedClub(a).country === extendedClub(id).country,
              ).length <= 3,
            );
            ok(
              same(
                fs.filter((f) => f.home === id).map((f) => f.away),
                draw.columns[(k + 1) % 4],
              ),
            );
          }
        for (const pot of draw.pots)
          ok(
            pot.length === 4 &&
              draw.columns.every(
                (col) => pot.filter((id) => col.includes(id)).length === 1,
              ),
          );
      } else {
        const zoneClubs = c.groups
          .filter((x) => x.zone === g.zone)
          .flatMap((x) => x.clubs);
        ok(
          same(draw.pots.flat(), zoneClubs) &&
            draw.pots.every(
              (p) => g.clubs.filter((id) => p.includes(id)).length === 1,
            ),
        );
      }
    }
  } else
    ok(
      c.groups.length === 0 &&
        c.fixtures.every((f) => f.stage === "preliminary") &&
        ["preliminary", "waiting"].includes(c.phase),
    );
  if (c.groupRanking)
    ok(
      date(c.groupsFinished) &&
        c.groups.every(
          (g, i) =>
            JSON.stringify(c.groupRanking[i]) ===
            JSON.stringify(asiaTable(c, g).map((r) => r.clubId)),
        ) &&
        c.fixtures.filter((f) => f.stage === "groups").every((f) => f.played),
    );
  for (const [key, r] of Object.entries(c.tableShootouts)) {
    const f = fixtureMap.get(r.matchId);
    ok(
      f?.played &&
        f.stage === "groups" &&
        f.home === r.home &&
        f.away === r.away &&
        key === [r.home, r.away].sort().join("|") &&
        num(r.homeScore) &&
        num(r.awayScore) &&
        r.homeScore !== r.awayScore &&
        r.winner === (r.homeScore > r.awayScore ? r.home : r.away),
    );
  }
  const prelim = c.ties.filter((t) => t.stage === "preliminary");
  ok(
    prelim.length === (challenge ? 0 : 4) &&
      same(
        prelim.flatMap((t) => [t.a, t.b]),
        c.qualifiers,
      ),
  );
  for (const z of ["west", "east"])
    ok(
      c.direct.filter((id) => zone(id) === z).length ===
        (challenge ? (z === "west" ? 10 : 6) : c.kind === "afc" ? 14 : 12) &&
        c.qualifiers.filter((id) => zone(id) === z).length ===
          (challenge ? 0 : 4),
    );
  if (c.groupRanking) {
    const opening = c.ties.filter(
      (t) => t.stage === (challenge ? "qf" : "r16"),
    );
    ok(opening.length === (challenge ? 4 : 8));
    if (c.kind === "afc")
      for (const g of c.groups) {
        const rank = asiaTable(c, g).map((r) => r.clubId),
          ts = opening.filter((t) => zone(t.a) === g.zone);
        ok(ts.every((t, i) => t.a === rank[7 - i] && t.b === rank[i]));
      }
    else if (c.kind === "afc-two") {
      const ranks = c.groups.map((g) => asiaTable(c, g).map((r) => r.clubId)),
        top = ranks.map((r) => r[0]),
        second = ranks.map((r) => r[1]);
      ok(
        same(
          opening.map((t) => t.a),
          second,
        ) &&
          same(
            opening.map((t) => t.b),
            top,
          ) &&
          opening.every(
            (t) =>
              !c.groups.some(
                (g) => g.clubs.includes(t.a) && g.clubs.includes(t.b),
              ),
          ),
      );
    } else {
      const west = c.groups
          .filter((g) => g.zone === "west")
          .map((g) => asiaTable(c, g)),
        east = c.groups
          .filter((g) => g.zone === "east")
          .map((g) => asiaTable(c, g));
      const second = west
        .map((r) => r[1])
        .sort(
          (a, b) =>
            b.points - a.points ||
            b.gf - b.ga - (a.gf - a.ga) ||
            b.gf - a.gf ||
            a.conduct - b.conduct ||
            a.lot - b.lot,
        )[0].clubId;
      ok(
        c.bestRunner === second &&
          same(
            opening
              .filter((t) => zone(t.a) === "west")
              .flatMap((t) => [t.a, t.b]),
            [...west.map((r) => r[0].clubId), second],
          ),
      );
      const k = west.findIndex((rs) => rs.some((r) => r.clubId === second)),
        ws = opening.filter((t) => zone(t.a) === "west");
      ok(
        ws[0].a === second &&
          ws[0].b === west[(k + 1) % 3][0].clubId &&
          ws[1].a === west[(k + 2) % 3][0].clubId &&
          ws[1].b === west[k][0].clubId,
      );
      const es = opening.filter((t) => zone(t.a) === "east");
      ok(
        es[0].a === east[1][1].clubId &&
          es[0].b === east[0][0].clubId &&
          es[1].a === east[0][1].clubId &&
          es[1].b === east[1][0].clubId,
      );
    }
    const stages = challenge
      ? ["qf", "sf", "final"]
      : ["r16", "qf", "sf", "final"];
    for (let i = 1; i < stages.length; i++) {
      const curr = c.ties.filter((t) => t.stage === stages[i]),
        prev = c.ties.filter((t) => t.stage === stages[i - 1]);
      if (curr.length)
        ok(
          prev.every((t) => t.winner) &&
            same(
              curr.flatMap((t) => [t.a, t.b]),
              prev.map((t) => t.winner),
            ),
        );
    }
  }
  if (c.winner)
    ok(
      c.phase === "complete" &&
        date(c.finished) &&
        same(c.alive, [c.winner]) &&
        c.fixtures.every((f) => f.played) &&
        c.ties.at(-1).stage === "final" &&
        c.ties.at(-1).winner === c.winner &&
        same(c.finalists, [c.ties.at(-1).a, c.ties.at(-1).b]),
    );
  else ok(c.phase !== "complete");
}
