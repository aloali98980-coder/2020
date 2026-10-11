// تدقيق الأحداث (الدفعة 7 — القسم 1): أرقام فقط، لا يعدّل شيئًا.
// الاستخدام: node scripts/events-audit.mjs [--json]
import {
  EVENT_CATALOG,
  FLAVOR_CATALOG,
  DECISION_EFFECT_KEYS,
  FLAVOR_EFFECT_KEYS,
  FLAVOR_LIMITS,
} from "../src/data/eventCatalog.js";

export function auditEvents(decisions = EVENT_CATALOG, flavor = FLAVOR_CATALOG) {
  const issues = [];
  const count = (arr, key) => arr.reduce((m, e) => ((m[e[key]] = (m[e[key]] || 0) + 1), m), {});
  const dupIds = Object.entries(count(decisions, "id")).filter(([, n]) => n > 1).map(([id]) => id);
  const dupFlavorIds = Object.entries(count(flavor, "id")).filter(([, n]) => n > 1).map(([id]) => id);
  const titleOf = (e) => (typeof e.title === "string" ? e.title.trim() : "");
  const dupTitles = Object.entries(
    decisions.reduce((m, e) => ((m[titleOf(e)] = (m[titleOf(e)] || []).concat(e.id)), m), {}),
  )
    .filter(([t, ids]) => t && ids.length > 1)
    .map(([title, ids]) => ({ title, ids }));
  for (const e of decisions) {
    if (typeof e.when !== "function") issues.push({ kind: "no-when", id: e.id });
    if (!Array.isArray(e.choices) || e.choices.length < 2) issues.push({ kind: "few-choices", id: e.id });
    for (const c of e.choices || []) {
      for (const k of Object.keys(c)) {
        if (["id", "label"].includes(k)) continue;
        if (!DECISION_EFFECT_KEYS.includes(k)) issues.push({ kind: "unknown-effect", id: e.id, key: k });
      }
    }
  }
  for (const f of flavor) {
    for (const k of Object.keys(f.effect || {})) {
      if (!FLAVOR_EFFECT_KEYS.includes(k)) issues.push({ kind: "flavor-unknown-effect", id: f.id, key: k });
      const lim = FLAVOR_LIMITS[k];
      if (lim !== undefined && Math.abs(f.effect[k]) > lim)
        issues.push({ kind: "flavor-over-limit", id: f.id, key: k });
    }
  }
  const byGroup = count(decisions, "group");
  const byCategory = count(flavor, "category");
  return {
    decisions: decisions.length,
    flavor: flavor.length,
    dupIds,
    dupFlavorIds,
    dupTitles,
    byGroup,
    byCategory,
    issues,
  };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (isMain) {
  const r = auditEvents();
  console.log(process.argv.includes("--json") ? JSON.stringify(r, null, 1) : JSON.stringify({ ...r, issues: r.issues.length }, null, 1));
}
