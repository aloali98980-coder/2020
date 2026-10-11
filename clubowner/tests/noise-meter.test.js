// الدفعة 7 — القسم 4: مقياس الضجيج. يرتفع بالصفقات والفضائح، ويتحرك بالنتائج،
// وله أثر فعلي على الجماهير والرعاة والصحافة، ويظهر على لوحة القيادة بأرقام لاتينية.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { dashboardView } from "../src/features/dashboard.js";
import { addNoise, currentNoise, noiseLevel, noteResultNoise, transferNoise, NOISE_LOG_CAP } from "../src/services/noiseMeter.js";
import { addDays } from "../src/core/utils.js";

const base = () => {
  const s = createGame({ clubId: "ahly", database: "demo" });
  s.fanSupport = 60;
  return s;
};

test("1) القيمة بين 0 و100، والسجل محدود، والمستوى يتبع القيمة", () => {
  const s = base();
  addNoise(s, "scandal", 150, "اختبار");
  assert.equal(currentNoise(s), 100);
  assert.equal(noiseLevel(currentNoise(s)), "high");
  for (let i = 0; i < 20; i++) addNoise(s, "result", -200, "اختبار");
  assert.equal(currentNoise(s), 0);
  assert.equal(noiseLevel(0), "low");
  assert.ok(s.noise.log.length <= NOISE_LOG_CAP);
});

test("2) الهبوط اليومي: بعد 30 يومًا يقل الضجيج بلا تحديث صريح", () => {
  const s = base();
  addNoise(s, "scandal", 40, "اختبار");
  const now = currentNoise(s);
  s.date = addDays(s.date, 30);
  assert.ok(currentNoise(s) < now * 0.5, `${now} → ${currentNoise(s)}`);
});

test("3) الصفقة الكبيرة ترفع الضجيج بحد أقصى 25، وتُنقص الجماهير والرعاة والصحافة", () => {
  const s = base();
  s.sponsors = [{ assetId: "shirt", status: "active" }];
  s.staffCorp = { marketing: { mood: { shirt: 70 } } };
  s.press = { trust: 60, news: [] };
  const fansBefore = s.fanSupport;
  assert.equal(transferNoise(500000000), 25);
  addNoise(s, "transfer", transferNoise(50000000), "صفقة");
  assert.ok(currentNoise(s) >= 8);
  assert.ok(s.fanSupport < fansBefore, "الجماهير تتأثر");
  assert.ok(s.staffCorp.marketing.mood.shirt < 70, "الراعي يتأثر");
  assert.ok(s.press.trust < 60, "الصحافة تتأثر");
  assert.ok(s.press.news.length >= 1, "خبر صحفي");
});

test("4) النتيجة: الخسارة ترفع، والفوز يهدّئ، ومباراة لا تخص ناديك لا تُحسب", () => {
  const s = base();
  const own = { id: "f1", home: "ahly", away: "zamalek", homeGoals: 0, awayGoals: 2, date: s.date };
  noteResultNoise(s, own);
  const afterLoss = currentNoise(s);
  assert.ok(afterLoss > 0);
  noteResultNoise(s, { id: "f2", home: "ahly", away: "zamalek", homeGoals: 3, awayGoals: 0, date: s.date });
  assert.ok(currentNoise(s) < afterLoss);
  const before = currentNoise(s);
  assert.equal(noteResultNoise(s, { id: "f3", home: "masry", away: "ismaily", homeGoals: 0, awayGoals: 3, date: s.date }), null);
  assert.equal(currentNoise(s), before);
});

test("5) مصدر غير معروف يُرفض، ولوحة القيادة تعرض المقياس بأرقام لاتينية", () => {
  const s = base();
  assert.throws(() => addNoise(s, "rumour", 5, "x"));
  addNoise(s, "scandal", 15, "حملة إعلامية ملفقة تثير الجدل");
  const html = dashboardView(s);
  const i = html.indexOf('data-widget="noise"');
  assert.ok(i > 0, "بطاقة المقياس ظاهرة");
  const block = html.slice(i, html.indexOf("</section>", i));
  assert.ok(block.includes('data-nav="world"'));
  assert.ok(!/[\u0660-\u0669]/.test(block));
});
