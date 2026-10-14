// الفروع 0.47 — افتح فرع ناديك بدولة (تكلفة + مستوى 1–3)، بميزة دولة معلنة،
// وعوائد شهرية (ناشئون/دخل/شهرة/كشافة)، وترقيات، ومدير كفاءة، وقرارات شهرية
// إضافة بحتة (كل خيار تعزيز، والتجاهل ينتهي بصمت بلا أي عقوبة)، وجسر إلى
// إمبراطور الأندية: امتلاك نادٍ في نفس البلد يخفض التكلفة ويرفع العائد.
import { assert, clamp, uid, addDays } from "../core/utils.js";
import { post } from "./finance.js";
import { message } from "./inbox.js";
import { tr } from "../i18n/index.js";
import { ensureEmpire } from "./empire/wealth.js";
import { ensureClubEmpire } from "./clubEmpire/state.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { generatedPlayer } from "../models/generatedPlayers.js";
import { initializeCareer } from "../models/player.js";
import { hash } from "../models/ability.js";
import { MARKETS, marketBy } from "../data/worldMarkets.js";
import {
  BRANCH_CAP,
  BRANCH_LEVELS,
  BRANCH_DECISIONS,
  OPEN_DAYS,
  UPGRADE_DAYS,
  UPGRADE_COST_FACTOR,
  baseOpenCost,
  baseMonthIncome,
  efficiencyOf,
  countryEdge,
  branchMarket,
  EDGE_NAMES,
  CANDIDATE_SIGNING_COST,
} from "../data/branchCatalog.js";

export { BRANCH_CAP, BRANCH_LEVELS, BRANCH_DECISIONS, OPEN_DAYS, UPGRADE_DAYS, UPGRADE_COST_FACTOR, EDGE_NAMES };

// اسم البلد كما في بقية الشاشات: عربي في العربية، واسم الدوري اللاتيني في EN/FR.
export const marketName = (country) => {
  const m = marketBy(country);
  return m ? tr(m.nameAr, m.name, m.name) : country;
};

// مولد محلي مستقل: لا يستهلك s.seed أبدًا حتى لا يزاح محرك المباريات.
function brng(s) {
  const b = s.branches || ensureBranches(s);
  if (!Number.isFinite(b.rng)) b.rng = (s.seed ^ 0x5f3759df) >>> 0;
  let x = b.rng | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  b.rng = x >>> 0;
  return b.rng / 4294967296;
}

export function ensureBranches(s) {
  if (!s.branches || s.branches.schema !== 1)
    s.branches = {
      schema: 1,
      serial: 0,
      rng: null,
      list: [],
      projects: [],
      candidates: [],
      decisions: [],
      log: [],
      lastMonth: "",
    };
  return s.branches;
}

const B = (s) => s.branches || ensureBranches(s);
export const branchByCountry = (s, country) =>
  B(s).list.find((x) => x.country === country) || null;
export const builtBranches = (s) => B(s).list;

// ── جسر إمبراطور الأندية: كل نادٍ تملكه في البلد يخفض التكلفة ويرفع العائد ───
function clubCountry(clubId) {
  if (MARKETS.some((m) => m.id === clubId)) return clubId;
  try {
    const c = extendedClub(clubId);
    return c?.country || null;
  } catch {
    return null;
  }
}

export function ownedClubsIn(s, country) {
  const e = ensureClubEmpire(s);
  return (e.ownedClubs || []).filter(
    (c) => c && clubCountry(c.clubId) === country,
  ).length;
}

export const BRIDGE_COST_DISCOUNT = 0.2; // لكل نادٍ مملوك، حتى 40%
export const BRIDGE_COST_CAP = 0.4;
export const BRIDGE_INCOME_BONUS = 0.15; // لكل نادٍ مملوك، حتى 30%
export const BRIDGE_INCOME_CAP = 0.3;

export function bridgeCostFactor(s, country) {
  return 1 - Math.min(BRIDGE_COST_CAP, ownedClubsIn(s, country) * BRIDGE_COST_DISCOUNT);
}
export function bridgeIncomeFactor(s, country) {
  return 1 + Math.min(BRIDGE_INCOME_CAP, ownedClubsIn(s, country) * BRIDGE_INCOME_BONUS);
}

// ── التسعير: عادي (سعر + انتظار) أو معجل ⚡ (+25% ← فوري بلا أي انتظار) ─────
export const BRANCH_INSTANT_FACTOR = 1.25;

