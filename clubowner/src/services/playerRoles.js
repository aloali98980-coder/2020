import { assert, clamp } from "../core/utils.js";
export const PLAYER_ROLES = {
  balanced: {
    name: "متوازن",
    positions: [
      "GK",
      "CB",
      "LB",
      "RB",
      "DM",
      "CM",
      "AM",
      "LW",
      "RW",
      "LM",
      "RM",
      "ST",
    ],
    skills: ["decisions"],
    attack: 0,
    defence: 0,
    fatigue: 0,
  },
  anchor: {
    name: "ارتكاز دفاعي",
    positions: ["DM", "CM"],
    skills: ["defending", "decisions"],
    attack: -1,
    defence: 3,
    fatigue: 0,
  },
  playmaker: {
    name: "صانع لعب",
    positions: ["DM", "CM", "AM"],
    skills: ["passing", "decisions"],
    attack: 3,
    defence: -1,
    fatigue: 1,
  },
  runner: {
    name: "وسط شامل",
    positions: ["CM", "DM"],
    skills: ["stamina", "pace"],
    attack: 2,
    defence: 1,
    fatigue: 3,
  },
  wingback: {
    name: "ظهير متقدم",
    positions: ["RB", "LB"],
    skills: ["pace", "stamina", "passing"],
    attack: 3,
    defence: -2,
    fatigue: 3,
  },
  finisher: {
    name: "مهاجم هداف",
    positions: ["ST", "LW", "RW"],
    skills: ["shooting", "decisions"],
    attack: 3,
    defence: -1,
    fatigue: 1,
  },
  ballplayer: {
    name: "مدافع بناء لعب",
    positions: ["CB"],
    skills: ["passing", "defending", "decisions"],
    attack: 1,
    defence: 1,
    fatigue: 1,
  },
};
export function setPlayerRole(s, id, role) {
  const p = s.players.find(
    (p) => p.id === id && p.clubId === s.clubId && p.status !== "retired",
  );
  assert(
    p &&
      Object.hasOwn(PLAYER_ROLES, role) &&
      PLAYER_ROLES[role].positions.includes(p.position),
    "الدور غير مناسب للمركز الطبيعي.",
  );
  s.management.playerRoles ??= {};
  s.management.playerRoles[id] = role;
  s.management.tactics.enabled = true;
}
export function roleEffect(s, p, slot = p.position) {
  const role = s.management?.playerRoles?.[p.id] || "balanced",
    r = PLAYER_ROLES[role] || PLAYER_ROLES.balanced;
  const fit =
    role === "balanced"
      ? 1
      : clamp(
          r.skills.reduce((n, k) => n + p.attributes[k], 0) /
            r.skills.length /
            85,
          0.25,
          1,
        ) * (r.positions.includes(slot) ? 1 : 0.35);
  return {
    role,
    fit,
    attack: r.attack * (r.attack > 0 ? fit : 1),
    defence: r.defence * (r.defence > 0 ? fit : 1),
    fatigue: r.fatigue,
  };
}
