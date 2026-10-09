// 0.27 — اختبارات تحديث الدراما (المرحلة السابعة):
// 1. قرعة الكأس (Cup Draw)
// 2. يوم قفل القيد (Deadline Day)
// 3. يوم تصعيد الناشئين (Youth Intake Day)
// 4. نكهة الديربي (Derby Flavor)
// 5. أول 60 ثانية: الماتش الودي الفوري (First 60 Seconds)
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { advanceTime } from "../src/services/time.js";
import { recordCupDraw, getCupDraw } from "../src/services/cupDraw.js";
import {
  isDeadlineDay,
  getDeadlineCountdown,
  deadlineDayTick,
  acceptDeadlineBid,
  declineDeadlineBid,
} from "../src/services/deadlineDay.js";
import {
  isYouthIntakeDay,
  generateYouthIntake,
  executeYouthIntakeDecisions,
} from "../src/services/youthIntake.js";
import {
  getDerbyInfo,
  derbyPreMatchMessage,
  derbyPostMatchMessage,
} from "../src/services/derby.js";
import {
  findFriendlyOpponent,
  playInstantFriendly,
} from "../src/services/instantFriendly.js";
import { matchDay } from "../src/services/matches.js";
import { ticketForecast } from "../src/services/commerce.js";

const game = (clubId = "ahly") =>
  createGame({
    database: "world",
    expanded: true,
    clubId,
    leagues: ["eg"],
    difficulty: "easy",
  });

// ── 1. قرعة الكأس ──
test("قرعة الكأس: تسجيل القرعة والمواجهات وإرسال إشعار بريدي لنادي المستخدم", () => {
  const s = game("ahly");
  const cup = {
    id: "cup-test",
    name: "كأس التجربة",
    round: 1,
    country: "eg",
  };
  const pairs = [
    ["ahly", "zamalek"],
    ["pyramids", "masry"],
  ];
  const byes = ["ittihad-alex"];

  const draw = recordCupDraw(s, cup, "qf", pairs, byes);
  assert.ok(draw);
  assert.equal(draw.cupId, "cup-test");
  assert.equal(draw.involvesUser, true);
  assert.equal(draw.pairs.length, 2);
  assert.deepEqual(draw.userMatchup, { home: "ahly", away: "zamalek" });

  // التحقق من الحفظ والوصول عبر المعرف
  const fetched = getCupDraw(s, draw.id);
  assert.equal(fetched.id, draw.id);

  // التحقق من إشعار البريد
  const inboxMsg = s.inbox.find((m) => m.kind === "cup-draw" && m.ref === draw.id);
  assert.ok(inboxMsg);
  assert.ok(inboxMsg.title.includes("كأس التجربة"));
  assert.ok(inboxMsg.body.includes("الأهلي"));

  validateSave(s);
});

// ── 2. يوم قفل القيد ──
test("يوم قفل القيد: التعرف على اليوم، العد التنازلي، وتوليد وقبول عروض الساعات الأخيرة", () => {
  const s = game("ahly");

  // الفحص الزمني
  assert.equal(isDeadlineDay(s, "2026-09-30"), true);
  assert.equal(isDeadlineDay(s, "2027-01-31"), true);
  assert.equal(isDeadlineDay(s, "2026-10-15"), false);

  const countdown = getDeadlineCountdown(s, "2026-09-30");
  assert.ok(countdown);
  assert.equal(countdown.isDeadline, true);
  assert.equal(countdown.closingTime, "23:59");
  assert.ok(countdown.labelAr.includes("يوم قفل القيد"));

  // ضبط التاريخ لمحاكاة يوم قفل القيد وتوليد العرض
  s.date = "2026-09-30";
  deadlineDayTick(s);

  // تحقق من وجود تنبيه وعرض عاجل
  const bidMsg = s.inbox.find((m) => m.kind === "deadline-bid");
  assert.ok(bidMsg);
  assert.ok(bidMsg.required);
  assert.ok(bidMsg.fee > 0);

  const targetPlayer = s.players.find((p) => p.id === bidMsg.ref);
  assert.ok(targetPlayer);
  assert.equal(targetPlayer.clubId, "ahly");

  const cashBefore = s.finance.cash;
  const accepted = acceptDeadlineBid(s, bidMsg.id);
  assert.equal(accepted, true);
  assert.ok(s.finance.cash > cashBefore);
  assert.notEqual(targetPlayer.clubId, "ahly");
  assert.equal(bidMsg.done, true);

  validateSave(s);
});

test("يوم قفل القيد: رفض العرض يبقي اللاعب في ناديه", () => {
  const s = game("ahly");
  s.date = "2026-09-30";
  deadlineDayTick(s);

  const bidMsg = s.inbox.find((m) => m.kind === "deadline-bid");
  assert.ok(bidMsg);
  const targetPlayer = s.players.find((p) => p.id === bidMsg.ref);

  const declined = declineDeadlineBid(s, bidMsg.id);
  assert.equal(declined, true);
  assert.equal(targetPlayer.clubId, "ahly");
  assert.equal(bidMsg.done, true);
});

