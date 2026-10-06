// نظام الأساطير: تعاقدات مدفوعة مع أساطير حقيقية معتزلة، بأدوار تدريبية
// حسب المركز، أو سفراء للنادي، أو عودة خيالية كلاعبين.
import { assert, clamp, addDays, daysBetween, random } from "../core/utils.js";
import { post, wages } from "./finance.js";
import { message, closeThread } from "./inbox.js";
import { difficulty } from "../models/difficulty.js";
import { initializeCareer } from "../models/player.js";
import { archiveRetiree } from "./retired.js";
import { reservedSquadSize } from "./employment.js";
import { extendedClub } from "../data/expandedCatalog.js";
import {
  LEGENDS,
  LEGEND_ROLES,
  LEGEND_GROUPS,
  LEGEND_SOURCE_STATUS,
  legendById,
  legendGroup,
} from "../data/legends.js";

export const LEGENDS_SCHEMA = 1;
export const MAX_LEGEND_PLAYERS = 2;
export const LEGEND_PLAYER_YEARS = [1, 2];
export const LEGEND_STAFF_YEARS = [1, 2, 3];

export function initLegends() {
  return {
    schema: LEGENDS_SCHEMA,
    playerMode: true,
    serial: 0,
    contracts: [],
    hall: [],
    lastMonth: null,
  };
}

const state = (s) => s.legends || (s.legends = initLegends());
const ownClubName = (s) => {
  try {
    return extendedClub(s.clubId)?.name || s.clubId;
  } catch {
    return s.clubId;
  }
};
const isoYear = (iso) => Number(iso.slice(0, 4));
const roleOf = (role) => LEGEND_ROLES[role];

export const activeLegendContracts = (s) =>
  (s.legends?.contracts || []).filter((c) => c.status === "active");

export const legendContractFor = (s, legendId) =>
  activeLegendContracts(s).find((c) => c.legendId === legendId) || null;

export const legendCoachFor = (s, roleId) =>
  activeLegendContracts(s).find((c) => c.role === roleId) || null;

// قوة التأثير التدريبي: من 0.3 (نجم تاريخي) إلى 1.2 (أيقونة).
export const legendImpact = (legend) => clamp((legend.peak - 70) / 25, 0.3, 1.2);

// أدوار متاحة لأسطورة بعينها: تخصصها التدريبي + سفير + لاعب (لو الوضع مفعّل).
export function legendRoles(s, legend) {
  const roles = [LEGEND_ROLES[legend.group], LEGEND_ROLES.ambassador];
  if (state(s).playerMode !== false) roles.push(LEGEND_ROLES.player);
  return roles;
}

export function legendQuote(s, legendId, role, years) {
  const legend = legendById(legendId);
  assert(legend, "الأسطورة غير موجودة.");
  const r = roleOf(role);
  assert(r, "الدور غير معروف.");
  if (r.kind === "coach") assert(r.group === legend.group, "هذا الدور لا يناسب مركز الأسطورة.");
  const allowedYears = r.kind === "player" ? LEGEND_PLAYER_YEARS : LEGEND_STAFF_YEARS;
  years = Number(years);
  assert(allowedYears.includes(years), "مدة العقد غير متاحة.");
  const d = difficulty(s);
  const affiliated = legend.clubIds.includes(s.clubId);
  const rival = legend.rivalIds.includes(s.clubId);
  const over = Math.max(0, legend.peak - 70);
  let fee;
  let salary;
  if (r.kind === "player") {
    fee = 10_000_000 + over * over * 120_000;
    salary = (legend.peak - 30) * (legend.peak - 30) * 200;
  } else {
    fee = 2_000_000 + over * over * 40_000;
    salary = 60_000 + over * 12_000;
  }
  fee = Math.round((fee * d.transfer) / 100_000) * 100_000;
  salary = Math.round((salary * d.wage) / 1_000) * 1_000;
  if (affiliated) fee = Math.round((fee * 0.75) / 100_000) * 100_000;
  const rep = s.reputation || 0;
  let status = "accepted";
  let reason = affiliated
    ? "علاقته التاريخية بالنادي تجعله يقبل مباشرة، وبخصم على المقدم."
    : "سمعة النادي تكفي لإقناعه بالمشروع.";
  if (rival) {
    status = "refused";
    reason = "لن ينضم لغريم ناديه التاريخي مهما كان العرض.";
  } else if (r.kind === "player" && state(s).playerMode === false) {
    status = "refused";
    reason = "وضع عودة الأساطير كلاعبين متوقف من الإعدادات.";
  } else if (!affiliated && rep < legend.peak - 20) {
    if (rep >= legend.peak - 32) {
      status = "countered";
      fee = Math.round((fee * 1.4) / 100_000) * 100_000;
      salary = Math.round((salary * 1.15) / 1_000) * 1_000;
      reason = "متردد بسبب سمعة النادي: يطلب علاوة مشروع على المقدم والراتب.";
    } else {
      status = "refused";
      reason = `سمعة النادي (${Math.round(rep)}) أقل بكثير من مستوى المشروع الذي يبحث عنه (يحتاج ${legend.peak - 32} على الأقل).`;
    }
  }
  const months = years * 12;
  return {
    legendId,
    role,
    years,
    fee,
    salary,
    monthly: salary,
    total: fee + salary * months,
    status,
    reason,
    affiliated,
    rival,
    impact: r.kind === "coach" ? legendImpact(legend) : r.kind === "ambassador" ? legendImpact(legend) : 0,
  };
}

