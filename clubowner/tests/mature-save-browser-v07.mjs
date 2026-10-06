// Generate .arena/full-world-v07-three-seasons.json with full-world-v05.mjs first.
import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const source = ".arena/full-world-v07-three-seasons.json",
  bytes = await readFile(source),
  hash = createHash("sha256").update(bytes).digest("hex"),
  results = [],
  url = process.env.TEST_URL || "http://127.0.0.1:5173";
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  console.error("Mature save engine:",engine);
  const b = await type.launch();
  try {
    const p = await b.newPage({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      }),
      errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(url);
    const chooser = p.waitForEvent("filechooser");
    await p.click("[data-action=import-save]");
    await (await chooser).setFiles(source);
    await p.waitForSelector("[data-action=confirm-import]", { timeout: 90000 });
    await p.click("[data-action=confirm-import]");
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await p.click(".mobile-nav [data-action=more]");
    await p.click(".more-grid [data-nav=settings]");
    const download = p.waitForEvent("download");
    await p.click("[data-action=export-save]");
    const d = await download,
      path = await d.path();
    const exported = await readFile(path);
    assert.equal(createHash("sha256").update(exported).digest("hex"), hash);
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      bytes: exported.length,
      importedFromRealFileChooser: true,
      reloaded: true,
      uiExportByteIdentical: true,
      errors,
    });
  } finally {
    await b.close();
  }
}
console.log(JSON.stringify(results, null, 2));
