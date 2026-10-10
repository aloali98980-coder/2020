import { NARRATIVES } from "./narratives.js";
import { DICTIONARY } from "./dictionary.js";
import { UI_PHRASES } from "./phrases-ui.js";
import { MESSAGE_PHRASES } from "./phrases-messages.js";
import { SYSTEM_PHRASES } from "./phrases-system.js";
import { NAME_PHRASES } from "./phrases-names.js";
import { LEGEND_PHRASES } from "./phrases-legends.js";
import { EXTRA_PHRASES } from "./phrases-extra.js";
import { EVENT_PHRASES } from "./phrases-events.js";
import { BOARD_PHRASES } from "./phrases-board.js";
import { DRAMA_MOMENTS_PHRASES } from "./phrases-drama-moments.js";
import { BLACK_PHRASES } from "./phrases-black.js";
import { EMPIRE_PHRASES } from "./phrases-empire.js";
import { SPORTS_CITY_PHRASES } from "./phrases-sports-city.js";
import { STAFF_PHRASES } from "./phrases-staff.js";
import { POLITICS_PHRASES } from "./phrases-politics.js";
import { DYNASTY_PHRASES } from "./phrases-dynasty.js";
import { BETTING_PHRASES } from "./phrases-betting.js";
import { STOCK_MARKET_PHRASES } from "../data/stockMarketTexts.js";
import {
  ACADEMY_FOCUSES,
  CHILD_STAGES,
  DYNASTY_PATHS,
  DYNASTY_TRAITS,
  UPBRINGING_STYLES,
} from "../data/dynasty.js";
import egyptPyramid from "../data/egyptPyramid.json" with { type: "json" };
import { ROSTERS } from "../data/packs/current-2026.js";
import { worldNameMap } from "../data/packs/world.js";
import { LEGENDS } from "../data/legends.js";
import { MARKETS } from "../data/worldMarkets.js";
// 0.19: phrase modules are merged in order; earlier hand-tuned entries win. A string value means
// "same wording in English and French" (brands, codes, transliterated names).
const dynastyCopies = [
  ...CHILD_STAGES.map((stage) => stage.label),
  ...DYNASTY_TRAITS.flatMap((trait) => [trait.label, trait.description]),
  ...DYNASTY_PATHS.flatMap((path) => [path.label, path.bonus]),
  ...UPBRINGING_STYLES.map((style) => style.label),
  ...ACADEMY_FOCUSES.map((focus) => focus.label),
];
const normalizedDynastyPhrase = (value) => String(value).trim().replace(/[.؛:!؟…،,]+$/, "");
for (const copy of dynastyCopies) {
  const key = normalizedDynastyPhrase(copy.ar);
  if (!DICTIONARY[key]) DICTIONARY[key] = [copy.en, copy.fr];
}
for (const [ar, pair] of Object.entries(DYNASTY_PHRASES)) {
  const key = normalizedDynastyPhrase(ar);
  if (!DICTIONARY[key]) DICTIONARY[key] = pair;
}
for (const extra of [
  NARRATIVES,
  UI_PHRASES,
  MESSAGE_PHRASES,
  SYSTEM_PHRASES,
  NAME_PHRASES,
  LEGEND_PHRASES,
  EXTRA_PHRASES,
  // 0.25: phrases-events comes last so hand-tuned entries in earlier modules always win.
  EVENT_PHRASES,
  // 0.26: assembly mandate phrases are derived from src/data/boardTexts.js (single source).
  BOARD_PHRASES,
  // 0.27: drama moments (cup draw, deadline day, youth intake, derby flavor, instant friendly).
  DRAMA_MOMENTS_PHRASES,
  // 0.28: black files (suspicion, fixer operations, release clauses)
  BLACK_PHRASES,
  // 0.29: empire life (two fortunes, living, assets, family, investments, rivals, charity)
  EMPIRE_PHRASES,
  // Dynasty phrases are generated from the family, academy and succession systems.
  DYNASTY_PHRASES,
  SPORTS_CITY_PHRASES,
  // 0.30: comprehensive staff management (org chart, market, HQ, events)
  STAFF_PHRASES,
  POLITICS_PHRASES,
  BETTING_PHRASES,
  // 0.37: club exchange and monthly price engine.
  STOCK_MARKET_PHRASES,
])
  for (const [ar, pair] of Object.entries(extra))
    if (!DICTIONARY[ar])
      DICTIONARY[ar] = Array.isArray(pair) ? pair : [pair, pair];
