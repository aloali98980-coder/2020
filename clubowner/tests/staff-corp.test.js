// 0.30 المجموعة ١: الهيكل التنظيمي وسوق الموظفين — العقود والولاء والخطف والمقر.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { addDays } from "../src/core/utils.js";
import { advanceTime } from "../src/services/time.js";
import {
  ensureStaffCorp, corpEmployees, corpSkill, hqCap, corpPayroll,
  refreshStaffMarket, startNegotiation, negotiate, cancelNegotiation,
  fireEmployee, renewEmployee, promoteEmployee, raiseEmployee,
  makePoachOffer, respondPoach, loyaltyMonth, boardMeetingMonth, resolveMeetingRequest,
} from "../src/services/staff/staffCorp.js";
import { startHqUpgrade, hqDay } from "../src/services/staff/hq.js";
import { STAFF_ROLES, HQ_LEVELS, FAMOUS_STAFF, marketWage } from "../src/data/staffCatalog.js";
import { EVENT_CATALOG } from "../src/data/eventCatalog.js";
import { resolveClubEvent } from "../src/services/clubEvents.js";
import { staffView } from "../src/features/staff.js";
import { setLanguage } from "../src/i18n/index.js";

const game = () => createGame({ database: "demo" });
const rich = (s) => {
  const delta = 900_000_000 - s.finance.cash;
  s.finance.cash = 900_000_000;
  s.finance.ledger.push({ id: "test-topup", key: "test-topup", date: s.date, description: "رصيد اختباري", amount: delta });
  s.empire.personal = 900_000_000;
  return s;
};
// مرشح مولّد حتمي في السوق (يكمل سوق اللعبة العشوائي).
const plantCandidate = (s, role = "scout", skill = 70) => {
  const cand = {
    key: "cand-test-" + role + "-" + s.staffCorp.market.length, role, fame: "generated", fid: null,
    name: { ar: "مرشح الاختبار", en: "Test Candidate", fr: "Test Candidate" }, skill,
    wageAsk: marketWage(role, skill), yearsAsk: 2, bonusAsk: 5, clauseAsk: 0,
    expires: addDays(s.date, 30),
  };
  s.staffCorp.market.push(cand);
  return cand;
};

test("حفظة جديدة: طاقم افتراضي متوسط + مقر صغير + سوق معبأ", () => {
  assert.equal(SAVE_VERSION, 32);
  const s = game();
  const c = s.staffCorp;
  assert.ok(c && c.schema === 1);
  assert.equal(c.hq.level, 0);
  assert.equal(c.employees.length, 6);
  assert.equal(hqCap(s), 6);
  for (const e of c.employees) {
    assert.ok(STAFF_ROLES[e.role]);
    assert.ok(e.skill >= 55 && e.skill <= 70, `${e.role}:${e.skill}`);
    assert.equal(e.loyalty, 60);
    assert.ok(e.wage > 0 && e.contractEnd > s.date);
  }
  assert.ok(c.market.length >= 5 && c.market.length <= 9);
  validateSave(s);
});

test("ترحيل v25: طاقم افتراضي دون مساس باللاعبين والمالية", () => {
  const fresh = game();
  fresh.version = 25;
  delete fresh.staffCorp;
  const players = fresh.players.length, cash = fresh.finance.cash;
  const m = migrateSave(fresh);
  assert.equal(m.version, 32);
  assert.equal(m.players.length, players);
  assert.equal(m.finance.cash, cash);
  assert.equal(m.staffCorp.employees.length, 6);
  assert.equal(m.staffCorp.hq.level, 0);
  validateSave(m);
});

