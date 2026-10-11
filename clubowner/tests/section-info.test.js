// الدفعة 6 — القسم 7: التعريف ⓘ — بطاقة كل قسم (≤6 سطور)، «لا تظهر»، أرقام من الثوابت الفعلية.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import {
  SECTION_INFO,
  INFO_SECTIONS,
  MAX_INFO_LINES,
  sectionInfoHidden,
  setSectionInfoHidden,
  showAllSectionInfo,
} from "../src/services/sectionInfo.js";
import { sectionInfoCard } from "../src/features/sectionInfo.js";
import { settingsView } from "../src/features/settings.js";
import { MAJOR_FEE } from "../src/services/protection.js";

const fresh = () => createGame({ database: "demo", leagues: ["eg"] });

test("كل قسم مُعرَّف بثلاث لغات، وبطاقته ≤ 6 سطور", () => {
  assert.ok(INFO_SECTIONS.length >= 5);
  for (const id of INFO_SECTIONS) {
    for (const lang of ["ar", "en", "fr"]) {
      const lines = SECTION_INFO[id][lang];
      assert.ok(Array.isArray(lines) && lines.length >= 1, `${id}/${lang}`);
      assert.ok(lines.length <= MAX_INFO_LINES, `${id}/${lang} has ${lines.length} lines`);
      for (const l of lines) assert.ok(l.trim().length > 0, `${id}/${lang} empty line`);
    }
  }
});

test("الأرقام في النصوص تأتي من الثوابت الفعلية (لا أرقام مكتوبة يدويًا)", () => {
  const legacyEn = SECTION_INFO.legacy.en.join(" ");
  assert.ok(legacyEn.includes(new Intl.NumberFormat("en-US").format(MAJOR_FEE)), "صفقات 20M من الثابت");
  const absenceAr = SECTION_INFO.absence.ar.join(" ");
  assert.ok(absenceAr.includes("7"), "7 أيام من ABSENCE_MIN_DAYS");
});

test("«لا تظهر» يخفي البطاقة لذلك القسم فقط، و«إظهار الكل» يعيدها", () => {
  const s = fresh();
  assert.ok(sectionInfoCard(s, "achievements").includes('data-action="info-hide"'));
  setSectionInfoHidden(s, "achievements", true);
  assert.equal(sectionInfoHidden(s, "achievements"), true);
  assert.equal(sectionInfoCard(s, "achievements"), "");
  assert.notEqual(sectionInfoCard(s, "harvest"), "", "الأقسام الأخرى تبقى");
  showAllSectionInfo(s);
  assert.notEqual(sectionInfoCard(s, "achievements"), "");
});

test("قسم غير معروف يُرفض، ولا بطاقة لقسم بلا تعريف", () => {
  const s = fresh();
  assert.throws(() => setSectionInfoHidden(s, "nope", true), /غير معروف/);
  assert.equal(sectionInfoCard(s, "dashboard-unknown"), "");
});

test("الإعدادات تحوي زر إعادة البطاقات، والبطاقات بثلاث لغات دون أرقام هندية", () => {
  const s = fresh();
  setSectionInfoHidden(s, "legacy", true);
  assert.ok(settingsView(s).includes('data-action="info-show-all"'));
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    for (const id of INFO_SECTIONS) {
      const html = sectionInfoCard(fresh(), id);
      assert.equal(/[\u0660-\u0669]/.test(html), false, `${id}/${lang}`);
    }
    assert.equal(/[\u0660-\u0669]/.test(settingsView(s)), false, lang);
  }
  setLanguage("ar");
});
