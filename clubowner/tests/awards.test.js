// 0.42 — اختبارات نظام الجوائز: الاختيار العادل، الحفل، القاعة عبر المواسم،
// خطاف العقود (المعنويات)، التصويت الجماهيري (السوشيال)، وجوائز المدربين (الرواتب).
import assert from "node:assert/strict";
import test from "node:test";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import {
  ensureAwards,
  selectSeasonWinners,
  selectMonthlyWinners,
  awardsMonthTick,
  awardsDay,
  runSeasonAwards,
  pendingCeremony,
  markCeremonySeen,
  hallFor,
  openFanVoteIfNeeded,
  campaignFanVote,
  spawnAwardDemand,
  resolveAwardDemand,
  spawnCoachDemand,
  resolveCoachDemand,
  normalizeCountry,
  slotOf,
} from "../src/services/awards.js";
import { AWARD_DEFS } from "../src/data/awardsTexts.js";
import { seasonDay } from "../src/services/season.js";

const game = () => createGame({ database: "demo", leagues: ["eg"] });
const own = (s) => s.players.filter((p) => p.clubId === s.clubId);

function hotSquad(s, goals = 12) {
  own(s).forEach((p, i) => {
    p.seasonGoals = goals + (i === 0 ? 6 : -(i % 5));
    p.seasonAssists = (i % 6) + 1;
    p.seasonMinutes = 900 + i * 30;
    p.seasonRatingSum = 7.4 * (18 + i);
    p.seasonRatingCount = 18 + i;
    p.seasonCleanSheets = p.position === "GK" ? 12 : i % 4;
    p.morale = 70;
  });
}

function coachFixture(s) {
  s.management = {
    coach: {
      id: "coach-own",
      name: "المدرب الوطني",
      style: "ضغط عالٍ",
      skill: 82,
      confidence: 70,
      salary: 210000,
      contractEnd: "2028-06-30",
    },
  };
}

// ————— الاختيار العادل —————
test("اختيار الموسم حتمي ويعترف بفئات العمر والجنسية والمركز", () => {
  const s = game();
  hotSquad(s);
  const [captain] = own(s);
  captain.rating = 94;
  captain.nationality = "السعودي";
  captain.age = 27;
  // مرشح أفريقي شاب ومميز ومرشح أفريقي تحت 23.
  const a1 = s.players[1];
  a1.nationality = "Moroccan";
  a1.age = 20;
  a1.rating = 91;
  a1.potential = 95;
  const a2 = s.players[2];
  a2.nationality = "السنغال";
  a2.age = 22;
  a2.rating = 90;

  const first = selectSeasonWinners(s);
  const second = selectSeasonWinners(s);
  assert.deepEqual(first, second, "نفس الحفظة = نفس الفائزين دائمًا");

  assert.equal(first["best-player"].id, captain.id, "الأفضل عالميًا يُختار بالأداء المركب");
  assert.ok(first["best-u21"].score >= 0);
  const u21 = s.players.find((p) => p.id === first["best-u21"].id);
  assert.ok(u21.age <= 21, "U21 لا يُمنح إلا للاعب 21 أو أصغر");
  assert.equal(first["best-african"].id, a1.id, "الأفضل أفريقيًا يُختار من الأفارقة فقط");
  const u23 = s.players.find((p) => p.id === first["best-u23-african"].id);
  assert.ok(u23.age <= 23, "U23 أفريقي يُقيد بالعمر");
  assert.ok(["Moroccan", "السنغال"].includes(u23.nationality), "U23 أفريقي لاعب أفريقي");
  const arab = s.players.find((p) => p.id === first["best-arab"].id);
  assert.equal(normalizeCountry(arab.nationality), "sa", "الأفضل عربيًا يُقيد بالجنسية العربية");
  const inAfrica = s.players.find((p) => p.id === first["best-in-africa"].id);
  assert.ok(inAfrica, "الأفضل داخل أفريقيا لا يُترك شاغرًا في قاعدة مصرية");
  const gk = s.players.find((p) => p.id === first["golden-glove"].id);
  assert.equal(slotOf(gk.position), "gk", "القفاز الذهبي للحراس فقط");
  assert.equal(first["top-scorer-season"].id, captain.id, "هداف الموسم صاحب أكبر رصيد أهداف");

  // تشكيلة الموسم: 11 فريدًا وتوزيع 1-4-3-3.
  const team = first["team-of-season"];
  assert.equal(team.length, 11);
  assert.equal(new Set(team.map((t) => t.id)).size, 11);
  const slots = team.map((t) => t.slot).sort().join(",");
  assert.equal(slots, "att,att,att,def,def,def,def,gk,mid,mid,mid");

  // هداف المسابقات: سجل لكل نطاق متاح على الأقل للدوري.
  assert.ok(Array.isArray(first["top-scorer-competition"]));
  assert.ok(first["top-scorer-competition"].some((r) => r.scope === "league"));
  assert.equal(AWARD_DEFS["top-scorer-competition"].cadence, "season");
});

