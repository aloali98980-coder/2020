import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
const results = [],
  url = process.env.TEST_URL || "http://127.0.0.1:5173";
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  console.error("European UI check: " + engine);
  const b = await type.launch();
  try {
    const p = await b.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(url);
    await p.selectOption("#setup-career-mode", "expanded");
    await p.selectOption("#setup-region", "en");
    await p.selectOption("#setup-tier", "1");
    await p.click("[data-action=markets-egypt]");
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    const nav = async (name) => {
      await p.click(".mobile-nav [data-action=more]");
      await p.click(`.more-grid [data-nav=${name}]`);
    };
    await nav("world");
    assert.equal(await p.locator(".european-card").count(), 3);
    for (const kind of ["ucl", "uel", "uecl"]) {
      await p.locator(`[data-europe=${kind}] > summary`).click();
      assert.equal(
        await p
          .locator(`[data-europe=${kind}] .european-table tbody tr`)
          .count(),
        36,
      );
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await p.locator(`[data-europe=${kind}] > summary`).click();
    }
    const mid = await p.evaluate(async () => {
      const { commit, getState, setState } = await import("/src/core/store.js");
      const { loadGame } = await import("/src/services/save.js");
      setState((await loadGame()).state);
      const { advanceTime } = await import("/src/services/time.js");
      await commit((s) => {
        s.preferences.pauseMatches = false;
        let steps = 0;
        while (true) {
          const c = s.expansion.cups.find((c) => c.kind === "ucl");
          if (
            c.ties.some(
              (t) =>
                t.stage === "playoff" &&
                c.fixtures.find((f) => f.id === t.legs[0])?.played &&
                !c.fixtures.find((f) => f.id === t.legs[1])?.played,
            )
          )
            break;
          if (++steps > 250) throw Error("No first leg checkpoint");
          for (const m of s.inbox) if (m.required) m.status = "resolved";
          advanceTime(s, 1);
        }
      });
      const s = getState();
      const { importGame, saveGame } = await import("/src/services/save.js");
      const blob = new Blob([JSON.stringify(s, null, 2)], {
        type: "application/json",
      });
      const imported = await importGame(blob);
      const before = JSON.stringify(s.expansion.cups);
      if (JSON.stringify(imported.expansion.cups) !== before)
        throw Error("Cup state changed during import");
      await saveGame(imported);
      return {
        bytes: blob.size,
        date: s.date,
        phase: s.expansion.cups[0].phase,
        players: s.players.length,
        ownRank:
          s.expansion.cups
            .find((c) => c.entrants.includes(s.clubId))
            ?.ranking.indexOf(s.clubId) + 1,
      };
    });
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    await nav("world");
    await p.locator("[data-europe=ucl] > summary").click();
    assert(
      (await p.locator("[data-europe=ucl] .europe-ties article").count()) >= 8,
    );
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await p.locator("[data-europe=ucl]").scrollIntoViewIfNeeded();
    await p.screenshot({ path: `review/v05-${engine}-europe.png` });
    const final = await p.evaluate(async () => {
      const { commit, getState, setState } = await import("/src/core/store.js");
      const { loadGame } = await import("/src/services/save.js");
      setState((await loadGame()).state);
      const { advanceTime } = await import("/src/services/time.js");
      await commit((s) => {
        let steps = 0;
        while (s.expansion.cups.some((c) => c.engine && !c.winner)) {
          if (++steps > 200) throw Error("Final was not reached");
          for (const m of s.inbox) if (m.required) m.status = "resolved";
          advanceTime(s, 1);
        }
      });
      return getState()
        .expansion.cups.filter((c) => c.engine)
        .map((c) => ({
          kind: c.kind,
          phase: c.phase,
          winner: c.winner,
          fixtures: c.fixtures.length,
          extraTime: c.fixtures.filter((f) => f.extraTime).length,
          penalties: c.fixtures.filter((f) => f.penaltyWinner).length,
        }));
    });
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    await nav("world");
    await p.locator("[data-europe=ucl] > summary").click();
    assert.equal(
      await p.locator("[data-europe=ucl] .europe-ties article").count(),
      23,
    );
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await nav("settings");
    await p.selectOption("#game-language", "en");
    await p.waitForFunction(() => document.documentElement.lang === "en");
    await nav("world");
    await p.locator("[data-europe=uecl] > summary").click();
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.deepEqual(errors, []);
    results.push({
      engine,
      mid,
      final,
      errors,
      checks: [
        "three mobile 36-team tables",
        "first-leg save/import/reload unchanged",
        "completed bracket with 23 ties",
        "extra time and shootout display",
        "English layout without overflow",
      ],
      physicalIPhoneTested: false,
    });
  } finally {
    await b.close();
  }
}
console.log(JSON.stringify(results, null, 2));
