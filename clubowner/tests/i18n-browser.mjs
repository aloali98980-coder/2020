// Browser sweep for 0.19 translations: run `npm run build && npm run preview -- --port 5173`
// then `node tests/i18n-browser.mjs`. Optional: SHOTS=/path/to/dir to save screenshots.
// Starts a "current" career (or DB=world for the expanded world career), switches the interface to English and then French, visits all
// sidebar routes plus the legends detail, contract, sponsor and player modals, advances a week,
// and fails when any visible text node (outside [data-no-translate]) still contains Arabic.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.env.BASE_URL || "http://127.0.0.1:5173";
const shots = process.env.SHOTS || "";
if (shots) mkdirSync(shots, { recursive: true });
const shot = async (page, name) =>
  shots && page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });

const ROUTES = [
  "dashboard",
  "inbox",
  "squad",
  "transfers",
  "facilities",
  "sponsors",
  "finance",
  "database",
  "world",
  "legends",
  "careers",
  "commerce",
  "management",
  "press",
  "settings",
];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const fail = (why) => {
  throw new Error(why);
};

// Every visible text node / placeholder / aria-label that still carries Arabic letters.
const leftovers = () =>
  page.evaluate(() => {
    const AR = /[ء-ي]/;
    const out = [];
    // Cheap visibility: no layout boxes = hidden; the toast fades out with opacity only.
    const hidden = (el) =>
      el.getClientRects().length === 0 || el.closest("#toast:not(.visible)");
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    let n;
    while ((n = walker.nextNode())) {
      if (!AR.test(n.nodeValue)) continue;
      const el = n.parentElement;
      if (!el || el.closest("script,style,[data-no-translate]") || hidden(el))
        continue;
      out.push({
        text: n.nodeValue.trim().slice(0, 160),
        where: (el.closest("[class]")?.className || el.tagName)
          .toString()
          .slice(0, 60),
      });
    }
    for (const el of document.querySelectorAll("[placeholder],[aria-label]")) {
      for (const attr of ["placeholder", "aria-label"]) {
        const v = el.getAttribute(attr);
        if (v && AR.test(v))
          out.push({ text: `${attr}=${v}`, where: el.tagName });
      }
    }
    if (AR.test(document.title))
      out.push({ text: `title=${document.title}`, where: "document" });
    return out;
  });
const report = {};
let total = 0;
const audit = async (lang, label) => {
  const found = await leftovers();
  report[`${lang}:${label}`] = found;
  total += found.length;
  if (found.length)
    console.log(
      `  ✗ ${lang} ${label}: ${found.length} Arabic text node(s)`,
      found.slice(0, 5),
    );
  else console.log(`  ✓ ${lang} ${label}`);
};
const closeModal = async () => {
  if (await page.locator(".modal-backdrop").count()) {
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () => !document.querySelector(".modal-backdrop"),
    );
  }
};
// Sidebar navigation; an open modal backdrop would otherwise swallow the click.
const idle = () =>
  page.waitForFunction(
    () => !document.body.classList.contains("saving-game"),
    null,
    { timeout: 120000 },
  );
const nav = async (route) => {
  await closeModal();
  await idle(); // clicks are ignored while a (world) save is being written
  await page.locator(`.sidebar [data-nav="${route}"]`).click();
  await page.waitForFunction(
    (r) =>
      document
        .querySelector(`.sidebar [data-nav="${r}"]`)
        ?.classList.contains("active"),
    route,
  );
};

// 1. Setup screen translates before any save exists (language selector on the setup page).
await page.goto(base);
await page.waitForSelector(".club-choice");
for (const lang of ["en", "fr"]) {
  await page.selectOption("#setup-language", lang);
  await page.waitForFunction((l) => document.documentElement.lang === l, lang);
  await audit(lang, "setup");
  await shot(page, `setup-${lang}`);
}
await page.selectOption("#setup-language", "ar");
if (process.env.DB === "world") {
  // Expanded world career (default database): lower tiers, competitions view, generated players.
  await page.selectOption("#setup-career-mode", "expanded");
  await page.selectOption("#setup-region", "eg");
  await page.selectOption("#setup-tier", "2");
  await page.click("[data-action=markets-all]");
} else await page.selectOption("#setup-database", "current");
await page.fill("#owner-name", "مالك الأساطير");
await page.click('[data-action="start-game"]');
await page.waitForSelector(".hero-card", { timeout: 90000 });
// The welcome toast was rendered in Arabic before any switch; let it expire (5 s) first.
await page.waitForFunction(
  () => document.getElementById("toast")?.className === "",
  null,
  { timeout: 8000 },
);

