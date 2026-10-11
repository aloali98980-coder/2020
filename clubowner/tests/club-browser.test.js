// 0.43 — متصفح الأندية: الدوري ← الأندية ← قائمة اللاعبين ← بطاقة اللاعب بسجل الأهداف.
// الاختبارات تبني حفظة حقيقية بلا واجهة (createGame) وتتحقق من أن العرض يقرأ
// من الحفظة نفسها: لا أسماء مختلقة لنادٍ بلا قائمة، وكل لاعب معروض محفوظ فعلًا.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { clubBrowserView } from "../src/features/clubBrowser.js";
import { playerDetail } from "../src/features/players.js";
import { extendedClub } from "../src/data/expandedCatalog.js";

const setup = () =>
  createGame({
    clubId: "ahly",
    leagues: ["eg", "en"],
    expanded: true,
    database: "world",
  });
const division = (s, id) => s.expansion.divisions.find((d) => d.id === id);
const playerButtons = (view) =>
  [...view.matchAll(/data-action="player-detail" data-id="([^"]+)"/g)].map(
    (m) => m[1],
  );

test("متصفح الأندية: كل أندية الدوري تظهر وكل نادٍ يفتح قائمته", () => {
  const s = setup();
  const d = division(s, "eg-1");
  const view = clubBrowserView(s, { league: d.id });
  assert.equal(typeof view, "string");
  assert.ok(view.includes(d.name), "اسم الدوري في العرض");
  for (const id of d.clubs)
    assert.ok(
      view.includes(`data-action="club-open" data-id="${id}"`),
      "نادٍ ناقص من الجدول: " + id,
    );
});

test("قائمة النادي تعرض لاعبي الحفظة فقط ولا تخترع أحدًا", () => {
  const s = setup();
  const d = division(s, "eg-1");
  const squad = s.players.filter((p) => p.clubId === "ahly");
  assert.ok(squad.length >= 22, "الحفظة تولّد قائمة كاملة للنادي");
  const view = clubBrowserView(s, { league: d.id, club: "ahly" });
  const shown = playerButtons(view);
  const saved = new Set(squad.map((p) => p.id));
  assert.ok(shown.length >= 22, "عدد صفوف القائمة المعروضة");
  for (const id of shown)
    assert.ok(saved.has(id), "لاعب غير محفوظ في الحفظة: " + id);
  for (const p of squad.slice(0, 5))
    assert.ok(shown.includes(p.id), "لاعب محفوظ غائب من العرض: " + p.id);
});

test("نادٍ بلا قائمة محفوظة يظهر بحالة صريحة بدل أسماء مختلقة", () => {
  const s = setup();
  const d = division(s, "es-1");
  assert.ok(d, "دوري أعلى لم يُفعّل سوقه موجود في الرسم البياني");
  const clubId = d.clubs.find((id) => !s.players.some((p) => p.clubId === id));
  assert.ok(clubId, "نادٍ بلا لاعبين محفوظين");
  const view = clubBrowserView(s, { league: d.id, club: clubId });
  assert.ok(
    view.includes("لا قائمة محفوظة لهذا النادي"),
    "حالة القائمة الفارغة",
  );
  assert.equal(
    playerButtons(view).length,
    0,
    "لا بطاقات لاعبين لنادٍ بلا قائمة",
  );
  assert.ok(view.includes("بلا قائمة"), "وسم «بلا قائمة» في جدول الدوري");
});

test("البحث يضيّق الأندية داخل الدوري بلا كسر التحديد", () => {
  const s = setup();
  const d = division(s, "eg-1");
  assert.ok(d.clubs.includes("zamalek") && d.clubs.includes("ahly"));
  const view = clubBrowserView(s, { league: d.id, q: "الزمالك" });
  assert.ok(view.includes('data-action="club-open" data-id="zamalek"'));
  assert.ok(!view.includes('data-action="club-open" data-id="ahly"'));
});

test("بطاقة اللاعب: مواصفات كاملة وسجل أهداف من أرشيف المواسم", () => {
  const s = setup();
  const p =
    s.players.find((x) => x.clubId === s.clubId && x.position === "ST") ||
    s.players.find((x) => x.clubId === s.clubId);
  const before = playerDetail(s, p);
  assert.ok(before.includes("السرعة") && before.includes("التسديد"), "القدرات");
  assert.ok(before.includes("المشاركات / الأهداف"), "عدّاد المسيرة");
  assert.ok(before.includes("هذا الموسم"), "عدّاد الموسم الحالي");
  assert.ok(
    before.includes("لا سجل مواسم محفوظ بعد"),
    "حفظة بلا أرشيف تعرض سطرًا صريحًا",
  );
  s.seasonHistory.push({
    number: 1,
    date: "2027-07-01",
    table: [],
    playerStats: {
      [p.id]: {
        seasonGoals: 7,
        seasonAssists: 3,
        seasonYellow: 1,
        seasonRed: 0,
        seasonCleanSheets: 0,
        seasonRatingSum: 63,
        seasonRatingCount: 9,
        seasonMinutes: 900,
      },
    },
  });
  const after = playerDetail(s, p);
  assert.ok(after.includes("سجل المواسم — الأهداف والصناعة"), "جدول المواسم");
  assert.ok(after.includes("900"), "دقائق الموسم المحفوظة");
  assert.ok(after.includes("7"), "أهداف الموسم المحفوظة");
  assert.ok(!after.includes("لا سجل مواسم محفوظ بعد"), "السطر البديل يختفي");
});

test("النظام الأساسي (بلا عالم موسع) يعرض الدوري التجريبي بلا انهيار", () => {
  const s = createGame({ clubId: "ahly", expanded: false });
  const view = clubBrowserView(s, {});
  assert.ok(view.includes("الدوري التجريبي"), "عنوان الدوري الأساسي");
  assert.ok(
    view.includes(`data-action="club-open" data-id="ahly"`),
    "نادي المالك ضمن الجدول",
  );
  assert.ok(extendedClub("ahly"), "بيانات النادي متاحة للمتصفح");
});
