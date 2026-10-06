import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { DIVISIONS, extendedClub } from "../src/data/expandedCatalog.js";
// 0.15 economy browser pass (new-game only, light enough for both engines):
// local sponsor offers, UI signing flow, bonus terms, local currency.
// Run engines in separate processes (TEST_ENGINE=chromium|webkit).
const url = process.env.TEST_URL || "http://127.0.0.1:5174",
  results = [];
for (const [engine, type] of Object.entries({ chromium, webkit }).filter(
  ([e]) => !process.env.TEST_ENGINE || e === process.env.TEST_ENGINE,
)) {
  console.log("Browser", engine);
  const b = await type.launch();
  try {
    const ctx = await b.newContext({
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
    await nav("sponsors");
    assert.equal(await p.locator(".asset-card").count(), 6);
    assert((await p.locator("main").innerText()).includes("السعودية"));
    await p.locator('[data-action="sponsor-offers"]').first().click();
    await p.waitForSelector(".sponsor-offer");
    assert.equal(await p.locator(".sponsor-offer").count(), 3);
    const modal = p.locator("#modal-root");
    assert((await modal.innerText()).includes("محلي — السعودية"));
    await p.locator('[data-action="confirm-sponsor"]').first().click();
    assert((await modal.innerText()).includes("مكافآت أداء موحدة"));
    await p.locator('[data-action="sign-sponsor"]').click();
    await p.waitForFunction(
      () => !document.body.classList.contains("saving-game"),
    );
    await p.waitForSelector(".asset-card");
    const signed = await p.locator("main").innerText();
    assert(signed.includes("متعاقد"));
    await p.locator('[data-action="sponsor-detail"]').first().click();
    await p.waitForSelector(".payment-list");
    assert((await modal.innerText()).includes("مكافآت الأداء الموحدة"));
    await p.keyboard.press("Escape");
    await nav("finance");
    const finance = await p.locator("main").innerText();
    assert(finance.includes("ر.س"));
    assert(finance.includes("بسعر عرض ثابت"));
    await noOverflow();
    await p.selectOption("#advance-days", "1");
    await p.click("[data-action=advance]");
    await p.waitForFunction(
      () => !document.body.classList.contains("saving-game"),
    );
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await p.screenshot({ path: `review/v015-${engine}-economy.png` });
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      savedAt: new Date().toISOString(),
      width: 390,
      localOffersRender: true,
      uiSigningFlow: true,
      bonusTermsShown: true,
      localCurrencyShown: true,
      advanceAndReload: true,
      noHorizontalOverflow: true,
      errors,
    });
    await writeFile(
      `review/economy-browser-v015-${engine}.json`,
      JSON.stringify(results.filter((r) => r.engine === engine), null, 2),
    );
  } finally {
    await b.close();
  }
}
await writeFile(
  "review/economy-browser-v015.json",
  JSON.stringify(results, null, 2),
);
console.log(results);
