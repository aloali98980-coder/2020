import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const url = process.env.TEST_URL || "http://127.0.0.1:5174",
  results = [];
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const b = await type.launch();
  try {
    const p = await b.newPage({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      }),
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
            res({
              date: s.date,
              club: s.clubId,
              tactics: s.management.tactics,
              cash: s.finance.cash,
              offers: s.management.loanOffers,
              loans: s.players
                .filter((p) => p.loan?.version === 2)
                .map((p) => ({ id: p.id, club: p.clubId, loan: p.loan })),
              own: s.players
                .filter((p) => p.clubId === s.clubId)
                .map((p) => ({
                  id: p.id,
                  position: p.position,
                  end: p.contractEnd,
                })),
              divisions: s.expansion.divisions
                .filter((d) => d.country === "eg")
                .map((d) => ({ id: d.id, clubs: d.clubs.length })),
            });
          };
          q.onerror = () => rej(q.error);
        });
      });
    await p.goto(url);
    await p.selectOption("#setup-career-mode", "expanded");
    await p.selectOption("#setup-region", "eg");
    await p.selectOption("#setup-tier", "3");
    assert.equal(await p.locator("#setup-tier option").count(), 3);
    assert.equal(await p.locator("#setup-group option").count(), 5);
    await p.selectOption("#setup-group", "eg-3-d");
    assert.equal(await p.locator("#setup-expanded-club option").count(), 16);
    await p.fill("#owner-name", "اختبار المالك 0.6");
    await p.click("[data-action=start-game]");
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    await nav("management");
    await p.selectOption("[data-tactical=formation]", "4-2-3-1");
    await done();
    await p.selectOption("[data-tactical=press]", "high");
    await done();
    assert.equal((await read()).tactics.formation, "4-2-3-1");
    const first = await read(),
      cm = first.own.find((p) => p.position === "CM" && p.end > "2027-12-31");
    await p.selectOption("#loan-out-player", cm.id);
    await p.click("[data-action=loan-out-open]");
    await p.selectOption("#loan-offer-form select[name=borrower]", {
      label: "بورتو السويس",
    });
    await p.fill("#loan-offer-form input[name=buyOption]", "0");
    await p.selectOption("#loan-offer-form select[name=role]", "rotation");
    await p.locator("#loan-offer-form button").click();
    await done();
    let now = await read();
    assert.equal(now.offers[0].status, "waiting");
    assert.equal(now.cash, first.cash);
    assert.equal(now.loans.length, 0);
    await p.selectOption("#advance-days", "1");
    await p.click("[data-action=advance]");
    await done();
    now = await read();
    assert.equal(now.offers[0].status, "countered");
    await nav("management");
    await p.locator("[data-action=loan-review]").first().click();
    await p.click("[data-action=loan-accept]");
    await done();
    now = await read();
    assert.equal(now.offers[0].status, "accepted");
    assert.equal(now.loans.length, 1);
    assert.equal(now.loans[0].loan.parent, now.club);
    assert.equal(now.loans[0].loan.borrower, now.loans[0].club);
    const saved = now;
    await p.reload();
    await p.waitForSelector(".hero-card", { timeout: 60000 });
    assert.deepEqual(await read(), saved);
    await nav("management");
    assert.equal(await p.locator("[data-action=loan-recall]").count(), 1);
    assert(
      !(await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
    );
    await p.screenshot({
      path: `review/v06-${engine}-loans-tactics.png`,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    results.push({
      engine,
      passed: true,
      groupSelector: true,
      negotiatedOutgoingLoan: true,
      feeOnlyOnSigning: true,
      tacticsSaved: true,
      reloadIdentical: true,
      mobileOverflow: false,
      errors,
    });
  } finally {
    await b.close();
  }
}
await writeFile("review/v06-browser.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
