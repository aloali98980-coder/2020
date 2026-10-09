import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { createDynastyChild } from "../src/services/dynasty.js";
import {
  setCurriculum,
  academyManagerSkill,
  academyPotentialBonus,
  academyScoutBonus,
  applyCurriculumTilt,
  academyWatchMonth,
} from "../src/services/staff/academy.js";
import { staffView } from "../src/features/staff.js";
import { getLanguage, setLanguage } from "../src/i18n/index.js";

const game = () => createGame({ database: "demo" });
const addAcademyManager = (s, skill) => {
  s.staffCorp.hq.level = 5;
  const manager = {
    id: "academy-test-manager", role: "academy", fame: "generated", fid: null,
    name: { ar: "مدير الأكاديمية", en: "Academy Director", fr: "Directeur d’académie" },
    skill, level: 1, wage: 200000, bonusPct: 0, releaseClause: 0,
    contractEnd: "2028-07-01", joined: s.date, loyalty: 60, lastRaise: s.date,
    assignment: null, history: [],
  };
  s.staffCorp.employees.push(manager);
  return manager;
};

test("المناهج تغيّر السمات وتمنح المدير مكافآت إمكانات ودقة", () => {
  const s = game();
  const player = { attributes: { passing: 50, decisions: 50, pace: 50, stamina: 99, defending: 50 } };
  setCurriculum(s, "physical");
  applyCurriculumTilt(s, player);
  assert.equal(player.attributes.pace, 53);
  assert.equal(player.attributes.stamina, 99, "السمات لا تتجاوز سقف 99");
  assert.equal(player.attributes.passing, 50, "المنهج البدني لا يعدّل التمرير");
  assert.equal(academyManagerSkill(s), 0, "لا مكافأة بلا مدير أكاديمية");
  assert.equal(academyPotentialBonus(s), 0);
  assert.throws(() => setCurriculum(s, "invalid"), /منهج غير صالح/);

  addAcademyManager(s, 80);
  assert.equal(academyPotentialBonus(s), 4);
  assert.equal(academyScoutBonus(s), 2);
  setCurriculum(s, "tactical");
  applyCurriculumTilt(s, player);
  assert.equal(player.attributes.decisions, 53);
  assert.equal(player.attributes.defending, 53);
});

test("قائمة المتابعة تضيف الناشئين مرة واحدة وتتابع الوريث من سن العاشرة", () => {
  const s = game();
  const manager = addAcademyManager(s, 75);
  const child = createDynastyChild(s, {
    name: "Heir Prospect",
    age: 12,
    stats: { talent: 90, discipline: 80, ambition: 70 },
  });
  s.dynasty.children.push(child);
  s.dynasty.heirId = child.id;
  const youth = { id: "youth-watch-1", name: "Promising Youth", rating: 68 };
  const candidate = { player: youth, range: [75, 86] };
  s.youthIntakeBatch = { candidates: [candidate, candidate] };

  const watchlist = academyWatchMonth(s);
  assert.equal(watchlist.filter((item) => item.id === youth.id).length, 1, "لا تكرار لمرشح مكرر داخل الدفعة");
  const heir = watchlist.find((item) => item.id === `heir-${child.id}`);
  assert.ok(heir);
  assert.equal(heir.rating, 80, "التقييم مشتق من سمات الوريث الفعلية");
  assert.equal(heir.managerId, manager.id);
  assert.equal(heir.note.en, "Followed by Academy Director in the heir programme.");
  assert.equal(s.inbox.filter((item) => item.title === "الوريث تحت مجهر الأكاديمية").length, 1);

  academyWatchMonth(s);
  assert.equal(s.staffCorp.academy.watchlist.length, 2, "التحديث الشهري لا يكرر السجلات أو التنبيه");
  assert.equal(s.inbox.filter((item) => item.title === "الوريث تحت مجهر الأكاديمية").length, 1);
  const language = getLanguage();
  setLanguage("en");
  const html = staffView(s, "academy", "en");
  setLanguage(language);
  assert.match(html, /Academy curriculum/);
  assert.match(html, /Heir Prospect/);
});

test("الوريث دون العاشرة لا يدخل قائمة متابعة الأكاديمية بعد", () => {
  const s = game();
  const child = createDynastyChild(s, { name: "Young Heir", age: 9 });
  s.dynasty.children.push(child);
  s.dynasty.heirId = child.id;
  academyWatchMonth(s);
  assert.equal(s.staffCorp.academy.watchlist.some((item) => item.id === `heir-${child.id}`), false);
  child.age = 10;
  academyWatchMonth(s);
  assert.equal(s.staffCorp.academy.watchlist.some((item) => item.id === `heir-${child.id}`), true);
});
