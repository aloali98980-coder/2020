// المرحلة ١٢ «الإدارة الشاملة» — الهيكل التنظيمي وسوق الموظفين والولاء والخطف.
// s.staffCorp شجرة واحدة: الموظفون + السوق + التفاوض + الخطف + اجتماع المجلس الشهري.
// النظام القديم s.staff (٣ أدوار) يبقى كما هو لتوافق الحفظات؛ الجديد مؤسسة كاملة بسعة مقر.
import { assert, clamp, addDays, daysBetween, uid } from "../../core/utils.js";
// مولد الإدارة الشاملة المستقل: لا يستهلك s.seed أبدًا، فلا يزيح عشوائية المحرك
// ولا يغيّر أي سلوك قائم (الكؤوس والمباريات تُستمد من الدفق الأصلي وحده).
export function srng(s) {
  const c = s.staffCorp || ensureStaffCorp(s);
  if (!Number.isFinite(c.rng)) c.rng = (s.seed >>> 0) || 0x9e3779b9;
  let x = c.rng | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  c.rng = x >>> 0;
  return c.rng / 4294967296;
}
import { message, closeThread } from "../inbox.js";
import { post } from "../finance.js";
import {
  STAFF_ROLES, ROLE_IDS, DIRECTOR_ROLES, marketWage, HQ_LEVELS,
  FAMOUS_STAFF, STAFF_FIRST, STAFF_LAST, POACH_CLUBS,
} from "../../data/staffCatalog.js";

export const corpOf = (s) => s.staffCorp || null;
export const corpEmployees = (s) => corpOf(s)?.employees || [];
export const corpSkill = (s, role) =>
  corpEmployees(s).reduce((m, e) => (e.role === role ? Math.max(m, e.skill) : m), 0);
export const corpEmployee = (s, id) => corpEmployees(s).find((e) => e.id === id) || null;
export const roleCount = (s, role) => corpEmployees(s).filter((e) => e.role === role).length;
export const hqCap = (s) => HQ_LEVELS[clamp(corpOf(s)?.hq?.level || 0, 0, HQ_LEVELS.length - 1)].cap;
export const roleNameAr = (role) => STAFF_ROLES[role]?.name.ar || role;

// اسم مولّد فريد داخل المؤسسة والسوق معًا.
function genName(s, serial) {
  const c = corpOf(s);
  const used = new Set([
    ...(c?.employees || []).map((e) => e.name.ar),
    ...(c?.market || []).map((m) => m.name.ar),
  ]);
  const f = STAFF_FIRST[Math.floor(srng(s) * STAFF_FIRST.length)];
  const l = STAFF_LAST[Math.floor(srng(s) * STAFF_LAST.length)];
  let ar = `${f[0]} ${l[0]}`, latin = `${f[1]} ${l[1]}`;
  if (used.has(ar)) { ar += ` ${serial}`; latin += ` ${serial}`; }
  return { ar, en: latin, fr: latin };
}

export function blankStaffCorp() {
  return {
    schema: 1,
    hq: { level: 0, project: null },
    employees: [],
    market: [],
    negotiation: null,
    poach: [],
    meeting: { month: "", requests: [] },
    sporting: { philosophy: "smart", freedom: 40, budget: 0, log: [], season: null, rating: null },
    deals: [],
    marketing: { campaigns: [], mood: {} },
    scouts: { reports: [] },
    academy: { curriculum: "technique", watchlist: [] },
    social: { followers: 0, engagement: 50, posts: [], crisis: null },
    legal: { cases: [], wins: 0, losses: 0 },
    financeOffice: { lastReport: null },
    log: [],
  };
}

