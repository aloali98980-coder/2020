import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { APP_VERSION } from "../src/data/version.js";

// 0.23: رقم الإصدار له مصدر وحيد — يمنع بقاء واجهة على نسخة قديمة بعد ترقية.
test("APP_VERSION متسقة مع package.json وindex.html", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(
    pkg.version.startsWith(APP_VERSION + "."),
    `package.json (${pkg.version}) لا يطابق APP_VERSION (${APP_VERSION})`,
  );
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.ok(
    html.includes(`content="${APP_VERSION}.`),
    "وسم meta للإصدار في index.html لا يطابق APP_VERSION",
  );
  const shell = readFileSync(new URL("../src/components/shell.js", import.meta.url), "utf8");
  assert.ok(
    shell.includes("v${APP_VERSION}"),
    "شارة النسخة في الهيكل يجب أن تستخدم APP_VERSION لا نصًا ثابتًا",
  );
  const setup = readFileSync(new URL("../src/features/setup.js", import.meta.url), "utf8");
  assert.ok(
    setup.includes("ALPHA ${APP_VERSION}"),
    "شارة النسخة في شاشة البداية يجب أن تستخدم APP_VERSION لا نصًا ثابتًا",
  );
  const settings = readFileSync(new URL("../src/features/settings.js", import.meta.url), "utf8");
  assert.ok(
    settings.includes("ALPHA ${APP_VERSION}"),
    "شارة النسخة في «عن اللعبة» يجب أن تستخدم APP_VERSION لا نصًا ثابتًا",
  );
});
