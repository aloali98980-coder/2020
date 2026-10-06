import { webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { DIVISIONS, extendedClub } from "../src/data/expandedCatalog.js";
// WebKit small-save pass: the 110MB mid-season save OOM-kills WPEWebProcess
// in this 2GiB sandbox (three identical crashes, dmesg-confirmed), so WebKit
// covers the new-game render path plus a 61MB day-5 import/export cycle.
// Large-import byte-exactness and v013 migration are covered by chromium.
const url = process.env.TEST_URL || "http://127.0.0.1:5174";
const hash = (b) => createHash("sha256").update(b).digest("hex");
const MID = ".arena/v014-day5.json.gz";
console.log("Browser webkit-small");
const b = await webkit.launch();
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
  const imp = async (file) => {
    const chooser = p.waitForEvent("filechooser");
    await p.click("[data-action=import-save]");
    await (await chooser).setFiles(file);
    await p.waitForSelector("[data-action=confirm-import]", {
      timeout: 90000,
    });
    await p.click("[data-action=confirm-import]");
    await p.waitForSelector(".hero-card", { timeout: 90000 });
  };
  const exp = async () => {
    await nav("settings");
    const download = p.waitForEvent("download");
    await p.click("[data-action=export-save]");
    const d = await download;
    return gunzipSync(await readFile(await d.path()));
  };
  const noOverflow = async () =>
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
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
  await nav("world");
  for (const [attr, kind] of [
    ["europe", "ucl"],
    ["europe", "uel"],
    ["europe", "uecl"],
    ["competition", "caf"],
    ["competition", "confed"],
    ["competition", "lib"],
    ["competition", "suda"],
    ["asia", "afc"],
    ["asia", "afc-two"],
    ["asia", "afc-challenge"],
    ["concacaf", "concacaf"],
    ["concacaf", "leagues-cup"],
    ["concacaf", "central-american"],
    ["concacaf", "caribbean"],
    ["fifa", "intercontinental"],
    ["fifa", "ofc"],
  ])
    assert.equal(
      await p.locator(`[data-${attr}=${kind}]`).count(),
      1,
      `${attr}=${kind}`,
    );
  assert.equal(await p.locator("[data-fifa=clubworld]").count(), 0);
  assert.equal(await p.locator("[data-competition=domestic]").count(), 50);
  await noOverflow();
  await p.screenshot({ path: "review/v014-webkit-review.png" });
  await nav("settings");
  await imp(MID);
  await p.reload();
  await p.waitForSelector(".hero-card", { timeout: 90000 });
  await nav("world");
  assert.equal(await p.locator("[data-competition=domestic]").count(), 50);
  const ccCard = p.locator("[data-concacaf=concacaf]");
  assert((await ccCard.innerText()).includes("CONCACAF Champions Cup"));
  await noOverflow();
  assert.equal(hash(await exp()), hash(gunzipSync(await readFile(MID))));
  await p.selectOption("#advance-days", "1");
  await p.click("[data-action=advance]");
  await p.waitForFunction(
    () => !document.body.classList.contains("saving-game"),
  );
  await p.reload();
  await p.waitForSelector(".hero-card", { timeout: 90000 });
  assert.deepEqual(errors, []);
  const results = [
    {
      engine: "webkit",
      passed: true,
      scope: "small-save (61MB day-5); 110MB import OOM-kills WPEWebProcess",
      savedAt: new Date().toISOString(),
      width: 390,
      allEngineCardsRender: true,
      day5ImportReloadExportByteExact: true,
      advanceAndIDBReload: true,
      largeImportCoveredByChromium: true,
      noHorizontalOverflow: true,
      errors,
    },
  ];
  await writeFile(
    "review/review-browser-v014-webkit.json",
    JSON.stringify(results, null, 2),
  );
  console.log(results);
} finally {
  await b.close();
}
