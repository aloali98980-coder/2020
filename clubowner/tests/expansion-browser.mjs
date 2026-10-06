import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
const results = [];
const url = process.env.TEST_URL || "http://127.0.0.1:5173";
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const b = await type.launch();
  try {
    const ctx = await b.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const p = await ctx.newPage(),
      errors = [],
      overflows = [];
    p.on("pageerror", (e) => errors.push(e.message));
    const done = () =>
      p.waitForFunction(() => !document.body.classList.contains("saving-game"));
    const nav = async (name) => {
      await p.click(".mobile-nav [data-action=more]");
      await p.click(`.more-grid [data-nav=${name}]`);
    };
    const read = () =>
      p.evaluate(async () => {
        const marker = JSON.parse(localStorage.getItem("clubowner.game.v1"));
        const db = await new Promise((r, j) => {
          const q = indexedDB.open("clubowner.world.saves", 1);
          q.onsuccess = () => r(q.result);
          q.onerror = () => j(q.error);
        });
        return new Promise((res, rej) => {
          const r = db
            .transaction("saves")
            .objectStore("saves")
            .get(marker.key);
          r.onsuccess = () => {
            const s = r.result;
            db.close();
            res({
              version: s.version,
              players: s.players.length,
              generated: s.players.filter((p) => p.generated).length,
              clubs: s.expansion.divisions.reduce(
                (n, d) => n + d.clubs.length,
                0,
              ),
              divisions: s.expansion.divisions.length,
              cups: s.expansion.cups.length,
              inventory: s.commerce.inventory,
              subscriptions: s.commerce.seasonTickets,
              coach: s.management.coach?.id,
              tactic: s.management.tactic,
              lineup: s.management.lineup.length,
              promises: s.press.promises.length,
              loan: s.players.filter((p) => p.loan && p.clubId === s.clubId)
                .length,
              cash: s.finance.cash,
              ticket: s.ticketPrice,
            });
          };
          r.onerror = () => rej(r.error);
        });
      });
    await p.goto(url);
    await p.selectOption("#setup-career-mode", "expanded");
    await p.selectOption("#setup-region", "en");
    await p.selectOption("#setup-tier", "4");
    await p.fill("#owner-name", "مشوار من الدرجة الرابعة");
    await p.click("[data-action=markets-all]");
    const start = Date.now();
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    const startupMs = Date.now() - start;
    const first = await read();
    assert.equal(first.version, 5);
    assert.equal(first.divisions, 64);
    assert(first.players > 28000);
    assert(first.generated > 5000);
    await nav("commerce");
    await p.fill("#commerce-prices input[name=ticket]", "150");
    await p.locator("#commerce-prices button").click();
    await done();
    assert.equal((await read()).ticket, 150);
    await p.click("[data-action=business-open][data-id=shop]");
    await done();
    await p.locator("#shop-stock button").click();
    await done();
    assert.equal((await read()).inventory, 100);
    await p.click("[data-action=sell-subscriptions]");
    await done();
    assert((await read()).subscriptions > 0);
    await p.screenshot({
      path: `review/v05-${engine}-commerce.png`,
      fullPage: true,
    });
    await nav("management");
    await p.click("[data-action=appoint-coach][data-id=youth]");
    await done();
    assert.equal((await read()).coach, "youth");
    await p.selectOption("#team-tactic", "attack");
    await done();
    assert.equal((await read()).tactic, "attack");
    await p.locator("[data-action=toggle-lineup]").first().click();
    await done();
    assert.equal((await read()).lineup, 1);
    await p.click("[data-action=prospect-report]");
    await done();
    await p.click("[data-action=incoming-loan]");
    await done();
    assert.equal((await read()).loan, 1);
    await p.selectOption("#advance-days", "1");
    await p.click("[data-action=advance]");
    await done();
    await nav("press");
    await p.locator("[data-action=press-demand]").first().click();
    await done();
    assert.equal((await read()).promises, 1);
    await p.screenshot({
      path: `review/v05-${engine}-press.png`,
      fullPage: true,
    });
    for (const route of [
      "world",
      "commerce",
      "management",
      "press",
      "squad",
      "transfers",
    ]) {
      await nav(route);
      if (
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )
      )
        overflows.push(route);
    }
    await nav("world");
    assert.equal(await p.locator("#division-view option").count(), 64);
    await p.screenshot({
      path: `review/v05-${engine}-competitions.png`,
      fullPage: true,
    });
    const saved = await read();
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    assert.deepEqual(await read(), saved);
    await nav("settings");
    await p.selectOption("#game-language", "fr");
    await p.waitForFunction(() => document.documentElement.lang === "fr");
    await nav("commerce");
    if (
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    )
      overflows.push("FR commerce");
    assert.deepEqual(errors, []);
    assert.deepEqual(overflows, []);
    results.push({
      engine,
      startupMs,
      ...saved,
      errors,
      overflows,
      checks:
        "English fourth-tier career, all markets, ticket prices, merchandise, season tickets, coach, lineup, tactics, scouting, loan, press promise, 64 divisions, reload, French direction",
    });
  } finally {
    await b.close();
  }
}
console.log(JSON.stringify(results, null, 2));
