// 0.24 «Empire FC» — سكربت التطبيق الكامل لتغييرات الإصدار.
// يُشغَّل من جذر المستودع: node apply-0.24.mjs
// ملاحظة: الملف بامتداد .mjs (ESM) لذلك استُبدل `require("fs")` بـ import مكافئ.
import fs from "node:fs";

// حارس تكرار: السكربت one-shot. تشغيله ثانيةً كان سيكرّر سطر 0.24 في README
// ويسجّل كل الاستبدالات كمفقودة (لأن النصوص القديمة لم تعد موجودة) ثم يفشل —
// لذلك نتوقف مبكرًا إذا كان الإصدار مطبّقًا بالفعل.
if (
  fs.existsSync("clubowner/src/data/version.js") &&
  fs.readFileSync("clubowner/src/data/version.js", "utf8").includes('APP_VERSION = "0.24"')
) {
  console.log("0.24 مطبّقة بالفعل — لا شيء لعمله.");
  process.exit(0);
}

let misses = 0;
const edit = (f, pairs) => {
  let s = fs.readFileSync(f, "utf8");
  for (const [a, b] of pairs) {
    if (typeof a === "string") {
      if (!s.includes(a)) { console.log("!! [" + f + "] غير موجود:", a.slice(0, 45)); misses++; continue; }
      s = s.split(a).join(b);
    } else {
      if (!a.test(s)) { console.log("!! [" + f + "] النمط غير موجود:", String(a).slice(0, 40)); misses++; continue; }
      s = s.replace(a, b);
    }
  }
  fs.writeFileSync(f, s);
};

// ═══ شاشة البداية ═══
edit("clubowner/src/features/setup.js", [
  ['<span class="version-pill"><i></i> نسخة تجريبية قابلة للعب <b>ALPHA ${APP_VERSION}</b></span>', ''],
  ['import { APP_VERSION } from "../data/version.js";\n', ''],
  ['tr("قاعدة عالمية مفتوحة — قوائم منشورة غير مكتملة", "Open world database — incomplete published squads", "Base mondiale ouverte — effectifs publiés incomplets")',
   'tr("العالم الكامل — دوريات من ٥٠ دولة", "The full world — leagues from 50 countries", "Le monde complet — ligues de 50 pays")'],
  ['tr("حزمة 0.2 القديمة — ٨٦ اسمًا أوليًا", "Legacy 0.2 pack — 86 provisional names", "Ancienne base 0.2 — 86 noms provisoires")',
   'tr("بداية سريعة — تجربة مركّزة", "Quick start — a focused experience", "Démarrage rapide — une expérience ciblée")'],
  ['>عالم خيالي للاختبار</option>', '>${tr("عالم خيالي", "Fictional world", "Monde fictif")}</option>'],
  [/<p class="world-import-note">[\s\S]*?<\/p>/,
   '<p class="world-import-note">${tr("اختر أسواق التعاقد المتاحة لناديك — أسواق أخرى تُفتح مع توسّع مشروعك.", "Pick the transfer markets open to your club — more unlock as your project grows.", "Choisissez les marchés ouverts à votre club — d’autres se débloquent avec votre projet.")}</p>'],
  ['>مصادر اللاعبين وحدود البيانات ↗</button>', '>${tr("المصادر والتراخيص ↗", "Sources & licenses ↗", "Sources et licences ↗")}</button>'],
  ['"اختر البلد والدرجة والنادي أدناه" : "٤ أندية في النمط القديم"',
   'tr("اختر البلد والدرجة والنادي", "Pick the country, division and club", "Choisissez le pays, la division et le club") : tr("أربعة أندية جاهزة للقيادة", "Four clubs ready to lead", "Quatre clubs prêts à mener")'],
]);