const legendPlayerCount = (s) =>
  activeLegendContracts(s).filter((c) => c.role === "player").length;

export function signLegend(s, legendId, role, years) {
  const legend = legendById(legendId);
  assert(legend, "الأسطورة غير موجودة.");
  const st = state(s);
  const r = roleOf(role);
  assert(r, "الدور غير معروف.");
  assert(!legendContractFor(s, legendId), "الأسطورة مرتبطة بعقد نشط بالفعل.");
  const q = legendQuote(s, legendId, role, years);
  assert(q.status !== "refused", q.reason);
  if (r.kind === "coach") assert(!legendCoachFor(s, role), `يوجد ${r.name} أسطوري بالفعل؛ أنهِ عقده أولًا.`);
  if (r.kind === "ambassador") assert(!legendCoachFor(s, "ambassador"), "يوجد سفير أسطوري بالفعل.");
  if (r.kind === "player") {
    assert(legendPlayerCount(s) < MAX_LEGEND_PLAYERS, `الحد الأقصى ${MAX_LEGEND_PLAYERS} أسطورة كلاعبين في الوقت نفسه.`);
    assert(reservedSquadSize(s) < s.squadLimit, "القائمة ممتلئة؛ حرّر مكانًا أولًا.");
    assert(wages(s) + q.salary <= s.finance.wageBudget, "راتب الأسطورة يتجاوز ميزانية المرتبات.");
  }
  assert(s.finance.cash >= q.fee + q.salary, "السيولة لا تكفي لمقدم العقد وأول راتب.");
  st.serial = (st.serial || 0) + 1;
  const id = `lg-${st.serial}`;
  const start = s.date;
  const end = addDays(start, 365 * q.years);
  post(s, -q.fee, "legend-fee", `مقدم تعاقد الأسطورة ${legend.name} (${r.name})`, `legend-fee-${id}`);
  const contract = {
    id,
    legendId,
    role,
    kind: r.kind,
    fee: q.fee,
    salary: q.salary,
    start,
    end,
    years: q.years,
    status: "active",
    playerId: null,
    sessions: 0,
    gains: 0,
    income: 0,
    lastEffect: null,
  };
  if (r.kind === "player") contract.playerId = createLegendPlayer(s, legend, contract);
  st.contracts.push(contract);
  message(s, {
    title: `${legend.name} ينضم إلى ${ownClubName(s)}`,
    body:
      r.kind === "player"
        ? `عودة خيالية: ${legend.name} يلعب لك حتى ${end} بتقييم ${legend.peak - (legend.position === "GK" ? 3 : 4)}. مقدم ${q.fee.toLocaleString("en-US")} وراتب شهري ${q.salary.toLocaleString("en-US")}.`
        : `${r.name} حتى ${end}. ${r.description} مقدم ${q.fee.toLocaleString("en-US")} وراتب شهري ${q.salary.toLocaleString("en-US")}.${q.status === "countered" ? " قبل العرض بعد العلاوة." : ""}`,
    category: "management",
    kind: "legend-signed",
    ref: id,
  });
  return contract;
}

