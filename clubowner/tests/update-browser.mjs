import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
const allErrors = [],
  overflows = [];
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  for (const language of ["ar", "en", "fr"]) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const p = await ctx.newPage();
    p.on("pageerror", (e) =>
      allErrors.push({ engine, language, message: e.message }),
    );
    await p.goto(base);
    await p.selectOption("#setup-database","current");
    await p.selectOption("#setup-language", language);
    await p.locator("input[name=difficulty][value=easy]").check();
    await p.fill("#owner-name", "Test Owner");
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card");
    assert.equal(
      await p.locator("html").getAttribute("dir"),
      language === "ar" ? "rtl" : "ltr",
    );
    for (const route of ["squad", "transfers", "careers", "settings"]) {
      await p.click(".mobile-nav [data-action=more]");
      await p.click(`.more-grid [data-nav=${route}]`);
      const width = await p.evaluate(() => [
        document.documentElement.scrollWidth,
        innerWidth,
      ]);
      if (width[0] > width[1])
        overflows.push({ engine, language, route, width });
    }
    await p.click(".mobile-nav [data-nav=transfers]");
    await p.fill("#player-search", "Haaland");
    assert.equal(await p.locator(".players-table tbody tr").count(), 1);
    await p.fill("#player-search", "");
    await p.locator("[data-action=transfer-offer]").first().click();
    await p.locator("#offer-form button[type=submit]").click();
    await p.selectOption("#advance-days", "1");
    await p.click("[data-action=advance]");
    await p.click("[data-action=accept-club]");
    await p.fill("input[name=appearanceBonus]", "1000");
    await p.fill("input[name=goalBonus]", "2000");
    await p.fill("input[name=annualRaisePct]", "5");
    await p.selectOption("select[name=role]", "مداورة");
    await p.locator("#contract-form button[type=submit]").click();
    let state = await p.evaluate(() =>
      JSON.parse(localStorage.getItem("clubowner.game.v1")),
    );
    assert.equal(state.preferences.language, language);
    assert.equal(state.difficulty, "easy");
    assert(
      state.players.some(
        (x) => x.contractTerms.appearanceBonus === 1000 && x.role === "مداورة",
      ),
    );
    // Seed a real engine-produced retirement and event to exercise UI without 45 clicks.
    await p.evaluate(async () => {
      const { announceRetirement, retirementDecision, retirementDay } =
        await import("/src/services/careers.js");
      const { clubEventDay } = await import("/src/services/clubEvents.js");
      const { saveGame } = await import("/src/services/save.js");
      const s = JSON.parse(localStorage.getItem("clubowner.game.v1"));
      const player = s.players.find((x) => x.clubId === s.clubId);
      player.careerInterest = 0;
      announceRetirement(s, player);
      retirementDecision(s, player.id, "prepare");
      s.date = player.retirementPlan.date;
      retirementDay(s);
      s.nextClubEventDate = s.date;
      clubEventDay(s);
      saveGame(s);
    });
    await p.reload();
    await p.click(".mobile-nav [data-action=more]");
    await p.click(".more-grid [data-nav=careers]");
    await p.locator("[data-action=hire-staff]").first().click();
    await p.locator("input[name=staffRole][value=scout]").check();
    await p.locator("#staff-hire-form button[type=submit]").click();
    await p.click("[data-action=scout-task]");
    await p.locator("#scout-task-form button[type=submit]").click();
    await p.click(".mobile-nav [data-nav=inbox]");
    await p
      .locator("[data-action=open-message]")
      .filter({
        hasText:
          /يوم|صيانة|طلب|حملة|اجتماع|توسيع|فرصة|day|maintenance|requests|campaign|meeting|Expand|opportunity|Journée|maintenance|demande|Campagne|Réunion|Élargir|Essai/i,
      })
      .first()
      .click()
      .catch(() => {});
    // Select the exact engine event message, not language-dependent text.
    state = await p.evaluate(() =>
      JSON.parse(localStorage.getItem("clubowner.game.v1")),
    );
    const msg = state.inbox.find(
      (m) => m.kind === "club-decision" && m.status === "open",
    );
    await p.locator(`[data-action=open-message][data-id="${msg.id}"]`).click();
    await p.locator("[data-action=event-choice]").last().click();
    state = await p.evaluate(() =>
      JSON.parse(localStorage.getItem("clubowner.game.v1")),
    );
    assert.equal(state.clubDecisions.at(-1).status, "resolved");
    assert(
      state.staff.some((x) => x.status === "employed" && x.role === "scout"),
    );
    assert.equal(state.scoutAssignments.length, 1);
    await p.click(".mobile-nav [data-action=more]");
    await p.click(".more-grid [data-nav=careers]");
    await p.screenshot({
      path: `review/v02-${engine}-${language}-staff.png`,
      fullPage: true,
    });
    await ctx.close();
  }
  await browser.close();
}
console.log(
  JSON.stringify(
    {
      allErrors,
      overflows,
      checks:
        "AR/EN/FR, 390×844, Chromium + WebKit, setup difficulty, Latin search, translated contract roles, staff hiring/scouting, actionable event resolution",
    },
    null,
    2,
  ),
);
assert.equal(allErrors.length, 0);
assert.equal(overflows.length, 0);
