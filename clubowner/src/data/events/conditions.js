// بوّابات العرض ومحدِّدات الفئات — 0.25 «نظام الأحداث الموسّع».
//
// القاعدة الحاكمة: لا يُعرض حدث إلا إذا كان ما يتحدث عنه موجودًا فعلًا في الحفظ.
// كل دالة هنا تأخذ الحفظ `s` وتعيد boolean، ولا ترمي أبدًا: الحقول الاختيارية
// (press / expansion / legends / talent / retired) تُفحص دفاعيًا لأن الحفظات
// الكلاسيكية لا تحملها، والحفظات الموسعة تحملها.
//
// هذه الوحدة بيانات شرطية فقط: لا تعدّل الحالة ولا تستدعي الخدمات ذات الأثر،
// كي تبقى قابلة للاختبار بمعزل عن المحرك (انظر tests/events-expansion.test.js).
import { squad } from "../../models/player.js";
import { inInternationalWindow, ownFixtures } from "../../services/calendar.js";
import { addDays, daysBetween } from "../../core/utils.js";

// ── القائمة ────────────────────────────────────────────────────────────────
export const ownSquad = (s) => squad(s);
export const squadSize = (s) => ownSquad(s).length;
export const limitOf = (s) => s.squadLimit || 30;
export const hasRoom = (s) => squadSize(s) < limitOf(s);
export const roomFor = (n) => (s) => squadSize(s) + n <= limitOf(s);
export const squadFull = (s) => squadSize(s) >= limitOf(s);
export const squadAtLeast = (n) => (s) => squadSize(s) >= n;

// فئات اللاعبين — تُستعمل في الآثار الموجَّهة (targets) وفي البوابات معًا.
export const scopes = {
  all: (s) => ownSquad(s),
  veterans: (s) => ownSquad(s).filter((p) => p.age >= 32),
  youngsters: (s) => ownSquad(s).filter((p) => p.age <= 21),
  keepers: (s) => ownSquad(s).filter((p) => p.position === "GK"),
  strikers: (s) => ownSquad(s).filter((p) => p.position === "ST"),
  defenders: (s) => ownSquad(s).filter((p) => ["CB", "RB", "LB"].includes(p.position)),
  midfielders: (s) => ownSquad(s).filter((p) => ["DM", "CM", "AM"].includes(p.position)),
  lowRated: (s) => ownSquad(s).filter((p) => p.rating < 62),
  topRated: (s) => ownSquad(s).filter((p) => p.rating >= 74),
  lowMorale: (s) => ownSquad(s).filter((p) => p.morale < 55),
  tired: (s) => ownSquad(s).filter((p) => p.fitness < 70),
  injured: (s) => ownSquad(s).filter((p) => p.injuryUntil && p.injuryUntil >= s.date),
  fit: (s) => ownSquad(s).filter((p) => !p.injuryUntil || p.injuryUntil < s.date),
  expiring: (s) =>
    ownSquad(s).filter((p) => p.contractEnd && p.contractEnd <= addDays(s.date, 90)),
  abroad: (s) =>
    ownSquad(s).filter((p) => p.internationalUntil && p.internationalUntil >= s.date),
};
export const scopeIds = Object.freeze(Object.keys(scopes));
export const inScope = (s, scope) => (scopes[scope] ? scopes[scope](s) : []);
export const scopeNonEmpty = (scope) => (s) => inScope(s, scope).length > 0;

// ── المال ──────────────────────────────────────────────────────────────────
export const cashOf = (s) => s.finance.cash;
export const cashAtLeast = (n) => (s) => s.finance.cash >= n;
export const cashBelow = (n) => (s) => s.finance.cash < n;
export const wageBudgetAtLeast = (n) => (s) => (s.finance.wageBudget || 0) >= n;
export const hasLoan = (s) => (s.finance.loans || []).length > 0;
export const loanRoom = (s) => (s.finance.loans || []).length < 2;
export const pendingCosts = (s) =>
  (s.finance.obligations || []).filter(
    (o) => o.status === "pending" && o.category !== "sponsor-income",
  ).length;
export const hasPendingCosts = (s) => pendingCosts(s) > 0;

// ── الجمهور والسمعة ────────────────────────────────────────────────────────
export const fansAtLeast = (n) => (s) => (s.fanSupport || 0) >= n;
export const fansBelow = (n) => (s) => (s.fanSupport || 0) < n;
export const repAtLeast = (n) => (s) => (s.reputation || 0) >= n;
export const repBelow = (n) => (s) => (s.reputation || 0) < n;
export const ticketAtLeast = (n) => (s) => (s.ticketPrice || 0) >= n;
export const ticketBelow = (n) => (s) => (s.ticketPrice || 0) < n;
export const capacityAtLeast = (n) => (s) => (s.capacity || 0) >= n;

