import { expandedSetup } from "./expanded.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { MARKETS } from "../data/worldMarkets.js";
import { WORLD_MANIFEST } from "../data/packs/world.js";
import { tr } from "../i18n/index.js";
import { DIFFICULTIES } from "../models/difficulty.js";
import { getLanguage } from "../i18n/index.js";
import { CLUBS, LEAGUES } from "../data/catalog.js";
import { APP_VERSION } from "../data/version.js";
import { brand } from "../components/shell.js";
import { stadiumArt } from "../components/stadium.js";
import { crest, badge } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { money, esc , cur} from "../ui/format.js";
export function setupView(
  selected = "ahly",
  owner = "",
  selectedLeagues = ["eg", "en", "sa"],
  config = { difficulty: "normal", database: "world" },
) {
  const club = extendedClub(selected) || extendedClub("ahly");
  return `<div class="setup-page"><header class="setup-header">${brand()}<select id="setup-language" class="language-select" aria-label="لغة الواجهة"><option value="ar" ${getLanguage() === "ar" ? "selected" : ""}>العربية</option><option value="en" ${getLanguage() === "en" ? "selected" : ""}>English</option><option value="fr" ${getLanguage() === "fr" ? "selected" : ""}>Français</option></select><span class="version-pill"><i></i> نسخة تجريبية قابلة للعب <b>ALPHA ${APP_VERSION}</b></span></header><div class="setup-layout"><section class="setup-form"><div class="eyebrow"><span class="line"></span> مشروعك الكروي يبدأ هنا</div><h1>مش مجرد فريق.<br>دي <span>مؤسستك.</span></h1><p class="setup-intro">من أول صفقة لآخر مقعد في المدرجات.<br>اختار ناديك، ابني مشروعك، وسيب بصمتك.</p><div class="step-heading"><span>01</span><div><h3>اختار النادي اللي هتكتب حكايته</h3><small>${config.expanded ? "اختر البلد والدرجة والنادي أدناه" : "٤ أندية في النمط القديم"}</small></div></div>${expandedSetup(selected, config)}<div class="club-grid">${(config.expanded
    ? [club]
    : CLUBS
  )
    .filter((c) => c.cash)
    .map(
      (c) =>
        `<button class="club-choice ${c.id === selected ? "selected" : ""}" data-action="select-club" data-id="${c.id}" aria-pressed="${c.id === selected}"><span class="choice-check">${icon("check", 13)}</span>${crest(c.id)}<strong>${c.name}</strong><small>${c.city}</small><span class="choice-budget">${money(Math.round(c.cash * (DIFFICULTIES[config.difficulty]?.cash || 1)))} <small>${cur()}</small></span></button>`,
    )
    .join(
      "",
    )}</div><div class="setup-fields"><label class="field"><span>اسم المالك</span><input id="owner-name" maxlength="35" value="${esc(owner)}" placeholder="اكتب اسمك هنا" autocomplete="given-name"></label><div class="field"><span>أسواق اللاعبين المتاحة</span><div class="market-tools"><button type="button" class="text-button" data-action="markets-all">${tr("اختيار الكل", "Select all", "Tout sélectionner")}</button><button type="button" class="text-button" data-action="markets-egypt">${tr("مصر فقط", "Egypt only", "Égypte seulement")}</button></div><div class="league-checks world-checks">${(config.database === "world" ? MARKETS : MARKETS.filter((m) => ["eg", "en", "sa"].includes(m.id))).map((l) => `<label><input type="checkbox" name="league" value="${l.id}" ${selectedLeagues.includes(l.id) ? "checked" : ""} ${l.id === "eg" ? "disabled" : ""}><span>${getLanguage() === "ar" ? l.nameAr : l.name}</span></label>`).join("")}</div></div></div><p class="world-import-note">${tr("القاعدة العالمية: ", "World database: ", "Base mondiale : ")}${WORLD_MANIFEST.players} ${config.expanded ? tr("اسم مستورد مع كشف النواقص. الدوريات تعمل في الخلفية؛ الأسواق المختارة تحدد تفصيل اللاعبين والدرجات الأدنى المتاحة.", "imported names with coverage caveats. Leagues run in the background; selected markets enable detailed squads and available lower divisions.", "noms importés avec réserves de couverture. Les ligues sont simulées; les marchés sélectionnés activent les effectifs détaillés et divisions inférieures disponibles.") : tr("اسم مستورد، مع كشف التغطية والنواقص. الأسواق للتعاقدات فقط، وليست دوريات مُحاكاة كاملة.", "imported names, with a coverage and gaps report. Markets support transfers, not full league simulation.", "noms importés, avec rapport des lacunes. Marchés de transferts, pas simulation complète des ligues.")}</p><section class="setup-options"><h3>مستوى الصعوبة</h3><div class="difficulty-options">${Object.entries(
    DIFFICULTIES,
  )
    .map(
      ([id, d]) =>
        `<label class="${config.difficulty === id ? "selected" : ""}"><input type="radio" name="difficulty" value="${id}" ${config.difficulty === id ? "checked" : ""}><strong>${d.name}</strong></label>`,
    )
    .join(
      "",
    )}</div><p class="difficulty-description">${DIFFICULTIES[config.difficulty]?.description || ""}</p><label class="field"><span>قاعدة البداية</span><select id="setup-database"><option value="world" ${config.database === "world" ? "selected" : ""}>${tr("قاعدة عالمية مفتوحة — قوائم منشورة غير مكتملة", "Open world database — incomplete published squads", "Base mondiale ouverte — effectifs publiés incomplets")}</option><option value="current" ${config.database === "current" ? "selected" : ""}>${tr("حزمة 0.2 القديمة — ٨٦ اسمًا أوليًا", "Legacy 0.2 pack — 86 provisional names", "Ancienne base 0.2 — 86 noms provisoires")}</option><option value="demo" ${config.database === "demo" ? "selected" : ""}>عالم خيالي للاختبار</option></select></label><button class="text-button" data-action="data-sources">مصادر اللاعبين وحدود البيانات ↗</button></section><button class="btn primary start-button" data-action="start-game">ابدأ مشوار الملكية ${icon("arrow")}</button><div class="setup-note">${icon("shield", 16)} حفظ على جهازك · مزامنة سحابية اختيارية · بدون دفع</div></section><aside class="setup-showcase"><div class="showcase-art">${stadiumArt()}<span class="floating-tag">${icon("stadium", 16)} رؤيتك أكبر من حدود الملعب</span><div class="showcase-overlay"><span>THE NEXT CHAPTER IS YOURS</span><h2>ناديك.<br>قواعدك.<br><em>إرثك.</em></h2></div></div><div class="selected-club-summary"><div>${crest(selected)}<div><small>مشروعك القادم</small><h3>${club.name}</h3></div>${badge(club.level)}</div><p>${club.desc}</p><div class="setup-metrics"><div><small>سمعة النادي</small><strong>${club.rep}<span>/100</span></strong></div><div><small>ميزانية افتتاحية افتراضية</small><strong>${money(Math.round(club.cash * (DIFFICULTIES[config.difficulty]?.cash || 1)))}<span>${cur()}</span></strong></div></div></div><div class="demo-disclaimer">${icon("info", 19)}<div><strong>الأسماء والأعمار مرجعية؛ القدرات والعقود والاعتزال والأحداث محاكاة وليست حقائق عن الأشخاص.</strong><p>الترجمة الإنجليزية والفرنسية تجريبية؛ بعض النصوص التفصيلية ورسائل الحفظات قد تظل بالعربية.</p></div></div></aside></div><footer class="setup-footer"><span>صُممت للقرارات الكبيرة. وتفاصيلها الصغيرة.</span><div class="setup-footer-actions"><button class="text-button" data-action="cloud-restore-prompt">${icon("world", 16)} استرجاع من السحابة</button><button class="text-button" data-action="import-save">${icon("upload", 16)} استيراد حفظة سابقة</button></div></footer></div>`;
}
