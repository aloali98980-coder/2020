From 0c4797e31cb161d304e00582d480cbce4ade1bd9 Mon Sep 17 00:00:00 2001
From: aloali98980-coder <317880077+aloali98980-coder@users.noreply.github.com>
Date: Thu, 8 Oct 2026 08:49:33 +0000
Subject: [PATCH] =?UTF-8?q?0.26=20=C2=AB=D8=AA=D8=AD=D8=AF=D9=8A=D8=AB=20?=
 =?UTF-8?q?=D8=A7=D9=84=D8=AF=D8=B1=D8=A7=D9=85=D8=A7=C2=BB=20(=D9=A6):=20?=
 =?UTF-8?q?=D9=84=D8=A7=D8=A6=D8=AD=D8=A9=20=D8=A7=D9=84=D8=AC=D9=85=D8=B9?=
 =?UTF-8?q?=D9=8A=D8=A9=20=D8=A7=D9=84=D8=B9=D9=85=D9=88=D9=85=D9=8A=D8=A9?=
 =?UTF-8?q?=20=E2=80=94=20=D8=AA=D8=AA=D8=A8=D8=B9=20=D8=AD=D9=8A=D8=8C=20?=
 =?UTF-8?q?=D8=A7=D8=AC=D8=AA=D9=85=D8=A7=D8=B9=D8=A7=D9=86=D8=8C=20=D8=B3?=
 =?UTF-8?q?=D9=84=D9=85=20=D8=B9=D9=88=D8=A7=D9=82=D8=A8=D8=8C=20=D9=88?=
 =?UTF-8?q?=D8=A7=D9=84=D9=85=D8=A7=D9=84=D9=83=20=D9=84=D8=A7=20=D9=8A?=
 =?UTF-8?q?=D9=8F=D9=82=D8=A7=D9=84?=
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit

Co-authored-by: arena-agent <297053741+arena-agent@users.noreply.github.com>
---
 clubowner/README.md                        |   2 +
 clubowner/docs/FEATURES-0.26.md            |  81 +++
 clubowner/index.html                       |   2 +-
 clubowner/package.json                     |   2 +-
 clubowner/src/components/shell.js          |   3 +-
 clubowner/src/core/game.js                 |   6 +-
 clubowner/src/core/migrations.js           |  35 +-
 clubowner/src/core/validation.js           | 105 ++++
 clubowner/src/data/boardMandates.js        | 269 +++++++++
 clubowner/src/data/boardTexts.js           | 510 ++++++++++++++++
 clubowner/src/data/version.js              |   2 +-
 clubowner/src/features/board.js            | 191 ++++++
 clubowner/src/features/dashboard.js        |   3 +-
 clubowner/src/features/finance.js          |   3 +
 clubowner/src/features/inbox.js            |  12 +-
 clubowner/src/features/onboarding.js       |   9 +
 clubowner/src/i18n/index.js                |   3 +
 clubowner/src/i18n/phrases-board.js        |  18 +
 clubowner/src/main.js                      |   8 +
 clubowner/src/services/boardMandate.js     | 465 +++++++++++++++
 clubowner/src/services/pyramid.js          |   5 +
 clubowner/src/services/season.js           |   5 +
 clubowner/src/services/time.js             |   2 +
 clubowner/src/services/transfers.js        |   3 +
 clubowner/src/styles/features.css          |  81 +++
 clubowner/src/ui/format.js                 |   1 +
 clubowner/tests/asia-v011.test.js          |   3 +-
 clubowner/tests/board-mandate.test.js      | 662 +++++++++++++++++++++
 clubowner/tests/capacity-v020.test.js      |   4 +-
 clubowner/tests/careers.test.js            |   3 +-
 clubowner/tests/concacaf-v012.test.js      |   3 +-
 clubowner/tests/domestic-v013.test.js      |   5 +-
 clubowner/tests/economy-v015.test.js       |   5 +-
 clubowner/tests/economy-v016.test.js       |   5 +-
 clubowner/tests/europe.test.js             |   3 +-
 clubowner/tests/expansion.test.js          |   3 +-
 clubowner/tests/legends.test.js            |   8 +-
 clubowner/tests/match-consequences.test.js |   3 +-
 clubowner/tests/pyramid-v08.test.js        |   3 +-
 clubowner/tests/review-v014.test.js        |   5 +-
 clubowner/tests/season-stats.test.js       |   3 +-
 clubowner/tests/v06.test.js                |   3 +-
 clubowner/tests/world.test.js              |   5 +-
 package.json                               |   2 +-
 44 files changed, 2519 insertions(+), 35 deletions(-)
 create mode 100644 clubowner/docs/FEATURES-0.26.md
 create mode 100644 clubowner/src/data/boardMandates.js
 create mode 100644 clubowner/src/data/boardTexts.js
 create mode 100644 clubowner/src/features/board.js
 create mode 100644 clubowner/src/i18n/phrases-board.js
 create mode 100644 clubowner/src/services/boardMandate.js
 create mode 100644 clubowner/tests/board-mandate.test.js

diff --git a/clubowner/README.md b/clubowner/README.md
index 5803740..b37b07b 100644
--- a/clubowner/README.md
+++ b/clubowner/README.md
@@ -1,3 +1,5 @@
+> **مرحلة التطوير 0.26 — «تحديث الدراما» (٦):** لائحة الجمعية العمومية — لائحة مطالب بثلاثة محاور (رياضي/مالي/تطويري) تُصدر مع بداية كل موسم بحسب حجم النادي وطموحه، بشاشة تتبع حي لكل بند؛ مراجعة منتصف تلقائية (رسالة ثقة أو إنذار أصفر بمهلة)، وتصويت ثقة نهائي بمكافآت حقيقية (دعم مالي وميزانية تعاقدات وحب جماهير) أو سلم عواقب متدرج محدود بثلاث درجات (خصم مراتب، تجميد انتقالات، انسحاب راعٍ، احتجاج جماهيري) — و**المالك لا يُقال أبدًا**، فكل العواقب مالية وجماهيرية وإدارية. `SAVE_VERSION` 21 بترحيل تلقائي. [التفاصيل](docs/FEATURES-0.26.md).
+
 > **مرحلة التطوير 0.25 — «تحديث الدراما»:** نظام الأحداث الموسّع: ٧٠ حدث قرار بخيارات وعواقب مختلفة حقيقية (لاعبون، غرفة الملابس، جماهير، مالي وإداري، صحافة، وموسمية) + ١١٥ خبر نكهة قصير لا يوقف الزمن، كلها مربوطة بالأنظمة القائمة (إحصائيات الموسم، عواقب المباريات والإصابات، نتائج الديربي، الجدول والجولات الأخيرة) وبثلاث لغات — دون حقول حالة جديدة ودون تغيير آلية «حدث واحد مفتوح». [التفاصيل](docs/FEATURES-0.25.md).

 > **مرحلة التطوير 0.24 — «Empire FC»:** هوية اللعبة الجديدة بالاسم الإنجليزي Empire FC (ابنِ إمبراطوريتك)، شاشة بداية نظيفة تتكلم لغة اللاعبين بدل لغة التطوير، وصفحات المصادر والتراخيص بالهوية الملكية الجديدة. [التفاصيل](docs/FEATURES-0.24.md).
diff --git a/clubowner/docs/FEATURES-0.26.md b/clubowner/docs/FEATURES-0.26.md
new file mode 100644
index 0000000..a26a90d
--- /dev/null
+++ b/clubowner/docs/FEATURES-0.26.md
@@ -0,0 +1,81 @@
+# 0.26 — المرحلة السادسة من «تحديث الدراما»: لائحة الجمعية العمومية
+
+> إصدار المساءلة الإدارية. الجمعية العمومية (أو المستثمرون) تُصدر مع بداية كل موسم
+> **لائحة مطالب** بثلاثة محاور على الأقل، تُقاس حيًا طوال الموسم، مع **مراجعة منتصف**
+> و**تصويت ثقة نهائي** وعواقب متدرجة. `SAVE_VERSION` صارت **21** (ترحيل تلقائي من 20)،
+> ورقم اللعبة **0.26.0**.
+>
+> **قيد هوية اللعبة — مكتوب في الكود لا في النية:** المالك لا يُقال أبدًا. لا يوجد في
+> `services/boardMandate.js` أي مسار يحذف النادي أو ينهي المسيرة، وسقف سلم العواقب ثابت
+> عند الدرجة الثالثة، ولائحة ما بعد الإخفاق تُبنى على **إعادة البناء** لا على تصعيد عقابي.
+
+## ١) لائحة الموسم — من تُصدر وماذا تطلب
+
+تُبنى اللائحة من **حجم النادي** (مشتق من السمعة: صغير/متوسط/كبير/عملاق) و**طموحه**
+(بقاء/استقرار/منافسة/قمة/إعادة بناء)، على ثلاثة محاور لا يسقط أحدها:
+
+| المحور | البنود الممكنة |
+|---|---|
+| رياضي | مركز مستهدف في الدوري · دور مستهدف في الكأس (عدد مواجهات إقصائية) · تجاوز جولة قارية للمشارك، أو مركز مؤهل قاريًا لغير المشارك |
+| مالي | سقف عجز لصافي الموسم · حد أدنى للسيولة في نهاية الموسم · **بيع لاعب بمقابل محدد** (يُطلب أحيانًا) |
+| تطويري | دقائق لعب للناشئين · إتمام مشروع منشأة · **التعاقد مع لاعب شاب** (حين يقل الناشئون عن ثلاثة) |
+
+- **العدالة بحسب الحجم:** النادي العملاق مطالب بمركز أعلى ودقائق ناشئين أكثر من الصغير
+  (اختبار مباشر على نفس الطموح).
+- **لا بند بلا مقياس:** بند الكأس لا يظهر في الوضع التجريبي (لا كؤوس فيه أصلًا)، وبند
+  القارة لا يظهر لمن لا يشارك في مسابقة قارية.
+- **التوليد حتمي:** نفس النادي ونفس الموسم = نفس اللائحة، والبنود «أحيانًا» قرارها ثابت
+  مشتق من (النادي، الموسم) لا من عشوائية متغيرة.
+
+## ٢) التتبع الحي
+
+الشاشة الجديدة **«الجمعية العمومية»** في القائمة الرئيسية (وبطاقة مختصرة على مكتب المالك)
+تعرض كل بند مع شريط تقدم وقيمته الحالية وهدفه وحالته (محقق / قيد التنفيذ / متأخر)، ومعه
+تاريخ المراجعة والتصويت والثقة وسجل المواسم السابقة. القياس كله مشتق من الحفظة نفسها:
+
+- **المركز** من جدول الدوري الفعلي، **الكأس والقارة** من المواجهات الإقصائية المحسومة لصالحك.
+- **العجز والسيولة والبيع** من قيود الدفاتر الحقيقية (بلا حقول موازية).
+- **دقائق الناشئين** من عدّادات الموسم، **إتمام المشروع** من ارتفاع مستوى المنشأة عن خط
+  الأساس وقت إصدار اللائحة، **التعاقد الشاب** من قائمة النادي مقارنة بخط الأساس نفسه.
+
+## ٣) الاجتماعان
+
+- **منتصف الموسم** (تاريخه = منتصف مبارياتك فعليًا لا منتصف السنة): التزام جيد ⇒ **رسالة
+  ثقة** ودفعة جماهيرية صغيرة. تأخر ⇒ **إنذار أصفر رسمي بمهلة** حتى التصويت النهائي.
+  الرسالتان `required: false` — لا توقفان الزمن، فالإنذار خبر لا قرار.
+- **نهاية الموسم (تصويت الثقة):** التنفيذ الكامل (كل البنود الحاسمة + ٨٥٪ من الوزن الموزون)
+  ⇒ **مكافآت حقيقية:** دعم مالي من المستثمرين يُقيَّد في الدفاتر، وزيادة ميزانية التعاقدات
+  للموسم القادم تصل فعلًا عند إصدار اللائحة التالية، ودفعة في حب الجماهير.
+  الإخفاق الجزئي ⇒ **تحذير نهائي** مكتوب بلا عقوبات تنفيذية. الإخفاق الكبير ⇒ سلم العواقب.
+
+## ٤) سلم العواقب (متدرج، ومحدود بثلاث درجات)
+
+| الدرجة | المرتبات | التجميد | الرعاة | الجماهير |
+|---|---|---|---|---|
+| الأولى | −١٠٪ | ٦٠ يومًا | — | احتجاج −٦ |
+| الثانية | −١٥٪ | ٩٠ يومًا | انسحاب راعٍ (ودفعاته المتبقية تسقط) | احتجاج −١٠ |
+| الثالثة (السقف) | −٢٠٪ | ١٢٠ يومًا | انسحاب راعٍ | احتجاج −١٢ |
+
+- **التجميد حقيقي:** يمنع فتح مفاوضات شراء أو توقيع عقود جديدة، **ولا يمنع بيع لاعبيك** —
+  البيع أداة النادي للخروج من الأزمة، ويُسمح به صراحة أثناء التجميد.
+- **لا دوامة موت:** ميزانية المرتبات لا تنزل عن حد أدنى، والثقة لا تنزل تحت الصفر،
+  والدرجة الرابعة غير موجودة في الكود أصلًا؛ خمسة مواسم إخفاق متتالية تُنتهي بمالك كما هو
+  ونادٍ في جدوله ولائحة جديدة خفيفة (إعادة بناء) — وهذا مُختبَر.
+
+## ٥) الربط بالقائم
+
+- **البريد:** رسائل `category: board` بأربعة أنواع (إصدار لائحة، مراجعة منتصف، إنذار، تصويت
+  نهائي) مع تبويب قسم جديد في صندوق البريد وزر «راجع اللائحة» يفتح الشاشة مباشرة.
+- **الأونبوردنج:** خطوة جديدة «اطّلع على لائحة الجمعية العمومية» في «خطواتك الأولى»،
+  تُعلَّم تلقائيًا عند أول فتح للشاشة.
+- **الرعاة والتمويل:** الإخفاق يسحب عقد رعاية ويلغي دفعاته المتبقية من جدول الالتزامات،
+  والمكافأة تُقيَّد في الدفاتر بفئة جديدة (`board-support`) تظهر في كشف الحساب.
+- **المنشآت والناشئون:** بنود التطوير تقرأ مستوى المنشآت وقائمة الناشئين وعدّادات الدقائق.
+
+## ٦) التحقق
+
+- `tests/board-mandate.test.js` — **25 اختبارًا**: التوليد حسب الحجم والطموح، البنود
+  المشروطة، حتمية التوليد، تتبع الأنواع العشرة، الاجتماعان، الدرجات الثلاث للسلم وسقفه،
+  التجميد (يمنع الشراء لا البيع)، الترحيل 20→21، رفض الحفظات المعدّلة يدويًا، وسلامة
+  ثلاث لغات لكل نص في السجل (86 مفتاحًا).
+- المجموعة الكاملة: **316/316** خضراء، والبناء نظيف، وفحص التغطية `untranslated (en): 0 · (fr): 0`.
diff --git a/clubowner/index.html b/clubowner/index.html
index 55d9cc6..2380bab 100644
--- a/clubowner/index.html
+++ b/clubowner/index.html
@@ -7,7 +7,7 @@
       content="width=device-width, initial-scale=1.0, viewport-fit=cover"
     />
     <meta name="theme-color" content="#0a1322" />