// ── المنشآت والجهاز ────────────────────────────────────────────────────────
export const facility = (s, id) => (s.facilities || []).find((f) => f.id === id);
export const facilityLevel = (s, id) => facility(s, id)?.level || 0;
export const facilityFree = (id) => (s) => {
  const f = facility(s, id);
  return Boolean(f) && !f.project && f.level < 4;
};
export const facilityBusy = (id) => (s) => Boolean(facility(s, id)?.project);
export const facilityLevelAtLeast = (id, n) => (s) => facilityLevel(s, id) >= n;
export const staffCount = (s) =>
  (s.staff || []).filter((p) => p.status === "employed").length;
export const hasStaff = (s) => staffCount(s) > 0;
export const hasRole = (role) => (s) =>
  (s.staff || []).some((p) => p.status === "employed" && p.role === role);
export const noRole = (role) => (s) => !hasRole(role)(s);

// ── الرعايات والسوق ────────────────────────────────────────────────────────
export const activeSponsors = (s) =>
  (s.sponsors || []).filter((c) => c.status === "active");
export const hasActiveSponsor = (s) => activeSponsors(s).length > 0;
export const freeAsset = (assetId) => (s) =>
  !(s.sponsors || []).some((c) => c.assetId === assetId && c.status === "active");
export const hasNegotiation = (s) => (s.negotiations || []).length > 0;
export const noNegotiation = (s) => (s.negotiations || []).length === 0;
export const marketPlayers = (s) =>
  (s.players || []).filter((p) => p.clubId !== s.clubId && p.status !== "retired");
export const hasMarket = (s) => marketPlayers(s).length > 0;

// ── المسيرة والأساطير ──────────────────────────────────────────────────────
export const retiredCount = (s) => (s.retired || []).length;
export const hasRetired = (s) => retiredCount(s) > 0;
export const legendsState = (s) => s.legends || null;
export const hasLegends = (s) => Boolean(s.legends);
export const hallCount = (s) => s.legends?.hall?.length || 0;
export const hasHall = (s) => hallCount(s) > 0;
export const legendContracts = (s) => s.legends?.contracts?.length || 0;
export const hasLegendContract = (s) => legendContracts(s) > 0;
export const legendsPlayerMode = (s) => Boolean(s.legends?.playerMode);

// ── البطاقات: لا حدث عن بطولة لست مشاركًا فيها ─────────────────────────────
export const cups = (s) => (s.expansion && Array.isArray(s.expansion.cups) ? s.expansion.cups : []);
export const hasExpansion = (s) => Boolean(s.expansion);
export const cupById = (s, id) => cups(s).find((c) => c.id === id);
export const enteredCup = (engine) => (s) =>
  cups(s).some((c) => c.engine === engine && (c.entrants || []).includes(s.clubId));
export const aliveInCup = (engine) => (s) =>
  cups(s).some((c) => c.engine === engine && (c.alive || []).includes(s.clubId));
export const aliveInAnyCup = (s) =>
  cups(s).some((c) => (c.alive || []).includes(s.clubId));
export const outEveryCup = (s) =>
  cups(s).length > 0 && !cups(s).some((c) => (c.alive || []).includes(s.clubId));
export const hasTalent = (s) => Boolean(s.talent);

// ── الجدول والمباريات ──────────────────────────────────────────────────────
export const playedAny = (s) => (s.table || []).some((r) => (r.played || 0) > 0);
export const tableRow = (s) => (s.table || []).find((r) => r.clubId === s.clubId);
export const tableRank = (s) => {
  const rows = (s.table || []).filter((r) => (r.played || 0) > 0);
  if (!rows.length) return 0;
  const ordered = [...rows].sort(
    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga),
  );
  const i = ordered.findIndex((r) => r.clubId === s.clubId);
  return i < 0 ? 0 : i + 1;
};
export const topOfTable = (s) => tableRank(s) > 0 && tableRank(s) <= 2;
export const bottomOfTable = (s) => {
  const rows = (s.table || []).filter((r) => (r.played || 0) > 0);
  const rank = tableRank(s);
  return rows.length >= 6 && rank > rows.length - 3;
};
export const nextOwnFixture = (s) => {
  const list = ownFixtures(s).filter((f) => !f.played && f.date >= s.date);
  if (!list.length) return null;
  return list.reduce((a, b) => (a.date <= b.date ? a : b));
};
export const fixtureWithin = (days) => (s) => {
  const f = nextOwnFixture(s);
  return Boolean(f) && daysBetween(s.date, f.date) <= days;
};
export const noFixtureWithin = (days) => (s) => !fixtureWithin(days)(s);
export const lastResultLost = (s) => {
  const played = ownFixtures(s).filter((f) => f.played && f.date <= s.date);
  if (!played.length) return false;
  const last = played.reduce((a, b) => (a.date >= b.date ? a : b));
  const gf = last.home === s.clubId ? last.homeGoals : last.awayGoals;
  const ga = last.home === s.clubId ? last.awayGoals : last.homeGoals;
  return Number.isFinite(gf) && Number.isFinite(ga) && gf < ga;
};
export const lastResultWon = (s) => {
  const played = ownFixtures(s).filter((f) => f.played && f.date <= s.date);
  if (!played.length) return false;
  const last = played.reduce((a, b) => (a.date >= b.date ? a : b));
  const gf = last.home === s.clubId ? last.homeGoals : last.awayGoals;
  const ga = last.home === s.clubId ? last.awayGoals : last.homeGoals;
  return Number.isFinite(gf) && Number.isFinite(ga) && gf > ga;
};