// ── 3. يوم تصعيد الناشئين ──
test("يوم تصعيد الناشئين: توليد دفعة المواهب واعتماد القرارات (تصعيد، إعارة، تسريح)", () => {
  const s = game("ahly");

  assert.equal(isYouthIntakeDay(s, "2027-03-20"), true);
  assert.equal(isYouthIntakeDay(s, "2026-11-15"), false);

  const batch = generateYouthIntake(s);
  assert.ok(batch);
  assert.ok(batch.candidates.length >= 3);
  assert.ok(batch.candidates.every((c) => c.player.age === 16 || c.player.age === 17));

  // رسالة بريدية بالإعلان
  const inboxNotice = s.inbox.find((m) => m.kind === "youth-intake-day");
  assert.ok(inboxNotice);
  assert.equal(inboxNotice.required, true);

  // إعداد قرارات متباينة
  const decisions = {};
  const [c1, c2, c3] = batch.candidates;
  decisions[c1.player.id] = "promote";
  decisions[c2.player.id] = "loan";
  decisions[c3.player.id] = "release";

  const initialCount = s.players.filter((p) => p.clubId === "ahly").length;
  const res = executeYouthIntakeDecisions(s, decisions);
  assert.ok(res);
  assert.equal(res.promoted, 1);
  assert.equal(res.loaned, 1);
  assert.equal(res.released, 1);

  // التحقق من اللاعب المصعد
  const promoted = s.players.find((p) => p.id === c1.player.id);
  assert.ok(promoted);
  assert.equal(promoted.clubId, "ahly");

  // التحقق من اللاعب المعار
  const loaned = s.players.find((p) => p.id === c2.player.id);
  assert.ok(loaned);
  assert.ok(loaned.loan);

  // التحقق من اللاعب المسرح
  const released = s.players.find((p) => p.id === c3.player.id);
  assert.ok(released);
  assert.notEqual(released.clubId, "ahly");

  validateSave(s);
});

// ── 4. نكهة الديربي ──
test("نكهة الديربي: التعرف على الديربي، حضور أعلى، أسعار مضاعفة، وتوتر", () => {
  const s = game("ahly");

  // التعرف على ديربي الأهلي والزمالك (ديربي القاهرة)
  const derby = getDerbyInfo("ahly", "zamalek", s);
  assert.equal(derby.isDerby, true);
  assert.ok(derby.nameAr.includes("ديربي القاهرة"));

  // مباراة عادية غير ديربي
  const normal = getDerbyInfo("ahly", "haras-elhodood", s);
  assert.equal(normal.isDerby, false);

  // رسائل ما قبل وبعد المباراة
  const pre = derbyPreMatchMessage({ id: "ahly", name: "الأهلي" }, { id: "zamalek", name: "الزمالك" }, derby);
  assert.ok(pre.title.includes("ديربي"));
  assert.equal(pre.category, "matches");

  const postWin = derbyPostMatchMessage(
    { id: "ahly", name: "الأهلي" },
    { id: "zamalek", name: "الزمالك" },
    "win",
    2,
    1,
    derby
  );
  assert.ok(postWin.title.includes("مجد الديربي"));

  // مضاعفة أسعار التذاكر وتوقع الحضور المرتفع
  const derbyFixture = { id: "f-derby", home: "ahly", away: "zamalek", isDerby: true };
  const plainFixture = { id: "f-plain", home: "ahly", away: "haras-elhodood", isDerby: false };

  const derbyFc = ticketForecast(s, derbyFixture);
  const plainFc = ticketForecast(s, plainFixture);

  assert.equal(derbyFc.isDerby, true);
  assert.equal(plainFc.isDerby, false);
  assert.ok(derbyFc.attendance > plainFc.attendance);
  assert.ok(derbyFc.gross > plainFc.gross * 1.5);

  validateSave(s);
});

// ── 5. أول 60 ثانية (الماتش الودي الفوري) ──
test("أول 60 ثانية: العب ماتش ودي النهاردة بجدولة فورية وتقرير متكامل ولقطات", () => {
  const s = game("ahly");

  const opp = findFriendlyOpponent(s);
  assert.ok(opp);
  assert.notEqual(opp.id, "ahly");

  const cashBefore = s.finance.cash;
  const result = playInstantFriendly(s);
  assert.ok(result);
  assert.equal(result.fixture.played, true);
  assert.equal(result.fixture.isFriendly, true);
  assert.ok(Number.isInteger(result.fixture.homeGoals));
  assert.ok(Number.isInteger(result.fixture.awayGoals));
  assert.ok(result.report);
  assert.ok(Array.isArray(result.report.events));

  // التحقق من تسجيل المباراة في روزنامة الوديات
  assert.ok(s.friendlies.some((f) => f.id === result.fixture.id));

  // التحقق من تسجيل إيراد التذاكر
  assert.ok(s.finance.cash >= cashBefore);

  // التحقق من وصول رسالة البريد
  const msg = s.inbox.find((m) => m.kind === "friendly-report");
  assert.ok(msg);
  assert.ok(msg.title.includes("ودية"));

  validateSave(s);
});
