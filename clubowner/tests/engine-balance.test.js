// مواصفة «النتائج المتوازنة» (0.43) — أرقام مقفولة.
// لا يُعدَّل أي رقم هنا إلا بقرار صريح في المواصفة؛ التعديل الصامت يكسر هذه الاختبارات.
import assert from "node:assert/strict";
import test from "node:test";
import { goals, scandalKind, GOAL_MODEL } from "../src/services/matches.js";

// 200 ألف عينة لكل حالة: سريعة (ثوانٍ) وكافية لدقة ±0.5%
const N = 200000;
const sample = (gap, seed = 20260101) => {
  const s = { seed };
  let win = 0, draw = 0, upset = 0, total = 0, max = 0, margin5 = 0, margin6 = 0;
  for (let i = 0; i < N; i++) {
    const strong = 60 + gap;
    const weak = 60;
    const a = goals(s, strong, weak, false);
    const b = goals(s, weak, strong, false);
    if (a > b) win++;
    else if (a === b) draw++;
    else upset++;
    total += a + b;
    max = Math.max(max, a, b);
    if (Math.abs(a - b) >= 5) margin5++;
    if (Math.abs(a - b) >= 6) margin6++;
  }
  return { win: win / N, draw: draw / N, upset: upset / N, avg: total / N, max, margin5: margin5 / N, margin6: margin6 / N };
};

test("(أ) التوزيع الأساسي: متوسط ~4 هدف، والفارق يرفع الأقوى ويخفض المفاجآت", () => {
  const even = sample(0, 11);
  assert.ok(even.avg > 3.85 && even.avg < 4.15, `متوسط المتكافئين ${even.avg.toFixed(2)}`);
  const g20 = sample(20, 22);
  assert.ok(g20.win >= 0.55 && g20.win <= 0.70, `الأقوى عند فارق 20: ${g20.win.toFixed(3)}`);
  assert.ok(g20.upset >= 0.15 && g20.upset <= 0.27, `المفاجآت عند فارق 20: ${g20.upset.toFixed(3)}`);
  assert.ok(g20.draw >= 0.10 && g20.draw <= 0.22, `التعادل عند فارق 20: ${g20.draw.toFixed(3)}`);
  const g30 = sample(30, 33);
  assert.ok(g30.upset >= 0.08 && g30.upset <= 0.20, `المفاجآت عند فارق 30: ${g30.upset.toFixed(3)}`);
  assert.ok(g30.upset < g20.upset, "المفاجآت تقل مع اتساع الفارق");
  // الفريق القوي يسجل أكثر كلما ازدادت قوته (المجموع قد ينخفض عند فوارق هائلة بسبب السقوف، وهذا مقصود)
  const strongMean = (gap) => {
    const st = { seed: 4040 + gap };
    let t = 0;
    for (let i = 0; i < 100000; i++) t += goals(st, 60 + gap, 60, false);
    return t / 100000;
  };
  assert.ok(strongMean(20) > strongMean(0) + 0.3, "الفريق القوي يسجل أكثر مع فارق 20");
});

test("(ب) فضيحة الكبار (فارق قوة <15) ممكنة لكن أقل من 10%", () => {
  let rate = 0;
  const runs = 60000;
  const s = { seed: 555 };
  for (let i = 0; i < runs; i++) {
    const gap = (i % 14); // فارق من 0 إلى 13
    const a = goals(s, 60 + gap, 60, false);
    const b = goals(s, 60, 60 + gap, false);
    if (Math.abs(a - b) >= 5) rate++;
  }
  const r = rate / runs;
  assert.ok(r > 0, "الفضيحة ممكنة");
  assert.ok(r < 0.10, `فضيحة الكبار ${r.toFixed(4)} يجب أن تكون < 10%`);
});

test("(ج) لا 9-0 بين الكبار أبدًا عمليًا (أقل من 1%)", () => {
  const s = { seed: 777 };
  let nine = 0;
  const runs = 200000;
  for (let i = 0; i < runs; i++) {
    const gap = i % 14;
    const a = goals(s, 60 + gap, 60, false);
    const b = goals(s, 60, 60 + gap, false);
    if (Math.max(a, b) >= 9) nine++;
  }
  assert.ok(nine / runs < 0.01, `9+ بين الكبار ${nine} من ${runs}`);
});

test("(ج-2) الفضيحة المطلقة بين الكبار لا تصل 9 أهداف لفريق", () => {
  const s = { seed: 778 };
  let nine = 0;
  for (let i = 0; i < 100000; i++) {
    const a = goals(s, 60 + (i % 14), 60, false);
    if (a >= 9) nine++;
  }
  assert.ok(nine / 100000 < 0.01);
});

test("(3) قوي ضد ضعيف (فارق قوة 30+): فضيحة فارق 6+ بنسبة 1–3%", () => {
  let rate = 0;
  const runs = 200000;
  const s = { seed: 909 };
  for (let i = 0; i < runs; i++) {
    const gap = 30 + (i % 10);
    const a = goals(s, 60 + gap, 60, false);
    const b = goals(s, 60, 60 + gap, false);
    if (Math.abs(a - b) >= 6) rate++;
  }
  const r = rate / runs;
  assert.ok(r >= 0.01 && r <= 0.03, `قوي ضد ضعيف ${r.toFixed(4)}`);
});

test("(2) لا سقف صلب: الحد الأقصى لهدف فريق 14 بالضبط، والذيل الكبير ممكن", () => {
  assert.equal(GOAL_MODEL.cap, 14);
  const s = { seed: 1313 };
  let max = 0;
  for (let i = 0; i < 300000; i++) max = Math.max(max, goals(s, 60 + 45, 60, false));
  assert.ok(max <= 14, `أقصى هدف ${max}`);
  assert.ok(max >= 7, `الذيل الكبير ممكن (أقصى ${max})`);
});

test("فضيحة النتيجة تُصنَّف: قوي ضد ضعيف، وكبار متقاربون، ولا شيء غير ذلك", () => {
  assert.equal(scandalKind(90, 60, 7, 0), "rout");
  assert.equal(scandalKind(70, 65, 6, 1), "giants");
  assert.equal(scandalKind(70, 65, 3, 0), null);
  assert.equal(scandalKind(90, 60, 5, 0), null, "الفارق 6+ مطلوب مع قوة 30+");
});

test("المحاكاة سريعة: مجموعة عينات كاملة تنتهي في ثوانٍ", () => {
  const t0 = Date.now();
  sample(20, 5);
  assert.ok(Date.now() - t0 < 5000, "أقل من 5 ثوانٍ");
});
