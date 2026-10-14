// التبرعات العلنية 0.50 — الدفعة 1 من جلسة «السياسة والصلاحيات».
// تبرع لأي نادٍ بمبلغ حر: امتنان ← أصوات، وعدّاد حي وتغطية صحفية وسجل،
// بلا شبهات ولا حرارة ولا أي عقوبة، ومع ترحيل v40→v41 محايد.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  DONATION_MAX,
  DONATION_MIN,
  donationGratitude,
  donationPreview,
  donationSummary,
  donateToClub,
} from "../src/services/politics/donations.js";
import { voteScores } from "../src/services/politics/campaign.js";
import { setLanguage, translateText } from "../src/i18n/index.js";

const game = () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  s.empire.personal = 400_000_000;
  // ملف الصحافة موجود في الحفظات الموسّعة؛ نضعه هنا كما يراه اللعب الفعلي.
  s.press = {
    trust: 60,
    news: [],
    questions: [],
    promises: [],
    lastQuestion: null,
    delegate: false,
  };
  return s;
};

test("تبرع علني: ثروة أقل، امتنان أعلى، سجل وعدّاد وصحافة — بلا أي عقوبة", () => {
  const s = game();
  const clubId = s.politics.clubs.find((c) => c.clubId !== s.clubId).clubId;
  const club = s.politics.clubs.find((c) => c.clubId === clubId);
  const before = {
    personal: s.empire.personal,
    support: club.support,
    integrity: s.politics.integrity.score,
    legitimacy: s.politics.legitimacy,
    illicit: s.politics.integrity.illicitActions,
    suspicion: s.blackFiles?.suspicion ?? null,
    news: s.press.news.length,
  };
  const entry = donateToClub(s, clubId, 10_000_000);
  assert.equal(s.empire.personal, before.personal - 10_000_000);
  assert(entry.gratitude > 0);
  assert.equal(
    club.support,
    Math.round((before.support + entry.gratitude) * 10) / 10,
  );
  assert.equal(entry.supportAfter, club.support);
  const d = s.politics.donations;
  assert.equal(d.total, 10_000_000);
  assert.equal(d.count, 1);
  assert.equal(d.gratitude, entry.gratitude);
  assert.equal(d.log[0].id, entry.id);
  assert.equal(d.clubs[clubId].amount, 10_000_000);
  assert.equal(d.press.length, 1, "التغطية الصحفية تُسجل في سجل التبرعات");
  assert.equal(s.press.news[0].title, "تبرع علني لنادٍ في الدوري");
  assert.equal(s.press.news[0].type, "سياسة");
  assert.equal(s.press.news.length, before.news + 1);
  // إضافة بحتة: لا شبهات ولا حرارة ولا نزاهة ولا شرعية ولا عقوبة.
  assert.equal(s.politics.integrity.score, before.integrity);
  assert.equal(s.politics.integrity.illicitActions, before.illicit);
  assert.equal(s.politics.legitimacy, before.legitimacy);
  assert.equal(s.blackFiles?.suspicion ?? null, before.suspicion);
  validateSave(s);
});

test("العدّاد الحي يجمع كل الأندية، والامتنان يتراجع كلما ارتفع التأييد", () => {
  const s = game();
  const [first, second] = s.politics.clubs;
  assert.equal(donationSummary(s).total, 0);
  donateToClub(s, first.clubId, 1_000_000);
  donateToClub(s, second.clubId, 25_000_000);
  const summary = donationSummary(s);
  assert.equal(summary.count, 2);
  assert.equal(summary.total, 26_000_000);
  assert.equal(summary.clubs, 2);
  assert.equal(summary.largest, 25_000_000);
  assert.equal(summary.gratitude, s.politics.donations.gratitude);
  assert.equal(summary.press, 2);
  assert.equal(summary.last.clubId, second.clubId);
  assert.equal(summary.available, s.empire.personal);
  assert(donationGratitude(10_000_000, 50) > donationGratitude(10_000_000, 90));
  assert(donationGratitude(25_000_000, 50) > donationGratitude(1_000_000, 50));
  validateSave(s);
});

test("التأييد لا يتجاوز 100 والامتنان الزائد يظهر في المعاينة", () => {
  const s = game();
  const club = s.politics.clubs[1];
  club.support = 98;
  const preview = donationPreview(s, club.clubId, 100_000_000);
  assert.equal(preview.capped, true);
  assert.equal(preview.supportAfter, 100);
  donateToClub(s, club.clubId, 100_000_000);
  assert.equal(club.support, 100);
  validateSave(s);
});

