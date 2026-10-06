// البحث السريع 0.22b — لوحة أوامر تفتح بـ Ctrl+K أو زر البحث: تنقل فوري بين الشاشات
// واللاعبين (فريقك وسوق الانتقالات) دون المرور بالقوائم. طبقة عرض فقط فوق الحالة الحالية.
import { icon } from "../components/icons.js";
import { NAV_BY_ID, NAV_GROUPS } from "../components/shell.js";
import { avatar } from "../components/shared.js";
import { esc, num, money } from "../ui/format.js";
import { getLanguage, tr } from "../i18n/index.js";

const MAX_SCREENS = 5,
  MAX_PLAYERS = 8;

const groupOf = (id) =>
  NAV_GROUPS.find((g) => g.items.includes(id))?.caption || "";

export function paletteItems(s, q) {
  const query = q.trim().toLowerCase();
  const out = [];
  const push = (item) => out.push(item);
  // الشاشات: مطابقة على الاسم العربي أو الإنجليزي أو معرف القسم.
  for (const [id, nav] of Object.entries(NAV_BY_ID)) {
    if (
      !query ||
      nav.name.toLowerCase().includes(query) ||
      id.includes(query) ||
      groupOf(id).toLowerCase().includes(query)
    )
      push({
        type: "screen",
        id,
        label: nav.name,
        sub: groupOf(id),
        icon: nav.icon,
      });
    if (out.length >= MAX_SCREENS && !query) break;
  }
  if (query) {
    // اللاعبون: فريقك أولًا ثم السوق، بمطابقة الاسم العربي أو اللاتيني أو النادي.
    const match = (p) =>
      p.name.toLowerCase().includes(query) ||
      (p.nameLatin || "").toLowerCase().includes(query);
    const own = s.players.filter((p) => p.clubId === s.clubId && match(p));
    const market = s.players.filter(
      (p) => p.clubId !== s.clubId && match(p),
    );
    for (const p of own.slice(0, MAX_PLAYERS))
      push({
        type: "player",
        id: p.id,
        label: getLanguage() === "ar" ? p.name : p.nameLatin || p.name,
        sub:
          tr("فريقك", "Your squad", "Votre effectif") +
          " · " +
          p.position +
          " · " +
          num(Math.round(p.rating)),
        player: p,
      });
    for (const p of market.slice(0, MAX_PLAYERS))
      push({
        type: "player",
        id: p.id,
        label: getLanguage() === "ar" ? p.name : p.nameLatin || p.name,
        sub:
          tr("السوق", "Market", "Marché") +
          " · " +
          p.position +
          " · " +
          money(p.value),
        player: p,
      });
  }
  return out;
}

const row = (item, i, sel) =>
  `<button class="palette-item ${i === sel ? "sel" : ""}" data-action="palette-select" data-idx="${i}">${
    item.type === "player"
      ? avatar(item.player, true)
      : `<span class="palette-ico">${icon(item.icon || "search", 19)}</span>`
  }<span class="palette-label"><strong>${esc(item.label)}</strong><small>${esc(item.sub)}</small></span>${icon("arrow", 16)}</button>`;

export function paletteOverlay(s, state) {
  const items = state.items || [];
  return `<div class="palette-backdrop" data-action="palette-close"><div class="palette" role="dialog" aria-label="${tr("بحث سريع", "Quick search", "Recherche rapide")}"><div class="palette-input-row">${icon("search", 20)}<input id="palette-input" placeholder="${tr("ابحث عن شاشة أو لاعب…", "Search screens or players…", "Chercher un écran ou un joueur…")}" value="${esc(state.q)}" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div><div class="palette-results" id="palette-results">${
    items.length
      ? items.map((x, i) => row(x, i, state.sel)).join("")
      : `<div class="palette-empty">${tr("لا نتائج مطابقة.", "No matching results.", "Aucun résultat.")}</div>`
  }</div><div class="palette-foot"><span>${tr("↑↓ للتنقل", "↑↓ to navigate", "↑↓ pour naviguer")}</span><span>Enter ${tr("للفتح", "to open", "pour ouvrir")}</span><span>${tr("شاشات ولاعبون", "Screens & players", "Écrans et joueurs")}</span></div></div></div>`;
}
