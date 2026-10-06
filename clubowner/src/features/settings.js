import { getLanguage, tr } from "../i18n/index.js";
import { DIFFICULTIES } from "../models/difficulty.js";
import { heading, button, badge, infoNote } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { date, num } from "../ui/format.js";
import { getSession, isAuthenticated } from "../services/auth.js";
import { getDisplayCurrency, DISPLAY_CURRENCIES } from "../ui/format.js";
import { CURRENCIES } from "../data/currencies.js";
import { APP_VERSION } from "../data/version.js";
import { listSlots, MAX_SAVE_SLOTS } from "../services/slots.js";

const themePref = () => {
  try {
    return localStorage.getItem("clubowner.theme") || "dark";
  } catch {
    return "dark";
  }
};
const fontPref = () => {
  try {
    return localStorage.getItem("clubowner.fontsize") || "normal";
  } catch {
    return "normal";
  }
};
const currencyName = (code) => {
  const c = CURRENCIES.find((x) => x.code === code);
  return c ? `${c.name} (${c.symbol})` : code;
};
const mb = (size) => (size / 1048576).toFixed(1) + " MB";
function slotsPanel() {
  const slots = listSlots();
  return `<section class="panel settings-panel"><div class="panel-head"><h3>${icon("shield")} ${tr("خانات الحفظ", "Save slots", "Emplacements")}</h3>${badge(num(slots.length) + " / " + num(MAX_SAVE_SLOTS), slots.length ? "green" : "")}</div><p>${tr("لقطات كاملة من مشوارك بمعزل عن الحفظة النشطة: احفظ وضعك الحالي في خانة، وارجع إليه لاحقًا من هذا المتصفح. تحميل خانة يستبدل الحفظة النشطة بعد تأكيد.", "Full snapshots of your career kept apart from the active save: store your current position in a slot and return to it later on this browser. Loading a slot replaces the active save after confirmation.", "Instantanés complets de votre carrière, indépendants de la sauvegarde active : stockez votre position et y revenir plus tard. Charger un emplacement remplace la sauvegarde active après confirmation.")}</p><div class="slot-create"><input id="slot-name" maxlength="40" placeholder="${tr("اسم الخانة (اختياري)", "Slot name (optional)", "Nom (facultatif)")}" aria-label="${tr("اسم الخانة", "Slot name", "Nom de l'emplacement")}">${button(tr("احفظ الحالية في خانة", "Snapshot current save", "Sauvegarder dans un emplacement"), "slot-save", "", "primary")}</div><div class="slots-list">${slots.length ? slots.map((x) => `<div class="slot-row"><div class="slot-info"><strong>${x.name}</strong><small>${x.clubName} · ${tr("الموسم", "Season", "Saison")} ${num(x.season)} · ${date(x.date)} · ${num(x.players)} ${tr("لاعبًا", "players", "joueurs")} · ${mb(x.size)}${x.database === "world" ? " · " + tr("عالم موسع", "World DB", "Base monde") : ""}</small></div><div class="slot-actions">${button(tr("تحميل", "Load", "Charger"), "slot-load", x.id, "secondary small")}${button(tr("حذف", "Delete", "Supprimer"), "slot-delete", x.id, "danger small")}</div></div>`).join("") : `<div class="slot-empty">${tr("لا خانات بعد. أول لقطة تبدأ من هنا.", "No slots yet. Your first snapshot starts here.", "Aucun emplacement. Votre premier instantané commence ici.")}</div>`}</div></section>`;
}


function cloudPanel(s) {
  const session = getSession();
  const loggedIn = isAuthenticated();

  if (loggedIn && session?.user) {
    const lastSyncText = session.lastSync
      ? new Date(session.lastSync).toLocaleString("ar-EG")
      : "لم تتم المزامنة بعد";

    return `<section class="panel settings-panel cloud-panel">
      <div class="panel-head">
        <h3>${icon("world")} الحساب والمزامنة السحابية</h3>
        ${badge("متصل بالسحابة", "green")}
      </div>
      <p>حفظتك مؤمنة ومرتبطة بحسابك؛ يمكنك المزامنة واللعب من أي جهاز (كمبيوتر أو هاتف) واسترجاع مسيرتك فورًا حتى لو حُذفت بيانات المتصفح.</p>
      <div class="cloud-user-box">
        <div class="cloud-user-info">
          <strong>${icon("crown", 16)} ${session.user.username}</strong>
          <small>${session.user.email}</small>
        </div>
        <div>
          ${button("تسجيل الخروج", "cloud-logout", "", "ghost small")}
        </div>
      </div>
      <div class="cloud-sync-status">
        آخر مزامنة سحابية: <b>${lastSyncText}</b>
      </div>
      <div class="settings-actions">
        ${button(icon("upload", 16) + " مزامنة الآن إلى السحابة", "cloud-sync-now", "", "primary")}
        ${button(icon("download", 16) + " استرجاع من السحابة", "cloud-restore-prompt", "", "secondary")}
        ${button("سجل الحفظات", "cloud-saves-list", "", "soft")}
      </div>
    </section>`;
  }

  return `<section class="panel settings-panel cloud-panel">
    <div class="panel-head">
      <h3>${icon("world")} الحساب والمزامنة السحابية</h3>
      ${badge("اختياري", "gold")}
    </div>
    <p>احفظ مسيرتك سحابيًا لحمايتها من مسح المتصفح التلقائي على الآيفون والكمبيوتر، وتنقل بين أجهزتك بحرية. اللعب بدون حساب يظل متاحًا ومحليًا 100٪.</p>
    <div class="settings-actions" style="margin-top: 15px;">
      ${button(icon("crown", 17) + " تسجيل الدخول / إنشاء حساب", "open-auth-modal", "", "primary")}
    </div>
  </section>`;
}

