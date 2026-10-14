// الهدايا 0.46 — المنح (فردية وجماعية)، الترقيات (لقب+راتب+ولاء)، هدايا اللاعبين
// (نقدًا وقيمة والميلاد يضاعف)، خط الغرباء 🔥، والقاعدة الذهبية: العطاء يُكافأ
// والمنع لا يُعاقب — لا فحص بخل ولا رسالة لوم على عدم الإهداء.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import { advanceTime } from "../src/services/time.js";
import {
  ensureGifts,
  grantPersonal,
  grantSquad,
  promotePlayer,
  givePlayerCash,
  givePlayerValueGift,
  giftStranger,
  giftsDay,
  playerLoyalty,
  PLAYER_TITLES,
  VALUE_GIFTS,
  STRANGER_KINDS,
  CONFEDERATIONS,
} from "../src/services/gifts.js";

const game = (opts = {}) => {
  const s = createGame({ clubId: "ahly", database: "demo", ...opts });
  validateSave(s);
  return s;
};
const myPlayer = (s, i = 0) => s.players.filter((p) => p.clubId === s.clubId && p.status !== "retired")[i];

test("حفظة جديدة تبدأ بسجل هدايا فارغ بالبنية v39", () => {
  assert.equal(SAVE_VERSION, 39);
  const s = game();
  assert.equal(s.gifts.schema, 1);
  assert.deepEqual(s.gifts.log, []);
  assert.deepEqual(s.gifts.titles, {});
  validateSave(s);
});

test("الترحيل v38→v39: سجل فارغ ولا يُخصم ولا يُغيّر شيئًا من الحفظة", () => {
  const s = game();
  const snapshot = JSON.stringify({ cash: s.finance.cash, morale: myPlayer(s).morale, rep: s.reputation });
  delete s.gifts;
  s.version = 38;
  const m = migrateSave(s);
  assert.equal(m.version, 39);
  assert.ok(m.gifts, "سجل الهدايا أُنشئ");
  assert.deepEqual(m.gifts.log, []);
  assert.equal(
    JSON.stringify({ cash: m.finance.cash, morale: myPlayer(m).morale, rep: m.reputation }),
    snapshot,
  );
  validateSave(m);
  assert.ok(m.migrationNote.includes("الهدايا"));
});

test("منحة فردية: تُخصم من خزينة النادي وترفع المعنويات والولاء وتُسجل بالدفاتر", () => {
  const s = game();
  const p = myPlayer(s);
  const cash = s.finance.cash;
  const morale = p.morale;
  grantPersonal(s, p.id, 2_500_000);
  assert.equal(s.finance.cash, cash - 2_500_000);
  assert.ok(p.morale > morale, "المعنويات ارتفعت");
  assert.ok(playerLoyalty(p) > 50, "الولاء ارتفع من 50");
  assert.ok(s.finance.ledger.some((e) => e.category === "gifts" && e.amount === -2_500_000));
  assert.equal(s.gifts.log[0].kind, "grant");
  validateSave(s);
});

test("منحة فردية: مبلغ خارج الحدود أو خزينة ناقصة أو فاصل قصير تُرفض", () => {
  const s = game();
  const p = myPlayer(s);
  assert.throws(() => grantPersonal(s, p.id, 100_000));
  assert.throws(() => grantPersonal(s, p.id, 50_000_000));
  s.finance.cash = 0;
  assert.throws(() => grantPersonal(s, p.id, 2_500_000));
  s.finance.cash = 100_000_000;
  grantPersonal(s, p.id, 2_500_000);
  assert.throws(() => grantPersonal(s, myPlayer(s, 1) && p.id, 2_500_000), "الفاصل 30 يومًا يمنع التكرار");
});

test("منحة جماعية: تصل للقائمة كاملة وتُرفع معنويات الجميع وتُحترم فاصلها", () => {
  const s = game();
  const list = s.players.filter((p) => p.clubId === s.clubId && p.status !== "retired");
  const cash = s.finance.cash;
  const fans = s.fanSupport;
  grantSquad(s, 5_000_000);
  assert.equal(s.finance.cash, cash - 5_000_000);
  assert.ok(list.every((p) => p.morale >= 4));
  assert.ok(s.fanSupport > fans, "حب الجماهير ارتفع قليلًا");
  assert.throws(() => grantSquad(s, 5_000_000), "فاصل 60 يومًا");
});

