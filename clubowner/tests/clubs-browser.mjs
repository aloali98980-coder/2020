// 0.43 — فحص متصفح: متصفح الأندية من الدوري إلى قائمة اللاعبين إلى بطاقة اللاعب.
// يحتاج نسخة تعمل على منفذ الاختبار (افتراضيًا 5174) وهواتف افتراضية بمحرّكي Chromium/WebKit.
import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
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
    await p.goto(url);
    await p.selectOption("#setup-career-mode", "expanded");
    await p.selectOption("#setup-region", "eg");
    await p.selectOption("#setup-tier", "1");
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    await nav("clubs");
    await p.waitForSelector("#club-league", { timeout: 30000 });
    const clubs = p.locator("[data-action=club-open]");
    assert.ok((await clubs.count()) >= 2, "أندية الدوري في المتصفح");
    await clubs.first().click();
    await done();
    await p.waitForSelector(".club-card");
    const card = await p.locator(".club-card").innerText();
    assert.ok(card.trim().length > 10, "بطاقة النادي تُعرض");
    const player = p.locator(".club-card [data-action=player-detail]").first();
    assert.ok(await player.count(), "قائمة اللاعبين لها زر ملف");
    await player.click();
    await done();
    await p.waitForSelector(".modal .player-profile-head");
    const modal = await p.locator(".modal").innerText();
    assert.ok(modal.includes("هذا الموسم"), "عدّاد الموسم الحالي في البطاقة");
    assert.match(modal, /سجل المواسم|لا سجل مواسم محفوظ/, "قسم سجل الأهداف");
    await p.click("[data-action=close-modal]");
    await p.fill("#club-search", "الزمالك");
    await p.waitForSelector("[data-action=club-open][data-id=zamalek]", {
      timeout: 15000,
    });
    assert.ok(
      !(await p.locator("[data-action=club-open][data-id=ahly]").count()),
      "البحث ضيّق الجدول",
    );
    assert.equal(errors.length, 0, errors.join(" | "));
    results.push(`${engine}: ok`);
  } finally {
    await b.close();
  }
}
console.log(results.join("\n"));