// طاقم افتراضي متوسط (مهارة ≈ ٦٠) + مقر صغير: للحفظات الجديدة والمهاجرة معًا.
const DEFAULT_CREW = [
  ["sporting", 62], ["marketing", 58], ["finance", 60],
  ["doctor", 65], ["fitness", 60], ["gk", 58],
];
export function seedDefaultCrew(s) {
  const c = ensureStaffCorp(s);
  if (c.employees.length) return c;
  for (const [role, skill] of DEFAULT_CREW) {
    const wage = marketWage(role, skill);
    c.employees.push({
      id: uid(s, "emp"), role, fame: "generated", fid: null,
      name: genName(s, c.employees.length + 1),
      skill, level: 1, wage, bonusPct: 5, releaseClause: 0,
      contractEnd: addDays(s.date, 730), joined: s.date,
      loyalty: 60, lastRaise: s.date, assignment: null, history: [],
    });
  }
  c.social.followers = Math.round((s.reputation || 50) * 1200);
  refreshStaffMarket(s);
  return c;
}

export function ensureStaffCorp(s) {
  // ترحيل الحفظات الجزئية القديمة (بلا تاريخ/عداد): قيم افتراضية آمنة لا تمس الأصل.
  if (!s.date) s.date = "2026-09-24";
  if (!Number.isFinite(s.nextId)) s.nextId = 0;
  if (!s.seed) s.seed = 84721;
  if (!s.staffCorp) {
    s.staffCorp = blankStaffCorp();
    seedDefaultCrew(s);
  }
  const c = s.staffCorp;
  c.hq ||= { level: 0, project: null };
  c.employees ||= []; c.market ||= []; c.poach ||= [];
  c.meeting ||= { month: "", requests: [] };
  c.sporting ||= blankStaffCorp().sporting;
  c.deals ||= [];
  c.marketing ||= { campaigns: [], mood: {} };
  c.scouts ||= { reports: [] };
  c.academy ||= { curriculum: "technique", watchlist: [] };
  c.social ||= { followers: 0, engagement: 50, posts: [], crisis: null };
  c.legal ||= { cases: [], wins: 0, losses: 0 };
  c.financeOffice ||= { lastReport: null };
  c.log ||= [];
  return c;
}

// ── سوق الموظفين: تجديد شهري، مشهور حقيقي إن سمحت السمعة ────────────────────
const usedFamous = (s) => new Set([
  ...corpEmployees(s).map((e) => e.fid).filter(Boolean),
  ...ensureStaffCorp(s).market.map((m) => m.fid).filter(Boolean),
]);
const vacancyRoles = (s) =>
  ROLE_IDS.filter((r) => r !== "assistant" && roleCount(s, r) < STAFF_ROLES[r].slots);
export function refreshStaffMarket(s) {
  const c = ensureStaffCorp(s);
  c.market = c.market.filter((m) => m.expires > s.date);
  const used = usedFamous(s);
  const famousPool = FAMOUS_STAFF.filter((f) => !used.has(f.fid) && (s.reputation || 0) >= f.minRep);
  const target = 6;
  let guard = 0;
  while (c.market.length < target && guard++ < 30) {
    const vacs = vacancyRoles(s);
    const wantFamous = famousPool.length && (srng(s) < 0.3 || !vacs.length);
    if (wantFamous) {
      const f = famousPool.splice(Math.floor(srng(s) * famousPool.length), 1)[0];
      c.market.push({
        key: uid(s, "cand"), role: f.role, fame: "famous", fid: f.fid,
        name: { ...f.name }, skill: f.skill,
        wageAsk: Math.round(f.wageM * 1_000_000), yearsAsk: 3, bonusAsk: 10,
        clauseAsk: Math.round(f.clauseM * 1_000_000), expires: addDays(s.date, 30),
      });
      continue;
    }
    const role = vacs.length
      ? vacs[Math.floor(srng(s) * vacs.length)]
      : ROLE_IDS[Math.floor(srng(s) * ROLE_IDS.length)];
    const skill = clamp(45 + Math.floor(srng(s) * 41), 40, 95);
    c.market.push({
      key: uid(s, "cand"), role, fame: "generated", fid: null,
      name: genName(s, c.market.length + 1), skill,
      wageAsk: marketWage(role, skill), yearsAsk: 1 + Math.floor(srng(s) * 3),
      bonusAsk: 3 + Math.floor(srng(s) * 8), clauseAsk: 0,
      expires: addDays(s.date, 30),
    });
  }
  c.market = c.market.slice(0, 9);
  return c.market;
}