// ── التقويم والطقس ─────────────────────────────────────────────────────────
export const monthOf = (s) => Number(s.date.slice(5, 7));
export const inWindow = (s) => inInternationalWindow(s.date);
export const notInWindow = (s) => !inInternationalWindow(s.date);
export const internationalsAway = (s) => scopes.abroad(s).length > 0;
// طقس مصر: حرّ شديد ٦–٨، أمطار/رياح ١٢–٢، معتدل في بينهما.
export const hotSeason = (s) => [6, 7, 8].includes(monthOf(s));
export const rainySeason = (s) => [11, 12, 1, 2].includes(monthOf(s));
export const mildSeason = (s) => !hotSeason(s) && !rainySeason(s);
export const seasonStarted = (s) => (s.seasonNumber || 1) >= 1 && playedAny(s);

// ── الصحافة ────────────────────────────────────────────────────────────────
export const hasPress = (s) => Boolean(s.press && Array.isArray(s.press.news));
export const noPress = (s) => !hasPress(s);

// ── تركيب الشروط ───────────────────────────────────────────────────────────
export const all = (...fns) => (s) => fns.every((f) => f(s));
export const any = (...fns) => (s) => fns.some((f) => f(s));
export const not = (fn) => (s) => !fn(s);
export const always = () => true;

// ── نتائج وسلاسل: ربط بعواقب المباريات (0.22) ─────────────────────────────
// كل ما هنا يُقرأ من المباريات الملعوبة المحفوظة في `s.fixtures`؛ لا حالة جديدة.
const playedOwnSorted = (s) =>
  ownFixtures(s)
    .filter((f) => f.played && f.date <= s.date)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
export const lastPlayedOwn = (s) => playedOwnSorted(s)[0] || null;
export const opponentOf = (s, f) => (f.home === s.clubId ? f.away : f.home);
// فارق الأهداف من منظور النادي (+ فوز، − خسارة)، و0 إن كانت النتيجة غير مسجلة.
export const marginOf = (s, f) => {
  const gf = f.home === s.clubId ? f.homeGoals : f.awayGoals;
  const ga = f.home === s.clubId ? f.awayGoals : f.homeGoals;
  return Number.isFinite(gf) && Number.isFinite(ga) ? gf - ga : 0;
};
export const lastMargin = (s) => {
  const f = lastPlayedOwn(s);
  return f ? marginOf(s, f) : 0;
};
export const heavyDefeat = (s) => lastMargin(s) <= -3;
export const bigWin = (s) => lastMargin(s) >= 3;
// نتائج آخر n مباريات: "W"/"D"/"L" — تُقرأ كما تُخزَّن، بلا افتراضات عن الجدول.
export const recentResults = (s, n = 5) =>
  playedOwnSorted(s)
    .slice(0, n)
    .map((f) => {
      const m = marginOf(s, f);
      return m > 0 ? "W" : m < 0 ? "L" : "D";
    });
export const lossesInLast = (n, k) => (s) =>
  recentResults(s, n).filter((r) => r === "L").length >= k;
export const winlessInLast = (n) => (s) => {
  const r = recentResults(s, n);
  return r.length >= n && !r.includes("W");
};

// ── الديربي والمباريات الكبيرة ────────────────────────────────────────────
// خرائط منافسة معلنة كبيانات خالصة (لا استيراد سجلات أندية ثقيلة داخل طبقة البيانات).
// قاعدة عامة تكملها: لقاء بين ناديَين في أول ثلاثة مراكز يُعامَل كمباراة كبيرة.
export const RIVAL_PAIRS = Object.freeze({
  ahly: ["zamalek"],
  zamalek: ["ahly"],
  masry: ["ismaily"],
  ismaily: ["masry"],
});
export const isRival = (s, opponentId) =>
  Boolean(opponentId) &&
  opponentId !== s.clubId &&
  (RIVAL_PAIRS[s.clubId] || []).includes(opponentId);