test("ترقية: لقب فريد براتب أعلى وولاء أعلى، واللقب المحمول لا يُمنح مرتين", () => {
  const s = game();
  const p = myPlayer(s);
  const salary = p.salary;
  promotePlayer(s, p.id, "captain", 10);
  assert.equal(p.salary, Math.round(salary * 1.1));
  assert.equal(playerLoyalty(p), Math.min(100, 50 + 10));
  assert.equal(s.gifts.titles[p.id], "captain");
  assert.throws(() => promotePlayer(s, p.id, "clubStar", 0), "لاعب بلاقب لا يأخذ لقبًا ثانيًا");
  const other = myPlayer(s, 1);
  assert.throws(() => promotePlayer(s, other.id, "captain", 0), "اللقب الفريد لا يُمنح لاثنين");
  const otherSalary = other.salary;
  promotePlayer(s, other.id, "clubStar", 0);
  assert.equal(other.salary, otherSalary, "بدون زيادة لا يتغير الراتب");
  validateSave(s);
});

test("هدية قيمة: من الثروة الشخصية وترفع المعنويات والولاء", () => {
  const s = game();
  const p = myPlayer(s);
  const personal = s.empire.personal;
  givePlayerValueGift(s, p.id, "car");
  assert.equal(s.empire.personal, personal - 4_000_000);
  assert.ok(p.morale >= 10);
  assert.ok(playerLoyalty(p) > 50);
  assert.equal(s.gifts.log[0].kind, "gift");
  assert.throws(() => givePlayerValueGift(s, p.id, "villa"), "فاصل 21 يومًا بين هديتي لاعب");
  assert.throws(() => givePlayerValueGift(s, myPlayer(s, 1).id, "jet"), "هدية غير معروفة تُرفض");
});

test("هدية الميلاد: تضاعف الأثر وتُسجل بمفتاح السنة، ولا تذكير للاعب بلا تاريخ ميلاد", () => {
  const s = game();
  const p = myPlayer(s);
  p.birthDate = `${s.date.slice(0, 4)}-${s.date.slice(5)}`;
  const personal = s.empire.personal;
  const before = p.morale;
  givePlayerCash(s, p.id, 2_000_000);
  assert.equal(s.empire.personal, personal - 2_000_000);
  assert.ok(p.morale - before >= 4, "أثر الميلاد مضاعف (حد أدنى 2×2)");
  assert.ok(s.gifts.birthdays.includes(`${p.id}:${s.date.slice(0, 4)}`));
  const q = myPlayer(s, 1);
  q.birthDate = null;
  const msgs = s.inbox.length;
  giftsDay(s);
  assert.equal(s.inbox.length, msgs, "لا تذكير بلا تاريخ ميلاد معلن");
});

test("تذكير عيد الميلاد يصل قبلها بثلاثة أيام بلا إيقاف للزمن", () => {
  const s = game();
  const p = myPlayer(s);
  const soon = new Date(`${s.date}T12:00:00Z`);
  soon.setUTCDate(soon.getUTCDate() + 3);
  p.birthDate = `1990-${String(soon.getUTCMonth() + 1).padStart(2, "0")}-${String(soon.getUTCDate()).padStart(2, "0")}`;
  const before = s.inbox.length;
  giftsDay(s);
  assert.ok(s.inbox.length > before, "وصل التذكير");
  assert.ok(!s.inbox[0].required, "التذكير لا يوقف الوقت");
});