export function branchQuote(s, country, targetLevel = 1, { instant = false } = {}) {
  const market = branchMarket(country);
  assert(market, "دولة غير معروفة.");
  assert(
    Number.isInteger(targetLevel) && targetLevel >= 1 && targetLevel <= BRANCH_LEVELS,
    "المستوى من 1 إلى 3.",
  );
  const current = branchByCountry(s, country);
  const from = current ? current.level : 0;
  assert(targetLevel === from + 1, "الترقية خطوة واحدة في كل مرة.");
  const base = baseOpenCost(market) * (from === 0 ? 1 : UPGRADE_COST_FACTOR[targetLevel]);
  const days = instant ? 0 : from === 0 ? OPEN_DAYS : UPGRADE_DAYS[targetLevel];
  const cost = Math.round((base * bridgeCostFactor(s, country) * (instant ? BRANCH_INSTANT_FACTOR : 1)) / 100_000) * 100_000;
  return { cost, days, targetLevel, from, instant, bridge: bridgeCostFactor(s, country) < 1 };
}

function completeBranchProject(s, p) {
  const b = ensureBranches(s);
  if (p.kind === "open") {
    b.list.push({
      id: uid(s, "branch"),
      country: p.country,
      level: 1,
      openedOn: s.date,
      manager: null,
      boosts: {},
    });
  } else {
    const branch = branchByCountry(s, p.country);
    if (branch) branch.level = p.targetLevel;
  }
  message(s, {
    title:
      p.kind === "open"
        ? tr("اكتمل افتتاح الفرع", "The branch opening is complete", "L'ouverture de la branche est terminée")
        : tr("اكتملت ترقية الفرع", "The branch upgrade is complete", "L'amélioration de la branche est terminée"),
    body: tr(
      `فرع ${marketName(p.country)} يعمل الآن بالمستوى ${p.targetLevel} من 3.`,
      `The ${marketName(p.country)} branch now operates at level ${p.targetLevel} of 3.`,
      `La branche ${marketName(p.country)} fonctionne désormais au niveau ${p.targetLevel} sur 3.`,
    ),
    category: "events",
  });
  log(s, { kind: p.kind, country: p.country, label: tr("اكتمال مشروع", "Project completed", "Projet terminé"), amount: p.cost });
}

// ── الفتح والترقية: عادي (انتظار) أو معجل ⚡ (فوري) ──────────────────────────
export function openBranch(s, country, { instant = false } = {}) {
  const b = ensureBranches(s);
  assert(b.list.length < BRANCH_CAP, `سقف الفروع ${BRANCH_CAP}.`);
  if (!instant)
    assert(
      b.projects.length < BRANCH_CAP,
      `لا تتجاوز ${BRANCH_CAP} مشاريع فروع متزامنة.`,
    );
  assert(!branchByCountry(s, country), "لديك فرع في هذا البلد بالفعل.");
  assert(!b.projects.some((p) => p.country === country), "يوجد مشروع جارٍ في هذا البلد.");
  const q = branchQuote(s, country, 1, { instant });
  assert(s.finance.cash >= q.cost, "خزينة النادي لا تغطي تكلفة الفتح.");
  post(s, -q.cost, "branches", `فتح فرع — ${marketName(country)}`, `branch-open-${country}-${uid(s, "bo")}`);
  if (instant) {
    completeBranchProject(s, { kind: "open", country, targetLevel: 1, cost: q.cost });
    return { instant: true, ...q };
  }
  b.projects.push({
    id: uid(s, "branchp"),
    kind: "open",
    country,
    targetLevel: 1,
    start: s.date,
    end: addDays(s.date, q.days),
    cost: q.cost,
  });
  message(s, {
    title: tr("بدأ مشوار الفرع الجديد", "The new branch journey began", "Le parcours de la nouvelle branche a commencé"),
    body: tr(
      `مشروع فرع ${marketName(country)} قيد التنفيذ (${q.days} يومًا بتكلفة ${q.cost.toLocaleString("en-US")}).`,
      `The ${marketName(country)} branch project is under way (${q.days} days at a cost of ${q.cost.toLocaleString("en-US")}).`,
      `Le projet de la branche ${marketName(country)} est en cours (${q.days} jours pour un coût de ${q.cost.toLocaleString("en-US")}).`,
    ),
    category: "events",
  });
  return b.projects.at(-1);
}