// ── التفاوض: ٣ جولات، عرض مضاد واحد، ومزاد علني على المشاهير ────────────────
export function startNegotiation(s, marketKey) {
  const c = ensureStaffCorp(s);
  const cand = c.market.find((m) => m.key === marketKey);
  assert(cand && cand.expires > s.date, "المرشح غير متاح.");
  assert(!c.negotiation, "أنهِ التفاوض القائم أولًا.");
  c.negotiation = {
    marketKey, round: 0, status: "open",
    offer: { wage: cand.wageAsk, years: cand.yearsAsk, bonus: cand.bonusAsk },
    rival: null, lastCounter: null,
  };
  return c.negotiation;
}
// عتبة القبول حتمية ومعلنة: سمعة ناديك تخفض المطالب، والشهرة ترفعها.
export const acceptWage = (s, cand) =>
  Math.round(cand.wageAsk * (cand.fame === "famous" ? 1 : 1 - clamp(((s.reputation || 50) - 50) / 400, -0.1, 0.12)));
export function negotiate(s, { wage, years, bonus }) {
  const c = ensureStaffCorp(s);
  const n = c.negotiation;
  assert(n?.status === "open", "لا تفاوض قائم.");
  const cand = c.market.find((m) => m.key === n.marketKey);
  assert(cand, "غادر المرشح السوق.");
  assert(Number.isSafeInteger(wage) && wage >= 20000, "راتب غير صالح.");
  assert(Number.isInteger(years) && years >= 1 && years <= 5, "مدة العقد من سنة إلى ٥.");
  assert(Number.isInteger(bonus) && bonus >= 0 && bonus <= 30, "المكافأة من ٠ إلى ٣٠٪.");
  n.round += 1;
  n.offer = { wage, years, bonus };
  // نادٍ منافس يزايد على المشهور من الجولة الثانية: مزاد مضاد علني.
  if (cand.fame === "famous" && n.round >= 2 && !n.rival && srng(s) < 0.5) {
    n.rival = {
      club: POACH_CLUBS[Math.floor(srng(s) * POACH_CLUBS.length)].ar,
      wage: Math.round(cand.wageAsk * (1.1 + srng(s) * 0.25)),
    };
    message(s, {
      title: `مزاد على ${cand.name.ar}!`,
      body: `${n.rival.club} دخل على الخط بعرض ${n.rival.wage.toLocaleString()} شهريًا. تفوّق عليه في الجولة القادمة أو انسحب.`,
      category: "club", priority: "high",
    });
    return { result: "rival", negotiation: n };
  }
  const need = Math.max(acceptWage(s, cand), n.rival ? n.rival.wage + 1 : 0);
  const yearsOk = years >= Math.max(1, cand.yearsAsk - 1);
  const bonusOk = bonus >= cand.bonusAsk - 5;
  if (wage >= need && yearsOk && bonusOk) {
    n.status = "accepted";
    hireFromMarket(s, cand.key, { wage, years, bonus });
    return { result: "accepted", negotiation: n };
  }
  if (n.round >= 3) {
    n.status = "rejected";
    c.market = c.market.filter((m) => m.key !== cand.key);
    c.negotiation = null;
    message(s, {
      title: `فشل التعاقد مع ${cand.name.ar}`,
      body: "انتهت الجولات الثلاث دون اتفاق، وغادر المرشح السوق.",
      category: "club",
    });
    return { result: "rejected", negotiation: null };
  }
  // عرض مضاد واحد: يقترب ٨٪ من عرضك إن كنت قريبًا.
  const gap = need - wage;
  const counter = gap > 0 && gap / need < 0.35
    ? Math.round(need * 0.96)
    : cand.wageAsk;
  n.lastCounter = { wage: counter, years: cand.yearsAsk, bonus: cand.bonusAsk };
  message(s, {
    title: `عرض مضاد من ${cand.name.ar}`,
    body: `يطلب ${counter.toLocaleString()} شهريًا لمدة ${cand.yearsAsk} سنوات ومكافأة ${cand.bonusAsk}٪. الجولة ${n.round + 1} من ٣.`,
    category: "club",
  });
  return { result: "counter", negotiation: n };
}
export function cancelNegotiation(s) {
  ensureStaffCorp(s).negotiation = null;
}