-    <meta name="club-owner-app" content="0.25.0" />
+    <meta name="club-owner-app" content="0.26.0" />
     <meta name="robots" content="noindex, nofollow" />
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta
diff --git a/clubowner/package.json b/clubowner/package.json
index 3b68791..700bb9d 100644
--- a/clubowner/package.json
+++ b/clubowner/package.json
@@ -1,6 +1,6 @@
 {
   "name": "club-owner",
-  "version": "0.25.0",
+  "version": "0.26.0",
   "private": true,
   "type": "module",
   "scripts": {
diff --git a/clubowner/src/components/shell.js b/clubowner/src/components/shell.js
index 11a6876..38fc4b8 100644
--- a/clubowner/src/components/shell.js
+++ b/clubowner/src/components/shell.js
@@ -9,6 +9,7 @@ import { APP_VERSION } from "../data/version.js";
 const LINKS = [
   { id: "dashboard", name: "مكتب المالك", icon: "home" },
   { id: "inbox", name: "البريد الوارد", icon: "inbox" },
+  { id: "board", name: "الجمعية العمومية", icon: "crown" },
   { id: "squad", name: "الفريق الأول", icon: "squad" },
   { id: "transfers", name: "سوق الانتقالات", icon: "transfer" },
   { id: "database", name: "قاعدة اللاعبين", icon: "search" },
@@ -27,7 +28,7 @@ const byId = (id) => LINKS.find((l) => l.id === id);

 // 0.22: القائمة تُعرض في مجموعات منطقية بدل قائمة واحدة طويلة.
 export const NAV_GROUPS = [
-  { caption: "نظرة عامة", items: ["dashboard", "inbox"] },
+  { caption: "نظرة عامة", items: ["dashboard", "inbox", "board"] },
   {
     caption: "كرة القدم",
     items: [
diff --git a/clubowner/src/core/game.js b/clubowner/src/core/game.js
index 95acb32..61a1e96 100644
--- a/clubowner/src/core/game.js
+++ b/clubowner/src/core/game.js
@@ -12,7 +12,8 @@ import { CLUBS, FACILITIES, PACK, makePlayers } from "../data/catalog.js";
 import { fixtures } from "../services/matches.js";
 import { message } from "../services/inbox.js";
 import { signSponsor } from "../services/sponsors.js";
-export const SAVE_VERSION = 20;
+import { initBoard, startSeasonMandate } from "../services/boardMandate.js";
+export const SAVE_VERSION = 21;
 export function createGame({
   clubId = "ahly",
   owner = "مالك النادي",
@@ -162,5 +163,8 @@ export function createGame({
       done: false,
     },
   );
+  // 0.26: الجمعية العمومية تصدر لائحة الموسم الأول بعد اكتمال كل الأنظمة المشتقة منها.
+  initBoard(s);
+  startSeasonMandate(s);
   return s;
 }
diff --git a/clubowner/src/core/migrations.js b/clubowner/src/core/migrations.js
index 6335079..66804f8 100644
--- a/clubowner/src/core/migrations.js
+++ b/clubowner/src/core/migrations.js
@@ -11,6 +11,7 @@ import {
   STAFF_POOL_MAX_AGE_DAYS,
 } from "../services/careers.js";
 import { initSeasonStats } from "../services/seasonStats.js";
+import { boardTextAr } from "../data/boardTexts.js";
 function migrateToFive(input) {
   if (input?.version === 4) {
     const s = structuredClone(input);
@@ -345,11 +346,41 @@ function migrateToTwenty(input) {
   return s;
 }

+// 0.26 (save v21): لائحة الجمعية العمومية — حالة المجلس وثقته وسجل المواسم.
+// الحفظة الأقدم تبدأ بثقة محايدة وبلا لائحة، وتُصدر لائحتها مع أول موسم جديد.
+function migrateToTwentyOne(input) {
+  if (!input || input.version !== 20) return input;
+  const old = migrateToTwenty(input);
+  if (old?.version !== 20) return old;
+  const s = structuredClone(old);
+  s.version = 21;
+  s.board ??= {
+    schema: 1,
+    confidence: 60,
+    failureStreak: 0,
+    successStreak: 0,
+    freezeUntil: null,
+    wageFactor: 1,
+    pendingBoost: 0,
+    nextRebuild: false,
+    mandate: null,
+    history: [],
+    meetings: [],
+  };
+  s.migrationNote =
+    (s.migrationNote || "") +
+    " " + boardTextAr("boardMigrationNote") + ".";
+  return s;
+}
+
 export function migrateSave(input) {
-  if (!input || input.version === 20) return input;
+  if (!input || input.version === 21) return input;
+  // حفظة 0.25 (النسخة 20) حديثة بالفعل: تُرقّى إلى 21 مباشرة بلا إعادة تشغيل سلسلة أقدم.
+  if (input.version === 20) return migrateToTwentyOne(input);
   const v17 = migrateToSeventeen(input);
   const v18 = v17?.version === 17 ? migrateToEighteen(v17) : v17;
   if (v18?.version !== 18) return v18;
   const v19 = migrateToNineteen(v18);
-  return migrateToTwenty(v19);
+  const v20 = migrateToTwenty(v19);
+  return migrateToTwentyOne(v20);
 }
diff --git a/clubowner/src/core/validation.js b/clubowner/src/core/validation.js
index 6f1e68d..4504072 100644
--- a/clubowner/src/core/validation.js
+++ b/clubowner/src/core/validation.js
@@ -7,6 +7,9 @@ import { EVENT_CATALOG } from "../data/eventCatalog.js";
 import { CLUBS, FACILITIES, ASSETS } from "../data/catalog.js";
 import { resolveSponsor } from "../services/sponsors.js";
 import { SAVE_VERSION } from "./game.js";
+import { AMBITIONS, AXES, CLUB_SIZES, ITEM_KINDS, MANDATE_SCHEMA as BOARD_SCHEMA } from "../data/boardMandates.js";
+import { MAX_LADDER_TIER } from "../services/boardMandate.js";
+import { boardTextAr } from "../data/boardTexts.js";
 import { isoDate } from "./isoDate.js";

 // A save is untrusted input. Validate structure and relationships before replacing it.
@@ -487,8 +490,110 @@ export function validateSave(s) {
     ),
     "بيانات القدرات أو مصادر الميلاد غير سليمة.",
   );
+  validateBoard(s);
   validateExpansion(s);
   validateTalent(s);
   validateLegends(s);
   return s;
 }
+
+// 0.26: لائحة الجمعية العمومية. الحقول كلها مشتقة أو مسجَّلة، والقيم محدودة
+// بسقف سلم العواقب — فلا يمكن لحفظة معدَّلة يدويًا أن تحمل «درجة رابعة» أو ثقة سالبة.
+function validateBoard(s) {
+  const b = s.board;
+  check(
+    b &&
+      typeof b === "object" &&
+      b.schema === BOARD_SCHEMA &&
+      Number.isFinite(b.confidence) &&
+      b.confidence >= 0 &&
+      b.confidence <= 100,
+    boardTextAr("boardInvalidState"),
+  );
+  check(
+    amount(b.failureStreak) &&
+      amount(b.successStreak) &&
+      (!b.freezeUntil || isoDate(b.freezeUntil)) &&
+      Number.isFinite(b.wageFactor) &&
+      b.wageFactor > 0 &&
+      b.wageFactor <= 4 &&
+      typeof b.nextRebuild === "boolean" &&
+      Number.isFinite(b.pendingBoost) &&
+      b.pendingBoost >= 0 &&
+      b.pendingBoost <= 1,
+    boardTextAr("boardInvalidMetrics"),
+  );
+  const validItem = (it) =>
+    id(it.id) &&
+    ITEM_KINDS[it.kind] !== undefined &&
+    AXES.includes(ITEM_KINDS[it.kind].axis) &&
+    it.axis === ITEM_KINDS[it.kind].axis &&
+    typeof it.critical === "boolean" &&
+    amount(it.target) &&
+    it.target > 0;
+  const validReview = (r) =>
+    !r ||
+    (isoDate(r.date) &&
+      typeof r.good === "boolean" &&
+      amount(r.done) &&
+      amount(r.total));
+  const m = b.mandate;
+  check(
+    !m ||
+      (id(m.id) &&
+        amount(m.season) &&
+        isoDate(m.issuedAt) &&
+        isoDate(m.startDate) &&
+        isoDate(m.midDate) &&
+        isoDate(m.endDate) &&
+        m.startDate <= m.midDate &&
+        m.midDate <= m.endDate &&
+        CLUB_SIZES[m.size] !== undefined &&
+        AMBITIONS[m.ambition] !== undefined &&
+        typeof m.rebuild === "boolean" &&
+        Array.isArray(m.items) &&
+        m.items.length >= 3 &&
+        m.items.length <= 12 &&
+        m.items.every(validItem) &&
+        new Set(m.items.map((it) => it.id)).size === m.items.length &&
+        m.baseline &&
+        typeof m.baseline.facilityLevels === "object" &&
+        Array.isArray(m.baseline.youthIds) &&
+        amount(m.baseline.squadSize) &&
+        m.review &&
+        validReview(m.review.mid) &&
+        validReview(m.review.end)),
+    boardTextAr("boardInvalidMandate"),
+  );
+  check(
+    Array.isArray(b.history) &&
+      b.history.length <= 40 &&
+      b.history.every(
+        (h) =>
+          amount(h.season) &&
+          isoDate(h.date) &&
+          ["passed", "partial", "failed"].includes(h.status) &&
+          amount(h.done) &&
+          amount(h.total) &&
+          amount(h.tier) &&
+          h.tier <= MAX_LADDER_TIER &&
+          Array.isArray(h.effects),
+      ),
+    boardTextAr("boardInvalidHistory"),
+  );
+  check(
+    Array.isArray(b.meetings) &&
+      b.meetings.length <= 200 &&
+      b.meetings.every(
+        (x) =>
+          id(x.id) &&
+          ["mid", "end"].includes(x.kind) &&
+          amount(x.season) &&
+          isoDate(x.date) &&
+          ["trust", "warning", "passed", "partial", "failed"].includes(x.status) &&
+          amount(x.done) &&
+          amount(x.total),
+      ),
+    boardTextAr("boardInvalidMeetings"),
+  );
+}
diff --git a/clubowner/src/data/boardMandates.js b/clubowner/src/data/boardMandates.js
new file mode 100644
index 0000000..e429fca
--- /dev/null
+++ b/clubowner/src/data/boardMandates.js
@@ -0,0 +1,269 @@
+// لائحة الجمعية العمومية 0.26 — القواعد والبيانات المولِّدة للائحة.
+//
+// التصميم: اللائحة تُبنى من ثلاثة محاور إلزامية (رياضي، مالي، تطويري)، وعدد البنود
+// وحجم الأهداف يتبعان «حجم النادي» و«طموحه» — فلا يطلب من نادٍ صغير ما يُطلب من عملاق،
+// ولا تُطلب بطولة قارية من نادٍ لا يشارك في مسابقة قارية أصلًا.
+//
+// المولّد دالة نقية: تأخذ الحفظة وتعيد كائن اللائحة بلا أي أثر جانبي، ولا تستهلك
+// مولّد الأرقام العشوائي للعبة (s.seed) حتى تبقى النتيجة قابلة للتكرار في الاختبارات.
+import { addDays, daysBetween, clamp } from "../core/utils.js";
+
+export const MANDATE_SCHEMA = 1;
+
+// ── حجم النادي: من السمعة (تُشتق أصلًا من قوة القائمة والدرجة والملعب) ─────────
+export const CLUB_SIZES = {
+  small: {
+    key: "small",
+    textKey: "boardSizeSmall",
+    minRep: 0,
+    youthMinutes: 600,
+    liquidityFactor: 0.12,
+    deficitFactor: 0.2,
+    cupTies: 1,
+  },
+  medium: {
+    key: "medium",
+    textKey: "boardSizeMedium",
+    minRep: 56,
+    youthMinutes: 900,
+    liquidityFactor: 0.15,
+    deficitFactor: 0.25,
+    cupTies: 1,
+  },
+  large: {
+    key: "large",
+    textKey: "boardSizeLarge",
+    minRep: 70,
+    youthMinutes: 1200,
+    liquidityFactor: 0.18,
+    deficitFactor: 0.28,
+    cupTies: 2,
+  },
+  giant: {
+    key: "giant",
+    textKey: "boardSizeGiant",
+    minRep: 82,
+    youthMinutes: 1500,
+    liquidityFactor: 0.2,
+    deficitFactor: 0.3,
+    cupTies: 3,
+  },
+};
+export const SIZE_ORDER = ["small", "medium", "large", "giant"];
+export const sizeOf = (rep) => {
+  const value = Number.isFinite(rep) ? rep : 60;
+  let out = "small";
+  for (const key of SIZE_ORDER) if (value >= CLUB_SIZES[key].minRep) out = key;
+  return out;
+};
+
+// ── الطموح: يرفع أو يخفض مركز الدوري المستهدف ويضيف بنودًا رياضية/مالية ────────
+export const AMBITIONS = {
+  survival: { key: "survival", textKey: "boardAmbitionSurvival", rankDelta: 3, bold: 0.8 },
+  stable: { key: "stable", textKey: "boardAmbitionStable", rankDelta: 0, bold: 1 },
+  ambitious: { key: "ambitious", textKey: "boardAmbitionAmbitious", rankDelta: -2, bold: 1.2 },
+  elite: { key: "elite", textKey: "boardAmbitionElite", rankDelta: -3, bold: 1.4 },
+  rebuild: { key: "rebuild", textKey: "boardAmbitionRebuild", rankDelta: 4, bold: 0.7 },
+};
+export const AMBITION_ORDER = ["survival", "stable", "ambitious", "elite"];
+// بعد موسم مُخفِق تنزل اللائحة القادمة درجة: إعادة بناء لا عقاب متصاعد.
+export const stepDown = (ambition) => {
+  if (ambition === "rebuild") return "rebuild";
+  const i = AMBITION_ORDER.indexOf(ambition);
+  if (i <= 0) return "rebuild";
+  return AMBITION_ORDER[i - 1];
+};
+// أساس الطموح من الحجم؛ والدرجة الأعلى تحتاج ناديًا أكبر حتى تكون قابلة للتحقيق.
+export const baseAmbition = (size) =>
+  size === "giant" ? "elite" : size === "large" ? "ambitious" : size === "medium" ? "stable" : "survival";
+
+// ── أنواع البنود: كل نوع له محور وطريقة قياس ووحدة ونص ───────────────────────
+export const ITEM_KINDS = {
+  "league-rank": { axis: "sporting", critical: true, unit: "rank", textKey: "itemLeagueRank" },
+  "cup-ties": { axis: "sporting", critical: true, unit: "ties", textKey: "itemCupTies" },
+  "continental-stage": { axis: "sporting", critical: false, unit: "ties", textKey: "itemContinentalStage" },
+  "continental-qualify": { axis: "sporting", critical: false, unit: "rank", textKey: "itemContinentalQualify" },
+  "deficit-cap": { axis: "financial", critical: true, unit: "money", textKey: "itemDeficitCap" },
+  "min-liquidity": { axis: "financial", critical: true, unit: "money", textKey: "itemMinLiquidity" },
+  "player-sale": { axis: "financial", critical: false, unit: "money", textKey: "itemPlayerSale" },
+  "youth-minutes": { axis: "development", critical: true, unit: "minutes", textKey: "itemYouthMinutes" },
+  "facility-project": { axis: "development", critical: false, unit: "count", textKey: "itemFacilityProject" },
+  "young-signing": { axis: "development", critical: false, unit: "age", textKey: "itemYoungSigning" },
+};
+export const AXES = ["sporting", "financial", "development"];
+export const AXIS_TEXT_KEYS = {
+  sporting: "axisSporting",
+  financial: "axisFinancial",
+  development: "axisDevelopment",
+};
+
+// ── اكتشاف المسابقات في الحفظة (الوضع الموسّع فقط) ───────────────────────────
+export const isDomesticCup = (c) => String(c?.id || "").startsWith("cup-");
+export const isSuperCup = (c) =>
+  /^super-/.test(String(c?.id || "")) || String(c?.id || "").startsWith("recopa-");
+export const isContinentalCup = (c) => !isDomesticCup(c) && !isSuperCup(c);
+export const enteredCup = (s, cup) =>
+  Boolean(
+    cup &&
+      (cup.entrants?.includes(s.clubId) ||
+        cup.imports?.includes(s.clubId) ||
+        cup.qualification?.some((q) => q.clubId === s.clubId)),
+  );
+
+// بذرة صغيرة نقية (بلا لمس s.seed): نفس الموسم + نفس النادي = نفس القرار دائمًا.
+const hash = (text) => {
+  let h = 2166136261;
+  for (let i = 0; i < text.length; i++) {
+    h ^= text.charCodeAt(i);
+    h = Math.imul(h, 16777619);
+  }
+  return h >>> 0;
+};
+export const chance = (salt, pct) => hash(salt) % 100 < pct;
+
+// مباريات النادي هذا الموسم (الدوري) من جدول الحفظة نفسه.
+export function ownLeagueFixtures(s) {
+  const list = (s.fixtures || []).filter(
+    (f) => f.home === s.clubId || f.away === s.clubId,
+  );
+  return list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
+}
+// تاريخ مراجعة المنتصف: منتصف مباريات الموسم فعليًا لا منتصف السنة تقويميًا.
+export function midSeasonDate(s, startDate, endDate) {
+  const own = ownLeagueFixtures(s);
+  if (own.length >= 3) return own[Math.floor(own.length / 2)].date;
+  const span = Math.max(1, daysBetween(startDate, endDate));
+  return addDays(startDate, Math.round(span / 2));
+}
+
+const youthOf = (s) =>
+  s.players.filter(
+    (p) => p.clubId === s.clubId && p.status !== "retired" && p.age <= 21,
+  );
+
+// ── المولّد ──────────────────────────────────────────────────────────────────
+export function buildMandate(s, { seasonNumber, startDate, endDate, ambition, rebuild = false }) {
+  const sizeKey = sizeOf(s.reputation);
+  const size = CLUB_SIZES[sizeKey];
+  const ambitionKey = ambition || baseAmbition(sizeKey);
+  const mood = AMBITIONS[ambitionKey] || AMBITIONS.stable;
+  const tableSize = Math.max(4, s.table?.length || 8);
+  const wageBudget = Math.max(1000000, s.finance?.wageBudget || 6500000);
+  const items = [];
+
+  // ═══ المحور الرياضي ═══
+  const rankTarget = clamp(
+    Math.round((tableSize / (sizeKey === "giant" ? 6 : sizeKey === "large" ? 3.4 : sizeKey === "medium" ? 2.2 : 1.5)) + mood.rankDelta),
+    1,
+    Math.max(1, tableSize - 1),
+  );
+  items.push({
+    id: "league-rank",
+    kind: "league-rank",
+    target: rankTarget,
+    critical: true,
+  });
+
+  const cups = s.expansion?.cups || [];
+  const domestic = cups.filter((c) => isDomesticCup(c) && enteredCup(s, c));
+  if (domestic.length) {
+    items.push({
+      id: "cup-ties",
+      kind: "cup-ties",
+      target: Math.max(1, size.cupTies),
+      critical: true,
+    });
+  }
+  const continental = cups.filter((c) => isContinentalCup(c) && enteredCup(s, c));
+  if (continental.length) {
+    // مشارك قاريًا فعلًا: المطلب تجاوز مواجهة إقصائية على الأقل.
+    items.push({
+      id: "continental-stage",
+      kind: "continental-stage",
+      target: mood.key === "elite" || mood.key === "ambitious" ? 2 : 1,
+      critical: false,
+    });
+  } else if (
+    s.expansion &&
+    cups.length &&
+    sizeKey !== "small" &&
+    (mood.key === "ambitious" || mood.key === "elite")
+  ) {
+    // غير مشارك، لكن الطموح يسمح بطلب مقعد قاري عبر الدوري.
+    items.push({
+      id: "continental-qualify",
+      kind: "continental-qualify",
+      target: clamp(Math.round(tableSize / 4), 2, Math.max(2, tableSize - 2)),
+      critical: false,
+    });
+  }
+
+  // ═══ المحور المالي ═══
+  items.push({
+    id: "deficit-cap",
+    kind: "deficit-cap",
+    target: Math.round(wageBudget * size.deficitFactor * mood.bold),
+    critical: true,
+  });
+  items.push({
+    id: "min-liquidity",
+    kind: "min-liquidity",
+    target: Math.round(wageBudget * size.liquidityFactor * mood.bold),
+    critical: true,
+  });
+  // بيع لاعب: يُطلب «أحيانًا» — قرار ثابت مُشتق من الموسم والنادي لا عشوائي متغير.
+  if (chance(`${s.clubId}:${seasonNumber}:sale`, 40)) {
+    items.push({
+      id: "player-sale",
+      kind: "player-sale",
+      target: Math.round(wageBudget * 0.5),
+      critical: false,
+    });
+  }
+
+  // ═══ المحور التطويري ═══
+  items.push({
+    id: "youth-minutes",
+    kind: "youth-minutes",
+    target: Math.round(size.youthMinutes * mood.bold),
+    critical: true,
+  });
+  items.push({
+    id: "facility-project",
+    kind: "facility-project",
+    target: 1,
+    critical: false,
+  });
+  if (youthOf(s).length < 3) {
+    items.push({ id: "young-signing", kind: "young-signing", target: 21, critical: false });
+  }
+
+  // المحور يُثبَّت على البند وقت التوليد (لا يُشتق وقت العرض) لأن الحفظة تخزّنه.
+  const resolved = items.map((it) => ({
+    ...it,
+    axis: ITEM_KINDS[it.kind].axis,
+  }));
+  return {
+    schema: MANDATE_SCHEMA,
+    id: `mandate-${seasonNumber}-${s.clubId}`,
+    season: seasonNumber,
+    issuedAt: startDate,
+    startDate,
+    endDate,
+    midDate: midSeasonDate(s, startDate, endDate),
+    size: sizeKey,
+    ambition: rebuild ? "rebuild" : mood.key,
+    rebuild: Boolean(rebuild),
+    items: resolved,
+    baseline: {
+      facilityLevels: Object.fromEntries(
+        (s.facilities || []).map((f) => [f.id, f.level]),
+      ),
+      youthIds: youthOf(s).map((p) => p.id),
+      squadSize: s.players.filter(
+        (p) => p.clubId === s.clubId && p.status !== "retired",
+      ).length,
+    },
+    review: { mid: null, end: null },
+  };
+}
diff --git a/clubowner/src/data/boardTexts.js b/clubowner/src/data/boardTexts.js
new file mode 100644
index 0000000..86bc7e9
--- /dev/null
+++ b/clubowner/src/data/boardTexts.js
@@ -0,0 +1,510 @@
+// نصوص «لائحة الجمعية العمومية» 0.26 — مصدر واحد لكل عبارة بثلاث لغات.
+//
+// لماذا ملف مستقل؟ لأن كل نص في هذا النظام يُشتق منه القاموس تلقائيًا
+// (src/i18n/phrases-board.js) فيبقى التغطية كاملة بالبناء لا بالاجتهاد:
+//   · أي نص عربي هنا يصبح مفتاح ترجمة فورًا، فلا تبقى عبارة غير مترجمة.
+//   · اختبار الوحدة يمرّ على كل نص ويتحقق أن الإنجليزية والفرنسية خاليتان من العربية.
+//
+// المقاطع {v} و {n} و {d} عناصر استبدال تُملأ عند العرض (أرقام/مبالغ/تواريخ).
+export const BOARD_TEXTS = {
+  // ── الهوية والشاشة ────────────────────────────────────────────────────────
+  boardName: {
+    ar: "الجمعية العمومية",
+    en: "The General Assembly",
+    fr: "L’assemblée générale",
+  },
+  boardKicker: {
+    ar: "مجلس الإدارة والمستثمرين",
+    en: "Board and investors",
+    fr: "Conseil et investisseurs",
+  },
+  boardTitle: {
+    ar: "لائحة مطالب الموسم",
+    en: "Season mandate",
+    fr: "Mandat de la saison",
+  },
+  boardIntro: {
+    ar: "الجمعية العمومية والمستثمرون يحددون مطالب الموسم قبل أول جولة. كل بند له هدف قابل للقياس ويتتبعه النظام لحظيًا، والتصويت في نهاية الموسم.",
+    en: "The assembly and the investors set the season’s demands before the first matchday. Every clause has a measurable target tracked live, with a vote at the end of the season.",
+    fr: "L’assemblée et les investisseurs fixent les exigences de la saison avant la première journée. Chaque clause a un objectif mesurable suivi en direct, avec un vote en fin de saison.",
+  },
+  boardNoMandate: {
+    ar: "لا توجد لائحة نشطة",
+    en: "No active mandate",
+    fr: "Aucun mandat actif",
+  },
+  boardNoMandateBody: {
+    ar: "تصدر اللائحة عند بداية الموسم القادم حسب حجم النادي وطموحه.",
+    en: "The mandate is issued at the start of the next season, sized to your club and its ambition.",
+    fr: "Le mandat est émis au début de la saison suivante, selon la taille et l’ambition du club.",
+  },
+  boardConfidence: {
+    ar: "ثقة الجمعية",
+    en: "Assembly confidence",
+    fr: "Confiance de l’assemblée",
+  },
+  boardProgress: {
+    ar: "تقدم اللائحة",
+    en: "Mandate progress",
+    fr: "Progression du mandat",
+  },
+  boardItemsDone: {
+    ar: "{n} من {d} بندًا",
+    en: "{n} of {d} clauses",
+    fr: "{n} sur {d} clauses",
+  },
+  boardCritical: {
+    ar: "بند حاسم",
+    en: "Key clause",
+    fr: "Clause clé",
+  },
+  boardDeadline: {
+    ar: "المهلة: {d}",
+    en: "Deadline: {d}",
+    fr: "Échéance : {d}",
+  },
+  boardMidDate: {
+    ar: "مراجعة منتصف الموسم: {d}",
+    en: "Mid-season review: {d}",
+    fr: "Revue de mi-saison : {d}",
+  },
+  boardEndDate: {
+    ar: "التصويت النهائي: {d}",
+    en: "Final vote: {d}",
+    fr: "Vote final : {d}",
+  },
+  boardItemMet: {
+    ar: "بند محقق",
+    en: "Clause met",
+    fr: "Clause remplie",
+  },
+  boardItemOpen: {
+    ar: "قيد التنفيذ",
+    en: "In progress",
+    fr: "En cours",
+  },
+  boardItemBehind: {
+    ar: "متأخر عن الإيقاع",
+    en: "Behind schedule",
+    fr: "En retard",
+  },
+  boardHistory: {
+    ar: "سجل المواسم",
+    en: "Season history",
+    fr: "Historique des saisons",
+  },
+  boardHistoryEmpty: {
+    ar: "لم يُصوَّت على لائحة بعد.",
+    en: "No mandate has been voted on yet.",
+    fr: "Aucun mandat n’a encore été voté.",
+  },
+  boardSeason: {
+    ar: "موسم {n}",
+    en: "Season {n}",
+    fr: "Saison {n}",
+  },
+  boardSizeSmall: {
+    ar: "نادٍ صغير",
+    en: "Small club",
+    fr: "Petit club",
+  },
+  boardSizeMedium: {
+    ar: "نادٍ متوسط",
+    en: "Mid-sized club",
+    fr: "Club moyen",
+  },
+  boardSizeLarge: {
+    ar: "نادٍ كبير",
+    en: "Large club",
+    fr: "Grand club",
+  },
+  boardSizeGiant: {
+    ar: "نادٍ عملاق",
+    en: "Giant club",
+    fr: "Club géant",
+  },
+  boardAmbitionSurvival: {
+    ar: "طموح البقاء",
+    en: "Survival ambition",
+    fr: "Ambition de survie",
+  },
+  boardAmbitionStable: {
+    ar: "طموح الاستقرار",
+    en: "Stability ambition",
+    fr: "Ambition de stabilité",
+  },
+  boardAmbitionAmbitious: {
+    ar: "طموح المنافسة",
+    en: "Competitive ambition",
+    fr: "Ambition compétitive",
+  },
+  boardAmbitionElite: {
+    ar: "طموح القمة",
+    en: "Elite ambition",
+    fr: "Ambition d’élite",
+  },
+  boardAmbitionRebuild: {
+    ar: "خطة إعادة البناء",
+    en: "Rebuild plan",
+    fr: "Plan de reconstruction",
+  },
+  boardNoDismissal: {
+    ar: "اللائحة لا تمس ملكيتك للنادي أبدًا: العواقب مالية وجماهيرية وإدارية فقط، ومفيش أي مسار ينهي مسيرتك.",
+    en: "The mandate never touches your ownership: consequences are financial, popular and administrative only, and no path ends your career.",
+    fr: "Le mandat ne touche jamais à votre propriété : les conséquences sont financières, populaires et administratives, et aucun chemin ne met fin à votre carrière.",
+  },
+
+  // ── المحاور ───────────────────────────────────────────────────────────────
+  axisSporting: {
+    ar: "المحور الرياضي",
+    en: "Sporting",
+    fr: "Sportif",
+  },
+  axisFinancial: {
+    ar: "المحور المالي",
+    en: "Financial",
+    fr: "Financier",
+  },
+  axisDevelopment: {
+    ar: "المحور التطويري",
+    en: "Development",
+    fr: "Développement",
+  },
+
+  // ── بنود اللائحة (١٠ أنواع) ────────────────────────────────────────────────
+  itemLeagueRank: {
+    ar: "المركز {v} أو أفضل في الدوري",
+    en: "Finish {v} or better in the league",
+    fr: "Terminer {v}e ou mieux en championnat",
+  },
+  itemCupTies: {
+    ar: "الفوز بـ{v} مواجهات إقصائية في الكأس",
+    en: "Win {v} knockout ties in the cup",
+    fr: "Remporter {v} tours à élimination en coupe",
+  },
+  itemContinentalStage: {
+    ar: "تجاوز {v} مواجهات إقصائية في البطولة القارية",
+    en: "Win {v} knockout ties in the continental competition",
+    fr: "Remporter {v} tours à élimination en compétition continentale",
+  },
+  itemContinentalQualify: {
+    ar: "احتلال مركز مؤهل قاريًا — {v} أو أفضل",
+    en: "Finish in a continental spot — {v} or better",
+    fr: "Terminer à une place continentale — {v}e ou mieux",
+  },
+  itemDeficitCap: {
+    ar: "ألا يقل صافي الموسم عن {v}",
+    en: "Season net result no worse than {v}",
+    fr: "Résultat net de la saison pas pire que {v}",
+  },
+  itemMinLiquidity: {
+    ar: "إنهاء الموسم بسيولة لا تقل عن {v}",
+    en: "End the season with at least {v} in cash",
+    fr: "Terminer la saison avec au moins {v} en caisse",
+  },
+  itemPlayerSale: {
+    ar: "بيع لاعب بمقابل لا يقل عن {v}",
+    en: "Sell a player for at least {v}",
+    fr: "Vendre un joueur pour au moins {v}",
+  },
+  itemYouthMinutes: {
+    ar: "منح الناشئين {v} دقيقة لعب",
+    en: "Give the academy players {v} minutes",
+    fr: "Donner {v} minutes aux jeunes",
+  },
+  itemFacilityProject: {
+    ar: "إتمام مشروع منشأة واحد على الأقل",
+    en: "Complete at least one facility project",
+    fr: "Achever au moins un projet d’installation",
+  },
+  itemYoungSigning: {
+    ar: "التعاقد مع لاعب لا يزيد عمره عن {v} عامًا",
+    en: "Sign a player aged {v} or younger",
+    fr: "Recruter un joueur de {v} ans ou moins",
+  },
+
+  // ── بداية الموسم ──────────────────────────────────────────────────────────
+  mandateIssuedTitle: {
+    ar: "الجمعية العمومية تصدر لائحة الموسم",
+    en: "The assembly issues the season mandate",
+    fr: "L’assemblée publie le mandat de la saison",
+  },
+  mandateIssuedBody: {
+    ar: "اللائحة منشورة كاملة في شاشة الجمعية العمومية: بنود على ثلاثة محاور، لكل بند هدف قابل للقياس. مراجعة منتصف الموسم ثم تصويت نهائي في نهاية الموسم. الالتزام الجيد يعني مكافآت حقيقية، والتأخر يعني تحذيرًا رسميًا",
+    en: "The full mandate is on the assembly screen: clauses across three axes, each with a measurable target. A mid-season review, then a final vote at the end of the season. Meeting it brings real rewards; falling behind brings a formal warning",
+    fr: "Le mandat complet est sur l’écran de l’assemblée : des clauses sur trois axes, chacune avec un objectif mesurable. Une revue de mi-saison, puis un vote final en fin de saison. Le respect apporte de vraies récompenses ; le retard, un avertissement officiel",
+  },
+
+  // ── اجتماع منتصف الموسم ───────────────────────────────────────────────────
+  midMeetingGoodTitle: {
+    ar: "رسالة ثقة من منتصف الموسم",
+    en: "A mid-season vote of confidence",
+    fr: "Un vote de confiance à mi-saison",
+  },
+  midMeetingGoodBody: {
+    ar: "الجمعية راجعت التقدم في منتصف الموسم: البنود في إيقاعها الصحيح أو أقرب. المستثمرون راضون، والجماهير تستشعر الاستقرار. استمر على نفس النهج",
+    en: "The assembly reviewed mid-season progress: the clauses are on pace or close. The investors are satisfied and the fans feel the stability. Keep it going",
+    fr: "L’assemblée a examiné la progression à mi-saison : les clauses sont dans les temps ou proches. Les investisseurs sont satisfaits et les supporters sentent la stabilité. Continuez ainsi",
+  },
+  midMeetingWarnTitle: {
+    ar: "تحذير رسمي عند منتصف الموسم",
+    en: "A formal warning at mid-season",
+    fr: "Avertissement officiel à mi-saison",
+  },
+  midMeetingWarnBody: {
+    ar: "الجمعية راجعت التقدم في منتصف الموسم: بنود كثيرة متأخرة عن إيقاعها. هذا إنذار أصفر رسمي بمهلة حتى نهاية الموسم. لا وصاية على قراراتك، لكن التصويت النهائي سيكون على هذا الأساس",
+    en: "The assembly reviewed mid-season progress: too many clauses are behind pace. This is a formal yellow warning with a deadline until the season’s end. Your decisions stay yours, but the final vote will be held on this basis",
+    fr: "L’assemblée a examiné la progression à mi-saison : trop de clauses sont en retard. Ceci est un avertissement jaune officiel avec échéance à la fin de la saison. Vos décisions restent les vôtres, mais le vote final se tiendra sur cette base",
+  },
+  midMeetingTag: {
+    ar: "مراجعة المنتصف",
+    en: "Mid-season review",
+    fr: "Revue de mi-saison",
+  },
+
+  // ── التصويت النهائي ───────────────────────────────────────────────────────
+  endMeetingPassedTitle: {
+    ar: "التصويت النهائي: تنفيذ كامل للائحة",
+    en: "Final vote: the mandate was fully delivered",
+    fr: "Vote final : mandat pleinement rempli",
+  },
+  endMeetingPassedBody: {
+    ar: "الجمعية والمستثمرون صوّتوا بالثقة: اللائحة نُفِّذت. المكافآت دخلت فعلًا — دعم مالي من المستثمرين، وزيادة ميزانية التعاقدات للموسم القادم، ودفعة في حب الجماهير",
+    en: "The assembly and the investors voted confidence: the mandate was delivered. The rewards are real — investor funding, a bigger transfer budget next season and a lift in fan affection",
+    fr: "L’assemblée et les investisseurs ont voté la confiance : le mandat a été rempli. Les récompenses sont réelles — financement des investisseurs, budget de transfert plus élevé la saison prochaine et hausse de l’affection des supporters",
+  },
+  endMeetingPartialTitle: {
+    ar: "التصويت النهائي: إخفاق جزئي — تحذير نهائي",
+    en: "Final vote: partial failure — final warning",
+    fr: "Vote final : échec partiel — avertissement final",
+  },
+  endMeetingPartialBody: {
+    ar: "الجمعية سجّلت إخفاقًا جزئيًا في لائحة الموسم. ليست كارثة، لكنها ليست اللائحة المطلوبة: هذا تحذير نهائي مكتوب، والموسم القادم يُقاس على تحسّن ملموس. ملكيتك للنادي كما هي",
+    en: "The assembly recorded a partial failure on the season mandate. Not a disaster, but not the mandate either: this is a written final warning, and next season will be judged on visible improvement. Your ownership is untouched",
+    fr: "L’assemblée a enregistré un échec partiel du mandat. Pas une catastrophe, mais pas le mandat non plus : ceci est un avertissement final écrit, et la saison prochaine sera jugée sur des progrès visibles. Votre propriété reste intacte",
+  },
+  endMeetingFailedTitle: {
+    ar: "التصويت النهائي: إخفاق كبير",
+    en: "Final vote: a heavy failure",
+    fr: "Vote final : échec lourd",
+  },
+  endMeetingFailedBody: {
+    ar: "الجمعية سجّلت إخفاقًا كبيرًا في لائحة الموسم، والعواقب التنفيذية صدرت بالفعل. الملكية باقية لك، واللائحة القادمة تُبنى على إعادة البناء لا العقاب. تفاصيل الميزانية والتجميد والرعاية في شاشة الجمعية العمومية",
+    en: "The assembly recorded a heavy failure on the season mandate, and the executive consequences are already in effect. Ownership stays yours, and the next mandate is built on rebuilding rather than punishment. The budget, freeze and sponsor details are on the assembly screen",
+    fr: "L’assemblée a enregistré un échec lourd du mandat, et les conséquences exécutives sont déjà appliquées. La propriété vous reste, et le prochain mandat mise sur la reconstruction plutôt que la sanction. Les détails budget, gel et sponsor sont sur l’écran de l’assemblée",
+  },
+  endMeetingTag: {
+    ar: "التصويت النهائي",
+    en: "Final vote",
+    fr: "Vote final",
+  },
+
+  // ── العواقب والمكافآت ─────────────────────────────────────────────────────
+  cRewardInvestors: {
+    ar: "دعم مالي من المستثمرين {money}",
+    en: "investor funding of {money}",
+    fr: "un financement des investisseurs de {money}",
+  },
+  cRewardBudget: {
+    ar: "زيادة ميزانية التعاقدات {n}٪ للموسم القادم",
+    en: "a {n}% bigger transfer budget next season",
+    fr: "un budget de transfert en hausse de {n}% la saison prochaine",
+  },
+  cRewardFans: {
+    ar: "دفعة في حب الجماهير +{n}",
+    en: "a fan-affection boost of +{n}",
+    fr: "un gain d’affection des supporters de +{n}",
+  },
+  cBudgetCut: {
+    ar: "تقليص ميزانية المرتبات {n}٪",
+    en: "a {n}% cut to the wage budget",
+    fr: "une réduction du budget salarial de {n}%",
+  },
+  cFreeze: {
+    ar: "تجميد التعاقدات حتى {d}",
+    en: "a transfer freeze until {d}",
+    fr: "un gel des transferts jusqu’au {d}",
+  },
+  cSponsorOut: {
+    ar: "انسحاب راعٍ من العقد",
+    en: "a sponsor walking away from its deal",
+    fr: "un sponsor qui quitte son contrat",
+  },
+  cProtest: {
+    ar: "احتجاج جماهيري خارج المقر −{n}",
+    en: "a fan protest outside the ground, −{n}",
+    fr: "une protestation des supporters devant le stade, −{n}",
+  },
+  cWageBudgetNote: {
+    ar: "ميزانية المرتبات الحالية: {money}",
+    en: "Current wage budget: {money}",
+    fr: "Budget salarial actuel : {money}",
+  },
+
+  // ── التجميد في سوق الانتقالات ─────────────────────────────────────────────
+  freezeBlocked: {
+    ar: "تجميد التعاقدات ساري حتى {d} بقرار الجمعية العمومية؛ لا يمكن فتح مفاوضات جديدة الآن.",
+    en: "The transfer freeze ordered by the assembly runs until {d}; no new negotiations can be opened right now.",
+    fr: "Le gel des transferts ordonné par l’assemblée court jusqu’au {d} ; aucune nouvelle négociation n’est possible pour l’instant.",
+  },
+  freezeBadge: {
+    ar: "تعاقدات مجمّدة حتى {d}",
+    en: "Transfers frozen until {d}",
+    fr: "Transferts gelés jusqu’au {d}",
+  },
+
+  // ── بطاقة اللوحة وبريد اللائحة ────────────────────────────────────────────
+  boardCardTitle: {
+    ar: "مطالب الجمعية العمومية",
+    en: "Assembly demands",
+    fr: "Exigences de l’assemblée",
+  },
+  boardCardOpen: {
+    ar: "افتح اللائحة كاملة",
+    en: "Open the full mandate",
+    fr: "Ouvrir le mandat complet",
+  },
+  boardMailSeen: {
+    ar: "اطلعت على اللائحة",
+    en: "Noted the mandate",
+    fr: "Mandat pris en compte",
+  },
+  boardMailOpen: {
+    ar: "راجع اللائحة",
+    en: "Review the mandate",
+    fr: "Consulter le mandat",
+  },
+  boardOnboardingStep: {
+    ar: "اطّلع على لائحة الجمعية العمومية",
+    en: "Read the assembly mandate",
+    fr: "Lire le mandat de l’assemblée",
+  },
+  boardOnboardingHint: {
+    ar: "ثلاثة محاور تُقاس طوال الموسم، والتصويت في النهاية",
+    en: "Three axes measured all season, with a vote at the end",
+    fr: "Trois axes mesurés toute la saison, avec un vote à la fin",
+  },
+  boardInboxCategory: {
+    ar: "الجمعية العمومية",
+    en: "General assembly",
+    fr: "Assemblée générale",
+  },
+  boardWarningStreak: {
+    ar: "إخفاق متتالٍ: {n}",
+    en: "Consecutive failures: {n}",
+    fr: "Échecs consécutifs : {n}",
+  },
+  boardBudgetFactor: {
+    ar: "معامل ميزانية التعاقدات: {n}٪",
+    en: "Transfer budget factor: {n}%",
+    fr: "Coefficient du budget transferts : {n}%",
+  },
+  boardLabelSize: {
+    ar: "حجم النادي",
+    en: "Club size",
+    fr: "Taille du club",
+  },
+  boardLabelAmbition: {
+    ar: "طموح الموسم",
+    en: "Season ambition",
+    fr: "Ambition de la saison",
+  },
+  boardMeetings: {
+    ar: "سجل الاجتماعات",
+    en: "Meetings log",
+    fr: "Journal des réunions",
+  },
+  boardEffectNone: {
+    ar: "بلا عواقب",
+    en: "No consequences",
+    fr: "Aucune conséquence",
+  },
+  boardChipPassed: {
+    ar: "تنفيذ كامل",
+    en: "Fully delivered",
+    fr: "Pleinement rempli",
+  },
+  boardChipPartial: {
+    ar: "إخفاق جزئي",
+    en: "Partial failure",
+    fr: "Échec partiel",
+  },
+  boardChipFailed: {
+    ar: "إخفاق كبير",
+    en: "Heavy failure",
+    fr: "Échec lourd",
+  },
+  boardChipTrust: {
+    ar: "رسالة ثقة",
+    en: "Vote of confidence",
+    fr: "Vote de confiance",
+  },
+  boardChipWarning: {
+    ar: "إنذار رسمي",
+    en: "Formal warning",
+    fr: "Avertissement officiel",
+  },
+  boardMigrationNote: {
+    ar: "الجمعية العمومية 0.26: مجلس إدارة ومستثمرون يصدرون لائحة مطالب الموسم بثلاثة محاور، مع مراجعة منتصف الموسم وتصويت نهائي؛ الملكية لا تُمس في أي حال",
+    en: "The assembly 0.26: a board and investors issue a three-axis season mandate, with a mid-season review and a final vote; ownership is never touched",
+    fr: "L’assemblée 0.26 : un conseil et des investisseurs publient un mandat de saison en trois axes, avec une revue de mi-saison et un vote final ; la propriété n’est jamais touchée",
+  },
+  boardInvalidState: {
+    ar: "حالة الجمعية العمومية غير سليمة",
+    en: "The assembly state is not valid",
+    fr: "L’état de l’assemblée n’est pas valide",
+  },
+  boardInvalidMetrics: {
+    ar: "مؤشرات الجمعية العمومية غير سليمة",
+    en: "The assembly indicators are not valid",
+    fr: "Les indicateurs de l’assemblée ne sont pas valides",
+  },
+  boardInvalidMandate: {
+    ar: "لائحة الجمعية العمومية غير سليمة",
+    en: "The assembly mandate is not valid",
+    fr: "Le mandat de l’assemblée n’est pas valide",
+  },
+  boardInvalidHistory: {
+    ar: "سجل لائحة الجمعية العمومية غير سليم",
+    en: "The assembly mandate history is not valid",
+    fr: "L’historique des mandats n’est pas valide",
+  },
+  boardInvalidMeetings: {
+    ar: "سجل اجتماعات الجمعية العمومية غير سليم",
+    en: "The assembly meetings log is not valid",
+    fr: "Le journal des réunions de l’assemblée n’est pas valide",
+  },
+  boardLedgerSupport: {
+    ar: "دعم المستثمرين",
+    en: "Investor funding",
+    fr: "Financement des investisseurs",
+  },
+  boardCurrent: {
+    ar: "الحالي",
+    en: "Current",
+    fr: "Actuel",
+  },
+  boardTargetShort: {
+    ar: "الهدف",
+    en: "Target",
+    fr: "Objectif",
+  },
+};
+// يملأ عناصر الاستبدال {v}/{n}/{d} بـ vars. أي مفتاح ناقص يبقى كما هو (ظهور واضح للخلل).
+export const fillBoardText = (template, vars = {}) =>
+  String(template).replace(/\{(\w+)\}/g, (m, k) =>
+    vars[k] === undefined || vars[k] === null ? m : String(vars[k]),
+  );
+
+// نص جاهز للغة الواجهة الحالية — تستخدمه الشاشات (يُترجم قبل الحقن في DOM).
+export const boardTextFor = (key, vars, language) => {
+  const entry = BOARD_TEXTS[key];
+  if (!entry) return key;
+  const code = language === "en" ? "en" : language === "fr" ? "fr" : "ar";
+  return fillBoardText(entry[code] ?? entry.ar, vars);
+};
+
+// نص عربي للادخار داخل الحفظة: البريد والرسائل تُخزَّن بالعربية دائمًا
+// (الحفظة لا تتغير بتغير اللغة) ثم يترجمها طبقة العرض عند الرسم.
+export const boardTextAr = (key, vars) => boardTextFor(key, vars, "ar");
+export default BOARD_TEXTS;
diff --git a/clubowner/src/data/version.js b/clubowner/src/data/version.js
index 0f47101..3b598fb 100644
--- a/clubowner/src/data/version.js
+++ b/clubowner/src/data/version.js
@@ -1,3 +1,3 @@
 // مصدر وحيد لرقم الإصدار — الهيكل وشارة «عن اللعبة» واختبار الاتساق يقرؤونه من هنا.
 // يجب أن يطابق دائمًا بادئة "version" في package.json ووسم meta في index.html.
-export const APP_VERSION = "0.25";
+export const APP_VERSION = "0.26";
diff --git a/clubowner/src/features/board.js b/clubowner/src/features/board.js
new file mode 100644
index 0000000..6d126e2
--- /dev/null
+++ b/clubowner/src/features/board.js
@@ -0,0 +1,191 @@
+// شاشة «الجمعية العمومية» 0.26 — اللائحة كاملة مع تتبع حي لكل بند أثناء الموسم.
+//
+// كل النصوص تُبنى من سجل النصوص الوحيد (boardTextFor) بلغة الواجهة الحالية،
+// وبلا أي حرف عربي مكتوب هنا مباشرة، فيبقى فحص التغطية صفرًا بلا استثناءات.
+import { heading, badge, statCard, progress, infoNote, empty } from "../components/shared.js";
+import { icon } from "../components/icons.js";
+import { getLanguage } from "../i18n/index.js";
+import { boardTextFor } from "../data/boardTexts.js";
+import { AXIS_TEXT_KEYS, CLUB_SIZES, ITEM_KINDS } from "../data/boardMandates.js";
+import { activeMandate, evaluateMandate, transferFrozen } from "../services/boardMandate.js";
+import { money, num, date } from "../ui/format.js";
+
+const t = (key, vars) => boardTextFor(key, vars, getLanguage());
+const CATEGORY_KEYS = {
+  "league-rank": "rank",
+  "continental-qualify": "rank",
+  "deficit-cap": "money",
+  "min-liquidity": "money",
+  "player-sale": "money",
+};
+const amountOf = (unit, value) =>
+  unit === "money" || CATEGORY_KEYS[unit] === "money" ? money(value) : num(value);
+const itemLabel = (item) => {
+  const textKey = item.textKey || ITEM_KINDS[item.kind]?.textKey;
+  const unit = item.unit || ITEM_KINDS[item.kind]?.unit;
+  const shown =
+    unit === "money"
+      ? money(item.target)
+      : unit === "rank"
+        ? num(item.target)
+        : num(item.target);
+  return t(textKey, { v: shown });
+};
+const statusChip = (item) =>
+  item.done
+    ? badge(t("boardItemMet"), "green")
+    : item.ratio < 0.5
+      ? badge(t("boardItemBehind"), "red")
+      : badge(t("boardItemOpen"), "gold");
+const effectLine = (effect) => {
+  switch (effect.kind) {
+    case "investors":
+      return t("cRewardInvestors", { money: money(effect.amount) });
+    case "budget":
+      return t("cRewardBudget", { n: num(Math.round(effect.share * 100)) });
+    case "fans":
+      return t("cRewardFans", { n: num(effect.amount) });
+    case "budget-cut":
+      return t("cBudgetCut", { n: num(Math.round(effect.share * 100)) });
+    case "freeze":
+      return t("cFreeze", { d: date(effect.until) });
+    case "sponsor-out":
+      return t("cSponsorOut");
+    case "protest":
+      return t("cProtest", { n: num(Math.abs(effect.amount)) });
+    default:
+      return "";
+  }
+};
+const voteChip = (status) =>
+  status === "passed"
+    ? badge(t("boardChipPassed"), "green")
+    : status === "partial"
+      ? badge(t("boardChipPartial"), "gold")
+      : badge(t("boardChipFailed"), "red");
+
+export function boardView(s) {
+  const mandate = activeMandate(s);
+  const evaluation = mandate ? evaluateMandate(s, mandate) : null;
+  const frozen = transferFrozen(s);
+  const b = s.board;
+  const head = heading(
+    t("boardKicker"),
+    t("boardTitle"),
+    t("boardIntro"),
+    frozen
+      ? `<span class="badge red">${icon("calendar", 14)} ${t("freezeBadge", { d: date(b.freezeUntil) })}</span>`
+      : "",
+  );
+  if (!mandate || !evaluation)
+    return `${head}${empty(t("boardNoMandate"), t("boardNoMandateBody"), "crown")}${historyView(s)}${infoNote(t("boardNoDismissal"))}`;
+
+  const cards = `<div class="stats-grid">${statCard(
+    t("boardConfidence"),
+    num(Math.round(b.confidence)),
+    " / " + num(100),
+    `${t("boardLabelSize")}: ${t(CLUB_SIZES[mandate.size].textKey)}`,
+    "crown",
+    b.confidence >= 60 ? "green" : "gold",
+  )}${statCard(
+    t("boardProgress"),
+    num(evaluation.done),
+    ` / ${num(evaluation.total)}`,
+    t("boardItemsDone", { n: num(evaluation.done), d: num(evaluation.total) }),
+    "shield",
+    evaluation.status === "passed" ? "green" : evaluation.status === "failed" ? "red" : "gold",
+  )}${statCard(
+    t("boardLabelSize"),
+    t(CLUB_SIZES[mandate.size].textKey),
+    "",
+    t("boardLabelAmbition") + ": " + t(ambitionTextKey(mandate.ambition)),
+    "stadium",
+  )}${statCard(
+    t("boardLabelAmbition"),
+    voteChip(evaluation.status),
+    "",
+    `${t("boardMidDate", { d: textDate(mandate.midDate) })} · ${t("boardEndDate", { d: textDate(mandate.endDate) })}`,
+    "calendar",
+    "gold",
+  )}</div>`;
+
+  const axes = AXES_VIEW.map((axis) => {
+    const group = evaluation.byAxis[axis];
+    if (!group || !group.total) return "";
+    return `<section class="panel board-axis"><div class="panel-head"><h3>${icon("shield")} ${t(AXIS_TEXT_KEYS[axis])}</h3><span class="badge outline">${num(group.done)} / ${num(group.total)}</span></div><div class="board-items">${group.items
+      .map(
+        (item) => `<div class="board-item ${item.done ? "done" : ""}">
+          <div class="board-item-top"><strong>${itemLabel(item)}</strong><span class="board-item-chips">${
+            item.critical ? badge(t("boardCritical"), "outline") : ""
+          }${statusChip(item)}</span></div>
+          ${progress(Math.round(item.ratio * 100))}
+          <div class="board-item-meta"><small>${t("boardCurrent")}: ${amountOf(item.unit, item.current)}</small><small>${t("boardTargetShort")}: ${amountOf(item.unit, item.target)}</small></div>
+        </div>`,
+      )
+      .join("")}</div></section>`;
+  }).join("");
+
+  return `${head}${cards}<div class="board-layout">${axes}</div>${meetingsView(s)}${historyView(s)}${infoNote(t("boardNoDismissal"))}`;
+}
+
+const AXES_VIEW = ["sporting", "financial", "development"];
+const ambitionTextKey = (key) =>
+  ({
+    survival: "boardAmbitionSurvival",
+    stable: "boardAmbitionStable",
+    ambitious: "boardAmbitionAmbitious",
+    elite: "boardAmbitionElite",
+    rebuild: "boardAmbitionRebuild",
+  })[key] || "boardAmbitionStable";
+const textDate = (value) => date(value);
+
+function meetingsView(s) {
+  const list = (s.board?.meetings || []).slice(-6).reverse();
+  if (!list.length) return "";
+  return `<section class="panel board-meetings"><div class="panel-head"><h3>${icon("inbox")} ${t("boardMeetings")}</h3></div><div class="desk-list">${list
+    .map((m) => {
+      const label =
+        m.kind === "mid"
+          ? m.status === "trust"
+            ? t("boardChipTrust")
+            : t("boardChipWarning")
+          : voteChip(m.status);
+      return `<div class="desk-item static"><span class="desk-icon ${
+        m.status === "failed" || m.status === "warning" ? "gold" : ""
+      }">${icon(m.kind === "mid" ? "flag" : "crown", 19)}</span><div><strong>${m.kind === "mid" ? t("midMeetingTag") : t("endMeetingTag")}</strong><span>${t("boardSeason", { n: num(m.season) })}</span></div><span class="desk-meta">${label}<small>${t("boardItemsDone", { n: num(m.done), d: num(m.total) })}</small></span></div>`;
+    })
+    .join("")}</div></section>`;
+}
+
+function historyView(s) {
+  const history = [...(s.board?.history || [])].reverse();
+  return `<section class="panel board-history"><div class="panel-head"><h3>${icon("chart")} ${t("boardHistory")}</h3></div>${
+    history.length
+      ? `<div class="board-history-rows">${history
+          .map(
+            (h) => `<div class="board-history-row"><div><strong>${t("boardSeason", { n: num(h.season) })}</strong><small>${t("boardItemsDone", { n: num(h.done), d: num(h.total) })}${h.tier ? ` · ${t("boardWarningStreak", { n: num(h.tier) })}` : ""}</small></div><span class="board-history-effects">${
+              h.effects?.length
+                ? h.effects.map(effectLine).filter(Boolean).join(" · ")
+                : t("boardEffectNone")
+            }</span>${voteChip(h.status)}</div>`,
+          )
+          .join("")}</div>`
+      : `<p class="muted">${t("boardHistoryEmpty")}</p>`
+  }</section>`;
+}
+
+// بطاقة مختصرة للوحة المالك: التقدم الحالي وزر الشاشة الكاملة.
+export function boardCardView(s) {
+  const mandate = activeMandate(s);
+  if (!mandate) return "";
+  const e = evaluateMandate(s, mandate);
+  if (!e) return "";
+  const top = [...e.items]
+    .sort((a, b) => Number(a.done) - Number(b.done) || a.ratio - b.ratio)
+    .slice(0, 3);
+  return `<section class="panel board-card"><div class="panel-head"><h3>${icon("crown")} ${t("boardCardTitle")}</h3><span class="onboarding-progress">${num(e.done)} / ${num(e.total)}</span></div><div class="onboarding-progress-track"><i style="width:${Math.round((e.done / Math.max(1, e.total)) * 100)}%"></i></div><div class="onboarding-steps">${top
+    .map(
+      (item) => `<div class="onboarding-step ${item.done ? "done" : ""}"><span class="onboarding-check">${item.done ? icon("check", 16) : num(Math.round(item.ratio * 100)) + "٪"}</span><div><strong>${itemLabel(item)}</strong><small>${t("boardCurrent")}: ${amountOf(item.unit, item.current)} · ${t("boardTargetShort")}: ${amountOf(item.unit, item.target)}</small></div></div>`,
+    )
+    .join("")}</div><button class="btn secondary full" data-nav="board">${t("boardCardOpen")} ${icon("arrow", 16)}</button></section>`;
+}
diff --git a/clubowner/src/features/dashboard.js b/clubowner/src/features/dashboard.js
index de91590..4c960ff 100644
--- a/clubowner/src/features/dashboard.js
+++ b/clubowner/src/features/dashboard.js
@@ -1,5 +1,6 @@
 import { excerpt, tr } from "../i18n/index.js";
 import { onboardingView } from "./onboarding.js";
+import { boardCardView } from "./board.js";
 import { lastPlayedFixture, reportFor } from "../services/matchReport.js";
 import { ownFixtures } from "../services/calendar.js";
 import { icon } from "../components/icons.js";
@@ -27,7 +28,7 @@ export function dashboardView(s) {
     monthly = forecast(s),
     table = sortedTable(s),
     rank = table.findIndex((t) => t.clubId === s.clubId) + 1;
-  return `${heading("نظرة من أعلى", "أهلًا بك في مكتبك، <span data-no-translate>" + esc(s.owner) + "</span>", "الصورة الكاملة لناديك. والقرار القادم في إيدك.", `<span class="badge outline">${icon("flag", 14)} الموسم ${num(s.seasonNumber)}</span>`)}<section class="hero-card"><div class="hero-art">${stadiumArt()}</div><div class="hero-copy"><span class="hero-kicker"><i></i> مشروع ${c.name}</span><h2>ابنِ النادي.<br>واصنع <span>التاريخ.</span></h2><p>الفريق يكسب مباراة. المؤسسة تبني إرثًا.</p><button class="btn light" data-nav="facilities">طوّر مشروعك ${icon("arrow", 17)}</button></div><div class="hero-bottom"><span>${icon("shield", 15)} ${esc(c.city)}${s.expansion ? "" : "، مصر"}</span><span>${icon("stadium", 15)} ${num(s.capacity)} مقعد</span><span>${icon("crown", 15)} تحت إدارتك</span></div><span class="hero-watermark">${tr("منذ ٢٠٢٦ · عهدك أنت", "SINCE 2026 · YOUR ERA", "DEPUIS 2026 · VOTRE ÈRE")}</span></section><div class="stats-grid">${statCard("السيولة المتاحة", money(s.finance.cash), cur(), `${icon("up", 14)} ${money(monthly.income)} إيراد تعاقدي خلال ٣٠ يومًا`, "finance", "green")}${statCard("مرتبات الفريق", money(wages(s)), cur() + " / شهر", `${num(Math.round((wages(s) / s.finance.wageBudget) * 100))}٪ من ميزانية المرتبات`, "squad")}${statCard("ثقة الجماهير", num(s.fanSupport), " / ١٠٠", `${icon("up", 14)} تتأثر بالنتائج داخل الملعب`, "shield", "green")}${statCard("التزامات مستقبلية", money(liabilities(s)), cur(), `${s.finance.obligations.filter((o) => o.status === "pending" && o.category !== "sponsor-income").length ? num(s.finance.obligations.filter((o) => o.status === "pending" && o.category !== "sponsor-income").length) + " دفعات مجدولة" : "لا أقساط مستحقة حاليًا"}`, "calendar", "gold")}</div><div class="dashboard-columns"><div class="dashboard-main">${onboardingView(s)}<section class="panel"><div class="panel-head"><h3>${icon("inbox")} على مكتبك اليوم ${pending.length ? `<span class="count gold">${num(pending.length)}</span>` : ""}</h3><button class="text-button" data-nav="inbox">كل البريد ${icon("arrow", 14)}</button></div><div class="desk-list">${s.inbox
+  return `${heading("نظرة من أعلى", "أهلًا بك في مكتبك، <span data-no-translate>" + esc(s.owner) + "</span>", "الصورة الكاملة لناديك. والقرار القادم في إيدك.", `<span class="badge outline">${icon("flag", 14)} الموسم ${num(s.seasonNumber)}</span>`)}<section class="hero-card"><div class="hero-art">${stadiumArt()}</div><div class="hero-copy"><span class="hero-kicker"><i></i> مشروع ${c.name}</span><h2>ابنِ النادي.<br>واصنع <span>التاريخ.</span></h2><p>الفريق يكسب مباراة. المؤسسة تبني إرثًا.</p><button class="btn light" data-nav="facilities">طوّر مشروعك ${icon("arrow", 17)}</button></div><div class="hero-bottom"><span>${icon("shield", 15)} ${esc(c.city)}${s.expansion ? "" : "، مصر"}</span><span>${icon("stadium", 15)} ${num(s.capacity)} مقعد</span><span>${icon("crown", 15)} تحت إدارتك</span></div><span class="hero-watermark">${tr("منذ ٢٠٢٦ · عهدك أنت", "SINCE 2026 · YOUR ERA", "DEPUIS 2026 · VOTRE ÈRE")}</span></section><div class="stats-grid">${statCard("السيولة المتاحة", money(s.finance.cash), cur(), `${icon("up", 14)} ${money(monthly.income)} إيراد تعاقدي خلال ٣٠ يومًا`, "finance", "green")}${statCard("مرتبات الفريق", money(wages(s)), cur() + " / شهر", `${num(Math.round((wages(s) / s.finance.wageBudget) * 100))}٪ من ميزانية المرتبات`, "squad")}${statCard("ثقة الجماهير", num(s.fanSupport), " / ١٠٠", `${icon("up", 14)} تتأثر بالنتائج داخل الملعب`, "shield", "green")}${statCard("التزامات مستقبلية", money(liabilities(s)), cur(), `${s.finance.obligations.filter((o) => o.status === "pending" && o.category !== "sponsor-income").length ? num(s.finance.obligations.filter((o) => o.status === "pending" && o.category !== "sponsor-income").length) + " دفعات مجدولة" : "لا أقساط مستحقة حاليًا"}`, "calendar", "gold")}</div><div class="dashboard-columns"><div class="dashboard-main">${onboardingView(s)}${boardCardView(s)}<section class="panel"><div class="panel-head"><h3>${icon("inbox")} على مكتبك اليوم ${pending.length ? `<span class="count gold">${num(pending.length)}</span>` : ""}</h3><button class="text-button" data-nav="inbox">كل البريد ${icon("arrow", 14)}</button></div><div class="desk-list">${s.inbox
     .slice(0, 3)
     .map(
       (m, i) =>
diff --git a/clubowner/src/features/finance.js b/clubowner/src/features/finance.js
index dfb1d5a..34ed85f 100644
--- a/clubowner/src/features/finance.js
+++ b/clubowner/src/features/finance.js
@@ -17,6 +17,8 @@ import {
 } from "../services/finance.js";
 import { ownerCountry } from "../services/sponsors.js";
 import { addDays } from "../core/utils.js";
+import { getLanguage } from "../i18n/index.js";
+import { boardTextFor } from "../data/boardTexts.js";
 const cats = {
   vault: "الخزنة السرية",
   wages: "مرتبات",
@@ -35,6 +37,7 @@ const cats = {
   "legend-fee": "أسطورة · مقدم/تعويض",
   "legend-salary": "أسطورة · راتب",
   "legend-income": "أسطورة · حقوق صورة",
+  "board-support": boardTextFor("boardLedgerSupport", null, getLanguage()),
 };
 export function financeView(s, tab = "ledger") {
   const country = ownerCountry(s),
diff --git a/clubowner/src/features/inbox.js b/clubowner/src/features/inbox.js
index d3253c6..6d81f73 100644
--- a/clubowner/src/features/inbox.js
+++ b/clubowner/src/features/inbox.js
@@ -1,4 +1,5 @@
-import { excerpt } from "../i18n/index.js";
+import { excerpt, getLanguage } from "../i18n/index.js";
+import { boardTextFor } from "../data/boardTexts.js";
 import { eventDecisionView } from "./events.js";
 import { heading, badge, empty, button } from "../components/shared.js";
 import { icon } from "../components/icons.js";
@@ -20,6 +21,7 @@ export function inboxView(s, filter = "all", selected = null) {
     ["matches", "المباريات"],
     ["careers", "الجهاز الفني والمسيرة"],
     ["events", "أحداث النادي"],
+    ["board", "الجمعية العمومية"],
   ]
     .map(
       ([id, title]) =>
@@ -31,7 +33,15 @@ export function inboxView(s, filter = "all", selected = null) {
 }
 export function messageDetail(s, m) {
   let actions = "";
+  const isBoard = typeof m.kind === "string" && m.kind.startsWith("board-");
+  // رسائل الجمعية العمومية للعلم: زر واحد يفتح اللائحة كاملة.
+  if (isBoard && !(m.required && m.status === "open"))
+    actions = button(boardTextFor("boardMailOpen", null, getLanguage()), "go-board", "", "primary");
   if (m.required && m.status === "open") {
+    if (isBoard)
+      actions =
+        button(boardTextFor("boardMailOpen", null, getLanguage()), "go-board", "", "primary") +
+        button(boardTextFor("boardMailSeen", null, getLanguage()), "resolve", m.id, "ghost");
     if (m.kind === "academy-review")
       actions =
         button("مراجعة الأكاديمية", "go-talent", m.ref, "primary") +
diff --git a/clubowner/src/features/onboarding.js b/clubowner/src/features/onboarding.js
index 9883412..0312c70 100644
--- a/clubowner/src/features/onboarding.js
+++ b/clubowner/src/features/onboarding.js
@@ -33,6 +33,15 @@ export const ONBOARDING_STEPS = [
       "Investir tôt, c'est des revenus et des performances ensuite",
     ),
   },
+  {
+    key: "board",
+    label: tr("اطّلع على لائحة الجمعية العمومية", "Read the assembly mandate", "Lire le mandat de l’assemblée"),
+    hint: tr(
+      "ثلاثة محاور تُقاس طوال الموسم، والتصويت في النهاية",
+      "Three axes measured all season, with a vote at the end",
+      "Trois axes mesurés toute la saison, avec un vote à la fin",
+    ),
+  },
   {
     key: "week",
     label: tr("مرّر أول أسبوع", "Advance your first week", "Avancez votre première semaine"),
diff --git a/clubowner/src/i18n/index.js b/clubowner/src/i18n/index.js
index 47fcacd..f517390 100644
--- a/clubowner/src/i18n/index.js
+++ b/clubowner/src/i18n/index.js
@@ -7,6 +7,7 @@ import { NAME_PHRASES } from "./phrases-names.js";
 import { LEGEND_PHRASES } from "./phrases-legends.js";
 import { EXTRA_PHRASES } from "./phrases-extra.js";
 import { EVENT_PHRASES } from "./phrases-events.js";
+import { BOARD_PHRASES } from "./phrases-board.js";
 import egyptPyramid from "../data/egyptPyramid.json" with { type: "json" };
 import { ROSTERS } from "../data/packs/current-2026.js";
 import { worldNameMap } from "../data/packs/world.js";
@@ -24,6 +25,8 @@ for (const extra of [
   EXTRA_PHRASES,
   // 0.25: phrases-events comes last so hand-tuned entries in earlier modules always win.
   EVENT_PHRASES,
+  // 0.26: assembly mandate phrases are derived from src/data/boardTexts.js (single source).
+  BOARD_PHRASES,
 ])
   for (const [ar, pair] of Object.entries(extra))
     if (!DICTIONARY[ar])
diff --git a/clubowner/src/i18n/phrases-board.js b/clubowner/src/i18n/phrases-board.js
new file mode 100644
index 0000000..b0d1505
--- /dev/null
+++ b/clubowner/src/i18n/phrases-board.js
@@ -0,0 +1,18 @@
+// قاموس «لائحة الجمعية العمومية» 0.26 — مشتق آليًا من سجل النصوص الوحيد
+// (src/data/boardTexts.js) فلا تنفصل الترجمة عن المصدر ولا تبقى عبارة بلا مقابل.
+// المفتاح هو النص العربي كما هو، والقيمة [الإنجليزية، الفرنسية].
+// عناصر الاستبدال {v}/{n}/{d} جزء من المفتاح المقصود (تُملأ وقت العرض أو تُترك كما هي).
+import { BOARD_TEXTS } from "../data/boardTexts.js";
+
+// ملاحظة: اتفاقية المستودع أن مفتاح القاموس بلا نقطة نهاية الجملة، لذلك نُسجّل
+// النسخة الكاملة والنسخة المنزوعة النقطة معًا (translateText يقبل الاثنتين).
+export const BOARD_PHRASES = (() => {
+  const out = {};
+  for (const entry of Object.values(BOARD_TEXTS)) {
+    out[entry.ar] = [entry.en, entry.fr];
+    const bare = entry.ar.replace(/[.؛:!؟…،,]+$/, "");
+    if (bare && !out[bare]) out[bare] = [entry.en, entry.fr];
+  }
+  return out;
+})();
+export default BOARD_PHRASES;
diff --git a/clubowner/src/main.js b/clubowner/src/main.js
index 9795a33..dbfc72e 100644
--- a/clubowner/src/main.js
+++ b/clubowner/src/main.js
@@ -146,6 +146,7 @@ import {
   sponsorDealResult,
 } from "./features/sponsors.js";
 import { financeView } from "./features/finance.js";
+import { boardView } from "./features/board.js";
 import { worldView } from "./features/world.js";
 import { settingsView } from "./features/settings.js";
 import {
@@ -249,6 +250,7 @@ function render() {
     facilities: () => facilitiesView(s),
     sponsors: () => sponsorsView(s),
     finance: () => financeView(s, ui.financeTab),
+    board: () => boardView(s),
     world: () =>
       s.expansion
         ? competitionsView(s, ui.expandedDivision)
@@ -571,6 +573,12 @@ const actions = {
     ui.route = "careers";
     render();
   },
+  // 0.26: من البريد إلى لائحة الجمعية العمومية، ويُعلَّم بند الأونبوردنج تلقائيًا.
+  "go-board": async () => {
+    const s = getState();
+    if (s) await apply((state) => markStep(state, "board"));
+    navigate("board");
+  },
   "loan-open": async (el) => openModal(loanForm(getState(), el.dataset.id)),
   "loan-out-open": async () =>
     openModal(
diff --git a/clubowner/src/services/boardMandate.js b/clubowner/src/services/boardMandate.js
new file mode 100644
index 0000000..a258864
--- /dev/null
+++ b/clubowner/src/services/boardMandate.js
@@ -0,0 +1,465 @@
+// محرك «لائحة الجمعية العمومية» 0.26 — التتبع الحي، واجتماعا المنتصف والنهاية، وسلم العواقب.
+//
+// قيد التصميم الصارم (هوية اللعبة): **المالك لا يُقال أبدًا**. كل عاقبة هنا مالية
+// (ميزانية/تجميد تعاقدات/راعٍ) أو جماهيرية أو إدارية، ولا يوجد في هذا الملف أي مسار
+// يحذف النادي أو ينهي المسيرة. سلم العواقب يتوقف عند درجة قصوى (MAX_LADDER_TIER)
+// ولائحة الموسم التالي تُبنى على «إعادة البناء» لا على تصعيد عقابي لا نهائي.
+//
+// الأداء: لا شيء هنا يمرّ على قائمة اللاعبين كاملة إلا نصاب الناشئين ودقائقهم
+// (وكلاهما مرشَّح بـ clubId في الملفات الصغيرة)، والتقييم نفسه يعمل مرة واحدة
+// في منتصف الموسم ومرة عند التصويت النهائي — لا في كل يوم.
+import { addDays, clamp, uid } from "../core/utils.js";
+import { message } from "./inbox.js";
+import { post } from "./finance.js";
+import {
+  AXES,
+  ITEM_KINDS,
+  MANDATE_SCHEMA,
+  baseAmbition,
+  buildMandate,
+  isContinentalCup,
+  isDomesticCup,
+  sizeOf,
+} from "../data/boardMandates.js";
+import { boardTextAr } from "../data/boardTexts.js";
+import { money, num } from "../ui/format.js";
+
+export const BOARD_CATEGORY = "board";
+// عتبات التصويت: تنفيذ كامل = كل البنود الحاسمة + ٨٥٪ من الوزن الموزون.
+// إخفاق جزئي = البنود الحاسمة تحققت أو ٦٠٪ وزنًا. إخفاق كبير = غير ذلك.
+export const PASS_SCORE = 0.85;
+export const PARTIAL_SCORE = 0.6;
+// اجتماع المنتصف: ثقة إن بلغ الإيقاع ٦٠٪ من الوزن، وإلا إنذار أصفر رسمي.
+export const MID_GOOD_SCORE = 0.6;
+// سقف سلم العواقب: لا درجة رابعة ولا إنهاء مسيرة.
+export const MAX_LADDER_TIER = 3;
+export const MIN_WAGE_BUDGET = 1000000;
+export const MAX_HISTORY = 30;
+
+export const CONSEQUENCE_LADDER = [
+  { tier: 1, wageCut: 0.1, freezeDays: 60, sponsorsOut: 0, fanDrop: 6, repDrop: 1 },
+  { tier: 2, wageCut: 0.15, freezeDays: 90, sponsorsOut: 1, fanDrop: 10, repDrop: 2 },
+  { tier: 3, wageCut: 0.2, freezeDays: 120, sponsorsOut: 1, fanDrop: 12, repDrop: 2 },
+];
+export const REWARDS = { confidence: 12, cashShare: 0.12, boost: 0.15, fanLift: 5, repLift: 1 };
+export const MID_TRUST = { confidence: 3, fanLift: 2 };
+export const PARTIAL_PENALTY = { confidence: 6 };
+
+// ── التهيئة ─────────────────────────────────────────────────────────────────
+export function initBoard(s) {
+  s.board = {
+    schema: MANDATE_SCHEMA,
+    confidence: 60,
+    failureStreak: 0,
+    successStreak: 0,
+    freezeUntil: null,
+    wageFactor: 1,
+    pendingBoost: 0,
+    nextRebuild: false,
+    mandate: null,
+    history: [],
+    meetings: [],
+  };
+  return s.board;
+}
+export const ensureBoard = (s) => s.board || initBoard(s);
+export const activeMandate = (s) => s.board?.mandate || null;
+
+// ── قياسات حية من الحفظة (كلها مشتقة، بلا حقول مكررة) ───────────────────────
+export const seasonNet = (s, from) =>
+  s.finance.ledger
+    .filter((e) => e.date >= from)
+    .reduce((n, e) => n + e.amount, 0);
+export const saleProceeds = (s, from) =>
+  s.finance.ledger
+    .filter((e) => e.date >= from && e.category === "player-sale")
+    .reduce((n, e) => n + Math.max(0, e.amount), 0);
+export const currentRank = (s) => {
+  const rows = [...(s.table || [])].sort(
+    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf,
+  );
+  return rows.findIndex((t) => t.clubId === s.clubId) + 1 || rows.length;
+};
+// مواجهة إقصائية محسومة لصالحنا: المحركات الحديثة تسجّلها في c.ties،
+// والكؤوس القديمة (بلا محرك) تسجّلها في c.results مع حقل winner.
+export function cupTiesWon(s, predicate) {
+  let won = 0;
+  for (const c of s.expansion?.cups || []) {
+    if (!predicate(c)) continue;
+    for (const t of c.ties || [])
+      if (t.winner === s.clubId && (t.a === s.clubId || t.b === s.clubId)) won++;
+    for (const f of c.results || [])
+      if (f.winner === s.clubId && (f.home === s.clubId || f.away === s.clubId))
+        won++;
+  }
+  return won;
+}
+export const ownYouth = (s) =>
+  s.players.filter(
+    (p) => p.clubId === s.clubId && p.status !== "retired" && p.age <= 21,
+  );
+export const youthMinutes = (s) =>
+  ownYouth(s).reduce((n, p) => n + (p.seasonMinutes || 0), 0);
+export const completedProjects = (s, baseline) =>
+  (s.facilities || []).filter(
+    (f) => f.level > (baseline?.facilityLevels?.[f.id] ?? f.level),
+  ).length;
+export const signedYoung = (s, baseline) => {
+  const known = new Set(baseline?.youthIds || []);
+  return ownYouth(s).filter((p) => !known.has(p.id)).length;
+};
+
+// ── تتبّع بند واحد ──────────────────────────────────────────────────────────
+export function itemProgress(s, item, mandate) {
+  const from = mandate.startDate;
+  const ratio = (current, target, done) =>
+    done ? 1 : clamp(target > 0 ? current / target : 1, 0, 1);
+  switch (item.kind) {
+    case "league-rank":
+    case "continental-qualify": {
+      const rank = currentRank(s);
+      const done = rank <= item.target;
+      return {
+        current: rank,
+        target: item.target,
+        done,
+        ratio: done ? 1 : clamp(item.target / Math.max(1, rank), 0, 1),
+      };
+    }
+    case "cup-ties":
+    case "continental-stage": {
+      const won = cupTiesWon(
+        s,
+        item.kind === "cup-ties" ? isDomesticCup : isContinentalCup,
+      );
+      const done = won >= item.target;
+      return { current: won, target: item.target, done, ratio: ratio(won, item.target, done) };
+    }
+    case "deficit-cap": {
+      const deficit = Math.max(0, -seasonNet(s, from));
+      const done = deficit <= item.target;
+      return { current: deficit, target: item.target, done, ratio: ratio(deficit, item.target, done) };
+    }
+    case "min-liquidity": {
+      const cash = s.finance.cash;
+      const done = cash >= item.target;
+      return { current: cash, target: item.target, done, ratio: ratio(Math.max(0, cash), item.target, done) };
+    }
+    case "player-sale": {
+      const got = saleProceeds(s, from);
+      const done = got >= item.target;
+      return { current: got, target: item.target, done, ratio: ratio(got, item.target, done) };
+    }
+    case "youth-minutes": {
+      const mins = youthMinutes(s);
+      const done = mins >= item.target;
+      return { current: mins, target: item.target, done, ratio: ratio(mins, item.target, done) };
+    }
+    case "facility-project": {
+      const n = completedProjects(s, mandate.baseline);
+      const done = n >= item.target;
+      return { current: n, target: item.target, done, ratio: ratio(n, item.target, done) };
+    }
+    case "young-signing": {
+      const n = signedYoung(s, mandate.baseline);
+      const done = n >= item.target;
+      return { current: n, target: item.target, done, ratio: ratio(n, item.target, done) };
+    }
+    default:
+      return { current: 0, target: item.target ?? 1, done: false, ratio: 0 };
+  }
+}
+
+// ── التقييم الكامل: بنود جاهزة للعرض + وزن + حالة ───────────────────────────
+export function evaluateMandate(s, mandate = activeMandate(s)) {
+  if (!mandate) return null;
+  const items = mandate.items.map((it) => ({
+    ...it,
+    ...ITEM_KINDS[it.kind],
+    ...itemProgress(s, it, mandate),
+  }));
+  const weight = (it) => (it.critical ? 2 : 1);
+  const totalWeight = items.reduce((n, it) => n + weight(it), 0) || 1;
+  const earned = items.reduce((n, it) => n + weight(it) * it.ratio, 0);
+  const score = earned / totalWeight;
+  const done = items.filter((it) => it.done).length;
+  const criticalMissing = items.filter((it) => it.critical && !it.done);
+  const status =
+    !criticalMissing.length && score >= PASS_SCORE
+      ? "passed"
+      : !criticalMissing.length || score >= PARTIAL_SCORE
+        ? "partial"
+        : "failed";
+  return {
+    items,
+    score,
+    done,
+    total: items.length,
+    criticalMissing,
+    status,
+    byAxis: Object.fromEntries(
+      AXES.map((axis) => {
+        const list = items.filter((it) => it.axis === axis);
+        return [
+          axis,
+          { items: list, done: list.filter((it) => it.done).length, total: list.length },
+        ];
+      }),
+    ),
+  };
+}
+
+// ── إصدار لائحة موسم ────────────────────────────────────────────────────────
+export function startSeasonMandate(s) {
+  ensureBoard(s);
+  const b = s.board;
+  if (b.mandate && !b.mandate.review.end) return b.mandate; // لائحة الموسم قائمة بالفعل
+  if (b.pendingBoost > 0) {
+    // مكافأة الموسم الماضي تصل الآن: ميزانية تعاقدات أكبر (معلنة لا سرية).
+    s.finance.wageBudget = Math.round(s.finance.wageBudget * (1 + b.pendingBoost));
+    b.wageFactor = Math.round((b.wageFactor || 1) * (1 + b.pendingBoost) * 1000) / 1000;
+    b.pendingBoost = 0;
+  }
+  if (b.freezeUntil && b.freezeUntil < s.date) b.freezeUntil = null;
+  const size = sizeOf(s.reputation);
+  const rebuild = Boolean(b.nextRebuild);
+  const ambition = rebuild ? "rebuild" : baseAmbition(size);
+  const mandate = buildMandate(s, {
+    seasonNumber: s.seasonNumber,
+    startDate: s.date,
+    endDate: s.nextSeasonDate,
+    ambition,
+    rebuild,
+  });
+  b.nextRebuild = false;
+  b.mandate = mandate;
+  message(s, {
+    title: boardTextAr("mandateIssuedTitle"),
+    body:
+      boardTextAr("mandateIssuedBody") +
+      ` (${num(mandate.items.length)} · ${mandate.midDate} · ${mandate.endDate})`,
+    category: BOARD_CATEGORY,
+    kind: "board-mandate",
+    ref: mandate.id,
+  });
+  return mandate;
+}
+
+// ── اجتماع منتصف الموسم ─────────────────────────────────────────────────────
+export function midSeasonReview(s, mandate = activeMandate(s)) {
+  const b = ensureBoard(s);
+  if (!mandate || mandate.review.mid) return null;
+  const e = evaluateMandate(s, mandate);
+  const good = e.score >= MID_GOOD_SCORE;
+  mandate.review.mid = {
+    date: s.date,
+    good,
+    done: e.done,
+    total: e.total,
+    score: Number(e.score.toFixed(3)),
+  };
+  const rec = {
+    id: uid(s, "meet"),
+    kind: "mid",
+    season: mandate.season,
+    date: s.date,
+    status: good ? "trust" : "warning",
+    done: e.done,
+    total: e.total,
+  };
+  b.meetings.push(rec);
+  if (good) {
+    b.confidence = clamp(b.confidence + MID_TRUST.confidence, 0, 100);
+    s.fanSupport = clamp(s.fanSupport + MID_TRUST.fanLift, 0, 100);
+  }
+  message(s, {
+    title: boardTextAr(good ? "midMeetingGoodTitle" : "midMeetingWarnTitle"),
+    body: good
+      ? `${boardTextAr("midMeetingGoodBody")} (${num(e.done)}/${num(e.total)})`
+      : `${boardTextAr("midMeetingWarnBody")} (${num(e.done)}/${num(e.total)} · ${mandate.endDate})`,
+    category: BOARD_CATEGORY,
+    kind: good ? "board-mid" : "board-warning",
+    ref: mandate.id,
+    deadline: good ? null : mandate.endDate,
+    priority: good ? "normal" : "high",
+  });
+  return rec;
+}
+
+// ── سلم العواقب (متدرج، ومحدود بسقف لا يمس الملكية) ─────────────────────────
+export function ladderFor(streak) {
+  return CONSEQUENCE_LADDER[clamp(streak, 1, MAX_LADDER_TIER) - 1];
+}
+function withdrawSponsor(s, reason) {
+  const active = s.sponsors.filter((c) => c.status === "active");
+  if (!active.length) return null;
+  const pick = [...active].sort((a, b) =>
+    a.end === b.end ? a.id.localeCompare(b.id) : a.end < b.end ? -1 : 1,
+  )[0];
+  pick.status = "expired";
+  pick.end = s.date < pick.start ? pick.start : s.date;
+  // الدفعات المتبقية تسقط مع الانسحاب: لا دخل مقابل لا ظهور.
+  s.finance.obligations = s.finance.obligations.filter(
+    (o) => !(o.ref === pick.id && o.status === "pending"),
+  );
+  return pick;
+}
+function cutWageBudget(s, share) {
+  const before = s.finance.wageBudget;
+  s.finance.wageBudget = Math.max(
+    MIN_WAGE_BUDGET,
+    Math.round(s.finance.wageBudget * (1 - share)),
+  );
+  s.board.wageFactor =
+    Math.round((s.board.wageFactor || 1) * (1 - share) * 1000) / 1000;
+  return before - s.finance.wageBudget;
+}
+
+// ── التصويت النهائي: مكافآت أو عواقب متدرجة، ثم لائحة جديدة ─────────────────
+export function endSeasonBoardReview(s) {
+  const b = ensureBoard(s);
+  const mandate = b.mandate;
+  if (!mandate || mandate.review.end) return null;
+  const e = evaluateMandate(s, mandate);
+  const effects = [];
+  let tier = 0;
+
+  if (e.status === "passed") {
+    b.successStreak += 1;
+    b.failureStreak = 0;
+    b.confidence = clamp(b.confidence + REWARDS.confidence, 0, 100);
+    const amount = Math.round(s.finance.wageBudget * REWARDS.cashShare);
+    const key = `board-support-s${mandate.season}`;
+    if (post(s, amount, "board-support", boardTextAr("mandateIssuedTitle"), key)) {
+      effects.push({ kind: "investors", amount });
+    }
+    b.pendingBoost = REWARDS.boost;
+    effects.push({ kind: "budget", share: REWARDS.boost });
+    s.fanSupport = clamp(s.fanSupport + REWARDS.fanLift, 0, 100);
+    effects.push({ kind: "fans", amount: REWARDS.fanLift });
+    s.reputation = clamp(s.reputation + REWARDS.repLift, 0, 99);
+  } else if (e.status === "partial") {
+    b.failureStreak = 0;
+    b.successStreak = 0;
+    b.confidence = clamp(b.confidence - PARTIAL_PENALTY.confidence, 0, 100);
+    effects.push({ kind: "final-warning" });
+  } else {
+    b.failureStreak += 1;
+    b.successStreak = 0;
+    tier = clamp(b.failureStreak, 1, MAX_LADDER_TIER);
+    const step = ladderFor(b.failureStreak);
+    b.confidence = clamp(b.confidence - 10 - tier * 3, 0, 100);
+    const cut = cutWageBudget(s, step.wageCut);
+    effects.push({ kind: "budget-cut", share: step.wageCut, amount: cut });
+    b.freezeUntil = addDays(s.date, step.freezeDays);
+    effects.push({ kind: "freeze", until: b.freezeUntil, days: step.freezeDays });
+    let out = 0;
+    for (let i = 0; i < step.sponsorsOut; i++)
+      if (withdrawSponsor(s, "board")) out++;
+    if (out) effects.push({ kind: "sponsor-out", count: out });
+    const before = s.fanSupport;
+    s.fanSupport = clamp(s.fanSupport - step.fanDrop, 0, 100);
+    effects.push({ kind: "protest", amount: before - s.fanSupport });
+    s.reputation = clamp(s.reputation - step.repDrop, 0, 99);
+    // إعادة البناء: لائحة الموسم القادم أخف، ولا تصعيد بعد السقف.
+    b.nextRebuild = true;
+  }
+
+  mandate.review.end = {
+    date: s.date,
+    status: e.status,
+    score: Number(e.score.toFixed(3)),
+    done: e.done,
+    total: e.total,
+  };
+  const rec = {
+    season: mandate.season,
+    date: s.date,
+    status: e.status,
+    done: e.done,
+    total: e.total,
+    tier,
+    size: mandate.size,
+    ambition: mandate.ambition,
+    effects,
+  };
+  b.history.push(rec);
+  if (b.history.length > MAX_HISTORY) b.history = b.history.slice(-MAX_HISTORY);
+  b.meetings.push({
+    id: uid(s, "meet"),
+    kind: "end",
+    season: mandate.season,
+    date: s.date,
+    status: e.status,
+    done: e.done,
+    total: e.total,
+  });
+  b.mandate = null;
+  message(s, {
+    title: boardTextAr(
+      e.status === "passed"
+        ? "endMeetingPassedTitle"
+        : e.status === "partial"
+          ? "endMeetingPartialTitle"
+          : "endMeetingFailedTitle",
+    ),
+    body: endVoteBody(s, e, effects),
+    category: BOARD_CATEGORY,
+    kind: "board-vote",
+    ref: mandate.id,
+    priority: e.status === "failed" ? "high" : "normal",
+  });
+  return rec;
+}
+// نص التصويت: عربي داخل الحفظة (تُترجمه طبقة العرض)، والأرقام وحدها لاتينية.
+function endVoteBody(s, e, effects) {
+  // الذيل أرقام/تواريخ لاتينية فقط: النص العربي كله عبارة واحدة من القاموس
+  // فيُترجم كاملًا، وتفاصيل العواقب بالأرقام تُعرض في شاشة الجمعية العمومية.
+  const counts = `(${num(e.done)}/${num(e.total)})`;
+  if (e.status === "passed")
+    return `${boardTextAr("endMeetingPassedBody")} ${counts}`;
+  if (e.status === "partial")
+    return `${boardTextAr("endMeetingPartialBody")} ${counts}`;
+  return `${boardTextAr("endMeetingFailedBody")} ${counts}`;
+}
+
+// ── وصف العاقبة/المكافأة (يستخدمه البريد وشاشة اللائحة) ─────────────────────
+export function effectText(s, effect) {
+  switch (effect.kind) {
+    case "investors":
+      return boardTextAr("cRewardInvestors", { money: money(effect.amount) });
+    case "budget":
+      return boardTextAr("cRewardBudget", { n: num(Math.round(effect.share * 100)) });
+    case "fans":
+      return boardTextAr("cRewardFans", { n: num(effect.amount) });
+    case "budget-cut":
+      return boardTextAr("cBudgetCut", { n: num(Math.round(effect.share * 100)) });
+    case "freeze":
+      return boardTextAr("cFreeze", { d: effect.until });
+    case "sponsor-out":
+      return boardTextAr("cSponsorOut");
+    case "protest":
+      return boardTextAr("cProtest", { n: num(Math.abs(effect.amount)) });
+    default:
+      return "";
+  }
+}
+
+// ── نداء اليوم: مراجعة المنتصف مرة واحدة عند حلول موعدها ────────────────────
+export function boardDay(s) {
+  const mandate = activeMandate(s);
+  if (!mandate || mandate.review.mid || mandate.review.end) return null;
+  if (s.date < mandate.midDate) return null;
+  if (s.date >= mandate.endDate) return null; // التصويت النهائي يتولاه انتقال الموسم
+  return midSeasonReview(s, mandate);
+}
+
+// ── قيود التعاقدات الناتجة عن الإخفاق المالي ────────────────────────────────
+export const transferFrozen = (s) =>
+  Boolean(s.board?.freezeUntil && s.board.freezeUntil >= s.date);
+export function assertTransfersAllowed(s) {
+  if (transferFrozen(s))
+    throw new Error(boardTextAr("freezeBlocked", { d: s.board.freezeUntil }));
+}
+export const freezeBadgeText = (s) =>
+  transferFrozen(s) ? boardTextAr("freezeBadge", { d: s.board.freezeUntil }) : "";
diff --git a/clubowner/src/services/pyramid.js b/clubowner/src/services/pyramid.js
index 2a6736f..4b61cef 100644
--- a/clubowner/src/services/pyramid.js
+++ b/clubowner/src/services/pyramid.js
@@ -40,6 +40,7 @@ import { post } from "./finance.js";
 import { message } from "./inbox.js";
 import { initCommerce } from "./commerce.js";
 import { initManagement } from "./clubManagement.js";
+import { endSeasonBoardReview, startSeasonMandate } from "./boardMandate.js";
 const EUROPE = [
   "en",
   "es",
@@ -503,6 +504,8 @@ function rollover(s) {
       (x.playoffs.length !== 2 || x.playoffs.some((p) => !p.winners.length)))
   )
     return;
+  // 0.26: تصويت الجمعية العمومية على الموسم المنتهي قبل أي أرشفة أو ترقية.
+  endSeasonBoardReview(s);
   const own = ownDivision(s),
     rank = standings(own).findIndex((t) => t.clubId === s.clubId) + 1;
   for (const p of s.press.promises.filter((p) => !p.resolved)) {
@@ -583,6 +586,8 @@ function rollover(s) {
   s.table = next.table;
   s.fixtures = next.fixtures;
   s.nextSeasonDate = addDays(s.date, 365);
+  // لائحة الموسم الجديد بعد بناء الجداول الجديدة (تاريخ المنتصف يُحسب منها).
+  startSeasonMandate(s);
   s.commerce.seasonTickets = 0;
   s.management.lineup = [];
   // Academy graduates keep identities throughout subsequent seasons; only new intake is generated.
diff --git a/clubowner/src/services/season.js b/clubowner/src/services/season.js
index f1f0d52..c2fcaa2 100644
--- a/clubowner/src/services/season.js
+++ b/clubowner/src/services/season.js
@@ -2,6 +2,7 @@ import { fixtures, sortedTable } from "./matches.js";
 import { CLUBS } from "../data/catalog.js";
 import { message } from "./inbox.js";
 import { SEASON_STAT_KEYS, initSeasonStats } from "./seasonStats.js";
+import { endSeasonBoardReview, startSeasonMandate } from "./boardMandate.js";

 // Save each player's season stats to the history entry before resetting.
 function archiveSeasonStats(s, entry) {
@@ -29,6 +30,8 @@ function resetSeasonStats(s) {

 export function seasonDay(s) {
   if (s.date < s.nextSeasonDate || s.fixtures.some((f) => !f.played)) return;
+  // 0.26: تصويت الجمعية العمومية على موسم انتهى لتوه، قبل أرشفته وقبل تصفير الإحصاءات.
+  endSeasonBoardReview(s);
   const entry = {
     number: s.seasonNumber,
     date: s.date,
@@ -58,4 +61,6 @@ export function seasonDay(s) {
     body: "تم أرشفة الترتيب السابق وإنشاء ١٤ جولة جديدة للدوري التجريبي. اللاعبون والعقود والمنشآت يستمرون؛ لا يوجد صعود أو هبوط في هذه النسخة.",
     category: "matches",
   });
+  // لائحة الموسم الجديد تُصدر الآن (وبعد انتهاء التصويت على الموسم الماضي).
+  startSeasonMandate(s);
 }
diff --git a/clubowner/src/services/time.js b/clubowner/src/services/time.js
index 6e175c3..994271f 100644
--- a/clubowner/src/services/time.js
+++ b/clubowner/src/services/time.js
@@ -15,6 +15,7 @@ import { agingDay, retirementDay } from "./careers.js";
 import { staffDay } from "./staff.js";
 import { clubEventDay, flavorEventDay } from "./clubEvents.js";
 import { seasonDay } from "./season.js";
+import { boardDay } from "./boardMandate.js";
 import { addDays } from "../core/utils.js";
 import { message, pendingActions } from "./inbox.js";
 import { financeDay } from "./finance.js";
@@ -77,6 +78,7 @@ export function advanceTime(s, days = null) {
     agingDay(s);
     retirementDay(s);
     staffDay(s);
+    boardDay(s);
     if (!s.expansion) seasonDay(s);
     internationalDay(s);
     contractDay(s);
diff --git a/clubowner/src/services/transfers.js b/clubowner/src/services/transfers.js
index 98696c6..d1b503f 100644
--- a/clubowner/src/services/transfers.js
+++ b/clubowner/src/services/transfers.js
@@ -5,7 +5,9 @@ import { normalizeClauses, guaranteedWages } from "./contractClauses.js";
 import { assert, uid, addDays } from "../core/utils.js";
 import { message, closeThread } from "./inbox.js";
 import { post, obligation, wages } from "./finance.js";
+import { assertTransfersAllowed } from "./boardMandate.js";
 export function submitOffer(s, playerId, terms) {
+  assertTransfersAllowed(s);
   const p = s.players.find((p) => p.id === playerId);
   assertMarket(s, p);
   assert(!p?.loan, "اللاعب مُعار؛ لا يمكن شراء عقده في هذا النموذج.");
@@ -112,6 +114,7 @@ export function rejectNegotiation(s, id) {
   closeThread(s, id);
 }
 export function signPlayer(s, id, terms) {
+  assertTransfersAllowed(s);
   const n = s.negotiations.find((x) => x.id === id);
   assert(n && n.stage === "personal", "ابدأ باتفاق مع النادي أولًا.");
   const p = s.players.find((x) => x.id === n.playerId);
diff --git a/clubowner/src/styles/features.css b/clubowner/src/styles/features.css
index aaab8c1..dab102e 100644
--- a/clubowner/src/styles/features.css
+++ b/clubowner/src/styles/features.css
@@ -2467,3 +2467,84 @@ button.badge.vault-key:focus-visible {
 body.reduce-motion .hl-card.hl-enter { animation: none !important; }
 body.reduce-motion .hl-backdrop { animation: none !important; }
 body.reduce-motion .hl-progress span { transition: none !important; }
+
+/* ── 0.26: لائحة الجمعية العمومية ─────────────────────────────────────────── */
+.board-layout {
+  display: grid;
+  gap: 14px;
+  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
+}
+.board-axis .panel-head,
+.board-meetings .panel-head,
+.board-history .panel-head {
+  margin-bottom: 10px;
+}
+.board-items {
+  display: flex;
+  flex-direction: column;
+  gap: 12px;
+}
+.board-item {
+  border: 1px solid var(--line, #223046);
+  border-radius: 12px;
+  padding: 10px 12px;
+  background: var(--surface-2, rgba(255, 255, 255, 0.02));
+}
+.board-item.done {
+  border-color: color-mix(in srgb, var(--green, #35c46a) 45%, transparent);
+}
+.board-item-top {
+  display: flex;
+  align-items: flex-start;
+  justify-content: space-between;
+  gap: 10px;
+  margin-bottom: 8px;
+}
+.board-item-top strong {
+  font-size: 0.92rem;
+  line-height: 1.5;
+}
+.board-item-chips {
+  display: flex;
+  gap: 6px;
+  flex-wrap: wrap;
+  justify-content: flex-end;
+}
+.board-item-meta {
+  display: flex;
+  justify-content: space-between;
+  gap: 10px;
+  margin-top: 6px;
+  opacity: 0.75;
+}
+.board-history-rows {
+  display: flex;
+  flex-direction: column;
+  gap: 10px;
+}
+.board-history-row {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  gap: 12px;
+  flex-wrap: wrap;
+  padding: 8px 10px;
+  border-radius: 10px;
+  background: var(--surface-2, rgba(255, 255, 255, 0.02));
+}
+.board-history-row small,
+.board-history-effects {
+  display: block;
+  opacity: 0.78;
+  font-size: 0.78rem;
+}
+.board-history-effects {
+  flex: 1;
+  min-width: 160px;
+}
+.board-card .onboarding-progress-track {
+  margin-bottom: 10px;
+}
+.desk-item.static {
+  cursor: default;
+}
diff --git a/clubowner/src/ui/format.js b/clubowner/src/ui/format.js
index 0299e0e..c23a71e 100644
--- a/clubowner/src/ui/format.js
+++ b/clubowner/src/ui/format.js
@@ -105,4 +105,5 @@ export const category = (c) =>
     careers: "الجهاز الفني والمسيرة",
     events: "أحداث النادي",
     vault: "الخزنة السرية",
+    board: "الجمعية العمومية",
   })[c] || c;
diff --git a/clubowner/tests/asia-v011.test.js b/clubowner/tests/asia-v011.test.js
index 27afd47..b168d3c 100644
--- a/clubowner/tests/asia-v011.test.js
+++ b/clubowner/tests/asia-v011.test.js
@@ -33,6 +33,7 @@ import {
   restGap,
 } from "../src/services/calendar.js";
 import { random } from "../src/core/utils.js";
+import { SAVE_VERSION } from "../src/core/game.js";
 const game = () =>
   createGame({
     database: "world",
@@ -319,7 +320,7 @@ test("v10 migration preserves current cups and activates no new Asia mid-season"
     (c) => c.engine !== "asia-v1" && c.engine !== "concacaf-v1",
   );
   const migrated = migrateSave(s);
-  assert.equal(migrated.version, 20);
+  assert.equal(migrated.version, SAVE_VERSION);
   assert.equal(migrated.expansion.asiaVersion, 0);
   assert.equal(migrated.expansion.concacafVersion, 0);
   assert.deepEqual(migrated.expansion.cups, s.expansion.cups);
diff --git a/clubowner/tests/board-mandate.test.js b/clubowner/tests/board-mandate.test.js
new file mode 100644
index 0000000..89a2c3e
--- /dev/null
+++ b/clubowner/tests/board-mandate.test.js
@@ -0,0 +1,662 @@
+// اختبارات «لائحة الجمعية العمومية 0.26» — المرحلة السادسة من تحديث الدراما.
+//
+// ما يُثبته هذا الملف:
+//   ١) توليد اللائحة: ثلاثة محاور دائمًا، والأهداف تتصاعد مع حجم النادي وطموحه،
+//      والبنود المشروطة (كأس/قاري/بيع لاعب/تعاقد شاب) لا تظهر إلا حين تكون مناسبة وقابلة للقياس.
+//   ٢) التتبع الحي: كل بند من الأنواع العشرة يُقاس من الحفظة نفسها ويتحول إلى «محقق» عند بلوغ هدفه.
+//   ٣) الاجتماعان: مراجعة المنتصف (ثقة أو إنذار أصفر رسمي بمهلة) والتصويت النهائي.
+//   ٤) سلم العواقب: مكافآت حقيقية عند التنفيذ الكامل، وتحذير نهائي عند الإخفاق الجزئي،
+//      وعواقب متدرجة (ميزانية/تجميد/راعٍ/احتجاج) عند الإخفاق الكبير — بسقف ثابت لا يتجاوزه.
+//   ٥) قيد اللعبة الصارم: المالك لا يُقال — لا مسار واحد ينهي المسيرة مهما تكرر الإخفاق.
+//   ٦) الربط بالقائم: التجميد يمنع التعاقدات ولا يمنع البيع، والبريد والحفظة يبقيان سليمين.
+import test from "node:test";
+import assert from "node:assert/strict";
+import { createGame } from "../src/core/game.js";
+import { validateSave } from "../src/core/validation.js";
+import { migrateSave } from "../src/core/migrations.js";
+import { addDays } from "../src/core/utils.js";
+import { post } from "../src/services/finance.js";
+import { pendingActions } from "../src/services/inbox.js";
+import { submitOffer, signPlayer } from "../src/services/transfers.js";
+import { answerBid } from "../src/services/clubManagement.js";
+import {
+  CLUB_SIZES,
+  ITEM_KINDS,
+  buildMandate,
+  sizeOf,
+  stepDown,
+} from "../src/data/boardMandates.js";
+import { BOARD_TEXTS } from "../src/data/boardTexts.js";
+import {
+  MAX_LADDER_TIER,
+  seasonNet,
+  MIN_WAGE_BUDGET,
+  activeMandate,
+  assertTransfersAllowed,
+  boardDay,
+  endSeasonBoardReview,
+  evaluateMandate,
+  freezeBadgeText,
+  initBoard,
+  ladderFor,
+  midSeasonReview,
+  startSeasonMandate,
+  transferFrozen,
+} from "../src/services/boardMandate.js";
+import { getLanguage, setLanguage, translateText } from "../src/i18n/index.js";
+
+const ARABIC = /[ء-ي]/;
+const demo = (clubId = "masry") => createGame({ clubId, database: "demo" });
+const world = (clubId = "ahly") => createGame({ clubId, database: "world", expanded: true, leagues: ["eg"] });
+// الرصيد وكشف الحساب متطابقان دائمًا (initialCash + Σ ledger === cash).
+let seq = 0;
+const setCash = (s, amount) => {
+  const delta = amount - s.finance.cash;
+  if (delta)
+    post(s, delta, "operations", "تسوية اختبارية", `test-cash-${++seq}`);
+  return s;
+};
+const spend = (s, amount) =>
+  post(s, -amount, "operations", "مصروف اختباري", `test-spend-${++seq}`);
+const earn = (s, amount, category = "operations", key = `test-earn-${++seq}`) =>
+  post(s, amount, category, "دخل اختباري", key);
+
+// ── أدوات بناء الحالات ──────────────────────────────────────────────────────
+const itemOf = (mandate, id) => mandate.items.find((it) => it.id === id);
+const progressOf = (s, mandate, id) =>
+  evaluateMandate(s, mandate).items.find((it) => it.id === id);
+const rankFirst = (s, first = true) => {
+  for (const row of s.table) row.points = row.clubId === s.clubId ? (first ? 40 : 1) : first ? 1 : 40;
+  return s;
+};
+const growYouth = (s, minutes) => {
+  const young = s.players.filter(
+    (p) => p.clubId === s.clubId && p.status !== "retired" && p.age <= 21,
+  );
+  if (!young.length) return null;
+  young[0].seasonMinutes = minutes;
+  return young[0];
+};
+const buildFacility = (s) => {
+  s.facilities[0].level += 1;
+  return s.facilities[0];
+};
+const signYoungSigning = (s) => {
+  const template = s.players.find((p) => p.clubId === s.clubId);
+  s.players.push({
+    ...structuredClone(template),
+    id: "test-young-signing",
+    name: "ناشئ متعاقد",
+    clubId: s.clubId,
+    age: 19,
+    status: "active",
+  });
+};
+// يُحقق كل بنود اللائحة القابلة للتحقيق في هذه الحفظة.
+const satisfyAll = (s, mandate) => {
+  rankFirst(s);
+  for (const item of mandate.items) {
+    if (item.kind === "player-sale") earn(s, item.target, "player-sale", "test-sale");
+    if (item.kind === "youth-minutes") growYouth(s, item.target);
+    if (item.kind === "facility-project") buildFacility(s);
+    if (item.kind === "young-signing") signYoungSigning(s);
+    if (item.kind === "cup-ties" || item.kind === "continental-stage") {
+      const cup = s.expansion.cups.find((c) =>
+        item.kind === "cup-ties"
+          ? String(c.id).startsWith("cup-") && c.entrants?.includes(s.clubId)
+          : !String(c.id).startsWith("cup-") &&
+            !String(c.id).startsWith("super-") &&
+            c.entrants?.includes(s.clubId),
+      );
+      const rival = s.table.find((t) => t.clubId !== s.clubId).clubId;
+      for (let i = 0; i < item.target; i++)
+        cup.ties.push({
+          id: `test-tie-${i}`,
+          a: s.clubId,
+          b: rival,
+          winner: s.clubId,
+          round: i,
+          stage: "r16",
+        });
+    }
+  }
+  return s;
+};
+const failAll = (s) => {
+  rankFirst(s, false);
+  setCash(s, 0);
+  spend(s, 5000000);
+  return s;
+};
+// يكسر بند سقف العجز وحده: يصرف حتى يتجاوز الهدف مهما كان صافي الموسم الجاري.
+const breakDeficit = (s, mandate) => {
+  const cap = itemOf(mandate, "deficit-cap").target;
+  const net = seasonNet(s, mandate.startDate);
+  return spend(s, Math.max(0, net) + cap + 1000);
+};
+
+// ═══ ١) التوليد حسب حجم النادي وطموحه ═══════════════════════════════════════
+test("حجم النادي مشتق من السمعة ويتدرج بالترتيب", () => {
+  assert.equal(sizeOf(40), "small");
+  assert.equal(sizeOf(CLUB_SIZES.medium.minRep), "medium");
+  assert.equal(sizeOf(CLUB_SIZES.large.minRep), "large");
+  assert.equal(sizeOf(CLUB_SIZES.giant.minRep), "giant");
+  assert.equal(sizeOf(99), "giant");
+  // الطموح ينزل درجة بعد الإخفاق ولا يخرج من السلم.
+  assert.equal(stepDown("elite"), "ambitious");
+  assert.equal(stepDown("ambitious"), "stable");
+  assert.equal(stepDown("stable"), "survival");
+  assert.equal(stepDown("survival"), "rebuild");
+});
+
+test("كل لائحة تحمل المحاور الثلاثة وبنودًا صالحة قابلة للقياس", () => {
+  for (const rep of [40, 60, 74, 90]) {
+    const s = demo();
+    s.reputation = rep;
+    const m = buildMandate(s, {
+      seasonNumber: 1,
+      startDate: s.date,
+      endDate: s.nextSeasonDate,
+      ambition: "stable",
+    });
+    const axes = new Set(m.items.map((it) => it.axis));
+    assert.deepEqual([...axes].sort(), ["development", "financial", "sporting"]);
+    assert.ok(m.items.length >= 5 && m.items.length <= 12);
+    for (const it of m.items) {
+      assert.equal(it.axis, ITEM_KINDS[it.kind].axis);
+      assert.ok(Number.isSafeInteger(it.target) && it.target > 0, it.kind);
+      assert.equal(typeof it.critical, "boolean");
+    }
+    assert.ok(m.startDate <= m.midDate && m.midDate <= m.endDate);
+    assert.ok(m.baseline.youthIds.length >= 0);
+  }
+});
+
+test("النادي الأكبر يُطلب منه ما لا يُطلب من الأصغر (نفس الطموح)", () => {
+  const mandate = (rep) => {
+    const s = demo();
+    s.reputation = rep;
+    return buildMandate(s, {
+      seasonNumber: 1,
+      startDate: s.date,
+      endDate: s.nextSeasonDate,
+      ambition: "stable",
+    });
+  };
+  const small = mandate(40),
+    giant = mandate(90);
+  assert.equal(small.size, "small");
+  assert.equal(giant.size, "giant");
+  assert.ok(
+    itemOf(giant, "league-rank").target < itemOf(small, "league-rank").target,
+    "العملاق مطالب بمركز أعلى",
+  );
+  assert.ok(
+    itemOf(giant, "youth-minutes").target > itemOf(small, "youth-minutes").target,
+    "العملاق مطالب بدقائق ناشئين أكثر",
+  );
+});
+
+test("الطموح الأعلى يشدّ الأهداف ولا يخرج عن حدود الجدول", () => {
+  const at = (ambition) => {
+    const s = demo();
+    s.reputation = 74;
+    return buildMandate(s, {
+      seasonNumber: 1,
+      startDate: s.date,
+      endDate: s.nextSeasonDate,
+      ambition,
+    });
+  };
+  assert.ok(
+    itemOf(at("elite"), "league-rank").target <= itemOf(at("survival"), "league-rank").target,
+  );
+  assert.ok(itemOf(at("elite"), "league-rank").target >= 1);
+  assert.ok(itemOf(at("survival"), "league-rank").target <= 8);
+  assert.ok(itemOf(at("rebuild"), "league-rank").target >= 1);
+});
+
+test("البنود المشروطة تظهر حين تكون قابلة للقياس فقط", () => {
+  const base = demo();
+  const baseMandate = buildMandate(base, {
+    seasonNumber: 1,
+    startDate: base.date,
+    endDate: base.nextSeasonDate,
+    ambition: "stable",
+  });
+  // الوضع التجريبي بلا كؤوس: لا بند كأس ولا بند قاري (لا شيء يُقاس).
+  assert.equal(baseMandate.items.some((it) => it.kind === "cup-ties"), false);
+  assert.equal(baseMandate.items.some((it) => it.kind === "continental-stage"), false);
+  assert.equal(baseMandate.items.some((it) => it.kind === "continental-qualify"), false);
+
+  // الوضع الموسّع: الكأس موجودة، والمشارك قاريًا يُطالب بمواجهة إقصائية.
+  const w = world();
+  const worldMandate = buildMandate(w, {
+    seasonNumber: 1,
+    startDate: w.date,
+    endDate: w.nextSeasonDate,
+    ambition: "ambitious",
+  });
+  assert.ok(worldMandate.items.some((it) => it.kind === "cup-ties"));
+  assert.ok(
+    worldMandate.items.some(
+      (it) => it.kind === "continental-stage" || it.kind === "continental-qualify",
+    ),
+  );
+});
+
+test("التوليد حتمي: نفس الحفظة ونفس الموسم = نفس اللائحة", () => {
+  const options = (s) => ({
+    seasonNumber: 1,
+    startDate: s.date,
+    endDate: s.nextSeasonDate,
+    ambition: "stable",
+  });
+  const a = demo(),
+    b = demo();
+  const m1 = buildMandate(a, options(a)),
+    m2 = buildMandate(b, options(b));
+  assert.deepEqual(
+    m1.items.map((x) => [x.id, x.target]),
+    m2.items.map((x) => [x.id, x.target]),
+  );
+  assert.equal(m1.midDate, m2.midDate);
+  // بيع اللاعب «أحيانًا»: موجود في بعض المواسم لا كلها، وقراره ثابت لا عشوائي.
+  const spread = [1, 2, 3, 4, 5, 6].map((season) =>
+    buildMandate(a, { ...options(a), seasonNumber: season }).items.some(
+      (x) => x.kind === "player-sale",
+    ),
+  );
+  assert.ok(spread.some(Boolean) && spread.some((x) => !x), "البند المشروط يتغير بين المواسم");
+});
+
+// ═══ ٢) التتبع الحي لكل بند ═════════════════════════════════════════════════
+test("بند مركز الدوري يُقاس حيًا من الجدول", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  assert.ok(progressOf(s, m, "league-rank").current > 1);
+  rankFirst(s);
+  const p = progressOf(s, m, "league-rank");
+  assert.equal(p.current, 1);
+  assert.equal(p.done, true);
+  assert.equal(p.ratio, 1);
+});
+
+test("البندان الماليان: سقف العجز والسيولة", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  const cap = itemOf(m, "deficit-cap").target;
+  const floor = itemOf(m, "min-liquidity").target;
+  assert.equal(progressOf(s, m, "deficit-cap").done, true, "البداية بلا عجز");
+  breakDeficit(s, m);
+  assert.equal(progressOf(s, m, "deficit-cap").done, false, "تجاوز سقف العجز");
+  setCash(s, floor - 1);
+  assert.equal(progressOf(s, m, "min-liquidity").done, false);
+  setCash(s, floor + 1);
+  assert.equal(progressOf(s, m, "min-liquidity").done, true);
+});
+
+test("بند بيع اللاعب يُقاس من قيود البيع الفعلية", () => {
+  const s = demo();
+  const m = buildMandate(s, {
+    seasonNumber: 1,
+    startDate: s.date,
+    endDate: s.nextSeasonDate,
+    ambition: "stable",
+  });
+  const sale = {
+    id: "player-sale",
+    kind: "player-sale",
+    axis: "financial",
+    target: 2000000,
+    critical: false,
+  };
+  assert.equal(progressOf(s, { ...m, items: [sale] }, "player-sale").done, false);
+  earn(s, 2000000, "player-sale", "test-sale-ok");
+  assert.equal(progressOf(s, { ...m, items: [sale] }, "player-sale").done, true);
+});
+
+test("دقائق الناشئين ومشروع المنشأة والتعاقد الشاب", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  const minutes = itemOf(m, "youth-minutes").target;
+  assert.equal(progressOf(s, m, "youth-minutes").done, false);
+  growYouth(s, minutes);
+  assert.equal(progressOf(s, m, "youth-minutes").done, true);
+
+  assert.equal(progressOf(s, m, "facility-project").done, false);
+  buildFacility(s);
+  assert.equal(progressOf(s, m, "facility-project").done, true);
+
+  // بند التعاقد الشاب موجود فقط عندما يقل الناشئون عن ثلاثة.
+  const needYouth = buildMandate(s, {
+    seasonNumber: 7,
+    startDate: s.date,
+    endDate: s.nextSeasonDate,
+    ambition: "stable",
+  });
+  if (needYouth.items.some((it) => it.kind === "young-signing")) {
+    assert.equal(progressOf(s, needYouth, "young-signing").done, false);
+    signYoungSigning(s);
+    assert.equal(progressOf(s, needYouth, "young-signing").done, true);
+  }
+});
+
+test("بنود الكأس والقارة تُقاس من مواجهات محسومة لصالحنا", () => {
+  const s = world();
+  const m = buildMandate(s, {
+    seasonNumber: 1,
+    startDate: s.date,
+    endDate: s.nextSeasonDate,
+    ambition: "ambitious",
+  });
+  const rival = s.table.find((t) => t.clubId !== s.clubId).clubId;
+  const domestic = s.expansion.cups.find(
+    (c) => String(c.id).startsWith("cup-") && c.entrants.includes(s.clubId),
+  );
+  const target = itemOf(m, "cup-ties")?.target;
+  assert.ok(domestic && target >= 1);
+  assert.equal(progressOf(s, m, "cup-ties").done, false);
+  domestic.ties.push({
+    id: "t1",
+    a: s.clubId,
+    b: rival,
+    winner: s.clubId,
+    round: 0,
+    stage: "r16",
+  });
+  assert.equal(progressOf(s, m, "cup-ties").done, target <= 1);
+  // خسارة مواجهة لا تُحتسب.
+  domestic.ties.push({
+    id: "t2",
+    a: s.clubId,
+    b: rival,
+    winner: rival,
+    round: 1,
+    stage: "qf",
+  });
+  assert.equal(progressOf(s, m, "cup-ties").current, 1);
+});
+
+// ═══ ٣) اجتماع منتصف الموسم ═════════════════════════════════════════════════
+test("منتصف الموسم: التزام جيد = رسالة ثقة ودفعة جماهيرية بلا توقيف للزمن", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  satisfyAll(s, m);
+  s.date = m.midDate;
+  const beforeFan = s.fanSupport,
+    beforeConfidence = s.board.confidence;
+  const rec = boardDay(s);
+  assert.equal(rec.status, "trust");
+  assert.equal(m.review.mid.good, true);
+  assert.ok(s.fanSupport > beforeFan);
+  assert.ok(s.board.confidence > beforeConfidence);
+  const msg = s.inbox.find((x) => x.kind === "board-mid");
+  assert.ok(msg && msg.required === false, "رسالة الثقة لا توقف الزمن");
+  // مرة واحدة بالضبط، والنداء اليومي بعدها لا يكرر شيئًا.
+  const messages = s.inbox.filter((x) => x.kind.startsWith("board-")).length;
+  assert.equal(boardDay(s), null);
+  assert.equal(s.inbox.filter((x) => x.kind.startsWith("board-")).length, messages);
+  validateSave(s);
+});
+
+test("منتصف الموسم: التأخر = إنذار أصفر رسمي بمهلة حتى التصويت النهائي", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  failAll(s);
+  s.date = m.midDate;
+  const rec = boardDay(s);
+  assert.equal(rec.status, "warning");
+  const msg = s.inbox.find((x) => x.kind === "board-warning");
+  assert.ok(msg, "الإنذار الرسمي يصل بالبريد");
+  assert.equal(msg.deadline, m.endDate);
+  assert.equal(msg.required, false);
+  assert.equal(msg.priority, "high");
+  assert.ok(msg.body.includes(m.endDate), "نص الإنذار يذكر المهلة");
+  validateSave(s);
+});
+
+// ═══ ٤) التصويت النهائي وسلم العواقب ════════════════════════════════════════
+test("التنفيذ الكامل = مكافآت حقيقية: دعم مستثمرين + ميزانية أكبر + حب جماهيري", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  satisfyAll(s, m);
+  const beforeFan = s.fanSupport,
+    beforeConfidence = s.board.confidence,
+    budget = s.finance.wageBudget;
+  assert.equal(evaluateMandate(s, m).status, "passed");
+  const rec = endSeasonBoardReview(s);
+  assert.equal(rec.status, "passed");
+  const support = s.finance.ledger.find((e) => e.category === "board-support");
+  assert.ok(support && support.amount > 0, "دعم مالي حقيقي في الدفاتر");
+  assert.ok(s.board.pendingBoost > 0);
+  assert.ok(s.fanSupport > beforeFan && s.board.confidence > beforeConfidence);
+  assert.equal(s.board.mandate, null, "اللائحة المنتهية تُغلق");
+  // المكافأة تصل عند بداية الموسم القادم: ميزانية تعاقدات أكبر.
+  s.seasonNumber += 1;
+  s.date = addDays(s.date, 1);
+  startSeasonMandate(s);
+  assert.ok(s.finance.wageBudget > budget, "ميزانية الموسم القادم أكبر فعلًا");
+  assert.equal(s.board.pendingBoost, 0);
+  assert.ok(activeMandate(s), "لائحة جديدة صدرت");
+  validateSave(s);
+});
+
+test("الإخفاق الجزئي = تحذير نهائي بلا عقوبات تنفيذية", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  satisfyAll(s, m);
+  // بند حاسم واحد يسقط (سقف العجز) وكل ما عداه محقق → جزئي لا كبير.
+  breakDeficit(s, m);
+  const e = evaluateMandate(s, m);
+  assert.equal(e.status, "partial");
+  const beforeBudget = s.finance.wageBudget,
+    beforeFan = s.fanSupport;
+  const rec = endSeasonBoardReview(s);
+  assert.equal(rec.status, "partial");
+  assert.equal(s.finance.wageBudget, beforeBudget, "لا تقليص في الإخفاق الجزئي");
+  assert.equal(s.board.freezeUntil, null, "لا تجميد في الإخفاق الجزئي");
+  assert.equal(s.fanSupport, beforeFan);
+  assert.equal(s.board.failureStreak, 0);
+  const msg = s.inbox.find((x) => x.kind === "board-vote");
+  assert.ok(msg && msg.required === false);
+  validateSave(s);
+});
+
+test("سلم العواقب يتدرج ثم يتوقف عند سقفه ولا يتجاوزه أبدًا", () => {
+  assert.equal(ladderFor(1).tier, 1);
+  assert.equal(ladderFor(2).tier, 2);
+  assert.equal(ladderFor(3).tier, 3);
+  assert.equal(ladderFor(9).tier, MAX_LADDER_TIER, "لا درجة رابعة مهما تكرر الإخفاق");
+  assert.ok(ladderFor(9).wageCut <= 0.25);
+});
+
+test("الإخفاق الكبير: تقليص ميزانية + تجميد تعاقدات + احتجاج جماهيري", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  failAll(s);
+  assert.equal(evaluateMandate(s, m).status, "failed");
+  const budget = s.finance.wageBudget,
+    fan = s.fanSupport;
+  const rec = endSeasonBoardReview(s);
+  assert.equal(rec.status, "failed");
+  assert.equal(rec.tier, 1);
+  assert.ok(s.finance.wageBudget < budget, "تقليص ميزانية المرتبات");
+  assert.ok(s.finance.wageBudget >= MIN_WAGE_BUDGET);
+  assert.equal(s.board.freezeUntil, addDays(s.date, 60));
+  assert.ok(s.fanSupport < fan, "احتجاج جماهيري");
+  assert.equal(s.board.failureStreak, 1);
+  assert.equal(s.board.nextRebuild, true, "الموسم القادم إعادة بناء");
+  assert.ok(rec.effects.some((x) => x.kind === "freeze"));
+  assert.ok(rec.effects.some((x) => x.kind === "protest"));
+  validateSave(s);
+});
+
+test("الدرجة الثانية تسحب راعيًا وتُلغي دفعاته المتبقية", () => {
+  const s = demo();
+  const mandate = activeMandate(s);
+  assert.ok(s.sponsors.length > 0, "البداية بعقد رعاية");
+  const contract = s.sponsors.find((c) => c.status === "active");
+  const pendingBefore = s.finance.obligations.filter(
+    (o) => o.ref === contract.id && o.status === "pending",
+  ).length;
+  assert.ok(pendingBefore > 0);
+  failAll(s);
+  breakDeficit(s, mandate);
+  s.board.failureStreak = 1; // إخفاق سابق ⇒ هذه الدرجة الثانية
+  const rec = endSeasonBoardReview(s);
+  assert.equal(rec.tier, 2);
+  assert.ok(rec.effects.some((x) => x.kind === "sponsor-out"), "انسحاب راعٍ");
+  assert.equal(contract.status, "expired");
+  assert.equal(
+    s.finance.obligations.filter((o) => o.ref === contract.id && o.status === "pending").length,
+    0,
+    "لا دخل مقابل لا ظهور",
+  );
+  validateSave(s);
+});
+
+test("التجميد يمنع فتح التعاقدات ولا يمنع بيع لاعبك", () => {
+  const s = world();
+  const m = activeMandate(s);
+  failAll(s);
+  endSeasonBoardReview(s);
+  assert.equal(transferFrozen(s), true);
+  assert.equal(freezeBadgeText(s).length > 0, true);
+  assert.throws(() => assertTransfersAllowed(s), /تجميد/);
+  const target = s.players.find((p) => p.clubId !== s.clubId && p.status !== "retired");
+  assert.throws(() => submitOffer(s, target.id, { fee: 100000, upfrontPercent: 40 }), /تجميد/);
+  // البيع مسموح: هو أداة النادي للخروج من الأزمة المالية.
+  const mine = s.players.find((p) => p.clubId === s.clubId && p.status !== "retired");
+  s.management.outgoing.push({
+    id: "bid-test",
+    playerId: mine.id,
+    buyer: s.table.find((t) => t.clubId !== s.clubId).clubId,
+    fee: 2000000,
+    expires: addDays(s.date, 7),
+    status: "open",
+  });
+  answerBid(s, "bid-test", true);
+  assert.equal(mine.clubId !== s.clubId, true, "البيع أُنجز أثناء التجميد");
+  assert.ok(s.finance.ledger.some((e) => e.category === "player-sale"));
+  // بانتهاء المهلة يعود السوق طبيعيًا.
+  s.date = addDays(s.board.freezeUntil, 1);
+  assert.equal(transferFrozen(s), false);
+  assert.doesNotThrow(() => assertTransfersAllowed(s));
+  assert.ok(m);
+});
+
+// ═══ ٥) قيد اللعبة: المالك لا يُقال ═════════════════════════════════════════
+test("خمسة مواسم إخفاق متتالية: لا إنهاء للمسيرة ولا مسّ بالملكية", () => {
+  const s = demo();
+  const owner = s.owner,
+    clubId = s.clubId;
+  for (let season = 1; season <= 5; season++) {
+    const m = activeMandate(s);
+    assert.ok(m, `لائحة الموسم ${season} صدرت`);
+    failAll(s);
+    s.date = addDays(s.date, 1);
+    const rec = endSeasonBoardReview(s);
+    assert.equal(rec.status, "failed");
+    assert.ok(rec.tier <= MAX_LADDER_TIER);
+    assert.ok(s.finance.wageBudget >= MIN_WAGE_BUDGET, "الميزانية لا تنزل عن الحد الأدنى");
+    assert.ok(s.board.confidence >= 0);
+    // لائحة جديدة تُصدر دائمًا مع الموسم الجديد: لا موت إداري.
+    s.seasonNumber += 1;
+    const next = startSeasonMandate(s);
+    assert.ok(next && next.items.length >= 5);
+    assert.equal(next.ambition, "rebuild", "اللائحة القادمة إعادة بناء لا تصعيد");
+  }
+  assert.equal(s.owner, owner, "المالك كما هو");
+  assert.equal(s.clubId, clubId, "النادي كما هو");
+  assert.equal(s.gameOver, undefined);
+  assert.equal(s.fired, undefined);
+  assert.ok(s.table.some((t) => t.clubId === clubId), "النادي ما زال في الجدول");
+  assert.ok(s.players.some((p) => p.clubId === clubId), "الفريق ما زال موجودًا");
+  assert.equal(pendingActions(s).filter((m) => m.required).length, 0);
+  validateSave(s);
+});
+
+// ═══ ٦) الحفظة والترحيل والتحقق ═════════════════════════════════════════════
+test("حفظة 0.25 (النسخة 20) تُرحَّل إلى 21 بحالة مجلس سليمة", () => {
+  const old = demo();
+  old.version = 20;
+  delete old.board;
+  const migrated = migrateSave(old);
+  assert.equal(migrated.version, 21);
+  assert.ok(migrated.board && migrated.board.schema === 1);
+  assert.equal(migrated.board.confidence, 60);
+  assert.equal(migrated.board.mandate, null);
+  assert.equal(migrated.board.freezeUntil, null);
+  assert.match(migrated.migrationNote || "", /الجمعية العمومية 0.26/);
+  validateSave(migrated);
+});
+
+test("التحقق يرفض مجلسًا معدّلًا يدويًا خارج الحدود", () => {
+  const bad = demo();
+  bad.board.confidence = 150;
+  assert.throws(() => validateSave(bad), /الجمعية العمومية/);
+
+  const badTier = demo();
+  badTier.board.history.push({
+    season: 1,
+    date: badTier.date,
+    status: "failed",
+    done: 0,
+    total: 5,
+    tier: MAX_LADDER_TIER + 1,
+    effects: [],
+  });
+  assert.throws(() => validateSave(badTier), /سجل لائحة/);
+
+  const badItem = demo();
+  badItem.board.mandate.items[0].kind = "league-rank";
+  badItem.board.mandate.items[0].axis = "financial";
+  assert.throws(() => validateSave(badItem), /لائحة الجمعية العمومية/);
+
+  const noBoard = demo();
+  delete noBoard.board;
+  assert.throws(() => validateSave(noBoard), /الجمعية العمومية/);
+});
+
+test("تهيئة المجلس تحفظ الشكل الكامل وتُصدر لائحة الموسم الأول", () => {
+  const s = demo();
+  initBoard(s);
+  assert.equal(s.board.schema, 1);
+  assert.deepEqual(s.board.history, []);
+  assert.equal(s.board.mandate, null);
+  const m = startSeasonMandate(s);
+  assert.ok(m && m.season === s.seasonNumber);
+  assert.equal(s.board.mandate.id, m.id);
+  assert.ok(s.inbox.some((x) => x.kind === "board-mandate"));
+  validateSave(s);
+});
+
+test("بداية موسم جديد لا تُصدر لائحة ثانية فوق القائمة", () => {
+  const s = demo();
+  const m = activeMandate(s);
+  const again = startSeasonMandate(s);
+  assert.equal(again.id, m.id, "نفس اللائحة القائمة");
+});
+
+// ═══ ٧) ثلاث لغات ═══════════════════════════════════════════════════════════
+test("كل نصوص اللائحة لها إنجليزي وفرنسي بلا بقايا عربية", () => {
+  const previous = getLanguage();
+  try {
+    const arabic = Object.values(BOARD_TEXTS).map((t) => t.ar);
+    assert.ok(arabic.length >= 80);
+    for (const code of ["en", "fr"]) {
+      setLanguage(code);
+      for (const [key, entry] of Object.entries(BOARD_TEXTS)) {
+        assert.ok(entry.ar && entry.en && entry.fr, `${key} ناقص لغة`);
+        const translated = translateText(entry.ar);
+        assert.ok(
+          !ARABIC.test(translated),
+          `${key} (${code}) ما زال عربيًا: ${translated}`,
+        );
+      }
+    }
+  } finally {
+    setLanguage(previous);
+  }
+});
diff --git a/clubowner/tests/capacity-v020.test.js b/clubowner/tests/capacity-v020.test.js
index d232c49..5789190 100644
--- a/clubowner/tests/capacity-v020.test.js
+++ b/clubowner/tests/capacity-v020.test.js
@@ -157,7 +157,7 @@ test("0.20 ownFixtures matches a filter over allFixtures and clubPowers matches
 });

 test("0.20 new saves are v18 with an empty retiree archive; world-pack players carry no provenance copies", () => {
-  assert.equal(SAVE_VERSION, 20);
+  assert.equal(SAVE_VERSION, 21);
   const s = game();
   assert.deepEqual(s.retired, []);
   validateSave(s);
@@ -360,7 +360,7 @@ test("0.20 v17 saves migrate: retirees archived, provenance stripped, history ca
     });
   const size17 = JSON.stringify(v17).length;
   const m = migrateSave(v17);
-  assert.equal(m.version, 20);
+  assert.equal(m.version, SAVE_VERSION);
   assert.ok(m.migrationNote.includes("0.20"));
   assert.equal(m.retired.length, 6);
   assert.ok(!m.players.some((p) => p.status === "retired"));
diff --git a/clubowner/tests/careers.test.js b/clubowner/tests/careers.test.js
index d5b9e5b..84e7992 100644
--- a/clubowner/tests/careers.test.js
+++ b/clubowner/tests/careers.test.js
@@ -37,6 +37,7 @@ import {
 } from "../src/services/contractClauses.js";
 import { matchDay } from "../src/services/matches.js";
 import { seasonDay } from "../src/services/season.js";
+import { SAVE_VERSION } from "../src/core/game.js";
 function retiredCandidate(s) {
   const p = s.players.find((p) => p.clubId === s.clubId);
   p.careerInterest = 0;
@@ -337,7 +338,7 @@ test("v1 migration preserves identities, cash and historical dates; invalid clau
   }
   const migrated = migrateSave(original);
   assert.equal(original.version, 1);
-  assert.equal(migrated.version, 20);
+  assert.equal(migrated.version, SAVE_VERSION);
   assert.equal(migrated.finance.cash, cash);
   assert.deepEqual(
     migrated.players.map((p) => [p.id, p.name, p.rating]),
diff --git a/clubowner/tests/concacaf-v012.test.js b/clubowner/tests/concacaf-v012.test.js
index 54c20e0..1f9812f 100644
--- a/clubowner/tests/concacaf-v012.test.js
+++ b/clubowner/tests/concacaf-v012.test.js
@@ -43,6 +43,7 @@ import {
   restGap,
 } from "../src/services/calendar.js";
 import { random } from "../src/core/utils.js";
+import { SAVE_VERSION } from "../src/core/game.js";
 const game = () =>
   createGame({
     database: "world",
@@ -401,7 +402,7 @@ test("v11 migration preserves current cups and activates no new CONCACAF mid-sea
   delete s.expansion.concacaf;
   s.expansion.cups = s.expansion.cups.filter((c) => c.engine !== "concacaf-v1");
   const migrated = migrateSave(s);
-  assert.equal(migrated.version, 20);
+  assert.equal(migrated.version, SAVE_VERSION);
   assert.equal(migrated.expansion.concacafVersion, 0);
   assert.deepEqual(migrated.expansion.cups, s.expansion.cups);
   validateSave(migrated);
diff --git a/clubowner/tests/domestic-v013.test.js b/clubowner/tests/domestic-v013.test.js
index 3a4e992..e1c559a 100644
--- a/clubowner/tests/domestic-v013.test.js
+++ b/clubowner/tests/domestic-v013.test.js
@@ -20,6 +20,7 @@ import { qualify } from "../src/services/competitions/qualification.js";
 import { advanceTime } from "../src/services/time.js";
 import { ALL_MARKETS } from "../src/data/worldMarkets.js";
 import { DIVISIONS, extendedClub } from "../src/data/expandedCatalog.js";
+import { SAVE_VERSION } from "../src/core/game.js";

 const game = () =>
   createGame({
@@ -65,7 +66,7 @@ const skipGone = (raw) => {

 test("all fifty markets get full domestic cups with loaded non-reserve entrants", () => {
   const s = game();
-  assert.equal(s.version, 20);
+  assert.equal(s.version, SAVE_VERSION);
   assert.deepEqual(Object.keys(DOMESTIC).sort(), [...ALL_MARKETS].sort());
   const cups = s.expansion.cups.filter((c) => c.kind === "domestic");
   assert.equal(cups.length, 50);
@@ -194,7 +195,7 @@ test("authentic v012 save migrates to 16 with its season-1 cups preserved", asyn
   if (skipGone(old)) return;
   assert.equal(old.version, 12);
   const s = migrateSave(old);
-  assert.equal(s.version, 20);
+  assert.equal(s.version, SAVE_VERSION);
   assert.equal(old.version, 12);
   assert(s.migrationNote.includes("0.13"));
   assert(s.migrationNote.includes("0.14"));
diff --git a/clubowner/tests/economy-v015.test.js b/clubowner/tests/economy-v015.test.js
index cc694f4..e8e508f 100644
--- a/clubowner/tests/economy-v015.test.js
+++ b/clubowner/tests/economy-v015.test.js
@@ -18,6 +18,7 @@ import {
   paySponsorBonuses,
 } from "../src/services/sponsors.js";
 import { convertEGP, moneyLocal } from "../src/ui/format.js";
+import { SAVE_VERSION } from "../src/core/game.js";

 const game = () =>
   createGame({
@@ -107,7 +108,7 @@ test("offers mix two owner-country locals with one rotating global", () => {

 test("signing a local sponsor posts upfront plus eleven obligations", () => {
   const s = game();
-  assert.equal(s.version, 20);
+  assert.equal(s.version, SAVE_VERSION);
   const offer = offersFor(s, "sleeve").find(
     (o) => resolveSponsor(o.sponsorId).local,
   );
@@ -206,7 +207,7 @@ test("v14 save migrates to 16 with sponsors and finances intact", () => {
   v14.version = 14;
   delete v14.migrationNote;
   const m = migrateSave(v14);
-  assert.equal(m.version, 20);
+  assert.equal(m.version, SAVE_VERSION);
   assert.equal(v14.version, 14);
   assert(m.migrationNote.includes("0.15"));
 assert(m.migrationNote.includes("0.16"));
diff --git a/clubowner/tests/economy-v016.test.js b/clubowner/tests/economy-v016.test.js
index b4449bd..73f0887 100644
--- a/clubowner/tests/economy-v016.test.js
+++ b/clubowner/tests/economy-v016.test.js
@@ -1,4 +1,5 @@
 import test from "node:test";
+import { SAVE_VERSION } from "../src/core/game.js";
 import assert from "node:assert/strict";
 import { createGame } from "../src/core/game.js";
 import { migrateSave } from "../src/core/migrations.js";
@@ -242,12 +243,12 @@ test("coach renewal extends tenure and expiry vacates the job", () => {

 test("v15 save migrates to 16 with economy defaults and history intact", () => {
   const s = game();
-  assert.equal(s.version, 20);
+  assert.equal(s.version, SAVE_VERSION);
   const v15 = structuredClone(s);
   v15.version = 15;
   delete v15.migrationNote;
   const m = migrateSave(v15);
-  assert.equal(m.version, 20);
+  assert.equal(m.version, SAVE_VERSION);
   assert.equal(v15.version, 15);
   assert(m.migrationNote.includes("0.16"));
   assert.deepEqual(m.sponsorDeals, []);
diff --git a/clubowner/tests/europe.test.js b/clubowner/tests/europe.test.js
index ed814fd..fd7a90e 100644
--- a/clubowner/tests/europe.test.js
+++ b/clubowner/tests/europe.test.js
@@ -17,6 +17,7 @@ import { pyramidDay, blankRow } from "../src/services/pyramid.js";
 import { friendly } from "../src/services/commerce.js";
 import { EXPANDED_CLUBS } from "../src/data/expandedCatalog.js";
 import { addDays } from "../src/core/utils.js";
+import { SAVE_VERSION } from "../src/core/game.js";
 const club = EXPANDED_CLUBS.find(
   (c) => c.country === "en" && c.tier === 1 && c.selectable,
 );
@@ -362,7 +363,7 @@ test("Schema four import keeps ongoing cups, player objects and finances unchang
     cups = structuredClone(s.expansion.cups),
     finance = structuredClone(s.finance);
   const next = migrateSave(s);
-  assert.equal(next.version, 20);
+  assert.equal(next.version, SAVE_VERSION);
   assert.equal(s.version, 4);
   assert.deepEqual(next.players, players);
   assert.deepEqual(next.finance, finance);
diff --git a/clubowner/tests/expansion.test.js b/clubowner/tests/expansion.test.js
index 8ea7f3f..45727ca 100644
--- a/clubowner/tests/expansion.test.js
+++ b/clubowner/tests/expansion.test.js
@@ -29,6 +29,7 @@ import {
 } from "../src/services/clubManagement.js";
 import { internationalDay } from "../src/services/internationals.js";
 import { findPerson } from "../src/services/retired.js";
+import { SAVE_VERSION } from "../src/core/game.js";
 const club = EXPANDED_CLUBS.find((c) => c.country === "en" && c.tier === 3);
 const game = () =>
   createGame({
@@ -190,7 +191,7 @@ test("Version 3 careers migrate without retrofitting competitions or replacing p
   const s = createGame({ database: "current" });
   s.version = 3;
   const t = migrateSave(s);
-  assert.equal(t.version, 20);
+  assert.equal(t.version, SAVE_VERSION);
   assert.equal(t.expansion, undefined);
   assert.deepEqual(t.players, s.players);
   validateSave(t);
diff --git a/clubowner/tests/legends.test.js b/clubowner/tests/legends.test.js
index c563f38..05275c2 100644
--- a/clubowner/tests/legends.test.js
+++ b/clubowner/tests/legends.test.js
@@ -81,13 +81,13 @@ test("Legends catalogue: real retired names, resolvable clubs, editorial flags",
 });

 test("New saves ship v17 legends state; classic and expanded both validate", () => {
-  assert.equal(SAVE_VERSION, 20);
+  assert.equal(SAVE_VERSION, 21);
   const s = game();
   assert.deepEqual(s.legends, initLegends());
   assert.equal(s.legends.playerMode, true);
   validateSave(s);
   const classic = createGame({ clubId: "ahly" });
-  assert.equal(classic.version, 20);
+  assert.equal(classic.version, SAVE_VERSION);
   assert.deepEqual(classic.legends, initLegends());
   validateSave(classic);
   const c = signLegend(classic, "shobair", "gk", 1);
@@ -321,7 +321,7 @@ test("v16 and v15 saves migrate to v17 with an empty hall and no other change",
   delete v16.legends;
   delete v16.migrationNote;
   const m = migrateSave(v16);
-  assert.equal(m.version, 20);
+  assert.equal(m.version, SAVE_VERSION);
   assert.equal(v16.version, 16);
   assert.deepEqual(m.legends, initLegends());
   assert(m.migrationNote.includes("0.17"));
@@ -333,7 +333,7 @@ test("v16 and v15 saves migrate to v17 with an empty hall and no other change",
   delete v15.legends;
   delete v15.sponsorDeals;
   const m15 = migrateSave(v15);
-  assert.equal(m15.version, 20);
+  assert.equal(m15.version, SAVE_VERSION);
   assert.deepEqual(m15.sponsorDeals, []);
   assert.deepEqual(m15.legends, initLegends());
   validateSave(m15);
diff --git a/clubowner/tests/match-consequences.test.js b/clubowner/tests/match-consequences.test.js
index 0ddb75b..7fa6012 100644
--- a/clubowner/tests/match-consequences.test.js
+++ b/clubowner/tests/match-consequences.test.js
@@ -1,5 +1,6 @@
 // 0.24 — match consequences: injuries, card suspensions, red card, form.
 import test from "node:test";
+import { SAVE_VERSION } from "../src/core/game.js";
 import assert from "node:assert/strict";
 import { createGame } from "../src/core/game.js";
 import { advanceTime } from "../src/services/time.js";
@@ -143,7 +144,7 @@ test("v18→v20 migration initializes match consequence fields", () => {
     retired: [],
   };
   const migrated = migrateSave(v18);
-  assert.equal(migrated.version, 20);
+  assert.equal(migrated.version, SAVE_VERSION);
   const p = migrated.players[0];
   // v19 fields
   assert.equal(p.seasonGoals, 0);
diff --git a/clubowner/tests/pyramid-v08.test.js b/clubowner/tests/pyramid-v08.test.js
index 6cedc05..70e5d8a 100644
--- a/clubowner/tests/pyramid-v08.test.js
+++ b/clubowner/tests/pyramid-v08.test.js
@@ -20,6 +20,7 @@ import {
   MAX_SAVE_BYTES,
 } from "../src/services/saveCompression.js";
 import { saveBlob } from "../src/services/saveEncoding.js";
+import { SAVE_VERSION } from "../src/core/game.js";
 const division = (id, tier, clubs, country = "it") => ({
   id,
   country,
@@ -193,7 +194,7 @@ test("schema seven migration retains all values and old membership; current migr
   const p = structuredClone(s.players),
     f = structuredClone(s.finance);
   const next = migrateSave(s);
-  assert.equal(next.version, 20);
+  assert.equal(next.version, SAVE_VERSION);
   assert.equal(s.version, 7);
   assert.deepEqual(next.players, p);
   assert.deepEqual(next.finance, f);
diff --git a/clubowner/tests/review-v014.test.js b/clubowner/tests/review-v014.test.js
index 04f1e24..e367d7f 100644
--- a/clubowner/tests/review-v014.test.js
+++ b/clubowner/tests/review-v014.test.js
@@ -26,6 +26,7 @@ import {
   fifaWinPrize,
 } from "../src/services/fifa/engine.js";
 import { policy } from "../src/services/competitions/presets.js";
+import { SAVE_VERSION } from "../src/core/game.js";

 const game = () =>
   createGame({
@@ -143,7 +144,7 @@ test("prize review: fifa stays single-leg so per-fixture equals per-tie", () =>

 test("qualification review: disjoint continental lists, documented overlaps", () => {
   const s = game();
-  assert.equal(s.version, 20);
+  assert.equal(s.version, SAVE_VERSION);
   const cups = s.expansion.cups;
   const ids = (kind) =>
     new Set(cups.find((c) => c.kind === kind)?.entrants || []);
@@ -176,7 +177,7 @@ test("v13 save migrates to 16 with identities and squads intact", () => {
   v13.version = 13;
   delete v13.migrationNote;
   const m = migrateSave(v13);
-  assert.equal(m.version, 20);
+  assert.equal(m.version, SAVE_VERSION);
   assert.equal(v13.version, 13);
   assert(m.migrationNote.includes("0.14"));
   assert(m.migrationNote.includes("0.15"));
diff --git a/clubowner/tests/season-stats.test.js b/clubowner/tests/season-stats.test.js
index a2cf294..9022da0 100644
--- a/clubowner/tests/season-stats.test.js
+++ b/clubowner/tests/season-stats.test.js
@@ -8,6 +8,7 @@ import { migrateSave } from "../src/core/migrations.js";
 import { validateSave } from "../src/core/validation.js";
 import { SEASON_STAT_KEYS } from "../src/services/seasonStats.js";
 import { seasonDay } from "../src/services/season.js";
+import { SAVE_VERSION } from "../src/core/game.js";

 const dismiss = (s) => pendingActions(s).forEach((m) => resolveInfo(s, m.id));
 const tick = (s) => {
@@ -189,7 +190,7 @@ test("v18→v19 migration initializes season stats on active players", () => {
   assert.equal(v18.players[0].seasonGoals, undefined);

   const migrated = migrateSave(v18);
-  assert.equal(migrated.version, 20);
+  assert.equal(migrated.version, SAVE_VERSION);
   assert.ok(
     migrated.migrationNote.includes("إحصائيات الموسم 0.23"),
     "migration note should mention season stats 0.23",
diff --git a/clubowner/tests/v06.test.js b/clubowner/tests/v06.test.js
index fff57be..6985aaf 100644
--- a/clubowner/tests/v06.test.js
+++ b/clubowner/tests/v06.test.js
@@ -24,6 +24,7 @@ import { marketOpen } from "../src/services/market.js";
 import { promotionMoves } from "../src/services/promotion.js";
 import { rankLeague } from "../src/services/leagueTable.js";
 import { advanceTime } from "../src/services/time.js";
+import { SAVE_VERSION } from "../src/core/game.js";
 const cid = DIVISIONS.find((d) => d.id === "eg-3-d").clubs[0];
 function toDate(s, target) {
   while (s.date < target) {
@@ -94,7 +95,7 @@ test("Egypt fresh membership, stable old IDs and no invented fourth tier", () =>
   assert(ds[1].clubs.includes("ismaily"));
   assert(!ds.some((d) => d.tier === 4));
   const s = game();
-  assert.equal(s.version, 20);
+  assert.equal(s.version, SAVE_VERSION);
   assert(
     s.players
       .filter((p) =>
diff --git a/clubowner/tests/world.test.js b/clubowner/tests/world.test.js
index 2e50a4b..0ab2ecb 100644
--- a/clubowner/tests/world.test.js
+++ b/clubowner/tests/world.test.js
@@ -1,5 +1,6 @@
 import test from 'node:test';
 import assert from 'node:assert/strict';
+import { SAVE_VERSION } from '../src/core/game.js';
 import {estimateAbility,developmentGain} from '../src/models/ability.js';
 import {STAR_PROFILES} from '../src/data/starProfiles.js';
 import {ALL_MARKETS} from '../src/data/worldMarkets.js';
@@ -17,9 +18,9 @@ test('Known-star editorial profiles preserve distinct strengths and remain estim
 test('Development uses coaching/professionalism/injury and never exceeds potential',()=>{const p={age:20,rating:65,potential:80,professionalism:90,developmentRate:1};assert(developmentGain(p,{coach:85,training:3,minutes:5})>developmentGain(p,{coach:0,training:1}));assert.equal(developmentGain(p,{injured:true}),0);assert.equal(developmentGain({...p,rating:80}),0);});
 test('Large fresh careers validate, age and have at least 11 sourced own-club players',()=>{for(const clubId of ['ahly','zamalek','masry','ittihad']){const s=createGame({clubId,database:'world',leagues:ALL_MARKETS});validateSave(s);assert(s.players.filter(p=>p.clubId===clubId).length>=11);assert.equal(s.squadLimit,45);}const s=createGame({database:'world',leagues:ALL_MARKETS});s.date='2026-10-01';agingDay(s);validateSave(s);});
 test('Large transfer table renders <=50 rows and filtering sees the entire database',()=>{const s=createGame({database:'world',leagues:ALL_MARKETS});const html=playersView(s,true,{});assert.equal((html.match(/<tr>/g)||[]).length,51);assert(playersView(s,true,{search:'Haaland'}).includes('Haaland'));assert(databaseView().includes('CC BY-SA'));});
-test('v2 migration changes schema only, never replaces old players or ratings',()=>{const s=createGame({database:'current'});s.version=2;delete s.squadLimit;const before=s.players.map(p=>[p.id,p.name,p.rating]);const migrated=migrateSave(s);assert.equal(migrated.version,20);assert.deepEqual(migrated.players.map(p=>[p.id,p.name,p.rating]),before);assert.equal(s.version,2);validateSave(migrated);});
+test('v2 migration changes schema only, never replaces old players or ratings',()=>{const s=createGame({database:'current'});s.version=2;delete s.squadLimit;const before=s.players.map(p=>[p.id,p.name,p.rating]);const migrated=migrateSave(s);assert.equal(migrated.version,SAVE_VERSION);assert.deepEqual(migrated.players.map(p=>[p.id,p.name,p.rating]),before);assert.equal(s.version,2);validateSave(migrated);});

-test('An actual shipped v0.2-engine fixture migrates without changing identities or finances',async()=>{const {readFile}=await import('node:fs/promises');const old=JSON.parse(await readFile(new URL('./fixtures/actual-v02.json',import.meta.url),'utf8'));const next=migrateSave(old);validateSave(next);assert.equal(old.version,2);assert.equal(next.version,20);assert.deepEqual(next.players.map(p=>[p.id,p.name,p.rating]),old.players.map(p=>[p.id,p.name,p.rating]));assert.equal(next.date,old.date);assert.equal(next.finance.cash,old.finance.cash);});
+test('An actual shipped v0.2-engine fixture migrates without changing identities or finances',async()=>{const {readFile}=await import('node:fs/promises');const old=JSON.parse(await readFile(new URL('./fixtures/actual-v02.json',import.meta.url),'utf8'));const next=migrateSave(old);validateSave(next);assert.equal(old.version,2);assert.equal(next.version,SAVE_VERSION);assert.deepEqual(next.players.map(p=>[p.id,p.name,p.rating]),old.players.map(p=>[p.id,p.name,p.rating]));assert.equal(next.date,old.date);assert.equal(next.finance.cash,old.finance.cash);});
 test('Published birthdays are used while absent DOB remains explicitly modelled',()=>{const p=worldPlayers(ALL_MARKETS);const haaland=p.find(x=>x.nameLatin==='Erling Haaland');assert.equal(haaland.birthDate,'2000-07-21');assert.equal(haaland.age,26);assert.equal(haaland.ageEstimated,false);assert.equal(p.filter(x=>x.ageEstimated).length,WORLD_MANIFEST.unknownBirthDates);const est=p.filter(x=>x.ageEstimated);assert(est.every(x=>x.age>=18&&x.age<=36));const mean=est.reduce((a,x)=>a+x.age,0)/est.length;assert(mean>24&&mean<27,'estimated ages should spread around a realistic mean, got '+mean);assert(new Set(est.map(x=>x.age)).size>10);assert.deepEqual(est.slice(0,50).map(x=>x.age),worldPlayers(ALL_MARKETS).filter(x=>x.ageEstimated).slice(0,50).map(x=>x.age));});

 // 0.18 — roster supplement, star profiles, conflict resolution
diff --git a/package.json b/package.json
index 73e8197..53131d1 100644
--- a/package.json
+++ b/package.json
@@ -1,7 +1,7 @@
 {
   "name": "club-owner-repo-root",
   "private": true,
-  "version": "0.25.0",
+  "version": "0.26.0",
   "description": "جذر يمثل النشر إلى Cloudflare — الكود الفعلي داخل clubowner/. يعمل مع: npm install && npm run build && npx wrangler deploy من الجذر مباشرة.",
   "scripts": {
     "build": "cd clubowner && npm install --ignore-scripts --no-audit --no-fund && npm run build",
--
2.39.5
