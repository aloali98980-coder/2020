import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { LOCAL_SPONSORS } from "../src/data/localSponsors.js";
import { CURRENCIES, currencyFor } from "../src/data/currencies.js";
import { ALL_MARKETS } from "../src/data/worldMarkets.js";
import { ASSETS, SPONSORS } from "../src/data/catalog.js";
import {
  offersFor,
  signSponsor,
  ownerCountry,
  localSponsors,
  resolveSponsor,
  SPONSOR_BONUS,
  SPONSOR_BONUS_NAMES,
  paySponsorBonuses,
} from "../src/services/sponsors.js";
import { convertEGP, moneyLocal } from "../src/ui/format.js";

const game = () =>
  createGame({
    database: "world",
    expanded: true,
    leagues: ["eg"],
    difficulty: "easy",
  });
const ALLOWED_SECTORS = new Set([
  "خدمات مالية",
  "اتصالات",
  "عقارات",
  "نقل",
  "طيران",
  "أغذية",
  "تجزئة",
  "سيارات",
  "طاقة",
  "تكنولوجيا",
  "ضيافة",
  "رياضة",
]);

test("local sponsor data covers all fifty markets with distinct sectors", () => {
  assert.equal(LOCAL_SPONSORS.length, 150);
  for (const m of ALL_MARKETS) {
    const rows = LOCAL_SPONSORS.filter((e) => e[0] === m);
    assert.equal(rows.length, 3, m);
    assert.equal(new Set(rows.map((e) => e[2])).size, 3, m);
    for (const [, name, sector] of rows) {
      assert(name.trim().length > 3);
      assert(ALLOWED_SECTORS.has(sector), sector);
    }
  }
  const ids = new Set();
  for (const m of ALL_MARKETS)
    for (const sp of localSponsors(m)) {
      assert(!ids.has(sp.id), sp.id);
      ids.add(sp.id);
      assert(!SPONSORS.some((g) => g.id === sp.id));
      assert.equal(sp.initial, sp.name.trim()[0]);
      assert(sp.tag.includes("محلي"));
    }
  assert.equal(ids.size, 150);
});

test("currencies cover all markets with positive fixed display rates", () => {
  assert.equal(CURRENCIES.length, 50);
  for (const m of ALL_MARKETS) {
    const c = CURRENCIES.find((c) => c.country === m);
    assert(c, m);
    assert(c.perEGP > 0);
    assert(c.code.length >= 2 && c.symbol.length >= 1);
  }
  assert.equal(currencyFor("eg").perEGP, 1);
  assert.equal(currencyFor("xx").code, "EGP");
  assert.equal(convertEGP(1000000, "us"), 21000);
  assert.equal(convertEGP(1000000, "eg"), 1000000);
  assert(moneyLocal(1000000, "sa").includes("ر.س"));
  assert(moneyLocal(1000000, "us").includes("$"));
});

test("offers mix two owner-country locals with one rotating global", () => {
  const s = game();
  const country = ownerCountry(s);
  const seen = new Set();
  for (const a of ASSETS) {
    const offers = offersFor(s, a.id);
    assert.equal(offers.length, 3, a.id);
    assert(offers.every((o) => o.days === 360 && o.amount > 0));
    assert.deepEqual(
      offers.map((o) => o.exclusive),
      [false, true, false],
    );
    const resolved = offers.map((o) => resolveSponsor(o.sponsorId));
    assert(resolved.every(Boolean));
    const locals = resolved.filter((sp) => sp.local);
    assert.equal(locals.length, 2, a.id);
    assert(locals.every((sp) => sp.country === country));
    assert(!resolved[1].local);
    seen.add(offers[1].sponsorId);
  }
  assert(seen.size > 1);
  assert.equal(resolveSponsor("nile").name, "نيل باي");
  assert.equal(resolveSponsor("nope"), undefined);
});

