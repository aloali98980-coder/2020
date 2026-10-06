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
    await p.selectOption("#setup-region", "us");
    const id = [
      ...DIVISIONS.find((d) => d.country === "us" && d.tier === 1).clubs,
    ].sort((a, b) => extendedClub(b).rep - extendedClub(a).rep)[0];
    await p.selectOption("#setup-expanded-club", id);
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await nav("world");
    assert.equal(await p.locator("[data-concacaf]").count(), 4);
    assert(
      (await p.locator("[data-concacaf=leagues-cup]").innerText()).includes(
        "ناديك مشارك",
      ),
    );
    assert(
      (await p.locator("[data-concacaf=concacaf]").innerText()).includes(
        "الدور الأول",
      ),
    );
    assert.equal(
      await p.locator("[data-concacaf=leagues-cup] tbody tr").count(),
      36,
    );
    assert.equal(
      await p.locator("[data-concacaf=central-american] tbody tr").count(),
      20,
    );
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    for (const [file, champions] of [
      [".arena/concacaf/mid-regional.json.gz", false],
      [".arena/concacaf/mid-champions.json.gz", true],
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
      assert.equal(await p.locator("[data-concacaf]").count(), 4);
      const central = p.locator("[data-concacaf=central-american]");
      await central.locator(":scope > summary").click();
      assert.equal(await central.locator("tbody tr").count(), 20);
      assert.equal(
        await p.locator("[data-concacaf=caribbean] tbody tr").count(),
        10,
      );
      assert.equal(
        await p.locator("[data-concacaf=leagues-cup] tbody tr").count(),
        36,
      );
      const cc = p.locator("[data-concacaf=concacaf]");
      await cc.locator(":scope > summary").click();
      assert((await cc.innerText()).includes("CONCACAF Champions Cup"));
      if (champions)
        assert((await cc.locator(".europe-ties article").count()) >= 22);
      else await central.scrollIntoViewIfNeeded();
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      if (!champions) {
        await central.scrollIntoViewIfNeeded();
        await p.screenshot({ path: `review/v012-${engine}-concacaf.png` });
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
    await imp(".arena/concacaf/actual-v011-mid.json.gz");
    const raw = await exp(),
      migrated = JSON.parse(raw),
      old = JSON.parse(
        gunzipSync(await readFile(".arena/concacaf/actual-v011-mid.json.gz")),
      );
    assert.equal(migrated.version, 12);
    assert.equal(migrated.expansion.concacafVersion, 0);
    assert.deepEqual(migrated.expansion.cups, old.expansion.cups);
    await nav("world");
    assert.equal(await p.locator("[data-concacaf]").count(), 0);
    assert(
      (await p.locator("main").innerText()).includes(
        "بطولات كونكاكاف الجديدة تبدأ",
      ),
    );
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      width: 390,
      usClubStart: true,
      fourCards: true,
      groupRows: [20, 10, 36],
      championsKnockout: true,
      fullMarketMidSavesByteExact: true,
      largeFixturesTestedInSeparateBrowserProcesses: true,
      advanceAndIDBReload: true,
      actualV011ImportPreservesCups: true,
      noHorizontalOverflow: true,
      errors,
    });
  } finally {
    await b.close();
  }
}
await writeFile(
  "review/concacaf-browser-v012.json",
  JSON.stringify(results, null, 2),
);
console.log(results);
