import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const base = process.env.TEST_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => console.log("BROWSER:", m.type(), m.text()));

  console.log("1. Starting game locally...");
  await page.goto(base);
  await page.waitForSelector("#setup-database");
  await page.selectOption("#setup-database", "current");
  await page.fill("#owner-name", "مالك السحابة التجريبي");
  await page.click('[data-action="start-game"]');
  await page.waitForSelector(".hero-card");

  // Advance 1 day
  await page.selectOption("#advance-days", "1");
  await page.click('[data-action="advance"]');
  await page.waitForSelector(".hero-card");

  const initialSave = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("clubowner.game.v1")),
  );
  console.log("Local game started, date:", initialSave.date, "cash:", initialSave.finance.cash);

  // 2. Open settings and register cloud account
  console.log("2. Navigating to settings to register cloud account...");
  await page.click('.mobile-nav [data-action="more"]');
  await page.waitForSelector(".more-grid");
  await page.click('.more-grid [data-nav="settings"]');
  await page.waitForSelector(".cloud-panel");

  await page.click('[data-action="open-auth-modal"]');
  await page.waitForSelector(".auth-tabs");

  // Switch to register tab
  await page.click('[data-action="auth-tab-register"]');
  await page.waitForSelector("#auth-register-form");

  const testId = Date.now().toString().slice(-6);
  const testEmail = `owner-${testId}@testcloud.com`;
  const testUsername = `CloudMaster${testId}`;
  await page.fill('#auth-register-form input[name="email"]', testEmail);
  await page.fill('#auth-register-form input[name="username"]', testUsername);
  await page.fill('#auth-register-form input[name="password"]', "password123");
  await page.click('#auth-register-form button[type="submit"]');

  // Verify signed in
  await page.waitForSelector(".cloud-user-box");
  const userText = await page.locator(".cloud-user-box").innerText();
  console.log("Account created successfully:", userText.replace(/\n/g, " "));
  assert(userText.includes(testUsername));

  // 3. Sync local game to cloud
  console.log("3. Syncing current career to cloud...");
  await page.click('[data-action="cloud-sync-now"]');
  await page.waitForTimeout(1000);
  const syncStatus = await page.locator(".cloud-sync-status").innerText();
  console.log("Sync status:", syncStatus);
  assert(!syncStatus.includes("لم تتم"));

  await page.screenshot({ path: "shots-0.22-cloud/cloud-settings-synced.png" });

  // 4. Simulate switching to a fresh device / clearing browser cache
  console.log("4. Simulating device change: clearing browser localStorage and caches...");
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) || [];
    for (const r of regs) await r.unregister();
    const keys = (await caches?.keys?.()) || [];
    for (const k of keys) await caches.delete(k);
  });
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("#setup-database");
  console.log("Browser reloaded as fresh device with no local saves.");

  // 5. Restore from cloud on the new device
  console.log("5. Logging into cloud from fresh device...");
  await page.click('[data-action="cloud-restore-prompt"]');
  await page.waitForSelector("#auth-login-form");

  await page.fill('#auth-login-form input[name="identifier"]', testEmail);
  await page.fill('#auth-login-form input[name="password"]', "password123");
  await page.click('#auth-login-form button[type="submit"]');

  // Wait for login modal to finish and close
  await page.waitForSelector("#auth-login-form", { state: "detached" });
  await page.waitForTimeout(400);

  // Now trigger cloud restore
  console.log("6. Restoring career from cloud...");
  await page.click('[data-action="cloud-restore-prompt"]');
  await page.waitForSelector(".cloud-diff-grid");

  await page.screenshot({ path: "shots-0.22-cloud/cloud-restore-modal.png" });

  const cloudDiffText = await page.locator(".cloud-diff-grid").innerText();
  console.log("Cloud diff inspection:\n", cloudDiffText);
  assert(cloudDiffText.includes("الأهلي"));
  assert(cloudDiffText.includes("سبتمبر"));

  // Confirm cloud restore
  await page.click('[data-action="confirm-cloud-restore"]');
  await page.waitForSelector(".hero-card");

  // 6. Verify restored state
  const restoredSave = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("clubowner.game.v1")),
  );
  console.log(
    "Restored game date:",
    restoredSave.date,
    "cash:",
    restoredSave.finance.cash,
  );
  assert.equal(restoredSave.date, initialSave.date);
  assert.equal(restoredSave.finance.cash, initialSave.finance.cash);
  assert.equal(restoredSave.clubId, initialSave.clubId);

  assert.deepEqual(errors, []);
  console.log("\n>>> CLOUD AUTH & SYNC E2E BROWSER TEST PASSED 100%! <<<\n");
} finally {
  await browser.close();
}
