// Browser check for 0.17 legends: run `npm run build && npm run preview -- --port 5173`
// then `node tests/legends-browser.mjs`. Optional: SHOTS=/path/to/dir to save screenshots.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.env.BASE_URL || "http://127.0.0.1:5173";
const shots = process.env.SHOTS || "";
if (shots) mkdirSync(shots, { recursive: true });
const shot = async (page, name) => shots && page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const fail = (why) => {
  throw new Error(why);
};
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("clubowner.game.v1")));

await page.goto(base);
await page.waitForSelector(".club-choice");
await page.selectOption("#setup-database", "current");
await page.fill("#owner-name", "مالك الأساطير");
await page.click('[data-action="start-game"]');
await page.waitForSelector(".hero-card");

// 1. Screen renders with hero, catalogue and filters.
await page.locator('.sidebar [data-nav="legends"]').click();
await page.waitForSelector(".legend-grid .legend-card");
const h1 = await page.locator("h1").innerText();
if (!h1.includes("قاعة الأساطير")) fail("Legends heading missing: " + h1);
const total = await page.locator(".legend-grid .legend-card").count();
if (total < 20) fail("Catalogue page too small: " + total);
if (!(await page.locator("#legend-player-mode").isChecked())) fail("Player mode should default on");
await shot(page, "legends-desktop");

// 2. Filters narrow the list and keep the DOM intact.
await page.selectOption("#legend-country", "eg");
await page.waitForFunction(() => document.querySelectorAll(".legend-grid .legend-card").length <= 24);
const egyptian = await page.locator(".legend-grid .legend-card").count();
if (egyptian < 10 || egyptian > 24) fail("Egyptian filter unexpected: " + egyptian);
await page.selectOption("#legend-group", "gk");
const keepers = await page.locator(".legend-grid .legend-card").count();
if (keepers < 1 || keepers >= egyptian) fail("Group filter unexpected: " + keepers);
await page.selectOption("#legend-group", "all");
await page.selectOption("#legend-tier", "mine");
const mine = await page.locator(".legend-grid .legend-card").count();
if (mine < 5) fail("Club-linked filter unexpected: " + mine);
await page.selectOption("#legend-tier", "all");
await page.selectOption("#legend-country", "eg");
await page.waitForFunction(() => document.querySelectorAll(".legend-grid .legend-card").length <= 24);

// 3. Rival refuses: submit is disabled.
await page.locator('[data-action="legend-detail"][data-id="gaafar"]').click();
await page.waitForSelector("#legend-offer-form");
if (!(await page.locator('#legend-offer-form button[type="submit"]').isDisabled())) fail("Rival legend should be refused");
if (!(await page.locator(".modal-content").innerText()).includes("غريم")) fail("Rival reason missing");
await page.click('[data-action="close-modal"]');

// 4. Sign El Khatib as attack coach through the modal, switching roles first.
await page.locator('[data-action="legend-detail"][data-id="elkhatib"]').click();
await page.waitForSelector("#legend-offer-form");
await page.selectOption("#legend-offer-role", "player");
await page.waitForFunction(() => document.querySelectorAll("#legend-offer-years option").length === 2);
await page.selectOption("#legend-offer-role", "attack");
await page.waitForFunction(() => document.querySelectorAll("#legend-offer-years option").length === 3);
await page.selectOption("#legend-offer-years", "2");
const modalText = await page.locator(".modal-content").innerText();
if (!modalText.includes("يقبل")) fail("El Khatib should accept at Al Ahly");
await shot(page, "legends-offer-modal");
const cashBefore = (await state()).finance.cash;
await page.locator('#legend-offer-form button[type="submit"]').click();
await page.waitForSelector(".legend-contracts .legend-contract");
let s = await state();
if (s.legends.contracts.length !== 1 || s.legends.contracts[0].role !== "attack") fail("Contract not saved");
if (!(s.finance.cash < cashBefore)) fail("Fee not charged");
const contractId = s.legends.contracts[0].id;
if (!(await page.locator(".legend-contract").innerText()).includes("يستفيد")) fail("Impact summary missing");
await shot(page, "legends-contract");

// 5. Player mode toggle persists and removes the player role.
await page.locator("#legend-player-mode").click();
await page.waitForFunction(() => !JSON.parse(localStorage.getItem("clubowner.game.v1")).legends.playerMode);
await page.locator('[data-action="legend-detail"][data-id="elhadary"]').click();
await page.waitForSelector("#legend-offer-form");
const roles = await page.locator("#legend-offer-role option").allInnerTexts();
if (roles.some((r) => r.includes("عودة كلاعب"))) fail("Player role should be hidden when mode is off");
if (!roles.some((r) => r.includes("حراس"))) fail("GK legend should offer the GK coach role");
await page.click('[data-action="close-modal"]');
await page.selectOption("#legend-country", "all");

// 6. Advance one day; the contract survives and the screen is still healthy.
await page.selectOption("#advance-days", "1");
await page.click('[data-action="advance"]');
await page.waitForTimeout(400);
await page.locator('.sidebar [data-nav="legends"]').click();
await page.waitForSelector(".legend-contracts .legend-contract");

// 7. Renew then release through the modals.
await page.locator(`[data-action="legend-renew"][data-id="${contractId}"]`).click();
await page.waitForSelector("#legend-renew-form");
await page.locator('#legend-renew-form button[type="submit"]').click();
await page.waitForFunction(() => !document.querySelector("#legend-renew-form"));
s = await state();
if (s.legends.contracts[0].years !== 3) fail("Renewal did not extend the contract");
await page.locator(`[data-action="legend-release"][data-id="${contractId}"]`).click();
await page.waitForSelector('[data-action="confirm-legend-release"]');
await page.locator('[data-action="confirm-legend-release"]').click();
await page.waitForSelector(".empty-state");
s = await state();
if (s.legends.contracts[0].status !== "ended") fail("Release did not end the contract");

// 8. Every screen still has a real main column (no collapsed layout) after the new feature.
for (const route of ["dashboard", "inbox", "squad", "transfers", "facilities", "sponsors", "finance", "world", "legends", "careers", "settings"]) {
  await page.locator(`.sidebar [data-nav="${route}"]`).click();
  if (!(await page.locator("h1").count())) fail("Missing screen " + route);
  const width = await page.evaluate(() => document.querySelector("main")?.getBoundingClientRect().width || 0);
  if (width < 600) fail(`Main column collapsed on ${route}: ${width}px`);
}

// 9. Reload keeps everything; mobile layout renders the legends screen.
await page.reload();
await page.waitForSelector(".hero-card");
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('[data-action="more"]').click();
await page.locator('[data-nav="legends"]').last().click();
await page.waitForSelector(".legend-grid .legend-card");
const mobileWidth = await page.evaluate(() => document.querySelector("main").getBoundingClientRect().width);
if (mobileWidth < 300) fail("Mobile main collapsed: " + mobileWidth);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) fail("Horizontal overflow on mobile legends: " + overflow);
await shot(page, "legends-mobile");
s = await state();
if (s.legends.playerMode !== false) fail("Player mode did not persist across reload");

if (errors.length) fail("Page errors: " + errors.join(" | "));
await browser.close();
console.log(`legends browser check ok — catalogue ${total}+ cards, contract ${contractId} signed/renewed/released, 11 screens intact, mobile width ${Math.round(mobileWidth)}px`);
