import { initTalent } from "../services/talent/state.js";
import { initLegends } from "../services/legends.js";
import { ensureSportsCity } from "../services/sportsCity.js";
import { initDynasty } from "../services/dynasty.js";
import { initEmpire } from "../services/empire/wealth.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { initPyramid } from "../services/pyramid.js";
import { worldPlayers, WORLD_MANIFEST } from "../data/packs/world.js";
import { ALL_MARKETS } from "../data/worldMarkets.js";
import { currentPlayers, SNAPSHOT_DATE } from "../data/packs/current-2026.js";
import { initializeCareer } from "../models/player.js";
import { DIFFICULTIES } from "../models/difficulty.js";
import { addDays } from "./utils.js";
import { CLUBS, FACILITIES, PACK, makePlayers } from "../data/catalog.js";
import { fixtures } from "../services/matches.js";
import { message } from "../services/inbox.js";
import { signSponsor } from "../services/sponsors.js";
import { initBoard, startSeasonMandate } from "../services/boardMandate.js";
import { initBlackFiles } from "../services/blackFiles.js";
import { ensureReleaseClause } from "../services/releaseClause.js";
import { ensureStaffCorp } from "../services/staff/staffCorp.js";
import { initPolitics } from "../services/politics/state.js";
import { initBetting } from "../services/betting/state.js";
import { initStockMarket } from "../services/stockMarket/state.js";
export const SAVE_VERSION = 33;
export function createGame({
  clubId = "ahly",
  owner = "مالك النادي",
  leagues = ["eg", "en", "sa"],
  database = "current",
  difficulty = "normal",
  language = "ar",
  expanded = false,
  ownerStory = "selfmade",
} = {}) {
  const club =
    expanded && database === "world"
      ? extendedClub(clubId)
      : CLUBS.find((c) => c.id === clubId && c.cash);
  if (!club) throw new Error("اختر ناديًا متاحًا.");
  leagues = [
    ...new Set([
      "eg",
      ...leagues.filter((l) =>
        (database === "world" ? ALL_MARKETS : ["en", "sa"]).includes(l),
      ),
    ]),
  ];
  if (expanded && database !== "world")
    throw Error("العالم الموسع يتطلب قاعدة العالم.");
  if (expanded && !club.selectable) throw Error("قائمة النادي غير متاحة.");
  if (expanded && !leagues.includes(club.country)) leagues.push(club.country);
  const startDate = database !== "demo" ? SNAPSHOT_DATE : PACK.date;
  const settings = DIFFICULTIES[difficulty] || DIFFICULTIES.normal;
  const initialCash = Math.round(club.cash * settings.cash);
  const s = {
    version: SAVE_VERSION,
    pack:
      database === "world"
        ? "world-wikipedia-20260924-v1"
        : database === "current"
          ? "current-2026-provisional"
          : PACK.id,
    squadLimit: database === "world" ? 45 : 30,
    database,
    difficulty: DIFFICULTIES[difficulty] ? difficulty : "normal",
    staff: [],
    retired: [],
    scoutAssignments: [],
    clubDecisions: [],
    lastClubEvent: null,
    nextClubEventDate: addDays(startDate, settings.eventInterval),
    seasonNumber: 1,
    seasonHistory: [],
    nextSeasonDate: `${Number(startDate.slice(0, 4)) + 1}-07-01`,
    nextId: 0,
    seed: 84721,
    createdAt: new Date().toISOString(),
    clubId,
    owner: owner.trim().slice(0, 35) || "مالك النادي",
    leagues,
    date: startDate,
    startDate,
    remainingDays: 0,
    capacity: club.capacity,
    reputation: club.rep,
    fanSupport: 78,
    ticketPrice: 120,
    academyCount: 1,
    players: (database === "world"
      ? worldPlayers(leagues)
      : database === "current"
        ? currentPlayers(clubId, leagues)
        : makePlayers(clubId, leagues)
    ).map((p) => initializeCareer(p, startDate)),
    finance: {
      cash: initialCash,
      initialCash,
      ledger: [],
      obligations: [],
      loans: [],
      wageBudget: Math.round(6500000 * settings.cash),
      liquidityWarning: false,
    },
    facilities: FACILITIES.map((f) => ({
      id: f.id,
      name: f.name,
      level: 1,
      monthlyCost: 35000,
      staffCost: f.staffCost,
      staff: false,
      project: null,
    })),
    sponsors: [],
    negotiations: [],
    inbox: [],
    events: [],
    fixtures: fixtures(startDate),
    table: CLUBS.map((c) => ({
      clubId: c.id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      points: 0,
    })),
    preferences: {
      pauseMatches: false,
      language: ["ar", "en", "fr"].includes(language) ? language : "ar",
    },
    // حياة الملياردير 0.29: ثروة شخصية منفصلة عن خزينة النادي من اليوم الأول.
    empire: initEmpire(null, ownerStory),
  };
  if (expanded) {
    initPyramid(s);
    initTalent(s);
  }
  s.legends = initLegends();
  s.dynasty = initDynasty(s);
  ensureSportsCity(s);
  const own = s.players.filter((p) => p.clubId === clubId);
  if (own.length < 11)
    throw new Error(
      "القائمة المفتوحة لهذا النادي لم تكتمل بما يكفي للعب. اختر ناديًا آخر أو حزمة 0.2 القديمة.",
    );
  const renewal = own[16] || own.at(-1);
  renewal.contractEnd = addDays(startDate, 30);
  signSponsor(s, {
    assetId: "front",
    sponsorId: "delta",
    amount: Math.round(
      (12000000 * settings.sponsor) / (expanded ? club.tier ** 2 : 1),
    ),
    days: 360,
    exclusive: false,
  });
  message(s, {
    title: "أهلًا بك في مكتب المالك",
    body: "مشروعك يبدأ هنا. اللعبة تمزج بيانات مرجعية بعالم محاكاة يتطور داخل حفظتك. القدرات والعقود والأحداث والتقاعد ليست حقائق عن الأشخاص. راجع صفحة المصادر لتفاصيل البيانات، وصدّر حفظتك دوريًا.",
    category: "club",
  });
  s.events.push(
    {
      id: "ev-initial-sponsor",
      date: addDays(startDate, 3),
      type: "sponsor",
      ref: "sleeve",
      done: false,
    },
    {
      id: "ev-renewal",
      date: addDays(startDate, 7),
      type: "renewal",
      ref: renewal.id,
      done: false,
    },
  );
  // 0.26: الجمعية العمومية تصدر لائحة الموسم الأول بعد اكتمال كل الأنظمة المشتقة منها.
  initBoard(s);
  startSeasonMandate(s);
  // 0.28: الملفات السوداء + الشرط الجزائي
  initBlackFiles(s);
  ensureReleaseClause(s);
  // 0.30: الإدارة الشاملة — طاقم افتراضي متوسط + مقر صغير من اليوم الأول.
  ensureStaffCorp(s);
  // 0.31: رئاسة الاتحاد — خريطة محايدة وحملة مؤجلة أربع مواسم.
  initPolitics(s);
  // 0.36: إمبراطورية المراهنات — سوق عام يعمل حتى بلا شركة.
  initBetting(s);
  // 0.37: بورصة الأندية — كل نادٍ له تسعير أولي، ومحفظة المالك تبدأ فارغة.
  initStockMarket(s);
  return s;
}