// ═══ طريقة المشوار + التراخيص ═══
edit("clubowner/src/features/expanded.js", [
  ['import { fifaCard, fifaOverview } from "./fifa/cards.js";',
   'import { fifaCard, fifaOverview } from "./fifa/cards.js";\nimport { tr } from "../i18n/index.js";'],
  ['>المنافسة التجريبية القديمة</option>', '>${tr("النظام الأساسي — دوري وكأس محليان", "Core system — domestic league and cup", "Système de base — championnat et coupe nationaux")}</option>'],
  ['>عالم موسع 0.20 — اقتصاد وبطولات وأساطير ومسيرة طويلة</option>', '>${tr("العالم الموسع — بطولات قارية وأساطير ومسيرة طويلة", "Expanded world — continental cups, legends and a long career", "Monde étendu — coupes continentales, légendes et longue carrière")}</option>'],
  [/<p class="muted">أندية حقيقية[\s\S]*?<\/p>/,
   '<p class="muted">${tr("دوريات وأندية حقيقية بتقديرات تحريرية.", "Real leagues and clubs with editorial estimates.", "Vraies ligues et clubs avec estimations éditoriales.")} <a href="/lower-data-license.html" target="_blank" rel="noopener">${tr("المصادر والتراخيص ↗", "Sources & licenses ↗", "Sources et licences ↗")}</a></p>'],
]);

// ═══ الهيكل: البراند + السايدبار + شريط الوقت + الفوتر ═══
edit("clubowner/src/components/shell.js", [
  ['import { pendingActions } from "../services/inbox.js";',
   'import { pendingActions } from "../services/inbox.js";\nimport { tr } from "../i18n/index.js";'],
  ['<div><strong>صاحب النادي<span class="brand-dot">.</span></strong><small>CLUB OWNER</small></div>',
   '<div><strong>EMPIRE FC<span class="brand-dot">.</span></strong><small>${tr("ابنِ إمبراطوريتك", "BUILD YOUR EMPIRE", "BÂTIS VOTRE EMPIRE")}</small></div>'],
  ['<span class="online-dot"></span> نسخة تطوير مستقلة <button type="button" class="version-badge" data-action="secret-vault">v${APP_VERSION}</button>',
   '<span class="online-dot"></span> EMPIRE FC <button type="button" class="version-badge" data-action="secret-vault">v${APP_VERSION}</button>'],
  ['<span class="season-tag">سيناريو اختبار · عالم تجريبي</span>',
   '<span class="season-tag">${tr("الموسم", "Season", "Saison")} ${num(s.seasonNumber)}</span>'],
  ['<span>بيانات تجريبية · لا معاملات أو أموال حقيقية</span>',
   '<span>${tr("محاكاة للتسلية — مفيش فلوس حقيقية", "A simulation for fun — no real money", "Une simulation pour le plaisir — sans argent réel")}</span>'],
]);

// ═══ عنوان الصفحة ═══
edit("clubowner/src/main.js", [
  ['document.title =\n      getLanguage() === "ar" ? "صاحب النادي | Club Owner" : "Club Owner";',
   'document.title = "Empire FC";'],
  ['(NAV.find((n) => n.id === ui.route)?.name || "صاحب النادي") +\n    " | صاحب النادي";',
   '(NAV.find((n) => n.id === ui.route)?.name || "Empire FC") + " | Empire FC";'],
]);

// ═══ الإعدادات ═══
edit("clubowner/src/features/settings.js", [
  ['${badge(`ALPHA ${APP_VERSION}`)}', '${badge(`v${APP_VERSION}`)}'],
  ['tr("«صاحب النادي» — لعبة إدارة وملكية نادي كرة قدم تعمل بالكامل في المتصفح: محرك وقت، تعاقدات، مالية، رعايات، منشآت، بطولات، وحفظ محلي وسحابي.", "“Club Owner” — a football club ownership and management game that runs entirely in the browser: time engine, transfers, finances, sponsors, facilities, competitions, and local plus cloud saves.", "« Club Owner » — un jeu de gestion et de propriété de club de football entièrement dans le navigateur : moteur de temps, transferts, finances, sponsors, installations, compétitions, sauvegardes locales et cloud.")',
   'tr("«Empire FC» — ابنِ ناديك من الصفر: تعاقدات، مالية، رعايات، منشآت، بطولات قارية وعالمية، وحفظ محلي وسحابي — كله في المتصفح.", "“Empire FC” — build your club from the ground up: transfers, finances, sponsors, facilities, continental and world competitions, local and cloud saves — all in the browser.", "« Empire FC » — bâtissez votre club : transferts, finances, sponsors, installations, compétitions continentales et mondiales, sauvegardes locales et cloud — dans le navigateur.")'],
]);

