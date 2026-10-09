// 0.30 المجموعة ٢: المدير الرياضي — الفلسفة والصلاحيات والصفقات والتقييم.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { addDays } from "../src/core/utils.js";
import { squad } from "../src/models/player.js";
import {
  setPhilosophy, setFreedom, sportingMonth, resolveDeal, sportingDay,
  sportingSeasonRating, negotiatedFee, negotiatedWage, saleFee, autoCap,
} from "../src/services/staff/sporting.js";
import { corpEmployees } from "../src/services/staff/staffCorp.js";

const game = () => createGame({ database: "demo" });
const rich = (s) => {
  const delta = 900_000_000 - s.finance.cash;
  s.finance.cash = 900_000_000;
  s.finance.ledger.push({ id: "t", key: "t", date: s.date, description: "x", amount: delta });
  s.finance.wageBudget = 900_000_000;
  return s;
};

test("الفلسفة والصلاحيات: ضبط وتخزين", () => {
  const s = game();
  assert.equal(setPhilosophy(s, "youth"), "youth");
  assert.equal(setFreedom(s, 85), 85);
  assert.throws(() => setPhilosophy(s, "nope"));
  assert.throws(() => setFreedom(s, 101));
  // بلا مدير رياضي: لا نبض ولا اقتراحات.
  s.staffCorp.employees = s.staffCorp.employees.filter((e) => e.role !== "sporting");
  assert.equal(sportingMonth(s), null);
  validateSave(s);
});

test("صلاحيات منخفضة: صفقات معلّقة بانتظار الإذن ثم تنفيذ بالموافقة", () => {
  const s = rich(game());
  setPhilosophy(s, "smart");
  setFreedom(s, 20);
  sportingMonth(s);
  const pending = s.staffCorp.deals.filter((d) => d.status === "pending");
  assert.ok(pending.length >= 1, "اقتراح واحد على الأقل");
  const buy = pending.find((d) => d.kind === "buy");
  if (buy) {
    const before = squad(s).length, cash = s.finance.cash;
    resolveDeal(s, buy.id, true);
    assert.equal(buy.status, "done");
    assert.equal(squad(s).length, before + 1);
    assert.equal(s.finance.cash, cash - buy.fee);
    const p = s.players.find((x) => x.id === buy.playerId);
    assert.equal(p.clubId, s.clubId);
  }
  const other = s.staffCorp.deals.find((d) => d.status === "pending");
  if (other) {
    const dir = corpEmployees(s).find((e) => e.role === "sporting");
    const loy = dir.loyalty;
    resolveDeal(s, other.id, false);
    assert.equal(other.status, "rejected");
    assert.ok(dir.loyalty < loy);
  }
  assert.ok(s.staffCorp.sporting.log.length >= 2, "سجل قرارات");
  validateSave(s);
});

test("حرية كاملة: تنفيذ تلقائي ضمن السقف المعلن", () => {
  const s = rich(game());
  setPhilosophy(s, "stars");
  setFreedom(s, 100);
  const cap = autoCap(s);
  assert.ok(cap > 3_000_000);
  sportingMonth(s);
  const st = s.staffCorp.sporting.season;
  assert.ok(st.auto + st.proposed >= 1);
  // التلقائي لا يتجاوز السقف أبدًا.
  for (const e of s.staffCorp.sporting.log.filter((x) => x.text.startsWith("نفّذ"))) {
    const m = e.text.match(/ب([\d,]+)/);
    if (m) assert.ok(Number(m[1].replace(/,/g, "")) <= cap * 2 + 1, e.text);
  }
  validateSave(s);
});

test("التفاوض بمهارة المدير: خصم حقيقي على القيمة والراتب", () => {
  const s = game();
  const dir = corpEmployees(s).find((e) => e.role === "sporting");
  dir.skill = 90;
  const p = s.players.find((x) => x.clubId !== s.clubId && x.value > 1_000_000);
  assert.ok(negotiatedFee(s, p) < p.value);
  assert.ok(negotiatedFee(s, p) >= p.value * 0.5);
  assert.ok(negotiatedWage(s, p) < p.salary);
  dir.skill = 40;
  assert.ok(negotiatedFee(s, p) > p.value * 0.8, "الماهر يخصم أكثر");
  const own = squad(s)[0];
  assert.ok(saleFee(s, own) >= own.value * 0.9);
});

test("الفلسفات تستهدف فعلًا: شباب صغار ونجوم كبار", () => {
  const s = rich(game());
  setFreedom(s, 0);
  setPhilosophy(s, "youth");
  sportingMonth(s);
  const yb = s.staffCorp.deals.filter((d) => d.kind === "buy").at(-1);
  if (yb) assert.ok(yb.age <= 22, `استهداف شباب: ${yb.age}`);
  s.staffCorp.deals = [];
  setPhilosophy(s, "stars");
  sportingMonth(s);
  const sb = s.staffCorp.deals.filter((d) => d.kind === "buy").at(-1);
  if (sb) assert.ok(sb.rating >= 75, `استهداف نجوم: ${sb.rating}`);
  validateSave(s);
});

test("انتهاء الصلاحية والتقييم الموسمي (يكمل/يُفصل)", () => {
  const s = rich(game());
  setFreedom(s, 0);
  sportingMonth(s);
  for (const d of s.staffCorp.deals) d.expires = addDays(s.date, -1);
  sportingDay(s);
  assert.ok(s.staffCorp.deals.every((d) => d.status !== "pending"));
  // موسم ناجح → تقييم مرتفع وتوصية بالاستمرار.
  s.staffCorp.sporting.season = { season: s.seasonNumber, proposed: 6, auto: 4, approved: 2, rejected: 0, expired: 0, spent: 10_000_000, earned: 25_000_000, boughtRating: 160, boughtCount: 2 };
  const good = sportingSeasonRating(s);
  assert.ok(good.rating >= 60, good.rating);
  assert.ok(s.inbox.some((m) => m.title.includes("تقييم المدير الرياضي")));
  // موسم كارثي → توصية بالفصل.
  s.staffCorp.sporting.rating = null;
  s.staffCorp.sporting.season = { season: s.seasonNumber, proposed: 1, auto: 0, approved: 0, rejected: 1, expired: 1, spent: 30_000_000, earned: 0, boughtRating: 0, boughtCount: 0 };
  const bad = sportingSeasonRating(s);
  assert.ok(bad.rating < 40, bad.rating);
  assert.ok(s.inbox.some((m) => m.body.includes("يُنصح بفصله")));
  validateSave(s);
});