export function upgradeBranch(s, country, { instant = false } = {}) {
  const b = ensureBranches(s);
  const branch = branchByCountry(s, country);
  assert(branch, "لا فرع لترقيته هنا.");
  assert(branch.level < BRANCH_LEVELS, "الفرع في أقصى مستوى (3).");
  assert(!b.projects.some((p) => p.country === country), "يوجد مشروع جارٍ في هذا البلد.");
  const q = branchQuote(s, country, branch.level + 1, { instant });
  assert(s.finance.cash >= q.cost, "خزينة النادي لا تغطي الترقية.");
  post(s, -q.cost, "branches", `ترقية فرع — ${marketName(country)}`, `branch-up-${country}-${branch.level + 1}-${uid(s, "bu")}`);
  if (instant) {
    completeBranchProject(s, { kind: "upgrade", country, targetLevel: branch.level + 1, cost: q.cost });
    return { instant: true, ...q };
  }
  b.projects.push({
    id: uid(s, "branchp"),
    kind: "upgrade",
    country,
    targetLevel: branch.level + 1,
    start: s.date,
    end: addDays(s.date, q.days),
    cost: q.cost,
  });
  return b.projects.at(-1);
}

// ── مدير الكفاءة: ثلاثة مرشحين حتميين لكل بلد (بلا استهلاك لأي عشوائية) ──────
export function managerCandidates(s, country) {
  const market = branchMarket(country);
  assert(market, "دولة غير معروفة.");
  const out = [];
  for (let i = 0; i < 3; i++) {
    const key = `${country}-${s.seed}-${i}`;
    const n = hash(key);
    const p = generatedPlayer(
      { id: `branch-mgr-${country}`, country, name: market.nameAr, overall: market.level },
      900 + i,
      s.date,
      s.seed,
      false,
    );
    out.push({
      id: `mgr-${country}-${i}`,
      name: p.name,
      skill: 55 + (n % 34),
      wage: (150_000 + ((n >> 5) % 26) * 10_000),
    });
  }
  return out;
}

export function hireBranchManager(s, country, pickId) {
  const branch = branchByCountry(s, country);
  assert(branch, "لا فرع هنا.");
  const cand = managerCandidates(s, country).find((c) => c.id === pickId);
  assert(cand, "مدير غير متاح لهذا الفرع.");
  branch.manager = { name: cand.name, skill: cand.skill, wage: cand.wage };
  log(s, { kind: "manager", country, label: cand.name, amount: cand.wage });
  message(s, {
    title: tr("مدير كفاءة جديد", "A new efficiency manager", "Un nouveau directeur d'efficacité"),
    body: tr(
      `${cand.name} يدير فرع ${marketName(country)} بمهارة ${cand.skill} وراتب شهري ${cand.wage.toLocaleString("en-US")}.`,
      `${cand.name} now runs the ${marketName(country)} branch with skill ${cand.skill} at a monthly wage of ${cand.wage.toLocaleString("en-US")}.`,
      `${cand.name} dirige la branche ${marketName(country)} avec une compétence de ${cand.skill} pour un salaire mensuel de ${cand.wage.toLocaleString("en-US")}.`,
    ),
    category: "events",
  });
  return branch.manager;
}

export function fireBranchManager(s, country) {
  const branch = branchByCountry(s, country);
  assert(branch?.manager, "لا مدير لهذا الفرع.");
  branch.manager = null;
}

// ── العوائد: التسوية الشهرية ────────────────────────────────────────────────
export function branchIncome(s, branch) {
  const market = branchMarket(branch.country);
  const edge = countryEdge(branch.country);
  let income = baseMonthIncome(market, branch.level) * efficiencyOf(branch.manager);
  if (edge === "income") income *= 1.35;
  const boostActive = (key) => branch.boosts?.[key] && branch.boosts[key] >= s.date;
  if (boostActive("marketingUntil")) income *= 1.25;
  if (boostActive("scoutUntil")) income *= 1.1;
  income *= bridgeIncomeFactor(s, branch.country);
  return Math.round(income);
}

function log(s, entry) {
  const b = ensureBranches(s);
  b.log.unshift({ id: uid(s, "blog"), date: s.date, ...entry });
  b.log.length = Math.min(b.log.length, 60);
}

function monthlyBranchDecisions(s, branch) {
  const b = ensureBranches(s);
  if (b.decisions.some((d) => d.branchId === branch.id)) return;
  if (brng(s) > 0.35) return;
  const def = BRANCH_DECISIONS[Math.floor(brng(s) * BRANCH_DECISIONS.length)];
  const cost = def.costLevel * branch.level;
  b.decisions.push({
    id: uid(s, "bdec"),
    branchId: branch.id,
    country: branch.country,
    defId: def.id,
    cost,
    expires: addDays(s.date, 30),
  });
}

