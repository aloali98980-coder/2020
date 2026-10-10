// اختبارات «حياة الملياردير 0.29» — الثروتان المنفصلتان ومستوى المعيشة.
// الفصل التام بين خزينة النادي والثروة الشخصية، حدود التحويل ومراقبة الجمعية،
// مصروف المعيشة الشهري الإجباري، قصص المالك، والترحيل التلقائي للحفظات القديمة.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import {
  OWNER_STORIES,
  LIFESTYLES,
  TRANSFER_CAP,
  initEmpire,
  storyForOldSave,
  netWorth,
  portfolioValue,
  transferToPersonal,
  transferToClub,
  transferRemaining,
  setLifestyle,
  repayDebt,
  chargeMonthlyLiving,
} from "../src/services/empire/wealth.js";
import { empireDay } from "../src/services/empire/day.js";
import { advanceTime } from "../src/services/time.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ...opts });
  validateSave(s);
  return s;
};

test("القصص الثلاث: ثروات افتتاحية مختلفة ودَين المقامر", () => {
  const heir = game({ ownerStory: "heir" });
  const self = game({ ownerStory: "selfmade" });
  const gamb = game({ ownerStory: "gambler" });
  assert.equal(heir.empire.personal, 80_000_000);
  assert.equal(heir.empire.debt, 0);
  assert.equal(self.empire.personal, 40_000_000);
  assert.equal(gamb.empire.personal, 15_000_000);
  assert.equal(gamb.empire.debt, 10_000_000);
  // القصة المجهولة تسقط إلى العصامي بأمان.
  const unknown = createGame({ clubId: "ahly", database: "demo", ownerStory: "xx" });
  assert.equal(unknown.empire.story, "selfmade");
  assert.equal(unknown.empire.personal, OWNER_STORIES.selfmade.wealth);
});

test("الفصل التام: خزينة النادي لا تختلط بالثروة الشخصية", () => {
  const s = game();
  const clubBefore = s.finance.cash;
  const personalBefore = s.empire.personal;
  // أحداث النادي المالية المعتادة لا تمس الشخصي.
  s.finance.cash += 0;
  assert.equal(s.empire.personal, personalBefore);
  // التحويل يغير الطرفين بنفس المقدار تمامًا.
  transferToPersonal(s, 2_000_000);
  assert.equal(s.finance.cash, clubBefore - 2_000_000);
  assert.equal(s.empire.personal, personalBefore + 2_000_000);
  // القيد المحاسبي للنادي ما زال متماسكًا.
  const sum = s.finance.ledger.reduce((a, e) => a + e.amount, 0);
  assert.equal(s.finance.initialCash + sum, s.finance.cash);
});

test("التحويل بحدود شهرية في الاتجاهين", () => {
  const s = game();
  assert.equal(transferRemaining(s, "toPersonal"), TRANSFER_CAP);
  transferToPersonal(s, TRANSFER_CAP);
  assert.equal(transferRemaining(s, "toPersonal"), 0);
  // تجاوز الحد مرفوض.
  assert.throws(() => transferToPersonal(s, 1));
  // الاتجاه الآخر مستقل بحدّه الخاص.
  assert.equal(transferRemaining(s, "toClub"), TRANSFER_CAP);
  transferToClub(s, 3_000_000);
  assert.equal(transferRemaining(s, "toClub"), TRANSFER_CAP - 3_000_000);
  // الشهر الجديد يفتح الحدود من جديد.
  s.date = "2026-11-01";
  assert.equal(transferRemaining(s, "toPersonal"), TRANSFER_CAP);
  assert.equal(transferRemaining(s, "toClub"), TRANSFER_CAP);
});

test("السحب من النادي يمر على الجمعية ويرفع الشبهات حين يكبر", () => {
  const s = game();
  const small = game();
  transferToPersonal(s, 2_000_000); // فوق عتبة المليون
  transferToPersonal(small, 500_000); // تحت العتبة
  assert.ok(
    s.inbox.some(
      (m) => m.category === "board" && /الجمعية/.test(m.title + m.body),
    ),
    "رسالة مراقبة الجمعية للسحب الكبير",
  );
  assert.ok(s.blackFiles.suspicion > 0, "الشبهات ارتفعت مع السحب الكبير");
  assert.equal(small.blackFiles.suspicion, 0);
});

test("دعم النادي من الشخصي يرفع البرستيج ويُسجَّل في الدفاتر", () => {
  const s = game({ ownerStory: "heir" });
  const cashBefore = s.finance.cash;
  transferToClub(s, 4_000_000);
  assert.equal(s.finance.cash, cashBefore + 4_000_000);
  assert.ok(s.finance.ledger.some((e) => e.category === "owner-support"));
  assert.equal(s.empire.prestige, initEmpire(null, "heir").prestige + 1);
});

test("مستويات المعيشة: أسعار متصاعدة وتغيير محفوظ", () => {
  const s = game();
  const tiers = Object.keys(LIFESTYLES);
  for (let i = 1; i < tiers.length; i++)
    assert.ok(LIFESTYLES[tiers[i]].cost > LIFESTYLES[tiers[i - 1]].cost);
  setLifestyle(s, "legendary");
  assert.equal(s.empire.lifestyle, "legendary");
  assert.throws(() => setLifestyle(s, "nope"));
});

