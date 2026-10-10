import { icon } from "./icons.js";
import { crest, clubBy } from "./shared.js";
import { num, date, esc } from "../ui/format.js";
import { pendingActions } from "../services/inbox.js";
import { tr } from "../i18n/index.js";
import { APP_VERSION } from "../data/version.js";

// روابط الأقسام كما هي: نفس المعرفات التي تعتمد عليها الاختبارات والترحيل.
const LINKS = [
  { id: "dashboard", name: "مكتب المالك", icon: "home" },
  { id: "inbox", name: "البريد الوارد", icon: "inbox" },
  { id: "empire", name: "القصر", icon: "crown" },
  { id: "betting", name: "إمبراطورية المراهنات", icon: "finance" },
  { id: "board", name: "الجمعية العمومية", icon: "crown" },
  { id: "politics", name: "رئاسة الاتحاد", icon: "crown" },
  { id: "black", name: "الملفات السوداء", icon: "shield" },
  { id: "squad", name: "الفريق الأول", icon: "squad" },
  { id: "transfers", name: "سوق الانتقالات", icon: "transfer" },
  { id: "database", name: "قاعدة اللاعبين", icon: "search" },
  { id: "careers", name: "المواهب والجهاز الفني", icon: "academy" },
  { id: "management", name: "الإدارة الرياضية", icon: "squad" },
  { id: "staff", name: "الإدارة الشاملة", icon: "academy" },
  { id: "press", name: "غرفة الصحافة", icon: "inbox" },
  { id: "facilities", name: "منشآت النادي", icon: "stadium" },
  { id: "sponsors", name: "الرعايات", icon: "sponsor" },
  { id: "commerce", name: "دخل النادي", icon: "finance" },
  { id: "finance", name: "الإدارة المالية", icon: "finance" },
  { id: "world", name: "عالم الكرة", icon: "world" },
  { id: "legends", name: "قاعة الأساطير", icon: "crown" },
  { id: "dynasty", name: "الأجيال", icon: "crown" },
  { id: "settings", name: "الإعدادات والحفظ", icon: "settings" },
];
const byId = (id) => LINKS.find((l) => l.id === id);

// 0.22: القائمة تُعرض في مجموعات منطقية بدل قائمة واحدة طويلة.
export const NAV_GROUPS = [
  {
    caption: "نظرة عامة",
    items: ["dashboard", "inbox", "empire", "betting", "board", "black"],
  },
  {
    caption: "السياسة والحوكمة",
    items: ["politics"],
  },
  {
    caption: "كرة القدم",
    items: [
      "squad",
      "transfers",
      "database",
      "careers",
      "management",
      "staff",
      "press",
    ],
  },
  {
    caption: "الأعمال والمال",
    items: ["facilities", "sponsors", "commerce", "finance"],
  },
  { caption: "عالم الكرة", items: ["world", "legends"] },
  { caption: "العائلة والإرث", items: ["dynasty"] },
  { caption: "النظام", items: ["settings"] },
];
export const NAV = NAV_GROUPS.flatMap((g) => g.items.map(byId));
export const NAV_BY_ID = Object.fromEntries(
  LINKS.map((l) => [l.id, { name: l.name, icon: l.icon }]),
);
export const brand = () =>
  `<div class="brand"><img src="/crest.svg" alt="" width="35" height="40"><div><strong>EMPIRE FC<span class="brand-dot">.</span></strong><small>${tr("ابنِ إمبراطوريتك", "BUILD YOUR EMPIRE", "BÂTIS VOTRE EMPIRE")}</small></div></div>`;
const navButton = (n, route, unread) =>
  `<button data-nav="${n.id}" class="nav-item ${route === n.id ? "active" : ""}">${icon(n.icon)}<span>${n.name}</span>${n.id === "inbox" && unread ? `<b>${num(unread)}</b>` : ""}</button>`;
export function shell(s, route, content) {
  const club = clubBy(s.clubId),
    unread = s.inbox.filter((m) => !m.read).length,
    pending = pendingActions(s).length;
  return `<div class="app-shell"><aside class="sidebar">${brand()}<div class="sidebar-club">${crest(s.clubId)}<div><strong>${club.name}</strong><small>الموسم التجريبي ${num(s.seasonNumber)}</small></div></div><nav>${NAV_GROUPS.map((g) => `<div class="nav-group"><div class="nav-caption">${g.caption}</div>${g.items.map((id) => navButton(byId(id), route, unread)).join("")}</div>`).join("")}</nav><div class="sidebar-bottom"><span class="online-dot"></span> EMPIRE FC <button type="button" class="version-badge" data-action="secret-vault">v${APP_VERSION}</button></div><div class="owner-mini"><span class="owner-avatar">${icon("crown", 20)}</span><div><strong data-no-translate>${esc(s.owner)}</strong><small>مالك ورئيس النادي</small></div>${icon("shield", 19)}</div></aside><div class="main-column"><header class="topbar"><div class="breadcrumb"><span class="mobile-brand">${icon("crown", 23)}</span><span>إدارة النادي</span><b>/</b><strong>${NAV.find((n) => n.id === route)?.name || "مكتب المالك"}</strong></div><div class="topbar-actions"><span class="save-indicator" role="status" aria-live="polite"><i></i> محفوظ محليًا</span><button class="icon-btn palette-open-btn" data-action="palette-open" aria-label="بحث سريع" title="بحث سريع (Ctrl+K)">${icon("search")}</button><button class="icon-btn notification-button" data-nav="inbox" aria-label="البريد الوارد">${icon("bell")}${unread ? "<i></i>" : ""}</button><span class="top-avatar" data-no-translate>${esc(s.owner[0])}</span></div></header><div class="timebar"><div class="game-date">${icon("calendar", 19)}<span>${date(s.date)}</span><span class="season-tag">${tr("الموسم", "Season", "Saison")} ${num(s.seasonNumber)}</span></div><div class="time-controls">${pending ? `<span class="pause-label"><i></i> ${num(pending)} قرار مطلوب</span>` : ""}${s.remainingDays > 0 ? `<button class="btn ghost resume" data-action="resume">استكمال ${num(s.remainingDays)} أيام</button>` : ""}<select id="advance-days" aria-label="مدة تمرير الوقت"><option value="1">يوم واحد</option><option value="7" selected>أسبوع</option></select><button class="btn primary advance-btn" data-action="advance">تقدم الوقت ${icon("arrow", 18)}</button></div></div><main id="main-content" class="content">${content}<footer class="page-footer"><span>كل قرار يصنع مستقبل ناديك.</span><span>© 2026 <span data-no-translate>Ahmed S. Abodooh</span></span><span>${tr("محاكاة للتسلية — مفيش فلوس حقيقية", "A simulation for fun — no real money", "Une simulation pour le plaisir — sans argent réel")}</span></footer></main></div><nav class="mobile-nav">${[NAV[0], NAV[1], NAV[2], NAV[3], { id: "more", name: "المزيد", icon: "more" }].map((n) => `<button ${n.id === "more" ? 'data-action="more"' : `data-nav="${n.id}"`} class="${route === n.id ? "active" : ""}">${icon(n.icon, 21)}<span>${n.name}</span>${n.id === "inbox" && pending ? "<i></i>" : ""}</button>`).join("")}</nav></div>`;
}