test("الاختيار يحترم سقف الأندية في التشكيلة متى سمحت القائمة", () => {
  const s = game();
  // بناء قائمة غنية: 12 لاعبًا لكل نادٍ من أربعة أندية (سقف 3 يحتمل 11).
  const pool = [];
  const clubs = [s.clubId, "zamalek", "ceramica", "ismaily"];
  const positions = ["GK", "CB", "CB", "LB", "RB", "CM", "DM", "AM", "LW", "RW", "ST", "ST"];
  let n = 0;
  for (const clubId of clubs)
    for (const position of positions)
      pool.push({
        id: `pool-${n}`,
        name: `مرشح ${n++}`,
        clubId,
        league: "eg",
        position,
        age: 24 + (n % 6),
        rating: 70 + (n % 12),
        potential: 80,
        nationality: "مصري",
        status: "active",
        form: 0,
        careerHistory: [],
      });
  s.players = pool;
  const team = selectSeasonWinners(s)["team-of-season"];
  assert.equal(team.length, 11);
  const perClub = {};
  for (const t of team) perClub[t.clubId] = (perClub[t.clubId] || 0) + 1;
  for (const [, count] of Object.entries(perClub))
    assert.ok(count <= 3, "لا يتجاوز التشكيلة ثلاثة من نادٍ واحد");
});

test("جوائز بلا مرشحين مؤهلين تُسجل شاغرة ولا تُخترع أسماء", () => {
  const s = game();
  for (const p of s.players) p.nationality = "ياباني";
  const winners = selectSeasonWinners(s);
  assert.equal(winners["best-african"], null);
  assert.equal(winners["best-u23-african"], null);
  assert.equal(winners["best-arab"], null);
});

// ————— الحفل وقاعة المشاهير —————
test("نهاية الموسم تُقيم الحفل وتسجل الفائزين في القاعة ثم تُصفّر الإحصاءات", () => {
  const s = game();
  hotSquad(s, 15);
  s.date = s.nextSeasonDate;
  for (const f of s.fixtures) {
    f.played = true;
    f.homeGoals = 2;
    f.awayGoals = 1;
  }
  seasonDay(s);

  assert.equal(s.awards.hall.length, 1);
  const entry = s.awards.hall[0];
  assert.equal(entry.season, 1);
  assert.ok(entry.awards["best-player"], "الحفل يعلن الأفضل عالميًا");
  assert.ok(entry.awards["team-of-season"]?.length, "الحفل يعلن تشكيلة الموسم");
  assert.ok(pendingCeremony(s), "الحفل ينتظر العرض");
  assert.ok(s.awards.ceremony.steps.length >= 12, "خطوات الحفل تغطي الجوائز الموسمية");
  assert.ok(
    s.inbox.some((m) => m.kind === "ceremony"),
    "إشعار الحفل يصل للبريد",
  );
  assert.equal(own(s).every((p) => p.seasonGoals === 0), true, "الإحصاءات تُصفّر بعد الأرشفة");
  assert.equal(markCeremonySeen(s), true);
  assert.equal(pendingCeremony(s), null);
  assert.equal(validateSave(s), s);
});

test("القاعة تراكم الفائزين عبر المواسم وتبقى محفوظة في الحفظة", () => {
  const s = game();
  for (let season = 0; season < 2; season++) {
    hotSquad(s, 10 + season);
    s.date = s.nextSeasonDate;
    for (const f of s.fixtures) {
      f.played = true;
      f.homeGoals = 3;
      f.awayGoals = 0;
    }
    seasonDay(s);
    markCeremonySeen(s);
  }
  assert.equal(s.awards.hall.length, 2);
  assert.deepEqual(
    s.awards.hall.map((h) => h.season),
    [2, 1],
  );
  assert.ok(hallFor(s, 1).awards["best-player"]);
  assert.ok(hallFor(s, 2).awards["best-player"]);
  assert.equal(validateSave(s), s);
});

test("تشغيل الحفل مرتين لنفس الموسم لا يكرر السجل", () => {
  const s = game();
  hotSquad(s);
  const first = runSeasonAwards(s);
  const second = runSeasonAwards(s);
  assert.ok(first);
  assert.equal(second, null);
  assert.equal(s.awards.hall.length, 1);
});

