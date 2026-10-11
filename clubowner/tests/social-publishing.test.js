// الدفعة 5 — القسم 5: السوشيال (القانوني).
// نشر مزدوج: تلقائي للروتيني، والكبرى لا تُنشر إلا يدويًا. منصات بأسمائها الحقيقية.
// دخل متحقق: قمصان أونلاين ورعاة مرتبطون بالمتابعين والتفاعل.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { setLanguage } from "../src/i18n/index.js";
import { ensureStaffCorp } from "../src/services/staff/staffCorp.js";
import {
  SOCIAL_PLATFORMS,
  platformSplit,
  socialMonth,
  socialState,
  AUTO_ROUTINE_COST,
  SPONSOR_MIN_FOLLOWERS,
} from "../src/services/staff/social.js";
import { initCommerce } from "../src/services/commerce.js";

setLanguage("ar");

const fresh = () => {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  ensureStaffCorp(s);
  socialState(s);
  s.finance.cash = 50_000_000;
  return s;
};
const entries = (s, category) => s.finance.ledger.filter((e) => e.category === category);

test("المنصات الثلاث بأسمائها الحقيقية، وحصصها تجمع إلى 100%", () => {
  assert.deepEqual(SOCIAL_PLATFORMS.map((p) => p.name), ["X", "Instagram", "TikTok"]);
  assert.equal(SOCIAL_PLATFORMS.reduce((a, p) => a + p.share, 0), 100);
  for (const p of SOCIAL_PLATFORMS) assert.ok(p.handle.startsWith("@"), p.id);
});

test("توزيع المتابعين على المنصات يجمع الإجمالي بالضبط", () => {
  for (const total of [0, 1, 999, 123_457, 2_000_000]) {
    const split = platformSplit(total);
    assert.equal(Object.values(split).reduce((a, b) => a + b, 0), total, `total ${total}`);
  }
});

test("النشر التلقائي للروتيني يحدث شهريًا ويخصم كلفته، ولا يغيّر الجمهور", () => {
  const s = fresh();
  socialState(s).followers = 0; // بلا رعاة في هذا الاختبار
  const cash = s.finance.cash;
  const fans = s.fanSupport;
  socialMonth(s);
  assert.equal(socialState(s).autoPosts, 1);
  assert.equal(s.finance.cash, cash - AUTO_ROUTINE_COST);
  assert.equal(s.fanSupport, fans, "الكبرى لا تُنشر تلقائيًا؛ والروتيني لا يحرك الجمهور");
  assert.equal(entries(s, "social-content").length, 1);
});

test("النشر التلقائي يتوقف إذا لم تغطِّ السيولة كلفته", () => {
  const s = fresh();
  s.finance.cash = AUTO_ROUTINE_COST - 1;
  socialMonth(s);
  assert.equal(socialState(s).autoPosts ?? 0, 0);
});

test("المنصات تُحدَّث شهريًا وتطابق إجمالي المتابعين", () => {
  const s = fresh();
  socialState(s).followers = 765_432;
  socialMonth(s);
  const st = socialState(s);
  assert.equal(Object.values(st.platforms).reduce((a, b) => a + b, 0), st.followers);
});

test("الرعاة يدفعون حسب المتابعين والتفاعل فوق الحد الأدنى", () => {
  const s = fresh();
  const st = socialState(s);
  st.followers = 2_000_000;
  st.engagement = 60;
  socialMonth(s);
  const sponsor = entries(s, "social-sponsor");
  assert.equal(sponsor.length, 1);
  // الصيغة: (المتابعون / 1000) × 300 × (التفاعل / 100)، بالقيم بعد تحديث الشهر
  const expected = Math.round((Math.min(st.followers, 5_000_000) / 1000) * 300 * (st.engagement / 100));
  assert.equal(sponsor[0].amount, expected);
  assert.ok(sponsor[0].amount > 0);
});

test("لا رعاية دون الحد الأدنى من المتابعين", () => {
  const s = fresh();
  const st = socialState(s);
  st.followers = 0; // بعد زيادة الشهر يبقى دون الحد
  st.engagement = 80;
  socialMonth(s);
  assert.equal(entries(s, "social-sponsor").length, 0);
});

test("القمصان أونلاين تُدر دخلًا حين يكون متجر النادي مفتوحًا", () => {
  const s = fresh();
  initCommerce(s);
  s.commerce.businesses = ["shop"];
  socialState(s).followers = 500_000;
  socialMonth(s);
  assert.ok(entries(s, "online-shirts").length >= 1);
});
