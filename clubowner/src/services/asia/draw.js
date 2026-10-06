import { shuffle } from "../competitions/draw.js";
import { extendedClub } from "../../data/expandedCatalog.js";
// AFC's four-column opponent graph. Reputation pots are MODELLED, not AFC coefficients:
// choose a feasible association split first, then seed one club per column into each pot.
export function eliteDraw(s, ids) {
  if (ids.length !== 16 || new Set(ids).size !== 16)
    throw Error("دوري المنطقة يحتاج 16 ناديًا.");
  const countries = [...new Set(ids.map((id) => extendedClub(id).country))];
  const blocks = shuffle(s, countries).map((c) =>
    ids.filter((id) => extendedClub(id).country === c),
  );
  const sides = [[], []];
  const solve = (i) => {
    if (i === blocks.length) return sides.every((a) => a.length === 8);
    const b = blocks[i];
    if (b.length > 6) return false;
    for (const side of shuffle(s, [0, 1])) {
      if (sides[side].length + b.length > 8) continue;
      sides[side].push(...b);
      if (solve(i + 1)) return true;
      sides[side].splice(-b.length);
    }
    return false;
  };
  if (!solve(0)) throw Error("تعذر توزيع اتحادات النخبة على الأعمدة.");
  const columns = [[], [], [], []];
  for (let j = 0; j < 2; j++) {
    const clubs = shuffle(s, sides[j]);
    const put = (i) => {
      if (i === 8) return true;
      const id = clubs[i],
        country = extendedClub(id).country;
      for (const k of shuffle(s, [j, j + 2])) {
        if (
          columns[k].length === 4 ||
          columns[k].filter((a) => extendedClub(a).country === country)
            .length === 3
        )
          continue;
        columns[k].push(id);
        if (put(i + 1)) return true;
        columns[k].pop();
      }
      return false;
    };
    if (!put(0)) throw Error("تعذر تكوين أعمدة النخبة.");
  }
  columns.forEach((col) =>
    col.sort(
      (a, b) => extendedClub(b).rep - extendedClub(a).rep || a.localeCompare(b),
    ),
  );
  const pots = Array.from({ length: 4 }, (_, i) =>
    columns.map((col) => col[i]),
  );
  const rounds = Array.from({ length: 8 }, (_, r) => {
    const starts = r < 4 ? [0, 2] : [1, 3];
    return starts.flatMap((k) =>
      columns[k].map((home, i) => ({
        home,
        away: columns[(k + 1) % 4][(i + r) % 4],
        round: r + 1,
      })),
    );
  });
  return { columns, pots, rounds };
}
