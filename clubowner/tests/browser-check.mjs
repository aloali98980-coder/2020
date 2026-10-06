import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
await page.waitForSelector(".club-choice");
await page.selectOption("#setup-database","current");
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "review/setup-desktop.png", fullPage: true });
await page.fill("#owner-name", "عمر");
await page.click('[data-action="start-game"]');
await page.waitForSelector(".hero-card");
await page.screenshot({ path: "review/dashboard-desktop.png", fullPage: true });
await page.locator('.sidebar [data-nav="transfers"]').click();
await page.locator('[data-action="transfer-offer"]').first().click();
await page.locator("#offer-form button[type=submit]").click();
await page.selectOption("#advance-days", "1");
await page.click('[data-action="advance"]');
await page.click('[data-action="accept-club"]');
await page.locator("#contract-form button[type=submit]").click();
let state = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("clubowner.game.v1")),
);
if (state.players.filter((p) => p.clubId === state.clubId).length !== 19)
  throw Error("Transfer did not register player");
await page.locator('.sidebar [data-nav="facilities"]').click();
await page
  .locator('[data-action="facility-detail"][data-id="training"]')
  .click();
await page.click('[data-action="toggle-staff"]');
await page.locator("#project-form button[type=submit]").click();
await page.locator('.sidebar [data-nav="sponsors"]').click();
await page.locator('[data-action="sponsor-offers"][data-id="sleeve"]').click();
await page.locator('[data-action="confirm-sponsor"]').first().click();
await page.locator('[data-action="sign-sponsor"]').click();
await page.locator('.sidebar [data-nav="finance"]').click();
await page.click('[data-action="loan-modal"]');
await page.click('[data-action="take-loan"]');
for (const route of [
  "dashboard",
  "inbox",
  "squad",
  "transfers",
  "facilities",
  "sponsors",
  "finance",
  "world",
  "legends",
  "careers",
  "settings",
]) {
  await page.locator(`.sidebar [data-nav="${route}"]`).click();
  if (!(await page.locator("h1").count()))
    throw Error("Missing screen " + route);
}
await page.reload();
await page.waitForSelector(".hero-card");
state = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("clubowner.game.v1")),
);
if (state.finance.loans.length !== 1) throw Error("Save did not persist");
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const mp = await mobile.newPage();
mp.on("pageerror", (e) => errors.push(e.message));
await mp.goto("http://127.0.0.1:5173");
await mp.selectOption("#setup-database","current");
await mp.waitForSelector(".club-choice");
await mp.evaluate(() => document.fonts.ready);
await mp.screenshot({ path: "review/setup-mobile.png", fullPage: true });
await mp.click('[data-action="start-game"]');
await mp.waitForSelector(".hero-card");
await mp.screenshot({ path: "review/dashboard-mobile.png", fullPage: true });
const widths = [];
for (const route of [
  "dashboard",
  "inbox",
  "squad",
  "transfers",
  "facilities",
  "sponsors",
  "finance",
  "world",
  "legends",
  "careers",
  "settings",
]) {
  await mp.locator('.mobile-nav [data-action="more"]').click();
  await mp.locator(`.more-grid [data-nav="${route}"]`).click();
  const overflow = await mp.evaluate(() => ({
    body: document.documentElement.scrollWidth,
    view: innerWidth,
  }));
  if (overflow.body > overflow.view) widths.push({ route, ...overflow });
}
await mp.locator('.mobile-nav [data-nav="dashboard"]').click();
await mp.click('[data-action="advance"]');
state = await mp.evaluate(() =>
  JSON.parse(localStorage.getItem("clubowner.game.v1")),
);
if (state.date !== "2026-09-27" || state.remainingDays !== 4)
  throw Error("Mobile time interrupt failed");
await mp.screenshot({ path: "review/inbox-mobile.png", fullPage: true });
console.log(
  JSON.stringify(
    {
      errors,
      overflow: widths,
      checks:
        "desktop transfer, project, sponsorship, loan, save/reload; all 11 routes on desktop/mobile; mobile inbox interrupt",
    },
    null,
    2,
  ),
);
await browser.close();
if (errors.length || widths.length) process.exit(1);
