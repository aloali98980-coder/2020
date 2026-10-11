// فحص ساكن للجوال (0.44): لا متصفح متاحًا في البيئة، لذلك نثبت الشروط في المصدر:
// • meta viewport صحيح ولا يمنع التكبير.
// • نقاط توقف متجاوبة (≤760px) وشبكات تنهار إلى عمود واحد.
// • أهداف اللمس 44px على الشاشات التي تعمل باللمس.
// • لا عرض ثابت بوحدة 100vw يسبب تمريرًا أفقيًا (إلا بحد أقصى يطرح الهوامش).
// • الشريط السفلي يحترم منطقة الأمان للأجهزة ذات الحواف.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const cssFiles = readdirSync(join(root, "src/styles"))
  .filter((f) => f.endsWith(".css"))
  .map((f) => ({ name: f, text: read(join("src/styles", f)) }));
const allCss = cssFiles.map((f) => f.text).join("\n");

test("meta viewport صحيح ولا يمنع تكبير الشاشة", () => {
  const html = read("index.html");
  const m = html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/);
  assert.ok(m, "meta viewport موجود");
  assert.match(m[1], /width=device-width/);
  assert.match(m[1], /initial-scale=1/);
  assert.doesNotMatch(m[1], /user-scalable=no|maximum-scale=1(?!\d)/);
});

test("نقاط توقف متجاوبة للجوال، وشبكات الصفحة تنهار إلى عمود واحد", () => {
  const responsive = read("src/styles/responsive.css");
  assert.match(responsive, /@media \(max-width: \d+px\)/);
  assert.match(allCss, /@media \(max-width: 760px\)/, "نقطة الجوال 760px موجودة");
  assert.match(responsive, /grid-template-columns:\s*1fr;/, "عمود واحد على الشاشات الصغيرة");
});

test("أهداف اللمس 44px على الشاشات التي تعمل باللمس", () => {
  const mobile = read("src/styles/mobile.css");
  const block = mobile.match(/@media \(pointer: coarse\) \{[\s\S]*?\n\}/);
  assert.ok(block, "قاعدة pointer: coarse موجودة");
  assert.match(block[0], /min-height:\s*44px/);
  assert.match(block[0], /min-width:\s*44px/);
});

test("لا عرض ثابت 100vw يسبب تمريرًا أفقيًا (القيمة الوحيدة مطروح منها هامش)", () => {
  const hits = [...allCss.matchAll(/[^;{}]*100vw[^;]*/g)].map((m) => m[0].trim());
  assert.ok(hits.every((h) => /calc\(100vw\s*-/.test(h)), `قيم 100vw بلا هامش: ${hits.join(" | ")}`);
});

test("الشريط السفلي يحترم منطقة الأمان (safe-area) للأجهزة ذات الحواف", () => {
  assert.match(allCss, /env\(safe-area-inset-bottom\)/);
});

test("وضع الأداء الخفيف معرَّف في CSS ومربوط بالتشغيل", () => {
  const mobile = read("src/styles/mobile.css");
  assert.match(mobile, /html\.lite \*/);
  assert.match(mobile, /backdrop-filter:\s*none/);
  assert.match(read("src/main.js"), /applyPerformanceMode\(\)/);
});