test("مبالغ غير صالحة تُرفض قبل أي خصم أو تسجيل", () => {
  const s = game();
  const clubId = s.politics.clubs[1].clubId;
  const before = s.empire.personal;
  assert.throws(() => donateToClub(s, clubId, DONATION_MIN - 1), /أقل تبرع/);
  assert.throws(
    () => donateToClub(s, clubId, DONATION_MAX + 50_000),
    /أعلى تبرع/,
  );
  assert.throws(() => donateToClub(s, clubId, 1500.5), /أقل تبرع/);
  assert.throws(() => donateToClub(s, "no-such-club", 1_000_000), /غير موجود/);
  assert.equal(s.empire.personal, before);
  assert.equal(s.politics.donations.count, 0);
  assert.equal(s.politics.donations.total, 0);
  assert.equal(s.press.news.length, 0);
  validateSave(s);
});

test("الثروة الشخصية هي سقف التبرع الوحيد المعلن", () => {
  const s = game();
  s.empire.personal = 300_000;
  assert.throws(
    () => donateToClub(s, s.politics.clubs[1].clubId, 500_000),
    /لا تكفي/,
  );
  assert.equal(s.politics.donations.count, 0);
  donateToClub(s, s.politics.clubs[1].clubId, 300_000);
  assert.equal(s.empire.personal, 0);
  assert.equal(donationSummary(s).available, 0);
  validateSave(s);
});

test("الامتنان يظهر في الأصوات: نتيجة النادي للمالك ترتفع بعد التبرع", () => {
  const s = game();
  const club = s.politics.clubs.find((row) => row.clubId !== s.clubId);
  const scoreOf = () =>
    voteScores(s, club.clubId).find((row) => row.candidateId === "player")
      .score;
  const before = scoreOf();
  donateToClub(s, club.clubId, 20_000_000);
  assert(scoreOf() > before, "الامتنان يجب أن يرفع نتيجة المالك في الاقتراع");
  validateSave(s);
});

test("عبارة التبرع في ملف الصحافة مترجمة إلى الإنجليزية والفرنسية", () => {
  for (const lang of ["en", "fr"]) {
    setLanguage(lang);
    const title = translateText("تبرع علني لنادٍ في الدوري");
    assert(!/[\u0600-\u06FF]/.test(title), `${lang}: ${title}`);
    assert(!/[\u0600-\u06FF]/.test(translateText("سياسة")));
  }
  setLanguage("ar");
});

test("الترحيل v40→v41: سجل تبرعات فارغ بلا خصم ولا تغيير في أي مؤشر", () => {
  const s = game();
  assert.equal(SAVE_VERSION, 41);
  const snapshot = JSON.stringify({
    cash: s.finance.cash,
    personal: s.empire.personal,
    players: s.players.length,
    support: s.politics.clubs.map((club) => club.support),
  });
  delete s.politics.donations;
  s.version = 40;
  const migrated = migrateSave(s);
  assert.equal(s.version, 40, "الترحيل لا يغيّر الحفظة الأصلية");
  assert.equal(migrated.version, 41);
  assert.deepEqual(migrated.politics.donations, {
    total: 0,
    count: 0,
    gratitude: 0,
    clubs: {},
    log: [],
    press: [],
  });
  assert.equal(
    JSON.stringify({
      cash: migrated.finance.cash,
      personal: migrated.empire.personal,
      players: migrated.players.length,
      support: migrated.politics.clubs.map((club) => club.support),
    }),
    snapshot,
  );
  assert.ok(migrated.migrationNote.includes("التبرعات"));
  validateSave(migrated);
  assert.strictEqual(migrateSave(migrated), migrated);
});

test("حفظة قديمة بتبرعات محفوظة تُرحّل كما هي وتُتحقق", () => {
  const s = game();
  donateToClub(s, s.politics.clubs[1].clubId, 2_000_000);
  validateSave(s);
  const reloaded = migrateSave(structuredClone(s));
  assert.equal(reloaded.politics.donations.total, 2_000_000);
  assert.equal(reloaded.politics.donations.log.length, 1);
  assert.equal(reloaded.politics.donations.press.length, 1);
  validateSave(reloaded);
});
