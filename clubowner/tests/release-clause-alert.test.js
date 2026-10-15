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