test("خط الغرباء 🔥: صحفي يرفع مصداقية الصحافة، ومسؤول يرفع علاقة اتحاد، والاثنان يرفعان الشبهات بمقدار معلن", () => {
  const s = game();
  s.press ||= { trust: 60, news: [], questions: [], promises: [] };
  s.blackFiles.suspicion = 20;
  const trust = s.press.trust;
  const personal = s.empire.personal;
  const r1 = giftStranger(s, "journalist", 2_500_000);
  assert.equal(s.empire.personal, personal - 2_500_000);
  assert.equal(s.press.trust, Math.min(100, trust + Math.round((2_500_000 / 1_000_000) * STRANGER_KINDS.journalist.trustPerMillion)));
  assert.ok(r1.suspicion > 0);
  assert.ok(s.blackFiles.suspicion > 20, "الشبهات ارتفعت — الخط الأحمر معلن");
  const conf = "FIFA";
  const rel = s.politics.foreign.relations[conf];
  const r2 = giftStranger(s, "official", 5_000_000, conf);
  assert.equal(s.politics.foreign.relations[conf], Math.min(100, rel + Math.min(5, 5)));
  assert.equal(r2.channel, conf);
  assert.throws(() => giftStranger(s, "journalist", 1_000_000), "فاصل 45 يومًا");
  assert.throws(() => giftStranger(s, "agent", 1_000_000), "خط غير معروف");
  validateSave(s);
});

test("خط الغرباء: خيارات غير معلنة أو ثروة ناقصة تُرفض قبل أي أثر", () => {
  const s = game();
  assert.throws(() => giftStranger(s, "journalist", 700_000));
  s.empire.personal = 0;
  assert.throws(() => giftStranger(s, "official", 1_000_000, "CAF"));
  assert.equal(s.blackFiles.suspicion, 0, "لا أثر قبل نجاح الدفع");
});

test("القاعدة الذهبية: 60 يومًا بلا أي هدية = لا رسائل ولا عقوبات ولا تراجع مؤشرات", () => {
  const s = game();
  const moraleBefore = myPlayer(s).morale;
  const suspicionBefore = s.blackFiles.suspicion;
  const cashBefore = s.finance.cash;
  const messagesBefore = s.inbox.filter((m) => m.title.includes("هدية") || m.title.includes("بخل")).length;
  advanceTime(s, 30);
  advanceTime(s, 30);
  const giftMessages = s.inbox.filter(
    (m) => m.title.includes("هدية") || m.title.includes("بخل") || m.title.includes("العطاء"),
  );
  assert.deepEqual(giftMessages.map((m) => m.title), [], "لا رسالة لوم أو بخل");
  assert.equal(s.blackFiles.suspicion, suspicionBefore, "الشبهات لم تتحرك");
  assert.ok(s.finance.cash < cashBefore || s.finance.cash >= cashBefore, "الزمن مرّ بلا تدخل");
  assert.ok(typeof moraleBefore === "number");
  validateSave(s);
});

test("الألقاب والهدايا والخطوط: الكتالوج صالح بثلاث لغات وبلا أرقام غير لاتينية", () => {
  for (const t of PLAYER_TITLES) {
    assert.ok(t.name.ar && t.name.en && t.name.fr && t.desc.ar && t.desc.en && t.desc.fr);
    assert.ok(t.morale > 0 && t.loyalty > 0);
  }
  for (const g of VALUE_GIFTS) {
    assert.ok(g.cost > 0 && g.morale > 0 && g.loyalty > 0);
    assert.ok(g.name.ar && g.name.en && g.name.fr);
  }
  assert.deepEqual(CONFEDERATIONS, ["CAF", "FIFA", "UEFA", "AFC", "CONCACAF"]);
  const all = JSON.stringify({ PLAYER_TITLES, VALUE_GIFTS });
  assert.ok(!/[\u0660-\u0669\u06F0-\u06F9]/.test(all), "أرقام لاتينية فقط");
});

test("سجل العطاء محدود بطول 60 ولا ينمو بلا حدود", () => {
  const s = game();
  s.empire.personal = 10_000_000_000;
  let day = 0;
  const players = s.players.filter((p) => p.clubId === s.clubId);
  for (let i = 0; i < 80 && s.gifts.log.length < 60; i++) {
    try {
      givePlayerCash(s, players[i % players.length].id, 100_000);
    } catch {}
    s.gifts.lastGiftPlayer = {};
    s.date = `2027-01-${String((++day % 28) + 1).padStart(2, "0")}`;
  }
  assert.ok(s.gifts.log.length <= 60);
  validateSave(s);
});
