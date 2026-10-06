import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { DIVISIONS, extendedClub } from "../src/data/expandedCatalog.js";
// 0.16 economy-completion browser pass (new-game only, both engines):
// sponsor negotiation, ticket categories + premium, coach contracts,
// transfer-window banner.
const url = process.env.TEST_URL || "http://127.0.0.1:5174",
  results = [];
for (const [engine, type] of Object.entries({ chromium, webkit }).filter(
  ([e]) => !process.env.TEST_ENGINE || e === process.env.TEST_ENGINE,
)) {
  console.log("Browser", engine);
  const b = await type.launch();
  try {
    const ctx = await b.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      }),
      p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    const nav = async (name) => {
      await p.click(".mobile-nav [data-action=more]");
      await p.click(`.more-grid [data-nav=${name}]`);
    };
    const noOverflow = async () =>
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
    const settled = () =>
      p.waitForFunction(
        () => !document.body.classList.contains("saving-game"),
      );
    await p.goto(url);
    await p.click("[data-action=markets-egypt]");
    await p.selectOption("#setup-region", "sa");
    const id = [
      ...DIVISIONS.find((d) => d.country === "sa" && d.tier === 1).clubs,
    ].sort((a, b) => extendedClub(b).rep - extendedClub(a).rep)[0];
    await p.selectOption("#setup-expanded-club", id);
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    // 1. Negotiation flow on a free asset.
    await nav("sponsors");
    const modal = p.locator("#modal-root");
    await p.locator('[data-action="sponsor-offers"]').first().click();
    await p.waitForSelector(".sponsor-offer");
    assert.equal(
      await p.locator('[data-action="negotiate-sponsor"]').count(),
      3,
    );
    await p.locator('[data-action="negotiate-sponsor"]').first().click();
    await p.waitForFunction(() =>
      (document.getElementById("modal-root")?.innerText || "").includes(
        "الجولة ١ من ٢",
      ),
    );
    await p
      .locator('[data-action="sponsor-demand"][data-raise="10"]')
      .click();
    await settled();
    await p.waitForFunction(() => {
      const text =
        document.getElementById("modal-root")?.innerText || "";
      return (
        text.includes("قبل الراعي طلبك") ||
        text.includes("عرض مضاد من الراعي") ||
        text.includes("انسحب الراعي")
      );
    });
    const outcome = await modal.innerText();
    assert(
      outcome.includes("قبل الراعي طلبك") ||
        outcome.includes("عرض مضاد من الراعي") ||
        outcome.includes("انسحب الراعي"),
    );
    let negotiatedSign = false;
    if (outcome.includes("قبل الراعي طلبك")) {
      await p.locator('[data-action="sign-sponsor-deal"]').click();
      await settled();
      await p.waitForSelector(".asset-card");
      negotiatedSign = (await p.locator("main").innerText()).includes(
        "متعاقد",
      );
      assert(negotiatedSign);
    }
    // 2. Ticket categories + premium.
    await nav("finance");
    await p.locator('[data-action="ticket-price"]').click();
    assert((await modal.innerText()).includes("المقصورة"));
    await p.fill('#modal-root input[name="first"]', "300");
    await p.fill('#modal-root input[name="vip"]', "900");
    await p.selectOption('#modal-root select[name="premium"]', "50");
    await p.locator('#modal-root button[type="submit"]').click();
    await settled();
    // 3. Coach market: 8 profiles, dated contract, renewal.
    await nav("management");
    const mgmt = await p.locator("main").innerText();
    assert(mgmt.includes("العقد حتى"));
    assert(mgmt.includes("تجديد العقد"));
    await p.locator('[data-action="renew-coach"]').click();
    assert((await modal.innerText()).includes("تجديد عقد المدرب"));
    await p.locator('#modal-root button[type="submit"]').click();
    await settled();
    await p.locator('[data-action="appoint-coach"]').first().click();
    await p.waitForFunction(() =>
      (document.getElementById("modal-root")?.innerText || "").includes(
        "تعيين مدرب جديد",
      ),
    );
    await p.keyboard.press("Escape");
    // 4. Window banner on the market screen.
    await nav("transfers");
    await p.waitForSelector(".player-filters");
    const market = await p.locator("main").innerText();
    assert(
      market.includes("السوق مفتوح") || market.includes("السوق مغلق"),
    );
    await noOverflow();
    await p.selectOption("#advance-days", "1");
    await p.click("[data-action=advance]");
    await settled();
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 90000 });
    await p.screenshot({ path: `review/v016-${engine}-economy.png` });
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      savedAt: new Date().toISOString(),
      width: 390,
      negotiationFlow: true,
      negotiatedSign,
      ticketCategories: true,
      coachContracts: true,
      windowBanner: true,
      advanceAndReload: true,
      noHorizontalOverflow: true,
      errors,
    });
    await writeFile(
      `review/economy-browser-v016-${engine}.json`,
      JSON.stringify(results.filter((r) => r.engine === engine), null, 2),
    );
  } finally {
    await b.close();
  }
}
await writeFile(
  "review/economy-browser-v016.json",
  JSON.stringify(results, null, 2),
);
console.log(results);
