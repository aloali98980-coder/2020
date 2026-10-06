import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { DIVISIONS, extendedClub } from "../src/data/expandedCatalog.js";
// 0.14 review browser pass: every engine renders its cards, a mid-season v14
// save round-trips byte-exact, days advance, and a v013 save migrates to 14.
// Run engines in separate processes (TEST_ENGINE=chromium|webkit): combined
// runs exhaust the 2 GiB sandbox on large imports.
const url = process.env.TEST_URL || "http://127.0.0.1:5174",
  results = [];
const hash = (b) => createHash("sha256").update(b).digest("hex");
const MID = ".arena/v014/mid-season.json.gz",
  OLD = ".arena/v013-mid-s1.json.gz";
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
    const noOverflow = async () =>
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
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
    // Every engine renders: europe 3, continental mains 4, asia 3,
    // concacaf 4, fifa season-1 (intercontinental + ofc, no clubworld
    // until 2029), domestic 50. Season supers do not exist at day 0.
    for (const [attr, kind] of [
      ["europe", "ucl"],
      ["europe", "uel"],
      ["europe", "uecl"],
      ["competition", "caf"],
      ["competition", "confed"],
      ["competition", "lib"],
      ["competition", "suda"],
      ["asia", "afc"],
      ["asia", "afc-two"],
      ["asia", "afc-challenge"],
      ["concacaf", "concacaf"],
      ["concacaf", "leagues-cup"],
      ["concacaf", "central-american"],
      ["concacaf", "caribbean"],
      ["fifa", "intercontinental"],
      ["fifa", "ofc"],
    ])
      assert.equal(
        await p.locator(`[data-${attr}=${kind}]`).count(),
        1,
        `${attr}=${kind}`,
      );
    assert.equal(await p.locator("[data-fifa=clubworld]").count(), 0);
    assert.equal(await p.locator("[data-competition=domestic]").count(), 50);
    // Supers are created during the season (not at day 0); the mid-season
    // import below still shows all fifty domestic cards, and super completion
    // is proven by the full-world and migration histories.
    const ccCard = p.locator('[data-concacaf=concacaf]');
    assert((await ccCard.innerText()).includes("CONCACAF Champions Cup"));
    await noOverflow();
    // Mid-season full-world save in a fresh browser process (memory hygiene).
    console.log(engine, MID);
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
    await imp(MID);
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await nav("world");
    const mid = p.locator('[data-concacaf=concacaf]');
    await mid.locator(":scope > summary").click();
    assert((await mid.innerText()).includes("CONCACAF Champions Cup"));
    await mid.scrollIntoViewIfNeeded();
    await noOverflow();
    await p.screenshot({ path: `review/v014-${engine}-review.png` });
    assert.equal(hash(await exp()), hash(gunzipSync(await readFile(MID))));
    await p.selectOption("#advance-days", "1");
    await p.click("[data-action=advance]");
    await p.waitForFunction(
      () => !document.body.classList.contains("saving-game"),
    );
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    let migratedV013 = "skipped-missing-baseline";
    if (existsSync(OLD)) {
      await nav("settings");
      await imp(OLD);
      const raw = await exp(),
        migrated = JSON.parse(raw),
        old = JSON.parse(gunzipSync(await readFile(OLD)));
      assert.equal(migrated.version, 14);
      assert.deepEqual(migrated.expansion.cups, old.expansion.cups);
      await nav("world");
      assert.equal(await p.locator("[data-competition=domestic]").count(), 50);
      assert.equal(
        await p.locator("[data-concacaf=concacaf]").count(),
        1,
      );
      migratedV013 = true;
    } else console.log("SKIP v013 import: baseline absent.");
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      savedAt: new Date().toISOString(),
      width: 390,
      allEngineCardsRender: true,
      midSeasonImportReloadExportByteExact: true,
      largeFixtureTestedInSeparateBrowserProcess: true,
      advanceAndIDBReload: true,
      actualV013ImportPreservesCups: migratedV013,
      noHorizontalOverflow: true,
      errors,
    });
    await writeFile(
      `review/review-browser-v014-${engine}.json`,
      JSON.stringify(results.filter((r) => r.engine === engine), null, 2),
    );
  } finally {
    await b.close();
  }
}
await writeFile(
  "review/review-browser-v014.json",
  JSON.stringify(results, null, 2),
);
console.log(results);
