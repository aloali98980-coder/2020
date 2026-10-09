// المدير الرياضي: فلسفة (شباب/نجوم/صفقات ذكية) + سلايدر صلاحيات + سجل قرارات + تقييم موسمي.
// بحرية ≥٧٠ ينفّذ بنفسه ضمن سقف تلقائي معلن؛ دونها يعرض صفقات معلّقة توافق/ترفض.
import { assert, clamp, addDays, uid } from "../../core/utils.js";
import { message } from "../inbox.js";
import { post } from "../finance.js";
import { squad } from "../../models/player.js";
import { SPORTING_PHILOSOPHIES } from "../../data/staffCatalog.js";
import { ensureStaffCorp, corpEmployees, corpSkill, srng } from "./staffCorp.js";

export const sportingDirector = (s) =>
  corpEmployees(s).find((e) => e.role === "sporting") || null;
export const philNameAr = (p) => SPORTING_PHILOSOPHIES[p]?.name.ar || p;

export function setPhilosophy(s, phil) {
  assert(SPORTING_PHILOSOPHIES[phil], "فلسفة غير صالحة.");
  ensureStaffCorp(s).sporting.philosophy = phil;
  sportingLog(s, `اعتمدت فلسفة ${philNameAr(phil)}.`, "info");
  return phil;
}
export function setFreedom(s, v) {
  assert(Number.isInteger(v) && v >= 0 && v <= 100, "الصلاحيات من ٠ إلى ١٠٠.");
  ensureStaffCorp(s).sporting.freedom = v;
  return v;
}
export function sportingLog(s, text, kind = "info") {
  const c = ensureStaffCorp(s);
  c.sporting.log.unshift({ date: s.date, text, kind });
  c.sporting.log = c.sporting.log.slice(0, 40);
}
const seasonStats = (s) => {
  const c = ensureStaffCorp(s);
  if (!c.sporting.season || c.sporting.season.season !== s.seasonNumber)
    c.sporting.season = { season: s.seasonNumber, proposed: 0, auto: 0, approved: 0, rejected: 0, expired: 0, spent: 0, earned: 0, boughtRating: 0, boughtCount: 0 };
  return c.sporting.season;
};

// سوق اللاعبين المتاح: نشط، خارج ناديك، بقيمة معقولة.
const marketPool = (s) =>
  (s.players || []).filter((p) => p.status !== "retired" && p.clubId !== s.clubId && !p.loan);
