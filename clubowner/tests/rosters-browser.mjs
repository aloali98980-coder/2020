// 0.18 roster browser check: world database career, transfer market shows editorial stars
// (Vinícius restored at Real Madrid), estimated ages with "~", Arabic-edition Smouha squad, and the
// data-sources note. Run: npm run build && npm run preview -- --port 5173, then
// SHOTS=<dir> node tests/rosters-browser.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const SHOTS = process.env.SHOTS || "review";
mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const fail = (m) => { throw new Error(m); };

await page.goto("http://127.0.0.1:5173");
await page.waitForSelector(".club-choice");
await page.selectOption("#setup-database", "world");
await page.waitForSelector('input[name="league"]');
// enable Egypt + Spain + England + Türkiye markets
for (const id of ["eg", "es", "en", "tr"]) {
  const box = page.locator(`input[name="league"][value="${id}"]`);
  if ((await box.count()) && !(await box.isChecked())) await box.check();
}
await page.fill("#owner-name", "عمر");
await page.click('[data-action="start-game"]');
await page.waitForSelector(".hero-card", { timeout: 120000 });

const state = () => page.evaluate(async () => {
  const raw = localStorage.getItem("clubowner.game.v1");
  if (raw) return JSON.parse(raw);
  return null;
});

await page.locator('.sidebar [data-nav="transfers"]').click();
await page.waitForSelector("#player-search");
await page.fill("#player-search", "Vin");
await page.fill("#player-search", "فينيسيوس");
await page.waitForTimeout(300);
let html = await page.content();
if (!html.includes("فينيسيوس جونيور")) fail("Vinícius Júnior not found in the market");
if (!/ريال مدريد|Real Madrid/.test(html)) fail("Vinícius row does not show Real Madrid");
await page.screenshot({ path: `${SHOTS}/rosters-vinicius.png`, fullPage: true });

// estimated ages: a Smouha player (Arabic-edition squad, no published birthday) shows "~"
await page.fill("#player-search", "");
await page.selectOption("#league-filter", "eg");
await page.waitForTimeout(300);
html = await page.content();
const tilde = (html.match(/<td>~[٠-٩0-9]+<\/td>/g) || []).length;
await page.fill("#player-search", "الهاني سليمان");
await page.waitForTimeout(300);
const smouha = await page.content();
if (!smouha.includes("Smouha SC")) fail("Smouha (Arabic-edition squad) player not found in the Egypt market");
await page.fill("#player-search", "");
await page.waitForTimeout(300);
html = await page.content();
if (tilde < 3) fail("Estimated ages are not marked with ~ (found " + tilde + ")");
const ages = (html.match(/<td>~([٠-٩0-9]+)<\/td>/g) || []).map((m) => Number(m.replace(/[^٠-٩0-9]/g, "").replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c))));
if (new Set(ages).size < 3) fail("Estimated ages are not spread: " + ages.join(","));
if (ages.some((a) => a < 18 || a > 36)) fail("Estimated age out of 18–36: " + ages.join(","));
await page.screenshot({ path: `${SHOTS}/rosters-smouha-ages.png`, fullPage: true });

// star profile detail: Mostafa Mohamed (Konyaspor) is a striker via the editorial override
await page.selectOption("#league-filter", "tr");
await page.fill("#player-search", "مصطفى محمد");
await page.waitForTimeout(300);
html = await page.content();
if (!html.includes("مصطفى محمد")) fail("Mostafa Mohamed not found in Türkiye market");
if (!/position-tag">ST</.test(html)) fail("Mostafa Mohamed is not shown as ST");
await page.locator('[data-action="player-detail"]').first().click();
await page.waitForSelector(".career-player");
await page.screenshot({ path: `${SHOTS}/rosters-star-detail.png`, fullPage: true });
await page.keyboard.press("Escape");
if (await page.locator(".modal-backdrop").count()) await page.locator('[data-action="close-modal"]').first().click();
await page.waitForSelector(".modal-backdrop", { state: "detached" });

// data sources screen carries the 0.18 note
await page.locator('.sidebar [data-nav="settings"]').click();
await page.locator('[data-action="data-sources"]').click();
await page.waitForTimeout(300);
html = await page.content();
if (!html.includes("استكمال القوائم (0.18)")) fail("Data sources screen lacks the 0.18 note");
await page.screenshot({ path: `${SHOTS}/rosters-sources.png`, fullPage: true });

const s = await state();
const summary = s?.players ? { players: s.players.length, estimated: s.players.filter((p) => p.ageEstimated).length, stars: s.players.filter((p) => p.abilityMethod === "editorial-estimate").length } : "world save lives in IndexedDB (pointer only in localStorage)";
await browser.close();
if (errors.length) fail("page errors: " + errors.join(" | "));
console.log(JSON.stringify({ ok: true, summary, shots: SHOTS }, null, 2));
