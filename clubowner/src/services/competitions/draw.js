import { random } from "../../core/utils.js";
import { extendedClub } from "../../data/expandedCatalog.js";
export function shuffle(s, items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// Each pot has one club per group; a bounded backtracking assignment prevents
// greedy dead ends without silently relaxing association separation.
export function groupDraw(s, entrants) {
  const n = entrants.length / 4,
    ranked = [...entrants].sort(
      (a, b) =>
        (extendedClub(b)?.rep || 0) - (extendedClub(a)?.rep || 0) ||
        a.localeCompare(b),
    );
  const pots = Array.from({ length: 4 }, (_, i) =>
    ranked.slice(i * n, (i + 1) * n),
  );
  for (let retry = 0; retry < 60; retry++) {
    const groups = Array.from({ length: n }, () => []);
    let budget = 40000;
    const solve = (p) => {
      if (p === 4) return true;
      const clubs = shuffle(s, pots[p]),
        taken = new Set();
      const put = (i) => {
        if (--budget < 0) return false;
        if (i === clubs.length) return solve(p + 1);
        const id = clubs[i],
          country = extendedClub(id)?.country;
        for (const g of shuffle(
          s,
          Array.from({ length: n }, (_, i) => i),
        )) {
          if (
            taken.has(g) ||
            groups[g].some((x) => extendedClub(x)?.country === country)
          )
            continue;
          taken.add(g);
          groups[g].push(id);
          if (put(i + 1)) return true;
          groups[g].pop();
          taken.delete(g);
        }
        return false;
      };
      return put(0);
    };
    if (solve(0))
      return {
        pots,
        groups: groups.map((clubs, i) => ({
          id: String.fromCharCode(65 + i),
          clubs,
        })),
      };
  }
  throw Error("تعذر توزيع مجموعات البطولة دون تكرار البلد.");
}
export function seededPairs(s, winners, runners, groupOf = {}) {
  const ws = shuffle(s, winners),
    rs = shuffle(s, runners),
    used = new Set(),
    out = [];
  const solve = (i) => {
    if (i === ws.length) return true;
    for (const r of rs) {
      if (used.has(r) || (groupOf[r] && groupOf[r] === groupOf[ws[i]]))
        continue;
      used.add(r);
      out.push([r, ws[i]]);
      if (solve(i + 1)) return true;
      out.pop();
      used.delete(r);
    }
    return false;
  };
  if (!solve(0)) throw Error("تعذر قرعة الفائزين والوصيف.");
  return out;
}