// خصم التفاوض بمهارة المدير: حتى ~٢٨٪ من القيمة.
export const negotiatedFee = (s, player) => {
  const skill = corpSkill(s, "sporting");
  return Math.max(Math.round(player.value * 0.5), Math.round(player.value * (1 - skill * 0.003)));
};
export const negotiatedWage = (s, player) => {
  const skill = corpSkill(s, "sporting");
  return Math.max(Math.round(player.salary * 0.7), Math.round(player.salary * (1 - skill * 0.002)));
};
const pickTarget = (s, phil) => {
  const pool = marketPool(s).filter((p) => p.value > 0 && p.value < 400_000_000);
  if (!pool.length) return null;
  const scored = pool.map((p) => {
    let score = 0;
    if (phil === "youth") {
      if (p.age > 22) return { p, score: -1 };
      score = p.potential * 2 - p.value / 1_000_000;
    } else if (phil === "stars") {
      if (p.rating < 75) return { p, score: -1 };
      score = p.rating * 3 - p.value / 5_000_000;
    } else {
      const expiring = p.contractEnd && p.contractEnd <= addDays(s.date, 180) ? 30 : 0;
      score = (p.rating + p.potential / 2) / Math.max(1, p.value / 1_000_000) + expiring;
    }
    return { p, score: score + srng(s) * 5 };
  }).filter((x) => x.score > 0);
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].p;
};
// فائض للبيع: أجر مرتفع لقيمة متواضعة، أو نجم كبير في فلسفة الشباب.
const pickSale = (s, phil) => {
  const own = squad(s).filter((p) => p.value > 500_000 && (!p.injuryUntil || p.injuryUntil < s.date));
  if (own.length <= 16) return null;
  const scored = own.map((p) => {
    let score = (p.salary / Math.max(1, p.value)) * 1_000_000 + Math.max(0, p.age - 30) * 4;
    if (phil === "youth" && p.rating >= 78 && p.age >= 29) score += 60;
    if (phil === "stars" && p.rating < 70) score += 25;
    return { p, score: score + srng(s) * 10 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].p;
};
export const saleFee = (s, player) => {
  const skill = corpSkill(s, "sporting");
  return Math.round(player.value * (0.9 + skill / 500));
};
// سقف التنفيذ التلقائي معلن: أساس + الصلاحيات + ميزانية المجلس المعتمدة.
export const autoCap = (s) => {
  const c = ensureStaffCorp(s);
  return Math.round(3_000_000 + c.sporting.freedom * 100_000 + c.sporting.budget);
};

function executeBuy(s, player, fee, wage, auto) {
  const st = seasonStats(s);
  assert(s.finance.cash >= fee, "السيولة لا تغطي الصفقة.");
  assert(squad(s).length < (s.squadLimit || 30), "القائمة ممتلئة.");
  assert((s.finance.wageBudget || 0) >= wage, "الراتب يتجاوز ميزانية المرتبات.");
  post(s, -fee, "transfer", `شراء ${player.name} (المدير الرياضي)`, uid(s, "sp-buy"));
  player.clubId = s.clubId;
  player.salary = wage;
  player.contractEnd = addDays(s.date, 1095);
  player.morale = 70;
  st.spent += fee;
  st.boughtRating += player.rating;
  st.boughtCount += 1;
  if (auto) st.auto += 1;
  sportingLog(s, `${auto ? "نفّذ" : "أتمّ"} شراء ${player.name} (${player.rating}) بـ${fee.toLocaleString()}.`, "buy");
  message(s, {
    title: `${auto ? "صفقة تلقائية" : "تمت الصفقة"}: ${player.name}`,
    body: `المدير الرياضي ${auto ? "نفّذ بحريته" : "أتمّ بعد موافقتك"} شراء ${player.name} مقابل ${fee.toLocaleString()} وراتب ${wage.toLocaleString()}.`,
    category: "transfers",
  });
  return player;
}
function executeSale(s, player, fee, buyer, auto) {
  const st = seasonStats(s);
  post(s, fee, "transfer", `بيع ${player.name} إلى ${buyer} (المدير الرياضي)`, uid(s, "sp-sell"));
  player.clubId = buyer;
  st.earned += fee;
  if (auto) st.auto += 1;
  sportingLog(s, `${auto ? "نفّذ" : "أتمّ"} بيع ${player.name} بـ${fee.toLocaleString()}.`, "sell");
  message(s, {
    title: `بيع ${player.name}`,
    body: `انتقل إلى ${buyer} مقابل ${fee.toLocaleString()}.${auto ? " نفّذها المدير الرياضي بحريته." : ""}`,
    category: "transfers",
  });
  return player;
}
const buyerClub = (s) => {
  const clubs = [...new Set(marketPool(s).map((p) => p.clubId))].filter((c) => c && c !== "لاعب حر");
  return clubs.length ? clubs[Math.floor(srng(s) * clubs.length)] : "لاعب حر";
};

function proposeDeal(s, kind, player, fee, wageOrBuyer) {
  const c = ensureStaffCorp(s);
  const st = seasonStats(s);
  st.proposed += 1;
  const deal = {
    id: uid(s, "deal"), kind, playerId: player.id, name: player.name,
    rating: player.rating, age: player.age, fee,
    wage: kind === "buy" ? wageOrBuyer : null,
    buyer: kind === "sell" ? wageOrBuyer : null,
    status: "pending", date: s.date, expires: addDays(s.date, 14),
  };
  c.deals.push(deal);
  c.deals = c.deals.slice(-20);
  sportingLog(s, `اقترح ${kind === "buy" ? "شراء" : "بيع"} ${player.name} بـ${fee.toLocaleString()} — بانتظار إذنك.`, "proposal");
  return deal;
}

// تقييم موسم مخزّن (يكمل/يُفصل): يُحسم مع أول شهر من الموسم التالي في كل الأطوار.
export function rateStoredSeason(s, st) {
  const c = ensureStaffCorp(s);
  if (!st || c.sporting.rating?.season === st.season) return c.sporting.rating;
  const deals = st.auto + st.approved;
  const avgBought = st.boughtCount ? st.boughtRating / st.boughtCount : 0;
  const profit = st.earned - st.spent;
  const rating = clamp(
    Math.round(40 + deals * 6 + (avgBought >= 75 ? 12 : avgBought >= 68 ? 6 : 0) + clamp(profit / 5_000_000, -10, 15)),
    0, 100,
  );
  c.sporting.rating = { season: st.season, rating, deals, profit };
  const dir = sportingDirector(s);
  sportingLog(s, `تقييم الموسم ${st.season}: ${rating}/١٠٠ (${deals} صفقات، صافي ${profit.toLocaleString()}).`, "rating");
  message(s, {
    title: `تقييم المدير الرياضي (موسم ${st.season}): ${rating}/١٠٠`,
    body: `${deals} صفقات منفذة بصافي ${profit.toLocaleString()}. ${rating >= 60 ? "يستحق أن يكمل." : rating >= 40 ? "موسم متذبذب — القرار لك." : "موسم كارثي — يُنصح بفصله وتعيين بديل."}${dir ? ` ولاؤه ${dir.loyalty}٪.` : ""}`,
    category: "transfers", priority: rating < 40 ? "high" : "normal",
  });
  return c.sporting.rating;
}
// النبض الشهري: اقتراح شراء + بيع، وتنفيذ تلقائي بحسب الصلاحيات.
export function sportingMonth(s) {
  const dir = sportingDirector(s);
  if (!dir) return null;
  const c = ensureStaffCorp(s);
  if (c.sporting.season && c.sporting.season.season < s.seasonNumber)
    rateStoredSeason(s, c.sporting.season);
  const phil = c.sporting.philosophy, freedom = c.sporting.freedom;
  const cap = autoCap(s);
  // صفقة شراء
  const target = pickTarget(s, phil);
  if (target) {
    const fee = negotiatedFee(s, target), wage = negotiatedWage(s, target);
    const affordable = s.finance.cash >= fee && squad(s).length < (s.squadLimit || 30);
    if (freedom >= 70 && fee <= cap && affordable) {
      try { executeBuy(s, target, fee, wage, true); } catch { proposeDeal(s, "buy", target, fee, wage); }
    } else proposeDeal(s, "buy", target, fee, wage);
  }
  // صفقة بيع
  const surplus = pickSale(s, phil);
  if (surplus) {
    const fee = saleFee(s, surplus), buyer = buyerClub(s);
    if (freedom >= 70 && fee <= cap * 2) {
      try { executeSale(s, surplus, fee, buyer, true); } catch { proposeDeal(s, "sell", surplus, fee, buyer); }
    } else proposeDeal(s, "sell", surplus, fee, buyer);
  }
  const pending = c.deals.filter((d) => d.status === "pending").length;
  if (pending)
    message(s, {
      title: `المدير الرياضي يقترح ${pending} صفقات`,
      body: `الفلسفة: ${philNameAr(phil)} — الصلاحيات ${freedom}٪. راجع السجل ووافق أو ارفض من تبويب المدير الرياضي.`,
      category: "transfers",
    });
  return pending;
}
export function resolveDeal(s, dealId, approve) {
  const c = ensureStaffCorp(s);
  const d = c.deals.find((x) => x.id === dealId);
  assert(d?.status === "pending", "الصفقة محسومة أو منتهية.");
  const st = seasonStats(s);
  const dir = sportingDirector(s);
  if (!approve) {
    d.status = "rejected";
    st.rejected += 1;
    if (dir) dir.loyalty = Math.max(0, dir.loyalty - 2);
    sportingLog(s, `رفضت ${d.kind === "buy" ? "شراء" : "بيع"} ${d.name}.`, "info");
    return d;
  }
  const player = s.players.find((p) => p.id === d.playerId);
  assert(player, "اللاعب لم يعد متاحًا.");
  if (d.kind === "buy") {
    assert(player.clubId !== s.clubId, "اللاعب في ناديك بالفعل.");
    executeBuy(s, player, d.fee, d.wage, false);
  } else {
    assert(player.clubId === s.clubId, "اللاعب غادر ناديك.");
    executeSale(s, player, d.fee, d.buyer, false);
  }
  d.status = "done";
  st.approved += 1;
  return d;
}
// انتهاء الصلاحية + التقييم الموسمي (يكمل / يُنصح بفصله).
export function sportingDay(s) {
  const c = s.staffCorp;
  if (!c) return;
  for (const d of c.deals) {
    if (d.status === "pending" && d.expires < s.date) {
      d.status = "expired";
      if (c.sporting.season?.season === s.seasonNumber) c.sporting.season.expired += 1;
    }
  }
  c.deals = c.deals.filter((d) => d.status === "pending" || d.date >= addDays(s.date, -90));
}
export function sportingSeasonRating(s) {
  const c = ensureStaffCorp(s);
  const st = c.sporting.season;
  if (!st || st.season !== s.seasonNumber) return c.sporting.rating;
  return rateStoredSeason(s, st);
}