test("مصروف المعيشة الشهري يُخصم من الشخصي لا من النادي", () => {
  const s = game();
  setLifestyle(s, "luxury");
  const personalBefore = s.empire.personal;
  const clubBefore = s.finance.cash;
  const rec = chargeMonthlyLiving(s);
  assert.equal(rec.cost, LIFESTYLES.luxury.cost);
  assert.equal(s.empire.personal, personalBefore - LIFESTYLES.luxury.cost);
  assert.equal(s.finance.cash, clubBefore);
});

test("الصرف فوق الدخل ينزف الثروة ثم يراكم الدين", () => {
  const s = game({ ownerStory: "gambler" });
  setLifestyle(s, "legendary");
  s.empire.personal = 1_000_000; // أقل من مصروف الأسطوري (٦ ملايين)
  const rec = chargeMonthlyLiving(s);
  assert.equal(rec.paid, 1_000_000);
  assert.equal(rec.shortfall, 5_000_000);
  assert.equal(s.empire.personal, 0);
  assert.ok(s.empire.debt >= 10_000_000 + 5_000_000);
  assert.ok(s.empire.prestige < 3, "صفعة اجتماعية عند العجز");
});

test("بداية الشهر: دخل القصة + فائدة الدين + المعيشة دفعة واحدة", () => {
  const s = game({ ownerStory: "gambler" });
  setLifestyle(s, "frugal");
  const before = s.empire.personal;
  const debtBefore = s.empire.debt;
  s.date = "2026-10-01";
  const result = empireDay(s);
  assert.ok(result, "التسوية الشهرية تعمل في اليوم الأول");
  // دخل ١٥٠ ألفًا − معيشة ٢٥٠ ألفًا = −١٠٠ ألف، مع فائدة ١٪ تضاف للدين.
  assert.equal(s.empire.personal, before + 150_000 - 250_000);
  assert.ok(s.empire.debt > debtBefore, "فائدة الدين تُضاف");
  // لا تسوية مرتين في نفس الشهر.
  const again = empireDay(s);
  assert.equal(again, null);
});

test("سداد الدين من الشخصي حتى التصفية", () => {
  const s = game({ ownerStory: "gambler" });
  const p = s.empire.personal;
  repayDebt(s, 5_000_000);
  assert.equal(s.empire.debt, 5_000_000);
  assert.equal(s.empire.personal, p - 5_000_000);
  repayDebt(s, 999_000_000); // أكبر من الدين والشخصي معًا → يُقص عند المتاح
  assert.equal(s.empire.debt, 0);
});

test("صافي الثروة: الشخصي + الاستثمارات − الدين، وبلا خزينة النادي", () => {
  const s = game({ ownerStory: "gambler" });
  s.empire.portfolio.deposit = 3_000_000;
  assert.equal(
    netWorth(s),
    s.empire.personal + portfolioValue(s) - s.empire.debt,
  );
  s.finance.cash += 100_000_000; // تضخيم النادي لا يغير صافي المالك
  assert.equal(
    netWorth(s),
    s.empire.personal + portfolioValue(s) - s.empire.debt,
  );
});

test("الترحيل: حفظة قديمة (نسخة ٢٢) تحصل على إمبراطورية تلقائيًا حسب الصعوبة", () => {
  for (const [difficulty, story] of [
    ["beginner", "heir"],
    ["easy", "heir"],
    ["normal", "selfmade"],
    ["hard", "gambler"],
  ]) {
    const modern = game({ difficulty });
    const old = structuredClone(modern);
    delete old.empire;
    old.version = 22;
    const migrated = migrateSave(old);
    assert.equal(migrated.version, 32);
    assert.equal(migrated.empire.story, story, `difficulty=${difficulty}`);
    assert.equal(
      migrated.empire.personal,
      OWNER_STORIES[story].wealth,
      `ثروة ${story}`,
    );
    // خزينة النادي ودفاترها لم تُمس.
    assert.equal(migrated.finance.cash, modern.finance.cash);
    validateSave(migrated);
  }
});

test("storyForOldSave حتمية وتتبع الصعوبة", () => {
  assert.equal(storyForOldSave({ difficulty: "easy" }), "heir");
  assert.equal(storyForOldSave({ difficulty: "normal" }), "selfmade");
  assert.equal(storyForOldSave({ difficulty: "hard" }), "gambler");
  assert.equal(storyForOldSave({}), "selfmade");
});

test("التكامل: تقدم ٤٠ يومًا عبر بداية شهر يظل صالحًا", async () => {
  const s = game();
  const { pendingActions, resolveInfo } = await import("../src/services/inbox.js");
  const { EVENT_CATALOG } = await import("../src/data/eventCatalog.js");
  const { resolveClubEvent } = await import("../src/services/clubEvents.js");
  const { retirementDecision } = await import("../src/services/careers.js");
  const settleAll = () => {
    for (const m of [...pendingActions(s)]) {
      if (m.kind === "club-decision") {
        const ev = s.clubDecisions.find((e) => e.id === m.ref);
        const data = EVENT_CATALOG.find((e) => e.id === ev.type);
        resolveClubEvent(s, ev.id, data.choices.find((c) => !c.cash).id);
      } else if (m.kind === "retirement")
        retirementDecision(s, m.ref, "respect");
      else resolveInfo(s, m.id);
    }
  };
  let total = 0;
  for (let i = 0; i < 15 && !s.empire.lastMonthSettle; i++) {
    const r = advanceTime(s, 7);
    total += r.advanced;
    if (r.blocked) settleAll();
  }
  assert.ok(total >= 28, `تقدم ${total} يومًا`);
  assert.ok(s.empire.lastMonthSettle, "التسوية الشهرية سُجلت عبر الزمن الحي");
  validateSave(s);
});
