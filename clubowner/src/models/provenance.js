// 0.20: attribution/provenance of a player record without storing it on every saved player.
// World-pack players (ids "wp-…") resolve their source page, birthday source, licence and
// estimated-field list from the bundled pack; fields stored explicitly on the object (current-2026
// pack, legends, imported saves) always win. Generated players are simulation-only.
import {
  worldProvenance,
  WORLD_START,
  WORLD_ESTIMATED_FIELDS,
} from "../data/packs/world.js";

export const DEFAULT_ABILITY_METHOD = "seeded-role-age-estimate";

export function provenance(p) {
  const pack = typeof p?.id === "string" && p.id.startsWith("wp-") ? worldProvenance(p.id) : null;
  return {
    sourceUrl: p.sourceUrl ?? pack?.sourceUrl ?? null,
    biographyUrl: p.biographyUrl ?? pack?.biographyUrl ?? null,
    sourceAsOf: p.sourceAsOf ?? (pack ? WORLD_START : null),
    sourceStatus:
      p.sourceStatus ?? (pack ? "published-unverified" : p.generated ? "simulated" : null),
    sourceLicense: p.sourceLicense ?? (pack ? "CC-BY-SA-4.0" : null),
    sourceSeasonText: p.sourceSeasonText ?? pack?.sourceSeasonText ?? "",
    estimatedFields:
      p.estimatedFields ??
      (pack ? [...WORLD_ESTIMATED_FIELDS, ...(pack.birthDate ? [] : ["age"])] : []),
    abilityMethod: p.abilityMethod ?? (p.abilityVersion ? DEFAULT_ABILITY_METHOD : null),
  };
}

// Fields that provenance() can reconstruct for world-pack players; stripped from saves.
export const DERIVED_PROVENANCE_FIELDS = Object.freeze([
  "sourceUrl",
  "biographyUrl",
  "sourceAsOf",
  "sourceStatus",
  "sourceLicense",
  "sourceSeasonText",
  "estimatedFields",
]);

// Fields the v18 migration drops from every saved player when they only repeat pack data.
const DROPPED = new Set([...DERIVED_PROVENANCE_FIELDS]);

// Returns a slim copy of a world-pack player without the provenance copies the pack can
// regenerate byte-for-byte (and without the default ability method), or null when nothing can be
// stripped. A copy rather than `delete`: deleting properties moves the object into V8's slow
// dictionary mode, and the migration touches every player of a 47,000-player world.
export function stripDerivedProvenance(p) {
  const pack =
    typeof p.id === "string" && p.id.startsWith("wp-") ? worldProvenance(p.id) : null;
  const same =
    !!pack &&
    (p.sourceUrl ?? null) === pack.sourceUrl &&
    (p.biographyUrl ?? null) === pack.biographyUrl &&
    (p.sourceStatus === undefined || p.sourceStatus === "published-unverified") &&
    (p.sourceLicense === undefined || p.sourceLicense === "CC-BY-SA-4.0");
  const defaultMethod = p.abilityMethod === DEFAULT_ABILITY_METHOD;
  if (!same && !defaultMethod) return null;
  const slim = {};
  for (const k in p) {
    if (same && DROPPED.has(k)) continue;
    if (defaultMethod && k === "abilityMethod") continue;
    slim[k] = p[k];
  }
  return slim;
}
