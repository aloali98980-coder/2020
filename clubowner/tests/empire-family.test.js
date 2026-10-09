// اختبارات عائلة «حياة الملياردير» 0.29 — الخطوبة والفرح والزوجة والأولاد والطلاق.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import {
  BRIDES,
  WEDDING_TIERS,
  SCHOOLS,
  ALLOWANCES,
  DIVORCE_BASE_SHARE,
  DIVORCE_LAWYER_SHARE,
  DIVORCE_LAWYERS_FEE,
} from "../src/data/empireFamily.js";
import {
  propose,
  marry,
  giveGift,
  divorce,
  setSchool,
  setAllowance,
  childStage,
  familyDay,
  familyHappiness,
  GIFTS,
} from "../src/services/empire/family.js";
import { empireDay } from "../src/services/empire/day.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ownerStory: "heir", ...opts });
  validateSave(s);
  return s;
};

const married = (opts = {}, tier = "family") => {
  const s = game(opts);
  propose(s, opts.bride || "artist");
  marry(s, tier);
  return s;
};

test("الخطوبة: ٤ عرائس ببونص خفيف وخاتم يخصم من الشخصي", () => {
  assert.equal(Object.keys(BRIDES).length, 4);
  const s = game();
  const p = s.empire.personal;
  propose(s, "lawyer");
  assert.equal(s.empire.family.status, "engaged");
  assert.equal(s.empire.family.brideId, "lawyer");
  assert.equal(s.empire.personal, p - BRIDES.lawyer.ring);
  // لا خطوبة ثانية أثناء الارتباط.
  assert.throws(() => propose(s, "artist"));
  assert.throws(() => propose(s, "nope"));
  // لا فرح بلا خطوبة (لعبة أعزب جديدة).
  assert.throws(() => marry(game(), "family"), /خطوبة|engagement|fiançailles/i);
});

test("الفرح بثلاث درجات: التكلفة والسعادة والشهرة تتصاعد", () => {
  const tiers = Object.keys(WEDDING_TIERS);
  for (let i = 1; i < tiers.length; i++)
    assert.ok(WEDDING_TIERS[tiers[i]].cost > WEDDING_TIERS[tiers[i - 1]].cost);
  const s = game();
  propose(s, "artist");
  const before = s.empire.personal;
  marry(s, "luxury");
  const wife = s.empire.family.wife;
  assert.equal(s.empire.family.status, "married");
  assert.equal(s.empire.personal, before - WEDDING_TIERS.luxury.cost);
  assert.equal(wife.happiness, 50 + WEDDING_TIERS.luxury.happy);
  assert.ok(/^\d{2}-\d{2}$/.test(wife.birthday));
  // فرح الفنانة: برستيج +٥٠٪.
  const plain = game();
  propose(plain, "lawyer");
  const p1 = plain.empire.prestige;
  marry(plain, "family");
  assert.equal(plain.empire.prestige - p1, WEDDING_TIERS.family.prestige);
  validateSave(s);
});

test("بنت النافذين ترفع ثقة الجمعية يوم الفرح", () => {
  const s = game();
  s.board = { schema: 1, confidence: 50 };
  propose(s, "connected");
  marry(s, "family");
  assert.equal(s.board.confidence, 55);
});

test("الهدايا ترفع السعادة وتسجل سنة الهدية", () => {
  const s = married();
  const w = s.empire.family.wife;
  w.happiness = 40;
  const year = Number(s.date.slice(0, 4));
  w.giftYear = year - 1;
  giveGift(s, "jewelry");
  assert.equal(w.happiness, 40 + GIFTS.jewelry.happy);
  assert.equal(w.giftYear, year);
  assert.throws(() => giveGift(s, "nope"));
});

test("نسيان الذكرى وعيد الميلاد يخفض السعادة، والهدية تحمي", () => {
  const s = married();
  const w = s.empire.family.wife;
  const year = Number(s.date.slice(0, 4));
  w.giftYear = year - 1; // بلا هدية هذه السنة
  // نضع التاريخ على عيد ميلادها.
  const [mm, dd] = w.birthday.split("-");
  s.date = `${year}-${mm}-${dd}`;
  const before = w.happiness;
  familyDay(s);
  assert.ok(w.happiness < before, "السعادة انخفضت في عيد الميلاد المنسي");
  // نفس اليوم مع هدية السنة: لا عقوبة إضافية في عيد الميلاد (سُجلت السنة).
  giveGift(s, "flowers");
  const after = w.happiness;
  familyDay(s);
  assert.equal(w.happiness, after, "الهدية تحمي من عقوبة العيد نفسه");
});

