// تقارير المباريات 0.22b — تُبنى عند الطلب من بيانات المباراة الملعوبة نفسها، لكل مباريات
// ناديك (دوري أو كأس) عبر ownFixtures، دون تعديل محركات المحاكاة أو تضخيم ملف الحفظة.
// الأحداث والإحصائيات وتقييمات اللاعبين تُولَّد بشكل حتمي (بذرة ثابتة من هوية المباراة)،
// فتبقى نفسها عند كل إعادة عرض، وهي تقديرات عرض وليست محاكاة تفصيلية إضافية.
import { selectXI } from "./tactics.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { cupFixtures, ownFixtures } from "./calendar.js";
import { STAGE_NAMES } from "./competitions/presets.js";


// بذرة حتمية: hash بسيط لسلسلة ثم mulberry32 — نفس المباراة تعطي نفس التقرير دائمًا.
function seedFrom(text) {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// اسم المسابقة التي تنتمي إليها المباراة (بحث واحد عند بناء التقرير فقط).
function competitionOf(s, f) {
  if (f.competition) return f.competition;
  if (!s.expansion) return "دوري تجريبي";
  for (const d of s.expansion.divisions)
    if (d.fixtures.some((x) => x.id === f.id)) return d.name;
  for (const c of s.expansion.cups)
    if (cupFixtures(c).some((x) => x.id === f.id)) return c.name;
  for (const p of s.expansion.playoffs || [])
    if (p.fixtures.some((x) => x.id === f.id)) return p.name || "الملحق";
  return "الدوري المحلي";
}

// قوة تقريبية للفريق: متوسط تقييم أفضل 11، أو تقدير السمعة للأندية بلا قوائم.
function sidePower(s, clubId, xi) {
  if (clubId === s.clubId) {
    const list = xi.length ? xi.map((x) => x.p) : [];
    if (list.length) return list.reduce((n, p) => n + p.rating, 0) / list.length;
  }
  const squad = s.players.filter(
    (p) => p.clubId === clubId && p.status !== "retired",
  );
  if (squad.length >= 11)
    return (
      squad
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 11)
        .reduce((n, p) => n + p.rating, 0) / 11
    );
  return extendedClub(clubId).rep * 0.65 + 22;
}

const weightedScorer = (rng, xi) => {
  const weights = xi.map((x) => Math.max(4, x.p.rating - 40));
  let r = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < xi.length; i++) {
    r -= weights[i];
    if (r <= 0) return xi[i].p;
  }
  return xi[xi.length - 1].p;
};
const minutesFor = (rng, count, extraTime) => {
  const set = new Set();
  const span = extraTime ? 120 : 90;
  while (set.size < count) set.add(1 + Math.floor(rng() * span));
  return [...set].sort((a, b) => a - b);
};
const clamp10 = (v) => Math.max(4, Math.min(10, v));

