import { roleEffect } from "./playerRoles.js";
import { assert, clamp } from "../core/utils.js";
import { hash } from "../models/ability.js";
export const FORMATIONS = {
  "4-3-3": ["GK", "LB", "CB", "CB", "RB", "DM", "CM", "CM", "LW", "ST", "RW"],
  "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "DM", "DM", "LW", "AM", "RW", "ST"],
  "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
  "3-5-2": ["GK", "CB", "CB", "CB", "LM", "CM", "DM", "CM", "RM", "ST", "ST"],
};
export const TACTICAL_DEFAULTS = {
  enabled: true,
  formation: "4-3-3",
  press: "balanced",
  tempo: "normal",
  style: "balanced",
};
export function setTactics(s, changes) {
  assert(s.management, "الإدارة غير متاحة.");
  const t = {
    ...(s.management.tactics || TACTICAL_DEFAULTS),
    ...changes,
    enabled: true,
  };
  assert(
    Object.hasOwn(FORMATIONS, t.formation) &&
      ["low", "balanced", "high"].includes(t.press) &&
      ["slow", "normal", "fast"].includes(t.tempo) &&
      ["balanced", "possession", "direct", "counter"].includes(t.style),
    "تعليمات تكتيكية غير صالحة.",
  );
  s.management.tactics = t;
}
export function positionFit(position, slot) {
  if (position === slot) return 1;
  if (position === "GK" || slot === "GK") return 0.2;
  const families = [
    ["LB", "LWB"],
    ["RB", "RWB"],
    ["LM", "LW"],
    ["RM", "RW"],
    ["DM", "CM", "AM"],
  ];
  if (families.some((g) => g.includes(position) && g.includes(slot)))
    return 0.85;
  if (
    (["CB", "DM"].includes(position) && ["CB", "DM"].includes(slot)) ||
    (["AM", "ST"].includes(position) && ["AM", "ST"].includes(slot))
  )
    return 0.7;
  return 0.5;
}
export const availablePlayer = (s, p) =>
  p.status !== "retired" &&
  (!p.injuryUntil || p.injuryUntil < s.date) &&
  (!p.internationalUntil || p.internationalUntil <= s.date);
export function selectXI(s, id = s.clubId) {
  const pool = s.players.filter(
    (p) => p.clubId === id && availablePlayer(s, p),
  );
  const manual = id === s.clubId ? s.management?.lineup || [] : [];
  if (id !== s.clubId || !s.management?.tactics?.enabled)
    return pool
      .sort(
        (a, b) =>
          (manual.includes(b.id) ? 1000 : 0) +
          b.rating -
          ((manual.includes(a.id) ? 1000 : 0) + a.rating),
      )
      .slice(0, 11)
      .map((p) => ({ p, slot: p.position, fit: 1 }));
  const slots = FORMATIONS[s.management.tactics.formation].map(
      (slot, index) => ({ slot, index }),
    ),
    chosen = [];
  let candidates = [...pool];
  // Reserve an available natural goalkeeper even when an incomplete manual shortlist excludes one.
  const keepers = candidates
    .filter((p) => p.position === "GK")
    .sort(
      (a, b) =>
        (manual.includes(b.id) ? 1000 : 0) +
        b.rating -
        ((manual.includes(a.id) ? 1000 : 0) + a.rating),
    );
  if (keepers.length) {
    const p = keepers[0];
    chosen.push({ p, slot: "GK", fit: 1, index: 0 });
    candidates = candidates.filter((x) => x.id !== p.id);
    slots.shift();
  }
  while (slots.length && candidates.length) {
    let best;
    for (const p of candidates)
      for (const slot of slots) {
        const fit = positionFit(p.position, slot.slot),
          score =
            (manual.includes(p.id) ? 1000 : 0) + p.rating * (0.55 + 0.45 * fit);
        if (
          !best ||
          score > best.score ||
          (score === best.score && p.id < best.p.id)
        )
          best = { p, slot: slot.slot, index: slot.index, fit, score };
      }
    chosen.push(best);
    candidates = candidates.filter((p) => p.id !== best.p.id);
    slots.splice(
      slots.findIndex((x) => x.index === best.index),
      1,
    );
  }
  return chosen.sort((a, b) => a.index - b.index);
}
export function tacticalEffects(s, opponent) {
  const t = s.management?.tactics;
  if (!t?.enabled) return { attack: 0, defence: 0, fatigue: 0 };
  const xi = selectXI(s),
    avg = (k) =>
      xi.reduce((n, x) => n + (x.p.attributes?.[k] || x.p.rating), 0) /
      Math.max(1, xi.length),
    enemy = ["balanced", "possession", "direct", "counter"][hash(opponent) % 4];
  let attack = { "4-3-3": 1, "4-2-3-1": 0, "4-4-2": 0.5, "3-5-2": 1 }[
      t.formation
    ],
    defence = { "4-3-3": 0, "4-2-3-1": 1, "4-4-2": -0.5, "3-5-2": -1 }[
      t.formation
    ],
    fatigue = 0;
  if (t.press === "high") {
    attack += 2;
    defence += avg("stamina") >= 65 ? 2 : -3;
    fatigue += 4;
  }
  if (t.press === "low") {
    attack -= 2;
    defence++;
    fatigue -= 2;
  }
  if (t.tempo === "fast") {
    attack += 2;
    defence--;
    fatigue += 2;
  }
  if (t.tempo === "slow") {
    attack--;
    defence++;
    fatigue--;
  }
  if (t.style === "possession") {
    attack += clamp((avg("passing") + avg("decisions") - 120) / 10, -3, 4);
    defence += enemy === "counter" ? -2 : 1;
  }
  if (t.style === "direct") {
    attack += clamp((avg("pace") + avg("shooting") - 125) / 12, -3, 3);
    defence--;
  }
  if (t.style === "counter") {
    attack += enemy === "possession" ? 3 : 0;
    defence += t.press === "low" ? 2 : 0;
  }
  for (const x of xi) {
    const r = roleEffect(s, x.p, x.slot);
    attack += r.attack / 11;
    defence += r.defence / 11;
  }
  return {
    attack: clamp(attack, -6, 7),
    defence: clamp(defence, -6, 5),
    fatigue,
    formation: t.formation,
    press: t.press,
    tempo: t.tempo,
    style: t.style,
    opponentStyle: enemy,
    fit: Math.round(
      (xi.reduce((n, x) => n + x.fit, 0) / Math.max(1, xi.length)) * 100,
    ),
  };
}