function hireFromMarket(s, marketKey, { wage, years, bonus }) {
  const c = ensureStaffCorp(s);
  const i = c.market.findIndex((m) => m.key === marketKey);
  assert(i >= 0, "المرشح غير متاح.");
  const cand = c.market[i];
  assert(c.employees.length < hqCap(s), `المقر ممتلئ (${hqCap(s)} موظفين). رقِّ المقر أولًا.`);
  assert(roleCount(s, cand.role) < STAFF_ROLES[cand.role].slots, "الدور مشغول؛ أنهِ عقد الحالي أولًا.");
  assert(s.finance.cash >= wage, "يلزم رصيد يغطي شهرًا واحدًا على الأقل.");
  c.market.splice(i, 1);
  c.negotiation = null;
  const emp = {
    id: uid(s, "emp"), role: cand.role, fame: cand.fame, fid: cand.fid,
    name: { ...cand.name }, skill: cand.skill, level: 1,
    wage, bonusPct: bonus, releaseClause: cand.clauseAsk || 0,
    contractEnd: addDays(s.date, years * 365), joined: s.date,
    loyalty: cand.fame === "famous" ? 50 : 60, lastRaise: s.date,
    assignment: null, history: [{ date: s.date, text: "تعيين" }],
  };
  c.employees.push(emp);
  afterRoleFilled(s, emp);
  message(s, {
    title: `انضمام ${emp.name.ar} — ${roleNameAr(emp.role)}`,
    body: `عقد ${years} سنوات براتب شهري ${wage.toLocaleString()}.${emp.releaseClause ? ` شرط جزائي ${emp.releaseClause.toLocaleString()}.` : ""} الولاء الحالي ${emp.loyalty}٪.`,
    category: "club",
  });
  return emp;
}

// ── فصل / تجديد / ترقية / زيادة ────────────────────────────────────────────
export function fireEmployee(s, id) {
  const c = ensureStaffCorp(s);
  const i = c.employees.findIndex((e) => e.id === id);
  assert(i >= 0, "الموظف غير موجود.");
  const emp = c.employees[i];
  const months = emp.fame === "famous" ? 3 : 2;
  const compensation = emp.wage * months;
  assert(s.finance.cash >= compensation, `تعويض إنهاء العقد يساوي ${months} أشهر.`);
  post(s, -compensation, "staff-compensation", `تعويض ${emp.name.ar}`, uid(s, "dismiss"));
  c.employees.splice(i, 1);
  afterRoleVacated(s, emp);
  closeThread(s, id);
  message(s, {
    title: `رحيل ${emp.name.ar}`,
    body: `أُنهي العقد بتعويض ${compensation.toLocaleString()}. الدور الآن شاغر في الهيكل.`,
    category: "club",
  });
  return compensation;
}
export function renewEmployee(s, id, years, raisePct = 0) {
  const emp = corpEmployee(s, id);
  assert(emp, "الموظف غير موجود.");
  assert(Number.isInteger(years) && years >= 1 && years <= 5, "التمديد من سنة إلى ٥.");
  assert(raisePct >= 0 && raisePct <= 50, "الزيادة من ٠ إلى ٥٠٪.");
  const base = emp.contractEnd > s.date ? emp.contractEnd : s.date;
  emp.contractEnd = addDays(base, years * 365);
  if (raisePct > 0) {
    emp.wage = Math.round(emp.wage * (1 + raisePct / 100));
    emp.lastRaise = s.date;
  }
  emp.loyalty = clamp(emp.loyalty + 4 + Math.round(raisePct / 5), 0, 100);
  emp.history.push({ date: s.date, text: `تجديد ${years} سنوات` });
  message(s, {
    title: `تجديد عقد ${emp.name.ar}`,
    body: `حتى ${emp.contractEnd} براتب ${emp.wage.toLocaleString()}. الولاء الآن ${emp.loyalty}٪.`,
    category: "club",
  });
  return emp;
}
export function promoteEmployee(s, id) {
  const emp = corpEmployee(s, id);
  assert(emp, "الموظف غير موجود.");
  assert(emp.level < 5, "بلغ أعلى درجة وظيفية.");
  emp.level += 1;
  emp.wage = Math.round(emp.wage * 1.15);
  emp.lastRaise = s.date;
  emp.loyalty = clamp(emp.loyalty + 8, 0, 100);
  emp.history.push({ date: s.date, text: `ترقية للدرجة ${emp.level}` });
  message(s, {
    title: `ترقية ${emp.name.ar} للدرجة ${emp.level}`,
    body: `راتب جديد ${emp.wage.toLocaleString()} وولاء ${emp.loyalty}٪.`,
    category: "club",
  });
  return emp;
}
export function raiseEmployee(s, id, pct) {
  const emp = corpEmployee(s, id);
  assert(emp, "الموظف غير موجود.");
  assert(pct >= 1 && pct <= 50, "الزيادة من ١ إلى ٥٠٪.");
  emp.wage = Math.round(emp.wage * (1 + pct / 100));
  emp.lastRaise = s.date;
  emp.loyalty = clamp(emp.loyalty + 3 + Math.round(pct / 4), 0, 100);
  emp.history.push({ date: s.date, text: `زيادة ${pct}٪` });
  return emp;
}

