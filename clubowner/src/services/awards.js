// 0.42 — محرك الجوائز: اختيار عادل وحتمي، حفل نهاية الموسم، قاعة مشاهير محفوظة،
// خطافات العقود (المعنويات) والتصويت الجماهيري (السوشيال) وجوائز المدربين (الرواتب).
// الإيقاع: شهري (لاعب/مدرب الشهر) + موسمي (باقي الجوائز + الحفل).
import { addDays, assert, clamp, daysBetween, uid } from "../core/utils.js";
import { message } from "./inbox.js";
import { post, wages } from "./finance.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { CLUBS } from "../data/catalog.js";
import { COACHES } from "./clubManagement.js";
import { SCORER_SCOPES } from "../data/awardsTexts.js";

export const AWARDS_VERSION = 1;
const HALL_KEEP = 30;
const MONTHLY_KEEP = 18;
const DEMAND_DEADLINE_DAYS = 21;

// ————— أدوات حتمية —————
const hash = (value) => {
  let h = 2166136261;
  for (const character of String(value))
    h = Math.imul(h ^ character.codePointAt(0), 16777619);
  return h >>> 0;
};
export const hashUnit = (key) => hash(key) / 4294967296;

// ————— الدول: توحيد الجنسية والانتماء القاري —————
import { COUNTRY_ALIASES, AFRICAN_CODES, ARAB_CODES } from "../data/countryAliases.js";
export { AFRICAN_CODES, ARAB_CODES };

