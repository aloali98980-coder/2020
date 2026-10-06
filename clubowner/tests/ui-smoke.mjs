// فحص دخاني لكل شاشات الواجهة عبر Node (بلا متصفح):
// يُنشئ حفظة صغيرة ثم يُرندر كل مسار عبر دوال العرض نفسها التي تستخدمها الواجهة،
// ويتحقق من بنية القوائم الجديدة (NAV_GROUPS) ومن أن كل زر تنقل يقود لشاشة موجودة.
// ملاحظة: هذا لا يحل محل اختبارات المتصفح (tests/browser-check.mjs)؛ يكشف أخطاء
// القوالب والاستيرادات والمتغيرات غير المعرفة قبل فتح المتصفح.
import { createGame } from "../src/core/game.js";
import { shell, NAV, NAV_GROUPS, NAV_BY_ID } from "../src/components/shell.js";
import { dashboardView } from "../src/features/dashboard.js";
import { inboxView } from "../src/features/inbox.js";
import { playersView } from "../src/features/players.js";
import { facilitiesView } from "../src/features/facilities.js";
import { sponsorsView } from "../src/features/sponsors.js";
import { financeView } from "../src/features/finance.js";
import { databaseView } from "../src/features/database.js";
import { worldView } from "../src/features/world.js";
import {
  commerceView,
  managementView,
  pressView,
  competitionsView,
} from "../src/features/expanded.js";
import { careersView } from "../src/features/careers.js";
import { legendsView, DEFAULT_LEGEND_FILTERS } from "../src/features/legends.js";
import { settingsView } from "../src/features/settings.js";
import { setLanguage } from "../src/i18n/index.js";

const s = createGame({
  clubId: "ahly",
  owner: "عمر",
  leagues: [],
  difficulty: "normal",
  database: "current",
  expanded: false,
  language: "ar",
});

const views = {
  dashboard: () => dashboardView(s),
  inbox: () => inboxView(s, "all", null),
  squad: () => playersView(s, false, { search: "", pos: "all", league: "all" }),
  transfers: () => playersView(s, true, { search: "", pos: "all", league: "all" }),
  facilities: () => facilitiesView(s),
  sponsors: () => sponsorsView(s),
  finance: () => financeView(s, "ledger"),
  database: () => databaseView(),
  world: () => (s.expansion ? competitionsView(s, undefined) : worldView(s, "table")),
  legends: () => legendsView(s, { ...DEFAULT_LEGEND_FILTERS }),
  careers: () => careersView(s, undefined),
  commerce: () => commerceView(s),
  management: () => managementView(s),
  press: () => pressView(s),
  settings: () => settingsView(s),
};

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log("✓", name);
  } catch (e) {
    failures++;
    console.error("✗", name, "—", e.message);
  }
};

check("كل مسارات التنقل لها شاشة تعمل", () => {
  for (const n of NAV) {
    if (!views[n.id]) throw Error(`لا توجد شاشة للمسار ${n.id}`);
    const html = views[n.id]();
    if (typeof html !== "string" || html.length < 40)
      throw Error(`شاشة ${n.id} أنتجت محتوى غير سليم`);
  }
});

check("المجموعات الخمس تغطي الأقسام الخمسة عشر دون تكرار", () => {
  const ids = NAV_GROUPS.flatMap((g) => g.items);
  if (ids.length !== 15) throw Error(`عدد الأقسام ${ids.length} بدل 15`);
  if (new Set(ids).size !== 15) throw Error("تكرار في أقسام المجموعات");
  if (NAV_GROUPS.length !== 5) throw Error("عدد المجموعات ليس 5");
  for (const g of NAV_GROUPS)
    if (!g.caption) throw Error(`مجموعة بلا عنوان: ${JSON.stringify(g.items)}`);
});

check("القائمة الجانبية تعرض زرًا لكل قسم داخل مجموعات", () => {
  const html = shell(s, "dashboard", "<div>x</div>");
  const groups = html.match(/class="nav-group"/g)?.length;
  if (groups !== NAV_GROUPS.length)
    throw Error(`عدد مجموعات القائمة ${groups} بدل ${NAV_GROUPS.length}`);
  for (const n of NAV) {
    const re = new RegExp(`data-nav="${n.id}"`);
    if (!re.test(html)) throw Error(`الزر ${n.id} غير موجود في القائمة`);
  }
  if (!/class="nav-caption">نظرة عامة/.test(html)) throw Error("عناوين المجموعات غائبة");
});

check("شريط الموبايل: الأزرار الأربعة + المزيد", () => {
  const html = shell(s, "dashboard", "<div>x</div>");
  const mob = html.match(/class="mobile-nav"[\s\S]*?<\/nav>/)?.[0] || "";
  for (const id of ["dashboard", "inbox", "squad", "transfers"])
    if (!mob.includes(`data-nav="${id}"`))
      throw Error(`زر الموبايل ${id} غير موجود`);
  if (!mob.includes('data-action="more"')) throw Error("زر المزيد غير موجود");
});

check("شاشة كل مسار تُرندر داخل الـshell دون أخطاء", () => {
  for (const n of NAV) shell(s, n.id, views[n.id]());
});

check("الترجمة الإنجليزية لا تكسر الرندر", () => {
  setLanguage("en");
  for (const id of ["dashboard", "world", "settings", "legends"]) {
    shell(s, id, views[id]());
  }
  setLanguage("ar");
});

check("NAV_BY_ID يغطي كل الأقسام", () => {
  for (const n of NAV) {
    const l = NAV_BY_ID[n.id];
    if (!l?.name || !l?.icon) throw Error(`بيانات ناقصة للقسم ${n.id}`);
  }
});

if (failures) {
  console.error(`${failures} فحص فشل`);
  process.exit(1);
}
console.log("كل فحوصات الواجهة نجحت");