test("signing a local sponsor posts upfront plus eleven obligations", () => {
  const s = game();
  assert.equal(s.version, 22);
  const offer = offersFor(s, "sleeve").find(
    (o) => resolveSponsor(o.sponsorId).local,
  );
  const cash = s.finance.cash;
  const c = signSponsor(s, offer);
  assert.equal(c.status, "active");
  assert.equal(s.finance.cash - cash, Math.floor(offer.amount * 0.25));
  assert(
    s.finance.ledger.some(
      (e) => e.key === c.id + "-upfront" && e.category === "sponsorship",
    ),
  );
  const obs = s.finance.obligations.filter((o) => o.ref === c.id);
  assert.equal(obs.length, 11);
  assert(
    obs.every((o) => o.category === "sponsor-income" && o.status === "pending"),
  );
  assert.equal(
    obs.reduce((a, o) => a + o.amount, 0),
    offer.amount - Math.floor(offer.amount * 0.25),
  );
  assert.throws(() => signSponsor(s, offer));
  validateSave(s);
});

test("sector exclusivity applies across local and global sponsors", () => {
  const s = game();
  const mk = (assetId, sponsorId, exclusive) => ({
    assetId,
    sponsorId,
    amount: 1000000,
    days: 360,
    exclusive,
  });
  signSponsor(s, mk("sleeve", "eg-local-0", false));
  assert.equal(resolveSponsor("eg-local-0").sector, "خدمات مالية");
  assert.throws(() => signSponsor(s, mk("shorts", "nile", true)));
  signSponsor(s, mk("shorts", "madar", false));
  assert.equal(s.sponsors.filter((c) => c.status === "active").length, 3);
  validateSave(s);
});

test("performance bonuses pay for achievements only, exactly once", () => {
  const s = game();
  const country = ownerCountry(s);
  const c = signSponsor(s, offersFor(s, "sleeve")[0]);
  s.expansion.domesticHonours = { [country]: { winner: s.clubId } };
  s.expansion.cups.push({
    id: "test-cont-s1",
    kind: "ucl",
    engine: "europe-v1",
    entrants: [s.clubId],
  });
  const paid = paySponsorBonuses(s, 1);
  // Fresh games seed front/delta, so two active contracts earn bonuses.
  assert.equal(paid.length, 6);
  const mine = paid.filter((p) => p.sponsorId === c.sponsorId);
  assert.equal(mine.length, 3);
  assert.deepEqual(mine.map((p) => p.kind).sort(), [
    "continental",
    "cup",
    "title",
  ]);
  for (const p of mine)
    assert.equal(p.amount, Math.round(c.amount * SPONSOR_BONUS[p.kind]));
  assert.equal(
    s.finance.ledger.filter((e) => e.category === "sponsor-bonus").length,
    6,
  );
  assert.deepEqual(paySponsorBonuses(s, 1), []);
  for (const x of s.sponsors) x.status = "expired";
  s.seasonNumber++;
  assert.deepEqual(paySponsorBonuses(s, 1), []);

  const t = game();
  for (const cup of t.expansion.cups)
    cup.entrants = (cup.entrants || []).filter((id) => id !== t.clubId);
  signSponsor(t, offersFor(t, "sleeve")[0]);
  assert.deepEqual(paySponsorBonuses(t, 5), []);
  assert(t.finance.ledger.every((e) => e.category !== "sponsor-bonus"));
});

test("bonus constants match the documented uniform rates", () => {
  assert.deepEqual(SPONSOR_BONUS, { title: 0.2, cup: 0.15, continental: 0.15 });
  assert.deepEqual(Object.keys(SPONSOR_BONUS_NAMES).sort(), [
    "continental",
    "cup",
    "title",
  ]);
});

test("v14 save migrates to 16 with sponsors and finances intact", () => {
  const s = game();
  signSponsor(s, offersFor(s, "boards")[0]);
  const v14 = structuredClone(s);
  v14.version = 14;
  delete v14.migrationNote;
  const m = migrateSave(v14);
  assert.equal(m.version, 22);
  assert.equal(v14.version, 14);
  assert(m.migrationNote.includes("0.15"));
assert(m.migrationNote.includes("0.16"));
  assert.deepEqual(m.sponsors, s.sponsors);
  assert.deepEqual(m.finance.ledger, s.finance.ledger);
  assert.equal(m.finance.cash, s.finance.cash);
  validateSave(m);
});
