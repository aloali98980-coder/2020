# دليل النشر على Cloudflare — Club Owner (v0.23.0)
_Cloudflare Pages & Edge Functions Deployment Guide_

---

## ١. لماذا Cloudflare Pages هي الخيار المثالي؟
- **سرعة خارقة عالمياً**: يتم توزيع ملفات اللعبة على أكثر من 300 مركز بيانات حول العالم (CDN).
- **أوفلاين PWA كامل**: تم تضمين ملفات `_headers` و `_redirects` و `sw.js` لضمان عمل اللعبة وتثبيتها على الهواتف والكمبيوتر.
- **دعم دوال السحابة على Edge (`functions/api/`)**: يعمل نظام المزامنة السحابية والحسابات تلقائياً عبر Cloudflare Pages Functions بدون الحاجة لشراء أو استئجار سيرفر خارجي!
- **مجاني 100%**: نطاق مجاني `*.pages.dev` مع شهادة أمان SSL مجانية وتحديثات تلقائية مع كل Push على GitHub.

---

## ٢. طريقة النشر الأولى: الربط المباشر مع GitHub (الموصى بها) ⚡

> **ملاحظة مهمة عن الواجهة الجديدة (2025+):** لوحة Cloudflare الحالية تدمج
> النشر في مسار **Workers** موحّد. بعد اختيار المستودع **لن تظهر** الحقول
> القديمة (Framework preset / Build output directory) — بل شاشة إعداد فيها
> **Deploy command** و **Root directory**. المشروع مهيأ للعمل مع هذا المسار
> تمامًا عبر `wrangler.toml` (ملفات ثابتة من `dist/` + `worker/index.js`
> لتوجيه `/api/*` لنفس دالة المزامنة).

### الخطوات:
1. ادخل إلى لوحة تحكم [Cloudflare Dashboard](https://dash.cloudflare.com).
2. من القائمة الجانبية، اضغط **Workers & Pages** ثم **Create** (أو **Create application**).
3. اختر **Import a repository** (أو **Connect to Git** في الواجهات الأحدث) وسجّل الدخول بـ GitHub.
4. اختر المستودع — تأكد أن الفرع المختار يحتوي على الكود (اسأل مطورك أي فرع هو الأحدث).
5. في شاشة الإعداد **الجديدة (Workers)** املأ ما يلي:

| الحقل | القيمة |
| --- | --- |
| **Project name** | `club-owner` (سيحدد رابطك: `club-owner.<account>.workers.dev`) |
| **Branch** | الفرع الذي يحتوي على الكود |
| **Deploy command** | `npm install && npm run build && npx wrangler deploy` |
| **Root directory** (ضمن Advanced) | `clubowner` ← **إلزامي في هذا المستودع** (الكود داخل مجلد فرعي) |

6. اضغط **Save and Deploy** — خلال دقيقتين ستكون اللعبة حية، وكل Push جديد على الفرع يُنشر تلقائيًا.

### إصلاح مشروع فشل من قبل (بدون إنشاء مشروع جديد):
لو كان لديك مشروع يعطي خطأ مثل
`Could not detect a directory containing static files`:
1. افتح المشروع من **Workers & Pages**.
2. **Settings** → **Build** (أو **Builds**).
3. عدّل **Root directory** إلى `clubowner` و **Deploy command** إلى
   `npm install && npm run build && npx wrangler deploy`.
4. احفظ، ثم من تبويب **Deployments** أعد محاولة آخر نشر (**Retry**)
   — أو ادفع أي commit جديد وسينطلق النشر تلقائيًا.

### واجهة Pages الكلاسيكية (إن ظهرت لك):
إذا كانت واجهتك تعرض حقول **Framework preset** و **Build output directory**
فاستخدم: Preset = `None`، Build command = `npm run build`،
Output = `dist`، و **Root directory = `clubowner`** أيضًا —
ودالة المزامنة ستعمل من مجلد `functions/` كما هي.

---

## ٣. ميزة إضافية: تفعيل التخزين الدائم للسحابة (Cloudflare KV) 💾
لتخزين الحفظات السحابية وحسابات اللاعبين بشكل دائم وسريع على شبكة Cloudflare:
1. في لوحة Cloudflare، اذهب إلى **Workers & Pages** > **KV**.
2. اضغط **Create namespace** وسمّها: `clubowner_kv`.
3. اذهب إلى مشروعك في Pages > **Settings** > **Functions**.
4. في قسم **KV namespace bindings**، اضغط **Add binding**:
   - **Variable name**: `CLOUD_DB`
   - **KV namespace**: اختر `clubowner_kv`
5. اضغط **Save**. (الآن أصبحت السحابة تحفظ وتسترجع عالمياً في أجزاء من الثانية!).

> **في مسار Workers الجديد:** من صفحة الـWorker → **Settings** → **Bindings** →
> **Add** → **KV Namespace** → Variable name: `CLOUD_DB` واختر الـnamespace.
> (أو أضف `[[kv_namespaces]]` في `wrangler.toml` كما في التعليق الجاهز فيه).
> بدون هذا الربط تعمل المزامنة بذاكرة مؤقتة فقط (تُفقد عند إعادة النشر).

---

## ٤. طريقة النشر الثانية: السحب والإفلات المباشر (Drag & Drop) بدون Git 🚀

إذا كنت لا تريد استخدام Git وتريد رفع اللعبة الآن فوراً:
1. حمل مجلد `dist` الموجود في المشروع (أو من داخل الحزمة `clubowner-deploy-dist-0.23.zip` — فك ضغطها واسحب محتواها).
2. ادخل على **Workers & Pages** في Cloudflare.
3. اختر **Pages** > **Upload assets**.
4. حدد اسم المشروع (مثلاً: `clubowner`).
5. اسحب **محتوى** مجلد `dist` (ملف `index.html` وما حوله — وليس ملف ZIP) وأفلته في المربع المخصص، ثم اضغط **Deploy site**.
6. مبروك! الموقع يعمل فوراً وبأعلى سرعة ممكنة.

---

## ٥. طريقة النشر الثالثة: عبر سطر الأوامر (Wrangler CLI) 💻

إذا كنت تفضل استخدام الـ Terminal:
```bash
# 1. تثبيت الاعتماديات وبناء النسخة
npm ci --ignore-scripts
npm run build

# 2. النشر الفوري بضغطة زر
npx wrangler pages deploy dist --project-name club-owner
```

---

## ٦. الملفات المعدة خصيصاً لـ Cloudflare داخل المشروع:
- **`public/_redirects`**: يضمن عمل روابط وتوجيه صفحات الـ SPA وعودتها لـ `index.html` برمز 200.
- **`public/_headers`**: يضبط كاش ملفات الـ PWA و Service Worker لمنع أي أخطاء كاش على الآيفون والكمبيوتر.
- **`functions/api/[[catchall]].js`**: دالة Edge متكاملة لمعالجة تسجيل الدخول والمزامنة السحابية على سيرفرات Cloudflare دون الحاجة لأي خادم Node.js خارجي.
- **`wrangler.toml`**: ملف إعدادات CLI الجاهز لـ Cloudflare Pages.
