import { webkit } from "@playwright/test";
const browser = await webkit.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
await page.selectOption("#setup-database","current");
await page.fill("#owner-name", "مالك تجريبي");
await page.click('[data-action="start-game"]');
await page.waitForSelector(".hero-card");
await page.locator('.mobile-nav [data-nav="transfers"]').click();
await page.locator('[data-action="transfer-offer"]').first().click();
await page.locator("#offer-form button[type=submit]").click();
await page.selectOption("#advance-days", "1");
await page.click('[data-action="advance"]');
await page.click('[data-action="accept-club"]');
await page.locator("#contract-form button[type=submit]").click();
await page.locator('.mobile-nav [data-action="more"]').click();
await page.locator('.more-grid [data-nav="settings"]').click();
await page.check("#pause-matches");
await page.reload();
await page.waitForSelector(".hero-card");
const state = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("clubowner.game.v1")),
);
if (state.players.filter((p) => p.clubId === state.clubId).length !== 19)
  throw Error("Transfer failure");
if (!state.preferences.pauseMatches) throw Error("Save failure");
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > innerWidth,
);
await page.screenshot({ path: "review/webkit-mobile.png", fullPage: true });
console.log(
  JSON.stringify({
    engine: "WebKit",
    device: "390×844 mobile emulation (not a physical iPhone)",
    errors,
    overflow,
    flow: "setup → offer → time pause → contract → settings → reload",
  }),
);
await browser.close();
if (errors.length || overflow) process.exit(1);