test("التفاوض: قبول عادل → تعيين، و٣ جولات ثم رفض", () => {
  const s = rich(game());
  // إخلاء مقعد: المقر ٦/٦ ممتلئ.
  fireEmployee(s, corpEmployees(s).find((e) => e.role === "gk").id);
  const cand = plantCandidate(s, "gk", 70);
  startNegotiation(s, cand.key);
  const r = negotiate(s, { wage: cand.wageAsk, years: cand.yearsAsk, bonus: cand.bonusAsk });
  assert.equal(r.result, "accepted");
  const hired = corpEmployees(s).find((e) => e.name.ar === cand.name.ar);
  assert.ok(hired);
  assert.equal(hired.bonusPct, cand.bonusAsk, "مكافأة العقد المتفاوض عليها محفوظة");
  assert.equal(hired.contractEnd, addDays(s.date, cand.yearsAsk * 365));
  assert.equal(s.staffCorp.negotiation, null);
  // مرشح ثانٍ بعروض بخيلة: عرض مضاد ثم رفض نهائي.
  fireEmployee(s, corpEmployees(s).find((e) => e.role === "gk").id);
  const c2 = plantCandidate(s, "scout", 65);
  startNegotiation(s, c2.key);
  assert.equal(negotiate(s, { wage: 20000, years: 1, bonus: 0 }).result, "counter");
  const mid = negotiate(s, { wage: 20000, years: 1, bonus: 0 });
  assert.ok(["counter", "rival", "rejected"].includes(mid.result));
  let last = mid.result;
  if (last !== "rejected") last = negotiate(s, { wage: 20000, years: 1, bonus: 0 }).result;
  assert.equal(last, "rejected");
  assert.ok(!s.staffCorp.market.some((m) => m.key === c2.key));
  validateSave(s);
});

test("سعة المقر تمنع التعيين بلا عقد معلّق تالف، ثم تفتح مقعدًا بعد الترقية", () => {
  const s = game();
  const cand = plantCandidate(s, "lawyer", 70);
  startNegotiation(s, cand.key);
  assert.throws(() => negotiate(s, { wage: cand.wageAsk, years: cand.yearsAsk, bonus: cand.bonusAsk }), /المقر ممتلئ/);
  assert.equal(s.staffCorp.negotiation.status, "open", "رفض السعة لا يحسم التفاوض");
  assert.equal(s.staffCorp.employees.length, hqCap(s));
  rich(s);
  const project = startHqUpgrade(s);
  cand.expires = addDays(project.end, 30);
  s.date = project.end;
  hqDay(s);
  const hired = negotiate(s, { wage: cand.wageAsk, years: cand.yearsAsk, bonus: cand.bonusAsk });
  assert.equal(hired.result, "accepted");
  assert.equal(s.staffCorp.employees.length, 7);
  assert.ok(s.staffCorp.employees.length < hqCap(s));
  validateSave(s);
});

test("الهيكل يعرض شجرة فعلية لكل وحدة مع الموظفين والشواغر", () => {
  const s = game();
  setLanguage("en");
  const html = staffView(s, "org", "en");
  setLanguage("ar");
  assert.match(html, /org-tree/);
  assert.match(html, /Executive team/);
  assert.match(html, /Sporting Director/);
  assert.match(html, /Team Doctor/);
  assert.match(html, /Vacant/);
});

test("فصل/تجديد/ترقية/زيادة بعواقب مالية وولاء", () => {
  const s = rich(game());
  const emp = corpEmployees(s)[0];
  const cash = s.finance.cash;
  renewEmployee(s, emp.id, 3, 10);
  assert.ok(emp.contractEnd > addDays(s.date, 1000));
  assert.ok(emp.loyalty > 60);
  const w0 = emp.wage;
  promoteEmployee(s, emp.id);
  assert.equal(emp.level, 2);
  assert.ok(emp.wage > w0);
  raiseEmployee(s, emp.id, 10);
  assert.ok(emp.loyalty >= 70);
  const comp = fireEmployee(s, emp.id);
  assert.equal(comp, emp.wage * 2);
  assert.equal(s.finance.cash, cash - comp);
  assert.ok(!corpEmployees(s).some((e) => e.id === emp.id));
  validateSave(s);
});

test("الخطف: زيادة/ترقية تُبقي، وترك يقبض الشرط الجزائي للمشهور", () => {
  const s = rich(game());
  const emp = corpEmployees(s).find((e) => e.role === "sporting");
  emp.fame = "famous"; emp.releaseClause = 5_000_000;
  const o1 = makePoachOffer(s, emp.id, "نادي الخطف", emp.wage * 2);
  const before = emp.wage;
  respondPoach(s, o1.id, "raise");
  assert.ok(corpEmployees(s).some((e) => e.id === emp.id));
  assert.ok(emp.wage > before && emp.loyalty > 60);
  const o2 = makePoachOffer(s, emp.id, "نادي الخطف", emp.wage * 3);
  const cash = s.finance.cash;
  respondPoach(s, o2.id, "release");
  assert.ok(!corpEmployees(s).some((e) => e.id === emp.id));
  assert.equal(s.finance.cash, cash + 5_000_000);
  validateSave(s);
});

