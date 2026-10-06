import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { webkit, devices } from "@playwright/test";
import assert from "node:assert/strict";

const distDir = path.resolve("dist");
assert(fs.existsSync(distDir), "dist/ must exist; run npm run build first.");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let file = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    let filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, "index.html");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const PORT = 5188;
const server = createStaticServer();
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${PORT}`;

const shotsDir = path.resolve("shots-webkit");
fs.mkdirSync(shotsDir, { recursive: true });

const iPhoneDevice = devices["iPhone 14"];
console.log(`Starting WebKit with ${iPhoneDevice.userAgent.slice(0, 40)}...`);

const browser = await webkit.launch({ headless: true });
const results = {
  device: "iPhone 14 (WebKit)",
  viewport: iPhoneDevice.viewport,
  deviceScaleFactor: iPhoneDevice.deviceScaleFactor,
  routesChecked: [],
  overflowErrors: [],
  pageErrors: [],
  largeSaveRestored: false,
  offlineReloadPassed: false,
  offlineActionPassed: false,
  offlineColdTabPassed: false,
};

try {
  const context = await browser.newContext({
    ...iPhoneDevice,
    locale: "ar-EG",
  });
  const page = await context.newPage();
  page.on("pageerror", (err) => results.pageErrors.push(err.message));

  // 1. Initial Load & Setup
  await page.goto(base);
  await page.waitForSelector("#setup-database");
  await page.selectOption("#setup-database", "current");
  await page.fill("#owner-name", "اختبار آيفون وويب كيت");
  await page.click('[data-action="start-game"]');
  await page.waitForSelector(".hero-card");
  console.log("Game started on iPhone WebKit.");

  // Wait for Service Worker precache
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const cacheKeys = await page.evaluate(() => caches.keys());
  console.log("Service Worker active, caches:", cacheKeys);

  // 2. Route Navigation & Overflow Verification on iPhone
  const routes = [
    "dashboard",
    "inbox",
    "squad",
    "transfers",
    "facilities",
    "sponsors",
    "finance",
    "database",
    "legends",
    "careers",
    "settings",
  ];

  const primary = ["dashboard", "inbox", "transfers", "facilities"];
  for (const route of routes) {
    if (primary.includes(route)) {
      await page.click(`.mobile-nav [data-nav="${route}"]`);
    } else {
      await page.click('.mobile-nav [data-action="more"]');
      await page.waitForSelector(".more-grid");
      await page.click(`.more-grid [data-nav="${route}"]`);
    }
    await page.waitForTimeout(150);

    const hasOverflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      return scrollWidth > docWidth + 1;
    });
    if (hasOverflow) results.overflowErrors.push(route);
    results.routesChecked.push(route);
  }
  console.log(`Verified ${results.routesChecked.length} routes on iPhone WebKit.`);

  // Screenshot Dashboard and Legends on iPhone
  await page.click('.mobile-nav [data-nav="dashboard"]');
  await page.screenshot({ path: path.join(shotsDir, "iphone-dashboard.png") });
  await page.click('.mobile-nav [data-action="more"]');
  await page.waitForSelector(".more-grid");
  await page.click('.more-grid [data-nav="legends"]');
  await page.waitForSelector(".legacy-hero");
  await page.screenshot({ path: path.join(shotsDir, "iphone-legends.png") });

  // 3. Real Offline Verification: halt static server to simulate real network loss
  console.log("Severing network server to test genuine offline operation...");
  await new Promise((resolve) => server.close(resolve));

  // Reload page completely offline
  console.log("Reloading page offline in WebKit...");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".hero-card");
  results.offlineReloadPassed = true;
  console.log("Offline reload passed!");

  // Perform gameplay action offline
  await page.click('.mobile-nav [data-nav="transfers"]');
  await page.locator('[data-action="transfer-offer"]').first().click();
  await page.locator('#offer-form button[type="submit"]').click();

  await page.selectOption("#advance-days", "1");
  await page.click('[data-action="advance"]');
  await page.click('[data-action="accept-club"]');
  await page.locator('#contract-form button[type="submit"]').click();
  results.offlineActionPassed = true;
  console.log("Offline action & day advance passed!");

  // Cold new tab offline restore
  const coldPage = await context.newPage();
  coldPage.on("pageerror", (err) => results.pageErrors.push(err.message));
  await coldPage.goto(base, { waitUntil: "domcontentloaded" });
  await coldPage.waitForSelector(".hero-card");
  const restoredSave = await coldPage.evaluate(() =>
    JSON.parse(localStorage.getItem("clubowner.game.v1")),
  );
  assert(restoredSave && restoredSave.date, "Offline state must restore");
  results.offlineColdTabPassed = true;
  console.log("Cold tab offline restore passed! Date:", restoredSave.date);

  await coldPage.screenshot({
    path: path.join(shotsDir, "iphone-offline-restored.png"),
  });
  await coldPage.close();

  // 4. World DB Career on iPhone WebKit: Start from UI, save to IndexedDB, reload
  console.log("Testing World DB (47k players) initialisation & save on iPhone WebKit...");
  const worldPage = await context.newPage();
  worldPage.on("pageerror", (err) => results.pageErrors.push(err.message));
  await worldPage.goto(base, { waitUntil: "domcontentloaded" });
  await worldPage.evaluate(() => localStorage.clear());
  await worldPage.reload({ waitUntil: "domcontentloaded" });
  await worldPage.waitForSelector("#setup-database");
  await worldPage.selectOption("#setup-database", "world");
  await worldPage.click('[data-action="markets-all"]');
  await worldPage.fill("#owner-name", "عالم آيفون وويب كيت");
  await worldPage.click('[data-action="start-game"]');
  await worldPage.waitForSelector(".hero-card", { timeout: 60000 });
  console.log("World game started on iPhone WebKit!");

  const worldCheck = await worldPage.evaluate(() => {
    const raw = localStorage.getItem("clubowner.game.v1");
    const meta = JSON.parse(raw);
    return {
      storage: meta.storage,
      version: meta.version,
      hasKey: !!meta.key,
    };
  });
  console.log("World DB storage check:", worldCheck);
  assert.equal(worldCheck.storage, "indexeddb");
  assert(worldCheck.hasKey);

  // Reload world page offline to confirm IndexedDB deserialization on iPhone WebKit
  console.log("Reloading World DB game on iPhone WebKit...");
  await worldPage.reload({ waitUntil: "domcontentloaded" });
  await worldPage.waitForSelector(".hero-card", { timeout: 60000 });
  results.largeSaveRestored = true;
  console.log("World DB reload & IndexedDB restoration on iPhone WebKit passed!");
  await worldPage.close();
} finally {
  await browser.close();
}

console.log("\n=================== IPHONE WEBKIT TEST REPORT ===================");
console.log(JSON.stringify(results, null, 2));

assert.equal(results.pageErrors.length, 0, "No page errors allowed");
assert.equal(results.overflowErrors.length, 0, "No overflow allowed on iPhone");
assert(results.offlineReloadPassed, "Offline reload must pass");
assert(results.offlineActionPassed, "Offline action must pass");
assert(results.offlineColdTabPassed, "Offline cold tab restore must pass");
console.log("=================== ALL VERIFICATIONS PASSED ===================\n");
