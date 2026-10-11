// الدفعة 6 — القسم 4: حصاد الموسم (أبطال + أرقام + جوائز + لحظات) من مصادر فعلية فقط.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import { harvestFor, lastSeason } from "../src/services/seasonHarvest.js";
import { seasonHarvestView } from "../src/features/seasonHarvest.js";
import { message } from "../src/services/inbox.js";

const row = (clubId, extra = {}) => ({ clubId, played: 14, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0, ...extra });

const withSeason = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  const player = s.players[0];
  s.seasonHistory = [
    {
      number: 1,
      date: "2027-06-30",
      table: [row("ceramica", { points: 50 }), row(s.clubId, { points: 40, wins: 11, gf: 33 })],
      playerStats: { [player.id]: { seasonGoals: 17 } },
    },
  ];
  s.awards.hall = [
    {
      season: 1,
      date: "2027-06-30",
      awards: {
        "best-player": { id: player.id, name: player.name, nameLatin: "Latin Name", clubId: s.clubId, own: true },
        "top-scorer-competition": null,
      },
    },
  ];
  return { s, player };
};

test("لا حصاد قبل أول موسم مؤرشف", () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  assert.equal(harvestFor(s), null);
  assert.equal(lastSeason(s), null);
});

test("البطل والمركز والأرقام من جدول الموسم", () => {
  const { s } = withSeason();
  const h = harvestFor(s);
  assert.equal(h.number, 1);
  assert.equal(h.champion.clubId, "ceramica");
  assert.equal(h.champion.own, false);
  assert.equal(h.ownPosition, 2);
  assert.equal(h.own.points, 40);
  assert.equal(h.own.wins, 11);
});

test("الهداف من الإحصاءات المؤرشفة واسمه من اللاعبين", () => {
  const { s, player } = withSeason();
  const h = harvestFor(s);
  assert.equal(h.topScorer.id, player.id);
  assert.equal(h.topScorer.name, player.name);
  assert.equal(h.topScorer.goals, 17);
});

test("الجوائز من قاعة المشاهير للموسم نفسه، والفارغ يُستبعد", () => {
  const { s } = withSeason();
  const h = harvestFor(s);
  assert.equal(h.awards.length, 1, "الجائزة الفارغة لا تظهر");
  assert.equal(h.awards[0].id, "best-player");
  assert.equal(h.awards[0].own, true);
  assert.ok(h.awards[0].label, "اسم الجائزة موجود");
});

test("اللحظات: رسائل الأولوية العالية داخل نافذة الموسم فقط", () => {
  const { s } = withSeason();
  s.inbox = [];
  s.date = "2027-03-01";
  message(s, { title: "لحظة مهمة", body: "x", priority: "high" });
  s.date = "2027-06-30";
  message(s, { title: "خبر عادي", body: "y", priority: "normal" });
  s.inbox.find((m) => m.title === "لحظة مهمة").date = "2027-04-01"; // داخل النافذة
  s.inbox.find((m) => m.title === "خبر عادي").date = "2027-05-01"; // عادي: يُستبعد
  s.inbox.push({ id: "old", date: "2026-01-01", title: "قديمة", priority: "high", body: "", status: "open" });
  const h = harvestFor(s);
  assert.deepEqual(h.moments.map((m) => m.title), ["لحظة مهمة"]);
});

test("الشاشة بثلاث لغات مع ⓘ وأرقام لاتينية، وحالة فارغة واضحة", () => {
  const empty = createGame({ database: "demo", leagues: ["eg"] });
  const { s } = withSeason();
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const html = seasonHarvestView(s);
    assert.ok(html.includes("info-toggle"), lang);
    assert.equal(/[\u0660-\u0669]/.test(html), false, lang);
    assert.ok(seasonHarvestView(empty).length > 0, lang);
  }
  setLanguage("ar");
});
