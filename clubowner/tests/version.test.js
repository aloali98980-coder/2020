import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { APP_VERSION } from "../src/data/version.js";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

// 0.23: رقم الإصدار له مصدر وحيد — يمنع بقاء واجهة على نسخة قديمة بعد ترقية.
// 0.24: شارة ALPHA سقطت من شاشة البداية، وكل الشارات الباقية تعرض v${APP_VERSION}.
test("APP_VERSION متسقة مع package.json وindex.html", () => {
  const pkg = JSON.parse(read("../package.json"));
  assert.ok(
    pkg.version.startsWith(APP_VERSION + "."),
    `package.json (${pkg.version}) لا يطابق APP_VERSION (${APP_VERSION})`,
  );
  const html = read("../index.html");
  assert.ok(
    html.includes(`content="${APP_VERSION}.`),
    "وسم meta للإصدار في index.html لا يطابق APP_VERSION",
  );
  const shell = read("../src/components/shell.js");
  assert.ok(
    shell.includes("v${APP_VERSION}"),
    "شارة النسخة في الهيكل يجب أن تستخدم APP_VERSION لا نصًا ثابتًا",
  );
  const settings = read("../src/features/settings.js");
  assert.ok(
    settings.includes("v${APP_VERSION}"),
    "شارة النسخة في «عن اللعبة» يجب أن تستخدم v${APP_VERSION} لا نصًا ثابتًا",
  );
  assert.ok(
    !settings.includes("ALPHA"),
    "شارة ALPHA القديمة يجب ألا تبقى في «عن اللعبة» بعد 0.24",
  );
});

// 0.24: شاشة البداية صارت تتكلم لغة اللاعبين — لا شارة ALPHA ولا استيراد للنسخة.
test("شاشة البداية خالية من شارة ALPHA", () => {
  const setup = read("../src/features/setup.js");
  assert.ok(
    !setup.includes("ALPHA"),
    "شارة ALPHA يجب أن تُحذف من شاشة البداية في 0.24",
  );
  assert.ok(
    !setup.includes("version-pill"),
    "حبّة النسخة (version-pill) يجب أن تُحذف من ترويسة شاشة البداية",
  );
  assert.ok(
    !setup.includes("APP_VERSION"),
    "شاشة البداية لم تعد تستخدم APP_VERSION بعد حذف الشارة",
  );
});

// 0.24: هوية «Empire FC» — اسم واحد في العنوان والمانيفست والبراند.
test("هوية Empire FC مطبقة في العنوان والمانيفست والبراند", () => {
  const html = read("../index.html");
  assert.match(html, /<title>Empire FC/, "عنوان الصفحة في index.html يجب أن يكون Empire FC");
  assert.ok(
    html.includes('apple-mobile-web-app-title" content="Empire FC"'),
    "اسم التطبيق على شاشة آيفون يجب أن يكون Empire FC",
  );
  const manifest = JSON.parse(read("../public/manifest.webmanifest"));
  assert.equal(manifest.short_name, "Empire FC", "short_name في المانيفست");
  assert.match(manifest.name, /^Empire FC/, "name في المانيفست");
  const shell = read("../src/components/shell.js");
  assert.ok(
    shell.includes("<strong>EMPIRE FC"),
    "البراند في الهيكل يجب أن يعرض EMPIRE FC",
  );
  assert.ok(
    !shell.includes("CLUB OWNER"),
    "البراند القديم CLUB OWNER يجب ألا يبقى في الهيكل",
  );
  const main = read("../src/main.js");
  assert.ok(
    main.includes('document.title = "Empire FC"'),
    "عنوان شاشة البداية في main.js يجب أن يكون Empire FC",
  );
  assert.ok(
    !main.includes("صاحب النادي"),
    "الاسم العربي القديم يجب ألا يبقى في عناوين main.js",
  );
});