function createLegendPlayer(s, legend, contract) {
  const returnAge = legend.position === "GK" ? 34 : 31;
  const drop = legend.position === "GK" ? 3 : 4;
  const attrs = {};
  for (const [k, v] of Object.entries(legend.attributes))
    attrs[k] = clamp(v - drop - (k === "pace" ? 6 : 0), 20, 99);
  const rating = clamp(legend.peak - drop, 40, 99);
  const p = {
    id: `${contract.id}-${legend.id}`,
    name: legend.name,
    nameLatin: legend.nameLatin,
    nationality: legend.countryName,
    clubId: s.clubId,
    position: legend.position,
    role: "أساسي",
    foot: "يمنى",
    age: returnAge,
    birthDate: `${isoYear(s.date) - returnAge}-01-01`,
    ageEstimated: true,
    clubName: ownClubName(s),
    rating,
    potential: rating,
    attributes: attrs,
    fitness: 78,
    morale: 85,
    appearances: 0,
    goals: 0,
    salary: contract.salary,
    value: contract.fee,
    contractEnd: contract.end,
    contractTerms: {
      appearanceBonus: 0,
      goalBonus: 0,
      annualRaisePct: 0,
      releaseClause: 0,
      signedOn: s.date,
      lastRaiseYear: s.date.slice(0, 4),
    },
    fictional: false,
    sourceStatus: LEGEND_SOURCE_STATUS,
    sourceUrl: null,
    biographyUrl: legend.biographyUrl,
    estimatedFields: ["rating", "attributes", "age", "salary", "value"],
    legendId: legend.id,
    careerInterest: 100,
  };
  initializeCareer(p, s.date);
  p.age = returnAge;
  p.ageReference = returnAge;
  p.ageReferenceDate = s.date;
  p.status = "active";
  p.rating = rating;
  p.potential = rating;
  p.naturalFitness = 60;
  s.players.push(p);
  return p.id;
}

export const legendYearsLeft = (s, c) =>
  Math.max(1, Math.ceil(Math.max(0, daysBetween(s.date, c.end)) / 365));

export function legendReleaseCost(s, contractId) {
  const c = (s.legends?.contracts || []).find((x) => x.id === contractId);
  assert(c && c.status === "active", "العقد غير نشط.");
  return c.salary * 2 * legendYearsLeft(s, c);
}

export function releaseLegend(s, contractId) {
  const st = state(s);
  const c = st.contracts.find((x) => x.id === contractId);
  assert(c && c.status === "active", "العقد غير نشط.");
  const legend = legendById(c.legendId);
  const cost = legendReleaseCost(s, contractId);
  assert(s.finance.cash >= cost, "السيولة لا تكفي لتعويض إنهاء العقد.");
  post(s, -cost, "legend-fee", `تعويض إنهاء عقد الأسطورة ${legend?.name || c.legendId}`, `legend-release-${c.id}`);
  endContract(s, c, "released");
  message(s, {
    title: `إنهاء عقد ${legend?.name || c.legendId}`,
    body: `دفعت تعويضًا ${cost.toLocaleString("en-US")} وأُنهي العقد بالتراضي.`,
    category: "management",
    kind: "legend-ended",
    ref: c.id,
  });
  return cost;
}

export function renewLegend(s, contractId, years) {
  const st = state(s);
  const c = st.contracts.find((x) => x.id === contractId);
  assert(c && c.status === "active", "العقد غير نشط.");
  assert(c.kind !== "player", "عقود اللاعبين تُجدد من شاشة الفريق كأي لاعب.");
  years = Number(years);
  assert(LEGEND_STAFF_YEARS.includes(years), "مدة التجديد غير متاحة.");
  const bonus = c.salary;
  assert(s.finance.cash >= bonus, "السيولة لا تكفي لمكافأة التجديد (راتب شهر).");
  const legend = legendById(c.legendId);
  post(s, -bonus, "legend-fee", `مكافأة تجديد ${legend?.name || c.legendId}`, `legend-renew-${c.id}-${s.date}`);
  const base = c.end > s.date ? c.end : s.date;
  c.end = addDays(base, 365 * years);
  c.years += years;
  message(s, {
    title: `تجديد عقد ${legend?.name || c.legendId}`,
    body: `العقد ممتد حتى ${c.end}. مكافأة التجديد ${bonus.toLocaleString("en-US")}.`,
    category: "management",
    kind: "legend-renewed",
    ref: c.id,
  });
  return c;
}