for (const lang of ["en", "fr"]) {
  console.log(`— ${lang}`);
  // 2. In-game switch lives in settings and persists in the save.
  await nav("settings");
  await page.waitForSelector("#game-language");
  await page.selectOption("#game-language", lang);
  await page.waitForFunction((l) => document.documentElement.lang === l, lang);
  await idle();
  // The "current" save sits in localStorage; the world save keeps only a pointer there (IndexedDB).
  const saved = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("clubowner.game.v1") || "null");
    return raw?.preferences ? raw.preferences.language : "n/a";
  });
  if (saved !== "n/a" && saved !== lang)
    fail(`language not persisted: ${saved}`);

  // 3. Every sidebar route.
  for (const route of ROUTES) {
    await nav(route);
    await page.waitForFunction(
      (r) =>
        document
          .querySelector(`.sidebar [data-nav="${r}"]`)
          ?.classList.contains("active"),
      route,
    );
    await page.waitForTimeout(50);
    await audit(lang, route);
    if (
      ["dashboard", "squad", "finance", "legends", "management"].includes(route)
    )
      await shot(page, `${route}-${lang}`);
  }

  // 3b. Expanded world: every division view and the continental cards.
  if (process.env.DB === "world") {
    await nav("world");
    await page.waitForSelector("#division-view");
    const options = await page
      .locator("#division-view option")
      .evaluateAll((els) => els.map((o) => o.value));
    for (const value of options.slice(0, 4)) {
      await page.selectOption("#division-view", value);
      await page.waitForTimeout(60);
      await audit(lang, `world:${value}`);
    }
    const summaries = await page
      .locator("main details:not([open]) > summary")
      .all();
    for (const d of summaries.slice(0, 8)) await d.click().catch(() => {});
    await page.waitForTimeout(60);
    await audit(lang, "world:details-open");
    await shot(page, `world-${lang}`);
  }

  // 4. Finance tabs and inbox message detail.
  await nav("finance");
  for (const tab of ["ledger", "obligations"]) {
    await page.locator(`[data-action="finance-tab"][data-id="${tab}"]`).click();
    await page.waitForTimeout(30);
    await audit(lang, `finance:${tab}`);
  }
  await nav("inbox");
  const firstMessage = page.locator('[data-action="open-message"]').first();
  if (await firstMessage.count()) {
    await firstMessage.click();
    await idle();
    await audit(lang, "inbox:detail");
    await shot(page, `inbox-detail-${lang}`);
  }

  // 5. Modals: legend detail + offer form, player contract, sponsor offer.
  await nav("legends");
  await page.waitForSelector(".legend-grid .legend-card");
  await page.selectOption("#legend-country", "eg");
  await page.waitForFunction(
    () => document.querySelectorAll(".legend-grid .legend-card").length <= 24,
  );
  await page.locator('[data-action="legend-detail"]').first().click();
  await page.waitForSelector("#legend-offer-form");
  await audit(lang, "modal:legend");
  await shot(page, `legend-modal-${lang}`);
  await closeModal();

  await nav("squad");
  await page.locator('[data-action="player-detail"]').first().click();
  await page.waitForSelector(".modal-backdrop");
  await audit(lang, "modal:player");
  await shot(page, `player-modal-${lang}`);
  await closeModal();
  await nav("transfers");
  await page.locator('[data-action="player-detail"]').first().click();
  await page.waitForSelector(".modal-backdrop");
  await audit(lang, "modal:transfer-target");
  await closeModal();
  await nav("sponsors");
  const sponsor = page.locator('[data-action="sponsor-offers"]').first();
  if (await sponsor.count()) {
    await sponsor.click();
    await page.waitForSelector(".modal-backdrop");
    await audit(lang, "modal:sponsor");
    await shot(page, `sponsor-modal-${lang}`);
    await closeModal();
  }

  // 6. Advance a week: match reports and ledger entries are generated at runtime.
  await nav("dashboard");
  await page.selectOption("#advance-days", "7");
  await page.click('[data-action="advance"]');
  await page.waitForTimeout(400);
  await idle();
  await closeModal();
  await audit(lang, "after-advance:dashboard");
  await nav("inbox");
  await page.waitForTimeout(50);
  const latest = page.locator('[data-action="open-message"]').first();
  if (await latest.count()) await latest.click();
  await idle();
  await audit(lang, "after-advance:inbox");
  await nav("finance");
  await page.waitForTimeout(50);
  await audit(lang, "after-advance:finance");
}

// 7. Back to Arabic: the source language renders untouched (no double translation artefacts).
await nav("settings");
await page.selectOption("#game-language", "ar");
await page.waitForFunction(() => document.documentElement.lang === "ar");
const arabicHeading = await page.locator("h1").first().innerText();
if (!/[ء-ي]/.test(arabicHeading))
  fail("Arabic heading missing after switching back: " + arabicHeading);

if (shots)
  writeFileSync(`${shots}/i18n-report.json`, JSON.stringify(report, null, 2));
await browser.close();
if (errors.length)
  fail("console/page errors: " + errors.slice(0, 5).join(" | "));
if (total)
  fail(
    `${total} Arabic leftover(s) across ${Object.values(report).filter((r) => r.length).length} screens`,
  );
console.log(
  "i18n browser sweep OK — no Arabic leftovers in EN/FR across",
  Object.keys(report).length,
  "screens",
);