const cleanKey = (raw) =>
  String(raw || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export function normalizeCountry(raw) {
  const key = cleanKey(raw);
  if (!key) return null;
  if (COUNTRY_ALIASES.has(key)) return COUNTRY_ALIASES.get(key);
  // بحث بأطول تركيب يناسب: "south africa" قبل "africa".
  const parts = key.split(" ");
  for (let n = parts.length; n > 0; n--)
    for (let i = 0; i + n <= parts.length; i++) {
      const hit = COUNTRY_ALIASES.get(parts.slice(i, i + n).join(" "));
      if (hit) return hit;
    }
  return null;
}

// سوق الدوري يحمل رمز البلد مباشرة (eg, en, ma...).
const marketCountry = (league) => (typeof league === "string" ? league : null);

function clubCountryOf(s, p) {
  const club = extendedClub(p.clubId);
  return normalizeCountry(club?.country) || marketCountry(p.league);
}

// ————— حالة الحفظة —————
export function ensureAwards(s) {
  const a = s.awards;
  if (a && a.version === AWARDS_VERSION) {
    a.hall ??= [];
    a.monthly ??= [];
    a.monthStats ??= {};
    a.statsBase ??= {};
    a.demanded ??= [];
    return s;
  }
  s.awards = {
    version: AWARDS_VERSION,
    hall: Array.isArray(a?.hall) ? a.hall : [],
    monthly: Array.isArray(a?.monthly) ? a.monthly : [],
    fanVote: a?.fanVote ?? null,
    ceremony: a?.ceremony ?? null,
    monthStats: a?.monthStats ?? {},
    statsBase: a?.statsBase ?? {},
    seasonSeen: a?.seasonSeen ?? null,
    demanded: Array.isArray(a?.demanded) ? a.demanded : [],
  };
  return s;
}

// ————— ملفات الأداء: حقيقية للاعبيك، وتقدير حتمي لبقية العالم —————
const SLOT_SHARES = {
  gk: [0.01, 0.06, 0.5],
  def: [0.08, 0.13, 0.32],
  mid: [0.2, 0.3, 0.1],
  att: [0.52, 0.22, 0.02],
};

export function slotOf(position) {
  const p = String(position || "").toUpperCase();
  if (p === "GK") return "gk";
  if (["CB", "LB", "RB", "SW", "WB", "DF"].includes(p)) return "def";
  if (["DM", "CM", "AM", "MF"].includes(p)) return "mid";
  return "att";
}

function estimateStats(p, season, seed) {
  const u = (tag) => hashUnit(`${seed}:${season}:${p.id}:${tag}`);
  const strength = clamp((p.rating - 45) / 42, 0.18, 1.35);
  const shares = SLOT_SHARES[slotOf(p.position)];
  const matches = 30;
  const form = p.form || 0;
  return {
    goals: Math.round(matches * shares[0] * strength * (0.55 + 0.95 * u("g")) + form / 30),
    assists: Math.round(matches * shares[1] * strength * (0.55 + 0.95 * u("a"))),
    cleanSheets: Math.round(
      matches * shares[2] * (0.5 + 0.6 * u("c")) * (0.55 + strength * 0.55),
    ),
    avgRating: clamp(
      5.8 + (p.rating - 60) / 18 + (u("r") * 1.3 - 0.55) + form / 55,
      4.2,
      9.6,
    ),
    minutes: Math.round(matches * 78 * (0.62 + 0.38 * u("m"))),
  };
}

function baseOf(awards, id) {
  return awards.statsBase[id] || null;
}

function realSeasonStats(p, base) {
  const now = {
    goals: p.seasonGoals || 0,
    assists: p.seasonAssists || 0,
    cleanSheets: p.seasonCleanSheets || 0,
    ratingSum: p.seasonRatingSum || 0,
    ratingCount: p.seasonRatingCount || 0,
    minutes: p.seasonMinutes || 0,
  };
  const from = base
    ? {
        goals: base.goals || 0,
        assists: base.assists || 0,
        cleanSheets: base.cleanSheets || 0,
        ratingSum: base.ratingSum || 0,
        ratingCount: base.ratingCount || 0,
        minutes: base.minutes || 0,
      }
    : { goals: 0, assists: 0, cleanSheets: 0, ratingSum: 0, ratingCount: 0, minutes: 0 };
  const goals = Math.max(0, now.goals - from.goals);
  const assists = Math.max(0, now.assists - from.assists);
  const cleanSheets = Math.max(0, now.cleanSheets - from.cleanSheets);
  const minutes = Math.max(0, now.minutes - from.minutes);
  const ratingCount = Math.max(0, now.ratingCount - from.ratingCount);
  const ratingSum = Math.max(0, now.ratingSum - from.ratingSum);
  return {
    goals,
    assists,
    cleanSheets,
    minutes,
    avgRating: ratingCount ? clamp(ratingSum / ratingCount, 4, 10) : 6,
  };
}

function compFractions(p, season, seed) {
  const a = hashUnit(`${seed}:${season}:${p.id}:split1`);
  const b = hashUnit(`${seed}:${season}:${p.id}:split2`);
  const league = 0.55 + 0.25 * a;
  const cup = 0.05 + 0.12 * b;
  const continental = Math.max(0.06, 1 - league - cup);
  return { league, cup, continental };
}

function buildProfiles(s) {
  ensureAwards(s);
  const season = s.seasonNumber;
  const profiles = [];
  for (const p of s.players) {
    if (p.status === "retired" || p.clubId === "retired") continue;
    const own = p.clubId === s.clubId;
    const base = own ? baseOf(s.awards, p.id) : null;
    const playedOwn = own && (p.seasonMinutes || 0) > (base?.minutes || 0);
    const stats = playedOwn
      ? realSeasonStats(p, base)
      : estimateStats(p, season, s.seed);
    profiles.push({
      p,
      own,
      playedOwn,
      stats,
      country: normalizeCountry(p.nationality) || marketCountry(p.league),
      clubCountry: clubCountryOf(s, p),
      age: p.age || 0,
      slot: slotOf(p.position),
    });
  }
  return profiles;
}

function overallScore(pro) {
  const st = pro.stats;
  return (
    pro.p.rating * 2.2 +
    st.avgRating * 9 +
    st.goals * 1.25 +
    st.assists * 1.05 +
    st.cleanSheets * 0.35 +
    (pro.p.form || 0) * 0.4
  );
}

// فرز عادل وحتمي: المقياس ثم التقييم ثم المعرّف.
function bestBy(list, metric) {
  if (!list.length) return null;
  return [...list].sort(
    (a, b) =>
      metric(b) - metric(a) ||
      b.p.rating - a.p.rating ||
      (a.p.id < b.p.id ? -1 : 1),
  )[0];
}

function winnerRecord(s, pro, extra = {}) {
  const p = pro.p;
  return {
    id: p.id,
    name: p.name,
    nameLatin: p.nameLatin || null,
    clubId: p.clubId,
    clubName: clubNameOf(s, p),
    nationality: p.nationality || null,
    rating: p.rating,
    own: !!pro.own,
    ...extra,
  };
}

// اسم النادي للعرض: كتالوج التوسعة أو كتالوج العرض المحلي.
function clubNameOf(s, p) {
  const club = extendedClub(p.clubId) || CLUBS.find((c) => c.id === p.clubId);
  return club?.name || p.clubName || p.clubId;
}

function coachWinnerRecord(c, own, extra = {}) {
  return {
    id: c.id,
    name: c.name,
    clubId: own ? "own" : "rivals",
    clubName: c.style || "",
    own: !!own,
    ...extra,
  };
}

// ————— اختيار الجوائز الموسمية —————
function competitionScopes(s) {
  const scopes = [{ id: "league" }];
  const cups = s.expansion?.cups || [];
  if (cups.length) scopes.push({ id: "cup" });
  if (
    s.expansion?.champions ||
    cups.some((c) => c.id && !c.id.startsWith("cup-"))
  )
    scopes.push({ id: "continental" });
  return scopes;
}

export function selectSeasonWinners(s) {
  ensureAwards(s);
  const profiles = buildProfiles(s);
  const seed = s.seed;
  const season = s.seasonNumber;
  const awards = {};
  const eligible = (fn) => profiles.filter(fn);

  const pick = (id, filter, metric) => {
    const pro = bestBy(eligible(filter), metric);
    awards[id] = pro ? winnerRecord(s, pro, { score: Math.round(metric(pro) * 10) / 10 }) : null;
    return pro;
  };

  pick("best-player", () => true, overallScore);
  pick("best-u21", (x) => x.age <= 21, overallScore);
  pick("best-african", (x) => AFRICAN_CODES.has(x.country), overallScore);
  pick("best-u23-african", (x) => AFRICAN_CODES.has(x.country) && x.age <= 23, overallScore);
  pick("best-arab", (x) => ARAB_CODES.has(x.country), overallScore);
  pick("best-in-africa", (x) => AFRICAN_CODES.has(x.clubCountry), overallScore);

  const scorerMetric = (x) => x.stats.goals * 100 + x.stats.assists * 10 + x.p.rating;
  pick("top-scorer-season", (x) => x.stats.goals > 0, scorerMetric);

  // هداف كل مسابقة: أهداف مقسومة بحتمية على نطاقات المسابقات.
  const byCompetition = [];
  for (const scope of competitionScopes(s)) {
    const metric = (x) => {
      const f = compFractions(x.p, season, seed);
      return x.stats.goals * f[scope.id] * 100 + x.p.rating;
    };
    const pro = bestBy(eligible((x) => x.stats.goals > 0), metric);
    if (pro) {
      const f = compFractions(pro.p, season, seed);
      byCompetition.push({
        scope: scope.id,
        scopeName: SCORER_SCOPES[scope.id] || scope.id,
        goals: Math.max(1, Math.round(pro.stats.goals * f[scope.id])),
        ...winnerRecord(s, pro),
      });
    }
  }
  awards["top-scorer-competition"] = byCompetition.length ? byCompetition : null;

  // تشكيلة الموسم: 1-4-3-3 بحد أقصى 3 من نادٍ واحد؛ القوائم الصغيرة تُستكمل
  // بأفضل المتبقيين ثم بلا سقف الأندية حتى لا يبقى مقعد شاغر.
  const slots = ["gk", "def", "def", "def", "def", "mid", "mid", "mid", "att", "att", "att"];
  const used = new Map();
  const team = [];
  const pickSlot = (slot, cap) =>
    bestBy(
      eligible(
        (x) =>
          x.slot === slot &&
          (!cap || (used.get(x.p.clubId) || 0) < cap) &&
          !team.some((t) => t.id === x.p.id),
      ),
      overallScore,
    );
  // الأولوية: نفس المركز بسقف الأندية، ثم نفس المركز بلا سقف، ثم أي مقعد.
  for (const slot of slots) {
    const pro =
      pickSlot(slot, 3) ||
      pickSlot(slot, 0) ||
      bestBy(
        eligible((x) => !team.some((t) => t.id === x.p.id) && (used.get(x.p.clubId) || 0) < 3),
        overallScore,
      ) ||
      bestBy(eligible((x) => !team.some((t) => t.id === x.p.id)), overallScore);
    if (!pro) continue;
    team.push({ slot, ...winnerRecord(s, pro) });
    used.set(pro.p.clubId, (used.get(pro.p.clubId) || 0) + 1);
  }
  awards["team-of-season"] = team.length ? team : null;

  pick(
    "golden-glove",
    (x) => x.slot === "gk",
    (x) => x.stats.cleanSheets * 100 + x.stats.avgRating * 10 + x.p.rating,
  );
  pick("assist-king", (x) => x.stats.assists > 0, (x) => x.stats.assists * 100 + x.stats.goals * 10 + x.p.rating);
  pick(
    "best-youngster",
    (x) => x.age <= 21,
    (x) =>
      (x.p.potential || x.p.rating) * 1.35 +
      x.p.rating +
      overallScore(x) * 0.35 +
      ((x.p.careerHistory || []).some((h) =>
        ["academy", "promotion", "dynasty-academy-graduation", "youth"].includes(h.type),
      )
        ? 12
        : 0),
  );

  // أفضل صفقة: انضمام هذا الموسم بأثر يفوق تكلفته.
  const seasonStart =
    s.awards.hall.at(-1)?.date ||
    s.seasonHistory?.at(-1)?.date ||
    s.startDate;
  const transfers = eligible((x) =>
    (x.p.careerHistory || []).some(
      (h) =>
        ["transfer-in", "transfer-ai", "poach-in", "deadline-day"].includes(h.type) &&
        h.date > seasonStart &&
        h.date <= s.date,
    ),
  );
  const transferIds = new Set(transfers.map((x) => x.p.id));
  const transferMetric = (x) => {
    if (!transferIds.has(x.p.id)) return -1e12;
    const entry = (x.p.careerHistory || [])
      .filter((h) => h.date > seasonStart && h.date <= s.date)
      .at(-1);
    const fee = Math.max(1, entry?.fee || x.p.value || 1);
    return (overallScore(x) * 1e6) / fee + x.stats.goals * 2;
  };
  pick("best-transfer", () => transfers.length > 0, transferMetric);

  // أفضل مدرب: مدربك مقابل أسماء السوق الخيالية.
  awards["coach-of-year"] = pickCoachOfYear(s, profiles);
  return awards;
}

function ownCoachSeasonScore(s) {
  const coach = s.management?.coach;
  if (!coach) return null;
  let score = (coach.skill || 60) * 0.55 + (coach.confidence || 50) * 0.35;
  const table = s.table || [];
  const row = table.find((t) => t.clubId === s.clubId);
  if (row?.played) {
    const points = row.points || 0;
    const max = row.played * 3;
    score += (points / Math.max(1, max)) * 55;
  }
  const honours = s.expansion?.champions
    ? Object.values(s.expansion.champions).filter((w) => w === s.clubId).length
    : 0;
  const cupsWon = (s.expansion?.cups || []).filter((c) => c.winner === s.clubId).length;
  score += (honours + cupsWon) * 7;
  return score;
}

function pickCoachOfYear(s, profiles) {
  void profiles;
  const own = s.management?.coach;
  const ownScore = ownCoachSeasonScore(s);
  let best = own ? coachWinnerRecord(own, true, { score: Math.round(ownScore) }) : null;
  let bestScore = ownScore ?? -Infinity;
  for (const c of COACHES) {
    const rivalScore =
      (c.skill || 60) * 0.85 + hashUnit(`${s.seed}:${s.seasonNumber}:${c.id}:coach`) * 42;
    if (rivalScore > bestScore) {
      bestScore = rivalScore;
      best = coachWinnerRecord(c, false, { score: Math.round(rivalScore) });
    }
  }
  return best;
}

function pickCoachOfMonth(s) {
  const own = s.management?.coach;
  const month = s.date.slice(0, 7);
  const ownFixtures = (s.fixtures || []).filter(
    (f) => f.played && f.date.slice(0, 7) === month,
  );
  let ownScore = null;
  if (own) {
    ownScore = (own.skill || 60) * 0.4 + (own.confidence || 50) * 0.25;
    if (ownFixtures.length) {
      const wins = ownFixtures.filter((f) => {
        const home = f.home === s.clubId;
        const ours = home ? f.homeGoals : f.awayGoals;
        const theirs = home ? f.awayGoals : f.homeGoals;
        return ours > theirs;
      }).length;
      ownScore += (wins / ownFixtures.length) * 52;
    }
  }
  let best = own ? coachWinnerRecord(own, true, { score: Math.round(ownScore) }) : null;
  let bestScore = ownScore ?? -Infinity;
  for (const c of COACHES) {
    const rivalScore =
      (c.skill || 60) * 0.72 + hashUnit(`${s.seed}:${month}:${c.id}:coach-month`) * 46;
    if (rivalScore > bestScore) {
      bestScore = rivalScore;
      best = coachWinnerRecord(c, false, { score: Math.round(rivalScore) });
    }
  }
  return best;
}

// ————— الإيقاع الشهري —————
function monthPerformance(s, pro) {
  const p = pro.p;
  const month = s.date.slice(0, 7);
  void month;
  if (pro.playedOwn) {
    const snap = s.awards.monthStats[p.id];
    const now = {
      goals: p.seasonGoals || 0,
      assists: p.seasonAssists || 0,
      cleanSheets: p.seasonCleanSheets || 0,
      ratingSum: p.seasonRatingSum || 0,
      ratingCount: p.seasonRatingCount || 0,
    };
    const from = snap || { goals: 0, assists: 0, cleanSheets: 0, ratingSum: 0, ratingCount: 0 };
    const goals = Math.max(0, now.goals - from.goals);
    const assists = Math.max(0, now.assists - from.assists);
    const cleanSheets = Math.max(0, now.cleanSheets - from.cleanSheets);
    const ratingCount = Math.max(0, now.ratingCount - from.ratingCount);
    const avg = ratingCount
      ? clamp(Math.max(0, now.ratingSum - from.ratingSum) / ratingCount, 4, 10)
      : 6;
    return goals * 9 + assists * 6.5 + cleanSheets * 2 + (avg - 5.5) * 7 + ratingCount * 0.4;
  }
  // تقدير شهري لبقية العالم: حصة من الموسم ± تذبذب حتمي.
  const u = hashUnit(`${s.seed}:${p.id}:month`);
  return (
    (pro.stats.goals * 0.45 + pro.stats.assists * 0.35 + (pro.stats.avgRating - 5.5) * 1.6) *
    (0.55 + u)
  );
}

function snapshotOwnStats(s) {
  ensureAwards(s);
  const snap = {};
  for (const p of s.players) {
    if (p.clubId !== s.clubId || p.status === "retired") continue;
    snap[p.id] = {
      goals: p.seasonGoals || 0,
      assists: p.seasonAssists || 0,
      cleanSheets: p.seasonCleanSheets || 0,
      ratingSum: p.seasonRatingSum || 0,
      ratingCount: p.seasonRatingCount || 0,
      minutes: p.seasonMinutes || 0,
    };
  }
  return snap;
}

export function selectMonthlyWinners(s) {
  ensureAwards(s);
  const profiles = buildProfiles(s);
  const playerPro = bestBy(profiles, (x) => monthPerformance(s, x));
  const player = playerPro
    ? winnerRecord(s, playerPro, {
        score: Math.round(monthPerformance(s, playerPro) * 10) / 10,
      })
    : null;
  return { player, coach: pickCoachOfMonth(s) };
}

export function awardsMonthTick(s) {
  ensureAwards(s);
  const month = s.date.slice(0, 7);
  if (s.awards.monthly.some((m) => m.month === month)) return null;
  // شهر جديد: لقطة انطلاق للشهر ثم اختيار الجوائز عن الأداء الماضي.
  const winners = selectMonthlyWinners(s);
  s.awards.monthly.unshift({ month, ...winners });
  s.awards.monthly = s.awards.monthly.slice(0, MONTHLY_KEEP);
  s.awards.monthStats = snapshotOwnStats(s);

  // خطاف المدرب الشهري: فائزك (لو مدربك) يطلب مراجعة راتبه.
  if (winners.coach?.own) spawnCoachDemand(s, winners.coach, "coach-of-month");
  if (winners.player?.own) {
    const p = s.players.find((x) => x.id === winners.player.id);
    if (p) p.morale = clamp((p.morale || 60) + 4, 0, 100);
    spawnAwardDemand(s, winners.player, "player-of-month");
  }
  message(s, {
    title: "جوائز الشهر",
    body: `لاعب الشهر: ${winners.player?.name || "—"}. مدرب الشهر: ${winners.coach?.name || "—"}. الجوائز معلنة في صفحة الجوائز.`,
    category: "matches",
  });
  return winners;
}

// ————— التصويت الجماهيري —————
function fanCandidates(s, profiles) {
  const top = [...profiles]
    .sort((a, b) => overallScore(b) - overallScore(a) || b.p.rating - a.p.rating)
    .slice(0, 8);
  const ownTop = bestBy(profiles.filter((x) => x.own), overallScore);
  const list = top.slice(0, 5).map((x) => x);
  if (ownTop && !list.some((x) => x.p.id === ownTop.p.id)) list.push(ownTop);
  return list.map((x) => {
    const p = x.p;
    const base = Math.round(
      hashUnit(`${s.seed}:${s.seasonNumber}:fan:${p.id}`) * 42000 +
        (p.rating || 50) * 720 +
        (x.own ? s.fanSupport * 260 : 12000),
    );
    return {
      id: p.id,
      name: p.name,
      nameLatin: p.nameLatin || null,
      clubId: p.clubId,
      clubName: clubNameOf(s, p),
      own: !!x.own,
      base,
    };
  });
}

export function openFanVoteIfNeeded(s) {
  ensureAwards(s);
  if (s.awards.fanVote) return s.awards.fanVote;
  const daysLeft = daysBetween(s.date, s.nextSeasonDate);
  if (daysLeft > 28 || daysLeft < 0) return null;
  const profiles = buildProfiles(s);
  const candidates = fanCandidates(s, profiles);
  if (!candidates.length) return null;
  s.awards.fanVote = {
    season: s.seasonNumber,
    opened: s.date,
    closes: s.nextSeasonDate,
    campaigned: false,
    campaignCost: 250000 + (s.reputation || 50) * 6000,
    candidates,
    closed: false,
    winnerId: null,
  };
  message(s, {
    title: "استفتاء الجماهير مفتوح",
    body: "التصويت على أفضل لاعب هذا الموسم بدأ. افتح صفحة الجوائز لمتابعة المرشحين وإطلاق حملتك الدعائية — التفاعل على السوشيال ودعم الجمهور يصنعان الفارق.",
    category: "events",
  });
  return s.awards.fanVote;
}

export function campaignFanVote(s) {
  ensureAwards(s);
  const vote = s.awards.fanVote;
  assert(vote && !vote.closed, "لا يوجد استفتاء مفتوح الآن.");
  assert(!vote.campaigned, "أطلقت حملتك بالفعل هذا الموسم.");
  const cost = vote.campaignCost;
  assert(s.finance.cash >= cost, "السيولة لا تكفي تكلفة الحملة الدعائية.");
  post(s, -cost, "social-content", "حملة استفتاء الجماهير", uid(s, "fan-campaign"));
  vote.campaigned = true;
  const social = s.staffCorp?.social;
  if (social) {
    social.followers = Math.round((social.followers || 0) * 1.03);
    social.engagement = clamp((social.engagement || 0) + 6, 0, 100);
  }
  s.fanSupport = clamp((s.fanSupport || 0) + 2, 0, 100);
  return vote;
}

function closeFanVote(s) {
  ensureAwards(s);
  const vote = s.awards.fanVote;
  if (!vote || vote.closed) return null;
  const social = s.staffCorp?.social || {};
  const socialFactor =
    clamp(((social.followers || 0) / 2_000_000) * ((social.engagement || 50) / 100), 0, 0.35);
  const fanFactor = clamp((s.fanSupport || 0) / 500, 0, 0.2);
  let winner = null;
  let bestVotes = -1;
  for (const c of vote.candidates) {
    const buzz = 1 + 0.55 * hashUnit(`${s.seed}:${vote.season}:buzz:${c.id}`);
    const boost = vote.campaigned && c.own ? 1.32 + socialFactor + fanFactor : 1;
    c.votes = Math.round(c.base * buzz * boost);
    if (c.votes > bestVotes) {
      bestVotes = c.votes;
      winner = c;
    }
  }
  vote.closed = true;
  vote.winnerId = winner?.id || null;
  return winner ? { ...winner, votes: winner.votes } : null;
}

// ————— الخطافات: الفائز يطلب عقدًا أقوى، والمدرب يطلب راتبًا أعلى —————
export function spawnAwardDemand(s, winnerRec, awardId) {
  ensureAwards(s);
  if (!winnerRec?.own || winnerRec.clubId !== s.clubId) return null;
  const p = s.players.find((x) => x.id === winnerRec.id && x.clubId === s.clubId);
  if (!p || p.status === "retired") return null;
  const key = `${s.seasonNumber}:${p.id}`;
  if (s.awards.demanded.includes(key)) return null;
  s.awards.demanded.push(key);
  const m = message(s, {
    title: `${p.name} يطلب مراجعة عقده بعد الجائزة`,
    body: `الجائزة رفعت القيمة السوقية والمعنويات. ${p.name} يطلب زيادة في الراتب وتحسين بنود العقد. راجع الطلب قبل انتهاء المهلة — الرفض يخفض المعنويات، والقبول يُحدّث العقد فورًا.`,
    category: "transfers",
    required: true,
    kind: "award-demand",
    ref: p.id,
    awardId,
    deadline: addDays(s.date, DEMAND_DEADLINE_DAYS),
    priority: "high",
  });
  return m;
}

export function resolveAwardDemand(s, messageId, choice) {
  ensureAwards(s);
  const m = s.inbox.find((x) => x.id === messageId && x.kind === "award-demand");
  assert(m && m.status === "open", "الطلب غير موجود أو مُغلق.");
  const p = s.players.find((x) => x.id === m.ref && x.clubId === s.clubId);
  assert(p, "اللاعب لم يعد في النادي.");
  if (choice === "refuse") {
    p.morale = clamp((p.morale || 60) - 12, 0, 100);
    message(s, {
      title: "رُفض مطلب العقد",
      body: `${p.name} تلقى الرفض. المعنويات تأثرت وسيحتاج وقتًا ليعود لمستواه.`,
      category: "transfers",
    });
  } else {
    const raise = choice === "raise" ? 0.22 : 0.1;
    const bonusYears = choice === "raise" ? 730 : 365;
    const newSalary = Math.max(p.salary + 1000, Math.round((p.salary * (1 + raise)) / 1000) * 1000);
    assert(
      wages(s) - p.salary + newSalary <= s.finance.wageBudget,
      "ميزانية المرتبات لا تحتمل الزيادة.",
    );
    p.salary = newSalary;
    p.contractEnd =
      p.contractEnd && p.contractEnd > addDays(s.date, bonusYears)
        ? p.contractEnd
        : addDays(s.date, bonusYears);
    p.morale = clamp((p.morale || 60) + (choice === "raise" ? 10 : 5), 0, 100);
    message(s, {
      title: "تحديث عقد الفائز",
      body: choice === "raise"
        ? `قُبلت زيادة ${p.name} وحُسّن العقد. المعنويات في الأعلى.`
        : `حُسّن عقد ${p.name} بالمعقول — اللاعب مرتاح.`,
      category: "transfers",
    });
  }
  m.status = "resolved";
  m.read = true;
  return p;
}

export function spawnCoachDemand(s, winnerRec, awardId) {
  ensureAwards(s);
  const coach = s.management?.coach;
  if (!coach || !winnerRec?.own) return null;
  const key = `coach:${s.seasonNumber}:${awardId}`;
  if (s.awards.demanded.includes(key)) return null;
  s.awards.demanded.push(key);
  return message(s, {
    title: "المدرب يطلب مراجعة راتبه بعد الجائزة",
    body: `${awardId === "coach-of-month" ? "فوزه بجائزة مدرب الشهر" : "فوزه بجائزة أفضل مدرب"} — يطلب المدرب مراجعة راتب وتمديد العقد. جوائز المدربين مرتبطة بعقوده ورواتهبه.`,
    category: "careers",
    required: true,
    kind: "coach-demand",
    ref: coach.id,
    awardId,
    deadline: addDays(s.date, DEMAND_DEADLINE_DAYS),
    priority: "high",
  });
}

export function resolveCoachDemand(s, messageId, choice) {
  ensureAwards(s);
  const m = s.inbox.find((x) => x.id === messageId && x.kind === "coach-demand");
  assert(m && m.status === "open", "الطلب غير موجود أو مُغلق.");
  const coach = s.management?.coach;
  assert(coach, "لا يوجد مدرب الآن.");
  if (choice === "refuse") {
    coach.confidence = clamp((coach.confidence || 50) - 12, 0, 100);
    message(s, {
      title: "رُفض مطلب المدرب",
      body: "الثقة تأثرت بالرفض. النتائج القادمة ستحسم الأمور.",
      category: "careers",
    });
  } else {
    coach.salary = Math.round((coach.salary * 1.18) / 1000) * 1000;
    coach.contractEnd = addDays(coach.contractEnd || s.date, 365);
    coach.confidence = clamp((coach.confidence || 50) + 6, 0, 100);
    message(s, {
      title: "تحديث عقد المدرب",
      body: "رُفِع الراتب وامتد العقد سنة — الثقة أعلى والجهاز مستقر.",
      category: "careers",
    });
  }
  m.status = "resolved";
  m.read = true;
  return coach;
}

function expireAwardDemands(s) {
  ensureAwards(s);
  for (const m of s.inbox) {
    if (m.status !== "open" || !m.deadline) continue;
    if (!["award-demand", "coach-demand"].includes(m.kind)) continue;
    if (m.deadline >= s.date) continue;
    if (m.kind === "award-demand") {
      const p = s.players.find((x) => x.id === m.ref);
      if (p) p.morale = clamp((p.morale || 60) - 8, 0, 100);
    } else {
      const coach = s.management?.coach;
      if (coach) coach.confidence = clamp((coach.confidence || 50) - 8, 0, 100);
    }
    m.status = "resolved";
    m.read = true;
    message(s, {
      title: "انتهت مهلة مطلب بعد الجائزة",
      body: "مرّت المهلة دون رد — الطرف المعني خاب أمله قليلًا.",
      category: "transfers",
    });
  }
}

// ————— الحفل وقاعة المشاهير —————
const CEREMONY_ORDER = [
  "best-player",
  "best-u21",
  "best-african",
  "best-u23-african",
  "best-arab",
  "best-in-africa",
  "top-scorer-season",
  "top-scorer-competition",
  "golden-glove",
  "assist-king",
  "team-of-season",
  "fan-best",
  "best-youngster",
  "best-transfer",
  "coach-of-year",
];

function ceremonySteps(awards) {
  const steps = [];
  for (const id of CEREMONY_ORDER) {
    const value = awards[id];
    if (!value || (Array.isArray(value) && !value.length)) continue;
    steps.push({ awardId: id, value });
  }
  return steps;
}

export function runSeasonAwards(s) {
  ensureAwards(s);
  const season = s.seasonNumber;
  if (s.awards.hall.some((h) => h.season === season)) return null;
  const awards = selectSeasonWinners(s);

  // إغلاق استفتاء الجماهير وتسجيل جائزته ضمن الموسم.
  const fanWinner = closeFanVote(s);
  awards["fan-best"] = fanWinner
    ? { ...fanWinner, score: fanWinner.votes }
    : null;

  // آثار على لاعبيك: المعنويات + خطاف العقد (مرة واحدة لكل لاعب/موسم).
  for (const id of CEREMONY_ORDER) {
    const value = awards[id];
    const recs = Array.isArray(value) ? value : value ? [value] : [];
    for (const rec of recs) {
      if (!rec?.own || rec.clubId !== s.clubId) continue;
      const p = s.players.find((x) => x.id === rec.id && x.clubId === s.clubId);
      if (!p) continue;
      const isTeam = id === "team-of-season";
      p.morale = clamp((p.morale || 60) + (isTeam ? 4 : 8), 0, 100);
      if (!isTeam && id !== "coach-of-year") spawnAwardDemand(s, rec, id);
    }
  }
  // تصويت الجماهير: أثر اجتماعي للفائز من ناديك.
  if (awards["fan-best"]?.own) {
    const social = s.staffCorp?.social;
    if (social) {
      social.followers = Math.round((social.followers || 0) * 1.04);
      social.engagement = clamp((social.engagement || 0) + 5, 0, 100);
    }
    s.fanSupport = clamp((s.fanSupport || 0) + 3, 0, 100);
    message(s, {
      title: "تصاعد التفاعل بعد استفتاء الجماهير",
      body: "الفوز بالاستفتاء أشعل السوشيال وزاد متابعي النادي وتفاعلهم.",
      category: "events",
    });
  }
  // أفضل مدرب: خطاف الراتب.
  if (awards["coach-of-year"]?.own) spawnCoachDemand(s, awards["coach-of-year"], "coach-of-year");

  const record = {
    season,
    date: s.date,
    awards,
  };
  s.awards.hall.unshift(record);
  s.awards.hall = s.awards.hall.slice(0, HALL_KEEP);
  s.awards.ceremony = {
    season,
    date: s.date,
    seen: false,
    steps: ceremonySteps(awards),
  };
  message(s, {
    title: "حفل توزيع جوائز نهاية الموسم",
    body: "اختُتم الموسم بحفل توزيع الجوائز. شاهد الإعلانات وراجع قاعة المشاهير — الفائزون محفوظون في حفظتك عبر المواسم.",
    category: "matches",
    kind: "ceremony",
    ref: season,
  });
  s.awards.fanVote = null;
  return record;
}

export function pendingCeremony(s) {
  ensureAwards(s);
  return s.awards.ceremony && !s.awards.ceremony.seen ? s.awards.ceremony : null;
}

export function markCeremonySeen(s) {
  ensureAwards(s);
  if (!s.awards.ceremony) return false;
  s.awards.ceremony.seen = true;
  return true;
}

export function hallFor(s, season) {
  ensureAwards(s);
  return s.awards.hall.find((h) => h.season === season) || null;
}

// ————— النبض اليومي —————
export function awardsDay(s) {
  ensureAwards(s);
  // أول لمسة بعد الترحيل: الإحصاءات المتراكمة تُحسب لموسمها الحالي بلا قاعدة.
  // تغيّر الموسم لاحقًا: قاعدة انطلاق جديدة (آمنة مع تصفير نهاية الموسم أو استمراره).
  if (s.awards.seasonSeen == null) {
    s.awards.seasonSeen = s.seasonNumber;
  } else if (s.awards.seasonSeen !== s.seasonNumber) {
    s.awards.seasonSeen = s.seasonNumber;
    s.awards.statsBase = snapshotOwnStats(s);
    s.awards.monthStats = snapshotOwnStats(s);
  }
  if (s.date.endsWith("-01")) awardsMonthTick(s);
  expireAwardDemands(s);
  if (!s.awards.fanVote || s.awards.fanVote.closed) openFanVoteIfNeeded(s);
}