export function applyBranchDecision(s, decisionId) {
  const b = ensureBranches(s);
  const d = b.decisions.find((x) => x.id === decisionId);
  assert(d, "قرار غير متاح.");
  const branch = branchOf(s, d.branchId);
  assert(branch, "الفرع غير موجود.");
  const def = BRANCH_DECISIONS.find((x) => x.id === d.defId);
  assert(def, "تعزيز غير معروف.");
  assert(s.finance.cash >= d.cost, "خزينة النادي لا تكفي لهذا التعزيز.");
  post(s, -d.cost, "branches", `تعزيز فرع — ${def.name.ar}`, `branch-boost-${d.id}`);
  branch.boosts ??= {};
  branch.boosts[def.boost] = addDays(s.date, def.days);
  b.decisions = b.decisions.filter((x) => x.id !== decisionId);
  log(s, { kind: "boost", country: d.country, label: def.name.ar, amount: d.cost });
  message(s, {
    title: tr("تعزيز فرع يعمل", "A branch boost is live", "Un renfort de branche est actif"),
    body: tr(
      `${def.name.ar} في فرع ${marketName(d.country)}: ${def.note.ar}`,
      `${def.name.en} at the ${marketName(d.country)} branch: ${def.note.en}`,
      `${def.name.fr} à la branche ${marketName(d.country)} : ${def.note.fr}`,
    ),
    category: "events",
  });
  return def;
}

const branchOf = (s, id) => B(s).list.find((x) => x.id === id) || null;

// ناشئو الفروع: مرشح من قاموس أسماء بلد الفرع بجنسيته الصحيحة.
function branchProspect(s, branch) {
  const b = ensureBranches(s);
  const school = branch.boosts?.schoolUntil && branch.boosts.schoolUntil >= s.date ? 2 : 1;
  const chance = Math.min(0.55, (0.18 + branch.level * 0.12) * school);
  if (brng(s) > chance) return null;
  if (b.candidates.length >= 24) return null;
  const p = generatedPlayer(
    {
      id: `branch-${branch.country}`,
      country: branch.country,
      name: marketBy(branch.country).nameAr,
      overall: marketBy(branch.country).level,
    },
    5000 + ++b.serial,
    s.date,
    s.seed,
    true,
  );
  const cand = {
    id: `bcand-${b.serial}`,
    branchId: branch.id,
    country: branch.country,
    addedOn: s.date,
    player: p,
  };
  b.candidates.push(cand);
  message(s, {
    title: tr("ناشئ من مدرسة الفرع 🌱", "A prospect from the branch school 🌱", "Un jeune de l'école de la branche 🌱"),
    body: tr(
      `برز ${p.name} (${p.position}، ${p.age} سنة) في فرع ${marketName(branch.country)}. اضمه للفريق أو بعه أو أطلقه — القرار لك والتجاهل بلا خسارة.`,
      `${p.name} (${p.position}, aged ${p.age}) emerged at the ${marketName(branch.country)} branch. Sign him, sell him or let him go — ignoring costs nothing.`,
      `${p.name} (${p.position}, ${p.age} ans) s'est distingué à la branche ${marketName(branch.country)}. Recrutez-le, vendez-le ou libérez-le — l'ignorer ne coûte rien.`,
    ),
    category: "events",
  });
  return cand;
}

// تقرير الكشافة الشهري لميزة الكشافة: لاعبون حقيقيون من الحفظة فقط.
function scoutReport(s, branch) {
  const pool = s.players.filter(
    (p) => p.league === branch.country && p.clubId !== s.clubId && (p.age ?? 99) <= 23,
  );
  if (pool.length < 2) return null;
  const a = pool[Math.floor(brng(s) * pool.length)];
  const rest = pool.filter((p) => p.id !== a.id);
  const b2 = rest[Math.floor(brng(s) * rest.length)] || a;
  const fmt = (p) =>
    tr(
      `${p.name} (${p.age} سنة، تقييم ~${Math.round(p.rating)})`,
      `${p.name} (aged ${p.age}, rating ~${Math.round(p.rating)})`,
      `${p.name} (${p.age} ans, note ~${Math.round(p.rating)})`,
    );
  message(s, {
    title: tr("تقرير فرع الكشافة 🔎", "Branch scouting report 🔎", "Rapport de recrutement de la branche 🔎"),
    body: tr(
      `من شبكة فرع ${marketName(branch.country)}: ${fmt(a)} و ${fmt(b2)}.`,
      `From the ${marketName(branch.country)} branch network: ${fmt(a)} and ${fmt(b2)}.`,
      `Depuis le réseau de la branche ${marketName(branch.country)} : ${fmt(a)} et ${fmt(b2)}.`,
    ),
    category: "events",
  });
  return [a.id, b2.id];
}

