import { LEGEND_ROLES, legendById } from "../data/legends.js";

const iso = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const amount = (v) => Number.isFinite(v) && v >= 0;
const text = (v) => typeof v === "string" && v.length > 0;

export function validateLegends(s) {
  const fail = (why) => {
    throw new Error(`حفظة تالفة: بيانات الأساطير غير صالحة (${why}).`);
  };
  const L = s.legends;
  if (!L || typeof L !== "object") fail("state");
  if (L.schema !== 1) fail("schema");
  if (typeof L.playerMode !== "boolean") fail("playerMode");
  if (!Number.isInteger(L.serial) || L.serial < 0) fail("serial");
  if (!Array.isArray(L.contracts) || !Array.isArray(L.hall)) fail("shape");
  if (L.lastMonth !== null && !/^\d{4}-\d{2}$/.test(L.lastMonth)) fail("lastMonth");
  const ids = new Set();
  const activeLegends = new Set();
  const activeRoles = new Set();
  let players = 0;
  for (const c of L.contracts) {
    if (!text(c.id) || ids.has(c.id)) fail("contract-id");
    ids.add(c.id);
    if (!legendById(c.legendId)) fail("legend");
    const role = LEGEND_ROLES[c.role];
    if (!role || role.kind !== c.kind) fail("role");
    if (!amount(c.fee) || !amount(c.salary) || !iso(c.start) || !iso(c.end) || c.end < c.start)
      fail("terms");
    if (!Number.isInteger(c.years) || c.years < 1 || c.years > 12) fail("years");
    if (!["active", "ended"].includes(c.status)) fail("status");
    if (!amount(c.sessions) || !amount(c.gains) || !amount(c.income)) fail("stats");
    if (c.kind === "player") {
      if (!text(c.playerId)) fail("playerId");
      const p =
        s.players.find((x) => x.id === c.playerId) ||
        (s.retired || []).find((x) => x.id === c.playerId);
      if (!p || p.legendId !== c.legendId) fail("player");
      if (c.status === "active") {
        if (p.status === "retired") fail("player-retired");
        players++;
      }
    } else if (c.playerId !== null) fail("playerId-null");
    if (c.status === "active") {
      if (activeLegends.has(c.legendId)) fail("duplicate-legend");
      activeLegends.add(c.legendId);
      if (c.kind !== "player") {
        if (activeRoles.has(c.role)) fail("duplicate-role");
        activeRoles.add(c.role);
      }
    } else if (!iso(c.endedOn)) fail("endedOn");
  }
  if (players > 2) fail("too-many-players");
  const hallIds = new Set();
  for (const h of L.hall) {
    if (!text(h.playerId) || hallIds.has(h.playerId)) fail("hall-id");
    hallIds.add(h.playerId);
    if (!text(h.name) || !text(h.position) || !iso(h.inducted)) fail("hall-entry");
    if (!amount(h.appearances) || !amount(h.goals) || !amount(h.rating)) fail("hall-stats");
    if (h.legendId !== null && !legendById(h.legendId)) fail("hall-legend");
  }
  for (const p of s.players)
    if (p.legendId !== undefined && p.legendId !== null && !legendById(p.legendId)) fail("player-legend");
}
