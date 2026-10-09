import { assert, clamp, random } from "../../core/utils.js";
import { staffSkill } from "../staff.js";
import { gkGainBonus, gkChanceBonus } from "../staff/effects.js";
export const FOCUSES = [
  "balanced",
  "pace",
  "passing",
  "shooting",
  "defending",
  "stamina",
  "decisions",
];
export function setTraining(s, id, focus, intensity) {
  const p = s.players.find(
    (p) => p.id === id && p.clubId === s.clubId && p.status !== "retired",
  );
  assert(
    s.talent &&
      p &&
      FOCUSES.includes(focus) &&
      ["light", "normal", "intense"].includes(intensity),
    "برنامج التدريب غير صالح.",
  );
  const old = s.talent.training[id];
  s.talent.training[id] = {
    focus,
    intensity,
    lastMonth: old?.lastMonth || s.date.slice(0, 7),
    appearances: old?.appearances ?? p.appearances,
  };
}
export function developIndividual(s, p) {
  const plans = s.talent.training,
    plan = (plans[p.id] ??= {
      focus: "balanced",
      intensity: "normal",
      lastMonth: s.date.slice(0, 7),
      appearances: p.appearances,
    });
  if (plan.lastMonth === s.date.slice(0, 7)) return;
  plan.lastMonth = s.date.slice(0, 7);
  const matches = Math.max(0, p.appearances - plan.appearances);
  plan.appearances = p.appearances;
  if (p.age >= 26 || p.injuryUntil >= s.date) return;
  const level = s.facilities.find((f) => f.id === "training").level,
    coach = Math.max(staffSkill(s, "coach"), s.management?.coach?.skill || 0),
    intensity = { light: 0.65, normal: 1, intense: 1.3 }[plan.intensity];
  if (plan.intensity === "intense") p.fitness = Math.max(45, p.fitness - 3);
  // 0.30: مدرب الحراس يرفع فرصة تطور الحراس ومكسبهم (بلا عشوائية جديدة).
  const isGk = p.position === "GK";
  const chance = clamp(
    0.2 + level * 0.06 + coach / 400 + Math.min(4, matches) * 0.04 + (isGk ? gkChanceBonus(s) : 0),
    0,
    0.85,
  );
  if (random(s) > chance) return;
  const gain = Math.max(
    0,
    Math.min(
      0.45,
      p.potential - p.rating,
      (0.04 + level * 0.02 + coach / 1200 + Math.min(4, matches) * 0.045) *
        intensity + (isGk ? gkGainBonus(s) : 0),
    ),
  );
  p.rating += gain;
  for (const k of Object.keys(p.attributes))
    p.attributes[k] = Math.min(
      99,
      p.attributes[k] +
        gain * (plan.focus === "balanced" ? 1 : plan.focus === k ? 2 : 0.4),
    );
  p.value = Math.round(p.value * (1 + gain / 50));
}
export function cleanTraining(s) {
  if (!s.talent) return;
  const own = new Set(
    s.players
      .filter((p) => p.clubId === s.clubId && p.status !== "retired")
      .map((p) => p.id),
  );
  s.management.playerRoles = Object.fromEntries(
    Object.entries(s.management.playerRoles || {}).filter(([id]) =>
      own.has(id),
    ),
  );
  s.talent.training = Object.fromEntries(
    Object.entries(s.talent.training).filter(([id]) => own.has(id)),
  );
}