export function branchesMonth(s) {
  const b = ensureBranches(s);
  const key = s.date.slice(0, 7);
  if (b.lastMonth === key) return false;
  b.lastMonth = key;
  const e = ensureEmpire(s);
  for (const branch of b.list) {
    const income = branchIncome(s, branch);
    const wage = branch.manager ? Math.min(branch.manager.wage, income) : 0;
    post(s, income, "branches", `عائد فرع — ${marketName(branch.country)}`, `branch-inc-${branch.country}-${key}`);
    if (wage)
      post(s, -wage, "branches", `راتب مدير فرع — ${marketName(branch.country)}`, `branch-wage-${branch.country}-${key}`);
    log(s, { kind: "income", country: branch.country, label: tr("عائد شهري", "Monthly income", "Revenu mensuel"), amount: income - wage });
    const edge = countryEdge(branch.country);
    if (edge === "fame") e.fame = clamp(e.fame + branch.level * 0.4, 0, 100);
    if (edge === "youth") branchProspect(s, branch);
    if (edge === "scout" && branch.level >= 2) scoutReport(s, branch);
    monthlyBranchDecisions(s, branch);
  }
  return true;
}

// ── الإيقاع اليومي: استلام المشاريع وانتهاء القرارات بصمت ───────────────────
export function branchDay(s) {
  const b = s.branches;
  if (!b) return;
  for (const p of [...b.projects]) {
    if (p.end > s.date) continue;
    b.projects = b.projects.filter((x) => x.id !== p.id);
    completeBranchProject(s, p);
  }
  if (b.decisions.length) b.decisions = b.decisions.filter((d) => d.expires >= s.date);
}

// ── قرارات المرشحين: ضم أو بيع أو إطلاق — ولا عقوبة على أي مسار ─────────────
export function signBranchCandidate(s, candidateId) {
  const b = ensureBranches(s);
  const c = b.candidates.find((x) => x.id === candidateId);
  assert(c, "مرشح غير متاح.");
  const squadCount = s.players.filter((p) => p.clubId === s.clubId).length;
  assert(squadCount < s.squadLimit, "قائمة الفريق ممتلئة.");
  assert(s.finance.cash >= CANDIDATE_SIGNING_COST, "لا تكفي السيولة لمكافأة الضم.");
  post(s, -CANDIDATE_SIGNING_COST, "branches", "مكافأة ضم ناشئ فرع", `branch-sign-${c.id}`);
  const p = c.player;
  p.clubId = s.clubId;
  p.league = s.leagues[0] || p.league;
  initializeCareer(p, s.date);
  p.contractEnd = addDays(s.date, 1095);
  p.salary = Math.max(50_000, Math.round(p.rating * 900));
  p.careerHistory.push({ date: s.date, type: "branch-signing", clubId: s.clubId });
  s.players.push(p);
  b.candidates = b.candidates.filter((x) => x.id !== candidateId);
  log(s, { kind: "sign", country: c.country, label: p.name, amount: CANDIDATE_SIGNING_COST });
  return p;
}

export function sellBranchCandidate(s, candidateId) {
  const b = ensureBranches(s);
  const c = b.candidates.find((x) => x.id === candidateId);
  assert(c, "مرشح غير متاح.");
  const fee = Math.max(200_000, Math.round((c.player.value || 500_000) * 0.5));
  post(s, fee, "branches", `بيع ناشئ فرع — ${c.player.name}`, `branch-sell-${c.id}`);
  b.candidates = b.candidates.filter((x) => x.id !== candidateId);
  log(s, { kind: "sell", country: c.country, label: c.player.name, amount: fee });
  return fee;
}

export function releaseBranchCandidate(s, candidateId) {
  const b = ensureBranches(s);
  const c = b.candidates.find((x) => x.id === candidateId);
  assert(c, "مرشح غير متاح.");
  b.candidates = b.candidates.filter((x) => x.id !== candidateId);
  log(s, { kind: "release", country: c.country, label: c.player.name, amount: 0 });
}

// خصم الكشافة لميزة الدولة (تستهلكه شبكة الكشافين).
export function branchScoutFactor(s, country) {
  const branch = branchByCountry(s, country);
  if (!branch || countryEdge(country) !== "scout" || branch.level < 2) return 1;
  return 0.75;
}