// مدرب الفريق الأول ينعكس على s.management.coach فيعمل أثره في الملعب والتطوير فورًا.
export function afterRoleFilled(s, emp) {
  if (emp.role === "coach" && s.management) {
    s.management.coach = {
      id: "corp-" + emp.id, name: emp.name.ar, latin: emp.name.en,
      style: emp.fame === "famous" ? "مدرب عالمي" : "مدرب الفريق الأول",
      skill: emp.skill, salary: emp.wage,
      contractYears: Math.max(1, Math.round(daysBetween(s.date, emp.contractEnd) / 365)),
      contractEnd: emp.contractEnd, confidence: 70, corpId: emp.id,
    };
  }
}
export function afterRoleVacated(s, emp) {
  if (emp.role === "coach" && s.management?.coach?.corpId === emp.id) {
    s.management.coach = {
      id: "caretaker", name: "مدرب مؤقت", style: "مؤقت",
      skill: 45, salary: 50000, contractYears: 1,
      contractEnd: addDays(s.date, 180), confidence: 50, corpId: null,
    };
    message(s, {
      title: "مدرب مؤقت يقود الفريق",
      body: "رحل مدرب الفريق الأول؛ المؤقت بمهارة ٤٥ حتى تعيّن بديلًا من سوق الموظفين.",
      category: "club", priority: "high",
    });
  }
}