function endContract(s, c, why) {
  c.status = "ended";
  c.endedOn = s.date;
  c.endedBecause = why;
  if (c.kind === "player" && c.playerId) {
    const p = s.players.find((x) => x.id === c.playerId);
    if (p && p.status !== "retired" && p.clubId === s.clubId) retireLegendPlayer(s, p);
  }
}

function retireLegendPlayer(s, p) {
  const former = p.clubId;
  p.status = "retired";
  p.previousClubId = former;
  p.clubId = "retired";
  p.retiredOn = s.date;
  p.retirementPlan = null;
  p.careerHistory = p.careerHistory || [];
  p.careerHistory.push({
    type: "retired",
    date: s.date,
    clubId: former,
    appearances: p.appearances,
    goals: p.goals,
    legendReturn: true,
  });
  p.salary = 0;
  p.value = 0;
  p.injuryUntil = null;
  for (const n of (s.negotiations || []).filter(
    (n) => n.playerId === p.id && ["waiting", "club-reply", "personal"].includes(n.stage),
  )) {
    n.stage = "rejected";
    closeThread(s, n.id);
  }
  closeThread(s, p.id);
  inductRetiree(s, p, former, true);
  archiveRetiree(s, p);
}

export function setLegendPlayerMode(s, enabled) {
  state(s).playerMode = !!enabled;
}

// ——— التأثيرات ———

export const legendMatchBonus = (s) =>
  activeLegendContracts(s).reduce((sum, c) => {
    if (c.kind !== "coach") return sum;
    const l = legendById(c.legendId);
    return l ? sum + 0.35 * legendImpact(l) : sum;
  }, 0);

export function legendWearFactor(s, p) {
  if (!s.legends || p.clubId !== s.clubId) return 1;
  const g = legendGroup(p.position);
  return activeLegendContracts(s).some((c) => c.kind === "coach" && c.role === g && c.playerId !== p.id)
    ? 0.88
    : 1;
}

export function inductRetiree(s, p, former, force = false) {
  const st = state(s);
  if (former !== s.clubId) return false;
  const worthy =
    force || (p.appearances || 0) >= 100 || (p.goals || 0) >= 40 || (p.rating || 0) >= 85;
  if (!worthy) return false;
  if (st.hall.some((h) => h.playerId === p.id)) return false;
  st.hall.unshift({
    playerId: p.id,
    name: p.name,
    position: p.position,
    appearances: p.appearances || 0,
    goals: p.goals || 0,
    rating: p.rating || 0,
    legendId: p.legendId || null,
    inducted: s.date,
    season: s.seasonNumber,
  });
  if (st.hall.length > 200) st.hall.length = 200;
  message(s, {
    title: `${p.name} يدخل قاعة إرث النادي`,
    body: `اعتزل بعد ${p.appearances || 0} مباراة و${p.goals || 0} هدفًا مع النادي. اسمه الآن على جدار القاعة.`,
    category: "management",
    kind: "legend-inducted",
    ref: p.id,
  });
  return true;
}

function monthlyCoaching(s, c, legend) {
  const role = LEGEND_ROLES[c.role];
  const group = LEGEND_GROUPS[role.group];
  const impact = legendImpact(legend);
  const chance = 0.45 + 0.25 * impact;
  const gain = 0.12 + 0.18 * impact;
  let sessions = 0;
  let total = 0;
  for (const p of s.players) {
    if (p.clubId !== s.clubId || p.status === "retired" || p.id === c.playerId) continue;
    if (!group.positions.includes(p.position)) continue;
    if (p.loan && p.loan.borrower && p.loan.borrower !== s.clubId) continue;
    if (random(s) > chance) continue;
    sessions++;
    const keys = p.age >= 30 ? ["decisions"] : role.attributes;
    for (const k of keys) {
      const before = p.attributes[k] ?? 50;
      const after = Math.min(99, before + gain);
      p.attributes[k] = Math.round(after * 100) / 100;
      total += after - before;
    }
    const cap = Number.isFinite(p.potential) ? Math.max(p.potential, p.rating) : 99;
    p.rating = Math.min(cap, Math.round((p.rating + gain * 0.35) * 100) / 100);
    p.morale = clamp(Math.round((p.morale || 70) + 1), 0, 100);
  }
  c.sessions += sessions;
  c.gains = Math.round((c.gains + total) * 100) / 100;
  c.lastEffect = { date: s.date, sessions, gain: Math.round(total * 100) / 100 };
}

