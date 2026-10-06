import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { DIVISIONS, extendedClub } from "../src/data/expandedCatalog.js";
const url = process.env.TEST_URL || "http://127.0.0.1:5174",
  results = [];
const hash = (b) => createHash("sha256").update(b).digest("hex");
for (const [engine, type] of Object.entries({ chromium, webkit }).filter(
  ([e]) => !process.env.TEST_ENGINE || e === process.env.TEST_ENGINE,
)) {
  console.log("Browser", engine);
  let b = await type.launch();
  try {
    let ctx = await b.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      }),
      p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    const nav = async (name) => {
      await p.click(".mobile-nav [data-action=more]");
      await p.click(`.more-grid [data-nav=${name}]`);
    };
    const imp = async (file) => {
      const chooser = p.waitForEvent("filechooser");
      await p.click("[data-action=import-save]");
      await (await chooser).setFiles(file);
      await p.waitForSelector("[data-action=confirm-import]", {
        timeout: 90000,
      });
      await p.click("[data-action=confirm-import]");
      await p.waitForSelector(".hero-card", { timeout: 90000 });
    };
    const exp = async () => {
      await nav("settings");
      const download = p.waitForEvent("download");
      await p.click("[data-action=export-save]");
      const d = await download;
      return gunzipSync(await readFile(await d.path()));
    };
    await p.goto(url);
    await p.click("[data-action=markets-egypt]");
    await p.selectOption("#setup-region", "sa");
    const id = [
      ...DIVISIONS.find((d) => d.country === "sa" && d.tier === 1).clubs,
    ].sort((a, b) => extendedClub(b).rep - extendedClub(a).rep)[0];
    await p.selectOption("#setup-expanded-club", id);
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await nav("world");
    assert.equal(await p.locator("[data-competition=domestic]").count(), 50);
    const saCard = p.locator('[data-cup-id="cup-sa-s1"]');
    assert((await saCard.innerText()).includes("King Cup"));
    assert((await saCard.innerText()).includes("ناديك مشارك"));
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    // Mid-season full-world save in a fresh browser process (memory hygiene).
    console.log(engine, ".arena/domestic/mid-season.json.gz");
    await b.close();
    global.gc?.();
    await new Promise((r) => setTimeout(r, 8000));
    b = await type.launch();
    ctx = await b.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(url);
    global.gc?.();
    await imp(".arena/domestic/mid-season.json.gz");
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await nav("world");
    assert.equal(await p.locator("[data-competition=domestic]").count(), 50);
    const mid = p.locator('[data-cup-id="cup-sa-s1"]');
    await mid.locator(":scope > summary").click();
    assert((await mid.innerText()).includes("King Cup"));
    assert((await mid.locator(".europe-ties article").count()) >= 1);
    await mid.scrollIntoViewIfNeeded();
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await p.screenshot({ path: `review/v013-${engine}-domestic.png` });
    assert.equal(
      hash(await exp()),
      hash(gunzipSync(await readFile(".arena/domestic/mid-season.json.gz"))),
    );
    await p.selectOption("#advance-days", "1");
    await p.click("[data-action=advance]");
    await p.waitForFunction(
      () => !document.body.classList.contains("saving-game"),
    );
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await nav("settings");
    await imp(".arena/v012-mid-s1.json.gz");
    const raw = await exp(),
      migrated = JSON.parse(raw),
      old = JSON.parse(
        gunzipSync(await readFile(".arena/v012-mid-s1.json.gz")),
      );
    assert.equal(migrated.version, 13);
    assert.deepEqual(migrated.expansion.cups, old.expansion.cups);
    await nav("world");
    assert.equal(await p.locator("[data-competition=domestic]").count(), 6);
    assert(
      (await p.locator("main").innerText()).includes("الكؤوس الأخرى"),
    );
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      // written incrementally: a later engine crash must not lose this evidence
      savedAt: new Date().toISOString(),
      width: 390,
      saClubStart: true,
      fiftyDomesticCards: true,
      ownClubInHomeCup: true,
      midSeasonImportReloadExportByteExact: true,
      largeFixtureTestedInSeparateBrowserProcess: true,
      advanceAndIDBReload: true,
      actualV012ImportPreservesCups: true,
      legacyCupsShownAsSimplified: true,
      noHorizontalOverflow: true,
      errors,
    });
    await writeFile(
      `review/domestic-browser-v013-${engine}.json`,
      JSON.stringify(results.filter((r) => r.engine === engine), null, 2),
    );
  } finally {
    await b.close();
  }
}
await writeFile(
  "review/domestic-browser-v013.json",
  JSON.stringify(results, null, 2),
);
console.log(results);