test("ترحيل الحفظات القديمة يهيئ الجوائز بلا كسر ويبقى آمنًا وحتميًا", () => {
  const old = game();
  old.version = 37;
  delete old.awards;
  const cash = old.finance.cash;
  const migrated = migrateSave(old);
  assert.equal(old.version, 37, "الترحيل لا يمس المدخل");
  assert.equal(migrated.version, SAVE_VERSION);
  assert.deepEqual(migrated.awards.hall, []);
  assert.equal(migrated.finance.cash, cash, "الترحيل لا يمس المال");
  assert.equal(migrateSave(migrated), migrated, "الترحيل لا يعيد المعالجة");
  assert.equal(validateSave(migrated), migrated);

  // قاعة موجودة قبل ترقية إضافية تبقى كما هي.
  migrated.awards.hall.push({ season: 1, date: migrated.date, awards: { "best-player": null } });
  const again = migrateSave({ ...migrated });
  assert.equal(again.awards.hall.length, 1);
});

// ————— خطاف العقود: الفائز يطلب تحسين عقد (المعنويات + العقود) —————
test("فوز لاعب من ناديك يولّد مطلب عقدًا — القبول يرفع الراتب والرفض يخفض المعنويات", () => {
  const s = game();
  hotSquad(s);
  runSeasonAwards(s);
  const demand = s.inbox.find((m) => m.kind === "award-demand");
  assert.ok(demand, "الفائز يطلب مراجعة عقده");
  assert.equal(demand.required, true);
  assert.ok(demand.deadline > s.date);
  const p = s.players.find((x) => x.id === demand.ref);

  const salary = p.salary;
  const morale = p.morale;
  resolveAwardDemand(s, demand.id, "raise");
  assert.ok(p.salary > salary, "القبول يرفع الراتب");
  assert.ok(p.morale >= morale, "القبول يرفع المعنويات");
  assert.equal(demand.status, "resolved");

  // مطلب ثانٍ للاعب آخر: تحسين محدود ثم رفض.
  const second = s.inbox.find((m) => m.kind === "award-demand" && m.status === "open");
  assert.ok(second);
  const p2 = s.players.find((x) => x.id === second.ref);
  const salary2 = p2.salary;
  resolveAwardDemand(s, second.id, "improve");
  assert.ok(p2.salary > salary2 && p2.salary < salary2 * 1.15, "التحسين المحدود أصغر من الزيادة الكاملة");

  const third = s.inbox.find((m) => m.kind === "award-demand" && m.status === "open");
  if (third) {
    const p3 = s.players.find((x) => x.id === third.ref);
    const morale3 = p3.morale;
    resolveAwardDemand(s, third.id, "refuse");
    assert.ok(p3.morale < morale3, "الرفض يخفض المعنويات");
  }
});

test("ميزانية المرتبات تمنع الزيادة، وكل لاعب يطالب مرة واحدة في الموسم", () => {
  const s = game();
  hotSquad(s);
  const p = own(s)[1];
  const message = spawnAwardDemand(
    s,
    { own: true, clubId: s.clubId, id: p.id },
    "best-player",
  );
  assert.ok(message);
  assert.equal(
    spawnAwardDemand(s, { own: true, clubId: s.clubId, id: p.id }, "fan-best"),
    null,
    "لا طلب مكرر لنفس اللاعب في الموسم نفسه",
  );
  s.finance.wageBudget = 1;
  assert.throws(
    () => resolveAwardDemand(s, message.id, "raise"),
    /ميزانية المرتبات/,
    "الزيادة تُرفض تدريجيًا حين لا تتسع ميزانية الرواتب",
  );
});

// ————— التصويت الجماهيري (سوشيال/جماهير) —————
test("الاستفتاء يفتح قرب نهاية الموسم والحملة ترفع التفاعل وتحسم الأصوات", () => {
  const s = game();
  hotSquad(s, 9);
  s.date = "2027-06-15";
  s.nextSeasonDate = "2027-07-01";
  const vote = openFanVoteIfNeeded(s);
  assert.ok(vote, "الاستفتاء يقبل عند اقتراب نهاية الموسم");
  assert.ok(vote.candidates.length >= 3);
  assert.ok(
    vote.candidates.some((c) => c.own),
    "ناديك له مرشح في الاستفتاء",
  );

  const cash = s.finance.cash;
  const followers = s.staffCorp.social.followers;
  const engagement = s.staffCorp.social.engagement;
  campaignFanVote(s);
  assert.ok(s.finance.cash < cash, "الحملة تُصرف من الخزينة");
  assert.ok(s.staffCorp.social.followers > followers, "الحملة ترفع متابعي السوشيال");
  assert.ok(s.staffCorp.social.engagement > engagement, "الحملة ترفع التفاعل");
  assert.throws(() => campaignFanVote(s), /بالفعل/, "لا حملتان في الموسم نفسه");

  const fanBefore = s.fanSupport;
  const record = runSeasonAwards(s);
  assert.ok(record.awards["fan-best"], "الفائز بالتصويت يُسجل ضمن جوائز الموسم");
  const winner = record.awards["fan-best"];
  assert.ok(winner.votes > 0, "الأصوات محسوبة");
  if (winner.own) assert.ok(s.fanSupport > fanBefore, "فوز مرشحك يزيد حب الجماهير");
  assert.equal(s.awards.fanVote, null, "الاستفتاء يُغلق مع الحفل");
});