// ── الخطف: أندية منافسة تطارد موظفيك — زيادة / ترقية / ترك ──────────────────
export function poachTargetChance(s, emp) {
  let p = Math.max(0, emp.skill - 70) * 0.004;
  if (emp.fame === "famous") p += 0.02;
  if (emp.loyalty < 40) p += 0.03;
  if (emp.wage < marketWage(emp.role, emp.skill) * 0.9) p += 0.025;
  return p;
}
export function makePoachOffer(s, empId, clubAr = null, wage = null) {
  const c = ensureStaffCorp(s);
  const emp = corpEmployee(s, empId);
  assert(emp, "الموظف غير موجود.");
  assert(!c.poach.some((o) => o.empId === empId && o.status === "open"), "عرض خطف قائم بالفعل.");
  const club = clubAr || POACH_CLUBS[Math.floor(srng(s) * POACH_CLUBS.length)].ar;
  const offer = {
    id: uid(s, "poach"), empId, club,
    wage: wage || Math.round(emp.wage * (1.3 + srng(s) * 0.5)),
    deadline: addDays(s.date, 10), status: "open",
    clauseFee: emp.releaseClause || 0,
  };
  c.poach.push(offer);
  message(s, {
    title: `${club} يخطف ${emp.name.ar}!`,
    body: `عرض ${offer.wage.toLocaleString()} شهريًا (راتبه الحالي ${emp.wage.toLocaleString()}). لديك ١٠ أيام: زايده بزيادة، أو رقِّه، أو اتركه يرحل${offer.clauseFee ? ` وتقبض الشرط الجزائي ${offer.clauseFee.toLocaleString()}` : ""}.`,
    category: "club", priority: "high",
  });
  return offer;
}
// الرد: raise (مطابقة +١٠٪) / promote (ترقية +١٥٪) / release (رحيل + قبض الشرط الجزائي)
export function respondPoach(s, offerId, action) {
  const c = ensureStaffCorp(s);
  const o = c.poach.find((x) => x.id === offerId);
  assert(o?.status === "open", "العرض غير قائم.");
  const emp = corpEmployee(s, o.empId);
  assert(["raise", "promote", "release"].includes(action), "رد غير صالح.");
  o.status = "resolved";
  if (!emp) return o;
  if (action === "release") {
    c.employees = c.employees.filter((e) => e.id !== emp.id);
    afterRoleVacated(s, emp);
    if (o.clauseFee > 0)
      post(s, o.clauseFee, "release-clause", `شرط جزائي: ${emp.name.ar} إلى ${o.club}`, uid(s, "clause"));
    message(s, {
      title: `رحل ${emp.name.ar} إلى ${o.club}`,
      body: o.clauseFee ? `قبضت الشرط الجزائي ${o.clauseFee.toLocaleString()}.` : "رحل مجانًا؛ الدور شاغر الآن.",
      category: "club",
    });
    return o;
  }
  if (action === "promote" && emp.level < 5) promoteEmployee(s, emp.id);
  else {
    const target = Math.round(o.wage * 1.1);
    const pct = Math.max(1, Math.round(((target - emp.wage) / emp.wage) * 100));
    raiseEmployee(s, emp.id, Math.min(50, pct));
  }
  emp.loyalty = clamp(emp.loyalty + 6, 0, 100);
  message(s, {
    title: `${emp.name.ar} رفض ${o.club}`,
    body: `بقى بعد ${action === "promote" ? "الترقية" : "الزيادة"}؛ الولاء الآن ${emp.loyalty}٪.`,
    category: "club",
  });
  return o;
}
export function poachDay(s) {
  const c = corpOf(s);
  if (!c) return;
  for (const o of c.poach) {
    if (o.status !== "open" || o.deadline > s.date) continue;
    o.status = "resolved";
    const emp = corpEmployee(s, o.empId);
    if (!emp) continue;
    // التجاهل حتى الموعد: يرحل إن كان العرض مغريًا والولاء متزعزعًا.
    if (o.wage > emp.wage * 1.2 && emp.loyalty < 55) {
      c.employees = c.employees.filter((e) => e.id !== emp.id);
      afterRoleVacated(s, emp);
      if (o.clauseFee > 0)
        post(s, o.clauseFee, "release-clause", `شرط جزائي: ${emp.name.ar} إلى ${o.club}`, uid(s, "clause"));
      message(s, {
        title: `خُطف ${emp.name.ar} إلى ${o.club}!`,
        body: "تجاهلت عرض الخطف حتى انتهت المهلة، فقبل الموظف الرحيل.",
        category: "club", priority: "high",
      });
    } else {
      emp.loyalty = clamp(emp.loyalty - 5, 0, 100);
      message(s, {
        title: `${emp.name.ar} باقٍ رغم الإغراء`,
        body: `رفض عرض ${o.club} دون مقابل منك؛ الولاء انخفض إلى ${emp.loyalty}٪.`,
        category: "club",
      });
    }
  }
  c.poach = c.poach.filter((o) => o.status === "open" || daysBetween(o.deadline, s.date) < 60);
}

// ── الولاء الشهري: عداد لكل موظف يتحرك بعدالة الراتب ────────────────────────
export function loyaltyMonth(s) {
  for (const emp of corpEmployees(s)) {
    const fair = marketWage(emp.role, emp.skill);
    if (emp.wage >= fair * 0.95) emp.loyalty = clamp(emp.loyalty + 2, 0, 95);
    else emp.loyalty = clamp(emp.loyalty - 2, 5, 100);
    // سنة كاملة بلا زيادة تخفض الولاء.
    if (daysBetween(emp.lastRaise, s.date) > 365) emp.loyalty = clamp(emp.loyalty - 3, 5, 100);
  }
}

