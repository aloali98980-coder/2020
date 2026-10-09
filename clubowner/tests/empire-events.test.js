// اختبارات أحداث «حياة الملياردير» 0.29 — البوابات المنطقية (لا حدث بلا
// شرطه)، تنفيذ الآثار العامة (ثروة/برستيج/شهرة/سعادة الزوجة)، والميكانيكات
// الخاصة بأحداث محددة.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { addDays } from "../src/core/utils.js";
import { EVENT_CATALOG, FLAVOR_CATALOG } from "../src/data/eventCatalog.js";
import { resolveClubEvent } from "../src/services/clubEvents.js";
import { buyAsset } from "../src/services/empire/assets.js";
import { propose, marry } from "../src/services/empire/family.js";

const EMPIRE_EVENTS = EVENT_CATALOG.filter((e) => e.group === "empire");
const EMPIRE_FLAVORS = FLAVOR_CATALOG.filter((f) => f.category === "empire");

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ownerStory: "heir", ...opts });
  validateSave(s);
  return s;
};

// حالة ثرية متكاملة تفتح معظم البوابات.
const richSave = () => {
  const s = game();
  const e = s.empire;
  e.personal = 2_000_000_000;
  e.prestige = 60;
  e.fame = 65;
  e.lifestyle = "legendary";
  buyAsset(s, "home-island");
  buyAsset(s, "home-villa");
  buyAsset(s, "yacht-mega");
  buyAsset(s, "jet-long");
  buyAsset(s, "art-painting");
  e.portfolio.coin = 5_000_000;
  e.portfolio.startup = 5_000_000;
  e.charity.personalTotal = 2_000_000;
  propose(s, "artist");
  marry(s, "luxury");
  // تواريخ قريبة من تاريخ الحفظ (٠١-٠٧) كي تنفتح بوابات المناسبات.
  const mm = s.date.slice(5, 7);
  e.family.wife.happiness = 60;
  e.family.wife.marriedOn = `${Number(s.date.slice(0, 4)) - 1}-${mm}-05`;
  e.family.wife.birthday = `${mm}-10`;
  e.family.wife.giftYear = Number(s.date.slice(0, 4)) - 1;
  e.family.children.push({
    id: "k9",
    name: "آدم",
    born: "2010-05-01",
    discipline: 50,
    talent: 50,
    ambition: 50,
    school: "none",
    allowance: "none",
  });
  return s;
};

let qi = 0;
const queue = (s, type) => {
  const id = "decision-test-" + ++qi;
  s.clubDecisions.push({ id, type, date: s.date, status: "open", choice: null });
  return id;
};

test("الكتالوج: ٢٦ قرارًا إمبراطوريًا و١٦ نكهة، كلها ببوابات دالة", () => {
  assert.ok(EMPIRE_EVENTS.length >= 26, `${EMPIRE_EVENTS.length} قرارًا`);
  assert.ok(EMPIRE_FLAVORS.length >= 16, `${EMPIRE_FLAVORS.length} نكهة`);
  assert.ok(EMPIRE_EVENTS.length + EMPIRE_FLAVORS.length >= 40);
  for (const ev of [...EMPIRE_EVENTS, ...EMPIRE_FLAVORS])
    assert.equal(typeof ev.when, "function", ev.id);
});

test("البوابات: تنفتح على الثري وتنغلق على الجديد", () => {
  const rich = richSave();
  const fresh = game();
  const openOnRich = EMPIRE_EVENTS.filter((e) => e.when(rich)).map((e) => e.id);
  const openOnFresh = EMPIRE_EVENTS.filter((e) => e.when(fresh)).map((e) => e.id);
  // أحداث الثراء الكبرى لا تظهر لبداية جديدة.
  for (const id of ["empire-lion-escape", "empire-rival-villa", "empire-yacht-regatta", "empire-jet-emergency"])
    assert.ok(!openOnFresh.includes(id), `${id} ظهر بلا شرطه`);
  // وبواباتها تعمل للحالة الثرية.
  for (const id of ["empire-lion-escape", "empire-rival-villa", "empire-yacht-regatta", "empire-jet-emergency", "empire-forgot-anniversary"])
    assert.ok(openOnRich.includes(id), `${id} لم ينفتح للثري`);
  // حدث الدين لا يظهر إلا للمقامر المدين.
  const gambler = game({ ownerStory: "gambler" });
  assert.ok(EMPIRE_EVENTS.find((e) => e.id === "empire-debt-collector").when(gambler));
  assert.ok(!EMPIRE_EVENTS.find((e) => e.id === "empire-debt-collector").when(rich));
});