export function buildMatchReport(s, f) {
  const rng = seedFrom(f.id + "|" + f.date + "|" + f.homeGoals + "-" + f.awayGoals);
  const home = f.home === s.clubId,
    ours = home ? f.homeGoals : f.awayGoals,
    theirs = home ? f.awayGoals : f.homeGoals,
    xi = lineupOf(s, f),
    bench = s.players
      .filter((p) => p.clubId === s.clubId && p.status !== "retired")
      .sort((a, b) => b.rating - a.rating)
      .filter((p) => !xi.some((x) => x.p.id === p.id))
      .slice(0, 3);
  const events = [];
  // أهدافنا: دقائق مرتبة وهدافون بأوزان التقييم؛ أهداف المنافس: بالدقيقة فقط (بلا قوائم لمعظم الأندية).
  for (const min of minutesFor(rng, ours, f.extraTime)) {
    const scorer = xi.length ? weightedScorer(rng, xi) : null;
    // 0.24: assister — pick a different teammate deterministically.
    let assisterId = null;
    if (scorer && xi.length > 1) {
      let a = xi[Math.floor(rng() * xi.length)];
      if (a.p.id === scorer.id) a = xi.find((x) => x.p.id !== scorer.id) || a;
      assisterId = a.p.id;
    }
    events.push({
      min,
      type: "goal",
      playerId: scorer?.id || null,
      assistId: assisterId,
      clubId: s.clubId,
    });
  }
  for (const min of minutesFor(rng, theirs, f.extraTime))
    events.push({
      min,
      type: "goal",
      playerId: null,
      clubId: home ? f.away : f.home,
    });
  // بطاقات: تُستخدم قيم المحرك إن وُجدت (مرحلة المجموعات القارية)، وإلا فتوليد حتمي.
  const ourYellows = f.homeYellows ?? Math.floor(rng() * 3),
    ourReds = f.homeReds ?? (rng() < 0.05 ? 1 : 0);
  for (let i = 0; i < ourYellows + ourReds && xi.length; i++)
    events.push({
      min: 20 + Math.floor(rng() * 70),
      type: i < ourYellows ? "yellow" : "red",
      playerId: pick(rng, xi).p.id,
      clubId: s.clubId,
    });
  // تبديلات واقعية في الشوط الثاني من دكة البدلاء.
  for (let i = 0; i < Math.min(3, bench.length); i++)
    events.push({
      min: 58 + Math.floor(rng() * 25),
      type: "sub",
      out: xi.length ? pick(rng, xi).p.id : null,
      playerId: bench[i].id,
      clubId: s.clubId,
    });
  events.sort((a, b) => a.min - b.min);
  // إحصائيات تقديرية من فرق القوة مع تذبذب حتمي.
  const ourPower = sidePower(s, s.clubId, xi),
    oppPower = sidePower(s, home ? f.away : f.home, []);
  const edge = (ourPower - oppPower) / 30;
  const ourShots = Math.max(3, Math.round(9 + edge * 3 + rng() * 6)),
    oppShots = Math.max(2, Math.round(8 - edge * 3 + rng() * 6));
  const stats = {
    possession: Math.round(Math.max(25, Math.min(75, 50 + edge * 9 + (rng() * 8 - 4)))),
    ourShots,
    oppShots,
    ourOn: Math.max(1, Math.round(ourShots * (0.35 + rng() * 0.25))),
    oppOn: Math.max(1, Math.round(oppShots * (0.35 + rng() * 0.25))),
    ourCorners: Math.round(3 + rng() * 6),
    oppCorners: Math.round(2 + rng() * 6),
    ourFouls: Math.round(7 + rng() * 8),
    oppFouls: Math.round(7 + rng() * 8),
  };
  // تقييمات: أساس من مستوى اللاعب + نتيجة المباراة + أهدافه + تذبذب حتمي.
  const goalsBy = {};
  for (const e of events)
    if (e.type === "goal" && e.playerId) goalsBy[e.playerId] = (goalsBy[e.playerId] || 0) + 1;
  const delta = ours > theirs ? 0.7 : ours === theirs ? 0 : -0.5;
  const ratings = xi.map((x) => {
    const g = goalsBy[x.p.id] || 0;
    return {
      playerId: x.p.id,
      slot: x.slot,
      rating: clamp10(
        Math.round(
          (5.9 +
            (x.p.rating - 60) / 22 +
            delta +
            g * 0.5 +
            (rng() * 0.9 - 0.45)) *
            10,
        ) / 10,
      ),
      goals: g,
    };
  });
  const mvp = ratings.slice().sort((a, b) => b.rating - a.rating)[0];
  if (mvp) mvp.mvp = true;
  return {
    id: f.id,
    date: f.date,
    competition: competitionOf(s, f),
    stage: f.stage ? STAGE_NAMES[f.stage] || f.stage : "",
    home: f.home,
    away: f.away,
    homeGoals: f.homeGoals,
    awayGoals: f.awayGoals,
    neutral: !!f.neutral,
    extraTime: !!f.extraTime,
    penaltyWinner: f.penaltyWinner || null,
    attendance: f.attendance || null,
    events,
    stats,
    ratings,
  };
}

// التشكيل الفعلي للمباراة إن سجله المحرك (الخطة المفعلة)، وإلا فتشكيل اليوم الحالي.
function lineupOf(s, f) {
  if (Array.isArray(f.lineup) && f.lineup.length) {
    const xi = f.lineup
      .map((x) => {
        const p = s.players.find((y) => y.id === x.playerId);
        return p && p.status !== "retired" ? { p, slot: x.slot, fit: (x.fit || 100) / 100 } : null;
      })
      .filter(Boolean);
    if (xi.length >= 7) return xi;
  }
  return selectXI(s).filter((x) => x.p.status !== "retired");
}

// مباريات ناديك الملعوبة — تُقرأ من تقويم اللعبة الموحد وقت العرض فقط.
export const playedOwnFixtures = (s) =>
  ownFixtures(s).filter((f) => f.played && Number.isFinite(f.homeGoals));
export const lastPlayedFixture = (s) => {
  const list = playedOwnFixtures(s);
  return list.length ? list[list.length - 1] : null;
};
export const reportFor = buildMatchReport;