export function settingsView(s) {
  return `${heading("إنت اللي بتحدد طريقة إدارتك", "الإعدادات والحفظ", "حافظ على مشوارك، واضبط إيقاع العالم.")}
  ${cloudPanel(s)}
  <section class="panel install-panel">
    <div>
      <span class="eyebrow">الآيفون والشاشة الرئيسية</span>
      <h3>ناديك دايمًا قريب منك</h3>
      <p>بعد الاستضافة على HTTPS، ضيف الأيقونة من Safari. الأوفلاين يحتاج تجهيزًا أول مرة؛ معتمد ومختبر بالكامل على Safari وآيفون وChromium.</p>
    </div>
    ${button(icon("download", 17) + " طريقة الإضافة", "install-guide", "", "soft")}
  </section>
  <section class="panel language-panel">
    <label class="field">
      <span>لغة الواجهة</span>
      <select id="game-language">
        <option value="ar" ${getLanguage() === "ar" ? "selected" : ""}>العربية</option>
        <option value="en" ${getLanguage() === "en" ? "selected" : ""}>English</option>
        <option value="fr" ${getLanguage() === "fr" ? "selected" : ""}>Français</option>
      </select>
    </label>
    <div>
      <span>مستوى الصعوبة</span>
      ${badge(DIFFICULTIES[s.difficulty]?.name || "متوسط", "green")}
      <p>الإنجليزية والفرنسية تغطيان كل الشاشات والرسائل والتقارير المولّدة داخل اللعبة؛ ما تكتبه أنت (اسم المالك) يبقى كما هو.</p>
    </div>
    ${button("مصادر اللاعبين وحدود البيانات", "data-sources", "", "ghost")}
  </section>
  <div class="info-note">${s.database === "world" ? "القاعدة الكبيرة محفوظة محليًا في IndexedDB، وتدعم المزامنة السحابية بحسابك. صدّر نسخة احتياطية دوريًا." : ""}</div>
  <div class="settings-grid">
    <section class="panel settings-panel">
      <div class="panel-head">
        <h3>${icon("download")} حفظ اللعبة محليًا</h3>
        ${badge("على هذا المتصفح", "green")}
      </div>
      <p>حفظ العالم يُصدّر مضغوطًا JSON.GZ، مع قبول JSON القديم. حد ١٦٠ MiB بعد فك الضغط و٨٠ MiB للملف المضغوط. كل قرار يُحفظ تلقائيًا على جهازك. مسح بيانات المتصفح أو تغيير الرابط قد يفقد الوصول للحفظة؛ صدّر نسخة احتياطية بشكل دوري.</p>
      <div class="save-card">
        <span class="save-file">${icon("shield", 28)}</span>
        <div>
          <strong>الموسم ${s.seasonNumber} · ${date(s.date)}</strong>
          <small>صيغة الحفظ v${s.version} · ${num(s.players.length)} لاعب في العالم</small>
        </div>
      </div>
      <div class="settings-actions">
        ${button(icon("download", 17) + " تصدير ملف", "export-save", "", "primary")}
        ${button(icon("upload", 17) + " استيراد ملف", "import-save", "", "secondary")}
      </div>
    </section>
    ${slotsPanel()}
    <section class="panel settings-panel">
      <div class="panel-head">
        <h3>${icon("settings")} ${tr("المظهر والواجهة", "Appearance & interface", "Apparence et interface")}</h3>
      </div>
      <div class="preference-row">
        <div>
          <strong>${tr("الثيم", "Theme", "Thème")}</strong>
          <small>${tr("أزرق ملكي داكن، أو فاتح، أو حسب نظام جهازك", "Royal dark, light, or follow your system", "Sombre royal, clair, ou selon votre système")}</small>
        </div>
        <label class="field slim"><select id="theme-select" aria-label="${tr("الثيم", "Theme", "Thème")}"><option value="dark" ${themePref() === "dark" ? "selected" : ""}>${tr("داكن", "Dark", "Sombre")}</option><option value="light" ${themePref() === "light" ? "selected" : ""}>${tr("فاتح", "Light", "Clair")}</option><option value="system" ${themePref() === "system" ? "selected" : ""}>${tr("حسب النظام", "System", "Système")}</option></select></label>
      </div>
      <div class="preference-row">
        <div>
          <strong>${tr("حجم الخط", "Text size", "Taille du texte")}</strong>
          <small>${tr("عادي، أو كبير للراحة والتابلت", "Normal, or large for comfort and tablets", "Normal ou grand pour le confort et les tablettes")}</small>
        </div>
        <label class="field slim"><select id="font-size" aria-label="${tr("حجم الخط", "Text size", "Taille du texte")}"><option value="normal" ${fontPref() !== "large" ? "selected" : ""}>${tr("عادي", "Normal", "Normal")}</option><option value="large" ${fontPref() === "large" ? "selected" : ""}>${tr("كبير", "Large", "Grand")}</option></select></label>
      </div>
      <div class="preference-row">
        <div>
          <strong>${tr("عملة العرض", "Display currency", "Devise d'affichage")}</strong>
          <small>${tr("الأسعار نموذجية ثابتة للعرض؛ كل الحسابات تتم بالجنيه", "Fixed modeled rates for display; all accounting stays in EGP", "Taux fixes pour l'affichage ; la comptabilité reste en EGP")}</small>
        </div>
        <label class="field slim"><select id="display-currency" aria-label="${tr("عملة العرض", "Display currency", "Devise d'affichage")}">${DISPLAY_CURRENCIES.map((c) => `<option value="${c}" ${getDisplayCurrency() === c ? "selected" : ""}>${currencyName(c)}</option>`).join("")}</select></label>
      </div>
      <div class="preference-row">
        <div>
          <strong>${tr("تقليل الحركة", "Reduce motion", "Réduire les animations")}</strong>
          <small>${tr("إيقاف انتقالات الشاشات والتفاعلات المتحركة", "Stop screen transitions and animated interactions", "Couper les transitions et animations")}</small>
        </div>
        <label class="switch"><input type="checkbox" id="reduce-motion" ${s.preferences.reduceMotion ? "checked" : ""}><span></span></label>
      </div>
      <div class="preference-row">
        <div>
          <strong>${tr("نمط الأرقام", "Number style", "Style des chiffres")}</strong>
          <small>${tr("هندية ١٢٣ أو غربية 123 في كل الشاشات", "Arabic-Indic ١٢٣ or Western 123 everywhere", "Indo-arabes ١٢٣ ou occidentaux 123")}</small>
        </div>
        <label class="field slim"><select id="num-format" aria-label="${tr("نمط الأرقام", "Number style", "Style des chiffres")}"><option value="arabic" ${s.preferences.digits !== "western" ? "selected" : ""}>${tr("هندية ١٢٣", "Arabic-Indic ١٢٣", "Indo-arabes ١٢٣")}</option><option value="western" ${s.preferences.digits === "western" ? "selected" : ""}>${tr("غربية 123", "Western 123", "Occidentaux 123")}</option></select></label>
      </div>
      <div class="preference-row">
        <div>
          <strong>${tr("اختصارات لوحة المفاتيح", "Keyboard shortcuts", "Raccourcis clavier")}</strong>
          <small><kbd>Ctrl</kbd> + <kbd>K</kbd> — ${tr("البحث السريع عن شاشة أو لاعب", "Quick search for a screen or player", "Recherche rapide écran ou joueur")}</small>
        </div>
        ${badge(tr("لوحة مفاتيح", "Desktop", "Bureau"), "")}
      </div>
    </section>
    <section class="panel settings-panel">
      <div class="panel-head">
        <h3>${icon("clock")} إيقاع المحاكاة</h3>
      </div>
      <div class="preference-row">
        <div>
          <strong>التوقف بعد مباراة ناديك</strong>
          <small>حتى لو طلبت تمرير أسبوع كامل</small>
        </div>
        <label class="switch"><input type="checkbox" id="pause-matches" ${s.preferences.pauseMatches ? "checked" : ""}><span></span></label>
      </div>
      <div class="preference-row">
        <div>
          <strong>${tr("فتح تقرير المباراة تلقائيًا", "Open match report automatically", "Ouvrir le rapport automatiquement")}</strong>
          <small>${tr("بعد كل مباراة لناديك مباشرة", "Right after each of your club's matches", "Juste après chaque match de votre club")}</small>
        </div>
        <label class="switch"><input type="checkbox" id="auto-report" ${s.preferences.autoMatchReport === false ? "" : "checked"}><span></span></label>
      </div>
      <div class="preference-row">
        <div>
          <strong>التوقف عند القرارات الإلزامية</strong>
          <small>عروض انتقال، رعايات، وتجديد عقود</small>
        </div>
        ${badge("مفعّل دائمًا", "green")}
      </div>
      <p class="fine-print">اليوم والأسبوع يتم تمريرهما يومًا بيوم. النظام يحتفظ بالأيام المتبقية عند التوقف.</p>
    </section>
    <section class="panel settings-panel about-panel">
      <div class="panel-head">
        <h3>${icon("info")} ${tr("عن اللعبة", "About the game", "À propos du jeu")}</h3>
        ${badge(`ALPHA ${APP_VERSION}`)}
      </div>
      <div class="about-author">
        <span class="about-avatar" data-no-translate>A</span>
        <div>
          <strong data-no-translate>Ahmed S. Abodooh</strong>
          <small>${tr("تصميم وتطوير اللعبة", "Game design & development", "Conception et développement du jeu")}</small>
        </div>
      </div>
      <p>${tr("«صاحب النادي» — لعبة إدارة وملكية نادي كرة قدم تعمل بالكامل في المتصفح: محرك وقت، تعاقدات، مالية، رعايات، منشآت، بطولات، وحفظ محلي وسحابي.", "“Club Owner” — a football club ownership and management game that runs entirely in the browser: time engine, transfers, finances, sponsors, facilities, competitions, and local plus cloud saves.", "« Club Owner » — un jeu de gestion et de propriété de club de football entièrement dans le navigateur : moteur de temps, transferts, finances, sponsors, installations, compétitions, sauvegardes locales et cloud.")}</p>
      <div class="scope-list">
        <span>${icon("check", 16)} مفاوضات وانتقالات وعقود</span>
        <span>${icon("check", 16)} دفعات ورعايات وحصرية</span>
        <span>${icon("check", 16)} مشروعات وآثار تشغيلية</span>
        <span>${icon("check", 16)} عالم موسّع ومزامنة سحابية</span>
      </div>
      <div class="contact-box">
        <div>
          <strong>${tr("تواصل معنا", "Contact us", "Nous contacter")}</strong>
          <small>${tr("اقتراحات، مشاكل، أو ملاحظات — يسعدنا سماعك.", "Suggestions, issues, or feedback — we'd love to hear from you.", "Suggestions, problèmes ou remarques — écrivez-nous.")}</small>
          <a href="mailto:Madabeh777@gmail.com" data-no-translate>Madabeh777@gmail.com</a>
        </div>
        ${button(tr("نسخ البريد", "Copy email", "Copier l'e-mail"), "copy-email", "", "secondary small")}
      </div>
      <p class="copyright-line">© 2026 <span data-no-translate>Ahmed S. Abodooh</span> — ${tr("جميع الحقوق محفوظة", "All rights reserved", "Tous droits réservés")}</p>
      ${infoNote("الأسماء والأعمار مرجعية؛ القدرات والعقود والاعتزال والأحداث محاكاة وليست حقائق عن الأشخاص.")}
    </section>
    <section class="panel settings-panel danger-panel">
      <div class="panel-head">
        <h3>${tr("منطقة الخطر", "Danger zone", "Zone sensible")}</h3>
      </div>
      <p>${tr("تقدر تختار ناديًا جديدًا وتبدأ من الصفر، أو مسح كل البيانات المحلية نهائيًا (الحفظة النشطة والخانات والنسخ الاحتياطية). صدّر نسختك أولًا إن أردت الاحتفاظ بها خارجيًا.", "Start over with a new club, or wipe all local data for good (active save, slots and backups). Export first if you want to keep an external copy.", "Recommencer avec un nouveau club, ou effacer définitivement toutes les données locales (sauvegarde active, emplacements et copies). Exportez d'abord si besoin.")}</p>
      <div class="settings-actions">
        ${button(tr("إنشاء حفظة جديدة", "New career", "Nouvelle carrière"), "new-game", "", "secondary")}
        ${button(tr("مسح كل البيانات المحلية", "Wipe all local data", "Effacer toutes les données"), "wipe-data", "", "danger")}
      </div>
    </section>
  </div>`;
}
