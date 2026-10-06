# دليل النشر النهائي — Club Owner (v0.23.0)
_Final Production Deployment & Hosting Guide_

---

## ١. نظرة عامة على بنية النشر (Architecture)
تم تصميم مشروع **Club Owner** ليعمل بنمطين مرنين للنشر:
1. **خادم إنتاجي متكامل (Full-Stack Standalone Server)**: خادم خفيف مستقل مبني بـ Node.js خالص (`server/index.mjs`) يخدم ملفات واجهة اللعبة (`dist/`) ويوفر في نفس الوقت نقاط الـ REST API للمزامنة السحابية والحسابات (`/api/auth/*` و `/api/cloud/*`).
2. **تطبيق ويب تقدمي ثابت (Static PWA)**: يمكن رفع مجلد `dist/` مباشرة على أي استضافة ثابتة (Vercel, Netlify, Cloudflare Pages, GitHub Pages) وتعمل اللعبة أوفلاين بنسبة 100%.

---

## ٢. خيارات النشر الجاهزة (Deployment Options)

### الخيار الأول: النشر عبر Docker / Docker Compose (الأسهل والأشمل)
الملفات `Dockerfile` و `docker-compose.yml` جاهزة في جذر المشروع.
للتشغيل على أي سيرفر أو VPS:
```bash
# بناء وتشغيل الحاوية في الخلفية
docker compose up -d --build
```
- المنفذ الافتراضي: `5173` (أو أي منفذ تحدده في `docker-compose.yml`).
- الحفظات السحابية وقاعدة البيانات تُحفظ داخل مجلد دائم (Volume): `clubowner-data`.

---

### الخيار الثاني: النشر السحابي المجاني (Render / Railway / Fly.io)
ملف `render.yaml` جاهز مسبقاً.
1. أنشئ مستودعاً جديداً على GitHub وارفع الملفات إليه (راجع القسم ٣ أدناه).
2. ادخل على [Render.com](https://render.com) واختر **New Web Service** واربط المستودع.
3. الإعدادات التلقائية:
   - **Environment**: Node
   - **Build Command**: `npm ci --ignore-scripts && npm run build`
   - **Start Command**: `node server/index.mjs`
   - **Port**: `10000` (أو القيمة التلقائية لبيئة Render).

---

### الخيار الثالث: النشر الثابت السريع (Vercel / Netlify)
الملفات `vercel.json` و `netlify.toml` جاهزة ومعدة بنظام SPA Rewrite.
- **Vercel**:
  - اربط مستودع GitHub بحسابك على Vercel وسيقوم بالبناء والنشر تلقائيًا عبر `npm run build` ومجلد الخرج `dist`.
- **Netlify**:
  - نفس الخطوات، ملف `netlify.toml` يوجه جميع المسارات إلى `index.html` مع تفعيل الـ Service Worker والأوفلاين.

---

### الخيار الرابع: التشغيل على سيرفر محلي أو VPS عبر PM2
```bash
# 1. تثبيت الاعتماديات وبناء النسخة الإنتاجية
npm ci --ignore-scripts
npm run build

# 2. التشغيل الدائم عبر PM2
npm install -g pm2
PORT=80 pm2 start server/index.mjs --name "club-owner"
pm2 save
pm2 startup
```

---

## ٣. خطوات رفع الكود إلى GitHub كمستودع حقيقي (Source Code)

بدلاً من رفع الكود كملف zip خام داخل Commit واحد، تم تجهيز مستودع Git محلي نظيف بكامل الملفات والشجرة البرمجية (`.git/`).
لرفع المشروع إلى حسابك على GitHub:

```bash
# 1. التوجه لمجلد المشروع
cd ClubOwner-v0.16.0

# 2. ربط المستودع برابط GitHub الخاص بك (استبدل الرابط برابط مستودعك)
git remote add origin https://github.com/aloali98980-coder/club-owner.git

# 3. دفع الكود بالكامل كملفات سورس حقيقية
git branch -M main
git push -u origin main --force
```

---

## ٤. محتويات حزم الإصدار النهائي المرفقة:
- **`ClubOwner-v0.22.0-src.zip`**: حزمة السورس كود الكاملة متضمنة ملفات الإعدادات والنشر والأنظمة السبعة.
- **`dist/`**: النسخة المبنية الجاهزة للتشغيل الفوري مع محرك الأوفلاين والأيقونات وقواعد البيانات المضغوطة.
- **`server/`**: محرك السحابة وحسابات الملاك المستقل.
