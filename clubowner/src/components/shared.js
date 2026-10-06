import { CLUBS } from "../data/catalog.js";
import { esc, num } from "../ui/format.js";
import { icon } from "./icons.js";
export { extendedClub as clubBy } from "../data/expandedCatalog.js";
import { extendedClub as clubBy } from "../data/expandedCatalog.js";
export function crest(id, size = "") {
  const c = clubBy(id) || { color: "#77889b", initial: "ن", name: "نادي" };
  return `<span class="crest ${size}" style="--club:${c.color}"><span data-initials="${esc(c.name)}">${esc(c.initial || c.name[0])}</span><i>FC</i></span>`;
}
export const button = (
  label,
  action,
  id = "",
  classes = "secondary",
  extra = "",
) =>
  `<button class="btn ${classes}" data-action="${action}" ${id ? `data-id="${esc(id)}"` : ""} ${extra}>${label}</button>`;
export function heading(kicker, title, desc = "", action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>${action}</div>`;
}
export function empty(title, desc = "", ico = "inbox") {
  return `<div class="empty-state">${icon(ico, 36)}<h3>${title}</h3><p>${desc}</p></div>`;
}
export const badge = (text, tone = "") =>
  `<span class="badge ${tone}">${text}</span>`;
export function progress(value) {
  return `<div class="progress"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></div>`;
}
export const avatar = (p, small = false) =>
  `<span class="player-avatar ${small ? "small" : ""}" style="--hue:${(p.rating * 17) % 360}" data-initials="${esc(p.name)}" data-initials-count="2">${esc(
    p.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join(""),
  )}<small>${esc(p.position)}</small></span>`;
export function statCard(label, value, unit, detail, ico, tone = "") {
  return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon ${tone}">${icon(ico)}</span></div><div class="stat-value">${value}<small>${unit}</small></div><div class="stat-detail ${tone}">${detail}</div></div>`;
}
export function infoNote(text) {
  return `<div class="info-note">${icon("info", 17)}<span>${text}</span></div>`;
}
