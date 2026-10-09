// المنافس الملياردير 0.29 — مليارديرات ذكاء اصطناعي بثروات تنمو شهريًا،
// قائمة ترتيب متحركة، وسباق شهري (يخت/سيارة/طائرة/سكن/فرح/خير) بمكافآت.
// توليد المنافسين ونموهم حتمي من بذرة الحفظة عبر مولّد محلي لا يستهلك
// عشوائية المباريات.
import { clamp } from "../../core/utils.js";
import { message } from "../inbox.js";
import { empireText } from "../../data/empireTexts.js";
import { RIVAL_POOL, RACE_TYPES, RIVAL_WEALTH_MIN, RIVAL_WEALTH_MAX } from "../../data/empireRivals.js";
import { ensureEmpire, netWorth, registerEmpireMonthHook } from "./wealth.js";
import { assetById } from "../../data/empireAssets.js";

// مولّد خطي محلي: نفس البذرة = نفس المنافسين دائمًا، بلا لمس عشوائية اللعبة.
function makeLcg(seed) {
  let x = (seed >>> 0) || 1;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

export function ensureRivals(s) {
  const e = ensureEmpire(s);
  if (e.rivals.list.length) return e.rivals.list;
  const rnd = makeLcg(s.seed * 7919 + 13);
  e.rivals.list = RIVAL_POOL.map((p, i) => ({
    id: "rival-" + i,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    nameFr: p.nameFr,
    personaAr: p.persona.ar,
    wealth: Math.round(
      RIVAL_WEALTH_MIN + rnd() * (RIVAL_WEALTH_MAX - RIVAL_WEALTH_MIN),
    ),
    growthPct: 0.5 + rnd() * 2, // ٠٫٥٪ … ٢٫٥٪ شهريًا
  }));
  return e.rivals.list;
}

// أعلى سعر مملوك في فئة أصل معينة (يخت/سيارة/طائرة/سكن).
function bestOwnedPrice(s, cat) {
  let best = 0;
  for (const o of s.empire?.assets || []) {
    const def = assetById(o.assetId);
    if (def?.cat === cat && def.price > best) best = def.price;
  }
  return best;
}

// نقاط اللاعب في سباق معين.
export function playerRaceScore(s, raceId) {
  const e = s.empire;
  if (!e) return 0;
  switch (raceId) {
    case "yacht":
      return bestOwnedPrice(s, "yacht");
    case "car":
      return bestOwnedPrice(s, "car");
    case "jet":
      return bestOwnedPrice(s, "jet");
    case "home":
      return bestOwnedPrice(s, "home");
    case "wedding":
      return e.family.wedding?.cost || 0;
    case "charity":
      return e.charity.personalTotal + e.charity.total;
    default:
      return 0;
  }
}

// منافس السباق لهذا الشهر: يدور حتميًا مع رقم الشهر.
function raceForMonth(s) {
  const ym = Number(s.date.slice(0, 4)) * 12 + Number(s.date.slice(5, 7));
  return RACE_TYPES[ym % RACE_TYPES.length];
}

export function currentRace(s) {
  return raceForMonth(s);
}

function resolveRace(s) {
  const e = ensureEmpire(s);
  const race = raceForMonth(s);
  const player = playerRaceScore(s, race.id);
  let best = { name: null, score: -1 };
  for (const r of ensureRivals(s)) {
    const score = Math.round(r.wealth * race.factor);
    if (score > best.score) best = { name: r.nameAr, score };
  }
  const won = player > best.score && player > 0;
  const rec = {
    month: e.lastMonthSettle,
    race: race.id,
    won,
    playerScore: player,
    rivalScore: best.score,
    winnerName: won ? null : best.name,
  };
  e.rivals.history.unshift(rec);
  if (e.rivals.history.length > 24) e.rivals.history.length = 24;
  if (won) {
    e.prestige = clamp(e.prestige + 10, 0, 400);
    e.fame = clamp(e.fame + 5, 0, 100);
    message(s, {
      title: empireText("raceWonTitle"),
      body: empireText("raceWonBody"),
      category: "events",
    });
  } else if (player > 0) {
    message(s, {
      title: empireText("raceLostTitle"),
      body: empireText("raceLostBody"),
      category: "events",
    });
  }
  return rec;
}

// الترتيب الحالي بين المليارديرات (١ = الأغنى).
export function billionaireRank(s) {
  const e = ensureEmpire(s);
  const rivals = ensureRivals(s);
  const mine = netWorth(s);
  const above = rivals.filter((r) => r.wealth > mine).length;
  return above + 1;
}

export function leaderboard(s) {
  const e = ensureEmpire(s);
  const rows = ensureRivals(s).map((r) => ({
    id: r.id,
    nameAr: r.nameAr,
    nameEn: r.nameEn,
    nameFr: r.nameFr,
    wealth: r.wealth,
    you: false,
  }));
  rows.push({
    id: "you",
    nameAr: s.owner,
    nameEn: s.owner,
    nameFr: s.owner,
    wealth: netWorth(s),
    you: true,
  });
  return rows.sort((a, b) => b.wealth - a.wealth);
}

function rivalsMonthHook(s) {
  const e = ensureEmpire(s);
  const rnd = makeLcg(s.seed * 31 + Number(e.lastMonthSettle?.replace("-", "") || 1));
  for (const r of ensureRivals(s)) {
    const drift = (rnd() - 0.5) * 1.2; // ±٠٫٦٪ حول معدل نموّه
    r.wealth = Math.max(1_000_000, Math.round(r.wealth * (1 + (r.growthPct + drift) / 100)));
  }
  const rec = resolveRace(s);
  e.rankThisMonth = billionaireRank(s);
  return { rank: e.rankThisMonth, raceWon: rec.won };
}
registerEmpireMonthHook(rivalsMonthHook);