let language = "ar";
try {
  language = localStorage.getItem("clubowner.language") || "ar";
} catch {}
export const getLanguage = () => language;
export function setLanguage(code) {
  language = ["ar", "en", "fr"].includes(code) ? code : "ar";
  try {
    localStorage.setItem("clubowner.language", language);
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }
}
export const tr = (ar, en, fr) =>
  language === "ar" ? ar : language === "fr" ? fr || en : en;
// Identity map: Arabic display name -> Latin name. Sources: the 2026 reference pack, the world
// pack (published Latin names), star profiles, the legends catalog and market names. Looked up
// by word n-grams (1..6 words) over each Arabic run, so cost is per word, not per known name.
// Names that also occur inside dictionary phrases (countries, big clubs, nicknames quoted in a
// biography) go to LATE_NAMES and are applied only after the phrase pass, so a phrase is never
// broken before its exact/sub-phrase match runs.
const NAMES = new Map(),
  LATE_NAMES = new Map();
let namesReady = false,
  maxNameWords = 1;
const PUNCT = /^[\s"'“”‘’(«»:؛،,.!؟?…-]+|[\s"'“”‘’)«»:؛،,.!؟?…-]+$/g;
function ensureNames() {
  if (namesReady) return;
  namesReady = true;
  // word -> dictionary keys containing it, so "is this name quoted inside a phrase?" is cheap.
  const index = new Map();
  for (const key of Object.keys(DICTIONARY))
    for (const w of new Set(key.split(/\s+/).map((x) => x.replace(PUNCT, ""))))
      if (w) (index.get(w) || index.set(w, []).get(w)).push(key);
  const quoted = (key, parts) => {
    let best = null;
    for (const w of parts) {
      const list = index.get(w) || [];
      if (!list.length) return false;
      if (!best || list.length < best.length) best = list;
    }
    return best.some((k) => k !== key && k.includes(key));
  };
  const add = (ar, latin) => {
    if (!ar || !latin || ar === latin || !/[ء-ي]/.test(ar)) return;
    const key = String(ar).trim(),
      parts = key
        .split(/\s+/)
        .map((x) => x.replace(PUNCT, ""))
        .filter(Boolean);
    if (
      !parts.length ||
      DICTIONARY[key] ||
      NAMES.has(key) ||
      LATE_NAMES.has(key)
    )
      return;
    (quoted(key, parts) ? LATE_NAMES : NAMES).set(key, String(latin));
    maxNameWords = Math.max(maxNameWords, key.split(/\s+/).length);
  };
  for (const p of Object.values(ROSTERS).flat()) add(p[0], p[1]);
  for (const [ar, latin] of worldNameMap()) add(ar, latin);
  for (const l of LEGENDS) add(l.name, l.nameLatin);
  for (const m of MARKETS) add(m.nameAr, m.name);
  // Egyptian lower tiers: Arabic display name + English key (Haras El Hodoud SC, Pharco FC…).
  for (const d of egyptPyramid.divisions || [])
    for (const c of d.clubs || []) add(c.name, c.key);
}
export const nameCount = () => (ensureNames(), NAMES.size + LATE_NAMES.size);
const WORD = /[ء-يٓ-ٰٟ]+(?:[\s'’()-]+[ء-يٓ-ٰٟ]+)*\)?/g;
const EDGE = /^[('’"“«]+|[)'’"”»]+$/g;
function replaceNames(text, map) {
  return text.replace(WORD, (run) => {
    const words = run.split(/\s+/),
      cores = words.map((w) => w.replace(EDGE, "")),
      lead = (w) => w.slice(0, w.length - w.replace(/^[('’"“«]+/, "").length),
      trail = (w) => w.slice(w.replace(/[)'’"”»]+$/, "").length);
    let out = [],
      i = 0;
    while (i < words.length) {
      let hit = null,
        len = 0;
      let raw = false;
      for (let n = Math.min(maxNameWords, words.length - i); n >= 1; n--) {
        // Raw first (a key may itself carry brackets: "ميدو (أحمد حسام)"), then bracket-stripped.
        let latin = map.get(words.slice(i, i + n).join(" "));
        raw = Boolean(latin);
        if (!latin) latin = map.get(cores.slice(i, i + n).join(" "));
        if (latin) {
          hit = latin;
          len = n;
          break;
        }
      }
      if (hit) {
        out.push(raw ? hit : lead(words[i]) + hit + trail(words[i + len - 1]));
        i += len;
      } else {
        out.push(words[i]);
        i += 1;
      }
    }
    return out.join(" ");
  });
}
const sorted = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const digits = (text) =>
  text
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)))
    .replaceAll("٪", "%");
const ARABIC = /[ء-ي]/;
const CONJ = ["and ", "et "];
const LETTER = /[ء-يً-ْ]/;
// Exact match, tolerant of trailing sentence punctuation ("…خارجه." matches the key "…خارجه").
function exact(text, index) {
  const trimmed = text.trim();
  if (DICTIONARY[trimmed])
    return text.replace(trimmed, DICTIONARY[trimmed][index]);
  const core = trimmed.replace(/[.؛:!؟…،,]+$/, "");
  if (core !== trimmed && DICTIONARY[core])
    return text.replace(core, DICTIONARY[core][index]);
  return null;
}
export function translateText(value) {
  if (language === "ar") return value;
  let text = String(value),
    index = language === "fr" ? 1 : 0;
  if (!ARABIC.test(text)) return digits(text);
  let hit = exact(text, index);
  if (hit !== null) return digits(hit);
  ensureNames();
  text = replaceNames(text, NAMES);
  if (!ARABIC.test(text)) return digits(text);
  hit = exact(text, index);
  if (hit !== null) return digits(hit);
  // A curated phrase pass preserves IDs/logic; it is not an external translation API.
  // Word boundaries: Arabic letters, tatweel and harakat (so "مقدم" never matches inside
  // "مقدمًا"). Keys that start/end with punctuation ("؛ المقاعد…", "كـ") need no boundary there.
  // A key glued to the conjunction "و" ("التسديد وقرارات") is rendered as "and"/"et" + key.
  for (const ar of sorted) {
    if (ar.length < 2) continue;
    if (!text.includes(ar)) continue;
    const letterStart = LETTER.test(ar[0]),
      letterEnd = LETTER.test(ar[ar.length - 1]) && !ar.endsWith("ـ");
    text = text.replace(
      new RegExp(
        (letterStart ? "(^|[^ء-يً-ْ])(و?)" : "()()") +
          escapeRx(ar) +
          (letterEnd ? "(?=$|[^ء-يً-ْ])" : ""),
        "g",
      ),
      (_match, prefix, conj) =>
        prefix +
        (conj && ar.length >= 3 ? CONJ[index] : conj) +
        DICTIONARY[ar][index] +
        (letterEnd ? "" : ar.endsWith("ـ") ? " " : ""),
    );
  }
  if (ARABIC.test(text)) text = replaceNames(text, LATE_NAMES);
  return digits(text);
}
export function translateDOM(root) {
  if (!root || language === "ar") return;
  // Explicit option values must survive presentation translation.
  root
    .querySelectorAll("option:not([value])")
    .forEach((el) => (el.value = el.textContent));
  // Excerpts: translate the full text, then cut — a cut Arabic sentence has no dictionary key.
  root.querySelectorAll("[data-i18n-full]").forEach((el) => {
    const max = Number(el.getAttribute("data-i18n-max")) || 90;
    const full = translateText(el.getAttribute("data-i18n-full"));
    el.textContent =
      full.length > max ? full.slice(0, max).trimEnd() + "…" : full;
  });
  // Monograms (crests, avatars, sponsor marks) take their initials from the Latin name.
  root.querySelectorAll("[data-initials]").forEach((el) => {
    const latin = translateText(el.getAttribute("data-initials"));
    if (ARABIC.test(latin)) return;
    const count = Number(el.getAttribute("data-initials-count")) || 1;
    const mark = latin
      .split(/\s+/)
      .filter((w) => /[A-Za-zÀ-ÿ0-9]/.test(w))
      .slice(0, count)
      .map((w) => w.replace(/^[^A-Za-zÀ-ÿ0-9]+/, "")[0].toUpperCase())
      .join("");
    const node = [...el.childNodes].find(
      (n) => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim(),
    );
    if (mark && node) node.nodeValue = mark;
  });
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest("script,style,[data-no-translate]"))
      continue;
    node.nodeValue = translateText(node.nodeValue);
  }
  root.querySelectorAll("[placeholder],[aria-label]").forEach((el) => {
    for (const attr of ["placeholder", "aria-label"])
      if (el.hasAttribute(attr))
        el.setAttribute(attr, translateText(el.getAttribute(attr)));
  });
}
// Markup for a truncated preview that translateDOM can re-cut after translating the full text.
const escapeHtml = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function excerpt(text, max = 90) {
  const full = String(text ?? "");
  const cut = full.length > max ? full.slice(0, max).trimEnd() + "…" : full;
  return `<span data-i18n-full="${escapeHtml(full)}" data-i18n-max="${max}">${escapeHtml(cut)}</span>`;
}
