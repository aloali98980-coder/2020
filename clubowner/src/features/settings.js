import { getLanguage } from "../i18n/index.js";
import { DIFFICULTIES } from "../models/difficulty.js";
import { heading, button, badge, infoNote } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { date, num } from "../ui/format.js";
import { getSession, isAuthenticated } from "../services/auth.js";

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
          <strong>التوقف عند القرارات الإلزامية</strong>
          <small>عروض انتقال، رعايات، وتجديد عقود</small>
        </div>
        ${badge("مفعّل دائمًا", "green")}
      </div>
      <p class="fine-print">اليوم والأسبوع يتم تمريرهما يومًا بيوم. النظام يحتفظ بالأيام المتبقية عند التوقف.</p>
    </section>
    <section class="panel settings-panel">
      <div class="panel-head">
        <h3>${icon("info")} عن هذه النسخة</h3>
        ${badge("ALPHA 0.22")}
      </div>
      <p>نسخة ويب أولية قابلة للعب. الأنظمة منفصلة: محرك الوقت، التعاقدات، المالية، الرعايات، المنشآت، الحفظ، والشاشات.</p>
      <div class="scope-list">
        <span>${icon("check", 16)} مفاوضات وانتقالات وعقود</span>
        <span>${icon("check", 16)} دفعات ورعايات وحصرية</span>
        <span>${icon("check", 16)} مشروعات وآثار تشغيلية</span>
        <span>${icon("check", 16)} عالم موسّع ومزامنة سحابية</span>
      </div>
      ${infoNote("الأسماء والأعمار مرجعية؛ القدرات والعقود والاعتزال والأحداث محاكاة وليست حقائق عن الأشخاص.")}
    </section>
    <section class="panel settings-panel danger-panel">
      <div class="panel-head">
        <h3>بداية جديدة</h3>
      </div>
      <p>تقدر تختار ناديًا جديدًا وتبدأ من الصفر. صدّر حفظتك الحالية الأول، لأن النسخة تدعم حفظة نشطة واحدة.</p>
      ${button("إنشاء حفظة جديدة", "new-game", "", "danger")}
    </section>
  </div>`;
}