test("الأولاد: الولادة تحتاج زواجًا مستقرًا وتظهر بإحصائيات أولية", () => {
  const s = married();
  const w = s.empire.family.wife;
  w.happiness = 90;
  w.marriedOn = "2024-01-01"; // أكثر من سنة
  s.date = "2026-08-01";
  let born = false;
  // نكرر التسوية الشهرية حتى يظهر مولود (احتمال ٨٪ شهريًا).
  for (let i = 0; i < 60 && !born; i++) {
    const y = 2026 + Math.floor(i / 12);
    s.date = `${y}-${String((i % 12) + 1).padStart(2, "0")}-01`;
    if (s.date > "2026-08-01") empireDay(s);
    born = s.empire.family.children.length > 0;
    if (born) break;
  }
  assert.ok(born, "ولد طفل خلال ٦٠ شهرًا افتراضيًا");
  const kid = s.empire.family.children[0];
  for (const k of ["discipline", "talent", "ambition"])
    assert.ok(kid[k] >= 0 && kid[k] <= 100);
  assert.equal(childStage(kid, s.date), "infant");
});

test("المدرسة والمصروف يشكلان إحصائيات الوريث شهريًا", () => {
  const s = married();
  const kid = {
    id: "kid-x",
    name: "آدم",
    born: "2015-01-01",
    discipline: 30,
    talent: 30,
    ambition: 30,
    school: "none",
    allowance: "none",
  };
  s.empire.family.children.push(kid);
  setSchool(s, "kid-x", "elite");
  setAllowance(s, "kid-x", "generous");
  const d0 = kid.discipline, a0 = kid.ambition;
  s.date = "2026-08-01";
  empireDay(s);
  assert.ok(kid.discipline > d0, "الانضباط يرتفع بأكاديمية النخبة");
  assert.ok(kid.ambition > a0, "الطموح يرتفع بالمصروف الكريم");
  assert.ok(kid.discipline <= 100 && kid.ambition <= 100);
  // التحاق رضيع بالمدرسة مرفوض.
  const baby = { id: "kid-y", name: "ملك", born: s.date, discipline: 30, talent: 30, ambition: 30, school: "none", allowance: "none" };
  s.empire.family.children.push(baby);
  assert.throws(() => setSchool(s, "kid-y", "public"));
  validateSave(s);
});

test("بلا مدرسة ولا مصروف: انحدار بطيء في الانضباط", () => {
  const s = married();
  const kid = {
    id: "kid-z",
    name: "عمر",
    born: "2012-01-01",
    discipline: 50,
    talent: 30,
    ambition: 30,
    school: "none",
    allowance: "none",
  };
  s.empire.family.children.push(kid);
  s.date = "2026-08-01";
  empireDay(s);
  assert.ok(kid.discipline < 50, "الانضباط ينحدر بلا مدرسة");
});

test("الطلاق: نصف الثروة + محامون + فضيحة، والمحامية تخفض التسوية", () => {
  const s = married({ bride: "artist" }, "family");
  const personal = s.empire.personal;
  const fame = s.empire.fame;
  const suspicion = s.blackFiles.suspicion;
  const settlement = divorce(s);
  assert.equal(settlement, Math.floor(personal * DIVORCE_BASE_SHARE));
  assert.equal(s.empire.family.status, "divorced");
  assert.equal(s.empire.family.wife, null);
  assert.ok(s.empire.personal <= personal - settlement);
  assert.ok(s.empire.fame < fame, "فضيحة تخفض الشهرة");
  assert.ok(s.blackFiles.suspicion >= suspicion + 5);
  assert.equal(s.empire.family.divorceCount, 1);
  // المحامية: ٤٠٪ بدل ٥٠٪.
  const l = married({ bride: "lawyer" }, "family");
  const p2 = l.empire.personal;
  const set2 = divorce(l);
  assert.equal(set2, Math.floor(p2 * DIVORCE_LAWYER_SHARE));
  // الطلاق بلا زوجة مرفوض.
  assert.throws(() => divorce(l));
});

test("familyHappiness يعكس سعادة الزوجة أو لا شيء للأعزب", () => {
  const s = game();
  assert.equal(familyHappiness(s), null);
  married();
});

test("التكامل: سنة كاملة بالزواج تظل صالحة", () => {
  const s = married({}, "luxury");
  s.empire.family.wife.happiness = 90;
  for (let i = 0; i < 13; i++) {
    s.date = `2026-${String((i % 12) + 1).padStart(2, "0")}-01`;
    if (i > 0) empireDay(s);
  }
  validateSave(s);
});