// ————— جوائز المدربين (إدارة/رواتب) —————
test("فوز المدرب يولّد مطلب راتب — القبول يرفع الراتب والرفض يخفض الثقة", () => {
  const s = game();
  coachFixture(s);
  const coach = s.management.coach;
  const message = spawnCoachDemand(
    s,
    { own: true, id: coach.id },
    "coach-of-year",
  );
  assert.ok(message);
  assert.equal(message.kind, "coach-demand");
  assert.equal(message.required, true);

  const salary = coach.salary;
  resolveCoachDemand(s, message.id, "raise");
  assert.ok(coach.salary > salary, "القبول يرفع راتب المدرب");
  assert.ok(coach.confidence > 70, "القبول يرفع الثقة");
  assert.equal(message.status, "resolved");

  const second = spawnCoachDemand(s, { own: true, id: coach.id }, "coach-of-month");
  assert.ok(second);
  const confidence = coach.confidence;
  resolveCoachDemand(s, second.id, "refuse");
  assert.ok(coach.confidence < confidence, "الرفض يخفض الثقة");
});

test("اختيار المدرب العام يعتمد النتائج ويجوز أن يفوز مدربك", () => {
  const s = game();
  coachFixture(s);
  // موسم قوي: صدارة واضحة في الجدول.
  const row = s.table.find((t) => t.clubId === s.clubId);
  row.played = 14;
  row.wins = 13;
  row.draws = 1;
  row.points = 40;
  s.management.coach.skill = 95;
  s.management.coach.confidence = 92;
  const winners = selectSeasonWinners(s);
  assert.ok(winners["coach-of-year"]);
  const names = new Set(
    (s.management.coach ? [s.management.coach.name] : []).concat([
      "كريم عز الدين",
      "Marco Bellini",
    ]),
  );
  assert.ok(names.has(winners["coach-of-year"].name), "الفائز من مدربك أو سوق المدربين الخيالي");
});

// ————— الإيقاع الشهري —————
test("بداية الشهر تعلن لاعب الشهر و مدرب الشهر وتربطهما بالخطافات", () => {
  const s = game();
  hotSquad(s, 8);
  coachFixture(s);
  s.date = "2026-08-01";
  const winners = awardsMonthTick(s);
  assert.ok(winners.player, "لاعب الشهر يُختار من الأداء الشهري");
  assert.ok(winners.coach, "مدرب الشهر يُختار");
  assert.equal(s.awards.monthly.length, 1);
  assert.equal(s.awards.monthly[0].month, "2026-08");
  // الشهر نفسه لا يُعاد إعلانه.
  assert.equal(awardsMonthTick(s), null);
  assert.equal(s.awards.monthly.length, 1);

  const monthly = selectMonthlyWinners(s);
  assert.ok(monthly.player);

  // نبض اليوم يشمل تجهيز الشهر ويقبل الاستفتاء الموسمي لاحقًا.
  s.date = "2026-08-02";
  awardsDay(s);
  assert.equal(s.awards.seasonSeen, s.seasonNumber);
  assert.equal(validateSave(s), s);
});

test("تعريف الجوائز السبع عشرة مكتمل الإيقاع", () => {
  const ids = Object.keys(AWARD_DEFS);
  assert.equal(ids.length, 17);
  const monthly = ids.filter((id) => AWARD_DEFS[id].cadence === "month").sort();
  assert.deepEqual(monthly, ["coach-of-month", "player-of-month"]);
  for (const id of ids) {
    assert.ok(AWARD_DEFS[id].name.ar && AWARD_DEFS[id].name.en && AWARD_DEFS[id].name.fr);
    assert.ok(AWARD_DEFS[id].kicker.ar && AWARD_DEFS[id].kicker.en && AWARD_DEFS[id].kicker.fr);
  }
  const s = game();
  ensureAwards(s);
  assert.equal(s.awards.version, 1);
});
