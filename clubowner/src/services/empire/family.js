// عائلة «حياة الملياردير» 0.29 — خطوبة ← فرح ← زوجة حية ← أولاد ← طلاق.
// الزوجة لها سعادة ومطالب وذكرى سنوية وعيد ميلاد بعواقب، والأولاد تنمو
// إحصائياتهم (انضباط/موهبة/طموح 0-100) حسب المدرسة والمصروف — إرث المرحلة ١٠.
import { assert, clamp, uid, random, daysBetween } from "../../core/utils.js";
import { message } from "../inbox.js";
import { addSuspicion } from "../blackFiles.js";
import { empireText } from "../../data/empireTexts.js";
import {
  BRIDES,
  WEDDING_TIERS,
  SCHOOLS,
  ALLOWANCES,
  KID_NAMES,
  MAX_CHILDREN,
  DIVORCE_BASE_SHARE,
  DIVORCE_LAWYER_SHARE,
  DIVORCE_LAWYERS_FEE,
} from "../../data/empireFamily.js";
import {
  ensureEmpire,
  personalExpense,
  registerEmpireMonthHook,
} from "./wealth.js";

const fill = (tpl, vars) =>
  Object.entries(vars).reduce((t, [k, v]) => t.split("{" + k + "}").join(v), tpl);

// ── الخطوبة والفرح ──────────────────────────────────────────────────────────
export function propose(s, brideId) {
  const e = ensureEmpire(s);
  const bride = BRIDES[brideId];
  assert(bride, empireText("brideUnknown"));
  assert(
    e.family.status === "single" || e.family.status === "divorced",
    empireText("alreadyCommitted"),
  );
  assert(e.personal >= bride.ring, empireText("ringTooExpensive"));
  e.personal -= bride.ring;
  e.monthTrack.expenses += bride.ring;
  e.family.status = "engaged";
  e.family.brideId = brideId;
  e.family.engagedOn = s.date;
  e.fame = clamp(e.fame + 1, 0, 100);
  message(s, {
    title: empireText("engagementTitle"),
    body: fill(empireText("engagementBody"), { bride: bride.name.ar }),
    category: "events",
  });
  return e.family;
}

