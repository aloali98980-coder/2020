import { ASIAN_GUESTS } from "./asianGuests.js";
import { CONCACAF_GUESTS } from "./concacafGuests.js";
import { FIFA_GUESTS } from "./fifaGuests.js";
import {
  EXPANDED_CLUBS as LEGACY_CLUBS,
  DIVISIONS as LEGACY_DIVISIONS,
} from "./legacyExpandedCatalog.js";
import { CLUBS } from "./catalog.js";
import { MARKETS } from "./worldMarkets.js";
import topCorrections from "./topMembershipCorrections.json" with { type: "json" };
import membership from "./pyramidMembership.json" with { type: "json" };
import reserves from "./reserveClubs.json" with { type: "json" };
import coverage from "./pyramidCoverage.json" with { type: "json" };
import { hash } from "../models/ability.js";
const normal = (name) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const prior = new Map(LEGACY_CLUBS.map((c) => [c.wiki, c]));
const normalized = new Map(
  LEGACY_CLUBS.map((c) => [normal(c.wiki || c.name), c]),
);
const list = LEGACY_CLUBS.filter((c) => c.tier === 1 || c.country === "eg").map(
  (c) => ({ ...c }),
);
const divisions = LEGACY_DIVISIONS.filter(
  (d) => d.tier === 1 || d.country === "eg",
).map((d) => ({ ...d, clubs: [...d.clubs] }));
const assignments = new Set();
export const MEMBERSHIP_CHANGES = [];
for (const l of [...topCorrections, ...membership]) {
  if (l.tier === 1) {
    for (let i = list.length - 1; i >= 0; i--)
      if (list[i].country === l.country && list[i].tier === 1)
        list.splice(i, 1);
    const i = divisions.findIndex((d) => d.id === l.id);
    if (i >= 0) divisions.splice(i, 1);
  }
  if (l.country === "eg") continue;
  const maxTier = ["en", "es", "de", "it", "fr"].includes(l.country) ? 3 : 2;
  if (l.tier > maxTier) throw Error("Out-of-scope new-career tier: " + l.id);
  const ids = [];
  for (const wiki of l.clubs) {
    const old = prior.get(wiki) || normalized.get(normal(wiki));
    const id = old?.id || "lower-" + hash(wiki).toString(16);
    if (assignments.has(id))
      throw Error("Duplicate reviewed lower membership: " + wiki);
    assignments.add(id);
    const existing = list.find((c) => c.id === id);
    if (existing) {
      const before = divisions.find((d) => d.clubs.includes(id));
      if (before) {
        before.clubs = before.clubs.filter((x) => x !== id);
        MEMBERSHIP_CHANGES.push({
          id,
          wiki,
          from: before.id,
          to: l.id,
          sourceUrl: l.sourceUrl,
        });
      }
    } else if (old && old.division !== l.id) {
      MEMBERSHIP_CHANGES.push({
        id,
        wiki,
        from: old.division,
        to: l.id,
        sourceUrl: l.sourceUrl,
      });
    }
    const base = MARKETS.find((m) => m.id === l.country)?.level || 65;
    const overall = Math.max(
      28,
      base - (l.tier - 1) * 10 + (hash(wiki) % 9) - 4,
    );
    const c = {
      ...(old || {}),
      id,
      wiki,
      name: old?.name || wiki,
      short: old?.short || wiki,
      initial: old?.initial || wiki[0],
      country: l.country,
      tier: l.tier,
      division: l.id,
      rep: old?.rep || overall,
      overall,
      capacity: old?.capacity || Math.max(2500, 18000 - (l.tier - 1) * 4200),
      cash: old?.cash || Math.round(65000000 / l.tier ** 2),
      color: old?.color || "#526d9b",
      city:
        old?.city ||
        MARKETS.find((m) => m.id === l.country)?.nameAr ||
        l.country,
      desc: "نادٍ حقيقي · قوائم مرجعية غير معتمدة كقيد رسمي",
      level: l.name,
      selectable: true,
      sourceStatus: l.status || "published-unverified",
    };
    if (existing) Object.assign(existing, c);
    else list.push(c);
    ids.push(id);
  }
  if (ids.length < 4) throw Error("Incomplete reviewed division: " + l.id);
  divisions.push({
    ...l,
    clubs: ids,
    sourceStatus: l.status || "published-unverified",
  });
}
for (const r of reserves) {
  const c = list.find(
    (c) => c.wiki === r.wiki || normal(c.wiki) === normal(r.wiki),
  );
  if (!c) continue;
  const parent = list.find(
    (c) => c.wiki === r.parent || normal(c.wiki) === normal(r.parent),
  );
  Object.assign(c, {
    reserve: true,
    parentId: parent?.id,
    ceilingTier: r.ceilingTier || 2,
  });
}
if (new Set(list.map((c) => c.id)).size !== list.length)
  throw Error("Club identity collision");
if (new Set(divisions.flatMap((d) => d.clubs)).size !== list.length)
  throw Error("Catalog membership is not one-to-one");
// Legacy registry is deliberately NOT the new-career selection list. Removed
// fourth tiers and old IDs stay resolvable for transfers, histories and saves.
export const EXPANDED_CLUBS = list;
export const DIVISIONS = divisions;
const byId = new Map(
  [
    ...CLUBS,
    ...LEGACY_CLUBS,
    ...list,
    ...FIFA_GUESTS,
    ...ASIAN_GUESTS,
    ...CONCACAF_GUESTS,
  ].map(
    (c) => [c.id, c],
  ),
);
export const extendedClub = (id) => byId.get(id);
export const LOWER_SOURCES = membership;
export const PYRAMID_COVERAGE = coverage;
