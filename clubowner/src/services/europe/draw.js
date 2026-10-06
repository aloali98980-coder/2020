// Independent constrained draw. No UEFA software/data is copied.
import { random, assert } from "../../core/utils.js";
export function shuffled(s, list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function matching(s, vertices, candidates, limit = 12000) {
  let visits = 0;
  const available = new Set(vertices);
  function solve() {
    if (!available.size) return [];
    if (++visits > limit) return null;
    let v, options;
    for (const n of available) {
      const list = candidates(n).filter((e) =>
        available.has(e.a === n ? e.b : e.a),
      );
      if (!options || list.length < options.length) {
        v = n;
        options = list;
      }
      if (!list.length) return null;
    }
    available.delete(v);
    for (const e of shuffled(s, options)) {
      const other = e.a === v ? e.b : e.a;
      available.delete(other);
      const rest = solve();
      if (rest) return [e, ...rest];
      available.add(other);
    }
    available.add(v);
    return null;
  }
  return solve();
}
function matchdays(s, ids, edges, rounds) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const left = new Set(edges);
    const days = [];
    let good = true;
    for (let day = 0; day < rounds; day++) {
      const adj = new Map(ids.map((id) => [id, []]));
      for (const e of left) {
        adj.get(e.a).push(e);
        adj.get(e.b).push(e);
      }
      const seen = new Set();
      for (const id of ids) {
        if (seen.has(id)) continue;
        const stack = [id];
        let count = 0;
        seen.add(id);
        while (stack.length) {
          const v = stack.pop();
          count++;
          for (const e of adj.get(v)) {
            const u = e.a === v ? e.b : e.a;
            if (!seen.has(u)) {
              seen.add(u);
              stack.push(u);
            }
          }
        }
        if (count % 2) {
          good = false;
          break;
        }
      }
      if (!good) break;
      const pairs = matching(s, ids, (id) => adj.get(id));
      if (!pairs) {
        good = false;
        break;
      }
      days.push(pairs);
      for (const e of pairs) left.delete(e);
    }
    if (good && !left.size) return days;
  }
  return null;
}
function orient(s, ids, edges, potOf, kind) {
  const constraints = new Map(edges.map((e) => [e, []]));
  for (const id of ids) {
    const groups = new Map();
    for (const e of edges.filter((e) => e.a === id || e.b === id)) {
      const opponent = e.a === id ? e.b : e.a;
      const pot = potOf.get(opponent),
        g = kind === "uecl" ? Math.floor(pot / 2) : pot;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(e);
    }
    for (const pair of groups.values()) {
      if (pair.length !== 2) return false;
      const [a, b] = pair;
      const parity = 1 ^ (a.a === id ? 0 : 1) ^ (b.a === id ? 0 : 1);
      constraints.get(a).push([b, parity]);
      constraints.get(b).push([a, parity]);
    }
  }
  const bits = new Map();
  for (const start of edges) {
    if (bits.has(start)) continue;
    bits.set(start, random(s) < 0.5 ? 0 : 1);
    const stack = [start];
    while (stack.length) {
      const e = stack.pop();
      for (const [other, parity] of constraints.get(e)) {
        const val = bits.get(e) ^ parity;
        if (bits.has(other)) {
          if (bits.get(other) !== val) return false;
        } else {
          bits.set(other, val);
          stack.push(other);
        }
      }
    }
  }
  for (const e of edges) {
    e.home = bits.get(e) ? e.a : e.b;
    e.away = bits.get(e) ? e.b : e.a;
  }
  return true;
}
export function drawLeaguePhase(s, pots, countryOf, kind) {
  const ids = pots.flat(),
    rounds = kind === "uecl" ? 6 : 8,
    potOf = new Map(pots.flatMap((p, i) => p.map((id) => [id, i])));
  assert(
    ids.length === 36 && new Set(ids).size === 36,
    "القرعة الأوروبية تتطلب 36 ناديًا مختلفًا.",
  );
  assert(
    pots.length === (kind === "uecl" ? 6 : 4) &&
      pots.every((p) => p.length === (kind === "uecl" ? 6 : 9)),
    "أوعية القرعة غير سليمة.",
  );
  for (let attempt = 0; attempt < 100; attempt++) {
    const edges = [],
      seen = new Set(),
      counts = new Map(ids.map((id) => [id, new Map()]));
    const key = (a, b) => [a, b].sort().join("|");
    const allowed = (a, b) =>
      a !== b &&
      countryOf(a) !== countryOf(b) &&
      !seen.has(key(a, b)) &&
      (counts.get(a).get(countryOf(b)) || 0) < 2 &&
      (counts.get(b).get(countryOf(a)) || 0) < 2;
    const add = (a, b) => {
      const e = { a, b };
      edges.push(e);
      seen.add(key(a, b));
      for (const [v, u] of [
        [a, b],
        [b, a],
      ])
        counts
          .get(v)
          .set(countryOf(u), (counts.get(v).get(countryOf(u)) || 0) + 1);
    };
    let valid = true;
    for (const pot of pots) {
      if (kind === "uecl") {
        const pairs = matching(s, pot, (a) =>
          pot.filter((b) => allowed(a, b)).map((b) => ({ a, b })),
        );
        if (!pairs) {
          valid = false;
          break;
        }
        for (const e of pairs) add(e.a, e.b);
      } else {
        let circle;
        for (let i = 0; i < 300; i++) {
          const trial = shuffled(s, pot);
          if (
            trial.every((a, j) => allowed(a, trial[(j + 1) % trial.length]))
          ) {
            circle = trial;
            break;
          }
        }
        if (!circle) {
          valid = false;
          break;
        }
        for (let i = 0; i < circle.length; i++)
          add(circle[i], circle[(i + 1) % circle.length]);
      }
    }
    if (!valid) continue;
    for (let i = 0; i < pots.length && valid; i++)
      for (let j = i + 1; j < pots.length && valid; j++)
        for (let repeat = 0; repeat < (kind === "uecl" ? 1 : 2); repeat++) {
          const pairs = matching(s, [...pots[i], ...pots[j]], (a) =>
            (potOf.get(a) === i ? pots[j] : pots[i])
              .filter((b) => allowed(a, b))
              .map((b) => ({ a, b })),
          );
          if (!pairs) {
            valid = false;
            break;
          }
          for (const e of pairs) add(e.a, e.b);
        }
    if (!valid || !orient(s, ids, edges, potOf, kind)) continue;
    const days = matchdays(s, ids, edges, rounds);
    if (days)
      return days.map((pairs, i) =>
        pairs.map((e) => ({ round: i + 1, home: e.home, away: e.away })),
      );
  }
  throw Error("تعذر استيفاء قيود القرعة دون تخفيفها؛ لم تُنشأ قرعة غير سليمة.");
}
