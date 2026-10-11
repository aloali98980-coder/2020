// تدقيق الجوال (الإصدار 0.44 — الدفعة 4):
// • الشريط السفلي: الشاشة الحالية معلَّمة (aria-current) و«المزيد» يضيء للشاشات الثانوية.
// • أهداف اللمس 44px على الشاشات التي تعمل باللمس، والمحتوى لا يختفي خلف الشريط.
// • البحث يتجمع في رندر واحد بدل إعادة بناء الشاشة مع كل حرف.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createGame } from "../src/core/game.js";
import { shell, MOBILE_PRIMARY } from "../src/components/shell.js";

const css = readFileSync("src/styles/mobile.css", "utf8");
const main = readFileSync("src/main.js", "utf8");

const mobileNav = (route) => {
  const s = createGame({ clubId: "ahly", database: "demo" });
  const html = shell(s, route, "<p>x</p>");
  const m = html.match(/<nav class="mobile-nav">([\s\S]*?)<\/nav>/);
  assert.ok(m, "الشريط السفلي موجود");
  return m[1];
};

test("الشاشة الأساسية الحالية معلَّمة بـ aria-current ونشطة", () => {
  const nav = mobileNav("inbox");
  assert.match(nav, /class="active" aria-label="[^"]+" aria-current="page"[^>]*>/);
});

test("عند شاشة ثانوية يضيء «المزيد» ولا يُعلَّم زر أساسي", () => {
  const nav = mobileNav("finance");
  const more = nav.match(/<button[^>]*data-action="more"[^>]*>/)[0];
  assert.match(more, /class="active"/);
  assert.equal((nav.match(/aria-current="page"/g) || []).length, 0);
});

test("الشاشات الأساسية الأربع هي أول أربعة عناصر في الشريط", () => {
  assert.equal(MOBILE_PRIMARY.length, 4);
  const nav = mobileNav("dashboard");
  for (const id of MOBILE_PRIMARY) assert.ok(nav.includes(`data-nav="${id}"`), id);
});

test("أهداف اللمس 44px على الشاشات التي تعمل باللمس", () => {
  assert.match(css, /@media \(pointer: coarse\)\s*\{[\s\S]*?\.btn[\s\S]*?min-height: 44px/);
  assert.match(css, /\.mobile-nav button[\s\S]*?min-height: 44px/);
});

test("المحتوى لا يختفي خلف الشريط السفلي على الجوال", () => {
  assert.match(css, /max-width: 760px\)\s*\{\s*\.content\s*\{[^}]*padding-bottom:[^}]*safe-area-inset-bottom/);
});

test("ملف الجوال محمّل بعد بقية الأنماط", () => {
  const i = main.indexOf('import "./styles/mobile.css"');
  assert.ok(i > 0 && i > main.indexOf('import "./styles/readability.css"'));
});

test("البحث في السوق واللاعبين يتجمع في رندر واحد ويحفظ التركيز", () => {
  assert.match(main, /function renderSearchSoon\(\)/);
  assert.match(main, /clearTimeout\(searchRenderTimer\)/);
  assert.match(main, /input\.setSelectionRange\(pos, pos\)/);
  // معالج البحث يحدّث الحالة ويجدول الرندر فقط، دون render() مباشر
  const start = main.indexOf('if (e.target.id === "market-search")');
  const end = main.indexOf("// اختصارات البحث السريع", start);
  assert.ok(start > 0 && end > start, "معالج البحث موجود");
  const handler = main.slice(start, end);
  assert.ok(!/\brender\(\)/.test(handler), "لا رندر مباشر داخل معالج البحث");
  assert.equal((handler.match(/renderSearchSoon\(\)/g) || []).length, 2);
});