function monthlyAmbassador(s, c, legend) {
  const impact = legendImpact(legend);
  const income = Math.round((c.salary * (0.5 + 0.3 * impact)) / 1_000) * 1_000;
  post(s, income, "legend-income", `حقوق صورة وفعاليات السفير ${legend.name}`, `legend-income-${c.id}-${s.date}`);
  c.income += income;
  s.reputation = clamp(Math.round(((s.reputation || 0) + 0.15) * 100) / 100, 0, 100);
  if (Number.isFinite(s.fanSupport)) s.fanSupport = clamp(s.fanSupport + 1, 0, 100);
  c.sessions += 1;
  c.lastEffect = { date: s.date, income };
}

export function legendDay(s) {
  const st = s.legends;
  if (!st) return;
  const monthStart = s.date.endsWith("-01");
  for (const c of st.contracts) {
    if (c.status !== "active") continue;
    const legend = legendById(c.legendId);
    if (!legend) {
      c.status = "ended";
      c.endedOn = s.date;
      c.endedBecause = "missing";
      continue;
    }
    if (c.kind === "player") {
      const p = s.players.find((x) => x.id === c.playerId);
      if (!p || p.status === "retired") {
        c.status = "ended";
        c.endedOn = s.date;
        c.endedBecause = "retired";
        continue;
      }
      if (p.clubId !== s.clubId) {
        c.status = "ended";
        c.endedOn = s.date;
        c.endedBecause = "left";
        message(s, {
          title: `${legend.name} غادر النادي`,
          body: "انتهت عودة الأسطورة بعد رحيله عن الفريق.",
          category: "management",
          kind: "legend-ended",
          ref: c.id,
        });
        continue;
      }
      if (p.contractEnd > c.end) c.end = p.contractEnd;
      if (c.end <= s.date) {
        endContract(s, c, "expired");
        message(s, {
          title: `${legend.name} يعلن اعتزاله مجددًا`,
          body: `انتهت العودة الخيالية بعد ${p.appearances} مباراة و${p.goals} هدفًا. الجماهير تودّعه بالتصفيق.`,
          category: "management",
          kind: "legend-ended",
          ref: c.id,
        });
      }
      continue;
    }
    if (c.end < s.date) {
      endContract(s, c, "expired");
      message(s, {
        title: `انتهى عقد ${legend.name}`,
        body: `انتهت مدة عمله كـ${LEGEND_ROLES[c.role].name}. يمكنك التعاقد معه مجددًا من قاعة الأساطير.`,
        category: "management",
        kind: "legend-ended",
        ref: c.id,
      });
      continue;
    }
    if (!monthStart) continue;
    const posted = post(s, -c.salary, "legend-salary", `راتب الأسطورة ${legend.name} (${LEGEND_ROLES[c.role].name})`, `legend-salary-${c.id}-${s.date}`);
    if (!posted) continue; // نفس اليوم لا يُحتسب مرتين
    if (c.kind === "coach") monthlyCoaching(s, c, legend);
    else if (c.kind === "ambassador") monthlyAmbassador(s, c, legend);
  }
  if (monthStart) st.lastMonth = s.date.slice(0, 7);
}

// ملخص للواجهة: من يستفيد من كل مدرب أسطوري الآن.
export function legendBeneficiaries(s, c) {
  const role = LEGEND_ROLES[c.role];
  if (!role || role.kind !== "coach") return [];
  const group = LEGEND_GROUPS[role.group];
  return s.players.filter(
    (p) =>
      p.clubId === s.clubId &&
      p.status !== "retired" &&
      p.id !== c.playerId &&
      group.positions.includes(p.position),
  );
}

export const legendCatalog = () => LEGENDS;
export const legendYear = (s) => isoYear(s.date);
