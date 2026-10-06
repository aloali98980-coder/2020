import { shuffle } from "../competitions/draw.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { region, association } from "./access.js";
export function worldDraw(s, qualification) {
  const ranked = (r) =>
    qualification
      .filter((q) => q.region === r && q.reason !== "scenario-host")
      .sort(
        (a, b) =>
          b.points - a.points ||
          extendedClub(b.clubId).rep - extendedClub(a.clubId).rep ||
          a.clubId.localeCompare(b.clubId),
      )
      .map((q) => q.clubId);
  const eu = ranked("uefa"),
    sa = ranked("conmebol"),
    af = ranked("caf"),
    as = ranked("afc"),
    na = ranked("concacaf"),
    oc = ranked("ofc"),
    host = qualification.find((q) => q.reason === "scenario-host").clubId;
  const pots = [
    [...eu.slice(0, 4), ...sa.slice(0, 4)],
    eu.slice(4),
    [...na, ...af.slice(0, 2), ...as.slice(0, 2)],
    [...sa.slice(4), ...af.slice(2), ...as.slice(2), ...oc, host],
  ];
  if (pots.some((p) => p.length !== 8))
    throw Error("أوعية كأس العالم غير مكتملة.");
  for (let retry = 0; retry < 40; retry++) {
    const groups = Array.from({ length: 8 }, () => []);
    let budget = 100000;
    const solve = (p) => {
      if (p === 4) return true;
      const order = [1, 3, 0, 2],
        clubs = shuffle(s, pots[order[p]]),
        used = new Set();
      const put = (i) => {
        if (--budget < 0) return false;
        if (i === clubs.length) return solve(p + 1);
        const id = clubs[i],
          r = region(id),
          country = association(id);
        for (const g of id === host
          ? [0]
          : shuffle(s, [0, 1, 2, 3, 4, 5, 6, 7])) {
          if (
            used.has(g) ||
            groups[g].some((x) => association(x) === country) ||
            groups[g].filter((x) => region(x) === r).length >=
              (r === "uefa" ? 2 : 1)
          )
            continue;
          used.add(g);
          groups[g].push(id);
          if (put(i + 1)) return true;
          groups[g].pop();
          used.delete(g);
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
  throw Error("تعذرت قرعة كأس العالم دون مخالفة قيود القارات والبلدان.");
}
