import { extendedClub } from "../../data/expandedCatalog.js";
import { rankLeague } from "../leagueTable.js";
import { DOMESTIC } from "./presets.js";
import { createKnockout, ENGINE } from "./engine.js";
export function createDomestic(s, country) {
  const p = DOMESTIC[country];
  if (!p) return false;
  const entrants = s.expansion.divisions
    .filter((d) => d.country === country)
    .flatMap((d) => d.clubs)
    .filter((id) => !extendedClub(id)?.reserve);
  return !!createKnockout(s, {
    id: "cup-" + country,
    name: p.name,
    country,
    entrants,
    format: `كأس محلي · مباراة واحدة${p.doubleSemi ? "، نصف النهائي ذهاب وإياب" : ""} · نهائي محايد؛ المشاركون من المستويات المحملة والدخول والقرعة والتقويم محاكاة`,
  });
}
export function superCupsDay(s) {
  const x = s.expansion;
  for (const [country, p] of Object.entries(DOMESTIC)) {
    const id = "super-domestic-" + country;
    if (x.cups.some((c) => c.id.startsWith(id + "-s"))) continue;
    const d = x.divisions.find((d) => d.country === country && d.tier === 1),
      cup = x.cups.find((c) => c.id === `cup-${country}-s${s.seasonNumber}`);
    if (!d || !cup?.winner || d.fixtures.some((f) => !f.played)) continue;
    const rank = rankLeague(d).map((r) => r.clubId),
      finalists = cup.finalists || [cup.winner];
    const qualified =
      p.superSize === 4
        ? [cup.winner, ...finalists.filter((id) => id !== cup.winner), ...rank]
        : [rank[0], cup.winner, ...rank];
    const entrants = [...new Set(qualified)]
      .filter((id) => !extendedClub(id)?.reserve)
      .slice(0, p.superSize);
    createKnockout(s, {
      id,
      kind: "super-domestic",
      name: p.superName,
      country,
      entrants,
      offset: 10,
      qualification: entrants.map((clubId) => ({
        clubId,
        country,
        domesticRank: rank.indexOf(clubId) + 1,
        reason: finalists.includes(clubId) ? "domestic-cup" : "league-position",
      })),
      format: `سوبر من ${p.superSize} أندية بنتائج هذا الموسم · محايد · توقيت ومقاعد محاكاة${country === "eg" ? "؛ كأس الرابطة غير ممثلة، تُستكمل المقاعد من الدوري والكأس" : ""}`,
    });
  }
  for (const [id, a, b, name, kind] of [
    ["super-caf", "caf", "confed", "CAF Super Cup", "super-caf"],
    ["recopa", "lib", "suda", "CONMEBOL Recopa", "recopa"],
  ]) {
    if (x.cups.some((c) => c.id === `${id}-s${s.seasonNumber}`)) continue;
    const ca = x.cups.find((c) => c.kind === a && c.engine === ENGINE),
      cb = x.cups.find((c) => c.kind === b && c.engine === ENGINE);
    if (ca?.winner && cb?.winner)
      createKnockout(s, {
        id,
        kind,
        name,
        entrants: [ca.winner, cb.winner],
        offset: 14,
        format:
          kind === "recopa"
            ? "بطلا ليبرتادوريس وسودأمريكانا · ذهاب وإياب · مواعيد وجوائز محاكاة"
            : "بطلا أفريقيا والكونفدرالية · مباراة محايدة · ترجيح عند التعادل دون وقت إضافي",
      });
  }
}
