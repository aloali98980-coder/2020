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
    assert.equal(await p.locator("[data-asia]").count(), 3);
    assert(
      (await p.locator("[data-asia=afc]").innerText()).includes("ناديك مشارك"),
    );
    assert.equal(
      await p.locator("#division-view").inputValue(),
      DIVISIONS.find((d) => d.country === "sa" && d.tier === 1).id,
    );
    await p.locator("[data-asia=afc] > summary").click();
    assert(
      (await p.locator("[data-asia=afc]").innerText()).includes(
        "الدور التمهيدي",
      ),
    );
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    for (const [file, ko] of [
      [".arena/asia/mid-groups.json.gz", false],
      [".arena/asia/mid-knockout.json.gz", true],
    ]) {
      console.log(engine, file);
      await b.close();
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
      await imp(file);
      await p.reload();
      await p.waitForSelector(".hero-card", { timeout: 90000 });
      await nav("world");
      const c = p.locator("[data-asia=afc]");
      await c.locator(":scope > summary").click();
      assert.equal(await c.locator("tbody tr").count(), 32);
      assert.equal(await p.locator("[data-asia=afc-two] tbody tr").count(), 32);
      assert.equal(
        await p.locator("[data-asia=afc-challenge] tbody tr").count(),
        20,
      );
      assert((await c.innerText()).includes("غرب آسيا"));
      assert((await c.innerText()).includes("شرق آسيا"));
      if (ko) assert.equal(await c.locator(".europe-ties article").count(), 20);
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      if (!ko) {
        await c.scrollIntoViewIfNeeded();
        await p.screenshot({ path: `review/v011-${engine}-asia.png` });
      }
      assert.equal(hash(await exp()), hash(gunzipSync(await readFile(file))));
    }
    await p.selectOption("#advance-days", "1");
    await p.click("[data-action=advance]");
    await p.waitForFunction(
      () => !document.body.classList.contains("saving-game"),
    );
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await nav("settings");
    await imp(".arena/asia/actual-v010-mid.json.gz");
    const raw = await exp(),
      migrated = JSON.parse(raw),
      old = JSON.parse(
        gunzipSync(await readFile(".arena/asia/actual-v010-mid.json.gz")),
      );
    assert.equal(migrated.version, 11);
    assert.equal(migrated.expansion.asiaVersion, 0);
    assert.deepEqual(migrated.expansion.cups, old.expansion.cups);
    await nav("world");
    assert.equal(await p.locator("[data-asia]").count(), 0);
    assert(
      (await p.locator("main").innerText()).includes(
        "بطولات آسيا الجديدة تبدأ",
      ),
    );
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      width: 390,
      asianClubStart: true,
      threeCards: true,
      groupRows: [32, 32, 20],
      regionalKnockout: true,
      fullMarketMidGroupAndMidKnockoutSaveByteExact: true,
      largeFixturesTestedInSeparateBrowserProcesses: true,
      advanceAndIDBReload: true,
      actualV010ImportPreservesCups: true,
      noHorizontalOverflow: true,
      errors,
    });
  } finally {
    await b.close();
  }
}
await writeFile(
  "review/asia-browser-v011.json",
  JSON.stringify(results, null, 2),
);
console.log(results);
