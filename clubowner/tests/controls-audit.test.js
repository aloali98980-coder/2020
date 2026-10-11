// تدقيق الروابط والشرائح ولوحة القيادة (الإصدار 0.44 — الدفعة 3):
// • كل رابط data-nav يشير إلى شاشة موجودة في القائمة الجانبية.
// • كل شريحة range لها سلوك حي: إجراء (data-action) أو مخرج نصي (data-out) أو معرّف الصوت.
// • بطاقة القصر في لوحة القيادة لا تحتوي زرًا داخل عنصر role=button.
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createGame } from "../src/core/game.js";
import { NAV_BY_ID } from "../src/components/shell.js";
import { dashboardView } from "../src/features/dashboard.js";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}
const sources = walk("src").map((f) => [f, readFileSync(f, "utf8")]);

test("كل رابط data-nav يشير إلى شاشة موجودة", () => {
  const bad = [];
  for (const [file, text] of sources)
    for (const m of text.matchAll(/data-nav=\\?"([a-z]+)\\?"/g))
      if (!NAV_BY_ID[m[1]]) bad.push(`${file}: ${m[1]}`);
  assert.deepEqual(bad, []);
});

test("كل شريحة range لها سلوك حي (إجراء أو مخرج أو معرّف خاص)", () => {
  const bad = [];
  for (const [file, text] of sources)
    for (const m of text.matchAll(/<input[^>]*type="range"[^>]*>/g)) {
      const tag = m[0];
      if (!/data-action=|data-out=|id="audio-volume"/.test(tag)) bad.push(`${file}: ${tag.slice(0, 80)}`);
    }
  assert.deepEqual(bad, []);
});

test("إجراءات الشرائح الحية موجودة في معالج الإجراءات", () => {
  const main = readFileSync("src/main.js", "utf8");
  for (const [, text] of sources)
    for (const m of text.matchAll(/type="range"[^>]*data-action="([a-z-]+)"/g))
      assert.ok(main.includes(`"${m[1]}":`), `معالج مفقود: ${m[1]}`);
});

test("لوحة القيادة: بطاقة القصر بلا role=button (لا زر داخل زر)", () => {
  const s = createGame({ clubId: "ahly", database: "demo" });
  const html = dashboardView(s);
  const card = html.match(/<section class="panel dash-widget empire-card"[^>]*>/);
  assert.ok(card, "بطاقة القصر موجودة");
  assert.ok(!/role="button"/.test(card[0]), "لا role=button على البطاقة");
});
