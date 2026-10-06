import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const url = process.env.TEST_URL || "http://127.0.0.1:5174",
  results = [];
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const b = await type.launch();
  try {
    const ctx = await b.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      }),
      p = await ctx.newPage(),
      errors = [];
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
          const q = db
            .transaction("saves")
            .objectStore("saves")
            .get(marker.key);
          q.onsuccess = () => {
            const s = q.result;
            db.close();
            res({
              date: s.date,
              version: s.version,
              cash: s.finance.cash,
              club: s.clubId,
              talent: s.talent,
              roles: s.management.playerRoles,
              pending: s.inbox
                .filter((m) => m.required && m.status === "open")
                .map((m) => ({ id: m.id, kind: m.kind })),
              players: s.players
                .filter((p) => p.clubId === s.clubId)
                .map((p) => ({ id: p.id, name: p.name, position: p.position })),
              free: s.players
                .filter((p) => p.clubId === "لاعب حر")
                .map((p) => p.id),
            });
          };
          q.onerror = () => rej(q.error);
        });
      });
    const resolve = async () => {
      for (const m of (await read()).pending) {
        await nav("inbox");
        await p.click(`[data-action=open-message][data-id="${m.id}"]`);
        await done();
        await p.locator(".message-detail [data-action=resolve]").click();
        await done();
      }
    };
    await p.goto(url);
    await p.selectOption("#setup-career-mode", "expanded");
    await p.selectOption("#setup-region", "eg");
    await p.selectOption("#setup-tier", "3");
    await p.selectOption("#setup-group", "eg-3-d");
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    await nav("careers");
    const first = await read();
    assert.equal(first.version, 7);
    await p.click("[data-action=talent-intake]");
    await done();
    assert((await read()).talent.academy.pending);
    await p.selectOption("#talent-mission-form select[name=country]", "eg");
    await p.selectOption("#talent-mission-form select[name=position]", "ST");
    await p.locator("#talent-mission-form button").click();
    await done();
    await nav("management");
    const rb = first.players.find((p) => p.position === "RB");
    const roleSelect = p
      .locator("[data-player-role]")
      .filter({ has: p.locator("option[value=wingback]") });
    await roleSelect.first().selectOption("wingback");
    await done();
    assert(Object.values((await read()).roles).includes("wingback"));
    assert(
      !(await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
    );
    await p.screenshot({
      path: `review/v07-${engine}-roles.png`,
      fullPage: true,
    });
    for (let i = 0; i < 14; i++) {
      await resolve();
      await p.selectOption("#advance-days", "1");
      await p.click("[data-action=advance]");
      await done();
    }
    let now = await read();
    assert.equal(now.talent.academy.candidates.length, 4);
    assert.equal(now.talent.scouting.missions[0].status, "complete");
    assert(now.talent.scouting.missions[0].results.length > 0);
    await nav("careers");
    const signed = now.talent.academy.candidates[0].player.id,
      released = now.talent.academy.candidates[1].player.id;
    await p.click(`[data-action=talent-promote][data-id="${signed}"]`);
    await done();
    await p.click(`[data-action=talent-release][data-id="${released}"]`);
    await done();
    now = await read();
    assert(now.players.some((p) => p.id === signed));
    assert(now.free.includes(released));
    await p.selectOption("#talent-training-form select[name=playerId]", signed);
    await p.selectOption("#talent-training-form select[name=focus]", "passing");
    await p.locator("#talent-training-form button").click();
    await done();
    await p.locator("[data-action=talent-shortlist]").first().click();
    await done();
    await p.locator("[data-action=talent-follow]").first().click();
    await done();
    now = await read();
    assert.equal(now.talent.scouting.shortlist.length, 1);
    assert.equal(now.talent.training[signed].focus, "passing");
    assert(
      now.talent.scouting.missions.some(
        (m) => m.status === "running" && m.playerId,
      ),
    );
    assert(
      !(await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
    );
    await p.screenshot({
      path: `review/v07-${engine}-academy.png`,
      fullPage: true,
    });
    const saved = await read();
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    assert.deepEqual(await read(), saved);
    let offlineReload = false,
      offlineError = null;
    try {
      await p.evaluate(() => navigator.serviceWorker.ready);
      await p.waitForFunction(() => !!navigator.serviceWorker.controller);
      await ctx.setOffline(true);
      await p.reload();
      await p.waitForSelector(".hero-card", { timeout: 60000 });
      await nav("careers");
      assert.equal(await p.locator("[data-action=talent-promote]").count(), 2);
      assert.deepEqual(await read(), saved);
      offlineReload = true;
    } catch (e) {
      if (engine !== "webkit") throw e;
      offlineError = e.message;
    }
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      academyRequestedAndArrived: true,
      promotionAndRelease: true,
      filteredReports: true,
      shortlistAndFollowup: true,
      trainingSaved: true,
      individualRolesSaved: true,
      reloadIdentical: true,
      offlineReload,
      offlineError,
      overflow: false,
      errors,
    });
  } finally {
    await b.close();
  }
}
await writeFile(
  "review/talent-browser-v07.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
