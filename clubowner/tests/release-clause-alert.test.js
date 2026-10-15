// إنذار الكسر ⏰: إشعار «نادي X سيكسر شرط Y!» + مهلة رد (راتب/تجديد/شرط! 🛡️)
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { addDays } from "../src/core/utils.js";
import { validateSave } from "../src/core/validation.js";
import { extendedClub } from "../src/data/expandedCatalog.js";
import { setLanguage, translateText } from "../src/i18n/index.js";
import { messageDetail } from "../src/features/inbox.js";
import {
  RELEASE_BREAK_DEADLINE_DAYS,
  blackFilesDay,
  counterReleaseClauseBreak,
  ensureBlackFiles,
} from "../src/services/blackFiles.js";
import { morningHeadlines } from "../src/services/morningHeadlines.js";
import { renewPlayer } from "../src/services/transfers.js";

function setupPendingBreak() {
  const s = createGame({ clubId: "ahly", database: "demo" });
  s.press = { trust: 60, news: [] };
  const p = s.players.find(
    (x) => x.clubId === s.clubId && x.status !== "retired",
  );
  p.contractTerms.releaseClause = 5_000_000;
  const buyer = s.table.find((r) => r.clubId !== s.clubId).clubId;
  const buyerName = extendedClub(buyer)?.name || buyer;
  ensureBlackFiles(s).pendingAiBreaks = [
    {
      playerId: p.id,
      buyer,
      clause: 5_000_000,
      date: s.date,
      budgetDeducted: true,
    },
  ];
  return { s, p, buyer, buyerName };
}

test("إنذار الكسر ⏰: يرسل إشعار «نادي X سيكسر شرط Y!» مع مهلة رد، وينفذ الكسر عند انتهاء المهلة بلا رد", () => {
  const { s, p, buyer, buyerName } = setupPendingBreak();
  const fansBefore = s.fanSupport;
  const cashBefore = s.finance.cash;

  // اليوم الأول: إرسال الإنذار المسبق وبقاء اللاعب خلال المهلة
  blackFilesDay(s);
  assert.equal(p.clubId, s.clubId, "اللاعب يبقى في ناديك خلال مهلة الرد");
  const alertMsg = s.inbox.find(
    (m) => m.kind === "release-clause-alert" && m.ref === p.id,
  );
  assert.ok(alertMsg, "وصول إشعار إنذار الكسر");
  assert.equal(alertMsg.title, `نادي ${buyerName} سيكسر شرط ${p.name}!`);
  assert.equal(alertMsg.priority, "high");
  assert.equal(alertMsg.required, false);
  assert.equal(
    alertMsg.deadline,
    addDays(s.date, RELEASE_BREAK_DEADLINE_DAYS),
    "مهلة الرد محددة",
  );
  assert.ok(
    s.press.news.some((n) => n.title === alertMsg.title),
    "خبر الإنذار في الصحافة",
  );
  assert.equal(morningHeadlines(s)[0].kind, "alert");

  // أزرار الرد الثلاثة ظاهرة في تفاصيل الرسالة داخل البريد
  const detailHtml = messageDetail(s, alertMsg);
  assert.ok(detailHtml.includes('data-action="release-break-salary"'));
  assert.ok(detailHtml.includes('data-action="release-break-renew"'));
  assert.ok(detailHtml.includes('data-action="release-break-clause"'));

  // قبل انتهاء المهلة بيوم: اللاعب ما زال في النادي
  s.date = addDays(s.date, RELEASE_BREAK_DEADLINE_DAYS - 1);
  blackFilesDay(s);
  assert.equal(p.clubId, s.clubId, "المهلة لم تنتهِ بعد");

  // عند حلول تاريخ انتهاء المهلة بلا تحصين: يُنفذ كسر الشرط تلقائيًا
  s.date = addDays(s.date, 1);
  blackFilesDay(s);
  assert.equal(p.clubId, buyer, "انتقل اللاعب بعد انقضاء مهلة الرد");
  assert.equal(s.finance.cash, cashBefore + 5_000_000, "دخول قيمة الشرط للخزينة");
  assert.ok(s.fanSupport < fansBefore, "الجماهير تتأثر بعد رحيل اللاعب");
  assert.equal(alertMsg.status, "resolved", "إغلاق رسالة الإنذار بعد التنفيذ");
  validateSave(s);
});