const rankOf = (s, clubId) => {
  const rows = (s.table || []).filter((r) => (r.played || 0) > 0);
  if (rows.length < 4) return 0;
  const ordered = [...rows].sort(
    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga),
  );
  const i = ordered.findIndex((r) => r.clubId === clubId);
  return i < 0 ? 0 : i + 1;
};
export const isBigMatch = (s, f) => {
  const opp = opponentOf(s, f);
  if (isRival(s, opp)) return true;
  const mine = rankOf(s, s.clubId),
    theirs = rankOf(s, opp);
  return mine > 0 && theirs > 0 && mine <= 3 && theirs <= 3;
};
export const upcomingOwnFixtures = (s, days) =>
  ownFixtures(s).filter(
    (f) => !f.played && f.date >= s.date && daysBetween(s.date, f.date) <= days,
  );
export const derbyFixtureWithin = (days) => (s) =>
  upcomingOwnFixtures(s, days).some((f) => isRival(s, opponentOf(s, f)));
export const bigFixtureWithin = (days) => (s) =>
  upcomingOwnFixtures(s, days).some((f) => isBigMatch(s, f));
// نتيجة آخر ديربي لُعب (خلال آخر ٨ مباريات) — لتوليد ردود فعل بعد الديربي.
export const lastDerbyResult = (s) => {
  for (const f of playedOwnSorted(s).slice(0, 8)) {
    if (!isRival(s, opponentOf(s, f))) continue;
    const m = marginOf(s, f);
    return m > 0 ? "W" : m < 0 ? "L" : "D";
  }
  return null;
};
export const derbyWonRecently = (s) => lastDerbyResult(s) === "W";
export const derbyLostRecently = (s) => lastDerbyResult(s) === "L";
export const derbyDrawnRecently = (s) => lastDerbyResult(s) === "D";

// ── موقع الموسم: جولات الحسم والهبوط ─────────────────────────────────────
export const seasonLength = (s) => Math.max(1, ownFixtures(s).length);
export const roundsPlayed = (s) => (tableRow(s) || {}).played || 0;
export const roundsLeft = (s) => Math.max(0, seasonLength(s) - roundsPlayed(s));
export const lateSeason = (s) => playedAny(s) && roundsLeft(s) <= 5;
export const titleRaceWeek = (s) => topOfTable(s) && lateSeason(s);
export const relegationWeek = (s) => bottomOfTable(s) && lateSeason(s);

// ── إحصائيات الموسم (0.23) والحالة البدنية (0.22) ────────────────────────
// تُقرأ من حقول اللاعبين القائمة: seasonGoals/seasonAssists/seasonYellow/form/injuryUntil.
// (لا `Math.max(...arr)` هنا: طور العالم يحمل عشرات الآلاف من اللاعبين.)
const maxOf = (list, get) => list.reduce((m, x) => Math.max(m, get(x) || 0), 0);
export const topScorer = (s) =>
  ownSquad(s).reduce(
    (a, p) => (!a || (p.seasonGoals || 0) > (a.seasonGoals || 0) ? p : a),
    null,
  );
export const hasScorerWith = (n) => (s) => maxOf(ownSquad(s), (p) => p.seasonGoals) >= n;
export const hasAssistLeaderWith = (n) => (s) =>
  maxOf(ownSquad(s), (p) => p.seasonAssists) >= n;
// حدود `form` نفسها التي يعلنها formLabel في matchConsequences (متوهج ≥ 1.5، بارد ≤ -1.5).
export const hasHotForm = (s) => ownSquad(s).some((p) => (p.form || 0) >= 1.5);
export const hasColdForm = (s) => ownSquad(s).some((p) => (p.form || 0) <= -1.5);
// YELLOW_SUSPENSION_THRESHOLD = 4 في matchConsequences.js (يُذكر هنا بلا استيراد خدمة).
export const hasSuspensionRisk = (s) =>
  ownSquad(s).some((p) => (p.seasonYellow || 0) >= 4);
export const longestInjuryDays = (s) =>
  ownSquad(s).reduce(
    (m, p) =>
      p.injuryUntil && p.injuryUntil >= s.date
        ? Math.max(m, daysBetween(s.date, p.injuryUntil))
        : m,
    0,
  );
export const hasLongInjury = (days = 45) => (s) => longestInjuryDays(s) >= days;
export const injuryCount = (s) => scopes.injured(s).length;
export const hasInjuryCrisis = (s) => injuryCount(s) >= 4;