test("الولاء الشهري يتحرك بعدالة الراتب", () => {
  const s = game();
  const fair = corpEmployees(s).find((e) => e.role === "doctor");
  const low = corpEmployees(s).find((e) => e.role === "fitness");
  fair.wage = marketWage("doctor", fair.skill) * 2;
  low.wage = Math.round(marketWage("fitness", low.skill) * 0.5);
  loyaltyMonth(s);
  assert.ok(fair.loyalty > 60);
  assert.ok(low.loyalty < 60);
});

test("اجتماع المجلس: طلبات حقيقية — اعتماد يدفع ويؤثر، ورفض يخفض الولاء", () => {
  const s = rich(game());
  s.date = "2026-10-01";
  const mt = boardMeetingMonth(s);
  assert.ok(mt.requests.length >= 3);
  assert.ok(mt.requests.every((x) => x.report?.label?.ar && x.report?.note?.en && x.authority?.fr), "كل مدير يرفع تقريرًا ويطلب تفويضًا بثلاث لغات");
  const r = mt.requests[0];
  const emp = corpEmployees(s).find((e) => e.id === r.from);
  const cash = s.finance.cash;
  resolveMeetingRequest(s, r.id, true);
  assert.equal(r.status, "approved");
  assert.equal(s.finance.cash, cash - r.amount);
  assert.ok(s.staffCorp.authorities[r.role].until > s.date, "التفويض المعتمد محدد المدة");
  assert.ok(emp.loyalty >= 60);
  const r2 = mt.requests[1];
  const e2 = corpEmployees(s).find((e) => e.id === r2.from);
  resolveMeetingRequest(s, r2.id, false);
  assert.equal(e2.loyalty, 57);
  validateSave(s);
});

test("المقر: ترقية بمستويات وسعة، والبرج مربوط بالمدينة", () => {
  const s = rich(game());
  assert.equal(HQ_LEVELS.length, 6);
  assert.equal(HQ_LEVELS[5].cap, 25);
  assert.equal(HQ_LEVELS[5].needsCity, "officeTower");
  const p0 = s.empire.personal;
  const proj = startHqUpgrade(s);
  assert.equal(proj.level, 1);
  assert.equal(s.empire.personal, p0 - HQ_LEVELS[1].cost);
  s.date = proj.end;
  assert.equal(hqDay(s), true);
  assert.equal(s.staffCorp.hq.level, 1);
  assert.equal(hqCap(s), 8);
  // قفز للبرج دون officeTower مرفوض.
  s.staffCorp.hq.level = 4;
  assert.throws(() => startHqUpgrade(s));
  s.sportsCity.facilities.push("officeTower");
  const tower = startHqUpgrade(s);
  assert.equal(tower.level, 5);
  validateSave(s);
});

test("تكامل: ٦٠ يومًا تُنضج السوق والاجتماع والرواتب دون كسر", () => {
  const s = rich(game());
  const delta = 50_000_000 - s.finance.cash;
  s.finance.cash = 50_000_000;
  s.finance.ledger.push({ id: "test-topup2", key: "test-topup2", date: s.date, description: "رصيد اختباري", amount: delta });
  const start = s.finance.ledger.length;
  let days = 0, guard = 0;
  while (days < 60 && guard++ < 120) {
    const r = advanceTime(s, 7);
    days += r.advanced || 0;
    if (r.blocked) {
      for (const m of s.inbox.filter((x) => x.required && x.status === "open")) {
        if (m.kind === "club-decision") {
          const rec = s.clubDecisions.find((e) => e.id === m.ref);
          const data = EVENT_CATALOG.find((e) => e.id === rec.type);
          resolveClubEvent(s, rec.id, data.choices.find((c) => !c.cash).id);
        } else { m.status = "resolved"; m.read = true; }
      }
    }
  }
  assert.equal(days >= 60, true, "تقدّم ٦٠ يومًا");
  assert.ok(s.finance.ledger.some((e) => e.category === "staff-wages"), "رواتب إدارية مسددة");
  assert.ok(s.finance.ledger.length > start);
  assert.ok(s.staffCorp.market.length >= 5);
  validateSave(s);
});

test("المشاهير: ١٢ اسمًا حقيقيًا فريدًا بشروط جزائية", () => {
  assert.equal(FAMOUS_STAFF.length, 12);
  assert.equal(new Set(FAMOUS_STAFF.map((f) => f.fid)).size, 12);
  for (const f of FAMOUS_STAFF)
    assert.ok(f.name.ar && f.name.en && f.skill >= 88 && f.clauseM > 0 && STAFF_ROLES[f.role]);
});