test("مهلة الرد 🛡️: رفع الراتب أو تجديد العقد أو رفع/إلغاء الشرط الجزائي يحبط كسر الشرط", () => {
  // 1) التحصين عبر رفع الراتب
  {
    const { s, p, buyer } = setupPendingBreak();
    s.expansion = { budgets: { [buyer]: 10_000_000 } };
    blackFilesDay(s);
    const oldSalary = p.salary;
    const res = counterReleaseClauseBreak(s, p.id, "salary");
    assert.equal(res.protected, true);
    assert.ok(p.salary > oldSalary, "ارتفع راتب اللاعب");
    assert.equal(s.blackFiles.pendingAiBreaks.length, 0);
    assert.equal(
      s.expansion.budgets[buyer],
      15_000_000,
      "استرد النادي المشتري المبلغ المحجوز",
    );
    s.date = addDays(s.date, RELEASE_BREAK_DEADLINE_DAYS + 2);
    blackFilesDay(s);
    assert.equal(p.clubId, s.clubId, "اللاعب بقي في النادي بعد انتهاء المهلة");
  }

  // 2) التحصين عبر تجديد العقد (renewPlayer)
  {
    const { s, p } = setupPendingBreak();
    s.finance.cash = 20_000_000;
    s.finance.wageBudget = 50_000_000;
    blackFilesDay(s);
    renewPlayer(s, p.id, {
      salary: p.salary + 10_000,
      bonus: 50_000,
      years: 3,
      role: p.role,
      releaseClause: 15_000_000,
    });
    assert.equal(
      s.blackFiles.pendingAiBreaks.length,
      0,
      "تجديد العقد ألغى كسر الشرط المعلق فورًا",
    );
    s.date = addDays(s.date, RELEASE_BREAK_DEADLINE_DAYS + 2);
    blackFilesDay(s);
    assert.equal(p.clubId, s.clubId, "اللاعب مستمر في النادي");
  }

  // 3) التحصين عبر رفع أو إلغاء الشرط الجزائي
  {
    const { s, p } = setupPendingBreak();
    blackFilesDay(s);
    counterReleaseClauseBreak(s, p.id, "clause", { releaseClause: 25_000_000 });
    assert.equal(p.contractTerms.releaseClause, 25_000_000);
    assert.equal(s.blackFiles.pendingAiBreaks.length, 0);
    s.date = addDays(s.date, RELEASE_BREAK_DEADLINE_DAYS + 2);
    blackFilesDay(s);
    assert.equal(p.clubId, s.clubId, "اللاعب محصن بعد رفع الشرط");
  }
});

test("ترجمة رسائل إنذار الكسر والتحصين للإنجليزية والفرنسية بلا بقايا عربية", () => {
  const { s, p } = setupPendingBreak();
  blackFilesDay(s);
  const alertMsg = s.inbox.find((m) => m.kind === "release-clause-alert");
  counterReleaseClauseBreak(s, p.id, "salary");
  const protectedMsg = s.inbox.find(
    (m) => m.kind === "release-clause-protected",
  );
  for (const lang of ["en", "fr"]) {
    setLanguage(lang);
    for (const text of [
      alertMsg.title,
      alertMsg.body,
      protectedMsg.title,
      protectedMsg.body,
    ]) {
      const translated = translateText(text);
      assert.doesNotMatch(
        translated,
        /[\u0600-\u06FF]/,
        `بقايا عربية في (${lang}): ${translated}`,
      );
    }
  }
  setLanguage("ar");
});

test("حماية النجوم 🛡️: سقف 9e15 بالظبط (عدد صحيح فقط وأقل من MAX_SAFE_INTEGER)", async () => {
  const { RELEASE_CLAUSE_MAX, normalizeReleaseClause } = await import(
    "../src/services/releaseClause.js"
  );
  const { normalizeClauses } = await import(
    "../src/services/contractClauses.js"
  );
  const { contractForm } = await import("../src/features/players.js");

  assert.equal(RELEASE_CLAUSE_MAX, 9_000_000_000_000_000);
  assert.ok(
    RELEASE_CLAUSE_MAX < Number.MAX_SAFE_INTEGER,
    "السقف أقل من MAX_SAFE_INTEGER",
  );

  // قيم صحيحة مقبولة حتى 9e15 بالظبط
  assert.equal(normalizeReleaseClause(0), 0);
  assert.equal(normalizeReleaseClause(1), 1);
  assert.equal(normalizeReleaseClause(9_000_000_000_000_000), 9e15);
  assert.equal(normalizeReleaseClause("9000000000000000"), 9e15);
  assert.equal(
    normalizeClauses({ releaseClause: 9_000_000_000_000_000 }).releaseClause,
    9e15,
  );

  // رفض الكسور العشرية، السالب، وما فوق 9e15 (بما في ذلك MAX_SAFE_INTEGER)
  for (const invalid of [
    -1,
    1.5,
    "100.5",
    9_000_000_000_000_001,
    Number.MAX_SAFE_INTEGER,
    Infinity,
    NaN,
    "abc",
  ]) {
    assert.throws(
      () => normalizeReleaseClause(invalid),
      /الشرط الجزائي/,
      `يجب رفض القيمة غير الصالحة: ${invalid}`,
    );
  }

  // تجديد عقد النجم بشرط 9e15 وحفظه والتحقق منه
  const s = createGame({ clubId: "ahly", database: "demo" });
  s.finance.wageBudget = 50_000_000;
  const star = s.players.find(
    (p) => p.clubId === s.clubId && p.status !== "retired",
  );
  renewPlayer(s, star.id, {
    salary: star.salary,
    bonus: 0,
    years: 4,
    role: star.role,
    releaseClause: RELEASE_CLAUSE_MAX,
  });
  assert.equal(star.contractTerms.releaseClause, RELEASE_CLAUSE_MAX);
  validateSave(s);

  const html = contractForm(s, star.id, true);
  assert.ok(
    html.includes(`max="${RELEASE_CLAUSE_MAX}"`),
    "خانة الشرط الجزائي في الواجهة تقبل حتى 9e15",
  );
});

