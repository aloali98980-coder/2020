// الدفعة 7 — القسم 1: تدقيق الأحداث. يفشل إذا عاد حدث بلا بوابة زمنية، أو تكرّر معرّف/عنوان/موضوع،
// أو تجاوزت الإضافات الجديدة الحد (15)، أو دخل رقم عربي-هندي في النص.
import { test } from "node:test";
import assert from "node:assert/strict";
import { EVENT_CATALOG, EVENT_THEMES } from "../src/data/eventCatalog.js";
import { DECISIONS_B7 } from "../src/data/events/decisions-b7.js";
import { EVENT_PHRASES } from "../src/i18n/phrases-events.js";

const dupes = (xs) => {
  const seen = new Set();
  const out = [];
  for (const x of xs) (seen.has(x) ? out.push(x) : seen.add(x));
  return out;
};

test("1) كل قرار له بوابة when دالية — لا حدث يظهر في أي وقت بلا شرط", () => {
  const missing = EVENT_CATALOG.filter((d) => typeof d.when !== "function").map((d) => d.id);
  assert.deepEqual(missing, [], "أحداث بلا when: " + missing.join(", "));
});

test("2) لا تكرار: معرّفات وعناوين وموضوعات فريدة عبر الكتالوج", () => {
  assert.deepEqual(dupes(EVENT_CATALOG.map((d) => d.id)), []);
  assert.deepEqual(dupes(EVENT_CATALOG.map((d) => d.title)), []);
  assert.deepEqual(dupes(EVENT_CATALOG.map((d) => d.topic)), []);
});

test("3) الإضافات الجديدة ≤ 15، ومعرّفاتها فريدة وفئاتها معروفة", () => {
  assert.ok(DECISIONS_B7.length >= 1 && DECISIONS_B7.length <= 15, `عدد الإضافات ${DECISIONS_B7.length}`);
  const themes = new Set(EVENT_THEMES);
  for (const d of DECISIONS_B7) {
    assert.ok(themes.has(d.theme), `${d.id}: فئة غير معروفة ${d.theme}`);
    assert.ok(d.choices.length >= 2, `${d.id}: خياران على الأقل`);
    for (const c of d.choices) {
      const effects = Object.keys(c).filter((k) => !["id", "label"].includes(k));
      assert.ok(effects.length > 0, `${d.id}/${c.id}: بلا أثر`);
    }
  }
});

test("4) نصوص الإضافات بأرقام لاتينية فقط، ومترجمة إلى en/fr", () => {
  const arabicIndic = /[\u0660-\u0669\u06F0-\u06F9]/;
  for (const d of DECISIONS_B7) {
    const texts = [d.topic, d.title, d.body, ...d.choices.map((c) => c.label)];
    for (const t of texts) {
      assert.ok(!arabicIndic.test(t), `${d.id}: رقم عربي-هندي في ${t}`);
      assert.ok(EVENT_PHRASES[t] || EVENT_PHRASES[t.replace(/\.$/, "")], `${d.id}: بلا ترجمة ${t.slice(0, 30)}`);
    }
  }
});
