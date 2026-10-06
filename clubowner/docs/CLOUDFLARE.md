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

هذه الطريقة تجعل أي تحديث في الكود يُنشر تلقائياً خلال ثوانٍ.

### الخطوات:
1. ارفع المشروع إلى حسابك على GitHub (كما هو موضح في القسم ٥ أدناه).
2. ادخل إلى لوحة تحكم [Cloudflare Dashboard](https://dash.cloudflare.com).
3. من القائمة الجانبية، اضغط على **Workers & Pages** ثم اختر **Create application**.
4. اختر تبويب **Pages** ثم اضغط على **Connect to Git**.
5. اختر مستودعك على GitHub (`club-owner`).
6. في صفحة إعدادات البناء (Build settings)، أدخل ما يلي:
   - **Framework preset**: `None` (أو `Vite`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `clubowner` ← **إلزامي في هذا المستودع** (الكود داخل مجلد فرعي؛ لو تركته فارغًا سيفشل البناء بخطأ "Could not detect a directory containing static files")

> ⚠️ **تنبيه مهم:** أنشئ المشروع من تبويب **Pages** وليس Workers. مشروعات Workers تستخدم `npx wrangler deploy` وهي طريقة لا تناسب هذا المشروع (ستتجاهل مجلد `functions/` الخاص بالمزامنة السحابية وستفشل في العثور على الملفات الثابتة).
7. اضغط **Save and Deploy**.

خلال دقيقة واحدة ستكون لعبتك حية على رابط مثل:
`https://club-owner.pages.dev` 🎉

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
