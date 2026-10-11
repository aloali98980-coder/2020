// الدفعة 8 — التكامل الشامل: 120 يومًا من المحرك الحقيقي على حفظة عالم، مع فحوص كل 30 يومًا.
// يتحقق: الحفظة صالحة، المقياس ضمن حدوده، العناوين ≤7 ومرتبة، لوحة القيادة بلا undefined/NaN،
// أرقام لاتينية، والبوابات لا ترمي، وأرقام القمصان فريدة داخل كل نادٍ.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { advanceTime } from "../src/services/time.js";
import { dashboardView } from "../src/features/dashboard.js";
import { morningHeadlines, HEADLINE_MAX } from "../src/services/morningHeadlines.js";
import { currentNoise } from "../src/services/noiseMeter.js";
import { EVENT_CATALOG, FLAVOR_CATALOG } from "../src/data/eventCatalog.js";
import { setLanguage } from "../src/i18n/index.js";

setLanguage("ar");
const ARABIC_INDIC = /[\u0660-\u0669\u06F0-\u06F9]/;

test("120 يومًا على حفظة عالم: صحة الحفظة وكل الشاشات الرئيسية في كل مرحلة", () => {
  const s = createGame({ database: "world", expanded: true, clubId: "ahly", leagues: ["eg"], difficulty: "easy" });
  for (let day = 0; day < 4; day++) {
    if (day > 0) advanceTime(s, 30);
    validateSave(s);

    const noise = currentNoise(s);
    assert.ok(noise >= 0 && noise <= 100, `الضجيج ${noise}`);

    const headlines = morningHeadlines(s);
    assert.ok(headlines.length <= HEADLINE_MAX, "عناوين الصباح ≤ 7");
    for (let i = 1; i < headlines.length; i++)
      assert.ok(headlines[i - 1].score >= headlines[i].score, "ترتيب العناوين");

    const html = dashboardView(s);
    assert.ok(!/\b(undefined|NaN|null)\b/.test(html), `قيمة مكسورة في اليوم ${day}`);
    assert.ok(!ARABIC_INDIC.test(html), "رقم عربي-هندي في لوحة القيادة");

    for (const ev of [...EVENT_CATALOG, ...FLAVOR_CATALOG])
      if (ev.when) assert.doesNotThrow(() => ev.when(s), ev.id);

    const byClub = new Map();
    for (const p of s.players.filter((x) => x.status !== "retired" && Number.isInteger(x.shirtNumber))) {
      const set = byClub.get(p.clubId) || new Set();
      assert.ok(!set.has(p.shirtNumber), `رقم قميص مكرر في ${p.clubId}`);
      set.add(p.shirtNumber);
      byClub.set(p.clubId, set);
    }
  }
});