// ═══ index.html والمانيفست والنسخة ═══
edit("clubowner/index.html", [
  ['<title>صاحب النادي | Club Owner</title>', '<title>Empire FC — ابنِ إمبراطوريتك</title>'],
  ['<meta name="apple-mobile-web-app-title" content="صاحب النادي" />', '<meta name="apple-mobile-web-app-title" content="Empire FC" />'],
  ['content="0.23.0"', 'content="0.24.0"'],
]);
edit("clubowner/public/manifest.webmanifest", [
  ['"name": "صاحب النادي | Club Owner"', '"name": "Empire FC — ابنِ إمبراطوريتك"'],
  ['"short_name": "صاحب النادي"', '"short_name": "Empire FC"'],
  ['"description": "لعبة إدارة وملكية نادي كرة قدم — نسخة تجريبية"', '"description": "ابنِ إمبراطوريتك — لعبة ملكية وإدارة نادي كرة قدم في المتصفح"'],
]);
edit("clubowner/src/data/version.js", [['APP_VERSION = "0.23"', 'APP_VERSION = "0.24"']]);
edit("clubowner/package.json", [['"version": "0.23.0"', '"version": "0.24.0"']]);
edit("package.json", [['"version": "0.23.0"', '"version": "0.24.0"']]);
const root = JSON.parse(fs.readFileSync("package.json", "utf8"));
root.scripts.prepare = "npm run build";
fs.writeFileSync("package.json", JSON.stringify(root, null, 2) + "\n");

// ═══ الصفحات الثابتة بالهوية الملكية ═══
const palettes = [
  ["clubowner/public/data-license.html", { "#101c1a": "#0a1322", "#1c2c26": "#10203a", "#435d4b": "#22395f", "#9ae4be": "#5b9dff", "#bfc8c2": "#8fa5c4", "#ecf3ed": "#eaf1fa" }],
  ["clubowner/public/lower-data-license.html", { "#14251f": "#0a1322", "#20372b": "#10203a", "#415748": "#22395f", "#c1ed96": "#e3b84e", "#e8efe9": "#eaf1fa" }],
  ["clubowner/public/legacy-lower-data-license.html", { "#14251f": "#0a1322", "#415748": "#22395f", "#c1ed96": "#e3b84e", "#e8efe9": "#eaf1fa" }],
  ["clubowner/public/competition-notes.html", { "#0b1821": "#0a1322", "#203128": "#10203a", "#415444": "#22395f", "#a9bdc5": "#8fa5c4", "#b6dcff": "#7cb5ff", "#c3ec91": "#e3b84e", "#edf3f5": "#eaf1fa" }],
];
for (const [f, map] of palettes) {
  let s = fs.readFileSync(f, "utf8");
  for (const [o, n] of Object.entries(map)) s = s.split(o).join(n);
  fs.writeFileSync(f, s);
  console.log("إعادة تلوين:", f);
}

// ═══ README ═══
let r = fs.readFileSync("clubowner/README.md", "utf8");
r = `> **مرحلة التطوير 0.24 — «Empire FC»:** هوية اللعبة الجديدة بالاسم الإنجليزي Empire FC (ابنِ إمبراطوريتك)، شاشة بداية نظيفة تتكلم لغة اللاعبين بدل لغة التطوير، وصفحات المصادر والتراخيص بالهوية الملكية الجديدة. [التفاصيل](docs/FEATURES-0.24.md).\n\n` + r;
r = r.replace("# صاحب النادي — 0.23.0 · Club Owner", "# Empire FC — 0.24.0 · ابنِ إمبراطوريتك");
fs.writeFileSync("clubowner/README.md", r);

if (misses > 0) { console.log("فشل: " + misses + " استبدال غير موجود"); process.exit(1); }
console.log("✅ كل تعديلات 0.24 اتطبقت بنجاح");
