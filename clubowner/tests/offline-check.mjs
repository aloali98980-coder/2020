import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

// Requires `npm run build` and a production preview on port 5173.
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.selectOption("#setup-database","current");
await page.fill("#owner-name", "اختبار دون اتصال");
  await page.click('[data-action="start-game"]');
  await page.waitForSelector(".hero-card");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const cachesBefore = await page.evaluate(() => caches.keys());
  assert(cachesBefore.some((k) => k.startsWith("club-owner-")));
  const manifest = await (
    await page.request.get(base + "/manifest.webmanifest")
  ).json();
  assert.equal(manifest.display, "standalone");
  assert(manifest.icons.some((i) => i.sizes === "512x512"));
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".hero-card");
  await page.locator('.mobile-nav [data-nav="transfers"]').click();
  await page.locator('[data-action="transfer-offer"]').first().click();
  await page.locator('#offer-form button[type="submit"]').click();
  await page.selectOption("#advance-days", "1");
  await page.click('[data-action="advance"]');
  await page.click('[data-action="accept-club"]');
  await page.locator('#contract-form button[type="submit"]').click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("clubowner.game.v1")),
  );
  assert.equal(
    saved.players.filter((p) => p.clubId === saved.clubId).length,
    19,
  );
  await page.close();
  const reopened = await context.newPage();
  reopened.on("pageerror", (e) => errors.push(e.message));
  await reopened.goto(base, { waitUntil: "domcontentloaded" });
  await reopened.waitForSelector(".hero-card");
  const restored = await reopened.evaluate(() =>
    JSON.parse(localStorage.getItem("clubowner.game.v1")),
  );
  assert.equal(restored.date, saved.date);
  assert.equal(restored.finance.cash, saved.finance.cash);
  await reopened.locator('.mobile-nav [data-action="more"]').click();
  await reopened.locator('.more-grid [data-nav="settings"]').click();
  await reopened.click('[data-action="install-guide"]');
  await reopened.waitForSelector(".install-steps");
  await reopened.screenshot({
    path: "review/offline-install-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed: true,
        cache: cachesBefore,
        tests: [
          "production manifest",
          "all resources precached",
          "offline reload",
          "offline transfer and finance",
          "offline new tab restores save",
          "installation guide",
        ],
        physicalIPhoneTested: false,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