// عيد ميلاد الزوجة يشتق حتميًا من بذرة الحفظة — نفس الحفظة، نفس التاريخ.
function birthdayFromSeed(seed) {
  const m = (seed % 12) + 1;
  const d = (Math.floor(seed / 12) % 28) + 1;
  return `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function marry(s, tierId) {
  const e = ensureEmpire(s);
  const tier = WEDDING_TIERS[tierId];
  assert(tier, empireText("weddingUnknown"));
  assert(e.family.status === "engaged", empireText("notEngaged"));
  assert(e.personal >= tier.cost, empireText("weddingTooExpensive"));
  const brideId = e.family.brideId;
  e.personal -= tier.cost;
  e.monthTrack.expenses += tier.cost;
  // الفنانة تلمّع كل فرح: برستيج +٥٠٪.
  const prestigeGain = Math.round(
    tier.prestige * (brideId === "artist" ? 1.5 : 1),
  );
  e.prestige = clamp(e.prestige + prestigeGain, 0, 400);
  e.fame = clamp(e.fame + tier.fame, 0, 100);
  e.family.status = "married";
  e.family.wife = {
    id: uid(s, "wife"),
    name: BRIDES[brideId].name.ar,
    brideId,
    happiness: clamp(50 + tier.happy, 0, 100),
    marriedOn: s.date,
    birthday: birthdayFromSeed(s.seed),
    giftYear: Number(s.date.slice(0, 4)), // هدية الخطوبة تحسب لسنة الفرح
    demandActive: false,
  };
  e.family.wedding = { tier: tierId, cost: tier.cost, date: s.date };
  // بنت النافذين: ثقة الجمعية تقفز يوم الفرح.
  if (brideId === "connected" && s.board)
    s.board.confidence = clamp((s.board.confidence ?? 60) + 5, 0, 100);
  message(s, {
    title: empireText("weddingTitle"),
    body: fill(empireText("weddingBody"), {
      bride: BRIDES[brideId].name.ar,
      tier: tier.name.ar,
    }),
    category: "events",
  });
  return e.family.wife;
}

// ── الهدايا ──────────────────────────────────────────────────────────────────
export const GIFTS = Object.freeze({
  flowers: { cost: 25_000, happy: 6, name: { ar: "باقة ورد", en: "Flowers", fr: "Bouquet" } },
  jewelry: { cost: 500_000, happy: 15, name: { ar: "طقم مجوهرات", en: "Jewelry set", fr: "Parure de bijoux" } },
  trip: { cost: 2_000_000, happy: 30, name: { ar: "رحلة خاصة", en: "Private trip", fr: "Voyage privé" } },
});

export function giveGift(s, giftId) {
  const e = ensureEmpire(s);
  const gift = GIFTS[giftId];
  assert(gift, empireText("giftUnknown"));
  assert(e.family.wife, empireText("noWife"));
  assert(e.personal >= gift.cost, empireText("giftTooExpensive"));
  e.personal -= gift.cost;
  e.monthTrack.expenses += gift.cost;
  e.family.wife.happiness = clamp(e.family.wife.happiness + gift.happy, 0, 100);
  e.family.wife.giftYear = Number(s.date.slice(0, 4));
  e.family.wife.demandActive = false;
  message(s, {
    title: empireText("giftTitle"),
    body: fill(empireText("giftBody"), { gift: gift.name.ar }),
    category: "events",
  });
  return e.family.wife.happiness;
}

// ── الأولاد ──────────────────────────────────────────────────────────────────
export function childAgeDays(c, date) {
  return daysBetween(c.born, date);
}
export function childStage(c, date) {
  const years = childAgeDays(c, date) / 365;
  if (years < 3) return "infant";
  if (years < 13) return "child";
  return "teen";
}

function newChild(s, index) {
  const name = KID_NAMES[(s.seed + index * 7) % KID_NAMES.length];
  return {
    id: uid(s, "kid"),
    name: name.ar,
    born: s.date,
    discipline: 30 + Math.floor(random(s) * 10),
    talent: 30 + Math.floor(random(s) * 10),
    ambition: 30 + Math.floor(random(s) * 10),
    school: "none",
    allowance: "none",
  };
}

export function setSchool(s, childId, tier) {
  const e = ensureEmpire(s);
  const c = e.family.children.find((x) => x.id === childId);
  assert(c, empireText("childMissing"));
  const school = SCHOOLS[tier];
  assert(school, empireText("schoolUnknown"));
  if (tier !== "none")
    assert(childStage(c, s.date) !== "infant", empireText("schoolTooYoung"));
  c.school = tier;
  return c.school;
}

export function setAllowance(s, childId, tier) {
  const e = ensureEmpire(s);
  const c = e.family.children.find((x) => x.id === childId);
  assert(c, empireText("childMissing"));
  assert(ALLOWANCES[tier], empireText("allowanceUnknown"));
  c.allowance = tier;
  return c.allowance;
}

// ── الطلاق ──────────────────────────────────────────────────────────────────
export function divorce(s) {
  const e = ensureEmpire(s);
  assert(e.family.wife, empireText("noWife"));
  const share =
    e.family.wife.brideId === "lawyer"
      ? DIVORCE_LAWYER_SHARE
      : DIVORCE_BASE_SHARE;
  const settlement = Math.floor(e.personal * share);
  e.personal -= settlement;
  e.monthTrack.expenses += settlement;
  // أتعاب المحامين: تُدفع من الباقي أو تتحول دينًا.
  const feeShort = personalExpense(s, DIVORCE_LAWYERS_FEE);
  if (feeShort > 0) e.debt += feeShort;
  e.family.exWife = {
    name: e.family.wife.name,
    brideId: e.family.wife.brideId,
    divorcedOn: s.date,
    settlement,
  };
  e.family.wife = null;
  e.family.status = "divorced";
  e.family.divorceCount += 1;
  e.fame = clamp(e.fame - 8, 0, 100);
  e.prestige = clamp(e.prestige - 10, 0, 400);
  s.fanSupport = clamp(s.fanSupport - 2, 0, 100);
  if (s.board) s.board.confidence = clamp((s.board.confidence ?? 60) - 3, 0, 100);
  addSuspicion(s, 5);
  message(s, {
    title: empireText("divorceTitle"),
    body: fill(empireText("divorceBody"), { money: String(settlement) }),
    category: "events",
  });
  return settlement;
}

// ── الإيقاع الشهري للعائلة ──────────────────────────────────────────────────
export function familyHappiness(s) {
  const w = s.empire?.family?.wife;
  return w ? w.happiness : null;
}

function familyMonthHook(s) {
  const e = ensureEmpire(s);
  const fam = e.family;
  const out = {};
  // سعادة الزوجة: أسلوب الحياة + الطبيبة + ضغط المطالب.
  if (fam.wife) {
    const lifestyle = { frugal: -2, comfortable: 0, luxury: 2, legendary: 4 }[
      e.lifestyle
    ] || 0;
    let drift = lifestyle + (fam.wife.brideId === "doctor" ? 1 : 0);
    // مطالبة نشطة بلا هدية هذا الشهر تضغط على السعادة.
    if (fam.wife.demandActive) drift -= 3;
    fam.wife.happiness = clamp(fam.wife.happiness + drift, 0, 100);
    // مطالبة جديدة أحيانًا حين تهبط السعادة.
    if (fam.wife.happiness < 60 && !fam.wife.demandActive && random(s) < 0.3) {
      fam.wife.demandActive = true;
      message(s, {
        title: empireText("demandTitle"),
        body: empireText("demandBody"),
        category: "events",
      });
    }
    // بنت النافذين تهدّئ الشبهات شهريًا.
    if (fam.wife.brideId === "connected" && s.blackFiles)
      s.blackFiles.suspicion = Math.max(0, s.blackFiles.suspicion - 0.5);
    // مولود جديد: زواج مستقر وسعادة كافية ومساحة في العائلة.
    const marriedYears = daysBetween(fam.wife.marriedOn, s.date) / 365;
    if (
      fam.children.length < MAX_CHILDREN &&
      fam.wife.happiness >= 55 &&
      marriedYears >= 1 &&
      random(s) < 0.08
    ) {
      const kid = newChild(s, fam.children.length);
      fam.children.push(kid);
      e.fame = clamp(e.fame + 1, 0, 100);
      message(s, {
        title: empireText("babyTitle"),
        body: fill(empireText("babyBody"), { name: kid.name }),
        category: "events",
      });
    }
    out.wifeHappiness = fam.wife.happiness;
  }
  // الأولاد: تكاليف المدرسة والمصروف ثم نمو الإحصائيات.
  let kidsCost = 0;
  for (const c of fam.children) {
    const school = SCHOOLS[c.school] || SCHOOLS.none;
    const allow = ALLOWANCES[c.allowance] || ALLOWANCES.none;
    kidsCost += school.cost + allow.cost;
  }
  if (kidsCost > 0) {
    const short = personalExpense(s, kidsCost);
    if (short > 0) {
      e.debt += short;
      // العجز في مصاريف الأولاد يظهر فورًا على انضباطهم.
      for (const c of fam.children)
        c.discipline = clamp(c.discipline - 1, 0, 100);
    }
  }
  const speed = fam.wife?.brideId === "doctor" ? 1.25 : 1;
  for (const c of fam.children) {
    const school = SCHOOLS[c.school] || SCHOOLS.none;
    const allow = ALLOWANCES[c.allowance] || ALLOWANCES.none;
    c.discipline = clamp(c.discipline + school.discipline * speed, 0, 100);
    c.talent = clamp(c.talent + school.talent * speed, 0, 100);
    c.ambition = clamp(c.ambition + allow.ambition * speed, 0, 100);
    // بلا مدرسة ولا مصروف: انحدار بطيء.
    if (c.school === "none" && childStage(c, s.date) !== "infant")
      c.discipline = clamp(c.discipline - 1, 0, 100);
  }
  out.children = fam.children.length;
  return out;
}
registerEmpireMonthHook(familyMonthHook);

// ── الإيقاع اليومي: عيد الميلاد والذكرى السنوية ──────────────────────────────
export function familyDay(s) {
  const e = s.empire;
  if (!e?.family?.wife) return null;
  const w = e.family.wife;
  const mmdd = s.date.slice(5, 10);
  const year = Number(s.date.slice(0, 4));
  const out = [];
  if (w.birthday === mmdd && w.giftYear < year) {
    w.happiness = clamp(w.happiness - 12, 0, 100);
    message(s, {
      title: empireText("forgotBirthdayTitle"),
      body: empireText("forgotBirthdayBody"),
      category: "events",
    });
    out.push("birthday");
  }
  if (w.marriedOn.slice(5, 10) === mmdd && s.date !== w.marriedOn && w.giftYear < year) {
    w.happiness = clamp(w.happiness - 10, 0, 100);
    message(s, {
      title: empireText("forgotAnniversaryTitle"),
      body: empireText("forgotAnniversaryBody"),
      category: "events",
    });
    out.push("anniversary");
  }
  return out.length ? out : null;
}