// ── اجتماع المجلس الشهري: كل مدير يعرض تقريره ويطلب — توافق / ترفض ──────────
const REQUEST_KINDS = {
  sporting: { text: "ميزانية صفقات إضافية للمدير الرياضي", amount: 8_000_000 },
  marketing: { text: "تمويل خطة التسويق الشهرية", amount: 1_500_000 },
  finance: { text: "اعتماد مراجعة مالية معمّقة", amount: 200_000 },
  lawyer: { text: "أتعاب استشارات قانونية وقائية", amount: 400_000 },
  academy: { text: "دعم برامج الناشئين", amount: 800_000 },
  social: { text: "ميزانية محتوى السوشيال ميديا", amount: 500_000 },
};
export function boardMeetingMonth(s) {
  const c = ensureStaffCorp(s);
  const month = s.date.slice(0, 7);
  if (c.meeting.month === month) return c.meeting;
  c.meeting = { month, requests: [] };
  for (const role of DIRECTOR_ROLES) {
    const emp = corpEmployees(s).find((e) => e.role === role);
    if (!emp) continue;
    const spec = REQUEST_KINDS[role];
    c.meeting.requests.push({
      id: uid(s, "req"), from: emp.id, role,
      text: spec.text, amount: spec.amount, status: "open",
    });
  }
  if (c.meeting.requests.length)
    message(s, {
      title: `اجتماع المجلس الشهري (${month})`,
      body: `${c.meeting.requests.length} طلبات على الطاولة من مديريك. وافق أو ارفض كل طلب من شاشة الإدارة الشاملة؛ الرفض يخفض ولاء صاحبه.`,
      category: "club",
    });
  return c.meeting;
}
export function resolveMeetingRequest(s, reqId, approve) {
  const c = ensureStaffCorp(s);
  const r = c.meeting.requests.find((x) => x.id === reqId);
  assert(r?.status === "open", "الطلب محسوم أو منتهٍ.");
  const emp = corpEmployee(s, r.from);
  r.status = approve ? "approved" : "rejected";
  if (!approve) {
    if (emp) emp.loyalty = clamp(emp.loyalty - 3, 0, 100);
    return r;
  }
  assert(s.finance.cash >= r.amount, "السيولة لا تكفي لاعتماد الطلب.");
  post(s, -r.amount, "board-request", r.text, uid(s, "req"));
  if (r.role === "sporting") c.sporting.budget += r.amount;
  if (r.role === "marketing")
    for (const k of Object.keys(c.marketing.mood)) c.marketing.mood[k] = clamp(c.marketing.mood[k] + 8, 0, 100);
  if (r.role === "social") c.social.followers = Math.round(c.social.followers * 1.05 + 5000);
  if (r.role === "lawyer") c.legal.retainerUntil = addDays(s.date, 30);
  if (emp) {
    emp.loyalty = clamp(emp.loyalty + 3, 0, 100);
    emp.history.push({ date: s.date, text: "اعتُمد طلبه في المجلس" });
  }
  return r;
}

// ── الرواتب الشهرية تُصرف مع التشغيل ────────────────────────────────────────
export const corpPayroll = (s) =>
  corpEmployees(s).reduce((n, e) => n + e.wage, 0);

// نبض يومي خفيف: انتهاء العقود + مهل الخطف (الشهري في day.js).
export function staffCorpContractsDay(s) {
  const c = corpOf(s);
  if (!c) return;
  for (const emp of [...c.employees]) {
    if (emp.contractEnd < s.date) {
      c.employees = c.employees.filter((e) => e.id !== emp.id);
      afterRoleVacated(s, emp);
      message(s, {
        title: `انتهى عقد ${emp.name.ar} ورحل`,
        body: `غادر ${roleNameAr(emp.role)} بعد انتهاء عقده دون تجديد. الدور شاغر في الهيكل.`,
        category: "club", priority: "high",
      });
    }
  }
  poachDay(s);
}
