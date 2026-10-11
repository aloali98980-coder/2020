// لوحة القيادة 0.44 — شاشة نظيفة وبلا عناصر ميتة:
// • المؤشرات الأربعة ظاهرة، والتفاصيل خلف ⓘ داخل الشاشة نفسها.
// • كل ودجت له رابط إلى شاشته، ولا ودجت فارغ.
// • الترتيب حسب الأولوية: المباراة القادمة قبل آخر مباراة قبل البريد.
// • لا قيم فارغة أو مكسورة (undefined/NaN/null) ولا تداخل تفاعلي.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { dashboardView } from "../src/features/dashboard.js";

const s = createGame({ clubId: "ahly", database: "demo" });
const html = dashboardView(s);

const widgetBlocks = (h) =>
  [...h.matchAll(/<section class="panel dash-widget[^"]*"[^>]*>[\s\S]*?<\/section>/g)].map((m) => m[0]);

test("المؤشرات الأربعة ظاهرة وكل واحدة تفتح شاشتها", () => {
  const tiles = [...html.matchAll(/<div class="dash-tile[^"]*" data-tile="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(tiles, ["treasury", "personal", "wages", "fans"]);
  for (const nav of ["finance", "empire", "squad", "ultras"])
    assert.ok(html.includes(`<button class="dash-tile-main" data-nav="${nav}">`), nav);
});

test("التفاصيل خلف ⓘ داخل البلاطة نفسها (لا داخل زر)", () => {
  const tileBlocks = [...html.matchAll(/<div class="dash-tile[\s\S]*?<\/div>\s*(?=<\/div>|<div class="dash-tile)/g)].map((m) => m[0]);
  assert.ok(tileBlocks.length >= 4);
  assert.ok(tileBlocks.every((b) => b.includes("info-toggle")));
  for (const b of html.match(/<button[\s\S]*?<\/button>/g) || [])
    assert.ok(!b.includes("<details"), "details داخل زر");
});

test("كل ودجت يحمل رابطًا إلى شاشته ولا ودجت فارغ", () => {
  const blocks = widgetBlocks(html);
  assert.ok(blocks.length >= 5, "ودجتات كافية");
  for (const b of blocks) {
    assert.ok(/data-nav="[a-z]+"/.test(b), `بلا رابط: ${b.slice(0, 80)}`);
    assert.ok(!/<div class="dash-widget-body">\s*<\/div>/.test(b), "ودجت فارغ");
  }
});

test("الترتيب حسب الأولوية: المباراة القادمة ثم آخر مباراة ثم البريد", () => {
  const at = (id) => html.indexOf(`data-widget="${id}"`);
  assert.ok(at("next-match") > 0);
  assert.ok(at("next-match") < at("last-match"));
  assert.ok(at("last-match") < at("inbox"));
});

test("لا قيم مكسورة في الشاشة", () => {
  assert.ok(!/undefined|NaN|\bnull\b/.test(html), "قيمة مكسورة ظاهرة");
});

test("لا عنصر تفاعلي داخل عنصر role=button", () => {
  const roleBlocks = html.match(/<(\w+)[^>]*role="button"[\s\S]*?<\/\1>/g) || [];
  for (const b of roleBlocks) assert.ok(!/<button/.test(b));
});