test("الآثار العامة: الثروة الشخصية والبرستيج والشهرة وسعادة الزوجة", () => {
  const s = richSave();
  const p0 = s.empire.personal,
    pr0 = s.empire.prestige,
    f0 = s.empire.fame,
    h0 = s.empire.family.wife.happiness;
  resolveClubEvent(s, queue(s, "empire-wife-jewelry-demand"), "buy-auction");
  assert.equal(s.empire.personal, p0 - 1_200_000);
  assert.equal(s.empire.family.wife.happiness, h0 + 18);
  validateSave(s);
  // البرستيج والشهرة من حدث القصر الرئاسي.
  resolveClubEvent(s, queue(s, "empire-president-invite"), "attend-gift");
  assert.equal(s.empire.prestige, pr0);
  assert.ok(s.empire.fame > f0);
});

test("آلية خاصة: انهيار العملة — البيع الفوري يخسر الخُمس", () => {
  const s = richSave();
  const coin = s.empire.portfolio.coin;
  resolveClubEvent(s, queue(s, "empire-currency-crash"), "sell-now");
  assert.equal(s.empire.portfolio.coin, Math.round(coin * 0.8));
  const t = richSave();
  resolveClubEvent(t, queue(t, "empire-currency-crash"), "diversify");
  assert.equal(t.empire.portfolio.coin, 0);
  assert.ok(t.empire.portfolio.deposit >= 5_000_000);
});

test("آلية خاصة: ديْن المقامر ينخفض بالسداد", () => {
  const s = game({ ownerStory: "gambler" });
  s.empire.prestige = 30;
  s.empire.personal = 30_000_000;
  const debt = s.empire.debt;
  assert.ok(debt > 0);
  resolveClubEvent(s, queue(s, "empire-debt-collector"), "pay-debt-now");
  assert.equal(s.empire.debt, Math.max(0, debt - 5_000_000));
  assert.equal(s.empire.personal, 25_000_000);
  validateSave(s);
});

test("آلية خاصة: هدية الذكرى تُسجل سنة العطاء", () => {
  const s = richSave();
  assert.ok(s.empire.family.wife.giftYear < Number(s.date.slice(0, 4)));
  resolveClubEvent(s, queue(s, "empire-forgot-anniversary"), "grand-apology");
  assert.equal(s.empire.family.wife.giftYear, Number(s.date.slice(0, 4)));
});

test("آلية خاصة: استدعاء المدرسة يشد انضباط المراهق", () => {
  const s = richSave();
  const kid = s.empire.family.children[0];
  const d0 = kid.discipline;
  resolveClubEvent(s, queue(s, "empire-child-school-call"), "attend-meeting");
  assert.ok(kid.discipline > d0);
});

test("آلية خاصة: حرق اللوحة المشكوك فيها يزيلها من المجموعة", () => {
  const s = richSave();
  assert.ok(s.empire.assets.some((a) => a.assetId === "art-painting"));
  resolveClubEvent(s, queue(s, "empire-art-forgery"), "burn-spectacle");
  assert.ok(!s.empire.assets.some((a) => a.assetId === "art-painting"));
  validateSave(s);
});

test("آلية خاصة: استثمار الملاك يدخل محفظة الناشئة", () => {
  const s = richSave();
  const startup = s.empire.portfolio.startup;
  const p0 = s.empire.personal;
  resolveClubEvent(s, queue(s, "empire-angel-offer"), "angel-invest");
  assert.equal(s.empire.portfolio.startup, startup + 5_000_000);
  assert.equal(s.empire.personal, p0 - 5_000_000);
});

test("آلية خاصة: الضرائب والتعاون يخفضان الشبهات", () => {
  const s = richSave();
  s.blackFiles.suspicion = 20;
  const susp = s.blackFiles.suspicion;
  resolveClubEvent(s, queue(s, "empire-tax-audit"), "full-coop");
  assert.ok(s.blackFiles.suspicion < susp);
});

test("كل خيار قرار إمبراطوري يُحسم بلا رمي على حفظ صالح", () => {
  for (const ev of EMPIRE_EVENTS) {
    for (const c of ev.choices) {
      const s = richSave();
      assert.doesNotThrow(
        () => resolveClubEvent(s, queue(s, ev.id), c.id),
        `${ev.id}/${c.id}`,
      );
    }
  }
});

test("نكهات الإمبراطورية تطبق أثرها الشخصي الصغير ضمن الحدود", () => {
  const fl = EMPIRE_FLAVORS.find((f) => f.id === "fl-empire-broker-call");
  const s = richSave();
  const p0 = s.empire.personal;
  // تطبيق الأثر مباشرة كما يفعل محرك النكهة.
  s.empire.personal += fl.effect.personal;
  assert.ok(Math.abs(s.empire.personal - p0) <= 25000);
  assert.ok(EMPIRE_FLAVORS.every((f) => !f.effect || !f.effect.personal || Math.abs(f.effect.personal) <= 25000));
});
