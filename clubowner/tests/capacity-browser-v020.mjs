// 0.20 browser check — long-career capacity in a real Chromium against the built app:
//   npm run build && npm run preview -- --host 0.0.0.0 --port 5173   then   node tests/capacity-browser-v020.mjs
// Starts a full 50-market world career, measures the click-to-idle time of "advance 7 days"
// (simulation + validation + IndexedDB save) over several clicks, reloads the page and checks
// the career resumes from the saved state, opens the talent screen (active / archived counters)
// and, when a retiree exists, opens an archived person from the careers screen.
// Optional: SHOTS=/path/to/dir for screenshots, CLICKS=n (default 8).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.env.BASE_URL || "http://127.0.0.1:5173";
const shots = process.env.SHOTS || "";
const CLICKS = Number(process.env.CLICKS || 8);
if (shots) mkdirSync(shots, { recursive: true });
const shot = async (page, name) => shots && page.screenshot({ path: `${shots}/${name}.png`, fullPage: false });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const fail = (why) => {
  throw new Error(why);
};
const idle = () =>
  page.waitForFunction(() => !document.body.classList.contains("saving-game"), null, { timeout: 120000 });
const topDate = () => page.locator(".timebar .game-date span").first().innerText();

// Resolve whatever required inbox decision blocks the clock, choosing the "decline / acknowledge"
// option so the run never spends money or signs anything.
async function resolvePending() {
  for (let i = 0; i < 12; i++) {
    const open = await page.locator(".message-detail [data-action]").count();
    if (!open) return;
    const ghost = page
      .locator(
        '.message-detail [data-action="resolve"], .message-detail [data-action="retire-respect"], .message-detail [data-action="loan-reject"], .message-detail [data-action="reject-transfer"]',
      )
      .first();
    if (await ghost.count()) {
      await ghost.click();
      await idle();
      continue;
    }
    const any = page.locator(".message-detail button.btn").last();
    if (!(await any.count())) return;
    await any.click();
    await idle();
  }
}

await page.goto(base);
await page.waitForSelector(".club-choice");
await page.selectOption("#setup-database", "world");
await page.click("[data-action=markets-all]");
if ((await page.locator("input[name=league]:checked").count()) !== 50) fail("50 markets expected");
await page.fill("#owner-name", "مشوار طويل");
const t0 = Date.now();
await page.click('[data-action="start-game"]');
await page.waitForSelector(".hero-card", { timeout: 180000 });
await idle();
const startupMs = Date.now() - t0;
const marker = await page.evaluate(() => JSON.parse(localStorage.getItem("clubowner.game.v1")));
if (marker.storage !== "indexeddb") fail("world career should live in IndexedDB");
const versionText = await page.locator(".sidebar-bottom").innerText();
if (!versionText.includes("0.20")) fail("Sidebar version label: " + versionText);

// Clicks: advance 7 days each; blocked clicks (required decision) are resolved and not timed.
const clicks = [];
let lastDate = await topDate();
for (let i = 0; i < CLICKS; i++) {
  await page.selectOption("#advance-days", "7").catch(() => {});
  const a = Date.now();
  await page.click('[data-action="advance"]');
  await page.waitForFunction(() => document.body.classList.contains("saving-game"), null, { timeout: 5000 }).catch(() => {});
  await idle();
  const ms = Date.now() - a;
  const date = await topDate();
  const blocked = (await page.locator(".message-detail").count()) > 0 && (await page.locator(".message-detail [data-action]").count()) > 0;
  clicks.push({ ms, from: lastDate, to: date, blocked });
  lastDate = date;
  if (blocked) {
    await resolvePending();
    await page.locator('.sidebar [data-nav="dashboard"]').click();
    await page.waitForSelector(".hero-card");
  }
}
await shot(page, "capacity-dashboard");
const timed = clicks.filter((c) => !c.blocked && c.from !== c.to);
if (timed.length < 3) fail("Too few timed clicks: " + JSON.stringify(clicks));
const avgMs = Math.round(timed.reduce((n, c) => n + c.ms, 0) / timed.length);
const maxMs = Math.max(...timed.map((c) => c.ms));

// Reload: the career resumes from IndexedDB at the same date.
const before = lastDate;
const r0 = Date.now();
await page.reload();
await page.waitForSelector(".hero-card", { timeout: 180000 });
await idle();
const reloadMs = Date.now() - r0;
const after = await topDate();
if (after !== before) fail(`Date changed across reload: ${before} → ${after}`);

// Careers screen (talent + staff): the 0.20 continuity paragraph shows active / archived counters,
// and staff candidates come from the retiree archive — open one if present.
await page.locator('.sidebar [data-nav="careers"]').click();
await page.waitForSelector("main .panel");
const careersText = await page.locator("main").innerText();
if (!careersText.includes("لاعبًا نشطًا") || !careersText.includes("معتزلًا في الأرشيف")) fail("Talent continuity counters missing");
if (!careersText.includes("50 ألف لاعب نشط")) fail("Talent cap text missing");
await shot(page, "capacity-careers");
const candidate = page.locator('main [data-action="player-detail"]').first();
let openedRetiree = false;
if (await candidate.count()) {
  await candidate.click();
  await page.waitForSelector(".modal-content");
  const text = await page.locator(".modal-content").innerText();
  openedRetiree = text.includes("معتزل");
  await shot(page, "capacity-retiree-profile");
  await page.keyboard.press("Escape");
}

// Settings page shows the 0.20 badge.
await page.locator('.sidebar [data-nav="settings"]').click();
await page.waitForSelector("main .panel");
if (!(await page.locator("main").innerText()).includes("0.20")) fail("Settings badge missing 0.20");

const result = {
  ok: true,
  startupMs,
  clicks,
  timedClicks: timed.length,
  avgClickMs: avgMs,
  maxClickMs: maxMs,
  reloadMs,
  date: after,
  openedRetiree,
  errors,
};
console.log(JSON.stringify(result, null, 1));
await browser.close();
if (errors.length) process.exit(1);