test("حماية النجوم 🛡️: لا انتقال إلا بالشرط في كل مسارات البيع والشراء والتبادل", async () => {
  const { RELEASE_CLAUSE_MAX, breakReleaseClause } = await import(
    "../src/services/releaseClause.js"
  );
  const { createAiSaleOffer, startPlayerAuction } = await import(
    "../src/services/transferNegotiation.js"
  );
  const { answerBid } = await import("../src/services/clubManagement.js");
  const { acceptDeadlineBid } = await import(
    "../src/services/deadlineDay.js"
  );
  const { proposePlayerExchange } = await import(
    "../src/services/playerExchange.js"
  );
  const { submitOffer } = await import("../src/services/transfers.js");

  const s = createGame({ clubId: "ahly", database: "world", expanded: true });
  s.date = "2026-09-24";
  s.finance.initialCash += 500_000_000 - s.finance.cash;
  s.finance.cash = 500_000_000;
  s.finance.wageBudget = 100_000_000;
  const ownPlayers = s.players.filter(
    (p) => p.clubId === s.clubId && p.status !== "retired" && !p.loan,
  );
  const star = ownPlayers[0];
  star.contractTerms.releaseClause = RELEASE_CLAUSE_MAX;

  // 1) منع عروض البيع التفاوضية والمزادات على النجم المحمي بالشرط
  assert.throws(() => createAiSaleOffer(s, star.id), /شرط جزائي/);
  assert.throws(() => startPlayerAuction(s, star.id), /شرط جزائي/);

  // 2) منع بيع النجم عبر عروض الإدارة بأقل من الشرط
  const buyer = "zamalek";
  s.management.outgoing.push({
    id: "bid-test",
    playerId: star.id,
    buyer,
    fee: 20_000_000,
    expires: addDays(s.date, 5),
    status: "open",
  });
  assert.throws(() => answerBid(s, "bid-test", true), /شرط جزائي/);
  assert.equal(star.clubId, s.clubId);

  // 3) منع إدراج النجم المحمي في صفقات التبادل
  const oppPlayer = s.players.find(
    (p) => p.clubId === buyer && p.status !== "retired" && !p.loan,
  );
  assert.throws(
    () =>
      proposePlayerExchange(s, {
        opponentId: buyer,
        outgoingPlayerIds: [star.id],
        incomingPlayerIds: [oppPlayer.id],
        cash: 0,
      }),
    /شرط جزائي/,
  );

  // 4) منع قبول عرض يوم قفل القيد بأقل من الشرط الجزائي
  s.inbox.push({
    id: "deadline-msg-1",
    title: "عرض قفل القيد",
    body: "تفاصيل العرض",
    kind: "deadline-bid",
    ref: star.id,
    buyerId: buyer,
    buyerName: "Buyer",
    fee: 25_000_000,
    date: s.date,
    status: "open",
    required: false,
    done: false,
  });
  assert.throws(() => acceptDeadlineBid(s, "deadline-msg-1"), /شرط جزائي/);
  assert.equal(star.clubId, s.clubId);

  // 5) لاعب في السوق عليه شرط جزائي: لا يُقبل عرض أقل من الشرط، ويُقبل بكسر الشرط
  oppPlayer.clubId = "market";
  oppPlayer.contractTerms.releaseClause = 50_000_000;
  assert.throws(
    () => submitOffer(s, oppPlayer.id, { fee: 10_000_000, upfrontPercent: 100 }),
    /شرط جزائي/,
  );
  const neg = breakReleaseClause(s, oppPlayer.id);
  assert.equal(neg.fee, 50_000_000);
  assert.equal(neg.kind, "release-clause");
  validateSave(s);
});
