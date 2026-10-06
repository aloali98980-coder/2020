// iOS uses Safari's Share -> Add to Home Screen flow. No native app required.
export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

export function installHelp() {
  const installed = isStandalone();
  return `<span class="eyebrow">نسخة الويب على الآيفون</span><h2>${installed ? "اللعبة مفتوحة من الشاشة الرئيسية" : "ضيف اللعبة لشاشتك الرئيسية"}</h2>
    <ol class="install-steps"><li>افتح رابط اللعبة المستضاف مباشرة في <strong>Safari</strong>، مش داخل نافذة معاينة أو تطبيق محادثة.</li><li>اضغط <strong>مشاركة</strong> في Safari، ثم <strong>إضافة إلى الشاشة الرئيسية</strong>.</li><li>لو ظهر اختيار <strong>فتح كتطبيق ويب</strong> فعّله، ثم اضغط <strong>إضافة</strong>.</li><li>افتح أيقونة <strong>صاحب النادي</strong> وانتظر رسالة تجهيز اللعب دون اتصال أول مرة.</li></ol>
    <div class="info-note">العمل دون اتصال يحتاج نسخة الإنتاج على HTTPS وفتحها مرة بنجاح حتى يكتمل التنزيل. المتصفح قد يمسح الكاش أو بيانات الموقع؛ صدّر حفظتك دوريًا. الدخول الخاص لدى الاستضافة قد يحتاج اتصالًا لإعادة تسجيل الدخول.</div>
    <div class="info-note">الحفظ في Safari أو أيقونة الشاشة الرئيسية قد يكون منفصلًا حسب إصدار iOS. صدّر حفظتك قبل الإضافة، واستوردها داخل الأيقونة إذا لم تظهر تلقائيًا.</div>`;
}
