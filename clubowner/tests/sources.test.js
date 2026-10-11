// الدفعة 6 — القسم 8: المصادر — أعداد حية فقط، ما لا يُعد يُحذف، وتظهر في الإعدادات حصرًا.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import { SOURCE_DEFS, liveSources } from "../src/services/sources.js";
import { settingsView } from "../src/features/settings.js";
import { dashboardView } from "../src/features/dashboard.js";
import { CLUBS } from "../src/data/catalog.js";
import { CITY_FACILITIES } from "../src/data/sportsCityFacilities.js";
import { ACHIEVEMENTS } from "../src/data/achievements.js";

const fresh = () => createGame({ database: "demo", leagues: ["eg"] });

test("الأعداد حية: تساوي أطوال المصفوفات الفعلية في الحفظ والكتالوج", () => {
  const s = fresh();
  const byId = Object.fromEntries(liveSources(s).map((x) => [x.id, x.count]));
  assert.equal(byId.clubs, CLUBS.length);
  assert.equal(byId.facilities, CITY_FACILITIES.length);
  assert.equal(byId.achievements, ACHIEVEMENTS.length);
  assert.equal(byId.players, s.players.length);
  assert.equal(byId.leagues, s.leagues.length);
  assert.equal(byId.matchesPlayed, s.fixtures.filter((f) => f.played).length);
});

test("يتغير العدد عند تغيّر البيانات (ليس ثابتًا)", () => {
  const s = fresh();
  const before = liveSources(s).find((x) => x.id === "messages").count;
  s.inbox.push({ id: "x", date: s.date, title: "t", body: "b", status: "open" });
  const after = liveSources(s).find((x) => x.id === "messages").count;
  assert.equal(after, before + 1);
});

test("ما لا يُعد يُحذف من القائمة ولا يظهر بقيمة مُلفّقة", () => {
  const s = fresh();
  const broken = { ...s, seasonHistory: undefined, sponsors: undefined };
  const ids = liveSources(broken).map((x) => x.id);
  assert.equal(ids.includes("seasons"), false);
  assert.equal(ids.includes("activeSponsors"), false);
  assert.equal(ids.includes("clubs"), true, "الكتالوج يبقى لأنه معدود دائمًا");
  for (const d of SOURCE_DEFS) assert.ok(typeof d.count === "function", d.id);
});

test("المصادر تظهر في الإعدادات حصرًا، لا في المكتب أو غيره", () => {
  const s = fresh();
  setLanguage("ar");
  assert.ok(settingsView(s).includes('class="panel settings-panel sources-panel"'));
  assert.equal(dashboardView(s).includes("sources-panel"), false);
});

test("الإعدادات بثلاث لغات دون أرقام هندية", () => {
  const s = fresh();
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const html = settingsView(s);
    assert.equal(/[\u0660-\u0669]/.test(html), false, lang);
  }
  setLanguage("ar");
});
